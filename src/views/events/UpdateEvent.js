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
import { cilInfo, cilHeart, cilCalendar, cilImage, cilEnvelopeClosed, cilCreditCard, cilPhone, cilCheckCircle, cilWarning, cilGlobeAlt, cilTag, cilUser, cilMediaPlay } from '@coreui/icons'
import { useParams } from 'react-router-dom'
import config from '../../config'
import api from '../../services/api'
import EventSchedules from './EventSchedules'
import EventItinerary from './EventItinerary'
import EventGallery from './EventGallery'
import TemplatePicker from './TemplatePicker'
import ContactForm from './ContactForm'
import QRCodeUpload from './QRCodeUpload'
import SongUpload from './SongUpload'
import GiftList from './GiftList'
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

const UpdateEvent = () => {
  const { merchantId, eventId } = useParams()
  const [subscription, setSubscription] = useState(null)
  const [schedules, setSchedules] = useState([{ title: '', date: '', address: '', address_url: '' }])
  const [itinerary, setItinerary] = useState([{ name: '', time: '' }])
  const [gallery, setGallery] = useState([])
  const [contacts, setContacts] = useState([{ name: '', phone_number: '' }])
  const [gifts, setGifts] = useState([])
  const [paymentQRCode, setPaymentQRCode] = useState(null)
  const [song, setSong] = useState(null)
  const [errors, setErrors] = useState({})
  const [showWishlist, setShowWishlist] = useState(false)
  const [showGiftInfo, setShowGiftInfo] = useState(false)
  const [showSalamOpening, setShowSalamOpening] = useState(true)
  const [hideNotSure, setHideNotSure] = useState(false)
  const [allowCheckin, setAllowCheckin] = useState(false)
  const [useCustomTemplate, setUseCustomTemplate] = useState(false)
  const [customThemeFile, setCustomThemeFile] = useState(null)
  const [customThemePreview, setCustomThemePreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [modal, setModal] = useState({ show: false, message: '', color: '' })
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [formData, setFormData] = useState({
    groom_name: '',
    groom_short_name: '',
    groom_father_name: '',
    bride_name: '',
    bride_short_name: '',
    bride_father_name: '',
    email: '',
    hashtag: '',
    opening_message: '',
    parent_opening: '',
    event_description: '',
    gifts_description: '',
    location_iframe_url: '',
    account_bank_name: '',
    account_bank_number: '',
    account_beneficiary_name: '',
    closing_message: '',
    wishes_description: '',
    rsvp_closed_date: '',
    rsvp_mode: '',
    lang: 'en',
  })

  useEffect(() => {
    const fetchEventData = async () => {
      setInitialLoading(true)
      try {
        const [eventResponse, subResponse] = await Promise.all([
          api.get(`/${merchantId}/${eventId}`),
          api.get(`/merchant/${merchantId}/subscription`)
        ])
        const data = eventResponse.data
        setSubscription(subResponse.data)
        setFormData({
          groom_name: data.groom_name || '',
          groom_short_name: data.groom_short_name || '',
          groom_father_name: data.groom_father_name || '',
          bride_name: data.bride_name || '',
          bride_short_name: data.bride_short_name || '',
          bride_father_name: data.bride_father_name || '',
          email: data.email || '',
          hashtag: data.hashtag || '',
          opening_message: data.opening_text || '',
          parent_opening: data.parent_opening || '',
          event_description: data.events_description || '',
          gifts_description: data.gifts_description || '',
          location_iframe_url: data.location_iframe_url || '',
          account_bank_name: data.gifts_bank_name || '',
          account_bank_number: data.gifts_account_number || '',
          account_beneficiary_name: data.gifts_account_name || '',
          closing_message: data.closing_description || '',
          wishes_description: data.wishes_description || '',
          rsvp_closed_date: data.rsvp_closed_date ? data.rsvp_closed_date.slice(0, 16) : '',
          rsvp_mode: data.rsvp_mode || '',
          lang: data.lang || 'en',
        })
        setSchedules(
          (data.events || []).map((event) => {
            const schedule = { ...event }
            if (!event.date) {
              schedule.date = ''
            } else {
              schedule.date = event.date.slice(0, 16)
            }
            if (!event.end_time) {
              schedule.end_time = ''
            } else {
              schedule.end_time = event.end_time.slice(0, 16)
            }
            return schedule
          }),
        )
        setItinerary(data.itineraries || [{ name: '', time: '' }])
        setGallery(data.gallery_images || [])
        setContacts(data.contacts || [{ name: '', phone_number: '' }])
        setGifts(data.gifts || [])
        setSelectedTemplate(data.templateId)
        setShowWishlist(data.show_wishlist || false)
        setShowGiftInfo(data.show_money_gift || false)
        setShowSalamOpening(data.showSalamOpening !== false)
        setHideNotSure(data.hide_not_sure || false)
        setAllowCheckin(data.allow_checkin || false)
        setUseCustomTemplate(data.theme_style === 'custom')
        if (data.theme_style === 'custom' && data.custom_url) {
          setCustomThemePreview(data.custom_url)
        }
        if (data.payment_qr_code_url) {
          setPaymentQRCode(data.payment_qr_code_url)
        }
        if (data.music_url) {
          setSong(data.music_url)
        }
      } catch (error) {
        const message = error.response?.data?.message || error.message
        setModal({ show: true, message: `Error loading event: ${message}`, color: 'danger' })
      }
      setInitialLoading(false)
    }

    fetchEventData()
  }, [merchantId, eventId])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    if (errors[name]) {
      setErrors({ ...errors, [name]: null })
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setCustomThemeFile(file)
      setCustomThemePreview(URL.createObjectURL(file))
    }
  }

  const validate = () => {
    const newErrors = {}
    if (!useCustomTemplate && !selectedTemplate) newErrors.template = 'Please select a template'
    if (!formData.groom_name) newErrors.groom_name = 'Groom name is required'
    if (!formData.bride_name) newErrors.bride_name = 'Bride name is required'
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

      eventData.append('groom_name', formData.groom_name)
      eventData.append('groom_short_name', formData.groom_short_name)
      eventData.append('groom_father_name', formData.groom_father_name)
      eventData.append('bride_name', formData.bride_name)
      eventData.append('bride_short_name', formData.bride_short_name)
      eventData.append('bride_father_name', formData.bride_father_name)
      eventData.append('email', formData.email)
      eventData.append('hashtag', formData.hashtag)
      eventData.append('opening_message', formData.opening_message)
      eventData.append('parent_opening', formData.parent_opening)
      eventData.append('event_description', formData.event_description)
      eventData.append('gifts_description', formData.gifts_description)
      eventData.append('location_iframe_url', formData.location_iframe_url)
      eventData.append('account_bank_name', formData.account_bank_name)
      eventData.append('account_bank_number', formData.account_bank_number)
      eventData.append('account_beneficiary_name', formData.account_beneficiary_name)
      eventData.append('closing_message', formData.closing_message)
      eventData.append('wishes_description', formData.wishes_description)
      eventData.append('rsvp_closed_date', formData.rsvp_closed_date)
      eventData.append('rsvp_mode', formData.rsvp_mode)
      eventData.append('lang', formData.lang || 'en')
      eventData.append('show_money_gift', showGiftInfo)
      eventData.append('show_wishlist', showWishlist)
      eventData.append('hide_not_sure', hideNotSure)
      eventData.append('allow_checkin', allowCheckin)
      eventData.append('use_custom_template', useCustomTemplate)

      if (useCustomTemplate) {
        if (customThemeFile) {
          eventData.append('custom_theme', customThemeFile)
        } else if (customThemePreview) {
          eventData.append('existing_custom_theme', customThemePreview)
        }
      } else {
        eventData.append('template_id', selectedTemplate)
      }

      eventData.append('showSalamOpening', showSalamOpening)
      eventData.append('schedules', JSON.stringify(schedules))

      const filteredItinerary = itinerary.filter((item) => item.name.trim() !== '')
      eventData.append('itineraries', JSON.stringify(filteredItinerary))
      eventData.append('contacts', JSON.stringify(contacts))

      const existingImages = []
      gallery.forEach((image) => {
        if (typeof image === 'string') {
          existingImages.push(image)
        } else if (image.file) {
          eventData.append('gallery_images', image.file)
        }
      })
      eventData.append('existing_gallery_images', JSON.stringify(existingImages))
      
      // Filter out gifts with empty gift_name and ensure proper format
      const filteredGifts = gifts
        .filter((gift) => {
          if (typeof gift === 'string') {
            return gift.trim() !== ''
          }
          return gift?.gift_name?.trim() !== ''
        })
        .map((gift) => {
          if (typeof gift === 'string') {
            return { gift_name: gift.trim(), gift_link: '', address: '' }
          }
          return {
            gift_name: gift.gift_name?.trim() || '',
            gift_link: gift.gift_link?.trim() || '',
            address: gift.address?.trim() || '',
          }
        })
      eventData.append('gifts', JSON.stringify(filteredGifts))

      if (paymentQRCode && paymentQRCode.file) {
        eventData.append('payment_qr_code', paymentQRCode.file)
      } else if (typeof paymentQRCode === 'string') {
        eventData.append('existing_payment_qr_code_url', paymentQRCode)
      }

      if (song && song.file) {
        eventData.append('song', song.file)
      } else if (typeof song === 'string') {
        eventData.append('existing_music_url', song)
      }

      try {
        await api.put(`/merchant/${merchantId}/events/${eventId}`, eventData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        setLoading(false)
        setModal({ show: true, message: 'Event updated successfully! Your changes have been saved.', color: 'success' })
      } catch (error) {
        setLoading(false)
        const message = error.response?.data?.message || error.message
        setModal({ show: true, message: `Error: ${message}`, color: 'danger' })
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  if (initialLoading) {
    return (
      <>
        <PageTitle title="Update Event" description="Edit your wedding invitation card" />
        <div className="loading-container">
          <CSpinner />
          <p>Loading event data...</p>
        </div>
      </>
    )
  }

  return (
    <>
      <PageTitle title="Update Event" description="Edit your wedding invitation card" />
      
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
          <h2>Update Wedding Card</h2>
          <p>Edit the details of your wedding invitation</p>
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

          {/* Custom Theme Preview */}
          {useCustomTemplate && customThemePreview && (
            <SectionCard icon={cilImage} title="Custom Theme" subtitle="Your uploaded custom design">
              <div className="text-center">
                <img 
                  src={customThemePreview} 
                  alt="Theme Preview" 
                  style={{ maxWidth: '300px', height: 'auto', borderRadius: '8px' }} 
                  crossOrigin="anonymous" 
                />
              </div>
              <div className="mt-3">
                <CFormLabel htmlFor="custom_theme">Upload New Image/Video</CFormLabel>
                <CFormInput type="file" id="custom_theme" name="custom_theme" onChange={handleFileChange} />
              </div>
            </SectionCard>
          )}

          {/* Language Selection */}
          <SectionCard icon={cilGlobeAlt} title="Language" subtitle="Select the language for your wedding invitation">
            <div className="language-selector">
              <div className="d-flex gap-3 flex-wrap">
                {[
                  { code: 'en', name: 'English', flag: '🇬🇧' },
                  { code: 'ms', name: 'Bahasa Malaysia', flag: '🇲🇾' },
                  { code: 'id', name: 'Bahasa Indonesia', flag: '🇮🇩' },
                ].map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => setFormData({ ...formData, lang: lang.code })}
                    className={`language-option ${formData.lang === lang.code ? 'active' : ''}`}
                    style={{
                      flex: '1',
                      minWidth: '150px',
                      padding: '16px 24px',
                      borderRadius: '12px',
                      border: formData.lang === lang.code 
                        ? '2px solid var(--sk-purple, #2D1B4E)' 
                        : '2px solid #E5E0E8',
                      background: formData.lang === lang.code 
                        ? 'linear-gradient(135deg, rgba(45, 27, 78, 0.1) 0%, rgba(45, 27, 78, 0.05) 100%)' 
                        : '#fff',
                      color: formData.lang === lang.code ? 'var(--sk-purple, #2D1B4E)' : '#6c757d',
                      fontWeight: formData.lang === lang.code ? '600' : '500',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: formData.lang === lang.code 
                        ? '0 4px 12px rgba(45, 27, 78, 0.15)' 
                        : 'none',
                    }}
                    onMouseEnter={(e) => {
                      if (formData.lang !== lang.code) {
                        e.currentTarget.style.borderColor = 'var(--sk-purple, #2D1B4E)'
                        e.currentTarget.style.background = 'rgba(45, 27, 78, 0.05)'
                        e.currentTarget.style.transform = 'translateY(-2px)'
                        e.currentTarget.style.boxShadow = '0 4px 8px rgba(45, 27, 78, 0.1)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (formData.lang !== lang.code) {
                        e.currentTarget.style.borderColor = '#E5E0E8'
                        e.currentTarget.style.background = '#fff'
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.boxShadow = 'none'
                      }
                    }}
                  >
                    <span style={{ fontSize: '2rem' }}>{lang.flag}</span>
                    <span style={{ fontSize: '0.875rem' }}>{lang.name}</span>
                    <span style={{ fontSize: '0.75rem', opacity: 0.7, textTransform: 'uppercase' }}>{lang.code}</span>
                  </button>
                ))}
              </div>
            </div>
          </SectionCard>

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
                <CFormLabel htmlFor="groom_father_name">
                  <span className="d-flex align-items-center gap-1">
                    Groom's Parent Name (Or Groom/Bride Father name)
                    <CTooltip content="This field can be Groom Parents name or Bride/Groom Father name if its one side wedding invite">
                      <CIcon icon={cilInfo} className="text-muted" size="sm" />
                    </CTooltip>
                  </span>
                </CFormLabel>
                <CFormInput 
                  type="text" 
                  id="groom_father_name" 
                  name="groom_father_name" 
                  placeholder="Enter groom's parent name or father's name"
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
                <CFormLabel htmlFor="bride_father_name">
                  <span className="d-flex align-items-center gap-1">
                    Bride's Parent Name (Or Groom/Bride Mother name)
                    <CTooltip content="This field can be Bride Parents name or Bride/Groom Mother name if its one side wedding invite">
                      <CIcon icon={cilInfo} className="text-muted" size="sm" />
                    </CTooltip>
                  </span>
                </CFormLabel>
                <CFormInput 
                  type="text" 
                  id="bride_father_name" 
                  name="bride_father_name" 
                  placeholder="Enter bride's parent name or father's name"
                  value={formData.bride_father_name} 
                  onChange={handleChange} 
                  invalid={!!errors.bride_father_name} 
                />
                {errors.bride_father_name && <div className="text-danger mt-1" style={{ fontSize: '0.8125rem' }}>{errors.bride_father_name}</div>}
              </CCol>
            </CRow>
            
            {/* Divider with elegant styling */}
            <div style={{ 
              margin: '24px 0', 
              display: 'flex', 
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, transparent, #E5E0E8, transparent)' }}></div>
              <span style={{ 
                fontSize: '0.75rem', 
                color: '#6c757d', 
                fontWeight: '500',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>Additional Details</span>
              <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to left, transparent, #E5E0E8, transparent)' }}></div>
            </div>

            <CRow className="g-3">
              <CCol md={6}>
                <CFormLabel htmlFor="groom_short_name" style={{ 
                  fontSize: '0.875rem', 
                  fontWeight: '500',
                  color: '#495057',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <CIcon icon={cilUser} size="sm" className="text-muted" />
                  Groom's Short Name
                </CFormLabel>
                <CFormInput 
                  type="text" 
                  id="groom_short_name" 
                  name="groom_short_name" 
                  placeholder="e.g., Ahmad"
                  value={formData.groom_short_name} 
                  onChange={handleChange}
                  style={{
                    borderRadius: '10px',
                    border: '1px solid #E5E0E8',
                    padding: '12px 16px',
                    fontSize: '0.9375rem',
                    transition: 'all 0.2s ease',
                    background: '#FAF8F7',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--sk-purple, #2D1B4E)'
                    e.target.style.boxShadow = '0 0 0 3px rgba(45, 27, 78, 0.1)'
                    e.target.style.background = '#fff'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#E5E0E8'
                    e.target.style.boxShadow = 'none'
                    e.target.style.background = '#FAF8F7'
                  }}
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel htmlFor="bride_short_name" style={{ 
                  fontSize: '0.875rem', 
                  fontWeight: '500',
                  color: '#495057',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <CIcon icon={cilUser} size="sm" className="text-muted" />
                  Bride's Short Name
                </CFormLabel>
                <CFormInput 
                  type="text" 
                  id="bride_short_name" 
                  name="bride_short_name" 
                  placeholder="e.g., Syaheera"
                  value={formData.bride_short_name} 
                  onChange={handleChange}
                  style={{
                    borderRadius: '10px',
                    border: '1px solid #E5E0E8',
                    padding: '12px 16px',
                    fontSize: '0.9375rem',
                    transition: 'all 0.2s ease',
                    background: '#FAF8F7',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--sk-purple, #2D1B4E)'
                    e.target.style.boxShadow = '0 0 0 3px rgba(45, 27, 78, 0.1)'
                    e.target.style.background = '#fff'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#E5E0E8'
                    e.target.style.boxShadow = 'none'
                    e.target.style.background = '#FAF8F7'
                  }}
                />
              </CCol>
              <CCol md={12}>
                <CFormLabel htmlFor="hashtag" style={{ 
                  fontSize: '0.875rem', 
                  fontWeight: '500',
                  color: '#495057',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <CIcon icon={cilTag} size="sm" className="text-muted" />
                  Wedding Hashtag
                </CFormLabel>
                <div style={{ position: 'relative' }}>
                  <CFormInput 
                    type="text" 
                    id="hashtag" 
                    name="hashtag" 
                    placeholder="#AhmadSyaheera2026"
                    value={formData.hashtag} 
                    onChange={handleChange}
                    style={{
                      borderRadius: '10px',
                      border: '1px solid #E5E0E8',
                      padding: '12px 16px 12px 40px',
                      fontSize: '0.9375rem',
                      transition: 'all 0.2s ease',
                      background: '#FAF8F7',
                      fontFamily: 'inherit',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--sk-purple, #2D1B4E)'
                      e.target.style.boxShadow = '0 0 0 3px rgba(45, 27, 78, 0.1)'
                      e.target.style.background = '#fff'
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#E5E0E8'
                      e.target.style.boxShadow = 'none'
                      e.target.style.background = '#FAF8F7'
                    }}
                  />
                  <span style={{
                    position: 'absolute',
                    left: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#6c757d',
                    fontSize: '1rem',
                    fontWeight: '600',
                  }}>#</span>
                </div>
                <div style={{ 
                  fontSize: '0.75rem', 
                  color: '#6c757d', 
                  marginTop: '6px',
                  fontStyle: 'italic'
                }}>
                  Create a unique hashtag for your special day
                </div>
              </CCol>
            </CRow>

            <CRow className="g-3 mt-3">
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

          {/* Song Upload */}
          {!useCustomTemplate && (
            <SectionCard icon={cilMediaPlay} title="Event Song" subtitle="Upload a song for your event" badge="OPTIONAL">
              <SongUpload song={song} setSong={setSong} />
            </SectionCard>
          )}

          {/* Wishlist */}
          <SectionCard icon={cilHeart} title="Wishes & Gifts" subtitle="Add gift suggestions for your guests" badge="OPTIONAL">
            <CFormCheck
              className="mb-3"
              id="showWishlist"
              label="Enable Guest Wishlist"
              checked={showWishlist}
              onChange={() => setShowWishlist(!showWishlist)}
            />
            {showWishlist && (
              <div className="mt-3">
                <GiftList gifts={gifts} setGifts={setGifts} />
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

          {/* RSVP Setting */}
          <SectionCard icon={cilCheckCircle} title="RSVP Setting" subtitle="Configure RSVP settings and wishes description" badge="OPTIONAL">
            <CFormCheck
              className="mb-4"
              id="hideNotSure"
              label={
                <span className="d-flex align-items-center gap-1">
                  Hide "Not Sure" Option
                  <CTooltip content="When enabled, guests can only choose to attend or not attend. The 'Not Sure' option will be hidden.">
                    <CIcon icon={cilInfo} className="text-muted" size="sm" />
                  </CTooltip>
                </span>
              }
              checked={hideNotSure}
              onChange={() => setHideNotSure(!hideNotSure)}
            />
            
            <CFormCheck
              className="mb-4"
              id="allowCheckin"
              label={
                <span className="d-flex align-items-center gap-2">
                  <span>Enable Check-in & QR Code</span>
                  <CBadge color="warning" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>ADD-ON</CBadge>
                  <CTooltip content="Enable QR code check-in functionality for event attendance tracking">
                    <CIcon icon={cilInfo} className="text-muted" size="sm" />
                  </CTooltip>
                </span>
              }
              checked={allowCheckin}
              onChange={() => setAllowCheckin(!allowCheckin)}
            />
            
            {/* RSVP Mode Selection */}
            <div className="mb-4">
              <CFormLabel style={{ fontSize: '0.875rem', fontWeight: '500', color: '#495057', marginBottom: '12px' }}>
                <span className="d-flex align-items-center gap-1">
                  RSVP Mode
                  <span className="text-muted" style={{ fontSize: '0.75rem', fontWeight: '400' }}>(Optional)</span>
                  <CTooltip content="Relaxed: More flexible RSVP process. Strict: Requires complete information and confirmation.">
                    <CIcon icon={cilInfo} className="text-muted" size="sm" />
                  </CTooltip>
                </span>
              </CFormLabel>
              <div className="d-flex gap-3 flex-wrap">
                {[
                  { 
                    value: 'relaxed', 
                    label: 'Relaxed', 
                    description: 'Flexible & Easy',
                    icon: '😊',
                    color: '#28a745'
                  },
                  { 
                    value: 'strict', 
                    label: 'Strict', 
                    description: 'Detailed & Formal',
                    icon: '📋',
                    color: '#dc3545'
                  },
                ].map((mode) => (
                  <button
                    key={mode.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, rsvp_mode: mode.value })}
                    className={`rsvp-mode-option ${formData.rsvp_mode === mode.value ? 'active' : ''}`}
                    style={{
                      flex: '1',
                      minWidth: '180px',
                      padding: '20px 24px',
                      borderRadius: '12px',
                      border: formData.rsvp_mode === mode.value 
                        ? `2px solid ${mode.color}` 
                        : '2px solid #E5E0E8',
                      background: formData.rsvp_mode === mode.value 
                        ? `linear-gradient(135deg, ${mode.color}15 0%, ${mode.color}08 100%)` 
                        : '#fff',
                      color: formData.rsvp_mode === mode.value ? mode.color : '#6c757d',
                      fontWeight: formData.rsvp_mode === mode.value ? '600' : '500',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: formData.rsvp_mode === mode.value 
                        ? `0 4px 12px ${mode.color}25` 
                        : 'none',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                    onMouseEnter={(e) => {
                      if (formData.rsvp_mode !== mode.value) {
                        e.currentTarget.style.borderColor = mode.color
                        e.currentTarget.style.background = `${mode.color}08`
                        e.currentTarget.style.transform = 'translateY(-2px)'
                        e.currentTarget.style.boxShadow = `0 4px 8px ${mode.color}15`
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (formData.rsvp_mode !== mode.value) {
                        e.currentTarget.style.borderColor = '#E5E0E8'
                        e.currentTarget.style.background = '#fff'
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.boxShadow = 'none'
                      }
                    }}
                  >
                    <span style={{ fontSize: '2.5rem', lineHeight: '1' }}>{mode.icon}</span>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                      <span style={{ fontSize: '1rem', fontWeight: 'inherit' }}>{mode.label}</span>
                      <span style={{ 
                        fontSize: '0.75rem', 
                        opacity: 0.7, 
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        {mode.description}
                      </span>
                    </div>
                    {formData.rsvp_mode === mode.value && (
                      <div style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        background: mode.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: `0 2px 4px ${mode.color}40`
                      }}>
                        <span style={{ color: '#fff', fontSize: '0.75rem' }}>✓</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
            
            <CRow className="g-3">
              <CCol xs={12}>
                <CFormLabel htmlFor="wishes_description">Wishes Description</CFormLabel>
                <CFormTextarea
                  id="wishes_description"
                  name="wishes_description"
                  rows="3"
                  placeholder="Share your wishes or special message for guests who RSVP..."
                  value={formData.wishes_description}
                  onChange={handleChange}
                  style={{
                    borderRadius: '8px',
                    border: '1px solid var(--sk-border, #E5E0E8)',
                    padding: '12px 16px',
                    fontSize: '0.9375rem',
                    transition: 'all 0.2s ease',
                    background: '#FAF8F7',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--sk-purple, #2D1B4E)'
                    e.target.style.boxShadow = '0 0 0 3px rgba(45, 27, 78, 0.1)'
                    e.target.style.background = '#fff'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'var(--sk-border, #E5E0E8)'
                    e.target.style.boxShadow = 'none'
                    e.target.style.background = '#FAF8F7'
                  }}
                />
              </CCol>
              <CCol xs={12} md={6}>
                <CFormLabel htmlFor="rsvp_closed_date" style={{ fontSize: '0.875rem', fontWeight: '500', color: '#495057' }}>
                  <span className="d-flex align-items-center gap-1">
                    <CIcon icon={cilCalendar} size="sm" className="text-muted" />
                    RSVP Closed Date
                    <span className="text-muted" style={{ fontSize: '0.75rem', fontWeight: '400' }}>(Optional)</span>
                  </span>
                </CFormLabel>
                <CFormInput
                  type="datetime-local"
                  id="rsvp_closed_date"
                  name="rsvp_closed_date"
                  value={formData.rsvp_closed_date}
                  onChange={handleChange}
                  style={{
                    borderRadius: '8px',
                    border: '1px solid var(--sk-border, #E5E0E8)',
                    padding: '12px 16px',
                    fontSize: '0.9375rem',
                    transition: 'all 0.2s ease',
                    background: '#FAF8F7',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--sk-purple, #2D1B4E)'
                    e.target.style.boxShadow = '0 0 0 3px rgba(45, 27, 78, 0.1)'
                    e.target.style.background = '#fff'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'var(--sk-border, #E5E0E8)'
                    e.target.style.boxShadow = 'none'
                    e.target.style.background = '#FAF8F7'
                  }}
                />
                <div style={{ 
                  fontSize: '0.75rem', 
                  color: '#6c757d', 
                  marginTop: '6px',
                  fontStyle: 'italic'
                }}>
                  Set the deadline for RSVP responses
                </div>
              </CCol>
            </CRow>
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
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </CButton>
          </div>
        </CForm>
      </CContainer>
    </>
  )
}

export default UpdateEvent
