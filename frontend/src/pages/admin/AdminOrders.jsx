import React, { useState, useEffect } from 'react';
import { Truck, CheckCircle2, MapPin, Eye, Clock, AlertTriangle } from 'lucide-react';
import AdminHeader from '../../components/admin/AdminHeader';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import EmptyState from '../../components/common/EmptyState';
import api from '../../api/client';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [trackingInfo, setTrackingInfo] = useState('');
  const [statusNotes, setStatusNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/orders');
      if (res.data.success) {
        setOrders(res.data.orders || []);
      }
    } catch (err) {
      console.error('Failed to load admin orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleOpenStatusModal = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.orderStatus);
    setTrackingInfo('');
    setStatusNotes('');
    setModalOpen(true);
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setUpdating(true);

    try {
      const res = await api.patch(`/admin/orders/${selectedOrder._id}/status`, {
        orderStatus: newStatus,
        trackingInfo,
        notes: statusNotes,
      });

      if (res.data.success) {
        setOrders((prev) =>
          prev.map((o) => (o._id === selectedOrder._id ? res.data.order : o))
        );
        setModalOpen(false);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update order status.');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <AdminHeader
        title="ORDERS &amp; FULFILLMENT"
        subtitle="Manage logistics, shipping status, and delivery addresses for won pieces"
      />

      <div className="p-4 sm:p-6 md:p-8 flex-1 w-full max-w-full">
        {loading ? (
          <div className="py-20 text-center text-xs text-gray-400 font-mono tracking-widest uppercase">
            Loading order records...
          </div>
        ) : orders.length === 0 ? (
          <EmptyState
            title="No Orders Found"
            description="When collectors win auctions, orders will be generated here."
          />
        ) : (
          <div className="bg-luxury-surface border border-luxury-border rounded-2xl overflow-hidden shadow-card-dark w-full max-w-full">
            <div className="overflow-x-auto w-full">
              <table className="w-full min-w-[850px] text-left text-xs">
                <thead className="bg-luxury-card/70 border-b border-luxury-border text-gray-400 uppercase tracking-wider font-bold">
                  <tr>
                    <th className="py-3.5 px-4">Order Reference</th>
                    <th className="py-3.5 px-4">Collector</th>
                    <th className="py-3.5 px-4">Piece / Style ID</th>
                    <th className="py-3.5 px-4">Winning Bid</th>
                    <th className="py-3.5 px-4">Payment</th>
                    <th className="py-3.5 px-4">Fulfillment Status</th>
                    <th className="py-3.5 px-4">Shipping Destination</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-luxury-border/40 text-gray-300">
                  {orders.map((o) => (
                    <tr key={o._id} className="hover:bg-luxury-card/30 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-luxury-gold">
                        {o.orderId}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-white">
                        {o.userId?.name}
                        <span className="text-[10px] text-gray-400 font-mono block">
                          {o.userId?.phone || o.userId?.email}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white max-w-xs truncate">
                          {o.productId?.name}
                        </div>
                        <span className="text-[10px] text-gray-400 font-mono">
                          {o.productId?.styleId}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-white">
                        ₹{o.winningBid.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge status={o.paymentStatus} size="xs" />
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge status={o.orderStatus} size="xs" />
                      </td>
                      <td className="py-3.5 px-4 text-[11px] max-w-xs text-gray-400">
                        {o.shippingAddress?.street ? (
                          <span className="line-clamp-2">
                            {o.shippingAddress.street}, {o.shippingAddress.city},{' '}
                            {o.shippingAddress.state} - {o.shippingAddress.pinCode}
                          </span>
                        ) : (
                          <span className="text-amber-400/80 italic">Awaiting submission</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleOpenStatusModal(o)}
                          className="px-3 py-1 rounded-lg bg-luxury-card border border-luxury-border hover:border-luxury-gold text-xs font-semibold text-gray-300 hover:text-white transition"
                        >
                          Update Status
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Update Order Status Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`Update Order #${selectedOrder?.orderId}`}
      >
        <form onSubmit={handleUpdateStatus} className="space-y-4">
          <div>
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
              Fulfillment Status
            </label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full bg-luxury-card border border-luxury-border rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-luxury-gold"
            >
              <option value="PAYMENT_PENDING">PAYMENT_PENDING</option>
              <option value="CONFIRMED">CONFIRMED</option>
              <option value="PROCESSING">PROCESSING</option>
              <option value="SHIPPED">SHIPPED</option>
              <option value="DELIVERED">DELIVERED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
              Tracking / Courier Reference
            </label>
            <input
              type="text"
              value={trackingInfo}
              onChange={(e) => setTrackingInfo(e.target.value)}
              placeholder="e.g. BlueDart AWB #987654321"
              className="w-full bg-luxury-card border border-luxury-border rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-luxury-gold"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
              Status Notes
            </label>
            <textarea
              rows={2}
              value={statusNotes}
              onChange={(e) => setStatusNotes(e.target.value)}
              placeholder="Optional notes regarding this shipment update..."
              className="w-full bg-luxury-card border border-luxury-border rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-luxury-gold"
            />
          </div>

          <button
            type="submit"
            disabled={updating}
            className="w-full py-3 rounded-xl bg-luxury-gold text-black font-extrabold text-xs uppercase tracking-wider hover:brightness-110 transition shadow-luxury-gold"
          >
            {updating ? 'UPDATING...' : 'COMMIT STATUS UPDATE'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default AdminOrders;
