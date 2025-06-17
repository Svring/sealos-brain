# python -m agents.codebase_agent.codebase_agent
from typing import Any, Literal

from copilotkit import CopilotKitState

from langgraph.graph import StateGraph, END
from langgraph.types import Command
from langgraph.prebuilt import ToolNode

from langchain_core.messages import (
    SystemMessage,
    AIMessage,
)
from langchain_core.runnables import RunnableConfig

from src.provider.backbone_provider import get_sealos_model
from src.tool.codebase_tool import (
    codebase_find_files,
    codebase_editor_command,
    codebase_npm_script,
)


class CodebaseState(CopilotKitState):
    place_holder: Any = None


llm = get_sealos_model("gemini-2.5-flash-preview-05-20")
tools = [
    codebase_find_files,
    codebase_editor_command,
    codebase_npm_script,
]

llm_with_tools = llm.bind_tools(tools, parallel_tool_calls=False)


async def code_agent_node(
    state: CodebaseState, config: RunnableConfig
) -> Command[Literal["tool_node", "__end__"]]:
    """
    Codebase Agent Node
    Handles model binding, system prompts, Sealos context, and tool calls.
    """

    # Build messages with system prompt and optional Sealos data
    system_prompt = config.get("configurable", {}).get(
        "system_prompt",
        "",
    )

    messages = [SystemMessage(content=system_prompt)]
    messages.extend(state["messages"])

    # Get model response
    response = await llm_with_tools.ainvoke(messages, config)

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
workflow = StateGraph(CodebaseState)
workflow.add_node("code_agent_node", code_agent_node)
workflow.add_node("tool_node", ToolNode(tools=tools))
workflow.add_edge("tool_node", "code_agent_node")
workflow.set_entry_point("code_agent_node")

# Compile the workflow graph
graph = workflow.compile()
