import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import {
  CButton,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CFormInput,
  CPagination,
  CPaginationItem,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CCard,
  CCardBody,
  CCardHeader,
  CContainer,
  CSpinner,
  CAlert,
  CRow,
  CCol,
  CBadge,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { 
  cilInfo, 
  cilCalendar, 
  cilPlus, 
  cilSearch, 
  cilPencil, 
  cilExternalLink,
  cilLockLocked,
  cilSettings,
  cilCheckCircle
} from '@coreui/icons'
import authService from 'src/services/auth'
import config from 'src/config'
import PageTitle from '../../components/PageTitle'

const Events = () => {
  const navigate = useNavigate()
  const [allEvents, setAllEvents] = useState([])
  const [events, setEvents] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const [showCredentialsModal, setShowCredentialsModal] = useState(false)
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [credentials, setCredentials] = useState({ email: '', password: '' })
  const [newPassword, setNewPassword] = useState('')
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchEvents = () => {
    const user = authService.getCurrentUser()
    setLoading(true)
    setError(null)
    api
      .get(`/merchant/${user.merchantId}/events`)
      .then((response) => {
        const eventsData = response.data || []
        setAllEvents(eventsData)
        setEvents(eventsData.slice(0, itemsPerPage))
      })
      .catch((error) => {
        console.error('Error fetching events:', error)
        setError('Failed to load events. Please try again.')
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchEvents()
  }, [])

  const handleSearch = (event) => {
    const term = event.target.value
    setSearchTerm(term)
    const filteredEvents = allEvents.filter(
      (event) =>
        (event.name && event.name.toLowerCase().includes(term.toLowerCase())) ||
        (event.description && event.description.toLowerCase().includes(term.toLowerCase())),
    )
    setEvents(filteredEvents.slice(0, itemsPerPage))
    setCurrentPage(1)
  }

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber)
    const startIndex = (pageNumber - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const filteredEvents = allEvents.filter(
      (event) =>
        (event.name && event.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (event.description && event.description.toLowerCase().includes(searchTerm.toLowerCase())),
    )
    setEvents(filteredEvents.slice(startIndex, endIndex))
  }

  const filteredTotal = allEvents.filter(
    (event) =>
      (event.name && event.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (event.description && event.description.toLowerCase().includes(searchTerm.toLowerCase())),
  ).length

  const pageCount = Math.ceil(filteredTotal / itemsPerPage)

  const handleView = (eventId) => {
    const user = authService.getCurrentUser()
    const url = `${config.CARD_BASE_URL}/${user.merchantId}/${eventId}`
    window.open(url, '_blank')
  }

  const handleShowCredentials = (event) => {
    setSelectedEvent(event)
    const user = authService.getCurrentUser()
    api
      .get(`/merchant/${user.merchantId}/events/${event.id}/credentials`)
      .then((response) => {
        setCredentials(response.data)
        setShowCredentialsModal(true)
      })
      .catch((error) => console.error('Error fetching credentials:', error))
  }

  const handleResetPassword = () => {
    const user = authService.getCurrentUser()
    api
      .post(`/merchant/${user.merchantId}/events/${selectedEvent.id}/reset-password`, {
        password: newPassword,
      })
      .then((response) => {
        setShowResetPasswordModal(false)
        setNewPassword('')
        setSuccessMessage(response.data.message)
        setShowSuccessModal(true)
        fetchEvents()
      })
      .catch((error) => console.error('Error resetting password:', error))
  }

  const openResetPasswordModal = (event) => {
    setSelectedEvent(event)
    setShowResetPasswordModal(true)
  }

  if (loading && allEvents.length === 0) {
    return (
      <>
        <PageTitle title="Events" description="Manage your wedding events and invitations" />
        <div className="loading-container">
          <CSpinner />
          <p>Loading your events...</p>
        </div>
      </>
    )
  }

  return (
    <>
      <PageTitle title="Events" description="Manage your wedding events and invitations" />
      <CContainer fluid>
        <CCard>
          <CCardHeader>
            <CRow className="align-items-center">
              <CCol>
                <div className="d-flex align-items-center gap-2">
                  <CIcon icon={cilCalendar} className="text-navy" size="lg" />
                  <div>
                    <strong>Wedding Events</strong>
                    <p className="text-muted mb-0">Manage your wedding cards and invitations</p>
                  </div>
                </div>
              </CCol>
              <CCol xs="auto">
                <CButton 
                  color="primary" 
                  onClick={() => navigate('/events/create')}
                  className="d-flex align-items-center gap-2"
                >
                  <CIcon icon={cilPlus} />
                  Create Event
                </CButton>
              </CCol>
            </CRow>
          </CCardHeader>
          <CCardBody>
            {error && (
              <CAlert color="danger" className="mb-4">
                {error}
              </CAlert>
            )}

            {/* Search Bar */}
            <div className="mb-4">
              <div className="position-relative" style={{ maxWidth: '400px' }}>
                <CIcon 
                  icon={cilSearch} 
                  className="position-absolute text-muted" 
                  style={{ left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                />
                <CFormInput
                  type="text"
                  placeholder="Search events by name or description..."
                  value={searchTerm}
                  onChange={handleSearch}
                  style={{ paddingLeft: '40px' }}
                />
              </div>
            </div>

            {filteredTotal === 0 ? (
              <CAlert color="info" className="text-center py-5">
                <CIcon icon={cilCalendar} size="3xl" className="mb-3 text-muted" />
                <h5>{searchTerm ? 'No events match your search' : 'No events yet'}</h5>
                <p className="mb-3">
                  {searchTerm 
                    ? 'Try adjusting your search terms.'
                    : 'Create your first wedding event to get started!'}
                </p>
                {!searchTerm && (
                  <CButton 
                    color="primary" 
                    onClick={() => navigate('/events/create')}
                    className="d-flex align-items-center gap-2 mx-auto"
                  >
                    <CIcon icon={cilPlus} />
                    Create Your First Event
                  </CButton>
                )}
              </CAlert>
            ) : (
              <>
                {/* Stats */}
                <div className="mb-4">
                  <CBadge className="badge-navy px-3 py-2">
                    {filteredTotal} Event{filteredTotal !== 1 ? 's' : ''}
                  </CBadge>
                </div>

                {/* Events Table */}
                <div className="table-responsive">
                  <CTable hover>
                    <CTableHead>
                      <CTableRow>
                        <CTableHeaderCell style={{ width: '60px' }}>#</CTableHeaderCell>
                        <CTableHeaderCell>Event Name</CTableHeaderCell>
                        <CTableHeaderCell>Description</CTableHeaderCell>
                        <CTableHeaderCell style={{ textAlign: 'right' }}>Actions</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {events.map((event, index) => (
                        <CTableRow key={event.id}>
                          <CTableDataCell data-label="#">
                            <span className="text-muted">{((currentPage - 1) * itemsPerPage) + index + 1}</span>
                          </CTableDataCell>
                          <CTableDataCell data-label="Event Name">
                            <strong>{event.name || 'Untitled Event'}</strong>
                          </CTableDataCell>
                          <CTableDataCell data-label="Description">
                            <span className="text-muted">
                              {event.description 
                                ? (event.description.length > 50 
                                    ? event.description.substring(0, 50) + '...' 
                                    : event.description)
                                : 'No description'}
                            </span>
                          </CTableDataCell>
                          <CTableDataCell data-label="Actions" className="text-end">
                            <div className="d-flex justify-content-end gap-2 flex-wrap">
                              <CButton
                                color="info"
                                size="sm"
                                variant="outline"
                                onClick={() => handleView(event.id)}
                                className="d-flex align-items-center gap-1"
                              >
                                <CIcon icon={cilExternalLink} size="sm" />
                                View
                              </CButton>
                              <CButton
                                color="warning"
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  const user = authService.getCurrentUser()
                                  navigate(`/merchant/${user.merchantId}/events/${event.id}`)
                                }}
                                className="d-flex align-items-center gap-1"
                              >
                                <CIcon icon={cilPencil} size="sm" />
                                Edit
                              </CButton>
                              <CDropdown>
                                <CDropdownToggle color="secondary" size="sm" variant="outline">
                                  <CIcon icon={cilSettings} size="sm" />
                                </CDropdownToggle>
                                <CDropdownMenu>
                                  <CDropdownItem 
                                    onClick={() => handleShowCredentials(event)}
                                    className="d-flex align-items-center gap-2"
                                  >
                                    <CIcon icon={cilInfo} />
                                    Show Credentials
                                  </CDropdownItem>
                                  <CDropdownItem 
                                    onClick={() => openResetPasswordModal(event)}
                                    className="d-flex align-items-center gap-2"
                                  >
                                    <CIcon icon={cilLockLocked} />
                                    Reset Password
                                  </CDropdownItem>
                                </CDropdownMenu>
                              </CDropdown>
                            </div>
                          </CTableDataCell>
                        </CTableRow>
                      ))}
                    </CTableBody>
                  </CTable>
                </div>

                {/* Pagination */}
                {pageCount > 1 && (
                  <div className="mt-4 pt-4 border-top">
                    <CRow className="align-items-center">
                      <CCol>
                        <p className="text-muted mb-0" style={{ fontSize: '0.875rem' }}>
                          Showing {((currentPage - 1) * itemsPerPage) + 1} to{' '}
                          {Math.min(currentPage * itemsPerPage, filteredTotal)} of {filteredTotal} events
                        </p>
                      </CCol>
                      <CCol xs="auto">
                        <CPagination aria-label="Events pagination">
                          <CPaginationItem
                            disabled={currentPage === 1}
                            onClick={() => handlePageChange(currentPage - 1)}
                          >
                            Previous
                          </CPaginationItem>
                          {[...Array(Math.min(pageCount, 5)).keys()].map((page) => {
                            let pageNum = page + 1
                            if (pageCount > 5) {
                              if (currentPage > 3) {
                                pageNum = currentPage - 2 + page
                              }
                              if (currentPage > pageCount - 2) {
                                pageNum = pageCount - 4 + page
                              }
                            }
                            if (pageNum > pageCount) return null
                            return (
                              <CPaginationItem
                                key={pageNum}
                                active={pageNum === currentPage}
                                onClick={() => handlePageChange(pageNum)}
                              >
                                {pageNum}
                              </CPaginationItem>
                            )
                          })}
                          <CPaginationItem
                            disabled={currentPage === pageCount}
                            onClick={() => handlePageChange(currentPage + 1)}
                          >
                            Next
                          </CPaginationItem>
                        </CPagination>
                      </CCol>
                    </CRow>
                  </div>
                )}
              </>
            )}
          </CCardBody>
        </CCard>

        {/* Credentials Modal */}
        <CModal visible={showCredentialsModal} onClose={() => setShowCredentialsModal(false)}>
          <CModalHeader>
            <CModalTitle>User Credentials</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <CAlert color="info" className="mb-4">
              <div className="d-flex align-items-start gap-3">
                <CIcon icon={cilInfo} size="lg" className="flex-shrink-0 mt-1" />
                <div>
                  <strong>Share with the Couple</strong>
                  <p className="mb-0" style={{ fontSize: '0.875rem' }}>
                    Share this information with the event owner (the couple) to allow them to manage
                    guests, RSVPs, and more.
                  </p>
                </div>
              </div>
            </CAlert>
            
            <div className="bg-cream p-4 rounded">
              <div className="mb-3">
                <label className="form-label text-muted" style={{ fontSize: '0.75rem' }}>User Portal URL</label>
                <div className="d-flex align-items-center gap-2">
                  <CIcon icon={cilExternalLink} className="text-navy" />
                  <a 
                    href="http://user.sayakahwin.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ fontWeight: 600 }}
                  >
                    user.sayakahwin.com
                  </a>
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label text-muted" style={{ fontSize: '0.75rem' }}>Email</label>
                <div style={{ fontWeight: 600 }}>{credentials.email}</div>
              </div>
              <div>
                <label className="form-label text-muted" style={{ fontSize: '0.75rem' }}>Password</label>
                <div style={{ fontWeight: 600 }}>{credentials.password}</div>
              </div>
            </div>
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" variant="outline" onClick={() => setShowCredentialsModal(false)}>
              Close
            </CButton>
          </CModalFooter>
        </CModal>

        {/* Reset Password Modal */}
        <CModal visible={showResetPasswordModal} onClose={() => setShowResetPasswordModal(false)}>
          <CModalHeader>
            <CModalTitle>Reset Password</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <p className="text-muted mb-4">
              Enter a new password for <strong>{selectedEvent?.name}</strong>
            </p>
            <div className="mb-3">
              <label className="form-label">New Password</label>
              <CFormInput
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" variant="outline" onClick={() => setShowResetPasswordModal(false)}>
              Cancel
            </CButton>
            <CButton color="primary" onClick={handleResetPassword} disabled={!newPassword}>
              Reset Password
            </CButton>
          </CModalFooter>
        </CModal>

        {/* Success Modal */}
        <CModal visible={showSuccessModal} onClose={() => setShowSuccessModal(false)}>
          <CModalHeader>
            <CModalTitle className="text-success d-flex align-items-center gap-2">
              <CIcon icon={cilCheckCircle} className="text-success" />
              Success
            </CModalTitle>
          </CModalHeader>
          <CModalBody>
            <CAlert color="success" className="mb-0">
              {successMessage}
            </CAlert>
          </CModalBody>
          <CModalFooter>
            <CButton color="success" onClick={() => setShowSuccessModal(false)}>
              Done
            </CButton>
          </CModalFooter>
        </CModal>
      </CContainer>
    </>
  )
}

export default Events
