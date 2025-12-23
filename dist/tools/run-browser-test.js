import { PlaywrightInterpreter } from '../interpreter/playwright-interpreter.js';
import path from 'path';
// Validate that a step has the required properties for its action type
function validateStep(step, index) {
    if (typeof step !== 'object' || step === null) {
        throw new Error(`Step ${index}: must be an object`);
    }
    const s = step;
    if (typeof s.action !== 'string') {
        throw new Error(`Step ${index}: missing or invalid 'action' property`);
    }
    switch (s.action) {
        case 'goto':
            if (typeof s.url !== 'string') {
                throw new Error(`Step ${index} (goto): missing 'url' property`);
            }
            return { action: 'goto', url: s.url };
        case 'click':
            if (typeof s.selector !== 'string') {
                throw new Error(`Step ${index} (click): missing 'selector' property`);
            }
            return { action: 'click', selector: s.selector };
        case 'type':
            if (typeof s.selector !== 'string') {
                throw new Error(`Step ${index} (type): missing 'selector' property`);
            }
            if (typeof s.text !== 'string') {
                throw new Error(`Step ${index} (type): missing 'text' property`);
            }
            return { action: 'type', selector: s.selector, text: s.text };
        case 'wait_for':
            if (typeof s.selector !== 'string') {
                throw new Error(`Step ${index} (wait_for): missing 'selector' property`);
            }
            return {
                action: 'wait_for',
                selector: s.selector,
                timeout: typeof s.timeout === 'number' ? s.timeout : undefined,
            };
        case 'screenshot':
            if (typeof s.name !== 'string') {
                throw new Error(`Step ${index} (screenshot): missing 'name' property`);
            }
            return { action: 'screenshot', name: s.name };
        case 'screenshot_element':
            if (typeof s.selector !== 'string') {
                throw new Error(`Step ${index} (screenshot_element): missing 'selector' property`);
            }
            if (typeof s.name !== 'string') {
                throw new Error(`Step ${index} (screenshot_element): missing 'name' property`);
            }
            return {
                action: 'screenshot_element',
                selector: s.selector,
                name: s.name,
                padding: typeof s.padding === 'number' ? s.padding : undefined,
            };
        case 'assert_text':
            if (typeof s.selector !== 'string') {
                throw new Error(`Step ${index} (assert_text): missing 'selector' property`);
            }
            if (typeof s.text !== 'string') {
                throw new Error(`Step ${index} (assert_text): missing 'text' property`);
            }
            return { action: 'assert_text', selector: s.selector, text: s.text };
        case 'assert_visible':
            if (typeof s.selector !== 'string') {
                throw new Error(`Step ${index} (assert_visible): missing 'selector' property`);
            }
            return { action: 'assert_visible', selector: s.selector };
        case 'hover':
            if (typeof s.selector !== 'string') {
                throw new Error(`Step ${index} (hover): missing 'selector' property`);
            }
            return { action: 'hover', selector: s.selector };
        case 'select':
            if (typeof s.selector !== 'string') {
                throw new Error(`Step ${index} (select): missing 'selector' property`);
            }
            if (typeof s.value !== 'string') {
                throw new Error(`Step ${index} (select): missing 'value' property`);
            }
            return { action: 'select', selector: s.selector, value: s.value };
        case 'press':
            if (typeof s.key !== 'string') {
                throw new Error(`Step ${index} (press): missing 'key' property`);
            }
            return { action: 'press', key: s.key };
        case 'wait':
            if (typeof s.duration !== 'number') {
                throw new Error(`Step ${index} (wait): missing 'duration' property (milliseconds)`);
            }
            return { action: 'wait', duration: s.duration };
        default:
            throw new Error(`Step ${index}: unknown action '${s.action}'`);
    }
}
// Validate the test definition input
function validateTestDefinition(input) {
    if (typeof input !== 'object' || input === null) {
        throw new Error('Input must be an object');
    }
    const obj = input;
    if (typeof obj.test_name !== 'string' || obj.test_name.trim() === '') {
        throw new Error("Missing or invalid 'test_name' property");
    }
    if (!Array.isArray(obj.steps)) {
        throw new Error("Missing or invalid 'steps' property (must be an array)");
    }
    if (obj.steps.length === 0) {
        throw new Error("'steps' array cannot be empty");
    }
    const validatedSteps = obj.steps.map((step, index) => validateStep(step, index));
    return {
        test_name: obj.test_name,
        steps: validatedSteps,
    };
}
export async function runBrowserTest(testName, steps, recordingsDir) {
    // Validate input
    const definition = validateTestDefinition({
        test_name: testName,
        steps: steps,
    });
    // Determine recordings directory
    const baseDir = recordingsDir ?? path.join(process.cwd(), 'recordings');
    // Create interpreter and execute test
    const interpreter = new PlaywrightInterpreter(baseDir);
    return interpreter.executeTest(definition);
}
// Tool input schema for MCP
export const runBrowserTestSchema = {
    type: 'object',
    properties: {
        test_name: {
            type: 'string',
            description: 'Name for this test run (used for video file naming)',
        },
        steps: {
            type: 'array',
            description: 'Array of test steps in JSON DSL format',
            items: {
                type: 'object',
                properties: {
                    action: {
                        type: 'string',
                        enum: [
                            'goto',
                            'click',
                            'type',
                            'wait_for',
                            'wait',
                            'screenshot',
                            'screenshot_element',
                            'assert_text',
                            'assert_visible',
                            'hover',
                            'select',
                            'press',
                        ],
                        description: 'The action to perform',
                    },
                    url: { type: 'string', description: 'URL to navigate to (for goto action)' },
                    selector: { type: 'string', description: 'CSS selector for the element' },
                    text: { type: 'string', description: 'Text to type or assert' },
                    name: { type: 'string', description: 'Name for screenshot file' },
                    value: { type: 'string', description: 'Value to select (for select action)' },
                    key: { type: 'string', description: 'Key to press (for press action)' },
                    timeout: { type: 'number', description: 'Timeout in milliseconds (for wait_for)' },
                    duration: { type: 'number', description: 'Duration in milliseconds (for wait action)' },
                    padding: { type: 'number', description: 'Padding in pixels around element (for screenshot_element, default: 10)' },
                },
                required: ['action'],
            },
        },
    },
    required: ['test_name', 'steps'],
};
//# sourceMappingURL=run-browser-test.js.map