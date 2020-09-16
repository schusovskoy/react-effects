const EMPTY = Symbol()
type Empty = typeof EMPTY

type RecordKey = string | symbol | number

type Func<
  T1,
  T2 = Empty,
  T3 = Empty,
  T4 = Empty,
  T5 = Empty,
  T6 = Empty,
  T7 = Empty,
  T8 = Empty,
  T9 = Empty
> = T2 extends Empty
  ? () => T1
  : T3 extends Empty
  ? (a1: T1) => T2
  : T4 extends Empty
  ? (a1: T1, a2: T2) => T3
  : T5 extends Empty
  ? (a1: T1, a2: T2, a3: T3) => T4
  : T6 extends Empty
  ? (a1: T1, a2: T2, a3: T3, a4: T4) => T5
  : T7 extends Empty
  ? (a1: T1, a2: T2, a3: T3, a4: T4, a5: T5) => T6
  : T8 extends Empty
  ? (a1: T1, a2: T2, a3: T3, a4: T4, a5: T5, a6: T6) => T7
  : T9 extends Empty
  ? (a1: T1, a2: T2, a3: T3, a4: T4, a5: T5, a6: T6, a7: T7) => T8
  : (a1: T1, a2: T2, a3: T3, a4: T4, a5: T5, a6: T6, a7: T7, a8: T8) => T9

type Bivariant<T extends (...args: any[]) => unknown> = T extends (
  ...args: infer A
) => infer R
  ? { bivarianceHack(...args: A): R }['bivarianceHack']
  : never

type UnionToIntersection<U> = (
  U extends unknown ? (a: U) => void : never
) extends (a: infer I) => void
  ? I
  : never

type NotUnion<T> = [T] extends [UnionToIntersection<T>] ? unknown : never
type NotNumber<T> = T | number extends T & number ? never : unknown
type NotString<T> = T | string extends T & string ? never : unknown
type NotSymbol<T> = T | symbol extends T & symbol ? never : unknown
type PrimitiveLiteral<T> = (string | number | symbol) &
  NotUnion<T> &
  NotNumber<T> &
  NotString<T> &
  NotSymbol<T>
