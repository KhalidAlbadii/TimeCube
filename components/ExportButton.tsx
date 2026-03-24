import React from 'react';
import { Session, CubeFace } from '../types';

interface ExportButtonProps {
  sessions: Session[];
  faces: CubeFace[];
}

const ExportButton: React.FC<ExportButtonProps> = ({ sessions, faces }) => {
  const exportCSV = () => {
    if (sessions.length === 0) {
      alert("No data to export");
      return;
    }

    const headers = "ID,Task,Start Date,Start Time,End Date,End Time,Duration (Hours)\n";
    
    const rows = sessions.map(s => {
      const label = faces.find(f => f.id === s.faceId)?.label || `Face ${s.faceId}`;
      const startDate = new Date(s.startTime);
      const endDate = s.endTime ? new Date(s.endTime) : new Date();
      
      const formatDate = (d: Date) => d.toISOString().split('T')[0];
      const formatTime = (d: Date) => d.toLocaleTimeString('en-GB', { hour12: false });
      
      const durationHours = (s.duration / 3600).toFixed(4);
      
      return `${s.id},${label},${formatDate(startDate)},${formatTime(startDate)},${formatDate(endDate)},${formatTime(endDate)},${durationHours}`;
    }).join("\n");

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `TimeCube_Export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button 
      onClick={exportCSV} 
      className="bg-slate-800 p-3 rounded-xl font-bold border border-slate-700 hover:bg-slate-700 transition-colors"
      title="Export to CSV"
    >
      <i className="fas fa-file-csv"></i>
    </button>
  );
};

export default ExportButton;
