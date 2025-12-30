
export type Sector = 
  | 'Fabricación' 
  | 'Distribución' 
  | 'Servicios' 
  | 'Alimentación' 
  | 'Metal / Siderurgia' 
  | 'Químico / Farmacéutico' 
  | 'Textil' 
  | 'Madera / Mueble' 
  | 'Construcción' 
  | 'Logística / Transporte' 
  | 'Consultoría / Profesional' 
  | 'Retail' 
  | 'Sector Público' 
  | 'Otros';

export type CompanySize = '1-5' | '6-10' | '11-20' | '21-40' | '41-60' | '61-100' | '100+';

export interface BudgetBreakdown {
  concept: string;
  oneTime: number;
  recurring: number;
}

export interface BudgetResults {
  services: BudgetBreakdown[];
  recurring: BudgetBreakdown[];
  totalOneTime: number;
  totalRecurringYearly: number;
}

export interface FormData {
  companyName: string;
  cif: string;
  contactName: string;
  email: string;
  sector: Sector;
  size: CompanySize;
  digitalMaturity: number;
  currentSoftware: string;
  currentAppsUsers: string;
  digitizationContext: string;
  mainPainPoints: string;
  products: {
    erp: boolean;
    crm: boolean;
    gmao: boolean;
    hr: boolean;
    sga: boolean;
    portal: boolean;
    ai: boolean;
    flexygoCustom: boolean;
    sat: boolean;
    docDigitization: boolean;
  };
  details: {
    erp?: { 
      multiCompany: boolean; manufacturing: boolean; financial: boolean; purchase: boolean; sales: boolean;
      stockManagement: boolean; traceability: boolean; accounting: boolean; verifactuSII: boolean;
      taxModels: boolean; costAnalysis: boolean; projectManagement: boolean;
    };
    crm?: { 
      opportunities: boolean; marketing: boolean; service: boolean; mobile: boolean; 
      outlookIntegration: boolean; leadScoring: boolean; salesPipeline: boolean;
    };
    gmao?: { 
      preventive: boolean; corrective: boolean; assetsCount: string; 
      spareParts: boolean; mobileApp: boolean; contractorPortal: boolean;
    };
    sga?: { 
      warehouseCount: number; locationsCount: number; picking: boolean; packing: boolean; 
      rfid: boolean; waves: boolean; crossDocking: boolean; shippingIntegration: boolean;
    };
    sat?: { 
      techniciansCount: number; scheduler: boolean; mobileApp: boolean; 
      digitalSignature: boolean; routes: boolean; contractManagement: boolean;
    };
    docDigitization?: { 
      ocr: boolean; workflow: boolean; cloudStorage: boolean; 
      erpIntegration: boolean; digitalCert: boolean; expenseNotes: boolean;
    };
    hr?: { 
      payroll: boolean; portal: boolean; recruiting: boolean; 
      timeTracking: boolean; performance: boolean; training: boolean;
    };
    portal?: { 
      clients: boolean; suppliers: boolean; ecommerce: boolean; 
      ticketing: boolean; orderTracking: boolean;
    };
    ai?: { 
      forecasting: boolean; automation: boolean; chat: boolean; 
      sentimentAnalysis: boolean; documentExtraction: boolean;
    };
    flexygoCustom?: { description: string; };
  };
  expectations: string;
  customerCharacter: string;
  priority: 'Alta' | 'Media' | 'Baja';
  calculatedBudget?: BudgetResults;
}

export const INITIAL_DATA: FormData = {
  companyName: '',
  cif: '',
  contactName: '',
  email: '',
  sector: 'Fabricación',
  size: '1-5',
  digitalMaturity: 5,
  currentSoftware: '',
  currentAppsUsers: '',
  digitizationContext: '',
  mainPainPoints: '',
  products: {
    erp: false,
    crm: false,
    gmao: false,
    hr: false,
    sga: false,
    portal: false,
    ai: false,
    flexygoCustom: false,
    sat: false,
    docDigitization: false,
  },
  details: {},
  expectations: '',
  customerCharacter: '',
  priority: 'Media'
};
