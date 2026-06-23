"use client";

/**
 * KudosRichEditor — client-only rich-text editor using the react-quill-new
 * <ReactQuill> component (Quill 2 under the hood).
 *
 * Dynamic-imported with ssr:false by the parent (SubmitKudos) — Quill needs the
 * DOM. UNCONTROLLED (no `value` prop): Quill owns its content and reports changes
 * up via onChange. The dialog unmounts on close, so the editor resets naturally.
 *
 * Single snow toolbar with exactly the spec buttons (Bold, Italic, Strike,
 * Ordered list, Link, Blockquote) plus a right-aligned "community standards"
 * link. The Link button opens a custom "Thêm đường dẫn" modal (Content + URL)
 * instead of Quill's default inline tooltip. Enforces a max character count.
 */

import "react-quill-new/dist/quill.snow.css";

import { type ComponentProps, memo, useEffect, useRef, useState } from "react";
import ReactQuill from "react-quill-new";
import { useTranslations } from "next-intl";

import IcClose from "@icons/ic-close.svg";
import IcLink from "@icons/ic-link.svg";
import IcPen from "@icons/ic-pen.svg";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/cn";
import { normalizeUrl } from "@/lib/kudos/normalize-url";

export interface KudosRichEditorProps {
  onChange: (html: string) => void;
  onTextChange?: (plainLength: number) => void;
  placeholder?: string;
  /** Max plain-text characters (default 1000). */
  maxLength?: number;
  /** Right-aligned toolbar link label (e.g. "Tiêu chuẩn cộng đồng"). */
  standardsLabel?: string;
  /** Clicked the standards link. */
  onStandards?: () => void;
}

const TOOLBAR = [
  ["bold", "italic", "strike"],
  [{ list: "ordered" }],
  ["link", "blockquote"],
];

const FORMATS = ["bold", "italic", "strike", "list", "link", "blockquote"];

const MODULES = { toolbar: TOOLBAR };

interface LinkDraft {
  content: string;
  url: string;
  /** Selection at the time the modal opened (where the link is inserted). */
  range: { index: number; length: number } | null;
}

interface LinkPreview {
  url: string;
  range: { index: number; length: number };
  /** Position (px) relative to the editor wrapper. */
  top: number;
  left: number;
}

