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
  hasThreshold?: boolean; // false = no capacity limit, quantity is tracked but not capped
  color?: string; // container accent color (hex)
  icon?: string; // container icon emoji
}

export interface RefillRecord {
  id: string;
  ingredientId?: string; // container this refill belongs to
  ingredientName: string;
  notes?: string;
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

export interface User {
  id: string;
  username: string;
  info: string;
  seenWelcome: boolean;
  isDemo?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface KitchenData {
  ingredients: Ingredient[];
  refills: RefillRecord[];
  config: UserConfig;
}

// ---------------------------------------------------------------------------
// AI conversation & structured detection types
// ---------------------------------------------------------------------------

export type ChatRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

export interface DetectedRefill {
  ingredientName: string;
  quantity: number;
  unit: 'g' | 'ml' | 'pcs' | '%' | string;
  maxQty?: number;
  hasThreshold?: boolean;
  confidence?: number;
  category?: string;
  notes?: string;
  isNewIngredient?: boolean;
}

export interface DetectedIngredient {
  name: string;
  category: string;
  currentQty: number;
  maxQty: number;
  unit: 'g' | 'ml' | 'pcs' | '%' | string;
  freshness?: number;
  spoilageRisk?: 'High' | 'Medium' | 'Low';
  confidence?: number;
  notes?: string;
}

export type AiActionType =
  | 'add_refill'
  | 'create_ingredient'
  | 'update_ingredient'
  | 'delete_ingredient'
  | 'log_consumption'
  | 'custom';

export interface AiAction {
  type: AiActionType;
  payload?: Record<string, unknown>;
}

export interface AiAssistantResponse {
  version: string;
  reply: string;
  requiresConfirmation?: boolean;
  detectedRefills?: DetectedRefill[];
  detectedIngredients?: DetectedIngredient[];
  actions?: AiAction[];
}

export interface SavedConversation {
  id: string;
  imageFilename: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
}

export interface ConversationListItem {
  id: string;
  imageFilename: string;
  excerpt: string;
  updatedAt: string;
}
