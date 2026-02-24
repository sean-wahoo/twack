import { atom } from "jotai";
import { atomWithDefault, useAtomCallback } from "jotai/utils";
import { atomWithToggle } from "./utils";
import { useCallback } from "react";

const _profileBodyAtom = atom("showcase");
export const profileBodyAtom = atomWithDefault((get) => get(_profileBodyAtom));
