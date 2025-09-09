
import prisma from "../database/db.js";
import bcrypt from "bcryptjs";

export const getAccountDetails=async(req,res)=>{
  try {
    const userId = req.id;

    const user = await prisma.user.findUnique({
      where:{ id:userId },
      select:{
        id:true,
        name:true,
        bio:true,
        email:true,
        createdAt:true,
        updatedAt:true
      }
    })
    if(!user){
      return res.status(400).json({
        message:"User not found",
        success:false
      })
    }
    return res.status(200).json({
      message:"Account detail fetched successfully",
      success:true,
      user
    })
  } catch (error) {
    console.log(error)
    
  }
}

export const updateAccount=async(req,res)=>{
  try {
    const userId = req.id
    const {name,bio,avtarUrl,socialLinks} = req.body
   
    const updateUser = await prisma.user.update({
     where:{ id: Number(userId) },
      data:{
        ...(name&&{name}),
        ...(bio && {bio}),
        ...(avtarUrl &&{avtarUrl}),
        ...(socialLinks && {socialLinks})

      },
      select:{
        id:true,
        name:true,
        email: true,
        avtarUrl: true,
        bio: true,
        socialLinks:true,
        updatedAt: true,


      }
    })

return res.status(200).json({
  message:"Account updated successfully",
  success:true,
  user:updateUser
})    
    
  } catch (error) {
    console.log(error)
    
  }

}

export const changePassword = async (req, res) => {
  try {
    const userId = req.id;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        message: "Old password and new password are required",
        success: false,
      });
    }
    const user = await prisma.user.findUnique({   where:{ id: Number(userId) }, });
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        message: "Old password is incorrect",
        success: false,
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return res.status(200).json({
      message: "Password changed successfully",
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};
