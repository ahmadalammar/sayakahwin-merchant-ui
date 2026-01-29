import React, { useRef } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import {
  CContainer,
  CDropdown,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
  CHeader,
  CHeaderNav,
  CHeaderToggler,
  CNavLink,
  CNavItem,
  useColorModes,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilMenu, cilMoon, cilSun, cilAccountLogout, cilUser } from '@coreui/icons'

import { AppBreadcrumb } from './index'
import authService from '../services/auth'

const AppHeader = () => {
  const headerRef = useRef()
  const navigate = useNavigate()
  const { colorMode, setColorMode } = useColorModes('coreui-free-react-admin-template-theme')

  const dispatch = useDispatch()
  const sidebarShow = useSelector((state) => state.sidebarShow)
  
  const user = authService.getCurrentUser()

  const handleLogout = () => {
    authService.logout()
    navigate('/login')
  }

  return (
    <CHeader position="sticky" className="mb-4 p-0" ref={headerRef}>
      <CContainer fluid className="border-bottom px-4">
        <CHeaderToggler
          onClick={() => dispatch({ type: 'set', sidebarShow: !sidebarShow })}
        >
          <CIcon icon={cilMenu} size="lg" />
        </CHeaderToggler>
        
        <CHeaderNav className="d-none d-md-flex">
          <CNavItem>
            <CNavLink to="/dashboard" as={NavLink}>
              Dashboard
            </CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink to="/events" as={NavLink}>
              Events
            </CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink to="/templates" as={NavLink}>
              Templates
            </CNavLink>
          </CNavItem>
        </CHeaderNav>
        
        <CHeaderNav className="ms-auto">
          {/* Theme Switcher */}
          <CNavItem>
            <CNavLink
              href="#"
              onClick={(e) => {
                e.preventDefault()
                setColorMode(colorMode === 'light' ? 'dark' : 'light')
              }}
              title={colorMode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            >
              <CIcon icon={colorMode === 'light' ? cilMoon : cilSun} size="lg" />
            </CNavLink>
          </CNavItem>
        </CHeaderNav>
        
        <CHeaderNav>
          <CDropdown variant="nav-item" placement="bottom-end">
            <CDropdownToggle className="py-0 pe-0" caret={false}>
              <div 
                className="d-flex align-items-center justify-content-center rounded-circle bg-cream"
                style={{ width: '36px', height: '36px' }}
              >
                <CIcon icon={cilUser} size="lg" className="text-navy" />
              </div>
            </CDropdownToggle>
            <CDropdownMenu>
              <CDropdownItem disabled className="text-muted">
                <small>{user?.name || user?.email || 'User'}</small>
              </CDropdownItem>
              <CDropdownItem href="#" onClick={handleLogout}>
                <CIcon icon={cilAccountLogout} className="me-2" />
                Logout
              </CDropdownItem>
            </CDropdownMenu>
          </CDropdown>
        </CHeaderNav>
      </CContainer>
      
      <CContainer fluid className="px-4">
        <AppBreadcrumb />
      </CContainer>
    </CHeader>
  )
}

export default AppHeader
