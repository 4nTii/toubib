import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import { DoctorProvider } from './context/DoctorContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <DoctorProvider>
        <App />
      </DoctorProvider>
    </AuthProvider>
  </StrictMode>,
)
