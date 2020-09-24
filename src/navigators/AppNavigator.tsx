import React from 'react'
import { Global, css } from '@emotion/core'
import Main from '../screens/Main'
import { createReposEnv } from '../modules/repo'
import { ProdFetchEnv, useCreateEnv } from '../utils'

const globalStyles = css`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
`

export const EnvContext = React.createContext({
  ...createReposEnv(),
  ...ProdFetchEnv,
})

const AppNavigator = () => {
  const reposEnv = useCreateEnv(createReposEnv)
  return (
    <EnvContext.Provider value={{ ...reposEnv, ...ProdFetchEnv }}>
      <Global styles={globalStyles} />
      <Main />
    </EnvContext.Provider>
  )
}

export default AppNavigator
