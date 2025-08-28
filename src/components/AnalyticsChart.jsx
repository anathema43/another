import React, { useRef, useEffect } from 'react';

export default function AnalyticsChart({ 
  data = [], 
  xKey, 
  yKey, 
  type = 'line', 
  color = '#10B981',
  height = 200,
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
    
    // Calculate data bounds
    const values = data.map(d => d[yKey]);
    const maxValue = Math.max(...values, 1);
    const minValue = Math.min(...values, 0);
    const valueRange = maxValue - minValue || 1;
    
    // Chart dimensions
    const padding = 40;
    const chartWidth = rect.width - (padding * 2);
    const chartHeight = height - (padding * 2);
    
    // Draw grid lines
    ctx.strokeStyle = '#f3f4f6';
    ctx.lineWidth = 1;
    
    // Horizontal grid lines
    for (let i = 0; i <= 5; i++) {
      const y = padding + (chartHeight / 5) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(rect.width - padding, y);
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
    
    // Draw chart based on type
    if (type === 'line' || type === 'area') {
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      // Create path
      ctx.beginPath();
      data.forEach((point, index) => {
        const x = padding + (chartWidth / Math.max(data.length - 1, 1)) * index;
        const y = padding + chartHeight - ((point[yKey] - minValue) / valueRange) * chartHeight;
        
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      
      if (type === 'area') {
        // Fill area under curve
        const lastPoint = data[data.length - 1];
        const lastX = padding + chartWidth;
        const lastY = padding + chartHeight - ((lastPoint[yKey] - minValue) / valueRange) * chartHeight;
        
        ctx.lineTo(lastX, height - padding);
        ctx.lineTo(padding, height - padding);
        ctx.closePath();
        
        ctx.fillStyle = color + '20'; // 20% opacity
        ctx.fill();
      }
      
      ctx.stroke();
      
      // Draw data points
      ctx.fillStyle = color;
      data.forEach((point, index) => {
        const x = padding + (chartWidth / Math.max(data.length - 1, 1)) * index;
        const y = padding + chartHeight - ((point[yKey] - minValue) / valueRange) * chartHeight;
        
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fill();
      });
    }
    
    // Draw labels
    ctx.fillStyle = '#6b7280';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    
    // X-axis labels (dates)
    data.forEach((point, index) => {
      if (index % Math.ceil(data.length / 5) === 0) { // Show every nth label
        const x = padding + (chartWidth / Math.max(data.length - 1, 1)) * index;
        const date = new Date(point[xKey]);
        const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        ctx.fillText(label, x, height - 10);
      }
    });
    
    // Y-axis labels (values)
    ctx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
      const value = minValue + (valueRange / 5) * (5 - i);
      const y = padding + (chartHeight / 5) * i + 4;
      const label = yKey === 'revenue' ? formatCurrency(value) : Math.round(value).toString();
      ctx.fillText(label, padding - 10, y);
    }
    
  }, [data, xKey, yKey, type, color, height]);

  return (
    <div className={`relative ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full"
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