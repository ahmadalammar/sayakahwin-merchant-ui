import React, { useState, useEffect } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CForm,
  CFormInput,
  CFormLabel,
  CFormTextarea,
  CFormCheck,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CSpinner,
  CTooltip,
  CBadge,
  CContainer,
  CAlert,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilInfo, cilHeart, cilCalendar, cilImage, cilEnvelopeClosed, cilCreditCard, cilPhone, cilCheckCircle, cilWarning } from '@coreui/icons'
import api from '../../services/api'
import authService from 'src/services/auth'
import EventSchedules from './EventSchedules'
import EventItinerary from './EventItinerary'
import EventGallery from './EventGallery'
import TemplatePicker from './TemplatePicker'
import ContactForm from './ContactForm'
import QRCodeUpload from './QRCodeUpload'
import TagInput from '../../components/TagInput'
import PageTitle from '../../components/PageTitle'

// SectionCard component moved outside to prevent re-creation on every render
const SectionCard = ({ icon, title, subtitle, badge, children }) => (
  <CCard className="mb-4">
    <CCardHeader>
      <div className="d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center gap-2">
          {icon && <CIcon icon={icon} className="text-purple" size="lg" />}
          <div>
            <strong>{title}</strong>
            {subtitle && <p className="text-muted mb-0" style={{ fontSize: '0.8125rem' }}>{subtitle}</p>}
          </div>
        </div>
        {badge && <CBadge color="info">{badge}</CBadge>}
      </div>
    </CCardHeader>
    <CCardBody>{children}</CCardBody>
  </CCard>
)

