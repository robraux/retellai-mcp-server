import { z } from "zod";

// ===== Call Schemas =====

export const CallType = {
  PhoneCall: "phone_call",
  WebCall: "web_call",
} as const;

export type CallTypeType = (typeof CallType)[keyof typeof CallType];

export const CallStatusSchema = z.enum([
  "registered",
  "in_progress",
  "completed",
  "failed",
  "canceled",
]);

export type CallStatus = z.infer<typeof CallStatusSchema>;

// Phone Call Input Schema
export const CreatePhoneCallInputSchema = z.object({
  fromNumber: z.string().describe("The phone number to call from"),
  toNumber: z.string().describe("The phone number to call to"),
  overrideAgentId: z
    .string()
    .optional()
    .describe(
      "For this particular call, override the agent used with this agent id"
    ),
  overrideAgentVersion: z
    .number()
    .optional()
    .describe(
      "For this particular call, override the agent version used with this version"
    ),
  direction: z.enum(["inbound", "outbound"]).default("outbound"),
  metadata: z.record(z.string()).optional(),
  retellLlmDynamicVariables: z
    .record(z.string())
    .optional()
    .describe("Dynamic variables to pass to the LLM in key-value pairs"),
  optOutSensitiveDataStorage: z.boolean().optional(),
  optInSignedUrl: z.boolean().optional(),
});

// Web Call Input Schema
export const CreateWebCallInputSchema = z.object({
  agentId: z.string().describe("The ID of the agent to use for the call"),
  metadata: z.record(z.string()).optional(),
  retellLlmDynamicVariables: z
    .record(z.string())
    .optional()
    .describe("Dynamic variables to pass to the LLM in key-value pairs"),
  optOutSensitiveDataStorage: z.boolean().optional(),
  optInSignedUrl: z.boolean().optional(),
});

// Get Call Input Schema
export const GetCallInputSchema = z.object({
  callId: z.string().describe("The ID of the call to retrieve"),
});

// Call Output Schema
export const CallOutputSchema = z.object({
  call_id: z.string(),
  call_type: z.enum([CallType.PhoneCall, CallType.WebCall]),
  agent_id: z.string(),
  version: z.number(),
  call_status: CallStatusSchema,
  metadata: z.record(z.string()).optional(),
  start_timestamp: z.number().optional(),
  end_timestamp: z.number().optional(),
  transcript: z.string().optional(),
  recording_url: z.string().optional(),
  disconnection_reason: z.string().optional(),
  call_analysis: z
    .object({
      call_summary: z.string().optional(),
      in_voicemail: z.boolean().optional(),
      user_sentiment: z
        .enum(["Negative", "Positive", "Neutral", "Unknown"])
        .optional(),
      call_successful: z.boolean().optional(),
      custom_analysis_data: z.record(z.any()).optional(),
    })
    .optional(),
  call_cost: z
    .object({
      product_costs: z.array(
        z.object({
          product: z.string(),
          unitPrice: z.number(),
          cost: z.number(),
        })
      ),
      total_duration_seconds: z.number(),
      total_duration_unit_price: z.number(),
      total_one_time_price: z.number(),
      combined_cost: z.number(),
    })
    .optional(),
});

// List Calls Input Schema
export const ListCallsInputSchema = z.object({
  agentId: z.string().optional().describe("Filter calls by agent ID"),
  startTimestamp: z
    .number()
    .optional()
    .describe("Filter calls after this timestamp"),
  endTimestamp: z
    .number()
    .optional()
    .describe("Filter calls before this timestamp"),
  limit: z.number().optional().describe("Maximum number of calls to return"),
  offset: z.number().optional().describe("Number of calls to skip"),
});

// Update Call Input Schema
export const UpdateCallInputSchema = z.object({
  callId: z.string().describe("The ID of the call to update"),
  metadata: z.record(z.string()).optional(),
  dynamicVariables: z.record(z.string()).optional(),
});

// Delete Call Input Schema
export const DeleteCallInputSchema = z.object({
  callId: z.string().describe("The ID of the call to delete"),
});

// ===== Agent Schemas =====

// Analysis Data Schemas
const StringAnalysisDataSchema = z.object({
  type: z.literal("string"),
  name: z.string(),
  description: z.string(),
  examples: z.array(z.string()),
});

const EnumAnalysisDataSchema = z.object({
  type: z.literal("enum"),
  name: z.string(),
  description: z.string(),
  examples: z.array(z.string()),
  choices: z.array(z.string()),
});

const BooleanAnalysisDataSchema = z.object({
  type: z.literal("boolean"),
  name: z.string(),
  description: z.string(),
  examples: z.array(z.string()),
});

const NumberAnalysisDataSchema = z.object({
  type: z.literal("number"),
  name: z.string(),
  description: z.string(),
  examples: z.array(z.string()),
});

const AnalysisDataSchema = z.discriminatedUnion("type", [
  StringAnalysisDataSchema,
  EnumAnalysisDataSchema,
  BooleanAnalysisDataSchema,
  NumberAnalysisDataSchema,
]);

