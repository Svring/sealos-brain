# python -m agents.codebase_agent.codebase_agent
from typing import Any
import json
import os
import uuid
import asyncio

from langgraph.checkpoint.memory import InMemorySaver
from langgraph.prebuilt import create_react_agent
from langgraph.prebuilt.chat_agent_executor import AgentState
from langchain_core.messages import (
    HumanMessage,
    SystemMessage,
    AIMessage,
    ToolMessage,
)
from langchain_core.runnables import RunnableConfig

from src.provider.backbone_provider import get_sealos_model
from src.tool.codebase_tool import (
    codebase_find_files,
    codebase_editor_command,
    codebase_npm_script,
    task_completion,
)


class CodebaseState(AgentState):
    project_structure: dict[str, Any]


def make_config(
    thread_id: str, user_id: str, token: str, project_address: str
) -> RunnableConfig:
    """Return a config dict with the given parameters, including structured task_plan."""
    return {
        "configurable": {
            "thread_id": thread_id,
            "user_id": user_id,
            "token": token,
            "project_address": project_address,
        }
    }


def make_codebase_state(project_structure: dict[str, Any]) -> CodebaseState:
    """Return a CodebaseState instance with the given project_structure as a dict."""
    return CodebaseState(project_structure=project_structure)


def build_codebase_agent_prompt(state: CodebaseState, config: RunnableConfig):
    project_structure_str = json.dumps(state["project_structure"], indent=2)

    return [
        SystemMessage(
            content="""You are a specialized code assistant AI whose primary task is to implement the specified Functionalities based on the provided Design Principles and Additional Notes. 

            Your responsibilities include:
            - Analyzing the project structure and understanding the existing codebase
            - Implementing each functionality according to the design principles and requirements
            - Following best practices and maintaining code quality
            - Ensuring all implementations align with the additional notes and constraints

            Before any operation, you should first check if the project structure is accurate with the codebase_find_files tool. Use the provided context to understand the project requirements and implement the functionalities systematically."""
        ),
        HumanMessage(
            content=f"Current Project structure (JSON):\n{project_structure_str}"
        ),
        HumanMessage(
            content="""
            You are a specialized code assistant AI whose primary task is to implement the specified Functionalities based on the provided Design Principles and Additional Notes.
            """
        ),
        *state["messages"],
    ]


def display_agent_chunk(chunk: dict):
    for node_name, node_data in chunk.items():
        messages = node_data.get("messages", [])

        for message in messages:
            # Handle AIMessage for agent node
            is_agent_ai_message = node_name == "agent" and isinstance(
                message, AIMessage
            )
            has_content = is_agent_ai_message and message.content
            has_tool_calls = (
                is_agent_ai_message
                and hasattr(message, "tool_calls")
                and message.tool_calls
            )

            print(f"🤖 Agent: {message.content}") if has_content else None

            if has_tool_calls:
                print(f"🔧 Tool Calls:")
                for tool_call in message.tool_calls:
                    print(f"   - {tool_call['name']}: {tool_call['args']}")

            # Handle HumanMessage for agent node
            is_agent_human_message = node_name == "agent" and isinstance(
                message, HumanMessage
            )
            print(f"👤 Human: {message.content}") if is_agent_human_message else None

            # Handle ToolMessage for tools node
            is_tools_tool_message = node_name == "tools" and isinstance(
                message, ToolMessage
            )
            is_error = is_tools_tool_message and message.status == "error"
            is_success = is_tools_tool_message and message.status != "error"

            (
                print(f"❌ Tool Error ({message.name}): {message.content}")
                if is_error
                else None
            )

            if is_success:
                print(f"✅ Tool Result ({message.name}):")
                try:
                    result = (
                        json.loads(message.content)
                        if isinstance(message.content, str)
                        else message.content
                    )
                    print(json.dumps(result, indent=2))
                except:
                    print(f"   {message.content}")

    print("-" * 40)


async def run_codebase_agent(
    config: RunnableConfig,
    state: CodebaseState,
):
    """
    Gather the config, state, and agent into a single function.
    Returns (agent, config, state)
    """

    agent = create_react_agent(
        model=get_sealos_model("claude-3-5-sonnet-20240620"),
        tools=[
            codebase_find_files,
            codebase_editor_command,
            codebase_npm_script,
            task_completion,
        ],
        state_schema=CodebaseState,
        checkpointer=InMemorySaver(),
        prompt=build_codebase_agent_prompt,
    )

    print("🤖 Starting Codebase Agent...")
    print("=" * 80)

    async for chunk in agent.astream(
        {
            "messages": [
                HumanMessage(
                    content="hello, the current project structure is not accurate so you need to read some files by yourself. After you've understand the current project structure, report back to me with the project structure in json format, with each file's usage and path. You can use the codebase_find_files tool to find the files."
                )
            ],
            "project_structure": state["project_structure"],
        },
        config=config,
        stream_mode="updates",
    ):
        display_agent_chunk(chunk)


def test_run_codebase_agent_dummy():
    """Test run_codebase_agent with dummy config and state."""
    thread_id = str(uuid.uuid4())

    # Read task plan info from JSON file
    json_path = os.path.join(
        os.path.dirname(__file__),
        "../../task_plans/dummy_plan.json",
    )
    json_path = os.path.abspath(json_path)
    project_structure = {"project": []}

    config = make_config(thread_id, "user_id", "token", "project_address")
    state = make_codebase_state(project_structure)

    try:
        asyncio.run(run_codebase_agent(config, state))
        print("run_codebase_agent executed successfully.")
    except Exception as e:
        print(f"run_codebase_agent raised an exception: {e}")
        raise


if __name__ == "__main__":
    test_run_codebase_agent_dummy()
