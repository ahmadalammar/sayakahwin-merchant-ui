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
} from '@coreui/react'
import { CChartLine, CChartBar } from '@coreui/react-chartjs'
import merchantService from '../../services/merchantService'

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  if (!dashboardData) {
    return <div>No dashboard data found.</div>
  }

  const { license, upcomingEvents, trendyTemplates, daily_chart_data } = dashboardData

  const creditUsage =
    ((license.total_credits - license.event_credits_remaining) / license.total_credits) * 100

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>License & Credits</strong>
          </CCardHeader>
          <CCardBody>
            <CRow>
              <CCol md={6}>
                <p>
                  <strong>Package:</strong> {license.package_name}
                </p>
                <p>
                  <strong>Expires on:</strong> {new Date(license.end_date).toLocaleDateString()}
                </p>
              </CCol>
              <CCol md={6}>
                <p>
                  <strong>Event Credits:</strong> {license.event_credits_remaining} /{' '}
                  {license.total_credits}
                </p>
                <CProgress value={creditUsage} />
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>
      </CCol>

      {daily_chart_data && (
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader>
              <strong>Daily Activity</strong>
            </CCardHeader>
            <CCardBody>
              <CChartLine
                data={{
                  labels: daily_chart_data.map((d) => new Date(d.date).toLocaleDateString()),
                  datasets: [
                    {
                      label: 'Events',
                      backgroundColor: 'rgba(220, 220, 220, 0.2)',
                      borderColor: 'rgba(220, 220, 220, 1)',
                      pointBackgroundColor: 'rgba(220, 220, 220, 1)',
                      pointBorderColor: '#fff',
                      data: daily_chart_data.map((d) => d.events),
                    },
                    {
                      label: 'Wishes',
                      backgroundColor: 'rgba(151, 187, 205, 0.2)',
                      borderColor: 'rgba(151, 187, 205, 1)',
                      pointBackgroundColor: 'rgba(151, 187, 205, 1)',
                      pointBorderColor: '#fff',
                      data: daily_chart_data.map((d) => d.wishes),
                    },
                  ],
                }}
              />
            </CCardBody>
          </CCard>
        </CCol>
      )}

      <CCol md={6}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Trendy Templates</strong>
          </CCardHeader>
          <CCardBody>
            <CChartBar
              data={{
                labels: trendyTemplates.map((t) => t.theme),
                datasets: [
                  {
                    label: 'Usage Count',
                    backgroundColor: '#f87979',
                    data: trendyTemplates.map((t) => t.usage_count),
                  },
                ],
              }}
            />
          </CCardBody>
        </CCard>
      </CCol>

      <CCol md={6}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Upcoming Events</strong>
          </CCardHeader>
          <CCardBody>
            <CTable>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell scope="col">Event Name</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Latest Schedule</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Date</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {upcomingEvents.map((event) => (
                  <CTableRow key={event.id}>
                    <CTableDataCell>{event.name}</CTableDataCell>
                    <CTableDataCell>{event.latest_schedule_title}</CTableDataCell>
                    <CTableDataCell>
                      {new Date(event.latest_schedule_date).toLocaleDateString()}
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default Dashboard
