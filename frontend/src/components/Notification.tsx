import React from 'react';

interface Props {
  type: 'success' | 'error';
  message: string;
  onClose: () => void;
}

const Notification: React.FC<Props> = ({ type, message, onClose }) => {
  return (
    <div className={`fixed top-4 right-4 px-4 py-2 rounded text-white ${type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
      <div className="flex justify-between items-center">
        <span>{message}</span>
        <button className="ml-4" onClick={onClose}>✕</button>
      </div>
    </div>
  );
};

export default Notification;
