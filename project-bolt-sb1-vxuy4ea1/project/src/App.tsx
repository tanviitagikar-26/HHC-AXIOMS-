import { FormEvent, useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { PhotoHero, type HeroSlide } from '@/components/PhotoHero';
import { AdminImageField, AdminPhotoGroup, type PhotoFields } from '@/components/AdminImageField';
import '@/contact.css';
import {
  ArrowRight,
  Beaker,
  Check,
  ClipboardList,
  FlaskConical,
  Factory,
  Globe2,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Microscope,
  PackageCheck,
  Phone,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react';

const sourceImages = {
  hero: 'https://hhcaxioms.com/wp-content/uploads/2026/09/slider-head1.webp',
  secondary: 'https://hhcaxioms.com/wp-content/uploads/2026/09/slider3.webp',
  research: 'https://hhcaxioms.com/wp-content/uploads/2026/09/macbook3.webp',
  team: 'https://hhcaxioms.com/wp-content/uploads/2026/09/WhatsApp-Image-2026-09-25-at-8.23.10-PM.jpeg',
};

const verificationImages = [
  { src: '/images/verification-iso-9001.png', alt: 'Submitted ISO 9001:2015 certification seal' },
  { src: '/images/verification-gmp.png', alt: 'Submitted Good Manufacturing Practice certification seal' },
  { src: '/images/verification-gmp-gold.png', alt: 'Submitted gold Good Manufacturing Practice certification seal' },
  { src: '/images/verification-who-gmp.png', alt: 'Submitted WHO-GMP seal' },
  { src: '/images/verification-iec.png', alt: 'Submitted IEC AAGCH3168Q registration badge' },
  { src: '/images/verification-fssai.png', alt: 'Submitted FSSAI registration badge, number 11223999000280' },
];

type NavItem = { label: string; path: string; page_key?: string; sort_order: number };
type SiteContent = { id: string; content_key: string; eyebrow: string; title: string; body: string; image_url?: string | null; storage_path?: string | null; side_image_url?: string | null; side_storage_path?: string | null };
type SiteTab = NavItem & { id: string; page_key: string; is_visible: boolean };
type HeroSlideRow = { id: string; page_key: string; position: number; image_url: string | null; storage_path: string | null; alt_text: string };
const navItems: NavItem[] = [
  { label: 'Capabilities', path: '/capabilities', page_key: 'capabilities', sort_order: 1 },
  { label: 'Quality', path: '/quality', page_key: 'quality', sort_order: 2 },
  { label: 'About', path: '/about', page_key: 'about', sort_order: 3 },
  { label: 'Gallery', path: '/gallery', page_key: 'gallery', sort_order: 4 },
  { label: 'Contact', path: '/contact', page_key: 'contact', sort_order: 5 },
];

const defaultContent: Record<string, SiteContent> = {
  home_hero: { id: 'default-home-hero', content_key: 'home_hero', eyebrow: 'HHC AXIOMS PRIVATE LIMITED', title: 'Manufacturing nutraceuticals with purpose.', body: 'A growing nutraceutical manufacturing company supporting brands with formulation, production, and quality-focused delivery.' },
  capabilities_intro: { id: 'default-capabilities', content_key: 'capabilities_intro', eyebrow: 'Capabilities', title: 'Manufacturing support built around your brief.', body: 'HHC Axioms states that it manufactures a wide range of nutraceutical formulations and offers third-party manufacturing and loan licensing services.' },
  quality_intro: { id: 'default-quality', content_key: 'quality_intro', eyebrow: 'Quality & compliance', title: 'Quality is part of the manufacturing conversation.', body: 'HHC Axioms describes a strong focus on quality, innovation, and regulatory compliance. Specific certificates and standards are not published on the source page and are marked for verification below.' },
  about_intro: { id: 'default-about', content_key: 'about_intro', eyebrow: 'Company', title: 'A growing company with a research-led outlook.', body: 'HHC Axioms Pvt. Ltd. is described by the source site as a nutraceutical manufacturing company dedicated to quality, innovation, and regulatory compliance.' },
  gallery_intro: { id: 'default-gallery', content_key: 'gallery_intro', eyebrow: 'Gallery', title: 'A closer look at the work behind the brief.', body: 'Explore a selection of HHC Axioms imagery from manufacturing, research, and company communications.' },
  contact_intro: { id: 'default-contact', content_key: 'contact_intro', eyebrow: 'Contact', title: 'Tell us what you are building.', body: 'Send an inquiry to start a conversation about nutraceutical manufacturing, formulation development, third-party manufacturing, or loan licensing.' },
};

function pageKeyForContent(row: SiteContent) {
  return row.content_key === 'home_hero' ? 'home' : row.content_key.replace(/_intro$/, '');
}

function sideImageFor(content: SiteContent) {
  return content.side_image_url ?? (content.content_key === 'quality_intro' ? content.image_url : null) ?? null;
}

function slidesForPage(pageKey: string, contentRow: SiteContent, rows: HeroSlideRow[]): HeroSlide[] {
  const savedSlides = rows
    .filter((slide) => slide.page_key === pageKey)
    .sort((first, second) => first.position - second.position)
    .flatMap((slide) => slide.image_url ? [{ src: slide.image_url, alt: slide.alt_text || `${contentRow.eyebrow} photo` }] : []);
  if (savedSlides.length) return savedSlides;

  const fallbackImages: Record<string, string | undefined> = {
    home: contentRow.image_url ?? sourceImages.hero,
    capabilities: contentRow.image_url ?? '/images/image%20copy%202.png',
    quality: undefined,
    about: contentRow.image_url ?? sourceImages.team,
    gallery: contentRow.image_url ?? sourceImages.secondary,
    contact: contentRow.image_url ?? undefined,
  };
  const fallback = fallbackImages[pageKey];
  return fallback ? [{ src: fallback, alt: `${contentRow.eyebrow} photo` }] : [];
}

const galleryImages: { src: string; alt: string; category: string; label: string; designation?: string; bio?: string }[] = [
  {
    src: '/gallery/pavan-deshpande-founder.webp',
    alt: 'Mr. Pavan Deshpande, Chairman and Founder of HHC Axioms Pvt. Ltd.',
    category: 'HHC Axioms',
    label: 'Mr. Pavan Deshpande',
    designation: 'Chairman, Founder & MD',
    bio: 'Mr. Pavan Deshpande is Chairman and Founder of HHC Axioms Pvt. Ltd. and a well-known philanthropist, with around 25 years of experience managing marketing projects from conception to completion. Since the company’s inception, he has been associated with key products and is a core part of Hi-tech Health Care, HHC Axioms’ marketing arm. He has helped establish offices in three countries and expand product availability in domestic and international markets.',
  },
  { src: '/gallery/hhc-axioms-team-gathering.jpg', alt: 'HHC Axioms team gathered together', category: 'HHC Axioms', label: 'HHC Axioms team gathering' },
  { src: '/gallery/hhc-axioms-corporate-office.webp', alt: 'Corporate office building framed by palm trees', category: 'HHC Axioms', label: 'Corporate office exterior' },
  { src: '/gallery/production-environment/02-mass-mixer.webp', alt: 'Mass mixer used in the production environment', category: 'Production Environment', label: 'Mass mixer' },
  { src: '/gallery/production-environment/03-blister-packaging-machine.webp', alt: 'Blister packaging machine in the production environment', category: 'Production Environment', label: 'Blister packaging machine' },
  { src: '/gallery/production-environment/04-stainless-steel-equipment-table.webp', alt: 'Stainless steel equipment table', category: 'Production Environment', label: 'Stainless steel equipment table' },
  { src: '/gallery/production-environment/05-blister-machine.webp', alt: 'Blister machine in the production environment', category: 'Production Environment', label: 'Blister machine' },
  { src: '/gallery/production-environment/06-fluid-bed-dryer.webp', alt: 'Fluidised bed dryer', category: 'Production Environment', label: 'Fluidised bed dryer' },
  { src: '/gallery/production-environment/07-tablet-compression-machine.webp', alt: 'Tablet compression machine', category: 'Production Environment', label: 'Tablet compression machine' },
  { src: '/gallery/production-environment/08-coating-pan.webp', alt: 'Coating pan in the production environment', category: 'Production Environment', label: 'Coating pan' },
  { src: '/gallery/production-environment/09-liquid-sealing-machine.webp', alt: 'Liquid sealing machine', category: 'Production Environment', label: 'Liquid sealing machine' },
  { src: '/gallery/production-environment/10-tablet-compression-unit.webp', alt: 'Tablet compression unit', category: 'Production Environment', label: 'Tablet compression unit' },
  { src: '/gallery/production-environment/11-sachet-packaging-machine.webp', alt: 'Sachet packaging machine', category: 'Production Environment', label: 'Sachet packaging machine' },
  { src: '/gallery/production-environment/12-liquid-mixing-tank.webp', alt: 'Liquid mixing tank', category: 'Production Environment', label: 'Liquid mixing tank' },
  { src: '/gallery/production-environment/13-sachet-sealing-machine.webp', alt: 'Sachet sealing machine', category: 'Production Environment', label: 'Sachet sealing machine' },
  { src: '/gallery/production-environment/14-printing-conveyor.webp', alt: 'Printing machine and conveyor', category: 'Production Environment', label: 'Printing machine' },
  { src: '/gallery/production-environment/15-liquid-filling-machine.webp', alt: 'Liquid filling machine', category: 'Production Environment', label: 'Liquid filling machine' },
  { src: '/gallery/production-environment/16-blister-packaging-line.webp', alt: 'Blister packaging line', category: 'Production Environment', label: 'Blister packaging line' },
  { src: '/gallery/exhibition-product-display.jpg', alt: 'HHC Axioms team at an exhibition booth with product displays', category: 'Manufacturing Capability', label: 'Product display at the exhibition' },
  { src: '/gallery/exhibition-team-and-display.jpg', alt: 'HHC Axioms representatives beside the exhibition product display', category: 'Manufacturing Capability', label: 'Team at the product display' },
  { src: '/gallery/exhibition-booth-88.jpg', alt: 'HHC Axioms representatives at exhibition booth 88', category: 'Manufacturing Capability', label: 'Exhibition booth 88' },
  { src: '/gallery/hhc-axioms-exhibition-stand.jpg', alt: 'HHC Axioms team in front of the company exhibition stand', category: 'Manufacturing Capability', label: 'HHC Axioms exhibition stand' },
  { src: '/gallery/d155-exhibition-booth.jpg', alt: 'HHC Axioms representatives at the D155 exhibition booth', category: 'Manufacturing Capability', label: 'D155 exhibition booth' },
];

const process = [
  { number: '01', title: 'Brief', text: 'Share your product, format, volume, and market requirements.', icon: ClipboardList },
  { number: '02', title: 'Formulation', text: 'Explore formulation and development support with our team.', icon: FlaskConical },
  { number: '03', title: 'Production', text: 'Move from approved specification to commercial manufacture.', icon: Factory },
  { number: '04', title: 'Quality', text: 'Quality-focused checks support consistent, documented output.', icon: Microscope },
  { number: '05', title: 'Delivery', text: 'Coordinate finished goods for your next business milestone.', icon: PackageCheck },
];

function navigate(path: string) {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function Header({ tabs }: { tabs: NavItem[] }) {
  const [open, setOpen] = useState(false);
  return (
    <header className="site-header">
      <div className="container header-inner">
        <button className="brand" onClick={() => navigate('/')} aria-label="HHC Axioms home">
          <img src="/hhc-axioms-logo.png" alt="HHC Axioms Private Limited" />
        </button>
        <nav className={open ? 'main-nav is-open' : 'main-nav'}>
          {tabs.map((item) => (
            <button key={item.path} onClick={() => { navigate(item.path); setOpen(false); }}>{item.label}</button>
          ))}
          <button className="nav-cta" onClick={() => { navigate('/contact'); setOpen(false); }}>Send an inquiry <ArrowRight size={16} /></button>
        </nav>
        <button className="menu-toggle" onClick={() => setOpen(!open)} aria-label="Toggle navigation">
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </header>
  );
}

function Footer({ tabs }: { tabs: NavItem[] }) {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <img className="footer-logo" src="/WhatsApp_Image_2026-11-02_at_1.10.18_PM-removebg-preview.png" alt="HHC Axioms Private Limited" />
          <p className="footer-note">Integrated manufacturing and development support for nutraceutical products.</p>
        </div>
        <div><p className="footer-label">Explore</p>{tabs.map((item) => <button className="footer-link" key={item.path} onClick={() => navigate(item.path)}>{item.label}</button>)}</div>
        <div><p className="footer-label">Offices</p><p className="footer-address">Belgaum · Goa · USA (in association)</p><button className="footer-link" onClick={() => navigate('/contact')}>View contact details <ArrowRight size={14} /></button></div>
      </div>
      <div className="container footer-bottom"><span>© {new Date().getFullYear()} HHC Axioms Pvt. Ltd.</span><span>Source-based content · Verify details before launch</span></div>
    </footer>
  );
}

function Home({ hero, slides, sideImage }: { hero: SiteContent; slides: HeroSlide[]; sideImage: string | null }) {
  return <>
    <div className="home-product-banner">
      <img src="/images/hhc-axioms-product-range.png" alt="HHC Axioms product range, including supplement bottles and company branding" loading="eager" />
    </div>
    <PhotoHero eyebrow={hero.eyebrow} title={hero.title} text={hero.body} slides={slides} label="Home" variant="home">
      <div className="hero-actions"><button className="button button-amber" onClick={() => navigate('/contact')}>Start a conversation <ArrowRight size={17} /></button><button className="text-button" onClick={() => navigate('/capabilities')}>Explore capabilities <ArrowRight size={17} /></button></div>
    </PhotoHero>
    <section className="signal-strip"><div className="container signal-grid"><div><span className="signal-number">25+</span><span className="signal-label">years of experience<br />stated by HHC Axioms</span></div><div><span className="signal-icon"><Beaker size={21} /></span><span className="signal-label">Research-led<br />development mindset</span></div><div><span className="signal-icon"><Globe2 size={21} /></span><span className="signal-label">Support across<br />international frontiers</span></div></div></section>
    <section className="section process-section"><div className="container"><div className="section-heading"><p className="eyebrow">How we work</p><h2>A clear path from brief to batch.</h2><p>HHC Axioms describes an integrated approach across research, development, manufacturing, and delivery.</p></div><div className="process-grid">{process.map((step) => <div className="process-card" key={step.number}><div className="process-top"><span>{step.number}</span><step.icon size={23} /></div><h3>{step.title}</h3><p>{step.text}</p></div>)}</div></div></section>
    <section className="split-feature"><div className="split-image"><img src={sideImage ?? sourceImages.secondary} alt="HHC Axioms manufacturing and research" loading="lazy" decoding="async" /></div><div className="split-copy"><p className="eyebrow">What sets us apart</p><h2>Experience, innovation, and manufacturing in one conversation.</h2><p>HHC Axioms highlights experience, research and development, marketing, and manufacturing as the foundations of its work.</p><button className="button button-dark" onClick={() => navigate('/about')}>Meet the company <ArrowRight size={17} /></button></div></section>
    <section className="section dark-callout"><div className="container callout-inner"><div><p className="eyebrow amber">Have a product brief?</p><h2>Bring the next conversation to the table.</h2></div><button className="button button-amber" onClick={() => navigate('/contact')}>Send an inquiry <ArrowRight size={17} /></button></div></section>
  </>;
}

function Capabilities({ content, slides, sideImage }: { content: SiteContent; slides: HeroSlide[]; sideImage: string | null }) {
  return <><PhotoHero eyebrow={content.eyebrow} title={content.title} text={content.body} slides={slides} label="Capabilities" /><section className="section"><div className="container"><div className="capability-grid"><article className="capability-card featured"><span className="card-index">01 / 04</span><Beaker size={30} /><h2>Formulation development</h2><p>Work with a team focused on developing nutraceutical formulations for modern healthcare and nutritional needs.</p></article><article className="capability-card"><span className="card-index">02 / 04</span><Factory size={30} /><h2>Third-party manufacturing</h2><p>Manufacturing support for brands and businesses bringing their own nutraceutical products to market.</p></article><article className="capability-card"><span className="card-index">03 / 04</span><ClipboardList size={30} /><h2>Loan licensing</h2><p>A stated service that enables businesses to develop and market their own nutraceutical products.</p></article><article className="capability-card"><span className="card-index">04 / 04</span><Sparkles size={30} /><h2>Product combinations</h2><p>HHC Axioms states it can manufacture an extensive list of products with various combinations.</p></article></div></div></section><section className="split-feature"><div className="split-image"><img src={sideImage ?? '/images/image%20copy%203.png'} alt="Operator in a white cleanroom gown and face mask tending a capsule filling machine" loading="lazy" decoding="async" /></div><div className="split-copy"><p className="eyebrow">For buyers</p><h2>Start with the information that matters.</h2><p>Share your intended product, dosage form, target market, expected volumes, and timing. The HHC Axioms team can then respond to the brief and clarify what support is available.</p><button className="button button-dark" onClick={() => navigate('/contact')}>Discuss your brief <ArrowRight size={17} /></button></div></section></>;
}

function Gallery({ content, slides, sideImage }: { content: SiteContent; slides: HeroSlide[]; sideImage: string | null }) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [founderImageUnavailable, setFounderImageUnavailable] = useState(false);

  useEffect(() => {
    if (selectedIndex === null) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedIndex(null);
    };
    window.addEventListener('keydown', closeOnEscape);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', closeOnEscape);
      document.body.style.overflow = '';
    };
  }, [selectedIndex]);

  const selectedImage = selectedIndex === null ? null : galleryImages[selectedIndex];
  const galleryCategories = Array.from(new Set(galleryImages.map((image) => image.category)));

  return <>
    <PhotoHero eyebrow={content.eyebrow} title={content.title} text={content.body} slides={slides} label="Gallery" />
    <section className="section gallery-section">
      <div className="container">
        <div className={sideImage ? 'gallery-intro has-side-photo' : 'gallery-intro'}>
          <div className="section-heading gallery-heading"><p className="eyebrow">Company imagery</p><h2>Inside the operation.</h2><p>Browse production equipment, exhibition, and team photos. Select any photo to view the full image.</p></div>
          {sideImage && <img className="gallery-side-photo" src={sideImage} alt="HHC Axioms company imagery" loading="lazy" decoding="async" />}
        </div>
        {galleryCategories.map((category) => <section className="gallery-category-group" key={category} aria-label={`${category} photos`}>
          <div className="gallery-category-heading"><div><p className="eyebrow">Gallery collection</p><h3>{category}</h3></div><span>{galleryImages.filter((image) => image.category === category).length} photos</span></div>
          <div className="gallery-grid">
            {galleryImages.map((image, index) => image.category === category && <button className={image.designation ? 'gallery-card gallery-card-featured' : 'gallery-card'} key={image.src} onClick={() => setSelectedIndex(index)} aria-label={`View larger: ${image.label}${image.designation ? `, ${image.designation}` : ''}`}>
              <span className="gallery-image-frame">
                {!(image.designation && founderImageUnavailable) && <img src={image.src} alt={image.alt} loading="lazy" decoding="async" onError={image.designation ? () => setFounderImageUnavailable(true) : undefined} />}
                {image.designation && founderImageUnavailable && <span className="gallery-image-fallback">Founder photo unavailable</span>}
              </span>
              <span className="gallery-caption"><span><small>{image.designation ?? image.category}</small><strong>{image.label}</strong></span><ArrowRight size={16} /></span>
            </button>)}
          </div>
        </section>)}
      </div>
    </section>
    {selectedImage && selectedIndex !== null && <div className={selectedImage.bio ? 'lightbox founder-lightbox' : 'lightbox'} role="dialog" aria-modal="true" aria-label={`${selectedImage.label} enlarged view`} onClick={() => setSelectedIndex(null)}>
      <button className="lightbox-close" onClick={() => setSelectedIndex(null)} aria-label="Close enlarged image"><X size={24} /></button>
      <button className="lightbox-control lightbox-prev" onClick={(event) => { event.stopPropagation(); setSelectedIndex((selectedIndex - 1 + galleryImages.length) % galleryImages.length); }} aria-label="Previous image">‹</button>
      {!(selectedImage.designation && founderImageUnavailable)
        ? <img src={selectedImage.src} alt={selectedImage.alt} onClick={(event) => event.stopPropagation()} onError={selectedImage.designation ? () => setFounderImageUnavailable(true) : undefined} />
        : <div className="founder-lightbox-image-fallback">Founder photo unavailable</div>}
      {selectedImage.bio && <div className="founder-lightbox-copy" onClick={(event) => event.stopPropagation()}>
        <p className="eyebrow amber">{selectedImage.designation}</p>
        <h2>{selectedImage.label}</h2>
        <p>{selectedImage.bio}</p>
      </div>}
      <button className="lightbox-control lightbox-next" onClick={(event) => { event.stopPropagation(); setSelectedIndex((selectedIndex + 1) % galleryImages.length); }} aria-label="Next image">›</button>
    </div>}
  </>;
}

