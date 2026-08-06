#!/usr/bin/env node

import { Command } from "commander";
import { getConfig, saveConfig } from "./config";
import { AgentClient } from "./client";
import { executeCommand } from "./executor";
import packageJson from "../package.json";

const program = new Command();

program
  .name("work-agent")
  .description("Local agent for Work Achievement Platform")
  .version(packageJson.version);

// Config commands
const configCmd = program.command("config").description("Manage configuration");

configCmd
  .command("set <key> <value>")
  .description("Set a configuration value (serverUrl, apiKey, name)")
  .action((key, value) => {
    const validKeys = ["serverUrl", "apiKey", "name"];
    if (!validKeys.includes(key)) {
      console.error(`Invalid config key: ${key}. Valid keys: ${validKeys.join(", ")}`);
      process.exit(1);
    }
    saveConfig({ [key]: value });
    console.log(`Config updated: ${key} = ${key === "apiKey" ? "****" : value}`);
  });

configCmd
  .command("show")
  .description("Show current configuration")
  .action(() => {
    const config = getConfig();
    console.log("Current configuration:");
    console.log(`  Server URL: ${config.serverUrl}`);
    console.log(`  API Key: ${config.apiKey ? "****" + config.apiKey.slice(-8) : "(not set)"}`);
    console.log(`  Agent name: ${config.name || "(default)"}`);
  });

// Start command
program
  .command("start")
  .description("Start the agent and connect to server")
  .action(() => {
    const config = getConfig();
    if (!config.apiKey) {
      console.error("API key not configured. Please run: work-agent config set apiKey <your-key>");
      process.exit(1);
    }

    console.log("Starting Work Achievement Platform Agent...");
    console.log(`Server: ${config.serverUrl}`);
    console.log(`Press Ctrl+C to stop`);
    console.log();

    const client = new AgentClient({
      serverUrl: config.serverUrl,
      apiKey: config.apiKey,
      name: config.name,
    });

    client.connect();

    // Handle shutdown
    process.on("SIGINT", () => {
      console.log("\nShutting down...");
      client.disconnect();
      process.exit(0);
    });

    process.on("SIGTERM", () => {
      client.disconnect();
      process.exit(0);
    });
  });

// Test command execution
program
  .command("run <command>")
  .description("Test run a command locally (for debugging)")
  .action(async (command) => {
    console.log(`Running: ${command}`);
    const result = await executeCommand(command);
    console.log(`Exit code: ${result.exitCode}`);
    console.log(`Duration: ${result.durationMs}ms`);
    console.log();
    if (result.success) {
      console.log("Output:");
      console.log(result.output);
    } else {
      console.error("Error:");
      console.error(result.error);
      console.log("Stdout:", result.output);
    }
  });

// Status command
program
  .command("status")
  .description("Check agent connection status")
  .action(() => {
    const config = getConfig();
    console.log("Agent status:");
    console.log(`  Configured: ${config.apiKey ? "Yes" : "No"}`);
    console.log(`  Server: ${config.serverUrl}`);
    // TODO: check if already running and connected
  });

program.parse();
