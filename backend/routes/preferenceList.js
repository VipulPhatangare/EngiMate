const express = require('express')
const router = express.Router()
const supabase = require('../utils/supabase')

// http://localhost:5000/api/preferenceList

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


function clear_new_data_function() {
    new_data_of_student.caste_name = '';
    new_data_of_student.caste_Column_H = '';
    new_data_of_student.caste_Column_S = '';
    new_data_of_student.caste_Column_O = '';
    new_data_of_student.specialReservation = '';
}

function getCasteColumns(caste, gender) {

    const prefix = gender === 'Female' ? 'L' : 'G';

    new_data_of_student.caste_Column_H = `r.${prefix}${caste}H`;
    new_data_of_student.caste_Column_S = `r.${prefix}${caste}S`;
    new_data_of_student.caste_name = `${prefix}${caste}`;

    if(caste === 'EWS'){
        new_data_of_student.caste_Column_H = `r.${caste}`;
        new_data_of_student.caste_Column_H = `r.${caste}`;
        new_data_of_student.caste_Column_H = `r.${caste}`;
        new_data_of_student.caste_name = `${caste}`;

    }
}

const new_data_of_student = {
    caste_name : '',
    caste_Column_S: '',
    caste_Column_H: '',
    specialReservation: '',
    minRank : 0,
    maxRank : 0,
    minRankai : 0,
    maxRankai : 0,
    rank: 0,
    selected_branches_code : []
};

