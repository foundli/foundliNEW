// foundli — Airtable submission handler
module.exports = async function handler(req, res) {

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const a = req.body || {};

    const needLabels = {
      retirement:'Plan for retirement', pension:'Sort out my pension',
      invest:'Invest my money', mortgage:'Buy or remortgage',
      inheritance:'I have a lump sum', protection:'Protect my family',
      general:"I'm not sure yet"
    };
    const feelingLabels = {
      worried:'Worried', overwhelmed:'Overwhelmed',
      okay:'Okay', confident:'Confident'
    };
    const amountLabels = {
      'under50k':'Under £50,000','50_150k':'£50,000-£150,000',
      '150_500k':'£150,000-£500,000','500k_1m':'£500,000-£1 million',
      'over1m':'Over £1 million','prefer_not':'Prefer not to say'
    };
    const meetingLabels = {
      in_person:'Face to face', video:'Video call',
      phone:'Phone call', any:'Happy with any'
    };
    const lifeEventLabels = {
      retirement_soon:'Approaching retirement', new_family:'New baby or growing family',
      separation:'Separation or divorce', bereavement:'Inherited money or bereavement',
      new_job:'Changed jobs or self-employed', property:'Buying a home',
      nothing:'Nothing specific'
    };

    const lifeEvents = (a.change || [])
      .map(function(v){ return lifeEventLabels[v] || v; })
      .join(', ');

    const fields = {
      'Need':                    needLabels[a.need]       || a.need      || '',
      'Priority':                a.priority               || '',
      'Feeling':                 feelingLabels[a.feeling]  || a.feeling   || '',
      'Life Event':              lifeEvents               || '',
      'Location':                a.location               || '',
      'Remote Meeting':          a.remote ? true : false,
      'Amount':                  amountLabels[a.amount]   || a.amount    || '',
      'Meeting Preference':      meetingLabels[a.meeting]  || a.meeting  || '',
      'Affiliate URL Generated': a.affiliateUrl           || '',
      'Source':                  a.source                 || 'Unbiased',
      'Completed':               true
    };

    console.log('Writing fields:', JSON.stringify(fields));

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
    console.log('Airtable status:', response.status, 'body:', responseText);

    if (!response.ok) {
      return res.status(500).json({ error: 'Airtable error', detail: responseText });
    }

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error('Error:', err.message);
    return res.status(500).json({ error: err.message });
  }
};
