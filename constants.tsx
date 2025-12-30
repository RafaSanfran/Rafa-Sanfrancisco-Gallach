import React from 'react';
import { 
  Building2, Users, Rocket, Target, Settings, Package, 
  UserCircle, Globe, BrainCircuit, BarChart3, ChevronRight,
  ClipboardList, Search, MessageSquare, Briefcase, PlusCircle
} from 'lucide-react';

export const PRODUCT_ICONS = {
  erp: <Settings className="w-5 h-5" />,
  crm: <Users className="w-5 h-5" />,
  gmao: <Rocket className="w-5 h-5" />,
  hr: <UserCircle className="w-5 h-5" />,
  sga: <Package className="w-5 h-5" />,
  portal: <Globe className="w-5 h-5" />,
  ai: <BrainCircuit className="w-5 h-5" />,
  flexygoCustom: <PlusCircle className="w-5 h-5" />
};

export const PRODUCT_NAMES = {
  erp: 'ERP (Gestión Empresarial)',
  crm: 'CRM (Ventas y Clientes)',
  gmao: 'GMAO (Mantenimiento)',
  hr: 'HR (Recursos Humanos)',
  sga: 'SGA (Logística)',
  portal: 'Portal de Cliente/Proveedor',
  ai: 'Soluciones con IA',
  flexygoCustom: 'Proyecto Personalizado Flexygo'
};