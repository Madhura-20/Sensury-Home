import { Timestamp } from 'firebase/firestore';

export type AppPage =
  | 'landing'
  | 'auth'
  | 'dashboard'
  | 'planner'
  | 'journey'
  | 'materials'
  | 'calculator'
  | 'compare'
  | 'professionals'
  | 'documents'
  | 'tracker'
  | 'assistant'
  | 'profile'
  | 'admin';

export interface UserProfile {
  uid: string;
  displayName: string;
  preferredLanguage: 'en' | 'ta';
  district: string;
  activeProjectId: string;
  savedMaterialIds: string[];
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface UserPrivateInfo {
  uid: string;
  email: string;
  phone: string;
  updatedAt?: Timestamp;
}

export type PlotType = 'DTCP' | 'CMDA' | 'Panchayat' | 'Patta' | 'Other';
export type FloorOption = 'G' | 'G+1' | 'G+2' | 'G+3';
export type ProjectStatus = 'planning' | 'active' | 'completed';

export interface HomeProject {
  id: string;
  ownerId: string;
  projectName: string;
  landLocation: string;
  district: string;
  plotLengthFt: number;
  plotWidthFt: number;
  plotAreaSqFt: number;
  plotType: PlotType;
  totalBudgetInr: number;
  floors: FloorOption;
  bedrooms: number;
  bathrooms: number;
  kitchenType: string;
  parkingType: string;
  houseStyle: string;
  additionalPreferences: string;
  builtUpAreaSqFt: number;
  estimatedCostInr: number;
  planningSummary: string;
  currentStageNumber: number;
  completedStageNumbers: number[];
  status: ProjectStatus;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface ConstructionTask {
  id: string;
  projectId: string;
  ownerId: string;
  stageNumber: number;
  title: string;
  description: string;
  assignedRole: string;
  dueDate: string;
  status: 'pending' | 'in_progress' | 'completed';
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface ProjectExpense {
  id: string;
  projectId: string;
  ownerId: string;
  stageNumber: number;
  category: string;
  title: string;
  vendorName: string;
  amountInr: number;
  paymentMode: string;
  expenseDate: string;
  notes: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface ProgressUpdate {
  id: string;
  projectId: string;
  ownerId: string;
  stageNumber: number;
  title: string;
  notes: string;
  photoDataUrl: string;
  updateDate: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface ProjectDocument {
  id: string;
  projectId: string;
  ownerId: string;
  category: string;
  title: string;
  stageNumber: number;
  status: 'pending' | 'under_review' | 'verified';
  fileName: string;
  fileType: string;
  fileDataUrl: string;
  notes: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface QuotationRequest {
  id: string;
  projectId: string;
  ownerId: string;
  roleCategory: string;
  providerName: string;
  scopeSummary: string;
  budgetRange: string;
  quotedAmountInr: number;
  timelineWeeks: number;
  status: 'requested' | 'received' | 'shortlisted' | 'declined';
  notes: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface AiChatMessage {
  role: 'user' | 'model';
  text: string;
  createdAt: string;
}

export interface AiConversation {
  id: string;
  ownerId: string;
  projectId: string;
  title: string;
  language: 'en' | 'ta' | 'bilingual';
  messages: AiChatMessage[];
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export type SourceAttribution =
  | 'Verified Reference'
  | 'Manufacturer Claim'
  | 'Supplier Provided'
  | 'Sample Reference';

export interface MaterialItem {
  id: string;
  category: string;
  name: string;
  summary: string;
  types: string;
  applications: string;
  qualitySpecs: string;
  indianStandards: string;
  pros: string;
  cons: string;
  brandExamples: string;
  indicativePrice: string;
  priceLocation: string;
  priceDate: string;
  sourceType: SourceAttribution;
  manufacturerNotes: string;
  supplierNotes: string;
  imageUrl?: string;
}

export interface ProductItem {
  id: string;
  category: string;
  brand: string;
  name: string;
  productType: string;
  grade: string;
  specs: string;
  indicativePriceInr: number;
  unit: string;
  priceLocation: string;
  qualityDocsNote: string;
  pros: string;
  cons: string;
  suitableFor: string;
  sourceType: SourceAttribution;
}

export type ProfessionalRole =
  | 'Architect'
  | 'Civil Engineer'
  | 'Structural Engineer'
  | 'Contractor'
  | 'Interior Designer'
  | 'Material Supplier';

export interface DirectoryProfile {
  id: string;
  role: ProfessionalRole;
  name: string;
  district: string;
  specialization: string;
  experienceNote: string;
  verificationLabel: 'Sample Template (Illustrative Only)' | 'Admin Listed';
}

export interface ConstructionStage {
  number: number;
  title: string;
  tamilTitle: string;
  phase: 'Pre-Construction' | 'Substructure & Frame' | 'Masonry & Services' | 'Finishing & Handover';
  simpleSummary: string;
  whatHappens: string[];
  materialsRequired: string[];
  approximateDuration: string;
  professionalSupport: string[];
  tamilNaduNotes: string;
}
