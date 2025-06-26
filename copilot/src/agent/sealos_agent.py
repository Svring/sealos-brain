"""
Sealos Agent - A CopilotKit agent for Sealos operations.
It defines the workflow graph, state, tools, nodes and edges.
"""

# python -m src.agent.sealos_agent
from typing import Any
from typing_extensions import Literal

from copilotkit import CopilotKitState

from langchain_core.messages import (
    AIMessage,
    HumanMessage,
    SystemMessage,
)
from langchain_core.runnables import RunnableConfig
from langgraph.graph import StateGraph, END
from langgraph.types import Command
from langgraph.prebuilt import ToolNode

from src.provider.backbone_provider import get_sealos_model

from langchain_core.tools import tool

# Get the model
llm = get_sealos_model("gpt-4.1")


@tool
def greeting(name: str):
    """Greet a user by name."""
    return f"Hello, {name}! Welcome to Sealos!"


# Define available tools
tools = [greeting]


class SealosAgentState(CopilotKitState):
    """
    Sealos Agent State

    Inherits from CopilotKitState and adds Sealos-specific fields.
    """


async def sealos_agent_node(
    state: SealosAgentState, config: RunnableConfig
) -> Command[Literal["tool_node", "__end__"]]:
    """
    Optimized chat node based on the ReAct design pattern.
    Handles model binding, system prompts, Sealos context, and tool calls.
    """

    # Only bind tools when copilotkit and actions both exist
    if state.get("copilotkit") and state["copilotkit"].get("actions"):
        copilotkit = state["copilotkit"]["actions"]
        # Bind tools to model
        model_with_tools = llm.bind_tools(copilotkit, parallel_tool_calls=False)
    else:
        # Use model without tools when copilotkit actions are not available
        model_with_tools = llm

    # Build messages with system prompt and optional Sealos data
    system_prompt = config.get("configurable", {}).get(
        "system_prompt",
        "",
    )

    messages = [SystemMessage(content=system_prompt)]
    # if state.get("sealos_data"):
    #     messages.append(
    #         HumanMessage(content=f"Current sealos data is {state['sealos_data']}")
    #     )
    messages.extend(state["messages"])

    # Get model response
    response = await model_with_tools.ainvoke(messages, config)

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
workflow = StateGraph(SealosAgentState)
workflow.add_node("sealos_agent_node", sealos_agent_node)
workflow.add_node("tool_node", ToolNode(tools=tools))
workflow.add_edge("tool_node", "sealos_agent_node")
workflow.set_entry_point("sealos_agent_node")

# Compile the workflow graph
graph = workflow.compile()
