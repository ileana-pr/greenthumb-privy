import type { Plugin } from '@elizaos/core';
import {
  type Action,
  type Content,
  type HandlerCallback,
  type IAgentRuntime,
  type Memory,
  type Provider,
  type ProviderResult,
  Service,
  type State,
  logger,
} from '@elizaos/core';
import { z } from 'zod';

// constants to replace magic strings and numbers
const PLUGIN_CONFIG = {
  NAME: 'starter',
  DESCRIPTION: 'A starter plugin for Eliza',
  PRIORITY: -1000, // set lowest priority so real models take precedence
  SERVICE_TYPE: 'starter',
} as const;

const SOCKET_EVENTS = {
  MESSAGE_BROADCAST: 'messageBroadcast',
  MESSAGE: 'message', 
  AGENT_RESPONSE: 'agentResponse',
  NEW_MESSAGE: 'newMessage',
  MESSAGE_RECEIVED: 'messageReceived',
  MESSAGE_COMPLETE: 'messageComplete',
} as const;

const ROUTES = {
  HELLO_WORLD: '/helloworld',
  HEALTH_CHECK: '/api/health',
} as const;

const ROUTE_NAMES = {
  HELLO_WORLD: 'helloworld',
  HEALTH: 'health',
} as const;

const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  OPTIONS: 'OPTIONS',
} as const;

const HTTP_STATUS = {
  OK: 200,
  INTERNAL_SERVER_ERROR: 500,
} as const;

const CORS_CONFIG = {
  ORIGIN_HEADER: 'Access-Control-Allow-Origin',
  METHODS_HEADER: 'Access-Control-Allow-Methods',
  HEADERS_HEADER: 'Access-Control-Allow-Headers',
  ALLOW_ALL_ORIGINS: '*',
  ALLOWED_METHODS: 'GET, POST, OPTIONS',
  ALLOWED_HEADERS: 'Content-Type',
} as const;

const ACTION_CONFIG = {
  NAME: 'HELLO_WORLD',
  SIMILES: ['GREET', 'SAY_HELLO'],
  DESCRIPTION: 'Responds with a simple hello world message',
  RESPONSE_TEXT: 'hello world!',
} as const;

const PROVIDER_CONFIG = {
  NAME: 'HELLO_WORLD_PROVIDER',
  DESCRIPTION: 'A simple example provider',
  RESPONSE_TEXT: 'I am a provider',
} as const;

const AGENT_CONFIG = {
  NAME: 'GreenThumb',
} as const;

const RESPONSE_MESSAGES = {
  HELLO_WORLD: 'Hello World!',
  HEALTH_OK: 'ok',
  HEALTH_ERROR: 'error',
  INTERNAL_ERROR: 'internal server error',
  HELLO_WORLD_FAILED: 'failed to process helloworld request',
  HEALTH_CHECK_FAILED: 'failed to process health check request',
  HEALTH_CHECK_ERROR: 'health check failed',
} as const;

