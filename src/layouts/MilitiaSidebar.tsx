import { useCallback } from "react";
import { Link, useLocation } from "react-router";

import {
  GridIcon,
  HorizontaLDots,
  MailIcon,
  TaskIcon,
} from "../icons";
import { useSidebar } from "../context/SidebarContext";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path: string;
};

const navItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Tổng quan",
    path: "/militia",
  },
  {
    icon: <TaskIcon />,
    name: "Ca được phân công",
    path: "/militia/assignments",
  },
  {
    icon: <MailIcon />,
    name: "Đơn nghỉ phép",
    path: "/militia/leave-requests",
  },
];

const MilitiaSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();

  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname],
  );

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${
          isExpanded || isMobileOpen
            ? "w-72.5"
            : isHovered
            ? "w-72.5"
            : "w-22.5"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link to="/militia">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <img
                className="dark:hidden"
                src="/images/logo/logo.svg"
                alt="Logo"
                width={150}
                height={40}
              />
              <img
                className="hidden dark:block"
                src="/images/logo/logo-dark.svg"
                alt="Logo"
                width={150}
                height={40}
              />
            </>
          ) : (
            <img
              src="/images/logo/logo-icon.svg"
              alt="Logo"
              width={32}
              height={32}
            />
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-5 text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Khu vực dân quân"
                ) : (
                  <HorizontaLDots className="size-6" />
                )}
              </h2>
              <ul className="flex flex-col gap-4">
                {navItems.map((nav) => (
                  <li key={nav.path}>
                    <Link
                      to={nav.path}
                      className={`menu-item group ${
                        isActive(nav.path)
                          ? "menu-item-active"
                          : "menu-item-inactive"
                      }`}
                    >
                      <span
                        className={`menu-item-icon-size ${
                          isActive(nav.path)
                            ? "menu-item-icon-active"
                            : "menu-item-icon-inactive"
                        }`}
                      >
                        {nav.icon}
                      </span>
                      {(isExpanded || isHovered || isMobileOpen) && (
                        <span className="menu-item-text">{nav.name}</span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default MilitiaSidebar;