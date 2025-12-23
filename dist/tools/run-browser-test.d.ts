import { TestResult } from '../types/dsl.js';
export declare function runBrowserTest(testName: string, steps: unknown[], recordingsDir?: string): Promise<TestResult>;
export declare const runBrowserTestSchema: {
    type: "object";
    properties: {
        test_name: {
            type: string;
            description: string;
        };
        steps: {
            type: string;
            description: string;
            items: {
                type: string;
                properties: {
                    action: {
                        type: string;
                        enum: string[];
                        description: string;
                    };
                    url: {
                        type: string;
                        description: string;
                    };
                    selector: {
                        type: string;
                        description: string;
                    };
                    text: {
                        type: string;
                        description: string;
                    };
                    name: {
                        type: string;
                        description: string;
                    };
                    value: {
                        type: string;
                        description: string;
                    };
                    key: {
                        type: string;
                        description: string;
                    };
                    timeout: {
                        type: string;
                        description: string;
                    };
                    duration: {
                        type: string;
                        description: string;
                    };
                    padding: {
                        type: string;
                        description: string;
                    };
                };
                required: string[];
            };
        };
    };
    required: string[];
};
//# sourceMappingURL=run-browser-test.d.ts.map