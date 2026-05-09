const { createClient } = require('@supabase/supabase-js');
const webpush = require('web-push');

// Environment variables provided by GitHub Secrets
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

if (!supabaseUrl || !supabaseServiceKey || !vapidPublicKey || !vapidPrivateKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

// Initialize Supabase and Web Push
const supabase = createClient(supabaseUrl, supabaseServiceKey);
webpush.setVapidDetails(
  'mailto:support@qconnect.app',
  vapidPublicKey,
  vapidPrivateKey
);

async function triggerReminders() {
  const now = new Date();
  
  // Use Intl.DateTimeFormat to get the time in the user's timezone (Asia/Bangkok for +07:00)
  // This ensures we match the time the user set in their local browser.
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

  console.log(`Checking reminders for ${currentDay} at ${currentTime} (Asia/Bangkok local time)...`);

  // 1. Fetch active reminders due now
  const { data: reminders, error } = await supabase
    .from('reminders')
    .select('*')
    .eq('is_active', true)
    .or(`days.cs.{"${currentDay}"},reminder_date.eq.${currentDate}`)
    .filter('reminder_time', 'gte', `${currentTime}:00`)
    .filter('reminder_time', 'lt', `${currentTime}:59`);

  if (error) {
    console.error('Error fetching reminders:', error);
    return;
  }

  if (!reminders || reminders.length === 0) {
    console.log('No reminders due right now.');
    return;
  }

  console.log(`Found ${reminders.length} reminders to trigger.`);

  for (const reminder of reminders) {
    // 2. Get user's push subscription
    const { data: subscriptionData, error: subError } = await supabase
      .from('push_subscriptions')
      .select('subscription_json')
      .eq('user_id', reminder.user_id)
      .maybeSingle();

    if (subError || !subscriptionData) {
      console.warn(`No push subscription found for user ${reminder.user_id}`);
      continue;
    }

    // 3. Send the notification
    const payload = JSON.stringify({
      title: 'Time to Recite!',
      body: `Your reminder for ${reminder.surah_name} is ready.`,
      url: `/quran/${reminder.surah_id}`
    });

    try {
      await webpush.sendNotification(
        subscriptionData.subscription_json,
        payload
      );
      console.log(`Notification sent for ${reminder.surah_name} to user ${reminder.user_id}`);
    } catch (e) {
      console.error(`Failed to send notification to user ${reminder.user_id}:`, e);
      if (e.statusCode === 410 || e.statusCode === 404) {
        await supabase.from('push_subscriptions').delete().eq('user_id', reminder.user_id);
      }
    }
  }
}

triggerReminders();
