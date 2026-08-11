import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import { 
  Zap, Calculator, Battery, Sun, Moon, Wrench, Settings, 
  ChevronLeft, Gauge, Cpu, Activity, ChevronDown, ChevronUp, BatteryCharging,
  Plus, Trash2, RotateCcw, GitMerge, Lightbulb, AlertTriangle, CheckCircle2,
  Search, Check, FileText, FileCheck, BookOpen
} from 'lucide-react';
// 🌐 استيراد إعدادات الترجمة
import './i18n';
import './index.css';

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import { CalculatorsHub } from './components/CalculatorsHub';
import {SolarPanelsCalculator } from './components/SolarPanelsCalculator';

// 🔌 استيراد قاعدة بيانات الإنفرترات المحدثة
import { invertersData } from './data/invertersData';
import { FinalReportTab } from './components/FinalReportTab';

import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react'; // أيقونة للزر

export function Header({ activeTab, setActiveTab, darkMode, setDarkMode }) {
  const { t, i18n } = useTranslation();

  // دالة التبديل بين العربية والإنجليزية
  const toggleLanguage = () => {
    const nextLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(nextLang);

    // 2. ضبط اتجاه الصفحة تلقائياً (RTL للعربية / LTR للإنجليزي)
    document.documentElement.dir = nextLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = nextLang;
  
  };

  return (
    <header className="space-y-4" dir={i18n.dir()}>
      {/* الشريط العلوي للغة والوضع المظلم */}
      <div className="flex items-center justify-between">
        <button
          onClick={toggleLanguage}
          className="px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          🌐 {i18n.language === 'ar' ? 'English' : 'العربية'}
        </button>

        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-xl border cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          {darkMode ? '🌙' : '☀️'}
        </button>
      </div>

      {/* شعار التطبيق والعنوان */}
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-2">
          <h1 className="text-2xl font-black">{t('app_title')}</h1>
          <span className="p-1.5 bg-amber-500/10 text-amber-500 rounded-xl">
            <Sun className="w-6 h-6" />
          </span>
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            {t('main_app.version_tag')}
          </span>
        </div>
        <p className="text-xs opacity-60">{t('main_app.app_subtitle')}</p>
      </div>

      {/* التبويبات الرئيسية الثلاثة */}
      <div className={`grid grid-cols-3 gap-2 p-1.5 rounded-2xl border ${
        darkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'
      }`}>
        <button
          onClick={() => setActiveTab('guide')}
          className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'guide'
              ? 'bg-blue-600 text-white shadow'
              : 'opacity-70 hover:opacity-100'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>{t('main_app.tabs.guide')}</span>
        </button>

        <button
          onClick={() => setActiveTab('tools')}
          className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'tools'
              ? 'bg-blue-600 text-white shadow'
              : 'opacity-70 hover:opacity-100'
          }`}
        >
          <Wrench className="w-4 h-4" />
          <span>{t('main_app.tabs.tools')}</span>
        </button>

        <button
          onClick={() => setActiveTab('inverter')}
          className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'inverter'
              ? 'bg-blue-600 text-white shadow'
              : 'opacity-70 hover:opacity-100'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>{t('main_app.tabs.inverter')}</span>
        </button>
      </div>
    </header>
  );
}



// ملاحظة: تم إزالة INVERTER_PRESETS والاعتماد المباشر على invertersData
// ==========================================
// 🔋 مكوّن حاسبة البطاريات والأسلاك والقاطع المحدث
// ==========================================
export function BatteryCalculator({ 
  darkMode = true, 
  totalDailyWh = 0, 
  maxInverterWatt = 3000,
  onBatteryConfigChange = () => {} 
}) {
  const { t, i18n } = useTranslation();

  const [systemVoltage, setSystemVoltage] = useState(24);
  const [batteryType, setBatteryType] = useState('lithium');
  const [singleBatteryAh, setSingleBatteryAh] = useState(200);
  const [singleBatteryVoltage, setSingleBatteryVoltage] = useState(12);
  const [cableLength, setCableLength] = useState(2);

  // 1. حسابات البطاريات والتوصيل
  const batteryResults = useMemo(() => {
    let dod = 0.85;
    let batteryTypeName = t('battery_calc.type_lithium_name');

    if (batteryType === 'acid') {
      dod = 0.50;
      batteryTypeName = t('battery_calc.type_acid_name');
    } else if (batteryType === 'gel') {
      dod = 0.50;
      batteryTypeName = t('battery_calc.type_gel_name');
    }

    const requiredTotalAh = totalDailyWh > 0 ? Math.ceil(totalDailyWh / (systemVoltage * dod)) : 0;
    const seriesCount = Math.max(1, Math.round(systemVoltage / singleBatteryVoltage));
    const requiredParallel = requiredTotalAh > 0 ? Math.ceil(requiredTotalAh / singleBatteryAh) : 0;
    const totalBatteries = requiredTotalAh > 0 ? seriesCount * requiredParallel : 0;

    let connectionMethod = t('battery_calc.conn_single');
    if (totalBatteries > 1) {
      if (seriesCount > 1 && requiredParallel > 1) {
        connectionMethod = t('battery_calc.conn_mixed', { seriesCount, requiredParallel });
      } else if (seriesCount > 1) {
        connectionMethod = t('battery_calc.conn_series', { seriesCount, systemVoltage });
      } else {
        connectionMethod = t('battery_calc.conn_parallel', { requiredParallel, systemVoltage });
      }
    }

    // 2. حسابات القاطع والأسلاك
    const estimatedPowerWatt = maxInverterWatt || (totalDailyWh > 0 ? Math.min(totalDailyWh / 4, 5000) : 2000);
    const maxCurrentAmp = Math.round(estimatedPowerWatt / (systemVoltage * 0.85));
    const recommendedBreakerAmp = Math.ceil((maxCurrentAmp * 1.25) / 10) * 10;

    const allowedVdrop = systemVoltage * 0.02;
    const calculatedRawmm2 = (2 * cableLength * maxCurrentAmp * 0.0178) / allowedVdrop;

    const standardCableSizes = [4, 6, 10, 16, 25, 35, 50, 70, 95, 120];
    const recommendedCableSize = standardCableSizes.find(size => size >= calculatedRawmm2) || 120;

    return {
      dod,
      batteryTypeName,
      requiredTotalAh,
      seriesCount,
      requiredParallel,
      totalBatteries,
      connectionMethod,
      maxCurrentAmp,
      recommendedBreakerAmp,
      recommendedCableSize
    };
  }, [batteryType, totalDailyWh, systemVoltage, singleBatteryVoltage, singleBatteryAh, maxInverterWatt, cableLength, i18n.language, t]);

  // تحديث التقرير الشامل التلقائي
  useEffect(() => {
    onBatteryConfigChange({
      type: batteryResults.batteryTypeName,
      count: t('battery_calc.count_unit', { count: batteryResults.totalBatteries }),
      cableSize: `${batteryResults.recommendedCableSize} mm²`,
      breaker: `${batteryResults.recommendedBreakerAmp} A`
    });
  }, [batteryResults, onBatteryConfigChange, t]);

  return (
    <div 
      dir={i18n.dir()} 
      className={`p-4 sm:p-6 rounded-2xl border transition-colors space-y-5 ${
        darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
      }`}
    >
      {/* الهيدر */}
      <div className="flex items-center gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="p-2.5 bg-indigo-500/10 text-indigo-500 rounded-xl">
          <BatteryCharging className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-sm sm:text-base font-extrabold">{t('battery_calc.header_title')}</h2>
          <p className="text-[11px] opacity-60">{t('battery_calc.header_subtitle')}</p>
        </div>
      </div>

      {totalDailyWh > 0 ? (
        <div className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
          darkMode ? 'bg-indigo-950/40 border-indigo-800/60 text-indigo-300' : 'bg-indigo-50 border-indigo-200 text-indigo-900'
        }`}>
          <span>{t('battery_calc.daily_consumption_label')}</span>
          <span className="font-extrabold text-amber-500 text-sm">{Math.round(totalDailyWh).toLocaleString()} Wh</span>
        </div>
      ) : (
        <p className="text-xs text-amber-500 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20">
          {t('battery_calc.no_consumption_warning')}
        </p>
      )}

      {/* مدخلات البطاريات */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        
        {/* نوع البطارية */}
        <div className="space-y-1">
          <label className="text-xs font-bold opacity-80 block">{t('battery_calc.type_label')}</label>
          <select 
            value={batteryType} 
            onChange={(e) => setBatteryType(e.target.value)}
            className={`w-full p-2.5 rounded-xl text-xs font-semibold border outline-none cursor-pointer ${
              darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}
          >
            <option value="lithium">{t('battery_calc.opt_lithium')}</option>
            <option value="acid">{t('battery_calc.opt_acid')}</option>
            <option value="gel">{t('battery_calc.opt_gel')}</option>
          </select>
        </div>

        {/* فولتية النظام */}
        <div className="space-y-1">
          <label className="text-xs font-bold opacity-80 block">{t('battery_calc.system_voltage_label')}</label>
          <select 
            value={systemVoltage} 
            onChange={(e) => setSystemVoltage(Number(e.target.value))}
            className={`w-full p-2.5 rounded-xl text-xs font-semibold border outline-none cursor-pointer ${
              darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}
          >
            <option value={12}>{t('battery_calc.opt_sys_12')}</option>
            <option value={24}>{t('battery_calc.opt_sys_24')}</option>
            <option value={48}>{t('battery_calc.opt_sys_48')}</option>
          </select>
        </div>

        {/* فولتية البطارية الواحدة */}
        <div className="space-y-1">
          <label className="text-xs font-bold opacity-80 block">{t('battery_calc.single_voltage_label')}</label>
          <select 
            value={singleBatteryVoltage} 
            onChange={(e) => setSingleBatteryVoltage(Number(e.target.value))}
            className={`w-full p-2.5 rounded-xl text-xs font-semibold border outline-none cursor-pointer ${
              darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}
          >
            <option value={12}>{t('battery_calc.opt_bat_12')}</option>
            <option value={24}>24V</option>
            <option value={48}>{t('battery_calc.opt_bat_48')}</option>
            <option value={2}>{t('battery_calc.opt_bat_2')}</option>
          </select>
        </div>

        {/* سعة البطارية الواحدة */}
        <div className="space-y-1">
          <label className="text-xs font-bold opacity-80 block">{t('battery_calc.single_ah_label')}</label>
          <input 
            type="number"
            value={singleBatteryAh}
            onChange={(e) => setSingleBatteryAh(Number(e.target.value) || 100)}
            className={`w-full p-2.5 rounded-xl text-xs font-semibold border outline-none ${
              darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}
          />
        </div>

        {/* مسافة الكابل بين البطارية والانفرتر */}
        <div className="space-y-1 sm:col-span-2 lg:col-span-2">
          <label className="text-xs font-bold opacity-80 block">{t('battery_calc.cable_distance_label')}</label>
          <input 
            type="number"
            min="0.5"
            step="0.5"
            value={cableLength}
            onChange={(e) => setCableLength(Math.max(0.5, Number(e.target.value)))}
            className={`w-full p-2.5 rounded-xl text-xs font-semibold border outline-none ${
              darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}
          />
        </div>

      </div>

      {/* ملخص نتائج بنك البطاريات */}
      <div className={`p-4 rounded-xl border space-y-4 ${
        darkMode ? 'bg-slate-950 border-indigo-500/30' : 'bg-indigo-50/40 border-indigo-200'
      }`}>
        <h3 className="text-xs font-extrabold text-indigo-500 flex items-center gap-1.5 border-b pb-2 dark:border-slate-800 border-indigo-100">
          <Battery className="w-4 h-4" />
          {t('battery_calc.bank_details_title')}
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className={`p-3 rounded-xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <span className="text-[10px] font-bold opacity-70 block mb-1">{t('battery_calc.summary_type')}</span>
            <span className="text-xs font-extrabold text-indigo-400 block">{batteryResults.batteryTypeName}</span>
          </div>

          <div className={`p-3 rounded-xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <span className="text-[10px] font-bold opacity-70 block mb-1">{t('battery_calc.summary_count')}</span>
            <span className="text-lg font-black text-amber-500 block">
              {t('battery_calc.count_unit', { count: batteryResults.totalBatteries })}
            </span>
          </div>

          <div className={`p-3 rounded-xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <span className="text-[10px] font-bold opacity-70 block mb-1">{t('battery_calc.summary_capacity')}</span>
            <span className="text-xs font-extrabold text-emerald-400 block">{batteryResults.requiredTotalAh} Ah</span>
          </div>

          <div className={`p-3 rounded-xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <span className="text-[10px] font-bold opacity-70 block mb-1">{t('battery_calc.summary_voltage')}</span>
            <span className="text-xs font-extrabold text-blue-400 block">{systemVoltage} Volt</span>
          </div>
        </div>

        {/* طريقة التوصيل */}
        <div className={`p-3 rounded-xl border flex items-start gap-3 ${
          darkMode ? 'bg-indigo-950/60 border-indigo-800/80 text-indigo-200' : 'bg-white border-indigo-200 text-indigo-900'
        }`}>
          <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg shrink-0 mt-0.5">
            <GitMerge className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-extrabold block mb-0.5">{t('battery_calc.connection_method_title')}</span>
            <p className="text-xs font-medium leading-relaxed opacity-90">{batteryResults.connectionMethod}</p>
          </div>
        </div>
      </div>

      {/* قسم ملحقات الحماية والأسلاك */}
      <div className={`p-4 rounded-xl border space-y-4 ${
        darkMode ? 'bg-slate-950 border-amber-500/30' : 'bg-amber-50/30 border-amber-200'
      }`}>
        <h3 className="text-xs font-extrabold text-amber-500 flex items-center gap-1.5 border-b pb-2 dark:border-slate-800 border-amber-100">
          <Zap className="w-4 h-4" />
          {t('battery_calc.protection_title')}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
          <div className={`p-3 rounded-xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <span className="text-[10px] font-bold opacity-70 block mb-1">{t('battery_calc.max_current')}</span>
            <span className="text-sm font-extrabold text-slate-300 block">{batteryResults.maxCurrentAmp} A</span>
            <span className="text-[9px] opacity-60">{t('battery_calc.max_current_sub')}</span>
          </div>

          <div className={`p-3 rounded-xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <span className="text-[10px] font-bold opacity-70 block mb-1">{t('battery_calc.breaker_needed')}</span>
            <span className="text-base font-black text-rose-500 block">{batteryResults.recommendedBreakerAmp} A (DC)</span>
            <span className="text-[9px] opacity-60">{t('battery_calc.breaker_sub')}</span>
          </div>

          <div className={`p-3 rounded-xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <span className="text-[10px] font-bold opacity-70 block mb-1">{t('battery_calc.min_cable')}</span>
            <span className="text-base font-black text-amber-400 block">{batteryResults.recommendedCableSize} mm²</span>
            <span className="text-[9px] opacity-60">{t('battery_calc.cable_sub', { length: cableLength })}</span>
          </div>
        </div>

        <p className="text-[10px] opacity-70 text-center">
          {t('battery_calc.safety_warning')}
        </p>
      </div>

    </div>
  );
}

// ==========================================
// ⚙️ 3️⃣ مكوّن ضبط الإنفرتر المترجم بالكامل
// ==========================================
export function InverterTab({ darkMode, invertersData = [] }) {
  const { t } = useTranslation();

  // تحديد القائمة الفعالة حالياً: 'inverter' أو 'glossary'
  const [activeMenu, setActiveMenu] = useState('inverter');

  // 1️⃣ إعدادات الإنفرترات
  const [selectedBrand, setSelectedBrand] = useState(invertersData[0]?.id || '');
  const [systemVoltage, setSystemVoltage] = useState('48');
  const [batteryType, setBatteryType] = useState('lithium');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEssential, setFilterEssential] = useState(false);

  // 🎯 حالة المؤشر للبطاقة الحالية اتجاه الحركة
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState('next');
  const [isFlipping, setIsFlipping] = useState(false);

  // 2️⃣ اختيار مصطلح محدد لعرضه
  const [selectedTermId, setSelectedTermId] = useState('CUTOFF');
  const [glossarySearch, setGlossarySearch] = useState('');

  // 📖 بيانات دليل المصطلحات والرموز المترجمة
  const glossaryData = useMemo(() => [
    { id: 'SBU', term: t('inverter_tab.glossary.sbu.term'), category: t('inverter_tab.glossary.sbu.category'), desc: t('inverter_tab.glossary.sbu.desc') },
    { id: 'SUB', term: t('inverter_tab.glossary.sub.term'), category: t('inverter_tab.glossary.sub.category'), desc: t('inverter_tab.glossary.sub.desc') },
    { id: 'SOL', term: t('inverter_tab.glossary.sol.term'), category: t('inverter_tab.glossary.sol.category'), desc: t('inverter_tab.glossary.sol.desc') },
    { id: 'BULK', term: t('inverter_tab.glossary.bulk.term'), category: t('inverter_tab.glossary.bulk.category'), desc: t('inverter_tab.glossary.bulk.desc') },
    { id: 'FLOAT', term: t('inverter_tab.glossary.float.term'), category: t('inverter_tab.glossary.float.category'), desc: t('inverter_tab.glossary.float.desc') },
    { id: 'CUTOFF', term: t('inverter_tab.glossary.cutoff.term'), category: t('inverter_tab.glossary.cutoff.category'), desc: t('inverter_tab.glossary.cutoff.desc') },
    { id: 'BACK_UTILITY', term: t('inverter_tab.glossary.back_utility.term'), category: t('inverter_tab.glossary.back_utility.category'), desc: t('inverter_tab.glossary.back_utility.desc') },
    { id: 'BACK_BATTERY', term: t('inverter_tab.glossary.back_battery.term'), category: t('inverter_tab.glossary.back_battery.category'), desc: t('inverter_tab.glossary.back_battery.desc') },
    { id: 'BMS', term: t('inverter_tab.glossary.bms.term'), category: t('inverter_tab.glossary.bms.category'), desc: t('inverter_tab.glossary.bms.desc') },
    { id: 'ZERO_EXPORT', term: t('inverter_tab.glossary.zero_export.term'), category: t('inverter_tab.glossary.zero_export.category'), desc: t('inverter_tab.glossary.zero_export.desc') }
  ], [t]);

  // جلب بيانات الإنفرتر المحدد
  const currentInverter = useMemo(() => {
    return invertersData.find(p => p.id === selectedBrand) || invertersData[0];
  }, [selectedBrand, invertersData]);

  // فلترة إعدادات الإنفرتر
  const filteredSettings = useMemo(() => {
    if (!currentInverter?.settings) return [];
    return currentInverter.settings.filter(item => {
      const matchesSearch = 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.desc.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch && (filterEssential ? item.isEssential : true);
    });
  }, [currentInverter, searchTerm, filterEssential]);

  // 🔄 إعادة تصفير المؤشر عند تغيير الفلتر
  useEffect(() => {
    setCurrentIndex(0);
  }, [selectedBrand, searchTerm, filterEssential]);

  // 🔼 🔽 دوال التنقل بالتدوير العمودي
  const triggerFlip = (newDirection, updateFn) => {
    if (isFlipping) return;
    setDirection(newDirection);
    setIsFlipping(true);
    setTimeout(() => {
      updateFn();
      setIsFlipping(false);
    }, 200);
  };

  const handleNext = () => {
    if (filteredSettings.length === 0) return;
    triggerFlip('next', () => {
      setCurrentIndex(prev => (prev < filteredSettings.length - 1 ? prev + 1 : 0));
    });
  };

  const handlePrev = () => {
    if (filteredSettings.length === 0) return;
    triggerFlip('prev', () => {
      setCurrentIndex(prev => (prev > 0 ? prev - 1 : filteredSettings.length - 1));
    });
  };

  // جلب المصطلح المختار حالياً
  const currentGlossaryItem = useMemo(() => {
    if (glossarySearch.trim() !== '') {
      return glossaryData.find(item => 
        item.term.toLowerCase().includes(glossarySearch.toLowerCase()) ||
        item.desc.toLowerCase().includes(glossarySearch.toLowerCase())
      ) || glossaryData[0];
    }
    return glossaryData.find(item => item.id === selectedTermId) || glossaryData[0];
  }, [selectedTermId, glossarySearch, glossaryData]);

  const selectClass = `w-full p-3 rounded-xl border text-sm font-bold outline-none transition-colors cursor-pointer ${
    darkMode 
      ? 'bg-slate-800 border-slate-700 text-white focus:border-emerald-500' 
      : 'bg-slate-100 border-slate-300 text-slate-900 focus:border-emerald-600'
  }`;

  const labelClass = `block text-xs mb-1.5 font-bold ${
    darkMode ? 'text-slate-300' : 'text-slate-700'
  }`;

  const currentItem = filteredSettings[currentIndex];

  return (
    <div className={`p-4 sm:p-8 rounded-2xl border space-y-6 transition-all ${
      darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
    }`}>
      
      {/* ========================================== */}
      {/* ⚙️ القسم الأول: اختيار الإنفرتر والإعدادات */}
      {/* ========================================== */}
      <div 
        onClick={() => setActiveMenu('inverter')} 
        className={`p-4 rounded-2xl border transition-all ${
          activeMenu === 'inverter'
            ? darkMode 
              ? 'border-emerald-500/50 bg-slate-800/40 ring-1 ring-emerald-500/30' 
              : 'border-emerald-500/40 bg-emerald-50/20 ring-1 ring-emerald-500/20'
            : 'opacity-60 grayscale'
        }`}
      >
        <div className="flex items-center justify-between mb-3 border-b pb-2 border-slate-200 dark:border-slate-800">
          <label className="text-sm font-extrabold flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <span>⚙️ {t('inverter_tab.sections.inverter_settings')}</span>
          </label>
          <input 
            type="radio" 
            name="activeTabMenu" 
            checked={activeMenu === 'inverter'} 
            onChange={() => setActiveMenu('inverter')}
            className="accent-emerald-500 w-4 h-4 cursor-pointer"
          />
        </div>

        <select 
          value={selectedBrand}
          disabled={activeMenu !== 'inverter'}
          onChange={(e) => setSelectedBrand(e.target.value)}
          className={`w-full p-3 rounded-xl border text-sm font-bold outline-none cursor-pointer transition-all ${
            activeMenu === 'inverter'
              ? darkMode 
                ? 'bg-slate-800 border-emerald-500 text-emerald-400 font-extrabold' 
                : 'bg-white border-emerald-500 text-emerald-900 font-extrabold'
              : 'bg-slate-200 dark:bg-slate-800/40 border-slate-300 dark:border-slate-700 text-slate-400 cursor-not-allowed'
          }`}
        >
          {invertersData.map((inv) => (
            <option key={inv.id} value={inv.id}>
              {inv.brand} ({inv.category})
            </option>
          ))}
        </select>
      </div>

      {/* الفلاتر الفرعية للإنفرتر */}
      <div className={`space-y-6 transition-all ${activeMenu === 'inverter' ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>{t('inverter_tab.labels.system_voltage')}</label>
            <select 
              value={systemVoltage}
              disabled={activeMenu !== 'inverter'}
              onChange={(e) => setSystemVoltage(e.target.value)}
              className={selectClass}
            >
              <option value="12">{t('inverter_tab.options.v12')}</option>
              <option value="24">{t('inverter_tab.options.v24')}</option>
              <option value="48">{t('inverter_tab.options.v48')}</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>{t('inverter_tab.labels.battery_type')}</label>
            <select 
              value={batteryType}
              disabled={activeMenu !== 'inverter'}
              onChange={(e) => setBatteryType(e.target.value)}
              className={selectClass}
            >
              <option value="lithium">{t('inverter_tab.options.lithium')}</option>
              <option value="gel">{t('inverter_tab.options.gel')}</option>
              <option value="lead">{t('inverter_tab.options.lead')}</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>{t('inverter_tab.labels.search')}</label>
            <input
              type="text"
              placeholder={t('inverter_tab.placeholders.search')}
              disabled={activeMenu !== 'inverter'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full p-3 rounded-xl border text-sm font-medium outline-none ${
                darkMode 
                  ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500' 
                  : 'bg-slate-100 border-slate-300 text-slate-900 placeholder:text-slate-400'
              }`}
            />
          </div>
        </div>

        {/* خيار البرامترات الأساسية */}
        <div className="flex items-center justify-between text-xs px-1">
          <label className={`flex items-center gap-2 cursor-pointer select-none font-semibold ${
            darkMode ? 'text-slate-300' : 'text-slate-700'
          }`}>
            <input
              type="checkbox"
              disabled={activeMenu !== 'inverter'}
              checked={filterEssential}
              onChange={(e) => setFilterEssential(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
            />
            <span>{t('inverter_tab.filter_essential')}</span>
          </label>
        </div>

        {/* 🎡 عرض البطاقة بدوران عمودي دائري */}
        {filteredSettings.length > 0 ? (
          <div className="max-w-xl mx-auto space-y-3">
            
            {/* 🔼 سهم التدوير للأعلى */}
            <div className="flex justify-center">
              <button
                onClick={handlePrev}
                title={t('inverter_tab.prev_card')}
                className={`p-2.5 rounded-full font-bold border transition-all duration-200 shadow-md ${
                  darkMode 
                    ? 'bg-slate-800 border-slate-700 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                    : 'bg-white border-slate-200 hover:bg-emerald-50 text-emerald-600 border-emerald-300'
                } active:scale-90 hover:scale-110 cursor-pointer`}
              >
                <ChevronUp className="w-6 h-6" />
              </button>
            </div>

            {/* 🎴 بطاقة العرض الدوارة العمودية */}
            <div className="perspective-1000">
              <div 
                className={`rounded-2xl p-6 border text-right transition-all duration-200 transform-gpu shadow-xl ${
                  isFlipping 
                    ? direction === 'next'
                      ? '-rotate-x-90 opacity-0 scale-95 translate-y-4' 
                      : 'rotate-x-90 opacity-0 scale-95 -translate-y-4'
                    : 'rotate-x-0 opacity-100 scale-100 translate-y-0'
                } ${
                  darkMode 
                    ? 'bg-slate-800/95 border-slate-700/80 hover:border-emerald-500/50 shadow-emerald-950/20' 
                    : 'bg-white border-slate-200 hover:border-emerald-400 shadow-slate-200/50'
                }`}
                style={{ transformStyle: 'preserve-3d' }}
              >
                <div className="flex items-center justify-between border-b pb-3 mb-4 border-slate-200 dark:border-slate-700/60">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-extrabold text-emerald-600 dark:text-emerald-400 text-lg bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20">
                      #{currentItem.code}
                    </span>
                    <span className={`font-bold text-base ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                      {currentItem.name}
                    </span>
                    {currentItem.isEssential && (
                      <span className="px-2 py-0.5 bg-amber-500/20 text-amber-500 dark:text-amber-400 text-xs rounded font-bold border border-amber-500/30">
                        {t('inverter_tab.essential_tag')}
                      </span>
                    )}
                  </div>
                  
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                    {currentItem.recommended || currentItem.value}
                  </span>
                </div>

                <div className="text-xs sm:text-sm leading-relaxed font-medium space-y-1">
                  <span className="text-slate-400 font-bold block">{t('inverter_tab.explanation_label')}</span>
                  <p className={darkMode ? 'text-slate-200' : 'text-slate-700'}>
                    {currentItem.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/40 flex items-center justify-between text-[11px] font-mono opacity-70">
                  <span>{t('inverter_tab.card_footer_title')}</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {t('inverter_tab.card_counter', { current: currentIndex + 1, total: filteredSettings.length })}
                  </span>
                </div>
              </div>
            </div>

            {/* 🔽 سهم التدوير للأسفل */}
            <div className="flex justify-center">
              <button
                onClick={handleNext}
                title={t('inverter_tab.next_card')}
                className={`p-2.5 rounded-full font-bold border transition-all duration-200 shadow-md ${
                  darkMode 
                    ? 'bg-slate-800 border-slate-700 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                    : 'bg-white border-slate-200 hover:bg-emerald-50 text-emerald-600 border-emerald-300'
                } active:scale-90 hover:scale-110 cursor-pointer`}
              >
                <ChevronDown className="w-6 h-6" />
              </button>
            </div>

          </div>
        ) : (
          <div className={`text-center py-8 text-sm border rounded-xl font-medium ${
            darkMode ? 'text-slate-400 border-slate-800' : 'text-slate-500 border-slate-200'
          }`}>
            {t('inverter_tab.no_results')}
          </div>
        )}
      </div>

      <hr className={darkMode ? 'border-slate-800' : 'border-slate-200'} />

      {/* ========================================== */}
      {/* 📖 القسم الثاني: دليل المصطلحات */}
      {/* ========================================== */}
      <div 
        onClick={() => setActiveMenu('glossary')} 
        className={`p-4 rounded-2xl border transition-all ${
          activeMenu === 'glossary'
            ? darkMode 
              ? 'border-emerald-500/50 bg-slate-800/40 ring-1 ring-emerald-500/30' 
              : 'border-emerald-500/40 bg-emerald-50/20 ring-1 ring-emerald-500/20'
            : 'opacity-60 grayscale'
        }`}
      >
        <div className="flex items-center justify-between mb-3 border-b pb-2 border-slate-200 dark:border-slate-800">
          <label className="text-sm font-extrabold flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <span>📖 {t('inverter_tab.sections.glossary')}</span>
          </label>
          <input 
            type="radio" 
            name="activeTabMenu" 
            checked={activeMenu === 'glossary'} 
            onChange={() => setActiveMenu('glossary')}
            className="accent-emerald-500 w-4 h-4 cursor-pointer"
          />
        </div>

        <select 
          value={selectedTermId}
          disabled={activeMenu !== 'glossary'}
          onChange={(e) => {
            setSelectedTermId(e.target.value);
            setGlossarySearch('');
          }}
          className={`w-full p-3 rounded-xl border text-sm font-bold outline-none cursor-pointer transition-all ${
            activeMenu === 'glossary'
              ? darkMode 
                ? 'bg-slate-800 border-emerald-500 text-emerald-400 font-extrabold' 
                : 'bg-white border-emerald-500 text-emerald-900 font-extrabold'
              : 'bg-slate-200 dark:bg-slate-800/40 border-slate-300 dark:border-slate-700 text-slate-400 cursor-not-allowed'
          }`}
        >
          {glossaryData.map((item) => (
            <option key={item.id} value={item.id}>
              {item.term} [{item.category}]
            </option>
          ))}
        </select>
      </div>

      {/* كرت عرض المصطلح المختار */}
      <div className={`space-y-3 transition-all ${activeMenu === 'glossary' ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <h3 className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
            📖 {t('inverter_tab.glossary_title')}
          </h3>
          <input
            type="text"
            placeholder={t('inverter_tab.placeholders.glossary_search')}
            disabled={activeMenu !== 'glossary'}
            value={glossarySearch}
            onChange={(e) => setGlossarySearch(e.target.value)}
            className={`w-full sm:w-72 p-2 rounded-xl border text-xs font-medium outline-none ${
              darkMode 
                ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500' 
                : 'bg-slate-100 border-slate-300 text-slate-900 placeholder:text-slate-400'
            }`}
          />
        </div>

        <div className="overflow-x-auto pb-2 pt-1">
          <div className={`p-5 rounded-xl border transition-all inline-block min-w-full w-max ${
            darkMode 
              ? 'border-emerald-500/30 bg-slate-800/60 text-slate-100' 
              : 'border-emerald-400 bg-emerald-50/40 text-slate-900'
          }`}>
            <div className="flex items-center gap-4 border-b pb-3 border-emerald-500/20 mb-3">
              <span className="font-mono font-extrabold text-emerald-600 dark:text-emerald-400 text-base whitespace-nowrap">
                {currentGlossaryItem.term}
              </span>
              <span className={`text-xs px-2.5 py-1 rounded-full font-bold whitespace-nowrap ${
                darkMode ? 'bg-slate-700 text-emerald-300' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {currentGlossaryItem.category}
              </span>
            </div>
            
            <p className="text-sm font-medium leading-relaxed whitespace-nowrap">
              {currentGlossaryItem.desc}
            </p>
          </div>
        </div>
      </div>

      {/* صندوق التنبيه الموحد */}
      <div className={`p-4 rounded-xl border flex gap-3 text-xs sm:text-sm ${
        darkMode 
          ? 'bg-amber-500/10 border-amber-500/20 text-amber-300' 
          : 'bg-amber-50 border-amber-200 text-amber-900'
      }`}>
        <AlertTriangle className="w-5 h-5 shrink-0 text-amber-500 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">{t('inverter_tab.warning_title')}</p>
          <p className="opacity-90 leading-relaxed font-medium">
            {t('inverter_tab.warning_desc')}
          </p>
        </div>
      </div>

    </div>
  );
}

// ==========================================
// 🚀 المكوّن الرئيسي للمشروع (MainApp)
// ==========================================
export function MainApp() {
  const { t, i18n } = useTranslation();

  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('tools'); 

  const [openSection, setOpenSection] = useState('terms'); 
  const [openTerm, setOpenTerm] = useState('power'); 

  // حالة قائمة الأجهزة المضافة للجدول (يمكن ترجمة أسماء الأجهزة الافتراضية إذا لزم الأمر)
  const [deviceList, setDeviceList] = useState([
    { id: 1, name: t('main_app.default_devices.fridge'), watt: 150, qty: 1, hours: 24 },
    { id: 2, name: t('main_app.default_devices.led'), watt: 10, qty: 5, hours: 6 },
  ]);

  const [wireCurrent, setWireCurrent] = useState('30');
  const [wireLength, setWireLength] = useState('5');

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
    setOpenTerm(null);
  };

  const toggleTerm = (term) => {
    setOpenTerm(openTerm === term ? null : term);
  };

  const handleImageError = (e, fallbackText) => {
    e.target.style.display = 'none';
    const parent = e.target.parentNode;
    const fallbackDiv = document.createElement('div');
    fallbackDiv.className = `w-full py-6 rounded-xl flex items-center justify-center text-xs border border-dashed font-medium ${
      darkMode ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-slate-100 text-slate-500 border-slate-300'
    }`;
    fallbackDiv.innerText = `🖼️ [${t('main_app.image_fallback')}: ${fallbackText}]`;
    parent.appendChild(fallbackDiv);
  };

  const calculateWireAndFuse = () => {
    const current = parseFloat(wireCurrent) || 0;
    const length = parseFloat(wireLength) || 0;

    if (current <= 0) return { gauge: '0', fuse: '0', lengthWarning: '' };

    const fuseAmp = Math.ceil(current * 1.25);
    let mm2 = '2.5';

    if (current > 100) mm2 = '35 - 50';
    else if (current > 60) mm2 = '25';
    else if (current > 40) mm2 = '16';
    else if (current > 25) mm2 = '10';
    else if (current > 15) mm2 = '6';
    else if (current > 10) mm2 = '4';

    let lengthWarning = '';
    if (length > 10) {
      lengthWarning = t('main_app.wire_calc.length_warning');
    }

    return { gauge: `${mm2} mm²`, fuse: `${fuseAmp} A`, lengthWarning };
  };

  const wireResults = calculateWireAndFuse();

  return (
    <div 
      className={`min-h-screen font-sans transition-colors duration-300 ${
        darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'
      }`} 
      dir={i18n.dir()}
    >

    <header className={`border-b sticky top-0 z-50 backdrop-blur-md transition-colors duration-300 ${
      darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-200'
    }`}>
      <div className="max-w-4xl mx-auto px-4 py-3.5 flex items-center justify-between">
        
        {/* الطرف الأيمن/الأيسر: زر اللغة والشعار الجانبي */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => i18n.changeLanguage(i18n.language === 'ar' ? 'en' : 'ar')}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
              darkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-100 border-slate-200 text-slate-700'
            }`}
          >
            🌐 {i18n.language === 'ar' ? 'English' : 'العربية'}
          </button>

          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border hidden sm:flex items-center gap-1.5 ${
            darkMode ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-600 border-emerald-200'
          }`}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            {t('main_app.version_tag', 'v1.0 إنساني وخالي من التعقيد')}
          </span>
        </div>

        {/* المنتصف: الشعار فقط بدون تداخل */}
        <div className="flex items-center gap-2 group cursor-pointer">
          <div className="p-2 bg-gradient-to-tr from-amber-500 to-amber-300 rounded-xl shadow-md text-slate-950">
            <Sun className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div className="text-center">
            <h1 className={`font-extrabold text-base sm:text-lg leading-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              SolarFlow Pro
            </h1>
            <p className="text-[10px] text-amber-500 font-bold tracking-wide">
              {t('main_app.app_subtitle', 'دليلك الشامل لتصميم وبرمجة المنظومات الشمسية')}
            </p>
          </div>
        </div>
            <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2.5 rounded-xl border transition-all duration-300 cursor-pointer flex items-center justify-center ${
              darkMode 
                ? 'bg-slate-800 text-amber-400 border-slate-700 hover:bg-slate-700' 
                : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
            }`}
            title={t('main_app.toggle_theme')}
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>

      {/* 🔀 شريط التبويبات الرئيسية المترجم تلقائياً */}
        <div className="max-w-4xl mx-auto px-4 pb-3">
          <div className={`p-1.5 rounded-2xl flex gap-1.5 border transition-colors ${
            darkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'
          }`}>
            
            {/* 1️⃣ تبويب دليل المبتدئين */}
            <button
              onClick={() => setActiveTab('guide')}
              className={`group flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                activeTab === 'guide'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md'
                  : darkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <BookOpen className="w-4 h-4 shrink-0" />
              <span>{i18n.language === 'ar' ? 'دليل المبتدئين' : 'Beginners Guide'}</span>
            </button>

            {/* 2️⃣ تبويب حاسبة الأحمال والإنتاج */}
            <button
              onClick={() => setActiveTab('tools')}
              className={`group flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                activeTab === 'tools'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md'
                  : darkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Gauge className="w-4 h-4 shrink-0" />
              <span>{i18n.language === 'ar' ? 'حاسبة الأحمال والإنتاج' : 'Calculators Hub'}</span>
            </button>

            {/* 3️⃣ تبويب برمجة الإنفرتر */}
            <button
              onClick={() => setActiveTab('inverter')}
              className={`group flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                activeTab === 'inverter'
                  ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-md'
                  : darkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Settings className="w-4 h-4 shrink-0" />
              <span>{i18n.language === 'ar' ? 'برمجة الإنفرتر' : 'Inverter Settings'}</span>
            </button>

          </div>
        </div>
        
      </header>

      {/* 📦 المحتوى الرئيسي */}
      <main className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">

        {/* 1️⃣ دليل المفاهيم */}
        {activeTab === 'guide' && (
          <div className="space-y-4">
            <div className={`rounded-2xl border transition-colors ${
              darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}>
              
              <div className="bg-amber-500 hover:bg-amber-600 rounded-2xl transition-colors duration-200 border-none shadow-none mb-3 overflow-hidden">
                <button
                  onClick={() => toggleSection('terms')}
                  className="group w-full py-3.5 px-4 flex items-center justify-between cursor-pointer text-white"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-xl transition-transform duration-200 ltr:group-hover:translate-x-1 rtl:group-hover:-translate-x-1">
                      <Zap className="w-5 h-5 text-white" />
                    </div>
                    
                    <span className="font-bold text-lg md:text-xl text-white">
                      {t('main_app.guide.basic_concepts_title')}
                    </span>
                  </div>

                  <ChevronDown 
                    className={`w-6 h-6 text-white transition-transform duration-300 ${
                      openSection === 'terms' ? 'rotate-180' : ''
                    }`} 
                  />
                </button>
              </div>

              {openSection === 'terms' && (
                <div className={`p-4 pt-0 space-y-3 border-t ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                  
                  {/* الجهد */}
                  <div className={`rounded-xl border transition-colors ${darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                    <button onClick={() => toggleTerm('voltage')} className="group w-full p-3.5 flex items-center justify-between cursor-pointer">
                      <span className="font-bold text-sm transition-transform duration-200 ltr:group-hover:translate-x-1 rtl:group-hover:-translate-x-1">{t('main_app.guide.voltage.title')}</span>
                      <span className="text-xs bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded-full">{t('main_app.guide.voltage.unit')}</span>
                    </button>
                    {openTerm === 'voltage' && (
                      <div className="p-4 border-t border-slate-200/40 dark:border-slate-700/60 space-y-3">
                        <div className={`p-2 rounded-lg border text-center ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
                          <img src="./assets/img/image_voltage.png" alt="Voltage" onError={(e) => handleImageError(e, t('main_app.guide.voltage.img_alt'))} className="max-h-48 mx-auto object-contain" />
                        </div>
                        <div className="space-y-2 text-xs sm:text-sm leading-relaxed opacity-90">
                          <p>
                            <strong>{t('main_app.guide.analogy_label')}:</strong> {t('main_app.guide.voltage.analogy')}
                          </p>
                          <p className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-medium [&>strong]:text-emerald-600 dark:[&>strong]:text-emerald-400">
                            💡 <strong>{t('main_app.guide.practical_tip_label')}:</strong> {t('main_app.guide.voltage.practical_tip')}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* التيار */}
                  <div className={`rounded-xl border transition-colors ${darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                    <button onClick={() => toggleTerm('current')} className="group w-full p-3.5 flex items-center justify-between cursor-pointer">
                      <span className="font-bold text-sm transition-transform duration-200 ltr:group-hover:translate-x-1 rtl:group-hover:-translate-x-1">{t('main_app.guide.current.title')}</span>
                      <span className="text-xs bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded-full">{t('main_app.guide.current.unit')}</span>
                    </button>
                    {openTerm === 'current' && (
                      <div className="p-4 border-t border-slate-200/40 dark:border-slate-700/60 space-y-3">
                        <div className={`p-2 rounded-lg border text-center ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
                          <img src="./assets/img/image_current.png" alt="Current" onError={(e) => handleImageError(e, t('main_app.guide.current.img_alt'))} className="max-h-48 mx-auto object-contain" />
                        </div>
                        <p className="text-xs sm:text-sm leading-relaxed opacity-90">
                          <strong>{t('main_app.guide.analogy_label')}:</strong> {t('main_app.guide.current.analogy')}
                        </p>
                        <div className="p-3 bg-red-100/80 rounded-lg text-red-900 text-sm flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
                          <span><strong>{t('main_app.guide.safety_rule_label')}:</strong> {t('main_app.guide.current.safety_rule')}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* القدرة */}
                  <div className={`rounded-xl border transition-colors ${darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                    <button onClick={() => toggleTerm('power')} className="group w-full p-3.5 flex items-center justify-between cursor-pointer">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span className="font-bold text-sm transition-transform duration-200 ltr:group-hover:translate-x-1 rtl:group-hover:-translate-x-1">{t('main_app.guide.power.title')}</span>
                      </div>
                      <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">{t('main_app.guide.power.unit')}</span>
                    </button>
                    {openTerm === 'power' && (
                      <div className="p-4 border-t border-slate-200/40 dark:border-slate-700/60 space-y-3">
                        <div className={`p-2 rounded-lg border text-center ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
                          <img src="./assets/img/image_power.png" alt="Power" onError={(e) => handleImageError(e, t('main_app.guide.power.img_alt'))} className="max-h-48 mx-auto object-contain" />
                        </div>
                        <div className="space-y-2 text-xs sm:text-sm leading-relaxed opacity-90">
                          <p><strong>{t('main_app.guide.concept_label')}:</strong> {t('main_app.guide.power.concept')}</p>
                        </div>
                      </div>
                    )}
                  </div> 

                </div>
              )} 
            </div>

            {/* 2. أنواع البطاريات */}
            <button
              onClick={() => toggleSection('batteries')}
              className={`w-full p-4 rounded-xl flex justify-between items-center shadow-lg transition-all cursor-pointer ${
                darkMode ? 'bg-blue-950 text-white hover:bg-blue-900' : 'bg-blue-900 text-white hover:bg-blue-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <Battery className="w-6 h-6 text-blue-400 shrink-0" />
                <h2 className="text-lg sm:text-xl font-bold">{t('main_app.guide.batteries_section_title')}</h2>
              </div>
              <ChevronDown className={`w-6 h-6 transition-transform duration-300 ${openSection === 'batteries' ? 'rotate-180 text-blue-400' : 'text-slate-400'}`} />
            </button>

            {openSection === 'batteries' && (
              <div className="space-y-3 px-2 ltr:border-l-2 rtl:border-r-2 border-blue-500/50">

                {/* Acid / Flooded Lead-Acid */}
                <div className={`border rounded-xl overflow-hidden transition-all duration-200 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <button 
                    onClick={() => toggleTerm('acid_battery')} 
                    className="w-full p-3.5 flex justify-between items-center hover:bg-slate-500/5 transition-colors ltr:text-left rtl:text-right cursor-pointer select-none"
                    aria-expanded={openTerm === 'acid_battery'}
                  >
                    <div className="flex items-center gap-2.5 wrap sm:flex-nowrap">
                      <span className={`font-bold text-sm sm:text-base ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                        {t('main_app.guide.batteries.acid.name')}
                      </span>
                      <span className="text-xs bg-amber-500/15 text-amber-600 dark:text-amber-400 font-semibold px-2.5 py-0.5 rounded-full border border-amber-500/20 whitespace-nowrap">
                        {t('main_app.guide.batteries.acid.tag')}
                      </span>
                    </div>
                    <ChevronDown className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-300 ease-in-out ${openTerm === 'acid_battery' ? 'rotate-180' : ''}`} />
                  </button>

                  {openTerm === 'acid_battery' && (
                    <div className={`p-4 border-t space-y-3.5 transition-all ${darkMode ? 'border-slate-800 bg-amber-950/10' : 'border-slate-200/80 bg-amber-50/30'}`}>
                      <div className={`p-3 rounded-lg border text-center transition-all ${darkMode ? 'bg-slate-950/80 border-slate-800/80' : 'bg-white border-slate-200/80 shadow-xs'}`}>
                        <img 
                          src="./assets/img/image_acid_battery.png" 
                          alt="Flooded Lead-Acid Battery" 
                          onError={(e) => handleImageError(e, t('main_app.guide.batteries.acid.img_alt'))} 
                          className="max-h-48 mx-auto object-contain rounded-md hover:scale-[1.02] transition-transform duration-200" 
                        />
                      </div>

                      <div className={`p-3.5 rounded-lg text-xs sm:text-sm flex items-start gap-3 leading-relaxed ${darkMode ? 'bg-amber-950/30 text-amber-200 border border-amber-800/30' : 'bg-amber-100/70 text-amber-900 border border-amber-200/50'}`}>
                        <Lightbulb className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                        <div>
                          <strong className="font-bold block mb-1 text-amber-600 dark:text-amber-400">{t('main_app.guide.explanation_label')}:</strong>
                          {t('main_app.guide.batteries.acid.desc')}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Gel */}
                <div className={`border rounded-xl overflow-hidden transition-colors ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                  <button onClick={() => toggleTerm('gel_battery')} className="w-full p-4 flex justify-between items-center hover:bg-slate-50/10 transition-colors ltr:text-left rtl:text-right cursor-pointer">
                    <div className="flex items-center gap-2">
                      <span className={`font-bold text-sm sm:text-base ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>{t('main_app.guide.batteries.gel.name')}</span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${darkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'}`}>{t('main_app.guide.batteries.gel.tag')}</span>
                    </div>
                    <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${openTerm === 'gel_battery' ? 'rotate-180' : ''}`} />
                  </button>
                  {openTerm === 'gel_battery' && (
                    <div className={`p-4 border-t space-y-3 ${darkMode ? 'border-slate-800 bg-blue-950/20' : 'border-slate-100 bg-blue-50/20'}`}>
                      <div className={`p-3 rounded-lg border text-center ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-blue-200'}`}>
                        <img src="./assets/img/image_gel_battery.png" alt="Gel Battery" onError={(e) => handleImageError(e, t('main_app.guide.batteries.gel.img_alt'))} className="w-full h-auto max-h-56 object-contain rounded-md" />
                      </div>
                      <div className={`p-3 rounded-lg text-xs sm:text-sm flex items-center gap-2.5 ${darkMode ? 'bg-blue-950/50 text-blue-200 border border-blue-800/40' : 'bg-blue-100/60 text-blue-900'}`}>
                        <Lightbulb className="w-5 h-5 text-blue-500 shrink-0" />
                        <span><strong>{t('main_app.guide.explanation_label')}:</strong> {t('main_app.guide.batteries.gel.desc')}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Lithium */}
                <div className={`border rounded-xl overflow-hidden transition-colors ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                  <button onClick={() => toggleTerm('lithium_battery')} className="w-full p-4 flex justify-between items-center hover:bg-slate-50/10 transition-colors ltr:text-left rtl:text-right cursor-pointer">
                    <div className="flex items-center gap-2">
                      <span className={`font-bold text-sm sm:text-base ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>{t('main_app.guide.batteries.lithium.name')}</span>
                      <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">{t('main_app.guide.batteries.lithium.tag')}</span>
                    </div>
                    <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${openTerm === 'lithium_battery' ? 'rotate-180' : ''}`} />
                  </button>
                  {openTerm === 'lithium_battery' && (
                    <div className={`p-4 border-t space-y-3 ${darkMode ? 'border-slate-800 bg-emerald-950/20' : 'border-slate-100 bg-emerald-50/20'}`}>
                      <div className={`p-3 rounded-lg border text-center ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-emerald-200'}`}>
                        <img src="./assets/img/image_lithium_battery.png" alt="Lithium Battery" onError={(e) => handleImageError(e, t('main_app.guide.batteries.lithium.img_alt'))} className="w-full h-auto max-h-56 object-contain rounded-md" />
                      </div>
                      <div className={`p-3 rounded-lg text-xs sm:text-sm flex items-center gap-2.5 ${darkMode ? 'bg-emerald-950/50 text-emerald-200 border border-emerald-800/40' : 'bg-emerald-100/60 text-emerald-900'}`}>
                        <Lightbulb className="w-5 h-5 text-emerald-500 shrink-0" />
                        <span><strong>{t('main_app.guide.explanation_label')}:</strong> {t('main_app.guide.batteries.lithium.desc')}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* 3. أنواع الألواح الشمسية */}
            <button
              onClick={() => toggleSection('panels')}
              className={`w-full p-4 rounded-xl flex justify-between items-center shadow-lg transition-all cursor-pointer ${
                darkMode ? 'bg-emerald-950 text-white hover:bg-emerald-900' : 'bg-emerald-900 text-white hover:bg-emerald-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <Sun className="w-6 h-6 text-emerald-400 shrink-0" />
                <h2 className="text-lg sm:text-xl font-bold">{t('main_app.guide.panels_section_title')}</h2>
              </div>
              <ChevronDown className={`w-6 h-6 transition-transform duration-300 ${openSection === 'panels' ? 'rotate-180 text-emerald-400' : 'text-slate-400'}`} />
            </button>

            {openSection === 'panels' && (
              <div className="space-y-3 px-2 ltr:border-l-2 rtl:border-r-2 border-emerald-500/50">
                {/* Mono */}
                <div className={`border rounded-xl overflow-hidden transition-colors ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                  <button onClick={() => toggleTerm('mono_panel')} className="w-full p-4 flex justify-between items-center hover:bg-slate-50/10 transition-colors ltr:text-left rtl:text-right cursor-pointer">
                    <div className="flex items-center gap-2">
                      <span className={`font-bold text-sm sm:text-base ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>{t('main_app.guide.panels.mono.name')}</span>
                      <span className="text-xs bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950 font-semibold px-2 py-0.5 rounded-full">{t('main_app.guide.panels.mono.tag')}</span>
                    </div>
                    <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${openTerm === 'mono_panel' ? 'rotate-180' : ''}`} />
                  </button>
                  {openTerm === 'mono_panel' && (
                    <div className={`p-4 border-t space-y-3 ${darkMode ? 'border-slate-800 bg-slate-950/50' : 'border-slate-100 bg-slate-50'}`}>
                      <div className={`p-3 rounded-lg border text-center ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'}`}>
                        <img src="./assets/img/image_mono_panel.png" alt="Monocrystalline Panel" onError={(e) => handleImageError(e, t('main_app.guide.panels.mono.img_alt'))} className="w-full h-auto max-h-56 object-contain rounded-md" />
                      </div>
                      <div className={`p-3 rounded-lg text-xs sm:text-sm flex items-center gap-2.5 ${darkMode ? 'bg-slate-800 text-slate-200 border border-slate-700' : 'bg-slate-100 text-slate-900'}`}>
                        <Lightbulb className="w-5 h-5 text-amber-500 shrink-0" />
                        <span><strong>{t('main_app.guide.explanation_label')}:</strong> {t('main_app.guide.panels.mono.desc')}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Poly */}
                <div className={`border rounded-xl overflow-hidden transition-colors ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                  <button onClick={() => toggleTerm('poly_panel')} className="w-full p-4 flex justify-between items-center hover:bg-slate-50/10 transition-colors ltr:text-left rtl:text-right cursor-pointer">
                    <div className="flex items-center gap-2">
                      <span className={`font-bold text-sm sm:text-base ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>{t('main_app.guide.panels.poly.name')}</span>
                      <span className="text-xs bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded-full">{t('main_app.guide.panels.poly.tag')}</span>
                    </div>
                    <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${openTerm === 'poly_panel' ? 'rotate-180' : ''}`} />
                  </button>
                  {openTerm === 'poly_panel' && (
                    <div className={`p-4 border-t space-y-3 ${darkMode ? 'border-slate-800 bg-blue-950/20' : 'border-slate-100 bg-blue-50/20'}`}>
                      <div className={`p-3 rounded-lg border text-center ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-blue-200'}`}>
                        <img src="./assets/img/image_poly_panel.png" alt="Polycrystalline Panel" onError={(e) => handleImageError(e, t('main_app.guide.panels.poly.img_alt'))} className="w-full h-auto max-h-56 object-contain rounded-md" />
                      </div>
                      <div className={`p-3 rounded-lg text-xs sm:text-sm flex items-center gap-2.5 ${darkMode ? 'bg-blue-950/50 text-blue-200 border border-blue-800/40' : 'bg-blue-100/60 text-blue-900'}`}>
                        <Lightbulb className="w-5 h-5 text-blue-500 shrink-0" />
                        <span><strong>{t('main_app.guide.explanation_label')}:</strong> {t('main_app.guide.panels.poly.desc')}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Flexible */}
                <div className={`border rounded-xl overflow-hidden transition-colors ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                  <button onClick={() => toggleTerm('flex_panel')} className="w-full p-4 flex justify-between items-center hover:bg-slate-50/10 transition-colors ltr:text-left rtl:text-right cursor-pointer">
                    <div className="flex items-center gap-2">
                      <span className={`font-bold text-sm sm:text-base ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>{t('main_app.guide.panels.flexible.name')}</span>
                      <span className="text-xs bg-purple-100 text-purple-800 font-semibold px-2 py-0.5 rounded-full">{t('main_app.guide.panels.flexible.tag')}</span>
                    </div>
                    <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${openTerm === 'flex_panel' ? 'rotate-180' : ''}`} />
                  </button>
                  {openTerm === 'flex_panel' && (
                    <div className={`p-4 border-t space-y-3 ${darkMode ? 'border-slate-800 bg-purple-950/20' : 'border-slate-100 bg-purple-50/20'}`}>
                      <div className={`p-3 rounded-lg border text-center ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-purple-200'}`}>
                        <img src="./assets/img/image_flexible_panel.png" alt="Flexible Panel" onError={(e) => handleImageError(e, t('main_app.guide.panels.flexible.img_alt'))} className="w-full h-auto max-h-56 object-contain rounded-md" />
                      </div>
                      <div className={`p-3 rounded-lg text-xs sm:text-sm flex items-center gap-2.5 ${darkMode ? 'bg-purple-950/50 text-purple-200 border border-purple-800/40' : 'bg-purple-100/60 text-purple-900'}`}>
                        <Lightbulb className="w-5 h-5 text-purple-500 shrink-0" />
                        <span><strong>{t('main_app.guide.explanation_label')}:</strong> {t('main_app.guide.panels.flexible.desc')}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2️⃣ مركز الحاسبات */}
        {activeTab === 'tools' && (
          <CalculatorsHub 
            darkMode={darkMode}
            deviceList={deviceList}
            setDeviceList={setDeviceList}
            wireCurrent={wireCurrent}
            setWireCurrent={setWireCurrent}
            wireLength={wireLength}
            setWireLength={setWireLength}
            wireResults={wireResults}
          />
        )}

        {/* 3️⃣ ضبط الإنفرتر */}
        {activeTab === 'inverter' && (
          <InverterTab darkMode={darkMode} />
        )}

      </main>

    </div>
  );
}

const rootElement = document.getElementById('root');

if (!rootElement._reactRootContainer) {
  rootElement._reactRootContainer = ReactDOM.createRoot(rootElement);
}

rootElement._reactRootContainer.render(
  <React.StrictMode>
    <MainApp />
  </React.StrictMode>
);