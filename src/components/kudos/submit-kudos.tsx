"use client";

/**
 * SubmitKudos — logic container for the global write-kudos dialog.
 *
 * Composes:
 *   - SubmitKudosDialog  (presentational shell)
 *   - HashtagDropdown    (plugged into hashtagDropdownSlot)
 *   - KudosRichEditor    (dynamic-imported, ssr:false — plugged into editorSlot)
 *   - Receiver autocomplete panel (plugged into receiverDropdownSlot)
 *
 * Visibility is driven by useSubmitKudosStore (zustand).
 * Mount this once in the protected layout.
 */

import {
  type ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import {
  fetchHashtagOptions,
  fetchSearchProfiles,
  submitKudos,
} from "@/app/(user)/(protected)/kudos/actions";
import { cn } from "@/lib/cn";
import { uploadKudosImage } from "@/lib/kudos/upload-image";
import { useSubmitKudosStore } from "@/stores/submit-kudos-store";

import { HashtagDropdown } from "./hashtag-dropdown";
import type { HashtagItem } from "./submit-kudos-dialog";
import { SubmitKudosDialog } from "./submit-kudos-dialog";

// ---------------------------------------------------------------------------
// Dynamic import: Quill needs the DOM — no SSR.
// ---------------------------------------------------------------------------
const KudosRichEditor = dynamic(
  () =>
    import("./kudos-rich-editor").then((m) => ({ default: m.KudosRichEditor })),
  { ssr: false },
);

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ReceiverOption {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  departmentName: string | null;
}

interface HashtagOption {
  value: string;
  label: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Strip HTML tags and trim — used to check if Quill output is empty. */
function isHtmlEmpty(html: string): boolean {
  const text = html.replace(/<[^>]*>/g, "").trim();
  return text.length === 0;
}

/** Validate a file before adding to the queue. */
function validateImageFile(file: File): string | null {
  if (!file.type.startsWith("image/")) return "Only image files are allowed.";
  if (file.size > 5 * 1024 * 1024) return "Each image must be 5 MB or smaller.";
  return null;
}

// ---------------------------------------------------------------------------
// ReceiverDropdown — avatar + name + dept rows per Figma 520-11648
// ---------------------------------------------------------------------------

function ReceiverDropdown({
  options,
  selectedId,
  onSelect,
}: {
  options: ReceiverOption[];
  selectedId?: string;
  onSelect: (opt: ReceiverOption) => void;
}) {
  if (options.length === 0) return null;

  return (
    <ul
      role="listbox"
      aria-label="Recipient search results"
      className="max-h-80 overflow-y-auto rounded-lg border border-primary-dark-hover bg-details-overlay shadow-lg"
    >
      {options.map((opt) => {
        const active = opt.id === selectedId;
        return (
          <li key={opt.id} role="option" aria-selected={active}>
            <button
              type="button"
              className={cn(
                "flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-primary-normal/10",
                active && "bg-primary-normal/20",
              )}
              onMouseDown={(e) => {
                // mousedown fires before input blur — prevent the blur from
                // closing the dropdown before the click registers.
                e.preventDefault();
                onSelect(opt);
              }}
            >
              {/* Avatar circle */}
              <span
                className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-primary-dark-hover bg-details-container"
                aria-hidden="true"
              >
                {opt.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={opt.avatarUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-bold text-primary-normal">
                    {opt.fullName.charAt(0).toUpperCase()}
                  </span>
                )}
              </span>

              {/* Name + department */}
              <span className="flex min-w-0 flex-col">
                <span
                  className={cn(
                    "truncate font-montserrat text-body font-bold",
                    active ? "text-primary-normal" : "text-white",
                  )}
                >
                  {opt.fullName}
                </span>
                {opt.departmentName && (
                  <span className="truncate text-sm text-neutral-dark-hover">
                    {opt.departmentName}
                  </span>
                )}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

// ---------------------------------------------------------------------------
// SubmitKudos
// ---------------------------------------------------------------------------

export function SubmitKudos() {
  const router = useRouter();
  const t = useTranslations("kudos");

  const { isOpen, prefillReceiver, close, markSubmitted } =
    useSubmitKudosStore();

  // --- Receiver ---
  const [receiverQuery, setReceiverQuery] = useState("");
  const [receiver, setReceiver] = useState<ReceiverOption | null>(null);
  // Full recipient list, fetched ONCE (lazily on first open) and filtered client-side.
  const [allReceivers, setAllReceivers] = useState<ReceiverOption[]>([]);
  // True while the one-time recipient fetch is in flight (drives the spinner).
  const [receiverLoading, setReceiverLoading] = useState(false);
  const receiverLoadedRef = useRef(false);
  const [showReceiverDrop, setShowReceiverDrop] = useState(false);

  // --- Kudos title (Danh hiệu) ---
  const [kudosTitle, setKudosTitle] = useState("");

  // --- Message ---
  const [messageHtml, setMessageHtml] = useState("");
  const [charCount, setCharCount] = useState(0);

  // --- Hashtags ---
  const [hashtagOptions, setHashtagOptions] = useState<HashtagOption[]>([]);
  const [selectedHashtagValues, setSelectedHashtagValues] = useState<string[]>(
    [],
  );
  const [showHashtagDrop, setShowHashtagDrop] = useState(false);

  // Ref for the hashtag area — used for outside-click detection.
  const hashtagAreaRef = useRef<HTMLDivElement>(null);

  // --- Images ---
  const [files, setFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Anonymous ---
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [anonymousName, setAnonymousName] = useState("");

  // --- Submit ---
  const [submitting, setSubmitting] = useState(false);

  // ── Load hashtag options once on mount ─────────────────────────────────
  useEffect(() => {
    fetchHashtagOptions()
      .then(setHashtagOptions)
      .catch(() => {
        // Non-blocking: dropdown will be empty.
      });
  }, []);

  // ── Sync prefill when dialog opens ──────────────────────────────────────
  useEffect(() => {
    if (!isOpen || !prefillReceiver) return;
    /* eslint-disable react-hooks/set-state-in-effect */
    setReceiver({
      id: prefillReceiver.id,
      fullName: prefillReceiver.fullName,
      avatarUrl: null,
      departmentName: null,
    });
    setReceiverQuery(prefillReceiver.fullName);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [isOpen, prefillReceiver]);

  // ── Close hashtag dropdown on outside click / Escape ────────────────────
  useEffect(() => {
    if (!showHashtagDrop) return;

    const handlePointerDown = (e: PointerEvent) => {
      if (
        hashtagAreaRef.current &&
        !hashtagAreaRef.current.contains(e.target as Node)
      ) {
        setShowHashtagDrop(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowHashtagDrop(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showHashtagDrop]);

  // ── Reset all state on close ────────────────────────────────────────────
  const resetForm = useCallback(() => {
    setReceiverQuery("");
    setReceiver(null);
    setShowReceiverDrop(false);
    setKudosTitle("");
    setMessageHtml("");
    setCharCount(0);
    setSelectedHashtagValues([]);
    setShowHashtagDrop(false);
    setImagePreviews((prev) => {
      prev.forEach((url) => URL.revokeObjectURL(url));
      return [];
    });
    setFiles([]);
    setIsAnonymous(false);
    setAnonymousName("");
  }, []);

  const handleCancel = useCallback(() => {
    resetForm();
    close();
  }, [resetForm, close]);

  // Fetch the full recipient list ONCE (lazy) and cache it. Subsequent opens
  // reuse the cache (no refetch flash); typing filters it client-side.
  const ensureReceiversLoaded = useCallback(async () => {
    if (receiverLoadedRef.current) return;
    receiverLoadedRef.current = true;
    setReceiverLoading(true);
    try {
      setAllReceivers(await fetchSearchProfiles(""));
    } catch {
      receiverLoadedRef.current = false; // allow retry on failure
    } finally {
      setReceiverLoading(false);
    }
  }, []);

  const handleReceiverSearch = useCallback(
    (value: string) => {
      setReceiverQuery(value);
      setReceiver(null);
      setShowReceiverDrop(true);
      ensureReceiversLoaded();
    },
    [ensureReceiversLoaded],
  );

  const handleSelectReceiver = useCallback((option: ReceiverOption) => {
    setReceiver(option);
    setReceiverQuery(option.fullName);
    setShowReceiverDrop(false);
  }, []);

  // Open the dropdown (uses the cached list — browse all).
  const handleReceiverOpen = useCallback(() => {
    setShowReceiverDrop(true);
    ensureReceiversLoaded();
  }, [ensureReceiversLoaded]);

  // List shown in the dropdown: full list when browsing (no query, or the query
  // still equals the committed selection), otherwise filtered by the typed text.
  const filteredReceivers = useMemo(() => {
    const q = receiverQuery.trim().toLowerCase();
    if (!q || (receiver && receiverQuery === receiver.fullName)) {
      return allReceivers;
    }
    return allReceivers.filter((r) => r.fullName.toLowerCase().includes(q));
  }, [allReceivers, receiverQuery, receiver]);

  // ── Hashtag toggle ───────────────────────────────────────────────────────
  const handleHashtagToggle = useCallback((value: string) => {
    setSelectedHashtagValues((prev) => {
      if (prev.includes(value)) return prev.filter((v) => v !== value);
      if (prev.length >= 5) return prev;
      return [...prev, value];
    });
  }, []);

  const handleRemoveHashtag = useCallback((id: string) => {
    setSelectedHashtagValues((prev) => prev.filter((v) => v !== id));
  }, []);

  // ── Image file picking ───────────────────────────────────────────────────
  const handleAddImages = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const chosen = Array.from(e.target.files ?? []);
      e.target.value = "";

      const remaining = 5 - files.length;
      if (remaining <= 0) return;

      const toAdd: File[] = [];
      for (const file of chosen.slice(0, remaining)) {
        const err = validateImageFile(file);
        if (err) {
          toast.error(err);
          return;
        }
        toAdd.push(file);
      }
      if (toAdd.length === 0) return;

      // Side effects (createObjectURL) + state updates are kept OUT of the
      // setState updater so they run exactly once — React StrictMode double-
      // invokes updater functions in dev, which previously created a duplicate
      // preview per file.
      const newPreviews = toAdd.map((f) => URL.createObjectURL(f));
      setFiles((prev) => [...prev, ...toAdd]);
      setImagePreviews((prev) => [...prev, ...newPreviews]);
    },
    [files],
  );

  const handleRemoveImage = useCallback((index: number) => {
    setFiles((prev) => {
      const next = [...prev];
      next.splice(index, 1);
      return next;
    });
    setImagePreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      const next = [...prev];
      next.splice(index, 1);
      return next;
    });
  }, []);

  // ── Validation ───────────────────────────────────────────────────────────
  const isValid =
    receiver !== null &&
    kudosTitle.trim().length > 0 &&
    !isHtmlEmpty(messageHtml) &&
    selectedHashtagValues.length >= 1 &&
    selectedHashtagValues.length <= 5 &&
    files.length <= 5 &&
    // Anonymous requires a nickname.
    (!isAnonymous || anonymousName.trim().length > 0);

  // ── Submit pipeline ──────────────────────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    if (!isValid || submitting || !receiver) return;
    setSubmitting(true);

    try {
      // 1. Upload images.
      const imageUrls: string[] = [];
      for (const file of files) {
        const url = await uploadKudosImage(file);
        imageUrls.push(url);
      }

      // 2. Submit kudos — title (Danh hiệu) is its own column now, kept out of
      //    the message HTML so the card body shows only the message.
      await submitKudos({
        receiverId: receiver.id,
        title: kudosTitle.trim(),
        message: messageHtml,
        hashtags: selectedHashtagValues,
        images: imageUrls,
        isAnonymous,
        anonymousName: isAnonymous ? anonymousName.trim() : undefined,
      });

      resetForm();
      close();
      markSubmitted(); // signal the board to refetch the first page
      router.refresh();
      toast.success(t("submit.successToast"));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : t("submit.errorToast");
      toast.error(t("submit.errorToast"), { description: message });
    } finally {
      setSubmitting(false);
    }
  }, [
    isValid,
    submitting,
    receiver,
    kudosTitle,
    files,
    messageHtml,
    selectedHashtagValues,
    isAnonymous,
    anonymousName,
    resetForm,
    close,
    markSubmitted,
    router,
    t,
  ]);

  // ── Derived UI state ─────────────────────────────────────────────────────

  const selectedHashtags: HashtagItem[] = selectedHashtagValues.map((v) => ({
    id: v,
    label: v,
  }));

  // Receiver dropdown slot — styled per Figma 520-11648. Shows the filtered
  // list (selected row highlighted), or a "no results" hint while typing.
  const receiverDropdownSlot = receiverLoading ? (
    <div className="flex items-center justify-center gap-2 rounded-lg border border-primary-dark-hover bg-details-overlay px-4 py-4 text-body text-neutral-dark-hover">
      <span
        aria-hidden
        className="size-5 animate-spin rounded-full border-2 border-primary-dark-hover border-t-primary-normal"
      />
      {t("empty.loading")}
    </div>
  ) : filteredReceivers.length > 0 ? (
    <ReceiverDropdown
      options={filteredReceivers}
      selectedId={receiver?.id}
      onSelect={handleSelectReceiver}
    />
  ) : (
    <div className="rounded-lg border border-primary-dark-hover bg-details-overlay px-4 py-3 text-body text-neutral-dark-hover">
      {t("empty.noData")}
    </div>
  );

  // Hashtag dropdown slot — wrapped in ref div for outside-click detection.
  const hashtagDropdownSlot = showHashtagDrop ? (
    <div ref={hashtagAreaRef}>
      <HashtagDropdown
        options={hashtagOptions}
        selected={selectedHashtagValues}
        onToggle={handleHashtagToggle}
        max={5}
      />
    </div>
  ) : null;

  // Editor slot.
  const editorSlot = (
    <KudosRichEditor
      onChange={setMessageHtml}
      onTextChange={setCharCount}
      placeholder={t("submit.editorPlaceholder")}
      maxLength={1000}
      standardsLabel={t("submit.standards")}
    />
  );

  if (!isOpen) return null;

  return (
    <>
      {/* Hidden file input — triggered by handleAddImages */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        aria-hidden="true"
        tabIndex={-1}
        onChange={handleFileChange}
      />

      <SubmitKudosDialog
        open={isOpen}
        onCancel={handleCancel}
        // Receiver
        receiver={receiverQuery}
        onReceiverSearch={handleReceiverSearch}
        receiverOpen={showReceiverDrop}
        onReceiverOpen={handleReceiverOpen}
        onReceiverClose={() => setShowReceiverDrop(false)}
        receiverDropdownSlot={receiverDropdownSlot}
        // Danh hiệu
        kudosTitle={kudosTitle}
        onKudosTitleChange={setKudosTitle}
        // Editor
        editorSlot={editorSlot}
        charCount={charCount}
        // Hashtags
        selectedHashtags={selectedHashtags}
        onRemoveHashtag={handleRemoveHashtag}
        onOpenHashtags={() => setShowHashtagDrop((v) => !v)}
        hashtagDropdownSlot={hashtagDropdownSlot}
        // Images
        imagePreviews={imagePreviews}
        onAddImages={handleAddImages}
        onRemoveImage={handleRemoveImage}
        // Anonymous
        isAnonymous={isAnonymous}
        onToggleAnonymous={() => setIsAnonymous((v) => !v)}
        anonymousName={anonymousName}
        onAnonymousNameChange={setAnonymousName}
        // Footer
        onSubmit={handleSubmit}
        submitDisabled={!isValid}
        submitting={submitting}
      />
    </>
  );
}
