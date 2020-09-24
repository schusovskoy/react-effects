import React, { useContext } from 'react'
import styled from '@emotion/styled'
import { Text } from '../components/typography'
import { Input, Button, ListItem } from '../components/common'
import { effect as E, exit as Ex } from '@matechs/core'
import {
  createStateEnv,
  memoizeEffect,
  useCreateEnv,
  useEnvState,
  useHandler,
  useSelector,
} from '../utils'
import {
  LOADING,
  NAME,
  NAME_CACHE,
  reposByNameSelector,
  updateNameCache,
} from '../modules/repo'
import { pipe } from 'fp-ts/lib/pipeable'
import { EnvContext } from '../navigators/AppNavigator'

const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0 16px;
`

const Title = styled(Text)`
  margin: 40px 0 24px;
`

const FiltersContainer = styled.div`
  background-color: #fff;
  padding: 16px 0;
  position: sticky;
  top: 0;
  display: flex;
  flex-direction: column;
`

const LocalFilter = styled(Input)`
  margin-top: 16px;
`

const ListContainer = styled.div`
  margin-top: 24px;
  padding-bottom: 109px;
`

const EmptyPlaceholder = styled(Text)`
  color: #bdbdbd;
`

const SearchContainer = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, #ffffff 52.6%);
  height: 109px;
  padding: 16px;
  display: flex;
  flex-direction: column-reverse;
`

const Main = () => {
  const filterEnv = useCreateEnv(createFilter)
  const env = { ...useContext(EnvContext), ...filterEnv }
  const repos = useSelector(reposSelector, env)
  const reposCount = useSelector(reposCountSelector, env)
  const [name, setName] = useEnvState(NAME, env)
  const [filter, setFilter] = useEnvState(FILTER, env)
  const [loading] = useEnvState(LOADING, env)
  const updateNameCacheHandler = useHandler(updateNameCache, env)

  return (
    <Container>
      <Title size="30" weight="600">
        Repo Finder{typeof reposCount === 'number' && ', ' + reposCount}
      </Title>
      <FiltersContainer>
        <Input
          placeholder="Type in repo name"
          value={name}
          onChange={({ target: { value } }) => setName(value)}
        />
        <LocalFilter
          placeholder="Local name filter"
          value={filter}
          onChange={({ target: { value } }) => setFilter(value)}
        />
      </FiltersContainer>

      <ListContainer>
        {!repos ? (
          <EmptyPlaceholder size="16" weight="500">
            It’s still empty ...
          </EmptyPlaceholder>
        ) : Array.isArray(repos) ? (
          repos.map(({ avatar, name, description, date }) => (
            <ListItem
              url={avatar}
              title={name}
              description={description}
              time={date}
              key={name}
            />
          ))
        ) : (
          <EmptyPlaceholder size="16" weight="500">
            Error
          </EmptyPlaceholder>
        )}
      </ListContainer>

      <SearchContainer>
        <Button onClick={updateNameCacheHandler} loading={loading}>
          Search
        </Button>
      </SearchContainer>
    </Container>
  )
}

const FILTER = Symbol()
const [createFilter, getFilter] = createStateEnv(FILTER, '')

const reposSelector = pipe(
  E.sequenceT(getFilter, reposByNameSelector),
  E.map(([filter, repos]) =>
    repos.filter(({ name }) => name.startsWith(filter)),
  ),
  E.result,
  E.map(e => {
    if (Ex.isDone(e)) return e.value
    if (Ex.isRaise(e) && !Array.isArray(e.error)) return e.error
    return new Error('Effect error')
  }),
  memoizeEffect([FILTER, NAME_CACHE]),
)

const reposCountSelector = pipe(
  reposByNameSelector,
  E.map(x => x.length),
  E.result,
  E.map(e => {
    if (Ex.isDone(e)) return e.value
    if (Ex.isRaise(e) && !Array.isArray(e.error)) return e.error
    return new Error('Effect error')
  }),
  memoizeEffect([NAME_CACHE]),
)

export default Main
