import React, { useState } from 'react'
import { CButton, CCard, CCardBody, CCardHeader, CCol, CRow, CForm, CFormInput, CFormLabel, CFormTextarea, CFormCheck, CModal, CModalHeader, CModalBody, CModalFooter, CSpinner } from '@coreui/react'
import config from '../../config'
import EventSchedules from './EventSchedules'
import EventItinerary from './EventItinerary'
import EventGallery from './EventGallery'
import TemplatePicker from './TemplatePicker'
import ContactForm from './ContactForm'

const CreateEvent = () => {
  const [schedules, setSchedules] = useState([{ title: '', date: '', address: '', address_url: '' }])
  const [itinerary, setItinerary] = useState([{ name: '', time: '' }])
  const [gallery, setGallery] = useState([])
  const [contacts, setContacts] = useState([{ name: '', phone_number: '' }])
  const [errors, setErrors] = useState({})
  const [showGiftInfo, setShowGiftInfo] = useState(false)
  const [showSalamOpening, setShowSalamOpening] = useState(true)
  const [loading, setLoading] = useState(false)
  const [modal, setModal] = useState({ show: false, message: '', color: '' })
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [formData, setFormData] = useState({
    groom_name: '',
    groom_father_name: '',
    bride_name: '',
    bride_father_name: '',
    opening_message: '',
    parent_opening: '',
    event_description: '',
    gifts_description: '',
    location_iframe_url: '',
    account_bank_name: '',
    account_bank_number: '',
    account_beneficiary_name: '',
    closing_message: '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const validate = () => {
    const newErrors = {}
    if (!selectedTemplate) newErrors.template = 'Please select a template'
    if (!formData.groom_name) newErrors.groom_name = 'Groom name is required'
    if (!formData.groom_father_name) newErrors.groom_father_name = "Groom's father name is required"
    if (!formData.bride_name) newErrors.bride_name = 'Bride name is required'
    if (!formData.bride_father_name) newErrors.bride_father_name = "Bride's father name is required"
    schedules.forEach((schedule, index) => {
      if (!schedule.title) newErrors[`schedule_title_${index}`] = 'Title is required'
      if (!schedule.date) newErrors[`schedule_date_${index}`] = 'Date is required'
      if (!schedule.address) newErrors[`schedule_address_${index}`] = 'Address is required'
    })
    contacts.forEach((contact, index) => {
      if (!contact.name) newErrors[`contact_name_${index}`] = 'Name is required'
      if (!contact.phone_number) newErrors[`contact_phone_${index}`] = 'Phone number is required'
    })
    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const newErrors = validate()
    setErrors(newErrors)

    if (Object.keys(newErrors).length === 0) {
      setLoading(true)
      const eventData = new FormData()

      // Append form data
      for (const key in formData) {
        eventData.append(key, formData[key])
      }

      // Append template
      eventData.append('template_id', selectedTemplate)

      // Append showSalamOpening
      eventData.append('showSalamOpening', showSalamOpening)

      // Append schedules
      eventData.append('schedules', JSON.stringify(schedules))

      // Append itinerary
      eventData.append('itineraries', JSON.stringify(itinerary))

      // Append contacts
      eventData.append('contacts', JSON.stringify(contacts))

      // Append gallery images
      gallery.forEach((image) => {
        if (image.file) {
          eventData.append('gallery_images', image.file)
        }
      })

      console.log('Submitting data:', Object.fromEntries(eventData.entries()))

      try {
        const response = await fetch(`${config.API_BASE_URL}/merchant/${config.merchantId}/events`, {
          method: 'POST',
          body: eventData,
        })
        const data = await response.json()
        setLoading(false)
        if (response.ok) {
          setModal({ show: true, message: 'Event created successfully!', color: 'success' })
        } else {
          setModal({ show: true, message: `Error: ${data.message}`, color: 'danger' })
        }
      } catch (error) {
        setLoading(false)
        setModal({ show: true, message: `Error: ${error.message}`, color: 'danger' })
      }
    }
  }

  return (
    <>
      <CModal visible={modal.show} onClose={() => setModal({ ...modal, show: false })}>
        <CModalHeader onClose={() => setModal({ ...modal, show: false })}>
          {modal.color === 'success' ? 'Success' : 'Error'}
        </CModalHeader>
        <CModalBody>{modal.message}</CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModal({ ...modal, show: false })}>
            Close
          </CButton>
        </CModalFooter>
      </CModal>
      <CForm onSubmit={handleSubmit}>
        <CRow>
          <CCol xs={12}>
            <TemplatePicker selectedTemplate={selectedTemplate} setSelectedTemplate={setSelectedTemplate} />
            {errors.template && <div className="text-danger mb-3">{errors.template}</div>}

          <CCard className="mb-4">
            <CCardHeader>
              <strong>Couple Information</strong>
            </CCardHeader>
            <CCardBody>
              <CRow className="mb-3">
                <CCol md={6}>
                  <CFormLabel htmlFor="groom_name">Groom's Name *</CFormLabel>
                  <CFormInput type="text" id="groom_name" name="groom_name" value={formData.groom_name} onChange={handleChange} invalid={!!errors.groom_name} />
                  {errors.groom_name && <div className="text-danger">{errors.groom_name}</div>}
                </CCol>
                <CCol md={6}>
                  <CFormLabel htmlFor="groom_father_name">Groom's Father's Name *</CFormLabel>
                  <CFormInput type="text" id="groom_father_name" name="groom_father_name" value={formData.groom_father_name} onChange={handleChange} invalid={!!errors.groom_father_name} />
                  {errors.groom_father_name && <div className="text-danger">{errors.groom_father_name}</div>}
                </CCol>
              </CRow>
              <CRow className="mb-3">
                <CCol md={6}>
                  <CFormLabel htmlFor="bride_name">Bride's Name *</CFormLabel>
                  <CFormInput type="text" id="bride_name" name="bride_name" value={formData.bride_name} onChange={handleChange} invalid={!!errors.bride_name} />
                  {errors.bride_name && <div className="text-danger">{errors.bride_name}</div>}
                </CCol>
                <CCol md={6}>
                  <CFormLabel htmlFor="bride_father_name">Bride's Father's Name *</CFormLabel>
                  <CFormInput type="text" id="bride_father_name" name="bride_father_name" value={formData.bride_father_name} onChange={handleChange} invalid={!!errors.bride_father_name} />
                  {errors.bride_father_name && <div className="text-danger">{errors.bride_father_name}</div>}
                </CCol>
              </CRow>
            </CCardBody>
          </CCard>

          <CCard className="mb-4">
            <CCardHeader>
              <strong>Descriptions</strong>
            </CCardHeader>
            <CCardBody>
              <CFormCheck
                className="mb-3"
                id="showSalamOpening"
                label="Show Salam Opening"
                checked={showSalamOpening}
                onChange={() => setShowSalamOpening(!showSalamOpening)}
              />
              <div className="mb-3">
                <CFormLabel htmlFor="opening_message">Opening Description</CFormLabel>
                <CFormTextarea id="opening_message" name="opening_message" rows="3" value={formData.opening_message} onChange={handleChange}></CFormTextarea>
              </div>
              <div className="mb-3">
                <CFormLabel htmlFor="parent_opening">Parent Opening</CFormLabel>
                <CFormTextarea id="parent_opening" name="parent_opening" rows="3" value={formData.parent_opening} onChange={handleChange}></CFormTextarea>
              </div>
              <div className="mb-3">
                <CFormLabel htmlFor="event_description">Event Description</CFormLabel>
                <CFormTextarea id="event_description" name="event_description" rows="3" value={formData.event_description} onChange={handleChange}></CFormTextarea>
              </div>
            </CCardBody>
          </CCard>

          <CCard className="mb-4">
            <CCardHeader>
              <strong>Event Schedules</strong>
            </CCardHeader>
            <CCardBody>
              <EventSchedules schedules={schedules} setSchedules={setSchedules} />
            </CCardBody>
          </CCard>

          <CCard className="mb-4">
            <CCardHeader>
              <strong>Event Itinerary (Optional)</strong>
            </CCardHeader>
            <CCardBody>
              <EventItinerary itinerary={itinerary} setItinerary={setItinerary} />
            </CCardBody>
          </CCard>

          <CCard className="mb-4">
            <CCardHeader>
              <strong>Our Moments (Gallery)</strong>
            </CCardHeader>
            <CCardBody>
              <EventGallery images={gallery} setImages={setGallery} />
            </CCardBody>
          </CCard>

          <CCard className="mb-4">
            <CCardHeader>
              <strong>Gift Information</strong>
            </CCardHeader>
            <CCardBody>
              <CFormCheck
                className="mb-3"
                id="showGiftInfo"
                label="Add Gift Information"
                checked={showGiftInfo}
                onChange={() => setShowGiftInfo(!showGiftInfo)}
              />
              {showGiftInfo && (
                <>
                  <div className="mb-3">
                    <CFormLabel htmlFor="gifts_description">Gift Description</CFormLabel>
                    <CFormTextarea id="gifts_description" name="gifts_description" rows="3" value={formData.gifts_description} onChange={handleChange}></CFormTextarea>
                  </div>
                  <CRow className="mb-3">
                    <CCol md={4}>
                      <CFormLabel htmlFor="account_bank_name">Bank Name</CFormLabel>
                      <CFormInput type="text" id="account_bank_name" name="account_bank_name" value={formData.account_bank_name} onChange={handleChange} />
                    </CCol>
                    <CCol md={4}>
                      <CFormLabel htmlFor="account_bank_number">Bank Account Number</CFormLabel>
                      <CFormInput type="text" id="account_bank_number" name="account_bank_number" value={formData.account_bank_number} onChange={handleChange} />
                    </CCol>
                    <CCol md={4}>
                      <CFormLabel htmlFor="account_beneficiary_name">Beneficiary Name</CFormLabel>
                      <CFormInput type="text" id="account_beneficiary_name" name="account_beneficiary_name" value={formData.account_beneficiary_name} onChange={handleChange} />
                    </CCol>
                  </CRow>
                </>
              )}
            </CCardBody>
          </CCard>

          <CCard className="mb-4">
            <CCardHeader>
              <strong>Contact Information</strong>
            </CCardHeader>
            <CCardBody>
              <ContactForm contacts={contacts} setContacts={setContacts} />
            </CCardBody>
          </CCard>

          <CCard className="mb-4">
            <CCardHeader>
              <strong>Closing Description</strong>
            </CCardHeader>
            <CCardBody>
              <div className="mb-3">
                <CFormLabel htmlFor="closing_message">Closing Description</CFormLabel>
                <CFormTextarea id="closing_message" name="closing_message" rows="3" value={formData.closing_message} onChange={handleChange}></CFormTextarea>
              </div>
            </CCardBody>
          </CCard>

          <CButton type="submit" color="primary" disabled={loading}>
            {loading ? <CSpinner size="sm" /> : 'Create Event'}
          </CButton>
        </CCol>
      </CRow>
    </CForm>
    </>
  )
}

export default CreateEvent
