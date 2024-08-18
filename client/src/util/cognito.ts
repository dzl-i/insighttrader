import { CognitoIdentityProvider, SignUpCommand, InitiateAuthCommand, AuthFlowType, GetUserCommand, UpdateUserAttributesCommand } from "@aws-sdk/client-cognito-identity-provider";
import { getSession, signIn } from "next-auth/react";

const cognito = new CognitoIdentityProvider({ region: "ap-southeast-2" });

export async function cognitoSignIn(name: string, email: string, password: string, tier: string) {
  const params = {
    ClientId: '2amfic3ir8kepp63np236eo18s',
    Username: email,
    Password: password,
    UserAttributes: [
      {
        Name: 'name',
        Value: name
      },
      {
        Name: 'email',
        Value: email
      },
      {
        Name: 'custom:tier',
        Value: tier
      },
    ]
  };

  const command = new SignUpCommand(params);

  try {
    const data = await cognito.send(command);
    return data;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export async function cognitoLogIn(email: string, password: string) {
  const params = {
    AuthFlow: AuthFlowType.USER_PASSWORD_AUTH,
    ClientId: '2amfic3ir8kepp63np236eo18s',
    AuthParameters: {
      USERNAME: email,
      PASSWORD: password
    }
  };

  const command = new InitiateAuthCommand(params);

  try {
    const data = await cognito.send(command);
    return data;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export async function cognitoGetUser(token: string) {
  const params = {
    AccessToken: token
  };

  const command = new GetUserCommand(params);

  try {
    const data = await cognito.send(command);
    return data;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export async function cognitoUpdateTier(token: string, newTier: string) {
  const attributeList = [
    {
      Name: "custom:tier",
      Value: newTier,
    },
  ];

  const params = {
    AccessToken: token,
    UserAttributes: attributeList
  };

  const command = new UpdateUserAttributesCommand(params);

  try {
    const data = await cognito.send(command);
    return data;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export async function cognitoRefreshToken(refreshToken: string) {
  const params = {
    AuthFlow: AuthFlowType.REFRESH_TOKEN,
    ClientId: '2amfic3ir8kepp63np236eo18s',
    AuthParameters: {
      REFRESH_TOKEN: refreshToken
    }
  };

  const command = new InitiateAuthCommand(params);

  try {
    const data = await cognito.send(command);
    return data;
  } catch (err) {
    console.error("here");
    console.error(err);
    throw err;
  }
}
