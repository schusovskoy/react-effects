import { useMemo, useState, useEffect } from 'react'
import { effect as E } from '@matechs/core'
import * as O from 'fp-ts/lib/Option'
import * as A from 'fp-ts/lib/Array'
import { ownKeys, createRecord, path, eqShallow, currentTimeS } from './utils'
import { pipe } from 'fp-ts/lib/pipeable'

type EffectResult<T> = T extends E.Effect<unknown, unknown, unknown, infer R>
  ? R
  : never
type EffectError<T> = T extends E.Effect<unknown, unknown, infer R, unknown>
  ? R
  : never
type EffectEnv<T> = T extends E.Effect<unknown, infer R, unknown, unknown>
  ? R
  : never

type SubscribeHandler<K extends RecordKey, T> = (id: K, value: T) => void
type SubUnsub<K extends RecordKey, T> = (
  handler: SubscribeHandler<K, T>,
) => void

type Setter<T> = Bivariant<(value: T) => void>
type Getter<T> = () => T
type Setable<T> = { setState: Setter<T> }
type Getable<T> = { getState: Getter<T> }
type State<K extends RecordKey, T> = Setable<T> &
  Getable<T> & {
    subscribe: SubUnsub<K, T>
    unsubscribe: SubUnsub<K, T>
  }

const State = class<K extends RecordKey, T> implements State<K, T> {
  #state: T
  readonly #id: K
  readonly #handlers = new Set<SubscribeHandler<K, T>>()
  constructor(id: K, value: T) {
    this.#id = id
    this.#state = value
  }
  getState: Getter<T> = () => this.#state
  setState: Setter<T> = a => {
    this.#state = a
    this.#handlers.forEach(handler => handler(this.#id, a))
  }
  subscribe: SubUnsub<K, T> = handler => this.#handlers.add(handler)
  unsubscribe: SubUnsub<K, T> = handler => this.#handlers.delete(handler)
}

type StateEnv<K extends RecordKey, T> = Record<K, State<K, T>>
type GetableEnv<K extends RecordKey, T> = Record<K, Getable<T>>
type SetableEnv<K extends RecordKey, T> = Record<K, Setable<T>>
type StateEnvCreator = <K extends RecordKey, T>(
  id: K,
  initialValue: T,
) => [
  () => StateEnv<K, T>,
  E.SyncR<GetableEnv<K, T>, T>,
  (state: T) => E.SyncR<SetableEnv<K, T>, T>,
]

export const createStateEnv: StateEnvCreator = (id, initialValue) => [
  () => createRecord(id, new State(id, initialValue)),
  E.access(({ [id]: { getState } }) => getState()),
  state =>
    E.access(({ [id]: { setState } }) => {
      setState(state)
      return state
    }),
]

type CreateEnvHook = <K extends RecordKey, T extends StateEnv<K, unknown>>(
  stateEnvThunk: () => T,
) => T

export const useCreateEnv: CreateEnvHook = stateEnvThunk =>
  useMemo(stateEnvThunk, [])

type StateType<
  T extends StateEnv<RecordKey, unknown>,
  K extends RecordKey
> = ReturnType<T[K]['getState']>
type EnvStateHook = <
  K extends RecordKey,
  T extends StateEnv<K, StateType<T, K>>
>(
  id: K,
  env: T,
) => [StateType<T, K>, Setter<StateType<T, K>>]

export const useEnvState: EnvStateHook = (id, env) => {
  const [state, setState] = useState(env[id].getState())

  useEffect(() => {
    const handler: SubscribeHandler<typeof id, typeof state> = (id, value) =>
      setState(value)
    env[id].subscribe(handler)
    return () => env[id].unsubscribe(handler)
  })

  return [state, env[id].setState]
}

type HandlerHook = <A extends unknown[], R>(
  handler: (...args: A) => E.AsyncR<R, unknown>,
  env: R,
) => (...args: A) => void

export const useHandler: HandlerHook = (handler, env) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const provideEnv = useMemo(() => E.provideAll(env), [])
  return useMemo(
    () => (...args) => {
      const effect = handler(...args)
      E.run(provideEnv(effect))
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )
}

type SelectorHook = <R extends object, T>(
  selector: E.AsyncR<R, T>,
  env: R,
) => T | undefined

