// Project-wide ambient declarations to avoid implicit JSX/React type errors
// Temporary shim: if you install `@types/react` and `@types/react-dom` this
// file can be removed.

declare module 'react';
declare module 'react/jsx-runtime';

declare module '*.svg' {
  const src: string;
  export default src;
}

declare module '*.png' {
  const src: string;
  export default src;
}

declare module '*.jpg' {
  const src: string;
  export default src;
}

declare module '*.jpeg' {
  const src: string;
  export default src;
}

declare module '*.gif' {
  const src: string;
  export default src;
}

declare module '*.webp' {
  const src: string;
  export default src;
}

// Provide a very permissive JSX.IntrinsicElements so JSX elements do not error
// when no @types/react is available. This keeps the fast local dev loop
// working; for stricter typing, install @types/react.
declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}

export {};