async function getCollegesHelper(formData) {
    let caste_column = '';
    let caste_condition = '';

    // EWS
    if (formData.caste == 'EWS') {
        caste_column += `
            r."EWS" || ' (' || COALESCE((SELECT m.percentile FROM merit_list_2025_26 AS m WHERE m.rank = r."EWS" LIMIT 1), '0') || ')' AS ews,
        `;
        caste_condition += `
            (r."EWS" BETWEEN ${new_data_of_student.minRank} AND ${new_data_of_student.maxRank} OR r."EWS" = 0)
            AND
        `;
    }else{
        caste_column += `
            NULL::TEXT AS ews,
        `;
        caste_condition += `
            TRUE AND
        `;
    }

    //  TFWS
    if (formData.tfws) {
        caste_column += `
            r."TFWS" || ' (' || COALESCE((SELECT m.percentile FROM merit_list_2025_26 AS m WHERE m.rank = r."TFWS" LIMIT 1), '0') || ')' AS def,
        `;
        caste_condition += `
            (r."TFWS" BETWEEN ${new_data_of_student.minRank} AND ${new_data_of_student.maxRank} OR r."TFWS" = 0)
            AND
        `;
    }else{
        caste_column += `
            NULL::TEXT AS tfws,
        `;
        caste_condition += `
            TRUE AND
        `;
    }
    
    // LOPEN
    if (formData.gender == 'Female') {
        caste_column += `
            CASE
                WHEN r."LOPENS" <> 0 AND r."LOPENH" = 0 THEN r."LOPENS"::TEXT
                ELSE r."LOPENH"::TEXT
            
            END || ' (' || COALESCE(
                        (SELECT m.percentile 
                         FROM merit_list_2025_26 AS m 
                         WHERE m.rank = 
                            CASE
                                WHEN r."LOPENS" <> 0 AND r."LOPENH" = 0 THEN r."LOPENS"
                                ELSE r."LOPENH"
                            END
                         LIMIT 1), '0'
                    ) || ')' AS lopen,
        `;

        caste_condition += `
            (
                CASE 
                    WHEN r."LOPENS" <> 0 AND r."LOPENH" = 0 THEN r."LOPENS"
                    ELSE r."LOPENH"
                    
                END BETWEEN ${new_data_of_student.minRank} AND ${new_data_of_student.maxRank}
                OR 
                CASE 
                    WHEN r."LOPENS" <> 0 AND r."LOPENH" = 0 THEN r."LOPENS"
                    ELSE r."LOPENH"
                END = 0
            ) AND
        `;
    }else{
        caste_column += `
            NULL::TEXT AS lopen,
        `;
        caste_condition += `
            TRUE AND
        `;
    } 

    // GOBC
    if (formData.caste == 'OBC' && formData.gender == 'Male') {
        caste_column += `
            CASE
                WHEN r."GOBCS" <> 0 AND r."GOBCH" = 0 THEN r."GOBCS"::TEXT
                ELSE r."GOBCH"::TEXT
            END || ' (' || COALESCE(
                        (SELECT m.percentile 
                         FROM merit_list_2025_26 AS m 
                         WHERE m.rank = 
                             CASE
                                 WHEN r."GOBCS" <> 0 AND r."GOBCH" = 0 THEN r."GOBCS"
                                 ELSE r."GOBCH"
                             END
                         LIMIT 1), '0'
                    ) || ')' AS gobc,
        `;

        caste_condition += `
            (
                CASE 
                    WHEN r."GOBCS" <> 0 AND r."GOBCH" = 0 THEN r."GOBCS"
                    ELSE r."GOBCH"
                END BETWEEN ${new_data_of_student.minRank} AND ${new_data_of_student.maxRank}
                OR 
                CASE 
                    WHEN r."GOBCS" <> 0 AND r."GOBCH" = 0 THEN r."GOBCS"
                    ELSE r."GOBCH"
                END = 0
            ) AND
        `;
    }else{
        caste_column += `
            NULL::TEXT AS gobc,
        `;
        caste_condition += `
            TRUE AND
        `;
    } 

    // LOBC
    if (formData.caste == 'OBC' && formData.gender == 'Female') {
        caste_column += `
            CASE
                WHEN r."LOBCS" <> 0 AND r."LOBCH" = 0 THEN r."LOBCS"::TEXT
                ELSE r."LOBCH"::TEXT
            END || ' (' || COALESCE(
                        (SELECT m.percentile 
                         FROM merit_list_2025_26 AS m 
                         WHERE m.rank = 
                             CASE
                                 WHEN r."LOBCS" <> 0 AND r."LOBCH" = 0 THEN r."LOBCS"
                                 ELSE r."LOBCH"
                             END
                         LIMIT 1), '0'
                    ) || ')' AS lobc,
        `;

        caste_condition += `
            (
                CASE 
                    WHEN r."LOBCS" <> 0 AND r."LOBCH" = 0 THEN r."LOBCS"
                    ELSE r."LOBCH"
                END BETWEEN ${new_data_of_student.minRank} AND ${new_data_of_student.maxRank}
                OR 
                CASE 
                    WHEN r."LOBCS" <> 0 AND r."LOBCH" = 0 THEN r."LOBCS"
                    ELSE r."LOBCH"
                END = 0
            ) AND
        `;
    }else{
        caste_column += `
            NULL::TEXT AS lobc,
        `;
        caste_condition += `
            TRUE AND
        `;
    } 

    // GSEBC
    if (formData.caste == 'SEBC' && formData.gender == 'Male') {
        caste_column += `
            CASE
                WHEN r."GSEBCS" <> 0 AND r."GSEBCH" = 0 THEN r."GSEBCS"::TEXT
                ELSE r."GSEBCH"::TEXT
            END || ' (' || COALESCE(
                        (SELECT m.percentile 
                         FROM merit_list_2025_26 AS m 
                         WHERE m.rank = 
                             CASE
                                 WHEN r."GSEBCS" <> 0 AND r."GSEBCH" = 0 THEN r."GSEBCS"
                                 ELSE r."GSEBCH"
                             END
                         LIMIT 1), '0'
                    ) || ')' AS gsebc,
        `;

        caste_condition += `
            (
                CASE 
                    WHEN r."GSEBCS" <> 0 AND r."GSEBCH" = 0 THEN r."GSEBCS"
                    ELSE r."GSEBCH"
                END BETWEEN ${new_data_of_student.minRank} AND ${new_data_of_student.maxRank}
                OR 
                CASE 
                    WHEN r."GSEBCS" <> 0 AND r."GSEBCH" = 0 THEN r."GSEBCS"
                    ELSE r."GSEBCH"
                END = 0
            ) AND
        `;
    }else{
        caste_column += `
            NULL::TEXT AS gsebc,
        `;
        caste_condition += `
            TRUE AND
        `;
    }

    // LSEBC 
    if (formData.caste == 'SEBC' && formData.gender == 'Female') {
        caste_column += `
            CASE
                WHEN r."LSEBCS" <> 0 AND r."LSEBCH" = 0 THEN r."LSEBCS"::TEXT
                ELSE r."LSEBCH"::TEXT
            END || ' (' || COALESCE(
                        (SELECT m.percentile 
                         FROM merit_list_2025_26 AS m 
                         WHERE m.rank = 
                             CASE
                                 WHEN r."LSEBCS" <> 0 AND r."LSEBCH" = 0 THEN r."LSEBCS"
                                 ELSE r."LSEBCH"
                             END
                         LIMIT 1), '0'
                    ) || ')' AS lsebc,
        `;

        caste_condition += `
            (
                CASE 
                    WHEN r."LSEBCS" <> 0 AND r."LSEBCH" = 0 THEN r."LSEBCS"
                    ELSE r."LSEBCH"
                END BETWEEN ${new_data_of_student.minRank} AND ${new_data_of_student.maxRank}
                OR 
                CASE 
                    WHEN r."LSEBCS" <> 0 AND r."LSEBCH" = 0 THEN r."LSEBCS"
                    ELSE r."LSEBCH"
                END = 0
            ) AND
        `;
    }else{
        caste_column += `
            NULL::TEXT AS lsebc,
        `;
        caste_condition += `
            TRUE AND
        `;
    }

    // GST
    if (formData.caste == 'ST' && formData.gender == 'Male') {
        caste_column += `
            CASE
                WHEN r."GSTS" <> 0 AND r."GSTH" = 0 THEN r."GSTS"::TEXT
                ELSE r."GSTH"::TEXT
            END || ' (' || COALESCE(
                        (SELECT m.percentile 
                         FROM merit_list_2025_26 AS m 
                         WHERE m.rank = 
                             CASE
                                 WHEN r."GSTS" <> 0 AND r."GSTH" = 0 THEN r."GSTS"
                                 ELSE r."GSTH"
                             END
                         LIMIT 1), '0'
                    ) || ')' AS gst,
        `;

        caste_condition += `
            (
                CASE 
                    WHEN r."GSTS" <> 0 AND r."GSTH" = 0 THEN r."GSTS"
                    ELSE r."GSTH"
                END BETWEEN ${new_data_of_student.minRank} AND ${new_data_of_student.maxRank}
                OR 
                CASE 
                    WHEN r."GSTS" <> 0 AND r."GSTH" = 0 THEN r."GSTS"
                    ELSE r."GSTH"
                END = 0
            ) AND
        `;
    }else{
        caste_column += `
            NULL::TEXT AS gst,
        `;
        caste_condition += `
            TRUE AND
        `;
    }
    
    // LST
    if (formData.caste == 'ST' && formData.gender == 'Female') {
        caste_column += `
            CASE
                WHEN r."LSTS" <> 0 AND r."LSTH" = 0 THEN r."LSTS"::TEXT
                ELSE r."LSTH"::TEXT
            END || ' (' || COALESCE(
                        (SELECT m.percentile 
                         FROM merit_list_2025_26 AS m 
                         WHERE m.rank = 
                             CASE
                                 WHEN r."LSTS" <> 0 AND r."LSTH" = 0 THEN r."LSTS"
                                 ELSE r."LSTH"
                             END
                         LIMIT 1), '0'
                    ) || ')' AS lst,
        `;

        caste_condition += `
            (
                CASE 
                    WHEN r."LSTS" <> 0 AND r."LSTH" = 0 THEN r."LSTS"
                    ELSE r."LSTH"
                END BETWEEN ${new_data_of_student.minRank} AND ${new_data_of_student.maxRank}
                OR 
                CASE 
                    WHEN r."LSTS" <> 0 AND r."LSTH" = 0 THEN r."LSTS"
                    ELSE r."LSTH"
                END = 0
            ) AND
        `;
    }else{
        caste_column += `
            NULL::TEXT AS lst,
        `;
        caste_condition += `
            TRUE AND
        `;
    }

    // GSC
    if (formData.caste == 'SC' && formData.gender == 'Male') {
        caste_column += `
            CASE
                WHEN r."GSCS" <> 0 AND r."GSCH" = 0 THEN r."GSCS"::TEXT
                ELSE r."GSCH"::TEXT
            END || ' (' || COALESCE(
                        (SELECT m.percentile 
                         FROM merit_list_2025_26 AS m 
                         WHERE m.rank = 
                             CASE
                                 WHEN r."GSCS" <> 0 AND r."GSCH" = 0 THEN r."GSCS"
                                 ELSE r."GSCH"
                             END
                         LIMIT 1), '0'
                    ) || ')' AS gsc,
        `;

        caste_condition += `
            (
                CASE 
                    WHEN r."GSCS" <> 0 AND r."GSCH" = 0 THEN r."GSCS"
                    ELSE r."GSCH"
                END BETWEEN ${new_data_of_student.minRank} AND ${new_data_of_student.maxRank}
                OR 
                CASE 
                    WHEN r."GSCS" <> 0 AND r."GSCH" = 0 THEN r."GSCS"
                    ELSE r."GSCH"
                END = 0
            ) AND
        `;
    }else{
        caste_column += `
            NULL::TEXT AS gsc,
        `;
        caste_condition += `
            TRUE AND
        `;
    }

    // LSC
    if (formData.caste == 'SC' && formData.gender == 'Female') {
        caste_column += `
            CASE
                WHEN r."LSCS" <> 0 AND r."LSCH" = 0 THEN r."LSCS"::TEXT
                ELSE r."LSCH"::TEXT
            END || ' (' || COALESCE(
                        (SELECT m.percentile 
                         FROM merit_list_2025_26 AS m 
                         WHERE m.rank = 
                             CASE
                                 WHEN r."LSCS" <> 0 AND r."LSCH" = 0 THEN r."LSCS"
                                 ELSE r."LSCH"
                             END
                         LIMIT 1), '0'
                    ) || ')' AS lsc,
        `;

        caste_condition += `
            (
                CASE 
                    WHEN r."LSCS" <> 0 AND r."LSCH" = 0 THEN r."LSCS"
                    ELSE r."LSCH"
                END BETWEEN ${new_data_of_student.minRank} AND ${new_data_of_student.maxRank}
                OR 
                CASE 
                    WHEN r."LSCS" <> 0 AND r."LSCH" = 0 THEN r."LSCS"
                    ELSE r."LSCH"
                END = 0
            ) AND
        `;
    }else{
        caste_column += `
            NULL::TEXT AS lsc,
        `;
        caste_condition += `
            TRUE AND
        `;
    }

    // GNT1
    if (formData.caste == 'NT1' && formData.gender == 'Male') {
        caste_column += `
            CASE
                WHEN r."GNT1S" <> 0 AND r."GNT1H" = 0 THEN r."GNT1S"::TEXT
                ELSE r."GNT1H"::TEXT
            END || ' (' || COALESCE(
                        (SELECT m.percentile 
                         FROM merit_list_2025_26 AS m 
                         WHERE m.rank = 
                             CASE
                                 WHEN r."GNT1S" <> 0 AND r."GNT1H" = 0 THEN r."GNT1S"
                                 ELSE r."GNT1H"
                             END
                         LIMIT 1), '0'
                    ) || ')' AS gnt1,
        `;

        caste_condition += `
            (
                CASE 
                    WHEN r."GNT1S" <> 0 AND r."GNT1H" = 0 THEN r."GNT1S"
                    ELSE r."GNT1H"
                END BETWEEN ${new_data_of_student.minRank} AND ${new_data_of_student.maxRank}
                OR 
                CASE 
                    WHEN r."GNT1S" <> 0 AND r."GNT1H" = 0 THEN r."GNT1S"
                    ELSE r."GNT1H"
                END = 0
            ) AND
        `;
    }else{
        caste_column += `
            NULL::TEXT AS gnt1,
        `;
        caste_condition += `
            TRUE AND
        `;
    }

    // LNT1
    if (formData.caste == 'NT1' && formData.gender == 'Female') {
        caste_column += `
            CASE
                WHEN r."LNT1S" <> 0 AND r."LNT1H" = 0 THEN r."LNT1S"::TEXT
                ELSE r."LNT1H"::TEXT
            END || ' (' || COALESCE(
                        (SELECT m.percentile 
                         FROM merit_list_2025_26 AS m 
                         WHERE m.rank = 
                             CASE
                                 WHEN r."LNT1S" <> 0 AND r."LNT1H" = 0 THEN r."LNT1S"
                                 ELSE r."LNT1H"
                             END
                         LIMIT 1), '0'
                    ) || ')' AS lnt1,
        `;

        caste_condition += `
            (
                CASE 
                    WHEN r."LNT1S" <> 0 AND r."LNT1H" = 0 THEN r."LNT1S"
                    ELSE r."LNT1H"
                END BETWEEN ${new_data_of_student.minRank} AND ${new_data_of_student.maxRank}
                OR 
                CASE 
                    WHEN r."LNT1S" <> 0 AND r."LNT1H" = 0 THEN r."LNT1S"
                    ELSE r."LNT1H"
                END = 0
            ) AND
        `;
    }else{
        caste_column += `
            NULL::TEXT AS lnt1,
        `;
        caste_condition += `
            TRUE AND
        `;
    }

    // GNT2
    if (formData.caste == 'NT2' && formData.gender == 'Male') {
        caste_column += `
            CASE
                WHEN r."GNT2S" <> 0 AND r."GNT2H" = 0 THEN r."GNT2S"::TEXT
                ELSE r."GNT2H"::TEXT
            END || ' (' || COALESCE(
                        (SELECT m.percentile 
                         FROM merit_list_2025_26 AS m 
                         WHERE m.rank = 
                             CASE
                                 WHEN r."GNT2S" <> 0 AND r."GNT2H" = 0 THEN r."GNT2S"
                                 ELSE r."GNT2H"
                             END
                         LIMIT 1), '0'
                    ) || ')' AS gnt2,
        `;

        caste_condition += `
            (
                CASE 
                    WHEN r."GNT2S" <> 0 AND r."GNT2H" = 0 THEN r."GNT2S"
                    ELSE r."GNT2H"
                END BETWEEN ${new_data_of_student.minRank} AND ${new_data_of_student.maxRank}
                OR 
                CASE 
                    WHEN r."GNT2S" <> 0 AND r."GNT2H" = 0 THEN r."GNT2S"
                    ELSE r."GNT2H"
                END = 0
            ) AND
        `;
    }else{
        caste_column += `
            NULL::TEXT AS gnt2,
        `;
        caste_condition += `
            TRUE AND
        `;
    }

    // LNT2
    if (formData.caste == 'NT2' && formData.gender == 'Female') {
        caste_column += `
            CASE
                WHEN r."LNT2S" <> 0 AND r."LNT2H" = 0 THEN r."LNT2S"::TEXT
                ELSE r."LNT2H"::TEXT
            END || ' (' || COALESCE(
                        (SELECT m.percentile 
                         FROM merit_list_2025_26 AS m 
                         WHERE m.rank = 
                             CASE
                                 WHEN r."LNT2S" <> 0 AND r."LNT2H" = 0 THEN r."LNT2S"
                                 ELSE r."LNT2H"
                             END
                         LIMIT 1), '0'
                    ) || ')' AS lnt2,
        `;

        caste_condition += `
            (
                CASE 
                    WHEN r."LNT2S" <> 0 AND r."LNT2H" = 0 THEN r."LNT2S"
                    ELSE r."LNT2H"
                END BETWEEN ${new_data_of_student.minRank} AND ${new_data_of_student.maxRank}
                OR 
                CASE 
                    WHEN r."LNT2S" <> 0 AND r."LNT2H" = 0 THEN r."LNT2S"
                    ELSE r."LNT2H"
                END = 0
            ) AND
        `;
    }else{
        caste_column += `
            NULL::TEXT AS lnt2,
        `;
        caste_condition += `
            TRUE AND
        `;
    }

    // GNT3
    if (formData.caste == 'NT3' && formData.gender == 'Male') {
        caste_column += `
            CASE
                WHEN r."GNT3S" <> 0 AND r."GNT3H" = 0 THEN r."GNT3S"::TEXT
                ELSE r."GNT3H"::TEXT
            END || ' (' || COALESCE(
                        (SELECT m.percentile 
                         FROM merit_list_2025_26 AS m 
                         WHERE m.rank = 
                             CASE
                                 WHEN r."GNT3S" <> 0 AND r."GNT3H" = 0 THEN r."GNT3S"
                                 ELSE r."GNT3H"
                             END
                         LIMIT 1), '0'
                    ) || ')' AS gnt3,
        `;

        caste_condition += `
            (
                CASE 
                    WHEN r."GNT3S" <> 0 AND r."GNT3H" = 0 THEN r."GNT3S"
                    ELSE r."GNT3H"
                END BETWEEN ${new_data_of_student.minRank} AND ${new_data_of_student.maxRank}
                OR 
                CASE 
                    WHEN r."GNT3S" <> 0 AND r."GNT3H" = 0 THEN r."GNT3S"
                    ELSE r."GNT3H"
                END = 0
            ) AND
        `;
    }else{
        caste_column += `
            NULL::TEXT AS gnt3,
        `;
        caste_condition += `
            TRUE AND
        `;
    }

    // LNT3
    if (formData.caste == 'NT3' && formData.gender == 'Female') {
        caste_column += `
            CASE
                WHEN r."LNT3S" <> 0 AND r."LNT3H" = 0 THEN r."LNT3S"::TEXT
                ELSE r."LNT3H"::TEXT
            END || ' (' || COALESCE(
                        (SELECT m.percentile 
                         FROM merit_list_2025_26 AS m 
                         WHERE m.rank = 
                             CASE
                                 WHEN r."LNT3S" <> 0 AND r."LNT3H" = 0 THEN r."LNT3S"
                                 ELSE r."LNT3H"
                             END
                         LIMIT 1), '0'
                    ) || ')' AS lnt3,
        `;

        caste_condition += `
            (
                CASE 
                    WHEN r."LNT3S" <> 0 AND r."LNT3H" = 0 THEN r."LNT3S"
                    ELSE r."LNT3H"
                END BETWEEN ${new_data_of_student.minRank} AND ${new_data_of_student.maxRank}
                OR 
                CASE 
                    WHEN r."LNT3S" <> 0 AND r."LNT3H" = 0 THEN r."LNT3S"
                    ELSE r."LNT3H"
                END = 0
            ) AND
        `;
    }else{
        caste_column += `
            NULL::TEXT AS lnt3,
        `;
        caste_condition += `
            TRUE AND
        `;
    }

    // GVJ
    if (formData.caste == 'VJ' && formData.gender == 'Male') {
        caste_column += `
            CASE
                WHEN r."GVJS" <> 0 AND r."GVJH" = 0 THEN r."GVJS"::TEXT
                ELSE r."GVJH"::TEXT
            END || ' (' || COALESCE(
                        (SELECT m.percentile 
                         FROM merit_list_2025_26 AS m 
                         WHERE m.rank = 
                             CASE
                                 WHEN r."GVJS" <> 0 AND r."GVJH" = 0 THEN r."GVJS"
                                 ELSE r."GVJH"
                             END
                         LIMIT 1), '0'
                    ) || ')' AS gvj,
        `;

        caste_condition += `
            (
                CASE 
                    WHEN r."GVJS" <> 0 AND r."GVJH" = 0 THEN r."GVJS"
                    ELSE r."GVJH"
                END BETWEEN ${new_data_of_student.minRank} AND ${new_data_of_student.maxRank}
                OR 
                CASE 
                    WHEN r."GVJS" <> 0 AND r."GVJH" = 0 THEN r."GVJS"
                    ELSE r."GVJH"
                END = 0
            ) AND
        `;
    }else{
        caste_column += `
            NULL::TEXT AS gvj,
        `;
        caste_condition += `
            TRUE AND
        `;
    }


    // LVJ
    if (formData.caste == 'VJ' && formData.gender == 'Female') {
        caste_column += `
            CASE
                WHEN r."LVJS" <> 0 AND r."LVJH" = 0 THEN r."LVJS"::TEXT
                ELSE r."LVJH"::TEXT
            END || ' (' || COALESCE(
                        (SELECT m.percentile 
                         FROM merit_list_2025_26 AS m 
                         WHERE m.rank = 
                             CASE
                                 WHEN r."LVJS" <> 0 AND r."LVJH" = 0 THEN r."LVJS"
                                 ELSE r."LVJH"
                             END
                         LIMIT 1), '0'
                    ) || ')' AS lvj,
        `;

        caste_condition += `
            (
                CASE 
                    WHEN r."LVJS" <> 0 AND r."LVJH" = 0 THEN r."LVJS"
                    ELSE r."LVJH"
                END BETWEEN ${new_data_of_student.minRank} AND ${new_data_of_student.maxRank}
                OR 
                CASE 
                    WHEN r."LVJS" <> 0 AND r."LVJH" = 0 THEN r."LVJS"
                    ELSE r."LVJH"
                END = 0
            ) AND
        `;
    }else{
        caste_column += `
            NULL::TEXT AS lvj,
        `;
        caste_condition += `
            TRUE AND
        `;
    }


    // PWD
    if (formData.specialReservation == 'PWD') {
        caste_column += `
            CASE
                WHEN r."PWDOPENS" <> 0 AND r."PWDOPENH" = 0 THEN r."PWDOPENS"::TEXT
                ELSE r."PWDOPENH"::TEXT
            END || ' (' || COALESCE(
                        (SELECT m.percentile 
                         FROM merit_list_2025_26 AS m 
                         WHERE m.rank = 
                             CASE
                                 WHEN r."PWDOPENS" <> 0 AND r."PWDOPENH" = 0 THEN r."PWDOPENS"
                                 ELSE r."PWDOPENH"
                             END
                         LIMIT 1), '0'
                    ) || ')' AS pwd,
        `;

        caste_condition += `
            (
                (r."PWDOPENS" BETWEEN ${new_data_of_student.minRank} AND ${new_data_of_student.maxRank} OR r."PWDOPENS" = 0)
                OR (r."PWDOPENH" BETWEEN ${new_data_of_student.minRank} AND ${new_data_of_student.maxRank} OR r."PWDOPENH" = 0)  
            )
            AND 
        `;
    } else{
        caste_column += `
            NULL::TEXT AS pwd,
        `;
        caste_condition += `
            TRUE AND
        `;
    }
    
    // DEF
    if (formData.specialReservation == 'DEF') {
        caste_column += `
            r."DEFOPENS" || ' (' || COALESCE((SELECT m.percentile FROM merit_list_2025_26 AS m WHERE m.rank = r."DEFOPENS" LIMIT 1), '0') || ')' AS def,
        `;

        caste_condition += `
            (r."DEFOPENS" BETWEEN ${new_data_of_student.minRank} AND ${new_data_of_student.maxRank} OR r."DEFOPENS" = 0)
            AND
        `;
    }else{
        caste_column += `
            NULL::TEXT AS def,
        `;
        caste_condition += `
            TRUE AND
        `;
    }

    // ORPHAN
    if (formData.specialReservation == 'ORPHAN') {
        caste_column += `
            r."ORPHAN" || ' (' || COALESCE((SELECT m.percentile FROM merit_list_2025_26 AS m WHERE m.rank = r."ORPHAN" LIMIT 1), '0') || ')' AS orphan,
        `;
        caste_condition += `
            (r."ORPHAN" BETWEEN ${new_data_of_student.minRank} AND ${new_data_of_student.maxRank} OR r."ORPHAN" = 0)
            AND
        `;
    }else{
        caste_column += `
            NULL::TEXT AS orphan,
        `;
        caste_condition += `
            TRUE AND
        `;
    }

    if(formData.isAI){
        caste_column += `
            COALESCE(
                (SELECT 
                    CASE 
                        WHEN cap_1_rank != 0 THEN cap_1_rank || ' (' || cap_1_per || ')'
                        WHEN cap_2_rank != 0 THEN cap_2_rank || ' (' || cap_2_per || ')'
                        ELSE cap_2_rank || ' (' || cap_3_per || ')'
                    END
                 FROM "AI_2025_26_ALL_CAP" AS ai
                 WHERE ai.choice_code = r.choice_code
                 LIMIT 1),
                 '0 (0)'
            ) AS all_india`;
    }else{
        caste_column += `NULL::TEXT AS all_india`;
    }


    // console.log("Generated SQL:", caste_column);
    // console.log("caste condition", caste_condition);

    

    return { caste_column, caste_condition };

}

