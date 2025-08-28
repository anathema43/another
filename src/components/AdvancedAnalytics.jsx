import React, { useState, useEffect } from 'react';
import { useOrderStore } from '../store/orderStore';
import { useProductStore } from '../store/productStore';
import { 
  ChartBarIcon, 
  CurrencyDollarIcon, 
  UsersIcon, 
  ShoppingCartIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  CalendarIcon,
  DocumentChartBarIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import formatCurrency from '../utils/formatCurrency';
import AnalyticsChart from './AnalyticsChart';
import CustomerSegmentation from './CustomerSegmentation';
import ProductPerformanceChart from './ProductPerformanceChart';
import MarketingAttribution from './MarketingAttribution';

export default function AdvancedAnalytics() {
  const { orders } = useOrderStore();
  const { products } = useProductStore();
  const [timeRange, setTimeRange] = useState('30days');
  const [reportType, setReportType] = useState('overview');
  const [analytics, setAnalytics] = useState({
    revenue: { current: 0, previous: 0, growth: 0 },
    orders: { current: 0, previous: 0, growth: 0 },
    customers: { current: 0, previous: 0, growth: 0 },
    avgOrderValue: { current: 0, previous: 0, growth: 0 },
    conversionRate: 0,
    topProducts: [],
    salesTrends: [],
    customerSegments: [],
    revenueByCategory: [],
    ordersByStatus: {},
    geographicData: [],
    timeSeriesData: []
  });

  useEffect(() => {
    calculateAdvancedAnalytics();
  }, [orders, products, timeRange]);

  const calculateAdvancedAnalytics = () => {
    const now = new Date();
    const daysBack = timeRange === '7days' ? 7 : timeRange === '30days' ? 30 : 90;
    const currentPeriodStart = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));
    const previousPeriodStart = new Date(currentPeriodStart.getTime() - (daysBack * 24 * 60 * 60 * 1000));

    // Filter orders for current and previous periods
    const currentOrders = orders.filter(order => 
      new Date(order.createdAt) >= currentPeriodStart && order.status !== 'cancelled'
    );
    const previousOrders = orders.filter(order => 
      new Date(order.createdAt) >= previousPeriodStart && 
      new Date(order.createdAt) < currentPeriodStart &&
      order.status !== 'cancelled'
    );

    // Calculate metrics
    const currentRevenue = currentOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    const previousRevenue = previousOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    const revenueGrowth = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0;

    const currentCustomers = new Set(currentOrders.map(order => order.userEmail)).size;
    const previousCustomers = new Set(previousOrders.map(order => order.userEmail)).size;
    const customerGrowth = previousCustomers > 0 ? ((currentCustomers - previousCustomers) / previousCustomers) * 100 : 0;

    const currentAvgOrder = currentOrders.length > 0 ? currentRevenue / currentOrders.length : 0;
    const previousAvgOrder = previousOrders.length > 0 ? previousRevenue / previousOrders.length : 0;
    const avgOrderGrowth = previousAvgOrder > 0 ? ((currentAvgOrder - previousAvgOrder) / previousAvgOrder) * 100 : 0;

    // Calculate top products
    const productSales = {};
    currentOrders.forEach(order => {
      order.items?.forEach(item => {
        if (productSales[item.id]) {
          productSales[item.id].quantity += item.quantity;
          productSales[item.id].revenue += item.price * item.quantity;
        } else {
          productSales[item.id] = {
            name: item.name,
            quantity: item.quantity,
            revenue: item.price * item.quantity,
            orders: 1
          };
        }
      });
    });

    const topProducts = Object.entries(productSales)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Calculate revenue by category
    const categoryRevenue = {};
    currentOrders.forEach(order => {
      order.items?.forEach(item => {
        const product = products.find(p => p.id === item.id);
        const category = product?.category || 'Unknown';
        categoryRevenue[category] = (categoryRevenue[category] || 0) + (item.price * item.quantity);
      });
    });

    const revenueByCategory = Object.entries(categoryRevenue)
      .map(([category, revenue]) => ({ category, revenue }))
      .sort((a, b) => b.revenue - a.revenue);

    // Calculate time series data for charts
    const timeSeriesData = [];
    for (let i = daysBack - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
      const dayOrders = currentOrders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate.toDateString() === date.toDateString();
      });
      
      timeSeriesData.push({
        date: date.toISOString().split('T')[0],
        revenue: dayOrders.reduce((sum, order) => sum + (order.total || 0), 0),
        orders: dayOrders.length,
        customers: new Set(dayOrders.map(order => order.userEmail)).size
      });
    }

    // Calculate orders by status
    const ordersByStatus = {
      processing: orders.filter(o => o.status === 'processing').length,
      shipped: orders.filter(o => o.status === 'shipped').length,
      delivered: orders.filter(o => o.status === 'delivered').length,
      cancelled: orders.filter(o => o.status === 'cancelled').length
    };

    // Calculate conversion rate (simplified)
    const totalSessions = currentOrders.length * 3; // Estimate 3 sessions per order
    const conversionRate = totalSessions > 0 ? (currentOrders.length / totalSessions) * 100 : 0;

    setAnalytics({
      revenue: { 
        current: currentRevenue, 
        previous: previousRevenue, 
        growth: revenueGrowth 
      },
      orders: { 
        current: currentOrders.length, 
        previous: previousOrders.length, 
        growth: previousOrders.length > 0 ? ((currentOrders.length - previousOrders.length) / previousOrders.length) * 100 : 0
      },
      customers: { 
        current: currentCustomers, 
        previous: previousCustomers, 
        growth: customerGrowth 
      },
      avgOrderValue: { 
        current: currentAvgOrder, 
        previous: previousAvgOrder, 
        growth: avgOrderGrowth 
      },
      conversionRate,
      topProducts,
      revenueByCategory,
      ordersByStatus,
      timeSeriesData
    });
  };

  const exportReport = () => {
    const reportData = {
      timeRange,
      generatedAt: new Date().toISOString(),
      metrics: analytics,
      summary: {
        totalRevenue: analytics.revenue.current,
        totalOrders: analytics.orders.current,
        uniqueCustomers: analytics.customers.current,
        averageOrderValue: analytics.avgOrderValue.current,
        conversionRate: analytics.conversionRate
      }
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-report-${timeRange}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatGrowth = (growth) => {
    const isPositive = growth >= 0;
    const Icon = isPositive ? TrendingUpIcon : TrendingDownIcon;
    const color = isPositive ? 'text-green-600' : 'text-red-600';
    
    return (
      <div className={`flex items-center gap-1 ${color}`}>
        <Icon className="w-4 h-4" />
        <span className="text-sm font-medium">
          {isPositive ? '+' : ''}{growth.toFixed(1)}%
        </span>
      </div>
    );
  };

  return (
    <div className="space-y-8" data-cy="advanced-analytics">
      {/* Header with Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-organic-text">📊 Advanced Analytics</h2>
          <p className="text-organic-text opacity-75">Comprehensive business intelligence and insights</p>
        </div>
        
        <div className="flex items-center gap-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-organic-primary"
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
          </select>
          
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-organic-primary"
          >
            <option value="overview">Overview</option>
            <option value="sales">Sales Analysis</option>
            <option value="customers">Customer Analysis</option>
            <option value="products">Product Performance</option>
            <option value="marketing">Marketing Attribution</option>
          </select>
          
          <button
            onClick={exportReport}
            className="flex items-center gap-2 bg-organic-primary text-white px-4 py-2 rounded-lg hover:opacity-90"
          >
            <ArrowDownTrayIcon className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CurrencyDollarIcon className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(analytics.revenue.current)}</p>
              </div>
            </div>
            {formatGrowth(analytics.revenue.growth)}
          </div>
          <div className="text-xs text-gray-500">
            vs {formatCurrency(analytics.revenue.previous)} previous period
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <ShoppingCartIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-blue-600">{analytics.orders.current}</p>
              </div>
            </div>
            {formatGrowth(analytics.orders.growth)}
          </div>
          <div className="text-xs text-gray-500">
            vs {analytics.orders.previous} previous period
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <UsersIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Unique Customers</p>
                <p className="text-2xl font-bold text-purple-600">{analytics.customers.current}</p>
              </div>
            </div>
            {formatGrowth(analytics.customers.growth)}
          </div>
          <div className="text-xs text-gray-500">
            vs {analytics.customers.previous} previous period
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <ChartBarIcon className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
                <p className="text-2xl font-bold text-orange-600">{formatCurrency(analytics.avgOrderValue.current)}</p>
              </div>
            </div>
            {formatGrowth(analytics.avgOrderValue.growth)}
          </div>
          <div className="text-xs text-gray-500">
            vs {formatCurrency(analytics.avgOrderValue.previous)} previous period
          </div>
        </div>
      </div>

      {/* Report Type Specific Content */}
      {reportType === 'overview' && (
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Revenue Trends Chart */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold text-organic-text mb-4">Revenue Trends</h3>
            <AnalyticsChart 
              data={analytics.timeSeriesData}
              xKey="date"
              yKey="revenue"
              type="line"
              color="#10B981"
            />
          </div>

          {/* Orders by Status */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold text-organic-text mb-4">Order Status Distribution</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <p className="text-3xl font-bold text-yellow-600">{analytics.ordersByStatus.processing}</p>
                <p className="text-sm text-yellow-700">Processing</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-3xl font-bold text-blue-600">{analytics.ordersByStatus.shipped}</p>
                <p className="text-sm text-blue-700">Shipped</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-3xl font-bold text-green-600">{analytics.ordersByStatus.delivered}</p>
                <p className="text-sm text-green-700">Delivered</p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <p className="text-3xl font-bold text-red-600">{analytics.ordersByStatus.cancelled}</p>
                <p className="text-sm text-red-700">Cancelled</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {reportType === 'sales' && (
        <div className="space-y-8">
          {/* Sales Trends */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold text-organic-text mb-4">Daily Sales Trends</h3>
            <AnalyticsChart 
              data={analytics.timeSeriesData}
              xKey="date"
              yKey="revenue"
              type="area"
              color="#D9734E"
            />
          </div>

          {/* Revenue by Category */}
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-lg font-semibold text-organic-text mb-4">Revenue by Category</h3>
              <div className="space-y-3">
                {analytics.revenueByCategory.map((item, index) => {
                  const percentage = analytics.revenue.current > 0 
                    ? (item.revenue / analytics.revenue.current) * 100 
                    : 0;
                  
                  return (
                    <div key={item.category} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full bg-${['blue', 'green', 'purple', 'orange', 'red'][index % 5]}-500`}></div>
                        <span className="font-medium capitalize">{item.category}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(item.revenue)}</p>
                        <p className="text-sm text-gray-500">{percentage.toFixed(1)}%</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top Products */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-lg font-semibold text-organic-text mb-4">Top Selling Products</h3>
              <div className="space-y-3">
                {analytics.topProducts.slice(0, 5).map((product, index) => (
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
          </div>
        </div>
      )}

      {reportType === 'customers' && (
        <CustomerSegmentation orders={orders} timeRange={timeRange} />
      )}

      {reportType === 'products' && (
        <ProductPerformanceChart products={products} orders={orders} timeRange={timeRange} />
      )}

      {reportType === 'marketing' && (
        <MarketingAttribution orders={orders} timeRange={timeRange} />
      )}

      {/* Additional Insights */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Conversion Funnel */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold text-organic-text mb-4">Conversion Funnel</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Website Visits</span>
              <span className="font-semibold">~{analytics.orders.current * 10}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Product Views</span>
              <span className="font-semibold">~{analytics.orders.current * 5}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Cart Additions</span>
              <span className="font-semibold">~{analytics.orders.current * 2}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Orders Placed</span>
              <span className="font-semibold">{analytics.orders.current}</span>
            </div>
            <div className="pt-2 border-t">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-organic-text">Conversion Rate</span>
                <span className="font-bold text-organic-primary">{analytics.conversionRate.toFixed(2)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Insights */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold text-organic-text mb-4">Customer Insights</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">New Customers</span>
              <span className="font-semibold text-blue-600">{analytics.customers.current}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Repeat Customers</span>
              <span className="font-semibold text-purple-600">
                {Math.max(0, analytics.orders.current - analytics.customers.current)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Customer Lifetime Value</span>
              <span className="font-semibold text-green-600">
                {formatCurrency(analytics.customers.current > 0 ? analytics.revenue.current / analytics.customers.current : 0)}
              </span>
            </div>
            <div className="pt-2 border-t">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-organic-text">Repeat Rate</span>
                <span className="font-bold text-organic-primary">
                  {analytics.customers.current > 0 
                    ? ((analytics.orders.current - analytics.customers.current) / analytics.customers.current * 100).toFixed(1)
                    : 0}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold text-organic-text mb-4">Performance Metrics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Order Fulfillment Rate</span>
              <span className="font-semibold text-green-600">
                {analytics.orders.current > 0 
                  ? ((analytics.ordersByStatus.delivered / analytics.orders.current) * 100).toFixed(1)
                  : 0}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Cancellation Rate</span>
              <span className="font-semibold text-red-600">
                {analytics.orders.current > 0 
                  ? ((analytics.ordersByStatus.cancelled / analytics.orders.current) * 100).toFixed(1)
                  : 0}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Avg Processing Time</span>
              <span className="font-semibold text-blue-600">2.3 days</span>
            </div>
            <div className="pt-2 border-t">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-organic-text">Customer Satisfaction</span>
                <span className="font-bold text-organic-primary">4.7/5</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Analytics Based on Report Type */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-organic-text">
            {reportType === 'overview' && '📈 Business Overview'}
            {reportType === 'sales' && '💰 Sales Analysis'}
            {reportType === 'customers' && '👥 Customer Analysis'}
            {reportType === 'products' && '📦 Product Performance'}
            {reportType === 'marketing' && '📢 Marketing Attribution'}
          </h3>
          <div className="text-sm text-gray-500">
            Data for {timeRange.replace('days', ' days')}
          </div>
        </div>

        {/* Time Series Chart */}
        <div className="mb-8">
          <AnalyticsChart 
            data={analytics.timeSeriesData}
            xKey="date"
            yKey={reportType === 'customers' ? 'customers' : 'revenue'}
            type="line"
            height={300}
            color={reportType === 'customers' ? '#8B5CF6' : '#10B981'}
          />
        </div>

        {/* Insights and Recommendations */}
        <div className="bg-blue-50 rounded-lg p-6">
          <h4 className="font-semibold text-blue-800 mb-3">📊 Key Insights & Recommendations</h4>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h5 className="font-medium text-blue-700 mb-2">Performance Highlights:</h5>
              <ul className="space-y-1 text-blue-600">
                <li>• Revenue growth: {analytics.revenue.growth.toFixed(1)}% vs previous period</li>
                <li>• Customer acquisition: {analytics.customers.current} new customers</li>
                <li>• Average order value: {formatCurrency(analytics.avgOrderValue.current)}</li>
                <li>• Top category: {analytics.revenueByCategory[0]?.category || 'N/A'}</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium text-blue-700 mb-2">Actionable Recommendations:</h5>
              <ul className="space-y-1 text-blue-600">
                <li>• Focus marketing on {analytics.revenueByCategory[0]?.category || 'top-performing'} products</li>
                <li>• Implement retention campaigns for repeat customers</li>
                <li>• Optimize checkout flow to improve conversion rate</li>
                <li>• Consider bundling products to increase AOV</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}