:bar_chart: **Bootcamp Analysis — Capstone Project** 
**Team**: Data Alchemist  
**Program**: The Knowledge House — Data Science Innovation Fellowship  

:compass: **Project Overview**
This project analyzes whether today’s AI/Data job market aligns with what education programs teach. Using job postings, curriculum datasets, and skills-matching data, our team explored skill demand, education requirements, and industry gaps.  This project transforms how AI agent can help learners, educators, and employers with the current job market demands. Within the AI agent, there are three personas any user can utilize to gain feedback. The educator persona help schools and/or bootcamps make their lessons match what jobs are actually seeking in the current workforce. It should be able to scan real job postings, pull the most in-demand tools and skills and identify which ones aren’t showing up in the current curriculum. For learners, it acts as a career coach: analyzing their existing skills, showing what they need to learn for specific roles, and determining if they qualify for a job. Lastly the employer persona can be a quick snapshot that shows where education and hiring aren’t in alignment. It should highlight which skills companies are seeking that bootcamps may not be teaching. This could potentially be used to build partnerships with schools or used internally for upskilling.


The project includes:  
- A multi-page **HTML dashboard visualizing key insights** from real-world job data
- A **custom multi-persona AI Agent** executed via Streamlit
- **6 structured workbooks** for targeted EDA  
- A Kanban board to manage weekly milestone requirements 

:books: **The Six Workbooks**  
Each workbook focuses on a major research question:  

**Skills Demand & Trends**  
Finds the most requested skills, salary drivers, and industry patterns.  

**Education & Training Alignment**  
Compares required education vs. salary and maps curriculum skills to employer expectations.  

**Industry Gaps & Comparisons**  
Identifies mismatches between job market needs and educational preparation by industry.  

**Matching Dataset Creation**  
Merges datasets and standardizes skills for cross-analysis.  

**Dashboard Dataset Prep**  
Cleans, enriches, and documents data for the Power BI dashboard.  

**Insights & Recommendations**  
Synthesizes findings into takeaways for educators, learners, and employers.  

:robot: **Multi-Persona AI Agent**  
To support the project, we built a **Beginner Multi-Persona AI Agent** with personas for:  
- **Educators**  
- **Learners**  
- **Employers**  

The agent can generate:  
- Study plans  
- Rubrics  
- Role matrices  
- Skills gap analyses  
- Assignment briefs  
- Tool mappings  
- Natural-language summaries of JSON outputs  

This demonstrates how AI can enhance curriculum design, skill-building, and workflow efficiency.  

:bar_chart: **Data Alchemist Dashboard**  
Built using HTML, CSS, JS using the enriched dataset, the dashboard answers all key research questions through:  
- **Skills demand visualizations**  
- **Education vs. salary comparisons**  
- **Industry mismatch charts**  
- **Programming language and tool trends**  
- **A summary page with actionable recommendations**  

The dashboard uses a clean purple-and-white theme inspired by TKH.  

:pray: **Acknowledgements**  
Special thanks to:  
- The Knowledge House staff and instructors  
- Our peers in the Data Science Fellowship  
- Everyone who contributed feedback, resources, and support during this project  

:books: **Sources**  
Data and insights were derived from:  
- Glassdoor job-posting datasets  
- Public curriculum datasets  
- Industry skills and workforce reports  
- GitHub and Stack Overflow developer surveys  
- LinkedIn workforce insights  
- Tools including ChatGPT, Microsoft Copilot, and our custom AI Agent  

:warning: **Roadblocks & Challenges**  
Major challenges included:  
- Incomplete or inconsistent job-posting data  
- Mapping curriculum skills to employer terminology  
- Power BI modeling errors and missing transform options — hence pivoting to HTML pages  
- Handling duplicates and formatting issues  
- Integrating the AI agent and ensuring clean JSON parsing  
- A team member walking away from the project  

:bulb: **Lessons Learned**  
Key takeaways:  
- How to clean, enrich, and merge real-world datasets  
- How to design dashboards that tell a cohesive story  
- The value of strong documentation and team coordination  
- How AI tools can streamline analysis and enhance learning  
- The gap between employer expectations and formal education offerings


Prerequisites
Python Version: 3.8+
Editor: VS Code (or any preferred code editor)
Installation Steps
Clone the Repository
git clone https://github.com/nyckienite/TKH-Capstone-Project.git
In order to run the project:
1. ` python3 -m venv venv`
2. ` source venv/bin/activate` #Mac or ` venv\Scripts\activate` #Windows
3. ` pip install -r requirements.txt`
4. ` streamlit run app.py`

API keys and sensitive information are stored in .env files. Use .env_example as a guide to set up your API keys.
LearnSync Team: Alyssa, Akisha, Nicole, Dontaye and Adewale
Project Repository: https://github.com/nyckienite/TKH-Capstone-Project
