import React, { useState, useRef, useEffect } from 'react';
import { Ingredient } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import {
  AlertTriangle,
  ShieldCheck,
  Thermometer,
  ChevronRight,
  CheckCircle,
  FlameKindling,
  UtensilsCrossed,
  Trash2,
  X,
  ChevronLeft,
  Edit3,
  Loader2,
  RefreshCw,
  Plus
} from 'lucide-react';
import { useI18n } from '../i18n';

const CONTAINER_COLORS = [
  '#dbeafe', // soft blue
  '#dcfce7', // soft green
  '#fce7f3', // soft pink
  '#fef3c7', // soft yellow
  '#f3e8ff', // soft lavender
  '#ffedd5', // soft orange
  '#d1fae5', // mint
  '#fee2e2', // soft red
  '#e0f2fe', // sky
  '#f1f5f9'  // soft gray
];

const CONTAINER_ICONS = [
  '🥫', '🥚', '🥛', '🍞', '🥦', '🍅', '🍎', '🍖', '🧀', '🍚',
  '🍯', '🧂', '🧈', '🥜', '🫘', '🍇', '🍊', '🍋', '🍌', '🍉',
  '🍓', '🫐', '🍈', '🍒', '🍑', '🍍', '🥝', '🥑', '🍆', '🥕',
  '🌽', '🌶️', '🫑', '🥒', '🥬', '🧄', '🧅', '🍠', '🍳', '🥘',
  '🍲', '🍜', '🥗', '🍿', '🍩', '🍪', '🎂', '🍰', '🍫', '🍬',
  '🍭', '🍮', '🍵', '🍶', '🍺', '🍷', '🍴', '🍽️', '🥄', '🔪',
  '🧊', '🥡'
];

function hexAlpha(hex: string, alpha: string) {
  return hex + alpha;
}

interface HomeScreenProps {
  ingredients: Ingredient[];
  dietAdvice: string;
  onRefreshAdvice: () => void;
  onNavigateToTab: (tab: string) => void;
  darkMode: boolean;
  isDemo?: boolean;
  adviceLoading?: boolean;
  onUpdateIngredient?: (ingredient: Ingredient) => void;
  onDeleteIngredient?: (id: string) => void;
  onAddIngredient?: (ingredient: Ingredient) => void;
}

