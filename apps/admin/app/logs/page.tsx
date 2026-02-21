'use client';

import { useEffect, useMemo, useState } from 'react';
import { Clock3, Filter, Search } from 'lucide-react';
import { fetchAdminLogs, subscribeAdminLogs } from '@/lib/data';
import type { AdminLogEntry } from '@/lib/data';

const formatAction = (action: string) =>
  action
    .split('.')
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(' ');

const formatDateTime = (value: number) =>
  new Date(value).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

export default function LogsPage() {
  const [logs, setLogs] = useState<AdminLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [entityFilter, setEntityFilter] = useState('all');

  useEffect(() => {
    const bootstrap = async () => {
      const data = await fetchAdminLogs();
      setLogs(data);
    };

    void bootstrap();

    const unsub = subscribeAdminLogs((data) => {
      setLogs(data);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const filtered = useMemo(() => {
    const needle = query.toLowerCase();
    return logs.filter((log) => {
      const matchesEntity = entityFilter === 'all' || log.entityType === entityFilter;
      const blob = [
        log.action,
        log.entityType,
        log.entityId,
        log.actor?.displayName,
        log.actor?.email,
        JSON.stringify(log.metadata || {}),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return matchesEntity && blob.includes(needle);
    });
  }, [logs, query, entityFilter]);

  return (
    <div className="max-w-[1400px] mx-auto space-y-5">
      <section className="bg-[#f8faf7] border border-[#dfe6dd] rounded-[24px] p-5 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-[34px] leading-none font-semibold text-[#1f2d23]">Activity Logs</h1>
            <p className="text-sm text-[#849684] mt-1">Realtime audit trail for admin actions</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <div className="relative min-w-[260px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#91a192]" />
              <input
                type="text"
                placeholder="Search action, actor, metadata..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full h-10 rounded-xl bg-white border border-[#d8e1d7] pl-9 pr-3 text-sm text-[#2f4032] outline-none focus:border-[#b9cdb7]"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#91a192]" />
              <select
                value={entityFilter}
                onChange={(e) => setEntityFilter(e.target.value)}
                className="h-10 min-w-[180px] rounded-xl bg-white border border-[#d8e1d7] pl-9 pr-8 text-sm text-[#2f4032] outline-none focus:border-[#b9cdb7] appearance-none"
              >
                <option value="all">All Entities</option>
                <option value="booking">Bookings</option>
                <option value="payment">Payments</option>
                <option value="room">Rooms</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white border border-[#dce5db] rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(6)].map((_, idx) => (
              <div key={idx} className="h-12 rounded-lg bg-[#f1f5ef] animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-[#6c7f6d]">No audit entries found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#f5f8f4] border-b border-[#e3ebe2]">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-[#899a8a]">Action</th>
                  <th className="text-left py-3 px-4 font-semibold text-[#899a8a]">Entity</th>
                  <th className="text-left py-3 px-4 font-semibold text-[#899a8a]">Actor</th>
                  <th className="text-left py-3 px-4 font-semibold text-[#899a8a]">Metadata</th>
                  <th className="text-left py-3 px-4 font-semibold text-[#899a8a]">Time</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((log) => (
                  <tr key={log.id} className="border-b border-[#edf2ec] hover:bg-[#f8fbf7] align-top">
                    <td className="py-3 px-4">
                      <p className="font-semibold text-[#2f4032]">{formatAction(log.action)}</p>
                      <p className="text-xs text-[#8da08e]">{log.action}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-[#2f4032] capitalize">{log.entityType}</p>
                      <p className="text-xs text-[#8da08e]">{log.entityId}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-[#2f4032]">{log.actor?.displayName || 'System'}</p>
                      <p className="text-xs text-[#8da08e]">{log.actor?.email || log.actor?.uid || 'N/A'}</p>
                    </td>
                    <td className="py-3 px-4 max-w-[420px]">
                      <pre className="text-xs text-[#5f715f] whitespace-pre-wrap break-words">
                        {JSON.stringify(log.metadata || {}, null, 2)}
                      </pre>
                    </td>
                    <td className="py-3 px-4 text-[#617262] whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5">
                        <Clock3 className="w-3.5 h-3.5" />
                        {formatDateTime(log.createdAt)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
