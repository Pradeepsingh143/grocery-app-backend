import Product from "../models/product.schema.js";
import Collection from "../models/collection.schema.js";
import formidable from "formidable";
import {
  cloudinaryFileUpload,
  cloudinaryFileDelete,
} from "../services/cloudinary.files.js";
import Mongoose from "mongoose";
import asyncHandler from "../services/asyncHandler.js";
import CustomError from "../utils/customError.js";
import DOMPurify from "isomorphic-dompurify";

// import { s3DeleteFile, s3FileUpload } from "../services/s3.files.js";
// import config from "../config/index.js";
// import fs from "fs";

/***********************************************************
 * @createProduct
 * @Route http://localhost:4000/api/product/create
 * @description create new product
 * @parameter name, price, description, photos, stock, sold, collectionId
 * @returns success message, product object
 ***********************************************************/
export const addProduct = asyncHandler(async (req, res) => {
  const form = formidable({
    multiples: true,
    keepExtensions: true,
  });

  form.parse(req, async function (err, fields, files) {
    try {
      if (err) {
        throw new CustomError(err.message || "something went wrong", 500);
      }

      // generate productId from Mongoose
      let productID = new Mongoose.Types.ObjectId().toHexString();

      // check fields
      if (
        !fields.name ||
        !fields.mrp ||
        !fields.description ||
        !fields.collectionId ||
        !fields.stock
      ) {
        throw new CustomError("please fill all details", 500);
      }

      //// ** handling upload in Aws.S3 bucket
      // let imageArrayResponse = Promise.all(
      //   Object.keys(files).map(async (filekey, index) => {
      //     const element = files[filekey];

      //     const data = fs.readFileSync(element.filepath);

      //     const upload = await s3FileUpload({
      //       bucketName: config.S3_BUCKET_NAME,
      //       key: `products/${productID}/photos_${index + 1}.png`,
      //       body: data,
      //       contentType: element.mimetype,
      //     });
      //     return {
      //       secure_url: upload.Location,
      //     };
      //   })
      // );
      // const imageArray = await imageArrayResponse;

      // product preview image
      const productPreviewImage = await cloudinaryFileUpload(
        files.productPreviewImage.filepath,
        {
          folder: "EcommerceApp/products",
        }
      );

      const previewImage = {
        secure_url: productPreviewImage.secure_url,
        public_id: productPreviewImage.public_id,
      };

      // product gallery image
      let fileArray;

      if (!Array.isArray(files?.productFiles)) {
        fileArray = [files.productFiles];
      } else {
        fileArray = files?.productFiles;
      }

      const images = Promise.all(
        fileArray.map(async (file, i) => {
          const data = await cloudinaryFileUpload(file?.filepath, {
            folder: "EcommerceApp/products",
          });
          return data;
        })
      );

      const imageData = await images;

      const imageArray = imageData.map((data) => {
        return {
          secure_url: data?.secure_url,
          public_id: data?.public_id,
        };
      });

      const cleanHtml = DOMPurify.sanitize(fields?.description, {
        ALLOWED_TAGS: [
          "a",
          "abbr",
          "acronym",
          "address",
          "area",
          "article",
          "aside",
          "audio",
          "b",
          "big",
          "blockquote",
          "br",
          "button",
          "canvas",
          "caption",
          "center",
          "cite",
          "code",
          "col",
          "colgroup",
          "datalist",
          "dd",
          "del",
          "details",
          "dfn",
          "dialog",
          "div",
          "dl",
          "dt",
          "em",
          "embed",
          "fieldset",
          "figcaption",
          "figure",
          "footer",
          "form",
          "h1",
          "h2",
          "h3",
          "h4",
          "h5",
          "h6",
          "header",
          "hr",
          "i",
          "img",
          "input",
          "ins",
          "kbd",
          "label",
          "legend",
          "li",
          "map",
          "mark",
          "menu",
          "meter",
          "nav",
          "ol",
          "optgroup",
          "option",
          "output",
          "p",
          "param",
          "pre",
          "progress",
          "q",
          "s",
          "samp",
          "section",
          "select",
          "small",
          "source",
          "span",
          "strike",
          "strong",
          "sub",
          "sup",
          "table",
          "tbody",
          "td",
          "textarea",
          "tfoot",
          "th",
          "thead",
          "time",
          "tr",
          "track",
          "tt",
          "u",
          "ul",
          "var",
          "video",
          "wbr",
        ],
        ALLOWED_ATTR: [
          "align",
          "alt",
          "border",
          "cite",
          "class",
          "color",
          "controls",
          "data-*",
          "datetime",
          "dir",
          "download",
          "height",
          "hidden",
          "href",
          "id",
          "lang",
          "loop",
          "name",
          "poster",
          "preload",
          "rel",
          "required",
          "scoped",
          "selected",
          "size",
          "spellcheck",
          "src",
          "srcset",
          "style",
          "tabindex",
          "title",
          "translate",
          "type",
          "usemap",
          "width",
        ],
      });

      // create product in db
      const product = await Product.create({
        _id: productID,
        photos: imageArray,
        previewImage: previewImage,
        price: {
          mrp: fields.mrp,
          salePrice: fields?.salePrice,
        },
        ...fields,
        // description: cleanHtml,
      });

      // if product not created
      if (!product) {
        // * if product got error while creating then delete all images from AWS s3 bucket
        // delete file in AWS
        // Promise.all(
        //   imageArray.map(async (_file, index) => {
        //     await s3DeleteFile({
        //       bucketName: config.S3_BUCKET_NAME,
        //       key: imageArray[index],
        //     });
        //   })
        // );

        // delete file in cloudinary
        await cloudinaryFileDelete(previewImage.public_id);

        Promise.all(
          imageData.map(async (file) => {
            await cloudinaryFileDelete(file.public_id);
          })
        );
        throw new CustomError("product was not created", 400);
      }

      //  back response
      res.status(200).json({
        success: true,
        message: "product was create successfully",
        product,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error.message || "something went wrong product was not created",
      });
    }
  });
});

