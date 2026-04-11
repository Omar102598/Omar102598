import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Sprint } from '../types';

interface VelocityChartProps {
  sprints: Sprint[];
}

const VelocityChart: React.FC<VelocityChartProps> = ({ sprints }) => {
  const data = sprints.map(sprint => ({
    name: sprint.name,
    velocity: sprint.velocity,
    status: sprint.status
  }));

  if (data.length === 0) {
    return (
      <div className="chart-empty">
        <p>No sprint data available for velocity chart.</p>
      </div>
    );
  }

  return (
    <div className="chart-container">
      <h3>Sprint Velocity</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis label={{ value: 'Story Points', angle: -90, position: 'insideLeft' }} />
          <Tooltip />
          <Legend />
          <Bar dataKey="velocity" fill="#4f46e5" name="Velocity (Story Points)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default VelocityChart;