async function getCollegesMHT(formData){
    try {
        let { caste_column, caste_condition } = await getCollegesHelper(formData);
        
        // console.log(caste_column, caste_condition)
        const { data, error } = await supabase.rpc('collegepreferncelist', {
            caste_column: `${caste_column}`,
            caste_condition: `${caste_condition}`,
            maxrank: new_data_of_student.maxRank,
            minrank: new_data_of_student.minRank
        });

        let colleges = [];
        
        if(error){
            console.log(error);
            throw error;
        }else{
            colleges =  college_filter(data, formData);
            colleges.sort((a, b) => b.points - a.points);    
        }
        
        return {colleges, data};

    } catch (err) {
        console.error('Error in getColleges:', err);
        throw err;
    }

}

async function getCollegesMHTAI(formData){
    try {

        let { caste_column, caste_condition } = await getCollegesHelper(formData);
        
        // console.log(caste_column, caste_condition)
        const { data, error } = await supabase.rpc('collegepreferncelistmhtai', {
            minrank: new_data_of_student.minRankai,
            maxrank: new_data_of_student.maxRankai,
            caste_column: caste_column,
            caste_condition: caste_condition
        });

        let colleges = [];
        
        if(error){
            console.log(error);
            throw error;
        }else{
            colleges =  college_filter(data, formData);
            colleges.sort((a, b) => b.points - a.points);    
        }
        
        return colleges;

    } catch (err) {
        console.error('Error in getColleges:', err);
        throw err;
    }

}


