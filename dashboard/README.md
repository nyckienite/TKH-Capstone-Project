# CSV Dashboard — Data Analyst Job Insights

Front-end dashboard that reads CSVs from `/data` using PapaParse and renders Plotly charts.

## Run
- Open `index.html` directly, or
- Serve locally:
  - Python 3: `python -m http.server 8000` → open http://localhost:8000/

## Data Files
- job_availability.csv — state,region,urban,postings
- platform_coverage.csv — platform,coverage_score,relevance_score
- job_levels.csv — level,education,years_exp,skills (semicolon-separated),responsibility_weight
- postings_trend_monthly.csv — month,postings
- ai_signals.csv — month,ai_mention_rate,salary_index
- role_overlap.csv — title,skills (semicolon-separated)
- skills_over_time.csv — month,SQL,Python,Power BI,Excel,Cloud,Statistics,Communication
- salary_by_region_level.csv — region,level,median
- salary_by_industry.csv — industry,median
- openness_nontraditional.csv — company,openness_score
- education_alignment.csv — program,sql,python,power_bi,cloud,communication,overall
