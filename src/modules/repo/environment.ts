import { createStateEnv } from '../../utils'

export const NAME = Symbol()
const [createName, getName] = createStateEnv(NAME, '')

let nameCache = 0
export const NAME_CACHE = Symbol()
const [createNameCache, getNameCache, setNameCache] = createStateEnv(
  NAME_CACHE,
  nameCache,
)

export const updateNameCache = () => {
  nameCache++
  return setNameCache(nameCache)
}

export const LOADING = Symbol()
const [createLoading, , setLoading] = createStateEnv(LOADING, false)

const createReposEnv = () => ({
  ...createName(),
  ...createNameCache(),
  ...createLoading(),
})

export { getName, getNameCache, setLoading }
export default createReposEnv