export const useSelector: SelectorHook = (selector, env) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const effect = useMemo(() => E.provideAll(env)(selector), [])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const envKeys = useMemo(() => ownKeys(env), [])
  const [state, setState] = useState<EffectResult<typeof effect>>()

  useEffect(() => {
    const handler = () =>
      E.runToPromise(effect).then(a => {
        if (a === state) return
        setState(a)
      })
    handler()

    envKeys.forEach(id =>
      O.option.map(
        path([id, 'subscribe'])(env),
        subscribe => typeof subscribe === 'function' && subscribe(handler),
      ),
    )
    return () =>
      envKeys.forEach(id =>
        O.option.map(
          path([id, 'unsubscribe'])(env),
          unsubscribe =>
            typeof unsubscribe === 'function' && unsubscribe(handler),
        ),
      )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return state
}

type SelectHandlerHook = <R extends object, T, A extends unknown[]>(
  selectHandler: (...args: A) => E.AsyncR<R, T>,
  env: R,
  args: A,
) => T | undefined

export const useSelectHandler: SelectHandlerHook = (
  selectHandler,
  env,
  args,
) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const effect = useMemo(() => E.provideAll(env)(selectHandler(...args)), args)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const envKeys = useMemo(() => ownKeys(env), [])
  const [state, setState] = useState<EffectResult<typeof effect>>()

  useEffect(() => {
    const handler = () =>
      E.runToPromise(effect).then(a => {
        if (a === state) return
        setState(a)
      })
    handler()

    envKeys.forEach(id =>
      O.option.map(
        path([id, 'subscribe'])(env),
        subscribe => typeof subscribe === 'function' && subscribe(handler),
      ),
    )
    return () =>
      envKeys.forEach(id =>
        O.option.map(
          path([id, 'unsubscribe'])(env),
          unsubscribe =>
            typeof unsubscribe === 'function' && unsubscribe(handler),
        ),
      )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effect])

  return state
}

type EffectMemoizer = <K extends RecordKey>(
  keys: K[],
  ttl?: number,
) => <R extends Record<K, Getable<unknown>>, E, T>(
  effect: E.AsyncRE<R, E, T>,
) => E.AsyncRE<R, E, T>

export const memoizeEffect: EffectMemoizer = (
  keys,
  ttl = Infinity,
) => effect => {
  type Eff = typeof effect
  type Env = EffectEnv<Eff>
  type Err = EffectError<Eff>
  type Res = EffectResult<Eff>

  const envKeysCache = new WeakMap<Env, unknown[]>()
  const envValueCache = new WeakMap<Env, Eff>()
  const envAwaitCache = new WeakMap<Env, Eff>()
  const envResolveCache = new WeakMap<Env, Func<Res, void>>()
  const envRejectCache = new WeakMap<Env, Func<Err, void>>()
  const envCacheTime = new WeakMap<Env, number>()

  return pipe(
    E.accessEnvironment<Env>(),
    E.chain(env => {
      const currentTime = currentTimeS()
      const keysValues = A.array.map(keys, key => env[key].getState())
      const keysCache = envKeysCache.get(env)
      const valueCache = envValueCache.get(env)
      const awaitCache = envAwaitCache.get(env)
      const cacheTime = envCacheTime.get(env) || currentTime
      const keysCacheValid =
        !!keysCache &&
        currentTime - cacheTime <= ttl &&
        eqArray.equals(keysCache, keysValues)

      if (keysCacheValid && valueCache) return valueCache
      if (keysCacheValid && awaitCache) return awaitCache
      if (keysCacheValid) {
        const cache = E.fromPromiseMap(err => err as Err)(
          () =>
            new Promise<Res>((res, rej) => {
              envResolveCache.set(env, res)
              envRejectCache.set(env, rej)
            }),
        )
        envAwaitCache.set(env, cache)
        return cache
      }

      envKeysCache.set(env, keysValues)
      envValueCache.delete(env)
      envCacheTime.delete(env)
      return pipe(
        effect,
        E.chain(value => {
          const valueCache = E.pure(value)
          envValueCache.set(env, valueCache)
          envCacheTime.set(env, currentTimeS())
          envResolveCache.get(env)?.(value as Res)
          envResolveCache.delete(env)
          envRejectCache.delete(env)
          envAwaitCache.delete(env)
          return valueCache
        }),
        E.mapError(error => {
          envRejectCache.get(env)?.(error as Err)
          envValueCache.delete(env)
          envCacheTime.delete(env)
          envKeysCache.delete(env)
          envResolveCache.delete(env)
          envRejectCache.delete(env)
          envAwaitCache.delete(env)
          return error
        }),
      )
    }),
  )
}

type EffectHandlerMemoizer = <K extends RecordKey>(
  keys: K[],
  ttl?: number,
) => <A extends unknown[], R extends Record<K, Getable<unknown>>, E, T>(
  effectHandler: (...args: A) => E.AsyncRE<R, E, T>,
) => (...args: A) => E.AsyncRE<R, E, T>

export const memoizeEffectHandler: EffectHandlerMemoizer = (
  keys,
  ttl = Infinity,
) => effectHandler => {
  const memoizeForKeys = memoizeEffect(keys)
  let argsCache: Parameters<typeof effectHandler> | undefined
  let effectCache: ReturnType<typeof effectHandler> | undefined
  let cacheTime: number | undefined

  return (...args) => {
    const currentTime = currentTimeS()
    const argsCacheValid =
      !!argsCache &&
      currentTime - (cacheTime || currentTime) <= ttl &&
      eqArray.equals(args, argsCache)

    if (argsCacheValid && effectCache) return effectCache

    argsCache = args
    cacheTime = undefined
    return (effectCache = pipe(
      effectHandler(...args),
      E.map(value => {
        cacheTime = currentTimeS()
        return value
      }),
      E.mapError(error => {
        cacheTime = undefined
        return error
      }),
      memoizeForKeys,
    ))
  }
}

const eqArray = A.getEq(eqShallow)
