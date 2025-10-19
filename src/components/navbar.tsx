"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import styles from "./navbar.module.scss";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { clickInRect } from "@/lib/utils";

import Link from "next/link";
import Dialog from "./dialog";
import Button from "./button";

const Navbar: React.FC = () => {
  const accountMenuRef = useRef<HTMLDialogElement>(null);
  const accountDropdownRef = useRef<HTMLUListElement>(null);

  const [dropdownShown, setDropdownShown] = useState<boolean>(false);

  const { data: session, status } = useSession();
  console.log({ session });
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
          href={`/${session?.user?.slug}/log`}
        >
          Your gaming log
        </Link>
      </li>
      <li onClick={() => signOut()} className={styles.logout_button}>
        Logout
      </li>
    </ul>
  );

  const brand = (
    <Link href="/" className={styles.brand}>
      <h3>T</h3>
      <h3>W</h3>
      <h3>A</h3>
      <h3>C</h3>
      <h3>K</h3>
    </Link>
  );

  const chevronDown = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="size-6"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m19.5 8.25-7.5 7.5-7.5-7.5"
      />
    </svg>
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
    <Dialog
      onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        if (!clickInRect(rect, e as any)) {
          e.currentTarget.close();
        }
      }}
      ref={accountMenuRef}
      className={styles.sign_in_dialog}
    >
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
            setDropdownShown(false);
          }
        }
      }
    };
    document.addEventListener("click", clickOutsideDropdownCheck);
    return () =>
      document.removeEventListener("click", clickOutsideDropdownCheck);
  }, [dropdownShown]);

  const searchInput = (
    <form>
      <input
        type="text"
        placeholder="🔍 Search for games..."
        className={styles.search_input}
      />
    </form>
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
