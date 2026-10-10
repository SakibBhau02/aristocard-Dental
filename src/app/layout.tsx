import type { Metadata, Viewport } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://aristocratdentalcarebd.com"),
  title: {
    default:
      "Aristocrat Dental Care & Orthodontic Center | Best Dental Clinic in Uttara, Dhaka",
    template: "%s | Aristocrat Dental Care & Orthodontic Center",
  },
  description:
    "Modern & well-equipped dental clinic in Uttara, Dhaka. Advanced technology, strict sterilization & specialist dentists for implants, braces, Invisalign, root canal, smile design. Excellence in Every Smile!",
  keywords: [
    "dental clinic Uttara",
    "dentist in Dhaka",
    "best dental clinic Bangladesh",
    "orthodontic center Uttara",
    "dental implants Dhaka",
    "Invisalign Bangladesh",
    "root canal treatment Uttara",
    "porcelain veneers Dhaka",
    "teeth whitening Uttara",
    "pediatric dentist Dhaka",
    "Aristocrat Dental Care",
    "Dr. Shazia Khanam dentist",
  ],
  authors: [{ name: "Aristocrat Dental Care & Orthodontic Center" }],
  creator: "Aristocrat Dental Care & Orthodontic Center",
  publisher: "Aristocrat Dental Care & Orthodontic Center",
  category: "Health & Dentistry",
  applicationName: "Aristocrat Dental Care",
  icons: {
    icon: [
      { url: "/hand-teeth.svg", type: "image/svg+xml" },
      { url: "/logo.png", type: "image/png", sizes: "800x179" },
    ],
    apple: [{ url: "/logo.png" }],
  },
  manifest: undefined,
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: ["bn_BD"],
    url: "https://aristocratdentalcarebd.com",
    siteName: "Aristocrat Dental Care & Orthodontic Center",
    title:
      "Aristocrat Dental Care & Orthodontic Center | Excellence in Every Smile",
    description:
      "Modern & well-equipped dental clinic in Uttara, Dhaka with advanced technology & strict sterilization. Book your appointment today.",
    images: [
      {
        url: "/logo.png",
        width: 800,
        height: 179,
        alt: "Aristocrat Dental Care & Orthodontic Center",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Aristocrat Dental Care & Orthodontic Center",
    description:
      "Modern & well-equipped dental clinic in Uttara, Dhaka. Excellence in Every Smile!",
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://aristocratdentalcarebd.com",
  },
  other: {
    "geo.region": "BD-13",
    "geo.placename": "Uttara, Dhaka",
    "geo.position": "23.874;90.379",
    ICBM: "23.874, 90.379",
  },
};

export const viewport: Viewport = {
  themeColor: "#002060",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Dentist",
  "@id": "https://aristocratdentalcarebd.com/#organization",
  name: "Aristocrat Dental Care & Orthodontic Center",
  alternateName: "Aristocrat Dental Care",
  description:
    "Modern & well-equipped dental clinic in Uttara, Dhaka offering implants, orthodontics, Invisalign, cosmetic dentistry and family dental care.",
  url: "https://aristocratdentalcarebd.com",
  logo: "https://aristocratdentalcarebd.com/logo.png",
  image: "https://aristocratdentalcarebd.com/logo.png",
  telephone: "+8801715027522",
  email: "aristocratdentalcare01@gmail.com",
  priceRange: "$$",
  currenciesAccepted: "BDT",
  paymentAccepted: "Cash, Credit Card, bKash",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Uttara",
    addressRegion: "Dhaka",
    addressCountry: "BD",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 23.874,
    longitude: 90.379,
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Saturday",
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
      ],
      opens: "10:00",
      closes: "21:00",
    },
  ],
  sameAs: [
    "https://www.facebook.com/aristocratdental",
    "https://www.instagram.com/aristocratdentalcare01",
    "https://www.linkedin.com/company/aristocrat-dental-care-orthodontic-center",
  ],
  medicalSpecialty: ["Dentistry", "Orthodontic", "Endodontic"],
  slogan: "Excellence in Every Smile!",
  founder: {
    "@type": "Person",
    name: "Dr. Shazia Khanam",
    jobTitle: "Chief Dental Surgeon",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    reviewCount: "3200",
    bestRating: "5",
  },
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": "https://aristocratdentalcarebd.com/#website",
  url: "https://aristocratdentalcarebd.com",
  name: "Aristocrat Dental Care & Orthodontic Center",
  publisher: {
    "@id": "https://aristocratdentalcarebd.com/#organization",
  },
  inLanguage: ["en", "bn"],
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate:
        "https://aristocratdentalcarebd.com/#/blog?q={search_term_string}",
    },
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([organizationJsonLd, websiteJsonLd]),
          }}
        />
      </head>
      <body
        className={`${inter.variable} ${poppins.variable} font-sans min-h-screen flex flex-col`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
