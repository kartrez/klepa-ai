import { describe, it, expect, vi, beforeEach } from "vitest"

import { buildNativeToolsArrayWithRestrictions } from "../build-tools"
import { buildNoModeNativeTools } from "../../modes/nano/client-context"

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

// Mock CodeIndexManager
vi.mock("../../../services/code-index/manager", () => ({
	CodeIndexManager: {
		getInstance: vi.fn().mockReturnValue(undefined),
	},
}))

describe("nano mode limited tools", () => {
	let mockProvider: any

	beforeEach(() => {
		mockProvider = {
			getMcpHub: vi.fn().mockReturnValue(undefined),
			context: {
				globalState: { get: vi.fn().mockReturnValue(undefined) },
				workspaceState: { get: vi.fn().mockReturnValue(undefined) },
			},
		}
	})

	it("should return limited tools array for nano mode client builder", async () => {
		const tools = buildNoModeNativeTools({
			mcpHub: undefined,
			maxReadFileLine: 1000,
			maxConcurrentFileReads: 5,
			diffEnabled: true,
		})

		const toolNames = tools
			.map((tool) => ("function" in tool && tool.function ? tool.function.name : undefined))
			.filter((name): name is string => !!name)

		expect(toolNames).toContain("read_file")
		expect(toolNames).toContain("write_to_file")
		expect(toolNames).toContain("apply_diff")
		expect(toolNames).toContain("attempt_completion")
		expect(toolNames).not.toContain("execute_command")
	})

	it("should return non-empty tools array for code mode", async () => {
		const result = await buildNativeToolsArrayWithRestrictions({
			provider: mockProvider,
			cwd: "/test/cwd",
			mode: "code",
			customModes: undefined,
			experiments: undefined,
			apiConfiguration: undefined,
			maxReadFileLine: 1000,
			maxConcurrentFileReads: 5,
			browserToolEnabled: true,
			diffEnabled: true,
		})

		expect(result.tools.length).toBeGreaterThan(0)
	})
})
