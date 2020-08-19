import React from 'react'
import './style.css'

type ProfileProps = {
  name: string
  position: string
}

const Profile: React.FC<ProfileProps> = ({ name, position }) => {
  return (
    <div className="profile_container">
      <div className="profile_photo"></div>
      <div className="name">{name}</div>
      <div className="position">{position}</div>
    </div>
  )
}

export default Profile
