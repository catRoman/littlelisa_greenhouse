import usersService from "../services/usersService.js";

const getAllUsers = async (req, res, next) => {
  try {
    const users = await usersService.getAllUsers();
    console.log("/users requested");
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await usersService.getUserById(userId);
    console.log("/users/:id requested");

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
export default {
  getAllUsers,
  getUserById,
};
