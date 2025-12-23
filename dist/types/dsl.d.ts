export interface GotoStep {
    action: 'goto';
    url: string;
}
export interface ClickStep {
    action: 'click';
    selector: string;
}
export interface TypeStep {
    action: 'type';
    selector: string;
    text: string;
}
export interface WaitForStep {
    action: 'wait_for';
    selector: string;
    timeout?: number;
}
export interface ScreenshotStep {
    action: 'screenshot';
    name: string;
}
export interface ScreenshotElementStep {
    action: 'screenshot_element';
    selector: string;
    name: string;
    padding?: number;
}
export interface AssertTextStep {
    action: 'assert_text';
    selector: string;
    text: string;
}
export interface AssertVisibleStep {
    action: 'assert_visible';
    selector: string;
}
export interface HoverStep {
    action: 'hover';
    selector: string;
}
export interface SelectStep {
    action: 'select';
    selector: string;
    value: string;
}
export interface PressStep {
    action: 'press';
    key: string;
}
export interface WaitStep {
    action: 'wait';
    duration: number;
}
export type TestStep = GotoStep | ClickStep | TypeStep | WaitForStep | WaitStep | ScreenshotStep | ScreenshotElementStep | AssertTextStep | AssertVisibleStep | HoverStep | SelectStep | PressStep;
export interface TestDefinition {
    test_name: string;
    steps: TestStep[];
}
export interface StepResult {
    step_index: number;
    action: string;
    success: boolean;
    error?: string;
    duration_ms: number;
}
export interface TestResult {
    test_name: string;
    success: boolean;
    steps_executed: number;
    steps_total: number;
    step_results: StepResult[];
    video_path?: string;
    screenshots: string[];
    error?: string;
    total_duration_ms: number;
}
//# sourceMappingURL=dsl.d.ts.map