"use client";

/* The 3D envelope on page 1, built with three.js via @react-three/fiber.
   Trick for the pixel look: the canvas renders at a tiny resolution (dpr ≈ 0.3)
   and CSS `image-rendering: pixelated` scales it up — PS1 / indie-game style.
   Floating hearts are made of little cubes using the same heart sprite as the UI. */

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { sprites } from "@/components/ui/sprites";
import { clamp, easeInOut, easeOut, lerp, seg } from "@/lib";

const W = 3.2;
const H = 2.1;
const FLAP = H * 0.62;

/* ── a heart made of cubes, from the 9x8 heart sprite ── */
function VoxelHeart({
  size = 0.08,
  color = "#7a2b2f",
  position,
  speed = 1,
  phase = 0,
}: {
  size?: number;
  color?: string;
  position: [number, number, number];
  speed?: number;
  phase?: number;
}) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const group = useRef<THREE.Group>(null);
  const cells = useMemo(() => {
    const out: [number, number][] = [];
    sprites.heart.rows.forEach((row, y) => [...row].forEach((c, x) => c !== "." && out.push([x, y])));
    return out;
  }, []);
  useEffect(() => {
    const m = new THREE.Matrix4();
    cells.forEach(([x, y], i) => {
      m.makeTranslation((x - 4) * size, (3.5 - y) * size, 0);
      ref.current!.setMatrixAt(i, m);
    });
    ref.current!.instanceMatrix.needsUpdate = true;
  }, [cells, size]);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime * speed + phase;
    if (!group.current) return;
    group.current.position.y = position[1] + Math.sin(t * 0.7) * 0.25;
    group.current.rotation.y = t * 0.5;
    group.current.rotation.z = Math.sin(t * 0.4) * 0.15;
  });
  return (
    <group ref={group} position={position}>
      <instancedMesh ref={ref} args={[undefined, undefined, cells.length]}>
        <boxGeometry args={[size, size, size]} />
        <meshStandardMaterial color={color} roughness={0.8} flatShading />
      </instancedMesh>
    </group>
  );
}

/* ── paper texture for the letter inside (drawn on a <canvas>) ── */
function useLetterTexture() {
  const [tex, setTex] = useState<THREE.CanvasTexture | null>(null);
  useEffect(() => {
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 330;
    const g = c.getContext("2d")!;
    const draw = () => {
      g.fillStyle = "#f4ebd9";
      g.fillRect(0, 0, c.width, c.height);
      g.strokeStyle = "rgba(122,43,47,0.25)";
      g.lineWidth = 2;
      for (let y = 70; y < c.height; y += 34) {
        g.beginPath();
        g.moveTo(30, y);
        g.lineTo(c.width - 30, y);
        g.stroke();
      }
      g.fillStyle = "#3a2a20";
      g.font = "italic 64px 'IM Fell English', Georgia, serif";
      g.textAlign = "center";
      g.fillText("for you", c.width / 2, 150);
      g.fillStyle = "#7a2b2f";
      g.font = "48px 'IM Fell English', Georgia, serif";
      g.fillText("♥", c.width / 2, 225);
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      t.magFilter = THREE.NearestFilter;
      setTex(t);
    };
    document.fonts?.ready.then(draw) ?? draw();
  }, []);
  return tex;
}

