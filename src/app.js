/**
 * ResumeCraft — Interactive Resume Enhancer
 * A UX/UI portfolio piece demonstrating front-end design,
 * resume parsing UX, and ATS-friendly layouts.
 *
 * All logic runs in-browser. No server, no API keys required.
 */

// DOM selectors helper
const $ = (id) => document.getElementById(id);

// State
let parsed = null;
let isAnalyzing = false;

// DOM Elements
const statusEl = $('status');
const parsedOut = $('parsedOut');
const analysisOut = $('analysisOut');
const previewEl = $('preview');
const loadingOverlay = $('loadingOverlay');
const loadingText = $('loadingText');
const scoreCircle = $('scoreCircle');
const scoreValue = $('scoreValue');
const strengthsList = $('strengthsList');
const improvementsList = $('improvementsList');
const copyBtn = $('copyBtn');

// Loading messages for pseudo-AI effect
const loadingMessages = [
  'Scanning resume structure…',
  'Extracting keywords…',
  'Analyzing experience sections…',
  'Evaluating skills alignment…',
  'Checking ATS compatibility…',
  'Generating improvement tips…',
  'Calculating match score…',
  'Finalizing analysis…',
];

/**
 * Set status message
 * @param {string} msg - Status message to display
 * @param {string} type - Type of message: 'info', 'success', 'error', 'warning'
 */
function setStatus(msg, type = 'info') {
  statusEl.textContent = msg || '';
  statusEl.className = 'mt-3 text-sm font-medium flex items-center gap-2';

  const colors = {
    info: 'text-slate-600',
    success: 'text-emerald-600',
    error: 'text-red-600',
    warning: 'text-amber-600',
  };

  statusEl.classList.add(colors[type] || colors.info);
}

/**
 * Show loading overlay with animated messages
 * @param {boolean} show - Whether to show the overlay
 */
function showLoading(show) {
  if (show) {
    loadingOverlay.classList.remove('hidden');
    loadingOverlay.classList.add('flex');
    animateLoadingMessages();
  } else {
    loadingOverlay.classList.add('hidden');
    loadingOverlay.classList.remove('flex');
  }
}

/**
 * Animate through loading messages to simulate AI processing
 */
function animateLoadingMessages() {
  let index = 0;
  const interval = setInterval(() => {
    if (loadingOverlay.classList.contains('hidden')) {
      clearInterval(interval);
      return;
    }
    loadingText.textContent = loadingMessages[index];
    index = (index + 1) % loadingMessages.length;
  }, 600);
}

/**
 * Simulate async delay for pseudo-AI effect
 * @param {number} ms - Milliseconds to delay
 */
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Update score visualization
 * @param {number} score - Score value 0-100
 */
function updateScoreVisualization(score) {
  // Update circle progress
  const circumference = 2 * Math.PI * 54; // radius = 54
  const offset = circumference - (score / 100) * circumference;
  scoreCircle.style.strokeDasharray = `${circumference}`;
  scoreCircle.style.strokeDashoffset = `${offset}`;

  // Animate the score number
  let current = 0;
  const increment = score / 30;
  const timer = setInterval(() => {
    current += increment;
    if (current >= score) {
      current = score;
      clearInterval(timer);
    }
    scoreValue.textContent = Math.round(current);
  }, 30);

  // Color based on score
  if (score >= 80) {
    scoreCircle.classList.remove('stroke-amber-500', 'stroke-red-500');
    scoreCircle.classList.add('stroke-emerald-500');
  } else if (score >= 60) {
    scoreCircle.classList.remove('stroke-emerald-500', 'stroke-red-500');
    scoreCircle.classList.add('stroke-amber-500');
  } else {
    scoreCircle.classList.remove('stroke-emerald-500', 'stroke-amber-500');
    scoreCircle.classList.add('stroke-red-500');
  }
}

// Event Listeners
$('clearAll').addEventListener('click', () => {
  $('fileInput').value = '';
  $('resumeText').value = '';
  $('targetRole').value = '';
  parsed = null;
  parsedOut.textContent = '';
  resetAnalysisUI();
  previewEl.innerHTML = `
    <div class="flex flex-col items-center justify-center py-12 text-slate-400">
      <svg class="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <p class="text-center">Upload or paste your resume to see a formatted preview</p>
    </div>
  `;
  setStatus('');
  copyBtn.classList.add('hidden');
});

