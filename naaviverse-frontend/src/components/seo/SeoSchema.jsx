import React from "react";
import { Helmet } from "react-helmet-async";

/* ---------------- ORGANIZATION ---------------- */

export const OrganizationSchema = () => (
  <Helmet>
    <script type="application/ld+json">
      {JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "Naavi Network",
        url: "https://naavinetwork.ai",
        logo: "https://naavinetwork.ai/logo512.png",
        description:
          "AI Powered Path Engine for personalized education, career and life navigation.",
        email: "info@naavinetwork.ai",
        address: {
          "@type": "PostalAddress",
          streetAddress: "T-Hub, Raidurg",
          addressLocality: "Hyderabad",
          addressRegion: "Telangana",
          postalCode: "500081",
          addressCountry: "IN",
        },
      })}
    </script>
  </Helmet>
);

/* ---------------- WEBSITE ---------------- */

export const WebsiteSchema = () => (
  <Helmet>
    <script type="application/ld+json">
      {JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "Naavi Network",
        url: "https://naavinetwork.ai",
      })}
    </script>
  </Helmet>
);

/* ---------------- CONTACT ---------------- */

export const ContactSchema = () => (
  <Helmet>
    <script type="application/ld+json">
      {JSON.stringify({
        "@context": "https://schema.org",
        "@type": "ContactPage",
        name: "Contact Naavi Network",
        url: "https://naavinetwork.ai/contact",
        mainEntity: {
          "@type": "Organization",
          name: "Naavi Network",
          email: "info@naavinetwork.ai",
          telephone: "+91 40 1234 5678",
        },
      })}
    </script>
  </Helmet>
);

/* ---------------- BREADCRUMB ---------------- */

export const BreadcrumbSchema = ({ pageName, pageUrl }) => (
  <Helmet>
    <script type="application/ld+json">
      {JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: "https://naavinetwork.ai",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: pageName,
            item: pageUrl,
          },
        ],
      })}
    </script>
  </Helmet>
);