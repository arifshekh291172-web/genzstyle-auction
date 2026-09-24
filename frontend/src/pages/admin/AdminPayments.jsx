import React, { useState, useEffect } from 'react';
import AdminHeader from '../../components/admin/AdminHeader';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import api from '../../api/client';

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await api.get('/admin/payments');
        if (res.data.success) {
          setPayments(res.data.payments || []);
        }
      } catch (err) {
        console.error('Failed to load auction payments:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <AdminHeader
        title="AUCTION WINNING PAYMENTS"
        subtitle="Verified Razorpay transactions settled within the authoritative 48-hour window"
      />

      <div className="p-4 sm:p-6 md:p-8 flex-1 w-full max-w-full">
        {loading ? (
          <div className="py-20 text-center text-xs text-gray-400 font-mono tracking-widest uppercase">
            Loading auction payment ledgers...
          </div>
        ) : payments.length === 0 ? (
          <EmptyState
            title="No Auction Payments Yet"
            description="Verified payments for won auctions will be logged here in real-time."
          />
        ) : (
          <div className="bg-luxury-surface border border-luxury-border rounded-2xl overflow-hidden shadow-card-dark w-full max-w-full">
            <div className="overflow-x-auto w-full">
              <table className="w-full min-w-[750px] text-left text-xs">
                <thead className="bg-luxury-card/70 border-b border-luxury-border text-gray-400 uppercase tracking-wider font-bold">
                  <tr>
                    <th className="py-3.5 px-4">Order ID</th>
                    <th className="py-3.5 px-4">Collector</th>
                    <th className="py-3.5 px-4">Item &amp; Style ID</th>
                    <th className="py-3.5 px-4">Winning Bid</th>
                    <th className="py-3.5 px-4">Razorpay Payment ID</th>
                    <th className="py-3.5 px-4">Payment Status</th>
                    <th className="py-3.5 px-4">Paid Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-luxury-border/40 text-gray-300 font-mono">
                  {payments.map((p) => (
                    <tr key={p._id} className="hover:bg-luxury-card/30 transition">
                      <td className="py-3.5 px-4 font-bold text-luxury-gold">{p.orderId}</td>
                      <td className="py-3.5 px-4 font-sans font-bold text-white">
                        {p.userId?.name}
                        <span className="text-[10px] text-gray-400 font-mono block">
                          {p.userId?.email}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-sans">
                        <div className="font-bold text-white truncate max-w-xs">
                          {p.productId?.name}
                        </div>
                        <span className="text-[10px] text-gray-400 font-mono">
                          {p.productId?.styleId}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-white text-sm">
                        ₹{p.winningBid.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4 text-emerald-400">{p.razorpayPaymentId}</td>
                      <td className="py-3.5 px-4 font-sans">
                        <Badge status={p.paymentStatus} size="xs" />
                      </td>
                      <td className="py-3.5 px-4 text-gray-400 font-sans text-[11px]">
                        {p.paidAt ? new Date(p.paidAt).toLocaleString() : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPayments;
