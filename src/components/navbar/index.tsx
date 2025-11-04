"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import styles from "./navbar.module.scss";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import { clickInRect, debounce } from "@/lib/utils";

import Link from "next/link";
import Dialog from "@/components/dialog";
import Button from "@/components/button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import GameCard from "@/components/gameCard";
import { useRouter } from "next/navigation";
import { chevronDown } from "@/lib/svgIcons";

const Navbar: React.FC = () => {
  const accountMenuRef = useRef<HTMLDialogElement>(null);
  const accountDropdownRef = useRef<HTMLUListElement>(null);

  const [gameSearchValue, setGameSearchValue] = useState<string>("");

  const [dropdownShown, setDropdownShown] = useState<boolean>(false);

  const { data: session, status } = useSession();
  const accountMenuDropdown = (
    <ul
      className={[
        styles.account_menu_dropdown,
        dropdownShown ? styles.shown : null,
      ].join(" ")}
      ref={accountDropdownRef}
      id="account-dropdown"
      data-dropdown
    >
      <li>
        <Link
          onClick={() => setDropdownShown(false)}
          href={`/${session?.user?.slug}`}
        >
          Your profile
        </Link>
      </li>
      <li>
        <Link
          onClick={() => setDropdownShown(false)}
          href={`/${session?.user?.slug}/shelf`}
        >
          Your shelf
        </Link>
      </li>
      <li>
        <Link
          onClick={() => setDropdownShown(false)}
          href={`/${session?.user?.slug}/reviews`}
        >
          Your reviews
        </Link>
      </li>
      <li onClick={() => signOut()} className={styles.logout_button}>
        Logout
      </li>
    </ul>
  );

  const brand = (
    <Link href="/" className={styles.brand} prefetch={true}>
      <h3>T</h3>
      <h3>W</h3>
      <h3>A</h3>
      <h3>C</h3>
      <h3>K</h3>
    </Link>
  );

  const accountMenu =
    status !== "authenticated" ? (
      <span className={styles.account_menu}>
        <Button
          onClick={() => {
            if (accountMenuRef.current) {
              accountMenuRef.current.showModal();
            }
          }}
          className={styles.sign_in_button}
        >
          sign in!
        </Button>
      </span>
    ) : (
      <span
        onClick={(e) => {
          if (accountDropdownRef.current) {
            setDropdownShown(!dropdownShown);
            e.stopPropagation();
          }
        }}
        className={styles.account_menu}
      >
        <h5>{session.user!.name}</h5>
        <Image
          src={session.user!.image || ""}
          alt={`${session.user!.name}'s face'`}
          width={36}
          height={36}
        />
        {chevronDown}
      </span>
    );

  const signInDialog = (
    <Dialog ref={accountMenuRef} className={styles.sign_in_dialog}>
      <Button onClick={() => signIn()}>sign in with discord!</Button>
    </Dialog>
  );

  useEffect(() => {
    const clickOutsideDropdownCheck: (this: Document, e: MouseEvent) => void = (
      e,
    ) => {
      if (accountDropdownRef.current) {
        const dropdowns = document.querySelectorAll(
          `[data-dropdown].${styles.shown}`,
        );
        for (const dropdown of dropdowns) {
          const rect = dropdown.getBoundingClientRect();
          if (!clickInRect(rect, e)) {
            dropdown.classList.remove(styles.shown);
            setDropdownShown(false);
          }
        }
      }
    };
    document.addEventListener("click", clickOutsideDropdownCheck);
    return () =>
      document.removeEventListener("click", clickOutsideDropdownCheck);
  }, [dropdownShown]);

  const gameSearchInputRef = useRef<HTMLInputElement>(null);
  const gameSearchResultsRef = useRef<HTMLDivElement>(null);
  const keepSearchResultsAtInput: (
    this: Document,
    e?: UIEvent,
  ) => void = () => {
    if (gameSearchInputRef.current && gameSearchResultsRef.current) {
      const inputRect = gameSearchInputRef.current.getBoundingClientRect();
      const resultsRect = gameSearchResultsRef.current.getBoundingClientRect();
    }
  };

  keepSearchResultsAtInput.call({} as Document);

  const queryClient = useQueryClient();
  const trpc = useTRPC();

  const gameSearchQueryKey = trpc.igdb.getGamesSearch.queryKey();
  const { data: gameSearchData, status: gameSearchStatus } = useQuery(
    trpc.igdb.getGamesSearch.queryOptions(
      {
        search: gameSearchValue,
      },
      {
        enabled: gameSearchValue.length > 2,
      },
    ),
  );

  const searchDebouncedCallback = debounce((value: string) => {
    setGameSearchValue(value);
    console.log("searching!");
    queryClient.invalidateQueries({ queryKey: gameSearchQueryKey });
  }, 350);

  const searchInputOnChange: React.ChangeEventHandler<HTMLInputElement> = (e) =>
    searchDebouncedCallback(e.currentTarget.value);

  useEffect(() => {
    if (gameSearchResultsRef.current) {
      if (gameSearchStatus === "success" && gameSearchData?.length) {
        gameSearchResultsRef.current.classList.add(styles.shown);
      } else {
        gameSearchResultsRef.current.classList.remove(styles.shown);
      }
    }
  }, [gameSearchStatus]);

  const searchInputResults = (
    <div
      data-dropdown
      className={styles.navbar_search_results}
      ref={gameSearchResultsRef}
    >
      {gameSearchData?.length
        ? gameSearchData.map((game, index) => {
            const onClick = () =>
              gameSearchResultsRef.current?.classList?.remove?.(styles.shown);
            if (index === 0) {
              return (
                <GameCard
                  key={game.id}
                  gameId={game.id}
                  game={game}
                  isLink={true}
                  onClick={onClick}
                />
              );
            } else {
              return (
                <div key={game.id}>
                  <hr />
                  <GameCard
                    gameId={game.id}
                    game={game}
                    isLink={true}
                    onClick={onClick}
                  />
                </div>
              );
            }
          })
        : null}
    </div>
  );

  const router = useRouter();
  const searchInput = (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();

          const formData = new FormData(e.currentTarget);
          if (formData.get("game-search-input")) {
            router.push(
              `/games/search?query=${encodeURIComponent(formData.get("game-search-input") as string)}`,
            );
          }
        }}
      >
        <div>
          <input
            type="text"
            ref={gameSearchInputRef}
            placeholder="🔍 Search for games..."
            name="game-search-input"
            className={styles.navbar_search_input}
            onChange={searchInputOnChange}
          />
          {searchInputResults}
          {/* <input  */}
          {/*   type="hidden" */}
          {/*   value={} */}
          {/* /> */}
        </div>
      </form>
    </>
  );

  return (
    <nav className={styles.navbar}>
      {brand}
      {searchInput}
      {accountMenu}
      {accountMenuDropdown}
      {signInDialog}
    </nav>
  );
};

export default Navbar;