function Envelope({ opening, onOpened }: { opening: boolean; onOpened: () => void }) {
  const root = useRef<THREE.Group>(null);
  const flap = useRef<THREE.Group>(null);
  const seal = useRef<THREE.Group>(null);
  const letter = useRef<THREE.Mesh>(null);
  const startT = useRef<number | null>(null);
  const done = useRef(false);
  const [hover, setHover] = useState(false);
  const letterTex = useLetterTexture();
  const { camera, size, scene } = useThree();
  // back the camera off on narrow (portrait) screens so the whole envelope fits
  const baseZ = Math.max(6, 4.3 / (0.83 * (size.width / size.height)));

  const pocket = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-W / 2, -H / 2);
    s.lineTo(W / 2, -H / 2);
    s.lineTo(W / 2, H / 2 - 0.02);
    s.lineTo(0, -0.12);
    s.lineTo(-W / 2, H / 2 - 0.02);
    s.closePath();
    return new THREE.ShapeGeometry(s);
  }, []);
  const flapGeo = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-W / 2, 0);
    s.lineTo(W / 2, 0);
    s.lineTo(0.12, -FLAP + 0.06);
    s.quadraticCurveTo(0, -FLAP - 0.02, -0.12, -FLAP + 0.06);
    s.closePath();
    return new THREE.ShapeGeometry(s);
  }, []);
  const sealHeart = useMemo(() => {
    const out: [number, number][] = [];
    sprites.heart.rows.forEach((row, y) => [...row].forEach((c, x) => c !== "." && out.push([x, y])));
    return out;
  }, []);

  useFrame(({ clock, pointer }, dt) => {
    const r = root.current;
    if (!r) return;
    const now = clock.elapsedTime;
    // keep the fog relative to the camera, so a pulled-back camera (phones) still sees the envelope
    if (scene.fog instanceof THREE.Fog) {
      scene.fog.near = camera.position.z - 1;
      scene.fog.far = camera.position.z + 5;
    }

    if (!opening) {
      camera.position.z = baseZ;
      // idle: gentle bob + tilt toward the mouse
      r.position.y = Math.sin(now * 1.2) * 0.08;
      r.rotation.x = lerp(r.rotation.x, -pointer.y * 0.25, 0.06);
      r.rotation.y = lerp(r.rotation.y, pointer.x * 0.35, 0.06);
      r.rotation.z = Math.sin(now * 0.8) * 0.03;
      const s = hover ? 1.06 : 1;
      r.scale.setScalar(lerp(r.scale.x, s, 0.12));
      return;
    }

    if (startT.current === null) startT.current = now;
    const t = now - startT.current;

    // settle the envelope face-on
    r.rotation.x = lerp(r.rotation.x, 0, 0.1);
    r.rotation.y = lerp(r.rotation.y, 0, 0.1);
    r.rotation.z = lerp(r.rotation.z, 0, 0.1);

    // 1) seal pops off and tumbles away
    const sp = seg(t, 0, 0.8);
    if (seal.current) {
      seal.current.position.set(0.15 * sp, -FLAP + 0.18 - 2.4 * sp * sp, 0.06 + 0.9 * sp);
      seal.current.rotation.set(sp * 5, sp * 3, sp * 2);
      seal.current.scale.setScalar(1 - clamp(sp * 1.2 - 0.2));
    }

    // 2) flap swings open toward the camera, then folds up behind
    const fp = easeInOut(seg(t, 0.35, 1.0));
    if (flap.current) {
      flap.current.rotation.x = -Math.PI * fp;
      flap.current.position.z = fp > 0.5 ? -0.05 : 0.045;
    }

    // 3) the letter slides up
    const lp = easeOut(seg(t, 1.3, 1.2));
    if (letter.current) letter.current.position.y = lp * 1.55;

    // 4) camera dives into the letter
    const cp = easeInOut(seg(t, 2.3, 1.3));
    camera.position.z = lerp(baseZ, 1.25, cp);
    camera.position.y = lerp(0, 1.5, cp);
    camera.lookAt(0, lerp(0, 1.5, cp), 0);
    r.position.y = lerp(r.position.y, 0, 0.1);

    if (t > 3.1 && !done.current) {
      done.current = true;
      onOpened();
    }
    void dt;
  });

  return (
    <group
      ref={root}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
    >
      {/* back of the envelope */}
      <mesh position={[0, 0, -0.03]}>
        <boxGeometry args={[W, H, 0.04]} />
        <meshStandardMaterial color="#cdb68d" roughness={0.95} flatShading />
      </mesh>
      {/* the letter */}
      <mesh ref={letter} position={[0, 0, 0]}>
        <planeGeometry args={[W - 0.3, H - 0.2]} />
        <meshStandardMaterial map={letterTex ?? undefined} color={letterTex ? "#ffffff" : "#f4ebd9"} roughness={1} />
      </mesh>
      {/* front pocket */}
      <mesh geometry={pocket} position={[0, 0, 0.03]}>
        <meshStandardMaterial color="#e6d2ad" roughness={0.95} side={THREE.DoubleSide} flatShading />
      </mesh>
      {/* stitched-looking edge lines */}
      <mesh position={[0, -H / 2 + 0.12, 0.032]}>
        <planeGeometry args={[W - 0.25, 0.02]} />
        <meshBasicMaterial color="#b08d64" />
      </mesh>
      {/* top flap + wax seal */}
      <group ref={flap} position={[0, H / 2 - 0.01, 0.045]}>
        <mesh geometry={flapGeo}>
          <meshStandardMaterial color="#dcc59c" roughness={0.9} side={THREE.DoubleSide} flatShading />
        </mesh>
        <group ref={seal} position={[0, -FLAP + 0.18, 0.06]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.34, 0.37, 0.07, 14]} />
            <meshStandardMaterial color="#6a1d22" roughness={0.45} metalness={0.1} flatShading />
          </mesh>
          {sealHeart.map(([x, y], i) => (
            <mesh key={i} position={[(x - 4) * 0.045, (3.5 - y) * 0.045, 0.045]}>
              <boxGeometry args={[0.045, 0.045, 0.03]} />
              <meshStandardMaterial color="#9c3a3c" roughness={0.5} />
            </mesh>
          ))}
        </group>
      </group>
    </group>
  );
}

