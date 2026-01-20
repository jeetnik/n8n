import { prisma } from "db";
import { Router } from "express";
import type { Request, Response } from "express";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import ms, { type StringValue } from "ms";
import { google } from "googleapis";
import { isLoggedIn } from "../middelware/auth";
import { generateCookieOptions } from "../config/cookie";

const authRouter = Router();

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.PUBLIC_API_URL || "http://localhost:8080"}/api/v1/auth/google/callback`
);

const SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://mail.google.com/",
  "https://www.googleapis.com/auth/userinfo.email",
];

// Helper functions (matching original logic)
const createHash = (token: string) =>
  crypto.createHash("sha256").update(token).digest("hex");

const generateAccessToken = (user: any) =>
  jwt.sign(
    {
      id: user.id,
      email: user.email,
    },
    process.env.ACCESS_TOKEN_SECRET!,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY as StringValue }
  );

const generateRefreshToken = (user: any) =>
  jwt.sign(
    {
      id: user.id,
      email: user.email,
    },
    process.env.REFRESH_TOKEN_SECRET!,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY as StringValue }
  );

// Sign up
authRouter.post("/signup", async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const newUser = await prisma.user.create({
      data: {
        email: email,
        passwordHash: password,
        name: name,
        lastLoggedId: new Date(),
      },
    });

    return res.status(201).json({
      message: "User created successfully",
      userId: newUser.id,
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

// Sign in
authRouter.post("/signin", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log("user not found in signin");
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    const isPasswordValid = password === user.passwordHash;

    if (!isPasswordValid) {
      console.log("password is invalid");
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    const hashedRefreshToken = createHash(refreshToken);

    const expiresAt = new Date(
      Date.now() + ms(process.env.REFRESH_TOKEN_EXPIRY as StringValue)
    );

    const updatedUser = await prisma.user.update({
      where: { email },
      data: { refreshToken: hashedRefreshToken, refreshTokenExpiry: expiresAt },
    });

    return res
      .status(200)
      .cookie("accessToken", accessToken, generateCookieOptions())
      .cookie("refreshToken", refreshToken, generateCookieOptions())
      .json({
        message: "Login successful",
        userdata: updatedUser,
      });
  } catch (error) {
    console.error("Signin error:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

// Sign out / Logout
authRouter.post("/signout", async (req: Request, res: Response) => {
  try {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    return res.status(200).json({
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Signout error:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

authRouter.post("/logout", async (req: Request, res: Response) => {
  try {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    return res.status(200).json({
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

// Get current user
authRouter.get("/me", isLoggedIn, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(400).json({
        message: "User not found",
      });
    }

    const user = await prisma.user.findFirst({
      where: { id: req.user.id },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      message: "User fetched",
      userdata: user,
    });
  } catch (error) {
    console.error("Get user error:", error);
    return res.status(401).json({
      message: "User can be fetched",
    });
  }
});

// Verify Google Token (for frontend Google Sign-In)
authRouter.post("/google/verify", async (req: Request, res: Response) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        message: "No credential provided",
      });
    }

    const ticket = await oauth2Client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload || !payload.email) {
      return res.status(400).json({
        message: "Invalid token payload",
      });
    }

    let user = await prisma.user.findUnique({
      where: { email: payload.email },
    });

    if (!user) {
      const name = payload.name || `${payload.given_name || ""} ${payload.family_name || ""}`.trim();

      user = await prisma.user.create({
        data: {
          email: payload.email,
          name: name || undefined,
          passwordHash: "",
          lastLoggedId: new Date(),
        },
      });
    } else {
      const updateData: any = { lastLoggedId: new Date() };

      if (!user.name && payload.name) {
        updateData.name = payload.name;
      }

      await prisma.user.update({
        where: { id: user.id },
        data: updateData,
      });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.cookie("accessToken", accessToken, generateCookieOptions());
    res.cookie("refreshToken", refreshToken, generateCookieOptions());

    return res.status(200).json({
      message: "Google authentication successful",
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Google token verification error:", error);
    return res.status(401).json({
      message: "Invalid Google token",
    });
  }
});

// Google OAuth - redirect to Google
authRouter.get("/google", async (req: Request, res: Response) => {
  try {
    const url = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: SCOPES,
      prompt: "consent",
    });
    res.redirect(url);
  } catch (error) {
    console.error("Google auth error:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

// Google OAuth callback
authRouter.get("/google/callback", isLoggedIn, async (req: Request, res: Response) => {
  try {
    const code = req.query.code as string;

    if (!code) {
      return res.redirect(`${FRONTEND_URL}/auth/error?message=No authorization code`);
    }

    const { tokens } = await oauth2Client.getToken(code);
    const userId = req.user.id;

    const createdCred = await prisma.userCredentials.create({
      data: {
        name: "Google Account",
        apiName: "gmailOAuth2",
        appIcon: "https://ssl.gstatic.com/ui/v1/icons/mail/rfr/logo_gmail_lockup_default_1x_r2.png",
        application: "google",
        userId: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
        data: {
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          expiry_date: tokens.expiry_date,
          id_token: tokens.id_token,
        },
      },
    });

    console.log(tokens);

    return res.redirect(process.env.FRONTEND_URL || "http://localhost:5173/");
  } catch (error) {
    console.error("Google callback error:", error);
    return res.redirect(`${FRONTEND_URL}/auth/error?message=Authentication failed`);
  }
});

export default authRouter;