# --- SECURITY BYPASS (Run at top of file) ---
import ssl
import certifi

# This forces Python to trust your network, even if it intercepts traffic
ssl._create_default_https_context = ssl._create_unverified_context
# --------------------------------------------

import os
from dotenv import load_dotenv
from typing import TypedDict, List, Annotated
import operator
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_community.tools.tavily_search import TavilySearchResults
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage

# 1. Load Keys
load_dotenv()

# 2. Define State (The "Memory" Bank)
class AgentState(TypedDict):
    # This 'Annotated' list allows us to APPEND messages, not overwrite them
    messages: Annotated[List[SystemMessage | HumanMessage | AIMessage], operator.add]

# 3. Initialize Brain (Gemini Flash for speed)
llm = ChatGoogleGenerativeAI(model="gemini-flash-latest", temperature=0)

# 4. Initialize Search Tool
search_tool = TavilySearchResults(
    max_results=3,
    include_raw_content=True
)

# 5. Supervisor (The Router)
def supervisor_node(state: AgentState):
    # Look at the LAST message to decide what to do
    last_message = state['messages'][-1]
    content = last_message.content.lower()
    
    # Simple logic: If it looks like a question needing facts, research.
    if "?" in content or "search" in content or "find" in content or "compare" in content:
        return {"next": "researcher"}
    return {"next": "responder"}

# 6. Researcher (The "Hunter")
def researcher_node(state: AgentState):
    last_message = state['messages'][-1]
    query = last_message.content
    
    try:
        results = search_tool.invoke(query)
        # We add the findings as a "System Message" so the AI treats it as fact
        return {"messages": [SystemMessage(content=f"SEARCH DATA: {results}")]}
    except Exception as e:
        return {"messages": [SystemMessage(content=f"SEARCH FAILED: {str(e)}")]}

# 7. Responder (The "Analyst")
def responder_node(state: AgentState):
    # The LLM now sees the ENTIRE history (User -> AI -> User -> Search Data)
    
    persona = (
        "You are Sentinel. A ruthlessly efficient intelligence analyst. "
        "Use the provided SEARCH DATA to answer the user. "
        "If the user refers to previous topics (like 'he', 'it', 'that company'), use the CHAT HISTORY to understand context. "
        "Format with Markdown tables and bold text."
    )
    
    # We prepend the persona to the history just for this call
    all_messages = [SystemMessage(content=persona)] + state['messages']
    
    response = llm.invoke(all_messages)
    return {"messages": [response]}

# 8. Build Graph
workflow = StateGraph(AgentState)

workflow.add_node("supervisor", supervisor_node)
workflow.add_node("researcher", researcher_node)
workflow.add_node("responder", responder_node)

workflow.set_entry_point("supervisor")

workflow.add_conditional_edges(
    "supervisor",
    lambda x: x['next'],  # Read the 'next' key we set in supervisor_node
    {
        "researcher": "researcher",
        "responder": "responder"
    }
)

# FAST PATH: Researcher -> Responder (No Reviewer Loop)
workflow.add_edge("researcher", "responder")
workflow.add_edge("responder", END)

# Enable Memory
memory = MemorySaver()
app = workflow.compile(checkpointer=memory)