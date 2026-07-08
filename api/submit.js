// foundli — Airtable submission handler
// Runs on Vercel's servers — token never exposed to the browser

export default async function handler(req, res) {oken never exposed to the browser

export default async function handler(req, res) {

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // CORS — allow foundli.co.uk to call this
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  try {
    const answers = req.body;

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

    const lifeEvents = (answers.change || []).map(v => lifeEventLabels[v] || v);

    const fields = {
      'Need':                    needLabels[answers.need]       || answers.need      || '',
      'Priority':                answers.priority               || '',
      'Feeling':                 feelingLabels[answers.feeling]  || answers.feeling   || '',
      'Life Event':              lifeEvents,
      'Location':                answers.location               || '',
      'Remote Meeting':          !!(answers.remote),
      'Amount':                  amountLabels[answers.amount]   || answers.amount    || '',
      'Meeting Preference':      meetingLabels[answers.meeting]  || answers.meeting  || '',
      'Affiliate URL Generated': answers.affiliateUrl           || '',
      'Source':                  answers.source                 || 'Unbiased',
      'Completed':               true,
    };

    const response = await fetch(
      'https://api.airtable.com/v0/' + process.env.AIRTABLE_BASE_ID + '/Questionnaire%20Submissions',
      {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + process.env.AIRTABLE_TOKEN,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ fields })
      }
    );

    if (!response.ok) {
      const err = await response.text();
      console.error('Airtable error:', err);
      return res.status(500).json({ error: 'Airtable write failed' });
    }

    const result = await response.json();
    return res.status(200).json({ success: true, id: result.id });

  } catch (error) {
    console.error('Submit error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}