// Memoized: the editor is uncontrolled, so once mounted it never needs to
// re-render. All props from the parent are referentially stable, so memo makes
// it mount exactly once — preventing react-quill from churning its internal
// state on every keystroke (which caused typed text to overlap the placeholder).
export const KudosRichEditor = memo(function KudosRichEditor({
  onChange,
  onTextChange,
  placeholder,
  maxLength = 1000,
  standardsLabel,
  onStandards,
}: KudosRichEditorProps) {
  const t = useTranslations("kudos");
  const wrapRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<ReactQuill>(null);
  const onStandardsRef = useRef(onStandards);

  // Link add/edit form draft (null = closed).
  const [linkDraft, setLinkDraft] = useState<LinkDraft | null>(null);
  // Preview popover shown when clicking an existing link (null = closed).
  const [linkPreview, setLinkPreview] = useState<LinkPreview | null>(null);

  useEffect(() => {
    onStandardsRef.current = onStandards;
  });

  // Post-mount: register the custom link handler (react-quill-new ignores
  // modules.toolbar.handlers, so we override it on the toolbar module here),
  // harden the contenteditable against extensions, handle IME composition, and
  // add the standards link.
  useEffect(() => {
    const quill = quillRef.current?.getEditor();
    const root = quill?.root;
    if (!quill || !root) return;

    // Override the Link button to open our custom modal instead of Quill's
    // default inline tooltip.
    const toolbarModule = quill.getModule("toolbar") as {
      addHandler: (format: string, handler: () => void) => void;
    };
    toolbarModule.addHandler("link", () => {
      const range = quill.getSelection(true);
      const content =
        range && range.length ? quill.getText(range.index, range.length) : "";
      setLinkDraft({
        content,
        url: "",
        range: range ? { index: range.index, length: range.length } : null,
      });
    });

    // Clicking an existing link → show our custom preview popover instead of
    // Quill's native tooltip (which we hide via CSS). Walk the link's format
    // boundaries to get its full range, then position the popover under it.
    const handleLinkClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest("a");
      if (!a || !root.contains(a)) {
        setLinkPreview(null);
        return;
      }
      e.preventDefault();
      // Defer so Quill has updated its selection from the click.
      setTimeout(() => {
        const sel = quill.getSelection();
        if (!sel) return;
        const url = a.getAttribute("href") ?? "";
        let start = sel.index;
        let end = sel.index;
        while (start > 0 && quill.getFormat(start - 1, 1).link === url) start--;
        while (end < quill.getLength() && quill.getFormat(end, 1).link === url)
          end++;
        if (end <= start) return;
        const wrap = wrapRef.current?.getBoundingClientRect();
        if (!wrap) return;
        const ar = a.getBoundingClientRect();
        setLinkPreview({
          url,
          range: { index: start, length: end - start },
          top: ar.bottom - wrap.top + 4,
          left: ar.left - wrap.left,
        });
      }, 0);
    };
    root.addEventListener("click", handleLinkClick);

    // IME (e.g. Vietnamese Telex): Quill defers its `text-change` until
    // `compositionend`, so while composing a word the placeholder (`ql-blank`)
    // stays and overlaps the text being typed, clearing only on blur/space.
    const handleCompositionStart = () => root.classList.remove("ql-blank");
    root.addEventListener("compositionstart", handleCompositionStart);

    const toolbar = wrapRef.current?.querySelector(".ql-toolbar");
    if (
      toolbar &&
      standardsLabel &&
      !toolbar.querySelector(".kudos-standards-link")
    ) {
      const link = document.createElement("a");
      link.href = "#";
      link.textContent = standardsLabel;
      link.className = "kudos-standards-link";
      link.addEventListener("click", (e) => {
        e.preventDefault();
        onStandardsRef.current?.();
      });
      toolbar.appendChild(link);
    }

    return () => {
      root.removeEventListener("compositionstart", handleCompositionStart);
      root.removeEventListener("click", handleLinkClick);
    };
  }, [standardsLabel]);

  // Close the link preview when clicking outside the editor wrapper.
  useEffect(() => {
    if (!linkPreview) return;
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setLinkPreview(null);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [linkPreview]);

  const handleChange: NonNullable<
    ComponentProps<typeof ReactQuill>["onChange"]
  > = (content, _delta, _source, editor) => {
    // Enforce the max character count (getLength counts the trailing newline).
    const quill = quillRef.current?.getEditor();
    if (quill && quill.getLength() - 1 > maxLength) {
      quill.deleteText(maxLength, quill.getLength());
      return; // onChange fires again after the trim
    }
    onChange(content);
    onTextChange?.(editor.getText().trim().length);
  };

  // Insert the link from the modal at the saved selection.
  const applyLink = () => {
    const quill = quillRef.current?.getEditor();
    if (!quill || !linkDraft) return;
    const url = normalizeUrl(linkDraft.url);
    if (!url) return;
    const text = linkDraft.content.trim() || linkDraft.url.trim();
    const r = linkDraft.range;
    const index = r ? r.index : quill.getLength() - 1;
    if (r && r.length) quill.deleteText(r.index, r.length);
    quill.insertText(index, text, "link", url);
    quill.setSelection(index + text.length, 0);
    setLinkDraft(null);
  };

  // From the preview popover: open the edit form (reuses the add form).
  const editLinkFromPreview = () => {
    const quill = quillRef.current?.getEditor();
    if (!quill || !linkPreview) return;
    const { range, url } = linkPreview;
    setLinkDraft({
      content: quill.getText(range.index, range.length),
      url,
      range,
    });
    setLinkPreview(null);
  };

  // From the preview popover: strip the link format off its range.
  const removeLinkFromPreview = () => {
    const quill = quillRef.current?.getEditor();
    if (!quill || !linkPreview) return;
    quill.formatText(
      linkPreview.range.index,
      linkPreview.range.length,
      "link",
      false,
    );
    setLinkPreview(null);
  };

  return (
    <div
      ref={wrapRef}
      translate="no"
      className={cn(
        // relative: anchors the in-editor link overlays below.
        // Hide Quill's native link tooltip — we render our own preview popover.
        "relative [&_.ql-tooltip]:hidden!",
        // Toolbar bar: cream bg, flush padding
        "[&_.ql-toolbar]:flex [&_.ql-toolbar]:items-center [&_.ql-toolbar]:overflow-hidden [&_.ql-toolbar]:rounded-t-lg [&_.ql-toolbar]:border-primary-dark-hover! [&_.ql-toolbar]:bg-primary-light-active [&_.ql-toolbar]:p-0!",
        // Button groups: 8px gap, no default margin
        "[&_.ql-formats]:m-0! [&_.ql-formats]:flex [&_.ql-formats]:items-center [&_.ql-formats]:gap-2",
        // Each button (Figma: 40px tall, hug width, 10×16 padding, 8px radius, 1px border)
        "[&_.ql-toolbar_button]:flex [&_.ql-toolbar_button]:h-10! [&_.ql-toolbar_button]:w-auto! [&_.ql-toolbar_button]:items-center [&_.ql-toolbar_button]:justify-center [&_.ql-toolbar_button]:border! [&_.ql-toolbar_button]:border-solid! [&_.ql-toolbar_button]:border-primary-dark-hover! [&_.ql-toolbar_button]:px-4! [&_.ql-toolbar_button]:py-2.5!",
        "[&_.ql-toolbar_svg]:size-6!",
        // Right-aligned "community standards" link
        "[&_.kudos-standards-link]:m-auto [&_.kudos-standards-link]:w-fit! [&_.kudos-standards-link]:cursor-pointer [&_.kudos-standards-link]:text-body [&_.kudos-standards-link]:font-bold [&_.kudos-standards-link]:tracking-[0.15px] [&_.kudos-standards-link]:text-error! [&_.kudos-standards-link]:underline",
        // Editor container + writing area
        "[&_.ql-container]:h-50! [&_.ql-container]:rounded-b-lg [&_.ql-container]:border-primary-dark-hover! [&_.ql-container]:bg-white",
        "[&_.ql-editor]:min-h-40 [&_.ql-editor]:px-6! [&_.ql-editor]:py-4! [&_.ql-editor]:font-montserrat [&_.ql-editor]:text-body [&_.ql-editor>ol]:p-0!",
        // Placeholder (Quill renders it via .ql-blank::before) — match the field style
        "[&_.ql-editor.ql-blank::before]:right-6! [&_.ql-editor.ql-blank::before]:left-6! [&_.ql-editor.ql-blank::before]:font-bold [&_.ql-editor.ql-blank::before]:tracking-[0.15px] [&_.ql-editor.ql-blank::before]:text-neutral-dark-hover! [&_.ql-editor.ql-blank::before]:not-italic!",
        "[&_.ql-editor>p]:text-cta! [&_.ql-editor>p]:text-text-primary-2!",
      )}
    >
      <ReactQuill
        ref={quillRef}
        theme="snow"
        onChange={handleChange}
        modules={MODULES}
        formats={FORMATS}
        placeholder={placeholder}
      />

      {/* "Add link" box — overlays the editor area (absolute within this
          relative wrapper), so it sits above the editor without portals/z-index
          fights with the parent dialog. Backdrop click closes it. */}
      {linkDraft && (
        <div
          className="absolute inset-0 z-30 flex items-center justify-center rounded-lg bg-black/40 p-3"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setLinkDraft(null);
          }}
        >
          <div className="w-full max-w-md rounded-2xl border border-primary-dark-hover bg-primary-light-active p-6 text-text-primary-2 shadow-lg">
            <h2 className="mb-4 text-cta font-bold">{t("submit.linkTitle")}</h2>

            <div className="flex flex-col gap-3">
              <div className="flex flex-row items-center gap-3">
                <span className="w-16 shrink-0 font-bold">
                  {t("submit.linkContent")}
                </span>
                <Input
                  value={linkDraft.content}
                  onChange={(e) =>
                    setLinkDraft({ ...linkDraft, content: e.target.value })
                  }
                  className="h-11 min-w-0 flex-1"
                />
              </div>

              <div className="flex flex-row items-center gap-3">
                <span className="w-16 shrink-0 font-bold">
                  {t("submit.linkUrl")}
                </span>
                <Input
                  value={linkDraft.url}
                  onChange={(e) =>
                    setLinkDraft({ ...linkDraft, url: e.target.value })
                  }
                  placeholder="https://..."
                  className="h-11 min-w-0 flex-1"
                />
              </div>

              <div className="mt-1 flex flex-row items-center gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setLinkDraft(null)}
                  iconRight={<IcClose aria-hidden className="size-5!" />}
                  className="rounded-lg px-6 py-2 font-bold text-text-primary-2"
                >
                  {t("submit.cancel")}
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  onClick={applyLink}
                  disabled={!linkDraft.url.trim()}
                  iconRight={<IcLink aria-hidden className="size-5!" />}
                  className="flex-1 rounded-lg px-4 py-2 font-bold"
                >
                  {t("submit.linkSave")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Link preview popover — shown when clicking an existing link. URL +
          Edit/Remove icons. Positioned under the link, within this wrapper. */}
      {linkPreview && !linkDraft && (
        <div
          className="absolute z-30 flex max-w-full items-center gap-2 rounded-lg border border-primary-dark-hover bg-white px-3 py-2 shadow-lg"
          style={{ top: linkPreview.top, left: linkPreview.left }}
        >
          <a
            href={linkPreview.url}
            target="_blank"
            rel="noopener noreferrer"
            className="max-w-50 truncate text-sm font-bold text-primary-dark-hover underline"
          >
            {linkPreview.url}
          </a>
          <button
            type="button"
            onClick={editLinkFromPreview}
            aria-label={t("submit.linkSave")}
            className="shrink-0 cursor-pointer text-text-primary-2 opacity-70 hover:opacity-100"
          >
            <IcPen aria-hidden className="size-5" />
          </button>
          <button
            type="button"
            onClick={removeLinkFromPreview}
            aria-label="Remove"
            className="shrink-0 cursor-pointer text-error opacity-70 hover:opacity-100"
          >
            <IcClose aria-hidden className="size-5" />
          </button>
        </div>
      )}
    </div>
  );
});
