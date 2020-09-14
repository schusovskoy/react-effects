import { tagEquals, hasProperty } from './type-guards'
import { effect as E } from '@matechs/core'

type RequestInfo = Parameters<typeof fetch>[0]
type RequestInit = Parameters<typeof fetch>[1]
export type FetchEnv = {
  fetchJson: (input: RequestInfo, init?: RequestInit) => Promise<unknown>
}

export const ProdFetchEnv: FetchEnv = {
  fetchJson: (input, init) => fetch(input, init).then(x => x.json()),
}

export class NetworkError {
  readonly _tag = 'NETWORK_ERROR'
  static isOfType = tagEquals('NETWORK_ERROR')<NetworkError>()
}
export class ParseError {
  readonly _tag = 'PARSE_ERROR'
  static isOfType = tagEquals('PARSE_ERROR')<ParseError>()
}
export type RequestError = NetworkError | ParseError

type EffectfulFetch = (
  input: RequestInfo,
  init?: RequestInit,
) => E.AsyncRE<FetchEnv, RequestError, unknown>

const fetchE: EffectfulFetch = (input, init) =>
  E.accessM<unknown, FetchEnv, unknown, RequestError, unknown>(
    ({ fetchJson }) =>
      E.fromPromiseMap(err => {
        if (hasProperty('message', err) && err.message === 'Failed to fetch')
          return new NetworkError()
        return new ParseError()
      })(() => fetchJson(input, init)),
  )

export default fetchE
