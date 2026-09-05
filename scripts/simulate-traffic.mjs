const key = process.env.POSTHOG_PROJECT_KEY;
const host = (process.env.POSTHOG_HOST || 'https://us.i.posthog.com').replace(
  /\/$/,
  '',
);

const tutors = [
  {
    id: 'maya-thompson',
    name: 'Maya Thompson',
    subject: 'Reading',
    grade: 'Grades 3–5',
    rate: 48,
  },
  {
    id: 'jordan-lee',
    name: 'Jordan Lee',
    subject: 'Math',
    grade: 'Grades 6–8',
    rate: 58,
  },
  {
    id: 'elena-ruiz',
    name: 'Elena Ruiz',
    subject: 'Writing',
    grade: 'Grades 9–12',
    rate: 52,
  },
];
const sources = [
  'facebook',
  'facebook',
  'facebook',
  'direct',
  'google',
  'direct',
];
const events = [];

for (let journey = 0; journey < sources.length; journey += 1) {
  const tutor = tutors[journey % tutors.length];
  const distinctId = `prototype-parent-${journey + 1}`;
  const base = {
    distinct_id: distinctId,
    traffic_source: sources[journey],
    $process_person_profile: false,
  };
  events.push({ event: 'tutor_directory_viewed', properties: base });
  events.push({
    event: 'tutor_filter_selected',
    properties: { ...base, subject: tutor.subject, grade_level: tutor.grade },
  });
  if (journey !== 5)
    events.push({
      event: 'tutor_profile_viewed',
      properties: {
        ...base,
        tutor_id: tutor.id,
        tutor_name: tutor.name,
        subject: tutor.subject,
        grade_level: tutor.grade,
        hourly_rate: tutor.rate,
      },
    });
  if (journey < 4)
    events.push({
      event: 'booking_started',
      properties: {
        ...base,
        tutor_id: tutor.id,
        tutor_name: tutor.name,
        subject: tutor.subject,
        grade_level: tutor.grade,
        hourly_rate: tutor.rate,
      },
    });
  if (journey < 3)
    events.push({
      event: 'booking_request_submitted',
      properties: {
        ...base,
        tutor_id: tutor.id,
        tutor_name: tutor.name,
        subject: tutor.subject,
        grade_level: tutor.grade,
        hourly_rate: tutor.rate,
        session_format: journey % 2 ? 'In person' : 'Online',
        requested_time: 'Prototype sample time',
      },
    });
}

if (!key) {
  console.log(
    `Dry run: ${events.length} events across ${sources.length} visitor journeys.`,
  );
  console.log('Set POSTHOG_PROJECT_KEY to send this sample traffic.');
  process.exit(0);
}

let sent = 0;
for (const item of events) {
  const response = await fetch(`${host}/capture/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: key,
      event: item.event,
      properties: item.properties,
      timestamp: new Date().toISOString(),
    }),
  });
  if (!response.ok)
    throw new Error(`PostHog returned ${response.status} for ${item.event}`);
  sent += 1;
}

console.log(`Sent ${sent} prototype events to PostHog.`);
