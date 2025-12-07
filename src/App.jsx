import React from 'react'
import Header from './components/Header'
import { Outlet } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const App = () => {
  return (
    <div className="min-h-screen bg-cream-50 text-charcoal-900 font-sans selection:bg-gold-400 selection:text-emerald-900">
      <Header />
      <main className="pt-0">
        <Outlet />
      </main>
      <ToastContainer
        position="bottom-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        toastClassName="!bg-cream-50 !text-emerald-900 !font-serif !border !border-gold-400"
        progressClassName="!bg-gold-400"
      />
    </div>
  )
}

export default App
