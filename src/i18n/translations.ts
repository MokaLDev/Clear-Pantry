export type Language = 'en' | 'zh' | 'es';

export const translations = {
  en: {
    common: {
      days: {
        mon: 'MON',
        tue: 'TUE',
        wed: 'WED',
        thu: 'THU',
        fri: 'FRI',
        sat: 'SAT',
        sun: 'SUN'
      },
      remaining: '{value}% REMAINING',
      units: {
        g: 'g',
        ml: 'ml',
        pcs: 'pcs'
      },
      categories: {
        pantry: 'Pantry',
        fridge: 'Fridge'
      },
      risk: {
        low: 'Low',
        medium: 'Medium',
        high: 'High'
      },
      status: {
        critical: 'CRITICAL',
        stable: 'STABLE',
        normal: 'NORMAL',
        restock: 'RESTOCK'
      },
      methods: {
        opticalAi: 'OPTICAL AI',
        manual: 'MANUAL'
      }
    },
    app: {
      home: 'HOME',
      analyze: 'ANALYZE',
      pantry: 'PANTRY',
      settings: 'SETTINGS',
      loadingKitchenData: 'LOADING KITCHEN DATA'
    },
    welcome: {
      systemVersion: 'CLEAR-PANTRY SYSTEM v0.92',
      active: 'ACTIVE',
      systemReady: '[SYSTEM_READY]',
      title: "Welcome to your kitchen's new nervous system.",
      subtitle: 'Precision inventory tracking and culinary intelligence, quietly managing your essentials so you can focus on the craft.',
      getStarted: 'GET STARTED',
      learnMore: 'LEARN MORE',
      currentBuild: 'Current Build',
      buildVersion: 'V 0.92.14-STABLE',
      synced: 'SYNCED',
      capabilities: {
        label: '01 / CAPABILITIES',
        title: 'Kitchen AI Capabilities',
        visualRecognition: 'Visual Recognition',
        visualRecognitionDesc: 'Real-time ingredient tracking via high-precision AI vision. Simply scan containers with your camera to detect capacity levels.',
        predictiveDepletion: 'Predictive Depletion',
        predictiveDepletionDesc: 'Sophisticated usage analytics forecast exactly when you\'ll need a restock based on your actual ingestion habits.',
        zeroWaste: 'Zero-Waste Logic',
        zeroWasteDesc: 'Automated custom dietary advice and smart recipes formulated on ingredient freshness windows and inventory volume.',
        initialize: 'INITIALIZE ENVIRONMENT',
        close: 'Close'
      }
    },
    login: {
      brand: 'Clear Pantry',
      subtitle: 'Sign in to manage your kitchen.',
      logIn: 'LOG IN',
      signUp: 'SIGN UP',
      username: 'Username',
      password: 'Password',
      usernamePlaceholder: 'Enter username',
      passwordPlaceholder: 'Enter password',
      errors: {
        missingFields: 'Please enter both username and password.',
        generic: 'Something went wrong. Please try again.',
        serverUnreachable: 'Unable to reach the server. Is it running?'
      },
      submit: {
        processing: 'PROCESSING...',
        createAccount: 'CREATE ACCOUNT',
        enterKitchen: 'ENTER KITCHEN'
      },
      footer: {
        alreadyHaveAccount: 'Already have an account? ',
        newHere: 'New here? ',
        logInLink: 'Log in',
        signUpLink: 'Sign up'
      },
      mockAccounts: 'MOCK ACCOUNTS: demo / demo123  |  chef / kitchen'
    },
    home: {
      morningAnalysis: 'Morning Analysis',
      kitchenStatus: 'Kitchen Status',
      allSystemsCalibrated: 'All systems calibrated',
      criticalReports: 'Critical Reports',
      noCriticalReports: 'No critical reports yet. Future AI analysis will surface low-stock and spoilage alerts here.',
      restockSuggestions: 'Restock Suggestions',
      noSuggestions: 'No suggestions yet. Future AI will recommend restocks based on usage trends.',
      demo: {
        flourCritical: 'Flour Stock Critical',
        flourCriticalDesc: 'Estimated 120g remaining. 1.2kg needed for weekly prep schedules.',
        oliveOilSuggested: 'Olive Oil Suggested',
        oliveOilSuggestedDesc: 'Refill recommended soon.',
        pantryTemp: 'PANTRY 1 • 18°C STABLE'
      },
      dietaryAdvice: 'Dietary Advice',
      regenerateAdvice: 'Regenerate Advice',
      generatingAdvice: 'Generating dietary advice...',
      viewPlan: 'VIEW PLAN',
      dismiss: 'DISMISS',
      adviceDismissed: 'Dietary advice card dismissed.',
      refreshAndRestore: 'Refresh & Restore Advice',
      noAdvice: 'No dietary advice yet. Tap regenerate to create personalized advice from your current pantry.',
      consumptionTrends: 'Consumption Trends',
      noTrendData: 'No trend data available',
      freshnessScore: 'Freshness Score',
      freshnessScoreDesc: 'Average shelf life remaining across all perishables in your fridge & pantry.',
      recentIngredientUsage: 'Recent Ingredient Usage',
      noUsageData: 'No ingredient usage data yet',
      itemRemaining: '{qty}{unit} remaining',
      demoEggs: {
        name: 'Organic Eggs',
        detail: '6 used • 6 remaining'
      },
      demoRice: {
        name: 'Basmati Rice',
        detail: '0.4kg used • 4.6kg remaining'
      },
      cameraCta: 'LAUNCH VISUAL TRACING CAMERA TO CALIBRATE ITEMS',
      containers: 'Containers',
      containerSettings: 'Container Settings',
      containerName: 'Container Name',
      currentQty: 'Current Quantity',
      maxQty: 'Max Capacity',
      setCapacityThreshold: 'Set capacity threshold',
      freshness: 'Freshness',
      spoilageRisk: 'Spoilage Risk',
      deleteContainerConfirm: 'Delete container "{name}"? This cannot be undone.',
      save: 'Save',
      cancel: 'Cancel',
      planModal: {
        title: 'Dietary Strategy Plan',
        subtitle: 'Precision Recipe Routing',
        intro: 'Your nutrition advisory engine generated a high-efficiency nutritional intake model:',
        breakfast: 'Breakfast suggestion:',
        breakfastValue: 'Scrambled eggs + Basil',
        lunch: 'Lunch suggestion:',
        lunchValue: 'Spinach & Greek Yogurt salad',
        nutrients: 'Active nutrients targeted:',
        nutrientsValue: 'Protein, Iron, Vitamin K',
        footnote: '*By prioritizing ingredients with high spoilage risks (Spinach & Basil), you save $4.20 this week and reduce carbon waste footprints.',
        close: 'CLOSE PLAN'
      }
    },
    analyze: {
      aiActive: 'AI ACTIVE',
      cameraFeed: 'CAMERA PREVIEW FEED [LIVE]',
      cameraQuality: '1080P • COLD ACCURACY',
      scanCaptured: 'SCAN CAPTURED • AI LABELING COMING SOON',
      captureScan: 'Capture scan',
      recordLevels: 'Record current levels',
      cycleTargets: 'Cycle Simulated Target Ingredients',
      scenarios: {
        standard: 'Feed: Standard',
        depleted: 'Feed: Low Stock',
        refilled: 'Feed: Full restocked'
      },
      kitchenStats: 'Kitchen Stats',
      itemsTracked: 'ITEMS TRACKED',
      latency: 'LATENCY: 12ms',
      confidence: 'CONFIDENCE: 99.2%',
      activeRecipe: 'Active Recipe',
      recipeName: 'Mushroom Risotto',
      riceFound: 'RICE FOUND',
      oilFound: 'OIL FOUND',
      committed: 'KITCHEN STATE COMMITTED TO CLOUD & PERSISTENCE',
      shootHint: 'Tap "SHOOT" to snapshot and log current level changes.',
      cameraError: 'Unable to access the camera. Please allow camera permission and ensure a camera is available.',
      switchCamera: 'Switch camera',
      cameraOffline: 'Camera offline',
      galleryTitle: 'Gallery',
      noPhotos: 'No photos yet',
      close: 'Close',
      back: 'Back',
      aiDetect: 'AI Detect',
      aiDetecting: 'Analyzing...',
      aiError: 'AI analysis failed. Please try again later.',
      uploadPhoto: 'Upload photo',
      deletePhoto: 'Delete photo',
      deletePhotoConfirm: 'Delete this photo permanently? This cannot be undone.',
      selectPhotos: 'Select',
      deleteSelected: 'Delete {count}',
      deleteSelectedConfirm: 'Delete {count} selected photos permanently? This cannot be undone.',
      cancel: 'Cancel',
      demoLabels: {
        oliveOilCritical: 'OLIVE OIL - 10% REMAINING (CRITICAL)',
        basilCritical: 'FRESH BASIL - 5% (CRITICAL)',
        walnutsCritical: 'WALNUTS - 12% (CRITICAL)',
        oliveOilFull: 'OLIVE OIL - 95% CAPACITY (FULL)',
        basilRefilled: 'FRESH BASIL - 100% (REFILLED)',
        walnutsRefilled: 'WALNUTS - 90% (REFILLED)',
        oliveOilRemaining: 'OLIVE OIL - 30% REMAINING',
        basilStable: 'FRESH BASIL - 40% STABLE',
        walnutsStable: 'WALNUTS - 50% STABLE'
      },
      demoQty: {
        oliveOilManual: '+50ml (Manual Adjustment)',
        basilDepleted: '+10g (Depleted Stock)',
        walnutsSmall: '+20g',
        oliveOilRefill: '+650ml',
        basilRefill: '+60g',
        walnutsRefill: '+200g',
        oliveOilStandard: '+150ml',
        basilStandard: '+40g',
        walnutsStandard: '+120g'
      },
      proteinLabel: 'PROTEIN - 12% REMAINING',
      avgStockLabel: 'AVG STOCK - {value}% REMAINING',
      aiAssistant: 'AI Assistant',
      askAi: 'Ask AI about this image...',
      saveConversation: 'Save conversation',
      conversationSaved: 'Saved',
      detectRefill: 'Detect Refill',
      detectingRefills: 'Detecting refills...',
      detectedRefills: 'Detected Refills',
      approve: 'Approve',
      cancelDetections: 'Cancel',
      refillAdded: 'Refill records added to pantry.',
      noDetections: 'No items detected.',
      labelUnit: 'Unit',
      labelCategory: 'Category',
      labelConfidence: 'Confidence',
      labelNotes: 'Notes',
      newIngredient: 'New Ingredient',
      currentQty: 'Current Qty',
      maxQty: 'Max Qty',
      addToExisting: 'Add to existing',
      newIngredientOption: 'New ingredient',
      createNewContainer: 'Create new container',
      existingContainer: 'Existing container',
      setCapacity: 'Set capacity threshold',
      capacity: 'Capacity',
      clearChat: 'Clear chat',
      clearConversation: 'Clear conversation',
      message: 'message',
      messages: 'messages',
      aiResponseError: 'AI response error.',
      loadConversationError: 'Failed to load conversation.'
    },
    inventory: {
      dashboard: 'Dashboard',
      subtitle: 'Ingredient depletion & intake analysis',
      depletionTrend: '[ DEPLETION TREND ]',
      remainingStocks: 'Remaining Stocks',
      protein: 'PROTEIN',
      avgStock: 'AVG STOCK',
      fiber: 'FIBER',
      avgFreshness: 'AVG FRESHNESS',
      emptyTrend: 'Add ingredients to see depletion trends',
      criticalStats: '[ CRITICAL STATS ]',
      spoilageRisk: 'Spoilage Risk',
      freshness: 'Freshness: {value}%',
      riskLabel: '{risk} Risk',
      quickLogSpinach: 'QUICK LOG SPINACH CONSUMPTION',
      refillsDetected: 'Refills Detected',
      synced: 'SYNCED 2M AGO',
      manualLog: '+ MANUAL LOG',
      manualForm: {
        title: 'Manual Stock Restock Log',
        close: 'Close',
        ingredientPlaceholder: 'Ingredient (e.g. Flour)',
        unit: 'UNIT',
        commit: 'Commit Log Entry',
        del: '⌫'
      },
      table: {
        ingredient: 'Ingredient',
        qtyAdded: 'Qty Added',
        method: 'Method',
        confidence: 'Confidence'
      },
      deleteRefill: 'Delete refill',
      consumptionInsight: 'Consumption Insight',
      consumptionInsightDesc: "You're consuming 15% more protein this week than your 30-day average."
    },
    settings: {
      title: 'Settings',
      subtitle: 'Configure your kitchen intelligence environment.',
      personalCenter: {
        guest: 'Guest',
        defaultInfo: 'Personal kitchen account',
        logoutConfirm: 'Log out of your account?',
        logout: 'LOG OUT',
        demoCannotDelete: 'The demo account cannot be deleted.',
        deleteConfirm: 'Delete account "{username}" permanently? All saved photos will also be removed. This cannot be undone.',
        deleteAccount: 'DELETE ACCOUNT'
      },
      appearance: 'Appearance',
      darkMode: 'Dark Mode',
      darkModeDesc: 'Switch between light and laboratory-clean dark aesthetic.',
      language: 'Language',
      languageDesc: 'Preferred interface localization.',
      languages: {
        en: 'English (US)',
        zh: 'Chinese (ZH)',
        es: 'Spanish (ES)'
      },
      intelligence: {
        title: 'Intelligence Parameters',
        active: 'AI_AGENT: ACTIVE',
        reportLogic: 'Report Generation Logic',
        reportLogicDesc: 'Define specific constraints or formatting rules for your automated kitchen inventory reports.',
        placeholder: 'e.g., Prioritize high-protein ingredients and list expiration dates in DD/MM/YYYY format...',
        updated: 'CONFIGURATION UPDATED successfully',
        save: 'SAVE CONFIGURATION'
      },
      diagnostics: {
        title: 'System Diagnostics',
        stateReset: 'State Reset',
        stateResetDesc: 'Clear local storage state to restore original preset mock values and simulated refills logs.',
        resetConfirm: 'Reset kitchen inventory state to default parameters?',
        resetDone: 'Kitchen state restored.',
        restoreDefaults: 'RESTORE DEMO DEFAULTS'
      },
      version: 'Version',
      uptime: 'Uptime'
    },
    dietAdvice: {
      protein: 'Protein priority requested: Consume Organic Eggs (50% remaining) and Greek Yogurt to fulfill your daily muscle-recovery requirements.',
      fresh: 'Freshness constraint matched: Consume Spinach (Organic) and Fresh Basil immediately, as their spoilage risk scores have escalated to High.',
      carb: 'Carbohydrate focus: Incorporate Basmati Rice (92% remaining) with healthy dietary fats to sustain longer morning training blocks.',
      waste: 'Zero-waste strategy active: We generated meal plans utilizing flour and leftover oat milk to reduce culinary carbon footprint by 14%.',
      greens: 'Increase leafy greens intake based on last 7 days. Your vegetable fiber consumption is 18% lower than your optimal healthy target.',
      spoilage: 'Consider prepping recipes with Spinach and Basil today. They have high spoilage risks and will hit critical freshness within 48 hours.',
      highProtein: 'High-protein focus active: Greek Yogurt and Organic Eggs are available. Consuming these for breakfast will meet 35% of your daily protein target.',
      lowStock: 'Flour and Oat Milk stocks are critical. We suggest adding these to your auto-restock list to ensure seamless meal preparation next week.'
    },
    ingredients: {
      flour: 'Flour',
      oliveOil: 'Olive Oil',
      organicEggs: 'Organic Eggs',
      basmatiRice: 'Basmati Rice',
      freshBasil: 'Fresh Basil',
      walnuts: 'Walnuts',
      spinach: 'Spinach (Organic)',
      greekYogurt: 'Greek Yogurt',
      oatMilk: 'Oat Milk'
    },
    refills: {
      basil: 'Fresh Basil',
      oliveOil: 'Olive Oil',
      walnuts: 'Walnuts'
    }
  },
  zh: {
    common: {
      days: {
        mon: '周一',
        tue: '周二',
        wed: '周三',
        thu: '周四',
        fri: '周五',
        sat: '周六',
        sun: '周日'
      },
      remaining: '剩余 {value}%',
      units: {
        g: '克',
        ml: '毫升',
        pcs: '个'
      },
      categories: {
        pantry: '储藏室',
        fridge: '冰箱'
      },
      risk: {
        low: '低',
        medium: '中',
        high: '高'
      },
      status: {
        critical: '严重不足',
        stable: '稳定',
        normal: '正常',
        restock: '补货'
      },
      methods: {
        opticalAi: '光学 AI',
        manual: '手动'
      }
    },
    app: {
      home: '首页',
      analyze: '分析',
      pantry: '储藏室',
      settings: '设置',
      loadingKitchenData: '正在加载厨房数据'
    },
    welcome: {
      systemVersion: 'CLEAR-PANTRY 系统 v0.92',
      active: '运行中',
      systemReady: '[系统就绪]',
      title: '欢迎来到您厨房的全新神经系统。',
      subtitle: '精准的库存追踪与烹饪智能，悄然管理您的必需品，让您专注于烹饪本身。',
      getStarted: '开始使用',
      learnMore: '了解更多',
      currentBuild: '当前版本',
      buildVersion: 'V 0.92.14-稳定版',
      synced: '已同步',
      capabilities: {
        label: '01 / 功能',
        title: '厨房 AI 功能',
        visualRecognition: '视觉识别',
        visualRecognitionDesc: '通过高精度 AI 视觉实时追踪食材。只需用相机扫描容器即可检测容量水平。',
        predictiveDepletion: '消耗预测',
        predictiveDepletionDesc: '复杂的用量分析可准确预测您何时需要根据实际摄入习惯补货。',
        zeroWaste: '零浪费逻辑',
        zeroWasteDesc: '基于食材新鲜度窗口和库存量，自动生成定制饮食建议和智慧食谱。',
        initialize: '初始化环境',
        close: '关闭'
      }
    },
    login: {
      brand: 'Clear Pantry',
      subtitle: '登录以管理您的厨房。',
      logIn: '登录',
      signUp: '注册',
      username: '用户名',
      password: '密码',
      usernamePlaceholder: '输入用户名',
      passwordPlaceholder: '输入密码',
      errors: {
        missingFields: '请输入用户名和密码。',
        generic: '出了点问题，请重试。',
        serverUnreachable: '无法连接到服务器，服务器是否正在运行？'
      },
      submit: {
        processing: '处理中...',
        createAccount: '创建账户',
        enterKitchen: '进入厨房'
      },
      footer: {
        alreadyHaveAccount: '已有账户？',
        newHere: '新用户？',
        logInLink: '登录',
        signUpLink: '注册'
      },
      mockAccounts: '演示账户：demo / demo123  |  chef / kitchen'
    },
    home: {
      morningAnalysis: '早间分析',
      kitchenStatus: '厨房状态',
      allSystemsCalibrated: '所有系统已校准',
      criticalReports: '关键报告',
      noCriticalReports: '暂无关键报告。未来的 AI 分析将在此显示低库存和变质风险提醒。',
      restockSuggestions: '补货建议',
      noSuggestions: '暂无建议。未来的 AI 将根据使用趋势推荐补货。',
      demo: {
        flourCritical: '面粉库存严重不足',
        flourCriticalDesc: '估计剩余 120 克。每周备餐需要 1.2 千克。',
        oliveOilSuggested: '建议补充橄榄油',
        oliveOilSuggestedDesc: '建议尽快补货。',
        pantryTemp: '储藏室 1 • 18°C 稳定'
      },
      dietaryAdvice: '饮食建议',
      regenerateAdvice: '重新生成建议',
      generatingAdvice: '正在生成饮食建议...',
      viewPlan: '查看计划',
      dismiss: '关闭',
      adviceDismissed: '饮食建议卡片已关闭。',
      refreshAndRestore: '刷新并恢复建议',
      noAdvice: '暂无饮食建议。点击重新生成以根据当前 pantry 创建个性化建议。',
      consumptionTrends: '消耗趋势',
      noTrendData: '暂无趋势数据',
      freshnessScore: '新鲜度评分',
      freshnessScoreDesc: '冰箱和储藏室中所有易腐食材的平均剩余保质期。',
      recentIngredientUsage: '最近食材使用情况',
      noUsageData: '暂无食材使用数据',
      itemRemaining: '{qty}{unit} 剩余',
      demoEggs: {
        name: '有机鸡蛋',
        detail: '已用 6 个 • 剩余 6 个'
      },
      demoRice: {
        name: '巴斯马蒂大米',
        detail: '已用 0.4 千克 • 剩余 4.6 千克'
      },
      cameraCta: '启动视觉追踪相机以校准物品',
      containers: '容器',
      containerSettings: '容器设置',
      containerName: '容器名称',
      currentQty: '当前量',
      maxQty: '最大容量',
      setCapacityThreshold: '设置容量上限',
      freshness: '新鲜度',
      spoilageRisk: '变质风险',
      deleteContainerConfirm: '删除容器“{name}”？此操作不可撤销。',
      save: '保存',
      cancel: '取消',
      planModal: {
        title: '饮食策略计划',
        subtitle: '精准食谱规划',
        intro: '您的营养咨询引擎生成了一种高效的营养摄入模型：',
        breakfast: '早餐建议：',
        breakfastValue: '炒鸡蛋 + 罗勒',
        lunch: '午餐建议：',
        lunchValue: '菠菜希腊酸奶沙拉',
        nutrients: '目标营养素：',
        nutrientsValue: '蛋白质、铁、维生素 K',
        footnote: '*通过优先使用高风险变质食材（菠菜和罗勒），您本周可节省 4.20 美元并减少碳足迹。',
        close: '关闭计划'
      }
    },
    analyze: {
      aiActive: 'AI 运行中',
      cameraFeed: '相机预览画面 [实时]',
      cameraQuality: '1080P • 冷准确度',
      scanCaptured: '扫描已捕获 • AI 标注即将推出',
      captureScan: '捕获扫描',
      recordLevels: '记录当前水平',
      cycleTargets: '切换模拟目标食材',
      scenarios: {
        standard: '画面：标准',
        depleted: '画面：低库存',
        refilled: '画面：已补满'
      },
      kitchenStats: '厨房统计',
      itemsTracked: '已追踪项目',
      latency: '延迟：12毫秒',
      confidence: '置信度：99.2%',
      activeRecipe: '当前食谱',
      recipeName: '蘑菇烩饭',
      riceFound: '检测到米饭',
      oilFound: '检测到油',
      committed: '厨房状态已提交至云端并持久化',
      shootHint: '点击“拍摄”以快照并记录当前水平变化。',
      cameraError: '无法访问相机。请允许相机权限并确保相机可用。',
      switchCamera: '切换摄像头',
      cameraOffline: '相机离线',
      galleryTitle: '相册',
      noPhotos: '暂无照片',
      close: '关闭',
      back: '返回',
      aiDetect: 'AI 识别',
      aiDetecting: '识别中...',
      aiError: 'AI 识别失败，请稍后再试。',
      uploadPhoto: '上传照片',
      deletePhoto: '删除照片',
      deletePhotoConfirm: '永久删除这张照片？此操作无法撤销。',
      selectPhotos: '选择',
      deleteSelected: '删除 {count} 张',
      deleteSelectedConfirm: '永久删除选中的 {count} 张照片？此操作无法撤销。',
      cancel: '取消',
      demoLabels: {
        oliveOilCritical: '橄榄油 - 剩余 10%（严重不足）',
        basilCritical: '新鲜罗勒 - 5%（严重不足）',
        walnutsCritical: '核桃 - 12%（严重不足）',
        oliveOilFull: '橄榄油 - 容量 95%（已满）',
        basilRefilled: '新鲜罗勒 - 100%（已补货）',
        walnutsRefilled: '核桃 - 90%（已补货）',
        oliveOilRemaining: '橄榄油 - 剩余 30%',
        basilStable: '新鲜罗勒 - 40% 稳定',
        walnutsStable: '核桃 - 50% 稳定'
      },
      demoQty: {
        oliveOilManual: '+50毫升（手动调整）',
        basilDepleted: '+10克（库存耗尽）',
        walnutsSmall: '+20克',
        oliveOilRefill: '+650毫升',
        basilRefill: '+60克',
        walnutsRefill: '+200克',
        oliveOilStandard: '+150毫升',
        basilStandard: '+40克',
        walnutsStandard: '+120克'
      },
      proteinLabel: '蛋白质 - 剩余 12%',
      avgStockLabel: '平均库存 - 剩余 {value}%',
      aiAssistant: 'AI 助手',
      askAi: '向 AI 询问此图片...',
      saveConversation: '保存对话',
      conversationSaved: '已保存',
      detectRefill: '检测补货',
      detectingRefills: '正在检测补货...',
      detectedRefills: '检测到的补货',
      approve: '确认',
      cancelDetections: '取消',
      refillAdded: '补货记录已添加到 pantry。',
      noDetections: '未检测到物品。',
      labelUnit: '单位',
      labelCategory: '分类',
      labelConfidence: '置信度',
      labelNotes: '备注',
      newIngredient: '新食材',
      currentQty: '当前量',
      maxQty: '最大量',
      addToExisting: '添加到现有',
      newIngredientOption: '新食材',
      createNewContainer: '创建新容器',
      existingContainer: '现有容器',
      setCapacity: '设置容量上限',
      capacity: '容量',
      clearChat: '清空对话',
      clearConversation: '清空对话记录',
      message: '条消息',
      messages: '条消息',
      aiResponseError: 'AI 响应错误。',
      loadConversationError: '加载对话失败。'
    },
    inventory: {
      dashboard: '仪表盘',
      subtitle: '食材消耗与摄入分析',
      depletionTrend: '[ 消耗趋势 ]',
      remainingStocks: '剩余库存',
      protein: '蛋白质',
      avgStock: '平均库存',
      fiber: '纤维',
      avgFreshness: '平均新鲜度',
      emptyTrend: '添加食材以查看消耗趋势',
      criticalStats: '[ 关键统计 ]',
      spoilageRisk: '变质风险',
      freshness: '新鲜度：{value}%',
      riskLabel: '{risk}风险',
      quickLogSpinach: '快速记录菠菜消耗',
      refillsDetected: '检测到补货',
      synced: '2分钟前同步',
      manualLog: '+ 手动记录',
      manualForm: {
        title: '手动库存补货记录',
        close: '关闭',
        ingredientPlaceholder: '食材（例如：面粉）',
        unit: '单位',
        commit: '提交记录',
        del: '删除'
      },
      table: {
        ingredient: '食材',
        qtyAdded: '添加量',
        method: '方式',
        confidence: '置信度'
      },
      deleteRefill: '删除补货记录',
      consumptionInsight: '消耗洞察',
      consumptionInsightDesc: '您本周的蛋白质摄入量比 30 天平均值高出 15%。'
    },
    settings: {
      title: '设置',
      subtitle: '配置您的厨房智能环境。',
      personalCenter: {
        guest: '访客',
        defaultInfo: '个人厨房账户',
        logoutConfirm: '退出账户？',
        logout: '退出登录',
        demoCannotDelete: '演示账户无法删除。',
        deleteConfirm: '永久删除账户“{username}”？所有保存的照片也将被删除。此操作无法撤销。',
        deleteAccount: '删除账户'
      },
      appearance: '外观',
      darkMode: '深色模式',
      darkModeDesc: '在浅色和实验室风格的深色外观之间切换。',
      language: '语言',
      languageDesc: '首选界面语言。',
      languages: {
        en: '英语（美国）',
        zh: '中文（简体）',
        es: '西班牙语'
      },
      intelligence: {
        title: '智能参数',
        active: 'AI 代理：运行中',
        reportLogic: '报告生成逻辑',
        reportLogicDesc: '为自动厨房库存报告定义特定的约束或格式规则。',
        placeholder: '例如：优先高蛋白食材，并以 DD/MM/YYYY 格式列出过期日期...',
        updated: '配置更新成功',
        save: '保存配置'
      },
      diagnostics: {
        title: '系统诊断',
        stateReset: '状态重置',
        stateResetDesc: '清除本地存储状态以恢复原始预设值和模拟补货日志。',
        resetConfirm: '将厨房库存状态重置为默认参数？',
        resetDone: '厨房状态已恢复。',
        restoreDefaults: '恢复演示默认值'
      },
      version: '版本',
      uptime: '运行时间'
    },
    dietAdvice: {
      protein: '蛋白质优先：食用有机鸡蛋（剩余 50%）和希腊酸奶，以满足每日肌肉恢复需求。',
      fresh: '新鲜度约束匹配：立即食用菠菜（有机）和新鲜罗勒，因为它们的变质风险已升至高。',
      carb: '碳水化合物重点：将巴斯马蒂大米（剩余 92%）与健康膳食脂肪搭配，以维持更长时间的晨练。',
      waste: '零浪费策略已激活：我们利用面粉和剩余燕麦奶制定膳食计划，本周可减少 14% 的烹饪碳足迹。',
      greens: '根据过去 7 天增加绿叶蔬菜摄入。您的蔬菜纤维摄入量比最佳健康目标低 18%。',
      spoilage: '今天考虑准备菠菜和罗勒的食谱。它们的变质风险较高，将在 48 小时内达到临界新鲜度。',
      highProtein: '高蛋白重点：希腊酸奶和有机鸡蛋可用。早餐食用这些可满足您每日蛋白质目标的 35%。',
      lowStock: '面粉和燕麦奶库存严重不足。我们建议将它们添加到自动补货清单，以确保下周备餐顺利进行。'
    },
    ingredients: {
      flour: '面粉',
      oliveOil: '橄榄油',
      organicEggs: '有机鸡蛋',
      basmatiRice: '巴斯马蒂大米',
      freshBasil: '新鲜罗勒',
      walnuts: '核桃',
      spinach: '菠菜（有机）',
      greekYogurt: '希腊酸奶',
      oatMilk: '燕麦奶'
    },
    refills: {
      basil: '新鲜罗勒',
      oliveOil: '橄榄油',
      walnuts: '核桃'
    }
  },
  es: {
    common: {
      days: {
        mon: 'LUN',
        tue: 'MAR',
        wed: 'MIÉ',
        thu: 'JUE',
        fri: 'VIE',
        sat: 'SÁB',
        sun: 'DOM'
      },
      remaining: '{value}% RESTANTE',
      units: {
        g: 'g',
        ml: 'ml',
        pcs: 'pzas'
      },
      categories: {
        pantry: 'Despensa',
        fridge: 'Nevera'
      },
      risk: {
        low: 'Bajo',
        medium: 'Medio',
        high: 'Alto'
      },
      status: {
        critical: 'CRÍTICO',
        stable: 'ESTABLE',
        normal: 'NORMAL',
        restock: 'REABASTECER'
      },
      methods: {
        opticalAi: 'IA ÓPTICA',
        manual: 'MANUAL'
      }
    },
    app: {
      home: 'INICIO',
      analyze: 'ANALIZAR',
      pantry: 'DESPENSA',
      settings: 'AJUSTES',
      loadingKitchenData: 'CARGANDO DATOS DE COCINA'
    },
    welcome: {
      systemVersion: 'SISTEMA CLEAR-PANTRY v0.92',
      active: 'ACTIVO',
      systemReady: '[SISTEMA_LISTO]',
      title: 'Bienvenido al nuevo sistema nervioso de tu cocina.',
      subtitle: 'Seguimiento de inventario preciso e inteligencia culinaria que gestiona tus esenciales en silencio para que puedas concentrarte en el arte de cocinar.',
      getStarted: 'COMENZAR',
      learnMore: 'SABER MÁS',
      currentBuild: 'Compilación Actual',
      buildVersion: 'V 0.92.14-ESTABLE',
      synced: 'SINCRONIZADO',
      capabilities: {
        label: '01 / CAPACIDADES',
        title: 'Capacidades de IA de Cocina',
        visualRecognition: 'Reconocimiento Visual',
        visualRecognitionDesc: 'Seguimiento de ingredientes en tiempo real mediante visión por IA de alta precisión. Simplemente escanea los recipientes con tu cámara para detectar los niveles de capacidad.',
        predictiveDepletion: 'Agotamiento Predictivo',
        predictiveDepletionDesc: 'Los análisis de uso sofisticados pronostican exactamente cuándo necesitarás reabastecerte según tus hábitos de ingesta reales.',
        zeroWaste: 'Lógica de Cero Desperdicio',
        zeroWasteDesc: 'Consejos dietéticos personalizados automáticos y recetas inteligentes formuladas según las ventanas de frescura de los ingredientes y el volumen del inventario.',
        initialize: 'INICIALIZAR ENTORNO',
        close: 'Cerrar'
      }
    },
    login: {
      brand: 'Clear Pantry',
      subtitle: 'Inicia sesión para gestionar tu cocina.',
      logIn: 'INICIAR SESIÓN',
      signUp: 'REGISTRARSE',
      username: 'Nombre de usuario',
      password: 'Contraseña',
      usernamePlaceholder: 'Ingresa nombre de usuario',
      passwordPlaceholder: 'Ingresa contraseña',
      errors: {
        missingFields: 'Por favor ingresa nombre de usuario y contraseña.',
        generic: 'Algo salió mal. Por favor intenta de nuevo.',
        serverUnreachable: 'No se puede conectar con el servidor. ¿Está ejecutándose?'
      },
      submit: {
        processing: 'PROCESANDO...',
        createAccount: 'CREAR CUENTA',
        enterKitchen: 'ENTRAR A COCINA'
      },
      footer: {
        alreadyHaveAccount: '¿Ya tienes una cuenta? ',
        newHere: '¿Nuevo aquí? ',
        logInLink: 'Iniciar sesión',
        signUpLink: 'Registrarse'
      },
      mockAccounts: 'CUENTAS DE PRUEBA: demo / demo123  |  chef / kitchen'
    },
    home: {
      morningAnalysis: 'Análisis Matutino',
      kitchenStatus: 'Estado de la Cocina',
      allSystemsCalibrated: 'Todos los sistemas calibrados',
      criticalReports: 'Reportes Críticos',
      noCriticalReports: 'Aún no hay reportes críticos. El análisis de IA futuro mostrará alertas de bajo stock y riesgo de descomposición aquí.',
      restockSuggestions: 'Sugerencias de Reabastecimiento',
      noSuggestions: 'Aún no hay sugerencias. La IA futura recomendará reabastecimientos según las tendencias de uso.',
      demo: {
        flourCritical: 'Harina con Stock Crítico',
        flourCriticalDesc: 'Quedan aproximadamente 120g. Se necesitan 1.2kg para los horarios de preparación semanal.',
        oliveOilSuggested: 'Aceite de Oliva Sugerido',
        oliveOilSuggestedDesc: 'Se recomienda reabastecer pronto.',
        pantryTemp: 'DESPENSA 1 • 18°C ESTABLE'
      },
      dietaryAdvice: 'Consejo Dietético',
      regenerateAdvice: 'Regenerar consejo',
      generatingAdvice: 'Generando consejo dietético...',
      viewPlan: 'VER PLAN',
      dismiss: 'DESCARTAR',
      adviceDismissed: 'Tarjeta de consejo dietético descartada.',
      refreshAndRestore: 'Actualizar y Restaurar Consejo',
      noAdvice: 'Aún no hay consejo dietético. Toca regenerar para crear uno personalizado según tu despensa.',
      consumptionTrends: 'Tendencias de Consumo',
      noTrendData: 'No hay datos de tendencias disponibles',
      freshnessScore: 'Puntaje de Frescura',
      freshnessScoreDesc: 'Vida útil promedio restante de todos los productos perecederos en tu nevera y despensa.',
      recentIngredientUsage: 'Uso Reciente de Ingredientes',
      noUsageData: 'Aún no hay datos de uso de ingredientes',
      itemRemaining: '{qty}{unit} restante',
      demoEggs: {
        name: 'Huevos Orgánicos',
        detail: '6 usados • 6 restantes'
      },
      demoRice: {
        name: 'Arroz Basmati',
        detail: '0.4kg usados • 4.6kg restantes'
      },
      cameraCta: 'INICIAR CÁMARA DE TRAZADO VISUAL PARA CALIBRAR ARTÍCULOS',
      containers: 'Contenedores',
      containerSettings: 'Configuración del contenedor',
      containerName: 'Nombre del contenedor',
      currentQty: 'Cantidad actual',
      maxQty: 'Capacidad máxima',
      setCapacityThreshold: 'Establecer límite de capacidad',
      freshness: 'Frescura',
      spoilageRisk: 'Riesgo de deterioro',
      deleteContainerConfirm: '¿Eliminar contenedor "{name}"? Esta acción no se puede deshacer.',
      save: 'Guardar',
      cancel: 'Cancelar',
      planModal: {
        title: 'Plan de Estrategia Dietética',
        subtitle: 'Enrutamiento de Recetas de Precisión',
        intro: 'Tu motor de asesoramiento nutricional generó un modelo de ingesta nutricional de alta eficiencia:',
        breakfast: 'Sugerencia de desayuno:',
        breakfastValue: 'Huevos revueltos + Albahaca',
        lunch: 'Sugerencia de almuerzo:',
        lunchValue: 'Ensalada de Espinaca y Yogur Griego',
        nutrients: 'Nutrientes activos objetivo:',
        nutrientsValue: 'Proteína, Hierro, Vitamina K',
        footnote: '*Al priorizar ingredientes con alto riesgo de descomposición (Espinaca y Albahaca), ahorras $4.20 esta semana y reduces la huella de carbono.',
        close: 'CERRAR PLAN'
      }
    },
    analyze: {
      aiActive: 'IA ACTIVA',
      cameraFeed: 'VISTA PREVIA DE CÁMARA [EN VIVO]',
      cameraQuality: '1080P • PRECISIÓN EN FRÍO',
      scanCaptured: 'ESCANEÓ CAPTURADO • ETIQUETADO DE IA PRÓXIMAMENTE',
      captureScan: 'Capturar escaneo',
      recordLevels: 'Registrar niveles actuales',
      cycleTargets: 'Cambiar ingredientes objetivo simulados',
      scenarios: {
        standard: 'Feed: Estándar',
        depleted: 'Feed: Stock Bajo',
        refilled: 'Feed: Reabastecido'
      },
      kitchenStats: 'Estadísticas de Cocina',
      itemsTracked: 'ARTÍCULOS RASTREADOS',
      latency: 'LATENCIA: 12ms',
      confidence: 'CONFIANZA: 99.2%',
      activeRecipe: 'Receta Activa',
      recipeName: 'Risotto de Champiñones',
      riceFound: 'ARROZ ENCONTRADO',
      oilFound: 'ACEITE ENCONTRADO',
      committed: 'ESTADO DE COCINA ENVIADO A LA NUBE Y PERSISTIDO',
      shootHint: 'Toca "DISPARAR" para capturar y registrar los cambios de nivel actuales.',
      cameraError: 'No se puede acceder a la cámara. Permita el acceso a la cámara y asegúrese de que haya una disponible.',
      switchCamera: 'Cambiar cámara',
      cameraOffline: 'Cámara fuera de línea',
      galleryTitle: 'Galería',
      noPhotos: 'Aún no hay fotos',
      close: 'Cerrar',
      back: 'Atrás',
      aiDetect: 'Detectar con IA',
      aiDetecting: 'Analizando...',
      aiError: 'El análisis de IA falló. Inténtalo de nuevo más tarde.',
      uploadPhoto: 'Subir foto',
      deletePhoto: 'Eliminar foto',
      deletePhotoConfirm: '¿Eliminar permanentemente esta foto? Esto no se puede deshacer.',
      selectPhotos: 'Seleccionar',
      deleteSelected: 'Eliminar {count}',
      deleteSelectedConfirm: '¿Eliminar permanentemente las {count} fotos seleccionadas? Esto no se puede deshacer.',
      cancel: 'Cancelar',
      demoLabels: {
        oliveOilCritical: 'ACEITE DE OLIVA - 10% RESTANTE (CRÍTICO)',
        basilCritical: 'ALBAHACA FRESCA - 5% (CRÍTICO)',
        walnutsCritical: 'NUECES - 12% (CRÍTICO)',
        oliveOilFull: 'ACEITE DE OLIVA - 95% CAPACIDAD (LLENO)',
        basilRefilled: 'ALBAHACA FRESCA - 100% (REABASTECIDO)',
        walnutsRefilled: 'NUECES - 90% (REABASTECIDO)',
        oliveOilRemaining: 'ACEITE DE OLIVA - 30% RESTANTE',
        basilStable: 'ALBAHACA FRESCA - 40% ESTABLE',
        walnutsStable: 'NUECES - 50% ESTABLE'
      },
      demoQty: {
        oliveOilManual: '+50ml (Ajuste Manual)',
        basilDepleted: '+10g (Stock Agotado)',
        walnutsSmall: '+20g',
        oliveOilRefill: '+650ml',
        basilRefill: '+60g',
        walnutsRefill: '+200g',
        oliveOilStandard: '+150ml',
        basilStandard: '+40g',
        walnutsStandard: '+120g'
      },
      proteinLabel: 'PROTEÍNA - 12% RESTANTE',
      avgStockLabel: 'STOCK PROMEDIO - {value}% RESTANTE',
      aiAssistant: 'Asistente de IA',
      askAi: 'Pregunta a la IA sobre esta imagen...',
      saveConversation: 'Guardar conversación',
      conversationSaved: 'Guardado',
      detectRefill: 'Detectar reabastecimiento',
      detectingRefills: 'Detectando reabastecimientos...',
      detectedRefills: 'Reabastecimientos detectados',
      approve: 'Aprobar',
      cancelDetections: 'Cancelar',
      refillAdded: 'Registros de reabastecimiento añadidos a la despensa.',
      noDetections: 'No se detectaron artículos.',
      labelUnit: 'Unidad',
      labelCategory: 'Categoría',
      labelConfidence: 'Confianza',
      labelNotes: 'Notas',
      newIngredient: 'Ingrediente nuevo',
      currentQty: 'Cantidad actual',
      maxQty: 'Cantidad máxima',
      addToExisting: 'Añadir a existente',
      newIngredientOption: 'Ingrediente nuevo',
      createNewContainer: 'Crear contenedor nuevo',
      existingContainer: 'Contenedor existente',
      setCapacity: 'Establecer límite de capacidad',
      capacity: 'Capacidad',
      clearChat: 'Borrar chat',
      clearConversation: 'Borrar conversación',
      message: 'mensaje',
      messages: 'mensajes',
      aiResponseError: 'Error en la respuesta de la IA.',
      loadConversationError: 'No se pudo cargar la conversación.'
    },
    inventory: {
      dashboard: 'Panel',
      subtitle: 'Análisis de agotamiento e ingesta de ingredientes',
      depletionTrend: '[ TENDENCIA DE AGOTAMIENTO ]',
      remainingStocks: 'Stocks Restantes',
      protein: 'PROTEÍNA',
      avgStock: 'STOCK PROMEDIO',
      fiber: 'FIBRA',
      avgFreshness: 'FRESCURA PROMEDIO',
      emptyTrend: 'Agrega ingredientes para ver tendencias de agotamiento',
      criticalStats: '[ ESTADÍSTICAS CRÍTICAS ]',
      spoilageRisk: 'Riesgo de Descomposición',
      freshness: 'Frescura: {value}%',
      riskLabel: 'Riesgo {risk}',
      quickLogSpinach: 'REGISTRAR CONSUMO DE ESPINACA RÁPIDO',
      refillsDetected: 'Reabastecimientos Detectados',
      synced: 'SINCRONIZADO HACE 2M',
      manualLog: '+ REGISTRO MANUAL',
      manualForm: {
        title: 'Registro Manual de Reabastecimiento',
        close: 'Cerrar',
        ingredientPlaceholder: 'Ingrediente (ej. Harina)',
        unit: 'UNIDAD',
        commit: 'Confirmar Registro',
        del: 'BORRAR'
      },
      table: {
        ingredient: 'Ingrediente',
        qtyAdded: 'Cantidad Añadida',
        method: 'Método',
        confidence: 'Confianza'
      },
      deleteRefill: 'Eliminar reabastecimiento',
      consumptionInsight: 'Insight de Consumo',
      consumptionInsightDesc: 'Esta semana estás consumiendo 15% más proteína que tu promedio de 30 días.'
    },
    settings: {
      title: 'Ajustes',
      subtitle: 'Configura tu entorno de inteligencia de cocina.',
      personalCenter: {
        guest: 'Invitado',
        defaultInfo: 'Cuenta personal de cocina',
        logoutConfirm: '¿Cerrar sesión en tu cuenta?',
        logout: 'CERRAR SESIÓN',
        demoCannotDelete: 'La cuenta de demostración no se puede eliminar.',
        deleteConfirm: '¿Eliminar permanentemente la cuenta "{username}"? Todas las fotos guardadas también se eliminarán. Esto no se puede deshacer.',
        deleteAccount: 'ELIMINAR CUENTA'
      },
      appearance: 'Apariencia',
      darkMode: 'Modo Oscuro',
      darkModeDesc: 'Cambia entre la estética clara y la oscura tipo laboratorio.',
      language: 'Idioma',
      languageDesc: 'Localización preferida de la interfaz.',
      languages: {
        en: 'Inglés (EE.UU.)',
        zh: 'Chino (ZH)',
        es: 'Español'
      },
      intelligence: {
        title: 'Parámetros de Inteligencia',
        active: 'AGENTE_IA: ACTIVO',
        reportLogic: 'Lógica de Generación de Reportes',
        reportLogicDesc: 'Define restricciones o reglas de formato específicas para tus reportes automáticos de inventario de cocina.',
        placeholder: 'ej., Priorizar ingredientes altos en proteína y listar fechas de vencimiento en formato DD/MM/AAAA...',
        updated: 'CONFIGURACIÓN ACTUALIZADA exitosamente',
        save: 'GUARDAR CONFIGURACIÓN'
      },
      diagnostics: {
        title: 'Diagnóstico del Sistema',
        stateReset: 'Restablecer Estado',
        stateResetDesc: 'Borra el estado de almacenamiento local para restaurar los valores preestablecidos originales y los registros de reabastecimiento simulados.',
        resetConfirm: '¿Restablecer el estado del inventario de cocina a los parámetros predeterminados?',
        resetDone: 'Estado de cocina restaurado.',
        restoreDefaults: 'RESTAURAR VALORES DEMO'
      },
      version: 'Versión',
      uptime: 'Tiempo Activo'
    },
    dietAdvice: {
      protein: 'Prioridad de proteína: Consume Huevos Orgánicos (50% restante) y Yogur Griego para cumplir con tus requerimientos diarios de recuperación muscular.',
      fresh: 'Restricción de frescura coincidente: Consume Espinaca (Orgánica) y Albahaca Fresca inmediatamente, ya que sus puntajes de riesgo de descomposición han escalado a Alto.',
      carb: 'Enfoque en carbohidratos: Incorpora Arroz Basmati (92% restante) con grasas dietéticas saludables para sostener bloques de entrenamiento matutinos más largos.',
      waste: 'Estrategia de cero desperdicio activa: Generamos planes de comidas utilizando harina y leche de avena sobrante para reducir la huella de carbono culinaria en un 14%.',
      greens: 'Aumenta el consumo de vegetales de hoja verde según los últimos 7 días. Tu consumo de fibra vegetal es 18% menor que tu objetivo saludable óptimo.',
      spoilage: 'Considera preparar recetas con Espinaca y Albahaca hoy. Tienen riesgos de descomposición altos y alcanzarán frescura crítica en 48 horas.',
      highProtein: 'Enfoque alto en proteína: Yogur Griego y Huevos Orgánicos están disponibles. Consumirlos en el desayuno cubrirá el 35% de tu objetivo diario de proteína.',
      lowStock: 'Los stocks de Harina y Leche de Avena son críticos. Sugerimos agregarlos a tu lista de auto-reabastecimiento para asegurar una preparación de comidas fluida la próxima semana.'
    },
    ingredients: {
      flour: 'Harina',
      oliveOil: 'Aceite de Oliva',
      organicEggs: 'Huevos Orgánicos',
      basmatiRice: 'Arroz Basmati',
      freshBasil: 'Albahaca Fresca',
      walnuts: 'Nueces',
      spinach: 'Espinaca (Orgánica)',
      greekYogurt: 'Yogur Griego',
      oatMilk: 'Leche de Avena'
    },
    refills: {
      basil: 'Albahaca Fresca',
      oliveOil: 'Aceite de Oliva',
      walnuts: 'Nueces'
    }
  }
} as const;

export type Translations = typeof translations.en;
