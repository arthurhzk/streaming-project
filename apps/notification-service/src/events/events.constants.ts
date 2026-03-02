export const EVENTS_EXCHANGE = 'streaming.events';

export const ROUTING_KEYS = {
  WELCOME_EMAIL: 'send.welcome.email',
} as const;

export const QUEUES = {
  WELCOME_EMAIL: 'notification-service.send.welcome.email',
} as const;
