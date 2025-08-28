import React, { useState, useEffect } from 'react';
import { UserGroupIcon, CurrencyDollarIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import formatCurrency from '../utils/formatCurrency';

export default function CustomerSegmentation({ orders, timeRange }) {
  const [segmentData, setSegmentData] = useState({
    segments: [],
    totalCustomers: 0,
    averageLifetimeValue: 0
  });

  useEffect(() => {
    calculateSegmentation();
  }, [orders, timeRange]);

  const calculateSegmentation = () => {
    const customerData = {};
    
    // Process orders to build customer profiles
    orders.forEach(order => {
      if (!customerData[order.userEmail]) {
        customerData[order.userEmail] = {
          email: order.userEmail,
          totalSpent: 0,
          orderCount: 0,
          firstOrder: order.createdAt,
          lastOrder: order.createdAt,
          categories: new Set()
        };
      }
      
      const customer = customerData[order.userEmail];
      customer.totalSpent += order.total || 0;
      customer.orderCount += 1;
      
      // Track purchase categories
      order.items?.forEach(item => {
        if (item.category) {
          customer.categories.add(item.category);
        }
      });
      
      // Update order dates
      if (new Date(order.createdAt) < new Date(customer.firstOrder)) {
        customer.firstOrder = order.createdAt;
      }
      if (new Date(order.createdAt) > new Date(customer.lastOrder)) {
        customer.lastOrder = order.createdAt;
      }
    });

    const customers = Object.values(customerData);
    const totalCustomers = customers.length;
    const totalLifetimeValue = customers.reduce((sum, c) => sum + c.totalSpent, 0);
    const averageLifetimeValue = totalCustomers > 0 ? totalLifetimeValue / totalCustomers : 0;

    // Create segments
    const segments = [
      {
        name: 'Champions',
        description: 'High value, frequent buyers',
        customers: customers.filter(c => c.totalSpent > 1500 && c.orderCount >= 3),
        color: 'bg-green-500',
        strategy: 'Reward and retain with VIP programs'
      },
      {
        name: 'Loyal Customers',
        description: 'Regular buyers with good value',
        customers: customers.filter(c => c.totalSpent >= 800 && c.orderCount >= 2 && c.totalSpent <= 1500),
        color: 'bg-blue-500',
        strategy: 'Upsell and cross-sell opportunities'
      },
      {
        name: 'Potential Loyalists',
        description: 'Recent customers with good first purchase',
        customers: customers.filter(c => c.orderCount === 1 && c.totalSpent >= 500),
        color: 'bg-purple-500',
        strategy: 'Nurture with targeted campaigns'
      },
      {
        name: 'New Customers',
        description: 'First-time buyers',
        customers: customers.filter(c => c.orderCount === 1 && c.totalSpent < 500),
        color: 'bg-yellow-500',
        strategy: 'Welcome series and product education'
      },
      {
        name: 'At Risk',
        description: 'Haven\'t purchased recently',
        customers: customers.filter(c => {
          const daysSinceLastOrder = (Date.now() - new Date(c.lastOrder)) / (1000 * 60 * 60 * 24);
          return daysSinceLastOrder > 60 && c.orderCount > 1;
        }),
        color: 'bg-orange-500',
        strategy: 'Re-engagement campaigns with special offers'
      },
      {
        name: 'Lost Customers',
        description: 'Long-time inactive customers',
        customers: customers.filter(c => {
          const daysSinceLastOrder = (Date.now() - new Date(c.lastOrder)) / (1000 * 60 * 60 * 24);
          return daysSinceLastOrder > 120;
        }),
        color: 'bg-red-500',
        strategy: 'Win-back campaigns with significant incentives'
      }
    ];

    setSegmentData({
      segments: segments.map(segment => ({
        ...segment,
        count: segment.customers.length,
        percentage: totalCustomers > 0 ? (segment.customers.length / totalCustomers) * 100 : 0,
        avgSpent: segment.customers.length > 0 
          ? segment.customers.reduce((sum, c) => sum + c.totalSpent, 0) / segment.customers.length 
          : 0
      })),
      totalCustomers,
      averageLifetimeValue
    });
  };

  return (
    <div className="space-y-8">
      {/* Segmentation Overview */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold text-organic-text mb-4">👥 Customer Segmentation Overview</h3>
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-3xl font-bold text-blue-600 mb-2">{segmentData.totalCustomers}</div>
            <div className="text-sm text-blue-700">Total Customers</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {formatCurrency(segmentData.averageLifetimeValue)}
            </div>
            <div className="text-sm text-green-700">Avg Lifetime Value</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {segmentData.segments.filter(s => s.name === 'Champions').reduce((sum, s) => sum + s.count, 0)}
            </div>
            <div className="text-sm text-purple-700">Champion Customers</div>
          </div>
        </div>
      </div>

      {/* Segment Details */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {segmentData.segments.map((segment) => (
          <div key={segment.name} className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-4 h-4 rounded-full ${segment.color}`}></div>
              <h4 className="font-semibold text-gray-900">{segment.name}</h4>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">{segment.description}</p>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Customers</span>
                <span className="font-semibold">{segment.count}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Percentage</span>
                <span className="font-semibold">{segment.percentage.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Avg Spent</span>
                <span className="font-semibold text-green-600">
                  {formatCurrency(segment.avgSpent)}
                </span>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-gray-50 rounded">
              <p className="text-xs text-gray-700">
                <strong>Strategy:</strong> {segment.strategy}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}