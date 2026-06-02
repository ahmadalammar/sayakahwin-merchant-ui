import React from 'react'
import { CRow, CCol, CFormInput, CButton, CFormLabel } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilTrash, cilPlus } from '@coreui/icons'
import { EMPTY_ITINERARY_ITEM, syncItineraryOrder } from './eventItineraryUtils'

const reorderButtonStyle = {
  width: '28px',
  height: '28px',
  borderRadius: '8px',
  border: 'none',
  background: 'rgba(45, 27, 78, 0.08)',
  color: 'var(--sk-purple, #2D1B4E)',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '0.875rem',
  lineHeight: 1,
  transition: 'all 0.2s ease',
}

const EventItinerary = ({ itinerary, setItinerary }) => {
  const handleItineraryChange = (index, e) => {
    const { name, value } = e.target
    const list = [...itinerary]
    list[index][name] = value
    setItinerary(list)
  }

  const handleAddItinerary = () => {
    setItinerary(syncItineraryOrder([...itinerary, { ...EMPTY_ITINERARY_ITEM }]))
  }

  const handleRemoveItinerary = (index) => {
    const list = [...itinerary]
    list.splice(index, 1)
    setItinerary(syncItineraryOrder(list))
  }

  const handleMoveItinerary = (index, direction) => {
    const newIndex = index + direction
    if (newIndex < 0 || newIndex >= itinerary.length) return
    const list = [...itinerary]
    const [moved] = list.splice(index, 1)
    list.splice(newIndex, 0, moved)
    setItinerary(syncItineraryOrder(list))
  }

  return (
    <>
      {itinerary.map((item, index) => (
        <div 
          key={index} 
          className="mb-3 p-3 position-relative"
          style={{
            background: 'var(--sk-cream, #FAF8F7)',
            borderRadius: '12px',
            border: '1px solid var(--sk-border, #E5E0E8)',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              display: 'flex',
              gap: '4px',
            }}
          >
            <button
              type="button"
              onClick={() => handleMoveItinerary(index, -1)}
              disabled={index === 0}
              style={{
                ...reorderButtonStyle,
                opacity: index === 0 ? 0.35 : 1,
                cursor: index === 0 ? 'not-allowed' : 'pointer',
              }}
              title="Move up"
            >
              ↑
            </button>
            <button
              type="button"
              onClick={() => handleMoveItinerary(index, 1)}
              disabled={index === itinerary.length - 1}
              style={{
                ...reorderButtonStyle,
                opacity: index === itinerary.length - 1 ? 0.35 : 1,
                cursor: index === itinerary.length - 1 ? 'not-allowed' : 'pointer',
              }}
              title="Move down"
            >
              ↓
            </button>
            <button
              type="button"
              onClick={() => handleRemoveItinerary(index)}
              style={{
                ...reorderButtonStyle,
                background: 'rgba(220, 53, 69, 0.1)',
                color: '#dc3545',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#dc3545'
                e.currentTarget.style.color = '#fff'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(220, 53, 69, 0.1)'
                e.currentTarget.style.color = '#dc3545'
              }}
              title="Remove item"
            >
              <CIcon icon={cilTrash} size="sm" />
            </button>
          </div>
          
          <CRow className="g-3">
            <CCol md={7}>
              <CFormLabel className="text-muted" style={{ fontSize: '0.8125rem' }}>Activity Name</CFormLabel>
              <CFormInput
                type="text"
                name="name"
                placeholder="e.g., Guest Arrival"
                value={item.name}
                onChange={(e) => handleItineraryChange(index, e)}
              />
            </CCol>
            <CCol md={5}>
              <CFormLabel className="text-muted" style={{ fontSize: '0.8125rem' }}>Time</CFormLabel>
              <CFormInput
                type="time"
                name="time"
                value={item.time}
                onChange={(e) => handleItineraryChange(index, e)}
              />
            </CCol>
          </CRow>
        </div>
      ))}
      
      <CButton 
        color="primary" 
        variant="outline"
        onClick={handleAddItinerary}
        className="d-flex align-items-center gap-2"
      >
        <CIcon icon={cilPlus} size="sm" />
        Add Activity
      </CButton>
    </>
  )
}

export default EventItinerary
