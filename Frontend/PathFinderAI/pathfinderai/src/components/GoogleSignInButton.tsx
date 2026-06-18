import type { ButtonHTMLAttributes, ReactNode } from "react";
import { FcGoogle } from "react-icons/fc";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
};

/** Google-branded sign-in control (white surface, works on dark auth cards). */
export function GoogleSignInButton({
  children,
  className = "",
  ...props
}: Props) {
  return (
    <button
      type="button"
      className={`flex h-12 w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 text-sm font-medium text-[#333] shadow-sm transition-all duration-300 ease-out hover:bg-[#f5f5f5] hover:-translate-y-px hover:shadow-md active:translate-y-0 disabled:pointer-events-none disabled:opacity-55 disabled:hover:translate-y-0 ${className}`}
      {...props}
    >
      <FcGoogle className="h-5 w-5 shrink-0" aria-hidden />
      <span>{children}</span>
    </button>
  );
}