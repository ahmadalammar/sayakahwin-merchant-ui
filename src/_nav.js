import React from 'react'
import { CNavItem } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilSpeedometer, cilCreditCard, cilCalendar, cilColorPalette } from '@coreui/icons'

const _nav = [
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/dashboard',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'License',
    to: '/license',
    icon: <CIcon icon={cilCreditCard} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Events',
    to: '/events',
    icon: <CIcon icon={cilCalendar} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Templates',
    to: '/templates',
    icon: <CIcon icon={cilColorPalette} customClassName="nav-icon" />,
  },
]

export default _nav
