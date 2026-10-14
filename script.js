// BRAND NAME: change here to rebrand everywhere tagged with data-brand
const BRAND = "Fairway Found";
document.querySelectorAll("[data-brand]").forEach(el => el.textContent = BRAND);
document.getElementById("yr").textContent = new Date().getFullYear();

const btn = document.querySelector(".menu-btn"), links = document.querySelector(".links");
btn.addEventListener("click", () => { const o = links.classList.toggle("open"); btn.setAttribute("aria-expanded", o); });
links.querySelectorAll("a").forEach(a => a.addEventListener("click", () => links.classList.remove("open")));

// Form: no real submission. Wire up here with fetch("YOUR_ENDPOINT", {method:"POST", body:new FormData(form)})
/* v1 audit handler replaced by scorecard below */ const form = { addEventListener(){} };
form.addEventListener("submit", e => {
  e.preventDefault();
  if (!form.checkValidity()) { form.reportValidity(); return; }
  document.getElementById("form-fields").hidden = true;
  document.getElementById("thanks").hidden = false;
});

// Animated storyboard explainer (~30s, 4 scenes x 7.5s)
(() => {
  const p = document.getElementById("player"); if (!p) return; const scenes = p.querySelectorAll(".scene"),
        dots = p.querySelectorAll(".dots b"), prog = document.getElementById("prog"),
        play = document.getElementById("play"), DUR = 30000;
  let start = null, raf;
  const show = i => { scenes.forEach((s,k)=>s.classList.toggle("on",k===i)); dots.forEach((d,k)=>d.classList.toggle("on",k===i)); };
  show(0);
  const tick = t => {
    if (!start) start = t;
    const e = t - start, f = Math.min(e / DUR, 1);
    prog.style.width = f * 100 + "%"; show(Math.min(3, Math.floor(f * 4)));
    if (f < 1) raf = requestAnimationFrame(tick);
    else { p.classList.remove("playing"); p.classList.add("done"); play.querySelector("em").textContent = "Replay walkthrough"; }
  };
  play.addEventListener("click", () => { cancelAnimationFrame(raf); start = null; p.classList.add("playing"); raf = requestAnimationFrame(tick); });
  dots.forEach((d,i)=>d.addEventListener("click",()=>{ if(p.classList.contains("playing")){ start = performance.now() - i*DUR/4; } else show(i); }));
})();

// ===== v2 features =====
const $ = s => document.querySelector(s);
const money = n => "$" + Math.round(n).toLocaleString();

// --- Lead storage. FUTURE BACKEND HOOK: set LEAD_ENDPOINT to your CRM/webhook URL (Zapier, HubSpot, Formspree, etc.)
const LEAD_ENDPOINT = ""; // e.g. "https://hooks.zapier.com/hooks/catch/XXXX/YYYY"
function submitLead(kind, data) {
  const lead = { kind, ...data, ts: new Date().toISOString(), page: location.pathname };
  try { const all = JSON.parse(localStorage.getItem("ff_leads") || "[]"); all.push(lead); localStorage.setItem("ff_leads", JSON.stringify(all)); } catch (e) {}
  if (LEAD_ENDPOINT) fetch(LEAD_ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(lead) }).catch(() => {});
  return lead;
}

// --- Readiness checklist (saved in localStorage)
(() => {
  const box = $("#ready"); if (!box) return;
  const cbs = [...box.querySelectorAll("input")], saved = JSON.parse(localStorage.getItem("ff_ready") || "[]");
  cbs.forEach(c => c.checked = saved.includes(c.value));
  const upd = () => {
    const on = cbs.filter(c => c.checked), pct = Math.round(on.length / cbs.length * 100);
    $("#ready-meter i").style.width = pct + "%"; $("#ready-meter").setAttribute("aria-valuenow", pct);
    $("#ready-msg").textContent = `${on.length} of ${cbs.length} ready (${pct}%). ` +
      (pct >= 80 ? "You're well set up for direct bookings. Next: grow your AI and Google search visibility." : pct >= 50 ? "Solid base. Fill the remaining gaps to capture more bookings from search." : "Start with your booking engine and Google profile.");
    localStorage.setItem("ff_ready", JSON.stringify(on.map(c => c.value)));
  };
  box.addEventListener("change", upd); upd();
})();

