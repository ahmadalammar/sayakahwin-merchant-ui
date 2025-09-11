import React from 'react'
import { CNavItem } from '@coreui/react'

const _nav = [
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/dashboard',
    icon: <span className="nav-icon">🏠</span>,
  },
  {
    component: CNavItem,
    name: 'License',
    to: '/license',
    icon: <span className="nav-icon">📄</span>,
  },
  {
    component: CNavItem,
    name: 'Events',
    to: '/events',
    icon: <span className="nav-icon">🎉</span>,
  },
  {
    component: CNavItem,
    name: 'Templates',
    to: '/templates',
    icon: <span className="nav-icon">🎨</span>,
  },
]

export default _nav