function calculateProbabilityForJEE(aiPercentile, studentPercentile) {
    // For JEE, probability is based on percentile difference
    // Student percentile: 95.4562
    // Low (Hard to get): 96.4562 to 98.4562 (student + 1 to student + 3)
    // Medium: 94.9562 to 96.4562 (student - 0.5 to student + 1)
    // High: 85.4562 to 94.9562 (student - 10 to student - 0.5)
    
    const lowMin = studentPercentile + 1.0;     // 96.4562
    const lowMax = studentPercentile + 3.0;     // 98.4562
    const mediumMin = studentPercentile - 0.5;  // 94.9562
    const mediumMax = studentPercentile + 1.0;  // 96.4562
    const highMin = studentPercentile - 10.0;   // 85.4562
    const highMax = studentPercentile - 0.5;    // 94.9562

    if (aiPercentile >= lowMin && aiPercentile <= lowMax) {
        return 'Low';  // College cutoff is higher - harder to get admission
    } else if (aiPercentile >= mediumMin && aiPercentile < lowMin) {
        return 'Medium'; // College cutoff is close to student percentile
    } else if (aiPercentile >= highMin && aiPercentile < mediumMin) {
        return 'High'; // College cutoff is lower - easier to get admission
    } else {
        return 'N/A'; // Outside the range
    }
}

