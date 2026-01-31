import { useState, useEffect } from 'react';
import axios from 'axios';
import './CollegePredictor.css';
import CollegePredictorCard from './CollegePredictorCard';

const CollegePredictor = ({ onBack }) => {
    // Load saved data from localStorage
    const loadSavedData = () => {
        try {
            const savedData = localStorage.getItem('collegePredictorData');
            if (savedData) {
                return JSON.parse(savedData);
            }
        } catch (error) {
            console.error('Error loading saved data:', error);
        }
        return null;
    };

    const savedData = loadSavedData();

    const [examType, setExamType] = useState(savedData?.examType || ''); // 'mhtcet' or 'jee'
    const [formData, setFormData] = useState(savedData?.formData || {
        percentile: '',
        gender: 'Male',
        caste: 'OPEN',
        tfws: false,
        specialReservation: 'No',
        round: '1',
        branchCategory: ['All'],
        city: ['All']
    });

    const [cities, setCities] = useState([]);
    const [colleges, setColleges] = useState(savedData?.colleges || []);
    const [loading, setLoading] = useState(false);
    const [loadingCities, setLoadingCities] = useState(true);
    const [error, setError] = useState('');

    const branchOptions = [
        { label: 'All', value: 'All' },
        { label: 'Civil', value: 'CIVIL' },
        { label: 'Computer Science', value: 'COMP' },
        { label: 'Information Technology', value: 'IT' },
        { label: 'CSE (Artificial Intelligence)', value: 'COMPAI' },
        { label: 'Artificial Intelligence', value: 'AI' },
        { label: 'Electrical', value: 'ELECTRICAL' },
        { label: 'ENTC', value: 'ENTC' },
        { label: 'Mechanical', value: 'MECH' },
        { label: 'Other', value: 'OTHER' }
    ];

    useEffect(() => {
        fetchCities();
    }, []);

    // Save data to localStorage whenever it changes
    useEffect(() => {
        const dataToSave = {
            examType,
            formData,
            colleges
        };
        localStorage.setItem('collegePredictorData', JSON.stringify(dataToSave));
    }, [examType, formData, colleges]);

    const fetchCities = async () => {
        try {
            setLoadingCities(true);
            const response = await axios.get('http://localhost:5000/api/collegePredictor/fetchcity');
            setCities(response.data);
        } catch (err) {
            setError('Failed to load cities. Please refresh the page.');
        } finally {
            setLoadingCities(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleBranchChange = (value) => {
        if (value === 'All') {
            setFormData(prev => ({
                ...prev,
                branchCategory: ['All']
            }));
        } else {
            setFormData(prev => {
                const currentBranches = prev.branchCategory.filter(b => b !== 'All');
                if (currentBranches.includes(value)) {
                    const newBranches = currentBranches.filter(b => b !== value);
                    return {
                        ...prev,
                        branchCategory: newBranches.length === 0 ? ['All'] : newBranches
                    };
                } else {
                    return {
                        ...prev,
                        branchCategory: [...currentBranches, value]
                    };
                }
            });
        }
    };

    const handleCityChange = (cityName) => {
        if (cityName === 'All') {
            setFormData(prev => ({
                ...prev,
                city: ['All']
            }));
        } else {
            setFormData(prev => {
                const currentCities = prev.city.filter(c => c !== 'All');
                if (currentCities.includes(cityName)) {
                    const newCities = currentCities.filter(c => c !== cityName);
                    return {
                        ...prev,
                        city: newCities.length === 0 ? ['All'] : newCities
                    };
                } else {
                    return {
                        ...prev,
                        city: [...currentCities, cityName]
                    };
                }
            });
        }
    };

    const validateForm = () => {
        if (!formData.percentile || formData.percentile < 0 || formData.percentile > 100) {
            setError('Please enter a valid percentile between 0 and 100');
            return false;
        }
        if (!formData.gender) {
            setError('Please select gender');
            return false;
        }
        if (examType === 'mhtcet') {
            if (!formData.caste) {
                setError('Please select category');
                return false;
            }
        }
        if (!formData.round) {
            setError('Please select round');
            return false;
        }
        setError('');
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setError('');
        setColleges([]);

        try {
            let response;
            
            if (examType === 'mhtcet') {
                const payload = {
                    percentile: parseFloat(formData.percentile),
                    caste: formData.caste,
                    gender: formData.gender,
                    tfws: formData.tfws,
                    specialReservation: formData.specialReservation,
                    round: parseInt(formData.round),
                    city: formData.city,
                    branchCategory: formData.branchCategory
                };

                response = await axios.post(
                    'http://localhost:5000/api/collegePredictor/collegePredictorList',
                    payload
                );
            } else if (examType === 'jee') {
                const payload = {
                    percentile: parseFloat(formData.percentile),
                    gender: formData.gender,
                    round: parseInt(formData.round),
                    city: formData.city,
                    branchCategory: formData.branchCategory === 'All' ? 'All' : formData.branchCategory
                };

                response = await axios.post(
                    'http://localhost:5000/api/collegePredictor/collegePredictorListAI',
                    payload
                );
            }

            setColleges(response.data);
            // Scroll to results
            setTimeout(() => {
                const resultsSection = document.querySelector('.predictor-results');
                if (resultsSection) {
                    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 100);
        } catch (err) {
            setError('Failed to fetch college predictions. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (loadingCities) {
        return (
            <div className="college-predictor">
                <div className="predictor-container">
                    <div className="loading-container">
                        <div className="spinner"></div>
                        <p className="loading-text">Loading College Predictor...</p>
                    </div>
                </div>
            </div>
        );
    }

    // If no exam type selected, show selection screen
    if (!examType) {
        return (
            <div className="college-predictor">
                <div className="predictor-container">
                    <h1 className="predictor-title">College Predictor</h1>
                    <p className="predictor-subtitle">Choose your exam to predict colleges</p>
                    
                    <div className="exam-selection">
                        <div 
                            className="exam-card"
                            onClick={() => setExamType('mhtcet')}
                        >
                            <div className="exam-icon">📚</div>
                            <h2>MHT CET</h2>
                            <p>Maharashtra State Board Engineering Entrance</p>
                            <button className="select-btn">Select MHT CET</button>
                        </div>
                        <div 
                            className="exam-card"
                            onClick={() => setExamType('jee')}
                        >
                            <div className="exam-icon">🎓</div>
                            <h2>JEE Mains</h2>
                            <p>Joint Entrance Examination</p>
                            <button className="select-btn">Select JEE</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="college-predictor">
            <div className="predictor-container">
                <div className="header-with-toggle">
                    <div>
                        <h1 className="predictor-title">
                            {examType === 'mhtcet' ? 'MHT CET' : examType === 'jee' ? 'JEE Mains' : ''} College Predictor
                        </h1>
                        <p className="predictor-subtitle">
                            {examType === 'mhtcet' 
                                ? 'Find your ideal engineering college based on your MHT CET score'
                                : 'Find your ideal engineering college based on your JEE Mains score'
                            }
                        </p>
                    </div>
                    <div className="exam-toggle-buttons">
                        <button 
                            className={`exam-toggle-btn ${examType === 'mhtcet' ? 'active' : ''}`}
                            onClick={() => {
                                setExamType('mhtcet');
                                setColleges([]);
                                setFormData({
                                    percentile: '',
                                    gender: 'Male',
                                    caste: 'OPEN',
                                    tfws: false,
                                    specialReservation: 'No',
                                    round: '1',
                                    branchCategory: ['All'],
                                    city: ['All']
                                });
                            }}
                        >
                            MHT CET
                        </button>
                        <button 
                            className={`exam-toggle-btn ${examType === 'jee' ? 'active' : ''}`}
                            onClick={() => {
                                setExamType('jee');
                                setColleges([]);
                                setFormData({
                                    percentile: '',
                                    gender: 'Male',
                                    caste: 'OPEN',
                                    tfws: false,
                                    specialReservation: 'No',
                                    round: '1',
                                    branchCategory: ['All'],
                                    city: ['All']
                                });
                            }}
                        >
                            JEE Mains
                        </button>
                    </div>
                </div>

                <form className="predictor-form" onSubmit={handleSubmit}>
                    {/* Percentile Input */}
                    <div className="form-group">
                        <label htmlFor="percentile">
                            {examType === 'mhtcet' ? 'MHT CET Percentile *' : 'JEE Mains Percentile *'}
                        </label>
                        <input
                            type="number"
                            id="percentile"
                            name="percentile"
                            value={formData.percentile}
                            onChange={handleInputChange}
                            step="0.0001"
                            min="0"
                            max="100"
                            placeholder="e.g., 94.0125463"
                            required
                        />
                    </div>

                    {/* Gender Dropdown */}
                    <div className="form-group">
                        <label htmlFor="gender">Gender *</label>
                        <select
                            id="gender"
                            name="gender"
                            value={formData.gender}
                            onChange={handleInputChange}
                            required
                        >
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                        </select>
                    </div>

                    {/* Category Dropdown - Only for MHT CET */}
                    {examType === 'mhtcet' && (
                        <>
                            <div className="form-group">
                                <label htmlFor="caste">Category *</label>
                                <select
                                    id="caste"
                                    name="caste"
                                    value={formData.caste}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="OPEN">OPEN</option>
                                    <option value="OBC">OBC</option>
                                    <option value="SEBC">SEBC</option>
                                    <option value="ST">ST</option>
                                    <option value="SC">SC</option>
                                    <option value="NT1">NT1</option>
                                    <option value="NT2">NT2</option>
                                    <option value="NT3">NT3</option>
                                    <option value="VJ">VJ</option>
                                    <option value="EWS">EWS</option>
                                </select>
                            </div>

                            {/* TFWS Checkbox */}
                            <div className="form-group">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        name="tfws"
                                        checked={formData.tfws}
                                        onChange={handleInputChange}
                                    />
                                    TFWS (Tuition Fee Waiver Scheme)
                                </label>
                            </div>

                            {/* Special Reservation Dropdown */}
                            <div className="form-group">
                                <label htmlFor="specialReservation">Special Reservation</label>
                                <select
                                    id="specialReservation"
                                    name="specialReservation"
                                    value={formData.specialReservation}
                                    onChange={handleInputChange}
                                >
                                    <option value="No">No</option>
                                    <option value="PWD">PWD (Persons with Disabilities)</option>
                                    <option value="DEF">DEF (Defence)</option>
                                    <option value="ORPHAN">ORPHAN</option>
                                </select>
                            </div>
                        </>
                    )}

                    {/* Round Dropdown */}
                    <div className="form-group">
                        <label htmlFor="round">CAP Round *</label>
                        <select
                            id="round"
                            name="round"
                            value={formData.round}
                            onChange={handleInputChange}
                            required
                        >
                            <option value="1">Round 1</option>
                            <option value="2">Round 2</option>
                            <option value="3">Round 3</option>
                            <option value="4">Round 4</option>
                        </select>
                    </div>

                    {/* Branch Category Checkboxes */}
                    <div className="form-group">
                        <label>Branch Category *</label>
                        <div className="checkbox-grid">
                            {branchOptions.map(branch => (
                                <label key={branch.value} className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={formData.branchCategory.includes(branch.value)}
                                        onChange={() => handleBranchChange(branch.value)}
                                    />
                                    <span>{branch.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* City Checkboxes */}
                    <div className="form-group">
                        <label>City Preference *</label>
                        <div className="city-checkboxes-grid">
                            <label className="city-checkbox-item">
                                <input
                                    type="checkbox"
                                    checked={formData.city.includes('All')}
                                    onChange={() => handleCityChange('All')}
                                />
                                <span>All Cities</span>
                            </label>
                            {cities.map(cityObj => (
                                <label key={cityObj.city} className="city-checkbox-item">
                                    <input
                                        type="checkbox"
                                        checked={formData.city.includes(cityObj.city)}
                                        onChange={() => handleCityChange(cityObj.city)}
                                    />
                                    <span>{cityObj.city}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <button type="submit" className="predict-btn" disabled={loading}>
                        {loading ? 'Predicting...' : 'Predict Colleges'}
                    </button>
                </form>

                {/* Results Section */}
                {colleges.length > 0 && (
                    <div className="results-section">
                        <h2 className="results-title">Predicted Colleges ({colleges.length})</h2>
                        <div className="probability-legend">
                            <div className="legend-item">
                                <div className="legend-color legend-high"></div>
                                <span>High Chance - Better chances of admission</span>
                            </div>
                            <div className="legend-item">
                                <div className="legend-color legend-medium"></div>
                                <span>Medium Chance - Moderate chances of admission</span>
                            </div>
                            <div className="legend-item">
                                <div className="legend-color legend-low"></div>
                                <span>Low Chance - Lower chances of admission</span>
                            </div>
                        </div>
                        <div className="results-grid">
                            {colleges.map((college, index) => (
                                <CollegePredictorCard
                                    key={college.choice_code}
                                    college={college}
                                    srNo={index + 1}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {!loading && colleges.length === 0 && formData.percentile && (
                    <div className="no-results">
                        <p>No colleges found matching your criteria. Try adjusting your filters.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CollegePredictor;
