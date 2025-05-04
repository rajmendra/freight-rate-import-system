import React, { useState } from 'react'
import { QuotesTable } from './QuotesTable'
import UploadModal from './UploadModal'

interface DashboardProps {
  setNotification: (n: { type: 'success' | 'error'; message: string }) => void
}

const Dashboard: React.FC<DashboardProps> = ({ setNotification }) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [refreshFlag, setRefreshFlag] = useState(0)

  const handleUploadSuccess = (insertedCount: number) => {
    setRefreshFlag((f) => f + 1)
    setNotification({ type: 'success', message: `${insertedCount} records inserted!` })
    setIsModalOpen(false)
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Hello, John!</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded shadow"
          >
            Import file
          </button>
        </div>

        <h2 className="text-xl font-semibold text-gray-700 mb-4">Quotes</h2>

        <QuotesTable refreshFlag={refreshFlag} />

        {isModalOpen && (
          <UploadModal
            onClose={() => setIsModalOpen(false)}
            setNotification={setNotification}
            onSuccess={handleUploadSuccess}
          />
        )}
      </div>
    </div>
  )
}

export default Dashboard
