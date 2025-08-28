import React, { useState, useEffect } from 'react';
import { ChartBarIcon, TrendingUpIcon, TrendingDownIcon } from '@heroicons/react/24/outline';
import formatCurrency from '../utils/formatCurrency';
import CustomizableChart from './CustomizableChart';

export default function ProductPerformanceChart({ products, orders, timeRange }) {
  const [performanceData, setPerformanceData] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('revenue');

  useEffect(() => {
    calculateProductPerformance();
  }, [products, orders, timeRange, selectedCategory, sortBy]);

  const calculateProductPerformance = () => {
    const productMetrics = {};
    
    // Calculate metrics for each product
    orders.forEach(order => {
      order.items?.forEach(item => {
        if (!productMetrics[item.id]) {
          const product = products.find(p => p.id === item.id);
          productMetrics[item.id] = {
            id: item.id,
            name: item.name,
            category: product?.category || 'unknown',
            totalRevenue: 0,
            totalQuantity: 0,
            orderCount: 0,
            uniqueCustomers: new Set(),
            averageRating: product?.rating || 0,
            currentStock: product?.quantityAvailable || 0,
            margins: []
          };
        }
        
        const metric = productMetrics[item.id];
        metric.totalRevenue += item.price * item.quantity;
        metric.totalQuantity += item.quantity;
        metric.orderCount += 1;
        metric.uniqueCustomers.add(order.userEmail);
        
        // Calculate margin (assuming 40% cost)
        const margin = (item.price * 0.6) * item.quantity;
        metric.margins.push(margin);
      });
    });

    // Convert to array and calculate derived metrics
    let performance = Object.values(productMetrics).map(product => ({
      ...product,
      uniqueCustomers: product.uniqueCustomers.size,
      avgOrderValue: product.totalRevenue / Math.max(product.orderCount, 1),
      revenuePerUnit: product.totalRevenue / Math.max(product.totalQuantity, 1),
      totalMargin: product.margins.reduce((sum, m) => sum + m, 0),
      marginPercentage: product.totalRevenue > 0 
        ? (product.margins.reduce((sum, m) => sum + m, 0) / product.totalRevenue) * 100 
        : 0,
      stockTurnover: product.currentStock > 0 ? product.totalQuantity / product.currentStock : 0
    }));

    // Filter by category
    if (selectedCategory !== 'all') {
      performance = performance.filter(p => p.category === selectedCategory);
    }

    // Sort by selected criteria
    performance.sort((a, b) => {
      switch (sortBy) {
        case 'revenue':
          return b.totalRevenue - a.totalRevenue;
        case 'quantity':
          return b.totalQuantity - a.totalQuantity;
        case 'margin':
          return b.totalMargin - a.totalMargin;
        case 'rating':
          return b.averageRating - a.averageRating;
        case 'turnover':
          return b.stockTurnover - a.stockTurnover;
        default:
          return b.totalRevenue - a.totalRevenue;
      }
    });

    setPerformanceData(performance);
  };

  const categories = [...new Set(products.map(p => p.category))];

  return (
    <div className="space-y-8">
      {/* Controls */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <h3 className="text-lg font-semibold text-organic-text">📦 Product Performance Analysis</h3>
          
          <div className="flex gap-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-organic-primary"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category} className="capitalize">
                  {category}
                </option>
              ))}
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-organic-primary"
            >
              <option value="revenue">Sort by Revenue</option>
              <option value="quantity">Sort by Units Sold</option>
              <option value="margin">Sort by Profit Margin</option>
              <option value="rating">Sort by Rating</option>
              <option value="turnover">Sort by Stock Turnover</option>
            </select>
          </div>
        </div>
      </div>

      {/* Performance Table */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Units Sold</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Orders</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customers</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg Order Value</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Margin</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {performanceData.slice(0, 20).map((product, index) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 bg-organic-primary text-white rounded-full flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </span>
                      <div>
                        <div className="font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500 capitalize">{product.category}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-green-600">
                      {formatCurrency(product.totalRevenue)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatCurrency(product.revenuePerUnit)}/unit
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium">{product.totalQuantity}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium">{product.orderCount}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium">{product.uniqueCustomers}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium">{formatCurrency(product.avgOrderValue)}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-purple-600">
                      {formatCurrency(product.totalMargin)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {product.marginPercentage.toFixed(1)}%
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      product.currentStock > 10 ? 'bg-green-100 text-green-800' :
                      product.currentStock > 5 ? 'bg-yellow-100 text-yellow-800' :
                      product.currentStock > 0 ? 'bg-orange-100 text-orange-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {product.currentStock > 0 ? `${product.currentStock} in stock` : 'Out of stock'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Performance Insights */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h4 className="font-semibold text-gray-900 mb-4">🏆 Top Performers</h4>
          <div className="space-y-3">
            {performanceData.slice(0, 5).map((product, index) => (
              <div key={product.id} className="flex items-center justify-between p-3 bg-green-50 rounded">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 bg-green-600 text-white rounded-full flex items-center justify-center text-xs">
                    {index + 1}
                  </span>
                  <span className="font-medium text-sm">{product.name}</span>
                </div>
                <span className="font-bold text-green-600">
                  {formatCurrency(product.totalRevenue)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h4 className="font-semibold text-gray-900 mb-4">⚠️ Needs Attention</h4>
          <div className="space-y-3">
            {performanceData
              .filter(p => p.currentStock <= 5 || p.stockTurnover < 1)
              .slice(0, 5)
              .map((product) => (
              <div key={product.id} className="flex items-center justify-between p-3 bg-orange-50 rounded">
                <div>
                  <div className="font-medium text-sm">{product.name}</div>
                  <div className="text-xs text-orange-600">
                    {product.currentStock <= 5 ? 'Low stock' : 'Slow moving'}
                  </div>
                </div>
                <span className="text-sm font-medium text-orange-600">
                  {product.currentStock} left
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}