/***********************************************************
 * @updateProduct
 * @Route http://localhost:4000/api/product/update/:id
 * @description update product
 * @parameter name, price, description, photos, stock, sold, collectionId
 * @returns success message, product object
 ***********************************************************/

export const updateProduct = asyncHandler(async (req, res) => {
  const { id: productId } = req.params;

  const form = formidable({
    multiples: true,
    keepExtensions: true,
  });

  form.parse(req, async function (err, fields, files) {
    try {
      if (err) {
        throw new CustomError(err.message || "something went wrong", 500);
      }
      const product = await Product.findById(productId);

      if (!product) {
        throw new CustomError("product not found", 500);
      }
      // // handling images
      // // let imageArrayResponse = Promise.all(
      //   Object.keys(files).map(async (filekey, index) => {
      //     const element = files[filekey];

      //     const data = fs.readFileSync(element.filepath);

      //     const upload = await s3FileUpload({
      //       bucketName: config.S3_BUCKET_NAME,
      //       key: `products/${productId}/photos_${index + 1}.png`,
      //       body: data,
      //       contentType: element.mimetype,
      //     });
      //     return {
      //       secure_url: upload.Location,
      //     };
      //   })
      // // );
      // product preview image
      let previewImage;
      let imageArray = [];

      if (files?.productPreviewImage) {
        const productPreviewImage = await cloudinaryFileUpload(
          files?.productPreviewImage?.filepath,
          {
            folder: "EcommerceApp/products",
          }
        );

        previewImage = {
          secure_url: productPreviewImage?.secure_url,
          public_id: productPreviewImage?.public_id,
        };
      }

      if (files?.productFiles) {
        let fileArray;
        if (!Array.isArray(files?.productFiles)) {
          fileArray = [files.productFiles];
        } else {
          fileArray = files?.productFiles;
        }
        const images = Promise.all(
          fileArray.map(async (file) => {
            const data = await cloudinaryFileUpload(file?.filepath, {
              folder: "EcommerceApp/products",
            });
            return data;
          })
        );

        const imageData = await images;

        imageArray = imageData?.map((data) => {
          return {
            secure_url: data.secure_url,
            public_id: data.public_id,
          };
        });
      }

      const updatedFields = {};
      Object.keys(fields).forEach((key) => {
        if (fields[key]) {
          updatedFields[key] = fields[key];
        }
      });

      const dirtyHtml = fields?.description;
      const cleanHtml = DOMPurify.sanitize(dirtyHtml);

      // create product in db
      const updatedProduct = await Product.findByIdAndUpdate(
        productId,
        {
          photos: [...product.photos, ...imageArray],
          price: {
            mrp: fields?.mrp,
            salePrice: fields?.salePrice,
          },
          ...updatedFields,
          // description: cleanHtml,
          previewImage:
            previewImage !== "" ? previewImage : product.previewImage,
        },
        { runValidators: false, new: true }
      );

      // if product not created
      if (!updatedProduct) {
        // * if product got error while creating then delete all images from AWS s3 bucket
        // // Promise.all(
        //   imageArray.map(async (_file, index) => {
        //     await s3DeleteFile({
        //       bucketName: config.S3_BUCKET_NAME,
        //       key: imageArray[index],
        //     });
        //   })
        // // );
        await cloudinaryFileDelete(previewImage.public_id);
        Promise.all(
          imageData.map(async (file) => {
            await cloudinaryFileDelete(file.public_id);
          })
        );
        throw new CustomError("product was not updated", 400);
      }

      //  back response
      res.status(200).json({
        success: true,
        message: "product updated successfully",
        updatedProduct,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error.message || "something went wrong product was not created",
      });
    }
  });
});

