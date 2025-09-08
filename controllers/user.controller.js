import prisma from "../database/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto"
import nodemailer from "nodemailer"

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "All input fields are required",
        success: false,
      });
    }

    let findUser = await prisma.user.findUnique({
      where: { email },
    });
    if (findUser) {
      return res.status(400).json({
        message: "User already exist",
        success: false,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userData = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    return res.status(200).json({
      message: "User registered Successfully",
      success: true,
      userData,
    });
  } catch (error) {
    console.log(error);
  }
};


//*****************   Login          **************************** */

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
   
    if (!email || !password) {
      return res.status(400).json({
        message: "All fields are required",
        success: false,
      });
    }
    let user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      return res.status(400).json({
        message: "Wrong email or password",
        success: false,
      });
    }
    const isMatchPassword = await bcrypt.compare(password, user.password);
    if (!isMatchPassword) {
      return res.status(400).json({
        message: "Wrong email or password",
      });
    }
    const tokenData = {
      userId: user.id,
    };
    const token = jwt.sign(tokenData, process.env.SECRET_KEY, {
      expiresIn: "30d",
    });
    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
    };
    return res
      .status(200)
      .cookie("token", token, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: "strict",
      })
      .json({
        message: "User logged in successfully",
        success: true,
        userResponse,
      });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Something went wrong",
      success: false,
    });
  }
};

export const logout=(_,res)=>{
  try {
    return res.status(200).cookie("token","",{maxAge:0}).json({
      message:"User logged out successfully",
      success:true
    })
  } catch (error) {
    console.log(error)
    
  }

}



export const forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

  
    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });

    
    const tokenPlain = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(tokenPlain).digest("hex");

  
    const expiresAt = new Date(Date.now() + 24*60*60*1000);

 
    await prisma.passwordResetToken.create({
      data: { token: tokenHash, userId: user.id, expiresAt },
    });

   
    const jwtToken = jwt.sign(
      { userId: user.id, tokenPlain },
      process.env.SECRET_KEY,
      { expiresIn: "15m" }
    );


    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${jwtToken}`;

    
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, 
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Password Reset",
      html: `
        <p>Click the link below to reset your password (valid 1 day):</p>
        <a href="${resetUrl}" target="_blank">Reset Password</a>
        <p style="word-break: break-all; color: #555;">
     ${user.id}
  </p>
        <p>If you did not request this, please ignore this email.</p>
      `,
    });

    return res.status(201).json({
      message: "Password reset link sent to your email",
      success: true,
    });
  } catch (error) {
    console.error("ForgetPassword Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};


export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body; 

    if (!token || !newPassword) {
      return res.status(400).json({ message: "Invalid request" });
    }

    
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.SECRET_KEY);
    } catch (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    const { userId, tokenPlain } = decoded;

    
    const tokenHash = crypto.createHash("sha256").update(tokenPlain).digest("hex");

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token: tokenHash },
    });

    if (!resetToken || resetToken.userId !== userId) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    if (resetToken.expiresAt.getTime() < Date.now()) {
      return res.status(400).json({ message: "Token expired" });
    }

 
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

   
    await prisma.passwordResetToken.delete({ where: { id: resetToken.id } });

    return res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("ResetPassword Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};


export const recoverPassword = forgetPassword;


