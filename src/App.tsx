import React, { useEffect, useRef, useState } from 'react';
import { UserConfig, User, KitchenData } from './types';
import { INITIAL_INGREDIENTS, INITIAL_REFILLS, DIETARY_ADVICE_POOL } from './data/defaultIngredients';
import WelcomeScreen from './components/WelcomeScreen';
import LoginScreen from './components/LoginScreen';
import HomeScreen from './components/HomeScreen';
import AnalyzeScreen from './components/AnalyzeScreen';
import InventoryScreen from './components/InventoryScreen';
import SettingsScreen from './components/SettingsScreen';
import { Home, Camera, LayoutGrid, Settings } from 'lucide-react';

const DEMO_USER_ID = 'user-001';

const DEFAULT_KITCHEN: KitchenData = {
  ingredients: [],
  refills: [],
  config: {
    darkMode: false,
    language: 'English (US)',
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

  const [dietAdvice, setDietAdvice] = useState<string>(DIETARY_ADVICE_POOL[0]);

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
          setAccount({
            user: currentUser,
            kitchen: data.kitchen,
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

  // Derive dietary advice from config.
  useEffect(() => {
    const query = config.reportGenerationLogic.toLowerCase();
    if (query.includes('protein') || query.includes('high-protein')) {
      setDietAdvice("Protein priority requested: Consume Organic Eggs (50% remaining) and Greek Yogurt to fulfill your daily muscle-recovery requirements.");
    } else if (query.includes('expiration') || query.includes('date') || query.includes('spoil') || query.includes('fresh')) {
      setDietAdvice("Freshness constraint matched: Consume Spinach (Organic) and Fresh Basil immediately, as their spoilage risk scores have escalated to High.");
    } else if (query.includes('carb') || query.includes('rice') || query.includes('energy')) {
      setDietAdvice("Carbohydrate focus: Incorporate Basmati Rice (92% remaining) with healthy dietary fats to sustain longer morning training blocks.");
    } else if (query.includes('waste') || query.includes('low') || query.includes('cheap')) {
      setDietAdvice("Zero-waste strategy active: We generated meal plans utilizing flour and leftover oat milk to reduce culinary carbon footprint by 14%.");
    } else {
      setDietAdvice(DIETARY_ADVICE_POOL[Math.floor(Math.random() * DIETARY_ADVICE_POOL.length)]);
    }
  }, [config.reportGenerationLogic]);

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

  // Handler: When user clicks "SHOOT" on Analyze page
  const handleShootRecord = (detectedUpdates: { id: string; percentage: number; addedQty: string }[]) => {
    updateKitchen((prev) => {
      const updatedIngredients = prev.ingredients.map((item) => {
        const update = detectedUpdates.find((u) => u.id === item.id);
        if (!update) return item;
        const newQty = Math.round((update.percentage / 100) * item.maxQty);
        let newStatus: 'critical' | 'stable' | 'normal' = 'stable';
        if (update.percentage <= 20) newStatus = 'critical';
        else if (update.percentage >= 80) newStatus = 'normal';
        return {
          ...item,
          currentQty: newQty,
          percentage: update.percentage,
          status: newStatus,
          lastUpdated: new Date().toISOString()
        };
      });

      const newRefills = detectedUpdates.map((update, idx) => {
        const ingredient = prev.ingredients.find((i) => i.id === update.id);
        const name = ingredient ? ingredient.name : update.id;
        return {
          id: `refill-cam-${Date.now()}-${idx}`,
          ingredientName: name,
          qtyAdded: update.addedQty,
          method: 'OPTICAL AI' as const,
          confidence: Math.round(92 + Math.random() * 7),
          timestamp: 'Just shot'
        };
      });

      return {
        ...prev,
        ingredients: updatedIngredients,
        refills: [...newRefills, ...prev.refills]
      };
    });
  };

  // Handler: Delete a refill log entry
  const handleDeleteRefill = (id: string) => {
    updateKitchen((prev) => ({
      ...prev,
      refills: prev.refills.filter((r) => r.id !== id)
    }));
  };

  // Handler: Manual restock logging from Dashboard
  const handleManualRefill = (name: string, qty: string) => {
    updateKitchen((prev) => {
      const match = prev.ingredients.find((i) => i.name.toLowerCase() === name.toLowerCase());
      const updatedIngredients = match
        ? prev.ingredients.map((item) =>
            item.id === match.id
              ? {
                  ...item,
                  percentage: 100,
                  currentQty: item.maxQty,
                  status: 'normal' as const,
                  lastUpdated: new Date().toISOString()
                }
              : item
          )
        : prev.ingredients;

      const newRecord = {
        id: `refill-manual-${Date.now()}`,
        ingredientName: name,
        qtyAdded: qty.startsWith('+') ? qty : `+${qty}`,
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
    setDietAdvice(DIETARY_ADVICE_POOL[Math.floor(Math.random() * DIETARY_ADVICE_POOL.length)]);
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
            dietAdvice={dietAdvice}
            onRefreshAdvice={handleRefreshAdvice}
            onNavigateToTab={(tab) => setCurrentTab(tab)}
            darkMode={config.darkMode}
            isDemo={currentUser?.id === DEMO_USER_ID}
          />
        );
      case 'analyze':
        return (
          <AnalyzeScreen
            ingredients={ingredients}
            onShootRecord={handleShootRecord}
            isDemo={currentUser?.id === DEMO_USER_ID}
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
            dietAdvice={dietAdvice}
            onRefreshAdvice={handleRefreshAdvice}
            onNavigateToTab={setCurrentTab}
            darkMode={config.darkMode}
          />
        );
    }
  };

  return (
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
              <p className="text-xs text-[#6a7a7b] mt-3 font-mono">LOADING KITCHEN DATA</p>
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
                  className={`flex flex-col items-center gap-1 flex-1 py-1 ${getTabButtonClass('home')}`}
                >
                  <Home size={18} className={currentTab === 'home' ? 'scale-110' : ''} />
                  <span className="text-[10px] font-mono tracking-wider font-semibold">HOME</span>
                </button>

                <button
                  id="tab-analyze"
                  onClick={() => setCurrentTab('analyze')}
                  className={`flex flex-col items-center gap-1 flex-1 py-1 ${getTabButtonClass('analyze')}`}
                >
                  <Camera size={18} className={currentTab === 'analyze' ? 'scale-110' : ''} />
                  <span className="text-[10px] font-mono tracking-wider font-semibold">ANALYZE</span>
                </button>

                <button
                  id="tab-inventory"
                  onClick={() => setCurrentTab('inventory')}
                  className={`flex flex-col items-center gap-1 flex-1 py-1 ${getTabButtonClass('inventory')}`}
                >
                  <LayoutGrid size={18} className={currentTab === 'inventory' ? 'scale-110' : ''} />
                  <span className="text-[10px] font-mono tracking-wider font-semibold">PANTRY</span>
                </button>

                <button
                  id="tab-settings"
                  onClick={() => setCurrentTab('settings')}
                  className={`flex flex-col items-center gap-1 flex-1 py-1 ${getTabButtonClass('settings')}`}
                >
                  <Settings size={18} className={currentTab === 'settings' ? 'scale-110' : ''} />
                  <span className="text-[10px] font-mono tracking-wider font-semibold">SETTINGS</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
