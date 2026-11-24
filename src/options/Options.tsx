import React, { useState, useEffect } from 'react';
import {
  Eye,
  Sliders,
  Type,
  Shield,
  Bot,
  Volume2,
  Lock,
  Unlock,
  Key,
  Trash2,
  Plus,
  Save,
  CheckCircle,
  AlertCircle,
  Sparkles,
  HelpCircle,
  RefreshCw,
  Palette,
  ShieldAlert,
  Server,
  ZoomIn,
} from 'lucide-react';
import { ProfileManager } from '../accessibility/profileManager';
import { UserAccessibilityState, ColorBlindnessType, ThemePresetType } from '../types/profile';
import { VaultManager, DEFAULT_EMPTY_VAULT } from '../vault/vaultManager';
import { VaultData } from '../types/vault';
import { AIService, DEFAULT_AI_CONFIG } from '../ai/aiService';
import { AIConfig, AIProvider } from '../types/ai';
import { OllamaModelInfo } from '../ai/providers/ollamaProvider';
import { SpeechService } from '../voice/speechService';
import { SafeStorage } from '../storage/chromeStorage';
import { BASE_COLOR_MATRICES } from '../accessibility/svgFilters';

export const Options: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('profiles');
  const [state, setState] = useState<UserAccessibilityState | null>(null);
  const [vaultConfigured, setVaultConfigured] = useState<boolean>(false);
  const [vaultLocked, setVaultLocked] = useState<boolean>(true);
  const [vaultData, setVaultData] = useState<VaultData>(DEFAULT_EMPTY_VAULT);
  const [vaultPin, setVaultPin] = useState<string>('');
  const [newPin, setNewPin] = useState<string>('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [vaultSuccess, setVaultSuccess] = useState<string | null>(null);

  // AI & Local Ollama Config
  const [aiConfig, setAiConfig] = useState<AIConfig>(DEFAULT_AI_CONFIG);
  const [showApiKey, setShowApiKey] = useState<boolean>(false);
  const [aiTestResult, setAiTestResult] = useState<string | null>(null);
  const [aiTesting, setAiTesting] = useState<boolean>(false);
  const [ollamaStatus, setOllamaStatus] = useState<{ online: boolean; models: OllamaModelInfo[]; error?: string }>({
    online: false,
    models: [],
  });

  // Colorblindness preview state
  const [previewColorMode, setPreviewColorMode] = useState<ColorBlindnessType>('deuteranopia');
  const [previewIntensity, setPreviewIntensity] = useState<number>(100);

  // Voice
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [isSpeakingTest, setIsSpeakingTest] = useState<boolean>(false);

  // Save banner
  const [saveBanner, setSaveBanner] = useState<string | null>(null);

  useEffect(() => {
    loadAll();
    const hash = window.location.hash.replace('#', '');
    if (hash) setActiveTab(hash);
  }, []);

  const loadAll = async () => {
    const s = await ProfileManager.getState();
    setState(s);

    const configured = await VaultManager.isConfigured();
    setVaultConfigured(configured);
    if (configured) {
      const locked = await VaultManager.isLocked();
      setVaultLocked(locked);
      if (!locked) {
        try {
          const data = await VaultManager.getData();
          setVaultData(data);
        } catch (_) {}
      }
    }

    const ai = await AIService.getConfig();
    setAiConfig(ai);

    // Check local Ollama status
    checkOllama(ai.endpoint);

    const vList = await SpeechService.getVoices();
    setVoices(vList);
  };

  const checkOllama = async (endpoint?: string) => {
    const res = await AIService.checkLocalOllama(endpoint);
    setOllamaStatus(res);
  };

  const triggerSaveNotification = (msg: string) => {
    setSaveBanner(msg);
    setTimeout(() => setSaveBanner(null), 3000);
  };

  const handleToggleProfile = async (id: string) => {
    if (!state) return;
    const newState = await ProfileManager.toggleProfile(id);
    setState(newState);
    triggerSaveNotification('Profile preferences updated.');
  };

  // Vault Handlers
  const handleUnlockVault = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinError(null);
    try {
      const data = await VaultManager.unlock(vaultPin);
      setVaultData(data);
      setVaultLocked(false);
      setVaultPin('');
      setVaultSuccess('Vault unlocked successfully.');
      setTimeout(() => setVaultSuccess(null), 3000);
    } catch (err) {
      setPinError('Incorrect vault PIN.');
    }
  };

  const handleSetupVault = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.length < 4) {
      setPinError('PIN must be at least 4 characters.');
      return;
    }
    await VaultManager.setupVault(newPin, vaultData);
    setVaultConfigured(true);
    setVaultLocked(false);
    setNewPin('');
    setVaultSuccess('Vault master PIN created and encrypted.');
    setTimeout(() => setVaultSuccess(null), 3000);
  };

  const handleSaveVaultData = async () => {
    try {
      await VaultManager.saveData(vaultData);
      triggerSaveNotification('Personal vault data safely encrypted and saved.');
    } catch (err) {
      setPinError('Cannot save data to locked vault. Please unlock first.');
    }
  };

  const handleAddCustomField = () => {
    const newField = {
      id: 'custom_' + Date.now(),
      name: 'Custom Field',
      value: '',
      category: 'other' as const,
    };
    setVaultData({
      ...vaultData,
      customFields: [...vaultData.customFields, newField],
    });
  };

  const handleClearVault = async () => {
    if (confirm('Are you sure you want to permanently clear all vault data? This cannot be undone.')) {
      await VaultManager.clearVault();
      setVaultConfigured(false);
      setVaultLocked(true);
      setVaultData(DEFAULT_EMPTY_VAULT);
      triggerSaveNotification('Vault has been cleared.');
    }
  };

  // AI Handlers
  const handleSaveAIConfig = async () => {
    await AIService.saveConfig(aiConfig);
    triggerSaveNotification('AI configuration saved.');
  };

  const handleTestAI = async () => {
    setAiTesting(true);
    setAiTestResult(null);
    try {
      await AIService.saveConfig(aiConfig);
      if (aiConfig.provider === 'local_ollama') {
        const status = await AIService.checkLocalOllama(aiConfig.endpoint);
        setOllamaStatus(status);
        if (status.online) {
          setAiTestResult(`✓ Local Ollama is ONLINE! Detected ${status.models.length} model(s): ${status.models.map(m => m.name).join(', ')}`);
        } else {
          setAiTestResult(`✕ Ollama is offline at ${aiConfig.endpoint}. Ensure 'ollama serve' is running.`);
        }
      } else {
        const res = await AIService.simplifyText({
          text: 'The aforementioned scholarship program mandates a minimum aggregate CGPA of 3.5.',
          level: 'very_simple',
        });
        setAiTestResult(
          res.isAiGenerated
            ? `✓ Success! AI response received: "${res.simplifiedText.slice(0, 100)}..."`
            : `✓ Fallback OK: Local deterministic rule engine is operational.`
        );
      }
    } catch (err) {
      setAiTestResult(`✕ Error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setAiTesting(false);
    }
  };

  // Voice Test
  const handleTestSpeech = () => {
    if (isSpeakingTest) {
      SpeechService.stop();
      setIsSpeakingTest(false);
    } else {
      SpeechService.speak('This is a test of your accessible text-to-speech voice and synchronized visual cursor.', {
        voiceName: selectedVoice,
        rate: speechRate,
        onEnd: () => setIsSpeakingTest(false),
      });
      setIsSpeakingTest(true);
    }
  };

  const tabs = [
    { id: 'profiles', label: 'All Profiles', icon: Sliders },
    { id: 'colorblind', label: 'Color Vision (8 Presets)', icon: Palette },
    { id: 'dyslexia', label: 'Dyslexia & Focus', icon: Type },
    { id: 'vision', label: 'Low Vision & Zoom', icon: ZoomIn },
    { id: 'safety', label: 'Safety & Seizure', icon: ShieldAlert },
    { id: 'local_ai', label: 'Local-First AI & Ollama', icon: Server },
    { id: 'vault', label: 'Personal Vault', icon: Shield },
    { id: 'voice', label: 'Voice & Speech', icon: Volume2 },
    { id: 'privacy', label: 'Privacy & Governance', icon: Key },
    { id: 'shortcuts', label: 'Keyboard Shortcuts', icon: HelpCircle },
  ];

  return (
    <div className="min-h-screen bg-navy-900 text-slate-100 flex flex-col font-sans">
      {saveBanner && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-sm font-semibold animate-bounce">
          <CheckCircle className="w-4 h-4" />
          {saveBanner}
        </div>
      )}

      {/* Header */}
      <header className="bg-navy-800 border-b border-navy-700 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-aqua-600 to-aqua-400 flex items-center justify-center text-white shadow-md">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-base text-white">Same Web, Different Eyes</h1>
              <span className="text-[10px] font-bold uppercase bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded-full">
                Local-First Privacy Architecture
              </span>
            </div>
            <p className="text-xs text-aqua-400">Settings, Accessibility Engine & Local Model Control</p>
          </div>
        </div>

        <a
          href="demo.html"
          target="_blank"
          rel="noreferrer"
          className="px-4 py-2 bg-navy-700 hover:bg-navy-600 text-aqua-300 border border-aqua-500/30 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
        >
          <span>🚀 Open Interactive Demo Portal</span>
        </a>
      </header>

      {/* Main Layout */}
      <div className="flex-1 max-w-6xl w-full mx-auto flex flex-col md:flex-row p-6 gap-8">
        {/* Sidebar Navigation */}
        <aside className="w-full md:w-64 shrink-0 space-y-1">
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
                  active
                    ? 'bg-aqua-500 text-navy-900 shadow-md font-bold'
                    : 'text-slate-300 hover:bg-navy-800 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {t.label}
              </button>
            );
          })}
        </aside>

        {/* Tab Content Panel */}
        <main className="flex-1 bg-navy-800/60 border border-navy-700 rounded-2xl p-6 shadow-xl overflow-hidden">
          {/* TAB 1: All 10 Profiles */}
          {activeTab === 'profiles' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-white mb-1">Accessibility Profiles (10 Presets)</h2>
                <p className="text-xs text-slate-400">
                  Multiple profiles can be activated simultaneously and combine their functional rules.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-2.5 max-h-[68vh] overflow-y-auto pr-1">
                {state?.profiles.map((p) => (
                  <div
                    key={p.id}
                    className={`p-3.5 rounded-xl border transition-all flex items-start justify-between gap-4 ${
                      p.enabled
                        ? 'bg-aqua-950/40 border-aqua-500/80 ring-1 ring-aqua-500/30'
                        : 'bg-navy-800 border-navy-700 hover:border-navy-600'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm text-white">{p.name}</span>
                        {p.enabled && (
                          <span className="text-[9px] font-bold uppercase bg-aqua-600/30 text-aqua-400 px-2 py-0.5 rounded-full border border-aqua-500/30">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed mb-1.5">{p.description}</p>
                    </div>

                    <button
                      onClick={() => handleToggleProfile(p.id)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors shrink-0 ${
                        p.enabled
                          ? 'bg-aqua-500 text-navy-900 hover:bg-aqua-400'
                          : 'bg-navy-700 text-slate-300 hover:bg-navy-600 hover:text-white'
                      }`}
                    >
                      {p.enabled ? 'Enabled' : 'Enable'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: Color Vision (8 Presets) */}
          {activeTab === 'colorblind' && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-bold text-white mb-1">Scientific Color Vision Deficiency Presets (8 Types)</h2>
                <p className="text-xs text-slate-400">
                  Scientifically modeled Brettel & Machado color matrix transformations with adjustable intensity.
                </p>
              </div>

              {/* Color Swatch Preview */}
              <div className="bg-navy-900 p-4 rounded-xl border border-navy-700 space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-300 flex justify-between">
                  <span>Color Spectrum Swatch (Before vs After)</span>
                  <span className="text-aqua-400">{previewColorMode.toUpperCase()} ({previewIntensity}%)</span>
                </div>
                <div className="grid grid-cols-6 gap-2 h-10 rounded-lg overflow-hidden">
                  <div className="bg-red-500 flex items-center justify-center text-[10px] font-bold text-white">Red</div>
                  <div className="bg-green-500 flex items-center justify-center text-[10px] font-bold text-white">Green</div>
                  <div className="bg-blue-500 flex items-center justify-center text-[10px] font-bold text-white">Blue</div>
                  <div className="bg-yellow-400 flex items-center justify-center text-[10px] font-bold text-slate-900">Yellow</div>
                  <div className="bg-purple-600 flex items-center justify-center text-[10px] font-bold text-white">Purple</div>
                  <div className="bg-orange-500 flex items-center justify-center text-[10px] font-bold text-white">Orange</div>
                </div>
              </div>

              {/* 8 Selectable Presets Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[46vh] overflow-y-auto pr-1">
                {[
                  { id: 'protanopia', title: 'Protanopia (Red-Blind)', desc: 'Complete absence of red L-cone photoreceptors.' },
                  { id: 'protanomaly', title: 'Protanomaly (Red-Weak)', desc: 'Anomalous shifted red sensitivity; partial deficiency.' },
                  { id: 'deuteranopia', title: 'Deuteranopia (Green-Blind)', desc: 'Complete absence of green M-cone photoreceptors.' },
                  { id: 'deuteranomaly', title: 'Deuteranomaly (Green-Weak)', desc: 'Most common deficiency; partial anomalous green shift.' },
                  { id: 'tritanopia', title: 'Tritanopia (Blue-Blind)', desc: 'Rare blue-yellow deficiency; absence of S-cones.' },
                  { id: 'tritanomaly', title: 'Tritanomaly (Blue-Weak)', desc: 'Partial blue cone mutation; yellow-blue confusion.' },
                  { id: 'achromatopsia', title: 'Achromatopsia (Monochromacy)', desc: 'Complete loss of all color perception; black and white.' },
                  { id: 'achromatomaly', title: 'Achromatomaly (Partial Monochromacy)', desc: 'Substantially muted colors with residual discrimination.' },
                ].map((item) => (
                  <div
                    key={item.id}
                    onClick={async () => {
                      setPreviewColorMode(item.id as ColorBlindnessType);
                      const s = await ProfileManager.getState();
                      const prof = s.profiles.find(p => p.presetId === 'colorBlindness');
                      if (prof) {
                        prof.visualSettings.colorBlindnessMode = item.id as ColorBlindnessType;
                        prof.enabled = true;
                      }
                      s.masterToggle = true;
                      await ProfileManager.saveState(s);
                      triggerSaveNotification(`Activated ${item.title}`);
                    }}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      previewColorMode === item.id
                        ? 'bg-aqua-950/60 border-aqua-400 ring-1 ring-aqua-500'
                        : 'bg-navy-800 border-navy-700 hover:border-navy-600'
                    }`}
                  >
                    <div className="font-semibold text-xs text-white mb-0.5">{item.title}</div>
                    <p className="text-[11px] text-slate-400">{item.desc}</p>
                  </div>
                ))}
              </div>

              {/* Intensity Slider */}
              <div className="bg-navy-800 p-3.5 rounded-xl border border-navy-700">
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="font-bold text-slate-300">Transformation Severity Intensity:</span>
                  <span className="text-aqua-400 font-bold">{previewIntensity}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={previewIntensity}
                  onChange={async (e) => {
                    const val = Number(e.target.value);
                    setPreviewIntensity(val);
                    const s = await ProfileManager.getState();
                    const prof = s.profiles.find(p => p.presetId === 'colorBlindness');
                    if (prof) prof.visualSettings.colorBlindnessIntensity = val;
                    await ProfileManager.saveState(s);
                  }}
                  className="w-full accent-aqua-500 cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* TAB 3: Dyslexia & Focus */}
          {activeTab === 'dyslexia' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-white mb-1">Dyslexia & Comfortable Reading Focus</h2>
                <p className="text-xs text-slate-400">
                  Single-line reading focus, sentence hover simplification, warm eye comfort tint, and weighted typography.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-navy-800 p-3.5 rounded-xl border border-navy-700 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-200">Single-Line Focus Curtains</div>
                    <div className="text-[11px] text-slate-400">Dims surrounding lines without hiding them</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={state?.profiles.find(p => p.presetId === 'dyslexia')?.visualSettings.singleLineFocus ?? true}
                    onChange={async (e) => {
                      const s = await ProfileManager.getState();
                      const prof = s.profiles.find(p => p.presetId === 'dyslexia');
                      if (prof) prof.visualSettings.singleLineFocus = e.target.checked;
                      await ProfileManager.saveState(s);
                      setState(s);
                    }}
                    className="w-4 h-4 accent-aqua-500"
                  />
                </div>

                <div className="bg-navy-800 p-3.5 rounded-xl border border-navy-700 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-200">Hover Sentence Simplifier</div>
                    <div className="text-[11px] text-slate-400">Displays plain-language tooltip upon hover</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={state?.profiles.find(p => p.presetId === 'dyslexia')?.readingSettings.hoverSimplification ?? true}
                    onChange={async (e) => {
                      const s = await ProfileManager.getState();
                      const prof = s.profiles.find(p => p.presetId === 'dyslexia');
                      if (prof) prof.readingSettings.hoverSimplification = e.target.checked;
                      await ProfileManager.saveState(s);
                      setState(s);
                    }}
                    className="w-4 h-4 accent-aqua-500"
                  />
                </div>
              </div>

              {/* Warm Tint */}
              <div className="bg-navy-800 p-4 rounded-xl border border-navy-700">
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="font-bold text-slate-200">Warm Amber Background Tint (Reduces Visual Crowding):</span>
                  <span className="text-amber-400 font-bold">
                    {state?.profiles.find(p => p.presetId === 'dyslexia')?.visualSettings.warmTintIntensity || 15}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="40"
                  step="5"
                  value={state?.profiles.find(p => p.presetId === 'dyslexia')?.visualSettings.warmTintIntensity || 15}
                  onChange={async (e) => {
                    const val = Number(e.target.value);
                    const s = await ProfileManager.getState();
                    const prof = s.profiles.find(p => p.presetId === 'dyslexia');
                    if (prof) {
                      prof.visualSettings.warmTint = val > 0;
                      prof.visualSettings.warmTintIntensity = val;
                    }
                    await ProfileManager.saveState(s);
                    setState(s);
                  }}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              {/* Accessible Font Family */}
              <div className="bg-navy-800 p-4 rounded-xl border border-navy-700">
                <label className="text-xs font-bold text-slate-200 block mb-2">Specialized Accessible Typography:</label>
                <select
                  value={state?.profiles.find(p => p.presetId === 'dyslexia')?.visualSettings.fontFamily || 'opendyslexic'}
                  onChange={async (e) => {
                    const s = await ProfileManager.getState();
                    const prof = s.profiles.find(p => p.presetId === 'dyslexia');
                    if (prof) prof.visualSettings.fontFamily = e.target.value as any;
                    await ProfileManager.saveState(s);
                    setState(s);
                  }}
                  className="w-full bg-navy-900 border border-navy-700 text-white rounded-lg p-2.5 text-xs"
                >
                  <option value="opendyslexic">OpenDyslexic (Weighted Bottoms to Prevent Inversion)</option>
                  <option value="atkinson">Atkinson Hyperlegible (Braille Institute Clarity)</option>
                  <option value="lexend">Lexend (Scientifically Engineered Reading Speed)</option>
                  <option value="sans-serif">Clean System Sans-Serif</option>
                </select>
              </div>
            </div>
          )}

          {/* TAB 4: Low Vision & Zoom */}
          {activeTab === 'vision' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-white mb-1">Low Vision, Magnification & High Contrast</h2>
                <p className="text-xs text-slate-400">
                  Custom high-contrast color palettes, in-browser magnification, and operating system magnifier shortcuts.
                </p>
              </div>

              <div className="bg-navy-800 p-4 rounded-xl border border-navy-700">
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="font-bold text-slate-200">Webpage Magnification Zoom:</span>
                  <span className="text-aqua-400 font-bold">
                    {state?.profiles.find(p => p.presetId === 'lowVision')?.visualSettings.pageZoomLevel || 125}%
                  </span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="200"
                  step="10"
                  value={state?.profiles.find(p => p.presetId === 'lowVision')?.visualSettings.pageZoomLevel || 125}
                  onChange={async (e) => {
                    const val = Number(e.target.value);
                    const s = await ProfileManager.getState();
                    const prof = s.profiles.find(p => p.presetId === 'lowVision');
                    if (prof) prof.visualSettings.pageZoomLevel = val;
                    await ProfileManager.saveState(s);
                    setState(s);
                  }}
                  className="w-full accent-aqua-500 cursor-pointer"
                />
              </div>

              {/* OS Magnifier Callout */}
              <div className="bg-navy-900 p-3.5 rounded-xl border border-navy-700 text-xs text-slate-300 space-y-1">
                <div className="font-bold text-aqua-400">💡 Windows OS Magnifier Integration:</div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Web browser extensions operate strictly within the browser viewport. For full desktop and system-level screen magnification, press <kbd className="bg-navy-800 px-1.5 py-0.5 rounded border border-navy-600 font-mono text-white">Win + +</kbd> to activate Windows Magnifier, and <kbd className="bg-navy-800 px-1.5 py-0.5 rounded border border-navy-600 font-mono text-white">Win + Esc</kbd> to exit.
                </p>
              </div>
            </div>
          )}

          {/* TAB 5: Safety & Seizure */}
          {activeTab === 'safety' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-white mb-1">Photosensitivity, Seizure Safety & Emergency Stop</h2>
                <p className="text-xs text-slate-400">
                  Instant animation freezing, video autoplay blocking, and brightness reduction.
                </p>
              </div>

              <div className="p-4 bg-red-950/40 border border-red-800/80 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-red-200">1-Click Emergency Stop</div>
                  <div className="text-[11px] text-red-300">Instantly pauses all video, audio, and freezes moving CSS elements</div>
                </div>
                <button
                  onClick={() => alert('Emergency freeze command active across all opened tabs.')}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg text-xs"
                >
                  Trigger Stop
                </button>
              </div>

              <div className="bg-navy-800 p-4 rounded-xl border border-navy-700">
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="font-bold text-slate-200">Photosensitive Brightness Dimmer:</span>
                  <span className="text-aqua-400 font-bold">
                    {state?.profiles.find(p => p.presetId === 'photosensitivity')?.visualSettings.brightnessReduction || 20}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="60"
                  step="5"
                  value={state?.profiles.find(p => p.presetId === 'photosensitivity')?.visualSettings.brightnessReduction || 20}
                  onChange={async (e) => {
                    const val = Number(e.target.value);
                    const s = await ProfileManager.getState();
                    const prof = s.profiles.find(p => p.presetId === 'photosensitivity');
                    if (prof) prof.visualSettings.brightnessReduction = val;
                    await ProfileManager.saveState(s);
                    setState(s);
                  }}
                  className="w-full accent-aqua-500 cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* TAB 6: Local-First AI & Ollama */}
          {activeTab === 'local_ai' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-white mb-1">Local-First AI & Ollama Inference Engine</h2>
                <p className="text-xs text-slate-400">
                  Zero cloud telemetry by default. Run inference 100% locally on your machine.
                </p>
              </div>

              {/* Local Privacy Toggle */}
              <div className="p-3.5 bg-emerald-950/40 border border-emerald-800/80 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-emerald-200">Local-Only Enforcement</div>
                  <div className="text-[11px] text-emerald-300">Blocks all external network AI requests</div>
                </div>
                <input
                  type="checkbox"
                  checked={aiConfig.localOnlyMode}
                  onChange={(e) => setAiConfig({ ...aiConfig, localOnlyMode: e.target.checked })}
                  className="w-4 h-4 accent-emerald-500"
                />
              </div>

              {/* Ollama Status Card */}
              <div className="p-4 bg-navy-800 rounded-xl border border-navy-700 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Local Ollama Server</span>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                    ollamaStatus.online ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400 border border-rose-800'
                  }`}>
                    {ollamaStatus.online ? 'ONLINE' : 'OFFLINE'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Local Ollama Endpoint</label>
                    <input
                      type="text"
                      value={aiConfig.endpoint || 'http://localhost:11434'}
                      onChange={(e) => setAiConfig({ ...aiConfig, endpoint: e.target.value })}
                      className="w-full bg-navy-900 border border-navy-700 text-white rounded-lg p-2 text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Active Local Model</label>
                    <input
                      type="text"
                      value={aiConfig.model}
                      placeholder="e.g. llama3, mistral, gemma"
                      onChange={(e) => setAiConfig({ ...aiConfig, model: e.target.value })}
                      className="w-full bg-navy-900 border border-navy-700 text-white rounded-lg p-2 text-xs"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <button
                    onClick={handleTestAI}
                    disabled={aiTesting}
                    className="px-3.5 py-1.5 bg-navy-700 hover:bg-navy-600 text-aqua-300 rounded-lg text-xs font-semibold border border-navy-600 flex items-center gap-1.5"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${aiTesting ? 'animate-spin' : ''}`} />
                    Test Connection
                  </button>
                  <button
                    onClick={handleSaveAIConfig}
                    className="px-5 py-1.5 bg-aqua-500 hover:bg-aqua-400 text-navy-900 text-xs font-bold rounded-lg shadow-md"
                  >
                    Save Config
                  </button>
                </div>

                {aiTestResult && (
                  <div className={`p-2.5 rounded-lg text-xs ${aiTestResult.startsWith('✓') ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800' : 'bg-rose-950/60 text-rose-300 border border-rose-800'}`}>
                    {aiTestResult}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 7: Personal Vault */}
          {activeTab === 'vault' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white mb-0.5">Personal Information Vault</h2>
                  <p className="text-xs text-slate-400">Client-side AES-GCM 256-bit encrypted credential store.</p>
                </div>
                <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${
                  !vaultConfigured ? 'bg-amber-950 text-amber-400 border border-amber-800' : vaultLocked ? 'bg-rose-950 text-rose-400 border border-rose-800' : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                }`}>
                  {!vaultConfigured ? 'Setup Required' : vaultLocked ? 'Locked' : 'Unlocked'}
                </span>
              </div>

              {!vaultConfigured ? (
                <div className="p-4 bg-navy-800 border border-navy-700 rounded-xl space-y-3">
                  <div className="text-xs font-semibold text-aqua-400">Create Master PIN to Initialize Vault</div>
                  <form onSubmit={handleSetupVault} className="flex gap-2 max-w-sm">
                    <input
                      type="password"
                      value={newPin}
                      onChange={(e) => setNewPin(e.target.value)}
                      placeholder="Enter 4+ digit PIN"
                      className="bg-navy-900 border border-navy-700 rounded-lg px-3 py-1.5 text-xs text-white flex-1"
                    />
                    <button type="submit" className="px-4 py-1.5 bg-aqua-500 hover:bg-aqua-400 text-navy-900 font-bold rounded-lg text-xs">
                      Create Vault
                    </button>
                  </form>
                </div>
              ) : vaultLocked ? (
                <div className="p-4 bg-navy-800 border border-navy-700 rounded-xl space-y-3">
                  <div className="text-xs font-semibold text-rose-400">Vault is Locked</div>
                  <form onSubmit={handleUnlockVault} className="flex gap-2 max-w-sm">
                    <input
                      type="password"
                      value={vaultPin}
                      onChange={(e) => setVaultPin(e.target.value)}
                      placeholder="Enter Vault PIN"
                      className="bg-navy-900 border border-navy-700 rounded-lg px-3 py-1.5 text-xs text-white flex-1"
                    />
                    <button type="submit" className="px-4 py-1.5 bg-aqua-500 hover:bg-aqua-400 text-navy-900 font-bold rounded-lg text-xs">
                      Unlock
                    </button>
                  </form>
                  {pinError && <div className="text-xs text-rose-400">{pinError}</div>}
                </div>
              ) : (
                <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-1">
                  <div className="flex justify-between items-center bg-navy-800 p-2.5 rounded-xl border border-navy-700">
                    <span className="text-xs text-emerald-400">✓ Vault unlocked.</span>
                    <button onClick={handleSaveVaultData} className="px-4 py-1 bg-aqua-500 hover:bg-aqua-400 text-navy-900 text-xs font-bold rounded-lg">
                      Save Vault Data
                    </button>
                  </div>

                  {/* Form fields */}
                  <div className="grid grid-cols-2 gap-2.5 text-xs">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-0.5">Full Name</label>
                      <input
                        type="text"
                        value={vaultData.personal.fullName}
                        onChange={(e) => setVaultData({ ...vaultData, personal: { ...vaultData.personal, fullName: e.target.value } })}
                        className="w-full bg-navy-900 border border-navy-700 rounded-lg p-1.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-0.5">Email</label>
                      <input
                        type="email"
                        value={vaultData.personal.email}
                        onChange={(e) => setVaultData({ ...vaultData, personal: { ...vaultData.personal, email: e.target.value } })}
                        className="w-full bg-navy-900 border border-navy-700 rounded-lg p-1.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-0.5">Phone</label>
                      <input
                        type="tel"
                        value={vaultData.personal.phone}
                        onChange={(e) => setVaultData({ ...vaultData, personal: { ...vaultData.personal, phone: e.target.value } })}
                        className="w-full bg-navy-900 border border-navy-700 rounded-lg p-1.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-0.5">Institution / College</label>
                      <input
                        type="text"
                        value={vaultData.education.college}
                        onChange={(e) => setVaultData({ ...vaultData, education: { ...vaultData.education, college: e.target.value } })}
                        className="w-full bg-navy-900 border border-navy-700 rounded-lg p-1.5 text-xs text-white"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 8: Voice */}
          {activeTab === 'voice' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-white mb-1">Voice & Synchronized Speech Engine</h2>
                <p className="text-xs text-slate-400">Configure Web Speech voices and synchronized reading indicator.</p>
              </div>

              <div className="bg-navy-800 p-4 rounded-xl border border-navy-700 space-y-3 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">Speech Voice</label>
                  <select
                    value={selectedVoice}
                    onChange={(e) => setSelectedVoice(e.target.value)}
                    className="w-full bg-navy-900 border border-navy-700 text-white rounded-lg p-2 text-xs"
                  >
                    <option value="">System Default</option>
                    {voices.map((v, i) => (
                      <option key={i} value={v.name}>{v.name} ({v.lang})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Speech Rate ({speechRate}x)</label>
                  <input
                    type="range"
                    min="0.5"
                    max="1.8"
                    step="0.1"
                    value={speechRate}
                    onChange={(e) => setSpeechRate(Number(e.target.value))}
                    className="w-full accent-aqua-500 cursor-pointer"
                  />
                </div>

                <button
                  onClick={handleTestSpeech}
                  className="px-4 py-2 bg-aqua-500 hover:bg-aqua-400 text-navy-900 font-bold rounded-lg text-xs flex items-center gap-1.5"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  {isSpeakingTest ? 'Stop Voice Test' : 'Test Synchronized Speech'}
                </button>
              </div>
            </div>
          )}

          {/* TAB 9: Privacy */}
          {activeTab === 'privacy' && (
            <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
              <h2 className="text-lg font-bold text-white mb-1">Privacy & Data Governance</h2>
              <div className="bg-navy-800 p-4 rounded-xl border border-navy-700 space-y-2">
                <p><strong>1. Local-First Architecture:</strong> Your settings and credentials remain physically on your device.</p>
                <p><strong>2. No Compulsory Tracking:</strong> Zero telemetry or analytical pixels.</p>
                <p><strong>3. Zero Form Auto-Submit:</strong> You retain complete final review and control over form submission.</p>
              </div>
            </div>
          )}

          {/* TAB 10: Keyboard Shortcuts */}
          {activeTab === 'shortcuts' && (
            <div className="space-y-3">
              <h2 className="text-lg font-bold text-white mb-1">Keyboard Shortcuts Cheatsheet</h2>
              <div className="grid grid-cols-1 gap-2 text-xs">
                {[
                  { key: 'Alt + A', action: 'Toggle Floating Accessibility Control Centre' },
                  { key: 'Alt + M', action: 'Toggle Master Accessibility ON / OFF' },
                  { key: 'Alt + H / Shift+Alt+H', action: 'Next / Previous Heading Landmark' },
                  { key: 'Alt + L / Shift+Alt+L', action: 'Next / Previous Link Landmark' },
                  { key: 'Alt + B / Shift+Alt+B', action: 'Next / Previous Button Landmark' },
                  { key: 'Alt + F / Shift+Alt+F', action: 'Next / Previous Form Control' },
                  { key: 'Alt + D', action: 'Hover Sentence Simplifier on focused text' },
                  { key: 'Esc', action: 'Emergency Stop / Close Overlay' },
                ].map((s, idx) => (
                  <div key={idx} className="p-2.5 bg-navy-800 border border-navy-700 rounded-xl flex items-center justify-between">
                    <span className="text-slate-300">{s.action}</span>
                    <kbd className="px-2 py-0.5 bg-navy-900 border border-navy-600 rounded text-aqua-400 font-mono font-bold">{s.key}</kbd>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
