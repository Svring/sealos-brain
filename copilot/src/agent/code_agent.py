"""
Code Agent - A CopilotKit agent for codebase operations.
It defines the workflow graph, state, tools, nodes and edges.
"""

# python -m src.agent.code_agent
from typing_extensions import Literal

from copilotkit import CopilotKitState

from langchain_core.messages import (
    AIMessage,
    SystemMessage,
)
from langchain_core.runnables import RunnableConfig
from langgraph.graph import StateGraph, END
from langgraph.types import Command
from langgraph.prebuilt import ToolNode

from src.provider.backbone_provider import get_sealos_model
from src.tool.codebase_tool import (
    codebase_find_files,
    codebase_editor_command,
    codebase_npm_script,
)
from src.utils.context_utils import (
    get_config_values,
    get_state_values,
    get_copilot_actions,
)


class CodebaseState(CopilotKitState):
    """
    Codebase State

    Inherits from CopilotKitState and adds Codebase-specific fields.
    """


async def code_agent_node(
    state: CodebaseState, config: RunnableConfig
) -> Command[Literal["tool_node", "__end__"]]:
    """
    Optimized codebase agent node based on the ReAct design pattern.
    Handles model binding, system prompts, devpod context, and tool calls.
    """

    # Extract configuration data
    base_url, api_key, system_prompt, devpod_address = get_config_values(
        config,
        {
            "base_url": None,
            "api_key": None,
            "system_prompt": "",
            "devpod_address": None,
        },
    )

    # Extract state data
    (messages,) = get_state_values(state, {"messages": []})

    llm = get_sealos_model("gpt-4o-mini", base_url, api_key)

    # Define tools for codebase operations
    tools = [
        codebase_find_files,
        codebase_editor_command,
        codebase_npm_script,
    ]

    # Only bind tools when copilotkit and actions both exist
    model_with_tools = llm.bind_tools(tools)

    # Build messages with system prompt and optional devpod context
    messages_list = [SystemMessage(content=system_prompt)]
    messages_list.extend(messages)

    # Get model response
    response = await model_with_tools.ainvoke(messages_list, config)

    # Handle tool calls - route to tool_node if non-CopilotKit tools are called
    if (
        isinstance(response, AIMessage)
        and response.tool_calls
        and not any(
            action.get("name") == response.tool_calls[0].get("name")
            for action in get_copilot_actions(state)
        )
    ):
        return Command(goto="tool_node", update={"messages": response})

    return Command(goto=END, update={"messages": response})


# Define tools for the tool node
tools = [
    codebase_find_files,
    codebase_editor_command,
    codebase_npm_script,
]

# Define the workflow graph
workflow = StateGraph(CodebaseState)
workflow.add_node("code_agent_node", code_agent_node)
workflow.add_node("tool_node", ToolNode(tools=tools))
workflow.add_edge("tool_node", "code_agent_node")
workflow.set_entry_point("code_agent_node")

# Compile the workflow graph
graph = workflow.compile()
