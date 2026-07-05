import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  ChevronDown,
  Copy,
  Cross,
  Download,
  Edit3,
  ExternalLink,
  Facebook,
  Flame,
  Gift,
  HandHeart,
  HeartPulse,
  ImagePlus,
  Instagram,
  Lock,
  LogOut,
  Mail,
  MapPin,
  Menu,
  Phone,
  Plus,
  Save,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
  UsersRound,
  X,
  Youtube
} from "lucide-react";
import defaultContent from "./data/content.js";

const STORE_KEY = "ptsijn_site_content_v1";
const ANALYTICS_KEY = "ptsijn_analytics_v1";
const ADMIN_SESSION_KEY = "ptsijn_admin_unlocked";
const MAX_UPLOAD_SIZE = 2 * 1024 * 1024 * 1024;
const LOCAL_BROWSER_UPLOAD_WARNING_SIZE = 25 * 1024 * 1024;
const RAW_ADMIN_PASSCODE = import.meta.env.VITE_ADMIN_PASSCODE?.trim() || "";
const ADMIN_PASSCODE = RAW_ADMIN_PASSCODE || "PTS-IJN-2026";
const USE_LOCAL_ADMIN = import.meta.env.VITE_ENABLE_LOCAL_ADMIN === "true" || import.meta.env.DEV;
const USE_PASSCODE_AUTH = USE_LOCAL_ADMIN;
const LOCAL_ADMIN_ENABLED = USE_LOCAL_ADMIN;

const navItems = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Ministries", href: "#ministries" },
  { label: "Outreach", href: "#outreach" },
  { label: "Announcements", href: "#announcements" },
  { label: "Media", href: "#media" },
  { label: "Contact", href: "#contact" }
];

const mediaCategories = [
  { value: "outreach", label: "Outreach Moments" },
  { value: "feeding", label: "Feeding Support" },
  { value: "medical", label: "Medical Care" },
  { value: "prayer", label: "Prayer Gathering" },
  { value: "others", label: "Others" }
];

const defaultAnalytics = {
  views: 0,
  sectionViews: {},
  clicks: {},
  donationClicks: 0,
  donationRecords: []
};

const iconMap = [HandHeart, HeartPulse, Flame, UsersRound];

function isSafeUrl(url) {
  if (!url) return true;
  try {
    const parsed = new URL(url);
    return ["https:", "http:"].includes(parsed.protocol);
  } catch {
    return false;
  }
}

function safeExternalUrl(url) {
  return isSafeUrl(url) ? url : "";
}

function mergeContent(saved) {
  return {
    ...defaultContent,
    ...saved,
    site: { ...defaultContent.site, ...saved?.site },
    hero: { ...defaultContent.hero, ...saved?.hero },
    about: { ...defaultContent.about, ...saved?.about },
    leaders: saved?.leaders?.length ? saved.leaders : defaultContent.leaders,
    ministries: saved?.ministries?.length ? saved.ministries : defaultContent.ministries,
    outreach: { ...defaultContent.outreach, ...saved?.outreach },
    announcements: saved?.announcements?.length
      ? saved.announcements
      : defaultContent.announcements,
    media: saved?.media || defaultContent.media,
    donation: { ...defaultContent.donation, ...saved?.donation },
    socials: { ...defaultContent.socials, ...saved?.socials }
  };
}

function loadContent() {
  try {
    return mergeContent(JSON.parse(localStorage.getItem(STORE_KEY)));
  } catch {
    return defaultContent;
  }
}

function saveContent(content) {
  localStorage.setItem(STORE_KEY, JSON.stringify(content));
  window.dispatchEvent(new Event("ptsijn-content-updated"));
}

function loadAnalytics() {
  try {
    return { ...defaultAnalytics, ...JSON.parse(localStorage.getItem(ANALYTICS_KEY)) };
  } catch {
    return defaultAnalytics;
  }
}

function saveAnalytics(analytics) {
  localStorage.setItem(ANALYTICS_KEY, JSON.stringify(analytics));
  window.dispatchEvent(new Event("ptsijn-analytics-updated"));
}

function saveAnalyticsEvent() {
  return Promise.resolve();
}

function trackClick(name) {
  const analytics = loadAnalytics();
  analytics.clicks = analytics.clicks || {};
  analytics.clicks[name] = (analytics.clicks[name] || 0) + 1;
  saveAnalytics(analytics);
  saveAnalyticsEvent();
}

function fileToDataUrl(file) {
  if (file.size > MAX_UPLOAD_SIZE) {
    throw new Error(`${file.name} is larger than 2GB. Please compress it before uploading.`);
  }

  if (file.size > LOCAL_BROWSER_UPLOAD_WARNING_SIZE) {
    throw new Error(
      `${file.name} is allowed by the 2GB production target, but the current local admin stores files in the browser and may crash with large videos. Use manual static media files for larger content.`
    );
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function sanitizeFileName(name) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "-").replace(/-+/g, "-").replace(/^[-.]+|[-.]+$/g, "");
}

