export const NANO_MINI_SYSTEM_INSTRUCTIONS_MARKER = "[NANO_MINI_SYSTEM_INSTRUCTIONS]"

/**
 * Short system instructions for nano when native tools are available.
 * This intentionally replaces long AGENTS.md/rules to keep system prompt small and stable.
 */
export const NANO_MINI_SYSTEM_INSTRUCTIONS = `
# Nano System Instructions (Mini)

${NANO_MINI_SYSTEM_INSTRUCTIONS_MARKER}

- Keep responses concise and focus on completing the task with minimal back-and-forth.
- Use tools only when needed; perform one clear action per step.
- Never use empty \`catch\` blocks: handle/log the error or rethrow.
- Never disable lint rules without explicit user approval.
- Before completion, ensure relevant tests exist and pass (or are intentionally out of scope).
- For frontend/webview UI changes: prefer Tailwind classes over inline style objects.
`

