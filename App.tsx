import React, { useState, useEffect, useMemo } from 'react';
import { FormData, INITIAL_DATA, Sector, CompanySize, BudgetResults } from './types';
import { 
  Building2, Users, Rocket, Target, Settings, Package, 
  UserCircle, Globe, BrainCircuit, BarChart3, ChevronRight,
  ChevronLeft, CheckCircle2, AlertCircle, FileText, Send,
  Search, Briefcase, History, Trash2, PlusCircle, X,
  Scale, Calculator, Truck, Mail, LayoutDashboard, Database,
  Euro, TrendingUp, Clock, ShieldCheck, Info, Download, FileJson,
  ChevronDown, ChevronUp, Fingerprint, Check, Presentation, Eye,
  Sparkles, Layers, Zap, MapPin, ListChecks
} from 'lucide-react';
import { PRODUCT_ICONS, PRODUCT_NAMES } from './constants';
import { generateProposalSummary } from './services/geminiService';
import { calculateBudget } from './services/pricingService';
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const BRAND_NAVY = "#001E62";
const BRAND_CYAN = "#00C1F3";

interface SavedSession {
  id: string;
  timestamp: number;
  data: FormData;
  report: string | null;
}

const Tooltip = ({ text }: { text: string }) => (
  <div className="group relative inline-flex items-center ml-1.5">
    <Info className="w-3.5 h-3.5 text-slate-400 cursor-help hover:text-cyan-500 transition-colors" />
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-800 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 text-center shadow-2xl leading-tight">
      {text}
      <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-8 border-transparent border-t-slate-800"></div>
    </div>
  </div>
);

const Logo = ({ white = false, size = "md" }) => {
  const sizes = {
    sm: "h-6",
    md: "h-9",
    lg: "h-12",
    xl: "h-16"
  };
  return (
    <div className={`flex items-center select-none ${sizes[size]}`}>
      <span style={{ color: white ? '#FFFFFF' : BRAND_NAVY }} className="text-4xl font-black tracking-tighter leading-none mr-1">ah</span>
      <div className="w-auto h-full flex items-center justify-center">
        <svg viewBox="0 0 100 100" className="h-full w-auto">
          <path d="M 50 15 L 85 50 L 50 85 L 15 50 Z" fill="none" stroke={white ? '#FFFFFF' : BRAND_NAVY} strokeWidth="18" strokeLinejoin="round" />
          <path d="M 15 50 L 50 15 L 85 50" fill="none" stroke={white ? '#FFFFFF' : BRAND_NAVY} strokeWidth="18" strokeLinejoin="round" strokeLinecap="round" />
          <path d="M 15 50 L 50 85 L 85 50" fill="none" stroke={BRAND_CYAN} strokeWidth="18" strokeLinejoin="round" strokeLinecap="round" />
        </svg>
      </div>
      <span style={{ color: white ? '#FFFFFF' : BRAND_NAVY }} className="text-4xl font-black tracking-tighter leading-none ml-1">ra</span>
    </div>
  );
};

