import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  FileCheck, 
  Printer, 
  Zap, 
  Battery, 
  Sun, 
  Sliders, 
  CheckCircle2 
} from 'lucide-react';

export function FinalReportTab({ 
  darkMode = true,
  deviceList = [],
  batteryData = {},
  panelData = {},
  inverterParams = [],
  inverterBrand = 'Lightwave (Hybrid)'
}) {
  const { t, i18n } = useTranslation();

  // حسابات إجمالي الأحمال
  const totalDailyWh = deviceList.reduce((acc, item) => acc + (item.watt * item.qty * item.hours), 0);
  const totalPeakWatt = deviceList.reduce((acc, item) => acc + (item.watt * item.qty), 0);
  const totalDailyKwh = (totalDailyWh / 1000).toFixed(2);

  // التعامل مع الطباعة
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 ltr:text-left rtl:text-right" dir={i18n.dir()}>
      
      {/* 🖨️ شريط رأس التقرير وأزرار الإجراءات */}
      <div className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors ${
        darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
            <FileCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold">{t('final_report.header_title')}</h2>
            <p className="text-xs opacity-70">{t('final_report.header_subtitle')}</p>
          </div>
        </div>

        <button
          onClick={handlePrint}
          className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>{t('final_report.print_button')}</span>
        </button>
      </div>

      {/* 📄 حاوي التقرير المخصص للطباعة والعرض */}
      <div id="final-summary-report" className={`p-6 sm:p-8 rounded-2xl border space-y-8 transition-colors ${
        darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900 shadow-sm'
      }`}>

        {/* 1️⃣ ملخص الأحمال والقدرة */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-amber-500 pb-2 border-b border-slate-700/40">
            <Zap className="w-5 h-5" />
            <h3 className="font-extrabold text-base">{t('final_report.loads.title')}</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className={`p-3.5 rounded-xl border ${darkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <span className="block text-[11px] opacity-70 font-semibold">{t('final_report.loads.total_daily')}</span>
              <span className="text-lg font-black text-amber-500">{totalDailyWh.toLocaleString()} {t('calculators_hub.units.wh')}</span>
              <span className="text-xs opacity-50 block">({totalDailyKwh} {t('calculators_hub.units.kwh_per_day')})</span>
            </div>

            <div className={`p-3.5 rounded-xl border ${darkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <span className="block text-[11px] opacity-70 font-semibold">{t('final_report.loads.peak_power')}</span>
              <span className="text-lg font-black text-amber-500">{totalPeakWatt.toLocaleString()} {t('calculators_hub.units.watt_short')}</span>
              <span className="text-xs opacity-50 block">{t('final_report.loads.peak_note')}</span>
            </div>

            <div className={`p-3.5 rounded-xl border ${darkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <span className="block text-[11px] opacity-70 font-semibold">{t('final_report.loads.devices_count')}</span>
              <span className="text-lg font-black text-amber-500">{t('calculators_hub.loads.device_count', { count: deviceList.length })}</span>
              <span className="text-xs opacity-50 block">{t('final_report.loads.detailed_note')}</span>
            </div>
          </div>
        </section>

        {/* 2️⃣ تصميم بنك البطاريات والتوصيل */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-blue-500 pb-2 border-b border-slate-700/40">
            <Battery className="w-5 h-5" />
            <h3 className="font-extrabold text-base">{t('final_report.battery.title')}</h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className={`p-3 rounded-xl border ${darkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <span className="block text-[11px] opacity-70 font-semibold">{t('final_report.battery.type')}</span>
              <span className="text-sm font-bold text-blue-400">{batteryData.type || t('final_report.battery.default_type')}</span>
            </div>

            <div className={`p-3 rounded-xl border ${darkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <span className="block text-[11px] opacity-70 font-semibold">{t('final_report.battery.count')}</span>
              <span className="text-sm font-bold text-blue-400">{batteryData.count || t('final_report.battery.default_count')}</span>
            </div>

            <div className={`p-3 rounded-xl border ${darkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <span className="block text-[11px] opacity-70 font-semibold">{t('final_report.battery.cable_size')}</span>
              <span className="text-sm font-bold text-blue-400">{batteryData.cableSize || '25 mm²'}</span>
            </div>

            <div className={`p-3 rounded-xl border ${darkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <span className="block text-[11px] opacity-70 font-semibold">{t('final_report.battery.breaker')}</span>
              <span className="text-sm font-bold text-blue-400">{batteryData.breaker || '190 A'}</span>
            </div>
          </div>
        </section>

        {/* 3️⃣ حقل الألواح الشمسية */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-emerald-500 pb-2 border-b border-slate-700/40">
            <Sun className="w-5 h-5" />
            <h3 className="font-extrabold text-base">{t('final_report.panels.title')}</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
            <div className={`p-3 rounded-xl border ${darkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <span className="block text-[11px] opacity-70 font-semibold">{t('final_report.panels.total_power')}</span>
              <span className="text-sm font-bold text-emerald-400">{panelData.totalWatt || '1,127 W'}</span>
            </div>

            <div className={`p-3 rounded-xl border ${darkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <span className="block text-[11px] opacity-70 font-semibold">{t('final_report.panels.single_watt')}</span>
              <span className="text-sm font-bold text-emerald-400">{panelData.singlePanelWatt || '550 W'}</span>
            </div>

            <div className={`p-3 rounded-xl border ${darkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <span className="block text-[11px] opacity-70 font-semibold">{t('final_report.panels.count')}</span>
              <span className="text-sm font-bold text-emerald-400">{panelData.panelsCount || t('final_report.panels.default_count')}</span>
            </div>
          </div>
        </section>

        {/* 4️⃣ جدول بارامترات ضبط الإنفرتر */}
        <section className="space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-700/40">
            <div className="flex items-center gap-2 text-indigo-400">
              <Sliders className="w-5 h-5" />
              <h3 className="font-extrabold text-base">{t('final_report.inverter.title')}</h3>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              {inverterBrand}
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full ltr:text-left rtl:text-right text-xs">
              <thead className={`text-[11px] font-extrabold border-b ${
                darkMode ? 'bg-slate-800/80 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-700 border-slate-200'
              }`}>
                <tr>
                  <th className="p-2.5 text-center">{t('final_report.inverter.table.col_code')}</th>
                  <th className="p-2.5">{t('final_report.inverter.table.col_name')}</th>
                  <th className="p-2.5 text-center">{t('final_report.inverter.table.col_value')}</th>
                  <th className="p-2.5">{t('final_report.inverter.table.col_notes')}</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${darkMode ? 'divide-slate-800' : 'divide-slate-100'}`}>
                {inverterParams.length > 0 ? (
                  inverterParams.map((param, idx) => (
                    <tr key={idx} className={darkMode ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50'}>
                      <td className="p-2.5 text-center font-extrabold text-indigo-400">#{param.code}</td>
                      <td className="p-2.5 font-bold">{param.title}</td>
                      <td className="p-2.5 text-center font-black text-emerald-500">{param.value}</td>
                      <td className="p-2.5 opacity-80 text-[11px]">{param.description}</td>
                    </tr>
                  ))
                ) : (
                  <>
                    <tr className={darkMode ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50'}>
                      <td className="p-2.5 text-center font-extrabold text-indigo-400">#01</td>
                      <td className="p-2.5 font-bold">Output Source Priority</td>
                      <td className="p-2.5 text-center font-black text-emerald-500">SBU / SUB</td>
                      <td className="p-2.5 opacity-80 text-[11px]">{t('final_report.inverter.defaults.param_01')}</td>
                    </tr>
                    <tr className={darkMode ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50'}>
                      <td className="p-2.5 text-center font-extrabold text-indigo-400">#05</td>
                      <td className="p-2.5 font-bold">Battery Type</td>
                      <td className="p-2.5 text-center font-black text-emerald-500">USE / LIB</td>
                      <td className="p-2.5 opacity-80 text-[11px]">{t('final_report.inverter.defaults.param_05')}</td>
                    </tr>
                    <tr className={darkMode ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50'}>
                      <td className="p-2.5 text-center font-extrabold text-indigo-400">#26</td>
                      <td className="p-2.5 font-bold">Bulk Charging Voltage</td>
                      <td className="p-2.5 text-center font-black text-emerald-500">28.2 V</td>
                      <td className="p-2.5 opacity-80 text-[11px]">{t('final_report.inverter.defaults.param_26')}</td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* 📜 ترويسة التوقيع والإشعار الفني */}
        <div className={`p-4 rounded-xl border text-xs leading-relaxed flex items-center justify-between flex-wrap gap-3 ${
          darkMode ? 'bg-slate-950/80 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
        }`}>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{t('final_report.footer_notice')}</span>
          </div>
          <span className="font-semibold">{new Date().toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US')}</span>
        </div>

      </div>
    </div>
  );
}