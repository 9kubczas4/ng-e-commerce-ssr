export interface ComplaintProduct {
  productName: string;
  complaintReason: ComplaintReason;
  description: string;
}

export interface Complaint {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  orderNumber: string;
  products: ComplaintProduct[];
  preferredResolution: PreferredResolution;
}

export type ComplaintReason =
  | 'defective-product'
  | 'wrong-item'
  | 'damaged-shipping'
  | 'missing-parts'
  | 'not-as-described'
  | 'other';

export type PreferredResolution =
  | 'refund'
  | 'replacement'
  | 'repair';

export interface ComplaintFormData extends Complaint {
  submittedAt: Date;
}
