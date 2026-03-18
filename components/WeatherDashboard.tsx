'use client';

import {useState, useEffect} from 'react';
import axios from 'axios';
import WeatherCard from './WeatherCard';
import ForecastChart from './ForecastChart';
import WeatherMap from './WeatherMap';
import HistoricalWeather from './HistoricalWeather';
import SevereWeather from './SevereWeather';
import AlertManager from './AlertManager';
import AdBanner from './AdBanner';
import { Map as MapIcon, LineChart, Bell, CloudSun, AlertTriangle, X } from 'lucide-react';

export default function WeatherDashboard() {
  const [data, setData] = useState<any>(null);
  const [city, setCity] = useState('London');
  const [searchInput, setSearchInput] = useState('London');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('current');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedCity, setSelectedCity] = useState<any>(null);
  const [unit, setUnit] = useState<'metric' | 'imperial'>('metric');

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchInput.trim().length < 2) {
        setSuggestions([]);
        return;
      }
      try {
        const res = await axios.get(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchInput)}&count=5`);
        if (res.data.results) {
          setSuggestions(res.data.results);
        } else {
          setSuggestions([]);
        }
      } catch (err) {
        console.error('Failed to fetch suggestions', err);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchInput]);

  const fetchWeather = async (searchCity: string, lat?: number, lon?: number, currentUnit: string = unit) => {
    if (!searchCity.trim()) return;
    setLoading(true);
    setError(null);
    try {
      let url = `/api/weather?city=${encodeURIComponent(searchCity)}&unit=${currentUnit}`;
      if (lat !== undefined && lon !== undefined) {
        url += `&lat=${lat}&lon=${lon}`;
      }
      const response = await axios.get(url);
      setData(response.data);
      setCity(searchCity);
    } catch (err: any) {
      console.error('Error fetching weather:', err);
      if (err.response?.status === 404) {
        setError(`City "${searchCity}" not found. Please try another name.`);
      } else {
        setError('Failed to fetch weather data. Please try again later.');
      }
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (city) {
      if (selectedCity && city === `${selectedCity.name}${selectedCity.admin1 ? `, ${selectedCity.admin1}` : ''}, ${selectedCity.country}`) {
        fetchWeather(city, selectedCity.latitude, selectedCity.longitude, unit);
      } else {
        fetchWeather(city, undefined, undefined, unit);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unit]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCity && searchInput === `${selectedCity.name}${selectedCity.admin1 ? `, ${selectedCity.admin1}` : ''}, ${selectedCity.country}`) {
      fetchWeather(searchInput, selectedCity.latitude, selectedCity.longitude);
    } else {
      fetchWeather(searchInput);
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 dark:bg-stone-950 p-4 md:p-8 transition-colors">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h1 className="text-4xl font-bold text-stone-900 dark:text-stone-50">WeatherTime Pro</h1>
          <div className="flex items-center bg-white dark:bg-stone-900 rounded-full p-1 shadow-sm border border-stone-200 dark:border-stone-800">
            <button
              onClick={() => setUnit('metric')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${unit === 'metric' ? 'bg-stone-900 text-white dark:bg-stone-50 dark:text-stone-900' : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'}`}
            >
              °C / m/s
            </button>
            <button
              onClick={() => setUnit('imperial')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${unit === 'imperial' ? 'bg-stone-900 text-white dark:bg-stone-50 dark:text-stone-900' : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'}`}
            >
              °F / mph
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSearch} className="mb-8 flex gap-2 relative z-50">
          <div className="relative w-full max-w-md">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                setSelectedCity(null);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder="Search for a city (e.g., Tokyo, New York)..."
              className="w-full p-4 pr-12 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-stone-900 dark:focus:ring-stone-500"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput('');
                  setSuggestions([]);
                  setSelectedCity(null);
                  setShowSuggestions(false);
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
              >
                <X size={20} />
              </button>
            )}
            
            {showSuggestions && suggestions.length > 0 && (
              <ul className="absolute z-10 w-full mt-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl shadow-lg overflow-hidden">
                {suggestions.map((city: any) => (
                  <li key={city.id}>
                    <button
                      type="button"
                      className="w-full text-left px-4 py-3 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-900 dark:text-stone-100 transition-colors"
                      onClick={() => {
                        const fullName = `${city.name}${city.admin1 ? `, ${city.admin1}` : ''}, ${city.country}`;
                        setSearchInput(fullName);
                        setSelectedCity(city);
                        setShowSuggestions(false);
                        fetchWeather(fullName, city.latitude, city.longitude);
                      }}
                    >
                      <span className="font-medium">{city.name}</span>
                      <span className="text-stone-500 dark:text-stone-400 text-sm ml-2">
                        {city.admin1 ? `${city.admin1}, ` : ''}{city.country}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <button 
            type="submit"
            disabled={loading}
            className="px-6 py-4 bg-stone-900 dark:bg-stone-50 text-white dark:text-stone-900 rounded-xl font-bold hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>

        {loading && <p className="text-stone-500 dark:text-stone-400">Loading weather data...</p>}
        {error && <p className="text-red-500 dark:text-red-400">{error}</p>}

        <AdBanner dataAdSlot="1234567890" />

        {data && !loading && (
          <>
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              <TabButton active={activeTab === 'current'} onClick={() => setActiveTab('current')} icon={<CloudSun size={18} />} label="Current & Forecast" />
              <TabButton active={activeTab === 'map'} onClick={() => setActiveTab('map')} icon={<MapIcon size={18} />} label="Interactive Map" />
              <TabButton active={activeTab === 'historical'} onClick={() => setActiveTab('historical')} icon={<LineChart size={18} />} label="Historical Data" />
              <TabButton active={activeTab === 'alerts'} onClick={() => setActiveTab('alerts')} icon={<Bell size={18} />} label="Alerts" />
              <TabButton active={activeTab === 'severe'} onClick={() => setActiveTab('severe')} icon={<AlertTriangle size={18} />} label="Severe Weather" />
            </div>

            <div className="mt-6">
              {activeTab === 'current' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <WeatherCard weather={data.current} unit={unit} />
                  <ForecastChart data={data.forecast.list.slice(0, 24).map((item: any) => ({
                    time: new Date(item.dt * 1000).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}),
                    temp: item.main.temp,
                    precipitation_probability: item.precipitation_probability,
                  }))} unit={unit} />
                </div>
              )}
              
              {activeTab === 'map' && (
                <WeatherMap lat={data.current.coord.lat} lon={data.current.coord.lon} />
              )}

              {activeTab === 'historical' && (
                <HistoricalWeather city={data.current.name} unit={unit} />
              )}

              {activeTab === 'alerts' && (
                <AlertManager currentWeather={data.current} unit={unit} />
              )}
              {activeTab === 'severe' && (
                <SevereWeather city={data.current.name} />
              )}
            </div>
            
            <AdBanner dataAdSlot="0987654321" />
          </>
        )}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium whitespace-nowrap transition-colors ${
        active 
          ? 'bg-stone-900 dark:bg-stone-50 text-white dark:text-stone-900' 
          : 'bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-800'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
