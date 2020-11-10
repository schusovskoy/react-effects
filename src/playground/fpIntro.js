const notCurryFn = (a, b) => a + b
const curryFn = a => b => a + b

const multiply = a => b => a * b
const multiplyByTwo = multiply(2)

const gt = a => b => b > a
const lt = a => b => b < a
const greaterThenTwo = gt(2)

const numbers = [1, 2, 4, -2, 5]
let result = numbers.filter(greaterThenTwo)
console.log(result)

result = numbers.filter(greaterThenTwo).map(multiplyByTwo)
console.log(result)

//

const compose = (...fns) => (...args) =>
  fns.reduceRight((acc, fn) => [fn.apply(null, acc)], args)[0]

let pipe = (...fns) => (...args) =>
  fns.reduce((acc, fn) => [fn.apply(null, acc)], args)[0]

const doubleSay = str => str + ', ' + str
const capitalize = str => str[0].toUpperCase() + str.substring(1)
const exclaim = str => str + '!'

let phrase = doubleSay('hello')
phrase = capitalize(phrase)
phrase = exclaim(phrase)
console.log(phrase)

phrase = exclaim(capitalize(doubleSay('hello')))
console.log(phrase)

let transform = compose(exclaim, capitalize, doubleSay)
console.log(transform('hello'))

transform = pipe(doubleSay, capitalize, exclaim)
console.log(transform('hello'))

pipe = (arg, ...fns) => fns.reduce((acc, fn) => [fn.apply(null, acc)], [arg])[0]

console.log(
  pipe(
    'hello', //
    doubleSay,
    capitalize,
    exclaim,
  ),
)

/**
 * console.log(
 *  'hello'
 *    |> doubleSay
 *    |> capitalize
 *    |> exclaim
 * )
 */

console.log(
  numbers.map(a =>
    pipe(
      a, //
      multiply(5),
      exclaim,
    ),
  ),
)

//

let fibo = n => {
  if (n <= 2) return 1
  let a = 1
  let b = 1
  let tmp
  for (let i = 3; i <= n; i++) {
    tmp = a + b
    a = b
    b = tmp
  }
  return b
}
console.log(fibo(7))

fibo = n => {
  if (n <= 2) return 1
  return fibo(n - 2) + fibo(n - 1)
}
console.log(fibo(7))

const quickSort = arr => {
  if (!arr.length) return arr
  const [pivot, ...rest] = arr
  const left = rest.filter(lt(pivot))
  const right = rest.filter(gt(pivot))
  return quickSort(left).concat([pivot]).concat(quickSort(right))
}
console.log(quickSort([5, 3, 8, 12, 1]))

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

console.log(runLazy(tailFibo(7)))
