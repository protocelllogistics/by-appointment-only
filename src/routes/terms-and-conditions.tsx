import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/terms-and-conditions")({
  head: () => ({ meta: [
    { title: "Terms & Conditions — By Appointment Only" },
    { name: "description", content: "Terms and conditions for By Appointment Only" },
    { property: "og:title", content: "Terms & Conditions — By Appointment Only" },
    { property: "og:description", content: "Terms and conditions for By Appointment Only" },
    { property: "og:type", content: "website" },
    { property: "og:url", content: "https://baowow.xyz/terms-and-conditions" },
    { name: "twitter:card", content: "summary_large_image" },
  ], links: [{ rel: "canonical", href: "https://baowow.xyz/terms-and-conditions" }] }),
  component: () => null,
});