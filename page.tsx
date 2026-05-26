'use client';

import { useState, useEffect } from 'react';
import { 
  Server, Play, Square, Settings, Users, MapPin, 
  Clock, Power, Globe, Shield, Zap, ChevronDown, ChevronUp 
} from 'lucide-react';

interface ServerConfig {
  name: string;
  map: string;
  maxPlayers: number;
  gameMode: string;
  region: string;
  autoShutdown: boolean;
  idleTimeout: number;
  password: string;
  rconPassword: string;
}

interface ServerStatus {
  status: 'stopped' | 'starting' | 'running' | 'stopping' | 'error';
  players: number;
  maxPlayers: number;
  map: string;
  uptime: string;
  ip: string;
  port: number;
  error?: string;
}

const maps = [
  'de_dust2', 'de_mirage', 'de_inferno', 'de_nuke', 
  'de_overpass', 'de_vertigo', 'de_anubis', 'de_ancient',
  'de_train', 'cs_office', 'cs_italy'
];

const gameModes = [
  { value: 'casual', label: 'Casual', mode: 0, type: 0 },
  { value: 'competitive', label: 'Competitive', mode: 1, type: 0 },
  { value: 'deathmatch', label: 'Deathmatch', mode: 2, type: 1 },
  { value: 'wingman', label: 'Wingman', mode: 2, type: 0 },
  { value: 'armsrace', label: 'Arms Race', mode: 0, type: 1 },
  { value: 'demolition', label: 'Demolition', mode: 1, type: 1 }
];

