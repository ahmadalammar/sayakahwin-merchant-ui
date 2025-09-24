const config = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001',
  CARD_BASE_URL: import.meta.env.VITE_CARD_BASE_URL || 'http://localhost:5173',
}

console.log('API_BASE_URL:', config.API_BASE_URL)

export default config
