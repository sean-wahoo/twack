export const clickInRect = (rect: DOMRect, event: MouseEvent) =>
  rect.top <= event.clientY &&
  event.clientY <= rect.top + rect.height &&
  rect.left <= event.clientX &&
  event.clientX <= rect.left + rect.width;

export const slugify = (str: string, sep = "-") => {
  return (
    str
      .toLowerCase()
      .trim()
      .replace(/\\s+/g, sep)
      .replace(/[^\\w\\-]/g, "")
      .replace(/\\-\\-+/g, sep)
      .replace(/\\-$/g, "") +
    "_" +
    Math.random().toString(36).substring(7, 15)
  );
};

export function debounce<T extends unknown[], U>(
  callback: (...args: T) => PromiseLike<U> | U,
  wait: number,
) {
  let timer: ReturnType<typeof setTimeout> | undefined;

  return (...args: T): Promise<U> => {
    if (timer) clearTimeout(timer);
    return new Promise((resolve) => {
      timer = setTimeout(() => {
        resolve(callback(...args));
      }, wait);
    });
  };
}
