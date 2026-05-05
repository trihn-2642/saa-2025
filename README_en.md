# Agentic Coding Hands-on

[![Vietnamese](https://img.shields.io/badge/Vietnamese-green.svg)](https://github.com/sun-asterisk-internal/agentic-coding-hands-on/blob/main/README.md) [![Japanese](https://img.shields.io/badge/Japanese-yellow.svg)](https://github.com/sun-asterisk-internal/agentic-coding-hands-on/blob/main/README_ja.md) [![English](https://img.shields.io/badge/English-blue.svg)](https://github.com/sun-asterisk-internal/agentic-coding-hands-on/blob/main/README_en.md)

Repository for the Sun\* internal **Agentic Coding** hands-on workshop. Participants will use **MoMorph + Claude Code** to generate code from Figma designs. Besides Claude Code, you can also use other AI coding agents such as **Copilot**, **Gemini**, **Windsurf**, etc. with similar steps and usage. In this hands-on, we assume you are using **Claude Code**.

## Branches

This repository has the following branches:

- [**`main`**](https://github.com/sun-asterisk-internal/agentic-coding-hands-on/tree/main) — Documentation and Supabase configuration only. Participants clone this branch and initialize their own project (Next.js, Android, React Native, iOS, etc.).
- [**`web-sample`**](https://github.com/sun-asterisk-internal/agentic-coding-hands-on/tree/web-sample) — Sample reference for Web (Next.js). Contains pre-built `.claude`, `.vscode`, `.momorph` directories with sample specs and generated code for several screens. Use this to see what the input context and MoMorph-generated output look like.

## Prerequisites

- Git
- Docker (for running Supabase locally)
- [MoMorph CLI](https://github.com/momorph/cli)
- [Claude Code](https://docs.anthropic.com/en/docs/claude-code)
- [VSCode](https://code.visualstudio.com/) + MoMorph Extension — for viewing Figma frame lists and quickly copying prompts. Especially useful for mobile developers whose primary IDE (Android Studio, Xcode) does not support the MoMorph Extension.

### Suggested Tech Stack

You are not limited to any specific tech stack — feel free to use any framework or language that suits you. However, we recommend the following stacks for the best experience with MoMorph:

- **Backend (common):** [Supabase](https://supabase.com/) — Backend-as-a-Service (BaaS) platform providing database, authentication, and real-time features
- **Web:** Next.js + Cloudflare Workers + TailwindCSS + Supabase
- **Android:** Kotlin + Jetpack Compose + Supabase
- **iOS:** Swift + SwiftUI + Supabase
- **React Native:** React Native + Expo + Supabase

## Hands-on Guide

### Step 0: Complete GitHub SSO

1. Visit https://github.com/orgs/sun-asterisk-internal/sso
2. Complete the SSO sign-in process so your GitHub account can join the `sun-asterisk-internal` organization

### Step 1: Initialize your project

Create a new project using the appropriate tool for your chosen platform:

```sh
# Web (Next.js):
npx create-next-app@latest my-app
cd my-app

# Android:
# Open Android Studio → New Project → create a new project

# React Native (Expo):
npx create-expo-app my-app
cd my-app

# iOS (Swift):
# Open Xcode → Create New Project → create a new project
```

After initialization, set up git remotes as follows:

```sh
git init    # if the project doesn't have git yet

# origin: your personal fork (replace <your-username> with your GitHub username)
git remote add origin git@github.com:<your-username>/agentic-coding-hands-on.git

# upstream: the original hands-on repository
git remote add upstream git@github.com:sun-asterisk-internal/agentic-coding-hands-on.git
```

Verify with `git remote -v` — the expected output should look like:

```
origin    git@github.com:<your-username>/agentic-coding-hands-on.git (fetch)
origin    git@github.com:<your-username>/agentic-coding-hands-on.git (push)
upstream  git@github.com:sun-asterisk-internal/agentic-coding-hands-on.git (fetch)
upstream  git@github.com:sun-asterisk-internal/agentic-coding-hands-on.git (push)
```

> **Why set the remotes?** The MoMorph VSCode Extension needs to identify the repository to display the linked Figma file. The `upstream` remote pointing to `sun-asterisk-internal/agentic-coding-hands-on` ensures MoMorph works correctly, while `origin` points to your personal fork so you can push your own code.

### Step 2: Sign in to MoMorph Web and connect your GitHub account

1. Go to [MoMorph Web](https://momorph.ai/) and sign in with your Figma account (use your `*@sun-asterisk.com` email).
2. Enter the following Figma file link to continue: https://www.figma.com/design/9ypp4enmFmdK3YAFJLIu6C/SAA-2025---Internal-Live-Coding
3. Go to **Settings → GitHub → Connect** to link your GitHub account with MoMorph, and make sure you have granted access to the `sun-asterisk-internal/agentic-coding-hands-on` repository in this step.

> **Note:** This repository is already connected to MoMorph and the Figma project on the system. You only need to connect your personal GitHub account to MoMorph to get started.

### Step 3: Install MoMorph CLI

Choose one of the following installation methods:

```sh
# macOS / Linux (Homebrew):
brew install momorph/tap/momorph-cli

# Windows (Chocolatey):
choco install momorph

# Windows (PowerShell):
irm https://raw.githubusercontent.com/momorph/cli/refs/heads/main/scripts/install.ps1 | iex

# Linux / macOS (Bash):
curl -fsSL https://raw.githubusercontent.com/momorph/cli/refs/heads/main/scripts/install.sh | bash
```

Verify the installation:

```sh
momorph version
```

### Step 4: Sign in to MoMorph CLI

```sh
momorph login
```

The CLI will display an authentication code and a login link. Press `Enter` to open the link in your browser, then enter the code to complete authentication.

Check your account information:

```sh
momorph whoami
```

### Step 5: Initialize the MoMorph project

Run the init command to generate configuration directories (`.claude`, `.vscode` prompts, MCP server connection, etc.):

```sh
# For Claude Code:
momorph init . --ai claude

# For GitHub Copilot:
momorph init . --ai copilot

# For Cursor:
momorph init . --ai cursor
```

This command will:
- Download the latest MoMorph project template
- Generate configuration files (`.claude/`, prompt files, workflow scripts, etc.)
- Set up the MCP server connection for the selected AI agent
- Automatically install the MoMorph VSCode Extension (if not already installed). After installation, open the repo source code in VSCode → run the "MoMorph: Sign In" command → click on the MoMorph icon in the sidebar → you will see the frame list of the linked Figma file.

> **Note:** If you encounter the `failed to install extension` error during `momorph init` but the init process still succeeds, install the extension manually using the VSIX file included in the `resources/` directory:
> ```sh
> code --install-extension resources/vscode-momorph-0.12.4.vsix
> ```
> Or refer to the detailed guide here: https://sun-asterisk.enterprise.slack.com/docs/T02CQGZA7MK/F094K2LTV71?focus_section_id=temp:C:USe2e5a076e79fd458c9b713260c

### Step 6: Filter mobile screens in MoMorph VSCode Extension

If you are practicing with mobile, filter the Figma Tree to show only mobile screen designs:

1. Open the Command Palette: `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (macOS)
2. Run: **MoMorph: Filter Screens**
3. Filter by: **Figma Pages** → Select **"Mobile"**
4. Filter by: **Spec Status** → Select **"Done"**

This filters the screen list to show only mobile screens with completed specifications, making your workflow faster and more focused.

### Step 7: Start generating code

Use the Figma project for practice:

**Figma file:** [SAA 2025 - Internal Live Coding](https://www.figma.com/design/9ypp4enmFmdK3YAFJLIu6C/SAA-2025---Internal-Live-Coding)

#### Preparing context: Writing Screen Specs on MoMorph Web

Normally, before starting code generation, you need to prepare complete *Screen Specifications* on MoMorph. Screen Specifications can be written manually, generated by AI through features on MoMorph Web, the MoMorph Figma Plugin (requires a Figma Account with Full Seat), or through Agent systems (GitHub Copilot, Claude Code) when connected to the MoMorph MCP Server.

Screen specs on the server are the source of truth for the entire code generation workflow.

> **Note for this hands-on session:** Screen specs for all screens have already been prepared on the MoMorph server, so you **do not need to create screen specs** and can **jump straight into the code generation workflow starting from `/momorph.constitution`**. However, you are still encouraged to explore the Screen Spec creation process with MoMorph in more depth.
> - Please refer to the [MoMorph Figma Plugin](https://sun-asterisk.enterprise.slack.com/docs/T02CQGZA7MK/F07S87PSVUN) documentation to learn more about writing Screen Specs.
> - Please refer to the [MoMorph CLI Commands](https://sun-asterisk.enterprise.slack.com/docs/T02CQGZA7MK/F0A86NC88SK) documentation, then try creating screen specs for a few screens using the `momorph.specs` command.

#### Code generation workflow with MoMorph

Once screen specs are available on the MoMorph server, use slash commands in your AI agent to generate code:

1. **`/momorph.constitution`** — Initialize coding standards and conventions for the project. This is a command you typically only need to run once at the beginning of the workflow to establish the development rules that the AI Agent must follow throughout the code generation process.
2. **`/momorph.specify`** — Fetch screen specs and Figma design information to local via MoMorph MCP, then analyze and generate detailed specification files (`spec.md`, `design-style.md`). For each feature/screen, start with this command to establish the initial context.
3. **`/momorph.reviewspecify`** — Review and refine the spec output (recommended to run 2–3 times for better results)
4. **`/momorph.plan`** — Generate a detailed implementation plan
5. **`/momorph.reviewplan`** — Review and refine the plan output (recommended to run 2–3 times for better results)
6. **`/momorph.tasks`** — Break down the plan into an executable task list
7. **`/momorph.implement`** — Execute tasks, generate code and tests

> **Why do we still need to run `/momorph.specify` even though specs already exist on MoMorph?**
>
> - **Screen specs on the MoMorph server** are functional descriptions of behavior and business logic written by humans and stored on the MoMorph Web platform. They serve as the source of truth.
> - **`/momorph.specify`** reads those screen specs from the server, **combines them with design information from Figma (layout, styles, component structure, etc.)**, and synthesizes them into detailed spec files stored locally in the repo (`spec.md`, `design-style.md`). These files are the direct context used by the AI agent in subsequent steps (plan, tasks, implement).
>
> In other words: specs on the MoMorph server are **screen specs** in Sun\*'s format, written for humans to read and review. The output of `/momorph.specify` is an **implementation spec** synthesized from multiple sources — **processed and enriched context** that enables the AI Agent to understand and generate accurate code.

#### Example prompts for each command

**1. `/momorph.constitution`** — Create development rules to follow in the project:

```
/momorph.constitution Write clean code with clear, concise source code organization. Apply best practices for your chosen tech stack and Supabase. The application should follow platform-appropriate UI patterns and guidelines (Material Design for Android, Human Interface Guidelines for iOS, responsive web design for web). Adhere to OWASP secure coding standards.
```

**2. `/momorph.specify`** — Create local specs and synthesize Figma design information:

```
/momorph.specify Create specs for the following Login screen:
https://momorph.ai/files/Z9KFZ0aAoOfkVEIPuwwkZl/frames/662:14387
```

**3. `/momorph.reviewspecify`** — Review the generated specs:

```
/momorph.reviewspecify Review specs for the following Login screen:
https://momorph.ai/files/Z9KFZ0aAoOfkVEIPuwwkZl/frames/662:14387
```

> It is recommended to run this command 2–3 times for more thorough spec reviews.

**4. `/momorph.plan`** — Create an implementation plan:

```
/momorph.plan Using Supabase Auth. Create a development plan for the Login screen:
https://momorph.ai/files/Z9KFZ0aAoOfkVEIPuwwkZl/frames/662:14387
```

**5. `/momorph.reviewplan`** — Review the generated plan:

```
/momorph.reviewplan Review the plan for the Login screen:
https://momorph.ai/files/Z9KFZ0aAoOfkVEIPuwwkZl/frames/662:14387
```

> It is recommended to run this command 2–3 times for more thorough plan reviews.

**6. `/momorph.tasks`** — Break the plan into a task list:

```
/momorph.tasks Break down the development tasks for the Login screen:
https://momorph.ai/files/Z9KFZ0aAoOfkVEIPuwwkZl/frames/662:14387
```

**7. `/momorph.implement`** — Execute tasks, generate code:

```
/momorph.implement Proceed to develop the Login screen:
https://momorph.ai/files/Z9KFZ0aAoOfkVEIPuwwkZl/frames/662:14387
```

**8. Fix bugs after all tasks are implemented:**

It is recommended to continue using the `/momorph.implement` command to fix bugs:
```
/momorph.implement Add a task to fix the incorrect font in the footer. Please review all items to ensure the fonts match the design.
```

### Step 8: Run your project

Run your project using the appropriate commands for your platform:

```sh
# Supabase local (common for all platforms):
npx supabase start    # Start Supabase locally
npx supabase stop     # Stop Supabase locally
```

```sh
# Web (Next.js):
yarn dev              # or npm run dev

# Android:
# Run from Android Studio (Shift+F10)

# iOS:
# Run from Xcode (Cmd+R)

# React Native:
npx expo start        # or npx react-native run-android / run-ios
```

## References

- [MoMorph CLI Documentation](https://sun-asterisk.enterprise.slack.com/docs/T02CQGZA7MK/F0A86NC88SK)
- [MoMorph MCP Server](https://sun-asterisk.enterprise.slack.com/docs/T02CQGZA7MK/F0A9HULD5D0)
- [MoMorph VSCode Extension](https://sun-asterisk.enterprise.slack.com/docs/T02CQGZA7MK/F094K2LTV71)
- [MoMorph Web](https://sun-asterisk.enterprise.slack.com/docs/T02CQGZA7MK/F092SAQBXR8)
- [MoMorph Figma Plugin](https://sun-asterisk.enterprise.slack.com/docs/T02CQGZA7MK/F07S87PSVUN)
