import type { LocaleCode } from '@/types';

type TranslationKey =
  // ── Settings ──────────────────────────────────────
  | 'settings.title'
  | 'settings.profile.heading'
  | 'settings.profile.avatarChange'
  | 'settings.profile.fullName'
  | 'settings.profile.email'
  | 'settings.profile.save'
  | 'settings.profile.saved'
  | 'settings.password.heading'
  | 'settings.password.current'
  | 'settings.password.new'
  | 'settings.password.confirm'
  | 'settings.password.mismatch'
  | 'settings.password.tooShort'
  | 'settings.password.reauthFailed'
  | 'settings.password.changed'
  | 'settings.password.change'
  | 'settings.language.heading'
  | 'settings.language.description'
  | 'settings.language.saved'
  | 'settings.factory.heading'
  | 'settings.factory.name'
  | 'settings.factory.industry'
  | 'settings.factory.address'
  | 'settings.factory.contact'
  | 'settings.factory.save'
  | 'settings.factory.saved'
  | 'settings.factory.industryPlaceholder'
  | 'settings.usersManagement.heading'
  | 'settings.usersManagement.description'
  | 'settings.usersManagement.action'
  | 'settings.personalAccount'
  | 'settings.interfaceLanguage'
  | 'settings.errors.fileType'
  | 'settings.errors.fileSize'
  // ── Common ────────────────────────────────────────
  | 'common.saving'
  | 'common.error'
  | 'common.loading'
  | 'common.searchPlaceholder'
  | 'common.cancel'
  | 'common.save'
  | 'common.edit'
  | 'common.delete'
  | 'common.add'
  | 'common.actions'
  | 'common.approve'
  | 'common.postpone'
  | 'common.days'
  // ── Sidebar ───────────────────────────────────────
  | 'sidebar.dashboard'
  | 'sidebar.productionPlanning'
  | 'sidebar.suppliers'
  | 'sidebar.rawMaterials'
  | 'sidebar.products'
  | 'sidebar.orders'
  | 'sidebar.schedule'
  | 'sidebar.productionTracking'
  | 'sidebar.machineMaintenance'
  | 'sidebar.userManagement'
  | 'sidebar.settings'
  | 'sidebar.brand'
  | 'sidebar.customers'
  | 'sidebar.technicalSupport'
  | 'sidebar.logout'
  // ── Login ─────────────────────────────────────────
  | 'login.brand'
  | 'login.subtitle'
  | 'login.email'
  | 'login.password'
  | 'login.forgotPassword'
  | 'login.submit'
  | 'login.loading'
  | 'login.noAccount'
  | 'login.createAccount'
  | 'login.footerCopyright'
  | 'login.terms'
  | 'login.privacy'
  | 'login.support'
  | 'login.errors.invalidCredentials'
  | 'login.errors.emailNotConfirmed'
  | 'login.errors.tooManyRequests'
  | 'login.errors.userNotFound'
  | 'login.errors.loginFailed'
  | 'login.errors.unexpected'
  // ── Signup ────────────────────────────────────────
  | 'signup.brand'
  | 'signup.title'
  | 'signup.factoryName'
  | 'signup.factoryPlaceholder'
  | 'signup.fullName'
  | 'signup.fullNamePlaceholder'
  | 'signup.email'
  | 'signup.password'
  | 'signup.submit'
  | 'signup.loading'
  | 'signup.hasAccount'
  | 'signup.login'
  | 'signup.footerCopyright'
  | 'signup.terms'
  | 'signup.privacy'
  | 'signup.support'
  | 'signup.errors.registrationFailed'
  | 'signup.success'
  | 'signup.errors.serverError'
  // ── Forgot Password ───────────────────────────────
  | 'forgotPassword.brand'
  | 'forgotPassword.subtitle'
  | 'forgotPassword.title'
  | 'forgotPassword.description'
  | 'forgotPassword.email'
  | 'forgotPassword.submit'
  | 'forgotPassword.loading'
  | 'forgotPassword.backToLogin'
  | 'forgotPassword.footerCopyright'
  | 'forgotPassword.terms'
  | 'forgotPassword.privacy'
  | 'forgotPassword.support'
  | 'forgotPassword.errors.invalidEmail'
  | 'forgotPassword.errors.noAccount'
  | 'forgotPassword.errors.tooManyRequests'
  | 'forgotPassword.success'
  | 'forgotPassword.errors.unexpected'
  // ── Reset Password ────────────────────────────────
  | 'resetPassword.title'
  | 'resetPassword.description'
  | 'resetPassword.newPassword'
  | 'resetPassword.confirmPassword'
  | 'resetPassword.submit'
  | 'resetPassword.submitLoading'
  | 'resetPassword.linkExpired'
  | 'resetPassword.linkExpiredDescription'
  | 'resetPassword.newLink'
  | 'resetPassword.strength.weak'
  | 'resetPassword.strength.medium'
  | 'resetPassword.strength.good'
  | 'resetPassword.strength.strong'
  | 'resetPassword.errors.passwordsMismatch'
  | 'resetPassword.errors.tooShort'
  | 'resetPassword.errors.sameAsOld'
  | 'resetPassword.errors.tooShortAuth'
  | 'resetPassword.errors.unexpected'
  | 'resetPassword.success'
  // ── Landing Page ──────────────────────────────────
  | 'landing.brand'
  | 'landing.nav.about'
  | 'landing.nav.features'
  | 'landing.nav.pricing'
  | 'landing.nav.login'
  | 'landing.nav.startNow'
  | 'landing.hero.headline'
  | 'landing.hero.desc1'
  | 'landing.hero.desc2'
  | 'landing.hero.statusPending'
  | 'landing.hero.statusInProgress'
  | 'landing.hero.statusCompleted'
  | 'landing.hero.order1Title'
  | 'landing.hero.order2Title'
  | 'landing.hero.order3Title'
  | 'landing.hero.progress'
  | 'landing.features.planning.title'
  | 'landing.features.planning.desc'
  | 'landing.features.tracking.title'
  | 'landing.features.tracking.desc'
  | 'landing.features.maintenance.title'
  | 'landing.features.maintenance.desc'
  | 'landing.why.title'
  | 'landing.offline.title'
  | 'landing.offline.desc'
  | 'landing.offline.bullet1'
  | 'landing.offline.bullet2'
  | 'landing.cta.title'
  | 'landing.cta.desc'
  | 'landing.cta.demo'
  | 'landing.cta.expert'
  | 'landing.footer.brand'
  | 'landing.footer.copyright'
  | 'landing.footer.contact'
  | 'landing.footer.terms'
  | 'landing.footer.privacy'
  // ── Dashboard ─────────────────────────────────────
  | 'dashboard.status.pending'
  | 'dashboard.status.inProgress'
  | 'dashboard.status.completed'
  | 'dashboard.status.cancelled'
  | 'dashboard.due.overdue'
  | 'dashboard.due.upcoming'
  | 'dashboard.due.onTrack'
  | 'dashboard.searchPlaceholder'
  | 'dashboard.activeWorkOrders.title'
  | 'dashboard.activeWorkOrders.needsAttention'
  | 'dashboard.activeWorkOrders.noOrders'
  | 'dashboard.maintenanceAlerts.title'
  | 'dashboard.maintenanceAlerts.needsAction'
  | 'dashboard.maintenanceAlerts.allGood'
  | 'dashboard.stoppedMachines.title'
  | 'dashboard.stoppedMachines.none'
  | 'dashboard.stoppedMachines.some'
  | 'dashboard.productionLive.title'
  | 'dashboard.productionLive.showAll'
  | 'dashboard.productionLive.orderId'
  | 'dashboard.productionLive.product'
  | 'dashboard.productionLive.status'
  | 'dashboard.productionLive.actions'
  | 'dashboard.productionLive.empty'
  | 'dashboard.recentActivity.title'
  | 'dashboard.recentActivity.justNow'
  | 'dashboard.recentActivity.completedOrder'
  | 'dashboard.recentActivity.inProgressOrder'
  | 'dashboard.recentActivity.newOrder'
  | 'dashboard.recentActivity.empty'
  | 'dashboard.machines.title'
  | 'dashboard.machines.showAll'
  | 'dashboard.machines.name'
  | 'dashboard.machines.lastMaintenance'
  | 'dashboard.machines.nextMaintenance'
  | 'dashboard.machines.status'
  | 'dashboard.machines.empty'
  | 'dashboard.machines.lastLabel'
  | 'dashboard.machines.nextLabel'
  | 'dashboard.time.now'
  | 'dashboard.time.minutesAgo'
  | 'dashboard.time.hoursAgo'
  | 'dashboard.time.daysAgo'
  // ── Roles ─────────────────────────────────────────
  | 'role.owner'
  | 'role.worker'
  // ── Orders ────────────────────────────────────────
  | 'orders.title'
  | 'orders.addOrder'
  | 'orders.add'
  | 'orders.editOrder'
  | 'orders.orderData'
  | 'orders.product'
  | 'orders.productPlaceholder'
  | 'orders.quantity'
  | 'orders.dueDate'
  | 'orders.customerName'
  | 'orders.submitSaving'
  | 'orders.submitSave'
  | 'orders.empty'
  | 'orders.productLabel'
  | 'orders.quantityLabel'
  | 'orders.customerLabel'
  | 'orders.dueDateLabel'
  | 'orders.orderNumber'
  | 'orders.table.status'
  | 'orders.table.actions'
  | 'orders.moveToProduction'
  | 'orders.moving'
  | 'orders.errors.required'
  | 'orders.errors.updateFailed'
  | 'orders.errors.addFailed'
  | 'orders.deleteTooltip'
  | 'orders.deleteConfirm'
  | 'orders.deleteDescription'
  | 'orders.errors.deleteFailed'
  | 'orders.errors.cannotDelete'
  | 'orders.status.draft'
  | 'orders.status.processing'
  | 'orders.status.confirmed'
  // ── Suppliers ─────────────────────────────────────
  | 'suppliers.title'
  | 'suppliers.addSupplier'
  | 'suppliers.add'
  | 'suppliers.editSupplier'
  | 'suppliers.supplierData'
  | 'suppliers.name'
  | 'suppliers.phone'
  | 'suppliers.emailOptional'
  | 'suppliers.supplyDuration'
  | 'suppliers.minimumOrder'
  | 'suppliers.minimumOrderDesktop'
  | 'suppliers.submitSaving'
  | 'suppliers.submitSave'
  | 'suppliers.empty'
  | 'suppliers.phoneLabel'
  | 'suppliers.supplyDurationLabel'
  | 'suppliers.minimumOrderLabel'
  | 'suppliers.table.name'
  | 'suppliers.table.phone'
  | 'suppliers.table.supplyDuration'
  | 'suppliers.table.minimumOrder'
  | 'suppliers.table.status'
  | 'suppliers.table.actions'
  | 'suppliers.status.active'
  | 'suppliers.status.inactive'
  | 'suppliers.errors.nameRequired'
  | 'suppliers.errors.updateFailed'
  | 'suppliers.errors.addFailed'
  // ── Products ──────────────────────────────────────
  | 'products.title'
  | 'products.addProduct'
  | 'products.add'
  | 'products.editProduct'
  | 'products.productData'
  | 'products.basicInfo'
  | 'products.name'
  | 'products.unit'
  | 'products.manufacturingTime'
  | 'products.bom'
  | 'products.addMaterial'
  | 'products.noMaterials'
  | 'products.materialPlaceholder'
  | 'products.quantityPlaceholder'
  | 'products.submitSaving'
  | 'products.submitSave'
  | 'products.empty'
  | 'products.unitLabel'
  | 'products.materialsCount'
  | 'products.costNotCalculated'
  | 'products.table.name'
  | 'products.table.unit'
  | 'products.table.materialsCount'
  | 'products.table.totalCost'
  | 'products.table.productionTime'
  | 'products.table.actions'
  | 'products.deleteConfirm'
  | 'products.deleteMessage'
  | 'products.deleteDescription'
  | 'products.deleting'
  | 'products.yesDelete'
  | 'products.cancel'
  | 'products.editTooltip'
  | 'products.deleteTooltip'
  | 'products.errors.nameRequired'
  | 'products.errors.updateFailed'
  | 'products.errors.addFailed'
  | 'products.errors.recipeFailed'
  | 'products.errors.deleteFailed'
  // ── Materials ─────────────────────────────────────
  | 'materials.title'
  | 'materials.addMaterial'
  | 'materials.add'
  | 'materials.editMaterial'
  | 'materials.materialData'
  | 'materials.name'
  | 'materials.sku'
  | 'materials.unit'
  | 'materials.unitPlaceholder'
  | 'materials.currentQuantity'
  | 'materials.minimumAlert'
  | 'materials.defaultSupplier'
  | 'materials.noSupplier'
  | 'materials.submitSaving'
  | 'materials.submitSave'
  | 'materials.empty'
  | 'materials.unitLabel'
  | 'materials.quantityLabel'
  | 'materials.minimumLabel'
  | 'materials.supplierLabel'
  | 'materials.table.name'
  | 'materials.table.sku'
  | 'materials.table.unit'
  | 'materials.table.quantity'
  | 'materials.table.minimum'
  | 'materials.table.supplier'
  | 'materials.table.status'
  | 'materials.table.actions'
  | 'materials.status.outOfStock'
  | 'materials.status.low'
  | 'materials.status.available'
  | 'materials.editTooltip'
  | 'materials.errors.required'
  | 'materials.errors.updateFailed'
  | 'materials.errors.addFailed'
  | 'materials.errors.deleteFailed'
  | 'materials.errors.cannotDelete'
  | 'materials.deleteTooltip'
  | 'materials.deleteConfirm'
  // ── Machines ──────────────────────────────────────
  | 'machines.title'
  | 'machines.addMachine'
  | 'machines.add'
  | 'machines.editMachine'
  | 'machines.machineData'
  | 'machines.machineId'
  | 'machines.name'
  | 'machines.location'
  | 'machines.notes'
  | 'machines.lastMaintenance'
  | 'machines.nextScheduled'
  | 'machines.status'
  | 'machines.maintenanceInterval'
  | 'machines.submitSaving'
  | 'machines.submitSave'
  | 'machines.empty'
  | 'machines.searchPlaceholder'
  | 'machines.filterAll'
  | 'machines.filterGood'
  | 'machines.filterUnderMaintenance'
  | 'machines.filterStopped'
  | 'machines.status.good'
  | 'machines.status.underMaintenance'
  | 'machines.status.stopped'
  | 'machines.table.machineId'
  | 'machines.table.name'
  | 'machines.table.location'
  | 'machines.table.lastMaintenance'
  | 'machines.table.nextScheduled'
  | 'machines.table.status'
  | 'machines.table.actions'
  | 'machines.basicInfo'
  | 'machines.maintenanceInfo'
  | 'machines.action.details'
  | 'machines.action.logMaintenance'
  | 'machines.action.edit'
  | 'machines.action.logMaintenanceNow'
  | 'machines.errors.nameRequired'
  | 'machines.errors.updateFailed'
  | 'machines.errors.addFailed'
  | 'machines.errors.maintenanceLogFailed'
  | 'machines.errors.deleteFailed'
  | 'machines.deleteSuccess'
  | 'machines.deleteConfirm'
  | 'machines.maintenanceDate'
  | 'machines.maintenanceNote'
  | 'machines.maintenanceLogTitle'
  | 'machines.maintenanceLogSuccess'
  // ── Schedule ──────────────────────────────────────
  | 'schedule.title'
  | 'schedule.suggestedOrders'
  | 'schedule.noOrders'
  | 'schedule.urgent'
  | 'schedule.requiredQuantity'
  | 'schedule.currentStock'
  | 'schedule.supplierLabel'
  | 'schedule.orderDate'
  | 'schedule.table.material'
  | 'schedule.table.requiredQuantity'
  | 'schedule.table.stock'
  | 'schedule.table.supplier'
  | 'schedule.table.supplyDuration'
  | 'schedule.table.orderDate'
  | 'schedule.table.status'
  | 'schedule.table.actions'
  | 'schedule.approveTooltip'
  | 'schedule.postponeTooltip'
  // ── Units ─────────────────────────────────────────
  | 'units.piece'
  | 'units.meter'
  | 'units.kilogram'
  | 'units.liter'
  // ── Tracking ─────────────────────────────────────
  | 'tracking.title'
  | 'tracking.subtitle'
  | 'tracking.table.product'
  | 'tracking.table.quantity'
  | 'tracking.table.status'
  | 'tracking.table.plannedStart'
  | 'tracking.table.plannedEnd'
  | 'tracking.table.orderNumber'
  | 'tracking.status.pending'
  | 'tracking.status.inProgress'
  | 'tracking.status.completed'
  | 'tracking.empty'
  | 'tracking.errors.updateFailed'
  | 'tracking.errors.alreadyCompleted'
  // ── Customers ────────────────────────────────────
  | 'customers.title'
  | 'customers.addCustomer'
  | 'customers.add'
  | 'customers.editCustomer'
  | 'customers.customerData'
  | 'customers.customerDetails'
  | 'customers.fullName'
  | 'customers.phone'
  | 'customers.email'
  | 'customers.address'
  | 'customers.notes'
  | 'customers.submitSaving'
  | 'customers.submitSave'
  | 'customers.empty'
  | 'customers.noResults'
  | 'customers.searchPlaceholder'
  | 'customers.details'
  | 'customers.orders'
  | 'customers.registeredOn'
  | 'customers.contactInfo'
  | 'customers.notesLabel'
  | 'customers.ordersSummary'
  | 'customers.totalOrders'
  | 'customers.table.name'
  | 'customers.table.phone'
  | 'customers.table.email'
  | 'customers.table.orders'
  | 'customers.table.registered'
  | 'customers.table.actions'
  | 'customers.deleteConfirm'
  | 'customers.deleteDescription'
  | 'customers.errors.nameRequired'
  | 'customers.errors.updateFailed'
  | 'customers.errors.addFailed'
  | 'customers.customerOrders'
  | 'customers.noOrders'
  | 'customers.orderId'
  | 'customers.orderProduct'
  | 'customers.orderQuantity'
  | 'customers.orderStatus'
  | 'customers.orderDueDate'
  // ── Orders (customer dropdown) ──────────────────────
  | 'orders.customerPlaceholder'
  | 'orders.addNewCustomer'
  | 'orders.selectCustomer'
  | 'orders.newCustomer'
  // ── Landing page status labels ────────────────────
  | 'landing.hero.progressLabel'
  | 'landing.hero.orderIdSuffix';