const LOG_MESSAGES = {
  PLUGIN_INIT: '*** Initializing starter plugin ***',
  SERVICE_START: '*** Starting starter service ***',
  SERVICE_STOP: '*** Stopping starter service ***',
  SERVICE_INSTANCE_STOP: '*** Stopping starter service instance ***',
  SERVICE_INSTANCE_STOPPED: '*** Starter service instance stopped successfully ***',
  SERVICE_NOT_FOUND: 'Starter service not found during stop - may have already been stopped',
  HELLO_WORLD_ROUTE: '[Route] /helloworld endpoint hit',
  HEALTH_ROUTE: '[Route] /api/health endpoint hit - connection check',
  HELLO_WORLD_ERROR: '[Route] Error in /helloworld handler:',
  HEALTH_ERROR: '[Route] Error in /api/health handler:',
  HELLO_WORLD_ACTION: 'Handling HELLO_WORLD action',
  ACTION_ERROR: 'Error in HELLO_WORLD action:',
  CONFIG_SET: 'Set environment variable:',
  CONFIG_SKIP: 'Environment variable already set, skipping:',
  RUNTIME_MISSING: 'No runtime provided for socket server lookup',
  SOCKET_FOUND: 'Socket.IO server found',
  SOCKET_NOT_FOUND: 'Socket.IO server not found in any expected location',
  SOCKET_CHECK_FAILED: 'Socket server location check failed:',
  MESSAGE_PUBLISHED: 'MESSAGE_PUBLISHED event received - attempting to broadcast to Socket.IO clients',
  SOCKET_SERVER_STATUS: 'Socket server found:',
  MESSAGE_DATA: 'Message data:',
  SOCKET_WARNING: 'Socket.IO server not found or no message data available',
  CHANNEL_WARNING: 'No channelId found in message, cannot broadcast',
  BROADCAST_SUCCESS: '✅ Successfully broadcast agent response via Socket.IO',
  BROADCAST_ERROR: '❌ Error in MESSAGE_PUBLISHED handler:',
  EVENT_RECEIVED: 'event received',
  PARAMS_KEYS: 'Available params keys:',
  BROADCAST_ATTEMPT: '🚨 Broadcasting agent response to channel',
  PLUGIN_VARIABLE_WARNING: 'example plugin variable is not provided',
} as const;

// Type definitions for better type safety
interface RouteRequest {
  params?: Record<string, string>;
  query?: Record<string, string>;
  body?: any;
  headers?: Record<string, string>;
}

interface RouteResponse {
  json: (data: any) => void;
  setHeader: (name: string, value: string) => void;
  status?: (code: number) => RouteResponse;
}

interface MessagePublishedParams {
  runtime?: IAgentRuntime;
  agentRuntime?: IAgentRuntime;
  message?: {
    id?: string;
    content?: {
      text?: string;
    };
    text?: string;
    authorId?: string;
    userId?: string;
    channelId?: string;
    roomId?: string;
    createdAt?: string;
    source?: string;
  };
}

/**
 * Define the configuration schema for the plugin with the following properties:
 *
 * @param {string} EXAMPLE_PLUGIN_VARIABLE - The name of the plugin (min length of 1, optional)
 * @returns {object} - The configured schema object
 */
const configSchema = z.object({
  EXAMPLE_PLUGIN_VARIABLE: z
    .string()
    .min(1, 'Example plugin variable is not provided')
    .optional()
    .transform((val) => {
      if (!val) {
        logger.warn(LOG_MESSAGES.PLUGIN_VARIABLE_WARNING);
      }
      return val;
    }),
});

/**
 * Example HelloWorld action
 * This demonstrates the simplest possible action structure
 */
/**
 * Represents an action that responds with a simple hello world message.
 *
 * @typedef {Object} Action
 * @property {string} name - The name of the action
 * @property {string[]} similes - The related similes of the action
 * @property {string} description - Description of the action
 * @property {Function} validate - Validation function for the action
 * @property {Function} handler - The function that handles the action
 * @property {Object[]} examples - Array of examples for the action
 */
const helloWorldAction: Action = {
  name: ACTION_CONFIG.NAME,
  similes: [...ACTION_CONFIG.SIMILES],
  description: ACTION_CONFIG.DESCRIPTION,

  validate: async (_runtime: IAgentRuntime, _message: Memory, _state: State | undefined): Promise<boolean> => {
    // Always valid
    return true;
  },

  handler: async (
    _runtime: IAgentRuntime,
    message: Memory,
    _state: State | undefined,
    _options: { [key: string]: unknown } | undefined,
    callback: HandlerCallback | undefined,
    _responses: Memory[] | undefined
  ) => {
    try {
      logger.info(LOG_MESSAGES.HELLO_WORLD_ACTION);

      // Simple response content
      const responseContent: Content = {
        text: ACTION_CONFIG.RESPONSE_TEXT,
        actions: [ACTION_CONFIG.NAME],
        source: message.content.source,
      };

      // Call back with the hello world message
      await callback?.(responseContent);

      return true;
    } catch (error) {
      logger.error(LOG_MESSAGES.ACTION_ERROR, error);
      throw error;
    }
  },

  examples: [
    [
      {
        name: '{{name1}}',
        content: {
          text: 'Can you say hello?',
        },
      },
      {
        name: '{{name2}}',
        content: {
          text: 'hello world!',
          actions: ['HELLO_WORLD'],
        },
      },
    ],
  ],
};

