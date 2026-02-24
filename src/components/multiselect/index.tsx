"use client";

import styles from "./multiselect.module.scss";
import {
  ChangeEventHandler,
  ComponentProps,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const MultiSelect: React.FC<
  ComponentProps<"select"> & {
    options?: { value: string; text: string; checked?: boolean }[];
  }
> = ({
  children,
  className,
  options,
  defaultValue: _defaultValue,
  onChange,
  ...props
}) => {
  const [selectValue, setSelectValue] = useState<string[]>(
    (_defaultValue as string[]) ?? [],
  );
  const selectRef = useRef<HTMLSelectElement>(null);

  const wrapperClassName = `${styles.multiselect} ${className}`;

  const wrapperOnChange: ChangeEventHandler<HTMLSelectElement> = (e) => {
    onChange?.(e);

    setSelectValue(
      Array.from(e.currentTarget.selectedOptions).map((o) => o.value),
    );
  };

  return (
    <select
      multiple
      onChange={wrapperOnChange}
      value={selectValue}
      className={wrapperClassName}
      ref={selectRef}
      {...props}
    >
      {children}
    </select>
  );
};

export default MultiSelect;
