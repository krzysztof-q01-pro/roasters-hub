import type { SVGProps } from "react";

export function CoffeeBean(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M15.5 3c-2 0-3.8 1.4-5 3.5C9 8.9 8 11.4 8 14c0 4 2.2 7 5.5 7s5.5-3.2 5.5-7.2c0-2.5 1-5 2.5-7.4-1.2-2.1-3-3.4-6-3.4Z"
        fill="currentColor"
        transform="rotate(-20 12 12)"
      />
      <path
        d="M14.5 6c-1.3 1.5-2 3.5-2 6s.7 4.5 2 6"
        stroke="var(--bean-stroke, #fff)"
        strokeWidth="1.4"
        strokeLinecap="round"
        fill="none"
        transform="rotate(-20 12 12)"
      />
    </svg>
  );
}
