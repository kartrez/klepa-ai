import React, { useState, useEffect } from "react"

const getIsLightThemeFromEditor = () =>
	document.body.classList.contains("vscode-light") || document.body.classList.contains("vscode-high-contrast-light")

export default function Logo({ width = 100, height = 100 }: { width?: number; height?: number }) {

	const [isLightTheme, setIsLightTheme] = useState(getIsLightThemeFromEditor)

	useEffect(() => {
		const observer = new MutationObserver(() => {
			setIsLightTheme(getIsLightThemeFromEditor())
		})
		observer.observe(document.body, { attributes: true, attributeFilter: ["class"] })
		return () => observer.disconnect()
	}, [])

	const colorOutput = isLightTheme ? "#FEFEFE": "#252525"
	const colorInput = isLightTheme ? "#1a1a18" : "#f8f674"

	return (
		<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 256 256" preserveAspectRatio="xMidYMid meet">
			{/* Левая фигурная скобка */}
			<path
				d="M74,54 c-25,2 -34,18 -34,42 v24 c0,12 -6,16 -16,18 c10,2 16,6 16,18 v24 c0,24 9,40 34,42 h4 v-12 h-2 c-16,-1 -20,-10 -20,-30 v-24 c0,-14 -8,-18 -18,-20 c10,-2 18,-6 18,-20 v-24 c0,-20 4,-29 20,-30 h2 v-12 Z"
				fill={colorInput}
			/>

			{/* Молоток */}
			<g fill={colorInput}>
				{/* Головка молотка */}
				<path d="M115,65 c-25,5 -35,35 -35,55 c12,-10 25,-15 40,-12 v12 h20 v-45 c0,-6 -4,-10 -10,-10 h-15 Z" />
				<rect x="142" y="65" width="16" height="35" rx="2" />
				{/* Рукоятка (верхняя часть) */}
				<rect x="120" y="115" width="20" height="55" />
				{/* Рукоятка (основная часть с расширением) */}
				<path d="M116,172 h28 l4,55 c0,8 -6,14 -14,14 h-8 c-8,0 -14,-6 -14,-14 Z" />
				{/* Блик на рукоятке */}
				<rect x="122" y="178" width="3" height="40" fill={colorOutput} opacity="0.3" />
			</g>

			{/* Правая фигурная скобка (зеркальная копия левой) */}
			<path
				d="M182,54 c25,2 34,18 34,42 v24 c0,12 6,16 16,18 c-10,2 -16,6 -16,18 v24 c0,24 -9,40 -34,42 h-4 v-12 h2 c16,-1 20,-10 20,-30 v-24 c0,-14 8,-18 18,-20 c-10,-2 -18,-6 -18,-20 v-24 c0,-20 -4,-29 -20,-30 h-2 v-12 Z"
				fill={colorInput}
			/>
		</svg>
	)
}
