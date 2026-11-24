import React, { useState, useEffect } from 'react';
import { StyleGenerator } from '../accessibility/styleGenerator';
import { ProfileManager } from '../accessibility/profileManager';
import { DEFAULT_PROFILES } from '../accessibility/presets';
import { FormDetector } from '../content/formDetection/formDetector';
import { FieldMatcher } from '../content/formDetection/fieldMatcher';
import { FormFiller } from '../content/formDetection/formFiller';
import { FormReviewModal } from '../content/formDetection/formReviewModal';
import { ReadingModeOverlay } from '../content/readingMode/readingMode';
import { VaultData } from '../types/vault';
import { SpeechService } from '../voice/speechService';
import { SynchronizedReadingEngine } from '../content/screenReader/synchronizedReadingEngine';
import { SentenceHoverSimplifier } from '../content/dyslexia/sentenceHoverSimplifier';
import { PhotosensitivityGuard } from '../content/photosensitivity/photosensitivityGuard';
import { AdhdFocusEngine } from '../content/focus/adhdFocusEngine';
import { LocalTranslationEngine } from '../ai/localTranslationEngine';
import { ImageOcrEngine, ImageAnalysisResult } from '../ai/imageOcrEngine';
import { ColorBlindnessType } from '../types/profile';

// Built-in sample student profile for demonstration purposes
const DEMO_VAULT: VaultData = {
  personal: {
    firstName: 'Ananya',
    lastName: 'Sharma',
    fullName: 'Ananya Sharma',
    dateOfBirth: '2002-08-14',
    gender: 'Female',
    email: 'ananya.sharma@example.edu',
    phone: '+91 98765 43210',
  },
  address: {
    addressLine: '42 Orchid Residency, 5th Cross, Rajajinagar',
    city: 'Bengaluru',
    state: 'Karnataka',
    country: 'India',
    pinCode: '560010',
  },
  education: {
    school: 'National Public School',
    college: 'Sapthagiri NPS University',
    university: 'Visvesvaraya Technological University',
    course: 'Computer Science and Engineering',
    degree: 'Bachelor of Technology',
    graduationYear: '2026',
    studentId: '1SP22CS045',
    gpaCgpa: '9.4',
  },
  professional: {
    jobTitle: 'Research Fellow',
    skills: 'React, TypeScript, Accessibility, AI Integration',
    workExperience: '2 years',
    organization: 'Digital Inclusion Labs',
    resumeDetails: 'Passionate about accessible computing for all',
  },
  customFields: [
    { id: 'c1', name: 'Blood Group', value: 'B+', category: 'personal' },
    { id: 'c2', name: 'Family Annual Income', value: 'INR 4,50,000', category: 'academic' },
  ],
};

const COLORBLIND_PRESETS: { type: ColorBlindnessType; name: string; description: string }[] = [
  { type: 'protanopia', name: 'Protanopia', description: 'Red-blind (Brettel 1997 matrix)' },
  { type: 'protanomaly', name: 'Protanomaly', description: 'Red-weak (Machado anomalous trichromacy)' },
  { type: 'deuteranopia', name: 'Deuteranopia', description: 'Green-blind (Brettel 1997 matrix)' },
  { type: 'deuteranomaly', name: 'Deuteranomaly', description: 'Green-weak (Machado anomalous trichromacy)' },
  { type: 'tritanopia', name: 'Tritanopia', description: 'Blue-blind (Brettel 1997 matrix)' },
  { type: 'tritanomaly', name: 'Tritanomaly', description: 'Blue-weak (Machado anomalous trichromacy)' },
  { type: 'achromatopsia', name: 'Achromatopsia', description: 'Total color blindness (Greyscale luminance)' },
  { type: 'achromatomaly', name: 'Achromatomaly', description: 'Partial monochromacy (Desaturated)' },
];

