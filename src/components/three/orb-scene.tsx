"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

/** Particle count on the shell. */
const COUNT = 3200;
/** Seconds for one glowing pulse to travel from pole to pole. */
const PULSE_PERIOD = 6;
/** Cursor influence on the particle field at zero distance. */
const CURSOR_POWER = 0.7;
/** Idle rotation, radians per second. */
const BASE_SPIN = 0.22;

const VERTEX = /* glsl */ `
  uniform float uTime;
  uniform float uPulse;        // 0..1 sweep position across the surface
  uniform float uPulseWidth;
  uniform float uWaveAmp;
  uniform vec3  uPointer;      // cursor position in object space
  uniform float uPointerPower;
  uniform float uSize;
  uniform float uScale;

  attribute vec3 aSeed;

  varying float vGlow;

  void main() {
    vec3 n = normalize(position);

    /* Two crossing waves with a per-particle phase offset: a slow surface
       ripple that never visibly repeats, rather than a uniform breathing. */
    float w = sin(n.y * 5.0 + uTime * 0.8 + aSeed.x * 6.2831)
            * cos(n.x * 4.0 - uTime * 0.6 + aSeed.y * 6.2831);
    float ripple = w * uWaveAmp;

    /* Glowing pulse: a band sweeping along a fixed axis. Because the whole mesh
       also rotates, the band reads as travelling across the surface. */
    float axis = dot(n, normalize(vec3(0.35, 1.0, 0.2)));
    float band = 1.0 - smoothstep(
      0.0, uPulseWidth, abs(axis - (uPulse * 2.0 - 1.0))
    );

    /* The cursor warps the gravity field: particles are pulled toward it with a
       gaussian falloff, so the shell dimples and brightens under the pointer. */
    vec3 toPointer = uPointer - n;
    float dist = length(toPointer);
    float pull = uPointerPower * exp(-dist * dist * 3.0);
    vec3 warped = n + normalize(toPointer + 1e-6) * pull * 0.45;

    float radius = 1.0 + ripple * 0.05 + band * 0.03 - pull * 0.12;
    vec3 p = normalize(warped) * radius;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * uScale * (1.0 + band * 1.8 + pull * 1.6 + ripple * 0.4) / -mv.z;

    vGlow = clamp(0.16 + band * 0.85 + pull * 0.6 + max(ripple, 0.0) * 0.5, 0.0, 1.0);
  }
`;

const FRAGMENT = /* glsl */ `
  uniform vec3  uColorLow;
  uniform vec3  uColorHigh;
  uniform float uOpacity;

  varying float vGlow;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    if (d > 0.5) discard;
    float alpha = smoothstep(0.5, 0.0, d);
    vec3 col = mix(uColorLow, uColorHigh, clamp(vGlow, 0.0, 1.0));
    gl_FragColor = vec4(col, alpha * (0.35 + 0.65 * vGlow) * uOpacity);
  }
`;

type OrbTheme = "dark" | "light";

const COLORS: Record<OrbTheme, { low: string; high: string; opacity: number }> = {
  // Additive over a dark page reads as light; normal blending is required on a
  // light page or the particles would blow out to white.
  dark: { low: "#1C6F66", high: "#C4F3E7", opacity: 0.95 },
  light: { low: "#8FCFC4", high: "#0B5A51", opacity: 0.75 },
};

/** Even coverage of the shell (golden-spiral distribution, no polar clumping). */
function useShellGeometry() {
  return useMemo(() => {
    const positions = new Float32Array(COUNT * 3);
    const seeds = new Float32Array(COUNT * 3);
    const golden = Math.PI * (3 - Math.sqrt(5));

    for (let i = 0; i < COUNT; i++) {
      const y = 1 - (i / (COUNT - 1)) * 2;
      const r = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = golden * i;
      positions[i * 3] = Math.cos(theta) * r;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = Math.sin(theta) * r;

      seeds[i * 3] = Math.random();
      seeds[i * 3 + 1] = Math.random();
      seeds[i * 3 + 2] = Math.random();
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 3));
    return geometry;
  }, []);
}

