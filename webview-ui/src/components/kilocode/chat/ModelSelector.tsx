import { useMemo, useState, useEffect, useRef } from "react"
import { SelectDropdown, DropdownOptionType, ToggleSwitch, StandardTooltip, type DropdownOption } from "@/components/ui"
import { OPENROUTER_DEFAULT_PROVIDER_NAME, type ProviderSettings } from "@roo-code/types"
import { vscode } from "@src/utils/vscode"
import { OCAModelService } from "@src/services/OCAModelService"
import { useAppTranslation } from "@src/i18n/TranslationContext"
import { cn } from "@src/lib/utils"
import { prettyModelName } from "../../../utils/prettyModelName"
import { useProviderModels } from "../hooks/useProviderModels"
import { getModelIdKey, getSelectedModelId } from "../hooks/useSelectedModel"
import { useGroupedModelIds } from "@/components/ui/hooks/kilocode/usePreferredModels"
import OcaAcknowledgeModal from "../common/OcaAcknowledgeModal"

interface ModelSelectorProps {
	currentApiConfigName?: string
	apiConfiguration: ProviderSettings
	fallbackText: string
	virtualQuotaActiveModel?: { id: string; name: string; activeProfileNumber?: number } // kilocode_change: Add virtual quota active model for UI display
}

// kilocode_change start
const FREE_MODELS_SECTION_VALUE = "__label_free__"
const RECOMMENDED_MODELS_SECTION_VALUE = "__label_recommended__"
const ALL_MODELS_SECTION_VALUE = "__label_all__"
const MODELS_SECTION_SEPARATOR_VALUE = "__sep__"

const formatModelPriceValue = (price: unknown): string | null => {
	const parsedPrice = typeof price === "number" ? price : Number(price)
	if (!Number.isFinite(parsedPrice)) {
		return null
	}
	return parsedPrice.toFixed(1)
}

const formatModelPriceLabel = (model: { inputPrice?: unknown; outputPrice?: unknown } | undefined): string | null => {
	const inputPrice = formatModelPriceValue(model?.inputPrice)
	const outputPrice = formatModelPriceValue(model?.outputPrice)
	if (!inputPrice || !outputPrice) {
		return null
	}
	return `${inputPrice}/${outputPrice}$`
}

const isFreeModel = (model: { isFree?: unknown } | undefined): boolean => {
	return model?.isFree === true
}
// kilocode_change end

