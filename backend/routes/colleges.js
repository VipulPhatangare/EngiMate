const express = require('express')
const router = express.Router()
const supabase = require('../utils/supabase')


// http://localhost:5050/api/colleges

// Helper function to retry Supabase queries
async function retrySupabaseQuery(queryFn, maxRetries = 3, delay = 2000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await queryFn();
      return result;
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
}

// Get college names and codes for search autocomplete
router.get('/collegeNames', async (req, res) => {
  try {
    const result = await retrySupabaseQuery(async () => {
      return await supabase
        .from('College_info_2025_26')
        .select('college_code, college_name');
    });

    const { data, error } = result;

    if (error) {
      return res.status(500).json({ error: 'Database error', details: error.message });
    }

    return res.json(data);
    
  } catch (err) {
    return res.status(500).json({ 
      error: 'Server error', 
      details: err.message,
      hint: 'Check your internet connection and Supabase credentials'
    });
  }
});

// Get college information by college_code
router.post('/collegeInfo', async (req, res) => {
  const { college_code } = req.body;
  
  try {
    const result = await retrySupabaseQuery(async () => {
      return await supabase
        .from('College_info_2025_26')
        .select('*')
        .eq('college_code', college_code);
    });

    const { data, error } = result;
    
    if (error) {
      return res.status(500).json({ error: 'Database error', details: error.message });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'College not found' });
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ 
      error: 'Server error', 
      details: err.message,
      hint: 'Check your internet connection and Supabase credentials'
    });
  }
});


