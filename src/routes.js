import React from 'react'

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))
const License = React.lazy(() => import('./views/license/License'))
const Events = React.lazy(() => import('./views/events/Events'))
const CreateEvent = React.lazy(() => import('./views/events/CreateEvent'))
const UpdateEvent = React.lazy(() => import('./views/events/UpdateEvent'))
const Templates = React.lazy(() => import('./views/templates/Templates'))
const Coupons = React.lazy(() => import('./views/coupons/Coupons'))

const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
  { path: '/license', name: 'License', element: License },
  { path: '/coupons', name: 'Coupons', element: Coupons },
  { path: '/events', name: 'Events', element: Events },
  { path: '/events/create', name: 'Create Event', element: CreateEvent },
  { path: '/merchant/:merchantId/events/:eventId', name: 'Update Event', element: UpdateEvent },
  { path: '/templates', name: 'Templates', element: Templates },
]

export default routes
