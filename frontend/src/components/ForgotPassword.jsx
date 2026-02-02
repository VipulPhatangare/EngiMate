import { useState } from 'react'
import './Auth.css'
import { API_URL } from '../utils/api'

function ForgotPassword({ onClose, onSwitchToSignIn, onResetSuccess }) {
  const [step, setStep] = useState(1) // 1: email, 2: OTP, 3: new password
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)

  const startResendTimer = () => {
    setResendTimer(60)
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const handleSendOtp = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (response.ok) {
        setStep(2)
        startResendTimer()
        setError('')
      } else {
        setError(data.message || 'Failed to send OTP')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResendOtp = async () => {
    if (resendTimer > 0) return
    
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (response.ok) {
        setError('')
        startResendTimer()
        alert('New OTP has been sent to your email!')
      } else {
        setError(data.message || 'Failed to resend OTP')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch(`${API_URL}/api/auth/verify-forgot-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, otp })
      })

      const data = await response.json()

      if (response.ok) {
        setStep(3)
        setError('')
      } else {
        setError(data.message || 'Invalid or expired OTP')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setError('')

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, otp, newPassword })
      })

      const data = await response.json()

      if (response.ok) {
        alert('Password reset successfully! Please sign in with your new password.')
        onResetSuccess()
        onClose()
      } else {
        setError(data.message || 'Failed to reset password')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>&times;</button>
        <h2 className="modal-title">Forgot Password</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        {step === 1 && (
          <form onSubmit={handleSendOtp} className="auth-form">
            <p className="info-message">Enter your email address and we'll send you a verification code to reset your password.</p>
            
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
              />
            </div>

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Sending...' : 'Send OTP'}
            </button>

            <p className="auth-switch">
              Remember your password? <button type="button" onClick={onSwitchToSignIn}>Sign In</button>
            </p>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="auth-form">
            <p className="otp-message">
              We've sent a verification code to {email}. The code is valid for 5 minutes.
            </p>
            
            <div className="form-group">
              <label htmlFor="otp">Enter OTP</label>
              <input
                type="text"
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                maxLength="6"
                placeholder="6-digit code"
                className="otp-input"
              />
            </div>

            <div className="resend-otp-section">
              {resendTimer > 0 ? (
                <p className="resend-timer">Resend OTP in {resendTimer}s</p>
              ) : (
                <button 
                  type="button" 
                  onClick={handleResendOtp}
                  className="btn-resend"
                  disabled={loading}
                >
                  Resend OTP
                </button>
              )}
            </div>

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>

            <p className="auth-switch">
              <button type="button" onClick={() => setStep(1)}>Change Email</button>
            </p>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleResetPassword} className="auth-form">
            <p className="info-message">Create a new password for your account.</p>
            
            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength="6"
                  placeholder="At least 6 characters"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Confirm your password"
              />
            </div>

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default ForgotPassword
