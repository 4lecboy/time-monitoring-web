"use client";

import SideNav from "@/components/common/SideNav";
import Header from "@/components/common/Header";

export default function DashboardLayout({ children }) {
    return (

          <div className="flex">
            <SideNav />
            <div className="flex flex-col flex-1">
              <Header />
              <main className="p-6">{children}</main>
            </div>
          </div>
      );
    }