function About({ content, slides, sideImage }: { content: SiteContent; slides: HeroSlide[]; sideImage: string | null }) {
  return <>
    <PhotoHero eyebrow={content.eyebrow} title={content.title} text={content.body} slides={slides} label="About" />
    <section className="section">
      <div className="container about-layout">
        <div className="about-main">
          <p className="eyebrow">About HHC Axioms</p>
          <h2>From development to commercial manufacturing.</h2>
          <p>HHC Axioms Pvt. Ltd. describes its work across a wide range of nutraceutical formulations, supporting brands and businesses with third-party manufacturing and loan licensing services.</p>
          <p>The company states that it invests in research and development through its centres and research collaboration with scientific institutes, biotechnology companies, and pharmaceutical companies.</p>
          <p>The source also references capabilities across drug discovery and development, commercial manufacturing of drug substances, and nutraceutical products. This website presents the nutraceutical manufacturing identity as the primary buyer-facing focus.</p>
        </div>
        <aside className="fact-rail">
          <div><span>01</span><strong>Experience</strong><p>Over 25 years, as stated on the source site.</p></div>
          <div><span>02</span><strong>Focus</strong><p>Quality, innovation, and regulatory compliance.</p></div>
          <div><span>03</span><strong>Reach</strong><p>Belgaum, Goa, and USA in association.</p></div>
        </aside>
      </div>
    </section>
    <section className="section about-principles">
      <div className="container">
        <div className="section-heading">
          <p className="eyebrow">What guides us</p>
          <h2>Our purpose, vision & commitment.</h2>
        </div>
        <div className="principles-grid">
          <article className="principle-card">
            <div className="principle-icon"><Globe2 size={26} /></div>
            <h3>Our Vision</h3>
            <p className="principle-lead">We will:</p>
            <ul>
              <li>Put the patient first.</li>
              <li>Make a difference in people’s lives through exceptional care and service.</li>
              <li>Create a healing environment where passionate people thrive and excel, and lead collaborative efforts to solve our community’s healthcare challenges.</li>
            </ul>
          </article>
          <article className="principle-card">
            <div className="principle-icon"><Microscope size={26} /></div>
            <h3>Our Mission</h3>
            <p>We serve our communities with exceptional care—preventing illness, restoring health, and bringing comfort to everyone who entrusts us with their care.</p>
          </article>
          <article className="principle-card">
            <div className="principle-icon"><ShieldCheck size={26} /></div>
            <h3>Our Commitment</h3>
            <ul>
              <li>We are here to help you on your path to better health.</li>
              <li>Each of us is here to care, guide, motivate, comfort, and inspire.</li>
              <li>The work we do is meaningful and sets us apart.</li>
              <li>We believe you are an integral part of the care team.</li>
              <li>We are here to serve you from beginning to end.</li>
              <li>We are dedicated to enriching your experience—body, mind, and spirit, whenever and wherever we meet.</li>
            </ul>
          </article>
        </div>
      </div>
    </section>
    <section className="image-band" style={{ backgroundImage: `linear-gradient(90deg, rgba(20,24,26,.8), rgba(20,24,26,.25)), url(${sideImage ?? sourceImages.research})` }}>
      <div className="container"><p className="eyebrow amber">Research & development</p><h2>Believing in the power of research.</h2></div>
    </section>
  </>;
}

