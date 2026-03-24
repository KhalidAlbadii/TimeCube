import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface HistoryBarChartProps {
  data: {
    date: string;
    mins: number;
  }[];
}

const HistoryBarChart: React.FC<HistoryBarChartProps> = ({ data }) => {
  return (
    <div className="bg-slate-900 p-4 md:p-8 rounded-3xl border border-slate-800">
      <h3 className="font-bold mb-8 text-slate-500 uppercase text-[10px] tracking-widest">Activity (Minutes)</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid stroke="#1e293b" vertical={false} />
            <XAxis 
              dataKey="date" 
              stroke="#64748b" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10 }} 
              dy={10} 
            />
            <YAxis 
              stroke="#64748b" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10 }} 
            />
            <Tooltip 
              cursor={{ fill: '#1e293b' }} 
              contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '12px' }} 
            />
            <Bar dataKey="mins" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={30} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default HistoryBarChart;
