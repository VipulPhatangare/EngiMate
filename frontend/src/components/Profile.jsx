import { useState, useEffect } from 'react'
import './Profile.css'
import api from '../utils/api'

function Profile({ user, onBack, onUpdate }) {
  const [activeTab, setActiveTab] = useState('personal')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  // Personal Info
  const [personalInfo, setPersonalInfo] = useState({
    name: user?.name || '',
    surname: user?.surname || '',
    phoneNumber: user?.phoneNumber || '',
    email: user?.email || ''
  })

  // Academic Info
  const [academicInfo, setAcademicInfo] = useState({
    mhtCetPercentile: user?.mhtCetPercentile || '',
    jeePercentile: user?.jeePercentile || '',
    generalRank: user?.generalRank || '',
    allIndiaRank: user?.allIndiaRank || '',
    caste: user?.caste || '',
    gender: user?.gender || '',
    board: user?.board || '',
    twelfthPercentage: user?.twelfthPercentage || '',
    physicsMarks: user?.physicsMarks || '',
    chemistryMarks: user?.chemistryMarks || '',
    mathematicsMarks: user?.mathematicsMarks || ''
  })

  // Password Change
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  useEffect(() => {
    // Fetch user profile data
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await api.get('/api/auth/profile')
      
      // Check if response and data exist
      if (response && response.data && response.data.user) {
        const userData = response.data.user
        setPersonalInfo({
          name: userData.name || '',
          surname: userData.surname || '',
          phoneNumber: userData.phoneNumber || '',
          email: userData.email || ''
        })
        setAcademicInfo({
          mhtCetPercentile: userData.mhtCetPercentile || '',
          jeePercentile: userData.jeePercentile || '',
          generalRank: userData.generalRank || '',
          allIndiaRank: userData.allIndiaRank || '',
          caste: userData.caste || '',
          gender: userData.gender || '',
          board: userData.board || '',
          twelfthPercentage: userData.twelfthPercentage || '',
          physicsMarks: userData.physicsMarks || '',
          chemistryMarks: userData.chemistryMarks || '',
          mathematicsMarks: userData.mathematicsMarks || ''
        })
      }
    } catch (error) {
      console.error('Error fetching profile:', error.message || error)
    }
  }

  const handlePersonalInfoChange = (e) => {
    setPersonalInfo({ ...personalInfo, [e.target.name]: e.target.value })
  }

  const handleAcademicInfoChange = (e) => {
    setAcademicInfo({ ...academicInfo, [e.target.name]: e.target.value })
  }

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value })
  }

  const handlePersonalInfoSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ type: '', text: '' })

    try {
      const response = await api.put('/api/auth/profile/personal', {
        name: personalInfo.name,
        surname: personalInfo.surname,
        phoneNumber: personalInfo.phoneNumber
      })

      setMessage({ type: 'success', text: 'Personal information updated successfully!' })
      if (onUpdate) onUpdate(response.data.user)
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to update personal information' 
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAcademicInfoSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ type: '', text: '' })

    try {
      await api.put('/api/auth/profile/academic', academicInfo)
      setMessage({ type: 'success', text: 'Academic information updated successfully!' })
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to update academic information' 
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAcademicInfo = async () => {
    if (!window.confirm('Are you sure you want to delete all academic information? This cannot be undone.')) {
      return
    }

    setLoading(true)
    setMessage({ type: '', text: '' })

    try {
      await api.delete('/api/auth/profile/academic')
      setAcademicInfo({
        mhtCetPercentile: '',
        jeePercentile: '',
        generalRank: '',
        allIndiaRank: '',
        caste: '',
        gender: '',
        board: '',
        twelfthPercentage: '',
        physicsMarks: '',
        chemistryMarks: '',
        mathematicsMarks: ''
      })
      setMessage({ type: 'success', text: 'Academic information deleted successfully!' })
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to delete academic information' 
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ type: '', text: '' })

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match!' })
      setLoading(false)
      return
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters long!' })
      setLoading(false)
      return
    }

    try {
      await api.put('/api/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      })

      setMessage({ type: 'success', text: 'Password changed successfully!' })
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to change password' 
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h2 className="profile-title">My Profile</h2>
      </div>

      <div className="profile-container">

        {/* Tabs */}
        <div className="profile-tabs">
          <button 
            className={`profile-tab ${activeTab === 'personal' ? 'active' : ''}`}
            onClick={() => setActiveTab('personal')}
          >
            Personal Info
          </button>
          <button 
            className={`profile-tab ${activeTab === 'academic' ? 'active' : ''}`}
            onClick={() => setActiveTab('academic')}
          >
            Academic Info
          </button>
          <button 
            className={`profile-tab ${activeTab === 'password' ? 'active' : ''}`}
            onClick={() => setActiveTab('password')}
          >
            Change Password
          </button>
        </div>

        {/* Message */}
        {message.text && (
          <div className={`profile-message ${message.type}`}>
            {message.text}
          </div>
        )}

        {/* Personal Info Tab */}
        {activeTab === 'personal' && (
          <form className="profile-form" onSubmit={handlePersonalInfoSubmit}>
            <div className="profile-form-row">
              <div className="profile-form-group">
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  value={personalInfo.name}
                  onChange={handlePersonalInfoChange}
                  required
                />
              </div>

              <div className="profile-form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  name="surname"
                  value={personalInfo.surname}
                  onChange={handlePersonalInfoChange}
                  required
                />
              </div>
            </div>

            <div className="profile-form-group">
              <label>Email</label>
              <input
                type="email"
                value={personalInfo.email}
                disabled
                className="disabled-input"
              />
              <small className="input-hint">Email cannot be changed</small>
            </div>

            <div className="profile-form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                name="phoneNumber"
                value={personalInfo.phoneNumber}
                onChange={handlePersonalInfoChange}
                placeholder="Enter phone number"
              />
            </div>

            <button type="submit" className="profile-btn" disabled={loading}>
              {loading ? 'Updating...' : 'Update Personal Info'}
            </button>
          </form>
        )}

        {/* Academic Info Tab */}
        {activeTab === 'academic' && (
          <form className="profile-form" onSubmit={handleAcademicInfoSubmit}>
            <div className="profile-form-row">
              <div className="profile-form-group">
                <label>MHT CET Percentile</label>
                <input
                  type="number"
                  name="mhtCetPercentile"
                  value={academicInfo.mhtCetPercentile}
                  onChange={handleAcademicInfoChange}
                  step="0.01"
                  min="0"
                  max="100"
                  placeholder="e.g., 95.5"
                />
              </div>

              <div className="profile-form-group">
                <label>JEE Percentile</label>
                <input
                  type="number"
                  name="jeePercentile"
                  value={academicInfo.jeePercentile}
                  onChange={handleAcademicInfoChange}
                  step="0.01"
                  min="0"
                  max="100"
                  placeholder="e.g., 90.5"
                />
              </div>
            </div>

            <div className="profile-form-row">
              <div className="profile-form-group">
                <label>General Rank</label>
                <input
                  type="number"
                  name="generalRank"
                  value={academicInfo.generalRank}
                  onChange={handleAcademicInfoChange}
                  placeholder="Enter rank"
                />
              </div>

              <div className="profile-form-group">
                <label>All India Rank</label>
                <input
                  type="number"
                  name="allIndiaRank"
                  value={academicInfo.allIndiaRank}
                  onChange={handleAcademicInfoChange}
                  placeholder="Enter rank"
                />
              </div>
            </div>

            <div className="profile-form-row">
              <div className="profile-form-group">
                <label>Caste</label>
                <select
                  name="caste"
                  value={academicInfo.caste}
                  onChange={handleAcademicInfoChange}
                >
                  <option value="">Select Category</option>
                  <option value="General">General</option>
                  <option value="OBC">OBC</option>
                  <option value="SC">SC</option>
                  <option value="ST">ST</option>
                  <option value="EWS">EWS</option>
                </select>
              </div>

              <div className="profile-form-group">
                <label>Gender</label>
                <select
                  name="gender"
                  value={academicInfo.gender}
                  onChange={handleAcademicInfoChange}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="profile-form-row">
              <div className="profile-form-group">
                <label>Board</label>
                <select
                  name="board"
                  value={academicInfo.board}
                  onChange={handleAcademicInfoChange}
                >
                  <option value="">Select Board</option>
                  <option value="HSC">HSC (Maharashtra State Board)</option>
                  <option value="CBSE">CBSE</option>
                  <option value="ICSE">ICSE</option>
                  <option value="IB">IB (International Baccalaureate)</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="profile-form-group">
                <label>12th Percentage</label>
                <input
                  type="number"
                  name="twelfthPercentage"
                  value={academicInfo.twelfthPercentage}
                  onChange={handleAcademicInfoChange}
                  step="0.01"
                  min="0"
                  max="100"
                  placeholder="e.g., 85.5"
                />
              </div>
            </div>

            <div className="profile-form-section-title">Subject Marks</div>

            <div className="profile-form-row">
              <div className="profile-form-group">
                <label>Physics</label>
                <input
                  type="number"
                  name="physicsMarks"
                  value={academicInfo.physicsMarks}
                  onChange={handleAcademicInfoChange}
                  min="0"
                  max="100"
                  placeholder="Out of 100"
                />
              </div>

              <div className="profile-form-group">
                <label>Chemistry</label>
                <input
                  type="number"
                  name="chemistryMarks"
                  value={academicInfo.chemistryMarks}
                  onChange={handleAcademicInfoChange}
                  min="0"
                  max="100"
                  placeholder="Out of 100"
                />
              </div>

              <div className="profile-form-group">
                <label>Mathematics</label>
                <input
                  type="number"
                  name="mathematicsMarks"
                  value={academicInfo.mathematicsMarks}
                  onChange={handleAcademicInfoChange}
                  min="0"
                  max="100"
                  placeholder="Out of 100"
                />
              </div>
            </div>

            <div className="profile-form-actions">
              <button type="submit" className="profile-btn" disabled={loading}>
                {loading ? 'Updating...' : 'Update Academic Info'}
              </button>
              <button 
                type="button" 
                className="profile-btn profile-btn-danger" 
                onClick={handleDeleteAcademicInfo}
                disabled={loading}
              >
                Delete Academic Info
              </button>
            </div>
          </form>
        )}

        {/* Password Tab */}
        {activeTab === 'password' && (
          <form className="profile-form" onSubmit={handlePasswordSubmit}>
            <div className="profile-form-group">
              <label>Current Password</label>
              <input
                type="password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                required
                placeholder="Enter current password"
              />
            </div>

            <div className="profile-form-group">
              <label>New Password</label>
              <input
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                required
                placeholder="Enter new password"
                minLength="6"
              />
              <small className="input-hint">Minimum 6 characters</small>
            </div>

            <div className="profile-form-group">
              <label>Confirm New Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                required
                placeholder="Confirm new password"
              />
            </div>

            <button type="submit" className="profile-btn" disabled={loading}>
              {loading ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default Profile
