import React from 'react'
import Profile from 'components/Profile'
import { voiseeDemoRepository, sampleEmail } from 'constants/externalLink'
import { Container, Navigator, NavTitle, SidebarMenu } from './style'

const Sidebar: React.FC = () => {
  return (
    <Container>
      <div>
        <Profile name="김미나" position={sampleEmail} />
        <Navigator>
          <NavTitle>Category</NavTitle>
          <SidebarMenu>
            <li>
              <a href="#">Home</a>
            </li>
          </SidebarMenu>
        </Navigator>
      </div>
      <Navigator>
        <NavTitle>Opensource</NavTitle>
        <SidebarMenu>
          <li>
            <a href={voiseeDemoRepository}>Contribute</a>
          </li>
          <li>
            <a
              href={voiseeDemoRepository}
              target="_blank"
              rel="noopener noreferrer"
            >
              Github
            </a>
          </li>
        </SidebarMenu>
      </Navigator>
    </Container>
  )
}

export default Sidebar
