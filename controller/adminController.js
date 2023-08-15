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
     res.render("admin/adminError",{admin:true})
  }
};

// get admin login page

const adminLog = function (req, res) {
  try {
    res.render("admin/adminlogin", { adminlog: true });
  } catch (error) {
  res.render("admin/adminError",{admin:true})  }
};

// get admin home

const getAdminHome = async(req, res) => {
  try {
    let order = await orderCls.find();
    let orderLength = order.length;
    let user = await userDb.find();
    let userLength = user.length;

    const total = await orderCls.aggregate([
      {
        $group: {
          _id: order._id,
          total: { $sum: "$totalprice"},
        },
      },
    ]);
    const totalAmount = total[0].total;
    console.log(total);
    console.log(totalAmount);

    const pending = await orderCls.aggregate([
      {
        $match: {
          paymentstatus: "Pending",
        },
      },
      {
        $count: "count",
      },
    ]);

    console.log(pending);
    let pendindCount;
    if (pending.length != 0) {
      pendindCount = pending[0].count;
    }


    console.log(pendindCount,"pending count details...................")

    res.render("admin/adminHome", { admin: true,orderLength,userLength,pendindCount,totalAmount });
  } catch (error) {
    res.render("admin/adminError",{admin:true})  }
};

// post admin login

const adminlog = async function (req, res) {
  try{
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
  }
  catch(error){
    res.render("admin/adminError",{admin:true})
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
    res.render("admin/adminError",{admin:true})
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
    res.render("admin/adminError",{admin:true})
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
    res.render("admin/adminError",{admin:true})
  }
};

// add category

const postAdminAddCategory = async (req, res) => {
  try {
    const categoryName = req.body.categoryName;
    const description = req.body.description;
    if(!categoryName){
      res.render("admin/addCategory", { admin: true,message :"Please add the categoryName" });
    }
    else if(!description){
      res.render("admin/addCategory", { admin: true,message :"Please add the discription" });
    }
   else if(!req.files[0]){
      res.render("admin/addCategory", { admin: true,message :"Please upload the image" });
    }
    
    const a = req.files[0].filename;

    const exist = await categoryCls.findOne({ categoryName: categoryName });
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
      res.render("admin/addCategory",{admin:true,addCaty:true});
    }
  } catch (error) {
    res.render("admin/adminError",{admin:true})

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
    res.render("admin/adminError",{admin:true})

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
    res.render("admin/adminError",{admin:true})
  }
};

// get category

const getcategory = async (req, res) => {
  try{
    
    const categories = await categoryCls.find({}).lean();
    res.render("admin/addCategory", { admin: true, categories });
  }
  catch(error){
    res.render("admin/adminError",{admin:true})

  }
};

//category delete

const delID = async (req, res) => {
  try {
    const del = await categoryCls.findByIdAndDelete({ _id: req.params.id });
    res.redirect("/admin/category");
  } catch (error) {
    res.render("admin/adminError",{admin:true})
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
    res.render("admin/adminError",{admin:true})
  }
};

//getcategory

const getEditCategory = async (req, res) => {
  try {
    const ID = req.params.id;
    const category = await categoryCls.findOne({ _id: ID }).lean();
    res.render("admin/editCategory", { admin: true, category });
  } catch (error) {
    res.render("admin/adminError",{admin:true})
  }
};

//getproduct

const getAddProduct = async (req, res) => {
  try {
    const categories = await categoryCls.find().lean();
    res.render("admin/add-products", { admin: true, categories });
  } catch (error) {
    res.render("admin/adminError",{admin:true})
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
    res.render("admin/adminError",{admin:true})
  }
}
// get product

const getproducts = async (req, res) => {
  try {
    const products = await productsCls.find({}).lean();
    res.render("admin/products", { admin: true, products });
  } catch (error) {
    res.render("admin/adminError",{admin:true})
  }
};

// delete product

