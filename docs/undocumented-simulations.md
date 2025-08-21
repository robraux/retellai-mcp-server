## Distilled API Documentation for Test Case Definitions

### Primary Keys & Core Identifiers

1. **`test_case_definition_id`** - Primary key for all test case operations
   - Format: `test_case_XXXXXXXXXXXX` (12 character alphanumeric suffix)
   - Used in URL paths for UPDATE and DELETE operations
   - Auto-generated on CREATE, immutable

2. **`llm_id`** - Foreign key reference to Retell LLM
   - Format: `llm_XXXXXXXXXXXXXXXXXXXXXXXX`
   - References an existing Retell LLM configuration
   - Required for LIST filtering and response_engine configuration

3. **`version`** - Version tracking
   - Numeric value for version control
   - Can specify which version of an LLM to use

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/list-test-case-definitions` | Retrieve all test cases for a specific LLM |
| POST | `/create-test-case-definition` | Create new test case |
| PUT | `/update-test-case-definition/{id}` | Update existing test case (full replacement) |
| DELETE | `/delete-test-case-definition/{id}` | Delete test case |

### Data Model

```typescript
interface TestCaseDefinition {
  // Identifiers
  test_case_definition_id: string;  // Primary key

  // Core configuration
  name: string;
  type: 'simulation';  // Currently only 'simulation' observed
  user_prompt: string;  // Instructions for the simulated user
  metrics: string[];    // Success criteria for the test

  // LLM configuration
  response_engine: {
    type: 'retell-llm';
    llm_id: string;      // Must reference existing Retell LLM
    version?: number;    // Optional version lock
  };

  // Test variables
  dynamic_variables: Record<string, string>;  // Key-value pairs for test data

  // Model override
  llm_model?: 'gpt-4o' | 'gpt-4o-mini' | 'gpt-4.1' | 'gpt-4.1-mini' |
             'gpt-4.1-nano' | 'claude-3.7-sonnet' | 'claude-3.5-haiku' |
             'gemini-2.0-flash' | 'gemini-2.0-flash-lite';  // Default: gpt-4o-mini

  // Metadata
  creation_timestamp: number;         // Unix timestamp, set on creation
  user_modified_timestamp: number;     // Unix timestamp, updated on modification

  // Optional fields
  description?: string;
  tool_mocks?: any[];  // Mock tool responses for simulation testing
}
```

### Query Parameters

#### LIST Endpoint
```typescript
interface ListQueryParams {
  type: 'retell-llm';  // Filter by response engine type
  llm_id: string;      // Required: LLM identifier to filter by
  version?: number;    // Optional: Specific LLM version
}
```

### Key Architectural Insights

#### 1. **No Individual Fetch Pattern**
- No GET endpoint exists for fetching a single test case by ID
- Must use LIST and filter client-side for specific test cases
- Implies test cases are always managed in the context of their parent LLM

#### 2. **Response Engine Architecture**
- Test cases don't define LLM behavior directly
- They reference existing Retell LLM configurations via `llm_id`
- The `llm_model` field allows overriding the model selection without changing the LLM configuration
- This separation allows reusing LLM configurations across multiple test scenarios

#### 3. **Dynamic Variables Pattern**
- Flexible key-value structure suggests different test types may require different variables
- Common variables observed: company details, contact information, IVR settings, business hours
- Variables are likely injected into the LLM prompt at runtime

#### 4. **Update Semantics**
- PUT requires complete object replacement (not partial updates)
- Must include `test_case_definition_id` in both URL path and request body
- `user_modified_timestamp` updated server-side

#### 5. **Test Metrics Design**
- Metrics are string arrays describing success conditions
- Format suggests natural language evaluation criteria
- Examples show state transitions, variable values, and behavioral expectations

### Critical Design Considerations

1. **Coupling to LLM Configuration**: Test cases are tightly coupled to specific LLM configurations, suggesting they're designed for regression testing of specific agent behaviors

2. **Simulation Focus**: The `type: 'simulation'` and `user_prompt` structure indicates these are primarily for simulating user interactions to test agent responses

3. **No Pagination**: LIST endpoint shows no pagination parameters, potential scalability concern for large test suites

4. **Model Override Pattern**: The ability to override `llm_model` while keeping the same LLM configuration enables A/B testing different models with identical prompts

5. **Timestamp Management**: Server-managed timestamps suggest audit trail requirements
