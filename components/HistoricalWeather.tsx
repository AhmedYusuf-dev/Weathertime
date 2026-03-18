'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { format, subDays } from 'date-fns';

export default function HistoricalWeather({ city, unit }: { city: string, unit: string }) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState(format(subDays(new Date(), 7), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(subDays(new Date(), 1), 'yyyy-MM-dd'));

  const tempUnit = unit === 'imperial' ? '°F' : '°C';
  const precipUnit = unit === 'imperial' ? 'in' : 'mm';

  const setRange = (days: number) => {
    setStartDate(format(subDays(new Date(), days), 'yyyy-MM-dd'));
    setEndDate(format(subDays(new Date(), 1), 'yyyy-MM-dd'));
  };

  useEffect(() => {
    const fetchHistorical = async () => {
      setLoading(true);
      setError(null);
      try {
        // 1. Geocode city using Open-Meteo (free, no API key required)
        const geoRes = await axios.get(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`);
        if (!geoRes.data.results?.length) {
          setError(`City "${city}" not found for historical data.`);
          return;
        }
        const { latitude, longitude } = geoRes.data.results[0];

        const tempUnitParam = unit === 'imperial' ? '&temperature_unit=fahrenheit' : '';
        const windUnitParam = unit === 'imperial' ? '&wind_speed_unit=mph' : '&wind_speed_unit=ms';
        const precipUnitParam = unit === 'imperial' ? '&precipitation_unit=inch' : '';

        // 2. Fetch historical data
        const histRes = await axios.get(`https://archive-api.open-meteo.com/v1/archive?latitude=${latitude}&longitude=${longitude}&start_date=${startDate}&end_date=${endDate}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max&timezone=auto${tempUnitParam}${windUnitParam}${precipUnitParam}`);

        const daily = histRes.data.daily;
        if (daily && daily.time) {
          const formattedData = daily.time.map((time: string, i: number) => ({
            date: time,
            tempMax: daily.temperature_2m_max[i],
            tempMin: daily.temperature_2m_min[i],
            precip: daily.precipitation_sum[i],
            wind: daily.wind_speed_10m_max[i],
          }));
          setData(formattedData);
        }
      } catch (err: any) {
        console.error('Failed to fetch historical data', err);
        setError('Failed to load historical weather data.');
      } finally {
        setLoading(false);
      }
    };
    fetchHistorical();
  }, [city, startDate, endDate, unit]);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm">
      <h2 className="text-2xl font-semibold mb-4">Historical Weather for {city}</h2>
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex gap-2 mb-2 w-full">
          <button onClick={() => setRange(7)} className="px-3 py-1 bg-stone-200 rounded-lg text-sm">Last Week</button>
          <button onClick={() => setRange(30)} className="px-3 py-1 bg-stone-200 rounded-lg text-sm">Last Month</button>
          <button onClick={() => setRange(365)} className="px-3 py-1 bg-stone-200 rounded-lg text-sm">Last Year</button>
        </div>
        <div>
          <label className="block text-sm text-stone-500 mb-1">Start Date</label>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="p-2 border rounded-lg" max={endDate} />
        </div>
        <div>
          <label className="block text-sm text-stone-500 mb-1">End Date</label>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="p-2 border rounded-lg" max={format(subDays(new Date(), 1), 'yyyy-MM-dd')} />
        </div>
      </div>

      {loading ? <p className="text-stone-500">Loading historical data...</p> : error ? <p className="text-red-500">{error}</p> : (
        <div className="space-y-8">
          <div className="h-72">
            <h3 className="text-lg font-medium mb-2">Temperature ({tempUnit})</h3>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="tempMax" name="Max Temp" stroke="#ef4444" strokeWidth={2} />
                <Line type="monotone" dataKey="tempMin" name="Min Temp" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="h-72">
            <h3 className="text-lg font-medium mb-2">Precipitation ({precipUnit})</h3>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="precip" name="Precipitation" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
