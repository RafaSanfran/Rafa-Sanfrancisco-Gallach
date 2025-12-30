import { FormData, BudgetResults, BudgetBreakdown } from "../types";

const CONSULTOR_HOUR = 90;
const TECNICO_HOUR = 78;

export const calculateBudget = (data: FormData): BudgetResults => {
  const services: BudgetBreakdown[] = [];
  const recurring: BudgetBreakdown[] = [];

  // Estimación aproximada de usuarios basada en el texto de usuarios por app o el tamaño de empresa
  const users = data.size === '1-5' ? 3 : data.size === '6-10' ? 8 : data.size === '11-20' ? 15 : 25;

  if (data.products.erp) {
    let maintCost = users * 480; 
    recurring.push({ concept: "AHORA 5 ERP - Mantenimiento Anual", oneTime: 0, recurring: maintCost });
  }

  if (data.products.crm) {
    recurring.push({ concept: "AHORA CRM Flexygo - Suscripción", oneTime: 0, recurring: users * 180 });
  }

  if (data.products.sga) {
    recurring.push({ concept: "AHORA SGA - Licencia y Mantenimiento", oneTime: 0, recurring: 1200 + (users * 90) });
  }

  if (data.products.sat) {
    const techCount = data.details.sat?.techniciansCount || 2;
    recurring.push({ concept: "AHORA SAT - Servicio de Técnicos", oneTime: 0, recurring: techCount * 350 });
  }

  if (data.products.docDigitization) {
    recurring.push({ concept: "Digitalización Documental - Cuota Servicio", oneTime: 0, recurring: 900 });
  }

  // --- SERVICIOS ---
  const activeModulesCount = Object.values(data.products).filter(Boolean).length;
  
  services.push({
    concept: "Análisis y Consultoría de Procesos",
    oneTime: Math.round((10 + activeModulesCount * 5) * CONSULTOR_HOUR),
    recurring: 0
  });

  services.push({
    concept: "Implantación y Configuración Técnica",
    oneTime: Math.round((activeModulesCount * 30) * TECNICO_HOUR),
    recurring: 0
  });

  services.push({
    concept: "Formación AHORA Academy",
    oneTime: activeModulesCount * 1200,
    recurring: 0
  });

  return {
    services,
    recurring,
    totalOneTime: services.reduce((acc, curr) => acc + curr.oneTime, 0),
    totalRecurringYearly: recurring.reduce((acc, curr) => acc + curr.recurring, 0)
  };
};