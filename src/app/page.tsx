import { Hero } from '@/components/home/Hero'
import { ColorShowcase } from '@/components/home/ColorShowcase'
import { LiveCustomizationDemo } from '@/components/home/LiveCustomizationDemo'
import { WhyChooseUs } from '@/components/home/WhyChooseUs'
import { CorporateServices } from '@/components/home/CorporateServices'
import { ReviewsSection } from '@/components/home/ReviewsSection'
import { LocalSeoSection } from '@/components/home/LocalSeoSection'
import { GMBSection } from '@/components/home/GMBSection'
import { AITrendingSection } from '@/components/home/AITrendingSection'
import { FAQAccordion } from '@/components/home/FAQAccordion'
import { BulkOrderCTA } from '@/components/home/BulkOrderCTA'
import { CTABanner } from '@/components/ui/CTABanner'

export default function HomePage() {
  return (
    <>
      <Hero />
      <LiveCustomizationDemo />
      <AITrendingSection />
      <WhyChooseUs />
      <CorporateServices />
      <BulkOrderCTA />
      <GMBSection />
      <ReviewsSection />
      <LocalSeoSection />
      <FAQAccordion />
      <ColorShowcase />
      <CTABanner
        title="Ready to print your brand?"
        subtitle="Upload your design, preview on a premium tee mockup, and order in minutes — or get a bulk quote for your team."
        primary={{ label: 'Customize Now', href: '/design' }}
        secondary={{ label: 'Shop Tees', href: '/shop' }}
      />
    </>
  )
}
