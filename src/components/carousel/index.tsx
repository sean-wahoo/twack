"use client";
import { isOverflowing } from "@/lib/utils";
import styles from "./carousel.module.scss";
import { useEffect, useRef, useState } from "react";
const Carousel = ({
  children,
  anchor,
  forceHideButtons = false,
}: {
  children: React.ReactNode;
  anchor: string;
  forceHideButtons?: boolean;
}) => {
  const [showButtons, shouldShowButtons] = useState<boolean>(false);
  const carouselRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    console.log("um?");
    function onResizeListener() {
      if (carouselRef.current?.children.length) {
        if (isOverflowing(carouselRef.current)) {
          shouldShowButtons(true);
        } else {
          shouldShowButtons(false);
        }
      }
    }

    onResizeListener();

    window.addEventListener("resize", onResizeListener);
    return () => window.removeEventListener("resize", onResizeListener);
  }, []);
  return (
    <ul
      data-anchor={"--" + anchor}
      className={[
        styles.carousel,
        forceHideButtons ? null : showButtons ? styles.show_buttons : null,
      ].join(" ")}
      ref={carouselRef}
    >
      {children}
    </ul>
  );
};

export default Carousel;
