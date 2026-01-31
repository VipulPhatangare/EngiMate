const express = require('express');
const router = express.Router();
const supabase = require('../utils/supabase');

//http://localhost:5000/api/topColleges

router.get('/fetchcity', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('College_info_2025_26')
            .select('city')
            .not('city', 'is', null)
            .order('city', { ascending: true });
        
        if (error) throw error;
        
        // Trim and get distinct cities
        const distinctCities = [...new Set(data.map(item => item.city.trim()))];
        res.json(distinctCities.map(city => ({ city })));
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch cities' });
    }
});



router.get('/fetchUniversity', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('College_info_2025_26')
            .select('university')
            .not('university', 'is', null)
            .order('university', { ascending: true });
        
        if (error) throw error;
        
        // Get distinct universities
        const distinctUniversities = [...new Set(data.map(item => item.university))];
        res.json(distinctUniversities.map(univ => ({ university: univ })));
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch universities' });
    }
});


function college_filter_by_city(colleges, cityArray) {
  const normalizedCityArray = cityArray.map(c => c.trim().toUpperCase());

  return colleges.filter(college => 
    normalizedCityArray.includes(college.city.trim().toUpperCase())
  );
}


router.post('/topCollegeList', async (req, res) => {
  try {
    const formData = req.body;
    // console.log(formData);

    let query = supabase
      .from('College_info_2025_26')
      .select('college_code, college_name, city, rank, university');

    // Apply university filter if not 'All'
    if (formData.university !== 'All') {
      query = query.eq('university', formData.university);
    }

    // Execute the query
    const { data, error } = await query;

    if (error) {
      return res.status(500).json({ error: 'Database error' });
    }

    // Apply city filter if not 'All'
    let colleges = data;
    if (formData.cities[0] !== 'All') {
      colleges = college_filter_by_city(data, formData.cities);
    }

    colleges.sort((a, b) => a.rank - b.rank);
    // console.log(colleges);
    return res.json(colleges);
    
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});



module.exports = router