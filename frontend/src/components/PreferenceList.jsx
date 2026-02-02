import React, { useState, useEffect } from 'react';
import './PreferenceList.css';
import PreferenceListTable from './PreferenceListTable';
import { API_URL } from '../utils/api';

const PreferenceList = ({ onBack }) => {
    // Load saved data from localStorage
    const loadSavedData = () => {
        try {
            const savedData = localStorage.getItem('preferenceListData');
            if (savedData) {
                return JSON.parse(savedData);
            }
        } catch (error) {
            console.error('Error loading saved data:', error);
        }
        return null;
    };

    const savedData = loadSavedData();

    const [examType, setExamType] = useState(savedData?.examType || 'MHT_CET'); // MHT_CET, MHT_JEE, JEE_MAINS
    const [formData, setFormData] = useState(savedData?.formData || {
        generalRank: '',
        aiRank: '',
        caste: 'OPEN',
        gender: 'Male',
        tfws: false,
        specialReservation: 'No',
        city: ['All'],
        branchCategory: ['All']
    });
    const [colleges, setColleges] = useState(savedData?.colleges || []);
    const [allColleges, setAllColleges] = useState(savedData?.allColleges || []);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [cities, setCities] = useState([]);

    const branchOptions = [
        { label: 'All', value: 'All' },
        { label: 'Civil', value: 'CIVIL' },
        { label: 'Computer Science', value: 'COMP' },
        { label: 'Information Technology', value: 'IT' },
        { label: 'Artificial Intelligence', value: 'AI' },
        { label: 'Electrical', value: 'ELECTRICAL' },
        { label: 'ENTC', value: 'ENTC' },
        { label: 'Mechanical', value: 'MECH' },
        { label: 'Chemical', value: 'CHEMICAL' },
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
            colleges,
            allColleges
        };
        localStorage.setItem('preferenceListData', JSON.stringify(dataToSave));
    }, [examType, formData, colleges, allColleges]);

    const fetchCities = async () => {
        try {
            const response = await fetch(`${API_URL}/api/preferenceList/fetchcity`);
            const data = await response.json();
            setCities(data);
        } catch (err) {
            console.error('Error fetching cities:', err);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleBranchToggle = (value) => {
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

    const handleCityToggle = (cityName) => {
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            let url = '';
            let requestBody = {};

            if (examType === 'MHT_CET') {
                // MHT CET only
                url = `${API_URL}/api/preferenceList/collegePreferenceList`;
                requestBody = {
                    generalRank: parseInt(formData.generalRank),
                    caste: formData.caste,
                    gender: formData.gender,
                    tfws: formData.tfws,
                    specialReservation: formData.specialReservation,
                    isAI: false,
                    city: formData.city,
                    branchCategory: formData.branchCategory
                };
            } else if (examType === 'MHT_JEE') {
                // MHT CET + JEE MAINS
                url = `${API_URL}/api/preferenceList/collegePreferenceList`;
                requestBody = {
                    generalRank: parseInt(formData.generalRank),
                    aiRank: parseInt(formData.aiRank),
                    caste: formData.caste,
                    gender: formData.gender,
                    tfws: formData.tfws,
                    specialReservation: formData.specialReservation,
                    isAI: true,
                    city: formData.city,
                    branchCategory: formData.branchCategory
                };
            } else if (examType === 'JEE_MAINS') {
                // JEE MAINS (ALL INDIA) only
                url = `${API_URL}/api/preferenceList/collegePreferenceListAI`;
                requestBody = {
                    aiRank: parseInt(formData.aiRank),
                    gender: formData.gender,
                    city: formData.city,
                    branchCategory: formData.branchCategory
                };
            }

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                throw new Error('Failed to fetch colleges');
            }

            const data = await response.json();
            setColleges(data.colleges || data);
            setAllColleges(data.allColleges || []);
            
            // Scroll to results
            setTimeout(() => {
                const resultsSection = document.querySelector('.preference-results');
                if (resultsSection) {
                    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 100);
        } catch (err) {
            setError('Error fetching colleges. Please try again.');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const renderFormFields = () => {
        return (
            <div className="preference-form">
                {/* Exam Type Selection */}
                <div className="form-group">
                    <label>Select Exam Type:</label>
                    <div className="exam-type-buttons">
                        <button
                            type="button"
                            className={`exam-btn ${examType === 'MHT_CET' ? 'active' : ''}`}
                            onClick={() => {
                                setExamType('MHT_CET');
                                setColleges([]);
                                setAllColleges([]);
                                setError('');
                                localStorage.removeItem('newlyAddedCodes');
                            }}
                        >
                            MHT CET
                        </button>
                        <button
                            type="button"
                            className={`exam-btn ${examType === 'MHT_JEE' ? 'active' : ''}`}
                            onClick={() => {
                                setExamType('MHT_JEE');
                                setColleges([]);
                                setAllColleges([]);
                                setError('');
                                localStorage.removeItem('newlyAddedCodes');
                            }}
                        >
                            MHT CET + JEE MAINS
                        </button>
                        <button
                            type="button"
                            className={`exam-btn ${examType === 'JEE_MAINS' ? 'active' : ''}`}
                            onClick={() => {
                                setExamType('JEE_MAINS');
                                setColleges([]);
                                setAllColleges([]);
                                setError('');
                                localStorage.removeItem('newlyAddedCodes');
                            }}
                        >
                            JEE MAINS (ALL INDIA)
                        </button>
                    </div>
                </div>

                {/* MHT CET Fields */}
                {(examType === 'MHT_CET' || examType === 'MHT_JEE') && (
                    <>
                        <div className="form-group">
                            <label>General Rank (MHT CET):</label>
                            <input
                                type="number"
                                name="generalRank"
                                value={formData.generalRank}
                                onChange={handleInputChange}
                                placeholder="Enter your MHT CET rank"
                                required
                            />
                        </div>

                        {/* JEE MAINS Field - Only for MHT_JEE */}
                        {examType === 'MHT_JEE' && (
                            <div className="form-group">
                                <label>All India Rank (JEE MAINS):</label>
                                <input
                                    type="number"
                                    name="aiRank"
                                    value={formData.aiRank}
                                    onChange={handleInputChange}
                                    placeholder="Enter your JEE MAINS rank"
                                    required
                                />
                            </div>
                        )}

                        <div className="form-group">
                            <label>Category:</label>
                            <select name="caste" value={formData.caste} onChange={handleInputChange}>
                                <option value="OPEN">OPEN</option>
                                <option value="OBC">OBC</option>
                                <option value="SC">SC</option>
                                <option value="ST">ST</option>
                                <option value="NT1">NT1</option>
                                <option value="NT2">NT2</option>
                                <option value="NT3">NT3</option>
                                <option value="VJ">VJ</option>
                                <option value="SEBC">SEBC</option>
                                <option value="EWS">EWS</option>
                            </select>
                        </div>

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

                        <div className="form-group">
                            <label>Special Reservation:</label>
                            <select name="specialReservation" value={formData.specialReservation} onChange={handleInputChange}>
                                <option value="No">No</option>
                                <option value="PWD">PWD (Persons with Disabilities)</option>
                                <option value="DEF">DEF (Defence)</option>
                                <option value="ORPHAN">ORPHAN</option>
                            </select>
                        </div>
                    </>
                )}

                {/* JEE MAINS Field - Only for JEE_MAINS exam type */}
                {examType === 'JEE_MAINS' && (
                    <div className="form-group">
                        <label>All India Rank (JEE MAINS):</label>
                        <input
                            type="number"
                            name="aiRank"
                            value={formData.aiRank}
                            onChange={handleInputChange}
                            placeholder="Enter your JEE MAINS rank"
                            required
                        />
                    </div>
                )}

                {/* Common Fields */}
                <div className="form-group">
                    <label>Gender:</label>
                    <select name="gender" value={formData.gender} onChange={handleInputChange}>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                    </select>
                </div>

                {/* Branch Category Checkboxes */}
                <div className="form-group">
                    <label>Branch Category:</label>
                    <div className="checkbox-grid">
                        {branchOptions.map(branch => (
                            <label key={branch.value} className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={formData.branchCategory.includes(branch.value)}
                                    onChange={() => handleBranchToggle(branch.value)}
                                />
                                <span>{branch.label}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* City Checkboxes */}
                <div className="form-group">
                    <label>City Preference:</label>
                    <div className="city-checkboxes-grid">
                        <label className="city-checkbox-item">
                            <input
                                type="checkbox"
                                checked={formData.city.includes('All')}
                                onChange={() => handleCityToggle('All')}
                            />
                            <span>All Cities</span>
                        </label>
                        {cities.map(cityObj => (
                            <label key={cityObj.city} className="city-checkbox-item">
                                <input
                                    type="checkbox"
                                    checked={formData.city.includes(cityObj.city)}
                                    onChange={() => handleCityToggle(cityObj.city)}
                                />
                                <span>{cityObj.city}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <button type="submit" className="submit-btn" disabled={loading}>
                    {loading ? 'Loading...' : 'Get Colleges'}
                </button>
            </div>
        );
    };

    return (
        <div className="preference-list-container">
            <h1>College Preference List</h1>
            <p className="subtitle">Generate your personalized college preference list</p>

            <form onSubmit={handleSubmit}>
                {renderFormFields()}
            </form>

            {error && <div className="error-message">{error}</div>}

            {colleges.length > 0 && (
                <div className="results-section">
                    <h2>Your Preference List ({colleges.length} Colleges)</h2>
                    <PreferenceListTable 
                        colleges={colleges} 
                        allColleges={allColleges}
                        setColleges={setColleges}
                    />
                </div>
            )}
        </div>
    );
};

export default PreferenceList;