export const CreateAgentInputSchema = z.object({
  response_engine: z.union([
    // Reference to existing LLM
    z.object({
      type: z.literal("retell-llm"),
      llm_id: z
        .string()
        .describe("ID of an existing Retell LLM Response Engine"),
      version: z.number().optional(),
    }),
    // Inline LLM configuration with multi-prompt support
    z.object({
      type: z.literal("retell-llm"),
      // Core LLM Configuration
      model: z
        .enum([
          "gpt-4o",
          "gpt-4o-mini",
          "gpt-4.1",
          "gpt-4.1-mini",
          "gpt-4.1-nano",
          "claude-3.7-sonnet",
          "claude-3.5-haiku",
          "gemini-2.0-flash",
          "gemini-2.0-flash-lite",
        ])
        .optional()
        .describe("Select the underlying text LLM"),
      s2s_model: z
        .enum(["gpt-4o-realtime", "gpt-4o-mini-realtime"])
        .optional()
        .describe("Select the underlying speech to speech model"),
      model_temperature: z
        .number()
        .min(0)
        .max(1)
        .optional()
        .describe("Control randomness of response [0,1]"),
      model_high_priority: z
        .boolean()
        .optional()
        .describe("Use high priority pool with dedicated resources"),
      tool_call_strict_mode: z
        .boolean()
        .optional()
        .describe("Use structured output for gpt-4o models"),
      
      // Multi-prompt Configuration
      general_prompt: z.string().describe("Prompt for the agent to follow"),
      general_tools: z
        .array(
          z.discriminatedUnion("type", [
            z.object({
              type: z.literal("end_call"),
              name: z.string(),
              description: z.string(),
            }),
            z.object({
              type: z.literal("transfer_call"),
              name: z.string(),
              description: z.string(),
              transfer_destination: z.discriminatedUnion("type", [
                z.object({
                  type: z.literal("predefined"),
                  value: z.enum(["voicemail", "operator"]),
                  number: z.string(),
                }),
                z.object({
                  type: z.literal("inferred"),
                  description: z.string(),
                  prompt: z.string(),
                }),
              ]),
            }),
            z.object({
              type: z.literal("check_availability_cal"),
              name: z.string(),
              description: z.string(),
              calendar_url: z.string(),
              cal_api_key: z.string(),
              event_type_id: z.number(),
            }),
            z.object({
              type: z.literal("book_appointment_cal"),
              name: z.string(),
              description: z.string(),
              calendar_url: z.string(),
              cal_api_key: z.string(),
              event_type_id: z.number(),
            }),
            z.object({
              type: z.literal("press_digit"),
              name: z.string(),
              description: z.string(),
              digit: z.string(),
            }),
            z.object({
              type: z.literal("custom"),
              name: z.string(),
              description: z.string(),
              speak_after_execution: z.boolean(),
              speak_during_execution: z.boolean(),
              url: z.string(),
            }),
          ])
        )
        .optional()
        .describe("Global tools available to the model"),
      
      // States for multi-prompt agents
      states: z
        .array(
          z.object({
            name: z.string().describe("Name of the state"),
            state_prompt: z.string().describe("Prompt for this specific state"),
            edges: z
              .array(
                z.object({
                  destination_state_name: z.string().describe("Target state name"),
                  description: z.string().describe("Condition for this transition"),
                  parameters: z
                    .object({
                      type: z.literal("object"),
                      properties: z.record(z.any()),
                      required: z.array(z.string()),
                    })
                    .optional()
                    .describe("Parameters to pass to the destination state"),
                })
              )
              .optional()
              .describe("Possible transitions from this state"),
            tools: z
              .array(
                z.discriminatedUnion("type", [
                  z.object({
                    type: z.literal("end_call"),
                    name: z.string(),
                    description: z.string(),
                  }),
                  z.object({
                    type: z.literal("transfer_call"),
                    name: z.string(),
                    description: z.string(),
                    transfer_destination: z.discriminatedUnion("type", [
                      z.object({
                        type: z.literal("predefined"),
                        value: z.enum(["voicemail", "operator"]),
                        number: z.string(),
                      }),
                      z.object({
                        type: z.literal("inferred"),
                        description: z.string(),
                        prompt: z.string(),
                      }),
                    ]),
                  }),
                  z.object({
                    type: z.literal("check_availability_cal"),
                    name: z.string(),
                    description: z.string(),
                    calendar_url: z.string(),
                    cal_api_key: z.string(),
                    event_type_id: z.number(),
                  }),
                  z.object({
                    type: z.literal("book_appointment_cal"),
                    name: z.string(),
                    description: z.string(),
                    calendar_url: z.string(),
                    cal_api_key: z.string(),
                    event_type_id: z.number(),
                  }),
                  z.object({
                    type: z.literal("press_digit"),
                    name: z.string(),
                    description: z.string(),
                    digit: z.string(),
                  }),
                  z.object({
                    type: z.literal("custom"),
                    name: z.string(),
                    description: z.string(),
                    speak_after_execution: z.boolean(),
                    speak_during_execution: z.boolean(),
                    url: z.string(),
                  }),
                ])
              )
              .optional()
              .describe("Tools available in this specific state"),
          })
        )
        .optional()
        .describe("States for multi-prompt agents"),
      starting_state: z
        .string()
        .optional()
        .describe("Name of the starting state. Required if states is provided"),
      begin_message: z
        .string()
        .optional()
        .describe("First utterance said by the agent in the call"),
      default_dynamic_variables: z
        .record(z.string())
        .optional()
        .describe("Default dynamic variables as key-value pairs"),
      knowledge_base_ids: z
        .array(z.string())
        .optional()
        .describe("Knowledge base IDs to use for this agent"),
    }),
  ]),
  voice_id: z.string().describe("ID of the voice to use"),
  agent_name: z.string().optional().describe("Name of the agent"),
  voice_model: z
    .enum([
      "eleven_turbo_v2",
      "eleven_flash_v2",
      "eleven_turbo_v2_5",
      "eleven_flash_v2_5",
      "eleven_multilingual_v2",
      "Play3.0-mini",
      "PlayDialog",
    ])
    .optional(),
  fallback_voice_ids: z.array(z.string()).optional().describe("Fallback voice IDs in case the primary voice is unavailable"),
  voice_temperature: z.number().min(0).max(2).optional().describe("Voice temperature for speech synthesis"),
  voice_speed: z.number().min(0.5).max(2).optional().describe("Voice speed multiplier"),
  volume: z.number().min(0).max(2).optional().describe("Audio volume multiplier"),
  responsiveness: z.number().min(0).max(1).optional().describe("Agent responsiveness level"),
  interruption_sensitivity: z.number().min(0).max(1).optional().describe("Sensitivity to user interruptions"),
  enable_backchannel: z.boolean().optional().describe("Enable backchannel responses (uh-huh, yeah, etc.)"),
  backchannel_frequency: z.number().min(0).max(1).optional().describe("Frequency of backchannel responses"),
  backchannel_words: z.array(z.string()).optional().describe("Custom backchannel words"),
  reminder_trigger_ms: z.number().min(10000).optional().describe("Time in ms to trigger reminder messages"),
  reminder_max_count: z.number().min(0).optional().describe("Maximum number of reminder messages"),
  ambient_sound: z
    .enum([
      "coffee-shop",
      "convention-hall",
      "summer-outdoor",
      "mountain-outdoor",
      "static-noise",
      "call-center",
    ])
    .optional()
    .describe("Background ambient sound"),
  ambient_sound_volume: z.number().min(0).max(2).optional().describe("Ambient sound volume level"),
  language: z
    .enum([
      "en-US",
      "en-IN",
      "en-GB",
      "en-AU",
      "en-NZ",
      "de-DE",
      "es-ES",
      "es-419",
      "hi-IN",
      "fr-FR",
      "fr-CA",
      "ja-JP",
      "pt-PT",
      "pt-BR",
      "zh-CN",
      "ru-RU",
      "it-IT",
      "ko-KR",
    ])
    .optional(),
  webhook_url: z.string().url().optional().describe("Webhook URL for call events"),
  boosted_keywords: z.array(z.string()).optional().describe("Keywords to boost in speech recognition"),
  enable_transcription_formatting: z.boolean().optional().describe("Enable transcription formatting"),
  opt_out_sensitive_data_storage: z.boolean().optional().describe("Opt out of sensitive data storage"),
  opt_in_signed_url: z.boolean().optional().describe("Opt in for signed URLs"),
  pronunciation_dictionary: z
    .array(
      z.object({
        word: z.string(),
        alphabet: z.enum(["ipa", "cmu"]),
        phoneme: z.string(),
      })
    )
    .optional()
    .describe("Custom pronunciation dictionary"),
  normalize_for_speech: z.boolean().optional().describe("Normalize text for speech synthesis"),
  end_call_after_silence_ms: z.number().min(10000).optional().describe("End call after silence duration in ms"),
  max_call_duration_ms: z.number().min(60000).optional().describe("Maximum call duration in ms"),
  voicemail_option: z.object({
    action: z.discriminatedUnion("type", [
      z.object({
        type: z.literal("static_text"),
        text: z.string(),
      }),
      z.object({
        type: z.literal("hang_up"),
      }),
      z.object({
        type: z.literal("continue"),
      })
    ])
  }).optional().describe("Voicemail handling configuration"),
  post_call_analysis_data: z.array(AnalysisDataSchema).optional().describe("Post-call analysis configuration"),
  post_call_analysis_model: z.enum(["gpt-4o-mini", "gpt-4o"]).optional().describe("Model for post-call analysis"),
  begin_message_delay_ms: z.number().min(0).optional().describe("Delay before first message in ms"),
  ring_duration_ms: z.number().min(5000).optional().describe("Ring duration in ms"),
  stt_mode: z.enum(["fast", "accurate"]).optional().describe("Speech-to-text mode"),
  vocab_specialization: z.enum(["general", "finance", "healthcare", "legal"]).optional().describe("Vocabulary specialization"),
  allow_user_dtmf: z.boolean().optional().describe("Allow user DTMF input"),
  user_dtmf_options: z.object({
    digit_limit: z.number().min(1).max(25),
    termination_key: z.string().length(1).optional(),
    timeout_ms: z.number().min(1000).max(30000),
  }).optional().describe("DTMF input options"),
  denoising_mode: z.enum(["noise-cancellation", "speech-enhancement"]).optional().describe("Audio denoising mode"),
});

