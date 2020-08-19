import React from 'react'
import Profile from 'components/Profile'
import { voiseeDemoRepository, sampleEmail } from 'constants/externalLink'
import './style.css'

const Sidebar: React.FC = () => {
  return (
    <div className="sidebar_container">
      <div>
        <Profile name="김아무개" position={sampleEmail} />
        <nav className="sidebar_nav">
          <p className="sidebar_nav_title">Category</p>
          <ul className="sidebar_menu">
            <li>
              <a href="#">Home</a>
            </li>
          </ul>
        </nav>
      </div>
      <nav className="sidebar_nav">
        <p className="sidebar_nav_title">Opensource</p>
        <ul className="sidebar_menu">
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
        </ul>
      </nav>
    </div>
  )
}

export default Sidebar
