import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import config from '../../config'
import { CButton, CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell, CFormInput, CPagination, CPaginationItem } from '@coreui/react'

const Events = () => {
  const navigate = useNavigate()
  const [allEvents, setAllEvents] = useState([])
  const [events, setEvents] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    const merchantId = '62015170-9b5d-4902-a9c2-6169ef71382e' // Please confirm how to get merchantId
    fetch(`${config.API_BASE_URL}/merchant/${merchantId}/events`)
      .then((response) => response.json())
      .then((data) => {
        const eventsData = data || []
        setAllEvents(eventsData)
        setEvents(eventsData.slice(0, 10))
      })
      .catch((error) => console.error('Error fetching events:', error))
  }, [])

  const handleSearch = (event) => {
    const term = event.target.value
    setSearchTerm(term)
    const filteredEvents = allEvents.filter(
      (event) =>
        event.name.toLowerCase().includes(term.toLowerCase()) ||
        event.description.toLowerCase().includes(term.toLowerCase()),
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
        event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setEvents(filteredEvents.slice(startIndex, endIndex))
  }

  const pageCount = Math.ceil(
    allEvents.filter(
      (event) =>
        event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase()),
    ).length / itemsPerPage,
  )

  const handleView = (eventId) => {
    const merchantId = '62015170-9b5d-4902-a9c2-6169ef71382e' // Please confirm how to get merchantId
    const url = `${config.CARD_BASE_URL}/${merchantId}/${eventId}`
    window.open(url, '_blank')
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
                <CButton color="warning" size="sm">
                  Update
                </CButton>
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
    </div>
  )
}

export default Events
