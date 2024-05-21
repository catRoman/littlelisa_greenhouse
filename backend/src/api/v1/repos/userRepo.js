import { db_pool as db}  from "../services/init/dbConnect.js";

const getAllUsers = async ()=> {
    const result = await db.query(`
        SELECT * FROM users; 
        `)
        
        return result.rows;
}
const getUser = async (userId)=>{
    const result = await db.query(`
   SELECT * FROM users WHERE user_id = $1 
    `,[userId]);

    return result.rows[0];
}

export default {
    getAllUsers,
    getUser
}