"use client";

import styles from "./button.module.scss";
import {
  ComponentProps,
  ComponentPropsWithRef,
  useEffect,
  useRef,
} from "react";

const Button: React.FC<ComponentPropsWithRef<"button">> = ({
  className,
  children,
  onClick,
  disabled,
  ...buttonProps
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const wrapperClassName = `${styles.button_wrapper} ${className}`;
  const wrapperOnClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    if (!disabled) {
      onClick?.(e);
    }
  };
  useEffect(() => {
    if (buttonRef.current) {
      buttonRef.current.disabled = !!disabled;
    }
  }, [disabled]);
  return (
    <button
      {...buttonProps}
      ref={buttonRef}
      onClick={wrapperOnClick}
      className={wrapperClassName}
    >
      {children}
    </button>
  );
};

export default Button;
