import type { AvailabilityRange, Day, Gender, Teacher, TeacherStatus } from '../types';
import { demoCertificate } from '../utils/images';
import { addDays, toISODate } from '../utils/formatters';

const R = (day: Day, start: string, end: string): AvailabilityRange => ({ id: `${day}-${start}-${end}`, day, start, end });

const patterns: Record<string, AvailabilityRange[]> = {
  gunjan: [R('Monday', '17:00', '20:00'), R('Wednesday', '17:00', '20:00'), R('Saturday', '10:00', '13:00'), R('Saturday', '17:00', '19:00')],
  eveningsTT: [R('Tuesday', '18:00', '21:00'), R('Thursday', '18:00', '21:00'), R('Sunday', '09:00', '12:00')],
  mornings: [R('Monday', '07:00', '09:00'), R('Wednesday', '07:00', '09:00'), R('Friday', '07:00', '09:00'), R('Saturday', '08:00', '11:00')],
  weekends: [R('Friday', '19:00', '21:00'), R('Saturday', '10:00', '13:00'), R('Sunday', '10:00', '13:00')],
  weekdays: [R('Monday', '16:00', '19:00'), R('Tuesday', '16:00', '19:00'), R('Thursday', '16:00', '19:00')],
  mixed: [R('Wednesday', '18:00', '21:00'), R('Friday', '17:00', '20:00'), R('Sunday', '15:00', '18:00')],
};

interface Raw {
  id: string; name: string; gender: Gender; portrait: string; location: string; online?: boolean;
  subject: string; category: string; rating: number; reviewCount: number; price: number; exp: number;
  description: string; bio: string; qualifications: string[]; skills: string[]; style: string;
  languages?: string[]; avail: keyof typeof patterns; students: number; classes: number;
  status?: TeacherStatus; firstFree?: boolean; joinedDaysAgo?: number; submittedDaysAgo?: number;
  certTitle?: string; certIssuer?: string; rejectionReason?: string;
}

