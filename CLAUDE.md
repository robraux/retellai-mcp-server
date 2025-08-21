# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

Build the TypeScript project:
```bash
npm run build
```

Watch for file changes during development:
```bash
npm run watch
```

Test the MCP server with the inspector:
```bash
npm run inspector
```

## Architecture Overview

This is a Model Context Protocol (MCP) server that provides tools for interacting with RetellAI's voice services API. The architecture follows a modular design:

### Core Components

- **MCP Server Entry Point** (`src/index.ts`): Initializes the MCP server with stdio transport, requires `RETELL_API_KEY` environment variable
- **Retell Client** (`src/client.ts`): Creates and configures the Retell SDK client instance
- **Tool Registration** (`src/tools/index.ts`): Central registration point for all tool categories

### Tool Categories

The server implements six main tool categories, each providing specific RetellAI functionality:

1. **Call Tools** (`src/tools/call.ts`): Phone and web call management, including batch campaigns
2. **Agent Tools** (`src/tools/agent.ts`): Voice agent creation, management, and publishing
3. **Phone Number Tools** (`src/tools/phone-number.ts`): Phone number provisioning and import
4. **Voice Tools** (`src/tools/voice.ts`): Voice selection and configuration
5. **Retell LLM Tools** (`src/tools/retell-llm.ts`): LLM configuration for agents
6. **Knowledge Base Tools** (`src/tools/knowledge-base.ts`): Knowledge base management and document handling

### Configuration

- TypeScript targets ES2022 with Node16 module resolution
- Strict mode enabled for type safety
- Build output goes to `./build` directory
- Source files in `./src` directory

### Environment Setup

Create a `.env` file with:
```
RETELL_API_KEY=your_api_key_here
```

The API key can be obtained from https://dashboard.retellai.com/apiKey

### MCP Integration

This server is designed to be used with Claude Desktop through the MCP configuration. It exposes RetellAI's capabilities as tools that can be invoked by the AI assistant to create voice agents, manage calls, configure phone numbers, and manage knowledge bases programmatically.

## Available Tools (31 total)

### Call Management (7 tools)
- `create_phone_call` - Initiate outbound phone calls
- `create_web_call` - Create web-based calls
- `get_call` - Retrieve call details by ID
- `list_calls` - List all calls with filtering
- `update_call` - Update call metadata and variables
- `delete_call` - Remove call records
- `create_batch_call` - Create batch call campaigns

### Agent Management (7 tools)
- `list_agents` - List all voice agents
- `create_agent` - Create new voice agents with full configuration
- `get_agent` - Retrieve agent details
- `update_agent` - Update agent configuration
- `delete_agent` - Remove agents
- `get_agent_versions` - List agent version history
- `publish_agent` - Publish agent versions

### Phone Number Management (6 tools)
- `list_phone_numbers` - List all phone numbers
- `create_phone_number` - Provision new phone numbers
- `get_phone_number` - Get phone number details
- `update_phone_number` - Update phone number settings
- `delete_phone_number` - Remove phone numbers
- `import_phone_number` - Import external phone numbers

### Voice Management (2 tools)
- `list_voices` - List available voices
- `get_voice` - Get voice details and previews

### Retell LLM Management (5 tools)
- `list_retell_llms` - List all LLM configurations
- `create_retell_llm` - Create new LLM setups
- `get_retell_llm` - Retrieve LLM configuration
- `update_retell_llm` - Update LLM settings
- `delete_retell_llm` - Remove LLM configurations

### Knowledge Base Management (6 tools)
- `list_knowledge_bases` - List all knowledge bases
- `create_knowledge_base` - Create new knowledge bases
- `get_knowledge_base` - Retrieve knowledge base details
- `update_knowledge_base` - Update knowledge base properties
- `delete_knowledge_base` - Remove knowledge bases
- `create_knowledge_base_document` - Add documents to knowledge bases

### Test Case Definition Management (4 tools)
- `list_test_case_definitions` - List test case definitions for a specific Retell LLM
- `create_test_case_definition` - Create new test case definitions for simulation testing
- `update_test_case_definition` - Update existing test case definitions (full replacement)
- `delete_test_case_definition` - Delete test case definitions by ID

## Enhanced Agent Configuration

Agents now support 25+ advanced configuration options including:
- Voice controls (temperature, speed, fallback voices)
- Conversation behavior (responsiveness, interruption sensitivity)
- Backchannel responses ("uh-huh", "yeah", custom words)
- Audio enhancements (ambient sounds, volume, denoising)
- Advanced features (webhooks, pronunciation dictionary, DTMF)
- Multi-language support (18 languages)
- Post-call analysis configuration
- Voicemail handling options

## Test Case Definition Features

The server now includes support for **undocumented RetellAI Test Case Definition APIs** that enable simulation testing of voice agents:

### Key Features:
- **Simulation Testing**: Create test cases that simulate user interactions with voice agents
- **LLM Integration**: Test cases are linked to specific Retell LLM configurations via `llm_id`
- **Model Override**: Override the LLM model (e.g., `gpt-4o`, `claude-3.5-sonnet`) for A/B testing
- **Dynamic Variables**: Flexible key-value pairs for test data injection
- **Success Metrics**: Define evaluation criteria as string arrays for test validation
- **Tool Mocking**: Support for mock tool responses during simulation testing

### Supported Models:
- `gpt-4o`, `gpt-4o-mini`
- `gpt-4.1`, `gpt-4.1-mini`, `gpt-4.1-nano`
- `claude-3.7-sonnet`, `claude-3.5-haiku`
- `gemini-2.0-flash`, `gemini-2.0-flash-lite`

### Implementation Note:
These tools use direct HTTP calls to undocumented RetellAI endpoints via the SDK's underlying APIClient, as the official SDK doesn't provide native support for test case definitions.