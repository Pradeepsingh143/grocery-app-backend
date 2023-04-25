import mongoose from "mongoose";
const { Schema, model } = mongoose;

const productSchema = Schema(
  {
    name: {
      type: String,
      required: [true, "please provide a product name"],
      trim: true,
      maxLength: [130, "product name should be a max of 130 char"],
    },
    price: {
      mrp: {
        type: Number,
        required: [true, "please provide a product price"],
        maxLength: [5, "product price should not be more than 5 digits"],
      },
      salePrice: {
        type: Number,
        maxLength: [5, "product price should not be more than 5 digits"],
      },
    },
    description: {
      type: String,
      // use editor form to design product description
    },
    shortDescription: {
      type: String,
      // use editor form to design product description
    },
    previewImage: {
      secure_url: {
        type: String,
        required: true,
      },
      public_id: {
        type: String,
        required: true,
      },
    },
    photos: [
      {
        secure_url: {
          type: String,
          required: true,
        },
        public_id: {
          type: String,
          required: true,
        },
      },
    ],
    stock: {
      type: Number,
      default: 0,
    },
    sold: {
      type: Number,
      default: 0,
    },
    collectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "collection",
      required: true,
    },
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "review",
      },
    ],
  },
  {
    timestamps: true,
  }
);

productSchema.post("remove", async function (next) {
  try {
    const productId = this._id;
    await Review.deleteMany({ product: productId });
    next();
  } catch (err) {
    console.error(err);
    next(err);
  }
})

export default model("product", productSchema);
