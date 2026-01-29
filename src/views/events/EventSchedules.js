import React, { useState, useEffect } from 'react'
import { CButton, CCol, CRow, CFormInput, CFormLabel } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilTrash, cilPlus, cilLocationPin } from '@coreui/icons'

const AddressSearch = ({ schedule, index, handleChange, required }) => {
  const [suggestions, setSuggestions] = useState([])
  const [lat, setLat] = useState(3.139)
  const [lon, setLon] = useState(101.6869)
  const [country, setCountry] = useState('Malaysia')
  const [loading, setLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(true)

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        setLat(position.coords.latitude)
        setLon(position.coords.longitude)
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`,
        )
        const data = await response.json()
        setCountry(data.address.country)
      },
      () => {
        // Default to Kuala Lumpur
      },
    )
  }, [])

  const handleAddressChange = async (e) => {
    const { value } = e.target
    handleChange({ target: { name: 'address', value } }, index)
    setShowSuggestions(true)

    if (value.length > 2) {
      setLoading(true)
      const response = await fetch(
        `https://photon.komoot.io/api/?q=${value}&lat=${lat}&lon=${lon}`,
      )
      const data = await response.json()
      const filteredSuggestions = data.features.filter(
        (feature) => feature.properties.country === country,
      )
      setSuggestions(filteredSuggestions)
      setLoading(false)
    } else {
      setSuggestions([])
    }
  }

  const handleSuggestionClick = (suggestion) => {
    const address = `${suggestion.properties.name}, ${suggestion.properties.state}, ${suggestion.properties.country}`
    const address_url = `https://maps.google.com/?q=${suggestion.geometry.coordinates[1]},${suggestion.geometry.coordinates[0]}`
    handleChange({ target: { name: 'address', value: address } }, index)
    handleChange({ target: { name: 'address_url', value: address_url } }, index)
    setShowSuggestions(false)
    setSuggestions([])
  }

  return (
    <div className="position-relative">
      <CFormInput
        type="text"
        name="address"
        value={schedule.address}
        onChange={handleAddressChange}
        placeholder="Search for venue address..."
        autoComplete="off"
        required={required}
      />
      {loading && (
        <div className="position-absolute" style={{ right: '10px', top: '50%', transform: 'translateY(-50%)' }}>
          <div className="spinner-border spinner-border-sm text-muted" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}
      {showSuggestions && suggestions.length > 0 && (
        <ul 
          className="list-group position-absolute w-100 shadow-sm" 
          style={{ 
            zIndex: 1000, 
            maxHeight: '200px', 
            overflowY: 'auto',
            borderRadius: '8px',
            marginTop: '4px',
          }}
        >
          {suggestions.map((suggestion) => (
            <li
              key={suggestion.properties.osm_id}
              className="list-group-item list-group-item-action d-flex align-items-center gap-2"
              onClick={() => handleSuggestionClick(suggestion)}
              style={{ cursor: 'pointer', fontSize: '0.875rem' }}
            >
              <CIcon icon={cilLocationPin} className="text-muted" size="sm" />
              {suggestion.properties.name}, {suggestion.properties.state}, {suggestion.properties.country}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

const EventSchedules = ({ schedules, setSchedules }) => {
  const handleAddSchedule = () => {
    setSchedules([...schedules, { title: '', date: '', address: '', address_url: '' }])
  }

  const handleRemoveSchedule = (index) => {
    const newSchedules = [...schedules]
    newSchedules.splice(index, 1)
    setSchedules(newSchedules)
  }

  const handleChange = (e, index) => {
    const { name, value } = e.target
    const newSchedules = [...schedules]
    newSchedules[index][name] = value
    setSchedules(newSchedules)
  }

  return (
    <div>
      {schedules.map((schedule, index) => (
        <div 
          key={index} 
          className="mb-3 p-3 position-relative"
          style={{
            background: 'var(--sk-cream, #FAF8F7)',
            borderRadius: '12px',
            border: '1px solid var(--sk-border, #E5E0E8)',
          }}
        >
          {/* Event Number Badge */}
          <div 
            style={{
              position: 'absolute',
              top: '-10px',
              left: '16px',
              background: 'var(--sk-purple, #2D1B4E)',
              color: '#fff',
              fontSize: '0.75rem',
              fontWeight: '600',
              padding: '2px 10px',
              borderRadius: '10px',
            }}
          >
            Event {index + 1}
          </div>
          
          {/* Remove Button */}
          {schedules.length > 1 && (
            <button
              type="button"
              onClick={() => handleRemoveSchedule(index)}
              style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                width: '28px',
                height: '28px',
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
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(220, 53, 69, 0.1)'
                e.currentTarget.style.color = '#dc3545'
              }}
              title="Remove event"
            >
              <CIcon icon={cilTrash} size="sm" />
            </button>
          )}
          
          <CRow className="g-3 mt-1">
            <CCol md={4}>
              <CFormLabel className="text-muted" style={{ fontSize: '0.8125rem' }}>Event Title *</CFormLabel>
              <CFormInput
                type="text"
                name="title"
                value={schedule.title}
                placeholder="e.g., Nikah Ceremony"
                onChange={(e) => handleChange(e, index)}
                required
              />
            </CCol>
            <CCol md={4}>
              <CFormLabel className="text-muted" style={{ fontSize: '0.8125rem' }}>Date & Time *</CFormLabel>
              <CFormInput
                type="datetime-local"
                name="date"
                value={schedule.date}
                onChange={(e) => handleChange(e, index)}
                required
              />
            </CCol>
            <CCol md={4}>
              <CFormLabel className="text-muted" style={{ fontSize: '0.8125rem' }}>Venue Address *</CFormLabel>
              <AddressSearch schedule={schedule} index={index} handleChange={handleChange} required />
            </CCol>
          </CRow>
        </div>
      ))}
      
      <CButton 
        color="primary" 
        variant="outline"
        onClick={handleAddSchedule}
        className="d-flex align-items-center gap-2"
      >
        <CIcon icon={cilPlus} size="sm" />
        Add Event Schedule
      </CButton>
    </div>
  )
}

export default EventSchedules
