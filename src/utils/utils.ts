import * as A from 'fp-ts/lib/Array'
import * as O from 'fp-ts/lib/Option'
import * as T from 'io-ts'
import * as Eq from 'fp-ts/lib/Eq'
import { effect as E } from '@matechs/core'
import { pipe } from 'fp-ts/lib/pipeable'

type OwnKeysGetter = (obj: object) => RecordKey[]

export const ownKeys: OwnKeysGetter = obj => [
  ...Object.keys(obj),
  ...Object.getOwnPropertySymbols(obj),
]

type RecordCreator = <K extends RecordKey, T>(key: K, value: T) => Record<K, T>

export const createRecord: RecordCreator = (key, value) =>
  ({ [key]: value } as Record<typeof key, typeof value>)

type PropGetter = (key: RecordKey) => (obj: unknown) => O.Option<unknown>

export const prop: PropGetter = key => obj =>
  typeof obj === 'object' && obj !== null && obj.hasOwnProperty(key)
    ? O.some((obj as any)[key])
    : O.none

type PathGetter = (path: RecordKey[]) => (obj: unknown) => O.Option<unknown>

export const path: PathGetter = path => obj =>
  A.array.reduce(path, O.some(obj), (acc, a) =>
    O.option.chain(acc, b => prop(a)(b)),
  )

type EffectfullDecode = <A, O, I>(
  type: T.Type<A, O, I>,
) => (obj: I) => E.SyncE<T.Errors, A>

export const decodeE: EffectfullDecode = type => obj =>
  pipe(type.decode(obj), E.encaseEither)

type Predicate = (a: unknown, b: unknown) => boolean

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is
const is: Predicate = (a, b) =>
  // @ts-ignore
  // eslint-disable-next-line no-self-compare
  a === b ? a !== 0 || 1 / a === 1 / b : a !== a && b !== b

export const shallowEqual: Predicate = (a, b) => {
  if (is(a, b)) return true
  if (
    typeof a !== 'object' ||
    a === null ||
    typeof b !== 'object' ||
    b === null
  )
    return false
  const keysA = Object.keys(a)
  const keysB = Object.keys(b)
  if (keysA.length !== keysB.length) return false

  for (let i = 0; i < keysA.length; i++) {
    if (
      !Object.prototype.hasOwnProperty.call(b, keysA[i]) ||
      !is(
        (a as { [key: string]: unknown })[keysA[i]],
        (b as { [key: string]: unknown })[keysA[i]],
      )
    ) {
      return false
    }
  }

  return true
}

export const eqShallow = Eq.fromEquals(shallowEqual)

export const currentTimeS: Func<number> = () =>
  Math.floor(new Date().valueOf() / 1000)

type ApplyFunc = <T extends unknown[], R>(
  fn: (...args: T) => R,
) => (args: T) => R

export const apply: ApplyFunc = fn => args => fn(...args)
