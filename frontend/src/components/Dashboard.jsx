import { useState } from 'react'
import './Dashboard.css'
import SearchBar from './SearchBar'
import CollegeSlider from './CollegeSlider'
import FeaturesSection from './FeaturesSection'
import Profile from './Profile'
import CollegeDetails from './CollegeDetails'
import TopColleges from './TopColleges'
import CollegePredictor from './CollegePredictor'
import PreferenceList from './PreferenceList'
import NotificationSlider from './NotificationSlider'
import ChatBot from './ChatBot'

function Dashboard({ user, onLogout, onUserUpdate }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [selectedCollege, setSelectedCollege] = useState(null)
  const [showTopColleges, setShowTopColleges] = useState(false)
  const [showCollegePredictor, setShowCollegePredictor] = useState(false)
  const [showPreferenceList, setShowPreferenceList] = useState(false)
  const [topCollegesSearchData, setTopCollegesSearchData] = useState({
    colleges: [],
    selectedUniversity: 'All',
    selectedCities: ['All'],
    currentPage: 1
  })

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const closeSidebar = () => {
    setIsSidebarOpen(false)
  }

  const handleCollegeSelect = (college) => {
    console.log('Dashboard received college:', college)
    console.log('Setting college code:', college.college_code)
    setSelectedCollege(college.college_code)
  }

  const handleBackToHome = () => {
    console.log('Navigating back to home')
    setSelectedCollege(null)
    setShowTopColleges(false)
    setShowCollegePredictor(false)
    setShowPreferenceList(false)
    setShowProfile(false)
  }

  const handleShowTopColleges = () => {
    setShowTopColleges(true)
    setShowCollegePredictor(false)
    setShowPreferenceList(false)
    setSelectedCollege(null)
    setShowProfile(false)
  }

  const handleShowCollegePredictor = () => {
    setShowCollegePredictor(true)
    setShowTopColleges(false)
    setShowPreferenceList(false)
    setSelectedCollege(null)
    setShowProfile(false)
  }

  const handleShowPreferenceList = () => {
    setShowPreferenceList(true)
    setShowTopColleges(false)
    setShowCollegePredictor(false)
    setSelectedCollege(null)
    setShowProfile(false)
  }

  const handleBackFromCollegePredictor = () => {
    setShowCollegePredictor(false)
    setSelectedCollege(null)
  }

  const handleBackFromPreferenceList = () => {
    setShowPreferenceList(false)
    setSelectedCollege(null)
  }

  const handleBackFromTopColleges = () => {
    setShowTopColleges(false)
    setSelectedCollege(null)
    setTopCollegesSearchData({
      colleges: [],
      selectedUniversity: 'All',
      selectedCities: ['All'],
      currentPage: 1
    })
  }

  const handleTopCollegeSelect = (college) => {
    setSelectedCollege(college.college_code)
  }

  return (
    <div className="dashboard">
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="logo">
            <span className="logo-text">Engimate</span>
          </div>
          
          {/* Desktop Navigation */}
          <div className="nav-links desktop-nav">
            <a href="#home" onClick={(e) => { e.preventDefault(); handleBackToHome(); }}>Home</a>
            <a href="#top-colleges" onClick={(e) => { e.preventDefault(); handleShowTopColleges(); }}>Top Colleges</a>
            <a href="#college-predictor" onClick={(e) => { e.preventDefault(); handleShowCollegePredictor(); }}>College Predictor</a>
            <a href="#preference-list" onClick={(e) => { e.preventDefault(); handleShowPreferenceList(); }}>Preference List</a>
            <a href="#profile" onClick={(e) => { e.preventDefault(); setShowProfile(true); }}>Profile</a>
            <span className="user-name">Hi, {user?.name}</span>
            <button onClick={onLogout} className="btn-nav">Logout</button>
          </div>

          {/* Mobile Menu Button */}
          <button className="hamburger" onClick={toggleSidebar}>
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </nav>

      {/* Mobile Sidebar */}
      <div className={`sidebar ${isSidebarOpen ? 'sidebar-open' : ''}`}>
        <button className="close-btn" onClick={closeSidebar}>&times;</button>
        <div className="sidebar-content">
          <a href="#home" onClick={(e) => { e.preventDefault(); handleBackToHome(); closeSidebar(); }}>Home</a>
          <a href="#top-colleges" onClick={(e) => { e.preventDefault(); handleShowTopColleges(); closeSidebar(); }}>Top Colleges</a>
          <a href="#college-predictor" onClick={(e) => { e.preventDefault(); handleShowCollegePredictor(); closeSidebar(); }}>College Predictor</a>
          <a href="#preference-list" onClick={(e) => { e.preventDefault(); handleShowPreferenceList(); closeSidebar(); }}>Preference List</a>
          <a href="#profile" onClick={(e) => { e.preventDefault(); setShowProfile(true); closeSidebar(); }}>Profile</a>
          <span className="user-name-mobile">Hi, {user?.name}</span>
          <button onClick={() => { onLogout(); closeSidebar(); }} className="btn-sidebar">Logout</button>
        </div>
      </div>

      {/* Overlay */}
      {isSidebarOpen && <div className="overlay" onClick={closeSidebar}></div>}

      {/* Main Content - Conditional rendering */}
      {selectedCollege ? (
        <CollegeDetails 
          collegeCode={selectedCollege} 
          onBack={() => {
            if (showTopColleges) {
              setSelectedCollege(null)
            } else {
              handleBackToHome()
            }
          }} 
        />
      ) : showProfile ? (
        <Profile 
          user={user} 
          onBack={() => setShowProfile(false)}
          onUpdate={onUserUpdate}
        />
      ) : showTopColleges ? (
        <TopColleges 
          onBack={handleBackFromTopColleges} 
          onCollegeSelect={handleTopCollegeSelect}
          searchData={topCollegesSearchData}
          onSearchDataUpdate={setTopCollegesSearchData}
        />
      ) : showCollegePredictor ? (
        <CollegePredictor onBack={handleBackFromCollegePredictor} />
      ) : showPreferenceList ? (
        <PreferenceList onBack={handleBackFromPreferenceList} />
      ) : (
        <div className="dashboard-content">
          {/* Notification Slider */}
          <NotificationSlider />
          
          {/* Search Bar */}
          <SearchBar onCollegeSelect={handleCollegeSelect} />

          {/* College Slider */}
          <section className="college-section">
            <h2 className="section-title">Top Engineering Colleges</h2>
            <CollegeSlider onCollegeSelect={handleCollegeSelect} />
          </section>

          {/* Features Section */}
          <FeaturesSection 
            onTopCollegesClick={handleShowTopColleges}
            onCollegePredictorClick={handleShowCollegePredictor}
            onPreferenceListClick={handleShowPreferenceList}
          />
        </div>
      )}

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <p>&copy; 2025 Engimate. All rights reserved.</p>
          <p>Your trusted partner in engineering admissions</p>
        </div>
      </footer>

      {/* ChatBot - Available on all pages */}
      <ChatBot />
    </div>
  )
}

export default Dashboard
