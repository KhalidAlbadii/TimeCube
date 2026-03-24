
import React from 'react';
import { Session } from '../types';

interface StatsCardsProps {
  sessions: Session[];
}

const StatsCards: React.FC<StatsCardsProps> = ({ sessions }) => {
  const today = new Date().setHours(0, 0, 0, 0);
  const todaySessions = sessions.filter(s => s.startTime >= today);
  const totalDuration = todaySessions.reduce((acc, s) => acc + s.duration, 0);
  
  const faceDurations = todaySessions.reduce((acc, s) => {
    acc[s.faceId] = (acc[s.faceId] || 0) + s.duration;
    return acc;
  }, {} as Record<number, number>);

  const topFaceId = Object.entries(faceDurations)
    .sort(([, a], [, b]) => b - a)[0]?.[0];

  return (
    <div className="grid grid-cols-2 gap-6">
      <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
        <div className="text-slate-500 text-xs font-bold uppercase mb-2 tracking-widest">Today Total</div>
        <div className="text-3xl font-black">
          {Math.floor(totalDuration / 3600)}h {Math.floor((totalDuration % 3600) / 60)}m
        </div>
      </div>
      <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
        <div className="text-slate-500 text-xs font-bold uppercase mb-2 tracking-widest">Main Focus</div>
        <div className="text-3xl font-black">{topFaceId ? `Face ${topFaceId}` : '--'}</div>
      </div>
    </div>
  );
};

export default StatsCards;
