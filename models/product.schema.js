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
    seo: {
      title: {
        type: String,
        trim: true,
        maxLength: [70, "title does not contain more than 70 characters"]
      },
      meta_description: {
        type: String,
        trim: true,
        maxLength: [170, "meta description does not contain more than 170 characters"]
      }
    }
  },
  {
    timestamps: true,
  }
);

export default model("product", productSchema);
