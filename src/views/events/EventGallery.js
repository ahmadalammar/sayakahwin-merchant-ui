import React, { useRef } from 'react'
import { CButton, CCol, CRow } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilX } from '@coreui/icons'

const EventGallery = ({ images, setImages }) => {
  const fileInput = useRef(null)

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)
    const newImages = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }))
    setImages([...images, ...newImages])
  }

  const handleRemoveImage = (index) => {
    const newImages = [...images]
    newImages.splice(index, 1)
    setImages(newImages)
  }

  return (
    <div>
      <div className="d-flex flex-wrap">
        {images.map((image, index) => (
          <div key={index} className="position-relative me-2 mb-2">
            <img
              src={image.preview}
              alt="Preview"
              style={{ width: '150px', height: '150px', objectFit: 'cover' }}
            />
            <CButton
              color="danger"
              size="sm"
              className="position-absolute top-0 end-0"
              onClick={() => handleRemoveImage(index)}
              style={{ borderRadius: '50%', width: '24px', height: '24px', padding: '0' }}
            >
              <CIcon icon={cilX} />
            </CButton>
          </div>
        ))}
      </div>
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={handleImageChange}
        style={{ display: 'none' }}
        id="gallery-upload"
        ref={fileInput}
      />
      <CButton color="primary" onClick={() => fileInput.current.click()}>
        Add Images
      </CButton>
    </div>
  )
}

export default EventGallery