export const GetAgentInputSchema = z.object({
  agentId: z.string().describe("The ID of the agent to retrieve"),
});

export const UpdateAgentInputSchema = z.object({
  agentId: z.string().describe("The ID of the agent to update"),
  response_engine: z.union([
    // Reference to existing LLM
    z.object({
      type: z.literal("retell-llm"),
      llm_id: z.string().describe("ID of an existing Retell LLM Response Engine"),
      version: z.number().optional(),
    }),
    // Inline LLM configuration updates with multi-prompt support
    z.object({
      type: z.literal("retell-llm"),
      // Core LLM Configuration (all optional for updates)
      model: z
        .enum([
          "gpt-4o",
          "gpt-4o-mini",
          "gpt-4.1",
          "gpt-4.1-mini",
          "gpt-4.1-nano",
          "claude-3.7-sonnet",
          "claude-3.5-haiku",
          "gemini-2.0-flash",
          "gemini-2.0-flash-lite",
        ])
        .optional()
        .describe("Select the underlying text LLM"),
      s2s_model: z
        .enum(["gpt-4o-realtime", "gpt-4o-mini-realtime"])
        .optional()
        .describe("Select the underlying speech to speech model"),
      model_temperature: z
        .number()
        .min(0)
        .max(1)
        .optional()
        .describe("Control randomness of response [0,1]"),
      model_high_priority: z
        .boolean()
        .optional()
        .describe("Use high priority pool with dedicated resources"),
      tool_call_strict_mode: z
        .boolean()
        .optional()
        .describe("Use structured output for gpt-4o models"),
      
      // Multi-prompt Configuration Updates
      general_prompt: z.string().optional().describe("Updated prompt for the agent"),
      general_tools: z
        .array(
          z.discriminatedUnion("type", [
            z.object({
              type: z.literal("end_call"),
              name: z.string(),
              description: z.string(),
            }),
            z.object({
              type: z.literal("transfer_call"),
              name: z.string(),
              description: z.string(),
              transfer_destination: z.discriminatedUnion("type", [
                z.object({
                  type: z.literal("predefined"),
                  value: z.enum(["voicemail", "operator"]),
                  number: z.string(),
                }),
                z.object({
                  type: z.literal("inferred"),
                  description: z.string(),
                  prompt: z.string(),
                }),
              ]),
            }),
            z.object({
              type: z.literal("check_availability_cal"),
              name: z.string(),
              description: z.string(),
              calendar_url: z.string(),
              cal_api_key: z.string(),
              event_type_id: z.number(),
            }),
            z.object({
              type: z.literal("book_appointment_cal"),
              name: z.string(),
              description: z.string(),
              calendar_url: z.string(),
              cal_api_key: z.string(),
              event_type_id: z.number(),
            }),
            z.object({
              type: z.literal("press_digit"),
              name: z.string(),
              description: z.string(),
              digit: z.string(),
            }),
            z.object({
              type: z.literal("custom"),
              name: z.string(),
              description: z.string(),
              speak_after_execution: z.boolean(),
              speak_during_execution: z.boolean(),
              url: z.string(),
            }),
          ])
        )
        .optional()
        .describe("Updated global tools available to the model"),
      
      // States for multi-prompt agents updates
      states: z
        .array(
          z.object({
            name: z.string().describe("Name of the state"),
            state_prompt: z.string().describe("Prompt for this specific state"),
            edges: z
              .array(
                z.object({
                  destination_state_name: z.string().describe("Target state name"),
                  description: z.string().describe("Condition for this transition"),
                  parameters: z
                    .object({
                      type: z.literal("object"),
                      properties: z.record(z.any()),
                      required: z.array(z.string()),
                    })
                    .optional()
                    .describe("Parameters to pass to the destination state"),
                })
              )
              .optional()
              .describe("Possible transitions from this state"),
            tools: z
              .array(
                z.discriminatedUnion("type", [
                  z.object({
                    type: z.literal("end_call"),
                    name: z.string(),
                    description: z.string(),
                  }),
                  z.object({
                    type: z.literal("transfer_call"),
                    name: z.string(),
                    description: z.string(),
                    transfer_destination: z.discriminatedUnion("type", [
                      z.object({
                        type: z.literal("predefined"),
                        value: z.enum(["voicemail", "operator"]),
                        number: z.string(),
                      }),
                      z.object({
                        type: z.literal("inferred"),
                        description: z.string(),
                        prompt: z.string(),
                      }),
                    ]),
                  }),
                  z.object({
                    type: z.literal("check_availability_cal"),
                    name: z.string(),
                    description: z.string(),
                    calendar_url: z.string(),
                    cal_api_key: z.string(),
                    event_type_id: z.number(),
                  }),
                  z.object({
                    type: z.literal("book_appointment_cal"),
                    name: z.string(),
                    description: z.string(),
                    calendar_url: z.string(),
                    cal_api_key: z.string(),
                    event_type_id: z.number(),
                  }),
                  z.object({
                    type: z.literal("press_digit"),
                    name: z.string(),
                    description: z.string(),
                    digit: z.string(),
                  }),
                  z.object({
                    type: z.literal("custom"),
                    name: z.string(),
                    description: z.string(),
                    speak_after_execution: z.boolean(),
                    speak_during_execution: z.boolean(),
                    url: z.string(),
                  }),
                ])
              )
              .optional()
              .describe("Tools available in this specific state"),
          })
        )
        .optional()
        .describe("Updated states for multi-prompt agents"),
      starting_state: z
        .string()
        .optional()
        .describe("Updated starting state name"),
      begin_message: z
        .string()
        .optional()
        .describe("Updated first utterance said by the agent"),
      default_dynamic_variables: z
        .record(z.string())
        .optional()
        .describe("Updated default dynamic variables as key-value pairs"),
      knowledge_base_ids: z
        .array(z.string())
        .optional()
        .describe("Updated knowledge base IDs to use for this agent"),
    }),
  ]).optional(),
  voice_id: z.string().optional(),
  agent_name: z.string().optional(),
  voice_model: z.string().optional(),
  fallback_voice_ids: z.array(z.string()).optional(),
  voice_temperature: z.number().optional(),
  voice_speed: z.number().optional(),
  volume: z.number().optional(),
  responsiveness: z.number().optional(),
  interruption_sensitivity: z.number().optional(),
  enable_backchannel: z.boolean().optional(),
  backchannel_frequency: z.number().optional(),
  backchannel_words: z.array(z.string()).optional(),
  reminder_trigger_ms: z.number().optional(),
  reminder_max_count: z.number().optional(),
  ambient_sound: z.string().optional(),
  ambient_sound_volume: z.number().optional(),
  language: z.string().optional(),
  webhook_url: z.string().optional(),
  boosted_keywords: z.array(z.string()).optional(),
  enable_transcription_formatting: z.boolean().optional(),
  opt_out_sensitive_data_storage: z.boolean().optional(),
  opt_in_signed_url: z.boolean().optional(),
  pronunciation_dictionary: z
    .array(
      z.object({
        word: z.string(),
        alphabet: z.enum(["ipa", "cmu"]),
        phoneme: z.string(),
      })
    )
    .optional(),
  normalize_for_speech: z.boolean().optional(),
  end_call_after_silence_ms: z.number().optional(),
  max_call_duration_ms: z.number().optional(),
  enable_voicemail_detection: z.boolean().optional(),
  voicemail_message: z.string().optional(),
  voicemail_detection_timeout_ms: z.number().optional(),
  post_call_analysis_data: z.array(AnalysisDataSchema).optional(),
  post_call_analysis_model: z.enum(["gpt-4o-mini", "gpt-4o"]).optional(),
  begin_message_delay_ms: z.number().optional(),
  ring_duration_ms: z.number().optional(),
  stt_mode: z.enum(["fast", "accurate"]).optional(),
});

