"use client";

import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

import { Check } from "lucide-react";
import { cognitoRefreshToken, cognitoUpdateTier } from "~/util/cognito";

export default function SubscriptionPage() {
  let tier = "";
  let accessToken = "";
  let refreshToken = "";
  const router = useRouter();

  const { data: session, update } = useSession();
  if (session) {
    const user = session.user as {
      name: string;
      email: string;
      token: string;
      refreshToken: string;
      tier: string;
    };

    tier = user.tier;
    accessToken = user.token;
    refreshToken = user.refreshToken;
  }

  const handleStarter = async () => {
    tier = "starter";
    try {
      await cognitoUpdateTier(accessToken, tier);

      // Update the session with the new tier and tokens
      await signIn("credentials", {
        redirect: false,
        email: session?.user?.email,
        password: "",
        tier: tier,
        token: accessToken,
        refreshToken: refreshToken,
      });

      router.refresh();
    } catch (e: any) {
      console.error(e);
    }
  };

  const handlePremium = async () => {
    tier = "premium";
    try {
      await cognitoUpdateTier(accessToken, tier);

      // Update the session with the new tier and tokens
      await signIn("credentials", {
        redirect: false,
        email: session?.user?.email,
        password: "",
        tier: tier,
        token: accessToken,
        refreshToken: refreshToken,
      });

      router.refresh();
    } catch (e: any) {
      console.error(e);
    }
  };

  const handleUltimate = async () => {
    tier = "ultimate";
    try {
      await cognitoUpdateTier(accessToken, tier);

      // Update the session with the new tier and tokens
      await signIn("credentials", {
        redirect: false,
        email: session?.user?.email,
        password: "",
        tier: tier,
        token: accessToken,
        refreshToken: refreshToken,
      });

      router.refresh();
    } catch (e: any) {
      console.error(e);
    }
  };

  return (
    <main className="space-y-8 p-16 h-screen">
      <div className="mx-8 mt-12 grid grid-cols-3 grid-rows-[min-content_1fr] gap-8">
        {/* A blank div for grid 1 */}
        <div className="flex flex-col items-center justify-center text-center"></div>

        {/* Subscription Plan Text */}
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <p className="text-4xl font-extrabold">
            Empower your investment{" "}
            <span className="bg-gradient-to-r from-[#4497ff] to-[#2b2b77] bg-clip-text text-transparent">
              strategy
            </span>
            🚀
          </p>
          <p className="text-sm text-gray-400">
            Choose from our 3 plans
          </p>
        </div>

        {/* A blank div for grid 3 */}
        <div className="flex flex-col items-center justify-center text-center"></div>

        {/* First Subscription Plan */}
        <div className="mt-4 flex flex-col items-center justify-center gap-8 text-center">
          <div className="flex w-full flex-col rounded-xl border border-white/10 bg-gradient-to-b from-white/5 to-white/0 px-6 py-7 shadow-xl">
            <div className="flex w-full flex-row items-center">
              <p className="flex-grow text-left text-lg font-extrabold">
                Starter
              </p>
              <p className="py-2 text-xs uppercase text-gray-500"></p>
            </div>

            <div className="mt-4 gap-3 text-left">
              <p className="text-3xl font-extrabold">Free</p>
              <p className="text-xs text-gray-500 dark:text-gray-300">forever</p>
            </div>

            <button
              className="mt-6 rounded-full border border-gray-500 bg-transparent py-2"
              onClick={handleStarter}
            >
              {tier === ""
                ? "Start Free Trial"
                : tier === "starter"
                  ? "Current Plan"
                  : tier === "premium" || tier === "ultimate"
                    ? "Switch to Starter"
                    : "Start Free Trial"}
            </button>

            <div className="mt-8">
              <div className="flex flex-row gap-x-2">
                <Check className="h-6 w-6 rounded-full bg-blue-500/25 p-1 text-blue-500" />
                Access to over <span className="text-blue-500">100,000</span> AFR articles
              </div>
              <div className="mt-6 flex flex-row gap-x-2">
                <Check className="h-6 w-6 rounded-full bg-blue-500/25 p-1 text-blue-500" />
                Access to basic <span className="text-blue-500">sentimental analysis</span>
              </div>
              <div className="mt-6 flex flex-row gap-x-2">
                <Check className="h-6 w-6 rounded-full bg-blue-500/25 p-1 text-blue-500" />
                Access to basic <span className="text-blue-500">topic analysis</span>
              </div>
              <div className="mt-6 flex flex-row gap-x-2">
                <Check className="h-6 w-6 rounded-full bg-blue-500/25 p-1 text-blue-500" />
                Thousands of <span className="text-blue-500">live article analysis</span>
              </div>
              <div className="mt-6 flex flex-row gap-x-2">
                <Check className="h-6 w-6 rounded-full bg-blue-500/25 p-1 text-blue-500" />
                Article <span className="text-blue-500">entities detection</span>
              </div>
            </div>
          </div>
        </div>

        {/* Second Subscription Plan */}
        <div className="mt-4 flex flex-col items-center justify-center gap-8 text-center">
          <div className="flex w-full flex-col rounded-xl border border-white/10 bg-clip-padding bg-[radial-gradient(220%_120%_at_top_left,_var(--tw-gradient-stops))] from-[#3f8cff] via-[#4e3fff]/20 via-30% to-white/0 to-40% px-6 py-7 shadow-xl">
            <div className="flex w-full flex-row items-center">
              <p className="flex-grow text-left text-lg font-extrabold">
                Premium
              </p>
              <p className="py-2 text-xs uppercase text-gray-500">
                Recommended
              </p>
            </div>

            <div className="mt-4 gap-3 text-left">
              <p className="text-3xl font-extrabold">$19.99</p>
              <p className="text-xs text-gray-500 dark:text-gray-300">/month</p>
            </div>

            <button
              className="mt-6 rounded-full border border-gray-500 bg-transparent py-2"
              onClick={handlePremium}
            >
              {tier === ""
                ? "Buy Premium Now"
                : tier === "starter"
                  ? "Upgrade to Premium"
                  : tier === "premium"
                    ? "Current Plan"
                    : tier === "ultimate"
                      ? "Switch to Premium"
                      : "Buy Premium Now"}
            </button>

            <div className="mt-8">
              <div className="flex flex-row gap-x-2">
                <Check className="h-6 w-6 rounded-full bg-blue-500/25 p-1 text-blue-500" />
                Everything included in the <span className="text-blue-500">Starter Plan</span>
              </div>
              <div className="mt-6 flex flex-row gap-x-2">
                <Check className="h-6 w-6 rounded-full bg-blue-500/25 p-1 text-blue-500" />
                Avanced <span className="text-blue-500">sentimental analysis</span>
              </div>
              <div className="mt-6 flex flex-row gap-x-2">
                <Check className="h-6 w-6 rounded-full bg-blue-500/25 p-1 text-blue-500" />
                Up to 1 <span className="text-blue-500">external data source</span> integration
              </div>
              <div className="mt-6 flex flex-row gap-x-2">
                <Check className="h-6 w-6 rounded-full bg-blue-500/25 p-1 text-blue-500" />
                Advanced <span className="text-blue-500">articles analysis</span>
              </div>
              <div className="mt-6 flex flex-row gap-x-2">
                <Check className="h-6 w-6 rounded-full bg-blue-500/25 p-1 text-blue-500" />
                <span className="text-blue-500">Timeseries</span> for various metrics
              </div>
            </div>
          </div>
        </div>

        {/* Third Subscription Plan */}
        <div className="mt-4 flex flex-col items-center justify-center gap-8 text-center">
          <div className="flex w-full flex-col rounded-xl border border-white/10 bg-gradient-to-b from-white/5 to-white/0 px-6 py-7 shadow-xl">
            <div className="flex w-full flex-row items-center">
              <p className="flex-grow text-left text-lg font-extrabold">
                Ultimate
              </p>
              <p className="py-2 text-xs uppercase text-gray-500"></p>
            </div>

            <div className="mt-4 gap-3 text-left">
              <p className="text-3xl font-extrabold">$49.99</p>
              <p className="text-xs text-gray-500 dark:text-gray-300">/month</p>
            </div>

            <button
              className="mt-6 rounded-full border border-gray-500 bg-transparent py-2"
              onClick={handleUltimate}
            >
              {tier === ""
                ? "Buy Ultimate Now"
                : tier === "starter"
                  ? "Upgrade to Ultimate"
                  : tier === "premium"
                    ? "Upgrade to Ultimate"
                    : tier === "ultimate"
                      ? "Current Plan"
                      : "Buy Ultimate Now"}
            </button>

            <div className="mt-8">
              <div className="flex flex-row gap-x-2">
                <Check className="h-6 w-6 rounded-full bg-blue-500/25 p-1 text-blue-500" />
                Everything included in the <span className="text-blue-500">Pro Plan</span>
              </div>
              <div className="mt-6 flex flex-row gap-x-2">
                <Check className="h-6 w-6 rounded-full bg-blue-500/25 p-1 text-blue-500" />
                <span className="text-blue-500">Unlimited data sources</span> integration
              </div>
              <div className="mt-6 flex flex-row gap-x-2">
                <Check className="h-6 w-6 rounded-full bg-blue-500/25 p-1 text-blue-500" />
                Advanced <span className="text-blue-500">Topic analysis</span>
              </div>
              <div className="mt-6 flex flex-row gap-x-2">
                <Check className="h-6 w-6 rounded-full bg-blue-500/25 p-1 text-blue-500" />
                <span className="text-blue-500">Stock recommendation</span> system
              </div>
              <div className="mt-6 flex flex-row gap-x-2">
                <Check className="h-6 w-6 rounded-full bg-blue-500/25 p-1 text-blue-500" />
                Advanced <span className="text-blue-500">LLM integration</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
