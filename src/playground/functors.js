class Identity {
  static of(value) {
    return new Identity(value)
  }

  constructor(value) {
    this.value = value
  }

  invoke(fn) {
    return Identity.of(fn(this.value))
  }
}

const invoke = fn => functor => functor.invoke(fn)

const functorInstance = Identity.of(5)

// identity law
// invoke(id) == id;

const id = a => a

console.log(id(functorInstance))
console.log(invoke(id)(functorInstance))

// composition law
// compose(invoke(f), invoke(g)) == invoke(compose(f, g));

const compose = (...fns) => (...args) =>
  fns.reduceRight((acc, fn) => [fn.apply(null, acc)], args)[0]

console.log(
  compose(
    invoke(x => x * 2),
    invoke(x => x + 2),
  )(functorInstance),
)
console.log(
  invoke(
    compose(
      x => x * 2,
      x => x + 2,
    ),
  )(functorInstance),
)

//

class Maybe {
  static of(value) {
    return new Maybe(true, value)
  }

  static get nothing() {
    return new Maybe(false)
  }

  constructor(isJust, value) {
    if (!isJust) {
      this.tag = 'NOTHING'
      return
    }
    this.tag = 'JUST'
    this.value = value
  }

  map(fn) {
    return this.tag === 'NOTHING' ? this : Maybe.of(fn(this.value))
  }

  join() {
    return this.tag === 'NOTHING' ? Maybe.nothing : this.value
  }

  chain(fn) {
    return this.tag === 'NOTHING' ? Maybe.nothing : this.map(fn).join()
  }
}

console.log(Maybe.nothing.map(x => x / 2))
console.log(Maybe.of(8).map(x => x / 2))

//

const head = arr =>
  Array.isArray(arr) && arr[0] ? Maybe.of(arr[0]) : Maybe.nothing

console.log(Maybe.of([1, 2, 3]).map(head))
console.log(Maybe.of([1, 2, 3]).chain(head))
console.log(head([]).map(x => x * 2))
console.log(head([2]).map(x => x * 2))
