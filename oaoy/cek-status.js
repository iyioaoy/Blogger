// 初始化Firebase（优化：使用const替代var）
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();

// DOM元素选择器常量（优化：提取常用选择器）
const SELECTORS = {
  LOGGED_IN: ".isLogin",
  LOGGED_OUT: ".notLogin",
  PROFILE_IMG: ".userProfil",
  PREMIUM_LINK: ".linkPremium",
  USER_PREMIUM: ".userPremium",
  DATA_FIELDS: {
    NAME: ".data-name",
    STATUS: ".data-status",
    PHONE: ".data-phone",
    PREMIUM: ".data-premiumAcc",
    EMAIL: ".data-email",
    EXPIRED: ".data-expired",
    ACCOUNT_TYPE: ".data-tipeAkun",
    WEBSITE: ".data-website",
    PACKAGE: ".data-paketPremium"
  }
};

// 默认值常量（优化：集中管理默认值）
const DEFAULT_VALUES = {
  NAME: "Belum diatur",
  STATUS: "Member",
  PHONE: "Belum diatur",
  EMAIL: "Tidak tersedia",
  EXPIRED: "Tidak tersedia",
  ACCOUNT_TYPE: "Publik",
  WEBSITE: "Belum diatur",
  PACKAGE: "Basic",
  PREMIUM_TEXT: "Premium",
  NON_PREMIUM_TEXT: "Non Premium"
};

/**
 * 更新元素内容（优化：提取公共函数）
 * @param {string} selector - 选择器
 * @param {string} value - 值
 * @param {string} [defaultValue=""] - 默认值
 */
function updateElements(selector, value, defaultValue = "") {
  document.querySelectorAll(selector).forEach(el => {
    el.textContent = value || defaultValue;
  });
}

function cekStatusLogin() {
  auth.onAuthStateChanged(user => {
    const isLoggedIn = user && user.emailVerified;
    
    // 更新UI可见性（优化：提取逻辑）
    document.querySelectorAll(SELECTORS.LOGGED_IN).forEach(el => {
      el.style.display = isLoggedIn ? "block" : "none";
    });
    document.querySelectorAll(SELECTORS.LOGGED_OUT).forEach(el => {
      el.style.display = isLoggedIn ? "none" : "block";
    });

    if (isLoggedIn) {
      const userId = user.uid;
      database.ref("users/" + userId).once("value").then(snapshot => {
        const userData = snapshot.val();
        
        if (userData) {
          // 更新用户数据（优化：使用常量）
          updateElements(SELECTORS.DATA_FIELDS.NAME, userData.name, DEFAULT_VALUES.NAME);
          updateElements(SELECTORS.DATA_FIELDS.STATUS, userData.status, DEFAULT_VALUES.STATUS);
          updateElements(SELECTORS.DATA_FIELDS.PHONE, userData.phone, DEFAULT_VALUES.PHONE);
          updateElements(SELECTORS.DATA_FIELDS.EMAIL, userData.email, DEFAULT_VALUES.EMAIL);
          updateElements(SELECTORS.DATA_FIELDS.EXPIRED, userData.expired, DEFAULT_VALUES.EXPIRED);
          updateElements(SELECTORS.DATA_FIELDS.ACCOUNT_TYPE, userData.tipeAkun, DEFAULT_VALUES.ACCOUNT_TYPE);
          updateElements(SELECTORS.DATA_FIELDS.WEBSITE, userData.website, DEFAULT_VALUES.WEBSITE);
          updateElements(SELECTORS.DATA_FIELDS.PACKAGE, userData.paketPremium, DEFAULT_VALUES.PACKAGE);
          
          // 更新会员状态
          updateElements(
            SELECTORS.DATA_FIELDS.PREMIUM, 
            userData.premiumAcc ? DEFAULT_VALUES.PREMIUM_TEXT : DEFAULT_VALUES.NON_PREMIUM_TEXT
          );

          // 更新头像
          if (userData.image) {
            localStorage.setItem("userProfileImage", userData.image);
            document.querySelectorAll(SELECTORS.PROFILE_IMG).forEach(img => {
              img.src = userData.image;
            });
          }

          // 处理高级会员状态（优化：提取逻辑）
          const today = new Date().toISOString().split("T")[0];
          const isPremiumValid = userData.premiumAcc && userData.expired && userData.expired >= today;
          
          document.querySelectorAll(SELECTORS.USER_PREMIUM).forEach(el => {
            el.style.display = isPremiumValid ? "none" : "block";
          });
          
          document.querySelectorAll(SELECTORS.PREMIUM_LINK).forEach(link => {
            const premiumHref = link.getAttribute("data-premium-href");
            const nonPremiumHref = link.getAttribute("data-nonpremium-href");
            
            if (isPremiumValid && premiumHref) {
              link.setAttribute("href", premiumHref);
            } else if (nonPremiumHref) {
              link.setAttribute("href", nonPremiumHref);
            }
          });
        }
      });
    } else {
      // 清除未登录用户数据
      document.querySelectorAll(SELECTORS.PROFILE_IMG).forEach(img => {
        img.src = "";
      });
      localStorage.removeItem("userProfileImage");
    }
  });
}

function logoutUser() {
  auth.signOut().then(() => {
    alert(igneliusLoginJS.logoutSukses);
    localStorage.removeItem("user");
    localStorage.removeItem("userProfileImage");
    window.location.href = igneliusLoginJS.loginPage;
  }).catch(() => {
    alert(igneliusLoginJS.logoutGagal);
  });
}

// 初始化：加载保存的头像（优化：使用常量选择器）
const savedProfileImage = localStorage.getItem("userProfileImage");
if (savedProfileImage) {
  document.querySelectorAll(SELECTORS.PROFILE_IMG).forEach(img => {
    img.src = savedProfileImage;
  });
}

// 启动登录状态检查
cekStatusLogin();
