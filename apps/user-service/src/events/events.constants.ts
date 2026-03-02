export const EVENTS_EXCHANGE = 'streaming.events';

export const ROUTING_KEYS = {
  USER_CREATED: 'user.created',
  USER_DELETED: 'user.deleted',
} as const;

export const QUEUES = {
  USER_CREATED: 'user-service.user.created',
} as const;
