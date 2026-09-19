import React, { useState, useEffect, useMemo } from 'react'
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
  cilSearch, 
  cilExternalLink,
  cilLockLocked,
  cilSettings,
  cilCheckCircle,
} from '@coreui/icons'
import authService from 'src/services/auth'
import PageTitle from '../../components/PageTitle'
import EventViewModal from './EventViewModal'

const parseApiDate = (value) => {
  if (!value) return null
  if (value instanceof Date) return value
  const str = String(value).trim()
  if (str.includes('T')) {
    const d = new Date(str)
    return isNaN(d.getTime()) ? null : d
  }
  const d = new Date(str.replace(' ', 'T') + 'Z')
  return isNaN(d.getTime()) ? null : d
}

const formatDateTime = (value) => {
  const d = parseApiDate(value)
  if (!d) return '—'
  return d.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

const digitsOnly = (value) => String(value || '').replace(/\D/g, '')

const MONTHS = [
  { short: 'Jan', long: 'January' },
  { short: 'Feb', long: 'February' },
  { short: 'Mar', long: 'March' },
  { short: 'Apr', long: 'April' },
  { short: 'May', long: 'May' },
  { short: 'Jun', long: 'June' },
  { short: 'Jul', long: 'July' },
  { short: 'Aug', long: 'August' },
  { short: 'Sep', alt: 'Sept', long: 'September' },
  { short: 'Oct', long: 'October' },
  { short: 'Nov', long: 'November' },
  { short: 'Dec', long: 'December' },
]

const getCreatedAt = (event) => event?.createdAt || event?.created_at || ''

const getContactPhone = (event) =>
  event?.contact_phone || event?.contact_phonenumber || event?.contact_phone_number || ''

const getDateSearchValues = (createdAt) => {
  if (!createdAt) return []
  const raw = String(createdAt)
  const values = [raw]
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) {
    values.push(raw.slice(0, 10))
  }
  const d = parseApiDate(createdAt)
  if (!d) return values

  const dayNum = d.getDate()
  const monthNum = d.getMonth() + 1
  const year = String(d.getFullYear())
  const day = String(dayNum).padStart(2, '0')
  const month = String(monthNum).padStart(2, '0')
  const monthNames = MONTHS[d.getMonth()]
  const shorts = [monthNames.short, monthNames.alt].filter(Boolean)

  values.push(
    d.toISOString().slice(0, 10),
    `${year}-${month}-${day}`,
    `${day}/${month}/${year}`,
    `${dayNum}/${monthNum}/${year}`,
    `${day}-${month}-${year}`,
    `${dayNum}-${monthNum}-${year}`,
    `${year}/${month}/${day}`,
    formatDateTime(createdAt),
  )

  shorts.forEach((label) => {
    values.push(
      `${day} ${label} ${year}`,
      `${dayNum} ${label} ${year}`,
      `${label} ${year}`,
      `${label} ${day}, ${year}`,
    )
  })
  values.push(`${day} ${monthNames.long} ${year}`, `${monthNames.long} ${year}`)
  return values
}

const normalizeMsianPhone = (digits) => {
  if (!digits) return ''
  if (digits.startsWith('60')) return digits.slice(2)
  if (digits.startsWith('0')) return digits.slice(1)
  return digits
}

const phoneMatchesQuery = (phone, query) => {
  if (!phone) return false
  if (String(phone).toLowerCase().includes(query)) return true

  const queryDigits = digitsOnly(query)
  if (queryDigits.length < 3) return false

  const phoneDigits = digitsOnly(phone)
  if (!phoneDigits) return false
  if (phoneDigits.includes(queryDigits)) return true

  const phoneLocal = normalizeMsianPhone(phoneDigits)
  const queryLocal = normalizeMsianPhone(queryDigits)
  return Boolean(phoneLocal && queryLocal && phoneLocal.includes(queryLocal))
}

const eventMatchesSearch = (event, term) => {
  const query = String(term || '').trim().toLowerCase()
  if (!query) return true

  const textFields = [
    event.name,
    event.groom_name,
    event.bride_name,
    event.groom_short_name,
    event.bride_short_name,
    event.groom_father_name,
    event.bride_father_name,
    event.email,
    event.description,
    event.event_description,
    getContactPhone(event),
  ]

  if (textFields.some((field) => field && String(field).toLowerCase().includes(query))) {
    return true
  }

  if (phoneMatchesQuery(getContactPhone(event), query)) {
    return true
  }

  return getDateSearchValues(getCreatedAt(event)).some((value) =>
    String(value).toLowerCase().includes(query),
  )
}

