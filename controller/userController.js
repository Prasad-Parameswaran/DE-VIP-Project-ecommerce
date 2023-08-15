const session = require("express-session");
const mongoose = require("mongoose");
const userDb = require("../model/userModel");
const productsCls = require("../model/productModel");
const categoryCls = require("../model/categoryModel");
const adressCls = require("../model/adressModel");
const cartCls = require("../model/cartModel");
const orderCls = require("../model/orderModel");
const bannerCls = require("../model/bannerModel");
const couponCls = require("../model/coupon");
const moment = require("moment");
const paypal = require("@paypal/checkout-server-sdk")


const { sendotp, verifyotp } = require("../utilities/otpVerify");
const { log } = require("handlebars/runtime");
const bcrypt = require("bcrypt");
const { response } = require("express");
let forgotNumber;
const envirolment =
  process.env.NODE_ENV === "production"
    ? paypal.core.LiveEnvironment
    : paypal.core.SandboxEnvironment;

const paypalCliend = new paypal.core.PayPalHttpClient(
  new envirolment(process.env.PAYPAL_CLIENT_ID,process.env.PAYPAL_SECRET_ID)
);


const sessionchecker = (req, res, next) => {
  if (req.session.loginchecker) {
    next();
  } else {
    res.redirect("/");
  }
};

// registration

const PostRegistration = async (req, res) => {
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
          console.log(req.session.user,"session details",phoneNumber)
          sendotp(phoneNumber)

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
    res.render("users/404",{error :true})
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
    req.session.user=null
    res.redirect("/");
  } catch (error) {
    console.log(error.message);
    res.render("users/404",{error :true})
  }
};

//otp veryfying
const otp = async (req, res) => {
  try{
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
      res.json("success")
      // res.redirect("/login");
    } else {
      res.redirect("/otp");
    }
  }catch(error){
    res.render("users/404",{error :true})
  }
 
};

// resent otp

const getResendOtp = (req, res) => {
  try {
    console.log( req.session,"get otp session")
    const {phoneNumber} = req.session.user;
    console.log(phoneNumber)
    sendotp(phoneNumber)
    res.redirect("/otp")
  } catch (error) {
    res.render("users/404",{error :true})
  }
 
};

// registration page

const getRegistration = (req, res) => {
  try {
    res.render("users/registration", { user: true });
  } catch (error) {
    console.log(error.message);
    res.render("users/404",{error :true})
  }
};

// get user home

const home = async function (req, res) {
try{
  console.log(req.query);
  const category = await categoryCls.find().lean();
  const banner = await bannerCls.find().lean();
  console.log(banner, "l;;;;;");
  const logcheck = req.session.user;

  console.log(category[0].block);
  res.render("users/UserHome", {
    user: true,
    category,
    logcheck,
    banner: banner,
  });
}
catch(error){
  res.render("users/404",{error :true})

}

};

// login user and veryfying password and get home

const userHome = async (req, res) => {
  try{
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
  }
  catch(error){
    res.render("users/404",{error :true})

  }

};

// get products in userside

const getProducts = async (req, res) => {
  try {
    const product = await productsCls.find({}).lean();
    res.render("users/shop-product-grid", { user: true, product });
  } catch (error) {
    console.log(error.message);
    res.render("users/404",{error :true})
  }
};

// get forgot passwordpage

const forgotPass = async (req, res) => {
  try {
    res.render("users/forgotPass", { user: true });
  } catch (error) {
    console.log(error.message);
    res.render("users/404",{error :true})

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
    res.render("users/404",{error :true})

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
    res.render("users/404",{error :true})

  }
};

// get otp page

const getOtp = (req, res) => {
  try {
    res.render("users/otp");
  } catch (error) {
    console.log(error.message);
    res.render("users/404",{error :true})

  }
};

// conform password page

const getConformPass = (req, res) => {
  try {
    res.render("users/conformPass", { user: true });
  } catch (error) {
    console.log(error.message);
    res.render("users/404",{error :true})

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
    res.render("users/404",{error :true})

  }
};

//category find and show into the userside

