import { pipe as Rpipe } from 'ramda'

// Declarative programming
// Functional programming is declarative: it doesn’t reveal details of implementation.

// Immutability
// Moore's law established that the number of transistors on integrated circuits
// would double every two years. However, the limit was reached for the year
// 2002. Later, multicore processors appeared to keep the speed increases.
// Parallelizable code is the only way to take advantage of them.

const notCurryFn = (a, b) => a + b
const curryFn = a => b => a + b

const compose = (...fns) => (...args) =>
  fns.reduceRight((acc, fn) => [fn.apply(null, acc)], args)[0]
const pipe = (...args) => Rpipe(...args)()

const fibo = n => (n < 2 ? 1 : fibo(n - 2) + fibo(n - 1))

const tailFibo = (n, a = 0, b = 1) => () => {
  if (n === 0) return a
  if (n === 1) return b
  return tailFibo(n - 1, b, a + b)
}

const runLazy = fn => {
  let result = fn
  while (true) {
    result = result()
    if (typeof result === 'function') continue
    return result
  }
}

console.log(runLazy(tailFibo(5)))
