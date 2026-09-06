import { Suspense, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
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

function KnotGroup() {
  const { size } = useThree();
  const isMobile = size.width < 768;
  const isSmallMobile = size.width < 480;

  // On mobile screens, bring side knots inwards and scale down center knot
  // so all three knots are visible without covering hero text.
  const knots = isSmallMobile
    ? [
        { position: [-1.25, 1.75, -0.6], color: '#b5482c', speed: 0.8, scale: 0.48 },
        { position: [0, -0.2, -2.4], color: '#d97b1f', speed: 1, scale: 0.58 },
        { position: [1.25, 1.75, -0.6], color: '#4f6b3b', speed: 1.2, scale: 0.48 },
      ]
    : isMobile
    ? [
        { position: [-1.9, 1.3, -0.3], color: '#b5482c', speed: 0.8, scale: 0.65 },
        { position: [0, -0.3, -1.8], color: '#d97b1f', speed: 1, scale: 0.75 },
        { position: [1.9, 1.3, -0.3], color: '#4f6b3b', speed: 1.2, scale: 0.65 },
      ]
    : [
        { position: [-3.2, 0.6, 0], color: '#b5482c', speed: 0.8, scale: 0.85 },
        { position: [0, -0.4, -1], color: '#d97b1f', speed: 1, scale: 1 },
        { position: [3.2, 0.8, 0], color: '#4f6b3b', speed: 1.2, scale: 0.85 },
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
        position={[0, isMobile ? -3 : -2.4, 0]}
        opacity={0.35}
        scale={isMobile ? 8 : 12}
        blur={2.5}
      />
      <Environment preset="city" />
    </>
  );
}

export default function Hero3D() {
  return (
    <div className="hero3d">
      <Canvas camera={{ position: [0, 0, 9], fov: 45 }} dpr={[1, 1.8]}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} />
        <Suspense fallback={null}>
          <KnotGroup />
        </Suspense>
      </Canvas>
    </div>
  );
}

