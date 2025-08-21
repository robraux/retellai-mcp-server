# Task: Update Retell.ai MCP Server to Match Target API Specification

## Objective
Review and update the Retell.ai MCP (Model Context Protocol) server implementation to ensure complete alignment with a specific target version of the Retell API documentation. This includes verifying prerequisites, analyzing version differences, updating existing endpoints, adding missing endpoints, and ensuring all request/response schemas match the target OpenAPI specification.

## Context
- **Project Type**: TypeScript MCP server for Retell.ai API integration
- **Current State**: Server has existing API implementations that may be outdated
- **Target State**: Full parity with a specific target version of Retell.ai API
- **Architecture**: Standard MCP server pattern with schema tools and transformers

## Prerequisites
This task requires that the `update-api-version.md` process has been completed first to download the necessary OpenAPI specifications.

## Step-by-Step Instructions

### Phase 1: Version Verification and Target Selection

1. **Check Current SDK Version**
   - Read @package.json and extract the value of `dependencies.retell-sdk` (e.g., "4.41.0")
   - Store this as the current_version

2. **Prompt for Target Version**
   - Output: "Current retell-sdk version: X.Y.Z"
   - Ask: "What version would you like to update to? (e.g., 4.43.0)"
   - STOP and wait for user to provide the target version

3. **Verify OpenAPI Spec Files Exist**
   - Convert versions to filename format (dots to underscores):
     - Current: 4.41.0 → 4_41_0
     - Target: 4.43.0 → 4_43_0
   - Check for existence of both files:
     - @docs/openapi-specs/[current_version].yml
     - @docs/openapi-specs/[target_version].yml
   - If either file is missing:
     ```
     ERROR: Missing required OpenAPI specification files

     Required files:
     - @docs/openapi-specs/[current_version].yml [EXISTS/MISSING]
     - @docs/openapi-specs/[target_version].yml [EXISTS/MISSING]

     Please run the update-api-version.md process first to download the missing specification(s).
     ```
     STOP execution if files are missing

4. **Confirm Update Scope**
   - Output:
     ```
     Ready to update MCP server:
     From version: [current_version]
     To version: [target_version]

     This will:
     1. Analyze differences between OpenAPI specifications
     2. Update existing endpoint implementations
     3. Add new endpoints
     4. Update package.json dependency

     Proceed with update? (yes/no)
     ```
   - STOP and wait for user confirmation

### Phase 2: Specification Analysis and Comparison

5. **Load and Parse OpenAPI Specifications**
   - Load both OpenAPI spec files:
     - Current: @docs/openapi-specs/[current_version].yml
     - Target: @docs/openapi-specs/[target_version].yml
   - Parse both specifications to extract all endpoints

6. **Generate Detailed Diff Report**
   Create a comprehensive comparison showing:
   - **New Endpoints**: Endpoints only in target spec
   - **Removed Endpoints**: Endpoints only in current spec (potentially deprecated)
   - **Modified Endpoints**: Endpoints in both with changes to:
     - Request parameters (added/removed/modified)
     - Request body schema changes
     - Response schema changes
     - Authentication changes
     - New error codes
   - **Unchanged Endpoints**: Identical in both versions

   Output format:
   ```
   OpenAPI Specification Comparison
   =================================
   Current Version: [current_version]
   Target Version: [target_version]

   Summary:
   - New endpoints: X
   - Modified endpoints: Y
   - Removed endpoints: Z
   - Unchanged endpoints: W

   Detailed Changes:
   [List each category with specific endpoints and changes]
   ```

7. **Analyze Current MCP Implementation**
   - Find all files containing API endpoint definitions
   - Identify the pattern used for defining MCP tools
   - Create a map of currently implemented endpoints
   - Cross-reference with the OpenAPI diff to determine:
     - Which implementations need updating
     - Which new implementations need creation
     - Which implementations might be deprecated

### Phase 3: Implementation Updates

8. **Update package.json**
   - Update the retell-sdk dependency to the target version:
     ```json
     "retell-sdk": "^[target_version]"
     ```
   - Run npm install to update the dependency

9. **Update Existing Endpoints**
   For each endpoint requiring updates (based on diff analysis):
   - Preserve the existing MCP tool naming convention
   - Update the TypeScript schema to match target API docs exactly
   - Update the handler implementation if business logic changed
   - Ensure proper TypeScript types are generated/updated
   - Add migration comments for breaking changes

10. **Add New Endpoints**
    For each new endpoint in the target OpenAPI spec:
    - Follow the existing naming pattern in the MCP server
    - Create complete tool definition with:
      - Descriptive name following existing convention
      - Clear description from OpenAPI
      - Complete parameter schema
      - Proper error handling
      - Type definitions matching the target spec

11. **Handle Deprecated Endpoints**
    For endpoints removed in target spec:
    - Mark deprecated endpoints with clear warnings
    - Add deprecation notices in descriptions
    - Consider keeping for backward compatibility with warnings
    - Document migration path in comments

### Phase 4: Schema and Type Updates

12. **Update TypeScript Types**
    - Update TypeScript interfaces from target OpenAPI schemas
    - Ensure all request/response types are properly typed
    - Update any shared types or enums
    - Verify type imports and exports are correct
    - Ensure compatibility with new SDK version

13. **Update Validation Logic**
    - Ensure parameter validation matches target OpenAPI requirements
    - Update validation rules for:
      - Format constraints (email, URL, UUID, etc.)
      - Numeric ranges (minimum, maximum)
      - String patterns (regex)
      - Array constraints (minItems, maxItems)
    - Update error messages to be helpful and specific

### Phase 5: Documentation

14. **Update Documentation**
    - Create CHANGES.md with migration details:
      ```markdown
      # Changes from [current_version] to [target_version]

      ## Breaking Changes
      [List any breaking changes]

      ## New Features
      [List new endpoints added]

      ## Modified Endpoints
      [List endpoints with changes]

      ## Deprecated Features
      [List deprecated endpoints]

      ## Migration Guide
      [Provide migration instructions if needed]
      ```
    - Update README with new endpoints
    - Update example usage if needed

### Phase 6: Verification

15. **Generate Final Report**
    Output a validation report:
    ```
    Update Complete: [current_version] → [target_version]
    ================================================

    Statistics:
    - Total endpoints in target spec: X
    - Successfully updated endpoints: Y
    - Successfully added endpoints: Z
    - Deprecated endpoints handled: W
    - Package.json updated: ✓

    Next Steps:
    1. Run `npm install` to install updated dependencies
    2. Run `npm run build` to compile the updated server
    3. Run `npm run inspector` to test the updated tools
    4. Review CHANGES.md for breaking changes
    ```

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

## Priority Order

Process endpoints in this order:
1. Core/Essential endpoints (authentication, user management)
2. Frequently used endpoints (based on existing usage patterns)
3. New feature endpoints
4. Utility/Administrative endpoints
5. Deprecated endpoint handling

## Error Recovery

If the update process fails at any point:
1. Document the exact point of failure
2. Preserve any partial updates in a branch or backup
3. Provide clear instructions for manual intervention
4. List specific files that were modified before failure

Remember: The goal is complete API parity with the target version while maintaining the MCP server's usability and reliability. Always validate version compatibility and ensure both OpenAPI specifications are available before proceeding with updates.