const { createClient } = require('@supabase/supabase-js');
const webpush = require('web-push');

// Environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

if (!supabaseUrl || !supabaseServiceKey || !vapidPublicKey || !vapidPrivateKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
webpush.setVapidDetails('mailto:support@qconnect.app', vapidPublicKey, vapidPrivateKey);

async function triggerReminders() {
  const now = new Date();
  const options = {
    timeZone: 'Asia/Bangkok',
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    weekday: 'long',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  };
  
  const formatter = new Intl.DateTimeFormat('en-GB', options);
  const parts = formatter.formatToParts(now);
  const getPart = (type) => parts.find(p => p.type === type).value;
  
  const currentTime = `${getPart('hour')}:${getPart('minute')}`;
  const currentDay = getPart('weekday');
  const currentDate = `${getPart('year')}-${getPart('month')}-${getPart('day')}`;

  console.log(`Current Status: Day=${currentDay}, Time=${currentTime}, Date=${currentDate}`);

  // Fetch active reminders
  // We use a broader time check to handle potential minute-skips or slight delays
  const { data: reminders, error } = await supabase
    .from('reminders')
    .select('*')
    .eq('is_active', true);

  if (error) {
    console.error('Database Error:', error);
    return;
  }

  console.log(`Found ${reminders?.length || 0} total active reminders. Filtering for ones due now...`);

  const dueReminders = reminders.filter(r => {
    // Check if time matches (ignoring seconds)
    const reminderTime = r.reminder_time.substring(0, 5);
    const matchesTime = reminderTime === currentTime;
    
    // Check if day or date matches
    const matchesDay = r.days && r.days.includes(currentDay);
    const matchesDate = r.reminder_date === currentDate;
    
    return matchesTime && (matchesDay || matchesDate);
  });

  if (dueReminders.length === 0) {
    console.log('No reminders due for this exact minute.');
    return;
  }

  for (const reminder of dueReminders) {
    console.log(`Triggering reminder: ${reminder.surah_name} for user ${reminder.user_id}`);
    
    const { data: sub, error: subError } = await supabase
      .from('push_subscriptions')
      .select('subscription_json')
      .eq('user_id', reminder.user_id)
      .maybeSingle();

    if (subError || !sub) {
      console.warn(`No subscription for user ${reminder.user_id}`);
      continue;
    }

    try {
      await webpush.sendNotification(sub.subscription_json, JSON.stringify({
        title: 'QConnect Reminder',
        body: `Time for Surah ${reminder.surah_name}`,
        url: `/reminders`
      }));
      console.log('Notification sent successfully!');
    } catch (e) {
      console.error('Push Error:', e.message);
    }
  }
}

triggerReminders();
