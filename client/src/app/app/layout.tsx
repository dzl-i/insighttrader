import "~/styles/globals.css";
import Navbar from "~/components/Navbar";

export const metadata = {
  title: "InsightTrader - Master the Market",
  description: "InsightTrader helps you navigate the news and master the market.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="isolate flex flex-row h-screen w-screen">
      <Navbar />
      <div className="grow h-screen">
        {children}
      </div>
    </div>
  );
}
