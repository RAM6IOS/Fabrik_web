import type { LocaleCode } from '@/types';

type TranslationKey =
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
  | 'common.saving'
  | 'common.error'
  | 'common.loading';

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

const dictionaries: Record<LocaleCode, Record<TranslationKey, string>> = {
  ar: {
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
    'common.saving': 'جاري الحفظ...',
    'common.error': 'حدث خطأ. حاول مرة أخرى.',
    'common.loading': 'جارٍ التحميل...',
  },
  fr: {
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
    'settings.language.description': 'Choisir la langue de l\'interface',
    'settings.language.saved': 'Préférence de langue enregistrée',
    'settings.factory.heading': 'Paramètres de l\'usine',
    'settings.factory.name': 'Nom de l\'usine',
    'settings.factory.industry': "Secteur d'activité",
    'settings.factory.address': 'Adresse',
    'settings.factory.contact': 'Coordonnées',
    'settings.factory.save': 'Enregistrer',
    'settings.factory.saved': 'Paramètres de l\'usine mis à jour',
    'settings.factory.industryPlaceholder': 'Sélectionnez le secteur',
    'settings.usersManagement.heading': 'Gestion des utilisateurs',
    'settings.usersManagement.description': 'Gérer les permissions et les rôles des utilisateurs',
    'settings.usersManagement.action': 'Gérer les utilisateurs',
    'common.saving': 'Enregistrement...',
    'common.error': 'Une erreur est survenue. Réessayez.',
    'common.loading': 'Chargement...',
  },
};

export function t(key: TranslationKey, locale: LocaleCode): string {
  return dictionaries[locale]?.[key] ?? dictionaries.ar[key] ?? key;
}

export function getIndustryOptions(locale: LocaleCode): string[] {
  return industryOptions[locale] ?? industryOptions.ar;
}
