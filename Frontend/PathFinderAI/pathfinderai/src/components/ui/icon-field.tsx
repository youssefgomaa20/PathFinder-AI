import type { LucideIcon } from "lucide-react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils.js";

const focusRing =
  "transition-all duration-300 ease-in-out focus:outline-none focus:border-[#00d4ff] focus:ring-2 focus:ring-[#00d4ff]/35 focus:shadow-[0_0_12px_rgba(0,212,255,0.18)]";

const iconCls =
  "pointer-events-none absolute start-3 text-[#aaa] transition-colors duration-300 ease-in-out group-focus-within:text-[#00d4ff]";

export type IconFieldSurface = "profile" | "auth";

function surface(s: IconFieldSurface, dark: boolean): string {
  if (s === "profile") {
    return dark ? "border-gray-600 bg-gray-800 text-white placeholder:text-gray-400" : "border-gray-300 bg-gray-100 text-black placeholder:text-gray-600";
  }
  return dark ? "border-gray-600 bg-gray-700 text-white placeholder:text-gray-400" : "border-gray-300 bg-white text-gray-900 placeholder:text-gray-500";
}

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export function IconInput({
  icon: Icon,
  surface: surf = "profile",
  darkMode,
  className,
  containerClassName,
  ...props
}: InputProps & {
  icon: LucideIcon;
  surface?: IconFieldSurface;
  darkMode: boolean;
  containerClassName?: string;
}) {
  const disabled = props.disabled;
  return (
    <div className={cn("group relative w-full", disabled && "opacity-90", containerClassName)}>
      <Icon
        className={cn(iconCls, "top-1/2 h-[1.05rem] w-[1.05rem] -translate-y-1/2", disabled && "text-[#888]")}
        aria-hidden
      />
      <input
        {...props}
        className={cn(
          "w-full rounded-lg border py-3 ps-11 pe-3",
          surface(surf, darkMode),
          !disabled && focusRing,
          props.readOnly && "cursor-default",
          className
        )}
      />
    </div>
  );
}

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export function IconTextarea({
  icon: Icon,
  surface: surf = "profile",
  darkMode,
  className,
  containerClassName,
  ...props
}: TextareaProps & {
  icon: LucideIcon;
  surface?: IconFieldSurface;
  darkMode: boolean;
  containerClassName?: string;
}) {
  return (
    <div className={cn("group relative w-full", containerClassName)}>
      <Icon className={cn(iconCls, "top-3.5 h-[1.05rem] w-[1.05rem]")} aria-hidden />
      <textarea
        {...props}
        className={cn(
          "w-full min-h-[88px] rounded-lg border py-3 ps-11 pe-3",
          surface(surf, darkMode),
          focusRing,
          className
        )}
      />
    </div>
  );
}

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

export function IconSelect({
  icon: Icon,
  surface: surf = "profile",
  darkMode,
  className,
  containerClassName,
  children,
  ...props
}: SelectProps & {
  icon: LucideIcon;
  surface?: IconFieldSurface;
  darkMode: boolean;
  containerClassName?: string;
}) {
  return (
    <div className={cn("group relative w-full", containerClassName)}>
      <Icon className={cn(iconCls, "top-1/2 h-[1.05rem] w-[1.05rem] -translate-y-1/2 z-[1]")} aria-hidden />
      <select
        {...props}
        className={cn(
          "w-full appearance-none rounded-lg border py-3 ps-11 pe-10",
          surface(surf, darkMode),
          focusRing,
          className
        )}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute end-3 top-1/2 z-[1] h-4 w-4 -translate-y-1/2 text-[#aaa]" aria-hidden />
    </div>
  );
}
