"use client";
import { c } from "@/lib/utils";
import styles from "./carousel.module.scss";
import { KeyboardEventHandler, useRef } from "react";
import { useRouter } from "next/navigation";
import { ComponentType } from "react";

type CarouselType = Partial<ComponentType<"ul">> & {
  children: React.ReactNode;
  type?: "flex" | "grid";
  forceHideButtons?: boolean;
  className?: string;
  itemSubmitFunc?: KeyboardEventHandler<HTMLUListElement>;
};
const Carousel = ({
  children,
  forceHideButtons = false,
  type = "flex",
  className = "",
  itemSubmitFunc = () => {},
  ...props
}: CarouselType) => {
  const carouselRef = useRef<HTMLUListElement>(null);
  const router = useRouter();

  const onFocusedItemKeydown: KeyboardEventHandler<HTMLUListElement> = (e) => {
    if (e.key === "Enter") {
      const { target } = e;
      if ("dataset" in target && "gameId") {
        const dataset = target.dataset as DOMStringMap;
        router.push(`/games/${dataset["gameId"]}`);
      }
      itemSubmitFunc?.(e);
    }
  };
  return (
    <ul
      {...props}
      className={c(styles.carousel, styles[type], className)}
      ref={carouselRef}
      onKeyDown={onFocusedItemKeydown}
    >
      {children}
    </ul>
  );
};

export default Carousel;
