import { describe, it, expect, vi, beforeEach } from "vitest"

import { buildNativeToolsArrayWithRestrictions } from "../build-tools"

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

describe("no-mode no tools", () => {
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

	it("should return empty tools array for no-mode", async () => {
		const result = await buildNativeToolsArrayWithRestrictions({
			provider: mockProvider,
			cwd: "/test/cwd",
			mode: "no-mode",
			customModes: undefined,
			experiments: undefined,
			apiConfiguration: undefined,
			maxReadFileLine: 1000,
			maxConcurrentFileReads: 5,
			browserToolEnabled: true,
			diffEnabled: true,
		})

		expect(result.tools).toEqual([])
		expect(result.allowedFunctionNames).toEqual([])
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
