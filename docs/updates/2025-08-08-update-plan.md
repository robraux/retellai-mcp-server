# Retell.ai MCP Server Update Plan - August 8, 2025

## **Executive Summary**

This document outlines the comprehensive update plan to align the Retell.ai MCP server implementation with the current API specification. The analysis revealed 21 existing tools covering core functionality, but several important API endpoints and schema fields are missing.

## **Current Implementation Status**

### **Implemented MCP Tools** (21 tools total):

#### Agent Tools (6/8 endpoints)
- ✅ `list_agents` - Lists all Retell agents
- ✅ `create_agent` - Creates a new Retell agent
- ✅ `get_agent` - Gets a Retell agent by ID
- ✅ `update_agent` - Updates an existing Retell agent
- ✅ `delete_agent` - Deletes a Retell agent
- ✅ `get_agent_versions` - Gets all versions of a Retell agent
- ❌ `publish_agent` - Publishes an agent version (MISSING)
- ❌ Enhanced agent schema with all API fields (INCOMPLETE)

#### Call Tools (6/7 endpoints)
- ✅ `create_phone_call` - Creates a new phone call
- ✅ `create_web_call` - Creates a new web call
- ✅ `get_call` - Gets a call by ID
- ✅ `list_calls` - Lists all calls
- ✅ `update_call` - Updates an existing call
- ✅ `delete_call` - Deletes a call
- ❌ `create_batch_call` - Creates batch calls (MISSING)

#### Phone Number Tools (5/6 endpoints)
- ✅ `list_phone_numbers` - Lists all Retell phone numbers
- ✅ `create_phone_number` - Creates a new phone number
- ✅ `get_phone_number` - Gets details of a specific phone number
- ✅ `update_phone_number` - Updates a phone number
- ✅ `delete_phone_number` - Deletes a phone number
- ❌ `import_phone_number` - Imports external phone numbers (MISSING)

#### Voice Tools (2/2 endpoints)
- ✅ `list_voices` - Lists all available Retell voices
- ✅ `get_voice` - Gets details of a specific voice

#### Retell LLM Tools (5/5 endpoints)
- ✅ `list_retell_llms` - Lists all Retell LLMs
- ✅ `create_retell_llm` - Creates a new Retell LLM
- ✅ `get_retell_llm` - Gets a Retell LLM by ID
- ✅ `update_retell_llm` - Updates an existing Retell LLM
- ✅ `delete_retell_llm` - Deletes a Retell LLM

#### Knowledge Base Tools (0/6 endpoints)
- ❌ `create_knowledge_base` - Creates a new knowledge base (MISSING)
- ❌ `list_knowledge_bases` - Lists all knowledge bases (MISSING)
- ❌ `get_knowledge_base` - Gets a knowledge base by ID (MISSING)
- ❌ `update_knowledge_base` - Updates a knowledge base (MISSING)
- ❌ `delete_knowledge_base` - Deletes a knowledge base (MISSING)
- ❌ `create_knowledge_base_document` - Adds documents to knowledge base (MISSING)

## **Missing API Endpoints Analysis**

### 1. **Knowledge Base Endpoints** (Priority: HIGH)
**Status**: Completely missing - 0/6 implemented
**Impact**: Major functionality gap - Knowledge bases are core to Retell.ai agent capabilities
**API Endpoints**:
- `POST /create-knowledge-base`
- `GET /list-knowledge-bases` 
- `GET /get-knowledge-base/{knowledge_base_id}`
- `PATCH /update-knowledge-base/{knowledge_base_id}`
- `DELETE /delete-knowledge-base/{knowledge_base_id}`
- `POST /create-knowledge-base-document`

### 2. **Agent Management Extensions** (Priority: MEDIUM)
**Status**: Partially implemented
**Missing**:
- Agent publishing functionality
- Enhanced agent schema with 25+ missing fields

### 3. **Advanced Call Features** (Priority: MEDIUM)
**Status**: Basic call management implemented, batch calls missing
**Missing**:
- `POST /create-batch-call` - Bulk call campaign management

### 4. **Phone Number Management Extensions** (Priority: LOW)
**Status**: Core functionality complete, import missing
**Missing**:
- `POST /import-phone-number` - Import external phone numbers

## **Schema Updates Required**

### Agent Schema Enhancements
**Current**: Basic agent fields implemented
**Missing Fields** (25+ fields):
- `fallback_voice_ids` - Array of backup voice IDs
- `voice_temperature` - Voice temperature setting
- `voice_speed` - Voice speed setting
- `volume` - Audio volume level
- `responsiveness` - Response timing setting
- `interruption_sensitivity` - Interruption detection sensitivity
- `enable_backchannel` - Enable backchannel responses
- `backchannel_frequency` - Frequency of backchannel responses
- `backchannel_words` - Custom backchannel words
- `reminder_trigger_ms` - Reminder trigger timing
- `reminder_max_count` - Maximum reminder count
- `ambient_sound` - Background ambient sound
- `ambient_sound_volume` - Ambient sound volume
- `language` - Agent language setting
- `webhook_url` - Webhook endpoint URL
- `boosted_keywords` - Keywords for recognition boost
- `enable_transcription_formatting` - Transcription formatting toggle
- `pronunciation_dictionary` - Custom pronunciation rules
- `normalize_for_speech` - Speech normalization toggle
- `end_call_after_silence_ms` - Auto end call after silence
- `max_call_duration_ms` - Maximum call duration
- `voicemail_option` - Voicemail handling configuration
- `post_call_analysis_data` - Post-call analysis configuration
- `post_call_analysis_model` - Analysis model selection
- `begin_message_delay_ms` - Initial message delay
- `ring_duration_ms` - Ring duration setting
- `stt_mode` - Speech-to-text mode
- `vocab_specialization` - Vocabulary specialization
- `allow_user_dtmf` - DTMF input toggle
- `user_dtmf_options` - DTMF configuration options
- `denoising_mode` - Audio denoising mode

