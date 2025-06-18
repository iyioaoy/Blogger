/**
 * 用户认证状态管理模块
 * 功能：
 * 1. 检查用户登录状态
 * 2. 更新用户界面显示
 * 3. 处理用户注销
 * 4. 管理用户头像缓存
 */

// 配置常量
const CONFIG = {
  selectors: {
    loggedIn: '.isLogin',
    loggedOut: '.notLogin',
    userName: '.data-name',
    userStatus: '.data-status',
    userPhone: '.data-phone',
    userEmail: '.data-email',
    accountType: '.data-tipeAkun',
    userWebsite: '.data-website',
    premiumAccount: '.data-premiumAcc',
    premiumExpiry: '.data-expired',
    premiumPackage: '.data-paketPremium',
    userProfileImage: '.userProfil',
    premiumLinks: '.linkPremium',
    premiumUserElements: '.userPremium'
  },
  storageKeys: {
    profileImage: 'userProfileImage',
    userData: 'user'
  },
  defaultValues: {
    name: 'Belum diatur',
    status: 'Member',
    phone: 'Belum diatur',
    email: 'Tidak tersedia',
    accountType: 'Publik',
    website: 'Belum diatur',
    premium: 'Non Premium',
    package: 'Basic',
    expiry: 'Tidak tersedia'
  },
  paths: {
    users: 'users/'
  }
};

/**
 * 检查并更新登录状态
 */
function checkLoginStatus() {
  // 监听认证状态变化
  auth.onAuthStateChanged(user => {
    if (user && user.emailVerified) {
      handleLoggedInUser(user);
    } else {
      handleLoggedOutUser();
    }
  });

  // 加载缓存的用户头像
  loadSavedProfileImage();
}

/**
 * 处理已登录用户
 * @param {Object} user Firebase用户对象
 */
function handleLoggedInUser(user) {
  // 显示登录状态的UI元素
  toggleLoginElements(true);
  
  // 从数据库获取用户详细信息
  database.ref(`${CONFIG.paths.users}${user.uid}`).once('value').then(snapshot => {
    const userData = snapshot.val();
    
    if (userData) {
      // 更新用户信息显示
      updateUserInfoDisplay(userData);
      
      // 处理用户头像
      handleProfileImage(userData.image);
      
      // 处理Premium会员状态
      handlePremiumStatus(userData);
    }
  });
}

/**
 * 处理未登录用户
 */
function handleLoggedOutUser() {
  // 隐藏登录状态元素，显示未登录元素
  toggleLoginElements(false);
  
  // 清除缓存的用户头像
  localStorage.removeItem(CONFIG.storageKeys.profileImage);
  
  // 重置所有头像元素
  document.querySelectorAll(CONFIG.selectors.userProfileImage).forEach(img => {
    img.src = '';
  });
}

/**
 * 切换登录/未登录UI元素
 * @param {boolean} isLoggedIn 是否已登录
 */
function toggleLoginElements(isLoggedIn) {
  // 显示/隐藏登录状态元素
  document.querySelectorAll(CONFIG.selectors.loggedIn).forEach(el => {
    el.style.display = isLoggedIn ? 'block' : 'none';
  });
  
  // 显示/隐藏未登录元素
  document.querySelectorAll(CONFIG.selectors.loggedOut).forEach(el => {
    el.style.display = isLoggedIn ? 'none' : 'block';
  });
}

/**
 * 更新用户信息显示
 * @param {Object} userData 用户数据对象
 */
function updateUserInfoDisplay(userData) {
  // 更新基本信息
  updateElementText(CONFIG.selectors.userName, userData.name);
  updateElementText(CONFIG.selectors.userStatus, userData.status);
  updateElementText(CONFIG.selectors.userPhone, userData.phone);
  updateElementText(CONFIG.selectors.userEmail, userData.email);
  updateElementText(CONFIG.selectors.accountType, userData.tipeAkun);
  updateElementText(CONFIG.selectors.userWebsite, userData.website);
  
  // 更新Premium信息
  updateElementText(
    CONFIG.selectors.premiumAccount, 
    userData.premiumAcc ? 'Premium' : 'Non Premium'
  );
  updateElementText(CONFIG.selectors.premiumExpiry, userData.expired);
  updateElementText(CONFIG.selectors.premiumPackage, userData.paketPremium);
}

/**
 * 更新DOM元素的文本内容
 * @param {string} selector 选择器
 * @param {string} value 值
 * @param {string} defaultValue 默认值
 */
function updateElementText(selector, value, defaultValue) {
  const fallbackValue = defaultValue || CONFIG.defaultValues[selector.split('-')[1]] || '';
  document.querySelectorAll(selector).forEach(el => {
    el.textContent = value || fallbackValue;
  });
}

/**
 * 处理用户头像
 * @param {string} imageUrl 头像URL
 */
function handleProfileImage(imageUrl) {
  if (imageUrl) {
    // 保存到本地存储
    localStorage.setItem(CONFIG.storageKeys.profileImage, imageUrl);
    
    // 更新所有头像元素
    document.querySelectorAll(CONFIG.selectors.userProfileImage).forEach(img => {
      img.src = imageUrl;
    });
  }
}

/**
 * 处理Premium会员状态
 * @param {Object} userData 用户数据
 */
function handlePremiumStatus(userData) {
  const today = new Date().toISOString().split('T')[0];
  const isPremiumActive = userData.premiumAcc && 
                         userData.expired && 
                         userData.expired >= today;
  
  // 更新Premium用户专属元素的显示
  document.querySelectorAll(CONFIG.selectors.premiumUserElements).forEach(el => {
    el.style.display = isPremiumActive ? 'block' : 'none';
  });
  
  // 更新Premium链接
  updatePremiumLinks(isPremiumActive);
}

/**
 * 更新Premium相关链接
 * @param {boolean} isPremiumActive 是否是有效Premium会员
 */
function updatePremiumLinks(isPremiumActive) {
  document.querySelectorAll(CONFIG.selectors.premiumLinks).forEach(link => {
    const premiumUrl = link.getAttribute('data-premium-href');
    const regularUrl = link.getAttribute('data-nonpremium-href');
    
    if (isPremiumActive && premiumUrl) {
      link.setAttribute('href', premiumUrl);
    } else if (regularUrl) {
      link.setAttribute('href', regularUrl);
    }
  });
}

/**
 * 加载保存的用户头像
 */
function loadSavedProfileImage() {
  const savedImage = localStorage.getItem(CONFIG.storageKeys.profileImage);
  if (savedImage) {
    document.querySelectorAll(CONFIG.selectors.userProfileImage).forEach(img => {
      img.src = savedImage;
    });
  }
}

/**
 * 注销用户
 */
function logoutUser() {
  firebase.auth().signOut()
    .then(() => {
      alert(igneliusLoginJS.messages);
      // 清除本地存储
      localStorage.removeItem(CONFIG.storageKeys.userData);
      localStorage.removeItem(CONFIG.storageKeys.profileImage);
      // 重定向
      window.location.href = igneliusLoginJS.logoutRedirect;
    })
    .catch(() => {
      alert(igneliusLoginJS.logoutGagal);
    });
}

// 初始化检查登录状态
checkLoginStatus();