const delproduct = async (req, res) => {
  try {
    const del = await productsCls.findByIdAndUpdate(
      { _id: req.params.id },
      { $set: { isDelete: false } }
    );
    res.json("delete")
  } catch (error) {
    res.render("admin/adminError",{admin:true})
  }
};

// product details show into the edit page

const editProduct = async (req, res) => {
  try{

    const productId = req.params.id;
    const product = await productsCls.findOne({ _id: productId }).lean();
    const categories = await categoryCls.find().lean();
    res.render("admin/editProduct", { admin: true, product, categories });
  }catch(error){
    res.render("admin/adminError",{admin:true})

  }
};

// edit poroduct

const productEdit = async (req, res) => {
  try{

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
  }catch(error){
    res.render("admin/adminError",{admin:true})

  }
};

// coupons

const coupon = async (req,res)=>{
  try{

    const coupons = await couponCls.find().lean()
    res.render("admin/coupon",{admin:true,coupons})
  }catch(error){
    res.render("admin/adminError",{admin:true})

  }
}

// post/add coupon 

const addCoupon = async(req,res)=>{
  try{

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
  }catch(error){
    res.render("admin/adminError",{admin:true})

  }
}


// edit coupon page 

const editCoupon = async(req,res)=>{
  try{

    const coupon = await couponCls.findOne({_id : req.query.id}).lean()
    res.render("admin/editCoupon",{admin:true,coupon})
  }catch(error){
    res.render("admin/adminError",{admin:true})

  }
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
    res.render("admin/adminError",{admin:true})
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
    res.render("admin/adminError",{admin:true})
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
    res.render("admin/adminError",{admin:true})
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
    res.render("admin/adminError",{admin:true})
  }
}

// create coupon page 

const createCoupon = async (req,res)=>{
  try{

    res.render("admin/createCoupon",{admin:true})
  }catch(error){
    res.render("admin/adminError",{admin:true})
  }
}

// add category

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
    res.render("admin/adminError",{admin:true})
  }
};


const banner = async (req,res)=>{
  try{

    const banners = await bannerCls.find().lean()
    res.render("admin/banner",{admin:true,banners})
  }catch(error){
    res.render("admin/adminError",{admin:true})
  }
}

//bannerDeactive
const bannerDeactive = async (req,res)=>{
  try{
    console.log(req.params.id)
    await bannerCls.findByIdAndUpdate(req.params.id, {
      $set: {  
        status: "ACTIVE",
       },
    })
    .then(()=>{
      res.json("approve")
    })
  }
  catch(error){
    res.render("admin/adminError",{admin:true})
  }
}

// banner activating 

const bannerActive = async (req,res)=>{
  try{
    console.log(req.params)
    await bannerCls.findByIdAndUpdate(req.params.id, {
      $set: { 
        status: "DEACTIVE",
       },
    })
    .then(()=>{
      res.json("approve")
    })

  }
  catch(error){
    res.render("admin/adminError",{admin:true})
  }
}


// banner delete

const deleteBanner = async (req,res)=>{
  try{
    const del = await bannerCls.findByIdAndDelete({ _id: req.params.id})
    .then(()=>{
      res.json("approved")
    })
  }
   catch(error){
    res.render("admin/adminError",{admin:true})
   }
}

// banner edit page 

const editBanner = async(req,res)=>{
  try{

    console.log(req.query.id)
    const editban = await bannerCls.findOne({_id :req.query.id}).lean()
    res.render("admin/editBanner",{admin:true,editban})
  }catch(error){
    res.render("admin/adminError",{admin:true})
  }
}

// createBanner page 
 const createBanner = async (req,res)=>{
  try{

    res.render("admin/createBanner",{admin:true})
  }catch(error){
    res.render("admin/adminError",{admin:true})

  }
}



//postEditBanner

