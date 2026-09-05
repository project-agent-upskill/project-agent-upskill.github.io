'use client';

/* oxlint-disable next/no-img-element */

import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  CalendarCheck,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  LayoutDashboard,
  Mail,
  MapPin,
  Monitor,
  Plus,
  Search,
  Sparkles,
  Star,
  Trash2,
  UserRound,
  X,
} from 'lucide-react';
import posthog from 'posthog-js';
import { SyntheticEvent, useCallback, useEffect, useMemo, useState } from 'react';

type BookingStatus = 'pending' | 'approved';
type Tutor = {
  id: string;
  name: string;
  role: string;
  image: string;
  subjects: string[];
  gradeBands: string[];
  gradeLabel: string;
  rate: number;
  intro: string;
  bio: string;
  credentials: string[];
  formats: string[];
  availability: string[];
  testimonial?: { quote: string; author: string };
};
type Booking = {
  id: string;
  tutorId: string;
  tutorName: string;
  parentName: string;
  parentEmail: string;
  studentName: string;
  studentGrade: string;
  subject: string;
  format: string;
  time: string;
  status: BookingStatus;
  createdAt: string;
};
type BookingDraft = Pick<
  Booking,
  | 'parentName'
  | 'parentEmail'
  | 'studentName'
  | 'studentGrade'
  | 'subject'
  | 'format'
  | 'time'
>;

const STORAGE_KEY = 'abc-tutoring-prototype-v1';
const ANALYTICS_KEY = 'abc-tutoring-analytics-log';

const tutors: Tutor[] = [
  {
    id: 'maya-thompson',
    name: 'Maya Thompson',
    role: 'Elementary learning specialist',
    image:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1000&q=85',
    subjects: ['Math', 'Reading'],
    gradeBands: ['k2', '35'],
    gradeLabel: 'Grades K–5',
    rate: 48,
    intro:
      'Patient, playful lessons that help younger learners feel capable and curious.',
    bio: 'I love helping children discover that learning can feel joyful. My sessions blend clear routines, games, and plenty of encouragement so students build skills without losing confidence.',
    credentials: [
      'M.Ed. Elementary Education',
      '8 years classroom teaching',
      'Orton-Gillingham trained',
    ],
    formats: ['Online', 'In person'],
    availability: [
      'Tue, Sep 8 · 4:00 PM',
      'Thu, Sep 10 · 5:30 PM',
      'Sat, Sep 12 · 9:30 AM',
    ],
    testimonial: {
      quote:
        'Maya made reading feel possible again. Our daughter looks forward to every session.',
      author: 'Priya, parent of a 3rd grader',
    },
  },
  {
    id: 'jordan-lee',
    name: 'Jordan Lee',
    role: 'Math & science coach',
    image:
      'https://images.unsplash.com/photo-1566753323558-f4e0952af115?auto=format&fit=crop&w=1000&q=85',
    subjects: ['Math', 'Science'],
    gradeBands: ['68', '912'],
    gradeLabel: 'Grades 6–12',
    rate: 58,
    intro:
      'Clear, practical explanations that turn tough concepts into manageable steps.',
    bio: 'I help students slow down, spot the pattern, and build a repeatable way to solve problems. We connect math and science to everyday examples, then practice until the approach feels natural.',
    credentials: [
      'B.S. Applied Mathematics',
      'STEM mentor',
      'AP Calculus & Physics support',
    ],
    formats: ['Online', 'In person'],
    availability: [
      'Wed, Sep 9 · 6:00 PM',
      'Fri, Sep 11 · 4:30 PM',
      'Sat, Sep 12 · 10:00 AM',
    ],
    testimonial: {
      quote:
        'Jordan explains things in a way that finally sticks. Algebra is no longer a nightly battle.',
      author: 'Marcus, parent of an 8th grader',
    },
  },
  {
    id: 'elena-ruiz',
    name: 'Elena Ruiz',
    role: 'English & writing tutor',
    image:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=85',
    subjects: ['English', 'Reading', 'Writing'],
    gradeBands: ['35', '68', '912'],
    gradeLabel: 'Grades 4–12',
    rate: 52,
    intro:
      'Encouraging support for stronger reading, organized essays, and confident voices.',
    bio: 'Writing gets easier when students have a trusted process and permission to find their own voice. I offer kind, specific feedback and practical tools for reading closely and writing clearly.',
    credentials: [
      'M.A. English',
      'Published writing coach',
      'College essay support',
    ],
    formats: ['Online'],
    availability: [
      'Mon, Sep 7 · 5:00 PM',
      'Thu, Sep 10 · 4:00 PM',
      'Sat, Sep 12 · 1:00 PM',
    ],
  },
];

