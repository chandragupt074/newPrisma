import prisma from "../database/db.js";

export const createComments = async (req, res) => {
  try {
    const { content, videoId, userId } = req.body;
    if (!content || !videoId || !userId) {
      return res.status(400).json({
        message: "All fields are rquired",
        success: false,
      });
    }
    const uid = Number(userId);
    const vid = Number(videoId);
    if (!Number.isInteger(uid) || !Number.isInteger(vid)) {
      return res
        .status(400)
        .json({
          success: false,
          message: "userId and videoId must be integers",
        });
    }
    const comment = await prisma.comment.create({
      data: {
        content,
        userId: uid,
        videoId: vid,
      },
      include: {
        user: true,
        video: true,
      },
    });
    return res.status(201).json({
        message:"Comment Created",
        success:true,
        comment
    })
  } catch (error) {
    if(error.code==="P2003"){
        return res.status(400).json({
            message:"Invalid userId or VideoId",
            success:false
        })
    }

    return res.status(500).json({
        message:error.message,
        success:false
    })
  }
};
