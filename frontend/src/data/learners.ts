import type { Learner } from '../types';
import { addDays, toISODate } from '../utils/formatters';

const list: [string, string, 'Female' | 'Male', string, number][] = [
  ['L1', 'Ananya Sharma', 'Female', 'women/47', 4.8],
  ['L2', 'Rohit Verma', 'Male', 'men/41', 4.6],
  ['L3', 'Diya Kapoor', 'Female', 'women/50', 4.9],
  ['L4', 'Aditya Nair', 'Male', 'men/36', 4.7],
  ['L5', 'Sanya Malhotra', 'Female', 'women/62', 4.8],
  ['L6', 'Kabir Singh', 'Male', 'men/29', 4.5],
  ['L7', 'Riya Desai', 'Female', 'women/38', 4.9],
  ['L8', 'Arnav Gupta', 'Male', 'men/55', 4.7],
  ['L9', 'Pooja Reddy', 'Female', 'women/72', 4.8],
  ['L10', 'Ishaan Mehta', 'Male', 'men/66', 4.6],
];

export function seedLearners(): Learner[] {
  return list.map(([id, name, gender, portrait, rating], i) => ({
    id,
    name,
    gender,
    email: `${name.split(' ')[0].toLowerCase()}@questhive.demo`,
    avatar: `https://randomuser.me/api/portraits/${portrait}.jpg`,
    rating,
    ratingNote: rating >= 4.8 ? 'Reliable, punctual and engaged.' : 'Shows up prepared and asks good questions.',
    joinedAt: toISODate(addDays(new Date(), -(240 - i * 15))),
    location: ['Hyderabad', 'Delhi', 'Mumbai', 'Kochi', 'Pune'][i % 5],
  }));
}
