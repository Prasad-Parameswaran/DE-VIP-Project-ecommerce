const mongoose = require("mongoose");
const userDb = require("../model/userModel");
const categoryCls = require("../model/categoryModel");
const productsCls = require("../model/productModel");
const orderCls = require("../model/orderModel");
const couponCls = require("../model/coupon");
const bannerCls = require("../model/bannerModel");
const { log } = require("handlebars/runtime");
const bcrypt = require("bcrypt");
const moment = require("moment");


// get customers

const customer = async function (req, res, next) {
  try {
    const name = await userDb.find().lean();
    // console.log(name)
    res.render("admin/customers", { admin: true, name });
  } catch (error) {
    console.log(error.message);
  }
};

// get admin login page

const adminLog = function (req, res) {
  try {
    res.render("admin/adminlogin", { adminlog: true });
  } catch (error) {
    console.log(error.message);
  }
};

// get admin home

const getAdminHome = (req, res) => {
  try {
    res.render("admin/adminHome", { admin: true });
  } catch (error) {
    console.log(error.message);
  }
};

// post admin login

const adminlog = async function (req, res) {
  console.log(req.body);
  const { email, password } = req.body;

  if (email == "" || password == "") {
    return res.render("admin/adminlogin", {
      adminlog: true,
      message: "please enter email and password",
    });
  }
  const admin = await userDb.findOne({ email: email });
  if (admin) {
    const passwordMatch = await bcrypt.compare(password, admin.password);
    if (passwordMatch) {
      if (admin.isAdmin) {
        req.session.adminAuthen = true;
        res.json("sucess");
        //  res.render("admin/adminHome", { admin: true });
      }
    } else {
      res.json("failed");
    }
  } else {
    res.json("failed");
  }
};

//block user

const blcok = async (req, res) => {
  try {
    const userData = await userDb.findByIdAndUpdate(
      { _id: req.params.id },
      { $set: { block: true } }
    );
    req.session.block = true;
    // res.redirect("/admin/customers");
    res.json("approve")
  } catch {
    console.log(error.message);
  }
};

// unblock user

const unblcok = async (req, res) => {
  try {
    console.log(req.params.id);
    const userData = await userDb.findByIdAndUpdate(
      { _id: req.params.id },
      { $set: { block: false } }
    );
    req.session.block == false;
    // res.redirect("/admin/customers");
    res.json("approve")
  } catch (error) {
    console.log(error.message);
  }
};

//get category

const getAdminCategory = async (req, res) => {
  try {
    const categories = await categoryCls
      .find({})
      .lean()
      .sort({ createdAt: -1 });
    res.render("admin/admincategory", { admin: true, categories });
  } catch (error) {
    res.render("admin/error");
  }
};

// add category

const postAdminAddCategory = async (req, res) => {
  try {
    const categoryName = req.body.categoryName;
    const description = req.body.description;
    const a = req.files[0].filename;
    const exist = await categoryCls.findOne({ categoryName: categoryName });
    console.log(exist, "hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh");
    if (exist) {
      res.render("admin/addCategory", { admin: true, exist });
    } else {
      let image = [];
      image.push(a);
      const product_details = categoryCls({
        categoryName: categoryName,
        imageUrl: image,
        description: description,
      });
      const product_add = await product_details.save();
      res.redirect("/admin/addCategory");
    }
  } catch (error) {
    // res.render("admin/error");
    console.log(error);
  }
};

//category unlist

const unlist = async (req, res) => {
  try {
    const admindata = await categoryCls.findByIdAndUpdate(req.params.id, {
      $set: { block: false },
    });
    console.log(admindata);
    // res.redirect("/admin/category");
    res.json("sucess");
  } catch (error) {
    console.log(error.message);
  }
};

//category list

const list = async (req, res) => {
  try {
    const userData = await categoryCls.findByIdAndUpdate(
      { _id: req.params.id },
      { $set: { block: true } }
    );
    console.log(userData);
    // res.redirect("/admin/category");
    res.json("sucess");
  } catch (error) {
    console.log(error.message);
  }
};

// get category

const getcategory = async (req, res) => {
  const categories = await categoryCls.find({}).lean();
  res.render("admin/addCategory", { admin: true, categories });
};

//category delete

