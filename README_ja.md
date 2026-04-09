# Agentic Coding Hands-on

[![Vietnamese](https://img.shields.io/badge/Vietnamese-green.svg)](https://github.com/sun-asterisk-internal/agentic-coding-hands-on/blob/main/README.md) [![Japanese](https://img.shields.io/badge/Japanese-yellow.svg)](https://github.com/sun-asterisk-internal/agentic-coding-hands-on/blob/main/README_ja.md) [![English](https://img.shields.io/badge/English-blue.svg)](https://github.com/sun-asterisk-internal/agentic-coding-hands-on/blob/main/README_en.md)

Sun\* 社内向け **Agentic Coding** ハンズオン研修用リポジトリです。受講者は **MoMorph + Claude Code** を使用して、Figma デザインからコードを生成します。Claude Code 以外にも、**Copilot**、**Gemini**、**Windsurf** などの AI コーディングエージェントも同様の手順で使用できます。本ハンズオンでは、**Claude Code** を使用することを前提としています。

## ブランチ

このリポジトリには以下のブランチがあります:

- [**`main`**](https://github.com/sun-asterisk-internal/agentic-coding-hands-on/tree/main) — ドキュメントと Supabase 設定のみ。受講者はこのブランチをクローンし、自分でプロジェクト（Next.js、Android、React Native、iOS など）を初期化して作業します。
- [**`web-sample`**](https://github.com/sun-asterisk-internal/agentic-coding-hands-on/tree/web-sample) — Web（Next.js）のサンプルリファレンス。いくつかの画面のサンプルスペックと生成済みコードが含まれた `.claude`、`.vscode`、`.momorph` ディレクトリが事前に用意されています。入力コンテキストや MoMorph の出力結果を確認する際に使用してください。

## 前提条件

- Git
- Docker（Supabase のローカル実行に必要）
- [MoMorph CLI](https://github.com/momorph/cli)
- [Claude Code](https://docs.anthropic.com/en/docs/claude-code)
- [VSCode](https://code.visualstudio.com/) + MoMorph Extension — Figma フレーム一覧の表示やプロンプトの素早いコピーに使用します。メインの IDE（Android Studio、Xcode）が MoMorph Extension をサポートしていないモバイル開発者にとって特に便利です。

### 推奨技術スタック

技術スタックに制限はありません。お好みのフレームワークや言語を自由にご利用いただけます。ただし、MoMorph で最良の体験を得るために、以下のスタックを推奨します:

- **バックエンド（共通）:** [Supabase](https://supabase.com/) — データベース、認証、リアルタイム機能を提供する Backend-as-a-Service（BaaS）プラットフォーム
- **Web:** Next.js + Cloudflare Workers + TailwindCSS + Supabase
- **Android:** Kotlin + Jetpack Compose + Supabase
- **iOS:** Swift + SwiftUI + Supabase
- **React Native:** React Native + Expo + Supabase

## ハンズオン手順

### ステップ 0: GitHub SSO を実施する

1. https://github.com/orgs/sun-asterisk-internal/sso にアクセスします
2. SSO サインインを完了し、あなたの GitHub アカウントが `sun-asterisk-internal` organization に参加できる状態にします
3. `sun-asterisk-internal/agentic-coding-hands-on` リポジトリのメンバーに追加してもらうため、GitHub ユーザー名を `@nguyen.huu.kim` または `@le.minh.hoang` に共有します
4. 対応完了の連絡を待ってから、次のステップに進みます

### ステップ 1: プロジェクトの初期化

選択したプラットフォームに応じた適切なツールで新しいプロジェクトを作成します:

```sh
# Web (Next.js):
npx create-next-app@latest my-app
cd my-app

# Android:
# Android Studio を開く → New Project → 新しいプロジェクトを作成

# React Native (Expo):
npx create-expo-app my-app
cd my-app

# iOS (Swift):
# Xcode を開く → Create New Project → 新しいプロジェクトを作成
```

初期化完了後、ハンズオン用リポジトリを指す git remote を設定します:

```sh
git init    # プロジェクトに git がまだない場合
git remote add origin https://github.com/sun-asterisk-internal/agentic-coding-hands-on.git
```

> **なぜ remote を設定するのか？** MoMorph VSCode Extension がリポジトリを識別し、連携済みの Figma ファイルを表示するために必要です。remote を `sun-asterisk-internal/agentic-coding-hands-on` に向けることで、MoMorph が正しく動作します。

### ステップ 2: MoMorph Web へのサインインと GitHub アカウントの連携

1. [MoMorph Web](https://momorph.ai/) にアクセスし、Figma アカウント（`*@sun-asterisk.com` メール）でサインインします。
2. 次の Figma ファイルリンクを入力して続行します: https://www.figma.com/design/9ypp4enmFmdK3YAFJLIu6C/SAA-2025---Internal-Live-Coding
3. **Settings → GitHub → Connect** で GitHub アカウントを MoMorph に連携し、この手順で `sun-asterisk-internal/agentic-coding-hands-on` リポジトリへのアクセス権限を付与済みであることを必ず確認してください。

> **注意:** このリポジトリはすでにシステム上で MoMorph および Figma プロジェクトと連携されています。個人の GitHub アカウントを MoMorph に連携するだけで使用できます。

### ステップ 3: MoMorph CLI のインストール

以下のいずれかの方法を選択してください:

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

インストールの確認:

```sh
momorph version
```

### ステップ 4: MoMorph CLI へのサインイン

```sh
momorph login
```

CLI に認証コードとログインリンクが表示されます。`Enter` を押してブラウザでリンクを開き、コードを入力して認証を完了します。

アカウント情報の確認:

```sh
momorph whoami
```

### ステップ 5: MoMorph プロジェクトの初期化

init コマンドを実行して設定ディレクトリ（`.claude`、`.vscode` プロンプト、MCP サーバー接続など）を生成します:

```sh
# Claude Code を使用する場合:
momorph init . --ai claude

# GitHub Copilot を使用する場合:
momorph init . --ai copilot

# Cursor を使用する場合:
momorph init . --ai cursor
```

このコマンドは以下を実行します:
- 最新の MoMorph プロジェクトテンプレートをダウンロード
- 設定ファイル（`.claude/`、プロンプトファイル、ワークフロースクリプトなど）を生成
- 選択した AI エージェント用の MCP サーバー接続をセットアップ
- MoMorph VSCode Extension を自動インストール（未インストールの場合）。インストール後、VSCode でリポジトリのソースコードを開き → "MoMorph: Sign In" コマンドを実行 → サイドバーの MoMorph アイコンをクリック → 連携済み Figma ファイルのフレーム一覧が表示されます。

> **注意:** `momorph init` 実行中に `failed to install extension` エラーが表示されても init 自体が成功している場合は、最新の VSIX ファイルをダウンロードし、次のガイドに従って拡張機能を手動でインストールしてください: https://sun-asterisk.enterprise.slack.com/docs/T02CQGZA7MK/F094K2LTV71?focus_section_id=temp:C:USe2e5a076e79fd458c9b713260c

### ステップ 6: MoMorph VSCode Extension でモバイル画面をフィルタリングする

モバイルで実習している場合、Figma Tree をフィルタリングしてモバイル画面デザインのみを表示します:

1. コマンドパレットを開く: `Ctrl+Shift+P`（Windows/Linux）または `Cmd+Shift+P`（macOS）
2. 実行: **MoMorph: Filter Screens**
3. Filter by: **Figma Pages** → **「Mobile」**を選択
4. Filter by: **Spec Status** → **「Done」**を選択

これにより、スペックが完成したモバイル画面のみが表示され、ワークフローがより迅速で集中的になります。

### ステップ 7: コード生成の開始

Figma プロジェクトを使って実践します:

**Figma ファイル:** [SAA 2025 - Internal Live Coding](https://www.figma.com/design/9ypp4enmFmdK3YAFJLIu6C/SAA-2025---Internal-Live-Coding)

#### コンテキストの準備: MoMorph Web での Screen Spec 作成

通常、コード生成を開始する前に MoMorph 上で *Screen Specifications* を準備する必要があります。Screen Specifications は手動で記述するか、MoMorph Web の機能、MoMorph Figma Plugin（Figma Account - Full Seat が必要）、または MoMorph MCP Server に接続した Agent システム（GitHub Copilot、Claude Code）を通じて AI によって生成することができます。

サーバー上の Screen Spec は、コード生成ワークフロー全体における信頼できる唯一の情報源（Source of Truth）です。

> **このハンズオンに関する注意:** 全画面の Screen Spec はすでに MoMorph サーバーに用意されているため、**Screen Spec を新たに作成する必要はなく**、**`/momorph.constitution` から直接コード生成ワークフローを開始できます**。ただし、MoMorph での Screen Spec 作成プロセスについてさらに深く探求することをお勧めします。
> - Screen Spec の作成方法の詳細については、[MoMorph Figma Plugin](https://sun-asterisk.enterprise.slack.com/docs/T02CQGZA7MK/F07S87PSVUN) ドキュメントを参照してください。
> - [MoMorph CLI Commands](https://sun-asterisk.enterprise.slack.com/docs/T02CQGZA7MK/F0A86NC88SK) ドキュメントを参照した後、`momorph.specs` コマンドを使用していくつかの画面の Screen Spec 作成を体験してください。

#### MoMorph でのコード生成ワークフロー

MoMorph サーバーに Screen Spec が用意できたら、AI エージェントのスラッシュコマンドを使用してコードを生成します:

1. **`/momorph.constitution`** — プロジェクトのコーディング規約と規則を初期化します。このコマンドはワークフロー開始時に一度だけ実行し、AI Agent がコード生成全体を通じて遵守すべき開発ルールを確立します。
2. **`/momorph.specify`** — MoMorph MCP 経由でサーバーから Screen Spec と Figma デザイン情報をローカルに取得し、分析して詳細な仕様ファイル（`spec.md`、`design-style.md`）を生成します。各機能・画面の開発は、このコマンドから始めて初期コンテキストを構築します。
3. **`/momorph.reviewspecify`** — Spec 出力のレビューと改善（より良い結果のために 2〜3 回実行を推奨）
4. **`/momorph.plan`** — 詳細な実装計画を生成
5. **`/momorph.reviewplan`** — Plan 出力のレビューと改善（より良い結果のために 2〜3 回実行を推奨）
6. **`/momorph.tasks`** — Plan を実行可能なタスクリストに分割
7. **`/momorph.implement`** — タスクを実行し、コードおよびテストを生成

> **すでに MoMorph に Spec があるのに、なぜ `/momorph.specify` を実行する必要があるのか？**
>
> - **MoMorph サーバー上の Screen Spec** は、人間が記述して MoMorph Web プラットフォームに保存された機能の説明、振る舞い、ビジネスロジックです。信頼できる唯一の情報源（Source of Truth）として機能します。
> - **`/momorph.specify`** はサーバーから Screen Spec を読み込み、**Figma のデザイン情報（レイアウト、スタイル、コンポーネント構造など）と組み合わせ**、リポジトリ内にローカルで保存される詳細な Spec ファイル（`spec.md`、`design-style.md`）に統合します。これらのファイルが、後続ステップ（plan、tasks、implement）で AI エージェントが直接使用するコンテキストになります。
>
> つまり: MoMorph サーバー上の Spec は Sun\* フォーマットの **Screen Spec** であり、人間が読んでレビューすることを目的に記述されています。一方、`/momorph.specify` の出力は複数のソースから統合された **実装 Spec** であり、AI Agent が正確にコードを生成できるよう**処理・エンリッチされたコンテキスト**です。

#### 各コマンドのサンプルプロンプト

**1. `/momorph.constitution`** — プロジェクトで遵守すべき開発ルールを作成:

```
/momorph.constitution クリーンなコードを記述し、ソースコードを明確かつ簡潔に整理してください。選択した技術スタックと Supabase のベストプラクティスを適用してください。アプリケーションはプラットフォームに適した UI パターンとガイドライン（Android は Material Design、iOS は Human Interface Guidelines、Web はレスポンシブウェブデザイン）に準拠してください。また、OWASP のセキュアコーディング標準に準拠してください。
```

**2. `/momorph.specify`** — ローカル Spec の作成と Figma デザイン情報の統合:

```
/momorph.specify 以下のログイン画面の Spec を作成してください:
https://momorph.ai/files/Z9KFZ0aAoOfkVEIPuwwkZl/frames/662:14387
```

**3. `/momorph.reviewspecify`** — 生成された Spec のレビュー:

```
/momorph.reviewspecify 以下のログイン画面の Spec をレビューしてください:
https://momorph.ai/files/Z9KFZ0aAoOfkVEIPuwwkZl/frames/662:14387
```

> より徹底したレビューのために、このコマンドは 2〜3 回実行することを推奨します。

**4. `/momorph.plan`** — 実装計画の作成:

```
/momorph.plan Supabase Auth を使用して、ログイン画面の開発計画を作成してください:
https://momorph.ai/files/Z9KFZ0aAoOfkVEIPuwwkZl/frames/662:14387
```

**5. `/momorph.reviewplan`** — 生成された Plan のレビュー:

```
/momorph.reviewplan ログイン画面の Plan をレビューしてください:
https://momorph.ai/files/Z9KFZ0aAoOfkVEIPuwwkZl/frames/662:14387
```

> より徹底したレビューのために、このコマンドは 2〜3 回実行することを推奨します。

**6. `/momorph.tasks`** — Plan をタスクリストに分割:

```
/momorph.tasks ログイン画面の開発タスクを分割してください:
https://momorph.ai/files/Z9KFZ0aAoOfkVEIPuwwkZl/frames/662:14387
```

**7. `/momorph.implement`** — タスクを実行し、コードを生成:

```
/momorph.implement ログイン画面の開発を進めてください:
https://momorph.ai/files/Z9KFZ0aAoOfkVEIPuwwkZl/frames/662:14387
```

**8. 全タスク実装後のバグ修正:**

バグ修正には引き続き `/momorph.implement` コマンドの使用を推奨します:
```
/momorph.implement フッターのフォントが間違っているバグを修正するタスクを追加してください。すべてのアイテムのフォントがデザイン通りになっているか確認してください。
```

### ステップ 8: プロジェクトの実行

プラットフォームに応じた適切なコマンドでプロジェクトを実行します:

```sh
# Supabase ローカル（全プラットフォーム共通）:
npx supabase start    # Supabase をローカルで起動
npx supabase stop     # Supabase をローカルで停止
```

```sh
# Web (Next.js):
yarn dev              # または npm run dev

# Android:
# Android Studio から実行 (Shift+F10)

# iOS:
# Xcode から実行 (Cmd+R)

# React Native:
npx expo start        # または npx react-native run-android / run-ios
```

## 参考資料

- [MoMorph CLI Documentation](https://sun-asterisk.enterprise.slack.com/docs/T02CQGZA7MK/F0A86NC88SK)
- [MoMorph MCP Server](https://sun-asterisk.enterprise.slack.com/docs/T02CQGZA7MK/F0A9HULD5D0)
- [MoMorph VSCode Extension](https://sun-asterisk.enterprise.slack.com/docs/T02CQGZA7MK/F094K2LTV71)
- [MoMorph Web](https://sun-asterisk.enterprise.slack.com/docs/T02CQGZA7MK/F092SAQBXR8)
- [MoMorph Figma Plugin](https://sun-asterisk.enterprise.slack.com/docs/T02CQGZA7MK/F07S87PSVUN)
