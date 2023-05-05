import Deal from "../models/deal.schema.js";
import asyncHandler from "../services/asyncHandler.js";
import CustomError from "../utils/customError.js";

/**********************************************************
 * @CREATE_DEAL
 * @route https://localhost:5000/api/d/add
 * @description Controller used for creating a new coupon
 * @description Only admin and Moderator can create the coupon
 * @returns Coupon Object with success message "Coupon Created SuccessFully"
 *********************************************************/
export const createDeal = asyncHandler(async (req, res) => {
  const { productId, name, description, discount, expiryDate } = req.body;

  try {
    if (!(productId && discount && expiryDate)) {
      throw new CustomError("please fill required fields", 405);
    }
    const deal = await Deal.create({
      productId,
      name,
      description,
      discount,
      expiryDate,
    });

    return res.status(200).json({
      success: true,
      message: "deal successfully created",
      deal,
    });
  } catch (error) {
    console.log(error);
    throw new CustomError(error?.message || "Error accour while creating deal");
  }
});
