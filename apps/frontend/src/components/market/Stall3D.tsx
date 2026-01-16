import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Html } from '@react-three/drei';
import { MarketVendor } from '../../stores/marketStore';
import * as THREE from 'three';

interface Stall3DProps {
  vendor: MarketVendor;
  position: [number, number, number];
  onClick: (id: string) => void;
  isSelected: boolean;
}

export function Stall3D({ vendor, position, onClick, isSelected }: Stall3DProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      // Gentle floating animation
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      
      // Rotate if selected
      if (isSelected) {
          meshRef.current.rotation.y += 0.01;
      }
    }
  });

  return (
    <group position={position}>
      {/* Platform/Table */}
      <mesh
        ref={meshRef}
        onClick={(e) => { e.stopPropagation(); onClick(vendor.id); }}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        position={[0, 0.5, 0]}
      >
        <boxGeometry args={[2, 1, 2]} />
        <meshStandardMaterial color={isSelected ? "#4f46e5" : hovered ? "#6366f1" : "orange"} />
      </mesh>
      
      {/* Roof/Canopy */}
      <mesh position={[0, 2, 0]}>
        <coneGeometry args={[1.5, 1, 4]} />
        <meshStandardMaterial color={isSelected ? "#4f46e5" : "#ef4444"} />
      </mesh>
      
      {/* Supports */}
      <mesh position={[0.9, 1, 0.9]}>
        <cylinderGeometry args={[0.05, 0.05, 2]} />
        <meshStandardMaterial color="#888" />
      </mesh>
      <mesh position={[-0.9, 1, 0.9]}>
        <cylinderGeometry args={[0.05, 0.05, 2]} />
        <meshStandardMaterial color="#888" />
      </mesh>  
      <mesh position={[0.9, 1, -0.9]}>
        <cylinderGeometry args={[0.05, 0.05, 2]} />
        <meshStandardMaterial color="#888" />
      </mesh>  
      <mesh position={[-0.9, 1, -0.9]}>
        <cylinderGeometry args={[0.05, 0.05, 2]} />
        <meshStandardMaterial color="#888" />
      </mesh>

      {/* Floating Info Text */}
      <Text
        position={[0, 3, 0]}
        fontSize={0.4}
        color="black"
        anchorX="center"
        anchorY="middle"
      >
        {vendor.storeName}
      </Text>
      
      {/* Category Labels */}
      <Text
        position={[0, 2.6, 0]}
        fontSize={0.2}
        color="#555"
        anchorX="center"
        anchorY="middle"
      >
         {vendor.categories.slice(0, 2).join(', ')}
      </Text>

        {isSelected && (
            <Html position={[0, 4, 0]} center>
                <div className="bg-white p-2 rounded shadow-lg text-sm w-48 text-center pointer-events-none">
                    <p className="font-bold">{vendor.storeName}</p>
                    <p className="text-gray-500 text-xs">{vendor.description || "No description"}</p>
                    <p className="text-indigo-600 text-xs mt-1">{vendor.productCount} products</p>
                </div>
            </Html>
        )}
    </group>
  );
}
