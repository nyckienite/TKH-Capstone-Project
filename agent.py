"""
Beginner Multi‑Persona AI Agent (Script version)
------------------------------------------------
This is the Python (.py) equivalent of the Jupyter notebook demo.

Features:
- Runs with or without OPENAI_API_KEY (MOCK mode if none)
- Three personas: Educator, Learner, Employer
- Beginner-friendly tools (project brief, rubric, study plan, scorecard, etc.)
- Simple CLI:
    python agent.py --persona learner --ask "Give me a 2-week Docker+CI plan"
    python agent.py --tool propose_project --args '{"topic":"Model Monitoring","duration_weeks":2}'
"""

from __future__ import annotations
import os
import json
import argparse
import logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s"
)
logger = logging.getLogger(__name__)
from dataclasses import dataclass
from typing import List, Dict, Any, Optional

# Optional .env loading
try:
    from dotenv import load_dotenv  # type: ignore
    load_dotenv()
except Exception:
    pass

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# ----------------------- LLM Client -----------------------

DEFAULT_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

class LLMClient:
    """
    Uses OpenAI if a valid key is configured; otherwise returns a MOCK response.
    Gracefully falls back to MOCK on any API/auth error.
    """
    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None):
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        self.model = model or DEFAULT_MODEL
        self.mode = "MOCK"
        self._client = None

        if self.api_key:
            try:
                from openai import OpenAI  # type: ignore
                self._client = OpenAI(api_key=self.api_key)
                self.mode = "OPENAI"
            except Exception as e:
                logger.error(f"OpenAI init failed, using MOCK: {e}")
                self._client = None
                self.mode = "MOCK"

    def chat(self, system: str, user: str, temperature: float = 0.4) -> str:
        if not self._client or self.mode != "OPENAI":
            return (
                "[MOCK REPLY]\n"
                f"System: {system.split('. ')[0]}...\n"
                f"User: {user}\n"
                "Response: Placeholder. Add a valid OPENAI_API_KEY to get real outputs."
            )
        try:
            resp = self._client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system},
                    {"role": "user", "content": user},
                ],
                temperature=temperature,
            )
            return resp.choices[0].message.content or ""
        except Exception as e:
            logger.error(f"OpenAI init failed, using MOCK: {e}")
            self._client = None
            self.mode = "MOCK"
            return (
                "[MOCK REPLY]\n"
                f"System: {system.split('. ')[0]}...\n"
                f"User: {user}\n"
                "Response: API failed; now in MOCK mode."
            )

# ----------------------- Personas -----------------------

@dataclass
class Persona:
    name: str
    goals: List[str]
    tone: str
    style_rules: List[str]
    tools_allowed: List[str]

    def system_prompt(self) -> str:
        return (
            f"You are the {self.name} persona.\n"
            f"Goals: {', '.join(self.goals)}.\n"
            f"Tone: {self.tone}.\n"
            f"Style rules: {', '.join(self.style_rules)}.\n"
            "Always produce clear, actionable steps."
        )

EDUCATOR = Persona(
    name="Educator",
    goals=[
        "Bring real-world projects into curriculum",
        "Map outcomes to industry tools (cloud, Git, MLOps, advanced AI)",
    ],
    tone="Warm, Practical, Coach-Like",
    style_rules=["Use Checklists", "Include Rubrics", "Be Concise"],
    tools_allowed=["Propose_Project", "Make_Rubric", "Map_Outcomes_to_Tools"],
)

LEARNER = Persona(
    name="Learner",
    goals=[
        "Sharpen practical skills in cloud, Git, MLOps, advanced AI",
        "Create personal practice plans",
    ],
    tone="Encouraging, Direct",
    style_rules=["Show Commands", "Weekly Plan", "Include Checkpoints"],
    tools_allowed=["Skills_Gap", "Study_Plan", "Checkpoint_Quiz"],
)

EMPLOYER = Persona(
    name="Employer",
    goals=[
        "Align pipelines with training programs",
        "Define job-ready skills and scorecards",
    ],
    tone="Succinct, Metrics-Driven",
    style_rules=["Bullets", "KPIs", "Templates That Scale"],
    tools_allowed=["Role_Matrix", "Assignment_Brief", "Screening_Scorecard"],
)

PERSONAS: Dict[str, Persona] = {
    "educator": EDUCATOR,
    "learner": LEARNER,
    "employer": EMPLOYER,
}

# ----------------------- Tools -----------------------

def propose_project(topic: str, duration_weeks: int = 2) -> Dict[str, Any]:
    return {
        "title": f"{topic} — Real-World Lab",
        "duration_weeks": duration_weeks,
        "outcomes": [
            "Use Git & pull requests",
            "Deploy a minimal model/service to cloud",
            "Automate tests with CI",
        ],
        "deliverables": [
            "Repo with README and dataset notes",
            "CI workflow file",
            "Short demo video or notebook",
        ],
        "week_by_week": [
            {"week": 1, "focus": "Data + baseline; Git workflow"},
            {"week": 2, "focus": "Cloud deploy + CI; demo draft"},
        ],
    }

def make_rubric(outcomes: List[str]) -> Dict[str, Any]:
    return {"rubric": [{"criterion": o, "points": 10} for o in outcomes]}

def map_outcomes_to_tools(outcomes: List[str]) -> Dict[str, Any]:
    mapping = []
    for o in outcomes:
        tools = []
        if "git" in o.lower():
            tools += ["Git", "GitHub", "PR reviews"]
        if "cloud" in o.lower():
            tools += ["Azure", "AWS", "GCP", "Docker"]
        if "ci" in o.lower() or "automate" in o.lower():
            tools += ["GitHub Actions", "pytest", "ruff/flake8"]
        mapping.append({"outcome": o, "tools": tools or ["Choose best-fit tools"]})
    return {"mapping": mapping}

