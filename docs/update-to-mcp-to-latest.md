# Task: Update Retell.ai  MCP Server to Match Current API Specification

## Objective
Review and update the Retell.ai MCP (Model Context Protocol) server implementation to ensure complete alignment with the current Retell API documentation. This includes updating existing endpoints, adding missing endpoints, and ensuring all request/response schemas match the latest OpenAPI.

## Context
- **Project Type**: TypeScript MCP server for Retell.ai API integration
- **Current State**: Server has existing API implementations that are outdated
- **Target State**: Full parity with current Retell.ai API as documented in their spec
- **Architecture**: Standard MCP server pattern with schema tools and transformers

## Step-by-Step Instructions

### Phase 1: Discovery and Analysis

1. **Locate and Parse Current Implementation**
   - Find all files containing API endpoint definitions.
   - Identify the pattern used for defining MCP tools (function definitions, schemas, handlers)
   - Create a map of currently implemented endpoints with their:
     - Tool name
     - HTTP method and path
     - Request parameters/body schema
     - Response schema
     - Error handling

2. **Parse API Specification**
   - Load the current Retell.ai OpenAPI specification.
   - Extract all endpoints with their:
     - Operation IDs
     - HTTP methods and paths
     - Request schemas (parameters, query strings, request bodies)
     - Response schemas (success and error responses)
     - Authentication requirements
     - Rate limiting or special headers

3. **Create Comparison Matrix**
   - Build a comprehensive comparison showing:
     - Endpoints that exist in both (need updating)
     - Endpoints only in API documentation (need adding)
     - Endpoints only in MCP server (potentially deprecated)
     - Endpoints that will be are unchanged (MCP and API docs are in sync)
     - Endpoints that are deprecated (if any)
   - For existing endpoints, identify specific differences in:
     - Parameter names or types
     - Required vs optional fields
     - Response structure changes
     - New error codes or validation rules

### Phase 2: Implementation Updates

4. **Update Existing Endpoints**
   For each endpoint requiring updates:
   - Preserve the existing MCP tool naming convention
   - Update the TypeScript schema to match API docs exactly
   - Update the handler implementation if business logic changed
   - Ensure proper TypeScript types are generated/updated
   - Maintain backward compatibility where reasonable (deprecation warnings for removed fields)

5. **Add New Endpoints**
   For each new endpoint in the OpenAPI spec:
   - Follow the existing naming pattern in the MCP server
   - Create complete tool definition with:
     - Descriptive name following existing convention
     - Clear description from OpenAPI
     - Complete parameter schema
     - Proper error handling

6. **Handle Deprecated Endpoints**
   - Mark deprecated endpoints with clear warnings
   - Add deprecation notices in descriptions
   - Consider keeping for backward compatibility with warnings
   - Document migration path in comments

### Phase 3: Schema and Type Updates

7. **Update TypeScript Types**
   - Regenerate or update TypeScript interfaces from OpenAPI schemas
   - Ensure all request/response types are properly typed
   - Update any shared types or enums
   - Verify type imports and exports are correct

8. **Update Validation Logic**
   - Ensure parameter validation matches OpenAPI requirements
   - Add new validation rules for:
     - Format constraints (email, URL, UUID, etc.)
     - Numeric ranges (minimum, maximum)
     - String patterns (regex)
     - Array constraints (minItems, maxItems)
   - Update error messages to be helpful and specific

### Phase 4: Testing and Documentation

9. **Update Tests**
   - Update existing tests for modified endpoints
   - Add tests for new endpoints
   - Ensure test coverage for:
     - Happy path scenarios
     - Error conditions
     - Edge cases (optional parameters, limits)
     - Schema validation

10. **Update Documentation**
    - Update README with new endpoints
    - Document any breaking changes
    - Add migration guide if needed
    - Update example usage

## Implementation Guidelines

### Code Style
- Maintain existing code style and formatting
- Use consistent naming conventions
- Follow existing error handling patterns
- Preserve existing logging/debugging approaches

### Error Handling
- Map HTTP status codes to appropriate MCP error types
- Preserve error context and messages from API
- Add request ID or correlation ID where available
- Ensure errors are actionable for users

### Special Considerations
- **Authentication**: Ensure API keys/tokens are properly handled, use existing authentication patterns
- **Rate Limiting**: Respect and communicate rate limits
- **Pagination**: Implement consistent pagination patterns
- **Streaming**: Handle any streaming endpoints appropriately
- **File Operations**: Properly handle multipart/binary data if present

## Output Requirements

1. **Modified Files**: Update all relevant TypeScript files in place
2. **New Files**: Create any new files following existing structure, if unsure ask the user
3. **Change Summary**: Create a CHANGES.md file documenting:
   - Breaking changes
   - New endpoints added
   - Endpoints modified
   - Deprecated endpoints
4. **Validation Report**: Generate a report showing:
   - Total endpoints in API spec
   - Successfully updated endpoints
   - Successfully added endpoints
   - Any endpoints that couldn't be updated and why

## Verification Steps

After implementation:
1. Ensure TypeScript compilation succeeds without errors
2. Verify all MCP tools are properly registered
3. Test that the server starts successfully
4. Run any existing test suite

## Priority Order

Process endpoints in this order:
1. Core/Essential endpoints (authentication, user management)
2. Frequently used endpoints (based on existing usage patterns)
3. New feature endpoints
4. Utility/Administrative endpoints
5. Deprecated endpoint handling

Remember: The goal is complete API parity while maintaining the MCP server's usability and reliability. When in doubt, preserve existing behavior while adding new capabilities.