const demoBooking: Booking = {
  id: 'demo-request-1001',
  tutorId: 'jordan-lee',
  tutorName: 'Jordan Lee',
  parentName: 'Alex Morgan',
  parentEmail: 'alex@example.com',
  studentName: 'Sam',
  studentGrade: '8th grade',
  subject: 'Math',
  format: 'Online',
  time: 'Wed, Sep 9 · 6:00 PM',
  status: 'pending',
  createdAt: new Date('2026-09-05T10:30:00').toISOString(),
};

const emptyDraft: BookingDraft = {
  parentName: '',
  parentEmail: '',
  studentName: '',
  studentGrade: '',
  subject: '',
  format: 'Online',
  time: '',
};

function trafficSource() {
  if (typeof window === 'undefined') return 'direct';
  const params = new URLSearchParams(window.location.search);
  const source = params.get('utm_source') || params.get('ref');
  if (source) {
    sessionStorage.setItem('abc-traffic-source', source);
    return source;
  }
  const saved = sessionStorage.getItem('abc-traffic-source');
  if (saved) return saved;
  if (document.referrer) {
    try {
      return new URL(document.referrer).hostname;
    } catch {
      return 'referral';
    }
  }
  return 'direct';
}

function recordLocalEvent(event: string, properties: Record<string, unknown>) {
  try {
    const existing = JSON.parse(localStorage.getItem(ANALYTICS_KEY) || '[]');
    localStorage.setItem(
      ANALYTICS_KEY,
      JSON.stringify(
        [
          { event, properties, at: new Date().toISOString() },
          ...existing,
        ].slice(0, 60),
      ),
    );
  } catch {
    /* analytics should never interrupt a booking */
  }
}

