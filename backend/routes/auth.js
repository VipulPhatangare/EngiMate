const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const { sendOTP } = require('../utils/emailService')

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Register new user and send OTP
router.post('/register', async (req, res) => {
  try {
    const { name, surname, email, phoneNumber, password } = req.body

    // Check if user already exists
    let user = await User.findOne({ email })
    
    if (user && user.isVerified) {
      return res.status(400).json({ message: 'Email already registered' })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Generate OTP
    const otp = generateOTP()
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes

    if (user) {
      // Update existing unverified user
      user.name = name
      user.surname = surname
      user.phoneNumber = phoneNumber
      user.password = hashedPassword
      user.otp = otp
      user.otpExpires = otpExpires
      await user.save()
    } else {
      // Create new user
      user = new User({
        name,
        surname,
        email,
        phoneNumber,
        password: hashedPassword,
        otp,
        otpExpires,
        isVerified: false
      })
      await user.save()
    }

    // Send OTP via email
    const emailSent = await sendOTP(email, otp, name)

    if (!emailSent) {
      return res.status(500).json({ message: 'Failed to send OTP email' })
    }

    res.status(200).json({ 
      message: 'OTP sent to your email',
      email: email
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error during registration' })
  }
})

// Resend OTP
router.post('/resend-otp', async (req, res) => {
  try {
    const { email } = req.body

    const user = await User.findOne({ email })

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'Email already verified' })
    }

    // Generate new OTP
    const otp = generateOTP()
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes

    user.otp = otp
    user.otpExpires = otpExpires
    await user.save()

    // Send OTP via email
    const emailSent = await sendOTP(email, otp, user.name)

    if (!emailSent) {
      return res.status(500).json({ message: 'Failed to send OTP email' })
    }

    res.status(200).json({ 
      message: 'New OTP sent to your email',
      email: email
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error while resending OTP' })
  }
})

// Verify OTP and complete registration
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body

    const user = await User.findOne({ email })

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'Email already verified' })
    }

    // Check if OTP matches and is not expired
    if (user.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' })
    }

    if (new Date() > user.otpExpires) {
      return res.status(400).json({ message: 'OTP has expired' })
    }

    // Verify user
    user.isVerified = true
    user.otp = null
    user.otpExpires = null
    await user.save()

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.status(200).json({
      message: 'Email verified successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        surname: user.surname,
        email: user.email,
        phoneNumber: user.phoneNumber
      }
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error during verification' })
  }
})

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    // Find user
    const user = await User.findOne({ email })

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    if (!user.isVerified) {
      return res.status(401).json({ message: 'Please verify your email first' })
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        surname: user.surname,
        email: user.email,
        phoneNumber: user.phoneNumber
      }
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error during login' })
  }
})

// Get current user (protected route)
router.get('/me', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.userId).select('-password -otp -otpExpires')

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.status(200).json({ user })
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' })
  }
})

// Forgot password - send OTP
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body

    const user = await User.findOne({ email })

    if (!user) {
      return res.status(404).json({ message: 'No account found with this email' })
    }

    if (!user.isVerified) {
      return res.status(400).json({ message: 'Please verify your email first' })
    }

    // Generate OTP
    const otp = generateOTP()
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes

    user.otp = otp
    user.otpExpires = otpExpires
    await user.save()

    // Send OTP via email
    const emailSent = await sendOTP(email, otp, user.name)

    if (!emailSent) {
      return res.status(500).json({ message: 'Failed to send OTP email' })
    }

    res.status(200).json({ 
      message: 'OTP sent to your email',
      email: email
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
})

// Verify forgot password OTP
router.post('/verify-forgot-otp', async (req, res) => {
  try {
    const { email, otp } = req.body

    const user = await User.findOne({ email })

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Check if OTP matches and is not expired
    if (user.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' })
    }

    if (new Date() > user.otpExpires) {
      return res.status(400).json({ message: 'OTP has expired' })
    }

    res.status(200).json({
      message: 'OTP verified successfully'
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error during verification' })
  }
})

// Reset password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body

    const user = await User.findOne({ email })

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Verify OTP one more time
    if (user.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' })
    }

    if (new Date() > user.otpExpires) {
      return res.status(400).json({ message: 'OTP has expired' })
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update password and clear OTP
    user.password = hashedPassword
    user.otp = null
    user.otpExpires = null
    await user.save()

    res.status(200).json({
      message: 'Password reset successfully'
    })
  } catch (error) {

    res.status(500).json({ message: 'Server error' })
  }
})

// Get user profile (protected route)
router.get('/profile', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.userId).select('-password -otp -otpExpires')

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.status(200).json({ user })
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' })
  }
})

// Update personal information (protected route)
router.put('/profile/personal', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const { name, phoneNumber } = req.body

    const user = await User.findById(decoded.userId)

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Update fields
    if (name) user.name = name
    if (req.body.surname !== undefined) user.surname = req.body.surname
    if (phoneNumber !== undefined) user.phoneNumber = phoneNumber

    await user.save()

    res.status(200).json({ 
      message: 'Personal information updated successfully',
      user: {
        id: user._id,
        name: user.name,
        surname: user.surname,
        email: user.email,
        phoneNumber: user.phoneNumber
      }
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
})

// Update academic information (protected route)
router.put('/profile/academic', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const {
      mhtCetPercentile,
      jeePercentile,
      generalRank,
      allIndiaRank,
      caste,
      gender,
      board,
      twelfthPercentage,
      physicsMarks,
      chemistryMarks,
      mathematicsMarks
    } = req.body

    const user = await User.findById(decoded.userId)

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Update academic fields
    if (mhtCetPercentile !== undefined) user.mhtCetPercentile = mhtCetPercentile
    if (jeePercentile !== undefined) user.jeePercentile = jeePercentile
    if (generalRank !== undefined) user.generalRank = generalRank
    if (allIndiaRank !== undefined) user.allIndiaRank = allIndiaRank
    if (caste !== undefined) user.caste = caste
    if (gender !== undefined) user.gender = gender
    if (board !== undefined) user.board = board
    if (twelfthPercentage !== undefined) user.twelfthPercentage = twelfthPercentage
    if (physicsMarks !== undefined) user.physicsMarks = physicsMarks
    if (chemistryMarks !== undefined) user.chemistryMarks = chemistryMarks
    if (mathematicsMarks !== undefined) user.mathematicsMarks = mathematicsMarks

    await user.save()

    res.status(200).json({ 
      message: 'Academic information updated successfully'
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
})

// Delete academic information (protected route)
router.delete('/profile/academic', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.userId)

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Clear all academic fields
    user.mhtCetPercentile = undefined
    user.jeePercentile = undefined
    user.generalRank = undefined
    user.allIndiaRank = undefined
    user.caste = ''
    user.gender = ''
    user.board = ''
    user.twelfthPercentage = undefined
    user.physicsMarks = undefined
    user.chemistryMarks = undefined
    user.mathematicsMarks = undefined

    await user.save()

    res.status(200).json({ 
      message: 'Academic information deleted successfully'
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
})

// Change password (protected route)
router.put('/change-password', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const { currentPassword, newPassword } = req.body

    const user = await User.findById(decoded.userId)

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password)

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Current password is incorrect' })
    }

    // Hash and update new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    user.password = hashedPassword
    await user.save()

    res.status(200).json({ 
      message: 'Password changed successfully'
    })
  } catch (error) {

    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router
