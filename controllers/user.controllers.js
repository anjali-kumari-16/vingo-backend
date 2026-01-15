export const getCurrentUser = async (req,res) =>{
    try{
        const userId = req.userIdif(!userId)
        {
            return res.status(400).json({message:"userId is not found"})
        }
        const user = await UserActivation.findById(userId)
        if(!user)
        {
            return res.status(400).json({message:"user is not found"})
        }
        return res.status(400).json({
            user
        })
    }
    catch(error)
    {
        return res.status(500).json({message:`get current user error ${user}`})
    }

}