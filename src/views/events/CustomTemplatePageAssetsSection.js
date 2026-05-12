import React, { useRef } from 'react'
import { CButton, CBadge, CCard, CCardBody, CCardHeader, CCol, CRow } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLayers, cilImage, cilX } from '@coreui/icons'
import config from 'src/config'

const purple = 'var(--sk-purple, #2D1B4E)'
const pink = 'var(--sk-pink, #E8A0B0)'
const border = '#E5E0E8'

/** @param {null | string | { file: File, preview: string }} image */
const resolveImageSrc = (image) => {
  if (!image) return null
  if (typeof image === 'string') {
    return image.startsWith('http') ? image : `${config.API_BASE_URL}${image}`
  }
  return image.preview
}

export const CustomTemplatePageAssetPicker = ({
  label,
  description,
  image,
  setImage,
  inputId,
}) => {
  const fileInput = useRef(null)

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
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
    e.target.value = ''
  }

  const handleRemove = () => {
    setImage(null)
  }

  const src = resolveImageSrc(image)

  return (
    <div
      className="h-100"
      style={{
        borderRadius: 16,
        border: `2px dashed ${src ? purple : border}`,
        background: src
          ? `linear-gradient(160deg, rgba(45, 27, 78, 0.07) 0%, rgba(232, 160, 176, 0.06) 55%, #fff 100%)`
          : 'linear-gradient(180deg, #fff 0%, #FAF8F7 100%)',
        padding: '18px 16px',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
        boxShadow: src ? `0 8px 24px rgba(45, 27, 78, 0.08)` : '0 2px 8px rgba(45, 27, 78, 0.04)',
      }}
    >
      <div className="d-flex align-items-center gap-2 mb-2">
        <CIcon icon={cilImage} className="text-purple" size="sm" />
        <span style={{ fontWeight: 600, fontSize: '0.9rem', color: purple }}>{label}</span>
      </div>
      {description && (
        <p className="text-muted mb-3" style={{ fontSize: '0.78rem', lineHeight: 1.45 }}>
          {description}
        </p>
      )}

      {src && (
        <div className="position-relative mb-3 d-flex justify-content-center">
          <img
            src={src}
            alt=""
            style={{
              width: '100%',
              maxWidth: 220,
              aspectRatio: '4 / 5',
              objectFit: 'cover',
              borderRadius: 12,
              border: `1px solid ${border}`,
            }}
            crossOrigin="anonymous"
          />
          <CButton
            color="danger"
            size="sm"
            className="position-absolute top-0 end-0 m-1"
            onClick={handleRemove}
            style={{ borderRadius: '50%', width: '28px', height: '28px', padding: '0' }}
          >
            <CIcon icon={cilX} />
          </CButton>
        </div>
      )}

      <input
        type="file"
        accept="image/*"
        id={inputId}
        onChange={handleImageChange}
        style={{ display: 'none' }}
        ref={fileInput}
      />
      <CButton
        color="primary"
        variant="outline"
        className="w-100"
        style={{ borderRadius: 10, borderColor: purple, color: purple, fontWeight: 600 }}
        onClick={() => fileInput.current?.click()}
      >
        {src ? 'Replace image' : 'Upload image'}
      </CButton>
    </div>
  )
}

const CustomTemplatePageAssetsSection = ({
  customHero,
  setCustomHero,
  customParentInvite,
  setCustomParentInvite,
  customCover,
  setCustomCover,
}) => (
  <CCard className="mb-4" style={{ overflow: 'hidden' }}>
    <CCardHeader
      style={{
        background: `linear-gradient(120deg, rgba(45, 27, 78, 0.06) 0%, rgba(232, 160, 176, 0.08) 100%)`,
        borderBottom: `1px solid ${border}`,
      }}
    >
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
        <div className="d-flex align-items-center gap-2">
          <div
            className="d-flex align-items-center justify-content-center rounded-3 flex-shrink-0"
            style={{
              width: 44,
              height: 44,
              background: `linear-gradient(145deg, ${purple}22, ${pink}33)`,
              color: purple,
            }}
          >
            <CIcon icon={cilLayers} size="lg" />
          </div>
          <div>
            <strong style={{ color: purple }}>Custom page images</strong>
            <p className="text-muted mb-0" style={{ fontSize: '0.8125rem' }}>
              Optional visuals for hero, parent invite, and cover when using your own template — hero, parent, cover
            </p>
          </div>
        </div>
        <CBadge color="info">OPTIONAL</CBadge>
      </div>
    </CCardHeader>
    <CCardBody style={{ background: '#FDFCFB' }}>
      <CRow className="g-4">
        <CCol xs={12} md={4}>
          <CustomTemplatePageAssetPicker
            label="Hero page"
            description="Main landing visual for guests opening the invite."
            image={customHero}
            setImage={setCustomHero}
            inputId="custom_asset_hero"
          />
        </CCol>
        <CCol xs={12} md={4}>
          <CustomTemplatePageAssetPicker
            label="Parent invite"
            description="Artwork tailored for parent-facing or formal share screens."
            image={customParentInvite}
            setImage={setCustomParentInvite}
            inputId="custom_asset_parent_invite"
          />
        </CCol>
        <CCol xs={12} md={4}>
          <CustomTemplatePageAssetPicker
            label="Cover"
            description="Cover or closing panel image—optional polish for your layout."
            image={customCover}
            setImage={setCustomCover}
            inputId="custom_asset_cover"
          />
        </CCol>
      </CRow>
    </CCardBody>
  </CCard>
)

export default CustomTemplatePageAssetsSection
