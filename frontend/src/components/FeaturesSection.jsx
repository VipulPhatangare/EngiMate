import './FeaturesSection.css'

function FeaturesSection({ onTopCollegesClick, onCollegePredictorClick, onPreferenceListClick }) {
  const features = [
    {
      id: 1,
      icon: '🏆',
      title: 'Top Colleges',
      description: 'Explore the best engineering colleges in Maharashtra',
      link: '#top-colleges',
      onClick: onTopCollegesClick
    },
    {
      id: 2,
      icon: '🎯',
      title: 'College Predictor',
      description: 'Predict your college based on your MHT CET rank',
      link: '#predictor',
      onClick: onCollegePredictorClick
    },
    {
      id: 3,
      icon: '⭐',
      title: 'Preference List',
      description: 'Create and manage your college preference list',
      link: '#preference',
      onClick: onPreferenceListClick
    }
  ]

  return (
    <section className="features-section">
      <h2 className="features-section-title">Explore Features</h2>
      <div className="features-grid">
        {features.map((feature) => (
          <a 
            href={feature.link} 
            key={feature.id} 
            className="feature-item"
            onClick={(e) => {
              if (feature.onClick) {
                e.preventDefault()
                feature.onClick()
              }
            }}
          >
            <div className="feature-icon-large">{feature.icon}</div>
            <h3 className="feature-title">{feature.title}</h3>
            <p className="feature-description">{feature.description}</p>
            <div className="feature-arrow">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </a>
        ))}
      </div>
    </section>
  )
}

export default FeaturesSection
