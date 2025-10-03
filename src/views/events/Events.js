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
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilInfo } from '@coreui/icons'
import authService from 'src/services/auth'
import config from 'src/config'

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

  const fetchEvents = () => {
    const user = authService.getCurrentUser()
    api
      .get(`/merchant/${user.merchantId}/events`)
      .then((response) => {
        const eventsData = response.data || []
        setAllEvents(eventsData)
        setEvents(eventsData.slice(0, 10))
      })
      .catch((error) => console.error('Error fetching events:', error))
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
    setEvents(filteredEvents.slice(0, 10))
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

  const pageCount = Math.ceil(
    allEvents.filter(
      (event) =>
        (event.name && event.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (event.description && event.description.toLowerCase().includes(searchTerm.toLowerCase())),
    ).length / itemsPerPage,
  )

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

  return (
    <div>
      <div className="d-flex justify-content-between mb-3">
        <CButton color="primary" onClick={() => navigate('/events/create')}>
          Create Event
        </CButton>
        <CFormInput
          type="text"
          placeholder="Search by name or description"
          value={searchTerm}
          onChange={handleSearch}
          style={{ maxWidth: '300px' }}
        />
      </div>
      <CTable>
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell>#</CTableHeaderCell>
            <CTableHeaderCell>Name</CTableHeaderCell>
            <CTableHeaderCell>Description</CTableHeaderCell>
            <CTableHeaderCell style={{ textAlign: 'right' }}>Actions</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {events.map((event) => (
            <CTableRow key={event.id}>
              <CTableDataCell>{event.id}</CTableDataCell>
              <CTableDataCell>{event.name}</CTableDataCell>
              <CTableDataCell>{event.description}</CTableDataCell>
              <CTableDataCell style={{ textAlign: 'right' }}>
                <CButton
                  color="info"
                  size="sm"
                  className="me-2"
                  onClick={() => handleView(event.id)}
                >
                  View
                </CButton>
                <CButton
                  color="warning"
                  size="sm"
                  onClick={() => {
                    const user = authService.getCurrentUser()
                    navigate(`/merchant/${user.merchantId}/events/${event.id}`)
                  }}
                >
                  Update
                </CButton>
                <CDropdown className="ms-2">
                  <CDropdownToggle color="secondary" size="sm">
                    &#x22EE;
                  </CDropdownToggle>
                  <CDropdownMenu>
                    <CDropdownItem onClick={() => handleShowCredentials(event)}>
                      Show Credentials
                    </CDropdownItem>
                    <CDropdownItem onClick={() => openResetPasswordModal(event)}>
                      Reset Password
                    </CDropdownItem>
                  </CDropdownMenu>
                </CDropdown>
              </CTableDataCell>
            </CTableRow>
          ))}
        </CTableBody>
      </CTable>
      <CPagination align="end">
        <CPaginationItem
          disabled={currentPage === 1}
          onClick={() => handlePageChange(currentPage - 1)}
        >
          Previous
        </CPaginationItem>
        {[...Array(pageCount).keys()].map((page) => (
          <CPaginationItem
            key={page + 1}
            active={page + 1 === currentPage}
            onClick={() => handlePageChange(page + 1)}
          >
            {page + 1}
          </CPaginationItem>
        ))}
        <CPaginationItem
          disabled={currentPage === pageCount}
          onClick={() => handlePageChange(currentPage + 1)}
        >
          Next
        </CPaginationItem>
      </CPagination>

      <CModal visible={showCredentialsModal} onClose={() => setShowCredentialsModal(false)}>
        <CModalHeader>
          <CModalTitle>User Credentials</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <div
            className="p-3 mb-3"
            style={{
              backgroundColor: '#e6f7ff',
              border: '1px solid #91d5ff',
              borderRadius: '8px',
              color: '#0050b3',
            }}
          >
            <div className="d-flex align-items-center">
              <CIcon icon={cilInfo} size="xl" className="me-3" />
              <small>
                Share this information with the event owner (the couple) to allow them to manage
                guests, RSVPs, and more.
              </small>
            </div>
          </div>
          <p>
            <strong>User Portal URL:</strong>{' '}
            <a href="http://user.sayakahwin.com" target="_blank" rel="noopener noreferrer">
              user.sayakahwin.com
            </a>
          </p>
          <p>
            <strong>Email:</strong> {credentials.email}
          </p>
          <p>
            <strong>Password:</strong> {credentials.password}
          </p>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowCredentialsModal(false)}>
            Close
          </CButton>
        </CModalFooter>
      </CModal>

      <CModal visible={showResetPasswordModal} onClose={() => setShowResetPasswordModal(false)}>
        <CModalHeader>
          <CModalTitle>Reset Password</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CFormInput
            type="password"
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowResetPasswordModal(false)}>
            Cancel
          </CButton>
          <CButton color="primary" onClick={handleResetPassword}>
            Reset
          </CButton>
        </CModalFooter>
      </CModal>

      <CModal visible={showSuccessModal} onClose={() => setShowSuccessModal(false)}>
        <CModalHeader>
          <CModalTitle>Success</CModalTitle>
        </CModalHeader>
        <CModalBody>{successMessage}</CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowSuccessModal(false)}>
            Close
          </CButton>
        </CModalFooter>
      </CModal>
    </div>
  )
}

export default Events
