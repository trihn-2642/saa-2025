import { create } from "zustand";

export interface PrefillReceiver {
  id: string;
  fullName: string;
}

interface SubmitKudosState {
  isOpen: boolean;
  prefillReceiver?: PrefillReceiver;
  /** Bumped on each successful submit so listeners (the board) can refetch. */
  submittedAt: number;
  open: (prefill?: PrefillReceiver) => void;
  close: () => void;
  markSubmitted: () => void;
}

export const useSubmitKudosStore = create<SubmitKudosState>((set) => ({
  isOpen: false,
  prefillReceiver: undefined,
  submittedAt: 0,
  open: (prefill) => set({ isOpen: true, prefillReceiver: prefill }),
  close: () => set({ isOpen: false, prefillReceiver: undefined }),
  markSubmitted: () => set({ submittedAt: Date.now() }),
}));
