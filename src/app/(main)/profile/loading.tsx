import AppLoader from "@/components/shared/AppLoader";

// This component will be automatically displayed by Next.js while your page.tsx fetches data.
export default function ProfileLoading() {
  return <AppLoader className="min-h-[60vh]" />;
}