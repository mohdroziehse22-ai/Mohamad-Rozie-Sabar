import React, { useState, useRef } from 'react';
import { GoodsAttachment } from '../types/form';
import {
  Upload,
  FileText,
  X,
  Paperclip,
  Check,
  Trash2,
  FileCheck,
  AlertTriangle,
  Download,
} from 'lucide-react';

interface AttachmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemDescription: string;
  itemIndex: number;
  currentAttachment?: GoodsAttachment | null;
  onSaveAttachment: (attachment: GoodsAttachment | null) => void;
}

export const AttachmentModal: React.FC<AttachmentModalProps> = ({
  isOpen,
  onClose,
  itemDescription,
  itemIndex,
  currentAttachment,
  onSaveAttachment,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<GoodsAttachment | null>(
    currentAttachment || null
  );

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formattedSize =
      file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`;

    // Read as DataURL for local preview if needed
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedFile({
        name: file.name,
        size: formattedSize,
        type: file.type || 'application/pdf',
        dataUrl: reader.result as string,
      });
    };
    reader.readAsDataURL(file);
  };

  const handlePresetSelect = (presetName: string, presetSize: string) => {
    setSelectedFile({
      name: presetName,
      size: presetSize,
      type: 'application/pdf',
    });
  };

  const handleSave = () => {
    onSaveAttachment(selectedFile);
    onClose();
  };

  const handleRemove = () => {
    setSelectedFile(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-white rounded-xl shadow-2xl border border-zinc-200 max-w-lg w-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-200 bg-zinc-50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-100 text-blue-700 rounded-lg">
              <Paperclip className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-zinc-900 text-sm">
                Material Document Attachment
              </h3>
              <p className="text-xs text-zinc-500">
                Item #{itemIndex + 1}: {itemDescription ? `"${itemDescription.slice(0, 32)}..."` : 'Goods Item'}
              </p>
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
        <div className="p-5 space-y-4">
          {/* Current Attachment or Upload Box */}
          {selectedFile ? (
            <div className="p-4 rounded-lg border-2 border-emerald-300 bg-emerald-50/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-lg">
                  <FileCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-semibold text-zinc-900 text-sm break-all">
                    {selectedFile.name}
                  </div>
                  <div className="text-xs text-zinc-500 flex items-center gap-2 mt-0.5">
                    <span>{selectedFile.size}</span>
                    <span>•</span>
                    <span className="text-emerald-700 font-medium">Ready for permit attach</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleRemove}
                title="Remove attachment"
                className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-white rounded-md transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                const file = e.dataTransfer.files?.[0];
                if (file) {
                  const formattedSize =
                    file.size > 1024 * 1024
                      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
                      : `${Math.round(file.size / 1024)} KB`;
                  setSelectedFile({
                    name: file.name,
                    size: formattedSize,
                    type: file.type || 'application/pdf',
                  });
                }
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                dragOver
                  ? 'border-blue-500 bg-blue-50/60'
                  : 'border-zinc-300 hover:border-zinc-400 bg-zinc-50 hover:bg-zinc-100/70'
              }`}
            >
              <Upload className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
              <div className="text-xs font-semibold text-zinc-800">
                Click to browse or drag & drop file
              </div>
              <div className="text-[11px] text-zinc-500 mt-1">
                Upload MSDS Sheet, QA Mill Cert, Delivery Order, or Inspection Slip (PDF, PNG, JPG)
              </div>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          )}

          {/* Quick Facility Presets */}
          <div>
            <span className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-2">
              Quick Presets (Common Area 308 Docs)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() =>
                  handlePresetSelect(
                    `MSDS_Hazard_Sheet_Item_${itemIndex + 1}.pdf`,
                    '1.8 MB'
                  )
                }
                className="p-2 rounded-lg border border-zinc-200 hover:border-amber-400 bg-zinc-50 hover:bg-amber-50/50 text-left flex items-center gap-2 transition-colors"
              >
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <div className="overflow-hidden">
                  <div className="font-medium text-zinc-800 truncate">MSDS Safety Sheet</div>
                  <div className="text-[10px] text-zinc-500">Chemical / Hazmat Spec</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() =>
                  handlePresetSelect(
                    `Mill_Test_Cert_Batch_${itemIndex + 1}.pdf`,
                    '1.2 MB'
                  )
                }
                className="p-2 rounded-lg border border-zinc-200 hover:border-blue-400 bg-zinc-50 hover:bg-blue-50/50 text-left flex items-center gap-2 transition-colors"
              >
                <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                <div className="overflow-hidden">
                  <div className="font-medium text-zinc-800 truncate">Mill / QA Certificate</div>
                  <div className="text-[10px] text-zinc-500">Material Specification</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() =>
                  handlePresetSelect(
                    `Delivery_Order_DO_${itemIndex + 1}.pdf`,
                    '640 KB'
                  )
                }
                className="p-2 rounded-lg border border-zinc-200 hover:border-emerald-400 bg-zinc-50 hover:bg-emerald-50/50 text-left flex items-center gap-2 transition-colors"
              >
                <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <div className="overflow-hidden">
                  <div className="font-medium text-zinc-800 truncate">Supplier DO Slip</div>
                  <div className="text-[10px] text-zinc-500">Commercial Delivery Order</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() =>
                  handlePresetSelect(
                    `Fragile_Handling_Protocol_${itemIndex + 1}.pdf`,
                    '820 KB'
                  )
                }
                className="p-2 rounded-lg border border-zinc-200 hover:border-purple-400 bg-zinc-50 hover:bg-purple-50/50 text-left flex items-center gap-2 transition-colors"
              >
                <Paperclip className="w-4 h-4 text-purple-600 shrink-0" />
                <div className="overflow-hidden">
                  <div className="font-medium text-zinc-800 truncate">Fragile Handling Guide</div>
                  <div className="text-[10px] text-zinc-500">Delicate / Shockproof Protocol</div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-zinc-200 bg-zinc-50">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <Check className="w-3.5 h-3.5" />
            Apply to Item #{itemIndex + 1}
          </button>
        </div>
      </div>
    </div>
  );
};
