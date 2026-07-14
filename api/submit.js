// foundli — Airtable submission handler
// Runs on Vercel serverless — token never exposed to browser

module.exports = async function handler(req, res) {

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const answers = req.body || {};

    console.log('Received answers:', JSON.stringify(answers));
    console.log('AIRTABLE_TOKEN set:', !!process.env.AIRTABLE_TOKEN);
    console.log('AIRTABLE_BASE_ID set:', !!process.env.AIRTABLE_BASE_ID);

    const needLabels = {
      retirement: 'Plan for retirement',
      pension:    'Sort out my pension',
      invest:     'Invest my money',
      mortgage:   'Buy or remortgage',
      inheritance:'I have a lump sum',
      protection: 'Protect my family',
      general:    "I'm not sure yet"
    };
    const feelingLabels = {
      worried:    'Worried',
      overwhelmed:'Overwhelmed',
      okay:       'Okay',
      confident:  'Confident'
    };
    const amountLabels = {
      'under50k':   'Under £50,000',
      '50_150k':    '£50,000-£150,000',
      '150_500k':   '£150,000-£500,000',
      '500k_1m':    '£500,000-£1 million',
      'over1m':     'Over £1 million',
      'prefer_not': 'Prefer not to say'
    };
    const meetingLabels = {
      in_person: 'Face to face',
      video:     'Video call',
      phone:     'Phone call',
      any:       'Happy with any'
    };
    const lifeEventLabels = {
      retirement_soon: 'Approaching retirement',
      new_family:      'New baby or growing family',
      separation:      'Separation or divorce',
      bereavement:     'Inherited money or bereavement',
      new_job:         'Changed jobs or self-employed',
      property:        'Buying a home',
      nothing:         'Nothing specific'
    };

    const lifeEvents = (answers.change || []).map(function(v) {
      return lifeEventLabels[v] || v;
    });

    const fields = {
      'Need':                    needLabels[answers.need]        || answers.need     || '',
      'Priority':                answers.priority                || '',
      'Feeling':                 feelingLabels[answers.feeling]  || answers.feeling  || '',
      'Life Event':              lifeEvents,
      'Location':                answers.location                || '',
      'Remote Meeting':          !!(answers.remote),
      'Amount':                  amountLabels[answers.amount]    || answers.amount   || '',
      'Meeting Preference':      meetingLabels[answers.meeting]  || answers.meeting  || '',
      'Affiliate URL Generated': answers.affiliateUrl            || '',
      'Source':                  answers.source                  || 'Unbiased',
      'Completed':               true
    };

    console.log('Fields to write:', JSON.stringify(fields));

    const url = 'https://api.airtable.com/v0/' + process.env.AIRTABLE_BASE_ID + '/Questionnaire%20Submissions';

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + process.env.AIRTABLE_TOKEN,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ fields: fields })
    });

    const responseText = await response.text();
    console.log('Airtable response status:', response.status);
    console.log('Airtable response:', responseText);

    if (!response.ok) {
      return res.status(500).json({ error: 'Airtable write failed', detail: responseText });
    }

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('Submit error:', error.message);
    return res.status(500).json({ error: error.message });
  }
};
