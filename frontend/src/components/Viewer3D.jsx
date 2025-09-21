import React, { useRef, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, ContactShadows } from '@react-three/drei';
import { motion } from 'framer-motion';

const Product3DModel = ({ modelUrl, scale = 1, rotation = [0, 0, 0] }) => {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  
  // Auto-rotate when not being controlled
  useFrame((state, delta) => {
    if (meshRef.current && !hovered) {
      meshRef.current.rotation.y += delta * 0.5;
    }
  });

  // Fallback geometry for demo
  return (
    <group 
      ref={meshRef}
      scale={scale}
      rotation={rotation}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1, 1.2, 0.1]} />
        <meshStandardMaterial 
          color={hovered ? "#FF6B35" : "#4ECDC4"}
          roughness={0.3}
          metalness={0.2}
        />
      </mesh>
      {/* T-shirt front design */}
      <mesh position={[0, 0, 0.051]}>
        <planeGeometry args={[0.6, 0.3]} />
        <meshStandardMaterial color="#FFFFFF" transparent opacity={0.9} />
      </mesh>
    </group>
  );
};

const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-full">
    <motion.div
      className="w-8 h-8 border-2 border-gray-300 border-t-orange-500 rounded-full"
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    />
  </div>
);

const Viewer3D = ({ 
  productId, 
  modelUrl, 
  className = '',
  enableAR = true,
  enableZoom = true,
  autoRotate = true
}) => {
  const [viewMode, setViewMode] = useState('3d'); // '3d' | 'ar'
  const [isLoading, setIsLoading] = useState(true);

  const handleARView = () => {
    // WebXR AR implementation
    if ('xr' in navigator) {
      navigator.xr.requestSession('immersive-ar').then(session => {
        // AR session logic
        console.log('AR session started');
        setViewMode('ar');
      }).catch(err => {
        console.warn('AR not supported:', err);
        alert('AR not supported on this device');
      });
    } else {
      alert('WebXR not supported on this browser');
    }
  };

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 0, 4], fov: 45 }}
        shadows
        gl={{ antialias: true, alpha: true }}
        onCreated={() => setIsLoading(false)}
      >
        <Suspense fallback={null}>
          {/* Lighting */}
          <ambientLight intensity={0.4} />
          <directionalLight 
            position={[5, 5, 5]} 
            intensity={1}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          <pointLight position={[-5, 5, 5]} intensity={0.3} color="#FF6B35" />
          <pointLight position={[5, -5, -5]} intensity={0.3} color="#4ECDC4" />

          {/* 3D Model */}
          <Product3DModel modelUrl={modelUrl} />

          {/* Environment & Controls */}
          <Environment preset="studio" />
          <ContactShadows 
            position={[0, -1.4, 0]} 
            opacity={0.75} 
            scale={10} 
            blur={2.5} 
            far={4} 
          />
          
          {enableZoom && (
            <OrbitControls 
              enablePan={false}
              enableZoom={enableZoom}
              enableRotate={true}
              autoRotate={autoRotate}
              autoRotateSpeed={2}
              maxPolarAngle={Math.PI / 2}
              minDistance={2}
              maxDistance={8}
            />
          )}
        </Suspense>
      </Canvas>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 bg-opacity-75 flex items-center justify-center">
          <LoadingSpinner />
        </div>
      )}

      {/* Control Panel */}
      <div className="absolute bottom-4 left-4 flex gap-2">
        <motion.button
          className="px-3 py-2 bg-white/90 backdrop-blur-sm rounded-lg text-sm font-medium shadow-md"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => window.open(`/api/products/${productId}/3d`, '_blank')}
        >
          🔍 Full View
        </motion.button>
        
        {enableAR && (
          <motion.button
            className="px-3 py-2 bg-gradient-to-r from-orange-500 to-teal-400 text-white rounded-lg text-sm font-medium shadow-md"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleARView}
          >
            📱 AR Preview
          </motion.button>
        )}
      </div>

      {/* Size Selector */}
      <div className="absolute top-4 right-4">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-md">
          <div className="text-xs text-gray-600 mb-1">Size</div>
          <div className="flex gap-1">
            {['S', 'M', 'L', 'XL'].map(size => (
              <button
                key={size}
                className="w-6 h-6 text-xs border border-gray-300 rounded hover:bg-gray-100 transition-colors"
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Viewer3D;
