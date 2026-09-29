import { createFileRoute } from "@tanstack/react-router";

import { PolicyPage } from "@/components/policy-page";

export const Route = createFileRoute("/privacy-policy")({
  head: () => ({ meta: [
    { title: "Privacy Policy — By Appointment Only" },
    { name: "description", content: "Privacy policy for By Appointment Only" },
    { property: "og:title", content: "Privacy Policy — By Appointment Only" },
    { property: "og:description", content: "Privacy policy for By Appointment Only" },
    { property: "og:type", content: "website" },
    { property: "og:url", content: "https://baowow.xyz/privacy-policy" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "robots", content: "noindex, nofollow" },
  ], links: [{ rel: "canonical", href: "https://baowow.xyz/privacy-policy" }] }),
  component: () => <PolicyPage title="Privacy Policy" />,
});