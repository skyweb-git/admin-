import { getApiBaseUrl } from './leadStorage';

const API_BASE_URL = getApiBaseUrl();
const CONTENT_STORAGE_KEY = 'maytri_website_content_v1';
const CMS_CHANNEL_NAME = 'maytri_cms_sync_channel';

let broadcastChannel = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel(CMS_CHANNEL_NAME);
  }
} catch (e) {
  console.warn('BroadcastChannel not supported', e);
}

export const DEFAULT_CONTENT = {
  hero: {
    eyebrowBadge: 'MAYTRI GROUP',
    reraNumber: 'P02400007647',
    title: 'Exclusive Villa Township in Hyderabad',
    subheading: 'Spacious Villas with Picturesque Pathways & Rich Finishes',
    description: 'Surrounded by pristine landscapes and tree-lined avenues, experience an eco-friendly lifestyle designed for comfortable community living.',
    startingPrice: '₹3.8 Cr*',
    tokenAdvance: '₹5 Lakhs',
    highlights: [
      { title: '4.5 Acres', subtitle: 'Dedicated Green Park' },
      { title: 'Spacious Villas', subtitle: 'Picturesque Pathways' },
      { title: 'Rich Finishes', subtitle: 'Premium Living' },
      { title: 'All Age Groups', subtitle: 'Inclusive Villa Spaces' }
    ]
  },
  about: {
    sectionTitle: 'Where Nature Meets Architectural Opulence',
    tagline: 'A Masterpiece of Luxury Living in Shamshabad',
    description1: 'Nestled amidst 35+ acres of verdant serenity, Maytri Ambhuja is Hyderabad’s pinnacle luxury villa community crafted for discerning global citizens.',
    description2: 'Strategically located minutes from Shamshabad & ORR Exit 12, each villa is an epitome of timeless contemporary architecture with 100% Vaastu compliance.',
    totalVillas: '150+ Luxury Villas',
    totalAcres: '35+ Acres Township',
    clubhouseSize: '90,000 Sq.Ft Clubhouse'
  },
  clubhouse: {
    title: 'The Grand Ambhuja Clubhouse',
    tagline: '90,000 Sq.Ft of Resort-Class Leisure & Wellness',
    description: 'An architectural marvel offering 30+ bespoke luxury amenities including infinity pools, private 4K preview theatres, Olympic multi-sport arenas, and Ayurvedic spas.'
  },
  contact: {
    phone: '+91 98490 12345',
    whatsapp: '+91 98490 12345',
    email: 'info@sanghicity.in',
    infoEmail: 'info@sanghicity.in',
    websiteUrl: 'https://www.sanghicity.in',
    siteAddress: 'Maytri Ambhuja, Near ORR Exit 12, Shamshabad - Sanghi Nagar Road, Hyderabad, Telangana 501511',
    officeHours: 'Monday – Sunday: 9:30 AM – 7:30 PM'
  },
  brochure: {
    url: '/assets/maytri-ambhuja-brochure.pdf',
    modalTitle: 'Download Maytri Ambhuja Brochure',
    modalDesc: 'Receive the official villa township brochure featuring master plan details, 90,000 sq.ft clubhouse features, and 222 & 300 SQ YD floor plans.'
  },
  amenitiesSection: {
    eyebrowTag: 'RESORT-STYLE CONVENIENCES',
    title: 'Amenities',
    subtitle: 'A comprehensive suite of modern lifestyle, wellness, sports, and daily conveniences curated for all age groups.',
    items: [
      { name: 'Playing Area', category: 'Recreation', img: '/images/Icons/playingArea.webp', iconName: 'Gamepad2' },
      { name: 'Swimming Pool', category: 'Wellness', img: '/images/Icons/swimming.webp', iconName: 'Waves' },
      { name: 'Club House', category: 'Community', img: '/images/Icons/clubhouse.webp', iconName: 'Building2' },
      { name: 'Grocery Store', category: 'Convenience', img: '/images/Icons/groceryStore.webp', iconName: 'ShoppingBag' },
      { name: 'Gym', category: 'Fitness', img: '/images/Icons/gym.webp', iconName: 'Dumbbell' },
      { name: 'Indoor Games', category: 'Leisure', img: '/images/Icons/indoorGames.webp', iconName: 'Dices' },
      { name: 'Jogging Track', category: 'Fitness', img: '/images/Icons/jogging.webp', iconName: 'Footprints' },
      { name: 'Intercom System', category: 'Security', img: '/images/Icons/intercom.webp', iconName: 'PhoneCall' },
      { name: 'High-Speed Lifts', category: 'Infrastructure', img: '/images/Icons/lift.webp', iconName: 'ArrowUpDown' },
      { name: '4.5 Acre Central Park', category: 'Nature', img: '/images/Icons/park.webp', iconName: 'Trees' },
      { name: '24/7 Security & CCTV', category: 'Safety', img: '/images/Icons/security.webp', iconName: 'ShieldCheck' },
      { name: 'Tennis Court', category: 'Sports', img: '/images/Icons/tennis.webp', iconName: 'Trophy' },
      { name: 'Badminton & Shuttle', category: 'Sports', img: '/images/Icons/shuttle.webp', iconName: 'Activity' },
      { name: 'Squash Arena', category: 'Sports', img: '/images/Icons/squash.webp', iconName: 'Target' },
      { name: 'Grand Banquets', category: 'Celebration', img: '/images/Icons/banquets.webp', iconName: 'PartyPopper' },
      { name: 'ATM & Banking Kiosk', category: 'Convenience', img: '/images/Icons/atm.webp', iconName: 'CreditCard' }
    ]
  },
  projectsSection: {
    eyebrowTag: 'LANDMARK DEVELOPMENTS',
    title: 'Our Projects',
    subtitle: 'Explore premier master-planned townships and signature villa communities developed with unmatched luxury, architectural brilliance, and strategic connectivity.',
    items: [
      {
        id: 'ambhuja',
        title: 'Maytri Ambhuja',
        tagline: 'Flagship 55-Acre Villa Township',
        location: 'Sanghi City, Near ORR Exit 11, Hyderabad',
        status: 'Ready for VIP Booking',
        image: 'https://res.cloudinary.com/s8b4ps7b/image/upload/v1788847939/maytri_ambhuja/gallery/gallery_001.jpg',
        specs: [
          { label: 'Project Area', value: '55 Acres' },
          { label: 'Villas', value: '516 Premium Units' },
          { label: 'Clubhouse', value: '90,000 Sq.Ft' },
          { label: 'Starting Price', value: '3.2 Cr*' }
        ],
        features: ['222 & 300 SQ YDS Triplex Villas', '4.5-Acre Central Park', 'RERA: P02400007647'],
        buttonText: 'For More Info'
      },
      {
        id: 'palms',
        title: 'Sanghi City Palms',
        tagline: 'Signature Luxury Gated Enclave',
        location: 'Sanghi City Master Township, Hyderabad',
        status: 'Phase 1 Fast Selling',
        image: 'https://res.cloudinary.com/s8b4ps7b/image/upload/v1788847941/maytri_ambhuja/gallery/gallery_002.jpg',
        specs: [
          { label: 'Project Area', value: '35 Acres' },
          { label: 'Villas', value: '280 Luxury Villas' },
          { label: 'Clubhouse', value: '50,000 Sq.Ft' },
          { label: 'Configuration', value: '4 & 5 BHK Triplex' }
        ],
        features: ['Private Temperature Pool', 'Lush Forest Avenues', 'Gated 3-Tier Security'],
        buttonText: 'For More Info'
      },
      {
        id: 'meadows',
        title: 'Maytri Green Meadows',
        tagline: 'Eco-Luxury Sustainable Villa Estates',
        location: 'Growth Corridor, East Hyderabad',
        status: 'Exclusive Preview',
        image: 'https://res.cloudinary.com/s8b4ps7b/image/upload/v1788847942/maytri_ambhuja/gallery/gallery_004.jpg',
        specs: [
          { label: 'Project Area', value: '40 Acres' },
          { label: 'Villas', value: '320 Eco Villas' },
          { label: 'Open Space', value: '60% Greenery' },
          { label: 'Type', value: 'Contemporary Villas' }
        ],
        features: ['Solar Powered Community', 'Organic Orchards', 'Outdoor Amphitheater'],
        buttonText: 'For More Info'
      },
      {
        id: 'grandeur',
        title: 'Maytri Grandeur Suites',
        tagline: 'Boutique High-End Township Living',
        location: 'ORR Connectivity Hub, Hyderabad',
        status: 'Upcoming Launch',
        image: 'https://res.cloudinary.com/s8b4ps7b/image/upload/v1788847947/maytri_ambhuja/gallery/gallery_009.jpg',
        specs: [
          { label: 'Project Area', value: '20 Acres' },
          { label: 'Residences', value: 'Executive Suites' },
          { label: 'Amenities', value: 'Sky Lounge & Spa' },
          { label: 'Access', value: '2 Mins to ORR' }
        ],
        features: ['Infinity Sky Deck', 'Concierge & Valet', 'Smart Home Automation'],
        buttonText: 'For More Info'
      }
    ]
  }
};

