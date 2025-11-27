"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/pages/Header";
import Footer from "@/components/Footer";

export default function HeaderFooterWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const noHeaderFooterRoutes = [
    "/login",
    "/register",
    "/customer-details",
    "/forgot-password",
    "/verify-otp",
  ];

  const hideHeaderFooter = noHeaderFooterRoutes.includes(pathname);

  return (
    <>
      {!hideHeaderFooter && <Header />}
      <main className="relative">{children}</main>
      {!hideHeaderFooter && <Footer />}
    </>
  );
}
