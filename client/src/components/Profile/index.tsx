import React from 'react'
import { Container, ProfilePhoto, Name, Position } from './style'

type ProfileProps = {
  name: string
  position: string
}

const Profile: React.FC<ProfileProps> = ({ name, position }) => {
  return (
    <Container>
      <ProfilePhoto />
      <Name>{name}</Name>
      <Position>{position}</Position>
    </Container>
  )
}

const MemoizedProfile = React.memo(Profile)

export default MemoizedProfile
