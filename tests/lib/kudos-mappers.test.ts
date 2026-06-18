import { describe, expect, it } from "vitest";

import {
  formatKudosDate,
  mapDepartmentOptions,
  mapGiftRecipients,
  mapHashtagOptions,
  mapRankUps,
  mapSidebarStats,
  mapSpotlightEntries,
  mapToCardProps,
} from "@/lib/kudos/mappers";
import type {
  GiftRecipientEntry,
  KudosCard,
  ProfileStats,
  RankUpEntry,
  SpotlightData,
} from "@/lib/kudos/types";

/**
 * mappers.ts — pure DB-shape → UI-prop translation. No DB, no network.
 * Covers null→default coercion, field renames, and the date format.
 */

// A fully-populated card and a sparse one (nulls) to exercise both branches.
const fullCard: KudosCard = {
  id: "k1",
  senderId: "u1",
  receiverId: "u2",
  message: "Thanks!",
  hashtags: ["Dedicated"],
  images: ["/a.png"],
  // No trailing "Z": parsed as LOCAL time so the assertion is timezone-stable.
  createdAt: "2025-10-30T10:05:00",
  likeCount: 7,
  heartWeight: 9,
  likedByMe: true,
  canLike: false,
  canEdit: true,
  sender: {
    id: "u1",
    fullName: "Alice",
    avatarUrl: "/alice.png",
    departmentName: "CEVC2",
    stars: 2,
    badge: "rising",
  },
  receiver: {
    id: "u2",
    fullName: "Bob",
    avatarUrl: null,
    departmentName: null,
    stars: 0,
    badge: null,
  },
};

describe("formatKudosDate", () => {
  it("formats a valid timestamp as HH:mm - MM/DD/YYYY (zero-padded)", () => {
    expect(formatKudosDate("2025-10-30T10:05:00")).toBe("10:05 - 10/30/2025");
    expect(formatKudosDate("2025-01-02T09:07:00")).toBe("09:07 - 01/02/2025");
  });

  it("returns the input unchanged when it is not a valid date", () => {
    expect(formatKudosDate("not-a-date")).toBe("not-a-date");
  });
});

describe("mapToCardProps", () => {
  const props = mapToCardProps(fullCard);

  it("passes through scalar + flag fields and formats the date", () => {
    expect(props.id).toBe("k1");
    expect(props.content).toBe("Thanks!");
    expect(props.likeCount).toBe(7);
    expect(props.likedByMe).toBe(true);
    expect(props.canLike).toBe(false);
    expect(props.canEdit).toBe(true);
    expect(props.createdAt).toBe("10:05 - 10/30/2025");
  });

  it("coerces nulls: departmentName→'', avatarUrl/badge→undefined", () => {
    expect(props.sender.dept).toBe("CEVC2");
    expect(props.sender.avatarUrl).toBe("/alice.png");
    expect(props.sender.badge).toBe("rising");

    expect(props.receiver.dept).toBe("");
    expect(props.receiver.avatarUrl).toBeUndefined();
    expect(props.receiver.badge).toBeUndefined();
  });
});

describe("filter option mappers", () => {
  it("mapHashtagOptions prefixes the label with #", () => {
    expect(mapHashtagOptions([{ id: "h1", name: "Dedicated" }])).toEqual([
      { value: "Dedicated", label: "#Dedicated" },
    ]);
  });

  it("mapDepartmentOptions uses the name for both value and label", () => {
    expect(
      mapDepartmentOptions([{ id: "d1", code: "CEVC2", name: "CEVC2" }]),
    ).toEqual([{ value: "CEVC2", label: "CEVC2" }]);
  });
});

describe("leaderboard mappers", () => {
  it("mapRankUps maps userId→id and null avatar→undefined", () => {
    const entries: RankUpEntry[] = [
      {
        userId: "u9",
        name: "Carol",
        avatarUrl: null,
        badge: "legend",
        createdAt: "2025-10-30T10:00:00",
      },
    ];
    expect(mapRankUps(entries)).toEqual([
      { id: "u9", name: "Carol", avatarUrl: undefined },
    ]);
  });

  it("mapGiftRecipients carries the gift name into subtitle", () => {
    const entries: GiftRecipientEntry[] = [
      {
        userId: "u9",
        name: "Carol",
        avatarUrl: "/c.png",
        giftName: "Nhận được 1 áo phông SAA",
        createdAt: "2025-10-30T10:00:00",
      },
    ];
    expect(mapGiftRecipients(entries)).toEqual([
      {
        id: "u9",
        name: "Carol",
        avatarUrl: "/c.png",
        subtitle: "Nhận được 1 áo phông SAA",
      },
    ]);
  });
});

describe("mapSpotlightEntries", () => {
  it("indexes names and sets a unit kudosCount weight", () => {
    const data: SpotlightData = {
      total: 2,
      names: [
        { name: "Alice", receivedAt: "2025-10-30T10:00:00" },
        { name: "Bob", receivedAt: "2025-10-30T09:00:00" },
      ],
      recent: [],
    };
    expect(mapSpotlightEntries(data)).toEqual([
      {
        id: "0",
        name: "Alice",
        kudosCount: 1,
        receivedAt: "2025-10-30T10:00:00",
      },
      {
        id: "1",
        name: "Bob",
        kudosCount: 1,
        receivedAt: "2025-10-30T09:00:00",
      },
    ]);
  });
});

describe("mapSidebarStats", () => {
  it("renames secretOpened/secretUnopened → secretBox* and keeps the rest", () => {
    const stats: ProfileStats = {
      kudosReceived: 25,
      kudosSent: 12,
      heartsReceived: 40,
      stars: 2,
      badge: "rising",
      secretOpened: 3,
      secretUnopened: 1,
    };
    expect(mapSidebarStats(stats)).toEqual({
      kudosReceived: 25,
      kudosSent: 12,
      heartsReceived: 40,
      secretBoxOpened: 3,
      secretBoxUnopened: 1,
    });
  });
});
