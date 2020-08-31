import React from 'react'
import { Container, ProfilePhoto, Name, Position } from './style'

type ProfileProps = {
  name: string
  position: string
}

const Profile: React.FC<ProfileProps> = ({ name, position }) => {
  return (
    <Container>
      <ProfilePhoto
        src={'https://2020.feconf.kr/images/backgrounds/img-gradient-5.png'}
      />
      <Name>{name}</Name>
      <Position>{position}</Position>
    </Container>
  )
}

const MemoizedProfile = React.memo(Profile)

export default MemoizedProfile
