import { useRef, useState, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { useCursor, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useMarketStore } from '../../stores/marketStore';
import { useCartStore } from '../../stores/cartStore'; // Added cart store

interface ProductData {
  id: string;
  name: string;
  price: number;
  position: [number, number, number];
  color: string;
}

const DUMMY_PRODUCTS: ProductData[] = [
  { id: '1', name: 'Fresh Apples', price: 2.50, position: [-2, 1.5, -2], color: 'red' },
  { id: '2', name: 'Organic Bananas', price: 1.80, position: [0, 1.5, -2], color: 'yellow' },
  { id: '3', name: 'Carrots', price: 1.20, position: [2, 1.5, -2], color: 'orange' },
  { id: '4', name: 'Artisan Bread', price: 4.00, position: [-2, 1.5, 0], color: 'brown' },
  { id: '5', name: 'Honey Jar', price: 8.50, position: [2, 1.5, 0], color: 'gold' },
];

function Product3D({ product, onSelect, isSelected }: { product: ProductData, onSelect: (p: ProductData) => void, isSelected: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);

  useFrame((state) => {
    if (meshRef.current) {
        if (isSelected) {
             meshRef.current.rotation.y += 0.02;
             meshRef.current.position.y = product.position[1] + 0.2 + Math.sin(state.clock.elapsedTime * 3) * 0.05;
        } else if (hovered) {
             meshRef.current.scale.lerp(new THREE.Vector3(1.2, 1.2, 1.2), 0.1);
        } else {
             meshRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
             meshRef.current.position.y = product.position[1];
             meshRef.current.rotation.y = 0;
        }
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={product.position}
      onClick={(e) => { e.stopPropagation(); onSelect(product); }}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <boxGeometry args={[0.5, 0.5, 0.5]} />
      <meshStandardMaterial color={product.color} emissive={isSelected ? "white" : "black"} emissiveIntensity={0.2} />
      {hovered && (
          <Html position={[0, 0.6, 0]} center pointerEvents="none">
              <div className="bg-black/75 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                  {product.name} - RWF {product.price.toLocaleString()}
              </div>
          </Html>
      )}
    </mesh>
  );
}

function NavigationFloor() {
  const { camera } = useThree();
  const [target, setTarget] = useState<THREE.Vector3 | null>(null);
  //const dummyVec = useMemo(() => new THREE.Vector3(), []);

  const handleFloorClick = (e: any) => {
      // Simple validation to keep inside bounds (e.g., radius of 8)
      if (e.point.length() < 8) {
          setTarget(new THREE.Vector3(e.point.x, 1.7, e.point.z + 2)); // keep camera at eye level, slight offset
      }
  };

  useFrame(() => {
    if (target) {
        camera.position.lerp(target, 0.05);
        if (camera.position.distanceTo(target) < 0.1) {
            setTarget(null);
        }
    }
  });

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} onClick={handleFloorClick} receiveShadow>
      <planeGeometry args={[20, 20]} />
      <meshStandardMaterial color="#333" transparent opacity={0.5} />
      <Html position={[0, 0.1, 8]} center transform rotation={[-Math.PI/2, 0, 0]} scale={2}>
          <div className="text-white/50 text-sm pointer-events-none">Click floor to move</div>
      </Html>
    </mesh>
  );
}


export function InteractiveStall() {
  const { exitStall } = useMarketStore();
  const { addToCart } = useCartStore(); // Use addToCart action
  const [selectedProduct, setSelectedProduct] = useState<ProductData | null>(null);

  // Initial camera setup
  const { camera } = useThree();
  useEffect(() => {
      camera.position.set(0, 1.7, 6);
      camera.lookAt(0, 1.5, 0);
  }, [camera]);

  return (
    <group>
        <ambientLight intensity={0.5} />
        <pointLight position={[0, 5, 0]} intensity={1} />
        
        {/* Stall Structure */}
        <group>
            <mesh position={[0, 0.1, 0]} receiveShadow>
                <boxGeometry args={[10, 0.2, 8]} />
                <meshStandardMaterial color="#8B4513" />
            </mesh>
             {/* Back Wall */}
            <mesh position={[0, 2.5, -4]} receiveShadow>
                <boxGeometry args={[10, 5, 0.2]} />
                <meshStandardMaterial color="#A0522D" />
            </mesh>
        </group>

        {/* Products */}
        {DUMMY_PRODUCTS.map(p => (
            <Product3D 
                key={p.id} 
                product={p} 
                isSelected={selectedProduct?.id === p.id}
                onSelect={setSelectedProduct}
            />
        ))}

        {/* Navigation */}
        <NavigationFloor />

        {/* HUD Overlay for Product */}
        {selectedProduct && (
            <Html fullscreen style={{ pointerEvents: 'none' }}>
                <div className="absolute right-0 top-0 h-full w-1/3 bg-white/95 shadow-xl p-8 transform transition-transform duration-300 pointer-events-auto flex flex-col z-[50]">
                     <div className="flex justify-between items-start mb-6">
                        <h2 className="text-3xl font-bold text-gray-800">{selectedProduct.name}</h2>
                        <button 
                            onClick={() => setSelectedProduct(null)}
                            className="text-gray-500 hover:text-gray-800"
                        >
                            ✕
                        </button>
                     </div>
                     <div className="w-full h-48 bg-gray-200 rounded-lg mb-6 flex items-center justify-center text-gray-400">
                         Product Image Preview
                     </div>
                     <p className="text-2xl text-indigo-600 font-bold mb-4">RWF {selectedProduct.price.toLocaleString()}</p>
                     <p className="text-gray-600 mb-8 flex-grow">
                         This is a premium quality item sourced directly from local producers. 
                         Freshness guaranteed and handled with care.
                     </p>
                     
                     <div className="space-y-4 mt-auto">
                        <button
                            onClick={() => {
                                // Since dummy products lack real IDs, mapping them to a cart-compatible format
                                // In a real app, interactive stall would fetch real products from props or store
                                addToCart({
                                    id: selectedProduct.id,
                                    name: selectedProduct.name,
                                    price: selectedProduct.price,
                                });
                                alert('Added to cart!');
                                setSelectedProduct(null);
                            }}
                            className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 font-medium transition-colors"
                        >
                            Add to Cart
                        </button>
                        <button 
                            onClick={() => console.log('Inspect')}
                            className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                        >
                            Inspect 3D Model
                        </button>
                     </div>
                </div>
            </Html>
        )}

        {/* Exit Button */}
        <Html position={[-4, 3, 0]}>
            <button 
                onClick={exitStall}
                className="bg-red-500 text-white px-4 py-2 rounded shadow hover:bg-red-600 whitespace-nowrap"
            >
                Start Exit
            </button>
        </Html>
    </group>
  );
}
