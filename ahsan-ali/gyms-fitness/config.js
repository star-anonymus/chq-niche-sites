/**
 * ClientoraHQ - Niche 38: Gyms & Fitness
 * Demo Business: IronCore Fitness
 *
 * PERSONAL IN ONE MINUTE:
 * Every business detail is configured here.
 * Changing config.js updates the entire site.
 * Link overrides via URL parameters (?name=...&city=...&phone=...)
 * will override name, city, and phone everywhere dynamically.
 */

const SITE_CONFIG = {
  // Business Identity
  business: {
    name: "IronCore Fitness",
    tagline: "Unleash Your Ultimate Strength & Endurance in {city}",
    description: "Welcome to {name}, a strength, bodybuilding, and functional training club in {city} equipped with Olympic barbells, cardio machines, and dedicated coaching.",
    city: "Lahore",
    address: "Block G3, Phase 5 DHA, {city}, Pakistan",
    phone: "03001234567",
    phoneFormatted: "+92 300 1234567",
    whatsapp: "03001234567",
    whatsappFormatted: "+92 300 1234567",
    email: "",
    establishedYear: "2019"
  },

  // Operating Hours
  hours: {
    weekdays: "Mon - Fri: 06:00 AM - 11:00 PM",
    saturday: "Saturday: 07:00 AM - 10:00 PM",
    sunday: "Sunday: 08:00 AM - 08:00 PM",
    summary: "Open 7 Days a Week • Ladies & Gents Dedicated Slots Available"
  },

  // Theme & Styling (Black and neon red, powerful)
  colors: {
    primary: "#ff1e42",          // Neon Red
    primaryHover: "#e0002b",
    primaryGlow: "rgba(255, 30, 66, 0.4)",
    darkBg: "#0a0a0d",            // Deep Pitch Black
    surfaceDark: "#121217",       // Charcoal Card Surface
    surfaceLight: "#1a1a22",      // Elevated Surface
    borderMuted: "rgba(255, 255, 255, 0.1)",
    textLight: "#f4f4f6",
    textMuted: "#9ca3af"
  },

  // Why Choose Us (3 to 4 points with icons)
  whyChooseUs: [
    {
      icon: "dumbbell",
      title: "Strength & Cardio Setup",
      description: "Calibrated plates, power racks, Olympic barbells, and cardio machines arranged for effective strength and conditioning."
    },
    {
      icon: "certificate",
      title: "Experienced Coaches",
      description: "Dedicated trainers focused on proper lifting form, nutrition guidance, hypertrophy, and functional strength training."
    },
    {
      icon: "chart-line",
      title: "Personalized Progression",
      description: "Custom biometric body composition scans paired with tailored workout routines and diet protocols."
    },
    {
      icon: "shield-check",
      title: "Hygienic & High-Vibe Facility",
      description: "Pristine locker rooms, steam sauna, air purification, filtered hydration stations, and an electrifying workout playlist."
    }
  ],

  // Special Feature 1: Membership Plans (Monthly, 3 Months, Yearly with highlighted best value)
  membershipPlans: [
    {
      id: "monthly",
      name: "Starter Monthly",
      duration: "1 Month",
      price: "PKR 7,500",
      period: "per month",
      isBestValue: false,
      badge: "Flexible",
      features: [
        "Full gym floor & cardio access",
        "Locker & shower facilities",
        "Initial fitness & body composition assessment",
        "Free locker during workout",
        "Structured beginner onboarding guide"
      ],
      whatsappPrefill: "Hi {name}! I would like to inquire about joining the Starter Monthly plan ({price})."
    },
    {
      id: "three-months",
      name: "Pro Transformation",
      duration: "3 Months",
      price: "PKR 18,000",
      effectivePrice: "PKR 6,000 / month",
      period: "for 3 months",
      isBestValue: true,
      badge: "MOST POPULAR - BEST VALUE",
      features: [
        "Everything in Starter Monthly",
        "Save 20% compared to monthly",
        "2 Free 1-on-1 personal training sessions",
        "Custom nutrition & macro blueprint",
        "Free guest pass every month",
        "Access to all group fitness classes"
      ],
      whatsappPrefill: "Hi {name}! I want to sign up for your best-value 3-Month Pro Transformation plan ({price})."
    },
    {
      id: "yearly",
      name: "Elite Annual",
      duration: "12 Months",
      price: "PKR 54,000",
      effectivePrice: "PKR 4,500 / month",
      period: "for 1 full year",
      isBestValue: false,
      badge: "Maximum Savings",
      features: [
        "Full gym floor & recovery zone access",
        "Save 40% over regular rate",
        "6 Personal training sessions included",
        "Monthly body composition tracking",
        "Free gym kit & shaker bottle",
        "Dedicated VIP locker privileges",
        "Sauna & steam room access"
      ],
      whatsappPrefill: "Hi {name}! I am interested in locking in the Elite Annual Membership ({price}) with maximum savings."
    }
  ],

  // Special Feature 2: Class Timetable by day, switchable by tabs
  classTimetable: {
    days: [
      { id: "mon", label: "Monday" },
      { id: "tue", label: "Tuesday" },
      { id: "wed", label: "Wednesday" },
      { id: "thu", label: "Thursday" },
      { id: "fri", label: "Friday" },
      { id: "sat", label: "Saturday" },
      { id: "sun", label: "Sunday" }
    ],
    schedule: {
      mon: [
        { time: "06:30 AM - 07:30 AM", name: "Morning HIIT & Core Ignition", trainer: "Hamza Khan", intensity: "High", room: "Studio A" },
        { time: "05:30 PM - 06:30 PM", name: "Powerlifting Fundamentals", trainer: "Bilal Ahmed", intensity: "Very High", room: "Strength Arena" },
        { time: "07:00 PM - 08:00 PM", name: "Functional Conditioning WOD", trainer: "Tariq Malik", intensity: "Extreme", room: "Functional Turf" }
      ],
      tue: [
        { time: "07:00 AM - 08:00 AM", name: "Spin & Cardio Shred", trainer: "Hamza Khan", intensity: "High", room: "Cycle Lab" },
        { time: "06:00 PM - 07:00 PM", name: "Hypertrophy Chest & Arms", trainer: "Bilal Ahmed", intensity: "High", room: "Strength Arena" },
        { time: "07:30 PM - 08:30 PM", name: "Boxing Conditioning & Padwork", trainer: "Tariq Malik", intensity: "Very High", room: "Combat Zone" }
      ],
      wed: [
        { time: "06:30 AM - 07:30 AM", name: "Metabolic Conditioning (MetCon)", trainer: "Hamza Khan", intensity: "High", room: "Studio A" },
        { time: "05:30 PM - 06:30 PM", name: "Deadlift & Squat Mechanics", trainer: "Bilal Ahmed", intensity: "Extreme", room: "Power Racks" },
        { time: "07:00 PM - 08:00 PM", name: "Athletic Agility & Speed", trainer: "Tariq Malik", intensity: "High", room: "Functional Turf" }
      ],
      thu: [
        { time: "07:00 AM - 08:00 AM", name: "Core & Mobility Flow", trainer: "Hamza Khan", intensity: "Moderate", room: "Studio B" },
        { time: "06:00 PM - 07:00 PM", name: "Back & Shoulder Sculpt", trainer: "Bilal Ahmed", intensity: "High", room: "Strength Arena" },
        { time: "07:30 PM - 08:30 PM", name: "Kettlebell Inferno", trainer: "Tariq Malik", intensity: "Very High", room: "Functional Turf" }
      ],
      fri: [
        { time: "06:30 AM - 07:30 AM", name: "Friday Full Body Blast", trainer: "Hamza Khan", intensity: "High", room: "Studio A" },
        { time: "05:00 PM - 06:00 PM", name: "Heavy Barbell Club", trainer: "Bilal Ahmed", intensity: "Extreme", room: "Strength Arena" },
        { time: "06:30 PM - 07:30 PM", name: "Combat Strike & Conditioning", trainer: "Tariq Malik", intensity: "Very High", room: "Combat Zone" }
      ],
      sat: [
        { time: "09:00 AM - 10:15 AM", name: "Weekend Warrior Team Challenge", trainer: "Tariq & Hamza", intensity: "Extreme", room: "Main Floor" },
        { time: "11:00 AM - 12:00 PM", name: "Powerlifting Open Platform", trainer: "Bilal Ahmed", intensity: "High", room: "Strength Arena" },
        { time: "05:00 PM - 06:00 PM", name: "Mobility, Stretch & Recovery", trainer: "Hamza Khan", intensity: "Low", room: "Studio B" }
      ],
      sun: [
        { time: "10:00 AM - 11:15 AM", name: "Sunday Strongman & Conditioning", trainer: "Tariq Malik", intensity: "High", room: "Functional Turf" },
        { time: "04:30 PM - 05:30 PM", name: "De-load, Foam Rolling & Mobility", trainer: "Hamza Khan", intensity: "Low", room: "Studio B" }
      ]
    }
  },

  // Gym Trainers (Male Strength & Conditioning Specialists)
  trainers: [
    {
      name: "Tariq Malik",
      role: "Head Strength & Conditioning Coach",
      experience: "8+ Years Experience",
      certs: "",
      image: "images/trainer-1.jpg",
      quote: "Discipline will carry you through when motivation fades. We build warriors here."
    },
    {
      name: "Hamza Khan",
      role: "Functional Strength & Cross-Training Lead",
      experience: "6+ Years Experience",
      certs: "",
      image: "images/trainer-2.jpg",
      quote: "Master proper form first. Consistency with heavy basics yields undeniable power."
    },
    {
      name: "Bilal Ahmed",
      role: "Powerlifting & Hypertrophy Coach",
      experience: "7+ Years Experience",
      certs: "",
      image: "images/trainer-3.jpg",
      quote: "Heavy squats and disciplined nutrition leave no room for excuses. Build true resilience."
    }
  ],

  // Gallery (7 high-impact photos with bigger view)
  gallery: [
    { image: "images/arena.jpg", caption: "Olympic Barbells & Premium Strength Arena", tag: "Strength" },
    { image: "images/gym-floor.jpg", caption: "Spacious High-Ceiling Main Gym Floor", tag: "Facility" },
    { image: "images/weights.jpg", caption: "Calibrated Dumbbells & Free Weights Section", tag: "Weights" },
    { image: "images/powerlifting.jpg", caption: "Olympic Barbell Deadlift Platform", tag: "Powerlifting" },
    { image: "images/cardio.jpg", caption: "High-Tech Cardio Deck & Treadmills", tag: "Cardio" },
    { image: "images/crossfit.jpg", caption: "Functional Fitness Turf & Strength Conditioning", tag: "Functional" },
    { image: "images/boxing.jpg", caption: "Heavy Boxing Bags & Combat Conditioning Zone", tag: "Combat" }
  ],

  // Reviews: 6 reviews marked "Sample review: replace with a real one". Never present made-up reviews as real.
  reviews: [
    {
      author: "Hamza Farooq",
      tag: "Member for 1 year",
      rating: 5,
      note: "Sample review: replace with a real one",
      text: "{name} transformed my routine. The coaches actually watch your lifting form and the community pushes you to break your personal records. Best gym in the city hands down."
    },
    {
      author: "Adnan Sheikh",
      tag: "Member for 6 months",
      rating: 5,
      note: "Sample review: replace with a real one",
      text: "Incredible atmosphere, super clean facilities, and the high-intensity conditioning sessions with Hamza are intense. As a busy professional, the flexible schedule is a lifesaver."
    },
    {
      author: "Usman Ghani",
      tag: "Member for 2 years",
      rating: 5,
      note: "Sample review: replace with a real one",
      text: "Real power racks, calibrated plates, and coaches who know sports science. You will not find gym equipment of this standard anywhere else in town."
    },
    {
      author: "Bilal Tariq",
      tag: "Member for 8 months",
      rating: 5,
      note: "Sample review: replace with a real one",
      text: "The deadlift platforms and weight plates are well maintained. If you are serious about strength gains and powerlifting in {city}, this is a solid facility."
    },
    {
      author: "Mustafa Javed",
      tag: "Member for 1.5 years",
      rating: 5,
      note: "Sample review: replace with a real one",
      text: "Exceptional atmosphere and spotless locker rooms. The morning strength sessions give me the energy I need before work. Coaches are friendly, patient, and knowledgeable."
    },
    {
      author: "Zubair Hashmi",
      tag: "Member for 4 months",
      rating: 5,
      note: "Sample review: replace with a real one",
      text: "Joined on the 3-month Pro plan and already lost 8kg while adding 20kg to my squat. The personalized nutrition guide and coach guidance made all the difference."
    }
  ],

  // Top News / Announcement Bar Ticker
  newsTicker: [
    "★ SPECIAL ADMISSIONS: 20% OFF ON 3-MONTH PRO TRANSFORMATION PLAN",
    "• 1-DAY FREE VIP GUEST PASS AVAILABLE NOW FOR NEW MEMBERS",
    "★ STRENGTH COACHING & OLYMPIC BARBELLS IN {city}",
    "• EXTENDED HOURS: OPEN 7 DAYS A WEEK (MON-FRI 6 AM - 11 PM)",
    "★ LADIES & GENTS DEDICATED SLOTS AVAILABLE AT {name}"
  ],

  // Free Trial Offer
  freeTrial: {
    title: "Claim Your 1-Day VIP Pass Free",
    subtitle: "Experience the iron culture, modern equipment, and coaching firsthand. Zero commitment required.",
    whatsappPrefill: "Hi {name}! I would like to claim my 1-Day Free Trial Pass at your {city} gym."
  },

  // Social Links
  socialLinks: {
    instagram: "https://instagram.com",
    facebook: "https://facebook.com",
    youtube: "https://youtube.com",
    tiktok: "https://tiktok.com"
  },

  // Credits & Footer
  footer: {
    copyrightOwner: "IronCore Fitness",
    attributionText: "Website by ClientoraHQ Studio",
    attributionUrl: "https://clientorahq.com"
  }
};

// Export to window object for browser access
if (typeof window !== "undefined") {
  window.SITE_CONFIG = SITE_CONFIG;
}
