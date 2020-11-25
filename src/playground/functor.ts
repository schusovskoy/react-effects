interface Types<A, B = Empty, C = Empty> {}
type Type<T, A, B = Empty, C = Empty> = T extends keyof Types<any>
  ? Types<A, B, C>[T]
  : never
type TypeClass<T> = { readonly URI: T }

//

interface Functor<F, T> extends TypeClass<F> {
  map: <B>(fn: (a: T) => B) => Type<F, B>
}

const map: <A, B, F>(f: Functor<F, A>, fn: (a: A) => B) => Type<F, B> = (
  f,
  fn,
) => f.map(fn)

const lift: <A, B>(
  fn: (a: A) => B,
) => <F>(f: Functor<F, A>) => Type<F, B> = fn => f => f.map(fn)

//

declare const ID: unique symbol
type ID = typeof ID
interface Types<A> {
  [ID]: Id<A>
}

class Id<T> implements Functor<ID, T> {
  declare URI: ID

  constructor(private value: T) {}

  map<B>(fn: (a: T) => B) {
    return new Id(fn(this.value))
  }
}

const a = map(new Id(1), a => '')

//

declare const ARRAY: unique symbol
type ARRAY = typeof ARRAY
interface Types<A> {
  [ARRAY]: Array<A>
}

declare global {
  interface Array<T> {
    readonly URI: ARRAY
  }
}

const b = map([1, 2], a => a + '')

//

const exclaimNumber: Func<number, string> = a => a + '!'
const liftedExclaim = lift(exclaimNumber)
const res = liftedExclaim([2])
const res2 = liftedExclaim(new Id(2))

export default {}
