export type BlogPost = {
  slug: string
  title: string
  excerpt: string
  category: string
  tags: string[]
  readTime: string
  date: string
  featured?: boolean
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'custom-tshirt-printing-guide-india',
    title: 'Complete Guide to Custom T-Shirt Printing in India (2025)',
    excerpt:
      'DTG vs screen print, fabric GSM, MOQ, and how startups choose the right print partner for merch drops.',
    category: 'Printing',
    tags: ['custom tshirt printing', 'startup branding'],
    readTime: '8 min',
    date: '2025-04-12',
    featured: true,
  },
  {
    slug: 'startup-branding-tshirts',
    title: 'Startup Branding with Custom Tees: Build Culture & Visibility',
    excerpt:
      'How early-stage teams use premium tees for events, onboarding kits, and investor meetups.',
    category: 'Branding',
    tags: ['startup branding', 'corporate t shirt printing'],
    readTime: '6 min',
    date: '2025-03-28',
  },
  {
    slug: 'corporate-uniform-polo-guide',
    title: 'Corporate Uniforms & Polo T-Shirt Printing: What HR Should Know',
    excerpt:
      'Fabric blends, embroidery vs print, sizing charts, and bulk pricing for employee uniforms.',
    category: 'Corporate',
    tags: ['polo tshirt manufacturer', 'company uniform t shirts'],
    readTime: '7 min',
    date: '2025-03-15',
  },
  {
    slug: 'oversized-tshirts-india-trend',
    title: 'Oversized T-Shirts India: Streetwear Trend & Print Tips',
    excerpt:
      'Why 240 GSM drop-shoulder tees dominate Gen-Z merch and how to design for oversized canvases.',
    category: 'Trends',
    tags: ['oversized t shirts India', 'streetwear'],
    readTime: '5 min',
    date: '2025-02-20',
  },
  {
    slug: 'bulk-event-tshirt-checklist',
    title: 'Bulk Event T-Shirt Printing Checklist for Colleges & Marathons',
    excerpt:
      'Timeline, artwork deadlines, size curves, and delivery planning for 500+ piece events.',
    category: 'Events',
    tags: ['bulk t shirt printing', 'event t shirt printing'],
    readTime: '6 min',
    date: '2025-02-08',
  },
  {
    slug: 'polo-tshirt-trends-2025',
    title: 'Polo T-Shirt Trends 2025: Corporate & Casual Styles',
    excerpt:
      'Collar styles, colour palettes, and logo placement trends for promotional polo printing.',
    category: 'Trends',
    tags: ['polo t shirt printing', 'printed polo t shirts'],
    readTime: '4 min',
    date: '2025-01-22',
  },
]

export const BLOG_CATEGORIES = ['All', 'Printing', 'Branding', 'Corporate', 'Trends', 'Events'] as const
