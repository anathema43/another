import React from 'react';

const AnalyticsChart = ({ data, xKey, yKey, type = 'line', color = '#3B82F6', height = 300 }) => {
  // Simple chart implementation for analytics
  return (
    <div className="w-full bg-gray-100 rounded-lg p-4" style={{ height: `${height}px` }}>
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-600 mb-2">Analytics Chart</div>
          <div className="text-sm text-gray-500">
            {data?.length || 0} data points for {yKey}
          </div>
          <div className="text-xs text-gray-400 mt-2">
            Chart visualization available with advanced analytics
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsChart;