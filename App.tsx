
import React, { useState, useEffect } from 'react';
import { FormData, INITIAL_DATA, Sector, CompanySize } from './types';
import { 
  Building2, Users, Rocket, Target, Settings, Package, 
  UserCircle, Globe, BrainCircuit, BarChart3, ChevronRight,
  ChevronLeft, CheckCircle2, Send, Search, History, Trash2, X,
  Euro, Clock, Info, Download, ChevronDown, ChevronUp, Check, 
  Presentation, Eye, Sparkles, Layers, Zap, ArrowUpRight, 
  Lightbulb, Shield, TrendingUp, TrendingDown, Calendar, Layout, ListChecks,
  Receipt, ClipboardCheck, Briefcase, UserSearch, Wrench, FileSearch
} from 'lucide-react';
import { PRODUCT_ICONS, PRODUCT_NAMES } from './constants';
import { generateProposalSummary } from './services/geminiService';
import { calculateBudget } from './services/pricingService';

const BRAND_NAVY = "#001E62";
const BRAND_CYAN = "#00C1F3";

interface SavedSession {
  id: string;
  timestamp: number;
  data: FormData;
  report: string | null;
}

const Logo = ({ white = false, size = "md" }: { white?: boolean, size?: "sm" | "md" | "lg" | "xl" }) => {
  const sizes = { sm: "h-6", md: "h-9", lg: "h-12", xl: "h-16" };
  return (
    <div className={`flex items-center select-none ${sizes[size]}`}>
      <span style={{ color: white ? '#FFFFFF' : BRAND_NAVY }} className="text-4xl font-black tracking-tighter mr-1">ah</span>
      <div className="h-full w-auto">
        <svg viewBox="0 0 100 100" className="h-full w-auto">
          <path d="M 50 15 L 85 50 L 50 85 L 15 50 Z" fill="none" stroke={white ? '#FFFFFF' : BRAND_NAVY} strokeWidth="18" strokeLinejoin="round" />
          <path d="M 15 50 L 50 15 L 85 50" fill="none" stroke={white ? '#FFFFFF' : BRAND_NAVY} strokeWidth="18" strokeLinejoin="round" strokeLinecap="round" />
          <path d="M 15 50 L 50 85 L 85 50" fill="none" stroke={BRAND_CYAN} strokeWidth="18" strokeLinejoin="round" strokeLinecap="round" />
        </svg>
      </div>
      <span style={{ color: white ? '#FFFFFF' : BRAND_NAVY }} className="text-4xl font-black tracking-tighter ml-1">ra</span>
    </div>
  );
};

const CompanyLogo = ({ name, cif, size = "md" }: { name: string, cif: string, size?: "sm" | "md" | "lg" }) => {
  const initials = (name || "??").slice(0, 2).toUpperCase();
  const colors = ["bg-slate-800", "bg-indigo-600", "bg-emerald-600", "bg-amber-600"];
  const bgColor = colors[(cif || "").length % colors.length || 0];
  const sizeClasses = { sm: "w-10 h-10 text-xs", md: "w-20 h-20 text-xl", lg: "w-32 h-32 text-3xl" };
  return (
    <div className={`${sizeClasses[size]} ${bgColor} rounded-2xl flex flex-col items-center justify-center text-white font-black shadow-lg border-4 border-white overflow-hidden`}>
      <span>{initials}</span>
      <span className="text-[8px] opacity-60 font-mono tracking-widest">{cif || "---"}</span>
    </div>
  );
};

