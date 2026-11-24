# Same Web, Different Eyes 👁️✨
> **"The internet adapts to you. Not the other way around."**

An AI-powered universal accessibility browser extension for Chrome and Chromium-based browsers (Manifest V3) that functions as an intelligent, personalized accessibility layer between the user and any website on the internet.

---

## 🌟 Architecture & Key Pillars

The modern web was designed around narrow assumptions of human perception, cognition, and interaction. Millions of individuals with dyslexia, color blindness, low vision, photosensitivity, ADHD, motor disabilities, or language barriers face significant friction daily.

**Same Web, Different Eyes** delivers a complete, local-first accessibility suite:

1. **Universal Accessibility Engine**: Reversible, dynamic CSS and SVG filter transformations covering 8 scientific color blindness types and 10 combinable accessibility profiles.
2. **Synchronized Visual Reading Engine**: Sentence-by-sentence synchronized visual highlight with a visible reading cursor badge (`🔊 Reading...`) and smooth auto-scrolling into view.
3. **Dyslexia Reading Tools**: Movable reading ruler, single-line focus curtains, warm eye-comfort background tint (with adjustable intensity), and pointer-hover sentence simplifier with plain-language tooltips.
4. **Photosensitivity & Seizure Safety**: Autoplay media suppressor, animated flash remover, non-destructive brightness reduction overlay, and a prominent 1-click Emergency Stop control.
5. **ADHD Cognitive Focus**: Active paragraph spotlight (dimming surrounding text on hover/focus) and clutter removal.
6. **Local-First AI Engine**: Zero telemetry by default. Runs offline with deterministic rule-based algorithms or connects locally to **Ollama** (`http://localhost:11434`) with zero cloud data transmission.
7. **Offline Regional Translation Engine**: Seamless in-page DOM text translation for 7 Indian regional languages (Hindi, Kannada, Tamil, Telugu, Malayalam, Bengali, Marathi) preserving DOM hierarchy, with instant Original/Translated toggle.
8. **Local Image Understanding & Canvas OCR**: HTML5 Canvas optical analysis, contextual alt-text generation, and translation overlays without hallucinations.
9. **Personal Information Vault**: Client-side AES-GCM 256-bit encrypted credential store with PBKDF2 key derivation.
10. **Smart Form-Filling Assistant**: Automatic DOM field detection, confidence-scored semantic matching against vault data, in-page approval review drawer, and zero auto-submission.
11. **Draggable Accessibility Control Centre**: In-page collapsible, accessible floating toolbar with persistent coordinates across page navigations.

---

## 📁 Project Structure

```text
same-web-different-eyes/
├── dist/                              # Production-ready unpacked Chrome Extension
│   ├── manifest.json                  # Manifest V3 configuration
│   ├── popup.html                     # Extension toolbar popup
│   ├── options.html                   # Full accessibility dashboard & settings
│   ├── onboarding.html                # 5-step interactive onboarding experience
│   ├── demo.html                      # Realistic scholarship portal demo website
│   ├── contentScript.js               # Standalone DOM injector & adaptation engine
│   ├── serviceWorker.js               # Background service worker & context menus
│   ├── assets/                        # Compiled React bundles, CSS & assets
│   └── icons/                         # 16px, 32px, 48px, 128px PNG icons
├── same-web-different-eyes.zip        # Packaged ZIP ready for instant loading
├── src/
│   ├── popup/                         # Popup UI (local-first pill, quick tools, emergency stop)
│   ├── options/                       # Options dashboard (8 color presets, AI, vault, voice, shortcuts)
│   ├── onboarding/                    # 5-screen first-time onboarding wizard
│   ├── accessibility/                 # 10 profile presets, profile manager, dynamic CSS, SVG filters
│   │   ├── svgFilters.ts              # Scientific Brettel/Machado color matrices & interpolation
│   │   ├── styleGenerator.ts          # Line curtains, reading ruler, warm tint, brightness dimmer
│   │   └── presets.ts                 # 10 built-in default accessibility profiles
│   ├── ai/                            # Local-first AI service & Ollama provider
│   │   ├── localTranslationEngine.ts  # Offline DOM walker & 7 regional Indian language dictionaries
│   │   ├── imageOcrEngine.ts          # Local Canvas 2D OCR & structured image analysis
│   │   ├── deterministicFallback.ts   # Offline rule-based summarizer & dictionary
│   │   └── providers/ollamaProvider.ts# Local Ollama REST client (localhost:11434)
│   ├── content/                       # Content scripts & DOM engines
│   │   ├── screenReader/              # Synchronized visual reading engine & landmark navigation
│   │   ├── dyslexia/                  # Sentence hover simplifier with floating tooltip
│   │   ├── photosensitivity/          # Photosensitivity guard & 1-click emergency stop
│   │   ├── focus/                     # ADHD active paragraph spotlight & clutter filter
│   │   ├── accessibilityToolbar/      # Draggable, collapsible floating control center
│   │   └── formDetection/             # Form detector, field matcher, filler & review modal
│   ├── vault/                         # Web Crypto AES-GCM 256-bit vault encryption
│   ├── voice/                         # Web Speech API (speech synthesis & recognition)
│   ├── storage/                       # Safe chrome.storage.sync/local wrapper
│   ├── demo/                          # Realistic scholarship portal demo app
│   └── types/                         # Strongly typed TypeScript definitions
├── scripts/
│   ├── build.js                       # Multi-entry Vite & Rollup extension compiler
│   ├── package.js                     # Automated ZIP packager (.NET ZipFile)
│   └── generateIcons.js               # Programmatic icon generator
├── package.json                       # Dependencies & build scripts
├── tailwind.config.js                 # Custom accessibility color palette & fonts
├── tsconfig.json                      # Strict TypeScript compiler options
└── README.md                          # Comprehensive documentation & demo guide
```

