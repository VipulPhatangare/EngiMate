// Toast notification system
function createToastContainer() {
    if (!document.getElementById('toast-container')) {
        const container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 10px;
            pointer-events: none;
        `;
        document.body.appendChild(container);
    }
}

function showToast(message, type = 'info', duration = 3000) {
    createToastContainer();
    
    const colors = {
        success: { bg: '#10B981', text: '#ffffff', icon: '✓' },
        error: { bg: '#EF4444', text: '#ffffff', icon: '✕' },
        warning: { bg: '#F59E0B', text: '#ffffff', icon: '⚠' },
        info: { bg: '#3B82F6', text: '#ffffff', icon: 'ℹ' }
    };
    
    const color = colors[type] || colors.info;
    
    const toast = document.createElement('div');
    toast.style.cssText = `
        background: ${color.bg};
        color: ${color.text};
        padding: 12px 16px;
        border-radius: 6px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        display: flex;
        align-items: center;
        gap: 8px;
        font-family: inherit;
        font-size: 14px;
        max-width: 350px;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
        pointer-events: auto;
        word-wrap: break-word;
    `;
    
    toast.innerHTML = `
        <span style="font-weight: bold; font-size: 16px;">${color.icon}</span>
        <span>${message}</span>
    `;
    
    const container = document.getElementById('toast-container');
    container.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(0)';
    }, 10);
    
    // Auto remove
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (container.contains(toast)) {
                container.removeChild(toast);
            }
        }, 300);
    }, duration);
}

async function fetch_university() {
    try {
        const response = await fetch('/branchwiseCutoffPCM/University_fetch');
        const data = await response.json();
        const university = document.getElementById('university');

        data.forEach(element => {
            const option = document.createElement('option');
            option.value = element.university;
            option.innerText = `${element.university}`;
            university.appendChild(option);
        });

    } catch (error) {
        console.log(error);
    }
}

async function fetch_other_branches() {
    try {
        const response = await fetch('/branchwiseCutoffPCM/fetch_other_branches');
        const data = await response.json();

        const other_branch = document.getElementById('other-branch');
        data.forEach(element => {
            const option = document.createElement('option');
            option.value = element.branch_name;
            option.innerText = `${element.branch_name}`;
            other_branch.appendChild(option);
        });
        
    } catch (error) {
        console.log(error);
    }
}

async function fetch_city() {
    try {
        const response = await fetch('/branchwiseCutoffPCM/city_fetch');
        const data = await response.json();

        const city = document.getElementById('city-container');

        data.forEach(element => {
            const city_child = document.createElement('label');
            city_child.className = 'checkbox-label';
            city_child.innerHTML = `
                <input type="checkbox" name="city" value="${element.city}">
                <span>${element.city}</span>
            `;

            city.appendChild(city_child);
        });
        
    } catch (error) {
        console.log(error);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    fetch_university();
    fetch_city();
    fetch_other_branches();
    
    // DOM Elements
    const searchBtn = document.getElementById('search-btn');
    const cityContainer = document.getElementById('city-container');
    const collegeCardsContainer = document.getElementById('collegeCards');
    const backBtn = document.getElementById('back-btn');
    
    // Smooth scroll to results
    function scrollToResults() {
        const resultsContainer = document.getElementById('results-container');
        if (resultsContainer) {
            resultsContainer.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        }
    }
    
    // Back button event listener
    backBtn.addEventListener('click', function() {
        window.history.back();
    });

    // Event Listeners for city checkboxes
    cityContainer.addEventListener('change', function(e) {
        if (e.target.name === 'city') {
            if (e.target.value === 'All' && e.target.checked) {
                // If "All" is checked, uncheck all other cities
                document.querySelectorAll('input[name="city"]:not([value="All"])').forEach(checkbox => {
                    checkbox.checked = false;
                });
            } else if (e.target.checked) {
                // If any other city is checked, uncheck "All"
                document.querySelector('input[name="city"][value="All"]').checked = false;
            }
        }
    });
    
    // Search button click handler
    searchBtn.addEventListener('click', async function(e) {
        e.preventDefault();
        const university = document.getElementById('university');
        const branch = document.getElementById('branch');

        if (!university.value) {
            showToast('Please select a Home University', 'warning');
            university.focus();
            return;
        }
        
        if (!branch.value) {
            showToast('Please select a Branch Category', 'warning');
            branch.focus();
            return;
        }

        const formData = {
            university: document.getElementById('university').value,
            branch: document.getElementById('branch').value,
            caste: document.getElementById('caste').value,
            gender: document.querySelector('input[name="gender"]:checked').value,
            specialCategory: document.getElementById('special-category').value,
            cities: Array.from(document.querySelectorAll('input[name="city"]:checked')).map(cb => cb.value),
            other_branches: document.getElementById('other-branch').value
        };

        console.log(formData);
        
        // Show loading toast
        showToast('Searching for cutoff data...', 'info', 2000);
       
            try {
                const response = await fetch('/branchwiseCutoffPCM/branch_wise_cutoff', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                const data = await response.json();
                // console.log(data);
                displayResults(data, formData);
                
                // Show success toast based on results
                if (data && data.length > 0) {
                    showToast(`Found ${data.length} colleges with cutoff data!`, 'success');
                } else {
                    showToast('No colleges found matching your criteria.', 'warning');
                }
                
                // Auto scroll to results after data is loaded
                setTimeout(() => {
                    scrollToResults();
                }, 500);

            } catch (error) {
                console.log(error);
                showToast('An error occurred while fetching cutoff data. Please try again.', 'error');
            }
            
       
    });
    
    // Display results function
    function displayResults(data, formData) {
        const resultsContainer = document.getElementById('results-container');
        const collegeCardsContainer = document.getElementById('collegeCards');
        collegeCardsContainer.innerHTML = '';
        
        if (data.length === 0) {
            collegeCardsContainer.innerHTML = '<div style="text-align: center; padding: 20px; color: #b8c2d8;">No colleges found matching your criteria.</div>';
            resultsContainer.style.display = 'block';
            return;
        }
        
        let count = 1;

        data.forEach(college => {
            const card = document.createElement('div');
            card.className = 'college-card selected';
            
            // Create card header with choice code and status
            const cardHeader = document.createElement('div');
            cardHeader.className = 'college-card-header';
            cardHeader.innerHTML = `
                <div class="college-code">${count}</div>
                <div class="college-code">${college.branch_code}</div>
                <div class="status status-home">${college.seat_type}</div>
            `;
            count++;
            
            // Create college name and university
            const collegeInfo = document.createElement('div');
            collegeInfo.innerHTML = `
                <div class="college-name">${college.college_name}</div>
                <div style="color: #b8c2d8; margin-bottom: 10px;">${college.university}</div>
                <div style="color: #4a90e2; font-weight: 600; margin-bottom: 15px;">${college.branch_name}</div>
            `;
            
            // Create cutoffs section
            const cutoffs = document.createElement('div');
            cutoffs.className = 'college-details';
            
            let cutoffItems = [];

            if(college.gopen){
                cutoffItems.push(`<div class="college-detail">
                    <div class="college-detail-label">GOPEN</div>
                    <div>${college.gopen}</div>
                </div>`);
            }

            if(formData.gender == 'Female'){
                if(formData.caste == 'EWS'){
                    cutoffItems.push(`<div class="college-detail">
                        <div class="college-detail-label">LOPEN</div>
                        <div>${college.lopen}</div>
                    </div>`);

                    cutoffItems.push(`<div class="college-detail">
                        <div class="college-detail-label">EWS</div>
                        <div>${college.ews}</div>
                    </div>`);
                }else if(formData.caste !== 'OPEN'){
                    cutoffItems.push(`<div class="college-detail">
                        <div class="college-detail-label">LOPEN</div>
                        <div>${college.lopen}</div>
                    </div>`);

                    let caste_name = `L${formData.caste}`;
                    cutoffItems.push(`<div class="college-detail">
                        <div class="college-detail-label">${caste_name}</div>
                        <div>${college[caste_name.toLowerCase()]}</div>
                    </div>`);
                }else{
                    cutoffItems.push(`<div class="college-detail">
                        <div class="college-detail-label">LOPEN</div>
                        <div>${college.lopen}</div>
                    </div>`);
                }
            }else{
                if(formData.caste == 'EWS'){
                    cutoffItems.push(`<div class="college-detail">
                        <div class="college-detail-label">EWS</div>
                        <div>${college.ews}</div>
                    </div>`);
                }else if(formData.caste !== 'OPEN'){
                    let caste_name = `G${formData.caste}`;
                    cutoffItems.push(`<div class="college-detail">
                        <div class="college-detail-label">${caste_name}</div>
                        <div>${college[caste_name.toLowerCase()]}</div>
                    </div>`);
                }
            }

            if (formData.specialCategory != 'NO') {
                cutoffItems.push(`<div class="college-detail">
                    <div class="college-detail-label">${formData.specialCategory}</div>
                    <div>${college[formData.specialCategory.toLowerCase()]}</div>
                </div>`);
            }
            
            cutoffs.innerHTML = cutoffItems.join('');
            
            // Assemble the card
            card.appendChild(cardHeader);
            card.appendChild(collegeInfo);
            card.appendChild(cutoffs);
            
            collegeCardsContainer.appendChild(card);
        });

        resultsContainer.style.display = 'block';
    }
});

// Branch selection handler
document.getElementById('branch').addEventListener('change', function() {
    const otherBranchContainer = document.getElementById('other-branch-container');
    
    if (this.value === 'OTHER') {
        otherBranchContainer.classList.remove('hidden');
    } else {
        otherBranchContainer.classList.add('hidden');
    }
});