import React from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, Tv, Sun, Battery, ShieldAlert, Settings, Printer, CheckCircle2 } from 'lucide-react';

// 🔹 المعطيات الافتراضية المطابقة تماماً لصور الحاسبات الثلاث
const DEFAULT_LOADS = {
  deviceList: [
    { name: 'Home Refrigerator (150W)', watt: 150, qty: 1, hours: 24 },
    { name: 'LED Light (10W)', watt: 10, qty: 5, hours: 6 }
  ]
};

const DEFAULT_PANELS = {
  requiredWatt: 1127,
  panelWatt: 550,
  count: 3
};

const DEFAULT_BATTERY = {
  type: 'Lithium (LiFePO4)',
  count: 2,
  maxCurrent: '47 A',
  breaker: '63 A DC',
  cableSize: '16 mm²'
};

const DEFAULT_INVERTER = {
  brand: 'Off-Grid Inverter',
  systemVoltage: '24 V',
  maxChargeCurrent: '30 A',
  cutoffVoltage: '21.0 V',
  bulkVoltage: '28.4 V',
  floatVoltage: '27.0 V'
};

export function FinalReportTab({ 
  darkMode = true, 
  deviceList = DEFAULT_LOADS.deviceList, 
  totalDailyWh,
  panelsConfig = {},
  batteryConfig = {},
  inverterConfig = {}
}) {
  const { t, i18n } = useTranslation(undefined, { keyPrefix: 'calculators_hub.report' });

  // 🛡️ استخدام القائمة الممررة أو القائمة الافتراضية
  const currentDeviceList = deviceList && deviceList.length > 0 ? deviceList : DEFAULT_LOADS.deviceList;

  // 🛡️ حساب إجمالي الاستهلاك اليومي بأمان
  const calculatedTotalDailyWh = totalDailyWh ?? currentDeviceList.reduce((acc, item) => acc + (item.watt * item.qty * item.hours), 0);
  const totalKwh = (calculatedTotalDailyWh / 1000).toFixed(2);

  // 🛡️ دمج الكائنات الممررة مع المعطيات الافتراضية للصور
  const panels = { ...DEFAULT_PANELS, ...(panelsConfig || {}) };
  const battery = { ...DEFAULT_BATTERY, ...(batteryConfig || {}) };
  const inverter = { ...DEFAULT_INVERTER, ...(inverterConfig || {}) };

  return (
    <div className={`p-4 sm:p-6 rounded-2xl border space-y-6 ${
      darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
    }`}>
      {/* الهيدر الأكبر للتقرير */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 text-emerald-500 rounded-xl">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-extrabold">{t('header_title', 'التقرير الفني الشامل للمنظومة')}</h2>
            <p className="text-[11px] opacity-60">{t('header_subtitle', 'ملخص كامل ومفصل لجميع نصوص وحسابات المنظومة الشمسية')}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => window.print()}
          className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer shadow-md print:hidden transition-all"
        >
          <Printer className="w-4 h-4" />
          <span className="hidden sm:inline">{t('print_button', 'طباعة / حفظ التقرير PDF')}</span>
        </button>
      </div>

      {/* 1️⃣ جدول الأحمال */}
      <div className={`p-4 rounded-xl border space-y-3 ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
        <h3 className="text-xs font-bold text-amber-500 flex items-center gap-2 border-b pb-2 dark:border-slate-800 border-slate-200">
          <Tv className="w-4 h-4" />
          {t('sec_loads', '1. جدول الأحمال والأجهزة الكهربائية')}
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b dark:border-slate-800 border-slate-200 opacity-70">
                <th className="py-2 px-2">{t('col_device', 'اسم الجهاز')}</th>
                <th className="py-2 px-2 text-center">{t('col_power', 'القدرة (واط)')}</th>
                <th className="py-2 px-2 text-center">{t('col_qty', 'العدد')}</th>
                <th className="py-2 px-2 text-center">{t('col_hours', 'ساعات التشغيل')}</th>
                <th className="py-2 px-2 text-left">{t('col_energy', 'الاستهلاك (واط.ساعة)')}</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-slate-800/60 divide-slate-200">
              {currentDeviceList.map((dev, idx) => (
                <tr key={idx} className="hover:bg-slate-500/5">
                  <td className="py-2 px-2 font-semibold">{dev.name}</td>
                  <td className="py-2 px-2 text-center">{dev.watt} W</td>
                  <td className="py-2 px-2 text-center">{dev.qty}</td>
                  <td className="py-2 px-2 text-center">{dev.hours} h</td>
                  <td className="py-2 px-2 text-left font-bold text-amber-400">
                    {(dev.watt * dev.qty * dev.hours).toLocaleString()} Wh
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center pt-2 text-xs border-t dark:border-slate-800 border-slate-200">
          <span className="font-bold opacity-80">{t('total_daily_wh', 'إجمالي الاستهلاك اليومي:')}</span>
          <span className="font-extrabold text-amber-500 text-sm">
            {Math.round(calculatedTotalDailyWh).toLocaleString()} Wh ({totalKwh} kWh)
          </span>
        </div>
      </div>

      {/* 2️⃣ حاسبة الألواح */}
      <div className={`p-4 rounded-xl border space-y-3 ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
        <h3 className="text-xs font-bold text-amber-400 flex items-center gap-2 border-b pb-2 dark:border-slate-800 border-slate-200">
          <Sun className="w-4 h-4" />
          {t('sec_panels', '2. حسابات ومواصفات الألواح الشمسية')}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="flex justify-between p-2.5 rounded-lg bg-slate-900/50 border dark:border-slate-800/80">
            <span className="opacity-70">{t('required_array_watt', 'قدرة مصفوفة الألواح المطلوبة:')}</span>
            <span className="font-bold text-amber-400">{panels.requiredWatt} W</span>
          </div>
          <div className="flex justify-between p-2.5 rounded-lg bg-slate-900/50 border dark:border-slate-800/80">
            <span className="opacity-70">{t('recommended_panels_count', `عدد الألواح الموصى به:`, { panelWatt: panels.panelWatt })}</span>
            <span className="font-extrabold text-emerald-400">{panels.count}</span>
          </div>
        </div>
      </div>

      {/* 3️⃣ بنك البطاريات */}
      <div className={`p-4 rounded-xl border space-y-3 ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
        <h3 className="text-xs font-bold text-indigo-400 flex items-center gap-2 border-b pb-2 dark:border-slate-800 border-slate-200">
          <Battery className="w-4 h-4" />
          {t('sec_batteries', '3. تفاصيل بنك البطاريات والتوصيل')}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="flex justify-between p-2.5 rounded-lg bg-slate-900/50 border dark:border-slate-800/80">
            <span className="opacity-70">{t('battery_type', 'نوع البطارية:')}</span>
            <span className="font-bold">{battery.type}</span>
          </div>
          <div className="flex justify-between p-2.5 rounded-lg bg-slate-900/50 border dark:border-slate-800/80">
            <span className="opacity-70">{t('battery_count', 'عدد البطاريات المطلوبة:')}</span>
            <span className="font-extrabold text-amber-500">{battery.count}</span>
          </div>
        </div>
      </div>

      {/* 4️⃣ الأسلاك والقواطع */}
      <div className={`p-4 rounded-xl border space-y-3 ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
        <h3 className="text-xs font-bold text-emerald-400 flex items-center gap-2 border-b pb-2 dark:border-slate-800 border-slate-200">
          <ShieldAlert className="w-4 h-4" />
          {t('sec_protection', '4. مواصفات الأسلاك والقواطع (DC)')}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="flex flex-col p-2.5 rounded-lg bg-slate-900/50 border dark:border-slate-800/80 text-center">
            <span className="opacity-70 mb-1">{t('max_current', 'أقصى تيار متوقع:')}</span>
            <span className="font-bold text-slate-200">{battery.maxCurrent}</span>
          </div>
          <div className="flex flex-col p-2.5 rounded-lg bg-slate-900/50 border dark:border-slate-800/80 text-center">
            <span className="opacity-70 mb-1">{t('recommended_breaker', 'قاطع الحماية المطلوب:')}</span>
            <span className="font-extrabold text-rose-400">{battery.breaker}</span>
          </div>
          <div className="flex flex-col p-2.5 rounded-lg bg-slate-900/50 border dark:border-slate-800/80 text-center">
            <span className="opacity-70 mb-1">{t('recommended_cable', 'أقل سمك كابل موصى به:')}</span>
            <span className="font-extrabold text-amber-400">{battery.cableSize}</span>
          </div>
        </div>
      </div>

      {/* 5️⃣ برامترات ضبط الإنفرتر */}
      <div className={`p-4 rounded-xl border space-y-3 ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
        <h3 className="text-xs font-bold text-blue-400 flex items-center gap-2 border-b pb-2 dark:border-slate-800 border-slate-200">
          <Settings className="w-4 h-4" />
          {t('sec_inverter', '5. إعدادات ومعلمات ضبط الإنفرتر المقترحة')}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          <div className="flex justify-between p-2.5 rounded-lg bg-slate-900/50 border dark:border-slate-800/80">
            <span className="opacity-70">{t('inverter_brand', 'الإنفرتر:')}</span>
            <span className="font-bold text-blue-400">{inverter.brand}</span>
          </div>

          <div className="flex justify-between p-2.5 rounded-lg bg-slate-900/50 border dark:border-slate-800/80">
            <span className="opacity-70">{t('system_voltage_label', 'جهد المنظومة:')}</span>
            <span className="font-bold">{inverter.systemVoltage}</span>
          </div>

          <div className="flex justify-between p-2.5 rounded-lg bg-slate-900/50 border dark:border-slate-800/80">
            <span className="opacity-70">{t('charge_current', 'تيار الشحن:')}</span>
            <span className="font-bold text-emerald-400">{inverter.maxChargeCurrent}</span>
          </div>

          <div className="flex justify-between p-2.5 rounded-lg bg-slate-900/50 border dark:border-slate-800/80">
            <span className="opacity-70">{t('cutoff_voltage', 'جهد القطع (Cut-off):')}</span>
            <span className="font-bold text-rose-400">{inverter.cutoffVoltage}</span>
          </div>

          <div className="flex justify-between p-2.5 rounded-lg bg-slate-900/50 border dark:border-slate-800/80">
            <span className="opacity-70">{t('bulk_voltage', 'جهد الـ Bulk:')}</span>
            <span className="font-bold text-amber-400">{inverter.bulkVoltage}</span>
          </div>

          <div className="flex justify-between p-2.5 rounded-lg bg-slate-900/50 border dark:border-slate-800/80">
            <span className="opacity-70">{t('float_voltage', 'جهد الـ Float:')}</span>
            <span className="font-bold text-indigo-400">{inverter.floatVoltage}</span>
          </div>
        </div>
      </div>

      {/* 📜 ترويسة التوقيع والإشعار الفني */}
      <div className={`p-4 rounded-xl border text-xs leading-relaxed flex items-center justify-between flex-wrap gap-3 ${
        darkMode ? 'bg-slate-950/80 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
      }`}>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{t('footer_notice', 'تم توليد هذا التقرير تلقائياً بواسطة SolarFlow Pro استناداً إلى الحسابات والمعايير الهندسية للمنظومات الشمسية المستقلة (Off-Grid).')}</span>
        </div>
        <span className="font-semibold">{new Date().toLocaleDateString(i18n?.language === 'ar' ? 'ar-EG' : 'en-US')}</span>
      </div>

    </div>
  );
}