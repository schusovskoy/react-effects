import React from 'react'
import styled from '@emotion/styled'
import { Text } from '../components/typography'
import { Input, Button } from '../components/common'

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

const Main = () => (
  <Container>
    <Title size="30" weight="600">
      Repo Finder
    </Title>
    <FiltersContainer>
      <Input placeholder="Type in repo name" />
      <LocalFilter placeholder="Local name filter" />
    </FiltersContainer>
    <ListContainer>
      {/* <ListItem
          url="https://avatars1.githubusercontent.com/u/6150927?v=4"
          title="Asfasdf asdfa fad"
          description="Afsadf asdf adsf adka;dfkas dfa"
          time="8m ago"
        /> */}
      <EmptyPlaceholder size="16" weight="500">
        It’s still empty ...
      </EmptyPlaceholder>
    </ListContainer>
    <SearchContainer>
      <Button>Search</Button>
    </SearchContainer>
  </Container>
)

export default Main
