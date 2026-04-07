// kilocode_change - new file
import { checkContextWindowExceededError } from "../context/context-management/context-error-handling"
import {
	isAlphaPeriodEndedError,
	isModelNotAllowedForTeamError,
	isOpenRouterInvalidModelError,
	isPaymentRequiredError,
	isUnauthorizedGenericError,
	isUnauthorizedPaidModelError,
	isUnauthorizedPromotionLimitError,
	KILOCODE_TOKEN_REQUIRED_ERROR,
} from "../../shared/kilocode/errorUtils"

/**
 * Explicit allow / deny lists for "try a similar model" fallback.
 *
 * Policy: if {@link isSimilarModelFallbackBlocked} → never switch.
 * Else if {@link isSimilarModelFallbackAllowed} → may switch (caller still checks catalog / one swap per streak).
 * Otherwise we do **not** switch (conservative; extend the allow list as we learn).
 */

function getErrorMessage(error: unknown): string {
	if (error instanceof Error) {
		return error.message ?? ""
	}
	if (typeof error === "string") {
		return error
	}
	if (typeof error === "object" && error !== null && "message" in error) {
		const m = (error as { message?: unknown }).message
		return typeof m === "string" ? m : ""
	}
	return ""
}

function getHttpStatus(error: unknown): number | undefined {
	if (typeof error === "object" && error !== null && "status" in error) {
		const s = (error as { status?: unknown }).status
		if (typeof s === "number" && Number.isFinite(s)) {
			return s
		}
	}
	return undefined
}

/** User cancelled the in-flight request — not fixable by changing model. */
function isUserCancellationError(error: unknown): boolean {
	const m = getErrorMessage(error)
	return /request cancelled by user|cancelled by user/i.test(m)
}

/**
 * Errors that clearly should **not** trigger an automatic similar-model swap.
 * (Auth, billing, policy, context limits, missing credentials, etc.)
 */
export function isSimilarModelFallbackBlocked(error: unknown): boolean {
	if (isUserCancellationError(error)) {
		return true
	}
	if (checkContextWindowExceededError(error)) {
		return true
	}
	if (isPaymentRequiredError(error)) {
		return true
	}
	if (isUnauthorizedPaidModelError(error)) {
		return true
	}
	if (isUnauthorizedGenericError(error)) {
		return true
	}
	if (isUnauthorizedPromotionLimitError(error)) {
		return true
	}
	if (isModelNotAllowedForTeamError(error)) {
		return true
	}
	const msg = getErrorMessage(error)
	if (msg.includes(KILOCODE_TOKEN_REQUIRED_ERROR)) {
		return true
	}
	return false
}

/**
 * Errors that are good candidates for trying another model with similar price/capabilities.
 * Keep this list explicit; unknown errors do not get a model swap.
 */
export function isSimilarModelFallbackAllowed(error: unknown): boolean {
	const status = getHttpStatus(error)

	// Upstream / proxy unavailable — often transient or route-specific.
	if (status === 502 || status === 503 || status === 504) {
		return true
	}
	// Cloudflare / some gateways
	if (status === 524) {
		return true
	}
	// Rate limits — another SKU may have separate limits.
	if (status === 429) {
		return true
	}

	// Model routing / lifecycle — switching model is the intended recovery.
	if (isOpenRouterInvalidModelError(error) || isAlphaPeriodEndedError(error)) {
		return true
	}

	const msg = getErrorMessage(error).toLowerCase()

	// Network / transport (wording varies by runtime and provider).
	if (
		/econnreset|econnrefused|etimedout|eai_again|enotfound|enetunreach|epipe|socket hang up|network|fetch failed|premature close|broken pipe|tls connection|certificate/i.test(
			msg,
		)
	) {
		return true
	}

	// Chutes and some hosts surface stream aborts as "terminated".
	if (/\bterminated\b/i.test(msg)) {
		return true
	}

	return false
}

/**
 * Whether we should attempt a similar-model fallback for this failure.
 * Empty-assistant handling does not use this (it always tries catalog once per streak).
 */
export function shouldAttemptSimilarModelFallback(error: unknown): boolean {
	if (isSimilarModelFallbackBlocked(error)) {
		return false
	}
	return isSimilarModelFallbackAllowed(error)
}