const industryOptions: Record<LocaleCode, string[]> = {
  ar: [
    'صناعات غذائية',
    'بلاستيك',
    'معادن',
    'كيماوية',
    'نسيج',
    'خشب',
    'إلكترونيات',
    'أدوية',
    'أخرى',
  ],
  fr: [
    'Agroalimentaire',
    'Plastique',
    'Métallurgie',
    'Chimie',
    'Textile',
    'Bois',
    'Électronique',
    'Pharmacie',
    'Autre',
  ],
};

const unitOptions: Record<LocaleCode, string[]> = {
  ar: ['قطعة', 'متر', 'كيلوغرام', 'لتر'],
  fr: ['Pièce', 'Mètre', 'Kilogramme', 'Litre'],
};

const dictionaries: Record<LocaleCode, Record<TranslationKey, string>> = {
  ar: {
    // ── Settings ──────────────────────────────────
    'settings.title': 'الإعدادات',
    'settings.profile.heading': 'الملف الشخصي',
    'settings.profile.avatarChange': 'تغيير الصورة',
    'settings.profile.fullName': 'الاسم الكامل',
    'settings.profile.email': 'البريد الإلكتروني',
    'settings.profile.save': 'حفظ التغييرات',
    'settings.profile.saved': 'تم حفظ الملف الشخصي بنجاح',
    'settings.password.heading': 'تغيير كلمة المرور',
    'settings.password.current': 'كلمة المرور الحالية',
    'settings.password.new': 'كلمة المرور الجديدة',
    'settings.password.confirm': 'تأكيد كلمة المرور الجديدة',
    'settings.password.mismatch': 'كلمة المرور الجديدة وتأكيدها غير متطابقين',
    'settings.password.tooShort': 'كلمة المرور يجب أن تكون ٦ أحرف على الأقل',
    'settings.password.reauthFailed': 'كلمة المرور الحالية غير صحيحة',
    'settings.password.changed': 'تم تغيير كلمة المرور بنجاح',
    'settings.password.change': 'تحديث كلمة المرور',
    'settings.language.heading': 'اللغة',
    'settings.language.description': 'اختر لغة الواجهة',
    'settings.language.saved': 'تم حفظ تفضيل اللغة',
    'settings.factory.heading': 'إعدادات المصنع',
    'settings.factory.name': 'اسم المصنع',
    'settings.factory.industry': 'نوع الصناعة',
    'settings.factory.address': 'العنوان',
    'settings.factory.contact': 'معلومات الاتصال',
    'settings.factory.save': 'حفظ التغييرات',
    'settings.factory.saved': 'تم حفظ إعدادات المصنع بنجاح',
    'settings.factory.industryPlaceholder': 'اختر نوع الصناعة',
    'settings.usersManagement.heading': 'إدارة المستخدمين والأدوار',
    'settings.usersManagement.description': 'إدارة صلاحيات المستخدمين وتعيين الأدوار في المصنع',
    'settings.usersManagement.action': 'إدارة المستخدمين',
    'settings.personalAccount': 'الحساب الشخصي',
    'settings.interfaceLanguage': 'لغة الواجهة',
    'settings.errors.fileType': 'يُسمح فقط بملفات JPG و PNG و WebP',
    'settings.errors.fileSize': 'حجم الصورة يجب أن لا يتجاوز 2 ميغابايت',
    // ── Common ────────────────────────────────────
    'common.saving': 'جاري الحفظ...',
    'common.error': 'حدث خطأ. حاول مرة أخرى.',
    'common.loading': 'جارٍ التحميل...',
    'common.searchPlaceholder': 'بحث...',
    'common.cancel': 'إلغاء',
    'common.save': 'حفظ',
    'common.edit': 'تعديل',
    'common.delete': 'حذف',
    'common.add': 'إضافة',
    'common.actions': 'الإجراءات',
    'common.approve': 'اعتماد',
    'common.postpone': 'تأجيل',
    'common.days': 'يوم',
    // ── Sidebar ───────────────────────────────────
    'sidebar.dashboard': 'لوحة التحكم',
    'sidebar.productionPlanning': 'تخطيط الإنتاج',
    'sidebar.suppliers': 'الموردون',
    'sidebar.rawMaterials': 'المواد الأولية',
    'sidebar.products': 'المنتجات',
    'sidebar.orders': 'الطلبيات',
    'sidebar.schedule': 'الجدولة',
    'sidebar.productionTracking': 'تتبع الإنتاج',
    'sidebar.machineMaintenance': 'صيانة الآلات',
    'sidebar.userManagement': 'إدارة المستخدمين',
    'sidebar.settings': 'الإعدادات',
    'sidebar.brand': 'قنص',
    'sidebar.technicalSupport': 'الدعم الفني',
    'sidebar.logout': 'خروج',
    // ── Login ─────────────────────────────────────
    'login.brand': 'فابريك',
    'login.subtitle': 'نظام إدارة المصانع الذكي',
    'login.email': 'البريد الإلكتروني',
    'login.password': 'كلمة المرور',
    'login.forgotPassword': 'نسيت كلمة المرور؟',
    'login.submit': 'تسجيل الدخول',
    'login.loading': 'جاري...',
    'login.noAccount': 'ليس لديك حساب؟',
    'login.createAccount': 'إنشاء حساب',
    'login.footerCopyright': '© 2024 فابريك لإدارة المصانع. جميع الحقوق محفوظة.',
    'login.terms': 'الشروط والأحكام',
    'login.privacy': 'سياسة الخصوصية',
    'login.support': 'الدعم الفني',
    'login.errors.invalidCredentials': 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
    'login.errors.emailNotConfirmed': 'يرجى تأكيد بريدك الإلكتروني أولاً',
    'login.errors.tooManyRequests': 'محاولات كثيرة، يرجى الانتظار قليلاً',
    'login.errors.userNotFound': 'المستخدم غير موجود',
    'login.errors.loginFailed': 'فشل تسجيل الدخول، يرجى المحاولة مرة أخرى',
    'login.errors.unexpected': 'حدث خطأ غير متوقع، يرجى المحاولة مرة أخرى',
    // ── Signup ────────────────────────────────────
    'signup.brand': 'فابريك',
    'signup.title': 'إنشاء حساب جديد',
    'signup.factoryName': 'اسم المصنع',
    'signup.factoryPlaceholder': 'مثلاً: فابريك الجزائر للصلب',
    'signup.fullName': 'الاسم الكامل',
    'signup.fullNamePlaceholder': 'أدخل اسمك الكامل',
    'signup.email': 'البريد الإلكتروني',
    'signup.password': 'كلمة المرور',
    'signup.submit': 'إنشاء الحساب',
    'signup.loading': 'جاري...',
    'signup.hasAccount': 'لديك حساب بالفعل؟',
    'signup.login': 'تسجيل الدخول',
    'signup.footerCopyright': '© 2024 فابريك الجزائر - حلول صناعية متكاملة',
    'signup.terms': 'الشروط والأحكام',
    'signup.privacy': 'سياسة الخصوصية',
    'signup.support': 'اتصل بنا',
    'signup.errors.registrationFailed': 'فشلت عملية التسجيل',
    'signup.success': 'تم إنشاء الحساب بنجاح! يمكنك تسجيل الدخول الآن.',
    'signup.errors.serverError': 'حدث خطأ أثناء الاتصال بالخادم',
    // ── Forgot Password ───────────────────────────
    'forgotPassword.brand': 'فابريك',
    'forgotPassword.subtitle': 'إدارة المصانع الحديثة',
    'forgotPassword.title': 'استعادة كلمة المرور',
    'forgotPassword.description': 'أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور',
    'forgotPassword.email': 'البريد الإلكتروني',
    'forgotPassword.submit': 'إرسال رابط الاستعادة',
    'forgotPassword.loading': 'جاري...',
    'forgotPassword.backToLogin': 'العودة لصفحة تسجيل الدخول',
    'forgotPassword.footerCopyright': '© 2024 فابريك لإدارة المصانع. جميع الحقوق محفوظة.',
    'forgotPassword.terms': 'الشروط والأحكام',
    'forgotPassword.privacy': 'سياسة الخصوصية',
    'forgotPassword.support': 'الدعم الفني',
    'forgotPassword.errors.invalidEmail': 'البريد الإلكتروني غير صالح',
    'forgotPassword.errors.noAccount': 'لا يوجد حساب مرتبط بهذا البريد الإلكتروني',
    'forgotPassword.errors.tooManyRequests': 'محاولات كثيرة، يرجى الانتظار قليلاً',
    'forgotPassword.success': 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني',
    'forgotPassword.errors.unexpected': 'حدث خطأ غير متوقع، يرجى المحاولة مرة أخرى',
    // ── Reset Password ────────────────────────────
    'resetPassword.title': 'تعيين كلمة المرور',
    'resetPassword.description': 'الرجاء إدخال كلمة مرور قوية لتأمين حسابك في فابريك.',
    'resetPassword.newPassword': 'كلمة المرور الجديدة',
    'resetPassword.confirmPassword': 'تأكيد كلمة المرور',
    'resetPassword.submit': 'تحديث كلمة المرور',
    'resetPassword.submitLoading': 'جاري...',
    'resetPassword.linkExpired': 'انتهت صلاحية الرابط',
    'resetPassword.linkExpiredDescription': 'صلاحية رابط إعادة تعيين كلمة المرور انتهت. يرجى طلب رابط جديد.',
    'resetPassword.newLink': 'طلب رابط جديد',
    'resetPassword.strength.weak': 'ضعيفة',
    'resetPassword.strength.medium': 'متوسطة',
    'resetPassword.strength.good': 'جيد',
    'resetPassword.strength.strong': 'قوية',
    'resetPassword.errors.passwordsMismatch': 'كلمتا المرور غير متطابقتين',
    'resetPassword.errors.tooShort': 'يجب أن تكون كلمة المرور 6 أحرف على الأقل',
    'resetPassword.errors.sameAsOld': 'كلمة المرور الجديدة يجب أن تختلف عن القديمة',
    'resetPassword.errors.tooShortAuth': 'يجب أن تكون كلمة المرور 6 أحرف على الأقل',
    'resetPassword.errors.unexpected': 'حدث خطأ غير متوقع، يرجى المحاولة مرة أخرى',
    'resetPassword.success': 'تم تحديث كلمة المرور بنجاح',
    // ── Landing Page ──────────────────────────────
    'landing.brand': 'فابريك',
    'landing.nav.about': 'عن فابريك',
    'landing.nav.features': 'المميزات',
    'landing.nav.pricing': 'الأسعار',
    'landing.nav.login': 'تسجيل الدخول',
    'landing.nav.startNow': 'ابدأ الآن',
    'landing.hero.headline': 'فابريك: إدارة إنتاجك بذكاء وصلابة',
    'landing.hero.desc1': 'نظام رقمي بسيط لإدارة خطوط الإنتاج، تتبع الطلبيات، وصيانة الآلات.',
    'landing.hero.desc2': 'صُمم خصيصاً ليناسب بيئة العمل الصناعية الجزائرية.',
    'landing.hero.statusPending': 'قيد الانتظار',
    'landing.hero.statusInProgress': 'قيد التنفيذ',
    'landing.hero.statusCompleted': 'تم الانتهاء',
    'landing.hero.order1Title': 'محرك كهربائي 5kW',
    'landing.hero.order2Title': 'علبة تروس هيدروليكية',
    'landing.hero.order3Title': 'لوحة تحكم ذكية',
    'landing.hero.orderIdSuffix': '#',
    'landing.hero.progressLabel': 'التقدم',
    'landing.hero.progress': 'التقدم: {progress}%',
    'landing.features.planning.title': 'تخطيط الإنتاج',
    'landing.features.planning.desc': 'تنظيم جداول العمل اليومية والأسبوعية بدقة متناهية لضمان استمرارية التشغيل وتوزيع المهام بكفاءة.',
    'landing.features.tracking.title': 'تتبع الطلبيات',
    'landing.features.tracking.desc': 'مراقبة حية لكل قطعة من لحظة دخول المواد الخام إلى المستودع وحتى خروج المنتج النهائي للشحن.',
    'landing.features.maintenance.title': 'الصيانة الوقائية',
    'landing.features.maintenance.desc': 'تقليل فترات توقف الآلات المفاجئ عبر جدولة التنبيهات الدورية وعمليات الفحص التقني التلقائية.',
    'landing.why.title': 'لماذا تختار فابريك لمصنعك؟',
    'landing.offline.title': 'يعمل بلا إنترنت',
    'landing.offline.desc': 'ندرك تحديات البنية التحتية في المناطق الصناعية الجزائرية، صُمم "فابريك" ليعمل بكفاءة كاملة حتى في حال انقطاع الإنترنت. يتم مزامنة البيانات تلقائياً فور عودة الاتصال، مما يضمن عدم ضياع أي ثانية من بيانات الإنتاج.',
    'landing.offline.bullet1': 'قاعدة بيانات محلية مؤمنة',
    'landing.offline.bullet2': 'مزامنة ذكية ثنائية الاتجاه',
    'landing.cta.title': 'هل أنت مستعد لرقمنة إنتاجك؟',
    'landing.cta.desc': 'انضم إلى عشرات المصانع الصغيرة التي بدأت رحلة التحول الرقمي مع فابريك.',
    'landing.cta.demo': 'اطلب عرضاً تجريبياً',
    'landing.cta.expert': 'تحدث مع خبير',
    'landing.footer.brand': 'فابريك',
    'landing.footer.copyright': '© 2024 فابريك لإدارة الإنتاج الصناعي. جميع الحقوق محفوظة.',
    'landing.footer.contact': 'اتصل بنا',
    'landing.footer.terms': 'الشروط والأحكام',
    'landing.footer.privacy': 'سياسة الخصوصية',
    // ── Dashboard ─────────────────────────────────
    'dashboard.status.pending': 'قيد الانتظار',
    'dashboard.status.inProgress': 'قيد التنفيذ',
    'dashboard.status.completed': 'مكتمل',
    'dashboard.status.cancelled': 'ملغي',
    'dashboard.due.overdue': 'متأخر',
    'dashboard.due.upcoming': 'قريب',
    'dashboard.due.onTrack': 'جيد',
    'dashboard.searchPlaceholder': 'بحث...',
    'dashboard.activeWorkOrders.title': 'أوامر العمل النشطة',
    'dashboard.activeWorkOrders.needsAttention': 'تطلب متابعة',
    'dashboard.activeWorkOrders.noOrders': 'لا يوجد أوامر نشطة حالياً',
    'dashboard.maintenanceAlerts.title': 'تنبيهات الصيانة',
    'dashboard.maintenanceAlerts.needsAction': 'تطلب إجراء فوراً',
    'dashboard.maintenanceAlerts.allGood': 'الآلات في حالة جيدة',
    'dashboard.stoppedMachines.title': 'آلات متوقفة الآن',
    'dashboard.stoppedMachines.none': 'لا توجد آلات متوقفة',
    'dashboard.stoppedMachines.some': 'تتطلب انتباهاً',
    'dashboard.productionLive.title': 'حالة الإنتاج المباشرة',
    'dashboard.productionLive.showAll': 'عرض الكل',
    'dashboard.productionLive.orderId': 'معرّف الطلب',
    'dashboard.productionLive.product': 'اسم المنتج',
    'dashboard.productionLive.status': 'الحالة',
    'dashboard.productionLive.actions': 'الإجراءات',
    'dashboard.productionLive.empty': 'لا توجد أوامر عمل قيد الانتظار أو التنفيذ',
    'dashboard.recentActivity.title': 'آخر النشاطات',
    'dashboard.recentActivity.justNow': 'منذ قليل',
    'dashboard.recentActivity.completedOrder': 'أكتمل طلب العمل',
    'dashboard.recentActivity.inProgressOrder': 'طلب العمل قيد التنفيذ',
    'dashboard.recentActivity.newOrder': 'طلب عمل جديد',
    'dashboard.recentActivity.empty': 'لا يوجد نشاط حديث',
    'dashboard.machines.title': 'حالة الآلات',
    'dashboard.machines.showAll': 'عرض الكل',
    'dashboard.machines.name': 'اسم الآلة',
    'dashboard.machines.lastMaintenance': 'تاريخ آخر صيانة',
    'dashboard.machines.nextMaintenance': 'موعد الصيانة القادم',
    'dashboard.machines.status': 'الحالة',
    'dashboard.machines.empty': 'لا توجد آلات نشطة',
    'dashboard.machines.lastLabel': 'آخر صيانة:',
    'dashboard.machines.nextLabel': 'القادم:',
    'dashboard.time.now': 'الآن',
    'dashboard.time.minutesAgo': 'منذ {n} دقيقة',
    'dashboard.time.hoursAgo': 'منذ {n} ساعة',
    'dashboard.time.daysAgo': 'منذ {n} يوم',
    // ── Roles ─────────────────────────────────────
    'role.owner': 'مدير المصنع',
    'role.worker': 'عامل',
    // ── Orders ────────────────────────────────────
    'orders.title': 'الطلبيات',
    'orders.addOrder': 'إضافة طلبية',
    'orders.add': 'إضافة',
    'orders.editOrder': 'تعديل الطلبية',
    'orders.orderData': 'بيانات الطلبية',
    'orders.product': 'المنتج المطلوب *',
    'orders.productPlaceholder': 'اختر منتجاً',
    'orders.quantity': 'الكمية *',
    'orders.dueDate': 'تاريخ الاستحقاق',
    'orders.customerName': 'اسم العميل *',
    'orders.submitSaving': 'جاري الحفظ...',
    'orders.submitSave': 'حفظ الطلبية',
    'orders.empty': 'لا توجد طلبيات مسجلة بعد',
    'orders.productLabel': 'المنتج:',
    'orders.quantityLabel': 'الكمية:',
    'orders.customerLabel': 'العميل:',
    'orders.dueDateLabel': 'الاستحقاق:',
    'orders.orderNumber': 'رقم الطلبية',
    'orders.table.status': 'الحالة',
    'orders.table.actions': 'الإجراءات',
    'orders.moveToProduction': 'نقل إلى الإنتاج',
    'orders.moving': 'جاري النقل...',
    'orders.errors.required': 'المنتج، الكمية، واسم العميل مطلوبة',
    'orders.errors.updateFailed': 'حدث خطأ أثناء تحديث الطلبية',
    'orders.errors.addFailed': 'حدث خطأ أثناء إضافة الطلبية',
    'orders.deleteTooltip': 'حذف الطلبية',
    'orders.deleteConfirm': 'هل أنت متأكد من حذف هذه الطلبية؟',
    'orders.deleteDescription': 'لا يمكن التراجع عن هذا الإجراء',
    'orders.errors.deleteFailed': 'حدث خطأ أثناء حذف الطلبية',
    'orders.errors.cannotDelete': 'لا يمكن حذف الطلبية قيد المعالجة أو المكتملة',
    'orders.status.draft': 'مسودة',
    'orders.status.processing': 'قيد المعالجة',
    'orders.status.confirmed': 'مؤكدة',
    // ── Suppliers ─────────────────────────────────
    'suppliers.title': 'الموردون',
    'suppliers.addSupplier': 'إضافة مورد',
    'suppliers.add': 'إضافة',
    'suppliers.editSupplier': 'تعديل المورد',
    'suppliers.supplierData': 'بيانات المورد',
    'suppliers.name': 'الاسم *',
    'suppliers.phone': 'الهاتف',
    'suppliers.emailOptional': 'البريد الإلكتروني (اختياري)',
    'suppliers.supplyDuration': 'مدة التوريد (أيام)',
    'suppliers.minimumOrder': 'الحد الأدنى',
    'suppliers.minimumOrderDesktop': 'الحد الأدنى للطلبية',
    'suppliers.submitSaving': 'جاري الحفظ...',
    'suppliers.submitSave': 'حفظ البيانات',
    'suppliers.empty': 'لا يوجد موردون مسجلون بعد',
    'suppliers.phoneLabel': 'الهاتف:',
    'suppliers.supplyDurationLabel': 'مدة التوريد:',
    'suppliers.minimumOrderLabel': 'الحد الأدنى:',
    'suppliers.table.name': 'اسم المورد',
    'suppliers.table.phone': 'الهاتف',
    'suppliers.table.supplyDuration': 'مدة التوريد',
    'suppliers.table.minimumOrder': 'الحد الأدنى',
    'suppliers.table.status': 'الحالة',
    'suppliers.table.actions': 'الإجراءات',
    'suppliers.status.active': 'نشط',
    'suppliers.status.inactive': 'معطّل',
    'suppliers.errors.nameRequired': 'اسم المورد مطلوب',
    'suppliers.errors.updateFailed': 'حدث خطأ أثناء تحديث المورد',
    'suppliers.errors.addFailed': 'حدث خطأ أثناء إضافة المورد',
    // ── Customers ─────────────────────────────────
    'customers.title': 'إدارة العملاء',
    'customers.addCustomer': 'إضافة عميل جديد',
    'customers.add': 'إضافة',
    'customers.editCustomer': 'تعديل بيانات العميل',
    'customers.customerData': 'بيانات العميل',
    'customers.customerDetails': 'تفاصيل العميل',
    'customers.fullName': 'الاسم الكامل *',
    'customers.phone': 'رقم الهاتف',
    'customers.email': 'البريد الإلكتروني',
    'customers.address': 'العنوان',
    'customers.notes': 'ملاحظات',
    'customers.submitSaving': 'جاري الحفظ...',
    'customers.submitSave': 'حفظ البيانات',
    'customers.empty': 'لا يوجد عملاء مسجلون بعد',
    'customers.noResults': 'لا توجد نتائج مطابقة',
    'customers.searchPlaceholder': 'بحث بالاسم أو الهاتف أو البريد...',
    'customers.details': 'تفاصيل',
    'customers.orders': 'طلبيات',
    'customers.registeredOn': 'تاريخ التسجيل:',
    'customers.contactInfo': 'معلومات الاتصال',
    'customers.notesLabel': 'ملاحظات',
    'customers.ordersSummary': 'ملخص الطلبيات',
    'customers.totalOrders': 'إجمالي الطلبيات',
    'customers.table.name': 'الاسم',
    'customers.table.phone': 'رقم الهاتف',
    'customers.table.email': 'البريد الإلكتروني',
    'customers.table.orders': 'عدد الطلبيات',
    'customers.table.registered': 'تاريخ التسجيل',
    'customers.table.actions': 'الإجراءات',
    'customers.deleteConfirm': 'هل أنت متأكد من حذف هذا العميل؟',
    'customers.deleteDescription': 'لا يمكن التراجع عن هذا الإجراء',
    'customers.errors.nameRequired': 'اسم العميل مطلوب',
    'customers.errors.updateFailed': 'حدث خطأ أثناء تحديث بيانات العميل',
    'customers.errors.addFailed': 'حدث خطأ أثناء إضافة العميل',
    'customers.customerOrders': 'طلبيات العميل',
    'customers.noOrders': 'لا توجد طلبيات لهذا العميل',
    'customers.orderId': 'رقم الطلبية',
    'customers.orderProduct': 'المنتج',
    'customers.orderQuantity': 'الكمية',
    'customers.orderStatus': 'الحالة',
    'customers.orderDueDate': 'الاستحقاق',
    'orders.customerPlaceholder': 'اختر عميلاً أو اكتب اسماً جديداً',
    'orders.addNewCustomer': '+ إضافة عميل جديد',
    'orders.selectCustomer': 'اختر عميل',
    'orders.newCustomer': 'عميل جديد',
    'sidebar.customers': 'العملاء',
    // ── Products ──────────────────────────────────
    'products.title': 'المنتجات',
    'products.addProduct': 'إضافة منتج',
    'products.add': 'إضافة',
    'products.editProduct': 'تعديل المنتج',
    'products.productData': 'بيانات المنتج والوصفة',
    'products.basicInfo': 'المعلومات الأساسية',
    'products.name': 'اسم المنتج *',
    'products.unit': 'وحدة القياس *',
    'products.manufacturingTime': 'وقت التصنيع (ساعات)',
    'products.bom': 'وصفة المواد (BOM)',
    'products.addMaterial': '+ إضافة مادة',
    'products.noMaterials': 'لا توجد مواد في الوصفة بعد',
    'products.materialPlaceholder': 'اختر مادة',
    'products.quantityPlaceholder': 'الكمية',
    'products.submitSaving': 'جاري الحفظ...',
    'products.submitSave': 'حفظ المنتج',
    'products.empty': 'لا توجد منتجات مسجلة بعد',
    'products.unitLabel': 'الوحدة:',
    'products.materialsCount': 'المواد في الوصفة:',
    'products.costNotCalculated': 'التكلفة: غير محسوبة',
    'products.table.name': 'اسم المنتج',
    'products.table.unit': 'وحدة القياس',
    'products.table.materialsCount': 'عدد المواد',
    'products.table.totalCost': 'التكلفة الإجمالية',
    'products.table.productionTime': 'وقت التصنيع',
    'products.table.actions': 'الإجراءات',
    'products.deleteConfirm': 'تأكيد الحذف',
    'products.deleteMessage': 'هل أنت متأكد من حذف المنتج "<strong>{name}</strong>"؟',
    'products.deleteDescription': 'سيتم حذف وصفة الإنتاج (BOM) المرتبطة به أيضاً.',
    'products.deleting': 'جاري الحذف...',
    'products.yesDelete': 'نعم، حذف',
    'products.cancel': 'إلغاء',
    'products.editTooltip': 'تعديل',
    'products.deleteTooltip': 'حذف',
    'products.errors.nameRequired': 'اسم المنتج مطلوب',
    'products.errors.updateFailed': 'حدث خطأ أثناء تحديث المنتج',
    'products.errors.addFailed': 'حدث خطأ أثناء إضافة المنتج',
    'products.errors.recipeFailed': 'حدث خطأ أثناء حفظ وصفة المواد',
    'products.errors.deleteFailed': 'حدث خطأ أثناء حذف المنتج',
    // ── Materials ─────────────────────────────────
    'materials.title': 'المواد الأولية',
    'materials.addMaterial': 'إضافة مادة',
    'materials.add': 'إضافة',
    'materials.editMaterial': 'تعديل المادة',
    'materials.materialData': 'بيانات المادة',
    'materials.name': 'اسم المادة *',
    'materials.sku': 'الرمز (SKU) *',
    'materials.unit': 'الوحدة *',
    'materials.unitPlaceholder': 'كجم، لتر، قطعة...',
    'materials.currentQuantity': 'الكمية الحالية',
    'materials.minimumAlert': 'حد التنبيه الأدنى',
    'materials.defaultSupplier': 'المورّد الافتراضي',
    'materials.noSupplier': 'بدون مورّد',
    'materials.submitSaving': 'جاري الحفظ...',
    'materials.submitSave': 'حفظ البيانات',
    'materials.empty': 'لا توجد مواد أولية مسجلة بعد',
    'materials.unitLabel': 'الوحدة:',
    'materials.quantityLabel': 'الكمية:',
    'materials.minimumLabel': 'الحد الأدنى:',
    'materials.supplierLabel': 'المورّد:',
    'materials.table.name': 'اسم المادة',
    'materials.table.sku': 'الرمز',
    'materials.table.unit': 'الوحدة',
    'materials.table.quantity': 'الكمية',
    'materials.table.minimum': 'الحد الأدنى',
    'materials.table.supplier': 'المورّد',
    'materials.table.status': 'الحالة',
    'materials.table.actions': 'الإجراءات',
    'materials.status.outOfStock': 'نفذ',
    'materials.status.low': 'منخفض',
    'materials.status.available': 'متوفر',
    'materials.editTooltip': 'تعديل',
    'materials.errors.required': 'الاسم، الرمز، والوحدة مطلوبة',
    'materials.errors.updateFailed': 'حدث خطأ أثناء تحديث المادة',
    'materials.errors.addFailed': 'حدث خطأ أثناء إضافة المادة',
    'materials.errors.deleteFailed': 'حدث خطأ أثناء حذف المادة',
    'materials.errors.cannotDelete': 'لا يمكن حذف المادة لأنها مستخدمة في وصفات المنتجات',
    'materials.deleteTooltip': 'حذف',
    'materials.deleteConfirm': 'هل أنت متأكد من حذف هذه المادة؟',
    // ── Machines ──────────────────────────────────
    'machines.title': 'إدارة الآلات',
    'machines.addMachine': 'إضافة آلة جديدة',
    'machines.add': 'إضافة',
    'machines.editMachine': 'تعديل الآلة',
    'machines.machineData': 'بيانات الآلة',
    'machines.machineId': 'رقم الآلة',
    'machines.name': 'اسم الآلة',
    'machines.location': 'الموقع',
    'machines.notes': 'ملاحظات',
    'machines.lastMaintenance': 'آخر صيانة',
    'machines.nextScheduled': 'التالي المقرر',
    'machines.status': 'الحالة',
    'machines.maintenanceInterval': 'مدة الصيانة (أيام)',
    'machines.submitSaving': 'جاري الحفظ...',
    'machines.submitSave': 'حفظ البيانات',
    'machines.empty': 'لا توجد آلات مسجلة بعد',
    'machines.searchPlaceholder': 'بحث باسم الآلة أو الموقع...',
    'machines.filterAll': 'الكل',
    'machines.filterGood': 'جيدة',
    'machines.filterUnderMaintenance': 'تحت الصيانة',
    'machines.filterStopped': 'متوقفة',
    'machines.status.good': 'جيدة',
    'machines.status.underMaintenance': 'تحت الصيانة',
    'machines.status.stopped': 'متوقفة',
    'machines.table.machineId': 'رقم الآلة',
    'machines.table.name': 'اسم الآلة',
    'machines.table.location': 'الموقع',
    'machines.table.lastMaintenance': 'آخر صيانة',
    'machines.table.nextScheduled': 'التالي المقرر',
    'machines.table.status': 'الحالة',
    'machines.table.actions': 'الإجراءات',
    'machines.basicInfo': 'معلومات أساسية',
    'machines.maintenanceInfo': 'معلومات الصيانة',
    'machines.action.details': 'تفاصيل',
    'machines.action.logMaintenance': 'تسجيل صيانة',
    'machines.action.edit': 'تعديل',
    'machines.action.logMaintenanceNow': 'تسجيل صيانة',
    'machines.errors.nameRequired': 'اسم الآلة مطلوب',
    'machines.errors.updateFailed': 'حدث خطأ أثناء تحديث الآلة',
    'machines.errors.addFailed': 'حدث خطأ أثناء إضافة الآلة',
    'machines.errors.maintenanceLogFailed': 'حدث خطأ أثناء تسجيل الصيانة',
    'machines.errors.deleteFailed': 'حدث خطأ أثناء حذف الآلة',
    'machines.deleteSuccess': 'تم حذف الآلة بنجاح',
    'machines.deleteConfirm': 'هل أنت متأكد من حذف هذه الآلة؟',
    'machines.maintenanceDate': 'تاريخ الصيانة *',
    'machines.maintenanceNote': 'ملاحظات',
    'machines.maintenanceLogTitle': 'تسجيل صيانة',
    'machines.maintenanceLogSuccess': 'تم تسجيل الصيانة بنجاح',
    // ── Schedule ──────────────────────────────────
    'schedule.title': 'جدولة الإنتاج',
    'schedule.suggestedOrders': 'أوامر شراء مقترحة',
    'schedule.noOrders': 'لا توجد أوامر شراء مقترحة حالياً',
    'schedule.urgent': 'عاجل',
    'schedule.requiredQuantity': 'الكمية المطلوبة:',
    'schedule.currentStock': 'المخزون الحالي:',
    'schedule.supplierLabel': 'المورد:',
    'schedule.orderDate': 'تاريخ الطلب:',
    'schedule.table.material': 'المادة',
    'schedule.table.requiredQuantity': 'الكمية المطلوبة',
    'schedule.table.stock': 'المخزون',
    'schedule.table.supplier': 'المورد',
    'schedule.table.supplyDuration': 'مدة التوريد',
    'schedule.table.orderDate': 'تاريخ الطلب',
    'schedule.table.status': 'الحالة',
    'schedule.table.actions': 'الإجراءات',
    'schedule.approveTooltip': 'اعتماد',
    'schedule.postponeTooltip': 'تأجيل',
    // ── Units ─────────────────────────────────────
    'units.piece': 'قطعة',
    'units.meter': 'متر',
    'units.kilogram': 'كيلوغرام',
    'units.liter': 'لتر',
    // ── Tracking ──────────────────────────────────
    'tracking.title': 'تتبع الإنتاج',
    'tracking.subtitle': 'مراقبة سير العمليات التصنيعية والتحكم في حالات أوامر العمل القائمة.',
    'tracking.table.product': 'اسم المنتج',
    'tracking.table.quantity': 'الكمية',
    'tracking.table.status': 'الحالة',
    'tracking.table.plannedStart': 'بداية المخطط',
    'tracking.table.plannedEnd': 'نهاية المخطط',
    'tracking.table.orderNumber': 'رقم الطلبية الأصلية',
    'tracking.status.pending': 'انتظار',
    'tracking.status.inProgress': 'تنفيذ',
    'tracking.status.completed': 'منتهية',
    'tracking.empty': 'لا توجد أوامر عمل حالياً',
    'tracking.errors.updateFailed': 'حدث خطأ أثناء تحديث الحالة',
    'tracking.errors.alreadyCompleted': 'تم إتمام أمر العمل مسبقاً',
  },
  fr: {
    // ── Settings ──────────────────────────────────
    'settings.title': 'Paramètres',
    'settings.profile.heading': 'Profil',
    'settings.profile.avatarChange': 'Changer la photo',
    'settings.profile.fullName': 'Nom complet',
    'settings.profile.email': 'Adresse e-mail',
    'settings.profile.save': 'Enregistrer',
    'settings.profile.saved': 'Profil mis à jour avec succès',
    'settings.password.heading': 'Changer le mot de passe',
    'settings.password.current': 'Mot de passe actuel',
    'settings.password.new': 'Nouveau mot de passe',
    'settings.password.confirm': 'Confirmer le nouveau mot de passe',
    'settings.password.mismatch': 'Les mots de passe ne correspondent pas',
    'settings.password.tooShort': 'Le mot de passe doit contenir au moins 6 caractères',
    'settings.password.reauthFailed': 'Mot de passe actuel incorrect',
    'settings.password.changed': 'Mot de passe modifié avec succès',
    'settings.password.change': 'Mettre à jour le mot de passe',
    'settings.language.heading': 'Langue',
    'settings.language.description': "Choisir la langue de l'interface",
    'settings.language.saved': 'Préférence de langue enregistrée',
    'settings.factory.heading': "Paramètres de l'usine",
    'settings.factory.name': "Nom de l'usine",
    'settings.factory.industry': "Secteur d'activité",
    'settings.factory.address': 'Adresse',
    'settings.factory.contact': 'Coordonnées',
    'settings.factory.save': 'Enregistrer',
    'settings.factory.saved': "Paramètres de l'usine mis à jour",
    'settings.factory.industryPlaceholder': 'Sélectionnez le secteur',
    'settings.usersManagement.heading': 'Gestion des utilisateurs',
    'settings.usersManagement.description': 'Gérer les permissions et les rôles des utilisateurs',
    'settings.usersManagement.action': 'Gérer les utilisateurs',
    'settings.personalAccount': 'Compte personnel',
    'settings.interfaceLanguage': "Langue de l'interface",
    'settings.errors.fileType': 'Seuls les fichiers JPG, PNG et WebP sont autorisés',
    'settings.errors.fileSize': "La taille de l'image ne doit pas dépasser 2 Mo",
    // ── Common ────────────────────────────────────
    'common.saving': 'Enregistrement...',
    'common.error': 'Une erreur est survenue. Réessayez.',
    'common.loading': 'Chargement...',
    'common.searchPlaceholder': 'Rechercher...',
    'common.cancel': 'Annuler',
    'common.save': 'Enregistrer',
    'common.edit': 'Modifier',
    'common.delete': 'Supprimer',
    'common.add': 'Ajouter',
    'common.actions': 'Actions',
    'common.approve': 'Approuver',
    'common.postpone': 'Reporter',
    'common.days': 'jour',
    // ── Sidebar ───────────────────────────────────
    'sidebar.dashboard': 'Tableau de bord',
    'sidebar.productionPlanning': 'Planification',
    'sidebar.suppliers': 'Fournisseurs',
    'sidebar.rawMaterials': 'Matières premières',
    'sidebar.products': 'Produits',
    'sidebar.orders': 'Commandes',
    'sidebar.schedule': 'Planning',
    'sidebar.productionTracking': 'Suivi production',
    'sidebar.machineMaintenance': 'Maintenance machines',
    'sidebar.userManagement': 'Gestion utilisateurs',
    'sidebar.settings': 'Paramètres',
    'sidebar.brand': 'Fabric',
    'sidebar.technicalSupport': 'Support technique',
    'sidebar.logout': 'Déconnexion',
    // ── Login ─────────────────────────────────────
    'login.brand': 'Fabric',
    'login.subtitle': 'Système intelligent de gestion industrielle',
    'login.email': 'Adresse e-mail',
    'login.password': 'Mot de passe',
    'login.forgotPassword': 'Mot de passe oublié ?',
    'login.submit': 'Se connecter',
    'login.loading': 'Connexion...',
    'login.noAccount': "Vous n'avez pas de compte ?",
    'login.createAccount': 'Créer un compte',
    'login.footerCopyright': '© 2024 Fabric - Gestion industrielle. Tous droits réservés.',
    'login.terms': 'Conditions',
    'login.privacy': 'Confidentialité',
    'login.support': 'Support',
    'login.errors.invalidCredentials': 'Email ou mot de passe incorrect',
    'login.errors.emailNotConfirmed': 'Veuillez confirmer votre email d\'abord',
    'login.errors.tooManyRequests': 'Trop de tentatives, veuillez patienter',
    'login.errors.userNotFound': 'Utilisateur introuvable',
    'login.errors.loginFailed': 'Échec de connexion, réessayez',
    'login.errors.unexpected': 'Erreur inattendue, réessayez',
    // ── Signup ────────────────────────────────────
    'signup.brand': 'Fabric',
    'signup.title': 'Créer un compte',
    'signup.factoryName': "Nom de l'usine",
    'signup.factoryPlaceholder': 'Ex: Fabric Algérie Acier',
    'signup.fullName': 'Nom complet',
    'signup.fullNamePlaceholder': 'Entrez votre nom complet',
    'signup.email': 'Adresse e-mail',
    'signup.password': 'Mot de passe',
    'signup.submit': 'Créer le compte',
    'signup.loading': 'Création...',
    'signup.hasAccount': 'Déjà un compte ?',
    'signup.login': 'Se connecter',
    'signup.footerCopyright': '© 2024 Fabric Algérie - Solutions industrielles intégrées',
    'signup.terms': 'Conditions',
    'signup.privacy': 'Confidentialité',
    'signup.support': 'Contactez-nous',
    'signup.errors.registrationFailed': "Échec de l'inscription",
    'signup.success': 'Compte créé avec succès ! Connectez-vous maintenant.',
    'signup.errors.serverError': 'Erreur de connexion au serveur',
    // ── Forgot Password ───────────────────────────
    'forgotPassword.brand': 'Fabric',
    'forgotPassword.subtitle': 'Gestion industrielle moderne',
    'forgotPassword.title': 'Récupération du mot de passe',
    'forgotPassword.description': 'Entrez votre email et nous vous enverrons un lien pour réinitialiser votre mot de passe',
    'forgotPassword.email': 'Adresse e-mail',
    'forgotPassword.submit': 'Envoyer le lien',
    'forgotPassword.loading': 'Envoi...',
    'forgotPassword.backToLogin': 'Retour à la connexion',
    'forgotPassword.footerCopyright': '© 2024 Fabric - Gestion industrielle. Tous droits réservés.',
    'forgotPassword.terms': 'Conditions',
    'forgotPassword.privacy': 'Confidentialité',
    'forgotPassword.support': 'Support',
    'forgotPassword.errors.invalidEmail': 'Email invalide',
    'forgotPassword.errors.noAccount': 'Aucun compte associé à cet email',
    'forgotPassword.errors.tooManyRequests': 'Trop de tentatives, veuillez patienter',
    'forgotPassword.success': 'Lien de réinitialisation envoyé à votre email',
    'forgotPassword.errors.unexpected': 'Erreur inattendue, réessayez',
    // ── Reset Password ────────────────────────────
    'resetPassword.title': 'Définir le mot de passe',
    'resetPassword.description': 'Veuillez entrer un mot de passe fort pour sécuriser votre compte Fabric.',
    'resetPassword.newPassword': 'Nouveau mot de passe',
    'resetPassword.confirmPassword': 'Confirmer le mot de passe',
    'resetPassword.submit': 'Mettre à jour le mot de passe',
    'resetPassword.submitLoading': 'Mise à jour...',
    'resetPassword.linkExpired': 'Lien expiré',
    'resetPassword.linkExpiredDescription': 'Le lien de réinitialisation a expiré. Veuillez demander un nouveau lien.',
    'resetPassword.newLink': 'Demander un nouveau lien',
    'resetPassword.strength.weak': 'Faible',
    'resetPassword.strength.medium': 'Moyen',
    'resetPassword.strength.good': 'Bon',
    'resetPassword.strength.strong': 'Fort',
    'resetPassword.errors.passwordsMismatch': 'Les mots de passe ne correspondent pas',
    'resetPassword.errors.tooShort': 'Le mot de passe doit contenir au moins 6 caractères',
    'resetPassword.errors.sameAsOld': 'Le nouveau mot de passe doit être différent de l\'ancien',
    'resetPassword.errors.tooShortAuth': 'Le mot de passe doit contenir au moins 6 caractères',
    'resetPassword.errors.unexpected': 'Erreur inattendue, réessayez',
    'resetPassword.success': 'Mot de passe mis à jour avec succès',
    // ── Landing Page ──────────────────────────────
    'landing.brand': 'Fabric',
    'landing.nav.about': 'À propos',
    'landing.nav.features': 'Fonctionnalités',
    'landing.nav.pricing': 'Tarifs',
    'landing.nav.login': 'Connexion',
    'landing.nav.startNow': 'Commencer',
    'landing.hero.headline': 'Fabric : Gérez votre production avec intelligence',
    'landing.hero.desc1': 'Un système numérique simple pour gérer les lignes de production, suivre les commandes et entretenir les machines.',
    'landing.hero.desc2': 'Conçu spécialement pour s\'adapter à l\'environnement industriel algérien.',
    'landing.hero.statusPending': 'En attente',
    'landing.hero.statusInProgress': 'En cours',
    'landing.hero.statusCompleted': 'Terminé',
    'landing.hero.order1Title': 'Moteur électrique 5kW',
    'landing.hero.order2Title': 'Boîte de vitesses hydraulique',
    'landing.hero.order3Title': 'Panneau de commande intelligent',
    'landing.hero.orderIdSuffix': '#',
    'landing.hero.progressLabel': 'Progression',
    'landing.hero.progress': 'Progression : {progress}%',
    'landing.features.planning.title': 'Planification',
    'landing.features.planning.desc': 'Organiser les emplois du temps quotidiens et hebdomadaires avec une précision absolue pour assurer la continuité du fonctionnement.',
    'landing.features.tracking.title': 'Suivi des commandes',
    'landing.features.tracking.desc': 'Suivi en temps réel de chaque pièce depuis l\'entrée des matières premières jusqu\'à l\'expédition du produit fini.',
    'landing.features.maintenance.title': 'Maintenance préventive',
    'landing.features.maintenance.desc': 'Réduire les temps d\'arrêt imprévus grâce à la planification des alertes et des inspections techniques automatiques.',
    'landing.why.title': 'Pourquoi choisir Fabric pour votre usine ?',
    'landing.offline.title': 'Fonctionne sans internet',
    'landing.offline.desc': 'Conscient des défis d\'infrastructure dans les zones industrielles algériennes, Fabric fonctionne pleinement même sans connexion internet. Les données sont synchronisées automatiquement dès le retour de la connexion.',
    'landing.offline.bullet1': 'Base de données locale sécurisée',
    'landing.offline.bullet2': 'Synchronisation intelligente bidirectionnelle',
    'landing.cta.title': 'Prêt à numériser votre production ?',
    'landing.cta.desc': 'Rejoignez les dizaines de petites usines qui ont commencé leur transformation numérique avec Fabric.',
    'landing.cta.demo': 'Demander une démo',
    'landing.cta.expert': 'Parler à un expert',
    'landing.footer.brand': 'Fabric',
    'landing.footer.copyright': '© 2024 Fabric - Gestion de la production industrielle. Tous droits réservés.',
    'landing.footer.contact': 'Contact',
    'landing.footer.terms': 'Conditions',
    'landing.footer.privacy': 'Confidentialité',
    // ── Dashboard ─────────────────────────────────
    'dashboard.status.pending': 'En attente',
    'dashboard.status.inProgress': 'En cours',
    'dashboard.status.completed': 'Terminé',
    'dashboard.status.cancelled': 'Annulé',
    'dashboard.due.overdue': 'En retard',
    'dashboard.due.upcoming': 'Proche',
    'dashboard.due.onTrack': 'À temps',
    'dashboard.searchPlaceholder': 'Rechercher...',
    'dashboard.activeWorkOrders.title': 'Ordres de travail actifs',
    'dashboard.activeWorkOrders.needsAttention': 'Nécessite une action',
    'dashboard.activeWorkOrders.noOrders': 'Aucun ordre de travail actif',
    'dashboard.maintenanceAlerts.title': 'Alertes de maintenance',
    'dashboard.maintenanceAlerts.needsAction': 'Action requise',
    'dashboard.maintenanceAlerts.allGood': 'Machines en bon état',
    'dashboard.stoppedMachines.title': 'Machines arrêtées',
    'dashboard.stoppedMachines.none': 'Aucune machine arrêtée',
    'dashboard.stoppedMachines.some': 'Nécessite une attention',
    'dashboard.productionLive.title': 'État de production en direct',
    'dashboard.productionLive.showAll': 'Tout afficher',
    'dashboard.productionLive.orderId': 'ID commande',
    'dashboard.productionLive.product': 'Nom du produit',
    'dashboard.productionLive.status': 'Statut',
    'dashboard.productionLive.actions': 'Actions',
    'dashboard.productionLive.empty': 'Aucun ordre de travail en attente ou en cours',
    'dashboard.recentActivity.title': 'Activité récente',
    'dashboard.recentActivity.justNow': "À l'instant",
    'dashboard.recentActivity.completedOrder': 'Ordre de travail terminé',
    'dashboard.recentActivity.inProgressOrder': 'Ordre de travail en cours',
    'dashboard.recentActivity.newOrder': 'Nouvel ordre de travail',
    'dashboard.recentActivity.empty': 'Aucune activité récente',
    'dashboard.machines.title': 'État des machines',
    'dashboard.machines.showAll': 'Tout afficher',
    'dashboard.machines.name': 'Nom de la machine',
    'dashboard.machines.lastMaintenance': 'Dernière maintenance',
    'dashboard.machines.nextMaintenance': 'Prochaine maintenance',
    'dashboard.machines.status': 'Statut',
    'dashboard.machines.empty': 'Aucune machine active',
    'dashboard.machines.lastLabel': 'Dernière :',
    'dashboard.machines.nextLabel': 'Prochaine :',
    'dashboard.time.now': 'Maintenant',
    'dashboard.time.minutesAgo': 'Il y a {n} min',
    'dashboard.time.hoursAgo': 'Il y a {n}h',
    'dashboard.time.daysAgo': 'Il y a {n}j',
    // ── Roles ─────────────────────────────────────
    'role.owner': "Directeur d'usine",
    'role.worker': 'Opérateur',
    // ── Orders ────────────────────────────────────
    'orders.title': 'Commandes',
    'orders.addOrder': 'Ajouter une commande',
    'orders.add': 'Ajouter',
    'orders.editOrder': 'Modifier la commande',
    'orders.orderData': 'Données de la commande',
    'orders.product': 'Produit requis *',
    'orders.productPlaceholder': 'Choisir un produit',
    'orders.quantity': 'Quantité *',
    'orders.dueDate': 'Date d\'échéance',
    'orders.customerName': 'Nom du client *',
    'orders.submitSaving': 'Enregistrement...',
    'orders.submitSave': 'Enregistrer la commande',
    'orders.empty': 'Aucune commande enregistrée',
    'orders.productLabel': 'Produit :',
    'orders.quantityLabel': 'Quantité :',
    'orders.customerLabel': 'Client :',
    'orders.dueDateLabel': 'Échéance :',
    'orders.orderNumber': 'N° de commande',
    'orders.table.status': 'Statut',
    'orders.table.actions': 'Actions',
    'orders.moveToProduction': 'Mettre en production',
    'orders.moving': 'Transfert...',
    'orders.errors.required': 'Le produit, la quantité et le nom du client sont requis',
    'orders.errors.updateFailed': 'Erreur lors de la mise à jour de la commande',
    'orders.errors.addFailed': 'Erreur lors de l\'ajout de la commande',
    'orders.deleteTooltip': 'Supprimer la commande',
    'orders.deleteConfirm': 'Êtes-vous sûr de vouloir supprimer cette commande ?',
    'orders.deleteDescription': 'Cette action est irréversible',
    'orders.errors.deleteFailed': 'Erreur lors de la suppression de la commande',
    'orders.errors.cannotDelete': 'Impossible de supprimer une commande en traitement ou terminée',
    'orders.status.draft': 'Brouillon',
    'orders.status.processing': 'En traitement',
    'orders.status.confirmed': 'Confirmée',
    // ── Suppliers ─────────────────────────────────
    'suppliers.title': 'Fournisseurs',
    'suppliers.addSupplier': 'Ajouter un fournisseur',
    'suppliers.add': 'Ajouter',
    'suppliers.editSupplier': 'Modifier le fournisseur',
    'suppliers.supplierData': 'Données du fournisseur',
    'suppliers.name': 'Nom *',
    'suppliers.phone': 'Téléphone',
    'suppliers.emailOptional': 'Email (optionnel)',
    'suppliers.supplyDuration': 'Délai de livraison (jours)',
    'suppliers.minimumOrder': 'Commande min.',
    'suppliers.minimumOrderDesktop': 'Commande minimum',
    'suppliers.submitSaving': 'Enregistrement...',
    'suppliers.submitSave': 'Enregistrer',
    'suppliers.empty': 'Aucun fournisseur enregistré',
    'suppliers.phoneLabel': 'Téléphone :',
    'suppliers.supplyDurationLabel': 'Délai :',
    'suppliers.minimumOrderLabel': 'Minimum :',
    'suppliers.table.name': 'Nom',
    'suppliers.table.phone': 'Téléphone',
    'suppliers.table.supplyDuration': 'Délai',
    'suppliers.table.minimumOrder': 'Minimum',
    'suppliers.table.status': 'Statut',
    'suppliers.table.actions': 'Actions',
    'suppliers.status.active': 'Actif',
    'suppliers.status.inactive': 'Inactif',
    'suppliers.errors.nameRequired': 'Le nom du fournisseur est requis',
    'suppliers.errors.updateFailed': 'Erreur lors de la mise à jour',
    'suppliers.errors.addFailed': 'Erreur lors de l\'ajout',
    // ── Customers ─────────────────────────────────
    'customers.title': 'Gestion des clients',
    'customers.addCustomer': 'Ajouter un client',
    'customers.add': 'Ajouter',
    'customers.editCustomer': 'Modifier le client',
    'customers.customerData': 'Données du client',
    'customers.customerDetails': 'Détails du client',
    'customers.fullName': 'Nom complet *',
    'customers.phone': 'Téléphone',
    'customers.email': 'Email',
    'customers.address': 'Adresse',
    'customers.notes': 'Notes',
    'customers.submitSaving': 'Enregistrement...',
    'customers.submitSave': 'Enregistrer',
    'customers.empty': 'Aucun client enregistré',
    'customers.noResults': 'Aucun résultat trouvé',
    'customers.searchPlaceholder': 'Rechercher par nom, téléphone ou email...',
    'customers.details': 'Détails',
    'customers.orders': 'commandes',
    'customers.registeredOn': 'Inscrit le :',
    'customers.contactInfo': 'Informations de contact',
    'customers.notesLabel': 'Notes',
    'customers.ordersSummary': 'Résumé des commandes',
    'customers.totalOrders': 'Total des commandes',
    'customers.table.name': 'Nom',
    'customers.table.phone': 'Téléphone',
    'customers.table.email': 'Email',
    'customers.table.orders': 'Commandes',
    'customers.table.registered': 'Inscrit le',
    'customers.table.actions': 'Actions',
    'customers.deleteConfirm': 'Êtes-vous sûr de vouloir supprimer ce client ?',
    'customers.deleteDescription': 'Cette action est irréversible',
    'customers.errors.nameRequired': 'Le nom du client est requis',
    'customers.errors.updateFailed': 'Erreur lors de la mise à jour',
    'customers.errors.addFailed': 'Erreur lors de l\'ajout',
    'customers.customerOrders': 'Commandes du client',
    'customers.noOrders': 'Aucune commande pour ce client',
    'customers.orderId': 'N° commande',
    'customers.orderProduct': 'Produit',
    'customers.orderQuantity': 'Quantité',
    'customers.orderStatus': 'Statut',
    'customers.orderDueDate': 'Échéance',
    'orders.customerPlaceholder': 'Choisir un client ou taper un nouveau nom',
    'orders.addNewCustomer': '+ Ajouter un nouveau client',
    'orders.selectCustomer': 'Choisir un client',
    'orders.newCustomer': 'Nouveau client',
    'sidebar.customers': 'Clients',
    // ── Products ──────────────────────────────────
    'products.title': 'Produits',
    'products.addProduct': 'Ajouter un produit',
    'products.add': 'Ajouter',
    'products.editProduct': 'Modifier le produit',
    'products.productData': 'Données et recette du produit',
    'products.basicInfo': 'Informations de base',
    'products.name': 'Nom du produit *',
    'products.unit': 'Unité de mesure *',
    'products.manufacturingTime': 'Temps de fabrication (heures)',
    'products.bom': 'Recette des matériaux (BOM)',
    'products.addMaterial': '+ Ajouter un matériau',
    'products.noMaterials': 'Aucun matériau dans la recette',
    'products.materialPlaceholder': 'Choisir un matériau',
    'products.quantityPlaceholder': 'Quantité',
    'products.submitSaving': 'Enregistrement...',
    'products.submitSave': 'Enregistrer le produit',
    'products.empty': 'Aucun produit enregistré',
    'products.unitLabel': 'Unité :',
    'products.materialsCount': 'Matériaux :',
    'products.costNotCalculated': 'Coût : non calculé',
    'products.table.name': 'Nom du produit',
    'products.table.unit': 'Unité',
    'products.table.materialsCount': 'Nb matériaux',
    'products.table.totalCost': 'Coût total',
    'products.table.productionTime': 'Temps fabrication',
    'products.table.actions': 'Actions',
    'products.deleteConfirm': 'Confirmer la suppression',
    'products.deleteMessage': 'Êtes-vous sûr de supprimer le produit "<strong>{name}</strong>" ?',
    'products.deleteDescription': 'La recette de production (BOM) associée sera également supprimée.',
    'products.deleting': 'Suppression...',
    'products.yesDelete': 'Oui, supprimer',
    'products.cancel': 'Annuler',
    'products.editTooltip': 'Modifier',
    'products.deleteTooltip': 'Supprimer',
    'products.errors.nameRequired': 'Le nom du produit est requis',
    'products.errors.updateFailed': 'Erreur lors de la mise à jour',
    'products.errors.addFailed': 'Erreur lors de l\'ajout',
    'products.errors.recipeFailed': 'Erreur lors de l\'enregistrement de la recette',
    'products.errors.deleteFailed': 'Erreur lors de la suppression',
    // ── Materials ─────────────────────────────────
    'materials.title': 'Matières premières',
    'materials.addMaterial': 'Ajouter un matériau',
    'materials.add': 'Ajouter',
    'materials.editMaterial': 'Modifier le matériau',
    'materials.materialData': 'Données du matériau',
    'materials.name': 'Nom du matériau *',
    'materials.sku': 'Code (SKU) *',
    'materials.unit': 'Unité *',
    'materials.unitPlaceholder': 'kg, litre, pièce...',
    'materials.currentQuantity': 'Quantité actuelle',
    'materials.minimumAlert': 'Seuil d\'alerte minimum',
    'materials.defaultSupplier': 'Fournisseur par défaut',
    'materials.noSupplier': 'Sans fournisseur',
    'materials.submitSaving': 'Enregistrement...',
    'materials.submitSave': 'Enregistrer',
    'materials.empty': 'Aucune matière première enregistrée',
    'materials.unitLabel': 'Unité :',
    'materials.quantityLabel': 'Quantité :',
    'materials.minimumLabel': 'Minimum :',
    'materials.supplierLabel': 'Fournisseur :',
    'materials.table.name': 'Nom',
    'materials.table.sku': 'Code',
    'materials.table.unit': 'Unité',
    'materials.table.quantity': 'Quantité',
    'materials.table.minimum': 'Minimum',
    'materials.table.supplier': 'Fournisseur',
    'materials.table.status': 'Statut',
    'materials.table.actions': 'Actions',
    'materials.status.outOfStock': 'Rupture',
    'materials.status.low': 'Bas',
    'materials.status.available': 'Disponible',
    'materials.editTooltip': 'Modifier',
    'materials.errors.required': 'Le nom, le code et l\'unité sont requis',
    'materials.errors.updateFailed': 'Erreur lors de la mise à jour',
    'materials.errors.addFailed': 'Erreur lors de l\'ajout',
    'materials.errors.deleteFailed': 'Erreur lors de la suppression',
    'materials.errors.cannotDelete': 'Impossible de supprimer car le matériau est utilisé dans des fiches techniques',
    'materials.deleteTooltip': 'Supprimer',
    'materials.deleteConfirm': 'Êtes-vous sûr de vouloir supprimer ce matériau ?',
    // ── Machines ──────────────────────────────────
    'machines.title': 'Gestion des machines',
    'machines.addMachine': 'Ajouter une machine',
    'machines.add': 'Ajouter',
    'machines.editMachine': 'Modifier la machine',
    'machines.machineData': 'Données de la machine',
    'machines.machineId': 'N° machine',
    'machines.name': 'Nom de la machine',
    'machines.location': 'Emplacement',
    'machines.notes': 'Notes',
    'machines.lastMaintenance': 'Dernière maintenance',
    'machines.nextScheduled': 'Prochaine prévue',
    'machines.status': 'Statut',
    'machines.maintenanceInterval': 'Intervalle (jours)',
    'machines.submitSaving': 'Enregistrement...',
    'machines.submitSave': 'Enregistrer',
    'machines.empty': 'Aucune machine enregistrée',
    'machines.searchPlaceholder': 'Rechercher par nom ou emplacement...',
    'machines.filterAll': 'Toutes',
    'machines.filterGood': 'Bon état',
    'machines.filterUnderMaintenance': 'En maintenance',
    'machines.filterStopped': 'Arrêtée',
    'machines.status.good': 'Bon état',
    'machines.status.underMaintenance': 'En maintenance',
    'machines.status.stopped': 'Arrêtée',
    'machines.table.machineId': 'N° machine',
    'machines.table.name': 'Nom',
    'machines.table.location': 'Emplacement',
    'machines.table.lastMaintenance': 'Dernière maintenance',
    'machines.table.nextScheduled': 'Prochaine prévue',
    'machines.table.status': 'Statut',
    'machines.table.actions': 'Actions',
    'machines.basicInfo': 'Informations de base',
    'machines.maintenanceInfo': 'Informations de maintenance',
    'machines.action.details': 'Détails',
    'machines.action.logMaintenance': 'Enregistrer maintenance',
    'machines.action.edit': 'Modifier',
    'machines.action.logMaintenanceNow': 'Enregistrer maintenance',
    'machines.errors.nameRequired': 'Le nom de la machine est requis',
    'machines.errors.updateFailed': 'Erreur lors de la mise à jour',
    'machines.errors.addFailed': "Erreur lors de l'ajout",
    'machines.errors.maintenanceLogFailed': "Erreur lors de l'enregistrement de la maintenance",
    'machines.errors.deleteFailed': "Erreur lors de la suppression",
    'machines.deleteSuccess': 'Machine supprimée avec succès',
    'machines.deleteConfirm': 'Êtes-vous sûr de vouloir supprimer cette machine ?',
    'machines.maintenanceDate': 'Date de maintenance *',
    'machines.maintenanceNote': 'Notes',
    'machines.maintenanceLogTitle': 'Enregistrer maintenance',
    'machines.maintenanceLogSuccess': 'Maintenance enregistrée avec succès',
    // ── Schedule ──────────────────────────────────
    'schedule.title': 'Planification de production',
    'schedule.suggestedOrders': 'Commandes d\'achat suggérées',
    'schedule.noOrders': 'Aucune commande d\'achat suggérée',
    'schedule.urgent': 'Urgent',
    'schedule.requiredQuantity': 'Quantité requise :',
    'schedule.currentStock': 'Stock actuel :',
    'schedule.supplierLabel': 'Fournisseur :',
    'schedule.orderDate': 'Date de commande :',
    'schedule.table.material': 'Matériau',
    'schedule.table.requiredQuantity': 'Quantité requise',
    'schedule.table.stock': 'Stock',
    'schedule.table.supplier': 'Fournisseur',
    'schedule.table.supplyDuration': 'Délai',
    'schedule.table.orderDate': 'Date commande',
    'schedule.table.status': 'Statut',
    'schedule.table.actions': 'Actions',
    'schedule.approveTooltip': 'Approuver',
    'schedule.postponeTooltip': 'Reporter',
    // ── Units ─────────────────────────────────────
    'units.piece': 'Pièce',
    'units.meter': 'Mètre',
    'units.kilogram': 'Kilogramme',
    'units.liter': 'Litre',
    // ── Tracking ──────────────────────────────────
    'tracking.title': 'Suivi production',
    'tracking.subtitle': 'Surveillance des processus de fabrication et contrôle des statuts des ordres de travail.',
    'tracking.table.product': 'Nom du produit',
    'tracking.table.quantity': 'Quantité',
    'tracking.table.status': 'Statut',
    'tracking.table.plannedStart': 'Début prévu',
    'tracking.table.plannedEnd': 'Fin prévue',
    'tracking.table.orderNumber': 'N° commande',
    'tracking.status.pending': 'En attente',
    'tracking.status.inProgress': 'En cours',
    'tracking.status.completed': 'Terminée',
    'tracking.empty': "Aucun ordre de travail pour le moment",
    'tracking.errors.updateFailed': 'Erreur lors de la mise à jour du statut',
    'tracking.errors.alreadyCompleted': 'Ordre de travail déjà terminé',
  },
};

export function t(key: TranslationKey, locale: LocaleCode): string {
  return dictionaries[locale]?.[key] ?? dictionaries.ar[key] ?? key;
}

export function getIndustryOptions(locale: LocaleCode): string[] {
  return industryOptions[locale] ?? industryOptions.ar;
}

export function getUnitOptions(locale: LocaleCode): string[] {
  return unitOptions[locale] ?? unitOptions.ar;
}

export function tRaw(key: TranslationKey, locale: LocaleCode, params?: Record<string, string | number>): string {
  let value = dictionaries[locale]?.[key] ?? dictionaries.ar[key] ?? key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      value = value.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
    }
  }
  return value;
}