const CreateEvent = () => {
  const [subscription, setSubscription] = useState(null)
  const [schedules, setSchedules] = useState([{ title: '', date: '', address: '', address_url: '' }])
  const [itinerary, setItinerary] = useState([])
  const [gallery, setGallery] = useState([])
  const [contacts, setContacts] = useState([{ name: '', phone_number: '' }])
  const [gifts, setGifts] = useState([])
  const [paymentQRCode, setPaymentQRCode] = useState(null)
  const [errors, setErrors] = useState({})
  const [showWishlist, setShowWishlist] = useState(false)
  const [showGiftInfo, setShowGiftInfo] = useState(false)
  const [showSalamOpening, setShowSalamOpening] = useState(true)
  const [useCustomTemplate, setUseCustomTemplate] = useState(false)
  const [customThemeFile, setCustomThemeFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [modal, setModal] = useState({ show: false, message: '', color: '' })
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [formData, setFormData] = useState({
    groom_name: '',
    groom_father_name: '',
    bride_name: '',
    bride_father_name: '',
    email: '',
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

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const user = authService.getCurrentUser()
        const response = await api.get(`/merchant/${user.merchantId}/subscription`)
        setSubscription(response.data)
      } catch (error) {
        console.error('Failed to fetch subscription:', error)
      }
    }
    fetchSubscription()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    // Clear error when user types
    if (errors[name]) {
      setErrors({ ...errors, [name]: null })
    }
  }

  const handleFileChange = (e) => {
    setCustomThemeFile(e.target.files[0])
  }

  const validate = () => {
    const newErrors = {}
    if (!useCustomTemplate && !selectedTemplate) newErrors.template = 'Please select a template'
    if (!formData.groom_name) newErrors.groom_name = 'Groom name is required'
    if (!formData.groom_father_name) newErrors.groom_father_name = "Groom's father name is required"
    if (!formData.bride_name) newErrors.bride_name = 'Bride name is required'
    if (!formData.bride_father_name) newErrors.bride_father_name = "Bride's father name is required"
    if (!formData.email) newErrors.email = 'Email is required'
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
      eventData.append('show_money_gift', showGiftInfo)
      eventData.append('show_wishlist', showWishlist)
      eventData.append('use_custom_template', useCustomTemplate)

      if (useCustomTemplate) {
        if (customThemeFile) {
          eventData.append('custom_theme', customThemeFile)
        }
      } else {
        eventData.append('template_id', selectedTemplate)
      }

      eventData.append('showSalamOpening', showSalamOpening)
      eventData.append('schedules', JSON.stringify(schedules))

      const filteredItinerary = itinerary.filter((item) => item.name.trim() !== '')
      eventData.append('itineraries', JSON.stringify(filteredItinerary))
      eventData.append('contacts', JSON.stringify(contacts))

      gallery.forEach((image) => {
        if (image.file) {
          eventData.append('gallery_images', image.file)
        }
      })

      eventData.append('gifts', JSON.stringify(gifts))

      if (paymentQRCode && paymentQRCode.file) {
        eventData.append('payment_qr_code', paymentQRCode.file)
      }

      try {
        const user = authService.getCurrentUser()
        await api.post(`/merchant/${user.merchantId}/events`, eventData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        setLoading(false)
        setModal({ show: true, message: 'Event created successfully! Your wedding card is now ready.', color: 'success' })
      } catch (error) {
        setLoading(false)
        const message = error.response?.data?.message || error.message
        setModal({ show: true, message: `Error: ${message}`, color: 'danger' })
      }
    } else {
      // Scroll to first error
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <>
      <PageTitle title="Create Event" description="Create a new wedding invitation card" />
      
      {/* Success/Error Modal */}
      <CModal visible={modal.show} onClose={() => setModal({ ...modal, show: false })}>
        <CModalHeader>
          <CModalTitle className="d-flex align-items-center gap-2">
            <CIcon 
              icon={modal.color === 'success' ? cilCheckCircle : cilWarning} 
              className={modal.color === 'success' ? 'text-success' : 'text-danger'}
            />
            {modal.color === 'success' ? 'Success' : 'Error'}
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CAlert color={modal.color} className="mb-0">
            {modal.message}
          </CAlert>
        </CModalBody>
        <CModalFooter>
          <CButton 
            color={modal.color === 'success' ? 'success' : 'secondary'} 
            onClick={() => setModal({ ...modal, show: false })}
          >
            {modal.color === 'success' ? 'Done' : 'Close'}
          </CButton>
        </CModalFooter>
      </CModal>

      <CContainer fluid>
        {/* Page Header */}
        <div className="dashboard-welcome mb-4">
          <h2>Create New Wedding Card</h2>
          <p>Fill in the details below to create a beautiful wedding invitation</p>
        </div>

        {/* Validation Errors Summary */}
        {Object.keys(errors).length > 0 && (
          <CAlert color="danger" className="mb-4">
            <div className="d-flex align-items-center gap-2">
              <CIcon icon={cilWarning} />
              <strong>Please fix the errors below before submitting</strong>
            </div>
          </CAlert>
        )}

        <CForm onSubmit={handleSubmit}>
          {/* Template Selection */}
          {!useCustomTemplate && (
            <>
              <TemplatePicker selectedTemplate={selectedTemplate} setSelectedTemplate={setSelectedTemplate} />
              {errors.template && <CAlert color="danger" className="mb-4">{errors.template}</CAlert>}
            </>
          )}

          {/* Couple Information */}
          <SectionCard icon={cilHeart} title="Couple Information" subtitle="Enter the bride and groom details">
            <CRow className="g-3">
              <CCol md={6}>
                <CFormLabel htmlFor="groom_name">Groom's Name *</CFormLabel>
                <CFormInput 
                  type="text" 
                  id="groom_name" 
                  name="groom_name" 
                  placeholder="Enter groom's full name"
                  value={formData.groom_name} 
                  onChange={handleChange} 
                  invalid={!!errors.groom_name} 
                />
                {errors.groom_name && <div className="text-danger mt-1" style={{ fontSize: '0.8125rem' }}>{errors.groom_name}</div>}
              </CCol>
              <CCol md={6}>
                <CFormLabel htmlFor="groom_father_name">Groom's Father's Name *</CFormLabel>
                <CFormInput 
                  type="text" 
                  id="groom_father_name" 
                  name="groom_father_name" 
                  placeholder="Enter groom's father's name"
                  value={formData.groom_father_name} 
                  onChange={handleChange} 
                  invalid={!!errors.groom_father_name} 
                />
                {errors.groom_father_name && <div className="text-danger mt-1" style={{ fontSize: '0.8125rem' }}>{errors.groom_father_name}</div>}
              </CCol>
              <CCol md={6}>
                <CFormLabel htmlFor="bride_name">Bride's Name *</CFormLabel>
                <CFormInput 
                  type="text" 
                  id="bride_name" 
                  name="bride_name" 
                  placeholder="Enter bride's full name"
                  value={formData.bride_name} 
                  onChange={handleChange} 
                  invalid={!!errors.bride_name} 
                />
                {errors.bride_name && <div className="text-danger mt-1" style={{ fontSize: '0.8125rem' }}>{errors.bride_name}</div>}
              </CCol>
              <CCol md={6}>
                <CFormLabel htmlFor="bride_father_name">Bride's Father's Name *</CFormLabel>
                <CFormInput 
                  type="text" 
                  id="bride_father_name" 
                  name="bride_father_name" 
                  placeholder="Enter bride's father's name"
                  value={formData.bride_father_name} 
                  onChange={handleChange} 
                  invalid={!!errors.bride_father_name} 
                />
                {errors.bride_father_name && <div className="text-danger mt-1" style={{ fontSize: '0.8125rem' }}>{errors.bride_father_name}</div>}
              </CCol>
              <CCol md={6}>
                <CFormLabel htmlFor="email">Email Address *</CFormLabel>
                <CFormInput 
                  type="email" 
                  id="email" 
                  name="email" 
                  placeholder="couple@email.com"
                  value={formData.email} 
                  onChange={handleChange} 
                  invalid={!!errors.email} 
                />
                {errors.email && <div className="text-danger mt-1" style={{ fontSize: '0.8125rem' }}>{errors.email}</div>}
              </CCol>
            </CRow>
          </SectionCard>

          {/* Descriptions */}
          {!useCustomTemplate && (
            <SectionCard icon={cilEnvelopeClosed} title="Card Messages" subtitle="Customize the messages on your wedding card">
              <CFormCheck
                className="mb-4"
                id="showSalamOpening"
                label={
                  <span className="d-flex align-items-center gap-1">
                    Show "Assalamualaikum" Greeting
                    <CTooltip content='Display the Islamic greeting at the start of the card'>
                      <CIcon icon={cilInfo} className="text-muted" size="sm" />
                    </CTooltip>
                  </span>
                }
                checked={showSalamOpening}
                onChange={() => setShowSalamOpening(!showSalamOpening)}
              />
              <CRow className="g-3">
                <CCol xs={12}>
                  <CFormLabel htmlFor="opening_message">Opening Message</CFormLabel>
                  <CFormTextarea 
                    id="opening_message" 
                    name="opening_message" 
                    rows="3" 
                    placeholder="Write a warm opening message for your guests..."
                    value={formData.opening_message} 
                    onChange={handleChange}
                  />
                </CCol>
                <CCol xs={12}>
                  <CFormLabel htmlFor="parent_opening">Parent Message</CFormLabel>
                  <CFormTextarea 
                    id="parent_opening" 
                    name="parent_opening" 
                    rows="3" 
                    placeholder="Message from the parents..."
                    value={formData.parent_opening} 
                    onChange={handleChange}
                  />
                </CCol>
                <CCol xs={12}>
                  <CFormLabel htmlFor="event_description">
                    <span className="d-flex align-items-center gap-1">
                      Event Details
                      <CTooltip content="Additional details about location, parking, dress code, etc.">
                        <CIcon icon={cilInfo} className="text-muted" size="sm" />
                      </CTooltip>
                    </span>
                  </CFormLabel>
                  <CFormTextarea
                    id="event_description"
                    name="event_description"
                    rows="3"
                    placeholder="Parking available at venue, dress code: smart casual..."
                    value={formData.event_description}
                    onChange={handleChange}
                  />
                </CCol>
              </CRow>
            </SectionCard>
          )}

          {/* Event Schedules */}
          <SectionCard icon={cilCalendar} title="Event Schedules" subtitle="Add your wedding ceremony dates and venues">
            <EventSchedules schedules={schedules} setSchedules={setSchedules} errors={errors} />
          </SectionCard>

          {/* Itinerary */}
          {!useCustomTemplate && (
            <SectionCard icon={cilCalendar} title="Event Itinerary" subtitle="Timeline of activities (Optional)">
              <EventItinerary itinerary={itinerary} setItinerary={setItinerary} />
            </SectionCard>
          )}

          {/* Gallery */}
          {!useCustomTemplate && (
            <SectionCard icon={cilImage} title="Our Moments" subtitle="Upload photos of the couple" badge="OPTIONAL">
              <EventGallery images={gallery} setImages={setGallery} />
            </SectionCard>
          )}

          {/* Wishlist */}
          <SectionCard icon={cilHeart} title="Wishes & Gifts" subtitle="Allow guests to send wishes" badge="OPTIONAL">
            <CFormCheck
              className="mb-3"
              id="showWishlist"
              label="Enable Guest Wishlist"
              checked={showWishlist}
              onChange={() => setShowWishlist(!showWishlist)}
            />
            {showWishlist && (
              <div className="mt-3">
                <TagInput tags={gifts} setTags={setGifts} label="Suggested Wishes" placeholder="Add a wish suggestion..." />
              </div>
            )}
          </SectionCard>

          {/* Money Gift */}
          <SectionCard icon={cilCreditCard} title="Money Gift" subtitle="Add bank account for monetary gifts" badge="OPTIONAL">
            <CFormCheck
              className="mb-3"
              id="showGiftInfo"
              label="Enable Money Gift Section"
              checked={showGiftInfo}
              onChange={() => setShowGiftInfo(!showGiftInfo)}
            />
            {showGiftInfo && (
              <div className="mt-3">
                <CRow className="g-3">
                  <CCol xs={12}>
                    <CFormLabel htmlFor="gifts_description">Gift Description</CFormLabel>
                    <CFormTextarea
                      id="gifts_description"
                      name="gifts_description"
                      rows="2"
                      placeholder="Your presence is the greatest gift, but if you wish to bless us..."
                      value={formData.gifts_description}
                      onChange={handleChange}
                    />
                  </CCol>
                  <CCol md={4}>
                    <CFormLabel htmlFor="account_bank_name">Bank Name</CFormLabel>
                    <CFormInput
                      type="text"
                      id="account_bank_name"
                      name="account_bank_name"
                      placeholder="e.g., Maybank"
                      value={formData.account_bank_name}
                      onChange={handleChange}
                    />
                  </CCol>
                  <CCol md={4}>
                    <CFormLabel htmlFor="account_bank_number">Account Number</CFormLabel>
                    <CFormInput
                      type="text"
                      id="account_bank_number"
                      name="account_bank_number"
                      placeholder="1234567890"
                      value={formData.account_bank_number}
                      onChange={handleChange}
                    />
                  </CCol>
                  <CCol md={4}>
                    <CFormLabel htmlFor="account_beneficiary_name">Beneficiary Name</CFormLabel>
                    <CFormInput
                      type="text"
                      id="account_beneficiary_name"
                      name="account_beneficiary_name"
                      placeholder="Account holder name"
                      value={formData.account_beneficiary_name}
                      onChange={handleChange}
                    />
                  </CCol>
                  <CCol xs={12}>
                    <CFormLabel>Payment QR Code (Optional)</CFormLabel>
                    <QRCodeUpload image={paymentQRCode} setImage={setPaymentQRCode} />
                  </CCol>
                </CRow>
              </div>
            )}
          </SectionCard>

          {/* Contact Information */}
          <SectionCard icon={cilPhone} title="Contact Information" subtitle="Add contact persons for your guests">
            <ContactForm contacts={contacts} setContacts={setContacts} errors={errors} />
          </SectionCard>

          {/* Closing Message */}
          <SectionCard icon={cilEnvelopeClosed} title="Closing Message" subtitle="End your invitation with a heartfelt message">
            <CFormTextarea 
              id="closing_message" 
              name="closing_message" 
              rows="3" 
              placeholder="Thank you for being part of our special day..."
              value={formData.closing_message} 
              onChange={handleChange}
            />
          </SectionCard>

          {/* Submit Button */}
          <div className="d-flex justify-content-end gap-3 mb-4">
            <CButton type="button" color="secondary" variant="outline" href="/#/events">
              Cancel
            </CButton>
            <CButton type="submit" color="primary" disabled={loading} className="px-4">
              {loading ? (
                <>
                  <CSpinner size="sm" className="me-2" />
                  Creating...
                </>
              ) : (
                'Create Wedding Card'
              )}
            </CButton>
          </div>
        </CForm>
      </CContainer>
    </>
  )
}

export default CreateEvent
