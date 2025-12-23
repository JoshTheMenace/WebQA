import { chromium, Browser, BrowserContext, Page } from 'playwright';
import { TestDefinition, TestResult, TestStep, StepResult } from '../types/dsl.js';
import path from 'path';
import fs from 'fs';

export class PlaywrightInterpreter {
  private recordingsDir: string;

  constructor(recordingsDir: string = './recordings') {
    this.recordingsDir = recordingsDir;
    // Ensure recordings directory exists
    if (!fs.existsSync(this.recordingsDir)) {
      fs.mkdirSync(this.recordingsDir, { recursive: true });
    }
  }

  async executeTest(definition: TestDefinition): Promise<TestResult> {
    const startTime = Date.now();
    const stepResults: StepResult[] = [];
    const screenshots: string[] = [];
    let browser: Browser | null = null;
    let context: BrowserContext | null = null;
    let page: Page | null = null;
    let videoPath: string | undefined;

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const testVideoDir = path.join(this.recordingsDir, `${definition.test_name}_${timestamp}`);

    try {
      // Launch browser
      browser = await chromium.launch({
        headless: true,
      });

      // Create context with video recording
      context = await browser.newContext({
        recordVideo: {
          dir: testVideoDir,
          size: { width: 1280, height: 720 },
        },
      });

      page = await context.newPage();

      // Execute each step
      for (let i = 0; i < definition.steps.length; i++) {
        const step = definition.steps[i];
        const stepStart = Date.now();

        try {
          const screenshotPath = await this.executeStep(page, step, testVideoDir);
          if (screenshotPath) {
            screenshots.push(screenshotPath);
          }

          stepResults.push({
            step_index: i,
            action: step.action,
            success: true,
            duration_ms: Date.now() - stepStart,
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          stepResults.push({
            step_index: i,
            action: step.action,
            success: false,
            error: errorMessage,
            duration_ms: Date.now() - stepStart,
          });

          // Close context to finalize video
          await context.close();
          context = null;

          // Get video path
          videoPath = await this.getVideoPath(testVideoDir);

          return {
            test_name: definition.test_name,
            success: false,
            steps_executed: i + 1,
            steps_total: definition.steps.length,
            step_results: stepResults,
            video_path: videoPath,
            screenshots,
            error: `Step ${i} (${step.action}) failed: ${errorMessage}`,
            total_duration_ms: Date.now() - startTime,
          };
        }
      }

      // Close context to finalize video
      await context.close();
      context = null;

      // Get video path
      videoPath = await this.getVideoPath(testVideoDir);

      return {
        test_name: definition.test_name,
        success: true,
        steps_executed: definition.steps.length,
        steps_total: definition.steps.length,
        step_results: stepResults,
        video_path: videoPath,
        screenshots,
        total_duration_ms: Date.now() - startTime,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      return {
        test_name: definition.test_name,
        success: false,
        steps_executed: stepResults.length,
        steps_total: definition.steps.length,
        step_results: stepResults,
        video_path: videoPath,
        screenshots,
        error: `Test execution failed: ${errorMessage}`,
        total_duration_ms: Date.now() - startTime,
      };
    } finally {
      if (context) {
        await context.close();
      }
      if (browser) {
        await browser.close();
      }
    }
  }

  private async executeStep(page: Page, step: TestStep, videoDir: string): Promise<string | undefined> {
    switch (step.action) {
      case 'goto':
        await page.goto(step.url, { waitUntil: 'domcontentloaded' });
        break;

      case 'click':
        await page.click(step.selector);
        break;

      case 'type':
        await page.fill(step.selector, step.text);
        break;

      case 'wait_for':
        await page.waitForSelector(step.selector, {
          timeout: step.timeout ?? 30000,
        });
        break;

      case 'screenshot': {
        const screenshotPath = path.join(videoDir, `${step.name}.png`);
        await page.screenshot({ path: screenshotPath });
        return screenshotPath;
      }

      case 'screenshot_element': {
        const screenshotPath = path.join(videoDir, `${step.name}.png`);
        const element = await page.waitForSelector(step.selector);
        if (!element) {
          throw new Error(`Element not found for screenshot: ${step.selector}`);
        }

        const padding = step.padding ?? 10;

        if (padding > 0) {
          // Get element bounding box and add padding
          const box = await element.boundingBox();
          if (box) {
            // Calculate padded clip area, ensuring we stay within viewport
            const viewport = page.viewportSize() || { width: 1280, height: 720 };
            const clip = {
              x: Math.max(0, box.x - padding),
              y: Math.max(0, box.y - padding),
              width: Math.min(box.width + padding * 2, viewport.width - Math.max(0, box.x - padding)),
              height: Math.min(box.height + padding * 2, viewport.height - Math.max(0, box.y - padding)),
            };
            await page.screenshot({ path: screenshotPath, clip });
          } else {
            // Fallback to element screenshot if can't get bounding box
            await element.screenshot({ path: screenshotPath });
          }
        } else {
          // No padding - just screenshot the element directly
          await element.screenshot({ path: screenshotPath });
        }
        return screenshotPath;
      }

      case 'assert_text': {
        const element = await page.waitForSelector(step.selector);
        if (!element) {
          throw new Error(`Element not found: ${step.selector}`);
        }
        const text = await element.textContent();
        if (!text?.includes(step.text)) {
          throw new Error(`Expected text "${step.text}" not found in element. Got: "${text}"`);
        }
        break;
      }

      case 'assert_visible': {
        const visible = await page.isVisible(step.selector);
        if (!visible) {
          throw new Error(`Element not visible: ${step.selector}`);
        }
        break;
      }

      case 'hover':
        await page.hover(step.selector);
        break;

      case 'select':
        await page.selectOption(step.selector, step.value);
        break;

      case 'press':
        await page.keyboard.press(step.key);
        break;

      case 'wait':
        await new Promise(resolve => setTimeout(resolve, step.duration));
        break;

      default:
        throw new Error(`Unknown action: ${(step as { action: string }).action}`);
    }

    return undefined;
  }

  private async getVideoPath(videoDir: string): Promise<string | undefined> {
    // Wait a bit for video to be finalized
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      const files = fs.readdirSync(videoDir);
      const videoFile = files.find(f => f.endsWith('.webm'));
      if (videoFile) {
        return path.join(videoDir, videoFile);
      }
    } catch {
      // Directory might not exist or be empty
    }
    return undefined;
  }
}
