import { effect as E } from '@matechs/core'
import { pipe } from 'fp-ts/lib/pipeable'
import { Errors } from 'io-ts'
import {
  cacheQuery,
  decodeE,
  fetchE,
  FetchEnv,
  RequestError,
} from '../../utils'
import * as t from 'io-ts'

const GhRepoCodec = t.type({
  items: t.array(
    t.type({
      owner: t.type({
        avatar_url: t.string,
      }),
      full_name: t.string,
      description: t.union([t.string, t.null]),
      created_at: t.string,
    }),
  ),
})

export type Repo = {
  avatar: string
  name: string
  description: string | null
  date: string
}

type ReposSearcher = (
  name: string,
) => E.AsyncRE<FetchEnv, RequestError | Errors, Repo[]>

const searchRepos: ReposSearcher = cacheQuery(1)(name =>
  pipe(
    fetchE('https://api.github.com/search/repositories?q=' + name, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
        Authorization:
          'Basic schusovskoy:f0c4f54ad844440e56af1ff8d683946c8d7ac8fa',
      },
    }),
    E.chain(decodeE(GhRepoCodec)),
    E.map(({ items }) =>
      items.map(
        ({ owner: { avatar_url }, full_name, description, created_at }) => ({
          avatar: avatar_url,
          name: full_name,
          description,
          date: new Date(created_at).toLocaleDateString(),
        }),
      ),
    ),
  ),
)

const RepoService = { searchRepos }
export default RepoService