const Events = () => {
  const [allEvents, setAllEvents] = useState([])
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
  const [showViewModal, setShowViewModal] = useState(false)
  const [viewEvent, setViewEvent] = useState(null)
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

  const filteredEvents = useMemo(
    () => allEvents.filter((event) => eventMatchesSearch(event, searchTerm)),
    [allEvents, searchTerm],
  )
  const filteredTotal = filteredEvents.length
  const pageCount = Math.ceil(filteredTotal / itemsPerPage)
  const safePage = pageCount === 0 ? 1 : Math.min(currentPage, pageCount)
  const events = filteredEvents.slice((safePage - 1) * itemsPerPage, safePage * itemsPerPage)

  const handleSearch = (event) => {
    setSearchTerm(event.target.value)
    setCurrentPage(1)
  }

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber)
  }

  const handleView = (event) => {
    setViewEvent(event)
    setShowViewModal(true)
  }

  const handleCloseViewModal = () => {
    setShowViewModal(false)
    setViewEvent(null)
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
              <div className="position-relative" style={{ maxWidth: '520px' }}>
                <CIcon 
                  icon={cilSearch} 
                  className="position-absolute text-muted" 
                  style={{ left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                />
                <CFormInput
                  type="text"
                  placeholder="Search by name, email, phone, or created date..."
                  value={searchTerm}
                  onChange={handleSearch}
                  style={{ paddingLeft: '40px' }}
                />
              </div>
              <p className="text-muted mb-0 mt-2" style={{ fontSize: '0.8125rem' }}>
                Matches couple names, email, contact phone, and created date (e.g. 18 Sep 2026 or 2026-09-18).
              </p>
            </div>

            {filteredTotal === 0 ? (
              <CAlert color="info" className="text-center py-5">
                <CIcon icon={cilCalendar} size="3xl" className="mb-3 text-muted" />
                <h5>{searchTerm ? 'No events match your search' : 'No events yet'}</h5>
                <p className="mb-0">
                  {searchTerm
                    ? 'Try a couple name, email, phone number, or created date.'
                    : 'No events have been added yet.'}
                </p>
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
                        <CTableHeaderCell>Email</CTableHeaderCell>
                        <CTableHeaderCell>Phone</CTableHeaderCell>
                        <CTableHeaderCell>Created</CTableHeaderCell>
                        <CTableHeaderCell style={{ textAlign: 'right' }}>Actions</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {events.map((event, index) => (
                        <CTableRow key={event.id}>
                          <CTableDataCell data-label="#">
                            <span className="text-muted">{((safePage - 1) * itemsPerPage) + index + 1}</span>
                          </CTableDataCell>
                          <CTableDataCell data-label="Event Name">
                            <strong>{event.name || 'Untitled Event'}</strong>
                          </CTableDataCell>
                          <CTableDataCell data-label="Email">
                            <span className="text-muted">{event.email || '—'}</span>
                          </CTableDataCell>
                          <CTableDataCell data-label="Phone">
                            <span className="text-muted">{getContactPhone(event) || '—'}</span>
                          </CTableDataCell>
                          <CTableDataCell data-label="Created">
                            <span className="text-muted">{formatDateTime(getCreatedAt(event))}</span>
                          </CTableDataCell>
                          <CTableDataCell data-label="Actions" className="text-end">
                            <div className="d-flex justify-content-end gap-2 flex-wrap">
                              <CButton
                                color="info"
                                size="sm"
                                variant="outline"
                                onClick={() => handleView(event)}
                                className="d-flex align-items-center gap-1"
                              >
                                <CIcon icon={cilInfo} size="sm" />
                                View
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
                          Showing {((safePage - 1) * itemsPerPage) + 1} to{' '}
                          {Math.min(safePage * itemsPerPage, filteredTotal)} of {filteredTotal} events
                        </p>
                      </CCol>
                      <CCol xs="auto">
                        <CPagination aria-label="Events pagination">
                          <CPaginationItem
                            disabled={safePage === 1}
                            onClick={() => handlePageChange(safePage - 1)}
                          >
                            Previous
                          </CPaginationItem>
                          {[...Array(Math.min(pageCount, 5)).keys()].map((page) => {
                            let pageNum = page + 1
                            if (pageCount > 5) {
                              if (safePage > 3) {
                                pageNum = safePage - 2 + page
                              }
                              if (safePage > pageCount - 2) {
                                pageNum = pageCount - 4 + page
                              }
                            }
                            if (pageNum > pageCount) return null
                            return (
                              <CPaginationItem
                                key={pageNum}
                                active={pageNum === safePage}
                                onClick={() => handlePageChange(pageNum)}
                              >
                                {pageNum}
                              </CPaginationItem>
                            )
                          })}
                          <CPaginationItem
                            disabled={safePage === pageCount}
                            onClick={() => handlePageChange(safePage + 1)}
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

        <EventViewModal
          visible={showViewModal}
          event={viewEvent}
          onClose={handleCloseViewModal}
        />

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