function Quality({ content, slides, sideImage }: { content: SiteContent; slides: HeroSlide[]; sideImage: string | null }) {
  return <>
    <PhotoHero eyebrow={content.eyebrow} title={content.title} text={content.body} slides={slides} label="Quality" variant="quality" />
    <section className="section">
      <div className="container quality-layout">
        <div>
          {sideImage && <img className="quality-side-photo" src={sideImage} alt={content.title} loading="lazy" decoding="async" />}
          <p className="eyebrow">Quality approach</p>
          <h2>Built around documented, careful work.</h2>
          <p>From formulation development through final production, the source site states that products are intended to meet stringent quality standards. Buyers should confirm the current quality system, applicable standards, and documentation directly with HHC Axioms.</p>
          <button type="button" className="button button-dark quality-request-button" onClick={() => navigate('/contact')}>Request quality information <ArrowRight size={17} /></button>
        </div>
        <div className="quality-list">
          <div><ShieldCheck size={22} /><span><strong>Regulatory compliance</strong><small>Stated as a company focus; exact registrations and certificates require confirmation.</small></span></div>
          <div><Microscope size={22} /><span><strong>Research & development</strong><small>R&D and research collaboration are described on the source site.</small></span></div>
          <div><Check size={22} /><span><strong>Quality standards</strong><small>Stringent quality standards are referenced; detailed evidence is a launch placeholder.</small></span></div>
        </div>
      </div>
    </section>
    <section className="section verification">
      <div className="container verification-layout">
        <div className="verification-box">
          <p className="eyebrow">Buyer verification</p>
          <h2>Certifications and registrations</h2>
        </div>
        <div className="verification-gallery">
          {verificationImages.map((image) => (
            <img className="verification-image-card" key={image.src} src={image.src} alt={image.alt} loading="lazy" decoding="async" />
          ))}
        </div>
      </div>
    </section>
  </>;
}

