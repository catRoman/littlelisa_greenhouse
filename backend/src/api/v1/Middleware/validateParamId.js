import BaseRepo from "../repos/baseRepo.js";

const validateParamId = (table) => {
  return async (req, res, next, id) => {
    try {
      const result = await BaseRepo.validateParams(table, id);
      if (!result) {
        console.log("hi there -- param not valid");
        const error = new Error(
          `uh ho uh ${table.slice(0, -1)} ${id} doesnt exist`
        );
        error.status = 404;
        throw error;
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};

export default validateParamId;
