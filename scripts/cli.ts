#!/usr/bin/env npx tsx
/**
 * Gemini PRO 3.1 Automation Skill
 * 
 * USAGE (CLI):
 *   npx tsx /Users/user/.claude/skills/gemini-automation/scripts/cli.ts image "sunset over ocean"
 *   npx tsx /Users/user/.claude/skills/gemini-automation/scripts/cli.ts prompt "hello world"
 *   npx tsx /Users/user/.claude/skills/gemini-automation/scripts/cli.ts video "space travel"
 *   npx tsx /Users/user/.claude/skills/gemini-automation/scripts/cli.ts deepsearch "AI trends 2026"
 * 
 * USAGE (as Module):
 *   import { geminiAI } from './cli.js';
 *   await geminiAI.image("sunset over ocean");
 *   await geminiAI.prompt("hello world");
 */

import os from 'os';
import { connect, type Browser, type Page } from "@/client.js";

// Configuration
const RELAY_URL = "http://localhost:9222";

// Timeout configuration via environment variables
const TIMEOUTS = {
  PAGE_LOAD: parseInt(process.env.GEMINI_TIMEOUT_PAGE_LOAD || '30000', 10),
  PRO_MODEL_SWITCH: parseInt(process.env.GEMINI_TIMEOUT_PRO_SWITCH || '2000', 10),
  RESPONSE_WAIT: parseInt(process.env.GEMINI_TIMEOUT_RESPONSE || '20000', 10),
  DEEP_SEARCH: parseInt(process.env.GEMINI_TIMEOUT_DEEP_SEARCH || '180000', 10),
  IMAGE_GENERATION: parseInt(process.env.GEMINI_TIMEOUT_IMAGE || '25000', 10),
  VIDEO_GENERATION: parseInt(process.env.GEMINI_TIMEOUT_VIDEO || '30000', 10),
  RESEARCH_PLAN: parseInt(process.env.GEMINI_TIMEOUT_RESEARCH_PLAN || '5000', 10),
};

// Response text limits
const MAX_RESPONSE_LENGTH = 30000;
const MAX_RESEARCH_LENGTH = 50000;

// Parse command line arguments
const args = process.argv.slice(2);
const command = args[0]?.toLowerCase();
const userPrompt = args.slice(1).join(" ");

// Parse output directory from environment or use home directory
const outputDir = process.env.GEMINI_OUTPUT_DIR || os.homedir();

// Input selectors - centralized
const INPUT_SELECTORS = [
  'div[role="textbox"]',
  'textarea[placeholder*="prompt"]',
  'input[type="text"]'
];

// PRO model selectors - multiple languages
const PRO_SELECTORS = [
  'button:has-text("3.1 Pro")',
  'button:has-text("2.0 Pro")',
  'button:has-text("Pro")',
  'button[data-model*="pro"]',
  'button[aria-label*="Pro"]'
];

// Non-PRO model selectors - multiple languages
const QUICK_SELECTORS = [
  'button:has-text("Hızlı")',    // Turkish
  'button:has-text("Fast")',      // English
  'button:has-text("Rapide")',    // French
  'button:has-text("Schnell")',   // German
  'button:has-text("高速")',       // Japanese
  'button:has-text("快速")'        // Chinese
];

// Research button selectors - multiple languages
const RESEARCH_SELECTORS = [
  'button:has-text("Araştırın")',     // Turkish
  'button:has-text("Research")',       // English
  'button:has-text("Rechercher")',    // French
  'button:has-text("Forschen")',      // German
  'button:has-text("研究")',           // Japanese
  'button[aria-label*="Research"]',
  'button[aria-label*="Araştır"]'
];

// Approve button selectors - multiple languages
const APPROVE_SELECTORS = [
  'button:has-text("Onayla")',              // Turkish
  'button:has-text("başlat")',              // Turkish
  'button:has-text("Araştırmayı başlat")',  // Turkish
  'button:has-text("Start Research")',       // English
  'button:has-text("Approve")',              // English
  'button:has-text("Research")',             // English
  'button:has-text("Démarrer")',             // French
  'button:has-text("Starten")',              // German
  'button[aria-label*="Onayla"]',
  'button[aria-label*=" Araştır"]'
];