function calculateProbability(gopenRank, lopenRank, gender) {
    const rank = new_data_of_student.rank;
    const lowThreshold = rank * 0.75; // 25% below rank
    const mediumThreshold = rank * 1.10; // 10% above rank

    let rankToUse = gopenRank;

    // If GOPEN is 0 or null and gender is female, check LOPEN
    if ((gopenRank === 0 || gopenRank === '0' || !gopenRank) && gender === 'Female') {
        if (lopenRank && lopenRank !== 0 && lopenRank !== '0') {
            rankToUse = lopenRank;
        } else {
            return 'N/A';
        }
    } else if (gopenRank === 0 || gopenRank === '0' || !gopenRank) {
        return 'N/A';
    }

    const rankNum = typeof rankToUse === 'string' ? parseInt(rankToUse) : rankToUse;

    if (rankNum <= lowThreshold) {
        return 'Low';
    } else if (rankNum <= mediumThreshold) {
        return 'Medium';
    } else {
        return 'High';
    }
}

function college_filter_by_city(colleges, city){
    return colleges.filter(element =>  city.includes(element.city));
}

function college_filter_by_branch_category(colleges, branch_cat){
    // return colleges.filter(element => element.branch_category == branch_cat);
    return colleges.filter(element => branch_cat.includes(element.branch_category));
}

