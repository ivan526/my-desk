import fs from "fs";
import path from "path";
import os from "os";

interface AgentConfig {
  serverUrl: string;
  apiKey: string;
  name?: string;
}

const CONFIG_DIR = path.join(os.homedir(), ".work-agent");
const CONFIG_FILE = path.join(CONFIG_DIR, "config.json");

export function getConfig(): AgentConfig {
  if (!fs.existsSync(CONFIG_FILE)) {
    return {
      serverUrl: "ws://localhost:3001",
      apiKey: "",
    };
  }
  try {
    const content = fs.readFileSync(CONFIG_FILE, "utf-8");
    return {
      serverUrl: "ws://localhost:3001",
      apiKey: "",
      ...JSON.parse(content),
    };
  } catch {
    return {
      serverUrl: "ws://localhost:3001",
      apiKey: "",
    };
  }
}

export function saveConfig(config: Partial<AgentConfig>) {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
  const current = getConfig();
  const newConfig = { ...current, ...config };
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(newConfig, null, 2), { mode: 0o600 });
  return newConfig;
}
