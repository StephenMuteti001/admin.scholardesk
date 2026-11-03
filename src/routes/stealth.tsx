import { createFileRoute, redirect } from "@tanstack/react-router";

// The legacy "stealth licences" screen was replaced by AssessDesk packages & grants.
export const Route = createFileRoute("/stealth")({
  beforeLoad: () => {
    throw redirect({ to: "/assessdesk/packages", replace: true });
  },
});
