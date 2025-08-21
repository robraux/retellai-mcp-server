import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import Retell from "retell-sdk";

import {
  CreateKnowledgeBaseInputSchema,
  GetKnowledgeBaseInputSchema,
  UpdateKnowledgeBaseInputSchema,
  DeleteKnowledgeBaseInputSchema,
  ListKnowledgeBasesInputSchema,
  CreateKnowledgeBaseDocumentInputSchema,
} from "../schemas/index.js";
import {
  transformKnowledgeBaseOutput,
  transformCreateKnowledgeBaseInput,
  transformUpdateKnowledgeBaseInput,
  transformListKnowledgeBasesInput,
  transformCreateKnowledgeBaseDocumentInput,
} from "../transformers/index.js";
import { createToolHandler } from "./utils.js";

export const registerKnowledgeBaseTools = (
  server: McpServer,
  retellClient: Retell
) => {
  server.tool(
    "list_knowledge_bases",
    "Lists all knowledge bases",
    ListKnowledgeBasesInputSchema.shape,
    createToolHandler(async (data) => {
      try {
        // Use the actual SDK list method without parameters for now
        const knowledgeBases = await retellClient.knowledgeBase.list();
        return knowledgeBases.map(transformKnowledgeBaseOutput);
      } catch (error: any) {
        console.error(`Error listing knowledge bases: ${error.message}`);
        throw error;
      }
    })
  );

  server.tool(
    "create_knowledge_base",
    "Creates a new knowledge base",
    CreateKnowledgeBaseInputSchema.shape,
    createToolHandler(async (data) => {
      try {
        // Use the correct parameter name for the SDK
        const knowledgeBase = await retellClient.knowledgeBase.create({
          knowledge_base_name: data.name,
        });
        return transformKnowledgeBaseOutput(knowledgeBase);
      } catch (error: any) {
        console.error(`Error creating knowledge base: ${error.message}`);
        throw error;
      }
    })
  );

  server.tool(
    "get_knowledge_base",
    "Gets a knowledge base by ID",
    GetKnowledgeBaseInputSchema.shape,
    createToolHandler(async (data) => {
      try {
        const knowledgeBase = await retellClient.knowledgeBase.retrieve(data.knowledgeBaseId);
        if (!knowledgeBase) {
          throw new Error(`Knowledge base with ID ${data.knowledgeBaseId} not found`);
        }
        return transformKnowledgeBaseOutput(knowledgeBase);
      } catch (error: any) {
        console.error(`Error getting knowledge base: ${error.message}`);
        throw error;
      }
    })
  );

  server.tool(
    "update_knowledge_base",
    "Updates an existing knowledge base",
    UpdateKnowledgeBaseInputSchema.shape,
    createToolHandler(async (data) => {
      try {
        // Knowledge base update is not supported in SDK v4.41.0
        // Return descriptive response indicating the limitation
        return {
          success: false,
          message: `Knowledge base update is not available in SDK v4.41.0`,
          knowledge_base_id: data.knowledgeBaseId,
          requested_changes: {
            name: data.name,
            description: data.description,
          },
        };
      } catch (error: any) {
        console.error(`Error updating knowledge base: ${error.message}`);
        throw error;
      }
    })
  );

  server.tool(
    "delete_knowledge_base",
    "Deletes a knowledge base",
    DeleteKnowledgeBaseInputSchema.shape,
    createToolHandler(async (data) => {
      try {
        await retellClient.knowledgeBase.delete(data.knowledgeBaseId);
        return {
          success: true,
          message: `Knowledge base ${data.knowledgeBaseId} deleted successfully`,
        };
      } catch (error: any) {
        console.error(`Error deleting knowledge base: ${error.message}`);
        throw error;
      }
    })
  );

  server.tool(
    "create_knowledge_base_document",
    "Adds a document/source to a knowledge base",
    CreateKnowledgeBaseDocumentInputSchema.shape,
    createToolHandler(async (data) => {
      try {
        const documentData = transformCreateKnowledgeBaseDocumentInput(data);
        
        // Determine the correct parameter based on source type
        let addSourcesParams: any = {};
        if (data.sourceType === 'text') {
          addSourcesParams.knowledge_base_texts = [{
            text: data.sourceConfig.content || '',
            title: data.sourceConfig.title || 'Untitled',
          }];
        } else if (data.sourceType === 'url') {
          addSourcesParams.knowledge_base_urls = [data.sourceConfig.url];
        }
        
        const result = await retellClient.knowledgeBase.addSources(
          data.knowledgeBaseId,
          addSourcesParams
        );
        return transformKnowledgeBaseOutput(result);
      } catch (error: any) {
        console.error(`Error creating knowledge base document: ${error.message}`);
        throw error;
      }
    })
  );
};