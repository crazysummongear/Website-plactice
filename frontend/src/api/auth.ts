import {
  CognitoIdentityProviderClient,
  SignUpCommand,
  ConfirmSignUpCommand,
  InitiateAuthCommand,
  GlobalSignOutCommand,
  ForgotPasswordCommand,
  ConfirmForgotPasswordCommand,
  AuthFlowType,
} from '@aws-sdk/client-cognito-identity-provider';
import type {
  CognitoConfig,
  AuthTokens,
  LoginCredentials,
  SignUpCredentials,
  User,
} from '../types/auth';

/**
 * Cognito configuration
 */
const cognitoConfig: CognitoConfig = {
  region: 'ap-northeast-1',
  userPoolId: 'ap-northeast-1_CVGCgVANa',
  clientId: '9h4g3m651mrs65vta59u3qb4u',
};

/**
 * Initialize Cognito client
 */
const cognitoClient = new CognitoIdentityProviderClient({
  region: cognitoConfig.region,
});

/**
 * Sign up a new user with email and password
 * @param credentials - Email and password
 * @returns User ID
 */
export async function signUp(credentials: SignUpCredentials): Promise<string> {
  try {
    const command = new SignUpCommand({
      ClientId: cognitoConfig.clientId,
      Username: credentials.email,
      Password: credentials.password,
      UserAttributes: [
        {
          Name: 'email',
          Value: credentials.email,
        },
      ],
    });

    const response = await cognitoClient.send(command);

    if (!response.UserSub) {
      throw new Error('Failed to create user');
    }

    return response.UserSub;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Sign up failed: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Confirm user email with verification code
 * @param email - User email
 * @param confirmationCode - Verification code from email
 */
export async function confirmSignUp(
  email: string,
  confirmationCode: string
): Promise<void> {
  try {
    const command = new ConfirmSignUpCommand({
      ClientId: cognitoConfig.clientId,
      Username: email,
      ConfirmationCode: confirmationCode,
    });

    await cognitoClient.send(command);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Email confirmation failed: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Sign in user with email and password
 * @param credentials - Email and password
 * @returns Authentication tokens
 */
export async function signIn(credentials: LoginCredentials): Promise<AuthTokens> {
  try {
    const command = new InitiateAuthCommand({
      ClientId: cognitoConfig.clientId,
      AuthFlow: AuthFlowType.USER_PASSWORD_AUTH,
      AuthParameters: {
        USERNAME: credentials.email,
        PASSWORD: credentials.password,
      },
    });

    const response = await cognitoClient.send(command);

    if (!response.AuthenticationResult) {
      throw new Error('Authentication failed');
    }

    const { IdToken, AccessToken, RefreshToken } = response.AuthenticationResult;

    if (!IdToken || !AccessToken) {
      throw new Error('Missing authentication tokens');
    }

    return {
      idToken: IdToken,
      accessToken: AccessToken,
      refreshToken: RefreshToken,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Sign in failed: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Sign out user (requires access token)
 * @param accessToken - User access token
 */
export async function signOut(accessToken: string): Promise<void> {
  try {
    const command = new GlobalSignOutCommand({
      AccessToken: accessToken,
    });

    await cognitoClient.send(command);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Sign out failed: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Initiate password reset flow
 * @param email - User email
 */
export async function resetPassword(email: string): Promise<void> {
  try {
    const command = new ForgotPasswordCommand({
      ClientId: cognitoConfig.clientId,
      Username: email,
    });

    await cognitoClient.send(command);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Password reset initiation failed: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Confirm password reset with new password and confirmation code
 * @param email - User email
 * @param confirmationCode - Code from reset email
 * @param newPassword - New password
 */
export async function confirmPasswordReset(
  email: string,
  confirmationCode: string,
  newPassword: string
): Promise<void> {
  try {
    const command = new ConfirmForgotPasswordCommand({
      ClientId: cognitoConfig.clientId,
      Username: email,
      ConfirmationCode: confirmationCode,
      Password: newPassword,
    });

    await cognitoClient.send(command);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Password reset confirmation failed: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Extract user information from ID token
 * @param idToken - JWT ID token
 * @returns User information
 */
export function getUserFromToken(idToken: string): User {
  try {
    // Decode JWT (without verification - verification is done by Cognito)
    const parts = idToken.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid token format');
    }

    const decoded = JSON.parse(
      atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'))
    );

    return {
      userId: decoded.sub,
      email: decoded.email,
      createdAt: new Date(decoded.auth_time * 1000).toISOString(),
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to extract user from token: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Check if token is expired
 * @param idToken - JWT ID token
 * @returns True if token is expired
 */
export function isTokenExpired(idToken: string): boolean {
  try {
    const parts = idToken.split('.');
    if (parts.length !== 3) {
      return true;
    }

    const decoded = JSON.parse(
      atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'))
    );

    const expirationTime = decoded.exp * 1000; // Convert to milliseconds
    return Date.now() > expirationTime;
  } catch {
    return true;
  }
}
