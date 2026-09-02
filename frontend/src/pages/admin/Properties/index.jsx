import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Search,
  Edit,
  Trash2,
  Copy,
  Eye,
  Download,
  Upload,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  SortAsc,
  SortDesc,
} from 'lucide-react';
import { adminPropertiesAPI } from '@/services/api';
import { useSettings } from '@/context/SettingsContext';
import { LoadingSkeleton, EmptyState } from '@/components/Modal';
import VatExcl from '@/components/VatExcl';

const AdminProperties = () => {
  const { settings } = useSettings();
  const queryClient = useQueryClient();
  const businessName = settings.business_name || 'Prime Realty Kenya';

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [featuredFilter, setFeaturedFilter] = useState('all');
  const [verificationFilter, setVerificationFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState([]);
  const [bulkAction, setBulkAction] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });
  const [exportToggle, setExportToggle] = useState(false);

  const limit = 15;

  useEffect(() => {
    document.title = `Properties | ${businessName} Admin`;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute(
        'content',
        'Manage all properties. Add, edit, delete, feature, and organize your property listings.'
      );
    }
  }, [businessName]);

  const queryParams = useMemo(() => {
    const params = {
      page: currentPage,
      limit,
      search: searchTerm,
    };
    if (statusFilter !== 'all') params.status = statusFilter;
    if (typeFilter !== 'all') params.type = typeFilter;
    if (featuredFilter !== 'all') params.featured = featuredFilter;
    if (verificationFilter !== 'all') params.verification = verificationFilter;

    const sortMap = {
      created_at: 'newest',
      price: 'price_high',
      views_count: 'most_viewed',
      featured: 'featured',
    };
    const direction = sortConfig.direction === 'asc' ? 'asc' : 'desc';
    if (direction === 'desc') {
      params.sort = sortMap[sortConfig.key] || 'newest';
    } else {
      params.sort = sortConfig.key === 'created_at' ? 'oldest' : 'price_low';
    }
    return params;
  }, [
    searchTerm,
    statusFilter,
    typeFilter,
    featuredFilter,
    verificationFilter,
    currentPage,
    sortConfig,
  ]);

  const {
    data,
    isLoading,
    error,
    refetch: refetchProperties,
  } = useQuery({
    queryKey: ['admin.properties', queryParams],
    queryFn: () => adminPropertiesAPI.getAll(queryParams),
    keepPreviousData: true,
  });

  const bulkActionMutation = useMutation({
    mutationFn: (actionData) => adminPropertiesAPI.bulkAction(actionData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin.properties'] });
      setSelectedRows([]);
      setBulkAction('');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => adminPropertiesAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin.properties'] });
    },
  });

  const properties = data?.success ? (data.data.data || data.data) : [];
  const pagination = data?.pagination || data?.data?.pagination;

  const handleSort = (key) => {
    if (sortConfig.key === key) {
      setSortConfig({
        key,
        direction: sortConfig.direction === 'asc' ? 'desc' : 'asc',
      });
    } else {
      setSortConfig({ key, direction: 'desc' });
    }
  };

  const handleBulkAction = () => {
    if (!bulkAction || selectedRows.length === 0) return;

    if (bulkAction === 'delete') {
      if (
        !window.confirm(
          `Are you sure you want to delete ${selectedRows.length} property/ies?`
        )
      ) {
        return;
      }
    }

    bulkActionMutation.mutate({
      action: bulkAction,
      ids: selectedRows,
    });
  };

  const handleDelete = (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    deleteMutation.mutate(id);
  };

  const handleDuplicate = (id) => {
    adminPropertiesAPI
      .duplicate(id)
      .then(() => {
        queryClient.invalidateQueries({ queryKey: ['admin.properties'] });
      })
      .catch(() => {});
  };

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

  const verificationColors = {
    Pending: 'bg-gray-100 text-gray-800',
    'Under Review': 'bg-blue-100 text-blue-800',
    'Documents Submitted': 'bg-indigo-100 text-indigo-800',
    Verified: 'bg-green-100 text-green-800',
    'Verification Required': 'bg-orange-100 text-orange-800',
    'Not Verified': 'bg-red-100 text-red-800',
  };

  const getPropertyImage = (property) => {
    return property?.primary_image
      ? `${import.meta.env.VITE_UPLOAD_BASE || '/'}uploads/properties/${property.primary_image}`
      : 'https://placehold.co/64x48?text=No+Image';
  };

  const toggleSelect = (id) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedRows.length === properties.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(properties.map((p) => p.id));
    }
  };

  if (isLoading && !data) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-text">Properties</h1>
          <div className="h-10 w-48 bg-muted/20 rounded animate-pulse" />
        </div>
        <LoadingSkeleton count={8} type="table" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-error mx-auto mb-4" />
        <p className="text-error mb-4">Failed to load properties.</p>
        <button onClick={() => refetchProperties()} className="btn btn-primary">
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
            Properties
          </h1>
          <p className="text-muted mt-1">
            {pagination ? pagination.total : properties.length} total properties
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setExportToggle(!exportToggle)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors
              ${exportToggle
                ? 'bg-primary text-white'
                : 'bg-surface border border-border text-text hover:bg-surface-hover'}
            `}
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <Link
            to="/admin/properties/add"
            className="btn btn-primary flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Add Property
          </Link>
        </div>
      </div>

      <div className="card p-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              placeholder="Search properties..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="input pl-10"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="input w-auto"
            >
              <option value="all">All Statuses</option>
              <option value="Draft">Draft</option>
              <option value="Published">Published</option>
              <option value="Available">Available</option>
              <option value="Reserved">Reserved</option>
              <option value="Sold">Sold</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="input w-auto"
            >
              <option value="all">All Types</option>
              {settings.property_types?.map((type) => (
                <option key={type.id} value={type.slug}>
                  {type.name}
                </option>
              ))}
            </select>

            <select
              value={featuredFilter}
              onChange={(e) => {
                setFeaturedFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="input w-auto"
            >
              <option value="all">All</option>
              <option value="true">Featured Only</option>
              <option value="false">Not Featured</option>
            </select>

            <select
              value={verificationFilter}
              onChange={(e) => {
                setVerificationFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="input w-auto"
            >
              <option value="all">All Verifications</option>
              <option value="Verified">Verified</option>
              <option value="Pending">Pending</option>
              <option value="Not Verified">Not Verified</option>
            </select>
          </div>
        </div>

        {selectedRows.length > 0 && (
          <div className="mt-4 flex items-center gap-3 p-3 bg-surface-hover rounded-lg">
            <span className="text-sm text-text">
              {selectedRows.length} selected
            </span>
            <select
              value={bulkAction}
              onChange={(e) => setBulkAction(e.target.value)}
              className="input w-auto"
            >
              <option value="">Bulk Actions</option>
              <option value="publish">Publish</option>
              <option value="unpublish">Unpublish</option>
              <option value="feature">Feature</option>
              <option value="archive">Archive</option>
              <option value="delete">Delete</option>
            </select>
            <button
              onClick={handleBulkAction}
              disabled={!bulkAction || bulkActionMutation.isPending}
              className="btn btn-primary btn-sm"
            >
              Apply
            </button>
          </div>
        )}
      </div>

      {properties.length === 0 ? (
        <EmptyState
          message={searchTerm ? 'No properties match your search.' : 'No properties found.'}
          type="search"
          action={
            !searchTerm ? (
              <Link to="/admin/properties/add" className="btn btn-primary btn-sm">
                Add First Property
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1200px]">
              <thead>
                <tr className="border-b border-border bg-surface-hover/50">
                  <th className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={
                        selectedRows.length === properties.length &&
                        properties.length > 0
                      }
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                    />
                  </th>
                  {[
                    { key: 'name', label: 'Property' },
                    { key: 'type_name', label: 'Type' },
                    { key: 'price', label: 'Price' },
                    { key: 'status', label: 'Status' },
                    { key: 'verification_status', label: 'Verification' },
                    { key: 'views_count', label: 'Views' },
                    { key: 'featured', label: 'Featured' },
                  ].map((column) => (
                    <th
                      key={column.key}
                      className="text-left px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider"
                    >
                      <button
                        onClick={() => handleSort(column.key)}
                        className="flex items-center gap-1 hover:text-text"
                      >
                        {column.label}
                        {sortConfig.key === column.key &&
                          (sortConfig.direction === 'asc' ? (
                            <SortAsc className="w-3 h-3" />
                          ) : (
                            <SortDesc className="w-3 h-3" />
                          ))}
                      </button>
                    </th>
                  ))}
                  <th className="text-right px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {properties.map((property) => (
                  <tr
                    key={property.id}
                    className="hover:bg-surface-hover/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(property.id)}
                        onChange={() => toggleSelect(property.id)}
                        className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={getPropertyImage(property)}
                          alt={property.name}
                          className="w-16 h-12 object-cover rounded-lg flex-shrink-0"
                          loading="lazy"
                        />
                        <div className="flex-1 min-w-0">
                          <Link
                            to={`/admin/properties/edit/${property.id}`}
                            className="font-medium text-text line-clamp-1 hover:text-primary"
                          >
                            {property.name}
                          </Link>
                          <p className="text-xs text-muted truncate">
                            {property.location}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-muted">
                        {property.type_name || 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-text">
                          {property.price
                            ? `${property.currency || 'KES'} ${Number(property.price).toLocaleString()}`
                            : 'N/A'}
                        </span>
                        {property.price && <VatExcl />}
                      </div>
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
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          property.verification_status === 'Verified'
                            ? 'bg-green-100 text-green-800'
                            : property.verification_status === 'Pending'
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-orange-100 text-orange-800'
                        }`}
                      >
                        {property.verification_status === 'Verified' && (
                          <CheckCircle className="w-3 h-3" />
                        )}
                        {property.verification_status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-muted">
                        {property.views_count}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {property.featured ? (
                        <CheckCircle className="w-4 h-4 text-success" />
                      ) : (
                        <XCircle className="w-4 h-4 text-muted" />
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          to={`/properties/${property.slug}`}
                          target="_blank"
                          className="btn btn-ghost btn-sm text-primary hover:bg-primary/10"
                          aria-label={`View ${property.name}`}
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          to={`/admin/properties/edit/${property.id}`}
                          className="btn btn-ghost btn-sm text-text hover:bg-surface-hover"
                          aria-label={`Edit ${property.name}`}
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDuplicate(property.id)}
                          className="btn btn-ghost btn-sm text-text hover:bg-surface-hover"
                          aria-label={`Duplicate ${property.name}`}
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(property.id, property.name)}
                          className="btn btn-ghost btn-sm text-error hover:bg-error/10"
                          aria-label={`Delete ${property.name}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {pagination && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-muted">
            Showing {pagination.page * pagination.limit - pagination.limit + 1} -{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            {pagination.total}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={!pagination.has_prev}
              className="px-3 py-1 rounded-lg border border-border hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 text-sm text-muted">
              Page {pagination.page} of {pagination.total_pages}
            </span>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={!pagination.has_next}
              className="px-3 py-1 rounded-lg border border-border hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProperties;
