import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CFormInput,
  CFormSelect,
  CPagination,
  CPaginationItem,
} from '@coreui/react'
import merchantService from '../../services/merchantService'

const License = () => {
  const [subscription, setSubscription] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    transaction_type: '',
    amount: '',
  })
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const data = await merchantService.getSubscription()
        setSubscription(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchSubscription()
  }, [])

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters({ ...filters, [name]: value })
    setCurrentPage(1) // Reset to first page on filter change
  }

  const filteredHistory =
    subscription?.history.filter((transaction) => {
      return (
        (filters.transaction_type === '' ||
          transaction.transaction_type.includes(filters.transaction_type)) &&
        (filters.amount === '' || transaction.amount.toString().includes(filters.amount))
      )
    }) || []

  const pageCount = Math.ceil(filteredHistory.length / itemsPerPage)
  const paginatedHistory = filteredHistory.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  )

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  if (!subscription) {
    return <div>No active subscription found.</div>
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Subscription Details</strong>
          </CCardHeader>
          <CCardBody>
            <p>
              <strong>Package:</strong> {subscription.package_name}
            </p>
            <p>
              <strong>Start Date:</strong> {new Date(subscription.start_date).toLocaleDateString()}
            </p>
            <p>
              <strong>End Date:</strong> {new Date(subscription.end_date).toLocaleDateString()}
            </p>
            <p>
              <strong>Event Credits Remaining:</strong> {subscription.event_credits_remaining}
            </p>
          </CCardBody>
        </CCard>
      </CCol>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Transaction History</strong>
          </CCardHeader>
          <CCardBody>
            <CRow className="mb-3">
              <CCol md={6}>
                <CFormSelect
                  name="transaction_type"
                  value={filters.transaction_type}
                  onChange={handleFilterChange}
                >
                  <option value="">All Transaction Types</option>
                  <option value="initial">Initial</option>
                  <option value="addon">Addon</option>
                  <option value="deduction">Deduction</option>
                </CFormSelect>
              </CCol>
              <CCol md={6}>
                <CFormInput
                  type="text"
                  name="amount"
                  placeholder="Filter by amount"
                  value={filters.amount}
                  onChange={handleFilterChange}
                />
              </CCol>
            </CRow>
            <CTable>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell scope="col">Date</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Transaction Type</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Amount</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {paginatedHistory.map((transaction) => (
                  <CTableRow key={transaction.id}>
                    <CTableDataCell>
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </CTableDataCell>
                    <CTableDataCell>{transaction.transaction_type}</CTableDataCell>
                    <CTableDataCell>{transaction.amount}</CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
            <CPagination align="center" aria-label="Page navigation example">
              <CPaginationItem
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Previous
              </CPaginationItem>
              {[...Array(pageCount).keys()].map((page) => (
                <CPaginationItem
                  key={page + 1}
                  active={page + 1 === currentPage}
                  onClick={() => setCurrentPage(page + 1)}
                >
                  {page + 1}
                </CPaginationItem>
              ))}
              <CPaginationItem
                disabled={currentPage === pageCount}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next
              </CPaginationItem>
            </CPagination>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default License
