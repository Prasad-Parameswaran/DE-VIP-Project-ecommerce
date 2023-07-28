const  express = require("express");
const  router = express.Router();
const  adminClr = require("../controller/adminController");
const  adminSession = require("../middleware/adminSession")


router.get("/",adminClr.adminLog);
router.get("/adminhome",adminSession.login,adminClr.getAdminHome);
router.get("/addCategory",adminSession.login, adminClr.getcategory);
router.get("/category",adminSession.login, adminClr.getAdminCategory);
router.get("/customers",adminSession.login, adminClr.customer);
router.get("/block/:id",adminSession.login, adminClr.blcok);
router.get("/unblock/:id",adminSession.login, adminClr.unblcok);
router.get("/unlist/:id",adminSession.login, adminClr.unlist);
router.get("/list/:id",adminSession.login, adminClr.list);
router.get("/delete/:id",adminSession.login, adminClr.delID);
router.get("/edit/:id",adminSession.login, adminClr.getEditCategory);
router.get("/products",adminSession.login, adminClr.getproducts);
router.get("/add-products",adminSession.login, adminClr.getAddProduct);
router.get("/pDelete/:id",adminSession.login, adminClr.delproduct);
router.get("/pEdit/:id",adminSession.login, adminClr.editProduct);
router.get("/order",adminClr.orders)
router.get("/usersOders",adminClr.usersOders)
router.get("/shipped",adminClr.shipped)
router.get("/returnOrder",adminClr.returnOrder)
router.get("/delivered",adminClr.delivered)
router.get("/createCoupon",(req,res)=>{
    res.render("admin/createCoupon",{admin:true})
})
router.get("/coupon",adminClr.coupon)
router.get("/editCoupon",adminClr.editCoupon)
router.get("/deleteCoupon/:id",adminClr.deleteCoupon)
router.get("/couponActive/:id",adminClr.CouponActive)
router.get("/couponDeactive/:id",adminClr.CouponDeactive)
router.get("/banner",(req,res)=>{
    res.render("admin/banner",{admin:true})
})





router.post("/postBanner",adminClr.postBanner)
router.post("/postCoupon",adminClr.postEditCoupon)
router.post("/addCoupon",adminClr.addCoupon)
router.post("/addCategory",adminSession.login, adminClr.postAdminAddCategory);
router.post("/adminhome", adminClr.adminlog);
router.post("/editCategory/:id",adminSession.login, adminClr.postEditID);
router.post("/addProducts",adminSession.login, adminClr.addProduct);
router.post("/editProducts/:id",adminSession.login, adminClr.productEdit);


module.exports = router;


















// const upload = multer({ dest: "uploads/" });
