import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  HomeIcon,
  UserGroupIcon,
  BriefcaseIcon,
  ChatBubbleLeftRightIcon,
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";
import useUserStore from "../store/useUserStore";
import useToastStore from '../store/useToastStore';
import Avatar from "./Avatar";
import LogLogo from "./Logo";
export default function Navigation() {
  const { user, logout } = useUserStore();
  const { addToast } = useToastStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  const navigation = [
    { name: "Home", href: "/", icon: HomeIcon },
    { name: "Skills", href: "/skills", icon: BriefcaseIcon },
    { name: "Swap", href: "/swap", icon: UserGroupIcon }
  ];

  return (
    <nav className="bg-white dark:bg-secondary-900 border-b border-gray-200 dark:border-secondary-700">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/">
              <LogLogo size={60} />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    router.pathname === item.href
                      ? "text-blue-600 bg-blue-50 dark:text-primary-300 dark:bg-secondary-800"
                      : "text-gray-700 hover:text-blue-600 hover:bg-blue-50 dark:text-secondary-200 dark:hover:text-primary-300 dark:hover:bg-secondary-800"
                  }`}
                >
                  <item.icon className="w-5 h-5 mr-2" />
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Desktop User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <Link
                  href="/profile/edit"
                  className="flex items-center  group hover:bg-blue-50 rounded-lg px-2 py-1 transition-all duration-200"
                >
                  <Avatar src={user.avatar} name={user.name} size={32} />
                  <div className="text-sm hidden lg:block">
                    <p className="font-medium text-gray-900 group-hover:text-blue-600">
                      {user.name}
                    </p>
                    <p className="text-gray-500">{user.email}</p>
                  </div>
                </Link>
                <button
                  onClick={() => logout(addToast)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile: user buttons + menu icon */}
          <div className="md:hidden flex items-center gap-2">
            {user ? (
              <>
                <button
                  onClick={() => logout(addToast)}
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-200"
                  aria-label="Logout"
                  title="Logout"
                >
                  <ArrowRightOnRectangleIcon className="w-6 h-6" />
                </button>
                <Link href="/profile/edit" aria-label="Profile" title="Profile">
                  <UserCircleIcon className="w-7 h-7 text-blue-600 hover:text-blue-800 transition" />
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="px-3 py-1 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  className="px-3 py-1 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-lg shadow-sm transition-all duration-200"
                >
                  Get Started
                </Link>
              </>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="w-6 h-6" />
              ) : (
                <Bars3Icon className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-secondary-900 border-t border-gray-200 dark:border-secondary-700">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-3 py-2 text-base font-medium rounded-lg transition-all duration-200 ${
                  router.pathname === item.href
                    ? "text-blue-600 bg-blue-50 dark:text-primary-300 dark:bg-secondary-800"
                    : "text-gray-700 hover:text-blue-600 hover:bg-blue-50 dark:text-secondary-200 dark:hover:text-primary-300 dark:hover:bg-secondary-800"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
