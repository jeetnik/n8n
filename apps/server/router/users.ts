import { Router } from "express";
import { prisma } from "db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
const userRouter = Router();
const JWT_SECRET="jwt"
userRouter.post("/signup", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email && !password) {
      return res.status(403).json({
        message: "Email and password are required",
      });
    }
    const ifExits = await prisma.user.findUnique({
      where: { email },
    });
    if (ifExits) {
      return res.status(403).json({
        messgae: "User already exits",
      });
    }
    const hashpassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        email: email,
        passwordHash: hashpassword,
      },
    });
    res.status(200).json({
      messgae: "user is created",
      userId: user.id,
    });
  } catch (e) {
    console.log(e);
    res.status(403).json({
      message: "Error while signing up",
      
    });
  }
});

userRouter.get("/signin",async (req,res)=>{
    try{const {email,password}=req.body;
    if(!email&&!password){
        return res.status(403).json({
            message:"password and email is required"
        })
    }
    const dbUser=await prisma.user.findUnique({where:{email}});
    if(!dbUser){
        return res.status(403).json({
            message:"User is doesnot exits"
        })
    }

    const isVerify=await bcrypt.compare(password,dbUser.passwordHash!)
    if(!isVerify){
        return res.status(403).send({
            message:"PassWord is Incorrect"
        })
    }
  const token = jwt.sign({
    id: dbUser.id,
    password:dbUser.passwordHash
  }, JWT_SECRET, {
    expiresIn: '1h'
  });

  res.status(200).json({
    message: "Sign in successful",
    token: token
  });}catch(e){
    return res.status(403).json({
        message:"Internal server issue "
    })

    }
});

export default userRouter;