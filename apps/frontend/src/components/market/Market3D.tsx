import { Canvas } from '@react-three/fiber';
import { Sky, Stars, Environment, Grid } from '@react-three/drei';
import { useMarketStore } from '../../stores/marketStore';
import { Stall3D } from './Stall3D';
import { InteractiveStall } from './InteractiveStall';
import { PlayerControls } from './PlayerControls';
import { Suspense, useMemo } from 'react';

export function Market3D() {
  const { filteredVendors, selectedVendorId, selectVendor, isInsideStall, exitStall } = useMarketStore();

  // Create a grid layout for stalls
  const gridLayout = useMemo(() => {
    return filteredVendors.map((vendor, index) => {
      // Create a simple spiral or grid layout
      const spacing = 8;
      const row = Math.floor(index / 4);
      const col = index % 4;
      
      const x = (col - 1.5) * spacing;
      const z = (row - 1.5) * spacing;
      
      return { ...vendor, position: [x, 0, z] as [number, number, number] };
    });
  }, [filteredVendors]);

  if (isInsideStall) {
      return (
        <div className="w-full h-full bg-gray-900 absolute top-0 left-0">
             <Canvas shadows camera={{ position: [0, 1.7, 5], fov: 60 }}>
                <Suspense fallback={null}>
                    <InteractiveStall />
                    <Environment preset="city" />
                </Suspense>
             </Canvas>
              {/* Stall HUD */}
              <div className="absolute top-4 left-4 z-10">
                  <button 
                    onClick={exitStall}
                    className="bg-white/10 backdrop-blur text-white px-4 py-2 rounded-full hover:bg-white/20 flex items-center gap-2 transition-all"
                  >
                      <span>← Back to Market</span>
                  </button>
              </div>
        </div>
      );
  }

  return (
    <div className="w-full h-full bg-gray-900 absolute top-0 left-0">
      <Canvas shadows>
        <Suspense fallback={null}>
          <PlayerControls />
          
          <ambientLight intensity={0.5} />
          <directionalLight 
            position={[10, 10, 5]} 
            intensity={1} 
            castShadow 
          />
          
          <Sky sunPosition={[100, 20, 100]} />
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
          <Environment preset="city" />

          {/* Ground */}
          <Grid args={[100, 100]} cellColor="white" sectionColor="gray" fadeDistance={50} />
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
            <planeGeometry args={[100, 100]} />
            <meshStandardMaterial color="#222" />
          </mesh>

          {/* Stalls */}
          {gridLayout.map((item) => (
            <Stall3D 
              key={item.id} 
              vendor={item} 
              position={item.position} 
              onClick={selectVendor}
              isSelected={selectedVendorId === item.id}
            />
          ))}
        </Suspense>
      </Canvas>
      
      {/* HUD / Instructions */}
      <div className="absolute bottom-4 left-4 bg-black/50 text-white p-4 rounded backdrop-blur-sm pointer-events-none">
        <p className="font-bold">Controls:</p>
        <ul className="text-sm list-disc pl-4">
            <li>Left Click + Drag: Pan</li>
            <li>Right Click + Drag: Rotate</li>
            <li>Scroll: Zoom</li>
            <li>Click Stall: Select</li>
        </ul>
      </div>
    </div>
  );
}
