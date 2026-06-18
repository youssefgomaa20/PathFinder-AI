import { useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils.js";

const focusRing =
  "transition-all duration-300 ease-in-out focus:outline-none focus:border-[#00d4ff] focus:ring-2 focus:ring-[#00d4ff]/35 focus:shadow-[0_0_12px_rgba(0,212,255,0.18)]";

const iconCls =
  "pointer-events-none absolute start-3 text-[#aaa] transition-colors duration-300 ease-in-out group-focus-within:text-[#00d4ff]";

type Surface = "profile" | "auth";

function surface(s: Surface, dark: boolean): string {
  if (s === "profile") {
    return dark
      ? "border-gray-600 bg-gray-800 text-white placeholder:text-gray-400"
      : "border-gray-300 bg-gray-100 text-black placeholder:text-gray-600";
  }
  return dark
    ? "border-gray-600 bg-gray-700 text-white placeholder:text-gray-400"
    : "border-gray-300 bg-white text-gray-900 placeholder:text-gray-500";
}

export function PasswordField({
  icon: Icon,
  darkMode,
  surface: surf = "auth",
  className,
  containerClassName,
  inputClassName,
  ...props
}: Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> & {
  icon: LucideIcon;
  darkMode: boolean;
  surface?: Surface;
  containerClassName?: string;
  inputClassName?: string;
}) {
  const [show, setShow] = useState(false);
  const type = show ? "text" : "password";

  const toggleLabel = useMemo(() => (show ? "Hide password" : "Show password"), [show]);

  return (
    <div className={cn("group relative w-full", containerClassName)}>
      <Icon className={cn(iconCls, "top-1/2 h-[1.05rem] w-[1.05rem] -translate-y-1/2")} aria-hidden />
      <input
        {...props}
        type={type}
        className={cn(
          "w-full rounded-lg border py-3 ps-11 pe-11",
          surface(surf, darkMode),
          focusRing,
          className,
          inputClassName
        )}
      />
      <button
        type="button"
        aria-label={toggleLabel}
        title={toggleLabel}
        onClick={() => setShow((v) => !v)}
        className="absolute end-3 top-1/2 -translate-y-1/2 text-[#aaa] transition-colors duration-300 ease-in-out hover:text-[#00d4ff] focus:outline-none"
      >
        {show ? <EyeOff className="h-5 w-5" aria-hidden /> : <Eye className="h-5 w-5" aria-hidden />}
      </button>
    </div>
  );
}

