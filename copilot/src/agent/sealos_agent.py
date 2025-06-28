"""
Sealos Agent - A CopilotKit agent for Sealos operations.
It defines the workflow graph, state, tools, nodes and edges.
"""

# python -m src.agent.sealos_agent
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


class SealosBrainState(CopilotKitState):
    """
    Sealos Brain State

    Inherits from CopilotKitState and adds Sealos-specific fields.
    """


def get_config_data(config: RunnableConfig) -> tuple[str | None, str | None, str]:
    """Extract configuration data from config."""
    configurable = config.get("configurable", {})
    base_url = configurable.get("base_url", None)
    api_key = configurable.get("api_key", None)
    system_prompt = configurable.get("system_prompt", "")
    return base_url, api_key, system_prompt


def get_state_data(state: SealosBrainState) -> tuple[list, bool]:
    """Extract state data and determine if tools should be bound."""
    messages = state["messages"]
    should_bind_tools = bool(
        state.get("copilotkit") and state["copilotkit"].get("actions")
    )
    return messages, should_bind_tools


async def sealos_brain_node(
    state: SealosBrainState, config: RunnableConfig
) -> Command[Literal["tool_node", "__end__"]]:
    """
    Optimized chat node based on the ReAct design pattern.
    Handles model binding, system prompts, Sealos context, and tool calls.
    """

    base_url, api_key, system_prompt = get_config_data(config)
    messages, should_bind_tools = get_state_data(state)

    llm = get_sealos_model("gpt-4o", base_url, api_key)

    # Only bind tools when copilotkit and actions both exist
    if should_bind_tools:
        copilotkit = state["copilotkit"]["actions"]
        # Bind tools to model
        model_with_tools = llm.bind_tools(copilotkit, parallel_tool_calls=False)
    else:
        # Use model without tools when copilotkit actions are not available
        model_with_tools = llm

    # Build messages with system prompt and optional Sealos data
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
            for action in state["copilotkit"]["actions"]
        )
    ):
        return Command(goto="tool_node", update={"messages": response})

    return Command(goto=END, update={"messages": response})


# Define the workflow graph
workflow = StateGraph(SealosBrainState)
workflow.add_node("sealos_brain_node", sealos_brain_node)
workflow.add_node("tool_node", ToolNode(tools=[]))
workflow.add_edge("tool_node", "sealos_brain_node")
workflow.set_entry_point("sealos_brain_node")

# Compile the workflow graph
graph = workflow.compile()
