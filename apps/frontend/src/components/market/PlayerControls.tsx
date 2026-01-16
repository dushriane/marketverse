import { useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { PerspectiveCamera, MapControls } from '@react-three/drei';

export function PlayerControls() {
  const { camera, gl } = useThree();
  const controlsRef = useRef<any>();

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 10, 20]} fov={60} />
      <MapControls 
        ref={controlsRef} 
        args={[camera, gl.domElement]} 
        enableDamping={true}
        dampingFactor={0.05}
        minDistance={5}
        maxDistance={50}
        maxPolarAngle={Math.PI / 2.5} // Don't let camera go below ground
      />
    </>
  );
}
