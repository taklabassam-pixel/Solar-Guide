// src/data/invertersData.js

export const invertersData = [
  {
    id: 'voltronic_offgrid',
    brand: 'Voltronic / Axpert / Must / Felicity',
    category: 'Off-Grid',
    settings: [
      // 🌟 بارامترات هامة وأساسية (isEssential: true)
      { code: '01', name: 'Output Source Priority', recommended: 'SBU', isEssential: true, desc: 'أولوية التغذية للأحمال (الألواح -> البطارية -> المولد)' },
      { code: '02', name: 'Max Charging Current', recommended: '30A - 60A', isEssential: true, desc: 'أقصى تيار شحن كلي لحماية البطاريات' },
      { code: '05', name: 'Battery Type', recommended: 'USE / LIC', isEssential: true, desc: 'نوع البطارية (مخصص أو ليثيوم عبر BMS)' },
      { code: '12', name: 'Back to Utility Voltage', recommended: '48.0V', isEssential: true, desc: 'جهد التحويل للمولد/الشركة عند انخفاض البطارية' },
      { code: '13', name: 'Back to Battery Voltage', recommended: '54.0V', isEssential: true, desc: 'جهد العودة للبطارية بعد شحنها' },
      { code: '29', name: 'Low DC Cut-off Voltage', recommended: '42.0V - 44.0V', isEssential: true, desc: 'جهد الفصل النهائي لحماية خلايا البطارية' },

      // 🛠️ باقي البارامترات المتقدمة (isEssential: false)
      { code: '03', name: 'AC Input Voltage Range', recommended: 'APL (90-280VAC)', isEssential: false, desc: 'نطاق فولتية المولد/الشركة (APL مناسب لمولدات لبنان)' },
      { code: '06', name: 'Auto Restart When Overload', recommended: 'LFD (Disable)', isEssential: false, desc: 'إعادة التشغيل التلقائي عند الحمل الزائد' },
      { code: '07', name: 'Auto Restart When Overtemp', recommended: 'CFD (Disable)', isEssential: false, desc: 'إعادة التشغيل التلقائي عند ارتفاع الحرارة' },
      { code: '09', name: 'Output Frequency', recommended: '50Hz', isEssential: false, desc: 'تردد التيار الخارج' },
      { code: '11', name: 'Maximum Utility Charge Current', recommended: '20A - 30A', isEssential: false, desc: 'أقصى تيار شحن من كهرباء الشركة/المولد فقط' },
      { code: '16', name: 'Charger Source Priority', recommended: 'CSO (Solar First)', isEssential: false, desc: 'أولوية مصدر الشحن (الشمس أولاً)' },
      { code: '18', name: 'Alarm Control', recommended: 'BON (Enable)', isEssential: false, desc: 'تشغيل/إيقاف صوت الإنذار (Buzzer)' },
      { code: '19', name: 'Auto Return to Default Screen', recommended: 'ESP (Enable)', isEssential: false, desc: 'العودة للشاشة الرئيسية تلقائياً' },
      { code: '22', name: 'Beep When Primary Source Fails', recommended: 'AOF (Disable)', isEssential: false, desc: 'التنبيه الصوتي عند انقطاع المصدر الرئيسي' },
      { code: '26', name: 'Bulk Charging Voltage', recommended: '56.4V', isEssential: false, desc: 'جهد الشحن الرئيسي للبطارية' },
      { code: '27', name: 'Floating Charging Voltage', recommended: '54.0V', isEssential: false, desc: 'جهد الشحن العائم (Float Stage)' }
    ]
  },
  {
    id: 'deye_hybrid',
    brand: 'Deye / Sol-Ark',
    category: 'Hybrid',
    settings: [
      { code: 'Work Mode', name: 'System Work Mode', recommended: 'Zero Export to Load', isEssential: true, desc: 'نمط العمل وعدم التصدير للشبكة' },
      { code: 'Batt Type', name: 'Battery Capacity / Type', recommended: 'Lithium (BMS)', isEssential: true, desc: 'ضبط بروتوكول اتصال البطارية' },
      { code: 'Max Charge', name: 'Max Charge Current', recommended: '80A - 100A', isEssential: true, desc: 'أقصى تيار شحن مسموح به' },
      { code: 'Shutdown', name: 'Shutdown SOC / Voltage', recommended: '20% SOC / 42.0V', isEssential: true, desc: 'نسبة/جهد الإطفاء لحماية البطارية' },
      { code: 'Low Batt', name: 'Low Battery Warning', recommended: '35% SOC / 46.0V', isEssential: true, desc: 'تنبيه انخفاض مستوى البطارية' },
      
      // تفاصيل متقدمة
      { code: 'Gen Signal', name: 'Generator Off Signal', recommended: 'Auto Off at 95% SOC', isEssential: false, desc: 'إشارة إيقاف تشغيل المولد تلقائياً' },
      { code: 'Grid Peak', name: 'Grid Peak Shaving', recommended: 'Enabled', isEssential: false, desc: 'تقليل الاستهلاك المأخوذ من الشبكة في أوقات الذروة' },
      { code: 'Smart Load', name: 'Smart Load Output', recommended: 'Off Grid Mode', isEssential: false, desc: 'تشغيل الحمل الذكي عند زيادة إنتاج الألواح' }
    ]
  },
  {
  id: 'lw_inv_hy_3kw',
  brand: 'Lightwave',
  category: 'Hybrid',
  settings: [
    // الإعدادات الأساسية
    { code: '01', name: 'Output Source Priority', recommended: 'SOL (Solar First) / SUB', isEssential: true, desc: 'أولوية مصدر تغذية الأحمال (شمس أولاً ثم بطارية/شبكة)' },
    { code: '02', name: 'Maximum Charging Current', recommended: '60A (Total PV + AC)', isEssential: true, desc: 'أقصى تيار شحن كلي مجمع من الشمس والكهرباء' },
    { code: '03', name: 'AC Input Voltage Range', recommended: 'UPS (170V-264V) / APL', isEssential: true, desc: 'نطاق جهد الدخل المسموح به (وضع الحواسيب أو الأجهزة)' },
    { code: '05', name: 'Battery Type', recommended: 'AGM / LIB / FEL / CUS', isEssential: true, desc: 'تحديد نوع البطارية (ليثيوم، AGM، أو مخصص)' },
    { code: '29', name: 'Low DC Cut-off Voltage', recommended: '21.0V (Default)', isEssential: true, desc: 'جهد قطع البطارية والإطفاء لحمايتها من التفريغ العميق' },

    // تفاصيل متقدمة
    { code: '06', name: 'Auto Restart When Overload', recommended: 'LFd (Enabled)', isEssential: false, desc: 'إعادة التشغيل تلقائياً عند زوال الحمل الزائد' },
    { code: '07', name: 'Auto Restart When Overtemp', recommended: 'EFe (Enabled)', isEssential: false, desc: 'إعادة التشغيل تلقائياً بعد انخفاض الحرارة' },
    { code: '11', name: 'Maximum Utility Charging Current', recommended: '30A - 60A', isEssential: false, desc: 'أقصى تيار شحن مسموح به من كهرباء الشبكة/المولد' },
    { code: '16', name: 'Charger Source Priority', recommended: 'SNU (Solar & Utility) / CSO', isEssential: false, desc: 'أولوية مصدر شحن البطارية' },
    { code: '18', name: 'Alarm Control', recommended: 'BON (Buzzer On)', isEssential: false, desc: 'تشغيل أو إيقاف التنبيه الصوتي للإنفرتر' },
    { code: '19', name: 'Auto Return to Default Screen', recommended: 'ESP (Enabled)', isEssential: false, desc: 'العودة تلقائياً للشاشة الرئيسية بعد فترة من عدم الاستخدام' },
    { code: '20', name: 'Backlight Control', recommended: 'LON (On)', isEssential: false, desc: 'تشغيل إضاءة شاشة LCD باستمرار' },
    { code: '26', name: 'Bulk Charging Voltage (C.V)', recommended: '28.2V (AGM) / 29.0V (FLD)', isEssential: false, desc: 'ضبط جهد الشحن الثابت للبطارية' },
    { code: '27', name: 'Floating Charging Voltage', recommended: '27.0V', isEssential: false, desc: 'ضبط جهد الشحن العائم للحفاظ على البطارية' }
  ]
}
];
export default invertersData;