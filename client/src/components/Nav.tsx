import { NavLink } from "react-router-dom";

import { Brand } from "./Brand";
import { Icon, type IconName } from "./Icon";

const items: { to: string; label: string; icon: IconName; end?: boolean }[] = [
  { to: "/", label: "Home", icon: "home", end: true },
  { to: "/calendar", label: "Calendar", icon: "calendar" },
  { to: "/tasks", label: "Tasks", icon: "tasks" },
  { to: "/notes", label: "Notes", icon: "notes" },
];

const accountItem = {
  to: "/account",
  label: "Account",
  icon: "account" as const,
};

interface NavProps {
  mobile?: boolean;
}

function NavItem({
  item,
  mobile,
}: {
  item: { to: string; label: string; icon: IconName; end?: boolean };
  mobile: boolean;
}) {
  return (
    <NavLink
      to={item.to}
      end={item.end ?? false}
      className={({ isActive }) =>
        [
          "transition-colors",
          mobile
            ? "mx-0.5 my-1 flex min-w-0 flex-col items-center justify-center gap-0.5 rounded-md px-1 text-xs font-medium"
            : "flex items-center gap-3 rounded-md px-3.5 py-3 text-base",
          isActive
            ? mobile
              ? "bg-paper text-moss"
              : "bg-paper text-moss"
            : "text-ink-soft hover:text-ink",
        ].join(" ")
      }
    >
      <Icon name={item.icon} className="size-5" />
      <span className="truncate">{item.label}</span>
    </NavLink>
  );
}

export function Nav({ mobile = false }: NavProps) {
  const allItems = [...items, accountItem];

  return (
    <nav
      aria-label={mobile ? "Mobile navigation" : "Primary navigation"}
      className={
        mobile
          ? "grid h-16 grid-cols-5 border-t border-line bg-paper-deep px-1 pb-[env(safe-area-inset-bottom)] md:hidden"
          : "hidden w-64 shrink-0 flex-col border-r border-line bg-paper-deep p-5 md:flex"
      }
    >
      {!mobile && (
        <div className="mb-10 px-2">
          <Brand />
        </div>
      )}

      <div className={mobile ? "contents" : "flex flex-col gap-1"}>
        {(mobile ? allItems : items).map((item) => (
          <NavItem key={item.to} item={item} mobile={mobile} />
        ))}
      </div>

      {!mobile && (
        <div className="mt-auto">
          <NavItem item={accountItem} mobile={false} />
        </div>
      )}
    </nav>
  );
}