async function createStaticMediaItem(file, category = "others") {
  const cleanName = sanitizeFileName(file.name);
  const path = `/media/${category}/${cleanName}`;
  return {
    id: crypto.randomUUID(),
    title: file.name.replace(/\.[^/.]+$/, ""),
    caption: "",
    type: file.type,
    category,
    src: path,
    filePath: path
  };
}

async function createStaticMediaPath(file, folder) {
  const cleanName = sanitizeFileName(file.name);
  const path = `/media/${folder}/${cleanName}`;
  return { filePath: path, fileUrl: path };
}

function persistMediaItems() {
  return;
}

function deleteMediaItem() {
  return;
}

function useStoredContent() {
  const [content, setContent] = useState(loadContent);

  useEffect(() => {
    setContent(loadContent());

    const sync = () => setContent(loadContent());
    window.addEventListener("storage", sync);
    window.addEventListener("ptsijn-content-updated", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("ptsijn-content-updated", sync);
    };
  }, []);

  return [content, setContent];
}

function useActiveSection() {
  const [active, setActive] = useState("home");

  useEffect(() => {
    const sections = navItems
      .map((item) => document.querySelector(item.href))
      .filter(Boolean);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target?.id) {
          setActive(visible.target.id);
          const analytics = loadAnalytics();
          analytics.sectionViews = analytics.sectionViews || {};
          analytics.sectionViews[visible.target.id] =
            (analytics.sectionViews[visible.target.id] || 0) + 1;
          saveAnalytics(analytics);
          saveAnalyticsEvent("section_view", { section: visible.target.id });
        }
      },
      { rootMargin: "-35% 0px -55% 0px", threshold: [0.15, 0.35, 0.55] }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return active;
}

function Header({ content }) {
  const [open, setOpen] = useState(false);
  const active = useActiveSection();

  const close = () => setOpen(false);

  return (
    <header className="header">
      <a className="brand" href="#home" onClick={close} aria-label="Perfecting The Saints home">
        <span className="brand-symbol">
          <Cross size={19} />
        </span>
        <span>
          <strong>{content.site.name}</strong>
          <small>{content.site.suffix}</small>
        </span>
      </a>

      <button
        className="nav-toggle"
        type="button"
        aria-label="Toggle menu"
        onClick={() => setOpen((value) => !value)}
      >
        {open ? <X size={22} /> : <Menu size={22} />}
      </button>

      <nav className={open ? "nav nav-open" : "nav"} aria-label="Primary navigation">
        {navItems.map((item) => (
          <a
            key={item.href}
            className={active === item.href.slice(1) ? "active" : ""}
            href={item.href}
            onClick={() => {
              close();
              trackClick(`nav:${item.label}`);
            }}
          >
            {item.label}
          </a>
        ))}
        <a
          className="nav-give"
          href="#donate"
          onClick={() => {
            close();
            trackClick("nav:Give");
          }}
        >
          Give
        </a>
      </nav>
    </header>
  );
}

function SectionHeading({ eyebrow, title, text, align = "left" }) {
  return (
    <div className={`section-heading ${align === "center" ? "center" : ""}`}>
      <span>{eyebrow}</span>
      <h2>{title}</h2>
      {text && <p>{text}</p>}
    </div>
  );
}

function MediaPreview({ item }) {
  if (!item?.src) return null;
  if (item.type?.startsWith("video")) {
    return <video src={item.src} controls playsInline preload="metadata" />;
  }
  return <img src={item.src} alt={item.title || "Ministry media"} />;
}

function getMediaCategory(item) {
  return item.category || "others";
}

function SocialIcon({ platform }) {
  if (platform === "youtube") return <Youtube size={18} />;
  if (platform === "facebook") return <Facebook size={18} />;
  if (platform === "instagram") return <Instagram size={18} />;
  return <span className="tiktok-mark">T</span>;
}

