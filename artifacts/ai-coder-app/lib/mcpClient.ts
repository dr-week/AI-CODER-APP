/**
 * Model Context Protocol (MCP) Client & Server Discovery Engine
 * Provides standard protocol interfaces for LLMs to discover tools, resources,
 * and external databases (PostgreSQL, GitHub API, File System) without custom API wrappers.
 */

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: Record<string, any>;
}

export interface MCPServerConfig {
  id: string;
  name: string;
  transport: 'stdio' | 'websocket' | 'http';
  endpoint: string;
  tools: MCPTool[];
}

export const REGISTERED_MCP_SERVERS: MCPServerConfig[] = [
  {
    id: 'filesystem-server',
    name: 'Local File System MCP Server',
    transport: 'stdio',
    endpoint: 'npx @modelcontextprotocol/server-filesystem',
    tools: [
      { name: 'read_file', description: 'Read local file content', inputSchema: { path: 'string' } },
      { name: 'write_file', description: 'Write or edit local file content', inputSchema: { path: 'string', content: 'string' } },
      { name: 'list_directory', description: 'List files in directory', inputSchema: { path: 'string' } },
    ],
  },
  {
    id: 'postgres-server',
    name: 'PostgreSQL Database MCP Server',
    transport: 'stdio',
    endpoint: 'npx @modelcontextprotocol/server-postgres',
    tools: [
      { name: 'query_schema', description: 'Inspect PostgreSQL tables & columns', inputSchema: { dbUrl: 'string' } },
      { name: 'execute_sql', description: 'Run DDL/DML SQL statements', inputSchema: { sql: 'string' } },
    ],
  },
  {
    id: 'github-server',
    name: 'GitHub API MCP Server',
    transport: 'http',
    endpoint: 'https://api.github.com/mcp',
    tools: [
      { name: 'create_issue', description: 'Open a GitHub issue', inputSchema: { repo: 'string', title: 'string', body: 'string' } },
      { name: 'create_pull_request', description: 'Create a PR on GitHub', inputSchema: { repo: 'string', branch: 'string' } },
    ],
  },
];

/**
 * Discovers and formats active MCP tools into LLM function declaration payload.
 */
export function discoverMCPTools(): string {
  const toolsList = REGISTERED_MCP_SERVERS.flatMap(s =>
    s.tools.map(t => `- [MCP Server: ${s.name}] Tool: "${t.name}" -> ${t.description}`)
  ).join('\n');

  return `
MODEL CONTEXT PROTOCOL (MCP) ACTIVE TOOLS DISCOVERY:
${toolsList}
`.trim();
}
