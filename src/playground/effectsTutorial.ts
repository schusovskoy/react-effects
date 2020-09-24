import { effect as E } from '@matechs/core'
import { pipe } from 'fp-ts/lib/pipeable'

type EffectFetcher = (
  url: string,
) => E.Effect<unknown, FetchEnv, Error, EffectfulResponse>
type FetchEnv = {
  fetch: (url: string) => Promise<ResponseLike>
}
type ResponseLike = { json: () => Promise<unknown> }
type EffectfulResponse = {
  json: () => E.Effect<unknown, FetchEnv, Error, unknown>
}

const fetchE: EffectFetcher = url =>
  pipe(
    E.accessM<unknown, FetchEnv, unknown, Error, ResponseLike>(({ fetch }) =>
      E.fromPromiseMap(e => new Error(e + ' Fetch Error'))(() => fetch(url)),
    ),
    E.map(x => ({
      json: () =>
        E.fromPromiseMap(e => new Error(e + 'Response Error'))(() => x.json()),
    })),
  )

const a = pipe(
  fetchE('https://example.com'),
  E.chain(({ json }) => json()),
  E.map(x => x + ' Result'),
)

const env: FetchEnv = {
  fetch: arg => Promise.resolve({ json: () => Promise.resolve({ a: 5 }) }),
}

pipe(
  a, //
  E.provide(env),
  E.runToPromiseExit,
  x => x.then(x => console.log(x, 'asdf')),
)
