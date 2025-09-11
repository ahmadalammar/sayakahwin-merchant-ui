import React, { useState, useEffect } from 'react'
import { CCard, CCardBody, CCardHeader } from '@coreui/react'
import config from '../../config'
import api from 'src/services/api'

const Templates = () => {
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
        <strong>Templates</strong>
      </CCardHeader>
      <CCardBody>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
          {templates.map((template) => (
            <div
              key={template.id}
              style={{
                flex: '0 0 250px',
                position: 'relative',
              }}
            >
              <div
                style={{
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
              </div>
              <h5 className="mt-2 text-center">{template.theme}</h5>
            </div>
          ))}
        </div>
      </CCardBody>
    </CCard>
  )
}

export default Templates
