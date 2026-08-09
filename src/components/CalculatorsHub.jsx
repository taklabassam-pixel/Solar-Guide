import React, { useState } from 'react';
import { 
  Gauge, 
  BatteryCharging, 
  Sun, 
  FileText, 
  Plus, 
  Trash2, 
  RotateCcw 
} from 'lucide-react';

import { BatteryCalculator } from '../main';
import { FinalReportTab } from '../components/FinalReportTab';
import {SolarPanelsCalculator } from '../components/SolarPanelsCalculator';

// ☀️ دالة حاسبة الألواح الشمسية
function SolarPanelCalculator({ darkMode, totalDailyWh }) {
  const [panelWatt, setPanelWatt] = useState('550'); // قدرة اللوح بالواط
  const [sunHours, setSunHours] = useState('5');     // ساعات ذروة الشمس
  const [systemLosses, setSystemLosses] = useState('1.3'); // معامل المفقودات (30%)

  const pWatt = parseFloat(panelWatt) || 550;
  const sHours = parseFloat(sunHours) || 5;
  const losses = parseFloat(systemLosses) || 1.3;

  // إجمالي الطاقة المطلوب إنتاجها مع المفقودات
  const requiredWhWithLosses = totalDailyWh * losses;
  
  // إنتاج اللوح الواحد يومياً
  const singlePanelDailyWh = pWatt * sHours;

  // عدد الألواح المطلوبة
  const panelsCount = singlePanelDailyWh > 0 
    ? Math.ceil(requiredWhWithLosses / singlePanelDailyWh) 
    : 0;

  // إجمالي قدرة المنظومة الكلية بالـ Wp و kWp
  const totalSystemWatt = panelsCount * pWatt;
  const totalSystemKwp = (totalSystemWatt / 1000).toFixed(2);

  return (
    <div className={`p-5 sm:p-6 rounded-2xl border shadow-sm space-y-6 transition-colors ${
      darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
    }`}>
      <div className={`flex items-center justify-between pb-4 border-b ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-amber-500/10 text-amber-500 rounded-xl">
            <Sun className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base">حاسبة الألواح الشمسية</h3>
            <p className="text-[11px] opacity-60">حساب عدد الألواح وقدرة المنظومة المطلوبة لتغطية استهلاكك</p>
          </div>
        </div>
        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md ${darkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-600'}`}>☀️ الألواح</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-bold opacity-80 block">قدرة اللوح الواحد (Wp):</label>
          <select
            value={panelWatt}
            onChange={(e) => setPanelWatt(e.target.value)}
            className={`w-full p-2.5 rounded-xl text-xs font-semibold border outline-none cursor-pointer ${
              darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'
            }`}
          >
            <option value="450">450 واط</option>
            <option value="550">550 واط (افتراضي)</option>
            <option value="585">585 واط</option>
            <option value="650">650 واط</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold opacity-80 block">ساعات ذروة الشمس (PSH):</label>
          <input
            type="number"
            value={sunHours}
            onChange={(e) => setSunHours(e.target.value)}
            step="0.5"
            min="1"
            max="10"
            className={`w-full p-2.5 rounded-xl text-xs font-semibold border outline-none ${
              darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'
            }`}
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold opacity-80 block">معامل كفاءة/مفقودات النظام:</label>
          <select
            value={systemLosses}
            onChange={(e) => setSystemLosses(e.target.value)}
            className={`w-full p-2.5 rounded-xl text-xs font-semibold border outline-none cursor-pointer ${
              darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'
            }`}
          >
            <option value="1.2">20% مفقودات (كفاءة عالية 80%)</option>
            <option value="1.3">30% مفقودات (قياسي 70%)</option>
            <option value="1.4">40% مفقودات (حرارة عالية/غبار)</option>
          </select>
        </div>
      </div>

      <div className={`p-4 rounded-xl border text-center space-y-2 ${darkMode ? 'bg-amber-500/10 border-amber-500/20 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-950'}`}>
        <span className="block text-xs font-bold opacity-80">عدد الألواح الشمسية المطلوبة:</span>
        <div className="flex items-baseline justify-center gap-2">
          <span className="text-3xl font-black">{panelsCount}</span>
          <span className="text-sm font-bold">لوح (قدرة {pWatt}W)</span>
          <span className="text-xs opacity-70">({totalSystemKwp} kWp إجمالي المنظومة)</span>
        </div>
      </div>
    </div>
  );
}