export default function Dashboard() {
  const [config, setConfig] = useState<ServerConfig>({
    name: 'My Free CS2 Server',
    map: 'de_dust2',
    maxPlayers: 14,
    gameMode: 'casual',
    region: 'us-east',
    autoShutdown: false,
    idleTimeout: 30,
    password: '',
    rconPassword: ''
  });

  const [status, setStatus] = useState<ServerStatus>({
    status: 'stopped',
    players: 0,
    maxPlayers: 14,
    map: 'de_dust2',
    uptime: '0m',
    ip: '',
    port: 27015
  });

  const [loading, setLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'logs'>('dashboard');

  const addLog = (msg: string) => {
    setLogs(prev => [...prev.slice(-49), `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const startServer = async () => {
    setLoading(true);
    addLog('Starting server...');
    try {
      const res = await fetch('/api/server/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      const data = await res.json();

      if (res.ok) {
        setStatus(prev => ({ ...prev, status: 'starting' }));
        addLog('Server start command sent successfully');
        pollStatus();
      } else {
        setStatus(prev => ({ ...prev, status: 'error', error: data.error }));
        addLog(`Error: ${data.error}`);
      }
    } catch (err) {
      addLog(`Failed to start: ${err}`);
      setStatus(prev => ({ ...prev, status: 'error', error: String(err) }));
    }
    setLoading(false);
  };

  const stopServer = async () => {
    setLoading(true);
    addLog('Stopping server...');
    try {
      const res = await fetch('/api/server/stop', { method: 'POST' });
      const data = await res.json();

      if (res.ok) {
        setStatus(prev => ({ ...prev, status: 'stopping' }));
        addLog('Server stop command sent');
      } else {
        addLog(`Error stopping: ${data.error}`);
      }
    } catch (err) {
      addLog(`Failed to stop: ${err}`);
    }
    setLoading(false);
  };

  const pollStatus = () => {
    let attempts = 0;
    const maxAttempts = 60;

    const interval = setInterval(async () => {
      attempts++;
      try {
        const res = await fetch('/api/server/status');
        const data = await res.json();
        setStatus(data);

        if (data.status === 'running') {
          addLog('Server is now running!');
          clearInterval(interval);
        } else if (data.status === 'stopped') {
          addLog('Server stopped');
          clearInterval(interval);
        } else if (attempts >= maxAttempts) {
          addLog('Timeout waiting for server start');
          clearInterval(interval);
        }
      } catch (err) {
        addLog(`Status check failed: ${err}`);
      }
    }, 5000);
  };

  useEffect(() => {
    fetch('/api/server/status')
      .then(r => r.json())
      .then(data => {
        setStatus(data);
        if (data.status !== 'stopped') addLog(`Initial status: ${data.status}`);
      })
      .catch(() => addLog('Could not fetch initial status'));
  }, []);

  const getStatusColor = () => {
    switch (status.status) {
      case 'running': return 'bg-green-500';
      case 'starting': return 'bg-yellow-500 animate-pulse';
      case 'stopping': return 'bg-orange-500 animate-pulse';
      case 'error': return 'bg-red-500';
      default: return 'bg-slate-500';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans">
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-orange-500 to-red-600 p-2 rounded-lg">
              <Server className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                FSHOST <span className="text-orange-500">CS2</span>
              </h1>
              <p className="text-xs text-slate-400">Free Counter-Strike 2 Server Hosting</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-full border border-slate-700">
              <div className={`w-2.5 h-2.5 rounded-full ${getStatusColor()}`} />
              <span className="text-sm font-medium capitalize">{status.status}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-4 mb-6">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'dashboard' ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'logs' ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Logs ({logs.length})
          </button>
        </div>

        {activeTab === 'dashboard' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl">
                <div className="flex items-center gap-2 mb-6">
                  <Settings className="w-5 h-5 text-orange-500" />
                  <h2 className="text-lg font-semibold">Server Configuration</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-400">Server Name</label>
                    <input 
                      type="text" 
                      value={config.name}
                      onChange={e => setConfig({...config, name: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                      placeholder="My Awesome CS2 Server"
                      disabled={status.status === 'running' || status.status === 'starting'}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-400">Max Players</label>
                    <select 
                      value={config.maxPlayers}
                      onChange={e => setConfig({...config, maxPlayers: Number(e.target.value)})}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 transition-all"
                      disabled={status.status === 'running' || status.status === 'starting'}
                    >
                      {[10, 12, 14, 16, 20].map(n => (
                        <option key={n} value={n}>{n} players</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-400">Starting Map</label>
                    <select 
                      value={config.map}
                      onChange={e => setConfig({...config, map: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 transition-all"
                      disabled={status.status === 'running' || status.status === 'starting'}
                    >
                      {maps.map(map => (
                        <option key={map} value={map}>
                          {map.replace('de_', '').replace('cs_', '').toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-400">Game Mode</label>
                    <select 
                      value={config.gameMode}
                      onChange={e => setConfig({...config, gameMode: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 transition-all"
                      disabled={status.status === 'running' || status.status === 'starting'}
                    >
                      {gameModes.map(mode => (
                        <option key={mode.value} value={mode.value}>{mode.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-6">
                  <button 
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="flex items-center gap-2 text-sm text-orange-400 hover:text-orange-300 transition-colors"
                  >
                    {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    {showAdvanced ? 'Hide' : 'Show'} Advanced Options
                  </button>

                  {showAdvanced && (
                    <div className="mt-4 space-y-4 bg-slate-950 rounded-xl p-5 border border-slate-800">
                      <div className="flex items-center justify-between p-3 bg-slate-900 rounded-lg">
                        <div>
                          <p className="font-medium flex items-center gap-2">
                            <Zap className="w-4 h-4 text-yellow-500" />
                            Auto-Shutdown
                          </p>
                          <p className="text-sm text-slate-400 mt-1">
                            Stop server when empty to save resources
                          </p>
                        </div>
                        <button 
                          onClick={() => setConfig({...config, autoShutdown: !config.autoShutdown})}
                          className={`relative w-14 h-7 rounded-full transition-colors ${
                            config.autoShutdown ? 'bg-orange-500' : 'bg-slate-700'
                          }`}
                        >
                          <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full transition-transform ${
                            config.autoShutdown ? 'translate-x-7' : 'translate-x-0.5'
                          }`} />
                        </button>
                      </div>

                      {config.autoShutdown && (
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-400">
                            Shutdown after idle (minutes)
                          </label>
                          <input 
                            type="number" 
                            value={config.idleTimeout}
                            onChange={e => setConfig({...config, idleTimeout: Math.max(5, Math.min(120, Number(e.target.value)))})}
                            min="5"
                            max="120"
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3"
                          />
                          <p className="text-xs text-slate-500">
                            Server will stop if no players are connected for this duration
                          </p>
                        </div>
                      )}

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
                          <Shield className="w-4 h-4" />
                          Server Password (optional)
                        </label>
                        <input 
                          type="password" 
                          value={config.password}
                          onChange={e => setConfig({...config, password: e.target.value})}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3"
                          placeholder="Leave empty for public server"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-400">
                          RCON Password
                        </label>
                        <input 
                          type="password" 
                          value={config.rconPassword}
                          onChange={e => setConfig({...config, rconPassword: e.target.value})}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3"
                          placeholder="Admin access password"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-4">
                {status.status === 'stopped' || status.status === 'error' ? (
                  <button 
                    onClick={startServer}
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 disabled:from-slate-700 disabled:to-slate-600 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02] disabled:transform-none shadow-lg shadow-green-900/20"
                  >
                    <Play className="w-6 h-6 fill-current" />
                    {loading ? 'Starting Server...' : 'Start Server'}
                  </button>
                ) : (
                  <button 
                    onClick={stopServer}
                    disabled={loading || status.status === 'stopping'}
                    className="flex-1 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 disabled:from-slate-700 disabled:to-slate-600 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02] disabled:transform-none shadow-lg shadow-red-900/20"
                  >
                    <Square className="w-6 h-6 fill-current" />
                    {loading ? 'Stopping...' : 'Stop Server'}
                  </button>
                )}
              </div>

              {status.status === 'running' && (
                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-center">
                  <p className="text-green-400 font-medium">
                    Server is running! Connect via CS2 console:
                  </p>
                  <code className="block mt-2 text-lg font-mono bg-slate-950 rounded-lg py-2 px-4 text-white">
                    connect {status.ip || 'YOUR_IP'}:{status.port}
                  </code>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl">
                <div className="flex items-center gap-2 mb-6">
                  <Power className="w-5 h-5 text-orange-500" />
                  <h2 className="text-lg font-semibold">Live Status</h2>
                </div>

                <div className="space-y-3">
                  <StatusCard 
                    icon={<Users className="w-4 h-4" />}
                    label="Players"
                    value={`${status.players}/${status.maxPlayers}`}
                    active={status.players > 0}
                  />
                  <StatusCard 
                    icon={<MapPin className="w-4 h-4" />}
                    label="Current Map"
                    value={status.map.replace('de_', '').toUpperCase()}
                  />
                  <StatusCard 
                    icon={<Clock className="w-4 h-4" />}
                    label="Uptime"
                    value={status.uptime}
                  />
                  <StatusCard 
                    icon={<Globe className="w-4 h-4" />}
                    label="Port"
                    value={`${status.port}`}
                  />
                  <StatusCard 
                    icon={<Zap className="w-4 h-4" />}
                    label="Auto-Shutdown"
                    value={config.autoShutdown ? `${config.idleTimeout}min` : 'Disabled'}
                    active={config.autoShutdown}
                  />
                </div>

                {status.ip && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-xl border border-orange-500/30">
                    <p className="text-sm text-orange-400 mb-2 font-medium">Quick Connect</p>
                    <div className="flex items-center gap-2 bg-slate-950 rounded-lg p-3">
                      <code className="text-sm font-mono text-white flex-1">
                        {status.ip}:{status.port}
                      </code>
                      <button 
                        onClick={() => navigator.clipboard.writeText(`connect ${status.ip}:${status.port}`)}
                        className="text-xs bg-orange-500 hover:bg-orange-400 text-white px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700">
                <h3 className="font-bold text-lg mb-4 text-orange-400">Free Tier Features</h3>
                <ul className="space-y-3 text-sm">
                  <FeatureItem icon="✓" text="Up to 14 players" />
                  <FeatureItem icon="✓" text="All official maps" />
                  <FeatureItem icon="✓" text="Casual & Competitive modes" />
                  <FeatureItem icon="✓" text="Optional auto-shutdown" />
                  <FeatureItem icon="✓" text="RCON admin access" />
                  <FeatureItem icon="✓" text="Password protection option" />
                </ul>

                <div className="mt-4 pt-4 border-t border-slate-700">
                  <p className="text-xs text-slate-500">
                    Powered by your own infrastructure via Coolify
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
            <div className="p-4 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
              <h2 className="font-semibold flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-500" />
                Server Logs
              </h2>
              <button 
                onClick={() => setLogs([])}
                className="text-xs text-slate-400 hover:text-white transition-colors"
              >
                Clear
              </button>
            </div>
            <div className="p-4 h-96 overflow-y-auto font-mono text-sm space-y-1">
              {logs.length === 0 ? (
                <p className="text-slate-500 italic">No logs yet...</p>
              ) : (
                logs.map((log, i) => (
                  <div key={i} className="text-slate-300 hover:text-white transition-colors">
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function StatusCard({ icon, label, value, active = false }: { 
  icon: React.ReactNode; 
  label: string; 
  value: string; 
  active?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between p-3 rounded-xl transition-colors ${
      active ? 'bg-orange-500/10 border border-orange-500/30' : 'bg-slate-950 border border-slate-800'
    }`}>
      <div className="flex items-center gap-2 text-slate-400">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      <span className={`font-mono font-bold ${active ? 'text-orange-400' : 'text-white'}`}>
        {value}
      </span>
    </div>
  );
}

function FeatureItem({ icon, text }: { icon: string; text: string }) {
  return (
    <li className="flex items-center gap-3">
      <span className="text-green-500 font-bold">{icon}</span>
      <span className="text-slate-300">{text}</span>
    </li>
  );
}
