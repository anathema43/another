import React, { useState, useEffect } from 'react';
import { 
  ChartPieIcon, 
  CursorArrowRaysIcon, 
  UserPlusIcon,
  CurrencyDollarIcon 
} from '@heroicons/react/24/outline';
import formatCurrency from '../utils/formatCurrency';

export default function MarketingAttribution({ orders, timeRange }) {
  const [attributionData, setAttributionData] = useState({
    channels: {},
    touchpoints: [],
    customerJourney: []
  });

  useEffect(() => {
    calculateAttribution();
  }, [orders, timeRange]);

  const calculateAttribution = () => {
    // Simulate marketing attribution data
    const channels = {
      organic: {
        name: 'Organic Search',
        orders: Math.floor(orders.length * 0.35),
        revenue: 0,
        customers: 0,
        avgOrderValue: 0,
        conversionRate: 2.8,
        cost: 0
      },
      social: {
        name: 'Social Media',
        orders: Math.floor(orders.length * 0.25),
        revenue: 0,
        customers: 0,
        avgOrderValue: 0,
        conversionRate: 1.9,
        cost: 5000
      },
      email: {
        name: 'Email Marketing',
        orders: Math.floor(orders.length * 0.20),
        revenue: 0,
        customers: 0,
        avgOrderValue: 0,
        conversionRate: 4.2,
        cost: 1200
      },
      direct: {
        name: 'Direct Traffic',
        orders: Math.floor(orders.length * 0.15),
        revenue: 0,
        customers: 0,
        avgOrderValue: 0,
        conversionRate: 3.1,
        cost: 0
      },
      referral: {
        name: 'Referrals',
        orders: Math.floor(orders.length * 0.05),
        revenue: 0,
        customers: 0,
        avgOrderValue: 0,
        conversionRate: 5.8,
        cost: 800
      }
    };

    // Calculate revenue and other metrics
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    
    Object.keys(channels).forEach(channel => {
      const channelOrders = channels[channel].orders;
      channels[channel].revenue = (totalRevenue / orders.length) * channelOrders;
      channels[channel].customers = Math.floor(channelOrders * 0.8); // Assume some repeat customers
      channels[channel].avgOrderValue = channels[channel].revenue / Math.max(channelOrders, 1);
      channels[channel].roas = channels[channel].cost > 0 
        ? channels[channel].revenue / channels[channel].cost 
        : Infinity;
      channels[channel].cpa = channelOrders > 0 
        ? channels[channel].cost / channelOrders 
        : 0;
    });

    // Customer journey touchpoints
    const touchpoints = [
      { stage: 'Awareness', visitors: orders.length * 20, source: 'Social Media' },
      { stage: 'Interest', visitors: orders.length * 8, source: 'Organic Search' },
      { stage: 'Consideration', visitors: orders.length * 4, source: 'Email' },
      { stage: 'Purchase', visitors: orders.length, source: 'Direct' }
    ];

    setAttributionData({
      channels,
      touchpoints,
      customerJourney: generateCustomerJourney()
    });
  };

  const generateCustomerJourney = () => {
    return [
      {
        step: 1,
        action: 'Discovery',
        channel: 'Social Media',
        description: 'Customer discovers brand through Instagram post',
        percentage: 100
      },
      {
        step: 2,
        action: 'Research',
        channel: 'Organic Search',
        description: 'Searches for "authentic darjeeling products"',
        percentage: 65
      },
      {
        step: 3,
        action: 'Engagement',
        channel: 'Email',
        description: 'Signs up for newsletter, receives welcome series',
        percentage: 45
      },
      {
        step: 4,
        action: 'Consideration',
        channel: 'Direct',
        description: 'Returns directly to website to browse products',
        percentage: 30
      },
      {
        step: 5,
        action: 'Purchase',
        channel: 'Direct',
        description: 'Completes purchase after reading artisan stories',
        percentage: 18
      }
    ];
  };

  return (
    <div className="space-y-8">
      {/* Channel Performance Overview */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold text-organic-text mb-6">📊 Marketing Channel Performance</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Channel</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Orders</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customers</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">AOV</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Conv Rate</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cost</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ROAS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {Object.entries(attributionData.channels).map(([key, channel]) => (
                <tr key={key} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <div className="font-medium text-gray-900">{channel.name}</div>
                  </td>
                  <td className="px-4 py-4 font-medium">{channel.orders}</td>
                  <td className="px-4 py-4 font-semibold text-green-600">
                    {formatCurrency(channel.revenue)}
                  </td>
                  <td className="px-4 py-4">{channel.customers}</td>
                  <td className="px-4 py-4">{formatCurrency(channel.avgOrderValue)}</td>
                  <td className="px-4 py-4">
                    <span className={`font-medium ${
                      channel.conversionRate > 3 ? 'text-green-600' : 
                      channel.conversionRate > 2 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {channel.conversionRate}%
                    </span>
                  </td>
                  <td className="px-4 py-4">{formatCurrency(channel.cost)}</td>
                  <td className="px-4 py-4">
                    <span className={`font-semibold ${
                      channel.roas > 4 ? 'text-green-600' : 
                      channel.roas > 2 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {channel.roas === Infinity ? '∞' : `${channel.roas.toFixed(1)}x`}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Journey Visualization */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold text-organic-text mb-6">🛤️ Customer Journey Analysis</h3>
        
        <div className="space-y-4">
          {attributionData.customerJourney.map((step, index) => (
            <div key={step.step} className="relative">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-organic-primary text-white rounded-full flex items-center justify-center font-bold">
                  {step.step}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{step.action}</h4>
                    <span className="text-sm font-medium text-organic-primary">
                      {step.percentage}% of users
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{step.description}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                      {step.channel}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Progress bar */}
              <div className="ml-14 mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-organic-primary h-2 rounded-full transition-all duration-500"
                    style={{ width: `${step.percentage}%` }}
                  />
                </div>
              </div>
              
              {/* Connector line */}
              {index < attributionData.customerJourney.length - 1 && (
                <div className="absolute left-5 top-12 w-0.5 h-8 bg-gray-300"></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Attribution Models Comparison */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold text-organic-text mb-6">🔍 Attribution Models Comparison</h3>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">First Touch</h4>
            <div className="text-2xl font-bold text-blue-600 mb-1">35%</div>
            <p className="text-sm text-blue-700">Social Media</p>
            <p className="text-xs text-blue-600 mt-2">
              Credits the first interaction that brought the customer
            </p>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-2">Last Touch</h4>
            <div className="text-2xl font-bold text-green-600 mb-1">42%</div>
            <p className="text-sm text-green-700">Direct Traffic</p>
            <p className="text-xs text-green-600 mt-2">
              Credits the final interaction before purchase
            </p>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <h4 className="font-semibold text-purple-800 mb-2">Linear</h4>
            <div className="text-2xl font-bold text-purple-600 mb-1">23%</div>
            <p className="text-sm text-purple-700">Email Marketing</p>
            <p className="text-xs text-purple-600 mt-2">
              Distributes credit equally across all touchpoints
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}