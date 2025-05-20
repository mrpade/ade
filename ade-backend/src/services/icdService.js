const axios = require('axios');

// Base URL for ICD-11 MMS API
const ICD_BASE_URL = 'https://id.who.int/icd/release/11/2022-02/mms';

/**
 * Search ICD-11 by symptom term
 * @param {string} term - symptom to search
 * @returns {Promise<Array<{code:string, title:string}>>}
 */
async function searchSymptoms(term) {
  const response = await axios.get(`${ICD_BASE_URL}/search`, {
    params: { q: term },
    headers: { 'Accept-Language': 'fr' } // request French labels
  });
  return Array.isArray(response.data.matches)
    ? response.data.matches.map(item => ({
        code: item.code,
        title: item.prefLabel
      }))
    : [];
}