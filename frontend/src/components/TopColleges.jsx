import { useState, useEffect } from 'react'
import './TopColleges.css'
import api from '../utils/api'

function TopColleges({ onBack, onCollegeSelect, searchData, onSearchDataUpdate }) {
  const [universities, setUniversities] = useState([])
  const [cities, setCities] = useState([])
  const [selectedUniversity, setSelectedUniversity] = useState(searchData?.selectedUniversity || 'All')
  const [selectedCities, setSelectedCities] = useState(searchData?.selectedCities || ['All'])
  const [colleges, setColleges] = useState(searchData?.colleges || [])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(searchData?.currentPage || 1)
  const [initialLoading, setInitialLoading] = useState(true)
  const collegesPerPage = 10

  // Fetch universities and cities on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setInitialLoading(true)
        const [univData, cityData] = await Promise.all([
          api.get('/api/topColleges/fetchUniversity'),
          api.get('/api/topColleges/fetchcity')
        ])
        setUniversities(univData)
        setCities(cityData)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setInitialLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleCityChange = (cityName) => {
    if (cityName === 'All') {
      // If All is clicked, remove all other cities and select only All
      setSelectedCities(['All'])
    } else {
      // If a specific city is clicked
      if (selectedCities.includes(cityName)) {
        // Uncheck the city
        const newCities = selectedCities.filter(c => c !== cityName)
        // If no cities left, select All
        setSelectedCities(newCities.length === 0 ? ['All'] : newCities)
      } else {
        // Check the city and remove All if it was selected
        const newCities = selectedCities.filter(c => c !== 'All')
        setSelectedCities([...newCities, cityName])
      }
    }
  }

  const handleSearch = async () => {
    try {
      setLoading(true)
      const formData = {
        cities: selectedCities,
        university: selectedUniversity
      }
      const data = await api.post('/api/topColleges/topCollegeList', formData)
      setColleges(data)
      setCurrentPage(1)
      // Update parent state
      if (onSearchDataUpdate) {
        onSearchDataUpdate({
          colleges: data,
          selectedUniversity,
          selectedCities,
          currentPage: 1
        })
      }
    } catch (error) {
      console.error('Error searching colleges:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCollegeClick = (collegeCode, collegeName) => {
    if (onCollegeSelect) {
      onCollegeSelect({
        college_code: collegeCode,
        college_name: collegeName
      })
    }
  }

  // Pagination logic
  const indexOfLastCollege = currentPage * collegesPerPage
  const indexOfFirstCollege = indexOfLastCollege - collegesPerPage
  const currentColleges = colleges.slice(indexOfFirstCollege, indexOfLastCollege)
  const totalPages = Math.ceil(colleges.length / collegesPerPage)

  // Generate page numbers with sliding window
  const getPageNumbers = () => {
    const maxVisible = 3 // Show 3 page numbers at a time
    const pages = []
    
    if (totalPages <= maxVisible + 2) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Calculate range around current page
      let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2))
      let endPage = Math.min(totalPages, startPage + maxVisible - 1)
      
      // Adjust if we're near the end
      if (endPage === totalPages) {
        startPage = Math.max(1, totalPages - maxVisible + 1)
      }
      
      // Add start dots
      if (startPage > 1) {
        pages.push(1)
        if (startPage > 2) pages.push('...')
      }
      
      // Add page numbers
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i)
      }
      
      // Add end dots
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) pages.push('...')
        pages.push(totalPages)
      }
    }
    
    return pages
  }

  // Handle page change with parent state update
  const handlePageChange = (page) => {
    setCurrentPage(page)
    if (onSearchDataUpdate) {
      onSearchDataUpdate({
        colleges,
        selectedUniversity,
        selectedCities,
        currentPage: page
      })
    }
  }

  return (
    <div className="top-colleges-wrapper">
      <div className="top-colleges-container">
        <h1 className="page-title">Top Engineering Colleges</h1>

        {initialLoading ? (
          <div className="loading-container">
            <div className="loader"></div>
            <p>Loading filters...</p>
          </div>
        ) : (
          <>
            {/* Filters Section */}
            <div className="filters-section">
              {/* University Dropdown */}
              <div className="filter-group university-filter">
                <label>University:</label>
                <select 
                  value={selectedUniversity} 
                  onChange={(e) => setSelectedUniversity(e.target.value)}
                >
                  <option value="All">All Universities</option>
                  {universities.map((univ, index) => (
                    <option key={index} value={univ.university}>
                      {univ.university}
                    </option>
                  ))}
                </select>
              </div>

              {/* City Checkboxes */}
              <div className="filter-group city-filter">
                <label>Cities:</label>
                <div className="city-checkboxes-grid">
                  <label className="city-checkbox-item">
                    <input
                      type="checkbox"
                      checked={selectedCities.includes('All')}
                      onChange={() => handleCityChange('All')}
                    />
                    <span>All Cities</span>
                  </label>
                  {cities.map((city, index) => (
                    <label key={index} className="city-checkbox-item">
                      <input
                        type="checkbox"
                        checked={selectedCities.includes(city.city)}
                        onChange={() => handleCityChange(city.city)}
                      />
                      <span>{city.city}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Search Button */}
              <button className="search-colleges-button" onClick={handleSearch} disabled={loading}>
                {loading ? 'Searching...' : 'Search Top Colleges'}
              </button>
            </div>

            {/* Results Section */}
            {colleges.length > 0 && (
              <>
                <div className="results-info">
                  <p>Found {colleges.length} colleges</p>
                </div>

            <div className="colleges-table-container">
              <table className="colleges-table">
                <thead>
                  <tr>
                    <th>Sr. No.</th>
                    <th>College Name</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentColleges.map((college, index) => (
                    <tr key={college.college_code}>
                      <td>{indexOfFirstCollege + index + 1}</td>
                      <td 
                        className="college-name-cell"
                        onClick={() => handleCollegeClick(college.college_code, college.college_name)}
                      >
                        {college.college_name}
                      </td>
                      <td>
                        <button 
                          className="view-button"
                          onClick={() => handleCollegeClick(college.college_code, college.college_name)}
                          title="View Details"
                        >
                          👁️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button 
                  className="page-button"
                  onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                
                <div className="page-numbers">
                  {getPageNumbers().map((page, index) => (
                    page === '...' ? (
                      <span key={`dots-${index}`} className="page-dots">...</span>
                    ) : (
                      <button
                        key={page}
                        className={`page-number ${currentPage === page ? 'active' : ''}`}
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </button>
                    )
                  ))}
                </div>

                <button 
                  className="page-button"
                  onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            )}
              </>
            )}

            {!loading && colleges.length === 0 && (
              <div className="no-results">
                <p>No colleges found. Please adjust your filters and search again.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default TopColleges
