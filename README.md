The Knowledge House Capstone Project
Project Overview:

This project transforms how AI agent can help learners, educators, and employers with the current job market demands. Within the agentic AI, there are three personas any user can ulitized to gain feedback. The educator persona help schools and/or bootcamps make their lessons match what jobs are actually seeking in the current workforce. It should be able to scan real job postings, pull the most in-demand tools and skills and identify which ones aren’t showing up in the current curriculum. For learners, it acts as a career coach: analyzing their existing skills, showing what they need to learn for specific roles, and determining if they qualify for a job. Lastly the employer persona can be a quick snapshot that shows where education and hiring aren’t in alignment. It should highlight which skills companies are seeking that bootcamps may not be teaching. This could potentially be used to build partnerships with schools or used internally for upskilling.

Key Features
-Aggregates skill trends by region, industry, and job type
-Identifies mismatches between what’s taught and what’s demanded
-Career Readiness Snapshots & personalized learning paths
-AI-powered analysis of feedback and curriculum

Installation and Setup:

Prerequisites
Python Version: 3.8+
Editor: VS Code (or any preferred code editor)

Installation Steps
-Clone the Repository
-git clone https://github.com/nyckienite/TKH-Capstone-Project.git
-In order to run the project:
    1. ` python3 -m venv venv` 
    2. ` source env/bin/activate` #Mac or ` venv\Scripts\activate` #Windows
    3. ` pip install -r requirements.txt`
    4. ` streamlit run app.py`

Data Sources:

The project utiliizes multiple data sources to create the different personas

Data Structure
├──ai_job_dataset.csv
├──Cleaned_DS_Jobs.csv
├──data_cleaned_2021.csv
└──job_postings.csv
└──job_skills.csv
└──job_summary.csv

Code Structure

The project follows a modular architecture with clear separation of concerns:


Key Technologies
OpenAI GPT-4 - For natural language processing and analysis
Pandas - For data manipulation and analysis

Results and Evaluation:

The Capstone Project successfully processes leaner, educator, and employer feedback and generates comprehensive response

Sample Output Structure
Enter your message:
Give me a 2-month plan to teach machine learning 

🧠 AI Assistant Response
Here is a practical, hands-on 2-month plan to teach machine learning. It’s designed to map learning outcomes to industry tools (Git, cloud, MLOps basics) and end with a deployable capstone. It assumes learners have Python basics (syntax, functions) and some math/statistics familiarity.

Target audience and prerequisites

Audience: new to ML or with introductory ML exposure; comfortable with Python.
Prereqs: Python basics, NumPy/Pandas basics, basic plotting (optional). Git fundamentals.
Tools you’ll set up: GitHub account, Python environment, Jupyter or Google Colab, Docker (optional but encouraged), cloud account (AWS/GCP/Azure) for deployment practice.
Learning outcomes mapped to industry tools

Version control and collaboration: Git workflows, branching, pull requests, code reviews.
Data handling and experimentation: Pandas/Numpy, reproducible notebooks, pipelines.
Modeling fundamentals: Supervised learning, feature engineering, model evaluation, hyperparameter tuning.
Deployment and MLOps basics: Simple containerization, API serving, CI/CD concepts, cloud deployment basics.
Real-world project delivery: End-to-end workflow from data to model to deployment, with documentation and presentation.
Setup checklist (week 0)

Create a GitHub organization/repo for the course project.
Prepare a shared data sandbox or dataset list (e.g., Titanic/iris California housing, sentiment dataset).
Establish a common environment: Python 3.x, virtualenv/conda, pip requirements.
Create a cloud account and optionally a Docker installation.
Create a lightweight project template: README, data/, notebooks/, src/, tests/, scripts/, Dockerfile (optional).
Week-by-week plan (8 weeks)

Week 1 — Python data wrangling and project scaffolding Focus: Clean data, explore datasets, set up reproducible workflow. Topics:

Data exploration with Pandas: loading, cleaning, handling missing values.
Basic statistics to understand data distributions.
Git workflow: branching, commits, push/pull requests.
Project scaffolding: README, data dictionary, reproducible environment. Labs/Deliverables:
Cleaned dataset notebook (or Python script) with basic EDA.
GitHub repo with a clear README and data/README.
Check-in: a small Jupyter notebook showing dataset shape, missing values, basic stats. Assessment rubric focus: reproducibility, code clarity, commit hygiene. Weekly capstone milestone: None yet; foundation set.
Week 2 — Intro to supervised learning and baselines Focus: Phenomena, train/test split, baselines, evaluation basics. Topics:

Problem framing: regression vs classification.
Train/test split, cross-validation basics.
Baselines: mean predictor, logistic regression or linear regression as starting point.
Metrics: RMSE/MAE for regression; accuracy, precision, recall, F1 for classification.
Scikit-learn pipelines to streamline preprocessing. Labs/Deliverables:
Build a simple baseline model on a dataset (e.g., housing or binary classification on a public dataset).
Evaluation report comparing baseline vs simple model.
Extend GitHub repo with a pipeline for preprocessing and model fitting. Checklists:
Data split performed; metrics computed; results plotted.
Code is modular (functions/classes) and documented......



Acknowledgments:

We would like to express our gratitude to:

The Knowledge House for providing the educational context and support
OpenAI for the GPT-4 API that powers our analysis

Our instructor and TAs for their valuable feedback throughout the project
References

OpenAI API Documentation: https://platform.openai.com/docs
Pandas Documentation: https://pandas.pydata.org/docs


License

Code License

The code in this repository is released under the MIT License. See LICENSE file for complete details.

Usage Guidelines

API keys and sensitive information must be stored in .env files

LearnSync Team: Alyssa, Akisha, Nicole, Dontaye and Adewale
Project Repository: https://github.com/nyckienite/TKH-Capstone-Projectgit
