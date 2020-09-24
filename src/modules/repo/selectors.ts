import { pipe } from 'fp-ts/lib/pipeable'
import { effect as E } from '@matechs/core'
import { getName, getNameCache, NAME_CACHE, setLoading } from './environment'
import RepoService from './RepoService'
import { memoizeEffect } from '../../utils'

export const reposByNameSelector = pipe(
  E.sequenceT(getName, getNameCache),
  E.chainTap(() => setLoading(true)),
  E.chain(([name]) => RepoService.searchRepos(name)),
  E.chainTap(() => setLoading(false)),
  memoizeEffect([NAME_CACHE]),
)