export default function Home() {
  const [view, setView] = useState<'parent' | 'admin'>('parent');
  const [subject, setSubject] = useState('all');
  const [grade, setGrade] = useState('all');
  const [selectedTutorId, setSelectedTutorId] = useState<string | null>(null);
  const [draft, setDraft] = useState<BookingDraft>(emptyDraft);
  const [submitted, setSubmitted] = useState<Booking | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [availability, setAvailability] = useState<Record<string, string[]>>(
    () => Object.fromEntries(tutors.map((t) => [t.id, t.availability])),
  );
  const [newTimes, setNewTimes] = useState<Record<string, string>>({});
  const [hydrated, setHydrated] = useState(false);
  const selectedTutor = tutors.find((t) => t.id === selectedTutorId) || null;

  const capture = useCallback(
    (event: string, properties: Record<string, unknown> = {}) => {
      const payload = { ...properties, traffic_source: trafficSource() };
      recordLocalEvent(event, payload);
      if (process.env.NEXT_PUBLIC_POSTHOG_KEY) posthog.capture(event, payload);
    },
    [],
  );

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_POSTHOG_KEY && !posthog.__loaded) {
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
        api_host:
          process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
        defaults: '2026-05-30',
        capture_pageview: true,
      });
    }
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Browser storage is the prototype's intentionally local source of truth.
        // oxlint-disable-next-line react/react-compiler
        setBookings(parsed.bookings || []);
        setAvailability(
          parsed.availability ||
            Object.fromEntries(tutors.map((t) => [t.id, t.availability])),
        );
      } else setBookings([demoBooking]);
    } catch {
      setBookings([demoBooking]);
    }
    setHydrated(true);
    capture('tutor_directory_viewed');
  }, [capture]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ bookings, availability }),
    );
  }, [bookings, availability, hydrated]);

  useEffect(() => {
    if (!selectedTutorId) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedTutorId]);

  const filteredTutors = useMemo(
    () =>
      tutors.filter((tutor) => {
        const subjectMatch =
          subject === 'all' || tutor.subjects.includes(subject);
        const gradeMatch = grade === 'all' || tutor.gradeBands.includes(grade);
        return subjectMatch && gradeMatch;
      }),
    [subject, grade],
  );

  const makeBooking = useCallback(
    (tutor: Tutor, bookingDraft: BookingDraft) => {
      if (!availability[tutor.id]?.includes(bookingDraft.time))
        throw new Error('That time is no longer available.');
      const booking: Booking = {
        ...bookingDraft,
        id: `request-${Date.now()}`,
        tutorId: tutor.id,
        tutorName: tutor.name,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };
      setBookings((current) => [booking, ...current]);
      setSubmitted(booking);
      capture('booking_request_submitted', {
        tutor_id: tutor.id,
        tutor_name: tutor.name,
        subject: booking.subject,
        grade_level: booking.studentGrade,
        hourly_rate: tutor.rate,
        session_format: booking.format,
        requested_time: booking.time,
      });
      return booking;
    },
    [availability, capture],
  );

  useEffect(() => {
    const context =
      typeof document === 'undefined' ? undefined : document.modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    void Promise.resolve(
      context.registerTool(
        {
          name: 'submit_tutoring_booking_request',
          title: 'Submit tutoring booking request',
          description:
            'Submit a pending booking request with a currently available ABC Tutoring tutor. This does not confirm or charge for the session.',
          inputSchema: {
            type: 'object',
            properties: {
              tutor_id: { type: 'string', enum: tutors.map((t) => t.id) },
              parent_name: { type: 'string', minLength: 1 },
              parent_email: { type: 'string', minLength: 3 },
              student_first_name: { type: 'string', minLength: 1 },
              student_grade: { type: 'string', minLength: 1 },
              subject: { type: 'string', minLength: 1 },
              session_format: { type: 'string', enum: ['Online', 'In person'] },
              requested_time: { type: 'string', minLength: 1 },
            },
            required: [
              'tutor_id',
              'parent_name',
              'parent_email',
              'student_first_name',
              'student_grade',
              'subject',
              'session_format',
              'requested_time',
            ],
            additionalProperties: false,
          },
          annotations: { readOnlyHint: false, untrustedContentHint: false },
          execute(input: unknown) {
            const value = input as Record<string, string>;
            const tutor = tutors.find((t) => t.id === value.tutor_id);
            if (!tutor) throw new Error('Tutor not found.');
            if (!tutor.subjects.includes(value.subject))
              throw new Error(
                'That tutor does not offer the requested subject.',
              );
            if (!tutor.formats.includes(value.session_format))
              throw new Error(
                'That session format is not offered by this tutor.',
              );
            const booking = makeBooking(tutor, {
              parentName: value.parent_name,
              parentEmail: value.parent_email,
              studentName: value.student_first_name,
              studentGrade: value.student_grade,
              subject: value.subject,
              format: value.session_format,
              time: value.requested_time,
            });
            setView('parent');
            setSelectedTutorId(tutor.id);
            return {
              request_id: booking.id,
              status: booking.status,
              message: 'Request submitted and awaiting Dana’s approval.',
            };
          },
        },
        { signal: lifecycle.signal },
      ),
    ).catch(() => undefined);
    return () => lifecycle.abort();
  }, [makeBooking]);

  function openProfile(tutor: Tutor) {
    setSelectedTutorId(tutor.id);
    setSubmitted(null);
    setDraft({
      ...emptyDraft,
      subject: tutor.subjects[0],
      format: tutor.formats[0],
    });
    capture('tutor_profile_viewed', {
      tutor_id: tutor.id,
      tutor_name: tutor.name,
      subject: tutor.subjects[0],
      grade_level: tutor.gradeLabel,
      hourly_rate: tutor.rate,
    });
  }

  function chooseTime(tutor: Tutor, time: string) {
    setDraft((current) => ({ ...current, time }));
    capture('booking_started', {
      tutor_id: tutor.id,
      tutor_name: tutor.name,
      subject: draft.subject || tutor.subjects[0],
      grade_level: tutor.gradeLabel,
      hourly_rate: tutor.rate,
      requested_time: time,
    });
  }

  function submitBooking(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedTutor) return;
    makeBooking(selectedTutor, draft);
  }

  function approveBooking(booking: Booking) {
    setBookings((current) =>
      current.map((item) =>
        item.id === booking.id ? { ...item, status: 'approved' } : item,
      ),
    );
    setAvailability((current) => ({
      ...current,
      [booking.tutorId]: (current[booking.tutorId] || []).filter(
        (time) => time !== booking.time,
      ),
    }));
    const tutor = tutors.find((item) => item.id === booking.tutorId);
    capture('booking_request_approved', {
      tutor_id: booking.tutorId,
      tutor_name: booking.tutorName,
      subject: booking.subject,
      grade_level: booking.studentGrade,
      hourly_rate: tutor?.rate,
      session_format: booking.format,
      requested_time: booking.time,
    });
  }

  function addTime(tutorId: string) {
    const time = newTimes[tutorId]?.trim();
    if (!time) return;
    setAvailability((current) => ({
      ...current,
      [tutorId]: [...(current[tutorId] || []), time],
    }));
    setNewTimes((current) => ({ ...current, [tutorId]: '' }));
  }

  function removeTime(tutorId: string, time: string) {
    setAvailability((current) => ({
      ...current,
      [tutorId]: (current[tutorId] || []).filter((item) => item !== time),
    }));
  }

  function setParentView() {
    setView('parent');
    requestAnimationFrame(() =>
      document.getElementById('tutors')?.scrollIntoView(),
    );
  }

  if (view === 'admin')
    return (
      <AdminView
        bookings={bookings}
        availability={availability}
        newTimes={newTimes}
        setNewTimes={setNewTimes}
        onApprove={approveBooking}
        onAddTime={addTime}
        onRemoveTime={removeTime}
        onBack={setParentView}
      />
    );

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="ABC Tutoring home">
          <span className="brand-mark">ABC</span>
          <span>ABC Tutoring</span>
        </a>
        <nav aria-label="Main navigation">
          <a href="#tutors">Find a tutor</a>
          <button
            className="nav-admin"
            type="button"
            onClick={() => setView('admin')}
          >
            <LayoutDashboard size={15} /> Dana’s admin
          </button>
        </nav>
      </header>

      <section className="intro" id="top">
        <div className="intro-copy">
          <p className="eyebrow">One-on-one support, thoughtfully matched</p>
          <h1>A tutor who helps learning click.</h1>
          <p className="lede">
            Meet caring local educators, compare what works for your family, and
            request a time in a few simple steps.
          </p>
          <a className="primary-action" href="#tutors">
            Find your tutor <ArrowRight size={18} />
          </a>
        </div>
        <div className="note-card" aria-label="A note from Dana">
          <p className="script">A note from Dana</p>
          <blockquote>
            “Every student learns differently. I’ll help your family find
            someone who feels like the right fit.”
          </blockquote>
          <div className="dana-line">
            <span>D</span>
            <div>
              <strong>Dana</strong>
              <small>Owner, ABC Tutoring</small>
            </div>
          </div>
        </div>
      </section>

      <section className="trust-strip" aria-label="What to expect">
        <span>
          <Search size={20} /> Browse and compare
        </span>
        <ChevronRight size={17} />
        <span>
          <CalendarCheck size={20} /> Request a time
        </span>
        <ChevronRight size={17} />
        <span>
          <CheckCircle2 size={20} /> Dana approves
        </span>
      </section>

      <section className="directory" id="tutors">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Meet the tutors</p>
            <h2>Find the right fit</h2>
          </div>
          <p>
            Friendly, experienced educators with clear rates and real
            availability.
          </p>
        </div>
        <div className="filter-bar" aria-label="Tutor filters">
          <label>
            <span>Subject</span>
            <select
              value={subject}
              onChange={(event) => {
                setSubject(event.target.value);
                capture('tutor_filter_selected', {
                  subject:
                    event.target.value === 'all'
                      ? 'All subjects'
                      : event.target.value,
                  grade_level: grade,
                });
              }}
            >
              <option value="all">All subjects</option>
              <option>Math</option>
              <option>Reading</option>
              <option>Science</option>
              <option>English</option>
              <option>Writing</option>
            </select>
          </label>
          <label>
            <span>Grade level</span>
            <select
              value={grade}
              onChange={(event) => {
                setGrade(event.target.value);
                capture('tutor_filter_selected', {
                  subject,
                  grade_level:
                    event.target.options[event.target.selectedIndex].text,
                });
              }}
            >
              <option value="all">All grades</option>
              <option value="k2">Grades K–2</option>
              <option value="35">Grades 3–5</option>
              <option value="68">Grades 6–8</option>
              <option value="912">Grades 9–12</option>
            </select>
          </label>
          <p>
            Showing {filteredTutors.length}{' '}
            {filteredTutors.length === 1 ? 'tutor' : 'wonderful tutors'}
          </p>
        </div>
        {filteredTutors.length ? (
          <div className="tutor-grid">
            {filteredTutors.map((tutor) => (
              <TutorCard
                key={tutor.id}
                tutor={tutor}
                times={availability[tutor.id] || []}
                onOpen={() => openProfile(tutor)}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <Sparkles size={30} />
            <h3>No exact match yet</h3>
            <p>
              Try widening one of your filters, or contact Dana for a personal
              recommendation.
            </p>
            <button
              type="button"
              onClick={() => {
                setSubject('all');
                setGrade('all');
              }}
            >
              Show all tutors
            </button>
          </div>
        )}
        <p className="demo-note">
          Prototype preview · Tutor profiles and names are fictional.
          Photography via Unsplash.
        </p>
      </section>

      <section className="contact-band">
        <div>
          <p className="eyebrow">Prefer a personal recommendation?</p>
          <h2>Dana is happy to help.</h2>
          <p>
            Call ABC Tutoring to talk through your child’s goals, or to cancel
            or reschedule an existing session.
          </p>
        </div>
        <a href="tel:+15550142223">Call (555) 014-2223</a>
      </section>
      <footer>
        <a className="brand" href="#top">
          <span className="brand-mark">ABC</span>
          <span>ABC Tutoring</span>
        </a>
        <p>Patient support. Confident learners.</p>
        <button type="button" onClick={() => setView('admin')}>
          Dana’s admin
        </button>
      </footer>

      {selectedTutor && (
        <TutorDialog
          tutor={selectedTutor}
          times={availability[selectedTutor.id] || []}
          draft={draft}
          setDraft={setDraft}
          submitted={submitted}
          onChooseTime={(time) => chooseTime(selectedTutor, time)}
          onSubmit={submitBooking}
          onClose={() => {
            setSelectedTutorId(null);
            setSubmitted(null);
          }}
        />
      )}
    </main>
  );
}

function TutorCard({
  tutor,
  times,
  onOpen,
}: {
  tutor: Tutor;
  times: string[];
  onOpen: () => void;
}) {
  return (
    <article className="tutor-card">
      <div className="photo-wrap">
        <img src={tutor.image} alt={`Demo portrait for ${tutor.name}`} />
        <span className="available-dot">
          {times.length ? 'Accepting requests' : 'Ask Dana for times'}
        </span>
      </div>
      <div className="card-content">
        <div className="name-row">
          <div>
            <h3>{tutor.name}</h3>
            <p>{tutor.role}</p>
          </div>
          <strong>
            ${tutor.rate}
            <small>/hr</small>
          </strong>
        </div>
        <div className="tags">
          {tutor.subjects.map((item) => (
            <span key={item}>{item}</span>
          ))}
          <span>{tutor.gradeLabel}</span>
        </div>
        <p className="card-intro">{tutor.intro}</p>
        <p className="credential">
          <Star size={15} /> {tutor.credentials[0]} · {tutor.credentials[1]}
        </p>
        <p className="availability">
          <Clock3 size={16} />{' '}
          {times.slice(0, 2).join(' · ') || 'New times coming soon'}
        </p>
        <div className="format-row">
          {tutor.formats.includes('Online') && (
            <span>
              <Monitor size={15} /> Online
            </span>
          )}
          {tutor.formats.includes('In person') && (
            <span>
              <MapPin size={15} /> In person
            </span>
          )}
        </div>
        <button className="profile-button" type="button" onClick={onOpen}>
          View profile & times <ArrowRight size={17} />
        </button>
      </div>
    </article>
  );
}

function TutorDialog({
  tutor,
  times,
  draft,
  setDraft,
  submitted,
  onChooseTime,
  onSubmit,
  onClose,
}: {
  tutor: Tutor;
  times: string[];
  draft: BookingDraft;
  setDraft: React.Dispatch<React.SetStateAction<BookingDraft>>;
  submitted: Booking | null;
  onChooseTime: (time: string) => void;
    onSubmit: (event: SyntheticEvent<HTMLFormElement>) => void;
  onClose: () => void;
}) {
  return (
    <div
      className="dialog-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <dialog
        open
        className="profile-dialog"
        aria-modal="true"
        aria-labelledby="profile-title"
      >
        <button
          className="dialog-close"
          type="button"
          onClick={onClose}
          aria-label="Close profile"
        >
          <X size={20} />
        </button>
        {submitted ? (
          <BookingConfirmation booking={submitted} onClose={onClose} />
        ) : (
          <>
            <aside className="profile-summary">
              <img src={tutor.image} alt={`Demo portrait for ${tutor.name}`} />
              <div className="profile-summary-body">
                <p className="eyebrow">Meet your tutor</p>
                <h2 id="profile-title">{tutor.name}</h2>
                <p className="profile-role">{tutor.role}</p>
                <p>{tutor.bio}</p>
                <div className="profile-price">
                  <strong>${tutor.rate}</strong>
                  <span>
                    per hour
                    <br />
                    No payment today
                  </span>
                </div>
                <h4>Credentials</h4>
                <ul>
                  {tutor.credentials.map((item) => (
                    <li key={item}>
                      <Check size={15} />
                      {item}
                    </li>
                  ))}
                </ul>
                {tutor.testimonial && (
                  <blockquote className="testimonial">
                    “{tutor.testimonial.quote}”
                    <small>— {tutor.testimonial.author}</small>
                  </blockquote>
                )}
              </div>
            </aside>
            <form className="booking-form" onSubmit={onSubmit}>
              <div className="form-heading">
                <p className="eyebrow">Request a session</p>
                <h2>Choose what works</h2>
                <p>
                  This is a request. Dana will confirm with you after reviewing
                  it.
                </p>
              </div>
              <fieldset>
                <legend>1. Select an available time</legend>
                <div className="time-grid">
                  {times.map((time) => (
                    <button
                      key={time}
                      type="button"
                      className={draft.time === time ? 'selected' : ''}
                      onClick={() => onChooseTime(time)}
                    >
                      <Clock3 size={16} />
                      {time}
                      {draft.time === time && <Check size={15} />}
                    </button>
                  ))}
                </div>
                {!times.length && (
                  <p className="field-help">
                    No open times are listed right now. Please call Dana for
                    help.
                  </p>
                )}
              </fieldset>
              <fieldset>
                <legend>2. Session format</legend>
                <div className="choice-grid">
                  {tutor.formats.map((format) => (
                    <label
                      className={draft.format === format ? 'selected' : ''}
                      key={format}
                    >
                      <input
                        type="radio"
                        name="format"
                        value={format}
                        checked={draft.format === format}
                        onChange={() =>
                          setDraft((current) => ({ ...current, format }))
                        }
                      />
                      {format === 'Online' ? (
                        <Monitor size={19} />
                      ) : (
                        <MapPin size={19} />
                      )}
                      <span>
                        <strong>{format}</strong>
                        <small>
                          {format === 'Online'
                            ? 'Meet by video'
                            : 'At an agreed local location'}
                        </small>
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <fieldset>
                <legend>3. Tell us about your student</legend>
                <div className="form-grid">
                  <label>
                    <span>Parent’s name</span>
                    <input
                      required
                      value={draft.parentName}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          parentName: event.target.value,
                        }))
                      }
                      placeholder="Your full name"
                    />
                  </label>
                  <label>
                    <span>Parent’s email</span>
                    <input
                      required
                      type="email"
                      value={draft.parentEmail}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          parentEmail: event.target.value,
                        }))
                      }
                      placeholder="you@example.com"
                    />
                  </label>
                  <label>
                    <span>Student’s first name</span>
                    <input
                      required
                      value={draft.studentName}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          studentName: event.target.value,
                        }))
                      }
                      placeholder="First name"
                    />
                  </label>
                  <label>
                    <span>Student’s grade</span>
                    <select
                      required
                      value={draft.studentGrade}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          studentGrade: event.target.value,
                        }))
                      }
                    >
                      <option value="">Choose grade</option>
                      {[
                        'Kindergarten',
                        '1st grade',
                        '2nd grade',
                        '3rd grade',
                        '4th grade',
                        '5th grade',
                        '6th grade',
                        '7th grade',
                        '8th grade',
                        '9th grade',
                        '10th grade',
                        '11th grade',
                        '12th grade',
                      ].map((item) => (
                        <option key={item}>{item}</option>
                      ))}
                    </select>
                  </label>
                  <label className="wide">
                    <span>Requested subject</span>
                    <select
                      required
                      value={draft.subject}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          subject: event.target.value,
                        }))
                      }
                    >
                      {tutor.subjects.map((item) => (
                        <option key={item}>{item}</option>
                      ))}
                    </select>
                  </label>
                </div>
              </fieldset>
              <button
                className="submit-booking"
                type="submit"
                disabled={!draft.time}
              >
                Submit booking request <ArrowRight size={18} />
              </button>
              <p className="privacy-note">
                No payment is collected. By submitting, you’re asking Dana to
                review this time and contact you by email.
              </p>
            </form>
          </>
        )}
      </dialog>
    </div>
  );
}

