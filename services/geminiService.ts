
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
    Eres un Consultor Estratégico Senior de AHORA (empresa líder en software de gestión). 
    Tu objetivo es analizar una toma de requerimientos y generar un informe persuasivo y profesional.
    
    PERFIL DEL CLIENTE:
    - Empresa: ${formData.companyName}
    - Sector: ${formData.sector}
    - Tamaño: ${formData.size} empleados
    - Perfil del Interlocutor: ${formData.customerCharacter}
    
    SITUACIÓN ACTUAL Y PAIN POINTS:
    - Software: ${formData.currentSoftware}
    - Usuarios: ${formData.currentAppsUsers}
    - Problemas Críticos: ${formData.mainPainPoints}
    - Madurez Digital: ${formData.digitalMaturity}/10
    
    ALCANCE TÉCNICO PROPUESTO (Suite AHORA 5):
    ${Object.entries(formData.products)
      .filter(([_, value]) => value)
      .map(([key, _]) => `- ${key.toUpperCase()}`)
      .join('\n')}
      
    DETALLES DE FUNCIONALIDADES SELECCIONADAS:
    ${JSON.stringify(formData.details, null, 2)}
    
    ${budgetInfo}
    
    OBJETIVOS DEL CLIENTE: ${formData.expectations}
    
    REGLAS DEL INFORME:
    1. Usa un tono que encaje con el carácter "${formData.customerCharacter}".
    2. RESUMEN EJECUTIVO: Centrado en ROI y resolución de los pain points indicados.
    3. DIAGNÓSTICO: Analiza por qué su sistema actual (${formData.currentSoftware}) le está haciendo perder dinero/eficiencia.
    4. ARQUITECTURA: Explica cómo los módulos seleccionados (ERP, SGA, etc.) solucionan sus problemas específicos.
    5. VALOR DIFERENCIAL AHORA: Menciona obligatoriamente el "Mantenimiento Perpetuo", ser "Fabricantes" y el bajo "TCO".
    6. ESTRATEGIA: Da consejos al comercial para cerrar la venta basándose en el perfil del cliente.
    
    Escribe el informe en Español de España, de forma estructurada y con viñetas.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 4000 }
      }
    });

    return response.text;
  } catch (error) {
    console.error("Error generating summary:", error);
    return "No se pudo generar el resumen automáticamente en este momento.";
  }
};
