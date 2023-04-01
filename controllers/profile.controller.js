import asyncHandler from "../services/asyncHandler.js";
import CustomError from "../utils/customError.js";
import User from "../models/user.schema.js";
import {
  cloudinaryFileDelete,
  cloudinaryFileUpload,
} from "../services/cloudinary.files.js";
import formidable from "formidable";

/***********************************************************
 * @updateProfile
 * @Route http://localhost:4000/api/profile/update
 * @description update profile
 * @parameter name, email, profilePic, address, phoneNumber, dateOfBirth
 * @returns success message, profile object
 ***********************************************************/

export const updateProfile = asyncHandler(async (req, res) => {
  const userId  = req.user._id;

  const form = formidable({
    multiples: false,
    keepExtensions: true,
  });

  form.parse(req, async function (err, fields, files) {
    if (err) {
      throw new CustomError(err?.message || "something went wrong", 500);
    }

    const profileImage = await cloudinaryFileUpload(
      files?.profileImage?.filepath,
      {
        folder: "EcommerceApp/profileImages",
      }
    );

    const userImage = {
      secure_url: profileImage?.secure_url,
      public_id: profileImage?.public_id,
    };

    const profile = await User.findByIdAndUpdate(
      userId,
      {
        profilePic: userImage,
        address: {
          street: fields?.street,
          city: fields?.city,
          district: fields?.district,
          state: fields?.state,
          country: fields?.country,
        },
        gender: fields?.gender.toUpperCase(),
        ...fields,
      },
      {
        runValidators: false,
        new: true,
      }
    );

    if (!profile) {
      await cloudinaryFileDelete(profileImage?.public_id);
      throw new CustomError("profile was not updated", 400);
    }

    res.status(200).json({
      success: true,
      message: "profile was updated successfully",
      profile,
    });
  });
});

/***********************************************************
 * @getUserProfile
 * @Route http://localhost:4000/api/profile/get
 * @description get profile
 * @parameter id
 * @returns success message, profile object
 ***********************************************************/

export const getUserProfile = asyncHandler(async (req, res) => {
  const userId  = req.user._id;
  const profile = await User.findById(userId);
  if (!profile) {
    throw new CustomError("User not found", 404);
  }

  res.status(200).json({
    success: true,
    message: "User Profile fetched successfully",
    profile,
  });
});
