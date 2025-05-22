/**
 * Module that imports the analyzeCode function from the analyzer service.
 * This function is likely used to perform code analysis in the application.
 */
const { analyzeCode } = require('../services/analyzer');

exports.analyze = async (req, res, next) => {
  try {
    const { files, options } = req.body;

    if (!files || Object.keys(files).length === 0) {
      return res.status(400).json({ error: 'No files provided' });
    }

    const result = await analyzeCode(files, options || {});
    res.json(result);
  } catch (error) {
    next(error);
  }
};