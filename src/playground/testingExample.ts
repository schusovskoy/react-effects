import * as O from 'fp-ts/lib/Option'
import { pipe } from 'fp-ts/lib/pipeable'
import { head } from 'fp-ts/lib/Array'
import * as T from 'fp-ts/lib/Task'
import fetch from 'node-fetch'
import * as R from 'fp-ts/lib/ReaderTaskEither'
import { tryCatch } from 'fp-ts/lib/TaskEither'

const result = pipe(
  [],
  head,
  O.map(x => x * 2),
  O.fold(
    () => 0,
    x => x,
  ),
)
console.log(result)

const sendRequest = () =>
  pipe(
    () => fetch('https://api.github.com/repositories'),
    T.chain(x => x.json.bind(x)),
    T.map(x => console.log(x)),
  )

type PromiseResolver = (a?: unknown) => void
type PromiseRejecter = (a: unknown) => void
type ManagerPromiseResolver = (a?: unknown, tag?: string) => Promise<unknown>
type ManagerPromiseRejecter = (a: unknown, tag?: string) => Promise<unknown>
type ManagerPromiseCreator = (
  args?: unknown[],
  tag?: string,
) => Promise<unknown>
type PromiseManagerCreator = () => {
  createPromise: ManagerPromiseCreator
  resolve: ManagerPromiseResolver
  reject: ManagerPromiseRejecter
  start: () => Promise<unknown>
}

const createPromiseManager: PromiseManagerCreator = () => {
  const stack: [PromiseResolver, PromiseRejecter][] = []
  const cache: Record<
    string,
    [PromiseResolver, PromiseRejecter] | undefined
  > = {}
  let [argsPromise, argsResolver] = createPromise()

  return {
    createPromise: (args, tag) => {
      argsResolver(args)
      const [p, res, rej] = createPromise()
      if (tag) {
        cache[tag] = [res, rej]
        return p
      }
      stack.push([res, rej])
      return p
    },
    resolve: (a, tag) => {
      if (tag) {
        cache[tag]?.[0](a)
      } else {
        stack.shift()?.[0](a)
      }
      ;[argsPromise, argsResolver] = createPromise()
      return argsPromise
    },
    reject: (a, tag) => {
      if (tag) {
        cache[tag]?.[1](a)
      } else {
        stack.shift()?.[1](a)
      }
      ;[argsPromise, argsResolver] = createPromise()
      return argsPromise
    },
    start: () => argsPromise,
  }
}

type PromiseCreator = () => [Promise<unknown>, PromiseResolver, PromiseRejecter]

const createPromise: PromiseCreator = () => {
  let res: PromiseResolver = () => {}
  let rej: PromiseRejecter = () => {}
  const p = new Promise((a, b) => ((res = a), (rej = b)))
  return [p, res, rej]
}

type RTEFetcher = (
  url: string,
) => R.ReaderTaskEither<Dependencies, Error, ResponseLike>

const fetchRTE: RTEFetcher = url => ({ fetch }) =>
  tryCatch(
    () => fetch(url),
    x => x as Error,
  )

type Dependencies = {
  fetch: Fetcher
}

const manager = createPromiseManager()

const app = pipe(
  fetchRTE('https://api.github.com/repositories'),
  R.chain(x => R.fromTaskEither(tryCatch(x.json.bind(x), x => x as Error))),
  R.map(x => x + ' Modified'),
  R.fold(
    e => () => T.of(e + ' ModifiedError'),
    x => () => T.of(x),
  ),
)

type ResponseLike = { json: () => Promise<unknown> }
type Fetcher = (url: string) => Promise<ResponseLike>

const myFetch: Fetcher = (...args) =>
  manager.createPromise(args) as Promise<ResponseLike>
const successResponse: ResponseLike = { json: () => manager.createPromise() }

app({ fetch: myFetch })().then(x => console.log(x))

manager
  .start()
  .then(x => {
    console.log(x)
    return manager.resolve(successResponse)
  })
  .then(x => {
    console.log(x)
    return manager.resolve('Result')
  })