export const DemoApp: React.FC = () => {
  const [activePreset, setActivePreset] = useState<string>('none');
  const [submissionStatus, setSubmissionStatus] = useState<string | null>(null);

  // Color Blindness state
  const [selectedCbType, setSelectedCbType] = useState<ColorBlindnessType>('deuteranopia');
  const [cbIntensity, setCbIntensity] = useState<number>(100);
  const [cbActive, setCbActive] = useState<boolean>(false);

  // Dyslexia state
  const [singleLineFocus, setSingleLineFocus] = useState<boolean>(false);
  const [readingRuler, setReadingRuler] = useState<boolean>(false);
  const [warmTint, setWarmTint] = useState<number>(0);
  const [hoverSimplifierActive, setHoverSimplifierActive] = useState<boolean>(false);

  // Reading Engine state
  const [isNarrating, setIsNarrating] = useState<boolean>(false);

  // Safety & Focus state
  const [emergencyStopped, setEmergencyStopped] = useState<boolean>(false);
  const [brightnessDim, setBrightnessDim] = useState<number>(0);
  const [spotlightActive, setSpotlightActive] = useState<boolean>(false);

  // Translation state
  const [targetLang, setTargetLang] = useState<string>('hi');
  const [isTranslated, setIsTranslated] = useState<boolean>(false);
  const [translationNotice, setTranslationNotice] = useState<string | null>(null);

  // OCR state
  const [ocrResult, setOcrResult] = useState<ImageAnalysisResult | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      StyleGenerator.removeFromDOM();
      SentenceHoverSimplifier.disable();
      SynchronizedReadingEngine.stopReading();
      AdhdFocusEngine.disableSpotlight();
      PhotosensitivityGuard.disable();
      LocalTranslationEngine.restoreOriginalPage();
    };
  }, []);

  const applyDemoPreset = (presetId: string) => {
    setActivePreset(presetId);
    if (presetId === 'none') {
      StyleGenerator.removeFromDOM();
      SentenceHoverSimplifier.disable();
      SynchronizedReadingEngine.stopReading();
      AdhdFocusEngine.disableSpotlight();
      PhotosensitivityGuard.disable();
      LocalTranslationEngine.restoreOriginalPage();
      setCbActive(false);
      setSingleLineFocus(false);
      setReadingRuler(false);
      setWarmTint(0);
      setBrightnessDim(0);
      setSpotlightActive(false);
      setHoverSimplifierActive(false);
      setIsTranslated(false);
      setTranslationNotice(null);
      if (emergencyStopped) {
        PhotosensitivityGuard.clearEmergencyStop();
        setEmergencyStopped(false);
      }
      return;
    }

    const state = {
      masterToggle: true,
      activeProfileIds: [presetId],
      profiles: DEFAULT_PROFILES.map((p) => ({
        ...p,
        enabled: p.presetId === presetId || p.id === presetId,
      })),
      activeSiteDomain: 'localhost',
      siteExceptions: {},
    };

    const effective = ProfileManager.getEffectiveSettings(state);
    StyleGenerator.applyToDOM(effective);

    // Apply specific helpers for preset
    if (presetId === 'dyslexia') {
      setWarmTint(effective?.visual.warmTintIntensity || 20);
      setSingleLineFocus(true);
      StyleGenerator.updateReadingFocus(false, true, 36);
      SentenceHoverSimplifier.enable();
      setHoverSimplifierActive(true);
    } else if (presetId === 'colorBlindness') {
      setCbActive(true);
    } else if (presetId === 'adhdFocus') {
      AdhdFocusEngine.enableSpotlight();
      setSpotlightActive(true);
    } else if (presetId === 'photosensitivity') {
      PhotosensitivityGuard.enable(true, true, 20);
      setBrightnessDim(20);
    }
  };

  // Live Color Blindness Matrix Change
  const handleColorBlindChange = (type: ColorBlindnessType, intensity: number) => {
    setSelectedCbType(type);
    setCbIntensity(intensity);
    setCbActive(true);
    StyleGenerator.updateColorBlindnessFilter(type, intensity);
  };

  // Dyslexia reading tools
  const toggleReadingRuler = () => {
    const next = !readingRuler;
    setReadingRuler(next);
    StyleGenerator.updateReadingFocus(next, singleLineFocus, 36);
  };

  const toggleSingleLineFocus = () => {
    const next = !singleLineFocus;
    setSingleLineFocus(next);
    StyleGenerator.updateReadingFocus(readingRuler, next, 36);
  };

  const handleWarmTintChange = (intensity: number) => {
    setWarmTint(intensity);
    StyleGenerator.updateWarmTint(intensity);
  };

  const toggleHoverSimplifier = () => {
    if (hoverSimplifierActive) {
      SentenceHoverSimplifier.disable();
      setHoverSimplifierActive(false);
    } else {
      SentenceHoverSimplifier.enable();
      setHoverSimplifierActive(true);
    }
  };

  // Synchronized Visual Reading Narrator
  const startVisualReading = () => {
    setIsNarrating(true);
    SynchronizedReadingEngine.startReading(() => {
      setIsNarrating(false);
    });
  };

  const pauseOrResumeVisualReading = () => {
    SynchronizedReadingEngine.pauseOrResume();
  };

  const stopVisualReading = () => {
    SynchronizedReadingEngine.stopReading();
    setIsNarrating(false);
  };

  // Safety & Photosensitivity
  const toggleEmergencyStop = () => {
    if (emergencyStopped) {
      PhotosensitivityGuard.clearEmergencyStop();
      setEmergencyStopped(false);
    } else {
      PhotosensitivityGuard.triggerEmergencyStop();
      setEmergencyStopped(true);
    }
  };

  const handleBrightnessChange = (percentage: number) => {
    setBrightnessDim(percentage);
    StyleGenerator.updateBrightnessReduction(percentage);
  };

  // ADHD Spotlight
  const toggleSpotlight = () => {
    if (spotlightActive) {
      AdhdFocusEngine.disableSpotlight();
      setSpotlightActive(false);
    } else {
      AdhdFocusEngine.enableSpotlight();
      setSpotlightActive(true);
    }
  };

  // Local Translation
  const handleTranslatePage = () => {
    const res = LocalTranslationEngine.translateCurrentPage(targetLang);
    setIsTranslated(true);
    setTranslationNotice(`✓ Successfully translated ${res.translatedCount} text nodes to ${targetLang.toUpperCase()} using offline local engine! Zero cloud data was sent.`);
  };

  const handleRestorePage = () => {
    const count = LocalTranslationEngine.restoreOriginalPage();
    setIsTranslated(false);
    setTranslationNotice(`✓ Restored ${count} text nodes to original English.`);
  };

  // Image OCR Inspection
  const handleInspectImage = async () => {
    const imgEl = document.getElementById('demo-research-image') as HTMLImageElement | null;
    if (imgEl) {
      const result = await ImageOcrEngine.analyzeImage(imgEl, targetLang);
      setOcrResult(result);
      ImageOcrEngine.showImageOverlay(result);
    }
  };

  const handleTestAutoFill = () => {
    const fields = FormDetector.detectFields(document);
    const matches = FieldMatcher.matchFields(fields, DEMO_VAULT);
    FormReviewModal.show(matches, fields.length);
  };

  const handleTestReadingMode = () => {
    ReadingModeOverlay.open();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmissionStatus('✓ Application Submitted Successfully! All form fields verified.');
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800">
      {/* DEMO LIVE CONTROLLER BAR */}
      <header className="bg-navy-950 text-white p-3 border-b-2 border-aqua-500 sticky top-0 z-50 shadow-2xl">
        <div className="max-w-7xl mx-auto flex flex-col gap-2.5 text-xs">
          {/* Main Top Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="bg-gradient-to-r from-aqua-400 to-teal-400 text-navy-950 font-black px-2.5 py-1 rounded text-[11px] tracking-wide uppercase shadow">
                SWDE Demo Lab
              </span>
              <span className="font-semibold text-slate-200">
                Test "Same Web, Different Eyes" Accessibility Engine Live:
              </span>
            </div>

            {/* Emergency & Autofill Quick Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleEmergencyStop}
                className={`px-3 py-1.5 rounded-lg font-black transition-all flex items-center gap-1.5 shadow ${
                  emergencyStopped
                    ? 'bg-rose-500 text-white animate-pulse'
                    : 'bg-rose-900/80 hover:bg-rose-800 text-rose-200 border border-rose-700'
                }`}
                title="Immediately freeze all animations, suppress flashing, and pause media"
              >
                <span>🚨</span>
                <span>{emergencyStopped ? 'RESUME PAGE' : 'EMERGENCY FREEZE'}</span>
              </button>

              <button
                onClick={handleTestAutoFill}
                className="px-3.5 py-1.5 rounded-lg font-extrabold bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-navy-950 shadow-md flex items-center gap-1"
              >
                ⚡ Test Auto-Fill
              </button>
              <button
                onClick={handleTestReadingMode}
                className="px-3 py-1.5 rounded-lg font-bold bg-navy-800 hover:bg-navy-700 text-aqua-300 border border-navy-700"
              >
                📖 Reader View
              </button>
            </div>
          </div>

          {/* Row 1: Profile Presets */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-navy-800/80">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
              Presets:
            </span>
            <button
              onClick={() => applyDemoPreset('none')}
              className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                activePreset === 'none' && !cbActive
                  ? 'bg-rose-600 text-white shadow'
                  : 'bg-navy-800 hover:bg-navy-700 text-slate-300'
              }`}
            >
              Original Inaccessible
            </button>
            <button
              onClick={() => applyDemoPreset('dyslexia')}
              className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                activePreset === 'dyslexia'
                  ? 'bg-aqua-500 text-navy-950 shadow'
                  : 'bg-navy-800 hover:bg-navy-700 text-slate-300'
              }`}
            >
              📖 Dyslexia Mode
            </button>
            <button
              onClick={() => applyDemoPreset('colorBlindness')}
              className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                activePreset === 'colorBlindness' || cbActive
                  ? 'bg-aqua-500 text-navy-950 shadow'
                  : 'bg-navy-800 hover:bg-navy-700 text-slate-300'
              }`}
            >
              🎨 Color Blind
            </button>
            <button
              onClick={() => applyDemoPreset('lowVision')}
              className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                activePreset === 'lowVision'
                  ? 'bg-aqua-500 text-navy-950 shadow'
                  : 'bg-navy-800 hover:bg-navy-700 text-slate-300'
              }`}
            >
              🔍 Low Vision
            </button>
            <button
              onClick={() => applyDemoPreset('photosensitivity')}
              className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                activePreset === 'photosensitivity'
                  ? 'bg-aqua-500 text-navy-950 shadow'
                  : 'bg-navy-800 hover:bg-navy-700 text-slate-300'
              }`}
            >
              🛡️ Seizure Guard
            </button>
            <button
              onClick={() => applyDemoPreset('adhdFocus')}
              className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                activePreset === 'adhdFocus'
                  ? 'bg-aqua-500 text-navy-950 shadow'
                  : 'bg-navy-800 hover:bg-navy-700 text-slate-300'
              }`}
            >
              🎯 ADHD Focus
            </button>
            <button
              onClick={() => applyDemoPreset('seniorFriendly')}
              className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                activePreset === 'seniorFriendly'
                  ? 'bg-aqua-500 text-navy-950 shadow'
                  : 'bg-navy-800 hover:bg-navy-700 text-slate-300'
              }`}
            >
              👓 Senior Mode
            </button>
          </div>

          {/* Row 2: Live Feature Labs */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-2 pt-2 border-t border-navy-800 text-[11px]">
            {/* Color Blindness Quick Lab */}
            <div className="bg-navy-900 p-2 rounded-lg border border-navy-700 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-aqua-400">🎨 8 Color Blind Types</span>
                <span className="text-[10px] text-slate-400">{cbIntensity}%</span>
              </div>
              <div className="flex gap-1.5">
                <select
                  value={selectedCbType}
                  onChange={(e) => handleColorBlindChange(e.target.value as ColorBlindnessType, cbIntensity)}
                  className="bg-navy-950 text-white text-[11px] p-1 rounded border border-navy-700 flex-1"
                >
                  {COLORBLIND_PRESETS.map((p) => (
                    <option key={p.type} value={p.type}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={cbIntensity}
                  onChange={(e) => handleColorBlindChange(selectedCbType, Number(e.target.value))}
                  className="w-16 accent-aqua-500"
                  title="Severity intensity"
                />
              </div>
            </div>

            {/* Dyslexia Reading Lab */}
            <div className="bg-navy-900 p-2 rounded-lg border border-navy-700 space-y-1.5">
              <span className="font-bold text-aqua-400 block">📖 Dyslexia Reading Focus</span>
              <div className="flex flex-wrap gap-1">
                <button
                  onClick={toggleSingleLineFocus}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    singleLineFocus ? 'bg-amber-400 text-navy-950' : 'bg-navy-800 text-slate-300'
                  }`}
                  title="Dims surrounding lines, highlights active reading row"
                >
                  Line Focus
                </button>
                <button
                  onClick={toggleReadingRuler}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    readingRuler ? 'bg-amber-400 text-navy-950' : 'bg-navy-800 text-slate-300'
                  }`}
                  title="Movable guide ruler following pointer or Alt+Up/Down"
                >
                  Ruler
                </button>
                <button
                  onClick={toggleHoverSimplifier}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    hoverSimplifierActive ? 'bg-emerald-400 text-navy-950' : 'bg-navy-800 text-slate-300'
                  }`}
                  title="Hover pointer over complex text to show plain-language tooltip"
                >
                  Hover AI Tooltip
                </button>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-slate-300">
                <span>Warm Tint:</span>
                <input
                  type="range"
                  min="0"
                  max="40"
                  value={warmTint}
                  onChange={(e) => handleWarmTintChange(Number(e.target.value))}
                  className="flex-1 accent-amber-400"
                />
                <span>{warmTint}%</span>
              </div>
            </div>

            {/* Visual Reading Indicator & Narrator */}
            <div className="bg-navy-900 p-2 rounded-lg border border-navy-700 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-aqua-400">🔊 Visual Reading Cursor</span>
                <span className="text-[10px] text-emerald-400">{isNarrating ? 'Reading...' : 'Idle'}</span>
              </div>
              <div className="flex gap-1">
                {!isNarrating ? (
                  <button
                    onClick={startVisualReading}
                    className="flex-1 py-1 bg-aqua-500 hover:bg-aqua-400 text-navy-950 font-bold rounded text-[10px] shadow"
                  >
                    ▶ Start Visual Reading
                  </button>
                ) : (
                  <>
                    <button
                      onClick={pauseOrResumeVisualReading}
                      className="flex-1 py-1 bg-amber-500 hover:bg-amber-400 text-navy-950 font-bold rounded text-[10px]"
                    >
                      ⏸ Pause/Resume
                    </button>
                    <button
                      onClick={stopVisualReading}
                      className="px-2 py-1 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded text-[10px]"
                    >
                      ⏹ Stop
                    </button>
                  </>
                )}
              </div>
              <div className="text-[10px] text-slate-400">
                Landmarks: <span className="text-aqua-300 font-mono">Alt+H</span> Headings | <span className="text-aqua-300 font-mono">Alt+L</span> Links
              </div>
            </div>

            {/* Offline Translation & Local AI */}
            <div className="bg-navy-900 p-2 rounded-lg border border-navy-700 space-y-1.5">
              <span className="font-bold text-aqua-400 block">🌐 Offline Local Translation</span>
              <div className="flex gap-1">
                <select
                  value={targetLang}
                  onChange={(e) => setTargetLang(e.target.value)}
                  className="bg-navy-950 text-white text-[10px] p-1 rounded border border-navy-700 flex-1"
                >
                  <option value="hi">Hindi (हिंदी)</option>
                  <option value="kn">Kannada (ಕನ್ನಡ)</option>
                  <option value="ta">Tamil (தமிழ்)</option>
                  <option value="te">Telugu (తెలుగు)</option>
                  <option value="ml">Malayalam (മലയാളം)</option>
                  <option value="bn">Bengali (বাংলা)</option>
                  <option value="mr">Marathi (मराठी)</option>
                </select>
                {!isTranslated ? (
                  <button
                    onClick={handleTranslatePage}
                    className="px-2 py-0.5 bg-teal-500 hover:bg-teal-400 text-navy-950 font-bold rounded text-[10px]"
                  >
                    Translate
                  </button>
                ) : (
                  <button
                    onClick={handleRestorePage}
                    className="px-2 py-0.5 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded text-[10px]"
                  >
                    Restore
                  </button>
                )}
              </div>
              <div className="flex items-center justify-between text-[10px]">
                <button
                  onClick={toggleSpotlight}
                  className={`px-1.5 py-0.5 rounded font-bold ${
                    spotlightActive ? 'bg-purple-400 text-navy-950' : 'bg-navy-800 text-slate-400'
                  }`}
                >
                  🎯 ADHD Spotlight
                </button>
                <div className="flex items-center gap-1 text-slate-400">
                  <span>Dim:</span>
                  <input
                    type="range"
                    min="0"
                    max="60"
                    value={brightnessDim}
                    onChange={(e) => handleBrightnessChange(Number(e.target.value))}
                    className="w-12 accent-slate-400"
                    title="Brightness dimmer"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Translation / Status Notice */}
          {translationNotice && (
            <div className="p-1.5 bg-teal-950/90 border border-teal-500/50 text-teal-200 rounded text-[11px] flex justify-between items-center">
              <span>{translationNotice}</span>
              <button
                onClick={() => setTranslationNotice(null)}
                className="text-teal-400 hover:text-white ml-2 text-xs"
              >
                ✕
              </button>
            </div>
          )}
        </div>
      </header>

      {/* FLASHING DISTRACTING BANNER (to test Photosensitivity & ADHD mode) */}
      <div className="advertisement flashing bg-gradient-to-r from-red-600 via-yellow-400 to-red-600 p-2.5 text-center text-xs font-black text-black tracking-widest uppercase border-b-4 border-black animate-pulse">
        ⚡ FLASHING PROMO: 90% OFF EXAM COACHING TODAY ONLY! CLICK HERE NOW! ⚡
      </div>

      {/* WEBSITE HEADER */}
      <header className="bg-blue-950 text-white shadow">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-amber-500 rounded-lg flex items-center justify-center text-2xl font-black text-blue-950">
              🏛️
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                National Higher Education & Research Scholarship Portal
              </h1>
              <p className="text-xs text-blue-200">
                Department of Higher Education • Official Academic Portal
              </p>
            </div>
          </div>

          <nav className="flex gap-4 text-xs font-semibold text-blue-200">
            <a href="#overview" className="hover:text-white">Fellowship Overview</a>
            <a href="#guidelines" className="hover:text-white">Guidelines</a>
            <a href="#application-form" className="hover:text-white bg-blue-800 px-3 py-1.5 rounded">Apply Online</a>
          </nav>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col lg:flex-row gap-8">
        {/* Left Column: Article & Form */}
        <main className="flex-1 space-y-8" id="content">
          {/* Section 1: Complex Academic Article */}
          <section id="overview" className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
            <div className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-full mb-3">
              OFFICIAL NOTIFICATION: AY 2026-27
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4 leading-snug">
              National Research & Academic Merit Fellowship Stipulations
            </h2>

            {/* Dense Paragraph with bureaucratic jargon */}
            <div className="text-sm text-slate-700 space-y-4 leading-relaxed">
              <p>
                Applications are hereby invited from bonafide undergraduate and postgraduate scholars seeking financial
                remuneration for advanced scholastic study. The domicile state requirement is mandatory: candidate
                matriculation credentials must conform strictly with university annexure regulations.
              </p>
              <p>
                Notwithstanding prior academic disbursements, all applicants must submit evidence verifying that their
                aggregate CGPA exceeds 3.50 on a 4.00 standard scale (or equivalent 8.5/10). The aforementioned
                emoluments shall commence post verification of institution currently attended, subject to the
                stipulation that candidates endeavor to avoid any discrepancy in their uploaded documentation.
              </p>
            </div>

            {/* Critical Deadline Callout */}
            <div className="mt-6 p-4 bg-amber-50 border-l-4 border-amber-500 rounded-r-lg">
              <div className="text-xs font-bold text-amber-800 uppercase tracking-wide">
                MANDATORY TIMELINE
              </div>
              <div className="text-base font-extrabold text-amber-950 mt-1">
                Final Application Submission Deadline: 15 October 2026
              </div>
              <p className="text-xs text-amber-800 mt-1">
                Late submissions will terminate without further consideration.
              </p>
            </div>

            {/* Image missing alt text + OCR test button */}
            <div className="mt-6 border border-slate-200 rounded-lg p-4 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <img
                  id="demo-research-image"
                  src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=160&auto=format&fit=crop&q=80"
                  alt=""
                  title="Group of university students researching in college library"
                  className="w-24 h-24 object-cover rounded-lg shadow-sm"
                />
                <div>
                  <div className="text-xs font-bold text-slate-900">University Research Scholars</div>
                  <div className="text-xs text-slate-500 mt-1">
                    (Notice: This demonstration image intentionally lacks an HTML alt attribute to test AI alt-text generation and Canvas OCR).
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleInspectImage}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow shrink-0 flex items-center gap-1.5"
              >
                <span>🔍</span>
                <span>Inspect Image with Canvas OCR</span>
              </button>
            </div>
          </section>

          {/* Section 2: Complex Scholarship Application Form */}
          <section id="application-form" className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
            <div className="border-b border-slate-200 pb-4 mb-6">
              <h2 className="text-xl font-bold text-slate-900">
                Official Fellowship Application Form
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Please complete all required fields. You can use the "Test Auto-Fill" button at the top to test smart form filling.
              </p>
            </div>

            {submissionStatus && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl font-bold text-sm">
                {submissionStatus}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Group 1: Candidate Identification */}
              <div>
                <h3 className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-3">
                  1. Candidate Identification
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="fullname_input" className="block text-xs font-semibold text-slate-700 mb-1">
                      Legal Full Name of Applicant *
                    </label>
                    <input
                      id="fullname_input"
                      name="candidate_full_name"
                      type="text"
                      required
                      placeholder="e.g. Ananya Sharma"
                      className="w-full p-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label htmlFor="email_input" className="block text-xs font-semibold text-slate-700 mb-1">
                      Contact Email Address *
                    </label>
                    <input
                      id="email_input"
                      name="applicant_email"
                      type="email"
                      required
                      placeholder="scholar@university.edu"
                      className="w-full p-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone_input" className="block text-xs font-semibold text-slate-700 mb-1">
                      Primary Mobile Contact Number *
                    </label>
                    <input
                      id="phone_input"
                      name="contact_number"
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      className="w-full p-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label htmlFor="dob_input" className="block text-xs font-semibold text-slate-700 mb-1">
                      Date of Birth *
                    </label>
                    <input
                      id="dob_input"
                      name="applicant_dob"
                      type="date"
                      required
                      className="w-full p-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Group 2: Residence & Domicile */}
              <div className="pt-4 border-t border-slate-200">
                <h3 className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-3">
                  2. Residence & Domicile Verification
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label htmlFor="address_input" className="block text-xs font-semibold text-slate-700 mb-1">
                      Permanent Residence (Full Street Address) *
                    </label>
                    <input
                      id="address_input"
                      name="permanent_residence"
                      type="text"
                      required
                      placeholder="House number, street, locality"
                      className="w-full p-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label htmlFor="city_input" className="block text-xs font-semibold text-slate-700 mb-1">
                      City / District *
                    </label>
                    <input
                      id="city_input"
                      name="candidate_city"
                      type="text"
                      required
                      placeholder="e.g. Bengaluru"
                      className="w-full p-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label htmlFor="domicile_input" className="block text-xs font-semibold text-slate-700 mb-1">
                      Domicile State *
                    </label>
                    <input
                      id="domicile_input"
                      name="domicile_state"
                      type="text"
                      required
                      placeholder="e.g. Karnataka"
                      className="w-full p-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label htmlFor="pincode_input" className="block text-xs font-semibold text-slate-700 mb-1">
                      PIN Code *
                    </label>
                    <input
                      id="pincode_input"
                      name="postal_pincode"
                      type="text"
                      required
                      placeholder="e.g. 560010"
                      className="w-full p-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label htmlFor="blood_input" className="block text-xs font-semibold text-slate-700 mb-1">
                      Blood Group (Custom Field Test)
                    </label>
                    <input
                      id="blood_input"
                      name="applicant_blood_group"
                      type="text"
                      placeholder="e.g. B+, O+"
                      className="w-full p-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Group 3: Academic Credentials */}
              <div className="pt-4 border-t border-slate-200">
                <h3 className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-3">
                  3. Academic Credentials
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label htmlFor="college_input" className="block text-xs font-semibold text-slate-700 mb-1">
                      Name of Institution Currently Attended *
                    </label>
                    <input
                      id="college_input"
                      name="institution_currently_attended"
                      type="text"
                      required
                      placeholder="College or University name"
                      className="w-full p-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label htmlFor="course_input" className="block text-xs font-semibold text-slate-700 mb-1">
                      Branch / Field of Study *
                    </label>
                    <input
                      id="course_input"
                      name="course_program"
                      type="text"
                      required
                      placeholder="e.g. Computer Science"
                      className="w-full p-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label htmlFor="roll_input" className="block text-xs font-semibold text-slate-700 mb-1">
                      Registration Number / Roll No *
                    </label>
                    <input
                      id="roll_input"
                      name="student_id_usn"
                      type="text"
                      required
                      placeholder="e.g. 1SP22CS045"
                      className="w-full p-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label htmlFor="cgpa_input" className="block text-xs font-semibold text-slate-700 mb-1">
                      Aggregate CGPA or Marks % *
                    </label>
                    <input
                      id="cgpa_input"
                      name="aggregate_gpa"
                      type="text"
                      required
                      placeholder="e.g. 9.4"
                      className="w-full p-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label htmlFor="income_input" className="block text-xs font-semibold text-slate-700 mb-1">
                      Family Annual Income
                    </label>
                    <input
                      id="income_input"
                      name="family_annual_income"
                      type="text"
                      placeholder="e.g. INR 4,50,000"
                      className="w-full p-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Declaration Checkbox */}
              <div className="pt-4 border-t border-slate-200">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    id="declaration_checkbox"
                    required
                    className="w-4 h-4 accent-blue-600"
                  />
                  <span className="text-xs text-slate-700">
                    I solemnly declare that all statements provided are true and accurate to the best of my knowledge.
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="px-8 py-3 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-lg text-sm transition-colors shadow"
                >
                  Submit Application
                </button>
                <button
                  type="button"
                  onClick={() => FormFiller.clearFilled()}
                  className="px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-lg text-sm transition-colors"
                >
                  Clear Filled Fields
                </button>
              </div>
            </form>
          </section>
        </main>

        {/* Right Column: Distracting Sidebar & Promotional Elements */}
        <aside className="w-full lg:w-80 shrink-0 space-y-6">
          {/* Distracting Ad Widget (to test ADHD clutter hiding) */}
          <div className="advertisement floating-ad bg-amber-100 border-2 border-dashed border-amber-400 p-4 rounded-xl text-center">
            <span className="text-[10px] uppercase font-bold text-amber-700 bg-amber-200 px-2 py-0.5 rounded">
              Sponsored Ad
            </span>
            <div className="text-sm font-extrabold text-amber-900 mt-2">
              Fast Student Loans - No Credit Check Required!
            </div>
            <p className="text-xs text-amber-800 mt-1">Get instant approval in 5 minutes.</p>
            <button className="mt-3 w-full py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded">
              Apply For Loan
            </button>
          </div>

          {/* Color-Coded Status Box with poor contrast (to test Color Blindness & Low Vision mode) */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              Application Status Legend (Color Blind Test)
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-emerald-500 shadow-sm" />
                <span className="text-slate-700 font-medium">Eligible (Green only)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-amber-500 shadow-sm" />
                <span className="text-slate-700 font-medium">Under Review (Yellow only)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-rose-500 shadow-sm" />
                <span className="text-slate-700 font-medium">Ineligible (Red only)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-blue-500 shadow-sm" />
                <span className="text-slate-700 font-medium">Verified (Blue only)</span>
              </div>
            </div>

            {/* Color Swatch Matrix Preview */}
            <div className="mt-4 pt-3 border-t border-slate-200">
              <div className="text-[11px] font-semibold text-slate-600 mb-2">Live Spectrum Test Bar:</div>
              <div className="flex h-6 rounded overflow-hidden shadow-inner">
                <div className="flex-1 bg-red-600" title="Red" />
                <div className="flex-1 bg-orange-500" title="Orange" />
                <div className="flex-1 bg-yellow-400" title="Yellow" />
                <div className="flex-1 bg-green-600" title="Green" />
                <div className="flex-1 bg-cyan-500" title="Cyan" />
                <div className="flex-1 bg-blue-600" title="Blue" />
                <div className="flex-1 bg-purple-600" title="Purple" />
              </div>
            </div>
          </div>

          {/* Quick Notice Links */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              Important Downloads
            </h3>
            <ul className="text-xs space-y-2 text-blue-700">
              <li><a href="#" className="hover:underline">▸ Download Annexure A (PDF)</a></li>
              <li><a href="#" className="hover:underline">▸ Domicile Certificate Template</a></li>
              <li><a href="#" className="hover:underline">▸ Frequently Asked Questions</a></li>
            </ul>
          </div>
        </aside>
      </div>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-8 px-6 mt-12 border-t border-slate-800 text-center">
        <p>National Scholarship Application Portal • Demonstration Prototype for Hackathon Evaluation</p>
        <p className="text-[11px] text-slate-500 mt-1">
          Designed to test visual adaptations, cognitive focus, reading simplification, and intelligent form autofill.
        </p>
      </footer>
    </div>
  );
};
