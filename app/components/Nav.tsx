"use client";
import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, User, Package, LayoutDashboard, Heart } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { toast } from "react-toastify";

const Nav = () => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const router = useRouter();

  if (pathname === "/") return null;
  if (pathname === "/register") return null;

  const handleLogout = async () => {
    toast.info("Logging out...");
    // รอ 3 วินาที (3000 มิลลิวินาที) ก่อน signOut
    setTimeout(async () => {
      await signOut({ redirect: true, callbackUrl: "/" });
    }, 1500);
    toast.success("Logged out successfully", { autoClose: 3000 });
  };

  const navItems = [
    { href: "/order-list", label: "Product List", icon: <Package size={20} /> },
    { href: "/myprofile", label: "My Profile", icon: <User size={20} /> },
    { href: "/donate", label: "Donate", icon: <Heart size={20} className="text-red-500" /> },
  ];

  if (session?.user?.role === "admin") {
    navItems.unshift({
      href: "/admin",
      label: "Dashboard",
      icon: <LayoutDashboard size={20} />,
    });
  }

  return (
    <nav className="bg-white shadow-md py-4 px-6 sticky top-0 z-50">
      <ul className="flex gap-6 items-center justify-center">
        {navItems.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all
                ${pathname === item.href ? "bg-blue-500 text-white" : "hover:bg-gray-100 text-gray-700"}
              `}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </Link>
          </li>
        ))}

        <li>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all hover:bg-red-500 hover:text-white text-gray-700"
          >
            <LogOut size={20} />
            <span className="font-medium">Log out</span>
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Nav;
