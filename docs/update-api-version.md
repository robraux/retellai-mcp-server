# Update Retell SDK API Version

This document provides instructions for updating the Retell SDK to the latest version and downloading the corresponding OpenAPI specification.

## Phase 1: Version Comparison

### Step 1: Get Current Version
Use the Read tool on @package.json and extract the value of `dependencies.retell-sdk` (e.g., "4.41.0").

### Step 2: Get Latest Released Version
Use WebFetch tool to fetch https://github.com/RetellAI/retell-typescript-sdk/releases and extract the most recent version number from the releases page. The version will be in format "vX.Y.Z" (e.g., "v4.43.0"). Remove the "v" prefix for comparison.

### Step 3: Report Version Information
Output the following format exactly:
```
Current version: X.Y.Z
Latest version: X.Y.Z
Status: [VERSIONS_MATCH | UPDATE_AVAILABLE]
```

### Step 4: Await User Approval
If Status is UPDATE_AVAILABLE, output:
```
Would you like to proceed with downloading the OpenAPI specification for version X.Y.Z?
```
Then STOP and wait for explicit user confirmation containing "yes", "proceed", "approved", or similar affirmative response.

## Phase 2: OpenAPI Specification Download (ONLY IF APPROVED)

### Step 5: Construct Stats File URL
Build the URL as follows:
- Base URL: `https://github.com/RetellAI/retell-typescript-sdk/blob/`
- Add: `v` + latest_version + `/.stats.yml`
- Example: For version 4.43.0, the URL would be: `https://github.com/RetellAI/retell-typescript-sdk/blob/v4.43.0/.stats.yml`

### Step 6: Fetch Stats File
Use WebFetch tool on the constructed URL from Step 5. Extract the value of the `openapi_spec_url` key from the YAML content. This URL typically looks like:
`https://storage.googleapis.com/stainless-sdk-openapi-specs/retell%2F[hash].yml`

### Step 7: Download OpenAPI Specification
Use WebFetch tool on the URL obtained in Step 6 to download the actual OpenAPI specification content.

### Step 8: Save OpenAPI Specification
Convert version format for filename:
- Replace all dots (.) with underscores (_)
- Example: 4.43.0 becomes 4_43_0

Use Write tool to save the downloaded content to:
@docs/openapi-specs/[converted_version].yml

Example: For version 4.43.0, save to @docs/openapi-specs/4_43_0.yml

### Step 9: Report Completion
Output the following format:
```
✅ OpenAPI specification saved successfully
File: @docs/openapi-specs/[converted_version].yml
Version: [latest_version]
Migration: [current_version] → [latest_version]
```

## Error Handling

### If GitHub releases page is unavailable:
Output: "ERROR: Unable to fetch GitHub releases. Please check network connectivity or try again later."

### If .stats.yml file not found:
Output: "ERROR: Stats file not found for version [version]. The release may not have a published OpenAPI spec."

### If OpenAPI spec URL is invalid or download fails:
Output: "ERROR: Failed to download OpenAPI specification from [url]. The specification may have been moved or removed."

### If file write fails:
Output: "ERROR: Unable to save OpenAPI specification to @docs/openapi-specs/. Please check directory permissions."

## Notes
- Always wait for explicit approval before downloading files
- Preserve the exact YAML structure when saving the OpenAPI specification
- Do not modify the downloaded OpenAPI specification content
- Keep previous version files in @docs/openapi-specs/ unless explicitly instructed to remove them