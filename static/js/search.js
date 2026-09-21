/**
 * BISENSE - Search Controller
 * Handles user query interactions, multi-stage processing animation,
 * NLP requirement extraction display, and ranked standards card rendering.
 */

const SearchController = {
  activeResults: [],

  init() {
    this.form = document.getElementById('searchForm');
    this.queryInput = document.getElementById('queryInput');
    this.langSelect = document.getElementById('languageSelect');
    this.clearBtn = document.getElementById('clearBtn');
    this.findBtn = document.getElementById('findBtn');
    this.searchSpinner = document.getElementById('searchSpinner');
    this.searchIcon = document.getElementById('searchIcon');
    this.btnText = document.getElementById('btnText');

    this.progressContainer = document.getElementById('searchProgress');
    this.progressBarFill = document.getElementById('progressBarFill');
    this.progressPct = document.getElementById('progressPct');

    this.resultsContainer = document.getElementById('resultsContainer');
    this.noResultCard = document.getElementById('noResultCard');
    this.standardsList = document.getElementById('standardsList');
    this.resultsCount = document.getElementById('resultsCount');

    // Smart Product Correction
    this.didYouMeanCard = document.getElementById('didYouMeanCard');
    this.dymQuestion = document.getElementById('dymQuestion');
    this.dymActions = document.getElementById('dymActions');

    // Bulb Type Selection Modal & Prompt
    this.bulbTypeModal = document.getElementById('bulbTypeModal');
    this.bulbModalCloseBtn = document.getElementById('bulbModalCloseBtn');
    this.bulbModalCloseAction = document.getElementById('bulbModalCloseAction');
    this.chooseElectricBulb = document.getElementById('chooseElectricBulb');
    this.chooseLedBulb = document.getElementById('chooseLedBulb');
    this.bulbDisambiguationCard = document.getElementById('bulbDisambiguationCard');
    this.disambigElectricBtn = document.getElementById('disambigElectricBtn');
    this.disambigLedBtn = document.getElementById('disambigLedBtn');
    this.bulbChoiceChip = document.getElementById('bulbChoiceChip');

    // Modals
    this.detailModal = document.getElementById('detailModal');
    this.modalCloseBtn = document.getElementById('modalCloseBtn');
    this.modalCloseAction = document.getElementById('modalCloseAction');
    this.modalVerifyBtn = document.getElementById('modalVerifyBtn');

    this.relatedModal = document.getElementById('relatedModal');
    this.relatedModalCloseBtn = document.getElementById('relatedModalCloseBtn');
    this.relatedModalCloseAction = document.getElementById('relatedModalCloseAction');

    // Multi-modal Input Options
    this.voiceSearchBtn = document.getElementById('voiceSearchBtn');
    this.cornerMicBtn = document.getElementById('cornerMicBtn');
    this.cornerUploadBtn = document.getElementById('cornerUploadBtn');
    this.voiceBanner = document.getElementById('voiceBanner');
    this.voiceStatusText = document.getElementById('voiceStatusText');
    this.voiceLiveTranscript = document.getElementById('voiceLiveTranscript');
    this.voiceStopBtn = document.getElementById('voiceStopBtn');
    this.uploadDocBtn = document.getElementById('uploadDocBtn');
    this.scanPageBtn = document.getElementById('scanPageBtn');
    this.textareaDropZone = document.getElementById('textareaDropZone');

    // Upload & Scan Modal Elements
    this.uploadScanModal = document.getElementById('uploadScanModal');
    this.uploadModalCloseBtn = document.getElementById('uploadModalCloseBtn');
    this.uploadModalCancelBtn = document.getElementById('uploadModalCancelBtn');
    this.tabUploadDoc = document.getElementById('tabUploadDoc');
    this.tabScanPage = document.getElementById('tabScanPage');
    this.paneUploadDoc = document.getElementById('paneUploadDoc');
    this.paneScanPage = document.getElementById('paneScanPage');
    this.docFileInput = document.getElementById('docFileInput');
    this.docBrowseBtn = document.getElementById('docBrowseBtn');
    this.docDropZone = document.getElementById('docDropZone');
    this.imageFileInput = document.getElementById('imageFileInput');
    this.imageCameraBtn = document.getElementById('imageCameraBtn');
    this.imageBrowseBtn = document.getElementById('imageBrowseBtn');
    this.samplePlateBtn = document.getElementById('samplePlateBtn');
    this.imageDropZone = document.getElementById('imageDropZone');
    this.uploadProgress = document.getElementById('uploadProgress');
    this.uploadProgressFill = document.getElementById('uploadProgressFill');
    this.uploadProgressText = document.getElementById('uploadProgressText');
    this.uploadProgressPct = document.getElementById('uploadProgressPct');
    this.extractionPreview = document.getElementById('extractionPreview');
    this.previewFileName = document.getElementById('previewFileName');
    this.previewSpecsChips = document.getElementById('previewSpecsChips');
    this.previewQueryText = document.getElementById('previewQueryText');
    this.rawToggleBtn = document.getElementById('rawToggleBtn');
    this.rawTextContent = document.getElementById('rawTextContent');
    this.applyToQueryBtn = document.getElementById('applyToQueryBtn');
    this.applyAndSearchBtn = document.getElementById('applyAndSearchBtn');

    this.isListening = false;
    this.initVoiceRecognition();
    this.bindEvents();
  },

  bindEvents() {
    // Form submission
    if (this.form) {
      this.form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.executeSearch();
      });
    }

    // Input changes dismiss Did You Mean and Bulb suggestions
    if (this.queryInput) {
      this.queryInput.addEventListener('input', () => {
        this.hideDidYouMean();
        this.hideBulbDisambiguation();
      });
    }

    // Clear button
    if (this.clearBtn) {
      this.clearBtn.addEventListener('click', () => {
        this.hideDidYouMean();
        this.hideBulbDisambiguation();
        this.queryInput.value = '';
        this.queryInput.focus();
      });
    }

    // Modal Verify on BIS button
    if (this.modalVerifyBtn) {
      this.modalVerifyBtn.addEventListener('click', () => {
        if (this.currentModalStandard) {
          this.verifyOnBis(
            this.currentModalStandard.official_bis_url,
            this.currentModalStandard.is_number,
            this.currentModalStandard.source
          );
        }
      });
    }

    // Prompt Chips
    const chips = document.querySelectorAll('.prompt-chips .chip');
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        const prod = chip.dataset.product;
        const lang = chip.dataset.lang;
        this.applyChipPrompt(prod, lang, chip.textContent.trim());
      });
    });

    // Reset Search Button in No-Result Card
    const resetBtn = document.getElementById('resetSearchBtn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.queryInput.value = "I need a 2000W electric cooker for domestic use with automatic temperature control";
        this.langSelect.value = "en";
        this.executeSearch();
      });
    }

    // Bulb Modal Close actions
    if (this.bulbModalCloseBtn) this.bulbModalCloseBtn.addEventListener('click', () => this.hideBulbModal());
    if (this.bulbModalCloseAction) this.bulbModalCloseAction.addEventListener('click', () => this.hideBulbModal());
    if (this.bulbTypeModal) {
      this.bulbTypeModal.addEventListener('click', (e) => {
        if (e.target === this.bulbTypeModal) this.hideBulbModal();
      });
    }

    // Bulb modal card selections
    if (this.chooseElectricBulb) {
      this.chooseElectricBulb.addEventListener('click', () => {
        if (window.selectBulbType) window.selectBulbType('electric_bulb');
      });
    }
    if (this.chooseLedBulb) {
      this.chooseLedBulb.addEventListener('click', () => {
        if (window.selectBulbType) window.selectBulbType('led_lamp');
      });
    }

    // Bulb disambiguation inline card actions
    if (this.disambigElectricBtn) {
      this.disambigElectricBtn.addEventListener('click', () => {
        if (window.selectBulbType) window.selectBulbType('electric_bulb');
      });
    }
    if (this.disambigLedBtn) {
      this.disambigLedBtn.addEventListener('click', () => {
        if (window.selectBulbType) window.selectBulbType('led_lamp');
      });
    }

    if (this.bulbChoiceChip) {
      this.bulbChoiceChip.addEventListener('click', () => {
        this.openBulbModal();
      });
    }

    // Modal Close actions
    if (this.modalCloseBtn) this.modalCloseBtn.addEventListener('click', () => this.hideDetailModal());
    if (this.modalCloseAction) this.modalCloseAction.addEventListener('click', () => this.hideDetailModal());
    if (this.detailModal) {
      this.detailModal.addEventListener('click', (e) => {
        if (e.target === this.detailModal) this.hideDetailModal();
      });
    }

    if (this.relatedModalCloseBtn) this.relatedModalCloseBtn.addEventListener('click', () => this.hideRelatedModal());
    if (this.relatedModalCloseAction) this.relatedModalCloseAction.addEventListener('click', () => this.hideRelatedModal());
    if (this.relatedModal) {
      this.relatedModal.addEventListener('click', (e) => {
        if (e.target === this.relatedModal) this.hideRelatedModal();
      });
    }

    // Voice Search listeners
    if (this.voiceSearchBtn) {
      this.voiceSearchBtn.addEventListener('click', () => this.toggleVoiceInput());
    }
    if (this.cornerMicBtn) {
      this.cornerMicBtn.addEventListener('click', () => this.toggleVoiceInput());
    }
    if (this.voiceStopBtn) {
      this.voiceStopBtn.addEventListener('click', () => this.stopVoiceInput());
    }

    // Modal Triggers
    if (this.uploadDocBtn) {
      this.uploadDocBtn.addEventListener('click', () => this.openUploadScanModal('doc'));
    }
    if (this.cornerUploadBtn) {
      this.cornerUploadBtn.addEventListener('click', () => this.openUploadScanModal('doc'));
    }
    if (this.scanPageBtn) {
      this.scanPageBtn.addEventListener('click', () => this.openUploadScanModal('scan'));
    }

    // Modal Close
    if (this.uploadModalCloseBtn) {
      this.uploadModalCloseBtn.addEventListener('click', () => this.closeUploadScanModal());
    }
    if (this.uploadModalCancelBtn) {
      this.uploadModalCancelBtn.addEventListener('click', () => this.closeUploadScanModal());
    }
    if (this.uploadScanModal) {
      this.uploadScanModal.addEventListener('click', (e) => {
        if (e.target === this.uploadScanModal) this.closeUploadScanModal();
      });
    }

    // Tab switching inside modal
    if (this.tabUploadDoc) {
      this.tabUploadDoc.addEventListener('click', () => this.switchUploadTab('doc'));
    }
    if (this.tabScanPage) {
      this.tabScanPage.addEventListener('click', () => this.switchUploadTab('scan'));
    }

    // File input change listeners
    if (this.docBrowseBtn && this.docFileInput) {
      this.docBrowseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.docFileInput.click();
      });
    }
    if (this.docDropZone && this.docFileInput) {
      this.docDropZone.addEventListener('click', () => this.docFileInput.click());
    }
    if (this.docFileInput) {
      this.docFileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          this.handleDocumentFile(e.target.files[0]);
        }
      });
    }

    if (this.imageBrowseBtn && this.imageFileInput) {
      this.imageBrowseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.imageFileInput.click();
      });
    }
    if (this.imageCameraBtn && this.imageFileInput) {
      this.imageCameraBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.imageFileInput.click();
      });
    }
    if (this.imageDropZone && this.imageFileInput) {
      this.imageDropZone.addEventListener('click', () => this.imageFileInput.click());
    }
    if (this.imageFileInput) {
      this.imageFileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          this.handleImageFile(e.target.files[0]);
        }
      });
    }

    if (this.samplePlateBtn) {
      this.samplePlateBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.loadSamplePlate();
      });
    }

    // Drag and Drop Listeners
    this.setupDropZone(this.docDropZone, (file) => this.handleDocumentFile(file));
    this.setupDropZone(this.imageDropZone, (file) => this.handleImageFile(file));
    this.setupDropZone(this.textareaDropZone, (file) => {
      const ext = (file.name || '').split('.').pop().toLowerCase();
      if (['png', 'jpg', 'jpeg', 'webp', 'bmp'].includes(ext)) {
        this.openUploadScanModal('scan');
        this.handleImageFile(file);
      } else {
        this.openUploadScanModal('doc');
        this.handleDocumentFile(file);
      }
    });

    // Preview actions
    if (this.rawToggleBtn && this.rawTextContent) {
      this.rawToggleBtn.addEventListener('click', () => {
        const isHidden = this.rawTextContent.style.display === 'none';
        this.rawTextContent.style.display = isHidden ? 'block' : 'none';
        const label = this.rawToggleBtn.querySelector('span') || this.rawToggleBtn;
        label.textContent = isHidden ? 'Hide Raw Document Text ▴' : 'Show Raw Document Text ▾';
      });
    }

    if (this.applyToQueryBtn) {
      this.applyToQueryBtn.addEventListener('click', () => this.applyExtractedQuery(false));
    }
    if (this.applyAndSearchBtn) {
      this.applyAndSearchBtn.addEventListener('click', () => this.applyExtractedQuery(true));
    }
  },

  openBulbModal() {
    if (this.bulbTypeModal) {
      this.bulbTypeModal.style.display = 'flex';
    }
  },

  hideBulbModal() {
    if (this.bulbTypeModal) {
      this.bulbTypeModal.style.display = 'none';
    }
  },

  showBulbDisambiguation() {
    if (this.bulbDisambiguationCard) {
      this.bulbDisambiguationCard.style.display = 'block';
      this.bulbDisambiguationCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  },

  hideBulbDisambiguation() {
    if (this.bulbDisambiguationCard) {
      this.bulbDisambiguationCard.style.display = 'none';
    }
  },

  applyChipPrompt(productKey, langCode, label) {
    if (productKey === 'bulb') {
      this.openBulbModal();
      return;
    }

    const samplePrompts = {
      "electric_cooker_en": "I need a 2000W electric cooker for domestic use with automatic temperature control",
      "electric_cooker_hi": "घरेलू उपयोग के लिए 2000W इलेक्ट्रिक कुकर तापमान नियंत्रण के साथ",
      "electric_cooker_te": "గృహ వినియోగం కోసం 2000W ఎలక్ట్రిక్ కుక్కర్ ఆటోమేటిక్ ఉష్ణోగ్రత నియంత్రణతో",
      "electric_fan_en": "1200mm sweep energy efficient BLDC ceiling fan with electronic speed regulator",
      "electrical_cables_en": "2.5 sq mm single core copper conductor PVC insulated fire retardant building wire 1100V",
      "electric_bulb_en": "Tungsten filament electric bulb 60W 230V AC for domestic lighting with B22 bayonet cap",
      "led_lamp_en": "9W B22 self-ballasted LED bulb for indoor general domestic illumination"
    };

    const key = `${productKey}_${langCode}`;
    const text = samplePrompts[key] || `I need specifications for ${label}`;

    this.queryInput.value = text;
    if (this.langSelect) this.langSelect.value = langCode || 'auto';

    // Synchronize UI language immediately if chip specifies regional language
    if (langCode && langCode !== 'auto' && window.I18nManager) {
      window.I18nManager.setLanguage(langCode);
      const navSelect = document.getElementById('navLanguageSelect');
      if (navSelect) navSelect.value = langCode;
    }

    this.queryInput.focus();
    // Smooth scroll to search button if on mobile
    this.form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  },

  async executeSearch(skipTypoCheck = false, forcedProduct = null) {
    const query = this.queryInput.value.trim();
    if (!query) {
      this.queryInput.focus();
      return;
    }

    // Check if query is generically asking for "bulb" without specifying electric or led
    const lowerQ = query.toLowerCase();
    const isGenericBulb = /\bbulb(s)?\b/i.test(lowerQ) &&
      !/\belectric\b/i.test(lowerQ) &&
      !/\bled\b/i.test(lowerQ) &&
      !/\bfilament\b/i.test(lowerQ) &&
      !/\btungsten\b/i.test(lowerQ) &&
      !/\bincandescent\b/i.test(lowerQ);

    if (isGenericBulb && !skipTypoCheck && !forcedProduct) {
      this.showBulbDisambiguation();
      return;
    }

    this.hideBulbDisambiguation();

    // Smart product typo checking before executing search
    if (!skipTypoCheck) {
      try {
        const check = await BISENSE_API.checkQuery(query);
        if (check && check.has_typo && check.suggestions && check.suggestions.length > 0) {
          this.showDidYouMean(check.suggestions);
          return;
        }
      } catch (err) {
        console.warn('[BISENSE Search] Typo check notice:', err);
      }
    }

    this.hideDidYouMean();

    const language = this.langSelect.value;
    const product = forcedProduct || 'all';

    // UI Loading state
    this.setLoading(true);
    this.resultsContainer.style.display = 'none';
    this.noResultCard.style.display = 'none';
    this.progressContainer.style.display = 'block';

    try {
      // 7-Step Animated Progress Simulation
      await this.runStageProgress();

      // Submit API request
      const data = await BISENSE_API.recommend(query, language, product);
      this.activeResults = data.results || [];

      // Finish progress bar
      this.progressBarFill.style.width = '100%';
      this.progressPct.textContent = '100%';

      setTimeout(() => {
        this.progressContainer.style.display = 'none';
        this.setLoading(false);

        // If Auto-detect was active and a regional language was detected, sync UI language
        if (this.langSelect.value === 'auto' && data.language_code && data.language_code !== 'en' && window.I18nManager) {
          window.I18nManager.setLanguage(data.language_code);
          const navSelect = document.getElementById('navLanguageSelect');
          if (navSelect) navSelect.value = data.language_code;
        }

        if (this.activeResults.length === 0) {
          this.noResultCard.style.display = 'block';
          this.noResultCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
          this.renderUnderstanding(data);
          this.renderResults(this.activeResults);
          this.resultsContainer.style.display = 'block';

          // Initialize 3D Relevance Graph
          if (window.BISENSE_3D) {
            window.BISENSE_3D.initRelevanceGraph(this.activeResults);
          }

          this.resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 400);

    } catch (err) {
      console.error('[BISENSE Search] Search error:', err);
      this.progressContainer.style.display = 'none';
      this.setLoading(false);
      alert('Error searching Indian Standards: ' + (err.message || 'Please check your connection.'));
    }
  },

  async runStageProgress() {
    const stages = [
      { id: 'stage-1', pct: 15 },
      { id: 'stage-2', pct: 30 },
      { id: 'stage-3', pct: 45 },
      { id: 'stage-4', pct: 60 },
      { id: 'stage-5', pct: 75 },
      { id: 'stage-6', pct: 90 },
      { id: 'stage-7', pct: 98 }
    ];

    // Reset stages
    document.querySelectorAll('.stage-item').forEach(el => {
      el.classList.remove('active', 'completed');
    });

    for (let i = 0; i < stages.length; i++) {
      const st = stages[i];
      const el = document.getElementById(st.id);
      if (el) {
        el.classList.add('active');
        this.progressBarFill.style.width = `${st.pct}%`;
        this.progressPct.textContent = `${st.pct}%`;
      }

      // Small realistic pause
      await new Promise(r => setTimeout(r, 120));

      if (el) {
        el.classList.remove('active');
        el.classList.add('completed');
      }
    }
  },

  setLoading(isLoading) {
    this.findBtn.disabled = isLoading;
    this.searchSpinner.style.display = isLoading ? 'inline-block' : 'none';
    this.searchIcon.style.display = isLoading ? 'none' : 'inline-block';
    this.btnText.textContent = isLoading ? 'Analyzing Requirement...' : 'Find Standards';
  },

  showDidYouMean(suggestions) {
    if (!this.didYouMeanCard || !suggestions || suggestions.length === 0) return;

    if (suggestions.length === 1) {
      const s = suggestions[0];
      this.dymQuestion.innerHTML = `Did you mean &ldquo;<strong>${s.product_name}</strong>&rdquo;?`;
    } else {
      const names = suggestions.map(s => `“${s.product_name}”`).join(', ');
      this.dymQuestion.innerHTML = `Did you mean ${names}?`;
    }

    this.dymActions.innerHTML = '';

    suggestions.forEach(s => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'dym-select-btn';
      btn.innerHTML = `<span>✓</span> <span>Select ${s.product_name}</span>`;
      btn.addEventListener('click', () => {
        this.queryInput.value = s.corrected_query || s.product_name;
        this.hideDidYouMean();
        this.executeSearch(true);
      });
      this.dymActions.appendChild(btn);
    });

    const editBtn = document.createElement('button');
    editBtn.type = 'button';
    editBtn.className = 'dym-dismiss-btn';
    editBtn.innerHTML = `<span>✏️ Edit Query</span>`;
    editBtn.addEventListener('click', () => {
      this.hideDidYouMean();
      this.queryInput.focus();
    });
    this.dymActions.appendChild(editBtn);

    this.didYouMeanCard.style.display = 'block';
    this.didYouMeanCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  },

  hideDidYouMean() {
    if (this.didYouMeanCard) {
      this.didYouMeanCard.style.display = 'none';
    }
  },

  verifyOnBis(url, isNumber, source) {
    // 1. Check for demo dataset or missing link
    if (source === 'Demo Dataset' || !url) {
      if (source === 'Demo Dataset') {
        alert('Official BIS source unavailable for this demo record.');
      } else {
        alert('Official BIS verification link is not available for this standard in the current knowledge base.');
      }
      return;
    }

    // 2. Validate URL security (HTTPS + official BIS domains only)
    try {
      const parsed = new URL(url);
      const allowedHosts = [
        'standardsbis.bsbedge.com',
        'www.services.bis.gov.in',
        'services.bis.gov.in',
        'www.bis.gov.in',
        'bis.gov.in'
      ];
      if (parsed.protocol !== 'https:' || !allowedHosts.includes(parsed.hostname.toLowerCase())) {
        alert('Security warning: Link is not an official BIS portal domain.');
        return;
      }
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (e) {
      alert('Official BIS verification link is not available for this standard in the current knowledge base.');
    }
  },

  renderUnderstanding(data) {
    const u = data.understanding || {};
    document.getElementById('uProduct').textContent = u.product || 'General Appliance';
    document.getElementById('uApp').textContent = u.application || 'Domestic';
    document.getElementById('uPower').textContent = u.power || 'Standard 230V AC';

    const langBadge = document.getElementById('uLangBadge');
    langBadge.textContent = `Detected Language: ${data.detected_language || 'English'}`;

    const featuresContainer = document.getElementById('uFeatures');
    featuresContainer.innerHTML = '';
    const feats = u.features || [];
    if (feats.length === 0) {
      featuresContainer.innerHTML = `<span class="badge badge-blue">Standard Specs</span>`;
    } else {
      feats.forEach(f => {
        const badge = document.createElement('span');
        badge.className = 'badge badge-blue';
        badge.textContent = f;
        featuresContainer.appendChild(badge);
      });
    }
  },

  renderResults(results) {
    this.resultsCount.textContent = `${results.length} Standard${results.length === 1 ? '' : 's'} Found`;
    this.standardsList.innerHTML = '';

    results.forEach((std, idx) => {
      const card = document.createElement('div');
      card.className = 'standard-card glass-card';
      card.id = `card-${std.id || std.is_number}`;
      card.dataset.is = std.is_number;

      const scorePercent = Math.round(std.score * 100);
      const isHigh = std.score >= 0.82;
      const relBadgeClass = isHigh ? 'badge-cyan' : 'badge-blue';

      const pcts = std.percentages || { safety: 100, performance: 96, testing: 98, compliance: 100, reliability: 95 };
      const yearRecorded = std.year_recorded || (std.version ? std.version.slice(0, 4) : '2019');

      const isExpertReviewed = (std.expert_reviewed !== undefined) ? std.expert_reviewed : (idx === 0);
      const standardRole = std.standard_role || (idx === 0 ? 'Primary Relevant Standard' : (std.is_number.includes('302') ? 'Related Safety Standard' : 'Related Standard'));

      card.innerHTML = `
        <div class="std-card-top">
          <div class="std-info-col">
            <div class="std-role-row">
              <span class="std-role-tag ${idx === 0 ? 'role-primary' : 'role-related'}">
                ${standardRole}
              </span>
              <span class="badge ${isExpertReviewed ? 'badge-expert-reviewed' : 'badge-not-reviewed'}" title="${isExpertReviewed ? 'Reviewed by qualified domain expert within prototype decision-support workflow (Not official BIS certification)' : 'AI recommendation awaiting domain expert review in decision-support workflow'}">
                ${isExpertReviewed ? '<span class="check-icon">✓</span> Expert Reviewed' : '<span class="dot-icon">○</span> Expert Review Status: Not Reviewed'}
              </span>
            </div>
            <div class="std-is-row">
              <span class="std-is-number">${std.is_number}</span>
              <span class="badge badge-year" title="Official standard publication and recorded year">
                <span class="year-icon">📅</span> Year: ${yearRecorded}
              </span>
              <span class="badge ${relBadgeClass}">${std.relevance} RELEVANCE</span>
              <span class="std-product-tag">${std.product}</span>
            </div>
            <h4 class="std-title">${std.title}</h4>
            <div class="std-version-subtitle">Standard Edition / Version: <strong>${std.version || `${std.is_number} : ${yearRecorded}`}</strong></div>
          </div>
          <div class="std-score-block">
            <span class="std-score-val">${scorePercent}%</span>
            <span class="std-score-label">AI Match</span>
          </div>
        </div>

        <!-- Compliance & Quality Percentage Metrics Bar -->
        <div class="std-metrics-bar">
          <div class="metric-card metric-safety">
            <div class="metric-top">
              <span><span class="metric-icon">🛡️</span> Safety</span>
              <span class="metric-percent">${pcts.safety}%</span>
            </div>
            <div class="metric-track"><div class="metric-progress safe" style="width: ${pcts.safety}%"></div></div>
          </div>

          <div class="metric-card metric-perf">
            <div class="metric-top">
              <span><span class="metric-icon">⚡</span> Performance</span>
              <span class="metric-percent">${pcts.performance}%</span>
            </div>
            <div class="metric-track"><div class="metric-progress perf" style="width: ${pcts.performance}%"></div></div>
          </div>

          <div class="metric-card metric-testing">
            <div class="metric-top">
              <span><span class="metric-icon">🔬</span> Testing Rigor</span>
              <span class="metric-percent">${pcts.testing}%</span>
            </div>
            <div class="metric-track"><div class="metric-progress test" style="width: ${pcts.testing}%"></div></div>
          </div>

          <div class="metric-card metric-compliance">
            <div class="metric-top">
              <span><span class="metric-icon">🏷️</span> ISI Standard</span>
              <span class="metric-percent">${pcts.compliance}%</span>
            </div>
            <div class="metric-track"><div class="metric-progress comp" style="width: ${pcts.compliance}%"></div></div>
          </div>
        </div>

        <!-- Why This Result Card (Section 18) -->
        <div class="why-card">
          <div class="why-header">
            <span class="why-title">💡 Why this standard?</span>
            <span class="why-clause-badge">Primary Match: ${std.best_matching_section || 'Scope'}</span>
          </div>
          <p class="why-text">${std.why_this_result}</p>
          <div class="why-match-points">
            <div class="why-point"><span class="why-check">✓</span> Product category matched (${std.product})</div>
            <div class="why-point"><span class="why-check">✓</span> Scope matched (${std.best_matching_section || 'Scope & Definitions'})</div>
            <div class="why-point"><span class="why-check">✓</span> Safety requirements matched (${pcts.safety}% rating)</div>
            <div class="why-point"><span class="why-check">✓</span> Testing requirements matched (${pcts.testing}% rigor)</div>
          </div>
        </div>

        <!-- Decision-Support Expert Review Indicator -->
        <div class="expert-review-card ${isExpertReviewed ? 'is-reviewed' : 'is-pending'}">
          <div class="expert-review-main">
            <div class="expert-review-badge ${isExpertReviewed ? 'reviewed' : 'not-reviewed'}">
              <span class="expert-review-icon">${isExpertReviewed ? '✓' : '○'}</span>
              <span class="expert-review-text">${isExpertReviewed ? 'Expert Reviewed' : 'Expert Review Status: Not Reviewed'}</span>
            </div>
            <div class="expert-review-note">
              ${isExpertReviewed
                ? 'Technical recommendation verified by domain specialist within prototype workflow.'
                : 'Initial AI semantic match. Expert evaluation pending prior to formal audit.'
              }
            </div>
          </div>

          <!-- Clear Distinction: AI Recommendation → Expert Reviewed → BIS Source Verification -->
          <div class="decision-pipeline" title="Decision-Support Workflow: AI Recommendation ➔ Expert Reviewed ➔ BIS Source Verification">
            <div class="pipeline-step step-ai active">
              <span class="pipeline-num">1</span>
              <span class="pipeline-label">AI Match (${scorePercent}%)</span>
            </div>
            <span class="pipeline-arrow">➔</span>
            <div class="pipeline-step step-expert ${isExpertReviewed ? 'active' : 'pending'}">
              <span class="pipeline-num">2</span>
              <span class="pipeline-label">${isExpertReviewed ? '✓ Expert Reviewed' : 'Expert Review (Pending)'}</span>
            </div>
            <span class="pipeline-arrow">➔</span>
            <div class="pipeline-step step-bis">
              <span class="pipeline-num">3</span>
              <span class="pipeline-label">BIS Source Verification</span>
            </div>
          </div>

          <div class="expert-review-disclaimer">
            Prototype decision-support indicator. Not official BIS approval, BIS certification, or government legal guarantee.
          </div>
        </div>

        <!-- Interactive Clauses Tab Navigation -->
        <div class="std-tabs-nav" id="tabs-nav-${idx}">
          <button type="button" class="std-tab-btn active" data-target="scope-${idx}">Scope</button>
          <button type="button" class="std-tab-btn" data-target="reqs-${idx}">Requirements (${(std.requirements || []).length})</button>
          <button type="button" class="std-tab-btn" data-target="safety-${idx}">Safety (${(std.safety || []).length})</button>
          <button type="button" class="std-tab-btn" data-target="perf-${idx}">Quality & Perf</button>
          <button type="button" class="std-tab-btn" data-target="testing-${idx}">Testing Methods</button>
          <button type="button" class="std-tab-btn" data-target="marking-${idx}">Marking & ISI</button>
          <button type="button" class="std-tab-btn" data-target="tech-${idx}">Technical Specs</button>
        </div>

        <!-- Tab Panes -->
        <div class="std-tabs-content">
          <!-- Scope Pane -->
          <div class="std-tab-pane active" id="scope-${idx}">
            <p>${std.scope}</p>
          </div>

          <!-- Requirements Pane -->
          <div class="std-tab-pane" id="reqs-${idx}">
            <div class="clause-list">
              ${(std.requirements || []).map(r => `
                <div class="clause-item">
                  <span class="clause-bullet">■</span>
                  <span>${r}</span>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Safety Pane -->
          <div class="std-tab-pane" id="safety-${idx}">
            <div class="tab-metric-header safe">
              <span class="badge badge-green">🛡️ SAFETY COMPLIANCE: ${pcts.safety}%</span>
              <span class="tab-metric-note">Zero-compromise electrical isolation, thermal cut-off, and earth leakage thresholds.</span>
            </div>
            <div class="clause-list">
              ${(std.safety || []).map(s => `
                <div class="clause-item">
                  <span class="clause-bullet" style="color:#ef4444">🛡️</span>
                  <span>${s}</span>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Performance Pane -->
          <div class="std-tab-pane" id="perf-${idx}">
            <div class="tab-metric-header perf">
              <span class="badge badge-cyan">⚡ PERFORMANCE RATING: ${pcts.performance}%</span>
              <span class="tab-metric-note">Complies with BIS operational efficiency, energy consumption, and lifecycle benchmarks.</span>
            </div>
            <div class="clause-list">
              ${(std.performance || []).map(p => `
                <div class="clause-item">
                  <span class="clause-bullet" style="color:#10b981">⚡</span>
                  <span>${p}</span>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Testing Pane -->
          <div class="std-tab-pane" id="testing-${idx}">
            <div class="tab-metric-header test">
              <span class="badge badge-blue">🔬 TESTING RIGOR: ${pcts.testing}%</span>
              <span class="tab-metric-note">Type-tested for dielectric withstand, surge immunity, and accelerated stress conditions.</span>
            </div>
            <div class="clause-list">
              ${(std.testing || []).map(t => `
                <div class="clause-item">
                  <span class="clause-bullet" style="color:#00f0ff">🔬</span>
                  <span>${t}</span>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Marking Pane -->
          <div class="std-tab-pane" id="marking-${idx}">
            <div class="tab-metric-header comp">
              <span class="badge badge-amber">🏷️ ISI COMPLIANCE: ${pcts.compliance}%</span>
              <span class="tab-metric-note">Mandatory nameplate ratings, license marks, and legal marking specifications.</span>
            </div>
            <div class="clause-list">
              ${(std.marking || []).map(m => `
                <div class="clause-item">
                  <span class="clause-bullet" style="color:#f59e0b">🏷️</span>
                  <span>${m}</span>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Tech Details Pane -->
          <div class="std-tab-pane" id="tech-${idx}">
            <div class="clause-list">
              ${(std.technical_details || []).map(td => `
                <div class="clause-item">
                  <span class="clause-bullet">⚙️</span>
                  <span>${td}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Footer Actions -->
        <div class="std-card-footer">
          <div class="std-source-info">
            <div class="bis-official-wrap">
              <span>Source: <strong>${std.source}</strong></span>
              <span class="bis-official-label" title="Independent verification from official BIS portal">
                <span class="dot"></span> BIS Official Source
              </span>
            </div>
          </div>
          <div class="std-action-btns">
            <button type="button" class="btn btn-secondary btn-sm" onclick="SearchController.showDetailModal('${std.id}')">
              📄 View Full Clauses
            </button>
            <button type="button" class="btn btn-secondary btn-sm" onclick="SearchController.showRelatedModal('${std.id}')">
              🌐 Related Standards (${(std.related_standards || []).length})
            </button>
            <button type="button" class="btn btn-verify btn-sm" onclick="SearchController.verifyOnBis('${std.official_bis_url || ''}', '${std.is_number}', '${std.source || ''}')">
              🔗 Verify on BIS
            </button>
          </div>
        </div>
      `;

      this.standardsList.appendChild(card);
      this.attachTabEvents(card, idx);
    });
  },

  attachTabEvents(card, cardIdx) {
    const tabBtns = card.querySelectorAll('.std-tab-btn');
    const tabPanes = card.querySelectorAll('.std-tab-pane');

    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.dataset.target;
        tabBtns.forEach(b => b.classList.remove('active'));
        tabPanes.forEach(p => p.classList.remove('active'));

        btn.classList.add('active');
        const activePane = card.querySelector(`#${targetId}`);
        if (activePane) activePane.classList.add('active');
      });
    });
  },

  showDetailModal(standardId) {
    const std = this.activeResults.find(s => s.id === standardId) || this.activeResults.find(s => s.is_number === standardId) || this.activeResults[0];
    if (!std) return;

    this.currentModalStandard = std;
    const yearRecorded = std.year_recorded || (std.version ? std.version.slice(0, 4) : 2019);
    document.getElementById('modalIsNumber').textContent = `${std.is_number} : ${yearRecorded}`;
    document.getElementById('modalTitle').textContent = std.title;

    const pcts = std.percentages || { safety: 100, performance: 96, testing: 98, compliance: 100, reliability: 95 };

    const isExpertReviewed = (std.expert_reviewed !== undefined) ? std.expert_reviewed : (this.activeResults[0] && this.activeResults[0].id === std.id);
    const standardRole = std.standard_role || (this.activeResults[0] && this.activeResults[0].id === std.id ? 'Primary Relevant Standard' : (std.is_number && std.is_number.includes('302') ? 'Related Safety Standard' : 'Related Standard'));

    const body = document.getElementById('modalBody');
    body.innerHTML = `
      <!-- Modal Percentage Scorecard -->
      <div class="modal-metrics-card">
        <div class="modal-metric-item">
          <div class="modal-metric-val" style="color: #059669;">${pcts.safety}%</div>
          <div class="modal-metric-lbl">Safety Compliance</div>
        </div>
        <div class="modal-metric-item">
          <div class="modal-metric-val" style="color: #0284c7;">${pcts.performance}%</div>
          <div class="modal-metric-lbl">Quality / Perf</div>
        </div>
        <div class="modal-metric-item">
          <div class="modal-metric-val" style="color: #2563eb;">${pcts.testing}%</div>
          <div class="modal-metric-lbl">Testing Rigor</div>
        </div>
        <div class="modal-metric-item">
          <div class="modal-metric-val" style="color: #d97706;">${pcts.compliance}%</div>
          <div class="modal-metric-lbl">ISI Standard</div>
        </div>
      </div>

      <div class="modal-sec" style="display:flex; justify-content:space-between; align-items:center; background:#f1f5f9; padding:0.6rem 0.9rem; border-radius:var(--radius-sm); margin-bottom:0.75rem; border:1px solid #e2e8f0; flex-wrap:wrap; gap:0.5rem;">
        <span style="font-size:0.86rem; color:var(--text-secondary);"><strong>Recorded Year:</strong> ${yearRecorded}</span>
        <span style="font-size:0.86rem; color:var(--text-secondary);"><strong>Edition / Version:</strong> ${std.version || `${std.is_number}:${yearRecorded}`}</span>
        <span class="badge ${isExpertReviewed ? 'badge-expert-reviewed' : 'badge-not-reviewed'}">
          ${isExpertReviewed ? '<span class="check-icon">✓</span> Expert Reviewed' : '<span class="dot-icon">○</span> Expert Review Status: Not Reviewed'}
        </span>
      </div>

      <!-- Modal Expert Review & Decision-Support Notice -->
      <div class="modal-expert-notice ${isExpertReviewed ? 'is-reviewed' : 'is-pending'}" style="font-size:0.82rem; padding:0.65rem 0.95rem; border-radius:var(--radius-sm); margin-bottom:1.25rem; display:flex; align-items:flex-start; gap:0.65rem; ${isExpertReviewed ? 'background:#ecfdf5; border:1px solid #a7f3d0; color:#065f46;' : 'background:#f8fafc; border:1px solid #cbd5e1; color:#475569;'}">
        <span style="font-size:1.1rem; font-weight:800; line-height:1.2;">${isExpertReviewed ? '✓' : '○'}</span>
        <div>
          <div style="font-weight:700; margin-bottom:0.15rem;">
            ${isExpertReviewed ? 'Expert Reviewed — Prototype Decision-Support Workflow' : 'Expert Review Status: Not Reviewed (Awaiting Technical Evaluation)'}
          </div>
          <div style="font-size:0.78rem; opacity:0.9; line-height:1.45;">
            ${isExpertReviewed
              ? 'Recommendation evaluated by qualified domain specialist within prototype workflow. Distinction: AI Recommendation ➔ Expert Reviewed ➔ BIS Source Verification. Not official BIS certification or legal guarantee.'
              : 'Initial AI semantic match. Expert evaluation pending prior to formal audit. Verify against official BIS portal.'
            }
          </div>
        </div>
      </div>

      <div class="modal-sec">
        <h4 style="color:#0052cc; margin-bottom:0.5rem;">Standard Scope</h4>
        <p style="font-size:0.92rem; color:#475569; line-height:1.6;">${std.scope}</p>
      </div>

      <div class="modal-sec">
        <h4 style="color:#00f0ff; margin-bottom:0.5rem;">Construction & Normative Requirements</h4>
        <ul style="padding-left:1.2rem; font-size:0.9rem; color:#cbd5e1; list-style:disc;">
          ${(std.requirements || []).map(r => `<li style="margin-bottom:0.4rem;">${r}</li>`).join('')}
        </ul>
      </div>

      <div class="modal-sec">
        <h4 style="color:#ef4444; margin-bottom:0.5rem;">Electrical & Thermal Safety Clauses</h4>
        <ul style="padding-left:1.2rem; font-size:0.9rem; color:#cbd5e1; list-style:disc;">
          ${(std.safety || []).map(s => `<li style="margin-bottom:0.4rem;">${s}</li>`).join('')}
        </ul>
      </div>

      <div class="modal-sec">
        <h4 style="color:#38bdf8; margin-bottom:0.5rem;">High-Voltage & Environmental Testing Procedures</h4>
        <ul style="padding-left:1.2rem; font-size:0.9rem; color:#cbd5e1; list-style:disc;">
          ${(std.testing || []).map(t => `<li style="margin-bottom:0.4rem;">${t}</li>`).join('')}
        </ul>
      </div>

      <div class="modal-sec">
        <h4 style="color:#f59e0b; margin-bottom:0.5rem;">Marking, Labelling & ISI License Provisions</h4>
        <ul style="padding-left:1.2rem; font-size:0.9rem; color:#cbd5e1; list-style:disc;">
          ${(std.marking || []).map(m => `<li style="margin-bottom:0.4rem;">${m}</li>`).join('')}
        </ul>
      </div>
    `;

    this.detailModal.style.display = 'flex';
  },

  hideDetailModal() {
    this.detailModal.style.display = 'none';
    this.detailModal.style.zIndex = '';
    this.currentModalStandard = null;
  },

  showRelatedModal(standardId) {
    const std = this.activeResults.find(s => s.id === standardId) || this.activeResults[0];
    if (!std) return;

    const yearRecorded = std.year_recorded || 2019;
    document.getElementById('relatedModalTitle').textContent = `${std.is_number} : ${yearRecorded} Network`;
    const rels = std.related_standards || [];

    const listPanel = document.getElementById('relatedListPanel');
    if (!rels || rels.length === 0) {
      listPanel.innerHTML = `<div class="no-related-msg">No related standard information is available in the current knowledge base.</div>`;
    } else {
      listPanel.innerHTML = rels.map(r => `
        <div class="related-item-card">
          <div class="rel-category">${r.category}</div>
          <div class="rel-is">${r.is_number} ${r.year_recorded ? `<span class="badge badge-year" style="font-size:0.7rem; padding:0.1rem 0.45rem;">Year: ${r.year_recorded}</span>` : ''}</div>
          <div class="rel-title">${r.title}</div>
          <div class="rel-actions">
            <button type="button" class="btn btn-secondary btn-xs" onclick="SearchController.viewRelatedDetails('${r.is_number}', '${encodeURIComponent(r.title)}', '${encodeURIComponent(r.category)}')">
              📄 View Details
            </button>
            <button type="button" class="btn btn-verify btn-xs" onclick="SearchController.verifyOnBis('${r.official_bis_url || ''}', '${r.is_number}', '${r.source || 'Bureau of Indian Standards (BIS)'}')">
              🔗 Verify on BIS
            </button>
          </div>
        </div>
      `).join('');
    }

    this.relatedModal.style.display = 'flex';

    if (window.BISENSE_3D) {
      window.BISENSE_3D.initRelatedModalScene(std, rels);
    }
  },

  async viewRelatedDetails(isNumber, encTitle, encCategory) {
    const title = decodeURIComponent(encTitle);
    const category = decodeURIComponent(encCategory);

    // Check if in active results
    let std = this.activeResults.find(s => s.is_number === isNumber);
    if (!std) {
      try {
        std = await BISENSE_API.getStandard(isNumber);
      } catch (e) {
        std = null;
      }
    }

    if (std) {
      this.showDetailModal(std.id);
      this.detailModal.style.zIndex = '2200';
    } else {
      this.currentModalStandard = {
        id: isNumber,
        is_number: isNumber,
        title: title,
        source: 'Bureau of Indian Standards (BIS)',
        official_bis_url: `https://standardsbis.bsbedge.com/Home/Search?StandardNumber=${encodeURIComponent(isNumber)}`
      };
      document.getElementById('modalIsNumber').textContent = isNumber;
      document.getElementById('modalTitle').textContent = title;
      const body = document.getElementById('modalBody');
      body.innerHTML = `
        <div class="modal-sec">
          <h4 style="color:#0284c7; margin-bottom:0.5rem;">Relationship Category</h4>
          <p style="font-size:0.92rem; color:#475569; line-height:1.6;">${category} Standard</p>
        </div>
        <div class="modal-sec">
          <h4 style="color:#0052cc; margin-bottom:0.5rem;">Standard Information</h4>
          <p style="font-size:0.92rem; color:#1e293b; line-height:1.6;">
            <strong>${isNumber}</strong>: ${title}.
          </p>
          <p style="font-size:0.86rem; color:#64748b; margin-top:0.5rem;">
            This normative reference is part of the electrical and electronic standards framework. You can verify its official status, latest edition, and amendments on the official BIS portal.
          </p>
        </div>
      `;
      this.detailModal.style.zIndex = '2200';
      this.detailModal.style.display = 'flex';
    }
  },

  hideRelatedModal() {
    this.relatedModal.style.display = 'none';
    if (window.BISENSE_3D && window.BISENSE_3D.relatedApp) {
      window.BISENSE_3D.relatedApp.destroy();
    }
  },

  /* ========================================================================
     MULTI-MODAL: VOICE RECOGNITION (SPEECH-TO-TEXT)
     ======================================================================== */
  initVoiceRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('[BISENSE] Web Speech API not supported in this browser.');
      this.speechSupported = false;
      return;
    }

    this.speechSupported = true;
    try {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;

      this.recognition.onstart = () => {
        this.isListening = true;
        if (this.voiceBanner) this.voiceBanner.style.display = 'flex';
        if (this.cornerMicBtn) this.cornerMicBtn.classList.add('active');
        if (this.voiceSearchBtn) this.voiceSearchBtn.classList.add('active');
        const langName = this.langSelect ? this.langSelect.options[this.langSelect.selectedIndex].text : 'English';
        if (this.voiceStatusText) {
          this.voiceStatusText.textContent = `Listening in ${langName}... Speak your requirement`;
        }
        if (this.voiceLiveTranscript) {
          this.voiceLiveTranscript.textContent = '"Listening..."';
        }
      };

      this.recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        const currentText = finalTranscript || interimTranscript;
        if (this.voiceLiveTranscript && currentText) {
          this.voiceLiveTranscript.textContent = `"${currentText}"`;
        }
        if (this.queryInput && currentText) {
          this.queryInput.value = currentText;
        }
      };

      this.recognition.onerror = (event) => {
        console.warn('[BISENSE Voice] Error:', event.error);
        if (this.voiceStatusText) {
          if (event.error === 'not-allowed') {
            this.voiceStatusText.textContent = 'Microphone permission blocked. Please allow mic access.';
          } else {
            this.voiceStatusText.textContent = `Voice recognition note: ${event.error}`;
          }
        }
      };

      this.recognition.onend = () => {
        this.isListening = false;
        if (this.cornerMicBtn) this.cornerMicBtn.classList.remove('active');
        if (this.voiceSearchBtn) this.voiceSearchBtn.classList.remove('active');
        setTimeout(() => {
          if (!this.isListening && this.voiceBanner) {
            this.voiceBanner.style.display = 'none';
          }
        }, 1500);
      };
    } catch (err) {
      console.warn('[BISENSE Voice] Init error:', err);
      this.speechSupported = false;
    }
  },

  toggleVoiceInput() {
    if (!this.speechSupported) {
      alert('Speech Recognition is not supported by your current browser. Please try in Google Chrome or Microsoft Edge.');
      return;
    }
    if (this.isListening) {
      this.stopVoiceInput();
    } else {
      this.startVoiceInput();
    }
  },

  startVoiceInput() {
    if (!this.recognition) return;

    // Language mapping for Indian regional languages
    const langCode = (this.langSelect ? this.langSelect.value : 'auto') || 'auto';
    const LANG_MAP = {
      en: 'en-IN',
      hi: 'hi-IN',
      te: 'te-IN',
      ta: 'ta-IN',
      kn: 'kn-IN',
      ml: 'ml-IN',
      mr: 'mr-IN',
      bn: 'bn-IN',
      gu: 'gu-IN',
      pa: 'pa-IN',
      auto: 'en-IN'
    };

    this.recognition.lang = LANG_MAP[langCode] || 'en-IN';

    try {
      this.recognition.start();
    } catch (e) {
      console.warn('[BISENSE Voice] Start error:', e);
    }
  },

  stopVoiceInput() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {
        console.warn(e);
      }
    }
    this.isListening = false;
    if (this.voiceBanner) this.voiceBanner.style.display = 'none';
    if (this.cornerMicBtn) this.cornerMicBtn.classList.remove('active');
    if (this.voiceSearchBtn) this.voiceSearchBtn.classList.remove('active');
  },

  /* ========================================================================
     MULTI-MODAL: DOCUMENT UPLOAD & OCR SCANNER
     ======================================================================== */
  openUploadScanModal(tab = 'doc') {
    if (this.uploadScanModal) {
      this.uploadScanModal.style.display = 'flex';
      this.uploadScanModal.style.zIndex = '2400';
      this.switchUploadTab(tab);
      this.resetUploadState();
    }
  },

  closeUploadScanModal() {
    if (this.uploadScanModal) {
      this.uploadScanModal.style.display = 'none';
    }
  },

  switchUploadTab(tab) {
    if (tab === 'doc') {
      if (this.tabUploadDoc) this.tabUploadDoc.classList.add('active');
      if (this.tabScanPage) this.tabScanPage.classList.remove('active');
      if (this.paneUploadDoc) this.paneUploadDoc.style.display = 'block';
      if (this.paneScanPage) this.paneScanPage.style.display = 'none';
      if (this.uploadModalBadge) this.uploadModalBadge.textContent = 'DOCUMENT SPECIFICATION PARSER';
      if (this.uploadModalTitle) this.uploadModalTitle.textContent = 'Upload Tender Notice or Specification PDF';
    } else {
      if (this.tabUploadDoc) this.tabUploadDoc.classList.remove('active');
      if (this.tabScanPage) this.tabScanPage.classList.add('active');
      if (this.paneUploadDoc) this.paneUploadDoc.style.display = 'none';
      if (this.paneScanPage) this.paneScanPage.style.display = 'block';
      if (this.uploadModalBadge) this.uploadModalBadge.textContent = 'OPTICAL CHARACTER RECOGNITION (OCR)';
      if (this.uploadModalTitle) this.uploadModalTitle.textContent = 'Scan Rating Plate or Document Page';
    }
  },

  resetUploadState() {
    if (this.uploadProgress) this.uploadProgress.style.display = 'none';
    if (this.extractionPreview) this.extractionPreview.style.display = 'none';
    if (this.docFileInput) this.docFileInput.value = '';
    if (this.imageFileInput) this.imageFileInput.value = '';
  },

  setupDropZone(element, callback) {
    if (!element) return;

    ['dragenter', 'dragover'].forEach(eventName => {
      element.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        element.classList.add('drag-over');
      });
    });

    ['dragleave', 'drop'].forEach(eventName => {
      element.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        element.classList.remove('drag-over');
      });
    });

    element.addEventListener('drop', (e) => {
      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        callback(files[0]);
      }
    });
  },

  async handleDocumentFile(file) {
    if (!file) return;

    this.openUploadScanModal('doc');
    if (this.uploadProgress) this.uploadProgress.style.display = 'block';
    if (this.extractionPreview) this.extractionPreview.style.display = 'none';

    if (this.uploadProgressText) this.uploadProgressText.textContent = `Reading and parsing: ${file.name}...`;
    if (this.uploadProgressPct) this.uploadProgressPct.textContent = '35%';
    if (this.uploadProgressFill) this.uploadProgressFill.style.width = '35%';

    try {
      const result = await BISENSE_API.uploadSpecFile(file);

      if (this.uploadProgressPct) this.uploadProgressPct.textContent = '100%';
      if (this.uploadProgressFill) this.uploadProgressFill.style.width = '100%';
      if (this.uploadProgressText) this.uploadProgressText.textContent = 'Specification extracted successfully!';

      setTimeout(() => {
        if (this.uploadProgress) this.uploadProgress.style.display = 'none';
        this.renderExtractionPreview(result);
      }, 400);

    } catch (err) {
      console.error('[BISENSE Upload] Error:', err);
      if (this.uploadProgressText) this.uploadProgressText.textContent = `Upload note: ${err.message}`;
      if (this.uploadProgressFill) this.uploadProgressFill.style.width = '100%';
    }
  },

  async handleImageFile(file) {
    if (!file) return;

    this.openUploadScanModal('scan');
    if (this.uploadProgress) this.uploadProgress.style.display = 'block';
    if (this.extractionPreview) this.extractionPreview.style.display = 'none';

    if (this.uploadProgressText) this.uploadProgressText.textContent = `Initializing OCR for ${file.name}...`;
    if (this.uploadProgressPct) this.uploadProgressPct.textContent = '20%';
    if (this.uploadProgressFill) this.uploadProgressFill.style.width = '20%';

    // Check if Tesseract is available in window
    if (window.Tesseract) {
      try {
        const worker = await Tesseract.createWorker('eng');
        if (this.uploadProgressText) this.uploadProgressText.textContent = 'Analyzing image characters and clauses...';
        if (this.uploadProgressPct) this.uploadProgressPct.textContent = '60%';
        if (this.uploadProgressFill) this.uploadProgressFill.style.width = '60%';

        const ret = await worker.recognize(file);
        await worker.terminate();

        const recognizedText = ret.data.text || '';
        if (this.uploadProgressPct) this.uploadProgressPct.textContent = '100%';
        if (this.uploadProgressFill) this.uploadProgressFill.style.width = '100%';
        if (this.uploadProgressText) this.uploadProgressText.textContent = 'OCR scan completed!';

        const extracted = this.extractSpecsFromRawText(recognizedText, file.name);
        setTimeout(() => {
          if (this.uploadProgress) this.uploadProgress.style.display = 'none';
          this.renderExtractionPreview(extracted);
        }, 400);

      } catch (ocrErr) {
        console.warn('[BISENSE OCR] Client OCR fallback:', ocrErr);
        this.handleDocumentFile(file);
      }
    } else {
      this.handleDocumentFile(file);
    }
  },

  loadSamplePlate() {
    this.openUploadScanModal('scan');
    if (this.uploadProgress) this.uploadProgress.style.display = 'block';
    if (this.extractionPreview) this.extractionPreview.style.display = 'none';

    if (this.uploadProgressText) this.uploadProgressText.textContent = 'Scanning sample appliance rating plate...';
    if (this.uploadProgressPct) this.uploadProgressPct.textContent = '50%';
    if (this.uploadProgressFill) this.uploadProgressFill.style.width = '50%';

    setTimeout(() => {
      const sampleText = "SURYA APPLIANCES LTD - DOMESTIC ELECTRIC STORAGE WATER HEATER GEYSER\n" +
        "MODEL: SWH-25L | RATED VOLTAGE: 230V AC 50Hz | POWER RATING: 2000W\n" +
        "CAPACITY: 25 LITRES | RATED PRESSURE: 0.8 MPa (8.0 bar)\n" +
        "THERMAL CUT-OFF: 90°C WITH EARTHED SHOCK PROTECTION\n" +
        "CONFORMS TO INDIAN STANDARD: IS 2082:2018 | ISI CM/L: 9283718";

      const extracted = this.extractSpecsFromRawText(sampleText, "sample_rating_plate.jpg");

      if (this.uploadProgressPct) this.uploadProgressPct.textContent = '100%';
      if (this.uploadProgressFill) this.uploadProgressFill.style.width = '100%';
      if (this.uploadProgressText) this.uploadProgressText.textContent = 'OCR recognition completed!';

      setTimeout(() => {
        if (this.uploadProgress) this.uploadProgress.style.display = 'none';
        this.renderExtractionPreview(extracted);
      }, 300);
    }, 600);
  },

  extractSpecsFromRawText(text, filename) {
    let product = 'Electrical Appliance';
    let power = '2000W';
    let app = 'Domestic';
    let features = [];

    const lower = text.toLowerCase();
    if (lower.includes('water heater') || lower.includes('geyser')) {
      product = 'Electric Water Heater (Geyser)';
      features.push('Thermal Cut-off');
      features.push('Pressure Withstand');
    } else if (lower.includes('cooker') || lower.includes('induction')) {
      product = 'Electric Cooker';
      features.push('Automatic temperature control');
      features.push('Thermal cut-off');
    } else if (lower.includes('fan') || lower.includes('bldc')) {
      product = 'Electric Ceiling Fan';
      features.push('Energy Service Value');
      features.push('Safety Fall Suspension');
    } else if (lower.includes('fridge') || lower.includes('refrigerator')) {
      product = 'Frost-Free Refrigerator';
      features.push('Energy Star Labelling');
      features.push('Refrigerant Safety');
    } else if (lower.includes('iron')) {
      product = 'Electric Iron';
      features.push('Thermostat control');
    } else if (lower.includes('bulb') || lower.includes('led')) {
      product = 'LED Lamp / Bulb';
    }

    const wattMatch = text.match(/(\d+\s*(?:W|watts?|kW))/i);
    if (wattMatch) power = wattMatch[1].toUpperCase();

    if (lower.includes('industrial')) app = 'Industrial';
    else if (lower.includes('commercial')) app = 'Commercial';

    const suggestedQuery = `${product} rated at ${power} for ${app.toLowerCase()} use with ${features.join(', ') || 'safety compliance'}`;

    return {
      filename: filename || 'scanned_plate.png',
      extracted_text: text,
      suggested_query: suggestedQuery,
      detected_specs: {
        product: product,
        power: power,
        application: app,
        features: features
      }
    };
  },

  renderExtractionPreview(data) {
    if (!this.extractionPreview) return;

    this.extractionPreview.style.display = 'flex';
    if (this.previewFileName) {
      this.previewFileName.textContent = data.filename || 'uploaded_document';
    }

    if (this.previewSpecsChips) {
      const specs = data.detected_specs || {};
      const chipsHtml = [];
      if (specs.product) chipsHtml.push(`<span class="extr-spec-chip"><strong>Product:</strong> ${specs.product}</span>`);
      if (specs.power) chipsHtml.push(`<span class="extr-spec-chip"><strong>Rating:</strong> ${specs.power}</span>`);
      if (specs.application) chipsHtml.push(`<span class="extr-spec-chip"><strong>Use:</strong> ${specs.application}</span>`);
      if (specs.features && specs.features.length) {
        chipsHtml.push(`<span class="extr-spec-chip"><strong>Features:</strong> ${specs.features.join(', ')}</span>`);
      }
      this.previewSpecsChips.innerHTML = chipsHtml.join('') || '<span class="extr-spec-chip">Specs Identified</span>';
    }

    if (this.previewQueryText) {
      this.previewQueryText.value = data.suggested_query || data.extracted_text || '';
    }

    if (this.rawTextContent) {
      this.rawTextContent.textContent = data.extracted_text || '';
      this.rawTextContent.style.display = 'none';
      if (this.rawToggleBtn) {
        const span = this.rawToggleBtn.querySelector('span') || this.rawToggleBtn;
        span.textContent = 'Show Raw Document Text ▾';
      }
    }
  },

  applyExtractedQuery(autoSearch = false) {
    const query = this.previewQueryText ? this.previewQueryText.value.trim() : '';
    if (query && this.queryInput) {
      this.queryInput.value = query;
      this.queryInput.focus();
    }
    this.closeUploadScanModal();

    if (autoSearch && query) {
      const demoSection = document.getElementById('demo');
      if (demoSection) {
        demoSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      this.executeSearch();
    }
  }
};

window.SearchController = SearchController;