export const AgentOutputSchema = z.object({
  agent_id: z.string(),
  response_engine: z.object({
    type: z.literal("retell-llm"),
    llm_id: z.string(),
    version: z.number(),
  }),
  agent_name: z.string().optional(),
  version: z.number(),
  voice_id: z.string(),
  voice_model: z.string().optional(),
  fallback_voice_ids: z.array(z.string()).optional(),
  voice_temperature: z.number().optional(),
  voice_speed: z.number().optional(),
  volume: z.number().optional(),
  responsiveness: z.number().optional(),
  interruption_sensitivity: z.number().optional(),
  enable_backchannel: z.boolean().optional(),
  backchannel_frequency: z.number().optional(),
  backchannel_words: z.array(z.string()).optional(),
  reminder_trigger_ms: z.number().optional(),
  reminder_max_count: z.number().optional(),
  ambient_sound: z.string().optional(),
  ambient_sound_volume: z.number().optional(),
  language: z.string().optional(),
  webhook_url: z.string().optional(),
  boosted_keywords: z.array(z.string()).optional(),
  enable_transcription_formatting: z.boolean().optional(),
  opt_out_sensitive_data_storage: z.boolean().optional(),
  opt_in_signed_url: z.boolean().optional(),
  pronunciation_dictionary: z
    .array(
      z.object({
        word: z.string(),
        alphabet: z.enum(["ipa", "cmu"]),
        phoneme: z.string(),
      })
    )
    .optional(),
  normalize_for_speech: z.boolean().optional(),
  end_call_after_silence_ms: z.number().optional(),
  max_call_duration_ms: z.number().optional(),
  enable_voicemail_detection: z.boolean().optional(),
  voicemail_message: z.string().optional(),
  voicemail_detection_timeout_ms: z.number().optional(),
  post_call_analysis_data: z.array(AnalysisDataSchema).optional(),
  post_call_analysis_model: z.enum(["gpt-4o-mini", "gpt-4o"]).optional(),
  begin_message_delay_ms: z.number().optional(),
  ring_duration_ms: z.number().optional(),
  stt_mode: z.enum(["fast", "accurate"]).optional(),
  last_modification_timestamp: z.number(),
});