function Flicker() {
  const light = useRef<THREE.PointLight>(null);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (light.current)
      light.current.intensity = 26 + Math.sin(t * 7) * 2.5 + Math.sin(t * 13.3) * 1.5 + (Math.random() - 0.5) * 2;
  });
  return <pointLight ref={light} position={[2.2, 1.6, 3]} color="#ffb46b" intensity={26} distance={12} />;
}

export default function EnvelopeScene({
  opening,
  onClick,
  onOpened,
}: {
  opening: boolean;
  onClick: () => void;
  onOpened: () => void;
}) {
  // render tiny, show big → chunky pixels
  const [dpr, setDpr] = useState(0.35);
  useEffect(() => {
    const f = () => {
      const w = window.innerWidth;
      setDpr(clamp((w < 700 ? 230 : 400) / w, 0.18, 1));
    };
    f();
    window.addEventListener("resize", f);
    return () => window.removeEventListener("resize", f);
  }, []);

  const hearts = useMemo(
    () =>
      [
        { p: [-3.4, 1.4, -2.5], c: "#7a2b2f", s: 0.1 },
        { p: [3.6, -1.2, -3], c: "#5e1f24", s: 0.12 },
        { p: [-2.6, -1.8, -1.5], c: "#a8504f", s: 0.06 },
        { p: [2.8, 1.9, -2], c: "#a8504f", s: 0.07 },
        { p: [0.6, 2.6, -4], c: "#5e1f24", s: 0.09 },
        { p: [-4.8, -0.3, -4.5], c: "#8a4a33", s: 0.11 },
        { p: [4.9, 0.8, -5], c: "#7a2b2f", s: 0.1 },
      ] as { p: [number, number, number]; c: string; s: number }[],
    [],
  );

  return (
    <Canvas
      dpr={dpr}
      gl={{ antialias: false, powerPreference: "low-power" }}
      camera={{ position: [0, 0, 6], fov: 45 }}
      style={{ imageRendering: "pixelated", width: "100%", height: "100%" }}
      onClick={() => !opening && onClick()}
    >
      <color attach="background" args={["#130d0a"]} />
      <fog attach="fog" args={["#130d0a", 5, 11]} />
      <ambientLight intensity={0.45} color="#ffd9b0" />
      <directionalLight position={[-2, 3, 4]} intensity={0.9} color="#ffe7c4" />
      <Flicker />
      <Envelope opening={opening} onOpened={onOpened} />
      {hearts.map((h, i) => (
        <VoxelHeart key={i} position={h.p} color={h.c} size={h.s} speed={0.6 + (i % 3) * 0.2} phase={i * 1.7} />
      ))}
    </Canvas>
  );
}
