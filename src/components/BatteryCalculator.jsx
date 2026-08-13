import React, { useMemo, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { BatteryCharging, Battery, Zap, GitCommit } from 'lucide-react';

// 🔹 تنسيق معدود البطاريات حسب قواعد اللغة العربية
const formatBatteries = (count) => {
  if (count === 1) return 'بطارية واحدة';
  if (count === 2) return 'بطاريتين';
  if (count >= 3 && count <= 10) return `${count} بطاريات`;
  return `${count} بطارية`;
};

// 🔹 تنسيق معدود السلاسل حسب قواعد اللغة العربية
const formatChains = (count) => {
  if (count === 1) return 'سلسلة واحدة';
  if (count === 2) return 'سلسلتين';
  if (count >= 3 && count <= 10) return `${count} سلاسل`;
  return `${count} سلسلة`;
};

export function BatteryCalculator({ 
  darkMode = true, 
  totalDailyWh = 0, 
  onTotalDailyWhChange = () => {},
  onFetchTotalDailyWh,
  maxInverterWatt = 3000,
  systemVoltage = 24,
  onSystemVoltageChange = () => {},
  batteryType = 'lithium',
  onBatteryTypeChange = () => {},
  singleBatteryAh = 200,
  onSingleBatteryAhChange = () => {},
  singleBatteryVoltage = 12,
  onSingleBatteryVoltageChange = () => {},
  cableLength = 2,
  onCableLengthChange = () => {},
  onBatteryConfigChange
}) {
  const { t, i18n } = useTranslation(undefined, { keyPrefix: 'calculators_hub.battery_calc' });

  const batteryResults = useMemo(() => {
    let dod = 0.85;
    let batteryTypeName = t('type_lithium_name', 'ليثيوم (LiFePO4)');

    if (batteryType === 'acid') {
      dod = 0.50;
      batteryTypeName = t('type_acid_name', 'أسيد سائلة (Lead-Acid)');
    } else if (batteryType === 'gel') {
      dod = 0.50;
      batteryTypeName = t('type_gel_name', 'جل / AGM');
    }

    const requiredTotalAh = totalDailyWh > 0 ? Math.ceil(totalDailyWh / (systemVoltage * dod)) : 0;
    const seriesCount = Math.max(1, Math.round(systemVoltage / singleBatteryVoltage));
    const requiredParallel = requiredTotalAh > 0 ? Math.ceil(requiredTotalAh / (singleBatteryAh || 1)) : 0;
    const totalBatteries = requiredTotalAh > 0 ? seriesCount * requiredParallel : 0;

    // 🔗 تحديد طريقة التوصيل والشرح الفني المنسق لغوياً
    // 🔗 تحديد طريقة التوصيل والشرح الفني بدعم كامل للترجمة (i18n)
    let connectionMethod = t('conn_single', 'بطارية واحدة فقط');
    let connectionReason = t('conn_single_reason', 'بطارية واحدة تكفي لتغطية سعة المنظومة والجهد المطلوب دون الحاجة لتوصيلات إضافية.');

    if (totalBatteries > 1) {
      const seriesText = formatBatteries(seriesCount);
      const parallelChainsText = formatChains(requiredParallel);

      if (seriesCount > 1 && requiredParallel > 1) {
        connectionMethod = t('conn_mixed', '{{series}} على التوالي و {{chains}} على التوازي (مختلط)', {
          series: seriesText,
          chains: parallelChainsText
        });
        connectionReason = t('conn_mixed_reason', 'تم ربط {{series}} على التوالي للوصول بجهد البنك إلى {{voltage}} فولت، مع دمج {{chains}} على التوازي لتوفير السعة الإجمالية المطلوبة ({{capacity}} Ah).', {
          series: seriesText,
          voltage: systemVoltage,
          chains: parallelChainsText,
          capacity: requiredTotalAh
        });
      } else if (seriesCount > 1) {
        connectionMethod = t('conn_series_only', 'توصيل على التوالي ({{series}})', {
          series: seriesText
        });
        connectionReason = t('conn_series_reason', 'تم الربط على التوالي لمضاعفة الجهد من {{singleVoltage}} فولت إلى جهد المنظومة المطلوب ({{voltage}} فولت) مع الحفاظ على سعة البطارية ثابتة.', {
          singleVoltage: singleBatteryVoltage,
          voltage: systemVoltage
        });
      } else {
        connectionMethod = t('conn_parallel_only', 'توصيل على التوازي ({{chains}})', {
          chains: parallelChainsText
        });
        connectionReason = t('conn_parallel_reason', 'تم الربط على التوازي لمضاعفة السعة الإجمالية إلى {{capacity}} Ah لتغطية الاستهلاك، مع المحافظة على جهد البطارية المطابق لجهد المنظومة ({{voltage}} فولت).', {
          capacity: requiredTotalAh,
          voltage: systemVoltage
        });
      }
    }

    const estimatedPowerWatt = maxInverterWatt || (totalDailyWh > 0 ? Math.min(totalDailyWh / 4, 5000) : 2000);
    const maxCurrentAmp = Math.round(estimatedPowerWatt / (systemVoltage * 0.85));
    const recommendedBreakerAmp = Math.ceil((maxCurrentAmp * 1.25) / 10) * 10;
    const allowedVdrop = systemVoltage * 0.02;
    const calculatedRawmm2 = (2 * cableLength * maxCurrentAmp * 0.0178) / allowedVdrop;

    const standardCableSizes = [4, 6, 10, 16, 25, 35, 50, 70, 95, 120];
    const recommendedCableSize = standardCableSizes.find(size => size >= calculatedRawmm2) || 120;

    return {
      batteryTypeName,
      requiredTotalAh,
      totalBatteries,
      singleBatteryAh,
      connectionMethod,
      connectionReason,
      maxCurrentAmp,
      recommendedBreakerAmp,
      recommendedCableSize
    };
  }, [batteryType, totalDailyWh, systemVoltage, singleBatteryVoltage, singleBatteryAh, maxInverterWatt, cableLength, i18n.language, t]);

  // 🟢 حفظ آخر إرسال للقيم لمنع الـ Re-render المكرر
  const lastSentConfig = useRef(null);

  useEffect(() => {
    if (typeof onBatteryConfigChange === 'function') {
      const newConfig = {
        type: batteryResults.batteryTypeName,
        count: `${batteryResults.totalBatteries} بطاريات (${batteryResults.singleBatteryAh} Ah)`,
        capacity: `${batteryResults.requiredTotalAh} Ah`,
        connectionMethod: batteryResults.connectionMethod,
        cableSize: `${batteryResults.recommendedCableSize} mm²`,
        breaker: `${batteryResults.recommendedBreakerAmp} A`
      };

      if (JSON.stringify(lastSentConfig.current) !== JSON.stringify(newConfig)) {
        lastSentConfig.current = newConfig;
        onBatteryConfigChange(newConfig);
      }
    }
  }, [
    batteryResults.batteryTypeName,
    batteryResults.totalBatteries,
    batteryResults.singleBatteryAh,
    batteryResults.requiredTotalAh,
    batteryResults.connectionMethod,
    batteryResults.recommendedCableSize,
    batteryResults.recommendedBreakerAmp,
    onBatteryConfigChange
  ]);

  return (
    <div className={`p-4 sm:p-6 rounded-2xl border space-y-5 ${darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'}`}>
      
      {/* الهيدر */}
      <div className="flex items-center gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="p-2.5 bg-indigo-500/10 text-indigo-500 rounded-xl">
          <BatteryCharging className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-sm sm:text-base font-extrabold">{t('header_title', 'حاسبة البطاريات والأسلاك والقاطع')}</h2>
          <p className="text-[11px] opacity-60">{t('header_subtitle', 'حساب سعة بنك البطاريات والعدد المطلوب ومواصفات الكابل والقاطع')}</p>
        </div>
      </div>

      {/* حقل الاستهلاك اليومي وزر الجلب */}
      <div className={`p-3.5 rounded-xl border space-y-2 ${darkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <label className="text-xs font-bold opacity-80 block">
            {t('daily_consumption_label', 'الاستهلاك اليومي الكلي (واط.ساعة - Wh):')}
          </label>
          
          {typeof onFetchTotalDailyWh === 'function' && (
            <button
              type="button"
              onClick={onFetchTotalDailyWh}
              className="text-[11px] font-bold text-amber-500 hover:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer border border-amber-500/20"
            >
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>{t('fetch_calculated_load', 'جلب الاستهلاك المحسوب (3,900 Wh)')}</span>
            </button>
          )}
        </div>

        <input
          type="number"
          value={totalDailyWh || ''}
          onChange={(e) => onTotalDailyWhChange(Number(e.target.value))}
          placeholder="3900"
          className={`w-full p-2.5 rounded-xl text-xs font-bold border outline-none transition-all ${
            darkMode 
              ? 'bg-slate-800 border-slate-700 text-white focus:border-amber-500' 
              : 'bg-white border-slate-300 text-slate-800 focus:border-amber-500'
          }`}
        />
      </div>

      {/* خيارات حاسبة البطاريات */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* نوع البطارية */}
        <div className="space-y-1">
          <label className="text-xs font-bold opacity-80 block">{t('type_label', 'نوع البطارية')}</label>
          <select 
            value={batteryType} 
            onChange={(e) => onBatteryTypeChange(e.target.value)} 
            className={`w-full p-2.5 rounded-xl text-xs font-semibold border outline-none ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
          >
            <option value="lithium">{t('opt_lithium', 'ليثيوم (LiFePO4)')}</option>
            <option value="acid">{t('opt_acid', 'أسيد سائلة (Lead-Acid)')}</option>
            <option value="gel">{t('opt_gel', 'جل / AGM')}</option>
          </select>
        </div>

        {/* جهد المنظومة */}
        <div className="space-y-1">
          <label className="text-xs font-bold opacity-80 block">{t('system_voltage_label', 'جهد المنظومة')}</label>
          <select 
            value={systemVoltage} 
            onChange={(e) => onSystemVoltageChange(Number(e.target.value))} 
            className={`w-full p-2.5 rounded-xl text-xs font-semibold border outline-none ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
          >
            <option value={12}>{t('opt_sys_12', '12 فولت')}</option>
            <option value={24}>{t('opt_sys_24', '24 فولت')}</option>
            <option value={48}>{t('opt_sys_48', '48 فولت')}</option>
          </select>
        </div>

        {/* جهد البطارية الواحدة */}
        <div className="space-y-1">
          <label className="text-xs font-bold opacity-80 block">{t('single_voltage_label', 'جهد البطارية الواحدة')}</label>
          <select 
            value={singleBatteryVoltage} 
            onChange={(e) => onSingleBatteryVoltageChange(Number(e.target.value))} 
            className={`w-full p-2.5 rounded-xl text-xs font-semibold border outline-none ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
          >
            <option value={12}>{t('opt_bat_12', '12 فولت')}</option>
            <option value={6}>{t('opt_bat_6', '6 فولت')}</option>
            <option value={2}>{t('opt_bat_2', '2 فولت')}</option>
          </select>
        </div>

        {/* سعة البطارية الواحدة */}
        <div className="space-y-1">
          <label className="text-xs font-bold opacity-80 block">{t('single_ah_label', 'سعة البطارية الواحدة (أمبير.ساعة)')}</label>
          <select 
            value={singleBatteryAh} 
            onChange={(e) => onSingleBatteryAhChange(Number(e.target.value))} 
            className={`w-full p-2.5 rounded-xl text-xs font-semibold border outline-none cursor-pointer ${darkMode ? 'bg-slate-800 border-slate-700 text-amber-400' : 'bg-slate-50 border-slate-200 text-amber-600'}`}
          >
            <option value={100}>{t('opt_ah_100', '100 أمبير.ساعة')}</option>
            <option value={150}>{t('opt_ah_150', '150 أمبير.ساعة')}</option>
            <option value={200}>{t('opt_ah_200', '200 أمبير.ساعة (افتراضي)')}</option>
            <option value={300}>{t('opt_ah_300', '300 أمبير.ساعة')}</option>
          </select>
        </div>
      </div>

      {/* تفاصيل بنك البطاريات والطريقة الموصى بها */}
      <div className={`p-4 rounded-xl border space-y-4 ${darkMode ? 'bg-slate-950 border-indigo-500/30' : 'bg-indigo-50/40 border-indigo-200'}`}>
        <h3 className="text-xs font-extrabold text-indigo-500 flex items-center gap-1.5 border-b pb-2 dark:border-slate-800 border-indigo-100">
          <Battery className="w-4 h-4" />
          {t('bank_details_title', 'تفاصيل بنك البطاريات')}
        </h3>

        {/* شبكة القراءات الرئيسية */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
          <div className={`p-3 rounded-xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <span className="text-[10px] font-bold opacity-70 block mb-1">{t('summary_type', 'نوع البطارية')}</span>
            <span className="text-xs font-extrabold text-indigo-400 block">{batteryResults.batteryTypeName}</span>
          </div>

          <div className={`p-3 rounded-xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <span className="text-[10px] font-bold opacity-70 block mb-1">{t('summary_single_ah', 'سعة البطارية')}</span>
            <span className="text-xs font-extrabold text-amber-400 block">{batteryResults.singleBatteryAh} Ah</span>
          </div>

          <div className={`p-3 rounded-xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <span className="text-[10px] font-bold opacity-70 block mb-1">{t('summary_count', 'العدد المطلوب')}</span>
            <span className="text-lg font-black text-amber-500 block">{batteryResults.totalBatteries}</span>
          </div>

          <div className={`p-3 rounded-xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <span className="text-[10px] font-bold opacity-70 block mb-1">{t('summary_capacity', 'السعة الكلية')}</span>
            <span className="text-xs font-extrabold text-emerald-400 block">{batteryResults.requiredTotalAh} Ah</span>
          </div>

          <div className={`p-3 rounded-xl border col-span-2 sm:col-span-1 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <span className="text-[10px] font-bold opacity-70 block mb-1">{t('summary_voltage', 'جهد البنك')}</span>
            <span className="text-xs font-extrabold text-blue-400 block">Volt {systemVoltage}</span>
          </div>
        </div>

        {/* 🔗 طريقة التوصيل الموصى بها مع الشرح المنسق لغوياً */}
        <div className={`p-3.5 rounded-xl border space-y-1.5 ${darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center gap-2 text-indigo-400">
            <GitCommit className="w-4 h-4 shrink-0" />
            <span className="text-xs font-extrabold">
              {t('connection_method_title', 'طريقة التوصيل الموصى بها:')}{' '}
              <span className="text-amber-400 font-extrabold">{batteryResults.connectionMethod}</span>
            </span>
          </div>
          <p className="text-[11px] leading-relaxed opacity-75 pr-6">
            {batteryResults.connectionReason}
          </p>
        </div>

      </div>

    </div>
  );
}