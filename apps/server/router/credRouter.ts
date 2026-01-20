import { Router } from "express";
import type { Request, Response } from "express";
import fs from "fs";
import path from "path";
import { prisma } from "db";
import z from "zod";
import { isLoggedIn } from "../middelware/auth";

const credRouter = Router();

const createCredentialsSchema = z.object({
  name: z.string(),
  type: z.string().optional(),
  appIcon: z.string().optional(),
  application: z.string().optional(),
  apiName: z.string().optional(),
  data: z.object({
    accessToken: z.string().optional(),
    baseUrl: z.string().optional(),
    apiKey: z.string().optional(),
    organizationId: z.string().optional(),
    url: z.string().optional(),
    allowedHttpRequestDomains: z.string().optional(),
    allowedDomains: z.string().optional(),
  }),
});

const updateCredentialsSchema = z.object({
  name: z.string().optional(),
  type: z.string().nullable().optional(),
  appIcon: z.string().optional(),
  apiName: z.string().optional(),
  application: z.string().optional(),
  data: z
    .object({
      accessToken: z.string().optional(),
      baseUrl: z.string().optional(),
      apiKey: z.string().optional(),
      organizationId: z.string().optional(),
      url: z.string().optional(),
      allowedHttpRequestDomains: z.string().optional(),
      allowedDomains: z.string().optional(),
    })
    .partial()
    .optional(),
});

// Get credential APIs (available credential types)
credRouter.get("/apis", async (req: Request, res: Response) => {
  try {
    const credFilePath = path.join(process.cwd(), "src", "credentials.json");
    const fileData = fs.readFileSync(credFilePath, "utf-8");
    const data = JSON.parse(fileData);

    return res.status(200).json({
      statusCode: 200,
      message: "path",
      data: data,
    });
  } catch (error) {
    console.error("Get credential APIs error:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

// Create credentials
credRouter.post("/", isLoggedIn, async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const credData = createCredentialsSchema.safeParse(req.body);

    if (!credData.data) {
      return res.status(403).json({
        message: "zod error in creating cred",
      });
    }

    const createdCred = await prisma.userCredentials.create({
      data: {
        name: credData.data!.name,
        apiName: credData.data.apiName,
        appIcon: credData.data.appIcon,
        application: credData.data.application,
        userId: userId,
        createdAt: new Date(Date.now()),
        updatedAt: new Date(Date.now()),
        data: credData.data.data,
      },
    });

    return res.status(200).json({
      statusCode: 200,
      message: "credentials created successfully",
      data: createdCred,
    });
  } catch (error) {
    console.error("Create credentials error:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

// Update credential
credRouter.put("/:credId", isLoggedIn, async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const credData = updateCredentialsSchema.safeParse(req.body);
    const { credId } = req.params;

    if (credData.error) {
      return res.status(403).json({
        message: "updated cred failed due to input validation",
      });
    }

    const existingCred = await prisma.userCredentials.findFirst({
      where: {
        id: credId,
        userId: userId,
      },
    });

    if (!existingCred) {
      return res.status(401).json({
        message: "Credentials does not belongs to you",
      });
    }

    const updatedCred = await prisma.userCredentials.update({
      where: { id: credId },
      data: {
        name: existingCred.name,
        type: existingCred.type,
        appIcon: existingCred.appIcon,
        apiName: existingCred.apiName,
        data:
          credData.data && credData.data.data
            ? { ...(existingCred.data as Record<string, unknown>), ...credData.data.data }
            : existingCred.data,
        updatedAt: new Date(),
      },
    });

    return res.status(200).json({
      statusCode: 200,
      message: "updated successfully",
      data: updatedCred,
    });
  } catch (error) {
    console.error("Update credential error:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

// Get all credentials for user
credRouter.get("/", isLoggedIn, async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;

    if (!userId) {
      return res.status(404).json({
        message: "User id is invalid",
      });
    }

    const allUserCred = await prisma.userCredentials.findMany({
      where: {
        userId: userId,
      },
    });

    return res.status(200).json({
      statusCode: 200,
      message: "Retrieved all the credentials for the user",
      data: allUserCred,
    });
  } catch (error) {
    console.error("Get all credentials error:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

// Delete credential
credRouter.delete("/:credId", isLoggedIn, async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const { credId } = req.params;

    const deletedCred = await prisma.userCredentials.delete({
      where: {
        id: credId,
      },
    });

    return res.status(200).json({
      statusCode: 200,
      message: "deleted the cred",
      data: deletedCred,
    });
  } catch (error) {
    console.error("Delete credential error:", error);
    return res.status(400).json({
      message: "failed to delete the cred",
    });
  }
});

export default credRouter;
