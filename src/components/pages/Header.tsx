"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, Loader2, ChevronDown } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { userApi } from "@/lib/api";

export default function Header() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [userStatus, setUserStatus] = useState<string | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const [isAdminDropdownOpen, setIsAdminDropdownOpen] = useState(false);
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
    const [isServicesDropdownOpen, setIsServicesDropdownOpen] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    const inventoryPage = pathname === "/inventory";
    const offerenquiryPage = pathname === "/offer-enquiry";
    const memberPage = pathname === "/member";
    const dashboardPage = pathname === "/dashboard";
    const Homepage = pathname === "/";
    const CartPage = pathname === "/cart";
    const BlogsPage = pathname === "/blogs";
    const BlogDetailPage = pathname.startsWith("/blogs/");
    const SecurePage = pathname === "/secure-to-source";
    const diamondsourcePage = pathname === "/diamond-source";
    const customerPage = pathname === "/customer-management";
    const enquiryPage = pathname === "/enquiry";
    const limitedEditionPage = pathname === "/limitedEdition";
    const createAdminPage = pathname === "/create-admin";
    const buyFormPage = pathname === "/buy-form";
    const holdstonePage = pathname === "/holdstone";

    // Function to check if token has expired
    const isTokenExpired = (): boolean => {
        if (typeof window === "undefined") return false;

        const tokenTimestamp = localStorage.getItem("authTokenTimestamp");
        if (!tokenTimestamp) {
            // If no timestamp exists, set it now for existing sessions
            // This handles users who were logged in before this feature was added
            localStorage.setItem("authTokenTimestamp", Date.now().toString());
            return false;
        }

        const tokenAge = Date.now() - parseInt(tokenTimestamp, 10);
        const ONE_DAY_MS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

        return tokenAge >= ONE_DAY_MS;
    };

    // Determine if user is admin or super admin
    const isAdmin =
        isLoggedIn && (userRole === "ADMIN" || userRole === "SUPER_ADMIN");

    // Check if inventory is accessible (Admin or APPROVED status)
    const isInventoryAccessible =
        isLoggedIn &&
        (userRole === "ADMIN" ||
            userRole === "SUPER_ADMIN" ||
            userStatus === "APPROVED");

    // Check user authentication and role on mount and when pathname changes
    useEffect(() => {
        const checkUserAuth = () => {
            if (typeof window !== "undefined") {
                setIsCheckingAuth(true);

                let token = localStorage.getItem("authToken");
                let userStr = localStorage.getItem("user");

                if (!userStr || !token) {
                    console.log("Checking cookies...");
                    const cookies = document.cookie.split(";");

                    const tokenCookie = cookies.find((c) =>
                        c.trim().startsWith("authToken=")
                    );
                    if (tokenCookie) {
                        token = tokenCookie.split("=")[1].trim();
                        console.log("Found token in cookie");
                    }

                    const userCookie = cookies.find((c) =>
                        c.trim().startsWith("user=")
                    );
                    if (userCookie) {
                        try {
                            userStr = decodeURIComponent(
                                userCookie.split("=")[1].trim()
                            );
                            console.log("Found user in cookie");
                        } catch (e) {
                            console.error("Error decoding user cookie:", e);
                        }
                    }
                }

                const hasValidAuth = !!(userStr && token);

                // Check if token has expired
                if (hasValidAuth && isTokenExpired()) {
                    console.log("Token has expired. Logging out user...");
                    // Clear auth data
                    localStorage.removeItem("authToken");
                    localStorage.removeItem("authTokenTimestamp");
                    localStorage.removeItem("user");
                    document.cookie =
                        "authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
                    document.cookie =
                        "user=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";

                    setUserRole(null);
                    setUserStatus(null);
                    setIsLoggedIn(false);
                    setIsCheckingAuth(false);

                    // Dispatch logout event
                    const logoutEvent = new CustomEvent("user-logged-out");
                    window.dispatchEvent(logoutEvent);

                    // Only redirect to login if not on homepage or public pages
                    const publicPages = [
                        "/",
                        "/aboutUs",
                        "/diamondKnowledge",
                        "/blogs",
                        "/contact",
                        "/secure-to-source",
                        "/diamond-source",
                        "/sud",
                    ];
                    const isPublicPage = publicPages.some(
                        (page) =>
                            pathname === page || pathname.startsWith("/blogs/")
                    );

                    if (!isPublicPage) {
                        router.push("/login");
                    }
                    return;
                }

                if (hasValidAuth && userStr) {
                    try {
                        const user = JSON.parse(userStr);
                        setUserRole(user.role || null);
                        setUserStatus(user.status || null);
                        setIsLoggedIn(true);
                        console.log("User role:", user.role);
                        console.log("User status:", user.status);
                    } catch {
                        setUserRole(null);
                        setUserStatus(null);
                        setIsLoggedIn(false);
                    }
                } else {
                    setUserRole(null);
                    setUserStatus(null);
                    setIsLoggedIn(false);
                }

                setIsCheckingAuth(false);
                console.log("=== END HEADER AUTH CHECK ===");
                console.log("Final auth state - isLoggedIn:", hasValidAuth);
            }
        };

        checkUserAuth();

        const handleAuthEvent = (event: Event) => {
            console.log("Auth event received:", event.type);
            setTimeout(checkUserAuth, 100);
        };

        if (typeof window !== "undefined") {
            window.addEventListener("storage", handleAuthEvent);
            window.addEventListener("user-logged-in", handleAuthEvent);
            window.addEventListener("user-logged-out", handleAuthEvent);

            return () => {
                window.removeEventListener("storage", handleAuthEvent);
                window.removeEventListener("user-logged-in", handleAuthEvent);
                window.removeEventListener("user-logged-out", handleAuthEvent);
            };
        }
    }, [pathname, router]);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024 && isMobileMenuOpen) {
                setIsMobileMenuOpen(false);
            }
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [isMobileMenuOpen]);

    useEffect(() => {
        document.body.style.overflow = isMobileMenuOpen ? "hidden" : "unset";
    }, [isMobileMenuOpen]);

    const handleLogout = async () => {
        try {
            console.log("Logout initiated...");
            await userApi.logout();
        } catch {
        } finally {
            setIsLoggedIn(false);
            setUserRole(null);
            setUserStatus(null);

            if (typeof window !== "undefined") {
                localStorage.removeItem("authToken");
                localStorage.removeItem("authTokenTimestamp");
                localStorage.removeItem("user");

                document.cookie =
                    "authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
                document.cookie =
                    "user=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";

                console.log("Logout complete - storage cleared");
            }

            if (typeof window !== "undefined") {
                const logoutEvent = new CustomEvent("user-logged-out");
                window.dispatchEvent(logoutEvent);
            }

            router.push("/");
        }
    };

    const handleInventoryClick = (e: React.MouseEvent) => {
        // Dispatch event to close any open diamond detail modal
        if (typeof window !== "undefined") {
            const closeModalEvent = new CustomEvent("close-diamond-modal");
            window.dispatchEvent(closeModalEvent);
        }

        if (!isLoggedIn) {
            e.preventDefault();
            router.push("/login");
        } else if (
            userRole !== "ADMIN" &&
            userRole !== "SUPER_ADMIN" &&
            userStatus !== "APPROVED"
        ) {
            e.preventDefault();
            alert(
                "Your account is pending approval. Please wait for admin verification to access the inventory."
            );
        }
    };

    let navigationItems: {
        href: string;
        label: string;
        requiresAuth?: boolean;
    }[] = [];

    if (!isLoggedIn) {
        navigationItems = [
            { href: "/aboutUs", label: "About us" },
            { href: "/diamondKnowledge", label: "Diamond Knowledge" },
            { href: "/blogs", label: "Blogs" },
        ];
    } else if (isAdmin) {
        navigationItems = [
            { href: "/aboutUs", label: "About us" },
            { href: "/diamondKnowledge", label: "Diamond Knowledge" },
            { href: "/blogs", label: "Blogs" },
        ];
    } else {
        navigationItems = [
            { href: "/aboutUs", label: "About us" },
            { href: "/diamondKnowledge", label: "Diamond Knowledge" },
            { href: "/blogs", label: "Blogs" },
        ];
    }

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                isScrolled ||
                inventoryPage ||
                offerenquiryPage ||
                memberPage ||
                dashboardPage ||
                Homepage ||
                BlogsPage ||
                BlogDetailPage ||
                SecurePage ||
                diamondsourcePage ||
                customerPage ||
                enquiryPage ||
                limitedEditionPage ||
                createAdminPage ||
                buyFormPage ||
                holdstonePage ||
                CartPage
                    ? "bg-[#050c3a] shadow-lg "
                    : "bg-transparent py-2.5 md:py-3"
            }`}
        >
            <div>
                <div
                    className="flex max-w-[1600px] mx-auto px-4 md:px-6 lg:px-8 items-center justify-between relative h-20"
                    style={{
                        minWidth: 900,
                        flexWrap: "nowrap",
                        overflow: "visible",
                    }}
                >
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="lg:hidden text-white p-2 hover:text-[#c89e3a] transition-colors"
                        aria-label="Toggle menu"
                    >
                        {isMobileMenuOpen ? (
                            <X size={24} />
                        ) : (
                            <Menu size={24} />
                        )}
                    </button>

                    <nav className="hidden lg:flex items-center gap-1 xl:gap-2 flex-1 justify-start">
                        {/* About us */}
                        <Link
                            href="/aboutUs"
                            className="py-3 px-1.5 xl:px-2.5 text-xs xl:text-base text-white hover:text-[#c89e3a] transition-colors whitespace-nowrap"
                        >
                            About us
                        </Link>

                        {/* Our Services Dropdown */}
                        <div className="relative group">
                            <button
                                onMouseEnter={() =>
                                    setIsServicesDropdownOpen(true)
                                }
                                onMouseLeave={() =>
                                    setIsServicesDropdownOpen(false)
                                }
                                className="py-3 px-1.5 cursor-pointer xl:px-2.5 text-xs xl:text-base text-white hover:text-[#c89e3a] transition-colors whitespace-nowrap flex items-center gap-1"
                            >
                                Our Services
                                <ChevronDown
                                    size={16}
                                    className={`transition-transform duration-200 ${isServicesDropdownOpen ? "rotate-180" : ""}`}
                                />
                            </button>

                            {isServicesDropdownOpen && (
                                <div
                                    onMouseEnter={() =>
                                        setIsServicesDropdownOpen(true)
                                    }
                                    onMouseLeave={() =>
                                        setIsServicesDropdownOpen(false)
                                    }
                                    className="absolute left-0 top-full mt-0 w-64 bg-white shadow-lg border border-gray-200 rounded-sm z-50"
                                >
                                    <Link
                                        href="/secure-to-source"
                                        className="block px-4 py-3 text-sm text-gray-700 hover:bg-[#c89e3a] hover:text-white transition-colors border-b border-gray-100"
                                    >
                                        S2S - Secure To Source
                                    </Link>
                                    <Link
                                        href="/diamond-source"
                                        className="block px-4 py-3 text-sm text-gray-700 hover:bg-[#c89e3a] hover:text-white transition-colors border-b border-gray-100"
                                    >
                                        DS4U - Diamond Source For You
                                    </Link>
                                    <Link
                                        href="/sud"
                                        className="block px-4 py-3 text-sm text-gray-700 hover:bg-[#c89e3a] hover:text-white transition-colors"
                                    >
                                        SYD - Sell Your Diamonds
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Diamond Knowledge and Blogs */}
                        {navigationItems.slice(1).map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={
                                    item.requiresAuth
                                        ? handleInventoryClick
                                        : undefined
                                }
                                className="py-3 px-1.5 xl:px-2.5 text-xs xl:text-base text-white hover:text-[#c89e3a] transition-colors whitespace-nowrap"
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    <div
                        className="flex-shrink-0 relative h-24 w-[280px] sm:h-28 sm:w-[320px] md:h-32 md:w-[360px]"
                        style={{ minWidth: 180, maxWidth: 400 }}
                    >
                        <button
                            onClick={() => router.push("/")}
                            className="block w-full h-full focus:outline-none"
                            aria-label="Go to home page"
                        >
                            <Image
                                src="/dalila_img/Dalila_Logo.png"
                                alt="Dalila Diamonds"
                                fill
                                style={{ objectFit: "contain" }}
                                priority
                            />
                        </button>
                    </div>

                    <div className="hidden lg:flex items-center justify-end gap-2 xl:gap-3 flex-1">
                        {/* Contact Us Button - Always visible */}
                        <button
                            onClick={() => router.push("/contact")}
                            className="py-3 px-3 xl:px-4 xl:py-2.5 xl:h-10 text-xs xl:text-sm text-white border border-[#c89e3a] hover:bg-[#c89e3a] hover:text-white transition-colors whitespace-nowrap cursor-pointer"
                        >
                            CONTACT US
                        </button>

                        {isCheckingAuth ? (
                            <div className="py-1 px-3 flex items-center justify-center">
                                <Loader2 className="w-5 h-5 text-[#FAF6EB]] animate-spin" />
                            </div>
                        ) : !isLoggedIn ? (
                            <>
                                <button
                                    onClick={() => router.push("/login")}
                                    className="py-3 px-3 xl:px-4 xl:py-2.5 xl:h-10 text-xs xl:text-sm text-white border border-[#c89e3a] hover:bg-[#c89e3a] hover:text-white transition-colors whitespace-nowrap cursor-pointer"
                                >
                                    LOGIN
                                </button>
                                <button
                                    onClick={() => router.push("/register")}
                                    className="py-3 px-3 xl:px-4 xl:py-2.5 xl:h-10 text-xs xl:text-sm text-white border border-[#c89e3a] hover:bg-[#c89e3a] hover:text-white transition-colors whitespace-nowrap cursor-pointer"
                                >
                                    REGISTER
                                </button>
                            </>
                        ) : (
                            <div className="flex gap-3">
                                {/* USER PANEL - Available only for regular users, NOT for admin */}
                                {!isAdmin && (
                                    <div className="relative group">
                                        <button
                                            onMouseEnter={() =>
                                                setIsUserDropdownOpen(true)
                                            }
                                            onMouseLeave={() =>
                                                setIsUserDropdownOpen(false)
                                            }
                                            className="py-3 px-3 xl:px-4 xl:py-2.5 xl:h-10 text-xs xl:text-sm text-white border border-[#c89e3a] hover:bg-[#c89e3a] hover:text-white transition-colors whitespace-nowrap flex items-center justify-center gap-1"
                                        >
                                            USER PANEL
                                            <ChevronDown
                                                size={16}
                                                className={`transition-transform duration-200 ${isUserDropdownOpen ? "rotate-180" : ""}`}
                                            />
                                        </button>

                                        {isUserDropdownOpen && (
                                            <div
                                                onMouseEnter={() =>
                                                    setIsUserDropdownOpen(true)
                                                }
                                                onMouseLeave={() =>
                                                    setIsUserDropdownOpen(false)
                                                }
                                                className="absolute top-full left-0 mt-0 w-64 bg-white shadow-lg border border-gray-200 rounded-sm z-50"
                                            >
                                                <Link
                                                    href="/dashboard"
                                                    className="block px-4 py-3 text-sm text-gray-700 hover:bg-[#c89e3a] hover:text-white transition-colors border-b border-gray-100"
                                                >
                                                    Dashboard
                                                </Link>
                                                <Link
                                                    href="/enquiry"
                                                    className="block px-4 py-3 text-sm text-gray-700 hover:bg-[#c89e3a] hover:text-white transition-colors"
                                                >
                                                    Enquiry
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* INVENTORY - Available for Admin or APPROVED users */}
                                <button
                                    onClick={(e) => {
                                        // Close any open diamond detail modal
                                        if (typeof window !== "undefined") {
                                            const closeModalEvent =
                                                new CustomEvent(
                                                    "close-diamond-modal"
                                                );
                                            window.dispatchEvent(
                                                closeModalEvent
                                            );
                                        }

                                        if (isInventoryAccessible) {
                                            router.push("/inventory");
                                        } else {
                                            e.preventDefault();
                                            alert(
                                                "Your account is pending approval. Please wait for admin verification to access the inventory."
                                            );
                                        }
                                    }}
                                    disabled={!isInventoryAccessible}
                                    className={`py-3 px-3 xl:px-4 xl:py-2.5 xl:h-10 text-xs xl:text-sm border border-[#c89e3a] transition-colors whitespace-nowrap ${
                                        isInventoryAccessible
                                            ? "text-white hover:bg-[#c89e3a] hover:text-white cursor-pointer"
                                            : "text-gray-400 bg-gray-700 cursor-not-allowed opacity-60"
                                    }`}
                                    title={
                                        !isInventoryAccessible
                                            ? "Your account is pending approval"
                                            : ""
                                    }
                                >
                                    INVENTORY
                                </button>

                                {/* ADMIN PANEL - Only for admins */}
                                {isAdmin && (
                                    <div className="relative group">
                                        <button
                                            onMouseEnter={() =>
                                                setIsAdminDropdownOpen(true)
                                            }
                                            onMouseLeave={() =>
                                                setIsAdminDropdownOpen(false)
                                            }
                                            className="py-3 px-3 xl:px-4 xl:py-2.5 xl:h-10 text-xs xl:text-sm text-white border border-[#c89e3a] hover:bg-[#c89e3a] hover:text-white transition-colors whitespace-nowrap flex items-center justify-center gap-1"
                                        >
                                            ADMIN PANEL
                                            <ChevronDown
                                                size={16}
                                                className={`transition-transform duration-200 ${isAdminDropdownOpen ? "rotate-180" : ""}`}
                                            />
                                        </button>

                                        {isAdminDropdownOpen && (
                                            <div
                                                onMouseEnter={() =>
                                                    setIsAdminDropdownOpen(true)
                                                }
                                                onMouseLeave={() =>
                                                    setIsAdminDropdownOpen(
                                                        false
                                                    )
                                                }
                                                className="absolute top-full left-0 mt-0 w-64 bg-white shadow-lg border border-gray-200 rounded-sm z-50"
                                            >
                                                <Link
                                                    href="/member"
                                                    className="block px-4 py-3 text-sm text-gray-700 hover:bg-[#c89e3a] hover:text-white transition-colors border-b border-gray-100"
                                                >
                                                    Members
                                                </Link>
                                                <Link
                                                    href="/customer-management"
                                                    className="block px-4 py-3 text-sm text-gray-700 hover:bg-[#c89e3a] hover:text-white transition-colors border-b border-gray-100"
                                                >
                                                    Customer Management
                                                </Link>
                                                <Link
                                                    href="/buy-form"
                                                    className="block px-4 py-3 text-sm text-gray-700 hover:bg-[#c89e3a] hover:text-white transition-colors border-b border-gray-100"
                                                >
                                                    Buy Form Submissions
                                                </Link>
                                                <Link
                                                    href="/limitedEdition"
                                                    className="block px-4 py-3 text-sm text-gray-700 hover:bg-[#c89e3a] hover:text-white transition-colors border-b border-gray-100"
                                                >
                                                    Limited Edition
                                                </Link>
                                                {userRole === "SUPER_ADMIN" && (
                                                    <Link
                                                        href="/create-admin"
                                                        className="block px-4 py-3 text-sm text-gray-700 hover:bg-[#c89e3a] hover:text-white transition-colors"
                                                    >
                                                        Create Admin
                                                    </Link>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}

                                <button
                                    onClick={handleLogout}
                                    className="py-3 px-3 xl:px-4 xl:py-2.5 xl:h-10 text-xs xl:text-sm text-white border border-[#c89e3a] hover:bg-[#c89e3a] hover:text-white transition-colors whitespace-nowrap cursor-pointer"
                                >
                                    LOGOUT
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Tablet Only */}
                    <div className="hidden md:flex lg:hidden items-center gap-2">
                        {isCheckingAuth ? (
                            <div className="py-1 px-3 flex items-center justify-center">
                                <Loader2 className="w-5 h-5 text-[#c89e3a] animate-spin" />
                            </div>
                        ) : !isLoggedIn ? (
                            <button
                                onClick={() => router.push("/login")}
                                className="py-1 px-3 text-xs text-white border border-[#c89e3a] hover:bg-[#c89e3a] hover:text-white transition-colors cursor-pointer"
                            >
                                LOGIN
                            </button>
                        ) : (
                            <button
                                onClick={handleLogout}
                                className="py-1 px-3 text-xs text-white border border-[#c89e3a] hover:bg-[#c89e3a] hover:text-white transition-colors cursor-pointer"
                            >
                                LOGOUT
                            </button>
                        )}
                    </div>

                    {/* Mobile */}
                    <div className="flex md:hidden items-center gap-2">
                        {isCheckingAuth ? (
                            <div className="py-1 px-4 flex items-center justify-center">
                                <Loader2 className="w-5 h-5 text-[#c89e3a] animate-spin" />
                            </div>
                        ) : !isLoggedIn ? (
                            <button
                                onClick={() => router.push("/login")}
                                className="py-1 px-4 text-xs text-white border border-[#c89e3a] hover:bg-[#c89e3a] hover:text-white transition-colors cursor-pointer"
                            >
                                LOGIN
                            </button>
                        ) : (
                            <button
                                onClick={handleLogout}
                                className="py-1 px-4 text-xs text-white border border-[#c89e3a] hover:bg-[#c89e3a] hover:text-white transition-colors cursor-pointer"
                            >
                                LOGOUT
                            </button>
                        )}
                    </div>
                </div>

                {/* Tagline - Below main navigation */}
                <div className="w-full h-[2px] bg-[#C89E3A]"></div>

                <div className="hidden sm:flex justify-center py-2">
                    <p className="text-sm md:text-base tracking-wide text-white">
                        <span>Where Trust Shines,</span>
                        <span> And Quality Sparkles</span>
                    </p>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="lg:hidden fixed inset-0 top-[72px] bg-[#050c3a] z-40">
                    <div className="container mx-auto px-4 py-6">
                        <div className="flex justify-center mb-4 pb-4 border-b border-white/30">
                            <p className="text-xs tracking-wide text-gray-300">
                                Where Trust Shines, And Quality Sparkles
                            </p>
                        </div>

                        <nav className="flex flex-col gap-3 mb-8">
                            {/* About us */}
                            <Link
                                href="/aboutUs"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="text-white hover:text-[#c89e3a] transition-colors text-lg py-2"
                            >
                                About us
                            </Link>

                            {/* Our Services - Expandable in mobile */}
                            <div className="border-t border-white/20 pt-2">
                                <p className="text-white text-lg py-2 font-semibold flex items-center gap-2">
                                    Our Services
                                    <ChevronDown size={18} />
                                </p>
                                <div className="pl-4 flex flex-col gap-2">
                                    <Link
                                        href="/secure-to-source"
                                        onClick={() =>
                                            setIsMobileMenuOpen(false)
                                        }
                                        className="text-gray-300 hover:text-[#c89e3a] transition-colors text-base py-2"
                                    >
                                        S2S - Secure To Source
                                    </Link>
                                    <Link
                                        href="/diamond-source"
                                        onClick={() =>
                                            setIsMobileMenuOpen(false)
                                        }
                                        className="text-gray-300 hover:text-[#c89e3a] transition-colors text-base py-2"
                                    >
                                        DS4U - Diamond Source For You
                                    </Link>
                                    <Link
                                        href="/sud"
                                        onClick={() =>
                                            setIsMobileMenuOpen(false)
                                        }
                                        className="text-gray-300 hover:text-[#c89e3a] transition-colors text-base py-2"
                                    >
                                        SUD - Sell Your Diamonds
                                    </Link>
                                </div>
                            </div>

                            {/* Diamond Knowledge and Blogs */}
                            {navigationItems.slice(1).map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={(e) => {
                                        if (item.requiresAuth) {
                                            handleInventoryClick(e);
                                        }
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className="text-white hover:text-[#c89e3a] transition-colors text-lg py-2"
                                >
                                    {item.label}
                                </Link>
                            ))}

                            {/* Contact Us - Always visible in mobile */}
                            <button
                                onClick={() => {
                                    setIsMobileMenuOpen(false);
                                    router.push("/contact");
                                }}
                                className="text-left text-white hover:text-[#c89e3a] transition-colors text-lg py-2 border-t border-white/20 pt-2 cursor-pointer"
                            >
                                Contact Us
                            </button>

                            {/* User Panel - Available only for regular users, NOT for admin */}
                            {isLoggedIn && !isAdmin && (
                                <div className="border-t border-white/20 pt-2">
                                    <p className="text-white text-lg py-2 font-semibold flex items-center gap-2">
                                        User Panel
                                        <ChevronDown size={18} />
                                    </p>
                                    <div className="pl-4 flex flex-col gap-2">
                                        <button
                                            onClick={() => {
                                                setIsMobileMenuOpen(false);
                                                router.push("/dashboard");
                                            }}
                                            className="text-left text-gray-300 hover:text-[#c89e3a] transition-colors text-base py-2"
                                        >
                                            Dashboard
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsMobileMenuOpen(false);
                                                router.push("/enquiry");
                                            }}
                                            className="text-left text-gray-300 hover:text-[#c89e3a] transition-colors text-base py-2"
                                        >
                                            Enquiry
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Inventory - Available for Admin or APPROVED users */}
                            {isLoggedIn && (
                                <button
                                    onClick={(e) => {
                                        // Close any open diamond detail modal
                                        if (typeof window !== "undefined") {
                                            const closeModalEvent =
                                                new CustomEvent(
                                                    "close-diamond-modal"
                                                );
                                            window.dispatchEvent(
                                                closeModalEvent
                                            );
                                        }

                                        if (isInventoryAccessible) {
                                            setIsMobileMenuOpen(false);
                                            router.push("/inventory");
                                        } else {
                                            e.preventDefault();
                                            alert(
                                                "Your account is pending approval. Please wait for admin verification to access the inventory."
                                            );
                                        }
                                    }}
                                    disabled={!isInventoryAccessible}
                                    className={`text-left text-lg py-2 transition-colors ${
                                        isInventoryAccessible
                                            ? "text-white hover:text-[#c89e3a]"
                                            : "text-gray-500 cursor-not-allowed"
                                    }`}
                                >
                                    Inventory{" "}
                                    {!isInventoryAccessible &&
                                        "(Pending Approval)"}
                                </button>
                            )}

                            {/* Admin Panel - Only for admins */}
                            {isAdmin && (
                                <div className="border-t border-white/20 pt-2">
                                    <p className="text-white text-lg py-2 font-semibold flex items-center gap-2">
                                        Admin Panel
                                        <ChevronDown size={18} />
                                    </p>
                                    <div className="pl-4 flex flex-col gap-2">
                                        <button
                                            onClick={() => {
                                                setIsMobileMenuOpen(false);
                                                router.push("/member");
                                            }}
                                            className="text-left text-gray-300 hover:text-[#c89e3a] transition-colors text-base py-2"
                                        >
                                            Members
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsMobileMenuOpen(false);
                                                router.push(
                                                    "/customer-management"
                                                );
                                            }}
                                            className="text-left text-gray-300 hover:text-[#c89e3a] transition-colors text-base py-2"
                                        >
                                            Customer Management
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsMobileMenuOpen(false);
                                                router.push("/buy-form");
                                            }}
                                            className="text-left text-gray-300 hover:text-[#c89e3a] transition-colors text-base py-2"
                                        >
                                            Buy Form Submissions
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsMobileMenuOpen(false);
                                                router.push("/limitedEdition");
                                            }}
                                            className="text-left text-gray-300 hover:text-[#c89e3a] transition-colors text-base py-2"
                                        >
                                            Limited Edition
                                        </button>
                                        {userRole === "SUPER_ADMIN" && (
                                            <button
                                                onClick={() => {
                                                    setIsMobileMenuOpen(false);
                                                    router.push(
                                                        "/create-admin"
                                                    );
                                                }}
                                                className="text-left text-gray-300 hover:text-[#c89e3a] transition-colors text-base py-2"
                                            >
                                                Create Admin
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </nav>

                        <div className="flex flex-col gap-3">
                            {isCheckingAuth ? (
                                <div className="flex justify-center">
                                    <Loader2 className="w-8 h-8 text-[#c89e3a] animate-spin" />
                                </div>
                            ) : !isLoggedIn ? (
                                <>
                                    <button
                                        onClick={() => {
                                            setIsMobileMenuOpen(false);
                                            router.push("/login");
                                        }}
                                        className="w-full py-3 text-sm text-white border border-[#c89e3a] hover:bg-[#c89e3a] hover:text-white transition-colors cursor-pointer"
                                    >
                                        LOGIN
                                    </button>
                                    <button
                                        onClick={() => {
                                            setIsMobileMenuOpen(false);
                                            router.push("/register");
                                        }}
                                        className="w-full py-3 text-sm text-white border border-[#c89e3a] hover:bg-[#c89e3a] hover:text-white transition-colors cursor-pointer"
                                    >
                                        REGISTER
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => {
                                        setIsMobileMenuOpen(false);
                                        handleLogout();
                                    }}
                                    className="w-full py-3 text-sm text-white border border-[#c89e3a] hover:bg-[#c89e3a] hover:text-white transition-colors cursor-pointer"
                                >
                                    LOGOUT
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}
