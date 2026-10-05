import React, { useState } from 'react';
import { DeliveryFormData, StatusAuditEntry, getRecordAuditTrail } from '../types/form';
import {
  Clock,
  CheckCircle2,
  ArrowRight,
  History,
  User,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Send,
  PlusCircle,
  Truck,
  FileCheck,
} from 'lucide-react';

interface StatusAuditTrailProps {
  record: DeliveryFormData;
  onUpdateStatus?: (
    recordId: string,
    newStatus: DeliveryFormData['status'],
    note?: string,
    actor?: string
  ) => void;
  defaultExpanded?: boolean;
}

const ALL_STAGES: DeliveryFormData['status'][] = [
  'Draft',
  'Submitted',
  'Approved',
  'On-Site',
  'Completed',
];

const getStatusTheme = (status: DeliveryFormData['status']) => {
  switch (status) {
    case 'Draft':
      return {
        bg: 'bg-amber-50',
        text: 'text-amber-800',
        border: 'border-amber-300',
        badge: 'bg-amber-100 text-amber-900 border-amber-300',
        dot: 'bg-amber-500',
        ring: 'ring-amber-200',
      };
    case 'Submitted':
      return {
        bg: 'bg-blue-50',
        text: 'text-blue-800',
        border: 'border-blue-300',
        badge: 'bg-blue-100 text-blue-900 border-blue-300',
        dot: 'bg-blue-500',
        ring: 'ring-blue-200',
      };
    case 'Approved':
      return {
        bg: 'bg-emerald-50',
        text: 'text-emerald-800',
        border: 'border-emerald-300',
        badge: 'bg-emerald-100 text-emerald-900 border-emerald-300',
        dot: 'bg-emerald-500',
        ring: 'ring-emerald-200',
      };
    case 'On-Site':
      return {
        bg: 'bg-indigo-50',
        text: 'text-indigo-800',
        border: 'border-indigo-300',
        badge: 'bg-indigo-100 text-indigo-900 border-indigo-300',
        dot: 'bg-indigo-500',
        ring: 'ring-indigo-200',
      };
    case 'Completed':
      return {
        bg: 'bg-zinc-100',
        text: 'text-zinc-800',
        border: 'border-zinc-300',
        badge: 'bg-zinc-200 text-zinc-800 border-zinc-300',
        dot: 'bg-zinc-600',
        ring: 'ring-zinc-300',
      };
    default:
      return {
        bg: 'bg-zinc-50',
        text: 'text-zinc-700',
        border: 'border-zinc-300',
        badge: 'bg-zinc-100 text-zinc-700 border-zinc-300',
        dot: 'bg-zinc-400',
        ring: 'ring-zinc-200',
      };
  }
};