// ===== Phone Number Schemas =====

export const CreatePhoneNumberInputSchema = z.object({
  areaCode: z.number().describe("Area code of the number to obtain"),
  inboundAgentId: z.string().optional(),
  outboundAgentId: z.string().optional(),
  nickname: z.string().optional(),
  inboundWebhookUrl: z.string().optional(),
});

export const GetPhoneNumberInputSchema = z.object({
  phoneNumber: z.string().describe("The phone number to retrieve"),
});

export const UpdatePhoneNumberInputSchema = z.object({
  phoneNumber: z.string().describe("The phone number to update"),
  inboundAgentId: z.string().optional(),
  outboundAgentId: z.string().optional(),
  nickname: z.string().optional(),
  inboundWebhookUrl: z.string().optional(),
});

export const PhoneNumberOutputSchema = z.object({
  phone_number: z.string(),
  phone_number_pretty: z.string(),
  phone_number_type: z.string(),
  inbound_agent_id: z.string().nullable(),
  outbound_agent_id: z.string().nullable(),
  area_code: z.number(),
  nickname: z.string().nullable(),
  inbound_webhook_url: z.string().nullable(),
  last_modification_timestamp: z.number(),
});

// ===== Voice Schemas =====

export const GetVoiceInputSchema = z.object({
  voiceId: z.string().describe("The ID of the voice to retrieve"),
});

export const VoiceOutputSchema = z.object({
  voice_id: z.string(),
  voice_name: z.string(),
  provider: z.enum(["elevenlabs", "openai", "deepgram"]),
  accent: z.string().optional(),
  gender: z.enum(["male", "female"]),
  age: z.string().optional(),
});

// ===== Knowledge Base Schemas =====

