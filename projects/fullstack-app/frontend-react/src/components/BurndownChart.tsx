import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { BurndownPoint } from '../types';

interface BurndownChartProps {
  burndown: BurndownPoint[];
}

const BurndownChart: React.FC<BurndownChartProps> = ({ burndown }) => {
  if (!burndown || burndown.length === 0) {
    return (
      <div className="chart-empty">
        <p>No burndown data available.</p>
      </div>
    );
  }

  return (
    <div className="chart-container">
      <h3>Sprint Burndown</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={burndown} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis label={{ value: 'Story Points', angle: -90, position: 'insideLeft' }} />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="ideal"
            stroke="#94a3b8"
            strokeDasharray="5 5"
            name="Ideal Burndown"
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="actual"
            stroke="#4f46e5"
            name="Actual Burndown"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BurndownChart;
