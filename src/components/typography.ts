import { css } from '@emotion/core'
import styled from '@emotion/styled'

export const fs16 = css`
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  line-height: 19px;
`

export const fs30 = css`
  font-family: 'Inter', sans-serif;
  font-size: 30px;
  line-height: 36px;
`

export const fs14 = css`
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  line-height: 17px;
`

const Sizes = { '16': fs16, '30': fs30, '14': fs14 }

type TextProps = {
  size: keyof typeof Sizes
  weight?: '400' | '500' | '600'
}

export const Text = styled.p<TextProps>`
  ${({ size }) => Sizes[size]}
  font-weight: ${({ weight }) => weight || '400'};
`