export const CreateKnowledgeBaseInputSchema = z.object({
  name: z.string().describe("Name of the knowledge base"),
  description: z.string().optional(),
});

export const GetKnowledgeBaseInputSchema = z.object({
  knowledgeBaseId: z
    .string()
    .describe("The ID of the knowledge base to retrieve"),
});

export const AddKnowledgeBaseSourceInputSchema = z.object({
  knowledgeBaseId: z.string().describe("The ID of the knowledge base"),
  sourceType: z.string().describe("Type of the source"),
  sourceConfig: z.record(z.any()).describe("Configuration for the source"),
});

export const DeleteKnowledgeBaseSourceInputSchema = z.object({
  knowledgeBaseId: z.string().describe("The ID of the knowledge base"),
  sourceId: z.string().describe("The ID of the source to delete"),
});

export const KnowledgeBaseOutputSchema = z.object({
  knowledge_base_id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  created_at: z.number(),
  updated_at: z.number(),
  sources: z
    .array(
      z.object({
        source_id: z.string(),
        source_type: z.string(),
        status: z.string(),
        created_at: z.number(),
      })
    )
    .optional(),
});

// ===== Retell LLM Response Engine Schemas =====

export const CreateRetellLLMInputSchema = z.object({
  version: z.number().optional().describe("Version of the Retell LLM"),
  model: z
    .enum([
      "gpt-4o",
      "gpt-4o-mini",
      "gpt-4.1",
      "gpt-4.1-mini",
      "gpt-4.1-nano",
      "claude-3.7-sonnet",
      "claude-3.5-haiku",
      "gemini-2.0-flash",
      "gemini-2.0-flash-lite",
    ])
    .optional()
    .describe(
      "Select the underlying text LLM. If not set, would default to gpt-4o"
    ),
  s2s_model: z
    .enum(["gpt-4o-realtime", "gpt-4o-mini-realtime"])
    .optional()
    .describe(
      "Select the underlying speech to speech model. Can only set this or model, not both"
    ),
  model_temperature: z
    .number()
    .optional()
    .describe(
      "If set, will control the randomness of the response. Value ranging from [0,1]"
    ),
  model_high_priority: z
    .boolean()
    .optional()
    .describe(
      "If set to true, will use high priority pool with more dedicated resource"
    ),
  tool_call_strict_mode: z
    .boolean()
    .optional()
    .describe(
      "Only applicable when model is gpt-4o or gpt-4o mini. If set to true, will use structured output"
    ),
  general_prompt: z.string().describe(
    // "General prompt appended to system prompt no matter what state the agent is in"
    "Prompt for the agent to follow"
  ),
  general_tools: z
    .array(
      z.discriminatedUnion("type", [
        z.object({
          type: z.literal("end_call"),
          name: z.string(),
          description: z.string(),
        }),
        z.object({
          type: z.literal("transfer_call"),
          name: z.string(),
          description: z.string(),
          transfer_destination: z.discriminatedUnion("type", [
            z.object({
              type: z.literal("predefined"),
              value: z.enum(["voicemail", "operator"]),
              number: z.string(),
            }),
            z.object({
              type: z.literal("inferred"),
              description: z.string(),
              prompt: z.string(),
            }),
          ]),
        }),
        z.object({
          type: z.literal("check_availability_cal"),
          name: z.string(),
          description: z.string(),
          calendar_url: z.string(),
          cal_api_key: z.string(),
          event_type_id: z.number(),
        }),
        z.object({
          type: z.literal("book_appointment_cal"),
          name: z.string(),
          description: z.string(),
          calendar_url: z.string(),
          cal_api_key: z.string(),
          event_type_id: z.number(),
        }),
        z.object({
          type: z.literal("press_digit"),
          name: z.string(),
          description: z.string(),
          digit: z.string(),
        }),
        z.object({
          type: z.literal("custom"),
          name: z.string(),
          description: z.string(),
          speak_after_execution: z.boolean(),
          speak_during_execution: z.boolean(),
          url: z.string(),
        }),
      ])
    )
    .optional()
    .describe("A list of tools the model may call"),
  states: z
    .array(
      z.object({
        name: z.string(),
        state_prompt: z.string(),
        edges: z
          .array(
            z.object({
              destination_state_name: z.string(),
              description: z.string(),
              parameters: z
                .object({
                  type: z.literal("object"),
                  properties: z.record(z.any()),
                  required: z.array(z.string()),
                })
                .optional(),
            })
          )
          .optional(),
        tools: z
          .array(
            z.discriminatedUnion("type", [
              z.object({
                type: z.literal("end_call"),
                name: z.string(),
                description: z.string(),
              }),
              z.object({
                type: z.literal("transfer_call"),
                name: z.string(),
                description: z.string(),
                transfer_destination: z.discriminatedUnion("type", [
                  z.object({
                    type: z.literal("predefined"),
                    value: z.enum(["voicemail", "operator"]),
                    number: z.string(),
                  }),
                  z.object({
                    type: z.literal("inferred"),
                    description: z.string(),
                    prompt: z.string(),
                  }),
                ]),
              }),
              z.object({
                type: z.literal("check_availability_cal"),
                name: z.string(),
                description: z.string(),
                calendar_url: z.string(),
                cal_api_key: z.string(),
                event_type_id: z.number(),
              }),
              z.object({
                type: z.literal("book_appointment_cal"),
                name: z.string(),
                description: z.string(),
                calendar_url: z.string(),
                cal_api_key: z.string(),
                event_type_id: z.number(),
              }),
              z.object({
                type: z.literal("press_digit"),
                name: z.string(),
                description: z.string(),
                digit: z.string(),
              }),
              z.object({
                type: z.literal("custom"),
                name: z.string(),
                description: z.string(),
                speak_after_execution: z.boolean(),
                speak_during_execution: z.boolean(),
                url: z.string(),
              }),
            ])
          )
          .optional(),
      })
    )
    .optional()
    .describe("States of the LLM"),
  starting_state: z
    .string()
    .optional()
    .describe("Name of the starting state. Required if states is not empty"),
  begin_message: z
    .string()
    .optional()
    .describe("First utterance said by the agent in the call"),
  default_dynamic_variables: z
    .record(z.string())
    .optional()
    .describe(
      "Default dynamic variables represented as key-value pairs of strings"
    ),
  knowledge_base_ids: z
    .array(z.string())
    .optional()
    .describe("A list of knowledge base ids to use for this resource"),
});

