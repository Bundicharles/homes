import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search,
  Edit,
  Trash2,
  Plus,
  Shield,
  Users,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { usersAPI } from '@/services/api';
import { useSettings } from '@/context/SettingsContext';
import { LoadingSkeleton, EmptyState, Pagination, Modal } from '@/components/Modal';
import { getRelativeTime } from '@/utils';

const AdminRoles = () => {
  const { settings } = useSettings();
  const queryClient = useQueryClient();
  const businessName = settings.business_name || 'Prime Realty Kenya';

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRole, setSelectedRole] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState(null);

  const limit = 15;

  useEffect(() => {
    document.title = `Roles | ${businessName} Admin`;
  }, [businessName]);

  const { data: rolesData, isLoading, error, refetch } = useQuery({
    queryKey: ['admin.roles'],
    queryFn: () => usersAPI.getRoles(),
    staleTime: 60000,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => usersAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin.roles'] });
      setShowDeleteModal(false);
      setRoleToDelete(null);
    },
  });

  const roles = rolesData?.success ? rolesData.data : [];
  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = () => {
    if (roleToDelete) {
      deleteMutation.mutate(roleToDelete.id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-text">Roles</h1>
          <p className="text-muted mt-1">Manage user roles and permissions</p>
        </div>
      </div>

      <div className="card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Search roles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10 w-full sm:w-96"
          />
        </div>
      </div>

      {isLoading ? (
        <LoadingSkeleton count={5} type="table" />
      ) : error ? (
        <div className="card p-8 text-center">
          <p className="text-error mb-4">Failed to load roles</p>
          <button onClick={() => refetch()} className="btn btn-primary">Retry</button>
        </div>
      ) : filteredRoles.length === 0 ? (
        <EmptyState message="No roles found" type="search" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRoles.map((role) => (
            <div key={role.id} className="card p-6 hover:shadow-card transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-text">{role.name}</h3>
                    <p className="text-sm text-muted">/{role.slug}</p>
                  </div>
                </div>
                {role.is_system && (
                  <span className="px-2 py-1 bg-warning/10 text-warning text-xs rounded-full">System</span>
                )}
              </div>
              {role.description && (
                <p className="text-sm text-muted mb-4">{role.description}</p>
              )}
              <div className="flex items-center justify-between text-sm text-muted mb-4">
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" /> {role.user_count || 0} users
                </span>
                <span className="flex items-center gap-1">
                  <Shield className="w-4 h-4" /> {role.permissions?.length || 0} permissions
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => { setSelectedRole(role); setShowViewModal(true); }}
                  className="btn btn-ghost btn-sm flex-1"
                >
                  View
                </button>
                {!role.is_system && (
                  <button
                    onClick={() => { setRoleToDelete(role); setShowDeleteModal(true); }}
                    className="btn btn-ghost btn-sm text-error hover:bg-error/10"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showViewModal && selectedRole && (
        <Modal isOpen={showViewModal} onClose={() => setShowViewModal(false)} title={selectedRole.name} maxWidth="lg">
          <div className="space-y-6">
            {selectedRole.description && (
              <p className="text-muted">{selectedRole.description}</p>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="card p-4">
                <p className="text-sm text-muted">Slug</p>
                <p className="font-medium">/{selectedRole.slug}</p>
              </div>
              <div className="card p-4">
                <p className="text-sm text-muted">Users</p>
                <p className="font-medium">{selectedRole.user_count || 0}</p>
              </div>
            </div>
            {selectedRole.permissions && selectedRole.permissions.length > 0 && (
              <div>
                <h4 className="font-semibold text-text mb-3">Permissions ({selectedRole.permissions.length})</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedRole.permissions.map((perm) => (
                    <span key={perm.id} className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
                      {perm.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {showDeleteModal && roleToDelete && (
        <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Role" maxWidth="sm">
          <div className="space-y-4">
            <p className="text-muted">Are you sure you want to delete the <strong>{roleToDelete.name}</strong> role? Users with this role will be reassigned to the Customer role.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowDeleteModal(false)} className="btn btn-ghost">Cancel</button>
              <button onClick={handleDelete} disabled={deleteMutation.isPending} className="btn btn-error">
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AdminRoles;
