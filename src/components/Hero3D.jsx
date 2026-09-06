import { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Environment, ContactShadows } from '@react-three/drei';
import './Hero3D.scss';

// Three floating torus-knots representing the three MI Groups businesses,
// each tinted in its brand accent color, gently rotating and bobbing.
function BrandKnot({ position, color, speed = 1, scale = 1 }) {
  const meshRef = useRef();

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.25 * speed;
      meshRef.current.rotation.y += delta * 0.35 * speed;
    }
  });

  return (
    <Float speed={2 * speed} rotationIntensity={0.6} floatIntensity={1.2}>
      <mesh ref={meshRef} position={position} scale={scale}>
        <torusKnotGeometry args={[1, 0.32, 128, 32]} />
        <meshStandardMaterial
          color={color}
          metalness={0.65}
          roughness={0.25}
          emissive={color}
          emissiveIntensity={0.08}
        />
      </mesh>
    </Float>
  );
}

export default function Hero3D() {
  return (
    <div className="hero3d">
      <Canvas camera={{ position: [0, 0, 9], fov: 45 }} dpr={[1, 1.8]}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} />
        <Suspense fallback={null}>
          <BrandKnot position={[-3.2, 0.6, 0]} color="#b5482c" speed={0.8} scale={0.85} />
          <BrandKnot position={[0, -0.4, -1]} color="#d97b1f" speed={1} scale={1} />
          <BrandKnot position={[3.2, 0.8, 0]} color="#4f6b3b" speed={1.2} scale={0.85} />
          <ContactShadows position={[0, -2.4, 0]} opacity={0.35} scale={12} blur={2.5} />
          <Environment preset="city" />
        </Suspense>
      </Canvas>
    </div>
  );
}