function college_branch_info_helper(year, round) {

  /* ---------------- YEAR BASED TABLES ---------------- */
  let merit = '';
  let ai_table_name = '';

  if (year === 2025) {
    merit = 'merit_list_2025_26';
    ai_table_name = '"AI_2025_26_ALL_CAP"';
  } else {
    merit = 'merit_list_2024_25';
    ai_table_name = '"AI_2024_25_ALL_CAP"';
  }

  /* ---------------- ROUND BASED AI COLUMNS ---------------- */
  let ai_round_rank = '';
  let ai_round_per = '';

  if (round === 1) {
    ai_round_rank = 'cap_1_rank';
    ai_round_per  = 'cap_1_per';
  } else if (round === 2) {
    ai_round_rank = 'cap_2_rank';
    ai_round_per  = 'cap_2_per';
  } else if (round === 3) {
    ai_round_rank = 'cap_3_rank';
    ai_round_per  = 'cap_3_per';
  } else {
    ai_round_rank = 'cap_4_rank';
    ai_round_per  = 'cap_4_per';
  }

  /* ---------------- CATEGORY SQL ---------------- */
  return `

  /* ================= OPEN ================= */
  CASE
    WHEN r."GOPENS" <> 0 AND r."GOPENH" = 0 THEN r."GOPENS"::TEXT
    ELSE r."GOPENH"::TEXT
  END || ' (' || COALESCE(
    (SELECT m.percentile FROM ${merit} m
     WHERE m.rank = CASE
       WHEN r."GOPENS" <> 0 AND r."GOPENH" = 0 THEN r."GOPENS"
       ELSE r."GOPENH"
     END LIMIT 1),'0'
  ) || ')' AS GOPEN,

  CASE
    WHEN r."LOPENS" <> 0 AND r."LOPENH" = 0 THEN r."LOPENS"::TEXT
    ELSE r."LOPENH"::TEXT
  END || ' (' || COALESCE(
    (SELECT m.percentile FROM ${merit} m
     WHERE m.rank = CASE
       WHEN r."LOPENS" <> 0 AND r."LOPENH" = 0 THEN r."LOPENS"
       ELSE r."LOPENH"
     END LIMIT 1),'0'
  ) || ')' AS LOPEN,

  /* ================= OBC ================= */
  CASE
    WHEN r."GOBCS" <> 0 AND r."GOBCH" = 0 THEN r."GOBCS"::TEXT
    ELSE r."GOBCH"::TEXT
  END || ' (' || COALESCE(
    (SELECT m.percentile FROM ${merit} m
     WHERE m.rank = CASE
       WHEN r."GOBCS" <> 0 AND r."GOBCH" = 0 THEN r."GOBCS"
       ELSE r."GOBCH"
     END LIMIT 1),'0'
  ) || ')' AS GOBC,

  CASE
    WHEN r."LOBCS" <> 0 AND r."LOBCH" = 0 THEN r."LOBCS"::TEXT
    ELSE r."LOBCH"::TEXT
  END || ' (' || COALESCE(
    (SELECT m.percentile FROM ${merit} m
     WHERE m.rank = CASE
       WHEN r."LOBCS" <> 0 AND r."LOBCH" = 0 THEN r."LOBCS"
       ELSE r."LOBCH"
     END LIMIT 1),'0'
  ) || ')' AS LOBC,

  /* ================= SEBC ================= */
  CASE
    WHEN r."GSEBCS" <> 0 AND r."GSEBCH" = 0 THEN r."GSEBCS"::TEXT
    ELSE r."GSEBCH"::TEXT
  END || ' (' || COALESCE(
    (SELECT m.percentile FROM ${merit} m
     WHERE m.rank = CASE
       WHEN r."GSEBCS" <> 0 AND r."GSEBCH" = 0 THEN r."GSEBCS"
       ELSE r."GSEBCH"
     END LIMIT 1),'0'
  ) || ')' AS GSEBC,

  CASE
    WHEN r."LSEBCS" <> 0 AND r."LSEBCH" = 0 THEN r."LSEBCS"::TEXT
    ELSE r."LSEBCH"::TEXT
  END || ' (' || COALESCE(
    (SELECT m.percentile FROM ${merit} m
     WHERE m.rank = CASE
       WHEN r."LSEBCS" <> 0 AND r."LSEBCH" = 0 THEN r."LSEBCS"
       ELSE r."LSEBCH"
     END LIMIT 1),'0'
  ) || ')' AS LSEBC,

  /* ================= SC / ST ================= */
  CASE
    WHEN r."GSCS" <> 0 AND r."GSCH" = 0 THEN r."GSCS"::TEXT
    ELSE r."GSCH"::TEXT
  END || ' (' || COALESCE(
    (SELECT m.percentile FROM ${merit} m
     WHERE m.rank = CASE
       WHEN r."GSCS" <> 0 AND r."GSCH" = 0 THEN r."GSCS"
       ELSE r."GSCH"
     END LIMIT 1),'0'
  ) || ')' AS GSC,

  CASE
    WHEN r."LSCS" <> 0 AND r."LSCH" = 0 THEN r."LSCS"::TEXT
    ELSE r."LSCH"::TEXT
  END || ' (' || COALESCE(
    (SELECT m.percentile FROM ${merit} m
     WHERE m.rank = CASE
       WHEN r."LSCS" <> 0 AND r."LSCH" = 0 THEN r."LSCS"
       ELSE r."LSCH"
     END LIMIT 1),'0'
  ) || ')' AS LSC,

  CASE
    WHEN r."GSTS" <> 0 AND r."GSTH" = 0 THEN r."GSTS"::TEXT
    ELSE r."GSTH"::TEXT
  END || ' (' || COALESCE(
    (SELECT m.percentile FROM ${merit} m
     WHERE m.rank = CASE
       WHEN r."GSTS" <> 0 AND r."GSTH" = 0 THEN r."GSTS"
       ELSE r."GSTH"
     END LIMIT 1),'0'
  ) || ')' AS GST,

  CASE
    WHEN r."LSTS" <> 0 AND r."LSTH" = 0 THEN r."LSTS"::TEXT
    ELSE r."LSTH"::TEXT
  END || ' (' || COALESCE(
    (SELECT m.percentile FROM ${merit} m
     WHERE m.rank = CASE
       WHEN r."LSTS" <> 0 AND r."LSTH" = 0 THEN r."LSTS"
       ELSE r."LSTH"
     END LIMIT 1),'0'
  ) || ')' AS LST,

  /* ================= NT ================= */
  CASE
    WHEN r."GNT1S" <> 0 AND r."GNT1H" = 0 THEN r."GNT1S"::TEXT
    ELSE r."GNT1H"::TEXT
  END || ' (' || COALESCE(
    (SELECT m.percentile FROM ${merit} m
     WHERE m.rank = CASE
       WHEN r."GNT1S" <> 0 AND r."GNT1H" = 0 THEN r."GNT1S"
       ELSE r."GNT1H"
     END LIMIT 1),'0'
  ) || ')' AS GNT1,

  CASE
    WHEN r."LNT1S" <> 0 AND r."LNT1H" = 0 THEN r."LNT1S"::TEXT
    ELSE r."LNT1H"::TEXT
  END || ' (' || COALESCE(
    (SELECT m.percentile FROM ${merit} m
     WHERE m.rank = CASE
       WHEN r."LNT1S" <> 0 AND r."LNT1H" = 0 THEN r."LNT1S"
       ELSE r."LNT1H"
     END LIMIT 1),'0'
  ) || ')' AS LNT1,

  CASE
    WHEN r."GNT2S" <> 0 AND r."GNT2H" = 0 THEN r."GNT2S"::TEXT
    ELSE r."GNT2H"::TEXT
  END || ' (' || COALESCE(
    (SELECT m.percentile FROM ${merit} m
     WHERE m.rank = CASE
       WHEN r."GNT2S" <> 0 AND r."GNT2H" = 0 THEN r."GNT2S"
       ELSE r."GNT2H"
     END LIMIT 1),'0'
  ) || ')' AS GNT2,

  CASE
    WHEN r."LNT2S" <> 0 AND r."LNT2H" = 0 THEN r."LNT2S"::TEXT
    ELSE r."LNT2H"::TEXT
  END || ' (' || COALESCE(
    (SELECT m.percentile FROM ${merit} m
     WHERE m.rank = CASE
       WHEN r."LNT2S" <> 0 AND r."LNT2H" = 0 THEN r."LNT2S"
       ELSE r."LNT2H"
     END LIMIT 1),'0'
  ) || ')' AS LNT2,

  CASE
    WHEN r."GNT3S" <> 0 AND r."GNT3H" = 0 THEN r."GNT3S"::TEXT
    ELSE r."GNT3H"::TEXT
  END || ' (' || COALESCE(
    (SELECT m.percentile FROM ${merit} m
     WHERE m.rank = CASE
       WHEN r."GNT3S" <> 0 AND r."GNT3H" = 0 THEN r."GNT3S"
       ELSE r."GNT3H"
     END LIMIT 1),'0'
  ) || ')' AS GNT3,

  CASE
    WHEN r."LNT3S" <> 0 AND r."LNT3H" = 0 THEN r."LNT3S"::TEXT
    ELSE r."LNT3H"::TEXT
  END || ' (' || COALESCE(
    (SELECT m.percentile FROM ${merit} m
     WHERE m.rank = CASE
       WHEN r."LNT3S" <> 0 AND r."LNT3H" = 0 THEN r."LNT3S"
       ELSE r."LNT3H"
     END LIMIT 1),'0'
  ) || ')' AS LNT3,

  /* ================= VJ / PWD / DEF / ORPHAN ================= */
  CASE
    WHEN r."GVJS" <> 0 AND r."GVJH" = 0 THEN r."GVJS"::TEXT
    ELSE r."GVJH"::TEXT
  END || ' (' || COALESCE((SELECT m.percentile FROM ${merit} m WHERE m.rank =
      CASE WHEN r."GVJS" <> 0 AND r."GVJH" = 0 THEN r."GVJS" ELSE r."GVJH" END
  LIMIT 1),'0') || ')' AS GVJ,

  CASE
    WHEN r."LVJS" <> 0 AND r."LVJH" = 0 THEN r."LVJS"::TEXT
    ELSE r."LVJH"::TEXT
  END || ' (' || COALESCE((SELECT m.percentile FROM ${merit} m WHERE m.rank =
      CASE WHEN r."LVJS" <> 0 AND r."LVJH" = 0 THEN r."LVJS" ELSE r."LVJH" END
  LIMIT 1),'0') || ')' AS LVJ,

  r."PWDOPENS" || ' (' || COALESCE((SELECT m.percentile FROM ${merit} m WHERE m.rank = r."PWDOPENS" LIMIT 1),'0') || ')' AS PWD,
  r."DEFOPENS" || ' (' || COALESCE((SELECT m.percentile FROM ${merit} m WHERE m.rank = r."DEFOPENS" LIMIT 1),'0') || ')' AS DEF,
  r."ORPHAN"   || ' (' || COALESCE((SELECT m.percentile FROM ${merit} m WHERE m.rank = r."ORPHAN" LIMIT 1),'0') || ')' AS ORPHAN,

  /* ================= AI ================= */
  COALESCE(
    (
      SELECT ${ai_round_rank} || ' (' || ${ai_round_per} || ')'
      FROM ${ai_table_name}
      WHERE branch_code = r.branch_code
        AND college_code = r.college_code
      LIMIT 1
    ),
    '0 (0)'
  ) AS AI,
  
  r."EWS" || ' (' || COALESCE((SELECT m.percentile FROM ${merit} AS m WHERE m.rank = r."EWS" LIMIT 1), '0') || ')' AS EWS,
  r."TFWS" || ' (' || COALESCE((SELECT m.percentile FROM ${merit} AS m WHERE m.rank = r."TFWS" LIMIT 1), '0') || ')' AS TFWS


  `;
}

