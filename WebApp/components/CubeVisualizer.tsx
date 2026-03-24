
import React from 'react';
import { CubeFace } from '../types';

interface CubeVisualizerProps {
  activeFace: number;
  faces: CubeFace[];
}

const CubeVisualizer: React.FC<CubeVisualizerProps> = ({ activeFace, faces }) => {
  // Map face ID to rotation values
  const getRotation = (face: number) => {
    switch (face) {
      case 1: return 'rotateY(0deg) rotateX(0deg)';
      case 2: return 'rotateY(-90deg) rotateX(0deg)';
      case 3: return 'rotateY(-180deg) rotateX(0deg)';
      case 4: return 'rotateY(90deg) rotateX(0deg)';
      case 5: return 'rotateX(-90deg) rotateY(0deg)';
      case 6: return 'rotateX(90deg) rotateY(0deg)';
      default: return 'rotateY(0deg)';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="cube-container">
        <div 
          className="cube active-glow"
          style={{ transform: getRotation(activeFace) }}
        >
          {faces.map(f => (
            <div 
              key={f.id} 
              className={`face face-${f.id}`}
              style={{ background: `${f.color}cc` }} // Add some transparency
            >
              <i className={`fas ${f.icon}`}></i>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-8 text-center">
        <span className="text-slate-400 text-sm uppercase tracking-widest font-bold">Currently Active Face</span>
        <h2 className="text-4xl font-black text-white mt-1">
          {faces.find(f => f.id === activeFace)?.label || `Face ${activeFace}`}
        </h2>
      </div>
    </div>
  );
};

export default CubeVisualizer;
