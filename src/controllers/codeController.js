import codeService from "../services/codeService.js";
import { success } from "../red/response.js";

const createCodesController = async (req, res, next) => {
  try {
    await codeService.createCodes(req.body);
    success(req, res, 200);
  } catch (error) {
    console.log(error)
    next(error);
  }
};

const getCodesController = async (req, res, next) => {
    try {
      const data = await codeService.getCodes(req);
      success(req, res, data, 200);
    } catch (error) {
      console.log(error)
      next(error);
    }
  };

const useCodeController = async (req, res, next) => {
    try {
      const data = await codeService.useCode(req);
      console.log(data)
      success(req, res, data, 200);
    } catch (error) {
      console.log(error)
      next(error);
    }
  };

  const getUserLogController = async (req, res, next) => {
    try {
      const data = await codeService.getUserLog(req);
      console.log(data)
      success(req, res, data, 200);
    } catch (error) {
      console.log(error)
      next(error);
    }
  };

export default {
    createCodesController,
    getCodesController,
    useCodeController,
    getUserLogController
};