/**
 * Example Hello World Provider
 * This demonstrates the simplest possible provider implementation
 */
const helloWorldProvider: Provider = {
  name: PROVIDER_CONFIG.NAME,
  description: PROVIDER_CONFIG.DESCRIPTION,

  get: async (
    _runtime: IAgentRuntime,
    _message: Memory,
    _state: State
  ): Promise<ProviderResult> => {
    return {
      text: PROVIDER_CONFIG.RESPONSE_TEXT,
      values: {},
      data: {},
    };
  },
};

/**
 * Helper function to add CORS headers to response
 */
function addCorsHeaders(res: RouteResponse): void {
  res.setHeader(CORS_CONFIG.ORIGIN_HEADER, CORS_CONFIG.ALLOW_ALL_ORIGINS);
  res.setHeader(CORS_CONFIG.METHODS_HEADER, CORS_CONFIG.ALLOWED_METHODS);
  res.setHeader(CORS_CONFIG.HEADERS_HEADER, CORS_CONFIG.ALLOWED_HEADERS);
}

/**
 * Helper function to create broadcast data from message
 */
function createBroadcastData(message: any): any {
  const channelId = message.channelId || message.roomId || message.room?.id;
  
  return {
    id: message.id,
    content: message.content,
    authorId: message.authorId || message.userId || message.entityId,
    channelId: channelId,
    timestamp: message.createdAt || message.timestamp || new Date().toISOString(),
    source: message.source || message.content?.source || 'agent_response',
    text: message.content?.text || message.text || message.content
  };
}

/**
 * Helper function to emit message to multiple socket events
 */
function broadcastMessage(socketServer: any, channelId: string, broadcastData: any): void {
  // emit to specific channel
  socketServer.to(channelId).emit(SOCKET_EVENTS.MESSAGE_BROADCAST, broadcastData);
  socketServer.to(channelId).emit(SOCKET_EVENTS.MESSAGE, broadcastData);
  socketServer.to(channelId).emit(SOCKET_EVENTS.AGENT_RESPONSE, broadcastData);
  socketServer.to(channelId).emit(SOCKET_EVENTS.NEW_MESSAGE, broadcastData);
  socketServer.to(channelId).emit(SOCKET_EVENTS.MESSAGE_RECEIVED, broadcastData);
  socketServer.to(channelId).emit(SOCKET_EVENTS.MESSAGE_COMPLETE, broadcastData);
  
  // also broadcast to all connected clients as a fallback
  socketServer.emit(SOCKET_EVENTS.MESSAGE_BROADCAST, broadcastData);
  socketServer.emit(SOCKET_EVENTS.AGENT_RESPONSE, broadcastData);
}

/**
 * Helper function to safely get Socket.IO server from runtime
 * Returns null if not found to avoid errors
 */
function getSocketServer(runtime: IAgentRuntime | null | undefined): any {
  if (!runtime) {
    logger.debug(LOG_MESSAGES.RUNTIME_MISSING);
    return null;
  }

  // Check common locations where Socket.IO server might be attached
  const locations = [
    () => (runtime as any).socketServer,
    () => (runtime as any).server?.io,
    () => (runtime as any).io,
    () => (runtime as any).httpServer?.io,
  ];

  for (const getServer of locations) {
    try {
      const server = getServer();
      if (server && typeof server.emit === 'function') {
        logger.debug(LOG_MESSAGES.SOCKET_FOUND);
        return server;
      }
    } catch (error) {
      // Continue to next location if this one fails
      logger.debug(LOG_MESSAGES.SOCKET_CHECK_FAILED, error);
    }
  }

  logger.debug(LOG_MESSAGES.SOCKET_NOT_FOUND);
  return null;
}

export class StarterService extends Service {
  static serviceType = PLUGIN_CONFIG.SERVICE_TYPE;
  capabilityDescription =
    'This is a starter service which is attached to the agent through the starter plugin.';