function ParticleShell({ theme }: { theme: OrbTheme }) {
  const points = useRef<THREE.Points>(null);
  const material = useRef<THREE.ShaderMaterial>(null);
  const geometry = useShellGeometry();
  const { gl, camera, raycaster, size } = useThree();

  const uniforms = useMemo(() => {
    const { low, high, opacity } = COLORS[theme];
    return {
      uTime: { value: 0 },
      uPulse: { value: 0 },
      uPulseWidth: { value: 0.17 },
      uWaveAmp: { value: 1 },
      uPointer: { value: new THREE.Vector3(0, 0, 2) },
      uPointerPower: { value: 0 },
      uSize: { value: 0.013 },
      uScale: { value: 800 },
      uColorLow: { value: new THREE.Color(low) },
      uColorHigh: { value: new THREE.Color(high) },
      uOpacity: { value: opacity },
    };
  }, [theme]);

  /*
    The orb is `pointer-events: none` so it can never swallow a click, which
    means it receives no canvas events. It tracks the window cursor instead:
    `ndc` (canvas-relative) drives the gravity warp, `viewport`
    (screen-relative) leans the shell toward the pointer.
  */
  const cursor = useRef({
    ndc: new THREE.Vector2(0, 0),
    viewport: new THREE.Vector2(0, 0),
    proximity: 0,
  });

  const state = useRef({ time: 0, spin: 0, power: 0, tiltX: 0, tiltY: 0 });

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      const rect = gl.domElement.getBoundingClientRect();
      const nx = (event.clientX - rect.left) / rect.width;
      const ny = (event.clientY - rect.top) / rect.height;
      cursor.current.ndc.set(nx * 2 - 1, -(ny * 2 - 1));

      cursor.current.viewport.set(
        (event.clientX / window.innerWidth) * 2 - 1,
        (event.clientY / window.innerHeight) * 2 - 1,
      );

      // Fade the influence out with distance from the orb.
      const dx = Math.max(rect.left - event.clientX, 0, event.clientX - rect.right);
      const dy = Math.max(rect.top - event.clientY, 0, event.clientY - rect.bottom);
      const distance = Math.hypot(dx, dy);
      cursor.current.proximity = Math.max(0, 1 - distance / (rect.width * 0.9));
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [gl]);

  const hit = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, delta) => {
    const shell = points.current;
    const mat = material.current;
    if (!shell || !mat) return;

    const s = state.current;
    const c = cursor.current;
    const dt = Math.min(delta, 1 / 30); // a tab returning from the background must not jump

    // Seamless by construction: every animated quantity is a continuous
    // function of time, so the loop has no seam to hide.
    s.time += dt;
    s.spin += BASE_SPIN * dt;

    // Lean toward the cursor, and settle back when it leaves.
    s.tiltX += (-c.viewport.y * 0.16 - s.tiltX) * Math.min(1, dt * 4);
    s.tiltY += (c.viewport.x * 0.18 - s.tiltY) * Math.min(1, dt * 4);
    shell.rotation.x = 0.14 + s.tiltX;
    shell.rotation.y = s.spin + s.tiltY;

    const u = mat.uniforms;
    u.uTime.value = s.time;
    u.uPulse.value = (s.time % PULSE_PERIOD) / PULSE_PERIOD;

    // Warp the field toward the cursor, strongest over the orb itself. The
    // pointer is projected onto the plane through the shell's centre and then
    // into the shell's own space, so the dimple tracks the world cursor even
    // while the mesh rotates.
    s.power += (c.proximity * CURSOR_POWER - s.power) * Math.min(1, dt * 5);
    u.uPointerPower.value = s.power;

    raycaster.setFromCamera(c.ndc, camera);
    const ray = raycaster.ray;
    const t = -ray.origin.dot(ray.direction);
    hit.copy(ray.origin).addScaledVector(ray.direction, t);
    shell.worldToLocal(hit);
    u.uPointer.value.lerp(hit, Math.min(1, dt * 8));

    // Point size is in device pixels: scale by the drawing buffer height.
    const height = size.height * gl.getPixelRatio();
    u.uScale.value = height / (2 * Math.tan((camera as THREE.PerspectiveCamera).fov * Math.PI / 360));
  });

  return (
    <points ref={points} geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        key={theme}
        ref={material}
        args={[
          {
            uniforms,
            vertexShader: VERTEX,
            fragmentShader: FRAGMENT,
            transparent: true,
            depthWrite: false,
            blending: theme === "dark" ? THREE.AdditiveBlending : THREE.NormalBlending,
          },
        ]}
      />
    </points>
  );
}

/**
 * The hero's particle sphere: a shell of orbiting points with surface waves,
 * a pulse that sweeps across it, and a gravity field the cursor warps.
 *
 * All motion is a continuous function of time, so the loop never seams.
 */
export default function OrbScene({ theme = "dark" }: { theme?: OrbTheme }) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, 3.2], fov: 45 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => gl.setClearAlpha(0)}
    >
      <ParticleShell theme={theme} />
    </Canvas>
  );
}