const postEditBanner = async(req,res)=>{
  try{

    console.log(req.body)
    const title = req.body.title;
    const url = req.body.url;
    const Discription =req.body.description
    const a = req.files[0].filename;
    
      let image = [];
      image.push(a);
  
      await bannerCls.findByIdAndUpdate(req.query.id, {
        $set: {  
          Heading: title,
          Url: url,
          Discription: Discription,
          imageUrl:image
         },
      })
      .then(()=>{
       res.redirect("/admin/banner")
      })
  }
  catch(error){
    res.render("admin/adminError",{admin:true})

  }

}

// users orders

const orders = async (req,res)=>{
  try{

    const order = await orderCls.find().populate('products.product').sort({ createdAt: -1 }).lean()
    console.log(order)
    res.render("admin/orders",{admin:true,order})
  }
  catch(error){
    res.render("admin/adminError",{admin:true})

  }
}

// order details of user
const usersOders = async (req,res)=>{
  try{

    const order = await orderCls.findOne({_id :req.query.id}).populate('products.product').lean()
    res.render("admin/userOrderDetails",{admin:true ,order})
  }catch(error){
    res.render("admin/adminError",{admin:true})

  }
}

// order shipping
const shipped = async(req,res)=>{
  try{

    const shipped = await orderCls.findByIdAndUpdate(req.query.id, {
      orderstatus: "shipped",
      track: "shipped",
    });
    res.redirect("/admin/order")
  }catch(error){
    res.render("admin/adminError",{admin:true})

  }
}

// order deliverd successfully
const delivered = async(req,res)=>{
  try{

    const delivered = await orderCls.findByIdAndUpdate(req.query.id, {
      paymentstatus:"Recieved",
      orderstatus: "delivered",
      track: "delivered",
    });
    res.redirect("/admin/order")
  }catch(error){
    res.render("admin/adminError",{admin:true})

  }
}


// order return conforming
const returnOrder = async (req,res)=>{
  try{

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
  }catch(error){
    res.render("admin/adminError",{admin:true})

  }
}

 // product search 
const search = async (req,res)=>{
  try{

    const serch = req.body.q
    console.log(serch)
    const products = await productsCls.find({ name: { $regex: '.*' + serch + '.*', $options: 'i' } }).lean()
    res.render("admin/products", { admin: true, products });
  }
  catch(error){
    res.render("admin/adminError",{admin:true})
  }

}

// product filtering 

const filerProduct = async (req,res)=>{
  try{

    const value = req.query.value
    const products = await productsCls.find({}).sort({price : value}).lean()
    res.render("admin/products", { admin: true, products });
  }catch(error){
    res.render("admin/adminError",{admin:true})

  }
}

// category searching 

const cateSearch = async (req,res)=>{
  try{

    const serch = req.body.q
    console.log(serch)
    const categories = await categoryCls.find({ categoryName: { $regex: '.*' + serch + '.*', $options: 'i' } }).lean()
    res.render("admin/admincategory", { admin: true, categories });
  }
  catch(error){
    res.render("admin/adminError",{admin:true})

  }

}


const adminSalesReport = async(req,res)=>{
  try {
    const salesReport = await orderCls.aggregate([
      {
        $match: { orderstatus: { $eq: "delivered" } },
      },
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" },
            year: { $year: "$createdAt" },
          },
          totalPrice: { $sum: "$totalprice" },
          products: { $sum: { $size: "$products"}},
          count: { $sum: 1 },
        },
      },
      { $sort: { date: -1 } },
    ])
    res.render("admin/salesReport",{admin: true,salesReport})
  }
  catch(error){
    res.render("admin/adminError",{admin:true})
  }
}


const adminSalesReportcancell = async(req,res)=>{
  try {
    const OrderCancel = await orderCls.aggregate([
      {
        $match: { orderstatus: "Order Canceled"  },
      },
      {
        $group: {
          _id: {
            month: { $month: "$updatedAt" },
            day: { $dayOfMonth: "$updatedAt" },
            year: { $year: "$updatedAt" },
          },
          totalPrice: { $sum: "$totalprice" },
          products: { $sum: { $size: "$products"}},
          count: { $sum: 1 },
        },
      },
      { $sort: { date: -1 } },
    ])

    console.log(OrderCancel)
    res.render("admin/cancelReport",{admin: true,OrderCancel})
  }
  catch(error){
    res.render("admin/adminError",{admin:true})
  }
}


