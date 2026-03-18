'use client';
import { useState, useEffect } from 'react';
import { Bell, BellOff, Trash2, X } from 'lucide-react';

type AlertRule = {
  id: string;
  metric: 'temp' | 'wind' | 'condition' | 'uv' | 'aqi';
  condition: 'greater' | 'less' | 'equals';
  value: string | number;
};

export default function AlertManager({ currentWeather, unit }: { currentWeather: any, unit: string }) {
  const [rules, setRules] = useState<AlertRule[]>([]);
  const [metric, setMetric] = useState<'temp' | 'wind' | 'condition' | 'uv' | 'aqi'>('temp');
  const [condition, setCondition] = useState<'greater' | 'less' | 'equals'>('greater');
  const [value, setValue] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [toasts, setToasts] = useState<{id: string, message: string}[]>([]);

  const tempUnit = unit === 'imperial' ? '°F' : '°C';
  const windUnit = unit === 'imperial' ? 'mph' : 'm/s';

  useEffect(() => {
    const saved = localStorage.getItem('weather_alerts');
    if (saved) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRules(JSON.parse(saved));
    }
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationsEnabled(Notification.permission === 'granted');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('weather_alerts', JSON.stringify(rules));
  }, [rules]);

  useEffect(() => {
    if (!currentWeather) return;

    rules.forEach(rule => {
      let triggered = false;
      let message = '';

      if (rule.metric === 'temp') {
        const temp = currentWeather.main.temp;
        const val = Number(rule.value);
        if (rule.condition === 'greater' && temp > val) { triggered = true; message = `Temperature is above ${val}${tempUnit} (${temp}${tempUnit})`; }
        if (rule.condition === 'less' && temp < val) { triggered = true; message = `Temperature is below ${val}${tempUnit} (${temp}${tempUnit})`; }
      } else if (rule.metric === 'wind') {
        const wind = currentWeather.wind.speed;
        const val = Number(rule.value);
        if (rule.condition === 'greater' && wind > val) { triggered = true; message = `Wind speed is above ${val}${windUnit} (${wind}${windUnit})`; }
      } else if (rule.metric === 'condition') {
        const cond = currentWeather.weather[0].main.toLowerCase();
        const val = String(rule.value).toLowerCase();
        if (rule.condition === 'equals' && cond.includes(val)) { triggered = true; message = `Weather condition is ${cond}`; }
      } else if (rule.metric === 'uv') {
        const uv = currentWeather.uvIndex;
        const val = Number(rule.value);
        if (rule.condition === 'greater' && uv > val) { triggered = true; message = `UV Index is above ${val} (${uv})`; }
      } else if (rule.metric === 'aqi') {
        const aqi = currentWeather.airQuality?.aqi;
        const val = Number(rule.value);
        if (rule.condition === 'greater' && aqi > val) { triggered = true; message = `Air Quality Index is above ${val} (${aqi})`; }
      }

      if (triggered) {
        const toastId = Date.now().toString() + Math.random();
        if (notificationsEnabled && 'Notification' in window && Notification.permission === 'granted') {
          try {
            new Notification('Weather Alert', { body: message });
          } catch (e) {
            setToasts(prev => [...prev, { id: toastId, message }]);
          }
        } else {
          setToasts(prev => [...prev, { id: toastId, message }]);
        }
        
        // Auto remove toast after 5s
        setTimeout(() => {
          setToasts(prev => prev.filter(t => t.id !== toastId));
        }, 5000);
      }
    });
  }, [currentWeather, rules, notificationsEnabled, tempUnit, windUnit]);

  const requestPermission = async () => {
    if (!('Notification' in window)) return alert('Browser does not support notifications');
    try {
      const perm = await Notification.requestPermission();
      setNotificationsEnabled(perm === 'granted');
    } catch (e) {
      alert('Could not request notification permission in this environment.');
    }
  };

  const addRule = () => {
    if (!value) return;
    setRules([...rules, { id: Date.now().toString(), metric, condition, value }]);
    setValue('');
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Weather Alerts</h2>
        <button
          onClick={requestPermission}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${notificationsEnabled ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-700'}`}
        >
          {notificationsEnabled ? <Bell size={16} /> : <BellOff size={16} />}
          {notificationsEnabled ? 'Push Active' : 'Enable Push'}
        </button>
      </div>

      <div className="flex flex-wrap gap-4 mb-6 items-end">
        <div>
          <label className="block text-sm text-stone-500 mb-1">Metric</label>
          <select value={metric} onChange={(e: any) => setMetric(e.target.value)} className="p-2 border rounded-lg bg-white">
            <option value="temp">Temperature ({tempUnit})</option>
            <option value="wind">Wind Speed ({windUnit})</option>
            <option value="condition">Condition (e.g., Rain)</option>
            <option value="uv">UV Index</option>
            <option value="aqi">Air Quality (AQI)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-stone-500 mb-1">Condition</label>
          <select value={condition} onChange={(e: any) => setCondition(e.target.value)} className="p-2 border rounded-lg bg-white">
            <option value="greater">Greater Than</option>
            <option value="less">Less Than</option>
            <option value="equals">Equals</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-stone-500 mb-1">Value</label>
          <input type="text" value={value} onChange={e => setValue(e.target.value)} className="p-2 border rounded-lg w-32" placeholder="e.g. 30" />
        </div>
        <button onClick={addRule} className="bg-stone-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-stone-800">Add Alert</button>
      </div>

      <div className="space-y-3">
        {rules.map(rule => (
          <div key={rule.id} className="flex justify-between items-center p-3 bg-stone-50 rounded-lg border border-stone-100">
            <span>Alert when <strong>{rule.metric}</strong> is <strong>{rule.condition}</strong> <strong>{rule.value}</strong></span>
            <button onClick={() => setRules(rules.filter(r => r.id !== rule.id))} className="text-red-500 hover:bg-red-50 p-2 rounded-lg">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
        {rules.length === 0 && <p className="text-stone-500 text-sm">No active alerts.</p>}
      </div>

      {/* Toasts Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map(toast => (
          <div key={toast.id} className="bg-stone-900 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 transition-all">
            <Bell size={18} className="text-yellow-400" />
            <span>{toast.message}</span>
            <button onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))} className="text-stone-400 hover:text-white">
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
