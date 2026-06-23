"use client";

import { type ReactNode, useEffect, useRef } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";

import IcClose from "@icons/ic-close.svg";
import IcDown from "@icons/ic-down.svg";
import IcPlus from "@icons/ic-plus.svg";
import IcSend from "@icons/ic-send.svg";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog } from "@/components/ui/dialog";
import { FieldLabel } from "@/components/ui/field-label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/cn";

export interface HashtagItem {
  id: string;
  label: string;
}

export interface SubmitKudosDialogProps {
  /** Dialog open state — controlled by parent. */
  open: boolean;
  /** Called when user clicks Hủy or the dialog backdrop/Escape. */
  onCancel: () => void;

  // --- Recipient (searchable dropdown / combobox) ---
  /** Current text in the search field (selected name or typed query). */
  receiver: string;
  /** Fired when the user types in the search field. */
  onReceiverSearch?: (value: string) => void;
  /** Whether the recipient dropdown is open (drives chevron + panel). */
  receiverOpen?: boolean;
  /** Open the dropdown (input focus / chevron click). */
  onReceiverOpen?: () => void;
  /** Close the dropdown (outside click / Escape / chevron when open). */
  onReceiverClose?: () => void;
  /**
   * Slot rendered below the search input — the parent plugs the autocomplete
   * result list here.
   */
  receiverDropdownSlot?: ReactNode;

  // --- Danh hiệu (badge title) ---
  /** The kudos title / badge line the sender types (required). */
  kudosTitle: string;
  /** Fired when the user types in the badge-title field. */
  onKudosTitleChange: (value: string) => void;

  // --- Message editor ---
  /**
   * Slot for the rich-text editor surface. The parent (SubmitKudos) renders a
   * Quill instance here (Quill snow renders its own toolbar). When omitted a
   * styled placeholder is shown.
   */
  editorSlot?: ReactNode;
  /** Current character count for the counter display. */
  charCount?: number;

  // --- Hashtags ---
  /** Currently selected hashtags. */
  selectedHashtags: HashtagItem[];
  /** Called when user clicks × on a chip to remove it. */
  onRemoveHashtag: (id: string) => void;
  /** Called when user clicks "+ Hashtag" button — parent opens the dropdown. */
  onOpenHashtags: () => void;
  /**
   * Slot for the hashtag dropdown panel. The parent renders
   * the toggle-list here.
   */
  hashtagDropdownSlot?: ReactNode;

  // --- Images ---
  /** Preview URLs (object URLs created by parent). Max 5. */
  imagePreviews: string[];
  /** Called when user clicks "+ Image" — parent opens the file picker. */
  onAddImages: () => void;
  /** Called when user clicks × on a thumbnail. Index into `imagePreviews`. */
  onRemoveImage: (index: number) => void;

  // --- Anonymous ---
  isAnonymous: boolean;
  onToggleAnonymous: () => void;
  /** Display nickname shown on the card; required when isAnonymous. */
  anonymousName: string;
  onAnonymousNameChange: (value: string) => void;

  onSubmit: () => void;
  /** Whether the Gửi button is disabled (parent controls validation state). */
  submitDisabled?: boolean;
  /** Shows a spinner/loading state on the Gửi button while submitting. */
  submitting?: boolean;
}

function ImageThumb({
  src,
  onRemove,
  alt,
}: {
  src: string;
  onRemove: () => void;
  alt: string;
}) {
  return (
    <div className="relative size-20 shrink-0 rounded-sm border border-primary-dark-hover bg-white">
      {/* unoptimized: previews are blob: object URLs the image optimizer can't fetch. */}
      <Image
        src={src}
        alt={alt}
        fill
        sizes="80px"
        unoptimized
        className="rounded-sm border border-primary-normal object-cover"
      />
      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove image"
        className="absolute -top-2 -right-2 z-10 flex size-5 cursor-pointer items-center justify-center rounded-full bg-error text-white"
      >
        <IcClose aria-hidden className="size-3" />
      </button>
    </div>
  );
}