const delID = async (req, res) => {
  try {
    const del = await categoryCls.findByIdAndDelete({ _id: req.params.id });
    res.redirect("/admin/category");
  } catch (error) {
    console.log(error.message);
  }
};

// category edit

const postEditID = async (req, res) => {
  try {
    const id = req.body;
    const categoryName = id.categoryName;
    const description = id.description;
    Object.assign(req.body, {
      categoryName: categoryName,
      description: description,
    });
    const edited = await categoryCls.findByIdAndUpdate(req.params.id, {
      $set: { categoryName: categoryName, description: description },
    });
    res.redirect("/admin/category");
  } catch (error) {
    console.log(error.message);
  }
};

//getcategory

const getEditCategory = async (req, res) => {
  try {
    const ID = req.params.id;
    const category = await categoryCls.findOne({ _id: ID }).lean();
    res.render("admin/editCategory", { admin: true, category });
  } catch (error) {
    res.render("admin/error");
  }
};

//getproduct

const getAddProduct = async (req, res) => {
  try {
    const categories = await categoryCls.find().lean();
    res.render("admin/add-products", { admin: true, categories });
  } catch (error) {
    console.log(error.message);
  }
};

// addproduct

const addProduct = async (req, res) => {
  try {
    const { name, brand, price, description, category, stock } = req.body;
    let image = [];
    req.files.forEach((imageUrl) => {
      image.push(imageUrl);
    });

    const product_details = productsCls({
      name: name,
      brand: brand,
      price: price,
      category: category,
      stock: stock,
      imageUrl: image,
      description: description,
    });
    const product_add = await product_details.save();
    res.redirect("/admin/products");
  } catch (error) {
    console.log(error.message);
  }
};

// get product

const getproducts = async (req, res) => {
  try {
    const products = await productsCls.find({}).lean();
    res.render("admin/products", { admin: true, products });
  } catch (error) {
    console.log(error.message);
  }
};

// delete product

const delproduct = async (req, res) => {
  try {
    const del = await productsCls.findByIdAndDelete({ _id: req.params.id });
    res.json("hjbjkk");
  } catch (error) {
    console.log(error.message);
  }
};

// product details show into the edit page

const editProduct = async (req, res) => {
  const productId = req.params.id;
  const product = await productsCls.findOne({ _id: productId }).lean();
  const categories = await categoryCls.find().lean();
  res.render("admin/editProduct", { admin: true, product, categories });
};

// edit poroduct

const productEdit = async (req, res) => {
  const { name, category, brand, Price, description, stock } = req.body;
  let image = [];
  req.files.forEach((imageUrl) => {
    image.push(imageUrl);
  });
  Object.assign(req.body, {
    name: name,
    brand: brand,
    Price: Price,
    category: category,
    description: description,
    stock: stock,
    imageUrl: image,
  });
  const edited = await productsCls.findByIdAndUpdate(req.params.id, {
    $set: {
      name: name,
      brand: brand,
      Price: Price,
      category: category,
      description: description,
      stock: stock,
      imageUrl: image,
    },
  });
  res.redirect("/admin/products");
};

// coupons

const coupon = async (req,res)=>{
  const coupons = await couponCls.find().lean()
  res.render("admin/coupon",{admin:true,coupons})
}

// post/add coupon 

const addCoupon = async(req,res)=>{
  console.log(req.body)
  let percent= parseFloat(req.body.percentage)
  console.log(req.body.date)
  const date = req.body.date
  const formattedDate = moment(date).format('DD/MM/YYYY');
  console.log(percent,';;;;;;;;;;;;;;;;;;;;;;;;',formattedDate);
  const coupon = couponCls({
    code: req.body.code,
    percentage: percent,
    expireAfter:formattedDate,
    usageLimit: req.body.limit,
    minCartAmount: req.body.minamount,
    maxCartAmount: req.body.maxamount,
  });
  const couponADD = await coupon.save()
  .then(()=>{
     res.redirect("/admin/createCoupon")
  })
}


// edit coupon page 

const editCoupon = async(req,res)=>{
  const coupon = await couponCls.findOne({_id : req.query.id}).lean()
  res.render("admin/editCoupon",{admin:true,coupon})
}

//  editCoupon  post