function Contact({ content, slides, sideImage }: { content: SiteContent; slides: HeroSlide[]; sideImage: string | null }) {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [submittedInquiry, setSubmittedInquiry] = useState<{ full_name: string; company: string; email: string; phone: string; message: string } | null>(null);

  function inquiryMessage(inquiry: NonNullable<typeof submittedInquiry>) {
    return [
      `1. Full name: ${inquiry.full_name}`,
      `2. Company: ${inquiry.company}`,
      `3. Work email: ${inquiry.email}`,
      `4. Phone: ${inquiry.phone}`,
      `5. Tell us about your brief: ${inquiry.message}`,
    ].join('\n');
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSubmitted(false);
    setBusy(true);
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const payload = {
      full_name: String(form.get('full_name') || '').trim(),
      company: String(form.get('company') || '').trim(),
      email: String(form.get('email') || '').trim(),
      phone: String(form.get('phone') || '').trim(),
      message: String(form.get('message') || '').trim(),
    };
    let inquirySaved = false;
    try {
      if (!supabase) {
        setError('The inquiry form is not connected yet. Please call or email HHC Axioms using the contact details shown.');
        return;
      }
      const { error: insertError } = await supabase.from('contact_inquiries').insert(payload);
      if (insertError) {
        console.error('contact inquiry could not be saved', {
          code: insertError.code,
          message: insertError.message,
        });
        if (insertError.code === '42501') {
          setError('The inquiry service is not accepting submissions yet. Please contact HHC Axioms directly.');
        } else if (['42P01', 'PGRST204', 'PGRST205'].includes(insertError.code)) {
          setError('The inquiry service is not fully configured yet. Please contact HHC Axioms directly.');
        } else {
          setError('We could not save your inquiry right now. Please try again or contact HHC Axioms directly.');
        }
        return;
      }

      inquirySaved = true;
      setSubmittedInquiry(payload);
      formElement.reset();
      const { error: notificationError } = await supabase.functions.invoke('contact-notification', { body: payload });
      if (notificationError) {
        console.error('contact inquiry email notification could not be sent', notificationError);
        setError('Your inquiry was saved, but the automatic email could not be sent. Please use the email or WhatsApp links below to notify the team.');
      } else {
        setSubmitted(true);
      }
    } catch (submissionError) {
      console.error('contact inquiry submission failed', submissionError);
      if (inquirySaved) {
        setSubmittedInquiry(payload);
        formElement.reset();
        setError('Your inquiry was saved, but the automatic email could not be confirmed. Please use the email or WhatsApp links below to notify the team.');
      } else {
        setError('We could not send your inquiry right now. Please try again or contact HHC Axioms directly.');
      }
    } finally {
      setBusy(false);
    }
  }
  const fallbackMessage = submittedInquiry ? inquiryMessage(submittedInquiry) : '';
  const mailtoUrl = submittedInquiry
    ? `mailto:info@hhcaxioms.com?subject=${encodeURIComponent(`Website inquiry from ${submittedInquiry.full_name}`)}&body=${encodeURIComponent(fallbackMessage)}`
    : '';
  const whatsappUrl = submittedInquiry
    ? `https://wa.me/916360551717?text=${encodeURIComponent(fallbackMessage)}`
    : '';

  return <><PhotoHero eyebrow={content.eyebrow} title={content.title} text={content.body} slides={slides} label="Contact" /><section className="section"><div className="container contact-layout"><div className="contact-info">{sideImage && <img className="contact-side-photo" src={sideImage} alt="HHC Axioms contact information" loading="lazy" decoding="async" />}<p className="eyebrow">HHC Axioms Pvt. Ltd.</p><h2>Let’s make the brief useful.</h2><p>Share the essentials and the team can help clarify the next step.</p><div className="contact-detail"><MapPin size={19} /><div><strong>Belgaum Office</strong><span>Plot No. 190, KIADB, Auto Nagar, Belgaum-590015, Karnataka</span></div></div><div className="contact-detail"><MapPin size={19} /><div><strong>Goa Office</strong><span>Knowell House, 233/1, Bella Vista, Sangolda, Bardez, Goa, India</span></div></div><div className="contact-detail"><Globe2 size={19} /><div><strong>USA (in association)</strong><span>HHC: 4000, Bearcat Way Suite: 100, Morrisville, Health Care NC, 27560, USA</span></div></div><div className="contact-detail"><Phone size={19} /><div><strong>Phone</strong><a href="tel:+916360551717">+916360551717</a></div></div><div className="contact-detail"><Mail size={19} /><div><strong>Email</strong><a href="mailto:info@hhcaxioms.com">info@hhcaxioms.com</a></div></div></div><form className="inquiry-form" onSubmit={(event) => { void submit(event); }}><div className="form-heading"><span>01</span><h3>Send an inquiry</h3></div><label>Full name<input name="full_name" autoComplete="name" required minLength={2} maxLength={120} /></label><div className="form-row"><label>Company<input name="company" autoComplete="organization" required minLength={2} maxLength={160} /></label><label>Work email<input name="email" type="email" autoComplete="email" required maxLength={254} /></label></div><label>Phone<input name="phone" type="tel" autoComplete="tel" required minLength={7} maxLength={40} /></label><label>Tell us about your brief<textarea name="message" required minLength={10} maxLength={4000} rows={5} placeholder="Product format, approximate volume, market, or timing"></textarea></label>{error && <p className="form-message error" role="alert">{error}</p>}{submitted && <p className="form-message success" role="status">Thanks — your inquiry has been received.</p>}{submittedInquiry && <div className="contact-follow-up"><p>If the team does not reach you, you can also send the same five details directly:</p><a className="button button-dark" href={mailtoUrl}><Mail size={16} /> Email HHC Axioms</a><a className="button button-dark" href={whatsappUrl} target="_blank" rel="noreferrer"><MessageCircle size={16} /> Send on WhatsApp</a></div>}<button className="button button-amber form-submit" disabled={busy}>{busy ? 'Sending…' : 'Send inquiry'} <ArrowRight size={17} /></button></form></div></section></>;
}

