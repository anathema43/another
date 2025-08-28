import React, { useState, useEffect } from 'react';
import { useOrderStore } from '../store/orderStore';
import { useProductStore } from '../store/productStore';
import { ChartBarIcon, UsersIcon, ShoppingCartIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline';
import formatCurrency from '../utils/formatCurrency';

export default function AnalyticsDashboard() {
  const { orders } = useOrderStore();
  const { products } = useProductStore();
  const [timeRange, setTimeRange] = useState('7days');
  const [analytics, setAnalytics] = useState({
    revenue: 0,
    orders: 0,
    customers: 0,
    avgOrderValue: 0,
    topProducts: [],
    revenueGrowth: 0,
    orderGrowth: 0
  });

  useEffect(() => {
    calculateAnalytics();
  }, [orders, products, timeRange]);

  const calculateAnalytics = () => {
    const now = new Date();
    const daysBack = timeRange === '7days' ? 7 : timeRange === '30days' ? 30 : 90;
    const startDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));

    // Filter orders by time range
    const filteredOrders = orders.filter(order => 
      new Date(order.createdAt) >= startDate && order.status !== 'cancelled'
    );

    // Calculate metrics
    const revenue = filteredOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    const uniqueCustomers = new Set(filteredOrders.map(order => order.userEmail)).size;
    const avgOrderValue = filteredOrders.length > 0 ? revenue / filteredOrders.length : 0;

    // Calculate top products
    const productSales = {};
    filteredOrders.forEach(order => {
      order.items?.forEach(item => {
        if (productSales[item.id]) {
          productSales[item.id].quantity += item.quantity;
          productSales[item.id].revenue += item.price * item.quantity;
        } else {
          productSales[item.id] = {
            name: item.name,
            quantity: item.quantity,
            revenue: item.price * item.quantity
          };
        }
      });
    });

    const topProducts = Object.entries(productSales)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Calculate growth (compare with previous period)
    const previousStartDate = new Date(startDate.getTime() - (daysBack * 24 * 60 * 60 * 1000));
    const previousOrders = orders.filter(order => 
      new Date(order.createdAt) >= previousStartDate && 
      new Date(order.createdAt) < startDate &&
      order.status !== 'cancelled'
    );

    const previousRevenue = previousOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    const revenueGrowth = previousRevenue > 0 ? ((revenue - previousRevenue) / previousRevenue) * 100 : 0;
    const orderGrowth = previousOrders.length > 0 ? ((filteredOrders.length - previousOrders.length) / previousOrders.length) * 100 : 0;

    setAnalytics({
      revenue,
      orders: filteredOrders.length,
      customers: uniqueCustomers,
      avgOrderValue,
      topProducts,
      revenueGrowth,
      orderGrowth
    });
  };

  const formatGrowth = (growth) => {
    const isPositive = growth >= 0;
    return (
      <span className={`flex items-center text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        <ArrowTrendingUpIcon className={`w-4 h-4 mr-1 ${isPositive ? '' : 'rotate-180'}`} />
        {Math.abs(growth).toFixed(1)}%
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-organic-text">📊 Analytics Dashboard</h2>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-organic-primary"
        >
          <option value="7days">Last 7 Days</option>
          <option value="30days">Last 30 Days</option>
          <option value="90days">Last 90 Days</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Total Revenue</h3>
            <CurrencyDollarIcon className="w-5 h-5 text-green-600" />
          </div>
          <div className="flex items-end justify-between">
            <p className="text-2xl font-bold text-green-600">{formatCurrency(analytics.revenue)}</p>
            {formatGrowth(analytics.revenueGrowth)}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Total Orders</h3>
            <ShoppingCartIcon className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex items-end justify-between">
            <p className="text-2xl font-bold text-blue-600">{analytics.orders}</p>
            {formatGrowth(analytics.orderGrowth)}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Unique Customers</h3>
            <UsersIcon className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-purple-600">{analytics.customers}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Avg Order Value</h3>
            <ChartBarIcon className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-2xl font-bold text-orange-600">{formatCurrency(analytics.avgOrderValue)}</p>
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-organic-text mb-4">🏆 Top Selling Products</h3>
        <div className="space-y-3">
          {analytics.topProducts.map((product, index) => (
            <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 bg-organic-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </span>
                <div>
                  <p className="font-medium text-organic-text">{product.name}</p>
                  <p className="text-sm text-gray-600">{product.quantity} units sold</p>
                </div>
              </div>
              <p className="font-semibold text-green-600">{formatCurrency(product.revenue)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Order Status Distribution */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-organic-text mb-4">📋 Order Status Distribution</h3>
        <div className="grid md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <p className="text-2xl font-bold text-yellow-600">{orders.filter(o => o.status === 'processing').length}</p>
            <p className="text-sm text-yellow-700">Processing</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">{orders.filter(o => o.status === 'shipped').length}</p>
            <p className="text-sm text-blue-700">Shipped</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">{orders.filter(o => o.status === 'delivered').length}</p>
            <p className="text-sm text-green-700">Delivered</p>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <p className="text-2xl font-bold text-red-600">{orders.filter(o => o.status === 'cancelled').length}</p>
            <p className="text-sm text-red-700">Cancelled</p>
          </div>
        </div>
      </div>
    </div>
  );
}