
const pages=document.querySelectorAll('.page');const navLinks=document.querySelectorAll('.nav a');
function setActive(h){navLinks.forEach(a=>a.classList.toggle('active',a.getAttribute('href')===h));pages.forEach(p=>p.classList.toggle('active','#'+p.id===h));}
window.addEventListener('hashchange',()=>setActive(location.hash||'#page1'));setActive(location.hash||'#page1');

function loadCSV(path){return new Promise((resolve,reject)=>{Papa.parse(path,{download:true,header:true,dynamicTyping:true,skipEmptyLines:true,complete:r=>resolve(r.data),error:e=>reject(e)});});}

Promise.all([
  loadCSV('data/job_availability.csv'),
  loadCSV('data/platform_coverage.csv'),
  loadCSV('data/job_levels.csv'),
  loadCSV('data/postings_trend_monthly.csv'),
  loadCSV('data/ai_signals.csv'),
  loadCSV('data/role_overlap.csv'),
  loadCSV('data/skills_over_time.csv'),
  loadCSV('data/salary_by_region_level.csv'),
  loadCSV('data/salary_by_industry.csv'),
  loadCSV('data/openness_nontraditional.csv'),
  loadCSV('data/education_alignment.csv')
]).then(([jobAvail, platforms, jobLevels, trend, ai, roleOverlap, skillsTime, salRL, salInd, openness, eduAlign])=>{
  jobAvail.sort((a,b)=>b.postings-a.postings);
  Plotly.newPlot('chart_state_postings',[{type:'bar',x:jobAvail.map(d=>d.state),y:jobAvail.map(d=>d.postings)}],{margin:{t:20},xaxis:{tickangle:-30},yaxis:{title:'Postings'}});
  const urbanSum=jobAvail.filter(d=>String(d.urban)==='true').reduce((s,d)=>s+d.postings,0);
  const nonSum=jobAvail.filter(d=>String(d.urban)!=='true').reduce((s,d)=>s+d.postings,0);
  Plotly.newPlot('chart_urban',[{type:'pie',labels:['Urban','Non-Urban'],values:[urbanSum,nonSum],hole:.45}],{margin:{t:10}});
  Plotly.newPlot('chart_platforms',[
    {type:'bar',x:platforms.map(d=>d.platform),y:platforms.map(d=>Math.round(d.coverage_score*100)),name:'Coverage %'},
    {type:'bar',x:platforms.map(d=>d.platform),y:platforms.map(d=>Math.round(d.relevance_score*100)),name:'Relevance %'}
  ],{barmode:'group',margin:{t:20},yaxis:{title:'Percent'}});

  document.getElementById('btnRecommend').addEventListener('click',()=>{
    const s=(document.getElementById('skillsInput').value||'').toLowerCase();let r='LinkedIn';
    if(s.includes('salary')||s.includes('bls')) r='BLS (market stats)'; else if(s.includes('reviews')||s.includes('culture')) r='Glassdoor';
    else if(s.includes('sql')||s.includes('python')||s.includes('power bi')) r='LinkedIn';
    document.getElementById('llmReco').innerHTML=`<strong>Suggested platform:</strong> ${r}<div class="small">Heuristic demo; swap for an LLM call.</div>`;
  });

  Plotly.newPlot('chart_level_exp',[{type:'bar',x:jobLevels.map(l=>l.level),y:jobLevels.map(l=>Number(l.years_exp)),text:jobLevels.map(l=>`Education: ${l.education}`),hovertemplate:'%{x}: %{y:.1f} yrs<br>%{text}<extra></extra>'}],{margin:{t:20},yaxis:{title:'Years of Experience'}});
  Plotly.newPlot('chart_responsibility',[{type:'bar',x:jobLevels.map(l=>l.level),y:jobLevels.map(l=>Number(l.responsibility_weight))}],{margin:{t:20},yaxis:{title:'Responsibility Index'}});

  trend.sort((a,b)=>String(a.month).localeCompare(String(b.month)));
  Plotly.newPlot('chart_trend',[{type:'scatter',mode:'lines+markers',x:trend.map(d=>d.month),y:trend.map(d=>d.postings)}],{margin:{t:20},yaxis:{title:'Postings'}});

  ai.sort((a,b)=>String(a.month).localeCompare(String(b.month)));
  Plotly.newPlot('chart_ai_mentions',[
    {type:'scatter',mode:'lines+markers',x:ai.map(d=>d.month),y:ai.map(d=>Math.round(Number(d.ai_mention_rate)*100)),name:'AI mention %'},
    {type:'scatter',mode:'lines+markers',x:ai.map(d=>d.month),y:ai.map(d=>Number(d.salary_index)),name:'Salary index',yaxis:'y2'}
  ],{margin:{t:20},yaxis:{title:'AI %'},yaxis2:{title:'Salary idx',overlaying:'y',side:'right'}});

  const roles=roleOverlap;
  const allSkills=[...new Set(roles.flatMap(r=>String(r.skills).split(';').map(s=>s.trim())))].filter(Boolean);
  const z=roles.map(r=>{const set=new Set(String(r.skills).split(';').map(s=>s.trim()));return allSkills.map(s=>set.has(s)?1:0);});
  Plotly.newPlot('chart_overlap',[{type:'heatmap',z,x:allSkills,y:roles.map(r=>r.title),colorscale:'Blues'}],{margin:{t:30}});

  const st=skillsTime; const skillNames=Object.keys(st[0]).filter(k=>k!=='month');
  const series=skillNames.map(k=>({type:'scatter',mode:'lines+markers',x:st.map(d=>d.month),y:st.map(d=>Math.round(Number(d[k])*100)),name:k}));
  Plotly.newPlot('chart_skills_time',series,{margin:{t:20},yaxis:{title:'Share %'}});

  const latest=st[st.length-1];
  const entries=Object.entries(latest).filter(([k])=>k!=='month').map(([k,v])=>[k,Number(v)]).sort((a,b)=>b[1]-a[1]).slice(0,6);
  Plotly.newPlot('chart_top_skill',[{type:'bar',x:entries.map(e=>e[0]),y:entries.map(e=>Math.round(e[1]*100))}],{margin:{t:20},yaxis:{title:'Share %'}});

  const sal=salRL; const levelsRL=[...new Set(sal.map(d=>d.level))]; const regions=[...new Set(sal.map(d=>d.region))];
  const traces=levelsRL.map(level=>({type:'bar',name:level,x:regions,y:regions.map(r=>{const f=sal.find(d=>d.region===r && d.level===level);return f?Number(f.median):0;})}));
  Plotly.newPlot('chart_salary_region',traces,{barmode:'group',margin:{t:20},yaxis:{title:'Median ($)'}});
  Plotly.newPlot('chart_salary_industry',[{type:'bar',x:salInd.map(d=>d.industry),y:salInd.map(d=>Number(d.median))}],{margin:{t:20},yaxis:{title:'Median ($)'}});
  Plotly.newPlot('chart_openness',[{type:'bar',x:openness.map(d=>d.company),y:openness.map(d=>Math.round(Number(d.openness_score)*100))}],{margin:{t:20},yaxis:{title:'Openness %'}});

  const progs=eduAlign; const radarSkills=['sql','python','power_bi','cloud','communication','overall'];
  const tracesRadar=progs.map(p=>({type:'scatterpolar',r:radarSkills.map(s=>Math.round(Number(p[s])*100)),theta:radarSkills.map(s=>s.toUpperCase()),fill:'toself',name:p.program}));
  Plotly.newPlot('chart_alignment',tracesRadar,{margin:{t:20},polar:{radialaxis:{visible:true,range:[0,100]}}});

  function fitScore(c,weightTKH=false){const top=['sql','python','power bi','excel','communication','cloud','statistics','powerbi'];const set=new Set(c.split(',').map(s=>s.trim().toLowerCase()).filter(Boolean));let sc=0;top.forEach(s=>{if(set.has(s)||set.has(s.replace(' ',''))) sc+=1;});if(weightTKH){['sql','python','power bi','communication'].forEach(s=>{if(set.has(s)) sc+=0.5;});}return Math.min(100,Math.round((sc/(top.length+(weightTKH?2:0)))*100));}
  document.getElementById('btnFit').addEventListener('click',()=>{const skills=document.getElementById('candidateSkills').value||'';document.getElementById('fitResult').innerHTML=`<div class="kpi">${fitScore(skills,false)}% fit</div><div class="small">Overlap with common JD skills.</div>`;});
  document.getElementById('btnFitTKH').addEventListener('click',()=>{const skills=document.getElementById('candidateSkills').value||'';document.getElementById('fitResult').innerHTML=`<div class="kpi">${fitScore(skills,true)}% fit</div><div class="small">Weighted for TKH emphasis.</div>`;});
}).catch(err=>{console.error('Data load error:',err); alert('Could not load CSVs. If opening via file:// and your browser blocks local fetch, use a simple web server (python -m http.server).');});
