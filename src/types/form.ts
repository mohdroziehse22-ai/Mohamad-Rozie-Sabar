export interface PersonnelItem {
  id: string;
  name: string;
  icNo: string;
  company: string;
  contactNo: string;
}

export interface GoodsAttachment {
  name: string;
  size: string;
  type?: string;
  dataUrl?: string;
}

export interface StatusAuditEntry {
  id: string;
  fromStatus: DeliveryFormData['status'] | null;
  toStatus: DeliveryFormData['status'];
  timestamp: string; // ISO string e.g. 2026-10-05T08:15:00Z
  formattedTime: string; // e.g. "08:15"
  actor?: string; // e.g. "Rashid bin Kamaruddin", "Ir. Clement Wong", "Gate 4 Security"
  notes?: string;
}

export interface GoodsItem {
  id: string;
  description: string;
  quantity: string;
  unit: string;
  remarks: string;
  isHazardous?: boolean;
  isFragile?: boolean;
  attachment?: GoodsAttachment | null;
}

export interface ApprovalSignoff {
  name: string;
  signature: string; // base64 data URL or empty
  dateTime: string;
}

export interface DeliveryFormData {
  id: string;
  referenceNo: string;
  date: string;
  timeIn: string;
  timeOut: string;
  activities: {
    deliveryGoodsIn: boolean;
    loadingGoodsOut: boolean;
    returnGoods: boolean;
  };
  companyContractor: string;
  picName: string;
  picContact: string;

  // Personnel
  personnel: PersonnelItem[];

  // Driver & Vehicle
  driverName: string;
  driverIc: string;
  driverContact: string;
  vehicleReg: string;
  vehicleType: string;
  deliveryTime: string;

  // Goods
  goods: GoodsItem[];

  // Approvals
  requestedBy: ApprovalSignoff;
  areaPic: ApprovalSignoff;
  securityVerification: ApprovalSignoff;

  // Metadata
  status: 'Draft' | 'Submitted' | 'Approved' | 'On-Site' | 'Completed';
  createdAt: string;
  updatedAt: string;
  auditTrail?: StatusAuditEntry[];
}

export const getRecordAuditTrail = (record: DeliveryFormData): StatusAuditEntry[] => {
  if (record.auditTrail && record.auditTrail.length > 0) {
    return record.auditTrail;
  }

  // Synthesize realistic progression milestones up to current status if missing
  const trail: StatusAuditEntry[] = [];
  const baseTime = record.timeIn || '08:00';

  trail.push({
    id: `syn-draft-${record.id}`,
    fromStatus: null,
    toStatus: 'Draft',
    timestamp: record.createdAt || new Date().toISOString(),
    formattedTime: baseTime,
    actor: record.requestedBy?.name || 'Requester',
    notes: 'Entry pass draft created',
  });

  if (record.status !== 'Draft') {
    const subTime = record.requestedBy?.dateTime?.includes('T')
      ? record.requestedBy.dateTime.split('T')[1].slice(0, 5)
      : '08:15';
    trail.push({
      id: `syn-sub-${record.id}`,
      fromStatus: 'Draft',
      toStatus: 'Submitted',
      timestamp: record.requestedBy?.dateTime || record.createdAt || new Date().toISOString(),
      formattedTime: subTime,
      actor: record.requestedBy?.name || 'Applicant Requester',
      notes: 'Entry pass submitted for Area 308 verification',
    });
  }

  if (record.status === 'Approved' || record.status === 'On-Site' || record.status === 'Completed') {
    const appTime = record.areaPic?.dateTime?.includes('T')
      ? record.areaPic.dateTime.split('T')[1].slice(0, 5)
      : '08:30';
    trail.push({
      id: `syn-app-${record.id}`,
      fromStatus: 'Submitted',
      toStatus: 'Approved',
      timestamp: record.areaPic?.dateTime || new Date().toISOString(),
      formattedTime: appTime,
      actor: record.areaPic?.name || 'Area 308 PIC',
      notes: 'Cargo verified, gate pass approved',
    });
  }

  if (record.status === 'On-Site' || record.status === 'Completed') {
    const secTime = record.securityVerification?.dateTime?.includes('T')
      ? record.securityVerification.dateTime.split('T')[1].slice(0, 5)
      : '08:40';
    trail.push({
      id: `syn-site-${record.id}`,
      fromStatus: 'Approved',
      toStatus: 'On-Site',
      timestamp: record.securityVerification?.dateTime || new Date().toISOString(),
      formattedTime: secTime,
      actor: record.securityVerification?.name || 'Gate 4 Security',
      notes: 'Vehicle inspected and admitted on-site',
    });
  }

  if (record.status === 'Completed') {
    trail.push({
      id: `syn-comp-${record.id}`,
      fromStatus: 'On-Site',
      toStatus: 'Completed',
      timestamp: record.updatedAt || new Date().toISOString(),
      formattedTime: record.timeOut || '11:15',
      actor: 'Area Logistics Supervisor',
      notes: 'Unloading complete, vehicle departed site',
    });
  }

  return trail;
};

