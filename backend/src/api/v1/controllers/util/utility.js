import formidable from "formidable";
const parseForm = (req) => {
  return new Promise((resolve, reject) => {
    const form = formidable({ multiples: true });
    form.parse(req, (err, fields, files) => {
      if (err) {
        reject(err);
      } else {
        resolve({ fields, files });
      }
    });
  });
};

export default {
  parseForm,
};
