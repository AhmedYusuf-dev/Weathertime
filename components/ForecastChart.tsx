import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  ComposedChart,
  Legend
} from "recharts";

export default function ForecastChart({data, unit}: {data: any[], unit: string}) {
  const tempUnit = unit === 'imperial' ? '°F' : '°C';

  return (
    <div className="h-80 w-full bg-white p-6 rounded-3xl shadow-sm border border-stone-100">
      <h3 className="text-lg font-bold text-stone-900 mb-4">24-Hour Forecast</h3>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
          <XAxis 
            dataKey="time" 
            axisLine={false} 
            tickLine={false} 
            tick={{fill: '#a8a29e', fontSize: 12}}
            dy={10}
          />
          <YAxis 
            yAxisId="left"
            axisLine={false} 
            tickLine={false} 
            tick={{fill: '#a8a29e', fontSize: 12}}
            unit={tempUnit}
          />
          <YAxis 
            yAxisId="right"
            orientation="right"
            axisLine={false} 
            tickLine={false} 
            tick={{fill: '#a8a29e', fontSize: 12}}
            unit="%"
            domain={[0, 100]}
          />
          <Tooltip 
            contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
          />
          <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{paddingBottom: '20px'}} />
          <Area 
            yAxisId="right"
            type="monotone" 
            dataKey="precipitation_probability" 
            name="Rain Chance"
            fill="#3b82f6" 
            stroke="none"
            fillOpacity={0.1}
          />
          <Line 
            yAxisId="left"
            type="monotone" 
            dataKey="temp" 
            name="Temperature"
            stroke="#stone-900" 
            strokeWidth={3} 
            dot={{r: 4, fill: '#stone-900', strokeWidth: 2, stroke: '#fff'}}
            activeDot={{r: 6}}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
