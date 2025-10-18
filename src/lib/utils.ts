export const clickInRect = (rect: DOMRect, event: MouseEvent) =>
  rect.top <= event.clientY &&
  event.clientY <= rect.top + rect.height &&
  rect.left <= event.clientX &&
  event.clientX <= rect.left + rect.width;

// export const debounce = <F extends (...args: Parameters<F>) => ReturnType<F>>(
//   func: F,
//   waitFor: number,
// ) => {
//   let timeout: NodeJS.Timeout;
//   const debounced = (...args: Parameters<F>) => {
//     console.log("inside debounced");
//     clearTimeout(timeout);
//     timeout = setTimeout(() => func(...args), waitFor);
//   };
//   console.log("gonna return");
//   return debounced;
// };

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
