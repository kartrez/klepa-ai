import { describe, it, expect, vi, beforeEach } from "vitest"

import { SYSTEM_PROMPT } from "../system"
import { buildNanoModeSystemPrompt } from "../../modes/nano/client-context"

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

describe("nano mode minimal context", () => {
	let mockContext: any

	beforeEach(() => {
		mockContext = {
			globalState: { get: vi.fn().mockReturnValue(undefined) },
			workspaceState: { get: vi.fn().mockReturnValue(undefined) },
		}
	})

	it("should build dedicated nano mode system prompt", async () => {
		const prompt = await buildNanoModeSystemPrompt({
			context: mockContext,
			cwd: "/test/cwd",
			settings: {
				maxConcurrentFileReads: 5,
				todoListEnabled: true,
				useAgentRules: true,
				newTaskRequireTodos: false,
				toolProtocol: "xml",
			},
		})

		expect(prompt).not.toBe("")
		expect(prompt).toContain("Nano mode")
		expect(prompt).toContain("read_file")
		expect(prompt).toContain("list_files")
		expect(prompt).toContain("write_to_file")
		expect(prompt).toContain("apply_diff")
	})

	it("should omit detailed tool hints for native-tools models", async () => {
		const prompt = await buildNanoModeSystemPrompt({
			context: mockContext,
			cwd: "/test/cwd",
			modelInfo: { supportsNativeTools: true } as any,
			settings: {
				maxConcurrentFileReads: 5,
				todoListEnabled: true,
				useAgentRules: true,
				newTaskRequireTodos: false,
				toolProtocol: "native",
			},
		})

		expect(prompt).not.toContain("## read_file")
		expect(prompt).not.toContain("## write_to_file")
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