function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [notice, setNotice] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) { setError('Sign-in is unavailable right now.'); return; }
    setBusy(true); setError(''); setNotice('');
    if (mode === 'signin') {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) setError('The email or password was not accepted.');
    } else {
      const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
      if (signUpError) setError(signUpError.message);
      else if (!data.session) setNotice('Account created. Sign in with your new email and password.');
    }
    setBusy(false);
  }

  function switchMode() {
    setMode((current) => (current === 'signin' ? 'signup' : 'signin'));
    setError(''); setNotice('');
  }

  const isSignUp = mode === 'signup';

  return <main className="admin-shell"><div className="admin-login"><p className="eyebrow">Restricted area</p><h1>{isSignUp ? 'Create admin account' : 'Admin sign in'}</h1><p>Authorized HHC Axioms administrators can manage public website content here.</p><div className="admin-mode-tabs" role="tablist"><button type="button" role="tab" aria-selected={!isSignUp} className={!isSignUp ? 'is-active' : ''} onClick={() => { if (isSignUp) switchMode(); }}>Sign in</button><button type="button" role="tab" aria-selected={isSignUp} className={isSignUp ? 'is-active' : ''} onClick={() => { if (!isSignUp) switchMode(); }}>Create account</button></div><form className="inquiry-form" onSubmit={submit}><label>Email address<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" /></label><label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={isSignUp ? 6 : undefined} autoComplete={isSignUp ? 'new-password' : 'current-password'} /></label>{error && <p className="form-message error">{error}</p>}{notice && <p className="form-message success">{notice}</p>}<button className="button button-amber form-submit" disabled={busy}>{busy ? (isSignUp ? 'Creating account…' : 'Signing in…') : (isSignUp ? 'Create account' : 'Sign in')} <ArrowRight size={17} /></button></form></div></main>;
}

