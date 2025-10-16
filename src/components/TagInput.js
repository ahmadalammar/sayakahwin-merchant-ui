import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { CFormInput, CButton, CBadge } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilX } from '@coreui/icons'

const TagInput = ({ tags, setTags, label, placeholder }) => {
  const [inputValue, setInputValue] = useState('')

  const handleInputChange = (e) => {
    setInputValue(e.target.value)
  }

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter' && inputValue.trim() !== '') {
      e.preventDefault()
      addTag()
    }
  }

  const addTag = () => {
    if (inputValue.trim() && !tags.find((tag) => tag.gift_name === inputValue.trim())) {
      setTags([...tags, { gift_name: inputValue.trim() }])
      setInputValue('')
    }
  }

  const removeTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag.gift_name !== tagToRemove.gift_name))
  }

  return (
    <div>
      <label>{label}</label>
      <div className="d-flex mb-2">
        <CFormInput
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          placeholder={placeholder}
        />
        <CButton type="button" color="primary" onClick={addTag} className="ms-2">
          Add
        </CButton>
      </div>
      <div className="d-flex flex-wrap">
        {tags.map((tag, index) => (
          <CBadge color="secondary" className="me-2 mb-2" key={index}>
            {tag.gift_name}
            <CIcon
              icon={cilX}
              className="ms-1"
              style={{ cursor: 'pointer' }}
              onClick={() => removeTag(tag)}
            />
          </CBadge>
        ))}
      </div>
    </div>
  )
}

TagInput.propTypes = {
  tags: PropTypes.array.isRequired,
  setTags: PropTypes.func.isRequired,
  label: PropTypes.string,
  placeholder: PropTypes.string,
}

TagInput.defaultProps = {
  label: 'Tags',
  placeholder: 'Type and press Enter or click Add',
}

export default TagInput
