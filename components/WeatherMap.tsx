'use client';
import dynamic from 'next/dynamic';
import { useMemo } from 'react';

export default function WeatherMap({ lat, lon }: { lat: number, lon: number }) {
  const Map = useMemo(() => dynamic(() => import('./Map'), { 
    ssr: false, 
    loading: () => <div className="h-[500px] w-full bg-stone-200 animate-pulse rounded-2xl"></div> 
  }), []);
  
  return <Map lat={lat} lon={lon} />;
}
