/** Global i18n: flat keys, `t(key, lang)` with English fallback. */

export type Lang = "en" | "ar";

export const APP_LANG_KEY = "app_lang";

/** Read persisted UI language (for initial state before React mounts). */
export function readStoredLang(): Lang {
  if (typeof window === "undefined") return "en";
  const raw = localStorage.getItem(APP_LANG_KEY);
  if (raw === "ar" || raw === "en") return raw;
  try {
    const pf = localStorage.getItem("pathfinder-storage");
    if (pf) {
      const parsed = JSON.parse(pf) as { state?: { language?: string } };
      const l = parsed?.state?.language;
      if (l === "ar" || l === "en") {
        localStorage.setItem(APP_LANG_KEY, l);
        return l;
      }
    }
  } catch {
    /* ignore */
  }
  return "en";
}

const en: Record<string, string> = {
  // Nav / header
  "nav.home": "Home",
  "nav.compare": "Compare",
  "nav.resume": "Resume",
  "nav.saved": "Saved",
  "nav.profile": "Profile",
  "nav.logout": "Logout",
  "nav.login": "Login",
  "nav.signup": "Signup",
  "nav.about": "About",
  "nav.chat": "Chat",

  // Home
  "home.badge": "AI-Powered Career Guidance",
  "home.tagline": "Discover Your Perfect Career Path",
  "home.subtitle":
    "AI-powered guidance to help you navigate your future, find the right skills, and land your dream job.",
  "home.startBtn": "Start Your Journey",
  "home.exploreCareers": "Explore Careers",
  "home.card1Title": "Personalized Roadmap",
  "home.card1Desc": "Get a step-by-step guide tailored to your skills and goals.",
  "home.card2Title": "Smart Resume",
  "home.card2Desc": "Generate an ATS-friendly resume optimized by AI instantly.",
  "home.card3Title": "Mentor Chat",
  "home.card3Desc": "Ask questions and get advice from your dedicated AI mentor.",

  // Results
  "results.title": "Your Career Roadmap",
  "results.overview": "Career Overview",
  "results.skills": "Skills to Learn",
  "results.majors": "Recommended Majors",
  "results.plan": "Step-by-step Plan",
  "results.resources": "Free Resources",
  "results.alternatives": "Alternative Paths",
  "results.salary": "Salary Expectations",
  "results.motivation": "Advice",
  "results.save": "Save Roadmap",
  "results.download": "Download PDF",
  "results.share": "Share",
  "results.mentor": "Ask Mentor",
  "results.redirecting": "Redirecting…",
  "results.toastSavedDesc": "Roadmap saved successfully",

  // Common
  "common.junior": "Junior",
  "common.mid": "Mid-Level",
  "common.senior": "Senior",
  "common.loading": "Loading...",
  "common.error": "An error occurred.",
  "common.success": "Success!",
  "common.cancel": "Cancel",

  // Auth — login / signup
  "auth.loginTitle": "Log In",
  "auth.signupTitle": "Sign Up",
  "auth.email": "Email",
  "auth.password": "Password",
  "auth.confirmPassword": "Confirm password",
  "auth.name": "Name",
  "auth.logIn": "Log In",
  "auth.signUp": "Sign Up",
  "auth.loggingIn": "Logging in…",
  "auth.signingUp": "Signing up…",
  "auth.continueGoogle": "Continue with Google",
  "auth.continuing": "Continuing…",
  "auth.noAccount": "Don't have an account?",
  "auth.haveAccount": "Already have an account?",
  "auth.signupLink": "Sign Up",
  "auth.loginLink": "Log In",
  "auth.forgotPassword": "Forgot password?",
  "auth.networkError": "Network error. Is the backend running on http://localhost:8080?",
  "auth.networkErrorShort": "Network error. Is the backend running?",
  "auth.or": "Or",
  "auth.passwordMismatch": "Passwords do not match.",
  "auth.invalidEmail": "Please enter a valid email address.",
  "auth.required": "Please fill in all required fields.",
  "auth.resetTokenMissing": "Invalid or missing reset link. Request a new reset email.",
  "auth.googleFail": "Google sign-in failed.",
  "auth.passwordUpdated": "Password updated. You can sign in now.",
  "auth.googleNotConfigured": "Google sign-in is not configured (missing VITE_FIREBASE_* in .env).",
  "auth.googleNoEmail": "Google did not return an email address.",

  // Forgot / reset
  "auth.forgotTitle": "Forgot password",
  "auth.forgotSend": "Send reset link",
  "auth.forgotSending": "Sending…",
  "auth.forgotBack": "Back to log in",
  "auth.forgotSuccessGeneric": "If an account exists for this email, you will receive reset instructions.",
  "auth.resetTitle": "Reset password",
  "auth.resetNew": "New password",
  "auth.resetConfirm": "Confirm password",
  "auth.resetSubmit": "Update password",
  "auth.resetUpdating": "Updating…",
  "auth.resetInvalidLink": "This page needs a valid reset link. Open the link from your email or request a new one.",
  "auth.resetBack": "Back to log in",

  // Chat
  "chat.generating": "Generating your roadmap with AI...",

  // Saved
  "saved.title": "Saved Roadmaps",
  "saved.deleteConfirm": "Delete this roadmap?",
  "saved.loadFail": "Failed to load saved roadmaps.",
  "saved.deleteFail": "Failed to delete roadmap.",
  "saved.emptyTitle": "No saved roadmaps yet",
  "saved.emptyDesc": "Create your first personalized career plan to see it here.",
  "saved.generateBtn": "Generate Roadmap",
  "saved.stepsDone": "steps done",

  // Compare
  "compare.title": "Compare Careers",
  "compare.subtitle": "Not sure which path to take? Put two careers head to head.",
  "compare.placeholder1": "e.g. Software Engineer",
  "compare.placeholder2": "e.g. Data Scientist",
  "compare.submit": "Compare",
  "compare.feature": "Feature",
  "compare.salaryRange": "Salary Range",
  "compare.marketDemand": "Market Demand",
  "compare.difficulty": "Difficulty",
  "compare.education": "Education Req.",
  "compare.coreSkills": "Core Skills",
  "compare.verdict": "AI Verdict",
  "compare.errorFail": "Failed to compare careers. Please try again.",

  // Resume
  "resume.title": "AI Resume Builder",
  "resume.subtitle": "Turn your raw info into a professional, ATS-friendly resume.",
  "resume.labelName": "Full Name",
  "resume.labelGoal": "Career Goal",
  "resume.labelSkills": "Skills (comma separated)",
  "resume.labelEdu": "Education (Optional)",
  "resume.labelExp": "Experience (Optional)",
  "resume.generate": "Generate Resume",
  "resume.generating": "Generating...",
  "resume.previewEmpty": "Fill the form to generate your resume",
  "resume.sectionSummary": "Professional Summary",
  "resume.sectionSkills": "Core Skills",
  "resume.sectionExp": "Experience",
  "resume.sectionEdu": "Education",
  "resume.errorFail": "Failed to generate resume. Please try again.",

  // Profile
  "profile.title": "User Profile",
  "profile.loading": "Loading profile…",
  "profile.basicInfo": "Basic info",
  "profile.professionalInfo": "Professional info",
  "profile.links": "Links",
  "profile.skillsCv": "Skills & CV",
  "profile.fullName": "Full name",
  "profile.email": "Email",
  "profile.phone": "Phone",
  "profile.address": "Address",
  "profile.bio": "Bio",
  "profile.birthDate": "Birth date",
  "profile.university": "University",
  "profile.education": "Education",
  "profile.experienceLevel": "Experience level",
  "profile.careerGoal": "Career goal",
  "profile.linkedin": "LinkedIn URL",
  "profile.github": "GitHub URL",
  "profile.portfolio": "Portfolio URL",
  "profile.skillsComma": "Skills (comma-separated)",
  "profile.uploadCv": "Upload CV (PDF)",
  "profile.uploading": "Uploading…",
  "profile.viewCv": "View current CV",
  "profile.deleteAccount": "Delete account",
  "profile.deleteTitle": "Delete account",
  "profile.deleteConfirm":
    "Are you sure you want to delete your account? This action cannot be undone.",
  "profile.deleteCancel": "Cancel",
  "profile.deleteSubmit": "Delete account",
  "profile.deleting": "Deleting…",
  "profile.save": "Save changes",
  "profile.saving": "Saving…",
  "profile.logout": "Logout",
  "profile.saveSuccess": "Your data has been updated successfully ✅",
  "profile.deletePhoto": "Delete Photo",
  "profile.changePhoto": "Change Photo",
  "profile.expOptBeginner": "Beginner",
  "profile.expOptIntermediate": "Intermediate",
  "profile.expOptAdvanced": "Advanced",
  "profile.loadErrorGeneric": "Could not load profile.",
  "profile.saveErrorGeneric": "Could not save profile. Check your connection.",
  "profile.cvUploadFail": "Upload failed. Try again.",
  "profile.deleteFailGeneric": "Could not delete account.",

  // Not found
  "notFound.title": "404 Page Not Found",
  "notFound.body": "Did you forget to add the page to the router?",

  // Error boundary
  "error.title": "Something broke",
  "error.reload": "Reload app",

  // About
  "about.badge": "The Future of Tech Careers",
  "about.heroTitle1": "What is",
  "about.heroTitle2": "?",
  "about.heroDesc": "PathFinder AI is a production-level, all-in-one programming career intelligence ecosystem. We empower software engineers, students, and freelancers with expert AI guidance to navigate the complex world of tech.",
  "about.heroCheck1": "AI-Powered Mentorship",
  "about.heroCheck2": "Real Salary Intelligence",
  "about.heroCheck3": "ATS Resume Architecture",
  "about.f6Title": "6. Smart Career Validation",
"about.f6Desc": "An AI-powered validation layer that checks your chosen career path against real market demand, ensuring you never waste time on low-growth or outdated skills.",
  "about.howTitle": "How The Ecosystem Works",
  "about.howDesc": "Five core pillars designed to elevate your professional trajectory from absolute beginner to senior architect.",
  "about.f1Title": "1. AI Chat Mentor",
  "about.f1Desc": "A deeply specialized conversational engine that builds step-by-step programming roadmaps tailored to your unique profile.",
  "about.f2Title": "2. Career Compare",
  "about.f2Desc": "Put two tech paths head-to-head. Analyze 25+ metrics including real-time EGP/USD salaries, burnout risks, and job demand.",
  "about.f3Title": "3. ATS Resume Builder",
  "about.f3Desc": "Generate a premium, recruiter-ready professional identity, complete with LinkedIn, GitHub, and Portfolio optimization.",
  "about.f4Title": "4. Saved Intelligence",
  "about.f4Desc": "A persistent memory system to safely store all your career paths, generated CVs, and comparison reports.",
  "about.f5Title": "5. Real-Time Market Data",
  "about.f5Desc": "Always up-to-date with live currency exchange integration for accurate global and local financial expectations.",
  
  "about.guideTitle": "Your Professional Journey",
  "about.s1Title": "Step 1: Ask AI",
  "about.s1Desc": "Input your skills and goals into the Chat. Receive a massive 10-stage technical roadmap.",
  "about.s2Title": "Step 2: Compare",
  "about.s2Desc": "Torn between AI and Mobile Dev? Use the Comparison Engine for a data-driven final verdict.",
  "about.s3Title": "Step 3: Build Resume",
  "about.s3Desc": "Convert your raw data into a master-class professional identity with the Premium CV Builder.",
  "about.s4Title": "Step 4: Optimize",
  "about.s4Desc": "Apply the AI-generated LinkedIn headlines, GitHub bios, and ATS keywords to your profiles.",
  "about.s5Title": "Step 5: Save & Learn",
  "about.s5Desc": "Bookmark your roadmaps to your account. Follow the free Harvard, MIT, and YouTube resources provided.",
  "about.s6Title": "Step 6: Apply",
  "about.s6Desc": "Enter the market with extreme confidence, knowing exact salary bands and interview pitfalls to avoid.",
  
  "about.diffTitle": "Why PathFinder AI is Different",
  "about.diffDesc": "We do not provide generic advice. We provide engineering blueprints.",
  "about.d1Title": "100% Programming Specialized",
  "about.d1Desc": "The AI engine is strictly locked to Tech careers. It understands the difference between React and Angular, AWS and Azure, Junior and Mid-level expectations.",
  "about.d2Title": "Real Market Intelligence",
  "about.d2Desc": "It factors in Remote work vs Local Egyptian/Gulf markets, providing dynamic salary calculations to prevent under-pricing your skills.",

  "about.teamBadge": "The Visionaries",
  "about.teamTitle": "Meet The Team",
  "about.teamDesc": "The engineers, designers, and scientists behind the ultimate career intelligence platform.",

  "about.ctaTitle1": "Build Your Future with",
  "about.ctaBtn": "Start Your Journey",

  // Universal Assistant
  "universal.title": "PathFinder AI",
  "universal.welcome": "Ask me anything. I'm here to help.",
  "universal.placeholder": "Ask anything...",
};