/***********************************************************
 * @delteProduct
 * @Route http://localhost:4000/api/product/delete/:id
 * @description delete product
 * @parameter id
 * @returns success message, product object
 ***********************************************************/
export const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!id) {
    throw new CustomError("Product id is required", 400);
  }
  let product = await Product.findByIdAndDelete(id);

  if (!product) {
    throw new CustomError("Product not found", 400);
  }

  product.photos.map(async (data) => {
    await cloudinaryFileDelete(data.public_id);
  });

  res.status(200).json({
    success: true,
    message: "Product deleted successfully",
  });
});

/***********************************************************
 * @getAllProducts
 * @Route http://localhost:4000/api/product/get
 * @description get all product list
 * @parameter
 * @returns success message, product object
 ***********************************************************/
export const getAllProducts = asyncHandler(async (req, res) => {
  const products = await Product.find(
    {},
    "_id name stock previewImage price createdAt sold shortDescription"
  ).populate("collectionId", "name");

  if (!products) {
    throw new CustomError("No product found", 404);
  }

  res.status(200).json({
    success: true,
    message: "all product fetched successfully",
    products,
  });
});

/***********************************************************
 * @getProductsById
 * @Route http://localhost:4000/api/product/get/:id
 * @description get all product list
 * @parameter
 * @returns success message, product object
 ***********************************************************/
export const getProductById = asyncHandler(async (req, res) => {
  const { id: productId } = req.params;
  const product = await Product.findById(productId).populate(
    "collectionId",
    "name"
  );

  if (!product) {
    throw new CustomError("Product not found", 404);
  }

  res.status(200).json({
    success: true,
    message: "all product fetched successfully",
    product,
  });
});

/***********************************************************
 * @getProductsById
 * @Route http://localhost:4000/api/product/collection/:id
 * @description get all product list
 * @parameter
 * @returns success message, product object
 ***********************************************************/
export const getProductByCollectionId = asyncHandler(async (req, res) => {
  const { id: collectionId } = req.params;
  const product = await Product.find(
    { collectionId },
    "price previewImage name collectionId"
  ).populate("collectionId", "name");
  res.status(200).json({
    success: true,
    message: "all product fetched successfully",
    product,
  });
});

/***********************************************************
 * @searchHandler
 * @Route http://localhost:4000/api/product/search?collection&term
 * @description search product by name and collection id
 * @parameter term, collectionId
 * @returns success message, product object
 ***********************************************************/
