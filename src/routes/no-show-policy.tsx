import { createFileRoute } from "@tanstack/react-router";

import { PolicyPage } from "@/components/policy-page";

export const Route = createFileRoute("/no-show-policy")({
  head: () => ({ meta: [
    { title: "No-Show Policy — By Appointment Only" },
    { name: "description", content: "No-show policy for By Appointment Only" },
    { property: "og:title", content: "No-Show Policy — By Appointment Only" },
    { property: "og:description", content: "No-show policy for By Appointment Only" },
    { property: "og:type", content: "website" },
    { property: "og:url", content: "https://baowow.xyz/no-show-policy" },
    { name: "twitter:card", content: "summary_large_image" },
  ], links: [{ rel: "canonical", href: "https://baowow.xyz/no-show-policy" }] }),
  component: () => <PolicyPage title="No-Show Policy" />,
});