function BookingConfirmation({
  booking,
  onClose,
}: {
  booking: Booking;
  onClose: () => void;
}) {
  return (
    <div className="confirmation">
      <div className="confirmation-icon">
        <CheckCircle2 size={38} />
      </div>
      <p className="eyebrow">Request received</p>
      <h2>Thanks, {booking.parentName.split(' ')[0]}!</h2>
      <p>
        Your request is <strong>awaiting Dana’s approval</strong>. We’ve
        simulated an email notification to Dana, and she’ll follow up with you
        directly.
      </p>
      <dl>
        <div>
          <dt>Tutor</dt>
          <dd>{booking.tutorName}</dd>
        </div>
        <div>
          <dt>Student</dt>
          <dd>
            {booking.studentName} · {booking.studentGrade}
          </dd>
        </div>
        <div>
          <dt>Session</dt>
          <dd>
            {booking.subject} · {booking.format}
          </dd>
        </div>
        <div>
          <dt>Requested time</dt>
          <dd>{booking.time}</dd>
        </div>
      </dl>
      <div className="pending-pill">
        <Clock3 size={16} /> Pending approval
      </div>
      <button className="submit-booking" type="button" onClick={onClose}>
        Back to tutors
      </button>
      <small>
        Need to cancel or reschedule later? Call Dana at (555) 014-2223.
      </small>
    </div>
  );
}

