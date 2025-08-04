import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilDescription,
  cilPuzzle,
  cilSpeedometer,
  cilUser,
} from '@coreui/icons'
import { CNavItem } from '@coreui/react'

const _nav = [
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/dashboard',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
    badge: {
      color: 'info',
      text: 'NEW',
    },
  },
  {
    component: CNavItem,
    name: 'License',
    to: '/license',
    icon: <CIcon icon={cilDescription} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Events',
    to: '/events',
    icon: <CIcon icon={cilPuzzle} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Templates',
    to: '/templates',
    icon: <CIcon icon={cilPuzzle} customClassName="nav-icon" />,
  },
]

export default _nav