export const searchHandler = asyncHandler(async (req, res) => {
  const { term, collection: name } = req.query;

  let query = {};
  if (term !== "") {
    query.name = { $regex: term, $options: "i" };
  }

  if (name !== "") {
    try {
      const collection = await Collection.findOne({ name: name });
      if (collection) {
        query.collectionId = collection._id;
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server Error" });
    }
  }

  try {
    const products = await Product.find(query)
      .select("previewImage name price shortDescription collectionId")
      .populate("collectionId");
    res.status(200).json({
      success: true,
      message: "search query fetched successfully",
      products,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

/***********************************************************
 * @getFeaturedProducts
 * @Route http://localhost:4000/api/product/featured
 * @description get feature product
 * @parameter
 * @returns success message, product object
 ***********************************************************/
export const getFeaturedProducts = asyncHandler(async (req, res) => {
  try {
    const products = await Product.aggregate([
      {
        $lookup: {
          from: "reviews",
          localField: "_id",
          foreignField: "productId",
          as: "reviews",
        },
      },
      {
        $addFields: {
          averageRating: { $avg: "$reviews.rating" },
          isNew: {
            $gte: [
              "$createdAt",
              new Date(Date.now() - 24 * 60 * 60 * 1000 * 5),
            ], // product is new if it was created within the last 24 hours
          },
          isTopSeller: {
            $gt: ["$sold", 5], // product is top seller if it has sold more than 10 units
          },
          isDiscounted: {
            $lt: ["$price.salePrice", "$price.mrp"], // product is discounted if sale price is less than mrp
          },
          discountPercentage: {
            $round: [
              {
                $multiply: [
                  {
                    $divide: [
                      {
                        $subtract: ["$price.mrp", "$price.salePrice"],
                      },
                      "$price.mrp",
                    ],
                  },
                  100,
                ],
              },
              2,
            ],
          },
        },
      },
      {
        $match: {
          stock: { $gt: 0 },
          "reviews.0": { $exists: true }, // only show products with at least 1 reviews
          averageRating: { $gt: 4.5 },
        },
      },
      {
        $sort: {
          sold: -1,
          createdAt: -1,
        },
      },
      {
        $limit: 4,
      },
      {
        $project: {
          _id: 1,
          name: 1,
          price: 1,
          previewImage: 1,
          reviews: {
            _id: 1,
            rating: 1,
          },
          isNew: 1,
          isTopSeller: 1,
          isDiscounted: 1,
          discountPercentage: 1,
          averageRating: 1,
          specialDiscount: 1,
        },
      },
    ]);
    return res.status(200).json({
      success: true,
      message: "featured product fetched successfully",
      products,
    });
  } catch (error) {
    console.log(error);
    throw new CustomError(
      error?.message || "someThing went wrong fetching featured products",
      500
    );
  }
});


/***********************************************************
 * @getBestDealOfWeek
 * @Route http://localhost:4000/api/deals/get
 * @description get best deal product
 * @parameter
 * @returns success message, product object
 ***********************************************************/
export const getBestDealOfWeek = asyncHandler(async (req, res) => {
  // Get the current date and time
  const now = new Date();

  // Use the Mongoose aggregation pipeline to join the products collection with the deals collection,
  // filter and sort the results based on valid deals for the current week, and return the top 10 products
  try {
    const products = await Product.aggregate([
      {
        $lookup: {
          from: "deals",
          localField: "_id",
          foreignField: "productId",
          as: "deals",
        },
      },
      {
        $lookup: {
          from: "reviews",
          localField: "_id",
          foreignField: "productId",
          as: "reviews",
        },
      },
      {
        $unwind: "$deals",
      },
      {
        $unwind: "$reviews"
      },
      {
        $group: {
          _id: "$_id",
          name: { $first: "$name" },
          description: {$first: "$shortDescription"},
          price: { $first: "$price" },
          previewImage: { $first: "$previewImage"},
          deal: { $max: "$deals" },
          reviews: { $push: "$reviews" },
          stock: { $first: "$stock" },
          averageRating: { $avg: "$reviews.rating" },
        },
      },
      {
        $match: {
          "deal.expiryDate": { $gt: now },
          "deal.discount": { $gt: 10 },
          stock: { $gt: 0 },
          "reviews.0": { $exists: true },
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          price: 1,
          reviews: {
            $map: {
              input: "$reviews",
              as: "review",
              in: {
                _id: "$$review._id",
                rating: "$$review.rating",
              },
            },
          },
          previewImage: 1,
          averageRating: 1,
          specialDiscount: "$deal.discount",
          // discountedPrice: {
          //   $multiply: [
          //     "$price.salePrice",
          //     {
          //       $subtract: [1, { $divide: ["$deal.discount", 100] }]
          //     }
          //   ]
          // },
          expiryDate: "$deal.expiryDate",
        },
      },
      {
        $sort: { specialDiscount: -1 },
      },
      {
        $limit: 8,
      },
    ]);
    
    if (!products) {
      return res.status(200).json({
        success: true,
        message: "No product founded",
      });
    }

    return res.status(200).json({
      success: true,
      message: "featured product fetched successfully",
      products,
    });
  } catch (error) {
    console.log(error);
    throw new CustomError(
      error?.message || "Something went wrong while getting best deals",
      500
    );
  }
});
