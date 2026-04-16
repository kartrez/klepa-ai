import * as vscode from "vscode"
import type OpenAI from "openai"
import { type CustomModePrompts, type ModeConfig, type ModelInfo } from "@roo-code/types"

import { type ClineProviderState } from "../../webview/ClineProvider"
import { type DiffStrategy } from "../../../shared/tools"
import { formatLanguage } from "../../../shared/language"
import { isEmpty } from "../../../utils/object"
import { type McpHub } from "../../../services/mcp/McpHub"
import type { SkillsManager } from "../../../services/skills/SkillsManager"
import { getModeBySlug, getModeSelection, getGroupName, modes } from "../../../shared/modes"
import { type SystemPromptSettings } from "../../prompts/types"
import {
	getReadFileDescription,
	getListFilesDescription,
	getWriteToFileDescription,
	getAskFollowupQuestionDescription,
	getAttemptCompletionDescription,
	getUseMcpToolDescription,
	getAccessMcpResourceDescription,
} from "../../prompts/tools"
import { addCustomInstructions } from "../../prompts/sections"
import type { ToolArgs } from "../../prompts/tools/types"
import { getNativeTools, getMcpServerTools } from "../../prompts/tools/native-tools"
import { NANO_MODE_ALLOWED_TOOL_SET, NANO_MODE_PRIMARY_TOOLS } from "./constants"

const NO_MODE_SLUG = "nano"

function hasAnyMcpResources(mcpHub: McpHub): boolean {
	return mcpHub.getServers().some((server) => server.resources && server.resources.length > 0)
}

function getNanoModePromptComponent(
	customModePrompts: CustomModePrompts | undefined,
): CustomModePrompts[string] | undefined {
	const component = customModePrompts?.[NO_MODE_SLUG]
	return isEmpty(component) ? undefined : component
}

function getNoModeToolCatalogXml(cwd: string, diffStrategy: DiffStrategy | undefined, mcpHub: McpHub | undefined): string {
	const toolArgs: ToolArgs = {
		cwd,
		supportsComputerUse: false,
		partialReadsEnabled: true,
		diffStrategy,
		mcpHub,
	}

	const descriptions = [
		getReadFileDescription(toolArgs),
		getListFilesDescription(toolArgs),
		getWriteToFileDescription(toolArgs),
		diffStrategy ? diffStrategy.getToolDescription({ cwd, toolOptions: undefined }) : "",
		getAskFollowupQuestionDescription(),
		getAttemptCompletionDescription(toolArgs),
	]

	if (mcpHub && mcpHub.getServers().length > 0) {
		const useMcpToolDescription = getUseMcpToolDescription(toolArgs)
		const accessMcpResourceDescription = getAccessMcpResourceDescription(toolArgs)
		if (useMcpToolDescription) {
			descriptions.push(useMcpToolDescription)
		}
		if (accessMcpResourceDescription) {
			descriptions.push(accessMcpResourceDescription)
		}
	}

	return `# Tools\n\n${descriptions.filter(Boolean).join("\n\n")}`
}

function getCompactSkillsSection(skillsManager: SkillsManager | undefined): string {
	if (!skillsManager) {
		return ""
	}

	const skills = skillsManager.getSkillsForMode(NO_MODE_SLUG)
	if (skills.length === 0) {
		return ""
	}

	const lines = skills.map((skill) => `- ${skill.name}: ${skill.description} (${skill.path})`)
	return `## Skills\n${lines.join("\n")}\nUse relevant skills when they directly apply.`
}

function getCompactMcpSection(mcpHub: McpHub | undefined): string {
	if (!mcpHub) {
		return ""
	}

	const servers = mcpHub.getServers()
	if (servers.length === 0) {
		return ""
	}

	const lines = servers.map((server) => {
		const toolNames = (server.tools ?? []).filter((tool) => tool.enabledForPrompt !== false).map((tool) => tool.name)
		const resourceUris = (server.resources ?? []).slice(0, 5).map((resource) => resource.uri)
		const toolsText = toolNames.length > 0 ? toolNames.join(", ") : "none"
		const resourcesText = resourceUris.length > 0 ? resourceUris.join(", ") : "none"
		return `- ${server.name}: tools=${toolsText}; resources=${resourcesText}`
	})

	return `## MCP\n${lines.join("\n")}`
}

export interface BuildNoModeSystemPromptOptions {
	context: vscode.ExtensionContext
	cwd: string
	mcpHub?: McpHub
	modelInfo?: ModelInfo
	diffStrategy?: DiffStrategy
	customModePrompts?: CustomModePrompts
	customModes?: ModeConfig[]
	globalCustomInstructions?: string
	experiments?: Record<string, boolean>
	enableMcpServerCreation?: boolean
	language?: string
	rooIgnoreInstructions?: string
	settings?: SystemPromptSettings
	skillsManager?: SkillsManager
	clineProviderState?: ClineProviderState
}

