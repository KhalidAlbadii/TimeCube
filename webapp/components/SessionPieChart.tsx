import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

interface SessionPieChartProps {
  data: {
    name: string;
    value: number;
    color: string;
  }[];
}

const SessionPieChart: React.FC<SessionPieChartProps> = ({ data }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-3xl flex flex-col justify-center">
      <h3 className="text-sm font-bold mb-4 text-slate-500 uppercase tracking-widest">Time Distribution</h3>
      <div className="h-[200px] md:h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie 
              data={data} 
              innerRadius={50} 
              outerRadius={75} 
              paddingAngle={8} 
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{
                background: '#0f172a', 
                border: '1px solid #1e293b', 
                borderRadius: '12px', 
                color: '#fff'
              }} 
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SessionPieChart;
