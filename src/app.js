/**
 * ResumeCraft — Interactive Resume Enhancer
 * Static demo with pseudo-AI analysis logic.
 * All processing runs in-browser; no server, no API keys.
 */

// DOM helpers
const $ = (id) => document.getElementById(id);
const $$ = (selector) => document.querySelectorAll(selector);

// State
let parsed = null;
let currentAnalysis = null;

// DOM Elements
const elements = {
  fileInput: $('fileInput'),
  resumeText: $('resumeText'),
  targetRole: $('targetRole'),
  parseBtn: $('parseBtn'),
  optimizeBtn: $('optimizeBtn'),
  clearBtn: $('clearAll'),
  printBtn: $('printBtn'),
  downloadBtn: $('downloadHtml'),
  copyBtn: $('copyResume'),
  statusEl: $('status'),
  parsedOut: $('parsedOut'),
  analysisOut: $('analysisOut'),
  previewEl: $('preview'),
  printEl: $('printResume'),
  printable: $('printable'),
  uploadZone: $('uploadZone'),
  loadingOverlay: $('loadingOverlay'),
  loadingText: $('loadingText'),
};

// Extended keyword lists for better extraction
const SKILL_PATTERNS = {
  languages: [
    'JavaScript',
    'TypeScript',
    'Python',
    'Java',
    'C\\+\\+',
    'C#',
    'Go',
    'Rust',
    'Ruby',
    'PHP',
    'Swift',
    'Kotlin',
  ],
  frontend: [
    'React',
    'Vue',
    'Angular',
    'Svelte',
    'Next\\.js',
    'Nuxt',
    'Tailwind',
    'CSS',
    'SCSS',
    'HTML5?',
    'Redux',
    'GraphQL',
  ],
  backend: [
    'Node\\.?js?',
    'Express',
    'Django',
    'Flask',
    'Spring',
    'Rails',
    'FastAPI',
    'REST',
    'API',
    'Microservices',
  ],
  database: ['SQL', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'DynamoDB', 'Firebase', 'Prisma'],
  devops: ['Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'CI/CD', 'Jenkins', 'GitHub Actions'],
  tools: ['Git', 'Webpack', 'Vite', 'npm', 'Yarn', 'Jest', 'Cypress', 'Playwright', 'Figma'],
  softSkills: [
    'Leadership',
    'Communication',
    'Agile',
    'Scrum',
    'Mentoring',
    'Collaboration',
    'Problem.solving',
  ],
};

// ATS-friendly keywords that recruiters look for
const ATS_KEYWORDS = [
  'achieved',
  'improved',
  'increased',
  'reduced',
  'developed',
  'implemented',
  'designed',
  'led',
  'managed',
  'delivered',
  'optimized',
  'scaled',
  'launched',
  'built',
  'created',
];

// Loading messages for pseudo-AI effect
const LOADING_MESSAGES = [
  'Scanning resume structure…',
  'Extracting key information…',
  'Analyzing skills and experience…',
  'Checking ATS compatibility…',
  'Generating recommendations…',
  'Finalizing analysis…',
];

/**
 * Initialize the application
 */
function init() {
  setupEventListeners();
  setupDragAndDrop();
  setupKeyboardNavigation();
}

/**
 * Set up all event listeners
 */
function setupEventListeners() {
  elements.parseBtn?.addEventListener('click', handleParse);
  elements.optimizeBtn?.addEventListener('click', handleOptimize);
  elements.clearBtn?.addEventListener('click', handleClear);
  elements.printBtn?.addEventListener('click', handlePrint);
  elements.downloadBtn?.addEventListener('click', handleDownload);
  elements.copyBtn?.addEventListener('click', handleCopy);
  elements.fileInput?.addEventListener('change', handleFileUpload);

  // Upload zone click to trigger file input
  elements.uploadZone?.addEventListener('click', () => {
    elements.fileInput?.click();
  });

  // Handle keyboard activation for upload zone
  elements.uploadZone?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      elements.fileInput?.click();
    }
  });
}

/**
 * Set up drag and drop functionality
 */
function setupDragAndDrop() {
  const zone = elements.uploadZone;
  if (!zone) return;

  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach((eventName) => {
    zone.addEventListener(eventName, preventDefaults, false);
  });

  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  ['dragenter', 'dragover'].forEach((eventName) => {
    zone.addEventListener(eventName, () => zone.classList.add('dragover'), false);
  });

  ['dragleave', 'drop'].forEach((eventName) => {
    zone.addEventListener(eventName, () => zone.classList.remove('dragover'), false);
  });

  zone.addEventListener('drop', handleDrop, false);
}

