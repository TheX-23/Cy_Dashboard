"use client";

import React, { useEffect, useRef, useCallback } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

/* ────────────────────────────────────────────────────────────────
   Types
   ──────────────────────────────────────────────────────────────── */

export interface ThreatLocation {
  id: string;
  ip: string;
  lat: number;
  lng: number;
  city: string;
  country: string;
  type: string;
  severity: "critical" | "high" | "medium" | "low" | string;
  time: string;
  timestamp: number;
}

export interface AttackLine {
  id: string;
  from: [number, number];
  to: [number, number];
  severity: string;
}

export interface GlobeThreatMapProps {
  threats?: ThreatLocation[];
  attackLines?: AttackLine[];
}

/* ────────────────────────────────────────────────────────────────
   Helpers
   ──────────────────────────────────────────────────────────────── */

const GLOBE_RADIUS = 1;
const MARKER_ALT = 1.04; // slightly above surface

function sevColor(s: string): number {
  switch (s.toLowerCase()) {
    case "critical": return 0xff3333;
    case "high":     return 0xff9500;
    case "medium":   return 0xffd700;
    case "low":      return 0x34d399;
    default:         return 0x00ffff;
  }
}

function sevSize(s: string): number {
  switch (s.toLowerCase()) {
    case "critical": return 0.07;
    case "high":     return 0.06;
    case "medium":   return 0.05;
    case "low":      return 0.04;
    default:         return 0.05;
  }
}

function ll2v3(lat: number, lon: number, r: number): THREE.Vector3 {
  const phi   = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -(r * Math.sin(phi) * Math.cos(theta)),
      r * Math.cos(phi),
      r * Math.sin(phi) * Math.sin(theta),
  );
}

function makeEarthTexture(): THREE.CanvasTexture {
  const W = 2048, H = 1024;
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const ctx = c.getContext("2d")!;

  // Ocean
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0,   "#0c1445");
  g.addColorStop(0.2, "#1e3a6e");
  g.addColorStop(0.5, "#0e2954");
  g.addColorStop(0.8, "#1e3a6e");
  g.addColorStop(1,   "#0c1445");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  // Continents (rough)
  ctx.fillStyle = "#1a5c32";
  ctx.fillRect(280, 180, 280, 200);  // N. America
  ctx.fillRect(400, 420, 160, 250);  // S. America
  ctx.fillRect(900, 160, 200, 150);  // Europe
  ctx.fillRect(920, 340, 200, 280);  // Africa
  ctx.fillRect(1100, 120, 500, 300); // Asia
  ctx.fillRect(1500, 480, 220, 140); // Australia

  ctx.fillStyle = "#24784a";
  ctx.fillRect(310, 220, 200, 100);
  ctx.fillRect(1150, 180, 350, 180);
  ctx.fillRect(950, 380, 140, 180);

  // Grid
  ctx.strokeStyle = "rgba(56,189,248,0.06)";
  ctx.lineWidth = 1;
  for (let y = 0; y < H; y += H / 18) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  for (let x = 0; x < W; x += W / 36) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }

  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/* ────────────────────────────────────────────────────────────────
   Component
   ──────────────────────────────────────────────────────────────── */

