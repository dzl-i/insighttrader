"use client";

import { useMemo, useState } from "react";

import { signIn } from "next-auth/react";

import { useRouter } from "next/navigation";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Separator } from "~/components/ui/separator";
import { cognitoSignIn } from "~/util/cognito";
import { LoaderCircle } from "lucide-react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tier, setTier] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const readyToRegister = useMemo(
    () => name && email && password && tier,
    [name, email, password, tier],
  );

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleTierChange = (e: string) => {
    setTier(e);
  };

  const handleRegister = async () => {
    try {
      setLoading(true);
      await cognitoSignIn(name, email, password, tier);

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
      console.error(e);
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center space-y-8 p-16">
      <Card className="w-[500px] rounded-3xl">
        <CardHeader>
          <CardTitle className="text-center">Register Account</CardTitle>
          <CardDescription className="text-center">
            Start your investment journey with us.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="name"
                  placeholder="Full Name"
                  onChange={handleNameChange}
                />
              </div>
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
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="tier">Subscription Tier</Label>
                <Select onValueChange={(value) => handleTierChange(value)}>
                  <SelectTrigger id="tier">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value="starter">Starter (Free)</SelectItem>
                    <SelectItem value="advanced">
                      Advanced ($19.99/month)
                    </SelectItem>
                    <SelectItem value="ultimate">Ultimate ($49.99)</SelectItem>
                  </SelectContent>
                </Select>
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
            onClick={handleRegister}
            style={{ backgroundColor: "#1279F2" }}
            disabled={!readyToRegister}
          >
            {loading ? <LoaderCircle className="animate-spin" /> : "Register"}
          </Button>
        </CardFooter>
        <Separator />
        <CardFooter className="mt-6 flex justify-center">
          <a
            href="#"
            className="text-xs text-gray-400 underline"
            onClick={(e) => {
              e.preventDefault();
              router.push("/login");
            }}
          >
            Already have an account? Log In
          </a>
        </CardFooter>
      </Card>
    </main>
  );
}