const raw: Raw[] = [
  {
    id: 't1', name: 'Manisha', gender: 'Female', portrait: 'women/44', location: 'Bengaluru', subject: 'Yoga', category: 'personal-development',
    rating: 4.9, reviewCount: 25, price: 2500, exp: 8, avail: 'mornings', students: 96, classes: 410,
    description: 'Yoga cultivates self-worth and peace. Gentle Hatha and Vinyasa sessions for every level.',
    bio: 'I have been practising yoga for over fifteen years and teaching for eight. My classes blend breath work, mobility and mindful movement so you leave calmer and stronger than you arrived. I work with complete beginners, desk workers with stiff backs and people returning after injury.',
    qualifications: ['RYT-500, Yoga Alliance', 'Diploma in Yoga Therapy, S-VYASA'], skills: ['Hatha', 'Vinyasa', 'Pranayama', 'Meditation', 'Mobility'],
    style: 'Slow, breath-led sessions with clear alignment cues. Every class ends with a short guided relaxation.', languages: ['English', 'Kannada', 'Hindi'],
  },
  {
    id: 't2', name: 'Gunjan', gender: 'Female', portrait: 'women/68', location: 'New Delhi', subject: 'Guitar', category: 'music',
    rating: 5.0, reviewCount: 184, price: 2000, exp: 10, avail: 'gunjan', students: 312, classes: 1240,
    description: 'Learn guitar and ukulele online from a professional performing musician.',
    bio: 'I am a session guitarist and live performer who has toured with three indie bands. I started teaching to share the shortcuts I wish someone had shown me. We will learn songs you actually like from week one, and build technique and theory around them.',
    qualifications: ['Grade 8 Guitar, Trinity College London', 'B.Mus, Delhi School of Music'], skills: ['Acoustic guitar', 'Electric guitar', 'Ukulele', 'Fingerstyle', 'Music theory'],
    style: 'Song-first learning. Each class has one technique goal, one song section and a short practice plan for the week.', languages: ['English', 'Hindi'],
  },
  {
    id: 't3', name: 'Khushi', gender: 'Female', portrait: 'women/21', location: 'Mumbai', subject: 'Mathematics', category: 'technology',
    rating: 5.0, reviewCount: 40, price: 1500, exp: 6, avail: 'weekdays', students: 140, classes: 620,
    description: 'Math coach for school boards and competitive exams like JEE and Olympiads.',
    bio: 'I help students stop being afraid of maths. I break every topic into small, visual steps and we practise until it feels obvious. Most of my students come to me for CBSE, ICSE or JEE preparation.',
    qualifications: ['M.Sc Mathematics, University of Mumbai', 'B.Ed'], skills: ['Algebra', 'Calculus', 'Trigonometry', 'JEE prep', 'Olympiad problems'],
    style: 'Concept first, then lots of guided practice. I share worksheets after every class.', languages: ['English', 'Hindi', 'Marathi'],
  },
  {
    id: 't4', name: 'Arjun', gender: 'Male', portrait: 'men/32', location: 'Hyderabad', subject: 'Python', category: 'technology',
    rating: 4.8, reviewCount: 96, price: 1800, exp: 7, avail: 'eveningsTT', students: 210, classes: 880,
    description: 'Backend engineer teaching Python from zero to real projects and interviews.',
    bio: 'I write Python for a living at a fintech company in Hyderabad. I teach the way I learnt on the job: by building small, useful projects. Beginners finish with a portfolio, and experienced students get interview-ready.',
    qualifications: ['B.Tech CSE, JNTU Hyderabad', 'AWS Certified Developer'], skills: ['Python', 'Data structures', 'Flask', 'Automation', 'Interview prep'],
    style: 'Live coding together, then you drive. Homework is a small project each week.', languages: ['English', 'Telugu', 'Hindi'],
  },
  {
    id: 't5', name: 'Ananya', gender: 'Female', portrait: 'women/65', location: 'Bengaluru', subject: 'UI/UX Design', category: 'art-design',
    rating: 4.9, reviewCount: 62, price: 2200, exp: 5, avail: 'mixed', students: 118, classes: 390,
    description: 'Product designer helping you learn Figma, design thinking and build a portfolio.',
    bio: 'I design mobile apps at a Bengaluru startup. In our classes you will learn research, wireframing, visual design and prototyping in Figma, and finish with two case studies for your portfolio.',
    qualifications: ['B.Des, NID Bengaluru', 'Google UX Design Certificate'], skills: ['Figma', 'Wireframing', 'User research', 'Prototyping', 'Portfolio reviews'],
    style: 'Project-based with honest design critiques every week.', languages: ['English', 'Tamil'],
  },
  {
    id: 't6', name: 'Rahul', gender: 'Male', portrait: 'men/46', location: 'Jaipur', online: false, subject: 'Photography', category: 'art-design',
    rating: 4.7, reviewCount: 51, price: 1700, exp: 9, avail: 'weekends', students: 160, classes: 520,
    description: 'Travel and portrait photographer teaching camera basics, lighting and editing.',
    bio: 'I shoot travel stories and portraits across Rajasthan. Classes happen in person around Jaipur so you can practise light and composition in real locations. We also cover Lightroom editing.',
    qualifications: ['Diploma in Photography, Light & Life Academy'], skills: ['Manual mode', 'Composition', 'Portrait lighting', 'Lightroom', 'Street photography'],
    style: 'Hands-on photo walks with a review session after each one.', languages: ['English', 'Hindi'],
  },
  {
    id: 't7', name: 'Meera', gender: 'Female', portrait: 'women/12', location: 'Chennai', subject: 'Public Speaking', category: 'personal-development',
    rating: 4.9, reviewCount: 77, price: 1600, exp: 8, avail: 'weekdays', students: 190, classes: 610,
    description: 'Speak with confidence in interviews, presentations and on stage.',
    bio: 'I am a former radio host and a corporate communication trainer. I help students and professionals overcome stage fear, structure their ideas and deliver them with presence.',
    qualifications: ['MA Mass Communication, University of Madras', 'Toastmasters Distinguished Toastmaster'], skills: ['Stage presence', 'Storytelling', 'Interview answers', 'Voice modulation', 'Presentations'],
    style: 'Short talks recorded in class, then feedback you can act on immediately.', languages: ['English', 'Tamil'],
  },
  {
    id: 't8', name: 'Aarav', gender: 'Male', portrait: 'men/75', location: 'Pune', subject: 'Excel', category: 'business',
    rating: 4.8, reviewCount: 120, price: 1200, exp: 6, avail: 'eveningsTT', students: 260, classes: 940,
    description: 'Excel from formulas to dashboards for students, analysts and small businesses.',
    bio: 'I am a financial analyst who lives in spreadsheets. I teach Excel through real datasets: sales reports, budgets and attendance sheets. You will learn formulas, pivot tables, charts and automation.',
    qualifications: ['MBA Finance, Symbiosis', 'Microsoft Office Specialist: Excel Expert'], skills: ['Formulas', 'Pivot tables', 'XLOOKUP', 'Dashboards', 'Macros'],
    style: 'Practical and fast-paced. Every class uses a real business file.', languages: ['English', 'Hindi', 'Marathi'],
  },
  {
    id: 't9', name: 'Priya', gender: 'Female', portrait: 'women/90', location: 'Kolkata', subject: 'Piano', category: 'music',
    rating: 4.9, reviewCount: 88, price: 1900, exp: 12, avail: 'weekdays', students: 175, classes: 1020,
    description: 'Classical and contemporary piano for children and adults, with exam prep.',
    bio: 'I trained in Western classical piano and have prepared over a hundred students for Trinity and ABRSM exams. I also teach pop and film music for those who just want to play for fun.',
    qualifications: ['LTCL Piano Performance, Trinity College London'], skills: ['Classical piano', 'Sight reading', 'Chords', 'Exam prep', 'Film music'],
    style: 'Patient and structured. Short daily practice routines that fit busy schedules.', languages: ['English', 'Bengali', 'Hindi'],
  },
  {
    id: 't10', name: 'Karan', gender: 'Male', portrait: 'men/22', location: 'Gurugram', subject: 'Digital Marketing', category: 'business',
    rating: 4.6, reviewCount: 45, price: 2000, exp: 7, avail: 'mixed', students: 98, classes: 330,
    description: 'Run real campaigns: SEO, social media ads, email and analytics.',
    bio: 'I lead growth at a D2C brand. I teach the marketing that actually moves numbers: search, paid social, email and analytics. You will run a small live campaign as part of the course.',
    qualifications: ['Google Ads Certified', 'Meta Certified Media Buying Professional'], skills: ['SEO', 'Meta Ads', 'Google Ads', 'Email marketing', 'GA4'],
    style: 'Case studies and live dashboards rather than slides.', languages: ['English', 'Hindi'],
  },
  {
    id: 't11', name: 'Sneha', gender: 'Female', portrait: 'women/33', location: 'Hyderabad', subject: 'Machine Learning', category: 'technology',
    rating: 4.9, reviewCount: 70, price: 2800, exp: 6, avail: 'eveningsTT', students: 132, classes: 450,
    description: 'ML engineer teaching machine learning, deep learning and GenAI with projects.',
    bio: 'I build recommendation systems at a large tech company. I teach the maths intuitively and focus on building: from regression to neural networks to working with LLM APIs.',
    qualifications: ['M.Tech AI, IIIT Hyderabad', 'TensorFlow Developer Certificate'], skills: ['scikit-learn', 'PyTorch', 'Feature engineering', 'LLMs', 'MLOps basics'],
    style: 'Intuition first, then code in notebooks together.', languages: ['English', 'Telugu'],
  },
  {
    id: 't12', name: 'Rohan', gender: 'Male', portrait: 'men/52', location: 'Mumbai', subject: 'Video Editing', category: 'art-design',
    rating: 4.7, reviewCount: 39, price: 1500, exp: 5, avail: 'weekends', students: 88, classes: 260,
    description: 'Edit YouTube videos, reels and short films in Premiere Pro and DaVinci Resolve.',
    bio: 'I edit for creators with over a million subscribers. I will teach you cutting for pace, colour, sound and the workflow tricks that save hours.',
    qualifications: ['Diploma in Film Editing, Whistling Woods'], skills: ['Premiere Pro', 'DaVinci Resolve', 'Colour grading', 'Reels', 'Sound design'],
    style: 'Bring your own footage and we edit it together.', languages: ['English', 'Hindi'],
  },
  {
    id: 't13', name: 'Ishita', gender: 'Female', portrait: 'women/57', location: 'Dehradun', subject: 'Creative Writing', category: 'writing',
    rating: 4.8, reviewCount: 33, price: 1300, exp: 7, avail: 'mixed', students: 74, classes: 290,
    description: 'Published author helping you write fiction, poetry and personal essays.',
    bio: 'I have published two short story collections and teach writing workshops in the hills. I help you find your voice, finish drafts and edit them into something you are proud of.',
    qualifications: ['MA English Literature, Delhi University'], skills: ['Short fiction', 'Poetry', 'Personal essays', 'Editing', 'Writing habits'],
    style: 'Gentle workshops with prompts, reading and line-by-line feedback.', languages: ['English', 'Hindi'],
  },
  {
    id: 't14', name: 'Vikram', gender: 'Male', portrait: 'men/61', location: 'Bengaluru', subject: 'Entrepreneurship', category: 'business',
    rating: 4.8, reviewCount: 28, price: 3000, exp: 15, avail: 'weekends', students: 54, classes: 180,
    description: 'Two-time founder mentoring on ideas, validation, pitching and early growth.',
    bio: 'I have built and sold two startups. I mentor students and first-time founders on finding a real problem, validating it cheaply, building an MVP and pitching to investors.',
    qualifications: ['MBA, IIM Bangalore'], skills: ['Idea validation', 'Pitch decks', 'Fundraising', 'Go-to-market', 'Unit economics'],
    style: 'Mentoring conversations focused on your idea and your next step.', languages: ['English', 'Hindi', 'Kannada'],
  },
  {
    id: 't15', name: 'Nisha', gender: 'Female', portrait: 'women/79', location: 'Lucknow', subject: 'Singing', category: 'music',
    rating: 5.0, reviewCount: 104, price: 1800, exp: 11, avail: 'mornings', students: 205, classes: 870,
    description: 'Hindustani classical, Bollywood and western vocals with breath and pitch training.',
    bio: 'I trained in Hindustani classical music for eighteen years and perform at concerts across North India. I teach pitch, breath control and expression, whatever style you want to sing.',
    qualifications: ['Sangeet Visharad, Gandharva Mahavidyalaya'], skills: ['Hindustani classical', 'Bollywood', 'Breath control', 'Pitch training', 'Riyaz routines'],
    style: 'Warm-ups, riyaz and one song each month.', languages: ['Hindi', 'English', 'Urdu'],
  },
  {
    id: 't16', name: 'Siddharth', gender: 'Male', portrait: 'men/85', location: 'Shillong', subject: 'Drums', category: 'music',
    rating: 4.8, reviewCount: 57, price: 1600, exp: 9, avail: 'mixed', students: 92, classes: 400,
    description: 'Rock, funk and jazz drumming with solid fundamentals and groove.',
    bio: 'I play drums with a Shillong rock band and teach rudiments, timing and groove for every style.',
    qualifications: ['Grade 8 Drums, Rockschool'], skills: ['Rudiments', 'Groove', 'Reading', 'Fills', 'Timing'],
    style: 'Play-along tracks and a metronome. Lots of fun, lots of repetition.', languages: ['English', 'Khasi'],
  },
  {
    id: 't17', name: 'Dev', gender: 'Male', portrait: 'men/14', location: 'Ahmedabad', subject: 'Web Development', category: 'technology',
    rating: 4.5, reviewCount: 12, price: 1400, exp: 3, avail: 'weekdays', students: 21, classes: 60, status: 'unverified', firstFree: false,
    description: 'Build websites with HTML, CSS, JavaScript and React from scratch.',
    bio: 'Full-stack developer teaching beginner-friendly web development with lots of small projects.',
    qualifications: ['BCA, Gujarat University'], skills: ['HTML', 'CSS', 'JavaScript', 'React', 'Git'],
    style: 'Build one small page every class.', languages: ['English', 'Gujarati', 'Hindi'],
  },
  {
    id: 't18', name: 'Kavya', gender: 'Female', portrait: 'women/26', location: 'Kochi', subject: 'Drawing', category: 'art-design',
    rating: 4.6, reviewCount: 9, price: 1000, exp: 2, avail: 'weekends', students: 15, classes: 40, status: 'unverified',
    description: 'Sketching and pencil drawing for beginners of all ages.',
    bio: 'Fine arts graduate teaching observational drawing, shading and perspective.',
    qualifications: ['BFA, RLV College of Music and Fine Arts'], skills: ['Sketching', 'Shading', 'Perspective', 'Still life'],
    style: 'Draw from real objects with step-by-step demos.', languages: ['English', 'Malayalam'],
  },
  // Applications awaiting admin review
  {
    id: 'p1', name: 'Aditi', gender: 'Female', portrait: 'women/5', location: 'Indore', subject: 'Calligraphy', category: 'art-design',
    rating: 0, reviewCount: 0, price: 1100, exp: 4, avail: 'weekends', students: 0, classes: 0, status: 'pending', submittedDaysAgo: 1,
    description: 'Modern and brush calligraphy for journals, cards and lettering.',
    bio: 'I run a small lettering studio and teach modern calligraphy workshops for beginners.',
    qualifications: ['Certified Calligraphy Instructor, Letterform Academy'], skills: ['Brush pen', 'Modern calligraphy', 'Lettering'],
    style: 'Drills first, then words and layouts.', certTitle: 'Calligraphy Instructor Programme', certIssuer: 'Letterform Academy, 2023',
  },
  {
    id: 'p2', name: 'Farhan', gender: 'Male', portrait: 'men/3', location: 'Hyderabad', subject: 'Cybersecurity', category: 'technology',
    rating: 0, reviewCount: 0, price: 2400, exp: 6, avail: 'eveningsTT', students: 0, classes: 0, status: 'pending', submittedDaysAgo: 2,
    description: 'Ethical hacking, network security and CTF preparation.',
    bio: 'Security analyst at a SOC. I teach practical security with hands-on labs.',
    qualifications: ['CEH, EC-Council', 'B.Tech IT'], skills: ['Ethical hacking', 'Networking', 'CTFs', 'Linux'],
    style: 'Lab-based learning in safe practice environments.', certTitle: 'Certified Ethical Hacker (CEH)', certIssuer: 'EC-Council, 2022',
  },
  {
    id: 'p3', name: 'Lakshmi', gender: 'Female', portrait: 'women/8', location: 'Chennai', subject: 'Violin', category: 'music',
    rating: 0, reviewCount: 0, price: 1700, exp: 10, avail: 'mornings', students: 0, classes: 0, status: 'pending', submittedDaysAgo: 3,
    description: 'Carnatic and western violin for beginners and intermediates.',
    bio: 'Concert violinist teaching Carnatic and western violin.',
    qualifications: ['MA Music, Madras University'], skills: ['Carnatic violin', 'Western violin', 'Bowing technique'],
    style: 'Traditional structure with modern practice tools.', certTitle: 'Master of Arts in Music', certIssuer: 'University of Madras, 2015',
  },
  {
    id: 'p4', name: 'Neil', gender: 'Male', portrait: 'men/9', location: 'Pune', subject: 'Power BI', category: 'business',
    rating: 0, reviewCount: 0, price: 1800, exp: 5, avail: 'weekdays', students: 0, classes: 0, status: 'pending', submittedDaysAgo: 4,
    description: 'Power BI dashboards, DAX and data modelling for analysts.',
    bio: 'BI developer building dashboards for manufacturing companies.',
    qualifications: ['Microsoft Certified: Power BI Data Analyst'], skills: ['Power BI', 'DAX', 'Data modelling'],
    style: 'Real datasets and step-by-step dashboard builds.', certTitle: 'Power BI Data Analyst Associate', certIssuer: 'Microsoft, 2024',
  },
  {
    id: 'p5', name: 'Zoya', gender: 'Female', portrait: 'women/15', location: 'Delhi', subject: 'Copywriting', category: 'writing',
    rating: 0, reviewCount: 0, price: 1500, exp: 4, avail: 'mixed', students: 0, classes: 0, status: 'pending', submittedDaysAgo: 6,
    description: 'Write copy that sells: ads, landing pages and emails.',
    bio: 'Freelance copywriter for D2C brands and startups.',
    qualifications: ['Diploma in Advertising, MICA'], skills: ['Ad copy', 'Landing pages', 'Email copy'],
    style: 'Rewrite real ads together and learn why the changes work.', certTitle: 'Diploma in Advertising', certIssuer: 'MICA Ahmedabad, 2021',
  },
  {
    id: 'r1', name: 'Mohit', gender: 'Male', portrait: 'men/17', location: 'Noida', subject: 'SEO', category: 'business',
    rating: 0, reviewCount: 0, price: 900, exp: 1, avail: 'weekdays', students: 0, classes: 0, status: 'rejected', submittedDaysAgo: 12,
    description: 'SEO basics for bloggers.', bio: 'Blogger sharing SEO tips.', qualifications: ['Self-taught'], skills: ['On-page SEO'],
    style: 'Informal sessions.', certTitle: 'Online SEO Course', certIssuer: 'Unverified provider',
    rejectionReason: 'The uploaded certificate could not be verified. Please upload proof from a recognised provider.',
  },
];