// stock report 




const adminMonthReport = async(req,res)=>{
 
    try {
      const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      const salesRep = await orderCls.aggregate([
        { $match: { orderstatus: { $eq: "delivered"} } },
        {
          $group: {
            _id: { month: { $month: "$createdAt"} },
            totalprice: { $sum: "$totalprice" },
            products: { $sum: { $size: "$products"} },
            count: { $sum: 1 },
          },
        },
        {
          $sort: { createdAt: -1 },
        },
      ]);
      console.log(salesRep);
      const newSalesreport = salesRep.map((el) => {
        let newEl = { ...el };
        newEl._id.month = months[newEl._id.month - 1];
        return newEl;
      });
      console.log(newSalesreport)
      console.log(newSalesreport);
      res.render("admin/monthReport", { admin:true,
        salesReport: newSalesreport,
      });
    } catch(error){
      res.render("admin/adminError",{admin:true})
    }
  }


  const adminYearReport=async(req,res)=>{
    try {
      const salesReport = await orderCls.aggregate([
        { $match: { orderstatus: { $eq: "delivered"} } },
        {
          $group: {
            _id: { year: { $year: "$createdAt"} },
            totalprice: { $sum: "$totalprice" },
            products: { $sum: { $size: "$products"} },
            count: { $sum: 1 },
          },
        },
        {
          $sort: { createdAt: -1 },
        },
      ]);
   ;
  
      console.log(salesReport);
      console.log("dfsdfsdf");
  
      res.render("admin/yearReport", {admin:true,salesReport});
    } catch {
      res.render("admin/adminError",{admin:true})
    }
  }

  const stockReport = async (req,res)=>{
       try{
        const productStock = await productsCls.find().lean()
        console.log(productStock,"this is product details in here.....................")
        res.render("admin/stockReport", {admin:true,productStock});
       }
       catch(error){
        res.render("admin/adminError",{admin:true})
      }
  }


  const GetChartDetails = async (req, res) => {
    try{
     console.log("edsfadfsd");
     console.log(req.query.value);
     const value = req.query.value;
     const date = moment().format("DD/MM/YYYY");
     const month = moment().month();
     const year = moment().year();
     console.log(date);
     console.log(month);
     console.log(year);
   
     let sales = [];
     if (value == 365) {
       var currentYear = moment([year]).toDate();
       console.log(currentYear);
       let salesByYear = await orderCls.aggregate([
         {
           $match: {
             createdAt: { $gte: currentYear },
             orderstatus: { $eq: "delivered" },
           },
         },
         {
           $group: {
             _id: {
               $dateToString: { format: "%m", date: "$createdAt" },
             },
             totalprice: { $sum: "$totalprice" },
             count: { $sum: 1 },
           },
         },
         { $sort: { _id: 1 } },
       ]);
       console.log(salesByYear);
       for (let i = 1; i <= 12; i++) {
         console.log(i);
         let result = true;
         for (let k = 0; k < salesByYear.length; k++) {
           console.log("ii");
           result = false;
           if (salesByYear[k]._id == i) {
             sales.push(salesByYear[k]);
             break;
           } else {
             result = true;
           }
         }
         if (result) sales.push({ _id: i, totalprice: 0, count: 0 });
       }
       console.log(sales);
       let salesData = [];
       for (let i = 0; i < sales.length; i++) {
         salesData.push(sales[i].totalprice);
       }
       console.log(salesData,"year sales datas...............................")
       res.json({ status: true, sales: salesData });
     } else if (value == 30) { 
       console.log("fff" + value);
       // let currentWeek=moment()
       // let weekfirstday=currentWeek.clone().startOf('isoweek');
       // console.log(weekfirstday);
       let firstDay = moment().startOf("month").toDate();
       
       let nextweek = moment(firstDay).weekday(7).toDate();
       console.log(firstDay);
       console.log(nextweek);
       for (let i = 1; i <= 5; i++) {
         let abc = {};
         let salesByMonth = await orderCls.aggregate([
           {
             $match: {
               createdAt: { $gte: firstDay, $lt: nextweek },
               orderstatus: { $eq: "delivered" },
             },
           },
           {
             $group: {
               _id: moment(firstDay).format("DD-MM-YYYY"),
               totalprice: { $sum: "$totalprice" },
               count: { $sum: 1 },
             },
           },
         ]);
         if (salesByMonth.length) {
           sales.push(salesByMonth[0]);
         } else {
           (abc._id = moment(firstDay).format("DD-MM-YYYY")), (abc.totalprice = 0);
           abc.count = 0;
           sales.push(abc);
         }
         firstDay = nextweek;
         if (i == 4) {
         } else {
           nextweek = moment(firstDay)
             .weekday(i * 7)
             .toDate();
         }
         console.log(nextweek);
         console.log(salesByMonth);
         console.log(sales);
       }
       let salesData = [];
       for (let i = 0; i < sales.length; i++) {
         salesData.push(sales[i].totalprice);
       }
       console.log(salesData);
       res.json({ status: true, sales: salesData });
     } else if (value == 7) {
       console.log("kkk");
       console.log("dddddd");
       let currentWeek=moment()
       let weekfirstday=currentWeek.clone().startOf('isoweek').toDate()
       
       let firstDay = currentWeek.clone().startOf('isoweek').toDate()
       console.log(weekfirstday);
       let lastDay = moment(firstDay).endOf("day").toDate();
       console.log(firstDay);
       console.log("dddddd");
       console.log(lastDay);
       for (let i = 1; i <= 7; i++) {
         let abc = {};
         let salesByWeek = await orderCls.aggregate([
           {
             $match: {
               createdAt: { $gte: firstDay, $lt: lastDay },
               orderstatus: { $eq: "delivered" },
             },
           },
           {
             $group: {
               _id:  moment(lastDay).format("DD-MM-YYYY"),
               totalprice: { $sum: "$totalprice" },
               count: { $sum: 1 },
             },
           },
         ]);
         if(salesByWeek.length){
           sales.push(salesByWeek[0]);
         }else{
           abc._id =  moment(lastDay).format("DD-MM-YYYY"), (abc.totalprice = 0);
           abc.count = 0;
           sales.push(abc);
   
         }
         firstDay=lastDay;
         lastDay=moment(firstDay).add(1,'days').toDate();
         // moment(firstDay)
         // .weekday(i * 7)
         // .toDate();
         console.log(firstDay);
         console.log("dddddd");
         console.log(lastDay);
         console.log(salesByWeek);
       }
       let salesData=[]
       for (let i = 0; i < sales.length; i++) {
         salesData.push(sales[i].totalprice);
         
       }
       console.log(salesData,"sales data...............................")
       res.json({ status: true, sales: salesData });
  
     }
     console.log(sales);
    }catch{
      res.render("admin/adminError",{admin:true})
    }
   };




  const getPieChartDetails = async(req,res)=>{
    try{
      const cancel = await orderCls.find({ orderstatus: "Order Canceled" }).count()
      const deliverd = await orderCls.find({ orderstatus: "delivered" }).count()
      const confirm = await orderCls.find({ orderstatus: "Order Confirmed" }).count()
      let data =[];
      data.push(cancel)
      data.push(confirm)
      
      data.push(deliverd)
      console.log(data);
      res.json({ data});
    }catch{
      res.render("admin/adminError",{admin:true})
    }
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
  postBanner,
  banner,
  deleteBanner,
  bannerActive,
  bannerDeactive,
  editBanner,
  postEditBanner,
  createBanner,
  createCoupon,
  search,
  filerProduct,
  cateSearch,
  adminSalesReport,
  adminMonthReport,
  adminYearReport,
  adminSalesReportcancell,
  getPieChartDetails,
  GetChartDetails,
  stockReport
};