function AdminPage({ session }: { session: Session }) {
  const [access, setAccess] = useState<'checking' | 'allowed' | 'denied'>('checking');
  const [contentRows, setContentRows] = useState<SiteContent[]>([]);
  const [tabs, setTabs] = useState<SiteTab[]>([]);
  const [heroSlides, setHeroSlides] = useState<HeroSlideRow[]>([]);
  const [newTab, setNewTab] = useState({ label: '', path: '', page_key: '', sort_order: '6' });
  const [message, setMessage] = useState('');

  useEffect(() => {
    let active = true;
    async function checkAccess() {
      if (!supabase) { if (active) setAccess('denied'); return; }
      const client = supabase;
      const { data, error } = await client.from('profiles').select('role').eq('id', session.user.id).maybeSingle();
      if (active) setAccess(!error && data?.role === 'admin' ? 'allowed' : 'denied');
    }
    void checkAccess();
    return () => { active = false; };
  }, [session.user.id]);

  useEffect(() => {
    if (access !== 'allowed' || !supabase) return;
    const client = supabase;
    let active = true;
    async function loadAdminData() {
      const [{ data: contentData, error: contentError }, { data: tabData, error: tabError }, { data: heroData, error: heroError }] = await Promise.all([
        client.from('site_content').select('id, content_key, eyebrow, title, body, image_url, storage_path, side_image_url, side_storage_path').order('content_key'),
        client.from('site_tabs').select('id, label, path, page_key, sort_order, is_visible').order('sort_order'),
        client.from('hero_slides').select('id, page_key, position, image_url, storage_path, alt_text').order('page_key').order('position'),
      ]);
      if (contentError) console.error('site content could not be loaded for admin photo editing', contentError);
      if (tabError) console.error('site tabs could not be loaded for admin editing', tabError);
      if (heroError) console.error('hero photos could not be loaded for admin editing', heroError);
      if (active) {
        setContentRows((contentData as SiteContent[] | null) ?? []);
        setTabs((tabData as SiteTab[] | null) ?? []);
        setHeroSlides((heroData as HeroSlideRow[] | null) ?? []);
      }
    }
    void loadAdminData();
    return () => { active = false; };
  }, [access]);

  async function saveContent(row: SiteContent) {
    if (!supabase) return;
    const client = supabase;
    const { error } = await client.from('site_content').update({ eyebrow: row.eyebrow, title: row.title, body: row.body, updated_at: new Date().toISOString() }).eq('id', row.id);
    setMessage(error ? 'We could not save that content.' : 'Content saved.');
  }

  async function saveContentPhoto(row: SiteContent, fields: PhotoFields): Promise<boolean> {
    if (!supabase) return false;
    const client = supabase;
    const sideFields = { side_image_url: fields.image_url, side_storage_path: fields.storage_path };
    const { error } = await client.from('site_content').update({ ...sideFields, updated_at: new Date().toISOString() }).eq('id', row.id);
    if (error) { setMessage('We could not save that photo.'); return false; }
    setContentRows((current) => current.map((item) => item.id === row.id ? { ...item, ...sideFields } : item));
    setMessage(fields.image_url ? 'Photo saved.' : 'Photo removed.');
    return true;
  }

  async function saveHeroSlot(pageKey: string, position: number, fields: PhotoFields): Promise<boolean> {
    if (!supabase) return false;
    const client = supabase;
    const { data, error } = await client.from('hero_slides').upsert({ page_key: pageKey, position, ...fields }, { onConflict: 'page_key,position' }).select('id, page_key, position, image_url, storage_path, alt_text').maybeSingle();
    if (error || !data) { setMessage('We could not save that hero photo.'); return false; }
    setHeroSlides((current) => [...current.filter((item) => item.page_key !== pageKey || item.position !== position), data as HeroSlideRow].sort((first, second) => first.page_key.localeCompare(second.page_key) || first.position - second.position));
    setMessage(fields.image_url ? 'Hero photo saved.' : 'Hero photo removed.');
    return true;
  }

  async function saveTab(tab: SiteTab) {
    if (!supabase) return;
    const client = supabase;
    const { error } = await client.from('site_tabs').update({ label: tab.label, path: tab.path, page_key: tab.page_key, sort_order: tab.sort_order, is_visible: tab.is_visible, updated_at: new Date().toISOString() }).eq('id', tab.id);
    setMessage(error ? 'We could not save that tab.' : 'Tab saved.');
  }

  async function addTab(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) return;
    const client = supabase;
    const { data, error } = await client.from('site_tabs').insert({ label: newTab.label, path: newTab.path, page_key: newTab.page_key, sort_order: Number(newTab.sort_order), is_visible: true }).select('id, label, path, page_key, sort_order, is_visible').maybeSingle();
    if (error || !data) { setMessage('We could not add that tab. Check that its path is unique.'); return; }
    setTabs((current) => [...current, data as SiteTab].sort((first, second) => first.sort_order - second.sort_order));
    setNewTab({ label: '', path: '', page_key: '', sort_order: String(tabs.length + 6) });
    setMessage('Tab added.');
  }

  async function deleteTab(id: string) {
    if (!supabase || !window.confirm('Remove this tab from the public navigation?')) return;
    const client = supabase;
    const { error } = await client.from('site_tabs').delete().eq('id', id);
    if (error) { setMessage('We could not remove that tab.'); return; }
    setTabs((current) => current.filter((tab) => tab.id !== id));
    setMessage('Tab removed.');
  }

  if (access === 'checking') return <main className="admin-shell"><div className="admin-status">Checking administrator access…</div></main>;
  if (access === 'denied') return <main className="admin-shell"><div className="admin-status"><p className="eyebrow">403 · Access denied</p><h1>Administrator access required.</h1><p>This area is only available to approved HHC Axioms administrators.</p><button className="button button-dark" onClick={() => { void supabase?.auth.signOut(); }}>Sign out</button></div></main>;

  return <main className="admin-shell"><div className="container admin-container"><div className="admin-topbar"><div><p className="eyebrow">Protected CMS</p><h1>Website admin</h1><p>Signed in as {session.user.email ?? 'administrator'}.</p></div><button className="button button-dark" onClick={() => { void supabase?.auth.signOut(); }}>Sign out</button></div>{message && <p className="admin-notice">{message}</p>}<section className="admin-panel"><div className="admin-panel-heading"><div><p className="eyebrow">Public copy</p><h2>Edit content</h2></div><span>{contentRows.length} records</span></div>{contentRows.map((row) => <div className="admin-content-row" key={row.id}><span className="admin-key">{row.content_key}</span><label>Eyebrow<input value={row.eyebrow} onChange={(event) => setContentRows((current) => current.map((item) => item.id === row.id ? { ...item, eyebrow: event.target.value } : item))} /></label><label>Title<input value={row.title} onChange={(event) => setContentRows((current) => current.map((item) => item.id === row.id ? { ...item, title: event.target.value } : item))} /></label><label>Body<textarea rows={3} value={row.body} onChange={(event) => setContentRows((current) => current.map((item) => item.id === row.id ? { ...item, body: event.target.value } : item))} /></label>{(() => { const pageKey = pageKeyForContent(row); const legacySidePhoto = row.content_key === 'quality_intro'; return <>
<AdminPhotoGroup title="Hero section photos" helper={`Sliding photos at the top of the ${pageKey} page, shown in slot order.`}>{[1, 2, 3].map((position) => { const slot = heroSlides.find((item) => item.page_key === pageKey && item.position === position); return <AdminImageField key={position} label={`Hero slide ${position}`} pathPrefix={`hero/${pageKey}-${position}`} imageUrl={slot?.image_url ?? null} storagePath={slot?.storage_path ?? null} onSave={(fields) => saveHeroSlot(pageKey, position, fields)} />; })}</AdminPhotoGroup>
<AdminPhotoGroup title="Side content photo" helper={`Shown in the ${pageKey} page's content area.`}><AdminImageField label="Side content photo" pathPrefix={`content/${pageKey}-side`} imageUrl={row.side_image_url ?? (legacySidePhoto ? row.image_url ?? null : null)} storagePath={row.side_storage_path ?? (legacySidePhoto ? row.storage_path ?? null : null)} onSave={(fields) => saveContentPhoto(row, fields)} /></AdminPhotoGroup>
</>; })()}<button className="button button-dark" onClick={() => { void saveContent(row); }}>Save content</button></div>)}</section><section className="admin-panel"><div className="admin-panel-heading"><div><p className="eyebrow">Navigation</p><h2>Manage tabs</h2></div><span>{tabs.length} records</span></div>{tabs.map((tab) => <div className="admin-tab-row" key={tab.id}><input aria-label="Tab label" value={tab.label} onChange={(event) => setTabs((current) => current.map((item) => item.id === tab.id ? { ...item, label: event.target.value } : item))} /><input aria-label="Tab path" value={tab.path} onChange={(event) => setTabs((current) => current.map((item) => item.id === tab.id ? { ...item, path: event.target.value } : item))} /><input aria-label="Tab content key" value={tab.page_key} onChange={(event) => setTabs((current) => current.map((item) => item.id === tab.id ? { ...item, page_key: event.target.value } : item))} /><input aria-label="Tab order" type="number" value={tab.sort_order} onChange={(event) => setTabs((current) => current.map((item) => item.id === tab.id ? { ...item, sort_order: Number(event.target.value) } : item))} /><label className="visibility-toggle"><input type="checkbox" checked={tab.is_visible} onChange={(event) => setTabs((current) => current.map((item) => item.id === tab.id ? { ...item, is_visible: event.target.checked } : item))} /> Visible</label><button className="button button-dark" onClick={() => { void saveTab(tab); }}>Save</button><button className="admin-delete" onClick={() => { void deleteTab(tab.id); }}>Remove</button></div>)}<form className="admin-add-tab" onSubmit={addTab}><h3>Add a tab</h3><input placeholder="Label" value={newTab.label} onChange={(event) => setNewTab({ ...newTab, label: event.target.value })} required /><input placeholder="/path" value={newTab.path} onChange={(event) => setNewTab({ ...newTab, path: event.target.value })} required /><input placeholder="Content key" value={newTab.page_key} onChange={(event) => setNewTab({ ...newTab, page_key: event.target.value })} required /><input placeholder="Order" type="number" value={newTab.sort_order} onChange={(event) => setNewTab({ ...newTab, sort_order: event.target.value })} required /><button className="button button-amber">Add tab <ArrowRight size={17} /></button></form></section></div></main>;
}

