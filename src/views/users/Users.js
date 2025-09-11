import React, { useState, useEffect } from 'react'
import { CButton, CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell, CFormInput, CPagination, CPaginationItem } from '@coreui/react'
import api from 'src/services/api'
import authService from 'src/services/auth'
import config from 'src/config'

const Users = () => {
  const [allUsers, setAllUsers] = useState([])
  const [users, setUsers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    const user = authService.getCurrentUser()
    api.get(`/merchant/${user.merchantId}/events`)
      .then((response) => {
        setAllUsers(response.data)
        setUsers(response.data.slice(0, 10))
      })
      .catch((error) => console.error('Error fetching users:', error))
  }, [])

  const handleSearch = (event) => {
    const term = event.target.value
    setSearchTerm(term)
    const filteredUsers = allUsers.filter(
      (user) =>
        user.name.toLowerCase().includes(term.toLowerCase()) ||
        user.email.toLowerCase().includes(term.toLowerCase()),
    )
    setUsers(filteredUsers.slice(0, 10))
    setCurrentPage(1)
  }

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber)
    const startIndex = (pageNumber - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const filteredUsers = allUsers.filter(
      (user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setUsers(filteredUsers.slice(startIndex, endIndex))
  }

  const pageCount = Math.ceil(
    allUsers.filter(
      (user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()),
    ).length / itemsPerPage,
  )

  const handleView = (userId) => {
    const user = authService.getCurrentUser()
    const url = `${config.CARD_BASE_URL}/${user.merchantId}/${userId}`
    window.open(url, '_blank')
  }

  return (
    <div>
      <div className="d-flex justify-content-between mb-3">
        <CButton color="primary">Create User</CButton>
        <CFormInput
          type="text"
          placeholder="Search by name or email"
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
            <CTableHeaderCell>Email</CTableHeaderCell>
            <CTableHeaderCell style={{ textAlign: 'right' }}>Actions</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {users.map((user) => (
            <CTableRow key={user.id}>
              <CTableDataCell>{user.id}</CTableDataCell>
              <CTableDataCell>{user.name}</CTableDataCell>
              <CTableDataCell>{user.email}</CTableDataCell>
              <CTableDataCell style={{ textAlign: 'right' }}>
                <CButton
                  color="info"
                  size="sm"
                  className="me-2"
                  onClick={() => handleView(user.id)}
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

export default Users
