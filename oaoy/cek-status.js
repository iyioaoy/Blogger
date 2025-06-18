function cekStatusLogin() {
  auth.onAuthStateChanged(function(user) {
    if (user && user.emailVerified) {
      document.querySelectorAll(".isLogin").forEach(function(element) {
        element.style.display = "block";
      });
      
      document.querySelectorAll(".notLogin").forEach(function(element) {
        element.style.display = "none";
      });

      var userId = user.uid;
      database.ref("users/" + userId).once("value").then(function(snapshot) {
        var userData = snapshot.val();
        
        if (userData) {
          // 更新用户信息显示 - 提取重复操作为函数
          function updateField(selector, value, defaultValue) {
            document.querySelectorAll(selector).forEach(function(el) {
              el.textContent = value || defaultValue;
            });
          }
          
          updateField(".data-name", userData.name, "Belum diatur");
          updateField(".data-status", userData.status, "Member");
          updateField(".data-phone", userData.phone, "Belum diatur");
          updateField(".data-email", userData.email, "Tidak tersedia");
          updateField(".data-expired", userData.expired, "Tidak tersedia");
          updateField(".data-tipeAkun", userData.tipeAkun, "Publik");
          updateField(".data-website", userData.website, "Belum diatur");
          updateField(".data-paketPremium", userData.paketPremium, "Basic");
          
          // 会员状态显示
          document.querySelectorAll(".data-premiumAcc").forEach(function(el) {
            el.textContent = userData.premiumAcc ? "Premium" : "Non Premium";
          });

          // 更新头像
          if (userData.image) {
            localStorage.setItem("userProfileImage", userData.image);
            document.querySelectorAll(".userProfil").forEach(function(img) {
              img.src = userData.image;
            });
          }

          // 处理高级会员状态 - 提取日期判断逻辑
          var today = new Date().toISOString().split("T")[0];
          var isPremiumValid = userData.premiumAcc && userData.expired && userData.expired >= today;
          
          // 高级会员元素显示控制
          document.querySelectorAll(".userPremium").forEach(function(el) {
            el.style.display = isPremiumValid ? "none" : "block";
          });
          
          // 高级链接处理 - 提取链接获取逻辑
          document.querySelectorAll(".linkPremium").forEach(function(link) {
            var premiumHref = link.getAttribute("data-premium-href");
            var nonPremiumHref = link.getAttribute("data-nonpremium-href");
            
            if (isPremiumValid && premiumHref) {
              link.setAttribute("href", premiumHref);
            } else if (nonPremiumHref) {
              link.setAttribute("href", nonPremiumHref);
            }
          });
        }
      });
    } else {
      document.querySelectorAll(".isLogin").forEach(function(element) {
        element.style.display = "none";
      });
      
      document.querySelectorAll(".notLogin").forEach(function(element) {
        element.style.display = "block";
      });
      
      document.querySelectorAll(".userProfil").forEach(function(img) {
        img.src = "";
      });
      
      localStorage.removeItem("userProfileImage");
    }
  });
}

function logoutUser() {
  firebase.auth().signOut().then(function() {
    alert(igneliusLoginJS.logoutSukses);
    localStorage.removeItem("user");
    localStorage.removeItem("userProfileImage");
    window.location.href = igneliusLoginJS.loginPage;
  }).catch(function() {
    alert(igneliusLoginJS.logoutGagal);
  });
}

var savedProfileImage = localStorage.getItem("userProfileImage");
if (savedProfileImage) {
  document.querySelectorAll(".userProfil").forEach(function(img) {
    img.src = savedProfileImage;
  });
}

cekStatusLogin();
