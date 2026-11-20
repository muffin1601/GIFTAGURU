export const newYearCampaign = {
  active: true,
  year: 2027,
  path: "/new-year-2027",
  bannerImage: "/giftabanner.webp",
  featuredSlugs: ["journal-matching-pen-set", "blue-notebook-welcome-set", "grey-planner-corporate-set", "brown-luxury-stationery-set", "green-eco-notebook-gift-set", "black-gold-premium-notebook-set", "luxury-planner-gift-box", "executive-onboarding-essentials-set", "complete-stationery-gift-set", "client-appreciation-desk-set", "white-notebook-flask-gift-set", "tan-executive-diary-flask-gift-set"],
} as const;

// Images are grouped by their original folders; they are not catalog products.
export const calendarGallery = [
  ...[1, 2, 3].map(n => ({ name: `Calendar design ${n}`, images: [`/CALENDERS 2027/${n}/Initial.webp`, ...[2, 3, 4].map(i => `/CALENDERS 2027/${n}/${i}.webp`)] })),
  { name: "Calendar design 4", images: ["Initial", "2", "3", "4"].map(i => `/CALENDERS 2027/4/${i}.png`) },
  { name: "Calendar design 5", images: ["Initial", "2", "3", "4", "5"].map(i => `/CALENDERS 2027/5/${i}.webp`) },
  { name: "Illustrated desk calendar", images: ["G-01_1791796940.jpg", "G-02_1791796940.jpg", "G-03_1791796940.jpg"].map(i => `/CALENDERS 2027/6/${i}`) },
  { name: "Botanical desk calendar", images: ["S-01_1791797062.jpg", "S-03_1791797062.jpg"].map(i => `/CALENDERS 2027/7/${i}`) },
  { name: "Calendar and diary set", images: [1, 2, 3, 4].map(i => `/CALENDERS 2027/calender_diary set (${i}).webp`) },
  { name: "2027 diary designs", images: [1, 2, 3, 4].map(i => `/CALENDERS 2027/2027 diary (${i}).jpg`) },
];
