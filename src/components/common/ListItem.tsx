import React from 'react'
import styled from '@emotion/styled'
import { Text } from '../typography'

const Container = styled.div`
  padding: 16px 0;
  border-bottom: solid 1px #e8e8e8;
  display: flex;
  align-items: flex-start;
`

type AvatarProps = { url: string }

const Avatar = styled.div<AvatarProps>`
  width: 32px;
  height: 32px;
  border-radius: 16px;
  overflow: hidden;
  background-size: cover;
  background-position: center center;
  margin-right: 16px;
  background-image: url(${({ url }) => url});
`

const Content = styled.div`
  flex: 1;
`

const TextContainer = styled.div`
  display: flex;
`

const Time = styled(Text)`
  color: #bdbdbd;
  margin-left: auto;
`

const Description = styled(Text)`
  margin-top: 8px;
`

type ListItemProps = {
  url: string
  title: string
  description: string
  time: string
}

const ListItem: React.FC<ListItemProps> = ({
  url,
  title,
  description,
  time,
}) => (
  <Container>
    <Avatar url={url} />
    <Content>
      <TextContainer>
        <Text size="16" weight="600">
          {title}
        </Text>
        <Time size="14">{time}</Time>
      </TextContainer>
      <Description size="14">{description}</Description>
    </Content>
  </Container>
)

export default ListItem
