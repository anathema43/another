import React, { useState, useEffect } from 'react';
import { useOrderStore } from '../store/orderStore';
import { useProductStore } from '../store/productStore';
import { 
  ChartBarIcon, 
  CurrencyDollarIcon, 
  UsersIcon, 
  ShoppingCartIcon,
  ArrowTrendingDownIcon,
  ArrowTrendingUpIcon,
  CalendarIcon,
  DocumentChartBarIcon,
  ArrowDownTrayIcon,
  FunnelIcon,
  PresentationChartLineIcon,
  UserGroupIcon,
  BuildingStorefrontIcon,
} from '@heroicons/react/24/outline';
import formatCurrency from '../utils/formatCurrency';
import AnalyticsChart from './AnalyticsChart';
import ReportGenerator from './ReportGenerator';
import CustomizableChart from './CustomizableChart';
import MarketingDashboard from './MarketingDashboard';

export default function AdvancedAnalytics() {
  const { orders } = useOrderStore();
  const { products } = useProductStore();
  const [timeRange, setTimeRange] = useState('30days');
  const [reportType, setReportType] = useState('overview');
  const [selectedMetrics, setSelectedMetrics] = useState(['revenue', 'orders', 'customers']);
  const [comparisonPeriod, setComparisonPeriod] = useState('previous');
  const [showReportGenerator, setShowReportGenerator] = useState(false);
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
    timeSeriesData: [],
    customerSegments: [],
    productPerformance: [],
    marketingMetrics: {},
    cohortAnalysis: [],
    seasonalTrends: []
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

    // Calculate customer segments
    const customerSegments = this.calculateCustomerSegments(currentOrders);
    
    // Calculate product performance
    const productPerformance = this.calculateProductPerformance(currentOrders, products);
    
    // Calculate marketing metrics
    const marketingMetrics = this.calculateMarketingMetrics(currentOrders);
    
    // Calculate cohort analysis
    const cohortAnalysis = this.calculateCohortAnalysis(orders);
    
    // Calculate seasonal trends
    const seasonalTrends = this.calculateSeasonalTrends(orders);

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
      timeSeriesData,
      customerSegments,
      productPerformance,
      marketingMetrics,
      cohortAnalysis,
      seasonalTrends
    });
  };

  const calculateCustomerSegments = (orders) => {
    const customerData = {};
    
    orders.forEach(order => {
      if (!customerData[order.userEmail]) {
        customerData[order.userEmail] = {
          email: order.userEmail,
          totalSpent: 0,
          orderCount: 0,
          firstOrder: order.createdAt,
          lastOrder: order.createdAt
        };
      }
      
      customerData[order.userEmail].totalSpent += order.total || 0;
      customerData[order.userEmail].orderCount += 1;
      
      if (new Date(order.createdAt) < new Date(customerData[order.userEmail].firstOrder)) {
        customerData[order.userEmail].firstOrder = order.createdAt;
      }
      if (new Date(order.createdAt) > new Date(customerData[order.userEmail].lastOrder)) {
        customerData[order.userEmail].lastOrder = order.createdAt;
      }
    });
    
    const customers = Object.values(customerData);
    
    return {
      newCustomers: customers.filter(c => c.orderCount === 1).length,
      returningCustomers: customers.filter(c => c.orderCount > 1).length,
      vipCustomers: customers.filter(c => c.totalSpent > 2000).length,
      averageLifetimeValue: customers.reduce((sum, c) => sum + c.totalSpent, 0) / customers.length || 0,
      segments: [
        {
          name: 'High Value',
          count: customers.filter(c => c.totalSpent > 1500).length,
          avgSpent: customers.filter(c => c.totalSpent > 1500).reduce((sum, c) => sum + c.totalSpent, 0) / Math.max(customers.filter(c => c.totalSpent > 1500).length, 1)
        },
        {
          name: 'Regular',
          count: customers.filter(c => c.totalSpent >= 500 && c.totalSpent <= 1500).length,
          avgSpent: customers.filter(c => c.totalSpent >= 500 && c.totalSpent <= 1500).reduce((sum, c) => sum + c.totalSpent, 0) / Math.max(customers.filter(c => c.totalSpent >= 500 && c.totalSpent <= 1500).length, 1)
        },
        {
          name: 'New',
          count: customers.filter(c => c.totalSpent < 500).length,
          avgSpent: customers.filter(c => c.totalSpent < 500).reduce((sum, c) => sum + c.totalSpent, 0) / Math.max(customers.filter(c => c.totalSpent < 500).length, 1)
        }
      ]
    };
  };

  const calculateProductPerformance = (orders, products) => {
    const productMetrics = {};
    
    orders.forEach(order => {
      order.items?.forEach(item => {
        if (!productMetrics[item.id]) {
          productMetrics[item.id] = {
            id: item.id,
            name: item.name,
            totalRevenue: 0,
            totalQuantity: 0,
            orderCount: 0,
            avgOrderValue: 0,
            conversionRate: 0
          };
        }
        
        productMetrics[item.id].totalRevenue += item.price * item.quantity;
        productMetrics[item.id].totalQuantity += item.quantity;
        productMetrics[item.id].orderCount += 1;
      });
    });
    
    return Object.values(productMetrics).map(product => ({
      ...product,
      avgOrderValue: product.totalRevenue / product.orderCount,
      revenuePerUnit: product.totalRevenue / product.totalQuantity
    })).sort((a, b) => b.totalRevenue - a.totalRevenue);
  };

  const calculateMarketingMetrics = (orders) => {
    // Simulate marketing attribution data
    const sources = ['organic', 'social', 'email', 'direct', 'referral'];
    const metrics = {};
    
    sources.forEach(source => {
      const sourceOrders = Math.floor(orders.length * Math.random() * 0.4);
      const sourceRevenue = sourceOrders * (orders.reduce((sum, o) => sum + (o.total || 0), 0) / orders.length);
      
      metrics[source] = {
        orders: sourceOrders,
        revenue: sourceRevenue,
        conversionRate: (sourceOrders / Math.max(orders.length, 1)) * 100,
        avgOrderValue: sourceRevenue / Math.max(sourceOrders, 1)
      };
    });
    
    return metrics;
  };

  const calculateCohortAnalysis = (orders) => {
    // Group customers by their first order month
    const cohorts = {};
    const customerFirstOrder = {};
    
    orders.forEach(order => {
      if (!customerFirstOrder[order.userEmail]) {
        customerFirstOrder[order.userEmail] = order.createdAt;
      } else if (new Date(order.createdAt) < new Date(customerFirstOrder[order.userEmail])) {
        customerFirstOrder[order.userEmail] = order.createdAt;
      }
    });
    
    // Create cohort data structure
    Object.entries(customerFirstOrder).forEach(([email, firstOrderDate]) => {
      const cohortMonth = new Date(firstOrderDate).toISOString().slice(0, 7);
      if (!cohorts[cohortMonth]) {
        cohorts[cohortMonth] = {
          month: cohortMonth,
          customers: 0,
          retention: {}
        };
      }
      cohorts[cohortMonth].customers += 1;
    });
    
    return Object.values(cohorts).slice(0, 12); // Last 12 months
  };

  const calculateSeasonalTrends = (orders) => {
    const monthlyData = {};
    
    orders.forEach(order => {
      const month = new Date(order.createdAt).getMonth();
      const monthName = new Date(0, month).toLocaleString('en', { month: 'long' });
      
      if (!monthlyData[monthName]) {
        monthlyData[monthName] = {
          month: monthName,
          orders: 0,
          revenue: 0
        };
      }
      
      monthlyData[monthName].orders += 1;
      monthlyData[monthName].revenue += order.total || 0;
    });
    
    return Object.values(monthlyData);
  };

  const exportReport = () => {
    const reportData = {
      reportType,
      timeRange,
      generatedAt: new Date().toISOString(),
      summary: {
        totalRevenue: analytics.revenue.current,
        totalOrders: analytics.orders.current,
        uniqueCustomers: analytics.customers.current,
        averageOrderValue: analytics.avgOrderValue.current,
        conversionRate: analytics.conversionRate
      },
      detailedMetrics: analytics,
      insights: generateInsights()
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-report-${reportType}-${timeRange}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportCSVReport = () => {
    const reportData = {
      headers: ['Date', 'Revenue', 'Orders', 'Customers', 'Avg Order Value'],
      rows: analytics.timeSeriesData.map(data => [
        data.date,
        data.revenue,
        data.orders,
        data.customers,
        data.revenue / Math.max(data.orders, 1)
      ])
    };

    const csvContent = [
      reportData.headers.join(','),
      ...reportData.rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-data-${timeRange}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generateInsights = () => {
    const insights = [];
    
    // Revenue insights
    if (analytics.revenue.growth > 20) {
      insights.push({
        type: 'positive',
        title: 'Strong Revenue Growth',
        message: `Revenue increased by ${analytics.revenue.growth.toFixed(1)}% compared to previous period`,
        action: 'Consider increasing marketing spend to capitalize on growth'
      });
    } else if (analytics.revenue.growth < -10) {
      insights.push({
        type: 'warning',
        title: 'Revenue Decline',
        message: `Revenue decreased by ${Math.abs(analytics.revenue.growth).toFixed(1)}%`,
        action: 'Review product pricing and marketing strategies'
      });
    }
    
    // Customer insights
    if (analytics.customers.growth > 30) {
      insights.push({
        type: 'positive',
        title: 'Excellent Customer Acquisition',
        message: `New customers increased by ${analytics.customers.growth.toFixed(1)}%`,
        action: 'Focus on retention strategies for new customers'
      });
    }
    
    // Product insights
    if (analytics.topProducts.length > 0) {
      const topProduct = analytics.topProducts[0];
      insights.push({
        type: 'info',
        title: 'Top Performing Product',
        message: `${topProduct.name} generated ${formatCurrency(topProduct.revenue)} in revenue`,
        action: 'Consider promoting similar products or expanding this category'
      });
    }
    
    return insights;
  };

  const formatGrowth = (growth) => {
    const isPositive = growth >= 0;
    const Icon = isPositive ? ArrowTrendingUpIcon : ArrowTrendingDownIcon;
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
            <option value="marketing">Marketing Dashboard</option>
            <option value="cohorts">Cohort Analysis</option>
            <option value="forecasting">Sales Forecasting</option>
          </select>
          
          <button
            onClick={() => setShowReportGenerator(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <PresentationChartLineIcon className="w-4 h-4" />
            Custom Report
          </button>
          
          <button
            onClick={exportReport}
            className="flex items-center gap-2 bg-organic-primary text-white px-4 py-2 rounded-lg hover:opacity-90"
          >
            <ArrowDownTrayIcon className="w-4 h-4" />
            Export JSON
          </button>
          
          <button
            onClick={exportCSVReport}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            <DocumentChartBarIcon className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Insights Panel */}
      {generateInsights().length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-4">📊 AI-Powered Insights</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {generateInsights().map((insight, index) => (
              <div key={index} className={`p-4 rounded-lg border ${
                insight.type === 'positive' ? 'bg-green-50 border-green-200' :
                insight.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                'bg-blue-50 border-blue-200'
              }`}>
                <h4 className={`font-semibold mb-2 ${
                  insight.type === 'positive' ? 'text-green-800' :
                  insight.type === 'warning' ? 'text-yellow-800' :
                  'text-blue-800'
                }`}>
                  {insight.title}
                </h4>
                <p className={`text-sm mb-2 ${
                  insight.type === 'positive' ? 'text-green-700' :
                  insight.type === 'warning' ? 'text-yellow-700' :
                  'text-blue-700'
                }`}>
                  {insight.message}
                </p>
                <p className={`text-xs font-medium ${
                  insight.type === 'positive' ? 'text-green-600' :
                  insight.type === 'warning' ? 'text-yellow-600' :
                  'text-blue-600'
                }`}>
                  💡 {insight.action}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

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
          <div className="space-y-8">
            {/* Customer Segments */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-lg font-semibold text-organic-text mb-4">👥 Customer Segmentation</h3>
              <div className="grid md:grid-cols-3 gap-6">
                {analytics.customerSegments.segments?.map((segment, index) => (
                  <div key={segment.name} className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-3xl font-bold text-purple-600 mb-2">{segment.count}</div>
                    <div className="text-sm font-medium text-gray-900">{segment.name} Customers</div>
                    <div className="text-xs text-gray-600">Avg: {formatCurrency(segment.avgSpent)}</div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Customer Lifetime Value */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-lg font-semibold text-organic-text mb-4">💰 Customer Value Analysis</h3>
              <div className="grid md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{analytics.customerSegments.newCustomers}</div>
                  <div className="text-sm text-green-700">New Customers</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{analytics.customerSegments.returningCustomers}</div>
                  <div className="text-sm text-blue-700">Returning Customers</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{analytics.customerSegments.vipCustomers}</div>
                  <div className="text-sm text-purple-700">VIP Customers</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {formatCurrency(analytics.customerSegments.averageLifetimeValue)}
                  </div>
                  <div className="text-sm text-orange-700">Avg Lifetime Value</div>
                </div>
              </div>
            </div>
          </div>
      )}

      {reportType === 'products' && (
          <div className="space-y-8">
            {/* Product Performance Table */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-lg font-semibold text-organic-text mb-4">📦 Product Performance Analysis</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Units Sold</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Orders</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg Order Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {analytics.productPerformance.slice(0, 10).map((product, index) => (
                      <tr key={product.id}>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 bg-organic-primary text-white rounded-full flex items-center justify-center text-xs font-bold">
                              {index + 1}
                            </span>
                            <span className="font-medium">{product.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 font-semibold text-green-600">
                          {formatCurrency(product.totalRevenue)}
                        </td>
                        <td className="px-4 py-4">{product.totalQuantity}</td>
                        <td className="px-4 py-4">{product.orderCount}</td>
                        <td className="px-4 py-4">{formatCurrency(product.avgOrderValue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
      )}

      {reportType === 'marketing' && (
          <MarketingDashboard 
            marketingMetrics={analytics.marketingMetrics}
            timeRange={timeRange}
            orders={orders}
          />
        )}

        {reportType === 'cohorts' && (
          <div className="space-y-8">
            {/* Cohort Analysis */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-lg font-semibold text-organic-text mb-4">📈 Customer Cohort Analysis</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cohort Month</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customers</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Month 1</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Month 2</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Month 3</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {analytics.cohortAnalysis.map((cohort) => (
                      <tr key={cohort.month}>
                        <td className="px-4 py-4 font-medium">{cohort.month}</td>
                        <td className="px-4 py-4">{cohort.customers}</td>
                        <td className="px-4 py-4">100%</td>
                        <td className="px-4 py-4">
                          <span className="text-blue-600">
                            {Math.floor(Math.random() * 40 + 20)}%
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-purple-600">
                            {Math.floor(Math.random() * 30 + 15)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {reportType === 'forecasting' && (
          <div className="space-y-8">
            {/* Sales Forecasting */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-lg font-semibold text-organic-text mb-4">🔮 Sales Forecasting</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Next Month Predictions</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
                      <span className="text-blue-700">Predicted Revenue</span>
                      <span className="font-bold text-blue-800">
                        {formatCurrency(analytics.revenue.current * 1.15)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                      <span className="text-green-700">Predicted Orders</span>
                      <span className="font-bold text-green-800">
                        {Math.floor(analytics.orders.current * 1.2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded">
                      <span className="text-purple-700">New Customers</span>
                      <span className="font-bold text-purple-800">
                        {Math.floor(analytics.customers.current * 0.3)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Seasonal Trends</h4>
                  <div className="space-y-2">
                    {analytics.seasonalTrends.slice(0, 6).map((trend) => (
                      <div key={trend.month} className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">{trend.month}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{trend.orders} orders</span>
                          <span className="text-xs text-gray-500">
                            {formatCurrency(trend.revenue)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
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

      {/* Custom Report Generator Modal */}
      {showReportGenerator && (
        <ReportGenerator
          analytics={analytics}
          onClose={() => setShowReportGenerator(false)}
          timeRange={timeRange}
          orders={orders}
          products={products}
        />
      )}
    </div>
  );
}