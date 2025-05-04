import React, { useState } from 'react'
import HomePage from './pages/HomePage'
import Notification from './components/Notification'

const App: React.FC = () => {
  const [notification, setNotification] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)

  return (
    <>
      <HomePage setNotification={setNotification} />
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}
    </>
  )
}

export default App