/**
 * Set up keyboard navigation for accessibility
 */
function setupKeyboardNavigation() {
  // Make buttons keyboard accessible
  $$('.btn').forEach((btn) => {
    if (!btn.hasAttribute('tabindex')) {
      btn.setAttribute('tabindex', '0');
    }
  });
}

/**
 * Handle file drop
 */
function handleDrop(e) {
  const files = e.dataTransfer?.files;
  if (files?.length) {
    processFile(files[0]);
  }
}

/**
 * Handle file input change
 */
function handleFileUpload(e) {
  const file = e.target?.files?.[0];
  if (file) {
    processFile(file);
  }
}

/**
 * Process uploaded file
 */
function processFile(file) {
  const validTypes = ['text/plain', 'application/pdf', 'application/msword'];
  const validExtensions = ['.txt', '.pdf', '.doc', '.docx'];
  const extension = '.' + file.name.split('.').pop().toLowerCase();

  if (!validTypes.includes(file.type) && !validExtensions.includes(extension)) {
    setStatus('Please upload a .txt, .pdf, .doc, or .docx file.', 'warning');
    return;
  }

  if (file.type === 'text/plain' || extension === '.txt') {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (elements.resumeText) {
        elements.resumeText.value = e.target?.result || '';
        setStatus('File loaded successfully!', 'success');
      }
    };
    reader.onerror = () => {
      setStatus('Error reading file.', 'error');
    };
    reader.readAsText(file);
  } else {
    // For non-text files, show demo message
    setStatus('Demo mode: For PDF/DOC files, please paste the text content manually.', 'info');
  }
}

/**
 * Display status message
 */
function setStatus(msg, type = 'info') {
  const statusEl = elements.statusEl;
  if (!statusEl) return;

  statusEl.textContent = msg || '';
  statusEl.className = 'status-message ' + (msg ? type : '');
  statusEl.setAttribute('role', 'status');
  statusEl.setAttribute('aria-live', 'polite');

  if (msg) {
    statusEl.classList.remove('hidden');
  }
}

/**
 * Show loading overlay with animated messages
 */
async function showLoading() {
  const overlay = elements.loadingOverlay;
  const textEl = elements.loadingText;
  if (!overlay || !textEl) return;

  overlay.classList.add('active');

  for (const message of LOADING_MESSAGES) {
    textEl.textContent = message;
    await delay(400 + Math.random() * 300);
  }
}

/**
 * Hide loading overlay
 */
function hideLoading() {
  const overlay = elements.loadingOverlay;
  if (overlay) {
    overlay.classList.remove('active');
  }
}

/**
 * Promise-based delay helper
 */
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Handle parse button click
 */
async function handleParse() {
  const text = elements.resumeText?.value?.trim();
  if (!text) {
    setStatus('Please paste or upload your resume text first.', 'warning');
    return;
  }

  try {
    await showLoading();
    await delay(500); // Simulate processing

    parsed = parseResume(text);
    currentAnalysis = analyzeResume(parsed, text);

    renderParsedData(parsed);
    renderAnalysis(currentAnalysis);
    renderPreview(parsed);

    hideLoading();
    setStatus('Resume parsed and analyzed successfully!', 'success');
  } catch (error) {
    hideLoading();
    setStatus('Error parsing resume. Please try again.', 'error');
    console.error('Parse error:', error);
  }
}

/**
 * Handle optimize button click
 */
async function handleOptimize() {
  if (!parsed) {
    setStatus('Please parse a resume first.', 'warning');
    return;
  }

  const role = elements.targetRole?.value?.trim() || 'General Position';

  try {
    await showLoading();
    await delay(800); // Simulate optimization processing

    const optimized = optimizeForRole(parsed, role);
    const newAnalysis = analyzeResume(optimized, elements.resumeText?.value || '');

    parsed = optimized;
    currentAnalysis = newAnalysis;

    renderParsedData(optimized);
    renderAnalysis(newAnalysis);
    renderPreview(optimized);

    hideLoading();
    setStatus(`Resume optimized for "${role}"!`, 'success');
  } catch (error) {
    hideLoading();
    setStatus('Error optimizing resume. Please try again.', 'error');
    console.error('Optimize error:', error);
  }
}

