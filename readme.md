

# Grocery app backend

The grocery app backend is built using Node.js, Express, and Mongoose, with JavaScript as the primary programming language. The app is designed to function as an ecommerce platform, providing customers with a seamless shopping experience. The backend includes several key features such as products, orders, carts, wishlists, collections, coupons, order tracking, and reviews.

Products are listed in the app's database, and customers can search, view, and purchase them through the frontend. Orders are processed and tracked by the backend, with customers receiving real-time updates on their order status. Carts allow customers to add products to their cart and checkout with ease. Wishlists enable customers to save their favorite products for later purchase, and collections group products together by category or brand.

Coupons are used to offer discounts to customers, with the app backend handling the validation and application of coupons during the checkout process. Order tracking enables customers to monitor the progress of their orders, including shipping and delivery updates. Finally, reviews allow customers to leave feedback on products, providing valuable insights for future customers.

Overall, the grocery app backend provides a robust and reliable platform for ecommerce, offering a wide range of features to enhance the shopping experience. The use of Node.js, Express, and Mongoose ensures efficient performance and scalability, while JavaScript provides flexibility in development.

## Authors

- [@pradeep singh](https://github.com/Pradeepsingh143)


## Tech Stack

**Server:** Nodejs, Express, mongoose, javascript


## Acknowledgements

 - [Nodejs](https://nodejs.org/en/docs)
 - [Express](https://expressjs.com/en/starter/installing.html)
 - [Mongoose](https://mongoosejs.com)
 - [Javascript](https://developer.mozilla.org/en-US/docs/Web/JavaScript)


## Support

For support, email singhpardeep585@gmail.com or ping me on [linkedin](https://www.linkedin.com/in/wordpress-expert-ecommerece-expert/).


## API Reference

### Web Api

#### Authentication

```http
  POST /api/auth/signup
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `name` | `string` | **Required**. User name |
| `email` | `string` | **Required**. User email |
| `password` | `string` | **Required**. User password |


```http
  POST /api/auth/login
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `email` | `string` | **Required**. User email |
| `password` | `string` | **Required**. User password |

```http
  POST /api/auth/password/forgot
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `email` | `string` | **Required**. User email |


```http
  PUT /api/auth/password/reset/:token
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `password` | `string` | **Required**. User password |
| `confirmPassword` | `string` | **Required**. confirm user password |

```http
  GET /api/auth/profile
```

```http
  PUT /api/auth/password/change
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `oldPassword` | `string` | **Required**. User old password |
| `password` | `string` | **Required**. confirm user password |
| `confirmPassword` | `string` | **Required**. confirm user password |

```http
  GET /api/auth/refresh
```
```http
  GET /api/auth/logout
```

#### Product Routes
```http
  GET /api/product/get/:id
```
```http
  GET /api/product/get
```
```http
  GET /api/product/collection/:id
```
```http
  POST /api/product/create
```
| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `name` | `string` | **Required**. product name |
| `price` | `number` | **Required**. product price |
| `Description` | `string` |**Required** product Description |
| `short Description` | `string` | product short Description |
| `preview image` | `object` | product preview image |
| `photos` | `object` | product images |
| `stock` | `string` |**Required** product stock |
| `sold` | `string` | product sold |
| `collectionId(ref)` | `string` | **Required** product collection id |
| `review(ref)` | `Array` | product review |

```http
  PUT /api/product/update/:id
```
| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `name` | `string` | **Required**. product name |
| `price` | `number` | **Required**. product price |
| `Description` | `string` | product Description |
| `short Description` | `string` | product short Description |
| `preview image` | `object` | product preview image |
| `photos` | `object` | product images |
| `stock` | `string` | product stock |
| `sold` | `string` | product sold |
| `collectionId(ref)` | `string` | product sold |
| `review(ref)` | `Array` | product sold |

```http
  DELETE /api/product/delete/:id
```