import { describe, expect, it } from "vitest"

import type { ApiMessage } from "../../../task-persistence/apiMessages"

import {
	estimateNanoEnvironmentTokens,
	getNanoEffectiveCondensePercent,
	NANO_CONDENSE_CONTEXT_PERCENT_CAP,
	stripEnvironmentDetailsFromOlderUserTurns,
} from "../context-policy"

describe("nano context-policy", () => {
	it("getNanoEffectiveCondensePercent caps global percent", () => {
		expect(getNanoEffectiveCondensePercent(100)).toBe(NANO_CONDENSE_CONTEXT_PERCENT_CAP)
		expect(getNanoEffectiveCondensePercent(40)).toBe(40)
	})

	it("stripEnvironmentDetailsFromOlderUserTurns keeps env only on latest user message", () => {
		const env = (n: number) =>
			`<environment_details>\n# turn ${n}\n</environment_details>`
		const messages: ApiMessage[] = [
			{ role: "user", content: `hello\n${env(1)}`, ts: 1 },
			{ role: "assistant", content: "ok", ts: 2 },
			{ role: "user", content: `world\n${env(2)}`, ts: 3 },
		]
		const out = stripEnvironmentDetailsFromOlderUserTurns(messages)
		expect(out[0].role).toBe("user")
		expect(typeof out[0].content).toBe("string")
		expect((out[0].content as string).includes("<environment_details>")).toBe(false)
		expect((out[0].content as string).includes("hello")).toBe(true)
		expect(out[2].role).toBe("user")
		expect((out[2].content as string).includes("<environment_details>")).toBe(true)
	})

	it("estimateNanoEnvironmentTokens is positive for non-empty strings", () => {
		expect(estimateNanoEnvironmentTokens("")).toBeGreaterThanOrEqual(0)
		expect(estimateNanoEnvironmentTokens("a".repeat(100))).toBeGreaterThan(10)
	})
})
