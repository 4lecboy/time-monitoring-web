import Providers from "./provider";
import "./styles/globals.css";

export const metadata = {
  title: "Time Monitoring System",
  description: "EastWest BPO Time Tracking",
};

export default function RootLayout({ children }) {
  return (
    <Providers>
      <html lang="en">
        <body>{children}</body>
      </html>
    </Providers>
  );
}