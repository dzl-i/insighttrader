import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { cognitoGetUser, cognitoLogIn, cognitoRefreshToken } from "~/util/cognito";

export const options: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Sign In",
      credentials: {
        name: {
          label: "Name",
          type: "text",
        },
        email: {
          label: "Email",
          type: "email",
        },
        password: {
          label: "Password",
          type: "password",
        },
        tier: {
          label: "Tier",
          type: "text",
        },
        token: {
          label: "token",
          type: "text",
        },
        refreshToken: {
          label: "Refresh Token",
          type: "text",
        },
      },
      async authorize(credentials) {
        try {
          if (credentials?.password) {
            const data = await cognitoLogIn(credentials?.email || "", credentials?.password || "");
            const user = await cognitoGetUser(data.AuthenticationResult?.AccessToken || "");
            const userAttributes: { [key: string]: string } = {};
            user.UserAttributes?.forEach(attribute => {
              userAttributes[attribute.Name || ""] = attribute.Value || "";
            });

            return {
              token: data.AuthenticationResult?.AccessToken,
              refreshToken: data.AuthenticationResult?.RefreshToken,
              id: user.Username || "",
              name: userAttributes["name"],
              email: userAttributes["email"],
              tier: userAttributes["custom:tier"],
            };
          } else {
            // User is updating the session with new tier and tokens
            const data = await cognitoRefreshToken(credentials?.refreshToken || "");

            return {
              token: data.AuthenticationResult?.AccessToken,
              refreshToken: credentials?.refreshToken || "",
              id: credentials?.email || "",
              name: credentials?.name || "",
              email: credentials?.email || "",
              tier: credentials?.tier || "",
            };
          }
        } catch (error) {
          console.error(error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    session({ session, token }) {
      if (token) {
        return {
          ...session,
          user: {
            ...session.user,
            name: token.name,
            email: token.email,
            token: token.token,
            refreshToken: token.refreshToken,
            tier: token.tier
          }
        };
      }
      return token;
    },
    jwt: ({ token, user }) => {
      if (user) {
        const userData = user as any;
        return {
          ...token,
          name: userData.name,
          email: userData.email,
          token: userData.token,
          refreshToken: userData.refreshToken,
          tier: userData.tier
        }
      }
      return token;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24,
    updateAge: 60 * 60 * 24
  },
  secret: "ihateawsihateawsihateaws",
  pages: {
    signIn: "/login"
  }
};