const findCategory = async (req, res) => {
  try{
    const categoryproducts = await productsCls
    .find({ category: req.params.categoryName })
    .lean();
  const logcheck = req.session.user;

  res.render("users/category", { user: true, categoryproducts, logcheck });
  }
  catch(error){
    res.render("users/404",{error :true})

  }
};

// show user profile
const userProfile = async (req, res) => {
  try {
    // const user = await userDb.findOne({_id:req.session.user._id}).lean();
    const user = await userDb.findOne({ _id: req.session.user._id }).lean();
    const userAddresses = await adressCls
      .findOne({ user: req.session.user._id })
      .lean();
      
    const userWallet = await userDb
    .findOne({ _id: req.session.user._id })
    .lean();
  console.log(userWallet, "this is the user details ");

    const userAddress = userAddresses?.address;
    console.log(userAddress);
    if (userAddress != null) {
      res.render("users/account-profile", { user: true, user, userAddress ,userWallet});
    } else {
      console.log("vannu    ");
      res.render("users/account-profile", { user: true, user });
    }
  } catch (error) {
    console.log(error.message);
    res.render("users/404",{error :true})

  }
};

// change password

const checkOldpass = async (req,res)=>{
try{
  console.log(req.body)

  const user = await userDb.findOne({_id : req.body.id}).lean()
 //  console.log(pass)
  const passwordMatch = await bcrypt.compare(req.body.oldPass, user.password);
   if(passwordMatch){
     res.json("success")
   }else{
     res.json("failed")
   }
}
catch(error){
  res.render("users/404",{error :true})
}
}

// new password

const newPass = async(req,res)=>{
 try{
  const pass = await bcrypt.hash(req.body.newPass, 10);
  const user = await userDb.updateOne(
    { _id: req.body.id },
    { $set: { password: pass, rePassword: pass } },
    { new: true }
  )
  .then(()=>{
    res.json("success")
  })
 }
 catch(error){
  res.render("users/404",{error :true})

 }
}

// user adress show into the profile page

const userAdress = async (req, res) => {
  try {
    const user = await userDb.findOne({ _id: req.session.user._id }).lean();
    res.render("users/account-address", { user: true, user });
  } catch (error) {
    console.log(error.message);
    res.render("users/404",{error :true})

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
    res.render("users/404",{error :true})

  }
};

//verifyCoupen

const verifyCoupen = async (req, res) => {
try{
  console.log(req.body);
  const coupenCode = req.body.coupenCode;
  const total = req.body.total;
  let coupensms;
  let calculateTotal;
  const nowDate = moment().format("L");

  console.log(nowDate);
  const coupen = await couponCls
    .findOne({
      code: coupenCode,
      status: "ACTIVE",
    })
    .lean();

  console.log(coupen);
  if (!coupen) {
    coupensms = "Coupen Invalid";
    res.json({ status: false, coupensms });
  } else if (coupen) {
    const index = coupen.userUser.findIndex(
      (obj) => obj.userId == req.session.user._id
    );
    console.log(index, "find the user");
    if (index != -1) {
      coupensms = "your already  used  this coupen";
      res.json({ status: false, coupensms });
    } else {
      const code = coupen.code;
      const percentage = coupen.percentage;
      const expireAfter = coupen.expireAfter;
      const usageLimit = coupen.usageLimit;
      const minCartAmount = coupen.minCartAmount;
      const maxCartAmount = coupen.maxCartAmount;
      const status = coupen.status;
      console.log(expireAfter, nowDate, "22222");
      const date = new Date();
      const [day, month, year] = expireAfter.split("/");
      const dateObject = new Date(year, month - 1, day);
      console.log(dateObject, "111111111111111", date);

      if (date <= dateObject) {
        if (total < minCartAmount || total > maxCartAmount) {
          coupensms =
            "Minimum " +
            minCartAmount +
            " to " +
            maxCartAmount +
            " applay this coupen";
          res.json({ status: false, coupensms });
        } else if (total >= minCartAmount && total <= maxCartAmount) {
          console.log(total);
          cutOff = Math.round((total * percentage) / 100);
          calculateTotal = Math.round(total - cutOff);
          let response = {
            status: true,
            calculateTotal: calculateTotal,
            coupensms,
            cutOff: cutOff,
          };
          res.json(response);
        }
      }
    }
  }
}
catch(error){
  res.render("users/404",{error :true})

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
    res.render("users/404",{error :true})

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
    res.render("users/404",{error :true})
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
        res.json("outOfStock");
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
        res.json("lessStock");
      }
    }
  } catch (error) {
    console.log(error);
    res.render("users/404",{error :true})

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
    res.render("users/404",{error :true})

  }
};

