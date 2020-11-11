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

//

class Id<T> implements Functor<'@@my/Id', T> {
  declare URI: '@@my/Id'

  constructor(private value: T) {}

  map: <B>(fn: (a: T) => B) => Id<B> = fn => new Id(fn(this.value))
}

interface Types<A> {
  ['@@my/Id']: Id<A>
}

const a = map(new Id(1), a => '')

export default {}