/**
 * Sanitize user input for safe typing
 */
function sanitizeInput(input: string): string {
  // Remove null bytes and control characters that could cause issues
  return input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').trim();
}

/**
 * Validate prompt input
 */
function validatePrompt(prompt: string, maxLength: number = 10000): string {
  if (!prompt || prompt.trim().length === 0) {
    throw new Error("Prompt cannot be empty");
  }
  if (prompt.length > maxLength) {
    throw new Error(`Prompt exceeds maximum length of ${maxLength} characters`);
  }
  return sanitizeInput(prompt);
}

class GeminiAutomation {
  private client: Browser | null = null;
  private page: Page | null = null;
  private isConnected: boolean = false;
  
  // Track created pages for cleanup
  private pageId: string = "";

  /**
   * Validate that the output directory exists and is writable
   */
  private validateOutputDir(): boolean {
    try {
      const fs = require('fs');
      if (!fs.existsSync(outputDir)) {
        console.error(`❌ Output directory does not exist: ${outputDir}`);
        console.log(`   Set GEMINI_OUTPUT_DIR environment variable to a valid path`);
        return false;
      }
      // Test write access
      const testFile = `${outputDir}/.gemini-write-test-${Date.now()}`;
      fs.writeFileSync(testFile, '');
      fs.unlinkSync(testFile);
      return true;
    } catch (error: any) {
      console.error(`❌ Cannot write to output directory: ${outputDir}`);
      console.log(`   Error: ${error.message}`);
      console.log(`   Set GEMINI_OUTPUT_DIR environment variable to a valid path`);
      return false;
    }
  }

  /**
   * Ensure relay server is running and extension is connected
   */
  async ensureRelayServer(): Promise<boolean> {
    try {
      const response = await fetch("http://localhost:9222");
      const data = await response.json();
      if (data.extensionConnected !== true) {
        console.error("❌ Extension not connected!");
        console.log("   Set dev-browser extension to 'Active' mode");
        return false;
      }
      return true;
    } catch {
      console.error("❌ Relay server not running!");
      console.log("   Start with: cd /tmp/dev-browser/skills/dev-browser && npx tsx scripts/start-relay.ts");
      return false;
    }
  }

  /**
   * Connect to Chrome via relay server
   */
  async connect(): Promise<boolean> {
    // If already connected and page is still valid, return
    if (this.isConnected && this.page) {
      console.log("🔄 Reusing existing Gemini session");
      return true;
    }
    
    // Validate output directory before proceeding
    if (!this.validateOutputDir()) {
      return false;
    }
    
    const relayReady = await this.ensureRelayServer();
    if (!relayReady) return false;
    
    try {
      // Create unique page name for this session
      this.pageId = "gemini-" + Date.now();
      this.client = await connect(RELAY_URL);
      this.page = await this.client.page(this.pageId);
      
      // Only set isConnected AFTER successful connection
      this.isConnected = true;
      
      console.log("✅ Connected to Chrome via relay server");
      return true;
    } catch (error: any) {
      console.error(`❌ Connection failed: ${error.message}`);
      // Do NOT set isConnected to true on failure
      this.isConnected = false;
      return false;
    }
  }

  /**
   * Force create a new page
   */
  async connectNew(): Promise<boolean> {
    // Disconnect existing first
    await this.disconnect();
    // Reset state and connect fresh
    this.client = null;
    this.page = null;
    this.isConnected = false;
    this.pageId = "";
    return await this.connect();
  }

  /**
   * Disconnect and cleanup resources
   */
  async disconnect(): Promise<void> {
    try {
      if (this.page) {
        await this.page.close().catch(() => {});
        this.page = null;
      }
      if (this.client) {
        await this.client.disconnect().catch(() => {});
        this.client = null;
      }
      this.isConnected = false;
      console.log("🔌 Disconnected from Chrome");
    } catch (error: any) {
      console.warn("⚠️ Error during disconnect:", error.message);
    }
  }

