import './CollegeCard.css'

function CollegeCard({ college, onCollegeSelect }) {
  const handleClick = () => {
    if (onCollegeSelect && college.college_code) {
      onCollegeSelect({
        college_code: college.college_code,
        college_name: college.name
      })
    }
  }

  return (
    <div className="college-card" onClick={handleClick}>
      <div className="college-card-image">
        <img src={college.image} alt={college.name} />
      </div>
      <div className="college-card-content">
        <h3 className="college-card-title">{college.name}</h3>
        <div className="college-card-location">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill="currentColor"/>
          </svg>
          <span>{college.location}</span>
        </div>
      </div>
    </div>
  )
}

export default CollegeCard
