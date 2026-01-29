import React from 'react'
import { CButton, CCol, CRow, CFormInput, CFormLabel } from '@coreui/react'
import PhoneInput from 'react-phone-number-input'
import 'react-phone-number-input/style.css'
import CIcon from '@coreui/icons-react'
import { cilTrash, cilPlus } from '@coreui/icons'

const ContactForm = ({ contacts, setContacts }) => {
  const handleAddContact = () => {
    if (contacts.length < 6) {
      setContacts([...contacts, { name: '', phone_number: '' }])
    }
  }

  const handleRemoveContact = (index) => {
    if (contacts.length > 1) {
      const newContacts = [...contacts]
      newContacts.splice(index, 1)
      setContacts(newContacts)
    }
  }

  const handleChange = (value, index, name) => {
    const newContacts = [...contacts]
    newContacts[index][name] = value
    setContacts(newContacts)
  }

  return (
    <div>
      {contacts.map((contact, index) => (
        <div 
          key={index} 
          className="mb-3 p-3 position-relative"
          style={{
            background: 'var(--sk-cream, #FAF8F7)',
            borderRadius: '12px',
            border: '1px solid var(--sk-border, #E5E0E8)',
          }}
        >
          {/* Remove Button */}
          {contacts.length > 1 && (
            <button
              type="button"
              onClick={() => handleRemoveContact(index)}
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
              title="Remove contact"
            >
              <CIcon icon={cilTrash} size="sm" />
            </button>
          )}
          
          <CRow className="g-3">
            <CCol md={6}>
              <CFormLabel className="text-muted" style={{ fontSize: '0.8125rem' }}>Contact Name *</CFormLabel>
              <CFormInput
                type="text"
                value={contact.name}
                placeholder="Enter contact name"
                onChange={(e) => handleChange(e.target.value, index, 'name')}
                required
              />
            </CCol>
            <CCol md={6}>
              <CFormLabel className="text-muted" style={{ fontSize: '0.8125rem' }}>Phone Number *</CFormLabel>
              <PhoneInput
                international
                defaultCountry="MY"
                value={contact.phone_number}
                onChange={(value) => handleChange(value, index, 'phone_number')}
                required
              />
            </CCol>
          </CRow>
        </div>
      ))}
      
      <CButton 
        color="primary" 
        variant="outline"
        onClick={handleAddContact} 
        disabled={contacts.length >= 6}
        className="d-flex align-items-center gap-2"
      >
        <CIcon icon={cilPlus} size="sm" />
        Add Contact
      </CButton>
      
      {contacts.length >= 6 && (
        <small className="text-muted d-block mt-2">Maximum 6 contacts allowed</small>
      )}
    </div>
  )
}

export default ContactForm