export const GetRetellLLMInputSchema = z.object({
  llmId: z.string().describe("The ID of the Retell LLM to retrieve"),
});

export const UpdateRetellLLMInputSchema = z.object({
  llmId: z.string().describe("The ID of the Retell LLM to update"),
  version: z.number().optional(),
  model: z
    .enum([
      "gpt-4o",
      "gpt-4o-mini",
      "gpt-4.1",
      "gpt-4.1-mini",
      "gpt-4.1-nano",
      "claude-3.7-sonnet",
      "claude-3.5-haiku",
      "gemini-2.0-flash",
      "gemini-2.0-flash-lite",
    ])
    .optional(),
  s2s_model: z.enum(["gpt-4o-realtime", "gpt-4o-mini-realtime"]).optional(),
  model_temperature: z.number().optional(),
  model_high_priority: z.boolean().optional(),
  tool_call_strict_mode: z.boolean().optional(),
  general_prompt: z.string().optional(),
  general_tools: z
    .array(
      z.object({
        type: z.string(),
        name: z.string(),
        description: z.string(),
      })
    )
    .optional(),
  states: z
    .array(
      z.object({
        name: z.string(),
        state_prompt: z.string(),
        edges: z
          .array(
            z.object({
              destination_state_name: z.string(),
              description: z.string(),
              parameters: z
                .object({
                  type: z.literal("object"),
                  properties: z.record(z.any()),
                  required: z.array(z.string()),
                })
                .optional(),
            })
          )
          .optional(),
        tools: z
          .array(
            z.discriminatedUnion("type", [
              z.object({
                type: z.literal("end_call"),
                name: z.string(),
                description: z.string(),
              }),
              z.object({
                type: z.literal("transfer_call"),
                name: z.string(),
                description: z.string(),
                transfer_destination: z.discriminatedUnion("type", [
                  z.object({
                    type: z.literal("predefined"),
                    value: z.enum(["voicemail", "operator"]),
                    number: z.string(),
                  }),
                  z.object({
                    type: z.literal("inferred"),
                    description: z.string(),
                    prompt: z.string(),
                  }),
                ]),
              }),
              z.object({
                type: z.literal("check_availability_cal"),
                name: z.string(),
                description: z.string(),
                calendar_url: z.string(),
                cal_api_key: z.string(),
                event_type_id: z.number(),
              }),
              z.object({
                type: z.literal("book_appointment_cal"),
                name: z.string(),
                description: z.string(),
                calendar_url: z.string(),
                cal_api_key: z.string(),
                event_type_id: z.number(),
              }),
              z.object({
                type: z.literal("press_digit"),
                name: z.string(),
                description: z.string(),
                digit: z.string(),
              }),
              z.object({
                type: z.literal("custom"),
                name: z.string(),
                description: z.string(),
                speak_after_execution: z.boolean(),
                speak_during_execution: z.boolean(),
                url: z.string(),
              }),
            ])
          )
          .optional(),
      })
    )
    .optional(),
  starting_state: z.string().optional(),
  begin_message: z.string().optional(),
  default_dynamic_variables: z.record(z.string()).optional(),
  knowledge_base_ids: z.array(z.string()).optional(),
});

export const RetellLLMOutputSchema = z.object({
  llm_id: z.string(),
  version: z.number(),
  model: z.string().nullable(),
  s2s_model: z.string().nullable(),
  model_temperature: z.number().optional(),
  model_high_priority: z.boolean().optional(),
  tool_call_strict_mode: z.boolean().optional(),
  general_prompt: z.string().nullable().optional(),
  general_tools: z
    .array(
      z.object({
        type: z.string(),
        name: z.string(),
        description: z.string(),
      })
    )
    .nullable()
    .optional(),
  states: z
    .array(
      z.object({
        name: z.string(),
        state_prompt: z.string(),
        edges: z
          .array(
            z.object({
              destination_state_name: z.string(),
              description: z.string(),
              parameters: z
                .object({
                  type: z.literal("object"),
                  properties: z.record(z.any()),
                  required: z.array(z.string()),
                })
                .optional(),
            })
          )
          .optional(),
        tools: z
          .array(
            z.discriminatedUnion("type", [
              z.object({
                type: z.literal("end_call"),
                name: z.string(),
                description: z.string(),
              }),
              z.object({
                type: z.literal("transfer_call"),
                name: z.string(),
                description: z.string(),
                transfer_destination: z.discriminatedUnion("type", [
                  z.object({
                    type: z.literal("predefined"),
                    value: z.enum(["voicemail", "operator"]),
                    number: z.string(),
                  }),
                  z.object({
                    type: z.literal("inferred"),
                    description: z.string(),
                    prompt: z.string(),
                  }),
                ]),
              }),
              z.object({
                type: z.literal("check_availability_cal"),
                name: z.string(),
                description: z.string(),
                calendar_url: z.string(),
                cal_api_key: z.string(),
                event_type_id: z.number(),
              }),
              z.object({
                type: z.literal("book_appointment_cal"),
                name: z.string(),
                description: z.string(),
                calendar_url: z.string(),
                cal_api_key: z.string(),
                event_type_id: z.number(),
              }),
              z.object({
                type: z.literal("press_digit"),
                name: z.string(),
                description: z.string(),
                digit: z.string(),
              }),
              z.object({
                type: z.literal("custom"),
                name: z.string(),
                description: z.string(),
                speak_after_execution: z.boolean(),
                speak_during_execution: z.boolean(),
                url: z.string(),
              }),
            ])
          )
          .optional(),
      })
    )
    .nullable()
    .optional(),
  starting_state: z.string().nullable().optional(),
  begin_message: z.string().nullable().optional(),
  default_dynamic_variables: z.record(z.string()).nullable().optional(),
  knowledge_base_ids: z.array(z.string()).nullable().optional(),
  last_modification_timestamp: z.number(),
});