const ar: Record<string, string> = {
  "nav.home": "الرئيسية",
  "nav.compare": "مقارنة",
  "nav.resume": "السيرة الذاتية",
  "nav.saved": "المحفوظات",
  "nav.profile": "البروفايل",
  "nav.logout": "تسجيل خروج",
  "nav.login": "تسجيل دخول",
  "nav.signup": "إنشاء حساب",
  "nav.about": "عن الموقع",
  "nav.chat": "الدردشة",

  "home.badge": "توجيه مهني مدعوم بالذكاء الاصطناعي",
  "home.tagline": "اكتشف مسارك المهني المثالي",
  "home.subtitle":
    "توجيه مدعوم بالذكاء الاصطناعي لمساعدتك في التنقل في مستقبلك، العثور على المهارات المناسبة، والحصول على وظيفة أحلامك.",
  "home.startBtn": "ابدأ رحلتك",
  "home.exploreCareers": "استكشف المهن",
  "home.card1Title": "خريطة طريق مخصصة",
  "home.card1Desc": "احصل على دليل خطوة بخطوة مصمم لمهاراتك وأهدافك.",
  "home.card2Title": "سيرة ذكية",
  "home.card2Desc": "أنشئ سيرة ذاتية متوافقة مع أنظمة التتبع ومحسّنة بالذكاء الاصطناعي فوراً.",
  "home.card3Title": "دردشة المرشد",
  "home.card3Desc": "اطرح أسئلة واحصل على نصيحة من مرشدك الذكي.",

  "results.title": "خريطة طريقك المهنية",
  "results.overview": "نظرة عامة",
  "results.skills": "المهارات المطلوبة",
  "results.majors": "التخصصات الموصى بها",
  "results.plan": "خطة خطوة بخطوة",
  "results.resources": "مصادر مجانية",
  "results.alternatives": "مسارات بديلة",
  "results.salary": "توقعات الراتب",
  "results.motivation": "نصيحة",
  "results.save": "حفظ الخريطة",
  "results.download": "تحميل PDF",
  "results.share": "مشاركة",
  "results.mentor": "اسأل المرشد",
  "results.redirecting": "جاري إعادة التوجيه…",
  "results.toastSavedDesc": "تم حفظ خريطة الطريق بنجاح",

  "common.junior": "مبتدئ",
  "common.mid": "متوسط",
  "common.senior": "خبير",
  "common.loading": "جاري التحميل...",
  "common.error": "حدث خطأ.",
  "common.success": "تم بنجاح!",
  "common.cancel": "إلغاء",

  "auth.loginTitle": "تسجيل الدخول",
  "auth.signupTitle": "إنشاء حساب",
  "auth.email": "البريد الإلكتروني",
  "auth.password": "كلمة المرور",
  "auth.confirmPassword": "تأكيد كلمة المرور",
  "auth.name": "الاسم",
  "auth.logIn": "تسجيل الدخول",
  "auth.signUp": "إنشاء حساب",
  "auth.loggingIn": "جارٍ تسجيل الدخول…",
  "auth.signingUp": "جارٍ إنشاء الحساب…",
  "auth.continueGoogle": "المتابعة باستخدام Google",
  "auth.continuing": "جارٍ المتابعة…",
  "auth.noAccount": "ليس لديك حساب؟",
  "auth.haveAccount": "لديك حساب بالفعل؟",
  "auth.signupLink": "إنشاء حساب",
  "auth.loginLink": "تسجيل الدخول",
  "auth.forgotPassword": "نسيت كلمة المرور؟",
  "auth.networkError": "خطأ في الشبكة. هل يعمل الخادم على http://localhost:8080؟",
  "auth.networkErrorShort": "خطأ في الشبكة. هل يعمل الخادم؟",
  "auth.or": "أو",
  "auth.passwordMismatch": "كلمتا المرور غير متطابقتين.",
  "auth.invalidEmail": "يرجى إدخال بريد إلكتروني صحيح.",
  "auth.required": "يرجى تعبئة جميع الحقول المطلوبة.",
  "auth.resetTokenMissing": "رابط إعادة التعيين غير صالح أو مفقود. اطلب رسالة جديدة.",
  "auth.googleFail": "فشل تسجيل الدخول بـ Google.",
  "auth.passwordUpdated": "تم تحديث كلمة المرور. يمكنك تسجيل الدخول الآن.",
  "auth.googleNotConfigured": "تسجيل الدخول بـ Google غير مُعد (أضف VITE_FIREBASE_* في .env).",
  "auth.googleNoEmail": "لم يُرجع Google عنوان بريد إلكتروني.",

  "auth.forgotTitle": "نسيت كلمة المرور",
  "auth.forgotSend": "إرسال رابط إعادة التعيين",
  "auth.forgotSending": "جارٍ الإرسال…",
  "auth.forgotBack": "العودة لتسجيل الدخول",
  "auth.forgotSuccessGeneric": "إذا كان هناك حساب لهذا البريد، ستصلك تعليمات إعادة التعيين.",
  "auth.resetTitle": "إعادة تعيين كلمة المرور",
  "auth.resetNew": "كلمة مرور جديدة",
  "auth.resetConfirm": "تأكيد كلمة المرور",
  "auth.resetSubmit": "تحديث كلمة المرور",
  "auth.resetUpdating": "جارٍ التحديث…",
  "auth.resetInvalidLink": "تحتاج هذه الصفحة إلى رابط صالح. افتح الرابط من بريدك أو اطلب رسالة جديدة.",
  "auth.resetBack": "العودة لتسجيل الدخول",

  "chat.generating": "جاري إنشاء خريطة الطريق بالذكاء الاصطناعي...",

  "saved.title": "خرائط الطريق المحفوظة",
  "saved.deleteConfirm": "حذف هذه الخريطة؟",
  "saved.loadFail": "تعذر تحميل الخرائط المحفوظة.",
  "saved.deleteFail": "تعذر حذف الخريطة.",
  "saved.emptyTitle": "لا توجد خرائط محفوظة بعد",
  "saved.emptyDesc": "أنشئ أول خطة مهنية مخصصة لتظهر هنا.",
  "saved.generateBtn": "إنشاء خريطة طريق",
  "saved.stepsDone": "خطوات مكتملة",

  "compare.title": "مقارنة المهن",
  "compare.subtitle": "لست متأكداً أي مسار تختار؟ قارن بين مهنتين.",
  "compare.placeholder1": "مثال: مهندس برمجيات",
  "compare.placeholder2": "مثال: عالم بيانات",
  "compare.submit": "قارن",
  "compare.feature": "الميزة",
  "compare.salaryRange": "نطاق الراتب",
  "compare.marketDemand": "الطلب في السوق",
  "compare.difficulty": "الصعوبة",
  "compare.education": "المتطلبات التعليمية",
  "compare.coreSkills": "المهارات الأساسية",
  "compare.verdict": "خلاصة الذكاء الاصطناعي",
  "compare.errorFail": "فشلت المقارنة. حاول مرة أخرى.",

  "resume.title": "منشئ السيرة الذاتية بالذكاء الاصطناعي",
  "resume.subtitle": "حوّل معلوماتك إلى سيرة ذاتية احترافية ومتوافقة مع أنظمة التتبع.",
  "resume.labelName": "الاسم الكامل",
  "resume.labelGoal": "الهدف المهني",
  "resume.labelSkills": "المهارات (مفصولة بفواصل)",
  "resume.labelEdu": "التعليم (اختياري)",
  "resume.labelExp": "الخبرة (اختياري)",
  "resume.generate": "إنشاء السيرة الذاتية",
  "resume.generating": "جارٍ الإنشاء...",
  "resume.previewEmpty": "املأ النموذج لإنشاء سيرتك الذاتية",
  "resume.sectionSummary": "الملخص المهني",
  "resume.sectionSkills": "المهارات الأساسية",
  "resume.sectionExp": "الخبرة",
  "resume.sectionEdu": "التعليم",
  "resume.errorFail": "فشل إنشاء السيرة الذاتية. حاول مرة أخرى.",

  "profile.title": "ملف المستخدم",
  "profile.loading": "جارٍ تحميل الملف…",
  "profile.basicInfo": "المعلومات الأساسية",
  "profile.professionalInfo": "المعلومات المهنية",
  "profile.links": "روابط",
  "profile.skillsCv": "المهارات والسيرة الذاتية",
  "profile.fullName": "الاسم الكامل",
  "profile.email": "البريد الإلكتروني",
  "profile.phone": "رقم الهاتف",
  "profile.address": "العنوان",
  "profile.bio": "نبذة",
  "profile.birthDate": "تاريخ الميلاد",
  "profile.university": "الجامعة",
  "profile.education": "التعليم",
  "profile.experienceLevel": "مستوى الخبرة",
  "profile.careerGoal": "الهدف المهني",
  "profile.linkedin": "رابط LinkedIn",
  "profile.github": "رابط GitHub",
  "profile.portfolio": "رابط المحفظة",
  "profile.skillsComma": "المهارات (مفصولة بفواصل)",
  "profile.uploadCv": "رفع السيرة الذاتية (PDF)",
  "profile.uploading": "جارٍ الرفع…",
  "profile.viewCv": "عرض السيرة الحالية",
  "profile.deleteAccount": "حذف الحساب",
  "profile.deleteTitle": "حذف الحساب",
  "profile.deleteConfirm": "هل أنت متأكد أنك تريد حذف حسابك؟ لا يمكن التراجع عن هذا الإجراء.",
  "profile.deleteCancel": "إلغاء",
  "profile.deleteSubmit": "حذف الحساب",
  "profile.deleting": "جارٍ الحذف…",
  "profile.save": "حفظ التعديلات",
  "profile.saving": "جارٍ الحفظ…",
  "profile.logout": "تسجيل خروج",
  "profile.saveSuccess": "تم تحديث بياناتك بنجاح ✅",
  "profile.deletePhoto": "حذف الصورة",
  "profile.changePhoto": "تغيير الصورة",
  "profile.expOptBeginner": "مبتدئ",
  "profile.expOptIntermediate": "متوسط",
  "profile.expOptAdvanced": "متقدم",
  "profile.loadErrorGeneric": "تعذر تحميل الملف.",
  "profile.saveErrorGeneric": "تعذر حفظ الملف. تحقق من الاتصال.",
  "profile.cvUploadFail": "فشل الرفع. حاول مرة أخرى.",
  "profile.deleteFailGeneric": "تعذر حذف الحساب.",

  "notFound.title": "404 الصفحة غير موجودة",
  "notFound.body": "هل نسيت إضافة الصفحة إلى الموجه؟",

  "error.title": "حدث عطل",
  "error.reload": "إعادة تحميل التطبيق",

  "about.badge": "مستقبل المهن التقنية",
  "about.heroTitle1": "ما هو",
  "about.heroTitle2": "؟",
  "about.heroDesc": "PathFinder AI هو نظام ذكي متكامل للمسارات المهنية البرمجية. نمكّن مهندسي البرمجيات والطلاب والمستقلين بتوجيه ذكي خبير لاجتياز عالم التكنولوجيا المعقد.",
  "about.heroCheck1": "إرشاد مهني بالذكاء الاصطناعي",
  "about.heroCheck2": "ذكاء رواتب حقيقي",
  "about.heroCheck3": "معمارية سير ذاتية احترافية",
"about.f6Title": "6. التحقق الذكي من المسار المهني",
"about.f6Desc": "طبقة ذكاء اصطناعي تتحقق من اختيارك المهني حسب الطلب الحقيقي في السوق لتتأكد أنك لا تضيع وقتك في مهارات ضعيفة أو غير مطلوبة.",
  "about.howTitle": "كيف يعمل النظام",
  "about.howDesc": "خمس ركائز أساسية مصممة للارتقاء بمسارك المهني من مبتدئ إلى مهندس خبير.",
  "about.f1Title": "1. مرشد المحادثة الذكي",
  "about.f1Desc": "محرك محادثة متخصص يبني خرائط طريق برمجية خطوة بخطوة مصممة لملفك الشخصي.",
  "about.f2Title": "2. مقارنة المهن",
  "about.f2Desc": "قارن بين مسارين تقنيين. حلل أكثر من 25 مقياسًا بما في ذلك الرواتب، وخطر الإرهاق، والطلب الوظيفي.",
  "about.f3Title": "3. منشئ السيرة الذاتية",
  "about.f3Desc": "أنشئ هوية احترافية جاهزة للمقابلات، مع تحسين LinkedIn و GitHub ومعرض الأعمال.",
  "about.f4Title": "4. الاستخبارات المحفوظة",
  "about.f4Desc": "نظام ذاكرة دائم لحفظ مساراتك المهنية، والسير الذاتية، وتقارير المقارنة بأمان.",
  "about.f5Title": "5. بيانات السوق لحظياً",
  "about.f5Desc": "دائماً محدث مع تكامل أسعار العملات لتوقعات مالية محلية وعالمية دقيقة.",

  "about.guideTitle": "رحلتك المهنية",
  "about.s1Title": "الخطوة 1: اسأل الذكاء الاصطناعي",
  "about.s1Desc": "أدخل مهاراتك وأهدافك. احصل على خريطة طريق تقنية ضخمة من 10 مراحل.",
  "about.s2Title": "الخطوة 2: قارن",
  "about.s2Desc": "محتار بين الذكاء الاصطناعي وتطوير الجوال؟ استخدم محرك المقارنة للحصول على قرار مبني على البيانات.",
  "about.s3Title": "الخطوة 3: السيرة الذاتية",
  "about.s3Desc": "حوّل بياناتك إلى هوية احترافية مذهلة مع منشئ السير الذاتية الاحترافي.",
  "about.s4Title": "الخطوة 4: التحسين",
  "about.s4Desc": "طبّق العناوين المقترحة لـ LinkedIn والكلمات المفتاحية على ملفاتك.",
  "about.s5Title": "الخطوة 5: الحفظ والتعلم",
  "about.s5Desc": "احفظ الخرائط في حسابك. اتبع المصادر المجانية من هارفارد ويوتيوب.",
  "about.s6Title": "الخطوة 6: التقديم",
  "about.s6Desc": "ادخل السوق بثقة تامة، وأنت تعرف الرواتب الدقيقة وأخطاء المقابلات لتجنبها.",

  "about.diffTitle": "لماذا PathFinder AI مختلف",
  "about.diffDesc": "نحن لا نقدم نصائح عامة. نحن نقدم مخططات هندسية دقيقة.",
  "about.d1Title": "100% مخصص للبرمجة",
  "about.d1Desc": "محرك الذكاء الاصطناعي مقفل حصريًا للمهن التقنية. هو يفهم الفرق بين React و Angular والتوقعات بين المبتدئ والمتوسط.",
  "about.d2Title": "ذكاء سوق حقيقي",
  "about.d2Desc": "يأخذ في الاعتبار العمل عن بعد مقابل السوق المحلي، مما يوفر حسابات ديناميكية للرواتب لمنع بخس مهاراتك.",

  "about.teamBadge": "أصحاب الرؤية",
  "about.teamTitle": "فريق العمل",
  "about.teamDesc": "المهندسون والمصممون والعلماء الذين يقفون وراء منصة التوجيه المهني المتميزة.",

  "about.ctaTitle1": "ابنِ مستقبلك مع",
  "about.ctaBtn": "ابدأ رحلتك",

  // Universal Assistant
  "universal.title": "PathFinder AI",
  "universal.welcome": "اسأل عن أي شيء. أنا هنا لمساعدتك.",
  "universal.placeholder": "اسأل عن أي شيء...",
};

