# =========================================
# app.py — Streamlit UI for your AI model
# =========================================

# If needed, install dependencies:
# pip install streamlit python-dotenv openai

import streamlit as st
import json
from io import StringIO
from typing import Any, Dict, List
import agent

# ---------- IMPORT YOUR EXISTING BACKEND ----------

from agent import (
    ask,
    use_tool,
    PERSONAS,
)

# ---------- PAGE CONFIG ----------
st.set_page_config(
    page_title="TKH Bootcamp Data Science Assistant",
    page_icon="🤖",
    layout="wide",
)


# ---------- SIDEBAR: Persona Info ----------
st.sidebar.title("🧩 AI Profiles")

persona_selected = st.sidebar.selectbox("Select Persona", list(PERSONAS.keys()), index=0)

persona_obj = PERSONAS.get(persona_selected)
if not persona_obj:
    st.sidebar.error("Persona config missing.")
    st.stop()
st.sidebar.write(f"**Tone:** {persona_obj.tone}")
st.sidebar.write("**Goals:**")
for g in persona_obj.goals:
    st.sidebar.markdown(f"- {g}")
st.sidebar.write("**Style Rules:**")
for rule in persona_obj.style_rules:
    st.sidebar.markdown(f"- {rule}")
st.sidebar.write("---")
st.sidebar.info("💡 Tip: Choose a assistant here, then interact in the tabs on the main screen.")

# ---------- MAIN PAGE ----------
st.title(" TKH Bootcamp Data Science Dashboard")
st.write("Interact with your assistant (Educator, Learner, Employer) and run built-in tools with an intuitive interface.")

tab1, tab2 = st.tabs(["💬 Chat with TKH Assistant", "🧰 Use a Tool"])

# ==============================================================
# 💬 TAB 1: CHAT WITH A PERSONA
# ==============================================================

with tab1:
    st.subheader("Chat with TKH Assistant")

    message = st.text_area("Enter your message:", placeholder="e.g., Give me a 2-week plan for Docker + CI basics.")

    if st.button("Ask Persona", use_container_width=True):
        if message.strip():
            with st.spinner("Thinking..."):
                response = ask(persona_selected, message)
            st.markdown("### 🧠 AI Assistant Response")
            st.write(response)

            # Add download button for chat output
            json_data = json.dumps({"persona": persona_selected, "input": message, "response": response}, indent=2)
            st.download_button(
                label="💾 Save Response as JSON",
                data=json_data,
                file_name=f"{persona_selected}_response.json",
                mime="application/json",
            )
        else:
            st.warning("⚠️ Please enter a message before submitting.")

# ==============================================================
# 🧰 TAB 2: TOOL RUNNER
# ==============================================================

with tab2:
    st.subheader("Run a Built-in Tool with AI")

    st.markdown("""
    Select a **tool** and enter its arguments below.  
    The tool will first run using Python logic, then the **AI persona** will analyze, summarize, 
    or enhance the output.
    """)

    # Select tool
    tool_names = list(use_tool.__globals__["TOOL_REGISTRY"].keys())
    tool_choice = st.selectbox("Choose a tool to run", tool_names)

    # Default JSON example
    st.markdown("Enter the tool arguments in JSON format.")
    default_json = (
        '{"topic": "Model Monitoring", "duration_weeks": 2}'
        if tool_choice == "propose_project"
        else "{}"
    )
    args_str = st.text_area("Arguments (JSON format)", value=default_json, height=150)

    # AI persona selector (reuse same personas from Tab 1)
    persona_selected_tool = st.selectbox(
        "Choose which persona will interpret the tool output:",
        ["educator", "learner", "employer"],
        key="persona_tool"
    )

    if st.button("Run Tool with AI", use_container_width=True):
        try:
            args = json.loads(args_str) if args_str.strip() else {}

            # Step 1 — Run the base tool
            with st.spinner(f"Running {tool_choice}..."):
                raw_result = use_tool(tool_choice, **args)

            st.markdown("### ⚙️ Raw Tool Output")
            st.json(raw_result)

            # Step 2 — Send result to the AI persona for analysis
            with st.spinner("🧠 Asking AI persona for insights..."):
                ai_prompt = (
                    f"Here is the output from the `{tool_choice}` tool:\n"
                    f"{json.dumps(raw_result, indent=2)}\n\n"
                    f"As the {persona_selected_tool} persona, summarize or expand on this result "
                    f"in a way that would help a student or practitioner apply it effectively."
                )
                ai_response = ask(persona_selected_tool, ai_prompt)

            st.markdown("### 🤖 AI Persona Interpretation")
            st.write(ai_response)

            # Step 3 — Add download buttons
            combined_output = {
                "persona": persona_selected_tool,
                "tool_name": tool_choice,
                "args": args,
                "raw_result": raw_result,
                "ai_response": ai_response,
            }

            st.download_button(
                label="💾 Save Full AI Output (JSON)",
                data=json.dumps(combined_output, indent=2),
                file_name=f"{tool_choice}_{persona_selected_tool}_output.json",
                mime="application/json",
            )

        except json.JSONDecodeError:
            st.error("❌ Invalid JSON input. Please check your syntax.")
        except Exception as e:
            st.error(f"⚠️ Error running tool: {e}")