function AdminGate({ children }) {
  const [unlocked, setUnlocked] = useState(
    () => sessionStorage.getItem(ADMIN_SESSION_KEY) === "true"
  );
  const [checking, setChecking] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setChecking(false);
  }, []);

  if (!LOCAL_ADMIN_ENABLED) {
    return (
      <div className="admin-login-shell">
        <div className="admin-login-card">
          <ShieldCheck size={34} />
          <h1>Admin is disabled for this deployment.</h1>
          <p>
            This front-end admin is for local editing and testing only. For a live website, connect
            the admin to a secure backend with real user login, file storage, and server-side
            permissions.
          </p>
          <a className="button primary" href="/">
            View Website
          </a>
        </div>
      </div>
    );
  }

  if (checking) {
    return (
      <div className="admin-login-shell">
        <div className="admin-login-card">
          <ShieldCheck size={34} />
          <h1>Checking admin access...</h1>
          <p>Please wait while the secure admin session loads.</p>
        </div>
      </div>
    );
  }

  if (unlocked) return children;

  async function submit(event) {
    event.preventDefault();

    if (passcode === ADMIN_PASSCODE) {
      sessionStorage.setItem(ADMIN_SESSION_KEY, "true");
      setUnlocked(true);
      setError("");
      return;
    }

    setError("That passcode is not correct.");
  }

  return (
    <div className="admin-login-shell">
      <form className="admin-login-card" onSubmit={submit}>
        <Lock size={34} />
        <p className="eyebrow">Protected Admin</p>
        <h1>Enter the admin passcode.</h1>
        <p>
          The local passcode is active right now. Enter the passcode to unlock the admin.
        </p>
        <label>
          Passcode
          <input
            type="password"
            value={passcode}
            onChange={(event) => setPasscode(event.target.value)}
            placeholder="Enter passcode"
            autoComplete="current-password"
          />
        </label>
        {error && <p className="form-error">{error}</p>}
        <button className="button primary" type="submit">
          Unlock Admin <ShieldCheck size={18} />
        </button>
        <a className="button ink" href="/">
          Return to Website
        </a>
      </form>
    </div>
  );
}