### New Schema Requirements
1. **Knowledge Base Schemas**:
   - `CreateKnowledgeBaseInputSchema`
   - `UpdateKnowledgeBaseInputSchema`
   - `GetKnowledgeBaseInputSchema`
   - `ListKnowledgeBasesInputSchema`
   - `CreateKnowledgeBaseDocumentInputSchema`

2. **Batch Call Schemas**:
   - `CreateBatchCallInputSchema`

3. **Import Phone Number Schemas**:
   - `ImportPhoneNumberInputSchema`

## **Implementation Strategy**

### Phase 1: Schema Enhancement (Priority: HIGH)
**Estimated Time**: 1-2 hours
**Tasks**:
1. Update `CreateAgentInputSchema` with all missing fields from API specification
2. Update `UpdateAgentInputSchema` with corresponding optional fields
3. Create comprehensive knowledge base schemas
4. Create batch call schemas
5. Create import phone number schemas

**Files to Modify**:
- `src/schemas/index.ts` - Add all missing schemas

### Phase 2: New Tool Implementation (Priority: HIGH)
**Estimated Time**: 2-3 hours
**Tasks**:
1. Create `src/tools/knowledge-base.ts` - Complete knowledge base tool suite
2. Extend `src/tools/agent.ts` - Add publish functionality
3. Extend `src/tools/call.ts` - Add batch call creation
4. Extend `src/tools/phone-number.ts` - Add import functionality
5. Update `src/tools/index.ts` - Register new knowledge base tools

**New Files**:
- `src/tools/knowledge-base.ts`

**Modified Files**:
- `src/tools/agent.ts`
- `src/tools/call.ts`
- `src/tools/phone-number.ts`
- `src/tools/index.ts`

### Phase 3: Transformer Updates (Priority: MEDIUM)
**Estimated Time**: 1 hour
**Tasks**:
1. Update agent input/output transformers for new fields
2. Create knowledge base transformers
3. Create batch call transformers
4. Ensure proper TypeScript type safety

**Files to Modify**:
- `src/transformers/index.ts`

### Phase 4: Testing & Validation (Priority: HIGH)
**Estimated Time**: 1 hour
**Tasks**:
1. Compile TypeScript with `npm run build`
2. Test MCP server startup
3. Validate tool registration
4. Run MCP inspector for tool verification

### Phase 5: Documentation Updates (Priority: MEDIUM)
**Estimated Time**: 30 minutes
**Tasks**:
1. Update `CLAUDE.md` with new capabilities
2. Create `CHANGES.md` documenting all additions
3. Update README if necessary

## **Risk Assessment & Mitigation**

### Low Risk Factors ✅
- **Additive Changes**: All changes are purely additive, no breaking changes to existing functionality
- **SDK Compatibility**: Using retell-sdk v4.28.0 which supports all required endpoints
- **Type Safety**: TypeScript will catch any integration issues during compilation
- **MCP Pattern**: Following established MCP tool patterns for consistency

### Mitigation Strategies
1. **Incremental Implementation**: Implement and test each tool category separately
2. **Schema Validation**: Leverage Zod schemas for runtime validation
3. **Error Handling**: Follow existing error handling patterns
4. **Rollback Plan**: Git version control allows easy rollback if issues arise

## **Success Criteria**

### Technical Success Metrics
- [ ] TypeScript compilation successful (`npm run build`)
- [ ] MCP server starts without errors
- [ ] All 27+ tools registered successfully
- [ ] MCP inspector shows all tools correctly
- [ ] No breaking changes to existing functionality

### Functional Success Metrics
- [ ] Knowledge base tools fully functional (6 new tools)
- [ ] Agent schema includes all API specification fields
- [ ] Batch call creation implemented
- [ ] Phone number import implemented
- [ ] Agent publishing implemented

### Documentation Success Metrics
- [ ] CLAUDE.md updated with new capabilities
- [ ] CHANGES.md documents all additions
- [ ] Implementation follows established patterns

## **Timeline & Effort Estimation**

**Total Estimated Time**: 5-7 hours

**Breakdown**:
- Phase 1 (Schema Enhancement): 1-2 hours
- Phase 2 (Tool Implementation): 2-3 hours  
- Phase 3 (Transformers): 1 hour
- Phase 4 (Testing): 1 hour
- Phase 5 (Documentation): 30 minutes

**Critical Path**: Knowledge Base implementation → Schema updates → Testing

## **Implementation Priority Matrix**

### Immediate (Today)
1. Knowledge base tool suite implementation
2. Agent schema enhancements
3. Core testing and validation

### Secondary (This Week)
1. Batch call functionality
2. Phone number import
3. Agent publishing
4. Documentation updates

### Optional (Future)
1. Advanced error handling improvements
2. Performance optimizations
3. Additional validation rules

## **Conclusion**

This comprehensive update will bring the Retell.ai MCP server to full parity with the current API specification, adding significant functionality (especially knowledge base management) while maintaining backward compatibility. The additive nature of changes minimizes risk while maximizing capability enhancement.