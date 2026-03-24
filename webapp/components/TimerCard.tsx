import React from 'react';

interface TimerCardProps {
  duration: number;
}

const TimerCard: React.FC<TimerCardProps> = ({ duration }) => {
  const minutes = Math.floor(duration / 60);
  const seconds = (duration % 60).toString().padStart(2, '0');

  return (
    <div className="text-5xl md:text-6xl font-black mb-8 tabular-nums tracking-tighter">
      {minutes}:{seconds}
    </div>
  );
};

export default TimerCard;