const CompanyLogo = ({ name, cif, size = "md" }: { name: string, cif: string, size?: "sm" | "md" | "lg" }) => {
  const initials = name.slice(0, 2).toUpperCase();
  const colors = ["bg-slate-800", "bg-indigo-600", "bg-emerald-600", "bg-amber-600"];
  const bgColor = useMemo(() => colors[cif.length % colors.length], [cif]);
  
  const sizeClasses = {
    sm: "w-10 h-10 text-xs",
    md: "w-20 h-20 text-xl",
    lg: "w-32 h-32 text-3xl"
  };

  return (
    <div className={`${sizeClasses[size]} ${bgColor} rounded-2xl flex flex-col items-center justify-center text-white font-black shadow-lg border-4 border-white overflow-hidden`}>
      <div className="flex flex-col items-center justify-center p-2">
        <span>{initials}</span>
        <span className="text-[8px] opacity-60 font-mono tracking-widest">{cif}</span>
      </div>
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
  const [reportTab, setReportTab] = useState<'ai' | 'budget' | 'presentation'>('presentation');
  const [activeAccordion, setActiveAccordion] = useState<string | null>(null);

  const totalSteps = 5;

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

  const nextStep = () => setStep(s => Math.min(s + 1, totalSteps));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

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
      details: {
        ...prev.details,
        [product]: {
          ...(prev.details[product] || {}),
          [field]: value
        }
      }
    }));
  };

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    const budgetResults = calculateBudget(data);
    const updatedData = { ...data, calculatedBudget: budgetResults };
    setData(updatedData);
    const report = await generateProposalSummary(updatedData);
    const finalReport = report || "Error en la generación.";
    setAiReport(finalReport);
    
    const newSession: SavedSession = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      data: updatedData,
      report: finalReport
    };
    const updatedHistory = [newSession, ...history];
    setHistory(updatedHistory);
    localStorage.setItem('ahora_discovery_history', JSON.stringify(updatedHistory));
    
    setIsGenerating(false);
    setStep(6);
    setReportTab('presentation');
  };

  const handleExportPDF = () => {
    if (!data || !aiReport) return;

    const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4"
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const drawFooter = () => {
        doc.setFillColor(BRAND_NAVY);
        doc.rect(0, pageHeight - 12, pageWidth, 12, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.text("ahora", 15, pageHeight - 5);
        doc.setFont("helvetica", "normal");
        doc.text("SISTEMAS DE GESTIÓN DE PRÓXIMA GENERACIÓN", pageWidth - 15, pageHeight - 5, { align: "right" });
    };

    // SLIDE 1: PORTADA
    doc.setFillColor(BRAND_NAVY);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
    doc.setFillColor(BRAND_CYAN);
    doc.circle(pageWidth, 0, 100, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(50);
    doc.setFont("helvetica", "bold");
    doc.text("ahora", 20, 50);
    doc.setFontSize(22);
    doc.text("PROPUESTA ESTRATÉGICA DE", 20, 70);
    doc.setTextColor(BRAND_CYAN);
    doc.text("TRANSFORMACIÓN DIGITAL 2026", 20, 82);
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.text(`PARA: ${data.companyName.toUpperCase()}`, 20, 120);
    doc.setFontSize(10);
    doc.text(`CIF: ${data.cif} | FECHA: ${new Date().toLocaleDateString()}`, 20, 130);

    // SLIDE 2: PRESENTACIÓN AHORA
    doc.addPage();
    doc.setTextColor(BRAND_NAVY);
    doc.setFontSize(32);
    doc.setFont("helvetica", "bold");
    doc.text("SOMOS AHORA", 15, 30);
    doc.setDrawColor(BRAND_CYAN);
    doc.setLineWidth(1.5);
    doc.line(15, 35, 60, 35);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(70, 70, 70);
    const corporateText = [
        "AHORA es un fabricante español de software con más de 30 años de trayectoria.",
        "Nuestra filosofía 'Low Cost, High Performance' se basa en la máxima eficiencia técnica.",
        "Garantizamos Mantenimiento Perpetuo: su sistema nunca quedará obsoleto y las",
        "actualizaciones están incluidas de por vida en su cuota, sin costes de migración."
    ];
    doc.text(corporateText, 15, 55, { lineHeightFactor: 1.4 });
    drawFooter();

    // SLIDE 3: METODOLOGÍA
    doc.addPage();
    doc.setTextColor(BRAND_NAVY);
    doc.setFontSize(28);
    doc.setFont("helvetica", "bold");
    doc.text("NUESTRA METODOLOGÍA DE ÉXITO", 15, 25);
    const steps = [
        { n: "01", t: "ANÁLISIS", d: "Diagnóstico profundo de procesos y detección de ineficiencias." },
        { n: "02", t: "DISEÑO", d: "Parametrización del sistema adaptado a su realidad operativa." },
        { n: "03", t: "IMPLANTACIÓN", d: "Integración técnica, migración de datos y puesta a punto." },
        { n: "04", t: "FORMACIÓN", d: "Capacitación avanzada de usuarios a través de AHORA Academy." },
        { n: "05", t: "ARRANQUE", d: "Acompañamiento crítico en el Go-Live y soporte continuado." }
    ];
    steps.forEach((s, i) => {
        const x = 15 + (i * 55);
        doc.setFillColor(BRAND_NAVY);
        doc.roundedRect(x, 45, 50, 60, 3, 3, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(14);
        doc.text(s.n, x + 25, 58, { align: "center" });
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text(s.t, x + 25, 68, { align: "center" });
        doc.setFontSize(7);
        doc.setFont("helvetica", "normal");
        doc.text(doc.splitTextToSize(s.d, 40), x + 5, 78);
    });
    drawFooter();

    // SLIDE 4: DIAGNÓSTICO IA
    doc.addPage();
    doc.setTextColor(BRAND_NAVY);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("DIAGNÓSTICO ESTRATÉGICO", 15, 25);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60, 60, 60);
    const aiWrapped = doc.splitTextToSize(aiReport, pageWidth - 30);
    doc.text(aiWrapped, 15, 40);
    drawFooter();

    // SLIDE 5: PRESUPUESTO
    doc.addPage();
    doc.setTextColor(BRAND_NAVY);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("RESUMEN DE INVERSIÓN", 15, 25);
    autoTable(doc, {
        startY: 35,
        head: [['CONCEPTO', 'TIPO', 'IMPORTE']],
        body: [
            ...data.calculatedBudget?.services.map(s => [s.concept, 'SERVICIOS', `${s.oneTime.toLocaleString()} €`]) || [],
            ...data.calculatedBudget?.recurring.map(r => [r.concept, 'MANTENIMIENTO ANUAL', `${r.recurring.toLocaleString()} €`]) || []
        ],
        theme: 'striped',
        headStyles: { fillColor: BRAND_NAVY }
    });
    drawFooter();

    doc.save(`PROPUESTA_AHORA_2026_${data.companyName.replace(/\s+/g, '_')}.pdf`);
  };

  const AccordionItem = ({ id, icon, title, children, actions }: { id: string, icon: React.ReactNode, title: string, children: React.ReactNode, actions?: React.ReactNode }) => {
    const isOpen = activeAccordion === id;
    return (
      <div className={`border rounded-2xl transition-all duration-300 overflow-hidden ${isOpen ? 'border-cyan-400 bg-white shadow-lg' : 'border-slate-100 bg-slate-50/30'}`}>
        <button 
          onClick={() => setActiveAccordion(isOpen ? null : id)}
          className="w-full flex items-center justify-between p-5 text-left focus:outline-none"
        >
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isOpen ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-400'}`}>
              {icon}
            </div>
            <div>
              <h3 className={`font-bold uppercase tracking-tight ${isOpen ? 'text-slate-900' : 'text-slate-600'}`}>{title}</h3>
              {!isOpen && <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Configurar alcance</span>}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {actions}
            {isOpen ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
          </div>
        </button>
        {isOpen && (
          <div className="p-6 pt-0 animate-in slide-in-from-top-2 duration-300">
            <div className="h-px bg-slate-100 mb-6" />
            {children}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col items-center py-8 px-4 md:px-8 max-w-5xl mx-auto font-['Inter']">
      {/* HEADER SECTION */}
      <div className="w-full flex flex-col md:flex-row items-center justify-between mb-8 gap-6 border-b border-slate-200 pb-6">
        <div className="flex flex-col items-center md:items-start gap-1">
          <Logo />
          <span className="text-[11px] font-bold tracking-[0.3em] uppercase text-slate-400 mt-1">Discovery Tool • Tarifas 2026</span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setShowHistory(true)} className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors font-medium text-sm border border-slate-200">
            <History className="w-4 h-4" /> Historial
          </button>
          <div className="hidden md:flex items-center gap-3 text-xs text-slate-500 font-bold uppercase tracking-wider">
            Progreso
            <div className="w-32 h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div 
                className="h-full transition-all duration-500 ease-out" 
                style={{ width: `${(step / totalSteps) * 100}%`, backgroundColor: BRAND_CYAN }} 
              />
            </div>
          </div>
        </div>
      </div>

      {showHistory && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[80vh] overflow-hidden border border-slate-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <History className="w-5 h-5" style={{ color: BRAND_NAVY }} /> Sesiones Guardadas
              </h2>
              <button onClick={() => setShowHistory(false)} className="text-slate-400 hover:text-slate-600 transition-colors"><X className="w-6 h-6" /></button>
            </div>
            <div className="p-4 overflow-y-auto flex-1 space-y-3 bg-white">
              {history.length === 0 ? (
                <div className="text-center py-12 text-slate-400"><FileText className="w-12 h-12 mx-auto mb-3 opacity-20" /><p>Historial vacío.</p></div>
              ) : (
                history.map(session => (
                  <div key={session.id} onClick={() => { setData(session.data); setAiReport(session.report); setStep(session.report ? 6 : 1); setShowHistory(false); }} className="group p-4 bg-slate-50 hover:bg-slate-100 border border-slate-100 hover:border-slate-300 rounded-xl transition-all cursor-pointer relative">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold text-slate-800" style={{ color: BRAND_NAVY }}>{session.data.companyName || 'Cliente sin nombre'}</h3>
                      <span className="text-[10px] text-slate-400 font-mono">{new Date(session.timestamp).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* MAIN WIZARD */}
      <main className="w-full bg-white rounded-3xl shadow-2xl shadow-slate-300/30 border border-slate-200 overflow-hidden flex flex-col min-h-[600px]">
        {step <= 5 && (
          <div className="w-full py-4 px-2 md:px-8 bg-white border-b border-slate-100">
            <div className="flex items-center justify-between max-w-4xl mx-auto relative">
              <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2 z-0" />
              <div 
                className="absolute top-1/2 left-0 h-0.5 transition-all duration-500 ease-out z-0" 
                style={{ width: `${((step - 1) / (totalSteps - 1)) * 100}%`, backgroundColor: BRAND_CYAN }} 
              />
              {[1, 2, 3, 4, 5].map(s => (
                <div key={s} className="relative z-10 flex flex-col items-center gap-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all border-2 ${step === s ? 'bg-white border-cyan-500 text-cyan-600 scale-110 shadow-lg' : step > s ? 'bg-cyan-500 border-cyan-500 text-white' : 'bg-white border-slate-200 text-slate-400'}`}>
                    {step > s ? <Check className="w-5 h-5" /> : s}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 1: CLIENT PROFILE */}
        {step === 1 && (
           <div className="p-8 space-y-6 flex-1 animate-in fade-in slide-in-from-bottom-2 duration-500">
             <div className="flex items-center gap-3 mb-2"><Building2 className="w-6 h-6" style={{ color: BRAND_CYAN }} /><h2 className="text-2xl font-bold text-slate-900">1. Perfil del Cliente</h2></div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-2"><label className="text-xs font-bold uppercase tracking-wider text-slate-500">Empresa</label><input type="text" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 outline-none transition-all font-medium" style={{ '--tw-ring-color': BRAND_CYAN } as any} value={data.companyName} onChange={e => updateData({ companyName: e.target.value })} placeholder="Nombre fiscal" /></div>
               <div className="space-y-2"><label className="text-xs font-bold uppercase tracking-wider text-slate-500">CIF / NIF</label><input type="text" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 outline-none transition-all font-medium uppercase" style={{ '--tw-ring-color': BRAND_CYAN } as any} value={data.cif} onChange={e => updateData({ cif: e.target.value.toUpperCase() })} placeholder="A12345678" /></div>
               <div className="space-y-2"><label className="text-xs font-bold uppercase tracking-wider text-slate-500">Contacto</label><input type="text" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 outline-none transition-all font-medium" style={{ '--tw-ring-color': BRAND_CYAN } as any} value={data.contactName} onChange={e => updateData({ contactName: e.target.value })} placeholder="Persona responsable" /></div>
               <div className="space-y-2"><label className="text-xs font-bold uppercase tracking-wider text-slate-500">Correo Electrónico</label><input type="email" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 outline-none transition-all font-medium" style={{ '--tw-ring-color': BRAND_CYAN } as any} value={data.email} onChange={e => updateData({ email: e.target.value })} placeholder="ejemplo@empresa.com" /></div>
               <div className="space-y-2"><label className="text-xs font-bold uppercase tracking-wider text-slate-500">Sector</label><select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 outline-none transition-all font-medium appearance-none" style={{ '--tw-ring-color': BRAND_CYAN } as any} value={data.sector} onChange={e => updateData({ sector: e.target.value as Sector })}>{['Fabricación', 'Distribución', 'Servicios', 'Otros'].map(s => <option key={s} value={s}>{s}</option>)}</select></div>
               <div className="space-y-2"><label className="text-xs font-bold uppercase tracking-wider text-slate-500">Tamaño (Empleados)</label><div className="flex flex-wrap gap-2">{['1-10', '11-50', '51-200', '201-500', '500+'].map(size => <button key={size} onClick={() => updateData({ size: size as CompanySize })} className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all border ${data.size === size ? 'text-white' : 'bg-white text-slate-500'}`} style={{ backgroundColor: data.size === size ? BRAND_NAVY : undefined }}>{size}</button>)}</div></div>
             </div>
           </div>
        )}

        {/* STEP 2: CURRENT SITUATION */}
        {step === 2 && (
          <div className="p-8 space-y-6 flex-1 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex items-center gap-3 mb-2"><BarChart3 className="w-6 h-6" style={{ color: BRAND_CYAN }} /><h2 className="text-2xl font-bold text-slate-900">2. Situación Actual</h2></div>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2"><label className="text-xs font-bold uppercase tracking-wider text-slate-500">Software Actual</label><input type="text" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 outline-none font-medium" style={{ '--tw-ring-color': BRAND_CYAN } as any} value={data.currentSoftware} onChange={e => updateData({ currentSoftware: e.target.value })} placeholder="Ej: SAP, Navision, Excel..." /></div>
                <div className="space-y-2"><label className="text-xs font-bold uppercase tracking-wider text-slate-500">Nº Usuarios</label><input type="number" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 outline-none font-medium" style={{ '--tw-ring-color': BRAND_CYAN } as any} value={data.currentUsers || ''} onChange={e => updateData({ currentUsers: parseInt(e.target.value) || 0 })} /></div>
              </div>
              <div className="space-y-2"><label className="text-xs font-bold uppercase tracking-wider text-slate-500">Puntos de Dolor</label><textarea className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 outline-none h-24 font-medium" style={{ '--tw-ring-color': BRAND_CYAN } as any} value={data.mainPainPoints} onChange={e => updateData({ mainPainPoints: e.target.value })} placeholder="Describa los problemas actuales..." /></div>
            </div>
          </div>
        )}

        {/* STEP 3: SOLUTIONS */}
        {step === 3 && (
          <div className="p-8 space-y-6 flex-1 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex items-center gap-3 mb-2"><Package className="w-6 h-6" style={{ color: BRAND_CYAN }} /><h2 className="text-2xl font-bold text-slate-900">3. Soluciones AHORA</h2></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {(Object.keys(PRODUCT_NAMES) as Array<keyof typeof PRODUCT_NAMES>).map(key => (
                <button key={key} onClick={() => updateProduct(key)} className={`flex flex-col gap-4 p-6 rounded-2xl border-2 transition-all text-left ${data.products[key] ? 'bg-slate-50 border-cyan-400 shadow-lg' : 'bg-white border-slate-100 shadow-sm'}`} style={{ borderColor: data.products[key] ? BRAND_CYAN : undefined }}>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${data.products[key] ? 'text-white bg-slate-800' : 'text-slate-400 bg-slate-50'}`}>{PRODUCT_ICONS[key]}</div>
                  <span className={`text-sm font-bold ${data.products[key] ? 'text-slate-900' : 'text-slate-500'}`}>{PRODUCT_NAMES[key]}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 4: DETAILED SCOPE */}
        {step === 4 && (
          <div className="p-8 space-y-8 flex-1 overflow-y-auto max-h-[600px] animate-in fade-in slide-in-from-bottom-2 duration-500">
             <div className="flex items-center gap-3 mb-2"><Search className="w-6 h-6" style={{ color: BRAND_CYAN }} /><h2 className="text-2xl font-bold text-slate-900">4. Alcance Operativo</h2></div>
             <div className="space-y-4 pb-10">
                {data.products.erp && (
                  <AccordionItem id="erp" icon={<Settings />} title="AHORA 5 ERP">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[
                        { id: 'stockManagement', label: 'Gestión de Stock' },
                        { id: 'traceability', label: 'Trazabilidad' },
                        { id: 'accounting', label: 'Contabilidad', tooltip: 'La activación de Contabilidad implica la activación mandatoria del módulo financiero y configuración de asientos automáticos.' },
                        { id: 'manufacturing', label: 'Fabricación MRP' },
                        { id: 'financial', label: 'Finanzas' },
                        { id: 'sales', label: 'Ciclo Ventas' }
                      ].map(f => (
                        <label key={f.id} className="flex items-center gap-3 cursor-pointer p-3 bg-white hover:bg-slate-50 rounded-xl border border-slate-100 transition-colors">
                          <input type="checkbox" className="w-5 h-5 rounded-md" style={{ accentColor: BRAND_CYAN }} checked={(data.details.erp as any)?.[f.id] || false} onChange={(e) => updateDetail('erp', f.id, e.target.checked)} />
                          <span className="text-sm font-semibold text-slate-600 flex items-center flex-1">
                            {f.label}
                            {f.tooltip && <Tooltip text={f.tooltip} />}
                          </span>
                        </label>
                      ))}
                    </div>
                  </AccordionItem>
                )}
                {data.products.sga && (
                  <AccordionItem id="sga" icon={<Package />} title="SGA Logística">
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1"><MapPin className="w-3 h-3" /> Nº Almacenes</label>
                          <input type="number" className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 outline-none" style={{ '--tw-ring-color': BRAND_CYAN } as any} value={data.details.sga?.warehouseCount || ''} onChange={e => updateDetail('sga', 'warehouseCount', parseInt(e.target.value) || 0)} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1"><ListChecks className="w-3 h-3" /> Nº Ubicaciones</label>
                          <input type="number" className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 outline-none" style={{ '--tw-ring-color': BRAND_CYAN } as any} value={data.details.sga?.locationsCount || ''} onChange={e => updateDetail('sga', 'locationsCount', parseInt(e.target.value) || 0)} />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                          { id: 'picking', label: 'Picking' },
                          { id: 'packing', label: 'Packing' },
                          { id: 'rfid', label: 'RFID' },
                          { id: 'waves', label: 'Oleadas' }
                        ].map(f => (
                          <label key={f.id} className="flex flex-col items-center justify-center gap-2 p-4 bg-white border border-slate-100 rounded-2xl hover:border-cyan-300 transition-all cursor-pointer group shadow-sm">
                            <input type="checkbox" className="w-5 h-5 rounded-md" style={{ accentColor: BRAND_CYAN }} checked={(data.details.sga as any)?.[f.id] || false} onChange={(e) => updateDetail('sga', f.id, e.target.checked)} />
                            <span className="text-[10px] font-black uppercase tracking-tighter text-slate-500 group-hover:text-slate-900">{f.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </AccordionItem>
                )}
                {data.products.flexygoCustom && (
                  <AccordionItem id="flexygoCustom" icon={<PlusCircle />} title="Proyecto Personalizado Flexygo">
                    <div className="space-y-4">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">Descripción del proyecto personalizado</label>
                      <textarea 
                        className="w-full p-4 bg-white border border-slate-200 rounded-xl focus:ring-2 outline-none h-40 font-medium" 
                        style={{ '--tw-ring-color': BRAND_CYAN } as any} 
                        value={data.details.flexygoCustom?.description || ''} 
                        onChange={e => updateDetail('flexygoCustom', 'description', e.target.value)} 
                        placeholder="Explique detalladamente qué aplicación personalizada necesita construir desde cero..." 
                      />
                    </div>
                  </AccordionItem>
                )}
             </div>
          </div>
        )}

        {/* STEP 5: EXPECTATIONS */}
        {step === 5 && (
          <div className="p-8 space-y-6 flex-1 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex items-center gap-3 mb-2"><Target className="w-6 h-6" style={{ color: BRAND_CYAN }} /><h2 className="text-2xl font-bold text-slate-900">5. Expectativas de Negocio</h2></div>
            <textarea className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 outline-none h-40 font-medium" style={{ '--tw-ring-color': BRAND_CYAN } as any} value={data.expectations} onChange={e => updateData({ expectations: e.target.value })} placeholder="¿Qué espera conseguir con el cambio de software?..." />
          </div>
        )}

        {/* STEP 6: PRESENTATION MODE */}
        {step === 6 && (
          <div className="p-8 space-y-8 flex-1 overflow-y-auto max-h-[800px] animate-in zoom-in-95 duration-500 bg-slate-50/50">
            <div className="flex flex-col xl:flex-row items-center justify-between gap-6 mb-8 border-b border-slate-200 pb-8">
              <div className="flex items-center gap-5">
                <CompanyLogo name={data.companyName} cif={data.cif} size="md" />
                <div>
                  <h2 className="text-4xl font-black tracking-tighter text-slate-900 leading-none uppercase">PROPUESTA <br/>ESTRATÉGICA</h2>
                  <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-2">Discovery Tool 2026</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <button onClick={() => setReportTab('presentation')} className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 border ${reportTab === 'presentation' ? 'bg-slate-900 text-white border-slate-900 shadow-lg' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}><Eye className="w-4 h-4" /> Presentación</button>
                <button onClick={() => setReportTab('ai')} className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 border ${reportTab === 'ai' ? 'bg-slate-900 text-white border-slate-900 shadow-lg' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}><Sparkles className="w-4 h-4" /> Diagnóstico IA</button>
                <button onClick={() => setReportTab('budget')} className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 border ${reportTab === 'budget' ? 'bg-slate-900 text-white border-slate-900 shadow-lg' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}><Calculator className="w-4 h-4" /> Inversión</button>
                <button onClick={handleExportPDF} className="flex items-center gap-2 px-8 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all bg-cyan-500 text-white hover:bg-cyan-600 shadow-xl shadow-cyan-400/20"><Download className="w-4 h-4" /> Exportar PDF</button>
              </div>
            </div>
            
            {reportTab === 'presentation' && (
              <div className="space-y-16 pb-16 max-w-6xl mx-auto">
                {/* SLIDE 1: PORTADA */}
                <div className="aspect-video w-full bg-slate-900 rounded-[3rem] p-16 flex flex-col justify-between relative overflow-hidden shadow-2xl border-4 border-white">
                    <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80" alt="Background" className="absolute inset-0 w-full h-full object-cover opacity-20" />
                    <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-400/10 blur-[150px] rounded-full" />
                    <Logo white size="lg" />
                    <div className="relative z-10">
                        <h1 className="text-6xl lg:text-8xl font-black text-white leading-[0.9] tracking-tighter">DISEÑO DE <br/><span className="text-cyan-400">FUTURO</span></h1>
                        <p className="text-2xl text-slate-400 font-medium mt-6 uppercase">Transformando {data.companyName} con AHORA</p>
                    </div>
                    <div className="flex items-center justify-between border-t border-slate-800 pt-8">
                        <div className="flex items-center gap-4">
                            <CompanyLogo name={data.companyName} cif={data.cif} size="sm" />
                            <span className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">{data.cif}</span>
                        </div>
                        <span className="text-xs text-slate-500 font-black uppercase tracking-[0.5em]">ahora • systems 2026</span>
                    </div>
                </div>

                {/* SLIDE 2: PRESENTACIÓN CORPORATIVA */}
                <div className="aspect-video w-full bg-white rounded-[3rem] p-16 grid grid-cols-1 lg:grid-cols-2 gap-16 shadow-2xl border border-slate-100 relative overflow-hidden">
                    <div className="flex flex-col justify-center gap-8 relative z-10">
                        <span className="text-cyan-500 font-black uppercase tracking-widest text-xs flex items-center gap-2"><Layers className="w-4 h-4" /> Fabricante de Software</span>
                        <h2 className="text-5xl font-black text-slate-900 tracking-tighter leading-tight uppercase">SISTEMAS DE GESTIÓN <br/>PARA LÍDERES</h2>
                        <p className="text-slate-600 text-lg leading-relaxed">
                            Más de 3.500 clientes confían en nuestra tecnología propietaria para gestionar sus operaciones críticas cada día. Somos el socio tecnológico que garantiza su evolución.
                        </p>
                        <div className="flex gap-4">
                            <div className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest">Mantenimiento Perpetuo</div>
                            <div className="bg-slate-100 text-slate-900 px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest">I+D Propio</div>
                        </div>
                    </div>
                    <div className="bg-slate-50 rounded-[2.5rem] p-0 overflow-hidden relative shadow-inner">
                        <img src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80" alt="Team" className="w-full h-full object-cover" />
                    </div>
                </div>

                {/* SLIDE 3: METODOLOGÍA */}
                <div className="aspect-video w-full bg-slate-900 rounded-[3rem] p-16 flex flex-col shadow-2xl relative overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80" className="absolute inset-0 w-full h-full object-cover opacity-5" />
                    <h2 className="text-4xl font-black text-white tracking-tighter mb-16 flex items-center gap-4">NUESTRA RUTA HACIA EL ÉXITO</h2>
                    <div className="grid grid-cols-5 gap-4 flex-1">
                        {[
                            { n: '01', t: 'ANÁLISIS', i: <Search />, d: 'Diagnóstico profundo de procesos' },
                            { n: '02', t: 'DISEÑO', i: <LayoutDashboard />, d: 'Parametrización a medida' },
                            { n: '03', t: 'IMPLANTACIÓN', i: <Settings />, d: 'Integración y despliegue' },
                            { n: '04', t: 'FORMACIÓN', i: <Users />, d: 'Capacitación Academy' },
                            { n: '05', t: 'ARRANQUE', i: <Rocket />, d: 'Go-Live asistido', active: true },
                        ].map((s, idx) => (
                            <div key={idx} className={`rounded-[2rem] p-8 flex flex-col items-center text-center gap-4 transition-all hover:-translate-y-2 border ${s.active ? 'bg-cyan-400 border-cyan-300 text-slate-900 shadow-xl shadow-cyan-400/20 scale-105' : 'bg-slate-800 border-slate-700 text-white'}`}>
                                <span className={`font-black text-2xl ${s.active ? 'text-slate-900/50' : 'text-slate-600'}`}>{s.n}</span>
                                <div className={`w-12 h-12 flex items-center justify-center rounded-2xl mb-2 ${s.active ? 'bg-slate-900/10' : 'bg-slate-900'}`}>{s.i}</div>
                                <h3 className="font-black text-xs uppercase tracking-tighter">{s.t}</h3>
                                <p className={`text-[9px] font-medium leading-relaxed ${s.active ? 'text-slate-800' : 'text-slate-500'}`}>{s.d}</p>
                            </div>
                        ))}
                    </div>
                </div>
              </div>
            )}

            {reportTab === 'ai' && (
              <div className="bg-slate-900 text-slate-100 p-12 rounded-[3rem] font-mono text-sm leading-relaxed border-l-[16px] shadow-2xl relative overflow-hidden" style={{ borderLeftColor: BRAND_CYAN }}>
                <div className="relative z-10 whitespace-pre-wrap">{aiReport}</div>
              </div>
            )}

            {reportTab === 'budget' && (
              <div className="space-y-10 animate-in fade-in duration-500 max-w-4xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-10 rounded-[2.5rem] bg-white border border-slate-200 shadow-xl relative overflow-hidden group">
                    <p className="text-[10px] font-black uppercase text-slate-400 mb-2 tracking-[0.3em]">Servicios Iniciales</p>
                    <p className="text-5xl font-black text-slate-900" style={{ color: BRAND_NAVY }}>{data.calculatedBudget?.totalOneTime.toLocaleString()} €</p>
                  </div>
                  <div className="p-10 rounded-[2.5rem] bg-white border border-slate-200 shadow-xl relative overflow-hidden group">
                    <p className="text-[10px] font-black uppercase text-slate-400 mb-2 tracking-[0.3em]">Recurrente Anual</p>
                    <p className="text-5xl font-black text-slate-900" style={{ color: BRAND_CYAN }}>{data.calculatedBudget?.totalRecurringYearly.toLocaleString()} €</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* FOOTER ACTIONS */}
        {step <= 5 && (
          <div className="p-8 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <button 
              onClick={prevStep} 
              disabled={step === 1} 
              className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-bold transition-all border shadow-sm active:scale-95 ${
                step === 1 
                ? 'text-slate-300 border-slate-100 bg-slate-50 cursor-not-allowed' 
                : 'bg-white hover:bg-slate-50 hover:border-slate-300'
              }`}
              style={step !== 1 ? { color: BRAND_NAVY, borderColor: BRAND_NAVY } : {}}
            >
              <ChevronLeft className="w-5 h-5" /> Anterior
            </button>
            <div className="flex items-center gap-4">
              {step < 5 ? (
                <button 
                  onClick={nextStep} 
                  className="flex items-center gap-2 text-white px-10 py-4 rounded-2xl font-bold transition-all shadow-xl hover:opacity-90 active:scale-95" 
                  style={{ backgroundColor: BRAND_NAVY }}
                >
                  Siguiente paso <ChevronRight className="w-5 h-5" />
                </button>
              ) : (
                <button 
                  onClick={handleGenerateReport} 
                  disabled={isGenerating || !data.companyName} 
                  className="flex items-center gap-3 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-xl disabled:opacity-50 hover:opacity-90 active:scale-95" 
                  style={{ backgroundColor: BRAND_CYAN }}
                >
                  {isGenerating ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Analizando...</> : <><Send className="w-5 h-5" /> Generar Propuesta</>}
                </button>
              )}
            </div>
          </div>
        )}
      </main>

      <footer className="mt-16 pb-12 opacity-40"><Logo size="sm" /></footer>
    </div>
  );
};

export default App;