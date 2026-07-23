import { Movie, Showtime, FoodItem, UserProfile, Booking, Seat, StaffAccount, ScanLog } from '../types';

export const INITIAL_STAFF_ACCOUNTS: StaffAccount[] = [
  {
    id: 'staff-1',
    staffId: 'STF-001',
    fullName: 'Ramesh Sharma',
    email: 'stf001@gajuricinemas.com',
    phone: '+977 9851011122',
    branch: 'Gajuri Main Branch',
    assignedHall: 'All Screens',
    role: 'Counter Staff',
    isActive: true,
    createdAt: '2026-01-15T08:00:00Z',
    lastLoginAt: '2026-07-23T07:30:00Z'
  },
  {
    id: 'staff-2',
    staffId: 'STF-002',
    fullName: 'Sita Thapa',
    email: 'stf002@gajuricinemas.com',
    phone: '+977 9841998877',
    branch: 'Gajuri Main Branch',
    assignedHall: 'Hall 1 - IMAX 3D Laser',
    role: 'Gate Scanner',
    isActive: true,
    createdAt: '2026-02-01T09:15:00Z',
    lastLoginAt: '2026-07-23T08:00:00Z'
  },
  {
    id: 'staff-3',
    staffId: 'STF-003',
    fullName: 'Bikash Gurung',
    email: 'stf003@gajuricinemas.com',
    phone: '+977 9812345678',
    branch: 'Gajuri Main Branch',
    assignedHall: 'All Screens',
    role: 'Cinema Manager',
    isActive: true,
    createdAt: '2026-01-01T10:00:00Z',
    lastLoginAt: '2026-07-23T06:45:00Z'
  }
];

export const INITIAL_SCAN_LOGS: ScanLog[] = [
  {
    id: 'log-101',
    bookingId: 'GAJ-20260723-8831',
    staffId: 'STF-002',
    staffName: 'Sita Thapa',
    scanMethod: 'camera',
    scanResult: 'valid',
    scannedAt: '2026-07-23T10:45:12Z',
    deviceInfo: 'Galaxy A54 (Android 14)',
    branch: 'Gajuri Main Branch'
  }
];

