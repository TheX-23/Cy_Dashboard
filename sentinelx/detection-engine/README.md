# SentinelX Detection Engine

FastAPI microservice for threat detection and scoring.

## Run

```bash
pip install -r requirements.txt
uvicorn main:app --reload --port 8001
```

## Endpoints

- `POST /detect` rule-based detection
- `POST /analyze` summarized finding output
- `POST /score` risk scoring (0-100)
- `POST /ingest-log` emits `log` and optional `threat/alert` websocket events
- `POST /alerts/create` emits alert websocket event
- `POST /soar/execute` executes simulated SOAR actions
- `POST /simulate/burst` emits burst events for multi-client testing
- `GET /health`
- `WS /ws/threats`
- `WS /ws/alerts`

## Supabase persistence

Set these environment variables for persistent writes:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

When configured, the detection engine writes:

- `logs` on every ingest
- `threats` on detection findings
- `alerts` on elevated risk
- `incidents` and `incident_logs` for severe/correlated cases

SOAR actions are pushed to websocket clients as `soar_action` events.
