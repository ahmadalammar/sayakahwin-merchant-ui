import React, { useEffect } from 'react'
import { CRow, CCol, CFormInput, CButton, CFormLabel } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilTrash, cilPlus, cilExternalLink } from '@coreui/icons'

const GiftList = ({ gifts, setGifts }) => {
  // Normalize gifts on mount - convert old format to new format
  useEffect(() => {
    const needsNormalization = gifts.some(
      (gift) => typeof gift === 'string' || (gift && !gift.hasOwnProperty('gift_name') && !gift.hasOwnProperty('name'))
    )
    
    if (needsNormalization) {
      const normalized = gifts.map((gift) => {
        if (typeof gift === 'string') {
          return { gift_name: gift, gift_link: '' }
        }
        // Handle old object format without gift_name
        if (gift && gift.name) {
          return { gift_name: gift.name, gift_link: gift.link || gift.gift_link || '' }
        }
        return {
          gift_name: gift?.gift_name || '',
          gift_link: gift?.gift_link || '',
        }
      })
      setGifts(normalized)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run on mount

  const handleGiftChange = (index, e) => {
    const { name, value } = e.target
    const list = [...gifts]
    // Ensure the gift object has the correct structure
    if (!list[index] || typeof list[index] === 'string') {
      list[index] = { gift_name: '', gift_link: '' }
    }
    list[index][name] = value
    setGifts(list)
  }

  const handleAddGift = () => {
    setGifts([...gifts, { gift_name: '', gift_link: '' }])
  }

  const handleRemoveGift = (index) => {
    const list = [...gifts]
    list.splice(index, 1)
    setGifts(list)
  }

  // Normalize for display - ensure all gifts are in the correct format
  const normalizedGifts = gifts.map((gift) => {
    if (typeof gift === 'string') {
      return { gift_name: gift, gift_link: '' }
    }
    if (gift.name) {
      return { gift_name: gift.name, gift_link: gift.link || gift.gift_link || '' }
    }
    return {
      gift_name: gift.gift_name || '',
      gift_link: gift.gift_link || '',
    }
  })

  return (
    <div>
      {normalizedGifts.length === 0 && (
        <div 
          className="mb-3 p-4 text-center"
          style={{
            background: 'var(--sk-cream, #FAF8F7)',
            borderRadius: '12px',
            border: '1px solid var(--sk-border, #E5E0E8)',
            color: '#6c757d',
          }}
        >
          <CIcon icon={cilPlus} size="lg" className="mb-2" />
          <p className="mb-0" style={{ fontSize: '0.875rem' }}>No gifts added yet. Click "Add Gift" to get started.</p>
        </div>
      )}

      {normalizedGifts.map((gift, index) => (
        <div 
          key={index} 
          className="mb-3 p-4 position-relative"
          style={{
            background: 'var(--sk-cream, #FAF8F7)',
            borderRadius: '12px',
            border: '1px solid var(--sk-border, #E5E0E8)',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--sk-purple, #2D1B4E)'
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(45, 27, 78, 0.1)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--sk-border, #E5E0E8)'
            e.currentTarget.style.boxShadow = 'none'
          }}
        >
          {/* Gift Number Badge */}
          <div 
            style={{
              position: 'absolute',
              top: '-10px',
              left: '16px',
              background: 'var(--sk-purple, #2D1B4E)',
              color: '#fff',
              fontSize: '0.75rem',
              fontWeight: '600',
              padding: '4px 12px',
              borderRadius: '10px',
              zIndex: 1,
            }}
          >
            Gift {index + 1}
          </div>
          
          {/* Remove Button */}
          <button
            type="button"
            onClick={() => handleRemoveGift(index)}
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              border: 'none',
              background: 'rgba(220, 53, 69, 0.1)',
              color: '#dc3545',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#dc3545'
              e.currentTarget.style.color = '#fff'
              e.currentTarget.style.transform = 'scale(1.1)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(220, 53, 69, 0.1)'
              e.currentTarget.style.color = '#dc3545'
              e.currentTarget.style.transform = 'scale(1)'
            }}
            title="Remove gift"
          >
            <CIcon icon={cilTrash} size="sm" />
          </button>
          
          <CRow className="g-3 mt-2">
            <CCol xs={6} md={6}>
              <CFormLabel className="text-muted" style={{ fontSize: '0.8125rem', fontWeight: '500' }}>
                Gift Name <span className="text-danger">*</span>
              </CFormLabel>
              <CFormInput
                type="text"
                name="gift_name"
                placeholder="e.g., Blender, Toaster"
                value={gift.gift_name}
                onChange={(e) => handleGiftChange(index, e)}
                style={{
                  borderRadius: '8px',
                  border: '1px solid #dee2e6',
                  transition: 'all 0.2s ease',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--sk-purple, #2D1B4E)'
                  e.currentTarget.style.boxShadow = '0 0 0 0.2rem rgba(45, 27, 78, 0.1)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#dee2e6'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              />
            </CCol>
            <CCol xs={6} md={6}>
              <CFormLabel className="text-muted" style={{ fontSize: '0.8125rem', fontWeight: '500' }}>
                <span className="d-flex align-items-center gap-1">
                  <CIcon icon={cilExternalLink} size="sm" />
                  Gift Link <span className="text-muted" style={{ fontSize: '0.75rem' }}>(Optional)</span>
                </span>
              </CFormLabel>
              <CFormInput
                type="url"
                name="gift_link"
                placeholder="https://example.com"
                value={gift.gift_link}
                onChange={(e) => handleGiftChange(index, e)}
                style={{
                  borderRadius: '8px',
                  border: '1px solid #dee2e6',
                  transition: 'all 0.2s ease',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--sk-purple, #2D1B4E)'
                  e.currentTarget.style.boxShadow = '0 0 0 0.2rem rgba(45, 27, 78, 0.1)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#dee2e6'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              />
              {gift.gift_link && (
                <div className="mt-1">
                  <a 
                    href={gift.gift_link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{
                      fontSize: '0.75rem',
                      color: 'var(--sk-purple, #2D1B4E)',
                      textDecoration: 'none',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.textDecoration = 'underline'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.textDecoration = 'none'
                    }}
                  >
                    <CIcon icon={cilExternalLink} size="sm" className="me-1" />
                    Preview link
                  </a>
                </div>
              )}
            </CCol>
          </CRow>
        </div>
      ))}
      
      <CButton 
        color="primary" 
        variant="outline"
        onClick={handleAddGift}
        className="d-flex align-items-center gap-2"
        style={{
          borderRadius: '8px',
          borderWidth: '2px',
          fontWeight: '500',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)'
          e.currentTarget.style.boxShadow = '0 4px 8px rgba(45, 27, 78, 0.15)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = 'none'
        }}
      >
        <CIcon icon={cilPlus} size="sm" />
        Add Gift
      </CButton>
    </div>
  )
}

export default GiftList
