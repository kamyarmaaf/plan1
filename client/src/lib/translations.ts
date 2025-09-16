export interface Translation {
  // Common
  app_name: string
  welcome: string
  loading: string
  success: string
  error: string
  save: string
  cancel: string
  edit: string
  delete: string
  close: string
  next: string
  previous: string
  complete: string
  
  // Navigation
  nav_dashboard: string
  nav_monthly: string
  nav_progress: string
  nav_goals: string
  nav_contact: string
  nav_settings: string
  
  // Auth
  auth_title: string
  auth_description: string
  auth_login: string
  auth_register: string
  auth_email: string
  auth_password: string
  auth_name: string
  auth_signin: string
  auth_create_account: string
  auth_signing_in: string
  auth_creating_account: string
  
  // Profile Setup
  profile_title: string
  profile_description: string
  profile_step_of: string
  profile_work_study: string
  profile_work_study_placeholder: string
  profile_hobbies: string
  profile_hobbies_placeholder: string
  profile_sports: string
  profile_sports_placeholder: string
  profile_location: string
  profile_location_placeholder: string
  profile_age: string
  profile_weight: string
  profile_height: string
  profile_reading: string
  profile_reading_placeholder: string
  profile_ai_tip: string
  profile_complete: string
  profile_creating: string
  
  // Dashboard
  dashboard_good_morning: string
  dashboard_progress: string
  dashboard_tasks_completed: string
  dashboard_tasks_remaining: string
  dashboard_ai_recommendation: string
  dashboard_ai_suggestion: string
  dashboard_edit_schedule: string
  
  // Tasks
  task_workout: string
  task_meal: string
  task_reading: string
  task_work: string
  task_rest: string
  task_morning_workout: string
  task_healthy_breakfast: string
  task_deep_work: string
  task_reading_time: string
  task_lunch_break: string
  task_afternoon_work: string
  task_rest_reflection: string
  
  // Monthly Planner
  monthly_title: string
  monthly_description: string
  monthly_ai_vision: string
  monthly_projection_6: string
  monthly_projection_12: string
  monthly_goals: string
  monthly_milestones: string
  monthly_track_progress: string
  
  // Progress
  progress_title: string
  progress_description: string
  progress_this_week: string
  progress_this_month: string
  progress_goals_met: string
  progress_achievements: string
  progress_weekly_view: string
  progress_monthly_trends: string
  progress_category_breakdown: string
  progress_task_completion: string
  progress_trends: string
  progress_time_distribution: string
  progress_recent_achievements: string
  
  // Contact
  contact_title: string
  contact_description: string
  contact_email_support: string
  contact_live_chat: string
  contact_phone_support: string
  contact_send_message: string
  contact_name: string
  contact_category: string
  contact_subject: string
  contact_message: string
  contact_send: string
  contact_sending: string
  contact_faq: string
  
  // Categories
  category_fitness: string
  category_learning: string
  category_career: string
  category_personal: string
}

