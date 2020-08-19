import React from 'react'
import Sidebar from 'components/Sidebar'
import './style.css'

const Home: React.FC = () => {
  return (
    <div className="Home">
      <Sidebar />
      <div className="dashboard_container">
        <div className="dashboard_content_container">
          <div className="row_align"></div>
        </div>

        <div className="dashboard_content_container right_side">
          <h2>New Reviews</h2>
        </div>
      </div>
    </div>
  )
}

export default Home
