import type { ClineMessage } from "@roo-code/types"
import { findLast } from "@roo/array"

/**
 * `ts` of the latest `api_req_started` whose payload has no `cost` yet (open API round / streaming).
 * Pass messages after `combineApiRequests` when your pipeline merges finish rows into start.
 */
export function getActiveApiRequestStartTs(messages: ClineMessage[]): number | undefined {
	const lastApiReqStarted = findLast(messages, (m: ClineMessage) => m.say === "api_req_started")
	if (!lastApiReqStarted?.text) {
		return undefined
	}
	try {
		const cost = JSON.parse(lastApiReqStarted.text).cost
		if (cost === undefined) {
			return lastApiReqStarted.ts
		}
	} catch {
		return undefined
	}
	return undefined
}

/**
 * Whether the reasoning/thinking row should show a live timer: partial message, or same API round as
 * {@link getActiveApiRequestStartTs} until the server response completes.
 */
export function isReasoningTimerActive(message: ClineMessage, activeApiRequestStartTs?: number): boolean {
	if (message.type !== "say") {
		return false
	}
	const isReasoningRow =
		message.say === "reasoning" ||
		(message.say === "text" && /^(thought|thinking)$/i.test((message.text ?? "").trim()))
	if (!isReasoningRow) {
		return false
	}
	if (message.partial === true) {
		return true
	}
	if (activeApiRequestStartTs !== undefined && message.ts > activeApiRequestStartTs) {
		return true
	}
	return false
}
