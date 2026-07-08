import React, { useState } from 'react';
import { UserConfig, User } from '../types';
import { Check, Globe, Terminal, User as UserIcon, LogOut, Trash2 } from 'lucide-react';
import { useI18n } from '../i18n';
import type { Language } from '../i18n';

interface SettingsScreenProps {
  config: UserConfig;
  user: User | null;
  onUpdateConfig: (newConfig: Partial<UserConfig>) => void;
  onResetData: () => void;
  onLogout: () => void;
  onDeleteAccount: () => void;
}

export default function SettingsScreen({ config, user, onUpdateConfig, onResetData, onLogout, onDeleteAccount }: SettingsScreenProps) {
  const [logicInput, setLogicInput] = useState(config.reportGenerationLogic);
  const [successMsg, setSuccessMsg] = useState(false);
  const { t } = useI18n();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateConfig({ reportGenerationLogic: logicInput });
    setSuccessMsg(true);
    setTimeout(() => setSuccessMsg(false), 3000);
  };

  return (
    <div className={`w-full flex-1 flex flex-col font-sans overflow-y-auto pb-24 transition-colors duration-300 ${
      config.darkMode ? 'bg-[#121212] text-white' : 'bg-[#fcf9f8] text-[#1c1b1b]'
    }`}>
      {/* Content Title - No heading bar as requested by the modification prompt */}
      <div className={`px-6 pt-6 pb-4 border-b transition-colors duration-300 ${
        config.darkMode ? 'border-neutral-800' : 'border-[#e5e2e1]'
      } mb-6`}>
        <h2 className="text-xl font-bold tracking-tight">{t('settings.title')}</h2>
        <p className={`text-xs font-light ${config.darkMode ? 'text-neutral-400' : 'text-[#6a7a7b]'}`}>{t('settings.subtitle')}</p>
      </div>

      <div className="px-6 space-y-5 max-w-xl mx-auto w-full">
        {/* PERSONAL CENTER */}
        <div className={`border rounded-lg p-5 shadow-sm transition-colors duration-300 ${
          config.darkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-[#e5e2e1]'
        }`}>
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center border-2 ${
              config.darkMode ? 'bg-neutral-950 border-[#00f0ff] text-[#00f0ff]' : 'bg-[#f0f9fa] border-[#006970] text-[#006970]'
            }`}>
              <UserIcon size={24} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold truncate">{user?.username || t('settings.personalCenter.guest')}</h3>
              <p className={`text-[11px] truncate ${config.darkMode ? 'text-neutral-400' : 'text-[#6a7a7b]'}`}>
                {user?.info || t('settings.personalCenter.defaultInfo')}
              </p>
            </div>
          </div>

          <div className={`mt-4 pt-4 border-t ${
            config.darkMode ? 'border-neutral-800' : 'border-[#f0edec]'
          } space-y-3`}>
            <button
              onClick={() => {
                if (window.confirm(t('settings.personalCenter.logoutConfirm'))) {
                  onLogout();
                }
              }}
              className={`w-full py-2.5 rounded text-[11px] font-mono font-bold tracking-wider flex items-center justify-center gap-2 transition-colors ${
                config.darkMode
                  ? 'bg-neutral-950 hover:bg-red-950/20 border border-red-900/30 text-red-400'
                  : 'bg-white hover:bg-[#ffdad6]/20 border border-[#ba1a1a]/30 hover:border-[#ba1a1a] text-[#ba1a1a]'
              }`}
            >
              <LogOut size={14} />
              {t('settings.personalCenter.logout')}
            </button>

            <button
              onClick={() => {
                if (user?.username === 'demo') {
                  alert(t('settings.personalCenter.demoCannotDelete'));
                  return;
                }
                if (window.confirm(t('settings.personalCenter.deleteConfirm', { username: user?.username || '' }))) {
                  onDeleteAccount();
                }
              }}
              className={`w-full py-2.5 rounded text-[11px] font-mono font-bold tracking-wider flex items-center justify-center gap-2 transition-colors ${
                config.darkMode
                  ? 'bg-neutral-950 hover:bg-red-950/20 border border-red-900/30 text-red-400'
                  : 'bg-white hover:bg-[#ffdad6]/20 border border-[#ba1a1a]/30 hover:border-[#ba1a1a] text-[#ba1a1a]'
              }`}
            >
              <Trash2 size={14} />
              {t('settings.personalCenter.deleteAccount')}
            </button>
          </div>
        </div>

        {/* APPEARANCE SECTION */}
        <div className={`border rounded p-5 shadow-sm transition-colors duration-300 ${
          config.darkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-[#e5e2e1]'
        }`}>
          <span className={`text-[9px] font-mono tracking-widest uppercase font-bold block mb-4 ${
            config.darkMode ? 'text-neutral-400' : 'text-[#6a7a7b]'
          }`}>
            {t('settings.appearance')}
          </span>

          <div className="space-y-4">
            {/* Dark Mode Toggle */}
            <div className={`flex justify-between items-center pb-3 border-b transition-colors ${
              config.darkMode ? 'border-neutral-800' : 'border-[#f0edec]'
            }`}>
              <div>
                <h4 className="text-xs font-bold">{t('settings.darkMode')}</h4>
                <p className={`text-[11px] leading-tight mt-0.5 ${config.darkMode ? 'text-neutral-400' : 'text-[#6a7a7b]'}`}>
                  {t('settings.darkModeDesc')}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={config.darkMode}
                  onChange={(e) => onUpdateConfig({ darkMode: e.target.checked })}
                  className="sr-only peer"
                />
                <div className={`w-10 h-5 rounded-full peer peer-focus:outline-none transition-all after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full peer-checked:bg-[#00f0ff] ${
                  config.darkMode ? 'bg-neutral-800' : 'bg-[#ebe7e7]'
                }`}></div>
              </label>
            </div>

            {/* Language Selector */}
            <div className="flex justify-between items-center pt-1">
              <div>
                <h4 className="text-xs font-bold">{t('settings.language')}</h4>
                <p className={`text-[11px] leading-tight mt-0.5 ${config.darkMode ? 'text-neutral-400' : 'text-[#6a7a7b]'}`}>
                  {t('settings.languageDesc')}
                </p>
              </div>
              <div className="relative">
                <Globe size={12} className={`absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${
                  config.darkMode ? 'text-neutral-400' : 'text-[#6a7a7b]'
                }`} />
                <select
                  value={config.language}
                  onChange={(e) => onUpdateConfig({ language: e.target.value })}
                  className={`border text-xs font-mono font-medium rounded pl-7 pr-3 py-1.5 focus:outline-none focus:border-[#00f0ff] cursor-pointer transition-colors ${
                    config.darkMode 
                      ? 'bg-neutral-950 border-neutral-800 text-white focus:border-[#00f0ff]' 
                      : 'bg-[#fcf9f8] border-[#e5e2e1] text-[#1c1b1b] focus:border-[#006970]'
                  }`}
                >
                  <option value="en">{t('settings.languages.en')}</option>
                  <option value="zh">{t('settings.languages.zh')}</option>
                  <option value="es">{t('settings.languages.es')}</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* INTELLIGENCE PARAMETERS SECTION */}
        <div className={`border rounded p-5 shadow-sm transition-colors duration-300 ${
          config.darkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-[#e5e2e1]'
        }`}>
          <div className="flex justify-between items-center mb-4">
            <span className={`text-[9px] font-mono tracking-widest uppercase font-bold block ${
              config.darkMode ? 'text-neutral-400' : 'text-[#6a7a7b]'
            }`}>
              {t('settings.intelligence.title')}
            </span>
            <span className={`text-[9px] font-mono border px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
              config.darkMode 
                ? 'bg-[#00f0ff]/10 text-[#00f0ff] border-[#00f0ff]/30' 
                : 'bg-[#00f0ff]/10 text-[#006970] border border-[#00dbe9]/30'
            }`}>
              {t('settings.intelligence.active')}
            </span>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <h4 className="text-xs font-bold">{t('settings.intelligence.reportLogic')}</h4>
              <p className={`text-[11px] leading-relaxed mt-0.5 mb-2.5 ${config.darkMode ? 'text-neutral-400' : 'text-[#6a7a7b]'}`}>
                {t('settings.intelligence.reportLogicDesc')}
              </p>
              <textarea
                value={logicInput}
                onChange={(e) => setLogicInput(e.target.value)}
                placeholder={t('settings.intelligence.placeholder')}
                className={`w-full border rounded text-xs p-3 h-28 focus:outline-none font-sans leading-relaxed transition-colors ${
                  config.darkMode 
                    ? 'bg-neutral-950 border-neutral-850 text-white focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff]' 
                    : 'bg-[#fcf9f8] border-[#e5e2e1] text-[#1c1b1b] focus:border-[#006970] focus:ring-1 focus:ring-[#006970]'
                }`}
              />
            </div>

            {successMsg && (
              <div className={`border text-[10px] font-mono p-2.5 rounded flex items-center gap-1.5 uppercase font-semibold transition-colors ${
                config.darkMode 
                  ? 'bg-[#00f0ff]/10 border-[#00f0ff]/30 text-[#00f0ff]' 
                  : 'bg-[#f0f9fa] border-[#00dbe9]/30 text-[#006970]'
              }`}>
                <Check size={12} />
                {t('settings.intelligence.updated')}
              </div>
            )}

            <button
              type="submit"
              className={`w-full py-3 transition-colors text-xs font-mono font-bold tracking-widest uppercase rounded ${
                config.darkMode 
                  ? 'bg-[#00f0ff] text-black hover:bg-[#00dbe9]' 
                  : 'bg-[#1c1b1b] text-white hover:bg-black'
              }`}
            >
              {t('settings.intelligence.save')}
            </button>
          </form>
        </div>

        {/* FACTORY RESET / SYSTEM UTILITY */}
        <div className={`border rounded p-5 shadow-sm transition-colors duration-300 ${
          config.darkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-[#e5e2e1]'
        }`}>
          <span className="text-[9px] font-mono tracking-widest text-[#ba1a1a] uppercase font-bold block mb-2">
            {t('settings.diagnostics.title')}
          </span>
          <h4 className="text-xs font-bold mb-1">{t('settings.diagnostics.stateReset')}</h4>
          <p className={`text-[11px] leading-relaxed mb-4 ${config.darkMode ? 'text-neutral-400' : 'text-[#6a7a7b]'}`}>
            {t('settings.diagnostics.stateResetDesc')}
          </p>
          <button
            onClick={() => {
              if (window.confirm(t('settings.diagnostics.resetConfirm'))) {
                onResetData();
                alert(t('settings.diagnostics.resetDone'));
              }
            }}
            className={`px-4 py-2 text-[10px] font-mono font-bold tracking-wider rounded transition-all ${
              config.darkMode 
                ? 'bg-neutral-950 hover:bg-red-950/20 border border-red-900/30 text-red-400' 
                : 'bg-white hover:bg-[#ffdad6]/20 border border-[#ba1a1a]/30 hover:border-[#ba1a1a] text-[#ba1a1a]'
            }`}
          >
            {t('settings.diagnostics.restoreDefaults')}
          </button>
        </div>

        {/* VERSION & UPTIME STATUS CARDS (Matching Screenshot perfectly) */}
        <div className={`border p-4 rounded flex justify-between items-center text-xs font-mono transition-colors duration-300 ${
          config.darkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-[#f3f0ef] border-[#e5e2e1]'
        }`}>
          <div className="grid grid-cols-2 gap-8">
            <div>
              <span className={`text-[9px] uppercase block ${config.darkMode ? 'text-neutral-400' : 'text-[#6a7a7b]'}`}>{t('settings.version')}</span>
              <span className="text-xs font-bold mt-0.5 block">2.4.0-STABLE</span>
            </div>
            <div>
              <span className={`text-[9px] uppercase block ${config.darkMode ? 'text-neutral-400' : 'text-[#6a7a7b]'}`}>{t('settings.uptime')}</span>
              <span className="text-xs font-bold mt-0.5 block">142:22:04</span>
            </div>
          </div>
          <div className={`w-8 h-8 rounded flex items-center justify-center border transition-colors ${
            config.darkMode ? 'bg-neutral-950 border-neutral-800 text-neutral-400' : 'bg-white border-[#e5e2e1] text-[#3b494b]'
          }`}>
            <Terminal size={14} />
          </div>
        </div>

      </div>
    </div>
  );
}