/**
 * Reset analysis UI to initial state
 */
function resetAnalysisUI() {
  scoreValue.textContent = '0';
  scoreCircle.style.strokeDashoffset = 2 * Math.PI * 54;
  strengthsList.innerHTML = '<li class="text-slate-400">Awaiting analysis…</li>';
  improvementsList.innerHTML = '<li class="text-slate-400">Awaiting analysis…</li>';
  analysisOut.innerHTML = '';
}

$('parseBtn').addEventListener('click', async () => {
  if (isAnalyzing) return;

  const text = $('resumeText').value.trim();
  if (!text) {
    setStatus('Please paste some resume text first.', 'warning');
    return;
  }

  isAnalyzing = true;
  showLoading(true);

  try {
    // Simulate async AI processing
    await delay(2000);
    parsed = mockParse(text);

    await delay(1000);
    parsedOut.textContent = JSON.stringify(parsed, null, 2);

    await delay(500);
    renderAnalysis(parsed);
    previewEl.innerHTML = renderPreview(parsed);
    copyBtn.classList.remove('hidden');

    setStatus('Resume analyzed successfully!', 'success');
  } catch (error) {
    setStatus('Error analyzing resume. Please try again.', 'error');
    console.error(error);
  } finally {
    isAnalyzing = false;
    showLoading(false);
  }
});

$('optimizeBtn').addEventListener('click', async () => {
  if (!parsed) {
    setStatus('Please parse a resume first.', 'warning');
    return;
  }

  if (isAnalyzing) return;

  const role = $('targetRole').value.trim() || 'General Position';
  isAnalyzing = true;
  showLoading(true);

  try {
    await delay(1500);
    const optimized = mockOptimize(parsed, role);
    parsed = optimized;

    await delay(500);
    parsedOut.textContent = JSON.stringify(optimized, null, 2);
    renderAnalysis(optimized);
    previewEl.innerHTML = renderPreview(optimized);

    setStatus(`Optimized for "${role}"!`, 'success');
  } catch (error) {
    setStatus('Error optimizing resume. Please try again.', 'error');
    console.error(error);
  } finally {
    isAnalyzing = false;
    showLoading(false);
  }
});

$('printBtn').addEventListener('click', () => {
  if (!parsed) {
    setStatus('Please parse a resume first.', 'warning');
    return;
  }
  $('printable').classList.remove('hidden');
  $('printResume').innerHTML = renderPreview(parsed);
  window.print();
  setTimeout(() => $('printable').classList.add('hidden'), 300);
});

