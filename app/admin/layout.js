"use client";

import Header from "./_component/Header";
import SideNav from "./_component/SideNav";



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
