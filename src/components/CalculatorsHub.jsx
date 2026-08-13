import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Gauge, Sun, BatteryCharging, FileText, Plus, Trash2, RotateCcw} from 'lucide-react';

// 1. استيراد الحاسبات الفرعية من مصادرها الصحيحة
import { BatteryCalculator } from './BatteryCalculator'; 
import { SolarPanelsCalculator } from './SolarPanelsCalculator';
import { FinalReportTab } from './FinalReportTab';
// استيراد بيانات الإنفرترات من ملف البيانات
import invertersData from '../data/invertersData';

// استيراد مكون تبويب الإنفرتر
import { InverterSettingsTab } from './InverterSettingsTab';

export function CalculatorsHub({ 
  darkMode, 
  deviceList = [], 
  setDeviceList = () => {},
  currentLang,
  onBatteryConfigChange = () => {} // 👈 إعطاء قيمة افتراضية تمنع الـ ReferenceError
}) {

  const { t, i18n } = useTranslation();

  const activeLang = currentLang || i18n.language || 'ar';
  const isRtl = activeLang === 'ar';

  const [maxInverterWatt, setMaxInverterWatt] = useState(3000);

  // 🟢 حفظ تكوين البطارية للتقرير الشامل
const [batteryConfig, setBatteryConfig] = useState({});
const [inverterConfig, setInverterConfig] = useState(null);
const [panelsConfig, setPanelsConfig] = useState({});


// 🟢 الدالة المسؤولة عن استقبال التحديثات من BatteryCalculator
const handleBatteryConfigChange = (config) => {
  setBatteryConfig(config);
}

  
  const [hubTab, setHubTab] = useState('loads');
  const [deviceName, setDeviceName] = useState('');
  const [deviceWatt, setDeviceWatt] = useState('');
  const [deviceQty, setDeviceQty] = useState(1);
  const [deviceHours, setDeviceHours] = useState(8);
  const [selectedPreset, setSelectedPreset] = useState('custom');

  const PRESET_DEVICES = [
    { id: 'led', key: 'led', name: t('calculators_hub.presets.led', 'إضاءة LED'), watt: 10 },
    { id: 'tv', key: 'tv', name: t('calculators_hub.presets.tv', 'تلفزيون'), watt: 80 },
    { id: 'fan', key: 'fan', name: t('calculators_hub.presets.fan', 'مروحة'), watt: 60 },
    { id: 'fridge', key: 'fridge', name: t('calculators_hub.presets.fridge', 'ثلاجة'), watt: 150 },
    { id: 'freezer', key: 'freezer', name: t('calculators_hub.presets.freezer', 'فريزر'), watt: 200 },
    { id: 'ac_inverter', key: 'ac_inverter', name: t('calculators_hub.presets.ac_inverter', 'مكيف إنفرتر'), watt: 900 },
    { id: 'router', key: 'router', name: t('calculators_hub.presets.router', 'راوتر'), watt: 12 },
    { id: 'laptop', key: 'laptop', name: t('calculators_hub.presets.laptop', 'كمبيوتر محمول'), watt: 65 },
    { id: 'water_pump', key: 'water_pump', name: t('calculators_hub.presets.water_pump', 'مضخة ماء'), watt: 750 },
    { id: 'custom', key: 'custom', name: t('calculators_hub.presets.custom', 'جهاز مخصص'), watt: 0 }
  ];

  const handleDropdownChange = (e) => {
    const selectedVal = e.target.value;
    setSelectedPreset(selectedVal);

      const preset = PRESET_DEVICES.find(d => d.id === selectedVal);
    if (preset) {
      setDeviceName(preset.name);
      setDeviceWatt(preset.watt > 0 ? preset.watt.toString() : '');
    }
  };

  const handleAddDevice = () => {
    const w = parseFloat(deviceWatt) || 0;
    const q = parseInt(deviceQty) || 1;
    const h = parseFloat(deviceHours) || 0;

    if (!deviceName.trim() || w <= 0) {
      alert(t('calculators_hub.alerts.invalid_input', 'يرجى إدخال بيانات الجهاز بشكل صحيح'));
      return;
    }

    const foundPreset = PRESET_DEVICES.find(p => p.id === selectedPreset);

    const newItem = {
      id: Date.now(),
      key: foundPreset ? foundPreset.key : null,
      name: deviceName,
      watt: w,
      qty: q,
      hours: h,
    };

    setDeviceList(prev => [...prev, newItem]);
    setDeviceName('');
    setDeviceWatt('');
    setSelectedPreset('custom');
  };

  const handleDeleteDevice = (id) => {
    setDeviceList(prev => prev.filter(item => item.id !== id));
  };

  const handleClearTable = () => {
    setDeviceList([]);
  };

  const totalDailyWh = deviceList.reduce((acc, item) => acc + (item.watt * item.qty * item.hours), 0);
  const totalDailyKwh = (totalDailyWh / 1000).toFixed(2);

  const [batteryType, setBatteryType] = useState('lithium');
  const [systemVoltage, setSystemVoltage] = useState(24);
  const [singleBatteryVoltage, setSingleBatteryVoltage] = useState(12);
  const [singleBatteryAh, setSingleBatteryAh] = useState(200);

  const [selectedPanelPower, setSelectedPanelPower] = useState(550);

  return (
    <div className="space-y-6" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* 🔀 شريط التنقل */}
      <div className={`p-1.5 rounded-2xl flex gap-1.5 border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
        <button
          type="button"
          onClick={() => setHubTab('loads')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 ${
            hubTab === 'loads' ? 'bg-amber-500 text-slate-950 shadow-md' : darkMode ? 'text-slate-400' : 'text-slate-600'
          }`}
        >
          <Gauge className="w-3.5 h-3.5" />
          <span>{t('calculators_hub.tabs.loads', 'حاسبة الأحمال')}</span>
        </button>

        <button
          type="button"
          onClick={() => setHubTab('panels')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 ${
            hubTab === 'panels' ? 'bg-amber-600 text-white shadow-md' : darkMode ? 'text-slate-400' : 'text-slate-600'
          }`}
        >
          <Sun className="w-3.5 h-3.5" />
          <span>{t('calculators_hub.tabs.panels', 'حاسبة الألواح')}</span>
        </button>

        <button
          type="button"
          onClick={() => setHubTab('battery')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 ${
            hubTab === 'battery' ? 'bg-indigo-600 text-white shadow-md' : darkMode ? 'text-slate-400' : 'text-slate-600'
          }`}
        >
          <BatteryCharging className="w-3.5 h-3.5" />
          <span>{t('calculators_hub.tabs.batteries', 'حاسبة البطاريات')}</span>
        </button>

        <button
          type="button"
          onClick={() => setHubTab('report')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 ${
            hubTab === 'report' ? 'bg-emerald-600 text-white shadow-md' : darkMode ? 'text-slate-400' : 'text-slate-600'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>{t('calculators_hub.tabs.report', 'التقرير الشامل')}</span>
        </button>
      </div>

      {/* 1️⃣ تبويب الأحمال */}
      {hubTab === 'loads' && (
        <div className={`p-5 sm:p-6 rounded-2xl border shadow-sm space-y-6 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-amber-500/10 text-amber-500 rounded-xl">
                <Gauge className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base">{t('calculators_hub.loads.header_title', 'حاسبة الأحمال الكهربائية')}</h3>
                <p className="text-[11px] opacity-60">{t('calculators_hub.loads.header_subtitle', 'قم بإضافة الأجهزة لمعرفة الاستهلاك الكلي')}</p>
              </div>
            </div>
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md ${darkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-600'}`}>
              {t('calculators_hub.loads.step_tag', 'الخطوة 1')}
            </span>
          </div>

          {/* نموذج الإدخال */}
          <div className={`p-4 rounded-xl border space-y-4 ${darkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50/70 border-slate-200'}`}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold opacity-80 block">{t('calculators_hub.loads.select_preset_label', 'اختر جهازاً جاهزاً')}</label>
                <select
                  value={selectedPreset}
                  onChange={handleDropdownChange}
                  className={`w-full p-2.5 rounded-xl text-xs font-semibold border outline-none ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'}`}
                >
                  {PRESET_DEVICES.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} {item.watt > 0 ? `(${item.watt} W)` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold opacity-80 block">{t('calculators_hub.loads.device_name_label', 'اسم الجهاز')}</label>
                <input
                  type="text"
                  value={deviceName}
                  onChange={(e) => setDeviceName(e.target.value)}
                  placeholder={t('calculators_hub.loads.device_name_placeholder', 'أدخل اسم الجهاز')}
                  className={`w-full p-2.5 rounded-xl text-xs font-semibold border outline-none ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'}`}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold opacity-80 block">{t('calculators_hub.loads.watt_label', 'القدرة (واط)')}</label>
                <input
                  type="number"
                  value={deviceWatt}
                  onChange={(e) => setDeviceWatt(e.target.value)}
                  placeholder="150"
                  className={`w-full p-2.5 rounded-xl text-xs font-semibold border outline-none ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'}`}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold opacity-80 block">{t('calculators_hub.loads.qty_label', 'العدد')}</label>
                <input
                  type="number"
                  value={deviceQty}
                  onChange={(e) => setDeviceQty(e.target.value)}
                  placeholder="1"
                  className={`w-full p-2.5 rounded-xl text-xs font-semibold border outline-none ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'}`}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold opacity-80 block">{t('calculators_hub.loads.hours_label', 'الساعات')}</label>
                <input
                  type="number"
                  value={deviceHours}
                  onChange={(e) => setDeviceHours(e.target.value)}
                  placeholder="8"
                  className={`w-full p-2.5 rounded-xl text-xs font-semibold border outline-none ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'}`}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddDevice}
              className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>{t('calculators_hub.loads.add_button', 'إضافة الجهاز')}</span>
            </button>
          </div>

          {/* الجدول */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold opacity-90">📋 {t('calculators_hub.loads.table_title', 'قائمة الأجهزة المضافة')}</h4>
              {deviceList.length > 0 && (
                <button type="button" onClick={handleClearTable} className="text-[11px] font-bold text-rose-500 flex items-center gap-1">
                  <RotateCcw className="w-3 h-3" />
                  <span>{t('calculators_hub.loads.clear_table', 'تفريغ')}</span>
                </button>
              )}
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b opacity-70">
                    <th className="py-2 px-2 text-left">  {t('calculators_hub.table.col_name', 'Device Name')}</th>
                    <th className="py-2 px-2 text-center">{t('calculators_hub.table.col_watt', 'Power')}</th>
                    <th className="py-2 px-2 text-center">{t('calculators_hub.table.col_qty', 'Qty')}</th>
                    <th className="py-2 px-2 text-center">{t('calculators_hub.table.col_hours', 'Operating Hours')}</th>
                    <th className="py-2 px-2 text-center">{t('calculators_hub.table.col_consumption', 'Consumption')}</th>
                    <th className="py-2 px-2 text-center">{t('calculators_hub.table.col_action', 'Action')}</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${darkMode ? 'divide-slate-800' : 'divide-slate-100'}`}>
                  {deviceList.length > 0 ? (
                    deviceList.map((item) => {
                      const itemWh = item.watt * item.qty * item.hours;
                      const localizedName = item.key 
                        ? t(`calculators_hub.presets.${item.key}`, item.name) 
                        : item.name;

                      return (
                        <tr key={item.id}>
                          <td className={`p-3 font-bold ${isRtl ? 'text-right' : 'text-left'}`}>{localizedName}</td>
                          <td className="p-3 text-center font-semibold text-amber-500">{item.watt} {t('calculators_hub.units.watt_short', 'W')}</td>
                          <td className="p-3 text-center font-medium">{item.qty}</td>
                          <td className="p-3 text-center font-medium">{item.hours} {t('calculators_hub.units.hours_short', isRtl ? 'ساعة' : 'hrs')}</td>
                          <td className="p-3 text-center font-bold text-indigo-400">{itemWh.toLocaleString()} {t('calculators_hub.units.wh', 'Wh')}</td>
                          <td className="p-3 text-center">
                            <button type="button" onClick={() => handleDeleteDevice(item.id)} className="p-1 text-rose-500">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-slate-400">
                        {t('calculators_hub.table.empty_state', 'لا توجد أجهزة مضافة بعد')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* الإجمالي */}
          <div className={`p-4 rounded-xl border text-center ${darkMode ? 'bg-amber-500/10 border-amber-500/20 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-950'}`}>
            <span className="block text-xs font-bold opacity-80">{t('calculators_hub.loads.total_summary_label', 'إجمالي الاستهلاك اليومي المتوقع')}</span>
            <div className="flex items-baseline justify-center gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-black">{totalDailyWh.toLocaleString()}</span>
              <span className="text-xs font-bold">{t('calculators_hub.units.wh', 'Wh')}</span>
              <span className="text-xs opacity-60">({totalDailyKwh} {t('calculators_hub.units.kwh', 'kWh')})</span>
            </div>
          </div>
        </div>
      )}

      {/* 2️⃣ تبويب حاسبة الألواح */}
      {hubTab === 'panels' && (
        <SolarPanelsCalculator 
          darkMode={darkMode}
          totalDailyWh={totalDailyWh}
          currentLang={activeLang}
          panelPower={selectedPanelPower}
          onPanelPowerChange={setSelectedPanelPower}
        />
      )}

      {/* 3️⃣ تبويب حاسبة البطاريات */}
      {hubTab === 'battery' && (
        <BatteryCalculator 
          darkMode={darkMode}
          totalDailyWh={totalDailyWh}
          maxInverterWatt={maxInverterWatt}
          batteryType={batteryType}
          onBatteryTypeChange={setBatteryType}
          systemVoltage={systemVoltage}
          onSystemVoltageChange={setSystemVoltage}
          singleBatteryVoltage={singleBatteryVoltage}
          onSingleBatteryVoltageChange={setSingleBatteryVoltage}
          singleBatteryAh={singleBatteryAh}
          onSingleBatteryAhChange={setSingleBatteryAh}
          onBatteryConfigChange={handleBatteryConfigChange}
        />
      )}

      {/* 4️⃣ التقرير الشامل */}
      {hubTab === 'report' && (
        <FinalReportTab 
          darkMode={darkMode}
          deviceList={deviceList}
          totalDailyWh={totalDailyWh}
          panelsConfig={panelsConfig}
          batteryConfig={batteryConfig} // 👈 إرسال بيانات البطارية المخزنة للتقرير
          inverterConfig={inverterConfig}
        />
      )}

      {/* تبويب إعدادات الإنفرتر */}
      {hubTab === 'inverter' && (
        <InverterTab 
          darkMode={darkMode} 
          invertersData={invertersData} 
        />
      )}
    </div>
  );
}