---

## 🎨 Scientific Color Blindness Profiles

The extension implements scientifically grounded color transformation matrices based on the research of **Brettel, Viénot & Mollon (1997)** and **Machado, Oliveira & Fernandes (2009)**:

| Deficiency Type | Condition | Scientific Transformation Matrix |
| :--- | :--- | :--- |
| **Protanopia** | Red-blind (dichromacy) | Brettel projection on luminance plane |
| **Protanomaly** | Red-weak (anomalous trichromacy) | Machado interpolated shift |
| **Deuteranopia** | Green-blind (dichromacy) | Brettel green deficiency matrix |
| **Deuteranomaly** | Green-weak (anomalous trichromacy) | Machado anomalous green shift |
| **Tritanopia** | Blue-blind (dichromacy) | Brettel S-cone deficiency matrix |
| **Tritanomaly** | Blue-weak (anomalous trichromacy) | Machado anomalous blue shift |
| **Achromatopsia** | Total color blindness (monochromacy) | Pure greyscale luminance weights (0.299R + 0.587G + 0.114B) |
| **Achromatomaly** | Partial monochromacy | Desaturated perception matrix |

All profiles support an **Intensity Slider (10% - 100%)**, which uses linear interpolation (`interpolateColorMatrix`) between the Identity matrix and the target deficiency matrix.

---

## 📖 Dyslexia-Friendly Reading Suite

- **Single-Line Reading Focus**: Dims the lines above and below the active reading line using smooth CSS backdrop curtains (`swde-line-focus-top`, `swde-line-focus-bottom`).
- **Movable Reading Ruler**: An eye-tracking horizontal guide bar following the mouse pointer or controlled via `Alt + Up / Down`.
- **Hover Sentence Simplification**: Debounced pointer detection identifies the sentence under the cursor and displays an accessible floating tooltip with a plain-language simplification. Triggered also via `Alt + D`.
- **Eye-Comfort Warm Tint**: User-adjustable warm amber overlay (`rgba(255, 235, 175, alpha)`) to reduce visual stress and contrast glare.
- **Specialized Typography**: OpenDyslexic and Atkinson Hyperlegible font options with custom letter-spacing (`+2px`), word-spacing (`+4px`), and line-height (`1.85`).

---

## 🔊 Screen Reader Mode & Visual Reading Indicator

While reading webpage content aloud:
1. **Sentence-Level Highlight Box**: Highlights the exact sentence being narrated with a high-contrast bounding box (`#swde-visual-reading-indicator`).
2. **Visual Reading Cursor Badge**: A floating `🔊 Reading...` badge tracks directly above the narrated sentence.
3. **Smooth Auto-Scroll**: Automatically scrolls the reading target into view with comfortable screen padding.
4. **Non-Destructive**: Never permanently alters the host page DOM.
5. **Landmark Navigation**: Rapid keyboard navigation across key webpage elements:
   - `Alt + H`: Jump and narrate next Heading (`H1-H6`)
   - `Alt + L`: Jump and narrate next Link (`<a>`)
   - `Alt + B`: Jump and narrate next Button (`<button>`)
   - `Alt + F`: Jump and focus next Form Input (`<input>, <select>, <textarea>`)
   - `Alt + S`: Start or Stop visual reading narration
   - `Alt + Space`: Pause or Resume reading

---

## 🛡️ Photosensitivity & Seizure Safety

- **Video Autoplay Suppression**: Automatically pauses HTML5 `<video>` and `<audio>` elements, prevents autoplay attributes, and monitors dynamic elements via `MutationObserver`.
- **Flashing & Animation Suppressor**: Detects CSS animations, blinking elements, and rapid color transitions and disables them safely.
- **1-Click Emergency Stop**: Instantly freezes all animations, media playback, and high-frequency elements page-wide. Can be toggled from the floating control centre, popup, or keyboard.
- **Brightness Dimmer**: Non-destructive dark overlay slider (0% to 80%) for light-sensitive users without altering website layout or colors.

---

## 🤖 Local-First AI & Regional Language Translation