  /**
   * Common function to extract response text from page
   */
  private async extractResponseText(maxLength: number = MAX_RESPONSE_LENGTH): Promise<string> {
    try {
      const text = await this.page.evaluate((len: number) => {
        // Try multiple selector patterns
        const selectors = [
          'div[role="article"]',
          'div[class*="response"]',
          'div[class*="message"]',
          'div[class*="content"]'
        ];
        
        let text = "";
        for (const sel of selectors) {
          const els = document.querySelectorAll(sel);
          els.forEach((el: any) => {
            text += el.innerText + "\n\n";
          });
        }
        
        // Fallback to body if no content found
        if (!text || text.length < 50) {
          text = document.body.innerText;
        }
        return text.slice(0, len);
      }, maxLength);
      
      return text;
    } catch (error: any) {
      console.warn("⚠️ Error extracting response:", error.message);
      return "";
    }
  }

  /**
   * Save response to file with error handling
   */
  private saveToFile(filename: string, content: string): boolean {
    try {
      const fs = require('fs');
      const filepath = `${outputDir}/${filename}`;
      fs.writeFileSync(filepath, content);
      console.log(`✅ Saved: ${filepath}`);
      return true;
    } catch (error: any) {
      console.error(`❌ Failed to save ${filename}: ${error.message}`);
      return false;
    }
  }

  /**
   * Take screenshot with error handling
   */
  private async takeScreenshot(filename: string, fullPage: boolean = false): Promise<boolean> {
    try {
      const filepath = `${outputDir}/${filename}`;
      await this.page.screenshot({ path: filepath, fullPage });
      console.log(`✅ Screenshot: ${filepath}`);
      return true;
    } catch (error: any) {
      console.error(`❌ Failed to take screenshot: ${error.message}`);
      return false;
    }
  }

