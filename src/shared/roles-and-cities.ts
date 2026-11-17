export const LISTING_STATUSES = [
  'ACTIVE',
  'POSSIBLY_EXPIRED',
  'EXPIRED',
  'REMOVED',
  'UNVERIFIED',
  'SOURCE_UNAVAILABLE'
] as const;

export type ListingStatus = typeof LISTING_STATUSES[number];

export const APPLICATION_LINK_STATUSES = [
  'VERIFIED',
  'REDIRECTED',
  'UNVERIFIED',
  'TEMPORARILY_UNAVAILABLE',
  'EXPIRED',
  'INVALID'
] as const;

export type ApplicationLinkStatus = typeof APPLICATION_LINK_STATUSES[number];

export const FRESHER_ELIGIBILITY_STATUSES = [
  'Fresher eligible',
  'Internship',
  'Experience required',
  'Experience not specified',
  'Eligibility uncertain'
] as const;

export type FresherEligibilityStatus = typeof FRESHER_ELIGIBILITY_STATUSES[number];

export const FIXED_ROLE_CATEGORIES = [
  'Software Engineering',
  'Data & Analytics',
  'AI & Machine Learning',
  'Product',
  'Design',
  'Marketing',
  'Sales',
  'Finance',
  'Operations',
  'HR',
  'Customer Support',
  'Other'
] as const;

export type FixedRoleCategory = typeof FIXED_ROLE_CATEGORIES[number];

export const ROLE_SUBCATEGORIES: Record<FixedRoleCategory, string[]> = {
  'Software Engineering': [
    'Frontend Engineering',
    'Backend Engineering',
    'Full Stack Engineering',
    'Mobile Engineering (iOS / Android)',
    'DevOps / Cloud / SRE',
    'QA / Software Testing / SDET',
    'Systems / Embedded'
  ],
  'Data & Analytics': [
    'Data Engineering',
    'Data Analyst',
    'Business Intelligence',
    'Data Science'
  ],
  'AI & Machine Learning': [
    'Machine Learning Engineering',
    'Generative AI / LLM Engineer',
    'Computer Vision / NLP',
    'AI Research'
  ],
  'Product': [
    'Associate Product Manager',
    'Product Operations',
    'Technical Product Manager'
  ],
  'Design': [
    'UI/UX Design',
    'Product Design',
    'Graphic / Visual Design'
  ],
  'Marketing': [
    'Growth Marketing',
    'Content / Social Media',
    'Performance Marketing',
    'SEO / Product Marketing'
  ],
  'Sales': [
    'Business Development Associate',
    'Inside Sales',
    'Enterprise Sales'
  ],
  'Finance': [
    'Financial Analyst',
    'Accounting / Audit',
    'FinTech Operations'
  ],
  'Operations': [
    'Business Operations',
    'Supply Chain / Logistics',
    'Program Associate'
  ],
  'HR': [
    'Technical Recruiting',
    'People Operations',
    'Talent Acquisition'
  ],
  'Customer Support': [
    'Customer Success',
    'Technical Support Engineer',
    'Support Operations'
  ],
  'Other': ['General']
};

export const INDIAN_TECH_CITIES = [
  'Bengaluru',
  'Hyderabad',
  'Pune',
  'Delhi NCR',
  'Mumbai',
  'Chennai',
  'Kolkata',
  'Ahmedabad',
  'Remote (India)',
  'Unknown'
] as const;

export type IndianTechCity = typeof INDIAN_TECH_CITIES[number] | string;

export const INDIAN_STATES: Record<string, string> = {
  'Bengaluru': 'Karnataka',
  'Hyderabad': 'Telangana',
  'Pune': 'Maharashtra',
  'Mumbai': 'Maharashtra',
  'Delhi NCR': 'Delhi / Haryana / UP',
  'Chennai': 'Tamil Nadu',
  'Kolkata': 'West Bengal',
  'Ahmedabad': 'Gujarat',
  'Remote (India)': 'All India',
  'Unknown': 'Unknown'
};

export const EXPERIENCE_LEVELS = [
  'Fresher / Entry Level',
  'Internship',
  'Associate (0-1 yrs)',
  'Mid-Level (2-4 yrs)',
  'Senior (5+ yrs)'
] as const;

export type ExperienceLevel = typeof EXPERIENCE_LEVELS[number];

export const EMPLOYMENT_TYPES = [
  'full_time',
  'internship',
  'contract',
  'part_time'
] as const;

export type EmploymentType = typeof EMPLOYMENT_TYPES[number];
