"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { signIn } from "next-auth/react";

import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import { cognitoLogIn } from "~/util/cognito";
import { LoaderCircle } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleLogin = async () => {
    try {
      setLoading(true);
      const res = await signIn("credentials", {
        redirect: false,
        email: email,
        password: password,
        callbackUrl: "/",
      });

      if (!res?.error) {
        router.push("/app");
      }

      setLoading(false);
    } catch (e: any) {
      setLoading(false);
      console.error(e);
    }
  };

  const readyToLogin = useMemo(() => email && password, [email, password]);

  return (
    <main className="flex min-h-screen items-center justify-center space-y-8 p-16">
      <Card className="w-[500px] rounded-3xl">
        <CardHeader>
          <CardTitle className="text-center">Log In</CardTitle>
          <CardDescription className="text-center">
            Welcome back!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="name">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Email"
                  onChange={handleEmailChange}
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Password"
                  onChange={handlePasswordChange}
                />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                router.push("/");
              }}
            >
              Back
            </a>
          </Button>
          <Button
            onClick={handleLogin}
            style={{ backgroundColor: "#1279F2" }}
            disabled={!readyToLogin}
          >
            {loading ? <LoaderCircle className="animate-spin" /> : "Log In"}
          </Button>
        </CardFooter>
        <Separator />
        <CardFooter className="mt-6 flex justify-center">
          <a
            href="#"
            className="text-xs text-gray-400 underline"
            onClick={(e) => {
              e.preventDefault();
              router.push("/register");
            }}
          >
            No account yet? Register
          </a>
        </CardFooter>
      </Card>
    </main>
  );
}
