// components/Notification.jsx
// Componente responsable únicamente de mostrar notificaciones (SRP)
import { useEffect } from 'react';

const Notification = ({ message, type, onClose }) => {
  useEffect(() => {
    if (message) {
      // Auto-cerrar notificación después de 5 segundos
      const timer = setTimeout(() => {
        onClose();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className={`notification notification-${type}`}>
      <span className="notification-message">{message}</span>
      <button 
        className="notification-close" 
        onClick={onClose}
        aria-label="Cerrar notificación"
      >
        ×
      </button>
    </div>
  );
};

export default Notification;
