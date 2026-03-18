import { Droplets, Wind, Sun, AirVent, Eye, Gauge, Cloud, CloudRain, CloudLightning, Snowflake, CloudFog, Moon } from 'lucide-react';
import { motion } from 'motion/react';

export default function WeatherCard({weather, unit}: {weather: any, unit: string}) {
  const tempUnit = unit === 'imperial' ? '°F' : '°C';
  const windUnit = unit === 'imperial' ? 'mph' : 'm/s';

  const getWeatherIcon = (code: number) => {
    if (code >= 200 && code < 300) return <CloudLightning size={48} className="text-yellow-500" />;
    if (code >= 300 && code < 600) return <CloudRain size={48} className="text-blue-500" />;
    if (code >= 600 && code < 700) return <Snowflake size={48} className="text-sky-300" />;
    if (code >= 700 && code < 800) return <CloudFog size={48} className="text-stone-400" />;
    if (code === 800) return <Sun size={48} className="text-orange-500" />;
    return <Cloud size={48} className="text-stone-400" />;
  };

  const getAQIDesc = (aqi: number) => {
    if (aqi <= 50) return { label: 'Good', color: 'text-emerald-500' };
    if (aqi <= 100) return { label: 'Moderate', color: 'text-yellow-500' };
    if (aqi <= 150) return { label: 'Unhealthy for Sensitive Groups', color: 'text-orange-500' };
    return { label: 'Unhealthy', color: 'text-red-500' };
  };

  const getWindDirection = (deg: number) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    return directions[Math.round(deg / 45) % 8];
  };

  const aqiInfo = getAQIDesc(weather.airQuality?.aqi || 0);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-stone-900 p-8 rounded-3xl shadow-sm border border-stone-100 dark:border-stone-800"
    >
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold text-stone-900 dark:text-stone-50">{weather.name}</h2>
          <p className="text-stone-500 dark:text-stone-400 text-lg mt-1 capitalize">{weather.weather[0].description}</p>
          <p className="text-stone-400 dark:text-stone-500 text-sm mt-1">Feels like {Math.round(weather.main.feels_like)}{tempUnit}</p>
        </div>
        <div className="text-right flex flex-col items-end gap-2">
          {getWeatherIcon(weather.weather[0].id)}
          <p className="text-7xl font-black text-stone-900 dark:text-stone-50 tracking-tighter">{Math.round(weather.main.temp)}{tempUnit}</p>
        </div>
      </div>

      <div className="mt-10 grid grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="flex items-center gap-3 p-4 bg-stone-50 dark:bg-stone-800 rounded-2xl">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
            <Droplets size={20} />
          </div>
          <div>
            <p className="text-xs text-stone-500 dark:text-stone-400 font-medium uppercase tracking-wider">Humidity</p>
            <p className="text-lg font-bold text-stone-900 dark:text-stone-100">{weather.main.humidity}%</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 bg-stone-50 dark:bg-stone-800 rounded-2xl">
          <div className="p-2 bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300 rounded-lg">
            <Wind size={20} />
          </div>
          <div>
            <p className="text-xs text-stone-500 dark:text-stone-400 font-medium uppercase tracking-wider">Wind</p>
            <p className="text-lg font-bold text-stone-900 dark:text-stone-100">{weather.wind.speed} {windUnit} {getWindDirection(weather.wind.deg)}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 bg-stone-50 dark:bg-stone-800 rounded-2xl">
          <div className="p-2 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-lg">
            <Sun size={20} />
          </div>
          <div>
            <p className="text-xs text-stone-500 dark:text-stone-400 font-medium uppercase tracking-wider">UV Index</p>
            <p className="text-lg font-bold text-stone-900 dark:text-stone-100">{weather.uvIndex}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 bg-stone-50 dark:bg-stone-800 rounded-2xl">
          <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg">
            <AirVent size={20} />
          </div>
          <div>
            <p className="text-xs text-stone-500 dark:text-stone-400 font-medium uppercase tracking-wider">Air Quality</p>
            <p className={`text-lg font-bold ${aqiInfo.color}`}>{aqiInfo.label}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 bg-stone-50 dark:bg-stone-800 rounded-2xl">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg">
            <Eye size={20} />
          </div>
          <div>
            <p className="text-xs text-stone-500 dark:text-stone-400 font-medium uppercase tracking-wider">Visibility</p>
            <p className="text-lg font-bold text-stone-900 dark:text-stone-100">{(weather.visibility / 1000).toFixed(1)} km</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 bg-stone-50 dark:bg-stone-800 rounded-2xl">
          <div className="p-2 bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300 rounded-lg">
            <Gauge size={20} />
          </div>
          <div>
            <p className="text-xs text-stone-500 dark:text-stone-400 font-medium uppercase tracking-wider">Pressure</p>
            <p className="text-lg font-bold text-stone-900 dark:text-stone-100">{weather.main.pressure} hPa</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
