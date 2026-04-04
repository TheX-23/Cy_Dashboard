import asyncio
import json
import os
import time
import hashlib
from datetime import datetime, timezone
from typing import Any
from uuid import uuid4

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel, Field
from supabase import Client, create_client
from prometheus_client import Counter, Histogram, generate_latest, CONTENT_TYPE_LATEST

app = FastAPI(title="SentinelX Detection Engine", version="0.2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class DetectPayload(BaseModel):
    ip: str
    failed_logins: int = Field(ge=0)
    success_after_fail: bool
    distance_km: float = Field(ge=0)
    rpm: int = Field(ge=0)


class ScorePayload(BaseModel):
    failed_logins: int = Field(ge=0)
    geovelocity: float = Field(ge=0)
    request_volume: int = Field(ge=0)
    intel_confidence: float = Field(ge=0, le=1)


class IngestLogPayload(BaseModel):
    ip: str
    timestamp: str
    type: str
    severity: str
    raw_data: dict[str, Any] = Field(default_factory=dict)


class AlertPayload(BaseModel):
    threat_id: str
    severity: str
    assigned_to: str | None = None
    status: str = "open"


class ConnectionManager:
    def __init__(self):
        self.connections: dict[str, set[WebSocket]] = {
            "threats": set(),
            "alerts": set(),
        }

    async def connect(self, channel: str, websocket: WebSocket):
        await websocket.accept()
        self.connections[channel].add(websocket)

    def disconnect(self, channel: str, websocket: WebSocket):
        self.connections[channel].discard(websocket)

    async def broadcast(self, channel: str, event: dict[str, Any]):
        payload = json.dumps(event)
        stale: list[WebSocket] = []
        for websocket in self.connections[channel]:
            try:
                await websocket.send_text(payload)
            except Exception:
                stale.append(websocket)
        for websocket in stale:
            self.disconnect(channel, websocket)


class SupabaseStore:
    def __init__(self):
        url = os.getenv("SUPABASE_URL", "")
        key = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
        self.enabled = bool(url and key)
        self.client: Client | None = create_client(url, key) if self.enabled else None

    async def _insert(self, table: str, payload: dict[str, Any]) -> bool:
        if not self.enabled or not self.client:
            return False

        def _run() -> bool:
            self.client.table(table).insert(payload).execute()
            return True

        try:
            return await asyncio.to_thread(_run)
        except Exception:
            return False

    async def audit(
        self,
        *,
        organization_id: str | None,
        actor_type: str,
        actor_user_id: str | None,
        action: str,
        resource_type: str,
        resource_id: str | None,
        ip: str | None,
        user_agent: str | None,
        metadata: dict[str, Any] | None = None,
    ) -> bool:
        return await self._insert(
            "audit_logs",
            {
                "organization_id": organization_id,
                "actor_type": actor_type,
                "actor_user_id": actor_user_id,
                "action": action,
                "resource_type": resource_type,
                "resource_id": resource_id,
                "ip": ip,
                "user_agent": user_agent,
                "metadata": metadata or {},
                "created_at": _now_iso(),
            },
        )

    async def persist_log(self, log_event: dict[str, Any]) -> bool:
        return await self._insert(
            "logs",
            {
                "id": log_event["id"],
                "organization_id": log_event.get("organizationId"),
                "ip": log_event["ip"],
                "timestamp": log_event["timestamp"],
                "type": log_event["type"],
                "severity": log_event["severity"],
                "raw_data": log_event["rawData"],
                "parsed_data": log_event["parsedData"],
            },
        )

    async def persist_threat(self, threat_event: dict[str, Any]) -> bool:
        return await self._insert(
            "threats",
            {
                "id": threat_event["id"],
                "organization_id": threat_event.get("organizationId"),
                "severity": threat_event["severity"],
                "score": threat_event["score"],
                "source_ip": threat_event["sourceIp"],
                "location": threat_event["location"],
                "vector": threat_event["vector"],
                "detected_at": threat_event["detectedAt"],
            },
        )

    async def persist_alert(self, alert_event: dict[str, Any]) -> bool:
        return await self._insert(
            "alerts",
            {
                "id": alert_event["id"],
                "threat_id": alert_event["threatId"],
                "status": alert_event["status"],
                "assigned_to": alert_event["assignedTo"],
                "dedup_key": alert_event.get("dedupKey"),
                "group_key": alert_event.get("groupKey"),
                "created_at": alert_event["createdAt"],
            },
        )

    async def create_incident(
        self, threat: dict[str, Any], log_event: dict[str, Any], findings: list[str]
    ) -> dict[str, Any] | None:
        should_create = threat["score"] >= 90 or "account_takeover" in findings
        if not should_create:
            return None

        incident_id = str(uuid4())
        incident = {
            "id": incident_id,
            "organization_id": threat.get("organizationId"),
            "title": f"Auto incident: {threat['vector']}",
            "description": f"Auto-created from score={threat['score']} findings={','.join(findings)}",
            "status": "active",
            "created_at": _now_iso(),
        }
        inserted = await self._insert(
            "incidents",
            {
                "id": incident["id"],
                "organization_id": incident["organization_id"],
                "title": incident["title"],
                "description": incident["description"],
                "status": incident["status"],
                "created_at": incident["created_at"],
            },
        )
        if inserted:
            await self._insert(
                "incident_logs",
                {
                    "incident_id": incident["id"],
                    "log_id": log_event["id"],
                },
            )
        return incident if inserted else None


manager = ConnectionManager()
store = SupabaseStore()

REQUESTS_TOTAL = Counter(
    "sentinelx_requests_total",
    "Total HTTP requests",
    ["method", "path", "status"],
)
REQUEST_LATENCY = Histogram(
    "sentinelx_request_latency_seconds",
    "HTTP request latency (seconds)",
    ["method", "path"],
)
WS_CONNECTIONS = Counter(
    "sentinelx_ws_connections_total",
    "Total websocket connections established",
    ["channel"],
)
DETECTION_EVENTS = Counter(
    "sentinelx_detection_events_total",
    "Detection events emitted",
    ["type"],
)

dedup_cache: dict[str, float] = {}
processing_queue: asyncio.Queue[IngestLogPayload] = asyncio.Queue(maxsize=10_000)


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _sha256_hex(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


def _get_org_id(raw: dict[str, Any]) -> str | None:
    return str(raw.get("organization_id") or os.getenv("DEFAULT_ORGANIZATION_ID") or "") or None


async def require_api_key(request: Request) -> None:
    configured = os.getenv("SENTINELX_INGEST_API_KEY") or ""
    provided = request.headers.get("x-api-key") or ""

    if configured:
        if provided != configured:
            raise HTTPException(status_code=401, detail="invalid api key")
        return

    # If no configured key, run open (dev) unless Supabase is enabled and api_keys exists.
    # We intentionally keep this permissive for local scaffolding.
    return


@app.middleware("http")
async def metrics_middleware(request: Request, call_next):
    start = time.perf_counter()
    status = 500
    try:
        response = await call_next(request)
        status = response.status_code
        return response
    finally:
        elapsed = time.perf_counter() - start
        REQUESTS_TOTAL.labels(request.method, request.url.path, str(status)).inc()
        REQUEST_LATENCY.labels(request.method, request.url.path).observe(elapsed)


@app.get("/metrics")
def metrics():
    return Response(content=generate_latest(), media_type=CONTENT_TYPE_LATEST)


@app.on_event("startup")
async def startup():
    async def worker():
        while True:
            payload = await processing_queue.get()
            try:
                await _process_ingest(payload)
            finally:
                processing_queue.task_done()

    asyncio.create_task(worker())


def _to_detect_payload(log: IngestLogPayload) -> DetectPayload:
    raw = log.raw_data
    return DetectPayload(
        ip=log.ip,
        failed_logins=int(raw.get("failed_logins", 0)),
        success_after_fail=bool(raw.get("success_after_fail", False)),
        distance_km=float(raw.get("distance_km", 0)),
        rpm=int(raw.get("rpm", 0)),
    )


def _threat_from_log(log: IngestLogPayload, findings: list[str]) -> dict[str, Any]:
    vector = findings[0] if findings else f"anomalous_{log.type}"
    intel_confidence = float(log.raw_data.get("intel_confidence", 0.3))
    score_payload = ScorePayload(
        failed_logins=int(log.raw_data.get("failed_logins", 0)),
        geovelocity=float(log.raw_data.get("distance_km", 0)),
        request_volume=int(log.raw_data.get("rpm", 0)),
        intel_confidence=max(0, min(1, intel_confidence)),
    )
    risk_score = score(score_payload)["score"]
    return {
        "id": str(uuid4()),
        "organizationId": _get_org_id(log.raw_data),
        "severity": log.severity,
        "score": risk_score,
        "sourceIp": log.ip,
        "location": str(log.raw_data.get("country", "UNK")),
        "vector": vector,
        "detectedAt": _now_iso(),
    }


async def _execute_soar_actions(threat: dict[str, Any], findings: list[str]) -> list[dict[str, Any]]:
    actions: list[dict[str, Any]] = []
    if threat["score"] >= 80:
        actions.append(
            {
                "id": str(uuid4()),
                "action": "block_ip",
                "target": threat["sourceIp"],
                "status": "executed",
                "reason": "risk_score_threshold",
                "executedAt": _now_iso(),
            }
        )
    if "account_takeover" in findings:
        actions.append(
            {
                "id": str(uuid4()),
                "action": "mark_threat",
                "target": threat["id"],
                "status": "executed",
                "reason": "account_takeover_detection",
                "executedAt": _now_iso(),
            }
        )

    for action in actions:
        await manager.broadcast("alerts", {"type": "soar_action", "data": action, "at": _now_iso()})
    return actions


@app.get("/health")
def health():
    return {"status": "ok", "supabase_enabled": store.enabled}


@app.post("/detect")
def detect(payload: DetectPayload):
    findings = []
    if payload.failed_logins > 8:
        findings.append("brute_force")
    if payload.success_after_fail and payload.failed_logins > 4:
        findings.append("account_takeover")
    if payload.distance_km > 1500:
        findings.append("impossible_travel")
    if payload.rpm > 3000:
        findings.append("traffic_spike")
    return {"findings": findings, "correlated": len(findings) > 1}


@app.post("/score")
def score(payload: ScorePayload):
    risk_score = min(
        100,
        round(
            payload.failed_logins * 1.1
            + payload.geovelocity * 0.6
            + payload.request_volume * 0.2
            + payload.intel_confidence * 28
        ),
    )
    return {"score": risk_score}


@app.post("/analyze")
def analyze(payload: DetectPayload):
    detection = detect(payload)
    return {
        "ip": payload.ip,
        "risk": "high" if detection["correlated"] else "medium",
        "evidence": detection["findings"],
    }


@app.websocket("/ws/threats")
async def threats_socket(websocket: WebSocket):
    await manager.connect("threats", websocket)
    WS_CONNECTIONS.labels("threats").inc()
    try:
        await websocket.send_text(
            json.dumps({"type": "system", "channel": "threats", "message": "connected", "at": _now_iso()})
        )
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect("threats", websocket)


@app.websocket("/ws/alerts")
async def alerts_socket(websocket: WebSocket):
    await manager.connect("alerts", websocket)
    WS_CONNECTIONS.labels("alerts").inc()
    try:
        await websocket.send_text(
            json.dumps({"type": "system", "channel": "alerts", "message": "connected", "at": _now_iso()})
        )
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect("alerts", websocket)


async def _process_ingest(payload: IngestLogPayload):
    detect_payload = _to_detect_payload(payload)
    detection = detect(detect_payload)
    org_id = _get_org_id(payload.raw_data)
    log_event = {
        "id": str(uuid4()),
        "organizationId": org_id,
        "ip": payload.ip,
        "timestamp": payload.timestamp,
        "type": payload.type,
        "severity": payload.severity,
        "rawData": payload.raw_data,
        "parsedData": payload.raw_data,
    }

    await manager.broadcast("threats", {"type": "log", "data": log_event, "at": _now_iso()})
    DETECTION_EVENTS.labels("log").inc()
    log_saved = await store.persist_log(log_event)
    await store.audit(
        organization_id=org_id,
        actor_type="system",
        actor_user_id=None,
        action="log_ingested",
        resource_type="log",
        resource_id=log_event["id"],
        ip=payload.ip,
        user_agent=None,
        metadata={"type": payload.type, "severity": payload.severity},
    )

    threat_saved = False
    alert_saved = False
    incident_created = False
    soar_actions: list[dict[str, Any]] = []

    if detection["findings"]:
        threat = _threat_from_log(payload, detection["findings"])
        threat["organizationId"] = org_id
        await manager.broadcast("threats", {"type": "threat", "data": threat, "at": _now_iso()})
        DETECTION_EVENTS.labels("threat").inc()
        threat_saved = await store.persist_threat(threat)
        await store.audit(
            organization_id=org_id,
            actor_type="system",
            actor_user_id=None,
            action="threat_detected",
            resource_type="threat",
            resource_id=threat["id"],
            ip=payload.ip,
            user_agent=None,
            metadata={"vector": threat["vector"], "score": threat["score"], "findings": detection["findings"]},
        )

        if threat["score"] >= 75:
            dedup_key = f"{org_id}:{threat['sourceIp']}:{threat['vector']}:{threat['severity']}"
            group_key = f"{org_id}:{threat['sourceIp']}:{threat['vector']}"
            window_s = 600.0
            now = time.time()
            last = dedup_cache.get(dedup_key)
            if last and now - last < window_s:
                return
            dedup_cache[dedup_key] = now

            alert = {
                "id": str(uuid4()),
                "threatId": threat["id"],
                "status": "open",
                "assignedTo": None,
                "createdAt": _now_iso(),
                "severity": threat["severity"],
                "dedupKey": dedup_key,
                "groupKey": group_key,
            }
            await manager.broadcast("alerts", {"type": "alert", "data": alert, "at": _now_iso()})
            DETECTION_EVENTS.labels("alert").inc()
            alert_saved = await store.persist_alert(alert)
            await store.audit(
                organization_id=org_id,
                actor_type="system",
                actor_user_id=None,
                action="alert_created",
                resource_type="alert",
                resource_id=alert["id"],
                ip=payload.ip,
                user_agent=None,
                metadata={"threat_id": threat["id"], "severity": alert["severity"], "dedup_key": dedup_key},
            )

        incident = await store.create_incident(threat, log_event, detection["findings"])
        if incident:
            incident_created = True
            await manager.broadcast("alerts", {"type": "incident", "data": incident, "at": _now_iso()})
            DETECTION_EVENTS.labels("incident").inc()
            await store.audit(
                organization_id=org_id,
                actor_type="system",
                actor_user_id=None,
                action="incident_created",
                resource_type="incident",
                resource_id=incident["id"],
                ip=payload.ip,
                user_agent=None,
                metadata={"title": incident["title"]},
            )

        soar_actions = await _execute_soar_actions(threat, detection["findings"])
        if soar_actions:
            DETECTION_EVENTS.labels("soar_action").inc(len(soar_actions))

    return {
        "log_saved": log_saved,
        "threat_saved": threat_saved,
        "alert_saved": alert_saved,
        "incident_created": incident_created,
        "soar_actions_executed": len(soar_actions),
    }


@app.post("/ingest-log")
async def ingest_log(payload: IngestLogPayload, request: Request):
    await require_api_key(request)
    processing_queue.put_nowait(payload)
    return {"status": "accepted"}


@app.post("/alerts/create")
async def create_alert(payload: AlertPayload, request: Request):
    await require_api_key(request)
    alert = {
        "id": str(uuid4()),
        "threatId": payload.threat_id,
        "status": payload.status,
        "assignedTo": payload.assigned_to,
        "severity": payload.severity,
        "createdAt": _now_iso(),
    }
    await manager.broadcast("alerts", {"type": "alert", "data": alert, "at": _now_iso()})
    saved = await store.persist_alert(alert)
    await store.audit(
        organization_id=os.getenv("DEFAULT_ORGANIZATION_ID") or None,
        actor_type="system",
        actor_user_id=None,
        action="alert_created",
        resource_type="alert",
        resource_id=alert["id"],
        ip=None,
        user_agent=None,
        metadata={"threat_id": payload.threat_id, "severity": payload.severity},
    )
    return {"status": "created", "saved": saved, "alert": alert}


@app.post("/soar/execute")
async def soar_execute(payload: DetectPayload, request: Request):
    await require_api_key(request)
    threat = {
        "id": str(uuid4()),
        "severity": "HIGH",
        "score": score(
            ScorePayload(
                failed_logins=payload.failed_logins,
                geovelocity=payload.distance_km,
                request_volume=payload.rpm,
                intel_confidence=0.7,
            )
        )["score"],
        "sourceIp": payload.ip,
        "location": "UNK",
        "vector": "manual_soar",
        "detectedAt": _now_iso(),
    }
    actions = await _execute_soar_actions(threat, detect(payload)["findings"])
    return {"status": "ok", "actions": actions}


@app.post("/maintenance/retention")
async def retention(request: Request):
    await require_api_key(request)
    days = int(os.getenv("LOG_RETENTION_DAYS") or "30")
    if not store.enabled or not store.client:
        return {"status": "skipped", "reason": "supabase not configured"}

    cutoff_ts = datetime.now(timezone.utc).timestamp() - days * 86400
    cutoff_iso = datetime.fromtimestamp(cutoff_ts, tz=timezone.utc).isoformat()

    def _run() -> int:
        res = store.client.table("logs").delete().lt("timestamp", cutoff_iso).execute()
        return len(res.data or [])

    deleted = await asyncio.to_thread(_run)
    await store.audit(
        organization_id=os.getenv("DEFAULT_ORGANIZATION_ID") or None,
        actor_type="system",
        actor_user_id=None,
        action="log_retention_applied",
        resource_type="maintenance",
        resource_id=None,
        ip=None,
        user_agent=None,
        metadata={"days": days, "deleted": deleted},
    )
    return {"status": "ok", "deleted": deleted, "cutoff": cutoff_iso}


@app.post("/simulate/burst")
async def simulate_burst():
    async def emit(i: int):
        payload = IngestLogPayload(
            ip=f"185.10.1.{i % 250 + 1}",
            timestamp=_now_iso(),
            type="auth",
            severity="HIGH" if i % 4 == 0 else "MEDIUM",
            raw_data={
                "failed_logins": 6 + (i % 7),
                "success_after_fail": i % 3 == 0,
                "distance_km": 800 + i * 35,
                "rpm": 1500 + i * 220,
                "country": "SIM",
                "intel_confidence": 0.55,
            },
        )
        await _process_ingest(payload)

    await asyncio.gather(*[emit(i) for i in range(1, 11)])
    return {"status": "ok", "events": 10}
