import React, { useRef } from 'react'
import { CButton } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilX } from '@coreui/icons'
import config from 'src/config'

const QRCodeUpload = ({ image, setImage }) => {
  const fileInput = useRef(null)

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        alert(`File ${file.name} is too large. Maximum size is 15MB.`)
        return
      }
      setImage({
        file,
        preview: URL.createObjectURL(file),
      })
    }
  }

  const handleRemoveImage = () => {
    setImage(null)
  }

  return (
    <div>
      {image && (
        <div className="position-relative me-2 mb-2">
          <img
            src={
              typeof image === 'string'
                ? image.startsWith('http')
                  ? image
                  : `${config.API_BASE_URL}${image}`
                : image.preview
            }
            alt="Preview"
            style={{ width: '150px', height: '150px', objectFit: 'cover' }}
            crossOrigin="anonymous"
          />
          <CButton
            color="danger"
            size="sm"
            className="position-absolute top-0 end-0"
            onClick={handleRemoveImage}
            style={{ borderRadius: '50%', width: '24px', height: '24px', padding: '0' }}
          >
            <CIcon icon={cilX} />
          </CButton>
        </div>
      )}
      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        style={{ display: 'none' }}
        id="qr-code-upload"
        ref={fileInput}
      />
      <CButton color="primary" onClick={() => fileInput.current.click()}>
        {image ? 'Change QR Code' : 'Upload QR Code'}
      </CButton>
    </div>
  )
}

export default QRCodeUpload
