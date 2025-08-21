# RetellAI MCP Server — Forked & Maintained by [Rob Raux]

This project is a **fork** of [abhaybabbar/retellai-mcp-server](https://github.com/abhaybabbar/retellai-mcp-server), originally licensed under the MIT License. This fork is independently maintained and extended under the same license.

This is a Model Context Protocol (MCP) server implementation for RetellAI, allowing AI assistants to interact with RetellAI's voice services. Based on the [RetellAI API](https://docs.retellai.com/api-references/).

## Features

The RetellAI MCP server provides tools for:

- **Call Management**: Create and manage phone calls and web calls
- **Agent Management**: Create and manage voice agents with different LLM configurations
- **Phone Number Management**: Provision and configure phone numbers
- **Voice Management**: Access and use different voice options
- **Test Case Definitions**: Create and manage simulation test cases for voice agents (undocumented API)

## Claude Desktop Setup

1. Open `Claude Desktop` and press `CMD + ,` to go to `Settings`.
2. Click on the `Developer` tab.
3. Click on the `Edit Config` button.
4. This will open the `claude_desktop_config.json` file in your file explorer.
5. Get your Retell API key from the Retell dashboard (<https://dashboard.retellai.com/apiKey>).
6. Add the following to your `claude_desktop_config.json` file. See [here](https://modelcontextprotocol.io/quickstart/user) for more details.
7. Restart the Claude Desktop after editing the config file.

```json
{
  "mcpServers": {
    "retellai-mcp-server": {
      "command": "npx",
      "args": ["-y", "@robraux/retellai-mcp-server"],
      "env": {
        "RETELL_API_KEY": "<your_retellai_token>",
        // Optional: Only needed for Test Case Definition tools (undocumented API)
        "RETELL_UNDOCUMENTED_BEARER_TOKEN": "<your_bearer_token>",
        "RETELL_UNDOCUMENTED_ORG_ID": "<your_workspace_org_id>"
      }
    }
  }
}
```

## Environment Variables

The RetellAI MCP server uses a two-tier authentication system:

### Required: Standard API Key
- **`RETELL_API_KEY`**: Your RetellAI API key for all documented APIs
- Get this from: [RetellAI Dashboard > API Key](https://dashboard.retellai.com/apiKey)
- Required for: All 31 documented tools (calls, agents, phone numbers, voices, LLMs, knowledge bases)

### Optional: Undocumented API Credentials
- **`RETELL_UNDOCUMENTED_BEARER_TOKEN`**: Bearer token for undocumented APIs
- **`RETELL_UNDOCUMENTED_ORG_ID`**: Your workspace/organization ID
- Required for: Only the 4 Test Case Definition tools (simulation testing)
- **These are completely optional** - the server works perfectly without them

#### How to Find Undocumented Credentials

If you want to use the Test Case Definition tools, you can find these values using your browser's Developer Tools:

1. **Open Browser DevTools**: Press F12 or right-click and select "Inspect"
2. **Go to Network Tab**: Click the "Network" tab in DevTools
3. **Login to RetellAI**: Navigate to your specific workspace in the [RetellAI Dashboard](https://dashboard.retellai.com)
4. **Monitor Network Requests**: Look for API requests to `api.retellai.com`
5. **Find Headers**: Look for requests that include both:
   - `Authorization: Bearer <token>` (this is your `RETELL_UNDOCUMENTED_BEARER_TOKEN`)
   - `Orgid: org_<id>` (this is your `RETELL_UNDOCUMENTED_ORG_ID`)

**Note**: The Org ID is your Workspace ID and follows the format `org_XXXXXXXXXXXXXXXXXXXXXXXX`

## Example use cases:

1. List all the numbers I have in retellai
2. List all the agents I have
3. Tell me more about pizza delivery agent
4. Creating agent and calling example:
   1. Create an agent that calls my local pizza shop, make sure to keep the conversation short and to the point.
   2. Order a margeritta pizza
   3. Payment will be done by cash on delivery
   4. Send it to <address>
   5. The agent should pretend to be me. My name is <your_name>
   6. Make an outbound call to my local pizza shop at <phone_number>, using the usa number

## Repo Setup

1. Install dependencies:

   ```bash
   npm i
   ```

2. Create a `.env` file with your RetellAI API key:

   ```
   RETELL_API_KEY=your_api_key_here
   ```

3. Run the server:
   ```bash
   node src/retell/index.js
   ```

## Available Tools

### Call Tools

- `list_calls`: Lists all Retell calls
- `create_phone_call`: Creates a new phone call
- `create_web_call`: Creates a new web call
- `get_call`: Gets details of a specific call
- `update_call`: Updates call metadata and variables
- `delete_call`: Deletes a specific call
- `create_batch_call`: Creates batch call campaigns

### Agent Tools

- `list_agents`: Lists all Retell agents
- `create_agent`: Creates a new Retell agent
- `get_agent`: Gets a Retell agent by ID
- `update_agent`: Updates an existing Retell agent
- `delete_agent`: Deletes a Retell agent
- `get_agent_versions`: Gets all versions of a Retell agent
- `publish_agent`: Publishes agent versions

### Phone Number Tools

- `list_phone_numbers`: Lists all Retell phone numbers
- `create_phone_number`: Creates a new phone number
- `get_phone_number`: Gets details of a specific phone number
- `update_phone_number`: Updates a phone number
- `delete_phone_number`: Deletes a phone number
- `import_phone_number`: Imports external phone numbers

### Voice Tools

- `list_voices`: Lists all available Retell voices
- `get_voice`: Gets details of a specific voice

### Retell LLM Tools

- `list_retell_llms`: Lists all LLM configurations
- `create_retell_llm`: Creates new LLM setups
- `get_retell_llm`: Retrieves LLM configuration
- `update_retell_llm`: Updates LLM settings
- `delete_retell_llm`: Removes LLM configurations

### Knowledge Base Tools

- `list_knowledge_bases`: Lists all knowledge bases
- `create_knowledge_base`: Creates new knowledge bases
- `get_knowledge_base`: Retrieves knowledge base details
- `update_knowledge_base`: Updates knowledge base properties
- `delete_knowledge_base`: Removes knowledge bases
- `create_knowledge_base_document`: Adds documents to knowledge bases

### Test Case Definition Tools (Undocumented API)

- `list_test_case_definitions`: Lists test case definitions for a specific Retell LLM
- `create_test_case_definition`: Creates new test case definitions for simulation testing
- `update_test_case_definition`: Updates existing test case definitions (full replacement)
- `delete_test_case_definition`: Deletes test case definitions by ID

**Note**: These tools access undocumented RetellAI APIs using direct HTTP calls via the SDK's underlying APIClient. They enable simulation testing of voice agents with support for 9 LLM models including GPT-4o, Claude-3.5-Sonnet, and Gemini-2.0-Flash.

