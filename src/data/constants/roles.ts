import { LayoutDashboard, Users, Car, Store, UserRound, Route, Truck, Package, Wallet, BarChart3, Star, LifeBuoy, Settings,
  Send, CalendarCheck, MapPin, MessageSquare, Bell, HelpCircle, UserCog, Boxes, ClipboardList, Tag, LineChart, Search, ShoppingBag, FileCheck2, type LucideIcon } from "lucide-react";

export type Role = "ADMIN" | "CUSTOMER" | "DRIVER" | "VENDOR";
export type NavItem = { label: string; href: string; icon: LucideIcon };

export const ROLE_HOME: Record<Role, string> = {
  ADMIN: "/admin/dashboard", CUSTOMER: "/customer/dashboard", DRIVER: "/driver/dashboard", VENDOR: "/vendor/dashboard",
};
export const ROLE_LABEL: Record<Role, string> = { ADMIN: "Administrator", CUSTOMER: "Customer", DRIVER: "Driver Portal", VENDOR: "Vendor Portal" };

export const NAV: Record<Role, NavItem[]> = {
  ADMIN: [
    { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { label: "User Management", href: "/admin/users", icon: Users },
    { label: "Drivers", href: "/admin/drivers", icon: Car },
    { label: "Vendors & Suppliers", href: "/admin/vendors", icon: Store },
    { label: "Customers", href: "/admin/customers", icon: UserRound },
    { label: "Trips & Bookings", href: "/admin/trips-bookings", icon: Route },
    { label: "Fleet Management", href: "/admin/fleet-management", icon: Truck },
    { label: "Load Management", href: "/admin/load-management", icon: Package },
    { label: "Payments & Wallets", href: "/admin/payments-wallet", icon: Wallet },
    { label: "Reports & Analysis", href: "/admin/reports-analytics", icon: BarChart3 },
    { label: "Reviews & Ratings", href: "/admin/reviews-ratings", icon: Star },
    { label: "Messages", href: "/messages", icon: MessageSquare },
    { label: "Support Center", href: "/admin/support-center", icon: LifeBuoy },
    { label: "System Settings", href: "/admin/settings", icon: Settings },
  ],
  CUSTOMER: [
    { label: "Dashboard", href: "/customer/dashboard", icon: LayoutDashboard },
    { label: "Find Transport", href: "/customer/find-transport/passengers", icon: Search },
    { label: "Marketplace", href: "/customer/marketplace", icon: ShoppingBag },
    { label: "My Shipments", href: "/customer/shipments", icon: Send },
    { label: "My Bookings", href: "/customer/bookings", icon: CalendarCheck },
    { label: "Track Orders", href: "/customer/deliveries", icon: MapPin },
    { label: "Payments & Wallet", href: "/customer/wallet", icon: Wallet },
    { label: "Messages", href: "/messages", icon: MessageSquare },
    { label: "Notifications", href: "/notifications", icon: Bell },
    { label: "Reviews & Ratings", href: "/customer/reviews", icon: Star },
    { label: "Support Center", href: "/customer/support-center", icon: LifeBuoy },
    { label: "Help & FAQs", href: "/customer/help-faqs", icon: HelpCircle },
    { label: "Profile Settings", href: "/profile/settings", icon: UserCog },
  ],
  DRIVER: [
    { label: "Dashboard", href: "/driver/dashboard", icon: LayoutDashboard },
    { label: "My Trips", href: "/driver/trips", icon: Route },
    { label: "Available Loads", href: "/driver/available-loads", icon: Package },
    { label: "My Vehicles", href: "/driver/my-vehicles", icon: Truck },
    { label: "Documents", href: "/driver/documents", icon: FileCheck2 },
    { label: "My Bookings", href: "/driver/my-bookings", icon: CalendarCheck },
    { label: "Earnings & Wallet", href: "/driver/earnings-wallet", icon: Wallet },
    { label: "Messages", href: "/messages", icon: MessageSquare },
    { label: "Notifications", href: "/notifications", icon: Bell },
    { label: "Reviews & Ratings", href: "/driver/reviews-ratings", icon: Star },
    { label: "Support Center", href: "/driver/support-center", icon: LifeBuoy },
    { label: "Settings", href: "/driver/settings", icon: Settings },
  ],
  VENDOR: [
    { label: "Dashboard", href: "/vendor/dashboard", icon: LayoutDashboard },
    { label: "New Request", href: "/vendor/new-request", icon: ClipboardList },
    { label: "My Offers", href: "/vendor/my-offers", icon: Tag },
    { label: "My Orders", href: "/vendor/my-orders", icon: Package },
    { label: "Inventory", href: "/vendor/inventory", icon: Boxes },
    { label: "Analysis", href: "/vendor/analysis", icon: LineChart },
    { label: "Messages", href: "/messages", icon: MessageSquare },
    { label: "Notifications", href: "/notifications", icon: Bell },
    { label: "Documents", href: "/vendor/documents", icon: FileCheck2 },
    { label: "Reviews & Ratings", href: "/vendor/reviews-ratings", icon: Star },
    { label: "Profile Settings", href: "/vendor/profile-settings", icon: UserCog },
    { label: "Support Center", href: "/vendor/support-center", icon: LifeBuoy },
  ],
};
