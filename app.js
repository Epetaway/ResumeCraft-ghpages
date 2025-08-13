// ResumeCraft Demo (static, no server). All logic runs in-browser.
const $ = (id) => document.getElementById(id);
const statusEl = $("status");
const parsedOut = $("parsedOut");
const analysisOut = $("analysisOut");
const previewEl = $("preview");
const printEl = $("printResume");

let parsed = null;

function setStatus(msg) {
  statusEl.textContent = msg || "";
}

$("clearAll").addEventListener("click", () => {
  $("fileInput").value = "";
  $("resumeText").value = "";
  $("targetRole").value = "";
  parsed = null;
  parsedOut.textContent = "";
  analysisOut.innerHTML = "<p>Awaiting resume…</p>";
  previewEl.innerHTML = "<p>Paste a resume and click Parse to see a formatted preview here.</p>";
  setStatus("");
});

$("parseBtn").addEventListener("click", async () => {
  setStatus("Parsing resume (mock)…");
  const text = $("resumeText").value.trim();
  if (!text) {
    setStatus("Paste some resume text first.");
    return;
  }
  parsed = mockParse(text);
  parsedOut.textContent = JSON.stringify(parsed, null, 2);
  analysisOut.innerHTML = renderAnalysis(parsed);
  previewEl.innerHTML = renderPreview(parsed);
  setStatus("Parsed.");
});

$("optimizeBtn").addEventListener("click", () => {
  if (!parsed) {
    setStatus("Parse a resume first.");
    return;
  }
  const role = $("targetRole").value.trim() || "Target Role";
  const optimized = mockOptimize(parsed, role);
  parsedOut.textContent = JSON.stringify(optimized, null, 2);
  analysisOut.innerHTML = renderAnalysis(optimized);
  previewEl.innerHTML = renderPreview(optimized);
  setStatus(`Optimized for “${role}”.`);
});

$("printBtn").addEventListener("click", () => {
  if (!parsed) {
    setStatus("Parse a resume first.");
    return;
  }
  $("printable").classList.remove("hidden");
  $("printResume").innerHTML = renderPreview(parsed);
  window.print();
  setTimeout(() => $("printable").classList.add("hidden"), 300);
});

$("downloadHtml").addEventListener("click", () => {
  if (!parsed) {
    setStatus("Parse a resume first.");
    return;
  }
  const blob = new Blob([wrapHtml(renderPreview(parsed))], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "resume.html";
  a.click();
  URL.revokeObjectURL(url);
});

// --- Mock logic ---
function mockParse(text) {
  // Extremely naive "parsing" to demonstrate UI behavior without a server
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const name = lines[0] || "Candidate Name";
  const email = (text.match(/[a-z0-9_.+-]+@[a-z0-9-]+\.[a-z0-9-.]+/i) || ["candidate@example.com"])[0];
  const phone = (text.match(/(\+?\d[\d\s\-().]{7,}\d)/) || ["(555) 123-4567"])[0];
  const skills = Array.from(new Set((text.match(/\b(JavaScript|TypeScript|React|Node|CSS|HTML|Tailwind|Next\.js|SQL)\b/gi) || []))).slice(0, 10);
  const experiences = lines.filter(l => / at | - /.test(l)).slice(0, 5);
  return { name, email, phone, skills, experiences };
}

function renderAnalysis(data) {
  const score = Math.min(100, 60 + (data.skills?.length || 0) * 4);
  const strengths = (data.skills || []).slice(0, 3);
  const weaknesses = ["Add quantified impact", "Tailor to role", "Tighten summary"];
  const improvements = ["Use active verbs", "Add metrics (+%, -ms, $)", "Match job keywords"];
  return `
    <div class="space-y-1">
      <p><strong>Overall Score:</strong> ${score}/100</p>
      <p><strong>Strengths:</strong> ${strengths.join(", ") || "–"}</p>
      <p><strong>Weaknesses:</strong> ${weaknesses.join(", ")}</p>
      <p><strong>Suggested Improvements:</strong> ${improvements.join("; ")}</p>
    </div>
  `;
}

function renderPreview(data) {
  const exp = (data.experiences || []).map((e) => `<li>${escapeHtml(e)}</li>`).join("");
  const skills = (data.skills || []).join(" • ");
  return `
    <section class="bg-white border border-slate-200 rounded-xl p-6">
      <h1 class="text-2xl font-bold">${escapeHtml(data.name || "Candidate Name")}</h1>
      <p class="text-sm text-slate-600">${escapeHtml(data.email || "")} • ${escapeHtml(data.phone || "")}</p>
      <hr class="my-4" />
      <h2 class="text-lg font-semibold">Skills</h2>
      <p class="text-sm">${escapeHtml(skills)}</p>
      <h2 class="text-lg font-semibold mt-4">Experience</h2>
      <ul class="list-disc pl-6 text-sm">${exp || "<li>Role — Company — Impact</li>"}</ul>
    </section>
  `;
}

function mockOptimize(data, role) {
  const extra = role.toLowerCase().includes("front") ? ["Accessibility (WCAG)", "React Performance"] : ["Project Leadership", "Stakeholder Management"];
  const skills = Array.from(new Set([...(data.skills || []), ...extra]));
  return { ...data, skills };
}

function wrapHtml(inner) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Resume</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tailwindcss/typography@0.5.10/dist/typography.min.css" />
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-white text-slate-900">
  <main class="max-w-3xl mx-auto p-6 prose prose-slate">${inner}</main>
</body>
</html>`;
}

function escapeHtml(s) { return (s || "").replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