export default function GlobeThreatMap({
  threats = [],
  attackLines = [],
}: GlobeThreatMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    controls: OrbitControls;
    markers: THREE.Group;
    arcs: THREE.Group;
    frameId: number;
    ro: ResizeObserver;
  } | null>(null);

  const threatsRef = useRef(threats);
  threatsRef.current = threats;
  const linesRef = useRef(attackLines);
  linesRef.current = attackLines;

  /* ── Build markers from current threats ref ──────────────── */
  const rebuildMarkers = useCallback(() => {
    const st = stateRef.current;
    if (!st) return;
    const grp = st.markers;
    while (grp.children.length) {
      const child = grp.children[0] as THREE.Group;
      grp.remove(child);
      child.children.forEach(c => {
        if (c instanceof THREE.Mesh) {
          if (c.geometry) c.geometry.dispose();
          if (c.material) {
            if (Array.isArray(c.material)) c.material.forEach(m => m.dispose());
            else c.material.dispose();
          }
        }
      });
    }

    for (const t of threatsRef.current) {
      const col  = new THREE.Color(sevColor(t.severity));
      const size = sevSize(t.severity);
      const pos  = ll2v3(t.lat, t.lng, MARKER_ALT);

      // Bright solid core
      const core = new THREE.Mesh(
        new THREE.SphereGeometry(size, 16, 16),
        new THREE.MeshBasicMaterial({ color: col }),
      );

      // Outer glow sphere
      const glow = new THREE.Mesh(
        new THREE.SphereGeometry(size * 2.8, 16, 16),
        new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.18 }),
      );

      // Flat ring indicator on the surface
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(size * 1.5, size * 2.2, 32),
        new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.35, side: THREE.DoubleSide }),
      );
      // Orient ring to face outward from globe center
      ring.lookAt(pos.clone().multiplyScalar(2));

      const mg = new THREE.Group();
      mg.position.copy(pos);
      mg.add(core);
      mg.add(glow);
      mg.add(ring);
      grp.add(mg);
    }
  }, []);

  /* ── Build arcs from current lines ref ───────────────────── */
  const rebuildArcs = useCallback(() => {
    const st = stateRef.current;
    if (!st) return;
    const grp = st.arcs;
    while (grp.children.length) {
      const child = grp.children[0] as THREE.Line;
      grp.remove(child);
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) child.material.forEach(m => m.dispose());
        else child.material.dispose();
      }
    }

    for (const ln of linesRef.current) {
      const s = ll2v3(ln.from[0], ln.from[1], MARKER_ALT);
      const e = ll2v3(ln.to[0],   ln.to[1],   MARKER_ALT);
      const d = s.distanceTo(e);
      const m = s.clone().lerp(e, 0.5).normalize().multiplyScalar(MARKER_ALT + d * 0.25);
      const pts = new THREE.QuadraticBezierCurve3(s, m, e).getPoints(48);
      grp.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(pts),
        new THREE.LineBasicMaterial({
          color: new THREE.Color(sevColor(ln.severity)),
          transparent: true,
          opacity: 0.65,
        }),
      ));
    }
  }, []);

  /* ── Main init effect ────────────────────────────────────── */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Cleanup any previous instance (strict mode / HMR)
    if (stateRef.current) {
      const prev = stateRef.current;
      cancelAnimationFrame(prev.frameId);
      prev.ro.disconnect();
      prev.controls.dispose();
      prev.renderer.forceContextLoss();
      prev.renderer.dispose();
      if (el.contains(prev.renderer.domElement)) el.removeChild(prev.renderer.domElement);
      stateRef.current = null;
    }

    // Wait one frame so the DOM element has real dimensions
    const raf = requestAnimationFrame(() => {
      if (!containerRef.current) return;

      const w = el.clientWidth  || 800;
      const h = el.clientHeight || 520;

      // Scene
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x0a0f1e);

      // Camera
      const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 1000);
      camera.position.set(0, 0.3, 2.8);

      // Renderer
      let renderer: THREE.WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({ antialias: true });
      } catch (err) {
        console.error("WebGL exhausted or unavailable:", err);
        el.innerHTML = "<div style='display:flex;align-items:center;justify-content:center;height:100%;color:#ef4444;font-size:14px;text-align:center;padding:1rem;'>WebGL driver memory exhausted.<br/>Please perform a Hard Refresh (Ctrl+Shift+R or Cmd+Shift+R) to clear your browser cache.</div>";
        return;
      }
      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      el.appendChild(renderer.domElement);

      // Lights
      scene.add(new THREE.AmbientLight(0xffffff, 0.95));
      const dir = new THREE.DirectionalLight(0xffffff, 0.5);
      dir.position.set(5, 3, 5);
      scene.add(dir);

      // Globe
      const globeMat = new THREE.MeshPhongMaterial({
        map: makeEarthTexture(),
        shininess: 12,
        specular: 0x111111,
      });
      const globe = new THREE.Mesh(
        new THREE.SphereGeometry(GLOBE_RADIUS, 64, 64),
        globeMat,
      );
      scene.add(globe);

      // Try loading a higher-quality texture from CDN
      const texLoader = new THREE.TextureLoader();
      texLoader.setCrossOrigin('anonymous');
      texLoader.load(
        'https://cdn.jsdelivr.net/gh/mrdoob/three.js@master/examples/textures/planets/earth_atmos_2048.jpg',
        (tex) => {
          tex.colorSpace = THREE.SRGBColorSpace;
          const oldTex = globeMat.map;
          globeMat.map = tex;
          globeMat.needsUpdate = true;
          if (oldTex) oldTex.dispose();
        },
        undefined,
        () => { /* fallback canvas texture already applied */ },
      );

      // Atmosphere
      scene.add(new THREE.Mesh(
        new THREE.SphereGeometry(GLOBE_RADIUS * 1.05, 64, 64),
        new THREE.MeshBasicMaterial({
          color: 0x38bdf8,
          transparent: true,
          opacity: 0.06,
          side: THREE.BackSide,
        }),
      ));

      // Stars
      const sv: number[] = [];
      for (let i = 0; i < 2000; i++) {
        sv.push(
          (Math.random() - 0.5) * 300,
          (Math.random() - 0.5) * 300,
          (Math.random() - 0.5) * 300,
        );
      }
      const sg = new THREE.BufferGeometry();
      sg.setAttribute("position", new THREE.Float32BufferAttribute(sv, 3));
      scene.add(new THREE.Points(sg, new THREE.PointsMaterial({ color: 0xffffff, size: 0.1 })));

      // Groups for markers & arcs
      const markers = new THREE.Group();
      const arcs    = new THREE.Group();
      scene.add(markers);
      scene.add(arcs);

      // Controls
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping   = true;
      controls.dampingFactor   = 0.1;
      controls.rotateSpeed     = 0.5;
      controls.zoomSpeed       = 0.7;
      controls.enablePan       = false;
      controls.minDistance      = 1.5;
      controls.maxDistance      = 5;
      controls.autoRotate      = true;
      controls.autoRotateSpeed = 0.4;

      // ResizeObserver
      const ro = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width: rw, height: rh } = entry.contentRect;
          if (rw > 0 && rh > 0) {
            camera.aspect = rw / rh;
            camera.updateProjectionMatrix();
            renderer.setSize(rw, rh);
          }
        }
      });
      ro.observe(el);

      // Save state
      stateRef.current = { scene, camera, renderer, controls, markers, arcs, frameId: 0, ro };

      // Initial sync
      rebuildMarkers();
      rebuildArcs();

      // Animation
      const clock = new THREE.Clock();
      const loop = () => {
        const st = stateRef.current;
        if (!st) return;
        st.frameId = requestAnimationFrame(loop);
        st.controls.update();

        // Pulse markers
        const elapsed = clock.getElapsedTime();
        const p = 1 + Math.sin(elapsed * 3) * 0.18;
        st.markers.children.forEach((g) => g.scale.set(p, p, p));

        st.renderer.render(st.scene, st.camera);
      };
      stateRef.current.frameId = requestAnimationFrame(loop);
    });

    // Cleanup
    return () => {
      cancelAnimationFrame(raf);
      const st = stateRef.current;
      if (st) {
        cancelAnimationFrame(st.frameId);
        st.ro.disconnect();
        st.controls.dispose();
        
        // Clean up geometries and materials in scene
        st.scene.traverse((obj) => {
          if (obj instanceof THREE.Mesh || obj instanceof THREE.Line || obj instanceof THREE.Points) {
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) {
              if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
              else obj.material.dispose();
            }
          }
        });
        
        st.renderer.forceContextLoss();
        st.renderer.dispose();
        if (el.contains(st.renderer.domElement)) el.removeChild(st.renderer.domElement);
        stateRef.current = null;
      }
    };
  }, [rebuildMarkers, rebuildArcs]);

  /* ── Re-sync when props change ───────────────────────────── */
  useEffect(() => { rebuildMarkers(); }, [threats, rebuildMarkers]);
  useEffect(() => { rebuildArcs();   }, [attackLines, rebuildArcs]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        minHeight: 300,
        borderRadius: "0.75rem",
        overflow: "hidden",
        cursor: "grab",
        position: "relative",
      }}
    />
  );
}