export const createEmptyFormData = (): DeliveryFormData => {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const timeStr = now.toTimeString().slice(0, 5);
  const refNo = `WA308-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;

  const defaultPersonnel: PersonnelItem[] = Array.from({ length: 10 }, (_, i) => ({
    id: `person-${i + 1}`,
    name: '',
    icNo: '',
    company: '',
    contactNo: '',
  }));

  const defaultGoods: GoodsItem[] = Array.from({ length: 5 }, (_, i) => ({
    id: `goods-${i + 1}`,
    description: '',
    quantity: '',
    unit: '',
    remarks: '',
    isHazardous: false,
    isFragile: false,
    attachment: null,
  }));

  return {
    id: crypto.randomUUID ? crypto.randomUUID() : `form-${Date.now()}`,
    referenceNo: refNo,
    date: dateStr,
    timeIn: timeStr,
    timeOut: '',
    activities: {
      deliveryGoodsIn: true,
      loadingGoodsOut: false,
      returnGoods: false,
    },
    companyContractor: '',
    picName: '',
    picContact: '',
    personnel: defaultPersonnel,
    driverName: '',
    driverIc: '',
    driverContact: '',
    vehicleReg: '',
    vehicleType: 'Lorry / Truck',
    deliveryTime: timeStr,
    goods: defaultGoods,
    requestedBy: {
      name: '',
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
    status: 'Draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    auditTrail: [
      {
        id: `audit-${Date.now()}-init`,
        fromStatus: null,
        toStatus: 'Draft',
        timestamp: new Date().toISOString(),
        formattedTime: timeStr,
        actor: 'Applicant / Requester',
        notes: 'Initial delivery permit draft created',
      },
    ],
  };
};

export const sampleFormData: DeliveryFormData = {
  id: 'sample-entry-308',
  referenceNo: 'WA308-20261005-4821',
  date: '2026-10-05',
  timeIn: '08:30',
  timeOut: '11:15',
  activities: {
    deliveryGoodsIn: true,
    loadingGoodsOut: false,
    returnGoods: false,
  },
  companyContractor: 'Apex Heavy Engineering & Logistics Sdn Bhd',
  picName: 'Rashid bin Kamaruddin',
  picContact: '+60 12-883 9421',
  personnel: [
    { id: 'p1', name: 'Tan Wei Meng', icNo: '910412-10-5541', company: 'Apex Heavy Eng.', contactNo: '+60 17-234 9912' },
    { id: 'p2', name: 'Muhammad Faizal', icNo: '950821-08-6623', company: 'Apex Heavy Eng.', contactNo: '+60 13-912 4001' },
    { id: 'p3', name: 'Suresh Kumar A/L Raja', icNo: '880315-14-5109', company: 'Apex Sub-con', contactNo: '+60 11-482 1198' },
    { id: 'p4', name: 'Lee Kok Seng', icNo: '921104-01-5837', company: 'Apex Heavy Eng.', contactNo: '+60 19-332 7714' },
    { id: 'p5', name: '', icNo: '', company: '', contactNo: '' },
    { id: 'p6', name: '', icNo: '', company: '', contactNo: '' },
    { id: 'p7', name: '', icNo: '', company: '', contactNo: '' },
    { id: 'p8', name: '', icNo: '', company: '', contactNo: '' },
    { id: 'p9', name: '', icNo: '', company: '', contactNo: '' },
    { id: 'p10', name: '', icNo: '', company: '', contactNo: '' },
  ],
  driverName: 'Mohd Hazwan bin Zulkifli',
  driverIc: '870914-11-5033',
  driverContact: '+60 16-778 3029',
  vehicleReg: 'WVR 8824 B',
  vehicleType: '10-Ton Curtain Sider Lorry',
  deliveryTime: '08:45',
  goods: [
    {
      id: 'g1',
      description: 'Structural Steel Beams (Grade S355JR - 6m lengths)',
      quantity: '24',
      unit: 'pcs',
      remarks: 'Heat No. HT-8840 stamped',
      isHazardous: false,
      isFragile: false,
      attachment: { name: 'Mill_Test_Cert_HT8840.pdf', size: '1.2 MB' },
    },
    {
      id: 'g2',
      description: 'M24 High Tensile Galvanized Bolts & Washers',
      quantity: '500',
      unit: 'sets',
      remarks: 'Batch QA Cert attached',
      isHazardous: false,
      isFragile: false,
      attachment: { name: 'Batch_QA_Inspection.pdf', size: '480 KB' },
    },
    {
      id: 'g3',
      description: 'Fire Barrier Sealant Cartridges 600ml (Solvent-Based)',
      quantity: '48',
      unit: 'tubes',
      remarks: 'Store in cool ventilated safety locker. Class 3 Flammable.',
      isHazardous: true,
      isFragile: false,
      attachment: { name: 'MSDS_Chemical_Safety_Sheet.pdf', size: '2.4 MB' },
    },
    {
      id: 'g4',
      description: 'Precision Digital Pressure Transmitters & Calibrated Glass Gauges',
      quantity: '6',
      unit: 'units',
      remarks: 'Handle with extreme care. Keep upright in shockproof foam casing.',
      isHazardous: false,
      isFragile: true,
      attachment: { name: 'Calibration_Handling_Guide.pdf', size: '850 KB' },
    },
    {
      id: 'g5',
      description: '',
      quantity: '',
      unit: '',
      remarks: '',
      isHazardous: false,
      isFragile: false,
      attachment: null,
    },
  ],
  requestedBy: {
    name: 'Rashid bin Kamaruddin',
    signature: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="160" height="40" viewBox="0 0 160 40"><path d="M10 25 Q 35 5, 55 25 T 90 20 T 130 15 T 150 28" fill="none" stroke="%231e3a8a" stroke-width="2.5" stroke-linecap="round"/></svg>',
    dateTime: '2026-10-05T08:15',
  },
  areaPic: {
    name: 'Ir. Clement Wong (Area 308 Lead)',
    signature: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="160" height="40" viewBox="0 0 160 40"><path d="M15 28 Q 40 8, 65 18 T 110 12 T 145 22" fill="none" stroke="%230f172a" stroke-width="2.5" stroke-linecap="round"/></svg>',
    dateTime: '2026-10-05T08:30',
  },
  securityVerification: {
    name: 'Sgt. Ahmad Firdaus (Gate 4 Security)',
    signature: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="160" height="40" viewBox="0 0 160 40"><path d="M20 20 Q 50 30, 80 15 T 120 26 T 150 18" fill="none" stroke="%230f172a" stroke-width="2.5" stroke-linecap="round"/></svg>',
    dateTime: '2026-10-05T08:35',
  },
  status: 'Approved',
  createdAt: '2026-10-05T08:10:00Z',
  updatedAt: '2026-10-05T08:35:00Z',
  auditTrail: [
    {
      id: 'audit-sample-1',
      fromStatus: null,
      toStatus: 'Draft',
      timestamp: '2026-10-05T08:10:00Z',
      formattedTime: '08:10',
      actor: 'Rashid bin Kamaruddin (Apex Heavy Eng.)',
      notes: 'Delivery permit draft initialized for steel beams and solvent sealant',
    },
    {
      id: 'audit-sample-2',
      fromStatus: 'Draft',
      toStatus: 'Submitted',
      timestamp: '2026-10-05T08:15:00Z',
      formattedTime: '08:15',
      actor: 'Rashid bin Kamaruddin',
      notes: 'Form signed by applicant & submitted for Area 308 verification',
    },
    {
      id: 'audit-sample-3',
      fromStatus: 'Submitted',
      toStatus: 'Approved',
      timestamp: '2026-10-05T08:30:00Z',
      formattedTime: '08:30',
      actor: 'Ir. Clement Wong (Area 308 Lead)',
      notes: 'Permit authorized. Chemical locker space allocated for sealant cartridges.',
    },
  ],
};
