module.exports = async function handler(req, res) {

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    var a = req.body || {};

    console.log('Token set:', !!process.env.AIRTABLE_TOKEN);
    console.log('Base set:', !!process.env.AIRTABLE_BASE_ID);
    console.log('Body:', JSON.stringify(a));

    var fields = {
      'Need': a.need || '',
      'Priority': a.priority || '',
      'Feeling': a.feeling || '',
      'Life Event': (a.change || []).join(', '),
      'Location': a.location || '',
      'Remote Meeting': a.remote ? true : false,
      'Amount': a.amount || '',
      'Meeting Preference': a.meeting || '',
      'Affiliate URL Generated': a.affiliateUrl || '',
      'Source': a.source || 'Unbiased',
      'Completed': true
    };

    console.log('Fields:', JSON.stringify(fields));

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
    console.log('Airtable status:', response.status);
    console.log('Airtable body:', text);

    if (!response.ok) {
      return res.status(500).json({ error: 'Airtable failed', detail: text });
    }

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error('Error:', err.message);