export function CalculatorsHub({ 
  darkMode, 
  deviceList = [], 
  setDeviceList = () => {} 
}) { 
  // 'loads' | 'battery' | 'report'
  const [hubTab, setHubTab] = useState('loads');

 // 📺 قائمة الأجهزة الشائعة للاختيار
  const PRESET_DEVICES = [
    { name: 'إضاءة LED', watt: 10 },
    { name: 'شاشة / تلفزيون', watt: 80 },
    { name: 'مروحة سقف / مكتب', watt: 60 },
    { name: 'ثلاجة منزلية', watt: 150 },
    { name: 'فريزر افقي', watt: 200 },
    { name: 'مكيف 1 طن (Inverter)', watt: 900 },
    { name: 'راوتر إنترنت', watt: 12 },
    { name: 'كمبيوتر محمول (Laptop)', watt: 65 },
    { name: 'مضخة ماء (1 حصان)', watt: 750 },
    { name: 'جهاز مخصص (يدوي)', watt: 0 }
  ];

  // حالات نموذج إضافة جهاز جديد
  const [selectedPreset, setSelectedPreset] = useState(PRESET_DEVICES[0].name);
  const [deviceName, setDeviceName] = useState(PRESET_DEVICES[0].name);
  const [deviceWatt, setDeviceWatt] = useState(PRESET_DEVICES[0].watt.toString());
  const [deviceQty, setDeviceQty] = useState('1');
  const [deviceHours, setDeviceHours] = useState('8');

  // عند تغيير خيار القائمة المنسدلة
  const handleDropdownChange = (e) => {
    const selectedName = e.target.value;
    setSelectedPreset(selectedName);

    const preset = PRESET_DEVICES.find(d => d.name === selectedName);
    if (preset) {
      setDeviceName(preset.name);
      setDeviceWatt(preset.watt > 0 ? preset.watt.toString() : '');
    }
  };

 

  // إضافة الجهاز للجدول
  const handleAddDevice = () => {
    const w = parseFloat(deviceWatt) || 0;
    const q = parseInt(deviceQty) || 1;
    const h = parseFloat(deviceHours) || 0;

    if (!deviceName.trim() || w <= 0) {
      alert('يرجى تأكيد اسم الجهاز وقدرة الواط بشكل صحيح.');
      return;
    }

    const newItem = {
      id: Date.now(),
      name: deviceName,
      watt: w,
      qty: q,
      hours: h,
    };

    setDeviceList([...deviceList, newItem]);
  };

  // حذف جهاز من الجدول
  const handleDeleteDevice = (id) => {
    setDeviceList(deviceList.filter(item => item.id !== id));
  };

  // تفريغ الجدول
  const handleClearTable = () => {
    setDeviceList([]);
  };
  
  // دالة تصدير الجدول إلى PDF
  const exportToPDF = async () => {
    const input = document.getElementById('devices-table-container');
    if (!input) return;

    if (typeof window.html2canvas === 'undefined' || typeof window.jspdf === 'undefined') {
      alert('مكتبات التصدير غير محملة.');
      return;
    }

    try {
      const canvas = await window.html2canvas(input, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 10, imgWidth, imgHeight);
      pdf.save('جدول_أجهزة_الطاقة_الشمسية.pdf');
    } catch (err) {
      console.error('خطأ أثناء تصدير PDF:', err);
    }
  };

  // حساب الإجمالي اليومي لجميع الأجهزة
  const totalDailyWh = deviceList.reduce((acc, item) => acc + (item.watt * item.qty * item.hours), 0);
  const totalDailyKwh = (totalDailyWh / 1000).toFixed(2);

  return (
    <div className="space-y-6" dir="rtl">
      
      {/* 🔀 شريط التنقل الداخلي */}
<div className={`p-1.5 rounded-2xl flex gap-1.5 border transition-colors ${
  darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
}`}>
  {/* زر حاسبة الأحمال */}
  <button
    type="button"
    onClick={() => setHubTab('loads')}
    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
      hubTab === 'loads'
        ? 'bg-amber-500 text-slate-950 shadow-md'
        : darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
    }`}
  >
    <Gauge className="w-3.5 h-3.5" />
    <span>حاسبة الأحمال</span>
  </button>

  {/* ☀️ زر حاسبة الألواح الشمسية المعادة */}
  <button
    type="button"
    onClick={() => setHubTab('panels')}
    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
      hubTab === 'panels'
        ? 'bg-amber-600 text-white shadow-md'
        : darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
    }`}
  >
    <Sun className="w-3.5 h-3.5" />
    <span>حاسبة الألواح</span>
  </button>

      {/* زر حاسبة البطاريات */}
      <button
        type="button"
        onClick={() => setHubTab('battery')}
        className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
          hubTab === 'battery'
            ? 'bg-indigo-600 text-white shadow-md'
            : darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        <BatteryCharging className="w-3.5 h-3.5" />
        <span>حاسبة البطاريات</span>
      </button>

      {/* زر التقرير الشامل */}
      <button
        type="button"
        onClick={() => setHubTab('report')}
        className={`group flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
          hubTab === 'report'
            ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-md'
            : darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        <FileText className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1 shrink-0" />
        <span>التقرير الشامل</span>
      </button>
    </div>

      {/* 1️⃣ حاسبة الأحمال */}
      {hubTab === 'loads' && (
        <div className={`p-5 sm:p-6 rounded-2xl border shadow-sm space-y-6 transition-colors ${
          darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className={`flex items-center justify-between pb-4 border-b ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-amber-500/10 text-amber-500 rounded-xl">
                <Gauge className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base">حاسبة الأحمال والإنتاج اليومي</h3>
                <p className="text-[11px] opacity-60">اختر الجهاز، حدد الكمية وساعات التشغيل، ثم اضغط إضافة للجدول</p>
              </div>
            </div>
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md ${darkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-600'}`}>1️⃣ الاستهلاك</span>
          </div>

          {/* نموذج الإدخال */}
          <div className={`p-4 rounded-xl border space-y-4 ${
            darkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50/70 border-slate-200'
          }`}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold opacity-80 block">1. اختر الجهاز من القائمة:</label>
                <select
                  value={selectedPreset}
                  onChange={handleDropdownChange}
                  className={`w-full p-2.5 rounded-xl text-xs font-semibold border outline-none cursor-pointer ${
                    darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'
                  }`}
                >
                  {PRESET_DEVICES.map((item, idx) => (
                    <option key={idx} value={item.name}>
                      {item.name} {item.watt > 0 ? `(${item.watt} واط)` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold opacity-80 block">اسم الجهاز في الجدول:</label>
                <input
                  type="text"
                  value={deviceName}
                  onChange={(e) => setDeviceName(e.target.value)}
                  placeholder="مثال: تلفزيون الصالة"
                  className={`w-full p-2.5 rounded-xl text-xs font-semibold border outline-none ${
                    darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'
                  }`}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold opacity-80 block">القدرة (واط - W):</label>
                <input
                  type="number"
                  value={deviceWatt}
                  onChange={(e) => setDeviceWatt(e.target.value)}
                  placeholder="150"
                  className={`w-full p-2.5 rounded-xl text-xs font-semibold border outline-none ${
                    darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'
                  }`}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold opacity-80 block">العدد:</label>
                <input
                  type="number"
                  value={deviceQty}
                  onChange={(e) => setDeviceQty(e.target.value)}
                  placeholder="1"
                  className={`w-full p-2.5 rounded-xl text-xs font-semibold border outline-none ${
                    darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'
                  }`}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold opacity-80 block">ساعات التشغيل:</label>
                <input
                  type="number"
                  value={deviceHours}
                  onChange={(e) => setDeviceHours(e.target.value)}
                  placeholder="8"
                  className={`w-full p-2.5 rounded-xl text-xs font-semibold border outline-none ${
                    darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'
                  }`}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddDevice}
              className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>إضافة الجهاز إلى الجدول</span>
            </button>
          </div>

          {/* جدول الأجهزة المضافة */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <h4 className="text-xs font-bold opacity-90 flex items-center gap-1.5">
                <span>📋 الأجهزة المضافة</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-500 text-[10px]">
                  {deviceList.length} أجهزة
                </span>
              </h4>

              {deviceList.length > 0 && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={exportToPDF}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>تصدير PDF</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleClearTable}
                    className="text-[11px] font-bold text-rose-500 hover:bg-rose-500/10 px-2 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>مسح الجدول</span>
                  </button>
                </div>
              )}
            </div>

            <div id="devices-table-container" className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-right text-xs">
                <thead className={`text-[11px] font-extrabold border-b ${
                  darkMode ? 'bg-slate-800/80 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                }`}>
                  <tr>
                    <th className="p-3">اسم الجهاز</th>
                    <th className="p-3 text-center">القدرة (واط)</th>
                    <th className="p-3 text-center">العدد</th>
                    <th className="p-3 text-center">ساعات التشغيل</th>
                    <th className="p-3 text-center">الاستهلاك (Wh)</th>
                    <th className="p-3 text-center">إجراء</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${darkMode ? 'divide-slate-800' : 'divide-slate-100'}`}>
                  {deviceList.length > 0 ? (
                    deviceList.map((item) => {
                      const itemWh = item.watt * item.qty * item.hours;
                      return (
                        <tr key={item.id} className={`transition-colors ${
                          darkMode ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'
                        }`}>
                          <td className="p-3 font-bold">{item.name}</td>
                          <td className="p-3 text-center font-semibold text-amber-500">{item.watt} W</td>
                          <td className="p-3 text-center font-medium">{item.qty}</td>
                          <td className="p-3 text-center font-medium">{item.hours} ساعة</td>
                          <td className="p-3 text-center font-bold text-indigo-400">{itemWh.toLocaleString()} Wh</td>
                          <td className="p-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleDeleteDevice(item.id)}
                              className="p-1 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                              title="حذف الجهاز"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-slate-400 font-medium">
                        لم يتم إضافة أي أجهزة بعد. قم بإضافة أجهزة من الأعلى لحساب أحمالك.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* إجمالي الاستهلاك */}
          <div className={`p-4 rounded-xl border text-center ${darkMode ? 'bg-amber-500/10 border-amber-500/20 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-950'}`}>
            <span className="block text-xs font-bold opacity-80">إجمالي الطاقة اليومية المطلوبة لكافة الأجهزة:</span>
            <div className="flex items-baseline justify-center gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-black">{totalDailyWh.toLocaleString()}</span>
              <span className="text-xs font-bold">واط.ساعة (Wh)</span>
              <span className="text-xs opacity-60">({totalDailyKwh} kWh)</span>
            </div>
          </div>
        </div>
      )}

    
      {/* ☀️ حاسبة الألواح الشمسية */}
      {hubTab === 'panels' && (
        <SolarPanelCalculator darkMode={darkMode} totalDailyWh={totalDailyWh} />
      )}

      {/* 2️⃣ حاسبة البطاريات */}
      {hubTab === 'battery' && (
        <BatteryCalculator darkMode={darkMode} totalDailyWh={totalDailyWh} />
      )}

      {/* 3️⃣ التقرير الشامل */}
      {hubTab === 'report' && (
        <FinalReportTab 
          darkMode={darkMode}
          deviceList={deviceList}
          inverterBrand="SolarFlow Pro (Hybrid)"
        />
      )}

    </div>
  );
}