// kilocode_change - new file
/**
 * Context / history policy for the lightweight "nano" mode.
 */

import type Anthropic from "@anthropic-ai/sdk"

import type { ApiMessage } from "../../task-persistence/apiMessages"

/** Condense earlier than global default to limit history growth (percent of context window). */
export const NANO_CONDENSE_CONTEXT_PERCENT_CAP = 55

/** Soft cap for estimated tokens in `<environment_details>` for nano (offline heuristic). */
export const NANO_ENV_MAX_ESTIMATED_TOKENS = 900

export function getNanoEffectiveCondensePercent(globalPercent: number): number {
	return Math.min(globalPercent, NANO_CONDENSE_CONTEXT_PERCENT_CAP)
}

const ENV_BLOCK_REGEX = /<environment_details>[\s\S]*?<\/environment_details>/gi

function stripEnvFromString(text: string): string {
	ENV_BLOCK_REGEX.lastIndex = 0
	return text.replace(ENV_BLOCK_REGEX, "").replace(/\n{3,}/g, "\n\n").trim()
}

function stripEnvFromUserMessage(msg: ApiMessage): ApiMessage {
	if (msg.role !== "user") {
		return msg
	}
	if (typeof msg.content === "string") {
		const next = stripEnvFromString(msg.content)
		if (next === msg.content) {
			return msg
		}
		if (next.length === 0) {
			return { ...msg, content: "[previous environment_details omitted]" }
		}
		return { ...msg, content: next }
	}
	const blocks = msg.content as Anthropic.Messages.ContentBlockParam[]
	let changed = false
	const newBlocks: Anthropic.Messages.ContentBlockParam[] = []
	for (const block of blocks) {
		if (block.type === "text" && typeof block.text === "string") {
			const next = stripEnvFromString(block.text)
			if (next !== block.text) {
				changed = true
			}
			if (next.length > 0) {
				newBlocks.push({ ...block, text: next })
			} else {
				changed = true
			}
		} else {
			newBlocks.push(block)
		}
	}
	if (!changed) {
		return msg
	}
	if (newBlocks.length === 0) {
		return { ...msg, content: [{ type: "text", text: "[previous environment_details omitted]" }] }
	}
	return { ...msg, content: newBlocks }
}

/**
 * Drops `<environment_details>` from every user turn except the latest user message.
 * Reduces token growth in long nano sessions without removing the current turn's env.
 */
export function stripEnvironmentDetailsFromOlderUserTurns(messages: ApiMessage[]): ApiMessage[] {
	const userIndices: number[] = []
	messages.forEach((m, i) => {
		if (m.role === "user") {
			userIndices.push(i)
		}
	})
	if (userIndices.length <= 1) {
		return messages
	}
	const lastUserIdx = userIndices[userIndices.length - 1]!
	let anyChange = false
	const next = messages.map((msg, idx) => {
		if (msg.role !== "user" || idx === lastUserIdx) {
			return msg
		}
		const stripped = stripEnvFromUserMessage(msg)
		if (stripped !== msg) {
			anyChange = true
		}
		return stripped
	})
	return anyChange ? next : messages
}

export function estimateNanoEnvironmentTokens(details: string): number {
	const words = details.match(/[A-Za-z_][A-Za-z0-9_/-]*/g)?.length ?? 0
	const numbersAndSymbols = details.match(/[0-9<>{}\[\]()`~!@#$%^&*+=|\\:;"',.?/-]+/g)?.length ?? 0
	const cjkChars = details.match(/[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]/g)?.length ?? 0
	const newlineCount = details.match(/\n/g)?.length ?? 0
	const charBasedFloor = Math.ceil(details.length / 5)
	return Math.max(
		charBasedFloor,
		Math.ceil(words * 1.3 + numbersAndSymbols * 0.6 + cjkChars + newlineCount * 0.15),
	)
}
