import React from 'react'
import { CFooter } from '@coreui/react'

const AppFooter = () => {
  return (
    <CFooter className="px-4">
      <div>
        <a 
          href="https://sayakahwin.com" 
          target="_blank" 
          rel="noopener noreferrer"
        >
          Sayakahwin
        </a>
        <span className="ms-1">&copy; {new Date().getFullYear()} All rights reserved.</span>
      </div>
      <div className="ms-auto">
        <span className="me-1">Powered by</span>
        <a 
          href="https://sayakahwin.com" 
          target="_blank" 
          rel="noopener noreferrer"
        >
          Sayakahwin
        </a>
      </div>
    </CFooter>
  )
}

export default React.memo(AppFooter)