  /**
   * Wait for element with retry logic
   */
  private async waitForElement(selector: string, timeout: number = 5000): Promise<boolean> {
    try {
      await this.page.waitForSelector(selector, { timeout });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Try multiple selectors and return first match
   */
  private async trySelectors(selectors: string[]): Promise<PageLocator | null> {
    for (const selector of selectors) {
      try {
        const count = await this.page.locator(selector).count();
        if (count > 0) {
          return this.page.locator(selector).first();
        }
      } catch {
        continue;
      }
    }
    return null;
  }

  /**
   * Select PRO model with localization fallback
   */
  async selectProModel(): Promise<boolean> {
    try {
      await this.page.goto("https://gemini.google.com/app", { 
        waitUntil: "domcontentloaded",
        timeout: TIMEOUTS.PAGE_LOAD
      });
      await this.page.waitForTimeout(TIMEOUTS.PRO_MODEL_SWITCH);

      // Check if already on PRO
      for (const sel of PRO_SELECTORS) {
        const count = await this.page.locator(sel).count();
        if (count > 0) {
          console.log("✅ PRO model already selected");
          return true;
        }
      }

      // Try to switch from non-PRO model
      for (const sel of QUICK_SELECTORS) {
        const quickBtn = this.page.locator(sel);
        if (await quickBtn.count() > 0) {
          await quickBtn.click();
          await this.page.waitForTimeout(TIMEOUTS.PRO_MODEL_SWITCH);
          
          // Try PRO selectors again after clicking
          for (const proSel of PRO_SELECTORS) {
            const proBtn = this.page.locator(proSel);
            if (await proBtn.count() > 0) {
              await proBtn.click();
              await this.page.waitForTimeout(TIMEOUTS.PRO_MODEL_SWITCH);
              console.log("✅ Switched to PRO model");
              return true;
            }
          }
        }
      }
      
      console.log("⚠️ Could not verify PRO model, continuing anyway");
      return true;
    } catch (error: any) {
      console.warn("⚠️ Error selecting PRO model:", error.message);
      return true; // Continue anyway
    }
  }

  /**
   * Send a prompt and get response
   */
  async prompt(text: string): Promise<string> {
    // Validate input
    const validatedText = validatePrompt(text);
    
    try {
      const connected = await this.connect();
      if (!connected) throw new Error("Failed to connect");
      
      await this.selectProModel();

      const input = await this.trySelectors(INPUT_SELECTORS);
      if (!input) {
        throw new Error("Could not find input field");
      }
      
      await input.click();
      await this.page.keyboard.type(validatedText);
      await this.page.keyboard.press("Enter");
      
      console.log("⏳ Waiting for response...");
      await this.page.waitForTimeout(TIMEOUTS.RESPONSE_WAIT);
      
      // Extract response
      const responseText = await this.extractResponseText(MAX_RESPONSE_LENGTH);
      
      // Output to stdout for LLM context
      console.log("\n" + "=".repeat(50));
      console.log("GEMINI RESPONSE:");
      console.log("=".repeat(50));
      console.log(responseText);
      console.log("=".repeat(50));
      console.log("END OF RESPONSE\n");
      
      // Save to file
      this.saveToFile("gemini-response.txt", responseText);
      await this.takeScreenshot("gemini-response.png", true);
      
      return responseText;
    } catch (error: any) {
      console.error(`❌ Error in prompt: ${error.message}`);
      await this.takeScreenshot("gemini-error.png", true).catch(() => {});
      throw error;
    }
  }

  /**
   * Run deep research
   */
  async deepSearch(query: string): Promise<string> {
    // Validate input
    const validatedQuery = validatePrompt(query);
    
    try {
      const connected = await this.connect();
      if (!connected) throw new Error("Failed to connect");
      
      await this.selectProModel();

      await this.page.keyboard.press("Escape");
      await this.page.waitForTimeout(500);
      
      const researchBtn = await this.trySelectors(RESEARCH_SELECTORS);
      if (researchBtn) {
        await researchBtn.click();
        await this.page.waitForTimeout(TIMEOUTS.PRO_MODEL_SWITCH);
        console.log("✅ Research mode opened");
      }

      const input = await this.trySelectors(INPUT_SELECTORS);
      if (!input) {
        throw new Error("Could not find input field");
      }
      
      await input.click();
      await this.page.keyboard.type(validatedQuery);
      await this.page.keyboard.press("Enter");
      
      console.log("⏳ Waiting for research plan...");
      await this.page.waitForTimeout(TIMEOUTS.RESEARCH_PLAN);
      
      const approveBtn = await this.trySelectors(APPROVE_SELECTORS);
      if (approveBtn) {
        await approveBtn.click();
        console.log("✅ Research approved - starting deep research...");
      }
      
      // Wait for deep research
      console.log("⏳ Running deep research (this may take 2-3 minutes)...");
      await this.page.waitForTimeout(TIMEOUTS.DEEP_SEARCH);
      
      // Get research text
      const researchText = await this.extractResponseText(MAX_RESEARCH_LENGTH);
      
      // Output to stdout
      console.log("\n" + "=".repeat(50));
      console.log("DEEP RESEARCH RESULTS:");
      console.log("=".repeat(50));
      console.log(researchText);
      console.log("=".repeat(50));
      console.log("END OF RESEARCH\n");
      
      // Save to file
      this.saveToFile("gemini-deep-research.txt", researchText);
      await this.takeScreenshot("gemini-deepsearch.png", true);
      
      return researchText;
    } catch (error: any) {
      console.error(`❌ Error in deepSearch: ${error.message}`);
      await this.takeScreenshot("gemini-error.png", true).catch(() => {});
      throw error;
    }
  }

  /**
   * Generate an image
   */
  async image(prompt: string): Promise<string> {
    // Validate input
    const validatedPrompt = validatePrompt(prompt);
    
    try {
      const connected = await this.connect();
      if (!connected) throw new Error("Failed to connect");
      
      await this.selectProModel();

      const input = await this.trySelectors(INPUT_SELECTORS);
      if (!input) {
        throw new Error("Could not find input field");
      }
      
      await input.click();
      await this.page.keyboard.type(validatedPrompt);
      await this.page.keyboard.press("Enter");
      
      console.log("⏳ Generating image...");
      await this.page.waitForTimeout(TIMEOUTS.IMAGE_GENERATION);
      
      await this.takeScreenshot("gemini-image.png", true);
      console.log("✅ Image generated");
      
      return "Image generated successfully";
    } catch (error: any) {
      console.error(`❌ Error in image: ${error.message}`);
      await this.takeScreenshot("gemini-error.png", true).catch(() => {});
      throw error;
    }
  }

  /**
   * Generate a video
   */
  async video(prompt: string): Promise<string> {
    // Validate input
    const validatedPrompt = validatePrompt(prompt);
    
    try {
      const connected = await this.connect();
      if (!connected) throw new Error("Failed to connect");
      
      await this.selectProModel();

      const input = await this.trySelectors(INPUT_SELECTORS);
      if (!input) {
        throw new Error("Could not find input field");
      }
      
      await input.click();
      await this.page.keyboard.type(validatedPrompt);
      await this.page.keyboard.press("Enter");
      
      console.log("⏳ Generating video...");
      await this.page.waitForTimeout(TIMEOUTS.VIDEO_GENERATION);
      
      await this.takeScreenshot("gemini-video.png", true);
      console.log("✅ Video generation requested");
      
      return "Video generation requested - screenshot saved";
    } catch (error: any) {
      console.error(`❌ Error in video: ${error.message}`);
      await this.takeScreenshot("gemini-error.png", true).catch(() => {});
      throw error;
    }
  }
}

// Type for Page Locator
type PageLocator = ReturnType<Page['locator']>;

// Singleton instance
let gemini: GeminiAutomation | null = null;

function getGemini(): GeminiAutomation {
  if (!gemini) {
    gemini = new GeminiAutomation();
  }
  return gemini;
}

// API for AI agents
export const geminiAI = {
  prompt: async (text: string) => {
    const g = getGemini();
    return await g.prompt(text);
  },
  
  deepSearch: async (query: string) => {
    const g = getGemini();
    return await g.deepSearch(query);
  },
  
  image: async (prompt: string) => {
    const g = getGemini();
    return await g.image(prompt);
  },
  
  video: async (prompt: string) => {
    const g = getGemini();
    return await g.video(prompt);
  },
  
  disconnect: async () => {
    const g = getGemini();
    await g.disconnect();
  }
};

// CLI Runner
async function runCLI() {
  if (!command || !userPrompt) {
    console.log(`
🤖 Gemini Automation CLI

Usage:
  npx tsx <script> <command> <prompt>

Commands:
  image, img     Generate an image
  video, vid     Generate a video  
  prompt, msg    Send a prompt
  deepsearch     Run deep research

Options:
  GEMINI_OUTPUT_DIR         Output directory (default: ~)
  GEMINI_TIMEOUT_PAGE_LOAD  Page load timeout (default: 30000ms)
  GEMINI_TIMEOUT_RESPONSE   Response wait timeout (default: 20000ms)
  GEMINI_TIMEOUT_DEEP_SEARCH Deep search timeout (default: 180000ms)
  GEMINI_TIMEOUT_IMAGE     Image generation timeout (default: 25000ms)
  GEMINI_TIMEOUT_VIDEO     Video generation timeout (default: 30000ms)

Examples:
  npx tsx image "sunset over ocean"
  npx tsx video "space travel"
  npx tsx prompt "hello, how are you?"
  npx tsx deepsearch "AI trends 2026"
  
  GEMINI_OUTPUT_DIR=/tmp npx tsx image "cat"
  GEMINI_TIMEOUT_RESPONSE=30000 npx tsx prompt "complex task"
`);
    process.exit(0);
  }

  const g = getGemini();
  
  try {
    switch (command) {
      case "image":
      case "img":
        await g.image(userPrompt);
        break;
      case "video":
      case "vid":
        await g.video(userPrompt);
        break;
      case "prompt":
      case "msg":
        await g.prompt(userPrompt);
        break;
      case "deepsearch":
        await g.deepSearch(userPrompt);
        break;
      default:
        console.error(`Unknown command: ${command}`);
        process.exit(1);
    }
  } catch (error: any) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
  
  console.log("\n✅ Operation completed");
}

// Run if executed directly (ESM compatible)
const isMain = process.argv[1]?.includes('gemini-automation');
if (isMain) {
  runCLI();
}

export default geminiAI;
