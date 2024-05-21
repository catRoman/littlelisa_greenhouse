const addParentId = (req, res, next) => {
  req.parentId = req.params.id;
  next();
};
export default addParentId;
