'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { AlertTriangle, Info, MapPin, ExternalLink, Clock } from 'lucide-react';
import { motion } from 'motion/react';

export default function SevereWeather({ city }: { city: string }) {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAlerts = async () => {
      setLoading(true);
      setError(null);
      try {
        // 1. Geocode city
        const geoRes = await axios.get(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`);
        if (!geoRes.data.results?.length) {
          setError(`City "${city}" not found.`);
          return;
        }
        const { latitude, longitude, country_code } = geoRes.data.results[0];
        
        if (country_code !== 'US') {
          setError('Severe weather alerts are only available for US locations.');
          return;
        }

        // 2. Fetch alerts from NWS API (US only)
        // Note: NWS API is US-specific.
        const lat = latitude.toFixed(4);
        const lon = longitude.toFixed(4);
        const alertsRes = await axios.get(`https://api.weather.gov/alerts/active?point=${lat},${lon}`, {
          headers: {
            'User-Agent': 'WeatherTimePro/1.0'
          }
        });
        
        const features = alertsRes.data.features;
        const formattedAlerts = features.map((feature: any) => ({
          id: feature.id,
          event: feature.properties.event,
          severity: feature.properties.severity,
          description: feature.properties.description,
          instruction: feature.properties.instruction,
          effective: feature.properties.effective,
          expires: feature.properties.expires,
          areaDesc: feature.properties.areaDesc,
          web: feature.properties.web,
        }));
        setAlerts(formattedAlerts);
      } catch (err: any) {
        console.error('Failed to fetch alerts', err);
        setError('Failed to load severe weather alerts. (Note: This feature currently supports US locations only).');
      } finally {
        setLoading(false);
      }
    };
    fetchAlerts();
  }, [city]);

  return (
    <div className="bg-white dark:bg-stone-900 p-6 rounded-3xl shadow-sm border border-stone-100 dark:border-stone-800">
      <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-50 mb-6 flex items-center gap-2">
        <AlertTriangle className="text-red-500" />
        Severe Weather Outlook
      </h2>
      
      {loading ? <p className="text-stone-500 dark:text-stone-400">Loading alerts...</p> : error ? <p className="text-red-500 dark:text-red-400">{error}</p> : alerts.length === 0 ? (
        <p className="text-stone-500 dark:text-stone-400">No severe weather alerts for {city} at this time.</p>
      ) : (
        <div className="space-y-6">
          {alerts.map(alert => (
            <motion.div 
              key={alert.id} 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-100 dark:border-red-900/30"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-red-700 dark:text-red-400">{alert.event}</span>
                  <span className="text-xs bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200 px-2 py-0.5 rounded-full">{alert.severity}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-stone-500 dark:text-stone-400">
                  <Clock size={14} />
                  <span>Expires: {new Date(alert.expires).toLocaleTimeString()}</span>
                </div>
              </div>
              <p className="text-stone-700 dark:text-stone-300 mb-3 text-sm">{alert.description}</p>
              <div className="text-xs text-stone-600 dark:text-stone-400 mb-3 bg-red-100/50 dark:bg-red-900/10 p-2 rounded-lg">
                <p className="font-semibold">Area:</p>
                <p>{alert.areaDesc}</p>
              </div>
              {alert.instruction && (
                <div className="flex gap-2 text-sm text-red-800 dark:text-red-300 bg-red-100 dark:bg-red-900/30 p-3 rounded-xl mb-3">
                  <Info size={18} className="shrink-0" />
                  <p><strong>Advice:</strong> {alert.instruction}</p>
                </div>
              )}
              {alert.web && (
                <a href={alert.web} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline">
                  <ExternalLink size={14} />
                  Official Advisory
                </a>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
