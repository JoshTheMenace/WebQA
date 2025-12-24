# WebQA

**Autonomous browser testing for Claude Code** — Write tests in natural language, execute them via Playwright, and get visual feedback.

[![Watch the demo](https://img.youtube.com/vi/driWx0NBzS8/maxresdefault.jpg)](https://youtu.be/driWx0NBzS8)

WebQA is a Claude Code plugin that enables AI-driven browser testing through a custom JSON DSL. Describe what you want to test, and Claude will generate and execute the test automatically, recording video and capturing screenshots along the way.

---

## Features

- **Natural Language Testing** — Describe tests in plain English; Claude generates the DSL
- **Video Recording** — Every test session is recorded as a `.webm` file
- **Element Screenshots** — Capture full pages or focused element screenshots with padding
- **Self-Correcting** — Claude learns from failures and retries with adjusted selectors
- **10+ DSL Actions** — Navigate, click, type, assert, wait, and more
- **Local & Remote** — Test local dev servers, file URLs, or live websites

---

## Installation

### Prerequisites

- Node.js 18+
- Claude Code CLI

### Setup

```bash
# Clone or navigate to the project
cd WebQA

# Install dependencies (automatically installs Playwright + Chromium)
npm install

# Build the TypeScript
npm run build
```

### Load the Plugin

```bash
# Start Claude Code with the plugin
claude --plugin-dir /path/to/WebQA
```

Verify the plugin is loaded:
```
/mcp
```
You should see `webqa` with the `run_browser_test` tool.

---

## Usage

### Ask Claude to Write Tests

Simply describe what you want to test:

> "Test the login form — enter invalid credentials and verify the error message appears"

Claude will:
1. Read your source code to understand the page structure
2. Generate the appropriate DSL steps
3. Execute the test via the MCP tool
4. Report results with video and screenshots

### Manual DSL Execution

You can also write tests directly:

```json
{
  "test_name": "login_error_flow",
  "steps": [
    { "action": "goto", "url": "http://localhost:3000/login" },
    { "action": "wait", "duration": 1000 },
    { "action": "type", "selector": "#email", "text": "invalid@test.com" },
    { "action": "type", "selector": "#password", "text": "wrongpassword" },
    { "action": "click", "selector": "button[type='submit']" },
    { "action": "wait_for", "selector": ".error-message" },
    { "action": "assert_text", "selector": ".error-message", "text": "Invalid credentials" },
    { "action": "screenshot_element", "selector": ".error-message", "name": "login_error", "padding": 20 }
  ]
}
```

---

## DSL Reference

### Available Actions

| Action | Required Params | Optional Params | Description |
|--------|-----------------|-----------------|-------------|
| `goto` | `url` | | Navigate to a URL |
| `click` | `selector` | | Click an element |
| `type` | `selector`, `text` | | Type text into an input |
| `wait_for` | `selector` | `timeout` (ms) | Wait for element to appear |
| `wait` | `duration` (ms) | | Wait for a fixed duration |
| `screenshot` | `name` | | Capture full page screenshot |
| `screenshot_element` | `selector`, `name` | `padding` (px) | Capture element with padding |
| `assert_text` | `selector`, `text` | | Assert element contains text |
| `assert_visible` | `selector` | | Assert element is visible |
| `hover` | `selector` | | Hover over an element |
| `select` | `selector`, `value` | | Select dropdown option |
| `press` | `key` | | Press a keyboard key |

### Selector Tips

```css
/* IDs (preferred) */
#submit-btn

/* Data attributes (recommended for testing) */
[data-testid="login-form"]

/* Classes */
.btn-primary

/* Attributes */
input[name="email"]
button[type="submit"]

/* Combinations */
form#login .submit-button
```

### Example: Full Test Flow

```json
{
  "test_name": "user_signup_complete",
  "steps": [
    { "action": "goto", "url": "http://localhost:3000/signup" },
    { "action": "wait", "duration": 1000 },

    { "action": "type", "selector": "#username", "text": "newuser123" },
    { "action": "type", "selector": "#email", "text": "user@example.com" },
    { "action": "type", "selector": "#password", "text": "SecurePass123!" },
    { "action": "select", "selector": "#plan", "value": "pro" },
    { "action": "click", "selector": "#terms-checkbox" },
    { "action": "screenshot", "name": "form_completed" },

    { "action": "click", "selector": "button[type='submit']" },
    { "action": "wait_for", "selector": ".welcome-message", "timeout": 5000 },
    { "action": "assert_text", "selector": ".welcome-message", "text": "Welcome" },
    { "action": "screenshot_element", "selector": ".welcome-message", "name": "success", "padding": 30 }
  ]
}
```

---

## Output

### Test Results

Each test returns:

```json
{
  "test_name": "user_signup_complete",
  "success": true,
  "steps_executed": 12,
  "steps_total": 12,
  "step_results": [
    { "step_index": 0, "action": "goto", "success": true, "duration_ms": 1250 },
    { "step_index": 1, "action": "wait", "success": true, "duration_ms": 1000 }
    // ...
  ],
  "video_path": "recordings/user_signup_complete_2025-01-15T10-30-00/video.webm",
  "screenshots": [
    "recordings/user_signup_complete_2025-01-15T10-30-00/form_completed.png",
    "recordings/user_signup_complete_2025-01-15T10-30-00/success.png"
  ],
  "total_duration_ms": 8500
}
```

### File Structure

```
recordings/
└── {test_name}_{timestamp}/
    ├── {screenshot_name}.png
    ├── {screenshot_name}.png
    └── {video_hash}.webm
```

---

## Project Structure

```
WebQA/
├── .claude-plugin/
│   └── plugin.json          # Claude Code plugin manifest
├── src/
│   ├── index.ts             # MCP server entry point
│   ├── types/
│   │   └── dsl.ts           # TypeScript type definitions
│   ├── interpreter/
│   │   └── playwright-interpreter.ts  # DSL → Playwright execution
│   └── tools/
│       └── run-browser-test.ts        # MCP tool handler
├── skills/
│   └── write-test/
│       └── SKILL.md         # DSL reference for Claude
├── tests/                   # Example test files
├── recordings/              # Test output directory
├── dist/                    # Compiled JavaScript
├── package.json
└── tsconfig.json
```

---

## Configuration

### Plugin Manifest

`.claude-plugin/plugin.json`:

```json
{
  "name": "webqa",
  "version": "1.0.0",
  "description": "Autonomous browser testing with Playwright",
  "skills": "./skills/",
  "mcpServers": {
    "webqa": {
      "command": "node",
      "args": ["${CLAUDE_PLUGIN_ROOT}/dist/index.js"],
      "cwd": "${CLAUDE_PLUGIN_ROOT}"
    }
  }
}
```

### Video Settings

Videos are recorded at **1280x720** resolution. To modify, edit `playwright-interpreter.ts`:

```typescript
context = await browser.newContext({
  recordVideo: {
    dir: testVideoDir,
    size: { width: 1280, height: 720 },  // Adjust here
  },
});
```

---

## Development

### Build

```bash
npm run build
```

### Watch Mode (for development)

```bash
npx tsc --watch
```

### Adding New Actions

1. Add type definition in `src/types/dsl.ts`
2. Add to the `TestStep` union type
3. Implement handler in `src/interpreter/playwright-interpreter.ts`
4. Add validation in `src/tools/run-browser-test.ts`
5. Update the schema enum in `run-browser-test.ts`
6. Document in `skills/write-test/SKILL.md`

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Claude Code                          │
│   (Reads source code, generates DSL, interprets results)    │
└─────────────────────────┬───────────────────────────────────┘
                          │ MCP Protocol (stdio)
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                     WebQA MCP Server                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              run_browser_test Tool                   │   │
│  │   • Validates JSON DSL                              │   │
│  │   • Invokes Playwright Interpreter                  │   │
│  │   • Returns results + paths                         │   │
│  └─────────────────────────┬───────────────────────────┘   │
│                            ▼                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │            Playwright Interpreter                    │   │
│  │   • Launches Chromium                               │   │
│  │   • Executes DSL steps                              │   │
│  │   • Records video                                   │   │
│  │   • Captures screenshots                            │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
              ┌───────────────────┐
              │  Browser + Video  │
              │   ./recordings/   │
              └───────────────────┘
```

---

## Roadmap

### Phase 1 ✅ (Current)
- [x] MCP Server with Playwright
- [x] JSON DSL with 12 actions
- [x] Video recording
- [x] Full page screenshots
- [x] Element screenshots with padding
- [x] Claude Code plugin integration
- [x] Skill documentation

### Phase 2 (Planned)
- [ ] **Gemini Vision Integration** — Analyze video recordings for visual bugs
- [ ] **Visual Regression** — Compare screenshots across runs
- [ ] **Test Report Generation** — HTML reports with embedded media
- [ ] **Parallel Execution** — Run multiple tests simultaneously

### Phase 3 (Future)
- [ ] **Self-Healing Selectors** — Auto-update selectors when DOM changes
- [ ] **Network Interception** — Mock API responses
- [ ] **Performance Metrics** — Core Web Vitals capture
- [ ] **Multi-Browser Support** — Firefox, WebKit

---

## License

MIT

---

## Contributing

Contributions welcome! Please open an issue or PR.

---

<p align="center">
  <b>WebQA</b> — Let AI handle your browser testing
</p>
