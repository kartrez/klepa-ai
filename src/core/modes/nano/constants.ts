// kilocode_change - centralized no-mode tool policy

export const NANO_MODE_PRIMARY_TOOLS = ["read_file", "write_to_file", "edit_file", "execute_command", "list_files"] as const

export const NANO_MODE_ALLOWED_TOOLS = [
	...NANO_MODE_PRIMARY_TOOLS,
	"use_mcp_tool",
	"access_mcp_resource",
	"ask_followup_question",
	"attempt_completion",
] as const

export const NANO_MODE_ALLOWED_TOOL_SET = new Set<string>(NANO_MODE_ALLOWED_TOOLS)
