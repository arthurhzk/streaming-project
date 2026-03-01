import { Injectable } from '@nestjs/common';
import CircuitBreaker from 'opossum';
import { createLogger } from '@repo/logger';

const logger = createLogger('api-gateway');

export type CircuitState = 'closed' | 'open' | 'half-open';

export interface ServiceBreakerConfig {
  name: string;
  url: string;
}

@Injectable()
export class CircuitBreakerService {
  private readonly breakers = new Map<string, CircuitBreaker>();

  register(config: ServiceBreakerConfig): void {
    if (this.breakers.has(config.name)) return;

    const breaker = new CircuitBreaker(async (fn: () => Promise<unknown>) => fn(), {
      timeout: 5000,
      errorThresholdPercentage: 50,
      resetTimeout: 30000,
    });

    breaker.on('open', () => {
      logger.warn({ service: config.name }, `Circuit breaker opened for service ${config.name}`);
    });

    this.breakers.set(config.name, breaker);
  }

  async execute<T>(serviceName: string, fn: () => Promise<T>): Promise<T> {
    const breaker = this.breakers.get(serviceName);
    if (!breaker) {
      throw new Error(`Unknown service: ${serviceName}`);
    }
    return breaker.fire(fn) as Promise<T>;
  }

  getState(serviceName: string): CircuitState | null {
    const breaker = this.breakers.get(serviceName);
    if (!breaker) return null;
    const state = breaker.opened ? 'open' : breaker.halfOpen ? 'half-open' : 'closed';
    return state as CircuitState;
  }

  getBreaker(serviceName: string): CircuitBreaker | undefined {
    return this.breakers.get(serviceName);
  }

  getRegisteredServices(): string[] {
    return Array.from(this.breakers.keys());
  }
}
