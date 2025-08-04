import React, { useState, useEffect } from 'react'
import { CButton, CCol, CRow, CFormInput, CFormLabel } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilX } from '@coreui/icons'

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
    <div>
      <CFormInput
        type="text"
        name="address"
        value={schedule.address}
        onChange={handleAddressChange}
        autoComplete="off"
        required={required}
      />
      {loading && <div className="spinner-border spinner-border-sm" role="status"><span className="visually-hidden">Loading...</span></div>}
      {showSuggestions && suggestions.length > 0 && (
        <ul className="list-group">
          {suggestions.map((suggestion) => (
            <li
              key={suggestion.properties.osm_id}
              className="list-group-item list-group-item-action"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {suggestion.properties.name}, {suggestion.properties.state}, {suggestion.properties.country}
            </li>
          ))}
        </ul>
      )}
      {showSuggestions && !loading && suggestions.length === 0 && schedule.address.length > 2 && (
        <div className="list-group-item">No results found.</div>
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
        <CRow key={index} className="mb-3">
          <CCol md={3}>
            <CFormLabel>Title *</CFormLabel>
            <CFormInput
              type="text"
              name="title"
              value={schedule.title}
              onChange={(e) => handleChange(e, index)}
              required
            />
          </CCol>
          <CCol md={3}>
            <CFormLabel>Date *</CFormLabel>
            <CFormInput
              type="datetime-local"
              name="date"
              value={schedule.date}
              onChange={(e) => handleChange(e, index)}
              required
            />
          </CCol>
          <CCol md={4}>
            <CFormLabel>Address *</CFormLabel>
            <AddressSearch schedule={schedule} index={index} handleChange={handleChange} required />
          </CCol>
          <CCol md={2} className="d-flex align-items-end">
            <CButton
              color="danger"
              onClick={() => handleRemoveSchedule(index)}
              disabled={schedules.length === 1}
              style={{ borderRadius: '50%', width: '32px', height: '32px', padding: '0' }}
            >
              <CIcon icon={cilX} />
            </CButton>
          </CCol>
        </CRow>
      ))}
      <CButton color="primary" onClick={handleAddSchedule}>
        Add Schedule
      </CButton>
    </div>
  )
}

export default EventSchedules
