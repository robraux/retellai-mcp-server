#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerAllTools } from "./tools/index.js";
import { createRetellClient } from "./client.js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

import dotenv from "dotenv";
dotenv.config();

function createMcpServer() {
  const retellApiKey = process.env.RETELL_API_KEY;
  if (!retellApiKey) {
    throw new Error("RETELL_API_KEY environment variable is required");
  }

  const retellClient = createRetellClient(retellApiKey);

  // Read version from package.json
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const packageJsonPath = join(__dirname, "../package.json");
  const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));

  const mcpServer = new McpServer({
    name: "Retell MCP",
    version: packageJson.version,
    capabilities: [],
  });

  registerAllTools(mcpServer, retellClient);

  return mcpServer;
}

async function main() {
  try {
    const mcpServer = createMcpServer();

    const transport = new StdioServerTransport();
    await mcpServer.connect(transport);

    setupShutdownHandler(mcpServer);
  } catch (err) {
    console.error("Error starting MCP server:", err);
    process.exit(1);
  }
}

function setupShutdownHandler(mcpServer: McpServer) {
  process.on("SIGINT", async () => {
    try {
      await mcpServer.close();
      process.exit(0);
    } catch (err) {
      console.error("Error shutting down MCP server:", err);
      process.exit(1);
    }
  });
}

main();
