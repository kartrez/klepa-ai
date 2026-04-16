import { render, screen } from "@/utils/test-utils"
import { ModelSelector } from "../ModelSelector"
import type { ProviderSettings } from "@roo-code/types"
import { vscode } from "@/utils/vscode"
import userEvent from "@testing-library/user-event"
import type { Mock } from "vitest"

vi.mock("@/utils/vscode", () => ({
	vscode: {
		postMessage: vi.fn(),
	},
}))

vi.mock("@/i18n/TranslationContext", () => ({
	useAppTranslation: () => ({
		t: (key: string) => key,
	}),
}))

// Create a mock function that can be controlled per test
const mockUseGroupedModelIds = vi.fn()

vi.mock("@/components/ui/hooks/kilocode/usePreferredModels", () => ({
	useGroupedModelIds: () => mockUseGroupedModelIds(),
}))

// Create a mock function that can be controlled per test
const mockUseProviderModels = vi.fn()
const mockGetSelectedModelId = vi.fn()

vi.mock("../../hooks/useProviderModels", () => ({
	useProviderModels: (config: ProviderSettings) => mockUseProviderModels(config),
}))

vi.mock("../../hooks/useSelectedModel", () => ({
	getSelectedModelId: () => mockGetSelectedModelId(),
	getModelIdKey: () => "apiModelId",
}))

const postMessageMock = vscode.postMessage as unknown as Mock

