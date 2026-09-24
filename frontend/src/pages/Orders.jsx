import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  Truck,
  AlertTriangle,
  CreditCard,
  MapPin,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import EmptyState from '../components/common/EmptyState';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

const Orders = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('PAYMENT_PENDING');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Shipping Modal State
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [shippingModalOpen, setShippingModalOpen] = useState(false);
  const [shippingForm, setShippingForm] = useState({
    fullName: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    pinCode: '',
  });
  const [savingShipping, setSavingShipping] = useState(false);
  const [payingOrderId, setPayingOrderId] = useState(null);

  const tabs = [
    { id: 'PAYMENT_PENDING', label: 'PAYMENT PENDING', icon: Clock },
    { id: 'CONFIRMED', label: 'CONFIRMED', icon: CheckCircle2 },
    { id: 'SHIPPED', label: 'SHIPPED', icon: Truck },
    { id: 'DELIVERED', label: 'DELIVERED', icon: CheckCircle2 },
    { id: 'DEFAULTED', label: 'DEFAULTED', icon: AlertTriangle },
  ];

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/orders?status=${activeTab}`);
      if (res.data.success) {
        setOrders(res.data.orders || []);
      }
    } catch (err) {
      console.error('Failed to load orders:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [activeTab]);

  // Open Shipping Address Modal
  const handleOpenShipping = (order) => {
    setSelectedOrder(order);
    const existing = order.shippingAddress || {};
    setShippingForm({
      fullName: existing.fullName || user?.shippingAddress?.fullName || user?.name || '',
      phone: existing.phone || user?.shippingAddress?.phone || user?.phone || '',
      street: existing.street || user?.shippingAddress?.street || '',
      city: existing.city || user?.shippingAddress?.city || '',
      state: existing.state || user?.shippingAddress?.state || '',
      pinCode: existing.pinCode || user?.shippingAddress?.pinCode || '',
    });
    setShippingModalOpen(true);
  };

  const handleSaveShipping = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;

    if (!/^\d{6}$/.test(shippingForm.pinCode.trim())) {
      alert('Please enter a valid 6-digit Indian PIN code.');
      return;
    }

    setSavingShipping(true);
    try {
      const res = await api.patch(`/orders/${selectedOrder._id}/shipping`, shippingForm);
      if (res.data.success) {
        setOrders((prev) =>
          prev.map((o) => (o._id === selectedOrder._id ? res.data.order : o))
        );
        setShippingModalOpen(false);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update shipping address.');
    } finally {
      setSavingShipping(false);
    }
  };

  // Pay Winning Bid via Razorpay
  const handlePayNow = async (order) => {
    setPayingOrderId(order._id);
    try {
      // 1. Create server-authoritative Razorpay Order for exact winningBid
      const createRes = await api.post('/payments/auction/create-order', {
        orderId: order.orderId,
      });

      const { orderId, amount, currency, keyId, product } = createRes.data;

      // 2. Open Razorpay Checkout modal
      const options = {
        key: keyId,
        amount,
        currency,
        name: 'GENZSTYLE Drops',
        description: `Pickup for ${product.name} (${product.styleId})`,
        order_id: orderId,
        prefill: {
          name: user.name,
          email: user.email,
          contact: user.phone || '',
        },
        theme: {
          color: '#D4AF37',
        },
        handler: async function (response) {
          // 3. DO NOT TRUST FRONTEND ALONE — Cryptographically verify signature server-side
          try {
            const verifyRes = await api.post('/payments/verify', {
              orderId: order.orderId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });

            if (verifyRes.data.success) {
              confetti({
                particleCount: 200,
                spread: 100,
                origin: { y: 0.6 },
              });
              await fetchOrders();
              // Prompt for shipping address if not already filled
              if (!order.shippingAddress?.street) {
                handleOpenShipping(verifyRes.data.order);
              }
            }
          } catch (err) {
            alert(err.response?.data?.message || 'Payment signature verification failed.');
          } finally {
            setPayingOrderId(null);
          }
        },
        modal: {
          ondismiss: function () {
            setPayingOrderId(null);
          },
        },
      };

      if (window.Razorpay) {
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        alert('Razorpay Checkout failed to load. Please refresh and check your network.');
        setPayingOrderId(null);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to initiate payment.');
      setPayingOrderId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-12 pb-mobile-nav">
      <div className="pb-6 sm:pb-8 border-b border-luxury-border/60">
        <h1 className="text-2xl sm:text-3xl md:text-5xl font-black text-white uppercase font-display">
          DROP ORDERS &amp; PICKUPS
        </h1>
        <p className="text-xs md:text-sm text-gray-400 mt-1">
          Settle your winning bids within 48 hours and track verified luxury fulfillment.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 sm:gap-3 py-4 sm:py-6 border-b border-luxury-border/60 overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0 scrollbar-none w-auto max-w-full">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-[11px] sm:text-xs font-bold uppercase tracking-wider transition shrink-0 ${
                isActive
                  ? 'bg-luxury-gold text-black shadow-luxury-gold'
                  : 'bg-luxury-surface text-gray-400 hover:text-white border border-luxury-border/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="py-16 text-center text-xs text-gray-400 font-mono tracking-widest uppercase">
          Loading orders...
        </div>
      ) : orders.length === 0 ? (
        <div className="pt-8">
          <EmptyState
            title={`No ${activeTab.replace('_', ' ').toLowerCase()} orders`}
            description="You have no won auctions matching this category."
          />
        </div>
      ) : (
        <div className="space-y-4 pt-6 sm:pt-8">
          {orders.map((order) => {
            const product = order.productId || {};
            const isPending = order.orderStatus === 'PAYMENT_PENDING';
            const isDefaulted = order.orderStatus === 'DEFAULTED';
            const hoursLeft = Math.max(
              0,
              Math.ceil((new Date(order.paymentDeadline).getTime() - Date.now()) / (1000 * 60 * 60))
            );

            return (
              <div
                key={order._id}
                className="bg-luxury-surface border border-luxury-border rounded-2xl p-4 sm:p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 shadow-card-dark"
              >
                {/* Product & Order Info */}
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl bg-luxury-card overflow-hidden shrink-0 border border-luxury-border">
                    <img
                      src={
                        product.images?.[0]?.url ||
                        'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=400&q=80'
                      }
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono text-luxury-gold uppercase font-bold">
                        {order.orderId}
                      </span>
                      <Badge status={order.orderStatus} size="xs" />
                    </div>
                    <h3 className="font-bold text-sm md:text-base text-white line-clamp-1">
                      {product.name || 'Archival Piece'}
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Style ID: <span className="font-mono text-gray-300">{product.styleId}</span>
                    </p>

                    {/* Deadline Alert if Pending */}
                    {isPending && (
                      <div className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold mt-2">
                        <Clock className="w-3.5 h-3.5" />
                        <span>48h Deadline: {hoursLeft} Hours Remaining</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Amount & Actions */}
                <div className="flex flex-col md:items-end justify-between gap-3 border-t md:border-t-0 pt-4 md:pt-0 border-luxury-border/60">
                  <div className="text-left md:text-right">
                    <span className="text-[10px] uppercase tracking-wider text-gray-400 block">
                      Winning Amount Due
                    </span>
                    <span className="font-display font-black text-2xl text-white">
                      ₹{order.winningBid.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    {/* Shipping Address Button */}
                    {!isDefaulted && (
                      <button
                        onClick={() => handleOpenShipping(order)}
                        className="px-3.5 py-2 rounded-xl bg-luxury-card border border-luxury-border hover:border-luxury-gold text-xs font-semibold text-gray-300 hover:text-white transition flex items-center gap-1.5"
                      >
                        <MapPin className="w-3.5 h-3.5 text-luxury-gold" />
                        <span>
                          {order.shippingAddress?.street ? 'Edit Address' : 'Add Shipping'}
                        </span>
                      </button>
                    )}

                    {/* Pay Winning Bid Action */}
                    {isPending && (
                      <button
                        onClick={() => handlePayNow(order)}
                        disabled={payingOrderId === order._id}
                        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-luxury-gold to-luxury-gold-dark text-black font-extrabold text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 transition shadow-luxury-gold flex items-center gap-2"
                      >
                        <CreditCard className="w-4 h-4" />
                        <span>
                          {payingOrderId === order._id ? 'CONNECTING...' : 'PAY NOW'}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Shipping Address Modal */}
      <Modal
        isOpen={shippingModalOpen}
        onClose={() => setShippingModalOpen(false)}
        title="Delivery Shipping Address"
      >
        <form onSubmit={handleSaveShipping} className="space-y-4">
          <p className="text-xs text-gray-400 mb-2">
            Please enter your complete shipping destination. This information is securely protected.
          </p>

          <div>
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
              Full Recipient Name
            </label>
            <input
              type="text"
              required
              value={shippingForm.fullName}
              onChange={(e) => setShippingForm({ ...shippingForm, fullName: e.target.value })}
              className="w-full bg-luxury-card border border-luxury-border rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-luxury-gold"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              required
              value={shippingForm.phone}
              onChange={(e) => setShippingForm({ ...shippingForm, phone: e.target.value })}
              className="w-full bg-luxury-card border border-luxury-border rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-luxury-gold"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
              Street / Flat / Building Address
            </label>
            <textarea
              required
              rows={2}
              value={shippingForm.street}
              onChange={(e) => setShippingForm({ ...shippingForm, street: e.target.value })}
              className="w-full bg-luxury-card border border-luxury-border rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-luxury-gold"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                City
              </label>
              <input
                type="text"
                required
                value={shippingForm.city}
                onChange={(e) => setShippingForm({ ...shippingForm, city: e.target.value })}
                className="w-full bg-luxury-card border border-luxury-border rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                State
              </label>
              <input
                type="text"
                required
                value={shippingForm.state}
                onChange={(e) => setShippingForm({ ...shippingForm, state: e.target.value })}
                className="w-full bg-luxury-card border border-luxury-border rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                PIN Code
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={shippingForm.pinCode}
                onChange={(e) => setShippingForm({ ...shippingForm, pinCode: e.target.value })}
                className="w-full bg-luxury-card border border-luxury-border rounded-xl px-3 py-2 text-xs text-white font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={savingShipping}
            className="w-full mt-4 py-3 rounded-xl bg-luxury-gold text-black font-extrabold text-xs uppercase tracking-wider hover:brightness-110 transition shadow-luxury-gold"
          >
            {savingShipping ? 'SAVING...' : 'SAVE SHIPPING ADDRESS'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Orders;
