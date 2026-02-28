/**
 * Image generation model constants
 */

/**
 * API method used for image generation
 */
export type ImageGenerationApiMethod = "chat_completions" | "images_api"

export interface ImageGenerationModel {
	value: string
	label: string
	provider: ImageGenerationProvider
	apiMethod?: ImageGenerationApiMethod
}

export const IMAGE_GENERATION_MODELS: ImageGenerationModel[] = [
	{ value: "google/gemini-2.5-flash-image", label: "Nano Banana (Gemini 2.5 Flash Image)", provider: "gpt-chat-by" },
	{ value: "google/gemini-3-pro-image-preview", label: "Nano Banana Pro (Gemini 3 Pro Image Preview)", provider: "gpt-chat-by" },
	{ value: "google/gemini-3.1-flash-image-preview", label: "Nano Banana 2 (Gemini 3.1 Flash Image Preview)", provider: "gpt-chat-by" }
]

/**
 * Get array of model values only (for backend validation)
 */
export const IMAGE_GENERATION_MODEL_IDS = IMAGE_GENERATION_MODELS.map((m) => m.value)

/**
 * Image generation provider type
 */
export type ImageGenerationProvider = "gpt-chat-by"

/**
 * Get the image generation provider with backwards compatibility
 * - If provider is explicitly set, use it
 * - If a model is already configured (existing users), default to "openrouter"
 * - Otherwise default to "roo" (new users)
 */
export function getImageGenerationProvider(
	explicitProvider: ImageGenerationProvider | undefined,
	hasExistingModel: boolean,
): ImageGenerationProvider {
	return explicitProvider !== undefined ? explicitProvider : "gpt-chat-by"
}
