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
  
  // Get current day of week (e.g., 'Friday')
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const currentDay = days[now.getUTCDay()]; // Using UTC to match DB standards usually
  
  // Format current time as HH:mm (matching Postgres TIME)
  // We check for the exact minute. 
  // NOTE: Depending on your server time, you might need to adjust for timezone.
  const currentTime = now.toISOString().split('T')[1].substring(0, 5); 
  const currentDate = now.toISOString().split('T')[0];

  console.log(`Checking reminders for ${currentDay} at ${currentTime} UTC...`);

  // 1. Fetch active reminders due now
  // We check for recurring reminders (days includes currentDay) 
  // OR one-time reminders (reminder_date = currentDate)
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
      // Optional: Remove dead subscriptions
      if (e.statusCode === 410 || e.statusCode === 404) {
        await supabase.from('push_subscriptions').delete().eq('user_id', reminder.user_id);
      }
    }
  }
}

triggerReminders();
