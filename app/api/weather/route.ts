import {NextResponse} from 'next/server';
import axios from 'axios';

export async function GET(request: Request) {
  const {searchParams} = new URL(request.url);
  const city = searchParams.get('city') || 'London';
  const latParam = searchParams.get('lat');
  const lonParam = searchParams.get('lon');
  const unit = searchParams.get('unit') || 'metric';

  const tempUnitParam = unit === 'imperial' ? '&temperature_unit=fahrenheit' : '';
  const windUnitParam = unit === 'imperial' ? '&wind_speed_unit=mph' : '&wind_speed_unit=ms';
  const precipUnitParam = unit === 'imperial' ? '&precipitation_unit=inch' : '';

  try {
    let lat, lon, cityName;

    if (latParam && lonParam) {
      lat = parseFloat(latParam);
      lon = parseFloat(lonParam);
      cityName = city.split(',')[0]; // Extract just the city name part
    } else {
      // 1. Geocode the city to get lat/lon
      const geoRes = await axios.get(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
      
      if (!geoRes.data.results || geoRes.data.results.length === 0) {
        return NextResponse.json({error: 'City not found'}, {status: 404});
      }

      const location = geoRes.data.results[0];
      lat = location.latitude;
      lon = location.longitude;
      cityName = location.name;
    }

    // 2. Fetch current weather, hourly forecast, and UV index
    const weatherRes = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m,uv_index&hourly=temperature_2m,weather_code,precipitation_probability&timezone=auto${tempUnitParam}${windUnitParam}${precipUnitParam}`);

    // 3. Fetch Air Quality data
    const aqRes = await axios.get(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi,pm10,pm2_5&timezone=auto`);

    const current = weatherRes.data.current;
    const hourly = weatherRes.data.hourly;
    const aq = aqRes.data.current;

    // Map WMO weather codes to descriptions
    const getWeatherDesc = (code: number) => {
      if (code === 0) return 'Clear sky';
      if (code === 1 || code === 2 || code === 3) return 'Partly cloudy';
      if (code === 45 || code === 48) return 'Fog';
      if (code >= 51 && code <= 67) return 'Rain';
      if (code >= 71 && code <= 77) return 'Snow';
      if (code >= 80 && code <= 82) return 'Rain showers';
      if (code >= 95) return 'Thunderstorm';
      return 'Unknown';
    };

    const mappedCurrent = {
      name: cityName,
      coord: { lat, lon },
      main: {
        temp: current.temperature_2m,
        feels_like: current.apparent_temperature,
        humidity: current.relative_humidity_2m,
        pressure: 1013, // Open-Meteo current doesn't have pressure by default unless requested, using a placeholder or we can add it
      },
      weather: [
        { id: current.weather_code, description: getWeatherDesc(current.weather_code), main: getWeatherDesc(current.weather_code) }
      ],
      wind: {
        speed: current.wind_speed_10m,
        deg: current.wind_direction_10m,
      },
      visibility: 10000, // Placeholder
      uvIndex: current.uv_index,
      airQuality: {
        aqi: aq.us_aqi,
        pm10: aq.pm10,
        pm2_5: aq.pm2_5,
      }
    };

    // Just take the next 24 hours
    const mappedForecastList = hourly.time.slice(0, 24).map((timeStr: string, index: number) => {
      return {
        dt: new Date(timeStr).getTime() / 1000,
        main: {
          temp: hourly.temperature_2m[index]
        },
        precipitation_probability: hourly.precipitation_probability[index]
      };
    });

    return NextResponse.json({
      current: mappedCurrent,
      forecast: { list: mappedForecastList },
    });
  } catch (error) {
    console.error('Weather API Error:', error);
    return NextResponse.json({error: 'Failed to fetch weather'}, {status: 500});
  }
}