const STRINGS: Record<Lang, Record<string, string>> = { en, ar };

export function t(key: string, lang: Lang): string {
  const localized = STRINGS[lang]?.[key];
  if (localized !== undefined && localized !== "") return localized;
  const fallback = STRINGS.en[key];
  if (fallback !== undefined && fallback !== "") return fallback;
  return key;
}

export type ChatOption = { value: string; label: string };

export type ChatBundle = {
  questions: string[];
  educationOptions: ChatOption[];
  challengeOptions: ChatOption[];
  inputPlaceholder: string;
  send: string;
};

const CHAT: Record<Lang, ChatBundle> = {
  en: {
    questions: [
      "What career or field are you most interested in?",
      "What is your current education level?",
      "What skills or hobbies do you currently have?",
      "What is your biggest challenge right now?"
    ],
    educationOptions: [
      { value: "high_school", label: "High School" },
      { value: "university", label: "University Student" },
      { value: "graduate", label: "University Graduate" },
      { value: "self_learner", label: "Self Learner" }
    ],
    challengeOptions: [
      { value: "dont_know_start", label: "Don't know where to start" },
      { value: "dont_know_study", label: "Don't know what to study" },
      { value: "cant_afford", label: "Can't afford university" },
      { value: "feel_lost", label: "I feel lost" }
    ],
    inputPlaceholder: "Type your answer here...",
    send: "Send"
  },
  ar: {
    questions: [
      "ما هو المجال أو المهنة التي تثير اهتمامك أكثر؟",
      "ما هو مستواك التعليمي الحالي؟",
      "ما هي المهارات أو الهوايات التي تمتلكها حالياً؟",
      "ما هو أكبر تحد تواجهه الآن؟"
    ],
    educationOptions: [
      { value: "high_school", label: "ثانوية عامة" },
      { value: "university", label: "طالب جامعي" },
      { value: "graduate", label: "خريج جامعي" },
      { value: "self_learner", label: "التعلم الذاتي" }
    ],
    challengeOptions: [
      { value: "dont_know_start", label: "لا أعرف من أين أبدأ" },
      { value: "dont_know_study", label: "لا أعرف ماذا أدرس" },
      { value: "cant_afford", label: "لا أستطيع تحمل تكاليف الجامعة" },
      { value: "feel_lost", label: "أشعر بالضياع" }
    ],
    inputPlaceholder: "اكتب إجابتك هنا...",
    send: "إرسال"
  }
};

export function getChatBundle(lang: Lang): ChatBundle {
  return CHAT[lang] ?? CHAT.en;
}

export const isRtl = (lang: Lang): boolean => lang === "ar";
