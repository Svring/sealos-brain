# python -m src.agent.chat_agent
import json
import uuid
import asyncio
from typing import Any

from copilotkit import CopilotKitState

from langgraph.checkpoint.memory import InMemorySaver
from langgraph.prebuilt import create_react_agent
from langchain_core.messages import (
    HumanMessage,
    SystemMessage,
    AIMessage,
    ToolMessage,
)
from langchain_core.runnables import RunnableConfig
from langgraph.managed import RemainingSteps

from provider.backbone_provider import get_sealos_model


class ChatAgentState(CopilotKitState):
    devbox_list: Any = None
    remaining_steps: RemainingSteps = RemainingSteps  # required by create_react_agent


def make_config(thread_id: str, user_id: str) -> RunnableConfig:
    """Return a config dict with the given parameters, including structured task_plan."""
    return {
        "configurable": {
            "thread_id": thread_id,
            "user_id": user_id,
        }
    }


def make_chat_agent_state(topic: str) -> ChatAgentState:
    """Return a ChatAgentState instance with the given topic."""
    return ChatAgentState(topic=topic)


def build_chat_agent_prompt(state: ChatAgentState, config: RunnableConfig):
    devbox_list_str = state["devbox_list"]

    return [
        SystemMessage(
            content="""You are a specialized chat assistant AI whose primary task is to answer the question based on the provided topic. 

            Your responsibilities include:
            - Analyzing the topic and understanding the question
            - Answering the question based on the topic
            - Following best practices and maintaining chat quality"""
        ),
        HumanMessage(content=f"Current devbox list is {devbox_list_str}"),
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
                print("🔧 Tool Calls:")
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
                except Exception as e:
                    print(e)
                    print(f"   {message.content}")

    print("-" * 40)


async def run_chat_agent(
    config: RunnableConfig,
    state: ChatAgentState,
):
    """
    Gather the config, state, and agent into a single function.
    Returns (agent, config, state)
    """

    topic = state["topic"]

    agent = create_react_agent(
        model=get_sealos_model("claude-3-5-sonnet-20240620"),
        tools=[],
        state_schema=ChatAgentState,
        checkpointer=InMemorySaver(),
        prompt=build_chat_agent_prompt,
    )

    print("🤖 Starting Chat Agent...")
    print("=" * 80)

    async for chunk in agent.astream(
        {
            "topic": topic,
            "messages": [HumanMessage(content=f"hello, the current topic is {topic}")],
        },
        config=config,
        stream_mode="updates",
    ):
        display_agent_chunk(chunk)


def test_run_chat_agent_dummy():
    """Test run_chat_agent with dummy config and state."""
    thread_id = str(uuid.uuid4())
    user_id = "123"
    config = make_config(thread_id, user_id)
    state = make_chat_agent_state("travel")

    try:
        asyncio.run(run_chat_agent(config, state))
        print("run_chat_agent executed successfully.")
    except Exception as e:
        print(f"run_chat_agent raised an exception: {e}")
        raise


graph = create_react_agent(
    model=get_sealos_model("claude-3-5-sonnet-20240620"),
    tools=[],
    state_schema=ChatAgentState,
    # checkpointer=InMemorySaver(),
    prompt=build_chat_agent_prompt,
)


if __name__ == "__main__":
    test_run_chat_agent_dummy()
