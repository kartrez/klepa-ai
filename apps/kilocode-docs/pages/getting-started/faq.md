---
title: "Frequently Asked Questions"
description: "Find answers to common questions about Klepa AI"
---

# Frequently Asked Questions

This page answers some common questions about Klepa AI.

## General

### What is Klepa AI?

Klepa AI is an open-source AI agent extension for Visual Studio Code. It helps you write code more efficiently by generating code, automating tasks, and providing suggestions.

### How does Klepa AI work?

Klepa AI uses large language models (LLMs) to understand your requests and translate them into actions. It can:

- Read, write, and delete files in your project.
- Execute commands in your VS Code terminal.
- Perform web browsing (if enabled).
- Use external tools via the Model Context Protocol (MCP).

You interact with Klepa AI through a chat interface, where you provide instructions and review/approve its proposed actions, or you can use the inline autocomplete feature which helps you as you type.

### What can Klepa AI do?

Klepa AI can help with a variety of coding tasks, including:

- Generating code from natural language descriptions.
- Refactoring existing code.
- Fixing bugs.
- Writing documentation.
- Explaining code.
- Answering questions about your codebase.
- Automating repetitive tasks.
- Creating new files and projects.

### Is Klepa AI free to use?

The Klepa AI extension itself is free and open-source. In order for Klepa AI to be useful, you need an AI model to respond to your queries. Models are hosted by providers and most charge for access.

There are some models available for free. The set of free models if constantly changing based on provider pricing decisions.

You can also use Klepa AI with a [local model](/docs/automate/extending/local-models) or "Bring Your Own API Key" for [another model provider](/docs/getting-started/setup-authentication) (like [Anthropic](/docs/ai-providers/anthropic), [OpenAI](/docs/ai-providers/openai), [OpenRouter](/docs/ai-providers/openrouter), [Requesty](/docs/ai-providers/requesty), etc.).

### How do I pay for model usage via Klepa AI?

If you choose to pay for models via Klepa AI, you do so by buying Kilo Credits. You can [buy Kilo Credits](/docs/getting-started/adding-credits) securely via Stripe with a credit card. We do not charge a markup on Kilo Credits. $1 you give us is $1 in Kilo Credits.

Model usage is metered by the providers in terms of different kinds of tokens. When you use a model, we debit your Kilo credits by the amount the provider charges us -- with no markup.

You can use any models you like as long as you have credits in your account. When you run out of credits, you can add more. It's that simple!

If you're looking to earn some credits, you could join our [Discord](https://kilo.ai/discord) where we sometimes have promotional offers!

### What are the risks of using Klepa AI?

Klepa AI is a powerful tool, and it's important to use it responsibly. Here are some things to keep in mind:

- **Klepa AI can make mistakes.** Always review Klepa AI's proposed changes carefully before approving them.
- **Klepa AI can execute commands.** Be very cautious about allowing Klepa AI to run commands, especially if you're using auto-approval.
- **Klepa AI can access the internet.** If you're using a provider that supports web browsing, be aware that Klepa AI could potentially access sensitive information.

## Setup & Installation

### How do I install Klepa AI?

See the [Installation Guide](/docs/getting-started/installing) for detailed instructions.

### Which API providers are supported?

Klepa AI supports a wide range of API providers, including:

- [Anthropic (Claude)](/docs/ai-providers/kilocode)
- [Anthropic (Claude)](/docs/ai-providers/anthropic)
- [OpenAI](/docs/ai-providers/openai)
- [OpenRouter](/docs/ai-providers/openrouter)
- [Google Gemini](/docs/ai-providers/gemini)
- [Glama](/docs/ai-providers/glama)
- [AWS Bedrock](/docs/ai-providers/bedrock)
- [GCP Vertex AI](/docs/ai-providers/vertex)
- [Ollama](/docs/ai-providers/ollama)
- [LM Studio](/docs/ai-providers/lmstudio)
- [DeepSeek](/docs/ai-providers/deepseek)
- [Mistral](/docs/ai-providers/mistral)
- [Unbound](/docs/ai-providers/unbound)
- [Requesty](/docs/ai-providers/requesty)
- [VS Code Language Model API](/docs/ai-providers/vscode-lm)

### How do I get an API key?

Each API provider has its own process for obtaining an API key. See the [Setting Up Your First AI Provider](/docs/getting-started/setup-authentication) for links to the relevant documentation for each provider.

### Can I use Klepa AI with local models?

Yes, Klepa AI supports running models locally using [Ollama](/docs/providers/ollama) and [LM Studio](/docs/providers/lmstudio). See [Using Local Models](/docs/advanced-usage/local-models) for instructions.

## Usage

### How do I start a new task?

Open the Klepa AI panel (<img src="/docs/img/kilo-v1.svg" width="12" />) and type your task in the chat box. Be clear and specific about what you want Klepa AI to do. See [The Chat Interface](/docs/basic-usage/the-chat-interface) for best practices.

### When should I use chat vs autocomplete?

Use **chat** when you need to:

- Make complex, multi-file changes
- Refactor code across your project
- Get explanations or ask questions
- Have Klepa AI execute commands or browse the web
- Work on tasks that require planning and multiple steps

Use **autocomplete** when you need to:

