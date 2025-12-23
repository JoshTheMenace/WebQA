#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, } from '@modelcontextprotocol/sdk/types.js';
import { runBrowserTest, runBrowserTestSchema } from './tools/run-browser-test.js';
// Create the MCP server
const server = new Server({
    name: 'webqa',
    version: '1.0.0',
}, {
    capabilities: {
        tools: {},
    },
});
// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: 'run_browser_test',
                description: 'Execute a browser test using JSON DSL. Launches a Chromium browser, runs the specified test steps, and records a video of the session. Returns detailed results including pass/fail status, step results, and video path.',
                inputSchema: runBrowserTestSchema,
            },
        ],
    };
});
// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    if (name === 'run_browser_test') {
        try {
            const testName = args?.test_name;
            const steps = args?.steps;
            if (!testName || !steps) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify({
                                success: false,
                                error: "Missing required parameters: 'test_name' and 'steps'",
                            }),
                        },
                    ],
                };
            }
            const result = await runBrowserTest(testName, steps);
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(result, null, 2),
                    },
                ],
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify({
                            success: false,
                            error: errorMessage,
                        }),
                    },
                ],
            };
        }
    }
    return {
        content: [
            {
                type: 'text',
                text: JSON.stringify({
                    success: false,
                    error: `Unknown tool: ${name}`,
                }),
            },
        ],
    };
});
// Start the server
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('WebQA MCP server started');
}
main().catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map