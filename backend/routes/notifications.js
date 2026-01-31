const express = require('express')
const router = express.Router()
const Notification = require('../models/Notification')

// Get all active notifications (public endpoint)
router.get('/active', async (req, res) => {
  try {
    const notifications = await Notification.find({ isActive: true })
      .sort({ priority: -1, createdAt: -1 })
    
    res.status(200).json({
      success: true,
      count: notifications.length,
      notifications
    })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    res.status(500).json({ message: 'Server error fetching notifications' })
  }
})

// Get all notifications (admin only)
router.get('/all', async (req, res) => {
  try {
    const notifications = await Notification.find()
      .sort({ createdAt: -1 })
    
    res.status(200).json({
      success: true,
      count: notifications.length,
      notifications
    })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    res.status(500).json({ message: 'Server error fetching notifications' })
  }
})

// Create notification (admin only)
router.post('/', async (req, res) => {
  try {
    const { message, type, isActive, priority } = req.body

    if (!message || message.trim() === '') {
      return res.status(400).json({ message: 'Message is required' })
    }

    const notification = new Notification({
      message,
      type: type || 'info',
      isActive: isActive !== undefined ? isActive : true,
      priority: priority || 0
    })

    await notification.save()

    res.status(201).json({
      success: true,
      message: 'Notification created successfully',
      notification
    })
  } catch (error) {
    console.error('Error creating notification:', error)
    res.status(500).json({ message: 'Server error creating notification' })
  }
})

// Update notification (admin only)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { message, type, isActive, priority } = req.body

    const notification = await Notification.findByIdAndUpdate(
      id,
      { 
        message, 
        type, 
        isActive, 
        priority,
        updatedAt: Date.now()
      },
      { new: true, runValidators: true }
    )

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' })
    }

    res.status(200).json({
      success: true,
      message: 'Notification updated successfully',
      notification
    })
  } catch (error) {
    console.error('Error updating notification:', error)
    res.status(500).json({ message: 'Server error updating notification' })
  }
})

// Delete notification (admin only)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const notification = await Notification.findByIdAndDelete(id)

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' })
    }

    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting notification:', error)
    res.status(500).json({ message: 'Server error deleting notification' })
  }
})

// Toggle notification active status (admin only)
router.patch('/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params

    const notification = await Notification.findById(id)

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' })
    }

    notification.isActive = !notification.isActive
    notification.updatedAt = Date.now()
    await notification.save()

    res.status(200).json({
      success: true,
      message: 'Notification status toggled successfully',
      notification
    })
  } catch (error) {
    console.error('Error toggling notification:', error)
    res.status(500).json({ message: 'Server error toggling notification' })
  }
})

module.exports = router
