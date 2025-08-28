import React, { useState, useEffect } from 'react';
import { 
  ChartBarIcon, 
  CursorArrowRaysIcon, 
  EyeIcon, 
  ShoppingCartIcon,
  UserPlusIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import formatCurrency from '../utils/formatCurrency';

export default function MarketingDashboard({ marketingMetrics, timeRange, orders }) {
  const [selectedChannel, setSelectedChannel] = useState('all');
  const [campaignData, setCampaignData] = useState([]);

  useEffect(() => {
    // Simulate campaign performance data
    const campaigns = [
      {
        id: 'social-media-1',
        name: 'Instagram Stories - Artisan Spotlight',
        channel: 'social',
        spend: 5000,
        impressions: 45000,
        clicks: 1200,
        conversions: 24,
        revenue: 7200,
        status: 'active'
      },
      {
        id: 'google-ads-1',
        name: 'Google Ads - Himalayan Products',
        channel: 'search',
        spend: 8000,
        impressions: 32000,
        clicks: 960,
        conversions: 32,
        revenue: 12800,
        status: 'active'
      },
      {
        id: 'email-1',
        name: 'Newsletter - New Product Launch',
        channel: 'email',
        spend: 500,
        impressions: 8500,
        clicks: 340,
        conversions: 17,
        revenue: 5100,
        status: 'completed'
      }
    ];
    
    setCampaignData(campaigns);
  }, []);

  const calculateChannelMetrics = () => {
    const channels = {};
    
    Object.entries(marketingMetrics).forEach(([channel, metrics]) => {
      const campaignSpend = campaignData
        .filter(c => c.channel === channel)
        .reduce((sum, c) => sum + c.spend, 0);
      
      channels[channel] = {
        ...metrics,
        spend: campaignSpend,
        roas: campaignSpend > 0 ? metrics.revenue / campaignSpend : 0,
        cpa: metrics.orders > 0 ? campaignSpend / metrics.orders : 0
      };
    });
    
    return channels;
  };

  const channelMetrics = calculateChannelMetrics();

  return (
    <div className="space-y-8">
      {/* Marketing Overview */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <EyeIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Impressions</p>
                <p className="text-2xl font-bold text-blue-600">
                  {campaignData.reduce((sum, c) => sum + c.impressions, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CursorArrowRaysIcon className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Clicks</p>
                <p className="text-2xl font-bold text-green-600">
                  {campaignData.reduce((sum, c) => sum + c.clicks, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <ShoppingCartIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Conversions</p>
                <p className="text-2xl font-bold text-purple-600">
                  {campaignData.reduce((sum, c) => sum + c.conversions, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <CurrencyDollarIcon className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Marketing ROI</p>
                <p className="text-2xl font-bold text-orange-600">
                  {(campaignData.reduce((sum, c) => sum + c.revenue, 0) / 
                    Math.max(campaignData.reduce((sum, c) => sum + c.spend, 0), 1) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Channel Performance */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold text-organic-text mb-4">📈 Channel Performance</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Channel</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Orders</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Spend</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ROAS</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">CPA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {Object.entries(channelMetrics).map(([channel, metrics]) => (
                <tr key={channel}>
                  <td className="px-4 py-4">
                    <span className="font-medium capitalize">{channel}</span>
                  </td>
                  <td className="px-4 py-4">{metrics.orders}</td>
                  <td className="px-4 py-4 font-semibold text-green-600">
                    {formatCurrency(metrics.revenue)}
                  </td>
                  <td className="px-4 py-4">{formatCurrency(metrics.spend)}</td>
                  <td className="px-4 py-4">
                    <span className={`font-semibold ${
                      metrics.roas > 3 ? 'text-green-600' : 
                      metrics.roas > 2 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {metrics.roas.toFixed(2)}x
                    </span>
                  </td>
                  <td className="px-4 py-4">{formatCurrency(metrics.cpa)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Campaign Performance */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-organic-text">🎯 Campaign Performance</h3>
          <select
            value={selectedChannel}
            onChange={(e) => setSelectedChannel(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-organic-primary"
          >
            <option value="all">All Channels</option>
            <option value="social">Social Media</option>
            <option value="search">Search Ads</option>
            <option value="email">Email Marketing</option>
          </select>
        </div>
        
        <div className="space-y-4">
          {campaignData
            .filter(campaign => selectedChannel === 'all' || campaign.channel === selectedChannel)
            .map((campaign) => (
            <div key={campaign.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-medium text-gray-900">{campaign.name}</h4>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="capitalize">{campaign.channel}</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      campaign.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {campaign.status}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-600">
                    {formatCurrency(campaign.revenue)}
                  </div>
                  <div className="text-sm text-gray-600">
                    ROAS: {(campaign.revenue / campaign.spend).toFixed(2)}x
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-lg font-semibold text-blue-600">
                    {campaign.impressions.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-600">Impressions</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-green-600">{campaign.clicks}</div>
                  <div className="text-xs text-gray-600">Clicks</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-purple-600">{campaign.conversions}</div>
                  <div className="text-xs text-gray-600">Conversions</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-orange-600">
                    {((campaign.clicks / campaign.impressions) * 100).toFixed(2)}%
                  </div>
                  <div className="text-xs text-gray-600">CTR</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Attribution Model */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold text-organic-text mb-4">🔍 Attribution Analysis</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Customer Journey Touchpoints</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <span className="text-sm text-gray-700">First Touch</span>
                <span className="font-semibold">Social Media (35%)</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <span className="text-sm text-gray-700">Assisted Touch</span>
                <span className="font-semibold">Email (28%)</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <span className="text-sm text-gray-700">Last Touch</span>
                <span className="font-semibold">Direct (42%)</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Conversion Funnel</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Website Visits</span>
                <span className="font-semibold">~{orders.length * 15}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Product Views</span>
                <span className="font-semibold">~{orders.length * 8}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Cart Additions</span>
                <span className="font-semibold">~{orders.length * 3}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Checkouts Started</span>
                <span className="font-semibold">~{Math.floor(orders.length * 1.5)}</span>
              </div>
              <div className="flex items-center justify-between border-t pt-2">
                <span className="text-sm font-medium text-organic-text">Orders Completed</span>
                <span className="font-bold text-organic-primary">{orders.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}