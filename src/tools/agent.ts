import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import Retell from "retell-sdk";

import {
  CreateAgentInputSchema,
  GetAgentInputSchema,
  UpdateAgentInputSchema,
  PublishAgentInputSchema,
} from "../schemas/index.js";
import {
  transformAgentInput,
  transformAgentOutput,
  transformUpdateAgentInput,
  transformPublishAgentInput,
  transformPublishAgentOutput,
} from "../transformers/index.js";
import { createToolHandler } from "./utils.js";

export const registerAgentTools = (server: McpServer, retellClient: Retell) => {
  server.tool(
    "list_agents",
    "Lists all Retell agents",
    {},
    createToolHandler(async () => {
      const agents = await retellClient.agent.list();
      return agents.map(transformAgentOutput);
    })
  );

  server.tool(
    "create_agent",
    "Creates a new Retell agent",
    CreateAgentInputSchema.shape,
    createToolHandler(async (data) => {
      try {
        const createAgentDto = transformAgentInput(data);
        
        // Check if we need to create an LLM first (inline configuration)
        if (createAgentDto.response_engine && !('llm_id' in createAgentDto.response_engine)) {
          // Inline LLM configuration - create the LLM first
          const llmConfig = createAgentDto.response_engine;
          
          // Create the LLM with the inline configuration
          const createdLLM = await retellClient.llm.create({
            model: llmConfig.model,
            s2s_model: llmConfig.s2s_model,
            model_temperature: llmConfig.model_temperature,
            model_high_priority: llmConfig.model_high_priority,
            tool_call_strict_mode: llmConfig.tool_call_strict_mode,
            general_prompt: llmConfig.general_prompt,
            general_tools: llmConfig.general_tools,
            states: llmConfig.states,
            starting_state: llmConfig.starting_state,
            begin_message: llmConfig.begin_message,
            default_dynamic_variables: llmConfig.default_dynamic_variables,
            knowledge_base_ids: llmConfig.knowledge_base_ids,
          });
          
          // Update the agent DTO to reference the created LLM
          createAgentDto.response_engine = {
            type: "retell-llm",
            llm_id: createdLLM.llm_id,
            version: createdLLM.version || 0,
          };
        }
        
        // Ensure response_engine is always a reference type for agent creation
        if (createAgentDto.response_engine && !('llm_id' in createAgentDto.response_engine)) {
          throw new Error("Internal error: Agent creation should only use LLM references");
        }
        
        // Type cast to ensure TypeScript understands this is a valid agent creation payload
        const agent = await retellClient.agent.create(createAgentDto as any);
        return transformAgentOutput(agent);
      } catch (error: any) {
        console.error(`Error creating agent: ${error.message}`);
        throw error;
      }
    })
  );

  server.tool(
    "get_agent",
    "Gets a Retell agent by ID",
    GetAgentInputSchema.shape,
    createToolHandler(async (data) => {
      try {
        const agent = await retellClient.agent.retrieve(data.agentId);
        if (!agent) {
          throw new Error(`Agent with ID ${data.agentId} not found`);
        }
        return transformAgentOutput(agent);
      } catch (error: any) {
        console.error(`Error getting agent: ${error.message}`);
        throw error;
      }
    })
  );

  server.tool(
    "update_agent",
    "Updates an existing Retell agent",
    UpdateAgentInputSchema.shape,
    createToolHandler(async (data) => {
      try {
        const agentId = data.agentId;
        const updateAgentDto = transformUpdateAgentInput(data);

        // Check if we need to handle inline LLM configuration updates
        if (updateAgentDto.response_engine && !('llm_id' in updateAgentDto.response_engine)) {
          // Inline LLM configuration update
          const llmConfig = updateAgentDto.response_engine;
          
          // Get the current agent to find the existing LLM ID
          const currentAgent = await retellClient.agent.retrieve(agentId);
          const currentLLMId = currentAgent.response_engine && 'llm_id' in currentAgent.response_engine 
            ? currentAgent.response_engine.llm_id 
            : null;
          
          if (currentLLMId) {
            // Update the existing LLM
            const updateLLMData: any = {};
            if (llmConfig.model !== undefined) updateLLMData.model = llmConfig.model;
            if (llmConfig.s2s_model !== undefined) updateLLMData.s2s_model = llmConfig.s2s_model;
            if (llmConfig.model_temperature !== undefined) updateLLMData.model_temperature = llmConfig.model_temperature;
            if (llmConfig.model_high_priority !== undefined) updateLLMData.model_high_priority = llmConfig.model_high_priority;
            if (llmConfig.tool_call_strict_mode !== undefined) updateLLMData.tool_call_strict_mode = llmConfig.tool_call_strict_mode;
            if (llmConfig.general_prompt !== undefined) updateLLMData.general_prompt = llmConfig.general_prompt;
            if (llmConfig.general_tools !== undefined) updateLLMData.general_tools = llmConfig.general_tools;
            if (llmConfig.states !== undefined) updateLLMData.states = llmConfig.states;
            if (llmConfig.starting_state !== undefined) updateLLMData.starting_state = llmConfig.starting_state;
            if (llmConfig.begin_message !== undefined) updateLLMData.begin_message = llmConfig.begin_message;
            if (llmConfig.default_dynamic_variables !== undefined) updateLLMData.default_dynamic_variables = llmConfig.default_dynamic_variables;
            if (llmConfig.knowledge_base_ids !== undefined) updateLLMData.knowledge_base_ids = llmConfig.knowledge_base_ids;
            
            // Update the LLM
            await retellClient.llm.update(currentLLMId, updateLLMData);
            
            // Remove the response_engine from agent update since we handled it separately
            delete updateAgentDto.response_engine;
          } else {
            // No existing LLM, create a new one
            const createdLLM = await retellClient.llm.create({
              model: llmConfig.model,
              s2s_model: llmConfig.s2s_model,
              model_temperature: llmConfig.model_temperature,
              model_high_priority: llmConfig.model_high_priority,
              tool_call_strict_mode: llmConfig.tool_call_strict_mode,
              general_prompt: llmConfig.general_prompt || "You are a helpful agent",
              general_tools: llmConfig.general_tools,
              states: llmConfig.states,
              starting_state: llmConfig.starting_state,
              begin_message: llmConfig.begin_message,
              default_dynamic_variables: llmConfig.default_dynamic_variables,
              knowledge_base_ids: llmConfig.knowledge_base_ids,
            });
            
            // Update the agent to reference the new LLM
            updateAgentDto.response_engine = {
              type: "retell-llm",
              llm_id: createdLLM.llm_id,
              version: createdLLM.version || 0,
            };
          }
        }

        // Update the agent
        const updatedAgent = await retellClient.agent.update(
          agentId,
          updateAgentDto
        );

        return transformAgentOutput(updatedAgent);
      } catch (error: any) {
        console.error(`Error updating agent: ${error.message}`);
        throw error;
      }
    })
  );

  server.tool(
    "delete_agent",
    "Deletes a Retell agent",
    GetAgentInputSchema.shape,
    createToolHandler(async (data) => {
      try {
        await retellClient.agent.delete(data.agentId);
        return {
          success: true,
          message: `Agent ${data.agentId} deleted successfully`,
        };
      } catch (error: any) {
        console.error(`Error deleting agent: ${error.message}`);
        throw error;
      }
    })
  );

  server.tool(
    "get_agent_versions",
    "Gets all versions of a Retell agent",
    GetAgentInputSchema.shape,
    createToolHandler(async (data) => {
      try {
        const versions = await retellClient.agent.getVersions(data.agentId);
        return versions;
      } catch (error: any) {
        console.error(`Error getting agent versions: ${error.message}`);
        throw error;
      }
    })
  );

  server.tool(
    "publish_agent",
    "Publishes an agent version",
    PublishAgentInputSchema.shape,
    createToolHandler(async (data) => {
      try {
        const publishData = transformPublishAgentInput(data);
        const result = await retellClient.agent.publish(data.agentId, publishData);
        return transformPublishAgentOutput(result);
      } catch (error: any) {
        console.error(`Error publishing agent: ${error.message}`);
        throw error;
      }
    })
  );
};
