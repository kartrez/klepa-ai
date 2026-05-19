import { z } from "zod"

import { type ModelInfo, gptChatByModels } from "@roo-code/types"

const architectureSchema = z.object({
	inputModalities: z.array(z.string()).nullish(),
	outputModalities: z.array(z.string()).nullish(),
})

const gptChatByModelSchema = z.object({
	name: z.string(),
	maxTokens: z.number().nullable().optional(),
	contextWindow: z.number().optional(),
	supportsImages: z.boolean().optional(),
	supportsPromptCache: z.boolean().optional(),
	supportsNativeTools: z.boolean().optional(),
	supportsReasoningEffort: z.boolean().optional(),
	inputPrice: z.number().optional(),
	outputPrice: z.number().optional(),
	displayName: z.string().optional(),
	description: z.string().optional(),
	isFree: z.boolean().optional(),
	recommended: z.boolean().optional(),
	architecture: architectureSchema.optional(),
	supportedParameters: z.array(z.string()).optional(),
})

const gptChatByModelsResponseSchema = z.array(gptChatByModelSchema)

const DEFAULT_BASE_URL = "https://gpt-chat.by/api"

export async function getGptChatByModels(options?: { baseUrl?: string }): Promise<Record<string, ModelInfo>> {
	const baseUrl = options?.baseUrl ?? DEFAULT_BASE_URL

	try {
		const response = await fetch(`${baseUrl}/ai-models/klepa?t=${Date.now()}`, {
			cache: "no-store",
			headers: {
				"Cache-Control": "no-cache, no-store, must-revalidate",
				Pragma: "no-cache",
			},
		})

		if (!response.ok) {
			throw new Error(`gpt-chat.by models request failed: ${response.status}`)
		}

		const json = await response.json()
		const parsed = gptChatByModelsResponseSchema.safeParse(json)
		if (!parsed.success) {
			throw new Error(`gpt-chat.by models payload is invalid: ${JSON.stringify(parsed.error.format())}`)
		}

		const models: Record<string, ModelInfo> = {}
		for (const model of parsed.data) {
			const staticInfo: Partial<ModelInfo> | undefined =
				model.name in gptChatByModels
					? (gptChatByModels[model.name as keyof typeof gptChatByModels] as Partial<ModelInfo>)
					: undefined
			models[model.name] = {
				...(staticInfo ?? {}),
				contextWindow: model.contextWindow ?? staticInfo?.contextWindow ?? 200_000,
				maxTokens: model.maxTokens ?? staticInfo?.maxTokens ?? null,
				supportsPromptCache: model.supportsPromptCache ?? staticInfo?.supportsPromptCache ?? true,
				supportsImages: model.supportsImages ?? staticInfo?.supportsImages ?? false,
				supportsNativeTools: model.supportsNativeTools ?? staticInfo?.supportsNativeTools ?? true,
				supportsReasoningEffort: model.supportsReasoningEffort ?? staticInfo?.supportsReasoningEffort,
				inputPrice: model.inputPrice ?? staticInfo?.inputPrice,
				outputPrice: model.outputPrice ?? staticInfo?.outputPrice,
				displayName: model.displayName ?? staticInfo?.displayName ?? model.name,
				description: model.description ?? staticInfo?.description,
				isFree: model.isFree ?? staticInfo?.isFree,
				recommended: model.recommended ?? staticInfo?.recommended,
				inputModality: model.architecture?.inputModalities ?? staticInfo?.inputModalities,
				outputModality: model.architecture?.outputModalities ?? staticInfo?.outputModalities,
				supportedParameters: model.supportedParameters ?? staticInfo?.supportedParameters,
			}
		}

		return models
	} catch (error) {
		console.error("[getGptChatByModels] Error fetching gpt-chat.by models", error)
		return {}
	}
}
