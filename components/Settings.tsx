
import React from 'react';
import { CubeFace } from '../types';

interface SettingsProps {
  faces: CubeFace[];
  onUpdateFace: (id: number, label: string) => void;
}

const Settings: React.FC<SettingsProps> = ({ faces, onUpdateFace }) => (
  <div className="space-y-6">
    <div className="flex flex-col space-y-1">
      <h2 className="text-2xl font-bold">Face Assignments</h2>
      <p className="text-slate-400 text-sm">Assign task labels to each side of your TimeCube.</p>
    </div>
    <div className="grid gap-4">
      {faces.map(f => (
        <div key={f.id} className="bg-slate-800 p-5 rounded-2xl flex items-center space-x-5 border border-slate-700 transition-all focus-within:border-blue-500">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl shadow-lg" style={{background: f.color}}>
            <i className={`fas ${f.icon}`}></i>
          </div>
          <div className="flex-1">
            <div className="text-[10px] font-black uppercase text-slate-500 mb-1">Side {f.id}</div>
            <input 
              className="bg-transparent text-lg font-bold w-full outline-none" 
              value={f.label} 
              onChange={e => onUpdateFace(f.id, e.target.value)} 
              placeholder={`Side ${f.id} label...`}
            />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default Settings;
