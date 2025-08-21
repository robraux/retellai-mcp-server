import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import Retell from "retell-sdk";

import {
  ListTestCaseDefinitionsInputSchema,
  CreateTestCaseDefinitionInputSchema,
  UpdateTestCaseDefinitionInputSchema,
  DeleteTestCaseDefinitionInputSchema,
} from "../schemas/index.js";
import {
  transformListTestCaseDefinitionsInput,
  transformCreateTestCaseDefinitionInput,
  transformUpdateTestCaseDefinitionInput,
  transformTestCaseDefinitionOutput,
} from "../transformers/index.js";
import { createToolHandler } from "./utils.js";
import { createUndocumentedHttpClient } from "../utils/undocumented-http-client.js";


export const registerTestCaseDefinitionTools = (server: McpServer, retellClient: Retell) => {
  // Create HTTP client for undocumented APIs (separate from retellClient)
  const httpClient = createUndocumentedHttpClient();
  server.tool(
    "list_test_case_definitions",
    "Lists test case definitions for a specific Retell LLM",
    ListTestCaseDefinitionsInputSchema.shape,
    createToolHandler(async (data) => {
      try {
        const queryParams = transformListTestCaseDefinitionsInput(data);
        
        const testCases = await httpClient.get("/list-test-case-definitions", {
          query: queryParams
        });
        
        return Array.isArray(testCases) 
          ? testCases.map(transformTestCaseDefinitionOutput)
          : [];
      } catch (error: any) {
        throw error;
      }
    })
  );

  server.tool(
    "create_test_case_definition",
    "Creates a new test case definition for simulation testing",
    CreateTestCaseDefinitionInputSchema.shape,
    createToolHandler(async (data) => {
      try {
        const createTestCaseDto = transformCreateTestCaseDefinitionInput(data);
        
        const testCase = await httpClient.post("/create-test-case-definition", {
          body: createTestCaseDto
        });
        return transformTestCaseDefinitionOutput(testCase);
      } catch (error: any) {
        throw error;
      }
    })
  );

  server.tool(
    "update_test_case_definition",
    "Updates an existing test case definition (full replacement)",
    UpdateTestCaseDefinitionInputSchema.shape,
    createToolHandler(async (data) => {
      try {
        const testCaseId = data.test_case_definition_id;
        const updateTestCaseDto = transformUpdateTestCaseDefinitionInput(data);
        
        const updatedTestCase = await httpClient.put(
          `/update-test-case-definition/${testCaseId}`,
          { 
            body: updateTestCaseDto
          }
        );
        return transformTestCaseDefinitionOutput(updatedTestCase);
      } catch (error: any) {
        throw error;
      }
    })
  );

  server.tool(
    "delete_test_case_definition",
    "Deletes a test case definition by ID",
    DeleteTestCaseDefinitionInputSchema.shape,
    createToolHandler(async (data) => {
      try {
        const testCaseId = data.test_case_definition_id;
        
        await httpClient.delete(`/delete-test-case-definition/${testCaseId}`);
        return { 
          success: true, 
          message: `Test case definition ${testCaseId} deleted successfully` 
        };
      } catch (error: any) {
        throw error;
      }
    })
  );
};

// Export for testing purposes
export { createUndocumentedHttpClient };