function AdminView({
  bookings,
  availability,
  newTimes,
  setNewTimes,
  onApprove,
  onAddTime,
  onRemoveTime,
  onBack,
}: {
  bookings: Booking[];
  availability: Record<string, string[]>;
  newTimes: Record<string, string>;
  setNewTimes: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  onApprove: (booking: Booking) => void;
  onAddTime: (id: string) => void;
  onRemoveTime: (id: string, time: string) => void;
  onBack: () => void;
}) {
  const pending = bookings.filter((item) => item.status === 'pending').length;
  const approved = bookings.filter((item) => item.status === 'approved').length;
  return (
    <main className="admin-shell">
      <header className="admin-header">
        <button type="button" onClick={onBack}>
          <ArrowLeft size={17} /> Parent site
        </button>
        <span className="brand">
          <span className="brand-mark">ABC</span>
          <span>ABC Tutoring</span>
        </span>
        <span className="admin-badge">Dana’s admin</span>
      </header>
      <div className="admin-page">
        <div className="admin-title">
          <div>
            <p className="eyebrow">Booking desk</p>
            <h1>Good morning, Dana.</h1>
            <p>
              Review requests and keep each tutor’s available times up to date.
            </p>
          </div>
          <div className="admin-note">
            <Mail size={19} />
            <div>
              <strong>Notifications simulated</strong>
              <span>New requests appear here instantly on this device.</span>
            </div>
          </div>
        </div>
        <section className="stat-grid" aria-label="Booking summary">
          <article>
            <Clock3 />
            <div>
              <strong>{pending}</strong>
              <span>Pending approval</span>
            </div>
          </article>
          <article>
            <CalendarCheck />
            <div>
              <strong>{approved}</strong>
              <span>Approved bookings</span>
            </div>
          </article>
          <article>
            <UserRound />
            <div>
              <strong>{tutors.length}</strong>
              <span>Active tutors</span>
            </div>
          </article>
          <article>
            <BarChart3 />
            <div>
              <strong>5</strong>
              <span>Events tracked</span>
            </div>
          </article>
        </section>
        <section className="admin-section">
          <div className="admin-section-heading">
            <div>
              <p className="eyebrow">Requests</p>
              <h2>Booking requests</h2>
            </div>
            <span>{bookings.length} total</span>
          </div>
          {bookings.length ? (
            <div className="request-list">
              {bookings.map((booking) => (
                <article className="request-card" key={booking.id}>
                  <div className={`request-status ${booking.status}`}>
                    <span />
                    {booking.status === 'pending'
                      ? 'Pending approval'
                      : 'Approved'}
                  </div>
                  <div className="request-main">
                    <div className="request-person">
                      <div className="avatar">{booking.studentName[0]}</div>
                      <div>
                        <h3>
                          {booking.studentName} with {booking.tutorName}
                        </h3>
                        <p>
                          Requested by {booking.parentName} ·{' '}
                          {booking.parentEmail}
                        </p>
                      </div>
                    </div>
                    <dl>
                      <div>
                        <dt>Subject & grade</dt>
                        <dd>
                          {booking.subject} · {booking.studentGrade}
                        </dd>
                      </div>
                      <div>
                        <dt>Format</dt>
                        <dd>{booking.format}</dd>
                      </div>
                      <div>
                        <dt>Requested time</dt>
                        <dd>{booking.time}</dd>
                      </div>
                    </dl>
                  </div>
                  {booking.status === 'pending' ? (
                    <button
                      className="approve-button"
                      type="button"
                      onClick={() => onApprove(booking)}
                    >
                      <Check size={17} /> Approve request
                    </button>
                  ) : (
                    <div className="approved-note">
                      <CheckCircle2 size={17} /> Time removed from availability
                    </div>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <CalendarCheck size={30} />
              <h3>No requests yet</h3>
              <p>Submitted parent requests will appear here.</p>
            </div>
          )}
        </section>
        <section className="admin-section">
          <div className="admin-section-heading">
            <div>
              <p className="eyebrow">Schedule</p>
              <h2>Manage tutor availability</h2>
            </div>
            <p>Changes are saved on this device.</p>
          </div>
          <div className="availability-admin-grid">
            {tutors.map((tutor) => (
              <article className="availability-card" key={tutor.id}>
                <div className="mini-tutor">
                  <img src={tutor.image} alt="" />
                  <div>
                    <h3>{tutor.name}</h3>
                    <p>{tutor.subjects.join(' · ')}</p>
                  </div>
                </div>
                <div className="admin-times">
                  {(availability[tutor.id] || []).map((time) => (
                    <div key={time}>
                      <span>
                        <Clock3 size={15} />
                        {time}
                      </span>
                      <button
                        type="button"
                        onClick={() => onRemoveTime(tutor.id, time)}
                        aria-label={`Remove ${time}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  {!(availability[tutor.id] || []).length && (
                    <p>No open times listed.</p>
                  )}
                </div>
                <div className="add-time">
                  <input
                    value={newTimes[tutor.id] || ''}
                    onChange={(event) =>
                      setNewTimes((current) => ({
                        ...current,
                        [tutor.id]: event.target.value,
                      }))
                    }
                    placeholder="e.g. Tue, Sep 15 · 4:00 PM"
                  />
                  <button type="button" onClick={() => onAddTime(tutor.id)}>
                    <Plus size={16} /> Add
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
