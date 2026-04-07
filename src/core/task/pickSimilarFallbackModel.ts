// kilocode_change - new file
import type { ModelInfo, ModelRecord, ProviderSettings } from "@roo-code/types"
import { gptChatByModels, modelIdKeysByProvider } from "@roo-code/types"

import { getModels, getModelsFromCache } from "../../api/providers/fetchers/modelCache"
import type { GetModelsOptions } from "../../shared/api"
import { isRouterName } from "../../shared/api"

/**
 * Either remote {@link getModels} options (dynamic routers) or an embedded static
 * catalog (e.g. `gpt-chat-by`, which is not a {@link isRouterName} router).
 */
export type GetModelsOptionsFromProviderSettingsResult =
	| { source: "fetch"; options: GetModelsOptions }
	| { source: "embedded"; models: ModelRecord }

/**
 * Build options for {@link getModels} from the active profile, or return a static
 * model catalog when the provider ships one in the extension (e.g. gpt-chat-by).
 */
export function getGetModelsOptionsFromProviderSettings(
	c: ProviderSettings,
): GetModelsOptionsFromProviderSettingsResult | undefined {
	// kilocode_change: static catalog — not part of RouterName / modelCache
	if (c.apiProvider === "gpt-chat-by") {
		return { source: "embedded", models: gptChatByModels as ModelRecord }
	}

	if (!c.apiProvider || !isRouterName(c.apiProvider)) {
		return undefined
	}
	switch (c.apiProvider) {
		case "openrouter":
			return { source: "fetch", options: { provider: "openrouter", apiKey: c.openRouterApiKey, baseUrl: c.openRouterBaseUrl } }
		case "zenmux":
			return {
				source: "fetch",
				options: { provider: "zenmux", apiKey: c.zenmuxApiKey, baseUrl: c.zenmuxBaseUrl },
			}
		case "requesty":
			return {
				source: "fetch",
				options: { provider: "requesty", apiKey: c.requestyApiKey, baseUrl: c.requestyBaseUrl },
			}
		case "glama":
			return { source: "fetch", options: { provider: "glama" } }
		case "unbound":
			return { source: "fetch", options: { provider: "unbound", apiKey: c.unboundApiKey } }
		case "litellm":
			return {
				source: "fetch",
				options: { provider: "litellm", apiKey: c.litellmApiKey, baseUrl: c.litellmBaseUrl },
			}
		case "kilocode":
			return {
				source: "fetch",
				options: {
					provider: "kilocode",
					kilocodeToken: c.kilocodeToken,
					kilocodeOrganizationId: c.kilocodeOrganizationId,
				},
			}
		case "synthetic":
			return { source: "fetch", options: { provider: "synthetic", apiKey: c.syntheticApiKey } }
		case "gemini":
			return {
				source: "fetch",
				options: { provider: "gemini", apiKey: c.geminiApiKey, baseUrl: c.googleGeminiBaseUrl },
			}
		case "ollama":
			return {
				source: "fetch",
				options: {
					provider: "ollama",
					baseUrl: c.ollamaBaseUrl,
					apiKey: c.ollamaApiKey,
					numCtx: c.ollamaNumCtx,
				},
			}
		case "lmstudio":
			return { source: "fetch", options: { provider: "lmstudio", baseUrl: c.lmStudioBaseUrl } }
		case "deepinfra":
			return {
				source: "fetch",
				options: { provider: "deepinfra", apiKey: c.deepInfraApiKey, baseUrl: c.deepInfraBaseUrl },
			}
		case "io-intelligence":
			return { source: "fetch", options: { provider: "io-intelligence", apiKey: c.ioIntelligenceApiKey } }
		case "vercel-ai-gateway":
			return { source: "fetch", options: { provider: "vercel-ai-gateway" } }
		case "huggingface":
			return { source: "fetch", options: { provider: "huggingface" } }
		case "oca": {
			const extended = c as ProviderSettings & { ocaApiKey?: string; ocaBaseUrl?: string }
			return {
				source: "fetch",
				options: {
					provider: "oca",
					apiKey: extended.ocaApiKey ?? "",
					baseUrl: extended.ocaBaseUrl,
				},
			}
		}
		case "sap-ai-core":
			return {
				source: "fetch",
				options: {
					provider: "sap-ai-core",
					sapAiCoreServiceKey: c.sapAiCoreServiceKey,
					sapAiCoreResourceGroup: c.sapAiCoreResourceGroup,
					sapAiCoreUseOrchestration: c.sapAiCoreUseOrchestration,
				},
			}
		case "inception":
			return {
				source: "fetch",
				options: { provider: "inception", apiKey: c.inceptionLabsApiKey, baseUrl: c.inceptionLabsBaseUrl },
			}
		case "ovhcloud":
			return { source: "fetch", options: { provider: "ovhcloud", apiKey: c.ovhCloudAiEndpointsApiKey } }
		case "apertis":
			return {
				source: "fetch",
				options: { provider: "apertis", apiKey: c.apertisApiKey, baseUrl: c.apertisBaseUrl },
			}
		case "roo":
			return { source: "fetch", options: { provider: "roo", apiKey: c.rooApiKey } }
		case "chutes":
			return { source: "fetch", options: { provider: "chutes", apiKey: c.chutesApiKey } }
		case "nano-gpt":
			return {
				source: "fetch",
				options: {
					provider: "nano-gpt",
					apiKey: c.nanoGptApiKey,
					nanoGptModelList: c.nanoGptModelList,
				},
			}
		case "aihubmix":
			return {
				source: "fetch",
				options: { provider: "aihubmix", apiKey: c.aihubmixApiKey, baseUrl: c.aihubmixBaseUrl },
			}
		case "poe":
			return { source: "fetch", options: { provider: "poe", apiKey: c.poeApiKey } }
		default: {
			const _exhaustive: never = c.apiProvider
			console.warn(`[pickSimilarFallbackModel] Unsupported router for model catalog: ${_exhaustive}`)
			return undefined
		}
	}
}

