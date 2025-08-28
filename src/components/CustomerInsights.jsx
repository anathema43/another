import React, { useState, useEffect } from 'react';
import { 
  UserGroupIcon, 
  CurrencyDollarIcon, 
  ShoppingCartIcon,
  CalendarIcon,
  TrendingUpIcon,
  TrendingDownIcon
} from '@heroicons/react/24/outline';
import formatCurrency from '../utils/formatCurrency';

export default function CustomerInsights({ customers, orders, timeRange }) {
  const [insights, setInsights] = useState({
    totalCustomers: 0,
    newCustomers: 0,
    activeCustomers: 0,
    averageLifetimeValue: 0,
    customerGrowth: 0,
    retentionRate: 0,
    segments: {},
    topCustomers: []
  });

  useEffect(() => {
    calculateInsights();
  }, [customers, orders, timeRange]);

  const calculateInsights = () => {
    const now = new Date();
    const daysBack = timeRange === '7days' ? 7 : timeRange === '30days' ? 30 : 90;
    const currentPeriodStart = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));
    const previousPeriodStart = new Date(currentPeriodStart.getTime() - (daysBack * 24 * 60 * 60 * 1000));

    // Calculate metrics
    const totalCustomers = customers.length;
    const newCustomers = customers.filter(c => 
      new Date(c.createdAt) >= currentPeriodStart
    ).length;
    
    const previousNewCustomers = customers.filter(c => 
      new Date(c.createdAt) >= previousPeriodStart && 
      new Date(c.createdAt) < currentPeriodStart
    ).length;

    const customerGrowth = previousNewCustomers > 0 
      ? ((newCustomers - previousNewCustomers) / previousNewCustomers) * 100 
      : 0;

    const activeCustomers = customers.filter(c => c.orderCount > 0).length;
    const totalLifetimeValue = customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0);
    const averageLifetimeValue = totalCustomers > 0 ? totalLifetimeValue / totalCustomers : 0;

    // Calculate retention rate
    const customersWithMultipleOrders = customers.filter(c => c.orderCount > 1).length;
    const retentionRate = activeCustomers > 0 ? (customersWithMultipleOrders / activeCustomers) * 100 : 0;

    // Customer segmentation
    const segments = {
      champions: customers.filter(c => c.totalSpent > 1500 && c.orderCount >= 3).length,
      loyal: customers.filter(c => c.totalSpent >= 800 && c.orderCount >= 2 && c.totalSpent <= 1500).length,
      potential: customers.filter(c => c.orderCount === 1 && c.totalSpent >= 500).length,
      new: customers.filter(c => c.orderCount === 1 && c.totalSpent < 500).length,
      atRisk: customers.filter(c => {
        const daysSinceLastOrder = c.lastOrderDate 
          ? (Date.now() - new Date(c.lastOrderDate)) / (1000 * 60 * 60 * 24)
          : Infinity;
        return daysSinceLastOrder > 60 && c.orderCount > 1;
      }).length,
      lost: customers.filter(c => {
        const daysSinceLastOrder = c.lastOrderDate 
          ? (Date.now() - new Date(c.lastOrderDate)) / (1000 * 60 * 60 * 24)
          : Infinity;
        return daysSinceLastOrder > 120;
      }).length
    };

    // Top customers by value
    const topCustomers = customers
      .sort((a, b) => (b.totalSpent || 0) - (a.totalSpent || 0))
      .slice(0, 5);

    setInsights({
      totalCustomers,
      newCustomers,
      activeCustomers,
      averageLifetimeValue,
      customerGrowth,
      retentionRate,
      segments,
      topCustomers
    });
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <UserGroupIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Customers</p>
                <p className="text-2xl font-bold text-blue-600">{insights.totalCustomers}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUpIcon className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">New Customers</p>
                <p className="text-2xl font-bold text-green-600">{insights.newCustomers}</p>
              </div>
            </div>
            <div className={`flex items-center gap-1 ${
              insights.customerGrowth >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {insights.customerGrowth >= 0 ? (
                <TrendingUpIcon className="w-4 h-4" />
              ) : (
                <TrendingDownIcon className="w-4 h-4" />
              )}
              <span className="text-sm font-medium">
                {Math.abs(insights.customerGrowth).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <CurrencyDollarIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Lifetime Value</p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatCurrency(insights.averageLifetimeValue)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <ShoppingCartIcon className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Retention Rate</p>
                <p className="text-2xl font-bold text-orange-600">
                  {insights.retentionRate.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Segments */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-organic-text mb-4">Customer Segments</h3>
        <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Object.entries(insights.segments).map(([segment, count]) => (
            <div key={segment} className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-organic-primary mb-1">{count}</div>
              <div className="text-sm text-gray-600 capitalize">{segment.replace(/([A-Z])/g, ' $1')}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Customers */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-organic-text mb-4">Top Customers by Value</h3>
        <div className="space-y-3">
          {insights.topCustomers.map((customer, index) => (
            <div key={customer.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 bg-organic-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </span>
                <div>
                  <p className="font-medium text-organic-text">{customer.displayName || customer.email}</p>
                  <p className="text-sm text-gray-600">{customer.orderCount} orders</p>
                </div>
              </div>
              <p className="font-semibold text-green-600">{formatCurrency(customer.totalSpent || 0)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}