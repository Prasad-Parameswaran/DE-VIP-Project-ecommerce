const express = require("express");
const router = express.Router();
const adminClr = require("../controller/adminController");
const adminSession = require("../middleware/adminSession");
const { upload } = require("../utilities/multer.js")


router.get("/", adminClr.adminLog);
router.get("/adminhome", adminSession.login, adminClr.getAdminHome);
router.get("/addCategory", adminSession.login, adminClr.getcategory);
router.get("/category", adminSession.login, adminClr.getAdminCategory);
router.get("/customers", adminSession.login, adminClr.customer);
router.get("/block/:id", adminSession.login, adminClr.blcok);
router.get("/unblock/:id", adminSession.login, adminClr.unblcok);
router.get("/unlist/:id", adminSession.login, adminClr.unlist);
router.get("/list/:id", adminSession.login, adminClr.list);
router.get("/delete/:id", adminSession.login, adminClr.delID);
router.get("/edit/:id", adminSession.login, adminClr.getEditCategory);
router.get("/products", adminSession.login, adminClr.getproducts);
router.get("/add-products", adminSession.login, adminClr.getAddProduct);
router.get("/pDelete/:id", adminSession.login, adminClr.delproduct);
router.get("/pEdit/:id", adminSession.login, adminClr.editProduct);
router.get("/order", adminSession.login, adminClr.orders);
router.get("/usersOders", adminSession.login, adminClr.usersOders);
router.get("/shipped", adminSession.login, adminClr.shipped);
router.get("/returnOrder", adminSession.login, adminClr.returnOrder);
router.get("/delivered", adminSession.login, adminClr.delivered);
router.get("/createCoupon", adminSession.login, adminClr.createCoupon);
router.get("/coupon", adminSession.login, adminClr.coupon);
router.get("/editCoupon", adminSession.login, adminClr.editCoupon);
router.get("/deleteCoupon/:id", adminSession.login, adminClr.deleteCoupon);
router.get("/couponActive/:id", adminSession.login, adminClr.CouponActive);
router.get("/couponDeactive/:id", adminSession.login, adminClr.CouponDeactive);
router.get("/createBanner", adminSession.login, adminClr.createBanner);
router.get("/banner", adminSession.login, adminClr.banner);
router.get("/bannerDeactive/:id", adminSession.login, adminClr.bannerDeactive);
router.get("/bannerActive/:id", adminSession.login, adminClr.bannerActive);
router.get("/deleteBanner/:id", adminSession.login, adminClr.deleteBanner);
router.get("/editBanner", adminSession.login, adminClr.editBanner);
router.get("/prodSort", adminSession.login, adminClr.filerProduct);
router.get("/salesReport", adminSession.login, adminClr.adminSalesReport)
router.get("/cancelReport", adminSession.login, adminClr.adminSalesReportcancell)
router.get("/monthReport", adminSession.login, adminClr.adminMonthReport)
router.get("/yearReport", adminSession.login, adminClr.adminYearReport)
router.get("/stockReport", adminSession.login, adminClr.stockReport)
router.get("/pieChart", adminSession.login, adminClr.getPieChartDetails)
router.get("/ChartDetails", adminSession.login, adminClr.GetChartDetails)

router.post("/productSearch", adminSession.login, adminClr.search);
router.post("/cateSearch", adminSession.login, adminClr.cateSearch);
router.post("/postEditBanner", adminSession.login, upload, adminClr.postEditBanner);
router.post("/postBanner", adminSession.login, upload, adminClr.postBanner);
router.post("/postCoupon", adminSession.login, adminClr.postEditCoupon);
router.post("/addCoupon", adminSession.login, adminClr.addCoupon);
router.post("/addCategory", adminSession.login, upload, adminClr.postAdminAddCategory);
router.post("/adminhome", adminClr.adminlog);
router.post("/editCategory/:id", adminSession.login, upload, adminClr.postEditID);
router.post("/addProducts", adminSession.login, upload, adminClr.addProduct);
router.post("/editProducts/:id", adminSession.login, upload, adminClr.productEdit);

module.exports = router;















// const upload = multer({ dest: "uploads/" });
