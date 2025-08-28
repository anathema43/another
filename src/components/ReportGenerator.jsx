import React, { useState } from 'react';
import { XMarkIcon, DocumentArrowDownIcon, ChartBarIcon, TableCellsIcon } from '@heroicons/react/24/outline';
import formatCurrency from '../utils/formatCurrency';

export default function ReportGenerator({ analytics, onClose, timeRange, orders, products }) {
  const [reportConfig, setReportConfig] = useState({
    title: 'Custom Business Report',
    metrics: ['revenue', 'orders', 'customers'],
    chartType: 'line',
    groupBy: 'day',
    includeComparison: true,
    includeInsights: true,
    format: 'pdf'
  });

  const availableMetrics = [
    { id: 'revenue', label: 'Revenue', color: '#10B981' },
    { id: 'orders', label: 'Orders', color: '#3B82F6' },
    { id: 'customers', label: 'Customers', color: '#8B5CF6' },
    { id: 'avgOrderValue', label: 'Average Order Value', color: '#F59E0B' },
    { id: 'conversionRate', label: 'Conversion Rate', color: '#EF4444' },
    { id: 'inventory', label: 'Inventory Levels', color: '#6B7280' }
  ];

  const handleMetricToggle = (metricId) => {
    setReportConfig(prev => ({
      ...prev,
      metrics: prev.metrics.includes(metricId)
        ? prev.metrics.filter(m => m !== metricId)
        : [...prev.metrics, metricId]
    }));
  };

  const generateReport = () => {
    const reportData = {
      title: reportConfig.title,
      generatedAt: new Date().toISOString(),
      timeRange,
      configuration: reportConfig,
      data: {
        summary: {
          totalRevenue: analytics.revenue.current,
          totalOrders: analytics.orders.current,
          uniqueCustomers: analytics.customers.current,
          averageOrderValue: analytics.avgOrderValue.current
        },
        timeSeries: analytics.timeSeriesData,
        topProducts: analytics.topProducts.slice(0, 10),
        customerSegments: analytics.customerSegments,
        insights: generateCustomInsights()
      }
    };

    if (reportConfig.format === 'json') {
      downloadJSON(reportData);
    } else if (reportConfig.format === 'csv') {
      downloadCSV(reportData);
    } else {
      generatePDFReport(reportData);
    }
  };

  const generateCustomInsights = () => {
    const insights = [];
    
    // Revenue insights
    if (reportConfig.metrics.includes('revenue')) {
      insights.push({
        metric: 'Revenue',
        insight: `Total revenue of ${formatCurrency(analytics.revenue.current)} with ${analytics.revenue.growth.toFixed(1)}% growth`,
        recommendation: analytics.revenue.growth > 0 
          ? 'Consider increasing marketing spend to capitalize on growth'
          : 'Review pricing strategy and customer acquisition channels'
      });
    }
    
    // Customer insights
    if (reportConfig.metrics.includes('customers')) {
      const repeatRate = analytics.customers.current > 0 
        ? ((analytics.orders.current - analytics.customers.current) / analytics.customers.current * 100)
        : 0;
      
      insights.push({
        metric: 'Customers',
        insight: `${analytics.customers.current} unique customers with ${repeatRate.toFixed(1)}% repeat rate`,
        recommendation: repeatRate < 30 
          ? 'Implement customer retention programs and loyalty rewards'
          : 'Focus on expanding customer base while maintaining retention'
      });
    }
    
    return insights;
  };

  const downloadJSON = (data) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    downloadFile(blob, `${reportConfig.title.replace(/\s+/g, '-')}-${Date.now()}.json`);
  };

  const downloadCSV = (data) => {
    const headers = ['Date', ...reportConfig.metrics.map(m => 
      availableMetrics.find(am => am.id === m)?.label || m
    )];
    
    const rows = data.data.timeSeries.map(item => [
      item.date,
      ...reportConfig.metrics.map(metric => item[metric] || 0)
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    downloadFile(blob, `${reportConfig.title.replace(/\s+/g, '-')}-${Date.now()}.csv`);
  };

  const generatePDFReport = (data) => {
    // For now, generate HTML report that can be printed as PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${data.title}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          .header { text-align: center; margin-bottom: 30px; }
          .metric { margin: 20px 0; padding: 15px; background: #f5f5f5; border-radius: 5px; }
          .insight { margin: 10px 0; padding: 10px; background: #e3f2fd; border-radius: 5px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${data.title}</h1>
          <p>Generated on ${new Date(data.generatedAt).toLocaleDateString()}</p>
          <p>Time Period: ${timeRange}</p>
        </div>
        
        <div class="metric">
          <h2>Key Metrics Summary</h2>
          <p><strong>Total Revenue:</strong> ${formatCurrency(data.data.summary.totalRevenue)}</p>
          <p><strong>Total Orders:</strong> ${data.data.summary.totalOrders}</p>
          <p><strong>Unique Customers:</strong> ${data.data.summary.uniqueCustomers}</p>
          <p><strong>Average Order Value:</strong> ${formatCurrency(data.data.summary.averageOrderValue)}</p>
        </div>
        
        ${data.data.insights.map(insight => `
          <div class="insight">
            <h3>${insight.metric}</h3>
            <p><strong>Insight:</strong> ${insight.insight}</p>
            <p><strong>Recommendation:</strong> ${insight.recommendation}</p>
          </div>
        `).join('')}
        
        <h2>Top Products</h2>
        <table>
          <tr><th>Product</th><th>Revenue</th><th>Units Sold</th></tr>
          ${data.data.topProducts.map(product => `
            <tr>
              <td>${product.name}</td>
              <td>${formatCurrency(product.revenue)}</td>
              <td>${product.quantity}</td>
            </tr>
          `).join('')}
        </table>
      </body>
      </html>
    `;
    
    const blob = new Blob([htmlContent], { type: 'text/html' });
    downloadFile(blob, `${reportConfig.title.replace(/\s+/g, '-')}-${Date.now()}.html`);
  };

  const downloadFile = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-organic-text">📊 Custom Report Generator</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Report Configuration */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Report Title
              </label>
              <input
                type="text"
                value={reportConfig.title}
                onChange={(e) => setReportConfig(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-organic-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Export Format
              </label>
              <select
                value={reportConfig.format}
                onChange={(e) => setReportConfig(prev => ({ ...prev, format: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-organic-primary"
              >
                <option value="pdf">PDF Report</option>
                <option value="json">JSON Data</option>
                <option value="csv">CSV Spreadsheet</option>
              </select>
            </div>
          </div>

          {/* Metrics Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Metrics to Include
            </label>
            <div className="grid md:grid-cols-3 gap-3">
              {availableMetrics.map((metric) => (
                <label key={metric.id} className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={reportConfig.metrics.includes(metric.id)}
                    onChange={() => handleMetricToggle(metric.id)}
                    className="mr-3 rounded border-gray-300 text-organic-primary focus:ring-organic-primary"
                  />
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: metric.color }}
                    ></div>
                    <span className="text-sm font-medium">{metric.label}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Chart Configuration */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chart Type
              </label>
              <select
                value={reportConfig.chartType}
                onChange={(e) => setReportConfig(prev => ({ ...prev, chartType: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-organic-primary"
              >
                <option value="line">Line Chart</option>
                <option value="bar">Bar Chart</option>
                <option value="area">Area Chart</option>
                <option value="pie">Pie Chart</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Group Data By
              </label>
              <select
                value={reportConfig.groupBy}
                onChange={(e) => setReportConfig(prev => ({ ...prev, groupBy: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-organic-primary"
              >
                <option value="day">Daily</option>
                <option value="week">Weekly</option>
                <option value="month">Monthly</option>
              </select>
            </div>
          </div>

          {/* Additional Options */}
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={reportConfig.includeComparison}
                onChange={(e) => setReportConfig(prev => ({ ...prev, includeComparison: e.target.checked }))}
                className="mr-3 rounded border-gray-300 text-organic-primary focus:ring-organic-primary"
              />
              <span className="text-sm font-medium text-gray-700">
                Include comparison with previous period
              </span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={reportConfig.includeInsights}
                onChange={(e) => setReportConfig(prev => ({ ...prev, includeInsights: e.target.checked }))}
                className="mr-3 rounded border-gray-300 text-organic-primary focus:ring-organic-primary"
              />
              <span className="text-sm font-medium text-gray-700">
                Include AI-powered insights and recommendations
              </span>
            </label>
          </div>

          {/* Preview */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-3">Report Preview</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Title:</strong> {reportConfig.title}</p>
              <p><strong>Metrics:</strong> {reportConfig.metrics.map(m => 
                availableMetrics.find(am => am.id === m)?.label
              ).join(', ')}</p>
              <p><strong>Time Period:</strong> {timeRange}</p>
              <p><strong>Chart Type:</strong> {reportConfig.chartType}</p>
              <p><strong>Grouping:</strong> {reportConfig.groupBy}</p>
              <p><strong>Format:</strong> {reportConfig.format.toUpperCase()}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              onClick={generateReport}
              disabled={reportConfig.metrics.length === 0}
              className="flex items-center gap-2 bg-organic-primary text-white px-6 py-3 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <DocumentArrowDownIcon className="w-5 h-5" />
              Generate Report
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}