import { atom } from "jotai";
import { useAtomCallback } from "jotai/utils";
import { atomWithToggle } from "./utils";
import { useCallback } from "react";

export const shelfSidebarAtom = atomWithToggle();

export const shelfViewAtom = atom(
  "showcase" as "showcase" | "collections" | "trackers",
);
