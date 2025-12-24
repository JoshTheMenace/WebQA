# WebQA

**Autonomous browser testing for Claude Code** — Write tests in natural language, execute them via headless Playwright, and get visual feedback.

<p align="center">
  <a href="https://youtu.be/driWx0NBzS8">
    <img src="https://img.youtube.com/vi/driWx0NBzS8/maxresdefault.jpg" alt="Watch the demo" width="600">
  </a>
  <br>
  <a href="https://youtu.be/driWx0NBzS8"><b>▶ Watch the Demo</b></a>
</p>

---

## Features

- **Natural Language Testing** — Describe tests in plain English; Claude generates the DSL
- **Video Recording** — Every test session is recorded as a `.webm` file
- **Screenshots** — Capture full pages or focused elements with padding
- **Self-Correcting** — Claude learns from failures and retries with adjusted selectors

---

## Quick Start

```bash
# Clone the repo
git clone https://github.com/JoshTheMenace/WebQA.git
cd WebQA

# Install dependencies (includes Playwright + Chromium)
npm install

# Build
npm run build

# Start Claude Code with the plugin
claude --plugin-dir /path/to/WebQA
```

Verify it's loaded by typing `/mcp` — you should see `webqa` with the `run_browser_test` tool.

For more on plugins, see the [Claude Code plugin docs](https://code.claude.com/docs/en/plugins).

---

## Usage

Just describe what you want to test:

> "Test the login form — enter invalid credentials and verify the error message appears"

Claude will read your code, generate the test steps, execute them, and report results with video and screenshots.

---

## DSL Reference

| Action | Params | Description |
|--------|--------|-------------|
| `goto` | `url` | Navigate to URL |
| `click` | `selector` | Click element |
| `type` | `selector`, `text` | Type into input |
| `wait` | `duration` | Wait (ms) |
| `wait_for` | `selector`, `timeout?` | Wait for element |
| `screenshot` | `name` | Full page screenshot |
| `screenshot_element` | `selector`, `name`, `padding?` | Element screenshot |
| `assert_text` | `selector`, `text` | Assert text content |
| `assert_visible` | `selector` | Assert visibility |
| `hover` | `selector` | Hover element |
| `select` | `selector`, `value` | Select dropdown |
| `press` | `key` | Press key |

---

### Planned
-  **Gemini Vision Integration** — Analyze video recordings for visual bugs
-  **Test Report Generation** — HTML reports with embedded media
-  **Parallel Execution** — Run multiple tests simultaneously

## License

MIT
