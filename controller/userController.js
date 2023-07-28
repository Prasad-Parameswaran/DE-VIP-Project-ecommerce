const session = require("express-session");
const mongoose = require("mongoose");
const userDb = require("../model/userModel");
const productsCls = require("../model/productModel");
const categoryCls = require("../model/categoryModel");
const adressCls = require("../model/adressModel");
const cartCls = require("../model/cartModel");
const orderCls = require("../model/orderModel");
const moment = require("moment");

const { sendotp, verifyotp } = require("../utilities/otpVerify");
const { log } = require("handlebars/runtime");
const bcrypt = require("bcrypt");
let forgotNumber;

const sessionchecker = (req, res, next) => {
  if (req.session.loginchecker) {
    next();
  } else {
    res.redirect("/");
  }
};

// registration

PostRegistration = async (req, res) => {
  try {
    const { name, password, email, phoneNumber, userName, rePassword } =
      req.body;
    if (
      name === "" ||
      password === "" ||
      email === "" ||
      phoneNumber === "" ||
      userName === "" ||
      rePassword == ""
    ) {
      return;
    }
    const users = await userDb.findOne({ email: email });
    if (users) {
      res.render("users/registration", {
        login: true,
        message: "email is already exist ",
      });
    } else {
      if (name && userName && email && phoneNumber && password && rePassword) {
        if (password === rePassword && req.body != null) {
          req.session.user = req.body;
          sendotp(phoneNumber);

          res.render("users/otp");
        } else {
          return res.render("users/registration", {
            login: true,
            message: "password not match ",
          });
        }
      } else {
        return res.render("users/registration", {
          user: true,
          message: "please fill in all the required fields ",
        });
      }
    }
  } catch (error) {
    console.log("Error:", error);
  }
};

//  login user

const login = async (req, res) => {
  try {
    const logcheck = (req.session.logchecker = false);
    res.render("users/login", { user: true, logcheck });
  } catch (error) {
    console.log(error.message);
  }
};
const logout = async (req, res) => {
  try {
    req.session.destroy();
    res.redirect("/");
  } catch (error) {
    console.log(error.message);
  }
};

//otp veryfying

const otp = async (req, res) => {
  console.log("when otp verify" + req.session.user);

  const { name, userName, email, phoneNumber, password, rePassword } =
    req.session.user;
  const response = await verifyotp(phoneNumber, req.body.otp);
  if (response.status == "approved") {
    req.session.loginchecker = true;
    const pass = await bcrypt.hash(password, 10);
    const rePass = await bcrypt.hash(rePassword, 10);
    userdetails = userDb({
      name: name,
      email: email,
      password: pass,
      rePassword: rePass,
      phoneNumber: phoneNumber,
      userName: userName,
    });
    userdetails.save().then((res) => {
      console.log("-b", res);
    });
    req.session.user_detail = userdetails;
    res.redirect("/login");
  } else {
    res.redirect("/otp");
  }
};

// resent otp

const getResendOtp = (req, res) => {
  try {
    const { phone } = req.session.user;
    sendotp(phone);
    res.redirect("/otp");
  } catch (error) {
    res.render("users/error");
  }
};

// registration page

const getRegistration = (req, res) => {
  try {
    res.render("users/registration", { user: true });
  } catch (error) {
    console.log(error.message);
  }
};

// get user home

const home = async function (req, res) {
  console.log(req.query);
  const category = await categoryCls.find().lean();
  const logcheck = req.session.user;

  console.log(category[0].block);
  res.render("users/UserHome", { user: true, category, logcheck });
};

// login user and veryfying password and get home

const userHome = async (req, res) => {
  const IN = await userDb.findOne({ email: req.body.email });
  console.log(IN);
  const passwordMatch = await bcrypt.compare(req.body.password, IN.password);
  if (passwordMatch) {
    if (IN.isAdmin) {
      return res.render("users/login", {
        message: "password or userName is incorrect",
        user: true,
      });
    }
    if (IN.block == false) {
      req.session.user = IN;
      req.session.userAuthen = true;
      res.json("sucess");
    }
  } else {
    res.render("users/login", {
      message: "password or userName is incorrect",
      user: true,
    });
  }
};

// get products in userside

