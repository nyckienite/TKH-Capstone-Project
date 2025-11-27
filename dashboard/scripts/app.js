// scripts/app.js

// --------------------------- Config ---------------------------

const JOBS_CSV = "data/Cleaned_DS_Jobs_enriched.csv";
const PROGRAMS_CSV = "data/Programs.csv";

const SKILL_COLS = ["python", "excel", "hadoop", "spark", "aws", "tableau", "big_data"];

// --------------------------- State ----------------------------

let jobs = [];
let programs = [];

document.addEventListener("DOMContentLoaded", () => {
  setupNavigation();
  loadAllData();
});

// ---------------------- Data Loading --------------------------

function loadAllData() {
  loadCsv(JOBS_CSV, (rows) => {
    jobs = rows.filter((r) => r["Job Title"]); // basic sanity filter
    initDashboardIfReady();
  });

  loadCsv(PROGRAMS_CSV, (rows) => {
    programs = rows.filter((r) => r.Program || r.program_name);
    initDashboardIfReady();
  });
}

function loadCsv(path, callback) {
  Papa.parse(path, {
    download: true,
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
    complete: (results) => callback(results.data || []),
    error: (err) => {
      console.error("Error loading CSV:", path, err);
    },
  });
}

function initDashboardIfReady() {
  if (!jobs.length || !programs.length) return;

  // PAGE 1
  renderStatePostings();
  renderUrbanChart();
  renderPlatformCoverage();
  renderRegionSkills();
  setupPlatformRecommendation();

  // PAGE 2
  renderLevelEducationExperience();
  renderResponsibilityIndex();
  renderMonthlyTrend();

  // PAGE 3
  renderAiMentionsSalary();
  renderRoleOverlap();
  renderRemoteSkillPatterns();

  // PAGE 4
  renderSkillsOverTime();
  renderTopSkillCard();
  renderSkillSalary();
  renderSkillCombosSalary();
  renderLangRoleHeatmap();

  // PAGE 5
  renderSalaryByRegionLevel();
  renderSalaryByIndustry();
  renderOpennessToNontraditional();
  renderCompanySizeBreadth();

  // PAGE 6
  renderProgramAlignmentRadar();
  renderTaughtVsDemandedSkills();
  renderIndustryEducationGap();
  setupCandidateFitSimulator();
}

// ---------------------- Navigation ----------------------------

function setupNavigation() {
  const links = document.querySelectorAll(".nav a");
  const pages = document.querySelectorAll(".page");

  function showPage(hash) {
    const targetId = (hash || "#home").replace("#", "");
    pages.forEach((p) => p.classList.remove("active"));
    links.forEach((l) => l.classList.remove("active"));
    const page = document.getElementById(targetId) || document.getElementById("home");
    page.classList.add("active");
    links.forEach((l) => {
      if (l.getAttribute("href") === `#${targetId}`) l.classList.add("active");
    });
  }

  links.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const hash = link.getAttribute("href");
      history.replaceState(null, "", hash);
      showPage(hash);
    });
  });

  // initial
  showPage(location.hash || "#home");
}

// ---------------------- Helper Utils --------------------------

function groupBy(arr, keyFn) {
  const map = new Map();
  arr.forEach((item) => {
    const key = keyFn(item);
    if (key === undefined || key === null || key === "") return;
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(item);
  });
  return map;
}

function median(values) {
  const arr = values.filter((v) => typeof v === "number" && !Number.isNaN(v));
  if (!arr.length) return null;
  arr.sort((a, b) => a - b);
  const mid = Math.floor(arr.length / 2);
  return arr.length % 2 ? arr[mid] : (arr[mid - 1] + arr[mid]) / 2;
}

