# Agentic Coding Hands-on

[![Vietnamese](https://img.shields.io/badge/Vietnamese-green.svg)](https://github.com/sun-asterisk-internal/agentic-coding-hands-on/blob/main/README.md) [![Japanese](https://img.shields.io/badge/Japanese-yellow.svg)](https://github.com/sun-asterisk-internal/agentic-coding-hands-on/blob/main/README_ja.md) [![English](https://img.shields.io/badge/English-blue.svg)](https://github.com/sun-asterisk-internal/agentic-coding-hands-on/blob/main/README_en.md)

Repository phục vụ khóa thực hành **Agentic Coding** nội bộ Sun\*. Học viên sẽ sử dụng **MoMorph + Claude Code** để generate code từ Figma design. Ngoài Claude Code, bạn cũng có thể sử dụng các AI coding agent khác như **Copilot**, **Gemini**, **Windsurf**,... với các bước và cách dùng tương tự. Trong bài thực hành này, chúng tôi giả định bạn dùng **Claude Code**.

## Branches

Repository có các branch sau:

- [**`main`**](https://github.com/sun-asterisk-internal/agentic-coding-hands-on/tree/main) — Tài liệu hướng dẫn và cấu hình Supabase. Học viên clone về, tự khởi tạo project (Next.js, Android, React Native, iOS...) và làm việc trên nhánh này.
- [**`web-sample`**](https://github.com/sun-asterisk-internal/agentic-coding-hands-on/tree/web-sample) — Mẫu tham khảo cho Web (Next.js). Có sẵn các thư mục `.claude`, `.vscode`, `.momorph` chứa specs mẫu và code đã generate cho một số màn hình. Dùng để xem context đầu vào và kết quả mà MoMorph sinh ra trông như thế nào.

## Prerequisites

- Git
- Docker (để chạy Supabase local)
- [MoMorph CLI](https://github.com/momorph/cli)
- [Claude Code](https://docs.anthropic.com/en/docs/claude-code)
- [VSCode](https://code.visualstudio.com/) + MoMorph Extension — dùng để xem Figma frame list, copy prompt nhanh. Đặc biệt hữu ích cho mobile dev khi IDE chính (Android Studio, Xcode) không hỗ trợ MoMorph Extension.

### Suggested Tech Stack

Bạn không bị giới hạn về tech stack — có thể tự do sử dụng bất kỳ framework hay ngôn ngữ nào phù hợp. Tuy nhiên, chúng tôi khuyến nghị các stack sau để có trải nghiệm tốt nhất với MoMorph:

- **Backend (chung):** [Supabase](https://supabase.com/) — Backend-as-a-Service (BaaS) cung cấp database, authentication và real-time features
- **Web:** Next.js + Cloudflare Workers + TailwindCSS + Supabase
- **Android:** Kotlin + Jetpack Compose + Supabase
- **iOS:** Swift + SwiftUI + Supabase
- **React Native:** React Native + Expo + Supabase

## Hướng dẫn thực hành

### Bước 0: Thực hiện GitHub SSO

1. Truy cập https://github.com/orgs/sun-asterisk-internal/sso
2. Hoàn tất quà trình đăng nhập SSO để tài khoản GitHub của bạn được tham gia vào organization `sun-asterisk-internal`
3. Gửi GitHub username của bạn cho `@nguyen.huu.kim` hoặc `@le.minh.hoang` để được thêm vào danh sách thành viên của repository `sun-asterisk-internal/agentic-coding-hands-on`.
4. Chờ xác nhận xử lý hoàn tất rồi thực hiện bước tiếp theo

### Bước 1: Khởi tạo project của bạn

Tạo project mới bằng công cụ phù hợp với platform bạn chọn:

```sh
# Web (Next.js):
npx create-next-app@latest my-app
cd my-app

# Android:
# Mở Android Studio → New Project → tạo project mới

# React Native (Expo):
npx create-expo-app my-app
cd my-app

# iOS (Swift):
# Mở Xcode → Create New Project → tạo project mới
```

Sau khi khởi tạo xong, thiết lập git remote trỏ về repository của bài thực hành:

```sh
git init    # nếu project chưa có git
git remote add origin https://github.com/sun-asterisk-internal/agentic-coding-hands-on.git
```

> **Tại sao cần đặt remote?** MoMorph VSCode Extension cần nhận diện repository để hiển thị Figma file đã liên kết. Đặt remote trỏ về `sun-asterisk-internal/agentic-coding-hands-on` giúp MoMorph hoạt động chính xác.

### Bước 2: Đăng nhập MoMorph Web và kết nối tài khoản GitHub

1. Truy cập [MoMorph Web](https://momorph.ai/) và đăng nhập bằng tài khoản Figma (dùng email `*@sun-asterisk.com`).
2. Điền link file Figma sau để tiếp tục: https://www.figma.com/design/9ypp4enmFmdK3YAFJLIu6C/SAA-2025---Internal-Live-Coding
3. Vào **Settings → GitHub → Connect** để kết nối tài khoản GitHub của bạn với MoMorph và đặc biệt đảm bảo đã cấp quyền truy cập vào GitHub repository `sun-asterisk-internal/agentic-coding-hands-on` tại bước này.

> **Lưu ý:** Repository này đã được connect sẵn với MoMorph và Figma project trên hệ thống. Bạn chỉ cần kết nối tài khoản GitHub cá nhân với MoMorph là có thể sử dụng.

### Bước 3: Cài đặt MoMorph CLI

Chọn một trong các cách sau:

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

Xác nhận cài đặt thành công:

```sh
momorph version
```

### Bước 4: Đăng nhập MoMorph CLI

```sh
momorph login
```

CLI sẽ hiển thị một mã xác thực và link đăng nhập. Nhấn `Enter` để mở link trên trình duyệt, sau đó nhập mã để hoàn tất xác thực.

Kiểm tra thông tin tài khoản:

```sh
momorph whoami
```

### Bước 5: Khởi tạo MoMorph project

Chạy lệnh init để sinh ra các thư mục cấu hình (`.claude`, `.vscode` prompts, kết nối MCP server...):

```sh
# Nếu dùng Claude Code:
momorph init . --ai claude

# Nếu dùng GitHub Copilot:
momorph init . --ai copilot

# Nếu dùng Cursor:
momorph init . --ai cursor
```

Lệnh này sẽ:
- Tải template MoMorph project mới nhất
- Sinh các file cấu hình (`.claude/`, prompt files, workflow scripts...)
- Thiết lập kết nối MCP server cho AI agent đã chọn
- Tự động cài đặt MoMorph VSCode Extension (nếu chưa cài). Sau khi cài đặt, mở source code repo trên VSCode → chạy command "MoMorph: Sign In" → click vào biểu tượng MoMorph trên sidebar → bạn sẽ thấy danh sách frame list của Figma file đã liên kết.

> **Lưu ý:** Nếu trong quá trình `momorph init` bạn gặp lỗi `failed to install extension` nhưng init vẫn hoàn tất, hãy tải file VSIX mới nhất và cài extension thủ công theo hướng dẫn tại đây: https://sun-asterisk.enterprise.slack.com/docs/T02CQGZA7MK/F094K2LTV71?focus_section_id=temp:C:USe2e5a076e79fd458c9b713260c

### Bước 6: Lọc màn hình mobile trên MoMorph VSCode Extension

Nếu bạn đang thực hành với mobile, hãy lọc Figma Tree để chỉ hiển thị các thiết kế màn hình mobile:

1. Mở Command Palette: `Ctrl+Shift+P` (Windows/Linux) hoặc `Cmd+Shift+P` (macOS)
2. Chạy: **MoMorph: Filter Screens**
3. Filter by: **Figma Pages** → Chọn **"Mobile"**
4. Filter by: **Spec Status** → Chọn **"Done"**

Thao tác này giúp Figma Tree chỉ hiển thị các màn hình mobile đã hoàn thành spec, giúp bạn thao tác nhanh gọn hơn.

### Bước 7: Bắt đầu generate code

Sử dụng Figma project để thực hành:

**Figma file:** [SAA 2025 - Internal Live Coding](https://www.figma.com/design/9ypp4enmFmdK3YAFJLIu6C/SAA-2025---Internal-Live-Coding)

#### Chuẩn bị context: Viết Screen Spec trên MoMorph Web

Thông thường, trước khi bắt đầu generate code, ta cần chuẩn bị đầy đủ *Screen Specifications* trên MoMorph. Nội dung Screen Specifications này có thể được viết manual, hoặc được generate ra bởi AI thông qua các chức năng trên MoMorph Web, MoMorph Figma Plugin (yêu cầu Figma Account - Full Seat), cũng như thông qua các hệ thống Agent (GitHub Copilot, Claude Code) khi kết nối với MoMorph MCP Server.

Screen spec trên server chính là nguồn thông tin gốc (source of truth) cho toàn bộ quy trình generate code phía sau.

> **Lưu ý cho bài thực hành này:** Screen spec của các màn hình đã được chuẩn bị sẵn trên MoMorph server rồi, nên các bạn **không cần tạo lại screen spec** nữa mà có thể **bắt tay vào quy trình generate code ngay từ bước `/momorph.constitution`**. Tuy nhiên các bạn vẫn được khuyến khích tự tìm hiểu sâu hơn về quy trình tạo Screen Spec với MoMorph.
> - Vui lòng tham khảo thêm tài liệu [MoMorph Figma Plugin](https://sun-asterisk.enterprise.slack.com/docs/T02CQGZA7MK/F07S87PSVUN) để tìm hiểu chi tiết hơn về khâu viết Screen Spec.
> - Vui lòng tham khảo thêm tài liệu về [MoMorph CLI Commands](https://sun-asterisk.enterprise.slack.com/docs/T02CQGZA7MK/F0A86NC88SK) sau đó trải nghiệm việc tạo screen specs cho một vài màn hình với command `momorph.specs`.

#### Quy trình generate code với MoMorph

Sau khi đã có screen spec trên MoMorph server, sử dụng các slash commands trong AI agent để generate code:

1. **`/momorph.constitution`** — Khởi tạo coding standards và conventions cho project. Đây là command hầu như bạn chỉ cần dùng một lần ở đầu quy trình để thiết lập các quy tắc phát triển mà AI Agent cần tuân thủ xuyên suốt quá trình generate code sau này.
2. **`/momorph.specify`** — Kéo screen spec và thông tin design Figma về local thông qua MoMorph MCP, tiến hành phân tích và sinh ra các file đặc tả chi tiết (`spec.md`, `design-style.md`). Với mỗi một chức năng/màn hình, chúng ta sẽ bắt đầu từ command này để tạo context ban đầu.
3. **`/momorph.reviewspecify`** — Review và refine spec output (nên chạy 2–3 lần để kết quả tốt hơn)
4. **`/momorph.plan`** — Tạo implementation plan chi tiết
5. **`/momorph.reviewplan`** — Review và refine plan output (nên chạy 2–3 lần để kết quả tốt hơn)
6. **`/momorph.tasks`** — Chia nhỏ plan thành danh sách task thực thi
7. **`/momorph.implement`** — Thực thi tasks, sinh code cũng như test

> **Tại sao đã có spec trên MoMorph rồi mà vẫn cần chạy `/momorph.specify`?**
>
> - **Screen spec trên MoMorph server** là bản mô tả chức năng, behavior, business logic do con người viết và lưu trên nền tảng MoMorph Web. Nó đóng vai trò nguồn thông tin gốc (source of truth).
> - **`/momorph.specify`** sẽ đọc screen spec đó từ server, **kết hợp với thông tin design từ Figma (layout, style, component structure...)**, rồi tổng hợp lại thành các file spec chi tiết, lưu cục bộ ngay trong repo (`spec.md`, `design-style.md`). Các file này chính là context trực tiếp mà AI agent sử dụng trong các bước tiếp theo (plan, tasks, implement).
>
> Nói cách khác: spec trên MoMorph server là **screen spec** theo format của Sun\*, được viết ra để hướng đến con người đọc hiểu và review. Còn output của `/momorph.specify` là một bản **implementation spec** được tổng hợp từ nhiều nguồn, là **context đã được xử lý và làm giàu** để AI Agent có thể hiểu và sinh code chính xác.

#### Ví dụ prompt cho từng command

**1. `/momorph.constitution`** — Tạo các quy tắc phát triển cần tuân thủ trong project:

```
/momorph.constitution Viết clean code, tổ chức source code rõ ràng, ngắn gọn. Áp dụng các best practices cho tech stack đã chọn và Supabase. Ứng dụng cần tuân theo UI patterns và guidelines phù hợp với platform (Material Design cho Android, Human Interface Guidelines cho iOS, responsive web design cho web). Tuân thủ các tiêu chuẩn bảo mật OWASP secure coding practices.
```

**2. `/momorph.specify`** — Tạo local specs + tổng hợp thông tin về figma design:

```
/momorph.specify Tạo specs cho màn hình Login sau:
https://momorph.ai/files/Z9KFZ0aAoOfkVEIPuwwkZl/frames/662:14387
```

**3. `/momorph.reviewspecify`** — Review spec đã sinh:

```
/momorph.reviewspecify Review specs cho màn hình Login sau:
https://momorph.ai/files/Z9KFZ0aAoOfkVEIPuwwkZl/frames/662:14387
```

> Nên chạy lệnh này 2–3 lần để spec được review kỹ hơn.

**4. `/momorph.plan`** — Tạo implementation plan:

```
/momorph.plan Sử dụng Supabase Auth. Hãy tạo kế hoạch phát triển màn hình Login:
https://momorph.ai/files/Z9KFZ0aAoOfkVEIPuwwkZl/frames/662:14387
```

**5. `/momorph.reviewplan`** — Review plan đã sinh:

```
/momorph.reviewplan Hãy review lại plan của màn hình Login:
https://momorph.ai/files/Z9KFZ0aAoOfkVEIPuwwkZl/frames/662:14387
```

> Nên chạy lệnh này 2–3 lần để plan được review kỹ hơn.

**6. `/momorph.tasks`** — Chia plan thành danh sách tasks:

```
/momorph.tasks Hãy phân chia công việc phát triển màn Login:
https://momorph.ai/files/Z9KFZ0aAoOfkVEIPuwwkZl/frames/662:14387
```

**7. `/momorph.implement`** — Thực thi tasks, sinh code:

```
/momorph.implement Tiến hành phát triển màn Login:
https://momorph.ai/files/Z9KFZ0aAoOfkVEIPuwwkZl/frames/662:14387
```

**8. Fix bug sau khi implement hết các tasks:**

Khuyến nghị tiếp tục sử dụng command `/momorph.implement` để fix bug:
```
/momorph.implement Thêm task fix bug sai font chữ ở footer. Hãy review lại một lượt xem font chữ các các item đã đúng theo design chưa.
```

### Bước 8: Chạy project

Chạy project theo platform bạn đang sử dụng:

```sh
# Supabase local (chung cho tất cả platforms):
npx supabase start    # Khởi động Supabase local
npx supabase stop     # Dừng Supabase local
```

```sh
# Web (Next.js):
yarn dev              # hoặc npm run dev

# Android:
# Run từ Android Studio (Shift+F10)

# iOS:
# Run từ Xcode (Cmd+R)

# React Native:
npx expo start        # hoặc npx react-native run-android / run-ios
```

## Tài liệu tham khảo

- [MoMorph CLI Documentation](https://sun-asterisk.enterprise.slack.com/docs/T02CQGZA7MK/F0A86NC88SK)
- [MoMorph MCP Server](https://sun-asterisk.enterprise.slack.com/docs/T02CQGZA7MK/F0A9HULD5D0)
- [MoMorph VSCode Extension](https://sun-asterisk.enterprise.slack.com/docs/T02CQGZA7MK/F094K2LTV71)
- [MoMorph Web](https://sun-asterisk.enterprise.slack.com/docs/T02CQGZA7MK/F092SAQBXR8)
- [MoMorph Figma Plugin](https://sun-asterisk.enterprise.slack.com/docs/T02CQGZA7MK/F07S87PSVUN)