export const INITIAL_MOVIES: Movie[] = [
  {
    id: 'm-1',
    title: 'Purna Bahadur Ko Sarangi',
    poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=800',
    backdrop: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=1600',
    synopsis: 'A heartfelt emotional story rooted in the Gandharva music tradition of Nepal, following a struggling father who sacrifices everything to educate his son in the hills of Nepal.',
    duration: '2h 22m',
    releaseDate: '2026-07-10',
    genre: ['Drama', 'Family', 'Nepali Culture'],
    rating: 9.4,
    ageRating: 'U',
    censorRating: 'U (Nepal Censor Board)',
    languages: ['Nepali', 'English Subtitles'],
    industry: 'Nepali',
    status: 'NOW_SHOWING',
    youtubeTrailerUrl: 'https://www.youtube.com/embed/5-p5f2M1Yc8',
    director: 'Saroj Pauydel',
    cast: [
      { name: 'Vijay Baral', role: 'Purna Bahadur', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300' },
      { name: 'Prakash Saput', role: 'Kamal', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300' },
      { name: 'Anjan Babu', role: 'Young Kamal', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300' }
    ],
    hallType: 'Hall 1 - IMAX 3D Laser',
    featured: true
  },
  {
    id: 'm-2',
    title: 'Mahajatra',
    poster: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&q=80&w=800',
    backdrop: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=1600',
    synopsis: 'The hilarious third installment in the Jatra series. Three ordinary friends accidentally find themselves entangled in an illegal gold smuggling conspiracy across Nepal.',
    duration: '2h 18m',
    releaseDate: '2026-07-05',
    genre: ['Comedy', 'Crime', 'Drama'],
    rating: 9.0,
    ageRating: 'U',
    censorRating: 'U (Nepal Censor Board)',
    languages: ['Nepali'],
    industry: 'Nepali',
    status: 'NOW_SHOWING',
    youtubeTrailerUrl: 'https://www.youtube.com/embed/6iW4JjO5NGE',
    director: 'Pradeep Bhattarai',
    cast: [
      { name: 'Vipin Karki', role: 'Phanindra', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300' },
      { name: 'Rabindra Singh Baniya', role: 'Joyes', image: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=300' },
      { name: 'Rabindra Jha', role: 'Munna', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=300' }
    ],
    hallType: 'Hall 2 - Gajuri Dolby Atmos',
    featured: true
  },
  {
    id: 'm-3',
    title: 'Shambhala',
    poster: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&q=80&w=800',
    backdrop: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&q=80&w=1600',
    synopsis: 'Selected for Berlin International Film Festival, Shambhala follows a pregnant woman in the high Himalayas who embarks on an arduous trek across the wilderness to find her missing husband.',
    duration: '2h 30m',
    releaseDate: '2026-07-01',
    genre: ['Drama', 'Adventure', 'Mystery'],
    rating: 9.2,
    ageRating: 'U/A',
    censorRating: 'U/A (Nepal Censor Board)',
    languages: ['Nepali', 'Tibetan', 'English Subtitles'],
    industry: 'Nepali',
    status: 'NOW_SHOWING',
    youtubeTrailerUrl: 'https://www.youtube.com/embed/7S8bF5d9ZMo',
    director: 'Min Bahadur Bham',
    cast: [
      { name: 'Thinley Lhamo', role: 'Pema', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300' },
      { name: 'Sonam Topden', role: 'Karma', image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=300' }
    ],
    hallType: 'Hall 1 - IMAX 3D Laser',
    featured: false
  },
  {
    id: 'm-4',
    title: 'Kalki 2898 AD',
    poster: 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?auto=format&fit=crop&q=80&w=800',
    backdrop: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=1600',
    synopsis: 'A futuristic sci-fi mythic spectacle. In the dystopian year 2898 AD, a modern avatar of Vishnu descends to protect the pregnant mother of the prophesied savior.',
    duration: '3h 01m',
    releaseDate: '2026-06-27',
    genre: ['Sci-Fi', 'Action', 'Mythology'],
    rating: 8.8,
    ageRating: 'U/A',
    censorRating: 'U/A (Nepal Censor Board)',
    languages: ['Hindi', 'Nepali Subtitles'],
    industry: 'Bollywood',
    status: 'NOW_SHOWING',
    youtubeTrailerUrl: 'https://www.youtube.com/embed/k91JvH51u-0',
    director: 'Nag Ashwin',
    cast: [
      { name: 'Prabhas', role: 'Bhairava', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300' },
      { name: 'Amitabh Bachchan', role: 'Ashwatthama', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=300' },
      { name: 'Deepika Padukone', role: 'Sumathi', image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300' }
    ],
    hallType: 'Hall 1 - IMAX 3D Laser',
    featured: true
  },
  {
    id: 'm-5',
    title: 'Stree 2',
    poster: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&q=80&w=800',
    backdrop: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=1600',
    synopsis: 'The town of Chanderi is haunted by a new headless phantom known as Sarkata. Vicky and his loyal friends team up with the mysterious girl to protect Chanderi once again.',
    duration: '2h 29m',
    releaseDate: '2026-07-12',
    genre: ['Horror', 'Comedy', 'Thriller'],
    rating: 8.9,
    ageRating: 'U/A',
    censorRating: 'U/A (Nepal Censor Board)',
    languages: ['Hindi', 'Nepali Subtitles'],
    industry: 'Bollywood',
    status: 'NOW_SHOWING',
    youtubeTrailerUrl: 'https://www.youtube.com/embed/KVnheXwqFkc',
    director: 'Amar Kaushik',
    cast: [
      { name: 'Rajkummar Rao', role: 'Vicky', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300' },
      { name: 'Shraddha Kapoor', role: 'Mysterious Woman', image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=300' },
      { name: 'Pankaj Tripathi', role: 'Rudra', image: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=300' }
    ],
    hallType: 'Hall 2 - Gajuri Dolby Atmos',
    featured: false
  },
  {
    id: 'm-6',
    title: 'Dune: Part Two',
    poster: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=800',
    backdrop: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&q=80&w=1600',
    synopsis: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family in Denis Villeneuve’s sci-fi epic.',
    duration: '2h 46m',
    releaseDate: '2026-06-20',
    genre: ['Sci-Fi', 'Adventure', 'Action'],
    rating: 8.9,
    ageRating: 'PG-13',
    censorRating: 'U/A (Nepal Censor Board)',
    languages: ['English', 'Nepali Subtitles'],
    industry: 'Hollywood',
    status: 'NOW_SHOWING',
    youtubeTrailerUrl: 'https://www.youtube.com/embed/Way9Dexny3w',
    director: 'Denis Villeneuve',
    cast: [
      { name: 'Timothée Chalamet', role: 'Paul Atreides', image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=300' },
      { name: 'Zendaya', role: 'Chani', image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=300' },
      { name: 'Javier Bardem', role: 'Stilgar', image: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=300' }
    ],
    hallType: 'Hall 1 - IMAX 3D Laser',
    featured: true
  },
  {
    id: 'm-7',
    title: 'Deadpool & Wolverine',
    poster: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&q=80&w=800',
    backdrop: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=1600',
    synopsis: 'Wolverine is recovering from his injuries when he crosses paths with the loudmouth Deadpool. They team up to defeat a common enemy in Marvel’s ultimate crossover.',
    duration: '2h 08m',
    releaseDate: '2026-07-18',
    genre: ['Action', 'Comedy', 'Sci-Fi'],
    rating: 8.7,
    ageRating: '18+',
    censorRating: 'A (18+ Nepal Censor Board)',
    languages: ['English 3D', 'Nepali Subtitles'],
    industry: 'Hollywood',
    status: 'NOW_SHOWING',
    youtubeTrailerUrl: 'https://www.youtube.com/embed/73_1biulkYk',
    director: 'Shawn Levy',
    cast: [
      { name: 'Ryan Reynolds', role: 'Wade Wilson / Deadpool', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300' },
      { name: 'Hugh Jackman', role: 'Logan / Wolverine', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300' }
    ],
    hallType: 'Hall 1 - IMAX 3D Laser',
    featured: false
  },
  {
    id: 'm-8',
    title: 'Gajuri Knights: Legend of Trishuli',
    poster: 'https://images.unsplash.com/photo-1514539079130-25950c84af65?auto=format&fit=crop&q=80&w=800',
    backdrop: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&q=80&w=1600',
    synopsis: 'Filmed on location along the roaring Trishuli river in Gajuri, Dhading. A mythic warrior protects the ancient river valley from warlords.',
    duration: '2h 35m',
    releaseDate: '2026-08-15',
    genre: ['Fantasy', 'Adventure', 'Action'],
    rating: 9.5,
    ageRating: 'U/A',
    censorRating: 'U/A (Nepal Censor Board)',
    languages: ['Nepali', 'English'],
    industry: 'Nepali',
    status: 'COMING_SOON',
    youtubeTrailerUrl: 'https://www.youtube.com/embed/d9MyW72ELq0',
    director: 'Nischal Basnet',
    cast: [
      { name: 'Anmol KC', role: 'Rudra', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=300' },
      { name: 'Swastima Khadka', role: 'Trishana', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300' }
    ],
    hallType: 'Hall 1 - IMAX 3D Laser',
    featured: true
  },
  {
    id: 'm-9',
    title: 'Pushpa 2: The Rule',
    poster: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=800',
    backdrop: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=1600',
    synopsis: 'Pushpa Raj expands his red sandalwood empire into an international cartel while facing off against his fiercest adversary Bhanwar Singh Shekhawat.',
    duration: '2h 55m',
    releaseDate: '2026-08-20',
    genre: ['Action', 'Thriller', 'Drama'],
    rating: 9.3,
    ageRating: 'U/A',
    censorRating: 'U/A (Nepal Censor Board)',
    languages: ['Hindi', 'Nepali Dubbed'],
    industry: 'Bollywood',
    status: 'COMING_SOON',
    youtubeTrailerUrl: 'https://www.youtube.com/embed/1kA03-iYyT8',
    director: 'Sukumar',
    cast: [
      { name: 'Allu Arjun', role: 'Pushpa Raj', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300' },
      { name: 'Rashmika Mandanna', role: 'Srivalli', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300' },
      { name: 'Fahadh Faasil', role: 'Bhanwar Singh', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300' }
    ],
    hallType: 'Hall 1 - IMAX 3D Laser',
    featured: true
  },
  {
    id: 'm-10',
    title: 'Gladiator II',
    poster: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&q=80&w=800',
    backdrop: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=1600',
    synopsis: 'Years after witnessing the death of Maximus, Lucius enters the Colosseum after his home is conquered by tyrant emperors. With rage in his heart, he fights for Rome.',
    duration: '2h 30m',
    releaseDate: '2026-08-22',
    genre: ['Action', 'Drama', 'History'],
    rating: 9.1,
    ageRating: '16+',
    censorRating: 'U/A (Nepal Censor Board)',
    languages: ['English', 'Nepali Subtitles'],
    industry: 'Hollywood',
    status: 'COMING_SOON',
    youtubeTrailerUrl: 'https://www.youtube.com/embed/4rgYUipGJNo',
    director: 'Ridley Scott',
    cast: [
      { name: 'Paul Mescal', role: 'Lucius Verus', image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=300' },
      { name: 'Pedro Pascal', role: 'Marcus Acacius', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300' },
      { name: 'Denzel Washington', role: 'Macrinus', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=300' }
    ],
    hallType: 'Hall 1 - IMAX 3D Laser',
    featured: false
  }
];

export const INITIAL_SHOWTIMES: Showtime[] = [
  // Today's showtimes for Unmesh (m-1)
  {
    id: 's-101',
    movieId: 'm-1',
    hallId: 'hall-1',
    hallName: 'Hall 1 - IMAX 3D Laser',
    date: '2026-07-23',
    time: '11:00 AM',
    format: 'IMAX 3D',
    prices: { regular: 350, executive: 500, vip: 800 },
    bookedSeatIds: ['A3', 'A4', 'C6', 'C7', 'D8', 'E5', 'E6', 'G1', 'G2'],
    blockedSeatIds: ['A1', 'A2']
  },
  {
    id: 's-102',
    movieId: 'm-1',
    hallId: 'hall-1',
    hallName: 'Hall 1 - IMAX 3D Laser',
    date: '2026-07-23',
    time: '02:30 PM',
    format: 'IMAX 3D',
    prices: { regular: 350, executive: 500, vip: 800 },
    bookedSeatIds: ['B1', 'B2', 'B3', 'D4', 'D5', 'G5'],
    blockedSeatIds: []
  },
  {
    id: 's-103',
    movieId: 'm-1',
    hallId: 'hall-1',
    hallName: 'Hall 1 - IMAX 3D Laser',
    date: '2026-07-23',
    time: '06:00 PM',
    format: 'IMAX 3D',
    prices: { regular: 400, executive: 550, vip: 900 },
    bookedSeatIds: ['C1', 'C2', 'D1', 'D2', 'D3', 'E4', 'F5', 'G3', 'G4', 'G5', 'G6'],
    blockedSeatIds: []
  },
  {
    id: 's-104',
    movieId: 'm-1',
    hallId: 'hall-1',
    hallName: 'Hall 1 - IMAX 3D Laser',
    date: '2026-07-23',
    time: '09:15 PM',
    format: 'IMAX 3D',
    prices: { regular: 350, executive: 500, vip: 800 },
    bookedSeatIds: ['E1', 'E2'],
    blockedSeatIds: []
  },
  // Dune: Part Two (m-2)
  {
    id: 's-201',
    movieId: 'm-2',
    hallId: 'hall-1',
    hallName: 'Hall 1 - IMAX 3D Laser',
    date: '2026-07-23',
    time: '01:00 PM',
    format: 'IMAX 3D',
    prices: { regular: 400, executive: 550, vip: 850 },
    bookedSeatIds: ['C3', 'C4', 'D6', 'G7'],
    blockedSeatIds: []
  },
  {
    id: 's-202',
    movieId: 'm-2',
    hallId: 'hall-1',
    hallName: 'Hall 1 - IMAX 3D Laser',
    date: '2026-07-23',
    time: '07:30 PM',
    format: 'IMAX 3D',
    prices: { regular: 400, executive: 550, vip: 850 },
    bookedSeatIds: ['D2', 'D3', 'D4', 'E5', 'E6', 'F7', 'G1'],
    blockedSeatIds: []
  },
  // Kabbadi 5 (m-3)
  {
    id: 's-301',
    movieId: 'm-3',
    hallId: 'hall-2',
    hallName: 'Hall 2 - Gajuri Dolby Atmos',
    date: '2026-07-23',
    time: '11:30 AM',
    format: 'Dolby Atmos',
    prices: { regular: 300, executive: 450, vip: 700 },
    bookedSeatIds: ['A5', 'A6', 'B7', 'B8'],
    blockedSeatIds: []
  },
  {
    id: 's-302',
    movieId: 'm-3',
    hallId: 'hall-2',
    hallName: 'Hall 2 - Gajuri Dolby Atmos',
    date: '2026-07-23',
    time: '05:30 PM',
    format: 'Dolby Atmos',
    prices: { regular: 350, executive: 500, vip: 750 },
    bookedSeatIds: ['C1', 'C2', 'C3', 'D4', 'E1'],
    blockedSeatIds: []
  },
  // Tomorrow's showtimes sample
  {
    id: 's-105',
    movieId: 'm-1',
    hallId: 'hall-1',
    hallName: 'Hall 1 - IMAX 3D Laser',
    date: '2026-07-24',
    time: '02:30 PM',
    format: 'IMAX 3D',
    prices: { regular: 350, executive: 500, vip: 800 },
    bookedSeatIds: ['B3', 'B4'],
    blockedSeatIds: []
  }
];

export const FOOD_ITEMS: FoodItem[] = [
  {
    id: 'f-1',
    name: 'Gajuri Butter Popcorn (Large)',
    category: 'Popcorn',
    price: 250,
    image: 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?auto=format&fit=crop&q=80&w=400',
    description: 'Freshly popped golden corn bathed in warm Himalayan mountain butter.',
    popular: true
  },
  {
    id: 'f-2',
    name: 'Caramel & Cheese Mix Popcorn',
    category: 'Popcorn',
    price: 300,
    image: 'https://images.unsplash.com/photo-1505686994434-e3cc5abf1330?auto=format&fit=crop&q=80&w=400',
    description: 'The ultimate salty & sweet pairing. Crunchy salted cheddar meets rich golden caramel.',
    popular: true
  },
  {
    id: 'f-3',
    name: 'Fountain Coca-Cola (750ml)',
    category: 'Beverages',
    price: 150,
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=400',
    description: 'Ice-cold refreshing fountain cola with crushed ice.'
  },
  {
    id: 'f-4',
    name: 'Gajuri IMAX Combo Deal',
    category: 'Combos',
    price: 480,
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=400',
    description: '1 Large Butter Popcorn + 2 Cold Drinks + 1 Nachos with Hot Cheese Dip.',
    popular: true
  },
  {
    id: 'f-5',
    name: 'Steamed Chicken Momo Basket (8 pcs)',
    category: 'Nepali Snacks',
    price: 280,
    image: 'https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?auto=format&fit=crop&q=80&w=400',
    description: 'Authentic Dhading special juicy chicken momo served with spicy tomato chutney.',
    popular: true
  },
  {
    id: 'f-6',
    name: 'Crispy Cheese Nachos',
    category: 'Nepali Snacks',
    price: 220,
    image: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?auto=format&fit=crop&q=80&w=400',
    description: 'Warm tortilla chips smothered in melted cheddar and sliced jalapeños.'
  }
];

export const INITIAL_USER: UserProfile = {
  name: 'Aayush Adhikari',
  email: 'aayush.gajuri@gmail.com',
  phone: '+977 9841234567',
  loyaltyPoints: 340,
  memberTier: 'Gajuri VIP',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'
};

export const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'GAJ-20260723-9102',
    movieId: 'm-1',
    movieTitle: 'Purna Bahadur Ko Sarangi',
    moviePoster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=800',
    showtimeId: 's-101',
    hallName: 'Hall 1 - IMAX 3D Laser',
    date: '2026-07-23',
    time: '11:00 AM',
    format: 'IMAX 3D',
    seatIds: ['E5', 'E6'],
    seatsDescription: 'Executive Row E (E5, E6)',
    snacks: [
      { foodId: 'f-1', name: 'Gajuri Butter Popcorn (Large)', quantity: 1, price: 250 },
      { foodId: 'f-3', name: 'Fountain Coca-Cola (750ml)', quantity: 2, price: 150 }
    ],
    ticketTotal: 1000,
    snackTotal: 550,
    taxAmount: 201.5,
    grandTotal: 1751.5,
    paymentMethod: 'eSewa',
    paymentTransactionId: 'ESEWA-99824102941',
    customerName: 'Aayush Adhikari',
    customerEmail: 'aayush.gajuri@gmail.com',
    customerPhone: '+977 9841234567',
    qrCodeData: 'GAJURI-TICKET-GAJ-20260723-9102-E5-E6',
    createdAt: '2026-07-22T14:30:00Z',
    status: 'CONFIRMED'
  },
  {
    id: 'GAJ-20260723-8831',
    movieId: 'm-1',
    movieTitle: 'Purna Bahadur Ko Sarangi',
    moviePoster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=800',
    showtimeId: 's-101',
    hallName: 'Hall 1 - IMAX 3D Laser',
    date: '2026-07-23',
    time: '11:00 AM',
    format: 'IMAX 3D',
    seatIds: ['C6', 'C7'],
    seatsDescription: 'Regular Row C (C6, C7)',
    snacks: [],
    ticketTotal: 700,
    snackTotal: 0,
    taxAmount: 91,
    grandTotal: 791,
    paymentMethod: 'Khalti',
    paymentTransactionId: 'KHALTI-88310921',
    customerName: 'Suman Shrestha',
    customerEmail: 'suman.shrestha@gmail.com',
    customerPhone: '+977 9801239988',
    qrCodeData: 'GAJURI-TICKET-GAJ-20260723-8831-C6-C7',
    createdAt: '2026-07-23T08:15:00Z',
    status: 'USED',
    scannedBy: 'STF-002',
    scannedByName: 'Sita Thapa',
    scannedAt: '2026-07-23T10:45:12Z'
  },
  {
    id: 'GAJ-20260723-7742',
    movieId: 'm-2',
    movieTitle: 'Mahajatra',
    moviePoster: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&q=80&w=800',
    showtimeId: 's-201',
    hallName: 'Hall 2 - Gajuri Dolby Atmos',
    date: '2026-07-23',
    time: '01:00 PM',
    format: 'Dolby Atmos',
    seatIds: ['C3', 'C4'],
    seatsDescription: 'Executive Row C (C3, C4)',
    snacks: [
      { foodId: 'f-5', name: 'Steamed Chicken Momo Basket (8 pcs)', quantity: 1, price: 280 }
    ],
    ticketTotal: 800,
    snackTotal: 280,
    taxAmount: 140.4,
    grandTotal: 1220.4,
    paymentMethod: 'IME Pay',
    paymentTransactionId: 'IMEPAY-77421102',
    customerName: 'Puja Karki',
    customerEmail: 'puja.karki@gmail.com',
    customerPhone: '+977 9861554433',
    qrCodeData: 'GAJURI-TICKET-GAJ-20260723-7742-C3-C4',
    createdAt: '2026-07-23T09:20:00Z',
    status: 'CONFIRMED'
  },
  {
    id: 'GAJ-20260723-6619',
    movieId: 'm-6',
    movieTitle: 'Dune: Part Two',
    moviePoster: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=800',
    showtimeId: 's-202',
    hallName: 'Hall 1 - IMAX 3D Laser',
    date: '2026-07-23',
    time: '07:30 PM',
    format: 'IMAX 3D',
    seatIds: ['G1', 'G2'],
    seatsDescription: 'VIP Row G (G1, G2)',
    snacks: [
      { foodId: 'f-4', name: 'Gajuri IMAX Combo Deal', quantity: 1, price: 480 }
    ],
    ticketTotal: 1700,
    snackTotal: 480,
    taxAmount: 283.4,
    grandTotal: 2463.4,
    paymentMethod: 'Card',
    paymentTransactionId: 'CARD-44910283',
    customerName: 'Rohan Joshi',
    customerEmail: 'rohan.joshi@gmail.com',
    customerPhone: '+977 9813990011',
    qrCodeData: 'GAJURI-TICKET-GAJ-20260723-6619-G1-G2',
    createdAt: '2026-07-23T10:00:00Z',
    status: 'CONFIRMED'
  }
];

// Generate seats for Hall 1 (Rows A-G, 12 seats per row)
export function generateHall1Seats(): Seat[] {
  const seats: Seat[] = [];
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
  
  rows.forEach((row) => {
    let type: 'regular' | 'executive' | 'vip' = 'regular';
    let price = 350;
    if (['D', 'E', 'F'].includes(row)) {
      type = 'executive';
      price = 500;
    } else if (row === 'G') {
      type = 'vip';
      price = 800;
    }

    for (let num = 1; num <= 12; num++) {
      const id = `${row}${num}`;
      seats.push({
        id,
        row,
        number: num,
        type,
        price,
        status: 'available'
      });
    }
  });

  return seats;
}
