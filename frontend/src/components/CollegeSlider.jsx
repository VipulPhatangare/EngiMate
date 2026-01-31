import { useEffect, useRef } from 'react'
import CollegeCard from './CollegeCard'
import './CollegeSlider.css'

// Import images
import coepImg from '../assets/images/college/coep.jpg'
import cumminsImg from '../assets/images/college/cummins.jpg'
import ictImg from '../assets/images/college/ict.jpg'
import pccoeImg from '../assets/images/college/pccoe.jpeg'
import pictImg from '../assets/images/college/pict.webp'
import spitImg from '../assets/images/college/spit.jpg'
import vitImg from '../assets/images/college/vit.webp'
import vjtiImg from '../assets/images/college/vjti.jpg'
import walchandImg from '../assets/images/college/walchand sangli.jpg'

// College data
const collegesData = [
  {
    id: 1,
    name: "College of Engineering Pune (COEP)",
    location: "Pune, Maharashtra",
    image: coepImg,
    college_code: "16006"
  },
  {
    id: 2,
    name: "Cummins College of Engineering for Women",
    location: "Pune, Maharashtra",
    image: cumminsImg,
    college_code: "06276"
  },
  {
    id: 3,
    name: "Institute of Chemical Technology (ICT)",
    location: "Mumbai, Maharashtra",
    image: ictImg,
    college_code: "03036"
  },
  {
    id: 4,
    name: "Pimpri Chinchwad College of Engineering (PCCOE)",
    location: "Pune, Maharashtra",
    image: pccoeImg,
    college_code: "06175"
  },
  {
    id: 5,
    name: "Pune Institute of Computer Technology (PICT)",
    location: "Pune, Maharashtra",
    image: pictImg,
    college_code: "06271"
  },
  {
    id: 6,
    name: "Sardar Patel Institute of Technology (SPIT)",
    location: "Mumbai, Maharashtra",
    image: spitImg,
    college_code: "03014"
  },
  {
    id: 7,
    name: "Vishwakarma Institute of Technology (VIT)",
    location: "Pune, Maharashtra",
    image: vitImg,
    college_code: "06273"
  },
  {
    id: 8,
    name: "Veermata Jijabai Technological Institute (VJTI)",
    location: "Mumbai, Maharashtra",
    image: vjtiImg,
    college_code: "03012"
  },
  {
    id: 9,
    name: "Walchand College of Engineering",
    location: "Sangli, Maharashtra",
    image: walchandImg,
    college_code: "06007"
  }
]

function CollegeSlider({ onCollegeSelect }) {
  const sliderRef = useRef(null)

  useEffect(() => {
    const slider = sliderRef.current
    if (!slider) return

    let animationId
    let position = 0

    const animate = () => {
      position -= 0.5 // Speed of animation (pixels per frame)
      
      // Reset position when first set of cards scrolls out of view
      if (Math.abs(position) >= slider.scrollWidth / 2) {
        position = 0
      }
      
      slider.style.transform = `translateX(${position}px)`
      animationId = requestAnimationFrame(animate)
    }

    animationId = requestAnimationFrame(animate)

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
    }
  }, [])

  // Duplicate colleges for seamless loop
  const duplicatedColleges = [...collegesData, ...collegesData]

  return (
    <div className="college-slider-container">
      <div className="college-slider-track" ref={sliderRef}>
        {duplicatedColleges.map((college, index) => (
          <CollegeCard 
            key={`${college.id}-${index}`} 
            college={college}
            onCollegeSelect={onCollegeSelect}
          />
        ))}
      </div>
    </div>
  )
}

export default CollegeSlider
