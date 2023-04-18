import CollectionSchema from "../models/collection.schema.js";
import asyncHandler from "../services/asyncHandler.js";
import CustomError from "../utils/customError.js";
import {
  cloudinaryFileUpload,
  cloudinaryFileDelete,
} from "../services/cloudinary.files.js";
import Mongoose from "mongoose";
import formidable from "formidable";

/***********************************************************
 * @createCollection
 * @Route http://localhost:4000/api/collection/create
 * @description create new collection
 * @parameter name
 * @returns success message, collection
 ***********************************************************/
export const createCollection = asyncHandler(async (req, res) => {
  const form = formidable({
    multiples: true,
    keepExtensions: true,
  });

  form.parse(req, async function (err, fields, files) {
    try {
      if (err) {
        throw new CustomError(err.message || "something went wrong", 500);
      }
      // check fields
      if (!fields.name && !fields.photo) {
        throw new CustomError("please fill all details", 500);
      }

      const existCollection = await CollectionSchema.findOne({
        name: fields.name,
      });

      if (existCollection) {
        throw new CustomError("Collection name already exist in db", 401);
      }

      const collectionImage = await cloudinaryFileUpload(files.photo.filepath, {
        folder: "EcommerceApp/collection",
      });

      if (!collectionImage) {
        res.status(500).json({
          success: false,
          message: "cloudinary image upload failed",
        });
      }

      const collectionPhoto = {
        secure_url: collectionImage.secure_url,
        public_id: collectionImage.public_id,
      };

      // create collection in db
      const collection = await CollectionSchema.create({
        name: fields.name,
        photo: collectionPhoto,
      });

      // if collection not created
      if (!collection) {
        await cloudinaryFileDelete(collectionPhoto.public_id);
        throw new CustomError("product was not created", 400);
      }

      res.status(200).json({
        success: true,
        message: "Collection created successfully",
        collection,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        success: false,
        message:
          error.message || "something went wrong product was not created",
      });
    }
  });
});

/***********************************************************
 * @updateCollection
 * @Route http://localhost:4000/api/collection/update/:id
 * @description update collection name
 * @parameter id: CollectionId
 * @returns success message, Updatedcollection
 ***********************************************************/
export const updateCollection = asyncHandler(async (req, res) => {
  const { name: collectionName } = req.body;
  const { id: collectionId } = req.params;

  if (!collectionName) {
    throw new CustomError("Collection name is required", 401);
  }

  const existCollection = await CollectionSchema.findOne({
    name: collectionName,
  });

  if (existCollection) {
    throw new CustomError("Collection name already exist in db", 401);
  }

  const updatedCollection = await CollectionSchema.findByIdAndUpdate(
    collectionId,
    { name: collectionName },
    { new: true, runValidators: true }
  );

  if (!updatedCollection) {
    throw new CustomError("Collection not found", 401);
  }

  res.status(200).json({
    success: true,
    message: "Collection updated successfully",
    updatedCollection,
  });
});

/***********************************************************
 * @deleteCollection
 * @Route http://localhost:4000/api/collection/delete/:id
 * @description delete collection
 * @parameter id: CollectionId
 * @returns success message
 ***********************************************************/
export const deleteCollection = asyncHandler(async (req, res) => {
  const { id: collectionId } = req.params;

  let deletedCollection = await CollectionSchema.findByIdAndDelete({
    _id: collectionId,
  });

  if (!deletedCollection) {
    throw new CustomError("Collection not found", 401);
  }

  deletedCollection = undefined;

  res.status(200).json({
    success: true,
    message: "Collection deleted successfully",
  });
});

/***********************************************************
 * @getAllCollections
 * @Route http://localhost:4000/api/collections/get
 * @description get all collection list
 * @parameter id: CollectionId
 * @returns success message
 ***********************************************************/
export const getAllCollections = asyncHandler(async (req, res) => {

  const collection = await CollectionSchema.find({});

  if (!collection) {
    throw new CustomError("Collections not found", 401);
  }

  res.status(200).json({
    success: true,
    message: "fetch collection list successfully",
    collection,
  });
});