export const ModelSelector = ({
	currentApiConfigName,
	apiConfiguration,
	fallbackText,
	virtualQuotaActiveModel, //kilocode_change
}: ModelSelectorProps) => {
	const { t } = useAppTranslation()
	const { provider, providerModels, providerDefaultModel, isLoading, isError } = useProviderModels(apiConfiguration)
	const selectedModelId = getSelectedModelId({
		provider,
		apiConfiguration,
		defaultModelId: providerDefaultModel,
	})
	const modelIdKey = getModelIdKey({ provider })
	const isAutocomplete = apiConfiguration.profileType === "autocomplete"

	const { preferredModelIds, restModelIds } = useGroupedModelIds(providerModels)
	const [ackOpen, setAckOpen] = useState(false)
	const [pendingModelId, setPendingModelId] = useState<string | null>(null)
	const bannerHtml = pendingModelId ? (providerModels as any)?.[pendingModelId]?.banner : undefined

	const options = useMemo(() => {
		const result: DropdownOption[] = []

		// kilocode_change start: group free/recommended/rest models
		const allModelIds = [...preferredModelIds, ...restModelIds]
		const isMissingSelectedModel = selectedModelId && !allModelIds.includes(selectedModelId)
		const freeModelIdSet = new Set(allModelIds.filter((modelId) => isFreeModel(providerModels[modelId])))
		const freeModelIds = allModelIds.filter((modelId) => freeModelIdSet.has(modelId))
		const recommendedModelIds = preferredModelIds.filter((modelId) => !freeModelIdSet.has(modelId))
		const allOtherModelIds = restModelIds.filter((modelId) => !freeModelIdSet.has(modelId))
		// kilocode_change end

		// kilocode_change start: free models section first
		if (freeModelIds.length > 0) {
			result.push({
				value: FREE_MODELS_SECTION_VALUE,
				label: t("settings:modelPicker.freeModels"),
				type: DropdownOptionType.LABEL,
			})

			freeModelIds.forEach((modelId) => {
				result.push({
					value: modelId,
					label: providerModels[modelId]?.displayName ?? prettyModelName(modelId),
					type: DropdownOptionType.ITEM,
				})
			})
		}

		if (recommendedModelIds.length > 0) {
			if (result.length > 0) {
				result.push({
					value: MODELS_SECTION_SEPARATOR_VALUE,
					label: "—",
					type: DropdownOptionType.SEPARATOR,
				})
			}
			result.push({
				value: RECOMMENDED_MODELS_SECTION_VALUE,
				label: t("settings:modelPicker.recommendedModels"),
				type: DropdownOptionType.LABEL,
			})

			recommendedModelIds.forEach((modelId) => {
				result.push({
					value: modelId,
					label: `★ ${providerModels[modelId]?.displayName ?? prettyModelName(modelId)}`,
					type: DropdownOptionType.ITEM,
				})
			})
		}

		// Add "All models" section
		if (allOtherModelIds.length > 0) {
			if (result.length > 0) {
				result.push({
					value: MODELS_SECTION_SEPARATOR_VALUE,
					label: "—",
					type: DropdownOptionType.SEPARATOR,
				})
			}
			result.push({
				value: ALL_MODELS_SECTION_VALUE,
				label: t("settings:modelPicker.allModels"),
				type: DropdownOptionType.LABEL,
			})

			// Add missing selected model at the top of "All models" if not in any list
			if (isMissingSelectedModel) {
				result.push({
					value: selectedModelId,
					label: providerModels[selectedModelId]?.displayName ?? prettyModelName(selectedModelId),
					type: DropdownOptionType.ITEM,
				})
			}

			allOtherModelIds.forEach((modelId) => {
				result.push({
					value: modelId,
					label: providerModels[modelId]?.displayName ?? prettyModelName(modelId),
					type: DropdownOptionType.ITEM,
				})
			})
		} else if (isMissingSelectedModel) {
			// If there are no rest models but we have a missing selected model, add it
			result.push({
				value: selectedModelId,
				label: providerModels[selectedModelId]?.displayName ?? prettyModelName(selectedModelId),
				type: DropdownOptionType.ITEM,
			})
		}

		return result
	}, [preferredModelIds, restModelIds, providerModels, selectedModelId, t])

	const disabled = isLoading || isError || isAutocomplete
	// kilocode_change start
	const isGptChatByProvider = provider === "gpt-chat-by"
	const isAutoModeEnabled = isGptChatByProvider && selectedModelId === "klepa/auto"
	const lastNonAutoModelIdRef = useRef<string | null>(null)

	useEffect(() => {
		// Track the last manual (non-auto) model so we can restore it
		// when user disables auto mode.
		if (!isAutoModeEnabled && selectedModelId && selectedModelId !== "klepa/auto") {
			lastNonAutoModelIdRef.current = selectedModelId
		}
	}, [isAutoModeEnabled, selectedModelId])

	const updateModelSelection = (modelId: string) => {
		if (!currentApiConfigName) {
			return
		}
		vscode.postMessage({
			type: "upsertApiConfiguration",
			text: currentApiConfigName,
			apiConfiguration: {
				...apiConfiguration,
				[modelIdKey]: modelId,
				openRouterSpecificProvider: OPENROUTER_DEFAULT_PROVIDER_NAME,
			},
		})
	}
	// kilocode_change end

	useEffect(() => {
		if (provider !== "oca") return
		try {
			OCAModelService.setOcaModels(providerModels as any)
		} catch (err) {
			console.debug("ModelSelector: failure setting OCA models", err)
		}

		const saved = OCAModelService.getOcaSelectedModelId()
		const first = Object.keys(providerModels || {})[0]
		const target = saved || first

		if (!target || !currentApiConfigName) return
		if (selectedModelId === target || !providerModels[target]) return

		vscode.postMessage({
			type: "upsertApiConfiguration",
			text: currentApiConfigName,
			apiConfiguration: {
				...apiConfiguration,
				[getModelIdKey({ provider })]: target,
				openRouterSpecificProvider: OPENROUTER_DEFAULT_PROVIDER_NAME,
			},
		})
		try {
			OCAModelService.setOcaSelectedModelId(target)
		} catch (err) {
			console.debug("ModelSelector: failure setting selected OCA model", err)
		}
	}, [provider, providerModels, selectedModelId, currentApiConfigName, apiConfiguration])

	const onChange = (value: string) => {
		if (!currentApiConfigName) {
			return
		}
		if (apiConfiguration[modelIdKey] === value) {
			// don't reset openRouterSpecificProvider
			return
		}
		if (provider === "oca" && (providerModels as any)?.[value]?.banner) {
			setPendingModelId(value)
			setAckOpen(true)
			return
		}
		if (provider === "oca") {
			try {
				OCAModelService.setOcaSelectedModelId(value)
			} catch (err) {
				console.debug("ModelSelector: failure setting selected OCA model on change", err)
			}
		}
		updateModelSelection(value)
	}

	const onAcknowledge = () => {
		if (!currentApiConfigName || !pendingModelId || apiConfiguration[modelIdKey] === pendingModelId) {
			setAckOpen(false)
			setPendingModelId(null)
			return
		}
		updateModelSelection(pendingModelId)
		try {
			if (provider === "oca") {
				OCAModelService.setOcaSelectedModelId(pendingModelId)
			}
		} catch (err) {
			console.debug("ModelSelector: failure setting selected OCA model on acknowledge", err)
		}
		setAckOpen(false)
		setPendingModelId(null)
	}

	if (isLoading) {
		return null
	}

	// kilocode_change start: Display active model for virtual quota fallback
	if (provider === "virtual-quota-fallback" && virtualQuotaActiveModel) {
		return (
			<span className="text-xs text-vscode-descriptionForeground opacity-70 truncate">
				{prettyModelName(virtualQuotaActiveModel.id)}
				{virtualQuotaActiveModel.activeProfileNumber !== undefined && (
					<> ({virtualQuotaActiveModel.activeProfileNumber})</>
				)}
			</span>
		)
	}
	// kilocode_change end

	if (isError || isAutocomplete || options.length <= 0) {
		return <span className="text-xs text-vscode-descriptionForeground opacity-70 truncate">{fallbackText}</span>
	}

	// kilocode_change start
	const gptChatByManualOptions = options.filter((option) => option.value !== "klepa/auto")
	// kilocode_change start
	const renderModelItem = (option: DropdownOption) => (
		<div className="flex w-full items-center gap-2 py-1.5 px-3 hover:bg-vscode-list-hoverBackground">
			<span className="truncate">{option.label}</span>
			<span className="ml-auto text-xs opacity-70 tabular-nums">
				{formatModelPriceLabel(providerModels[option.value]) ?? ""}
			</span>
		</div>
	)
	// kilocode_change end

	const handleAutoModeToggle = () => {
		if (disabled) {
			return
		}
		if (isAutoModeEnabled) {
			const restoreModelId = lastNonAutoModelIdRef.current
			if (restoreModelId && restoreModelId !== "klepa/auto" && (providerModels as any)?.[restoreModelId]) {
				updateModelSelection(restoreModelId)
			} else {
				// Fallback: pick the first non-auto model.
				const firstManualModel = Object.keys(providerModels || {}).find((modelId) => modelId !== "klepa/auto")
				if (firstManualModel) updateModelSelection(firstManualModel)
			}
			return
		}

		// Preserve the current manual model before switching to auto.
		if (selectedModelId && selectedModelId !== "klepa/auto") {
			lastNonAutoModelIdRef.current = selectedModelId
		}
		updateModelSelection("klepa/auto")
	}
	// kilocode_change end

	return (
		<>
			<OcaAcknowledgeModal
				open={ackOpen}
				bannerHtml={bannerHtml ?? undefined}
				onAcknowledge={onAcknowledge}
				onCancel={() => {
					setAckOpen(false)
					setPendingModelId(null)
				}}
			/>
			{/* kilocode_change start */}
			{isGptChatByProvider ? (
				<div className="flex items-center gap-2 min-w-0">
					<StandardTooltip content={t("settings:modelPicker.autoModeTooltip")}>
						<div className="flex items-center gap-2">
							<span className="text-xs text-vscode-descriptionForeground whitespace-nowrap">Auto</span>
							<ToggleSwitch
								checked={isAutoModeEnabled}
								onChange={handleAutoModeToggle}
								disabled={disabled}
								size="medium"
								aria-label="Toggle auto mode"
							/>
						</div>
					</StandardTooltip>
					{!isAutoModeEnabled && gptChatByManualOptions.length > 0 ? (
						<div className="min-w-0 flex-1">
							<SelectDropdown
								value={selectedModelId}
								disabled={disabled}
								title={t("chat:selectApiConfig")}
								options={gptChatByManualOptions}
								onChange={onChange}
								contentClassName="max-h-[400px] overflow-y-auto"
								triggerClassName={cn(
									"w-full text-ellipsis overflow-hidden p-0",
									"bg-transparent border-transparent hover:bg-transparent hover:border-transparent",
								)}
								triggerIcon={false}
								itemClassName="group"
								// kilocode_change: show input/output pricing on the right side
								renderItem={renderModelItem}
							/>
						</div>
					) : (
						<span className="text-xs text-vscode-descriptionForeground opacity-70 truncate">
							Auto
						</span>
					)}
				</div>
			) : (
				<SelectDropdown
					value={selectedModelId}
					disabled={disabled}
					title={t("chat:selectApiConfig")}
					options={options}
					onChange={onChange}
					contentClassName="max-h-[400px] overflow-y-auto"
					triggerClassName={cn(
						"w-full text-ellipsis overflow-hidden p-0",
						"bg-transparent border-transparent hover:bg-transparent hover:border-transparent",
					)}
					triggerIcon={false}
					itemClassName="group"
					// kilocode_change: show input/output pricing on the right side
					renderItem={renderModelItem}
				/>
			)}
			{/* kilocode_change end */}
		</>
	)
}
