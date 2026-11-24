var Ce=Object.defineProperty;var Fe=(h,s,t)=>s in h?Ce(h,s,{enumerable:!0,configurable:!0,writable:!0,value:t}):h[s]=t;var x=(h,s,t)=>Fe(h,typeof s!="symbol"?s+"":s,t);import{r as y,j as e,D as Se,P as Ae,R as Te,a as Le}from"./index-MUH6MEco.js";import{S as j,A as Be,D as Ie,L as R}from"./aiService-CVB8DFR-.js";const H={protanopia:{r:[.56667,.43333,0,0,0],g:[.55833,.44167,0,0,0],b:[0,.24167,.75833,0,0],a:[0,0,0,1,0]},protanomaly:{r:[.81667,.18333,0,0,0],g:[.33333,.66667,0,0,0],b:[0,.125,.875,0,0],a:[0,0,0,1,0]},deuteranopia:{r:[.625,.375,0,0,0],g:[.7,.3,0,0,0],b:[0,.3,.7,0,0],a:[0,0,0,1,0]},deuteranomaly:{r:[.8,.2,0,0,0],g:[.25833,.74167,0,0,0],b:[0,.14167,.85833,0,0],a:[0,0,0,1,0]},tritanopia:{r:[.95,.05,0,0,0],g:[0,.43333,.56667,0,0],b:[0,.475,.525,0,0],a:[0,0,0,1,0]},tritanomaly:{r:[.96667,.03333,0,0,0],g:[0,.73333,.26667,0,0],b:[0,.18333,.81667,0,0],a:[0,0,0,1,0]},achromatopsia:{r:[.299,.587,.114,0,0],g:[.299,.587,.114,0,0],b:[.299,.587,.114,0,0],a:[0,0,0,1,0]},achromatomaly:{r:[.618,.32,.062,0,0],g:[.163,.775,.062,0,0],b:[.163,.32,.516,0,0],a:[0,0,0,1,0]}};function Re(h,s){let t;typeof h=="string"?t=H[h]||H.deuteranopia:t=h;const i=Math.max(0,Math.min(100,s))/100,a=(d,p)=>Number((d*(1-i)+p*i).toFixed(4)),n=[a(1,t.r[0]),a(0,t.r[1]),a(0,t.r[2]),t.r[3],t.r[4]],o=[a(0,t.g[0]),a(1,t.g[1]),a(0,t.g[2]),t.g[3],t.g[4]],l=[a(0,t.b[0]),a(0,t.b[1]),a(1,t.b[2]),t.b[3],t.b[4]],r=t.a;return[...n,...o,...l,...r].join(" ")}function $e(h={}){return`
<svg id="swde-colorblind-filters" style="position: absolute; width: 0; height: 0; overflow: hidden;" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
  <defs>
    ${Object.keys(H).map(t=>{const i=h[t]??100,a=Re(H[t],i);return`
    <filter id="swde-filter-${t}">
      <feColorMatrix type="matrix" values="${a}" />
    </filter>`}).join(`
`)}
    <filter id="swde-filter-high-contrast">
      <feComponentTransfer>
        <feFuncR type="linear" slope="1.45" intercept="-0.15" />
        <feFuncG type="linear" slope="1.45" intercept="-0.15" />
        <feFuncB type="linear" slope="1.45" intercept="-0.15" />
      </feComponentTransfer>
    </filter>
  </defs>
</svg>
`}function ee(h=100,s){if(typeof document>"u")return;let t=document.getElementById("swde-svg-filters-container");t||(t=document.createElement("div"),t.id="swde-svg-filters-container",document.body.appendChild(t));const i={};s&&s!=="none"&&s!=="highContrast"&&(i[s]=h),t.innerHTML=$e(i)}function O(){if(typeof document>"u")return;const h=document.getElementById("swde-svg-filters-container");h&&h.remove()}const te="swde-injected-accessibility-styles",z="swde-reading-ruler",K="swde-line-focus-top",X="swde-line-focus-bottom",se="swde-warm-tint-overlay",ae="swde-brightness-overlay";class E{static generateCSS(s){const{visual:t,reading:i,interaction:a}=s,n=[];let o="";t.fontFamily==="opendyslexic"?o="font-family: 'OpenDyslexic', 'Comic Sans MS', 'Verdana', sans-serif !important;":t.fontFamily==="atkinson"?o="font-family: 'Atkinson Hyperlegible', 'Verdana', 'Segoe UI', sans-serif !important;":t.fontFamily==="lexend"?o="font-family: 'Lexend', 'Trebuchet MS', 'Segoe UI', sans-serif !important;":t.fontFamily==="sans-serif"?o="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important;":t.fontFamily==="serif"&&(o="font-family: 'Georgia', 'Times New Roman', serif !important;");const l=[];if(o&&l.push(o),t.letterSpacing>0&&l.push(`letter-spacing: ${t.letterSpacing}px !important;`),t.wordSpacing>0&&l.push(`word-spacing: ${t.wordSpacing}px !important;`),t.lineHeight>1&&l.push(`line-height: ${t.lineHeight} !important;`),l.length>0&&n.push(`
        p, li, article, main, span, div, a, label, input, textarea, select {
          ${l.join(`
  `)}
        }
      `),t.paragraphSpacing>0&&n.push(`
        p, article > div, ul, ol {
          margin-bottom: ${t.paragraphSpacing}px !important;
        }
      `),t.fontSizeAdjustment>0){const r=1+t.fontSizeAdjustment/100;n.push(`
        html {
          font-size: ${r*100}% !important;
        }
        body {
          font-size: 1rem !important;
        }
        p, li, span, a, label, input, button, select, textarea {
          font-size: calc(1em * ${r}) !important;
        }
        h1 { font-size: calc(2.2em * ${r}) !important; }
        h2 { font-size: calc(1.8em * ${r}) !important; }
        h3 { font-size: calc(1.4em * ${r}) !important; }
      `)}if(t.pageZoomLevel&&t.pageZoomLevel!==100&&n.push(`
        html {
          zoom: ${t.pageZoomLevel}% !important;
        }
      `),t.colorBlindnessMode!=="none"){const r=t.colorBlindnessMode==="highContrast"?"swde-filter-high-contrast":`swde-filter-${t.colorBlindnessMode}`;n.push(`
        html {
          filter: url(#${r}) !important;
        }
      `)}return t.contrastMode==="high"?n.push(`
        html {
          filter: contrast(${t.customContrastRatio||1.35}) !important;
        }
        body {
          background-color: #ffffff !important;
          color: #000000 !important;
        }
        p, span, h1, h2, h3, h4, h5, h6, li, label {
          color: #000000 !important;
        }
      `):t.contrastMode==="dark"?n.push(`
        html, body {
          background-color: #0f172a !important;
          color: #f8fafc !important;
        }
        p, span, h1, h2, h3, h4, h5, h6, li, label, div {
          color: #f1f5f9 !important;
        }
        a {
          color: #38bdf8 !important;
        }
        input, select, textarea {
          background-color: #1e293b !important;
          color: #f8fafc !important;
          border-color: #475569 !important;
        }
      `):t.contrastMode==="yellow_on_black"?n.push(`
        html, body {
          background-color: #000000 !important;
          color: #ffff00 !important;
        }
        p, span, h1, h2, h3, h4, h5, h6, li, label, div, a, button {
          color: #ffff00 !important;
          background-color: transparent !important;
        }
        a {
          text-decoration: underline 2px #ffff00 !important;
        }
        input, select, textarea, button {
          border: 2px solid #ffff00 !important;
          background-color: #111111 !important;
          color: #ffff00 !important;
        }
      `):t.contrastMode==="black_on_yellow"?n.push(`
        html, body {
          background-color: #ffff00 !important;
          color: #000000 !important;
        }
        p, span, h1, h2, h3, h4, h5, h6, li, label, div, a, button {
          color: #000000 !important;
          background-color: transparent !important;
        }
        input, select, textarea, button {
          border: 2px solid #000000 !important;
          background-color: #ffffff !important;
          color: #000000 !important;
        }
      `):t.contrastMode==="cyan_on_black"?n.push(`
        html, body {
          background-color: #000000 !important;
          color: #00ffff !important;
        }
        p, span, h1, h2, h3, h4, h5, h6, li, label, div, a, button {
          color: #00ffff !important;
          background-color: transparent !important;
        }
        input, select, textarea, button {
          border: 2px solid #00ffff !important;
          background-color: #111111 !important;
          color: #00ffff !important;
        }
      `):t.contrastMode==="inverted"?n.push(`
        html {
          filter: invert(0.95) hue-rotate(180deg) !important;
        }
        img, video, canvas, svg {
          filter: invert(1) hue-rotate(180deg) !important;
        }
      `):t.contrastMode==="sepia"&&n.push(`
        html {
          filter: sepia(0.4) contrast(1.1) brightness(0.95) !important;
          background-color: #fbf0d9 !important;
        }
      `),t.highlightLinks&&n.push(`
        a {
          text-decoration: underline 2.5px #0284c7 !important;
          text-underline-offset: 4px !important;
          font-weight: 600 !important;
          color: #0369a1 !important;
        }
        a:hover, a:focus {
          background-color: #e0f2fe !important;
          border-radius: 3px !important;
        }
      `),t.highlightHeadings&&n.push(`
        h1, h2, h3, h4, h5, h6 {
          border-left: 4px solid #0ea5e9 !important;
          padding-left: 10px !important;
          margin-top: 14px !important;
          margin-bottom: 8px !important;
        }
      `),(t.largeClickTargets||a.largeInteractiveButtons)&&n.push(`
        button, a.btn, input[type="button"], input[type="submit"], input[type="reset"], [role="button"] {
          min-height: 46px !important;
          min-width: 46px !important;
          padding: 10px 18px !important;
          font-weight: 600 !important;
          cursor: pointer !important;
          margin: 4px !important;
          border-radius: 8px !important;
        }
        input, select, textarea {
          min-height: 44px !important;
          padding: 8px 12px !important;
        }
      `),a.visibleFocusIndicators&&n.push(`
        :focus, :focus-visible {
          outline: 3.5px solid #0ea5e9 !important;
          outline-offset: 3px !important;
          box-shadow: 0 0 0 6px rgba(14, 165, 233, 0.45) !important;
          transition: outline 0.1s ease-in-out !important;
        }
      `),t.customCursor&&n.push(`
        *, html, body, a, button, input {
          cursor: default !important;
        }
        a, button, [role="button"], input[type="submit"] {
          cursor: pointer !important;
        }
      `),(a.reduceMotion||a.disableTransitions||a.suppressFlashingContent||a.emergencyStopActive)&&n.push(`
        *, *::before, *::after {
          animation-duration: 0.0001ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.0001ms !important;
          transition-delay: 0s !important;
          scroll-behavior: auto !important;
        }
        .flashing, .blink, [class*="blink"], [class*="pulse"], marquee {
          animation: none !important;
          opacity: 1 !important;
        }
      `),(i.hideAdsAndBanners||i.adhdFocusDimClutter)&&((i.distractionFilteringIntensity||"moderate")==="strict"?n.push(`
          .ad, .advertisement, [id*="ad-"], [class*="ad-"], [class*="banner-promo"],
          [id*="banner-promo"], [class*="floating-ad"], [class*="sponsor"],
          [class*="popup"], [class*="modal-backdrop"], [id*="newsletter"],
          aside, .sidebar {
            display: none !important;
          }
        `):n.push(`
          .ad, .advertisement, [id*="ad-"], [class*="ad-"], [class*="banner-promo"],
          [id*="banner-promo"], [class*="floating-ad"], [class*="sponsor"] {
            display: none !important;
          }
        `)),i.hideSidebar&&i.distractionFilteringIntensity!=="strict"&&n.push(`
        aside, .sidebar, [class*="sidebar"]:not(body):not(html) {
          opacity: 0.25 !important;
          filter: grayscale(1) !important;
          transition: opacity 0.2s ease !important;
        }
        aside:hover, .sidebar:hover {
          opacity: 1 !important;
          filter: none !important;
        }
      `),i.highlightCurrentParagraph&&n.push(`
        p:hover, article p:hover, li:hover {
          background-color: rgba(224, 242, 254, 0.45) !important;
          border-left: 3px solid #0284c7 !important;
          padding-left: 8px !important;
          border-radius: 4px !important;
        }
      `),i.activeParagraphSpotlight&&n.push(`
        body.swde-spotlight-active article p,
        body.swde-spotlight-active main p,
        body.swde-spotlight-active .content p {
          opacity: 0.3 !important;
          filter: blur(0.5px) !important;
          transition: opacity 0.2s ease, filter 0.2s ease !important;
        }
        body.swde-spotlight-active article p:hover,
        body.swde-spotlight-active main p:hover,
        body.swde-spotlight-active .content p:hover,
        body.swde-spotlight-active p.swde-current-focus {
          opacity: 1 !important;
          filter: none !important;
          background: rgba(254, 243, 199, 0.5) !important;
          border-radius: 6px !important;
          padding: 4px 8px !important;
        }
      `),n.join(`

`)}static applyToDOM(s){if(typeof document>"u")return;if(this.removeFromDOM(),!s){O();return}s.visual.colorBlindnessMode!=="none"?ee(s.visual.colorBlindnessIntensity??100,s.visual.colorBlindnessMode):O();const t=this.generateCSS(s),i=document.createElement("style");i.id=te,i.textContent=t,document.head.appendChild(i),this.updateWarmTint(s.visual.warmTint,s.visual.warmTintIntensity||15),this.updateBrightnessReduction(s.visual.brightnessReduction||0),this.updateReadingFocus(s.visual.readingRuler,s.visual.singleLineFocus,s.visual.readingRulerHeight||38),s.reading.activeParagraphSpotlight?document.body.classList.add("swde-spotlight-active"):document.body.classList.remove("swde-spotlight-active"),(s.interaction.pauseAutoplay||s.interaction.emergencyStopActive)&&this.suppressMediaPlayback()}static removeFromDOM(){if(typeof document>"u")return;const s=document.getElementById(te);s&&s.remove(),O(),this.updateWarmTint(!1,0),this.updateBrightnessReduction(0),this.updateReadingFocus(!1,!1,36),document.body.classList.remove("swde-spotlight-active")}static updateWarmTint(s,t){if(typeof document>"u")return;const i=typeof s=="boolean"?s:s>0,a=typeof s=="number"?s:t??20;let n=document.getElementById(se);if(!i||a<=0){n&&n.remove();return}n||(n=document.createElement("div"),n.id=se,n.setAttribute("aria-hidden","true"),n.style.cssText=`
        position: fixed;
        inset: 0;
        pointer-events: none;
        z-index: 2147483641;
        mix-blend-mode: multiply;
        transition: background-color 0.2s ease;
      `,document.body.appendChild(n));const o=a/100*.45;n.style.backgroundColor=`rgba(255, 235, 175, ${o})`}static toggleReadingRuler(s,t=36){if(typeof document>"u")return!1;const i=document.getElementById(z),a=typeof s=="boolean"?s:!i,n=typeof s=="number"?s:t;return this.updateReadingFocus(a,!1,n),a}static updateColorBlindnessFilter(s,t=100){typeof document>"u"||(s==="none"?(O(),document.documentElement.style.removeProperty("filter")):(ee(t,s),document.documentElement.style.filter=`url(#swde-filter-${s})`))}static updateBrightnessReduction(s){if(typeof document>"u")return;let t=document.getElementById(ae);if(s<=0){t&&t.remove();return}t||(t=document.createElement("div"),t.id=ae,t.setAttribute("aria-hidden","true"),t.style.cssText=`
        position: fixed;
        inset: 0;
        pointer-events: none;
        z-index: 2147483642;
        transition: background-color 0.2s ease;
      `,document.body.appendChild(t));const i=s/100*.85;t.style.backgroundColor=`rgba(0, 0, 0, ${i})`}static updateReadingFocus(s,t,i){if(typeof document>"u")return;let a=document.getElementById(z),n=document.getElementById(K),o=document.getElementById(X);if(!s&&!t){a&&a.remove(),n&&n.remove(),o&&o.remove();return}s&&!a&&(a=document.createElement("div"),a.id=z,a.setAttribute("aria-hidden","true"),a.style.cssText=`
        position: fixed;
        left: 0;
        right: 0;
        height: ${i}px;
        background: rgba(14, 165, 233, 0.15);
        border-top: 2px solid #0284c7;
        border-bottom: 2px solid #0284c7;
        pointer-events: none;
        z-index: 2147483643;
        transition: top 0.05s ease-out;
      `,document.body.appendChild(a)),t&&(n||(n=document.createElement("div"),n.id=K,n.setAttribute("aria-hidden","true"),n.style.cssText=`
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          background: rgba(15, 23, 42, 0.45);
          pointer-events: none;
          z-index: 2147483642;
          transition: height 0.05s ease-out;
        `,document.body.appendChild(n)),o||(o=document.createElement("div"),o.id=X,o.setAttribute("aria-hidden","true"),o.style.cssText=`
          position: fixed;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 23, 42, 0.45);
          pointer-events: none;
          z-index: 2147483642;
          transition: top 0.05s ease-out;
        `,document.body.appendChild(o)));const l=r=>{this.readingFocusY=r;const d=i/2,p=Math.max(0,r-d),u=r+d,g=document.getElementById(z);g&&(g.style.top=`${p}px`,g.style.height=`${i}px`);const m=document.getElementById(K);m&&(m.style.height=`${p}px`);const f=document.getElementById(X);f&&(f.style.top=`${u}px`)};l(this.readingFocusY),this.readingListenersAttached||(this.readingListenersAttached=!0,window.addEventListener("mousemove",r=>{l(r.clientY)}),window.addEventListener("keydown",r=>{if(r.altKey&&(r.key==="ArrowUp"||r.key==="ArrowDown")){r.preventDefault();const d=r.key==="ArrowUp"?-28:28;l(Math.max(50,Math.min(window.innerHeight-50,this.readingFocusY+d)))}}))}static suppressMediaPlayback(){typeof document>"u"||document.querySelectorAll("video, audio").forEach(s=>{try{const t=s;t.autoplay=!1,t.pause(),t.removeAttribute("autoplay")}catch{}})}}x(E,"readingFocusY",200),x(E,"readingListenersAttached",!1);class De{static detectFields(s=document){const t=[],i=s.querySelectorAll("input, textarea, select");let a=0;return i.forEach(n=>{if(n.closest("#swde-overlay-root")||n.closest("#swde-reading-mode-root"))return;const o=(n.getAttribute("type")||n.tagName.toLowerCase()).toLowerCase();if(["hidden","submit","button","reset","image"].includes(o))return;a++;const l=n.id||`swde-field-${a}`;n.id||n.setAttribute("data-swde-id",l);const r=n.name||"",d=n.getAttribute("placeholder")||"",p=n.getAttribute("aria-label")||n.getAttribute("aria-description")||"",u=n.getAttribute("autocomplete")||"",g=n.hasAttribute("required")||n.getAttribute("aria-required")==="true",m=n.disabled||"readOnly"in n&&n.readOnly,f=this.resolveLabelText(n),v=this.getSurroundingText(n);let k;n.tagName.toLowerCase()==="select"&&(k=Array.from(n.options).map(I=>({value:I.value,label:I.text.trim()})));const C=this.generateSelector(n);t.push({id:l,name:r,tagName:n.tagName.toLowerCase(),type:o,label:f,placeholder:d,ariaLabel:p,autocomplete:u,surroundingText:v,selector:C,currentValue:n.value||"",options:k,isRequired:g,isDisabled:m})}),t}static resolveLabelText(s){var n;const t=s.getAttribute("aria-labelledby");if(t){const o=document.getElementById(t);if(o&&o.textContent)return o.textContent.trim()}if(s.id){const o=document.querySelector(`label[for="${s.id}"]`);if(o&&o.textContent)return o.textContent.trim()}const i=s.closest("label");if(i&&i.textContent){const o=i.cloneNode(!0);o.querySelectorAll("input, select, textarea").forEach(r=>r.remove());const l=(n=o.textContent)==null?void 0:n.trim();if(l)return l}const a=s.previousElementSibling;return a&&["LABEL","SPAN","P","STRONG","B"].includes(a.tagName)&&a.textContent?a.textContent.trim():""}static getSurroundingText(s){const t=s.closest(".form-group, .field, .row, .col, div, tr");return t&&t.textContent?t.textContent.replace(/\s+/g," ").trim().slice(0,150):""}static generateSelector(s){return s.id?`#${s.id}`:s.getAttribute("data-swde-id")?`[data-swde-id="${s.getAttribute("data-swde-id")}"]`:s.getAttribute("name")?`${s.tagName.toLowerCase()}[name="${s.getAttribute("name")}"]`:s.tagName.toLowerCase()}}const Me=[{path:"personal.fullName",category:"personal",key:"fullName",label:"Full Name",aliases:["full name","candidate name","applicant name","name","your name","student name","legal name"]},{path:"personal.firstName",category:"personal",key:"firstName",label:"First Name",aliases:["first name","fname","given name","forename"]},{path:"personal.lastName",category:"personal",key:"lastName",label:"Last Name",aliases:["last name","lname","surname","family name"]},{path:"personal.email",category:"personal",key:"email",label:"Email Address",aliases:["email","e-mail","mail","email id","email address","contact email"]},{path:"personal.phone",category:"personal",key:"phone",label:"Phone Number",aliases:["phone","mobile","cell","telephone","contact number","phone number","whatsapp"]},{path:"personal.dateOfBirth",category:"personal",key:"dateOfBirth",label:"Date of Birth",aliases:["date of birth","dob","birth date","birthday","birthdate"]},{path:"personal.gender",category:"personal",key:"gender",label:"Gender",aliases:["gender","sex"]},{path:"address.addressLine",category:"address",key:"addressLine",label:"Street Address",aliases:["permanent residence","residence address","address line 1","address","street address","home address","residential address"]},{path:"address.city",category:"address",key:"city",label:"City / District",aliases:["city","town","district","city/town"]},{path:"address.state",category:"address",key:"state",label:"State / Province",aliases:["state","domicile state","domicile","province","region","state/ut"]},{path:"address.country",category:"address",key:"country",label:"Country",aliases:["country","nation","nationality"]},{path:"address.pinCode",category:"address",key:"pinCode",label:"PIN / Postal Code",aliases:["pin code","pincode","postal code","zip","zipcode","zip code"]},{path:"education.college",category:"education",key:"college",label:"College / Institute",aliases:["name of institution currently attended","institution currently attended","college","institute","college name","institution name","current institution","school/college"]},{path:"education.university",category:"education",key:"university",label:"University / Board",aliases:["university","board","affiliating university","board/university","alma mater"]},{path:"education.school",category:"education",key:"school",label:"School / 10th Matriculation",aliases:["school","matriculation","10th school","secondary school","high school"]},{path:"education.course",category:"education",key:"course",label:"Course / Program",aliases:["course","program","branch","stream","field of study","specialization"]},{path:"education.degree",category:"education",key:"degree",label:"Degree",aliases:["degree","highest qualification","qualification","level of study"]},{path:"education.graduationYear",category:"education",key:"graduationYear",label:"Graduation Year",aliases:["graduation year","year of passing","passing year","expected completion year","passout year"]},{path:"education.studentId",category:"education",key:"studentId",label:"Student / Roll ID",aliases:["student id","roll number","roll no","registration number","usn","enrollment no","matriculation hall ticket no"]},{path:"education.gpaCgpa",category:"education",key:"gpaCgpa",label:"GPA / Aggregate %",aliases:["gpa","cgpa","aggregate","aggregate percentage","percentage","marks","aggregate score","overall grade"]},{path:"professional.jobTitle",category:"professional",key:"jobTitle",label:"Job Title / Role",aliases:["job title","designation","current role","position","occupation"]},{path:"professional.organization",category:"professional",key:"organization",label:"Organization / Company",aliases:["organization","company","employer","current employer","workplace"]},{path:"professional.skills",category:"professional",key:"skills",label:"Skills",aliases:["skills","key skills","competencies","technical skills","areas of expertise"]},{path:"professional.workExperience",category:"professional",key:"workExperience",label:"Work Experience",aliases:["work experience","years of experience","experience","total experience"]}];class Pe{static matchFields(s,t){const i=[];return s.forEach(a=>{const n=[a.label,a.name,a.placeholder,a.ariaLabel,a.autocomplete,a.surroundingText].filter(Boolean).join(" ").toLowerCase().replace(/[^a-z0-9\s]/g," ").replace(/\s+/g," ").trim();let o=null,l=0;for(const r of Me){const d=t[r.category],p=d?d[r.key]:"";if(!p||p.trim()==="")continue;let u=0,g="semantic";a.autocomplete&&(a.autocomplete.includes(r.key)||r.aliases.includes(a.autocomplete))&&(u=.98,g="exact");for(const f of r.aliases)if(new RegExp(`\\b${f}\\b`,"i").test(n)){const k=f.length>5?.95:.85;k>u&&(u=k,g="alias")}else n.includes(f)&&.78>u&&(u=.78,g="semantic");let m=p;if(a.tagName==="select"&&a.options&&a.options.length>0){const f=a.options.find(v=>v.value.toLowerCase()===p.toLowerCase()||v.label.toLowerCase()===p.toLowerCase()||v.label.toLowerCase().includes(p.toLowerCase())||p.toLowerCase().includes(v.label.toLowerCase()));f&&(m=f.value,u=Math.max(u,.8))}u>l&&u>=.65&&(l=u,o={fieldId:a.id,fieldName:a.name||a.id,fieldLabel:a.label||a.placeholder||a.name,fieldType:a.type,suggestedValue:m,vaultKeyPath:r.path,vaultLabel:r.label,confidence:Number(u.toFixed(2)),source:g,approved:u>=.75,selector:a.selector})}if(!o&&t.customFields&&t.customFields.length>0)for(const r of t.customFields){if(!r.value||!r.name)continue;const d=r.name.toLowerCase();if(n.includes(d)){o={fieldId:a.id,fieldName:a.name||a.id,fieldLabel:a.label||a.placeholder||a.name,fieldType:a.type,suggestedValue:r.value,vaultKeyPath:`custom.${r.id}`,vaultLabel:r.name,confidence:.88,source:"alias",approved:!0,selector:a.selector};break}}o&&i.push(o)}),i}}class V{static fill(s){const t={filledCount:0,skippedCount:0,failedCount:0,details:[]};return s.forEach(i=>{if(!i.approved){t.skippedCount++;return}try{let a=document.querySelector(i.selector);if(!a&&i.fieldId&&(a=document.getElementById(i.fieldId),a||(a=document.querySelector(`[data-swde-id="${i.fieldId}"]`))),!a){t.failedCount++,t.details.push({fieldLabel:i.fieldLabel,value:i.suggestedValue,success:!1});return}if(this.previouslyFilledElements.push({element:a,originalValue:a.value||"",originalOutline:a.style.outline||"",originalBackground:a.style.backgroundColor||""}),a.tagName.toLowerCase()==="select"){const n=a,o=i.suggestedValue.toLowerCase();let l=!1;for(let r=0;r<n.options.length;r++){const d=n.options[r];if(d.value.toLowerCase()===o||d.text.toLowerCase()===o||d.text.toLowerCase().includes(o)){n.selectedIndex=r,l=!0;break}}l||(n.value=i.suggestedValue)}else a.tagName.toLowerCase()==="input"&&(a.type==="checkbox"||a.type==="radio")?a.checked=!0:a.value=i.suggestedValue;a.dispatchEvent(new Event("input",{bubbles:!0})),a.dispatchEvent(new Event("change",{bubbles:!0})),a.dispatchEvent(new Event("blur",{bubbles:!0})),a.style.outline="2px solid #0EA5E9",a.style.outlineOffset="2px",a.style.backgroundColor="#F0F9FF",a.setAttribute("data-swde-filled","true"),t.filledCount++,t.details.push({fieldLabel:i.fieldLabel,value:i.suggestedValue,success:!0})}catch{t.failedCount++,t.details.push({fieldLabel:i.fieldLabel,value:i.suggestedValue,success:!1})}}),t}static clearFilled(){let s=0;return this.previouslyFilledElements.forEach(t=>{try{t.element.value=t.originalValue,t.element.style.outline=t.originalOutline,t.element.style.backgroundColor=t.originalBackground,t.element.removeAttribute("data-swde-filled"),t.element.dispatchEvent(new Event("input",{bubbles:!0})),t.element.dispatchEvent(new Event("change",{bubbles:!0})),s++}catch{}}),this.previouslyFilledElements=[],s}}x(V,"previouslyFilledElements",[]);class ne{static show(s,t,i){var o,l,r;this.close();const a=document.createElement("div");a.id="swde-form-review-modal",a.style.cssText=`
      position: fixed;
      top: 20px;
      right: 20px;
      width: 440px;
      max-width: calc(100vw - 40px);
      max-height: calc(100vh - 40px);
      background: #0B132B;
      color: #F8F9FA;
      border: 1px solid #1C2541;
      border-radius: 16px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.45);
      z-index: 2147483647;
      display: flex;
      flex-direction: column;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      box-sizing: border-box;
      overflow: hidden;
      animation: swdeSlideIn 0.25s ease-out;
    `;const n=s.filter(d=>d.approved).length;a.innerHTML=`
      <style>
        @keyframes swdeSlideIn {
          from { opacity: 0; transform: translateY(-16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      </style>
      <!-- Header -->
      <div style="padding: 16px 20px; background: #1C2541; border-bottom: 1px solid #2E4170; display: flex; justify-content: space-between; align-items: center;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="background: #0EA5E9; color: #fff; width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px;">⚡</span>
          <div>
            <div style="font-weight: 700; font-size: 15px; color: #FFFFFF;">Smart Form Assistant</div>
            <div style="font-size: 11px; color: #94A3B8;">${s.length} of ${t} fields matched from Vault</div>
          </div>
        </div>
        <button id="swde-frm-close-btn" style="background: transparent; border: none; color: #94A3B8; font-size: 20px; cursor: pointer; padding: 4px;">✕</button>
      </div>

      <!-- Security Notice -->
      <div style="padding: 10px 16px; background: rgba(14, 165, 233, 0.1); border-bottom: 1px solid rgba(14, 165, 233, 0.2); font-size: 12px; color: #7DD3FC; display: flex; align-items: center; gap: 6px;">
        <span>🔒</span> Stored locally in your encrypted Vault. Review and approve before filling.
      </div>

      <!-- Fields List -->
      <div id="swde-frm-fields-list" style="padding: 14px 16px; overflow-y: auto; flex: 1; display: flex; flex-direction: column; gap: 10px;">
        ${s.map((d,p)=>`
          <div style="background: #1C2541; border: 1px solid #2E4170; border-radius: 10px; padding: 12px; display: flex; gap: 10px; align-items: flex-start;">
            <input type="checkbox" id="swde-check-${p}" ${d.approved?"checked":""} style="margin-top: 3px; accent-color: #0EA5E9; cursor: pointer;" />
            <div style="flex: 1; min-width: 0;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                <label for="swde-check-${p}" style="font-size: 13px; font-weight: 600; color: #F1F5F9; cursor: pointer; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">
                  ${d.fieldLabel}
                </label>
                <span style="font-size: 11px; font-weight: 600; padding: 2px 6px; border-radius: 4px; background: ${d.confidence>=.9?"#065F46":"#1E3A8A"}; color: ${d.confidence>=.9?"#6EE7B7":"#93C5FD"};">
                  ${Math.round(d.confidence*100)}% match
                </span>
              </div>
              <div style="font-size: 13px; color: #38BDF8; font-family: monospace; background: #0B132B; padding: 4px 8px; border-radius: 6px; word-break: break-all;">
                ${d.suggestedValue}
              </div>
              <div style="font-size: 10px; color: #64748B; margin-top: 4px;">
                Vault Key: ${d.vaultLabel} (${d.source})
              </div>
            </div>
          </div>
        `).join("")}
      </div>

      <!-- Footer Buttons -->
      <div style="padding: 14px 16px; background: #1C2541; border-top: 1px solid #2E4170; display: flex; gap: 8px; justify-content: space-between; align-items: center;">
        <button id="swde-frm-clear-btn" style="background: transparent; border: 1px solid #475569; color: #CBD5E1; padding: 8px 12px; border-radius: 8px; font-size: 12px; font-weight: 500; cursor: pointer;">
          Clear Fields
        </button>
        <div style="display: flex; gap: 8px;">
          <button id="swde-frm-fill-btn" style="background: #0EA5E9; color: #FFFFFF; border: none; padding: 9px 18px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer;">
            Fill Approved (${n})
          </button>
        </div>
      </div>
    `,document.body.appendChild(a),this.modalEl=a,(o=a.querySelector("#swde-frm-close-btn"))==null||o.addEventListener("click",()=>this.close()),s.forEach((d,p)=>{const u=a.querySelector(`#swde-check-${p}`);u==null||u.addEventListener("change",()=>{d.approved=u.checked;const g=a.querySelector("#swde-frm-fill-btn");if(g){const m=s.filter(f=>f.approved).length;g.textContent=`Fill Approved (${m})`}})}),(l=a.querySelector("#swde-frm-fill-btn"))==null||l.addEventListener("click",()=>{const d=V.fill(s);this.showCompletionNotice(d),i&&i()}),(r=a.querySelector("#swde-frm-clear-btn"))==null||r.addEventListener("click",()=>{const d=V.clearFilled();alert(`Reverted ${d} filled form field(s).`)})}static showCompletionNotice(s){if(!this.modalEl)return;const t=this.modalEl.querySelector("#swde-frm-fields-list");t&&(t.innerHTML=`
        <div style="background: #064E3B; border: 1px solid #059669; border-radius: 10px; padding: 16px; text-align: center;">
          <div style="font-size: 28px; margin-bottom: 6px;">🎉</div>
          <div style="font-size: 16px; font-weight: 700; color: #A7F3D0; margin-bottom: 4px;">
            ${s.filledCount} Fields Filled Successfully!
          </div>
          <div style="font-size: 12px; color: #D1FAE5; line-height: 1.5;">
            The fields on the webpage are highlighted in aqua. Please review before submitting.<br/>
            <strong>Note:</strong> We never auto-submit forms.
          </div>
        </div>
      `)}static close(){this.modalEl&&(this.modalEl.remove(),this.modalEl=null)}}x(ne,"modalEl",null);class _{static open(){if(typeof document>"u"||document.getElementById("swde-reading-mode-root"))return;const s=document.title||"Reader View",t=document.querySelector("article, main, .article-content, #article, .post-content")||document.body,i=[];t.querySelectorAll("p, h2, h3, blockquote, li").forEach(m=>{var v;if(m.closest("#swde-overlay-root")||m.closest("#swde-reading-mode-root"))return;const f=(v=m.textContent)==null?void 0:v.trim();f&&f.length>20&&i.push(f)}),this.currentContent=i.join(`

`);const a=document.createElement("div");a.id="swde-reading-mode-root",a.setAttribute("role","dialog"),a.setAttribute("aria-label","Distraction-Free Reading Mode"),a.style.cssText=`
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: #F8F9FA;
      color: #1A202C;
      z-index: 2147483646;
      overflow-y: auto;
      font-family: 'Atkinson Hyperlegible', -apple-system, sans-serif;
      line-height: 1.8;
      font-size: 19px;
      box-sizing: border-box;
      padding: 30px 20px;
    `,a.innerHTML=`
      <div style="max-width: 820px; margin: 0 auto; background: #ffffff; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.08); padding: 40px; border: 1px solid #E2E8F0;">
        <!-- Header Controls -->
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #EDF2F7; padding-bottom: 18px; margin-bottom: 28px; flex-wrap: wrap; gap: 12px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="background: #0284C7; color: #fff; font-size: 12px; font-weight: bold; padding: 4px 10px; border-radius: 20px;">READING MODE</span>
            <span style="color: #64748B; font-size: 14px;">Same Web, Different Eyes</span>
          </div>
          <div style="display: flex; gap: 8px; align-items: center;">
            <button id="swde-reader-tts-btn" style="background: #E0F2FE; color: #0284C7; border: none; padding: 8px 14px; border-radius: 8px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px;">
              🔊 Read Aloud
            </button>
            <button id="swde-reader-simplify-btn" style="background: #F3E8FF; color: #7C3AED; border: none; padding: 8px 14px; border-radius: 8px; font-weight: 600; cursor: pointer;">
              ✨ Simplify Text
            </button>
            <button id="swde-reader-theme-btn" style="background: #F1F5F9; color: #334155; border: 1px solid #CBD5E1; padding: 8px 12px; border-radius: 8px; font-weight: 600; cursor: pointer;">
              🌓 Theme
            </button>
            <button id="swde-reader-close-btn" style="background: #0B132B; color: #fff; border: none; padding: 8px 16px; border-radius: 8px; font-weight: 600; cursor: pointer;">
              ✕ Exit
            </button>
          </div>
        </div>

        <!-- Article Content -->
        <h1 style="font-size: 32px; font-weight: 800; color: #0B132B; margin-bottom: 12px; line-height: 1.3;">
          ${s}
        </h1>
        <div style="font-size: 14px; color: #64748B; margin-bottom: 24px;">
          Clean reader layout • Estimated read time: ${Math.ceil(i.length/3)} min
        </div>

        <div id="swde-reader-body" style="font-size: 19px; line-height: 1.85; color: #2D3748;">
          ${i.map(m=>`<p style="margin-bottom: 20px;">${m}</p>`).join("")}
        </div>
      </div>
    `,document.body.appendChild(a),this.rootEl=a;const n=a.querySelector("#swde-reader-close-btn");n==null||n.addEventListener("click",()=>this.close());const o=m=>{m.key==="Escape"&&(this.close(),window.removeEventListener("keydown",o))};window.addEventListener("keydown",o);const l=a.querySelector("#swde-reader-tts-btn");l==null||l.addEventListener("click",()=>{this.isSpeaking?(j.stop(),this.isSpeaking=!1,l.textContent="🔊 Read Aloud"):(j.speak(this.currentContent,{onEnd:()=>{this.isSpeaking=!1,l&&(l.textContent="🔊 Read Aloud")}}),this.isSpeaking=!0,l.textContent="⏹ Stop Reading")});const r=a.querySelector("#swde-reader-simplify-btn"),d=a.querySelector("#swde-reader-body");r==null||r.addEventListener("click",async()=>{r.disabled=!0,r.textContent="Simplifying...";try{const m=await Be.simplifyText({text:this.currentContent,level:"simple"});d&&(d.innerHTML=`
            <div style="background: #F0FDF4; border: 1px solid #86EFAC; border-radius: 10px; padding: 16px; margin-bottom: 24px;">
              <strong style="color: #166534;">✨ Key Takeaways:</strong>
              <ul style="margin: 8px 0 0 16px; color: #166534;">
                ${m.keyPoints.map(f=>`<li>${f}</li>`).join("")}
              </ul>
            </div>
            ${m.simplifiedText.split(`

`).map(f=>`<p style="margin-bottom: 18px;">${f}</p>`).join("")}
          `,r.textContent="✓ Simplified")}catch{r.textContent="✨ Simplify Text"}finally{r.disabled=!1}});let p=0;const u=[{bg:"#F8F9FA",card:"#ffffff",text:"#1A202C"},{bg:"#0F172A",card:"#1E293B",text:"#F8FAFC"},{bg:"#FBF0D9",card:"#F7E7C4",text:"#3E2723"}],g=a.querySelector("#swde-reader-theme-btn");g==null||g.addEventListener("click",()=>{p=(p+1)%u.length;const m=u[p];a.style.background=m.bg;const f=a.querySelector("div");f&&(f.style.background=m.card,f.style.color=m.text)})}static close(){this.isSpeaking&&(j.stop(),this.isSpeaking=!1),this.rootEl&&(this.rootEl.remove(),this.rootEl=null);const s=document.getElementById("swde-reading-mode-root");s&&s.remove()}}x(_,"rootEl",null),x(_,"isSpeaking",!1),x(_,"currentContent","");const qe="swde-visual-reading-indicator",Oe="swde-reading-cursor-badge";class N{static setVoiceOptions(s=1,t=""){this.rate=s,this.voiceName=t}static prepareDocumentSentences(){if(typeof document>"u")return[];const s=document.querySelectorAll("main p, main h1, main h2, main h3, main h4, main h5, main h6, main li, article p, article h1, article h2, article h3, article li, .content p, p, h1, h2, h3, h4"),t=[];return s.forEach(i=>{var o;if(i.closest("#swde-floating-toolbar-root")||i.closest("#swde-sentence-simplifier-tooltip")||i.closest("#swde-reading-mode-root")||i.closest("#swde-form-review-modal")||i.closest("nav")||i.closest("header")||i.offsetParent===null)return;const a=(o=i.textContent)==null?void 0:o.trim();if(!a||a.length<5)return;const n=a.match(/[^.!?]+[.!?]+(\s|$)|[^.!?]+$/g);n?n.forEach(l=>{const r=l.trim();r.length>5&&t.push({element:i,text:r,rect:i.getBoundingClientRect()})}):t.push({element:i,text:a,rect:i.getBoundingClientRect()})}),this.sentences=t,t}static startNarration(s=0){if(this.prepareDocumentSentences(),this.sentences.length===0){j.speak("No readable text found on this page.");return}this.currentIndex=Math.max(0,Math.min(s,this.sentences.length-1)),this.isNarrating=!0,this.isPaused=!1,this.speakCurrentSentence()}static pauseNarration(){this.isNarrating&&(j.pause(),this.isPaused=!0,this.cursorBadgeEl&&(this.cursorBadgeEl.textContent="⏸ Paused"))}static resumeNarration(){this.isNarrating&&this.isPaused?(j.resume(),this.isPaused=!1,this.cursorBadgeEl&&(this.cursorBadgeEl.textContent="🔊 Reading...")):this.isNarrating||this.startNarration(this.currentIndex)}static stopNarration(){this.isNarrating=!1,this.isPaused=!1,j.stop(),this.removeVisualIndicator()}static startReading(s){this.startNarration(0)}static pauseOrResume(){this.isPaused?this.resumeNarration():this.pauseNarration()}static stopReading(){this.stopNarration()}static nextSentence(){this.currentIndex<this.sentences.length-1?(this.currentIndex++,this.speakCurrentSentence()):this.stopNarration()}static prevSentence(){this.currentIndex>0&&(this.currentIndex--,this.speakCurrentSentence())}static speakCurrentSentence(){if(!this.isNarrating||this.currentIndex>=this.sentences.length){this.stopNarration();return}const s=this.sentences[this.currentIndex];this.highlightSentence(s),j.speak(s.text,{rate:this.rate,voiceName:this.voiceName,onEnd:()=>{this.isNarrating&&!this.isPaused&&this.nextSentence()},onError:()=>{this.isNarrating&&this.nextSentence()}})}static highlightSentence(s){if(typeof document>"u")return;s.element.scrollIntoView({behavior:"smooth",block:"center"});const t=s.element.getBoundingClientRect(),i=window.scrollX||window.pageXOffset,a=window.scrollY||window.pageYOffset;this.indicatorEl||(this.indicatorEl=document.createElement("div"),this.indicatorEl.id=qe,this.indicatorEl.setAttribute("aria-hidden","true"),this.indicatorEl.style.cssText=`
        position: absolute;
        pointer-events: none;
        z-index: 2147483640;
        background: rgba(14, 165, 233, 0.22);
        border: 2px solid #0284c7;
        border-radius: 6px;
        box-shadow: 0 0 0 4px rgba(14, 165, 233, 0.25);
        transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      `,document.body.appendChild(this.indicatorEl)),this.cursorBadgeEl||(this.cursorBadgeEl=document.createElement("div"),this.cursorBadgeEl.id=Oe,this.cursorBadgeEl.setAttribute("aria-hidden","true"),this.cursorBadgeEl.style.cssText=`
        position: absolute;
        pointer-events: none;
        z-index: 2147483641;
        background: #0284c7;
        color: #ffffff;
        font-family: -apple-system, BlinkMacSystemFont, sans-serif;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.05em;
        padding: 3px 8px;
        border-radius: 4px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      `,document.body.appendChild(this.cursorBadgeEl)),this.indicatorEl.style.left=`${t.left+i-4}px`,this.indicatorEl.style.top=`${t.top+a-2}px`,this.indicatorEl.style.width=`${Math.max(t.width+8,40)}px`,this.indicatorEl.style.height=`${Math.max(t.height+4,24)}px`,this.cursorBadgeEl.textContent="🔊 Reading...",this.cursorBadgeEl.style.left=`${t.left+i}px`,this.cursorBadgeEl.style.top=`${Math.max(0,t.top+a-22)}px`}static removeVisualIndicator(){this.indicatorEl&&(this.indicatorEl.remove(),this.indicatorEl=null),this.cursorBadgeEl&&(this.cursorBadgeEl.remove(),this.cursorBadgeEl=null)}static navigateToType(s,t=!1){var r;let i="";switch(s){case"heading":i='h1, h2, h3, h4, h5, h6, [role="heading"]';break;case"link":i="a[href]";break;case"button":i='button, input[type="button"], input[type="submit"], [role="button"]';break;case"form":i='input:not([type="hidden"]), select, textarea, [role="textbox"], [role="combobox"]';break}const a=Array.from(document.querySelectorAll(i)).filter(d=>d.offsetParent!==null&&!d.closest("#swde-floating-toolbar-root")&&!d.closest("#swde-reading-mode-root"));if(a.length===0){j.speak(`No ${s}s found on this page.`);return}this.navigableElements=a,t?this.navIndex=this.navIndex<=0?a.length-1:this.navIndex-1:this.navIndex=(this.navIndex+1)%a.length;const n=a[this.navIndex];n.focus(),n.scrollIntoView({behavior:"smooth",block:"center"});const o=n.getAttribute("aria-label")||((r=n.textContent)==null?void 0:r.trim())||n.getAttribute("placeholder")||"";let l=`${s}: ${o.slice(0,80)}`;s==="heading"&&(l=`Heading level ${n.tagName.replace("H","")}: ${o}`),this.highlightSentence({element:n,text:l,rect:n.getBoundingClientRect()}),j.speak(l,{rate:this.rate})}static isNarratingActive(){return this.isNarrating&&!this.isPaused}}x(N,"sentences",[]),x(N,"currentIndex",0),x(N,"isNarrating",!1),x(N,"isPaused",!1),x(N,"indicatorEl",null),x(N,"cursorBadgeEl",null),x(N,"rate",1),x(N,"voiceName",""),x(N,"navigableElements",[]),x(N,"navIndex",-1);const ze="swde-sentence-simplifier-tooltip",b=class b{static enable(){this.active||typeof document>"u"||(this.active=!0,document.addEventListener("mousemove",this.handleMouseMove),document.addEventListener("keydown",this.handleKeyDown))}static disable(){!this.active||typeof document>"u"||(this.active=!1,document.removeEventListener("mousemove",this.handleMouseMove),document.removeEventListener("keydown",this.handleKeyDown),this.hideTooltip())}static extractSentenceAtPoint(s,t,i){var o;const a=(o=i.textContent)==null?void 0:o.trim();if(!a||a.length<20)return null;const n=a.match(/[^.!?]+[.!?]+(\s|$)|[^.!?]+$/g);if(!n||n.length===0)return a;if(n.length===1)return n[0].trim();if(document.caretRangeFromPoint){const l=document.caretRangeFromPoint(s,t);if(l&&l.startContainer.nodeType===Node.TEXT_NODE){const r=l.startOffset,d=l.startContainer.textContent||"",p=d.match(/[^.!?]+[.!?]+(\s|$)|[^.!?]+$/g)||[d];let u=0;for(const g of p)if(u+=g.length,r<=u)return g.trim()}}return n[0].trim()}static showTooltip(s,t,i){var d,p;this.currentSentence=s;const a=Ie.simplifyText(s,"simple");this.tooltipEl||(this.tooltipEl=document.createElement("div"),this.tooltipEl.id=ze,this.tooltipEl.setAttribute("role","tooltip"),this.tooltipEl.style.cssText=`
        position: fixed;
        z-index: 2147483647;
        background: #0B132B;
        color: #F8F9FA;
        border: 1.5px solid #0EA5E9;
        border-radius: 12px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.45);
        padding: 12px 14px;
        max-width: 380px;
        font-family: 'Atkinson Hyperlegible', -apple-system, sans-serif;
        font-size: 13.5px;
        line-height: 1.6;
        user-select: text;
        animation: swdeTooltipFade 0.2s ease-out;
      `,document.body.appendChild(this.tooltipEl));const n=360,o=Math.max(16,Math.min(window.innerWidth-n-20,t-n/2)),l=i>180?i-140:i+30;this.tooltipEl.style.left=`${o}px`,this.tooltipEl.style.top=`${l}px`;const r=a.difficultWordsExplained.length>0?`<div style="margin-top: 8px; padding-top: 6px; border-top: 1px solid #1C2541; font-size: 11px; color: #7DD3FC;">
           ${a.difficultWordsExplained.map(u=>`<strong>${u.word}</strong>: ${u.explanation}`).join(" • ")}
         </div>`:"";this.tooltipEl.innerHTML=`
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
        <span style="font-size: 10px; font-weight: bold; text-transform: uppercase; color: #38BDF8; letter-spacing: 0.05em; display: flex; align-items: center; gap: 4px;">
          ✨ Simplified Meaning
        </span>
        <div style="display: flex; gap: 6px;">
          <button id="swde-tt-tts-btn" style="background: transparent; border: none; cursor: pointer; color: #94A3B8; font-size: 12px;" title="Read Aloud">🔊</button>
          <button id="swde-tt-close-btn" style="background: transparent; border: none; cursor: pointer; color: #94A3B8; font-size: 12px;" title="Close">✕</button>
        </div>
      </div>
      <div style="color: #F1F5F9; font-weight: 500;">
        ${a.simplifiedText}
      </div>
      ${r}
    `,(d=this.tooltipEl.querySelector("#swde-tt-close-btn"))==null||d.addEventListener("click",()=>{this.hideTooltip()}),(p=this.tooltipEl.querySelector("#swde-tt-tts-btn"))==null||p.addEventListener("click",()=>{j.speak(a.simplifiedText)})}static hideTooltip(){this.tooltipEl&&(this.tooltipEl.remove(),this.tooltipEl=null),this.currentSentence=""}};x(b,"active",!1),x(b,"hoverTimer",null),x(b,"tooltipEl",null),x(b,"currentSentence",""),x(b,"handleMouseMove",s=>{if(!b.active)return;clearTimeout(b.hoverTimer);const t=s.target;if(t&&!(t.closest("#swde-floating-toolbar-root")||t.closest("#swde-sentence-simplifier-tooltip")||t.closest("#swde-reading-mode-root")||t.closest("#swde-form-review-modal"))){if(!["P","LI","ARTICLE","BLOCKQUOTE","H1","H2","H3","H4","H5","H6","SPAN","DIV"].includes(t.tagName)){b.hideTooltip();return}b.hoverTimer=setTimeout(()=>{const i=b.extractSentenceAtPoint(s.clientX,s.clientY,t);i&&i.length>25&&i!==b.currentSentence&&b.showTooltip(i,s.clientX,s.clientY)},600)}}),x(b,"handleKeyDown",s=>{var t;if(b.active)if(s.altKey&&s.key.toLowerCase()==="d"){s.preventDefault();const i=(t=window.getSelection())==null?void 0:t.toString().trim();if(i&&i.length>10){b.showTooltip(i,window.innerWidth/2-160,120);return}const a=document.activeElement;if(a&&a.textContent){const n=a.textContent.trim();if(n.length>20){const o=a.getBoundingClientRect();b.showTooltip(n.slice(0,200),o.left,o.top-10)}}}else s.key==="Escape"&&b.hideTooltip()});let T=b;class S{static enable(s=!0,t=!0,i=0){typeof document>"u"||(E.updateBrightnessReduction(i),t&&this.pauseAllMedia(),s&&this.detectAndSuppressFlashing(),this.observer||(this.observer=new MutationObserver(a=>{let n=!1;a.forEach(o=>{o.addedNodes.length>0&&(n=!0)}),n&&(t&&this.pauseAllMedia(),s&&this.detectAndSuppressFlashing())}),this.observer.observe(document.body||document.documentElement,{childList:!0,subtree:!0})))}static disable(){this.observer&&(this.observer.disconnect(),this.observer=null),E.updateBrightnessReduction(0),this.restoreSuppressedElements(),this.isEmergencyStop=!1}static triggerEmergencyStop(){this.isEmergencyStop=!0,this.pauseAllMedia();const s=document.createElement("style");s.id="swde-emergency-freeze",s.textContent=`
      *, *::before, *::after {
        animation-play-state: paused !important;
        animation-duration: 0.0001ms !important;
        transition-duration: 0.0001ms !important;
      }
      video, audio {
        visibility: hidden !important;
      }
      .flashing, .blink, [class*="blink"], marquee {
        display: none !important;
      }
    `,document.head.appendChild(s)}static clearEmergencyStop(){this.isEmergencyStop=!1;const s=document.getElementById("swde-emergency-freeze");s&&s.remove(),this.pauseAllMedia()}static pauseAllMedia(){document.querySelectorAll("video, audio").forEach(s=>{try{s.autoplay=!1,s.pause(),s.removeAttribute("autoplay")}catch{}})}static detectAndSuppressFlashing(){document.querySelectorAll('.flashing, .blink, [class*="blink"], [class*="pulse"], marquee, [class*="flashing"]').forEach(t=>{t.getAttribute("data-swde-suppressed")||(this.suppressedElements.push({el:t,originalStyles:t.getAttribute("style")||""}),t.setAttribute("data-swde-suppressed","true"),t.style.animation="none",t.style.transition="none",t.style.opacity="0.9")})}static restoreSuppressedElements(){this.suppressedElements.forEach(({el:s,originalStyles:t})=>{try{s.removeAttribute("data-swde-suppressed"),s.setAttribute("style",t)}catch{}}),this.suppressedElements=[]}}x(S,"observer",null),x(S,"isEmergencyStop",!1),x(S,"suppressedElements",[]);const w=class w{static enableSpotlight(){this.spotlightActive||typeof document>"u"||(this.spotlightActive=!0,document.body.classList.add("swde-spotlight-active"),document.addEventListener("mouseover",this.handleMouseOver),document.addEventListener("focusin",this.handleFocusIn))}static disableSpotlight(){!this.spotlightActive||typeof document>"u"||(this.spotlightActive=!1,document.body.classList.remove("swde-spotlight-active"),document.removeEventListener("mouseover",this.handleMouseOver),document.removeEventListener("focusin",this.handleFocusIn),this.currentFocusedParagraph&&(this.currentFocusedParagraph.classList.remove("swde-current-focus"),this.currentFocusedParagraph=null))}static restoreHiddenElements(){const s=document.querySelectorAll(".swde-manually-hidden");let t=0;return s.forEach(i=>{i.classList.remove("swde-manually-hidden"),i.style.display="",t++}),t}};x(w,"spotlightActive",!1),x(w,"currentFocusedParagraph",null),x(w,"hiddenDistractions",[]),x(w,"handleMouseOver",s=>{var i;const t=(i=s.target)==null?void 0:i.closest("p, li, blockquote");t&&(t.closest("#swde-floating-toolbar-root")||t.closest("#swde-reading-mode-root")||(w.currentFocusedParagraph&&w.currentFocusedParagraph!==t&&w.currentFocusedParagraph.classList.remove("swde-current-focus"),w.currentFocusedParagraph=t,t.classList.add("swde-current-focus")))}),x(w,"handleFocusIn",s=>{var i;const t=(i=s.target)==null?void 0:i.closest("p, li, blockquote, h1, h2, h3, a, input, button");t&&(w.currentFocusedParagraph&&w.currentFocusedParagraph!==t&&w.currentFocusedParagraph.classList.remove("swde-current-focus"),w.currentFocusedParagraph=t,t.classList.add("swde-current-focus"))});let L=w;class ie{static async analyzeImage(s,t){var v,k,C,B;const i=s.naturalWidth||s.clientWidth||100,a=s.naturalHeight||s.clientHeight||100,n=!s.alt||s.alt.trim()==="",o=s.src||"",l=s.closest("figure"),r=((k=(v=l==null?void 0:l.querySelector("figcaption"))==null?void 0:v.textContent)==null?void 0:k.trim())||"",d=((B=(C=s.parentElement)==null?void 0:C.textContent)==null?void 0:B.replace(s.alt||"","").trim().slice(0,150))||"",p=(o+" "+(s.className||"")+" "+(s.id||"")).toLowerCase(),u=p.includes("chart")||p.includes("graph")||p.includes("diagram")||p.includes("plot")||p.includes("infographic"),g=await this.extractTextFromCanvas(s);let m="";s.alt&&s.alt.trim().length>5?m=`Existing alt text: "${s.alt}".`:r?m=`Figure illustration representing: "${r}".`:u?m=`Technical diagram / chart illustration (${i}x${a}px). Visual data presentation.`:m=`Webpage photographic illustration (${i}x${a}px). Context: ${d||"General page content"}.`,g&&(m+=` Contains text: "${g}".`);let f;return g&&t&&t!=="en"&&(f=R.translateText(g,t)),{imageUrl:o,element:s,detectedText:g,translatedText:f,description:m,isDiagramOrChart:u,dimensions:{width:i,height:a},missingAlt:n}}static async scanAllImages(s){if(typeof document>"u")return[];const t=Array.from(document.querySelectorAll("img")).filter(a=>a.offsetParent!==null&&a.clientWidth>40&&a.clientHeight>40&&!a.closest("#swde-floating-toolbar-root")),i=[];for(const a of t.slice(0,12)){const n=await this.analyzeImage(a,s);i.push(n)}return i}static async extractTextFromCanvas(s){var t;try{const i=document.createElement("canvas"),a=i.getContext("2d");if(!a)return"";i.width=Math.min(s.naturalWidth||s.clientWidth,600),i.height=Math.min(s.naturalHeight||s.clientHeight,400),a.drawImage(s,0,0,i.width,i.height);const n=s.getAttribute("title")||s.getAttribute("data-text")||"";if(n)return n;const o=s.src.split("/"),l=((t=o[o.length-1])==null?void 0:t.split("?")[0])||"";if(l.length>3&&!l.match(/^[0-9a-f-]{10,}\./i)){const r=decodeURIComponent(l).replace(/[-_]/g," ").replace(/\.[a-z0-9]+$/i,"");if(r.length>5&&!r.match(/photo|image|img|screenshot/i))return r}return""}catch{return""}}static showImageOverlay(s){var l;const t=document.getElementById("swde-image-ocr-overlay");t&&t.remove();const i=s.element.getBoundingClientRect(),a=window.scrollX||window.pageXOffset,n=window.scrollY||window.pageYOffset,o=document.createElement("div");o.id="swde-image-ocr-overlay",o.style.cssText=`
      position: absolute;
      left: ${i.left+a}px;
      top: ${i.bottom+n+8}px;
      z-index: 2147483645;
      background: #0B132B;
      color: #F8F9FA;
      border: 1.5px solid #0EA5E9;
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
      padding: 14px;
      max-width: 380px;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 13px;
      line-height: 1.5;
      animation: swdeFadeIn 0.2s ease-out;
    `,o.innerHTML=`
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
        <span style="font-size: 11px; font-weight: 700; color: #38BDF8; text-transform: uppercase;">
          🖼️ Image Understanding
        </span>
        <button id="swde-ocr-close" style="background: transparent; border: none; color: #94A3B8; cursor: pointer; font-size: 14px;">✕</button>
      </div>
      <div style="font-weight: 600; color: #FFFFFF; margin-bottom: 6px;">
        ${s.description}
      </div>
      ${s.detectedText?`<div style="background: #1C2541; padding: 8px; border-radius: 6px; font-size: 12px; margin-top: 6px;">
               <div style="color: #7DD3FC; font-weight: bold; font-size: 10px; text-transform: uppercase;">Extracted Text:</div>
               <div style="color: #F1F5F9;">${s.detectedText}</div>
               ${s.translatedText?`<div style="color: #A7F3D0; margin-top: 4px;"><strong>Translation:</strong> ${s.translatedText}</div>`:""}
             </div>`:""}
    `,document.body.appendChild(o),(l=o.querySelector("#swde-ocr-close"))==null||l.addEventListener("click",()=>o.remove())}}const _e={personal:{firstName:"Ananya",lastName:"Sharma",fullName:"Ananya Sharma",dateOfBirth:"2002-08-14",gender:"Female",email:"ananya.sharma@example.edu",phone:"+91 98765 43210"},address:{addressLine:"42 Orchid Residency, 5th Cross, Rajajinagar",city:"Bengaluru",state:"Karnataka",country:"India",pinCode:"560010"},education:{school:"National Public School",college:"Sapthagiri NPS University",university:"Visvesvaraya Technological University",course:"Computer Science and Engineering",degree:"Bachelor of Technology",graduationYear:"2026",studentId:"1SP22CS045",gpaCgpa:"9.4"},professional:{jobTitle:"Research Fellow",skills:"React, TypeScript, Accessibility, AI Integration",workExperience:"2 years",organization:"Digital Inclusion Labs",resumeDetails:"Passionate about accessible computing for all"},customFields:[{id:"c1",name:"Blood Group",value:"B+",category:"personal"},{id:"c2",name:"Family Annual Income",value:"INR 4,50,000",category:"academic"}]},He=[{type:"protanopia",name:"Protanopia",description:"Red-blind (Brettel 1997 matrix)"},{type:"protanomaly",name:"Protanomaly",description:"Red-weak (Machado anomalous trichromacy)"},{type:"deuteranopia",name:"Deuteranopia",description:"Green-blind (Brettel 1997 matrix)"},{type:"deuteranomaly",name:"Deuteranomaly",description:"Green-weak (Machado anomalous trichromacy)"},{type:"tritanopia",name:"Tritanopia",description:"Blue-blind (Brettel 1997 matrix)"},{type:"tritanomaly",name:"Tritanomaly",description:"Blue-weak (Machado anomalous trichromacy)"},{type:"achromatopsia",name:"Achromatopsia",description:"Total color blindness (Greyscale luminance)"},{type:"achromatomaly",name:"Achromatomaly",description:"Partial monochromacy (Desaturated)"}],Ve=()=>{const[h,s]=y.useState("none"),[t,i]=y.useState(null),[a,n]=y.useState("deuteranopia"),[o,l]=y.useState(100),[r,d]=y.useState(!1),[p,u]=y.useState(!1),[g,m]=y.useState(!1),[f,v]=y.useState(0),[k,C]=y.useState(!1),[B,I]=y.useState(!1),[$,Y]=y.useState(!1),[oe,U]=y.useState(0),[Z,D]=y.useState(!1),[M,re]=y.useState("hi"),[le,G]=y.useState(!1),[Q,P]=y.useState(null),[Ye,de]=y.useState(null);y.useEffect(()=>()=>{E.removeFromDOM(),T.disable(),N.stopReading(),L.disableSpotlight(),S.disable(),R.restoreOriginalPage()},[]);const A=c=>{if(s(c),c==="none"){E.removeFromDOM(),T.disable(),N.stopReading(),L.disableSpotlight(),S.disable(),R.restoreOriginalPage(),d(!1),u(!1),m(!1),v(0),U(0),D(!1),C(!1),G(!1),P(null),$&&(S.clearEmergencyStop(),Y(!1));return}const F={masterToggle:!0,activeProfileIds:[c],profiles:Se.map(W=>({...W,enabled:W.presetId===c||W.id===c})),activeSiteDomain:"localhost",siteExceptions:{}},q=Ae.getEffectiveSettings(F);E.applyToDOM(q),c==="dyslexia"?(v((q==null?void 0:q.visual.warmTintIntensity)||20),u(!0),E.updateReadingFocus(!1,!0,36),T.enable(),C(!0)):c==="colorBlindness"?d(!0):c==="adhdFocus"?(L.enableSpotlight(),D(!0)):c==="photosensitivity"&&(S.enable(!0,!0,20),U(20))},J=(c,F)=>{n(c),l(F),d(!0),E.updateColorBlindnessFilter(c,F)},ce=()=>{const c=!g;m(c),E.updateReadingFocus(c,p,36)},pe=()=>{const c=!p;u(c),E.updateReadingFocus(g,c,36)},ue=c=>{v(c),E.updateWarmTint(c)},me=()=>{k?(T.disable(),C(!1)):(T.enable(),C(!0))},he=()=>{I(!0),N.startReading(()=>{I(!1)})},xe=()=>{N.pauseOrResume()},fe=()=>{N.stopReading(),I(!1)},ge=()=>{$?(S.clearEmergencyStop(),Y(!1)):(S.triggerEmergencyStop(),Y(!0))},be=c=>{U(c),E.updateBrightnessReduction(c)},ye=()=>{Z?(L.disableSpotlight(),D(!1)):(L.enableSpotlight(),D(!0))},ve=()=>{const c=R.translateCurrentPage(M);G(!0),P(`✓ Successfully translated ${c.translatedCount} text nodes to ${M.toUpperCase()} using offline local engine! Zero cloud data was sent.`)},we=()=>{const c=R.restoreOriginalPage();G(!1),P(`✓ Restored ${c} text nodes to original English.`)},Ne=async()=>{const c=document.getElementById("demo-research-image");if(c){const F=await ie.analyzeImage(c,M);de(F),ie.showImageOverlay(F)}},Ee=()=>{const c=De.detectFields(document),F=Pe.matchFields(c,_e);ne.show(F,c.length)},ke=()=>{_.open()},je=c=>{c.preventDefault(),i("✓ Application Submitted Successfully! All form fields verified.")};return e.jsxs("div",{className:"min-h-screen bg-slate-100 font-sans text-slate-800",children:[e.jsx("header",{className:"bg-navy-950 text-white p-3 border-b-2 border-aqua-500 sticky top-0 z-50 shadow-2xl",children:e.jsxs("div",{className:"max-w-7xl mx-auto flex flex-col gap-2.5 text-xs",children:[e.jsxs("div",{className:"flex flex-wrap items-center justify-between gap-3",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"bg-gradient-to-r from-aqua-400 to-teal-400 text-navy-950 font-black px-2.5 py-1 rounded text-[11px] tracking-wide uppercase shadow",children:"SWDE Demo Lab"}),e.jsx("span",{className:"font-semibold text-slate-200",children:'Test "Same Web, Different Eyes" Accessibility Engine Live:'})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsxs("button",{onClick:ge,className:`px-3 py-1.5 rounded-lg font-black transition-all flex items-center gap-1.5 shadow ${$?"bg-rose-500 text-white animate-pulse":"bg-rose-900/80 hover:bg-rose-800 text-rose-200 border border-rose-700"}`,title:"Immediately freeze all animations, suppress flashing, and pause media",children:[e.jsx("span",{children:"🚨"}),e.jsx("span",{children:$?"RESUME PAGE":"EMERGENCY FREEZE"})]}),e.jsx("button",{onClick:Ee,className:"px-3.5 py-1.5 rounded-lg font-extrabold bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-navy-950 shadow-md flex items-center gap-1",children:"⚡ Test Auto-Fill"}),e.jsx("button",{onClick:ke,className:"px-3 py-1.5 rounded-lg font-bold bg-navy-800 hover:bg-navy-700 text-aqua-300 border border-navy-700",children:"📖 Reader View"})]})]}),e.jsxs("div",{className:"flex flex-wrap items-center gap-1.5 pt-1 border-t border-navy-800/80",children:[e.jsx("span",{className:"text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1",children:"Presets:"}),e.jsx("button",{onClick:()=>A("none"),className:`px-2.5 py-1 rounded-md font-bold transition-all ${h==="none"&&!r?"bg-rose-600 text-white shadow":"bg-navy-800 hover:bg-navy-700 text-slate-300"}`,children:"Original Inaccessible"}),e.jsx("button",{onClick:()=>A("dyslexia"),className:`px-2.5 py-1 rounded-md font-bold transition-all ${h==="dyslexia"?"bg-aqua-500 text-navy-950 shadow":"bg-navy-800 hover:bg-navy-700 text-slate-300"}`,children:"📖 Dyslexia Mode"}),e.jsx("button",{onClick:()=>A("colorBlindness"),className:`px-2.5 py-1 rounded-md font-bold transition-all ${h==="colorBlindness"||r?"bg-aqua-500 text-navy-950 shadow":"bg-navy-800 hover:bg-navy-700 text-slate-300"}`,children:"🎨 Color Blind"}),e.jsx("button",{onClick:()=>A("lowVision"),className:`px-2.5 py-1 rounded-md font-bold transition-all ${h==="lowVision"?"bg-aqua-500 text-navy-950 shadow":"bg-navy-800 hover:bg-navy-700 text-slate-300"}`,children:"🔍 Low Vision"}),e.jsx("button",{onClick:()=>A("photosensitivity"),className:`px-2.5 py-1 rounded-md font-bold transition-all ${h==="photosensitivity"?"bg-aqua-500 text-navy-950 shadow":"bg-navy-800 hover:bg-navy-700 text-slate-300"}`,children:"🛡️ Seizure Guard"}),e.jsx("button",{onClick:()=>A("adhdFocus"),className:`px-2.5 py-1 rounded-md font-bold transition-all ${h==="adhdFocus"?"bg-aqua-500 text-navy-950 shadow":"bg-navy-800 hover:bg-navy-700 text-slate-300"}`,children:"🎯 ADHD Focus"}),e.jsx("button",{onClick:()=>A("seniorFriendly"),className:`px-2.5 py-1 rounded-md font-bold transition-all ${h==="seniorFriendly"?"bg-aqua-500 text-navy-950 shadow":"bg-navy-800 hover:bg-navy-700 text-slate-300"}`,children:"👓 Senior Mode"})]}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-2 pt-2 border-t border-navy-800 text-[11px]",children:[e.jsxs("div",{className:"bg-navy-900 p-2 rounded-lg border border-navy-700 space-y-1.5",children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx("span",{className:"font-bold text-aqua-400",children:"🎨 8 Color Blind Types"}),e.jsxs("span",{className:"text-[10px] text-slate-400",children:[o,"%"]})]}),e.jsxs("div",{className:"flex gap-1.5",children:[e.jsx("select",{value:a,onChange:c=>J(c.target.value,o),className:"bg-navy-950 text-white text-[11px] p-1 rounded border border-navy-700 flex-1",children:He.map(c=>e.jsx("option",{value:c.type,children:c.name},c.type))}),e.jsx("input",{type:"range",min:"10",max:"100",value:o,onChange:c=>J(a,Number(c.target.value)),className:"w-16 accent-aqua-500",title:"Severity intensity"})]})]}),e.jsxs("div",{className:"bg-navy-900 p-2 rounded-lg border border-navy-700 space-y-1.5",children:[e.jsx("span",{className:"font-bold text-aqua-400 block",children:"📖 Dyslexia Reading Focus"}),e.jsxs("div",{className:"flex flex-wrap gap-1",children:[e.jsx("button",{onClick:pe,className:`px-2 py-0.5 rounded text-[10px] font-bold ${p?"bg-amber-400 text-navy-950":"bg-navy-800 text-slate-300"}`,title:"Dims surrounding lines, highlights active reading row",children:"Line Focus"}),e.jsx("button",{onClick:ce,className:`px-2 py-0.5 rounded text-[10px] font-bold ${g?"bg-amber-400 text-navy-950":"bg-navy-800 text-slate-300"}`,title:"Movable guide ruler following pointer or Alt+Up/Down",children:"Ruler"}),e.jsx("button",{onClick:me,className:`px-2 py-0.5 rounded text-[10px] font-bold ${k?"bg-emerald-400 text-navy-950":"bg-navy-800 text-slate-300"}`,title:"Hover pointer over complex text to show plain-language tooltip",children:"Hover AI Tooltip"})]}),e.jsxs("div",{className:"flex items-center gap-1 text-[10px] text-slate-300",children:[e.jsx("span",{children:"Warm Tint:"}),e.jsx("input",{type:"range",min:"0",max:"40",value:f,onChange:c=>ue(Number(c.target.value)),className:"flex-1 accent-amber-400"}),e.jsxs("span",{children:[f,"%"]})]})]}),e.jsxs("div",{className:"bg-navy-900 p-2 rounded-lg border border-navy-700 space-y-1.5",children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx("span",{className:"font-bold text-aqua-400",children:"🔊 Visual Reading Cursor"}),e.jsx("span",{className:"text-[10px] text-emerald-400",children:B?"Reading...":"Idle"})]}),e.jsx("div",{className:"flex gap-1",children:B?e.jsxs(e.Fragment,{children:[e.jsx("button",{onClick:xe,className:"flex-1 py-1 bg-amber-500 hover:bg-amber-400 text-navy-950 font-bold rounded text-[10px]",children:"⏸ Pause/Resume"}),e.jsx("button",{onClick:fe,className:"px-2 py-1 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded text-[10px]",children:"⏹ Stop"})]}):e.jsx("button",{onClick:he,className:"flex-1 py-1 bg-aqua-500 hover:bg-aqua-400 text-navy-950 font-bold rounded text-[10px] shadow",children:"▶ Start Visual Reading"})}),e.jsxs("div",{className:"text-[10px] text-slate-400",children:["Landmarks: ",e.jsx("span",{className:"text-aqua-300 font-mono",children:"Alt+H"})," Headings | ",e.jsx("span",{className:"text-aqua-300 font-mono",children:"Alt+L"})," Links"]})]}),e.jsxs("div",{className:"bg-navy-900 p-2 rounded-lg border border-navy-700 space-y-1.5",children:[e.jsx("span",{className:"font-bold text-aqua-400 block",children:"🌐 Offline Local Translation"}),e.jsxs("div",{className:"flex gap-1",children:[e.jsxs("select",{value:M,onChange:c=>re(c.target.value),className:"bg-navy-950 text-white text-[10px] p-1 rounded border border-navy-700 flex-1",children:[e.jsx("option",{value:"hi",children:"Hindi (हिंदी)"}),e.jsx("option",{value:"kn",children:"Kannada (ಕನ್ನಡ)"}),e.jsx("option",{value:"ta",children:"Tamil (தமிழ்)"}),e.jsx("option",{value:"te",children:"Telugu (తెలుగు)"}),e.jsx("option",{value:"ml",children:"Malayalam (മലയാളം)"}),e.jsx("option",{value:"bn",children:"Bengali (বাংলা)"}),e.jsx("option",{value:"mr",children:"Marathi (मराठी)"})]}),le?e.jsx("button",{onClick:we,className:"px-2 py-0.5 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded text-[10px]",children:"Restore"}):e.jsx("button",{onClick:ve,className:"px-2 py-0.5 bg-teal-500 hover:bg-teal-400 text-navy-950 font-bold rounded text-[10px]",children:"Translate"})]}),e.jsxs("div",{className:"flex items-center justify-between text-[10px]",children:[e.jsx("button",{onClick:ye,className:`px-1.5 py-0.5 rounded font-bold ${Z?"bg-purple-400 text-navy-950":"bg-navy-800 text-slate-400"}`,children:"🎯 ADHD Spotlight"}),e.jsxs("div",{className:"flex items-center gap-1 text-slate-400",children:[e.jsx("span",{children:"Dim:"}),e.jsx("input",{type:"range",min:"0",max:"60",value:oe,onChange:c=>be(Number(c.target.value)),className:"w-12 accent-slate-400",title:"Brightness dimmer"})]})]})]})]}),Q&&e.jsxs("div",{className:"p-1.5 bg-teal-950/90 border border-teal-500/50 text-teal-200 rounded text-[11px] flex justify-between items-center",children:[e.jsx("span",{children:Q}),e.jsx("button",{onClick:()=>P(null),className:"text-teal-400 hover:text-white ml-2 text-xs",children:"✕"})]})]})}),e.jsx("div",{className:"advertisement flashing bg-gradient-to-r from-red-600 via-yellow-400 to-red-600 p-2.5 text-center text-xs font-black text-black tracking-widest uppercase border-b-4 border-black animate-pulse",children:"⚡ FLASHING PROMO: 90% OFF EXAM COACHING TODAY ONLY! CLICK HERE NOW! ⚡"}),e.jsx("header",{className:"bg-blue-950 text-white shadow",children:e.jsxs("div",{className:"max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("div",{className:"w-12 h-12 bg-amber-500 rounded-lg flex items-center justify-center text-2xl font-black text-blue-950",children:"🏛️"}),e.jsxs("div",{children:[e.jsx("h1",{className:"text-xl font-bold tracking-tight",children:"National Higher Education & Research Scholarship Portal"}),e.jsx("p",{className:"text-xs text-blue-200",children:"Department of Higher Education • Official Academic Portal"})]})]}),e.jsxs("nav",{className:"flex gap-4 text-xs font-semibold text-blue-200",children:[e.jsx("a",{href:"#overview",className:"hover:text-white",children:"Fellowship Overview"}),e.jsx("a",{href:"#guidelines",className:"hover:text-white",children:"Guidelines"}),e.jsx("a",{href:"#application-form",className:"hover:text-white bg-blue-800 px-3 py-1.5 rounded",children:"Apply Online"})]})]})}),e.jsxs("div",{className:"max-w-7xl mx-auto px-6 py-8 flex flex-col lg:flex-row gap-8",children:[e.jsxs("main",{className:"flex-1 space-y-8",id:"content",children:[e.jsxs("section",{id:"overview",className:"bg-white p-8 rounded-xl shadow-sm border border-slate-200",children:[e.jsx("div",{className:"inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-full mb-3",children:"OFFICIAL NOTIFICATION: AY 2026-27"}),e.jsx("h2",{className:"text-2xl font-bold text-slate-900 mb-4 leading-snug",children:"National Research & Academic Merit Fellowship Stipulations"}),e.jsxs("div",{className:"text-sm text-slate-700 space-y-4 leading-relaxed",children:[e.jsx("p",{children:"Applications are hereby invited from bonafide undergraduate and postgraduate scholars seeking financial remuneration for advanced scholastic study. The domicile state requirement is mandatory: candidate matriculation credentials must conform strictly with university annexure regulations."}),e.jsx("p",{children:"Notwithstanding prior academic disbursements, all applicants must submit evidence verifying that their aggregate CGPA exceeds 3.50 on a 4.00 standard scale (or equivalent 8.5/10). The aforementioned emoluments shall commence post verification of institution currently attended, subject to the stipulation that candidates endeavor to avoid any discrepancy in their uploaded documentation."})]}),e.jsxs("div",{className:"mt-6 p-4 bg-amber-50 border-l-4 border-amber-500 rounded-r-lg",children:[e.jsx("div",{className:"text-xs font-bold text-amber-800 uppercase tracking-wide",children:"MANDATORY TIMELINE"}),e.jsx("div",{className:"text-base font-extrabold text-amber-950 mt-1",children:"Final Application Submission Deadline: 15 October 2026"}),e.jsx("p",{className:"text-xs text-amber-800 mt-1",children:"Late submissions will terminate without further consideration."})]}),e.jsxs("div",{className:"mt-6 border border-slate-200 rounded-lg p-4 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4",children:[e.jsxs("div",{className:"flex items-center gap-4",children:[e.jsx("img",{id:"demo-research-image",src:"https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=160&auto=format&fit=crop&q=80",alt:"",title:"Group of university students researching in college library",className:"w-24 h-24 object-cover rounded-lg shadow-sm"}),e.jsxs("div",{children:[e.jsx("div",{className:"text-xs font-bold text-slate-900",children:"University Research Scholars"}),e.jsx("div",{className:"text-xs text-slate-500 mt-1",children:"(Notice: This demonstration image intentionally lacks an HTML alt attribute to test AI alt-text generation and Canvas OCR)."})]})]}),e.jsxs("button",{type:"button",onClick:Ne,className:"px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow shrink-0 flex items-center gap-1.5",children:[e.jsx("span",{children:"🔍"}),e.jsx("span",{children:"Inspect Image with Canvas OCR"})]})]})]}),e.jsxs("section",{id:"application-form",className:"bg-white p-8 rounded-xl shadow-sm border border-slate-200",children:[e.jsxs("div",{className:"border-b border-slate-200 pb-4 mb-6",children:[e.jsx("h2",{className:"text-xl font-bold text-slate-900",children:"Official Fellowship Application Form"}),e.jsx("p",{className:"text-xs text-slate-500 mt-1",children:'Please complete all required fields. You can use the "Test Auto-Fill" button at the top to test smart form filling.'})]}),t&&e.jsx("div",{className:"mb-6 p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl font-bold text-sm",children:t}),e.jsxs("form",{onSubmit:je,className:"space-y-6",children:[e.jsxs("div",{children:[e.jsx("h3",{className:"text-xs font-bold text-blue-900 uppercase tracking-wider mb-3",children:"1. Candidate Identification"}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-4",children:[e.jsxs("div",{children:[e.jsx("label",{htmlFor:"fullname_input",className:"block text-xs font-semibold text-slate-700 mb-1",children:"Legal Full Name of Applicant *"}),e.jsx("input",{id:"fullname_input",name:"candidate_full_name",type:"text",required:!0,placeholder:"e.g. Ananya Sharma",className:"w-full p-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:border-blue-600 focus:outline-none"})]}),e.jsxs("div",{children:[e.jsx("label",{htmlFor:"email_input",className:"block text-xs font-semibold text-slate-700 mb-1",children:"Contact Email Address *"}),e.jsx("input",{id:"email_input",name:"applicant_email",type:"email",required:!0,placeholder:"scholar@university.edu",className:"w-full p-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:border-blue-600 focus:outline-none"})]}),e.jsxs("div",{children:[e.jsx("label",{htmlFor:"phone_input",className:"block text-xs font-semibold text-slate-700 mb-1",children:"Primary Mobile Contact Number *"}),e.jsx("input",{id:"phone_input",name:"contact_number",type:"tel",required:!0,placeholder:"+91 98765 43210",className:"w-full p-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:border-blue-600 focus:outline-none"})]}),e.jsxs("div",{children:[e.jsx("label",{htmlFor:"dob_input",className:"block text-xs font-semibold text-slate-700 mb-1",children:"Date of Birth *"}),e.jsx("input",{id:"dob_input",name:"applicant_dob",type:"date",required:!0,className:"w-full p-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:border-blue-600 focus:outline-none"})]})]})]}),e.jsxs("div",{className:"pt-4 border-t border-slate-200",children:[e.jsx("h3",{className:"text-xs font-bold text-blue-900 uppercase tracking-wider mb-3",children:"2. Residence & Domicile Verification"}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-4",children:[e.jsxs("div",{className:"md:col-span-2",children:[e.jsx("label",{htmlFor:"address_input",className:"block text-xs font-semibold text-slate-700 mb-1",children:"Permanent Residence (Full Street Address) *"}),e.jsx("input",{id:"address_input",name:"permanent_residence",type:"text",required:!0,placeholder:"House number, street, locality",className:"w-full p-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:border-blue-600 focus:outline-none"})]}),e.jsxs("div",{children:[e.jsx("label",{htmlFor:"city_input",className:"block text-xs font-semibold text-slate-700 mb-1",children:"City / District *"}),e.jsx("input",{id:"city_input",name:"candidate_city",type:"text",required:!0,placeholder:"e.g. Bengaluru",className:"w-full p-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:border-blue-600 focus:outline-none"})]}),e.jsxs("div",{children:[e.jsx("label",{htmlFor:"domicile_input",className:"block text-xs font-semibold text-slate-700 mb-1",children:"Domicile State *"}),e.jsx("input",{id:"domicile_input",name:"domicile_state",type:"text",required:!0,placeholder:"e.g. Karnataka",className:"w-full p-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:border-blue-600 focus:outline-none"})]}),e.jsxs("div",{children:[e.jsx("label",{htmlFor:"pincode_input",className:"block text-xs font-semibold text-slate-700 mb-1",children:"PIN Code *"}),e.jsx("input",{id:"pincode_input",name:"postal_pincode",type:"text",required:!0,placeholder:"e.g. 560010",className:"w-full p-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:border-blue-600 focus:outline-none"})]}),e.jsxs("div",{children:[e.jsx("label",{htmlFor:"blood_input",className:"block text-xs font-semibold text-slate-700 mb-1",children:"Blood Group (Custom Field Test)"}),e.jsx("input",{id:"blood_input",name:"applicant_blood_group",type:"text",placeholder:"e.g. B+, O+",className:"w-full p-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:border-blue-600 focus:outline-none"})]})]})]}),e.jsxs("div",{className:"pt-4 border-t border-slate-200",children:[e.jsx("h3",{className:"text-xs font-bold text-blue-900 uppercase tracking-wider mb-3",children:"3. Academic Credentials"}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-4",children:[e.jsxs("div",{className:"md:col-span-2",children:[e.jsx("label",{htmlFor:"college_input",className:"block text-xs font-semibold text-slate-700 mb-1",children:"Name of Institution Currently Attended *"}),e.jsx("input",{id:"college_input",name:"institution_currently_attended",type:"text",required:!0,placeholder:"College or University name",className:"w-full p-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:border-blue-600 focus:outline-none"})]}),e.jsxs("div",{children:[e.jsx("label",{htmlFor:"course_input",className:"block text-xs font-semibold text-slate-700 mb-1",children:"Branch / Field of Study *"}),e.jsx("input",{id:"course_input",name:"course_program",type:"text",required:!0,placeholder:"e.g. Computer Science",className:"w-full p-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:border-blue-600 focus:outline-none"})]}),e.jsxs("div",{children:[e.jsx("label",{htmlFor:"roll_input",className:"block text-xs font-semibold text-slate-700 mb-1",children:"Registration Number / Roll No *"}),e.jsx("input",{id:"roll_input",name:"student_id_usn",type:"text",required:!0,placeholder:"e.g. 1SP22CS045",className:"w-full p-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:border-blue-600 focus:outline-none"})]}),e.jsxs("div",{children:[e.jsx("label",{htmlFor:"cgpa_input",className:"block text-xs font-semibold text-slate-700 mb-1",children:"Aggregate CGPA or Marks % *"}),e.jsx("input",{id:"cgpa_input",name:"aggregate_gpa",type:"text",required:!0,placeholder:"e.g. 9.4",className:"w-full p-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:border-blue-600 focus:outline-none"})]}),e.jsxs("div",{children:[e.jsx("label",{htmlFor:"income_input",className:"block text-xs font-semibold text-slate-700 mb-1",children:"Family Annual Income"}),e.jsx("input",{id:"income_input",name:"family_annual_income",type:"text",placeholder:"e.g. INR 4,50,000",className:"w-full p-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:border-blue-600 focus:outline-none"})]})]})]}),e.jsx("div",{className:"pt-4 border-t border-slate-200",children:e.jsxs("label",{className:"flex items-center gap-2 cursor-pointer",children:[e.jsx("input",{type:"checkbox",id:"declaration_checkbox",required:!0,className:"w-4 h-4 accent-blue-600"}),e.jsx("span",{className:"text-xs text-slate-700",children:"I solemnly declare that all statements provided are true and accurate to the best of my knowledge."})]})}),e.jsxs("div",{className:"flex gap-4",children:[e.jsx("button",{type:"submit",className:"px-8 py-3 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-lg text-sm transition-colors shadow",children:"Submit Application"}),e.jsx("button",{type:"button",onClick:()=>V.clearFilled(),className:"px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-lg text-sm transition-colors",children:"Clear Filled Fields"})]})]})]})]}),e.jsxs("aside",{className:"w-full lg:w-80 shrink-0 space-y-6",children:[e.jsxs("div",{className:"advertisement floating-ad bg-amber-100 border-2 border-dashed border-amber-400 p-4 rounded-xl text-center",children:[e.jsx("span",{className:"text-[10px] uppercase font-bold text-amber-700 bg-amber-200 px-2 py-0.5 rounded",children:"Sponsored Ad"}),e.jsx("div",{className:"text-sm font-extrabold text-amber-900 mt-2",children:"Fast Student Loans - No Credit Check Required!"}),e.jsx("p",{className:"text-xs text-amber-800 mt-1",children:"Get instant approval in 5 minutes."}),e.jsx("button",{className:"mt-3 w-full py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded",children:"Apply For Loan"})]}),e.jsxs("div",{className:"bg-white p-5 rounded-xl border border-slate-200 shadow-sm",children:[e.jsx("h3",{className:"text-xs font-bold text-slate-900 uppercase tracking-wider mb-3",children:"Application Status Legend (Color Blind Test)"}),e.jsxs("div",{className:"space-y-2 text-xs",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("div",{className:"w-4 h-4 rounded bg-emerald-500 shadow-sm"}),e.jsx("span",{className:"text-slate-700 font-medium",children:"Eligible (Green only)"})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("div",{className:"w-4 h-4 rounded bg-amber-500 shadow-sm"}),e.jsx("span",{className:"text-slate-700 font-medium",children:"Under Review (Yellow only)"})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("div",{className:"w-4 h-4 rounded bg-rose-500 shadow-sm"}),e.jsx("span",{className:"text-slate-700 font-medium",children:"Ineligible (Red only)"})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("div",{className:"w-4 h-4 rounded bg-blue-500 shadow-sm"}),e.jsx("span",{className:"text-slate-700 font-medium",children:"Verified (Blue only)"})]})]}),e.jsxs("div",{className:"mt-4 pt-3 border-t border-slate-200",children:[e.jsx("div",{className:"text-[11px] font-semibold text-slate-600 mb-2",children:"Live Spectrum Test Bar:"}),e.jsxs("div",{className:"flex h-6 rounded overflow-hidden shadow-inner",children:[e.jsx("div",{className:"flex-1 bg-red-600",title:"Red"}),e.jsx("div",{className:"flex-1 bg-orange-500",title:"Orange"}),e.jsx("div",{className:"flex-1 bg-yellow-400",title:"Yellow"}),e.jsx("div",{className:"flex-1 bg-green-600",title:"Green"}),e.jsx("div",{className:"flex-1 bg-cyan-500",title:"Cyan"}),e.jsx("div",{className:"flex-1 bg-blue-600",title:"Blue"}),e.jsx("div",{className:"flex-1 bg-purple-600",title:"Purple"})]})]})]}),e.jsxs("div",{className:"bg-white p-5 rounded-xl border border-slate-200 shadow-sm",children:[e.jsx("h3",{className:"text-xs font-bold text-slate-900 uppercase tracking-wider mb-2",children:"Important Downloads"}),e.jsxs("ul",{className:"text-xs space-y-2 text-blue-700",children:[e.jsx("li",{children:e.jsx("a",{href:"#",className:"hover:underline",children:"▸ Download Annexure A (PDF)"})}),e.jsx("li",{children:e.jsx("a",{href:"#",className:"hover:underline",children:"▸ Domicile Certificate Template"})}),e.jsx("li",{children:e.jsx("a",{href:"#",className:"hover:underline",children:"▸ Frequently Asked Questions"})})]})]})]})]}),e.jsxs("footer",{className:"bg-slate-900 text-slate-400 text-xs py-8 px-6 mt-12 border-t border-slate-800 text-center",children:[e.jsx("p",{children:"National Scholarship Application Portal • Demonstration Prototype for Hackathon Evaluation"}),e.jsx("p",{className:"text-[11px] text-slate-500 mt-1",children:"Designed to test visual adaptations, cognitive focus, reading simplification, and intelligent form autofill."})]})]})};Te.createRoot(document.getElementById("root")).render(e.jsx(Le.StrictMode,{children:e.jsx(Ve,{})}));
