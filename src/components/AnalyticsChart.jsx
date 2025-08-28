import React from 'react';
import CustomizableChart from './CustomizableChart';

const AnalyticsChart = ({ data, xKey, yKey, type = 'line', color = '#3B82F6', height = 300 }) => {
  // Transform props to match CustomizableChart expectations
  const metrics = [yKey];

  return (
    <CustomizableChart
      data={data}
      metrics={metrics}
      chartType={type}
      colors={[color]}
      height={height}
    />
  );
};

export default AnalyticsChart;