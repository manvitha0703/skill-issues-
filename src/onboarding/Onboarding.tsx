import React, { useState } from 'react';
import {
  Eye,
  Check,
  ChevronRight,
  Shield,
  Sparkles,
  ArrowRight,
  Settings,
  Lock,
  Heart,
  Volume2,
} from 'lucide-react';
import { ProfileManager } from '../accessibility/profileManager';
import { SafeStorage } from '../storage/chromeStorage';

interface ProfileOption {
  id: string;
  presetId: string;
  title: string;
  icon: string;
  desc: string;
  recommendedFor: string;
}

const PROFILE_OPTIONS: ProfileOption[] = [
  {
    id: 'preset_dyslexia',
    presetId: 'dyslexia',
    title: 'Dyslexia-Friendly',
    icon: '📖',
    desc: 'Weighted fonts, wider character/word spacing, line height, reading ruler.',
    recommendedFor: 'Dyslexia, reading fatigue, visual crowding',
  },
  {
    id: 'preset_colorBlindness',
    presetId: 'colorBlindness',
    title: 'Color Blindness Adaptation',
    icon: '🎨',
    desc: 'Color matrix filters for Protanopia, Deuteranopia, Tritanopia, & text status badges.',
    recommendedFor: 'Red-green or blue-yellow color deficiencies',
  },
  {
    id: 'preset_lowVision',
    presetId: 'lowVision',
    title: 'Low Vision Assistance',
    icon: '🔍',
    desc: 'Large scalable text, reinforced borders, prominent focus, high contrast.',
    recommendedFor: 'Visual impairments, blurred vision, eye strain',
  },
  {
    id: 'preset_blindScreenReader',
    presetId: 'blindScreenReader',
    title: 'Blind / Screen Reader Navigation',
    icon: '🦯',
    desc: 'Heading hierarchy, landmark jumps, image alt text generation, speech narration.',
    recommendedFor: 'Screen reader users, non-visual browsing',
  },
  {
    id: 'preset_photosensitivity',
    presetId: 'photosensitivity',
    title: 'Photosensitivity & Seizure Protection',
    icon: '🛡️',
    desc: 'Suppresses animations, pauses autoplay video, disables flashing elements.',
    recommendedFor: 'Epilepsy, vestibular disorders, motion sensitivity',
  },
  {
    id: 'preset_adhdFocus',
    presetId: 'adhdFocus',
    title: 'ADHD & Cognitive Focus',
    icon: '🎯',
    desc: 'Removes distracting banners/ads, dims sidebars, highlights active paragraph.',
    recommendedFor: 'ADHD, neurodivergence, concentration fatigue',
  },
  {
    id: 'preset_motorAccessibility',
    presetId: 'motorAccessibility',
    title: 'Motor Accessibility',
    icon: '🖐️',
    desc: 'Expanded click targets (min 44px), spacing between buttons, large custom cursor.',
    recommendedFor: 'Tremors, arthritis, motor disabilities, switch users',
  },
  {
    id: 'preset_languageAssistance',
    presetId: 'languageAssistance',
    title: 'Language & Translation',
    icon: '🌐',
    desc: 'Translation into Indian regional languages (Hindi, Kannada, Tamil, etc.) and explanations.',
    recommendedFor: 'Multilingual readers, English language learners',
  },
  {
    id: 'preset_simplifiedReading',
    presetId: 'simplifiedReading',
    title: 'Simplified Reading & Plain Language',
    icon: '✨',
    desc: 'Rewrites dense paragraphs into short sentences and defines technical jargon.',
    recommendedFor: 'Cognitive load, non-native speakers, plain language',
  },
  {
    id: 'preset_seniorFriendly',
    presetId: 'seniorFriendly',
    title: 'Senior-Friendly Mode',
    icon: '👓',
    desc: 'Extra-large readable fonts, high contrast, clean buttons, and voice support.',
    recommendedFor: 'Older adults, age-related vision and motor changes',
  },
];

