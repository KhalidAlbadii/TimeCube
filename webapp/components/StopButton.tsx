import React from 'react';

interface StopButtonProps {
  onStop: () => void;
  isRecording: boolean;
}

const StopButton: React.FC<StopButtonProps> = ({ onStop, isRecording }) => {
  return (
    <button 
      onClick={onStop} 
      disabled={!isRecording}
      className={`w-full py-4 rounded-2xl font-bold text-lg transition-transform active:scale-95 ${
        isRecording 
          ? 'bg-red-500 shadow-lg shadow-red-900/20' 
          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
      }`}
    >
      Stop Tracking
    </button>
  );
};

export default StopButton;
