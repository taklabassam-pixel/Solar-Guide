// src/data/invertersData.js

export const invertersData = [
  {
    id: 'voltronic_offgrid',
    brand: 'Voltronic / Axpert / Must / Felicity',
    category: 'Off-Grid',
    settings: [
      // 🌟 بارامترات هامة وأساسية (isEssential: true)
      { 
        code: '01', 
        name: 'أولوية مصدر الخرج', 
        name_en: 'Output Source Priority', 
        recommended: 'SBU', 
        isEssential: true, 
        desc: 'أولوية التغذية للأحمال (الألواح -> البطارية -> المولد)',
        desc_en: 'Power priority for loads (Solar -> Battery -> Generator)'
      },
      { 
        code: '02', 
        name: 'أقصى تيار شحن كلي', 
        name_en: 'Max Charging Current', 
        recommended: '30A - 60A', 
        isEssential: true, 
        desc: 'أقصى تيار شحن كلي لحماية البطاريات',
        desc_en: 'Total maximum charging current to protect batteries'
      },
      { 
        code: '05', 
        name: 'نوع البطارية', 
        name_en: 'Battery Type', 
        recommended: 'USE / LIC', 
        isEssential: true, 
        desc: 'نوع البطارية (مخصص أو ليثيوم عبر BMS)',
        desc_en: 'Battery chemistry type (User-Defined or Lithium via BMS)'
      },
      { 
        code: '12', 
        name: 'جهد التحويل للمولد/الشبكة', 
        name_en: 'Back to Utility Voltage', 
        recommended: '48.0V', 
        isEssential: true, 
        desc: 'جهد التحويل للمولد/الشركة عند انخفاض البطارية',
        desc_en: 'Voltage threshold to switch to grid/generator when battery is low'
      },
      { 
        code: '13', 
        name: 'جهد العودة للبطارية', 
        name_en: 'Back to Battery Voltage', 
        recommended: '54.0V', 
        isEssential: true, 
        desc: 'جهد العودة للبطارية بعد شحنها',
        desc_en: 'Voltage threshold to switch back to battery power after recharging'
      },
      { 
        code: '29', 
        name: 'جهد الفصل النهائي (Cut-off)', 
        name_en: 'Low DC Cut-off Voltage', 
        recommended: '42.0V - 44.0V', 
        isEssential: true, 
        desc: 'جهد الفصل النهائي لحماية خلايا البطارية',
        desc_en: 'Low voltage limit to disconnect output and protect battery cells'
      },

      // 🛠️ باقي البارامترات المتقدمة (isEssential: false)
      { 
        code: '03', 
        name: 'نطاق جهد دخل الكهرباء (AC)', 
        name_en: 'AC Input Voltage Range', 
        recommended: 'APL (90-280VAC)', 
        isEssential: false, 
        desc: 'نطاق فولتية المولد/الشركة (APL مناسب لمولدات لبنان)',
        desc_en: 'Acceptable AC voltage range (APL is ideal for generators)'
      },
      { 
        code: '06', 
        name: 'إعادة التشغيل عند الحمل الزائد', 
        name_en: 'Auto Restart When Overload', 
        recommended: 'LFD (Disable)', 
        isEssential: false, 
        desc: 'إعادة التشغيل التلقائي عند الحمل الزائد',
        desc_en: 'Automatically restart inverter when overload event occurs'
      },
      { 
        code: '07', 
        name: 'إعادة التشغيل عند ارتفاع الحرارة', 
        name_en: 'Auto Restart When Overtemp', 
        recommended: 'CFD (Disable)', 
        isEssential: false, 
        desc: 'إعادة التشغيل التلقائي عند ارتفاع الحرارة',
        desc_en: 'Automatically restart inverter after unit cools down'
      },
      { 
        code: '09', 
        name: 'تردد التيار الخارج', 
        name_en: 'Output Frequency', 
        recommended: '50Hz', 
        isEssential: false, 
        desc: 'تردد التيار الخارج',
        desc_en: 'Sets the nominal AC output frequency'
      },
      { 
        code: '11', 
        name: 'أقصى تيار شحن من الشبكة/المولد', 
        name_en: 'Maximum Utility Charge Current', 
        recommended: '20A - 30A', 
        isEssential: false, 
        desc: 'أقصى تيار شحن من كهرباء الشركة/المولد فقط',
        desc_en: 'Maximum charging current supplied from utility or generator only'
      },
      { 
        code: '16', 
        name: 'أولوية مصدر الشحن', 
        name_en: 'Charger Source Priority', 
        recommended: 'CSO (Solar First)', 
        isEssential: false, 
        desc: 'أولوية مصدر الشحن (الشمس أولاً)',
        desc_en: 'Configures charger priority (Solar First)'
      },
      { 
        code: '18', 
        name: 'الإنذار الصوتي', 
        name_en: 'Alarm Control', 
        recommended: 'BON (Enable)', 
        isEssential: false, 
        desc: 'تشغيل/إيقاف صوت الإنذار (Buzzer)',
        desc_en: 'Enables or disables internal audible buzzer alarm'
      },
      { 
        code: '19', 
        name: 'العودة للشاشة الرئيسية تلقائياً', 
        name_en: 'Auto Return to Default Screen', 
        recommended: 'ESP (Enable)', 
        isEssential: false, 
        desc: 'العودة للشاشة الرئيسية تلقائياً',
        desc_en: 'Automatically returns LCD screen to default display'
      },
      { 
        code: '22', 
        name: 'التنبيه عند انقطاع المصدر الرئيسي', 
        name_en: 'Beep When Primary Source Fails', 
        recommended: 'AOF (Disable)', 
        isEssential: false, 
        desc: 'التنبيه الصوتي عند انقطاع المصدر الرئيسي',
        desc_en: 'Audible notification when main power source interrupts'
      },
      { 
        code: '26', 
        name: 'جهد الشحن الرئيسي (Bulk)', 
        name_en: 'Bulk Charging Voltage', 
        recommended: '56.4V', 
        isEssential: false, 
        desc: 'جهد الشحن الرئيسي للبطارية',
        desc_en: 'Constant voltage set point for fast charging stage'
      },
      { 
        code: '27', 
        name: 'جهد الشحن العائم (Float)', 
        name_en: 'Floating Charging Voltage', 
        recommended: '54.0V', 
        isEssential: false, 
        desc: 'جهد الشحن العائم (Float Stage)',
        desc_en: 'Maintenance voltage to keep battery fully charged'
      }
    ]
  },
  {
    id: 'deye_hybrid',
    brand: 'Deye / Sol-Ark',
    category: 'Hybrid',
    settings: [
      { 
        code: 'Work Mode', 
        name: 'نمط تشغيل النظام', 
        name_en: 'System Work Mode', 
        recommended: 'Zero Export to Load', 
        isEssential: true, 
        desc: 'نمط العمل وعدم التصدير للشبكة',
        desc_en: 'System operation mode preventing power export to the grid'
      },
      { 
        code: 'Batt Type', 
        name: 'نوع ونسبة البطارية', 
        name_en: 'Battery Capacity / Type', 
        recommended: 'Lithium (BMS)', 
        isEssential: true, 
        desc: 'ضبط بروتوكول اتصال البطارية',
        desc_en: 'Configures battery communication protocol and capacity'
      },
      { 
        code: 'Max Charge', 
        name: 'أقصى تيار شحن', 
        name_en: 'Max Charge Current', 
        recommended: '80A - 100A', 
        isEssential: true, 
        desc: 'أقصى تيار شحن مسموح به',
        desc_en: 'Maximum allowable battery charging current'
      },
      { 
        code: 'Shutdown', 
        name: 'نسبة/جهد الإطفاء', 
        name_en: 'Shutdown SOC / Voltage', 
        recommended: '20% SOC / 42.0V', 
        isEssential: true, 
        desc: 'نسبة/جهد الإطفاء لحماية البطارية',
        desc_en: 'Battery disconnect threshold to prevent over-discharge'
      },
      { 
        code: 'Low Batt', 
        name: 'تنبيه انخفاض البطارية', 
        name_en: 'Low Battery Warning', 
        recommended: '35% SOC / 46.0V', 
        isEssential: true, 
        desc: 'تنبيه انخفاض مستوى البطارية',
        desc_en: 'Early warning trigger when battery reaches low capacity'
      },
      
      // تفاصيل متقدمة
      { 
        code: 'Gen Signal', 
        name: 'إشارة إيقاف المولد', 
        name_en: 'Generator Off Signal', 
        recommended: 'Auto Off at 95% SOC', 
        isEssential: false, 
        desc: 'إشارة إيقاف تشغيل المولد تلقائياً',
        desc_en: 'Auto stop signal sent to generator when battery is charged'
      },
      { 
        code: 'Grid Peak', 
        name: 'تقليل استهلاك الذروة', 
        name_en: 'Grid Peak Shaving', 
        recommended: 'Enabled', 
        isEssential: false, 
        desc: 'تقليل الاستهلاك المأخوذ من الشبكة في أوقات الذروة',
        desc_en: 'Limits grid power usage during peak demand hours'
      },
      { 
        code: 'Smart Load', 
        name: 'مخرج الحمل الذكي', 
        name_en: 'Smart Load Output', 
        recommended: 'Off Grid Mode', 
        isEssential: false, 
        desc: 'تشغيل الحمل الذكي عند زيادة إنتاج الألواح',
        desc_en: 'Powers secondary non-critical loads during excess solar output'
      }
    ]
  },
  {
    id: 'lw_inv_hy_3kw',
    brand: 'Lightwave',
    category: 'Hybrid',
    settings: [
      // الإعدادات الأساسية
      { 
        code: '01', 
        name: 'أولوية مصدر الخرج', 
        name_en: 'Output Source Priority', 
        recommended: 'SOL (Solar First) / SUB', 
        isEssential: true, 
        desc: 'أولوية مصدر تغذية الأحمال (شمس أولاً ثم بطارية/شبكة)',
        desc_en: 'Power priority for loads (Solar first then battery/grid)'
      },
      { 
        code: '02', 
        name: 'أقصى تيار شحن كلي', 
        name_en: 'Maximum Charging Current', 
        recommended: '60A (Total PV + AC)', 
        isEssential: true, 
        desc: 'أقصى تيار شحن كلي مجمع من الشمس والكهرباء',
        desc_en: 'Combined maximum charging current from PV and AC'
      },
      { 
        code: '03', 
        name: 'نطاق جهد الدخل المسموح', 
        name_en: 'AC Input Voltage Range', 
        recommended: 'UPS (170V-264V) / APL', 
        isEssential: true, 
        desc: 'نطاق جهد الدخل المسموح به (وضع الحواسيب أو الأجهزة)',
        desc_en: 'Input AC range (UPS for electronics or APL for general appliances)'
      },
      { 
        code: '05', 
        name: 'نوع البطارية', 
        name_en: 'Battery Type', 
        recommended: 'AGM / LIB / FEL / CUS', 
        isEssential: true, 
        desc: 'تحديد نوع البطارية (ليثيوم، AGM، أو مخصص)',
        desc_en: 'Selects battery type (AGM, Lithium, Gel, or Custom)'
      },
      { 
        code: '29', 
        name: 'جهد قطع البطارية (Cut-off)', 
        name_en: 'Low DC Cut-off Voltage', 
        recommended: '21.0V (Default)', 
        isEssential: true, 
        desc: 'جهد قطع البطارية والإطفاء لحمايتها من التفريغ العميق',
        desc_en: 'Low battery cutoff limit to avoid deep discharge damage'
      },

      // تفاصيل متقدمة
      { 
        code: '06', 
        name: 'إعادة التشغيل عند الحمل الزائد', 
        name_en: 'Auto Restart When Overload', 
        recommended: 'LFd (Enabled)', 
        isEssential: false, 
        desc: 'إعادة التشغيل تلقائياً عند زوال الحمل الزائد',
        desc_en: 'Automatically restart once overload condition clears'
      },
      { 
        code: '07', 
        name: 'إعادة التشغيل عند ارتفاع الحرارة', 
        name_en: 'Auto Restart When Overtemp', 
        recommended: 'EFe (Enabled)', 
        isEssential: false, 
        desc: 'إعادة التشغيل تلقائياً بعد انخفاض الحرارة',
        desc_en: 'Automatically restart once internal temperature normalizes'
      },
      { 
        code: '11', 
        name: 'أقصى تيار شحن من الشبكة', 
        name_en: 'Maximum Utility Charging Current', 
        recommended: '30A - 60A', 
        isEssential: false, 
        desc: 'أقصى تيار شحن مسموح به من كهرباء الشبكة/المولد',
        desc_en: 'Max charging current allowed from AC grid/generator'
      },
      { 
        code: '16', 
        name: 'أولوية مصدر الشحن', 
        name_en: 'Charger Source Priority', 
        recommended: 'SNU (Solar & Utility) / CSO', 
        isEssential: false, 
        desc: 'أولوية مصدر شحن البطارية',
        desc_en: 'Configures source priority for battery charging'
      },
      { 
        code: '18', 
        name: 'الإنذار الصوتي', 
        name_en: 'Alarm Control', 
        recommended: 'BON (Buzzer On)', 
        isEssential: false, 
        desc: 'تشغيل أو إيقاف التنبيه الصوتي للإنفرتر',
        desc_en: 'Turn audible inverter buzzer on or off'
      },
      { 
        code: '19', 
        name: 'العودة للشاشة الرئيسية', 
        name_en: 'Auto Return to Default Screen', 
        recommended: 'ESP (Enabled)', 
        isEssential: false, 
        desc: 'العودة تلقائياً للشاشة الرئيسية بعد فترة من عدم الاستخدام',
        desc_en: 'Reverts to primary screen after period of inactivity'
      },
      { 
        code: '20', 
        name: 'إضاءة الشاشة الخلفية', 
        name_en: 'Backlight Control', 
        recommended: 'LON (On)', 
        isEssential: false, 
        desc: 'تشغيل إضاءة شاشة LCD باستمرار',
        desc_en: 'Keeps LCD backlight continuously illuminated'
      },
      { 
        code: '26', 
        name: 'جهد الشحن الرئيسي (Bulk)', 
        name_en: 'Bulk Charging Voltage (C.V)', 
        recommended: '28.2V (AGM) / 29.0V (FLD)', 
        isEssential: false, 
        desc: 'ضبط جهد الشحن الثابت للبطارية',
        desc_en: 'Sets constant voltage level for main charge stage'
      },
      { 
        code: '27', 
        name: 'جهد الشحن العائم (Float)', 
        name_en: 'Floating Charging Voltage', 
        recommended: '27.0V', 
        isEssential: false, 
        desc: 'ضبط جهد الشحن العائم للحفاظ على البطارية',
        desc_en: 'Sets float voltage to maintain battery charge'
      }
    ]
  }
];

// 🔗 التصديرات لتفادي أي خطأ Import مستقبلاً:
export const INVERTER_PRESETS = invertersData;
export const INVERTERS_DATABASE = invertersData;

export default invertersData;