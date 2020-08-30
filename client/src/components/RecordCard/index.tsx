import React from 'react'
import { Container, Title, Desc, Date } from './style'

const RecordCard: React.FC = () => {
  return (
    <Container>
      <Title>
        VoiseeLab
        <Date>
          5월 4일
        </Date>
      </Title>
      <Desc>
        인프라 설정 업무 설명
      </Desc>
    </Container>
  )
}

export default RecordCard
