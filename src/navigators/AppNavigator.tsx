import React from 'react'
import styled from '@emotion/styled'
import { Global, css, keyframes } from '@emotion/core'
import { Text, fs16 } from '../components/typography'
import { ListItem, Button, Input } from '../components/common'

const globalStyles = css`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
`

const AppNavigator = () => (
  <>
    <Global styles={globalStyles} />
  </>
)

export default AppNavigator
