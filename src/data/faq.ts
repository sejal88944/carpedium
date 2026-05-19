export type FaqItem = { q: string; a: string }
export type FaqCategory = { id: string; title: string; items: FaqItem[] }

export const FAQ_CATEGORIES: FaqCategory[] = [
  {
    id: 'orders',
    title: 'Orders',
    items: [
      {
        q: 'How do I place a custom T-shirt order?',
        a: 'Choose a product from Shop, open Custom Design to upload your logo or text, add to cart, then tap "Order on WhatsApp" — your design PDF downloads and the chat opens pre-filled. For bulk, use our Bulk Orders page.',
      },
      {
        q: 'What is the minimum order quantity?',
        a: 'Single-piece custom orders are accepted. Bulk discounts start from 25 pieces and improve at 50, 100, and 500+ quantities.',
      },
      {
        q: 'Can I track my order?',
        a: 'Yes. After dispatch you receive tracking via WhatsApp and email. Track status anytime from your Account dashboard.',
      },
    ],
  },
  {
    id: 'printing',
    title: 'Printing',
    items: [
      {
        q: 'Which printing methods do you offer?',
        a: 'We offer DTG (photo-quality), screen printing (bulk & vibrant), vinyl/heat transfer, and embroidery on polos and corporate wear.',
      },
      {
        q: 'Will my logo colours match my brand?',
        a: 'We provide digital proofs before production. Pantone matching is available on bulk corporate orders.',
      },
      {
        q: 'What file format should I upload?',
        a: 'PNG with transparent background, SVG, AI, or PDF at 300 DPI. Our team can help optimize artwork for free on bulk orders.',
      },
    ],
  },
  {
    id: 'delivery',
    title: 'Delivery',
    items: [
      {
        q: 'How long does delivery take?',
        a: 'Standard custom orders: 3–7 business days. Bulk orders: 7–14 days depending on quantity and print method. Express available in metro cities.',
      },
      {
        q: 'Do you deliver across India?',
        a: 'Yes — Pune, Mumbai, Hyderabad, Bangalore, Nagpur, Nashik and pan-India via trusted courier partners.',
      },
    ],
  },
  {
    id: 'bulk',
    title: 'Bulk Pricing',
    items: [
      {
        q: 'How does bulk pricing work?',
        a: 'Pricing tiers apply at 25+, 50+, 100+, and 500+ pieces. Contact us for a custom quote with fabric and print method options.',
      },
      {
        q: 'Do you offer corporate invoicing?',
        a: 'Yes. GST invoices, PO acceptance, and net-15 terms available for verified corporate accounts.',
      },
    ],
  },
  {
    id: 'refunds',
    title: 'Refunds',
    items: [
      {
        q: 'What is your return policy?',
        a: 'Defective or misprinted items are replaced free. Custom orders with approved proofs are non-refundable unless production error occurs.',
      },
      {
        q: 'How do I request a refund?',
        a: 'Contact support within 48 hours of delivery with photos. We resolve within 3–5 business days.',
      },
    ],
  },
  {
    id: 'customization',
    title: 'Customization',
    items: [
      {
        q: 'Can I preview my design before ordering?',
        a: 'Yes. Our live Custom Design studio shows real-time HD preview on the T-shirt mockup before you add to cart.',
      },
      {
        q: 'Can I print on front and back?',
        a: 'Absolutely. Select front/back in the design studio. Back prints may have a small additional charge.',
      },
    ],
  },
]

export const ALL_FAQ_ITEMS = FAQ_CATEGORIES.flatMap((c) => c.items)
