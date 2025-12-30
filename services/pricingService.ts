import { FormData, BudgetResults, BudgetBreakdown } from "../types";

const CONSULTOR_HOUR = 90; // Page 17: Hora consultor 90€
const TECNICO_HOUR = 78;   // Page 17: Hora técnico 78€

export const calculateBudget = (data: FormData): BudgetResults => {
  const services: BudgetBreakdown[] = [];
  const recurring: BudgetBreakdown[] = [];

  const users = data.currentUsers || 1;

  // --- 1. CÁLCULO DE RECURRENTE (TARIFAS 2026) ---

  // ERP - AHORA 5 (Página 2)
  if (data.products.erp) {
    let maintCost = 0;
    if (users <= 4) maintCost = 630 * users;
    else if (users <= 9) maintCost = 510 * users;
    else if (users <= 24) maintCost = 460 * users;
    else if (users <= 49) maintCost = 13120;
    else if (users <= 74) maintCost = 19420;
    else if (users <= 99) maintCost = 26765;
    else maintCost = 41980;

    recurring.push({
      concept: "AHORA 5 ERP - Mantenimiento Anual",
      oneTime: 0,
      recurring: maintCost
    });

    // Fiscalidad Complements (Página 5)
    if (data.details.erp?.verifactuSII) {
      recurring.push({
        concept: "Sistemas Fiscales (SII) - Cuota Fija",
        oneTime: 0,
        recurring: 63 * 12
      });
      
      let veriFactu = 0;
      if (users <= 3) veriFactu = 135;
      else if (users <= 25) veriFactu = 270;
      else veriFactu = 540;

      recurring.push({
        concept: "Sistemas Fiscales (Veri*Factu)",
        oneTime: 0,
        recurring: veriFactu
      });
    }
  }

  // CRM - AHORA CRM Flexygo (Página 8)
  if (data.products.crm) {
    const crmUsers = data.details.crm?.crmUsers || users;
    const license = 150 * crmUsers;
    recurring.push({
      concept: "AHORA CRM Flexygo - Licencia Anual",
      oneTime: 0,
      recurring: license
    });
    recurring.push({
      concept: "Mantenimiento CRM (50% Licencia)",
      oneTime: 0,
      recurring: license * 0.5
    });
  }

  // GMAO - Bruno (Página 8)
  if (data.products.gmao) {
    let brunoBase = 0;
    if (users <= 5) brunoBase = 1265;
    else if (users <= 10) brunoBase = 2205;
    else if (users <= 20) brunoBase = 3360;
    else if (users <= 30) brunoBase = 4200;
    else brunoBase = 5500;

    recurring.push({
      concept: "Bruno GMAO - Licencia Anual",
      oneTime: 0,
      recurring: brunoBase
    });
    recurring.push({
      concept: "Mantenimiento GMAO (50% Licencia)",
      oneTime: 0,
      recurring: brunoBase * 0.5
    });
  }

  // HR - Sebastian (Página 9)
  if (data.products.hr) {
    let hrMonthly = 0;
    if (users <= 10) hrMonthly = 60;
    else if (users <= 25) hrMonthly = 80;
    else if (users <= 50) hrMonthly = 110;
    else if (users <= 100) hrMonthly = 175;
    else if (users <= 200) hrMonthly = 330;
    else hrMonthly = 445;

    const license = hrMonthly * 12;
    recurring.push({
      concept: "Sebastian HR PRO - Licencia Anual",
      oneTime: 0,
      recurring: license
    });
    recurring.push({
      concept: "Mantenimiento HR (50% Licencia)",
      oneTime: 0,
      recurring: license * 0.5
    });
  }

  // SGA
  if (data.products.sga) {
    const license = 150 * users;
    recurring.push({
      concept: "AHORA SGA Lite - Licencia Anual",
      oneTime: 0,
      recurring: license
    });
    recurring.push({
      concept: "Mantenimiento SGA (50% Licencia)",
      oneTime: 0,
      recurring: license * 0.5
    });
  }

  // Proyecto Personalizado Flexygo
  if (data.products.flexygoCustom) {
    // Estimación base para mantenimiento de app personalizada
    const customMaint = 1200 + (users * 24);
    recurring.push({
      concept: "Mantenimiento App Personalizada Flexygo",
      oneTime: 0,
      recurring: customMaint
    });
  }

  // --- 2. CÁLCULO DE SERVICIOS (PROYECTO) ---
  
  const activeModulesCount = Object.values(data.products).filter(Boolean).length;
  const complexityFactor = (11 - data.digitalMaturity) * 0.1 + (activeModulesCount * 0.05);

  // Análisis y Consultoría
  let analysisHours = 12 + (activeModulesCount * 6);
  if (data.products.flexygoCustom) analysisHours += 20; // Plus por análisis de desarrollo a medida

  services.push({
    concept: "Análisis y Consultoría de Negocio",
    oneTime: Math.round(analysisHours * CONSULTOR_HOUR),
    recurring: 0
  });

  // Implantación Técnica
  let implHours = (activeModulesCount * 40) * (1 + complexityFactor);
  if (data.products.flexygoCustom) implHours += 80; // Plus por horas de desarrollo base

  services.push({
    concept: "Implantación, Configuración y Desarrollo",
    oneTime: Math.round(implHours * TECNICO_HOUR),
    recurring: 0
  });

  // Formación
  const trainingModules = activeModulesCount * 3000 * (users > 20 ? 1.5 : 1);
  services.push({
    concept: "Plan de Capacitación y Formación Academy",
    oneTime: Math.round(trainingModules),
    recurring: 0
  });

  const totalOneTime = services.reduce((acc, curr) => acc + curr.oneTime, 0);
  const totalRecurringYearly = recurring.reduce((acc, curr) => acc + curr.recurring, 0);

  return {
    services,
    recurring,
    totalOneTime,
    totalRecurringYearly
  };
};