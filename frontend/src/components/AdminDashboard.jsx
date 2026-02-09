import { useState, useEffect } from 'react'
import './AdminDashboard.css'
import { API_URL } from '../utils/api'

function AdminDashboard({ admin, onLogout }) {
  const [activeTab, setActiveTab] = useState('overview')
  const [users, setUsers] = useState([])
  const [notifications, setNotifications] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [showNotificationForm, setShowNotificationForm] = useState(false)
  const [editingNotification, setEditingNotification] = useState(null)
  const [notificationForm, setNotificationForm] = useState({
    message: '',
    type: 'info',
    isActive: true,
    priority: 0
  })

  const token = localStorage.getItem('adminToken')

  useEffect(() => {
    if (activeTab === 'overview') {
      fetchStats()
    } else if (activeTab === 'users') {
      fetchUsers()
    } else if (activeTab === 'notifications') {
      fetchNotifications()
    }
  }, [activeTab])

  const fetchStats = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/api/admin/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      if (response.ok) {
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/api/admin/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      if (response.ok) {
        setUsers(data.users)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete user: ${userName}?`)) {
      return
    }

    try {
      const response = await fetch(`${API_URL}/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'User deleted successfully' })
        fetchUsers()
        fetchStats()
        setTimeout(() => setMessage({ type: '', text: '' }), 3000)
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      setMessage({ type: 'error', text: 'Failed to delete user' })
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    }
  }

  const handleToggleVerification = async (userId, currentStatus) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/users/${userId}/verify`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isVerified: !currentStatus })
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'User verification status updated' })
        fetchUsers()
        fetchStats()
        setTimeout(() => setMessage({ type: '', text: '' }), 3000)
      }
    } catch (error) {
      console.error('Error updating user:', error)
      setMessage({ type: 'error', text: 'Failed to update user' })
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    }
  }

  // Notification functions
  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/api/notifications/all`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      if (response.ok) {
        setNotifications(data.notifications)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleNotificationFormChange = (e) => {
    const { name, value, type, checked } = e.target
    setNotificationForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSaveNotification = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = editingNotification
        ? `${API_URL}/api/notifications/${editingNotification._id}`
        : `${API_URL}/api/notifications`
      
      const response = await fetch(url, {
        method: editingNotification ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(notificationForm)
      })

      if (response.ok) {
        setMessage({ 
          type: 'success', 
          text: editingNotification ? 'Notification updated successfully' : 'Notification created successfully' 
        })
        setShowNotificationForm(false)
        setEditingNotification(null)
        setNotificationForm({ message: '', type: 'info', isActive: true, priority: 0 })
        fetchNotifications()
        setTimeout(() => setMessage({ type: '', text: '' }), 3000)
      }
    } catch (error) {
      console.error('Error saving notification:', error)
      setMessage({ type: 'error', text: 'Failed to save notification' })
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    } finally {
      setLoading(false)
    }
  }

  const handleEditNotification = (notification) => {
    setEditingNotification(notification)
    setNotificationForm({
      message: notification.message,
      type: notification.type,
      isActive: notification.isActive,
      priority: notification.priority
    })
    setShowNotificationForm(true)
  }

  const handleDeleteNotification = async (notificationId) => {
    if (!window.confirm('Are you sure you want to delete this notification?')) {
      return
    }

    try {
      const response = await fetch(`${API_URL}/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'Notification deleted successfully' })
        fetchNotifications()
        setTimeout(() => setMessage({ type: '', text: '' }), 3000)
      }
    } catch (error) {
      console.error('Error deleting notification:', error)
      setMessage({ type: 'error', text: 'Failed to delete notification' })
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    }
  }

  const handleToggleNotificationStatus = async (notificationId) => {
    try {
      const response = await fetch(`${API_URL}/api/notifications/${notificationId}/toggle`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'Notification status updated' })
        fetchNotifications()
        setTimeout(() => setMessage({ type: '', text: '' }), 3000)
      }
    } catch (error) {
      console.error('Error toggling notification:', error)
      setMessage({ type: 'error', text: 'Failed to update notification' })
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    }
  }

  const handleCancelNotificationForm = () => {
    setShowNotificationForm(false)
    setEditingNotification(null)
    setNotificationForm({ message: '', type: 'info', isActive: true, priority: 0 })
  }

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    onLogout()
  }

  return (
    <div className="admin-dashboard">
      {/* Admin Navbar */}
      <nav className="admin-navbar">
        <div className="admin-nav-container">
          <div className="admin-logo">
            <span className="admin-logo-text">Engimate Admin</span>
          </div>
          <div className="admin-nav-right">
            <span className="admin-email">{admin.email}</span>
            <button onClick={handleLogout} className="admin-logout-btn">Logout</button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="admin-content">
        <div className="admin-container">
          <h1 className="admin-title">Admin Dashboard</h1>

          {/* Message */}
          {message.text && (
            <div className={`admin-message ${message.type}`}>
              {message.text}
            </div>
          )}

          {/* Tabs */}
          <div className="admin-tabs">
            <button 
              className={`admin-tab ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button 
              className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              Users Management
            </button>
            <button 
              className={`admin-tab ${activeTab === 'notifications' ? 'active' : ''}`}
              onClick={() => setActiveTab('notifications')}
            >
              Notifications
            </button>
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="admin-overview">
              {loading ? (
                <div className="admin-loading">Loading statistics...</div>
              ) : stats ? (
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-icon">👥</div>
                    <div className="stat-content">
                      <h3>{stats.totalUsers}</h3>
                      <p>Total Users</p>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">✓</div>
                    <div className="stat-content">
                      <h3>{stats.verifiedUsers}</h3>
                      <p>Verified Users</p>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">⏳</div>
                    <div className="stat-content">
                      <h3>{stats.unverifiedUsers}</h3>
                      <p>Unverified Users</p>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">📅</div>
                    <div className="stat-content">
                      <h3>{stats.recentUsers}</h3>
                      <p>Last 7 Days</p>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="admin-users">
              {loading ? (
                <div className="admin-loading">Loading users...</div>
              ) : (
                <div className="users-table-container">
                  <table className="users-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Status</th>
                        <th>Created</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(user => (
                        <tr key={user._id}>
                          <td>{user.name} {user.surname}</td>
                          <td>{user.email}</td>
                          <td>{user.phoneNumber || 'N/A'}</td>
                          <td>
                            <span className={`status-badge ${user.isVerified ? 'verified' : 'unverified'}`}>
                              {user.isVerified ? 'Verified' : 'Unverified'}
                            </span>
                          </td>
                          <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                          <td className="actions-cell">
                            <button 
                              onClick={() => handleToggleVerification(user._id, user.isVerified)}
                              className="action-btn toggle-btn"
                            >
                              {user.isVerified ? 'Unverify' : 'Verify'}
                            </button>
                            <button 
                              onClick={() => handleDeleteUser(user._id, user.name)}
                              className="action-btn delete-btn"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {users.length === 0 && (
                    <div className="no-users">No users found</div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="admin-notifications">
              <div className="notifications-header">
                <h3>Manage Notifications</h3>
                <button 
                  onClick={() => setShowNotificationForm(true)}
                  className="add-notification-btn"
                >
                  + Add Notification
                </button>
              </div>

              {/* Notification Form */}
              {showNotificationForm && (
                <div className="notification-form-container">
                  <form onSubmit={handleSaveNotification} className="notification-form">
                    <h4>{editingNotification ? 'Edit Notification' : 'Create New Notification'}</h4>
                    
                    <div className="form-group">
                      <label>Message *</label>
                      <textarea
                        name="message"
                        value={notificationForm.message}
                        onChange={handleNotificationFormChange}
                        placeholder="Enter notification message..."
                        required
                        rows={3}
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Type</label>
                        <select
                          name="type"
                          value={notificationForm.type}
                          onChange={handleNotificationFormChange}
                        >
                          <option value="info">Info</option>
                          <option value="warning">Warning</option>
                          <option value="success">Success</option>
                          <option value="announcement">Announcement</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Priority</label>
                        <input
                          type="number"
                          name="priority"
                          value={notificationForm.priority}
                          onChange={handleNotificationFormChange}
                          min="0"
                          max="10"
                        />
                      </div>

                      <div className="form-group checkbox-group">
                        <label>
                          <input
                            type="checkbox"
                            name="isActive"
                            checked={notificationForm.isActive}
                            onChange={handleNotificationFormChange}
                          />
                          Active
                        </label>
                      </div>
                    </div>

                    <div className="form-actions">
                      <button type="submit" className="save-btn" disabled={loading}>
                        {loading ? 'Saving...' : 'Save Notification'}
                      </button>
                      <button 
                        type="button" 
                        onClick={handleCancelNotificationForm}
                        className="cancel-btn"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Notifications List */}
              {loading ? (
                <div className="admin-loading">Loading notifications...</div>
              ) : (
                <div className="notifications-list">
                  {notifications.map(notification => (
                    <div key={notification._id} className={`notification-item ${notification.type}`}>
                      <div className="notification-item-header">
                        <span className={`notification-badge ${notification.type}`}>
                          {notification.type.toUpperCase()}
                        </span>
                        <span className={`status-badge ${notification.isActive ? 'active' : 'inactive'}`}>
                          {notification.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <span className="priority-badge">Priority: {notification.priority}</span>
                      </div>
                      
                      <div className="notification-message">
                        {notification.message}
                      </div>
                      
                      <div className="notification-meta">
                        <span>Created: {new Date(notification.createdAt).toLocaleString()}</span>
                        <span>Updated: {new Date(notification.updatedAt).toLocaleString()}</span>
                      </div>
                      
                      <div className="notification-actions">
                        <button 
                          onClick={() => handleToggleNotificationStatus(notification._id)}
                          className="action-btn toggle-btn"
                        >
                          {notification.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button 
                          onClick={() => handleEditNotification(notification)}
                          className="action-btn edit-btn"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteNotification(notification._id)}
                          className="action-btn delete-btn"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                  {notifications.length === 0 && (
                    <div className="no-notifications">No notifications found. Create one to get started!</div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
