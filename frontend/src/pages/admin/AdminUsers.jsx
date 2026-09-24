import React, { useState, useEffect } from 'react';
import { Users, Shield, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import AdminHeader from '../../components/admin/AdminHeader';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import api from '../../api/client';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/users');
      if (res.data.success) {
        setUsers(res.data.users || []);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleAccess = async (user) => {
    const isCurrentlyActive = user.auctionAccessStatus === 'ACTIVE';
    const action = isCurrentlyActive ? 'SUSPEND' : 'RESTORE';

    if (!window.confirm(`Are you sure you want to ${action} auction access for ${user.name}?`)) {
      return;
    }

    try {
      const res = await api.patch(`/admin/users/${user._id}/access`, { action });
      if (res.data.success) {
        setUsers((prev) =>
          prev.map((u) => (u._id === user._id ? res.data.user : u))
        );
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle access.');
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <AdminHeader
        title="COLLECTOR DIRECTORY"
        subtitle="Manage collector access permissions, membership state, and account security"
      />

      <div className="p-4 sm:p-6 md:p-8 flex-1 w-full max-w-full">
        {loading ? (
          <div className="py-20 text-center text-xs text-gray-400 font-mono tracking-widest uppercase">
            Loading collector accounts...
          </div>
        ) : users.length === 0 ? (
          <EmptyState
            title="No Users Registered"
            description="Collectors will appear here once they register."
          />
        ) : (
          <div className="bg-luxury-surface border border-luxury-border rounded-2xl overflow-hidden shadow-card-dark w-full max-w-full">
            <div className="overflow-x-auto w-full">
              <table className="w-full min-w-[700px] text-left text-xs">
                <thead className="bg-luxury-card/70 border-b border-luxury-border text-gray-400 uppercase tracking-wider font-bold">
                  <tr>
                    <th className="py-3.5 px-4">Collector</th>
                    <th className="py-3.5 px-4">Masked Email</th>
                    <th className="py-3.5 px-4">Email Status</th>
                    <th className="py-3.5 px-4">Membership</th>
                    <th className="py-3.5 px-4">Auction Access</th>
                    <th className="py-3.5 px-4">Drops Joined</th>
                    <th className="py-3.5 px-4">Drops Won</th>
                    <th className="py-3.5 px-4">Defaults</th>
                    <th className="py-3.5 px-4 text-right">Access Control</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-luxury-border/40 text-gray-300">
                  {users.map((u) => (
                    <tr key={u._id} className="hover:bg-luxury-card/30 transition">
                      <td className="py-3.5 px-4 font-bold text-white">
                        {u.name}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-gray-400">
                        {u.maskedEmail || u.email}
                      </td>
                      <td className="py-3.5 px-4">
                        {u.emailVerified ? (
                          <span className="flex items-center gap-1 text-emerald-400 font-semibold text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-amber-400 font-semibold text-[11px]">
                            <AlertTriangle className="w-3.5 h-3.5" /> Unverified
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge status={u.membershipStatus} size="xs" />
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge
                          status={u.auctionAccessStatus === 'ACTIVE' ? 'ACTIVE' : 'BLOCKED'}
                          size="xs"
                        />
                      </td>
                      <td className="py-3.5 px-4 font-mono">
                        {u.auctionsJoined || 0}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-emerald-400 font-bold">
                        {u.auctionsWon || 0}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-red-400">
                        {u.forfeitedMembershipCount || 0}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleToggleAccess(u)}
                          className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition ${
                            u.auctionAccessStatus === 'ACTIVE'
                              ? 'bg-red-950/40 text-red-400 border border-red-500/40 hover:bg-red-900/50'
                              : 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-900/50'
                          }`}
                        >
                          {u.auctionAccessStatus === 'ACTIVE' ? 'Suspend Access' : 'Restore Access'}
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
    </div>
  );
};

export default AdminUsers;
