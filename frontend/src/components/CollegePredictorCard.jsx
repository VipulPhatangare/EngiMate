import './CollegePredictorCard.css';

const CollegePredictorCard = ({ college, srNo, showProbability = true }) => {
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
        { key: 'orphan', label: 'ORPHAN' }
    ];

    // Get non-null cutoffs, with GOPEN always first
    const getDisplayCutoffs = () => {
        const cutoffs = [];
        
        // Always add GOPEN first if available
        if (college.gopen && college.gopen !== '0 (0)') {
            cutoffs.push({ label: 'GOPEN', value: college.gopen });
        }

        // Add other non-null cutoffs
        cutoffFields.forEach(field => {
            if (field.key !== 'gopen' && college[field.key] && college[field.key] !== '0 (0)') {
                cutoffs.push({ label: field.label, value: college[field.key] });
            }
        });

        return cutoffs;
    };

    const displayCutoffs = getDisplayCutoffs();

    const parseCutoff = (cutoffString) => {
        if (!cutoffString) return { rank: 'N/A', percentile: 'N/A' };
        const match = cutoffString.match(/^(\d+)\s*\(([^)]+)\)$/);
        if (match) {
            return { rank: match[1], percentile: match[2] };
        }
        return { rank: cutoffString, percentile: 'N/A' };
    };

    const getProbabilityClass = (probability) => {
        switch(probability?.toLowerCase()) {
            case 'high':
                return 'probability-high';
            case 'medium':
                return 'probability-medium';
            case 'low':
                return 'probability-low';
            default:
                return 'probability-na';
        }
    };

    return (
        <div className={`predictor-card ${showProbability ? getProbabilityClass(college.probability) : ''}`}>
            <div className="card-header">
                <div className={`sr-choice ${showProbability ? getProbabilityClass(college.probability) : ''}`}>
                    <span className="sr-number">#{srNo}</span>
                    <span className="choice-code">{college.choice_code}</span>
                </div>
            </div>

            <div className="card-body">
                <h3 className="college-name">{college.college_name}</h3>
                <div className="branch-name">
                    <span className="branch-icon">🎓</span>
                    {college.branch_name}
                </div>
                <p className="university-name">
                    <span className="icon">🏛️</span>
                    {college.university}
                </p>
                <p className="city-name">
                    <span className="icon">📍</span>
                    {college.city}
                </p>

                {/* JEE specific fields - airank and aiper */}
                {(college.airank || college.aiper) && (
                    <div className="jee-stats">
                        {college.airank && (
                            <div className="jee-stat-item">
                                <span className="jee-label">AI Rank:</span>
                                <span className="jee-value">{college.airank}</span>
                            </div>
                        )}
                        {college.aiper && (
                            <div className="jee-stat-item">
                                <span className="jee-label">AI Percentile:</span>
                                <span className="jee-value">{college.aiper.toFixed(4)}%</span>
                            </div>
                        )}
                    </div>
                )}

                <div className="cutoffs-section">
                    <h4 className="cutoffs-title">Cutoff Details</h4>
                    <div className="cutoffs-grid">
                        {displayCutoffs.map((cutoff, index) => {
                            const { rank, percentile } = parseCutoff(cutoff.value);
                            return (
                                <div key={index} className="cutoff-item">
                                    <span className="cutoff-label">{cutoff.label}:</span>
                                    <div className="cutoff-value">
                                        <span className="rank">Rank: {rank}</span>
                                        <span className="percentile">({percentile}%)</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CollegePredictorCard;
