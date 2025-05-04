import React from 'react'
import Dashboard from '../components/Dashboard'

export interface HomePageProps {
  setNotification: (n: { type: 'success' | 'error'; message: string }) => void
}

const HomePage: React.FC<HomePageProps> = ({ setNotification }) => {
  return (
    <div className="bg-gray-100">
      <Dashboard setNotification={setNotification} />
    </div>
  )
}

export default HomePage
