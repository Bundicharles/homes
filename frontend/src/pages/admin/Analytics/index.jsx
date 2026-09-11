import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart3,
  TrendingUp,
  Users,
  Building,
  MessageCircle,
  Calendar,
  Eye,
  Heart,
  Megaphone,
  DollarSign,
  Filter,
  AlertCircle,
  Download,
} from 'lucide-react';
import { analyticsAPI } from '@/services/api';
import { useSettings } from '@/context/SettingsContext';
import { LoadingSkeleton, EmptyState, Pagination } from '@/components/Modal';
import VatExcl from '@/components/VatExcl';
import { formatNumber, formatPrice } from '@/utils';
import { AnalyticsGraph } from '@/components/AnalyticsGraph';

const AdminAnalytics = () => {
  const { settings } = useSettings();
  const businessName = settings.business_name || 'Hemaprin Homes';

  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('30d');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    document.title = `Analytics | ${businessName} Admin`;
  }, [businessName]);

  const {
    data: statsData,
    isLoading: statsLoading,
    error: statsError,
    refetch: refetchStats,
  } = useQuery({
    queryKey: ['admin.dashboard.stats'],
    queryFn: () => analyticsAPI.getStats(),
    staleTime: 60000,
  });

  const {
    data: chartsData,
    isLoading: chartsLoading,
    error: chartsError,
  } = useQuery({
    queryKey: ['admin.analytics.charts', dateRange],
    queryFn: () => analyticsAPI.getCharts({ range: dateRange, field: 'created_at' }),
    staleTime: 60000,
  });

  const {
    data: auditData,
    isLoading: auditLoading,
    error: auditError,
  } = useQuery({
    queryKey: ['admin.audit-logs', currentPage],
    queryFn: () => analyticsAPI.getAuditLogs({ page: currentPage, limit: 30 }),
    staleTime: 60000,
    enabled: activeTab === 'audit',
  });

  const stats = statsData?.success ? statsData.data : null;
  const charts = chartsData?.success ? chartsData.data : null;
  const auditLogs = auditData?.success ? (auditData.data.data || []) : [];
  const auditPagination = auditData?.data?.pagination || auditData?.pagination;

  const totalProperties = stats?.total_properties || 0;
  const totalValue = stats ? (stats.total_properties * 0) : 0;

  const statCards = stats
    ? [
        {
          name: 'Total Properties',
          value: stats.total_properties,
          icon: Building,
          color: 'text-primary',
          bg: 'bg-primary/10',
        },
        {
          name: 'Customers',
          value: stats.total_customers,
          icon: Users,
          color: 'text-secondary',
          bg: 'bg-secondary/10',
        },
        {
          name: 'Inquiries',
          value: stats.total_inquiries,
          icon: MessageCircle,
          color: 'text-accent',
          bg: 'bg-accent/10',
        },
        {
          name: 'Unread Messages',
          value: stats.unread_messages,
          icon: MessageCircle,
          color: 'text-error',
          bg: 'bg-error/10',
        },
        {
          name: 'Viewing Requests',
          value: stats.viewing_requests,
          icon: Calendar,
          color: 'text-warning',
          bg: 'bg-warning/10',
        },
        {
          name: 'Property Views',
          value: stats.total_property_views,
          icon: Eye,
          color: 'text-primary',
          bg: 'bg-primary/10',
        },
        {
          name: 'Favorites',
          value: stats.total_favorites,
          icon: Heart,
          color: 'text-error',
          bg: 'bg-error/10',
        },
        {
          name: 'Promotions',
          value: stats.total_promotions,
          icon: Megaphone,
          color: 'text-secondary',
          bg: 'bg-secondary/10',
        },
      ]
    : [];



  const tabs = [
    { value: 'overview', label: 'Overview', icon: BarChart3 },
    { value: 'charts', label: 'Charts & Trends', icon: TrendingUp },
    { value: 'audit', label: 'Audit Logs', icon: MessageCircle },
  ];

  const dateRanges = [
    { value: 'today', label: 'Today' },
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' },
    { value: 'custom', label: 'Custom' },
  ];

  const statusColors = {
    Draft: 'bg-gray-100 text-gray-800',
    Published: 'bg-blue-100 text-blue-800',
    Available: 'bg-green-100 text-green-800',
    Reserved: 'bg-yellow-100 text-yellow-800',
    'Under Offer': 'bg-orange-100 text-orange-800',
    Sold: 'bg-red-100 text-red-800',
    'Coming Soon': 'bg-purple-100 text-purple-800',
    Hidden: 'bg-gray-200 text-gray-600',
  };

  if (statsLoading && !stats) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="card p-4 animate-pulse">
              <div className="h-4 bg-muted/20 rounded w-3/4 mb-2" />
              <div className="h-8 bg-muted/20 rounded w-1/2" />
            </div>
          ))}
        </div>
        <LoadingSkeleton count={3} type="card" />
      </div>
    );
  }

  if (statsError) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-error mx-auto mb-4" />
        <p className="text-error mb-4">Failed to load analytics data.</p>
        <button onClick={() => refetchStats()} className="btn btn-primary">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-text">
            Analytics Dashboard
          </h1>
          <p className="text-muted mt-1">
            Detailed analytics and performance metrics for your real estate platform.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="btn btn-ghost btn-sm flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 bg-surface-hover rounded-lg p-1 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={[
                'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors',
                activeTab === tab.value ? 'bg-primary text-white' : 'text-muted hover:text-text hover:bg-surface',
              ].join(' ')}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'overview' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {statCards.map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.name} className="card p-4 hover:shadow-card transition-shadow">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${card.bg}`}>
                      <Icon className={`w-6 h-6 ${card.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-muted truncate">{card.name}</p>
                      <p className="text-2xl font-bold text-text">
                        {formatNumber(card.value)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="card p-6">
            <h2 className="text-lg font-semibold text-text mb-4">Property Status Distribution</h2>
            {chartsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-12 bg-muted/20 rounded animate-pulse" />
                ))}
              </div>
            ) : charts && charts.property_status_distribution && charts.property_status_distribution.length > 0 ? (
              <div className="space-y-3">
                {charts.property_status_distribution.map((item) => {
                  const status = item.s || 'Unknown';
                  const count = item.count;
                  const total = stats.total_properties || 1;
                  const percentage = Math.round((count / total) * 100);
                  return (
                    <div key={status} className="flex items-center gap-3">
                      <div className="w-32 text-sm text-text">{status}</div>
                      <div className="flex-1 h-6 bg-surface-hover rounded-lg overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-lg transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="w-12 text-right text-sm font-medium text-text">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState message="No status data available." type="default" />
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-text mb-4">Top Properties by Views</h3>
              {!charts ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-12 bg-muted/20 rounded animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="space-y-1">
                  {charts.top_properties && charts.top_properties.length > 0 ? (
                    charts.top_properties.map((property, index) => (
                      <div
                        key={property.id}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-hover/50"
                      >
                        <span className="w-6 text-center font-bold text-muted">
                          {index + 1}
                        </span>
                        <div className="flex-1">
                          <p className="font-medium text-text line-clamp-1">
                            {property.name}
                          </p>
                          <p className="text-xs text-muted">{property.views} views</p>
                        </div>
                        <a
                          href={`/properties/${property.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:text-primary-hover text-sm"
                        >
                          View
                        </a>
                      </div>
                    ))
                  ) : (
                    <EmptyState message="No property data available." type="default" />
                  )}
                </div>
              )}
            </div>

            <div className="card p-6">
              <h3 className="text-lg font-semibold text-text mb-4">Most Favorited Properties</h3>
              {charts?.top_favorites && charts.top_favorites.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-surface-hover/50">
                        <th className="text-left px-4 py-2 text-xs font-medium text-muted uppercase">
                          Rank
                        </th>
                        <th className="text-left px-4 py-2 text-xs font-medium text-muted uppercase">
                          Property
                        </th>
                        <th className="text-left px-4 py-2 text-xs font-medium text-muted uppercase">
                          Favorites
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {charts.top_favorites.map((property, index) => (
                        <tr
                          key={property.id}
                          className="hover:bg-surface-hover/50 transition-colors"
                        >
                          <td className="px-4 py-3">
                            <span className="text-muted">{index + 1}</span>
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-medium text-text line-clamp-1">
                              {property.name}
                            </p>
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-medium text-text">
                              {formatNumber(property.favorites)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState message="No favorites data available." type="default" />
              )}
            </div>
          </div>
        </>
      )}

      {activeTab === 'charts' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-text">Trend Analysis</h2>
            <div className="flex items-center gap-2 bg-surface-hover rounded-lg p-1">
              {dateRanges.map((range) => (
                <button
                  key={range.value}
                  onClick={() => setDateRange(range.value)}
                  className={`
                    px-3 py-1.5 text-sm font-medium rounded-md transition-colors
                    ${dateRange === range.value
                      ? 'bg-primary text-white'
                      : 'text-muted hover:text-text hover:bg-surface'}
                  `}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>

          {chartsLoading ? (
            <LoadingSkeleton count={3} type="card" />
          ) : chartsError ? (
            <div className="text-center py-8 text-muted">
              Failed to load chart data
            </div>
          ) : charts ? (
            <div className="space-y-6">
              <AnalyticsGraph
                data={charts.property_views_chart}
                title="Property Views Trend"
                color="#2563eb"
              />
              <AnalyticsGraph
                data={charts.inquiries_chart}
                title="Customer Inquiries Trend"
                color="#ea580c"
              />
              <AnalyticsGraph
                data={charts.customers_chart}
                title="New Customers Trend"
                color="#7c3aed"
              />
              <div className="card p-6">
                <h3 className="text-sm font-medium text-muted mb-3">
                  Most Favorited Properties
                </h3>
                {charts.top_favorites && charts.top_favorites.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[600px]">
                      <thead>
                        <tr className="border-b border-border bg-surface-hover/50">
                          <th className="text-left px-4 py-2 text-xs font-medium text-muted uppercase">
                            Rank
                          </th>
                          <th className="text-left px-4 py-2 text-xs font-medium text-muted uppercase">
                            Property
                          </th>
                          <th className="text-left px-4 py-2 text-xs font-medium text-muted uppercase">
                            Favorites
                          </th>
                          <th className="text-left px-4 py-2 text-xs font-medium text-muted uppercase">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {charts.top_favorites.map((property, index) => (
                          <tr
                            key={property.id}
                            className="hover:bg-surface-hover/50 transition-colors"
                          >
                            <td className="px-4 py-3">
                              <span className="text-muted">{index + 1}</span>
                            </td>
                            <td className="px-4 py-3">
                              <p className="font-medium text-text line-clamp-1">
                                {property.name}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <p className="text-xs text-muted">
                                  {formatPrice(property.price, property.currency || 'KES')}
                                </p>
                                <VatExcl />
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="font-medium text-text">
                                {formatNumber(property.favorites)}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  statusColors[property.status] || 'bg-gray-100 text-gray-800'
                                }`}
                              >
                                {property.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <EmptyState message="No favorites data available." type="default" />
                )}
              </div>
            </div>
          ) : (
            <EmptyState message="No chart data available." type="default" />
          )}
        </div>
      )}

      {activeTab === 'audit' && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-text mb-4">Recent Audit Logs</h2>
          {auditLoading ? (
            <LoadingSkeleton count={8} type="table" />
          ) : auditError ? (
            <div className="text-center py-8 text-muted">
              Failed to load audit logs
            </div>
          ) : auditLogs.length === 0 ? (
            <EmptyState message="No audit logs available." type="default" />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px]">
                  <thead>
                    <tr className="border-b border-border bg-surface-hover/50">
                      <th className="text-left px-4 py-3 text-xs font-medium text-muted uppercase">
                        Date
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-muted uppercase">
                        User
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-muted uppercase">
                        Action
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-muted uppercase">
                        Table
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-muted uppercase">
                        Record ID
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-muted uppercase">
                        IP Address
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {auditLogs.map((log) => (
                      <tr
                        key={log.id}
                        className="hover:bg-surface-hover/50 transition-colors"
                      >
                        <td className="px-4 py-3 text-sm text-muted">
                          {new Date(log.created_at).toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-medium text-text">
                            {log.user_name || 'System'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-text">{log.action}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-muted">{log.table_name}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-muted">{log.record_id || '-'}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-muted">{log.ip_address || '-'}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {auditPagination && (
                <Pagination
                  currentPage={auditPagination.page}
                  totalPages={auditPagination.total_pages}
                  onPageChange={setCurrentPage}
                />
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminAnalytics;