### 1. Zero Cloud Telemetry by Default
By default, the extension uses **Local Deterministic Rules** and offline plain-language dictionaries. No data is sent to any external server.

### 2. Local Ollama Integration
For advanced generative simplification, users can connect their own local **Ollama** instance:
- Endpoint: `http://localhost:11434`
- Supported models: `llama3`, `mistral`, `phi3`, `gemma`, etc.
- Direct local REST communication with health checks and zero third-party APIs.

### 3. Offline Indian Regional Language Translation
Translates webpage content into 7 major Indian languages directly in the browser DOM:
- **Hindi** (हिंदी)
- **Kannada** (ಕನ್ನಡ)
- **Tamil** (தமிழ்)
- **Telugu** (తెలుగు)
- **Malayalam** (മലയാളം)
- **Bengali** (বাংলা)
- **Marathi** (मराठी)
- **Features**: Traverses `Node.TEXT_NODE` recursively without modifying HTML tags or breaking JavaScript event listeners. Includes an instant **"Restore English"** button.

### 4. Local Canvas OCR & Image Analysis
- Analyzes images locally using HTML5 Canvas 2D context.
- Detects charts, diagrams, and photographic context.
- Extracts embedded text and generates descriptive alt-text without hallucinations.

---

## ⌨️ Complete Keyboard Shortcuts

| Shortcut | Action | Description |
| :--- | :--- | :--- |
| `Alt + A` | **Toggle Control Centre** | Opens or collapses the floating in-page accessibility control centre |
| `Alt + S` | **Visual Narrator** | Starts or stops synchronized sentence-by-sentence reading |
| `Alt + Space` | **Pause / Resume** | Pauses or resumes speech narration |
| `Alt + H` | **Next Heading** | Jumps to and reads the next heading (H1 - H6) |
| `Alt + L` | **Next Link** | Jumps to and focuses the next link |
| `Alt + B` | **Next Button** | Jumps to and focuses the next clickable button |
| `Alt + F` | **Next Form Field** | Jumps to and highlights the next form input |
| `Alt + D` | **Simplify Sentence** | Simplifies the currently hovered or focused sentence |
| `Alt + R` | **Reader View** | Toggles distraction-free clean reader view overlay |
| `Alt + Up / Down` | **Move Ruler** | Moves reading ruler or focus line vertically |

---

## 🚀 Installation & Chrome Verification

### Option 1: Load Pre-Built Unpacked Extension in Chrome

1. Open **Google Chrome** (or Edge, Brave, Chromium).
2. In the URL address bar, enter:
   ```text
   chrome://extensions
   ```
3. Enable **Developer mode** using the toggle switch in the top-right corner.
4. Click the **Load unpacked** button in the top-left corner.
5. Select the `dist` folder located inside this project:
   ```text
   c:\Users\thris\OneDrive\Desktop\accessiblity folder\dist
   ```
6. The extension **"Same Web, Different Eyes"** will appear in your extension list!
7. Pin the extension to your browser toolbar for quick 1-click access.

---

### Option 2: Test on the Interactive Demonstration Webpage

1. Open the pre-built demo portal in Chrome:
   - Double-click `dist/demo.html` or navigate to:
     ```text
     file:///c:/Users/thris/OneDrive/Desktop/accessiblity folder/dist/demo.html
     ```
2. The demo page includes an interactive **SWDE Demo Lab** bar at the top:
   - Test all **8 Color Blindness types** live with the intensity slider and spectrum bar.
   - Test **Single-Line Focus curtains** and the **Movable Reading Ruler**.
   - Test the **Hover AI Tooltip** over academic text.
   - Test the **Visual Reading Narrator** with sentence highlights and the reading cursor.
   - Test the **Emergency Freeze** on the flashing banner.
   - Test **Offline Translation** into Hindi, Kannada, Tamil, Telugu, etc.
   - Test **Canvas Image OCR** on the sample research photo.
   - Test **Smart Form Autofill** with the student fellowship application form.

---

### Option 3: Rebuild From Source

```bash
# 1. Run automated test suite (7 suites, 25 tests)
npm test

# 2. Build the production extension
npm run build

# 3. Create distribution ZIP packages
npm run package
```

---

## 🔒 Security & Privacy Guarantees

- **AES-GCM 256-bit Encryption**: Vault credentials encrypted using standard Web Crypto API with 100,000 PBKDF2 iterations and random 96-bit initialization vectors.
- **Zero Cloud Data Leakage**: AI configuration defaults to local deterministic engine and local Ollama; no telemetry, tracking, or background external API requests.
- **Prompt Injection Defense**: Untrusted webpage content is strictly encapsulated within `<webpage_content_untrusted>` tags with system instructions to ignore embedded directives.
- **Non-Destructive DOM Injection**: All visual styles, tints, and highlights are stored in isolated `style` elements and CSS classes, and can be cleanly reverted at any time with a single click.

---

## 📄 License
MIT License. Built for universal digital inclusion.
