import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Search,
  Filter,
  AlertCircle,
  Download,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { analyticsAPI } from '@/services/api';
import { useSettings } from '@/context/SettingsContext';
import { LoadingSkeleton, EmptyState, Pagination } from '@/components/Modal';
import { formatNumber } from '@/utils';

const AdminAuditLogs = () => {
  const { settings } = useSettings();
  const businessName = settings.business_name || 'Prime Realty Kenya';

  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [tableFilter, setTableFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    document.title = `Audit Logs | ${businessName} Admin`;
  }, [businessName]);

  const queryParams = {
    page: currentPage,
    limit: 30,
    search: searchTerm,
    action: actionFilter,
    user_id: userFilter,
    table: tableFilter,
    date_from: dateFrom,
    date_to: dateTo,
  };

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['admin.audit-logs', queryParams],
    queryFn: () => analyticsAPI.getAuditLogs(queryParams),
    keepPreviousData: true,
  });

  const logs = data?.success ? (data.data.data || data.data) : [];
  const pagination = data?.pagination || data?.data?.pagination;

  const actionOptions = [
    'created_property', 'updated_property', 'deleted_property', 'published_property',
    'created_user', 'updated_user', 'deleted_user',
    'created_inquiry', 'updated_inquiry', 'replied_to_inquiry',
    'uploaded_document', 'deleted_document', 'updated_document',
    'updated_settings', 'changed_settings',
    'login', 'logout', 'failed_login', 'password_reset',
  ];

  const tableOptions = ['properties', 'users', 'inquiries', 'settings', 'roles', 'media', 'property_documents'];

  if (isLoading && !data) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-text">Audit Logs</h1>
          <div className="h-10 w-48 bg-muted/20 rounded animate-pulse" />
        </div>
        <LoadingSkeleton count={10} type="table" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-error mx-auto mb-4" />
        <p className="text-error mb-4">Failed to load audit logs.</p>
        <button onClick={() => refetch()} className="btn btn-primary">
          Retry
        </button>
      </div>
    );
  }

  const resetFilters = () => {
    setSearchTerm('');
    setActionFilter('');
    setUserFilter('');
    setTableFilter('');
    setDateFrom('');
    setDateTo('');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-text">Audit Logs</h1>
          <p className="text-muted mt-1">
            {pagination ? pagination.total : logs.length} total log entries
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

      <div className="card p-4 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-end gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              placeholder="Search actions, tables, users..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="input pl-10"
            />
          </div>

          <select
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="input w-auto"
          >
            <option value="">All Actions</option>
            {actionOptions.map((action) => (
              <option key={action} value={action}>
                {action}
              </option>
            ))}
          </select>

          <select
            value={tableFilter}
            onChange={(e) => {
              setTableFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="input w-auto"
          >
            <option value="">All Tables</option>
            {tableOptions.map((table) => (
              <option key={table} value={table}>
                {table}
              </option>
            ))}
          </select>

          <div className="flex items-end gap-2">
            <div className="flex flex-col flex-1">
              <label className="text-xs text-muted mb-1">From Date</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="input"
              />
            </div>
            <div className="flex flex-col flex-1">
              <label className="text-xs text-muted mb-1">To Date</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="input"
              />
            </div>
          </div>

          <button
            onClick={() => {
              setCurrentPage(1);
              refetch();
            }}
            className="btn btn-primary"
          >
            Apply
          </button>
          <button
            onClick={resetFilters}
            className="btn btn-outline"
          >
            Reset
          </button>
        </div>
      </div>

      {logs.length === 0 ? (
        <EmptyState
          message={searchTerm ? 'No logs match your search.' : 'No audit logs found.'}
          type="search"
        />
      ) : (
        <>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px]">
                <thead>
                  <tr className="border-b border-border bg-surface-hover/50">
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider">
                      User
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider">
                      Action
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider">
                      Table
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider">
                      Record ID
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider">
                      IP Address
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider">
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {logs.map((log) => (
                    <tr
                      key={log.id}
                      className="hover:bg-surface-hover/50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <span className="text-sm text-muted">
                          {new Date(log.created_at).toLocaleString()}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium text-text">
                          {log.user_name || 'System'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <code className="text-xs bg-surface-hover px-2 py-1 rounded text-text">
                          {log.action}
                        </code>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-muted">{log.table_name || '-'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-muted">{log.record_id || '-'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-muted font-mono">{log.ip_address || '-'}</span>
                      </td>
                      <td className="px-4 py-3">
                        {log.new_values || log.old_values ? (
                          <button
                            onClick={() => {
                              const details = log.new_values
                                ? 'New values: ' + JSON.stringify(log.new_values)
                                : 'Old values: ' + JSON.stringify(log.old_values);
                              alert(details);
                            }}
                            className="text-xs text-primary hover:text-primary-hover"
                          >
                            View
                          </button>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {pagination && (
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.total_pages}
              onPageChange={setCurrentPage}
            />
          )}
        </>
      )}
    </div>
  );
};

export default AdminAuditLogs;
