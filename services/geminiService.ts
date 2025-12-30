import { GoogleGenAI } from "@google/genai";
import { FormData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateProposalSummary = async (formData: FormData) => {
  const budgetInfo = formData.calculatedBudget ? `
    ESTIMACIÓN ECONÓMICA PRELIMINAR:
    - Inversión Inicial (Servicios): ${formData.calculatedBudget.totalOneTime.toLocaleString()} €
    - Coste Recurrente Anual (Licencias + Mantenimiento): ${formData.calculatedBudget.totalRecurringYearly.toLocaleString()} €
  ` : '';

  const prompt = `
    Como consultor senior de AHORA (empresa de software ERP/CRM), analiza la siguiente toma de requerimientos y la estimación económica generada.
    
    DATOS DEL CLIENTE:
    Empresa: ${formData.companyName}
    CIF: ${formData.cif}
    Email: ${formData.email}
    Sector: ${formData.sector}
    Tamaño: ${formData.size} empleados
    Usuarios actuales: ${formData.currentUsers}
    Nivel Digital: ${formData.digitalMaturity}/10
    Software actual: ${formData.currentSoftware}
    Problemas principales: ${formData.mainPainPoints}
    
    PRODUCTOS INTERESADOS:
    ${Object.entries(formData.products)
      .filter(([_, value]) => value)
      .map(([key, _]) => `- ${key.toUpperCase()}`)
      .join('\n')}
      
    DETALLES DE ALCANCE:
    ${JSON.stringify(formData.details, null, 2)}
    
    ${budgetInfo}
    
    EXPECTATIVAS: ${formData.expectations}
    
    Genera un informe que incluya:
    1. Resumen Ejecutivo centrado en el ROI.
    2. Diagnóstico de necesidades críticas y cómo justifican la inversión propuesta.
    3. Validación del presupuesto: ¿Es coherente con el alcance? ¿Qué partidas son críticas?
    4. Siguientes pasos recomendados para cerrar la venta.
    5. Valor diferencial de AHORA frente a la competencia en este escenario de precios y servicios.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 2000 }
      }
    });

    return response.text;
  } catch (error) {
    console.error("Error generating summary:", error);
    return "No se pudo generar el resumen automáticamente. Por favor, revisa la conexión.";
  }
};
