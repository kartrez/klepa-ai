import { describe, it, expect, vi, beforeEach } from "vitest"

import { SYSTEM_PROMPT } from "../system"

// Mock vscode
vi.mock("vscode", () => ({
	env: {
		language: "en",
		shell: "/bin/bash",
	},
	workspace: {
		getConfiguration: vi.fn().mockReturnValue({
			get: vi.fn(),
		}),
	},
}))

// Mock os
vi.mock("os", () => ({
	type: vi.fn().mockReturnValue("Linux"),
}))

describe("no-mode minimal context", () => {
	let mockContext: any

	beforeEach(() => {
		mockContext = {
			globalState: { get: vi.fn().mockReturnValue(undefined) },
			workspaceState: { get: vi.fn().mockReturnValue(undefined) },
		}
	})

	it("should return empty system prompt for no-mode", async () => {
		const prompt = await SYSTEM_PROMPT(
			mockContext,
			"/test/cwd",
			false, // supportsComputerUse
			undefined, // mcpHub
			undefined, // diffStrategy
			"900x600", // browserViewportSize
			"no-mode", // inputMode
			undefined, // customModePrompts
			undefined, // customModes
			undefined, // globalCustomInstructions
			undefined, // diffEnabled
			undefined, // experiments
			undefined, // enableMcpServerCreation
			undefined, // language
			undefined, // rooIgnoreInstructions
			undefined, // partialReadsEnabled
			undefined, // settings
			undefined, // todoList
			undefined, // modelId
			undefined, // skillsManager
			undefined, // clineProviderState
		)

		expect(prompt).toBe("")
	})

	it("should return non-empty system prompt for code mode", async () => {
		const prompt = await SYSTEM_PROMPT(
			mockContext,
			"/test/cwd",
			false, // supportsComputerUse
			undefined, // mcpHub
			undefined, // diffStrategy
			"900x600", // browserViewportSize
			"code", // inputMode
			undefined, // customModePrompts
			undefined, // customModes
			undefined, // globalCustomInstructions
			undefined, // diffEnabled
			undefined, // experiments
			undefined, // enableMcpServerCreation
			undefined, // language
			undefined, // rooIgnoreInstructions
			undefined, // partialReadsEnabled
			undefined, // settings
			undefined, // todoList
			undefined, // modelId
			undefined, // skillsManager
			undefined, // clineProviderState
		)

		expect(prompt).not.toBe("")
		expect(prompt).toContain("Klepa AI")
	})
})