def skills_gap(current: List[str], target_role: str) -> Dict[str, Any]:
    role_basics = {
        "data_analyst": ["SQL", "Python", "Pandas", "BI dashboard", "Git"],
        "ml_engineer": ["Python", "ML basics", "Docker", "CI/CD", "Cloud deploy"],
    }
    target = role_basics.get(target_role.lower(), [])
    gaps = [s for s in target if s not in current]
    return {"target_role": target_role, "required": target, "gaps": gaps}

def study_plan(gaps: List[str], weeks: int = 4) -> Dict[str, Any]:
    plan: List[Dict[str, Any]] = []
    if weeks < 1:
        weeks = 1
    per_week = max(1, len(gaps) // weeks or 1)
    idx = 0
    for w in range(1, weeks + 1):
        chunk = gaps[idx: idx + per_week]
        plan.append({
            "week": w,
            "focus": chunk or ["Review & integrate"],
            "checkpoints": ["Mini-project", "1-page reflection", "Push to Git, open PR"],
        })
        idx += per_week
    return {"weeks": weeks, "plan": plan}

def checkpoint_quiz(topic: str) -> Dict[str, Any]:
    return {
        "topic": topic,
        "questions": [
            {"q": f"Explain {topic} in your own words.", "answer_key": "Clear and concrete."},
            {"q": f"Show a code snippet that uses {topic}.", "answer_key": "Runs and is idiomatic."},
        ],
    }

def role_matrix(roles: List[str]) -> Dict[str, Any]:
    axes = ["Core Skills", "Tools", "Day-1 Tasks", "Signals"]
    matrix = []
    for r in roles:
        matrix.append({
            "role": r,
            "Core Skills": ["Problem framing", "Data literacy", "Collaboration"],
            "Tools": ["Git", "SQL/Python", "BI or ML stack"],
            "Day-1 Tasks": ["Readme setup", "Data pull", "Small change & PR"],
            "Signals": ["Portfolio repos", "PR history", "Take-home quality"],
        })
    return {"axes": axes, "matrix": matrix}

def assignment_brief(role: str) -> Dict[str, Any]:
    return {
        "role": role,
        "duration": "48–72h",
        "context": "Mirror a small week-one task.",
        "requirements": [
            "Fork starter repo; open PRs",
            "Implement feature/analysis; write tests",
            "Short Loom video walkthrough",
        ],
        "evaluation": ["Correctness", "Code quality & tests", "Docs & comms"],
    }

def screening_scorecard(role: str) -> Dict[str, Any]:
    return {
        "role": role,
        "dimensions": [
            {"name": "Technical Baseline", "weight": 0.4},
            {"name": "Execution/Ownership", "weight": 0.3},
            {"name": "Communication", "weight": 0.2},
            {"name": "Team Fit", "weight": 0.1},
        ],
        "scales": {"0": "Not demonstrated", "1": "Basic", "2": "Good", "3": "Excellent"},
    }

# ----------------------- Registry & helper APIs -----------------------

TOOL_REGISTRY = {
    "propose_project": propose_project,
    "make_rubric": make_rubric,
    "map_outcomes_to_tools": map_outcomes_to_tools,
    "skills_gap": skills_gap,
    "study_plan": study_plan,
    "checkpoint_quiz": checkpoint_quiz,
    "role_matrix": role_matrix,
    "assignment_brief": assignment_brief,
    "screening_scorecard": screening_scorecard,
}

def use_tool(tool_name: str, **kwargs) -> Dict[str, Any]:
    if tool_name not in TOOL_REGISTRY:
        return {"error": f"Unknown tool: {tool_name}"}
    try:
        return TOOL_REGISTRY[tool_name](**kwargs)
    except TypeError as e:
        return {"error": f"Bad arguments for {tool_name}: {e}"}

def ask(persona_key: str, message: str, temperature: float = 0.4) -> str:
    key = persona_key.strip().lower()
    if key not in PERSONAS:
        raise ValueError(f"Unknown persona '{persona_key}'. Try one of {list(PERSONAS.keys())}")
    system = PERSONAS[key].system_prompt()
    client = LLMClient()
    return client.chat(system, message, temperature=temperature)

# ----------------------- CLI -----------------------

def main():
    parser = argparse.ArgumentParser(description="Beginner Multi‑Persona AI Agent (script version)")
    parser.add_argument("--persona", default="educator", help="educator | learner | employer")
    parser.add_argument("--ask", help="Free-form question for the persona")
    parser.add_argument("--tool", help="Tool name to run")
    parser.add_argument("--args", help="JSON string of arguments for the tool, e.g. '{\"topic\":\"X\",\"duration_weeks\":2}'")
    parser.add_argument("--temperature", type=float, default=0.4, help="Sampling temperature for model replies")
    args = parser.parse_args()

    if args.tool:
        kwargs = json.loads(args.args or "{}")
        out = use_tool(args.tool, **kwargs)
        print(json.dumps(out, indent=2))
        return

    if args.ask:
        reply = ask(args.persona, args.ask, temperature=args.temperature)
        print(reply)
        return

    # If no flags, print quick help + examples
    print("Beginner Multi‑Persona AI Agent (script)")
    print("Mode:", "OPENAI" if OPENAI_API_KEY else "MOCK")
    print("\nExamples:")
    print('  python agent.py --persona learner --ask "Give me a 2-week Docker+CI plan"')
    print('  python agent.py --tool propose_project --args \'{"topic":"Model Monitoring","duration_weeks":2}\'')

if __name__ == "__main__":
    main()