// --- SEO audit scorecard (self-assessment, does NOT crawl the site)
const QUESTIONS = [
  ["ai", "When you ask ChatGPT, Claude, Gemini, Grok, or Perplexity for the best public golf near your city, does your course show up?", 12, "Make your course AI-ready: answer-ready Q&A pages, full structured data, and consistent listings. Try the question yourself monthly, or let us track it for you."],
  ["gbp", "Is your Google Business Profile claimed and verified?", 12, "Claim and verify your Google Business Profile. It's the #1 local search asset."],
  ["gbpbook", "Does the booking button/link on your Google profile go to your own booking page?", 12, "Point your Google booking link to your own engine (and check Reserve with Google eligibility)."],
  ["sitebtn", "Is a 'Book a tee time' button visible on every page of your site?", 10, "Add a persistent booking button in your header on every page."],
  ["mobile", "Does your site load fast on a phone (around 3 seconds or less)?", 6, "Test with Google PageSpeed Insights and compress images or upgrade hosting."],
  ["reviews", "Do you have 100+ Google reviews averaging 4.3 stars or higher?", 10, "Ask for reviews after every round via email/SMS, and reply to every review."],
  ["recent", "Do you respond to reviews and post Google updates at least monthly?", 4, "Post weekly Google updates (specials, conditions) and respond to all reviews."],
  ["schema", "Does your site use structured data (schema) for your golf course?", 8, "Add GolfCourse/LocalBusiness schema with hours, address, and rates."],
  ["local", "Do you have pages for rates, leagues, lessons, and events?", 8, "Build dedicated pages that match what golfers search for."],
  ["nap", "Are your name, address, and phone identical across Google, Yelp, Apple Maps, and your site?", 6, "Fix inconsistent listings so search engines trust your location data."],
  ["analytics", "Do you track completed online bookings in analytics?", 12, "Set up booking conversion tracking so you can see which channels drive rounds."]
];
(() => {
  const lf = $("#audit-form"); if (!lf) return;
  let lead;
  lf.addEventListener("submit", e => {
    e.preventDefault();
    if (!lf.checkValidity()) { $("#audit-err").hidden = false; lf.reportValidity(); return; }
    $("#audit-err").hidden = true;
    lead = submitLead("seo_scorecard", Object.fromEntries(new FormData(lf)));
    lf.hidden = true; $("#q-course").textContent = lead.course;
    $("#q-list").innerHTML = QUESTIONS.map(([k, q], i) => `<div class="q"><span id="ql-${k}">${i + 1}. ${q}</span><fieldset aria-labelledby="ql-${k}"><label><input type="radio" name="${k}" value="1" required> Yes</label><label><input type="radio" name="${k}" value="0"> No</label></fieldset></div>`).join("");
    $("#quiz").hidden = false; $("#quiz input").focus();
  });
  $("#quiz").addEventListener("submit", e => {
    e.preventDefault(); const q = e.target;
    if (!q.checkValidity()) { q.reportValidity(); return; }
    let score = 0; const recs = [];
    QUESTIONS.forEach(([k, txt, w, fix]) => { const yes = q[k].value === "1"; if (yes) score += w; recs.push(yes ? `<li class="ok">✓ ${txt.replace(/\?$/, "")}: good.</li>` : `<li class="fix">✗ ${fix}</li>`); });
    const g = score >= 90 ? "A" : score >= 75 ? "B" : score >= 60 ? "C" : score >= 40 ? "D" : "F";
    const summary = { A: "Excellent foundation. Focus on content, reviews, and local pages to stay first in search.", B: "Strong, with a few gaps holding back direct bookings.", C: "Average. Several fixes could lift direct bookings.", D: "Significant gaps. Golfers may be booking elsewhere.", F: "Major opportunity. Start with Google and your booking path." }[g];
    recs.sort((a, b) => a.includes('"fix"') ? -1 : 1);
    submitLead("seo_scorecard_result", { email: lead.email, course: lead.course, score, grade: g });
    q.hidden = true;
    const sc = $("#scorecard"); sc.hidden = false;
    sc.innerHTML = `<div class="grade"><b>${g}</b><div><h3>${lead.course}: ${score}/100</h3><p>${summary}</p></div></div>
      <p class="fine">Self-assessment based on your answers. We did not scan or crawl ${lead.website}.</p>
      <ul class="recs">${recs.join("")}</ul>
      <p><a class="btn btn-gold full" href="#pricing">See our $1,500/mo plan, first month free</a></p>
      <p class="fine">${lead.manual ? "A strategist will follow up about your manual review." : "Want a full manual review? Reply to our follow-up email."}</p>`;
    sc.focus?.();
  });
})();

