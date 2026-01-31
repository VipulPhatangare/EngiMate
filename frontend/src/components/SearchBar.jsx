import { useState, useEffect, useRef } from 'react'
import './SearchBar.css'
import api from '../utils/api'

function SearchBar({ onCollegeSelect }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [colleges, setColleges] = useState([])
  const [filteredColleges, setFilteredColleges] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const dropdownRef = useRef(null)
  const inputRef = useRef(null)

  // Fetch all colleges on Dashboard mount (after successful sign-in)
  useEffect(() => {
    const fetchColleges = async () => {
      // Check if data is already cached in sessionStorage
      const cachedData = sessionStorage.getItem('collegeData')
      if (cachedData) {
        try {
          const parsedData = JSON.parse(cachedData)
          setColleges(parsedData)
          console.log('✅ Loaded', parsedData.length, 'colleges from cache')
          return
        } catch (error) {
          console.error('Error parsing cached data:', error)
        }
      }

      // Fetch from API if not cached
      try {
        console.log('🔄 Fetching college data from API...')
        const data = await api.get('/api/colleges/collegeNames')
        setColleges(data)
        // Cache the data in sessionStorage
        sessionStorage.setItem('collegeData', JSON.stringify(data))
        console.log('✅ Fetched and cached', data.length, 'colleges')
      } catch (error) {
        console.error('Error fetching colleges:', error)
      }
    }

    fetchColleges()
  }, [])

  // Filter colleges based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredColleges([])
      setShowDropdown(false)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = colleges.filter((college) => {
      const nameMatch = college.college_name?.toLowerCase().includes(query)
      const codeMatch = college.college_code?.toLowerCase().includes(query)
      return nameMatch || codeMatch
    }).slice(0, 10) // Limit to 10 results

    setFilteredColleges(filtered)
    setShowDropdown(filtered.length > 0)
    setSelectedIndex(-1)
  }, [searchQuery, colleges])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (filteredColleges.length > 0) {
      handleSelectCollege(filteredColleges[0])
    }
  }

  const handleSelectCollege = (college) => {
    console.log('College selected:', college)
    setSearchQuery(college.college_name)
    setShowDropdown(false)
    if (onCollegeSelect) {
      console.log('Calling onCollegeSelect with:', college)
      onCollegeSelect(college)
    } else {
      console.log('onCollegeSelect is not defined')
    }
  }

  const handleKeyDown = (e) => {
    if (!showDropdown) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex((prev) => 
          prev < filteredColleges.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1))
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < filteredColleges.length) {
          handleSelectCollege(filteredColleges[selectedIndex])
        } else if (filteredColleges.length > 0) {
          handleSelectCollege(filteredColleges[0])
        }
        break
      case 'Escape':
        setShowDropdown(false)
        break
    }
  }

  return (
    <div className="search-bar-container" ref={dropdownRef}>
      <form onSubmit={handleSearch} className="search-bar-form">
        <div className="search-bar-wrapper">
          <svg className="search-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <input
            ref={inputRef}
            type="text"
            className="search-input"
            placeholder="Search colleges by name or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            autoComplete="off"
          />
          <button type="submit" className="search-button">
            <span className="search-button-text">Search</span>
            <svg className="search-button-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        
        {showDropdown && filteredColleges.length > 0 && (
          <div className="search-dropdown">
            {filteredColleges.map((college, index) => (
              <div
                key={`${college.college_code}-${index}`}
                className={`dropdown-item ${index === selectedIndex ? 'selected' : ''}`}
                onClick={() => handleSelectCollege(college)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div className="college-name">{college.college_name}</div>
              </div>
            ))}
          </div>
        )}
      </form>
    </div>
  )
}

export default SearchBar
