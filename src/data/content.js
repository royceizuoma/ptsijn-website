import {
  CalendarDays,
  Cross,
  Flame,
  Gift,
  HandHeart,
  HeartHandshake,
  MapPin,
  MessagesSquare,
  Phone,
  Stethoscope,
  UsersRound
} from "lucide-react";

export const site = {
  name: "Perfecting The Saints IJN Foundation",
  shortName: "PTS IJN",
  tagline: "Faith and Charity in the name of Jesus",
  phone: "+1 301 404 5012",
  email: "info@ptsijn.org",
  address: "Contact the ministry for current meeting location",
  donationNote:
    "Your giving supports feeding outreaches, medical support, prayer ministry, and compassionate care.",
  originalSite: "https://ptsijn.org"
};

export const navItems = [
  { label: "Home", path: "/" },
  { label: "About", path: "/about" },
  { label: "Ministries", path: "/ministries" },
  { label: "Outreach", path: "/outreach" },
  { label: "Events", path: "/events" },
  { label: "Gallery", path: "/gallery" },
  { label: "Blog", path: "/blog" },
  { label: "Contact", path: "/contact" }
];

export const images = {
  hero:
    "https://ptsijn.org/wp-content/uploads/2022/10/20220814_162735-scaled.jpg",
  outreach:
    "https://ptsijn.org/wp-content/uploads/2023/10/IMG_20230923_114030_538-scaled.jpg",
  feeding:
    "https://ptsijn.org/wp-content/uploads/2023/10/IMG_20230923_111000_014-1-scaled.jpg",
  medical:
    "https://ptsijn.org/wp-content/uploads/2023/10/IMG_20230923_113444_111-scaled.jpg",
  prayer:
    "https://ptsijn.org/wp-content/uploads/2022/10/20220904_112503-scaled.jpg",
  galleryOne:
    "https://ptsijn.org/wp-content/uploads/2022/11/20220904_112529.jpg",
  galleryTwo:
    "https://ptsijn.org/wp-content/uploads/2022/11/20220904_112551-scaled.jpg",
  galleryThree:
    "https://ptsijn.org/wp-content/uploads/2022/11/20220904_112031-scaled.jpg",
  sylvia:
    "https://ptsijn.org/wp-content/uploads/2016/05/sylvia.jpeg",
  george:
    "https://ptsijn.org/wp-content/uploads/2016/05/george.jpeg"
};

export const pillars = [
  {
    icon: Cross,
    title: "Faith",
    text: "Christ-centered ministry shaped by prayer, worship, and trust in the name of Jesus."
  },
  {
    icon: HandHeart,
    title: "Charity",
    text: "Practical compassion through food, care, encouragement, and community support."
  },
  {
    icon: Flame,
    title: "Holiness",
    text: "A call to serve with purity, humility, and love through the power of the Holy Spirit."
  }
];

export const ministries = [
  {
    icon: HandHeart,
    title: "Feeding Outreach",
    text: "Providing food and encouragement to people and families who need tangible support.",
    image: images.feeding
  },
  {
    icon: Stethoscope,
    title: "Medical Outreach",
    text: "Connecting compassion with practical medical support through community outreach.",
    image: images.medical
  },
  {
    icon: MessagesSquare,
    title: "Prayer and Teaching",
    text: "Gathering for prayer, encouragement, scripture, and online midweek meetings.",
    image: images.prayer
  },
  {
    icon: UsersRound,
    title: "Community Care",
    text: "Serving people spirit, soul, and body through kindness, presence, and follow-up care.",
    image: images.outreach
  }
];

export const campaigns = [
  {
    title: "Medical Drive",
    goal: "$5,000",
    progress: 18,
    text: "Support medical care and compassionate health outreach for underserved communities."
  },
  {
    title: "Winter Supplies",
    goal: "$10,000",
    progress: 12,
    text: "Help provide seasonal supplies and practical relief to families during colder months."
  }
];

export const meetings = [
  {
    icon: CalendarDays,
    title: "Sunday Meetings",
    text: "Sundays at 11:00 AM. First and third Sunday gatherings are in person."
  },
  {
    icon: HeartHandshake,
    title: "Outreach Sundays",
    text: "Second and fourth Sundays are dedicated to outreach and community service."
  },
  {
    icon: Phone,
    title: "Wednesday Online",
    text: "Wednesdays at 7:00 PM online. Call the ministry to receive access details."
  }
];

export const leaders = [
  {
    name: "Sylvia",
    role: "Founder",
    image: images.sylvia,
    quote:
      "Whatever you do in words or deeds, do all in the name of Jesus. Colossians 3:17"
  },
  {
    name: "George",
    role: "Co-Founder",
    image: images.george,
    quote:
      "We walk by faith and not by sight. 2 Corinthians 5:7"
  }
];

export const blogPosts = [
  {
    title: "Free Feeding and Medical Outreach",
    date: "October 15, 2023",
    category: "Outreach",
    image: images.outreach,
    excerpt:
      "A photo report from a recent feeding and medical outreach serving the community with love."
  },
  {
    title: "Our Meetings",
    date: "January 13, 2023",
    category: "General",
    image: images.prayer,
    excerpt:
      "Join us Sundays at 11 AM and Wednesdays at 7 PM for worship, prayer, and encouragement."
  },
  {
    title: "Past Outreaches Photo Gallery",
    date: "November 30, 2022",
    category: "Gallery",
    image: images.galleryOne,
    excerpt:
      "Photos from past ministry outreaches, moments of prayer, service, and community care."
  },
  {
    title: "Past Outreaches Video Gallery",
    date: "November 25, 2022",
    category: "Video",
    image: images.galleryTwo,
    excerpt:
      "Video highlights from outreach moments and ministry service in the community."
  }
];

export const gallery = [
  { src: images.outreach, title: "Free Feeding and Medical Outreach" },
  { src: images.feeding, title: "Serving the Community" },
  { src: images.medical, title: "Medical Support" },
  { src: images.galleryOne, title: "Past Outreach Gathering" },
  { src: images.galleryTwo, title: "Care and Compassion" },
  { src: images.galleryThree, title: "Prayerful Service" }
];

export const contactCards = [
  { icon: Phone, title: "Phone", text: site.phone },
  { icon: MapPin, title: "Location", text: site.address },
  { icon: Gift, title: "Giving", text: "Support outreaches, campaigns, and ministry care." }
];
