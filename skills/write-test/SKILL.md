---
description: Write and execute browser tests using the WebQA JSON DSL
---

# Write Browser Test

You are writing browser tests using the WebQA JSON DSL. Use the `run_browser_test` MCP tool to execute tests.

## DSL Schema

Each test has a `test_name` and array of `steps`. Each step has an `action` and action-specific parameters.

### Available Actions

| Action | Required Params | Optional Params | Description |
|--------|-----------------|-----------------|-------------|
| `goto` | `url` | | Navigate to a URL |
| `click` | `selector` | | Click an element |
| `type` | `selector`, `text` | | Type text into an input field |
| `wait_for` | `selector` | `timeout` (ms) | Wait for element to appear |
| `wait` | `duration` (ms) | | Wait for a fixed time |
| `screenshot` | `name` | | Capture full page screenshot |
| `screenshot_element` | `selector`, `name` | `padding` (px, default: 10) | Capture element with padding |
| `assert_text` | `selector`, `text` | | Assert element contains text |
| `assert_visible` | `selector` | | Assert element is visible |
| `hover` | `selector` | | Hover over an element |
| `select` | `selector`, `value` | | Select a dropdown option |
| `press` | `key` | | Press a keyboard key |

### Step Examples

```json
{ "action": "goto", "url": "http://localhost:3000" }
{ "action": "click", "selector": "#submit-btn" }
{ "action": "type", "selector": "#email", "text": "user@example.com" }
{ "action": "wait_for", "selector": ".success-message", "timeout": 5000 }
{ "action": "wait", "duration": 2000 }
{ "action": "screenshot", "name": "final_state" }
{ "action": "screenshot_element", "selector": ".toast", "name": "toast_message", "padding": 20 }
{ "action": "assert_text", "selector": "h1", "text": "Welcome" }
{ "action": "assert_visible", "selector": ".modal" }
{ "action": "hover", "selector": ".dropdown-trigger" }
{ "action": "select", "selector": "#country", "value": "us" }
{ "action": "press", "key": "Enter" }
```

### Selector Tips

- Use IDs when available: `#submit-btn`
- Use data attributes: `[data-testid="login"]`
- Use classes: `.btn-primary`
- Combine selectors: `form#login button[type="submit"]`
- Use attribute selectors: `input[name="email"]`

### Complete Test Example

```json
{
  "test_name": "user_signup_flow",
  "steps": [
    { "action": "goto", "url": "http://localhost:3000/signup" },
    { "action": "wait", "duration": 1000 },
    { "action": "type", "selector": "#email", "text": "newuser@test.com" },
    { "action": "type", "selector": "#password", "text": "SecurePass123" },
    { "action": "click", "selector": "#terms-checkbox" },
    { "action": "screenshot", "name": "form_filled" },
    { "action": "click", "selector": "button[type='submit']" },
    { "action": "wait_for", "selector": ".welcome-message" },
    { "action": "assert_text", "selector": ".welcome-message", "text": "Welcome" },
    { "action": "screenshot", "name": "signup_complete" }
  ]
}
```

## Workflow

1. **Read the source code** of the page being tested to understand available selectors
2. **Plan the test steps** based on what the user wants to verify
3. **Use `wait`** after `goto` to let pages with animations load (1-2 seconds)
4. **Use `wait_for`** before interacting with dynamically loaded elements
5. **Take screenshots** at key points to capture state
6. **Use assertions** to verify expected outcomes

## Calling the Tool

Use the `run_browser_test` MCP tool:

```
test_name: "descriptive_test_name"
steps: [array of step objects]
```

The tool returns:
- `success`: boolean
- `steps_executed`: number of steps run
- `step_results`: array with timing and pass/fail per step
- `video_path`: path to recorded .webm video
- `screenshots`: array of screenshot paths
- `error`: error message if failed