function average(values) {
  const arr = values.filter((v) => typeof v === "number" && !Number.isNaN(v));
  if (!arr.length) return null;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function clearAndNote(divId, note) {
  const el = document.getElementById(divId);
  if (!el) return;
  el.innerHTML = `<p class="small muted">${note}</p>`;
}

// quick boolean-ish helper (for skill flags)
function isTrue(val) {
  return val === 1 || val === true || val === "1" || val === "Y" || val === "Yes";
}

// ---------------------- PAGE 1 -------------------------------

function renderStatePostings() {
  const byState = groupBy(jobs, (r) => r.job_state);
  if (!byState.size) {
    clearAndNote("chart_state_postings", "No state information found in dataset.");
    return;
  }

  const states = [];
  const counts = [];
  byState.forEach((rows, state) => {
    states.push(state);
    counts.push(rows.length);
  });

  Plotly.newPlot(
    "chart_state_postings",
    [{ x: states, y: counts, type: "bar" }],
    {
      margin: { t: 10 },
      xaxis: { title: "State / Region" },
      yaxis: { title: "Number of Postings" },
    },
    { responsive: true }
  );
}

function renderUrbanChart() {
  const withFlag = jobs.filter((r) => r.is_urban);
  if (!withFlag.length) {
    clearAndNote(
      "chart_urban",
      "This sample dataset does not yet include an urban / non-urban flag. Add an `is_urban` column to unlock this chart."
    );
    return;
  }

  const byFlag = groupBy(withFlag, (r) => r.is_urban);
  const labels = [];
  const values = [];
  byFlag.forEach((rows, flag) => {
    labels.push(flag);
    values.push(rows.length);
  });

  Plotly.newPlot(
    "chart_urban",
    [{ labels, values, type: "pie", hole: 0.5 }],
    { margin: { t: 10 } },
    { responsive: true }
  );
}

function renderPlatformCoverage() {
  const withPlatform = jobs.filter((r) => r.platform);
  if (!withPlatform.length) {
    clearAndNote(
      "chart_platforms",
      "Platforms are not tracked in this dataset. Add a `platform` column (e.g., LinkedIn, Indeed) to see coverage vs salary."
    );
    return;
  }

  const grouped = groupBy(withPlatform, (r) => r.platform);
  const platforms = [];
  const counts = [];
  const salaries = [];

  grouped.forEach((rows, platform) => {
    platforms.push(platform);
    counts.push(rows.length);
    salaries.push(average(rows.map((r) => r.avg_salary)));
  });

  const trace1 = {
    x: platforms,
    y: counts,
    name: "Postings",
    type: "bar",
    yaxis: "y1",
  };

  const trace2 = {
    x: platforms,
    y: salaries,
    name: "Median Salary",
    type: "scatter",
    mode: "lines+markers",
    yaxis: "y2",
  };

  Plotly.newPlot(
    "chart_platforms",
    [trace1, trace2],
    {
      margin: { t: 10 },
      xaxis: { title: "Platform" },
      yaxis: { title: "# of Postings" },
      yaxis2: {
        title: "Median Salary",
        overlaying: "y",
        side: "right",
      },
      legend: { orientation: "h" },
    },
    { responsive: true }
  );
}

function renderRegionSkills() {
  const byState = groupBy(jobs, (r) => r.job_state);
  if (!byState.size) {
    clearAndNote("chart_region_skills", "No state information found in dataset.");
    return;
  }

  const states = Array.from(byState.keys());
  const skillCounts = {};
  SKILL_COLS.forEach((sk) => (skillCounts[sk] = []));

  states.forEach((state) => {
    const rows = byState.get(state);
    SKILL_COLS.forEach((sk) => {
      const count = rows.filter((r) => isTrue(r[sk])).length;
      skillCounts[sk].push(count);
    });
  });

  const traces = SKILL_COLS.map((sk) => ({
    x: states,
    y: skillCounts[sk],
    type: "bar",
    name: sk,
  }));

  Plotly.newPlot(
    "chart_region_skills",
    traces,
    {
      barmode: "stack",
      margin: { t: 10 },
      xaxis: { title: "State / Region" },
      yaxis: { title: "Skill mentions in job posts" },
    },
    { responsive: true }
  );
}

function setupPlatformRecommendation() {
  const input = document.getElementById("skillsInput");
  const btn = document.getElementById("btnRecommend");
  const out = document.getElementById("llmReco");
  if (!input || !btn || !out) return;

  btn.addEventListener("click", () => {
    const text = (input.value || "").toLowerCase();
    if (!text.trim()) {
      out.innerHTML = `<p class="small">Type at least one skill to get a rough suggestion.</p>`;
      return;
    }
    const skills = text
      .split(/[,\s]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    // naive heuristic: count rows that mention any of those skills in the description
    const matches = jobs.filter((r) => {
      const desc = (r["Job Description"] || "").toLowerCase();
      return skills.some((sk) => desc.includes(sk));
    });

    const byPlatform = groupBy(matches, (r) => r.platform || "Unknown");
    const summary = [];
    byPlatform.forEach((rows, platform) => {
      summary.push({
        platform,
        count: rows.length,
        medianSalary: median(rows.map((r) => r.avg_salary)),
      });
    });
    summary.sort((a, b) => b.count - a.count);

    const best = summary[0];
    const lines = summary
      .map(
        (s) =>
          `${s.platform}: ${s.count} postings, median salary ~$${Math.round(
            s.medianSalary || 0
          ).toLocaleString()}`
      )
      .join("<br>");

    out.innerHTML = `
      <p class="small"><strong>Quick read:</strong> Based on the skills you typed, the most active platform in this dataset is <strong>${
        best ? best.platform : "N/A"
      }</strong>.</p>
      <p class="small">${lines}</p>
    `;
  });
}

// ---------------------- PAGE 2 -------------------------------

function renderLevelEducationExperience() {
  const withSeniority = jobs.filter((r) => r.seniority);
  if (!withSeniority.length) {
    clearAndNote(
      "chart_level_exp",
      "No seniority labels found. Add a `seniority` column with values like jr / mid / senior."
    );
    return;
  }

  const grouped = groupBy(withSeniority, (r) => r.seniority);
  const levels = [];
  const avgExp = [];
  const pctGrad = [];

  grouped.forEach((rows, level) => {
    levels.push(level);
    const exps = rows.map((r) => r.min_experience_years);
    avgExp.push(average(exps) || 0);

    const gradCount = rows.filter((r) =>
      ["MS", "PhD", "MSc", "M.S"].includes(r.degree_required)
    ).length;
    pctGrad.push(rows.length ? (gradCount / rows.length) * 100 : 0);
  });

  const bar = {
    x: levels,
    y: avgExp,
    name: "Avg Experience (yrs)",
    type: "bar",
    yaxis: "y1",
  };

  const line = {
    x: levels,
    y: pctGrad,
    name: "% requiring grad degree",
    type: "scatter",
    mode: "lines+markers",
    yaxis: "y2",
  };

  Plotly.newPlot(
    "chart_level_exp",
    [bar, line],
    {
      margin: { t: 10 },
      xaxis: { title: "Level (seniority)" },
      yaxis: { title: "Avg years of experience (min_experience_years)" },
      yaxis2: {
        title: "% of postings (grad degree required)",
        overlaying: "y",
        side: "right",
      },
      legend: { orientation: "h" },
    },
    { responsive: true }
  );
}

function renderResponsibilityIndex() {
  const withSeniority = jobs.filter((r) => r.seniority && r["Job Description"]);
  if (!withSeniority.length) {
    clearAndNote(
      "chart_responsibility",
      "Missing either `seniority` or `Job Description` for most rows."
    );
    return;
  }

  const grouped = groupBy(withSeniority, (r) => r.seniority);
  const levels = [];
  const indexVals = [];

  grouped.forEach((rows, level) => {
    levels.push(level);
    const lengths = rows.map((r) => (r["Job Description"] || "").length);
    indexVals.push(average(lengths) || 0);
  });

  Plotly.newPlot(
    "chart_responsibility",
    [{ x: levels, y: indexVals, type: "bar" }],
    {
      margin: { t: 10 },
      xaxis: { title: "Level (seniority)" },
      yaxis: { title: "Responsibility index (avg description length)" },
    },
    { responsive: true }
  );
}

function renderMonthlyTrend() {
  const withMonth = jobs.filter((r) => r.posting_month);
  if (!withMonth.length) {
    clearAndNote(
      "chart_trend",
      "This dataset does not include posting dates, so we cannot show a monthly trend. Add a `posting_month` column (e.g., 2025-01)."
    );
    return;
  }

  const grouped = groupBy(withMonth, (r) => r.posting_month);
  const months = Array.from(grouped.keys()).sort();
  const counts = months.map((m) => grouped.get(m).length);

  Plotly.newPlot(
    "chart_trend",
    [{ x: months, y: counts, type: "scatter", mode: "lines+markers" }],
    {
      margin: { t: 10 },
      xaxis: { title: "Month" },
      yaxis: { title: "# of Postings" },
    },
    { responsive: true }
  );
}

// ---------------------- PAGE 3 -------------------------------

function renderAiMentionsSalary() {
  let rows = jobs;
  if (!rows.length) {
    clearAndNote("chart_ai_mentions", "No job rows available.");
    return;
  }

  // Either use explicit ai_mentioned column or infer from description
  const enriched = rows.map((r) => {
    let flag = r.ai_mentioned;
    if (flag === undefined || flag === null || flag === "") {
      const desc = (r["Job Description"] || "").toLowerCase();
      flag = desc.includes(" ai ") ||
        desc.includes("artificial intelligence") ||
        desc.includes("machine learning");
      flag = flag ? 1 : 0;
    }
    return { ...r, aiFlag: flag };
  });

  const ai = enriched.filter((r) => r.aiFlag === 1);
  const noAi = enriched.filter((r) => r.aiFlag === 0);

  const medAi = median(ai.map((r) => r.avg_salary)) || 0;
  const medNoAi = median(noAi.map((r) => r.avg_salary)) || 0;

  Plotly.newPlot(
    "chart_ai_mentions",
    [
      {
        x: ["AI mentioned", "No AI mention"],
        y: [medAi, medNoAi],
        type: "bar",
      },
    ],
    {
      margin: { t: 10 },
      xaxis: { title: "Posting Type" },
      yaxis: { title: "Median Skill Salary" },
    },
    { responsive: true }
  );
}

function renderRoleOverlap() {
  const grouped = groupBy(jobs, (r) => r.job_simp || "Other");
  if (!grouped.size) {
    clearAndNote(
      "chart_overlap",
      "No simplified job titles found. Add a `job_simp` column for high-level roles."
    );
    return;
  }

  const labels = [];
  const values = [];
  grouped.forEach((rows, label) => {
    labels.push(label);
    values.push(rows.length);
  });

  Plotly.newPlot(
    "chart_overlap",
    [{ labels, values, type: "pie" }],
    { margin: { t: 10 } },
    { responsive: true }
  );
}

function renderRemoteSkillPatterns() {
  const withSetting = jobs.filter((r) => r.work_setting);
  if (!withSetting.length) {
    clearAndNote(
      "chart_remote_skills",
      "No `work_setting` column found. Add values like Remote / Hybrid / Onsite to unlock this chart."
    );
    return;
  }

  const settings = ["Remote", "Hybrid", "Onsite"];
  const traces = [];

  settings.forEach((setting) => {
    const subset = withSetting.filter(
      (r) => (r.work_setting || "").toLowerCase() === setting.toLowerCase()
    );
    if (!subset.length) return;

    const counts = SKILL_COLS.map(
      (sk) => subset.filter((r) => isTrue(r[sk])).length
    );

    traces.push({
      x: SKILL_COLS,
      y: counts,
      type: "bar",
      name: setting,
    });
  });

  if (!traces.length) {
    clearAndNote(
      "chart_remote_skills",
      "No Remote / Hybrid / Onsite categories found in `work_setting`."
    );
    return;
  }

  Plotly.newPlot(
    "chart_remote_skills",
    traces,
    {
      barmode: "group",
      margin: { t: 10 },
      xaxis: { title: "Skill" },
      yaxis: { title: "Mentions in job posts" },
    },
    { responsive: true }
  );
}

// ---------------------- PAGE 4 -------------------------------

function renderSkillsOverTime() {
  const withMonth = jobs.filter((r) => r.posting_month);
  const targetSkills = ["python", "excel", "aws", "tableau"];

  if (!withMonth.length) {
    clearAndNote(
      "chart_skills_time",
      "This dataset does not include posting dates, so we cannot show skill trends over time. Add `posting_month`."
    );
    return;
  }

  const months = Array.from(groupBy(withMonth, (r) => r.posting_month).keys()).sort();

  const traces = targetSkills.map((sk) => {
    const y = months.map((m) => {
      const rows = withMonth.filter((r) => r.posting_month === m);
      return rows.filter((r) => isTrue(r[sk])).length;
    });
    return { x: months, y, type: "scatter", mode: "lines+markers", name: sk };
  });

  Plotly.newPlot(
    "chart_skills_time",
    traces,
    {
      margin: { t: 10 },
      xaxis: { title: "Month" },
      yaxis: { title: "Mentions in job posts" },
    },
    { responsive: true }
  );
}

function renderTopSkillCard() {
  const container = document.getElementById("chart_top_skill");
  if (!container) return;

  let bestSkill = null;
  let bestCount = -1;

  SKILL_COLS.forEach((sk) => {
    const count = jobs.filter((r) => isTrue(r[sk])).length;
    if (count > bestCount) {
      bestCount = count;
      bestSkill = sk;
    }
  });

  if (!bestSkill) {
    container.innerHTML = `<p class="small">No skills found in data.</p>`;
    return;
  }

  container.innerHTML = `
    <p class="small"><strong>Most frequently requested skill:</strong></p>
    <h2 style="margin:4px 0;">${bestSkill.toUpperCase()}</h2>
    <p class="small">Appears in ${bestCount} postings (raw count).</p>
  `;
}

function renderSkillSalary() {
  if (!jobs.length) {
    clearAndNote("chart_skill_salary", "No job rows available.");
    return;
  }

  const skills = [];
  const medSalaries = [];

  SKILL_COLS.forEach((sk) => {
    const subset = jobs.filter((r) => isTrue(r[sk]));
    if (!subset.length) return;
    skills.push(sk);
    medSalaries.push(median(subset.map((r) => r.avg_salary)) || 0);
  });

  if (!skills.length) {
    clearAndNote("chart_skill_salary", "No skill flags found in dataset.");
    return;
  }

  Plotly.newPlot(
    "chart_skill_salary",
    [{ x: skills, y: medSalaries, type: "bar" }],
    {
      margin: { t: 10 },
      xaxis: { title: "Skill" },
      yaxis: { title: "Median Avg Salary" },
    },
    { responsive: true }
  );
}

function renderSkillCombosSalary() {
  if (!jobs.length) {
    clearAndNote("chart_skill_combos_salary", "No job rows available.");
    return;
  }

  const comboMap = new Map();

  jobs.forEach((r) => {
    const activeSkills = SKILL_COLS.filter((sk) => isTrue(r[sk]));
    if (!activeSkills.length) return;
    const combo = activeSkills.sort().join(" + ");
    if (!comboMap.has(combo)) comboMap.set(combo, []);
    comboMap.get(combo).push(r.avg_salary);
  });

  if (!comboMap.size) {
    clearAndNote("chart_skill_combos_salary", "No postings with overlapping skill combinations found.");
    return;
  }

  const combos = [];
  const salaries = [];

  comboMap.forEach((sals, combo) => {
    combos.push(combo);
    salaries.push(average(sals) || 0);
  });

  // take top 15 by salary just so plot stays readable
  const combined = combos.map((c, i) => ({ combo: c, salary: salaries[i] }));
  combined.sort((a, b) => b.salary - a.salary);
  const top = combined.slice(0, 15);

  Plotly.newPlot(
    "chart_skill_combos_salary",
    [
      {
        x: top.map((t) => t.combo),
        y: top.map((t) => t.salary),
        type: "bar",
      },
    ],
    {
      margin: { t: 10, b: 120 },
      xaxis: { title: "Skill Combination" },
      yaxis: { title: "Average Salary" },
    },
    { responsive: true }
  );
}

function renderLangRoleHeatmap() {
  if (!jobs.length) {
    clearAndNote("chart_lang_role_industry", "No job rows available.");
    return;
  }

  const roles = Array.from(
    new Set(jobs.map((r) => r.job_simp || "Other"))
  ).sort();

  const z = roles.map(() => SKILL_COLS.map(() => 0));

  jobs.forEach((r) => {
    const roleIndex = roles.indexOf(r.job_simp || "Other");
    SKILL_COLS.forEach((sk, i) => {
      if (isTrue(r[sk])) {
        z[roleIndex][i] += 1;
      }
    });
  });

  Plotly.newPlot(
    "chart_lang_role_industry",
    [
      {
        z,
        x: SKILL_COLS,
        y: roles,
        type: "heatmap",
      },
    ],
    {
      margin: { t: 10 },
      xaxis: { title: "Skill / Language" },
      yaxis: { title: "Role (job_simp)" },
    },
    { responsive: true }
  );
}

// ---------------------- PAGE 5 -------------------------------

function renderSalaryByRegionLevel() {
  const byStateLevel = groupBy(jobs, (r) => `${r.job_state || "Unknown"}|${r.seniority || "na"}`);
  if (!byStateLevel.size) {
    clearAndNote("chart_salary_region", "No region / level information available.");
    return;
  }

  const states = Array.from(new Set(jobs.map((r) => r.job_state || "Unknown"))).sort();
  const levels = Array.from(new Set(jobs.map((r) => r.seniority || "na"))).sort();

  const traces = levels.map((level) => {
    const y = states.map((state) => {
      const key = `${state}|${level}`;
      const rows = byStateLevel.get(key) || [];
      return median(rows.map((r) => r.avg_salary)) || null;
    });
    return { x: states, y, type: "bar", name: level };
  });

  Plotly.newPlot(
    "chart_salary_region",
    traces,
    {
      barmode: "group",
      margin: { t: 10, b: 130 },
      xaxis: { title: "Region (job_state)" },
      yaxis: { title: "Median Salary" },
    },
    { responsive: true }
  );
}

function renderSalaryByIndustry() {
  const byInd = groupBy(jobs, (r) => r.Industry || "Unknown");
  if (!byInd.size) {
    clearAndNote("chart_salary_industry", "No industry information found.");
    return;
  }

  const inds = [];
  const meds = [];
  byInd.forEach((rows, ind) => {
    inds.push(ind);
    meds.push(median(rows.map((r) => r.avg_salary)) || 0);
  });

  Plotly.newPlot(
    "chart_salary_industry",
    [{ x: inds, y: meds, type: "bar" }],
    {
      margin: { t: 10, b: 130 },
      xaxis: { title: "Industry" },
      yaxis: { title: "Median Salary" },
    },
    { responsive: true }
  );
}

function renderOpennessToNontraditional() {
  // Simple signals: degree optional vs required vs unknown
  const buckets = { "Degree required": 0, "Degree optional": 0, Unknown: 0 };

  jobs.forEach((r) => {
    const deg = (r.degree_required || "").toLowerCase();
    if (!deg) {
      buckets.Unknown += 1;
    } else if (deg === "none" || deg === "preferred") {
      buckets["Degree optional"] += 1;
    } else {
      buckets["Degree required"] += 1;
    }
  });

  const labels = Object.keys(buckets);
  const values = Object.values(buckets);

  Plotly.newPlot(
    "chart_openness",
    [{ x: labels, y: values, type: "bar" }],
    {
      margin: { t: 10 },
      xaxis: { title: "Signal (e.g., degree required / optional)" },
      yaxis: { title: "# of Postings" },
    },
    { responsive: true }
  );
}

function renderCompanySizeBreadth() {
  const withSize = jobs.filter((r) => r.Size);
  if (!withSize.length) {
    clearAndNote("chart_company_size_skills", "No company size data found.");
    return;
  }

  const grouped = groupBy(withSize, (r) => r.Size);
  const sizes = [];
  const breadth = [];

  grouped.forEach((rows, size) => {
    sizes.push(size);
    const avgBreadth = average(
      rows.map((r) => SKILL_COLS.filter((sk) => isTrue(r[sk])).length)
    );
    breadth.push(avgBreadth || 0);
  });

  Plotly.newPlot(
    "chart_company_size_skills",
    [{ x: sizes, y: breadth, type: "bar" }],
    {
      margin: { t: 10, b: 130 },
      xaxis: { title: "Company Size" },
      yaxis: { title: "Average # of skills required" },
    },
    { responsive: true }
  );
}

// ---------------------- PAGE 6 -------------------------------

function renderProgramAlignmentRadar() {
  const divId = "chart_alignment";
  if (!programs.length) {
    clearAndNote(divId, "No program data found in Programs.csv.");
    return;
  }

  // We assume Programs.csv has flags similar to SKILL_COLS plus maybe communication / statistics, etc.
  const radarSkills = ["python", "excel", "aws", "spark", "hadoop", "tableau", "big_data"];

  // Industry demand: how many jobs require each skill
  const demand = radarSkills.map(
    (sk) => jobs.filter((r) => isTrue(r[sk])).length
  );

  // Pick TKH row if present, else first program
  const tkhRow =
    programs.find(
      (p) =>
        (p.Program || p.program_name || "").toLowerCase().includes("knowledge house") ||
        (p.Program || p.program_name || "").toLowerCase().includes("tkh")
    ) || programs[0];

  const tkh = radarSkills.map((sk) => (isTrue(tkhRow[sk]) ? 1 : 0));

  const maxDemand = Math.max(...demand, 1);
  const demandScaled = demand.map((d) => (d / maxDemand) * 100);
  const tkhScaled = tkh.map((d) => d * 100);

  Plotly.newPlot(
    divId,
    [
      {
        type: "scatterpolar",
        r: demandScaled,
        theta: radarSkills.map((s) => s.toUpperCase()),
        fill: "toself",
        name: "Industry Demand",
      },
      {
        type: "scatterpolar",
        r: tkhScaled,
        theta: radarSkills.map((s) => s.toUpperCase()),
        fill: "toself",
        name: "TKH - Data Science Fellowship (sample)",
      },
    ],
    {
      margin: { t: 10 },
      polar: {
        radialaxis: { visible: true, range: [0, 100] },
      },
      legend: { orientation: "h" },
    },
    { responsive: true }
  );
}

function renderTaughtVsDemandedSkills() {
  const divId = "chart_taught_vs_demand";

  if (!programs.length) {
    clearAndNote(divId, "No program data found.");
    return;
  }

  const skills = SKILL_COLS;
  const demandCounts = skills.map(
    (sk) => jobs.filter((r) => isTrue(r[sk])).length
  );

  const taughtCounts = skills.map(
    (sk) => programs.filter((p) => isTrue(p[sk])).length
  );

  const demandTrace = {
    x: skills,
    y: demandCounts,
    name: "Demand (Jobs)",
    type: "bar",
  };

  const taughtTrace = {
    x: skills,
    y: taughtCounts,
    name: "Taught (Programs)",
    type: "bar",
  };

  Plotly.newPlot(
    divId,
    [demandTrace, taughtTrace],
    {
      barmode: "group",
      margin: { t: 10 },
      xaxis: { title: "Skill" },
      yaxis: { title: "Count" },
    },
    { responsive: true }
  );
}

function renderIndustryEducationGap() {
  const divId = "chart_industry_gap";

  if (!programs.length || !jobs.length) {
    clearAndNote(divId, "Need both job and program data for this chart.");
    return;
  }

  const byIndustry = groupBy(jobs, (r) => r.Industry || "Unknown");

  const industries = [];
  const gapScores = [];

  byIndustry.forEach((rows, industry) => {
    const demand = {};
    SKILL_COLS.forEach((s) => (demand[s] = 0));
    rows.forEach((r) => {
      SKILL_COLS.forEach((s) => {
        if (isTrue(r[s])) demand[s] += 1;
      });
    });

    const totalDemand = Object.values(demand).reduce((a, b) => a + b, 0) || 1;

    const taught = {};
    SKILL_COLS.forEach((s) => (taught[s] = 0));
    programs.forEach((p) => {
      SKILL_COLS.forEach((s) => {
        if (isTrue(p[s])) taught[s] += 1;
      });
    });

    let score = 0;
    SKILL_COLS.forEach((s) => {
      const dShare = demand[s] / totalDemand;
      const tShare = taught[s] / (programs.length || 1);
      score += 1 - Math.abs(dShare - tShare); // closer = higher score
    });
    score = score / SKILL_COLS.length; // 0–1

    industries.push(industry);
    gapScores.push(score);
  });

  Plotly.newPlot(
    divId,
    [
      {
        x: industries,
        y: gapScores,
        type: "bar",
      },
    ],
    {
      margin: { t: 10, b: 130 },
      xaxis: { title: "Industry" },
      yaxis: { title: "Alignment Score (0–1)" },
    },
    { responsive: true }
  );
}

// ------------------ Candidate Fit Simulator ------------------

function setupCandidateFitSimulator() {
  const input = document.getElementById("candidateSkills");
  const btnFit = document.getElementById("btnFit");
  const btnFitTKH = document.getElementById("btnFitTKH");
  const out = document.getElementById("fitResult");
  if (!input || !btnFit || !btnFitTKH || !out) return;

  function parseSkills() {
    return (input.value || "")
      .toLowerCase()
      .split(/[,\s]+/)
      .map((s) => s.trim())
      .filter(Boolean);
  }

  function skillSetFromRow(row) {
    const set = new Set();
    SKILL_COLS.forEach((sk) => {
      if (isTrue(row[sk])) set.add(sk);
    });
    return set;
  }

  function overlapPercent(userSkills, referenceSet) {
    if (!userSkills.length || !referenceSet.size) return 0;
    let overlap = 0;
    userSkills.forEach((s) => {
      if (referenceSet.has(s)) overlap += 1;
    });
    return (overlap / referenceSet.size) * 100;
  }

  btnFit.addEventListener("click", () => {
    const user = parseSkills();
    if (!user.length) {
      out.innerHTML = `<p class="small">Add at least one skill to estimate fit.</p>`;
      return;
    }

    const allJobSkills = new Set();
    jobs.forEach((r) => {
      SKILL_COLS.forEach((sk) => {
        if (isTrue(r[sk])) allJobSkills.add(sk);
      });
    });

    const score = overlapPercent(user, allJobSkills);
    out.innerHTML = `<p class="small"><strong>${score.toFixed(
      0
    )}% fit</strong><br/>Overlap with common job skills in this dataset.</p>`;
  });

  btnFitTKH.addEventListener("click", () => {
    const user = parseSkills();
    if (!user.length) {
      out.innerHTML = `<p class="small">Add at least one skill to estimate fit.</p>`;
      return;
    }

    const tkhRow =
      programs.find(
        (p) =>
          (p.Program || p.program_name || "").toLowerCase().includes("knowledge house") ||
          (p.Program || p.program_name || "").toLowerCase().includes("tkh")
      ) || programs[0];

    const tkhSkills = skillSetFromRow(tkhRow);
    const score = overlapPercent(user, tkhSkills);

    out.innerHTML = `<p class="small"><strong>${score.toFixed(
      0
    )}% fit</strong><br/>Overlap with skills taught in TKH (or first program row if TKH not found).</p>`;
  });
}
