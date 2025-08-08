import React from 'react'
import { CRow, CCol, CFormInput, CButton } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilX } from '@coreui/icons'

const EventItinerary = ({ itinerary, setItinerary }) => {
  const handleItineraryChange = (index, e) => {
    const { name, value } = e.target
    const list = [...itinerary]
    list[index][name] = value
    setItinerary(list)
  }

  const handleAddItinerary = () => {
    setItinerary([...itinerary, { name: '', time: '' }])
  }

  const handleRemoveItinerary = (index) => {
    const list = [...itinerary]
    list.splice(index, 1)
    setItinerary(list)
  }

  return (
    <>
      {itinerary.map((item, index) => (
        <CRow key={index} className="mb-3">
          <CCol md={5}>
            <CFormInput
              type="text"
              name="name"
              placeholder="Event Name"
              value={item.name}
              onChange={(e) => handleItineraryChange(index, e)}
            />
          </CCol>
          <CCol md={5}>
            <CFormInput
              type="time"
              name="time"
              placeholder="Event Time"
              value={item.time}
              onChange={(e) => handleItineraryChange(index, e)}
            />
          </CCol>
          <CCol md={2} className="d-flex align-items-center">
            {itinerary.length > 1 && (
              <CButton
                color="danger"
                onClick={() => handleRemoveItinerary(index)}
                style={{ borderRadius: '50%', width: '32px', height: '32px', padding: '0' }}
              >
                <CIcon icon={cilX} />
              </CButton>
            )}
          </CCol>
        </CRow>
      ))}
      <CButton color="primary" onClick={handleAddItinerary}>
        Add Itinerary
      </CButton>
    </>
  )
}

export default EventItinerary
