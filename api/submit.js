module.exports = async function handler(req, res) {

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    var fields = {
      'Need': 'Test submission',
      'Location': 'London'
    };

    var url = 'https://api.airtable.com/v0/' + process.env.AIRTABLE_BASE_ID + '/Questionnaire%20Submissions';

    var response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + process.env.AIRTABLE_TOKEN,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ fields: fields })
    });

    var text = await response.text();

    return res.status(200).json({
      airtableStatus: response.status,
      airtableResponse: text,
      tokenFirst10: (process.env.AIRTABLE_TOKEN || '').substring(0,10),
      baseId: process.env.AIRTABLE_BASE_ID || 'NOT SET'
    });

  } catch (err) {
    return res.status(200).json({ error: err.message });
  }
};
