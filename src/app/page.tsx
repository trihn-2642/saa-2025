import { redirect } from "next/navigation";

/**
 * Home (`/`).
 *
 * For now this redirects to the prelaunch countdown. Later this becomes the
 * real authenticated home screen — replace the redirect with the home UI +
 * auth check at that point.
 */
export default function Home() {
  redirect("/countdown");
}