- Complete the current line or block of code quickly
- Get suggestions for common patterns and boilerplate
- Make quick, localized edits without context switching
- Speed up typing repetitive code

In general, autocomplete is best for quick, in-flow coding assistance, while chat is better for larger tasks that require more context and interaction.

### What are modes in Klepa AI?

[Modes](/docs/code-with-ai/agents/using-modes) are different personas that Klepa AI can adopt, each with a specific focus and set of capabilities. The built-in modes are:

- **Code:** For general-purpose coding tasks.
- **Architect:** For planning and technical leadership.
- **Ask:** For answering questions and providing information.
- **Debug:** For systematic problem diagnosis.
  You can also create [Custom Modes](/docs/customize/custom-modes).

### How do I switch between modes?

Use the dropdown menu in the chat input area to select a different mode, or use the `/` command to switch to a specific mode.

### What are tools and how do I use them?

[Tools](/docs/basic-usage/how-tools-work) are how Klepa AI interacts with your system. Klepa AI automatically selects and uses the appropriate tools to complete your tasks. You don't need to call tools directly. You will be prompted to approve or reject each tool use.

### What are context mentions?

[Context mentions](/docs/basic-usage/context-mentions) are a way to provide Klepa AI with specific information about your project, such as files, folders, or problems. Use the "@" symbol followed by the item you want to mention (e.g., `@/src/file.ts`, `@problems`).

### Can Klepa AI access the internet?

Yes, if you are using a provider with a model that support web browsing. Be mindful of the security implications of allowing this.

### Can Klepa AI run commands in my terminal?

Yes, Klepa AI can execute commands in your VS Code terminal. You will be prompted to approve each command before it's executed, unless you've enabled auto-approval for commands. Be extremely cautious about auto-approving commands. If you're experiencing issues with terminal commands, see the [Shell Integration Guide](/docs/features/shell-integration) for troubleshooting.

### How do I provide feedback to Klepa AI?

You can provide feedback by approving or rejecting Klepa AI's proposed actions. You can provide additional feedback by using the feedback field.

### Can I customize Klepa AI's behavior?

Yes, you can customize Klepa AI in several ways:

- **Custom Instructions:** Provide general instructions that apply to all modes, or mode-specific instructions.
- **Custom Modes:** Create your own modes with tailored prompts and tool permissions.
- **`.clinerules` Files:** Create `.clinerules` files in your project to provide additional guidelines.
- **Settings:** Adjust various settings, such as auto-approval, diff editing, and more.

### Does Klepa AI have any auto approval settings?

Yes, Klepa AI has a few settings that when enabled will automatically approve actions. Find out more [here](/docs/features/auto-approving-actions).

## Advanced Features

### Can I use Klepa AI offline?

Yes, if you use a [local model](/docs/advanced-usage/local-models).

### What is MCP (Model Context Protocol)?

[MCP](/docs/automate/mcp/overview) is a protocol that allows Klepa AI to communicate with external servers, extending its capabilities with custom tools and resources.

### Can I create my own MCP servers?

Yes, you can create your own MCP servers to add custom functionality to Klepa AI. See the [MCP documentation](https://github.com/modelcontextprotocol) for details.
Yes, you can create your own MCP servers to add custom functionality to Klepa AI. See the [MCP documentation](https://github.com/modelcontextprotocol) for details.

## Known Limitations

### Multi-Folder Workspaces ("Add Folder to Workspace")

Using VS Code's "Add Folder to Workspace" feature to add additional folders is not supported by the Klepa AI VS Code extension.

**What this means:**

- If you use "File > Add Folder to Workspace..." to add additional folders to your VS Code workspace, Klepa AI will **not** recognize these additional folders as part of the workspace.
- Any folders added this way will be treated as directories **outside** of the workspace from Klepa AI's perspective.
- Klepa AI only operates within the first root-level folder in the workspace (the first folder opened or the root of a single-folder workspace).

**Workarounds:**

- Open the workspace in a parent folder which includes all of your desired folders, if possible. Note that this will also give the agent access to any other folders within that parent folder.
- Use context mentions (e.g., `@/path/to/file`) to reference files within the primary workspace folder. Read actions outside of the first folder may ask permission depending on your auto-approve settings. It is not currently possible to add individual folders to the auto-approve for reading outside of the workspace.

## Troubleshooting

### Klepa AI isn't responding. What should I do?

- Make sure your API key is correct and hasn't expired.
- Check your internet connection.
- Check the status of your chosen API provider.
- Try restarting VS Code.
- If the problem persists, report the issue on [GitHub](https://github.com/Kilo-Org/kilocode/issues) or [Discord](https://gpt-chat.by/discord).

### I'm seeing an error message. What does it mean?

The error message should provide some information about the problem. If you're unsure how to resolve it, seek help in the community forums.

### Klepa AI made changes I didn't want. How do I undo them?

Klepa AI uses VS Code's built-in file editing capabilities. You can use the standard "Undo" command (Ctrl/Cmd + Z) to revert changes. Also, if experimental checkpoints are enabled, Kilo can revert changes made to a file.

### How do I report a bug or suggest a feature?

Please report bugs or suggest features on the Klepa AI [Issues page](https://github.com/Kilo-Org/kilocode/issues) and [Feature Requests page](https://github.com/Kilo-Org/kilocode/discussions/categories/ideas).
