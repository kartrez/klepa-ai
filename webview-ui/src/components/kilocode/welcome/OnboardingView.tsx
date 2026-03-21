// kilocode_change - new file
import React, { useCallback, useEffect, useRef, useState } from "react"
import { VSCodeTextField } from "@vscode/webview-ui-toolkit/react"
import Logo from "../common/Logo"
import { useAppTranslation } from "@/i18n/TranslationContext"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { vscode } from "@/utils/vscode"
import { VSCodeButtonLink } from "@/components/common/VSCodeButtonLink"

interface OnboardingOptionProps {
	title: string
	description: string
	icon: string
	onClick: () => void
}

const OnboardingOption: React.FC<OnboardingOptionProps> = ({ title, description, icon, onClick }) => {
	return (
		<button
			className="w-full p-5 rounded-lg border border-vscode-panel-border bg-vscode-editor-background hover:bg-vscode-list-hoverBackground cursor-pointer text-left transition-colors flex items-center gap-4"
			onClick={onClick}>
			<span
				className={`codicon codicon-${icon} text-vscode-foreground`}
				style={{ fontSize: "24px", width: "24px", height: "24px" }}
			/>
			<div>
				<h3 className="text-lg font-semibold text-vscode-foreground m-0 mb-2">{title}</h3>
				<p className="text-sm text-vscode-descriptionForeground m-0">{description}</p>
			</div>
		</button>
	)
}

const OnboardingView: React.FC = () => {
	const { t } = useAppTranslation()
	const { apiConfiguration, currentApiConfigName, setApiConfiguration } = useExtensionState()
	const [tokenValue, setTokenValue] = useState("")
	const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined)
	const pendingActivation = useRef<string | null | undefined>(null)

	useEffect(() => {
		const handleMessage = (event: MessageEvent) => {
			const message = event.data
			if (message.type === "state" && pendingActivation.current) {
				const profileToActivate = pendingActivation.current
				pendingActivation.current = null
				vscode.postMessage({ type: "loadApiConfiguration", text: profileToActivate })
			}
		}

		window.addEventListener("message", handleMessage)
		return () => window.removeEventListener("message", handleMessage)
	}, [])

	const handleTelegramLogin = useCallback(() => {
		vscode.postMessage({ type: "telegramAuthButtonClicked" })
	}, [])

	const handleTokenLogin = useCallback(() => {
		const trimmedToken = tokenValue.trim()
		if (!trimmedToken) {
			setErrorMessage(t("settings:validation.apiKey"))
			return
		}

		setErrorMessage(undefined)
		const nextApiConfiguration = {
			...(apiConfiguration || {}),
			apiProvider: "gpt-chat-by" as const,
			gptChatByApiKey: trimmedToken,
		}

		setApiConfiguration(nextApiConfiguration)
		pendingActivation.current = currentApiConfigName
		vscode.postMessage({
			type: "upsertApiConfiguration",
			text: currentApiConfigName,
			apiConfiguration: nextApiConfiguration,
		})
	}, [apiConfiguration, currentApiConfigName, setApiConfiguration, t, tokenValue])

	return (
		<div className="flex flex-col items-center justify-center min-h-screen p-6 bg-vscode-sideBar-background">
			<Logo width={80} height={80} />

			<h1 className="text-2xl font-bold text-vscode-foreground text-center mt-4 mb-10">
				{t("kilocode:onboarding.title")}
			</h1>

			<div className="w-full max-w-md flex flex-col gap-4">
				<OnboardingOption
					title={t("kilocode:settings.provider.loginTelegram")}
					description={t("kilocode:settings.provider.loginTelegram")}
					icon="key"
					onClick={handleTelegramLogin}
				/>
				<VSCodeTextField
					value={tokenValue}
					type="password"
					onInput={(event) => setTokenValue((event.target as HTMLInputElement).value)}
					placeholder={t("settings:placeholders.apiKey")}
					className="w-full">
					<label className="block font-medium mb-1">{t("settings:providers.gptChatByApiKey")}</label>
				</VSCodeTextField>
				<button
					className="w-full p-5 rounded-lg border border-vscode-panel-border bg-vscode-editor-background hover:bg-vscode-list-hoverBackground cursor-pointer text-left transition-colors flex items-center gap-4"
					onClick={handleTokenLogin}>
					<span
						className="codicon codicon-pass text-vscode-foreground"
						style={{ fontSize: "24px", width: "24px", height: "24px" }}
					/>
					<div>
						<h3 className="text-lg font-semibold text-vscode-foreground m-0 mb-2">Войти по токену</h3>
						<p className="text-sm text-vscode-descriptionForeground m-0">Войти через API-ключ gpt-chat.by</p>
					</div>
				</button>
				<VSCodeButtonLink href="https://gpt-chat.by/doc-api" appearance="secondary">
					Получить токен
				</VSCodeButtonLink>
				{errorMessage && <p className="text-vscode-errorForeground text-sm m-0">{errorMessage}</p>}
			</div>
		</div>
	)
}

export default OnboardingView
