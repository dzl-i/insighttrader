import "~/styles/globals.css";

import { options } from "../lib/auth";
import { getServerSession } from "next-auth";
import Provider from "../lib/session-context";

import { ThemeProvider } from "~/components/ThemeProvider";
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
  const session = await getServerSession(options);
  return (
    <html lang="en">
      <Provider session={session}>
        <body className={`font-sans`}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <div className="isolate min-h-screen">
              {children}
            </div>
          </ThemeProvider>
        </body>
      </Provider>
    </html>
  );
}
