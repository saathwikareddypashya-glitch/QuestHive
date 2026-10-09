import type { Category } from '../types';

export const seedCategories: Category[] = [
  {
    id: 'art-design', name: 'Art & Design', shortName: 'Art & Design', emoji: '🎨',
    description: 'Draw, paint, design and create visual work.',
    subjects: ['Drawing', 'Painting', 'Digital Art', 'Illustration', 'Photography', 'Video Editing', 'Animation', '3D Modeling', 'Blender', 'Graphic Design', 'UI/UX Design', 'Calligraphy'],
  },
  {
    id: 'music', name: 'Music', shortName: 'Music', emoji: '🎵',
    description: 'Instruments, voice, theory and production.',
    subjects: ['Guitar', 'Piano', 'Keyboard', 'Violin', 'Drums', 'Singing', 'Music Theory', 'Music Production', 'DJing', 'Ukulele', 'Flute', 'Saxophone', 'Beat Making'],
  },
  {
    id: 'technology', name: 'Technology', shortName: 'Technology', emoji: '💻',
    description: 'Code, data, AI and the maths behind it.',
    subjects: ['Python', 'Java', 'JavaScript', 'C/C++', 'React', 'Web Development', 'App Development', 'Data Science', 'Machine Learning', 'Generative AI', 'Cybersecurity', 'Cloud Computing', 'SQL', 'Mathematics'],
  },
  {
    id: 'personal-development', name: 'Personal & Professional Development', shortName: 'Personal Development', emoji: '🧠',
    description: 'Speak, lead, think and grow with confidence.',
    subjects: ['Public Speaking', 'Communication', 'Leadership', 'Time Management', 'Study Skills', 'Memory Techniques', 'Critical Thinking', 'Problem Solving', 'Negotiation', 'Debate', 'Confidence Building', 'Interview Skills', 'Career Planning', 'Resume/CV Building', 'Presentation Skills', 'Yoga'],
  },
  {
    id: 'business', name: 'Business & Productivity', shortName: 'Business', emoji: '💼',
    description: 'Spreadsheets, marketing, strategy and money.',
    subjects: ['Excel', 'Power BI', 'Tableau', 'Digital Marketing', 'SEO', 'Project Management', 'Business Analysis', 'Product Management', 'Financial Analysis', 'Investment Basics', 'Entrepreneurship'],
  },
  {
    id: 'writing', name: 'Writing & Creative', shortName: 'Writing & Creative', emoji: '✍️',
    description: 'Stories, copy, content and songs.',
    subjects: ['Creative Writing', 'Storytelling', 'Content Writing', 'Copywriting', 'Songwriting'],
  },
];

export const POPULAR_SEARCHES = ['Guitar', 'Python', 'Public Speaking', 'UI/UX', 'Photography', 'Excel'];