// user orders showing

const orders = async (req, res) => {
  try{
    const user = await userDb.findOne({ _id: req.session.user._id }).lean();
    const order = await orderCls.find({ user: req.session.user._id }).sort({ createdAt: -1 }).lean()
    res.render("users/account-orders", { user: true, user, order });
    
  }
  catch(error){
    res.render("users/404",{error :true})
  }
};

// order details

const orderDetails = async (req, res) => {
  try{
    
    const order = await orderCls
      .findOne({ _id: req.query.id })
      .populate("products.product")
      .lean();
    let orderTotal = 0;
    order.products.filter((data) => {
      orderTotal += data.total;
    });
  
    const discount = orderTotal - order.totalprice;
    res.render("users/orderDetails", { user: true, order, discount, orderTotal });
  }
  catch(error){
    res.render("users/404",{error :true})
  }
};

const cancelOrder = async (req, res) => {
  try {
    const order = await orderCls
      .findOne({ _id: req.params.id })
      .populate("products.product")
      .lean();
    const productdetail = order.products;
    console.log(productdetail);
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
    res.json("approved");
  } catch (error) {
    console.log(error.message);
    res.render("users/404",{error :true})
  }
};

//order returned

const orderRtrn = async (req, res) => {
  try{

    const returned = await orderCls.findByIdAndUpdate(req.params.id, {
      orderstatus: "Order Return",
      track: "Order Return",
    });
    res.json("returnapproved");
  }catch(error){
    res.render("users/404",{error :true})
  }
};

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
    res.render("users/404",{error :true})
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
    res.render("users/404",{error :true})
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
    res.render("users/404",{error :true})
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
    res.render("users/404",{error :true})
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
    res.render("users/404",{error :true})
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

    const userWallet = await userDb
      .findOne({ _id: req.session.user._id })
      .lean();
    console.log(userWallet, "this is the user details ");

    const address = userAddresses?.address;
    console.log(address);
    if (address != null) {
      res.render("users/check", { user: true, address, prod, allCart,userWallet ,paypalClientId:process.env.PAYPAL_CLIENT_ID,userWallet});
    } else {
      console.log("vannu    ");
      res.render("users/check", { user: true  });
    }
  } catch (error) {
    console.log(error.message);
    res.render("users/404",{error :true})
  }
};

