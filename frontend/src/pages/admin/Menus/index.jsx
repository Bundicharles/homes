import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search,
  Edit,
  Trash2,
  Plus,
  ChevronDown,
  ChevronRight,
  Menu,
  GripVertical,
} from 'lucide-react';
import { menusAPI } from '@/services/api';
import { useSettings } from '@/context/SettingsContext';
import { LoadingSkeleton, EmptyState, Pagination, Modal } from '@/components/Modal';
import { getRelativeTime } from '@/utils';

const AdminMenus = () => {
  const { settings } = useSettings();
  const queryClient = useQueryClient();
  const businessName = settings.business_name || 'Prime Realty Kenya';

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [menuToDelete, setMenuToDelete] = useState(null);

  const limit = 15;

  useEffect(() => {
    document.title = `Menus | ${businessName} Admin`;
  }, [businessName]);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin.menus'],
    queryFn: () => menusAPI.getAll(),
    staleTime: 60000,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => menusAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin.menus'] });
      setShowDeleteModal(false);
      setMenuToDelete(null);
    },
  });

  const menus = data?.success ? data.data : [];
  const filteredMenus = menus.filter(menu =>
    menu.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    menu.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = () => {
    if (menuToDelete) {
      deleteMutation.mutate(menuToDelete.id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-text">Menus</h1>
          <p className="text-muted mt-1">Manage navigation menus across the site</p>
        </div>
      </div>

      <div className="card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Search menus..."
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
          <p className="text-error mb-4">Failed to load menus</p>
          <button onClick={() => refetch()} className="btn btn-primary">Retry</button>
        </div>
      ) : filteredMenus.length === 0 ? (
        <EmptyState message="No menus found" type="search" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMenus.map((menu) => (
            <div key={menu.id} className="card p-6 hover:shadow-card transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Menu className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-text">{menu.name}</h3>
                    <p className="text-sm text-muted">Location: {menu.location}</p>
                  </div>
                </div>
              </div>
              {menu.description && (
                <p className="text-sm text-muted mb-4">{menu.description}</p>
              )}
              <div className="flex items-center justify-between text-sm text-muted mb-4">
                <span>{menu.items?.length || 0} items</span>
              </div>
              {menu.items && menu.items.length > 0 && (
                <div className="space-y-2 mb-4">
                  {menu.items.slice(0, 5).map((item, idx) => (
                    <div key={item.id} className="flex items-center gap-2 text-sm text-muted">
                      <GripVertical className="w-3 h-3" />
                      <span className="truncate">{item.label}</span>
                    </div>
                  ))}
                  {menu.items.length > 5 && (
                    <p className="text-sm text-muted">+{menu.items.length - 5} more items</p>
                  )}
                </div>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => { setSelectedMenu(menu); setShowViewModal(true); }}
                  className="btn btn-ghost btn-sm flex-1"
                >
                  View
                </button>
                <button
                  onClick={() => { setMenuToDelete(menu); setShowDeleteModal(true); }}
                  className="btn btn-ghost btn-sm text-error hover:bg-error/10"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showViewModal && selectedMenu && (
        <Modal isOpen={showViewModal} onClose={() => setShowViewModal(false)} title={selectedMenu.name} maxWidth="lg">
          <div className="space-y-4">
            <p className="text-muted">Location: {selectedMenu.location}</p>
            {selectedMenu.description && <p className="text-text">{selectedMenu.description}</p>}
            {selectedMenu.items && selectedMenu.items.length > 0 && (
              <div>
                <h4 className="font-semibold text-text mb-3">Menu Items</h4>
                <div className="space-y-2">
                  {selectedMenu.items.map((item) => (
                    <div key={item.id} className="card p-3 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-text">{item.label}</p>
                        <p className="text-sm text-muted">{item.url}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {showDeleteModal && menuToDelete && (
        <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Menu" maxWidth="sm">
          <div className="space-y-4">
            <p className="text-muted">Are you sure you want to delete <strong>{menuToDelete.name}</strong>? All menu items will also be removed.</p>
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

export default AdminMenus;