router.post('/collegeBranchCutoffInfo', async (req, res) => {
  const { college_code, year, round } = req.body;

  let cap_table_name = '';
  let college_info_table_name = '';
  let branch_info_table_name = '';

  const filters = college_branch_info_helper(year, round);

  if (year === 2025) {
    cap_table_name = 'MH_2025_26_CAP_';
    college_info_table_name = 'College_info_2025_26';
    branch_info_table_name = 'Branch_info_2025_26';
  } else {
    cap_table_name = 'MH_2024_25_CAP_';
    college_info_table_name = 'College_info_2024_25';
    branch_info_table_name = 'Branch_info_2024_25';
  }

  if (round === 1) cap_table_name += '1';
  else if (round === 2) cap_table_name += '2';
  else if (round === 3) cap_table_name += '3';
  else cap_table_name += '4';

  try {
    const { data, error } = await supabase.rpc('collegebranchcutoffinfo', {
      college_code_input: college_code,
      cap_table_name,
      college_info_table_name,
      branch_info_table_name,
      filters
    });

    if (error) {
      return res.status(500).json({ error: 'Database error' });
    }

    res.json(data);

  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});


router.post('/collegeSeatMatrix', async (req, res) => {
  const { college_code } = req.body;

  try {
    const { data, error } = await supabase.rpc('collegeseatmatrix', {
      college_code_input: college_code
    });

    if (error) {
      return res.status(500).json({ error: 'Database error' });
    }

    res.json(data);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});


module.exports = router;
