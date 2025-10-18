"use client";

import styles from "./button.module.scss";
import { ComponentProps } from "react";

const Button: React.FC<ComponentProps<"button">> = ({
  className,
  children,
  onClick,
  ...buttonProps
}) => {
  const wrapperClassName = `${styles.button_wrapper} ${className}`;
  const wrapperOnClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    onClick?.(e);
  };
  return (
    <button
      onClick={wrapperOnClick}
      className={wrapperClassName}
      {...buttonProps}
    >
      {children}
    </button>
  );
};

export default Button;
