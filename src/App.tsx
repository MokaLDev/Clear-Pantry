import React, { useEffect, useRef, useState } from 'react';
import { UserConfig, User, KitchenData, Ingredient, RefillRecord, DetectedRefill, DetectedIngredient } from './types';
import { INITIAL_INGREDIENTS, INITIAL_REFILLS, DIETARY_ADVICE_POOL } from './data/defaultIngredients';
import WelcomeScreen from './components/WelcomeScreen';
import LoginScreen from './components/LoginScreen';
import HomeScreen from './components/HomeScreen';
import AnalyzeScreen from './components/AnalyzeScreen';
import InventoryScreen from './components/InventoryScreen';
import SettingsScreen from './components/SettingsScreen';
import { Home, Camera, LayoutGrid, Settings } from 'lucide-react';
import { I18nProvider, translate } from './i18n';
import type { Language } from './i18n';

const DEMO_USER_ID = 'user-001';
const SUPPORTED_LANGUAGES: Language[] = ['en', 'zh', 'es'];

function normalizeLanguage(lang: string): Language {
  const legacyMap: Record<string, Language> = {
    'English (US)': 'en',
    'Spanish (ES)': 'es',
    'Chinese (ZH)': 'zh',
    'German (DE)': 'en',
    'French (FR)': 'en'
  };
  if (legacyMap[lang]) return legacyMap[lang];
  if (SUPPORTED_LANGUAGES.includes(lang as Language)) return lang as Language;
  return 'en';
}

