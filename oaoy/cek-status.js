function cekStatusLogin() {
  // 监听用户认证状态变化
  auth.onAuthStateChanged(function(user) {
    // 用户已登录且邮箱已验证
    if (user && user.emailVerified) {
      // 显示已登录状态的UI元素
      document.querySelectorAll(".belumLog").forEach(function(element) {
        element.classList.remove('hidden');
      });
      
      // 隐藏未登录状态的UI元素
      document.querySelectorAll(".sudahLog").forEach(function(element) {
        element.classList.add('hidden');
      });

      // 获取用户ID并查询用户数据
      var userId = user.uid;
      database.ref("users/" + userId).once("value").then(function(snapshot) {
        var userData = snapshot.val();
        
        if (userData) {
          // 更新用户姓名显示
          document.querySelectorAll(".data-name").forEach(function(el) {
            el.textContent = userData.name || "Belum diatur"; // 默认显示"未设置"
          });
          
          // 更新用户状态显示
          document.querySelectorAll(".data-status").forEach(function(el) {
            el.textContent = userData.status || "Member"; // 默认显示"会员"
          });
          
          // 更新用户电话显示
          document.querySelectorAll(".data-phone").forEach(function(el) {
            el.textContent = userData.phone || "Belum diatur"; // 默认显示"未设置"
          });
          
          // 更新会员类型显示
          document.querySelectorAll(".data-premiumAcc").forEach(function(el) {
            el.textContent = userData.premiumAcc ? "Premium" : "Non Premium"; // 显示"高级"或"普通"
          });
          
          // 更新邮箱显示
          document.querySelectorAll(".data-email").forEach(function(el) {
            el.textContent = userData.email || "Tidak tersedia"; // 默认显示"不可用"
          });
          
          // 更新过期时间显示
          document.querySelectorAll(".data-expired").forEach(function(el) {
            el.textContent = userData.expired || "Tidak tersedia"; // 默认显示"不可用"
          });
          
          
          // 更新会员套餐显示
          document.querySelectorAll(".data-paketPremium").forEach(function(el) {
            el.textContent = userData.paketPremium || "Basic"; // 默认显示"基础版"
          });

          // 如果有用户头像，更新头像显示
          if (userData.image) {
            // 将头像URL保存到本地存储
            localStorage.setItem("userProfileImage", userData.image);
            // 更新所有头像元素
            document.querySelectorAll(".userProfil").forEach(function(img) {
              img.src = userData.image;
            });
          }

          // 检查会员状态是否有效
          var today = new Date().toISOString().split("T")[0]; // 获取当前日期
          var isPremium = userData.premiumAcc && userData.expired && userData.expired >= today;
          
          // 如果是有效的高级会员，隐藏某些元素
          if (isPremium) {
            document.querySelectorAll(".userPremium").forEach(function(el) {
              el.style.display = "none";
            });
          }
          
          // 更新高级会员专属链接
          document.querySelectorAll(".linkPremium").forEach(function(link) {
            var premiumHref = link.getAttribute("data-premium-href"); // 高级会员链接
            var nonPremiumHref = link.getAttribute("data-nonpremium-href"); // 普通会员链接
            
            // 根据会员状态设置正确的链接
            if (isPremium && premiumHref) {
              link.setAttribute("href", premiumHref);
            } else if (nonPremiumHref) {
              link.setAttribute("href", nonPremiumHref);
            }
          });
        }
      });
    } else {
      // 用户未登录或邮箱未验证的处理逻辑
      
      // 隐藏已登录状态的UI元素
      document.querySelectorAll(".isLogin").forEach(function(element) {
        element.style.display = "none";
      });
      
      // 显示未登录状态的UI元素
      document.querySelectorAll(".notLogin").forEach(function(element) {
        element.style.display = "block";
      });
      
      // 清除头像显示
      document.querySelectorAll(".userProfil").forEach(function(img) {
        img.src = "";
      });
      
      // 从本地存储中移除头像
      localStorage.removeItem("userProfileImage");
    }
  });
}

/**
 * 用户登出函数
 */
function logoutUser() {
  // 调用Firebase登出方法
  firebase.auth().signOut().then(function() {
    // 登出成功处理
    alert(igneliusLoginJS.logoutSukses); // 显示成功消息
    localStorage.removeItem("user"); // 清除用户数据
    localStorage.removeItem("userProfileImage"); // 清除头像
    window.location.href = igneliusLoginJS.loginPage; // 跳转到登录页
  }).catch(function() {
    // 登出失败处理
    alert(igneliusLoginJS.logoutGagal); // 显示失败消息
  });
}

// 页面加载时检查本地存储中是否有保存的头像
var savedProfileImage = localStorage.getItem("userProfileImage");
if (savedProfileImage) {
  // 如果找到保存的头像，更新所有头像元素
  document.querySelectorAll(".userProfil").forEach(function(img) {
    img.src = savedProfileImage;
  });
}

// 初始化登录状态检查
cekStatusLogin();
