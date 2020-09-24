import { effect as E } from '@matechs/core'
import { memoizeEffectHandler } from './effect'

type QueryCacher = (
  ttl?: number,
) => <A extends unknown[], R, E, T>(
  effectHandler: (...args: A) => E.AsyncRE<R, E, T>,
) => (...args: A) => E.AsyncRE<R, E, T>

export const cacheQuery: QueryCacher = ttl => memoizeEffectHandler([], ttl)
