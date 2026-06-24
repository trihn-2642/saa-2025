/**
 * /kudos — Sun* Kudos live board (server component).
 *
 * Fetches all initial data in parallel then hands it off to <KudosBoard />,
 * a client component that owns dialog/toast/filter/pagination state.
 *
 * Auth gating is handled by the (protected) layout — this page only runs for
 * signed-in users.
 */

import { KudosBoard } from "@/components/kudos/kudos-board";
import {
  getActiveCampaign,
  getLeaderboards,
  getProfileStats,
  getSpotlight,
  listDepartments,
  listHashtags,
  listHighlightKudos,
  listKudos,
} from "@/lib/kudos/queries";
import { createClient } from "@/lib/supabase/server";

export default async function KudosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // user is guaranteed non-null by (protected) layout, but we type-guard for TS.
  if (!user) return null;

  const [
    feedResult,
    highlightCards,
    spotlight,
    stats,
    leaderboards,
    hashtags,
    departments,
    activeCampaign,
  ] = await Promise.all([
    listKudos({ limit: 10 }),
    listHighlightKudos(),
    getSpotlight(),
    getProfileStats(user.id),
    getLeaderboards(),
    listHashtags(),
    listDepartments(),
    getActiveCampaign(),
  ]);

  return (
    <KudosBoard
      initialFeed={feedResult.items}
      nextCursor={feedResult.nextCursor}
      highlightCards={highlightCards}
      spotlight={spotlight}
      stats={stats}
      rankUps={leaderboards.rankUps}
      giftRecipients={leaderboards.giftRecipients}
      hashtags={hashtags}
      departments={departments}
      activeCampaign={activeCampaign}
    />
  );
}