  constructor(runtime: IAgentRuntime) {
    super(runtime);
  }

  static async start(runtime: IAgentRuntime) {
    logger.info(LOG_MESSAGES.SERVICE_START);
    const service = new StarterService(runtime);
    return service;
  }

  static async stop(runtime: IAgentRuntime) {
    logger.info(LOG_MESSAGES.SERVICE_STOP);
    // get the service from the runtime
    const service = runtime.getService(StarterService.serviceType);
    if (!service) {
      logger.warn(LOG_MESSAGES.SERVICE_NOT_FOUND);
      return;
    }
    await service.stop();
  }

  async stop() {
    logger.info(LOG_MESSAGES.SERVICE_INSTANCE_STOP);
    // Add any cleanup logic here (close connections, clear timers, etc.)
    // For now, just log that the service has been stopped
    logger.info(LOG_MESSAGES.SERVICE_INSTANCE_STOPPED);
  }
}

const plugin: Plugin = {
  name: PLUGIN_CONFIG.NAME,
  description: PLUGIN_CONFIG.DESCRIPTION,
  // set lowest priority so real models take precedence
  priority: PLUGIN_CONFIG.PRIORITY,
  config: {
    EXAMPLE_PLUGIN_VARIABLE: process.env.EXAMPLE_PLUGIN_VARIABLE,
  },
  async init(config: Record<string, string>) {
    logger.info(LOG_MESSAGES.PLUGIN_INIT);
    try {
      const validatedConfig = await configSchema.parseAsync(config);

      // set environment variables only if they're not already set
      for (const [key, value] of Object.entries(validatedConfig)) {
        if (value && !process.env[key]) {
          process.env[key] = value;
          logger.debug(`${LOG_MESSAGES.CONFIG_SET} ${key}`);
        } else if (value && process.env[key]) {
          logger.debug(`${LOG_MESSAGES.CONFIG_SKIP} ${key}`);
        }
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(
          `Invalid plugin configuration: ${error.errors.map((e) => e.message).join(', ')}`
        );
      }
      throw error;
    }
  },
  // removed model overrides to let real AI work
  routes: [
    {
      name: ROUTE_NAMES.HELLO_WORLD,
      path: ROUTES.HELLO_WORLD,
      type: HTTP_METHODS.GET,
      handler: async (_req: RouteRequest, res: RouteResponse) => {
        try {
          addCorsHeaders(res);
          
          logger.info(LOG_MESSAGES.HELLO_WORLD_ROUTE);
          res.json({
            message: RESPONSE_MESSAGES.HELLO_WORLD,
          });
        } catch (error) {
          logger.error(LOG_MESSAGES.HELLO_WORLD_ERROR, error);
          res.status?.(HTTP_STATUS.INTERNAL_SERVER_ERROR);
          res.json({
            error: RESPONSE_MESSAGES.INTERNAL_ERROR,
            message: RESPONSE_MESSAGES.HELLO_WORLD_FAILED
          });
        }
      },
    },
    // add health check endpoint
    {
      name: ROUTE_NAMES.HEALTH,
      path: ROUTES.HEALTH_CHECK,
      type: HTTP_METHODS.GET,
      handler: async (_req: RouteRequest, res: RouteResponse) => {
        try {
          addCorsHeaders(res);
          
          logger.info(LOG_MESSAGES.HEALTH_ROUTE);
          res.json({ 
            status: RESPONSE_MESSAGES.HEALTH_OK, 
            timestamp: new Date().toISOString(),
            agent: AGENT_CONFIG.NAME
          });
        } catch (error) {
          logger.error(LOG_MESSAGES.HEALTH_ERROR, error);
          res.status?.(HTTP_STATUS.INTERNAL_SERVER_ERROR);
          res.json({
            status: RESPONSE_MESSAGES.HEALTH_ERROR,
            error: RESPONSE_MESSAGES.HEALTH_CHECK_ERROR,
            message: RESPONSE_MESSAGES.HEALTH_CHECK_FAILED
          });
        }
      },
    },

  ],
  events: {
    MESSAGE_RECEIVED: [
      async (params: any) => {
        logger.info(`MESSAGE_RECEIVED ${LOG_MESSAGES.EVENT_RECEIVED}`);
        logger.info(LOG_MESSAGES.PARAMS_KEYS, Object.keys(params));
        
        try {
          // check if this is an agent response that should be broadcasted
          const runtime = params.runtime;
          const message = params.message;
          
          // only broadcast if this is an agent response (not a user message)
          if (message && runtime && (
            (message as any).userId === runtime.agentId || 
            (message as any).authorId === runtime.agentId ||
            // check if the message content source indicates it's from the agent
            message.content?.source === 'agent_response'
          )) {
            logger.info('🤖 Detected agent response message, attempting to broadcast to Socket.IO clients');
            
            const socketServer = getSocketServer(runtime);
            logger.info(LOG_MESSAGES.SOCKET_SERVER_STATUS, !!socketServer);
            logger.info(LOG_MESSAGES.MESSAGE_DATA, message);
            
            if (!socketServer || !message) {
              logger.warn(LOG_MESSAGES.SOCKET_WARNING);
              return;
            }

            const broadcastData = createBroadcastData(message);
            const channelId = broadcastData.channelId;
            
            if (!channelId) {
              logger.warn(LOG_MESSAGES.CHANNEL_WARNING);
              return;
            }

            logger.info(`${LOG_MESSAGES.BROADCAST_ATTEMPT} ${channelId}:`, broadcastData);
            broadcastMessage(socketServer, channelId, broadcastData);
            logger.info(LOG_MESSAGES.BROADCAST_SUCCESS);
          } else {
            logger.debug('📝 User message received, no broadcast needed');
          }
          
        } catch (error) {
          logger.error(LOG_MESSAGES.BROADCAST_ERROR, error);
        }
      },
    ],
    MESSAGE_PUBLISHED: [
      async (params: MessagePublishedParams) => {
        logger.info(LOG_MESSAGES.MESSAGE_PUBLISHED);
        logger.info(LOG_MESSAGES.PARAMS_KEYS, Object.keys(params));
        
        try {
          const { runtime, message, agentRuntime } = params;
          const actualRuntime = runtime || agentRuntime;
          
          const socketServer = getSocketServer(actualRuntime);
          logger.info(LOG_MESSAGES.SOCKET_SERVER_STATUS, !!socketServer);
          logger.info(LOG_MESSAGES.MESSAGE_DATA, message);
          
          if (!socketServer || !message) {
            logger.warn(LOG_MESSAGES.SOCKET_WARNING);
            return;
          }

          const broadcastData = createBroadcastData(message);
          const channelId = broadcastData.channelId;
          
          if (!channelId) {
            logger.warn(LOG_MESSAGES.CHANNEL_WARNING);
            return;
          }

          logger.info(`${LOG_MESSAGES.BROADCAST_ATTEMPT} ${channelId}:`, broadcastData);
          broadcastMessage(socketServer, channelId, broadcastData);
          logger.info(LOG_MESSAGES.BROADCAST_SUCCESS);
          
        } catch (error) {
          logger.error(LOG_MESSAGES.BROADCAST_ERROR, error);
        }
      },
    ],
    VOICE_MESSAGE_RECEIVED: [
      async (params) => {
        logger.info(`VOICE_MESSAGE_RECEIVED ${LOG_MESSAGES.EVENT_RECEIVED}`);
        // print the keys
        logger.info(Object.keys(params));
      },
    ],
    WORLD_CONNECTED: [
      async (params) => {
        logger.info(`WORLD_CONNECTED ${LOG_MESSAGES.EVENT_RECEIVED}`);
        // print the keys
        logger.info(Object.keys(params));
      },
    ],
    WORLD_JOINED: [
      async (params) => {
        logger.info(`WORLD_JOINED ${LOG_MESSAGES.EVENT_RECEIVED}`);
        // print the keys
        logger.info(Object.keys(params));
      },
    ],
  },
  services: [StarterService],
  actions: [helloWorldAction],
  providers: [helloWorldProvider],
};

export default plugin;