$('downloadHtml').addEventListener('click', () => {
  if (!parsed) {
    setStatus('Please parse a resume first.', 'warning');
    return;
  }
  const blob = new Blob([wrapHtml(renderPreview(parsed))], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'resume.html';
  a.click();
  URL.revokeObjectURL(url);
});

// Copy button functionality
if (copyBtn) {
  copyBtn.addEventListener('click', async () => {
    if (!parsed) return;

    const text = generatePlainTextResume(parsed);
    try {
      await navigator.clipboard.writeText(text);
      const originalText = copyBtn.innerHTML;
      copyBtn.innerHTML = `
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        Copied!
      `;
      setTimeout(() => {
        copyBtn.innerHTML = originalText;
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  });
}

/**
 * Generate plain text version of resume
 * @param {Object} data - Parsed resume data
 * @returns {string} Plain text resume
 */
function generatePlainTextResume(data) {
  const lines = [
    data.name || 'Name',
    `${data.email || ''} | ${data.phone || ''}`,
    '',
    'SKILLS',
    (data.skills || []).join(', '),
    '',
    'EXPERIENCE',
    ...(data.experiences || []),
    '',
    'EDUCATION',
    ...(data.education || ['Education details here']),
  ];
  return lines.join('\n');
}

// File upload handling
$('fileInput').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    $('resumeText').value = event.target.result;
    setStatus(`Loaded: ${file.name}`, 'success');
  };
  reader.onerror = () => {
    setStatus('Error reading file. Please try pasting the text instead.', 'error');
  };
  reader.readAsText(file);
});

// Helper function for preventing defaults
function preventDefaults(e) {
  e.preventDefault();
  e.stopPropagation();
}

// Drag and drop support
const dropZone = $('dropZone');
if (dropZone) {
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach((eventName) => {
    dropZone.addEventListener(eventName, preventDefaults, false);
  });

  ['dragenter', 'dragover'].forEach((eventName) => {
    dropZone.addEventListener(eventName, () => {
      dropZone.classList.add('border-indigo-500', 'bg-indigo-50');
    });
  });

  ['dragleave', 'drop'].forEach((eventName) => {
    dropZone.addEventListener(eventName, () => {
      dropZone.classList.remove('border-indigo-500', 'bg-indigo-50');
    });
  });

  dropZone.addEventListener('drop', (e) => {
    const file = e.dataTransfer.files[0];
    if (file) {
      $('fileInput').files = e.dataTransfer.files;
      const event = new Event('change');
      $('fileInput').dispatchEvent(event);
    }
  });
}

// --- Mock Parsing Logic ---

/**
 * ATS-relevant keywords by category
 */
const ATS_KEYWORDS = {
  technical: [
    'JavaScript',
    'TypeScript',
    'React',
    'Vue',
    'Angular',
    'Node.js',
    'Python',
    'Java',
    'SQL',
    'NoSQL',
    'MongoDB',
    'PostgreSQL',
    'AWS',
    'Azure',
    'GCP',
    'Docker',
    'Kubernetes',
    'CI/CD',
    'Git',
    'REST',
    'GraphQL',
    'API',
    'HTML',
    'CSS',
    'SASS',
    'Tailwind',
    'Next.js',
    'Express',
    'Django',
    'Flask',
    'Spring',
    'Agile',
    'Scrum',
  ],
  soft: [
    'Leadership',
    'Communication',
    'Problem-solving',
    'Teamwork',
    'Collaboration',
    'Mentoring',
    'Project Management',
    'Strategic Planning',
    'Cross-functional',
    'Stakeholder',
  ],
  action: [
    'Developed',
    'Implemented',
    'Designed',
    'Led',
    'Managed',
    'Created',
    'Built',
    'Optimized',
    'Improved',
    'Delivered',
    'Launched',
    'Architected',
    'Scaled',
    'Reduced',
    'Increased',
    'Streamlined',
  ],
  metrics: [
    /\d+%/g, // Percentage
    /\$[\d,]+/g, // Money
    /\d+x/g, // Multiplier
    /\d+\+?\s*(users|customers|clients)/gi, // User counts
    /\d+\s*(ms|seconds|minutes|hours)/gi, // Time improvements
  ],
};

/**
 * Parse resume text and extract structured data
 * @param {string} text - Raw resume text
 * @returns {Object} Parsed resume data
 */
function mockParse(text) {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  // Extract name (usually first line or largest text)
  const name = lines[0] || 'Candidate Name';

  // Extract contact info with improved regex
  const email = (text.match(/[a-z0-9_.+-]+@[a-z0-9-]+\.[a-z0-9-.]+/i) || [
    'candidate@example.com',
  ])[0];
  const phone = (text.match(/(\+?\d[\d\s\-().]{7,}\d)/) || ['(555) 123-4567'])[0];
  const linkedin = (text.match(/linkedin\.com\/in\/[\w-]+/i) || [])[0];
  const portfolio = (text.match(/(?:portfolio|github)\.(?:com|io)\/[\w-]+/i) || [])[0];

  // Extract technical skills with ATS keyword matching
  const technicalSkills = [];
  ATS_KEYWORDS.technical.forEach((skill) => {
    const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    if (regex.test(text)) {
      technicalSkills.push(skill);
    }
  });

  // Extract soft skills
  const softSkills = [];
  ATS_KEYWORDS.soft.forEach((skill) => {
    const regex = new RegExp(`\\b${skill}\\b`, 'gi');
    if (regex.test(text)) {
      softSkills.push(skill);
    }
  });

  // Extract action verbs used
  const actionVerbs = [];
  ATS_KEYWORDS.action.forEach((verb) => {
    const regex = new RegExp(`\\b${verb}\\b`, 'gi');
    if (regex.test(text)) {
      actionVerbs.push(verb);
    }
  });

  // Extract metrics/quantifiable achievements
  const metrics = [];
  ATS_KEYWORDS.metrics.forEach((pattern) => {
    const matches = text.match(pattern);
    if (matches) {
      metrics.push(...matches);
    }
  });

  // Extract experience entries (using simpler pattern matching)
  const experiences = lines
    .filter((l) => /(?:at|@|-|–|•)/.test(l) && l.length > 10 && l.length < 200)
    .slice(0, 6);

  // Extract education
  const educationKeywords = [
    "Bachelor's",
    "Master's",
    'PhD',
    'B.S.',
    'M.S.',
    'B.A.',
    'M.A.',
    'MBA',
    'University',
    'College',
    'Institute',
    'Degree',
  ];
  const education = lines.filter((l) =>
    educationKeywords.some((kw) => l.toLowerCase().includes(kw.toLowerCase()))
  );

  // Calculate various scores
  const skillsScore = Math.min(100, technicalSkills.length * 8 + softSkills.length * 5);
  const actionScore = Math.min(100, actionVerbs.length * 10);
  const metricsScore = Math.min(100, metrics.length * 15);
  const overallScore = Math.round((skillsScore + actionScore + metricsScore) / 3);

  return {
    name,
    email,
    phone,
    linkedin,
    portfolio,
    skills: [...new Set(technicalSkills)],
    softSkills: [...new Set(softSkills)],
    actionVerbs: [...new Set(actionVerbs)],
    metrics: [...new Set(metrics)],
    experiences,
    education,
    scores: {
      overall: Math.max(40, Math.min(95, overallScore + 40)),
      skills: skillsScore,
      action: actionScore,
      metrics: metricsScore,
    },
  };
}

/**
 * Render analysis results
 * @param {Object} data - Parsed resume data
 */
function renderAnalysis(data) {
  const score = data.scores?.overall || 60;

  // Update score visualization
  updateScoreVisualization(score);

  // Render strengths
  const strengths = [];
  if (data.skills?.length >= 5) strengths.push('Strong technical skill set');
  if (data.actionVerbs?.length >= 3) strengths.push('Uses action-oriented language');
  if (data.metrics?.length >= 2) strengths.push('Includes quantifiable achievements');
  if (data.experiences?.length >= 2) strengths.push('Clear experience structure');
  if (data.softSkills?.length >= 2) strengths.push('Demonstrates soft skills');

  strengthsList.innerHTML =
    strengths.length > 0
      ? strengths
          .map(
            (s) => `
      <li class="flex items-start gap-2">
        <svg class="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        <span>${s}</span>
      </li>
    `
          )
          .join('')
      : '<li class="text-slate-400">Parse a resume to see strengths</li>';

  // Render improvement suggestions
  const improvements = [];
  if (data.metrics?.length < 3) {
    improvements.push({
      title: 'Add more metrics',
      detail: 'Quantify achievements with numbers, percentages, or dollar amounts',
      priority: 'high',
    });
  }
  if (data.actionVerbs?.length < 5) {
    improvements.push({
      title: 'Use stronger action verbs',
      detail: 'Start bullets with words like "Developed", "Led", "Implemented"',
      priority: 'medium',
    });
  }
  if (data.skills?.length < 5) {
    improvements.push({
      title: 'Expand skills section',
      detail: 'Include more technical skills relevant to your target role',
      priority: 'medium',
    });
  }
  if (!data.linkedin) {
    improvements.push({
      title: 'Add LinkedIn profile',
      detail: 'Include your LinkedIn URL for professional networking',
      priority: 'low',
    });
  }
  if (data.experiences?.length < 3) {
    improvements.push({
      title: 'Detail work experience',
      detail: 'Add more context to your role descriptions',
      priority: 'medium',
    });
  }

  improvementsList.innerHTML =
    improvements.length > 0
      ? improvements
          .map(
            (imp) => `
      <li class="border-l-2 ${imp.priority === 'high' ? 'border-red-400' : imp.priority === 'medium' ? 'border-amber-400' : 'border-slate-300'} pl-3 py-1">
        <p class="font-medium text-slate-900">${imp.title}</p>
        <p class="text-sm text-slate-600">${imp.detail}</p>
      </li>
    `
          )
          .join('')
      : '<li class="text-slate-400">Great job! No major improvements needed.</li>';

  // Render section-specific analysis
  analysisOut.innerHTML = `
    <div class="space-y-4">
      <div>
        <h4 class="text-sm font-semibold text-slate-700 mb-2">Skills Detected</h4>
        <div class="flex flex-wrap gap-1.5">
          ${(data.skills || [])
            .map(
              (s) => `
            <span class="px-2 py-0.5 bg-indigo-100 text-indigo-800 text-xs rounded-full">${escapeHtml(s)}</span>
          `
            )
            .join('')}
          ${(data.softSkills || [])
            .map(
              (s) => `
            <span class="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-xs rounded-full">${escapeHtml(s)}</span>
          `
            )
            .join('')}
        </div>
      </div>
      
      <div>
        <h4 class="text-sm font-semibold text-slate-700 mb-2">Action Verbs Found</h4>
        <p class="text-sm text-slate-600">
          ${data.actionVerbs?.length > 0 ? data.actionVerbs.slice(0, 8).join(', ') : 'None detected — try adding action-oriented language'}
        </p>
      </div>
      
      <div>
        <h4 class="text-sm font-semibold text-slate-700 mb-2">Quantifiable Metrics</h4>
        <p class="text-sm text-slate-600">
          ${data.metrics?.length > 0 ? data.metrics.slice(0, 6).join(', ') : 'None found — add numbers to strengthen impact'}
        </p>
      </div>
      
      <div class="pt-3 border-t border-slate-200">
        <h4 class="text-sm font-semibold text-slate-700 mb-2">ATS Compatibility</h4>
        <div class="grid grid-cols-2 gap-2">
          ${renderProgressBar('Keywords', data.scores?.skills || 0)}
          ${renderProgressBar('Action Verbs', data.scores?.action || 0)}
          ${renderProgressBar('Metrics', data.scores?.metrics || 0)}
        </div>
      </div>
    </div>
  `;
}

/**
 * Render a progress bar component
 * @param {string} label - Label for the progress bar
 * @param {number} value - Value 0-100
 * @returns {string} HTML string
 */
function renderProgressBar(label, value) {
  const color = value >= 70 ? 'bg-emerald-500' : value >= 40 ? 'bg-amber-500' : 'bg-red-500';
  return `
    <div>
      <div class="flex justify-between text-xs text-slate-600 mb-1">
        <span>${label}</span>
        <span>${value}%</span>
      </div>
      <div class="h-2 bg-slate-200 rounded-full overflow-hidden">
        <div class="h-full ${color} rounded-full transition-all duration-500" style="width: ${value}%"></div>
      </div>
    </div>
  `;
}

/**
 * Render resume preview
 * @param {Object} data - Parsed resume data
 * @returns {string} HTML string
 */
function renderPreview(data) {
  const exp = (data.experiences || []).map((e) => `<li>${escapeHtml(e)}</li>`).join('');
  const edu = (data.education || []).map((e) => `<li>${escapeHtml(e)}</li>`).join('');

  return `
    <article class="resume-preview bg-white border border-slate-200 rounded-xl overflow-hidden" role="document" aria-label="Resume Preview">
      <!-- Header -->
      <header class="bg-gradient-to-r from-slate-800 to-slate-700 text-white p-6">
        <h1 class="text-2xl font-bold tracking-tight">${escapeHtml(data.name || 'Candidate Name')}</h1>
        <div class="flex flex-wrap gap-4 mt-2 text-sm text-slate-300">
          ${data.email ? `<span class="flex items-center gap-1"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>${escapeHtml(data.email)}</span>` : ''}
          ${data.phone ? `<span class="flex items-center gap-1"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>${escapeHtml(data.phone)}</span>` : ''}
          ${data.linkedin ? `<span class="flex items-center gap-1"><svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>${escapeHtml(data.linkedin)}</span>` : ''}
        </div>
      </header>
      
      <!-- Content -->
      <div class="p-6 space-y-5">
        <!-- Skills -->
        <section aria-labelledby="skills-heading">
          <h2 id="skills-heading" class="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-1 mb-3">Skills</h2>
          <div class="flex flex-wrap gap-2">
            ${(data.skills || [])
              .map(
                (s) =>
                  `<span class="px-2 py-1 bg-slate-100 text-slate-700 text-sm rounded-md">${escapeHtml(s)}</span>`
              )
              .join('')}
            ${(data.softSkills || [])
              .map(
                (s) =>
                  `<span class="px-2 py-1 bg-indigo-50 text-indigo-700 text-sm rounded-md">${escapeHtml(s)}</span>`
              )
              .join('')}
          </div>
        </section>
        
        <!-- Experience -->
        <section aria-labelledby="experience-heading">
          <h2 id="experience-heading" class="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-1 mb-3">Experience</h2>
          <ul class="space-y-2 text-sm text-slate-700">
            ${exp || '<li class="text-slate-400">No experience entries detected</li>'}
          </ul>
        </section>
        
        <!-- Education -->
        <section aria-labelledby="education-heading">
          <h2 id="education-heading" class="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-1 mb-3">Education</h2>
          <ul class="space-y-2 text-sm text-slate-700">
            ${edu || '<li class="text-slate-400">No education entries detected</li>'}
          </ul>
        </section>
      </div>
    </article>
  `;
}

/**
 * Optimize resume for a target role
 * @param {Object} data - Parsed resume data
 * @param {string} role - Target role
 * @returns {Object} Optimized resume data
 */
function mockOptimize(data, role) {
  const roleLower = role.toLowerCase();

  // Role-specific skill suggestions
  const roleSkillMap = {
    'front-end': ['React', 'Vue', 'TypeScript', 'CSS', 'Accessibility (WCAG)', 'Performance'],
    frontend: ['React', 'Vue', 'TypeScript', 'CSS', 'Accessibility (WCAG)', 'Performance'],
    'back-end': ['Node.js', 'Python', 'SQL', 'API Design', 'Microservices', 'Docker'],
    backend: ['Node.js', 'Python', 'SQL', 'API Design', 'Microservices', 'Docker'],
    fullstack: ['React', 'Node.js', 'TypeScript', 'SQL', 'REST API', 'Docker'],
    'full-stack': ['React', 'Node.js', 'TypeScript', 'SQL', 'REST API', 'Docker'],
    devops: ['Docker', 'Kubernetes', 'CI/CD', 'AWS', 'Terraform', 'Linux'],
    data: ['Python', 'SQL', 'Machine Learning', 'Statistics', 'Pandas', 'TensorFlow'],
    manager: ['Project Management', 'Agile', 'Leadership', 'Stakeholder Management', 'Mentoring'],
    product: ['Product Strategy', 'User Research', 'Agile', 'Roadmapping', 'Analytics'],
  };

  // Find matching role skills
  let additionalSkills = [];
  for (const [key, skills] of Object.entries(roleSkillMap)) {
    if (roleLower.includes(key)) {
      additionalSkills = skills;
      break;
    }
  }

  // Default suggestions if no match
  if (additionalSkills.length === 0) {
    additionalSkills = ['Problem Solving', 'Communication', 'Technical Leadership'];
  }

  // Merge skills without duplicates
  const mergedSkills = [...new Set([...(data.skills || []), ...additionalSkills])];

  // Boost scores for optimization
  const boostedScores = {
    overall: Math.min(95, (data.scores?.overall || 60) + 15),
    skills: Math.min(100, (data.scores?.skills || 50) + 20),
    action: Math.min(100, (data.scores?.action || 50) + 10),
    metrics: data.scores?.metrics || 50,
  };

  return {
    ...data,
    skills: mergedSkills,
    scores: boostedScores,
    optimizedFor: role,
  };
}

/**
 * Wrap preview in full HTML document for download
 * @param {string} inner - Inner HTML content
 * @returns {string} Complete HTML document
 */
function wrapHtml(inner) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Resume — Generated by ResumeCraft</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body class="bg-white text-slate-900">
  <main class="max-w-3xl mx-auto p-6">${inner}</main>
</body>
</html>`;
}

/**
 * Escape HTML special characters
 * @param {string} s - String to escape
 * @returns {string} Escaped string
 */
function escapeHtml(s) {
  return (s || '').replace(
    /[&<>"']/g,
    (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m]
  );
}
