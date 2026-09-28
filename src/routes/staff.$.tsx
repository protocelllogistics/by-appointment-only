import { createFileRoute, redirect } from "@tanstack/react-router";

// Old staff pages were replaced by the Dashboard.
export const Route = createFileRoute("/staff/$")({
  beforeLoad: () => { throw redirect({ to: "/dashboard", statusCode: 301 }); },
});
