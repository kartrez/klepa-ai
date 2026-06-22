import path from "path"
import * as childProcess from "child_process"
import { fileExistsAtPath } from "../../utils/fs"

export function getRipgrepPlatformDir(): string {
	return `${process.platform}-${process.arch}`
}

export async function checkSystemRipgrep(binName: string): Promise<string | undefined> {
	try {
		const command = process.platform.startsWith("win") ? "where" : "which"
		const result = childProcess.execFileSync(command, [binName], { encoding: "utf8" }).trim()
		const candidate = result.split(/\r?\n/)[0]?.trim()
		if (candidate && (await fileExistsAtPath(candidate))) {
			return candidate
		}
	} catch {
		// ripgrep not found in PATH
	}

	return undefined
}

export async function checkBunPath(vscodeAppRoot: string, binName: string) {
	const platformDir = getRipgrepPlatformDir()

	for (const packageName of ["@vscode/ripgrep-universal", "@vscode/ripgrep"]) {
		try {
			const ripgrepPkg = require.resolve(`${packageName}/package.json`, { paths: [vscodeAppRoot] })
			const ripgrepRoot = path.dirname(ripgrepPkg)

			for (const relativePath of [`bin/${platformDir}/${binName}`, `bin/${binName}`]) {
				const bunPath = path.join(ripgrepRoot, relativePath)
				if (await fileExistsAtPath(bunPath)) {
					return bunPath
				}
			}
		} catch {
			// Package not found via require.resolve
		}
	}

	return undefined
}
