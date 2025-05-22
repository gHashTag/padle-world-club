import { Telegraf, Scenes } from "telegraf";
// import { TelegramBot } from "@/bot"; // Commented out for now
import type { StorageAdapter } from "./src/adapters/storage-adapter";

// TODO: Add your scenes here
// Example: import { exampleScene } from "./scenes/example-scene";

/**
 * Exports for the starter kit
 */
export { Telegraf, Scenes }; // Removed TelegramBot export for now
export type { StorageAdapter };
