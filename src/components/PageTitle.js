import { useEffect } from 'react'

const PageTitle = ({ title, description }) => {
  useEffect(() => {
    const baseTitle = 'Sayakahwin Merchant Dashboard'
    document.title = title ? `${title} | ${baseTitle}` : baseTitle

    // Update meta description
    let metaDescription = document.querySelector('meta[name="description"]')
    if (!metaDescription) {
      metaDescription = document.createElement('meta')
      metaDescription.setAttribute('name', 'description')
      document.head.appendChild(metaDescription)
    }
    if (description) {
      metaDescription.setAttribute('content', description)
    }

    return () => {
      document.title = baseTitle
    }
  }, [title, description])

  return null
}

export default PageTitle