export const translations: Record<'en' | 'fa', Translation> = {
  en: {
    // Common
    app_name: "LifePlan",
    welcome: "Welcome",
    loading: "Loading...",
    success: "Success!",
    error: "Error",
    save: "Save",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",
    close: "Close",
    next: "Next",
    previous: "Previous",
    complete: "Complete",
    
    // Navigation
    nav_dashboard: "Dashboard",
    nav_monthly: "Monthly Planner",
    nav_progress: "Progress",
    nav_goals: "Goals",
    nav_contact: "Contact Us",
    nav_settings: "Settings",
    
    // Auth
    auth_title: "LifePlan",
    auth_description: "Transform your daily routine with AI-powered planning",
    auth_login: "Login",
    auth_register: "Register",
    auth_email: "Email",
    auth_password: "Password",
    auth_name: "Full Name",
    auth_signin: "Sign In",
    auth_create_account: "Create Account",
    auth_signing_in: "Signing in...",
    auth_creating_account: "Creating account...",
    
    // Profile Setup
    profile_title: "Complete Your Profile",
    profile_description: "Help us create your personalized life plan with AI-powered recommendations",
    profile_step_of: "Step {current} of {total}",
    profile_work_study: "What is your current work or study situation?",
    profile_work_study_placeholder: "e.g., Software engineer at tech company, Computer Science student, freelance designer...",
    profile_hobbies: "Hobbies and interests",
    profile_hobbies_placeholder: "e.g., Reading, photography, cooking, gaming, music production...",
    profile_sports: "Preferred sports and exercises",
    profile_sports_placeholder: "e.g., Running, yoga, weightlifting, swimming, basketball...",
    profile_location: "Where do you live?",
    profile_location_placeholder: "e.g., New York, USA or London, UK",
    profile_age: "Age",
    profile_weight: "Weight (kg)",
    profile_height: "Height (cm)",
    profile_reading: "What do you like to read?",
    profile_reading_placeholder: "Leave empty if you'd like AI book recommendations, or tell us your favorite genres, authors, or specific books...",
    profile_ai_tip: "💡 Don't worry if you're not sure what to read - our AI will suggest books based on your interests and goals!",
    profile_complete: "Complete Setup",
    profile_creating: "Creating your plan...",
    
    // Dashboard
    dashboard_good_morning: "Good morning! 👋",
    dashboard_progress: "Today's Progress",
    dashboard_tasks_completed: "{completed} of {total} tasks completed",
    dashboard_tasks_remaining: "{remaining} tasks remaining",
    dashboard_ai_recommendation: "AI Recommendation",
    dashboard_ai_suggestion: "Based on your energy levels, consider moving your reading session to after lunch for better focus. Your workout completion shows great consistency!",
    dashboard_edit_schedule: "Edit Schedule",
    
    // Tasks
    task_workout: "Workout",
    task_meal: "Meal",
    task_reading: "Reading",
    task_work: "Work",
    task_rest: "Rest",
    task_morning_workout: "Morning Workout",
    task_healthy_breakfast: "Healthy Breakfast",
    task_deep_work: "Deep Work Session",
    task_reading_time: "Reading Time",
    task_lunch_break: "Lunch Break",
    task_afternoon_work: "Afternoon Work",
    task_rest_reflection: "Rest & Reflection",
    
    // Monthly Planner
    monthly_title: "Monthly Overview",
    monthly_description: "{month} Planning & Goals",
    monthly_ai_vision: "AI-Powered Vision",
    monthly_projection_6: "At your current pace, you'll complete 24 books this year, achieve a 5K personal best, and master 3 new programming frameworks. Consistency in your morning routine is your key strength.",
    monthly_projection_12: "By maintaining these habits, you'll develop expertise in full-stack development, complete a marathon, and establish yourself as a knowledge leader in your field.",
    monthly_goals: "Monthly Goals",
    monthly_milestones: "Key Milestones",
    monthly_track_progress: "Track your progress this month",
    
    // Progress
    progress_title: "Progress Tracking",
    progress_description: "Visualize your journey and celebrate achievements",
    progress_this_week: "This Week",
    progress_this_month: "This Month",
    progress_goals_met: "Goals Met",
    progress_achievements: "Achievements",
    progress_weekly_view: "Weekly View",
    progress_monthly_trends: "Monthly Trends",
    progress_category_breakdown: "Category Breakdown",
    progress_task_completion: "Weekly Task Completion",
    progress_trends: "Performance across different life areas",
    progress_time_distribution: "How you spend your planned time",
    progress_recent_achievements: "Your latest milestones",
    
    // Contact
    contact_title: "Contact Us",
    contact_description: "Have questions, feedback, or need support? We're here to help you get the most out of your LifePlan experience.",
    contact_email_support: "Email Support",
    contact_live_chat: "Live Chat",
    contact_phone_support: "Phone Support",
    contact_send_message: "Send us a message",
    contact_name: "Full Name",
    contact_category: "Category",
    contact_subject: "Subject",
    contact_message: "Message",
    contact_send: "Send Message",
    contact_sending: "Sending message...",
    contact_faq: "Frequently Asked Questions",
    
    // Categories
    category_fitness: "Fitness",
    category_learning: "Learning",
    category_career: "Career",
    category_personal: "Personal",
  },
  
  fa: {
    // Common
    app_name: "برنامه زندگی",
    welcome: "خوش آمدید",
    loading: "در حال بارگذاری...",
    success: "موفق!",
    error: "خطا",
    save: "ذخیره",
    cancel: "لغو",
    edit: "ویرایش",
    delete: "حذف",
    close: "بستن",
    next: "بعدی",
    previous: "قبلی",
    complete: "تکمیل",
    
    // Navigation
    nav_dashboard: "داشبورد",
    nav_monthly: "برنامه ماهانه",
    nav_progress: "پیشرفت",
    nav_goals: "اهداف",
    nav_contact: "تماس با ما",
    nav_settings: "تنظیمات",
    
    // Auth
    auth_title: "برنامه زندگی",
    auth_description: "روتین روزانه خود را با برنامه‌ریزی هوش مصنوعی تغییر دهید",
    auth_login: "ورود",
    auth_register: "ثبت نام",
    auth_email: "ایمیل",
    auth_password: "رمز عبور",
    auth_name: "نام کامل",
    auth_signin: "ورود",
    auth_create_account: "ایجاد حساب",
    auth_signing_in: "در حال ورود...",
    auth_creating_account: "در حال ایجاد حساب...",
    
    // Profile Setup
    profile_title: "تکمیل پروفایل",
    profile_description: "کمک کنید تا برنامه شخصی‌سازی شده زندگی شما را با توصیه‌های هوش مصنوعی بسازیم",
    profile_step_of: "مرحله {current} از {total}",
    profile_work_study: "وضعیت کاری یا تحصیلی فعلی شما چیست؟",
    profile_work_study_placeholder: "مثلاً، مهندس نرم‌افزار در شرکت فناوری، دانشجوی علوم کامپیوتر، طراح آزاد...",
    profile_hobbies: "سرگرمی‌ها و علایق",
    profile_hobbies_placeholder: "مثلاً، مطالعه، عکاسی، آشپزی، بازی، تولید موسیقی...",
    profile_sports: "ورزش‌ها و تمرینات مورد علاقه",
    profile_sports_placeholder: "مثلاً، دویدن، یوگا، وزنه‌برداری، شنا، بسکتبال...",
    profile_location: "کجا زندگی می‌کنید؟",
    profile_location_placeholder: "مثلاً، تهران، ایران یا نیویورک، آمریکا",
    profile_age: "سن",
    profile_weight: "وزن (کیلوگرم)",
    profile_height: "قد (سانتی‌متر)",
    profile_reading: "چه چیزی دوست دارید بخوانید؟",
    profile_reading_placeholder: "اگر می‌خواهید هوش مصنوعی کتاب پیشنهاد دهد خالی بگذارید، یا ژانرها، نویسندگان یا کتاب‌های مورد علاقه خود را بگویید...",
    profile_ai_tip: "💡 نگران نباشید اگر مطمئن نیستید چه بخوانید - هوش مصنوعی ما بر اساس علایق و اهداف شما کتاب پیشنهاد خواهد داد!",
    profile_complete: "تکمیل راه‌اندازی",
    profile_creating: "در حال ایجاد برنامه شما...",
    
    // Dashboard
    dashboard_good_morning: "صبح بخیر! 👋",
    dashboard_progress: "پیشرفت امروز",
    dashboard_tasks_completed: "{completed} از {total} کار انجام شده",
    dashboard_tasks_remaining: "{remaining} کار باقی مانده",
    dashboard_ai_recommendation: "توصیه هوش مصنوعی",
    dashboard_ai_suggestion: "بر اساس سطح انرژی شما، انتقال جلسه مطالعه به بعد از ناهار برای تمرکز بهتر را در نظر بگیرید. تکمیل تمرینات شما ثبات عالی را نشان می‌دهد!",
    dashboard_edit_schedule: "ویرایش برنامه",
    
    // Tasks
    task_workout: "تمرین",
    task_meal: "غذا",
    task_reading: "مطالعه",
    task_work: "کار",
    task_rest: "استراحت",
    task_morning_workout: "تمرین صبحگاهی",
    task_healthy_breakfast: "صبحانه سالم",
    task_deep_work: "جلسه کار عمیق",
    task_reading_time: "زمان مطالعه",
    task_lunch_break: "استراحت ناهار",
    task_afternoon_work: "کار بعدازظهر",
    task_rest_reflection: "استراحت و تأمل",
    
    // Monthly Planner
    monthly_title: "نمای کلی ماهانه",
    monthly_description: "برنامه‌ریزی و اهداف {month}",
    monthly_ai_vision: "چشم‌انداز هوش مصنوعی",
    monthly_projection_6: "با سرعت فعلی شما، امسال 24 کتاب تمام خواهید کرد، رکورد شخصی 5 کیلومتری به دست خواهید آورد، و 3 فریمورک برنامه‌نویسی جدید تسلط خواهید یافت. ثبات در روتین صبحگاهی نقطه قوت شماست.",
    monthly_projection_12: "با حفظ این عادات، تخصص در توسعه فول‌استک کسب خواهید کرد، ماراتن تمام خواهید کرد، و خود را به عنوان رهبر دانش در زمینه خود معرفی خواهید کرد.",
    monthly_goals: "اهداف ماهانه",
    monthly_milestones: "نقاط عطف کلیدی",
    monthly_track_progress: "پیشرفت خود را این ماه دنبال کنید",
    
    // Progress
    progress_title: "پیگیری پیشرفت",
    progress_description: "سفر خود را تجسم کنید و دستاوردها را جشن بگیرید",
    progress_this_week: "این هفته",
    progress_this_month: "این ماه",
    progress_goals_met: "اهداف تحقق‌یافته",
    progress_achievements: "دستاوردها",
    progress_weekly_view: "نمای هفتگی",
    progress_monthly_trends: "روندهای ماهانه",
    progress_category_breakdown: "تفکیک دسته‌بندی",
    progress_task_completion: "تکمیل کارهای هفتگی",
    progress_trends: "عملکرد در حوزه‌های مختلف زندگی",
    progress_time_distribution: "نحوه صرف زمان برنامه‌ریزی شده",
    progress_recent_achievements: "آخرین نقاط عطف شما",
    
    // Contact
    contact_title: "تماس با ما",
    contact_description: "سوال، بازخورد دارید یا به پشتیبانی نیاز دارید؟ ما اینجا هستیم تا کمک کنیم بیشترین استفاده را از تجربه برنامه زندگی خود داشته باشید.",
    contact_email_support: "پشتیبانی ایمیل",
    contact_live_chat: "گفتگوی زنده",
    contact_phone_support: "پشتیبانی تلفنی",
    contact_send_message: "پیام بفرستید",
    contact_name: "نام کامل",
    contact_category: "دسته‌بندی",
    contact_subject: "موضوع",
    contact_message: "پیام",
    contact_send: "ارسال پیام",
    contact_sending: "در حال ارسال پیام...",
    contact_faq: "سوالات متداول",
    
    // Categories
    category_fitness: "تناسب اندام",
    category_learning: "یادگیری",
    category_career: "شغل",
    category_personal: "شخصی",
  }
}