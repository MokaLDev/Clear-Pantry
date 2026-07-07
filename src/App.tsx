import React, { useState, useEffect } from 'react';
import { Ingredient, RefillRecord, UserConfig } from './types';
import { INITIAL_INGREDIENTS, INITIAL_REFILLS, DIETARY_ADVICE_POOL } from './data/defaultIngredients';
import WelcomeScreen from './components/WelcomeScreen';
import HomeScreen from './components/HomeScreen';
import AnalyzeScreen from './components/AnalyzeScreen';
import InventoryScreen from './components/InventoryScreen';
import SettingsScreen from './components/SettingsScreen';
import { Home, Camera, LayoutGrid, Settings, AlertCircle, RefreshCw } from 'lucide-react';

export default function App() {
  const [started, setStarted] = useState<boolean>(() => {
    return localStorage.getItem('clearpantry_started') === 'true';
  });

  const [currentTab, setCurrentTab] = useState<string>(() => {
    return localStorage.getItem('clearpantry_tab') || 'home';
  });

  const [ingredients, setIngredients] = useState<Ingredient[]>(() => {
    const saved = localStorage.getItem('clearpantry_ingredients');
    return saved ? JSON.parse(saved) : INITIAL_INGREDIENTS;
  });

  const [refills, setRefills] = useState<RefillRecord[]>(() => {
    const saved = localStorage.getItem('clearpantry_refills');
    return saved ? JSON.parse(saved) : INITIAL_REFILLS;
  });

  const [config, setConfig] = useState<UserConfig>(() => {
    const saved = localStorage.getItem('clearpantry_config');
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      darkMode: false,
      language: 'English (US)',
      reportGenerationLogic: 'Prioritize high-protein ingredients and list expiration dates in DD/MM/YYYY format...'
    };
  });

  const [dietAdvice, setDietAdvice] = useState<string>(DIETARY_ADVICE_POOL[0]);

  // Synchronize localStorage
  useEffect(() => {
    localStorage.setItem('clearpantry_started', String(started));
  }, [started]);

  useEffect(() => {
    localStorage.setItem('clearpantry_tab', currentTab);
  }, [currentTab]);

  useEffect(() => {
    localStorage.setItem('clearpantry_ingredients', JSON.stringify(ingredients));
  }, [ingredients]);

  useEffect(() => {
    localStorage.setItem('clearpantry_refills', JSON.stringify(refills));
  }, [refills]);

  useEffect(() => {
    localStorage.setItem('clearpantry_config', JSON.stringify(config));
    
    // Dynamically adjust dietary advice based on Report Generation Logic!
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
  }, [config]);

  // Handler: When user clicks "SHOOT" on Analyze page
  const handleShootRecord = (detectedUpdates: { id: string; percentage: number; addedQty: string }[]) => {
    // 1. Update ingredient quantities & status
    setIngredients(prev => {
      return prev.map(item => {
        const update = detectedUpdates.find(u => u.id === item.id);
        if (update) {
          const newQty = Math.round((update.percentage / 100) * item.maxQty);
          let newStatus: 'critical' | 'stable' | 'normal' = 'stable';
          if (update.percentage <= 20) {
            newStatus = 'critical';
          } else if (update.percentage >= 80) {
            newStatus = 'normal';
          }
          return {
            ...item,
            currentQty: newQty,
            percentage: update.percentage,
            status: newStatus,
            lastUpdated: new Date().toISOString()
          };
        }
        return item;
      });
    });

    // 2. Prep prepended refill logs for the detected ones
    const newRefills: RefillRecord[] = detectedUpdates.map((update, idx) => {
      const ingredient = ingredients.find(i => i.id === update.id);
      const name = ingredient ? ingredient.name : update.id;
      return {
        id: `refill-cam-${Date.now()}-${idx}`,
        ingredientName: name,
        qtyAdded: update.addedQty,
        method: 'OPTICAL AI',
        confidence: Math.round(92 + Math.random() * 7), // 92% to 99%
        timestamp: 'Just shot'
      };
    });

    setRefills(prev => [...newRefills, ...prev]);
  };

  // Handler: Delete a refill log entry
  const handleDeleteRefill = (id: string) => {
    setRefills(prev => prev.filter(r => r.id !== id));
  };

  // Handler: Manual restock logging from Dashboard
  const handleManualRefill = (name: string, qty: string) => {
    // Attempt to match named ingredient
    const match = ingredients.find(i => i.name.toLowerCase() === name.toLowerCase());
    if (match) {
      setIngredients(prev => {
        return prev.map(item => {
          if (item.id === match.id) {
            return {
              ...item,
              percentage: 100,
              currentQty: item.maxQty,
              status: 'normal',
              lastUpdated: new Date().toISOString()
            };
          }
          return item;
        });
      });
    }

    const newRecord: RefillRecord = {
      id: `refill-manual-${Date.now()}`,
      ingredientName: name,
      qtyAdded: qty.startsWith('+') ? qty : `+${qty}`,
      method: 'MANUAL',
      confidence: 100,
      timestamp: 'Just now'
    };

    setRefills(prev => [newRecord, ...prev]);
  };

  // Reset demo data helper
  const handleResetData = () => {
    setIngredients(INITIAL_INGREDIENTS);
    setRefills(INITIAL_REFILLS);
    setConfig({
      darkMode: false,
      language: 'English (US)',
      reportGenerationLogic: 'Prioritize high-protein ingredients and list expiration dates in DD/MM/YYYY format...'
    });
    localStorage.removeItem('clearpantry_ingredients');
    localStorage.removeItem('clearpantry_refills');
    localStorage.removeItem('clearpantry_config');
  };

  const handleRefreshAdvice = () => {
    setDietAdvice(DIETARY_ADVICE_POOL[Math.floor(Math.random() * DIETARY_ADVICE_POOL.length)]);
  };

  const handleUpdateConfig = (newConfig: Partial<UserConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  };

  // Tab styling helper based on nav-bar background contrast requirements
  const getTabButtonClass = (tab: string) => {
    const isActive = currentTab === tab;
    const isNavBarDark = config.darkMode || currentTab === 'analyze';

    if (isActive) {
      if (isNavBarDark) {
        return 'text-[#00f0ff] scale-110 font-bold';
      }
      return 'text-[#006970] scale-110 font-bold';
    } else {
      if (isNavBarDark) {
        return 'text-neutral-400 hover:text-white transition-colors duration-200';
      }
      return 'text-[#6a7a7b] hover:text-[#1c1b1b] transition-colors duration-200';
    }
  };

  // Render correct tab view
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
          />
        );
      case 'analyze':
        return (
          <AnalyzeScreen
            ingredients={ingredients}
            onShootRecord={handleShootRecord}
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
          />
        );
      case 'settings':
        return (
          <SettingsScreen
            config={config}
            onUpdateConfig={handleUpdateConfig}
            onResetData={handleResetData}
          />
        );
      default:
        return <HomeScreen ingredients={ingredients} dietAdvice={dietAdvice} onRefreshAdvice={handleRefreshAdvice} onNavigateToTab={setCurrentTab} darkMode={config.darkMode} />;
    }
  };

  // Fluid responsive layout that stretches and adapts across all sizes
  return (
    <div className={`h-screen w-full flex flex-col overflow-hidden transition-colors duration-300 ${
      config.darkMode ? 'bg-[#121212] text-white' : 'bg-[#fcf9f8] text-[#1c1b1b]'
    }`}>
      
      {/* Dynamic Content Container */}
      <div className="flex-1 w-full max-w-5xl mx-auto flex flex-col overflow-hidden relative">
        
        {/* Content canvas switcher */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {!started ? (
            <WelcomeScreen onStart={() => setStarted(true)} />
          ) : (
            <div className="flex-1 flex flex-col overflow-hidden relative">
              
              {/* Active Sub-tab Viewport */}
              <div className="flex-1 flex flex-col overflow-hidden">
                {renderTabContent()}
              </div>

              {/* Elegant Bottom Tab Navigation (Floating dock style) */}
              <div className={`h-20 border-t flex justify-around items-center px-4 transition-all duration-700 shrink-0 ${
                config.darkMode 
                  ? 'bg-neutral-900/95 border-neutral-800 text-neutral-400' 
                  : (currentTab === 'analyze' 
                      ? 'bg-neutral-950/95 border-neutral-900 text-neutral-400' 
                      : 'bg-white/95 border-[#e5e2e1] text-[#3b494b]')
              } backdrop-blur-md pb-4`}>
                
                {/* Tab: Home */}
                <button
                  id="tab-home"
                  onClick={() => setCurrentTab('home')}
                  className={`flex flex-col items-center gap-1 flex-1 py-1 ${getTabButtonClass('home')}`}
                >
                  <Home size={18} className={currentTab === 'home' ? 'scale-110' : ''} />
                  <span className="text-[10px] font-mono tracking-wider font-semibold">HOME</span>
                </button>

                {/* Tab: Analyze */}
                <button
                  id="tab-analyze"
                  onClick={() => setCurrentTab('analyze')}
                  className={`flex flex-col items-center gap-1 flex-1 py-1 ${getTabButtonClass('analyze')}`}
                >
                  <Camera size={18} className={currentTab === 'analyze' ? 'scale-110' : ''} />
                  <span className="text-[10px] font-mono tracking-wider font-semibold">ANALYZE</span>
                </button>

                {/* Tab: Inventory / Storage */}
                <button
                  id="tab-inventory"
                  onClick={() => setCurrentTab('inventory')}
                  className={`flex flex-col items-center gap-1 flex-1 py-1 ${getTabButtonClass('inventory')}`}
                >
                  <LayoutGrid size={18} className={currentTab === 'inventory' ? 'scale-110' : ''} />
                  <span className="text-[10px] font-mono tracking-wider font-semibold">PANTRY</span>
                </button>

                {/* Tab: Settings */}
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