function college_filter(colleges, formData){

    if(formData.city[0] != 'All'){
        colleges = college_filter_by_city(colleges, formData.city);
    }

    // Handle branchCategory as array
    if(formData.branchCategory && Array.isArray(formData.branchCategory) && formData.branchCategory.length > 0) {
        if(formData.branchCategory[0] !== 'All') {
            colleges = colleges.filter(element => formData.branchCategory.includes(element.branch_category));
        }
    } else if(formData.branchCategory && formData.branchCategory !== 'All') {
        // Legacy support for single branchCategory string
        colleges = college_filter_by_branch_category(colleges, formData.branchCategory);
    }



    let college_list = [];

    colleges.forEach(element => {
        if(formData.gender == 'Female'){
            if(element.gopen !== '0 (0)' || element.lopen !== '0 (0)'){
                college_list.push(element);
            }
        }else{
            if(element.gopen !== '0 (0)'){
                if(element.Branch_type != 'F'){
                    college_list.push(element);
                }
            }
        }
    });

    return college_list;
};

router.post('/collegePreferenceList', async(req,res)=>{

    const formData = req.body;
    // console.log(formData);
    clear_new_data_function();

    try {
        
        new_data_of_student.rank = formData.generalRank;
        getCasteColumns(formData.caste, formData.gender);
        if(formData.specialReservation != 'No'){
            new_data_of_student.specialReservation = formData.specialReservation;
        }

        let allColleges = [];

        new_data_of_student.minRank = 1;
        new_data_of_student.maxRank = formData.generalRank; 
        if(formData.isAI){
            new_data_of_student.minRankai = 1;
            new_data_of_student.maxRankai = formData.aiRank; 
        }

        let collegeData = await getCollegesMHT(formData);

        let collegesMHTUP = collegeData.colleges;
        collegesMHTUP.sort((a, b) => a.points - b.points);
        
        allColleges = [...allColleges, ...collegeData.data];
        let collegesAIUP = [];
        if(formData.isAI){
            collegesAIUP = await getCollegesMHTAI(formData);
            collegesAIUP.sort((a, b) => a.points - b.points);
        }



        new_data_of_student.minRank = formData.generalRank;
        new_data_of_student.maxRank = 250000; 
        if(formData.isAI){
            new_data_of_student.minRankai = formData.aiRank;
            new_data_of_student.maxRankai = 300000; 
        }

        collegeData = await getCollegesMHT(formData);
        let collegesMHTDOWN = collegeData.colleges;
        collegesMHTDOWN.sort((a, b) => b.points - a.points);
        allColleges = [...allColleges, ...collegeData.data];

        let collegesAIDOWN = [];
        if(formData.isAI){
            collegesAIDOWN = await getCollegesMHTAI(formData);
            collegesAIDOWN.sort((a, b) => b.points - a.points);
        }

        let upLimit = 60;
        let downLimit = 90;
        
        if(collegesMHTUP.length >= upLimit && collegesMHTDOWN.length >= downLimit){
            collegesMHTUP = collegesMHTUP.slice(0, upLimit);
            collegesMHTDOWN = collegesMHTDOWN.slice(0, downLimit);
        }else if(collegesMHTUP.length < upLimit && collegesMHTDOWN.length > downLimit){
            collegesMHTDOWN = collegesMHTDOWN.slice(0, (downLimit+upLimit-collegesMHTUP.length));
        }else if(collegesMHTUP.length > upLimit && collegesMHTDOWN.length < downLimit){
            collegesMHTUP = collegesMHTUP.slice(0, (downLimit+upLimit-collegesMHTDOWN.length));
        }

        let colleges = [...collegesMHTDOWN, ...collegesMHTUP];

        if(formData.isAI){
            if(collegesAIUP.length >= upLimit && collegesAIDOWN.length >= downLimit){
                collegesAIUP = collegesAIUP.slice(0, upLimit);
                collegesAIDOWN = collegesAIDOWN.slice(0, downLimit);
            }else if(collegesAIUP.length < upLimit && collegesAIDOWN.length > downLimit){
                collegesAIDOWN = collegesAIDOWN.slice(0, (downLimit+upLimit-collegesAIUP.length));
            }else if(collegesAIUP.length > upLimit && collegesAIDOWN.length < downLimit){
                collegesAIUP = collegesAIUP.slice(0, (downLimit+upLimit-collegesAIDOWN.length));
            }

            colleges = [...colleges, ...collegesAIDOWN, ...collegesAIUP]
        }
        
        allColleges = [
            ...new Map(allColleges.map(item=>[item.choice_code, item])).values()
        ];

        allColleges.sort((a, b) => b.points - a.points);
        // console.log(allColleges.slice(0, 10));
        // console.log("all college length: ", allColleges.length);
        colleges = [
            ...new Map(colleges.map(item=>[item.choice_code, item])).values()
        ];

        

        // console.log('Total Colleges after merging:', colleges.length);
        // let colleges = colleges_1;
        // colleges.sort((a, b) => a.points - b.points);
        colleges.sort((a, b) => b.points - a.points);
        // console.log(colleges);
        colleges = colleges.slice(0,150);
        colleges = [...colleges, ...allColleges.slice(0, 10)];

        colleges = [
            ...new Map(colleges.map(item=>[item.choice_code, item])).values()
        ];

        colleges.sort((a, b) => b.points - a.points);

        console.log('Total Colleges after merging:', colleges.length);

        res.json({colleges, allColleges});

    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});


function college_filter_ai(colleges, formData){

    if(formData.city[0] != 'All'){
        colleges = college_filter_by_city(colleges, formData.city);
    }

    // Handle branchCategory as array
    if(formData.branchCategory && Array.isArray(formData.branchCategory) && formData.branchCategory.length > 0) {
        if(formData.branchCategory[0] !== 'All') {
            colleges = colleges.filter(element => formData.branchCategory.includes(element.branch_category));
        }
    } else if(formData.branchCategory && formData.branchCategory !== 'All') {
        // Legacy support for single branchCategory string
        colleges = college_filter_by_branch_category(colleges, formData.branchCategory);
    }

    if(formData.gender == 'Male'){
        colleges = colleges.filter(element=> element.branch_type != 'F');
    }

    // Add probability calculation for JEE colleges
    if(formData.percentile) {
        colleges = colleges.map(college => {
            if(college.aiper) {
                college.probability = calculateProbabilityForJEE(college.aiper, formData.percentile);
            }
            return college;
        });
    }

    return colleges;
};

async function getCollegesAi(minRank, maxRank, formData) {

    try {
        console.log('AI Query - minRank:', minRank, 'maxRank:', maxRank)
        const { data, error } = await supabase.rpc('collegepreferncelistai', {
            minrank: minRank,
            maxrank: maxRank
        });

        let colleges = [];
        // console.log(data);
        if(error){
            console.log(error);
            throw error;
        }else{
            colleges =  college_filter_ai(data, formData);
            colleges.sort((a, b) => b.points - a.points);    
        }
        
        return colleges;

    } catch (err) {
        console.error('Error in getColleges:', err);
        throw err;
    }
    
}

router.post('/collegePreferenceListAI', async(req,res)=>{

    try {

        const formData = req.body;
        // console.log(formData);
        clear_new_data_function();

        let collegesAIUP = await getCollegesAi(1, formData.aiRank, formData);
        let collegesAIDOWN = await getCollegesAi(formData.aiRank, 300000, formData);
        // console.log(collegesAIUP);


        let allColleges = [];
        allColleges = [...allColleges, ...collegesAIUP, ...collegesAIUP];
        allColleges = [
            ...new Map(allColleges.map(item=>[item.choice_code, item])).values()
        ];

        allColleges.sort((a, b) => b.points - a.points);


        let upLimit = 60;
        let downLimit = 90;
        let totalLimit = 150;
        
        let upTake = Math.min(upLimit, collegesAIUP.length);
        let downTake = Math.min(downLimit, collegesAIDOWN.length);
        
        // Adjust to reach 150 total if possible
        if (upTake + downTake < totalLimit) {
            // Can't reach 150, take all available
            upTake = collegesAIUP.length;
            downTake = collegesAIDOWN.length;
        } else if (upTake < upLimit) {
            // UP is short, take more from DOWN to reach 150
            downTake = Math.min(totalLimit - upTake, collegesAIDOWN.length);
        } else if (downTake < downLimit) {
            // DOWN is short, take more from UP to reach 150
            upTake = Math.min(totalLimit - downTake, collegesAIUP.length);
        }
        
        collegesAIUP = collegesAIUP.slice(0, upTake);
        collegesAIDOWN = collegesAIDOWN.slice(0, downTake);
        // console.log(collegesAIUP);
        console.log(`Taking ${upTake} from UP and ${downTake} from DOWN = ${upTake + downTake} total`);

        let colleges = [...collegesAIUP, ...collegesAIDOWN]
            
            
        colleges = [
            ...new Map(colleges.map(item=>[item.choice_code, item])).values()
        ];

        // console.log('Total Colleges after merging:', colleges.length);

        colleges.sort((a, b) => b.points - a.points);
        // console.log(colleges);
        colleges = colleges.slice(0,150);

        colleges = [...colleges, ...allColleges.slice(0, 10)];

        colleges = [
            ...new Map(colleges.map(item=>[item.choice_code, item])).values()
        ];

        // console.log('Total Colleges after merging:', colleges.length);

        colleges.sort((a, b) => b.points - a.points);

        console.log('Total Colleges after merging:', colleges.length);

        res.json({colleges, allColleges});
        
    } catch (error) {
        console.log(error);
        throw error;
    }
});

module.exports = router;