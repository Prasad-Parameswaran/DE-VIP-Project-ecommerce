const express = require("express");
const router = express.Router();
const userClr = require("../controller/userController");
const session = require("../middleware/session")



router.get("/",session.isBlock,userClr.home);
router.get("/login", userClr.login);
router.get("/logout", userClr.logout);
router.get("/registration",userClr.getRegistration);
router.get("/account-profile",session.login,session.isBlock, userClr.userProfile);
router.get("/account-address",session.isBlock,session.login, userClr.userAdress);
router.get("/account-orders",session.isBlock,session.login,userClr.orders)
router.get("/resendotp", userClr.getResendOtp);
router.get("/resendotp", userClr.getResendOtp);
router.get("/products",session.isBlock, userClr.getProducts);
router.get("/forgotPass", userClr.forgotPass);
router.get("/category/:categoryName",session.isBlock, userClr.findCategory);
router.get("/shop-product-detail/:id",session.isBlock,userClr.productDetails);
router.get("/otp",userClr.getOtp);
router.get("/conformPass",userClr.getConformPass);
router.get("/get", userClr.sessionchecker);
router.get("/cart",session.isBlock,session.login,userClr.cartview)
router.get("/shop-cart",session.isBlock,session.login,userClr.shopCart)
router.get("/updation",session.isBlock,session.login,userClr.qUpdation)
router.get("/cartDelete",session.isBlock,session.login,userClr.deleteCart)
router.get("/getEdit",session.isBlock,session.login,userClr.getEdit)
router.get("/deleteAddress",session.isBlock,userClr.deleteAddress)
router.get("/check" ,userClr.getCheckout)
router.get("/orderDetails",userClr.orderDetails)
router.get("/cancelOrder/:id",userClr.cancelOrder)
router.get("/orderRtrn/:id",userClr.orderRtrn)


router.post("/verifyotp", userClr.otp);
router.post("/forgotPass", userClr.PostForgotPass);
router.post("/varfyOtp", userClr.varfyOtp);
router.post("/conformPass", userClr.postConformPass);
router.post("/registration", userClr.PostRegistration);
router.post("/home",session.isBlock,userClr.userHome);
router.post("/profileEdit",session.isBlock,session.login,userClr.profileUpdate)
router.post("/addAddress",session.isBlock,session.login,userClr.addAdress)
router.post("/editAddress",session.isBlock,session.login,userClr.postEditAddress)
router.post("/check",userClr.placeOrder)




module.exports = router;
