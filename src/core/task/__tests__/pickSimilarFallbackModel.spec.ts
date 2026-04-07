import { describe, it, expect } from "vitest"

import type { ModelInfo, ModelRecord } from "@roo-code/types"

import { pickSimilarFallbackModelId } from "../pickSimilarFallbackModel"

describe("pickSimilarFallbackModelId", () => {
	it("prefers closest total price, then cache strength, then image match", () => {
		const current: ModelInfo = {
			contextWindow: 128000,
			supportsPromptCache: true,
			supportsImages: true,
			inputPrice: 1,
			outputPrice: 3,
			cacheReadsPrice: 0.1,
		}

		const models: ModelRecord = {
			"model/a": {
				contextWindow: 128000,
				supportsPromptCache: true,
				supportsImages: true,
				inputPrice: 1,
				outputPrice: 3,
				cacheReadsPrice: 0.1,
			},
			"model/b": {
				contextWindow: 128000,
				supportsPromptCache: true,
				supportsImages: false,
				inputPrice: 1,
				outputPrice: 3,
				cacheReadsPrice: 0.1,
			},
			"model/c": {
				contextWindow: 128000,
				supportsPromptCache: false,
				supportsImages: true,
				inputPrice: 1,
				outputPrice: 3,
			},
			"model/d": {
				contextWindow: 128000,
				supportsPromptCache: true,
				supportsImages: true,
				inputPrice: 10,
				outputPrice: 30,
				cacheReadsPrice: 0.5,
			},
		}

		// Same price/cache as current; should skip identity and pick among ties by id order
		expect(pickSimilarFallbackModelId("model/a", current, models)).toBe("model/b")

		const onlyFar = { ...models }
		delete onlyFar["model/b"]
		expect(pickSimilarFallbackModelId("model/a", current, onlyFar)).toBe("model/c")
	})

	it("returns undefined when there is no other model", () => {
		const current: ModelInfo = {
			contextWindow: 100000,
			supportsPromptCache: false,
		}
		const models: ModelRecord = {
			"only-one": { contextWindow: 100000, supportsPromptCache: false },
		}
		expect(pickSimilarFallbackModelId("only-one", current, models)).toBeUndefined()
	})

	it("prefers recommended models before closer-priced non-recommended alternatives", () => {
		const current: ModelInfo = {
			contextWindow: 128000,
			supportsPromptCache: false,
			supportsImages: false,
			inputPrice: 1,
			outputPrice: 1,
		}

		const models: ModelRecord = {
			"model/a": {
				contextWindow: 128000,
				supportsPromptCache: false,
				supportsImages: false,
				inputPrice: 1,
				outputPrice: 1,
			},
			// Worse price match but recommended — must win over `model/close`.
			"model/rec": {
				contextWindow: 128000,
				supportsPromptCache: false,
				supportsImages: false,
				inputPrice: 100,
				outputPrice: 100,
				recommended: true,
			},
			"model/close": {
				contextWindow: 128000,
				supportsPromptCache: false,
				supportsImages: false,
				inputPrice: 1.01,
				outputPrice: 1.01,
			},
		}

		expect(pickSimilarFallbackModelId("model/a", current, models)).toBe("model/rec")
	})

	it("falls back to non-recommended when no recommended candidate exists", () => {
		const current: ModelInfo = {
			contextWindow: 128000,
			supportsPromptCache: false,
			supportsImages: false,
			inputPrice: 1,
			outputPrice: 1,
		}

		const models: ModelRecord = {
			"model/a": {
				contextWindow: 128000,
				supportsPromptCache: false,
				supportsImages: false,
				inputPrice: 1,
				outputPrice: 1,
			},
			"model/b": {
				contextWindow: 128000,
				supportsPromptCache: false,
				supportsImages: false,
				inputPrice: 2,
				outputPrice: 2,
			},
		}

		expect(pickSimilarFallbackModelId("model/a", current, models)).toBe("model/b")
	})
})