const AccordionItem = ({ icon, title, children, isOpen, onToggle }: { icon: React.ReactNode, title: string, children: React.ReactNode, isOpen: boolean, onToggle: () => void }) => {
  return (
    <div className={`border rounded-2xl transition-all duration-300 overflow-hidden ${isOpen ? 'border-cyan-400 bg-white shadow-lg' : 'border-slate-100 bg-slate-50/30'}`}>
      <button onClick={onToggle} className="w-full flex items-center justify-between p-5 text-left focus:outline-none">
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isOpen ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-400'}`}>
            {icon}
          </div>
          <h3 className={`font-bold uppercase tracking-tight ${isOpen ? 'text-slate-900' : 'text-slate-600'}`}>{title}</h3>
        </div>
        {isOpen ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
      </button>
      {isOpen && <div className="p-6 pt-0 animate-in slide-in-from-top-2 duration-300">{children}</div>}
    </div>
  );
};

const App: React.FC = () => {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<FormData>(INITIAL_DATA);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [history, setHistory] = useState<SavedSession[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [reportTab, setReportTab] = useState<'proposal' | 'budget' | 'scope' | 'ai'>('proposal');
  const [activeAccordion, setActiveAccordion] = useState<string | null>(null);

  const totalSteps = 5;

  const nextStep = () => setStep(prev => Math.min(prev + 1, 6));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  useEffect(() => {
    const savedDraft = localStorage.getItem('ahora_discovery_draft');
    const savedStep = localStorage.getItem('ahora_discovery_step');
    const savedHistory = localStorage.getItem('ahora_discovery_history');
    if (savedDraft) setData(JSON.parse(savedDraft));
    if (savedStep) setStep(parseInt(savedStep));
    if (savedHistory) setHistory(JSON.parse(savedHistory));
  }, []);

  useEffect(() => {
    localStorage.setItem('ahora_discovery_draft', JSON.stringify(data));
    localStorage.setItem('ahora_discovery_step', step.toString());
  }, [data, step]);

  const updateData = (updates: Partial<FormData>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  const updateProduct = (product: keyof FormData['products']) => {
    setData(prev => ({
      ...prev,
      products: { ...prev.products, [product]: !prev.products[product] }
    }));
  };

  const updateDetail = (product: keyof FormData['details'], field: string, value: any) => {
    setData(prev => ({
      ...prev,
      details: { ...prev.details, [product]: { ...(prev.details[product] || {}), [field]: value } }
    }));
  };

  const saveToHistory = (customReport: string | null = null) => {
    const newSession: SavedSession = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      data: { ...data },
      report: customReport || aiReport
    };
    const updatedHistory = [newSession, ...history];
    setHistory(updatedHistory);
    localStorage.setItem('ahora_discovery_history', JSON.stringify(updatedHistory));
  };

  const handleFillMockData = () => {
    const mockData: FormData = {
      ...INITIAL_DATA,
      companyName: 'Suministros Industriales Levante S.L.',
      cif: 'B46001234',
      contactName: 'Francisco Vidal',
      sector: 'Distribución',
      size: '21-40',
      digitalMaturity: 4,
      currentSoftware: 'FactuSol y carpetas compartidas',
      currentAppsUsers: 'Oficina: 8, Almacén: 12, Dirección: 3',
      digitizationContext: 'Sin integración entre almacén y ventas. Errores constantes en stock real.',
      mainPainPoints: 'Roturas de stock, falta de control en pedidos de compra y duplicidad de datos.',
      products: { erp: true, crm: true, gmao: false, hr: false, sga: true, portal: true, ai: true, flexygoCustom: false, sat: false, docDigitization: true },
      details: {
        erp: { stockManagement: true, traceability: true, accounting: true, manufacturing: false, sales: true, purchase: true, verifactuSII: true, taxModels: true, costAnalysis: true, projectManagement: false, multiCompany: false, financial: true },
        crm: { opportunities: true, marketing: true, service: false, mobile: true, outlookIntegration: true, leadScoring: false, salesPipeline: true },
        sga: { warehouseCount: 1, locationsCount: 1200, picking: true, packing: true, rfid: false, waves: true, crossDocking: false, shippingIntegration: true },
        docDigitization: { ocr: true, workflow: true, cloudStorage: true, erpIntegration: true, digitalCert: true, expenseNotes: false },
        ai: { forecasting: true, automation: true, chat: false, sentimentAnalysis: false, documentExtraction: true }
      },
      expectations: 'Controlar el 100% de las ubicaciones del almacén y automatizar la recepción de facturas.',
      customerCharacter: 'Enfocado en resultados, busca simplicidad y rapidez de implantación.',
      priority: 'Media'
    };
    setData(mockData);
    setStep(1);
  };

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    const budgetResults = calculateBudget(data);
    const updatedData = { ...data, calculatedBudget: budgetResults };
    setData(updatedData);
    const report = await generateProposalSummary(updatedData);
    setAiReport(report || "Error en la generación.");
    saveToHistory(report);
    setIsGenerating(false);
    setStep(6);
  };

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="min-h-screen flex flex-col items-center py-8 px-4 md:px-8 max-w-6xl mx-auto font-['Inter'] print:p-0 print:bg-white">
      {/* HEADER */}
      <div className="w-full flex flex-col md:flex-row items-center justify-between mb-8 gap-6 border-b border-slate-200 pb-6 print:hidden">
        <div className="flex flex-col items-center md:items-start gap-1">
          <Logo />
          <span className="text-[11px] font-bold uppercase text-slate-400 mt-1 tracking-widest">Consultoría de Transformación Digital</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleFillMockData} className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-all font-bold text-xs border border-emerald-100">
            <Sparkles className="w-4 h-4" /> Caso de Éxito Mock
          </button>
          <button onClick={() => setShowHistory(true)} className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-all font-bold text-xs border border-slate-200">
            <History className="w-4 h-4" /> Sesiones Guardadas
          </button>
        </div>
      </div>

      <main className="w-full bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col min-h-[800px] print:shadow-none print:border-none">
        {step <= 5 && (
          <div className="w-full py-4 px-8 bg-white border-b border-slate-100 print:hidden">
            <div className="flex items-center justify-between max-w-4xl mx-auto relative">
              <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2" />
              <div className="absolute top-1/2 left-0 h-0.5 bg-cyan-500 transition-all duration-500" style={{ width: `${((step - 1) / (totalSteps - 1)) * 100}%` }} />
              {[1, 2, 3, 4, 5].map(s => (
                <div key={s} className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all border-2 ${step === s ? 'bg-white border-cyan-500 text-cyan-600 shadow-lg' : step > s ? 'bg-cyan-500 border-cyan-500 text-white' : 'bg-white border-slate-200 text-slate-400'}`}>
                  {step > s ? <Check className="w-5 h-5" /> : s}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 1: CLIENTE */}
        {step === 1 && (
           <div className="p-10 space-y-8 flex-1 animate-in fade-in slide-in-from-bottom-2">
             <div className="flex items-center gap-4"><Building2 className="w-8 h-8 text-cyan-500" /><div><h2 className="text-3xl font-black text-slate-900 tracking-tight">DATOS DEL PROYECTO</h2><p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Paso 01/05 - Identificación del Cliente</p></div></div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-2"><label className="text-xs font-black uppercase text-slate-500 tracking-wider">Nombre de la Empresa</label><input type="text" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-cyan-400 outline-none transition-all font-medium" value={data.companyName} onChange={e => updateData({ companyName: e.target.value })} /></div>
               <div className="space-y-2"><label className="text-xs font-black uppercase text-slate-500 tracking-wider">CIF Fiscal</label><input type="text" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-cyan-400 outline-none transition-all font-medium uppercase" value={data.cif} onChange={e => updateData({ cif: e.target.value.toUpperCase() })} /></div>
               <div className="space-y-2"><label className="text-xs font-black uppercase text-slate-500 tracking-wider">Persona de Contacto</label><input type="text" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-cyan-400 outline-none transition-all font-medium" value={data.contactName} onChange={e => updateData({ contactName: e.target.value })} /></div>
               <div className="space-y-2"><label className="text-xs font-black uppercase text-slate-500 tracking-wider">Sector de Actividad</label>
                <select className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none" value={data.sector} onChange={e => updateData({ sector: e.target.value as Sector })}>
                  {['Fabricación', 'Distribución', 'Servicios', 'Alimentación', 'Metal / Siderurgia', 'Logística / Transporte', 'Otros'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
               </div>
               <div className="col-span-full space-y-3">
                <label className="text-xs font-black uppercase text-slate-500 tracking-wider">Número de Empleados</label>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                  {['1-5', '6-10', '11-20', '21-40', '41-60', '61-100', '100+'].map(size => (
                    <button key={size} onClick={() => updateData({ size: size as CompanySize })} className={`px-2 py-4 rounded-xl text-xs font-bold border transition-all ${data.size === size ? 'bg-slate-800 text-white border-slate-800 shadow-md' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}>{size}</button>
                  ))}
                </div>
               </div>
             </div>
           </div>
        )}

        {/* STEP 2: DIAGNÓSTICO */}
        {step === 2 && (
          <div className="p-10 space-y-8 flex-1 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center gap-4"><BarChart3 className="w-8 h-8 text-cyan-500" /><div><h2 className="text-3xl font-black text-slate-900 tracking-tight">SITUACIÓN ACTUAL</h2><p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Paso 02/05 - Estado de Digitalización</p></div></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2"><label className="text-xs font-black uppercase text-slate-500 tracking-wider">Software actual (ERP, CRM, etc.)</label><input type="text" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none" value={data.currentSoftware} onChange={e => updateData({ currentSoftware: e.target.value })} /></div>
              <div className="space-y-2"><label className="text-xs font-black uppercase text-slate-500 tracking-wider">Usuarios por aplicación</label><input type="text" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none" value={data.currentAppsUsers} onChange={e => updateData({ currentAppsUsers: e.target.value })} /></div>
            </div>
            <div className="space-y-2"><label className="text-xs font-black uppercase text-slate-500 tracking-wider">Puntos Críticos de Dolor (Pain Points)</label><textarea className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none h-40" value={data.mainPainPoints} onChange={e => updateData({ mainPainPoints: e.target.value })} placeholder="Ej: No conocemos el stock real, las facturas se introducen a mano..." /></div>
          </div>
        )}

        {/* STEP 3: PRODUCTOS */}
        {step === 3 && (
          <div className="p-10 space-y-8 flex-1 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center gap-4"><Package className="w-8 h-8 text-cyan-500" /><div><h2 className="text-3xl font-black text-slate-900 tracking-tight">SOLUCIONES AHORA</h2><p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Paso 03/05 - Ecosistema a Implantar</p></div></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(Object.keys(PRODUCT_NAMES) as Array<keyof typeof PRODUCT_NAMES>).map(key => (
                <button key={key} onClick={() => updateProduct(key)} className={`p-6 rounded-3xl border-2 transition-all text-left flex items-start gap-4 ${data.products[key] ? 'border-cyan-500 bg-cyan-50/30' : 'border-slate-100 hover:border-slate-200'}`}>
                  <div className={`p-3 rounded-2xl ${data.products[key] ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-200' : 'bg-slate-100 text-slate-400'}`}>{PRODUCT_ICONS[key]}</div>
                  <div className="flex-1"><span className="text-sm font-bold block mb-1">{PRODUCT_NAMES[key]}</span><span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Suite AHORA 5</span></div>
                  {data.products[key] && <CheckCircle2 className="w-5 h-5 text-cyan-500" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 4: ALCANCE OPERATIVO DETALLADO (ESPAÑOL ESPAÑA) */}
        {step === 4 && (
          <div className="p-10 space-y-8 flex-1 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center gap-4"><Search className="w-8 h-8 text-cyan-500" /><div><h2 className="text-3xl font-black text-slate-900 tracking-tight">ALCANCE OPERATIVO</h2><p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Paso 04/05 - Definición Funcional de Requerimientos</p></div></div>
            <div className="space-y-4">
              {Object.entries(data.products).filter(([_, active]) => active).map(([key]) => (
                <AccordionItem key={key} icon={PRODUCT_ICONS[key as keyof typeof PRODUCT_ICONS]} title={PRODUCT_NAMES[key as keyof typeof PRODUCT_NAMES]} isOpen={activeAccordion === key} onToggle={() => setActiveAccordion(activeAccordion === key ? null : key)}>
                  
                  {/* ERP */}
                  {key === 'erp' && <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                    {[
                      { id: 'stockManagement', label: 'Gestión de Stock' }, { id: 'traceability', label: 'Trazabilidad (Lotes/Series)' },
                      { id: 'accounting', label: 'Contabilidad Integrada' }, { id: 'manufacturing', label: 'Planificación Producción (MRP)' },
                      { id: 'sales', label: 'Ciclo de Ventas' }, { id: 'purchase', label: 'Ciclo de Compras' },
                      { id: 'verifactuSII', label: 'Verifactu y SII' }, { id: 'taxModels', label: 'Modelos de Hacienda' },
                      { id: 'costAnalysis', label: 'Análisis de Costes' }, { id: 'projectManagement', label: 'Gestión de Proyectos' }
                    ].map(f => (
                      <label key={f.id} className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl cursor-pointer hover:bg-white border-2 border-transparent hover:border-cyan-100 transition-all">
                        <input type="checkbox" className="w-5 h-5 accent-cyan-500" checked={(data.details.erp as any)?.[f.id] || false} onChange={e => updateDetail('erp', f.id, e.target.checked)} />
                        <span className="text-xs font-bold uppercase text-slate-600">{f.label}</span>
                      </label>
                    ))}
                  </div>}

                  {/* CRM */}
                  {key === 'crm' && <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                    {[
                      { id: 'opportunities', label: 'Gestión de Oportunidades' }, { id: 'salesPipeline', label: 'Pipeline de Ventas' },
                      { id: 'marketing', label: 'Campañas Marketing' }, { id: 'service', label: 'Post-Venta / Incidencias' },
                      { id: 'outlookIntegration', label: 'Integración Outlook' }, { id: 'leadScoring', label: 'Lead Scoring Automático' },
                      { id: 'mobile', label: 'Acceso Movilidad' }
                    ].map(f => (
                      <label key={f.id} className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl cursor-pointer hover:bg-white border-2 border-transparent hover:border-cyan-100 transition-all">
                        <input type="checkbox" className="w-5 h-5 accent-cyan-500" checked={(data.details.crm as any)?.[f.id] || false} onChange={e => updateDetail('crm', f.id, e.target.checked)} />
                        <span className="text-xs font-bold uppercase text-slate-600">{f.label}</span>
                      </label>
                    ))}
                  </div>}

                  {/* SGA */}
                  {key === 'sga' && <div className="space-y-6 pt-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400">Nº de Almacenes Físicos</label><input type="number" className="w-full p-4 border-2 rounded-2xl" value={data.details.sga?.warehouseCount || ''} onChange={e => updateDetail('sga', 'warehouseCount', parseInt(e.target.value))} /></div>
                      <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400">Nº de Ubicaciones</label><input type="number" className="w-full p-4 border-2 rounded-2xl" value={data.details.sga?.locationsCount || ''} onChange={e => updateDetail('sga', 'locationsCount', parseInt(e.target.value))} /></div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { id: 'picking', label: 'Picking Optimizado' }, { id: 'packing', label: 'Packing y Expedición' },
                        { id: 'rfid', label: 'Control RFID' }, { id: 'waves', label: 'Preparación por Oleadas' },
                        { id: 'crossDocking', label: 'Cross-Docking' }, { id: 'shippingIntegration', label: 'Integración Agencias' }
                      ].map(f => (
                        <label key={f.id} className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl cursor-pointer hover:bg-white border-2 border-transparent hover:border-cyan-100 transition-all">
                          <input type="checkbox" className="w-5 h-5 accent-cyan-500" checked={(data.details.sga as any)?.[f.id] || false} onChange={e => updateDetail('sga', f.id, e.target.checked)} />
                          <span className="text-[10px] font-bold uppercase text-slate-600">{f.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>}

                  {/* GMAO */}
                  {key === 'gmao' && <div className="space-y-6 pt-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {[
                        { id: 'preventive', label: 'Planes Mantenimiento Preventivo' }, { id: 'corrective', label: 'Gestión de Correctivos' },
                        { id: 'spareParts', label: 'Gestión de Recambios' }, { id: 'mobileApp', label: 'App para Técnicos en Planta' },
                        { id: 'contractorPortal', label: 'Portal Contratistas Externos' }
                      ].map(f => (
                        <label key={f.id} className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl cursor-pointer hover:bg-white border-2 border-transparent hover:border-cyan-100 transition-all">
                          <input type="checkbox" className="w-5 h-5 accent-cyan-500" checked={(data.details.gmao as any)?.[f.id] || false} onChange={e => updateDetail('gmao', f.id, e.target.checked)} />
                          <span className="text-xs font-bold uppercase text-slate-600">{f.label}</span>
                        </label>
                      ))}
                    </div>
                    <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400">Total Activos a Mantener (Estimado)</label><input type="text" className="w-full p-4 border-2 rounded-2xl" value={data.details.gmao?.assetsCount || ''} onChange={e => updateDetail('gmao', 'assetsCount', e.target.value)} placeholder="Ej: 50 máquinas, 3 naves..." /></div>
                  </div>}

                  {/* HR */}
                  {key === 'hr' && <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                    {[
                      { id: 'payroll', label: 'Gestión de Nóminas' }, { id: 'portal', label: 'Portal del Empleado' },
                      { id: 'recruiting', label: 'Selección / Reclutamiento' }, { id: 'timeTracking', label: 'Control Horario / Fichaje' },
                      { id: 'performance', label: 'Evaluación de Desempeño' }, { id: 'training', label: 'Gestión de Formación' }
                    ].map(f => (
                      <label key={f.id} className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl cursor-pointer hover:bg-white border-2 border-transparent hover:border-cyan-100 transition-all">
                        <input type="checkbox" className="w-5 h-5 accent-cyan-500" checked={(data.details.hr as any)?.[f.id] || false} onChange={e => updateDetail('hr', f.id, e.target.checked)} />
                        <span className="text-xs font-bold uppercase text-slate-600">{f.label}</span>
                      </label>
                    ))}
                  </div>}

                  {/* DIGITALIZACIÓN */}
                  {key === 'docDigitization' && <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                    {[
                      { id: 'ocr', label: 'OCR Facturas Proveedor' }, { id: 'workflow', label: 'Workflows de Aprobación' },
                      { id: 'cloudStorage', label: 'Custodia Documental Cloud' }, { id: 'erpIntegration', label: 'Contabilización Automática' },
                      { id: 'digitalCert', label: 'Firma / Certificado Digital' }, { id: 'expenseNotes', label: 'Gestión de Notas de Gasto' }
                    ].map(f => (
                      <label key={f.id} className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl cursor-pointer hover:bg-white border-2 border-transparent hover:border-cyan-100 transition-all">
                        <input type="checkbox" className="w-5 h-5 accent-cyan-500" checked={(data.details.docDigitization as any)?.[f.id] || false} onChange={e => updateDetail('docDigitization', f.id, e.target.checked)} />
                        <span className="text-xs font-bold uppercase text-slate-600">{f.label}</span>
                      </label>
                    ))}
                  </div>}

                  {/* IA */}
                  {key === 'ai' && <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                    {[
                      { id: 'forecasting', label: 'Predicción de Demanda' }, { id: 'automation', label: 'Automatización Administrativa' },
                      { id: 'chat', label: 'Chatbot Interno Copilot' }, { id: 'sentimentAnalysis', label: 'Análisis de Sentimiento Cliente' },
                      { id: 'documentExtraction', label: 'Extracción Inteligente Docs' }
                    ].map(f => (
                      <label key={f.id} className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl cursor-pointer hover:bg-white border-2 border-transparent hover:border-cyan-100 transition-all">
                        <input type="checkbox" className="w-5 h-5 accent-cyan-500" checked={(data.details.ai as any)?.[f.id] || false} onChange={e => updateDetail('ai', f.id, e.target.checked)} />
                        <span className="text-xs font-bold uppercase text-slate-600">{f.label}</span>
                      </label>
                    ))}
                  </div>}

                  {key === 'flexygoCustom' && <textarea className="w-full p-4 bg-slate-50 border-2 rounded-2xl h-40 mt-2 font-medium" value={data.details.flexygoCustom?.description || ''} onChange={e => updateDetail('flexygoCustom', 'description', e.target.value)} placeholder="Describe el proyecto a medida (ej: App para fuerza comercial, integración con maquinaria IoT...)" />}
                </AccordionItem>
              ))}
            </div>
          </div>
        )}

        {/* STEP 5: EXPECTATIVAS */}
        {step === 5 && (
          <div className="p-10 space-y-8 flex-1 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center gap-4"><Target className="w-8 h-8 text-cyan-500" /><div><h2 className="text-3xl font-black text-slate-900 tracking-tight">EXPECTATIVAS FINALES</h2><p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Paso 05/05 - Cierre de Consultoría</p></div></div>
            <div className="space-y-2"><label className="text-xs font-black uppercase text-slate-500 tracking-wider">¿Qué éxito espera conseguir el cliente con este cambio?</label><textarea className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none h-40 font-medium" value={data.expectations} onChange={e => updateData({ expectations: e.target.value })} placeholder="Ej: Tener control real de costes de fabricación..." /></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2"><label className="text-xs font-black uppercase text-slate-500 tracking-wider">Carácter del Interlocutor</label><input type="text" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-medium" value={data.customerCharacter} onChange={e => updateData({ customerCharacter: e.target.value })} placeholder="Ej: Analítico, Pragmático, Escéptico..." /></div>
              <div className="space-y-2"><label className="text-xs font-black uppercase text-slate-500 tracking-wider">Nivel de Prioridad Comercial</label>
                <select className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-bold" value={data.priority} onChange={e => updateData({ priority: e.target.value as any })}>
                  <option value="Alta">Urgencia ALTA (Desea empezar ya)</option>
                  <option value="Media">Media (Evaluando opciones)</option>
                  <option value="Baja">Baja (Solo información)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 6: INFORME MULTI-TAB (PROPUESTA, PRESUPUESTO, ALCANCE, IA) */}
        {step === 6 && (
          <div className="flex-1 flex flex-col animate-in zoom-in-95 duration-700 bg-slate-50/50">
            {/* Header del Informe */}
            <header className="p-8 bg-slate-900 text-white flex flex-col md:flex-row items-center justify-between gap-6 print:bg-white print:text-slate-900 print:p-0 print:border-b-4 print:border-cyan-500">
              <div className="flex items-center gap-6">
                <CompanyLogo name={data.companyName} cif={data.cif} size="lg" />
                <div className="h-12 w-px bg-white/10 hidden md:block" />
                <div>
                  <h2 className="text-3xl lg:text-4xl font-black tracking-tighter uppercase leading-none mb-1">Diagnóstico <br/><span className="text-cyan-400 print:text-cyan-600">Estratégico 2026</span></h2>
                  <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">Consultoría de Negocio • AHORA Sistemas de Gestión</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 print:hidden">
                <button onClick={() => setReportTab('proposal')} className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 border ${reportTab === 'proposal' ? 'bg-cyan-500 border-cyan-500 text-white' : 'bg-transparent text-slate-400 border-slate-700 hover:text-white'}`}><Presentation className="w-4 h-4" /> Propuesta</button>
                <button onClick={() => setReportTab('budget')} className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 border ${reportTab === 'budget' ? 'bg-cyan-500 border-cyan-500 text-white' : 'bg-transparent text-slate-400 border-slate-700 hover:text-white'}`}><Receipt className="w-4 h-4" /> Presupuesto</button>
                <button onClick={() => setReportTab('scope')} className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 border ${reportTab === 'scope' ? 'bg-cyan-500 border-cyan-500 text-white' : 'bg-transparent text-slate-400 border-slate-700 hover:text-white'}`}><ListChecks className="w-4 h-4" /> Alcance</button>
                <button onClick={() => setReportTab('ai')} className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 border ${reportTab === 'ai' ? 'bg-cyan-500 border-cyan-500 text-white' : 'bg-transparent text-slate-400 border-slate-700 hover:text-white'}`}><BrainCircuit className="w-4 h-4" /> Diagnóstico IA</button>
                <button onClick={handleExportPDF} className="p-2.5 rounded-full bg-white/10 text-white hover:bg-white/20 ml-2"><Download className="w-5 h-5" /></button>
              </div>
            </header>

            <div className="flex-1 p-6 lg:p-12 space-y-12 overflow-y-auto max-h-[1200px] scrollbar-thin">
              
              {/* VISTA: PROPUESTA ESTRATÉGICA (ESTILO PRESENTACIÓN) */}
              {reportTab === 'proposal' && (
                <div className="max-w-5xl mx-auto space-y-16 pb-20">
                  {/* Slide 1: Resumen Ejecutivo */}
                  <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100 relative">
                      <div className="flex items-center gap-3 mb-6"><TrendingDown className="w-6 h-6 text-slate-400" /><h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Retos Actuales</h3></div>
                      <div className="space-y-6">
                        <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Puntos de Dolor Identificados</p><p className="text-slate-600 leading-relaxed font-bold italic">"{data.mainPainPoints}"</p></div>
                        <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Software Fragmentado</p><p className="font-bold text-slate-800 text-lg">{data.currentSoftware}</p></div>
                      </div>
                    </div>
                    <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100 relative">
                      <div className="flex items-center gap-3 mb-6"><TrendingUp className="w-6 h-6 text-cyan-500" /><h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Impacto del Proyecto</h3></div>
                      <div className="space-y-6">
                        <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Objetivos Estratégicos</p><p className="font-bold text-cyan-600 text-lg leading-tight">{data.expectations}</p></div>
                        <div className="flex gap-4">
                          <div className="flex-1 p-4 bg-slate-50 rounded-2xl border"><p className="text-[9px] font-black uppercase mb-1">Prioridad</p><p className="text-xs font-bold">{data.priority}</p></div>
                          <div className="flex-1 p-4 bg-slate-50 rounded-2xl border"><p className="text-[9px] font-black uppercase mb-1">Usuarios</p><p className="text-xs font-bold">{data.currentAppsUsers || 'Estimación media'}</p></div>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Slide 2: Roadmap Operativo */}
                  <section className="space-y-8">
                    <div className="flex items-center gap-4 px-4"><Calendar className="w-6 h-6 text-cyan-500" /><h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Hoja de Ruta de Implantación</h3></div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {[
                        { step: "01", title: "Análisis & Diseño", desc: "Consultoría de procesos y definición de flujos corporativos.", icon: <Search className="w-5 h-5" /> },
                        { step: "02", title: "Carga & Configuración", desc: "Migración de datos y parametrización técnica de la suite.", icon: <Layers className="w-5 h-5" /> },
                        { step: "03", title: "Go-Live & Formación", desc: "Puesta en marcha asistida y capacitación AHORA Academy.", icon: <Rocket className="w-5 h-5" /> }
                      ].map((item, i) => (
                        <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl flex flex-col gap-4">
                          <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-xs">{item.step}</div>
                          <h4 className="font-black text-slate-900 uppercase text-sm">{item.title}</h4>
                          <p className="text-xs text-slate-500 leading-relaxed font-medium">{item.desc}</p>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Slide 3: Valor AHORA */}
                  <section className="bg-cyan-500 p-12 rounded-[3.5rem] shadow-2xl flex flex-col lg:flex-row items-center gap-12 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-10 opacity-10"><Shield className="w-64 h-64" /></div>
                    <div className="flex-1 space-y-6 relative z-10">
                      <h4 className="text-4xl font-black tracking-tighter uppercase leading-none">Diferenciales de <br/>nuestra propuesta</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                          "Modelo de Mantenimiento Perpetuo: Licencias para toda la vida.",
                          "Fabricante Nacional: Soporte directo y ágil.",
                          "Plataforma Flexygo: Adaptabilidad total Low-Code.",
                          "Visión 360º de Negocio: Todo integrado en una base de datos."
                        ].map((v, i) => (
                          <div key={i} className="flex gap-3 items-start"><CheckCircle2 className="w-5 h-5 shrink-0" /><p className="text-xs font-bold uppercase tracking-tight">{v}</p></div>
                        ))}
                      </div>
                    </div>
                    <div className="p-10 bg-white/15 rounded-[2.5rem] backdrop-blur-md border border-white/20 text-center min-w-[200px] relative z-10">
                      <p className="text-5xl font-black tracking-tighter mb-1">Low</p>
                      <p className="text-[10px] font-black uppercase tracking-widest">Total Cost <br/>of Ownership</p>
                    </div>
                  </section>
                </div>
              )}

              {/* VISTA: PRESUPUESTO DETALLADO */}
              {reportTab === 'budget' && (
                <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-500">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100 flex flex-col justify-between">
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4 block">Inversión en Servicios (Pago Único)</span>
                      <h3 className="text-5xl font-black text-slate-900 tracking-tighter">{data.calculatedBudget?.totalOneTime.toLocaleString()} <span className="text-xl">€</span></h3>
                      <p className="text-xs text-slate-500 mt-6 font-medium">Incluye: Análisis, Implantación técnica, Parametrización y Formación Academy.</p>
                    </div>
                    <div className="bg-slate-900 p-10 rounded-[2.5rem] shadow-xl text-white flex flex-col justify-between">
                      <span className="text-[10px] font-black uppercase text-cyan-400 tracking-widest mb-4 block">Mantenimiento y Licencias (Anual)</span>
                      <h3 className="text-5xl font-black text-white tracking-tighter">{data.calculatedBudget?.totalRecurringYearly.toLocaleString()} <span className="text-xl">€</span></h3>
                      <p className="text-xs text-slate-400 mt-6 font-medium">Incluye: Mantenimiento Perpetuo, Actualizaciones Tecnológicas y Soporte.</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden border">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-widest border-b">
                        <tr>
                          <th className="px-10 py-5">Concepto Detallado</th>
                          <th className="px-10 py-5 text-right">Inversión</th>
                          <th className="px-10 py-5 text-right">Recurrente Anual</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {data.calculatedBudget?.services.map((item, i) => (
                          <tr key={i} className="hover:bg-slate-50 transition-colors">
                            <td className="px-10 py-4 text-xs font-bold text-slate-700">{item.concept}</td>
                            <td className="px-10 py-4 text-sm font-black text-slate-900 text-right">{item.oneTime.toLocaleString()} €</td>
                            <td className="px-10 py-4 text-sm font-medium text-slate-300 text-right">-</td>
                          </tr>
                        ))}
                        {data.calculatedBudget?.recurring.map((item, i) => (
                          <tr key={`rec-${i}`} className="bg-cyan-50/10 hover:bg-cyan-50/20 transition-colors">
                            <td className="px-10 py-4 text-xs font-bold text-cyan-800">{item.concept}</td>
                            <td className="px-10 py-4 text-sm font-medium text-slate-300 text-right">-</td>
                            <td className="px-10 py-4 text-sm font-black text-cyan-700 text-right">{item.recurring.toLocaleString()} €</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* VISTA: ALCANCE TÉCNICO (DETALLADO) */}
              {reportTab === 'scope' && (
                <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-500">
                  <div className="flex items-center gap-4 px-4"><ClipboardCheck className="w-8 h-8 text-cyan-500" /><div><h3 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Alcance Funcional Seleccionado</h3><p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Validado según toma de requerimientos</p></div></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Object.entries(data.products).filter(([_, active]) => active).map(([key]) => (
                      <div key={key} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">{PRODUCT_ICONS[key as keyof typeof PRODUCT_ICONS]}</div>
                          <h4 className="font-black text-slate-900 uppercase text-xs">{PRODUCT_NAMES[key as keyof typeof PRODUCT_NAMES]}</h4>
                        </div>
                        <ul className="space-y-3">
                          {Object.entries((data.details as any)[key] || {}).filter(([k, v]) => v === true).map(([k]) => (
                            <li key={k} className="flex items-center gap-2 text-xs font-bold text-slate-600 border-b border-slate-50 pb-2">
                              <Check className="w-3 h-3 text-cyan-500" /> {k.replace(/([A-Z])/g, ' $1').toUpperCase()}
                            </li>
                          ))}
                          {Object.entries((data.details as any)[key] || {}).filter(([_, v]) => typeof v !== 'boolean').map(([k, v]) => (
                            <li key={k} className="p-3 bg-slate-50 rounded-xl text-[10px] font-bold text-slate-400 uppercase">
                              {k.toUpperCase()}: <span className="text-slate-900">{v as string}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* VISTA: ANÁLISIS IA */}
              {reportTab === 'ai' && (
                <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
                  <div className="bg-slate-900 text-slate-200 p-12 rounded-[3.5rem] font-mono text-sm leading-relaxed border-l-[20px] border-cyan-400 shadow-2xl relative">
                    <div className="absolute top-0 right-0 p-10 opacity-5"><BrainCircuit className="w-64 h-64 text-white" /></div>
                    <div className="relative z-10 whitespace-pre-wrap selection:bg-cyan-500 selection:text-white">{aiReport}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* NAVEGACIÓN PASOS 1-5 */}
        {step <= 5 && (
          <div className="p-8 bg-slate-50 border-t border-slate-200 flex items-center justify-between print:hidden">
            <button onClick={prevStep} disabled={step === 1} className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-bold transition-all border ${step === 1 ? 'text-slate-300 border-slate-100' : 'bg-white hover:bg-slate-100 text-slate-700'}`}>
              <ChevronLeft className="w-5 h-5" /> Anterior
            </button>
            <div className="flex items-center gap-4">
              {step < 5 ? (
                <button onClick={nextStep} className="flex items-center gap-2 text-white px-10 py-4 rounded-2xl font-black uppercase text-sm tracking-widest shadow-xl hover:opacity-90 active:scale-95 transition-all" style={{ backgroundColor: BRAND_NAVY }}>
                  Siguiente <ChevronRight className="w-5 h-5" />
                </button>
              ) : (
                <button onClick={handleGenerateReport} disabled={isGenerating || !data.companyName} className="flex items-center gap-3 text-white px-12 py-5 rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-2xl disabled:opacity-50 hover:scale-105" style={{ backgroundColor: BRAND_CYAN }}>
                  {isGenerating ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Procesando...</> : <><Send className="w-5 h-5" /> Generar Diagnóstico & Propuesta</>}
                </button>
              )}
            </div>
          </div>
        )}

        {/* FOOTER INFORME (BOTÓN VOLVER) */}
        {step === 6 && (
           <footer className="p-8 bg-slate-50 border-t flex flex-col md:flex-row items-center justify-between gap-4 print:hidden">
              <button onClick={() => setStep(4)} className="px-6 py-2.5 bg-white text-slate-600 border rounded-xl font-bold text-xs hover:bg-slate-100 transition-all flex items-center gap-2">
                <ChevronLeft className="w-4 h-4" /> Modificar Requerimientos
              </button>
              <div className="flex items-center gap-6 opacity-40">
                <Logo size="sm" />
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">AHORA Sistemas de Gestión • {new Date().getFullYear()}</p>
              </div>
           </footer>
        )}
      </main>

      {/* MODAL HISTORIAL */}
      {showHistory && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl rounded-[3rem] shadow-2xl flex flex-col max-h-[85vh] overflow-hidden border border-slate-200">
            <div className="p-8 border-b flex items-center justify-between bg-slate-50">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-3 uppercase tracking-tight"><History className="w-6 h-6 text-cyan-500" /> Historial de Sesiones</h2>
              <button onClick={() => setShowHistory(false)} className="bg-white p-2 rounded-full border shadow-sm transition-all hover:rotate-90"><X className="w-6 h-6 text-slate-400" /></button>
            </div>
            <div className="p-4 overflow-y-auto flex-1 space-y-3 bg-white scrollbar-thin">
              {history.length === 0 ? <p className="text-center py-20 text-slate-400 font-bold uppercase tracking-widest text-xs">No se han encontrado sesiones</p> : history.map(session => (
                <div key={session.id} className="p-6 bg-slate-50 hover:bg-white hover:border-cyan-300 border-2 border-slate-50 rounded-2xl cursor-pointer transition-all flex items-center gap-4 group" onClick={() => { setData(session.data); if (session.report) setAiReport(session.report); setStep(session.report ? 6 : 1); setShowHistory(false); }}>
                  <CompanyLogo name={session.data.companyName} cif={session.data.cif} size="sm" />
                  <div className="flex-1">
                    <h3 className="font-black text-slate-800 uppercase text-xs tracking-tight group-hover:text-cyan-600 transition-colors">{session.data.companyName || 'Sin Nombre'}</h3>
                    <div className="mt-2 flex gap-4">
                       <p className="text-[9px] text-slate-400 font-bold uppercase flex items-center gap-2"><Calendar className="w-3 h-3" /> {new Date(session.timestamp).toLocaleDateString()}</p>
                       <p className="text-[9px] text-slate-400 font-bold uppercase flex items-center gap-2"><Briefcase className="w-3 h-3" /> {session.data.sector}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                    {session.report && <div className="p-2 bg-cyan-50 text-cyan-600 rounded-lg"><Presentation className="w-4 h-4" /></div>}
                    <button onClick={(e) => { e.stopPropagation(); const updatedHistory = history.filter(h => h.id !== session.id); setHistory(updatedHistory); localStorage.setItem('ahora_discovery_history', JSON.stringify(updatedHistory)); }} className="p-2 text-slate-300 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <footer className="mt-12 pb-12 opacity-30 print:hidden text-center"><Logo size="sm" /></footer>
    </div>
  );
};

export default App;
