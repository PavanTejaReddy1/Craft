export const PROJECT_CATEGORIES = [
  'Web Development',
  'Mobile App Development',
  'Backend / API Development',
  'Full Stack Development',
  'UI/UX Design',
  'AI / Machine Learning',
  'Data Analytics',
  'Automation',
  'Cloud / DevOps',
  'Database',
  'Testing / QA',
  'Bug Fixing',
  'Technical Consulting',
  'Other',
];

export const EXPERIENCE_LEVELS = [
  { value: 'entry',        label: 'Entry Level'    },
  { value: 'intermediate', label: 'Intermediate'   },
  { value: 'expert',       label: 'Expert'         },
];

export const BUDGET_TYPES = [
  { value: 'fixed',  label: 'Fixed Price'  },
  { value: 'hourly', label: 'Hourly Rate'  },
];

// Minimal color palette: only green (active/open), yellow (pending), red (error), gray (neutral/done)
export const PROJECT_STATUS_LABELS = {
  draft:       { label: 'Draft',       color: 'gray'   },
  open:        { label: 'Open',        color: 'green'  },
  in_progress: { label: 'In Progress', color: 'dark'   },
  completed:   { label: 'Completed',   color: 'gray'   },
  cancelled:   { label: 'Cancelled',   color: 'red'    },
  paused:      { label: 'Paused',      color: 'yellow' },
};

export const OFFER_STATUS_LABELS = {
  pending:   { label: 'Pending',      color: 'yellow' },
  accepted:  { label: 'Accepted',     color: 'green'  },
  rejected:  { label: 'Not selected', color: 'gray'   },
  withdrawn: { label: 'Withdrawn',    color: 'gray'   },
  closed:    { label: 'Closed',       color: 'gray'   },
};

export const MILESTONE_STATUS_LABELS = {
  pending:            { label: 'Pending',            color: 'gray'   },
  in_progress:        { label: 'In Progress',        color: 'dark'   },
  submitted:          { label: 'Submitted',          color: 'yellow' },
  revision_requested: { label: 'Revision Requested', color: 'red'    },
  approved:           { label: 'Approved',           color: 'green'  },
  completed:          { label: 'Completed',          color: 'gray'   },
};

export const AVAILABILITY_LABELS = {
  available:     { label: 'Available',     color: 'green'  },
  busy:          { label: 'Busy',          color: 'yellow' },
  not_available: { label: 'Not Available', color: 'gray'   },
};

export const SORT_OPTIONS = [
  { value: 'newest',      label: 'Newest first'     },
  { value: 'oldest',      label: 'Oldest first'     },
  { value: 'budget_high', label: 'Highest budget'   },
  { value: 'budget_low',  label: 'Lowest budget'    },
  { value: 'deadline',    label: 'Deadline soonest' },
];

export const POPULAR_SKILLS = [
  'React', 'Node.js', 'Python', 'TypeScript', 'MongoDB', 'PostgreSQL',
  'Next.js', 'Vue.js', 'Flutter', 'React Native', 'AWS', 'Docker',
  'GraphQL', 'REST API', 'TensorFlow', 'Machine Learning', 'Figma',
  'Go', 'Rust', 'Kubernetes', 'Redis', 'Firebase', 'Supabase',
];

export const NAV_LINKS = {
  public: [
    { label: 'Explore Projects', href: '/projects'          },
    { label: 'Find Developers',  href: '/developers'        },
    { label: 'How It Works',     href: '/#how-it-works'     },
  ],
};