export async function buildNanoModeSystemPrompt(options: BuildNoModeSystemPromptOptions): Promise<string> {
	const {
		context,
		cwd,
		mcpHub,
		modelInfo,
		diffStrategy,
		customModePrompts,
		customModes,
		globalCustomInstructions,
		language,
		rooIgnoreInstructions,
		settings,
		skillsManager,
		clineProviderState,
	} = options

	const promptComponent = getNanoModePromptComponent(customModePrompts)
	const modeConfig = getModeBySlug(NO_MODE_SLUG, customModes) || modes.find((m) => m.slug === NO_MODE_SLUG)
	const { roleDefinition, baseInstructions } = getModeSelection(NO_MODE_SLUG, promptComponent, customModes)
	const hasMcpGroup = modeConfig?.groups.some((groupEntry) => getGroupName(groupEntry) === "mcp") ?? true
	const shouldIncludeMcp = hasMcpGroup && !!mcpHub && mcpHub.getServers().length > 0
	const hasNativeToolsSupport = modelInfo?.supportsNativeTools === true
	const mcpSection = shouldIncludeMcp ? getCompactMcpSection(mcpHub) : ""
	const skillsSection = getCompactSkillsSection(skillsManager)

	// For models with native tool support, avoid sending text tool hints to minimize prompt tokens.
	const noModeToolCatalog = hasNativeToolsSupport
		? ""
		: `\n\n${getNoModeToolCatalogXml(cwd, diffStrategy, shouldIncludeMcp ? mcpHub : undefined)}`

	const customInstructionsSection = await addCustomInstructions(baseInstructions, globalCustomInstructions || "", cwd, NO_MODE_SLUG, {
		language: language ?? formatLanguage(vscode.env.language),
		rooIgnoreInstructions,
		localRulesToggleState: context.workspaceState.get("localRulesToggles"),
		globalRulesToggleState: context.globalState.get("globalRulesToggles"),
		settings,
	})

	const basePrompt = `${roleDefinition}

You are operating in Nano mode. Keep context usage ultra-minimal and responses concise for software development tasks.
This mode is optimized to reduce context token usage by up to 75%, especially for models that do not support context caching.
Use tools only when needed. Prefer \`${NANO_MODE_PRIMARY_TOOLS.join("`, `")}\`.
When tools are available, execute exactly one clear action per step and avoid verbose explanations.${
		hasNativeToolsSupport
			? ""
			: "\nUse the provided tool descriptions below and follow their format requirements exactly."
	}${noModeToolCatalog}

${mcpSection}
${skillsSection ? `\n${skillsSection}` : ""}

${customInstructionsSection}`

	const appendSystemPrompt = clineProviderState?.appendSystemPrompt
	return appendSystemPrompt ? `${basePrompt}\n\n${appendSystemPrompt}` : basePrompt
}

export interface BuildNoModeNativeToolsOptions {
	mcpHub?: McpHub
	maxReadFileLine: number
	maxConcurrentFileReads: number
	modelInfo?: ModelInfo
	diffEnabled: boolean
	state?: ClineProviderState
}

export function buildNoModeNativeTools(options: BuildNoModeNativeToolsOptions): OpenAI.Chat.ChatCompletionTool[] {
	const { mcpHub, maxReadFileLine, maxConcurrentFileReads, modelInfo, diffEnabled, state } = options
	const partialReadsEnabled = maxReadFileLine !== -1
	const supportsImages = modelInfo?.supportsImages ?? false
	const allowedToolNames = new Set(NANO_MODE_ALLOWED_TOOL_SET)

	if (!diffEnabled) {
		allowedToolNames.delete("apply_diff")
	}
	if (state?.yoloMode) {
		allowedToolNames.delete("ask_followup_question")
	}
	if (!mcpHub) {
		allowedToolNames.delete("use_mcp_tool")
		allowedToolNames.delete("access_mcp_resource")
	} else if (!hasAnyMcpResources(mcpHub)) {
		allowedToolNames.delete("access_mcp_resource")
	}

	const nativeTools = getNativeTools({
		partialReadsEnabled,
		maxConcurrentFileReads,
		supportsImages,
	}).filter((tool) => "function" in tool && tool.function && allowedToolNames.has(tool.function.name))

	const mcpTools = mcpHub && allowedToolNames.has("use_mcp_tool") ? getMcpServerTools(mcpHub) : []
	return [...nativeTools, ...mcpTools]
}
