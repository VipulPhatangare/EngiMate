import { useState, useEffect } from 'react'
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
  // Load saved state from localStorage
  const loadSavedState = () => {
    try {
      const savedState = localStorage.getItem('dashboardState');
      if (savedState) {
        return JSON.parse(savedState);
      }
    } catch (error) {
      console.error('Error loading saved state:', error);
    }
    return null;
  };

  const savedState = loadSavedState();

  const [showProfile, setShowProfile] = useState(savedState?.showProfile || false)
  const [selectedCollege, setSelectedCollege] = useState(savedState?.selectedCollege || null)
  const [showTopColleges, setShowTopColleges] = useState(savedState?.showTopColleges || false)
  const [showCollegePredictor, setShowCollegePredictor] = useState(savedState?.showCollegePredictor || false)
  const [showPreferenceList, setShowPreferenceList] = useState(savedState?.showPreferenceList || false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [topCollegesSearchData, setTopCollegesSearchData] = useState(savedState?.topCollegesSearchData || {
    colleges: [],
    selectedUniversity: 'All',
    selectedCities: ['All'],
    currentPage: 1
  })

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const closeSidebar = () => {
    setSidebarOpen(false)
  }

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [sidebarOpen])

  // Save dashboard state to localStorage whenever it changes
  useEffect(() => {
    const stateToSave = {
      showProfile,
      selectedCollege,
      showTopColleges,
      showCollegePredictor,
      showPreferenceList,
      topCollegesSearchData
    };
    localStorage.setItem('dashboardState', JSON.stringify(stateToSave));
  }, [showProfile, selectedCollege, showTopColleges, showCollegePredictor, showPreferenceList, topCollegesSearchData]);

  const handleCollegeSelect = (college) => {
    console.log('Dashboard received college:', college)
    console.log('Setting college code:', college.college_code)
    // Clear localStorage when leaving CollegePredictor or PreferenceList
    if (showCollegePredictor) {
      localStorage.removeItem('collegePredictorData')
    }
    if (showPreferenceList) {
      localStorage.removeItem('preferenceListData')
      localStorage.removeItem('newlyAddedCodes')
    }
    setSelectedCollege(college.college_code)
  }

  const handleBackToHome = () => {
    console.log('Navigating back to home')
    // Clear localStorage when leaving CollegePredictor or PreferenceList
    if (showCollegePredictor) {
      localStorage.removeItem('collegePredictorData')
    }
    if (showPreferenceList) {
      localStorage.removeItem('preferenceListData')
      localStorage.removeItem('newlyAddedCodes')
    }
    setSelectedCollege(null)
    setShowTopColleges(false)
    setShowCollegePredictor(false)
    setShowPreferenceList(false)
    setShowProfile(false)
  }

  const handleShowTopColleges = () => {
    // Clear localStorage when leaving CollegePredictor or PreferenceList
    if (showCollegePredictor) {
      localStorage.removeItem('collegePredictorData')
    }
    if (showPreferenceList) {
      localStorage.removeItem('preferenceListData')
      localStorage.removeItem('newlyAddedCodes')
    }
    setShowTopColleges(true)
    setShowCollegePredictor(false)
    setShowPreferenceList(false)
    setSelectedCollege(null)
    setShowProfile(false)
  }

  const handleShowCollegePredictor = () => {
    // Clear PreferenceList localStorage when leaving
    if (showPreferenceList) {
      localStorage.removeItem('preferenceListData')
      localStorage.removeItem('newlyAddedCodes')
    }
    setShowCollegePredictor(true)
    setShowTopColleges(false)
    setShowPreferenceList(false)
    setSelectedCollege(null)
    setShowProfile(false)
  }

  const handleShowPreferenceList = () => {
    // Clear CollegePredictor localStorage when leaving
    if (showCollegePredictor) {
      localStorage.removeItem('collegePredictorData')
    }
    setShowPreferenceList(true)
    setShowTopColleges(false)
    setShowCollegePredictor(false)
    setSelectedCollege(null)
    setShowProfile(false)
  }

  const handleShowProfile = () => {
    // Clear localStorage when leaving CollegePredictor or PreferenceList
    if (showCollegePredictor) {
      localStorage.removeItem('collegePredictorData')
    }
    if (showPreferenceList) {
      localStorage.removeItem('preferenceListData')
      localStorage.removeItem('newlyAddedCodes')
    }
    setShowProfile(true)
    setShowTopColleges(false)
    setShowCollegePredictor(false)
    setShowPreferenceList(false)
    setSelectedCollege(null)
  }

  const handleBackFromCollegePredictor = () => {
    localStorage.removeItem('collegePredictorData')
    setShowCollegePredictor(false)
    setSelectedCollege(null)
  }

  const handleBackFromPreferenceList = () => {
    localStorage.removeItem('preferenceListData')
    localStorage.removeItem('newlyAddedCodes')
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
          
          {/* Hamburger Menu for Mobile */}
          <button className="hamburger" onClick={toggleSidebar} aria-label="Toggle menu">
            <span></span>
            <span></span>
            <span></span>
          </button>
          
          {/* Desktop Navigation */}
          <div className="nav-links desktop-nav">
            <a href="#home" onClick={(e) => { e.preventDefault(); handleBackToHome(); }}>Home</a>
            <a href="#top-colleges" onClick={(e) => { e.preventDefault(); handleShowTopColleges(); }}>Top Colleges</a>
            <a href="#college-predictor" onClick={(e) => { e.preventDefault(); handleShowCollegePredictor(); }}>College Predictor</a>
            <a href="#preference-list" onClick={(e) => { e.preventDefault(); handleShowPreferenceList(); }}>Preference List</a>
            <a href="#profile" onClick={(e) => { e.preventDefault(); handleShowProfile(); }}>Profile</a>
            <span className="user-name">Hi, {user?.name}</span>
            <button onClick={onLogout} className="btn-nav">Logout</button>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar */}
      {sidebarOpen && <div className="overlay" onClick={closeSidebar}></div>}
      <div 
        className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}
      >
        <button className="close-btn" onClick={closeSidebar} aria-label="Close menu">
          &times;
        </button>
        <div className="sidebar-content">
          <a href="#home" onClick={(e) => { e.preventDefault(); handleBackToHome(); closeSidebar(); }}>Home</a>
          <a href="#top-colleges" onClick={(e) => { e.preventDefault(); handleShowTopColleges(); closeSidebar(); }}>Top Colleges</a>
          <a href="#college-predictor" onClick={(e) => { e.preventDefault(); handleShowCollegePredictor(); closeSidebar(); }}>College Predictor</a>
          <a href="#preference-list" onClick={(e) => { e.preventDefault(); handleShowPreferenceList(); closeSidebar(); }}>Preference List</a>
          <a href="#profile" onClick={(e) => { e.preventDefault(); handleShowProfile(); closeSidebar(); }}>Profile</a>
          <div className="user-name-mobile">Hi, {user?.name}</div>
          <button onClick={() => { onLogout(); closeSidebar(); }} className="btn-sidebar btn-sidebar-primary">Logout</button>
        </div>
      </div>

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

      {/* ChatBot - Only on main dashboard home page */}
      {!selectedCollege && !showProfile && !showTopColleges && !showCollegePredictor && !showPreferenceList && (
        <ChatBot />
      )}
    </div>
  )
}

export default Dashboard
