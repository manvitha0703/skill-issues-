import React, { useState, useEffect } from 'react';
import {
  Eye,
  Power,
  BookOpen,
  Volume2,
  Globe,
  FileCheck,
  Bot,
  Settings,
  Unlock,
  ShieldCheck,
  ChevronRight,
  ShieldAlert,
  Image as ImageIcon,
  Sparkles,
} from 'lucide-react';
import { ProfileManager, EffectiveSettings } from '../accessibility/profileManager';
import { UserAccessibilityState } from '../types/profile';
import { VaultManager } from '../vault/vaultManager';
import { AIAssistantModal } from '../components/AIAssistantModal';

export const Popup: React.FC = () => {
  const [state, setState] = useState<UserAccessibilityState | null>(null);
  const [effective, setEffective] = useState<EffectiveSettings | null>(null);
  const [currentDomain, setCurrentDomain] = useState<string>('Current Website');
  const [currentTitle, setCurrentTitle] = useState<string>('');
  const [pageContextSnippet, setPageContextSnippet] = useState<string>('');
  const [vaultConfigured, setVaultConfigured] = useState<boolean>(false);
  const [vaultLocked, setVaultLocked] = useState<boolean>(true);
  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('hi');
  const [showAIModal, setShowAIModal] = useState<boolean>(false);

  useEffect(() => {
    loadState();
    loadVaultStatus();
    getCurrentTabInfo();
  }, []);

  const loadState = async () => {
    const s = await ProfileManager.getState();
    setState(s);
    setEffective(ProfileManager.getEffectiveSettings(s));
  };

  const loadVaultStatus = async () => {
    const configured = await VaultManager.isConfigured();
    setVaultConfigured(configured);
    if (configured) {
      const locked = await VaultManager.isLocked();
      setVaultLocked(locked);
    }
  };

  const getCurrentTabInfo = () => {
    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs[0];
        if (tab?.url) {
          try {
            const url = new URL(tab.url);
            setCurrentDomain(url.hostname);
          } catch (_) {}
        }
        if (tab?.title) {
          setCurrentTitle(tab.title);
        }

        if (tab?.id) {
          chrome.tabs.sendMessage(tab.id, { type: 'ANALYZE_PAGE' }, (response) => {
            if (response?.overview) {
              setPageContextSnippet(
                `Page Title: ${response.overview.title}\nHeadings: ${response.overview.headings.join(' | ')}\nSummary: ${response.overview.summary?.summary || ''}`
              );
            }
          });
        }
      });
    }
  };

  const sendToActiveTab = (message: any, callback?: (res: any) => void) => {
    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          if (callback) {
            chrome.tabs.sendMessage(tabs[0].id, message, callback);
          } else {
            chrome.tabs.sendMessage(tabs[0].id, message);
          }
        }
      });
    }
  };

  const handleToggleMaster = async () => {
    if (!state) return;
    const newMaster = !state.masterToggle;
    const updated = await ProfileManager.toggleMaster(newMaster);
    const newState = await ProfileManager.getState();
    setState(newState);
    setEffective(ProfileManager.getEffectiveSettings(newState));

    sendToActiveTab({
      type: 'TOGGLE_MASTER_ACCESSIBILITY',
      payload: updated,
    });
  };

  const handleToggleProfile = async (presetId: string) => {
    if (!state) return;
    const prof = state.profiles.find((p) => p.presetId === presetId || p.id === presetId);
    if (!prof) return;

    const newState = await ProfileManager.toggleProfile(prof.id);
    setState(newState);
    setEffective(ProfileManager.getEffectiveSettings(newState));

    sendToActiveTab({
      type: 'UPDATE_ACCESSIBILITY_STATE',
      payload: newState,
    });
  };

  const handleOpenReadingMode = () => {
    sendToActiveTab({ type: 'OPEN_READING_MODE' });
    window.close();
  };

  const handleToggleSynchronizedNarration = () => {
    if (isSpeaking) {
      sendToActiveTab({ type: 'STOP_SYNCHRONIZED_NARRATION' });
      setIsSpeaking(false);
    } else {
      sendToActiveTab({ type: 'START_SYNCHRONIZED_NARRATION' });
      setIsSpeaking(true);
    }
  };

  const handleTranslatePage = () => {
    sendToActiveTab({ type: 'TRANSLATE_PAGE_LOCAL', payload: selectedLanguage });
    window.close();
  };

  const handleRestorePage = () => {
    sendToActiveTab({ type: 'RESTORE_PAGE_LOCAL' });
  };

  const handleScanImages = () => {
    sendToActiveTab({ type: 'SCAN_IMAGES_OCR', payload: selectedLanguage });
    window.close();
  };

  const handleEmergencyStop = () => {
    sendToActiveTab({ type: 'STOP_SPEAKING' });
    setIsSpeaking(false);
    // Send immediate freeze
    sendToActiveTab({
      type: 'UPDATE_ACCESSIBILITY_STATE',
      payload: { emergencyStop: true },
    });
    alert('Emergency Stop activated: media paused.');
  };

  const handleTriggerFormFill = async () => {
    if (!vaultConfigured) {
      openSettingsTab('vault');
      return;
    }
    if (vaultLocked) {
      setPinError('Please unlock your Vault below first to allow form matching.');
      return;
    }

    try {
      const data = await VaultManager.getData();
      sendToActiveTab(
        {
          type: 'DETECT_FORMS',
          payload: data,
        },
        (response) => {
          if (response && response.matches) {
            sendToActiveTab({
              type: 'FILL_FORM_FIELDS',
              payload: response.matches,
            });
          }
        }
      );
      window.close();
    } catch (err) {
      setPinError('Failed to read vault: ' + String(err));
    }
  };

  const handleUnlockVault = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinError(null);
    try {
      await VaultManager.unlock(pinInput);
      setVaultLocked(false);
      setPinInput('');
    } catch (err) {
      setPinError('Incorrect PIN.');
    }
  };

  const openSettingsTab = (section?: string) => {
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      const url = chrome.runtime.getURL('options.html') + (section ? `#${section}` : '');
      chrome.tabs.create({ url });
    }
  };

  const quickPresets = [
    { id: 'dyslexia', name: 'Dyslexia', icon: '📖' },
    { id: 'adhdFocus', name: 'ADHD Focus', icon: '🎯' },
    { id: 'lowVision', name: 'Low Vision', icon: '🔍' },
    { id: 'colorBlindness', name: 'Color Blind', icon: '🎨' },
    { id: 'photosensitivity', name: 'Seizure Guard', icon: '🛡️' },
    { id: 'seniorFriendly', name: 'Senior Mode', icon: '👓' },
  ];

  return (
    <div className="w-[390px] bg-navy-900 text-slate-100 flex flex-col font-sans select-none overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="p-3.5 bg-navy-800 border-b border-navy-700 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-aqua-600 to-aqua-400 flex items-center justify-center text-white shadow-md">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-bold text-sm text-white tracking-tight">Same Web, Different Eyes</h1>
              <span className="text-[9px] font-bold uppercase bg-emerald-950/80 text-emerald-400 border border-emerald-800 px-1.5 py-0.2 rounded">
                Local-First
              </span>
            </div>
            <div className="text-[11px] text-aqua-400 font-medium truncate max-w-[200px]">
              🌐 {currentDomain}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleEmergencyStop}
            title="Emergency Stop Media & Animations"
            className="p-1.5 bg-red-950/60 hover:bg-red-900 text-red-300 border border-red-800 rounded-lg transition-colors"
          >
            <ShieldAlert className="w-4 h-4" />
          </button>
          <button
            onClick={() => openSettingsTab()}
            title="Open Extension Settings"
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-navy-700 transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Master Toggle Banner */}
      <div className="px-4 py-2.5 bg-navy-800/60 border-b border-navy-700/60 flex items-center justify-between">
        <div>
          <div className="font-semibold text-xs text-slate-200">
            {state?.masterToggle ? 'Accessibility Active' : 'Accessibility Disabled'}
          </div>
          <div className="text-[10px] text-slate-400">
            {state?.masterToggle
              ? `${effective?.activeProfileNames.length || 0} active profile(s) adapting this webpage`
              : 'Original webpage styles displayed'}
          </div>
        </div>

        <button
          onClick={handleToggleMaster}
          className={`px-3 py-1.5 rounded-full font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm ${
            state?.masterToggle
              ? 'bg-aqua-500 hover:bg-aqua-400 text-navy-900 ring-2 ring-aqua-400/30'
              : 'bg-navy-700 hover:bg-navy-600 text-slate-300'
          }`}
        >
          <Power className="w-3.5 h-3.5" />
          {state?.masterToggle ? 'ON' : 'OFF'}
        </button>
      </div>

      {/* Quick Presets Carousel */}
      <div className="px-4 py-2.5 border-b border-navy-800">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex justify-between items-center">
          <span>Quick Profiles</span>
          <button
            onClick={() => openSettingsTab('profiles')}
            className="text-aqua-400 hover:underline capitalize font-normal text-[11px]"
          >
            All 10 Profiles &rarr;
          </button>
        </div>

        <div className="grid grid-cols-3 gap-1.5">
          {quickPresets.map((p) => {
            const isPresetActive = state?.profiles.some(
              (prof) => (prof.presetId === p.id || prof.id === p.id) && prof.enabled
            );
            return (
              <button
                key={p.id}
                onClick={() => handleToggleProfile(p.id)}
                className={`p-1.5 rounded-xl border text-left transition-all flex flex-col gap-0.5 ${
                  isPresetActive && state?.masterToggle
                    ? 'bg-aqua-950/60 border-aqua-500/70 text-aqua-300 ring-1 ring-aqua-500/30'
                    : 'bg-navy-800/80 border-navy-700/80 hover:bg-navy-700 text-slate-300'
                }`}
              >
                <span className="text-sm">{p.icon}</span>
                <span className="text-[10px] font-semibold truncate">{p.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Synchronized Reader & Smart Tools */}
      <div className="p-3.5 border-b border-navy-800 space-y-2">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Accessibility Actions
        </div>

        <div className="grid grid-cols-2 gap-2">
          {/* Synchronized Reading */}
          <button
            onClick={handleToggleSynchronizedNarration}
            className={`p-2 border rounded-xl text-left flex items-center gap-2 transition-colors ${
              isSpeaking
                ? 'bg-aqua-950/80 border-aqua-400 text-aqua-300'
                : 'bg-navy-800 hover:bg-navy-700 border-navy-700'
            }`}
          >
            <div className="p-1.5 rounded-lg bg-aqua-500/20 text-aqua-400">
              <Volume2 className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-100">
                {isSpeaking ? 'Stop Narrator' : 'Visual Narrator'}
              </div>
              <div className="text-[9px] text-slate-400">Highlight Sentence</div>
            </div>
          </button>

          {/* Reader View */}
          <button
            onClick={handleOpenReadingMode}
            className="p-2 bg-navy-800 hover:bg-navy-700 border border-navy-700 rounded-xl text-left flex items-center gap-2 transition-colors"
          >
            <div className="p-1.5 rounded-lg bg-teal-500/20 text-teal-400">
              <BookOpen className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-100">Reader View</div>
              <div className="text-[9px] text-slate-400">Distraction Free</div>
            </div>
          </button>

          {/* Smart Form Fill */}
          <button
            onClick={handleTriggerFormFill}
            className="p-2 bg-navy-800 hover:bg-navy-700 border border-navy-700 rounded-xl text-left flex items-center gap-2 transition-colors"
          >
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
              <FileCheck className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-100">Smart Form Fill</div>
              <div className="text-[9px] text-slate-400">Review & Approve</div>
            </div>
          </button>

          {/* Image OCR Understanding */}
          <button
            onClick={handleScanImages}
            className="p-2 bg-navy-800 hover:bg-navy-700 border border-navy-700 rounded-xl text-left flex items-center gap-2 transition-colors"
          >
            <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400">
              <ImageIcon className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-100">Image OCR</div>
              <div className="text-[9px] text-slate-400">Extract Graphic Text</div>
            </div>
          </button>
        </div>

        {/* Local Translation Quick Bar */}
        <div className="p-2 bg-navy-800/80 border border-navy-700 rounded-xl flex items-center gap-2">
          <Globe className="w-4 h-4 text-aqua-400 shrink-0" />
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="bg-navy-900 border border-navy-700 text-xs rounded-lg px-2 py-1 text-white flex-1"
          >
            <option value="hi">Hindi (हिन्दी)</option>
            <option value="kn">Kannada (ಕನ್ನಡ)</option>
            <option value="ta">Tamil (தமிழ்)</option>
            <option value="te">Telugu (తెలుగు)</option>
            <option value="ml">Malayalam (മലയാളം)</option>
            <option value="bn">Bengali (বাংলা)</option>
            <option value="mr">Marathi (मराठी)</option>
          </select>
          <button
            onClick={handleTranslatePage}
            className="px-2.5 py-1 bg-aqua-500 hover:bg-aqua-400 text-navy-900 font-bold rounded-lg text-xs"
          >
            Translate
          </button>
          <button
            onClick={handleRestorePage}
            title="Restore Original Text"
            className="px-2 py-1 bg-navy-700 hover:bg-navy-600 text-slate-300 rounded-lg text-xs"
          >
            Orig
          </button>
        </div>
      </div>

      {/* Personal Info Vault Section */}
      <div className="p-3 bg-navy-800/40">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
            <ShieldCheck className="w-3.5 h-3.5 text-aqua-400" />
            <span>Encrypted Vault</span>
          </div>
          <span
            className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
              !vaultConfigured
                ? 'bg-amber-950/60 text-amber-400 border border-amber-800/40'
                : vaultLocked
                ? 'bg-rose-950/60 text-rose-400 border border-rose-800/40'
                : 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
            }`}
          >
            {!vaultConfigured ? 'Setup Required' : vaultLocked ? 'Locked' : 'Unlocked'}
          </span>
        </div>

        {!vaultConfigured ? (
          <button
            onClick={() => openSettingsTab('vault')}
            className="w-full py-1.5 bg-aqua-600 hover:bg-aqua-500 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1"
          >
            Configure Vault & Set PIN <ChevronRight className="w-3.5 h-3.5" />
          </button>
        ) : vaultLocked ? (
          <form onSubmit={handleUnlockVault} className="flex gap-1.5">
            <input
              type="password"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              placeholder="Enter PIN to unlock"
              className="flex-1 bg-navy-900 border border-navy-700 rounded-lg px-2.5 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-aqua-500"
            />
            <button
              type="submit"
              className="px-3 py-1 bg-aqua-500 hover:bg-aqua-400 text-navy-900 font-bold rounded-lg text-xs transition-colors flex items-center gap-1"
            >
              <Unlock className="w-3 h-3" /> Unlock
            </button>
          </form>
        ) : (
          <div className="text-[11px] text-emerald-400 flex items-center justify-between">
            <span>✓ Vault unlocked. Auto-fill enabled.</span>
            <button
              onClick={() => {
                VaultManager.lock();
                setVaultLocked(true);
              }}
              className="text-[10px] text-slate-400 hover:text-white underline"
            >
              Lock now
            </button>
          </div>
        )}

        {pinError && <div className="text-[10px] text-rose-400 mt-1">{pinError}</div>}
      </div>

      {/* AI Assistant Modal */}
      <AIAssistantModal
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
        pageContext={pageContextSnippet}
        pageTitle={currentTitle}
      />
    </div>
  );
};
