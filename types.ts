export type Sector = 'Fabricación' | 'Distribución' | 'Servicios' | 'Construcción' | 'Retail' | 'Alimentación' | 'Otros';
export type CompanySize = '1-10' | '11-50' | '51-200' | '201-500' | '500+';

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
  currentUsers: number;
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
  };
  details: {
    erp?: { 
      multiCompany: boolean; manufacturing: boolean; financial: boolean; purchase: boolean; sales: boolean;
      stockManagement: boolean; traceability: boolean; serialNumbers: boolean; expirationDates: boolean;
      customsPurchases: boolean; accounting: boolean; taxModels: boolean; verifactuSII: boolean;
    };
    crm?: { 
      commercialManagement: boolean; massMailing: boolean; opportunitiesQuotes: boolean; crmUsers: number;
      emailIntegration: boolean; collectionsManagement: boolean; orderDeliveryGeneration: boolean;
      stockVisibility: boolean; salesVsBudgetComparison: boolean; mobile: boolean;
    };
    gmao?: { preventive: boolean; corrective: boolean; externalAgents: boolean; assetsCount: string; };
    sga?: { warehouseCount: number; locationsCount: number; picking: boolean; packing: boolean; rfid: boolean; waves: boolean; };
    hr?: { payroll: boolean; portal: boolean; training: boolean; recruiting: boolean; };
    portal?: { clients: boolean; suppliers: boolean; ecommerce: boolean; };
    ai?: { forecasting: boolean; automation: boolean; chat: boolean; dataAnalysis: boolean; };
    flexygoCustom?: { description: string; };
  };
  expectations: string;
  budgetRange: string;
  priority: 'Alta' | 'Media' | 'Baja';
  calculatedBudget?: BudgetResults;
}

export const INITIAL_DATA: FormData = {
  companyName: '',
  cif: '',
  contactName: '',
  email: '',
  sector: 'Fabricación',
  size: '1-10',
  digitalMaturity: 5,
  currentSoftware: '',
  currentUsers: 0,
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
  },
  details: {},
  expectations: '',
  budgetRange: '',
  priority: 'Media'
};