function App() {
  const [path, setPath] = useState(window.location.pathname);
  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [tabs, setTabs] = useState<NavItem[]>(navItems);
  const [content, setContent] = useState<Record<string, SiteContent>>(defaultContent);
  const [heroSlides, setHeroSlides] = useState<HeroSlideRow[]>([]);

  useEffect(() => {
    window.onpopstate = () => setPath(window.location.pathname);
    if (!supabase) { setAuthReady(true); return; }
    void supabase.auth.getSession().then(({ data }) => { setSession(data.session); setAuthReady(true); });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession));
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (path.startsWith('/admin') || !supabase) return;
    const client = supabase;
    let active = true;
    async function loadPublicCms() {
      const [{ data: contentData, error: contentError }, { data: tabData, error: tabError }, { data: heroData, error: heroError }] = await Promise.all([
        client.from('site_content').select('id, content_key, eyebrow, title, body, image_url, storage_path, side_image_url, side_storage_path'),
        client.from('site_tabs').select('id, label, path, page_key, sort_order, is_visible').eq('is_visible', true).order('sort_order'),
        client.from('hero_slides').select('id, page_key, position, image_url, storage_path, alt_text').order('page_key').order('position'),
      ]);
      if (!active) return;
      if (contentData) setContent({ ...defaultContent, ...Object.fromEntries((contentData as SiteContent[]).map((row) => [row.content_key, row])) });
      if (contentError) console.error('site content could not be loaded', contentError);
      if (tabError) console.error('site tabs could not be loaded', tabError);
      if (heroError) console.error('hero photos could not be loaded', heroError);
      if (heroData) setHeroSlides(heroData as HeroSlideRow[]);
      if (tabData?.length) setTabs(tabData as NavItem[]);
    }
    void loadPublicCms();
    return () => { active = false; };
  }, [path]);

  window.onpopstate = () => setPath(window.location.pathname);
  if (path.startsWith('/admin')) return !authReady ? <main className="admin-shell"><div className="admin-status">Loading…</div></main> : session ? <AdminPage session={session} /> : <AdminLogin />;

  const homeContent = content.home_hero;
  const page = path === '/capabilities'
    ? <Capabilities content={content.capabilities_intro} slides={slidesForPage('capabilities', content.capabilities_intro, heroSlides)} sideImage={sideImageFor(content.capabilities_intro)} />
    : path === '/about'
      ? <About content={content.about_intro} slides={slidesForPage('about', content.about_intro, heroSlides)} sideImage={sideImageFor(content.about_intro)} />
      : path === '/quality'
        ? <Quality content={content.quality_intro} slides={slidesForPage('quality', content.quality_intro, heroSlides)} sideImage={sideImageFor(content.quality_intro)} />
        : path === '/gallery'
          ? <Gallery content={content.gallery_intro} slides={slidesForPage('gallery', content.gallery_intro, heroSlides)} sideImage={sideImageFor(content.gallery_intro)} />
          : path === '/contact'
            ? <Contact content={content.contact_intro} slides={slidesForPage('contact', content.contact_intro, heroSlides)} sideImage={sideImageFor(content.contact_intro)} />
            : <Home hero={homeContent} slides={slidesForPage('home', homeContent, heroSlides)} sideImage={sideImageFor(homeContent)} />;
  return <div><Header tabs={tabs} /><main>{page}</main><Footer tabs={tabs} /></div>;
}

export default App;
