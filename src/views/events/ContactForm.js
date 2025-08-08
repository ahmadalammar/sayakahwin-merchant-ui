import React from 'react'
import { CButton, CCol, CRow, CFormInput, CFormLabel } from '@coreui/react'
import PhoneInput from 'react-phone-number-input'
import 'react-phone-number-input/style.css'
import CIcon from '@coreui/icons-react'
import { cilX } from '@coreui/icons'

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
        <CRow key={index} className="mb-3 align-items-center">
          <CCol md={5}>
            <CFormLabel>Name *</CFormLabel>
            <CFormInput
              type="text"
              value={contact.name}
              onChange={(e) => handleChange(e.target.value, index, 'name')}
              required
            />
          </CCol>
          <CCol md={5}>
            <CFormLabel>Phone Number *</CFormLabel>
            <PhoneInput
              international
              defaultCountry="MY"
              value={contact.phone_number}
              onChange={(value) => handleChange(value, index, 'phone_number')}
              required
            />
          </CCol>
          <CCol md={2} className="d-flex align-items-end">
            <CButton
              color="danger"
              onClick={() => handleRemoveContact(index)}
              disabled={contacts.length === 1}
              style={{ borderRadius: '50%', width: '32px', height: '32px', padding: '0' }}
            >
              <CIcon icon={cilX} />
            </CButton>
          </CCol>
        </CRow>
      ))}
      <CButton color="primary" onClick={handleAddContact} disabled={contacts.length >= 6}>
        Add Contact
      </CButton>
    </div>
  )
}

export default ContactForm