export function seedTeachers(): Teacher[] {
  const now = new Date();
  return raw.map((r) => {
    const status: TeacherStatus = r.status ?? 'verified';
    const submittedAt = toISODate(addDays(now, -(r.submittedDaysAgo ?? 400)));
    return {
      id: r.id,
      name: r.name,
      gender: r.gender,
      email: `${r.name.toLowerCase()}@questhive.demo`,
      image: `/images/teachers/${r.id}.jpg`,
      imageFallback: `https://randomuser.me/api/portraits/${r.portrait}.jpg`,
      location: r.location,
      online: r.online ?? true,
      subject: r.subject,
      category: r.category,
      rating: r.rating,
      reviewCount: r.reviewCount,
      description: r.description,
      bio: r.bio,
      price: r.price,
      experienceYears: r.exp,
      qualifications: r.qualifications,
      skills: r.skills,
      teachingStyle: r.style,
      languages: r.languages ?? ['English', 'Hindi'],
      verified: status === 'verified',
      status,
      firstClassFree: r.firstFree ?? true,
      studentCount: r.students,
      completedClasses: r.classes,
      availability: patterns[r.avail].map((a) => ({ ...a })),
      classDurationMins: 60,
      joinedAt: toISODate(addDays(now, -(r.joinedDaysAgo ?? 300 + r.exp * 20))),
      submittedAt,
      verifiedAt: status === 'verified' ? submittedAt : undefined,
      certificate: demoCertificate(r.name, r.certTitle ?? r.qualifications[0], r.certIssuer ?? 'Verified by QuestHive'),
      certificateName: `${r.name.toLowerCase()}-certificate.png`,
      rejectionReason: r.rejectionReason,
    };
  });
}
