import React, { createContext, useContext } from 'react'

// When non-null, the app is operating in public self-service mode (a guest
// claiming a coupon to create/update an event). Components that normally
// rely on the logged-in merchant should fall back to this context.
const SelfServiceContext = createContext(null)

export const SelfServiceProvider = ({ value, children }) => (
  <SelfServiceContext.Provider value={value}>{children}</SelfServiceContext.Provider>
)

export const useSelfService = () => useContext(SelfServiceContext)

export default SelfServiceContext
