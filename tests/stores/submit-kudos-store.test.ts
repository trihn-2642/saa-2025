import { beforeEach, describe, expect, it } from "vitest";

import { useSubmitKudosStore } from "@/stores/submit-kudos-store";

/** Zustand store — driven via getState()/actions (no React needed). */

const store = useSubmitKudosStore;

beforeEach(() => {
  store.setState({
    isOpen: false,
    prefillReceiver: undefined,
    submittedAt: 0,
  });
});

describe("useSubmitKudosStore", () => {
  it("starts closed with no prefill", () => {
    const s = store.getState();
    expect(s.isOpen).toBe(false);
    expect(s.prefillReceiver).toBeUndefined();
    expect(s.submittedAt).toBe(0);
  });

  it("open() opens and stores the prefill receiver", () => {
    store.getState().open({ id: "u1", fullName: "Alice" });
    const s = store.getState();
    expect(s.isOpen).toBe(true);
    expect(s.prefillReceiver).toEqual({ id: "u1", fullName: "Alice" });
  });

  it("open() with no arg opens without a prefill", () => {
    store.getState().open();
    expect(store.getState().isOpen).toBe(true);
    expect(store.getState().prefillReceiver).toBeUndefined();
  });

  it("close() resets open state and prefill", () => {
    store.getState().open({ id: "u1", fullName: "Alice" });
    store.getState().close();
    const s = store.getState();
    expect(s.isOpen).toBe(false);
    expect(s.prefillReceiver).toBeUndefined();
  });

  it("markSubmitted() bumps submittedAt to a positive timestamp", () => {
    store.getState().markSubmitted();
    expect(store.getState().submittedAt).toBeGreaterThan(0);
  });
});
