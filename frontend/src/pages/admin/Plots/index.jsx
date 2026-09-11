import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  Compass,
  Edit,
  Trash2,
  Eye,
  Star,
  CheckCircle2,
  Clock,
  Layers,
  MapPin,
  DollarSign,
  ExternalLink,
  ShieldCheck,
  FileCheck,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { adminPropertiesAPI } from '@/services/api';
import { useSettings } from '@/context/SettingsContext';
import { formatPrice, getUploadBase } from '@/utils';
import { LoadingSkeleton, EmptyState } from '@/components/Modal';

const AdminPlots = () => {
  const { settings } = useSettings();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const businessName = settings.business_name || 'Hemaprin Homes';

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [verificationFilter, setVerificationFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const limit = 15;

  useEffect(() => {
    document.title = `Plots & Land Management | ${businessName} Admin`;
  }, [businessName]);

  // Query plots from admin endpoint
  const { data: plotsData, isLoading, refetch } = useQuery({
    queryKey: ['admin.plots', currentPage, statusFilter, verificationFilter],
    queryFn: () =>
      adminPropertiesAPI.getAll({
        type: 'plot,land',
        page: currentPage,
        limit,
        status: statusFilter === 'all' ? undefined : statusFilter,
        verification: verificationFilter === 'all' ? undefined : verificationFilter,
      }),
  });

  const rawPlots = plotsData?.data?.data || plotsData?.data || [];
  const plots = Array.isArray(rawPlots) ? rawPlots : [];
  const pagination = plotsData?.data?.pagination || { total: plots.length, total_pages: 1 };

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => adminPropertiesAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin.plots'] });
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      setDeleteConfirmId(null);
    },
  });

  // Toggle Featured mutation
  const toggleFeaturedMutation = useMutation({
    mutationFn: ({ id, featured }) => adminPropertiesAPI.update(id, { featured: !featured }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin.plots'] });
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
  });

  // Client-filtered plots based on search term
  const filteredPlots = useMemo(() => {
    if (!searchTerm.trim()) return plots;
    const q = searchTerm.toLowerCase();
    return plots.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.location?.toLowerCase().includes(q) ||
        p.county?.toLowerCase().includes(q) ||
        p.town?.toLowerCase().includes(q)
    );
  }, [plots, searchTerm]);

  // Derived statistics
  const stats = useMemo(() => {
    const total = pagination.total || plots.length;
    const available = plots.filter((p) => p.status === 'Available' || p.status === 'Published').length;
    const reserved = plots.filter((p) => p.status === 'Reserved' || p.status === 'Under Offer').length;
    const totalVal = plots.reduce((acc, p) => acc + (Number(p.price) || 0), 0);
    const totalLandSqm = plots.reduce((acc, p) => acc + (Number(p.land_size) || 0), 0);
    const totalAcres = (totalLandSqm / 4046.86).toFixed(1);

    return { total, available, reserved, totalVal, totalAcres };
  }, [plots, pagination]);

  const formatLandDisplay = (sqm) => {
    const s = Number(sqm);
    if (!s || s <= 0) return '50 × 100 ft (1/8 Ac)';
    if (s >= 4046.86) {
      return `${(s / 4046.86).toFixed(1)} Acres`;
    }
    if (s >= 1800) return '1/2 Acre (2,023 sqm)';
    if (s >= 900) return '1/4 Acre (1,012 sqm)';
    if (s >= 400) return '1/8 Acre (50x100 ft)';
    return `${s.toLocaleString()} sqm`;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-surface p-6 rounded-2xl border border-border shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-wider mb-1">
            <Compass size={16} />
            <span>Land & Subdivisions</span>
          </div>
          <h1 className="text-2xl font-bold text-text">Plots & Land Management</h1>
          <p className="text-sm text-muted">
            Manage residential plots, commercial land parcels, title deed verifications, and pricing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/plots"
            target="_blank"
            className="btn btn-outline inline-flex items-center gap-2 text-xs"
            title="Preview public plots page"
          >
            <ExternalLink size={14} />
            <span>Public Page</span>
          </Link>

          <Link
            to="/admin/properties/add?type=plot"
            className="btn btn-primary inline-flex items-center gap-2 text-xs"
          >
            <Plus size={16} />
            <span>Add New Plot</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface p-5 rounded-xl border border-border shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted mb-1">Total Plots Listed</p>
            <h3 className="text-2xl font-bold text-text">{stats.total}</h3>
            <span className="text-xs text-primary font-medium">Plots & Parcels</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Compass size={24} />
          </div>
        </div>

        <div className="bg-surface p-5 rounded-xl border border-border shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted mb-1">Available for Sale</p>
            <h3 className="text-2xl font-bold text-emerald-600">{stats.available}</h3>
            <span className="text-xs text-muted">Ready to purchase</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 size={24} />
          </div>
        </div>

        <div className="bg-surface p-5 rounded-xl border border-border shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted mb-1">Under Offer / Reserved</p>
            <h3 className="text-2xl font-bold text-amber-600">{stats.reserved}</h3>
            <span className="text-xs text-muted">In closing process</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
            <Clock size={24} />
          </div>
        </div>

        <div className="bg-surface p-5 rounded-xl border border-border shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted mb-1">Total Land Acreage</p>
            <h3 className="text-2xl font-bold text-blue-600">{stats.totalAcres} Ac</h3>
            <span className="text-xs text-muted">Combined inventory</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
            <Layers size={24} />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-surface p-4 rounded-xl border border-border shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 text-muted" size={16} />
          <input
            type="text"
            placeholder="Search plots by name, town, county..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 text-xs bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="Available">Available</option>
            <option value="Published">Published</option>
            <option value="Reserved">Reserved</option>
            <option value="Under Offer">Under Offer</option>
            <option value="Sold">Sold</option>
            <option value="Draft">Draft</option>
          </select>

          <select
            value={verificationFilter}
            onChange={(e) => {
              setVerificationFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 text-xs bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
          >
            <option value="all">All Verifications</option>
            <option value="Verified">Verified Title</option>
            <option value="Under Review">Under Review</option>
            <option value="Pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Plots Table */}
      <div className="bg-surface rounded-xl border border-border shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8">
            <LoadingSkeleton count={5} />
          </div>
        ) : filteredPlots.length === 0 ? (
          <div className="p-12 text-center">
            <Compass size={40} className="mx-auto text-muted/50 mb-3" />
            <h3 className="text-base font-bold text-text mb-1">No plots found</h3>
            <p className="text-xs text-muted mb-4">
              There are currently no plots matching your search criteria.
            </p>
            <Link to="/admin/properties/add?type=plot" className="btn btn-primary text-xs">
              Add Your First Plot
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/5 border-b border-border text-xs font-semibold text-muted uppercase">
                <tr>
                  <th className="py-3.5 px-4">Plot / Parcel</th>
                  <th className="py-3.5 px-4">Land Size</th>
                  <th className="py-3.5 px-4">Price (KES)</th>
                  <th className="py-3.5 px-4">Title Deed</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-center">Featured</th>
                  <th className="py-3.5 px-4 text-center">Views</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredPlots.map((plot) => {
                  const imgUrl = plot.primary_image
                    ? plot.primary_image.startsWith('http')
                      ? plot.primary_image
                      : `${getUploadBase()}uploads/properties/${plot.primary_image.replace(/^(\/?backend)?\/?uploads\//i, '')}`
                    : 'https://placehold.co/100x70?text=Plot';

                  return (
                    <tr key={plot.id} className="hover:bg-muted/5 transition-colors">
                      {/* Plot details */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={imgUrl}
                            alt={plot.name}
                            className="w-14 h-11 object-cover rounded-lg border border-border flex-shrink-0"
                            onError={(e) => {
                              e.currentTarget.src = 'https://placehold.co/100x70?text=Plot';
                            }}
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-text truncate max-w-xs">{plot.name}</p>
                            <div className="flex items-center gap-1.5 text-xs text-muted mt-0.5">
                              <MapPin size={12} className="text-primary flex-shrink-0" />
                              <span className="truncate max-w-[200px]">{plot.location}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Land Size */}
                      <td className="py-3.5 px-4 font-medium text-text">
                        <span className="inline-flex items-center px-2 py-0.5 rounded bg-muted/10 text-xs font-semibold">
                          {formatLandDisplay(plot.land_size)}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="py-3.5 px-4 font-bold text-primary">
                        {formatPrice(plot.price, plot.currency || 'KES')}
                      </td>

                      {/* Title Deed Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            plot.verification_status === 'Verified'
                              ? 'bg-emerald-500/10 text-emerald-600'
                              : plot.verification_status === 'Under Review'
                              ? 'bg-amber-500/10 text-amber-600'
                              : 'bg-muted/20 text-muted'
                          }`}
                        >
                          <FileCheck size={12} />
                          <span>{plot.verification_status || 'Pending'}</span>
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                            plot.status === 'Available' || plot.status === 'Published'
                              ? 'bg-emerald-500/10 text-emerald-600'
                              : plot.status === 'Reserved' || plot.status === 'Under Offer'
                              ? 'bg-amber-500/10 text-amber-600'
                              : plot.status === 'Sold'
                              ? 'bg-red-500/10 text-red-600'
                              : 'bg-muted/10 text-muted'
                          }`}
                        >
                          {plot.status}
                        </span>
                      </td>

                      {/* Featured */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() =>
                            toggleFeaturedMutation.mutate({ id: plot.id, featured: !!plot.featured })
                          }
                          className="p-1 rounded hover:bg-muted/10 transition-colors"
                          title={plot.featured ? 'Unfeature plot' : 'Feature plot'}
                        >
                          <Star
                            size={16}
                            className={
                              plot.featured
                                ? 'text-amber-500 fill-amber-500'
                                : 'text-muted/40 hover:text-amber-500'
                            }
                          />
                        </button>
                      </td>

                      {/* Views */}
                      <td className="py-3.5 px-4 text-center text-xs text-muted">
                        {plot.views_count || 0}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            to={`/properties/${plot.slug || plot.id}`}
                            target="_blank"
                            className="p-1.5 rounded-lg text-muted hover:text-primary hover:bg-primary/10 transition-colors"
                            title="View on site"
                          >
                            <Eye size={16} />
                          </Link>

                          <Link
                            to={`/admin/properties/edit/${plot.id}`}
                            className="p-1.5 rounded-lg text-muted hover:text-blue-600 hover:bg-blue-500/10 transition-colors"
                            title="Edit plot"
                          >
                            <Edit size={16} />
                          </Link>

                          <button
                            onClick={() => setDeleteConfirmId(plot.id)}
                            className="p-1.5 rounded-lg text-muted hover:text-error hover:bg-error/10 transition-colors"
                            title="Delete plot"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.total_pages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-border">
            <p className="text-xs text-muted">
              Page {pagination.page} of {pagination.total_pages} ({pagination.total} total plots)
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="btn btn-outline p-2 disabled:opacity-50"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                disabled={currentPage >= pagination.total_pages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="btn btn-outline p-2 disabled:opacity-50"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-surface rounded-2xl border border-border p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-bold text-text mb-2">Delete Plot Listing?</h3>
            <p className="text-xs text-muted mb-6 leading-relaxed">
              Are you sure you want to delete this plot listing? This action cannot be undone and will remove all associated gallery images.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="btn btn-outline text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteMutation.mutate(deleteConfirmId)}
                className="btn btn-error text-xs"
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPlots;
