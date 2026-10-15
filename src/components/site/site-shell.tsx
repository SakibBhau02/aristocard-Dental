"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { RouterProvider, useRouter } from "@/lib/router";
import { LanguageProvider } from "@/lib/i18n";
import { track, syncAnalyticsPageView } from "@/lib/tracker";
import { ContentProvider } from "@/components/site/content-provider";
import type { ContentBundle } from "@/lib/content/shared";
import { ScrollProgress } from "@/components/site/motion";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { FloatingContact } from "@/components/site/floating-contact";
import { SiteSearch } from "@/components/site/site-search";
import { HomePage } from "@/components/site/pages/home-page";
import { AboutPage } from "@/components/site/pages/about-page";
import { ServicesPage } from "@/components/site/pages/services-page";
import { ServiceDetailPage } from "@/components/site/pages/service-detail-page";
import { DoctorsPage, DoctorDetailPage } from "@/components/site/pages/doctors-page";
import { BlogPage, BlogDetailPage } from "@/components/site/pages/blog-page";
import { ContactPage } from "@/components/site/pages/contact-page";
import { AppointmentPage } from "@/components/site/pages/appointment-page";
import { GalleryPage } from "@/components/site/pages/gallery-page";
import { FaqsPage } from "@/components/site/pages/faqs-page";
import { AssessmentPage } from "@/components/site/pages/assessment-page";
import { EstimatorPage } from "@/components/site/pages/estimator-page";
import { StatusPage } from "@/components/site/pages/status-page";
import { PortalPage } from "@/components/site/pages/portal-page";
import { AdminPage } from "@/components/site/admin/admin-page";
import { NotFoundPage } from "@/components/site/pages/not-found-page";

/* ------------------------------------------------------------------ */
/*  Site shell — navbar + animated page router + footer (sticky)       */
/* ------------------------------------------------------------------ */

/* Client-side analytics beacon for route changes (page views).
   Admin routes are excluded — staff browsing must never pollute the
   public traffic numbers. Third-party pixels self-fire on initial load
   (their snippets do that), so they are only synced on later navigations. */
function useRouteTracking() {
  const { path, segments } = useRouter();
  const firstRender = useRef(true);
  useEffect(() => {
    if (segments[0] === "admin") return;
    /* the beacon payload auto-captures path + referrer + session id */
    track("page_view");
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    syncAnalyticsPageView(path);
  }, [path, segments]);
}

function PageRouter() {
  const { path, segments } = useRouter();
  useRouteTracking();

  let page: React.ReactNode;
  let key = path;

  if (path === "/" || path === "") {
    page = <HomePage />;
  } else if (segments[0] === "about") {
    page = <AboutPage />;
  } else if (segments[0] === "services" && segments[1]) {
    page = <ServiceDetailPage slug={segments[1]} />;
    key = `/services/${segments[1]}`;
  } else if (segments[0] === "services") {
    page = <ServicesPage />;
  } else if (segments[0] === "doctors" && segments[1]) {
    page = <DoctorDetailPage slug={segments[1]} />;
    key = `/doctors/${segments[1]}`;
  } else if (segments[0] === "doctors") {
    page = <DoctorsPage />;
  } else if (segments[0] === "blog" && segments[1]) {
    page = <BlogDetailPage slug={segments[1]} />;
    key = `/blog/${segments[1]}`;
  } else if (segments[0] === "blog") {
    page = <BlogPage />;
  } else if (segments[0] === "contact") {
    page = <ContactPage />;
  } else if (segments[0] === "appointment") {
    page = <AppointmentPage />;
  } else if (segments[0] === "gallery") {
    page = <GalleryPage />;
  } else if (segments[0] === "faqs") {
    page = <FaqsPage />;
  } else if (segments[0] === "assessment") {
    page = <AssessmentPage />;
  } else if (segments[0] === "estimator") {
    page = <EstimatorPage />;
  } else if (segments[0] === "status") {
    page = <StatusPage />;
  } else if (segments[0] === "portal") {
    page = <PortalPage />;
  } else if (segments[0] === "admin") {
    page = <AdminPage />;
  } else {
    page = <NotFoundPage />;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.main
        key={key}
        id="main-content"
        initial={{ opacity: 0, y: 18, filter: "blur(6px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        exit={{ opacity: 0, y: -12, filter: "blur(4px)" }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="flex-1"
        tabIndex={-1}
      >
        {page}
      </motion.main>
    </AnimatePresence>
  );
}

export function SiteShell({ initialContent }: { initialContent?: ContentBundle }) {
  return (
    <RouterProvider>
      <LanguageProvider>
        <ContentProvider initial={initialContent}>
          <SiteChrome />
        </ContentProvider>
      </LanguageProvider>
    </RouterProvider>
  );
}

/* ------------------------------------------------------------------ */
/*  Chrome decider — the admin panel (/admin) is a fullscreen back-   */
/*  office: the public navbar, footer, floating contact buttons and    */
/*  search palette are removed so the dashboard owns the viewport.     */
/* ------------------------------------------------------------------ */

function SiteChrome() {
  const { segments } = useRouter();
  const isAdmin = segments[0] === "admin";

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Accessibility: skip link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-brand-navy focus:px-4 focus:py-2 focus:text-sm focus:text-white"
      >
        Skip to main content
      </a>
      {!isAdmin && <ScrollProgress />}
      {!isAdmin && <Navbar />}
      <PageRouter />
      {!isAdmin && <Footer />}
      {!isAdmin && <FloatingContact />}
      {!isAdmin && <SiteSearch />}
    </div>
  );
}
