# ABC Tutoring prototype

A friendly, static prototype for a tutoring service. Parents can filter tutors, open a profile, request a time, and see a pending confirmation. Admin can approve requests and manage availability. Prototype data is stored in the browser with `localStorage`.

## Run it locally

```bash
npm install
npm run dev
```

## PostHog

Copy `.env.example` to `.env.local`, then replace the placeholder with PostHog project key. The site captures:

- `tutor_directory_viewed`
- `tutor_filter_selected`
- `tutor_profile_viewed`
- `booking_started`
- `booking_request_submitted`
- `booking_request_approved`

The project key is intended for browser use and is included in the static build. Do not put a PostHog personal API key in this file.

For Facebook, share a tagged link like:

`https://project-agent-upskill.github.io/?utm_source=facebook&utm_medium=social&utm_campaign=local_parent_group`

To generate sample PostHog traffic after configuring a project key:

```bash
POSTHOG_PROJECT_KEY=phc_your_key npm run simulate:traffic
```

Without a key, the simulation prints a dry-run preview and sends nothing.

## GitHub Pages

The included GitHub Actions workflow builds and publishes `dist/client` whenever `main` is pushed. In the repository settings, set Pages to use **GitHub Actions**. Add the public PostHog project key as a repository variable named `POSTHOG_PROJECT_KEY`.
