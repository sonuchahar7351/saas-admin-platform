import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT } from '../../modules/radis/radic.module';

@Injectable()
export class CacheService {
  constructor(@Inject(REDIS_CLIENT) private redis: Redis) {}

  async getOrSet<T>(
    key: string,
    ttlSeconds: number,
    fetchFn: () => Promise<T>,
  ): Promise<T> {
    const cached = await this.redis.get(key);
    if (cached) return JSON.parse(cached);

    const fresh = await fetchFn();
    await this.redis.set(key, JSON.stringify(fresh), 'EX', ttlSeconds);
    return fresh;
  }

  async del(key: string) {
    await this.redis.del(key);
  }

  // for invalidating everything under a prefix — e.g. "campaign list" has too many
  // filter/sort/page combinations to track individual keys, so on any write we just
  // clear the whole family rather than trying to be surgical about it
  async delByPrefix(prefix: string) {
    const keysToDelete: string[] = [];
    const stream = this.redis.scanStream({ match: `${prefix}*` });
    for await (const keys of stream) {
      keysToDelete.push(...(keys as string[]));
    }
    if (keysToDelete.length) await this.redis.del(...keysToDelete);
  }
}
