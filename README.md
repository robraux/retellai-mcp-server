# RetellAI MCP Server

This is a Model Context Protocol (MCP) server implementation for RetellAI, allowing AI assistants to interact with RetellAI's voice services.

## Features

The RetellAI MCP server provides tools for:

- **Call Management**: Create and manage phone calls and web calls
- **Agent Management**: Create and manage voice agents with different LLM configurations
- **Phone Number Management**: Provision and configure phone numbers
- **Voice Management**: Access and use different voice options

## Setup

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
- `delete_call`: Deletes a specific call

### Agent Tools

- `list_agents`: Lists all Retell agents
- `create_agent`: Creates a new Retell agent
- `get_agent`: Gets a Retell agent by ID
- `update_agent`: Updates an existing Retell agent
- `delete_agent`: Deletes a Retell agent
- `get_agent_versions`: Gets all versions of a Retell agent

### Phone Number Tools

- `list_phone_numbers`: Lists all Retell phone numbers
- `create_phone_number`: Creates a new phone number
- `get_phone_number`: Gets details of a specific phone number
- `update_phone_number`: Updates a phone number
- `delete_phone_number`: Deletes a phone number

### Voice Tools

- `list_voices`: Lists all available Retell voices
- `get_voice`: Gets details of a specific voice

## License

MIT
