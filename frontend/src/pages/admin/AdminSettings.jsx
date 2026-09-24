import React, { useState, useEffect } from 'react';
import { Sliders, Shield, History, Activity, Database, CheckCircle2 } from 'lucide-react';
import AdminHeader from '../../components/admin/AdminHeader';
import api from '../../api/client';

const AdminSettings = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAuditLogs = async () => {
      try {
        const res = await api.get('/admin/audit-logs');
        if (res.data.success) {
          setLogs(res.data.logs || []);
        }
      } catch (err) {
        console.error('Failed to load audit logs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAuditLogs();
  }, []);

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <AdminHeader
        title="SYSTEM &amp; IMMUTABLE AUDIT LOG"
        subtitle="Cryptographically backed event log of all critical administrator and scheduler operations"
      />

      <div className="p-6 md:p-8 space-y-8 flex-1">
        {/* System Health Indicators */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-luxury-surface border border-luxury-border flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block">
                Database Engine
              </span>
              <span className="font-bold text-sm text-white">MongoDB Atlas (Mongoose)</span>
              <span className="text-[10px] text-emerald-400 block mt-0.5">Automated AutoIndex Active</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-luxury-surface border border-luxury-border flex items-center gap-4">
            <div className="p-3 bg-luxury-gold/10 text-luxury-gold border border-luxury-gold/20 rounded-xl">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block">
                Schedulers
              </span>
              <span className="font-bold text-sm text-white">Node-Cron Automation</span>
              <span className="text-[10px] text-luxury-gold block mt-0.5">10s Auction Lifecycle Active</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-luxury-surface border border-luxury-border flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-xl">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block">
                Payments
              </span>
              <span className="font-bold text-sm text-white">Razorpay Node SDK</span>
              <span className="text-[10px] text-blue-400 block mt-0.5">HMAC SHA-256 Webhook Armed</span>
            </div>
          </div>
        </div>

        {/* Immutable Audit Log Table */}
        <div className="bg-luxury-surface border border-luxury-border rounded-2xl p-6 shadow-card-dark">
          <div className="flex items-center justify-between pb-4 border-b border-luxury-border mb-4">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-luxury-gold" />
              <h3 className="font-bold text-sm text-white uppercase tracking-wider">
                Immutable Operations Audit Log
              </h3>
            </div>
            <span className="text-[10px] text-gray-500 font-mono">
              Append-Only &bull; Non-Editable
            </span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-gray-400 font-mono tracking-widest uppercase">
              Querying audit logs...
            </div>
          ) : logs.length === 0 ? (
            <p className="text-xs text-gray-500 py-8 text-center">
              No audit logs recorded yet. All administrative actions will be automatically registered here.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="text-gray-400 uppercase tracking-wider text-[11px] border-b border-luxury-border">
                  <tr>
                    <th className="py-3 px-3">Timestamp</th>
                    <th className="py-3 px-3">Action</th>
                    <th className="py-3 px-3">Entity</th>
                    <th className="py-3 px-3">Entity ID</th>
                    <th className="py-3 px-3">Actor</th>
                    <th className="py-3 px-3">Metadata</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-luxury-border/40 text-gray-300">
                  {logs.map((log) => (
                    <tr key={log._id} className="hover:bg-luxury-card/30 transition text-[11px]">
                      <td className="py-2.5 px-3 text-gray-400">
                        {new Date(log.createdAt).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-luxury-gold">{log.action}</td>
                      <td className="py-2.5 px-3 text-white">{log.entity}</td>
                      <td className="py-2.5 px-3 text-gray-400">{log.entityId || 'N/A'}</td>
                      <td className="py-2.5 px-3 text-emerald-400 font-sans">{log.actorEmail}</td>
                      <td className="py-2.5 px-3 text-gray-400 max-w-xs truncate">
                        {JSON.stringify(log.metadata || {})}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
