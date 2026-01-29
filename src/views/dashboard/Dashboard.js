import React, { useState, useEffect } from 'react'
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
} from '@coreui/react'
import { CChartLine, CChartBar } from '@coreui/react-chartjs'
import CIcon from '@coreui/icons-react'
import { cilCalendar, cilCreditCard, cilSpeedometer, cilStar } from '@coreui/icons'
import merchantService from '../../services/merchantService'
import authService from '../../services/auth'
import PageTitle from '../../components/PageTitle'

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const user = authService.getCurrentUser()

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await merchantService.getDashboardData()
        setDashboardData(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

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

  const { license, upcomingEvents, trendyTemplates, daily_chart_data } = dashboardData

  const creditUsage =
    ((license.total_credits - license.event_credits_remaining) / license.total_credits) * 100
  const creditsUsed = license.total_credits - license.event_credits_remaining

  const daysRemaining = Math.max(
    0,
    Math.ceil((new Date(license.end_date) - new Date()) / (1000 * 60 * 60 * 24))
  )

  return (
    <>
      <PageTitle title="Dashboard" description="View your license, credits, and event statistics" />
      <CContainer fluid>
        {/* Welcome Banner */}
        <div className="dashboard-welcome">
          <h2>Welcome back{user?.name ? `, ${user.name}` : ''}!</h2>
          <p>Here's an overview of your wedding card business</p>
        </div>

        {/* Stats Cards */}
        <CRow className="mb-4">
          <CCol sm={6} lg={3}>
            <CCard className="h-100">
              <CCardBody className="stat-card">
                <div className="stat-icon">
                  <CIcon icon={cilCreditCard} />
                </div>
                <div className="stat-value">{license.event_credits_remaining}</div>
                <div className="stat-label">Credits Remaining</div>
              </CCardBody>
            </CCard>
          </CCol>
          <CCol sm={6} lg={3}>
            <CCard className="h-100">
              <CCardBody className="stat-card">
                <div className="stat-icon">
                  <CIcon icon={cilCalendar} />
                </div>
                <div className="stat-value">{upcomingEvents?.length || 0}</div>
                <div className="stat-label">Upcoming Events</div>
              </CCardBody>
            </CCard>
          </CCol>
          <CCol sm={6} lg={3}>
            <CCard className="h-100">
              <CCardBody className="stat-card">
                <div className="stat-icon">
                  <CIcon icon={cilSpeedometer} />
                </div>
                <div className="stat-value">{creditsUsed}</div>
                <div className="stat-label">Cards Created</div>
              </CCardBody>
            </CCard>
          </CCol>
          <CCol sm={6} lg={3}>
            <CCard className="h-100">
              <CCardBody className="stat-card">
                <div className="stat-icon">
                  <CIcon icon={cilStar} />
                </div>
                <div className="stat-value">{daysRemaining}</div>
                <div className="stat-label">Days Remaining</div>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>

        {/* License Card */}
        <CRow className="mb-4">
          <CCol xs={12}>
            <CCard className="card-primary">
              <CCardHeader>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <strong>License & Subscription</strong>
                    <p className="text-muted mb-0">Your current package details</p>
                  </div>
                  <CBadge className="badge-navy px-3 py-2">{license.package_name}</CBadge>
                </div>
              </CCardHeader>
              <CCardBody>
                <CRow>
                  <CCol md={6} className="mb-3 mb-md-0">
                    <div className="d-flex flex-column gap-2">
                      <div className="d-flex justify-content-between">
                        <span className="text-muted">Package</span>
                        <strong>{license.package_name}</strong>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span className="text-muted">Valid Until</span>
                        <strong>{new Date(license.end_date).toLocaleDateString()}</strong>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span className="text-muted">Total Credits</span>
                        <strong>{license.total_credits}</strong>
                      </div>
                    </div>
                  </CCol>
                  <CCol md={6}>
                    <div className="text-md-end mb-2">
                      <span className="text-muted">Credit Usage</span>
                      <h4 className="mb-0 mt-1">
                        {license.event_credits_remaining} / {license.total_credits}
                      </h4>
                    </div>
                    <CProgress value={creditUsage} className="mb-1" />
                    <p className="text-muted text-end mb-0" style={{ fontSize: '0.75rem' }}>
                      {creditUsage.toFixed(0)}% used
                    </p>
                  </CCol>
                </CRow>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>

        {/* Charts Row */}
        <CRow className="mb-4">
          {daily_chart_data && daily_chart_data.length > 0 && (
            <CCol lg={7}>
              <CCard className="h-100">
                <CCardHeader>
                  <strong>Activity Overview</strong>
                  <p className="text-muted mb-0">Events and wishes over time</p>
                </CCardHeader>
                <CCardBody>
                  <CChartLine
                    data={{
                      labels: daily_chart_data.map((d) => 
                        new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                      ),
                      datasets: [
                        {
                          label: 'Events',
                          backgroundColor: 'rgba(30, 58, 95, 0.1)',
                          borderColor: '#1E3A5F',
                          pointBackgroundColor: '#1E3A5F',
                          pointBorderColor: '#fff',
                          data: daily_chart_data.map((d) => d.events),
                          tension: 0.4,
                          fill: true,
                        },
                        {
                          label: 'Wishes',
                          backgroundColor: 'rgba(201, 169, 98, 0.1)',
                          borderColor: '#C9A962',
                          pointBackgroundColor: '#C9A962',
                          pointBorderColor: '#fff',
                          data: daily_chart_data.map((d) => d.wishes),
                          tension: 0.4,
                          fill: true,
                        },
                      ],
                    }}
                    options={{
                      plugins: {
                        legend: {
                          position: 'top',
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                        },
                      },
                      maintainAspectRatio: false,
                    }}
                    style={{ height: '280px' }}
                  />
                </CCardBody>
              </CCard>
            </CCol>
          )}
          
          <CCol lg={daily_chart_data && daily_chart_data.length > 0 ? 5 : 12}>
            <CCard className="h-100">
              <CCardHeader>
                <strong>Popular Templates</strong>
                <p className="text-muted mb-0">Most used by your clients</p>
              </CCardHeader>
              <CCardBody>
                {trendyTemplates && trendyTemplates.length > 0 ? (
                  <CChartBar
                    data={{
                      labels: trendyTemplates.map((t) => t.theme),
                      datasets: [
                        {
                          label: 'Usage',
                          backgroundColor: '#1E3A5F',
                          borderRadius: 4,
                          data: trendyTemplates.map((t) => t.usage_count),
                        },
                      ],
                    }}
                    options={{
                      indexAxis: 'y',
                      plugins: {
                        legend: {
                          display: false
                        }
                      },
                      scales: {
                        x: {
                          beginAtZero: true,
                        },
                      },
                      maintainAspectRatio: false,
                    }}
                    style={{ height: '280px' }}
                  />
                ) : (
                  <div className="text-center text-muted py-4">
                    No template data available
                  </div>
                )}
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>

        {/* Upcoming Events */}
        <CRow>
          <CCol xs={12}>
            <CCard>
              <CCardHeader>
                <strong>Upcoming Events</strong>
                <p className="text-muted mb-0">Events scheduled in the coming days</p>
              </CCardHeader>
              <CCardBody>
                {upcomingEvents && upcomingEvents.length > 0 ? (
                  <div className="table-responsive">
                    <CTable hover>
                      <CTableHead>
                        <CTableRow>
                          <CTableHeaderCell>Event Name</CTableHeaderCell>
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
                              {new Date(event.latest_schedule_date).toLocaleDateString()}
                            </CTableDataCell>
                          </CTableRow>
                        ))}
                      </CTableBody>
                    </CTable>
                  </div>
                ) : (
                  <CAlert color="info" className="mb-0">
                    No upcoming events scheduled.
                  </CAlert>
                )}
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>
    </>
  )
}

export default Dashboard
