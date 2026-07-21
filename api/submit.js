module.exports = async function handler(req, res) {

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    // Parse body manually in case auto-parsing isn't working
    let a = {};
    if (req.body && typeof req.body === 'object') {
      a = req.body;
    } else if (typeof req.body === 'string') {
      a = JSON.parse(req.body);
    } else {
      // Read raw body
      const chunks = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }
      const raw = Buffer.concat(chunks).toString();
      console.log('Raw body:', raw);
      a = raw ? JSON.parse(raw) : {};
    }

    console.log('Parsed answers:', JSON.stringify(a));
    console.log('Token set:', !!process.env.AIRTABLE_TOKEN);
    console.log('Base ID set:', !!process.env.AIRTABLE_BASE_ID);

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
      'Need':                    needLabels[a.need]        || a.need     || '',
      'Priority':                a.priority                || '',
      'Feeling':                 feelingLabels[a.feeling]  || a.feeling  || '',
      'Life Event':              lifeEvents                || '',
      'Location':                a.location                || '',
      'Remote Meeting':          a.remote ? true : false,
      'Amount':                  amountLabels[a.amount]    || a.amount   || '',
      'Meeting Preference':      meetingLabels[a.meeting]  || a.meeting  || '',
      'Affiliate URL Generated': a.affiliateUrl            || '',
      'Source':                  a.source                  || 'Unbiased',
      'Completed':               true
    };

    console.log('Fields:', JSON.stringify(fields));

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
    console.log('Airtable status:', response.status);
    console.log('Airtable response:', responseText);

    if (!response.ok) {
      return res.status(500).json({ error: 'Airtable error', detail: responseText });
    }

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error('Caught error:', err.message, err.stack);
    return res.status(500).json({ error: err.message });
  }
};