export const Onboarding: React.FC = () => {
  const [step, setStep] = useState<number>(1);
  const [selectedProfiles, setSelectedProfiles] = useState<string[]>([]);
  const [preferredLang, setPreferredLang] = useState<string>('en');
  const [fontSize, setFontSize] = useState<number>(20);
  const [fontFamily, setFontFamily] = useState<string>('default');
  const [readingLevel, setReadingLevel] = useState<string>('simple');
  const [contrastMode, setContrastMode] = useState<string>('normal');
  const [motionReduced, setMotionReduced] = useState<boolean>(true);
  const [consentGiven, setConsentGiven] = useState<boolean>(true);

  const toggleProfile = (id: string) => {
    if (selectedProfiles.includes(id)) {
      setSelectedProfiles(selectedProfiles.filter((p) => p !== id));
    } else {
      setSelectedProfiles([...selectedProfiles, id]);
    }
  };

  const handleFinish = async () => {
    const state = await ProfileManager.getState();
    state.masterToggle = true;
    state.activeProfileIds = selectedProfiles;
    state.profiles = state.profiles.map((p) => ({
      ...p,
      enabled: selectedProfiles.includes(p.id),
    }));

    await ProfileManager.saveState(state);
    await SafeStorage.set('swde_onboarding_complete', true);

    // Close or redirect to demo page
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.create({ url: chrome.runtime.getURL('demo.html') });
      window.close();
    } else {
      window.location.href = 'demo.html';
    }
  };

  return (
    <div className="min-h-screen bg-navy-900 text-slate-100 flex flex-col justify-between p-6 sm:p-12 font-sans selection:bg-aqua-500">
      <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col">
        {/* Top Navbar */}
        <div className="flex items-center justify-between border-b border-navy-800 pb-6 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-aqua-600 to-aqua-400 flex items-center justify-center text-white shadow-lg">
              <Eye className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-white">Same Web, Different Eyes</h1>
              <p className="text-xs text-aqua-400">The internet adapts to you. Not the other way around.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <div
                key={s}
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step === s
                    ? 'bg-aqua-500 text-navy-900 ring-4 ring-aqua-500/20'
                    : step > s
                    ? 'bg-emerald-600 text-white'
                    : 'bg-navy-800 text-slate-500'
                }`}
              >
                {step > s ? <Check className="w-3.5 h-3.5" /> : s}
              </div>
            ))}
          </div>
        </div>

        {/* SCREEN 1: Welcome */}
        {step === 1 && (
          <div className="my-auto py-8 text-center max-w-2xl mx-auto">
            <div className="w-20 h-20 rounded-3xl bg-aqua-500/10 border border-aqua-500/30 text-aqua-400 flex items-center justify-center mx-auto mb-8 shadow-inner">
              <Sparkles className="w-10 h-10" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
              Welcome to Same Web, Different Eyes
            </h2>
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed mb-10">
              The internet was built around narrow assumptions. We believe the web should work for everyone—adapting
              typography, colors, layouts, cognitive load, and forms automatically to your unique eyes and mind.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setStep(2)}
                className="px-8 py-3.5 bg-aqua-500 hover:bg-aqua-400 text-navy-900 font-bold rounded-xl text-base shadow-lg transition-transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                Get Started <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => setStep(2)}
                className="px-8 py-3.5 bg-navy-800 hover:bg-navy-700 text-slate-200 font-semibold rounded-xl text-base border border-navy-700 transition-colors"
              >
                Explore Accessibility Features
              </button>
            </div>
          </div>
        )}

        {/* SCREEN 2: Accessibility Profile Setup */}
        {step === 2 && (
          <div className="flex-1 flex flex-col">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">Select Your Accessibility Profiles</h2>
              <p className="text-sm text-slate-400">
                Choose one or more profiles that match your browsing needs. They combine seamlessly.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 overflow-y-auto max-h-[52vh] pr-1">
              {PROFILE_OPTIONS.map((opt) => {
                const selected = selectedProfiles.includes(opt.id);
                return (
                  <div
                    key={opt.id}
                    onClick={() => toggleProfile(opt.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all flex gap-3.5 ${
                      selected
                        ? 'bg-aqua-950/40 border-aqua-500 text-white ring-1 ring-aqua-500'
                        : 'bg-navy-800/80 border-navy-700 hover:bg-navy-800 text-slate-300'
                    }`}
                  >
                    <div className="text-2xl pt-0.5">{opt.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="font-semibold text-sm text-white">{opt.title}</div>
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                            selected
                              ? 'bg-aqua-500 border-aqua-400 text-navy-900'
                              : 'border-navy-600 bg-navy-900'
                          }`}
                        >
                          {selected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 mb-2 leading-relaxed">{opt.desc}</p>
                      <div className="text-[11px] text-aqua-400 font-medium">
                        Recommended for: {opt.recommendedFor}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 pt-4 border-t border-navy-800 flex justify-between items-center">
              <button
                onClick={() => {
                  setSelectedProfiles([]);
                  setStep(3);
                }}
                className="text-xs text-slate-400 hover:text-white underline"
              >
                None of these — customize manually
              </button>
              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="px-5 py-2.5 bg-navy-800 hover:bg-navy-700 text-slate-300 rounded-xl text-sm font-semibold border border-navy-700"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="px-6 py-2.5 bg-aqua-500 hover:bg-aqua-400 text-navy-900 font-bold rounded-xl text-sm shadow-md"
                >
                  Continue ({selectedProfiles.length} selected) &rarr;
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SCREEN 3: Personal Preferences */}
        {step === 3 && (
          <div className="flex-1 flex flex-col">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">Fine-Tune Your Preferences</h2>
              <p className="text-sm text-slate-400">
                Customize reading, typography, and contrast to your exact liking.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto max-h-[52vh] pr-2">
              {/* Preferred Language */}
              <div className="bg-navy-800 p-4 rounded-xl border border-navy-700">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Preferred Language
                </label>
                <select
                  value={preferredLang}
                  onChange={(e) => setPreferredLang(e.target.value)}
                  className="w-full bg-navy-900 border border-navy-700 text-white rounded-lg p-2.5 text-sm"
                >
                  <option value="en">English</option>
                  <option value="hi">Hindi (हिन्दी)</option>
                  <option value="kn">Kannada (ಕನ್ನಡ)</option>
                  <option value="ta">Tamil (தமிழ்)</option>
                  <option value="te">Telugu (తెలుగు)</option>
                  <option value="ml">Malayalam (മലയാളം)</option>
                  <option value="bn">Bengali (বাংলা)</option>
                  <option value="mr">Marathi (मराठी)</option>
                </select>
              </div>

              {/* Font Size Scaling */}
              <div className="bg-navy-800 p-4 rounded-xl border border-navy-700">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Text Size Adjustment (+{fontSize}%)
                </label>
                <input
                  type="range"
                  min="0"
                  max="80"
                  step="10"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full accent-aqua-500 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                  <span>Standard (0%)</span>
                  <span>Medium (+40%)</span>
                  <span>Extra Large (+80%)</span>
                </div>
              </div>

              {/* Font Family */}
              <div className="bg-navy-800 p-4 rounded-xl border border-navy-700">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Accessible Font Family
                </label>
                <select
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value)}
                  className="w-full bg-navy-900 border border-navy-700 text-white rounded-lg p-2.5 text-sm"
                >
                  <option value="default">Default Page Font</option>
                  <option value="opendyslexic">OpenDyslexic (Weighted Bottoms)</option>
                  <option value="atkinson">Atkinson Hyperlegible (Low Vision)</option>
                  <option value="sans-serif">Clean Sans-Serif</option>
                </select>
              </div>

              {/* Reading Level */}
              <div className="bg-navy-800 p-4 rounded-xl border border-navy-700">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  AI Simplification Level
                </label>
                <select
                  value={readingLevel}
                  onChange={(e) => setReadingLevel(e.target.value)}
                  className="w-full bg-navy-900 border border-navy-700 text-white rounded-lg p-2.5 text-sm"
                >
                  <option value="very_simple">Very Simple (Elementary / Plain Bullet Points)</option>
                  <option value="simple">Simple (Middle School / Jargon Explained)</option>
                  <option value="standard">Standard (Clear & Direct)</option>
                  <option value="detailed">Detailed (Thorough Academic Breakdown)</option>
                </select>
              </div>

              {/* Contrast Mode */}
              <div className="bg-navy-800 p-4 rounded-xl border border-navy-700">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Visual Contrast
                </label>
                <select
                  value={contrastMode}
                  onChange={(e) => setContrastMode(e.target.value)}
                  className="w-full bg-navy-900 border border-navy-700 text-white rounded-lg p-2.5 text-sm"
                >
                  <option value="normal">Normal Web Contrast</option>
                  <option value="high">High Contrast (Reinforced Borders)</option>
                  <option value="dark">Dark Mode Theme</option>
                  <option value="sepia">Warm Sepia (Reduces Strain)</option>
                </select>
              </div>

              {/* Reduced Motion Toggle */}
              <div className="bg-navy-800 p-4 rounded-xl border border-navy-700 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Reduce Jarring Motion
                  </div>
                  <div className="text-xs text-slate-400">Disable CSS animations & flashing banners</div>
                </div>
                <input
                  type="checkbox"
                  checked={motionReduced}
                  onChange={(e) => setMotionReduced(e.target.checked)}
                  className="w-5 h-5 accent-aqua-500 cursor-pointer"
                />
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-navy-800 flex justify-between items-center">
              <button
                onClick={() => setStep(2)}
                className="px-5 py-2.5 bg-navy-800 hover:bg-navy-700 text-slate-300 rounded-xl text-sm font-semibold border border-navy-700"
              >
                Back
              </button>
              <button
                onClick={() => setStep(4)}
                className="px-6 py-2.5 bg-aqua-500 hover:bg-aqua-400 text-navy-900 font-bold rounded-xl text-sm shadow-md"
              >
                Continue to Privacy &rarr;
              </button>
            </div>
          </div>
        )}

        {/* SCREEN 4: Privacy & Security */}
        {step === 4 && (
          <div className="my-auto max-w-2xl mx-auto py-6">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-6">
              <Shield className="w-7 h-7" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-3">
              Privacy First, By Design
            </h2>
            <p className="text-sm text-slate-300 text-center mb-8">
              Accessibility should never require sacrificing your personal privacy or safety.
            </p>

            <div className="space-y-4 mb-8">
              <div className="bg-navy-800 p-4 rounded-xl border border-navy-700 flex gap-3.5 items-start">
                <Lock className="w-5 h-5 text-aqua-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-sm text-white">Local-First Encrypted Vault</div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Your personal information vault is encrypted using AES-GCM 256-bit with your personal PIN. It
                    remains strictly on your device. We never sell, track, or sync your data.
                  </p>
                </div>
              </div>

              <div className="bg-navy-800 p-4 rounded-xl border border-navy-700 flex gap-3.5 items-start">
                <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-sm text-white">Zero Form Auto-Submission</div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    The extension never automatically submits online forms or makes transactions. Every matched field is
                    shown to you for review and approval first.
                  </p>
                </div>
              </div>

              <div className="bg-navy-800 p-4 rounded-xl border border-navy-700 flex gap-3.5 items-start">
                <Heart className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-sm text-white">No Compulsory Data Requirements</div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    You do not need to enter any personal data to use the accessibility filters, dyslexia reader, speech
                    tools, or contrast adaptations.
                  </p>
                </div>
              </div>
            </div>

            <label className="flex items-center gap-3 p-3 bg-navy-800/80 rounded-xl border border-navy-700 cursor-pointer mb-8">
              <input
                type="checkbox"
                checked={consentGiven}
                onChange={(e) => setConsentGiven(e.target.checked)}
                className="w-4 h-4 accent-aqua-500"
              />
              <span className="text-xs text-slate-300">
                I understand that my accessibility profiles and optional vault info are stored locally on my device.
              </span>
            </label>

            <div className="flex justify-between items-center">
              <button
                onClick={() => setStep(3)}
                className="px-5 py-2.5 bg-navy-800 hover:bg-navy-700 text-slate-300 rounded-xl text-sm font-semibold border border-navy-700"
              >
                Back
              </button>
              <button
                onClick={() => setStep(5)}
                disabled={!consentGiven}
                className="px-6 py-2.5 bg-aqua-500 hover:bg-aqua-400 disabled:opacity-40 text-navy-900 font-bold rounded-xl text-sm shadow-md"
              >
                Accept & Complete &rarr;
              </button>
            </div>
          </div>
        )}

        {/* SCREEN 5: Complete Setup */}
        {step === 5 && (
          <div className="my-auto py-8 text-center max-w-xl mx-auto">
            <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-8 shadow-inner">
              <Check className="w-10 h-10 stroke-[3]" />
            </div>

            <h2 className="text-3xl font-bold text-white mb-3">All Set & Ready!</h2>
            <p className="text-lg text-slate-300 mb-8 leading-relaxed">
              Your browsing experience is ready to adapt to you. Visit any website or explore our interactive
              demonstration portal to test your new accessibility layer.
            </p>

            <button
              onClick={handleFinish}
              className="px-10 py-4 bg-aqua-500 hover:bg-aqua-400 text-navy-900 font-extrabold rounded-xl text-base shadow-xl transition-transform hover:-translate-y-0.5 inline-flex items-center gap-2"
            >
              Start Browsing Demo Portal <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
