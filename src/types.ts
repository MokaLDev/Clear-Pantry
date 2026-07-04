export interface Ingredient {
  id: string;
  name: string;
  category: string;
  currentQty: number; // Current quantity value
  maxQty: number; // Max capacity
  unit: string; // "g", "ml", "pcs", "%"
  percentage: number; // 0 to 100
  status: 'critical' | 'stable' | 'normal';
  freshness: number; // 0 to 100
  spoilageRisk: 'High' | 'Medium' | 'Low';
  lastUpdated: string;
  isCustom?: boolean;
}

export interface RefillRecord {
  id: string;
  ingredientName: string;
  qtyAdded: string; // e.g. "+40g", "+500ml", "+250g"
  method: 'OPTICAL AI' | 'MANUAL';
  confidence: number; // e.g. 99, 10, 94
  timestamp: string;
}

export interface ConsumptionLog {
  id: string;
  timestamp: string;
  ingredientName: string;
  qtyConsumed: number;
  unit: string;
}

export interface UserConfig {
  darkMode: boolean;
  language: string;
  reportGenerationLogic: string;
}
