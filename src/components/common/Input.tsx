import styled from '@emotion/styled'
import { fs16 } from '../typography'

const Input = styled.input`
  ${fs16}
  font-weight: 500;
  padding: 16px;
  height: 50px;
  border: solid 1px #e8e8e8;
  border-radius: 8px;
  background-color: #f6f6f6;

  &::placeholder {
    color: #bdbdbd;
  }
`

export default Input
