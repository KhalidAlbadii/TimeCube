
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { AppTab, Session, CubeFace, DEFAULT_FACES, STORAGE_KEYS } from './types';
import CubeVisualizer from './components/CubeVisualizer';
import StatsCards from './components/StatsCards';
import Settings from './components/Settings';
import TimerCard from './components/TimerCard';
import StopButton from './components/StopButton';
import SessionPieChart from './components/SessionPieChart';
import HistoryBarChart from './components/HistoryBarChart';
import ExportButton from './components/ExportButton';
import { BluetoothService, BluetoothState } from './services/bluetoothService';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.DASHBOARD);
  const [faces, setFaces] = useState<CubeFace[]>(() => JSON.parse(localStorage.getItem(STORAGE_KEYS.FACES) || JSON.stringify(DEFAULT_FACES)));
  const [sessions, setSessions] = useState<Session[]>(() => JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSIONS) || '[]'));
  const [activeFace, setActiveFace] = useState(1);
  const [isRecording, setIsRecording] = useState(false);
  const [currentDuration, setCurrentDuration] = useState(0);
  const [btState, setBtState] = useState<BluetoothState>('disconnected');

  const timerRef = useRef<number | null>(null);
  const btServiceRef = useRef<BluetoothService | null>(null);

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FACES, JSON.stringify(faces));
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
  }, [faces, sessions]);

  const stopSession = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRecording(false);
    setSessions(prev => prev.map(s => s.endTime === null ? { ...s, endTime: Date.now() } : s));
  }, []);

  const startSession = useCallback((faceId: number) => {
    if (faceId === 1) {
      stopSession();
      setActiveFace(1);
      return;
    }
    stopSession();
    setIsRecording(true);
    setActiveFace(faceId);
    setCurrentDuration(0);
    
    const now = Date.now();
    const newSession: Session = { id: now.toString(), faceId, startTime: now, endTime: null, duration: 0 };
    
    setSessions(prev => {
      const cleaned = prev.map(s => s.endTime === null ? { ...s, endTime: now } : s);
      return [...cleaned, newSession];
    });

    timerRef.current = setInterval(() => {
      setCurrentDuration(d => d + 1);
      setSessions(prev => {
        const last = prev[prev.length - 1];
        if (last && last.endTime === null) {
          const updated = { ...last, duration: last.duration + 1 };
          return [...prev.slice(0, -1), updated];
        }
        return prev;
      });
    }, 1000);
  }, [stopSession]);

  useEffect(() => {
    btServiceRef.current = new BluetoothService(startSession, setBtState);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      btServiceRef.current?.disconnect();
    };
  }, [startSession]);

  // Stop session on Bluetooth disconnection
  useEffect(() => {
    if (btState === 'disconnected') {
      stopSession();
    }
  }, [btState, stopSession]);

  const pieData = useMemo(() => faces.map(f => ({
    name: f.label,
    value: Math.floor(sessions.filter(s => s.faceId === f.id).reduce((acc, s) => acc + s.duration, 0) / 60),
    color: f.color
  })).filter(d => d.value > 0), [faces, sessions]);

  const barData = useMemo(() => [...Array(7)].map((_, i) => {
    const d = new Date(); d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    return {
      date: dateStr.split('-').slice(1).join('/'),
      mins: Math.floor(sessions.filter(s => new Date(s.startTime).toISOString().split('T')[0] === dateStr).reduce((acc, s) => acc + s.duration, 0) / 60)
    };
  }).reverse(), [sessions]);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-950 text-white selection:bg-blue-500/30 safe-area-pt safe-area-pb">
      
      {/* Navigation - Sidebar for Desktop, Bottom Bar for Mobile */}
      <nav className="w-full md:w-64 bg-slate-900 md:p-6 p-2 flex flex-row md:flex-col justify-between border-t md:border-t-0 md:border-r border-slate-800 fixed bottom-0 md:relative z-50">
        <div className="flex-1 md:space-y-10 flex md:flex-col items-center md:items-stretch justify-around md:justify-start">
          <div className="hidden md:flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/20">
              <i className="fas fa-cube text-white"></i>
            </div>
            <h1 className="text-xl font-bold uppercase tracking-tighter">TimeCube</h1>
          </div>
          
          <div className="flex md:flex-col flex-1 justify-around md:space-y-1">
            {[
              { id: AppTab.DASHBOARD, icon: 'home', label: 'Home' },
              { id: AppTab.ANALYTICS, icon: 'chart-bar', label: 'History' },
              { id: AppTab.SETUP, icon: 'cog', label: 'Setup' }
            ].map(item => (
              <button 
                key={item.id} 
                onClick={() => setActiveTab(item.id)} 
                className={`flex flex-col md:flex-row items-center space-y-1 md:space-y-0 md:space-x-3 px-4 py-2 md:py-3 rounded-xl font-medium transition-all ${activeTab === item.id ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400'}`}
              >
                <i className={`fas fa-${item.icon} text-lg md:text-base`}></i>
                <span className="text-[10px] md:text-sm">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
        
        <button 
          onClick={() => btState === 'connected' ? btServiceRef.current?.disconnect() : btServiceRef.current?.connect()} 
          className={`hidden md:flex w-full p-4 rounded-xl font-bold text-sm transition-all border items-center justify-center space-x-2 ${
            btState === 'connected' ? 'bg-emerald-600 border-emerald-500' : 
            btState === 'connecting' ? 'bg-slate-800 border-slate-700 animate-pulse' : 
            'bg-slate-800 border-slate-700'
          }`}
        >
          <div className={`w-2 h-2 rounded-full ${btState === 'connected' ? 'bg-white animate-ping' : 'bg-slate-500'}`}></div>
          <span>{btState === 'connected' ? 'Connected' : 'Connect'}</span>
        </button>
      </nav>

      {/* Main View */}
      <main className="flex-1 p-4 md:p-10 pb-24 md:pb-10 overflow-y-auto">
        {activeTab === AppTab.DASHBOARD && (
          <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
            {/* Mobile Header */}
            <div className="md:hidden flex justify-between items-center mb-2">
              <h1 className="text-2xl font-black tracking-tighter">TimeCube</h1>
              <button 
                onClick={() => btState === 'connected' ? btServiceRef.current?.disconnect() : btServiceRef.current?.connect()}
                className={`p-2 px-4 rounded-full text-xs font-bold flex items-center space-x-2 ${btState === 'connected' ? 'bg-emerald-600' : 'bg-slate-800 border border-slate-700'}`}
              >
                <i className={`fas fa-bluetooth ${btState === 'connected' ? 'text-white' : 'text-slate-500'}`}></i>
                <span>{btState === 'connected' ? 'ON' : 'OFF'}</span>
              </button>
            </div>

            <StatsCards sessions={sessions} />
            
            <div className="grid lg:grid-cols-2 gap-6 md:gap-8">
              <div className="bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-3xl flex flex-col items-center relative overflow-hidden group">
                <CubeVisualizer activeFace={activeFace} faces={faces} />
                <TimerCard duration={currentDuration} />
                <StopButton onStop={stopSession} isRecording={isRecording} />
              </div>
              
              <SessionPieChart data={pieData} />
            </div>
          </div>
        )}

        {activeTab === AppTab.ANALYTICS && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-3xl font-black">History</h2>
                <p className="text-slate-400 text-sm">Review focus trends</p>
              </div>
              <ExportButton sessions={sessions} faces={faces} />
            </div>
            <HistoryBarChart data={barData} />
          </div>
        )}

        {activeTab === AppTab.SETUP && (
          <div className="max-w-2xl mx-auto">
            <Settings faces={faces} onUpdateFace={(id, label) => setFaces(f => f.map(x => x.id === id ? {...x, label} : x))} />
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
