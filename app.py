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

persona_selected = st.sidebar.selectbox("Select Persona", list(PERSONAS.keys()))

persona_obj = PERSONAS[persona_selected]
st.sidebar.markdown(f"### 🎭 {persona_obj.name}")
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
# 🧰 TAB 2: TOOL RUNNER (Prompt-Based Version)  
# ==============================================================  

with tab2:
    st.subheader("Run a Built-in Tool with AI")

    st.markdown("""
    Instead of entering JSON, just type a natural-language prompt.  
    The AI will **interpret your prompt**, extract what the tool needs,  
    run the tool, and then provide an enhanced explanation.
    """)

    # Select tool
    tool_names = list(use_tool.__globals__["TOOL_REGISTRY"].keys())
    tool_choice = st.selectbox("Choose a tool to run", tool_names)

    # Replace JSON input with natural language prompt
    natural_prompt = st.text_area(
        "Describe what you want the tool to do (natural language)",
        placeholder="e.g., Create me a 2-week project about model monitoring with beginner-friendly tasks."
    )

    # Persona selector
    persona_selected_tool = st.selectbox(
        "Choose which persona will interpret the output:",
        ["educator", "learner", "employer"],
        key="persona_tool"
    )

    if st.button("Run Tool with AI", use_container_width=True):
        try:
        
            with st.spinner("🧠 Interpreting your prompt..."):
                convert_prompt = f"""
                You are an AI that converts natural-language prompts into JSON arguments
                for a tool called '{tool_choice}'.

                User prompt:
                \"\"\"{natural_prompt}\"\"\"

                Return ONLY valid JSON.
                """
                json_args_str = ask(persona_selected_tool, convert_prompt)

            args = json.loads(json_args_str)

            
            #Run the tool using the parsed arguments
            
            with st.spinner(f"Running {tool_choice} with interpreted arguments..."):
                raw_result = use_tool(tool_choice, **args)

            st.markdown("### ⚙️ Raw Tool Output")
            st.json(raw_result)

            #Persona interprets the tool output
            
            with st.spinner("🔍 Asking AI persona for insights..."):
                ai_prompt = (
                    f"Tool: {tool_choice}\n"
                    f"Interpreted Arguments: {json.dumps(args, indent=2)}\n"
                    f"Raw Output: {json.dumps(raw_result, indent=2)}\n\n"
                    f"As the {persona_selected_tool} persona, explain, summarize, or enhance this output "
                    f"in a way that would help a learner or practitioner."
                )
                ai_response = ask(persona_selected_tool, ai_prompt)

            st.markdown("### 🤖 AI Persona Interpretation")
            st.write(ai_response)

            #Download output
            
            combined_output = {
                "persona": persona_selected_tool,
                "tool_name": tool_choice,
                "user_prompt": natural_prompt,
                "interpreted_args": args,
                "raw_result": raw_result,
                "ai_response": ai_response,
            }

            st.download_button(
                label="💾 Save Full Output (JSON)",
                data=json.dumps(combined_output, indent=2),
                file_name=f"{tool_choice}_{persona_selected_tool}_output.json",
                mime="application/json",
            )

        except json.JSONDecodeError:
            st.error("❌ The AI could not convert your prompt into valid JSON. Try rephrasing.")
        except Exception as e:
            st.error(f"⚠️ Error running tool: {e}")
