import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/cookies-policy")({
  head: () => ({ meta: [
    { title: "Cookies Policy — By Appointment Only" },
    { name: "description", content: "Cookies policy for By Appointment Only" },
    { property: "og:title", content: "Cookies Policy — By Appointment Only" },
    { property: "og:description", content: "Cookies policy for By Appointment Only" },
    { property: "og:type", content: "website" },
    { property: "og:url", content: "https://baowow.xyz/cookies-policy" },
    { name: "twitter:card", content: "summary_large_image" },
  ], links: [{ rel: "canonical", href: "https://baowow.xyz/cookies-policy" }] }),
  component: () => null,
});