/** Hashtag chip — removable tag (white pill matching the "+ Hashtag" button). */
function HashtagChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex h-12 items-center gap-2 rounded-lg border border-primary-dark-hover bg-white px-4 py-2 text-body font-bold tracking-[0.15px] text-text-primary-2">
      #{label}
      <Button
        type="button"
        variant="icon"
        onClick={onRemove}
        aria-label={`Remove hashtag ${label}`}
        className="h-fit w-fit cursor-pointer p-0 text-text-primary-2"
      >
        <IcClose aria-hidden className="size-6!" />
      </Button>
    </span>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

/**
 * SubmitKudosDialog — PRESENTATIONAL dialog for writing a Kudos.
 *
 * All interactivity is props-driven; no data fetching, no store access.
 *
 * i18n keys used (namespace "kudos"):
 *   submit.title             — modal title
 *   submit.recipientLabel    — "Người nhận"
 *   submit.searchPlaceholder — "Tìm kiếm"
 *   submit.badgeLabel        — "Danh hiệu"
 *   submit.badgePlaceholder  — "Dành tặng một danh hiệu cho đồng đội"
 *   submit.editorPlaceholder — editor hint text
 *   submit.hintMention       — "@ + tên" hint line
 *   submit.hashtagLabel      — "Hashtag"
 *   submit.addHashtag        — "+ Hashtag"
 *   submit.maxHashtag        — "Tối đa 5"
 *   submit.imageLabel        — "Image"
 *   submit.addImage          — "+ Image"
 *   submit.maxImage          — "Tối đa 5"
 *   submit.anonymousLabel    — "Gửi lời cám ơn và ghi nhận ẩn danh"
 *   submit.cancel            — "Hủy"
 *   submit.send              — "Gửi"
 *   submit.sending           — "Đang gửi..."
 */
