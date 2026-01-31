import { useState, useEffect } from 'react'
import './CollegeDetails.css'
import api from '../utils/api'

function CollegeDetails({ collegeCode, onBack }) {
  const [college, setCollege] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('info')
  const [seatMatrixData, setSeatMatrixData] = useState(null)
  const [cutoffData, setCutoffData] = useState(null)
  const [tabLoading, setTabLoading] = useState(false)
  const [tabError, setTabError] = useState(null)
  
  // Cutoff filters
  const [selectedYear, setSelectedYear] = useState(2025)
  const [selectedRound, setSelectedRound] = useState(1)
  const [selectedCategory, setSelectedCategory] = useState('open')

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        // Fetch college info and seat matrix together
        const [collegeData, seatData] = await Promise.all([
          api.post('/api/colleges/collegeInfo', { college_code: collegeCode }),
          api.post('/api/colleges/collegeSeatMatrix', { college_code: collegeCode })
        ])
        
        if (collegeData && collegeData.length > 0) {
          setCollege(collegeData[0])
        } else {
          setError('College not found')
        }
        
        setSeatMatrixData(seatData)
      } catch (err) {
        console.error('Error fetching data:', err)
        setError('Failed to load college information')
      } finally {
        setLoading(false)
      }
    }

    if (collegeCode) {
      fetchData()
    }
  }, [collegeCode])

  const fetchCutoffData = async (year, round) => {
    try {
      setTabLoading(true)
      setTabError(null)
      const data = await api.post('/api/colleges/collegeBranchCutoffInfo', {
        college_code: collegeCode,
        year,
        round
      })
      setCutoffData(data)
    } catch (err) {
      console.error('Error fetching cutoff:', err)
      setTabError('Failed to load cutoff data')
    } finally {
      setTabLoading(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'cutoff' && !cutoffData) {
      fetchCutoffData(selectedYear, selectedRound)
    }
  }, [activeTab])

  const handleYearChange = (year) => {
    setSelectedYear(year)
    if (year === 2024 && selectedRound === 4) {
      setSelectedRound(1)
      fetchCutoffData(year, 1)
    } else {
      fetchCutoffData(year, selectedRound)
    }
  }

  const handleRoundChange = (round) => {
    setSelectedRound(round)
    fetchCutoffData(selectedYear, round)
  }

  const getFilteredCutoffData = () => {
    if (!cutoffData) return []
    
    const categoryMap = {
      'open': ['gopen', 'lopen'],
      'obc': ['gobc', 'lobc'],
      'sebc': ['gsebc', 'lsebc'],
      'nt1': ['gnt1', 'lnt1'],
      'nt2': ['gnt2', 'lnt2'],
      'nt3': ['gnt3', 'lnt3'],
      'sc': ['gsc', 'lsc'],
      'st': ['gst', 'lst'],
      'pwd': ['pwd'],
      'defence': ['def'],
      'orphan': ['orphan'],
      'allIndia': ['ai'],
      'tfws': ['tfws'],
      'ews': ['ews']
    }
    
    const columns = categoryMap[selectedCategory] || []
    return { data: cutoffData, columns }
  }

  if (loading) {
    return (
      <div className="college-details-wrapper">
        <div className="loading-spinner">Loading...</div>
      </div>
    )
  }

  if (error || !college) {
    return (
      <div className="college-details-wrapper">
        <div className="error-message">{error || 'College not found'}</div>
      </div>
    )
  }

  return (
    <div className="college-details-wrapper">
      <div className="college-details-content">
        <h1 className="college-title">{college.college_name}</h1>
        
        {college.short_info && (
          <p className="college-description">{college.short_info}</p>
        )}

        {/* Tab Navigation */}
        <div className="tabs-container">
          <button
            className={`tab-button ${activeTab === 'info' ? 'active' : ''}`}
            onClick={() => setActiveTab('info')}
          >
            College Info
          </button>
          <button
            className={`tab-button ${activeTab === 'seatMatrix' ? 'active' : ''}`}
            onClick={() => setActiveTab('seatMatrix')}
          >
            Seat Matrix
          </button>
          <button
            className={`tab-button ${activeTab === 'cutoff' ? 'active' : ''}`}
            onClick={() => setActiveTab('cutoff')}
          >
            Cutoff
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'info' && (
          <div className="info-section">
            <div className="info-row">
              <span className="info-label">Code:</span>
              <span className="info-value">{college.college_code}</span>
            </div>

            {college.district && (
              <div className="info-row">
                <span className="info-label">District:</span>
                <span className="info-value">{college.district}</span>
              </div>
            )}

            {college.region && (
              <div className="info-row">
                <span className="info-label">Region:</span>
                <span className="info-value">{college.region}</span>
              </div>
            )}

            {college.university && (
              <div className="info-row">
                <span className="info-label">University:</span>
                <span className="info-value">{college.university}</span>
              </div>
            )}

            {college.established_year && (
              <div className="info-row">
                <span className="info-label">Established:</span>
                <span className="info-value">{college.established_year}</span>
              </div>
            )}

            {college.status && (
              <div className="info-row">
                <span className="info-label">Status:</span>
                <span className="info-value">{college.status}</span>
              </div>
            )}

            {college.autonomy_status && (
              <div className="info-row">
                <span className="info-label">Autonomy:</span>
                <span className="info-value">{college.autonomy_status}</span>
              </div>
            )}

            {college.minority_status && (
              <div className="info-row">
                <span className="info-label">Minority:</span>
                <span className="info-value">{college.minority_status}</span>
              </div>
            )}

            {college.hostel_facility && (
              <div className="info-row">
                <span className="info-label">Hostel:</span>
                <span className="info-value">{college.hostel_facility}</span>
              </div>
            )}

            {college.annual_fee_range_lakhs && (
              <div className="info-row highlight">
                <span className="info-label">Annual Fee:</span>
                <span className="info-value">{college.annual_fee_range_lakhs}</span>
              </div>
            )}

            {college.average_package && (
              <div className="info-row highlight">
                <span className="info-label">Avg Package:</span>
                <span className="info-value">{college.average_package}</span>
              </div>
            )}

            {college.highest_package && (
              <div className="info-row highlight">
                <span className="info-label">Highest Package:</span>
                <span className="info-value">{college.highest_package}</span>
              </div>
            )}

            {college.college_address && (
              <div className="info-row address">
                <span className="info-label">Address:</span>
                <span className="info-value">{college.college_address}</span>
              </div>
            )}
          </div>
        )}

        {activeTab === 'seatMatrix' && (
          <div className="seat-matrix-section">
            {!seatMatrixData || seatMatrixData.length === 0 ? (
              <p className="no-data">No seat matrix data available</p>
            ) : (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Branch Name</th>
                      <th>Total Seats</th>
                      <th>MH Seats</th>
                      <th>AI Seats</th>
                    </tr>
                  </thead>
                  <tbody>
                    {seatMatrixData.map((row, index) => (
                      <tr key={index}>
                        <td>{row.branch_name}</td>
                        <td>{row.total_seats}</td>
                        <td>{row.maharashtra_seats}</td>
                        <td>{row.ai_seats}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'cutoff' && (
          <div className="cutoff-section">
            <div className="cutoff-filters">
              <div className="filter-group">
                <label>Year:</label>
                <select value={selectedYear} onChange={(e) => handleYearChange(Number(e.target.value))}>
                  <option value={2025}>2025</option>
                  <option value={2024}>2024</option>
                </select>
              </div>
              
              <div className="filter-group">
                <label>Round:</label>
                <select value={selectedRound} onChange={(e) => handleRoundChange(Number(e.target.value))}>
                  <option value={1}>Round 1</option>
                  <option value={2}>Round 2</option>
                  <option value={3}>Round 3</option>
                  {selectedYear === 2025 && <option value={4}>Round 4</option>}
                </select>
              </div>
              
              <div className="filter-group">
                <label>Category:</label>
                <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                  <option value="open">Open</option>
                  <option value="obc">OBC</option>
                  <option value="sebc">SEBC</option>
                  <option value="nt1">NT1</option>
                  <option value="nt2">NT2</option>
                  <option value="nt3">NT3</option>
                  <option value="sc">SC</option>
                  <option value="st">ST</option>
                  <option value="pwd">PWD</option>
                  <option value="defence">Defence</option>
                  <option value="orphan">Orphan</option>
                  <option value="allIndia">All India</option>
                  <option value="tfws">TFWS</option>
                  <option value="ews">EWS</option>
                </select>
              </div>
            </div>

            {tabLoading ? (
              <div className="loading-spinner">Loading cutoff data...</div>
            ) : tabError ? (
              <p className="error-message">{tabError}</p>
            ) : !cutoffData || cutoffData.length === 0 ? (
              <p className="no-data">No cutoff data available</p>
            ) : (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Choice Code</th>
                      <th>Branch Name</th>
                      {getFilteredCutoffData().columns.map((col) => (
                        <th key={col}>{col.toUpperCase()}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {cutoffData.map((row, index) => (
                      <tr key={index}>
                        <td>{row.choice_code}</td>
                        <td>{row.branch_name}</td>
                        {getFilteredCutoffData().columns.map((col) => (
                          <td key={col}>{row[col] || '-'}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default CollegeDetails
