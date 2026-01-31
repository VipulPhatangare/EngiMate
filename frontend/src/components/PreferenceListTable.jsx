import './PreferenceListTable.css';
import { useState } from 'react';

const PreferenceListTable = ({ colleges, allColleges, setColleges }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [modalSearchTerm, setModalSearchTerm] = useState('');
    const [selectedColleges, setSelectedColleges] = useState([]);
    const [newlyAddedCodes, setNewlyAddedCodes] = useState([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [collegeToDelete, setCollegeToDelete] = useState(null);

    const cutoffFields = [
        { key: 'gopen', label: 'GOPEN' },
        { key: 'ews', label: 'EWS' },
        { key: 'tfws', label: 'TFWS' },
        { key: 'lopen', label: 'LOPEN' },
        { key: 'gobc', label: 'GOBC' },
        { key: 'lobc', label: 'LOBC' },
        { key: 'gsebc', label: 'GSEBC' },
        { key: 'lsebc', label: 'LSEBC' },
        { key: 'gst', label: 'GST' },
        { key: 'lst', label: 'LST' },
        { key: 'gsc', label: 'GSC' },
        { key: 'lsc', label: 'LSC' },
        { key: 'gnt1', label: 'GNT1' },
        { key: 'lnt1', label: 'LNT1' },
        { key: 'gnt2', label: 'GNT2' },
        { key: 'lnt2', label: 'LNT2' },
        { key: 'gnt3', label: 'GNT3' },
        { key: 'lnt3', label: 'LNT3' },
        { key: 'gvj', label: 'GVJ' },
        { key: 'lvj', label: 'LVJ' },
        { key: 'pwd', label: 'PWD' },
        { key: 'def', label: 'DEF' },
        { key: 'orphan', label: 'ORPHAN' },
        { key: 'ai_india', label: 'AI' },
        { key: 'all_india', label: 'AI' }
    ];

    const getDisplayCutoffs = (college) => {
        const cutoffs = {};
        
        cutoffFields.forEach(field => {
            const value = college[field.key];
            // Show cutoff if it exists and is not null, undefined, or empty
            if (value && value !== 'null' && value !== '' && value !== 'NULL::TEXT AS') {
                cutoffs[field.label] = value;
            }
        });

        return cutoffs;
    };

    const handleSearch = (e) => {
        const term = e.target.value;
        setSearchTerm(term);

        if (term.trim() === '') {
            setSearchResults([]);
            return;
        }

        // Safety check for colleges array
        if (!colleges || colleges.length === 0) {
            setSearchResults([]);
            return;
        }

        const searchLower = term.toLowerCase();
        const results = colleges.filter(college => {
            const collegeName = college.college_name?.toLowerCase() || '';
            const choiceCode = college.choice_code?.toLowerCase() || '';
            const collegeCode = college.college_code?.toLowerCase() || '';

            return collegeName.includes(searchLower) || 
                   choiceCode.includes(searchLower) || 
                   collegeCode.includes(searchLower);
        });

        setSearchResults(results);
    };

    const handleKeyDown = (e) => {
        // Prevent form submission on Enter key
        if (e.key === 'Enter') {
            e.preventDefault();
            e.stopPropagation();
        }
    };

    const handleSearchClick = (e) => {
        // Prevent any click event from bubbling up
        e.stopPropagation();
    };

    // Modal functions
    const openModal = () => {
        setShowModal(true);
        setModalSearchTerm('');
        setSelectedColleges([]);
    };

    const closeModal = () => {
        setShowModal(false);
        setModalSearchTerm('');
        setSelectedColleges([]);
    };

    const handleModalClick = (e) => {
        // Prevent closing when clicking inside modal content
        e.stopPropagation();
    };

    const handleModalSearch = (e) => {
        setModalSearchTerm(e.target.value);
    };

    const getFilteredAllColleges = () => {
        if (!allColleges || allColleges.length === 0) return [];
        
        if (modalSearchTerm.trim() === '') return allColleges;

        const searchLower = modalSearchTerm.toLowerCase();
        return allColleges.filter(college => {
            const collegeName = college.college_name?.toLowerCase() || '';
            const choiceCode = college.choice_code?.toLowerCase() || '';
            const collegeCode = college.college_code?.toLowerCase() || '';

            return collegeName.includes(searchLower) || 
                   choiceCode.includes(searchLower) || 
                   collegeCode.includes(searchLower);
        });
    };

    const toggleCollegeSelection = (choiceCode) => {
        setSelectedColleges(prev => {
            if (prev.includes(choiceCode)) {
                return prev.filter(code => code !== choiceCode);
            } else {
                return [...prev, choiceCode];
            }
        });
    };

    const handleAddColleges = () => {
        if (selectedColleges.length === 0) return;

        // Get colleges to add
        const collegesToAdd = allColleges.filter(college => 
            selectedColleges.includes(college.choice_code)
        );

        // Get existing choice codes
        const existingCodes = new Set(colleges.map(c => c.choice_code));

        // Filter out duplicates
        const newColleges = collegesToAdd.filter(college => 
            !existingCodes.has(college.choice_code)
        );

        if (newColleges.length === 0) {
            alert('All selected colleges are already in your list!');
            return;
        }

        // Track newly added choice codes for styling
        const newCodes = newColleges.map(c => c.choice_code);
        setNewlyAddedCodes(prev => [...prev, ...newCodes]);

        // Merge and sort by points (descending)
        const updatedColleges = [...colleges, ...newColleges];
        updatedColleges.sort((a, b) => (b.points || 0) - (a.points || 0));

        setColleges(updatedColleges);
        closeModal();
    };

    const handleDeleteCollege = (choiceCode, index) => {
        // Prevent deletion of top 10 colleges when list is large
        if (index < 10 && colleges.length > 150) {
            return; // Button is already disabled, this is extra safety
        }

        // Find the college to delete
        const college = colleges.find(c => c.choice_code === choiceCode);
        setCollegeToDelete({ ...college, index });
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        if (collegeToDelete) {
            // Remove from colleges list
            const updatedColleges = colleges.filter(c => c.choice_code !== collegeToDelete.choice_code);
            setColleges(updatedColleges);
            
            // Remove from newly added tracking
            setNewlyAddedCodes(prev => prev.filter(code => code !== collegeToDelete.choice_code));
        }
        setShowDeleteModal(false);
        setCollegeToDelete(null);
    };

    const cancelDelete = () => {
        setShowDeleteModal(false);
        setCollegeToDelete(null);
    };

    const exportToCSV = () => {
        // Prepare CSV headers
        const headers = ['Sr No.', 'Choice Code', 'College Name', 'Branch', 'City', 'University'];
        
        // Get all unique cutoff labels
        const allCutoffLabels = new Set();
        colleges.forEach(college => {
            const cutoffs = getDisplayCutoffs(college);
            Object.keys(cutoffs).forEach(label => allCutoffLabels.add(label));
        });
        const cutoffHeaders = Array.from(allCutoffLabels).sort();
        headers.push(...cutoffHeaders);

        // Prepare CSV rows
        const rows = colleges.map((college, index) => {
            const cutoffs = getDisplayCutoffs(college);
            const row = [
                index + 1,
                college.choice_code,
                `"${college.college_name}"`,
                `"${college.branch_name}"`,
                college.city,
                `"${college.university}"`
            ];
            
            // Add cutoff values
            cutoffHeaders.forEach(label => {
                row.push(cutoffs[label] ? `"${cutoffs[label]}"` : '');
            });
            
            return row.join(',');
        });

        // Combine headers and rows
        const csv = [headers.join(','), ...rows].join('\n');

        // Create blob and download
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `preference_list_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Determine which colleges to display
    const displayedColleges = searchTerm.trim() !== '' ? searchResults : colleges;

    const filteredModalColleges = getFilteredAllColleges();

    return (
        <div className="preference-table-container">
            {/* Search Bar and Add Button in one line */}
            <div className="search-and-actions">
                <div className="preference-search-bar" onClick={handleSearchClick}>
                    <input
                        type="text"
                        placeholder="Search by College Name, Choice Code, or College Code..."
                        value={searchTerm}
                        onChange={handleSearch}
                        onKeyDown={handleKeyDown}
                        autoComplete="off"
                        className="college-search-input"
                    />
                    <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21 21L15.5 15.5M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </div>
                
                <div className="action-buttons">
                    <button onClick={openModal} className="add-colleges-btn">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Add Colleges
                    </button>
                    <button onClick={exportToCSV} className="export-btn">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 16L7 11L8.4 9.55L11 12.15V4H13V12.15L15.6 9.55L17 11L12 16ZM6 20C5.45 20 4.979 19.804 4.587 19.412C4.195 19.02 3.99934 18.5493 4 18V15H6V18H18V15H20V18C20 18.55 19.804 19.021 19.412 19.413C19.02 19.805 18.5493 20.0007 18 20H6Z" fill="currentColor"/>
                        </svg>
                        Export CSV
                    </button>
                </div>
            </div>

            {/* Show filter status */}
            {searchTerm && (
                <div className="search-status">
                    {searchResults.length > 0 ? (
                        <p>Showing {searchResults.length} of {colleges.length} colleges</p>
                    ) : (
                        <p className="no-results-text">No colleges found matching "{searchTerm}"</p>
                    )}
                </div>
            )}

            <div className="table-wrapper">
                <table className="preference-table">
                    <thead>
                        <tr>
                            <th className="col-sr">Sr No.</th>
                            <th className="col-choice-code">Choice Code</th>
                            <th className="col-college">College Name</th>
                            <th className="col-branch">Branch</th>
                            <th className="col-city">City</th>
                            <th className="col-university">University</th>
                            <th className="col-cutoffs">Cutoffs (Rank/Percentile)</th>
                            <th className="col-actions">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayedColleges.map((college, index) => {
                            const cutoffs = getDisplayCutoffs(college);
                            // Only apply green highlight to first 10 when not searching
                            const isTop10 = !searchTerm && index < 10;
                            const isNewlyAdded = newlyAddedCodes.includes(college.choice_code);
                            const rowClass = isTop10 ? 'top-10-row' : (isNewlyAdded ? 'newly-added-row' : '');
                            return (
                                <tr key={college.choice_code} className={rowClass}>
                                    <td className="col-sr" data-label="Sr No.">{index + 1}</td>
                                    <td className="col-choice-code" data-label="Choice Code">{college.choice_code}</td>
                                    <td className="col-college" data-label="College">
                                        <div className="college-info">
                                            <span className="college-name">{college.college_name}</span>
                                        </div>
                                    </td>
                                    <td className="col-branch" data-label="Branch">
                                        <div className="branch-info">
                                            <span className="branch-name">{college.branch_name}</span>
                                        </div>
                                    </td>
                                    <td className="col-city" data-label="City">{college.city}</td>
                                    <td className="col-university" data-label="University">{college.university}</td>
                                    <td className="col-cutoffs" data-label="Cutoffs">
                                        <div className="cutoffs-list">
                                            {Object.entries(cutoffs).map(([label, value]) => (
                                                <div key={label} className="cutoff-item">
                                                    <span className="cutoff-label">{label}:</span>
                                                    <span className="cutoff-value">{value}</span>
                                                </div>
                                            ))}
                                            {Object.keys(cutoffs).length === 0 && (
                                                <span className="no-cutoffs">No cutoff data</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="col-actions" data-label="Actions">
                                        <button 
                                            className={`delete-btn ${isTop10 ? 'disabled' : ''}`}
                                            onClick={() => handleDeleteCollege(college.choice_code, index)}
                                            disabled={isTop10}
                                            title={isTop10 ? 'Top 10 colleges cannot be removed' : 'Remove from list'}
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M19 7L18.1327 19.1425C18.0579 20.1891 17.187 21 16.1378 21H7.86224C6.81296 21 5.94208 20.1891 5.86732 19.1425L5 7M10 11V17M14 11V17M15 7V4C15 3.44772 14.5523 3 14 3H10C9.44772 3 9 3.44772 9 4V7M4 7H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Add Colleges Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content" onClick={handleModalClick}>
                        <div className="modal-header">
                            <h2>Add Colleges to Your List</h2>
                            <button onClick={closeModal} className="close-modal-btn">×</button>
                        </div>

                        <div className="modal-search">
                            <input
                                type="text"
                                placeholder="Search colleges by name, choice code, or college code..."
                                value={modalSearchTerm}
                                onChange={handleModalSearch}
                                className="modal-search-input"
                                autoComplete="off"
                            />
                        </div>

                        <div className="modal-body">
                            <div className="colleges-list">
                                {filteredModalColleges.length > 0 ? (
                                    filteredModalColleges.map(college => {
                                        const isAlreadyInList = colleges.some(c => c.choice_code === college.choice_code);
                                        const isSelected = selectedColleges.includes(college.choice_code);
                                        
                                        return (
                                            <div 
                                                key={college.choice_code} 
                                                className={`college-item ${isAlreadyInList ? 'already-added' : ''} ${isSelected ? 'selected' : ''}`}
                                            >
                                                <label>
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => toggleCollegeSelection(college.choice_code)}
                                                        disabled={isAlreadyInList}
                                                    />
                                                    <div className="college-item-details">
                                                        <div className="college-item-name">{college.college_name}</div>
                                                        <div className="college-item-info">
                                                            <span className="choice-code">{college.choice_code}</span>
                                                            <span className="branch">{college.branch_name}</span>
                                                            <span className="city">{college.city}</span>
                                                            {isAlreadyInList && <span className="already-added-badge">Already Added</span>}
                                                        </div>
                                                    </div>
                                                </label>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="no-colleges-found">
                                        <p>No colleges found</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button onClick={closeModal} className="btn-cancel">Close</button>
                            <button 
                                onClick={handleAddColleges} 
                                className="btn-add"
                                disabled={selectedColleges.length === 0}
                            >
                                Add Selected ({selectedColleges.length})
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && collegeToDelete && (
                <div className="modal-overlay" onClick={cancelDelete}>
                    <div className="delete-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="delete-modal-header">
                            <h2>Confirm Deletion</h2>
                        </div>
                        <div className="delete-modal-body">
                            <p>Are you sure you want to remove this college from your preference list?</p>
                            <div className="college-to-delete">
                                <div className="college-name-highlight">{collegeToDelete.college_name}</div>
                                <div className="college-details-small">
                                    <span>Choice Code: {collegeToDelete.choice_code}</span>
                                    <span>Branch: {collegeToDelete.branch_name}</span>
                                </div>
                            </div>
                        </div>
                        <div className="delete-modal-footer">
                            <button onClick={cancelDelete} className="btn-cancel-delete">Cancel</button>
                            <button onClick={confirmDelete} className="btn-confirm-delete">Yes, Remove</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PreferenceListTable;
