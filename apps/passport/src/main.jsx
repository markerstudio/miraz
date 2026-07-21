import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { installOvi } from './lib/ovi.js'
import './styles.css'

installOvi()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
