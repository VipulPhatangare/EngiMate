import { useState, useEffect } from 'react'
import './NotificationSlider.css'
import { API_URL } from '../utils/api'

function NotificationSlider() {
  const [notifications, setNotifications] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch(`${API_URL}/api/notifications/active`)
        const data = await response.json()
        if (data.success && data.notifications.length > 0) {
          setNotifications(data.notifications)
        }
      } catch (error) {
        console.error('Error fetching notifications:', error)
      }
    }
    
    fetchNotifications()
  }, [])

  useEffect(() => {
    if (notifications.length > 1) {
      const interval = setInterval(() => {
        setIsTransitioning(true)
        setTimeout(() => {
          setCurrentIndex((prevIndex) => (prevIndex + 1) % notifications.length)
          setIsTransitioning(false)
        }, 300)
      }, 5000) // Change notification every 5 seconds

      return () => clearInterval(interval)
    }
  }, [notifications.length])

  if (notifications.length === 0) {
    return null
  }

  const currentNotification = notifications[currentIndex]

  return (
    <div className="notification-slider">
      <div className={`notification-content ${currentNotification.type} ${isTransitioning ? 'transitioning' : ''}`}>
        <div className="notification-icon">
          {currentNotification.type === 'info' && '📢'}
          {currentNotification.type === 'warning' && '⚠️'}
          {currentNotification.type === 'success' && '✓'}
          {currentNotification.type === 'announcement' && '📣'}
        </div>
        <div className="notification-message">{currentNotification.message}</div>
      </div>
    </div>
  )
}

export default NotificationSlider
