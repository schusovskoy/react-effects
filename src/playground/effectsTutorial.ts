import { effect as E, exit } from '@matechs/core'
import * as O from 'fp-ts/lib/Option'
import { pipe } from 'fp-ts/lib/pipeable'

/**
 * const effect = magicFetch('url')
 *   .map(result => result.field)
 *   .chain(field => magicFetch(field))
 *   .fold(exit => {
 *     if (exit.type === NETWORK_ERROR) return handleError(exit.value)
 *     if (exit.type === PARSE_ERROR) return handleParseError(exit.value)
 *     return exit.value
 *   })
 *
 * effect.provide(env).run()
 *
 * pipe(
 *   magicFetch('url'),
 *   map(result => result.field),
 *   chain(field => magicFetch(field)),
 *   fold(exit => {
 *     if (exit.type === NETWORK_ERROR) return handleError(exit.value)
 *     if (exit.type === PARSE_ERROR) return handleParseError(exit.value)
 *     return exit.value
 *   })
 * )
 */

const opt = O.some(3)
console.log(
  pipe(
    opt,
    O.map(a => a * 2),
    O.fold(
      () => 5,
      a => a,
    ),
  ),
)

//

type ResponseLike = { json: () => Promise<unknown> }
type FetchEnv = {
  fetch: (url: string) => Promise<ResponseLike>
}

type EffectFetcher = (
  url: string,
) => E.Effect<unknown, FetchEnv, Error, unknown>

const fetchE: EffectFetcher = url =>
  E.accessM<unknown, FetchEnv, unknown, Error, unknown>(({ fetch }) =>
    E.fromPromiseMap(e => new Error('Fetch Error: ' + e))(() =>
      fetch(url).then(x => x.json()),
    ),
  )

//

const request = pipe(
  fetchE('https://example.com'),
  E.map(x => 'Result: ' + x),
  E.result,
  E.map(a => {
    if (exit.isDone(a)) console.log(a.value)
    if (exit.isRaise(a)) console.log(a.error)
  }),
)

const env: FetchEnv = {
  fetch: arg => Promise.resolve({ json: () => Promise.resolve('Some text') }),
}

const errorEnv: FetchEnv = {
  fetch: arg => Promise.reject('Some Error text'),
}

pipe(
  request, //
  E.provide(env),
  E.runToPromise,
)
