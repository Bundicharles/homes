import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Plus,
  Trash2,
  GripVertical,
  Save,
  Loader2,
  Eye,
  Type,
  Image,
  Layout,
  HelpCircle,
  Megaphone,
  Star,
  ChevronUp,
  ChevronDown,
  Settings,
} from 'lucide-react';
import { pagesAPI } from '@/services/api';

const BLOCK_TYPES = [
  { type: 'hero', label: 'Hero Section', icon: Layout, description: 'Full-width banner with title, subtitle, and CTA button' },
  { type: 'text', label: 'Text Block', icon: Type, description: 'Rich text content block with heading' },
  { type: 'features', label: 'Features Grid', icon: Star, description: 'Icon + title + description grid layout' },
  { type: 'cta', label: 'Call to Action', icon: Megaphone, description: 'Centered CTA with button' },
  { type: 'faq', label: 'FAQ Accordion', icon: HelpCircle, description: 'Expandable questions and answers' },
  { type: 'image', label: 'Image Block', icon: Image, description: 'Full-width or contained image with optional caption' },
];

const BlockForm = ({ block, index, onChange, onDelete, onMoveUp, onMoveDown, totalBlocks }) => {
  const [collapsed, setCollapsed] = useState(false);

  const update = (key, value) => {
    onChange(index, { ...block, [key]: value });
  };

  const blockType = BLOCK_TYPES.find((b) => b.type === block.type);
  const Icon = blockType?.icon || Settings;

  return (
    <div className="card border-2 border-border overflow-hidden">
      {/* Block Header */}
      <div className="flex items-center gap-3 p-4 bg-surface-hover/60 border-b border-border cursor-pointer" onClick={() => setCollapsed(!collapsed)}>
        <GripVertical className="w-4 h-4 text-muted flex-shrink-0" />
        <div className="p-2 rounded-lg bg-primary/10 text-primary">
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-text">{blockType?.label || block.type}</p>
          <p className="text-xs text-muted truncate">{block.title || block.heading || blockType?.description}</p>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onMoveUp(index); }}
            disabled={index === 0}
            className="p-1 rounded hover:bg-surface-hover text-muted disabled:opacity-30"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onMoveDown(index); }}
            disabled={index === totalBlocks - 1}
            className="p-1 rounded hover:bg-surface-hover text-muted disabled:opacity-30"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onDelete(index); }}
            className="p-1 rounded hover:bg-error/10 text-muted hover:text-error"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Block Fields */}
      {!collapsed && (
        <div className="p-5 space-y-4">
          {/* HERO */}
          {block.type === 'hero' && (
            <>
              <Field label="Heading" value={block.heading || ''} onChange={(v) => update('heading', v)} />
              <Field label="Subheading" value={block.subheading || ''} onChange={(v) => update('subheading', v)} textarea />
              <div className="grid grid-cols-2 gap-4">
                <Field label="CTA Button Text" value={block.cta_text || ''} onChange={(v) => update('cta_text', v)} placeholder="Get Started" />
                <Field label="CTA Button URL" value={block.cta_url || ''} onChange={(v) => update('cta_url', v)} placeholder="/properties" />
              </div>
              <Field label="Background Image URL" value={block.bg_image || ''} onChange={(v) => update('bg_image', v)} placeholder="https://..." />
            </>
          )}

          {/* TEXT */}
          {block.type === 'text' && (
            <>
              <Field label="Heading" value={block.heading || ''} onChange={(v) => update('heading', v)} />
              <Field label="Content" value={block.content || ''} onChange={(v) => update('content', v)} textarea rows={6} />
            </>
          )}

          {/* FEATURES */}
          {block.type === 'features' && (
            <>
              <Field label="Section Title" value={block.title || ''} onChange={(v) => update('title', v)} />
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-text">Feature Items</p>
                  <button
                    type="button"
                    onClick={() => {
                      const items = [...(block.items || []), { icon: '⭐', title: '', description: '' }];
                      update('items', items);
                    }}
                    className="btn btn-outline btn-sm"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add Item
                  </button>
                </div>
                {(block.items || []).map((item, i) => (
                  <div key={i} className="grid grid-cols-12 gap-2 p-3 rounded-xl bg-surface-hover/50 border border-border">
                    <div className="col-span-1">
                      <input
                        type="text"
                        value={item.icon || ''}
                        onChange={(e) => {
                          const items = [...(block.items || [])];
                          items[i] = { ...items[i], icon: e.target.value };
                          update('items', items);
                        }}
                        className="input text-center text-lg px-2"
                        placeholder="⭐"
                      />
                    </div>
                    <div className="col-span-4">
                      <input
                        type="text"
                        value={item.title || ''}
                        onChange={(e) => {
                          const items = [...(block.items || [])];
                          items[i] = { ...items[i], title: e.target.value };
                          update('items', items);
                        }}
                        className="input"
                        placeholder="Feature title"
                      />
                    </div>
                    <div className="col-span-6">
                      <input
                        type="text"
                        value={item.description || ''}
                        onChange={(e) => {
                          const items = [...(block.items || [])];
                          items[i] = { ...items[i], description: e.target.value };
                          update('items', items);
                        }}
                        className="input"
                        placeholder="Description"
                      />
                    </div>
                    <div className="col-span-1 flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => {
                          const items = block.items.filter((_, idx) => idx !== i);
                          update('items', items);
                        }}
                        className="p-1 text-muted hover:text-error"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* CTA */}
          {block.type === 'cta' && (
            <>
              <Field label="Heading" value={block.heading || ''} onChange={(v) => update('heading', v)} />
              <Field label="Subtext" value={block.subtext || ''} onChange={(v) => update('subtext', v)} textarea />
              <div className="grid grid-cols-2 gap-4">
                <Field label="Button Text" value={block.button_text || ''} onChange={(v) => update('button_text', v)} placeholder="Contact Us" />
                <Field label="Button URL" value={block.button_url || ''} onChange={(v) => update('button_url', v)} placeholder="/contact" />
              </div>
            </>
          )}

          {/* FAQ */}
          {block.type === 'faq' && (
            <>
              <Field label="Section Title" value={block.title || ''} onChange={(v) => update('title', v)} placeholder="Frequently Asked Questions" />
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-text">FAQ Items</p>
                  <button
                    type="button"
                    onClick={() => {
                      const items = [...(block.items || []), { question: '', answer: '' }];
                      update('items', items);
                    }}
                    className="btn btn-outline btn-sm"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add FAQ
                  </button>
                </div>
                {(block.items || []).map((item, i) => (
                  <div key={i} className="p-3 rounded-xl bg-surface-hover/50 border border-border space-y-2">
                    <div className="flex items-start gap-2">
                      <input
                        type="text"
                        value={item.question || ''}
                        onChange={(e) => {
                          const items = [...(block.items || [])];
                          items[i] = { ...items[i], question: e.target.value };
                          update('items', items);
                        }}
                        className="input flex-1"
                        placeholder="Question"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const items = block.items.filter((_, idx) => idx !== i);
                          update('items', items);
                        }}
                        className="p-2 text-muted hover:text-error flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <textarea
                      rows={2}
                      value={item.answer || ''}
                      onChange={(e) => {
                        const items = [...(block.items || [])];
                        items[i] = { ...items[i], answer: e.target.value };
                        update('items', items);
                      }}
                      className="input"
                      placeholder="Answer"
                    />
                  </div>
                ))}
              </div>
            </>
          )}

          {/* IMAGE */}
          {block.type === 'image' && (
            <>
              <Field label="Image URL" value={block.url || ''} onChange={(v) => update('url', v)} placeholder="https://..." />
              <Field label="Alt Text" value={block.alt || ''} onChange={(v) => update('alt', v)} />
              <Field label="Caption (optional)" value={block.caption || ''} onChange={(v) => update('caption', v)} />
              <div>
                <label className="block text-sm font-medium text-text mb-1">Size</label>
                <select value={block.size || 'full'} onChange={(e) => update('size', e.target.value)} className="input w-auto">
                  <option value="full">Full Width</option>
                  <option value="contained">Contained</option>
                </select>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

const Field = ({ label, value, onChange, textarea, rows = 3, placeholder }) => (
  <div>
    <label className="block text-sm font-medium text-text mb-1">{label}</label>
    {textarea ? (
      <textarea
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input"
        placeholder={placeholder}
      />
    ) : (
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input"
        placeholder={placeholder}
      />
    )}
  </div>
);

const PageBuilder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [pageData, setPageData] = useState({ title: '', meta_description: '', is_published: false });
  const [blocks, setBlocks] = useState([]);
  const [showBlockPicker, setShowBlockPicker] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['admin.page', id],
    queryFn: () => pagesAPI.getById(id),
    enabled: !!id && id !== 'new',
  });

  useEffect(() => {
    if (data?.data) {
      const page = data.data;
      setPageData({
        title: page.title || '',
        meta_description: page.meta_description || '',
        is_published: !!page.is_published,
      });
      setBlocks(
        Array.isArray(page.content)
          ? page.content
          : typeof page.content === 'string'
          ? JSON.parse(page.content || '[]')
          : []
      );
    }
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: (payload) =>
      id && id !== 'new'
        ? pagesAPI.update(id, payload)
        : pagesAPI.create(payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['admin.pages'] });
      if (!id || id === 'new') {
        navigate(`/admin/pages/builder/${res.data?.id || res.id}`);
      }
    },
  });

  const addBlock = (type) => {
    const defaults = {
      hero: { type: 'hero', heading: '', subheading: '', cta_text: '', cta_url: '' },
      text: { type: 'text', heading: '', content: '' },
      features: { type: 'features', title: '', items: [] },
      cta: { type: 'cta', heading: '', subtext: '', button_text: '', button_url: '' },
      faq: { type: 'faq', title: '', items: [] },
      image: { type: 'image', url: '', alt: '', caption: '', size: 'full' },
    };
    setBlocks((prev) => [...prev, defaults[type] || { type }]);
    setShowBlockPicker(false);
  };

  const updateBlock = (index, updated) => {
    setBlocks((prev) => prev.map((b, i) => (i === index ? updated : b)));
  };

  const deleteBlock = (index) => {
    setBlocks((prev) => prev.filter((_, i) => i !== index));
  };

  const moveBlock = (index, dir) => {
    const newBlocks = [...blocks];
    const target = index + dir;
    if (target < 0 || target >= newBlocks.length) return;
    [newBlocks[index], newBlocks[target]] = [newBlocks[target], newBlocks[index]];
    setBlocks(newBlocks);
  };

  const handleSave = () => {
    saveMutation.mutate({ ...pageData, content: JSON.stringify(blocks) });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to="/admin/pages" className="p-2 rounded-lg bg-surface hover:bg-surface-hover text-muted hover:text-text transition-smooth border border-border">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-text">
              {isLoading ? 'Loading...' : id && id !== 'new' ? 'Edit Page' : 'New Page'}
            </h1>
            <p className="text-sm text-muted">Drag blocks to reorder • Build your page content visually</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {data?.data?.slug && (
            <a
              href={`/${data.data.slug}`}
              target="_blank"
              rel="noreferrer"
              className="btn btn-outline btn-sm flex items-center gap-1"
            >
              <Eye className="w-4 h-4" /> Preview
            </a>
          )}
          <button
            onClick={handleSave}
            disabled={saveMutation.isPending}
            className="btn btn-primary flex items-center gap-2"
          >
            {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{saveMutation.isPending ? 'Saving...' : 'Save Page'}</span>
          </button>
        </div>
      </div>

      {/* Page Settings */}
      <div className="card p-5 space-y-4">
        <h3 className="text-sm font-bold text-text uppercase tracking-wider">Page Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text mb-1">Page Title *</label>
            <input
              type="text"
              value={pageData.title}
              onChange={(e) => setPageData({ ...pageData, title: e.target.value })}
              className="input"
              placeholder="About Us"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-1">Meta Description (SEO)</label>
            <input
              type="text"
              value={pageData.meta_description}
              onChange={(e) => setPageData({ ...pageData, meta_description: e.target.value })}
              className="input"
              placeholder="Describe this page for search engines..."
            />
          </div>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={pageData.is_published}
            onChange={(e) => setPageData({ ...pageData, is_published: e.target.checked })}
            className="checkbox"
          />
          <span className="text-sm font-medium text-text">Published (visible to visitors)</span>
        </label>
      </div>

      {/* Blocks */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-text uppercase tracking-wider">Content Blocks ({blocks.length})</h3>
        </div>

        {blocks.length === 0 && (
          <div className="card p-10 text-center border-2 border-dashed border-border">
            <Layout className="w-12 h-12 mx-auto mb-4 text-muted opacity-40" />
            <p className="font-semibold text-text mb-1">Start Building Your Page</p>
            <p className="text-sm text-muted">Click "Add Block" below to add your first content section.</p>
          </div>
        )}

        {blocks.map((block, index) => (
          <BlockForm
            key={index}
            block={block}
            index={index}
            onChange={updateBlock}
            onDelete={deleteBlock}
            onMoveUp={(i) => moveBlock(i, -1)}
            onMoveDown={(i) => moveBlock(i, 1)}
            totalBlocks={blocks.length}
          />
        ))}

        {/* Add Block Button */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowBlockPicker(!showBlockPicker)}
            className="w-full btn btn-outline border-dashed flex items-center justify-center gap-2 py-3"
          >
            <Plus className="w-4 h-4" />
            <span>Add Content Block</span>
          </button>

          {showBlockPicker && (
            <div className="absolute top-full left-0 right-0 mt-2 z-10 bg-surface border border-border rounded-2xl shadow-xl overflow-hidden">
              <div className="p-3 border-b border-border">
                <p className="text-xs font-semibold text-muted uppercase tracking-wider">Select Block Type</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 p-2">
                {BLOCK_TYPES.map((bt) => {
                  const Icon = bt.icon;
                  return (
                    <button
                      key={bt.type}
                      type="button"
                      onClick={() => addBlock(bt.type)}
                      className="flex items-start gap-3 p-3 rounded-xl hover:bg-surface-hover text-left transition-smooth"
                    >
                      <div className="p-2 rounded-lg bg-primary/10 text-primary flex-shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-text">{bt.label}</p>
                        <p className="text-xs text-muted line-clamp-2">{bt.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PageBuilder;