export function SubmitKudosDialog({
  open,
  receiver,
  receiverOpen = false,
  receiverDropdownSlot,
  kudosTitle,
  editorSlot,
  charCount,
  selectedHashtags,
  hashtagDropdownSlot,
  imagePreviews,
  isAnonymous,
  anonymousName,
  submitDisabled = false,
  submitting = false,
  onCancel,
  onReceiverSearch,
  onReceiverOpen,
  onReceiverClose,
  onKudosTitleChange,
  onRemoveHashtag,
  onOpenHashtags,
  onAddImages,
  onRemoveImage,
  onToggleAnonymous,
  onAnonymousNameChange,
  onSubmit,
}: SubmitKudosDialogProps) {
  const t = useTranslations("kudos");
  const receiverAreaRef = useRef<HTMLDivElement>(null);

  const atMaxImages = imagePreviews.length >= 5;
  const atMaxHashtags = selectedHashtags.length >= 5;

  // Close the recipient dropdown on outside-click / Escape.
  useEffect(() => {
    if (!receiverOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      if (
        receiverAreaRef.current &&
        !receiverAreaRef.current.contains(e.target as Node)
      ) {
        onReceiverClose?.();
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onReceiverClose?.();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [receiverOpen, onReceiverClose]);

  // Helper: safe translation with fallback for missing keys during dev.
  const tx = (key: string, fallback: string) => {
    try {
      return t(`submit.${key}` as Parameters<typeof t>[0]);
    } catch {
      return fallback;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      className="custom-scrollbar max-h-[98dvh] max-w-188 overflow-y-auto bg-primary-light-active p-10 text-text-primary-2"
    >
      <h2 className="mb-8 text-center text-[32px] leading-10 font-bold text-text-primary-2">
        {tx("title", "Gửi lời cám ơn và ghi nhận đến đồng đội")}
      </h2>

      <div className="flex flex-col gap-6">
        <div className="flex flex-row items-center gap-4">
          <FieldLabel required>{tx("recipientLabel", "Người nhận")}</FieldLabel>

          <div ref={receiverAreaRef} className="relative min-w-0 flex-1">
            <div className="flex h-14 flex-1 flex-row items-center justify-between gap-2 rounded-lg border border-primary-dark-hover bg-white px-6">
              <input
                type="text"
                value={receiver}
                onChange={(e) => onReceiverSearch?.(e.target.value)}
                onFocus={onReceiverOpen}
                // Also open on click: after selecting, the input keeps focus, so
                // a re-click fires no focus event — onClick reopens it.
                onClick={onReceiverOpen}
                placeholder={tx("searchPlaceholder", "Tìm kiếm")}
                aria-label={tx("recipientLabel", "Người nhận")}
                className="min-w-0 flex-1 cursor-text bg-transparent font-montserrat text-body font-bold text-text-primary-2 outline-none placeholder:text-neutral-dark-hover"
              />
              <button
                type="button"
                onClick={() =>
                  receiverOpen ? onReceiverClose?.() : onReceiverOpen?.()
                }
                aria-label={tx("recipientLabel", "Người nhận")}
                className="flex shrink-0 cursor-pointer items-center text-text-primary-2"
              >
                <IcDown
                  aria-hidden
                  className={cn(
                    "size-6 shrink-0 transition-transform duration-150",
                    receiverOpen && "rotate-180",
                  )}
                />
              </button>
            </div>
            {/* Autocomplete result list (from parent), shown while open */}
            {receiverOpen && receiverDropdownSlot && (
              <div className="absolute top-full left-0 z-20 mt-1 w-full">
                {receiverDropdownSlot}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-row items-start gap-4">
          <FieldLabel required className="h-14">
            {tx("badgeLabel", "Danh hiệu")}
          </FieldLabel>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <Input
              value={kudosTitle}
              onChange={(e) => onKudosTitleChange(e.target.value)}
              placeholder={tx(
                "badgePlaceholder",
                "Dành tặng một danh hiệu cho đồng đội",
              )}
              aria-label={tx("badgeLabel", "Danh hiệu")}
              className="w-full"
            />
            {/* Hint note under the input, aligned with the input edge. */}
            <p className="text-body font-bold tracking-[0.15px] text-neutral-dark-hover">
              {tx("badgeHint1", "Ví dụ: Người truyền động lực cho tôi.")}
              <br />
              {tx(
                "badgeHint2",
                "Danh hiệu sẽ hiển thị làm tiêu đề Kudos của bạn.",
              )}
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* ── Message editor (Quill snow renders its own single toolbar) ── */}
          <div className="flex flex-col">
            {editorSlot ?? (
              <p className="px-6 py-4 text-body font-bold tracking-[0.15px] text-neutral-dark-hover">
                {tx(
                  "editorPlaceholder",
                  "Hãy gửi gắm lời cám ơn và ghi nhận đến đồng đội tại đây nhé!",
                )}
              </p>
            )}

            {/* Hint + char counter */}
            <div className="mt-1 flex flex-row items-center justify-between">
              <span className="text-body font-bold tracking-[0.5px] text-text-primary-2">
                {tx(
                  "hintMention",
                  'Bạn có thể "@ + tên" để nhắc tới đồng nghiệp khác',
                )}
              </span>
              <span className="text-body font-bold tracking-[0.5px] text-neutral-dark-hover">
                {charCount ?? 0}/1.000
              </span>
            </div>
          </div>

          {/* ── Hashtag ── */}
          <div className="flex flex-col gap-2">
            {/* items-start: the tag group wraps to multiple rows, so the label
                aligns to the top; h-12 centers it against the first chip row. */}
            <div className="flex flex-row items-start gap-4">
              <FieldLabel required className="h-12">
                {tx("hashtagLabel", "Hashtag")}
              </FieldLabel>

              {/* Tag group: chips + button (chips first, "+ Hashtag" last) */}
              <div className="relative flex flex-row flex-wrap items-center gap-2">
                {/* Selected hashtag chips */}
                {selectedHashtags.map((tag) => (
                  <HashtagChip
                    key={tag.id}
                    label={tag.label}
                    onRemove={() => onRemoveHashtag(tag.id)}
                  />
                ))}

                {/* "+ Hashtag" button + its dropdown — wrapped in a relative box
                    so the menu anchors to the button (not the whole tag group) and
                    opens UPWARD (bottom-full), since this row sits low in the dialog. */}
                <div className="relative">
                  <Button
                    variant="secondary"
                    onClick={onOpenHashtags}
                    disabled={atMaxHashtags}
                    aria-label={tx("addHashtag", "+ Hashtag")}
                    className={cn(
                      "inline-flex h-12 items-center gap-1 rounded-lg border-primary-dark-hover bg-white px-2 py-1 leading-4 font-bold hover:bg-button-hover",
                      "disabled:border-primary-dark-hover disabled:bg-white disabled:opacity-50 disabled:hover:bg-white",
                      atMaxHashtags &&
                        "cursor-not-allowed opacity-40 hover:bg-transparent",
                    )}
                    iconLeft={
                      <IcPlus
                        aria-hidden
                        className="size-6! text-neutral-dark-hover"
                      />
                    }
                  >
                    <span className="flex flex-col">
                      <span className="text-body tracking-[0.15px] text-text-primary-2">
                        {tx("addHashtag", "Hashtag")}
                      </span>
                      <span className="text-[11px] leading-4 tracking-[0.5px] text-neutral-dark-hover">
                        {tx("maxHashtag", "Tối đa 5")}
                      </span>
                    </span>
                  </Button>

                  {hashtagDropdownSlot && (
                    <div className="absolute bottom-full left-0 z-20 mb-1">
                      {hashtagDropdownSlot}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── Image ── */}
          <div className="flex flex-row items-center gap-4">
            <FieldLabel>{tx("imageLabel", "Image")}</FieldLabel>

            <div className="flex flex-row items-center gap-4">
              {/* Thumbnails */}
              {imagePreviews.map((src, idx) => (
                <ImageThumb
                  key={src}
                  src={src}
                  alt={`Attached image ${idx + 1}`}
                  onRemove={() => onRemoveImage(idx)}
                />
              ))}

              {/* "+ Image" button — identical style to "+ Hashtag"; hidden at 5 */}
              <Button
                variant="secondary"
                onClick={onAddImages}
                disabled={atMaxImages}
                aria-label={tx("addImage", "+ Image")}
                className={cn(
                  "inline-flex h-12 items-center gap-1 rounded-lg border-primary-dark-hover bg-white px-2 py-1 leading-4 font-bold hover:bg-button-hover",
                  "disabled:border-primary-dark-hover disabled:bg-white disabled:opacity-50 disabled:hover:bg-white",
                  atMaxImages &&
                    "cursor-not-allowed opacity-40 hover:bg-transparent",
                )}
                iconLeft={
                  <IcPlus
                    aria-hidden
                    className="size-6! text-neutral-dark-hover"
                  />
                }
              >
                <span className="flex flex-col">
                  <span className="text-body tracking-[0.15px] text-text-primary-2">
                    {tx("addImage", "Image")}
                  </span>
                  <span className="text-[11px] leading-4 tracking-[0.5px] text-neutral-dark-hover">
                    {tx("maxImage", "Tối đa 5")}
                  </span>
                </span>
              </Button>
            </div>
          </div>
        </div>

        {/* ── Gửi ẩn danh ── */}
        <div className="space-y-4">
          <Checkbox
            checked={isAnonymous}
            onChange={onToggleAnonymous}
            label={tx("anonymousLabel", "Gửi lời cám ơn và ghi nhận ẩn danh")}
            ariaLabel={tx(
              "anonymousLabel",
              "Gửi lời cám ơn và ghi nhận ẩn danh",
            )}
          />

          {/* Anonymous nickname — shown only when the box is checked (required) */}
          {isAnonymous && (
            <div className="flex flex-row items-center gap-4">
              <FieldLabel required className="h-14">
                {tx("nicknameLabel", "Nickname ẩn danh")}
              </FieldLabel>
              <Input
                value={anonymousName}
                onChange={(e) => onAnonymousNameChange(e.target.value)}
                placeholder={tx("nicknamePlaceholder", "Ví dụ: Doraemon")}
                aria-label={tx("nicknameLabel", "Nickname ẩn danh")}
                className="min-w-0 flex-1"
              />
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="flex flex-row items-center gap-6">
          {/*  Hủy — secondary outline */}
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            iconRight={<IcClose aria-hidden className="size-6!" />}
            className="h-15 w-36.5 bg-button-hover font-bold text-text-primary-2"
          >
            {tx("cancel", "Hủy")}
          </Button>

          {/*  Gửi — yellow primary, fills remaining width, r8 */}
          <Button
            type="button"
            variant="primary"
            onClick={onSubmit}
            disabled={submitDisabled || submitting}
            iconRight={
              !submitting ? (
                <IcSend aria-hidden className="size-6!" />
              ) : undefined
            }
            className="flex-1 rounded-lg px-4 py-4 text-cta font-bold"
            aria-label={tx("send", "Gửi")}
          >
            {submitting ? tx("sending", "Đang gửi...") : tx("send", "Gửi")}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
