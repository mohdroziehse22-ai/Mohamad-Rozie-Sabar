import React, { useState } from 'react';
import { DeliveryFormData } from '../types/form';
import { StatusAuditTrail } from './StatusAuditTrail';
export { StatusAuditTrail } from './StatusAuditTrail';
import {
  FileText,
  Search,
  X,
  Trash2,
  Copy,
  ExternalLink,
  Download,
  Calendar,
  Truck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Wine,
  Paperclip,
} from 'lucide-react';

interface RecordHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  records: DeliveryFormData[];
  onSelectRecord: (record: DeliveryFormData) => void;
  onDuplicateRecord: (record: DeliveryFormData) => void;
  onDeleteRecord: (id: string) => void;
  onUpdateRecordStatus?: (
    recordId: string,
    newStatus: DeliveryFormData['status'],
    note?: string,
    actor?: string
  ) => void;
}

export const RecordHistoryDrawer: React.FC<RecordHistoryDrawerProps> = ({
  isOpen,
  onClose,
  records,
  onSelectRecord,
  onDuplicateRecord,
  onDeleteRecord,
  onUpdateRecordStatus,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  if (!isOpen) return null;

  const filtered = records.filter((rec) => {
    const matchesSearch =
      rec.referenceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.companyContractor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.vehicleReg.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.picName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || rec.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const exportAllToCsv = () => {
    if (records.length === 0) return;
    const headers = [
      'Ref No',
      'Date',
      'Time In',
      'Time Out',
      'Company',
      'PIC Name',
      'PIC Contact',
      'Driver Name',
      'Driver IC',
      'Vehicle Reg',
      'Vehicle Type',
      'Personnel Count',
      'Goods Count',
      'Hazardous Items',
      'Fragile Items',
      'Attached Docs',
      'Status',
    ];

    const rows = records.map((r) => [
      `"${r.referenceNo}"`,
      `"${r.date}"`,
      `"${r.timeIn}"`,
      `"${r.timeOut}"`,
      `"${r.companyContractor.replace(/"/g, '""')}"`,
      `"${r.picName.replace(/"/g, '""')}"`,
      `"${r.picContact}"`,
      `"${r.driverName.replace(/"/g, '""')}"`,
      `"${r.driverIc}"`,
      `"${r.vehicleReg}"`,
      `"${r.vehicleType}"`,
      r.personnel.filter((p) => p.name.trim()).length,
      r.goods.filter((g) => g.description.trim()).length,
      r.goods.filter((g) => g.isHazardous).length,
      r.goods.filter((g) => g.isFragile).length,
      r.goods.filter((g) => g.attachment).length,
      `"${r.status}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Area308_Delivery_Log_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white w-full max-w-xl h-full shadow-2xl flex flex-col border-l border-zinc-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-100 text-blue-800 rounded-lg">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-zinc-900 text-base">Area 308 Delivery Log Archive</h2>
              <p className="text-xs text-zinc-500">{records.length} total saved entry passes</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Actions Bar */}
        <div className="p-4 border-b border-zinc-200 bg-white space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search reference, vehicle plate, contractor, driver..."
              className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm border border-zinc-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-zinc-500 font-medium">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-zinc-300 rounded-md px-2 py-1 bg-white text-zinc-800 text-xs focus:outline-hidden"
              >
                <option value="all">All Statuses</option>
                <option value="Draft">Draft</option>
                <option value="Submitted">Submitted</option>
                <option value="Approved">Approved</option>
                <option value="On-Site">On-Site</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <button
              onClick={exportAllToCsv}
              disabled={records.length === 0}
              className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-700 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 px-2.5 py-1 rounded-md transition-colors disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV Log
            </button>
          </div>
        </div>

        {/* List of Records */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 divide-y-0">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-zinc-400 text-xs">
              <Truck className="w-8 h-8 mx-auto mb-2 opacity-40" />
              No matching records found.
            </div>
          ) : (
            filtered.map((record) => {
              const activeCount = record.personnel.filter((p) => p.name.trim()).length;
              const goodsCount = record.goods.filter((g) => g.description.trim()).length;

              return (
                <div
                  key={record.id}
                  className="p-3.5 rounded-lg border border-zinc-200 hover:border-blue-400 bg-zinc-50/50 hover:bg-blue-50/20 transition-all space-y-2 group"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                        {record.referenceNo}
                      </span>
                      <h4 className="font-semibold text-zinc-900 text-sm mt-1">
                        {record.companyContractor || 'Unnamed Contractor'}
                      </h4>
                    </div>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                        record.status === 'Approved'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                          : record.status === 'Submitted'
                          ? 'bg-blue-50 text-blue-700 border-blue-300'
                          : record.status === 'On-Site'
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-300'
                          : record.status === 'Completed'
                          ? 'bg-zinc-100 text-zinc-700 border-zinc-300'
                          : 'bg-amber-50 text-amber-700 border-amber-300'
                      }`}
                    >
                      {record.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs text-zinc-600">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      <span>{record.date} ({record.timeIn || '—'})</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      <span className="font-mono font-medium text-zinc-800">{record.vehicleReg || 'No Plate'}</span>
                    </div>
                  </div>

                  {/* Safety & Material Flag Badges */}
                  {(record.goods.some((g) => g.isHazardous || g.isFragile || g.attachment)) && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                      {record.goods.some((g) => g.isHazardous) && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.2 bg-amber-100 text-amber-900 border border-amber-300 rounded">
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                          HAZMAT ({record.goods.filter((g) => g.isHazardous).length})
                        </span>
                      )}
                      {record.goods.some((g) => g.isFragile) && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.2 bg-purple-100 text-purple-900 border border-purple-300 rounded">
                          <Wine className="w-3 h-3 text-purple-600" />
                          FRAGILE ({record.goods.filter((g) => g.isFragile).length})
                        </span>
                      )}
                      {record.goods.some((g) => g.attachment) && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.2 bg-blue-50 text-blue-800 border border-blue-200 rounded">
                          <Paperclip className="w-3 h-3 text-blue-600" />
                          {record.goods.filter((g) => g.attachment).length} Docs
                        </span>
                      )}
                    </div>
                  )}

                  {/* Status Progression Audit Trail Sub-Component */}
                  <StatusAuditTrail
                    record={record}
                    onUpdateStatus={onUpdateRecordStatus}
                  />

                  <div className="text-[11px] text-zinc-500 flex items-center justify-between border-t border-zinc-200 pt-2 mt-2">
                    <span>
                      Driver: <strong>{record.driverName || '—'}</strong> • {activeCount} Workers • {goodsCount} Items
                    </span>
                    <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100">
                      <button
                        onClick={() => {
                          onDuplicateRecord(record);
                          onClose();
                        }}
                        title="Duplicate as new entry"
                        className="p-1 hover:text-blue-600 hover:bg-white rounded transition-colors"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          onSelectRecord(record);
                          onClose();
                        }}
                        className="px-2 py-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded flex items-center gap-1 shadow-xs transition-colors"
                      >
                        Load Form
                      </button>
                      <button
                        onClick={() => onDeleteRecord(record.id)}
                        title="Delete record"
                        className="p-1 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-200 bg-zinc-50 flex items-center justify-between text-xs text-zinc-500">
          <span>Working Area 308 Facility Safety Records</span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-zinc-200 hover:bg-zinc-300 font-medium text-zinc-700 rounded-md transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
