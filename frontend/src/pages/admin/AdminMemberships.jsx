import React, { useState, useEffect } from 'react';
import AdminHeader from '../../components/admin/AdminHeader';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import api from '../../api/client';

const AdminMemberships = () => {
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMemberships = async () => {
      try {
        const res = await api.get('/admin/memberships');
        if (res.data.success) {
          setMemberships(res.data.memberships || []);
        }
      } catch (err) {
        console.error('Failed to load membership records:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMemberships();
  }, []);

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <AdminHeader
        title="MEMBERSHIP PAYMENT RECORDS"
        subtitle="Real immutable Razorpay ₹49 transaction records stored in MongoDB"
      />

      <div className="p-6 md:p-8 flex-1">
        {loading ? (
          <div className="py-20 text-center text-xs text-gray-400 font-mono tracking-widest uppercase">
            Loading membership ledgers...
          </div>
        ) : memberships.length === 0 ? (
          <EmptyState
            title="No Membership Payments"
            description="Verified ₹49 membership activation records will appear here."
          />
        ) : (
          <div className="bg-luxury-surface border border-luxury-border rounded-2xl overflow-hidden shadow-card-dark">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-luxury-card/70 border-b border-luxury-border text-gray-400 uppercase tracking-wider font-bold">
                  <tr>
                    <th className="py-3.5 px-4">Collector</th>
                    <th className="py-3.5 px-4">Amount</th>
                    <th className="py-3.5 px-4">Razorpay Order ID</th>
                    <th className="py-3.5 px-4">Razorpay Payment ID</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Activated</th>
                    <th className="py-3.5 px-4">Expires</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-luxury-border/40 text-gray-300 font-mono">
                  {memberships.map((m) => (
                    <tr key={m._id} className="hover:bg-luxury-card/30 transition">
                      <td className="py-3.5 px-4 font-sans font-bold text-white">
                        {m.userId?.name || 'Collector'}
                        <span className="text-[10px] text-gray-400 font-mono block">
                          {m.userId?.email}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-luxury-gold">
                        ₹{m.amount}
                      </td>
                      <td className="py-3.5 px-4 text-gray-400">{m.razorpayOrderId}</td>
                      <td className="py-3.5 px-4 text-emerald-400">{m.razorpayPaymentId}</td>
                      <td className="py-3.5 px-4 font-sans">
                        <Badge status={m.status} size="xs" />
                      </td>
                      <td className="py-3.5 px-4 text-gray-400 font-sans text-[11px]">
                        {new Date(m.activatedAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-gray-400 font-sans text-[11px]">
                        {new Date(m.expiresAt).toLocaleDateString()}
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

export default AdminMemberships;
