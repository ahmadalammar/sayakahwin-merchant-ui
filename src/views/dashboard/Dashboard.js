import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CProgress,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CSpinner,
  CAlert,
  CContainer,
  CBadge,
  CButton,
} from '@coreui/react'
import { CChartLine } from '@coreui/react-chartjs'
import CIcon from '@coreui/icons-react'
import {
  cilCalendar,
  cilCreditCard,
  cilSpeedometer,
  cilStar,
  cilTags,
  cilArrowRight,
} from '@coreui/icons'
import merchantService from '../../services/merchantService'
import authService from '../../services/auth'
import PageTitle from '../../components/PageTitle'

const parseApiDate = (value) => {
  if (!value) return null
  const str = String(value).trim()
  if (str.includes('T')) return new Date(str)
  const d = new Date(str.replace(' ', 'T') + 'Z')
  return isNaN(d.getTime()) ? new Date(value) : d
}

const formatDate = (value) => {
  const d = parseApiDate(value)
  if (!d || isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

const Dashboard = () => {
  const navigate = useNavigate()
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const user = authService.getCurrentUser()

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user || !user.merchantId) {
        setLoading(false)
        return
      }

      try {
        const data = await merchantService.getDashboardData()
        if (data) {
          setDashboardData(data)
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [user])

  if (loading) {
    return (
      <>
        <PageTitle title="Dashboard" description="View your license, credits, and event statistics" />
        <div className="loading-container">
          <CSpinner />
          <p>Loading dashboard...</p>
        </div>
      </>
    )
  }

  if (error) {
    return (
      <>
        <PageTitle title="Dashboard" description="View your license, credits, and event statistics" />
        <CContainer fluid>
          <CAlert color="danger">
            <strong>Error:</strong> {error}
          </CAlert>
        </CContainer>
      </>
    )
  }

  if (!dashboardData) {
    return (
      <>
        <PageTitle title="Dashboard" description="View your license, credits, and event statistics" />
        <CContainer fluid>
          <CAlert color="info">No dashboard data available.</CAlert>
        </CContainer>
      </>
    )
  }

  const { license, upcomingEvents, daily_chart_data } = dashboardData

  const creditUsage =
    license.total_credits > 0
      ? ((license.total_credits - license.event_credits_remaining) / license.total_credits) * 100
      : 0
  const creditsUsed = license.total_credits - license.event_credits_remaining

  const endDate = parseApiDate(license.end_date)
  const daysRemaining = endDate
    ? Math.max(0, Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0

  const quickActions = [
    {
      title: 'Issue coupon',
      description: 'Get a Studio link for your customer',
      icon: cilTags,
      to: '/coupons',
      color: 'purple',
    },
    {
      title: 'View events',
      description: 'Manage all your events',
      icon: cilCalendar,
      to: '/events',
      color: 'cream',
    },
  ]

  const statCards = [
    {
      label: 'Credits available',
      value: license.event_credits_remaining,
      sub: `of ${license.total_credits} total`,
      icon: cilCreditCard,
      to: '/license',
      accent: 'purple',
    },
    {
      label: 'Upcoming events',
      value: upcomingEvents?.length || 0,
      sub: 'scheduled soon',
      icon: cilCalendar,
      to: '/events',
      accent: 'pink',
    },
    {
      label: 'Cards created',
      value: creditsUsed,
      sub: `${creditUsage.toFixed(0)}% of credits used`,
      icon: cilSpeedometer,
      to: '/events',
      accent: 'navy',
    },
    {
      label: 'Days remaining',
      value: daysRemaining,
      sub: `until ${formatDate(license.end_date)}`,
      icon: cilStar,
      to: '/license',
      accent: 'gold',
    },
  ]

  return (
    <>
      <PageTitle title="Dashboard" description="View your license, credits, and event statistics" />
      <CContainer fluid>
        {/* Welcome + quick actions */}
        <div className="dashboard-hero mb-4">
          <CRow className="align-items-center g-4">
            <CCol lg={6}>
              <p className="dashboard-hero-eyebrow mb-2">Merchant portal</p>
              <h2 className="dashboard-hero-title mb-2">
                Welcome back{user?.name ? `, ${user.name}` : ''}
              </h2>
              <p className="dashboard-hero-text mb-0">
                Manage wedding cards, issue Studio coupons, and track your subscription — all in
                one place.
              </p>
            </CCol>
            <CCol lg={6}>
              <div className="dashboard-quick-actions">
                {quickActions.map((action) => (
                  <Link key={action.to} to={action.to} className={`dashboard-quick-action dashboard-quick-action--${action.color}`}>
                    <div className="dashboard-quick-action-icon">
                      <CIcon icon={action.icon} />
                    </div>
                    <div className="dashboard-quick-action-text">
                      <strong>{action.title}</strong>
                      <span>{action.description}</span>
                    </div>
                    <CIcon icon={cilArrowRight} className="dashboard-quick-action-arrow" size="sm" />
                  </Link>
                ))}
              </div>
            </CCol>
          </CRow>
        </div>

        {/* Stats Cards */}
        <CRow className="mb-4 g-3">
          {statCards.map((stat) => (
            <CCol sm={6} lg={3} key={stat.label}>
              <Link to={stat.to} className="dashboard-stat-link">
                <CCard className={`h-100 dashboard-stat-card dashboard-stat-card--${stat.accent}`}>
                  <CCardBody className="stat-card dashboard-stat-card-body">
                    <div className="stat-icon">
                      <CIcon icon={stat.icon} />
                    </div>
                    <div className="stat-value">{stat.value}</div>
                    <div className="stat-label">{stat.label}</div>
                    <div className="dashboard-stat-sub">{stat.sub}</div>
                  </CCardBody>
                </CCard>
              </Link>
            </CCol>
          ))}
        </CRow>

        {/* License + coupon CTA */}
        <CRow className="mb-4 g-3">
          <CCol lg={8}>
            <CCard className="card-primary h-100">
              <CCardHeader>
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                  <div>
                    <strong>License & subscription</strong>
                    <p className="text-muted mb-0">Your current package and credit usage</p>
                  </div>
                  <CBadge className="badge-navy px-3 py-2">{license.package_name}</CBadge>
                </div>
              </CCardHeader>
              <CCardBody>
                <CRow className="align-items-center">
                  <CCol md={5} className="mb-3 mb-md-0">
                    <div className="dashboard-license-details">
                      <div className="dashboard-license-row">
                        <span>Package</span>
                        <strong>{license.package_name}</strong>
                      </div>
                      <div className="dashboard-license-row">
                        <span>Valid until</span>
                        <strong>{formatDate(license.end_date)}</strong>
                      </div>
                      <div className="dashboard-license-row">
                        <span>Total credits</span>
                        <strong>{license.total_credits}</strong>
                      </div>
                    </div>
                  </CCol>
                  <CCol md={7}>
                    <div className="dashboard-credit-meter">
                      <div className="d-flex justify-content-between align-items-end mb-2">
                        <div>
                          <span className="text-muted d-block" style={{ fontSize: '0.8125rem' }}>
                            Credits remaining
                          </span>
                          <span className="dashboard-credit-big">
                            {license.event_credits_remaining}
                            <span className="dashboard-credit-of"> / {license.total_credits}</span>
                          </span>
                        </div>
                        <span className="text-muted" style={{ fontSize: '0.8125rem' }}>
                          {creditUsage.toFixed(0)}% used
                        </span>
                      </div>
                      <CProgress value={creditUsage} className="dashboard-credit-progress mb-2" />
                      <div className="d-flex gap-2 flex-wrap">
                        <Link to="/license" className="btn btn-sm btn-outline-secondary">
                          View license
                        </Link>
                        <Link to="/coupons" className="btn btn-sm btn-primary">
                          <CIcon icon={cilTags} className="me-1" size="sm" />
                          Issue coupon
                        </Link>
                      </div>
                    </div>
                  </CCol>
                </CRow>
              </CCardBody>
            </CCard>
          </CCol>

          <CCol lg={4}>
            <CCard className="h-100 dashboard-coupon-cta">
              <CCardBody className="d-flex flex-column h-100">
                <div className="dashboard-coupon-cta-icon mb-3">
                  <CIcon icon={cilTags} size="xl" />
                </div>
                <h5 className="mb-2">Share a Studio link</h5>
                <p className="text-muted flex-grow-1" style={{ fontSize: '0.875rem' }}>
                  Issue a coupon and send your customer a ready-to-use link. They create their card
                  in Studio — you stay in control of credits.
                </p>
                <CButton color="primary" className="w-100 mt-2" onClick={() => navigate('/coupons')}>
                  Go to coupons
                  <CIcon icon={cilArrowRight} className="ms-2" size="sm" />
                </CButton>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>

        {/* Charts Row */}
        {daily_chart_data && daily_chart_data.length > 0 && (
          <CRow className="mb-4 g-3">
            <CCol lg={12}>
              <CCard className="h-100">
                <CCardHeader>
                  <strong>Activity overview</strong>
                  <p className="text-muted mb-0">Events and wishes over time</p>
                </CCardHeader>
                <CCardBody>
                  <CChartLine
                    data={{
                      labels: daily_chart_data.map((d) =>
                        new Date(d.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        }),
                      ),
                      datasets: [
                        {
                          label: 'Events',
                          backgroundColor: 'rgba(45, 27, 78, 0.08)',
                          borderColor: '#2D1B4E',
                          pointBackgroundColor: '#2D1B4E',
                          pointBorderColor: '#fff',
                          data: daily_chart_data.map((d) => d.events),
                          tension: 0.4,
                          fill: true,
                        },
                        {
                          label: 'Wishes',
                          backgroundColor: 'rgba(232, 160, 176, 0.15)',
                          borderColor: '#E8A0B0',
                          pointBackgroundColor: '#E8A0B0',
                          pointBorderColor: '#fff',
                          data: daily_chart_data.map((d) => d.wishes),
                          tension: 0.4,
                          fill: true,
                        },
                      ],
                    }}
                    options={{
                      plugins: { legend: { position: 'top' } },
                      scales: { y: { beginAtZero: true } },
                      maintainAspectRatio: false,
                    }}
                    style={{ height: '280px' }}
                  />
                </CCardBody>
              </CCard>
            </CCol>
          </CRow>
        )}

        {/* Upcoming Events */}
        <CCard>
          <CCardHeader>
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
              <div>
                <strong>Upcoming events</strong>
                <p className="text-muted mb-0">Events scheduled in the coming days</p>
              </div>
              {(upcomingEvents?.length ?? 0) > 0 && (
                <Link to="/events" className="btn btn-sm btn-outline-secondary">
                  View all
                  <CIcon icon={cilArrowRight} className="ms-1" size="sm" />
                </Link>
              )}
            </div>
          </CCardHeader>
          <CCardBody>
            {upcomingEvents && upcomingEvents.length > 0 ? (
              <div className="table-responsive">
                <CTable hover className="dashboard-events-table">
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell>Event</CTableHeaderCell>
                      <CTableHeaderCell>Schedule</CTableHeaderCell>
                      <CTableHeaderCell>Date</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {upcomingEvents.map((event) => (
                      <CTableRow key={event.id}>
                        <CTableDataCell data-label="Event">
                          <strong>{event.name}</strong>
                        </CTableDataCell>
                        <CTableDataCell data-label="Schedule">
                          {event.latest_schedule_title}
                        </CTableDataCell>
                        <CTableDataCell data-label="Date">
                          {formatDate(event.latest_schedule_date)}
                        </CTableDataCell>
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>
              </div>
            ) : (
              <div className="dashboard-empty-events">
                <CIcon icon={cilCalendar} size="3xl" className="text-muted mb-3" />
                <h5>No upcoming events</h5>
                <p className="text-muted mb-3">
                  Create your first wedding card or issue a coupon for a customer.
                </p>
                <div className="d-flex gap-2 justify-content-center flex-wrap">
                  <CButton color="primary" onClick={() => navigate('/coupons')}>
                    <CIcon icon={cilTags} className="me-1" />
                    Issue coupon
                  </CButton>
                </div>
              </div>
            )}
          </CCardBody>
        </CCard>
      </CContainer>
    </>
  )
}

export default Dashboard
