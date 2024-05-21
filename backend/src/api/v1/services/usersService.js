import userRepo from "../repos/userRepo.js"

const getAllUsers = async ()=>{
    return await userRepo.getAllUsers();
}

const getUserById = async (userId)=>{
    const user =  await userRepo.getUser(userId);
    return user || null;
}

export default{
    getAllUsers,
    getUserById
}