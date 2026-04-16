// kilocode_change - centralized no-mode tool policy

export const NANO_MODE_PRIMARY_TOOLS = ["read_file", "write_to_file", "apply_diff", "execute_command", "list_files"] as const

export const NANO_MODE_ALLOWED_TOOLS = [
	...NANO_MODE_PRIMARY_TOOLS,
	"search_files",
	"edit_file",
	"use_mcp_tool",
	"access_mcp_resource",
	"ask_followup_question",
	"attempt_completion",
	"update_todo_list",
] as const

export const NANO_MODE_ALLOWED_TOOL_SET = new Set<string>(NANO_MODE_ALLOWED_TOOLS)
