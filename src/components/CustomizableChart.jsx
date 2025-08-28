import React, { useRef, useEffect } from 'react';

export default function CustomizableChart({ 
  data = [], 
  metrics = ['revenue'],
  chartType = 'line',
  groupBy = 'day',
  colors = ['#10B981', '#3B82F6', '#8B5CF6'],
  height = 300,
  className = '' 
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!data.length || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    // Set canvas size
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    
    // Clear canvas
    ctx.clearRect(0, 0, rect.width, height);
    
    // Chart dimensions
    const padding = 60;
    const chartWidth = rect.width - (padding * 2);
    const chartHeight = height - (padding * 2);
    
    // Process data based on groupBy
    const processedData = processDataByGrouping(data, groupBy);
    
    // Calculate bounds for all metrics
    const allValues = [];
    metrics.forEach(metric => {
      processedData.forEach(point => {
        if (point[metric] !== undefined) {
          allValues.push(point[metric]);
        }
      });
    });
    
    const maxValue = Math.max(...allValues, 1);
    const minValue = Math.min(...allValues, 0);
    const valueRange = maxValue - minValue || 1;
    
    // Draw grid
    drawGrid(ctx, rect.width, height, padding, chartWidth, chartHeight);
    
    // Draw charts for each metric
    metrics.forEach((metric, metricIndex) => {
      const color = colors[metricIndex % colors.length];
      
      if (chartType === 'line' || chartType === 'area') {
        drawLineChart(ctx, processedData, metric, color, padding, chartWidth, chartHeight, minValue, valueRange, chartType === 'area');
      } else if (chartType === 'bar') {
        drawBarChart(ctx, processedData, metric, color, padding, chartWidth, chartHeight, minValue, valueRange, metricIndex, metrics.length);
      }
    });
    
    // Draw labels
    drawLabels(ctx, processedData, rect.width, height, padding, chartWidth, chartHeight, minValue, valueRange);
    
    // Draw legend
    drawLegend(ctx, metrics, colors, rect.width, height);
    
  }, [data, metrics, chartType, groupBy, colors, height]);

  const processDataByGrouping = (data, groupBy) => {
    if (groupBy === 'day') return data;
    
    const grouped = {};
    
    data.forEach(point => {
      let key;
      const date = new Date(point.date);
      
      if (groupBy === 'week') {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split('T')[0];
      } else if (groupBy === 'month') {
        key = date.toISOString().slice(0, 7);
      }
      
      if (!grouped[key]) {
        grouped[key] = {
          date: key,
          revenue: 0,
          orders: 0,
          customers: 0
        };
      }
      
      grouped[key].revenue += point.revenue || 0;
      grouped[key].orders += point.orders || 0;
      grouped[key].customers += point.customers || 0;
    });
    
    return Object.values(grouped).sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const drawGrid = (ctx, width, height, padding, chartWidth, chartHeight) => {
    ctx.strokeStyle = '#f3f4f6';
    ctx.lineWidth = 1;
    
    // Horizontal grid lines
    for (let i = 0; i <= 5; i++) {
      const y = padding + (chartHeight / 5) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }
    
    // Vertical grid lines
    const stepX = chartWidth / Math.max(data.length - 1, 1);
    for (let i = 0; i < data.length; i++) {
      const x = padding + stepX * i;
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, height - padding);
      ctx.stroke();
    }
  };

  const drawLineChart = (ctx, data, metric, color, padding, chartWidth, chartHeight, minValue, valueRange, fillArea = false) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    ctx.beginPath();
    data.forEach((point, index) => {
      const x = padding + (chartWidth / Math.max(data.length - 1, 1)) * index;
      const y = padding + chartHeight - ((point[metric] - minValue) / valueRange) * chartHeight;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    if (fillArea) {
      const lastPoint = data[data.length - 1];
      const lastX = padding + chartWidth;
      ctx.lineTo(lastX, height - padding);
      ctx.lineTo(padding, height - padding);
      ctx.closePath();
      
      ctx.fillStyle = color + '20';
      ctx.fill();
    }
    
    ctx.stroke();
    
    // Draw data points
    ctx.fillStyle = color;
    data.forEach((point, index) => {
      const x = padding + (chartWidth / Math.max(data.length - 1, 1)) * index;
      const y = padding + chartHeight - ((point[metric] - minValue) / valueRange) * chartHeight;
      
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fill();
    });
  };

  const drawBarChart = (ctx, data, metric, color, padding, chartWidth, chartHeight, minValue, valueRange, metricIndex, totalMetrics) => {
    const barWidth = (chartWidth / data.length) / totalMetrics * 0.8;
    const barOffset = metricIndex * barWidth;
    
    ctx.fillStyle = color;
    
    data.forEach((point, index) => {
      const x = padding + (chartWidth / data.length) * index + barOffset;
      const barHeight = ((point[metric] - minValue) / valueRange) * chartHeight;
      const y = padding + chartHeight - barHeight;
      
      ctx.fillRect(x, y, barWidth, barHeight);
    });
  };

  const drawLabels = (ctx, data, width, height, padding, chartWidth, chartHeight, minValue, valueRange) => {
    ctx.fillStyle = '#6b7280';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    
    // X-axis labels
    data.forEach((point, index) => {
      if (index % Math.ceil(data.length / 6) === 0) {
        const x = padding + (chartWidth / Math.max(data.length - 1, 1)) * index;
        const date = new Date(point.date);
        const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        ctx.fillText(label, x, height - 10);
      }
    });
    
    // Y-axis labels
    ctx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
      const value = minValue + (valueRange / 5) * (5 - i);
      const y = padding + (chartHeight / 5) * i + 4;
      const label = value > 1000 ? `${(value / 1000).toFixed(1)}k` : Math.round(value).toString();
      ctx.fillText(label, padding - 10, y);
    }
  };

  const drawLegend = (ctx, metrics, colors, width, height) => {
    const legendY = height - 40;
    let legendX = width - 200;
    
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'left';
    
    metrics.forEach((metric, index) => {
      const color = colors[index % colors.length];
      const label = metric.charAt(0).toUpperCase() + metric.slice(1);
      
      // Draw color indicator
      ctx.fillStyle = color;
      ctx.fillRect(legendX, legendY, 12, 12);
      
      // Draw label
      ctx.fillStyle = '#374151';
      ctx.fillText(label, legendX + 18, legendY + 9);
      
      legendX += 80;
    });
  };

  return (
    <div className={`relative ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full border rounded-lg"
        style={{ height: `${height}px` }}
      />
      {data.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-gray-500">No data available for selected period</p>
        </div>
      )}
    </div>
  );
}