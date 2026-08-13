import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronUp, ChevronDown, AlertTriangle } from 'lucide-react';
import { invertersData } from '../data/invertersData';

export function InverterSettingsTab({ darkMode, propsData = [] }) {
  const { t, i18n } = useTranslation();

  // 1. تحديد حالة اللغة الحالية بأمان
  const currentLang = i18n?.language || 'ar';
  const isEn = currentLang.startsWith('en');

  // تحديد القائمة الفعالة حالياً: 'inverter' أو 'glossary'
  const [activeMenu, setActiveMenu] = useState('inverter');

  // إعدادات البحث والفلترة للإنفرترات
  const [selectedBrand, setSelectedBrand] = useState('');
  const [systemVoltage, setSystemVoltage] = useState('48');
  const [batteryType, setBatteryType] = useState('lithium');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEssential, setFilterEssential] = useState(false);

  // إعدادات البطاقة الدوارة (Carousel)
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState('next');
  const [isFlipping, setIsFlipping] = useState(false);

  // إعدادات القاموس ودليل المصطلحات
  const [selectedTermId, setSelectedTermId] = useState('CUTOFF');
  const [glossarySearch, setGlossarySearch] = useState('');

  // تحديد مصدر البيانات (من الـ Props أو من الملف المحلي)
  const data = useMemo(() => {
    return (propsData && propsData.length > 0) ? propsData : invertersData;
  }, [propsData]);

  // تحديد الإنفرتر المختار حالياً
  const currentInverter = useMemo(() => {
    if (!data || data.length === 0) return null;
    return data.find(p => p.id === selectedBrand) || data[0];
  }, [selectedBrand, data]);

  // تعيين الماركة الأولى تلقائياً عند تحميل البيانات
  useEffect(() => {
    if (data && data.length > 0 && !selectedBrand) {
      setSelectedBrand(data[0].id);
    }
  }, [data, selectedBrand]);

  // reset مؤشر البطاقة عند تغيير الماركة أو الفلترة
  useEffect(() => {
    setCurrentIndex(0);
  }, [selectedBrand, searchTerm, filterEssential]);

  // 2. دالة الفلترة المحصنة وجلب الترجمة بناءً على اللغة المحددة
  const filteredSettings = useMemo(() => {
    if (!currentInverter?.settings) return [];

    const getValidTranslation = (key) => {
      if (!t) return null;
      const res = t(key, { defaultValue: '' });
      return (res && res !== key) ? res : null;
    };

    return currentInverter.settings
      .map(item => {
        const codeKey = item.code ? item.code.toString().padStart(2, '0') : '';
        const rawCode = item.code ? item.code.toString() : '';

        const translatedName = isEn 
          ? (
              getValidTranslation(`inverter_tab.settings.${codeKey}.name`) ||
              getValidTranslation(`inverter_tab.settings.${rawCode}.name`) ||
              getValidTranslation(`inverter_tab.sections.inverter_settings.${rawCode}.name`) ||
              item.name_en || 
              item.name
            )
          : item.name;

        const translatedDesc = isEn 
          ? (
              getValidTranslation(`inverter_tab.settings.${codeKey}.desc`) ||
              getValidTranslation(`inverter_tab.settings.${rawCode}.desc`) ||
              getValidTranslation(`inverter_tab.sections.inverter_settings.${rawCode}.desc`) ||
              item.desc_en || 
              item.desc
            )
          : item.desc;

        return {
          ...item,
          displayName: translatedName,
          displayDesc: translatedDesc
        };
      })
      .filter(item => {
        const query = (searchTerm || '').toLowerCase().trim();
        
        const matchesSearch = 
          !query ||
          (item.displayName && item.displayName.toLowerCase().includes(query)) ||
          (item.code && item.code.toString().toLowerCase().includes(query)) ||
          (item.displayDesc && item.displayDesc.toLowerCase().includes(query));

        return matchesSearch && (filterEssential ? item.isEssential : true);
      });
  }, [currentInverter, searchTerm, filterEssential, isEn, t]);

  // 📖 بيانات دليل المصطلحات المترجمة
  const glossaryData = useMemo(() => [
    { 
      id: 'SBU', 
      term: t('inverter_tab.glossary.sbu.term', 'SBU Priority'), 
      category: t('inverter_tab.glossary.sbu.category', isEn ? 'Priority' : 'الأولوية'), 
      desc: t('inverter_tab.glossary.sbu.desc', isEn ? 'Solar -> Battery -> Utility source priority.' : 'أولوية التغذية: الطاقة الشمسية ثم البطارية ثم الشبكة.') 
    },
    { 
      id: 'SUB', 
      term: t('inverter_tab.glossary.sub.term', 'SUB Priority'), 
      category: t('inverter_tab.glossary.sub.category', isEn ? 'Priority' : 'الأولوية'), 
      desc: t('inverter_tab.glossary.sub.desc', isEn ? 'Solar -> Utility -> Battery source priority.' : 'أولوية التغذية: الشمس ثم الشبكة ثم البطارية.') 
    },
    { 
      id: 'SOL', 
      term: t('inverter_tab.glossary.sol.term', 'SOL Priority'), 
      category: t('inverter_tab.glossary.sol.category', isEn ? 'Priority' : 'الأولوية'), 
      desc: t('inverter_tab.glossary.sol.desc', isEn ? 'Solar power provides power to loads as first priority, utility as backup.' : 'أولوية التغذية من الشمس فقط وإبقاء الشبكة كاحتياط.') 
    },
    { 
      id: 'BULK', 
      term: t('inverter_tab.glossary.bulk.term', 'Bulk Voltage'), 
      category: t('inverter_tab.glossary.bulk.category', isEn ? 'Charging' : 'الشحن'), 
      desc: t('inverter_tab.glossary.bulk.desc', isEn ? 'Main fast charging voltage for the battery bank.' : 'جهد الشحن الرئيسي السريع للبطارية.') 
    },
    { 
      id: 'FLOAT', 
      term: t('inverter_tab.glossary.float.term', 'Float Voltage'), 
      category: t('inverter_tab.glossary.float.category', isEn ? 'Charging' : 'الشحن'), 
      desc: t('inverter_tab.glossary.float.desc', isEn ? 'Maintenance voltage to keep the battery fully charged without overcharging.' : 'جهد الشحن العائم للحفاظ على امتلاء البطارية.') 
    },
    { 
      id: 'CUTOFF', 
      term: t('inverter_tab.glossary.cutoff.term', 'Low DC Cut-off'), 
      category: t('inverter_tab.glossary.cutoff.category', isEn ? 'Protection' : 'الحماية'), 
      desc: t('inverter_tab.glossary.cutoff.desc', isEn ? 'Low voltage threshold at which inverter shuts down output to protect batteries.' : 'الجهد المنخفض الذي يطفي عنده الإنفرتر لحماية البطارية.') 
    },
    { 
      id: 'BACK_UTILITY', 
      term: t('inverter_tab.glossary.back_utility.term', 'Back to Utility'), 
      category: t('inverter_tab.glossary.back_utility.category', isEn ? 'Switching' : 'التحويل'), 
      desc: t('inverter_tab.glossary.back_utility.desc', isEn ? 'Battery voltage point to switch back to grid supply.' : 'جهد العودة للتغذية من شركة الكهرباء/الشبكة.') 
    },
    { 
      id: 'BACK_BATTERY', 
      term: t('inverter_tab.glossary.back_battery.term', 'Back to Battery'), 
      category: t('inverter_tab.glossary.back_battery.category', isEn ? 'Switching' : 'التحويل'), 
      desc: t('inverter_tab.glossary.back_battery.desc', isEn ? 'Battery voltage point to switch back to battery power after charging.' : 'جهد العودة للتغذية من البطارية بعد شحنها.') 
    },
    { 
      id: 'BMS', 
      term: t('inverter_tab.glossary.bms.term', 'BMS Comms'), 
      category: t('inverter_tab.glossary.bms.category', isEn ? 'Communication' : 'الاتصال'), 
      desc: t('inverter_tab.glossary.bms.desc', isEn ? 'Smart communication protocol between inverter and Lithium BMS.' : 'بروتوكول الاتصال الذكي بين الإنفرتر وبطارية الليثيوم.') 
    },
  { 
      id: 'ZERO_EXPORT', 
      term: t('inverter_tab.glossary.zero_export.term', 'Zero Export'), 
      category: t('inverter_tab.glossary.zero_export.category', isEn ? 'Grid' : 'الشبكة'), 
      desc: t('inverter_tab.glossary.zero_export.desc', isEn ? 'Feature to prevent feeding excess solar power back into the public grid.' : 'خاصية منع ضخ الكهرباء الزائدة للشبكة العامة.') 
    }
  ], [t, isEn]);

  // التنقل والتأثيرات للبطاقات
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

  // المعلمة الحالية المعروضة
  const currentItem = filteredSettings[currentIndex] || null;

  return (
    <div className={`p-4 sm:p-8 rounded-2xl border space-y-6 transition-all ${
      darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
    }`} dir={isEn ? 'ltr' : 'rtl'}>
      
      {/* ⚙️ القسم الأول: اختيار الإنفرتر */}
      <div 
        onClick={() => setActiveMenu('inverter')} 
        className={`p-4 rounded-2xl border transition-all cursor-pointer ${
          activeMenu === 'inverter'
            ? darkMode 
              ? 'border-emerald-500/50 bg-slate-800/40 ring-1 ring-emerald-500/30' 
              : 'border-emerald-500/40 bg-emerald-50/20 ring-1 ring-emerald-500/20'
            : 'opacity-60 hover:opacity-80'
        }`}
      >
        <div className="flex items-center justify-between mb-3 border-b pb-2 border-slate-200 dark:border-slate-800">
          <label className="text-sm font-extrabold flex items-center gap-2 text-emerald-600 dark:text-emerald-400 cursor-pointer">
            <span>⚙️ {t('inverter_tab.sections.inverter_settings.header_title', isEn ? 'Inverter Settings' : 'إعدادات الإنفرترات')}</span>
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
          {data.map((inv) => (
            <option key={inv.id} value={inv.id}>
              {(isEn && inv.brand_en) ? inv.brand_en : inv.brand || inv.name} {inv.category ? `(${inv.category})` : ''}
            </option>
          ))}
        </select>
      </div>

      {/* الفلاتر الفرعية */}
      <div className={`space-y-6 transition-all ${activeMenu === 'inverter' ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>{t('inverter_tab.sections.inverter_settings.system_voltage', isEn ? 'System Voltage:' : 'جهد المنظومة:')}</label>
            <select 
              value={systemVoltage}
              disabled={activeMenu !== 'inverter'}
              onChange={(e) => setSystemVoltage(e.target.value)}
              className={selectClass}
            >
              <option value="12">{t('inverter_tab.options.v12', isEn ? '12 Volts' : '12 فولت')}</option>
              <option value="24">{t('inverter_tab.options.v24', isEn ? '24 Volts' : '24 فولت')}</option>
              <option value="48">{t('inverter_tab.options.v48', isEn ? '48 Volts' : '48 فولت')}</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>{t('inverter_tab.labels.battery_type', isEn ? 'Battery Type:' : 'نوع البطارية:')}</label>
            <select 
              value={batteryType}
              disabled={activeMenu !== 'inverter'}
              onChange={(e) => setBatteryType(e.target.value)}
              className={selectClass}
            >
              <option value="lithium">{t('inverter_tab.options.lithium', isEn ? 'Lithium (LiFePO4)' : 'ليثيوم (LiFePO4)')}</option>
              <option value="gel">{t('inverter_tab.options.gel', isEn ? 'GEL / AGM' : 'جل / AGM')}</option>
              <option value="acid">{t('inverter_tab.options.acid', isEn ? 'Flooded Lead-Acid' : 'أسيد سائل (Lead-Acid)')}</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>{t('inverter_tab.labels.search', isEn ? 'Search by code or name:' : 'بحث برقم أو اسم الإعداد:')}</label>
            <input
              type="text"
              placeholder={t('inverter_tab.placeholders.search', isEn ? 'Search setting...' : 'ابحث هنا...')}
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
            <span>{t('inverter_tab.filter_essential', isEn ? 'Show Essential Settings Only' : 'عرض الإعدادات الأساسية فقط')}</span>
          </label>
        </div>

        {/* 🎡 عرض البطاقة الدوارة العمودية */}
        {filteredSettings.length > 0 && currentItem ? (
          <div className="max-w-xl mx-auto space-y-3">
            
            {/* 🔼 سهم للأعلى */}
            <div className="flex justify-center">
              <button
                type="button"
                onClick={handlePrev}
                title={t('inverter_tab.prev_card', isEn ? 'Previous Setting' : 'الإعداد السابق')}
                className={`p-2.5 rounded-full font-bold border transition-all duration-200 shadow-md ${
                  darkMode 
                    ? 'bg-slate-800 border-slate-700 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                    : 'bg-white border-slate-200 hover:bg-emerald-50 text-emerald-600 border-emerald-300'
                } active:scale-90 hover:scale-110 cursor-pointer`}
              >
                <ChevronUp className="w-6 h-6" />
              </button>
            </div>

            {/* 🎴 البطاقة المترجمة الصافية */}
            <div className="perspective-1000">
              <div 
                className={`rounded-2xl p-6 border transition-all duration-200 transform-gpu shadow-xl ${
                  isEn ? 'text-left' : 'text-right'
                } ${
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
                      {currentItem.displayName}
                    </span>
                    {currentItem.isEssential && (
                      <span className="px-2 py-0.5 bg-amber-500/20 text-amber-500 dark:text-amber-400 text-xs rounded font-bold border border-amber-500/30">
                        {t('inverter_tab.essential_tag', isEn ? 'Essential' : 'أساسي')}
                      </span>
                    )}
                  </div>
                  
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                    {(isEn && currentItem.recommended_en) ? currentItem.recommended_en : (currentItem.recommended || currentItem.value || currentItem.val)}
                  </span>
                </div>

                <div className="text-xs sm:text-sm leading-relaxed font-medium space-y-1">
                  <span className="text-slate-400 font-bold block">
                    {t('inverter_tab.explanation_label', isEn ? 'Description & Details:' : 'الشرح والتوضيح:')}
                  </span>
                  <p className={darkMode ? 'text-slate-200' : 'text-slate-700'}>
                    {currentItem.displayDesc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/40 flex items-center justify-between text-[11px] font-mono opacity-70">
                  <span>{t('inverter_tab.card_footer_title', isEn ? 'Current Parameter' : 'المعلمة الحالية')}</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {t('inverter_tab.card_counter', isEn ? '{{current}} of {{total}}' : '{{current}} من {{total}}', { current: currentIndex + 1, total: filteredSettings.length })}
                  </span>
                </div>
              </div>
            </div>

            {/* 🔽 سهم للأسفل */}
            <div className="flex justify-center">
              <button
                type="button"
                onClick={handleNext}
                title={t('inverter_tab.next_card', isEn ? 'Next Setting' : 'الإعداد التالي')}
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
            {t('inverter_tab.no_results', isEn ? 'No matching settings found' : 'لم يتم العثور على إعدادات متطابقة')}
          </div>
        )}
      </div>

      <hr className={darkMode ? 'border-slate-800' : 'border-slate-200'} />

      {/* 📖 القسم الثاني: دليل المصطلحات المترجم بالكامل */}
      <div 
        onClick={() => setActiveMenu('glossary')} 
        className={`p-4 rounded-2xl border transition-all cursor-pointer ${
          activeMenu === 'glossary'
            ? darkMode 
              ? 'border-emerald-500/50 bg-slate-800/40 ring-1 ring-emerald-500/30' 
              : 'border-emerald-500/40 bg-emerald-50/20 ring-1 ring-emerald-500/20'
            : 'opacity-60 hover:opacity-80'
        }`}
      >
        <div className="flex items-center justify-between mb-3 border-b pb-2 border-slate-200 dark:border-slate-800">
          <label className="text-sm font-extrabold flex items-center gap-2 text-emerald-600 dark:text-emerald-400 cursor-pointer">
            <span>📖 {t('inverter_tab.sections.glossary', isEn ? 'Inverter Terms Glossary' : 'قاموس وشرح مصطلحات الإنفرتر')}</span>
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
            📖 {t('inverter_tab.glossary_title', isEn ? 'Term Details' : 'تفاصيل المصطلح')}
          </h3>
          <input
            type="text"
            placeholder={t('inverter_tab.placeholders.glossary_search', isEn ? 'Search glossary...' : 'بحث في المصطلحات...')}
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

        <div className="w-full">
          {currentGlossaryItem && (
            <div className={`p-5 rounded-xl border transition-all w-full ${
              darkMode 
                ? 'border-emerald-500/30 bg-slate-800/60 text-slate-100' 
                : 'border-emerald-400 bg-emerald-50/40 text-slate-900'
            }`}>
              <div className="flex items-center gap-4 border-b pb-3 border-emerald-500/20 mb-3">
                <span className="font-mono font-extrabold text-emerald-600 dark:text-emerald-400 text-base">
                  {currentGlossaryItem.term}
                </span>
                <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                  darkMode ? 'bg-slate-700 text-emerald-300' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {currentGlossaryItem.category}
                </span>
              </div>
              
              <p className="text-sm font-medium leading-relaxed">
                {currentGlossaryItem.desc}
              </p>
            </div>
          )}
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
          <p className="font-bold">{t('inverter_tab.warning_title', isEn ? 'Important Notice:' : 'تنبيه هام:')}</p>
          <p className="opacity-90 leading-relaxed font-medium">
            {t('inverter_tab.warning_desc', isEn ? 'Always consult your inverter manual and verify voltage settings with your battery manufacturer before applying parameters.' : 'يرجى دائماً مراجعة كتيب الإنفرتر الخاص بك والتأكد من توافق قيم الجهود مع نوع بطاريتك قبل تطبيق الإعدادات.')}
          </p>
        </div>
      </div>
      
    </div>
  );
}