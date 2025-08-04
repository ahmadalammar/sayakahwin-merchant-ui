import React from 'react'

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))
const License = React.lazy(() => import('./views/license/License'))
const Events = React.lazy(() => import('./views/events/Events'))
const CreateEvent = React.lazy(() => import('./views/events/CreateEvent'))
const Templates = React.lazy(() => import('./views/templates/Templates'))

const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
  { path: '/license', name: 'License', element: License },
  { path: '/events', name: 'Events', element: Events },
  { path: '/events/create', name: 'Create Event', element: CreateEvent },
  { path: '/templates', name: 'Templates', element: Templates },
]

export default routes