export const StatusAuditTrail: React.FC<StatusAuditTrailProps> = ({
  record,
  onUpdateStatus,
  defaultExpanded = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [nextStatus, setNextStatus] = useState<DeliveryFormData['status']>(() => {
    const currentIndex = ALL_STAGES.indexOf(record.status);
    return currentIndex < ALL_STAGES.length - 1 ? ALL_STAGES[currentIndex + 1] : record.status;
  });
  const [transitionNote, setTransitionNote] = useState('');
  const [transitionActor, setTransitionActor] = useState('');

  const auditTrail: StatusAuditEntry[] = getRecordAuditTrail(record);
  const latestEntry = auditTrail[auditTrail.length - 1];

  const currentStageIndex = ALL_STAGES.indexOf(record.status);

  const handleApplyTransition = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onUpdateStatus) return;

    if (nextStatus === record.status) {
      alert('Selected status is the same as current status.');
      return;
    }

    onUpdateStatus(
      record.id,
      nextStatus,
      transitionNote.trim() || undefined,
      transitionActor.trim() || undefined
    );

    setTransitionNote('');
    setTransitionActor('');
    setIsAdvancing(false);
  };

  const getQuickNextStatus = (): DeliveryFormData['status'] | null => {
    if (currentStageIndex >= 0 && currentStageIndex < ALL_STAGES.length - 1) {
      return ALL_STAGES[currentStageIndex + 1];
    }
    return null;
  };

  const quickNext = getQuickNextStatus();

  return (
    <div className="mt-2 bg-white rounded-lg border border-zinc-200 overflow-hidden shadow-2xs">
      {/* Header bar / Toggle */}
      <div className="px-3 py-2 bg-zinc-50/80 flex items-center justify-between border-b border-zinc-100">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex-1 flex items-center justify-between text-left group cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <History className="w-3.5 h-3.5 text-zinc-500 group-hover:text-blue-600 transition-colors" />
            <span className="text-xs font-semibold text-zinc-800 group-hover:text-blue-700 transition-colors">
              Delivery Progression Audit Trail
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.2 bg-zinc-200 text-zinc-700 rounded-full">
              {auditTrail.length} {auditTrail.length === 1 ? 'event' : 'events'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
            {latestEntry && (
              <span className="hidden sm:inline-block font-mono text-zinc-600">
                {latestEntry.fromStatus ? (
                  <>
                    <strong className="text-zinc-700">{latestEntry.fromStatus}</strong> →{' '}
                    <strong className="text-zinc-900">{latestEntry.toStatus}</strong>
                  </>
                ) : (
                  <>
                    Created as <strong className="text-zinc-900">{latestEntry.toStatus}</strong>
                  </>
                )}{' '}
                at {latestEntry.formattedTime}
              </span>
            )}
            {isExpanded ? (
              <ChevronUp className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-600" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-600" />
            )}
          </div>
        </button>
      </div>

      {/* High-level 5-stage milestone stepper (always visible or compact) */}
      <div className="px-3 py-2 bg-white border-b border-zinc-100">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-1/2 left-3 right-3 -translate-y-1/2 h-0.5 bg-zinc-200 -z-0" />
          {ALL_STAGES.map((stage, idx) => {
            const isCompleted = idx < currentStageIndex;
            const isCurrent = idx === currentStageIndex;
            const theme = getStatusTheme(stage);

            return (
              <div key={stage} className="relative z-10 flex flex-col items-center">
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border transition-all ${
                    isCurrent
                      ? `${theme.dot} text-white border-white ring-2 ${theme.ring} shadow-xs scale-110`
                      : isCompleted
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white text-zinc-400 border-zinc-300'
                  }`}
                  title={`${stage} ${isCurrent ? '(Current)' : isCompleted ? '(Passed)' : '(Pending)'}`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </div>
                <span
                  className={`text-[9px] mt-1 tracking-tight font-medium ${
                    isCurrent
                      ? 'text-zinc-900 font-bold'
                      : isCompleted
                      ? 'text-zinc-600'
                      : 'text-zinc-400'
                  }`}
                >
                  {stage}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Expanded Detailed Audit Trail Timeline */}
      {isExpanded && (
        <div className="p-3 bg-zinc-50/50 space-y-3">
          <div className="relative pl-5 space-y-3.5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-200">
            {auditTrail.map((entry, index) => {
              const toTheme = getStatusTheme(entry.toStatus);
              const isLatest = index === auditTrail.length - 1;

              return (
                <div key={entry.id || index} className="relative text-xs">
                  {/* Timeline dot */}
                  <div
                    className={`absolute -left-5 top-1 w-2.5 h-2.5 rounded-full ring-2 ring-white ${
                      isLatest ? toTheme.dot : 'bg-zinc-400'
                    }`}
                  />

                  {/* Entry Card */}
                  <div
                    className={`p-2.5 rounded-md border bg-white ${
                      isLatest ? 'border-zinc-300 shadow-2xs' : 'border-zinc-200 opacity-90'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {entry.fromStatus ? (
                          <div className="inline-flex items-center gap-1 font-semibold">
                            <span className="font-mono text-zinc-600 px-1 py-0.2 bg-zinc-100 rounded text-[11px]">
                              {entry.fromStatus}
                            </span>
                            <ArrowRight className="w-3 h-3 text-zinc-400" />
                            <span
                              className={`font-mono px-1 py-0.2 rounded border text-[11px] font-bold ${toTheme.badge}`}
                            >
                              {entry.toStatus}
                            </span>
                          </div>
                        ) : (
                          <span
                            className={`font-mono px-1 py-0.2 rounded border text-[11px] font-bold ${toTheme.badge}`}
                          >
                            Initial Draft: {entry.toStatus}
                          </span>
                        )}

                        {isLatest && (
                          <span className="text-[9px] uppercase font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1 py-0.2 rounded">
                            Current Status
                          </span>
                        )}
                      </div>

                      {/* Time Pill */}
                      <div className="flex items-center gap-1 text-[11px] font-mono text-zinc-700 bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-200">
                        <Clock className="w-3 h-3 text-zinc-500" />
                        <span>at {entry.formattedTime}</span>
                      </div>
                    </div>

                    {/* Actor information */}
                    {entry.actor && (
                      <div className="flex items-center gap-1 text-[11px] text-zinc-600 mt-1">
                        <User className="w-3 h-3 text-zinc-400 shrink-0" />
                        <span>
                          Action by: <strong className="text-zinc-800">{entry.actor}</strong>
                        </span>
                      </div>
                    )}

                    {/* Notes */}
                    {entry.notes && (
                      <p className="mt-1 text-[11px] text-zinc-600 bg-zinc-50 p-1.5 rounded border border-zinc-200/80 italic">
                        "{entry.notes}"
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Status Advance / Update Section */}
          {onUpdateStatus && (
            <div className="pt-2 border-t border-zinc-200">
              {!isAdvancing ? (
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  {quickNext && (
                    <button
                      type="button"
                      onClick={() => {
                        const now = new Date();
                        const timeStr = now.toTimeString().slice(0, 5);
                        onUpdateStatus(
                          record.id,
                          quickNext,
                          `Quick advanced from ${record.status} to ${quickNext} at ${timeStr}`
                        );
                      }}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded shadow-2xs transition-colors cursor-pointer"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                      <span>
                        Advance to: <strong>{quickNext}</strong>
                      </span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setNextStatus(quickNext || record.status);
                      setIsAdvancing(true);
                    }}
                    className="inline-flex items-center gap-1 text-xs font-medium text-zinc-700 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 px-2 py-1 rounded transition-colors ml-auto cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Log Custom Status Change...</span>
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={handleApplyTransition}
                  className="bg-white p-2.5 rounded-md border border-blue-200 space-y-2 shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-900 flex items-center gap-1">
                      <Send className="w-3.5 h-3.5 text-blue-600" />
                      Record Status Change Transition
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsAdvancing(false)}
                      className="text-[11px] text-zinc-500 hover:text-zinc-800"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="block text-[10px] font-semibold text-zinc-600 mb-0.5">
                        New Status Target:
                      </label>
                      <select
                        value={nextStatus}
                        onChange={(e) =>
                          setNextStatus(e.target.value as DeliveryFormData['status'])
                        }
                        className="w-full border border-zinc-300 rounded px-2 py-1 text-xs bg-white text-zinc-900 focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                      >
                        {ALL_STAGES.map((st) => (
                          <option key={st} value={st}>
                            {st} {st === record.status ? '(Current)' : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-zinc-600 mb-0.5">
                        Authorized Person / Actor:
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Area 308 Lead / Gate Security"
                        value={transitionActor}
                        onChange={(e) => setTransitionActor(e.target.value)}
                        className="w-full border border-zinc-300 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-zinc-600 mb-0.5">
                      Transition Notes / Reason:
                    </label>
                    <input
                      type="text"
                      placeholder={`e.g. Moved from '${record.status}' to '${nextStatus}' after physical gate check`}
                      value={transitionNote}
                      onChange={(e) => setTransitionNote(e.target.value)}
                      className="w-full border border-zinc-300 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsAdvancing(false)}
                      className="px-2.5 py-1 text-xs text-zinc-600 hover:bg-zinc-100 rounded"
                    >
                      Dismiss
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded shadow-xs"
                    >
                      Apply & Log Transition
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
