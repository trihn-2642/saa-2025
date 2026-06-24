import { Spinner } from "@/components/ui/spinner";

/**
 * Full-screen blocking overlay with a centered spinner. Shared by the route
 * loading.tsx (Suspense fallback) and any in-place async swap (e.g. locale
 * switch in the header) so they look identical.
 */
export function LoadingOverlay() {
  return (
    <div className="fixed inset-0 z-1000 flex items-center justify-center bg-details-background/70 backdrop-blur-xs">
      <Spinner />
    </div>
  );
}
