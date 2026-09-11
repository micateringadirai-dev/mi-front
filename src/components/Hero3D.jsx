import { Suspense, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, Environment, ContactShadows } from '@react-three/drei';
import './Hero3D.scss';

// Three floating torus-knots representing the three MI Groups businesses,
// each tinted in its brand accent color with a smooth satin luxury finish.
function BrandKnot({ position, color, speed = 1, scale = 1 }) {
  const meshRef = useRef();

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.2 * speed;
      meshRef.current.rotation.y += delta * 0.28 * speed;
    }
  });

  return (
    <Float speed={1.6 * speed} rotationIntensity={0.5} floatIntensity={1.0}>
      <mesh ref={meshRef} position={position} scale={scale}>
        <torusKnotGeometry args={[1, 0.3, 128, 32]} />
        <meshStandardMaterial
          color={color}
          metalness={0.5}
          roughness={0.32}
          emissive={color}
          emissiveIntensity={0.06}
        />
      </mesh>
    </Float>
  );
}

function KnotGroup() {
  const { size } = useThree();
  const isMobile = size.width < 768;
  const isSmallMobile = size.width < 480;

  // Position knots so they gracefully frame the central headline and CTAs
  // without obscuring text legibility
  const knots = isSmallMobile
    ? [
        { position: [-1.35, 1.85, -1.2], color: '#b5482c', speed: 0.8, scale: 0.45 },
        { position: [0, 0.2, -3.2], color: '#d97b1f', speed: 0.9, scale: 0.52 },
        { position: [1.35, 1.85, -1.2], color: '#4f6b3b', speed: 1.1, scale: 0.45 },
      ]
    : isMobile
    ? [
        { position: [-2.1, 1.2, -0.8], color: '#b5482c', speed: 0.8, scale: 0.6 },
        { position: [0, 0.1, -2.6], color: '#d97b1f', speed: 0.9, scale: 0.68 },
        { position: [2.1, 1.2, -0.8], color: '#4f6b3b', speed: 1.1, scale: 0.6 },
      ]
    : [
        { position: [-3.6, 0.5, -0.4], color: '#b5482c', speed: 0.8, scale: 0.82 },
        { position: [0, 0.1, -2.5], color: '#d97b1f', speed: 0.9, scale: 0.88 },
        { position: [3.6, 0.6, -0.4], color: '#4f6b3b', speed: 1.1, scale: 0.82 },
      ];

  return (
    <>
      {knots.map((k, i) => (
        <BrandKnot
          key={i}
          position={k.position}
          color={k.color}
          speed={k.speed}
          scale={k.scale}
        />
      ))}
      <ContactShadows
        position={[0, isMobile ? -3 : -2.5, 0]}
        opacity={0.3}
        scale={isMobile ? 8 : 12}
        blur={2.8}
      />
      <Environment preset="city" />
    </>
  );
}

export default function Hero3D() {
  return (
    <div className="hero3d">
      <Canvas camera={{ position: [0, 0, 9], fov: 45 }} dpr={[1, 1.8]}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1.1} />
        <Suspense fallback={null}>
          <KnotGroup />
        </Suspense>
      </Canvas>
    </div>
  );
}
