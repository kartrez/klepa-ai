// kilocode_change - new file
// npx vitest src/components/kilocode/welcome/__tests__/OnboardingView.spec.tsx

import { render, screen, fireEvent } from "@/utils/test-utils"
import OnboardingView from "../OnboardingView"
import { vscode } from "@/utils/vscode"

// Mock Logo component
vi.mock("../../common/Logo", () => ({
	default: () => <div data-testid="kilo-logo">Kilo Logo</div>,
}))

vi.mock("@/utils/vscode", () => ({
	vscode: {
		postMessage: vi.fn(),
	},
}))

const mockSetApiConfiguration = vi.fn()

vi.mock("@/context/ExtensionStateContext", () => ({
	useExtensionState: () => ({
		apiConfiguration: {},
		currentApiConfigName: "default",
		setApiConfiguration: mockSetApiConfiguration,
	}),
}))

describe("OnboardingView", () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it("renders the Kilo logo", () => {
		render(<OnboardingView />)

		expect(screen.getByTestId("kilo-logo")).toBeInTheDocument()
	})

	it("renders the title and auth actions", () => {
		render(<OnboardingView />)

		// The translation key is returned as-is by the test-utils mock
		expect(screen.getByText("kilocode:onboarding.title")).toBeInTheDocument()
		expect(screen.getByText("Войти по токену")).toBeInTheDocument()
		expect(screen.getByText("Получить токен")).toBeInTheDocument()
	})

	it("sends telegram auth message when telegram option is clicked", () => {
		const mockPostMessage = vi.mocked(vscode.postMessage)
		render(<OnboardingView />)

		const telegramButton = screen.getByText("kilocode:settings.provider.loginTelegram").closest("button")
		expect(telegramButton).toBeInTheDocument()
		fireEvent.click(telegramButton!)

		expect(mockPostMessage).toHaveBeenCalledWith({ type: "telegramAuthButtonClicked" })
	})

	it("shows validation error when token login is submitted without token", () => {
		render(<OnboardingView />)

		fireEvent.click(screen.getByText("Войти по токену"))
		expect(screen.getByText("settings:validation.apiKey")).toBeInTheDocument()
	})

	it("saves token and posts upsert message when token is provided", () => {
		const mockPostMessage = vi.mocked(vscode.postMessage)
		render(<OnboardingView />)

		fireEvent.input(screen.getByPlaceholderText("settings:placeholders.apiKey"), {
			target: { value: "test-token" },
		})
		fireEvent.click(screen.getByText("Войти по токену"))

		expect(mockSetApiConfiguration).toHaveBeenCalledWith({
			apiProvider: "gpt-chat-by",
			gptChatByApiKey: "test-token",
		})
		expect(mockPostMessage).toHaveBeenCalledWith({
			type: "upsertApiConfiguration",
			text: "default",
			apiConfiguration: {
				apiProvider: "gpt-chat-by",
				gptChatByApiKey: "test-token",
			},
		})
	})
})