const placeOrder = async (req, res) => {
  try {
    // console.log(req.body);
    const index = req.body.address;
    const coupon = req.body.discountAmount;
    const coupenCode = req.body.coupenCode;
    let addressdetails = await adressCls.findOne({
      user: req.session.user._id,
    });
    let deliveryAddress = addressdetails.address[index];

    console.log(deliveryAddress);

    let cart = await cartCls
      .findOne({ owner: req.session.user._id })
      .populate("item.product");
    let carttotal = cart.carttotal;
    console.log(carttotal,"this amount is carttotal amount",coupon+"2222");

    if (coupon !== "No Discount") {
      carttotal = cart.carttotal - coupon;
      const coupons = await couponCls.updateOne(
        { code: coupenCode },
        {
          $push: {
            userUser: { userId: req.session.user._id },
          },
          $inc: {
            usageLimit: -1,
          },
        }
      );
    }
    let cproduct = cart.item;
    console.log("11111", cproduct);
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
      console.log("2222"+ carttotal);
      const paymentmethod = req.body.paymentMethod;
      console.log(paymentmethod)
      if (paymentmethod === "cash on delivery") {
        let neworder = await orderCls.create({
          date: moment().format("L"),
          time: moment().format("LT"),
          user: req.session.user._id,
          products: cart.item,

          totalprice: carttotal,
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
        console.log("completed.....");
        res.json("success");
      }
      if (paymentmethod === "Wallet") {
         const userWallet = await userDb.findOne({_id :req.session.user._id})
        if(userWallet.wallet < carttotal){
          console.log("failed")
         res.json("failed")
        }
        else{
        let neworder = await orderCls.create({
          date: moment().format("L"),
          time: moment().format("LT"),
          user: req.session.user._id,
          products: cart.item,

          totalprice: carttotal,
          address: deliveryAddress,
          paymentmethod: "wallet",
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
        await userDb.findOneAndUpdate(
          { _id: req.session.user._id },
          { $inc: { wallet: -carttotal} }
        );

        await cartCls.findOneAndDelete({ owner: neworder.user._id });
        res.json("success");
        }
      }
       else if (paymentmethod === "paypal") {
        let neworder = await orderCls
          .create({
            date: moment().format("L"),
            time: moment().format("LT"),
            user: req.session.user._id,
            products: cart.item,

            totalprice: carttotal,
            address: deliveryAddress,
            paymentmethod: "paypal",
            paymentstatus: "Pending",
            orderstatus: "Order Confirmed",
            track: "Order Confirmed",
          })
          .then((response) => {
 
            let resp={
              paypal : true,
              amount : carttotal,
              orderId :response._id,
              cartId :cart._id,
            }
            res.json(resp)
          });
      }
    }
  } catch (error) {
    console.log(error);
    // res.status(500).json({ error: "Something went wrong." });
    res.render("users/404",{error :true})
  }
}

const postPaypal = async(req,res)=>{
  try{
    const request = new paypal.orders.OrdersCreateRequest();
  
    console.log("////////",request);
    console.log(req.body.items[0].amount);
    const balance = req.body.items[0].amount;
  
    console.log("jj");
    request.prefer("return=representation");
    request.requestBody({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: balance,
  
            breakdown: {
              item_total: {
                currency_code: "USD",
                value: balance,
              },
            },
          },
        },
      ],
    });
    try {
      console.log(",,,,,,,");
      const order = await paypalCliend.execute(request);
      console.log(".........");
      console.log(order);
      console.log(order.result.id);
      res.json({ id: order.result.id });
    } catch (e) {
      console.log("....,.,mmm");
      console.log(e);
      res.status(500).json(e);
    }
   
} catch(error){
  console.log(error )
  res.render("users/404",{error :true})
}
}

const verifyPayment = async (req,res)=>{
try{
  req.session.orderid = req.body.orderId;
  const  order = await orderCls.findOne({_id : req.body.orderId})
  const  productdetail = order.products
   for (const el of productdetail) {
     await productsCls.findOneAndUpdate(
       { _id: el.product },
       { $inc: { stock: -el.quantity } }
     );
   }
   const delivered = await orderCls.findByIdAndUpdate(req.body.orderId, {
     paymentstatus:"Recieved",
   })
   await cartCls.findOneAndDelete({ owner: order.user._id });
   console.log("completed.....");
   let response={
    status : true,
   }
   res.json(response);
}
catch(error){
  console.log(error.message)
  res.render("users/404",{error :true})
}
}

const checkComplete =  (req,res)=>{
  try{

    res.render("users/checkoutComplete",{ user: true  })
  }catch(error){
    res.render("users/404",{error :true})
  }
}

// product searching 


const search = async (req,res)=>{
  try{

    const serch = req.body.q
    console.log(serch)
    const product = await productsCls.find({ name: { $regex: '.*' + serch + '.*', $options: 'i' } }).lean()
    res.render("users/shop-product-grid", { user: true, product });
  }
  catch(error){
    res.render("users/404",{error :true})
  }
}


// product filtering 

const filerProduct = async (req,res)=>{
  try{

    const value = req.query.value
    const product = await productsCls.find({}).sort({price : value}).lean()
    console.log(product)
    res.render("users/shop-product-grid", { user: true, product });
  }
  catch(error){
    res.render("users/404",{error :true})
  }
}


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
  orderRtrn,
  verifyCoupen,
  postPaypal,
  verifyPayment,
  checkComplete,
  checkOldpass,
  newPass,
  search,
  filerProduct,
  // sortCate,
  // categorySearch

};
