import React from 'react';
import { DeliveryFormData, PersonnelItem, GoodsItem } from '../types/form';
import {
  Plus,
  Trash2,
  PenTool,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Flame,
  Wine,
  Info,
  Paperclip,
  FileCheck,
  X,
  ShieldAlert,
} from 'lucide-react';

interface OfficialFormViewProps {
  formData: DeliveryFormData;
  onChange: (updated: DeliveryFormData) => void;
  onOpenSignature: (target: 'requestedBy' | 'areaPic' | 'securityVerification') => void;
  onOpenAttachment?: (goodsIndex: number) => void;
}

export const OfficialFormView: React.FC<OfficialFormViewProps> = ({
  formData,
  onChange,
  onOpenSignature,
  onOpenAttachment,
}) => {
  const updateField = <K extends keyof DeliveryFormData>(key: K, value: DeliveryFormData[K]) => {
    onChange({
      ...formData,
      [key]: value,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleActivityChange = (key: keyof DeliveryFormData['activities']) => {
    onChange({
      ...formData,
      activities: {
        ...formData.activities,
        [key]: !formData.activities[key],
      },
      updatedAt: new Date().toISOString(),
    });
  };

  const updatePersonnel = (index: number, field: keyof PersonnelItem, value: string) => {
    const updated = [...formData.personnel];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    updateField('personnel', updated);
  };

  const addPersonnelRow = () => {
    const newRow: PersonnelItem = {
      id: `person-${formData.personnel.length + 1}`,
      name: '',
      icNo: '',
      company: formData.companyContractor || '',
      contactNo: '',
    };
    updateField('personnel', [...formData.personnel, newRow]);
  };

  const removePersonnelRow = (index: number) => {
    if (formData.personnel.length <= 1) return;
    const updated = formData.personnel.filter((_, i) => i !== index);
    updateField('personnel', updated);
  };

  const updateGoods = (index: number, field: keyof GoodsItem, value: any) => {
    const updated = [...formData.goods];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    updateField('goods', updated);
  };

  const toggleGoodsHazardous = (index: number) => {
    const current = formData.goods[index]?.isHazardous;
    updateGoods(index, 'isHazardous', !current);
  };

  const toggleGoodsFragile = (index: number) => {
    const current = formData.goods[index]?.isFragile;
    updateGoods(index, 'isFragile', !current);
  };

  const removeGoodsAttachment = (index: number) => {
    updateGoods(index, 'attachment', null);
  };

  const addGoodsRow = () => {
    const newRow: GoodsItem = {
      id: `goods-${formData.goods.length + 1}`,
      description: '',
      quantity: '',
      unit: '',
      remarks: '',
      isHazardous: false,
      isFragile: false,
      attachment: null,
    };
    updateField('goods', [...formData.goods, newRow]);
  };

  const removeGoodsRow = (index: number) => {
    if (formData.goods.length <= 1) return;
    const updated = formData.goods.filter((_, i) => i !== index);
    updateField('goods', updated);
  };

  const setTimeNow = (field: 'timeIn' | 'timeOut' | 'deliveryTime') => {
    const now = new Date();
    const timeStr = now.toTimeString().slice(0, 5);
    updateField(field, timeStr);
  };

  const hazardousCount = formData.goods.filter((g) => g.isHazardous).length;
  const fragileCount = formData.goods.filter((g) => g.isFragile).length;
  const attachmentCount = formData.goods.filter((g) => g.attachment).length;

  return (
    <div className="official-form-root w-full max-w-[840px] mx-auto bg-white text-black p-4 sm:p-8 border-2 border-black font-sans leading-snug print:border-none print:p-0 print:max-w-none print:w-full print:m-0 shadow-lg print:shadow-none transition-all">
      {/* Reference & Status Bar (Visible on Screen & Print) */}
      <div className="flex flex-wrap items-center justify-between border-b border-black pb-2 mb-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold tracking-wider">ENTRY PERMIT REF:</span>
          <span className="font-mono font-semibold bg-zinc-100 print:bg-transparent px-1.5 py-0.5 border border-zinc-300 print:border-none">
            {formData.referenceNo}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-zinc-600 print:text-black">
            Doc ID: <strong>WA308-SOP-F02</strong> (Rev. 3)
          </span>
          <span className="inline-flex items-center gap-1 font-bold text-xs uppercase px-2 py-0.5 rounded-sm border border-black bg-zinc-100 print:border print:bg-transparent">
            {formData.status}
          </span>
        </div>
      </div>

      {/* Header Section */}
      <div className="text-center border-b-2 border-black pb-3 mb-4">
        <h1 className="m-0 text-xl sm:text-2xl font-black uppercase tracking-wide">
          Delivery / Loading Entry Form
        </h1>
        <h2 className="m-0 mt-1 text-base sm:text-lg font-bold uppercase tracking-wider text-zinc-900">
          Working Area 308
        </h2>
        <div className="text-[11px] sm:text-xs mt-2 italic text-zinc-700 print:text-black max-w-xl mx-auto">
          <strong>Requirement:</strong> For any goods/materials to be delivered, loaded, collected or removed from Working Area 308, this form must be completed before entry/loading activity.
        </div>
      </div>

      {/* 1. Delivery / Loading Information */}
      <div className="section-title bg-[#f2f2f2] font-bold text-xs sm:text-sm px-2 py-1 border border-black uppercase mt-3 mb-2 flex items-center justify-between">
        <span>1. Delivery / Loading Information</span>
        <span className="text-[10px] font-normal normal-case text-zinc-600 print:hidden">Section 1 of 5</span>
      </div>

      <div className="space-y-2 mb-4 text-xs sm:text-sm">
        {/* Date, Time In, Time Out */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="flex items-baseline">
            <label className="font-bold whitespace-nowrap mr-2">Date:</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => updateField('date', e.target.value)}
              className="border-b border-black outline-hidden px-1 py-0.5 text-xs sm:text-sm flex-1 bg-transparent"
            />
          </div>
          <div className="flex items-baseline relative">
            <label className="font-bold whitespace-nowrap mr-2">Time In:</label>
            <input
              type="time"
              value={formData.timeIn}
              onChange={(e) => updateField('timeIn', e.target.value)}
              className="border-b border-black outline-hidden px-1 py-0.5 text-xs sm:text-sm flex-1 bg-transparent"
            />
            <button
              type="button"
              onClick={() => setTimeNow('timeIn')}
              title="Set to Current Time"
              className="print:hidden text-[10px] text-blue-700 hover:underline ml-1 cursor-pointer"
            >
              Now
            </button>
          </div>
          <div className="flex items-baseline relative">
            <label className="font-bold whitespace-nowrap mr-2">Time Out:</label>
            <input
              type="time"
              value={formData.timeOut}
              onChange={(e) => updateField('timeOut', e.target.value)}
              className="border-b border-black outline-hidden px-1 py-0.5 text-xs sm:text-sm flex-1 bg-transparent"
            />
            <button
              type="button"
              onClick={() => setTimeNow('timeOut')}
              title="Set to Current Time"
              className="print:hidden text-[10px] text-blue-700 hover:underline ml-1 cursor-pointer"
            >
              Now
            </button>
          </div>
        </div>

        {/* Activity Checkboxes */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="font-bold mr-2">Activity:</span>
          <div className="flex flex-wrap gap-4 sm:gap-6 items-center">
            <label className="inline-flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.activities.deliveryGoodsIn}
                onChange={() => handleActivityChange('deliveryGoodsIn')}
                className="w-4 h-4 cursor-pointer accent-black print:accent-black"
              />
              <span className="text-xs sm:text-sm">Delivery / Goods IN</span>
            </label>
            <label className="inline-flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.activities.loadingGoodsOut}
                onChange={() => handleActivityChange('loadingGoodsOut')}
                className="w-4 h-4 cursor-pointer accent-black print:accent-black"
              />
              <span className="text-xs sm:text-sm">Loading / Collection Goods OUT</span>
            </label>
            <label className="inline-flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.activities.returnGoods}
                onChange={() => handleActivityChange('returnGoods')}
                className="w-4 h-4 cursor-pointer accent-black print:accent-black"
              />
              <span className="text-xs sm:text-sm">Return</span>
            </label>
          </div>
        </div>

        {/* Company / Contractor */}
        <div className="flex items-baseline pt-1">
          <label className="font-bold whitespace-nowrap mr-2">Company / Contractor:</label>
          <input
            type="text"
            value={formData.companyContractor}
            onChange={(e) => updateField('companyContractor', e.target.value)}
            placeholder="e.g. Apex Heavy Engineering & Logistics"
            className="border-b border-black outline-hidden px-1 py-0.5 text-xs sm:text-sm flex-1 bg-transparent"
          />
        </div>

        {/* PIC Name & Contact */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="flex items-baseline">
            <label className="font-bold whitespace-nowrap mr-2">Person in Charge (PIC):</label>
            <input
              type="text"
              value={formData.picName}
              onChange={(e) => updateField('picName', e.target.value)}
              placeholder="Full name of site representative"
              className="border-b border-black outline-hidden px-1 py-0.5 text-xs sm:text-sm flex-1 bg-transparent"
            />
          </div>
          <div className="flex items-baseline">
            <label className="font-bold whitespace-nowrap mr-2">PIC Contact No.:</label>
            <input
              type="tel"
              value={formData.picContact}
              onChange={(e) => updateField('picContact', e.target.value)}
              placeholder="e.g. +60 12-345 6789"
              className="border-b border-black outline-hidden px-1 py-0.5 text-xs sm:text-sm flex-1 bg-transparent"
            />
          </div>
        </div>
      </div>

      {/* 2. Personnel Details */}
      <div className="section-title bg-[#f2f2f2] font-bold text-xs sm:text-sm px-2 py-1 border border-black uppercase mt-4 mb-2 flex items-center justify-between">
        <span>2. Personnel Details - Please Fill Name & Passport/IC No.</span>
        <div className="print:hidden flex items-center gap-2">
          <button
            type="button"
            onClick={addPersonnelRow}
            className="text-[11px] font-medium text-blue-700 hover:text-blue-900 flex items-center gap-0.5 bg-white border border-blue-200 px-2 py-0.5 rounded-xs"
          >
            <Plus className="w-3 h-3" /> Add Row
          </button>
        </div>
      </div>

      <div className="overflow-x-auto mb-4">
        <table className="w-full border-collapse border border-black text-xs">
          <thead>
            <tr className="bg-[#f2f2f2]">
              <th className="border border-black p-1 text-center w-[5%]">No.</th>
              <th className="border border-black p-1 text-left w-[30%]">Name</th>
              <th className="border border-black p-1 text-left w-[25%]">Passport / IC No.</th>
              <th className="border border-black p-1 text-left w-[22%]">Company</th>
              <th className="border border-black p-1 text-left w-[18%]">Contact No.</th>
              <th className="border border-black p-1 text-center w-[40px] print:hidden">Act</th>
            </tr>
          </thead>
          <tbody>
            {formData.personnel.map((person, idx) => (
              <tr key={person.id} className="hover:bg-zinc-50 print:hover:bg-transparent">
                <td className="border border-black p-1 text-center font-medium bg-zinc-50 print:bg-transparent">
                  {idx + 1}
                </td>
                <td className="border border-black p-0.5">
                  <input
                    type="text"
                    value={person.name}
                    onChange={(e) => updatePersonnel(idx, 'name', e.target.value)}
                    placeholder={idx === 0 ? 'Worker / supervisor name' : ''}
                    className="w-full border-none outline-hidden px-1.5 py-0.5 text-xs bg-transparent"
                  />
                </td>
                <td className="border border-black p-0.5">
                  <input
                    type="text"
                    value={person.icNo}
                    onChange={(e) => updatePersonnel(idx, 'icNo', e.target.value)}
                    placeholder={idx === 0 ? 'e.g. 900101-14-1234' : ''}
                    className="w-full border-none outline-hidden px-1.5 py-0.5 text-xs bg-transparent"
                  />
                </td>
                <td className="border border-black p-0.5">
                  <input
                    type="text"
                    value={person.company}
                    onChange={(e) => updatePersonnel(idx, 'company', e.target.value)}
                    placeholder={idx === 0 ? 'Company' : ''}
                    className="w-full border-none outline-hidden px-1.5 py-0.5 text-xs bg-transparent"
                  />
                </td>
                <td className="border border-black p-0.5">
                  <input
                    type="text"
                    value={person.contactNo}
                    onChange={(e) => updatePersonnel(idx, 'contactNo', e.target.value)}
                    placeholder={idx === 0 ? 'Phone' : ''}
                    className="w-full border-none outline-hidden px-1.5 py-0.5 text-xs bg-transparent"
                  />
                </td>
                <td className="border border-black p-0.5 text-center print:hidden">
                  {formData.personnel.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePersonnelRow(idx)}
                      title="Remove row"
                      className="text-zinc-400 hover:text-red-600 p-0.5"
                    >
                      <Trash2 className="w-3.5 h-3.5 mx-auto" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 3. Driver & Vehicle Details */}
      <div className="section-title bg-[#f2f2f2] font-bold text-xs sm:text-sm px-2 py-1 border border-black uppercase mt-4 mb-2 flex items-center justify-between">
        <span>3. Driver & Vehicle Details</span>
        <span className="text-[10px] font-normal normal-case text-zinc-600 print:hidden">Section 3 of 5</span>
      </div>

      <div className="space-y-2 mb-4 text-xs sm:text-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex items-baseline">
            <label className="font-bold whitespace-nowrap mr-2">Driver Name:</label>
            <input
              type="text"
              value={formData.driverName}
              onChange={(e) => updateField('driverName', e.target.value)}
              placeholder="Full name of driver"
              className="border-b border-black outline-hidden px-1 py-0.5 text-xs sm:text-sm flex-1 bg-transparent"
            />
          </div>
          <div className="flex items-baseline">
            <label className="font-bold whitespace-nowrap mr-2">Passport / IC No.:</label>
            <input
              type="text"
              value={formData.driverIc}
              onChange={(e) => updateField('driverIc', e.target.value)}
              placeholder="e.g. 870914-11-5033"
              className="border-b border-black outline-hidden px-1 py-0.5 text-xs sm:text-sm flex-1 bg-transparent"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex items-baseline">
            <label className="font-bold whitespace-nowrap mr-2">Contact No.:</label>
            <input
              type="tel"
              value={formData.driverContact}
              onChange={(e) => updateField('driverContact', e.target.value)}
              placeholder="Driver mobile number"
              className="border-b border-black outline-hidden px-1 py-0.5 text-xs sm:text-sm flex-1 bg-transparent"
            />
          </div>
          <div className="flex items-baseline">
            <label className="font-bold whitespace-nowrap mr-2">Vehicle Registration No.:</label>
            <input
              type="text"
              value={formData.vehicleReg}
              onChange={(e) => updateField('vehicleReg', e.target.value)}
              placeholder="e.g. WVR 8824 B"
              className="border-b border-black outline-hidden px-1 py-0.5 text-xs sm:text-sm flex-1 bg-transparent font-mono uppercase font-semibold"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex items-baseline">
            <label className="font-bold whitespace-nowrap mr-2">Vehicle Type:</label>
            <input
              type="text"
              value={formData.vehicleType}
              onChange={(e) => updateField('vehicleType', e.target.value)}
              placeholder="e.g. 10-Ton Lorry / Flatbed / Van"
              className="border-b border-black outline-hidden px-1 py-0.5 text-xs sm:text-sm flex-1 bg-transparent"
            />
          </div>
          <div className="flex items-baseline relative">
            <label className="font-bold whitespace-nowrap mr-2">Delivery / Loading Time:</label>
            <input
              type="time"
              value={formData.deliveryTime}
              onChange={(e) => updateField('deliveryTime', e.target.value)}
              className="border-b border-black outline-hidden px-1 py-0.5 text-xs sm:text-sm flex-1 bg-transparent"
            />
            <button
              type="button"
              onClick={() => setTimeNow('deliveryTime')}
              title="Set to Current Time"
              className="print:hidden text-[10px] text-blue-700 hover:underline ml-1 cursor-pointer"
            >
              Now
            </button>
          </div>
        </div>
      </div>

      {/* 4. Goods / Material Details */}
      <div className="section-title bg-[#f2f2f2] font-bold text-xs sm:text-sm px-2 py-1 border border-black uppercase mt-4 mb-2 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span>4. Goods / Material Details</span>
          {/* Highlight badges for Hazardous / Fragile / Attachments */}
          <div className="flex items-center gap-1.5 text-[10px] font-semibold normal-case">
            {hazardousCount > 0 && (
              <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 border border-amber-300 px-1.5 py-0.5 rounded-sm">
                <AlertTriangle className="w-3 h-3 text-amber-600" />
                {hazardousCount} Hazardous
              </span>
            )}
            {fragileCount > 0 && (
              <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-900 border border-blue-300 px-1.5 py-0.5 rounded-sm">
                <Info className="w-3 h-3 text-blue-600" />
                {fragileCount} Fragile
              </span>
            )}
            {attachmentCount > 0 && (
              <span className="inline-flex items-center gap-1 bg-zinc-100 text-zinc-800 border border-zinc-300 px-1.5 py-0.5 rounded-sm">
                <Paperclip className="w-3 h-3 text-zinc-600" />
                {attachmentCount} Attached
              </span>
            )}
          </div>
        </div>

        <div className="print:hidden flex items-center gap-2">
          <button
            type="button"
            onClick={addGoodsRow}
            className="text-[11px] font-medium text-blue-700 hover:text-blue-900 flex items-center gap-0.5 bg-white border border-blue-200 px-2 py-0.5 rounded-xs cursor-pointer"
          >
            <Plus className="w-3 h-3" /> Add Item
          </button>
        </div>
      </div>

      <div className="overflow-x-auto mb-4">
        <table className="w-full border-collapse border border-black text-xs">
          <thead>
            <tr className="bg-[#f2f2f2]">
              <th className="border border-black p-1 text-center w-[4%]">No.</th>
              <th className="border border-black p-1 text-left w-[36%]">Description of Goods / Materials</th>
              <th className="border border-black p-1 text-center w-[18%]">Classification</th>
              <th className="border border-black p-1 text-center w-[9%]">Quantity</th>
              <th className="border border-black p-1 text-center w-[9%]">Unit</th>
              <th className="border border-black p-1 text-left w-[24%]">Remarks</th>
              <th className="border border-black p-1 text-center w-[35px] print:hidden">Act</th>
            </tr>
          </thead>
          <tbody>
            {formData.goods.map((item, idx) => {
              const rowHighlight =
                item.isHazardous && item.isFragile
                  ? 'bg-amber-50/50'
                  : item.isHazardous
                  ? 'bg-amber-50/60'
                  : item.isFragile
                  ? 'bg-blue-50/50'
                  : 'hover:bg-zinc-50';

              return (
                <tr
                  key={item.id}
                  className={`transition-colors print:hover:bg-transparent ${rowHighlight}`}
                >
                  {/* Row Number */}
                  <td className="border border-black p-1 text-center font-medium bg-zinc-50 print:bg-transparent align-top pt-2">
                    <div className="flex flex-col items-center gap-1">
                      <span>{idx + 1}</span>
                      {item.isHazardous && (
                        <span title="Hazardous Material (HAZMAT)">
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                        </span>
                      )}
                      {item.isFragile && (
                        <span title="Fragile - Handle With Care">
                          <Info className="w-3 h-3 text-blue-600" />
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Description Cell with immediate icon cues next to text */}
                  <td className="border border-black p-1 align-top">
                    <div className="flex items-center gap-1.5 w-full">
                      {/* Immediate Visual Cue Icons next to item description */}
                      {item.isHazardous && (
                        <span
                          title="Hazardous Material (HAZMAT)"
                          className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 font-bold text-[10px] shrink-0"
                        >
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 animate-pulse" />
                          <span className="hidden sm:inline">HAZARDOUS</span>
                        </span>
                      )}
                      {item.isFragile && (
                        <span
                          title="Fragile - Handle With Care"
                          className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-blue-100 text-blue-900 border border-blue-300 font-bold text-[10px] shrink-0"
                        >
                          <Info className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span className="hidden sm:inline">FRAGILE</span>
                        </span>
                      )}

                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => updateGoods(idx, 'description', e.target.value)}
                        placeholder={idx === 0 ? 'Description of items / cargo' : ''}
                        className="w-full border-none outline-hidden px-1 py-0.5 text-xs bg-transparent font-medium"
                      />
                    </div>

                    {/* Attachment preview / button */}
                    <div className="mt-1 pt-1 border-t border-zinc-200/80 flex items-center justify-between gap-1 text-[10px]">
                      {item.attachment ? (
                        <div className="inline-flex items-center gap-1 bg-blue-50 border border-blue-200 text-blue-900 px-1.5 py-0.5 rounded-sm">
                          <Paperclip className="w-3 h-3 text-blue-600 shrink-0" />
                          <button
                            type="button"
                            onClick={() => onOpenAttachment?.(idx)}
                            className="font-medium truncate max-w-[130px] hover:underline cursor-pointer"
                            title={`Attached: ${item.attachment.name} (${item.attachment.size})`}
                          >
                            {item.attachment.name}
                          </button>
                          <span className="text-zinc-400 text-[9px]">({item.attachment.size})</span>
                          <button
                            type="button"
                            onClick={() => removeGoodsAttachment(idx)}
                            title="Remove attached file"
                            className="text-zinc-400 hover:text-red-600 p-0.5 cursor-pointer ml-0.5 print:hidden"
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onOpenAttachment?.(idx)}
                          title="Attach MSDS, Mill Test, or Delivery Order document"
                          className="print:hidden inline-flex items-center gap-1 text-zinc-500 hover:text-blue-700 hover:bg-blue-50 px-1.5 py-0.5 rounded border border-dashed border-zinc-300 hover:border-blue-300 transition-colors cursor-pointer"
                        >
                          <Paperclip className="w-3 h-3" />
                          <span>Attach Spec/MSDS</span>
                        </button>
                      )}
                    </div>
                  </td>

                  {/* NEW COLUMN: Two Checkbox Toggles for 'Hazardous' and 'Fragile' */}
                  <td className="border border-black p-1 align-top pt-2">
                    <div className="flex flex-col gap-1.5 justify-center">
                      <label className="inline-flex items-center gap-1.5 cursor-pointer select-none text-[11px] font-medium text-zinc-800 hover:text-amber-800 transition-colors">
                        <input
                          type="checkbox"
                          checked={!!item.isHazardous}
                          onChange={() => toggleGoodsHazardous(idx)}
                          className="w-3.5 h-3.5 rounded border border-zinc-400 accent-amber-600 cursor-pointer"
                        />
                        <span className={item.isHazardous ? 'font-bold text-amber-900' : ''}>
                          Hazardous
                        </span>
                      </label>

                      <label className="inline-flex items-center gap-1.5 cursor-pointer select-none text-[11px] font-medium text-zinc-800 hover:text-blue-800 transition-colors">
                        <input
                          type="checkbox"
                          checked={!!item.isFragile}
                          onChange={() => toggleGoodsFragile(idx)}
                          className="w-3.5 h-3.5 rounded border border-zinc-400 accent-blue-600 cursor-pointer"
                        />
                        <span className={item.isFragile ? 'font-bold text-blue-900' : ''}>
                          Fragile
                        </span>
                      </label>
                    </div>
                  </td>

                  {/* Quantity */}
                  <td className="border border-black p-0.5 align-top pt-2">
                    <input
                      type="text"
                      value={item.quantity}
                      onChange={(e) => updateGoods(idx, 'quantity', e.target.value)}
                      placeholder="Qty"
                      className="w-full border-none outline-hidden px-1 py-0.5 text-xs text-center bg-transparent"
                    />
                  </td>

                  {/* Unit */}
                  <td className="border border-black p-0.5 align-top pt-2">
                    <input
                      type="text"
                      value={item.unit}
                      onChange={(e) => updateGoods(idx, 'unit', e.target.value)}
                      placeholder="pcs/tons"
                      className="w-full border-none outline-hidden px-1 py-0.5 text-xs text-center bg-transparent"
                    />
                  </td>

                  {/* Remarks */}
                  <td className="border border-black p-0.5 align-top pt-2">
                    <input
                      type="text"
                      value={item.remarks}
                      onChange={(e) => updateGoods(idx, 'remarks', e.target.value)}
                      placeholder="Batch/DO/PO/Spec"
                      className="w-full border-none outline-hidden px-1.5 py-0.5 text-xs bg-transparent"
                    />
                  </td>

                  {/* Actions (Delete Row) */}
                  <td className="border border-black p-0.5 text-center print:hidden align-top pt-2">
                    {formData.goods.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeGoodsRow(idx)}
                        title="Remove row"
                        className="text-zinc-400 hover:text-red-600 p-0.5 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5 mx-auto" />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 5. Verification & Approval */}
      <div className="section-title bg-[#f2f2f2] font-bold text-xs sm:text-sm px-2 py-1 border border-black uppercase mt-4 mb-2 flex items-center justify-between">
        <span>5. Verification & Approval</span>
        <span className="text-[10px] font-normal normal-case text-zinc-600 print:hidden">
          Click any signature box to sign digitally
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 mb-4">
        {/* Box 1: Requested By */}
        <div className="border border-black p-2.5 flex flex-col justify-between min-h-[160px] bg-white">
          <div className="font-bold text-center border-b border-black pb-1 mb-2 text-xs uppercase tracking-wide bg-zinc-50 print:bg-transparent py-0.5">
            Requested By
          </div>
          <div className="space-y-1.5 flex-1 flex flex-col justify-between">
            <div className="flex flex-col">
              <label className="text-[10px] font-bold">Name:</label>
              <input
                type="text"
                value={formData.requestedBy.name}
                onChange={(e) =>
                  updateField('requestedBy', {
                    ...formData.requestedBy,
                    name: e.target.value,
                  })
                }
                placeholder="Applicant name"
                className="border-b border-black border-dashed outline-hidden text-xs py-0.5 bg-transparent"
              />
            </div>

            {/* Signature Area */}
            <div className="flex flex-col">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold">Signature:</label>
                <button
                  type="button"
                  onClick={() => onOpenSignature('requestedBy')}
                  className="print:hidden text-[10px] text-blue-700 hover:underline flex items-center gap-0.5 cursor-pointer font-medium"
                >
                  <PenTool className="w-3 h-3" />
                  {formData.requestedBy.signature ? 'Change' : 'Sign'}
                </button>
              </div>
              <div
                onClick={() => onOpenSignature('requestedBy')}
                className="h-11 border-b border-dashed border-black flex items-center justify-center cursor-pointer relative bg-zinc-50/50 print:bg-transparent overflow-hidden group"
              >
                {formData.requestedBy.signature ? (
                  <img
                    src={formData.requestedBy.signature}
                    alt="Signature"
                    className="max-h-10 max-w-full object-contain"
                  />
                ) : (
                  <span className="text-[10px] text-zinc-400 group-hover:text-blue-600 print:hidden flex items-center gap-1">
                    <PenTool className="w-3 h-3" /> Click to sign digitally
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-[10px] font-bold">Date / Time:</label>
              <input
                type="datetime-local"
                value={formData.requestedBy.dateTime}
                onChange={(e) =>
                  updateField('requestedBy', {
                    ...formData.requestedBy,
                    dateTime: e.target.value,
                  })
                }
                className="border-b border-black border-dashed outline-hidden text-[11px] py-0.5 bg-transparent"
              />
            </div>
          </div>
        </div>

        {/* Box 2: Area 308 PIC */}
        <div className="border border-black p-2.5 flex flex-col justify-between min-h-[160px] bg-white">
          <div className="font-bold text-center border-b border-black pb-1 mb-2 text-xs uppercase tracking-wide bg-zinc-50 print:bg-transparent py-0.5">
            Area 308 PIC
          </div>
          <div className="space-y-1.5 flex-1 flex flex-col justify-between">
            <div className="flex flex-col">
              <label className="text-[10px] font-bold">Name:</label>
              <input
                type="text"
                value={formData.areaPic.name}
                onChange={(e) =>
                  updateField('areaPic', {
                    ...formData.areaPic,
                    name: e.target.value,
                  })
                }
                placeholder="Area 308 PIC Name"
                className="border-b border-black border-dashed outline-hidden text-xs py-0.5 bg-transparent"
              />
            </div>

            {/* Signature Area */}
            <div className="flex flex-col">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold">Signature:</label>
                <button
                  type="button"
                  onClick={() => onOpenSignature('areaPic')}
                  className="print:hidden text-[10px] text-blue-700 hover:underline flex items-center gap-0.5 cursor-pointer font-medium"
                >
                  <PenTool className="w-3 h-3" />
                  {formData.areaPic.signature ? 'Change' : 'Sign'}
                </button>
              </div>
              <div
                onClick={() => onOpenSignature('areaPic')}
                className="h-11 border-b border-dashed border-black flex items-center justify-center cursor-pointer relative bg-zinc-50/50 print:bg-transparent overflow-hidden group"
              >
                {formData.areaPic.signature ? (
                  <img
                    src={formData.areaPic.signature}
                    alt="Signature"
                    className="max-h-10 max-w-full object-contain"
                  />
                ) : (
                  <span className="text-[10px] text-zinc-400 group-hover:text-blue-600 print:hidden flex items-center gap-1">
                    <PenTool className="w-3 h-3" /> Click to sign digitally
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-[10px] font-bold">Date / Time:</label>
              <input
                type="datetime-local"
                value={formData.areaPic.dateTime}
                onChange={(e) =>
                  updateField('areaPic', {
                    ...formData.areaPic,
                    dateTime: e.target.value,
                  })
                }
                className="border-b border-black border-dashed outline-hidden text-[11px] py-0.5 bg-transparent"
              />
            </div>
          </div>
        </div>

        {/* Box 3: Security / Site Verification */}
        <div className="border border-black p-2.5 flex flex-col justify-between min-h-[160px] bg-white">
          <div className="font-bold text-center border-b border-black pb-1 mb-2 text-xs uppercase tracking-wide bg-zinc-50 print:bg-transparent py-0.5">
            Security / Site Verification
          </div>
          <div className="space-y-1.5 flex-1 flex flex-col justify-between">
            <div className="flex flex-col">
              <label className="text-[10px] font-bold">Name:</label>
              <input
                type="text"
                value={formData.securityVerification.name}
                onChange={(e) =>
                  updateField('securityVerification', {
                    ...formData.securityVerification,
                    name: e.target.value,
                  })
                }
                placeholder="Gate Security Officer"
                className="border-b border-black border-dashed outline-hidden text-xs py-0.5 bg-transparent"
              />
            </div>

            {/* Signature Area */}
            <div className="flex flex-col">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold">Signature:</label>
                <button
                  type="button"
                  onClick={() => onOpenSignature('securityVerification')}
                  className="print:hidden text-[10px] text-blue-700 hover:underline flex items-center gap-0.5 cursor-pointer font-medium"
                >
                  <PenTool className="w-3 h-3" />
                  {formData.securityVerification.signature ? 'Change' : 'Sign'}
                </button>
              </div>
              <div
                onClick={() => onOpenSignature('securityVerification')}
                className="h-11 border-b border-dashed border-black flex items-center justify-center cursor-pointer relative bg-zinc-50/50 print:bg-transparent overflow-hidden group"
              >
                {formData.securityVerification.signature ? (
                  <img
                    src={formData.securityVerification.signature}
                    alt="Signature"
                    className="max-h-10 max-w-full object-contain"
                  />
                ) : (
                  <span className="text-[10px] text-zinc-400 group-hover:text-blue-600 print:hidden flex items-center gap-1">
                    <PenTool className="w-3 h-3" /> Click to sign digitally
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-[10px] font-bold">Date / Time:</label>
              <input
                type="datetime-local"
                value={formData.securityVerification.dateTime}
                onChange={(e) =>
                  updateField('securityVerification', {
                    ...formData.securityVerification,
                    dateTime: e.target.value,
                  })
                }
                className="border-b border-black border-dashed outline-hidden text-[11px] py-0.5 bg-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer Notice */}
      <div className="text-center font-bold text-xs sm:text-sm border-2 border-black p-2 bg-[#f2f2f2] uppercase tracking-wide mt-5">
        IMPORTANT: NO DELIVERY/LOADING TO WORKING AREA 308 WITHOUT COMPLETING THIS FORM.
      </div>

      {/* Official Signoff Disclaimer / Barcode note for industrial audit */}
      <div className="mt-3 flex items-center justify-between text-[10px] text-zinc-500 print:text-zinc-600 border-t border-zinc-300 pt-1.5">
        <span>Confidential & Proprietary • Facility Safety & Operations Protocol</span>
        <span>Verified for Working Area 308 Access</span>
      </div>
    </div>
  );
};