// ===== Additional Knowledge Base Schemas =====

export const UpdateKnowledgeBaseInputSchema = z.object({
  knowledgeBaseId: z.string().describe("The ID of the knowledge base to update"),
  name: z.string().optional().describe("Updated name of the knowledge base"),
  description: z.string().optional().describe("Updated description of the knowledge base"),
});

export const DeleteKnowledgeBaseInputSchema = z.object({
  knowledgeBaseId: z.string().describe("The ID of the knowledge base to delete"),
});

export const ListKnowledgeBasesInputSchema = z.object({
  limit: z.number().min(1).max(100).optional().describe("Maximum number of knowledge bases to return"),
  offset: z.number().min(0).optional().describe("Number of knowledge bases to skip"),
});

export const CreateKnowledgeBaseDocumentInputSchema = z.object({
  knowledgeBaseId: z.string().describe("The ID of the knowledge base"),
  sourceType: z.enum(["url", "text", "file"]).describe("Type of the source"),
  sourceConfig: z.object({
    url: z.string().url().optional(),
    content: z.string().optional(),
    filename: z.string().optional(),
    title: z.string().optional(),
    description: z.string().optional(),
  }).describe("Configuration for the source"),
});

// ===== Batch Call Schemas =====

export const CreateBatchCallInputSchema = z.object({
  name: z.string().describe("Name of the batch call campaign"),
  from_number: z.string().describe("Phone number to call from"),
  agent_id: z.string().describe("ID of the agent to use for calls"),
  csv_data: z.string().describe("CSV data containing phone numbers and variables"),
  schedule_time: z.number().optional().describe("Unix timestamp to schedule the batch call"),
  max_concurrent_calls: z.number().min(1).max(100).optional().describe("Maximum concurrent calls"),
  retry_on_busy: z.boolean().optional().describe("Whether to retry on busy signals"),
  retry_on_no_answer: z.boolean().optional().describe("Whether to retry on no answer"),
  metadata: z.record(z.string()).optional().describe("Additional metadata for the batch"),
});

export const BatchCallOutputSchema = z.object({
  batch_call_id: z.string(),
  name: z.string(),
  status: z.enum(["pending", "running", "completed", "failed", "cancelled"]),
  from_number: z.string(),
  agent_id: z.string(),
  total_calls: z.number(),
  completed_calls: z.number(),
  failed_calls: z.number(),
  created_at: z.number(),
  started_at: z.number().optional(),
  completed_at: z.number().optional(),
  metadata: z.record(z.string()).optional(),
});

// ===== Import Phone Number Schemas =====

export const ImportPhoneNumberInputSchema = z.object({
  phone_number: z.string().describe("Phone number to import (E.164 format)"),
  carrier: z.string().describe("Carrier/provider of the phone number"),
  nickname: z.string().optional().describe("Nickname for the phone number"),
  inbound_agent_id: z.string().optional().describe("Agent ID for inbound calls"),
  outbound_agent_id: z.string().optional().describe("Agent ID for outbound calls"),
  inbound_webhook_url: z.string().url().optional().describe("Webhook URL for inbound calls"),
});

export const ImportPhoneNumberOutputSchema = z.object({
  phone_number: z.string(),
  phone_number_pretty: z.string(),
  phone_number_type: z.string(),
  carrier: z.string(),
  import_status: z.enum(["pending", "verified", "failed"]),
  verification_code: z.string().optional(),
  verification_required: z.boolean(),
  inbound_agent_id: z.string().nullable(),
  outbound_agent_id: z.string().nullable(),
  nickname: z.string().nullable(),
  inbound_webhook_url: z.string().nullable(),
  imported_at: z.number(),
  last_modification_timestamp: z.number(),
});

// ===== Agent Publishing Schemas =====

export const PublishAgentInputSchema = z.object({
  agentId: z.string().describe("The ID of the agent to publish"),
  version: z.number().optional().describe("Specific version to publish (defaults to latest)"),
});

export const PublishAgentOutputSchema = z.object({
  agent_id: z.string(),
  published_version: z.number(),
  is_published: z.boolean(),
  publication_timestamp: z.number(),
  previous_published_version: z.number().optional(),
});
