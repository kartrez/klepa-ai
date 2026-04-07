import { describe, expect, it } from "vitest"

import { errorCodes } from "../../../shared/kilocode/errorUtils"
import {
	isSimilarModelFallbackAllowed,
	isSimilarModelFallbackBlocked,
	shouldAttemptSimilarModelFallback,
} from "../similarModelFallbackErrorClassification"

describe("similarModelFallbackErrorClassification", () => {
	it("blocks payment and auth-style errors", () => {
		expect(isSimilarModelFallbackBlocked({ status: 402 })).toBe(true)
		expect(isSimilarModelFallbackBlocked({ status: 401, code: errorCodes.PAID_MODEL_AUTH_REQUIRED })).toBe(
			true,
		)
		expect(isSimilarModelFallbackBlocked({ status: 401, message: "generic" })).toBe(true)
		expect(
			isSimilarModelFallbackBlocked({
				status: 429,
				code: errorCodes.PROMOTION_MODEL_LIMIT_REACHED,
			}),
		).toBe(true)
	})

	it("blocks user cancellation", () => {
		expect(isSimilarModelFallbackBlocked(new Error("Request cancelled by user"))).toBe(true)
	})

	it("allows typical transient HTTP statuses when not blocked", () => {
		expect(shouldAttemptSimilarModelFallback({ status: 503 })).toBe(true)
		expect(shouldAttemptSimilarModelFallback({ status: 502 })).toBe(true)
		expect(shouldAttemptSimilarModelFallback({ status: 504 })).toBe(true)
		expect(shouldAttemptSimilarModelFallback({ status: 524 })).toBe(true)
		expect(shouldAttemptSimilarModelFallback({ status: 429 })).toBe(true)
	})

	it("allows network-style messages", () => {
		expect(isSimilarModelFallbackAllowed(new Error("socket hang up"))).toBe(true)
		expect(isSimilarModelFallbackAllowed(new Error("fetch failed"))).toBe(true)
	})

	it("allows terminated stream wording", () => {
		expect(isSimilarModelFallbackAllowed(new Error("stream terminated by provider"))).toBe(true)
	})

	it("allows invalid OpenRouter model (400)", () => {
		expect(
			shouldAttemptSimilarModelFallback({
				status: 400,
				message: "is not a valid model",
			}),
		).toBe(true)
	})

	it("allows alpha period ended (404)", () => {
		expect(
			shouldAttemptSimilarModelFallback({
				status: 404,
				message: "this was a stealth model during the alpha period but the alpha period has ended",
			}),
		).toBe(true)
	})

	it("does not allow unknown opaque errors (conservative)", () => {
		expect(shouldAttemptSimilarModelFallback(new Error("something went wrong"))).toBe(false)
	})
})
