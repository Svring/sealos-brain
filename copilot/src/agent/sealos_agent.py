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
from src.utils.context_utils import (
    get_config_values,
    get_state_values,
    get_copilot_actions,
    has_copilot_actions,
)


class SealosBrainState(CopilotKitState):
    """
    Sealos Brain State

    Inherits from CopilotKitState and adds Sealos-specific fields.
    """


async def sealos_brain_node(
    state: SealosBrainState, config: RunnableConfig
) -> Command[Literal["tool_node", "__end__"]]:
    """
    Optimized chat node based on the ReAct design pattern.
    Handles model binding, system prompts, Sealos context, and tool calls.
    """

    # Extract configuration data
    base_url, api_key, system_prompt = get_config_values(
        config, {"base_url": None, "api_key": None, "system_prompt": ""}
    )

    # Extract state data
    (messages,) = get_state_values(state, {"messages": []})

    # Determine if tools should be bound
    should_bind_tools = has_copilot_actions(state)

    llm = get_sealos_model("gpt-4o", base_url, api_key)

    # Only bind tools when copilotkit and actions both exist
    if should_bind_tools:
        copilotkit = get_copilot_actions(state)
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
            for action in get_copilot_actions(state)
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
