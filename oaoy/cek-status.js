/**
 * 检查用户登录状态并更新UI
 * 监听用户认证状态变化，根据状态显示/隐藏元素，并获取用户数据
 */
function cekStatusLogin() {
  // 监听用户认证状态变化
  auth.onAuthStateChanged(function(user) {
    // 如果用户已登录且邮箱已验证
    if (user && user.emailVerified) {
      // 获取用户ID
      var userId = user.uid;
      // 从数据库获取用户数据
      database.ref("users/" + userId).once("value").then(function(snapshot) {
        var userData = snapshot.val();
        
        // 如果存在用户数据
        if (userData) {
          /**
           * 更新页面字段的通用函数
           * @param {string} selector - CSS选择器
           * @param {string} value - 要显示的值
           * @param {string} defaultValue - 默认值（当value为空时使用）
           */
          function updateField(selector, value, defaultValue) {
            document.querySelectorAll(selector).forEach(function(el) {
              el.textContent = value || defaultValue;
            });
          }
          
          // 更新各个用户信息字段
          updateField(".data-name", userData.name, "Belum diatur");           // 用户名
          updateField(".data-status", userData.status, "Member");              // 用户状态
          updateField(".data-phone", userData.phone, "Belum diatur");          // 电话
          updateField(".data-email", userData.email, "Tidak tersedia");        // 邮箱
          updateField(".data-expired", userData.expired, "Tidak tersedia");    // 会员到期日
          updateField(".data-tipeAkun", userData.tipeAkun, "Publik");          // 账户类型
          updateField(".data-website", userData.website, "Belum diatur");     // 网站
          updateField(".data-paketPremium", userData.paketPremium, "Basic");  // 套餐类型
          
          // 更新会员状态显示
          document.querySelectorAll(".data-premiumAcc").forEach(function(el) {
            el.textContent = userData.premiumAcc ? "Premium" : "Non Premium";
          });

          // 更新用户头像
          if (userData.image) {
            // 将头像URL保存到本地存储
            localStorage.setItem("userProfileImage", userData.image);
            // 更新所有头像元素
            document.querySelectorAll(".userProfil").forEach(function(img) {
              img.src = userData.image;
            });
          }

          // 检查会员状态是否有效
          var today = new Date().toISOString().split("T")[0];  // 获取当前日期(YYYY-MM-DD)
          // 判断是否为有效的高级会员：有高级会员标志且未过期
          var isPremiumValid = userData.premiumAcc && userData.expired && userData.expired >= today;
          
          // 控制高级会员相关元素的显示
          document.querySelectorAll(".userPremium").forEach(function(el) {
            el.style.display = isPremiumValid ? "none" : "block";
          });
          
          // 处理高级链接
          document.querySelectorAll(".linkPremium").forEach(function(link) {
            var premiumHref = link.getAttribute("data-premium-href");      // 高级会员链接
            var nonPremiumHref = link.getAttribute("data-nonpremium-href");// 普通会员链接
            
            // 根据会员状态设置链接地址
            if (isPremiumValid && premiumHref) {
              link.setAttribute("href", premiumHref);
            } else if (nonPremiumHref) {
              link.setAttribute("href", nonPremiumHref);
            }
          });
        }
      });
    } else {
      // 用户未登录时的处理      
      // 清除头像
      document.querySelectorAll(".userProfil").forEach(function(img) {
        img.src = "";
      });
      
      // 从本地存储中移除头像
      localStorage.removeItem("userProfileImage");
    }
  });
}

/**
 * 用户登出功能
 * 调用Firebase登出API，清除本地数据并重定向到登录页
 */
function logoutUser() {
  firebase.auth().signOut().then(function() {
    // 登出成功处理
    alert(igneliusLoginJS.logoutSukses);                  // 显示成功提示
    localStorage.removeItem("user");                     // 清除本地用户数据
    localStorage.removeItem("userProfileImage");         // 清除本地头像
    window.location.href = igneliusLoginJS.loginPage;    // 跳转到登录页
  }).catch(function() {
    // 登出失败处理
    alert(igneliusLoginJS.logoutGagal);                  // 显示失败提示
  });
}

// 页面加载时检查本地存储中的头像
var savedProfileImage = localStorage.getItem("userProfileImage");
if (savedProfileImage) {
  // 如果存在保存的头像，更新所有头像元素
  document.querySelectorAll(".userProfil").forEach(function(img) {
    img.src = savedProfileImage;
  });
}

// 初始检查登录状态
cekStatusLogin();