const getProducts = async (req, res) => {
  try {
    const product = await productsCls.find({}).lean();
    res.render("users/shop-product-grid", { user: true, product });
  } catch (error) {
    console.log(error.message);
  }
};

// get forgot passwordpage

const forgotPass = async (req, res) => {
  try {
    res.render("users/forgotPass", { user: true });
  } catch (error) {
    console.log(error.message);
  }
};

// post forgot password

const PostForgotPass = async (req, res) => {
  try {
    const phoneNumber = req.body;
    console.log(phoneNumber);
    const findNum = await userDb.findOne(phoneNumber);
    console.log(findNum);
    forgotNumber = req.body.phoneNumber;
    if (findNum) {
      sendotp(phoneNumber.phoneNumber);
    } else {
      res.render("users/forgotPass", {
        user: true,
        message: "ivalid phoneNumber please check",
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

//otp varyfying

const varfyOtp = async (req, res) => {
  try {
    const otp = req.body.otp;
    const phoneNumber = forgotNumber;
    const response = await verifyotp(phoneNumber, otp);
    if (response.status == "approved") {
      res.json("success");
    } else {
      console.log("7");
    }
  } catch (error) {
    console.log(error.message);
  }
};

// get otp page

const getOtp = (req, res) => {
  try {
    res.render("users/otp");
  } catch (error) {
    console.log(error.message);
  }
};

// conform password page

const getConformPass = (req, res) => {
  try {
    res.render("users/conformPass", { user: true });
  } catch (error) {
    console.log(error.message);
  }
};

//  conform password posting

const postConformPass = async (req, res) => {
  try {
    const pass = await bcrypt.hash(req.body.newPass, 10);
    const rePass = await bcrypt.hash(req.body.conformPass, 10);
    const user = await userDb.updateOne(
      { phoneNumber: forgotNumber },
      { $set: { password: pass, rePassword: rePass } },
      { new: true }
    );
    res.redirect("/login");
  } catch (error) {
    console.log(error.message);
  }
};

//category find and show into the userside

const findCategory = async (req, res) => {
  const categoryproducts = await productsCls
    .find({ category: req.params.categoryName })
    .lean();
  const logcheck = req.session.user;

  res.render("users/category", { user: true, categoryproducts, logcheck });
};

// show user profile
const userProfile = async (req, res) => {
  try {
    // const user = await userDb.findOne({_id:req.session.user._id}).lean();
    const user = await userDb.findOne({ _id: req.session.user._id }).lean();
    const userAddresses = await adressCls
      .findOne({ user: req.session.user._id })
      .lean();

    const userAddress = userAddresses?.address;
    console.log(userAddress);
    if (userAddress != null) {
      res.render("users/account-profile", { user: true, user, userAddress });
    } else {
      console.log("vannu    ");
      res.render("users/account-profile", { user: true, user });
    }
  } catch (error) {
    console.log(error.message);
  }
};

// user adress show into the profile page

const userAdress = async (req, res) => {
  try {
    const user = await userDb.findOne({ _id: req.session.user._id }).lean();
    res.render("users/account-address", { user: true, user });
  } catch (error) {
    console.log(error.message);
  }
};

// get product view

const productDetails = async (req, res) => {
  try {
    console.log(req.params.id);
    const product = await productsCls.findOne({ _id: req.params.id }).lean();
    const relProduct = product.category;
    const rel = await productsCls
      .find({
        category: relProduct,
      })
      .lean();
    res.render("users/shop-product-detail", { user: true, product, rel });
  } catch (error) {
    console.log(error.message);
  }
};

// view cart

const cartview = async (req, res) => {
  try {
    const user = await cartCls.findOne({ owner: req.session.user._id });
    const productDetil = await productsCls.findOne({ _id: req.query.id });
    if (productDetil.stock < 1) {
    } else {
      if (user) {
        const productExist = await cartCls.findOne({
          owner: req.session.user._id,
          "item.product": req.query.id,
        });
        if (productExist) {
          const userHproduct = await cartCls.aggregate([
            {
              $match: {
                owner: new mongoose.Types.ObjectId(req.session.user._id),
              },
            },
            {
              $project: {
                item: {
                  $filter: {
                    input: "$item",
                    cond: {
                      $eq: [
                        "$$this.product",
                        new mongoose.Types.ObjectId(req.query.id),
                      ],
                    },
                  },
                },
              },
            },
          ]);
          const userBuyQuantity = userHproduct[0].item[0].quantity;
          if (productDetil.stock > userBuyQuantity) {
            await cartCls
              .updateOne(
                {
                  owner: req.session.user._id,
                  "item.product": req.query.id,
                },
                {
                  $inc: {
                    "item.$.quantity": 1,
                    "item.$.total": productDetil.price,
                    carttotal: productDetil.price,
                  },
                }
              )
              .then((response) => {
                console.log("increment product quantity");
                res.json("sucess");
              })
              .catch((err) => {
                console.log(err);
                console.log("error recieved");
              });
          } else {
            res.json("failed");
          }
        } else {
          await cartCls.updateOne(
            {
              owner: req.session.user._id,
            },
            {
              $push: {
                item: [
                  {
                    product: req.query.id,
                    price: productDetil.price,
                    total: productDetil.price,
                  },
                ],
              },
              $inc: {
                carttotal: productDetil.price,
              },
            }
          );
          console.log("product added successfully");
          res.json("sucess");
        }
      } else {
        const userCart = cartCls({
          owner: req.session.user._id,
          item: [
            {
              product: req.query.id,
              price: productDetil.price,
              total: productDetil.price,
            },
          ],
          carttotal: productDetil.price,
        });
        userCart.save().then((resolve) => {
          res.json("sucess");
        });
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

// shop cart view

const shopCart = async (req, res) => {
  try {
    const allCart = await cartCls
      .findOne({ owner: req.session.user._id })
      .lean()
      .populate("item.product")
      .exec();

    const prod = allCart.item;
    res.render("users/shop-cart", { user: true, prod, allCart });
  } catch (err) {
    console.log("Error occurred while fetching the cart:");
  }
};

// quantity increment and decreament

const qUpdation = async (req, res) => {
  try {
    const { productId, cartcount } = req.query;
    const cartId = req.session.user._id;

    const cartData = await cartCls
      .findOne({
        owner: req.session.user._id,
        "item.product": productId,
      })
      .lean();
    const index = cartData.item.findIndex((obj) => obj.product == productId);
    const quantity = cartData.item[index].quantity;

    let product = await productsCls.findOne({ _id: productId });
    if (cartcount == 1) {
      if (product.stock > quantity) {
        price = product.price;
        let cart = await cartCls.findOneAndUpdate(
          { owner: cartId, "item.product": productId },
          {
            $inc: {
              "item.$.quantity": cartcount,
              "item.$.total": price,
              carttotal: price,
            },
          }
        );
        const cartData = await cartCls
          .findOne({
            owner: req.session.user._id,
            "item.product": productId,
          })
          .lean();
        const index = cartData.item.findIndex(
          (obj) => obj.product == productId
        );
        const carttotal = cartData.carttotal;
        const quantity = cartData.item[index].quantity;
        const total = cartData.item[index].total;

        res.json({ carttotal, quantity, total });
      } else {
        console.log("product quantity greater than stock"); 
      res.json("outOfStock")
      }
    } else {
      price = -product.price;
      if (product.stock >= quantity && quantity > 1) {
        let cart = await cartCls.findOneAndUpdate(
          { owner: cartId, "item.product": productId },
          {
            $inc: {
              "item.$.quantity": cartcount,
              "item.$.total": price,
              carttotal: price,
            },
          }
        );

        const cartData = await cartCls
          .findOne({
            owner: req.session.user._id,
            "item.product": productId,
          })
          .lean();
        const index = cartData.item.findIndex(
          (obj) => obj.product == productId
        );
        const carttotal = cartData.carttotal;
        const quantity = cartData.item[index].quantity;
        const total = cartData.item[index].total;

        res.json({ carttotal, quantity, total });
      } else {
        console.log("minimum quantity one");
        res.json("lessStock")
      }
    }
  } catch (error) {
    console.log(error);
  }
};

// cart item delete

const deleteCart = async (req, res) => {
  try {
    const userId = req.session.user._id;
    const productId = req.query.productId;

    const product = await productsCls.findOne({ _id: productId });
    const cartProduct = await cartCls
      .findOne({ owner: userId, "item.product": productId })
      .lean();
    const productIndex = cartProduct.item.findIndex((obj) => {
      return obj.product == productId;
    });
    const price = cartProduct.item[productIndex].price;
    const carttotal = cartProduct.carttotal;
    const productTot = cartProduct.item[productIndex].total;

    const deletecart = await cartCls.updateOne(
      { owner: userId },
      {
        $pull: {
          item: { product: productId },
        },
        $inc: { carttotal: -productTot },
      }
    );

    res.json("success");
  } catch (error) {
    console.log(error.message);
  }
};

// user orders showing

const orders = async (req, res) => {
  const user = await userDb.findOne({ _id: req.session.user._id }).lean();
  const order = await orderCls.find({user: req.session.user._id}).lean()
  
  res.render("users/account-orders", { user: true ,user,order});
};

// order details 

const orderDetails = async(req,res)=>{
  const order = await orderCls.findOne({_id: req.query.id}).populate('products.product').lean()
  console.log(order,"11111111111111111")
  // console.log(order.products[0].product)
  res.render("users/orderDetails",{user:true ,order})
}


const cancelOrder = async( req,res)=>{
  try{
    const order = await orderCls.findOne({_id: req.params.id}).populate('products.product').lean()
    const productdetail = order.products
    console.log(productdetail)
   for (const el of productdetail) {
     await productsCls.findOneAndUpdate(
       { _id: el.product },
       { $inc: { stock: el.quantity } }
     );
   }
   const cancelOrder = await orderCls.findByIdAndUpdate(req.params.id, {
    orderstatus: "Order Canceled",
    track: "Order Canceled",
  });
  res.json("approved")

  }
  catch(error){
    console.log(error.message)
  }
}


//order returned

const orderRtrn = async (req,res)=>{
  const returned = await orderCls.findByIdAndUpdate(req.params.id,{
    orderstatus: "Order Return",
    track: "Order Return",
  })
  res.json("returnapproved")
}



// profile updating

const profileUpdate = async (req, res) => {
  try {
    const { phone, email, username, name } = req.body;
    console.log(phone, email, username, name);

    const updateProfile = await userDb.updateOne(
      { _id: req.session.user._id },
      {
        phoneNumber: phone,
        email: email,
        userName: username,
        name: name,
      }
    );
    const user = await userDb.findOne({ _id: req.session.user._id }).lean();
    req.session.user = user;
    res.render("users/account-profile", { user: true, user });
  } catch (error) {
    console.log(error.message);
  }
};

//address adding

const addAdress = async (req, res) => {
  try {
    const { pinCode, state, city, address, name } = req.body;
    console.log(pinCode, state, city, address, name);
    const country = req.body.mycountry;

    const user = await adressCls.findOne({ user: req.session.user._id });
    if (user) {
      const addressInsert = await adressCls.updateOne(
        {
          user: req.session.user._id,
        },
        {
          $push: {
            address: [
              {
                fullname: name,
                address: address,
                city: city,
                state: state,
                pincode: pinCode,
                country: country,
              },
            ],
          },
        }
      );
      res.redirect("account-address");
    } else {
      const addressInsert = adressCls({
        user: req.session.user._id,
        address: [
          {
            fullname: name,
            address: address,
            city: city,
            state: state,
            pincode: pinCode,
            country: country,
          },
        ],
      });
      addressInsert.save();
      res.redirect("account-address");
    }
  } catch (error) {
    console.log(error.message);
  }
};

// address editing

const getEdit = async (req, res) => {
  try {
    const index = req.query.index;
    const user = await userDb.findOne({ _id: req.session.user._id }).lean();
    const userAddresses = await adressCls
      .findOne({ user: req.session.user._id })
      .lean();
    console.log(userAddresses);
    const editAdress = userAddresses.address[index];
    res.render("users/editAddress", { user: true, editAdress, user });
  } catch (error) {
    console.log(error.message);
  }
};

const postEditAddress = async (req, res) => {
  try {
    const addressId = req.query.id;
    const { name, address, city, pinCode, state } = req.body;
    const country = req.body.mycountry;
    const addressInsert = await adressCls.findOneAndUpdate(
      {
        user: req.session.user._id,
        "address._id": addressId,
      },
      {
        $set: {
          "address.$.fullname": name,
          "address.$.address": address,
          "address.$.city": city,
          "address.$.state": state,
          "address.$.pincode": pinCode,
          "address.$.country": country,
        },
      }
    );
    res.redirect("/getEdit");
  } catch (error) {
    console.log(error.message);
  }
};

// address deleting

const deleteAddress = async (req, res) => {
  try {
    const addressId = req.query.addressId;
    const addressDel = await adressCls
      .updateOne(
        { user: req.session.user._id },
        {
          $pull: {
            address: { _id: addressId },
          },
        }
      )
      .then((response) => {
        res.redirect("/account-profile");
      });
  } catch (error) {
    console.log(error.message);
  }
};

// checkout page
const getCheckout = async (req, res) => {
  try {
    console.log(req.session.user._id);
    const allCart = await cartCls
      .findOne({ owner: req.session.user._id })
      .lean()
      .populate("item.product")
      .exec();

    const prod = allCart.item;
    console.log(prod, "111111111111111111111");
    const userAddresses = await adressCls
      .findOne({ user: req.session.user._id })
      .lean();

    const address = userAddresses?.address;
    console.log(address);
    if (address != null) {
      res.render("users/check", { user: true, address, prod, allCart });
    } else {
      console.log("vannu    ");
      res.render("users/check", { user: true });
    }
  } catch (error) {
    console.log(error.message);
  }
};




const placeOrder = async (req, res) => {
  try {
    // console.log(req.body);
    const index = req.body.address
    let addressdetails = await adressCls.findOne({ user: req.session.user._id });
    let deliveryAddress =  addressdetails.address[index]  
      // await adressCls.aggregate([
    //   {
    //     $unwind: {
    //       path: "$address",
    //     },
    //   },
    //   {
    //     $match: {
    //       user: new mongoose.Types.ObjectId(req.session.user._id),
    //       "address._id": new mongoose.Types.ObjectId(req.body.address),
    //     },
    //   },
    // ]);
    console.log(deliveryAddress)

    let cart = await cartCls
      .findOne({ owner: req.session.user._id }) 
      .populate("item.product");
    console.log(cart, "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", cart.carttotal);

    let cproduct = cart.item;
    console.log("11111",cproduct)
    let Outstock = [];
    for (let i = 0; i < cproduct.length; i++) {
      if (cproduct[i].product.stock < cproduct[i].quantity) {
        Outstock.push(cproduct[i].product.product_name);
      }
    }
    if (Outstock.length !== 0) {
      console.log(Outstock);
      console.log("product out of stock");
    //  return res.json({ Outstock: true, Outstock });
     return res.json("not approved");

    } else {
      console.log("2222")
      const paymentmethod = req.body.paymentMethod;
      if (paymentmethod === "cash on delivery") {
        let neworder = await orderCls.create({
          date: moment().format("L"),
          time: moment().format("LT"),
          user: req.session.user._id,
          products: cart.item,

          totalprice: cart.carttotal,
          address: deliveryAddress,
          paymentmethod: "Cash on delivery",
          paymentstatus: "Pending",
          orderstatus: "Order Confirmed",
          track: "Order Confirmed",
        });
        req.session.orderid = neworder._id; 

        console.log("result collected");
        let productdetail = neworder.products;

        for (const el of productdetail) {
          await productsCls.findOneAndUpdate(
            { _id: el.product },
            { $inc: { stock: -el.quantity } }
          );
        }
        console.log(neworder.user, "................................");
           await cartCls.findOneAndDelete({ owner: neworder.user._id });
           console.log("completed.....")
        res.json("success")
      }
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Something went wrong." });
  }
};


module.exports = {
  PostRegistration,
  getResendOtp,
  otp,
  userHome,
  getProducts,
  forgotPass,
  PostForgotPass,
  varfyOtp,
  home,
  findCategory,
  postConformPass,
  login,
  sessionchecker,
  logout,
  userProfile,
  userAdress,
  getOtp,
  productDetails,
  getRegistration,
  getConformPass,
  cartview,
  shopCart,
  qUpdation,
  deleteCart,
  orders,
  profileUpdate,
  addAdress,
  getEdit,
  postEditAddress,
  deleteAddress,
  getCheckout,
  placeOrder,
  orderDetails,
  cancelOrder,
  orderRtrn
};
