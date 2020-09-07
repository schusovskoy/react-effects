import React from 'react'
import styled from '@emotion/styled'
import { keyframes } from '@emotion/core'
import { fs16 } from '../typography'

const Container = styled.button`
  ${fs16}
  height: 50px;
  border-radius: 25px;
  background-color: #5db075;
  padding: 16px;
  color: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  border: none;
  font-weight: 600;
  cursor: pointer;
  outline: none;
`

const dotKeyframes = keyframes`
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
`

type DotProps = {
  nth: number
}

const Dot = styled.div<DotProps>`
  width: 8px;
  height: 8px;
  border-radius: 4px;
  background-color: #fff;
  animation: 1s linear ${({ nth }) => `0.${nth}`}s infinite ${dotKeyframes};

  &:not(:last-child) {
    margin-right: 8px;
  }
`

type ButtonProps = {
  loading?: boolean
}

const Button: React.FC<ButtonProps> = ({ loading, children }) => (
  <Container>
    {loading ? (
      <>
        <Dot nth={0} />
        <Dot nth={1} />
        <Dot nth={2} />
      </>
    ) : (
      children
    )}
  </Container>
)

export default Button