const DEFAULT_KITCHEN: KitchenData = {
  ingredients: [],
  refills: [],
  config: {
    darkMode: false,
    language: 'en',
    reportGenerationLogic: 'Prioritize high-protein ingredients and list expiration dates in DD/MM/YYYY format...'
  }
};

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('clearpantry_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [currentTab, setCurrentTab] = useState<string>(() => {
    return localStorage.getItem('clearpantry_tab') || 'home';
  });

  const [account, setAccount] = useState<{ user: User; kitchen: KitchenData; seenWelcome: boolean } | null>(null);
  const [loadingAccount, setLoadingAccount] = useState(false);
  const initialSaveSkipped = useRef(false);

  const ingredients = account?.kitchen.ingredients ?? [];
  const refills = account?.kitchen.refills ?? [];
  const config = account?.kitchen.config ?? DEFAULT_KITCHEN.config;

  const [dietAdvice, setDietAdvice] = useState<string>('');

  // Persist current user & tab to localStorage.
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('clearpantry_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('clearpantry_current_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('clearpantry_tab', currentTab);
  }, [currentTab]);

  // Load account kitchen data when user logs in / refreshes.
  useEffect(() => {
    if (!currentUser) {
      setAccount(null);
      return;
    }

    let cancelled = false;
    setLoadingAccount(true);
    fetch(`/api/account/${currentUser.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (data.success) {
          const normalizedKitchen = {
            ...data.kitchen,
            config: {
              ...data.kitchen.config,
              language: normalizeLanguage(data.kitchen.config.language || 'en')
            }
          };
          setAccount({
            user: currentUser,
            kitchen: normalizedKitchen,
            seenWelcome: data.seenWelcome
          });
        }
      })
      .catch((err) => {
        if (!cancelled) console.error('Failed to load account', err);
      })
      .finally(() => {
        if (!cancelled) setLoadingAccount(false);
      });

    return () => {
      cancelled = true;
    };
  }, [currentUser]);

  const [dietAdviceLoading, setDietAdviceLoading] = useState(false);

  const fallbackAdvice = () => {
    const lang = normalizeLanguage(config.language);
    const pool = [
      translate(lang, 'dietAdvice.greens'),
      translate(lang, 'dietAdvice.spoilage'),
      translate(lang, 'dietAdvice.highProtein'),
      translate(lang, 'dietAdvice.lowStock')
    ];
    return pool[Math.floor(Math.random() * pool.length)];
  };

  const ADVICE_FOCUSES = ['balanced', 'high-protein', 'quick-meal', 'freshness', 'low-stock', 'zero-waste', 'fiber'];

  const generateDietAdvice = async () => {
    if (!currentUser) return;
    setDietAdviceLoading(true);
    try {
      const focus = ADVICE_FOCUSES[Math.floor(Math.random() * ADVICE_FOCUSES.length)];
      const res = await fetch(`/api/diet-advice/${currentUser.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredients, language: config.language, focus })
      });
      const data = await res.json();
      if (data.success && data.advice) {
        setDietAdvice(data.advice);
      } else {
        setDietAdvice(fallbackAdvice());
      }
    } catch (err) {
      console.error('Failed to generate diet advice:', err);
      setDietAdvice(fallbackAdvice());
    } finally {
      setDietAdviceLoading(false);
    }
  };

  // Generate advice when the user/account first loads or language changes.
  useEffect(() => {
    if (!account) return;
    generateDietAdvice();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account?.user.id, config.language]);

  // Persist kitchen changes to the server (except for the demo account).
  useEffect(() => {
    if (!account) return;
    if (!initialSaveSkipped.current) {
      initialSaveSkipped.current = true;
      return;
    }
    if (account.user.id === DEMO_USER_ID) return;

    fetch(`/api/account/${account.user.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kitchen: account.kitchen })
    }).catch((err) => console.error('Failed to save kitchen', err));
  }, [account?.kitchen]);

  const updateKitchen = (updater: (prev: KitchenData) => KitchenData) => {
    setAccount((prev) => {
      if (!prev) return null;
      return { ...prev, kitchen: updater(prev.kitchen) };
    });
  };

  // Handler: Delete a refill log entry
  const handleDeleteRefill = (id: string) => {
    updateKitchen((prev) => ({
      ...prev,
      refills: prev.refills.filter((r) => r.id !== id)
    }));
  };

  // Handler: Update an existing ingredient container
  const handleUpdateIngredient = (updated: Ingredient) => {
    updateKitchen((prev) => {
      const hasThreshold = updated.hasThreshold !== false;
      const maxQty = hasThreshold ? updated.maxQty : updated.currentQty;
      const percentage = hasThreshold && maxQty > 0
        ? Math.round((updated.currentQty / maxQty) * 100)
        : 100;
      const status = deriveStatusFromPercentage(percentage);
      return {
        ...prev,
        ingredients: prev.ingredients.map((item) =>
          item.id === updated.id
            ? { ...updated, maxQty, percentage, status, lastUpdated: new Date().toISOString() }
            : item
        )
      };
    });
  };

  // Handler: Delete an ingredient container
  const handleDeleteIngredient = (id: string) => {
    updateKitchen((prev) => ({
      ...prev,
      ingredients: prev.ingredients.filter((i) => i.id !== id)
    }));
  };

  // Handler: Add a new ingredient container
  const handleAddIngredient = (ingredient: Ingredient) => {
    updateKitchen((prev) => ({
      ...prev,
      ingredients: [...prev.ingredients, ingredient]
    }));
  };

  // Handler: Manual restock logging from Dashboard
  const handleManualRefill = (ingredientId: string, qty: string, notes = '') => {
    updateKitchen((prev) => {
      const match = prev.ingredients.find((i) => i.id === ingredientId);
      const parsedQty = parseFloat(qty.replace(/^\+/, '')) || 0;
      const unitMatch = qty.match(/[a-zA-Z%]+$/);
      const unit = unitMatch ? unitMatch[0] : (match?.unit || 'g');
      const now = new Date().toISOString();

      const updatedIngredients = match
        ? prev.ingredients.map((item) => {
            if (item.id !== match.id) return item;
            const hasThreshold = item.hasThreshold !== false;
            const newQty = hasThreshold
              ? Math.min(item.maxQty, item.currentQty + parsedQty)
              : item.currentQty + parsedQty;
            const newMaxQty = hasThreshold ? item.maxQty : newQty;
            const percentage = hasThreshold && newMaxQty > 0
              ? Math.round((newQty / newMaxQty) * 100)
              : 100;
            return {
              ...item,
              currentQty: newQty,
              maxQty: newMaxQty,
              unit,
              percentage,
              status: deriveStatusFromPercentage(percentage),
              lastUpdated: now
            };
          })
        : prev.ingredients;

      const newRecord: RefillRecord = {
        id: `refill-manual-${Date.now()}`,
        ingredientId: match?.id,
        ingredientName: match?.name || '',
        notes,
        qtyAdded: `+${parsedQty}${unit}`,
        method: 'MANUAL' as const,
        confidence: 100,
        timestamp: 'Just now'
      };

      return {
        ...prev,
        ingredients: updatedIngredients,
        refills: [newRecord, ...prev.refills]
      };
    });
  };

  const deriveStatusFromPercentage = (percentage: number): Ingredient['status'] => {
    if (percentage >= 60) return 'normal';
    if (percentage >= 30) return 'stable';
    return 'critical';
  };

  const handleApplyDetections = (payload: {
    refills?: DetectedRefill[];
    ingredients?: DetectedIngredient[];
  }) => {
    updateKitchen((prev) => {
      const now = new Date().toISOString();
      let ingredients = [...prev.ingredients];
      const refills = [...prev.refills];

      (payload.refills || []).forEach((detection, index) => {
        const name = detection.ingredientName.trim();
        const unit = detection.unit || 'g';
        const qty = Math.max(0, Number(detection.quantity) || 0);
        const match = ingredients.find((i) => i.name.toLowerCase() === name.toLowerCase());

        let matchedIngredientId: string | undefined;
        if (match) {
          const hasThreshold = match.hasThreshold !== false;
          const newQty = hasThreshold
            ? Math.min(match.maxQty, match.currentQty + qty)
            : match.currentQty + qty;
          const newMaxQty = hasThreshold ? match.maxQty : newQty;
          const percentage = hasThreshold && newMaxQty > 0
            ? Math.round((newQty / newMaxQty) * 100)
            : 100;
          ingredients = ingredients.map((item) =>
            item.id === match.id
              ? {
                  ...item,
                  currentQty: newQty,
                  maxQty: newMaxQty,
                  percentage,
                  status: deriveStatusFromPercentage(percentage),
                  lastUpdated: now
                }
              : item
          );
          matchedIngredientId = match.id;
        } else {
          const hasThreshold = detection.hasThreshold === true;
          const id = `ing-ai-${Date.now()}-${index}`;
          matchedIngredientId = id;
          ingredients.unshift({
            id,
            name,
            category: detection.category || 'Pantry',
            currentQty: qty,
            maxQty: hasThreshold ? (detection.maxQty ?? qty) : qty,
            unit,
            hasThreshold,
            percentage: 100,
            status: 'normal',
            freshness: 100,
            spoilageRisk: 'Low',
            lastUpdated: now,
            isCustom: true
          });
        }

        refills.unshift({
          id: `refill-ai-${Date.now()}-${index}`,
          ingredientId: matchedIngredientId,
          ingredientName: name,
          notes: '',
          qtyAdded: `+${qty}${unit}`,
          method: 'OPTICAL AI',
          confidence: typeof detection.confidence === 'number' ? detection.confidence : 90,
          timestamp: 'Just now'
        });
      });

      (payload.ingredients || []).forEach((detection, index) => {
        const name = detection.name.trim();
        if (ingredients.some((i) => i.name.toLowerCase() === name.toLowerCase())) return;

        ingredients.unshift({
          id: `ing-detected-${Date.now()}-${index}`,
          name,
          category: detection.category || 'Pantry',
          currentQty: Math.max(0, Number(detection.currentQty) || 0),
          maxQty: Math.max(0, Number(detection.maxQty) || Number(detection.currentQty) || 0),
          unit: detection.unit || 'g',
          percentage: 100,
          status: 'normal',
          freshness: typeof detection.freshness === 'number' ? detection.freshness : 100,
          spoilageRisk: detection.spoilageRisk || 'Low',
          lastUpdated: now,
          isCustom: true
        });
      });

      return { ...prev, ingredients, refills };
    });
  };

  // Reset kitchen to the canonical example data.
  // For non-demo accounts this persists; for demo it only lasts the session.
  const handleResetData = () => {
    updateKitchen((prev) => ({
      ...prev,
      ingredients: INITIAL_INGREDIENTS,
      refills: INITIAL_REFILLS,
      config: DEFAULT_KITCHEN.config
    }));
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setAccount(null);
    setCurrentTab('home');
    initialSaveSkipped.current = false;
    localStorage.removeItem('clearpantry_current_user');
    localStorage.removeItem('clearpantry_tab');
  };

  const handleDeleteAccount = async () => {
    if (!currentUser) return;
    try {
      await fetch(`/api/account/${currentUser.id}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Failed to delete account', err);
    }
    handleLogout();
  };

  const handleRefreshAdvice = () => {
    generateDietAdvice();
  };

  const handleUpdateConfig = (newConfig: Partial<UserConfig>) => {
    updateKitchen((prev) => ({
      ...prev,
      config: { ...prev.config, ...newConfig }
    }));
  };

  const handleStart = async () => {
    if (!account) return;
    await fetch(`/api/account/${account.user.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ seenWelcome: true })
    });
    setAccount((prev) => (prev ? { ...prev, seenWelcome: true } : null));
  };

  const getTabButtonClass = (tab: string) => {
    const isActive = currentTab === tab;
    const isNavBarDark = config.darkMode || currentTab === 'analyze';

    if (isActive) {
      return isNavBarDark ? 'text-[#00f0ff] scale-110 font-bold' : 'text-[#006970] scale-110 font-bold';
    }
    return isNavBarDark
      ? 'text-neutral-400 hover:text-white transition-colors duration-200'
      : 'text-[#6a7a7b] hover:text-[#1c1b1b] transition-colors duration-200';
  };

  const renderTabContent = () => {
    switch (currentTab) {
      case 'home':
        return (
          <HomeScreen
            ingredients={ingredients}
            refills={refills}
            dietAdvice={dietAdvice}
            onRefreshAdvice={handleRefreshAdvice}
            onNavigateToTab={(tab) => setCurrentTab(tab)}
            darkMode={config.darkMode}
            isDemo={currentUser?.id === DEMO_USER_ID}
            adviceLoading={dietAdviceLoading}
            onUpdateIngredient={handleUpdateIngredient}
            onDeleteIngredient={handleDeleteIngredient}
            onAddIngredient={handleAddIngredient}
          />
        );
      case 'analyze':
        return (
          <AnalyzeScreen
            user={currentUser}
            isDemo={currentUser?.id === DEMO_USER_ID}
            ingredients={ingredients}
            refills={refills}
            onApplyDetections={handleApplyDetections}
          />
        );
      case 'inventory':
        return (
          <InventoryScreen
            ingredients={ingredients}
            refills={refills}
            onManualRefill={handleManualRefill}
            onDeleteRefill={handleDeleteRefill}
            darkMode={config.darkMode}
            isDemo={currentUser?.id === DEMO_USER_ID}
          />
        );
      case 'settings':
        return (
          <SettingsScreen
            config={config}
            user={currentUser}
            onUpdateConfig={handleUpdateConfig}
            onResetData={handleResetData}
            onLogout={handleLogout}
            onDeleteAccount={handleDeleteAccount}
          />
        );
      default:
        return (
          <HomeScreen
            ingredients={ingredients}
            refills={refills}
            dietAdvice={dietAdvice}
            onRefreshAdvice={handleRefreshAdvice}
            onNavigateToTab={setCurrentTab}
            darkMode={config.darkMode}
            adviceLoading={dietAdviceLoading}
          />
        );
    }
  };

  return (
    <I18nProvider
      language={normalizeLanguage(config.language)}
      onChangeLanguage={(lang) => handleUpdateConfig({ language: lang })}
    >
      <div className={`h-screen w-full flex flex-col overflow-hidden transition-colors duration-300 ${
        config.darkMode ? 'bg-[#121212] text-white' : 'bg-[#fcf9f8] text-[#1c1b1b]'
      }`}>
        <div className="flex-1 w-full max-w-5xl mx-auto flex flex-col overflow-hidden relative">
          <div className="flex-1 flex flex-col overflow-hidden">
            {!currentUser ? (
              <LoginScreen onLogin={handleLogin} />
            ) : loadingAccount || !account ? (
              <div className="flex-1 flex flex-col items-center justify-center font-sans">
                <div className="w-8 h-8 border-2 border-[#006970] border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-[#6a7a7b] mt-3 font-mono">{translate(normalizeLanguage(config.language), 'app.loadingKitchenData')}</p>
              </div>
            ) : !account.seenWelcome ? (
              <WelcomeScreen onStart={handleStart} />
            ) : (
              <div className="flex-1 flex flex-col overflow-hidden relative">
                <div className="flex-1 flex flex-col overflow-hidden">
                  {renderTabContent()}
                </div>

                <div className={`h-20 border-t flex justify-around items-center px-4 transition-all duration-700 shrink-0 ${
                  config.darkMode
                    ? 'bg-neutral-900/95 border-neutral-800 text-neutral-400'
                    : (currentTab === 'analyze'
                        ? 'bg-neutral-950/95 border-neutral-900 text-neutral-400'
                        : 'bg-white/95 border-[#e5e2e1] text-[#3b494b]')
                } backdrop-blur-md pb-4`}>
                  <button
                    id="tab-home"
                    onClick={() => setCurrentTab('home')}
                    className={`flex flex-col items-center gap-1 flex-1 py-1 transition-transform duration-200 ease-out ${getTabButtonClass('home')}`}
                  >
                    <Home size={18} className={`transition-transform duration-200 ease-out ${currentTab === 'home' ? 'scale-110' : ''}`} />
                    <span className="text-[10px] font-mono tracking-wider font-semibold">{translate(normalizeLanguage(config.language), 'app.home')}</span>
                  </button>

                  <button
                    id="tab-analyze"
                    onClick={() => setCurrentTab('analyze')}
                    className={`flex flex-col items-center gap-1 flex-1 py-1 transition-transform duration-200 ease-out ${getTabButtonClass('analyze')}`}
                  >
                    <Camera size={18} className={`transition-transform duration-200 ease-out ${currentTab === 'analyze' ? 'scale-110' : ''}`} />
                    <span className="text-[10px] font-mono tracking-wider font-semibold">{translate(normalizeLanguage(config.language), 'app.analyze')}</span>
                  </button>

                  <button
                    id="tab-inventory"
                    onClick={() => setCurrentTab('inventory')}
                    className={`flex flex-col items-center gap-1 flex-1 py-1 transition-transform duration-200 ease-out ${getTabButtonClass('inventory')}`}
                  >
                    <LayoutGrid size={18} className={`transition-transform duration-200 ease-out ${currentTab === 'inventory' ? 'scale-110' : ''}`} />
                    <span className="text-[10px] font-mono tracking-wider font-semibold">{translate(normalizeLanguage(config.language), 'app.pantry')}</span>
                  </button>

                  <button
                    id="tab-settings"
                    onClick={() => setCurrentTab('settings')}
                    className={`flex flex-col items-center gap-1 flex-1 py-1 transition-transform duration-200 ease-out ${getTabButtonClass('settings')}`}
                  >
                    <Settings size={18} className={`transition-transform duration-200 ease-out ${currentTab === 'settings' ? 'scale-110' : ''}`} />
                    <span className="text-[10px] font-mono tracking-wider font-semibold">{translate(normalizeLanguage(config.language), 'app.settings')}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </I18nProvider>
  );
}
