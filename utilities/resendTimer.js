var timeleft = 30;
var downloadTimer = setInterval(function() {
    if (timeleft <= 0) {
        clearInterval(downloadTimer);
        document.getElementById("resend").style.display = "block";
        document.getElementById("countdown").innerHTML = " Resend your OTP ";
    } else {
        document.getElementById("countdown").innerHTML = timeleft + " seconds remaining";
    }
    timeleft -= 1;
}, 1000);

var myLink = document.querySelector('a[href="#"]');
myLink.addEventListener("click", function(e) {
    e.preventDefault();
});