export function getLocalContent() {
  if (typeof window === 'undefined') return DEFAULT_CONTENT;
  try {
    const raw = localStorage.getItem(CONTENT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : DEFAULT_CONTENT;
  } catch (e) {
    return DEFAULT_CONTENT;
  }
}

export async function fetchContentFromAPI() {
  try {
    const res = await fetch(`${API_BASE_URL}/content`);
    if (!res.ok) throw new Error('Failed to fetch content');
    const json = await res.json();
    if (json.success && json.data) {
      localStorage.setItem(CONTENT_STORAGE_KEY, JSON.stringify(json.data));
      return json.data;
    }
  } catch (err) {
    console.warn('API content fetch failed, using local storage:', err.message);
  }
  return getLocalContent();
}

export async function saveContentToAPI(contentData) {
  try {
    localStorage.setItem(CONTENT_STORAGE_KEY, JSON.stringify(contentData));
    if (broadcastChannel) {
      broadcastChannel.postMessage({ type: 'CONTENT_UPDATED', content: contentData });
    }

    const res = await fetch(`${API_BASE_URL}/content`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contentData)
    });
    return await res.json();
  } catch (err) {
    console.error('API content save error:', err.message);
    return { success: false, message: err.message };
  }
}

export async function fetchAllMedia() {
  try {
    const res = await fetch(`${API_BASE_URL}/media`);
    if (!res.ok) throw new Error('Failed to fetch media');
    return await res.json();
  } catch (err) {
    console.warn('Media fetch failed:', err.message);
    return { success: false, data: [] };
  }
}

export async function uploadMediaToAPI(mediaPayload) {
  try {
    const res = await fetch(`${API_BASE_URL}/media/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mediaPayload)
    });
    const result = await res.json();
    if (broadcastChannel && result.success) {
      broadcastChannel.postMessage({ type: 'MEDIA_UPDATED', media: result.data });
    }
    return result;
  } catch (err) {
    console.error('Media upload error:', err.message);
    return { success: false, message: err.message };
  }
}
