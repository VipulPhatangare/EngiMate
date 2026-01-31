const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')

// Admin credentials (hardcoded as per requirement)
const ADMIN_EMAIL = 'vipulphatangare3@gmail.com'
const ADMIN_PASSWORD = '123456'

// Admin login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    // Check credentials
    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      return res.status(401).json({ message: 'Invalid admin credentials' })
    }

    // Generate admin token
    const token = jwt.sign(
      { email: ADMIN_EMAIL, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    )

    res.status(200).json({
      message: 'Admin login successful',
      token,
      admin: {
        email: ADMIN_EMAIL,
        role: 'admin'
      }
    })
  } catch (error) {
    console.error('Admin login error:', error)
    res.status(500).json({ message: 'Server error during admin login' })
  }
})

// Get all users (admin only)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({})
      .select('-password -otp -otpExpires')
      .sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      count: users.length,
      users
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    res.status(500).json({ message: 'Server error fetching users' })
  }
})

// Get user statistics
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments()
    const verifiedUsers = await User.countDocuments({ isVerified: true })
    const unverifiedUsers = await User.countDocuments({ isVerified: false })

    // Get users registered in last 7 days
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const recentUsers = await User.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    })

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        verifiedUsers,
        unverifiedUsers,
        recentUsers
      }
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    res.status(500).json({ message: 'Server error fetching statistics' })
  }
})

// Delete user (admin only)
router.delete('/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params

    const user = await User.findByIdAndDelete(userId)

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting user:', error)
    res.status(500).json({ message: 'Server error deleting user' })
  }
})

// Update user verification status
router.put('/users/:userId/verify', async (req, res) => {
  try {
    const { userId } = req.params
    const { isVerified } = req.body

    const user = await User.findByIdAndUpdate(
      userId,
      { isVerified },
      { new: true }
    ).select('-password -otp -otpExpires')

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.status(200).json({
      success: true,
      message: 'User verification status updated',
      user
    })
  } catch (error) {
    console.error('Error updating user:', error)
    res.status(500).json({ message: 'Server error updating user' })
  }
})

module.exports = router