const postEditCoupon = async(req,res)=>{
  try{
   
    const date = req.body.date
    console.log(req.query.id)
    let percent= parseFloat(req.body.percentage)
    const formattedDate = moment(date).format('DD/MM/YYYY');
  
  await couponCls.findByIdAndUpdate(req.query.id, {
    $set: {  code: req.body.code,
      percentage: percent,
      expireAfter: formattedDate,
      usageLimit: req.body.limit,
      minCartAmount: req.body.minamount,
      maxCartAmount: req.body.maxamount,
     },
  })
  .then(()=>{
   res.redirect("/admin/coupon")
  })
  }
  catch(error){
    console.log(error.message)
  }

}


// delete coupon 

const deleteCoupon = async (req,res)=>{
  try{
    const del = await couponCls.findByIdAndDelete({ _id: req.params.id})
    .then(()=>{
      res.json("approved")
    })
  }
   catch(error){
    console.log(error.message)
   }
}


// coupon deactive 

const CouponActive = async (req,res)=>{
  try{
   console.log(req.params.id)
    await couponCls.findByIdAndUpdate(req.params.id, {
      $set: {  code: req.body.code,
        status: "DEACTIVE",
       },
    })
    .then(()=>{
      res.json("approve")
    })

  }
  catch(error){
    console.log(error.message)
  }
}

// coupon active 

const CouponDeactive = async(req,res)=>{
  try{
    console.log(req.params.id)
    await couponCls.findByIdAndUpdate(req.params.id, {
      $set: {  code: req.body.code,
        status: "ACTIVE",
       },
    })
    .then(()=>{
      res.json("approve")
    })
  }
  catch(error){
    console.log(error.message)
  }
}


// // add category

const postBanner = async (req, res) => {
  try {
    console.log(req.body)
    const title = req.body.title;
    const url = req.body.url;
    const Discription =req.body.description
    const a = req.files[0].filename;
    
      let image = [];
      image.push(a);
      const banner = bannerCls({
        Heading: title,
        Url: url,
        Discription: Discription,
        imageUrl:image
      });
      await banner.save()
      .then(()=>{
        res.redirect("/admin/banner");
      })
    
    
  } catch (error) {
    // res.render("admin/error");
    console.log(error);
  }
};






// users orders

const orders = async (req,res)=>{

  const order = await orderCls.find().populate('products.product').lean()
  console.log(order)
  res.render("admin/orders",{admin:true,order})
}

// order details of user
const usersOders = async (req,res)=>{
  console.log(req.query.id)
  const order = await orderCls.findOne({_id :req.query.id}).populate('products.product').lean()
  res.render("admin/userOrderDetails",{admin:true ,order})
}

// order shipping
const shipped = async(req,res)=>{
  const shipped = await orderCls.findByIdAndUpdate(req.query.id, {
    orderstatus: "shipped",
    track: "shipped",
  });
  res.redirect("/admin/order")
}

// order deliverd successfully
const delivered = async(req,res)=>{
  const delivered = await orderCls.findByIdAndUpdate(req.query.id, {
    paymentstatus:"Recieved",
    orderstatus: "delivered",
    track: "delivered",
  });
  res.redirect("/admin/order")
}


// order return conforming
const returnOrder = async (req,res)=>{
  const order = await orderCls.findOne({_id: req.query.id}).populate('products.product').lean()
  const productdetail = order.products
  for (const el of productdetail) {
    await productsCls.findOneAndUpdate(
      { _id: el.product },
      { $inc: { stock: el.quantity } }
    );
  }
  const updatedUser = await userDb.findOneAndUpdate(
    { _id: req.query.userId },
    { $inc: { wallet: order.totalprice } },
    { new: true }
  )
  const returned = await orderCls.findByIdAndUpdate(req.query.id,{
    paymentstatus:"Closed",
    orderstatus: "return conform",
    track: "order returned",
  })
  res.redirect("/admin/order")
}

module.exports = {
  customer,
  blcok,
  unblcok,
  adminlog,
  getAdminCategory,
  postAdminAddCategory,
  unlist,
  list,
  getcategory,
  delID,
  getEditCategory,
  postEditID,
  addProduct,
  getproducts,
  delproduct,
  getAddProduct,
  editProduct,
  productEdit,
  adminLog,
  getAdminHome,
  orders,
  usersOders,
  shipped ,
  delivered,
  returnOrder,
  addCoupon,
  coupon,
  editCoupon,
  postEditCoupon,
  deleteCoupon,
  CouponActive,
  CouponDeactive,
  postBanner
};
