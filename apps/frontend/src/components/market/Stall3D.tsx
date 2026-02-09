import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Html, useGLTF } from '@react-three/drei';
import { useMarketStore, MarketVendor } from '../../stores/marketStore';
import * as THREE from 'three';

interface Stall3DProps {
  vendor: MarketVendor;
  position: [number, number, number];
  onClick: (id: string) => void;
  isSelected: boolean;
}

export function Stall3D({ vendor, position, onClick, isSelected }: Stall3DProps) {
  const meshRef = useRef<THREE.Group>(null);
  const { enterStall } = useMarketStore();
  const [hovered, setHovered] = useState(false);

  // Load custom model if available. Using a generic stall model as default fallback or a specific one.
  // Note: Ensure the file 'market_stall.glb' exists in public/models/
  const { scene } = useGLTF('/models/market_stall.glb', undefined, (error) => {
      // Fallback if model missing, we handle this by checking if scene is valid or catching error
      console.warn("Model failed to load, using placeholder geometry.", error);
  });
  
  // Clone scene so we can use it multiple times
  const clonedScene = scene.clone();

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
    <group 
        ref={meshRef} 
        position={position}
        onClick={(e) => { e.stopPropagation(); onClick(vendor.id); }}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
    >
      {/* 3D Model or Fallback */}
      {clonedScene ? (
          <primitive 
            object={clonedScene} 
            scale={0.5} 
            position={[0, 0, 0]}
          >
             {isSelected && <meshStandardMaterial color="#4f46e5" wireframe />}
          </primitive>
      ) : (
        // OLD FALLBACK GEOMETRY
        <group>
            <mesh position={[0, 0.5, 0]}>
                <boxGeometry args={[2, 1, 2]} />
                <meshStandardMaterial color={isSelected ? "#4f46e5" : hovered ? "#6366f1" : "orange"} />
            </mesh>
            <mesh position={[0, 2, 0]}>
                <coneGeometry args={[1.5, 1, 4]} />
                <meshStandardMaterial color={isSelected ? "#4f46e5" : "#ef4444"} />
            </mesh>
        </group>
      )}

      {/* Floating Info Text */}
      <Text
        position={[0, 3, 0]}
        fontSize={0.4}
        color="white" // Changing to white for better visibility in dark scene
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
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
            <Html position={[0, 4, 0]} center zIndexRange={[100, 0]}>
                <div className="bg-white p-3 rounded-lg shadow-xl text-sm w-48 text-center pointer-events-auto transition-all transform scale-100 opacity-100">
                    <p className="font-bold text-gray-800 text-lg mb-1">{vendor.storeName}</p>
                    <p className="text-gray-500 text-xs mb-2">{vendor.description || "No description"}</p>
                    <div className="flex justify-between items-center px-2 mb-2">
                        <span className="text-xs font-medium text-gray-400">Products</span>
                        <span className="text-sm font-bold text-indigo-600">{vendor.productCount}</span>
                    </div>
                    <button 
                        onClick={(e) => { e.stopPropagation(); enterStall(); }}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2 rounded transition-colors"
                    >
                        Enter Stall
                    </button>
                </div>
            </Html>
        )}
    </group>
  );
}
