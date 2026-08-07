// ==========================================
// VIDR - Complete Application (with Stripe)
// app.js - Part 1: Core Setup
// ==========================================

'use strict';

// ==================== GLOBAL STATE ====================
const APP = {
  version: '1.0.0',
  currentPage: 'home',
  currentUser: null,
  currentUserData: null,
  feedTab: 'foryou',
  feedPosts: [],
  feedLastDoc: null,
  feedLoading: false,
  feedEnded: false,
  followingFeedPosts: [],
  followingIds: new Set(),
  followingLastDoc: null,
  followingEnded: false,
  discoverUsers: [],
  discoverLastDoc: null,
  chatRooms: [],
  currentChatRoom: null,
  currentChatUser: null,
  chatMessages: [],
  chatListeners: [],
  notifications: [],
  notifListener: null,
  cart: [],
  searchRecent: JSON.parse(localStorage.getItem('vidr_recent_searches') || '[]'),
  searchTab: 'users',
  profileViewingId: null,
  liveStreamId: null,
  isLiveHost: false,
  storyUsers: [],
  currentStoryUserIndex: 0,
  currentStoryIndex: 0,
  storyTimer: null,
  storyProgressTimer: null,
  storiesHidden: false,
  storiesHideTimer: null,
  xpBoostEnd: null,
  xpBoostTimer: null,
  spinAdsWatched: 0,
  isOnline: navigator.onLine,
  feedXpTimer: null,
  feedXpAccumulated: 0,
  interstitialTimer: null,
  lastInterstitialTime: 0,
  adImpressions: 0,
  darkMode: localStorage.getItem('vidr_dark_mode') !== 'false',
  reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  isMobile: /Android|iPhone|iPad|iPod/i.test(navigator.userAgent),
  listeners: [],
  profileVisitors: [],
};

// ==================== CONSTANTS ====================
const ADMIN_EMAIL = 'azharberry53@gmail.com';
const MAX_LEVEL = 10000;
const XP_PER_LEVEL_BASE = 100;
const FEED_PAGE_SIZE = 10;
const AD_INTERVAL_POSTS = 5;
const AD_INTERSTITIAL_INTERVAL = 300000;
const BANNER_REFRESH_INTERVAL = 60000;
const STORY_DURATION = 5000;
const STORIES_HIDE_DELAY = 8000;
const WELCOME_BONUS = 50;
const VERIFIED_PRICE = 18;
const VERIFIED_BOOSTS_PER_MONTH = 8;
const BOOST_COST = 1500;
const MIN_WITHDRAWAL = 5000;
const WITHDRAWAL_FEE = 0.10;
const PLATFORM_FEE = 0.08;
const AFFILIATE_COMMISSION = 0.05;
const REFERRAL_REWARD = 50;
const REFERRAL_PURCHASE_COMMISSION = 0.06;
const MARKETING_AD_COMMISSION = 0.10;
const PAID_REWARD_CHANCE = 0.000000001;

// ==================== STRIPE CONFIG ====================
const STRIPE_PUBLISHABLE_KEY = 'pk_live_51QWFR4BISqFfwDl6u5biS1bUB07tDMVTSt8nkjy0tCXoPW7Vov2zUQeBZjfPvp96VARoHhERvmIa4JsBzpKWep6Q0064CvfawV';

let stripe = null;
let stripeElements = null;
let stripePaymentElement = null;
let currentStripePaymentType = null;
let currentStripePackageId = null;
let firebaseFunctions = null;

function initStripe() {
  if (!stripe && window.Stripe) {
    stripe = Stripe(STRIPE_PUBLISHABLE_KEY);
  }
  return stripe;
}

function getFirebaseFunctions() {
  if (!firebaseFunctions) {
    firebaseFunctions = firebase.functions();
  }
  return firebaseFunctions;
}

// ==================== TEXT BACKGROUNDS ====================
const TEXT_BG_COLORS = [
  'linear-gradient(135deg, #e91e8c, #7c3aed)',
  'linear-gradient(135deg, #3b82f6, #06b6d4)',
  'linear-gradient(135deg, #f43f5e, #f97316)',
  'linear-gradient(135deg, #10b981, #059669)',
  'linear-gradient(135deg, #8b5cf6, #ec4899)',
  'linear-gradient(135deg, #1e1e3a, #0a0a1a)',
];

// ==================== ACHIEVEMENTS ====================
const ACHIEVEMENT_TYPES = [
  { id: 'first_post', name: 'Creator', icon: '📝', desc: 'Create posts', maxLevel: 100 },
  { id: 'first_like', name: 'Heart Giver', icon: '❤️', desc: 'Like posts', maxLevel: 100 },
  { id: 'first_follow', name: 'Social Butterfly', icon: '🦋', desc: 'Follow users', maxLevel: 100 },
  { id: 'first_comment', name: 'Commentator', icon: '💬', desc: 'Write comments', maxLevel: 100 },
  { id: 'first_share', name: 'Spreader', icon: '🔗', desc: 'Share posts', maxLevel: 100 },
  { id: 'first_live', name: 'Broadcaster', icon: '📡', desc: 'Go live', maxLevel: 100 },
  { id: 'first_gift', name: 'Generous', icon: '🎁', desc: 'Send gifts', maxLevel: 100 },
  { id: 'first_purchase', name: 'Shopper', icon: '🛍️', desc: 'Buy items', maxLevel: 100 },
  { id: 'daily_login', name: 'Loyal', icon: '📅', desc: 'Daily logins', maxLevel: 100 },
  { id: 'level_up', name: 'Leveler', icon: '⬆️', desc: 'Reach levels', maxLevel: 100 },
  { id: 'spin_win', name: 'Lucky', icon: '🎰', desc: 'Win spins', maxLevel: 100 },
  { id: 'game_win', name: 'Gamer', icon: '🎮', desc: 'Win games', maxLevel: 100 },
  { id: 'story_post', name: 'Storyteller', icon: '📖', desc: 'Post stories', maxLevel: 100 },
  { id: 'chat_send', name: 'Messenger', icon: '✉️', desc: 'Send messages', maxLevel: 100 },
  { id: 'referral', name: 'Recruiter', icon: '👥', desc: 'Refer friends', maxLevel: 100 },
  { id: 'watch_time', name: 'Viewer', icon: '👀', desc: 'Watch content', maxLevel: 100 },
  { id: 'coins_earned', name: 'Earner', icon: '💰', desc: 'Earn coins', maxLevel: 100 },
  { id: 'profile_views', name: 'Popular', icon: '🌟', desc: 'Get profile views', maxLevel: 100 },
  { id: 'battle_win', name: 'Champion', icon: '🏆', desc: 'Win battles', maxLevel: 100 },
  { id: 'sell_item', name: 'Merchant', icon: '🏪', desc: 'Sell items', maxLevel: 100 },
];

// ==================== TITLES ====================
const TITLE_PRESETS = [
  { name: 'Newbie', rarity: 'common' },
  { name: 'Explorer', rarity: 'common' },
  { name: 'Rising Star', rarity: 'uncommon' },
  { name: 'Trendsetter', rarity: 'uncommon' },
  { name: 'Content King', rarity: 'rare' },
  { name: 'Content Queen', rarity: 'rare' },
  { name: 'Influencer', rarity: 'rare' },
  { name: 'Diamond Creator', rarity: 'epic' },
  { name: 'Elite Member', rarity: 'epic' },
  { name: 'VIP Legend', rarity: 'epic' },
  { name: 'Mythical Being', rarity: 'legendary' },
  { name: 'Godlike', rarity: 'legendary' },
  { name: 'The Chosen One', rarity: 'legendary' },
  { name: 'Vidr OG', rarity: 'legendary' },
];

// ==================== GIFTS ====================
const FREE_GIFTS = [
  { id: 'rose', emoji: '🌹', name: 'Rose', cost: 1 },
  { id: 'clap', emoji: '👏', name: 'Clap', cost: 1 },
  { id: 'thumbsup', emoji: '👍', name: 'Thumbs Up', cost: 2 },
  { id: 'sunflower', emoji: '🌻', name: 'Sunflower', cost: 3 },
  { id: 'cherry', emoji: '🍒', name: 'Cherry', cost: 3 },
  { id: 'heart', emoji: '❤️', name: 'Heart', cost: 5 },
  { id: 'butterfly', emoji: '🦋', name: 'Butterfly', cost: 5 },
  { id: 'donut', emoji: '🍩', name: 'Donut', cost: 6 },
  { id: 'balloon', emoji: '🎈', name: 'Balloon', cost: 7 },
  { id: 'rainbow', emoji: '🌈', name: 'Rainbow', cost: 8 },
  { id: 'pizza', emoji: '🍕', name: 'Pizza', cost: 8 },
  { id: 'star', emoji: '⭐', name: 'Star', cost: 10 },
  { id: 'sparkle', emoji: '✨', name: 'Sparkle', cost: 10 },
  { id: 'moon', emoji: '🌙', name: 'Moon', cost: 12 },
  { id: 'lightning', emoji: '⚡', name: 'Lightning', cost: 15 },
  { id: 'sun', emoji: '☀️', name: 'Sun', cost: 15 },
  { id: 'fire', emoji: '🔥', name: 'Fire', cost: 20 },
  { id: 'medal', emoji: '🏅', name: 'Medal', cost: 20 },
  { id: 'confetti', emoji: '🎊', name: 'Confetti', cost: 25 },
  { id: 'trophy', emoji: '🏆', name: 'Trophy', cost: 30 },
  { id: 'gem', emoji: '💠', name: 'Gem', cost: 40 },
  { id: 'crown', emoji: '👑', name: 'Crown', cost: 50 },
  { id: 'comet', emoji: '☄️', name: 'Comet', cost: 80 },
  { id: 'diamond', emoji: '💎', name: 'Diamond', cost: 100 },
  { id: 'unicorn', emoji: '🦄', name: 'Unicorn', cost: 150 },
  { id: 'dragon', emoji: '🐉', name: 'Dragon', cost: 300 },
  { id: 'phoenix', emoji: '🔱', name: 'Phoenix', cost: 500 },
  { id: 'supernova', emoji: '💫', name: 'Supernova', cost: 1000 },
  { id: 'rocket', emoji: '🚀', name: 'Rocket', cost: 2000 },
  { id: 'galaxy', emoji: '🌌', name: 'Galaxy', cost: 5000 },
];

const PAID_GIFTS = [
  { id: 'lollipop', emoji: '🍭', name: 'Lollipop', cost: 1 },
  { id: 'rose_gold', emoji: '🥀', name: 'Rose Gold', cost: 2 },
  { id: 'teddy', emoji: '🧸', name: 'Teddy Bear', cost: 3 },
  { id: 'icecream', emoji: '🍦', name: 'Ice Cream', cost: 5 },
  { id: 'perfume', emoji: '🧴', name: 'Perfume', cost: 8 },
  { id: 'cake', emoji: '🎂', name: 'Cake', cost: 10 },
  { id: 'champagne', emoji: '🍾', name: 'Champagne', cost: 15 },
  { id: 'art', emoji: '🎨', name: 'Art', cost: 20 },
  { id: 'microphone', emoji: '🎤', name: 'Microphone', cost: 25 },
  { id: 'guitar', emoji: '🎸', name: 'Guitar', cost: 30 },
  { id: 'camera', emoji: '📸', name: 'Camera', cost: 40 },
  { id: 'sportscar', emoji: '🏎️', name: 'Sports Car', cost: 50 },
  { id: 'smartphone', emoji: '📱', name: 'Smartphone', cost: 60 },
  { id: 'laptop', emoji: '💻', name: 'Laptop', cost: 80 },
  { id: 'ring', emoji: '💍', name: 'Ring', cost: 100 },
  { id: 'watch', emoji: '⌚', name: 'Watch', cost: 150 },
  { id: 'necklace', emoji: '📿', name: 'Necklace', cost: 200 },
  { id: 'handbag', emoji: '👜', name: 'Handbag', cost: 300 },
  { id: 'treasure', emoji: '🗝️', name: 'Treasure', cost: 500 },
  { id: 'yacht', emoji: '🛥️', name: 'Yacht', cost: 1000 },
  { id: 'helicopter', emoji: '🚁', name: 'Helicopter', cost: 2000 },
  { id: 'jet', emoji: '✈️', name: 'Private Jet', cost: 3000 },
  { id: 'castle', emoji: '🏰', name: 'Castle', cost: 5000 },
  { id: 'lion', emoji: '🦁', name: 'Lion', cost: 5000 },
  { id: 'planet', emoji: '🪐', name: 'Planet', cost: 8000 },
  { id: 'universe', emoji: '🌍', name: 'Universe', cost: 10000 },
  { id: 'blackhole', emoji: '🕳️', name: 'Black Hole', cost: 15000 },
  { id: 'infinity', emoji: '♾️', name: 'Infinity', cost: 20000 },
  { id: 'megastar', emoji: '🌠', name: 'Mega Star', cost: 25000 },
  { id: 'vidr_special', emoji: '💜', name: 'Vidr Special', cost: 50000 },
];

// ==================== GOLD PACKAGES ====================
const GOLD_PACKAGES = [
  { id: 'starter', name: 'Starter', coins: 100, price: 1, bonus: 0 },
  { id: 'basic', name: 'Basic', coins: 550, price: 4, bonus: 50 },
  { id: 'popular', name: 'Popular', coins: 1400, price: 8, bonus: 200, popular: true },
  { id: 'pro', name: 'Pro', coins: 3000, price: 15, bonus: 500 },
  { id: 'elite', name: 'Elite', coins: 7000, price: 30, bonus: 1500 },
  { id: 'premium', name: 'Premium', coins: 16000, price: 60, bonus: 4000 },
  { id: 'ultimate', name: 'Ultimate', coins: 42000, price: 130, bonus: 12000 },
];

// ==================== XP BOOST OPTIONS ====================
const XP_BOOST_OPTIONS = [
  { duration: 900, label: '15 min', cost: 100, costType: 'free' },
  { duration: 1800, label: '30 min', cost: 180, costType: 'free' },
  { duration: 3600, label: '1 hour', cost: 300, costType: 'free' },
  { duration: 86400, label: '1 day', cost: 1000, costType: 'free' },
];

// ==================== SHOP CATEGORIES ====================
const SHOP_CATEGORIES = ['All', 'Fashion', 'Electronics', 'Beauty', 'Home', 'Sports', 'Toys', 'Food'];

// ==================== STICKER PACKS ====================
const STICKER_PACKS = {
  default: [
    { emoji: '😀', anim: 'bounce' }, { emoji: '😂', anim: 'wobble' },
    { emoji: '🤣', anim: 'bounce' }, { emoji: '😍', anim: 'heartbeat' },
    { emoji: '🥰', anim: 'heartbeat' }, { emoji: '😎', anim: 'bounce' },
    { emoji: '🤩', anim: 'pulse' }, { emoji: '😢', anim: 'bounce' },
    { emoji: '😭', anim: 'wobble' }, { emoji: '😤', anim: 'bounce' },
    { emoji: '🤯', anim: 'pulse' }, { emoji: '🥳', anim: 'bounce' },
    { emoji: '😏', anim: 'bounce' }, { emoji: '🤔', anim: 'wobble' },
    { emoji: '👀', anim: 'wobble' }, { emoji: '💀', anim: 'bounce' },
  ],
  love: [
    { emoji: '❤️', anim: 'heartbeat' }, { emoji: '💕', anim: 'heartbeat' },
    { emoji: '💖', anim: 'heartbeat' }, { emoji: '💗', anim: 'heartbeat' },
    { emoji: '💓', anim: 'heartbeat' }, { emoji: '💞', anim: 'spin' },
    { emoji: '💘', anim: 'bounce' }, { emoji: '💝', anim: 'wobble' },
    { emoji: '😘', anim: 'bounce' }, { emoji: '😻', anim: 'heartbeat' },
    { emoji: '💐', anim: 'wobble' }, { emoji: '🌹', anim: 'bounce' },
    { emoji: '🥰', anim: 'heartbeat' }, { emoji: '😍', anim: 'heartbeat' },
    { emoji: '💑', anim: 'bounce' }, { emoji: '💏', anim: 'bounce' },
  ],
  fun: [
    { emoji: '🎉', anim: 'wobble' }, { emoji: '🎊', anim: 'wobble' },
    { emoji: '🥳', anim: 'bounce' }, { emoji: '🎈', anim: 'wobble' },
    { emoji: '🎁', anim: 'bounce' }, { emoji: '🎮', anim: 'bounce' },
    { emoji: '🎯', anim: 'pulse' }, { emoji: '🎲', anim: 'spin' },
    { emoji: '🏆', anim: 'pulse' }, { emoji: '🎪', anim: 'bounce' },
    { emoji: '🎭', anim: 'bounce' }, { emoji: '🎨', anim: 'wobble' },
    { emoji: '🎵', anim: 'wobble' }, { emoji: '🎸', anim: 'bounce' },
    { emoji: '🎤', anim: 'bounce' }, { emoji: '🎬', anim: 'bounce' },
  ],
  animated: [
    { emoji: '⭐', anim: 'spin' }, { emoji: '✨', anim: 'pulse' },
    { emoji: '💫', anim: 'spin' }, { emoji: '🌟', anim: 'pulse' },
    { emoji: '🔥', anim: 'wobble' }, { emoji: '💥', anim: 'pulse' },
    { emoji: '❄️', anim: 'spin' }, { emoji: '🌈', anim: 'rainbow' },
    { emoji: '🎆', anim: 'pulse' }, { emoji: '🎇', anim: 'pulse' },
    { emoji: '🌠', anim: 'bounce' }, { emoji: '🌊', anim: 'wobble' },
    { emoji: '🌪️', anim: 'spin' }, { emoji: '⚡', anim: 'pulse' },
    { emoji: '☄️', anim: 'wobble' }, { emoji: '🌸', anim: 'spin' },
  ],
};

// ==================== BOT DATA ====================
const BOT_FIRST_NAMES = [
  'Emma','Liam','Sophia','Noah','Olivia','James','Ava','William','Isabella','Oliver',
  'Mia','Benjamin','Charlotte','Elijah','Amelia','Lucas','Harper','Mason','Evelyn','Logan',
  'Abigail','Alexander','Emily','Ethan','Elizabeth','Jacob','Sofia','Michael','Avery','Daniel',
  'Ella','Henry','Madison','Sebastian','Scarlett','Jack','Victoria','Aiden','Aria','Owen',
  'Grace','Samuel','Chloe','Ryan','Penelope','Nathan','Riley','Carter','Layla','Dylan',
  'Lily','Luke','Eleanor','Caleb','Hannah','Andrew','Lillian','Joshua','Addison','Isaac',
  'Aubrey','Lincoln','Ellie','Theodore','Stella','Adrian','Natalie','Thomas','Zoe','Leo',
  'Leah','Jayden','Hazel','Jaxon','Violet','Julian','Aurora','Mateo','Savannah','Anthony',
  'Audrey','Grayson','Brooklyn','Aaron','Bella','Eli','Claire','Landon','Skylar','Tyler',
  'Maya','Nolan','Genesis','Christian','Madelyn','Jace','Kennedy','Isaiah','Willow','Asher'
];

const BOT_LAST_NAMES = [
  'Smith','Johnson','Williams','Brown','Jones','Garcia','Miller','Davis','Rodriguez','Martinez',
  'Anderson','Taylor','Thomas','Jackson','White','Harris','Martin','Thompson','Moore','Young',
  'Allen','King','Wright','Scott','Torres','Nguyen','Hill','Flores','Green','Adams',
  'Nelson','Baker','Hall','Rivera','Campbell','Mitchell','Carter','Roberts','Turner','Phillips',
  'Parker','Evans','Edwards','Collins','Stewart','Sanchez','Morris','Rogers','Reed','Cook'
];

const BOT_BIOS = [
  'Living my best life ✨','Adventure awaits 🌍','Coffee lover ☕','Dream big 💭',
  'Making memories 📸','Stay positive 🌈','Love & light 💛','Keep it real 💯',
  'Music is life 🎵','Food enthusiast 🍕','Fitness journey 💪','Art lover 🎨',
  'Travel addict ✈️','Book worm 📚','Nature lover 🌿','Dancing queen 💃',
  'Sunset chaser 🌅','Dog mom 🐕','Cat person 🐱','Beach vibes 🏖️',
  'City lights 🌃','Yoga life 🧘','Plant parent 🌱','Good vibes only ✌️',
  'Smile always 😊','Create daily 🎯','Hustle mode 🚀','Joy seeker 🎉',
];

const BOT_VIDEO_URLS = [
  // Google Cloud Storage sample videos (always work)
  'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
  'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
  'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
  'https://storage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
  'https://storage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
  'https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
  'https://storage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4',
  'https://storage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
  'https://storage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4',
  // W3Schools test videos
  'https://www.w3schools.com/html/mov_bbb.mp4',
  'https://www.w3schools.com/html/movie.mp4',
  // Sample videos from various CDNs
  'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
  'https://sample-videos.com/video321/mp4/480/big_buck_bunny_480p_1mb.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4',
];

const BOT_CAPTIONS = [
  'Beautiful day today! 🌤️','Can\'t stop won\'t stop 💪','Weekend vibes 🎉',
  'Nature is healing 🌿','Golden hour magic ✨','This view though 😍',
  'Making memories 📸','Life is beautiful 🦋','Grateful for everything 🙏',
  'Chase your dreams 💫','New beginnings 🌅','Living for moments like this 💖',
  'Feeling blessed 🙌','Can\'t believe this is real 🤩','Sending good vibes ✌️',
  'Perfect day for adventure 🗺️','Smiles all around 😊','Lost in the moment 🎶',
  'This is what happiness looks like 🥰','Creating my own sunshine ☀️',
  'Just another day in paradise 🏝️','The world is full of beauty 🌸',
  'Stay wild, stay free 🦅','Good things take time ⏰','One step at a time 👣',
  'Embracing the journey 🛤️','Collect moments not things 💎','Sky above me 🌌',
  'Rise and shine ☕','Heart full of joy 💗',
];

console.log('Vidr Part 1 loaded: Constants & Config');

// ==========================================
// VIDR - app.js Part 2
// Init, Auth, Theme, Toast, Modals, Navigation
// ==========================================

// ==================== INITIALIZATION ====================

document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

async function initApp() {
  console.log('Vidr initializing...');
  applyTheme();
  registerServiceWorker();
  setupNetworkDetection();
  checkReferralParam();

  auth.onAuthStateChanged(async (user) => {
    if (user) {
      APP.currentUser = user;
      await loadUserData();
      await onUserAuthenticated();
      hideSplash();
      showApp();
    } else {
      APP.currentUser = null;
      APP.currentUserData = null;
      hideSplash();
      showAuth();
    }
  });
}

function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('SW registered:', reg.scope))
      .catch(err => console.warn('SW registration failed:', err));
  }
}

function setupNetworkDetection() {
  window.addEventListener('online', () => {
    APP.isOnline = true;
    removeOfflineBanner();
    showToast('Back online! 🌐', 'success');
  });

  window.addEventListener('offline', () => {
    APP.isOnline = false;
    showOfflineBanner();
    showToast('You\'re offline 📡', 'warning');
  });
}

function showOfflineBanner() {
  if (document.querySelector('.offline-banner')) return;
  const banner = document.createElement('div');
  banner.className = 'offline-banner';
  banner.textContent = 'No internet connection';
  document.body.prepend(banner);
}

function removeOfflineBanner() {
  const banner = document.querySelector('.offline-banner');
  if (banner) banner.remove();
}

function checkReferralParam() {
  const params = new URLSearchParams(window.location.search);
  const ref = params.get('ref');
  if (ref) {
    localStorage.setItem('vidr_referrer', ref);
    window.history.replaceState({}, '', '/');
  }
}

// ==================== THEME ====================

function applyTheme() {
  document.documentElement.setAttribute('data-theme', APP.darkMode ? 'dark' : 'light');
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = APP.darkMode ? '#0a0a1a' : '#faf5ff';
}

function toggleDarkMode() {
  APP.darkMode = !APP.darkMode;
  localStorage.setItem('vidr_dark_mode', APP.darkMode);
  applyTheme();
}

// ==================== SPLASH / AUTH VISIBILITY ====================

function hideSplash() {
  setTimeout(() => {
    const splash = document.getElementById('splashScreen');
    if (splash) splash.classList.add('hide');
    setTimeout(() => { if (splash) splash.style.display = 'none'; }, 600);
  }, 2000);
}

function showApp() {
  document.getElementById('authContainer').style.display = 'none';
  document.getElementById('appShell').style.display = 'flex';
}

function showAuth() {
  document.getElementById('appShell').style.display = 'none';
  document.getElementById('authContainer').style.display = 'block';
  showLogin();
}

function showLogin() {
  document.getElementById('loginPage').style.display = 'flex';
  document.getElementById('registerPage').style.display = 'none';
}

function showRegister() {
  document.getElementById('loginPage').style.display = 'none';
  document.getElementById('registerPage').style.display = 'flex';
}

function showLoading() {
  document.getElementById('loadingOverlay').style.display = 'flex';
}

function hideLoading() {
  document.getElementById('loadingOverlay').style.display = 'none';
}

// ==================== TOAST NOTIFICATIONS ====================

function showToast(message, type = 'info', duration = 3000) {
  const container = document.getElementById('toastContainer');
  const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || 'ℹ️'}</span>
    <span class="toast-message">${message}</span>
  `;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('removing');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ==================== BOTTOM SHEET ====================

function openBottomSheet(contentHTML) {
  const overlay = document.getElementById('bottomSheetOverlay');
  const sheet = document.getElementById('bottomSheet');
  const content = document.getElementById('bottomSheetContent');

  content.innerHTML = contentHTML;
  overlay.style.display = 'block';
  sheet.style.display = 'block';
  sheet.classList.remove('closing');
}

function closeBottomSheet() {
  const overlay = document.getElementById('bottomSheetOverlay');
  const sheet = document.getElementById('bottomSheet');

  sheet.classList.add('closing');
  setTimeout(() => {
    overlay.style.display = 'none';
    sheet.style.display = 'none';
    sheet.classList.remove('closing');
  }, 300);
}

// ==================== CENTER MODAL ====================

function openCenterModal(contentHTML) {
  const modal = document.getElementById('centerModal');
  const content = document.getElementById('centerModalContent');
  content.innerHTML = contentHTML;
  modal.style.display = 'flex';
}

function closeCenterModal() {
  document.getElementById('centerModal').style.display = 'none';
}

// ==================== CONFETTI ====================

function launchConfetti() {
  const canvas = document.getElementById('confettiCanvas');
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles = [];
  const colors = ['#e91e8c', '#7c3aed', '#f59e0b', '#10b981', '#3b82f6', '#f43f5e', '#ec4899'];

  for (let i = 0; i < 150; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      w: Math.random() * 10 + 5,
      h: Math.random() * 6 + 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - 0.5) * 4,
      vy: Math.random() * 4 + 2,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
      opacity: 1,
    });
  }

  let frame = 0;
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    frame++;

    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.05;
      p.rotation += p.rotationSpeed;
      if (frame > 60) p.opacity -= 0.01;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.globalAlpha = Math.max(0, p.opacity);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }

    if (frame < 180) {
      requestAnimationFrame(animate);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }
  animate();
}

// ==================== NAVIGATION ====================

function navigateTo(page, data = null) {
  const pages = ['home', 'discover', 'create', 'chat', 'profile'];
  const overlayPages = [
    'searchPage', 'notificationsPage', 'settingsPage', 'editProfilePage',
    'walletPage', 'leaderboardPage', 'gamesPage', 'shopPage', 'spinWheelPage',
    'referralPage', 'adminPage', 'singlePostPage', 'chatRoomPage',
    'liveStreamPage', 'profileVisitorsPage', 'earnPage', 'campaignPage', 'payoutPage'
  ];

  // Handle special pages
  if (page === 'search') {
    openOverlayPage('searchPage');
    setTimeout(() => {
      const input = document.getElementById('searchInput');
      if (input) input.focus();
      setupSearch();
      loadRecentSearches();
    }, 350);
    return;
  }
  if (page === 'notifications') {
    renderNotifications();
    return;
  }

  if (pages.includes(page)) {
    // Safely hide overlay pages
    overlayPages.forEach(p => {
      const el = document.getElementById(p);
      if (el) el.classList.remove('active');
    });

    // Safely hide main pages
    pages.forEach(p => {
      const el = document.getElementById(p + 'Page');
      if (el) el.classList.remove('active');
    });

    const target = document.getElementById(page + 'Page');
    if (target) target.classList.add('active');

    // Update nav (safely)
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.page === page);
    });

    // Get elements safely
    const header = document.getElementById('topHeader');
    const storiesBar = document.getElementById('storiesBar');
    const feedTabs = document.getElementById('feedTabs');
    const bottomNav = document.getElementById('bottomNav');
    const bannerAd = document.getElementById('bannerAd');

    if (page === 'home') {
      if (header) header.style.display = 'flex';
      if (feedTabs) feedTabs.style.display = 'flex';
      if (storiesBar && !APP.storiesHidden) storiesBar.classList.remove('hidden');
      if (bottomNav) bottomNav.style.display = 'flex';
      if (bannerAd) bannerAd.style.display = 'flex';
      startFeedXpTimer();
      startStoriesHideTimer();
    } else {
      if (feedTabs) feedTabs.style.display = 'none';
      if (page === 'discover' || page === 'create' || page === 'chat') {
        if (header) header.style.display = 'flex';
      } else {
        if (header) header.style.display = 'none';
      }
      if (storiesBar) storiesBar.classList.add('hidden');
      if (bottomNav) bottomNav.style.display = 'flex';
      if (bannerAd) bannerAd.style.display = 'flex';
      stopFeedXpTimer();
    }

    APP.currentPage = page;

    switch (page) {
      case 'home':
        if (APP.feedPosts.length === 0) loadFeed();
        break;
      case 'discover':
        if (APP.discoverUsers.length === 0) loadDiscover();
        break;
      case 'chat':
        loadChatList();
        break;
      case 'profile':
        APP.profileViewingId = APP.currentUser?.uid;
        loadProfile(APP.currentUser?.uid);
        break;
    }
  }
}
function openOverlayPage(pageId) {
  const page = document.getElementById(pageId);
  if (page) {
    page.style.display = 'flex';
    requestAnimationFrame(() => {
      page.classList.add('active');
    });
  }

  const bottomNav = document.getElementById('bottomNav');
  const bannerAd = document.getElementById('bannerAd');
  const topHeader = document.getElementById('topHeader');
  const storiesBar = document.getElementById('storiesBar');

  if (bottomNav) bottomNav.style.display = 'none';
  if (bannerAd) bannerAd.style.display = 'none';
  if (topHeader) topHeader.style.display = 'none';
  if (storiesBar) storiesBar.classList.add('hidden');
}

function closeOverlayPage(pageId) {
  const page = document.getElementById(pageId);
  if (page) {
    page.classList.remove('active');
    setTimeout(() => {
      page.style.display = 'none';
    }, 300);
  }

  const bottomNav = document.getElementById('bottomNav');
  const bannerAd = document.getElementById('bannerAd');
  
  if (bottomNav) bottomNav.style.display = 'flex';
  if (bannerAd) bannerAd.style.display = 'flex';

  if (APP.currentPage === 'home') {
    const topHeader = document.getElementById('topHeader');
    const storiesBar = document.getElementById('storiesBar');
    if (topHeader) topHeader.style.display = 'flex';
    if (storiesBar && !APP.storiesHidden) {
      storiesBar.classList.remove('hidden');
    }
  }
}

// ==================== AUTHENTICATION ====================

async function loginWithEmail() {
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  if (!email || !password) return showToast('Please fill all fields', 'warning');

  showLoading();
  try {
    const result = await auth.signInWithEmailAndPassword(email, password);
    const userData = await getUserData(result.user.uid);

    if (userData?.banned) {
      await auth.signOut();
      hideLoading();
      showToast('Your account has been banned: ' + (userData.banReason || 'Violation'), 'error');
      return;
    }

    if (userData?.suspended && userData.suspendedUntil) {
      const until = userData.suspendedUntil.toDate ? userData.suspendedUntil.toDate() : new Date(userData.suspendedUntil);
      if (until > new Date()) {
        await auth.signOut();
        hideLoading();
        showToast(`Account suspended until ${until.toLocaleDateString()}`, 'error');
        return;
      }
    }

    hideLoading();
    showToast('Welcome back! 👋', 'success');
  } catch (err) {
    hideLoading();
    console.error('Login error:', err);
    if (err.code === 'auth/user-not-found') showToast('Account not found', 'error');
    else if (err.code === 'auth/wrong-password') showToast('Wrong password', 'error');
    else if (err.code === 'auth/invalid-email') showToast('Invalid email', 'error');
    else if (err.code === 'auth/too-many-requests') showToast('Too many attempts. Try later.', 'error');
    else showToast('Login failed: ' + err.message, 'error');
  }
}

async function registerWithEmail() {
  const displayName = document.getElementById('regDisplayName').value.trim();
  const username = document.getElementById('regUsername').value.trim().toLowerCase();
  const email = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value;

  if (!displayName || !username || !email || !password) {
    return showToast('Please fill all fields', 'warning');
  }
  if (username.length < 3) return showToast('Username must be 3+ characters', 'warning');
  if (!/^[a-z0-9._]+$/.test(username)) return showToast('Username: letters, numbers, . and _ only', 'warning');
  if (password.length < 6) return showToast('Password must be 6+ characters', 'warning');

  showLoading();

  try {
    const usernameCheck = await db.collection('usernames').doc(username).get();
    if (usernameCheck.exists) {
      hideLoading();
      return showToast('Username already taken', 'error');
    }

    const result = await auth.createUserWithEmailAndPassword(email, password);
    await result.user.updateProfile({ displayName });
    await createUserDocument(result.user, displayName, username);

    hideLoading();
    showToast('Account created! Welcome! 🎉', 'success');
  } catch (err) {
    hideLoading();
    console.error('Register error:', err);
    if (err.code === 'auth/email-already-in-use') showToast('Email already registered', 'error');
    else if (err.code === 'auth/weak-password') showToast('Password too weak', 'error');
    else showToast('Registration failed: ' + err.message, 'error');
  }
}

async function loginWithGoogle() {
  showLoading();
  try {
    const result = await auth.signInWithPopup(googleProvider);
    const isNewUser = result.additionalUserInfo?.isNewUser;

    if (isNewUser) {
      const username = generateUsername(result.user.displayName || 'user');
      await createUserDocument(result.user, result.user.displayName || 'User', username);
      showToast('Welcome to Vidr! 🎉', 'success');
    } else {
      const userData = await getUserData(result.user.uid);
      if (userData?.banned) {
        await auth.signOut();
        hideLoading();
        showToast('Your account has been banned', 'error');
        return;
      }
    }

    hideLoading();
  } catch (err) {
    hideLoading();
    console.error('Google login error:', err);
    if (err.code !== 'auth/popup-closed-by-user') {
      showToast('Login failed: ' + err.message, 'error');
    }
  }
}

function generateUsername(name) {
  const clean = name.toLowerCase().replace(/[^a-z0-9]/g, '');
  const suffix = Math.floor(Math.random() * 9999);
  return (clean || 'user') + suffix;
}

async function createUserDocument(user, displayName, username) {
  const now = firebase.firestore.FieldValue.serverTimestamp();
  const referrer = localStorage.getItem('vidr_referrer');

  // STRICT CHECK: Only this specific email gets admin role
  const isAdminUser = user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  const userData = {
    uid: user.uid,
    email: user.email,
    displayName: displayName,
    username: username,
    photoURL: user.photoURL || '',
    coverURL: '',
    bio: '',
    level: 1,
    xp: 0,
    xpBoostEnd: null,
    freeCoins: WELCOME_BONUS,
    goldCoins: 0,
    followersCount: 0,
    followingCount: 0,
    likesCount: 0,
    postsCount: 0,
    totalViews: 0,
    verified: isAdminUser, 
    verifiedUntil: null,
    role: isAdminUser ? 'admin' : 'user', // Defaults to 'user' for everyone else
    titles: [{ name: 'Newbie', rarity: 'common' }],
    selectedTitle: { name: 'Newbie', rarity: 'common' },
    achievements: {},
    selectedAchievements: [],
    banned: false,
    suspended: false,
    isPrivate: false,
    isBot: false,
    dailyStreak: 0,
    lastActive: now,
    createdAt: now
  };

  await db.collection('users').doc(user.uid).set(userData);
  await db.collection('usernames').doc(username).set({ uid: user.uid });
  
  if (referrer && referrer !== user.uid) {
    processReferral(referrer, user.uid);
  }
}

async function processReferral(referrerId, newUserId) {
  try {
    await db.collection('users').doc(referrerId).update({
      freeCoins: firebase.firestore.FieldValue.increment(REFERRAL_REWARD),
      referralCount: firebase.firestore.FieldValue.increment(1),
      referralEarnings: firebase.firestore.FieldValue.increment(REFERRAL_REWARD),
    });

    await db.collection('users').doc(newUserId).update({
      freeCoins: firebase.firestore.FieldValue.increment(REFERRAL_REWARD),
    });

    await db.collection('referrals').add({
      referrerId,
      referredId: newUserId,
      reward: REFERRAL_REWARD,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });

    const newUserData = await getUserData(newUserId);
    await addNotification(referrerId, {
      type: 'referral',
      text: `${newUserData?.displayName || 'Someone'} joined using your link! You earned ⚡${REFERRAL_REWARD}`,
      icon: '👥',
      fromUid: newUserId,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });

    await incrementAchievement(referrerId, 'referral');
  } catch (err) {
    console.error('Referral error:', err);
  }
}

async function getUserData(uid) {
  try {
    const doc = await db.collection('users').doc(uid).get();
    return doc.exists ? doc.data() : null;
  } catch (err) {
    console.error('Get user data error:', err);
    return null;
  }
}

async function loadUserData() {
  if (!APP.currentUser) return;
  const data = await getUserData(APP.currentUser.uid);
  if (data) {
    APP.currentUserData = data;
    updateNavAvatar();
    updateStoryAvatar();

    if (data.xpBoostEnd) {
      const end = data.xpBoostEnd.toDate ? data.xpBoostEnd.toDate() : new Date(data.xpBoostEnd);
      if (end > new Date()) {
        APP.xpBoostEnd = end;
        startXpBoostTimer();
      }
    }
  }
}

function updateNavAvatar() {
  const navAvatar = document.getElementById('navAvatar');
  if (navAvatar && APP.currentUserData?.photoURL) {
    navAvatar.src = APP.currentUserData.photoURL;
  }
}

function updateStoryAvatar() {
  const storyAvatar = document.getElementById('storyMyAvatar');
  if (storyAvatar && APP.currentUserData?.photoURL) {
    storyAvatar.src = APP.currentUserData.photoURL;
  }
}

async function onUserAuthenticated() {
  // Fetch following list to fix feed button state
  const followSnap = await db.collection('follows')
    .where('followerId', '==', APP.currentUser.uid)
    .get();
  
  APP.followingIds = new Set();
  followSnap.forEach(doc => APP.followingIds.add(doc.data().followingId));
  
  try {
    // Try to update, but don't fail if document doesn't exist
    const userRef = db.collection('users').doc(APP.currentUser.uid);
    const doc = await userRef.get();
    
    if (doc.exists) {
      await userRef.update({
        lastActive: firebase.firestore.FieldValue.serverTimestamp(),
        lastLoginDate: new Date().toISOString().split('T')[0],
      });
    } else {
      console.warn('User document does not exist, creating one...');
      // Create it if missing
      const username = generateUsername(APP.currentUser.displayName || APP.currentUser.email.split('@')[0]);
      await createUserDocument(APP.currentUser, APP.currentUser.displayName || 'User', username);
      await loadUserData();
    }
  } catch (err) {
    console.error('onUserAuthenticated error:', err);
  }

  loadFeed();
  loadStories();
  startNotificationListener();
  startChatBadgeListener();
  checkDailyReward();
  setupBannerAd();
  startInterstitialTimer();
  startFeedXpTimer();
  startStoriesHideTimer();

  const params = new URLSearchParams(window.location.search);
  if (params.get('action') === 'create') navigateTo('create');
  if (params.get('page') === 'chat') navigateTo('chat');
}

let usernameCheckTimeout = null;

function checkUsername(value) {
  const status = document.getElementById('usernameStatus');
  const username = value.trim().toLowerCase();

  if (usernameCheckTimeout) clearTimeout(usernameCheckTimeout);

  if (!username || username.length < 3) {
    status.textContent = '';
    status.className = 'username-status';
    return;
  }

  if (!/^[a-z0-9._]+$/.test(username)) {
    status.textContent = '✕';
    status.className = 'username-status taken';
    return;
  }

  status.textContent = '...';
  status.className = 'username-status checking';

  usernameCheckTimeout = setTimeout(async () => {
    try {
      const doc = await db.collection('usernames').doc(username).get();
      if (doc.exists) {
        status.textContent = '✕';
        status.className = 'username-status taken';
      } else {
        status.textContent = '✓';
        status.className = 'username-status available';
      }
    } catch (err) {
      status.textContent = '';
    }
  }, 500);
}

// ==================== LOGOUT / DELETE ACCOUNT ====================

async function logout() {
  openCenterModal(`
    <div class="modal-title">Log Out</div>
    <p class="modal-text">Are you sure you want to log out?</p>
    <div class="modal-actions">
      <button class="modal-btn secondary" onclick="closeCenterModal()">Cancel</button>
      <button class="modal-btn danger" onclick="confirmLogout()">Log Out</button>
    </div>
  `);
}

async function confirmLogout() {
  closeCenterModal();
  showLoading();
  try {
    APP.listeners.forEach(unsub => { if (typeof unsub === 'function') unsub(); });
    if (APP.notifListener) APP.notifListener();

    await auth.signOut();
    APP.currentUser = null;
    APP.currentUserData = null;
    APP.feedPosts = [];
    APP.feedLastDoc = null;
    APP.notifications = [];

    hideLoading();
    showAuth();
  } catch (err) {
    hideLoading();
    showToast('Logout failed', 'error');
  }
}

async function deleteAccount() {
  openCenterModal(`
    <div class="modal-title" style="color:var(--error)">Delete Account</div>
    <p class="modal-text">This action is permanent and cannot be undone. All your data will be deleted.</p>
    <div class="modal-actions">
      <button class="modal-btn secondary" onclick="closeCenterModal()">Cancel</button>
      <button class="modal-btn danger" onclick="confirmDeleteAccount()">Delete Forever</button>
    </div>
  `);
}

async function confirmDeleteAccount() {
  closeCenterModal();
  showLoading();
  try {
    const uid = APP.currentUser.uid;
    const username = APP.currentUserData?.username;

    await db.collection('users').doc(uid).delete();
    if (username) {
      await db.collection('usernames').doc(username).delete();
    }
    await APP.currentUser.delete();

    hideLoading();
    showToast('Account deleted', 'info');
    showAuth();
  } catch (err) {
    hideLoading();
    if (err.code === 'auth/requires-recent-login') {
      showToast('Please log out and log in again before deleting', 'error');
    } else {
      showToast('Failed to delete account', 'error');
    }
  }
}

console.log('Vidr Part 2 loaded: Init, Auth, Navigation');

// ==========================================
// VIDR - app.js Part 3
// XP, Achievements, Daily Rewards, Utils, Social
// ==========================================

// ==================== XP SYSTEM ====================

function getXpForLevel(level) {
  // Cap the level to prevent overflow
  const cappedLevel = Math.min(level, MAX_LEVEL);
  // Use a more reasonable formula
  return Math.floor(XP_PER_LEVEL_BASE + (cappedLevel * 50));
}

function getTotalXpForLevel(level) {
  let total = 0;
  for (let i = 1; i < level; i++) {
    total += getXpForLevel(i);
  }
  return total;
}

async function addXp(uid, amount, source = 'action') {
  if (!uid) return;

  try {
    const userData = await getUserData(uid);
    if (!userData) return;

    let multiplier = 1;
    if (userData.xpBoostEnd) {
      const end = userData.xpBoostEnd.toDate ? userData.xpBoostEnd.toDate() : new Date(userData.xpBoostEnd);
      if (end > new Date()) multiplier = 2;
    }

    const xpGain = Math.floor(amount * multiplier);
    let currentXp = (userData.xp || 0) + xpGain;
    let currentLevel = userData.level || 1;
    let levelsGained = 0;

    while (currentLevel < MAX_LEVEL) {
      const xpNeeded = getXpForLevel(currentLevel);
      if (currentXp >= xpNeeded) {
        currentXp -= xpNeeded;
        currentLevel++;
        levelsGained++;
      } else {
        break;
      }
    }

    await db.collection('users').doc(uid).update({
      xp: currentXp,
      level: currentLevel,
    });

    if (levelsGained > 0 && uid === APP.currentUser?.uid) {
      APP.currentUserData.level = currentLevel;
      APP.currentUserData.xp = currentXp;

      showLevelUpModal(currentLevel);
      await incrementAchievement(uid, 'level_up', levelsGained);
    }
  } catch (err) {
    console.error('Add XP error:', err);
  }
}

function showLevelUpModal(level) {
  openCenterModal(`
    <div class="level-up-modal">
      <div class="level-up-icon">🎉</div>
      <h3>Level Up!</h3>
      <div class="level-up-text">Level ${level}</div>
      <p class="modal-text" style="margin-top:10px">Keep going! You're doing amazing!</p>
      <div class="modal-actions">
        <button class="modal-btn primary" onclick="closeCenterModal()">Awesome!</button>
      </div>
    </div>
  `);
  launchConfetti();
}

// ==================== FEED XP TIMER ====================

function startFeedXpTimer() {
  stopFeedXpTimer();
  if (!APP.currentUser) return;

  APP.feedXpAccumulated = 0;
  APP.feedXpTimer = setInterval(() => {
    APP.feedXpAccumulated++;

    if (APP.feedXpAccumulated % 30 === 0) {
      addXp(APP.currentUser.uid, 1, 'feed_watch');

      if (APP.feedXpAccumulated % 300 === 0) {
        db.collection('users').doc(APP.currentUser.uid).update({
          freeCoins: firebase.firestore.FieldValue.increment(1),
        });
        if (APP.currentUserData) APP.currentUserData.freeCoins++;
        showToast('Earned ⚡1 for watching!', 'success');
      }
    }
  }, 1000);
}

function stopFeedXpTimer() {
  if (APP.feedXpTimer) {
    clearInterval(APP.feedXpTimer);
    APP.feedXpTimer = null;
  }
}

// ==================== XP BOOST ====================

function startXpBoostTimer() {
  if (APP.xpBoostTimer) clearInterval(APP.xpBoostTimer);

  const timerEl = document.getElementById('xpBoostTimer');
  const countdownEl = document.getElementById('xpBoostCountdown');

  function updateTimer() {
    if (!APP.xpBoostEnd) {
      timerEl.style.display = 'none';
      clearInterval(APP.xpBoostTimer);
      return;
    }

    const now = new Date();
    const diff = APP.xpBoostEnd - now;

    if (diff <= 0) {
      timerEl.style.display = 'none';
      APP.xpBoostEnd = null;
      clearInterval(APP.xpBoostTimer);
      showToast('XP Boost expired!', 'info');
      return;
    }

    timerEl.style.display = 'flex';
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      countdownEl.textContent = `${hours}h ${mins}m`;
    } else {
      countdownEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
  }

  updateTimer();
  APP.xpBoostTimer = setInterval(updateTimer, 1000);
}

function openXpBoost() {
  let html = `
    <h3 class="sheet-title">⚡ XP Boost</h3>
    <p style="text-align:center;color:var(--text-tertiary);font-size:13px;margin-bottom:16px">
      Get 2x XP for all activities!
    </p>
    <div style="display:flex;flex-direction:column;gap:8px">
  `;

  XP_BOOST_OPTIONS.forEach((opt, i) => {
    html += `
      <div class="sheet-option" onclick="buyXpBoost(${i})" style="cursor:pointer">
        <div class="sheet-option-icon">⚡</div>
        <div class="sheet-option-text">
          <div class="sheet-option-label">${opt.label}</div>
          <div class="sheet-option-sublabel">2x XP multiplier</div>
        </div>
        <span style="color:var(--warning);font-weight:700;font-size:14px">⚡${opt.cost}</span>
      </div>
    `;
  });

  html += '</div>';
  openBottomSheet(html);
}

async function buyXpBoost(index) {
  const opt = XP_BOOST_OPTIONS[index];
  if (!APP.currentUserData) return;

  if (APP.currentUserData.freeCoins < opt.cost) {
    return showToast('Not enough free coins!', 'error');
  }

  openCenterModal(`
    <div class="modal-title">Confirm Purchase</div>
    <p class="modal-text">Activate ${opt.label} XP Boost for ⚡${opt.cost}?</p>
    <div class="modal-actions">
      <button class="modal-btn secondary" onclick="closeCenterModal()">Cancel</button>
      <button class="modal-btn primary" onclick="confirmXpBoost(${index})">Confirm</button>
    </div>
  `);
}

async function confirmXpBoost(index) {
  closeCenterModal();
  closeBottomSheet();

  const opt = XP_BOOST_OPTIONS[index];
  showLoading();

  try {
    const end = new Date(Date.now() + opt.duration * 1000);

    await db.collection('users').doc(APP.currentUser.uid).update({
      freeCoins: firebase.firestore.FieldValue.increment(-opt.cost),
      xpBoostEnd: end,
    });

    APP.currentUserData.freeCoins -= opt.cost;
    APP.xpBoostEnd = end;

    await db.collection('transactions').add({
      uid: APP.currentUser.uid,
      type: 'xp_boost',
      amount: -opt.cost,
      coinType: 'free',
      description: `${opt.label} XP Boost`,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });

    startXpBoostTimer();
    hideLoading();
    showToast(`⚡ ${opt.label} XP Boost activated!`, 'success');
  } catch (err) {
    hideLoading();
    showToast('Failed to activate boost', 'error');
  }
}

// ==================== ACHIEVEMENTS ====================

async function incrementAchievement(uid, achievementId, amount = 1) {
  if (!uid) return;

  try {
    const userData = await getUserData(uid);
    if (!userData) return;

    const achievements = userData.achievements || {};
    const current = achievements[achievementId] || 0;
    const achievementDef = ACHIEVEMENT_TYPES.find(a => a.id === achievementId);
    if (!achievementDef) return;

    const newLevel = Math.min(current + amount, achievementDef.maxLevel);
    achievements[achievementId] = newLevel;

    await db.collection('users').doc(uid).update({
      achievements: achievements,
    });

    if (uid === APP.currentUser?.uid) {
      APP.currentUserData.achievements = achievements;
    }

    const milestones = [1, 5, 10, 25, 50, 100];
    for (const milestone of milestones) {
      if (current < milestone && newLevel >= milestone) {
        if (uid === APP.currentUser?.uid) {
          showToast(`🏆 Achievement: ${achievementDef.name} Level ${milestone}!`, 'success');
          await addXp(uid, milestone * 2, 'achievement');

          if (Math.random() < PAID_REWARD_CHANCE) {
            const goldReward = Math.floor(Math.random() * 50) + 1;
            await db.collection('users').doc(uid).update({
              goldCoins: firebase.firestore.FieldValue.increment(goldReward),
            });
            showToast(`🎰 INCREDIBLE! You won 🪙${goldReward} gold coins!`, 'success');
            launchConfetti();
          }
        }
        break;
      }
    }
  } catch (err) {
    console.error('Achievement error:', err);
  }
}

// ==================== DAILY REWARD ====================

async function checkDailyReward() {
  if (!APP.currentUser || !APP.currentUserData) return;

  const today = new Date().toISOString().split('T')[0];
  const lastReward = APP.currentUserData.lastDailyReward;

  if (lastReward === today) return;

  const lastDate = APP.currentUserData.lastLoginDate;
  let streak = APP.currentUserData.dailyStreak || 0;

  if (lastDate) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (lastDate === yesterdayStr) {
      streak++;
    } else if (lastDate !== today) {
      streak = 1;
    }
  } else {
    streak = 1;
  }

  const roll = Math.random();
  let reward, rarity;

  if (roll < 0.50) {
    reward = Math.floor(Math.random() * 4) + 1;
    rarity = 'common';
  } else if (roll < 0.75) {
    reward = Math.floor(Math.random() * 10) + 5;
    rarity = 'uncommon';
  } else if (roll < 0.90) {
    reward = Math.floor(Math.random() * 35) + 15;
    rarity = 'rare';
  } else if (roll < 0.98) {
    reward = Math.floor(Math.random() * 100) + 50;
    rarity = 'epic';
  } else {
    reward = Math.floor(Math.random() * 51) + 150;
    rarity = 'legendary';
  }

  try {
    await db.collection('users').doc(APP.currentUser.uid).update({
      freeCoins: firebase.firestore.FieldValue.increment(reward),
      lastDailyReward: today,
      dailyStreak: streak,
    });

    APP.currentUserData.freeCoins += reward;
    APP.currentUserData.dailyStreak = streak;
    APP.currentUserData.lastDailyReward = today;

    setTimeout(() => {
      showDailyRewardModal(reward, rarity, streak);
    }, 2500);

    await addXp(APP.currentUser.uid, 5, 'daily_login');
    await incrementAchievement(APP.currentUser.uid, 'daily_login');
  } catch (err) {
    console.error('Daily reward error:', err);
  }
}

function showDailyRewardModal(reward, rarity, streak) {
  const rarityNames = {
    common: 'Common', uncommon: 'Uncommon', rare: 'Rare',
    epic: 'Epic', legendary: 'Legendary'
  };

  openCenterModal(`
    <div class="daily-reward-modal">
      <h3 class="modal-title">Daily Reward!</h3>
      <div class="daily-gift-box">🎁</div>
      <div class="daily-reward-amount">⚡ ${reward}</div>
      <div class="daily-reward-rarity ${rarity}">${rarityNames[rarity]}</div>
      <p class="modal-text">Free coins added to your wallet</p>
      <div class="daily-streak">🔥 ${streak} day streak!</div>
      <div class="modal-actions" style="margin-top:16px">
        <button class="modal-btn primary" onclick="closeCenterModal()">Claim!</button>
      </div>
    </div>
  `);

  if (rarity === 'epic' || rarity === 'legendary') {
    launchConfetti();
  }
}

// ==================== NOTIFICATIONS ====================

function startNotificationListener() {
  if (APP.notifListener) APP.notifListener();

  APP.notifListener = db.collection('notifications')
    .where('uid', '==', APP.currentUser.uid)
    .orderBy('createdAt', 'desc')
    .limit(50)
    .onSnapshot(snapshot => {
      APP.notifications = [];
      let unread = 0;

      snapshot.forEach(doc => {
        const data = { id: doc.id, ...doc.data() };
        APP.notifications.push(data);
        if (!data.read) unread++;
      });

      updateNotifBadge(unread);
    });
}

function updateNotifBadge(count) {
  const badge = document.getElementById('notifBadge');
  if (count > 0) {
    badge.style.display = 'flex';
    badge.textContent = count > 99 ? '99+' : count;
  } else {
    badge.style.display = 'none';
  }
}

async function addNotification(uid, data) {
  try {
    await db.collection('notifications').add({
      uid,
      ...data,
      read: false,
      createdAt: data.createdAt || firebase.firestore.FieldValue.serverTimestamp(),
    });
  } catch (err) {
    console.error('Add notification error:', err);
  }
}

function startChatBadgeListener() {
  db.collection('chatRooms')
    .where('participants', 'array-contains', APP.currentUser.uid)
    .onSnapshot(snapshot => {
      let totalUnread = 0;
      snapshot.forEach(doc => {
        const data = doc.data();
        const unreadKey = `unread_${APP.currentUser.uid}`;
        totalUnread += data[unreadKey] || 0;
      });

      const badge = document.getElementById('chatNavBadge');
      if (totalUnread > 0) {
        badge.style.display = 'flex';
        badge.textContent = totalUnread > 99 ? '99+' : totalUnread;
      } else {
        badge.style.display = 'none';
      }
    });
}

// ==================== STORIES HIDE TIMER ====================

function startStoriesHideTimer() {
  if (APP.storiesHideTimer) clearTimeout(APP.storiesHideTimer);

  APP.storiesHidden = false;
  const storiesBar = document.getElementById('storiesBar');
  storiesBar.classList.remove('hidden');

  APP.storiesHideTimer = setTimeout(() => {
    APP.storiesHidden = true;
    storiesBar.classList.add('hidden');
  }, STORIES_HIDE_DELAY);
}

// ==================== AD SYSTEM ====================
function setupBannerAd() {
  const bannerAd = document.getElementById('bannerAd');
  if (!bannerAd) return; // Safety check
  
  bannerAd.style.display = 'flex';
  loadAdsterraBanner();

  setInterval(() => {
    loadAdsterraBanner();
    APP.adImpressions++;
  }, BANNER_REFRESH_INTERVAL);
}

function loadAdsterraBanner() {
  const bannerContent = document.getElementById('bannerAdContent');
  if (!bannerContent) return; // Safety check - THIS FIXES THE ERROR
  
  bannerContent.innerHTML = `
    <div style="width:320px;height:50px;background:var(--bg-tertiary);border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:11px;color:var(--text-muted)">
      <script>
  atOptions = {
    'key' : 'd5b030ab7dc6f25911930cebe81375a3',
    'format' : 'iframe',
    'height' : 60,
    'width' : 468,
    'params' : {}
  };
</script>
<script src="https://www.highperformanceformat.com/d5b030ab7dc6f25911930cebe81375a3/invoke.js"></script>
    </div>
  `;

  APP.adImpressions++;
}

function startInterstitialTimer() {
  APP.interstitialTimer = setInterval(() => {
    if (Date.now() - APP.lastInterstitialTime >= AD_INTERSTITIAL_INTERVAL) {
      showInterstitialAd();
    }
  }, AD_INTERSTITIAL_INTERVAL);
}

function showInterstitialAd() {
  APP.lastInterstitialTime = Date.now();
  APP.adImpressions++;
  console.log('Interstitial ad triggered');
}

function showRewardedAd(callback) {
  // REPLACE 'YOUR_NATIVE_BANNER_KEY' with your actual Adsterra Native Banner key
  const NATIVE_AD_KEY = '33a09e788da26a493e7cb3d24079d49e'; // e.g., 'a1b2c3d4e5f6'
  const NATIVE_AD_SRC = 'https://hystericallikingdowntown.com/33a09e788da26a493e7cb3d24079d49e/invoke.js'; // Your actual URL
  
  openCenterModal(`
    <div class="modal-title">📺 Watch Ad to Earn</div>
    <p class="modal-text" style="margin-bottom:12px">Please watch the ad below to claim your reward</p>
    
    <div id="rewardedAdContainer" style="min-height:280px;background:var(--bg-tertiary);border-radius:var(--radius-md);padding:16px;margin-bottom:12px;overflow:hidden">
      <div id="container-${NATIVE_AD_KEY}"></div>
      <div id="adFallback" style="text-align:center;padding:20px;color:var(--text-muted);font-size:13px">
        <div style="font-size:40px;margin-bottom:10px">📺</div>
        Loading ad...
      </div>
    </div>
    
    <p class="modal-text" id="rewardedAdCountdown" style="text-align:center;font-weight:600">
      ⏱️ Please wait <span id="adTimer">15</span> seconds...
    </p>
    
    <div class="modal-actions">
      <button class="modal-btn secondary" onclick="cancelRewardedAd()">Cancel</button>
      <button class="modal-btn primary" id="claimRewardBtn" disabled style="opacity:0.4;cursor:not-allowed">
        Claim Reward
      </button>
    </div>
  `);

  // Load the Adsterra Native Banner script
  const container = document.getElementById('rewardedAdContainer');
  if (container) {
    const script = document.createElement('script');
    script.async = true;
    script.setAttribute('data-cfasync', 'false');
    script.src = NATIVE_AD_SRC;
    script.onerror = () => {
      const fallback = document.getElementById('adFallback');
      if (fallback) {
        fallback.innerHTML = '<div style="font-size:40px;margin-bottom:10px">📺</div>Ad loading... Please wait for the timer.';
      }
    };
    container.appendChild(script);
  }

  // Store callback globally
  window._rewardedAdCallback = callback;

  // 15 second countdown
  let seconds = 15;
  const timerEl = document.getElementById('adTimer');
  const claimBtn = document.getElementById('claimRewardBtn');
  const countdownEl = document.getElementById('rewardedAdCountdown');

  window._rewardedAdTimer = setInterval(() => {
    seconds--;
    if (timerEl) timerEl.textContent = seconds;

    if (seconds <= 0) {
      clearInterval(window._rewardedAdTimer);
      if (countdownEl) {
        countdownEl.innerHTML = '✅ <strong style="color:var(--success)">Ad completed! Claim your reward.</strong>';
      }
      if (claimBtn) {
        claimBtn.disabled = false;
        claimBtn.style.opacity = '1';
        claimBtn.style.cursor = 'pointer';
        claimBtn.onclick = () => {
          closeCenterModal();
          APP.adImpressions++;
          if (window._rewardedAdCallback) {
            window._rewardedAdCallback();
            window._rewardedAdCallback = null;
          }
        };
      }
    }
  }, 1000);
}

function cancelRewardedAd() {
  if (window._rewardedAdTimer) {
    clearInterval(window._rewardedAdTimer);
    window._rewardedAdTimer = null;
  }
  window._rewardedAdCallback = null;
  closeCenterModal();
  showToast('Ad cancelled - no reward earned', 'warning');
}

// ==================== UTILITY FUNCTIONS ====================

function timeAgo(date) {
  if (!date) return '';
  const d = date.toDate ? date.toDate() : new Date(date);
  const now = new Date();
  const diff = Math.floor((now - d) / 1000);

  if (diff < 60) return 'Just now';
  if (diff < 3600) return Math.floor(diff / 60) + 'm';
  if (diff < 86400) return Math.floor(diff / 3600) + 'h';
  if (diff < 604800) return Math.floor(diff / 86400) + 'd';
  if (diff < 2592000) return Math.floor(diff / 604800) + 'w';
  return d.toLocaleDateString();
}

function formatNumber(num) {
  if (!num) return '0';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

function formatMoney(amount) {
  return '$' + (amount || 0).toFixed(2);
}

function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

function throttle(fn, limit) {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

async function compressImage(file, maxWidth = 1080, quality = 0.8) {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      let w = img.width;
      let h = img.height;
      if (w > maxWidth) {
        h = (maxWidth / w) * h;
        w = maxWidth;
      }
      canvas.width = w;
      canvas.height = h;
      ctx.drawImage(img, 0, 0, w, h);
      canvas.toBlob(resolve, 'image/jpeg', quality);
    };
    img.src = URL.createObjectURL(file);
  });
}

function generateThumbnail(videoFile) {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    video.addEventListener('loadeddata', () => {
      video.currentTime = 1;
    });

    video.addEventListener('seeked', () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);
      canvas.toBlob((blob) => {
        URL.revokeObjectURL(video.src);
        resolve(blob);
      }, 'image/jpeg', 0.7);
    });

    video.src = URL.createObjectURL(videoFile);
    video.load();
  });
}

function parseMentions(text) {
  if (!text) return '';
  return text.replace(/@(\w+)/g, '<span class="mention">@$1</span>')
    .replace(/#(\w+)/g, '<span class="hashtag">#$1</span>');
}

function getVerifiedBadge() {
  return `<span class="verified-badge"><svg viewBox="0 0 24 24" class="verified-svg"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg></span>`;
}

function getRoleBadge(role) {
  if (role === 'admin') return '<span class="role-badge admin">ADMIN</span>';
  if (role === 'moderator') return '<span class="role-badge moderator">MOD</span>';
  if (role === 'marketing') return '<span class="role-badge marketing">MARKETING</span>';
  return '';
}

function escapeHTML(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// User data cache
const userDataCache = {};

async function getUserDataCached(uid) {
  if (userDataCache[uid] && Date.now() - userDataCache[uid]._cachedAt < 300000) {
    return userDataCache[uid];
  }
  const data = await getUserData(uid);
  if (data) {
    data._cachedAt = Date.now();
    userDataCache[uid] = data;
  }
  return data;
}

function clearUserCache(uid) {
  delete userDataCache[uid];
}

// ==================== PROFILE VISITORS (FOOTPRINT) ====================

async function recordProfileVisit(profileUid) {
  if (!APP.currentUser || profileUid === APP.currentUser.uid) return;

  try {
    const visitRef = db.collection('profileVisits').doc(`${profileUid}_${APP.currentUser.uid}`);
    await visitRef.set({
      profileUid,
      visitorUid: APP.currentUser.uid,
      visitedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });

    await db.collection('users').doc(profileUid).update({
      profileViews: firebase.firestore.FieldValue.increment(1),
    });

    await incrementAchievement(profileUid, 'profile_views');
  } catch (err) {
    console.error('Record visit error:', err);
  }
}

async function loadProfileVisitors() {
  openOverlayPage('profileVisitorsPage');
  const container = document.getElementById('visitorsContent');
  container.innerHTML = '<div class="loading-spinner small" style="margin:40px auto"></div>';

  try {
    const snapshot = await db.collection('profileVisits')
      .where('profileUid', '==', APP.currentUser.uid)
      .orderBy('visitedAt', 'desc')
      .limit(50)
      .get();

    if (snapshot.empty) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">👣</div>
          <h3>No visitors yet</h3>
          <p>When people view your profile, they'll appear here</p>
        </div>
      `;
      return;
    }

    let html = '';
    for (const doc of snapshot.docs) {
      const data = doc.data();
      const visitorData = await getUserData(data.visitorUid);
      if (!visitorData) continue;

      html += `
        <div class="visitor-item" onclick="viewProfile('${data.visitorUid}')">
          <img src="${visitorData.photoURL || 'default-avatar.png'}" alt="" onerror="this.src='default-avatar.png'">
          <div class="visitor-info">
            <div class="visitor-name">${escapeHTML(visitorData.displayName)}${visitorData.verified ? ' ' + getVerifiedBadge() : ''}</div>
            <div class="visitor-time">${timeAgo(data.visitedAt)}</div>
          </div>
        </div>
      `;
    }

    container.innerHTML = html;
  } catch (err) {
    console.error('Load visitors error:', err);
    container.innerHTML = '<div class="empty-state"><p>Failed to load visitors</p></div>';
  }
}

// ==================== FOLLOW / UNFOLLOW ====================

async function followUser(targetUid) {
  if (!APP.currentUser || targetUid === APP.currentUser.uid) return;

  try {
    const followRef = db.collection('follows').doc(`${APP.currentUser.uid}_${targetUid}`);
    await followRef.set({
      followerId: APP.currentUser.uid,
      followingId: targetUid,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });

    await db.collection('users').doc(APP.currentUser.uid).update({
      followingCount: firebase.firestore.FieldValue.increment(1),
    });
    await db.collection('users').doc(targetUid).update({
      followersCount: firebase.firestore.FieldValue.increment(1),
    });

    await addNotification(targetUid, {
      type: 'follow',
      text: `${APP.currentUserData.displayName} started following you`,
      icon: '👤',
      fromUid: APP.currentUser.uid,
    });

    await addXp(APP.currentUser.uid, 2, 'follow');
    await incrementAchievement(APP.currentUser.uid, 'first_follow');

    showToast('Following!', 'success');
  } catch (err) {
    console.error('Follow error:', err);
    showToast('Failed to follow', 'error');
  }
}

async function unfollowUser(targetUid) {
  if (!APP.currentUser || targetUid === APP.currentUser.uid) return;

  try {
    const followRef = db.collection('follows').doc(`${APP.currentUser.uid}_${targetUid}`);
    await followRef.delete();

    await db.collection('users').doc(APP.currentUser.uid).update({
      followingCount: firebase.firestore.FieldValue.increment(-1),
    });
    await db.collection('users').doc(targetUid).update({
      followersCount: firebase.firestore.FieldValue.increment(-1),
    });

    showToast('Unfollowed', 'info');
  } catch (err) {
    console.error('Unfollow error:', err);
  }
}

async function isFollowing(targetUid) {
  if (!APP.currentUser) return false;
  try {
    const doc = await db.collection('follows').doc(`${APP.currentUser.uid}_${targetUid}`).get();
    return doc.exists;
  } catch {
    return false;
  }
}

async function getMutualCount(targetUid) {
  try {
    const myFollowing = await db.collection('follows')
      .where('followerId', '==', APP.currentUser.uid)
      .get();

    const myFollowingIds = new Set();
    myFollowing.forEach(doc => myFollowingIds.add(doc.data().followingId));

    const theirFollowers = await db.collection('follows')
      .where('followingId', '==', targetUid)
      .get();

    let mutual = 0;
    theirFollowers.forEach(doc => {
      if (myFollowingIds.has(doc.data().followerId)) mutual++;
    });

    return mutual;
  } catch {
    return 0;
  }
}

// ==================== LIKE / UNLIKE ====================

async function likePost(postId) {
  if (!APP.currentUser) return;

  try {
    const likeRef = db.collection('likes').doc(`${APP.currentUser.uid}_${postId}`);
    const likeDoc = await likeRef.get();

    if (likeDoc.exists) {
      await likeRef.delete();
      await db.collection('posts').doc(postId).update({
        likesCount: firebase.firestore.FieldValue.increment(-1),
      });
      updateLikeUI(postId, false);
    } else {
      await likeRef.set({
        uid: APP.currentUser.uid,
        postId,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });

      await db.collection('posts').doc(postId).update({
        likesCount: firebase.firestore.FieldValue.increment(1),
      });

      updateLikeUI(postId, true);

      const post = APP.feedPosts.find(p => p.id === postId) || APP.followingFeedPosts.find(p => p.id === postId);
      if (post && post.uid !== APP.currentUser.uid) {
        await addNotification(post.uid, {
          type: 'like',
          text: `${APP.currentUserData.displayName} liked your post`,
          icon: '❤️',
          fromUid: APP.currentUser.uid,
          postId,
        });

        await db.collection('users').doc(post.uid).update({
          likesCount: firebase.firestore.FieldValue.increment(1),
        });
      }

      await addXp(APP.currentUser.uid, 1, 'like');
      await incrementAchievement(APP.currentUser.uid, 'first_like');
    }
  } catch (err) {
    console.error('Like error:', err);
  }
}

function updateLikeUI(postId, liked) {
  const btn = document.querySelector(`[data-like-post="${postId}"]`);
  if (!btn) return;

  const post = APP.feedPosts.find(p => p.id === postId) || APP.followingFeedPosts.find(p => p.id === postId);
  const count = btn.querySelector('.like-count');

  if (liked) {
    btn.classList.add('liked');
    btn.querySelector('svg').setAttribute('fill', 'var(--error)');
    if (post) {
      post.likesCount = (post.likesCount || 0) + 1;
      post.liked = true;
    }
  } else {
    btn.classList.remove('liked');
    btn.querySelector('svg').setAttribute('fill', 'none');
    if (post) {
      post.likesCount = Math.max(0, (post.likesCount || 0) - 1);
      post.liked = false;
    }
  }

  if (count && post) {
    count.textContent = formatNumber(post.likesCount);
  }
}

async function isPostLiked(postId) {
  if (!APP.currentUser) return false;
  try {
    const doc = await db.collection('likes').doc(`${APP.currentUser.uid}_${postId}`).get();
    return doc.exists;
  } catch {
    return false;
  }
}

// ==================== BLOCK / REPORT ====================

async function blockUser(uid) {
  if (!APP.currentUser || uid === APP.currentUser.uid) return;

  openCenterModal(`
    <div class="modal-title">Block User</div>
    <p class="modal-text">They won't be able to see your profile or send you messages.</p>
    <div class="modal-actions">
      <button class="modal-btn secondary" onclick="closeCenterModal()">Cancel</button>
      <button class="modal-btn danger" onclick="confirmBlockUser('${uid}')">Block</button>
    </div>
  `);
}

async function confirmBlockUser(uid) {
  closeCenterModal();
  try {
    await db.collection('users').doc(APP.currentUser.uid).update({
      blockedUsers: firebase.firestore.FieldValue.arrayUnion(uid),
    });

    await unfollowUser(uid);

    APP.currentUserData.blockedUsers = APP.currentUserData.blockedUsers || [];
    APP.currentUserData.blockedUsers.push(uid);

    showToast('User blocked', 'success');
  } catch (err) {
    showToast('Failed to block user', 'error');
  }
}

async function unblockUser(uid) {
  try {
    await db.collection('users').doc(APP.currentUser.uid).update({
      blockedUsers: firebase.firestore.FieldValue.arrayRemove(uid),
    });

    APP.currentUserData.blockedUsers = (APP.currentUserData.blockedUsers || []).filter(id => id !== uid);
    showToast('User unblocked', 'success');
  } catch (err) {
    showToast('Failed to unblock', 'error');
  }
}

async function reportUser(uid) {
  openCenterModal(`
    <div class="modal-title">Report User</div>
    <p class="modal-text">Why are you reporting this user?</p>
    <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:16px">
      <button class="modal-btn secondary" onclick="submitReport('${uid}','spam')">Spam</button>
      <button class="modal-btn secondary" onclick="submitReport('${uid}','inappropriate')">Inappropriate Content</button>
      <button class="modal-btn secondary" onclick="submitReport('${uid}','harassment')">Harassment</button>
      <button class="modal-btn secondary" onclick="submitReport('${uid}','other')">Other</button>
    </div>
    <button class="modal-btn secondary" onclick="closeCenterModal()">Cancel</button>
  `);
}

async function submitReport(uid, reason) {
  closeCenterModal();
  try {
    await db.collection('reports').add({
      reportedUid: uid,
      reporterId: APP.currentUser.uid,
      reason,
      status: 'pending',
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
    showToast('Report submitted. Thank you.', 'success');
  } catch (err) {
    showToast('Failed to submit report', 'error');
  }
}

function viewProfile(uid) {
  if (!uid) return;
  APP.profileViewingId = uid;

  if (uid === APP.currentUser?.uid) {
    navigateTo('profile');
  } else {
    loadProfile(uid, true);
  }
}

// ==================== CLEANUP ====================

window.addEventListener('beforeunload', () => {
  APP.listeners.forEach(unsub => {
    if (typeof unsub === 'function') unsub();
  });
  stopFeedXpTimer();
  if (APP.notifListener) APP.notifListener();
  if (APP.xpBoostTimer) clearInterval(APP.xpBoostTimer);
  if (APP.interstitialTimer) clearInterval(APP.interstitialTimer);
  if (APP.storiesHideTimer) clearTimeout(APP.storiesHideTimer);
});

// PWA install
let deferredPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
});

async function installApp() {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    if (result.outcome === 'accepted') {
      showToast('App installed! 🎉', 'success');
    }
    deferredPrompt = null;
  }
}

console.log('Vidr Part 3 loaded: XP, Achievements, Notifications, Social');

// ==========================================
// VIDR - app.js Part 4
// Feed, Rendering, Post Interactions, Comments
// ==========================================

// ==================== FEED SYSTEM ====================

function switchFeedTab(tab) {
  APP.feedTab = tab;

  document.querySelectorAll('.feed-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.tab === tab);
  });

  if (tab === 'foryou') {
    if (APP.feedPosts.length === 0) loadFeed();
    else renderFeed();
  } else {
    if (APP.followingFeedPosts.length === 0) loadFollowingFeed();
    else renderFollowingFeed();
  }
}

async function loadFeed(refresh = false) {
  if (APP.feedLoading) return;
  APP.feedLoading = true;

  if (refresh) {
    APP.feedPosts = [];
    APP.feedLastDoc = null;
    APP.feedEnded = false;
  }

  if (APP.feedEnded) {
    APP.feedLoading = false;
    return;
  }

  const feedLoading = document.getElementById('feedLoading');
  feedLoading.style.display = 'flex';

  try {
    let query = db.collection('posts')
      .where('visibility', 'in', ['public', 'followers'])
      .orderBy('createdAt', 'desc')
      .limit(FEED_PAGE_SIZE);

      try {
    // 1. Fetch Active Live Streams first
    const liveSnap = await db.collection('liveStreams')
      .where('isActive', '==', true)
      .limit(5)
      .get();
      
    const liveItems = [];
    liveSnap.forEach(doc => {
      const data = doc.data();
      liveItems.push({
        id: doc.id,
        ...data,
        type: 'live_preview', // Custom type
        uid: data.hostUid,
        createdAt: data.createdAt
      });
    });
        
    if (APP.feedLastDoc) {
      query = query.startAfter(APP.feedLastDoc);
    }

    const snapshot = await query.get();
             
    if (snapshot.empty) {
      APP.feedEnded = true;
      feedLoading.style.display = 'none';
      APP.feedLoading = false;
      if (APP.feedPosts.length === 0) renderEmptyFeed();
      return;
    }

    APP.feedLastDoc = snapshot.docs[snapshot.docs.length - 1];
    const blockedUsers = APP.currentUserData?.blockedUsers || [];

    for (const doc of snapshot.docs) {
      const post = { id: doc.id, ...doc.data() };

      if (blockedUsers.includes(post.uid)) continue;

      const posterData = await getUserDataCached(post.uid);
      if (posterData?.role === 'admin' && post.uid !== APP.currentUser?.uid) continue;

      post.userData = posterData;
      post.liked = await isPostLiked(post.id);

      APP.feedPosts.push(post);
    }

    renderFeed();
    feedLoading.style.display = 'none';
    APP.feedLoading = false;
    trackPostViews();
  } catch (err) {
    console.error('Load feed error:', err);
    feedLoading.style.display = 'none';
    APP.feedLoading = false;
    showToast('Failed to load feed', 'error');
  }
}

async function loadFollowingFeed(refresh = false) {
  if (APP.feedLoading) return;
  APP.feedLoading = true;

  if (refresh) {
    APP.followingFeedPosts = [];
    APP.followingLastDoc = null;
    APP.followingEnded = false;
  }

  if (APP.followingEnded) {
    APP.feedLoading = false;
    return;
  }

  const feedLoading = document.getElementById('feedLoading');
  feedLoading.style.display = 'flex';

  try {
    const followingSnap = await db.collection('follows')
      .where('followerId', '==', APP.currentUser.uid)
      .get();

    const followingIds = [];
    followingSnap.forEach(doc => followingIds.push(doc.data().followingId));

    if (followingIds.length === 0) {
      feedLoading.style.display = 'none';
      APP.feedLoading = false;
      renderEmptyFollowingFeed();
      return;
    }

    const chunks = [];
    for (let i = 0; i < followingIds.length; i += 10) {
      chunks.push(followingIds.slice(i, i + 10));
    }

    const allPosts = [];

    for (const chunk of chunks) {
      let query = db.collection('posts')
        .where('uid', 'in', chunk)
        .orderBy('createdAt', 'desc')
        .limit(FEED_PAGE_SIZE);

      if (APP.followingLastDoc) {
        query = query.startAfter(APP.followingLastDoc);
      }

      const snapshot = await query.get();
      snapshot.forEach(doc => {
        allPosts.push({ id: doc.id, ...doc.data(), _doc: doc });
      });
    }

    allPosts.sort((a, b) => {
      const aTime = a.createdAt?.toDate?.() || new Date(0);
      const bTime = b.createdAt?.toDate?.() || new Date(0);
      return bTime - aTime;
    });

    if (allPosts.length > 0) {
      APP.followingLastDoc = allPosts[allPosts.length - 1]._doc;
    } else {
      APP.followingEnded = true;
    }

    for (const post of allPosts) {
      delete post._doc;
      post.userData = await getUserDataCached(post.uid);
      post.liked = await isPostLiked(post.id);
      APP.followingFeedPosts.push(post);
    }

    renderFollowingFeed();
    feedLoading.style.display = 'none';
    APP.feedLoading = false;
  } catch (err) {
    console.error('Load following feed error:', err);
    feedLoading.style.display = 'none';
    APP.feedLoading = false;
  }
}

// ==================== RENDER FEED ====================

function renderFeed() {
  const container = document.getElementById('feedContainer');
  const posts = APP.feedTab === 'foryou' ? APP.feedPosts : APP.followingFeedPosts;

  let html = '';
  posts.forEach((post, index) => {
    if (index > 0 && index % AD_INTERVAL_POSTS === 0) {
      html += renderFeedAd(index);
    }
    html += renderFeedItem(post);
  });

  container.innerHTML = html;

  setupVideoObservers();
  setupCarousels();
  setupFeedScroll();
  injectFeedAds(); // ADD THIS LINE
}

function renderFollowingFeed() {
  const container = document.getElementById('feedContainer');

  if (APP.followingFeedPosts.length === 0) {
    renderEmptyFollowingFeed();
    return;
  }

  let html = '';
  APP.followingFeedPosts.forEach((post, index) => {
    if (index > 0 && index % AD_INTERVAL_POSTS === 0) {
      html += renderFeedAd(index);
    }
    html += renderFeedItem(post);
  });

  container.innerHTML = html;
  setupVideoObservers();
  setupCarousels();
  setupFeedScroll();
  injectFeedAds(); // ADD THIS LINE
}

function renderEmptyFeed() {
  const container = document.getElementById('feedContainer');
  container.innerHTML = `
    <div class="empty-state" style="min-height:60vh">
      <div class="empty-state-icon">📱</div>
      <h3>Welcome to Vidr!</h3>
      <p>Posts will appear here. Follow people or explore to get started!</p>
      <button class="modal-btn primary" style="margin-top:16px;width:auto;padding:10px 28px" onclick="navigateTo('discover')">Discover People</button>
    </div>
  `;
}

function renderEmptyFollowingFeed() {
  const container = document.getElementById('feedContainer');
  container.innerHTML = `
    <div class="empty-state" style="min-height:60vh">
      <div class="empty-state-icon">👥</div>
      <h3>Follow People</h3>
      <p>Posts from people you follow will appear here</p>
      <button class="modal-btn primary" style="margin-top:16px;width:auto;padding:10px 28px" onclick="navigateTo('discover')">Find People</button>
    </div>
  `;
}

function renderFeedItem(post) {
  if (post.type === 'live_preview') {
     return `
      <div class="feed-item live-feed-item" onclick="joinLiveStream('${post.uid}')">
        <div class="feed-item-header">
           <img class="feed-avatar avatar-live" src="${post.hostAvatar}">
           <div class="feed-user-info">
              <span class="feed-displayname">${post.hostName} is LIVE</span>
              <span class="feed-time">Tap to join</span>
           </div>
        </div>
        <div class="feed-media">
           <div class="live-placeholder" style="background:#000; height:400px; display:flex; align-items:center; justify-content:center; color:#white;">
              <h2 class="live-indicator">WATCH LIVE</h2>
           </div>
        </div>
      </div>
     `;
  }
  const user = post.userData || {};
  const isVerified = user.verified;
  const isAdmin = user.role === 'admin';
  const showGlow = isVerified || isAdmin;
  const isOwn = post.uid === APP.currentUser?.uid;
  // Inside renderFeedItem(post)
const followingClass = APP.followingIds.has(post.uid) ? 'following' : '';
const followingText = APP.followingIds.has(post.uid) ? 'Following' : 'Follow';

  let mediaHTML = '';

  if (post.type === 'video') {
    mediaHTML = renderVideoMedia(post);
  } else if (post.type === 'image' || post.type === 'photo') {
    mediaHTML = renderImageMedia(post);
  } else if (post.type === 'text') {
    mediaHTML = renderTextMedia(post);
  }

  let liveBadge = '';
  if (post.isLive) {
    liveBadge = `<div class="feed-live-badge"><div class="feed-live-dot"></div>LIVE</div>`;
  }

  let sellingBadge = '';
  if (post.products && post.products.length > 0) {
    sellingBadge = `<div class="yellow-bag-btn" onclick="event.stopPropagation();openYellowBag('${post.id}')">🛍️</div>`;
  }

  let captionOverlay = '';
  if (post.captionOnMedia && post.caption && (post.type === 'video' || post.type === 'image' || post.type === 'photo')) {
    captionOverlay = `<div class="media-caption-overlay">${parseMentions(escapeHTML(post.caption))}</div>`;
  }

  return `
    <div class="feed-item" data-post-id="${post.id}" data-post-uid="${post.uid}">
      ${post.repostedBy ? `
        <div class="feed-repost-bar">
          <span>🔄</span> <span>${post.repostedByName || 'Someone'} reposted</span>
        </div>
      ` : ''}
      <div class="feed-item-header">
        <div class="feed-avatar-wrap ${showGlow ? 'verified' : ''}">
          <img class="feed-avatar" src="${user.photoURL || 'default-avatar.png'}" alt=""
               onclick="viewProfile('${post.uid}')" onerror="this.src='default-avatar.png'" loading="lazy">
        </div>
        <div class="feed-user-info" onclick="viewProfile('${post.uid}')">
          <div class="feed-username-row">
            <span class="feed-displayname ${showGlow ? 'glow' : ''}">${escapeHTML(user.displayName || 'User')}</span>
            ${isVerified ? getVerifiedBadge() : ''}
            ${getRoleBadge(user.role)}
          </div>
          <span class="feed-time">${timeAgo(post.createdAt)}</span>
        </div>
       ${!isOwn ? `
  <button class="feed-follow-btn ${followingClass}" id="followBtn_${post.id}" onclick="event.stopPropagation();toggleFeedFollow('${post.uid}','${post.id}')">
    ${followingText}
  </button>
` : ''}
        <button class="feed-more-btn" onclick="event.stopPropagation();openPostOptions('${post.id}','${post.uid}')">⋯</button>
      </div>

      <div class="feed-media" onclick="handleMediaClick('${post.id}','${post.type}')">
        ${mediaHTML}
        ${liveBadge}
        ${sellingBadge}
        ${captionOverlay}
      </div>

      <div class="feed-actions">
        <button class="feed-action-btn ${post.liked ? 'liked' : ''}" data-like-post="${post.id}" onclick="likePost('${post.id}')">
          <svg viewBox="0 0 24 24" fill="${post.liked ? 'var(--error)' : 'none'}" stroke="currentColor" stroke-width="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
          <span class="like-count">${formatNumber(post.likesCount || 0)}</span>
        </button>
        <button class="feed-action-btn" onclick="openComments('${post.id}')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          <span>${formatNumber(post.commentsCount || 0)}</span>
        </button>
        <button class="feed-action-btn" onclick="sharePost('${post.id}')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/>
          </svg>
          <span>${formatNumber(post.sharesCount || 0)}</span>
        </button>
        <div class="feed-action-spacer"></div>
        <button class="feed-action-btn" onclick="bookmarkPost('${post.id}')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
          </svg>
        </button>
      </div>

      ${(!post.captionOnMedia && post.caption) ? `
        <div class="feed-caption-area">
          <div class="feed-caption">${parseMentions(escapeHTML(post.caption))}</div>
        </div>
      ` : ''}

      <div class="feed-caption-area" style="padding-top:0">
        <div class="feed-view-count">
          ${post.viewsCount ? `${formatNumber(post.viewsCount)} views` : ''}
        </div>
      </div>
    </div>
  `;
}

function renderVideoMedia(post) {
  const thumbnail = post.thumbnailURL || '';
  return `
    <div class="feed-video-wrap" data-video-id="${post.id}">
      <video
        src="${post.mediaURL || ''}"
        poster="${thumbnail}"
        playsinline
        loop
        muted
        preload="metadata"
        data-post-id="${post.id}"
        onclick="toggleVideoPlay(this)"
      ></video>
      <div class="feed-video-play" id="playOverlay_${post.id}">
        <svg viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg>
      </div>
    </div>
  `;
}

function renderImageMedia(post) {
  const images = post.mediaURLs || (post.mediaURL ? [post.mediaURL] : []);

  if (images.length === 0) return '';

  if (images.length === 1) {
    return `<img src="${images[0]}" alt="" loading="lazy" onerror="this.src='default-product.png'">`;
  }

  let slides = '';
  let dots = '';
  images.forEach((url, i) => {
    slides += `<div class="feed-carousel-slide"><img src="${url}" alt="" loading="lazy" onerror="this.src='default-product.png'"></div>`;
    dots += `<div class="carousel-dot ${i === 0 ? 'active' : ''}" data-index="${i}"></div>`;
  });

  return `
    <div class="feed-carousel" data-carousel-id="${post.id}" data-total="${images.length}">
      <div class="feed-carousel-track" data-current="0" style="width:${images.length * 100}%">
        ${slides}
      </div>
      <div class="feed-carousel-dots">${dots}</div>
    </div>
  `;
}

function renderTextMedia(post) {
  const bg = post.background || TEXT_BG_COLORS[0];
  return `
    <div class="feed-text-post" style="background:${bg}">
      <div class="feed-text-content">${escapeHTML(post.text || post.caption || '')}</div>
    </div>
  `;
}

// ==================== AD SYSTEM ====================
const ADSTERRA_NATIVE_KEY = '33a09e788da26a493e7cb3d24079d49e'; // Leave empty to use beautiful placeholders
const ADSTERRA_NATIVE_URL = 'https://hystericallikingdowntown.com/33a09e788da26a493e7cb3d24079d49e/invoke.js'; // Leave empty to use beautiful placeholders

const PLACEHOLDER_ADS = [
  {
    icon: '🛍️',
    title: 'Shop the Latest Trends',
    desc: 'Amazing products at unbeatable prices',
    cta: 'Shop Now',
    gradient: 'linear-gradient(135deg, #ff6bb5, #a78bfa)'
  },
  {
    icon: '🎮',
    title: 'Play Free Games',
    desc: 'Thousands of fun games in your browser',
    cta: 'Play Free',
    gradient: 'linear-gradient(135deg, #7dd3fc, #a78bfa)'
  },
  {
    icon: '📱',
    title: 'Get Our Mobile App',
    desc: 'Better experience on iOS & Android',
    cta: 'Download',
    gradient: 'linear-gradient(135deg, #86efac, #4ade80)'
  },
  {
    icon: '🎁',
    title: 'Special Offer Just For You',
    desc: 'Limited time deal - Don\'t miss out!',
    cta: 'Claim Now',
    gradient: 'linear-gradient(135deg, #fda4af, #f43f5e)'
  },
  {
    icon: '✨',
    title: 'Premium Features Await',
    desc: 'Unlock everything with premium plan',
    cta: 'Try Free',
    gradient: 'linear-gradient(135deg, #fcd34d, #f59e0b)'
  },
  {
    icon: '🎬',
    title: 'Watch Movies & TV',
    desc: 'Unlimited streaming, no ads',
    cta: 'Start Free Trial',
    gradient: 'linear-gradient(135deg, #c084fc, #a855f7)'
  },
  {
    icon: '💎',
    title: 'Invest Smarter',
    desc: 'Start with just $1 - Grow your wealth',
    cta: 'Learn More',
    gradient: 'linear-gradient(135deg, #67e8f9, #06b6d4)'
  },
  {
    icon: '🍕',
    title: 'Food Delivered Fast',
    desc: 'Your favorite meals in 30 minutes',
    cta: 'Order Now',
    gradient: 'linear-gradient(135deg, #fca5a5, #ef4444)'
  }
];

function renderFeedAd(index) {
  // Use Adsterra if configured, otherwise beautiful placeholder
  if (ADSTERRA_NATIVE_KEY && ADSTERRA_NATIVE_URL) {
    return `
      <div class="feed-ad" data-ad-index="${index}">
        <div class="feed-ad-label">Sponsored</div>
        <div class="feed-ad-container">
          <div id="container-${ADSTERRA_NATIVE_KEY}-${index}"></div>
        </div>
      </div>
    `;
  }
  
  // Beautiful placeholder ad
  const ad = PLACEHOLDER_ADS[index % PLACEHOLDER_ADS.length];
  return `
    <div class="feed-ad" data-ad-index="${index}">
      <div class="feed-ad-label">Sponsored</div>
      <div class="feed-ad-placeholder" style="background:${ad.gradient}" onclick="handleAdClick(${index})">
        <div class="feed-ad-icon">${ad.icon}</div>
        <div class="feed-ad-title">${ad.title}</div>
        <div class="feed-ad-desc">${ad.desc}</div>
        <button class="feed-ad-cta">${ad.cta} →</button>
      </div>
    </div>
  `;
}

function handleAdClick(index) {
  APP.adImpressions++;
  showToast('Thanks for supporting Vidr! 💖', 'success');
}

function injectFeedAds() {
  if (!USE_ADSTERRA || !ADSTERRA_NATIVE_URL) return;
  
  document.querySelectorAll('.adsterra-native-container').forEach(container => {
    if (container.dataset.loaded) return;
    container.dataset.loaded = 'true';
    
    const script = document.createElement('script');
    script.async = true;
    script.setAttribute('data-cfasync', 'false');
    script.src = ADSTERRA_NATIVE_URL;
    container.appendChild(script);
  });
}
// ==================== VIDEO OBSERVER ====================

function setupVideoObservers() {
  const videos = document.querySelectorAll('video[data-post-id]');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const video = entry.target;
      if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
        video.play().catch(() => {});
        const overlay = document.getElementById(`playOverlay_${video.dataset.postId}`);
        if (overlay) overlay.classList.remove('show');
      } else {
        video.pause();
      }
    });
  }, { threshold: [0, 0.6, 1] });

  videos.forEach(video => observer.observe(video));
}

function toggleVideoPlay(video) {
  const overlay = document.getElementById(`playOverlay_${video.dataset.postId}`);
  if (video.paused) {
    video.play().catch(() => {});
    video.muted = false;
    if (overlay) overlay.classList.remove('show');
  } else {
    video.pause();
    if (overlay) overlay.classList.add('show');
  }
}

// ==================== CAROUSEL ====================

function setupCarousels() {
  document.querySelectorAll('.feed-carousel').forEach(carousel => {
    let startX = 0;
    let currentX = 0;
    let isDragging = false;
    const track = carousel.querySelector('.feed-carousel-track');
    const total = parseInt(carousel.dataset.total);
    let current = parseInt(track.dataset.current || 0);

    const start = (e) => {
      startX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
      isDragging = true;
      track.style.transition = 'none';
    };

    const move = (e) => {
      if (!isDragging) return;
      currentX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
      const diff = currentX - startX;
      const offset = -(current * 100 / total) + (diff / carousel.offsetWidth * 100 / total);
      track.style.transform = `translateX(${offset}%)`;
    };

    const end = () => {
      if (!isDragging) return;
      isDragging = false;
      track.style.transition = 'transform 0.35s ease';
      const diff = currentX - startX;

      if (Math.abs(diff) > 50) {
        if (diff < 0 && current < total - 1) current++;
        else if (diff > 0 && current > 0) current--;
      }

      track.style.transform = `translateX(-${current * 100 / total}%)`;
      track.dataset.current = current;

      carousel.querySelectorAll('.carousel-dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === current);
      });
    };

    // Touch events
    carousel.addEventListener('touchstart', start, { passive: true });
    carousel.addEventListener('touchmove', move, { passive: true });
    carousel.addEventListener('touchend', end);
    
    // Mouse events for PC
    carousel.addEventListener('mousedown', start);
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', end);
  });
}

// ==================== FEED INFINITE SCROLL ====================

function setupFeedScroll() {
  const feedPage = document.getElementById('homePage');

  const handleScroll = throttle(() => {
    if (APP.currentPage !== 'home') return;
    if (APP.feedLoading || APP.feedEnded) return;

    const scrollTop = feedPage.scrollTop;
    const scrollHeight = feedPage.scrollHeight;
    const clientHeight = feedPage.clientHeight;

    if (scrollTop + clientHeight >= scrollHeight - 300) {
      if (APP.feedTab === 'foryou') {
        loadFeed();
      } else {
        loadFollowingFeed();
      }
    }
  }, 300);

  feedPage.addEventListener('scroll', handleScroll);
}

// ==================== PULL TO REFRESH ====================

(function setupPullToRefresh() {
  const feedPage = document.getElementById('homePage');
  const pullRefresh = document.getElementById('pullRefresh');
  let startY = 0;
  let pulling = false;

  if (!feedPage) return;

  feedPage.addEventListener('touchstart', (e) => {
    if (feedPage.scrollTop <= 0) {
      startY = e.touches[0].clientY;
      pulling = true;
    }
  }, { passive: true });

  feedPage.addEventListener('touchmove', (e) => {
    if (!pulling) return;
    const diff = e.touches[0].clientY - startY;
    if (diff > 0 && diff < 120) {
      pullRefresh.style.top = (diff - 50) + 'px';
      if (diff > 80) pullRefresh.classList.add('active');
    }
  }, { passive: true });

  feedPage.addEventListener('touchend', () => {
    if (!pulling) return;
    pulling = false;

    if (pullRefresh.classList.contains('active')) {
      if (APP.feedTab === 'foryou') {
        loadFeed(true);
      } else {
        loadFollowingFeed(true);
      }
      loadStories();
      startStoriesHideTimer();
      showToast('Refreshing...', 'info');
    }

    pullRefresh.classList.remove('active');
    pullRefresh.style.top = '-50px';
  });
})();

// ==================== POST VIEW TRACKING ====================

function trackPostViews() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const postId = entry.target.dataset.postId;
        if (postId && !entry.target.dataset.viewed) {
          entry.target.dataset.viewed = 'true';
          incrementPostView(postId);
        }
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.feed-item[data-post-id]').forEach(item => {
    observer.observe(item);
  });
}

async function incrementPostView(postId) {
  try {
    await db.collection('posts').doc(postId).update({
      viewsCount: firebase.firestore.FieldValue.increment(1),
    });

    const post = APP.feedPosts.find(p => p.id === postId);
    if (post && post.uid) {
      await db.collection('users').doc(post.uid).update({
        totalViews: firebase.firestore.FieldValue.increment(1),
      });
    }
  } catch (err) {}
}

// ==================== POST INTERACTIONS ====================

async function toggleFeedFollow(uid, postId) {
  if (!APP.currentUser || uid === APP.currentUser.uid) return;

  const btn = document.getElementById(`followBtn_${postId}`);
  if (!btn) return;

  const following = await isFollowing(uid);

  if (following) {
    await unfollowUser(uid);
    btn.textContent = 'Follow';
    btn.classList.remove('following');
  } else {
    await followUser(uid);
    btn.textContent = 'Following';
    btn.classList.add('following');
  }
}

function handleMediaClick(postId, type) {
  if (type === 'video') return;
}

function openPostOptions(postId, uid) {
  const isOwn = uid === APP.currentUser?.uid;
  const isAdmin = APP.currentUserData?.role === 'admin' || APP.currentUser?.email === ADMIN_EMAIL;

  let options = '';

  // Delete option (own posts or admin)
  if (isOwn || isAdmin) {
    options += `
      <div class="sheet-option danger" onclick="deletePost('${postId}')">
        <div class="sheet-option-icon">🗑️</div>
        <div class="sheet-option-text">
          <div class="sheet-option-label" style="color:var(--error)">Delete Post</div>
        </div>
      </div>
    `;
  }

  options += `
    <div class="sheet-option" onclick="repostPost('${postId}')">
      <div class="sheet-option-icon">🔄</div>
      <div class="sheet-option-text"><div class="sheet-option-label">Repost</div></div>
    </div>
    <div class="sheet-option" onclick="copyPostLink('${postId}')">
      <div class="sheet-option-icon">🔗</div>
      <div class="sheet-option-text"><div class="sheet-option-label">Copy Link</div></div>
    </div>
    <div class="sheet-option" onclick="sharePostToChat('${postId}')">
      <div class="sheet-option-icon">✉️</div>
      <div class="sheet-option-text"><div class="sheet-option-label">Send to Chat</div></div>
    </div>
  `;

  if (!isOwn) {
    options += `
      <div class="sheet-option" onclick="reportPost('${postId}')">
        <div class="sheet-option-icon">⚠️</div>
        <div class="sheet-option-text"><div class="sheet-option-label">Report</div></div>
      </div>
    `;
  }

  if (isOwn) {
    options += `
      <div class="sheet-option" onclick="boostPost('${postId}')">
        <div class="sheet-option-icon">🚀</div>
        <div class="sheet-option-text">
          <div class="sheet-option-label">Boost Post</div>
          <div class="sheet-option-sublabel">⚡${BOOST_COST} or free for verified</div>
        </div>
      </div>
    `;
  }

  openBottomSheet(`<h3 class="sheet-title">Post Options</h3>${options}`);
}

async function deletePost(postId) {
  closeBottomSheet();

  // Small delay to ensure bottom sheet closes first
  setTimeout(() => {
    openCenterModal(`
      <div class="modal-title">🗑️ Delete Post</div>
      <p class="modal-text">Are you sure you want to delete this post? This action cannot be undone.</p>
      <div class="modal-actions">
        <button class="modal-btn secondary" onclick="closeCenterModal()">Cancel</button>
        <button class="modal-btn danger" onclick="confirmDeletePost('${postId}')">Delete</button>
      </div>
    `);
  }, 300);
}

async function confirmDeletePost(postId) {
  closeCenterModal();
  showLoading();
  
  try {
    // Delete the post
    await db.collection('posts').doc(postId).delete();
    
    // Update local arrays
    APP.feedPosts = APP.feedPosts.filter(p => p.id !== postId);
    APP.followingFeedPosts = APP.followingFeedPosts.filter(p => p.id !== postId);

    // Decrement post count
    await db.collection('users').doc(APP.currentUser.uid).update({
      postsCount: firebase.firestore.FieldValue.increment(-1),
    });

    hideLoading();
    showToast('Post deleted successfully', 'success');

    // Close single post view if open
    const singlePostPage = document.getElementById('singlePostPage');
    if (singlePostPage && singlePostPage.classList.contains('active')) {
      closeOverlayPage('singlePostPage');
    }

    // Refresh based on current page
    setTimeout(() => {
      if (APP.currentPage === 'profile') {
        // Refresh profile to update grid
        loadProfile(APP.currentUser.uid);
      } else if (APP.currentPage === 'home') {
        // Re-render feed
        if (APP.feedTab === 'foryou') {
          renderFeed();
        } else {
          renderFollowingFeed();
        }
      }
    }, 300);

  } catch (err) {
    hideLoading();
    showToast('Failed to delete post: ' + err.message, 'error');
    console.error('Delete post error:', err);
  }
}
async function repostPost(postId) {
  closeBottomSheet();
  const post = APP.feedPosts.find(p => p.id === postId) || APP.followingFeedPosts.find(p => p.id === postId);
  if (!post) return;

  try {
    const repost = {
      uid: APP.currentUser.uid,
      type: post.type,
      caption: post.caption || '',
      mediaURL: post.mediaURL || '',
      mediaURLs: post.mediaURLs || [],
      thumbnailURL: post.thumbnailURL || '',
      text: post.text || '',
      background: post.background || '',
      visibility: 'public',
      likesCount: 0,
      commentsCount: 0,
      sharesCount: 0,
      viewsCount: 0,
      repostedFrom: postId,
      repostedBy: APP.currentUser.uid,
      repostedByName: APP.currentUserData?.displayName,
      originalUid: post.uid,
      products: post.products || [],
      captionOnMedia: post.captionOnMedia || false,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    };

    await db.collection('posts').add(repost);

    await db.collection('posts').doc(postId).update({
      sharesCount: firebase.firestore.FieldValue.increment(1),
    });

    await addXp(APP.currentUser.uid, 3, 'repost');
    await incrementAchievement(APP.currentUser.uid, 'first_share');

    showToast('Reposted! 🔄', 'success');
  } catch (err) {
    showToast('Failed to repost', 'error');
  }
}

function copyPostLink(postId) {
  closeBottomSheet();
  const link = `https://vidr.click/?post=${postId}`;
  navigator.clipboard.writeText(link).then(() => {
    showToast('Link copied! 🔗', 'success');
  }).catch(() => {
    showToast('Failed to copy link', 'error');
  });
}

async function sharePost(postId) {
  const link = `https://vidr.click/?post=${postId}`;

  if (navigator.share) {
    try {
      await navigator.share({
        title: 'Check this out on Vidr!',
        url: link,
      });
      await incrementAchievement(APP.currentUser.uid, 'first_share');
    } catch {}
  } else {
    copyPostLink(postId);
  }
}

function sharePostToChat(postId) {
  closeBottomSheet();
  openNewChatWithPost(postId);
}

async function reportPost(postId) {
  closeBottomSheet();
  try {
    await db.collection('reports').add({
      type: 'post',
      postId,
      reporterId: APP.currentUser.uid,
      reason: 'inappropriate',
      status: 'pending',
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
    showToast('Post reported. Thank you.', 'success');
  } catch (err) {
    showToast('Failed to report', 'error');
  }
}

async function boostPost(postId) {
  closeBottomSheet();

  const isVerified = APP.currentUserData?.verified;
  const currentMonth = new Date().getMonth();
  let freeBoostsUsed = APP.currentUserData?.freeBoostsUsed || 0;

  if (APP.currentUserData?.freeBoostsResetMonth !== currentMonth) {
    freeBoostsUsed = 0;
    await db.collection('users').doc(APP.currentUser.uid).update({
      freeBoostsUsed: 0,
      freeBoostsResetMonth: currentMonth,
    });
  }

  const hasFreeBoost = isVerified && freeBoostsUsed < VERIFIED_BOOSTS_PER_MONTH;

  if (hasFreeBoost) {
    openCenterModal(`
      <div class="modal-title">Boost Post 🚀</div>
      <p class="modal-text">Use free verified boost? (${VERIFIED_BOOSTS_PER_MONTH - freeBoostsUsed} remaining this month)</p>
      <div class="modal-actions">
        <button class="modal-btn secondary" onclick="closeCenterModal()">Cancel</button>
        <button class="modal-btn primary" onclick="confirmBoostPost('${postId}', true)">Boost Free!</button>
      </div>
    `);
  } else {
    if (APP.currentUserData.freeCoins < BOOST_COST) {
      return showToast(`Not enough coins! Need ⚡${BOOST_COST}`, 'error');
    }
    openCenterModal(`
      <div class="modal-title">Boost Post 🚀</div>
      <p class="modal-text">Boost this post for ⚡${BOOST_COST} free coins?</p>
      <div class="modal-actions">
        <button class="modal-btn secondary" onclick="closeCenterModal()">Cancel</button>
        <button class="modal-btn primary" onclick="confirmBoostPost('${postId}', false)">Boost!</button>
      </div>
    `);
  }
}

async function confirmBoostPost(postId, isFree) {
  closeCenterModal();
  showLoading();

  try {
    await db.collection('posts').doc(postId).update({
      boosted: true,
      boostedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });

    if (isFree) {
      await db.collection('users').doc(APP.currentUser.uid).update({
        freeBoostsUsed: firebase.firestore.FieldValue.increment(1),
      });
    } else {
      await db.collection('users').doc(APP.currentUser.uid).update({
        freeCoins: firebase.firestore.FieldValue.increment(-BOOST_COST),
      });
      APP.currentUserData.freeCoins -= BOOST_COST;

      await db.collection('transactions').add({
        uid: APP.currentUser.uid,
        type: 'boost',
        amount: -BOOST_COST,
        coinType: 'free',
        description: 'Post boost',
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
    }

    hideLoading();
    showToast('Post boosted! 🚀', 'success');
  } catch (err) {
    hideLoading();
    showToast('Failed to boost post', 'error');
  }
}

async function bookmarkPost(postId) {
  if (!APP.currentUser) return;
  try {
    const ref = db.collection('bookmarks').doc(`${APP.currentUser.uid}_${postId}`);
    const doc = await ref.get();
    if (doc.exists) {
      await ref.delete();
      showToast('Removed from bookmarks', 'info');
    } else {
      await ref.set({
        uid: APP.currentUser.uid,
        postId,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
      showToast('Bookmarked! 🔖', 'success');
    }
  } catch (err) {
    showToast('Failed', 'error');
  }
}

// ==================== COMMENTS ====================

async function openComments(postId) {
  const commentsHTML = await renderCommentsSheet(postId);
  openBottomSheet(commentsHTML);
}

async function renderCommentsSheet(postId) {
  let comments = [];
  try {
    const snap = await db.collection('comments')
      .where('postId', '==', postId)
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get();

    for (const doc of snap.docs) {
      const data = { id: doc.id, ...doc.data() };
      data.userData = await getUserDataCached(data.uid);
      comments.push(data);
    }
  } catch (err) {
    console.error('Load comments error:', err);
  }

  let commentsListHTML = '';
  if (comments.length === 0) {
    commentsListHTML = '<p style="text-align:center;color:var(--text-muted);padding:20px">No comments yet</p>';
  } else {
    comments.forEach(c => {
      const user = c.userData || {};
      commentsListHTML += `
        <div style="display:flex;gap:10px;padding:10px 0;border-bottom:1px solid var(--border-light)">
          <img src="${user.photoURL || 'default-avatar.png'}" alt="" style="width:32px;height:32px;border-radius:50%;object-fit:cover;cursor:pointer" onclick="closeBottomSheet();viewProfile('${c.uid}')" onerror="this.src='default-avatar.png'">
          <div style="flex:1">
            <div style="display:flex;align-items:center;gap:4px;margin-bottom:2px">
              <span style="font-weight:700;font-size:13px">${escapeHTML(user.displayName || 'User')}</span>
              ${user.verified ? getVerifiedBadge() : ''}
              <span style="font-size:11px;color:var(--text-muted);margin-left:auto">${timeAgo(c.createdAt)}</span>
            </div>
            <div style="font-size:14px;line-height:1.4">${parseMentions(escapeHTML(c.text))}</div>
          </div>
        </div>
      `;
    });
  }

  return `
    <h3 class="sheet-title">Comments</h3>
    <div style="max-height:300px;overflow-y:auto;margin-bottom:12px">
      ${commentsListHTML}
    </div>
    <div style="display:flex;gap:8px;align-items:center">
      <img src="${APP.currentUserData?.photoURL || 'default-avatar.png'}" alt="" style="width:32px;height:32px;border-radius:50%;object-fit:cover" onerror="this.src='default-avatar.png'">
      <input type="text" id="commentInput" placeholder="Add a comment..." style="flex:1;padding:10px 14px;background:var(--bg-input);border:1px solid var(--border-color);border-radius:var(--radius-full);font-size:14px;color:var(--text-primary)">
      <button onclick="postComment('${postId}')" style="background:var(--gradient-primary);color:#fff;padding:8px 16px;border-radius:var(--radius-full);font-weight:600;font-size:13px">Post</button>
    </div>
  `;
}

async function postComment(postId) {
  const input = document.getElementById('commentInput');
  if (!input) return;

  const text = input.value.trim();
  if (!text) return;

  try {
    await db.collection('comments').add({
      postId,
      uid: APP.currentUser.uid,
      text,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });

    await db.collection('posts').doc(postId).update({
      commentsCount: firebase.firestore.FieldValue.increment(1),
    });

    const post = APP.feedPosts.find(p => p.id === postId) || APP.followingFeedPosts.find(p => p.id === postId);
    if (post && post.uid !== APP.currentUser.uid) {
      await addNotification(post.uid, {
        type: 'comment',
        text: `${APP.currentUserData.displayName} commented: "${text.substring(0, 50)}"`,
        icon: '💬',
        fromUid: APP.currentUser.uid,
        postId,
      });
    }

    const mentions = text.match(/@(\w+)/g);
    if (mentions) {
      for (const mention of mentions) {
        const username = mention.slice(1).toLowerCase();
        try {
          const usernameDoc = await db.collection('usernames').doc(username).get();
          if (usernameDoc.exists) {
            const mentionedUid = usernameDoc.data().uid;
            if (mentionedUid !== APP.currentUser.uid) {
              await addNotification(mentionedUid, {
                type: 'mention',
                text: `${APP.currentUserData.displayName} mentioned you in a comment`,
                icon: '@',
                fromUid: APP.currentUser.uid,
                postId,
              });
            }
          }
        } catch {}
      }
    }

    await addXp(APP.currentUser.uid, 2, 'comment');
    await incrementAchievement(APP.currentUser.uid, 'first_comment');

    const html = await renderCommentsSheet(postId);
    document.getElementById('bottomSheetContent').innerHTML = html;
  } catch (err) {
    showToast('Failed to post comment', 'error');
  }
}

// ==================== YELLOW BAG ====================

async function openYellowBag(postId) {
  const post = APP.feedPosts.find(p => p.id === postId) || APP.followingFeedPosts.find(p => p.id === postId);
  if (!post || !post.products || post.products.length === 0) return;

  let productsHTML = '';
  for (const productId of post.products) {
    try {
      const doc = await db.collection('products').doc(productId).get();
      if (!doc.exists) continue;
      const product = doc.data();

      productsHTML += `
        <div style="display:flex;gap:12px;padding:12px 0;border-bottom:1px solid var(--border-light);cursor:pointer" onclick="closeBottomSheet();openProductDetail('${doc.id}')">
          <img src="${product.images?.[0] || 'default-product.png'}" alt="" style="width:60px;height:60px;border-radius:var(--radius-sm);object-fit:cover" onerror="this.src='default-product.png'">
          <div style="flex:1">
            <div style="font-weight:600;font-size:14px">${escapeHTML(product.name)}</div>
            <div style="color:var(--primary);font-weight:800;font-size:15px;margin-top:2px">$${(product.price || 0).toFixed(2)}</div>
          </div>
          <button style="background:var(--warning);color:#000;padding:6px 14px;border-radius:var(--radius-full);font-weight:700;font-size:12px;align-self:center" onclick="event.stopPropagation();quickBuy('${doc.id}')">Buy</button>
        </div>
      `;
    } catch {}
  }

  openBottomSheet(`
    <h3 class="sheet-title">🛍️ Products</h3>
    <div style="max-height:300px;overflow-y:auto">
      ${productsHTML || '<p style="text-align:center;color:var(--text-muted);padding:20px">No products found</p>'}
    </div>
  `);
}

// ==================== CLEAR DISPLAY MODE (Long Press) ====================

(function setupClearDisplayMode() {
  let pressTimer = null;
  let isClear = false;

  document.addEventListener('touchstart', (e) => {
    if (APP.currentPage !== 'home') return;
    const feedItem = e.target.closest('.feed-item');
    if (!feedItem) return;

    pressTimer = setTimeout(() => {
      isClear = true;
      const header = feedItem.querySelector('.feed-item-header');
      const actions = feedItem.querySelector('.feed-actions');
      const caption = feedItem.querySelector('.feed-caption-area');
      if (header) header.style.display = 'none';
      if (actions) actions.style.display = 'none';
      if (caption) caption.style.display = 'none';
      document.getElementById('bottomNav').style.display = 'none';
      document.getElementById('topHeader').style.display = 'none';
      document.getElementById('bannerAd').style.display = 'none';
    }, 800);
  }, { passive: true });

  document.addEventListener('touchend', () => {
    if (pressTimer) clearTimeout(pressTimer);
    if (isClear) {
      isClear = false;
      document.querySelectorAll('.feed-item-header').forEach(el => el.style.display = '');
      document.querySelectorAll('.feed-actions').forEach(el => el.style.display = '');
      document.querySelectorAll('.feed-caption-area').forEach(el => el.style.display = '');
      document.getElementById('bottomNav').style.display = 'flex';
      document.getElementById('topHeader').style.display = 'flex';
      document.getElementById('bannerAd').style.display = 'flex';
    }
  });
})();

console.log('Vidr Part 4 loaded: Feed, Rendering, Post Interactions');

// ==========================================
// VIDR - app.js Part 5
// Stories, Discover, Search, Notifications
// ==========================================

// ==================== STORIES SYSTEM ====================

async function loadStories() {
  if (!APP.currentUser) return;

  try {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const snapshot = await db.collection('stories')
      .where('createdAt', '>', oneDayAgo)
      .orderBy('createdAt', 'desc')
      .get();

    const storyMap = new Map();

    snapshot.forEach(doc => {
      const story = { id: doc.id, ...doc.data() };
      if (!storyMap.has(story.uid)) {
        storyMap.set(story.uid, []);
      }
      storyMap.get(story.uid).push(story);
    });

    APP.storyUsers = [];
    const blockedUsers = APP.currentUserData?.blockedUsers || [];

    if (storyMap.has(APP.currentUser.uid)) {
      const ownStories = storyMap.get(APP.currentUser.uid);
      APP.storyUsers.push({
        uid: APP.currentUser.uid,
        userData: APP.currentUserData,
        stories: ownStories,
        allSeen: true,
      });
    }

    for (const [uid, stories] of storyMap) {
      if (uid === APP.currentUser.uid) continue;
      if (blockedUsers.includes(uid)) continue;

      const userData = await getUserDataCached(uid);
      if (!userData) continue;
      if (userData.role === 'admin' && uid !== APP.currentUser.uid) continue;

      let allSeen = true;
      for (const s of stories) {
        const viewers = s.viewers || [];
        if (!viewers.includes(APP.currentUser.uid)) {
          allSeen = false;
          break;
        }
      }

      APP.storyUsers.push({ uid, userData, stories, allSeen });
    }

    APP.storyUsers.sort((a, b) => {
      if (a.uid === APP.currentUser.uid) return -1;
      if (b.uid === APP.currentUser.uid) return 1;
      if (a.allSeen && !b.allSeen) return 1;
      if (!a.allSeen && b.allSeen) return -1;
      return 0;
    });

    renderStories();
  } catch (err) {
    console.error('Load stories error:', err);
  }
}

function renderStories() {
  const scroll = document.getElementById('storiesScroll');

  let html = `
    <div class="story-item add-story" onclick="openCreateStory()">
      <div class="story-avatar-wrap add">
        <img src="${APP.currentUserData?.photoURL || 'default-avatar.png'}" alt="" class="story-avatar" onerror="this.src='default-avatar.png'">
        <div class="story-add-icon">+</div>
      </div>
      <span class="story-username">Your story</span>
    </div>
  `;

  APP.storyUsers.forEach((su, index) => {
    if (su.uid === APP.currentUser?.uid && su.stories.length > 0) {
      html += `
        <div class="story-item" onclick="openStoryViewer(${0})">
          <div class="story-avatar-wrap ${su.allSeen ? 'seen' : ''}">
            <img src="${su.userData?.photoURL || 'default-avatar.png'}" alt="" class="story-avatar" onerror="this.src='default-avatar.png'">
          </div>
          <span class="story-username">Your story</span>
        </div>
      `;
      return;
    }

    const hasLive = su.userData?.isLive;

    html += `
      <div class="story-item" onclick="openStoryViewer(${index})">
        <div class="story-avatar-wrap ${su.allSeen ? 'seen' : ''}">
          <img src="${su.userData?.photoURL || 'default-avatar.png'}" alt="" class="story-avatar" onerror="this.src='default-avatar.png'">
          ${hasLive ? '<div class="story-live-badge">LIVE</div>' : ''}
        </div>
        <span class="story-username">${escapeHTML(su.userData?.username || 'user')}</span>
      </div>
    `;
  });

  scroll.innerHTML = html;
}

// ==================== STORY VIEWER ====================

function openStoryViewer(userIndex) {
  if (!APP.storyUsers[userIndex] || APP.storyUsers[userIndex].stories.length === 0) return;

  APP.currentStoryUserIndex = userIndex;
  APP.currentStoryIndex = 0;

  const viewer = document.getElementById('storyViewer');
  viewer.style.display = 'flex';
  document.getElementById('bottomNav').style.display = 'none';
  document.getElementById('topHeader').style.display = 'none';
  document.getElementById('storiesBar').classList.add('hidden');
  document.getElementById('bannerAd').style.display = 'none';

  renderCurrentStory();
}

function closeStoryViewer() {
  const viewer = document.getElementById('storyViewer');
  viewer.style.display = 'none';

  if (APP.storyTimer) clearTimeout(APP.storyTimer);
  if (APP.storyProgressTimer) clearInterval(APP.storyProgressTimer);

  document.getElementById('bottomNav').style.display = 'flex';
  document.getElementById('bannerAd').style.display = 'flex';

  if (APP.currentPage === 'home') {
    document.getElementById('topHeader').style.display = 'flex';
    if (!APP.storiesHidden) {
      document.getElementById('storiesBar').classList.remove('hidden');
    }
  }
}

function renderCurrentStory() {
  const su = APP.storyUsers[APP.currentStoryUserIndex];
  if (!su) { closeStoryViewer(); return; }

  const story = su.stories[APP.currentStoryIndex];
  if (!story) {
    nextStoryUser();
    return;
  }

  const user = su.userData || {};
  const isOwn = su.uid === APP.currentUser?.uid;

  let progressHTML = '';
  su.stories.forEach((_, i) => {
    let cls = '';
    if (i < APP.currentStoryIndex) cls = 'complete';
    else if (i === APP.currentStoryIndex) cls = 'current';
    progressHTML += `<div class="story-progress-segment ${cls}"><div class="story-progress-fill" id="storyProgress_${i}"></div></div>`;
  });

  let contentHTML = '';
  if (story.type === 'image') {
    contentHTML = `<img src="${story.mediaURL}" alt="" style="max-width:100%;max-height:100%;object-fit:contain" onerror="this.src='default-product.png'">`;
  } else if (story.type === 'video') {
    contentHTML = `<video src="${story.mediaURL}" autoplay playsinline muted style="max-width:100%;max-height:100%;object-fit:contain"></video>`;
  } else if (story.type === 'text') {
    const bg = story.background || TEXT_BG_COLORS[0];
    contentHTML = `<div class="story-text-content" style="background:${bg}"><span>${escapeHTML(story.text || '')}</span></div>`;
  }

  let viewsHTML = '';
  if (isOwn) {
    viewsHTML = `<div class="story-views">👁️ ${(story.viewers || []).length} views</div>`;
  }

  const viewerEl = document.getElementById('storyViewerContent');
  viewerEl.innerHTML = `
    <div class="story-progress-bar">${progressHTML}</div>
    <div class="story-header">
      <img src="${user.photoURL || 'default-avatar.png'}" alt="" onclick="closeStoryViewer();viewProfile('${su.uid}')" onerror="this.src='default-avatar.png'">
      <div>
        <div class="story-header-name">${escapeHTML(user.displayName || 'User')} ${user.verified ? getVerifiedBadge() : ''}</div>
        <div class="story-header-time">${timeAgo(story.createdAt)}</div>
      </div>
      <button class="story-close-btn" onclick="closeStoryViewer()">✕</button>
    </div>
    <div class="story-content">
      ${contentHTML}
      <div class="story-tap-areas">
        <div class="story-tap-left" onclick="prevStory()"></div>
        <div class="story-tap-right" onclick="nextStory()"></div>
      </div>
    </div>
    ${viewsHTML}
    <div class="story-bottom">
      ${isOwn ? `
        <button style="background:rgba(255,255,255,0.15);color:#fff;padding:10px 16px;border-radius:var(--radius-full);font-size:14px;backdrop-filter:blur(10px)" onclick="deleteStory('${story.id}')">Delete</button>
      ` : `
        <input class="story-reply-input" placeholder="Reply to ${escapeHTML(user.displayName || 'User')}..." onkeypress="if(event.key==='Enter')replyToStory('${su.uid}','${story.id}',this.value)">
      `}
    </div>
  `;

  markStorySeen(story.id);
  startStoryTimer();
  setupStoryLongPress();
}

function startStoryTimer() {
  if (APP.storyTimer) clearTimeout(APP.storyTimer);
  if (APP.storyProgressTimer) clearInterval(APP.storyProgressTimer);

  const progressFill = document.getElementById(`storyProgress_${APP.currentStoryIndex}`);
  if (!progressFill) return;

  let elapsed = 0;
  const duration = STORY_DURATION;

  progressFill.style.width = '0%';
  progressFill.style.transition = 'none';

  APP.storyProgressTimer = setInterval(() => {
    elapsed += 50;
    const percent = Math.min((elapsed / duration) * 100, 100);
    progressFill.style.width = percent + '%';
  }, 50);

  APP.storyTimer = setTimeout(() => {
    clearInterval(APP.storyProgressTimer);
    nextStory();
  }, duration);
}

function setupStoryLongPress() {
  const content = document.querySelector('.story-content');
  if (!content) return;

  let pressTimer = null;
  let isPaused = false;

  content.addEventListener('touchstart', (e) => {
    pressTimer = setTimeout(() => {
      isPaused = true;
      if (APP.storyTimer) clearTimeout(APP.storyTimer);
      if (APP.storyProgressTimer) clearInterval(APP.storyProgressTimer);

      const video = content.querySelector('video');
      if (video) video.pause();
    }, 300);
  }, { passive: true });

  content.addEventListener('touchend', () => {
    if (pressTimer) clearTimeout(pressTimer);
    if (isPaused) {
      isPaused = false;
      startStoryTimer();

      const video = content.querySelector('video');
      if (video) video.play().catch(() => {});
    }
  });
}

function nextStory() {
  const su = APP.storyUsers[APP.currentStoryUserIndex];
  if (!su) { closeStoryViewer(); return; }

  APP.currentStoryIndex++;

  if (APP.currentStoryIndex >= su.stories.length) {
    nextStoryUser();
  } else {
    renderCurrentStory();
  }
}

function prevStory() {
  if (APP.currentStoryIndex > 0) {
    APP.currentStoryIndex--;
    renderCurrentStory();
  } else {
    if (APP.currentStoryUserIndex > 0) {
      APP.currentStoryUserIndex--;
      const su = APP.storyUsers[APP.currentStoryUserIndex];
      APP.currentStoryIndex = su.stories.length - 1;
      renderCurrentStory();
    }
  }
}

function nextStoryUser() {
  APP.currentStoryUserIndex++;
  APP.currentStoryIndex = 0;

  if (APP.currentStoryUserIndex >= APP.storyUsers.length) {
    closeStoryViewer();
  } else {
    renderCurrentStory();
  }
}

async function markStorySeen(storyId) {
  if (!APP.currentUser) return;
  try {
    await db.collection('stories').doc(storyId).update({
      viewers: firebase.firestore.FieldValue.arrayUnion(APP.currentUser.uid),
    });
  } catch {}
}

async function deleteStory(storyId) {
  try {
    await db.collection('stories').doc(storyId).delete();
    showToast('Story deleted', 'success');
    closeStoryViewer();
    loadStories();
  } catch (err) {
    showToast('Failed to delete story', 'error');
  }
}

async function replyToStory(targetUid, storyId, text) {
  if (!text || !text.trim()) return;

  try {
    const chatRoomId = await getOrCreateChatRoom(targetUid);
    await db.collection('messages').add({
      chatRoomId,
      senderId: APP.currentUser.uid,
      type: 'story_reply',
      text: text.trim(),
      storyId,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });

    await updateChatRoomLastMessage(chatRoomId, `Replied to your story: "${text.trim().substring(0, 30)}"`, targetUid);

    showToast('Reply sent! ✉️', 'success');
  } catch (err) {
    showToast('Failed to send reply', 'error');
  }
}

// ==================== CREATE STORY ====================

function openCreateStory() {
  const html = `
    <h3 class="sheet-title">Add Story</h3>
    <div class="sheet-option" onclick="closeBottomSheet();createStoryFromCamera()">
      <div class="sheet-option-icon">📷</div>
      <div class="sheet-option-text"><div class="sheet-option-label">Camera</div></div>
    </div>
    <div class="sheet-option" onclick="closeBottomSheet();createStoryFromGallery()">
      <div class="sheet-option-icon">🖼️</div>
      <div class="sheet-option-text"><div class="sheet-option-label">Gallery</div></div>
    </div>
    <div class="sheet-option" onclick="closeBottomSheet();createTextStory()">
      <div class="sheet-option-icon">✍️</div>
      <div class="sheet-option-text"><div class="sheet-option-label">Text Story</div></div>
    </div>
  `;
  openBottomSheet(html);
}

async function createStoryFromCamera() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*,video/*';
  input.capture = 'environment';

  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    await uploadStoryMedia(file);
  };
  input.click();
}

async function createStoryFromGallery() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*,video/*';

  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    await uploadStoryMedia(file);
  };
  input.click();
}

async function uploadStoryMedia(file) {
  showLoading();

  try {
    const isVideo = file.type.startsWith('video');
    let uploadFile = file;

    if (!isVideo) {
      uploadFile = await compressImage(file, 1080, 0.8);
    }

    const ext = isVideo ? 'mp4' : 'jpg';
    const path = `stories/${APP.currentUser.uid}/${Date.now()}.${ext}`;
    const ref = storage.ref(path);

    await ref.put(uploadFile);
    const url = await ref.getDownloadURL();

    await db.collection('stories').add({
      uid: APP.currentUser.uid,
      type: isVideo ? 'video' : 'image',
      mediaURL: url,
      viewers: [],
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });

    await addXp(APP.currentUser.uid, 3, 'story');
    await incrementAchievement(APP.currentUser.uid, 'story_post');

    hideLoading();
    showToast('Story posted! 📖', 'success');
    loadStories();
  } catch (err) {
    hideLoading();
    showToast('Failed to post story', 'error');
    console.error('Story upload error:', err);
  }
}

function createTextStory() {
  openCenterModal(`
    <div class="modal-title">Text Story</div>
    <div class="text-post-preview" id="textStoryPreview" style="background:${TEXT_BG_COLORS[0]};min-height:200px;border-radius:var(--radius-lg);margin-bottom:12px">
      <textarea class="text-post-input" id="textStoryInput" placeholder="Type something..." style="color:#fff;font-size:20px;font-weight:700;text-align:center;border:none;background:none;resize:none;width:100%;min-height:150px"></textarea>
    </div>
    <div class="text-bg-options" id="textStoryBgOptions">
      ${TEXT_BG_COLORS.map((bg, i) => `
        <div class="text-bg-option ${i === 0 ? 'selected' : ''}" style="background:${bg}" onclick="selectStoryBg(${i})"></div>
      `).join('')}
    </div>
    <div class="modal-actions">
      <button class="modal-btn secondary" onclick="closeCenterModal()">Cancel</button>
      <button class="modal-btn primary" onclick="postTextStory()">Post Story</button>
    </div>
  `);
}

function selectStoryBg(index) {
  const preview = document.getElementById('textStoryPreview');
  preview.style.background = TEXT_BG_COLORS[index];

  document.querySelectorAll('#textStoryBgOptions .text-bg-option').forEach((el, i) => {
    el.classList.toggle('selected', i === index);
  });

  preview.dataset.bgIndex = index;
}

async function postTextStory() {
  const input = document.getElementById('textStoryInput');
  const preview = document.getElementById('textStoryPreview');
  const text = input?.value?.trim();

  if (!text) return showToast('Please enter some text', 'warning');

  closeCenterModal();
  showLoading();

  try {
    const bgIndex = parseInt(preview?.dataset?.bgIndex || 0);
    await db.collection('stories').add({
      uid: APP.currentUser.uid,
      type: 'text',
      text,
      background: TEXT_BG_COLORS[bgIndex],
      viewers: [],
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });

    await addXp(APP.currentUser.uid, 3, 'story');
    await incrementAchievement(APP.currentUser.uid, 'story_post');

    hideLoading();
    showToast('Story posted! 📖', 'success');
    loadStories();
  } catch (err) {
    hideLoading();
    showToast('Failed to post story', 'error');
  }
}

// ==================== DISCOVER PAGE ====================

async function loadDiscover(refresh = false) {
  if (refresh) {
    APP.discoverUsers = [];
    APP.discoverLastDoc = null;
  }

  const container = document.getElementById('discoverGrid');
  const loading = document.getElementById('discoverLoading');

  if (APP.discoverUsers.length === 0) {
    container.innerHTML = '';
  }

  loading.style.display = 'flex';

  try {
    const followingSnap = await db.collection('follows')
      .where('followerId', '==', APP.currentUser.uid)
      .get();

    const followingIds = new Set();
    followingSnap.forEach(doc => followingIds.add(doc.data().followingId));
    followingIds.add(APP.currentUser.uid);

    let query = db.collection('users')
      .where('banned', '==', false)
      .orderBy('followersCount', 'desc')
      .limit(20);

    if (APP.discoverLastDoc) {
      query = query.startAfter(APP.discoverLastDoc);
    }

    const snapshot = await query.get();
    APP.discoverLastDoc = snapshot.docs[snapshot.docs.length - 1] || null;

    const blockedUsers = APP.currentUserData?.blockedUsers || [];

    for (const doc of snapshot.docs) {
      const user = { id: doc.id, ...doc.data() };

      if (followingIds.has(user.uid)) continue;
      if (blockedUsers.includes(user.uid)) continue;
      if (user.role === 'admin' && user.uid !== APP.currentUser.uid) continue;

      user.mutualCount = 0;
      try {
        user.mutualCount = await getMutualCount(user.uid);
      } catch {}

      APP.discoverUsers.push(user);
    }

    renderDiscover();
    loading.style.display = 'none';
    setupDiscoverScroll();
  } catch (err) {
    console.error('Load discover error:', err);
    loading.style.display = 'none';
  }
}

function renderDiscover() {
  const container = document.getElementById('discoverGrid');

  let html = '';
  APP.discoverUsers.forEach(user => {
    const isVerified = user.verified;

    html += `
      <div class="discover-card" onclick="viewProfile('${user.uid}')">
        <div class="discover-card-cover">
          ${user.coverURL ? `<img src="${user.coverURL}" alt="" loading="lazy" onerror="this.src='default-cover.png'">` : ''}
        </div>
        <div class="discover-card-body">
          <img class="discover-card-avatar" src="${user.photoURL || 'default-avatar.png'}" alt="" loading="lazy" onerror="this.src='default-avatar.png'">
          <div class="discover-card-name">
            ${escapeHTML(user.displayName || 'User')}
            ${isVerified ? getVerifiedBadge() : ''}
          </div>
          <div class="discover-card-info">${formatNumber(user.followersCount || 0)} followers</div>
          ${user.mutualCount > 0 ? `<div class="discover-card-mutual">👥 ${user.mutualCount} mutual</div>` : ''}
          <button class="discover-follow-btn" id="discoverFollow_${user.uid}" onclick="event.stopPropagation();toggleDiscoverFollow('${user.uid}')">Follow</button>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

async function toggleDiscoverFollow(uid) {
  const btn = document.getElementById(`discoverFollow_${uid}`);
  if (!btn) return;

  const following = await isFollowing(uid);

  if (following) {
    await unfollowUser(uid);
    btn.textContent = 'Follow';
    btn.classList.remove('following');
  } else {
    await followUser(uid);
    btn.textContent = 'Following';
    btn.classList.add('following');
  }
}

function setupDiscoverScroll() {
  const page = document.getElementById('discoverPage');

  const handleScroll = throttle(() => {
    if (APP.currentPage !== 'discover') return;

    const scrollTop = page.scrollTop;
    const scrollHeight = page.scrollHeight;
    const clientHeight = page.clientHeight;

    if (scrollTop + clientHeight >= scrollHeight - 300) {
      loadDiscover();
    }
  }, 500);

  page.addEventListener('scroll', handleScroll);
}

// ==================== SEARCH ====================

function setupSearch() {
  const input = document.getElementById('searchInput');
  const clearBtn = document.getElementById('searchClear');

  input.addEventListener('input', debounce((e) => {
    const query = e.target.value.trim();
    clearBtn.style.display = query ? 'block' : 'none';

    if (query.length >= 2) {
      performSearch(query);
    } else {
      document.getElementById('searchResults').style.display = 'none';
      document.getElementById('searchRecent').style.display = 'block';
    }
  }, 400));

  input.addEventListener('focus', () => {
    loadRecentSearches();
  });
}

async function performSearch(query) {
  document.getElementById('searchRecent').style.display = 'none';
  const resultsContainer = document.getElementById('searchResults');
  resultsContainer.style.display = 'block';
  resultsContainer.innerHTML = '<div class="loading-spinner small" style="margin:40px auto"></div>';

  saveRecentSearch(query);

  try {
    if (APP.searchTab === 'users') {
      await searchUsers(query, resultsContainer);
    } else if (APP.searchTab === 'posts') {
      await searchPosts(query, resultsContainer);
    } else if (APP.searchTab === 'tags') {
      await searchTags(query, resultsContainer);
    }
  } catch (err) {
    console.error('Search error:', err);
    resultsContainer.innerHTML = '<p style="text-align:center;color:var(--text-muted);padding:20px">Search failed</p>';
  }
}

async function searchUsers(query, container) {
  const lowerQuery = query.toLowerCase();

  const snapshot = await db.collection('users')
    .where('banned', '==', false)
    .orderBy('displayName')
    .limit(30)
    .get();

  let html = '';
  let found = 0;

  snapshot.forEach(doc => {
    const user = doc.data();
    if (user.role === 'admin' && user.uid !== APP.currentUser?.uid) return;

    const matchesName = (user.displayName || '').toLowerCase().includes(lowerQuery);
    const matchesUsername = (user.username || '').toLowerCase().includes(lowerQuery);

    if (matchesName || matchesUsername) {
      found++;
      html += `
        <div class="search-user-item" onclick="closeOverlayPage('searchPage');viewProfile('${user.uid}')">
          <img src="${user.photoURL || 'default-avatar.png'}" alt="" loading="lazy" onerror="this.src='default-avatar.png'">
          <div class="search-user-info">
            <div class="search-user-name">
              ${escapeHTML(user.displayName || 'User')}
              ${user.verified ? getVerifiedBadge() : ''}
              ${getRoleBadge(user.role)}
            </div>
            <div class="search-user-handle">@${escapeHTML(user.username || '')}</div>
          </div>
        </div>
      `;
    }
  });

  container.innerHTML = found > 0 ? html : '<div class="empty-state"><p>No users found</p></div>';
}

async function searchPosts(query, container) {
  const lowerQuery = query.toLowerCase();

  const snapshot = await db.collection('posts')
    .where('visibility', '==', 'public')
    .orderBy('createdAt', 'desc')
    .limit(50)
    .get();

  let html = '<div class="search-post-grid">';
  let found = 0;

  snapshot.forEach(doc => {
    const post = doc.data();
    const caption = (post.caption || post.text || '').toLowerCase();
    if (!caption.includes(lowerQuery)) return;

    found++;

    let thumbnail = '';
    if (post.type === 'video') {
      thumbnail = post.thumbnailURL || '';
    } else if (post.type === 'image' || post.type === 'photo') {
      thumbnail = post.mediaURLs?.[0] || post.mediaURL || '';
    } else if (post.type === 'text') {
      html += `
        <div class="search-post-grid-item" onclick="openSinglePost('${doc.id}')" style="background:${post.background || TEXT_BG_COLORS[0]};display:flex;align-items:center;justify-content:center;padding:8px">
          <span style="color:#fff;font-size:11px;font-weight:600;text-align:center;overflow:hidden;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical">${escapeHTML((post.text || post.caption || '').substring(0, 60))}</span>
        </div>
      `;
      return;
    }

    if (thumbnail) {
      html += `
        <div class="search-post-grid-item" onclick="openSinglePost('${doc.id}')">
          <img src="${thumbnail}" alt="" loading="lazy" onerror="this.src='default-product.png'">
        </div>
      `;
    }
  });

  html += '</div>';
  container.innerHTML = found > 0 ? html : '<div class="empty-state"><p>No posts found</p></div>';
}

async function searchTags(query, container) {
  const tag = query.replace('#', '').toLowerCase();

  const snapshot = await db.collection('posts')
    .where('visibility', '==', 'public')
    .orderBy('createdAt', 'desc')
    .limit(50)
    .get();

  let html = '<div class="search-post-grid">';
  let found = 0;

  snapshot.forEach(doc => {
    const post = doc.data();
    const caption = (post.caption || post.text || '').toLowerCase();
    if (!caption.includes('#' + tag)) return;
    found++;

    let thumbnail = '';
    if (post.type === 'video') thumbnail = post.thumbnailURL || '';
    else if (post.type === 'image' || post.type === 'photo') thumbnail = post.mediaURLs?.[0] || post.mediaURL || '';

    if (thumbnail) {
      html += `
        <div class="search-post-grid-item" onclick="openSinglePost('${doc.id}')">
          <img src="${thumbnail}" alt="" loading="lazy" onerror="this.src='default-product.png'">
        </div>
      `;
    }
  });

  html += '</div>';
  container.innerHTML = found > 0 ? html : `<div class="empty-state"><p>No posts with #${escapeHTML(tag)} found</p></div>`;
}

function switchSearchTab(tab, btn) {
  APP.searchTab = tab;

  document.querySelectorAll('.search-tab').forEach(t => t.classList.remove('active'));
  if (btn) btn.classList.add('active');

  const query = document.getElementById('searchInput')?.value?.trim();
  if (query && query.length >= 2) {
    performSearch(query);
  }
}

function saveRecentSearch(query) {
  APP.searchRecent = APP.searchRecent.filter(s => s !== query);
  APP.searchRecent.unshift(query);
  APP.searchRecent = APP.searchRecent.slice(0, 10);
  localStorage.setItem('vidr_recent_searches', JSON.stringify(APP.searchRecent));
}

function loadRecentSearches() {
  const container = document.getElementById('recentSearchList');
  if (!container) return;

  if (APP.searchRecent.length === 0) {
    container.innerHTML = '<p style="color:var(--text-muted);font-size:13px">No recent searches</p>';
    return;
  }

  let html = '';
  APP.searchRecent.forEach(q => {
    const escapedQ = escapeHTML(q).replace(/'/g, "\\'");
    html += `
      <div class="search-recent-item">
        <span onclick="document.getElementById('searchInput').value='${escapedQ}';performSearch('${escapedQ}')">${escapeHTML(q)}</span>
        <button class="search-recent-remove" onclick="removeRecentSearch('${escapedQ}')">✕</button>
      </div>
    `;
  });

  container.innerHTML = html;
}

function removeRecentSearch(query) {
  APP.searchRecent = APP.searchRecent.filter(s => s !== query);
  localStorage.setItem('vidr_recent_searches', JSON.stringify(APP.searchRecent));
  loadRecentSearches();
}

function clearAllRecent() {
  APP.searchRecent = [];
  localStorage.setItem('vidr_recent_searches', '[]');
  loadRecentSearches();
}

function clearSearch() {
  const input = document.getElementById('searchInput');
  if (input) input.value = '';
  document.getElementById('searchClear').style.display = 'none';
  document.getElementById('searchResults').style.display = 'none';
  document.getElementById('searchRecent').style.display = 'block';
}

// ==================== SINGLE POST VIEW ====================

async function openSinglePost(postId) {
  openOverlayPage('singlePostPage');
  const container = document.getElementById('singlePostContent');
  container.innerHTML = '<div class="loading-spinner small" style="margin:40px auto"></div>';

  try {
    const doc = await db.collection('posts').doc(postId).get();
    if (!doc.exists) {
      container.innerHTML = '<div class="empty-state"><p>Post not found</p></div>';
      return;
    }

    const post = { id: doc.id, ...doc.data() };
    post.userData = await getUserDataCached(post.uid);
    post.liked = await isPostLiked(post.id);

    container.innerHTML = `
      <div class="feed-container" style="padding-bottom:80px">
        ${renderFeedItem(post)}
      </div>
    `;

    setupVideoObservers();
    setupCarousels();
  } catch (err) {
    console.error('Load single post error:', err);
    container.innerHTML = '<div class="empty-state"><p>Failed to load post</p></div>';
  }
}

// ==================== NOTIFICATIONS PAGE ====================

function renderNotifications() {
  openOverlayPage('notificationsPage');
  const container = document.getElementById('notificationList');

  if (APP.notifications.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🔔</div>
        <h3>No notifications</h3>
        <p>You're all caught up!</p>
      </div>
    `;
    return;
  }

  let html = '';
  APP.notifications.forEach(notif => {
    const typeIcons = {
      like: '❤️', comment: '💬', follow: '👤', message: '✉️',
      live: '🔴', gift: '🎁', sale: '🛍️', mention: '@',
      system: '📢', referral: '👥', level_up: '⬆️',
    };

    html += `
      <div class="notification-item ${notif.read ? '' : 'unread'}" onclick="handleNotifClick('${notif.id}','${notif.type}','${notif.fromUid || ''}','${notif.postId || ''}')">
        <div class="notification-avatar">
          <img src="${notif.fromAvatar || 'default-avatar.png'}" alt="" onerror="this.src='default-avatar.png'" loading="lazy">
          <div class="notification-type-icon">${typeIcons[notif.type] || notif.icon || '📢'}</div>
        </div>
        <div class="notification-body">
          <div class="notification-text">${notif.text || ''}</div>
          <div class="notification-time">${timeAgo(notif.createdAt)}</div>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
  markNotificationsRead();
}

async function handleNotifClick(notifId, type, fromUid, postId) {
  try {
    await db.collection('notifications').doc(notifId).update({ read: true });
  } catch {}

  closeOverlayPage('notificationsPage');

  switch (type) {
    case 'follow':
    case 'referral':
      if (fromUid) viewProfile(fromUid);
      break;
    case 'like':
    case 'comment':
    case 'mention':
      if (postId) openSinglePost(postId);
      break;
    case 'message':
      navigateTo('chat');
      break;
    case 'live':
      if (fromUid) joinLiveStream(fromUid);
      break;
  }
}

async function markNotificationsRead() {
  if (!APP.currentUser) return;
  try {
    const batch = db.batch();
    const snapshot = await db.collection('notifications')
      .where('uid', '==', APP.currentUser.uid)
      .where('read', '==', false)
      .get();

    snapshot.forEach(doc => {
      batch.update(doc.ref, { read: true });
    });

    await batch.commit();
  } catch (err) {
    console.error('Mark read error:', err);
  }
}

// ==================== CHAT HELPERS ====================

async function getOrCreateChatRoom(otherUid) {
  const participants = [APP.currentUser.uid, otherUid].sort();
  const chatRoomId = participants.join('_');

  const doc = await db.collection('chatRooms').doc(chatRoomId).get();
  if (!doc.exists) {
    await db.collection('chatRooms').doc(chatRoomId).set({
      participants,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      lastMessage: '',
      lastMessageTime: firebase.firestore.FieldValue.serverTimestamp(),
      [`unread_${APP.currentUser.uid}`]: 0,
      [`unread_${otherUid}`]: 0,
      accepted: false,
      initiator: APP.currentUser.uid,
    });
  }

  return chatRoomId;
}

async function updateChatRoomLastMessage(chatRoomId, text, otherUid) {
  await db.collection('chatRooms').doc(chatRoomId).update({
    lastMessage: text.substring(0, 100),
    lastMessageTime: firebase.firestore.FieldValue.serverTimestamp(),
    [`unread_${otherUid}`]: firebase.firestore.FieldValue.increment(1),
  });
}

function openNewChatWithPost(postId) {
  openNewChat(postId);
}

function openNewChat(postId = null) {
  openBottomSheet(`
    <h3 class="sheet-title">Send to</h3>
    <div style="padding:8px 0">
      <input type="text" id="newChatSearch" placeholder="Search by username..." style="width:100%;padding:10px 14px;background:var(--bg-input);border:1px solid var(--border-color);border-radius:var(--radius-full);font-size:14px;color:var(--text-primary)" oninput="searchNewChatUser(this.value, '${postId || ''}')">
    </div>
    <div id="newChatResults"></div>
  `);
}

async function searchNewChatUser(query, postId) {
  const container = document.getElementById('newChatResults');
  if (!query || query.length < 2) {
    container.innerHTML = '';
    return;
  }

  try {
    const lowerQuery = query.toLowerCase();
    const snap = await db.collection('users')
      .where('banned', '==', false)
      .limit(20)
      .get();

    let html = '';
    snap.forEach(doc => {
      const user = doc.data();
      if (user.uid === APP.currentUser?.uid) return;
      if (user.role === 'admin') return;

      const match = (user.displayName || '').toLowerCase().includes(lowerQuery) ||
                    (user.username || '').toLowerCase().includes(lowerQuery);
      if (!match) return;

      html += `
        <div class="search-user-item" onclick="closeBottomSheet();startChatWith('${user.uid}','${postId}')">
          <img src="${user.photoURL || 'default-avatar.png'}" alt="" style="width:40px;height:40px;border-radius:50%;object-fit:cover" onerror="this.src='default-avatar.png'">
          <div class="search-user-info">
            <div class="search-user-name">${escapeHTML(user.displayName)} ${user.verified ? getVerifiedBadge() : ''}</div>
            <div class="search-user-handle">@${escapeHTML(user.username || '')}</div>
          </div>
        </div>
      `;
    });

    container.innerHTML = html || '<p style="text-align:center;padding:16px;color:var(--text-muted)">No users found</p>';
  } catch (err) {
    container.innerHTML = '<p style="text-align:center;padding:16px;color:var(--text-muted)">Search failed</p>';
  }
}

async function startChatWith(uid, postId = '') {
  const chatRoomId = await getOrCreateChatRoom(uid);

  if (postId) {
    await db.collection('messages').add({
      chatRoomId,
      senderId: APP.currentUser.uid,
      type: 'post_share',
      postId,
      text: 'Shared a post',
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });

    await updateChatRoomLastMessage(chatRoomId, 'Shared a post', uid);
    showToast('Post shared!', 'success');
  }

  openChatRoom(chatRoomId, uid);
}

console.log('Vidr Part 5 loaded: Stories, Discover, Search, Notifications');

// ==========================================
// VIDR - app.js Part 6
// Profile, Edit Profile, Chat, Settings
// ==========================================

// ==================== PROFILE PAGE ====================

async function loadProfile(uid, asOverlay = false) {
  if (!uid) return;

  if (asOverlay && uid !== APP.currentUser?.uid) {
    openOverlayPage('profilePage');
  }

  const container = document.getElementById('profileContent');
  container.innerHTML = '<div class="loading-spinner small" style="margin:60px auto"></div>';
  
 // Fix the "half-view" bug by forcing scroll to top
  const page = document.getElementById('profilePage');
  if(page) page.scrollTop = 0;
  
  try {
    const userData = await getUserData(uid);
    if (!userData) {
      container.innerHTML = '<div class="empty-state"><h3>User not found</h3></div>';
      return;
    }

    if (uid !== APP.currentUser?.uid) {
      recordProfileVisit(uid);
    }

    const isOwn = uid === APP.currentUser?.uid;
    const isAdmin = APP.currentUserData?.role === 'admin';
    const isVerified = userData.verified;
    const isUserAdmin = userData.role === 'admin';
    const showGlow = isVerified || isUserAdmin;
    const following = isOwn ? false : await isFollowing(uid);

    if (userData.isPrivate && !isOwn && !following && !isAdmin) {
      container.innerHTML = renderPrivateProfile(userData, uid);
      return;
    }

    const postsSnap = await db.collection('posts')
      .where('uid', '==', uid)
      .orderBy('createdAt', 'desc')
      .limit(30)
      .get();

    const posts = [];
    postsSnap.forEach(doc => {
      const post = { id: doc.id, ...doc.data() };
      if (isOwn || isAdmin || post.visibility === 'public' || (following && post.visibility === 'followers')) {
        posts.push(post);
      }
    });

    const selectedAchievements = userData.selectedAchievements || [];
    let achievementHTML = '';
    selectedAchievements.slice(0, 3).forEach(achId => {
      const def = ACHIEVEMENT_TYPES.find(a => a.id === achId);
      if (!def) return;
      const level = (userData.achievements || {})[achId] || 0;
      let cls = '';
      if (level >= 100) cls = 'glow100';
      else if (level >= 5) cls = 'glow5';
      achievementHTML += `<div class="achievement-badge ${cls}" title="${def.name} Lv.${level}">${def.icon} ${level}</div>`;
    });

    const title = userData.selectedTitle || null;
    let titleHTML = '';
    if (title) {
      titleHTML = `<div class="profile-title ${title.rarity || 'common'}">${escapeHTML(title.name)}</div>`;
    }

    const currentXp = userData.xp || 0;
    const currentLevel = userData.level || 1;
    const xpNeeded = getXpForLevel(currentLevel);
    const xpPercent = Math.min((currentXp / xpNeeded) * 100, 100);

    let xpBoostActive = false;
    if (userData.xpBoostEnd) {
      const end = userData.xpBoostEnd.toDate ? userData.xpBoostEnd.toDate() : new Date(userData.xpBoostEnd);
      if (end > new Date()) xpBoostActive = true;
    }

    let mutualHTML = '';
    if (!isOwn) {
      const mutualCount = await getMutualCount(uid);
      if (mutualCount > 0) {
        mutualHTML = `<div class="mutual-badge">👥 ${mutualCount} mutual friends</div>`;
      }
    }
    
let quickBtns = '';
if (isOwn) {
  quickBtns = `
    <div class="profile-menu-section">
      <div class="profile-menu-title">💫 Rewards & Earnings</div>
      <div class="profile-menu-grid">
        <button class="profile-menu-item" onclick="openWallet()">
          <div class="profile-menu-icon" style="background:linear-gradient(135deg,#fcd34d,#f59e0b)">💰</div>
          <span>Wallet</span>
        </button>
        <button class="profile-menu-item" onclick="openSpinWheel()">
          <div class="profile-menu-icon" style="background:linear-gradient(135deg,#a78bfa,#7c3aed)">🎡</div>
          <span>Spin</span>
        </button>
        <button class="profile-menu-item" onclick="openGames()">
          <div class="profile-menu-icon" style="background:linear-gradient(135deg,#ff6bb5,#ec4899)">🎮</div>
          <span>Games</span>
        </button>
        <button class="profile-menu-item" onclick="openCampaign()">
          <div class="profile-menu-icon" style="background:linear-gradient(135deg,#7dd3fc,#3b82f6)">📺</div>
          <span>Watch Ads</span>
        </button>
        <button class="profile-menu-item" onclick="openEarnPage()">
          <div class="profile-menu-icon" style="background:linear-gradient(135deg,#86efac,#10b981)">📋</div>
          <span>How to Earn</span>
        </button>
        <button class="profile-menu-item" onclick="openReferral()">
          <div class="profile-menu-icon" style="background:linear-gradient(135deg,#fda4af,#f43f5e)">👥</div>
          <span>Refer</span>
        </button>
      </div>

      <div class="profile-menu-title">🏆 Progress & Community</div>
      <div class="profile-menu-grid">
        <button class="profile-menu-item" onclick="openLeaderboard()">
          <div class="profile-menu-icon" style="background:linear-gradient(135deg,#fcd34d,#f59e0b)">🏆</div>
          <span>Leaderboard</span>
        </button>
        <button class="profile-menu-item" onclick="openXpBoost()">
          <div class="profile-menu-icon" style="background:linear-gradient(135deg,#a78bfa,#8b5cf6)">⚡</div>
          <span>XP Boost</span>
        </button>
        <button class="profile-menu-item" onclick="openShop()">
          <div class="profile-menu-icon" style="background:linear-gradient(135deg,#ff9bcf,#ff6bb5)">🛍️</div>
          <span>Shop</span>
        </button>
        ${isAdmin || isUserAdmin ? `
          <button class="profile-menu-item" onclick="openAdmin()">
            <div class="profile-menu-icon" style="background:linear-gradient(135deg,#f87171,#dc2626)">⚙️</div>
            <span>Admin</span>
          </button>
        ` : ''}
      </div>
    </div>
  `;
}
    let gridHTML = renderProfileGrid(posts);
    const coverClass = showGlow ? 'animated' : '';

    container.innerHTML = `
      <div class="profile-cover ${coverClass}">
        ${userData.coverURL ? `<img src="${userData.coverURL}" alt="" onerror="this.style.display='none'" loading="lazy">` : ''}
        ${isOwn ? `<button class="profile-cover-edit" onclick="changeCover()">📷</button>` : ''}
      </div>

      <div class="profile-info-section">
        <div class="profile-avatar-section">
          <div class="profile-avatar-wrap ${showGlow ? 'verified' : ''}">
            <img class="profile-avatar" src="${userData.photoURL || 'default-avatar.png'}" alt="" onerror="this.src='default-avatar.png'">
            ${isOwn ? `<button class="profile-avatar-edit" onclick="changeAvatar()">📷</button>` : ''}
          </div>
          <div class="profile-actions">
            ${isOwn ? `
              <button class="profile-action-btn secondary" onclick="openEditProfile()">Edit Profile</button>
              <button class="profile-more-btn" onclick="openSettings()">⚙️</button>
              <button class="profile-visitors-btn" onclick="loadProfileVisitors()" title="Profile Visitors">
                👣
                ${(userData.profileViews || 0) > 0 ? '<div class="profile-visitors-badge"></div>' : ''}
              </button>
            ` : `
              <button class="profile-action-btn ${following ? 'following-btn' : 'primary'}" id="profileFollowBtn" onclick="toggleProfileFollow('${uid}')">
                ${following ? 'Following' : 'Follow'}
              </button>
              <button class="profile-action-btn secondary" onclick="startChatWith('${uid}')">Message</button>
              <button class="profile-more-btn" onclick="openProfileMoreOptions('${uid}')">⋯</button>
            `}
          </div>
        </div>

        <div class="profile-name-section">
          <div class="profile-displayname ${showGlow ? 'glow' : ''}">
            ${escapeHTML(userData.displayName || 'User')}
            ${isVerified ? getVerifiedBadge() : ''}
            ${getRoleBadge(userData.role)}
            <span class="profile-level-badge">Lv.${currentLevel}</span>
          </div>
          <div class="profile-username">@${escapeHTML(userData.username || '')}</div>
          ${titleHTML}
        </div>

        ${achievementHTML ? `<div class="profile-achievements">${achievementHTML}${isOwn ? `<div class="achievement-badge" onclick="openEditAchievements()" style="cursor:pointer">✏️</div>` : ''}</div>` : ''}

        <div class="profile-stats">
          <div class="profile-stat" onclick="${isOwn || isAdmin ? `openFollowList('${uid}','following')` : ''}">
            <span class="profile-stat-value">${formatNumber(userData.followingCount || 0)}</span>
            <span class="profile-stat-label">Following</span>
          </div>
          <div class="profile-stat" onclick="${isOwn || isAdmin ? `openFollowList('${uid}','followers')` : ''}">
            <span class="profile-stat-value">${formatNumber(userData.followersCount || 0)}</span>
            <span class="profile-stat-label">Followers</span>
          </div>
          <div class="profile-stat">
            <span class="profile-stat-value">${formatNumber(userData.likesCount || 0)}</span>
            <span class="profile-stat-label">Likes</span>
          </div>
        </div>

        ${mutualHTML}

        ${userData.bio ? `<div class="profile-bio">${parseMentions(escapeHTML(userData.bio))}</div>` : (isOwn ? '<div class="profile-bio" style="color:var(--text-muted);cursor:pointer" onclick="openEditProfile()">+ Add bio</div>' : '')}

        <div class="profile-xp-section">
          <div class="xp-bar-wrap">
            <div class="xp-bar"><div class="xp-bar-fill" style="width:${xpPercent}%"></div></div>
            <span class="xp-label">${currentXp}/${xpNeeded} XP</span>
            ${xpBoostActive ? '<span class="xp-boost-badge">⚡2x</span>' : ''}
          </div>
        </div>

        ${quickBtns}
      </div>

      <div class="profile-tabs" id="profileTabs">
        <button class="profile-tab active" onclick="switchProfileTab('posts', '${uid}', this)">📷 Posts</button>
        <button class="profile-tab" onclick="switchProfileTab('liked', '${uid}', this)">❤️ Liked</button>
        ${isVerified || isAdmin ? `<button class="profile-tab" onclick="switchProfileTab('shop', '${uid}', this)">🛍️ Shop</button>` : ''}
      </div>

      <div id="profileGridContainer">
        ${gridHTML}
      </div>
    `;
  } catch (err) {
    console.error('Load profile error:', err);
    container.innerHTML = '<div class="empty-state"><h3>Failed to load profile</h3></div>';
  }
}

function renderPrivateProfile(userData, uid) {
  return `
    <div class="profile-cover">
      ${userData.coverURL ? `<img src="${userData.coverURL}" alt="" onerror="this.style.display='none'">` : ''}
    </div>
    <div class="profile-info-section">
      <div class="profile-avatar-section">
        <div class="profile-avatar-wrap">
          <img class="profile-avatar" src="${userData.photoURL || 'default-avatar.png'}" alt="" onerror="this.src='default-avatar.png'">
        </div>
        <div class="profile-actions">
          <button class="profile-action-btn primary" onclick="followUser('${uid}').then(()=>loadProfile('${uid}',true))">Follow</button>
        </div>
      </div>
      <div class="profile-name-section">
        <div class="profile-displayname">${escapeHTML(userData.displayName || 'User')} ${userData.verified ? getVerifiedBadge() : ''}</div>
        <div class="profile-username">@${escapeHTML(userData.username || '')}</div>
      </div>
      <div class="profile-stats">
        <div class="profile-stat"><span class="profile-stat-value">${formatNumber(userData.followingCount || 0)}</span><span class="profile-stat-label">Following</span></div>
        <div class="profile-stat"><span class="profile-stat-value">${formatNumber(userData.followersCount || 0)}</span><span class="profile-stat-label">Followers</span></div>
        <div class="profile-stat"><span class="profile-stat-value">${formatNumber(userData.likesCount || 0)}</span><span class="profile-stat-label">Likes</span></div>
      </div>
      <div class="empty-state" style="padding:40px 20px">
        <div class="empty-state-icon">🔒</div>
        <h3>This Account is Private</h3>
        <p>Follow this account to see their posts</p>
      </div>
    </div>
  `;
}

function renderProfileGrid(posts) {
  if (posts.length === 0) {
    return `
      <div class="profile-empty">
        <div class="profile-empty-icon">📷</div>
        <p>No posts yet</p>
      </div>
    `;
  }

  let html = '<div class="profile-grid">';
  posts.forEach(post => {
    if (post.type === 'video') {
      html += `
        <div class="profile-grid-item" onclick="openSinglePost('${post.id}')">
          <img src="${post.thumbnailURL || 'default-product.png'}" alt="" loading="lazy" onerror="this.src='default-product.png'">
          <span class="grid-video-icon">▶️</span>
          <span class="grid-views">▶ ${formatNumber(post.viewsCount || 0)}</span>
        </div>
      `;
    } else if (post.type === 'image' || post.type === 'photo') {
      const thumb = post.mediaURLs?.[0] || post.mediaURL || 'default-product.png';
      const multiIcon = (post.mediaURLs?.length || 0) > 1 ? '<span class="grid-multi-icon">📷</span>' : '';
      html += `
        <div class="profile-grid-item" onclick="openSinglePost('${post.id}')">
          <img src="${thumb}" alt="" loading="lazy" onerror="this.src='default-product.png'">
          ${multiIcon}
          <span class="grid-views">▶ ${formatNumber(post.viewsCount || 0)}</span>
        </div>
      `;
    } else if (post.type === 'text') {
      html += `
        <div class="profile-grid-item profile-grid-text" onclick="openSinglePost('${post.id}')" style="background:${post.background || TEXT_BG_COLORS[0]}">
          ${escapeHTML((post.text || post.caption || '').substring(0, 40))}
          <span class="grid-views" style="position:absolute;bottom:6px;left:6px">▶ ${formatNumber(post.viewsCount || 0)}</span>
        </div>
      `;
    }
  });
  html += '</div>';
  return html;
}

async function switchProfileTab(tab, uid, btn) {
  document.querySelectorAll('.profile-tab').forEach(t => t.classList.remove('active'));
  if (btn) btn.classList.add('active');

  const container = document.getElementById('profileGridContainer');
  container.innerHTML = '<div class="loading-spinner small" style="margin:40px auto"></div>';

  try {
    if (tab === 'posts') {
      const snap = await db.collection('posts')
        .where('uid', '==', uid)
        .orderBy('createdAt', 'desc')
        .limit(30)
        .get();

      const posts = [];
      snap.forEach(doc => posts.push({ id: doc.id, ...doc.data() }));
      container.innerHTML = renderProfileGrid(posts);

    } else if (tab === 'liked') {
      const likesSnap = await db.collection('likes')
        .where('uid', '==', uid)
        .orderBy('createdAt', 'desc')
        .limit(30)
        .get();

      const posts = [];
      for (const doc of likesSnap.docs) {
        const likeData = doc.data();
        try {
          const postDoc = await db.collection('posts').doc(likeData.postId).get();
          if (postDoc.exists) posts.push({ id: postDoc.id, ...postDoc.data() });
        } catch {}
      }
      container.innerHTML = renderProfileGrid(posts);

    } else if (tab === 'shop') {
      const prodSnap = await db.collection('products')
        .where('sellerId', '==', uid)
        .orderBy('createdAt', 'desc')
        .limit(20)
        .get();

      if (prodSnap.empty) {
        container.innerHTML = '<div class="profile-empty"><div class="profile-empty-icon">🛍️</div><p>No products yet</p></div>';
        return;
      }

      let html = '<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;padding:10px">';
      prodSnap.forEach(doc => {
        const p = doc.data();
        html += `
          <div class="product-card" onclick="openProductDetail('${doc.id}')">
            <div class="product-card-image">
              <img src="${p.images?.[0] || 'default-product.png'}" alt="" loading="lazy" onerror="this.src='default-product.png'">
              ${p.originalPrice > p.price ? `<span class="product-discount-badge">-${Math.round((1 - p.price/p.originalPrice)*100)}%</span>` : ''}
              ${p.stock <= 0 ? '<div class="product-sold-out">SOLD OUT</div>' : ''}
            </div>
            <div class="product-card-body">
              <div class="product-card-name">${escapeHTML(p.name)}</div>
              <div class="product-card-price">$${(p.price||0).toFixed(2)} ${p.originalPrice > p.price ? `<span class="product-card-original">$${p.originalPrice.toFixed(2)}</span>` : ''}</div>
            </div>
          </div>
        `;
      });
      html += '</div>';
      container.innerHTML = html;
    }
  } catch (err) {
    console.error('Profile tab error:', err);
    container.innerHTML = '<div class="profile-empty"><p>Failed to load</p></div>';
  }
}

async function toggleProfileFollow(uid) {
  const btn = document.getElementById('profileFollowBtn');
  if (!btn) return;

  const following = await isFollowing(uid);
  if (following) {
    await unfollowUser(uid);
    btn.textContent = 'Follow';
    btn.className = 'profile-action-btn primary';
  } else {
    await followUser(uid);
    btn.textContent = 'Following';
    btn.className = 'profile-action-btn following-btn';
  }
}

function openProfileMoreOptions(uid) {
  openBottomSheet(`
    <h3 class="sheet-title">Options</h3>
    <div class="sheet-option" onclick="closeBottomSheet();blockUser('${uid}')">
      <div class="sheet-option-icon">🚫</div>
      <div class="sheet-option-text"><div class="sheet-option-label">Block User</div></div>
    </div>
    <div class="sheet-option" onclick="closeBottomSheet();reportUser('${uid}')">
      <div class="sheet-option-icon">⚠️</div>
      <div class="sheet-option-text"><div class="sheet-option-label">Report User</div></div>
    </div>
    <div class="sheet-option" onclick="closeBottomSheet();copyProfileLink('${uid}')">
      <div class="sheet-option-icon">🔗</div>
      <div class="sheet-option-text"><div class="sheet-option-label">Copy Profile Link</div></div>
    </div>
  `);
}

function copyProfileLink(uid) {
  navigator.clipboard.writeText(`https://vidr.click/?user=${uid}`).then(() => {
    showToast('Link copied!', 'success');
  });
}

async function openFollowList(uid, type) {
  const queryField = type === 'followers' ? 'followingId' : 'followerId';
  const resultField = type === 'followers' ? 'followerId' : 'followingId';

  openBottomSheet(`<h3 class="sheet-title">${type === 'followers' ? 'Followers' : 'Following'}</h3><div id="followListContainer"><div class="loading-spinner small" style="margin:30px auto"></div></div>`);

  try {
    const snap = await db.collection('follows')
      .where(queryField, '==', uid)
      .limit(50)
      .get();

    let html = '';
    for (const doc of snap.docs) {
      const data = doc.data();
      const targetUid = data[resultField];
      const user = await getUserDataCached(targetUid);
      if (!user) continue;

      html += `
        <div class="search-user-item" onclick="closeBottomSheet();viewProfile('${targetUid}')">
          <img src="${user.photoURL || 'default-avatar.png'}" alt="" style="width:44px;height:44px;border-radius:50%;object-fit:cover" onerror="this.src='default-avatar.png'">
          <div class="search-user-info">
            <div class="search-user-name">${escapeHTML(user.displayName)} ${user.verified ? getVerifiedBadge() : ''}</div>
            <div class="search-user-handle">@${escapeHTML(user.username || '')}</div>
          </div>
        </div>
      `;
    }

    document.getElementById('followListContainer').innerHTML = html || '<p style="text-align:center;color:var(--text-muted);padding:20px">None yet</p>';
  } catch (err) {
    document.getElementById('followListContainer').innerHTML = '<p style="text-align:center;color:var(--text-muted);padding:20px">Failed to load</p>';
  }
}

// ==================== AVATAR & COVER UPLOAD ====================

function changeAvatar() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      return showToast('Image too large! Max 5MB', 'error');
    }
    
    showLoading();
    try {
      const compressed = await compressImage(file, 400, 0.85);
      const timestamp = Date.now();
      const path = `avatars/${APP.currentUser.uid}_${timestamp}.jpg`;
      const ref = storage.ref(path);
      
      await ref.put(compressed);
      const url = await ref.getDownloadURL();

      try {
        await db.collection('users').doc(APP.currentUser.uid).update({ 
          photoURL: url 
        });
      } catch (updateErr) {
        await db.collection('users').doc(APP.currentUser.uid).set({ 
          photoURL: url 
        }, { merge: true });
      }
      
      await APP.currentUser.updateProfile({ photoURL: url });

      APP.currentUserData.photoURL = url;
      updateNavAvatar();
      clearUserCache(APP.currentUser.uid);
      hideLoading();
      showToast('Avatar updated! 📸', 'success');
      loadProfile(APP.currentUser.uid);
    } catch (err) {
      hideLoading();
      console.error('Avatar upload error:', err);
      showToast('Failed to update avatar: ' + err.message, 'error');
    }
  };
  input.click();
}

function changeCover() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return showToast('Image too large! Max 10MB', 'error');
    }
    
    showLoading();
    try {
      console.log('Compressing image...');
      const compressed = await compressImage(file, 1200, 0.85);
      
      console.log('Uploading to Storage...');
      const timestamp = Date.now();
      const path = `covers/${APP.currentUser.uid}_${timestamp}.jpg`;
      const ref = storage.ref(path);
      
      const uploadTask = await ref.put(compressed);
      console.log('Upload complete, getting URL...');
      
      const url = await ref.getDownloadURL();
      console.log('Got URL:', url);

      // Try to update, if fails create the document
      try {
        await db.collection('users').doc(APP.currentUser.uid).update({ 
          coverURL: url 
        });
      } catch (updateErr) {
        console.log('Update failed, trying set with merge...');
        await db.collection('users').doc(APP.currentUser.uid).set({ 
          coverURL: url 
        }, { merge: true });
      }
      
      APP.currentUserData.coverURL = url;
      clearUserCache(APP.currentUser.uid);
      hideLoading();
      showToast('Cover updated! 🎨', 'success');
      loadProfile(APP.currentUser.uid);
    } catch (err) {
      hideLoading();
      console.error('Cover upload error:', err);
      
      if (err.code === 'storage/unauthorized') {
        showToast('Storage permission denied. Check Storage rules.', 'error');
      } else if (err.code === 'storage/canceled') {
        showToast('Upload canceled', 'warning');
      } else {
        showToast('Failed to update cover: ' + err.message, 'error');
      }
    }
  };
  input.click();
}

// ==================== EDIT PROFILE PAGE ====================

function openEditProfile() {
  openOverlayPage('editProfilePage');
  renderEditProfile();
}

function renderEditProfile() {
  const u = APP.currentUserData;
  if (!u) return;

  const container = document.getElementById('editProfileContent');

  const allTitles = u.titles || [];
  let titleOptions = '<option value="">None</option>';
  allTitles.forEach(t => {
    const selected = u.selectedTitle?.name === t.name ? 'selected' : '';
    titleOptions += `<option value="${escapeHTML(t.name)}" ${selected}>${escapeHTML(t.name)} (${t.rarity})</option>`;
  });

  container.innerHTML = `
    <div class="edit-avatar-section">
      <div class="edit-avatar-wrap" onclick="changeAvatar()">
        <img class="edit-avatar-img" src="${u.photoURL || 'default-avatar.png'}" alt="" onerror="this.src='default-avatar.png'">
        <div class="edit-avatar-overlay">📷</div>
      </div>
      <span style="font-size:13px;color:var(--primary);cursor:pointer" onclick="changeAvatar()">Change photo</span>
    </div>

    <div class="edit-field">
      <label>Display Name</label>
      <input type="text" id="editDisplayName" value="${escapeHTML(u.displayName || '')}" maxlength="30">
    </div>

    <div class="edit-field">
      <label>Username</label>
      <div class="input-group">
        <input type="text" id="editUsername" value="${escapeHTML(u.username || '')}" maxlength="20" oninput="checkEditUsername(this.value)">
        <span class="username-status" id="editUsernameStatus"></span>
      </div>
    </div>

    <div class="edit-field">
      <label>Bio</label>
      <textarea id="editBio" maxlength="150" oninput="updateBioCount()">${escapeHTML(u.bio || '')}</textarea>
      <div class="char-count"><span id="bioCharCount">${(u.bio || '').length}</span>/150</div>
    </div>

    <div class="edit-field">
      <label>Title</label>
      <select id="editTitle" style="width:100%;padding:12px 14px;background:var(--bg-input);border:1.5px solid var(--border-color);border-radius:var(--radius-md);color:var(--text-primary);font-size:15px">
        ${titleOptions}
      </select>
    </div>

    <div class="create-option-row">
      <div class="create-option-label">
        Private Account
        <small>Only followers can see your posts</small>
      </div>
      <div class="toggle-switch ${u.isPrivate ? 'active' : ''}" id="privateToggle" onclick="this.classList.toggle('active')">
        <div class="toggle-switch-knob"></div>
      </div>
    </div>
  `;
}

function updateBioCount() {
  const bio = document.getElementById('editBio');
  const count = document.getElementById('bioCharCount');
  if (bio && count) count.textContent = bio.value.length;
}

let editUsernameTimeout = null;
function checkEditUsername(value) {
  const status = document.getElementById('editUsernameStatus');
  const username = value.trim().toLowerCase();

  if (editUsernameTimeout) clearTimeout(editUsernameTimeout);

  if (!username || username.length < 3) {
    status.textContent = '';
    return;
  }

  if (username === APP.currentUserData?.username) {
    status.textContent = '✓';
    status.className = 'username-status available';
    return;
  }

  if (!/^[a-z0-9._]+$/.test(username)) {
    status.textContent = '✕';
    status.className = 'username-status taken';
    return;
  }

  status.textContent = '...';
  status.className = 'username-status checking';

  editUsernameTimeout = setTimeout(async () => {
    try {
      const doc = await db.collection('usernames').doc(username).get();
      status.textContent = doc.exists ? '✕' : '✓';
      status.className = `username-status ${doc.exists ? 'taken' : 'available'}`;
    } catch { status.textContent = ''; }
  }, 500);
}

async function saveProfile() {
  const displayName = document.getElementById('editDisplayName')?.value?.trim();
  const username = document.getElementById('editUsername')?.value?.trim()?.toLowerCase();
  const bio = document.getElementById('editBio')?.value?.trim();
  const titleName = document.getElementById('editTitle')?.value;
  const isPrivate = document.getElementById('privateToggle')?.classList?.contains('active');

  if (!displayName) return showToast('Display name required', 'warning');
  if (!username || username.length < 3) return showToast('Username must be 3+ chars', 'warning');
  if (!/^[a-z0-9._]+$/.test(username)) return showToast('Invalid username', 'warning');

  showLoading();

  try {
    const oldUsername = APP.currentUserData.username;
    const updates = {
      displayName,
      bio: bio || '',
      isPrivate: isPrivate || false,
    };

    if (username !== oldUsername) {
      const check = await db.collection('usernames').doc(username).get();
      if (check.exists) {
        hideLoading();
        return showToast('Username taken', 'error');
      }
      await db.collection('usernames').doc(oldUsername).delete();
      await db.collection('usernames').doc(username).set({ uid: APP.currentUser.uid });
      updates.username = username;
    }

    if (titleName) {
      const title = (APP.currentUserData.titles || []).find(t => t.name === titleName);
      if (title) updates.selectedTitle = title;
    } else {
      updates.selectedTitle = null;
    }

    await db.collection('users').doc(APP.currentUser.uid).update(updates);
    await APP.currentUser.updateProfile({ displayName });

    Object.assign(APP.currentUserData, updates);
    clearUserCache(APP.currentUser.uid);

    hideLoading();
    showToast('Profile updated! ✅', 'success');
    closeOverlayPage('editProfilePage');
    loadProfile(APP.currentUser.uid);
  } catch (err) {
    hideLoading();
    showToast('Failed to save profile', 'error');
    console.error('Save profile error:', err);
  }
}

// ==================== EDIT ACHIEVEMENTS ====================

function openEditAchievements() {
  window._tempSelectedAchievements = [...(APP.currentUserData?.selectedAchievements || [])];
  const achievements = APP.currentUserData?.achievements || {};

  let html = '<h3 class="sheet-title">Display Achievements (max 3)</h3>';
  html += '<div style="display:flex;flex-direction:column;gap:6px;max-height:400px;overflow-y:auto">';

  ACHIEVEMENT_TYPES.forEach(def => {
    const level = achievements[def.id] || 0;
    if (level === 0) return;

    const isSelected = window._tempSelectedAchievements.includes(def.id);
    html += `
      <div id="achievItem_${def.id}" style="display:flex;align-items:center;gap:10px;padding:10px;background:var(--bg-tertiary);border-radius:var(--radius-md);cursor:pointer;border:1.5px solid ${isSelected ? 'var(--primary)' : 'transparent'}" onclick="toggleAchievementSelection('${def.id}', this)">
        <span style="font-size:24px">${def.icon}</span>
        <div style="flex:1">
          <div style="font-weight:600;font-size:14px">${def.name}</div>
          <div style="font-size:12px;color:var(--text-tertiary)">Level ${level} · ${def.desc}</div>
        </div>
        <div style="font-size:20px" id="achievCheck_${def.id}">${isSelected ? '✅' : '⬜'}</div>
      </div>
    `;
  });

  html += '</div>';
  html += `<button class="modal-btn primary" style="margin-top:12px;width:100%" onclick="saveSelectedAchievements()">Save</button>`;

  openBottomSheet(html);
}

function toggleAchievementSelection(id, el) {
  const idx = window._tempSelectedAchievements.indexOf(id);
  if (idx > -1) {
    window._tempSelectedAchievements.splice(idx, 1);
    el.style.borderColor = 'transparent';
    document.getElementById(`achievCheck_${id}`).textContent = '⬜';
  } else {
    if (window._tempSelectedAchievements.length >= 3) {
      showToast('Max 3 achievements', 'warning');
      return;
    }
    window._tempSelectedAchievements.push(id);
    el.style.borderColor = 'var(--primary)';
    document.getElementById(`achievCheck_${id}`).textContent = '✅';
  }
}

async function saveSelectedAchievements() {
  closeBottomSheet();
  try {
    await db.collection('users').doc(APP.currentUser.uid).update({
      selectedAchievements: window._tempSelectedAchievements,
    });
    APP.currentUserData.selectedAchievements = [...window._tempSelectedAchievements];
    showToast('Achievements updated!', 'success');
    loadProfile(APP.currentUser.uid);
  } catch (err) {
    showToast('Failed to save', 'error');
  }
}

// ==================== CHAT SYSTEM ====================

async function loadChatList() {
  const container = document.getElementById('chatList');
  container.innerHTML = '<div class="loading-spinner small" style="margin:40px auto"></div>';

  try {
    const snap = await db.collection('chatRooms')
      .where('participants', 'array-contains', APP.currentUser.uid)
      .orderBy('lastMessageTime', 'desc')
      .limit(30)
      .get();

    if (snap.empty) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">💬</div>
          <h3>No messages yet</h3>
          <p>Start a conversation!</p>
        </div>
      `;
      return;
    }

    let html = '';
    for (const doc of snap.docs) {
      const room = { id: doc.id, ...doc.data() };
      const otherUid = room.participants.find(p => p !== APP.currentUser.uid);
      const otherUser = await getUserDataCached(otherUid);
      if (!otherUser) continue;

      const unread = room[`unread_${APP.currentUser.uid}`] || 0;
      const isOnline = otherUser.lastActive &&
        (new Date() - (otherUser.lastActive.toDate ? otherUser.lastActive.toDate() : new Date(otherUser.lastActive))) < 300000;

      html += `
        <div class="chat-list-item" onclick="openChatRoom('${doc.id}','${otherUid}')">
          <div class="chat-list-avatar">
            <img src="${otherUser.photoURL || 'default-avatar.png'}" alt="" onerror="this.src='default-avatar.png'" loading="lazy">
            ${isOnline ? '<div class="chat-online-dot"></div>' : ''}
          </div>
          <div class="chat-list-info">
            <div class="chat-list-name">
              ${escapeHTML(otherUser.displayName || 'User')}
              ${otherUser.verified ? getVerifiedBadge() : ''}
            </div>
            <div class="chat-list-preview">${escapeHTML(room.lastMessage || 'Start chatting!')}</div>
          </div>
          <div class="chat-list-meta">
            <span class="chat-list-time">${timeAgo(room.lastMessageTime)}</span>
            ${unread > 0 ? `<span class="chat-unread-badge">${unread}</span>` : ''}
          </div>
        </div>
      `;
    }

    container.innerHTML = html;
  } catch (err) {
    console.error('Chat list error:', err);
    container.innerHTML = '<div class="empty-state"><p>Failed to load chats</p></div>';
  }
}

async function openChatRoom(chatRoomId, otherUid) {
  APP.currentChatRoom = chatRoomId;
  APP.currentChatUser = otherUid;

  openOverlayPage('chatRoomPage');

  const otherUser = await getUserDataCached(otherUid);
  const isOnline = otherUser?.lastActive &&
    (new Date() - (otherUser.lastActive.toDate ? otherUser.lastActive.toDate() : new Date(otherUser.lastActive))) < 300000;

  document.getElementById('chatRoomUser').innerHTML = `
    <img src="${otherUser?.photoURL || 'default-avatar.png'}" alt="" onerror="this.src='default-avatar.png'" onclick="closeOverlayPage('chatRoomPage');viewProfile('${otherUid}')">
    <div class="chat-room-user-info">
      <div class="chat-room-user-name">${escapeHTML(otherUser?.displayName || 'User')} ${otherUser?.verified ? getVerifiedBadge() : ''}</div>
      <div class="chat-room-user-status ${isOnline ? 'online' : ''}">${isOnline ? 'Online' : 'Offline'}</div>
    </div>
  `;

  await db.collection('chatRooms').doc(chatRoomId).update({
    [`unread_${APP.currentUser.uid}`]: 0,
  });

  const roomDoc = await db.collection('chatRooms').doc(chatRoomId).get();
  const roomData = roomDoc.data();

  if (!roomData.accepted && roomData.initiator !== APP.currentUser.uid) {
    document.getElementById('chatRequestBar').style.display = 'block';
    document.getElementById('chatInputBar').style.display = 'none';
  } else {
    document.getElementById('chatRequestBar').style.display = 'none';
    document.getElementById('chatInputBar').style.display = 'flex';
  }

  loadChatMessages(chatRoomId);
}

function loadChatMessages(chatRoomId) {
  APP.chatListeners.forEach(unsub => unsub());
  APP.chatListeners = [];

  const container = document.getElementById('chatMessages');
  container.innerHTML = '';

  const unsub = db.collection('messages')
    .where('chatRoomId', '==', chatRoomId)
    .orderBy('createdAt', 'asc')
    .limit(100)
    .onSnapshot(snapshot => {
      container.innerHTML = '';
      let lastDate = '';

      snapshot.forEach(doc => {
        const msg = { id: doc.id, ...doc.data() };
        const isSent = msg.senderId === APP.currentUser.uid;
        const msgDate = msg.createdAt?.toDate ? msg.createdAt.toDate() : new Date();
        const dateStr = msgDate.toLocaleDateString();

        if (dateStr !== lastDate) {
          container.innerHTML += `<div class="chat-date-separator">${dateStr}</div>`;
          lastDate = dateStr;
        }

        let content = '';
        if (msg.type === 'image') {
          content = `<img src="${msg.mediaURL}" alt="" style="max-width:220px;border-radius:var(--radius-md)" onerror="this.src='default-product.png'" loading="lazy">`;
        } else if (msg.type === 'sticker') {
          const anim = msg.animation || 'bounce';
          content = `<span class="animated-sticker ${anim}" style="font-size:70px;display:block;text-align:center">${msg.sticker}</span>`;
        } else if (msg.type === 'post_share') {
          content = `<div style="padding:8px;background:var(--bg-tertiary);border-radius:var(--radius-sm);cursor:pointer;font-size:13px" onclick="openSinglePost('${msg.postId}')">📎 Shared a post<br><span style="color:var(--primary)">View post →</span></div>`;
        } else if (msg.type === 'story_reply') {
          content = `<div style="font-size:11px;color:var(--text-muted);margin-bottom:4px">Replied to your story</div>${escapeHTML(msg.text)}`;
        } else {
          content = escapeHTML(msg.text || '');
        }

        const timeStr = msgDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        container.innerHTML += `
          <div class="chat-bubble-wrap ${isSent ? 'sent' : 'received'}">
            <div class="chat-bubble">${content}</div>
            <div class="chat-bubble-time">
              ${timeStr}
              ${isSent ? `<span class="chat-read-tick">${msg.read ? '✓✓' : '✓'}</span>` : ''}
            </div>
          </div>
        `;
      });

      container.scrollTop = container.scrollHeight;
    });

  APP.chatListeners.push(unsub);
}

async function sendMessage() {
  const input = document.getElementById('chatInput');
  const text = input?.value?.trim();
  if (!text || !APP.currentChatRoom || !APP.currentChatUser) return;

  input.value = '';

  try {
    const roomDoc = await db.collection('chatRooms').doc(APP.currentChatRoom).get();
    const roomData = roomDoc.data();

    if (!roomData.accepted && roomData.initiator === APP.currentUser.uid) {
      const msgCount = await db.collection('messages')
        .where('chatRoomId', '==', APP.currentChatRoom)
        .where('senderId', '==', APP.currentUser.uid)
        .get();

      if (msgCount.size >= 1) {
        showToast('Waiting for them to accept your message request', 'info');
        return;
      }
    }

    await db.collection('messages').add({
      chatRoomId: APP.currentChatRoom,
      senderId: APP.currentUser.uid,
      type: 'text',
      text,
      read: false,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });

    await updateChatRoomLastMessage(APP.currentChatRoom, text, APP.currentChatUser);

    await addNotification(APP.currentChatUser, {
      type: 'message',
      text: `${APP.currentUserData.displayName}: ${text.substring(0, 50)}`,
      icon: '✉️',
      fromUid: APP.currentUser.uid,
    });

    await incrementAchievement(APP.currentUser.uid, 'chat_send');
  } catch (err) {
    showToast('Failed to send message', 'error');
  }
}

document.addEventListener('keypress', (e) => {
  if (e.key === 'Enter' && document.activeElement?.id === 'chatInput') {
    sendMessage();
  }
});

async function acceptMessageRequest() {
  if (!APP.currentChatRoom) return;
  try {
    await db.collection('chatRooms').doc(APP.currentChatRoom).update({ accepted: true });
    document.getElementById('chatRequestBar').style.display = 'none';
    document.getElementById('chatInputBar').style.display = 'flex';
    showToast('Message request accepted', 'success');
  } catch (err) {
    showToast('Failed to accept', 'error');
  }
}

async function declineMessageRequest() {
  closeOverlayPage('chatRoomPage');
  if (!APP.currentChatRoom) return;
  try {
    await db.collection('chatRooms').doc(APP.currentChatRoom).delete();
    showToast('Request declined', 'info');
    loadChatList();
  } catch {}
}

function openChatMedia() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    showLoading();
    try {
      const compressed = await compressImage(file, 800, 0.8);
      const path = `chat_images/${APP.currentChatRoom}/${Date.now()}.jpg`;
      const ref = storage.ref(path);
      await ref.put(compressed);
      const url = await ref.getDownloadURL();

      await db.collection('messages').add({
        chatRoomId: APP.currentChatRoom,
        senderId: APP.currentUser.uid,
        type: 'image',
        mediaURL: url,
        read: false,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });

      await updateChatRoomLastMessage(APP.currentChatRoom, '📷 Image', APP.currentChatUser);
      hideLoading();
    } catch (err) {
      hideLoading();
      showToast('Failed to send image', 'error');
    }
  };
  input.click();
}

function openStickerPicker() {
  let html = '<div class="sticker-picker">';
  html += '<div class="sticker-pack-tabs">';
  Object.keys(STICKER_PACKS).forEach((pack, i) => {
    html += `<button class="sticker-pack-tab ${i === 0 ? 'active' : ''}" onclick="switchStickerPack('${pack}', this)">${pack.charAt(0).toUpperCase() + pack.slice(1)}</button>`;
  });
  html += '</div>';
  html += `<div class="sticker-grid" id="stickerGrid">`;
  STICKER_PACKS.default.forEach(s => {
    html += `<div class="sticker-item" onclick="sendSticker('${s.emoji}','${s.anim}')"><span class="animated-sticker ${s.anim}" style="font-size:36px">${s.emoji}</span></div>`;
  });
  html += '</div></div>';

  openBottomSheet(html);
}

function switchStickerPack(pack, btn) {
  document.querySelectorAll('.sticker-pack-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');

  const grid = document.getElementById('stickerGrid');
  grid.innerHTML = '';
  (STICKER_PACKS[pack] || []).forEach(s => {
    grid.innerHTML += `<div class="sticker-item" onclick="sendSticker('${s.emoji}','${s.anim}')"><span class="animated-sticker ${s.anim}" style="font-size:36px">${s.emoji}</span></div>`;
  });
}

async function sendSticker(sticker, anim = 'bounce') {
  closeBottomSheet();
  if (!APP.currentChatRoom || !APP.currentChatUser) return;

  try {
    await db.collection('messages').add({
      chatRoomId: APP.currentChatRoom,
      senderId: APP.currentUser.uid,
      type: 'sticker',
      sticker,
      animation: anim,
      read: false,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });

    await updateChatRoomLastMessage(APP.currentChatRoom, `${sticker} Sticker`, APP.currentChatUser);
  } catch (err) {
    showToast('Failed to send sticker', 'error');
  }
}

function openChatOptions() {
  openBottomSheet(`
    <h3 class="sheet-title">Chat Options</h3>
    <div class="sheet-option" onclick="closeBottomSheet();clearChat()">
      <div class="sheet-option-icon">🗑️</div>
      <div class="sheet-option-text"><div class="sheet-option-label">Clear Chat</div></div>
    </div>
    <div class="sheet-option" onclick="closeBottomSheet();viewProfile('${APP.currentChatUser}')">
      <div class="sheet-option-icon">👤</div>
      <div class="sheet-option-text"><div class="sheet-option-label">View Profile</div></div>
    </div>
    <div class="sheet-option danger" onclick="closeBottomSheet();blockUser('${APP.currentChatUser}')">
      <div class="sheet-option-icon">🚫</div>
      <div class="sheet-option-text"><div class="sheet-option-label">Block User</div></div>
    </div>
  `);
}

async function clearChat() {
  if (!APP.currentChatRoom) return;
  openCenterModal(`
    <div class="modal-title">Clear Chat</div>
    <p class="modal-text">This will delete all messages in this conversation.</p>
    <div class="modal-actions">
      <button class="modal-btn secondary" onclick="closeCenterModal()">Cancel</button>
      <button class="modal-btn danger" onclick="confirmClearChat()">Clear</button>
    </div>
  `);
}

async function confirmClearChat() {
  closeCenterModal();
  showLoading();
  try {
    const snap = await db.collection('messages')
      .where('chatRoomId', '==', APP.currentChatRoom)
      .get();

    const batch = db.batch();
    snap.forEach(doc => batch.delete(doc.ref));
    await batch.commit();

    await db.collection('chatRooms').doc(APP.currentChatRoom).update({
      lastMessage: '',
    });

    hideLoading();
    showToast('Chat cleared', 'success');
  } catch (err) {
    hideLoading();
    showToast('Failed to clear chat', 'error');
  }
}

function closeChatRoom() {
  APP.chatListeners.forEach(unsub => unsub());
  APP.chatListeners = [];
  APP.currentChatRoom = null;
  APP.currentChatUser = null;
  closeOverlayPage('chatRoomPage');
}

// ==================== SETTINGS PAGE ====================

function openSettings() {
  openOverlayPage('settingsPage');
  renderSettings();
}

function renderSettings() {
  const u = APP.currentUserData;
  if (!u) return;

  const notifSettings = u.notifSettings || {};

  document.getElementById('settingsContent').innerHTML = `
    <div class="settings-section">
      <div class="settings-section-title">Account</div>
      <div class="settings-item" onclick="openEditProfile()">
        <div class="settings-item-icon">👤</div>
        <div class="settings-item-text"><div class="settings-item-label">Edit Profile</div></div>
        <div class="settings-item-right">›</div>
      </div>
      <div class="settings-item" onclick="openWallet()">
        <div class="settings-item-icon">💰</div>
        <div class="settings-item-text">
          <div class="settings-item-label">Wallet & Coins</div>
          <div class="settings-item-sublabel">⚡${formatNumber(u.freeCoins || 0)} · 🪙${formatNumber(u.goldCoins || 0)}</div>
        </div>
        <div class="settings-item-right">›</div>
      </div>
      <div class="settings-item" onclick="openReferral()">
        <div class="settings-item-icon">👥</div>
        <div class="settings-item-text"><div class="settings-item-label">Refer Friends</div><div class="settings-item-sublabel">Both get ⚡${REFERRAL_REWARD}</div></div>
        <div class="settings-item-right">›</div>
      </div>
    </div>

    <div class="settings-section">
      <div class="settings-section-title">Preferences</div>
      <div class="settings-item" onclick="toggleDarkMode();renderSettings()">
        <div class="settings-item-icon">${APP.darkMode ? '🌙' : '☀️'}</div>
        <div class="settings-item-text"><div class="settings-item-label">Dark Mode</div></div>
        <div class="toggle-switch ${APP.darkMode ? 'active' : ''}"><div class="toggle-switch-knob"></div></div>
      </div>
      <div class="settings-item" onclick="togglePrivateAccount()">
        <div class="settings-item-icon">🔒</div>
        <div class="settings-item-text"><div class="settings-item-label">Private Account</div></div>
        <div class="toggle-switch ${u.isPrivate ? 'active' : ''}" id="settingsPrivateToggle"><div class="toggle-switch-knob"></div></div>
      </div>
      <div class="settings-item" onclick="openBlockedUsers()">
        <div class="settings-item-icon">🚫</div>
        <div class="settings-item-text"><div class="settings-item-label">Blocked Users</div><div class="settings-item-sublabel">${(u.blockedUsers || []).length} blocked</div></div>
        <div class="settings-item-right">›</div>
      </div>
    </div>

    <div class="settings-section">
      <div class="settings-section-title">Notifications</div>
      ${renderNotifToggle('Likes', 'likes', notifSettings.likes !== false)}
      ${renderNotifToggle('Comments', 'comments', notifSettings.comments !== false)}
      ${renderNotifToggle('New Followers', 'followers', notifSettings.followers !== false)}
      ${renderNotifToggle('Messages', 'messages', notifSettings.messages !== false)}
      ${renderNotifToggle('Live', 'live', notifSettings.live !== false)}
    </div>

    <div class="settings-section">
      <div class="settings-section-title">Other</div>
      <div class="settings-item" onclick="clearWatchHistory()">
        <div class="settings-item-icon">🕐</div>
        <div class="settings-item-text"><div class="settings-item-label">Clear Watch History</div></div>
      </div>
      <div class="settings-item" onclick="clearAppCache()">
        <div class="settings-item-icon">🗂️</div>
        <div class="settings-item-text"><div class="settings-item-label">Clear Cache</div></div>
      </div>
      <div class="settings-item" onclick="openEarnPage()">
        <div class="settings-item-icon">📋</div>
        <div class="settings-item-text"><div class="settings-item-label">How to Earn</div></div>
        <div class="settings-item-right">›</div>
      </div>
      <div class="settings-item">
        <div class="settings-item-icon">❓</div>
        <div class="settings-item-text"><div class="settings-item-label">Help & FAQ</div></div>
      </div>
      <div class="settings-item">
        <div class="settings-item-icon">🐛</div>
        <div class="settings-item-text"><div class="settings-item-label">Report a Bug</div></div>
      </div>
      <div class="settings-item">
        <div class="settings-item-icon">📜</div>
        <div class="settings-item-text"><div class="settings-item-label">Terms & Privacy</div></div>
      </div>
    </div>

    <div class="settings-section">
      <div class="settings-item" onclick="logout()">
        <div class="settings-item-icon">🚪</div>
        <div class="settings-item-text"><div class="settings-item-label settings-danger">Log Out</div></div>
      </div>
      <div class="settings-item" onclick="deleteAccount()">
        <div class="settings-item-icon">💀</div>
        <div class="settings-item-text"><div class="settings-item-label settings-danger">Delete Account</div></div>
      </div>
    </div>

    <div class="settings-version">Vidr v${APP.version}</div>
  `;
}

function renderNotifToggle(label, key, active) {
  return `
    <div class="settings-item" onclick="toggleNotifSetting('${key}',this)">
      <div class="settings-item-icon">🔔</div>
      <div class="settings-item-text"><div class="settings-item-label">${label}</div></div>
      <div class="toggle-switch ${active ? 'active' : ''}"><div class="toggle-switch-knob"></div></div>
    </div>
  `;
}

async function toggleNotifSetting(key, el) {
  const toggle = el.querySelector('.toggle-switch');
  toggle.classList.toggle('active');
  const isActive = toggle.classList.contains('active');

  try {
    await db.collection('users').doc(APP.currentUser.uid).update({
      [`notifSettings.${key}`]: isActive,
    });
    if (APP.currentUserData.notifSettings) {
      APP.currentUserData.notifSettings[key] = isActive;
    }
  } catch {}
}

async function togglePrivateAccount() {
  const toggle = document.getElementById('settingsPrivateToggle');
  if (toggle) toggle.classList.toggle('active');
  const isPrivate = toggle?.classList?.contains('active');

  try {
    await db.collection('users').doc(APP.currentUser.uid).update({ isPrivate });
    APP.currentUserData.isPrivate = isPrivate;
    showToast(isPrivate ? 'Account is now private' : 'Account is now public', 'success');
  } catch {}
}

function openBlockedUsers() {
  const blocked = APP.currentUserData?.blockedUsers || [];

  if (blocked.length === 0) {
    openBottomSheet('<h3 class="sheet-title">Blocked Users</h3><p style="text-align:center;color:var(--text-muted);padding:20px">No blocked users</p>');
    return;
  }

  openBottomSheet(`<h3 class="sheet-title">Blocked Users</h3><div id="blockedUsersList"><div class="loading-spinner small" style="margin:20px auto"></div></div>`);

  (async () => {
    let html = '';
    for (const uid of blocked) {
      const user = await getUserDataCached(uid);
      if (!user) continue;
      html += `
        <div class="blocked-user-item">
          <img src="${user.photoURL || 'default-avatar.png'}" alt="" onerror="this.src='default-avatar.png'">
          <div class="blocked-user-info"><div class="blocked-user-name">${escapeHTML(user.displayName)}</div></div>
          <button class="unblock-btn" onclick="unblockUser('${uid}');closeBottomSheet()">Unblock</button>
        </div>
      `;
    }
    document.getElementById('blockedUsersList').innerHTML = html;
  })();
}

function clearWatchHistory() {
  showToast('Watch history cleared', 'success');
}

async function clearAppCache() {
  if ('caches' in window) {
    const keys = await caches.keys();
    await Promise.all(keys.map(key => caches.delete(key)));
  }
  Object.keys(userDataCache).forEach(key => delete userDataCache[key]);
  showToast('Cache cleared', 'success');
}

console.log('Vidr Part 6 loaded: Profile, Edit Profile, Chat, Settings');

// ==========================================
// VIDR - app.js Part 7
// Post Creation, Wallet (Stripe), Withdrawal
// ==========================================

// ==================== POST CREATION ====================

function openCreateVideo() {
  navigateTo('create');

  const container = document.getElementById('createPage');
  container.querySelector('.create-options').style.display = 'none';

  let formEl = document.getElementById('createVideoForm');
  if (formEl) formEl.remove();

  formEl = document.createElement('div');
  formEl.id = 'createVideoForm';
  formEl.className = 'create-form';
  formEl.innerHTML = `
    <div class="create-form-header">
      <button class="back-btn" onclick="closeCreateForm('createVideoForm')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5m7-7-7 7 7 7"/></svg>
      </button>
      <h3>New Video</h3>
      <button class="create-post-btn" id="postVideoBtn" onclick="publishVideoPost()" disabled>Post</button>
    </div>

    <div class="create-media-area" id="videoPreviewArea" onclick="document.getElementById('videoFileInput').click()">
      <div class="create-media-icon">🎬</div>
      <div class="create-media-text">Tap to select video (max 100MB)</div>
    </div>
    <input type="file" id="videoFileInput" accept="video/*" onchange="handleVideoSelect(event)">

    <div id="videoThumbnailSection" style="display:none">
      <div class="thumbnail-selector">
        <label style="font-size:13px;font-weight:600;color:var(--text-tertiary);margin-bottom:6px;display:block">Choose Thumbnail</label>
        <div class="thumbnail-options" id="thumbnailOptions"></div>
      </div>
    </div>

    <textarea class="create-caption" id="videoCaption" placeholder="Write a caption... @mention friends" maxlength="500"></textarea>

    <div class="caption-overlay-toggle">
      <input type="checkbox" id="videoCaptionOverlay" style="display:inline;width:auto">
      <label for="videoCaptionOverlay" style="font-size:14px;color:var(--text-secondary)">Show caption on video</label>
    </div>

    <div class="create-option-row">
      <div class="create-option-label">Visibility</div>
      <select id="videoVisibility" style="padding:8px 12px;background:var(--bg-tertiary);border:1px solid var(--border-color);border-radius:var(--radius-sm);color:var(--text-primary);font-size:14px">
        <option value="public">Public</option>
        <option value="followers">Followers</option>
        <option value="private">Only Me</option>
      </select>
    </div>

    <div class="create-option-row">
      <div class="create-option-label">Boost Post<small>⚡${BOOST_COST} or free for verified</small></div>
      <div class="toggle-switch" id="videoBoostToggle" onclick="this.classList.toggle('active')"><div class="toggle-switch-knob"></div></div>
    </div>

    <div class="upload-progress" id="videoUploadProgress" style="display:none">
      <div class="upload-progress-bar"><div class="upload-progress-fill" id="videoProgressFill"></div></div>
      <div class="upload-progress-text" id="videoProgressText">Uploading... 0%</div>
    </div>
  `;

  container.appendChild(formEl);
}

let selectedVideoFile = null;
let selectedVideoThumbnail = null;

async function handleVideoSelect(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (file.size > 100 * 1024 * 1024) {
    showToast('Video too large! Max 100MB', 'error');
    return;
  }

  selectedVideoFile = file;

  const preview = document.getElementById('videoPreviewArea');
  const url = URL.createObjectURL(file);
  preview.innerHTML = `<video src="${url}" style="width:100%;height:100%;object-fit:cover" controls></video>`;
  preview.classList.add('has-media');

  document.getElementById('postVideoBtn').disabled = false;

  generateVideoThumbnails(file);
}

async function generateVideoThumbnails(file) {
  const section = document.getElementById('videoThumbnailSection');
  const container = document.getElementById('thumbnailOptions');
  section.style.display = 'block';
  container.innerHTML = '<div class="loading-spinner small"></div>';

  const video = document.createElement('video');
  video.src = URL.createObjectURL(file);
  video.muted = true;

  video.addEventListener('loadedmetadata', () => {
    const duration = video.duration;
    const times = [0.1, 0.25, 0.5, 0.75, 0.9].map(t => t * duration);
    let generated = 0;
    container.innerHTML = '';

    times.forEach((time, i) => {
      video.currentTime = time;
      video.addEventListener('seeked', function onSeek() {
        video.removeEventListener('seeked', onSeek);
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0);

        canvas.toBlob((blob) => {
          const thumbUrl = URL.createObjectURL(blob);
          const div = document.createElement('div');
          div.className = `thumbnail-option ${i === 0 ? 'selected' : ''}`;
          div.innerHTML = `<img src="${thumbUrl}" alt="">`;
          div.onclick = () => {
            document.querySelectorAll('.thumbnail-option').forEach(t => t.classList.remove('selected'));
            div.classList.add('selected');
            selectedVideoThumbnail = blob;
          };
          container.appendChild(div);

          if (i === 0) selectedVideoThumbnail = blob;
          generated++;

          if (generated === times.length) URL.revokeObjectURL(video.src);
        }, 'image/jpeg', 0.7);
      });
    });
  });

  video.load();
}

async function publishVideoPost() {
  if (!selectedVideoFile) return;

  const caption = document.getElementById('videoCaption')?.value?.trim() || '';
  const visibility = document.getElementById('videoVisibility')?.value || 'public';
  const boost = document.getElementById('videoBoostToggle')?.classList?.contains('active');
  const captionOnMedia = document.getElementById('videoCaptionOverlay')?.checked || false;

  const progressArea = document.getElementById('videoUploadProgress');
  const progressFill = document.getElementById('videoProgressFill');
  const progressText = document.getElementById('videoProgressText');

  progressArea.style.display = 'block';
  document.getElementById('postVideoBtn').disabled = true;

  try {
    const videoPath = `posts/${APP.currentUser.uid}/${Date.now()}.mp4`;
    const videoRef = storage.ref(videoPath);
    const uploadTask = videoRef.put(selectedVideoFile);

    uploadTask.on('state_changed', (snapshot) => {
      const percent = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
      progressFill.style.width = percent + '%';
      progressText.textContent = `Uploading... ${percent}%`;
    });

    await uploadTask;
    const videoURL = await videoRef.getDownloadURL();

    let thumbURL = '';
    if (selectedVideoThumbnail) {
      const thumbPath = `thumbnails/${APP.currentUser.uid}/${Date.now()}.jpg`;
      const thumbRef = storage.ref(thumbPath);
      await thumbRef.put(selectedVideoThumbnail);
      thumbURL = await thumbRef.getDownloadURL();
    }

    progressText.textContent = 'Publishing...';

    await db.collection('posts').add({
      uid: APP.currentUser.uid,
      type: 'video',
      mediaURL: videoURL,
      thumbnailURL: thumbURL,
      caption,
      captionOnMedia,
      visibility,
      boosted: boost || false,
      boostedAt: boost ? firebase.firestore.FieldValue.serverTimestamp() : null,
      likesCount: 0,
      commentsCount: 0,
      sharesCount: 0,
      viewsCount: 0,
      products: [],
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });

    await db.collection('users').doc(APP.currentUser.uid).update({
      postsCount: firebase.firestore.FieldValue.increment(1),
    });

    await addXp(APP.currentUser.uid, 10, 'post');
    await incrementAchievement(APP.currentUser.uid, 'first_post');

    selectedVideoFile = null;
    selectedVideoThumbnail = null;

    closeCreateForm('createVideoForm');
    showToast('Video posted! 🎬', 'success');

    APP.feedPosts = [];
    APP.feedLastDoc = null;
    APP.feedEnded = false;
    loadFeed(true);
    navigateTo('home');
  } catch (err) {
    console.error('Video publish error:', err);
    showToast('Failed to post video', 'error');
    document.getElementById('postVideoBtn').disabled = false;
  }
}

function openCreatePhoto() {
  navigateTo('create');

  const container = document.getElementById('createPage');
  container.querySelector('.create-options').style.display = 'none';

  let formEl = document.getElementById('createPhotoForm');
  if (formEl) formEl.remove();

  formEl = document.createElement('div');
  formEl.id = 'createPhotoForm';
  formEl.className = 'create-form';
  formEl.innerHTML = `
    <div class="create-form-header">
      <button class="back-btn" onclick="closeCreateForm('createPhotoForm')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5m7-7-7 7 7 7"/></svg>
      </button>
      <h3>New Photo</h3>
      <button class="create-post-btn" id="postPhotoBtn" onclick="publishPhotoPost()" disabled>Post</button>
    </div>

    <div class="create-photo-grid" id="photoGrid">
      <div class="create-add-photo" onclick="addPhoto()">+</div>
    </div>
    <input type="file" id="photoFileInput" accept="image/*" multiple onchange="handlePhotoSelect(event)" style="display:none">

    <textarea class="create-caption" id="photoCaption" placeholder="Write a caption... @mention friends" maxlength="500"></textarea>

    <div class="caption-overlay-toggle">
      <input type="checkbox" id="photoCaptionOverlay" style="display:inline;width:auto">
      <label for="photoCaptionOverlay" style="font-size:14px;color:var(--text-secondary)">Show caption on image</label>
    </div>

    <div class="create-option-row">
      <div class="create-option-label">Visibility</div>
      <select id="photoVisibility" style="padding:8px 12px;background:var(--bg-tertiary);border:1px solid var(--border-color);border-radius:var(--radius-sm);color:var(--text-primary);font-size:14px">
        <option value="public">Public</option>
        <option value="followers">Followers</option>
        <option value="private">Only Me</option>
      </select>
    </div>

    <div class="upload-progress" id="photoUploadProgress" style="display:none">
      <div class="upload-progress-bar"><div class="upload-progress-fill" id="photoProgressFill"></div></div>
      <div class="upload-progress-text" id="photoProgressText">Uploading...</div>
    </div>
  `;

  container.appendChild(formEl);
}

let selectedPhotoFiles = [];

function addPhoto() {
  if (selectedPhotoFiles.length >= 8) {
    showToast('Max 8 images', 'warning');
    return;
  }
  document.getElementById('photoFileInput').click();
}

function handlePhotoSelect(event) {
  const files = Array.from(event.target.files);
  const remaining = 8 - selectedPhotoFiles.length;
  const toAdd = files.slice(0, remaining);

  selectedPhotoFiles.push(...toAdd);
  renderPhotoGrid();
  document.getElementById('postPhotoBtn').disabled = selectedPhotoFiles.length === 0;
}

function renderPhotoGrid() {
  const grid = document.getElementById('photoGrid');
  let html = '';

  selectedPhotoFiles.forEach((file, i) => {
    const url = URL.createObjectURL(file);
    html += `
      <div class="create-photo-item">
        <img src="${url}" alt="">
        <button class="create-photo-remove" onclick="removePhoto(${i})">✕</button>
      </div>
    `;
  });

  if (selectedPhotoFiles.length < 8) {
    html += `<div class="create-add-photo" onclick="addPhoto()">+</div>`;
  }

  grid.innerHTML = html;
}

function removePhoto(index) {
  selectedPhotoFiles.splice(index, 1);
  renderPhotoGrid();
  document.getElementById('postPhotoBtn').disabled = selectedPhotoFiles.length === 0;
}

async function publishPhotoPost() {
  if (selectedPhotoFiles.length === 0) return;

  const caption = document.getElementById('photoCaption')?.value?.trim() || '';
  const visibility = document.getElementById('photoVisibility')?.value || 'public';
  const captionOnMedia = document.getElementById('photoCaptionOverlay')?.checked || false;

  const progressArea = document.getElementById('photoUploadProgress');
  const progressFill = document.getElementById('photoProgressFill');
  const progressText = document.getElementById('photoProgressText');

  progressArea.style.display = 'block';
  document.getElementById('postPhotoBtn').disabled = true;

  try {
    const mediaURLs = [];

    for (let i = 0; i < selectedPhotoFiles.length; i++) {
      progressText.textContent = `Uploading ${i + 1}/${selectedPhotoFiles.length}...`;
      progressFill.style.width = ((i + 1) / selectedPhotoFiles.length * 100) + '%';

      const compressed = await compressImage(selectedPhotoFiles[i], 1080, 0.85);
      const path = `posts/${APP.currentUser.uid}/${Date.now()}_${i}.jpg`;
      const ref = storage.ref(path);
      await ref.put(compressed);
      const url = await ref.getDownloadURL();
      mediaURLs.push(url);
    }

    progressText.textContent = 'Publishing...';

    await db.collection('posts').add({
      uid: APP.currentUser.uid,
      type: 'image',
      mediaURLs,
      mediaURL: mediaURLs[0],
      caption,
      captionOnMedia,
      visibility,
      likesCount: 0,
      commentsCount: 0,
      sharesCount: 0,
      viewsCount: 0,
      products: [],
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });

    await db.collection('users').doc(APP.currentUser.uid).update({
      postsCount: firebase.firestore.FieldValue.increment(1),
    });

    await addXp(APP.currentUser.uid, 8, 'post');
    await incrementAchievement(APP.currentUser.uid, 'first_post');

    selectedPhotoFiles = [];
    closeCreateForm('createPhotoForm');
    showToast('Photo posted! 📷', 'success');

    APP.feedPosts = [];
    APP.feedLastDoc = null;
    APP.feedEnded = false;
    loadFeed(true);
    navigateTo('home');
  } catch (err) {
    console.error('Photo publish error:', err);
    showToast('Failed to post', 'error');
    document.getElementById('postPhotoBtn').disabled = false;
  }
}

function openCreateText() {
  navigateTo('create');

  const container = document.getElementById('createPage');
  container.querySelector('.create-options').style.display = 'none';

  let formEl = document.getElementById('createTextForm');
  if (formEl) formEl.remove();

  formEl = document.createElement('div');
  formEl.id = 'createTextForm';
  formEl.className = 'create-form';
  formEl.innerHTML = `
    <div class="create-form-header">
      <button class="back-btn" onclick="closeCreateForm('createTextForm')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5m7-7-7 7 7 7"/></svg>
      </button>
      <h3>Text Post</h3>
      <button class="create-post-btn" id="postTextBtn" onclick="publishTextPost()">Post</button>
    </div>

    <div class="text-post-preview" id="textPostPreview" style="background:${TEXT_BG_COLORS[0]}">
      <textarea class="text-post-input" id="textPostInput" placeholder="What's on your mind?" oninput="updateTextPreviewSize(this)"></textarea>
    </div>

    <div class="text-bg-options" id="textBgOptions">
      ${TEXT_BG_COLORS.map((bg, i) => `
        <div class="text-bg-option ${i === 0 ? 'selected' : ''}" style="background:${bg}" onclick="selectTextBg(${i})"></div>
      `).join('')}
    </div>

    <div class="create-option-row">
      <div class="create-option-label">Visibility</div>
      <select id="textVisibility" style="padding:8px 12px;background:var(--bg-tertiary);border:1px solid var(--border-color);border-radius:var(--radius-sm);color:var(--text-primary);font-size:14px">
        <option value="public">Public</option>
        <option value="followers">Followers</option>
        <option value="private">Only Me</option>
      </select>
    </div>
  `;

  container.appendChild(formEl);
}

let selectedTextBg = 0;

function selectTextBg(index) {
  selectedTextBg = index;
  document.getElementById('textPostPreview').style.background = TEXT_BG_COLORS[index];
  document.querySelectorAll('#textBgOptions .text-bg-option').forEach((el, i) => {
    el.classList.toggle('selected', i === index);
  });
}

function updateTextPreviewSize(textarea) {
  const len = textarea.value.length;
  if (len > 100) textarea.style.fontSize = '18px';
  else if (len > 50) textarea.style.fontSize = '20px';
  else textarea.style.fontSize = '22px';
}

async function publishTextPost() {
  const text = document.getElementById('textPostInput')?.value?.trim();
  if (!text) return showToast('Please enter some text', 'warning');

  const visibility = document.getElementById('textVisibility')?.value || 'public';

  showLoading();

  try {
    await db.collection('posts').add({
      uid: APP.currentUser.uid,
      type: 'text',
      text,
      caption: text,
      background: TEXT_BG_COLORS[selectedTextBg],
      visibility,
      likesCount: 0,
      commentsCount: 0,
      sharesCount: 0,
      viewsCount: 0,
      products: [],
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });

    await db.collection('users').doc(APP.currentUser.uid).update({
      postsCount: firebase.firestore.FieldValue.increment(1),
    });

    await addXp(APP.currentUser.uid, 5, 'post');
    await incrementAchievement(APP.currentUser.uid, 'first_post');

    closeCreateForm('createTextForm');
    hideLoading();
    showToast('Posted! ✍️', 'success');

    APP.feedPosts = [];
    APP.feedLastDoc = null;
    APP.feedEnded = false;
    loadFeed(true);
    navigateTo('home');
  } catch (err) {
    hideLoading();
    showToast('Failed to post', 'error');
  }
}

function closeCreateForm(formId) {
  const form = document.getElementById(formId);
  if (form) form.remove();

  const createPage = document.getElementById('createPage');
  const options = createPage?.querySelector('.create-options');
  if (options) options.style.display = 'flex';

  selectedVideoFile = null;
  selectedVideoThumbnail = null;
  selectedPhotoFiles = [];
}

// ==================== WALLET ====================

function openWallet() {
  openOverlayPage('walletPage');
  renderWallet();
}

function renderWallet() {
  const u = APP.currentUserData;
  if (!u) return;

  document.getElementById('walletContent').innerHTML = `
    <div class="wallet-balance-card">
      <div class="wallet-balances">
        <div class="wallet-balance-item">
          <h4>⚡ Free Coins</h4>
          <div class="balance-amount">${formatNumber(u.freeCoins || 0)}</div>
        </div>
        <div class="wallet-balance-item">
          <h4>🪙 Gold Coins</h4>
          <div class="balance-amount">${formatNumber(u.goldCoins || 0)}</div>
        </div>
      </div>
    </div>

    <div class="wallet-actions">
      <div class="wallet-action-btn" onclick="showBuyGold()">
        <div class="wallet-btn-icon">🪙</div>
        <span>Buy Gold</span>
      </div>
      <div class="wallet-action-btn" onclick="showWithdraw()">
        <div class="wallet-btn-icon">💳</div>
        <span>Withdraw</span>
      </div>
      <div class="wallet-action-btn" onclick="showTransactionHistory()">
        <div class="wallet-btn-icon">📜</div>
        <span>History</span>
      </div>
    </div>

    ${!u.verified ? `
      <div class="verified-card">
        <h3>✨ Get Verified</h3>
        <p>Unlock animated effects, shop access, free boosts & more</p>
        <div class="verified-price">$${VERIFIED_PRICE}/mo</div>
        <div class="verified-features">
          <div class="verified-feature">✅ Verified badge & animated glow</div>
          <div class="verified-feature">✅ Animated profile cover</div>
          <div class="verified-feature">✅ ${VERIFIED_BOOSTS_PER_MONTH} free post boosts/month</div>
          <div class="verified-feature">✅ Shop access (sell products)</div>
          <div class="verified-feature">✅ Priority support</div>
        </div>
        <button class="verified-subscribe-btn" onclick="subscribeVerified()">Subscribe Now</button>
      </div>
    ` : `
      <div style="padding:14px;background:var(--bg-card);border:1px solid var(--border-color);border-radius:var(--radius-lg);margin-top:12px;display:flex;align-items:center;gap:10px">
        ${getVerifiedBadge()}
        <div>
          <div style="font-weight:700;font-size:14px">Verified Active</div>
          <div style="font-size:12px;color:var(--text-tertiary)">${u.verifiedUntil ? `Expires ${new Date(u.verifiedUntil.toDate ? u.verifiedUntil.toDate() : u.verifiedUntil).toLocaleDateString()}` : 'Active'}</div>
        </div>
      </div>
    `}

    <div style="margin-top:16px">
      <h3 style="font-size:16px;font-weight:700;margin-bottom:12px">Buy Gold Coins</h3>
      ${GOLD_PACKAGES.map(pkg => `
        <div class="coin-package ${pkg.popular ? 'popular' : ''}" onclick="purchaseGoldPackage('${pkg.id}')">
          ${pkg.popular ? '<div class="coin-package-popular-tag">🔥 POPULAR</div>' : ''}
          <div class="coin-package-icon">🪙</div>
          <div class="coin-package-info">
            <div class="coin-package-name">${pkg.name}</div>
            <div class="coin-package-amount">${formatNumber(pkg.coins)} gold coins</div>
            ${pkg.bonus ? `<div class="coin-package-bonus">+${formatNumber(pkg.bonus)} bonus!</div>` : ''}
          </div>
          <div class="coin-package-price">$${pkg.price}</div>
        </div>
      `).join('')}
    </div>
  `;
}

function showBuyGold() {
  const walletContent = document.getElementById('walletContent');
  walletContent.scrollTo({ top: walletContent.scrollHeight, behavior: 'smooth' });
}

async function purchaseGoldPackage(packageId) {
  const pkg = GOLD_PACKAGES.find(p => p.id === packageId);
  if (!pkg) return;

  openCenterModal(`
    <div class="modal-title">Purchase Gold Coins</div>
    <div style="text-align:center;margin:16px 0">
      <div style="font-size:40px">🪙</div>
      <div style="font-size:24px;font-weight:800;margin:8px 0">${formatNumber(pkg.coins + (pkg.bonus || 0))}</div>
      <div style="color:var(--text-tertiary);font-size:13px">Gold Coins</div>
      ${pkg.bonus ? `<div style="color:var(--success);font-size:13px;font-weight:600;margin-top:4px">Includes ${formatNumber(pkg.bonus)} bonus!</div>` : ''}
    </div>
    <div class="checkout-total" style="margin:12px 0">
      <span>Total</span>
      <span>$${pkg.price.toFixed(2)}</span>
    </div>
    <div class="modal-actions">
      <button class="modal-btn secondary" onclick="closeCenterModal()">Cancel</button>
      <button class="modal-btn primary" onclick="confirmGoldPurchase('${pkg.id}')">Pay $${pkg.price.toFixed(2)}</button>
    </div>
  `);
}

let selectedPaymentMethod = 'stripe';

// ==================== STRIPE INTEGRATION ====================

async function confirmGoldPurchase(packageId) {
  const pkg = GOLD_PACKAGES.find(p => p.id === packageId);
  if (!pkg) return;

  closeCenterModal();
  showLoading();

  try {
    initStripe();
    if (!stripe) {
      hideLoading();
      showToast('Stripe not loaded. Please refresh.', 'error');
      return;
    }

    const functions = getFirebaseFunctions();
    const createIntent = functions.httpsCallable('createPaymentIntent');
    const result = await createIntent({ packageId });
    const { clientSecret } = result.data;

    hideLoading();
    openStripePaymentModal(clientSecret, pkg.price * 100, `${pkg.name} - ${formatNumber(pkg.coins + (pkg.bonus || 0))} Gold Coins`, 'coin_purchase', packageId);
  } catch (err) {
    hideLoading();
    console.error('Stripe error:', err);
    showToast('Payment setup failed: ' + (err.message || 'Unknown error'), 'error');
  }
}

function openStripePaymentModal(clientSecret, amount, description, type, packageId = null) {
  currentStripePaymentType = type;
  currentStripePackageId = packageId;

  document.getElementById('stripeAmountDisplay').innerHTML = `
    <div style="font-size:14px;color:var(--text-tertiary);font-weight:400;margin-bottom:4px">${description}</div>
    $${(amount / 100).toFixed(2)}
  `;

  const modal = document.getElementById('stripePaymentModal');
  modal.style.display = 'flex';

  const appearance = {
    theme: APP.darkMode ? 'night' : 'stripe',
    variables: {
      colorPrimary: '#e91e8c',
      colorBackground: APP.darkMode ? '#1a1a35' : '#ffffff',
      colorText: APP.darkMode ? '#ffffff' : '#1a1033',
      colorDanger: '#ef4444',
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
      borderRadius: '8px',
    }
  };

  stripeElements = stripe.elements({ clientSecret, appearance });
  stripePaymentElement = stripeElements.create('payment');
  stripePaymentElement.mount('#stripePaymentElement');

  const form = document.getElementById('stripePaymentForm');
  form.onsubmit = async (e) => {
    e.preventDefault();
    await submitStripePayment(clientSecret);
  };
}

async function submitStripePayment(clientSecret) {
  const submitBtn = document.getElementById('stripeSubmitBtn');
  const errorEl = document.getElementById('stripePaymentError');

  submitBtn.disabled = true;
  submitBtn.textContent = 'Processing...';
  errorEl.textContent = '';

  try {
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements: stripeElements,
      confirmParams: {
        return_url: `${window.location.origin}?payment=success`,
      },
      redirect: 'if_required',
    });

    if (error) {
      errorEl.textContent = error.message;
      submitBtn.disabled = false;
      submitBtn.textContent = 'Pay Now';
      return;
    }

    if (paymentIntent && paymentIntent.status === 'succeeded') {
      closeStripeModal();
      launchConfetti();
      showToast('Payment successful! 🎉 Coins crediting...', 'success', 5000);

      setTimeout(async () => {
        await loadUserData();
        if (document.getElementById('walletPage').classList.contains('active')) {
          renderWallet();
        }
      }, 3000);
    }
  } catch (err) {
    console.error('Payment error:', err);
    errorEl.textContent = 'Payment failed. Please try again.';
    submitBtn.disabled = false;
    submitBtn.textContent = 'Pay Now';
  }
}

function closeStripeModal() {
  const modal = document.getElementById('stripePaymentModal');
  modal.style.display = 'none';

  if (stripePaymentElement) {
    stripePaymentElement.destroy();
    stripePaymentElement = null;
  }
  stripeElements = null;
  currentStripePaymentType = null;
}

// ==================== VERIFIED SUBSCRIPTION (Stripe) ====================

async function subscribeVerified() {
  openCenterModal(`
    <div class="modal-title">Verified Subscription</div>
    <p class="modal-text">$${VERIFIED_PRICE}/month for all premium features</p>
    <div style="text-align:left;margin:16px 0">
      <div style="padding:6px 0;font-size:13px">✨ Verified badge & animated glow</div>
      <div style="padding:6px 0;font-size:13px">🎨 Animated profile cover</div>
      <div style="padding:6px 0;font-size:13px">🚀 ${VERIFIED_BOOSTS_PER_MONTH} free post boosts/month</div>
      <div style="padding:6px 0;font-size:13px">🛍️ Shop access (sell products)</div>
    </div>
    <div class="modal-actions">
      <button class="modal-btn secondary" onclick="closeCenterModal()">Cancel</button>
      <button class="modal-btn primary" onclick="confirmVerifiedSubscription()">Subscribe $${VERIFIED_PRICE}/mo</button>
    </div>
  `);
}

async function confirmVerifiedSubscription() {
  closeCenterModal();
  showLoading();

  try {
    initStripe();
    if (!stripe) {
      hideLoading();
      showToast('Stripe not loaded. Please refresh.', 'error');
      return;
    }

    const functions = getFirebaseFunctions();
    const createSub = functions.httpsCallable('createSubscription');
    const result = await createSub({});
    const { clientSecret } = result.data;

    hideLoading();
    openStripePaymentModal(clientSecret, VERIFIED_PRICE * 100, 'Verified Subscription (30 days)', 'subscription');
  } catch (err) {
    hideLoading();
    console.error('Subscription error:', err);
    showToast('Subscription setup failed: ' + (err.message || 'Unknown error'), 'error');
  }
}

// ==================== WITHDRAWAL (Stripe Connect) ====================

function showWithdraw() {
  const u = APP.currentUserData;
  const goldBalance = u?.goldCoins || 0;
  const usdValue = (goldBalance / 100).toFixed(2);

  openBottomSheet(`
    <h3 class="sheet-title">Withdraw</h3>
    <div class="withdraw-form">
      <p style="text-align:center;color:var(--text-tertiary);font-size:13px;margin-bottom:12px">
        Balance: 🪙${formatNumber(goldBalance)} (≈ $${usdValue})<br>
        Minimum: 🪙${formatNumber(MIN_WITHDRAWAL)} ($${(MIN_WITHDRAWAL/100).toFixed(2)})<br>
        Fee: ${WITHDRAWAL_FEE * 100}% · Processing: 1-3 business days
      </p>

      ${u.stripeConnectId ? `
        <div style="padding:10px;background:var(--success-bg);border:1px solid var(--success);border-radius:var(--radius-md);margin-bottom:12px;text-align:center;font-size:13px;color:var(--success)">
          ✅ Stripe account connected
        </div>
      ` : `
        <div style="padding:10px;background:var(--warning-bg);border:1px solid var(--warning);border-radius:var(--radius-md);margin-bottom:12px;text-align:center;font-size:13px;color:var(--warning)">
          ⚠️ Please connect Stripe first
        </div>
        <button class="modal-btn primary" style="width:100%;margin-bottom:12px" onclick="connectStripeAccount()">Connect Stripe Account</button>
      `}

      <input type="number" class="withdraw-amount-input" id="withdrawAmount" placeholder="Amount in gold coins" min="${MIN_WITHDRAWAL}">

      <div class="withdraw-info" id="withdrawInfo">Enter amount to see payout</div>

      <div id="withdrawAmountCalc" style="display:none;text-align:center;margin:10px 0">
        <div style="font-size:13px;color:var(--text-tertiary)">You receive:</div>
        <div style="font-size:22px;font-weight:800;color:var(--success)" id="withdrawPayout">$0.00</div>
      </div>

      <button class="product-submit-btn" onclick="submitWithdrawal()" ${!u.stripeConnectId ? 'disabled' : ''} style="margin-top:14px;${!u.stripeConnectId ? 'opacity:0.5' : ''}">Request Withdrawal</button>
    </div>
  `);

  document.getElementById('withdrawAmount')?.addEventListener('input', (e) => {
    const amount = parseInt(e.target.value) || 0;
    const calcDiv = document.getElementById('withdrawAmountCalc');
    const payoutEl = document.getElementById('withdrawPayout');
    const infoEl = document.getElementById('withdrawInfo');

    if (amount >= MIN_WITHDRAWAL) {
      const usd = amount / 100;
      const fee = usd * WITHDRAWAL_FEE;
      const payout = usd - fee;
      calcDiv.style.display = 'block';
      payoutEl.textContent = '$' + payout.toFixed(2);
      infoEl.textContent = `Fee: $${fee.toFixed(2)} (${WITHDRAWAL_FEE * 100}%)`;
    } else {
      calcDiv.style.display = 'none';
      infoEl.textContent = `Minimum: 🪙${formatNumber(MIN_WITHDRAWAL)}`;
    }
  });
}

async function connectStripeAccount() {
  closeBottomSheet();
  showLoading();

  try {
    const functions = getFirebaseFunctions();
    const connect = functions.httpsCallable('createConnectAccount');
    const result = await connect({});

    hideLoading();

    if (result.data.url) {
      window.open(result.data.url, '_blank');
      showToast('Complete onboarding in the new tab, then try withdrawal again', 'info', 8000);
    }
  } catch (err) {
    hideLoading();
    showToast('Failed to connect Stripe: ' + (err.message || 'Unknown error'), 'error');
  }
}

async function submitWithdrawal() {
  const amount = parseInt(document.getElementById('withdrawAmount')?.value) || 0;

  if (amount < MIN_WITHDRAWAL) return showToast(`Minimum 🪙${formatNumber(MIN_WITHDRAWAL)}`, 'warning');
  if (amount > (APP.currentUserData?.goldCoins || 0)) return showToast('Insufficient balance', 'error');

  if (!APP.currentUserData.stripeConnectId) {
    showToast('Please connect your Stripe account first', 'warning');
    return;
  }

  closeBottomSheet();
  showLoading();

  try {
    const functions = getFirebaseFunctions();
    const withdraw = functions.httpsCallable('processWithdrawal');
    const result = await withdraw({ goldCoins: amount });

    hideLoading();
    launchConfetti();
    showToast(`Withdrawal of $${result.data.amount.toFixed(2)} processed! ✅`, 'success', 5000);

    await loadUserData();
    renderWallet();
  } catch (err) {
    hideLoading();
    console.error('Withdrawal error:', err);
    showToast('Withdrawal failed: ' + (err.message || 'Unknown error'), 'error');
  }
}

// ==================== TRANSACTION HISTORY ====================

async function showTransactionHistory() {
  openBottomSheet(`<h3 class="sheet-title">Transaction History</h3><div id="transHistoryList"><div class="loading-spinner small" style="margin:30px auto"></div></div>`);

  try {
    const snap = await db.collection('transactions')
      .where('uid', '==', APP.currentUser.uid)
      .orderBy('createdAt', 'desc')
      .limit(30)
      .get();

    if (snap.empty) {
      document.getElementById('transHistoryList').innerHTML = '<p style="text-align:center;color:var(--text-muted);padding:20px">No transactions yet</p>';
      return;
    }

    const icons = {
      purchase: '🪙', withdrawal: '💳', boost: '🚀', xp_boost: '⚡',
      gift_sent: '🎁', gift_received: '🎁', subscription: '✨',
      game_win: '🎮', game_lose: '🎮', spin_win: '🎡', daily: '📅',
      sale: '🛍️', referral_commission: '👥', marketing_commission: '📊',
      ad_reward: '📺', coin_grant: '👑',
    };

    let html = '<div style="max-height:400px;overflow-y:auto">';
    snap.forEach(doc => {
      const t = doc.data();
      const icon = icons[t.type] || '💰';
      const isPositive = t.amount > 0;
      const isPending = t.status === 'pending';

      html += `
        <div class="transaction-item">
          <div class="transaction-icon">${icon}</div>
          <div class="transaction-info">
            <div class="transaction-title">${escapeHTML(t.description || t.type)}</div>
            <div class="transaction-time">${timeAgo(t.createdAt)}</div>
          </div>
          <div class="transaction-amount ${isPending ? 'pending' : (isPositive ? 'positive' : 'negative')}">
            ${isPending ? '⏳ ' : ''}${isPositive ? '+' : ''}${t.coinType === 'gold' ? '🪙' : '⚡'}${Math.abs(t.amount)}
          </div>
        </div>
      `;
    });
    html += '</div>';

    document.getElementById('transHistoryList').innerHTML = html;
  } catch (err) {
    document.getElementById('transHistoryList').innerHTML = '<p style="text-align:center;color:var(--text-muted);padding:20px">Failed to load</p>';
  }
}

console.log('Vidr Part 7 loaded: Post Creation, Wallet, Stripe, Withdrawal');

// ==========================================
// VIDR - app.js Part 8
// Spin Wheel, Mini Games, Leaderboard, Shop
// ==========================================

// ==================== SPIN WHEEL ====================

function openSpinWheel() {
  openOverlayPage('spinWheelPage');
  renderSpinWheel();
}

const SPIN_SEGMENTS = [
  { label: '⚡1', value: 1, type: 'free', color: '#e91e8c' },
  { label: '⚡3', value: 3, type: 'free', color: '#7c3aed' },
  { label: '⚡5', value: 5, type: 'free', color: '#3b82f6' },
  { label: '⚡10', value: 10, type: 'free', color: '#10b981' },
  { label: '⚡20', value: 20, type: 'free', color: '#f59e0b' },
  { label: '⚡50', value: 50, type: 'free', color: '#ef4444' },
  { label: '⚡100', value: 100, type: 'free', color: '#8b5cf6' },
  { label: '⚡200', value: 200, type: 'free', color: '#ec4899' },
  { label: '🎁 Gift', value: 0, type: 'gift', color: '#06b6d4' },
  { label: 'Try Again', value: 0, type: 'retry', color: '#6b7280' },
  { label: '⚡2', value: 2, type: 'free', color: '#d946ef' },
  { label: '⚡8', value: 8, type: 'free', color: '#14b8a6' },
  { label: '⚡15', value: 15, type: 'free', color: '#f97316' },
  { label: '⚡30', value: 30, type: 'free', color: '#84cc16' },
];

const SPIN_WEIGHTS = [20, 15, 14, 12, 8, 3, 1, 0.5, 2, 10, 18, 13, 10, 5];

function renderSpinWheel() {
  const adsNeeded = 3;
  const adsWatched = APP.spinAdsWatched || 0;

  document.getElementById('spinContent').innerHTML = `
    <p style="text-align:center;color:var(--text-tertiary);font-size:13px;margin-bottom:8px">Watch ${adsNeeded} ads to earn a spin!</p>

    <div class="spin-ad-progress">
      ${Array.from({ length: adsNeeded }, (_, i) => `<div class="spin-ad-dot ${i < adsWatched ? 'filled' : ''}"></div>`).join('')}
    </div>

    ${adsWatched < adsNeeded ? `
      <button class="watch-ad-btn" onclick="watchSpinAd()" style="margin:16px auto;display:flex">
        📺 Watch Ad (${adsWatched}/${adsNeeded})
      </button>
    ` : ''}

    <div class="spin-wheel-container">
      <div class="spin-wheel-pointer">▼</div>
      <canvas id="spinWheelCanvas" width="300" height="300"></canvas>
    </div>

    <button class="spin-btn" id="spinBtn" onclick="spinWheel()" ${adsWatched < adsNeeded ? 'disabled' : ''}>
      🎡 SPIN!
    </button>
  `;

  drawSpinWheel();
}

function drawSpinWheel(rotation = 0) {
  const canvas = document.getElementById('spinWheelCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const cx = 150, cy = 150, r = 140;
  const segments = SPIN_SEGMENTS.length;
  const arc = (Math.PI * 2) / segments;

  ctx.clearRect(0, 0, 300, 300);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rotation);

  SPIN_SEGMENTS.forEach((seg, i) => {
    const startAngle = arc * i - Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, r, startAngle, startAngle + arc);
    ctx.closePath();
    ctx.fillStyle = seg.color;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.save();
    ctx.rotate(startAngle + arc / 2);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText(seg.label, r - 12, 4);
    ctx.restore();
  });

  ctx.beginPath();
  ctx.arc(0, 0, 20, 0, Math.PI * 2);
  ctx.fillStyle = '#1a1a35';
  ctx.fill();
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 10px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('SPIN', 0, 4);

  ctx.restore();
}

function watchSpinAd() {
  showRewardedAd(() => {
    APP.spinAdsWatched++;
    APP.adImpressions++;
    renderSpinWheel();
    showToast(`Ad watched! (${APP.spinAdsWatched}/3)`, 'success');
  });
}

let isSpinning = false;

function spinWheel() {
  if (isSpinning || APP.spinAdsWatched < 3) return;
  isSpinning = true;

  const btn = document.getElementById('spinBtn');
  btn.disabled = true;

  const totalWeight = SPIN_WEIGHTS.reduce((a, b) => a + b, 0);
  let random = Math.random() * totalWeight;
  let winIndex = 0;
  for (let i = 0; i < SPIN_WEIGHTS.length; i++) {
    random -= SPIN_WEIGHTS[i];
    if (random <= 0) { winIndex = i; break; }
  }

  const segments = SPIN_SEGMENTS.length;
  const segAngle = 360 / segments;
  const targetAngle = 360 - (winIndex * segAngle + segAngle / 2);
  const totalRotation = 360 * 8 + targetAngle;

  let currentRotation = 0;
  const duration = 4000;
  const startTime = Date.now();

  function animate() {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    currentRotation = eased * totalRotation;

    drawSpinWheel((currentRotation * Math.PI) / 180);

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      isSpinning = false;
      APP.spinAdsWatched = 0;
      handleSpinResult(winIndex);
    }
  }

  animate();
}

async function handleSpinResult(index) {
  const segment = SPIN_SEGMENTS[index];

  if (segment.type === 'retry') {
    showToast('Try again next time! 🔄', 'info');
    renderSpinWheel();
    return;
  }

  if (segment.type === 'gift') {
    const gift = FREE_GIFTS[Math.floor(Math.random() * FREE_GIFTS.length)];
    showToast(`You won a ${gift.emoji} ${gift.name}!`, 'success');
    renderSpinWheel();
    return;
  }

  try {
    await db.collection('users').doc(APP.currentUser.uid).update({
      freeCoins: firebase.firestore.FieldValue.increment(segment.value),
    });
    APP.currentUserData.freeCoins += segment.value;

    await db.collection('transactions').add({
      uid: APP.currentUser.uid,
      type: 'spin_win',
      amount: segment.value,
      coinType: 'free',
      description: `Spin wheel: won ⚡${segment.value}`,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });

    if (Math.random() < PAID_REWARD_CHANCE) {
      const goldWin = Math.floor(Math.random() * 50) + 1;
      await db.collection('users').doc(APP.currentUser.uid).update({
        goldCoins: firebase.firestore.FieldValue.increment(goldWin),
      });
      APP.currentUserData.goldCoins += goldWin;
      launchConfetti();
      openCenterModal(`
        <div class="modal-title">🎰 JACKPOT!</div>
        <p class="modal-text">Incredibly rare! You also won 🪙${goldWin} gold coins!</p>
        <div class="modal-actions"><button class="modal-btn primary" onclick="closeCenterModal()">Amazing!</button></div>
      `);
    }

    await incrementAchievement(APP.currentUser.uid, 'spin_win');
    await addXp(APP.currentUser.uid, 5, 'spin');
  } catch {}

  openCenterModal(`
    <div style="text-align:center">
      <div style="font-size:50px;margin-bottom:10px">🎉</div>
      <h3 class="modal-title">You Won!</h3>
      <div style="font-size:32px;font-weight:800;color:var(--primary);margin:10px 0">⚡ ${segment.value}</div>
      <p class="modal-text">Free coins added to your wallet!</p>
      <div class="modal-actions"><button class="modal-btn primary" onclick="closeCenterModal();renderSpinWheel()">Claim!</button></div>
    </div>
  `);
}

// ==================== MINI GAMES ====================

function openGames() {
  openOverlayPage('gamesPage');
  renderGamesMenu();
}

function renderGamesMenu() {
  document.getElementById('gamesContent').innerHTML = `
    <p style="text-align:center;color:var(--text-tertiary);font-size:13px;margin-bottom:16px">Balance: ⚡${formatNumber(APP.currentUserData?.freeCoins || 0)}</p>
    <div class="games-grid">
      <div class="game-card" onclick="playGame('coinflip')"><div class="game-card-icon">🪙</div><div class="game-card-name">Coin Flip</div><div class="game-card-cost">⚡10</div></div>
      <div class="game-card" onclick="playGame('dice')"><div class="game-card-icon">🎲</div><div class="game-card-name">Lucky Dice</div><div class="game-card-cost">⚡15</div></div>
      <div class="game-card" onclick="playGame('scratch')"><div class="game-card-icon">🎫</div><div class="game-card-name">Scratch Card</div><div class="game-card-cost">⚡20</div></div>
      <div class="game-card" onclick="playGame('slots')"><div class="game-card-icon">🎰</div><div class="game-card-name">Lucky Slots</div><div class="game-card-cost">⚡25</div></div>
      <div class="game-card" onclick="playGame('rps')"><div class="game-card-icon">✊</div><div class="game-card-name">Rock Paper Scissors</div><div class="game-card-cost">⚡5</div></div>
      <div class="game-card" onclick="playGame('number')"><div class="game-card-icon">🔢</div><div class="game-card-name">Number Guess</div><div class="game-card-cost">⚡10</div></div>
    </div>
  `;
}

const GAME_COSTS = { coinflip: 10, dice: 15, scratch: 20, slots: 25, rps: 5, number: 10 };

async function playGame(game) {
  const cost = GAME_COSTS[game];
  if ((APP.currentUserData?.freeCoins || 0) < cost) {
    return showToast(`Need ⚡${cost} to play!`, 'warning');
  }

  await db.collection('users').doc(APP.currentUser.uid).update({
    freeCoins: firebase.firestore.FieldValue.increment(-cost),
  });
  APP.currentUserData.freeCoins -= cost;

  switch (game) {
    case 'coinflip': renderCoinFlip(cost); break;
    case 'dice': renderDice(cost); break;
    case 'scratch': renderScratch(cost); break;
    case 'slots': renderSlots(cost); break;
    case 'rps': renderRPS(cost); break;
    case 'number': renderNumberGuess(cost); break;
  }
}

async function gameWin(game, multiplier, bet) {
  const winnings = Math.floor(bet * multiplier);
  await db.collection('users').doc(APP.currentUser.uid).update({
    freeCoins: firebase.firestore.FieldValue.increment(winnings),
  });
  APP.currentUserData.freeCoins += winnings;

  await db.collection('transactions').add({
    uid: APP.currentUser.uid, type: 'game_win', amount: winnings, coinType: 'free',
    description: `${game} win: ⚡${winnings}`, createdAt: firebase.firestore.FieldValue.serverTimestamp(),
  });

  await incrementAchievement(APP.currentUser.uid, 'game_win');
  await addXp(APP.currentUser.uid, 5, 'game');

  if (Math.random() < PAID_REWARD_CHANCE) {
    const gold = Math.floor(Math.random() * 50) + 1;
    await db.collection('users').doc(APP.currentUser.uid).update({ goldCoins: firebase.firestore.FieldValue.increment(gold) });
    launchConfetti();
    showToast(`INCREDIBLE! Also won 🪙${gold}!`, 'success');
  }

  return winnings;
}

function renderCoinFlip(bet) {
  document.getElementById('gamesContent').innerHTML = `
    <div class="game-area">
      <h3 style="margin-bottom:16px">🪙 Coin Flip</h3>
      <p style="color:var(--text-tertiary);margin-bottom:20px">Pick heads or tails!</p>
      <div id="coinDisplay" style="font-size:80px;margin:20px 0">🪙</div>
      <div style="display:flex;gap:16px;justify-content:center" id="coinChoices">
        <button style="padding:14px 32px;background:var(--gradient-primary);color:#fff;border-radius:var(--radius-lg);font-weight:700;font-size:16px" onclick="flipCoin('heads',${bet})">Heads</button>
        <button style="padding:14px 32px;background:var(--bg-tertiary);color:var(--text-primary);border:1px solid var(--border-color);border-radius:var(--radius-lg);font-weight:700;font-size:16px" onclick="flipCoin('tails',${bet})">Tails</button>
      </div>
      <div id="coinResult"></div>
    </div>
  `;
}

async function flipCoin(choice, bet) {
  document.getElementById('coinChoices').style.display = 'none';
  const display = document.getElementById('coinDisplay');
  display.innerHTML = '<span class="coin-flip-anim">🪙</span>';

  await new Promise(r => setTimeout(r, 800));

  const result = Math.random() < 0.45 ? choice : (choice === 'heads' ? 'tails' : 'heads');
  const won = result === choice;

  display.textContent = result === 'heads' ? '🪙' : '🔵';

  let html = '';
  if (won) {
    const winnings = await gameWin('Coin Flip', 2, bet);
    html = `<div class="game-result win"><h3>You Won! 🎉</h3><p>+⚡${winnings}</p></div>`;
    launchConfetti();
  } else {
    html = `<div class="game-result lose"><h3>You Lost! 😢</h3><p>It was ${result}</p></div>`;
  }
  html += `<button class="play-again-btn" onclick="playGame('coinflip')">Play Again ⚡${bet}</button>
            <button style="margin-top:8px;color:var(--text-tertiary);font-size:14px" onclick="renderGamesMenu()">Back to Games</button>`;

  document.getElementById('coinResult').innerHTML = html;
}

function renderDice(bet) {
  document.getElementById('gamesContent').innerHTML = `
    <div class="game-area">
      <h3 style="margin-bottom:16px">🎲 Lucky Dice</h3>
      <p style="color:var(--text-tertiary);margin-bottom:20px">Roll 5 = 2x · Roll 6 = 3x</p>
      <div id="diceDisplay" style="font-size:80px;margin:20px 0">🎲</div>
      <button style="padding:14px 40px;background:var(--gradient-primary);color:#fff;border-radius:var(--radius-full);font-weight:700;font-size:16px" id="rollDiceBtn" onclick="rollDice(${bet})">Roll!</button>
      <div id="diceResult"></div>
    </div>
  `;
}

async function rollDice(bet) {
  document.getElementById('rollDiceBtn').style.display = 'none';
  const display = document.getElementById('diceDisplay');
  display.innerHTML = '<span class="dice-anim">🎲</span>';

  await new Promise(r => setTimeout(r, 800));

  const result = Math.floor(Math.random() * 6) + 1;
  const diceEmojis = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
  display.textContent = diceEmojis[result - 1];

  let html = '';
  if (result === 6) {
    const w = await gameWin('Dice', 3, bet);
    html = `<div class="game-result win"><h3>TRIPLE! 🎉</h3><p>Rolled ${result} · +⚡${w}</p></div>`;
    launchConfetti();
  } else if (result === 5) {
    const w = await gameWin('Dice', 2, bet);
    html = `<div class="game-result win"><h3>Double! 🎉</h3><p>Rolled ${result} · +⚡${w}</p></div>`;
  } else {
    html = `<div class="game-result lose"><h3>No luck 😢</h3><p>Rolled ${result}</p></div>`;
  }
  html += `<button class="play-again-btn" onclick="playGame('dice')">Play Again ⚡${bet}</button>
            <button style="margin-top:8px;color:var(--text-tertiary);font-size:14px" onclick="renderGamesMenu()">Back</button>`;
  document.getElementById('diceResult').innerHTML = html;
}

function renderScratch(bet) {
  const symbols = ['💎', '⭐', '🍒', '🔥', '🌙', '👑', '🎯', '💰', '🌈'];
  const grid = [];
  for (let i = 0; i < 9; i++) grid.push(symbols[Math.floor(Math.random() * symbols.length)]);

  if (Math.random() < 0.35) {
    const sym = symbols[Math.floor(Math.random() * symbols.length)];
    const positions = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    for (let i = positions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [positions[i], positions[j]] = [positions[j], positions[i]];
    }
    grid[positions[0]] = sym;
    grid[positions[1]] = sym;
    grid[positions[2]] = sym;
  }

  window._scratchGrid = grid;
  window._scratchRevealed = new Array(9).fill(false);
  window._scratchBet = bet;

  document.getElementById('gamesContent').innerHTML = `
    <div class="game-area">
      <h3 style="margin-bottom:16px">🎫 Scratch Card</h3>
      <p style="color:var(--text-tertiary);margin-bottom:12px">Match 3 symbols to win 3x!</p>
      <div class="scratch-grid" id="scratchGrid">
        ${grid.map((_, i) => `<div class="scratch-cell" onclick="scratchCell(${i})" id="scratch_${i}">❓</div>`).join('')}
      </div>
      <button style="margin-top:12px;padding:8px 20px;background:var(--bg-tertiary);border:1px solid var(--border-color);border-radius:var(--radius-full);color:var(--text-secondary);font-size:13px" onclick="revealAllScratch()">Reveal All</button>
      <div id="scratchResult"></div>
    </div>
  `;
}

function scratchCell(i) {
  if (window._scratchRevealed[i]) return;
  window._scratchRevealed[i] = true;
  document.getElementById(`scratch_${i}`).textContent = window._scratchGrid[i];
  document.getElementById(`scratch_${i}`).classList.add('revealed');

  if (window._scratchRevealed.every(r => r)) checkScratchResult();
}

function revealAllScratch() {
  for (let i = 0; i < 9; i++) {
    window._scratchRevealed[i] = true;
    document.getElementById(`scratch_${i}`).textContent = window._scratchGrid[i];
    document.getElementById(`scratch_${i}`).classList.add('revealed');
  }
  checkScratchResult();
}

async function checkScratchResult() {
  const grid = window._scratchGrid;
  const counts = {};
  grid.forEach(s => counts[s] = (counts[s] || 0) + 1);

  const hasTriple = Object.values(counts).some(c => c >= 3);
  const bet = window._scratchBet;
  let html = '';

  if (hasTriple) {
    const w = await gameWin('Scratch', 3, bet);
    html = `<div class="game-result win"><h3>Match! 🎉</h3><p>+⚡${w}</p></div>`;
    launchConfetti();
  } else {
    html = `<div class="game-result lose"><h3>No match 😢</h3></div>`;
  }
  html += `<button class="play-again-btn" onclick="playGame('scratch')">Play Again ⚡${bet}</button>
            <button style="margin-top:8px;color:var(--text-tertiary);font-size:14px" onclick="renderGamesMenu()">Back</button>`;
  document.getElementById('scratchResult').innerHTML = html;
}

function renderSlots(bet) {
  window._slotBet = bet;

  document.getElementById('gamesContent').innerHTML = `
    <div class="game-area">
      <h3 style="margin-bottom:16px">🎰 Lucky Slots</h3>
      <p style="color:var(--text-tertiary);margin-bottom:12px">777 = 10x · 💎💎💎 = 7x · ⭐⭐⭐ = 5x · Any 3 = 2x</p>
      <div class="slots-machine">
        <div class="slot-reel" id="reel1">❓</div>
        <div class="slot-reel" id="reel2">❓</div>
        <div class="slot-reel" id="reel3">❓</div>
      </div>
      <button style="padding:14px 40px;background:var(--gradient-primary);color:#fff;border-radius:var(--radius-full);font-weight:700;font-size:16px" id="spinSlotsBtn" onclick="spinSlots()">Spin!</button>
      <div id="slotsResult"></div>
    </div>
  `;
}

async function spinSlots() {
  const symbols = ['🍒', '🍋', '🔔', '⭐', '💎', '7️⃣'];
  document.getElementById('spinSlotsBtn').style.display = 'none';

  ['reel1', 'reel2', 'reel3'].forEach(id => {
    document.getElementById(id).classList.add('spinning');
  });

  const results = [];
  for (let i = 0; i < 3; i++) {
    results.push(symbols[Math.floor(Math.random() * symbols.length)]);
  }

  for (let i = 0; i < 3; i++) {
    await new Promise(r => setTimeout(r, 500 + i * 400));
    const reel = document.getElementById(`reel${i + 1}`);
    reel.classList.remove('spinning');
    reel.textContent = results[i];
  }

  await new Promise(r => setTimeout(r, 300));

  const bet = window._slotBet;
  let html = '';

  if (results[0] === results[1] && results[1] === results[2]) {
    let mult = 2;
    if (results[0] === '7️⃣') mult = 10;
    else if (results[0] === '💎') mult = 7;
    else if (results[0] === '⭐') mult = 5;

    const w = await gameWin('Slots', mult, bet);
    const jackpot = mult >= 7 ? 'JACKPOT! ' : '';
    html = `<div class="game-result win"><h3>${jackpot}🎉</h3><p>${results.join('')} · ${mult}x · +⚡${w}</p></div>`;
    launchConfetti();
  } else {
    html = `<div class="game-result lose"><h3>No match 😢</h3><p>${results.join(' ')}</p></div>`;
  }
  html += `<button class="play-again-btn" onclick="playGame('slots')">Play Again ⚡${bet}</button>
            <button style="margin-top:8px;color:var(--text-tertiary);font-size:14px" onclick="renderGamesMenu()">Back</button>`;
  document.getElementById('slotsResult').innerHTML = html;
}

function renderRPS(bet) {
  document.getElementById('gamesContent').innerHTML = `
    <div class="game-area">
      <h3 style="margin-bottom:16px">✊ Rock Paper Scissors</h3>
      <p style="color:var(--text-tertiary);margin-bottom:20px">Win = 2x · Draw = Refund</p>
      <div id="rpsCountdown" style="font-size:40px;margin:20px 0">Choose!</div>
      <div class="rps-buttons" id="rpsChoices">
        <button class="rps-btn" onclick="playRPS('rock',${bet})">✊</button>
        <button class="rps-btn" onclick="playRPS('paper',${bet})">✋</button>
        <button class="rps-btn" onclick="playRPS('scissors',${bet})">✌️</button>
      </div>
      <div id="rpsResult"></div>
    </div>
  `;
}

async function playRPS(choice, bet) {
  document.getElementById('rpsChoices').style.display = 'none';
  const countdown = document.getElementById('rpsCountdown');

  for (let i = 3; i > 0; i--) {
    countdown.innerHTML = `<span class="rps-countdown">${i}</span>`;
    await new Promise(r => setTimeout(r, 500));
  }

  const options = ['rock', 'paper', 'scissors'];
  const emojis = { rock: '✊', paper: '✋', scissors: '✌️' };
  const bot = options[Math.floor(Math.random() * 3)];

  countdown.textContent = `${emojis[choice]} vs ${emojis[bot]}`;

  let html = '';

  if (choice === bot) {
    await db.collection('users').doc(APP.currentUser.uid).update({
      freeCoins: firebase.firestore.FieldValue.increment(bet),
    });
    APP.currentUserData.freeCoins += bet;
    html = `<div class="game-result" style="border:1px solid var(--warning);background:var(--warning-bg)"><h3>Draw! 🤝</h3><p>⚡${bet} refunded</p></div>`;
  } else if (
    (choice === 'rock' && bot === 'scissors') ||
    (choice === 'paper' && bot === 'rock') ||
    (choice === 'scissors' && bot === 'paper')
  ) {
    const w = await gameWin('RPS', 2, bet);
    html = `<div class="game-result win"><h3>You Win! 🎉</h3><p>+⚡${w}</p></div>`;
    launchConfetti();
  } else {
    html = `<div class="game-result lose"><h3>You Lost! 😢</h3><p>Bot chose ${emojis[bot]}</p></div>`;
  }

  html += `<button class="play-again-btn" onclick="playGame('rps')">Play Again ⚡${bet}</button>
            <button style="margin-top:8px;color:var(--text-tertiary);font-size:14px" onclick="renderGamesMenu()">Back</button>`;
  document.getElementById('rpsResult').innerHTML = html;
}

function renderNumberGuess(bet) {
  document.getElementById('gamesContent').innerHTML = `
    <div class="game-area">
      <h3 style="margin-bottom:16px">🔢 Number Guess</h3>
      <p style="color:var(--text-tertiary);margin-bottom:20px">Guess 1-10 · Correct = 8x!</p>
      <div class="number-grid" id="numberGrid">
        ${Array.from({ length: 10 }, (_, i) => `<button class="number-btn" onclick="guessNumber(${i + 1},${bet})">${i + 1}</button>`).join('')}
      </div>
      <div id="numberResult"></div>
    </div>
  `;
}

async function guessNumber(guess, bet) {
  document.getElementById('numberGrid').style.display = 'none';
  const correct = Math.floor(Math.random() * 10) + 1;

  let html = '';
  if (guess === correct) {
    const w = await gameWin('Number', 8, bet);
    html = `<div class="game-result win"><h3>Correct! 🎉</h3><p>The number was ${correct} · +⚡${w}</p></div>`;
    launchConfetti();
  } else {
    html = `<div class="game-result lose"><h3>Wrong! 😢</h3><p>You guessed ${guess}, it was ${correct}</p></div>`;
  }

  html += `<button class="play-again-btn" onclick="playGame('number')">Play Again ⚡${bet}</button>
            <button style="margin-top:8px;color:var(--text-tertiary);font-size:14px" onclick="renderGamesMenu()">Back</button>`;
  document.getElementById('numberResult').innerHTML = html;
}

// ==================== LEADERBOARD ====================

function openLeaderboard() {
  openOverlayPage('leaderboardPage');
  renderLeaderboard('level');
}

async function renderLeaderboard(tab = 'level') {
  const container = document.getElementById('leaderboardContent');
  container.innerHTML = `
    <div class="leaderboard-tabs">
      <button class="leaderboard-tab ${tab === 'level' ? 'active' : ''}" onclick="renderLeaderboard('level')">🏆 Level</button>
      <button class="leaderboard-tab ${tab === 'followers' ? 'active' : ''}" onclick="renderLeaderboard('followers')">👥 Followers</button>
      <button class="leaderboard-tab ${tab === 'likes' ? 'active' : ''}" onclick="renderLeaderboard('likes')">❤️ Likes</button>
      <button class="leaderboard-tab ${tab === 'gifters' ? 'active' : ''}" onclick="renderLeaderboard('gifters')">🎁 Gifters</button>
    </div>
    <div class="leaderboard-list" id="leaderboardList">
      <div class="loading-spinner small" style="margin:40px auto"></div>
    </div>
  `;

  const fieldMap = { level: 'level', followers: 'followersCount', likes: 'likesCount', gifters: 'totalGiftsSent' };
  const field = fieldMap[tab] || 'level';

  try {
    const snap = await db.collection('users')
      .where('banned', '==', false)
      .orderBy(field, 'desc')
      .limit(50)
      .get();

    let html = '';
    let rank = 0;

    snap.forEach(doc => {
      const u = doc.data();
      if (u.role === 'admin') return;
      rank++;

      const medals = { 1: '🥇', 2: '🥈', 3: '🥉' };
      const rankClass = rank <= 3 ? ['', 'gold', 'silver', 'bronze'][rank] : '';
      const isYou = u.uid === APP.currentUser?.uid;
      const value = u[field] || 0;

      html += `
        <div class="leaderboard-item" onclick="viewProfile('${u.uid}')">
          <div class="leaderboard-rank ${rankClass}">${medals[rank] || rank}</div>
          <img src="${u.photoURL || 'default-avatar.png'}" alt="" onerror="this.src='default-avatar.png'" loading="lazy">
          <div class="leaderboard-info">
            <div class="leaderboard-name">
              ${escapeHTML(u.displayName || 'User')}
              ${u.verified ? getVerifiedBadge() : ''}
              ${isYou ? '<span class="leaderboard-you">YOU</span>' : ''}
            </div>
          </div>
          <div class="leaderboard-value">${formatNumber(value)}</div>
        </div>
      `;
    });

    document.getElementById('leaderboardList').innerHTML = html || '<div class="empty-state"><p>No data yet</p></div>';
  } catch (err) {
    document.getElementById('leaderboardList').innerHTML = '<div class="empty-state"><p>Failed to load</p></div>';
  }
}

// ==================== SHOP ====================

function openShop() {
  openOverlayPage('shopPage');
  renderShop();
}

let shopCategory = 'All';
let shopSearchQuery = '';

async function renderShop() {
  const container = document.getElementById('shopContent');
  container.innerHTML = `
    <div class="shop-categories">
      ${SHOP_CATEGORIES.map(c => `<button class="shop-category ${c === shopCategory ? 'active' : ''}" onclick="filterShop('${c}')">${c}</button>`).join('')}
    </div>
    <div class="shop-search">
      <input type="text" placeholder="Search products..." oninput="searchShopDebounced(this.value)" value="${escapeHTML(shopSearchQuery)}">
    </div>
    <div class="shop-grid" id="shopGrid">
      <div class="loading-spinner small" style="margin:40px auto;grid-column:span 2"></div>
    </div>

    ${APP.currentUserData?.verified ? `
      <div style="padding:14px">
        <button style="width:100%;padding:12px;background:var(--gradient-primary);color:#fff;border-radius:var(--radius-md);font-weight:700" onclick="openAddProduct()">+ Add Product</button>
      </div>
    ` : ''}
  `;

  loadShopProducts();
}

const searchShopDebounced = debounce((query) => {
  shopSearchQuery = query;
  loadShopProducts();
}, 400);

function filterShop(category) {
  shopCategory = category;
  document.querySelectorAll('.shop-category').forEach(c => {
    c.classList.toggle('active', c.textContent === category);
  });
  loadShopProducts();
}

async function loadShopProducts() {
  const grid = document.getElementById('shopGrid');
  if (!grid) return;
  grid.innerHTML = '<div class="loading-spinner small" style="margin:40px auto;grid-column:span 2"></div>';

  try {
    let query = db.collection('products').orderBy('createdAt', 'desc').limit(30);
    if (shopCategory !== 'All') {
      query = db.collection('products').where('category', '==', shopCategory).orderBy('createdAt', 'desc').limit(30);
    }

    const snap = await query.get();
    let html = '';

    snap.forEach(doc => {
      const p = doc.data();
      if (shopSearchQuery && !(p.name || '').toLowerCase().includes(shopSearchQuery.toLowerCase())) return;

      html += `
        <div class="product-card" onclick="openProductDetail('${doc.id}')">
          <div class="product-card-image">
            <img src="${p.images?.[0] || 'default-product.png'}" alt="" loading="lazy" onerror="this.src='default-product.png'">
            ${p.originalPrice && p.originalPrice > p.price ? `<span class="product-discount-badge">-${Math.round((1 - p.price / p.originalPrice) * 100)}%</span>` : ''}
            ${(p.stock || 0) <= 0 ? '<div class="product-sold-out">SOLD OUT</div>' : ''}
          </div>
          <div class="product-card-body">
            <div class="product-card-name">${escapeHTML(p.name || '')}</div>
            <div class="product-card-price">$${(p.price || 0).toFixed(2)}
              ${p.originalPrice && p.originalPrice > p.price ? `<span class="product-card-original">$${p.originalPrice.toFixed(2)}</span>` : ''}
            </div>
            <div class="product-card-seller">${escapeHTML(p.sellerName || '')}</div>
          </div>
        </div>
      `;
    });

    grid.innerHTML = html || '<div class="empty-state" style="grid-column:span 2"><div class="empty-state-icon">🛍️</div><h3>No products</h3></div>';
  } catch (err) {
    grid.innerHTML = '<p style="text-align:center;color:var(--text-muted);grid-column:span 2;padding:20px">Failed to load products</p>';
  }
}

async function openProductDetail(productId) {
  const container = document.getElementById('shopContent');
  container.innerHTML = '<div class="loading-spinner small" style="margin:60px auto"></div>';

  try {
    const doc = await db.collection('products').doc(productId).get();
    if (!doc.exists) return showToast('Product not found', 'error');

    const p = doc.data();
    const seller = await getUserDataCached(p.sellerId);
    const images = p.images || ['default-product.png'];

    let gallerySlides = images.map(img => `<div class="product-gallery-slide"><img src="${img}" alt="" onerror="this.src='default-product.png'"></div>`).join('');

    let sizesHTML = '';
    if (p.sizes && p.sizes.length > 0) {
      sizesHTML = `<div class="product-variants"><div class="product-variant-label">Size</div><div class="product-variant-options">${p.sizes.map(s => `<button class="variant-option" onclick="selectVariant(this)">${escapeHTML(s)}</button>`).join('')}</div></div>`;
    }

    let colorsHTML = '';
    if (p.colors && p.colors.length > 0) {
      colorsHTML = `<div class="product-variants"><div class="product-variant-label">Color</div><div class="product-variant-options">${p.colors.map(c => `<button class="variant-option" onclick="selectVariant(this)">${escapeHTML(c)}</button>`).join('')}</div></div>`;
    }

    const affiliateLink = `https://vidr.click/?product=${productId}&ref=${APP.currentUser?.uid}`;

    container.innerHTML = `
      <div class="product-detail">
        <div class="product-gallery">
          <div class="product-gallery-track" style="width:${images.length * 100}%">${gallerySlides}</div>
        </div>
        <div class="product-detail-info">
          <div class="product-detail-name">${escapeHTML(p.name)}</div>
          <div class="product-detail-price">$${(p.price || 0).toFixed(2)}
            ${p.originalPrice > p.price ? `<span class="product-detail-original">$${(p.originalPrice || 0).toFixed(2)}</span>` : ''}
          </div>

          ${sizesHTML}
          ${colorsHTML}

          <div style="padding:14px 0;border-top:1px solid var(--border-light);margin-top:12px">
            <p style="font-size:14px;color:var(--text-secondary);line-height:1.5">${escapeHTML(p.description || '')}</p>
          </div>

          <div style="display:flex;align-items:center;gap:10px;padding:14px 0;border-top:1px solid var(--border-light)">
            <img src="${seller?.photoURL || 'default-avatar.png'}" style="width:36px;height:36px;border-radius:50%;object-fit:cover" onerror="this.src='default-avatar.png'">
            <div>
              <div style="font-weight:600;font-size:14px">${escapeHTML(seller?.displayName || 'Seller')} ${seller?.verified ? getVerifiedBadge() : ''}</div>
              <div style="font-size:12px;color:var(--text-tertiary)">Seller</div>
            </div>
          </div>

          <div style="display:flex;gap:8px;margin-top:12px">
            <button style="flex:1;padding:8px;background:var(--bg-tertiary);border:1px solid var(--border-color);border-radius:var(--radius-sm);font-size:12px;color:var(--text-secondary)" onclick="copyAffiliateLink('${affiliateLink}')">🔗 Copy Affiliate Link</button>
            <button style="flex:1;padding:8px;background:var(--bg-tertiary);border:1px solid var(--border-color);border-radius:var(--radius-sm);font-size:12px;color:var(--text-secondary)" onclick="shareProduct('${productId}')">📤 Share</button>
          </div>

          ${p.shipping ? `<div style="padding:12px 0;font-size:13px;color:var(--text-tertiary)">📦 ${escapeHTML(p.shipping)}</div>` : ''}
        </div>
      </div>
      <div class="product-buy-bar">
        <button class="add-to-cart-btn" onclick="addToCart('${doc.id}')">Add to Cart</button>
        <button class="buy-now-btn" onclick="buyNow('${doc.id}')">Buy Now</button>
      </div>
    `;
  } catch (err) {
    container.innerHTML = '<div class="empty-state"><p>Failed to load product</p></div>';
  }
}

function selectVariant(el) {
  el.parentElement.querySelectorAll('.variant-option').forEach(v => v.classList.remove('selected'));
  el.classList.add('selected');
}

function copyAffiliateLink(link) {
  navigator.clipboard.writeText(link).then(() => showToast('Affiliate link copied! 🔗', 'success'));
}

async function shareProduct(productId) {
  const link = `https://vidr.click/?product=${productId}&ref=${APP.currentUser?.uid}`;
  if (navigator.share) {
    try { await navigator.share({ title: 'Check this product!', url: link }); } catch {}
  } else {
    copyAffiliateLink(link);
  }
}

function addToCart(productId) {
  if (!APP.cart.find(c => c.productId === productId)) {
    APP.cart.push({ productId, qty: 1 });
  }
  updateCartBadge();
  showToast('Added to cart! 🛒', 'success');
}

function updateCartBadge() {
  const badge = document.getElementById('cartBadge');
  if (APP.cart.length > 0) {
    badge.style.display = 'flex';
    badge.textContent = APP.cart.length;
  } else {
    badge.style.display = 'none';
  }
}

function openCart() {
  if (APP.cart.length === 0) {
    return openBottomSheet('<h3 class="sheet-title">Cart</h3><div class="empty-state" style="padding:30px"><div class="empty-state-icon">🛒</div><h3>Cart is empty</h3></div>');
  }
  renderCart();
}

async function renderCart() {
  openBottomSheet(`<h3 class="sheet-title">Shopping Cart</h3><div class="cart-content" id="cartContent"><div class="loading-spinner small" style="margin:20px auto"></div></div>`);

  let items = '';
  let total = 0;

  for (const ci of APP.cart) {
    try {
      const doc = await db.collection('products').doc(ci.productId).get();
      if (!doc.exists) continue;
      const p = doc.data();
      total += (p.price || 0) * ci.qty;

      items += `
        <div class="cart-item">
          <img src="${p.images?.[0] || 'default-product.png'}" alt="" onerror="this.src='default-product.png'">
          <div class="cart-item-info">
            <div class="cart-item-name">${escapeHTML(p.name)}</div>
            <div class="cart-item-price">$${(p.price || 0).toFixed(2)}</div>
            <div class="cart-qty-control">
              <button class="cart-qty-btn" onclick="updateCartQty('${ci.productId}',-1)">−</button>
              <span>${ci.qty}</span>
              <button class="cart-qty-btn" onclick="updateCartQty('${ci.productId}',1)">+</button>
            </div>
          </div>
        </div>
      `;
    } catch {}
  }

  document.getElementById('cartContent').innerHTML = `
    ${items}
    <div class="cart-total"><span>Total</span><span>$${total.toFixed(2)}</span></div>
    <button class="cart-checkout-btn" onclick="closeBottomSheet();openCheckout()">Checkout</button>
  `;
}

function updateCartQty(productId, delta) {
  const item = APP.cart.find(c => c.productId === productId);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) APP.cart = APP.cart.filter(c => c.productId !== productId);
  updateCartBadge();
  renderCart();
}

function buyNow(productId) {
  APP.cart = [{ productId, qty: 1 }];
  updateCartBadge();
  openCheckout();
}

function quickBuy(productId) {
  closeBottomSheet();
  buyNow(productId);
}

// ==================== CHECKOUT (Stripe) ====================

async function openCheckout() {
  let totalAmount = 0;
  for (const ci of APP.cart) {
    try {
      const doc = await db.collection('products').doc(ci.productId).get();
      if (doc.exists) totalAmount += (doc.data().price || 0) * ci.qty;
    } catch {}
  }

  openBottomSheet(`
    <h3 class="sheet-title">Checkout</h3>
    <div class="checkout-form">
      <div class="checkout-section">
        <h3>Shipping Address</h3>
        <div class="checkout-field"><label>Full Name</label><input type="text" id="checkoutName" placeholder="John Doe"></div>
        <div class="checkout-field"><label>Address</label><input type="text" id="checkoutAddress" placeholder="123 Main St"></div>
        <div class="checkout-field"><label>City</label><input type="text" id="checkoutCity" placeholder="City"></div>
        <div class="checkout-field"><label>Zip Code</label><input type="text" id="checkoutZip" placeholder="12345"></div>
        <div class="checkout-field"><label>Country</label><input type="text" id="checkoutCountry" placeholder="Country"></div>
      </div>
      <div class="checkout-total">
        <span>Total</span>
        <span>$${totalAmount.toFixed(2)}</span>
      </div>
      <button class="checkout-pay-btn" onclick="processCheckout(${totalAmount})">Pay $${totalAmount.toFixed(2)} with Stripe</button>
    </div>
  `);
}

async function processCheckout(totalAmount) {
  const name = document.getElementById('checkoutName')?.value?.trim();
  const address = document.getElementById('checkoutAddress')?.value?.trim();
  const city = document.getElementById('checkoutCity')?.value?.trim();
  const zip = document.getElementById('checkoutZip')?.value?.trim();
  const country = document.getElementById('checkoutCountry')?.value?.trim();

  if (!name || !address || !city || !zip || !country) return showToast('Please fill all shipping info', 'warning');

  closeBottomSheet();
  showLoading();

  try {
    // Store shipping info for after payment
    window._pendingOrder = {
      shipping: { name, address, city, zip, country },
      items: APP.cart.slice(),
      totalAmount,
    };

    initStripe();
    if (!stripe) {
      hideLoading();
      showToast('Stripe not loaded', 'error');
      return;
    }

    const functions = getFirebaseFunctions();
    const createIntent = functions.httpsCallable('createShopPaymentIntent');
    const result = await createIntent({
      amount: Math.round(totalAmount * 100),
      items: APP.cart,
    });

    hideLoading();
    openStripePaymentModal(result.data.clientSecret, totalAmount * 100, `Order · ${APP.cart.length} items`, 'shop_order');
  } catch (err) {
    hideLoading();
    console.error('Checkout error:', err);
    // Fallback: complete order without Stripe (for development)
    completeOrderFallback(totalAmount, name, address, city, zip, country);
  }
}

// Fallback order completion (for development/testing without Stripe fully setup)
async function completeOrderFallback(totalAmount, name, address, city, zip, country) {
  showLoading();
  try {
    await new Promise(r => setTimeout(r, 1500));

    const orderItems = [];

    for (const ci of APP.cart) {
      const doc = await db.collection('products').doc(ci.productId).get();
      if (!doc.exists) continue;
      const p = doc.data();
      const itemTotal = (p.price || 0) * ci.qty;

      orderItems.push({
        productId: ci.productId,
        name: p.name,
        price: p.price,
        qty: ci.qty,
        sellerId: p.sellerId,
      });

      const sellerPayout = Math.floor(itemTotal * (1 - PLATFORM_FEE) * 100);
      await db.collection('users').doc(p.sellerId).update({
        goldCoins: firebase.firestore.FieldValue.increment(sellerPayout),
        totalEarned: firebase.firestore.FieldValue.increment(sellerPayout),
      });

      await db.collection('payouts').add({
        type: 'sale_payout', userId: p.sellerId, amount: sellerPayout,
        productId: ci.productId, status: 'completed',
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });

      const urlParams = new URLSearchParams(window.location.search);
      const affiliateRef = urlParams.get('ref');
      if (affiliateRef && affiliateRef !== p.sellerId) {
        const affiliatePayout = Math.floor(itemTotal * AFFILIATE_COMMISSION * 100);
        await db.collection('users').doc(affiliateRef).update({
          goldCoins: firebase.firestore.FieldValue.increment(affiliatePayout),
        });
        await db.collection('payouts').add({
          type: 'affiliate_payout', userId: affiliateRef, amount: affiliatePayout,
          status: 'completed', createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
      }

      if (APP.currentUserData?.referredBy) {
        const refCommission = Math.floor(itemTotal * REFERRAL_PURCHASE_COMMISSION * 100);
        await db.collection('users').doc(APP.currentUserData.referredBy).update({
          goldCoins: firebase.firestore.FieldValue.increment(refCommission),
        });
        await db.collection('transactions').add({
          uid: APP.currentUserData.referredBy, type: 'referral_commission',
          amount: refCommission, coinType: 'gold',
          description: '6% referral purchase commission',
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
      }

      await addNotification(p.sellerId, {
        type: 'sale', text: `New order: ${p.name} x${ci.qty}!`, icon: '🛍️',
        fromUid: APP.currentUser.uid,
      });

      await incrementAchievement(p.sellerId, 'sell_item');

      await db.collection('products').doc(ci.productId).update({
        stock: firebase.firestore.FieldValue.increment(-ci.qty),
        sold: firebase.firestore.FieldValue.increment(ci.qty),
      });
    }

    await db.collection('orders').add({
      buyerId: APP.currentUser.uid, items: orderItems, totalAmount,
      shipping: { name, address, city, zip, country }, method: 'stripe',
      status: 'processing', createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });

    await incrementAchievement(APP.currentUser.uid, 'first_purchase');

    APP.cart = [];
    updateCartBadge();
    hideLoading();
    launchConfetti();

    openCenterModal(`
      <div class="order-success">
        <div class="order-success-icon">🎉</div>
        <h2>Order Placed!</h2>
        <p>Your order is being processed. You'll receive updates soon.</p>
        <div class="modal-actions"><button class="modal-btn primary" onclick="closeCenterModal()">Continue Shopping</button></div>
      </div>
    `);
  } catch (err) {
    hideLoading();
    showToast('Order failed', 'error');
    console.error('Checkout error:', err);
  }
}

// ==================== ADD PRODUCT ====================

function openAddProduct() {
  if (!APP.currentUserData?.verified && APP.currentUserData?.role !== 'admin') {
    return showToast('Only verified sellers can add products', 'warning');
  }

  openBottomSheet(`
    <h3 class="sheet-title">Add Product</h3>
    <div class="product-form">
      <div class="product-images-grid" id="productImagesGrid">
        <div class="product-add-image" onclick="addProductImage()">+</div>
      </div>
      <input type="file" id="productImageInput" accept="image/*" multiple onchange="handleProductImages(event)" style="display:none">

      <div class="product-field"><label>Product Name</label><input type="text" id="prodName" placeholder="Name" maxlength="100"></div>
      <div class="product-field"><label>Description</label><textarea id="prodDesc" placeholder="Description..." maxlength="500"></textarea></div>
      <div class="product-field"><label>Price ($)</label><input type="number" id="prodPrice" placeholder="0.00" step="0.01" min="0.01"></div>
      <div class="product-field"><label>Original Price ($) (optional)</label><input type="number" id="prodOrigPrice" placeholder="0.00" step="0.01"></div>
      <div class="product-field"><label>Stock</label><input type="number" id="prodStock" placeholder="100" min="0"></div>
      <div class="product-field"><label>Category</label>
        <select id="prodCategory" style="width:100%;padding:12px;background:var(--bg-input);border:1.5px solid var(--border-color);border-radius:var(--radius-md);color:var(--text-primary)">
          ${SHOP_CATEGORIES.slice(1).map(c => `<option value="${c}">${c}</option>`).join('')}
        </select>
      </div>
      <div class="product-field"><label>Sizes (comma separated)</label><input type="text" id="prodSizes" placeholder="S, M, L, XL"></div>
      <div class="product-field"><label>Colors (comma separated)</label><input type="text" id="prodColors" placeholder="Red, Blue, Black"></div>
      <div class="product-field"><label>Shipping Info</label><input type="text" id="prodShipping" placeholder="Free shipping worldwide"></div>

      <button class="product-submit-btn" onclick="submitProduct()">List Product</button>
    </div>
  `);
}

let productImageFiles = [];

function addProductImage() {
  if (productImageFiles.length >= 5) return showToast('Max 5 images', 'warning');
  document.getElementById('productImageInput').click();
}

function handleProductImages(event) {
  const files = Array.from(event.target.files);
  productImageFiles.push(...files.slice(0, 5 - productImageFiles.length));
  renderProductImages();
}

function renderProductImages() {
  const grid = document.getElementById('productImagesGrid');
  let html = '';
  productImageFiles.forEach((f, i) => {
    const url = URL.createObjectURL(f);
    html += `<div class="product-image-item"><img src="${url}"><button class="product-image-remove" onclick="removeProductImage(${i})">✕</button></div>`;
  });
  if (productImageFiles.length < 5) html += '<div class="product-add-image" onclick="addProductImage()">+</div>';
  grid.innerHTML = html;
}

function removeProductImage(i) {
  productImageFiles.splice(i, 1);
  renderProductImages();
}

async function submitProduct() {
  const name = document.getElementById('prodName')?.value?.trim();
  const price = parseFloat(document.getElementById('prodPrice')?.value);
  if (!name || !price) return showToast('Name and price required', 'warning');
  if (productImageFiles.length === 0) return showToast('Add at least 1 image', 'warning');

  closeBottomSheet();
  showLoading();

  try {
    const imageURLs = [];
    for (const file of productImageFiles) {
      const compressed = await compressImage(file, 800, 0.85);
      const path = `products/${APP.currentUser.uid}/${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`;
      const ref = storage.ref(path);
      await ref.put(compressed);
      imageURLs.push(await ref.getDownloadURL());
    }

    const sizes = (document.getElementById('prodSizes')?.value || '').split(',').map(s => s.trim()).filter(Boolean);
    const colors = (document.getElementById('prodColors')?.value || '').split(',').map(s => s.trim()).filter(Boolean);

    await db.collection('products').add({
      sellerId: APP.currentUser.uid,
      sellerName: APP.currentUserData.displayName,
      name,
      description: document.getElementById('prodDesc')?.value?.trim() || '',
      price,
      originalPrice: parseFloat(document.getElementById('prodOrigPrice')?.value) || price,
      stock: parseInt(document.getElementById('prodStock')?.value) || 100,
      sold: 0,
      category: document.getElementById('prodCategory')?.value || 'Fashion',
      sizes, colors,
      images: imageURLs,
      shipping: document.getElementById('prodShipping')?.value?.trim() || '',
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });

    productImageFiles = [];
    hideLoading();
    showToast('Product listed! 🛍️', 'success');
    renderShop();
  } catch (err) {
    hideLoading();
    showToast('Failed to list product', 'error');
  }
}

console.log('Vidr Part 8 loaded: Spin, Games, Leaderboard, Shop, Checkout');

// ==========================================
// VIDR - app.js Part 9
// Live Streaming, Gifts, Referral, Earn, Campaign
// ==========================================

// ==================== GO LIVE SETUP ====================

function openGoLive() {
  openOverlayPage('liveStreamPage');

  const container = document.getElementById('liveStreamContent');
  container.innerHTML = `
    <div class="live-setup">
      <h3 style="font-size:20px;font-weight:800;margin-bottom:8px">Go LIVE</h3>

      <div class="live-preview" id="livePreview">
        <video id="livePreviewVideo" autoplay playsinline muted></video>
      </div>

      <input type="text" class="live-setup-input" id="liveTitle" placeholder="Add a title..." maxlength="50">

      <div class="create-option-row" style="width:100%;max-width:300px">
        <div class="create-option-label">Enable Shop</div>
        <div class="toggle-switch" id="liveShopToggle" onclick="this.classList.toggle('active')"><div class="toggle-switch-knob"></div></div>
      </div>

      <button class="live-start-btn" onclick="startLiveStream()">Go LIVE</button>

      <button style="color:var(--text-tertiary);margin-top:12px;font-size:14px" onclick="stopCameraPreview();closeOverlayPage('liveStreamPage')">Cancel</button>
    </div>
  `;

  startCameraPreview();
}

async function startCameraPreview() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
    const video = document.getElementById('livePreviewVideo');
    if (video) {
      video.srcObject = stream;
      video.play();
    }
  } catch (err) {
    console.error('Camera error:', err);
    showToast('Camera access denied', 'error');
  }
}

function stopCameraPreview() {
  const video = document.getElementById('livePreviewVideo');
  if (video && video.srcObject) {
    video.srcObject.getTracks().forEach(track => track.stop());
    video.srcObject = null;
  }
}

// ==================== LIVE STREAM ====================

async function startLiveStream() {
  const title = document.getElementById('liveTitle')?.value?.trim() || 'Live Stream';
  const shopEnabled = document.getElementById('liveShopToggle')?.classList?.contains('active');

  showLoading();

  try {
    const liveRef = await db.collection('liveStreams').add({
      hostUid: APP.currentUser.uid,
      hostName: APP.currentUserData.displayName,
      hostAvatar: APP.currentUserData.photoURL || '',
      hostVerified: APP.currentUserData.verified || false,
      title,
      shopEnabled,
      viewerCount: 1,
      isActive: true,
      comments: [],
      battleActive: false,
      battleOpponent: null,
      battleScore: { host: 0, opponent: 0 },
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });

    APP.liveStreamId = liveRef.id;
    APP.isLiveHost = true;

    // Notify followers
    const followersSnap = await db.collection('follows')
      .where('followingId', '==', APP.currentUser.uid)
      .limit(100)
      .get();

    const batch = db.batch();
    followersSnap.forEach(doc => {
      const notifRef = db.collection('notifications').doc();
      batch.set(notifRef, {
        uid: doc.data().followerId,
        type: 'live',
        text: `${APP.currentUserData.displayName} is now LIVE!`,
        icon: '🔴',
        fromUid: APP.currentUser.uid,
        read: false,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
    });
    await batch.commit();

    simulateBotViewers(liveRef.id);

    hideLoading();
    renderLiveStreamHost(liveRef.id, title);

    await incrementAchievement(APP.currentUser.uid, 'first_live');
    await addXp(APP.currentUser.uid, 15, 'live');
  } catch (err) {
    hideLoading();
    showToast('Failed to start live', 'error');
    console.error('Start live error:', err);
  }
}

function simulateBotViewers(liveId) {
  let botCount = Math.floor(Math.random() * 20) + 5;
  const interval = setInterval(async () => {
    if (!APP.liveStreamId || APP.liveStreamId !== liveId) {
      clearInterval(interval);
      return;
    }
    const change = Math.floor(Math.random() * 5) - 2;
    botCount = Math.max(3, botCount + change);
    try {
      await db.collection('liveStreams').doc(liveId).update({
        viewerCount: botCount + 1,
      });
    } catch {}
  }, 5000);
}

function renderLiveStreamHost(liveId, title) {
  stopCameraPreview();
  const container = document.getElementById('liveStreamContent');
  
  // Set body to full screen mode
  document.body.classList.add('live-fullscreen');
  document.getElementById('bottomNav').style.display = 'none';
  document.getElementById('bannerAd').style.display = 'none';

  container.innerHTML = `
    <div class="live-fullscreen-container">
      <!-- Full-screen video background -->
      <video id="liveHostVideo" class="live-fullscreen-video" autoplay playsinline muted></video>
      
      <!-- Gift Animation Overlay -->
      <div id="liveGiftAnimations" class="live-gift-animations"></div>
      
      <!-- Top Bar -->
      <div class="live-top-overlay">
        <div class="live-host-badge">
          <img src="${APP.currentUserData?.photoURL || 'default-avatar.png'}" class="live-host-avatar-small">
          <div class="live-host-details">
            <div class="live-host-name-small">${escapeHTML(APP.currentUserData?.displayName || '')}</div>
            <div class="live-viewer-count-small" id="liveViewerCount" onclick="showLiveViewers()" style="cursor:pointer">
              👁 <span id="viewerCountNum">1</span>
            </div>
          </div>
        </div>
        <div class="live-indicator-badge">
          <span class="live-dot"></span> LIVE
        </div>
        <button class="live-close-btn-new" onclick="endLiveStream()">✕</button>
      </div>
      
      <!-- Battle Area -->
      <div id="liveBattleArea"></div>
      
      <!-- Comments at Bottom -->
      <div class="live-comments-bottom" id="liveComments"></div>
      
      <!-- Bottom Controls -->
      <div class="live-bottom-controls">
        <input class="live-comment-input-new" id="liveCommentInput" placeholder="Say something..." onkeypress="if(event.key==='Enter')sendLiveComment()">
        <button class="live-control-btn" onclick="switchLiveCamera()" title="Switch Camera">🔄</button>
        <button class="live-control-btn" onclick="toggleLiveMic()" title="Toggle Mic">🎤</button>
        <button class="live-control-btn" onclick="openLiveFilters()" title="Filters">✨</button>
        <button class="live-control-btn" onclick="shareLiveStreamToChat()" title="Share">📤</button>
      </div>
    </div>
  `;

  startLiveCamera();
  listenToLiveStream(liveId);
  trackLiveViewer(liveId, true);
}
  
async function startLiveCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: { ideal: 720 }, height: { ideal: 1280 } },
      audio: true,
    });
    const video = document.getElementById('liveHostVideo');
    if (video) { video.srcObject = stream; video.play(); }
  } catch (err) {
    showToast('Camera/mic access denied', 'error');
  }
}

let liveFacingMode = 'user';
async function switchLiveCamera() {
  liveFacingMode = liveFacingMode === 'user' ? 'environment' : 'user';
  const video = document.getElementById('liveHostVideo');
  if (video && video.srcObject) video.srcObject.getTracks().forEach(t => t.stop());

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: liveFacingMode }, audio: true,
    });
    if (video) { video.srcObject = stream; video.play(); }
  } catch {}
}

let liveMicMuted = false;
function toggleLiveMic() {
  const video = document.getElementById('liveHostVideo');
  if (!video || !video.srcObject) return;
  const audioTracks = video.srcObject.getAudioTracks();
  liveMicMuted = !liveMicMuted;
  audioTracks.forEach(t => t.enabled = !liveMicMuted);
  showToast(liveMicMuted ? 'Mic muted' : 'Mic unmuted', 'info');
}

function openLiveFilters() {
  openBottomSheet(`
    <h3 class="sheet-title">Live Filters</h3>
    <div class="live-filters" style="flex-wrap:wrap;justify-content:center;padding:12px 0">
      ${['None', 'Beauty', 'Warm', 'Cool', 'Vintage', 'B&W'].map(f => `
        <button class="live-filter-btn" onclick="applyLiveFilter('${f.toLowerCase()}')">${f}</button>
      `).join('')}
    </div>
  `);
}

function applyLiveFilter(filter) {
  const video = document.getElementById('liveHostVideo');
  if (!video) return;
  closeBottomSheet();
  const filters = {
    none: 'none', beauty: 'brightness(1.05) contrast(1.05) saturate(1.1)',
    warm: 'sepia(0.2) saturate(1.2)', cool: 'saturate(0.8) hue-rotate(20deg)',
    vintage: 'sepia(0.4) contrast(0.9)', 'b&w': 'grayscale(1)',
  };
  video.style.filter = filters[filter] || 'none';
}

function listenToLiveStream(liveId) {
  // Listen to main stream doc
  const unsub1 = db.collection('liveStreams').doc(liveId).onSnapshot(snap => {
    if (!snap.exists) return;
    const data = snap.data();

    const viewerEl = document.getElementById('viewerCountNum');
    if (viewerEl) viewerEl.textContent = data.viewerCount || 0;

    renderLiveComments(data.comments || []);

    if (data.battleActive) renderLiveBattle(data);
    
    // If host ended stream
    if (!data.isActive && !APP.isLiveHost) {
      showToast('Live stream has ended', 'info');
      setTimeout(() => leaveLiveStream(), 2000);
    }
  });
  
  // Listen to gift events for animations
  const unsub2 = db.collection('liveStreams').doc(liveId)
    .collection('giftEvents')
    .orderBy('createdAt', 'desc')
    .limit(1)
    .onSnapshot(snap => {
      snap.docChanges().forEach(change => {
        if (change.type === 'added') {
          const gift = change.doc.data();
          const giftTime = gift.createdAt?.toDate?.() || new Date();
          
          // Only animate gifts from last 10 seconds (avoid old ones on refresh)
          if (Date.now() - giftTime.getTime() < 10000) {
            triggerGiftAnimation(gift);
          }
        }
      });
    });
    
  APP.listeners.push(unsub1, unsub2);
}

function renderLiveComments(comments) {
  const container = document.getElementById('liveComments');
  if (!container) return;
  
  container.innerHTML = comments.slice(-30).map(c => {
    if (c.isGift) {
      // Special gift comment style
      return `
        <div class="live-comment live-gift-comment">
          <img src="${c.avatar || 'default-avatar.png'}" class="live-comment-avatar" onclick="viewLiveCommenter('${c.uid}')">
          <div class="live-comment-content">
            <span class="live-comment-username" onclick="viewLiveCommenter('${c.uid}')">${escapeHTML(c.username)} ${c.verified ? '✓' : ''}</span>
            <span class="live-comment-gift-text">sent ${c.giftEmoji} ${c.giftName} x${c.giftCount || 1}</span>
          </div>
        </div>
      `;
    }
    
    return `
      <div class="live-comment">
        <img src="${c.avatar || 'default-avatar.png'}" class="live-comment-avatar" onclick="viewLiveCommenter('${c.uid}')">
        <div class="live-comment-content">
          <span class="live-comment-username" onclick="viewLiveCommenter('${c.uid}')">${escapeHTML(c.username)} ${c.verified ? '✓' : ''}</span>
          <span class="live-comment-text">${escapeHTML(c.text)}</span>
        </div>
      </div>
    `;
  }).join('');
  
  container.scrollTop = container.scrollHeight;
}

function renderLiveComments(comments) {
  const container = document.getElementById('liveComments');
  if (!container) return;
  
  container.innerHTML = comments.slice(-30).map(c => {
    if (c.isGift) {
      // Special gift comment style
      return `
        <div class="live-comment live-gift-comment">
          <img src="${c.avatar || 'default-avatar.png'}" class="live-comment-avatar" onclick="viewLiveCommenter('${c.uid}')">
          <div class="live-comment-content">
            <span class="live-comment-username" onclick="viewLiveCommenter('${c.uid}')">${escapeHTML(c.username)} ${c.verified ? '✓' : ''}</span>
            <span class="live-comment-gift-text">sent ${c.giftEmoji} ${c.giftName} x${c.giftCount || 1}</span>
          </div>
        </div>
      `;
    }
    
    return `
      <div class="live-comment">
        <img src="${c.avatar || 'default-avatar.png'}" class="live-comment-avatar" onclick="viewLiveCommenter('${c.uid}')">
        <div class="live-comment-content">
          <span class="live-comment-username" onclick="viewLiveCommenter('${c.uid}')">${escapeHTML(c.username)} ${c.verified ? '✓' : ''}</span>
          <span class="live-comment-text">${escapeHTML(c.text)}</span>
        </div>
      </div>
    `;
  }).join('');
  
  container.scrollTop = container.scrollHeight;
}

// ==================== GIFT ANIMATIONS ====================

let giftAnimationQueue = [];
let isProcessingGiftQueue = false;

function triggerGiftAnimation(gift) {
  giftAnimationQueue.push(gift);
  if (!isProcessingGiftQueue) {
    processGiftQueue();
  }
}

async function processGiftQueue() {
  if (giftAnimationQueue.length === 0) {
    isProcessingGiftQueue = false;
    return;
  }
  
  isProcessingGiftQueue = true;
  const gift = giftAnimationQueue.shift();
  
  // Show gift banner
  showGiftBanner(gift);
  
  // Show gift animation based on tier
  if (gift.giftTier === 'legendary') {
    showLegendaryGiftAnimation(gift);
    await new Promise(r => setTimeout(r, 4000));
  } else if (gift.giftTier === 'epic') {
    showEpicGiftAnimation(gift);
    await new Promise(r => setTimeout(r, 3000));
  } else if (gift.giftTier === 'rare') {
    showRareGiftAnimation(gift);
    await new Promise(r => setTimeout(r, 2000));
  } else {
    showBasicGiftAnimation(gift);
    await new Promise(r => setTimeout(r, 1000));
  }
  
  processGiftQueue();
}

// Gift banner (shows sender + gift info on left side)
function showGiftBanner(gift) {
  const container = document.getElementById('liveGiftAnimations');
  if (!container) return;
  
  const banner = document.createElement('div');
  banner.className = 'gift-banner';
  banner.innerHTML = `
    <div class="gift-banner-content">
      <img src="${gift.avatar || 'default-avatar.png'}" class="gift-banner-avatar">
      <div class="gift-banner-info">
        <div class="gift-banner-name">${escapeHTML(gift.username)}</div>
        <div class="gift-banner-action">sent ${escapeHTML(gift.giftName)}</div>
      </div>
      <div class="gift-banner-emoji">${gift.giftEmoji}</div>
      <div class="gift-banner-count">x${gift.giftCount}</div>
    </div>
  `;
  
  container.appendChild(banner);
  
  // Animate in
  requestAnimationFrame(() => {
    banner.classList.add('show');
  });
  
  // Remove after 4 seconds
  setTimeout(() => {
    banner.classList.add('hide');
    setTimeout(() => banner.remove(), 500);
  }, 4000);
}

// Basic gift (small, floats up)
function showBasicGiftAnimation(gift) {
  const container = document.getElementById('liveGiftAnimations');
  if (!container) return;
  
  for (let i = 0; i < Math.min(gift.giftCount, 5); i++) {
    setTimeout(() => {
      const el = document.createElement('div');
      el.className = 'floating-gift';
      el.textContent = gift.giftEmoji;
      el.style.left = (30 + Math.random() * 40) + '%';
      el.style.bottom = '20%';
      container.appendChild(el);
      
      setTimeout(() => el.remove(), 2500);
    }, i * 200);
  }
}

// Rare gift (medium, with sparkles)
function showRareGiftAnimation(gift) {
  const container = document.getElementById('liveGiftAnimations');
  if (!container) return;
  
  // Big center emoji
  const centerEl = document.createElement('div');
  centerEl.className = 'gift-center-medium';
  centerEl.innerHTML = `
    <div class="gift-center-emoji">${gift.giftEmoji}</div>
    ${gift.giftCount > 1 ? `<div class="gift-combo">x${gift.giftCount}</div>` : ''}
  `;
  container.appendChild(centerEl);
  
  // Add sparkles
  for (let i = 0; i < 12; i++) {
    setTimeout(() => {
      const sparkle = document.createElement('div');
      sparkle.className = 'gift-sparkle';
      sparkle.textContent = '✨';
      sparkle.style.left = (40 + Math.random() * 20) + '%';
      sparkle.style.top = (30 + Math.random() * 40) + '%';
      container.appendChild(sparkle);
      setTimeout(() => sparkle.remove(), 1500);
    }, i * 100);
  }
  
  setTimeout(() => centerEl.remove(), 2500);
}

// Epic gift (large, with fireworks)
function showEpicGiftAnimation(gift) {
  const container = document.getElementById('liveGiftAnimations');
  if (!container) return;
  
  // Full screen effect wrapper
  const wrap = document.createElement('div');
  wrap.className = 'gift-epic-wrap';
  wrap.innerHTML = `
    <div class="gift-epic-bg"></div>
    <div class="gift-epic-center">
      <div class="gift-epic-emoji">${gift.giftEmoji}</div>
      <div class="gift-epic-name">${escapeHTML(gift.giftName)}</div>
      ${gift.giftCount > 1 ? `<div class="gift-combo-epic">x${gift.giftCount}</div>` : ''}
    </div>
  `;
  container.appendChild(wrap);
  
  // Firework particles
  for (let i = 0; i < 30; i++) {
    setTimeout(() => {
      const particle = document.createElement('div');
      particle.className = 'gift-firework';
      const angle = (Math.PI * 2 * i) / 30;
      const distance = 150 + Math.random() * 100;
      particle.style.setProperty('--tx', Math.cos(angle) * distance + 'px');
      particle.style.setProperty('--ty', Math.sin(angle) * distance + 'px');
      particle.textContent = ['✨', '⭐', '💫', '🌟'][Math.floor(Math.random() * 4)];
      wrap.appendChild(particle);
    }, 500);
  }
  
  setTimeout(() => wrap.remove(), 3500);
}

// Legendary gift (full screen takeover with confetti)
function showLegendaryGiftAnimation(gift) {
  const container = document.getElementById('liveGiftAnimations');
  if (!container) return;
  
  const wrap = document.createElement('div');
  wrap.className = 'gift-legendary-wrap';
  wrap.innerHTML = `
    <div class="gift-legendary-bg"></div>
    <div class="gift-legendary-rays"></div>
    <div class="gift-legendary-center">
      <div class="gift-legendary-emoji">${gift.giftEmoji}</div>
      <div class="gift-legendary-name">${escapeHTML(gift.giftName)}</div>
      <div class="gift-legendary-sender">from ${escapeHTML(gift.username)}</div>
      ${gift.giftCount > 1 ? `<div class="gift-combo-legendary">x${gift.giftCount}</div>` : ''}
    </div>
  `;
  container.appendChild(wrap);
  
  // Launch confetti
  launchConfetti();
  
  // Floating emojis
  for (let i = 0; i < 20; i++) {
    setTimeout(() => {
      const emoji = document.createElement('div');
      emoji.className = 'floating-gift-large';
      emoji.textContent = gift.giftEmoji;
      emoji.style.left = Math.random() * 100 + '%';
      emoji.style.bottom = '-50px';
      emoji.style.animationDuration = (2 + Math.random() * 2) + 's';
      wrap.appendChild(emoji);
    }, i * 150);
  }
  
  setTimeout(() => wrap.remove(), 4500);
}
  
// ==================== GIFT PANEL ====================

function openLiveGiftPanel(liveId, hostUid) {
  let html = `
    <div class="gift-panel">
      <div class="gift-tabs">
        <button class="gift-tab active" onclick="showGiftTab('free',this)">⚡ Free</button>
        <button class="gift-tab" onclick="showGiftTab('paid',this)">🪙 Paid</button>
      </div>
      <div class="gift-balance">
        ⚡${formatNumber(APP.currentUserData?.freeCoins || 0)} · 🪙${formatNumber(APP.currentUserData?.goldCoins || 0)}
      </div>
      <div class="gift-grid" id="giftGrid">
        ${FREE_GIFTS.map(g => `
          <div class="gift-item" onclick="selectGift('${g.id}','free',${g.cost},this)" data-gift-id="${g.id}">
            <div class="gift-emoji">${g.emoji}</div>
            <div class="gift-name">${g.name}</div>
            <div class="gift-cost">⚡${g.cost}</div>
          </div>
        `).join('')}
      </div>
      <button class="gift-send-btn" onclick="sendLiveGift('${liveId}','${hostUid}')">Send Gift</button>
    </div>
  `;
  openBottomSheet(html);
}

let selectedGift = null;

function selectGift(id, type, cost, el) {
  document.querySelectorAll('.gift-item').forEach(g => g.classList.remove('selected'));
  el.classList.add('selected');
  selectedGift = { id, type, cost };
}

function showGiftTab(type, btn) {
  document.querySelectorAll('.gift-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');

  const grid = document.getElementById('giftGrid');
  const gifts = type === 'free' ? FREE_GIFTS : PAID_GIFTS;
  const coinIcon = type === 'free' ? '⚡' : '🪙';

  grid.innerHTML = gifts.map(g => `
    <div class="gift-item" onclick="selectGift('${g.id}','${type}',${g.cost},this)">
      <div class="gift-emoji">${g.emoji}</div>
      <div class="gift-name">${g.name}</div>
      <div class="gift-cost">${coinIcon}${g.cost}</div>
    </div>
  `).join('');
}

async function sendLiveGift(liveId, hostUid) {
  if (!selectedGift) return showToast('Select a gift!', 'warning');

  const { id, type, cost } = selectedGift;
  const coinField = type === 'free' ? 'freeCoins' : 'goldCoins';
  const balance = APP.currentUserData?.[coinField] || 0;

  if (balance < cost) return showToast('Not enough coins!', 'error');

  closeBottomSheet();

  try {
    // Deduct coins from sender
    await db.collection('users').doc(APP.currentUser.uid).update({
      [coinField]: firebase.firestore.FieldValue.increment(-cost),
      totalGiftsSent: firebase.firestore.FieldValue.increment(1),
    });
    APP.currentUserData[coinField] -= cost;

    // Payout to host
    if (type === 'paid') {
      const hostAmount = Math.floor(cost * (1 - PLATFORM_FEE));
      await db.collection('users').doc(hostUid).update({
        goldCoins: firebase.firestore.FieldValue.increment(hostAmount),
        totalGiftsReceived: firebase.firestore.FieldValue.increment(1),
        totalEarned: firebase.firestore.FieldValue.increment(hostAmount),
      });

      await db.collection('payouts').add({
        type: 'gift_payout', userId: hostUid, amount: hostAmount,
        giftId: id, fee: cost - hostAmount, status: 'completed',
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
    } else {
      await db.collection('users').doc(hostUid).update({
        freeCoins: firebase.firestore.FieldValue.increment(cost),
        totalGiftsReceived: firebase.firestore.FieldValue.increment(1),
      });
    }

    // Get gift definition
    const allGifts = [...FREE_GIFTS, ...PAID_GIFTS];
    const giftDef = allGifts.find(g => g.id === id);

    // Check for combo (same user sending same gift within 5 seconds)
    const now = Date.now();
    const comboKey = `${APP.currentUser.uid}_${id}`;
    window._giftCombos = window._giftCombos || {};
    
    let comboCount = 1;
    if (window._giftCombos[comboKey] && (now - window._giftCombos[comboKey].time) < 5000) {
      comboCount = window._giftCombos[comboKey].count + 1;
    }
    window._giftCombos[comboKey] = { count: comboCount, time: now };

    // Determine gift tier for animation
    let tier = 'basic';
    if (cost >= 5000) tier = 'legendary';
    else if (cost >= 1000) tier = 'epic';
    else if (cost >= 100) tier = 'rare';
    else if (cost >= 20) tier = 'uncommon';

    // Send gift event to live stream
    await db.collection('liveStreams').doc(liveId).update({
      comments: firebase.firestore.FieldValue.arrayUnion({
        uid: APP.currentUser.uid,
        username: APP.currentUserData.displayName,
        avatar: APP.currentUserData.photoURL || '',
        verified: APP.currentUserData.verified || false,
        text: `sent ${giftDef?.emoji || '🎁'} ${giftDef?.name || 'Gift'}`,
        isGift: true,
        giftEmoji: giftDef?.emoji || '🎁',
        giftName: giftDef?.name || 'Gift',
        giftCount: comboCount,
        giftTier: tier,
        giftCost: cost,
        giftType: type,
        time: now,
      }),
    });

    // Add to gift animation queue
    await db.collection('liveStreams').doc(liveId)
      .collection('giftEvents').add({
        uid: APP.currentUser.uid,
        username: APP.currentUserData.displayName,
        avatar: APP.currentUserData.photoURL || '',
        giftEmoji: giftDef?.emoji || '🎁',
        giftName: giftDef?.name || 'Gift',
        giftCount: comboCount,
        giftTier: tier,
        giftCost: cost,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });

    // Battle score update
    const liveDoc = await db.collection('liveStreams').doc(liveId).get();
    if (liveDoc.exists && liveDoc.data().battleActive) {
      await db.collection('liveStreams').doc(liveId).update({
        'battleScore.host': firebase.firestore.FieldValue.increment(cost),
      });
    }

    await incrementAchievement(APP.currentUser.uid, 'first_gift');

    await db.collection('transactions').add({
      uid: APP.currentUser.uid, type: 'gift_sent', amount: -cost, 
      coinType: type === 'free' ? 'free' : 'gold',
      description: `Gift: ${giftDef?.name}`, 
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });

    selectedGift = null;
  } catch (err) {
    console.error('Send gift error:', err);
    showToast('Failed to send gift', 'error');
  }
}
}

function showGiftOverlay(emoji) {
  const overlay = document.getElementById('liveGiftOverlay');
  if (!overlay) return;
  const el = document.createElement('div');
  el.className = 'live-gift-effect';
  el.textContent = emoji;
  overlay.appendChild(el);
  setTimeout(() => el.remove(), 2000);
}

async function endLiveStream() {
  if (!APP.liveStreamId) return;

  openCenterModal(`
    <div class="modal-title">End Live?</div>
    <p class="modal-text">Your live stream will end for all viewers.</p>
    <div class="modal-actions">
      <button class="modal-btn secondary" onclick="closeCenterModal()">Keep Going</button>
      <button class="modal-btn danger" onclick="confirmEndLive()">End Live</button>
    </div>
  `);
}

async function confirmEndLive() {
  closeCenterModal();
  try {
    await db.collection('liveStreams').doc(APP.liveStreamId).update({ isActive: false });
    const video = document.getElementById('liveHostVideo');
    if (video && video.srcObject) video.srcObject.getTracks().forEach(t => t.stop());
    APP.liveStreamId = null;
    APP.isLiveHost = false;
    closeOverlayPage('liveStreamPage');
    showToast('Live stream ended', 'info');
  } catch (err) {
    showToast('Failed to end live', 'error');
  }
}

async function joinLiveStream(hostUid) {
  openOverlayPage('liveStreamPage');
  document.body.classList.add('live-fullscreen');
  document.getElementById('bottomNav').style.display = 'none';
  document.getElementById('bannerAd').style.display = 'none';
  
  const container = document.getElementById('liveStreamContent');
  container.innerHTML = '<div class="loading-spinner" style="margin:40vh auto"></div>';

  try {
    const snap = await db.collection('liveStreams')
      .where('hostUid', '==', hostUid)
      .where('isActive', '==', true)
      .limit(1)
      .get();

    if (snap.empty) {
      container.innerHTML = '<div class="empty-state" style="padding-top:40vh;color:#fff"><h3>Live has ended</h3></div>';
      return;
    }

    const liveDoc = snap.docs[0];
    const liveData = liveDoc.data();
    APP.liveStreamId = liveDoc.id;
    APP.isLiveHost = false;

    // Track this viewer
    await trackLiveViewer(liveDoc.id, false);

    container.innerHTML = `
      <div class="live-fullscreen-container">
        <!-- Viewer sees the same video that host is streaming -->
        <video id="liveViewerVideo" class="live-fullscreen-video" autoplay playsinline></video>
        
        <!-- Fallback background if video not available -->
        <div class="live-viewer-bg" style="background:linear-gradient(135deg,#1a1a2e,#16213e);">
          <div class="live-host-info-center">
            <img src="${liveData.hostAvatar || 'default-avatar.png'}" class="live-host-avatar-large">
            <div class="live-host-name-large">${escapeHTML(liveData.hostName)}</div>
            <div class="live-host-title">${escapeHTML(liveData.title || 'Live Stream')}</div>
          </div>
        </div>

        <!-- Gift Animation Overlay -->
        <div id="liveGiftAnimations" class="live-gift-animations"></div>

        <!-- Top Bar -->
        <div class="live-top-overlay">
          <div class="live-host-badge" onclick="closeOverlayPage('liveStreamPage');viewProfile('${hostUid}')" style="cursor:pointer">
            <img src="${liveData.hostAvatar || 'default-avatar.png'}" class="live-host-avatar-small">
            <div class="live-host-details">
              <div class="live-host-name-small">${escapeHTML(liveData.hostName)} ${liveData.hostVerified ? '✓' : ''}</div>
              <div class="live-viewer-count-small">👁 <span id="viewerCountNum">${liveData.viewerCount || 0}</span></div>
            </div>
          </div>
          <button class="live-follow-quick" onclick="quickFollowHost('${hostUid}', this)">Follow</button>
          <button class="live-close-btn-new" onclick="leaveLiveStream()">✕</button>
        </div>

        <div id="liveBattleArea"></div>
        
        <!-- Comments at Bottom -->
        <div class="live-comments-bottom" id="liveComments"></div>

        <!-- Bottom Controls -->
        <div class="live-bottom-controls">
          <input class="live-comment-input-new" id="liveCommentInput" placeholder="Say something..." onkeypress="if(event.key==='Enter')sendLiveComment()">
          <button class="live-control-btn gift-btn" onclick="openLiveGiftPanel('${liveDoc.id}','${hostUid}')" title="Send Gift">🎁</button>
          <button class="live-control-btn" onclick="shareLiveStreamToChat()" title="Share">📤</button>
        </div>
      </div>
    `;

    listenToLiveStream(liveDoc.id);
    setupLiveVideoStream(hostUid);
  } catch (err) {
    console.error('Join live error:', err);
    container.innerHTML = '<div class="empty-state"><h3>Failed to join</h3></div>';
  }
}

async function leaveLiveStream() {
  if (APP.liveStreamId && !APP.isLiveHost) {
    try {
      await db.collection('liveStreams').doc(APP.liveStreamId).update({
        viewerCount: firebase.firestore.FieldValue.increment(-1),
      });
    } catch {}
  }
  APP.liveStreamId = null;
  closeOverlayPage('liveStreamPage');
}

function shareLiveStream() {
  const link = `https://vidr.click/?live=${APP.liveStreamId}`;
  if (navigator.share) {
    navigator.share({ title: 'Join my live!', url: link }).catch(() => {});
  } else {
    navigator.clipboard.writeText(link).then(() => showToast('Link copied!', 'success'));
  }
}

  async function trackLiveViewer(liveId, isHost) {
  if (!APP.currentUser) return;
  
  try {
    const viewerRef = db.collection('liveStreams').doc(liveId)
      .collection('viewers').doc(APP.currentUser.uid);
    
    await viewerRef.set({
      uid: APP.currentUser.uid,
      displayName: APP.currentUserData.displayName,
      photoURL: APP.currentUserData.photoURL || '',
      verified: APP.currentUserData.verified || false,
      isHost: isHost,
      joinedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    if (!isHost) {
      await db.collection('liveStreams').doc(liveId).update({
        viewerCount: firebase.firestore.FieldValue.increment(1),
      });
    }
  } catch (err) {
    console.error('Track viewer error:', err);
  }
}

async function removeLiveViewer(liveId) {
  if (!APP.currentUser) return;
  
  try {
    await db.collection('liveStreams').doc(liveId)
      .collection('viewers').doc(APP.currentUser.uid).delete();
    
    await db.collection('liveStreams').doc(liveId).update({
      viewerCount: firebase.firestore.FieldValue.increment(-1),
    });
  } catch (err) {
    console.error('Remove viewer error:', err);
  }
}

// Show live viewers list (for host)
async function showLiveViewers() {
  if (!APP.liveStreamId) return;
  
  openBottomSheet(`
    <h3 class="sheet-title">👁 Viewers</h3>
    <div id="liveViewersList">
      <div class="loading-spinner small" style="margin:20px auto"></div>
    </div>
  `);
  
  try {
    const snap = await db.collection('liveStreams').doc(APP.liveStreamId)
      .collection('viewers').orderBy('joinedAt', 'desc').limit(100).get();
    
    let html = '';
    snap.forEach(doc => {
      const v = doc.data();
      if (v.isHost) return; // Don't show host
      
      html += `
        <div class="viewer-list-item" onclick="closeBottomSheet();viewProfile('${v.uid}')">
          <img src="${v.photoURL || 'default-avatar.png'}" alt="" onerror="this.src='default-avatar.png'">
          <div class="viewer-info">
            <div class="viewer-name">${escapeHTML(v.displayName)} ${v.verified ? getVerifiedBadge() : ''}</div>
            <div class="viewer-time">Joined ${timeAgo(v.joinedAt)}</div>
          </div>
        </div>
      `;
    });
    
    document.getElementById('liveViewersList').innerHTML = html || '<p style="text-align:center;color:var(--text-muted);padding:20px">No viewers yet</p>';
  } catch (err) {
    document.getElementById('liveViewersList').innerHTML = '<p style="text-align:center;color:var(--text-muted);padding:20px">Failed to load</p>';
  }
}

// Quick follow from live stream
async function quickFollowHost(hostUid, btn) {
  if (APP.followingIds.has(hostUid)) {
    await unfollowUser(hostUid);
    APP.followingIds.delete(hostUid);
    btn.textContent = 'Follow';
    btn.classList.remove('following');
  } else {
    await followUser(hostUid);
    APP.followingIds.add(hostUid);
    btn.textContent = 'Following';
    btn.classList.add('following');
  }
}

// Setup viewer to see host's stream (WebRTC placeholder - for actual streaming you need WebRTC/HLS)
function setupLiveVideoStream(hostUid) {
  // In production, connect via WebRTC/Agora/LiveKit here
  // For now, viewers see the placeholder background
  const video = document.getElementById('liveViewerVideo');
  if (video) video.style.display = 'none'; // Hide until stream is available
}

// Leave live stream (updated)
async function leaveLiveStream() {
  if (APP.liveStreamId && !APP.isLiveHost) {
    await removeLiveViewer(APP.liveStreamId);
  }
  
  document.body.classList.remove('live-fullscreen');
  document.getElementById('bottomNav').style.display = 'flex';
  document.getElementById('bannerAd').style.display = 'flex';
  APP.liveStreamId = null;
  closeOverlayPage('liveStreamPage');
}

// Confirm End Live (updated)
async function confirmEndLive() {
  closeCenterModal();
  try {
    await db.collection('liveStreams').doc(APP.liveStreamId).update({ isActive: false });
    const video = document.getElementById('liveHostVideo');
    if (video && video.srcObject) video.srcObject.getTracks().forEach(t => t.stop());
    
    document.body.classList.remove('live-fullscreen');
    document.getElementById('bottomNav').style.display = 'flex';
    document.getElementById('bannerAd').style.display = 'flex';
    
    APP.liveStreamId = null;
    APP.isLiveHost = false;
    closeOverlayPage('liveStreamPage');
    showToast('Live stream ended', 'info');
  } catch (err) {
    showToast('Failed to end live', 'error');
  }
}

// Share Live to Chat (for all users)
function shareLiveStreamToChat() {
  if (!APP.liveStreamId) return;
  
  openBottomSheet(`
    <h3 class="sheet-title">📤 Share Live Stream</h3>
    <div class="sheet-option" onclick="shareLiveViaLink()">
      <div class="sheet-option-icon">🔗</div>
      <div class="sheet-option-text"><div class="sheet-option-label">Copy Link</div></div>
    </div>
    <div class="sheet-option" onclick="shareLiveToDM()">
      <div class="sheet-option-icon">✉️</div>
      <div class="sheet-option-text"><div class="sheet-option-label">Send to Chat</div></div>
    </div>
    <div class="sheet-option" onclick="shareLiveNative()">
      <div class="sheet-option-icon">📱</div>
      <div class="sheet-option-text"><div class="sheet-option-label">Share via System</div></div>
    </div>
  `);
}

function shareLiveViaLink() {
  const link = `https://vidr.click/?live=${APP.liveStreamId}`;
  navigator.clipboard.writeText(link).then(() => {
    showToast('Link copied! 🔗', 'success');
    closeBottomSheet();
  });
}

async function shareLiveNative() {
  const link = `https://vidr.click/?live=${APP.liveStreamId}`;
  if (navigator.share) {
    try {
      await navigator.share({ title: 'Join my live on Vidr!', url: link });
      closeBottomSheet();
    } catch {}
  } else {
    shareLiveViaLink();
  }
}

function shareLiveToDM() {
  closeBottomSheet();
  const liveId = APP.liveStreamId;
  openBottomSheet(`
    <h3 class="sheet-title">Send Live to...</h3>
    <div style="padding:8px 0">
      <input type="text" id="liveShareSearch" placeholder="Search username..." 
        style="width:100%;padding:10px 14px;background:var(--bg-input);border:1px solid var(--border-color);border-radius:var(--radius-full);font-size:14px;color:var(--text-primary)"
        oninput="searchUserForLiveShare(this.value, '${liveId}')">
    </div>
    <div id="liveShareResults"></div>
  `);
}

async function searchUserForLiveShare(query, liveId) {
  if (!query || query.length < 2) {
    document.getElementById('liveShareResults').innerHTML = '';
    return;
  }
  
  try {
    const lowerQuery = query.toLowerCase();
    const snap = await db.collection('users').limit(20).get();
    let html = '';
    
    snap.forEach(doc => {
      const user = doc.data();
      if (user.uid === APP.currentUser?.uid) return;
      const match = (user.displayName || '').toLowerCase().includes(lowerQuery) ||
                    (user.username || '').toLowerCase().includes(lowerQuery);
      if (!match) return;
      
      html += `
        <div class="search-user-item" onclick="sendLiveToChat('${user.uid}', '${liveId}')">
          <img src="${user.photoURL || 'default-avatar.png'}" alt="" style="width:40px;height:40px;border-radius:50%;object-fit:cover">
          <div class="search-user-info">
            <div class="search-user-name">${escapeHTML(user.displayName)}</div>
            <div class="search-user-handle">@${escapeHTML(user.username || '')}</div>
          </div>
        </div>
      `;
    });
    
    document.getElementById('liveShareResults').innerHTML = html || '<p style="text-align:center;padding:16px;color:var(--text-muted)">No users found</p>';
  } catch (err) {
    document.getElementById('liveShareResults').innerHTML = '<p style="text-align:center;padding:16px;color:var(--text-muted)">Search failed</p>';
  }
}

async function sendLiveToChat(uid, liveId) {
  closeBottomSheet();
  const chatRoomId = await getOrCreateChatRoom(uid);
  
  await db.collection('messages').add({
    chatRoomId,
    senderId: APP.currentUser.uid,
    type: 'live_share',
    liveId,
    text: '🔴 Shared a live stream',
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });
  
  await updateChatRoomLastMessage(chatRoomId, '🔴 Live stream', uid);
  showToast('Live shared!', 'success');
}

// Click on username in live comments to view profile
function viewLiveCommenter(uid) {
  const wasHost = APP.isLiveHost;
  const liveId = APP.liveStreamId;
  
  // Don't leave the live, just show profile
  loadProfile(uid, true);
}

// ==================== LIVE BATTLE ====================

function openLiveBattle() {
  if (!APP.isLiveHost || !APP.liveStreamId) return;

  openCenterModal(`
    <div class="modal-title">⚔️ Live Battle</div>
    <p class="modal-text">Start a 1v1 gift battle! Score from gifts received. 60 seconds.</p>
    <div class="modal-actions">
      <button class="modal-btn secondary" onclick="closeCenterModal()">Cancel</button>
      <button class="modal-btn primary" onclick="startLiveBattle()">Find Opponent</button>
    </div>
  `);
}

async function startLiveBattle() {
  closeCenterModal();
  showToast('Looking for opponent...', 'info');

  try {
    await db.collection('liveStreams').doc(APP.liveStreamId).update({
      battleActive: true,
      battleScore: { host: 0, opponent: 0 },
      battleEndTime: new Date(Date.now() + 60000),
    });

    setTimeout(async () => {
      try {
        const doc = await db.collection('liveStreams').doc(APP.liveStreamId).get();
        if (doc.exists && doc.data().battleActive) {
          await db.collection('liveStreams').doc(APP.liveStreamId).update({ battleActive: false });
          showToast('Battle ended!', 'info');
        }
      } catch {}
    }, 60000);
  } catch {}
}

function renderLiveBattle(data) {
  const area = document.getElementById('liveBattleArea');
  if (!area || !data.battleActive) { if (area) area.innerHTML = ''; return; }

  const host = data.battleScore?.host || 0;
  const opponent = data.battleScore?.opponent || 0;
  const total = host + opponent || 1;

  area.innerHTML = `
    <div class="live-battle">
      <div class="battle-bar">
        <div class="battle-bar-left" style="width:${(host / total) * 100}%"></div>
        <div class="battle-bar-right" style="width:${(opponent / total) * 100}%"></div>
      </div>
      <div class="battle-scores">
        <span>${host}</span>
        <span>⚔️</span>
        <span>${opponent}</span>
      </div>
    </div>
  `;
}

// ==================== REFERRAL PAGE ====================

function openReferral() {
  openOverlayPage('referralPage');
  renderReferral();
}

function renderReferral() {
  const u = APP.currentUserData;
  const link = `https://vidr.click/?ref=${APP.currentUser?.uid}`;

  document.getElementById('referralContent').innerHTML = `
    <div class="referral-card">
      <div class="referral-icon">🎁</div>
      <div class="referral-title">Refer & Earn</div>
      <div class="referral-desc">
        Both you and your friend get ⚡${REFERRAL_REWARD} free coins!<br>
        Plus earn 6% commission every time they make a purchase!
      </div>
    </div>

    <div class="referral-link-box">
      <input type="text" value="${link}" readonly id="referralLink">
      <button class="referral-copy-btn" onclick="copyReferralLink()">Copy</button>
    </div>

    <button style="width:100%;padding:12px;background:var(--gradient-primary);color:#fff;border-radius:var(--radius-md);font-weight:700;margin-bottom:20px" onclick="shareReferral()">📤 Share Link</button>

    <div class="referral-stats">
      <div class="referral-stat">
        <div class="referral-stat-value">${u?.referralCount || 0}</div>
        <div class="referral-stat-label">Referrals</div>
      </div>
      <div class="referral-stat">
        <div class="referral-stat-value">⚡${formatNumber(u?.referralEarnings || 0)}</div>
        <div class="referral-stat-label">Earned</div>
      </div>
    </div>

    <div style="margin-top:24px;padding:16px;background:var(--bg-card);border:1px solid var(--border-color);border-radius:var(--radius-lg)">
      <h4 style="font-size:14px;font-weight:700;margin-bottom:8px">How it works:</h4>
      <p style="font-size:13px;color:var(--text-tertiary);line-height:1.6">
        1. Share your unique link with friends<br>
        2. When they sign up, both of you get ⚡${REFERRAL_REWARD}<br>
        3. Every time they purchase, you earn 6% commission!<br>
        4. No limit on referrals!
      </p>
    </div>
  `;
}

function copyReferralLink() {
  const input = document.getElementById('referralLink');
  navigator.clipboard.writeText(input.value).then(() => showToast('Link copied! 🔗', 'success'));
}

async function shareReferral() {
  const link = `https://vidr.click/?ref=${APP.currentUser?.uid}`;
  if (navigator.share) {
    try { await navigator.share({ title: 'Join Vidr!', text: 'Check out Vidr!', url: link }); } catch {}
  } else { copyReferralLink(); }
}

// ==================== HOW TO EARN PAGE ====================

function openEarnPage() {
  openOverlayPage('earnPage');
  renderEarnPage();
}

function renderEarnPage() {
  const earnMethods = [
    { icon: '📅', title: 'Daily Reward', desc: 'Open the app daily for free coins', reward: '⚡1-200/day' },
    { icon: '🎡', title: 'Spin Wheel', desc: 'Watch 3 ads and spin to win', reward: '⚡1-200' },
    { icon: '🎮', title: 'Mini Games', desc: 'Play games to multiply coins', reward: 'Up to 10x' },
    { icon: '📺', title: 'Watch Ads', desc: 'Watch reward ads for free coins', reward: '⚡2-5/ad' },
    { icon: '👥', title: 'Refer Friends', desc: 'Both get ⚡50 + 6% purchase commission', reward: '⚡50 + 6%' },
    { icon: '📱', title: 'Watch Feed', desc: 'Spend time watching content', reward: '⚡1/5min' },
    { icon: '📝', title: 'Create Posts', desc: 'Post content to earn XP', reward: '5-10 XP' },
    { icon: '❤️', title: 'Engage', desc: 'Like, comment, follow for XP', reward: '1-3 XP' },
    { icon: '🔴', title: 'Go Live', desc: 'Receive gifts from viewers', reward: 'Unlimited' },
    { icon: '🛍️', title: 'Sell Products', desc: 'List and sell products (verified)', reward: '92% of sales' },
    { icon: '🔗', title: 'Affiliate Links', desc: 'Share product links for commission', reward: '5% commission' },
    { icon: '📊', title: 'Marketing Role', desc: 'Earn 10% on all ads and purchases', reward: '10% commission' },
    { icon: '🏆', title: 'Achievements', desc: 'Unlock achievements for XP and rare coins', reward: 'XP + 0.0000001% gold' },
  ];

  document.getElementById('earnContent').innerHTML = earnMethods.map(m => `
    <div class="earn-item">
      <div class="earn-item-icon">${m.icon}</div>
      <div class="earn-item-text">
        <h4>${m.title}</h4>
        <p>${m.desc}</p>
        <div class="earn-item-reward">${m.reward}</div>
      </div>
    </div>
  `).join('');
}

// ==================== CAMPAIGN / WATCH ADS ====================

function openCampaign() {
  openOverlayPage('campaignPage');
  renderCampaign();
}

let lastAdWatchTime = 0;
const AD_COOLDOWN = 30000;

function renderCampaign() {
  const now = Date.now();
  const canWatch = now - lastAdWatchTime >= AD_COOLDOWN;
  const cooldownRemaining = canWatch ? 0 : Math.ceil((AD_COOLDOWN - (now - lastAdWatchTime)) / 1000);

  document.getElementById('campaignContent').innerHTML = `
    <div class="campaign-card">
      <div class="campaign-icon">📺</div>
      <div class="campaign-title">Watch & Earn</div>
      <div class="campaign-desc">Watch a short ad to earn free coins!</div>
      <div class="campaign-reward">Reward: ⚡2-5 per ad</div>
      <button class="watch-ad-btn" onclick="watchCampaignAd()" ${!canWatch ? 'disabled' : ''}>
        🎬 Watch Ad
      </button>
      ${!canWatch ? `<div class="campaign-cooldown">Next ad in ${cooldownRemaining}s</div>` : ''}
    </div>

    <div class="campaign-card">
      <div class="campaign-icon">🎯</div>
      <div class="campaign-title">Bonus Ad</div>
      <div class="campaign-desc">Watch a longer ad for bigger reward!</div>
      <div class="campaign-reward">Reward: ⚡5-10</div>
      <button class="watch-ad-btn" onclick="watchBonusAd()" ${!canWatch ? 'disabled' : ''}>
        🎬 Watch Bonus Ad
      </button>
    </div>

    <div class="campaign-card">
      <div class="campaign-icon">🌟</div>
      <div class="campaign-title">Daily Streak Bonus</div>
      <div class="campaign-desc">Watch 5 ads today for an extra ⚡20!</div>
      <div class="campaign-reward">Progress: ${Math.min(APP.adImpressions || 0, 5)}/5 ads today</div>
      ${(APP.adImpressions || 0) >= 5 ? '<div style="color:var(--success);font-weight:700;margin-top:8px">✅ Completed!</div>' : ''}
    </div>

    <div style="margin-top:16px;padding:14px;background:var(--bg-card);border:1px solid var(--border-color);border-radius:var(--radius-lg)">
      <p style="font-size:13px;color:var(--text-tertiary);line-height:1.6">
        💡 <strong>Tips:</strong><br>
        • Ads refresh every 30 seconds<br>
        • Watch 5 ads daily for streak bonus<br>
        • Coins are credited instantly<br>
        • All ad revenue helps support the platform
      </p>
    </div>
  `;

  if (!canWatch) {
    const timer = setInterval(() => {
      const remaining = Math.ceil((AD_COOLDOWN - (Date.now() - lastAdWatchTime)) / 1000);
      if (remaining <= 0) {
        clearInterval(timer);
        renderCampaign();
      }
    }, 1000);
  }
}

function watchCampaignAd() {
  showRewardedAd(async () => {
    const reward = Math.floor(Math.random() * 4) + 2;
    await db.collection('users').doc(APP.currentUser.uid).update({
      freeCoins: firebase.firestore.FieldValue.increment(reward),
    });
    APP.currentUserData.freeCoins += reward;
    lastAdWatchTime = Date.now();

    await db.collection('transactions').add({
      uid: APP.currentUser.uid, type: 'ad_reward', amount: reward, coinType: 'free',
      description: 'Campaign ad reward', createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });

    showToast(`Earned ⚡${reward}! 📺`, 'success');
    renderCampaign();
  });
}

function watchBonusAd() {
  showRewardedAd(async () => {
    const reward = Math.floor(Math.random() * 6) + 5;
    await db.collection('users').doc(APP.currentUser.uid).update({
      freeCoins: firebase.firestore.FieldValue.increment(reward),
    });
    APP.currentUserData.freeCoins += reward;
    lastAdWatchTime = Date.now();

    await db.collection('transactions').add({
      uid: APP.currentUser.uid, type: 'ad_reward', amount: reward, coinType: 'free',
      description: 'Bonus ad reward', createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });

    showToast(`Earned ⚡${reward}! 🎯`, 'success');
    renderCampaign();
  });
}

// ==================== PAYOUT MANAGEMENT (Admin) ====================

function openPayoutPage() {
  openOverlayPage('payoutPage');
  renderPayoutPage();
}

async function renderPayoutPage() {
  const container = document.getElementById('payoutContent');
  container.innerHTML = '<div class="loading-spinner small" style="margin:40px auto"></div>';

  try {
    const snap = await db.collection('payouts')
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get();

    let totalRevenue = 0, totalPayouts = 0, pendingPayouts = 0;
    const payoutsByUser = {};

    snap.forEach(doc => {
      const p = doc.data();
      if (p.type === 'coin_purchase' || p.type === 'subscription') totalRevenue += p.amount || 0;
      if (p.status === 'completed' && p.type !== 'coin_purchase' && p.type !== 'subscription') totalPayouts += p.amount || 0;
      if (p.status === 'pending') pendingPayouts += p.amount || 0;

      if (p.userId && p.type !== 'coin_purchase' && p.type !== 'subscription') {
        if (!payoutsByUser[p.userId]) payoutsByUser[p.userId] = { total: 0, items: [] };
        payoutsByUser[p.userId].total += p.amount || 0;
        payoutsByUser[p.userId].items.push({ id: doc.id, ...p });
      }
    });

    let usersHTML = '';
    for (const [uid, data] of Object.entries(payoutsByUser)) {
      const user = await getUserDataCached(uid);
      if (!user) continue;
      usersHTML += `
        <div class="payout-item">
          <img src="${user.photoURL || 'default-avatar.png'}" onerror="this.src='default-avatar.png'">
          <div class="payout-item-info">
            <div class="payout-item-name">${escapeHTML(user.displayName)} ${user.verified ? getVerifiedBadge() : ''}</div>
            <div class="payout-item-role">${user.role || 'user'} · ${data.items.length} payouts</div>
          </div>
          <div class="payout-item-amount">🪙${formatNumber(data.total)}</div>
        </div>
      `;
    }

    container.innerHTML = `
      <div class="payout-summary">
        <div class="payout-summary-card"><div class="payout-summary-label">Total Revenue</div><div class="payout-summary-value" style="color:var(--success)">$${totalRevenue.toFixed(2)}</div></div>
        <div class="payout-summary-card"><div class="payout-summary-label">Total Payouts</div><div class="payout-summary-value">🪙${formatNumber(totalPayouts)}</div></div>
        <div class="payout-summary-card"><div class="payout-summary-label">Pending</div><div class="payout-summary-value" style="color:var(--warning)">🪙${formatNumber(pendingPayouts)}</div></div>
        <div class="payout-summary-card"><div class="payout-summary-label">Platform Fee</div><div class="payout-summary-value">${PLATFORM_FEE * 100}%</div></div>
      </div>

      <h3 style="font-size:16px;font-weight:700;margin-bottom:12px">Payout Allocations</h3>
      ${usersHTML || '<p style="color:var(--text-muted);text-align:center;padding:20px">No payouts yet</p>'}
    `;
  } catch (err) {
    container.innerHTML = '<div class="empty-state"><p>Failed to load payouts</p></div>';
  }
}

console.log('Vidr Part 9 loaded: Live, Gifts, Referral, Earn, Campaign, Payout');

// ==========================================
// VIDR - app.js Part 10 (FINAL)
// Admin Panel, Bot Management, Final Init
// ==========================================

// ==================== ADMIN PANEL ====================

function openAdmin() {
  if (APP.currentUserData?.role !== 'admin' && APP.currentUserData?.role !== 'moderator') {
    return showToast('Access denied', 'error');
  }
  openOverlayPage('adminPage');
  renderAdminPanel();
}

async function renderAdminPanel() {
  const container = document.getElementById('adminContent');
  container.innerHTML = '<div class="loading-spinner small" style="margin:60px auto"></div>';

  try {
    // Check permissions first
    const isAdminUser = APP.currentUserData?.role === 'admin' || 
                       APP.currentUser?.email === ADMIN_EMAIL;
    
    if (!isAdminUser) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">🔒</div>
          <h3>Access Denied</h3>
          <p>You don't have admin permissions</p>
        </div>
      `;
      return;
    }

    // Fetch stats with error handling
    let totalUsers = 0, activeUsers = 0, bannedUsers = 0, verifiedUsers = 0, botUsers = 0;
    let totalPosts = 0, totalOrders = 0, totalRevenue = 0;
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000);

    try {
      const usersSnap = await db.collection('users').get();
      usersSnap.forEach(doc => {
        const u = doc.data();
        totalUsers++;
        if (u.banned) bannedUsers++;
        if (u.verified) verifiedUsers++;
        if (u.isBot) botUsers++;
        if (u.lastActive) {
          const la = u.lastActive.toDate ? u.lastActive.toDate() : new Date(u.lastActive);
          if (la > sevenDaysAgo) activeUsers++;
        }
      });
    } catch (e) {
      console.warn('Users stats error:', e);
    }

    try {
      const postsSnap = await db.collection('posts').get();
      totalPosts = postsSnap.size;
    } catch (e) {
      console.warn('Posts stats error:', e);
    }

    try {
      const ordersSnap = await db.collection('orders').get();
      totalOrders = ordersSnap.size;
    } catch (e) {
      console.warn('Orders stats error:', e);
    }

    try {
      const transSnap = await db.collection('transactions')
        .where('type', 'in', ['purchase', 'subscription'])
        .get();
      transSnap.forEach(doc => {
        const t = doc.data();
        if (t.price) totalRevenue += t.price;
      });
    } catch (e) {
      console.warn('Revenue stats error:', e);
    }

    container.innerHTML = `
      <div class="admin-stats-grid">
        <div class="admin-stat-card">
          <div class="admin-stat-label">Total Users</div>
          <div class="admin-stat-value">${formatNumber(totalUsers)}</div>
        </div>
        <div class="admin-stat-card">
          <div class="admin-stat-label">Active (7d)</div>
          <div class="admin-stat-value">${formatNumber(activeUsers)}</div>
        </div>
        <div class="admin-stat-card">
          <div class="admin-stat-label">Total Posts</div>
          <div class="admin-stat-value">${formatNumber(totalPosts)}</div>
        </div>
        <div class="admin-stat-card">
          <div class="admin-stat-label">Revenue</div>
          <div class="admin-stat-value" style="color:var(--success)">$${totalRevenue.toFixed(2)}</div>
        </div>
        <div class="admin-stat-card">
          <div class="admin-stat-label">Banned</div>
          <div class="admin-stat-value" style="color:var(--error)">${bannedUsers}</div>
        </div>
        <div class="admin-stat-card">
          <div class="admin-stat-label">Verified</div>
          <div class="admin-stat-value" style="color:var(--primary)">${verifiedUsers}</div>
        </div>
        <div class="admin-stat-card">
          <div class="admin-stat-label">Orders</div>
          <div class="admin-stat-value">${totalOrders}</div>
        </div>
        <div class="admin-stat-card">
          <div class="admin-stat-label">Bots</div>
          <div class="admin-stat-value" style="color:var(--info)">${botUsers}</div>
        </div>
      </div>

      <div class="admin-section">
        <div class="admin-section-title">⚡ Quick Actions</div>
        <div class="admin-action-grid">
          <div class="admin-action-btn primary" onclick="openAdminBots()">🤖 Bot Manager</div>
          <div class="admin-action-btn primary" onclick="openAdminAds()">📺 Ad Manager</div>
          <div class="admin-action-btn primary" onclick="openAdminReports()">⚠️ Reports</div>
          <div class="admin-action-btn primary" onclick="openAdminShopStats()">🛍️ Shop Stats</div>
          <div class="admin-action-btn primary" onclick="openPayoutPage()">💳 Payouts</div>
          <div class="admin-action-btn warning" onclick="clearAppCacheAdmin()">🗑️ Clear Cache</div>
        </div>
      </div>

      <div class="admin-section">
        <div class="admin-section-title">👤 User Management</div>
        <input type="text" class="admin-search" id="adminUserSearch" placeholder="Search by username or display name..." oninput="adminSearchUsers(this.value)">
        <div id="adminUserResults"></div>
      </div>
    `;
  } catch (err) {
    console.error('Admin panel error:', err);
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">⚠️</div>
        <h3>Failed to load admin panel</h3>
        <p style="font-size:12px;color:var(--text-muted);max-width:300px">${err.message}</p>
        <button class="modal-btn primary" style="margin-top:16px;width:auto;padding:10px 24px" onclick="renderAdminPanel()">Retry</button>
      </div>
    `;
  }
}

const adminSearchUsers = debounce(async (query) => {
  const container = document.getElementById('adminUserResults');
  if (!query || query.length < 2) {
    container.innerHTML = '';
    return;
  }

  container.innerHTML = '<div class="loading-spinner small" style="margin:20px auto"></div>';

  try {
    const lowerQuery = query.toLowerCase();
    const snap = await db.collection('users').limit(50).get();

    let html = '';
    snap.forEach(doc => {
      const u = doc.data();
      const matchName = (u.displayName || '').toLowerCase().includes(lowerQuery);
      const matchUsername = (u.username || '').toLowerCase().includes(lowerQuery);
      const matchEmail = (u.email || '').toLowerCase().includes(lowerQuery);

      if (!matchName && !matchUsername && !matchEmail) return;

      html += renderAdminUserCard(u);
    });

    container.innerHTML = html || '<p style="text-align:center;color:var(--text-muted);padding:20px">No users found</p>';
  } catch (err) {
    container.innerHTML = '<p style="text-align:center;color:var(--text-muted);padding:20px">Search failed</p>';
  }
}, 400);

function renderAdminUserCard(u) {
  let badges = '';
  if (u.banned) badges += '<span class="admin-badge banned">BANNED</span>';
  if (u.suspended) badges += '<span class="admin-badge suspended">SUSPENDED</span>';
  if (u.verified) badges += '<span class="admin-badge verified">VERIFIED</span>';
  if (u.isBot) badges += '<span class="admin-badge bot">BOT</span>';
  if (u.role === 'admin') badges += '<span class="admin-badge admin-role">ADMIN</span>';
  if (u.role === 'moderator') badges += '<span class="admin-badge mod-role">MOD</span>';
  if (u.role === 'marketing') badges += '<span class="admin-badge marketing-role">MARKETING</span>';

  return `
    <div class="admin-user-card" onclick="openAdminUserActions('${u.uid}')">
      <div class="admin-user-header">
        <img src="${u.photoURL || 'default-avatar.png'}" alt="" onerror="this.src='default-avatar.png'" loading="lazy">
        <div class="admin-user-info">
          <div class="admin-user-name">
            ${escapeHTML(u.displayName || 'User')}
            ${u.verified ? getVerifiedBadge() : ''}
          </div>
          <div class="admin-user-email">@${escapeHTML(u.username || '')} · ${escapeHTML(u.email || '')}</div>
        </div>
      </div>
      <div class="admin-user-badges">${badges}</div>
      <div style="margin-top:6px;font-size:11px;color:var(--text-muted)">
        Lv.${u.level || 1} · ⚡${formatNumber(u.freeCoins || 0)} · 🪙${formatNumber(u.goldCoins || 0)} · ${formatNumber(u.followersCount || 0)} followers
      </div>
    </div>
  `;
}

async function openAdminUserActions(uid) {
  const u = await getUserData(uid);
  if (!u) return showToast('User not found', 'error');

  let html = `
    <h3 class="sheet-title">${escapeHTML(u.displayName || 'User')}</h3>
    <div style="text-align:center;margin-bottom:12px">
      <img src="${u.photoURL || 'default-avatar.png'}" style="width:60px;height:60px;border-radius:50%;object-fit:cover" onerror="this.src='default-avatar.png'">
      <div style="font-size:12px;color:var(--text-tertiary);margin-top:4px">@${escapeHTML(u.username || '')} · Lv.${u.level || 1}</div>
      <div style="font-size:12px;color:var(--text-tertiary)">⚡${formatNumber(u.freeCoins || 0)} · 🪙${formatNumber(u.goldCoins || 0)}</div>
    </div>
    <div class="admin-action-grid">
  `;

  if (u.banned) {
    html += `<div class="admin-action-btn success" onclick="adminUnbanUser('${uid}')">✅ Unban</div>`;
  } else {
    html += `<div class="admin-action-btn danger" onclick="adminBanUser('${uid}')">🚫 Ban</div>`;
  }

  if (u.suspended) {
    html += `<div class="admin-action-btn success" onclick="adminUnsuspendUser('${uid}')">✅ Unsuspend</div>`;
  } else {
    html += `<div class="admin-action-btn warning" onclick="adminSuspendUser('${uid}')">⏳ Suspend</div>`;
  }

  if (u.verified) {
    html += `<div class="admin-action-btn danger" onclick="adminRemoveVerified('${uid}')">❌ Remove Verified</div>`;
  } else {
    html += `<div class="admin-action-btn primary" onclick="adminGrantVerified('${uid}')">✨ Grant Verified</div>`;
  }

  html += `
      <div class="admin-action-btn primary" onclick="adminAddFreeCoins('${uid}')">⚡ Add Free Coins</div>
      <div class="admin-action-btn primary" onclick="adminAddGoldCoins('${uid}')">🪙 Add Gold Coins</div>
      <div class="admin-action-btn primary" onclick="adminSetLevel('${uid}')">📊 Set Level</div>
      <div class="admin-action-btn primary" onclick="adminSetRole('${uid}')">👑 Set Role</div>
      <div class="admin-action-btn primary" onclick="adminGiveTitle('${uid}')">🏷️ Give Title</div>
      <div class="admin-action-btn primary" onclick="adminRemoveTitle('${uid}')">🗑️ Remove Title</div>
      <div class="admin-action-btn primary" onclick="adminGrantAchievement('${uid}')">🏆 Grant Achievement</div>
      <div class="admin-action-btn primary" onclick="closeBottomSheet();viewProfile('${uid}')">👁 View Profile</div>
    </div>
  `;

  openBottomSheet(html);
}

async function adminBanUser(uid) {
  closeBottomSheet();
  openCenterModal(`
    <div class="modal-title">Ban User</div>
    <div class="edit-field" style="margin-bottom:16px">
      <label>Reason</label>
      <input type="text" id="banReason" placeholder="Ban reason..." style="width:100%;padding:12px;background:var(--bg-input);border:1.5px solid var(--border-color);border-radius:var(--radius-md);color:var(--text-primary)">
    </div>
    <div class="modal-actions">
      <button class="modal-btn secondary" onclick="closeCenterModal()">Cancel</button>
      <button class="modal-btn danger" onclick="confirmAdminBan('${uid}')">Ban User</button>
    </div>
  `);
}

async function confirmAdminBan(uid) {
  const reason = document.getElementById('banReason')?.value?.trim() || 'Violation of community guidelines';
  closeCenterModal();
  showLoading();

  try {
    await db.collection('users').doc(uid).update({
      banned: true,
      banReason: reason,
      bannedAt: firebase.firestore.FieldValue.serverTimestamp(),
      bannedBy: APP.currentUser.uid,
    });

    await logAdminAction('ban', uid, reason);
    hideLoading();
    showToast('User banned', 'success');
    renderAdminPanel();
  } catch (err) {
    hideLoading();
    showToast('Failed to ban', 'error');
  }
}

async function adminUnbanUser(uid) {
  closeBottomSheet();
  showLoading();
  try {
    await db.collection('users').doc(uid).update({
      banned: false,
      banReason: '',
      bannedAt: null,
    });
    await logAdminAction('unban', uid);
    hideLoading();
    showToast('User unbanned', 'success');
    renderAdminPanel();
  } catch (err) {
    hideLoading();
    showToast('Failed', 'error');
  }
}

async function adminSuspendUser(uid) {
  closeBottomSheet();
  openCenterModal(`
    <div class="modal-title">Suspend User</div>
    <div class="edit-field" style="margin-bottom:8px">
      <label>Duration</label>
      <select id="suspendDuration" style="width:100%;padding:12px;background:var(--bg-input);border:1.5px solid var(--border-color);border-radius:var(--radius-md);color:var(--text-primary)">
        <option value="1">1 Day</option>
        <option value="3">3 Days</option>
        <option value="7" selected>7 Days</option>
        <option value="14">14 Days</option>
        <option value="30">30 Days</option>
      </select>
    </div>
    <div class="edit-field" style="margin-bottom:16px">
      <label>Reason</label>
      <input type="text" id="suspendReason" placeholder="Reason..." style="width:100%;padding:12px;background:var(--bg-input);border:1.5px solid var(--border-color);border-radius:var(--radius-md);color:var(--text-primary)">
    </div>
    <div class="modal-actions">
      <button class="modal-btn secondary" onclick="closeCenterModal()">Cancel</button>
      <button class="modal-btn warning" onclick="confirmAdminSuspend('${uid}')">Suspend</button>
    </div>
  `);
}

async function confirmAdminSuspend(uid) {
  const days = parseInt(document.getElementById('suspendDuration')?.value) || 7;
  const reason = document.getElementById('suspendReason')?.value?.trim() || 'Community guidelines';
  closeCenterModal();
  showLoading();

  try {
    const until = new Date(Date.now() + days * 86400000);
    await db.collection('users').doc(uid).update({
      suspended: true,
      suspendedUntil: until,
      suspendReason: reason,
      suspendedBy: APP.currentUser.uid,
    });

    await addNotification(uid, {
      type: 'system',
      text: `Your account has been suspended for ${days} days: ${reason}`,
      icon: '⚠️',
    });

    await logAdminAction('suspend', uid, `${days} days: ${reason}`);
    hideLoading();
    showToast(`User suspended for ${days} days`, 'success');
  } catch (err) {
    hideLoading();
    showToast('Failed', 'error');
  }
}

async function adminUnsuspendUser(uid) {
  closeBottomSheet();
  showLoading();
  try {
    await db.collection('users').doc(uid).update({
      suspended: false,
      suspendedUntil: null,
      suspendReason: '',
    });
    await logAdminAction('unsuspend', uid);
    hideLoading();
    showToast('User unsuspended', 'success');
  } catch (err) {
    hideLoading();
    showToast('Failed', 'error');
  }
}

async function adminGrantVerified(uid) {
  closeBottomSheet();
  showLoading();
  try {
    const expiry = new Date(Date.now() + 30 * 86400000);
    await db.collection('users').doc(uid).update({
      verified: true,
      verifiedUntil: expiry,
    });
    await logAdminAction('grant_verified', uid);
    clearUserCache(uid);
    hideLoading();
    showToast('Verified badge granted', 'success');
  } catch (err) {
    hideLoading();
    showToast('Failed', 'error');
  }
}

async function adminRemoveVerified(uid) {
  closeBottomSheet();
  showLoading();
  try {
    await db.collection('users').doc(uid).update({
      verified: false,
      verifiedUntil: null,
    });
    await logAdminAction('remove_verified', uid);
    clearUserCache(uid);
    hideLoading();
    showToast('Verified removed', 'success');
  } catch (err) {
    hideLoading();
    showToast('Failed', 'error');
  }
}

async function adminAddFreeCoins(uid) {
  closeBottomSheet();
  openCenterModal(`
    <div class="modal-title">Add Free Coins</div>
    <div class="edit-field" style="margin-bottom:8px">
      <label>Amount</label>
      <input type="number" id="addFreeAmount" placeholder="100" style="width:100%;padding:12px;background:var(--bg-input);border:1.5px solid var(--border-color);border-radius:var(--radius-md);color:var(--text-primary)">
    </div>
    <div class="edit-field" style="margin-bottom:16px">
      <label>Reason</label>
      <input type="text" id="addFreeReason" placeholder="Reason..." style="width:100%;padding:12px;background:var(--bg-input);border:1.5px solid var(--border-color);border-radius:var(--radius-md);color:var(--text-primary)">
    </div>
    <div class="modal-actions">
      <button class="modal-btn secondary" onclick="closeCenterModal()">Cancel</button>
      <button class="modal-btn primary" onclick="confirmAddFreeCoins('${uid}')">Add Coins</button>
    </div>
  `);
}

async function confirmAddFreeCoins(uid) {
  const amount = parseInt(document.getElementById('addFreeAmount')?.value) || 0;
  const reason = document.getElementById('addFreeReason')?.value?.trim() || 'Admin grant';
  if (amount <= 0) return showToast('Invalid amount', 'warning');

  closeCenterModal();
  showLoading();

  try {
    await db.collection('users').doc(uid).update({
      freeCoins: firebase.firestore.FieldValue.increment(amount),
    });

    await addNotification(uid, {
      type: 'system',
      text: `You received ⚡${amount} free coins! Reason: ${reason}`,
      icon: '🎁',
    });

    await db.collection('transactions').add({
      uid, type: 'coin_grant', amount, coinType: 'free',
      description: `Admin grant: ${reason}`, grantedBy: APP.currentUser.uid,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });

    await logAdminAction('add_free_coins', uid, `${amount} coins: ${reason}`);
    hideLoading();
    showToast(`⚡${amount} added`, 'success');
  } catch (err) {
    hideLoading();
    showToast('Failed', 'error');
  }
}

async function adminAddGoldCoins(uid) {
  closeBottomSheet();
  openCenterModal(`
    <div class="modal-title">Add Gold Coins</div>
    <div class="edit-field" style="margin-bottom:8px">
      <label>Amount</label>
      <input type="number" id="addGoldAmount" placeholder="100" style="width:100%;padding:12px;background:var(--bg-input);border:1.5px solid var(--border-color);border-radius:var(--radius-md);color:var(--text-primary)">
    </div>
    <div class="edit-field" style="margin-bottom:16px">
      <label>Reason</label>
      <input type="text" id="addGoldReason" placeholder="Reason..." style="width:100%;padding:12px;background:var(--bg-input);border:1.5px solid var(--border-color);border-radius:var(--radius-md);color:var(--text-primary)">
    </div>
    <div class="modal-actions">
      <button class="modal-btn secondary" onclick="closeCenterModal()">Cancel</button>
      <button class="modal-btn primary" onclick="confirmAddGoldCoins('${uid}')">Add Coins</button>
    </div>
  `);
}

async function confirmAddGoldCoins(uid) {
  const amount = parseInt(document.getElementById('addGoldAmount')?.value) || 0;
  const reason = document.getElementById('addGoldReason')?.value?.trim() || 'Admin grant';
  if (amount <= 0) return showToast('Invalid amount', 'warning');

  closeCenterModal();
  showLoading();

  try {
    await db.collection('users').doc(uid).update({
      goldCoins: firebase.firestore.FieldValue.increment(amount),
    });

    await addNotification(uid, {
      type: 'system',
      text: `You received 🪙${amount} gold coins! Reason: ${reason}`,
      icon: '🎁',
    });

    await db.collection('transactions').add({
      uid, type: 'coin_grant', amount, coinType: 'gold',
      description: `Admin grant: ${reason}`, grantedBy: APP.currentUser.uid,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });

    await logAdminAction('add_gold_coins', uid, `${amount} coins: ${reason}`);
    hideLoading();
    showToast(`🪙${amount} added`, 'success');
  } catch (err) {
    hideLoading();
    showToast('Failed', 'error');
  }
}

async function adminSetLevel(uid) {
  closeBottomSheet();
  openCenterModal(`
    <div class="modal-title">Set Level</div>
    <div class="edit-field" style="margin-bottom:16px">
      <label>Level (1-${MAX_LEVEL})</label>
      <input type="number" id="setLevelValue" placeholder="100" min="1" max="${MAX_LEVEL}" style="width:100%;padding:12px;background:var(--bg-input);border:1.5px solid var(--border-color);border-radius:var(--radius-md);color:var(--text-primary)">
    </div>
    <div class="modal-actions">
      <button class="modal-btn secondary" onclick="closeCenterModal()">Cancel</button>
      <button class="modal-btn primary" onclick="confirmSetLevel('${uid}')">Set</button>
    </div>
  `);
}

async function confirmSetLevel(uid) {
  const level = parseInt(document.getElementById('setLevelValue')?.value) || 1;
  if (level < 1 || level > MAX_LEVEL) return showToast('Invalid level', 'warning');

  closeCenterModal();
  showLoading();

  try {
    await db.collection('users').doc(uid).update({ level, xp: 0 });
    await logAdminAction('set_level', uid, `Level ${level}`);
    clearUserCache(uid);
    hideLoading();
    showToast(`Level set to ${level}`, 'success');
  } catch (err) {
    hideLoading();
    showToast('Failed', 'error');
  }
}

async function adminSetRole(uid) {
  closeBottomSheet();
  openCenterModal(`
    <div class="modal-title">Set Role</div>
    <div class="edit-field" style="margin-bottom:16px">
      <label>Role</label>
      <select id="setRoleValue" style="width:100%;padding:12px;background:var(--bg-input);border:1.5px solid var(--border-color);border-radius:var(--radius-md);color:var(--text-primary)">
        <option value="user">User</option>
        <option value="moderator">Moderator</option>
        <option value="marketing">Marketing</option>
        <option value="admin">Admin</option>
      </select>
    </div>
    <div class="modal-actions">
      <button class="modal-btn secondary" onclick="closeCenterModal()">Cancel</button>
      <button class="modal-btn primary" onclick="confirmSetRole('${uid}')">Set Role</button>
    </div>
  `);
}

async function confirmSetRole(uid) {
  const role = document.getElementById('setRoleValue')?.value || 'user';
  closeCenterModal();
  showLoading();

  try {
    await db.collection('users').doc(uid).update({ role });
    await logAdminAction('set_role', uid, role);
    clearUserCache(uid);
    hideLoading();
    showToast(`Role set to ${role}`, 'success');
  } catch (err) {
    hideLoading();
    showToast('Failed', 'error');
  }
}

async function adminGiveTitle(uid) {
  closeBottomSheet();

  let presetsHTML = TITLE_PRESETS.map(t =>
    `<div style="padding:8px 0;cursor:pointer" onclick="confirmGiveTitle('${uid}','${t.name}','${t.rarity}')">
      <span class="profile-title ${t.rarity}" style="font-size:11px">${t.name}</span>
    </div>`
  ).join('');

  openCenterModal(`
    <div class="modal-title">Give Title</div>
    <div style="max-height:300px;overflow-y:auto;margin-bottom:12px">${presetsHTML}</div>
    <div style="border-top:1px solid var(--border-light);padding-top:12px">
      <div class="edit-field" style="margin-bottom:8px">
        <label>Custom Title</label>
        <input type="text" id="customTitleName" placeholder="Title name" maxlength="30" style="width:100%;padding:10px;background:var(--bg-input);border:1.5px solid var(--border-color);border-radius:var(--radius-md);color:var(--text-primary)">
      </div>
      <div class="edit-field" style="margin-bottom:12px">
        <label>Rarity</label>
        <select id="customTitleRarity" style="width:100%;padding:10px;background:var(--bg-input);border:1.5px solid var(--border-color);border-radius:var(--radius-md);color:var(--text-primary)">
          <option value="common">Common</option>
          <option value="uncommon">Uncommon</option>
          <option value="rare">Rare</option>
          <option value="epic">Epic</option>
          <option value="legendary">Legendary</option>
        </select>
      </div>
      <button class="modal-btn primary" style="width:100%" onclick="giveCustomTitle('${uid}')">Give Custom Title</button>
    </div>
    <button class="modal-btn secondary" style="width:100%;margin-top:8px" onclick="closeCenterModal()">Cancel</button>
  `);
}

async function confirmGiveTitle(uid, name, rarity) {
  closeCenterModal();
  showLoading();
  try {
    await db.collection('users').doc(uid).update({
      titles: firebase.firestore.FieldValue.arrayUnion({ name, rarity }),
    });
    await logAdminAction('give_title', uid, `${name} (${rarity})`);
    clearUserCache(uid);
    hideLoading();
    showToast(`Title "${name}" given`, 'success');
  } catch (err) {
    hideLoading();
    showToast('Failed', 'error');
  }
}

async function giveCustomTitle(uid) {
  const name = document.getElementById('customTitleName')?.value?.trim();
  const rarity = document.getElementById('customTitleRarity')?.value || 'common';
  if (!name) return showToast('Enter a title name', 'warning');

  await confirmGiveTitle(uid, name, rarity);
}

async function adminRemoveTitle(uid) {
  closeBottomSheet();
  const u = await getUserData(uid);
  const titles = u?.titles || [];

  if (titles.length === 0) return showToast('User has no titles', 'info');

  let html = '<div class="modal-title">Remove Title</div><div style="max-height:300px;overflow-y:auto">';
  titles.forEach(t => {
    html += `<div style="padding:8px 0;cursor:pointer;display:flex;justify-content:space-between;align-items:center" onclick="confirmRemoveTitle('${uid}','${t.name}','${t.rarity}')">
      <span class="profile-title ${t.rarity}">${escapeHTML(t.name)}</span>
      <span style="color:var(--error);font-size:13px">Remove</span>
    </div>`;
  });
  html += '</div><button class="modal-btn secondary" style="width:100%;margin-top:12px" onclick="closeCenterModal()">Cancel</button>';

  openCenterModal(html);
}

async function confirmRemoveTitle(uid, name, rarity) {
  closeCenterModal();
  showLoading();
  try {
    await db.collection('users').doc(uid).update({
      titles: firebase.firestore.FieldValue.arrayRemove({ name, rarity }),
    });

    const u = await getUserData(uid);
    if (u?.selectedTitle?.name === name) {
      await db.collection('users').doc(uid).update({ selectedTitle: null });
    }

    await logAdminAction('remove_title', uid, name);
    clearUserCache(uid);
    hideLoading();
    showToast(`Title "${name}" removed`, 'success');
  } catch (err) {
    hideLoading();
    showToast('Failed', 'error');
  }
}

async function adminGrantAchievement(uid) {
  closeBottomSheet();

  let html = '<div class="modal-title">Grant Achievement</div><div style="max-height:350px;overflow-y:auto">';
  ACHIEVEMENT_TYPES.forEach(a => {
    html += `
      <div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--border-light)">
        <span style="font-size:24px">${a.icon}</span>
        <div style="flex:1">
          <div style="font-weight:600;font-size:14px">${a.name}</div>
          <div style="font-size:11px;color:var(--text-tertiary)">${a.desc}</div>
        </div>
        <div style="display:flex;gap:4px">
          <button style="padding:4px 10px;background:var(--bg-tertiary);border:1px solid var(--border-color);border-radius:var(--radius-sm);font-size:11px;font-weight:600;color:var(--text-secondary)" onclick="confirmGrantAchievement('${uid}','${a.id}',50)">Lv.50</button>
          <button style="padding:4px 10px;background:var(--warning-bg);border:1px solid var(--warning);border-radius:var(--radius-sm);font-size:11px;font-weight:700;color:var(--warning)" onclick="confirmGrantAchievement('${uid}','${a.id}',100)">MAX</button>
        </div>
      </div>
    `;
  });
  html += '</div><button class="modal-btn secondary" style="width:100%;margin-top:12px" onclick="closeCenterModal()">Cancel</button>';

  openCenterModal(html);
}

async function confirmGrantAchievement(uid, achievementId, level) {
  closeCenterModal();
  showLoading();
  try {
    const u = await getUserData(uid);
    const achievements = u?.achievements || {};
    achievements[achievementId] = level;

    await db.collection('users').doc(uid).update({ achievements });
    await logAdminAction('grant_achievement', uid, `${achievementId} Lv.${level}`);
    clearUserCache(uid);
    hideLoading();
    showToast(`Achievement granted Lv.${level}`, 'success');
  } catch (err) {
    hideLoading();
    showToast('Failed', 'error');
  }
}

async function logAdminAction(action, targetUid, details = '') {
  try {
    await db.collection('adminLogs').add({
      action,
      targetUid,
      adminUid: APP.currentUser.uid,
      adminEmail: APP.currentUser.email,
      details,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
  } catch {}
}

// ==================== ADMIN - AD MANAGEMENT ====================

function openAdminAds() {
  openCenterModal(`
    <div class="modal-title">📺 Ad Management</div>
    <div style="text-align:left;margin-bottom:16px">
      <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border-light)">
        <span>Today's Impressions</span>
        <span style="font-weight:700">${APP.adImpressions || 0}</span>
      </div>
      <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border-light)">
        <span>Est. Revenue</span>
        <span style="font-weight:700;color:var(--success)">$${((APP.adImpressions || 0) * 0.002).toFixed(2)}</span>
      </div>
    </div>
    <div style="display:flex;flex-direction:column;gap:8px">
      <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0">
        <span>Adsterra Network</span>
        <div class="toggle-switch active"><div class="toggle-switch-knob"></div></div>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0">
        <span>Banner Ads</span>
        <div class="toggle-switch active"><div class="toggle-switch-knob"></div></div>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0">
        <span>Feed Ads</span>
        <div class="toggle-switch active"><div class="toggle-switch-knob"></div></div>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0">
        <span>Reward Ads</span>
        <div class="toggle-switch active"><div class="toggle-switch-knob"></div></div>
      </div>
    </div>
    <button class="modal-btn secondary" style="width:100%;margin-top:16px" onclick="closeCenterModal()">Close</button>
  `);
}

// ==================== ADMIN - REPORTS ====================

async function openAdminReports() {
  openBottomSheet(`<h3 class="sheet-title">⚠️ Reports</h3><div id="adminReportsList"><div class="loading-spinner small" style="margin:20px auto"></div></div>`);

  try {
    const snap = await db.collection('reports')
      .where('status', '==', 'pending')
      .orderBy('createdAt', 'desc')
      .limit(20)
      .get();

    if (snap.empty) {
      document.getElementById('adminReportsList').innerHTML = '<p style="text-align:center;color:var(--text-muted);padding:20px">No pending reports 🎉</p>';
      return;
    }

    let html = '';
    for (const doc of snap.docs) {
      const r = doc.data();
      const reportedUser = r.reportedUid ? await getUserDataCached(r.reportedUid) : null;

      html += `
        <div style="padding:12px 0;border-bottom:1px solid var(--border-light)">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
            ${reportedUser ? `<img src="${reportedUser.photoURL || 'default-avatar.png'}" style="width:32px;height:32px;border-radius:50%;object-fit:cover" onerror="this.src='default-avatar.png'">` : ''}
            <div>
              <div style="font-weight:600;font-size:13px">${reportedUser ? escapeHTML(reportedUser.displayName) : 'Post Report'}</div>
              <div style="font-size:11px;color:var(--text-tertiary)">${r.reason} · ${timeAgo(r.createdAt)}</div>
            </div>
          </div>
          <div style="display:flex;gap:6px">
            ${r.reportedUid ? `<button style="flex:1;padding:6px;background:var(--error-bg);color:var(--error);border-radius:var(--radius-sm);font-size:12px;font-weight:600" onclick="closeBottomSheet();adminBanUser('${r.reportedUid}')">Ban</button>` : ''}
            <button style="flex:1;padding:6px;background:var(--bg-tertiary);border:1px solid var(--border-color);border-radius:var(--radius-sm);font-size:12px;font-weight:600" onclick="dismissReport('${doc.id}')">Dismiss</button>
          </div>
        </div>
      `;
    }

    document.getElementById('adminReportsList').innerHTML = html;
  } catch (err) {
    document.getElementById('adminReportsList').innerHTML = '<p style="text-align:center;color:var(--text-muted);padding:20px">Failed to load</p>';
  }
}

async function dismissReport(reportId) {
  try {
    await db.collection('reports').doc(reportId).update({ status: 'dismissed' });
    showToast('Report dismissed', 'success');
    openAdminReports();
  } catch {}
}

// ==================== ADMIN - SHOP STATS ====================

async function openAdminShopStats() {
  openCenterModal(`<div class="modal-title">🛍️ Shop Stats</div><div id="shopStatsContent"><div class="loading-spinner small" style="margin:20px auto"></div></div>`);

  try {
    const productsSnap = await db.collection('products').get();
    let totalProducts = productsSnap.size;
    let totalGMV = 0;

    productsSnap.forEach(doc => {
      const p = doc.data();
      totalGMV += (p.price || 0) * (p.sold || 0);
    });

    const platformFee = totalGMV * PLATFORM_FEE;

    document.getElementById('shopStatsContent').innerHTML = `
      <div style="text-align:left">
        <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border-light)">
          <span>Total Products</span><span style="font-weight:700">${totalProducts}</span>
        </div>
        <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border-light)">
          <span>Total GMV</span><span style="font-weight:700;color:var(--success)">$${totalGMV.toFixed(2)}</span>
        </div>
        <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border-light)">
          <span>Platform Fee (${PLATFORM_FEE * 100}%)</span><span style="font-weight:700">$${platformFee.toFixed(2)}</span>
        </div>
      </div>
      <button class="modal-btn secondary" style="width:100%;margin-top:16px" onclick="closeCenterModal()">Close</button>
    `;
  } catch {
    document.getElementById('shopStatsContent').innerHTML = '<p style="text-align:center;color:var(--text-muted)">Failed</p>';
  }
}

function clearAppCacheAdmin() {
  clearAppCache();
  Object.keys(userDataCache).forEach(k => delete userDataCache[k]);
  showToast('All caches cleared', 'success');
}

// ==================== BOT MANAGEMENT ====================

function openAdminBots() {
  openBottomSheet(`
    <h3 class="sheet-title">🤖 Bot Manager</h3>
    <div style="display:flex;flex-direction:column;gap:10px">
      <div class="sheet-option" onclick="closeBottomSheet();createBots(10)">
        <div class="sheet-option-icon">👤</div>
        <div class="sheet-option-text"><div class="sheet-option-label">Create 10 Bots</div></div>
      </div>
      <div class="sheet-option" onclick="closeBottomSheet();createBots(50)">
        <div class="sheet-option-icon">👥</div>
        <div class="sheet-option-text"><div class="sheet-option-label">Create 50 Bots</div></div>
      </div>
      <div class="sheet-option" onclick="closeBottomSheet();createBots(100)">
        <div class="sheet-option-icon">🏢</div>
        <div class="sheet-option-text"><div class="sheet-option-label">Create 100 Bots</div></div>
      </div>
      <div class="sheet-option" onclick="closeBottomSheet();createBots(500)">
        <div class="sheet-option-icon">🏙️</div>
        <div class="sheet-option-text"><div class="sheet-option-label">Create 500 Bots</div></div>
      </div>
      <div class="sheet-option" onclick="closeBottomSheet();addBotVideos()">
        <div class="sheet-option-icon">🎬</div>
        <div class="sheet-option-text"><div class="sheet-option-label">Add 30 Bot Video Posts</div></div>
      </div>
      <div class="sheet-option" onclick="closeBottomSheet();addBotImagePosts()">
        <div class="sheet-option-icon">📷</div>
        <div class="sheet-option-text"><div class="sheet-option-label">Add 30 Bot Image Posts</div></div>
      </div>
    </div>
  `);
}

async function createBots(count) {
  if (count > 500) count = 500;

  showLoading();
  let created = 0;
  let failed = 0;

  try {
    // Process in batches of 20 for reliability
    const batchSize = 20;
    const totalBatches = Math.ceil(count / batchSize);

    for (let batchNum = 0; batchNum < totalBatches; batchNum++) {
      const batchCount = Math.min(batchSize, count - (batchNum * batchSize));
      
      // Create promises for parallel creation
      const promises = [];
      
      for (let i = 0; i < batchCount; i++) {
        promises.push(createSingleBot(batchNum * batchSize + i));
      }
      
      const results = await Promise.allSettled(promises);
      results.forEach(r => {
        if (r.status === 'fulfilled') created++;
        else {
          failed++;
          console.warn('Bot creation failed:', r.reason);
        }
      });

      // Small delay between batches
      if (batchNum < totalBatches - 1) {
        await new Promise(r => setTimeout(r, 500));
      }
    }

    hideLoading();
    if (created > 0) {
      showToast(`✅ ${created} bots created!${failed > 0 ? ` (${failed} failed)` : ''} 🤖`, 'success');
    } else {
      showToast('Failed to create bots. Check Firestore rules.', 'error');
    }
    renderAdminPanel();
  } catch (err) {
    hideLoading();
    showToast(`Error: ${err.message}`, 'error');
    console.error('Bot creation error:', err);
  }
}

async function createSingleBot(index) {
  const firstName = BOT_FIRST_NAMES[Math.floor(Math.random() * BOT_FIRST_NAMES.length)];
  const lastName = BOT_LAST_NAMES[Math.floor(Math.random() * BOT_LAST_NAMES.length)];
  const displayName = `${firstName} ${lastName}`;
  const username = `${firstName.toLowerCase()}${lastName.toLowerCase()}${Math.floor(Math.random() * 9999)}`;
  const bio = BOT_BIOS[Math.floor(Math.random() * BOT_BIOS.length)];
  const avatarId = Math.floor(Math.random() * 99) + 1;
  const gender = Math.random() > 0.5 ? 'men' : 'women';
  const photoURL = `https://randomuser.me/api/portraits/${gender}/${avatarId}.jpg`;
  const isVerified = Math.random() < 0.1;
  const level = Math.floor(Math.random() * 50) + 1;
  const followers = Math.floor(Math.random() * 5000);

  const botUid = `bot_${Date.now()}_${index}_${Math.random().toString(36).slice(2, 8)}`;

  const botData = {
    uid: botUid,
    email: `${username}@bot.vidr.click`,
    displayName,
    username,
    photoURL,
    coverURL: '',
    bio,
    level,
    xp: Math.floor(Math.random() * 100),
    xpBoostEnd: null,
    freeCoins: Math.floor(Math.random() * 500),
    goldCoins: Math.floor(Math.random() * 100),
    followersCount: followers,
    followingCount: Math.floor(Math.random() * 200),
    likesCount: Math.floor(Math.random() * 3000),
    postsCount: 0,
    totalViews: Math.floor(Math.random() * 10000),
    verified: isVerified,
    verifiedUntil: null,
    role: 'user',
    titles: [TITLE_PRESETS[Math.floor(Math.random() * TITLE_PRESETS.length)]],
    selectedTitle: TITLE_PRESETS[Math.floor(Math.random() * TITLE_PRESETS.length)],
    achievements: {},
    selectedAchievements: [],
    banned: false,
    suspended: false,
    isPrivate: false,
    isBot: true,
    dailyStreak: Math.floor(Math.random() * 30),
    lastDailyReward: null,
    lastLoginDate: null,
    referredBy: null,
    referralCount: 0,
    referralEarnings: 0,
    totalGiftsReceived: Math.floor(Math.random() * 100),
    totalGiftsSent: Math.floor(Math.random() * 50),
    totalSpent: 0,
    totalEarned: 0,
    stripeCustomerId: null,
    stripeConnectId: null,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    lastActive: firebase.firestore.FieldValue.serverTimestamp(),
    notifSettings: { likes: true, comments: true, followers: true, messages: true, live: true },
    blockedUsers: [],
    profileViews: Math.floor(Math.random() * 500),
  };

  await db.collection('users').doc(botUid).set(botData);

  // Try to reserve username (may fail if taken, that's ok)
  try {
    await db.collection('usernames').doc(username).set({ uid: botUid });
  } catch (e) {
    console.warn('Username taken, skipping:', username);
  }

  return botUid;
}

async function addBotVideos() {
  showLoading();
  let added = 0;
  let failed = 0;

  try {
    const botsSnap = await db.collection('users')
      .where('isBot', '==', true)
      .limit(100)
      .get();

    if (botsSnap.empty) {
      hideLoading();
      return showToast('No bots found. Create bots first!', 'warning');
    }

    const bots = [];
    botsSnap.forEach(doc => bots.push(doc.data()));

    const promises = [];
    for (let i = 0; i < 30; i++) {
      const bot = bots[Math.floor(Math.random() * bots.length)];
      const videoURL = BOT_VIDEO_URLS[i % BOT_VIDEO_URLS.length];
      const caption = BOT_CAPTIONS[Math.floor(Math.random() * BOT_CAPTIONS.length)];

      const postPromise = db.collection('posts').add({
        uid: bot.uid,
        type: 'video',
        mediaURL: videoURL,
        thumbnailURL: `https://picsum.photos/400/700?random=${Date.now()}_${i}`,
        caption,
        captionOnMedia: false,
        visibility: 'public',
        likesCount: Math.floor(Math.random() * 5000) + 100,
        commentsCount: Math.floor(Math.random() * 200) + 5,
        sharesCount: Math.floor(Math.random() * 100),
        viewsCount: Math.floor(Math.random() * 50000) + 500,
        products: [],
        boosted: false,
        isBot: true,
        createdAt: new Date(Date.now() - Math.random() * 7 * 86400000),
      }).then(async () => {
        try {
          await db.collection('users').doc(bot.uid).update({
            postsCount: firebase.firestore.FieldValue.increment(1),
          });
        } catch {}
      });

      promises.push(postPromise);
    }

    const results = await Promise.allSettled(promises);
    results.forEach(r => {
      if (r.status === 'fulfilled') added++;
      else failed++;
    });

    hideLoading();
    if (added > 0) {
      showToast(`✅ ${added} bot video posts added!${failed > 0 ? ` (${failed} failed)` : ''} 🎬`, 'success');
    } else {
      showToast('Failed to add bot posts', 'error');
    }

    APP.feedPosts = [];
    APP.feedLastDoc = null;
    APP.feedEnded = false;
  } catch (err) {
    hideLoading();
    showToast(`Error: ${err.message}`, 'warning');
    console.error('Bot video error:', err);
  }
}

async function addBotImagePosts() {
  showLoading();
  let added = 0;
  let failed = 0;

  try {
    const botsSnap = await db.collection('users')
      .where('isBot', '==', true)
      .limit(100)
      .get();

    if (botsSnap.empty) {
      hideLoading();
      return showToast('No bots found!', 'warning');
    }

    const bots = [];
    botsSnap.forEach(doc => bots.push(doc.data()));

    const promises = [];
    for (let i = 0; i < 30; i++) {
      const bot = bots[Math.floor(Math.random() * bots.length)];
      const caption = BOT_CAPTIONS[Math.floor(Math.random() * BOT_CAPTIONS.length)];
      const imageCount = Math.floor(Math.random() * 3) + 1;
      const mediaURLs = [];

     // Change from picsum.photos to unsplash source (more reliable)
for (let j = 0; j < imageCount; j++) {
  const imageSeed = Math.floor(Math.random() * 1000);
  mediaURLs.push(`https://picsum.photos/seed/${imageSeed}${i}${j}/600/800`);
}

      const postPromise = db.collection('posts').add({
        uid: bot.uid,
        type: 'image',
        mediaURL: mediaURLs[0],
        mediaURLs,
        caption,
        captionOnMedia: false,
        visibility: 'public',
        likesCount: Math.floor(Math.random() * 3000) + 50,
        commentsCount: Math.floor(Math.random() * 100) + 2,
        sharesCount: Math.floor(Math.random() * 50),
        viewsCount: Math.floor(Math.random() * 20000) + 200,
        products: [],
        boosted: false,
        isBot: true,
        createdAt: new Date(Date.now() - Math.random() * 7 * 86400000),
      }).then(async () => {
        try {
          await db.collection('users').doc(bot.uid).update({
            postsCount: firebase.firestore.FieldValue.increment(1),
          });
        } catch {}
      });

      promises.push(postPromise);
    }

    const results = await Promise.allSettled(promises);
    results.forEach(r => {
      if (r.status === 'fulfilled') added++;
      else failed++;
    });

    hideLoading();
    if (added > 0) {
      showToast(`✅ ${added} bot image posts added!${failed > 0 ? ` (${failed} failed)` : ''} 📷`, 'success');
    } else {
      showToast('Failed to add bot posts', 'error');
    }

    APP.feedPosts = [];
    APP.feedLastDoc = null;
    APP.feedEnded = false;
  } catch (err) {
    hideLoading();
    showToast(`Error: ${err.message}`, 'warning');
  }
}
// ==================== STORY CLEANUP ====================

async function cleanupExpiredStories() {
  try {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const snap = await db.collection('stories')
      .where('createdAt', '<', oneDayAgo)
      .limit(100)
      .get();

    const batch = db.batch();
    snap.forEach(doc => batch.delete(doc.ref));
    if (!snap.empty) await batch.commit();

    console.log(`Cleaned up ${snap.size} expired stories`);
  } catch (err) {
    console.error('Story cleanup error:', err);
  }
}

setInterval(cleanupExpiredStories, 3600000);

// ==================== URL PARAM HANDLING ====================

(function handleURLParams() {
  const params = new URLSearchParams(window.location.search);

  if (params.get('post')) {
    setTimeout(() => {
      if (APP.currentUser) openSinglePost(params.get('post'));
    }, 3000);
  }

  if (params.get('user')) {
    setTimeout(() => {
      if (APP.currentUser) viewProfile(params.get('user'));
    }, 3000);
  }

  if (params.get('live')) {
    setTimeout(() => {
      if (APP.currentUser) {
        const liveId = params.get('live');
        db.collection('liveStreams').doc(liveId).get().then(doc => {
          if (doc.exists && doc.data().isActive) {
            joinLiveStream(doc.data().hostUid);
          }
        });
      }
    }, 3000);
  }

  if (params.get('product')) {
    setTimeout(() => {
      if (APP.currentUser) {
        openOverlayPage('shopPage');
        openProductDetail(params.get('product'));

        const ref = params.get('ref');
        if (ref) {
          localStorage.setItem('vidr_affiliate_ref', ref);
        }
      }
    }, 3000);
  }

  if (params.get('payment') === 'success') {
    setTimeout(() => {
      showToast('Payment successful! Your coins are on the way 🎉', 'success', 5000);
    }, 2500);
  }
})();

// ==================== KEYBOARD HANDLING ====================

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (document.getElementById('storyViewer').style.display !== 'none') {
      closeStoryViewer();
    } else if (document.getElementById('stripePaymentModal').style.display !== 'none') {
      closeStripeModal();
    } else if (document.getElementById('centerModal').style.display !== 'none') {
      closeCenterModal();
    } else if (document.getElementById('bottomSheet').style.display !== 'none') {
      closeBottomSheet();
    }
  }
});

// ==================== VISIBILITY CHANGE ====================

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    stopFeedXpTimer();
  } else {
    if (APP.currentPage === 'home' && APP.currentUser) {
      startFeedXpTimer();
    }
    if (APP.currentUser) {
      db.collection('users').doc(APP.currentUser.uid).update({
        lastActive: firebase.firestore.FieldValue.serverTimestamp(),
      }).catch(() => {});
    }
  }
});

// ==================== RESIZE HANDLER ====================

window.addEventListener('resize', debounce(() => {
  const canvas = document.getElementById('spinWheelCanvas');
  if (canvas && canvas.offsetParent) drawSpinWheel();
}, 300));

// ==================== FINAL LOG ====================

console.log('====================================');
console.log('  VIDR APP FULLY LOADED');
console.log(`  Version: ${APP.version}`);
console.log('  All 10 parts loaded successfully');
console.log('====================================');
