import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CSpinner,
  CAlert,
  CPagination,
  CPaginationItem,
  CFormSelect,
  CRow,
  CCol,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilCheckCircle, cilColorPalette } from '@coreui/icons'
import config from '../../config'
import api from 'src/services/api'

const TemplatePicker = ({ selectedTemplate, setSelectedTemplate }) => {
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(6)
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    const fetchTemplates = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await api.get(`/merchant/templates?page=${currentPage}&limit=${itemsPerPage}`)
        
        if (response.data && response.data.data && Array.isArray(response.data.data)) {
          setTemplates(response.data.data)
          if (response.data.pagination) {
            setTotalItems(response.data.pagination.total || response.data.data.length)
            setTotalPages(response.data.pagination.totalPages || 1)
          }
        } else if (Array.isArray(response.data)) {
          setTemplates(response.data)
          setTotalItems(response.data.length)
          setTotalPages(Math.ceil(response.data.length / itemsPerPage))
        } else {
          setTemplates([])
        }
      } catch (err) {
        console.error('Error fetching templates:', err)
        setError('Failed to load templates. Please try again.')
        setTemplates([])
      } finally {
        setLoading(false)
      }
    }

    fetchTemplates()
  }, [currentPage, itemsPerPage])

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value))
    setCurrentPage(1)
  }

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

  // Mobile phone mockup component - thin border version
  const PhoneMockup = ({ src, title, isSelected, onClick }) => {
    const screenWidth = 180
    const screenHeight = 380
    const iframeScale = screenWidth / 375

    return (
      <div
        onClick={onClick}
        style={{
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          transition: 'transform 0.2s ease',
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        {/* Phone Frame - Thin Border */}
        <div
          style={{
            padding: '4px',
            background: isSelected 
              ? 'linear-gradient(135deg, var(--sk-purple, #2D1B4E), var(--sk-pink, #E8A0B0))'
              : '#222',
            borderRadius: '24px',
            boxShadow: isSelected 
              ? '0 8px 24px rgba(45, 27, 78, 0.35)'
              : '0 4px 16px rgba(0, 0, 0, 0.2)',
            transition: 'all 0.2s ease',
          }}
        >
          {/* Screen */}
          <div
            style={{
              width: `${screenWidth}px`,
              height: `${screenHeight}px`,
              background: '#fff',
              borderRadius: '20px',
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
                width: '60px',
                height: '18px',
                background: isSelected ? 'var(--sk-purple, #2D1B4E)' : '#222',
                borderRadius: '0 0 12px 12px',
                zIndex: 10,
              }}
            />
            
            {/* Iframe Container */}
            <div
              style={{
                width: '375px',
                height: '792px',
                transform: `scale(${iframeScale})`,
                transformOrigin: 'top left',
                position: 'absolute',
                top: 0,
                left: 0,
              }}
            >
              <iframe
                src={`${src}?skipLandingPage=true&skipMusic=true`}
                title={title}
                style={{
                  width: '375px',
                  height: '792px',
                  border: 'none',
                  pointerEvents: 'none',
                }}
              />
            </div>
            
            {/* Selected Overlay */}
            {isSelected && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(45, 27, 78, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '20px',
                }}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: 'var(--sk-purple, #2D1B4E)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                  }}
                >
                  <CIcon icon={cilCheckCircle} size="xl" style={{ color: '#fff' }} />
                </div>
              </div>
            )}
            
            {/* Home Indicator */}
            <div
              style={{
                position: 'absolute',
                bottom: '6px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '80px',
                height: '3px',
                background: isSelected ? 'var(--sk-pink, #E8A0B0)' : '#ddd',
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
            background: isSelected ? 'var(--sk-purple, #2D1B4E)' : 'var(--sk-white, #fff)',
            borderRadius: '16px',
            border: isSelected ? 'none' : '1px solid var(--sk-border, #E5E0E8)',
            transition: 'all 0.2s ease',
          }}
        >
          <span
            style={{
              fontSize: '0.8125rem',
              fontWeight: '600',
              color: isSelected ? '#fff' : 'var(--sk-text-primary, #2D1B4E)',
            }}
          >
            {title}
          </span>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <CCard className="mb-4">
        <CCardHeader>
          <div className="d-flex align-items-center gap-2">
            <CIcon icon={cilColorPalette} className="text-purple" />
            <strong>Select a Template</strong>
          </div>
        </CCardHeader>
        <CCardBody className="text-center py-5">
          <CSpinner />
          <p className="text-muted mt-3 mb-0">Loading templates...</p>
        </CCardBody>
      </CCard>
    )
  }

  if (error) {
    return (
      <CCard className="mb-4">
        <CCardHeader>
          <div className="d-flex align-items-center gap-2">
            <CIcon icon={cilColorPalette} className="text-purple" />
            <strong>Select a Template</strong>
          </div>
        </CCardHeader>
        <CCardBody>
          <CAlert color="danger" className="mb-0">{error}</CAlert>
        </CCardBody>
      </CCard>
    )
  }

  return (
    <CCard className="mb-4">
      <CCardHeader>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div className="d-flex align-items-center gap-2">
            <CIcon icon={cilColorPalette} className="text-purple" size="lg" />
            <div>
              <strong>Select a Template</strong>
              <p className="text-muted mb-0" style={{ fontSize: '0.8125rem' }}>
                Choose a beautiful design for your wedding card
              </p>
            </div>
          </div>
          <div className="d-flex align-items-center gap-2">
            <span className="text-muted" style={{ fontSize: '0.8125rem' }}>Show:</span>
            <CFormSelect
              size="sm"
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
              style={{ width: 'auto' }}
            >
              <option value={6}>6</option>
              <option value={12}>12</option>
              <option value={24}>24</option>
            </CFormSelect>
          </div>
        </div>
      </CCardHeader>
      <CCardBody style={{ background: 'var(--sk-bg-light, #F8F6F5)' }}>
        {templates.length > 0 ? (
          <>
            <CRow className="g-4 justify-content-center">
              {templates.map((template) => (
                <CCol key={template.id} xs={12} sm={6} lg={4} xl={3} className="d-flex justify-content-center">
                  <PhoneMockup
                    src={`${config.CARD_BASE_URL}/preview/${template.id}`}
                    title={template.theme}
                    isSelected={selectedTemplate === template.id}
                    onClick={() => setSelectedTemplate(template.id)}
                  />
                </CCol>
              ))}
            </CRow>

            {totalPages > 1 && (
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mt-4 pt-4 border-top">
                <p className="text-muted mb-0" style={{ fontSize: '0.8125rem' }}>
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
          <CAlert color="info" className="mb-0 text-center">
            No templates available at the moment.
          </CAlert>
        )}
      </CCardBody>
    </CCard>
  )
}

export default TemplatePicker
