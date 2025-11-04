"use client";

import styles from "./dialog.module.scss";
import { clickInRect } from "@/lib/utils";
import { ComponentProps } from "react";

const Dialog: React.FC<ComponentProps<"dialog">> = ({
  onClick,
  children,
  className,
  ...dialogProps
}) => {
  const wrapperOnClick: React.MouseEventHandler<HTMLDialogElement> = (e) => {
    onClick?.(e);
    const rect = e.currentTarget.getBoundingClientRect();
    if (!clickInRect(rect, e as any)) {
      e.currentTarget.close();
    }
  };
  const wrapperClassName = `${styles.dialog_wrapper} ${className}`;

  return (
    <dialog
      className={wrapperClassName}
      data-wrapper-dialog
      onClick={wrapperOnClick}
      {...dialogProps}
    >
      {children}
    </dialog>
  );
};

export default Dialog;
