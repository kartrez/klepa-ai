import type { ModelInfo } from "../model.js"

export type GptChatByModelId = keyof typeof gptChatByModels

export const gptChatByDefaultModelId: GptChatByModelId = "mimo/free"

const GTP_CHAT_BY_TAKE_PROFIT_USD = 1.15;

export const gptChatByModels = {
	"mimo/free": {
		maxTokens: 16_384,
		contextWindow: 150_000,
		supportsImages: false,
		supportsPromptCache: true,
		supportsNativeTools: false,
		inputPrice: 0,
		outputPrice: 0,
		description: `Mimo v2 Flash.`,
		isFree: true,
	},
	"openai/gpt-oss-120b": {
		maxTokens: 16_384,
		contextWindow: 128_072,
		supportsImages: false,
		supportsPromptCache: false,
		supportsNativeTools: true,
		inputPrice: 0.04 * GTP_CHAT_BY_TAKE_PROFIT_USD,
		outputPrice: 0.2 * GTP_CHAT_BY_TAKE_PROFIT_USD,
		cacheWritesPrice: 0,
		cacheReadsPrice: 0,
		description: "Extremely capable general-purpose LLM with strong, controllable reasoning capabilities",
	},
	"qwen/coder-480B": {
		maxTokens: 32768,
		contextWindow: 262144,
		supportsImages: false,
		supportsPromptCache: true,
		supportsNativeTools: true,
		defaultToolProtocol: "native",
		inputPrice: 0.22 * GTP_CHAT_BY_TAKE_PROFIT_USD,
		outputPrice: GTP_CHAT_BY_TAKE_PROFIT_USD,
		description: `Qwen Coder - High-performance coding model with 1M context window for large codebases.`,
	},
	"qwen/plus-3.5": {
		maxTokens: 65_000,
		contextWindow: 262_000,
		supportsImages: true,
		supportsPromptCache: false,
		supportsNativeTools: true,
		inputPrice: 0.4 * GTP_CHAT_BY_TAKE_PROFIT_USD,
		outputPrice: 2.4 * GTP_CHAT_BY_TAKE_PROFIT_USD,
		description: `The Qwen3.5 native vision-language series Plus models are built on a hybrid architecture that integrates linear attention mechanisms with sparse mixture-of-experts models, achieving higher inference efficiency.`,
	},
	"qwen/qwen3.5-397B": {
		maxTokens: 65_000,
		contextWindow: 262_000,
		supportsImages: true,
		supportsPromptCache: true,
		supportsNativeTools: true,
		inputPrice: 0.6 * GTP_CHAT_BY_TAKE_PROFIT_USD,
		outputPrice: 3.6 * GTP_CHAT_BY_TAKE_PROFIT_USD,
		description: `The Qwen3.5 397B native vision-language series Plus models are built on a hybrid architecture that integrates linear attention mechanisms with sparse mixture-of-experts models, achieving higher inference efficiency.`,
	},
	"google/gemini-3-flash": {
		maxTokens: 65_536,
		contextWindow: 1_048_576,
		supportsImages: true,
		supportsNativeTools: true,
		defaultToolProtocol: "native",
		supportsPromptCache: true,
		inputPrice: 0.5 * GTP_CHAT_BY_TAKE_PROFIT_USD,
		outputPrice: 3 * GTP_CHAT_BY_TAKE_PROFIT_USD,
		description: `Google: Gemini 3 Flash Preview.`,
	},
	"google/gemini-3.1-flash-lite-preview": {
		maxTokens: 65_536,
		contextWindow: 1_048_576,
		supportsImages: true,
		supportsNativeTools: true,
		defaultToolProtocol: "native",
		supportsPromptCache: true,
		supportsReasoningEffort: ["minimal", "low", "medium", "high"],
		reasoningEffort: "medium",
		supportsTemperature: true,
		defaultTemperature: 1,
		inputPrice: 0.25 * GTP_CHAT_BY_TAKE_PROFIT_USD,
		outputPrice: 1.5 * GTP_CHAT_BY_TAKE_PROFIT_USD,
		description: `Gemini 3.1 Flash Lite Preview.`,
	},
	"google/gemini-3-pro": {
		maxTokens: 65_536,
		contextWindow: 1_048_576,
		supportsImages: true,
		supportsNativeTools: true,
		defaultToolProtocol: "native",
		supportsPromptCache: true,
		supportsReasoningEffort: ["low", "high"],
		reasoningEffort: "low",
		supportsTemperature: true,
		defaultTemperature: 1,
		inputPrice: 4.0 * GTP_CHAT_BY_TAKE_PROFIT_USD,
		outputPrice: 18.0 * GTP_CHAT_BY_TAKE_PROFIT_USD,
		tiers: [
			{
				contextWindow: 200_000,
				inputPrice: 2.0 * GTP_CHAT_BY_TAKE_PROFIT_USD,
				outputPrice: 12.0 * GTP_CHAT_BY_TAKE_PROFIT_USD,
			},
			{
				contextWindow: Infinity,
				inputPrice: 4.0 * GTP_CHAT_BY_TAKE_PROFIT_USD,
				outputPrice: 18.0 * GTP_CHAT_BY_TAKE_PROFIT_USD,
			},
		],
	},
	"google/gemini-3.1-pro": {
		maxTokens: 65_536,
		contextWindow: 1_048_576,
		supportsImages: true,
		supportsNativeTools: true,
		defaultToolProtocol: "native",
		supportsPromptCache: true,
		supportsReasoningEffort: ["low", "high"],
		reasoningEffort: "low",
		supportsTemperature: true,
		defaultTemperature: 1,
		inputPrice: 4.0 * GTP_CHAT_BY_TAKE_PROFIT_USD,
		outputPrice: 18.0 * GTP_CHAT_BY_TAKE_PROFIT_USD,
		tiers: [
			{
				contextWindow: 200_000,
				inputPrice: 2.0 * GTP_CHAT_BY_TAKE_PROFIT_USD,
				outputPrice: 12.0 * GTP_CHAT_BY_TAKE_PROFIT_USD,
			},
			{
				contextWindow: Infinity,
				inputPrice: 4.0 * GTP_CHAT_BY_TAKE_PROFIT_USD,
				outputPrice: 18.0 * GTP_CHAT_BY_TAKE_PROFIT_USD,
			},
		],
	},
	"deepseek/deepseek-v3.2": {
		maxTokens: 32768,
		contextWindow: 163_840,
		supportsImages: false,
		supportsPromptCache: false,
		supportsNativeTools: true,
		inputPrice: 0.28 * GTP_CHAT_BY_TAKE_PROFIT_USD,
		outputPrice: 0.45 * GTP_CHAT_BY_TAKE_PROFIT_USD,
		description: `deepseek 3.2`,
	},
	"minimax/m2.5": {
		maxTokens: 180_000,
		contextWindow: 180_000,
		supportsImages: false,
		supportsPromptCache: true,
		supportsNativeTools: true,
		inputPrice: 0.12 * GTP_CHAT_BY_TAKE_PROFIT_USD,
		outputPrice: 0.48 * GTP_CHAT_BY_TAKE_PROFIT_USD,
		description: `MiniMax M2.5`,
	},
	"inception/mercury-2": {
		maxTokens: 50_000,
		contextWindow: 120_000,
		supportsImages: false,
		supportsPromptCache: true,
		supportsNativeTools: true,
		inputPrice: 0.25 * GTP_CHAT_BY_TAKE_PROFIT_USD,
		outputPrice: 0.75 * GTP_CHAT_BY_TAKE_PROFIT_USD,
		description: `Mercury 2 is an extremely fast reasoning LLM, and the first reasoning diffusion LLM (dLLM).`,
	},
	"kwaipilot/kat-coder-pro": {
		maxTokens: 32768,
		contextWindow: 256_000,
		supportsImages: false,
		supportsPromptCache: true,
		supportsNativeTools: true,
		inputPrice: 0.3 * GTP_CHAT_BY_TAKE_PROFIT_USD,
		outputPrice: 1.2 * GTP_CHAT_BY_TAKE_PROFIT_USD,
		description: `KAT Coder PRO.`,
	},
	"moonshotai/kimi-k2.5": {
		maxTokens: 16_384,
		contextWindow: 262_144,
		supportsImages: true,
		supportsPromptCache: true,
		supportsReasoningBinary: true,
		supportsAdaptiveThinking: true,
		preserveReasoning: true,
		supportsNativeTools: true,
		defaultToolProtocol: "native",
		inputPrice: 0.6 * GTP_CHAT_BY_TAKE_PROFIT_USD,
		outputPrice: 2.85 * GTP_CHAT_BY_TAKE_PROFIT_USD,
		cacheReadsPrice: 0.1, // $0.10 per million tokens (cache hit)
		supportsTemperature: false,
		defaultTemperature: 0.6,
		description: "Kimi K2.5 is the latest generation of Moonshot AI's Kimi series, featuring improved reasoning capabilities and enhanced performance across diverse tasks.",
	},
	"anthropic/claude-opus-4.6": {
		maxTokens: 128_000, // Overridden to 8k if `enableReasoningEffort` is false.
		contextWindow: 200_000, // Default 200K, extendable to 1M with beta flag 'context-1m-2025-08-07'
		supportsImages: true,
		supportsPromptCache: true,
		supportsNativeTools: true,
		defaultToolProtocol: "native",
		inputPrice: 5 * GTP_CHAT_BY_TAKE_PROFIT_USD,
		outputPrice: 25 * GTP_CHAT_BY_TAKE_PROFIT_USD,
		cacheWritesPrice: 6.25,
		cacheReadsPrice: 0.5,
		supportsReasoningBudget: true,
		supportsAdaptiveThinking: true,
		supportsVerbosity: ["low", "medium", "high", "max"],
		// Tiered pricing for extended context (requires beta flag 'context-1m-2025-08-07')
		tiers: [
			{
				contextWindow: 1_000_000, // 1M tokens with beta flag
				inputPrice: 10.0 * GTP_CHAT_BY_TAKE_PROFIT_USD, // $6 per million input tokens (>200K context)
				outputPrice: 37.5 * GTP_CHAT_BY_TAKE_PROFIT_USD, // $22.50 per million output tokens (>200K context)
				cacheWritesPrice: 7.5, // $7.50 per million tokens (>200K context)
				cacheReadsPrice: 0.6, // $0.60 per million tokens (>200K context)
			},
		],
		description: `Anthropic claude opus 4.6. Top performance model`,
	},
	"anthropic/claude-sonnet-4.6": {
		maxTokens: 128_000,
		contextWindow: 1_000_000,
		supportsImages: true,
		supportsPromptCache: true,
		supportsNativeTools: false,
		inputPrice: 3 * GTP_CHAT_BY_TAKE_PROFIT_USD,
		outputPrice: 15 * GTP_CHAT_BY_TAKE_PROFIT_USD,
		description: `anthropic claude sonnet 4.6.`,
		tiers: [
			{
				contextWindow: 1_000_000, // 1M tokens with beta flag
				inputPrice: 6.0 * GTP_CHAT_BY_TAKE_PROFIT_USD, // $6 per million input tokens (>200K context)
				outputPrice: 22.5 * GTP_CHAT_BY_TAKE_PROFIT_USD, // $22.50 per million output tokens (>200K context)
				cacheWritesPrice: 7.5, // $7.50 per million tokens (>200K context)
				cacheReadsPrice: 0.6, // $0.60 per million tokens (>200K context)
			},
		],
	},
	// "grok/code": {
	// 	maxTokens: 65_000,
	// 	contextWindow: 1_000_000,
	// 	supportsImages: false,
	// 	supportsPromptCache: true,
	// 	inputPrice: 0.2 * GTP_CHAT_BY_TAKE_PROFIT_USD,
	// 	outputPrice: 1.5 * GTP_CHAT_BY_TAKE_PROFIT_USD,
	// 	description: `grok code.`,
	// },
	// "openai/codex": {
	// 	maxTokens: 65_000,
	// 	contextWindow: 1_000_000,
	// 	supportsImages: false,
	// 	supportsPromptCache: true,
	// 	inputPrice: 1.25 * GTP_CHAT_BY_TAKE_PROFIT_USD,
	// 	outputPrice: 10 * GTP_CHAT_BY_TAKE_PROFIT_USD,
	// 	description: `Open AI gpt 5`,
	// },
	// "openai/gpt-5.1": {
	// 	maxTokens: 65_000,
	// 	contextWindow: 1_000_000,
	// 	supportsImages: false,
	// 	supportsPromptCache: true,
	// 	inputPrice: 1.25 * GTP_CHAT_BY_TAKE_PROFIT_USD,
	// 	outputPrice: 10 * GTP_CHAT_BY_TAKE_PROFIT_USD,
	// 	description: `Open AI gpt 5.1`,
	// },
	// "openai/gpt-5.2": {
	// 	maxTokens: 128_000,
	// 	contextWindow: 400_000,
	// 	supportsImages: false,
	// 	supportsPromptCache: true,
	// 	inputPrice: 1.75 * GTP_CHAT_BY_TAKE_PROFIT_USD,
	// 	outputPrice: 14 * GTP_CHAT_BY_TAKE_PROFIT_USD,
	// 	description: `Open AI gpt 5.2`,
	// },
} as const satisfies Record<string, ModelInfo>

export const GPT_CHAT_BY_DEFAULT_TEMPERATURE = 0.6
