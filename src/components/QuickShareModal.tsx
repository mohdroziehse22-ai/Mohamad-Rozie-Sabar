import React, { useState } from 'react';
import { DeliveryFormData } from '../types/form';
import { Copy, Check, X, Share2, MessageSquare, Download } from 'lucide-react';

interface QuickShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: DeliveryFormData;
}

export const QuickShareModal: React.FC<QuickShareModalProps> = ({
  isOpen,
  onClose,
  formData,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const activities = [
    formData.activities.deliveryGoodsIn ? 'Delivery / Goods IN' : '',
    formData.activities.loadingGoodsOut ? 'Loading / Goods OUT' : '',
    formData.activities.returnGoods ? 'Return' : '',
  ]
    .filter(Boolean)
    .join(', ');

  const personnelCount = formData.personnel.filter((p) => p.name.trim()).length;
  const goodsCount = formData.goods.filter((g) => g.description.trim()).length;
  const hazardousItems = formData.goods.filter((g) => g.isHazardous);
  const fragileItems = formData.goods.filter((g) => g.isFragile);
  const attachments = formData.goods.filter((g) => g.attachment);

  const safetyAlerts = [
    hazardousItems.length > 0 ? `⚠️ ${hazardousItems.length} HAZMAT` : '',
    fragileItems.length > 0 ? `🍷 ${fragileItems.length} FRAGILE` : '',
    attachments.length > 0 ? `📎 ${attachments.length} DOCS ATTACHED` : '',
  ]
    .filter(Boolean)
    .join(' | ');

  const summaryText = `*WORKING AREA 308 - DELIVERY/LOADING ENTRY NOTICE*
Ref: ${formData.referenceNo}
Date: ${formData.date} | Time: ${formData.timeIn || 'TBD'} - ${formData.timeOut || 'Open'}
Activity: ${activities || 'General Delivery'}
Company: ${formData.companyContractor || 'N/A'}
PIC: ${formData.picName || 'N/A'} (${formData.picContact || 'N/A'})

*VEHICLE & DRIVER:*
Vehicle: ${formData.vehicleReg || 'N/A'} (${formData.vehicleType || 'Lorry'})
Driver: ${formData.driverName || 'N/A'} (${formData.driverContact || 'N/A'})

*CARGO & SAFETY PROTOCOL:*
Registered Workers: ${personnelCount} pax
Items Listed: ${goodsCount} items
${safetyAlerts ? `Safety Flags: ${safetyAlerts}\n` : ''}Status: ${formData.status}

_Form completed per Area 308 Facility Safety SOP._`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(summaryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleDownloadJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(formData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `Area308_${formData.referenceNo}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-white rounded-xl shadow-2xl border border-zinc-200 max-w-lg w-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-200 bg-zinc-50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-zinc-900 text-sm">Entry Permit Summary</h3>
              <p className="text-xs text-zinc-500">Quick dispatch message for Security & PIC</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-3">
          <div className="text-xs text-zinc-600">
            Copy this formatted notice to dispatch directly to WhatsApp groups, Gate Security radio desk, or Area PIC:
          </div>
          <div className="relative">
            <textarea
              readOnly
              rows={9}
              value={summaryText}
              className="w-full font-mono text-xs p-3 rounded-lg border border-zinc-300 bg-zinc-50 text-zinc-800 focus:outline-hidden resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-zinc-200 bg-zinc-50">
          <button
            type="button"
            onClick={handleDownloadJson}
            className="px-3 py-1.5 text-xs font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export JSON
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition-all ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-zinc-900 hover:bg-black text-white'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied to Clipboard!' : 'Copy Summary'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
