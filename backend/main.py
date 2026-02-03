from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from app.agents.graph import app as agent_app
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
import json

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/chat")
async def chat_endpoint(request: Request):
    data = await request.json()
    user_query = data.get("query")
    # Get the thread_id from the frontend (or use "default" for testing)
    thread_id = data.get("thread_id", "default_user_session")

    # HENDRICKS UPGRADE: Pass the thread_id to the config
    config = {"configurable": {"thread_id": thread_id}}
    
    # We only send the NEW message. The graph loads the rest from memory automatically.
    initial_state = {"messages": [HumanMessage(content=user_query)]}

    async def event_generator():
        # Pass 'config' here so it knows which memory slot to use
        async for event in agent_app.astream(initial_state, config=config):
            for node_name, node_state in event.items():
                
                # --- SAFETY SHIELD ---
                if not node_state: continue
                if "next" in node_state:
                    yield f"data: [{node_name.upper()}] Routing to {node_state['next']}...\n\n"
                    continue
                
                if "messages" in node_state and len(node_state['messages']) > 0:
                    last_message = node_state['messages'][-1]
                    
                    if isinstance(last_message, (AIMessage, HumanMessage, SystemMessage)):
                        content = last_message.content
                    else:
                        content = str(last_message)
                    
                    if isinstance(content, list):
                        content = "".join([part.get('text', '') for part in content if 'text' in part])

                    yield f"data: [{node_name.upper()}] {content}\n\n"
                
        yield "data: [SYSTEM] MISSION COMPLETE.\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")