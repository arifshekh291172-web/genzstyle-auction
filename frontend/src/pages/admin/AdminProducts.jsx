import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, CheckCircle2, XCircle, Upload, Package } from 'lucide-react';
import AdminHeader from '../../components/admin/AdminHeader';
import Modal from '../../components/common/Modal';
import EmptyState from '../../components/common/EmptyState';
import api from '../../api/client';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: '',
    styleId: '',
    description: '',
    category: 'Footwear',
    brand: '',
    size: 'M',
    color: 'Black',
    condition: 'Brand New',
    startingPrice: '',
    imageUrl: '',
  });

  const [imageFiles, setImageFiles] = useState([]);

  const categories = [
    'Footwear',
    'Jackets',
    'Accessories',
    'Outerwear',
    'Topwear',
    'Bottomwear',
    'Shirts',
  ];

  const conditions = ['Brand New', 'Like New', 'Pristine Archive', 'Vintage Excellent'];

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/products');
      if (res.data.success) {
        setProducts(res.data.products || []);
      }
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setForm({
      name: '',
      styleId: `GZS-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      description: '',
      category: 'Footwear',
      brand: '',
      size: 'UK 9 / EU 43',
      color: 'Black',
      condition: 'Brand New',
      startingPrice: '2150',
      imageUrl: '',
    });
    setImageFiles([]);
    setModalOpen(true);
  };

  const handleOpenEdit = (p) => {
    setEditingProduct(p);
    setForm({
      name: p.name,
      styleId: p.styleId,
      description: p.description,
      category: p.category,
      brand: p.brand,
      size: p.size,
      color: p.color,
      condition: p.condition,
      startingPrice: p.startingPrice,
      imageUrl: p.images?.[0]?.url || '',
    });
    setImageFiles([]);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const formData = new FormData();
      Object.keys(form).forEach((k) => formData.append(k, form[k]));

      // Attach file uploads for Cloudinary
      if (imageFiles.length > 0) {
        for (const file of imageFiles) {
          formData.append('images', file);
        }
      }

      if (editingProduct) {
        await api.patch(`/admin/products/${editingProduct._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await api.post('/admin/products', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      setModalOpen(false);
      await fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save product.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await api.delete(`/admin/products/${id}`);
      if (res.data.success) {
        setProducts((prev) => prev.filter((p) => p._id !== id));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete product.');
    }
  };

  const handleToggleActive = async (p) => {
    try {
      const res = await api.patch(`/admin/products/${p._id}`, { active: !p.active });
      if (res.data.success) {
        setProducts((prev) =>
          prev.map((item) => (item._id === p._id ? { ...item, active: !item.active } : item))
        );
      }
    } catch (err) {
      alert('Failed to toggle status.');
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <AdminHeader
        title="PRODUCT CATALOG"
        subtitle="Manage luxury streetwear items and Cloudinary visual assets"
        actions={
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-luxury-gold to-luxury-gold-dark text-black font-extrabold text-xs uppercase tracking-wider hover:brightness-110 transition shadow-luxury-gold flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Piece</span>
          </button>
        }
      />

      <div className="p-6 md:p-8 flex-1">
        {loading ? (
          <div className="py-20 text-center text-xs text-gray-400 font-mono tracking-widest uppercase">
            Loading catalog...
          </div>
        ) : products.length === 0 ? (
          <EmptyState
            title="Catalog is empty"
            description="Add your first archival luxury piece to start staging drops."
            action={
              <button
                onClick={handleOpenCreate}
                className="text-xs font-bold text-luxury-gold border border-luxury-gold/50 px-4 py-2 rounded-xl"
              >
                Add Piece Now
              </button>
            }
          />
        ) : (
          <div className="bg-luxury-surface border border-luxury-border rounded-2xl overflow-hidden shadow-card-dark">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-luxury-card/70 border-b border-luxury-border text-gray-400 uppercase tracking-wider font-bold">
                  <tr>
                    <th className="py-3.5 px-4">Item &amp; Style ID</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Brand</th>
                    <th className="py-3.5 px-4">Base Price</th>
                    <th className="py-3.5 px-4">Condition</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-luxury-border/40 text-gray-300">
                  {products.map((p) => (
                    <tr key={p._id} className="hover:bg-luxury-card/30 transition">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              p.images?.[0]?.url ||
                              'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=100&q=80'
                            }
                            alt={p.name}
                            className="w-10 h-10 rounded-lg object-cover bg-luxury-card shrink-0 border border-luxury-border"
                          />
                          <div>
                            <div className="font-bold text-white max-w-xs truncate">{p.name}</div>
                            <span className="text-[10px] font-mono text-luxury-gold">
                              {p.styleId}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">{p.category}</td>
                      <td className="py-3.5 px-4 font-semibold text-white">{p.brand}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-white">
                        ₹{Number(p.startingPrice).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-emerald-400 font-semibold">{p.condition}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleToggleActive(p)}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            p.active
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : 'bg-gray-800 text-gray-400 border border-gray-700'
                          }`}
                        >
                          {p.active ? 'ACTIVE' : 'INACTIVE'}
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="p-1.5 rounded-lg bg-luxury-card border border-luxury-border text-gray-300 hover:text-white transition"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(p._id)}
                            className="p-1.5 rounded-lg bg-red-950/40 border border-red-500/30 text-red-400 hover:text-red-300 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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
      </div>

      {/* Product Form Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingProduct ? 'Edit Catalog Piece' : 'Add New Luxury Piece'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                Product Name
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Balenciaga Cargo Sneaker"
                className="w-full bg-luxury-card border border-luxury-border rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                Style ID
              </label>
              <input
                type="text"
                required
                value={form.styleId}
                onChange={(e) => setForm({ ...form, styleId: e.target.value.toUpperCase() })}
                placeholder="GZS-BAL-01"
                className="w-full bg-luxury-card border border-luxury-border rounded-xl px-3 py-2 text-xs text-white font-mono uppercase"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                Category
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full bg-luxury-card border border-luxury-border rounded-xl px-3 py-2 text-xs text-white"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                Brand
              </label>
              <input
                type="text"
                required
                value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
                placeholder="Balenciaga"
                className="w-full bg-luxury-card border border-luxury-border rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                Base Price (INR)
              </label>
              <input
                type="number"
                required
                min={0}
                value={form.startingPrice}
                onChange={(e) => setForm({ ...form, startingPrice: e.target.value })}
                placeholder="2150"
                className="w-full bg-luxury-card border border-luxury-border rounded-xl px-3 py-2 text-xs text-white font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                Size
              </label>
              <input
                type="text"
                value={form.size}
                onChange={(e) => setForm({ ...form, size: e.target.value })}
                placeholder="UK 9 / EU 43"
                className="w-full bg-luxury-card border border-luxury-border rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                Color
              </label>
              <input
                type="text"
                value={form.color}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
                placeholder="Black/Silver"
                className="w-full bg-luxury-card border border-luxury-border rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                Condition
              </label>
              <select
                value={form.condition}
                onChange={(e) => setForm({ ...form, condition: e.target.value })}
                className="w-full bg-luxury-card border border-luxury-border rounded-xl px-3 py-2 text-xs text-white"
              >
                {conditions.map((cond) => (
                  <option key={cond} value={cond}>
                    {cond}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
              Description &amp; Provenance
            </label>
            <textarea
              rows={3}
              required
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Provide craftsmanship details and archival significance..."
              className="w-full bg-luxury-card border border-luxury-border rounded-xl px-3 py-2 text-xs text-white"
            />
          </div>

          {/* Image Upload / Image URL */}
          <div className="p-4 rounded-xl bg-luxury-card/50 border border-luxury-border">
            <label className="text-[11px] font-bold text-luxury-gold uppercase tracking-wider block mb-2 flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5" /> Cloudinary Media Upload
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => setImageFiles(Array.from(e.target.files))}
              className="text-xs text-gray-400 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-luxury-gold file:text-black hover:file:brightness-110 mb-2"
            />
            <div className="text-[10px] text-gray-500 mb-2">Or provide image URL directly:</div>
            <input
              type="url"
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              placeholder="https://images.unsplash.com/..."
              className="w-full bg-luxury-surface border border-luxury-border rounded-lg px-3 py-1.5 text-xs text-white"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-luxury-gold to-luxury-gold-dark text-black font-extrabold text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 transition shadow-luxury-gold"
          >
            {submitting ? 'SAVING...' : editingProduct ? 'UPDATE PIECE' : 'SAVE TO CATALOG'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default AdminProducts;