function DonationPanel({ content, onClose }) {
  const [copied, setCopied] = useState("");
  const [record, setRecord] = useState({ amount: "", name: "", note: "" });

  function copy(value, label) {
    if (!value) return;
    navigator.clipboard?.writeText(value);
    setCopied(label);
    setTimeout(() => setCopied(""), 1800);
  }

  function recordDonation() {
    const donation = {
      amount: record.amount || "Not entered",
      name: record.name || "Anonymous",
      note: record.note,
      date: new Date().toLocaleString()
    };
    const analytics = loadAnalytics();
    analytics.donationRecords = analytics.donationRecords || [];
    analytics.donationRecords.unshift({ id: crypto.randomUUID(), ...donation });
    saveAnalytics(analytics);
    setRecord({ amount: "", name: "", note: "" });
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="giving-modal">
        <button className="modal-close" type="button" onClick={onClose} aria-label="Close">
          <X size={20} />
        </button>
        <p className="eyebrow">
          <Gift size={16} /> Giving Details
        </p>
        <h2>Use these account details to give.</h2>
        <p>{content.donation.instructions}</p>
        <div className="account-details">
          {[
            ["Bank", content.donation.bankName],
            ["Account Name", content.donation.accountName],
            ["Account Number", content.donation.accountNumber],
            ["Routing / Extra Details", content.donation.routingNumber]
          ].map(([label, value]) => (
            <div key={label}>
              <span>{label}</span>
              <strong>{value || "Not provided yet"}</strong>
              {value && (
                <button type="button" onClick={() => copy(value, label)}>
                  <Copy size={15} /> {copied === label ? "Copied" : "Copy"}
                </button>
              )}
            </div>
          ))}
        </div>
        <div className="donation-record-box">
          <h3>Optional: record your giving intent</h3>
          <input
            value={record.amount}
            onChange={(event) => setRecord({ ...record, amount: event.target.value })}
            placeholder="Amount"
          />
          <input
            value={record.name}
            onChange={(event) => setRecord({ ...record, name: event.target.value })}
            placeholder="Name"
          />
          <textarea
            rows="3"
            value={record.note}
            onChange={(event) => setRecord({ ...record, note: event.target.value })}
            placeholder="Note"
          />
          <button className="button ink" type="button" onClick={recordDonation}>
            Record Donation <Save size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

function PublicSite() {
  const [content] = useStoredContent();
  const [spotlight, setSpotlight] = useState({ x: 50, y: 40 });
  const [givingOpen, setGivingOpen] = useState(false);
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });

  const cssSpotlight = useMemo(
    () => ({ "--spot-x": `${spotlight.x}%`, "--spot-y": `${spotlight.y}%` }),
    [spotlight]
  );

  useEffect(() => {
    const analytics = loadAnalytics();
    analytics.views = (analytics.views || 0) + 1;
    saveAnalytics(analytics);
    saveAnalyticsEvent("page_view", { path: window.location.pathname });
  }, []);

  function handleHeroMove(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    setSpotlight({
      x: ((event.clientX - rect.left) / rect.width) * 100,
      y: ((event.clientY - rect.top) / rect.height) * 100
    });
  }

  function openGiving() {
    const analytics = loadAnalytics();
    analytics.donationClicks = (analytics.donationClicks || 0) + 1;
    saveAnalytics(analytics);
    saveAnalyticsEvent("donation_click", { source: "continue_to_giving" });
    trackClick("donation:Continue to Giving");
    setGivingOpen(true);
  }

  function submitContact(event) {
    event.preventDefault();
    trackClick("contact:Send");
    const subject = encodeURIComponent(`Website message from ${contactForm.name || "visitor"}`);
    const body = encodeURIComponent(
      `Name: ${contactForm.name}\nEmail: ${contactForm.email}\n\n${contactForm.message}`
    );
    window.location.href = `mailto:${content.site.email}?subject=${subject}&body=${body}`;
  }

  return (
    <div className="site-shell">
      <Header content={content} />

      <main>
        <section id="home" className="hero" style={cssSpotlight} onMouseMove={handleHeroMove}>
          <div className="holy-sky" aria-hidden="true">
            <span className="sun-glow" />
            <span className="cloud cloud-one" />
            <span className="cloud cloud-two" />
            <span className="cloud cloud-three" />
            <span className="light-ray ray-one" />
            <span className="light-ray ray-two" />
          </div>
          <div className="hero-aura" />
          <div className="hero-grid" />

          <div className="hero-content">
            <p className="eyebrow">
              <Sparkles size={16} /> {content.hero.eyebrow}
            </p>
            <h1>{content.hero.title}</h1>
            <p>{content.hero.text}</p>
            <div className="hero-actions">
              <a className="button primary" href="#donate" onClick={() => trackClick("hero:Support")}>
                Support the Mission <Gift size={18} />
              </a>
              <a className="button ghost" href="#media" onClick={() => trackClick("hero:Media")}>
                View Media <ImagePlus size={18} />
              </a>
            </div>
          </div>

          <a className="scroll-cue" href="#about" aria-label="Scroll to about">
            <ChevronDown size={24} />
          </a>
        </section>

        <section id="about" className="section intro-section">
          <div className="intro-copy">
            <SectionHeading
              eyebrow="Who We Are"
              title={content.about.title}
              text={content.about.text}
            />
            <div className="scripture-card">
              <Cross size={26} />
              <p>{content.about.scripture}</p>
              <span>{content.about.scriptureRef}</span>
            </div>
          </div>
          <div className="impact-orbit" aria-label="Ministry values">
            {["Faith", "Charity", "Hope", "Holiness"].map((value, index) => (
              <div className={`impact-item impact-${index + 1}`} key={value}>
                <strong>{value}</strong>
                <span>{index === 0 ? "at the center" : index === 1 ? "in action" : index === 2 ? "for every home" : "in service"}</span>
              </div>
            ))}
            <div className="center-emblem">
              <Cross size={38} />
              <span>IJN</span>
            </div>
          </div>
        </section>

        <section className="section leaders-section">
          <SectionHeading
            eyebrow="Leadership"
            title="Founder and Co-Founder"
            text="The Leaders"
            align="center"
          />
          <div className="leader-grid">
            {content.leaders.map((leader) => (
              <article className="leader-card" key={leader.id}>
                <div className="leader-photo">
                  {leader.image ? (
                    <img src={leader.image} alt={`${leader.name}, ${leader.role}`} />
                  ) : (
                    <Cross size={46} />
                  )}
                </div>
                <span>{leader.role}</span>
                <h3>{leader.name}</h3>
                <p>{leader.bio}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="ministries" className="section dark-section">
          <SectionHeading
            eyebrow="Ministries"
            title="Where faith becomes visible."
            text="Each ministry area is designed as a doorway for people to receive help, join service, and encounter hope."
            align="center"
          />
          <div className="ministry-grid">
            {content.ministries.map((card, index) => {
              const Icon = iconMap[index % iconMap.length];
              return (
                <article className="ministry-card" key={card.title}>
                  <Icon size={28} />
                  <h3>{card.title}</h3>
                  <p>{card.text}</p>
                  <span>
                    Explore <ArrowRight size={15} />
                  </span>
                </article>
              );
            })}
          </div>
        </section>

        <section id="outreach" className="section outreach-section">
          <div className="outreach-panel">
            <SectionHeading
              eyebrow="Outreach"
              title={content.outreach.title}
              text={content.outreach.text}
            />
            <div className="outreach-actions">
              <a className="button primary" href="#contact">
                Volunteer
              </a>
              <a className="button ink" href="#donate">
                Give Toward Outreach
              </a>
            </div>
          </div>
          <div className="outreach-timeline">
            <div>
              <span>01</span>
              <h3>Gather</h3>
              <p>Prayer, preparation, and people ready to serve.</p>
            </div>
            <div>
              <span>02</span>
              <h3>Go</h3>
              <p>Feeding, medical care, and direct community support.</p>
            </div>
            <div>
              <span>03</span>
              <h3>Follow Up</h3>
              <p>Stories, reports, testimonies, and next steps.</p>
            </div>
          </div>
        </section>

        <section id="announcements" className="section announcements-section">
          <SectionHeading
            eyebrow="Announcements"
            title="Upcoming outreach, services, and events."
            text="Updates"
            align="center"
          />
          <div className="announcement-grid">
            {content.announcements.map((announcement) => (
              <article className="announcement-card" key={announcement.id}>
                <span>{announcement.type}</span>
                <h3>{announcement.title}</h3>
                <time>{announcement.date}</time>
                <p>{announcement.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="media" className="section media-section">
          <SectionHeading
            eyebrow="Media"
            title="A gallery for your ministry archive."
            text="The Evidence of the Help of God"
            align="center"
          />
          {content.media.length ? (
            <div className="media-category-list">
              {mediaCategories.map((category) => {
                const items = content.media.filter(
                  (item) => getMediaCategory(item) === category.value
                );
                return (
                  <div className="media-category-section" key={category.value}>
                    <div className="media-category-heading">
                      <h3>{category.label}</h3>
                      <span>{items.length} item{items.length === 1 ? "" : "s"}</span>
                    </div>
                    {items.length ? (
                      <div className="uploaded-media-grid">
                        {items.map((item) => (
                          <article className="uploaded-media-card" key={item.id}>
                            <MediaPreview item={item} />
                            <h3>{item.title}</h3>
                            {item.caption && <p>{item.caption}</p>}
                          </article>
                        ))}
                      </div>
                    ) : (
                      <p className="empty-category">No uploads in this section yet.</p>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="media-grid">
              <article className="feature-media">
                <div className="media-sky" aria-hidden="true">
                  <span className="sun-glow" />
                  <span className="cloud cloud-one" />
                  <span className="cloud cloud-two" />
                  <span className="light-ray ray-one" />
                </div>
                <div>
                  <span>Featured Story</span>
                  <h3>Holy Spirit light over the mission</h3>
                </div>
              </article>
              {["Outreach moments", "Feeding support", "Medical care", "Prayer gatherings"].map(
                (slot, index) => (
                  <article className="media-tile" key={slot}>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <h3>{slot}</h3>
                  </article>
                )
              )}
            </div>
          )}
        </section>

        <section id="donate" className="donate-section">
          <div>
            <p className="eyebrow">
              <Gift size={16} /> Partner With The Mission
            </p>
            <h2>Help faith and charity reach more people.</h2>
            <p>{content.donation.note}</p>
          </div>
          <div className="donate-form">
            <div className="amounts" aria-label="Suggested donation amounts">
              {["$25", "$50", "$100", "$250"].map((amount) => (
                <button type="button" key={amount} onClick={() => trackClick(`donation:${amount}`)}>
                  {amount}
                </button>
              ))}
            </div>
            <label>
              Giving area
              <select defaultValue="outreach">
                <option value="outreach">Outreach and community care</option>
                <option value="feeding">Feeding outreach</option>
                <option value="medical">Medical support</option>
                <option value="general">General ministry support</option>
              </select>
            </label>
            <button className="button primary" type="button" onClick={openGiving}>
              Continue to Giving <ArrowRight size={18} />
            </button>
          </div>
        </section>

        <section id="contact" className="section contact-section">
          <div>
            <SectionHeading
              eyebrow="Contact"
              title="Connect, pray, serve, or ask a question."
              text="Use this area for meeting access, prayer requests, giving questions, volunteer interest, and ministry updates."
            />
            <div className="contact-list">
              <span>
                <Phone size={18} /> {content.site.phone}
              </span>
              <span>
                <Mail size={18} /> {content.site.email}
              </span>
              <span>
                <MapPin size={18} /> {content.site.location}
              </span>
            </div>
          </div>
          <form className="contact-form" onSubmit={submitContact}>
            <label>
              Name
              <input
                value={contactForm.name}
                onChange={(event) => setContactForm({ ...contactForm, name: event.target.value })}
                placeholder="Your name"
                required
              />
            </label>
            <label>
              Email
              <input
                type="email"
                value={contactForm.email}
                onChange={(event) => setContactForm({ ...contactForm, email: event.target.value })}
                placeholder="you@example.com"
                required
              />
            </label>
            <label>
              Message
              <textarea
                rows="5"
                value={contactForm.message}
                onChange={(event) =>
                  setContactForm({ ...contactForm, message: event.target.value })
                }
                placeholder="How can the ministry help?"
                required
              />
            </label>
            <button className="button ink" type="submit">
              Send Message <ArrowRight size={18} />
            </button>
          </form>
        </section>
      </main>

      <Footer content={content} />
      {givingOpen && <DonationPanel content={content} onClose={() => setGivingOpen(false)} />}
    </div>
  );
}

function Footer({ content }) {
  const socialEntries = Object.entries(content.socials).filter(([, url]) => safeExternalUrl(url));

  return (
    <footer className="footer">
      <div>
        <strong>{content.site.name}</strong>
        <p>{content.site.tagline}</p>
      </div>
      <div className="footer-links">
        <a href="#home">Home</a>
        <a href="#ministries">Ministries</a>
        <a href="#media">Media</a>
        <a href="#donate">Donate</a>
        {LOCAL_ADMIN_ENABLED && <a href="/admin">Admin</a>}
      </div>
      <div className="social-links" aria-label="Social media links">
        {socialEntries.length ? (
          socialEntries.map(([platform, url]) => (
            <a
              key={platform}
              href={safeExternalUrl(url)}
              target="_blank"
              rel="noreferrer"
              aria-label={platform}
              onClick={() => trackClick(`social:${platform}`)}
            >
              <SocialIcon platform={platform} />
            </a>
          ))
        ) : (
          <p className="footer-note">Add YouTube, Facebook, Instagram, and TikTok links in admin.</p>
        )}
      </div>
    </footer>
  );
}

function TextField({ label, value, onChange, multiline = false, type = "text" }) {
  return (
    <label>
      {label}
      {multiline ? (
        <textarea rows="4" value={value} onChange={(event) => onChange(event.target.value)} />
      ) : (
        <input type={type} value={value} onChange={(event) => onChange(event.target.value)} />
      )}
    </label>
  );
}

function AdminPage() {
  const [content, setContent] = useStoredContent();
  const [draft, setDraft] = useState(content);
  const [analytics, setAnalytics] = useState(loadAnalytics);
  const [saved, setSaved] = useState(false);
  const [uploadError, setUploadError] = useState("");

  useEffect(() => setDraft(content), [content]);

  useEffect(() => {
    setAnalytics(loadAnalytics());

    const sync = () => setAnalytics(loadAnalytics());
    window.addEventListener("ptsijn-analytics-updated", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("ptsijn-analytics-updated", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  function update(path, value) {
    setDraft((current) => {
      const next = structuredClone(current);
      let target = next;
      path.slice(0, -1).forEach((key) => {
        target = target[key];
      });
      target[path.at(-1)] = value;
      return next;
    });
  }

  async function commit() {
    const cleaned = {
      ...draft,
      socials: Object.fromEntries(
        Object.entries(draft.socials).map(([key, value]) => [key, safeExternalUrl(value)])
      )
    };
    saveContent(cleaned);
    setContent(cleaned);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  }

  function exportBackup() {
    const backup = {
      exportedAt: new Date().toISOString(),
      content: draft,
      analytics
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ptsijn-website-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function importBackup(file) {
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const importedContent = mergeContent(parsed.content || parsed);
      setDraft(importedContent);
      saveContent(importedContent);
      setContent(importedContent);
      if (parsed.analytics) saveAnalytics({ ...defaultAnalytics, ...parsed.analytics });
      setUploadError("");
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
    } catch {
      setUploadError("The backup file could not be imported. Please choose a valid JSON backup.");
    }
  }

  async function logout() {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    window.location.reload();
  }

  async function updateLeaderImage(index, file) {
    if (!file) return;
    try {
      const { fileUrl } = await createStaticMediaPath(file, "leaders");
      const next = structuredClone(draft.leaders);
      next[index].image = fileUrl;
      update(["leaders"], next);
      setUploadError("");
    } catch (error) {
      setUploadError(error.message);
    }
  }

  async function addMedia(files) {
    try {
      const uploaded = await Promise.all(
        Array.from(files).map((file) => createStaticMediaItem(file, "others"))
      );
      update(["media"], [...draft.media, ...uploaded]);
      setUploadError("");
    } catch (error) {
      setUploadError(error.message);
    }
  }

  const topClicks = Object.entries(analytics.clicks || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <a className="brand admin-brand" href="/">
          <span className="brand-symbol">
            <Cross size={19} />
          </span>
          <span>
            <strong>PTS Admin</strong>
            <small>Website Control</small>
          </span>
        </a>
        <nav>
          {[
            "Content",
            "Founder",
            "Media",
            "Donations",
            "Announcements",
            "Socials",
            "Tracking"
          ].map((item) => (
            <a key={item} href={`#admin-${item.toLowerCase()}`}>
              {item}
            </a>
          ))}
        </nav>
        <a className="button ghost" href="/">
          View Website <ExternalLink size={17} />
        </a>
        <button className="button ghost" type="button" onClick={logout}>
          Logout <LogOut size={17} />
        </button>
      </aside>

      <main className="admin-main">
        <div className="admin-topbar">
          <div>
            <p className="eyebrow">
              <Edit3 size={16} /> Admin Page
            </p>
            <h1>Manage website content</h1>
            <p>Upload media, edit text, update giving details, post announcements, and track activity.</p>
          </div>
          <button className="button primary" type="button" onClick={commit}>
            <Save size={18} /> {saved ? "Saved" : "Save Changes"}
          </button>
        </div>

        <section className="admin-card security-card">
          <div>
            <p className="eyebrow">
              <ShieldCheck size={16} /> Deployment Safety
            </p>
            <h2>Backup before deployment.</h2>
            <p>
              Export your content before changing browsers, computers, or hosting. For a live
              public admin, connect this project to a secure backend instead of relying on browser
              storage.
            </p>
          </div>
          <div className="backup-actions">
            <button className="button ink" type="button" onClick={exportBackup}>
              <Download size={18} /> Export Backup
            </button>
            <label className="button ghost file-button">
              <Upload size={18} /> Import Backup
              <input type="file" accept="application/json,.json" onChange={(event) => importBackup(event.target.files?.[0])} />
            </label>
          </div>
          {uploadError && <p className="form-error">{uploadError}</p>}
        </section>

        <section id="admin-content" className="admin-card">
          <h2>Website Text</h2>
          <div className="admin-grid two">
            <TextField label="Website Name" value={draft.site.name} onChange={(value) => update(["site", "name"], value)} />
            <TextField label="Website Suffix" value={draft.site.suffix} onChange={(value) => update(["site", "suffix"], value)} />
            <TextField label="Phone" value={draft.site.phone} onChange={(value) => update(["site", "phone"], value)} />
            <TextField label="Email" value={draft.site.email} onChange={(value) => update(["site", "email"], value)} />
            <TextField label="Location" value={draft.site.location} onChange={(value) => update(["site", "location"], value)} />
            <TextField label="Tagline" value={draft.site.tagline} onChange={(value) => update(["site", "tagline"], value)} />
          </div>
          <div className="admin-grid">
            <TextField label="Hero Eyebrow" value={draft.hero.eyebrow} onChange={(value) => update(["hero", "eyebrow"], value)} />
            <TextField label="Hero Title" value={draft.hero.title} onChange={(value) => update(["hero", "title"], value)} />
            <TextField label="Hero Text" value={draft.hero.text} onChange={(value) => update(["hero", "text"], value)} multiline />
            <TextField label="About Title" value={draft.about.title} onChange={(value) => update(["about", "title"], value)} />
            <TextField label="About Text" value={draft.about.text} onChange={(value) => update(["about", "text"], value)} multiline />
          </div>
        </section>

        <section id="admin-founder" className="admin-card">
          <h2>Founder and Co-Founder</h2>
          <div className="admin-grid two">
            {draft.leaders.map((leader, index) => (
              <div className="leader-editor" key={leader.id}>
                <div className="leader-photo editor-preview">
                  {leader.image ? <img src={leader.image} alt={leader.name} /> : <Cross size={38} />}
                </div>
                <TextField
                  label="Name"
                  value={leader.name}
                  onChange={(value) => {
                    const next = structuredClone(draft.leaders);
                    next[index].name = value;
                    update(["leaders"], next);
                  }}
                />
                <TextField
                  label="Role"
                  value={leader.role}
                  onChange={(value) => {
                    const next = structuredClone(draft.leaders);
                    next[index].role = value;
                    update(["leaders"], next);
                  }}
                />
                <TextField
                  label="Bio"
                  value={leader.bio}
                  multiline
                  onChange={(value) => {
                    const next = structuredClone(draft.leaders);
                    next[index].bio = value;
                    update(["leaders"], next);
                  }}
                />
                <label className="upload-box">
                  <Upload size={18} /> Choose {leader.role} Photo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => updateLeaderImage(index, event.target.files?.[0])}
                  />
                </label>
                <p className="admin-help">
                  Selected leader photos use static paths like <code>/media/leaders/your-file.jpg</code>.
                  Copy the file into `public/media/leaders` and redeploy to make it live.
                </p>
              </div>
            ))}
          </div>
        </section>

        <section id="admin-media" className="admin-card">
          <h2>Images and Videos</h2>
          <p className="admin-help">
            Upload your file first, then choose where it should appear: Outreach Moments, Feeding
            Support, Medical Care, Prayer Gathering, or Others.
          </p>
          <label className="upload-box large">
            <Upload size={20} /> Choose images or videos to assign a media path
            <input type="file" accept="image/*,video/*" multiple onChange={(event) => addMedia(event.target.files)} />
          </label>
          <p className="admin-help">
            Selected files are referenced as static paths under <code>/media/&lt;category&gt;/&lt;filename&gt;</code>.
            Copy the files into the matching `public/media` folder locally and redeploy to Netlify.
          </p>
          {uploadError && <p className="form-error">{uploadError}</p>}
          <div className="admin-media-list">
            {draft.media.map((item, index) => (
              <div className="admin-media-item" key={item.id}>
                <MediaPreview item={item} />
                <TextField
                  label="Title"
                  value={item.title}
                  onChange={(value) => {
                    const next = structuredClone(draft.media);
                    next[index].title = value;
                    update(["media"], next);
                  }}
                />
                <label>
                  Category
                  <select
                    value={getMediaCategory(item)}
                    onChange={(event) => {
                      const next = structuredClone(draft.media);
                      next[index].category = event.target.value;
                      update(["media"], next);
                    }}
                  >
                    {mediaCategories.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </label>
                <TextField
                  label="Caption"
                  value={item.caption}
                  onChange={(value) => {
                    const next = structuredClone(draft.media);
                    next[index].caption = value;
                    update(["media"], next);
                  }}
                />
                <button
                  className="button danger"
                  type="button"
                  onClick={async () => {
                    await deleteMediaItem(item);
                    update(["media"], draft.media.filter((media) => media.id !== item.id));
                  }}
                >
                  <Trash2 size={17} /> Remove
                </button>
              </div>
            ))}
          </div>
        </section>

        <section id="admin-donations" className="admin-card">
          <h2>Donation Account Details</h2>
          <div className="admin-grid two">
            <TextField label="Bank Name" value={draft.donation.bankName} onChange={(value) => update(["donation", "bankName"], value)} />
            <TextField label="Account Name" value={draft.donation.accountName} onChange={(value) => update(["donation", "accountName"], value)} />
            <TextField label="Account Number" value={draft.donation.accountNumber} onChange={(value) => update(["donation", "accountNumber"], value)} />
            <TextField label="Routing / Extra Details" value={draft.donation.routingNumber} onChange={(value) => update(["donation", "routingNumber"], value)} />
          </div>
          <TextField label="Giving Note" value={draft.donation.note} onChange={(value) => update(["donation", "note"], value)} multiline />
          <TextField label="Giving Instructions" value={draft.donation.instructions} onChange={(value) => update(["donation", "instructions"], value)} multiline />
        </section>

        <section id="admin-announcements" className="admin-card">
          <div className="admin-card-title">
            <h2>Announcements and Events</h2>
            <button
              className="button ink"
              type="button"
              onClick={() =>
                update(["announcements"], [
                  ...draft.announcements,
                  {
                    id: crypto.randomUUID(),
                    type: "Announcement",
                    title: "New Announcement",
                    date: "Add date",
                    text: "Add details here."
                  }
                ])
              }
            >
              <Plus size={17} /> Add
            </button>
          </div>
          <div className="admin-grid">
            {draft.announcements.map((announcement, index) => (
              <div className="announcement-editor" key={announcement.id}>
                {["type", "title", "date", "text"].map((field) => (
                  <TextField
                    key={field}
                    label={field === "text" ? "Details" : field[0].toUpperCase() + field.slice(1)}
                    value={announcement[field]}
                    multiline={field === "text"}
                    onChange={(value) => {
                      const next = structuredClone(draft.announcements);
                      next[index][field] = value;
                      update(["announcements"], next);
                    }}
                  />
                ))}
                <button
                  className="button danger"
                  type="button"
                  onClick={() =>
                    update(
                      ["announcements"],
                      draft.announcements.filter((item) => item.id !== announcement.id)
                    )
                  }
                >
                  <Trash2 size={17} /> Remove
                </button>
              </div>
            ))}
          </div>
        </section>

        <section id="admin-socials" className="admin-card">
          <h2>Social Media Links</h2>
          <div className="admin-grid two">
            {Object.keys(draft.socials).map((platform) => (
              <TextField
                key={platform}
                label={`${platform[0].toUpperCase()}${platform.slice(1)} URL`}
                value={draft.socials[platform]}
                onChange={(value) => update(["socials", platform], value)}
              />
            ))}
          </div>
        </section>

        <section id="admin-tracking" className="admin-card">
          <h2>Tracking</h2>
          <div className="analytics-grid">
            <div>
              <BarChart3 size={24} />
              <strong>{analytics.views || 0}</strong>
              <span>Total website views</span>
            </div>
            <div>
              <Gift size={24} />
              <strong>{analytics.donationClicks || 0}</strong>
              <span>Continue to Giving clicks</span>
            </div>
            <div>
              <CalendarDays size={24} />
              <strong>{analytics.donationRecords?.length || 0}</strong>
              <span>Donation records</span>
            </div>
          </div>
          <div className="tracking-lists">
            <div>
              <h3>Top Clicks</h3>
              {topClicks.length ? (
                topClicks.map(([name, count]) => (
                  <p key={name}>
                    <span>{name}</span>
                    <strong>{count}</strong>
                  </p>
                ))
              ) : (
                <p>No clicks tracked yet.</p>
              )}
            </div>
            <div>
              <h3>Donation Records</h3>
              {analytics.donationRecords?.length ? (
                analytics.donationRecords.slice(0, 6).map((item) => (
                  <p key={item.id}>
                    <span>{item.name} / {item.amount}</span>
                    <strong>{item.date}</strong>
                  </p>
                ))
              ) : (
                <p>No donation records yet.</p>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function App() {
  const isAdmin = window.location.pathname.toLowerCase().startsWith("/admin");
  return isAdmin ? (
    <AdminGate>
      <AdminPage />
    </AdminGate>
  ) : (
    <PublicSite />
  );
}

export default App;
