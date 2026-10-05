import React, { useState, useEffect } from 'react';
import {
  DeliveryFormData,
  createEmptyFormData,
  sampleFormData,
  GoodsAttachment,
  StatusAuditEntry,
  getRecordAuditTrail,
} from './types/form';
import { OfficialFormView } from './components/OfficialFormView';
import { SignatureModal } from './components/SignatureModal';
import { RecordHistoryDrawer } from './components/RecordHistoryDrawer';
import { QuickShareModal } from './components/QuickShareModal';
import { AttachmentModal } from './components/AttachmentModal';
import {
  Printer,
  Save,
  History,
  FilePlus,
  Sparkles,
  Share2,
  CheckCircle,
  ShieldCheck,
  AlertTriangle,
  Info,
} from 'lucide-react';

const STORAGE_KEY = 'area_308_delivery_records';
const CURRENT_DRAFT_KEY = 'area_308_current_draft';

export default function App() {
  const [formData, setFormData] = useState<DeliveryFormData>(() => {
    try {
      const savedDraft = localStorage.getItem(CURRENT_DRAFT_KEY);
      if (savedDraft) {
        return JSON.parse(savedDraft);
      }
    } catch {
      // Ignore
    }
    return sampleFormData; // Start with the filled sample so the user immediately sees the form ready to print
  });

  const [records, setRecords] = useState<DeliveryFormData[]>(() => {
    try {
      const savedRecords = localStorage.getItem(STORAGE_KEY);
      if (savedRecords) {
        return JSON.parse(savedRecords);
      }
    } catch {
      // Ignore
    }
    return [sampleFormData];
  });

  // Modal states
  const [signatureTarget, setSignatureTarget] = useState<
    'requestedBy' | 'areaPic' | 'securityVerification' | null
  >(null);
  const [attachmentTargetIndex, setAttachmentTargetIndex] = useState<number | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // Auto-save draft
  useEffect(() => {
    try {
      localStorage.setItem(CURRENT_DRAFT_KEY, JSON.stringify(formData));
    } catch {
      // Ignore
    }
  }, [formData]);

  // Persist records
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch {
      // Ignore
    }
  }, [records]);

  const showToast = (message: string) => {
    setSaveToast(message);
    setTimeout(() => setSaveToast(null), 3500);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSaveRecord = () => {
    const existingIndex = records.findIndex((r) => r.id === formData.id);
    let updatedRecords: DeliveryFormData[];

    if (existingIndex >= 0) {
      updatedRecords = [...records];
      updatedRecords[existingIndex] = {
        ...formData,
        updatedAt: new Date().toISOString(),
      };
    } else {
      updatedRecords = [{ ...formData, updatedAt: new Date().toISOString() }, ...records];
    }

    setRecords(updatedRecords);
    showToast(`Entry #${formData.referenceNo} successfully saved to log archive!`);
  };

  const handleNewForm = () => {
    if (
      window.confirm(
        'Create a new blank delivery entry form? (Unsaved changes in draft will be cleared)'
      )
    ) {
      const newForm = createEmptyFormData();
      setFormData(newForm);
      showToast('New blank entry form created.');
    }
  };

  const handleLoadSample = () => {
    setFormData({
      ...sampleFormData,
      id: crypto.randomUUID ? crypto.randomUUID() : `sample-${Date.now()}`,
      referenceNo: `WA308-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`,
    });
    showToast('Loaded sample delivery dataset.');
  };

  const handleSelectRecord = (record: DeliveryFormData) => {
    setFormData(record);
    showToast(`Loaded entry ${record.referenceNo}.`);
  };

  const handleStatusChange = (
    newStatus: DeliveryFormData['status'],
    note?: string,
    actor?: string
  ) => {
    if (newStatus === formData.status) return;

    const now = new Date();
    const timeStr = now.toTimeString().slice(0, 5);
    const currentTrail = getRecordAuditTrail(formData);

    const defaultActor =
      actor ||
      (newStatus === 'Approved'
        ? formData.areaPic?.name || 'Area 308 Lead'
        : newStatus === 'On-Site'
        ? formData.securityVerification?.name || 'Gate 4 Security'
        : formData.requestedBy?.name || 'Area 308 Dispatcher');

    const newEntry: StatusAuditEntry = {
      id: crypto.randomUUID ? crypto.randomUUID() : `audit-${Date.now()}`,
      fromStatus: formData.status,
      toStatus: newStatus,
      timestamp: now.toISOString(),
      formattedTime: timeStr,
      actor: defaultActor,
      notes: note || `Status progressed from '${formData.status}' to '${newStatus}'`,
    };

    const updatedFormData: DeliveryFormData = {
      ...formData,
      status: newStatus,
      auditTrail: [...currentTrail, newEntry],
      updatedAt: now.toISOString(),
    };

    setFormData(updatedFormData);

    // Keep log archive in sync if this record is already saved
    setRecords((prev) =>
      prev.map((r) =>
        r.id === formData.id
          ? {
              ...r,
              status: newStatus,
              auditTrail: updatedFormData.auditTrail,
              updatedAt: now.toISOString(),
            }
          : r
      )
    );

    showToast(`Progression: '${formData.status}' to '${newStatus}' at ${timeStr}`);
  };

  const handleUpdateRecordStatus = (
    recordId: string,
    newStatus: DeliveryFormData['status'],
    note?: string,
    actor?: string
  ) => {
    const now = new Date();
    const timeStr = now.toTimeString().slice(0, 5);

    setRecords((prev) =>
      prev.map((rec) => {
        if (rec.id !== recordId) return rec;

        const currentTrail = getRecordAuditTrail(rec);
        const defaultActor =
          actor ||
          (newStatus === 'Approved'
            ? rec.areaPic?.name || 'Area 308 Lead'
            : newStatus === 'On-Site'
            ? rec.securityVerification?.name || 'Gate 4 Security'
            : rec.requestedBy?.name || 'Site Logistics');

        const newEntry: StatusAuditEntry = {
          id: crypto.randomUUID ? crypto.randomUUID() : `audit-${Date.now()}`,
          fromStatus: rec.status,
          toStatus: newStatus,
          timestamp: now.toISOString(),
          formattedTime: timeStr,
          actor: defaultActor,
          notes: note || `Status changed from '${rec.status}' to '${newStatus}'`,
        };

        const updatedRecord: DeliveryFormData = {
          ...rec,
          status: newStatus,
          auditTrail: [...currentTrail, newEntry],
          updatedAt: now.toISOString(),
        };

        // If currently editing this record, sync the active editor state
        if (formData.id === recordId) {
          setFormData(updatedRecord);
        }

        showToast(`Ref #${rec.referenceNo}: '${rec.status}' to '${newStatus}' at ${timeStr}`);
        return updatedRecord;
      })
    );
  };

  const handleDuplicateRecord = (record: DeliveryFormData) => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().slice(0, 5);
    const newRef = `WA308-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;

    const duplicated: DeliveryFormData = {
      ...record,
      id: crypto.randomUUID ? crypto.randomUUID() : `dup-${Date.now()}`,
      referenceNo: newRef,
      date: dateStr,
      timeIn: timeStr,
      timeOut: '',
      deliveryTime: timeStr,
      status: 'Draft',
      requestedBy: {
        name: record.requestedBy.name,
        signature: '',
        dateTime: `${dateStr}T${timeStr}`,
      },
      areaPic: {
        name: '',
        signature: '',
        dateTime: '',
      },
      securityVerification: {
        name: '',
        signature: '',
        dateTime: '',
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      auditTrail: [
        {
          id: crypto.randomUUID ? crypto.randomUUID() : `audit-${Date.now()}`,
          fromStatus: null,
          toStatus: 'Draft',
          timestamp: now.toISOString(),
          formattedTime: timeStr,
          actor: record.requestedBy?.name || 'Dispatcher',
          notes: `Cloned from permit #${record.referenceNo}`,
        },
      ],
    };

    setFormData(duplicated);
    showToast(`Created duplicate entry with new Ref #${newRef}.`);
  };

  const handleDeleteRecord = (id: string) => {
    if (window.confirm('Delete this record from log archive?')) {
      setRecords(records.filter((r) => r.id !== id));
      showToast('Record removed.');
    }
  };

  const handleApplySignature = (signatureData: string, signerName?: string) => {
    if (!signatureTarget) return;

    const now = new Date();
    const dt = `${now.toISOString().split('T')[0]}T${now.toTimeString().slice(0, 5)}`;
    const timeStr = now.toTimeString().slice(0, 5);

    setFormData((prev) => {
      const existing = prev[signatureTarget];
      const effectiveSigner = signerName !== undefined && signerName.trim() ? signerName : existing.name;
      const currentTrail = getRecordAuditTrail(prev);

      let nextStatus = prev.status;
      const newAuditEntries: StatusAuditEntry[] = [];

      if (signatureTarget === 'requestedBy' && prev.status === 'Draft') {
        nextStatus = 'Submitted';
        newAuditEntries.push({
          id: crypto.randomUUID ? crypto.randomUUID() : `audit-${Date.now()}`,
          fromStatus: 'Draft',
          toStatus: 'Submitted',
          timestamp: now.toISOString(),
          formattedTime: timeStr,
          actor: effectiveSigner || 'Applicant Requester',
          notes: 'Signed and submitted for Area 308 PIC verification',
        });
      } else if (signatureTarget === 'areaPic' && (prev.status === 'Submitted' || prev.status === 'Draft')) {
        nextStatus = 'Approved';
        newAuditEntries.push({
          id: crypto.randomUUID ? crypto.randomUUID() : `audit-${Date.now()}`,
          fromStatus: prev.status,
          toStatus: 'Approved',
          timestamp: now.toISOString(),
          formattedTime: timeStr,
          actor: effectiveSigner || 'Area 308 PIC Lead',
          notes: 'Signed and approved by Area 308 Facility Lead',
        });
      } else if (signatureTarget === 'securityVerification' && prev.status === 'Approved') {
        nextStatus = 'On-Site';
        newAuditEntries.push({
          id: crypto.randomUUID ? crypto.randomUUID() : `audit-${Date.now()}`,
          fromStatus: 'Approved',
          toStatus: 'On-Site',
          timestamp: now.toISOString(),
          formattedTime: timeStr,
          actor: effectiveSigner || 'Gate 4 Security',
          notes: 'Physical entry inspection signed and vehicle admitted on-site',
        });
      }

      return {
        ...prev,
        status: nextStatus,
        [signatureTarget]: {
          ...existing,
          signature: signatureData,
          name: effectiveSigner,
          dateTime: existing.dateTime || dt,
        },
        auditTrail: [...currentTrail, ...newAuditEntries],
        updatedAt: now.toISOString(),
      };
    });

    showToast(
      `Signature applied to ${
        signatureTarget === 'requestedBy'
          ? 'Requested By'
          : signatureTarget === 'areaPic'
          ? 'Area 308 PIC'
          : 'Security Verification'
      }`
    );
    setSignatureTarget(null);
  };

  const handleSaveAttachment = (attachment: GoodsAttachment | null) => {
    if (attachmentTargetIndex === null) return;
    const updatedGoods = [...formData.goods];
    updatedGoods[attachmentTargetIndex] = {
      ...updatedGoods[attachmentTargetIndex],
      attachment,
    };
    setFormData({
      ...formData,
      goods: updatedGoods,
      updatedAt: new Date().toISOString(),
    });
    showToast(
      attachment
        ? `Attached ${attachment.name} to Item #${attachmentTargetIndex + 1}`
        : `Removed attachment from Item #${attachmentTargetIndex + 1}`
    );
    setAttachmentTargetIndex(null);
  };

  const getSignatureTargetTitle = () => {
    if (signatureTarget === 'requestedBy') return 'Applicant / Requester Signoff';
    if (signatureTarget === 'areaPic') return 'Area 308 PIC Verification Signoff';
    if (signatureTarget === 'securityVerification') return 'Security / Site Verification Signoff';
    return 'Digital Signature';
  };

  const getCurrentSignature = () => {
    if (!signatureTarget) return '';
    return formData[signatureTarget].signature;
  };

  const getInitialName = () => {
    if (!signatureTarget) return '';
    return formData[signatureTarget].name;
  };

  // Personnel and Goods counts
  const activePersonnelCount = formData.personnel.filter((p) => p.name.trim()).length;
  const activeGoodsCount = formData.goods.filter((g) => g.description.trim()).length;

  return (
    <div className="min-h-screen bg-zinc-100 flex flex-col text-zinc-900 font-sans">
      {/* Toast Notification */}
      {saveToast && (
        <div className="fixed top-4 right-4 z-50 bg-zinc-900 text-white px-4 py-2.5 rounded-lg shadow-xl text-xs sm:text-sm font-medium flex items-center gap-2 border border-zinc-700 animate-in fade-in slide-in-from-top-2">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{saveToast}</span>
        </div>
      )}

      {/* Top Application Header (Hidden in Print) */}
      <header className="no-print bg-zinc-900 text-white border-b border-zinc-800 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
          {/* Logo & Facility Identification */}
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-amber-500 text-zinc-950 font-black text-xs rounded-sm tracking-wider uppercase flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Area 308</span>
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-1.5">
                Delivery / Loading Entry Portal
              </h1>
              <p className="text-[11px] text-zinc-400 hidden sm:block">
                Working Area 308 Facility Safety & Loading Protocol Form
              </p>
            </div>
          </div>

          {/* Controls & Quick Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Status Selector */}
            <div className="flex items-center bg-zinc-800 rounded-md px-2 py-1 text-xs border border-zinc-700">
              <span className="text-zinc-400 mr-1.5 text-[11px] hidden sm:inline">Status:</span>
              <select
                value={formData.status}
                onChange={(e) =>
                  handleStatusChange(e.target.value as DeliveryFormData['status'])
                }
                className="bg-transparent text-white font-semibold text-xs focus:outline-hidden cursor-pointer"
              >
                <option value="Draft" className="bg-zinc-800 text-white">Draft</option>
                <option value="Submitted" className="bg-zinc-800 text-white">Submitted</option>
                <option value="Approved" className="bg-zinc-800 text-white">Approved</option>
                <option value="On-Site" className="bg-zinc-800 text-white">On-Site</option>
                <option value="Completed" className="bg-zinc-800 text-white">Completed</option>
              </select>
            </div>

            {/* Quick Share */}
            <button
              onClick={() => setIsShareOpen(true)}
              title="Share / Copy message for WhatsApp/Security dispatch"
              className="px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium rounded-md border border-zinc-700 flex items-center gap-1.5 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Quick Dispatch</span>
            </button>

            {/* Save Record */}
            <button
              onClick={handleSaveRecord}
              title="Save this entry to log archive"
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-md shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Pass</span>
            </button>

            {/* Print Form (Primary Action) */}
            <button
              onClick={handlePrint}
              title="Print official form (Ctrl+P)"
              className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold rounded-md shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Form</span>
            </button>

            {/* History Drawer Trigger */}
            <button
              onClick={() => setIsHistoryOpen(true)}
              className="px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium rounded-md border border-zinc-700 flex items-center gap-1.5 transition-colors relative"
            >
              <History className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Archive Log</span>
              {records.length > 0 && (
                <span className="bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                  {records.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Secondary Quick Action Bar (Hidden in Print) */}
      <div className="no-print bg-white border-b border-zinc-200 py-2 px-4 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4 text-zinc-600">
            <span className="font-medium flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Working Area 308 Safety System Active
            </span>
            <span className="hidden md:inline text-zinc-300">|</span>
            <span className="hidden md:inline">
              Ref: <strong className="font-mono text-zinc-900">{formData.referenceNo}</strong>
            </span>
            <span className="hidden lg:inline text-zinc-300">|</span>
            <span className="hidden lg:inline">
              Workers Registered: <strong>{activePersonnelCount}</strong> • Cargo Items:{' '}
              <strong>{activeGoodsCount}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleLoadSample}
              className="px-2.5 py-1 text-zinc-700 hover:text-blue-700 hover:bg-blue-50 rounded border border-zinc-200 flex items-center gap-1 text-xs font-medium transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              Load Sample Delivery
            </button>
            <button
              onClick={handleNewForm}
              className="px-2.5 py-1 text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 rounded border border-zinc-200 flex items-center gap-1 text-xs font-medium transition-colors"
            >
              <FilePlus className="w-3.5 h-3.5" />
              New Blank Form
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 py-4 sm:py-8 px-2 sm:px-4">
        {/* Printable Notice Box on Screen */}
        <div className="no-print max-w-[840px] mx-auto mb-3 px-3 py-2 bg-amber-50 border border-amber-300 rounded-lg text-amber-900 text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              <strong>Official Form Mode:</strong> All input fields can be typed directly. Click signature boxes to draw or apply verification stamps. Click <strong>Print Form</strong> to generate the exact paper document.
            </span>
          </div>
          <button
            onClick={handlePrint}
            className="shrink-0 bg-amber-600 hover:bg-amber-700 text-white font-semibold px-2.5 py-1 rounded text-xs flex items-center gap-1 shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" /> Print
          </button>
        </div>

        {/* The Exact Official Form */}
        <OfficialFormView
          formData={formData}
          onChange={setFormData}
          onOpenSignature={(target) => setSignatureTarget(target)}
          onOpenAttachment={(idx) => setAttachmentTargetIndex(idx)}
        />
      </main>

      {/* Signature Modal */}
      <SignatureModal
        isOpen={!!signatureTarget}
        onClose={() => setSignatureTarget(null)}
        onSave={handleApplySignature}
        title={getSignatureTargetTitle()}
        initialName={getInitialName()}
        currentSignature={getCurrentSignature()}
      />

      {/* Material Document Attachment Modal */}
      {attachmentTargetIndex !== null && (
        <AttachmentModal
          isOpen={attachmentTargetIndex !== null}
          onClose={() => setAttachmentTargetIndex(null)}
          itemIndex={attachmentTargetIndex}
          itemDescription={formData.goods[attachmentTargetIndex]?.description || ''}
          currentAttachment={formData.goods[attachmentTargetIndex]?.attachment}
          onSaveAttachment={handleSaveAttachment}
        />
      )}

      {/* History Log Drawer */}
      <RecordHistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        records={records}
        onSelectRecord={handleSelectRecord}
        onDuplicateRecord={handleDuplicateRecord}
        onDeleteRecord={handleDeleteRecord}
        onUpdateRecordStatus={handleUpdateRecordStatus}
      />

      {/* Quick Dispatch / Share Modal */}
      <QuickShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        formData={formData}
      />

      {/* Footer (Hidden in Print) */}
      <footer className="no-print bg-zinc-900 text-zinc-400 border-t border-zinc-800 text-xs py-4 px-4 text-center">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <span>Working Area 308 - Security, Safety & Logistics Management Portal</span>
          <span>SOP Reference: WA308-SOP-F02 • Authorized Personnel Only</span>
        </div>
      </footer>
    </div>
  );
}