function totalTokenPrice(info: ModelInfo): number | undefined {
	const a = info.inputPrice
	const b = info.outputPrice
	if (a === undefined && b === undefined) {
		return undefined
	}
	return (a ?? 0) + (b ?? 0)
}

function cacheStrength(info: ModelInfo): number {
	let s = 0
	if (info.supportsPromptCache) {
		s += 2
	}
	if (info.cacheReadsPrice !== undefined && info.cacheReadsPrice > 0) {
		s += 1
	}
	if (info.cacheWritesPrice !== undefined && info.cacheWritesPrice > 0) {
		s += 1
	}
	return s
}

function imageMismatchPenalty(current: ModelInfo, candidate: ModelInfo): number {
	const cur = current.supportsImages === true
	const cand = candidate.supportsImages === true
	return cur === cand ? 0 : 1
}

type ScoredCandidate = { id: string; info: ModelInfo; score: [number, number, number] }

function scoreCandidates(
	currentModelId: string,
	currentInfo: ModelInfo,
	models: ModelRecord,
): ScoredCandidate[] {
	const currentPrice = totalTokenPrice(currentInfo)
	const currentCache = cacheStrength(currentInfo)

	const candidates: ScoredCandidate[] = []

	for (const [id, info] of Object.entries(models)) {
		if (id === currentModelId) {
			continue
		}
		if (info.deprecated) {
			continue
		}
		if ((info.contextWindow ?? 0) <= 0) {
			continue
		}

		const candPrice = totalTokenPrice(info)
		let priceDistance: number
		if (currentPrice !== undefined && candPrice !== undefined) {
			priceDistance = Math.abs(candPrice - currentPrice)
		} else if (currentPrice === undefined && candPrice === undefined) {
			priceDistance = 0
		} else {
			priceDistance = 1e9
		}

		const cacheDelta = cacheStrength(info) - currentCache
		const imgPen = imageMismatchPenalty(currentInfo, info)

		candidates.push({
			id,
			info,
			score: [priceDistance, -cacheDelta, imgPen],
		})
	}

	return candidates
}

function pickBestScored(candidates: ScoredCandidate[]): string | undefined {
	if (candidates.length === 0) {
		return undefined
	}
	const sorted = [...candidates].sort((a, b) => {
		for (let i = 0; i < 3; i++) {
			if (a.score[i] !== b.score[i]) {
				return a.score[i] - b.score[i]
			}
		}
		return a.id.localeCompare(b.id)
	})
	return sorted[0]?.id
}

/**
 * Picks another model from the catalog with lexicographic preference:
 * 1) **Recommended** models first (when the catalog marks `recommended: true`), then all others.
 * 2) Within each group: closest total (input + output) price
 * 3) Stronger prompt-cache / cache-pricing profile
 * 4) Same vision / image support as the current model
 */
export function pickSimilarFallbackModelId(
	currentModelId: string,
	currentInfo: ModelInfo,
	models: ModelRecord | undefined,
): string | undefined {
	if (!models || Object.keys(models).length < 2) {
		return undefined
	}

	const scored = scoreCandidates(currentModelId, currentInfo, models)
	if (scored.length === 0) {
		return undefined
	}

	const recommended = scored.filter((c) => c.info.recommended === true)
	const fromRecommended = pickBestScored(recommended)
	if (fromRecommended !== undefined) {
		return fromRecommended
	}

	const rest = scored.filter((c) => c.info.recommended !== true)
	return pickBestScored(rest)
}

export async function resolveModelCatalogForFallback(config: ProviderSettings): Promise<ModelRecord | undefined> {
	const spec = getGetModelsOptionsFromProviderSettings(config)
	if (!spec) {
		return undefined
	}

	if (spec.source === "embedded") {
		return spec.models
	}

	const opts = spec.options
	const cached = getModelsFromCache(opts.provider)
	if (cached && Object.keys(cached).length > 1) {
		return cached
	}

	try {
		return await getModels(opts)
	} catch (error) {
		console.error(`[pickSimilarFallbackModel] getModels failed for ${opts.provider}:`, error)
		return cached
	}
}

/**
 * Sets the active model id field for the current {@link ProviderSettings.apiProvider}.
 */
export function applyPickedModelIdToSettings(config: ProviderSettings, modelId: string): ProviderSettings | undefined {
	const key = modelIdKeysByProvider[config.apiProvider as keyof typeof modelIdKeysByProvider]
	if (!key) {
		console.warn(`[pickSimilarFallbackModel] No model id key for provider ${config.apiProvider}`)
		return undefined
	}
	return { ...config, [key]: modelId } as ProviderSettings
}
