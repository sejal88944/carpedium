export const TRUST_BADGES = [
  { icon: '✓', label: 'Premium Quality Print' },
  { icon: '⚡', label: 'Fast 3–7 Day Delivery' },
  { icon: '🎨', label: 'Free Design Support' },
  { icon: '🔒', label: 'Secure Payments' },
  { icon: '↩', label: 'Quality Guarantee' },
  { icon: '📦', label: 'Pan-India Shipping' },
] as const

export const CLIENT_LOGOS = [
  'TechStart Pune',
  'Mumbai Marathon',
  'Hyderabad FC',
  'Bangalore DevCon',
  'Nagpur College Fest',
  'Nashik Run Club',
] as const

export const BULK_PRICING = [
  { qty: '25–49', price: '₹349', discount: '5% off' },
  { qty: '50–99', price: '₹319', discount: '12% off' },
  { qty: '100–249', price: '₹289', discount: '18% off' },
  { qty: '250–499', price: '₹259', discount: '24% off' },
  { qty: '500+', price: 'Custom', discount: 'Best rates' },
] as const

export const PRINT_METHODS = [
  { name: 'DTG Digital', desc: 'Photo-quality, small runs, full colour' },
  { name: 'Screen Print', desc: 'Bulk orders, vibrant solids, cost-effective' },
  { name: 'Vinyl / Heat Transfer', desc: 'Names, numbers, sports jerseys' },
  { name: 'Embroidery', desc: 'Polos, corporate logos, premium finish' },
] as const

export const FABRICS = [
  { name: '180 GSM Cotton', desc: 'Everyday comfort, events & promos' },
  { name: '220 GSM Combed', desc: 'Premium feel, startups & retail' },
  { name: '240 GSM Oversized', desc: 'Streetwear drops, heavy hand-feel' },
  { name: 'Pique Polo Blend', desc: 'Corporate polos, breathable' },
] as const

export const TESTIMONIALS = [
  {
    name: 'Rahul K.',
    role: 'Startup Founder, Pune',
    text: 'Best custom tshirt printing Pune team — delivered 200 branded tees before our launch event.',
    rating: 5,
  },
  {
    name: 'Priya M.',
    role: 'HR Manager, Mumbai',
    text: 'Corporate uniform t shirts with perfect logo colours. Bulk pricing was very competitive.',
    rating: 5,
  },
  {
    name: 'Arjun S.',
    role: 'College Fest Coordinator',
    text: 'Event t shirt printing for 800 students — on time, great print quality, WhatsApp support was excellent.',
    rating: 5,
  },
] as const

export const PROCESS_STEPS = [
  { step: '01', title: 'Choose Product', desc: 'Pick tee type, colour, size from our premium catalog.' },
  { step: '02', title: 'Design & Preview', desc: 'Upload logo or use our live design studio with HD mockup.' },
  { step: '03', title: 'Print & QC', desc: 'DTG, screen, or embroidery with strict quality checks.' },
  { step: '04', title: 'Fast Delivery', desc: 'Packed and shipped across Pune, Mumbai, and all India.' },
] as const

export const STATS = [
  { value: 12800, suffix: '+', label: 'Tees Printed' },
  { value: 480, suffix: '+', label: 'Corporate Clients' },
  { value: 4.9, suffix: '★', label: 'Google Rating' },
  { value: 6, suffix: '', label: 'Cities Served' },
] as const