describe("ModelSelector", () => {
	const baseApiConfiguration: ProviderSettings = {
		apiProvider: "openai",
		apiModelId: "model-1",
	}

	beforeEach(() => {
		// Reset mocks before each test
		mockUseProviderModels.mockReset()
		mockUseGroupedModelIds.mockReset()

		// Default mock implementation for useGroupedModelIds (no preferred models)
		mockUseGroupedModelIds.mockReturnValue({
			preferredModelIds: [],
			restModelIds: ["model-1", "model-2"],
		})

		// Default mock implementation for useProviderModels
		mockUseProviderModels.mockReturnValue({
			provider: "openai",
			providerModels: {
				"model-1": { displayName: "Model 1" },
				"model-2": { displayName: "Model 2" },
			},
			providerDefaultModel: "model-1",
			isLoading: false,
			isError: false,
		})
		mockGetSelectedModelId.mockReturnValue("model-1")
	})

	test("renders dropdown for chat profile", () => {
		const chatConfig: ProviderSettings = {
			...baseApiConfiguration,
			profileType: "chat",
		}

		render(
			<ModelSelector
				currentApiConfigName="test-profile"
				apiConfiguration={chatConfig}
				fallbackText="Select a model"
			/>,
		)

		// Should render the SelectDropdown component (not a span)
		// The SelectDropdown renders as a button with data-testid="dropdown-trigger"
		const dropdownTrigger = screen.getByTestId("dropdown-trigger")
		expect(dropdownTrigger).toBeInTheDocument()
		expect(dropdownTrigger.tagName).toBe("BUTTON")
	})

	test("renders disabled span for autocomplete profile", () => {
		const autocompleteConfig: ProviderSettings = {
			...baseApiConfiguration,
			profileType: "autocomplete",
		}

		render(
			<ModelSelector
				currentApiConfigName="test-profile"
				apiConfiguration={autocompleteConfig}
				fallbackText="Select a model"
			/>,
		)

		// Should render a span with fallback text (not a dropdown)
		expect(screen.getByText("Select a model")).toBeInTheDocument()

		// Should NOT render the SelectDropdown component
		const dropdownTrigger = screen.queryByTestId("dropdown-trigger")
		expect(dropdownTrigger).not.toBeInTheDocument()
	})

	test("renders disabled span when isError is true", () => {
		mockUseProviderModels.mockReturnValue({
			provider: "openai",
			providerModels: {},
			providerDefaultModel: undefined,
			isLoading: false,
			isError: true,
		})

		render(
			<ModelSelector
				currentApiConfigName="test-profile"
				apiConfiguration={baseApiConfiguration}
				fallbackText="Error loading models"
			/>,
		)

		expect(screen.getByText("Error loading models")).toBeInTheDocument()

		const dropdownTrigger = screen.queryByTestId("dropdown-trigger")
		expect(dropdownTrigger).not.toBeInTheDocument()
	})

	test("renders nothing when isLoading is true", () => {
		mockUseProviderModels.mockReturnValue({
			provider: "openai",
			providerModels: {},
			providerDefaultModel: undefined,
			isLoading: true,
			isError: false,
		})

		const { container } = render(
			<ModelSelector
				currentApiConfigName="test-profile"
				apiConfiguration={baseApiConfiguration}
				fallbackText="Loading..."
			/>,
		)

		expect(container.firstChild).toBeNull()
	})

	test("renders span for virtual-quota-fallback provider with virtualQuotaActiveModel", () => {
		mockUseProviderModels.mockReturnValue({
			provider: "virtual-quota-fallback",
			providerModels: {},
			providerDefaultModel: undefined,
			isLoading: false,
			isError: false,
		})

		const virtualQuotaConfig: ProviderSettings = {
			...baseApiConfiguration,
			apiProvider: "virtual-quota-fallback",
		}

		render(
			<ModelSelector
				currentApiConfigName="test-profile"
				apiConfiguration={virtualQuotaConfig}
				fallbackText="Select a model"
				virtualQuotaActiveModel={{ id: "gpt-4", name: "GPT-4" }}
			/>,
		)

		// Should show the virtual quota active model name (prettyModelName formats it)
		expect(screen.getByText("Gpt 4")).toBeInTheDocument()

		const dropdownTrigger = screen.queryByTestId("dropdown-trigger")
		expect(dropdownTrigger).not.toBeInTheDocument()
	})

	test("autocomplete profile takes precedence over other conditions", () => {
		// Even with valid models, autocomplete profile should show disabled span
		const autocompleteConfig: ProviderSettings = {
			...baseApiConfiguration,
			profileType: "autocomplete",
		}

		render(
			<ModelSelector
				currentApiConfigName="test-profile"
				apiConfiguration={autocompleteConfig}
				fallbackText="Autocomplete model"
			/>,
		)

		expect(screen.getByText("Autocomplete model")).toBeInTheDocument()

		const dropdownTrigger = screen.queryByTestId("dropdown-trigger")
		expect(dropdownTrigger).not.toBeInTheDocument()
	})

	describe("preferred models sections", () => {
		// kilocode_change start
		test("renders free models section first and shows rounded pricing", async () => {
			const user = userEvent.setup()
			mockUseGroupedModelIds.mockReturnValue({
				preferredModelIds: ["preferred-paid", "preferred-free"],
				restModelIds: ["free-rest", "regular-rest"],
			})

			mockUseProviderModels.mockReturnValue({
				provider: "openai",
				providerModels: {
					"preferred-paid": { displayName: "Preferred Paid", inputPrice: 2.11, outputPrice: 8.44 },
					"preferred-free": { displayName: "Preferred Free", inputPrice: 0, outputPrice: 0, isFree: true },
					"free-rest": { displayName: "Rest Free", inputPrice: 0, outputPrice: 0, isFree: true },
					"regular-rest": { displayName: "Rest Paid", inputPrice: 1.04, outputPrice: 3.96 },
				},
				providerDefaultModel: "preferred-paid",
				isLoading: false,
				isError: false,
			})

			render(
				<ModelSelector
					currentApiConfigName="test-profile"
					apiConfiguration={{
						apiProvider: "openai",
						apiModelId: "preferred-paid",
					}}
					fallbackText="Select a model"
				/>,
			)

			await user.click(screen.getByTestId("dropdown-trigger"))

			expect(screen.getByText("settings:modelPicker.freeModels")).toBeInTheDocument()
			expect(screen.getByText("settings:modelPicker.recommendedModels")).toBeInTheDocument()
			expect(screen.getByText("settings:modelPicker.allModels")).toBeInTheDocument()
			expect(screen.getByText("2.1/8.4$")).toBeInTheDocument()
			expect(screen.getByText("0.0/0.0$")).toBeInTheDocument()
		})
		// kilocode_change end

		test("builds options with section headers when preferred models exist", () => {
			// Setup mock to return preferred models
			mockUseGroupedModelIds.mockReturnValue({
				preferredModelIds: ["preferred-1", "preferred-2"],
				restModelIds: ["model-1", "model-2"],
			})

			mockUseProviderModels.mockReturnValue({
				provider: "openai",
				providerModels: {
					"preferred-1": { displayName: "Preferred Model 1", preferredIndex: 0 },
					"preferred-2": { displayName: "Preferred Model 2", preferredIndex: 1 },
					"model-1": { displayName: "Model 1" },
					"model-2": { displayName: "Model 2" },
				},
				providerDefaultModel: "model-1",
				isLoading: false,
				isError: false,
			})

			render(
				<ModelSelector
					currentApiConfigName="test-profile"
					apiConfiguration={{
						apiProvider: "openai",
						apiModelId: "model-1",
					}}
					fallbackText="Select a model"
				/>,
			)

			// Should render the dropdown
			const dropdownTrigger = screen.getByTestId("dropdown-trigger")
			expect(dropdownTrigger).toBeInTheDocument()
		})

		test("does not add section headers when no preferred models exist", () => {
			// Setup mock with no preferred models
			mockUseGroupedModelIds.mockReturnValue({
				preferredModelIds: [],
				restModelIds: ["model-1", "model-2"],
			})

			render(
				<ModelSelector
					currentApiConfigName="test-profile"
					apiConfiguration={{
						apiProvider: "openai",
						apiModelId: "model-1",
					}}
					fallbackText="Select a model"
				/>,
			)

			// Should render the dropdown
			const dropdownTrigger = screen.getByTestId("dropdown-trigger")
			expect(dropdownTrigger).toBeInTheDocument()
		})

		test("handles only preferred models without rest models", () => {
			// Setup mock with only preferred models (edge case)
			mockUseGroupedModelIds.mockReturnValue({
				preferredModelIds: ["preferred-1"],
				restModelIds: [],
			})

			mockUseProviderModels.mockReturnValue({
				provider: "openai",
				providerModels: {
					"preferred-1": { displayName: "Preferred Model 1", preferredIndex: 0 },
				},
				providerDefaultModel: "preferred-1",
				isLoading: false,
				isError: false,
			})

			render(
				<ModelSelector
					currentApiConfigName="test-profile"
					apiConfiguration={{
						apiProvider: "openai",
						apiModelId: "preferred-1",
					}}
					fallbackText="Select a model"
				/>,
			)

			// Should render the dropdown with only preferred models section
			const dropdownTrigger = screen.getByTestId("dropdown-trigger")
			expect(dropdownTrigger).toBeInTheDocument()
		})
	})

	test("gpt-chat-by auto toggle switches to klepa/auto", async () => {
		const user = userEvent.setup()
		mockUseProviderModels.mockReturnValue({
			provider: "gpt-chat-by",
			providerModels: {
				"klepa/auto": { displayName: "Auto" },
				"openai/gpt-oss-120b": { displayName: "OSS 120B" },
			},
			providerDefaultModel: "klepa/auto",
			isLoading: false,
			isError: false,
		})
		mockUseGroupedModelIds.mockReturnValue({
			preferredModelIds: [],
			restModelIds: ["klepa/auto", "openai/gpt-oss-120b"],
		})
		mockGetSelectedModelId.mockReturnValue("openai/gpt-oss-120b")

		render(
			<ModelSelector
				currentApiConfigName="test-profile"
				apiConfiguration={{
					apiProvider: "gpt-chat-by",
					apiModelId: "openai/gpt-oss-120b",
				}}
				fallbackText="Select a model"
			/>,
		)

		await user.click(screen.getByRole("switch", { name: "Toggle auto mode" }))

		expect(vscode.postMessage).toHaveBeenCalledWith(
			expect.objectContaining({
				type: "upsertApiConfiguration",
				text: "test-profile",
				apiConfiguration: expect.objectContaining({
					apiModelId: "klepa/auto",
				}),
			}),
		)
	})

	test("gpt-chat-by auto toggle off restores previous manual model", async () => {
		const user = userEvent.setup()
		postMessageMock.mockClear()

		mockUseProviderModels.mockReturnValue({
			provider: "gpt-chat-by",
			providerModels: {
				"klepa/auto": { displayName: "Auto" },
				"klepa/free": { displayName: "Free" }, // must be the first manual model for the old bug
				"openai/gpt-oss-120b": { displayName: "OSS 120B" },
			},
			providerDefaultModel: "klepa/auto",
			isLoading: false,
			isError: false,
		})
		mockUseGroupedModelIds.mockReturnValue({
			preferredModelIds: [],
			restModelIds: ["klepa/auto", "klepa/free", "openai/gpt-oss-120b"],
		})

		mockGetSelectedModelId.mockReturnValue("openai/gpt-oss-120b")

		const { rerender } = render(
			<ModelSelector
				currentApiConfigName="test-profile"
				apiConfiguration={{
					apiProvider: "gpt-chat-by",
					apiModelId: "openai/gpt-oss-120b",
				}}
				fallbackText="Select a model"
			/>,
		)

		await user.click(screen.getByRole("switch", { name: "Toggle auto mode" }))

		expect(vscode.postMessage).toHaveBeenCalledWith(
			expect.objectContaining({
				type: "upsertApiConfiguration",
				text: "test-profile",
				apiConfiguration: expect.objectContaining({
					apiModelId: "klepa/auto",
				}),
			}),
		)

		postMessageMock.mockClear()
		mockGetSelectedModelId.mockReturnValue("klepa/auto")

		rerender(
			<ModelSelector
				currentApiConfigName="test-profile"
				apiConfiguration={{
					apiProvider: "gpt-chat-by",
					apiModelId: "klepa/auto",
				}}
				fallbackText="Select a model"
			/>,
		)

		await user.click(screen.getByRole("switch", { name: "Toggle auto mode" }))

		expect(vscode.postMessage).toHaveBeenCalledWith(
			expect.objectContaining({
				type: "upsertApiConfiguration",
				text: "test-profile",
				apiConfiguration: expect.objectContaining({
					apiModelId: "openai/gpt-oss-120b",
				}),
			}),
		)
	})
})
