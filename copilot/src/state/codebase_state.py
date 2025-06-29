"""
Codebase State - State definition for the code agent.
"""

from typing import Optional
from copilotkit import CopilotKitState


class CodebaseState(CopilotKitState):
    """
    Codebase State

    Inherits from CopilotKitState and adds Codebase-specific fields.
    """

    devpod_address: Optional[str] = None
