import prisma from "../database/db.js";

// import prisma from "../prismaClient.js"; // adjust path

export const createVideo = async (req, res) => {
  try {
    const { title, description, filters, stickers, compressed, duration } = req.body;

    if (
      !title ||
      !description ||
      !req.files.thumbnail ||
      !req.files.video ||
      !filters ||
      !stickers ||
      !compressed ||
      !duration
    ) {
      return res.status(400).json({
        message: "All fields are required",
        success: false,
      });
    }

   
    const thumbnailUrl = req.files.thumbnail[0].location;
    const videoUrl = req.files.video[0].location;

    const video = await prisma.video.create({
      data: {
        title,
        description,
        thumbnailUrl,
        musicUrl: videoUrl,
        filters,
        stickers,
        compressed,
        duration,
        views: 0,
        userId: 1,
      },
    });

    return res.status(201).json({
      message: "Video uploaded & created successfully",
      success: true,
      video,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      success: false,
    });
  }
};


// ***************         Getting All Vidoes      *********************//

export const getAllVideos=async(_,res)=>{
    try {
        const videos = await prisma.video.findMany({
            include:{
                user:true,
                likes:true,
                comments:true
            },
            orderBy:{
                createdAt:"desc"
            }
        })
        return res.status(201).json({
            message:"videos getting successfully",
            success:true,
            videos
        })
    } catch (error) {
        return res.status(500).json({
            message:error.message,
            success:false
        })
        
    }

}



// ***************         Getting Single Vidoes      *********************//

export const getSingleVideo = async(req,res)=>{
    try {
        const {id} = req.params;
        const singleVideo = await prisma.video.findUnique({
            where:{id:Number(id)},
            include:{
                user:true,
                likes:true,
                comments:true

            }
        })
        if(!singleVideo){
            return res.status(404).json({
                message:"Video not found",
                success:false
            })
        }
         
        return res.status(200).json({
            success:true,
            singleVideo
        })


        
    } catch (error) {
        return res.status(500).json({
            message:error.message,
            success:false
        })
        
    }
}


// *************     Updating videos          **************//
export const updateVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      thumbnailUrl,
      musicUrl,
      filters,
      stickers,
      compressed,
      userId,
    } = req.body; 

    const updatedVideo = await prisma.video.update({
      where: { id: Number(id) },
      data: {
        title,
        description,
        thumbnailUrl,
        musicUrl,
        filters,
        stickers,
        compressed,
        userId,
      },
    });

    return res.status(200).json({
      message: "Video updated successfully",
      success: true,
      updatedVideo,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      success: false,
    });
  }
};


// ***********          Deleting videos             *****************//

export const deleteVideo =async(req,res)=>{
    try {
        const {id} = req.params;
        const deletingVideo = await prisma.video.findUnique({
            where:{id:Number(id)}
        })
        if(!deletingVideo){
            return res.status(404).json({
                message:"video not found",
                success:false
            })

        }

        await prisma.video.delete({where:{id:Number(id)}});
        return res.status(200).json({
            message:"video deleted successfully",
            success:true
        })
    } catch (error) {
        return res.status(500).json({
            message:error.message,
            success:false
        })
        
    }

}
