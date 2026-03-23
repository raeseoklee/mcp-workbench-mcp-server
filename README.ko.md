[English](README.md) | **한국어**

# @mcp-workbench/mcp-server

[MCP Workbench](https://github.com/raeseoklee/mcp-workbench)를 위한 에이전트용 MCP 어댑터 — AI 에이전트가 구조화된 도구 호출을 통해 MCP 서버를 검사, 테스트, 검증할 수 있게 합니다.

---

## 개요

`@mcp-workbench/mcp-server`는 [MCP Workbench CLI](https://github.com/raeseoklee/mcp-workbench)를 MCP 서버로 래핑하여, inspect, generate, run, explain 기능을 AI 에이전트가 직접 호출할 수 있는 구조화된 도구로 노출합니다. CLI를 서브프로세스로 실행하고 출력을 타입이 지정된 응답으로 파싱합니다.

> **진입점:**
> `@mcp-workbench/cli`는 사람을 위한 실행기입니다.
> `@mcp-workbench/mcp-server`는 에이전트를 위한 MCP 어댑터입니다.
> 둘 다 동일한 코어 엔진을 사용합니다.

---

## 사전 요구사항

- **Node.js >= 20**
- **MCP Workbench CLI**가 PATH에 설치되어 있어야 합니다:

```bash
# 기본 — 스코프드 패키지
npm install -g @mcp-workbench/cli

# 대안 — 편의 래퍼
npm install -g mcp-workbench-cli
```

또는 `MCP_WORKBENCH_CLI` 환경 변수로 바이너리 경로를 지정하세요.

---

## 설치

```bash
npm install -g @mcp-workbench/mcp-server
```

또는 소스에서 빌드:

```bash
git clone https://github.com/raeseoklee/mcp-workbench-mcp-server.git
cd mcp-workbench-mcp-server
npm install
npm run build
```

---

## 호스트 연결 방법

### Claude Code

```bash
claude mcp add mcp-workbench -- npx -y @mcp-workbench/mcp-server
```

### OpenAI Codex CLI

```bash
codex mcp add mcp-workbench -- npx -y @mcp-workbench/mcp-server
```

또는 `~/.codex/config.toml`에 추가:

```toml
[mcp_servers.mcp-workbench]
command = "npx"
args    = ["-y", "@mcp-workbench/mcp-server"]
enabled = true
```

### Claude Desktop

`claude_desktop_config.json`에 추가:

```json
{
  "mcpServers": {
    "mcp-workbench": {
      "command": "npx",
      "args": ["-y", "@mcp-workbench/mcp-server"]
    }
  }
}
```

### Cursor

`.cursor/mcp.json`에 추가:

```json
{
  "mcpServers": {
    "mcp-workbench": {
      "command": "npx",
      "args": ["-y", "@mcp-workbench/mcp-server"]
    }
  }
}
```

---

## 사용 가능한 도구

### `inspect_server`

MCP 서버에 연결하여 기능, 버전, 지원 기능을 검사합니다.

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `transport` | `"stdio" \| "streamable-http"` | 예 | 트랜스포트 타입 |
| `url` | `string` | 아니오 | 서버 URL (streamable-http 필수) |
| `command` | `string` | 아니오 | 서버 실행 명령 (stdio 필수) |
| `args` | `string \| string[]` | 아니오 | 서버 명령 인수 |
| `headers` | `Record<string, string>` | 아니오 | HTTP 헤더 (예: Authorization) |
| `timeoutMs` | `number` | 아니오 | 타임아웃 (ms, 기본값: 30000) |

### `generate_spec`

서버 기능을 자동 탐지하여 YAML 테스트 스펙을 생성합니다.

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `transport` | `"stdio" \| "streamable-http"` | 예 | 트랜스포트 타입 |
| `url` | `string` | 아니오 | 서버 URL |
| `command` | `string` | 아니오 | 서버 명령 |
| `args` | `string \| string[]` | 아니오 | 서버 인수 |
| `headers` | `Record<string, string>` | 아니오 | HTTP 헤더 |
| `include` | `Array<"tools" \| "resources" \| "prompts">` | 아니오 | 포함할 타입만 지정 |
| `exclude` | `Array<"tools" \| "resources" \| "prompts">` | 아니오 | 제외할 타입 |
| `depth` | `"shallow" \| "deep"` | 아니오 | 탐지 깊이 (shallow = 목록만, deep = 각각 호출) |
| `timeoutMs` | `number` | 아니오 | 타임아웃 (ms) |

### `run_spec`

YAML 테스트 스펙을 MCP 서버에 대해 실행합니다. `specText` (인라인 YAML) 또는 `specPath` (파일 경로) 중 하나를 제공해야 합니다.

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `specText` | `string` | 아니오* | 인라인 YAML 스펙 내용 |
| `specPath` | `string` | 아니오* | YAML 스펙 파일 경로 |
| `timeoutMs` | `number` | 아니오 | 타임아웃 (ms) |

*`specText` 또는 `specPath` 중 하나는 반드시 제공해야 합니다.

### `explain_failure`

테스트 실행 결과를 분석하고 휴리스틱 분류와 실행 가능한 권장 조치로 실패를 설명합니다.

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `runResult` | `RunReport` | 예 | `run_spec`의 구조화된 결과 |

---

## 한계 및 보안 사항

### 보안

- 인증 헤더는 호출별로 전달되며 저장되지 않습니다
- 토큰이나 자격 증명을 저장하지 않습니다
- 토큰은 도구 출력에 표시되지 않습니다
- 서버는 현재 환경으로 `mcp-workbench` CLI를 서브프로세스로 실행합니다
- 임시 디렉토리에 작성된 스펙 파일은 사용 후 정리됩니다

### 한계

- `run_spec`의 `specText`는 내부적으로 임시 파일을 사용합니다
- `run_spec`의 헤더는 기본 서버로 전달되지 않습니다 — 스펙 YAML에 직접 포함해야 합니다
- `explain_failure`는 AI 기반이 아닌 휴리스틱 기반입니다
- `generate_spec` 테스트 수 감지는 정규식 기반입니다
- stdio 트랜스포트만 이 MCP 서버 자체 연결에 지원됩니다
- 테스트 결과 스트리밍 없음 (완료될 때까지 대기)

---

## 국제화

도구 텍스트 요약은 여러 언어를 지원합니다. 구조화된 JSON 출력은 항상 언어 중립적입니다.

| 로케일 | 언어 |
|--------|------|
| `en`   | English (기본값) |
| `ko`   | 한국어 |

환경 변수로 언어를 설정합니다:

```bash
MCP_WORKBENCH_LANG=ko node dist/index.js
```

사용자 대면 텍스트 요약만 번역됩니다. 도구 이름, 스키마 필드, JSON 출력 키는 항상 영어입니다.

---

## 개발

```bash
npm install
npm run build
npm test
```

---

## 라이선스

Apache-2.0
