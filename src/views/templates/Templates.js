import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CContainer,
  CRow,
  CSpinner,
  CAlert,
  CPagination,
  CPaginationItem,
  CFormSelect,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilColorPalette } from '@coreui/icons'
import api from '../../services/api'
import PageTitle from '../../components/PageTitle'
import config from '../../config'

const Templates = () => {
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(12)
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    const fetchTemplates = async () => {
      setLoading(true)
      try {
        const response = await api.get(`/merchant/templates?page=${currentPage}&limit=${itemsPerPage}`)
        
        if (response.data && response.data.data) {
          setTemplates(response.data.data)
          if (response.data.pagination) {
            setTotalItems(response.data.pagination.total)
            setTotalPages(response.data.pagination.totalPages)
          }
        } else if (Array.isArray(response.data)) {
          setTemplates(response.data)
          setTotalItems(response.data.length)
          setTotalPages(Math.ceil(response.data.length / itemsPerPage))
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchTemplates()
  }, [currentPage, itemsPerPage])

  const handlePageChange = (page) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value))
    setCurrentPage(1)
  }

  // Mobile phone mockup component - thin border version
  const PhoneMockup = ({ src, title }) => {
    const screenWidth = 160
    const screenHeight = 340
    const iframeScale = screenWidth / 375

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* Phone Frame - Thin Border */}
        <div
          style={{
            padding: '3px',
            background: '#222',
            borderRadius: '22px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
          }}
        >
          {/* Screen */}
          <div
            style={{
              width: `${screenWidth}px`,
              height: `${screenHeight}px`,
              background: '#fff',
              borderRadius: '19px',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            {/* Notch */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: '50%',
                transform: 'translateX(-50%)',
                width: '50px',
                height: '16px',
                background: '#222',
                borderRadius: '0 0 10px 10px',
                zIndex: 10,
              }}
            />
            
            {/* Iframe Container */}
            <div
              style={{
                width: '375px',
                height: '800px',
                transform: `scale(${iframeScale})`,
                transformOrigin: 'top left',
                position: 'absolute',
                top: 0,
                left: 0,
              }}
            >
              <iframe
                src={`${config.CARD_BASE_URL}/preview/${src}?skipLandingPage=true&skipMusic=true`}
                title={title}
                loading="lazy"
                style={{
                  width: '375px',
                  height: '800px',
                  border: 'none',
                  pointerEvents: 'none',
                }}
              />
            </div>
            
            {/* Home Indicator */}
            <div
              style={{
                position: 'absolute',
                bottom: '5px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '70px',
                height: '3px',
                background: '#ddd',
                borderRadius: '2px',
              }}
            />
          </div>
        </div>
        
        {/* Template Name */}
        <div
          style={{
            marginTop: '10px',
            padding: '6px 14px',
            background: 'var(--sk-white, #fff)',
            borderRadius: '16px',
            border: '1px solid var(--sk-border, #E5E0E8)',
          }}
        >
          <span
            style={{
              fontSize: '0.8125rem',
              fontWeight: '600',
              color: 'var(--sk-text-primary, #2D1B4E)',
            }}
          >
            {title}
          </span>
        </div>
      </div>
    )
  }

  // Generate pagination items
  const getPaginationItems = () => {
    const items = []
    const maxVisible = 5
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2))
    let endPage = Math.min(totalPages, startPage + maxVisible - 1)
    
    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1)
    }
    
    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <CPaginationItem
          key={i}
          active={i === currentPage}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </CPaginationItem>
      )
    }
    return items
  }

  if (loading) {
    return (
      <>
        <PageTitle title="Templates" description="Browse and preview available wedding card templates" />
        <div className="loading-container">
          <CSpinner />
          <p>Loading templates...</p>
        </div>
      </>
    )
  }

  if (error) {
    return (
      <>
        <PageTitle title="Templates" description="Browse and preview available wedding card templates" />
        <CContainer fluid>
          <CAlert color="danger">
            <strong>Error:</strong> {error}
          </CAlert>
        </CContainer>
      </>
    )
  }

  return (
    <>
      <PageTitle title="Templates" description="Browse and preview available wedding card templates" />
      <CContainer fluid>
        <CCard>
          <CCardHeader>
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
              <div className="d-flex align-items-center gap-2">
                <CIcon icon={cilColorPalette} className="text-purple" size="lg" />
                <div>
                  <strong>Wedding Card Templates</strong>
                  <p className="text-muted mb-0">Browse all available designs</p>
                </div>
              </div>
              <div className="d-flex align-items-center gap-2">
                <span className="text-muted" style={{ fontSize: '0.875rem' }}>Show:</span>
                <CFormSelect
                  size="sm"
                  value={itemsPerPage}
                  onChange={handleItemsPerPageChange}
                  style={{ width: 'auto' }}
                >
                  <option value={12}>12</option>
                  <option value={24}>24</option>
                  <option value={48}>48</option>
                </CFormSelect>
              </div>
            </div>
          </CCardHeader>
          <CCardBody style={{ background: 'var(--sk-bg-light, #F8F6F5)' }}>
            {templates.length > 0 ? (
              <>
                <CRow className="g-4 justify-content-center">
                  {templates.map((template) => (
                    <CCol key={template.id} xs={6} sm={4} md={3} lg={2} className="d-flex justify-content-center">
                      <PhoneMockup
                        src={template.id}
                        title={template.theme}
                      />
                    </CCol>
                  ))}
                </CRow>

                {totalPages > 1 && (
                  <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mt-4 pt-3 border-top">
                    <p className="text-muted mb-0" style={{ fontSize: '0.875rem' }}>
                      Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                      {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} templates
                    </p>
                    <CPagination aria-label="Template pagination">
                      <CPaginationItem
                        disabled={currentPage === 1}
                        onClick={() => handlePageChange(currentPage - 1)}
                      >
                        Previous
                      </CPaginationItem>
                      {getPaginationItems()}
                      <CPaginationItem
                        disabled={currentPage === totalPages}
                        onClick={() => handlePageChange(currentPage + 1)}
                      >
                        Next
                      </CPaginationItem>
                    </CPagination>
                  </div>
                )}
              </>
            ) : (
              <CAlert color="info" className="mb-0">
                No templates available at the moment.
              </CAlert>
            )}
          </CCardBody>
        </CCard>
      </CContainer>
    </>
  )
}

export default Templates
