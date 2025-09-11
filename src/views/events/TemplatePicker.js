import React, { useState, useEffect } from 'react'
import { CCard, CCardBody, CCardHeader, CFormCheck } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilCheckCircle } from '@coreui/icons'
import config from '../../config'
import api from 'src/services/api'

const TemplatePicker = ({ selectedTemplate, setSelectedTemplate }) => {
  const [templates, setTemplates] = useState([])

  useEffect(() => {
    api
      .get(`/merchant/templates`)
      .then((response) => {
        setTemplates(response.data)
      })
      .catch((error) => console.error('Error fetching templates:', error))
  }, [])

  return (
    <CCard className="mb-4">
      <CCardHeader>
        <strong>Select a Template</strong>
      </CCardHeader>
      <CCardBody>
        <div style={{ display: 'flex', overflowX: 'auto', padding: '1rem' }}>
          {templates.map((template) => (
            <div
              key={template.id}
              style={{
                flex: '0 0 250px',
                marginRight: '1rem',
                position: 'relative',
              }}
            >
              <div
                style={{
                  border: selectedTemplate === template.id ? '4px solid #321fdb' : '4px solid transparent',
                  borderRadius: '40px',
                  width: '250px',
                  height: '500px',
                  border: '10px black solid',
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                <iframe
                  src={`${config.CARD_BASE_URL}/preview/${template.id}`}
                  title={template.theme}
                  style={{
                    width: '166.67%',
                    height: '166.67%',
                    border: 'none',
                    transform: 'scale(0.6)',
                    transformOrigin: '0 0',
                  }}
                />
                {selectedTemplate === template.id && (
                  <CIcon
                    icon={cilCheckCircle}
                    size="xxl"
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      color: 'white',
                      backgroundColor: 'rgba(0, 0, 0, 0.5)',
                      borderRadius: '50%',
                      padding: '1rem',
                    }}
                  />
                )}
              </div>
              <CFormCheck
                className="mt-2"
                id={`template-${template.id}`}
                label={template.theme}
                checked={selectedTemplate === template.id}
                onChange={() => setSelectedTemplate(template.id)}
              />
            </div>
          ))}
        </div>
      </CCardBody>
    </CCard>
  )
}

export default TemplatePicker
