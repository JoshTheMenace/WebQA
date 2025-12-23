import { TestDefinition, TestResult } from '../types/dsl.js';
export declare class PlaywrightInterpreter {
    private recordingsDir;
    constructor(recordingsDir?: string);
    executeTest(definition: TestDefinition): Promise<TestResult>;
    private executeStep;
    private getVideoPath;
}
//# sourceMappingURL=playwright-interpreter.d.ts.map