/**
 * @license
 * Copyright 2025 Tanaike
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { tools } from "./tools.js";

const server = new McpServer({
  name: "file-search-store-extension",
  version: "1.0.1",
});

if (tools.length > 0) {
  for (const { name, schema, func } of tools) {
    server.registerTool(name, schema, func);
  }
}

const transport = new StdioServerTransport();
await server.connect(transport);