export default function HomeScreen({
  ingredients,
  dietAdvice,
  onRefreshAdvice,
  onNavigateToTab,
  darkMode,
  isDemo = false,
  adviceLoading = false,
  onUpdateIngredient,
  onDeleteIngredient,
  onAddIngredient
}: HomeScreenProps) {
  const [dismissed, setDismissed] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const { t } = useI18n();

  // Container list swipe-to-delete state
  const [swipeOffsets, setSwipeOffsets] = useState<Record<string, number>>({});
  const swipeRef = useRef<{ id: string; startX: number; startOffset: number } | null>(null);
  const pointerMoved = useRef(false);
  const DELETE_WIDTH = 64;
  const DELETE_EXTRA = 56;
  const DELETE_TRIGGER = -(DELETE_WIDTH + DELETE_EXTRA);
  const MAX_DRAG = DELETE_WIDTH + DELETE_EXTRA * 2;

  // Full-screen container editor state
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
  const [editForm, setEditForm] = useState<Partial<Ingredient>>({});
  const [hasThreshold, setHasThreshold] = useState(false);

  const criticalItems: Ingredient[] = [];
  const eggsItem = ingredients.find((i) => i.id === 'organic-eggs') || { currentQty: 6, maxQty: 12, percentage: 50 };
  const riceItem = ingredients.find((i) => i.id === 'basmati-rice') || { currentQty: 4600, maxQty: 5000, percentage: 92 };

  const totalFreshness = ingredients.reduce((acc, curr) => acc + curr.freshness, 0);
  const averageFreshness = Math.round(totalFreshness / ingredients.length) || (isDemo ? 80 : 0);

  // Reset swipe offsets when ingredient list changes
  useEffect(() => {
    setSwipeOffsets({});
  }, [ingredients.length]);

  // Swipe-to-delete handlers
  const handlePointerStart = (id: string, clientX: number) => {
    swipeRef.current = { id, startX: clientX, startOffset: swipeOffsets[id] || 0 };
    setSwipeOffsets((prev) => {
      const next: Record<string, number> = {};
      Object.keys(prev).forEach((k) => {
        if (k !== id) next[k] = 0;
      });
      next[id] = prev[id] || 0;
      return next;
    });
  };

  const handlePointerMove = (id: string, clientX: number) => {
    if (!swipeRef.current || swipeRef.current.id !== id) return;
    const delta = clientX - swipeRef.current.startX;
    const raw = swipeRef.current.startOffset + delta;
    const clamped = Math.max(-MAX_DRAG, Math.min(0, raw));
    setSwipeOffsets((prev) => ({ ...prev, [id]: clamped }));
  };

  const handlePointerEnd = (id: string, clientX: number) => {
    if (!swipeRef.current || swipeRef.current.id !== id) return;
    const delta = clientX - swipeRef.current.startX;
    const startOffset = swipeRef.current.startOffset;
    const current = swipeOffsets[id] || 0;

    if (current <= DELETE_TRIGGER) {
      animateDelete(id);
    } else if (Math.abs(delta) < 5 && startOffset !== 0) {
      setSwipeOffsets((prev) => ({ ...prev, [id]: 0 }));
    } else {
      const snapped = current < -DELETE_WIDTH / 2 ? -DELETE_WIDTH : 0;
      setSwipeOffsets((prev) => ({ ...prev, [id]: snapped }));
    }
    swipeRef.current = null;
  };

  const animateDelete = (id: string) => {
    onDeleteIngredient?.(id);
    setSwipeOffsets((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  // Container editor helpers
  const openEditor = (item: Ingredient) => {
    setEditingIngredient(item);
    setEditForm({ ...item });
    setHasThreshold(item.hasThreshold ?? true);
  };

  const closeEditor = () => {
    setEditingIngredient(null);
    setEditForm({});
    setHasThreshold(false);
  };

  const startCreate = () => {
    const id =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `ing-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

    const newIngredient: Ingredient = {
      id,
      name: '',
      category: 'Pantry',
      currentQty: 0,
      maxQty: 100,
      unit: 'g',
      percentage: 0,
      status: 'critical',
      freshness: 50,
      spoilageRisk: 'Low',
      lastUpdated: new Date().toISOString(),
      isCustom: true,
      hasThreshold: true,
      color: CONTAINER_COLORS[0],
      icon: CONTAINER_ICONS[0]
    };
    openEditor(newIngredient);
  };

  const saveIngredient = () => {
    if (!editingIngredient) return;
    const currentQty = Number(editForm.currentQty) ?? editingIngredient.currentQty;
    const maxQty = hasThreshold
      ? Number(editForm.maxQty) ?? editingIngredient.maxQty
      : currentQty;
    const safeMaxQty = Math.max(0, maxQty);
    const safeCurrentQty = Math.max(0, hasThreshold ? Math.min(currentQty, safeMaxQty) : currentQty);
    const percentage = hasThreshold && safeMaxQty > 0
      ? Math.round((safeCurrentQty / safeMaxQty) * 100)
      : 100;
    const status: Ingredient['status'] =
      percentage >= 60 ? 'normal' : percentage >= 30 ? 'stable' : 'critical';

    const payload: Ingredient = {
      ...editingIngredient,
      ...editForm,
      currentQty: safeCurrentQty,
      maxQty: safeMaxQty,
      hasThreshold,
      percentage,
      status,
      lastUpdated: new Date().toISOString()
    };

    const isNew = !ingredients.some((i) => i.id === editingIngredient.id);
    if (isNew) {
      onAddIngredient?.(payload);
    } else {
      onUpdateIngredient?.(payload);
    }
    closeEditor();
  };

  const updateField = <K extends keyof Ingredient>(field: K, value: Ingredient[K]) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className={`w-full flex-1 flex flex-col font-sans overflow-y-auto pb-24 transition-colors duration-300 ${
      darkMode ? 'bg-[#121212] text-white' : 'bg-[#fcf9f8] text-[#1c1b1b]'
    }`}>
      {/* Header */}
      <div className={`flex justify-between items-baseline px-6 pt-6 pb-4 border-b transition-colors duration-300 ${
        darkMode ? 'border-neutral-800' : 'border-[#e5e2e1]'
      }`}>
        <div>
          <span className={`text-[10px] uppercase font-mono tracking-wider ${darkMode ? 'text-neutral-400' : 'text-[#6a7a7b]'}`}>{t('home.morningAnalysis')}</span>
          <h2 className="text-xl font-bold tracking-tight">{t('home.kitchenStatus')}</h2>
        </div>
        <div className={`flex items-center ${darkMode ? 'text-[#00f0ff]' : 'text-[#006970]'}`}>
          <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${darkMode ? 'bg-[#00f0ff]' : 'bg-[#006970]'}`} />
        </div>
      </div>

      <div className="px-6 py-4 space-y-4">
        {/* Critical takeaways */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {isDemo ? (
            <>
              {/* Demo: original hardcoded cards */}
              <div className={`p-4 flex gap-3 rounded shadow-sm border transition-colors duration-300 ${
                darkMode ? 'bg-[#ba1a1a]/10 border-red-900/30' : 'bg-[#fff6f5] border-[#ffdad6]'
              }`}>
                <div className={`${darkMode ? 'text-red-400' : 'text-[#ba1a1a]'} shrink-0 mt-0.5`}>
                  <AlertTriangle size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-mono font-semibold tracking-wider px-1.5 py-0.5 rounded ${
                      darkMode ? 'bg-red-950/80 text-red-300 border border-red-900/30' : 'bg-[#ffdad6] text-[#ba1a1a]'
                    }`}>{t('common.status.critical')}</span>
                    <span className="text-xs font-bold">{t('home.demo.flourCritical')}</span>
                  </div>
                  <p className={`text-[11px] mt-1.5 leading-relaxed ${darkMode ? 'text-neutral-300' : 'text-[#3b494b]'}`}>
                    {t('home.demo.flourCriticalDesc')}
                  </p>
                </div>
              </div>

              <div className={`p-4 flex justify-between items-start rounded shadow-sm border transition-colors duration-300 ${
                darkMode ? 'bg-[#00f0ff]/5 border-neutral-800' : 'bg-[#f0f9fa] border-[#b9cacb]/40'
              }`}>
                <div className="flex gap-3">
                  <div className={`${darkMode ? 'text-[#00f0ff]' : 'text-[#006970]'} shrink-0 mt-1`}>
                    <Thermometer size={18} />
                  </div>
                  <div>
                    <span className={`text-[10px] font-mono block ${darkMode ? 'text-neutral-400' : 'text-[#6a7a7b]'}`}>{t('home.demo.pantryTemp')}</span>
                    <h4 className="text-xs font-bold mt-0.5">{t('home.demo.oliveOilSuggested')}</h4>
                    <p className={`text-[11px] leading-tight mt-0.5 ${darkMode ? 'text-neutral-300' : 'text-[#3b494b]'}`}>{t('home.demo.oliveOilSuggestedDesc')}</p>
                  </div>
                </div>
                <span className={`text-[9px] font-mono border px-1.5 py-0.5 rounded font-semibold tracking-wider uppercase ${
                  darkMode
                    ? 'bg-[#00f0ff]/20 text-[#00f0ff] border-[#00f0ff]/30'
                    : 'bg-[#00f0ff]/10 text-[#006970] border border-[#00dbe9]/30'
                }`}>
                  {t('common.status.restock')}
                </span>
              </div>
            </>
          ) : criticalItems.length > 0 ? (
            criticalItems.map((item) => (
              <div
                key={item.id}
                className={`p-4 flex gap-3 rounded shadow-sm border transition-colors duration-300 ${
                  darkMode ? 'bg-[#ba1a1a]/10 border-red-900/30' : 'bg-[#fff6f5] border-[#ffdad6]'
                }`}
              >
                <div className={`${darkMode ? 'text-red-400' : 'text-[#ba1a1a]'} shrink-0 mt-0.5`}>
                  <AlertTriangle size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-mono font-semibold tracking-wider px-1.5 py-0.5 rounded ${
                      darkMode ? 'bg-red-950/80 text-red-300 border border-red-900/30' : 'bg-[#ffdad6] text-[#ba1a1a]'
                    }`}>{t('common.status.critical')}</span>
                    <span className="text-xs font-bold">{item.name}</span>
                  </div>
                  <p className={`text-[11px] mt-1.5 leading-relaxed ${darkMode ? 'text-neutral-300' : 'text-[#3b494b]'}`}>
                    {t('home.itemRemaining', { qty: item.currentQty, unit: item.unit })}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <>
              <div className={`p-4 flex gap-3 rounded shadow-sm border transition-colors duration-300 ${
                darkMode ? 'bg-neutral-900/50 border-neutral-800' : 'bg-[#f3f0ef] border-[#e5e2e1]'
              }`}>
                <div className={`${darkMode ? 'text-neutral-500' : 'text-[#9ca3af]'} shrink-0 mt-0.5`}>
                  <AlertTriangle size={18} />
                </div>
                <div>
                  <span className="text-xs font-bold">{t('home.criticalReports')}</span>
                  <p className={`text-[11px] mt-1.5 leading-relaxed ${darkMode ? 'text-neutral-400' : 'text-[#6a7a7b]'}`}>
                    {t('home.noCriticalReports')}
                  </p>
                </div>
              </div>

              <div className={`p-4 flex gap-3 rounded shadow-sm border transition-colors duration-300 ${
                darkMode ? 'bg-neutral-900/50 border-neutral-800' : 'bg-[#f3f0ef] border-[#e5e2e1]'
              }`}>
                <div className={`${darkMode ? 'text-neutral-500' : 'text-[#9ca3af]'} shrink-0 mt-0.5`}>
                  <Thermometer size={18} />
                </div>
                <div>
                  <span className="text-xs font-bold">{t('home.restockSuggestions')}</span>
                  <p className={`text-[11px] mt-1.5 leading-relaxed ${darkMode ? 'text-neutral-400' : 'text-[#6a7a7b]'}`}>
                    {t('home.noSuggestions')}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Dietary Advice */}
        <div className={`border rounded p-5 relative overflow-hidden transition-colors duration-300 ${
          darkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-[#f3f0ef] border-[#e5e2e1]'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-[10px] font-mono tracking-[0.15em] font-bold uppercase ${
              darkMode ? 'text-[#00f0ff]' : 'text-[#006970]'
            }`}>
              {t('home.dietaryAdvice')}
            </span>
            <button
              onClick={onRefreshAdvice}
              disabled={adviceLoading}
              className={`flex items-center gap-1 text-[10px] font-mono font-semibold transition-colors pointer-events-auto ${
                darkMode ? 'text-[#00f0ff] hover:text-white' : 'text-[#006970] hover:text-[#1c1b1b]'
              } disabled:opacity-50`}
            >
              {adviceLoading ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <RefreshCw size={12} />
              )}
              {t('home.regenerateAdvice')}
            </button>
          </div>
          <p className={`text-sm leading-relaxed max-w-[90%] ${darkMode ? 'text-neutral-200' : 'text-[#1c1b1b]'}`}>
            {adviceLoading && !dietAdvice ? t('home.generatingAdvice') : dietAdvice || t('home.noAdvice')}
          </p>
        </div>

        {/* Consumption Trends & Freshness Score */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Consumption trends */}
          <div className={`border p-5 rounded shadow-sm transition-colors duration-300 ${
            darkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-[#e5e2e1]'
          }`}>
            <span className={`text-[10px] font-mono tracking-wider block mb-3 uppercase ${
              darkMode ? 'text-neutral-400' : 'text-[#6a7a7b]'
            }`}>{t('home.consumptionTrends')}</span>
            {isDemo ? (
              <div className="flex items-end justify-between h-20 pt-4 px-2">
                <div className="flex flex-col items-center gap-1.5 w-full">
                  <div className={`w-7 h-8 rounded-sm transition-colors ${darkMode ? 'bg-[#00f0ff]/15 hover:bg-[#00f0ff]/30' : 'bg-[#00f0ff]/20 hover:bg-[#00f0ff]/40'}`} />
                  <span className={`text-[9px] font-mono ${darkMode ? 'text-neutral-400' : 'text-[#6a7a7b]'}`}>{t('common.days.mon')}</span>
                </div>
                <div className="flex flex-col items-center gap-1.5 w-full">
                  <div className={`w-7 h-12 rounded-sm transition-colors ${darkMode ? 'bg-[#00f0ff]/30 hover:bg-[#00f0ff]/50' : 'bg-[#00f0ff]/40 hover:bg-[#00f0ff]/60'}`} />
                  <span className={`text-[9px] font-mono ${darkMode ? 'text-neutral-400' : 'text-[#6a7a7b]'}`}>{t('common.days.tue')}</span>
                </div>
                <div className="flex flex-col items-center gap-1.5 w-full">
                  <div className={`w-7 h-14 rounded-sm transition-colors ${darkMode ? 'bg-[#00f0ff]/50 hover:bg-[#00f0ff]/70' : 'bg-[#00f0ff]/60 hover:bg-[#00f0ff]/80'}`} />
                  <span className={`text-[9px] font-mono ${darkMode ? 'text-neutral-400' : 'text-[#6a7a7b]'}`}>{t('common.days.wed')}</span>
                </div>
                <div className="flex flex-col items-center gap-1.5 w-full">
                  <div className={`w-7 h-16 rounded-sm transition-colors ${darkMode ? 'bg-[#00f0ff] hover:bg-[#00dbe9]' : 'bg-[#006970] hover:bg-[#005a61]'}`} />
                  <span className={`text-[9px] font-mono ${darkMode ? 'text-neutral-400' : 'text-[#6a7a7b]'}`}>{t('common.days.thu')}</span>
                </div>
              </div>
            ) : (
              <div className={`flex items-center justify-center h-20 rounded ${darkMode ? 'bg-neutral-950/50' : 'bg-[#fcf9f8]'}`}>
                <span className={`text-[11px] ${darkMode ? 'text-neutral-500' : 'text-[#9ca3af]'}`}>
                  {t('home.noTrendData')}
                </span>
              </div>
            )}
          </div>

          {/* Freshness Score */}
          <div className={`border p-5 rounded shadow-sm flex items-center gap-5 transition-colors duration-300 ${
            darkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-[#e5e2e1]'
          }`}>
            <div className="relative shrink-0 w-16 h-16 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="32" cy="32" r="28" fill="transparent" stroke={darkMode ? '#262626' : '#ebe7e7'} strokeWidth="4" />
                <circle cx="32" cy="32" r="28" fill="transparent" stroke={darkMode ? '#a78bfa' : '#5400c3'} strokeWidth="4"
                  strokeDasharray={175} strokeDashoffset={175 - (175 * averageFreshness) / 100}
                  strokeLinecap="round" className="transition-all duration-1000" />
              </svg>
              <span className={`absolute text-sm font-mono font-bold ${darkMode ? 'text-[#a78bfa]' : 'text-[#5400c3]'}`}>{averageFreshness}%</span>
            </div>
            <div>
              <h4 className="text-xs font-bold">{t('home.freshnessScore')}</h4>
              <p className={`text-[11px] leading-relaxed mt-1 ${darkMode ? 'text-neutral-300' : 'text-[#3b494b]'}`}>
                {t('home.freshnessScoreDesc')}
              </p>
            </div>
          </div>
        </div>

        {/* Containers configuration */}
        <div className={`border rounded p-5 shadow-sm transition-colors duration-300 ${
          darkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-[#e5e2e1]'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-xs font-mono tracking-wider uppercase ${darkMode ? 'text-neutral-400' : 'text-[#6a7a7b]'}`}>
              {t('home.containers')}
            </h3>
            <button
              onClick={startCreate}
              className={`flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-1 rounded transition-colors pointer-events-auto ${
                darkMode
                  ? 'bg-[#00f0ff]/10 text-[#00f0ff] hover:bg-[#00f0ff]/20'
                  : 'bg-[#006970]/10 text-[#006970] hover:bg-[#006970]/20'
              }`}
            >
              <Plus size={12} />
              {t('home.addContainer')}
            </button>
          </div>
          {ingredients.length > 0 ? (
            <div className="flex flex-col gap-3">
              <AnimatePresence mode="popLayout" initial={false}>
                {ingredients.map((item) => {
                  const offset = swipeOffsets[item.id] || 0;
                  const bgWidth = offset < 0 ? Math.min(-offset, MAX_DRAG) : 0;
                  return (
                    <motion.div
                      key={item.id}
                      layout
                      initial={false}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: '-100%' }}
                      transition={{ duration: 0.3, ease: 'easeOut' }}
                      className="relative overflow-hidden rounded"
                    >
                      {/* Delete background */}
                      <button
                        onClick={() => animateDelete(item.id)}
                        className={`absolute inset-y-0 right-0 flex items-center justify-center text-white ${
                          darkMode ? 'bg-red-900/80' : 'bg-[#ba1a1a]'
                        }`}
                        style={{
                          width: `${bgWidth}px`,
                          transition: swipeRef.current?.id === item.id ? 'none' : 'width 200ms ease-out'
                        }}
                        aria-label={t('inventory.deleteRefill')}
                      >
                        <Trash2 size={18} />
                      </button>

                      {/* Swipeable card */}
                      <div
                        className={`relative flex items-center justify-between gap-4 p-3 rounded cursor-pointer pointer-events-auto touch-pan-y border-l-4 ${
                          darkMode ? 'bg-neutral-800' : 'bg-[#f3f0ef]'
                        }`}
                        style={{
                          transform: `translateX(${offset}px)`,
                          transition: swipeRef.current?.id === item.id ? 'none' : 'transform 200ms ease-out',
                          borderLeftColor: item.color || CONTAINER_COLORS[0]
                        }}
                        onPointerDown={(e) => {
                          e.currentTarget.setPointerCapture(e.pointerId);
                          pointerMoved.current = false;
                          handlePointerStart(item.id, e.clientX);
                        }}
                        onPointerMove={(e) => {
                          if (swipeRef.current && swipeRef.current.id === item.id) {
                            const delta = Math.abs(e.clientX - swipeRef.current.startX);
                            if (delta > 5) pointerMoved.current = true;
                          }
                          handlePointerMove(item.id, e.clientX);
                        }}
                        onPointerUp={(e) => handlePointerEnd(item.id, e.clientX)}
                        onPointerLeave={(e) => handlePointerEnd(item.id, e.clientX)}
                        onClick={() => {
                          if (pointerMoved.current) {
                            pointerMoved.current = false;
                            return;
                          }
                          if ((swipeOffsets[item.id] || 0) === 0) openEditor(item);
                        }}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className="w-8 h-8 rounded flex items-center justify-center text-lg shrink-0"
                            style={{ backgroundColor: hexAlpha(item.color || CONTAINER_COLORS[0], darkMode ? '30' : '45') }}
                          >
                            {item.icon || CONTAINER_ICONS[0]}
                          </div>
                          <div className="min-w-0">
                            <h5 className="text-xs font-bold truncate">{item.name}</h5>
                            <span className={`text-[10px] ${darkMode ? 'text-neutral-400' : 'text-[#6a7a7b]'}`}>
                              {t('home.itemRemaining', { qty: item.currentQty, unit: item.unit })}
                              {item.maxQty > item.currentQty ? ` / ${item.maxQty}${item.unit}` : ''}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <div className={`w-24 h-1.5 rounded-full overflow-hidden ${darkMode ? 'bg-neutral-700' : 'bg-[#e5e2e1]'}`}>
                            <div
                              className={`h-full ${item.status === 'critical' ? 'bg-red-500' : darkMode ? 'bg-[#00f0ff]' : 'bg-[#006970]'}`}
                              style={{ width: `${Math.min(100, item.percentage)}%` }}
                            />
                          </div>
                          <span className="text-[11px] font-mono min-w-[28px] text-right">
                            {item.percentage}%
                          </span>
                          <Edit3 size={12} className={`${darkMode ? 'text-neutral-500' : 'text-[#9ca3af]'}`} />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          ) : (
            <div className={`flex items-center justify-center h-20 rounded ${darkMode ? 'bg-neutral-950/50' : 'bg-[#fcf9f8]'}`}>
              <span className={`text-[11px] ${darkMode ? 'text-neutral-500' : 'text-[#9ca3af]'}`}>
                {t('home.noUsageData')}
              </span>
            </div>
          )}
        </div>

        {/* Recent Ingredient Usage */}
        <div className={`border rounded p-5 shadow-sm transition-colors duration-300 ${
          darkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-[#e5e2e1]'
        }`}>
          <h3 className={`text-xs font-mono tracking-wider mb-4 uppercase ${darkMode ? 'text-neutral-400' : 'text-[#6a7a7b]'}`}>{t('home.recentIngredientUsage')}</h3>
          {isDemo ? (
            <div className="space-y-4">
              {/* Eggs Slider */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded flex items-center justify-center text-lg ${darkMode ? 'bg-neutral-800' : 'bg-[#f0edec]'}`}>
                    🥚
                  </div>
                  <div>
                    <h5 className="text-xs font-bold">{t('home.demoEggs.name')}</h5>
                    <span className={`text-[10px] ${darkMode ? 'text-neutral-400' : 'text-[#6a7a7b]'}`}>{t('home.demoEggs.detail')}</span>
                  </div>
                </div>
                <div className="w-32 flex items-center gap-2">
                  <div className={`flex-1 h-1.5 rounded-full overflow-hidden ${darkMode ? 'bg-neutral-850' : 'bg-[#f0edec]'}`}>
                    <div className={`h-full ${darkMode ? 'bg-[#00f0ff]' : 'bg-[#006970]'}`} style={{ width: `${eggsItem.percentage}%` }} />
                  </div>
                  <span className="text-[11px] font-mono min-w-[24px] text-right">
                    {eggsItem.percentage}%
                  </span>
                </div>
              </div>

              {/* Rice Slider */}
              <div className={`flex items-center justify-between gap-4 border-t pt-3 ${darkMode ? 'border-neutral-800' : 'border-[#f0edec]'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded flex items-center justify-center text-lg ${darkMode ? 'bg-neutral-800' : 'bg-[#f0edec]'}`}>
                    🌾
                  </div>
                  <div>
                    <h5 className="text-xs font-bold">{t('home.demoRice.name')}</h5>
                    <span className={`text-[10px] ${darkMode ? 'text-neutral-400' : 'text-[#6a7a7b]'}`}>{t('home.demoRice.detail')}</span>
                  </div>
                </div>
                <div className="w-32 flex items-center gap-2">
                  <div className={`flex-1 h-1.5 rounded-full overflow-hidden ${darkMode ? 'bg-neutral-850' : 'bg-[#f0edec]'}`}>
                    <div className={`h-full ${darkMode ? 'bg-[#00f0ff]' : 'bg-[#006970]'}`} style={{ width: `${riceItem.percentage}%` }} />
                  </div>
                  <span className="text-[11px] font-mono min-w-[24px] text-right">
                    {riceItem.percentage}%
                  </span>
                </div>
              </div>
            </div>
          ) : ingredients.length > 0 ? (
            <div className="space-y-4">
              {ingredients.slice(0, 5).map((item, idx) => (
                <div
                  key={item.id}
                  className={`flex items-center justify-between gap-4 ${idx !== 0 ? `border-t pt-3 ${darkMode ? 'border-neutral-800' : 'border-[#f0edec]'}` : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded flex items-center justify-center text-lg ${darkMode ? 'bg-neutral-800' : 'bg-[#f0edec]'}`}>
                      {item.category === 'Fridge' ? '🧊' : '🥫'}
                    </div>
                    <div>
                      <h5 className="text-xs font-bold">{item.name}</h5>
                      <span className={`text-[10px] ${darkMode ? 'text-neutral-400' : 'text-[#6a7a7b]'}`}>
                        {t('home.itemRemaining', { qty: item.currentQty, unit: item.unit })}
                      </span>
                    </div>
                  </div>
                  <div className="w-32 flex items-center gap-2">
                    <div className={`flex-1 h-1.5 rounded-full overflow-hidden ${darkMode ? 'bg-neutral-850' : 'bg-[#f0edec]'}`}>
                      <div className={`h-full ${darkMode ? 'bg-[#00f0ff]' : 'bg-[#006970]'}`} style={{ width: `${item.percentage}%` }} />
                    </div>
                    <span className="text-[11px] font-mono min-w-[24px] text-right">
                      {item.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={`flex items-center justify-center h-20 rounded ${darkMode ? 'bg-neutral-950/50' : 'bg-[#fcf9f8]'}`}>
              <span className={`text-[11px] ${darkMode ? 'text-neutral-500' : 'text-[#9ca3af]'}`}>
                {t('home.noUsageData')}
              </span>
            </div>
          )}
        </div>

        {/* Camera CTA */}
        <div
          onClick={() => onNavigateToTab('analyze')}
          className={`transition-all duration-300 cursor-pointer rounded p-3 text-center text-xs font-mono font-medium flex items-center justify-center gap-2 ${
            darkMode
              ? 'bg-neutral-800 text-white hover:bg-neutral-700'
              : 'bg-[#ebe7e7] hover:bg-[#dcd9d9] text-[#1c1b1b]'
          }`}
        >
          <span>{t('home.cameraCta')}</span>
          <ChevronRight size={12} />
        </div>
      </div>

      {/* Full-screen container editor */}
      {editingIngredient && (
        <div className={`fixed inset-0 z-50 flex flex-col transition-colors duration-300 ${
          darkMode ? 'bg-[#121212] text-white' : 'bg-[#fcf9f8] text-[#1c1b1b]'
        }`}>
          {/* Editor header */}
          <div className={`flex items-center justify-between px-4 py-3 border-b ${
            darkMode ? 'border-neutral-800' : 'border-[#e5e2e1]'
          }`}>
            <button
              onClick={closeEditor}
              className="flex items-center gap-1 text-xs font-mono hover:text-[#00f0ff] transition-colors pointer-events-auto"
            >
              <ChevronLeft size={18} />
              {t('home.cancel')}
            </button>
            <h3 className="text-sm font-mono font-bold tracking-wider uppercase">
              {t('home.containerSettings')}
            </h3>
            <button
              onClick={() => {
                if (window.confirm(t('home.deleteContainerConfirm', { name: editForm.name }))) {
                  onDeleteIngredient?.(editingIngredient.id);
                  closeEditor();
                }
              }}
              className="p-2 text-red-500 hover:text-red-400 transition-colors pointer-events-auto"
            >
              <Trash2 size={18} />
            </button>
          </div>

          {/* Editor form */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            <div>
              <label className={`block text-[10px] font-mono uppercase mb-1 ${darkMode ? 'text-neutral-400' : 'text-[#6a7a7b]'}`}>
                {t('home.containerName')}
              </label>
              <input
                type="text"
                value={editForm.name || ''}
                onChange={(e) => updateField('name', e.target.value)}
                className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:border-[#00f0ff] transition-colors ${
                  darkMode ? 'bg-neutral-900 border-neutral-700 text-white' : 'bg-white border-[#e5e2e1] text-[#1c1b1b]'
                }`}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-[10px] font-mono uppercase mb-1 ${darkMode ? 'text-neutral-400' : 'text-[#6a7a7b]'}`}>
                  {t('home.currentQty')}
                </label>
                <input
                  type="number"
                  min={0}
                  value={editForm.currentQty ?? 0}
                  onChange={(e) => updateField('currentQty', parseFloat(e.target.value) || 0)}
                  className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:border-[#00f0ff] transition-colors ${
                    darkMode ? 'bg-neutral-900 border-neutral-700 text-white' : 'bg-white border-[#e5e2e1] text-[#1c1b1b]'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-[10px] font-mono uppercase mb-1 ${darkMode ? 'text-neutral-400' : 'text-[#6a7a7b]'}`}>
                  {t('analyze.labelUnit')}
                </label>
                <select
                  value={editForm.unit || 'g'}
                  onChange={(e) => updateField('unit', e.target.value)}
                  className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:border-[#00f0ff] transition-colors ${
                    darkMode ? 'bg-neutral-900 border-neutral-700 text-white' : 'bg-white border-[#e5e2e1] text-[#1c1b1b]'
                  }`}
                >
                  <option value="g">g</option>
                  <option value="ml">ml</option>
                  <option value="pcs">pcs</option>
                  <option value="%">%</option>
                </select>
              </div>
            </div>

            {/* Threshold toggle */}
            <div className={`border rounded p-4 space-y-4 ${darkMode ? 'border-neutral-800 bg-neutral-900/50' : 'border-[#e5e2e1] bg-[#f3f0ef]'}`}>
              <label className="inline-flex items-center cursor-pointer pointer-events-auto">
                <input
                  type="checkbox"
                  checked={hasThreshold}
                  onChange={(e) => {
                    const enabled = e.target.checked;
                    setHasThreshold(enabled);
                    if (!enabled) {
                      updateField('maxQty', editForm.currentQty ?? 0);
                    }
                  }}
                  className="sr-only peer"
                />
                <div className="relative w-9 h-5 bg-neutral-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#00f0ff]" />
                <span className={`ml-2 text-xs font-mono ${darkMode ? 'text-neutral-300' : 'text-[#3b494b]'}`}>
                  {t('home.setCapacityThreshold')}
                </span>
              </label>

              {hasThreshold && (
                <div>
                  <label className={`block text-[10px] font-mono uppercase mb-1 ${darkMode ? 'text-neutral-400' : 'text-[#6a7a7b]'}`}>
                    {t('home.maxQty')}
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={editForm.maxQty ?? 0}
                    onChange={(e) => updateField('maxQty', parseFloat(e.target.value) || 0)}
                    className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:border-[#00f0ff] transition-colors ${
                      darkMode ? 'bg-neutral-900 border-neutral-700 text-white' : 'bg-white border-[#e5e2e1] text-[#1c1b1b]'
                    }`}
                  />
                </div>
              )}
            </div>

            <div>
              <label className={`block text-[10px] font-mono uppercase mb-1 ${darkMode ? 'text-neutral-400' : 'text-[#6a7a7b]'}`}>
                {t('analyze.labelCategory')}
              </label>
              <input
                type="text"
                value={editForm.category || ''}
                onChange={(e) => updateField('category', e.target.value)}
                className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:border-[#00f0ff] transition-colors ${
                  darkMode ? 'bg-neutral-900 border-neutral-700 text-white' : 'bg-white border-[#e5e2e1] text-[#1c1b1b]'
                }`}
              />
            </div>

            {/* Color picker */}
            <div>
              <label className={`block text-[10px] font-mono uppercase mb-2 ${darkMode ? 'text-neutral-400' : 'text-[#6a7a7b]'}`}>
                {t('home.color')}
              </label>
              <div className="flex flex-wrap gap-2">
                {CONTAINER_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => updateField('color', color)}
                    className={`w-8 h-8 rounded-full border-2 transition-transform pointer-events-auto ${
                      editForm.color === color ? 'scale-110 border-[#1c1b1b] dark:border-white' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color }}
                    aria-label={color}
                  />
                ))}
              </div>
            </div>

            {/* Icon picker */}
            <div>
              <label className={`block text-[10px] font-mono uppercase mb-2 ${darkMode ? 'text-neutral-400' : 'text-[#6a7a7b]'}`}>
                {t('home.icon')}
              </label>
              <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-1">
                {CONTAINER_ICONS.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => updateField('icon', icon)}
                    className={`w-9 h-9 rounded text-lg flex items-center justify-center transition-colors pointer-events-auto ${
                      editForm.icon === icon
                        ? darkMode
                          ? 'bg-neutral-700 border border-[#00f0ff]'
                          : 'bg-[#e5e2e1] border border-[#006970]'
                        : darkMode
                          ? 'bg-neutral-800 hover:bg-neutral-700'
                          : 'bg-[#f3f0ef] hover:bg-[#e5e2e1]'
                    }`}
                    aria-label={icon}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className={`block text-[10px] font-mono uppercase mb-1 ${darkMode ? 'text-neutral-400' : 'text-[#6a7a7b]'}`}>
                {t('home.freshness')}
              </label>
              <input
                type="range"
                min={0}
                max={100}
                value={editForm.freshness ?? 100}
                onChange={(e) => updateField('freshness', parseInt(e.target.value, 10))}
                className="w-full"
              />
              <div className="text-right text-xs font-mono mt-1">{editForm.freshness ?? 100}%</div>
            </div>

            <div>
              <label className={`block text-[10px] font-mono uppercase mb-1 ${darkMode ? 'text-neutral-400' : 'text-[#6a7a7b]'}`}>
                {t('home.spoilageRisk')}
              </label>
              <select
                value={editForm.spoilageRisk || 'Low'}
                onChange={(e) => updateField('spoilageRisk', e.target.value as Ingredient['spoilageRisk'])}
                className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:border-[#00f0ff] transition-colors ${
                  darkMode ? 'bg-neutral-900 border-neutral-700 text-white' : 'bg-white border-[#e5e2e1] text-[#1c1b1b]'
                }`}
              >
                <option value="Low">{t('common.risk.low')}</option>
                <option value="Medium">{t('common.risk.medium')}</option>
                <option value="High">{t('common.risk.high')}</option>
              </select>
            </div>
          </div>

          {/* Save button */}
          <div className={`p-4 border-t ${darkMode ? 'border-neutral-800' : 'border-[#e5e2e1]'}`}>
            <button
              onClick={saveIngredient}
              className={`w-full py-3 rounded text-xs font-mono font-bold tracking-wider uppercase transition-colors ${
                darkMode ? 'bg-[#00f0ff] text-black hover:bg-[#00dbe9]' : 'bg-[#1c1b1b] text-[#fcf9f8] hover:bg-black'
              }`}
            >
              {t('home.save')}
            </button>
          </div>
        </div>
      )}

      {/* Plan Details Modal - demo only */}
      {isDemo && showPlanModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
          <div className={`border w-full max-w-sm rounded p-6 shadow-xl transition-colors duration-300 ${
            darkMode ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-[#fcf9f8] border-[#e5e2e1] text-[#1c1b1b]'
          }`}>
            <h3 className={`text-sm font-mono tracking-wider font-bold uppercase mb-1 ${
              darkMode ? 'text-[#00f0ff]' : 'text-[#006970]'
            }`}>{t('home.planModal.title')}</h3>
            <h4 className="text-base font-bold mb-4">{t('home.planModal.subtitle')}</h4>

            <p className={`text-xs leading-relaxed mb-4 ${darkMode ? 'text-neutral-300' : 'text-[#3b494b]'}`}>
              {t('home.planModal.intro')}
            </p>

            <div className={`border rounded p-3 space-y-2 mb-4 text-xs ${
              darkMode ? 'bg-neutral-950 border-neutral-800' : 'bg-white border-[#e5e2e1]'
            }`}>
              <div className={`flex justify-between border-b pb-1.5 ${darkMode ? 'border-neutral-850' : 'border-[#f0edec]'}`}>
                <span className="font-semibold">{t('home.planModal.breakfast')}</span>
                <span className={darkMode ? 'text-neutral-400' : 'text-[#6a7a7b]'}>{t('home.planModal.breakfastValue')}</span>
              </div>
              <div className={`flex justify-between border-b pb-1.5 ${darkMode ? 'border-neutral-850' : 'border-[#f0edec]'}`}>
                <span className="font-semibold">{t('home.planModal.lunch')}</span>
                <span className={darkMode ? 'text-neutral-400' : 'text-[#6a7a7b]'}>{t('home.planModal.lunchValue')}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">{t('home.planModal.nutrients')}</span>
                <span className={`font-semibold ${darkMode ? 'text-[#00f0ff]' : 'text-[#006970]'}`}>{t('home.planModal.nutrientsValue')}</span>
              </div>
            </div>

            <p className={`text-[11px] leading-relaxed italic mb-4 ${darkMode ? 'text-neutral-400' : 'text-[#6a7a7b]'}`}>
              {t('home.planModal.footnote')}
            </p>

            <button
              onClick={() => setShowPlanModal(false)}
              className={`w-full py-2.5 text-xs font-mono font-semibold tracking-wider transition-all ${
                darkMode ? 'bg-[#00f0ff] text-black hover:bg-[#00dbe9]' : 'bg-[#1c1b1b] text-[#fcf9f8] hover:bg-black'
              }`}
            >
              {t('home.planModal.close')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