/**
 * Handle clear button click
 */
function handleClear() {
  if (elements.fileInput) elements.fileInput.value = '';
  if (elements.resumeText) elements.resumeText.value = '';
  if (elements.targetRole) elements.targetRole.value = '';

  parsed = null;
  currentAnalysis = null;

  if (elements.parsedOut) elements.parsedOut.textContent = '';
  if (elements.analysisOut) {
    elements.analysisOut.innerHTML = renderEmptyAnalysis();
  }
  if (elements.previewEl) {
    elements.previewEl.innerHTML = renderEmptyPreview();
  }

  setStatus('');
}

/**
 * Handle print button click
 */
function handlePrint() {
  if (!parsed) {
    setStatus('Please parse a resume first.', 'warning');
    return;
  }

  if (elements.printable && elements.printEl) {
    elements.printable.classList.remove('hidden');
    elements.printEl.innerHTML = renderPrintPreview(parsed);
    window.print();
    setTimeout(() => elements.printable.classList.add('hidden'), 300);
  }
}

/**
 * Handle download button click
 */
function handleDownload() {
  if (!parsed) {
    setStatus('Please parse a resume first.', 'warning');
    return;
  }

  const html = wrapHtmlForDownload(renderPrintPreview(parsed));
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${sanitizeFilename(parsed.name || 'resume')}.html`;
  a.click();
  URL.revokeObjectURL(url);

  setStatus('Resume downloaded!', 'success');
}

/**
 * Handle copy button click
 */
function handleCopy() {
  if (!parsed) {
    setStatus('Please parse a resume first.', 'warning');
    return;
  }

  const previewText = generatePlainText(parsed);

  navigator.clipboard
    .writeText(previewText)
    .then(() => {
      const btn = elements.copyBtn;
      if (btn) {
        btn.classList.add('copied');
        btn.setAttribute('aria-label', 'Copied!');
        setTimeout(() => {
          btn.classList.remove('copied');
          btn.setAttribute('aria-label', 'Copy resume');
        }, 2000);
      }
      setStatus('Resume copied to clipboard!', 'success');
    })
    .catch(() => {
      setStatus('Failed to copy. Please try again.', 'error');
    });
}

/**
 * Parse resume text and extract structured data
 */
function parseResume(text) {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  // Extract name (usually first non-empty line)
  const name = extractName(lines);

  // Extract contact info
  const email = extractEmail(text);
  const phone = extractPhone(text);
  const linkedin = extractLinkedIn(text);

  // Extract skills by category
  const skills = extractSkills(text);

  // Extract experience entries
  const experiences = extractExperiences(lines);

  // Extract education
  const education = extractEducation(lines);

  // Extract summary/objective if present
  const summary = extractSummary(lines);

  return {
    name,
    email,
    phone,
    linkedin,
    skills,
    experiences,
    education,
    summary,
  };
}

/**
 * Extract name from resume lines
 */
function extractName(lines) {
  // First line is typically the name
  const firstLine = lines[0] || '';

  // Check if it looks like a name (not an email, phone, or URL)
  if (
    !firstLine.includes('@') &&
    !firstLine.match(/\d{3}/) &&
    !firstLine.includes('http') &&
    firstLine.length < 50
  ) {
    return firstLine;
  }

  return 'Candidate Name';
}

/**
 * Extract email from text
 */
function extractEmail(text) {
  const match = text.match(/[a-z0-9_.+-]+@[a-z0-9-]+\.[a-z0-9-.]+/i);
  return match ? match[0] : null;
}

/**
 * Extract phone number from text
 */
function extractPhone(text) {
  const match = text.match(/(\+?\d[\d\s\-().]{7,}\d)/);
  return match ? match[0].trim() : null;
}

/**
 * Extract LinkedIn URL from text
 */
function extractLinkedIn(text) {
  const match = text.match(/linkedin\.com\/in\/[\w-]+/i);
  return match ? 'https://' + match[0] : null;
}

/**
 * Extract skills from text by category
 */
function extractSkills(text) {
  const allSkills = [];
  const categories = {};

  for (const [category, patterns] of Object.entries(SKILL_PATTERNS)) {
    const categorySkills = [];
    for (const pattern of patterns) {
      const regex = new RegExp(`\\b${pattern}\\b`, 'gi');
      const matches = text.match(regex) || [];
      matches.forEach((match) => {
        const normalized = match.replace(/\\/g, '');
        if (!categorySkills.includes(normalized)) {
          categorySkills.push(normalized);
          allSkills.push(normalized);
        }
      });
    }
    if (categorySkills.length > 0) {
      categories[category] = categorySkills;
    }
  }

  return { all: [...new Set(allSkills)], categories };
}

/**
 * Extract work experiences from resume lines
 */
function extractExperiences(lines) {
  const experiences = [];
  const expPatterns = [
    /(.+)\s+at\s+(.+)/i,
    /(.+)\s+-\s+(.+)/,
    /(.+),\s+(.+)/,
    /(engineer|developer|manager|designer|analyst|lead|senior|junior)/i,
  ];

  for (const line of lines) {
    for (const pattern of expPatterns) {
      if (pattern.test(line) && line.length < 150) {
        experiences.push(line);
        break;
      }
    }
    if (experiences.length >= 5) break;
  }

  return experiences;
}

/**
 * Extract education entries
 */
function extractEducation(lines) {
  const eduKeywords = [
    'university',
    'college',
    'bachelor',
    'master',
    'phd',
    'degree',
    'b.s.',
    'b.a.',
    'm.s.',
    'm.a.',
    'mba',
  ];
  const education = [];

  for (const line of lines) {
    const lower = line.toLowerCase();
    if (eduKeywords.some((kw) => lower.includes(kw)) && line.length < 150) {
      education.push(line);
    }
    if (education.length >= 3) break;
  }

  return education;
}

/**
 * Extract summary or objective
 */
function extractSummary(lines) {
  const summaryIndex = lines.findIndex((line) => /^(summary|objective|profile|about)/i.test(line));

  if (summaryIndex !== -1 && lines[summaryIndex + 1]) {
    return lines[summaryIndex + 1];
  }

  return null;
}

/**
 * Analyze parsed resume and generate insights
 */
function analyzeResume(data, originalText) {
  const score = calculateScore(data, originalText);
  const strengths = identifyStrengths(data, originalText);
  const weaknesses = identifyWeaknesses(data, originalText);
  const improvements = generateImprovements(data, originalText);
  const atsScore = calculateATSScore(originalText);
  const sectionScores = calculateSectionScores(data, originalText);

  return {
    overallScore: score,
    atsScore,
    strengths,
    weaknesses,
    improvements,
    sectionScores,
    skillCount: data.skills?.all?.length || 0,
    hasQuantifiedImpact: /\d+%|\$\d+|\d+\s*(users?|customers?|clients?)/i.test(originalText),
  };
}

/**
 * Calculate overall resume score
 */
function calculateScore(data, text) {
  let score = 40; // Base score

  // Skills bonus (up to 20 points)
  const skillCount = data.skills?.all?.length || 0;
  score += Math.min(20, skillCount * 2);

  // Experience bonus (up to 15 points)
  const expCount = data.experiences?.length || 0;
  score += Math.min(15, expCount * 3);

  // Contact info bonus (up to 10 points)
  if (data.email) score += 3;
  if (data.phone) score += 3;
  if (data.linkedin) score += 4;

  // Quantified achievements bonus (up to 10 points)
  const quantified = (text.match(/\d+%|\$[\d,]+|\d+\s*(users?|ms|seconds?)/gi) || []).length;
  score += Math.min(10, quantified * 2);

  // Action verbs bonus (up to 5 points)
  const actionVerbs = ATS_KEYWORDS.filter((verb) =>
    new RegExp(`\\b${verb}\\b`, 'i').test(text)
  ).length;
  score += Math.min(5, actionVerbs);

  return Math.min(100, Math.round(score));
}

/**
 * Calculate ATS compatibility score
 */
function calculateATSScore(text) {
  let score = 50;

  // Check for ATS-friendly formatting
  if (!/[│┃┐┌└┘├┤┬┴]/.test(text)) score += 10; // No table characters
  if (ATS_KEYWORDS.some((kw) => text.toLowerCase().includes(kw))) score += 15;
  if (/\b(skills?|experience|education|summary)\b/i.test(text)) score += 15;
  if (!/[^\x00-\x7F]/.test(text.replace(/[–—''""]/g, ''))) score += 10; // Mostly ASCII

  return Math.min(100, score);
}

/**
 * Calculate individual section scores
 */
function calculateSectionScores(data, text) {
  return {
    contact: data.email && data.phone ? 100 : data.email || data.phone ? 60 : 20,
    skills: Math.min(100, (data.skills?.all?.length || 0) * 10),
    experience: Math.min(100, (data.experiences?.length || 0) * 20),
    education: data.education?.length > 0 ? 80 : 30,
    formatting: calculateFormattingScore(text),
  };
}

/**
 * Calculate formatting score
 */
function calculateFormattingScore(text) {
  let score = 60;
  if (text.split('\n').length > 10) score += 10;
  if (/•|–|—/.test(text)) score += 10; // Uses bullet points
  if (!/\t{2,}/.test(text)) score += 10; // No excessive tabs
  if (text.length > 500 && text.length < 5000) score += 10;
  return Math.min(100, score);
}

/**
 * Identify resume strengths
 */
function identifyStrengths(data, text) {
  const strengths = [];

  if (data.skills?.all?.length >= 5) {
    strengths.push({
      icon: '✓',
      text: `Strong technical skills profile (${data.skills.all.length} skills identified)`,
    });
  }

  if (/\d+%/.test(text)) {
    strengths.push({ icon: '✓', text: 'Includes quantified achievements with percentages' });
  }

  if (/\$[\d,]+/.test(text)) {
    strengths.push({ icon: '✓', text: 'Demonstrates financial impact with dollar values' });
  }

  if (data.experiences?.length >= 3) {
    strengths.push({ icon: '✓', text: 'Solid experience section with multiple roles' });
  }

  if (data.linkedin) {
    strengths.push({ icon: '✓', text: 'LinkedIn profile included for professional networking' });
  }

  const actionVerbs = ATS_KEYWORDS.filter((v) => new RegExp(`\\b${v}\\b`, 'i').test(text));
  if (actionVerbs.length >= 3) {
    strengths.push({
      icon: '✓',
      text: `Uses strong action verbs (${actionVerbs.slice(0, 3).join(', ')})`,
    });
  }

  return strengths.slice(0, 5);
}

/**
 * Identify resume weaknesses
 */
function identifyWeaknesses(data, text) {
  const weaknesses = [];

  if (!data.skills?.all?.length || data.skills.all.length < 3) {
    weaknesses.push({ icon: '!', text: 'Limited technical skills identified', priority: 'high' });
  }

  if (!/\d+%|\$[\d,]+/.test(text)) {
    weaknesses.push({
      icon: '!',
      text: 'Missing quantified achievements (%, $, metrics)',
      priority: 'high',
    });
  }

  if (!data.summary) {
    weaknesses.push({
      icon: '!',
      text: 'No professional summary or objective found',
      priority: 'medium',
    });
  }

  if (!data.education?.length) {
    weaknesses.push({ icon: '!', text: 'Education section not detected', priority: 'medium' });
  }

  if (text.length < 300) {
    weaknesses.push({ icon: '!', text: 'Resume content appears too brief', priority: 'high' });
  }

  if (text.length > 5000) {
    weaknesses.push({ icon: '!', text: 'Resume may be too long for ATS systems', priority: 'low' });
  }

  return weaknesses.slice(0, 5);
}

/**
 * Generate specific improvement suggestions
 */
function generateImprovements(data, text) {
  const improvements = [];

  if (!/\d+%/.test(text)) {
    improvements.push({
      section: 'Experience',
      tip: 'Add percentage improvements (e.g., "Increased conversion by 25%")',
    });
  }

  if (!/\$[\d,]+/.test(text)) {
    improvements.push({
      section: 'Experience',
      tip: 'Include dollar impact (e.g., "Saved $50K annually")',
    });
  }

  if (!ATS_KEYWORDS.some((v) => new RegExp(`\\b${v}ed\\b`, 'i').test(text))) {
    improvements.push({
      section: 'Experience',
      tip: 'Start bullet points with action verbs (achieved, improved, developed)',
    });
  }

  if (!data.summary) {
    improvements.push({
      section: 'Summary',
      tip: 'Add a 2-3 sentence professional summary highlighting your key value',
    });
  }

  if (data.skills?.all?.length < 8) {
    improvements.push({
      section: 'Skills',
      tip: 'Expand your skills section with relevant technologies and tools',
    });
  }

  improvements.push({
    section: 'Keywords',
    tip: 'Mirror keywords from job descriptions you are targeting',
  });

  return improvements.slice(0, 6);
}

/**
 * Optimize resume for a specific role
 */
function optimizeForRole(data, role) {
  const roleLower = role.toLowerCase();
  const additionalSkills = [];

  // Role-specific skill suggestions
  if (roleLower.includes('front') || roleLower.includes('ui') || roleLower.includes('ux')) {
    additionalSkills.push('Accessibility (WCAG)', 'Responsive Design', 'Performance Optimization');
  }

  if (roleLower.includes('back') || roleLower.includes('server')) {
    additionalSkills.push('API Design', 'Database Optimization', 'System Architecture');
  }

  if (roleLower.includes('full') || roleLower.includes('stack')) {
    additionalSkills.push('Full-Stack Development', 'System Design', 'DevOps');
  }

  if (roleLower.includes('lead') || roleLower.includes('senior') || roleLower.includes('manager')) {
    additionalSkills.push('Technical Leadership', 'Mentoring', 'Code Review');
  }

  if (roleLower.includes('data') || roleLower.includes('ml') || roleLower.includes('ai')) {
    additionalSkills.push('Data Analysis', 'Machine Learning', 'Statistical Modeling');
  }

  const allSkills = [...new Set([...(data.skills?.all || []), ...additionalSkills])];

  return {
    ...data,
    skills: {
      all: allSkills,
      categories: data.skills?.categories || {},
    },
    optimizedFor: role,
  };
}

/**
 * Render parsed data as formatted JSON
 */
function renderParsedData(data) {
  if (!elements.parsedOut) return;

  const displayData = {
    name: data.name,
    contact: {
      email: data.email,
      phone: data.phone,
      linkedin: data.linkedin,
    },
    skills: data.skills?.all || [],
    experienceCount: data.experiences?.length || 0,
    educationCount: data.education?.length || 0,
  };

  elements.parsedOut.textContent = JSON.stringify(displayData, null, 2);
}

/**
 * Render analysis results
 */
function renderAnalysis(analysis) {
  if (!elements.analysisOut) return;

  const html = `
    <div class="fade-in">
      <!-- Score Display -->
      <div class="score-display" role="region" aria-label="Resume Score">
        <div class="score-value" aria-label="Score: ${analysis.overallScore} out of 100">
          ${analysis.overallScore}
        </div>
        <div class="score-label">Overall Score</div>
      </div>

      <!-- Progress Bars -->
      <div class="analysis-section">
        <h4 class="analysis-section-title">
          <svg class="analysis-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
          </svg>
          Section Scores
        </h4>
        ${renderProgressBars(analysis.sectionScores)}
      </div>

      <!-- Strengths -->
      ${
        analysis.strengths.length > 0
          ? `
        <div class="analysis-section">
          <h4 class="analysis-section-title">
            <svg class="analysis-icon" style="color: #22c55e;" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            Strengths
          </h4>
          <ul class="analysis-list" role="list">
            ${analysis.strengths.map((s) => `<li><span class="badge badge-success" aria-hidden="true">${s.icon}</span>${escapeHtml(s.text)}</li>`).join('')}
          </ul>
        </div>
      `
          : ''
      }

      <!-- Weaknesses -->
      ${
        analysis.weaknesses.length > 0
          ? `
        <div class="analysis-section">
          <h4 class="analysis-section-title">
            <svg class="analysis-icon" style="color: #f59e0b;" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
            Areas to Improve
          </h4>
          <ul class="analysis-list" role="list">
            ${analysis.weaknesses.map((w) => `<li><span class="badge badge-warning" aria-hidden="true">${w.icon}</span>${escapeHtml(w.text)}</li>`).join('')}
          </ul>
        </div>
      `
          : ''
      }

      <!-- Improvement Tips -->
      <div class="analysis-section">
        <h4 class="analysis-section-title">
          <svg class="analysis-icon" style="color: #4f46e5;" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
          </svg>
          Improvement Tips
        </h4>
        <ul class="analysis-list" role="list">
          ${analysis.improvements.map((i) => `<li><span class="badge badge-info">${i.section}</span>${escapeHtml(i.tip)}</li>`).join('')}
        </ul>
      </div>

      <!-- ATS Score -->
      <div class="analysis-section">
        <div class="progress-container">
          <div class="progress-label">
            <span>ATS Compatibility</span>
            <span>${analysis.atsScore}%</span>
          </div>
          <div class="progress-bar" role="progressbar" aria-valuenow="${analysis.atsScore}" aria-valuemin="0" aria-valuemax="100">
            <div class="progress-fill" style="width: ${analysis.atsScore}%"></div>
          </div>
        </div>
      </div>
    </div>
  `;

  elements.analysisOut.innerHTML = html;
}

/**
 * Render progress bars for section scores
 */
function renderProgressBars(scores) {
  const sections = [
    { key: 'contact', label: 'Contact Info' },
    { key: 'skills', label: 'Skills' },
    { key: 'experience', label: 'Experience' },
    { key: 'education', label: 'Education' },
    { key: 'formatting', label: 'Formatting' },
  ];

  return sections
    .map(
      (s) => `
      <div class="progress-container">
        <div class="progress-label">
          <span>${s.label}</span>
          <span>${scores[s.key] || 0}%</span>
        </div>
        <div class="progress-bar" role="progressbar" aria-valuenow="${scores[s.key] || 0}" aria-valuemin="0" aria-valuemax="100" aria-label="${s.label} score">
          <div class="progress-fill" style="width: ${scores[s.key] || 0}%"></div>
        </div>
      </div>
    `
    )
    .join('');
}

/**
 * Render empty analysis state
 */
function renderEmptyAnalysis() {
  return `
    <div class="fade-in" style="text-align: center; padding: 2rem; color: var(--color-text-muted);">
      <svg style="width: 48px; height: 48px; margin: 0 auto 1rem; opacity: 0.5;" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
      </svg>
      <p>Upload or paste your resume to see the analysis</p>
    </div>
  `;
}

/**
 * Render resume preview
 */
function renderPreview(data) {
  if (!elements.previewEl) return;

  const skills = data.skills?.all || [];
  const experiences = data.experiences || [];
  const education = data.education || [];

  const html = `
    <div class="preview-container fade-in">
      <div class="preview-content" role="document" aria-label="Resume Preview">
        <header class="preview-header">
          <h1 class="preview-name">${escapeHtml(data.name || 'Your Name')}</h1>
          <p class="preview-contact">
            ${data.email ? escapeHtml(data.email) : ''}
            ${data.email && data.phone ? ' • ' : ''}
            ${data.phone ? escapeHtml(data.phone) : ''}
            ${(data.email || data.phone) && data.linkedin ? ' • ' : ''}
            ${data.linkedin ? `<a href="${escapeHtml(data.linkedin)}" target="_blank" rel="noopener">LinkedIn</a>` : ''}
          </p>
        </header>

        ${
          data.summary
            ? `
          <section class="preview-section">
            <h2 class="preview-section-title">Professional Summary</h2>
            <p style="font-size: 0.875rem; color: var(--color-text-muted);">${escapeHtml(data.summary)}</p>
          </section>
        `
            : ''
        }

        ${
          skills.length > 0
            ? `
          <section class="preview-section">
            <h2 class="preview-section-title">Skills</h2>
            <div class="skills-container">
              ${skills.map((s) => `<span class="skill-tag">${escapeHtml(s)}</span>`).join('')}
            </div>
          </section>
        `
            : ''
        }

        ${
          experiences.length > 0
            ? `
          <section class="preview-section">
            <h2 class="preview-section-title">Experience</h2>
            ${experiences.map((exp) => `<div class="preview-experience-item" style="font-size: 0.875rem;">${escapeHtml(exp)}</div>`).join('')}
          </section>
        `
            : ''
        }

        ${
          education.length > 0
            ? `
          <section class="preview-section">
            <h2 class="preview-section-title">Education</h2>
            ${education.map((edu) => `<div style="font-size: 0.875rem;">${escapeHtml(edu)}</div>`).join('')}
          </section>
        `
            : ''
        }

        ${
          data.optimizedFor
            ? `
          <div style="margin-top: 1.5rem; padding: 0.75rem; background: rgba(5, 150, 105, 0.1); border-radius: 0.5rem; font-size: 0.75rem; color: #047857;">
            ✓ Optimized for: ${escapeHtml(data.optimizedFor)}
          </div>
        `
            : ''
        }
      </div>
    </div>
  `;

  elements.previewEl.innerHTML = html;
}

/**
 * Render empty preview state
 */
function renderEmptyPreview() {
  return `
    <div class="fade-in" style="text-align: center; padding: 3rem; color: var(--color-text-muted);">
      <svg style="width: 64px; height: 64px; margin: 0 auto 1rem; opacity: 0.3;" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
      </svg>
      <p style="font-size: 0.875rem;">Paste a resume and click <strong>Analyze</strong> to see a formatted preview here.</p>
    </div>
  `;
}

/**
 * Render preview for printing
 */
function renderPrintPreview(data) {
  const skills = data.skills?.all || [];
  const experiences = data.experiences || [];
  const education = data.education || [];

  return `
    <div class="preview-content" style="border: none; padding: 0;">
      <header style="text-align: center; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 2px solid #e2e8f0;">
        <h1 style="font-size: 1.5rem; font-weight: 700; margin: 0 0 0.5rem 0;">${escapeHtml(data.name || 'Your Name')}</h1>
        <p style="font-size: 0.875rem; color: #64748b;">
          ${[data.email, data.phone, data.linkedin].filter(Boolean).map(escapeHtml).join(' • ')}
        </p>
      </header>

      ${
        data.summary
          ? `
        <section style="margin-bottom: 1.25rem;">
          <h2 style="font-size: 1rem; font-weight: 600; margin-bottom: 0.5rem; padding-bottom: 0.25rem; border-bottom: 1px solid #e2e8f0;">Summary</h2>
          <p style="font-size: 0.875rem;">${escapeHtml(data.summary)}</p>
        </section>
      `
          : ''
      }

      ${
        skills.length > 0
          ? `
        <section style="margin-bottom: 1.25rem;">
          <h2 style="font-size: 1rem; font-weight: 600; margin-bottom: 0.5rem; padding-bottom: 0.25rem; border-bottom: 1px solid #e2e8f0;">Skills</h2>
          <p style="font-size: 0.875rem;">${skills.map(escapeHtml).join(' • ')}</p>
        </section>
      `
          : ''
      }

      ${
        experiences.length > 0
          ? `
        <section style="margin-bottom: 1.25rem;">
          <h2 style="font-size: 1rem; font-weight: 600; margin-bottom: 0.5rem; padding-bottom: 0.25rem; border-bottom: 1px solid #e2e8f0;">Experience</h2>
          ${experiences.map((exp) => `<p style="font-size: 0.875rem; margin-bottom: 0.5rem;">${escapeHtml(exp)}</p>`).join('')}
        </section>
      `
          : ''
      }

      ${
        education.length > 0
          ? `
        <section>
          <h2 style="font-size: 1rem; font-weight: 600; margin-bottom: 0.5rem; padding-bottom: 0.25rem; border-bottom: 1px solid #e2e8f0;">Education</h2>
          ${education.map((edu) => `<p style="font-size: 0.875rem;">${escapeHtml(edu)}</p>`).join('')}
        </section>
      `
          : ''
      }
    </div>
  `;
}

/**
 * Generate plain text version of resume
 */
function generatePlainText(data) {
  const lines = [];
  lines.push(data.name || 'Your Name');
  lines.push('');

  if (data.email || data.phone) {
    lines.push([data.email, data.phone].filter(Boolean).join(' | '));
    if (data.linkedin) lines.push(data.linkedin);
    lines.push('');
  }

  if (data.summary) {
    lines.push('SUMMARY');
    lines.push(data.summary);
    lines.push('');
  }

  if (data.skills?.all?.length) {
    lines.push('SKILLS');
    lines.push(data.skills.all.join(', '));
    lines.push('');
  }

  if (data.experiences?.length) {
    lines.push('EXPERIENCE');
    data.experiences.forEach((exp) => lines.push('• ' + exp));
    lines.push('');
  }

  if (data.education?.length) {
    lines.push('EDUCATION');
    data.education.forEach((edu) => lines.push(edu));
  }

  return lines.join('\n');
}

/**
 * Wrap HTML content for download
 */
function wrapHtmlForDownload(inner) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Resume - Generated by ResumeCraft</title>
  <style>
    body {
      font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
      max-width: 8.5in;
      margin: 0 auto;
      padding: 1in;
      color: #1e293b;
      line-height: 1.5;
    }
    h1, h2 { margin: 0; }
    h1 { font-size: 1.5rem; }
    h2 { font-size: 1rem; }
    p { margin: 0.5rem 0; }
    @media print {
      body { padding: 0.5in; }
    }
  </style>
</head>
<body>
  ${inner}
</body>
</html>`;
}

/**
 * Sanitize filename for download
 */
function sanitizeFilename(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50);
}

/**
 * Escape HTML special characters
 */
function escapeHtml(str) {
  const htmlEscapes = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return (str || '').replace(/[&<>"']/g, (char) => htmlEscapes[char]);
}

// Initialize the app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
