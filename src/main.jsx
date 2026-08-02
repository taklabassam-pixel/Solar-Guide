import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import { 
  Zap, Calculator, Battery, Sun, Moon, Wrench, Settings, 
  ChevronLeft, Gauge, Cpu, Activity, ChevronDown, ChevronUp, BatteryCharging,
  Plus, Trash2, RotateCcw, GitMerge, Lightbulb, AlertTriangle, CheckCircle2,
  Search, Check, FileText
} from 'lucide-react';
import './index.css';
 
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// 🔌 استيراد قاعدة بيانات الإنفرترات المحدثة
import { invertersData } from './data/invertersData';
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

// ملاحظة: تم إزالة INVERTER_PRESETS والاعتماد المباشر على invertersData
// ==========================================
// 🔋 مكوّن حاسبة البطاريات والأسلاك والقاطع المحدث
// ==========================================
function BatteryCalculator({ darkMode, totalDailyWh, maxInverterWatt = 3000 }) {
  const [systemVoltage, setSystemVoltage] = useState(24);
  const [batteryType, setBatteryType] = useState('lithium');
  const [singleBatteryAh, setSingleBatteryAh] = useState(200); // سعة البطارية الواحدة
  const [singleBatteryVoltage, setSingleBatteryVoltage] = useState(12); // فولتية البطارية الواحدة
  
  // مدخلات إضافية لحاسبة السلك والقاطع
  const [cableLength, setCableLength] = useState(2); // الطول بالمتر (بين البطارية والانفرتر)

  // 1. تحديد عمق التفريغ (DoD) واسم النوع
  let dod = 0.85;
  let batteryTypeName = 'ليثيوم (LiFePO4)';

  if (batteryType === 'acid') {
    dod = 0.50;
    batteryTypeName = 'أسيد سائل (Flooded Lead-Acid)';
  } else if (batteryType === 'gel') {
    dod = 0.50;
    batteryTypeName = 'جل / AGM';
  }

  // 2. الحسابات الأساسية للبطاريات
  const requiredTotalAh = totalDailyWh > 0 ? Math.ceil(totalDailyWh / (systemVoltage * dod)) : 0;
  const seriesCount = Math.max(1, Math.round(systemVoltage / singleBatteryVoltage));
  const requiredParallel = requiredTotalAh > 0 ? Math.ceil(requiredTotalAh / singleBatteryAh) : 0;
  const totalBatteries = requiredTotalAh > 0 ? seriesCount * requiredParallel : 0;

  // طريقة التوصيل
  let connectionMethod = 'لا يلزم توصيل (بطارية واحدة تكفي)';
  if (totalBatteries > 1) {
    if (seriesCount > 1 && requiredParallel > 1) {
      connectionMethod = `توصيل مختلط: توالي وتوازي (${seriesCount} على التوالي × ${requiredParallel} سلاسل على التوازي)`;
    } else if (seriesCount > 1) {
      connectionMethod = `ربط على التوالي فقط (${seriesCount} بطاريات على التوالي لرفع الجهد إلى ${systemVoltage}V)`;
    } else {
      connectionMethod = `ربط على التوازي فقط (${requiredParallel} بطاريات على التوازي لزيادة السعة مع الحفاظ على ${systemVoltage}V)`;
    }
  }

  // 3. حسابات القاطع والأسلاك (DC Cable & Breaker Calculator)
  // افتراض قدرة الحمل الأقصى أو قدرة الانفرتر (بالواط)
  const estimatedPowerWatt = maxInverterWatt || (totalDailyWh > 0 ? Math.min(totalDailyWh / 4, 5000) : 2000);
  
  // أقصى تيار مستمر (مع كفاءة الانفرتر ~85%)
  const maxCurrentAmp = Math.round(estimatedPowerWatt / (systemVoltage * 0.85));
  
  // القاطع المناسب (مع عامل أمان 125%)
  const recommendedBreakerAmp = Math.ceil((maxCurrentAmp * 1.25) / 10) * 10; // تدوير لأقرب 10A

  // حساب مساحة مقطع السلك (مم²) بناءً على الجهد والمستافة وهبوط الجهد المقبول (< 2%)
  // القانون: Area = (2 * L * I * 0.0178) / Vdrop
  const allowedVdrop = systemVoltage * 0.02; // 2% هبوط جهد
  const calculatedRawmm2 = (2 * cableLength * maxCurrentAmp * 0.0178) / allowedVdrop;

  // اختيار أقرب مقاس سلك قياسي متوفر بالسوق
  const standardCableSizes = [4, 6, 10, 16, 25, 35, 50, 70, 95, 120];
  const recommendedCableSize = standardCableSizes.find(size => size >= calculatedRawmm2) || 120;

  return (
    <div className={`p-4 sm:p-6 rounded-2xl border transition-colors space-y-5 ${
      darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
    }`}>
      {/* الهيدر */}
      <div className="flex items-center gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="p-2.5 bg-indigo-500/10 text-indigo-500 rounded-xl">
          <BatteryCharging className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-sm sm:text-base font-extrabold">حاسبة البطاريات، القاطع، والأسلاك</h2>
          <p className="text-[11px] opacity-60">حساب السعة، التوصيل، مقاس كابل DC والقاطع الحامي</p>
        </div>
      </div>

      {totalDailyWh > 0 ? (
        <div className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
          darkMode ? 'bg-indigo-950/40 border-indigo-800/60 text-indigo-300' : 'bg-indigo-50 border-indigo-200 text-indigo-900'
        }`}>
          <span>🔗 الاستهلاك اليومي المعتمد:</span>
          <span className="font-extrabold text-amber-500 text-sm">{Math.round(totalDailyWh).toLocaleString()} Wh</span>
        </div>
      ) : (
        <p className="text-xs text-amber-500 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20">
          💡 أضف بعض الأجهزة أولاً لتنفيذ الحسابات تلقائياً.
        </p>
      )}

      {/* مدخلات البطاريات */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        
        {/* 1. نوع البطارية */}
        <div className="space-y-1">
          <label className="text-xs font-bold opacity-80 block">نوع البطارية:</label>
          <select 
            value={batteryType} 
            onChange={(e) => setBatteryType(e.target.value)}
            className={`w-full p-2.5 rounded-xl text-xs font-semibold border outline-none cursor-pointer ${
              darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}
          >
            <option value="lithium">ليثيوم LiFePO4 (تفريغ 85%)</option>
            <option value="acid">أسيد سائل - Flooded (تفريغ 50%)</option>
            <option value="gel">جل / AGM (تفريغ 50%)</option>
          </select>
        </div>

        {/* فولتية النظام */}
        <div className="space-y-1">
          <label className="text-xs font-bold opacity-80 block">فولتية النظام (System V):</label>
          <select 
            value={systemVoltage} 
            onChange={(e) => setSystemVoltage(Number(e.target.value))}
            className={`w-full p-2.5 rounded-xl text-xs font-semibold border outline-none cursor-pointer ${
              darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}
          >
            <option value={12}>12V (أنظمة صغيرة)</option>
            <option value={24}>24V (متوسطة - موصى بها)</option>
            <option value={48}>48V (أنظمة كبيرة / منازل)</option>
          </select>
        </div>

        {/* فولتية البطارية الواحدة */}
        <div className="space-y-1">
          <label className="text-xs font-bold opacity-80 block">فولتية البطارية الواحدة:</label>
          <select 
            value={singleBatteryVoltage} 
            onChange={(e) => setSingleBatteryVoltage(Number(e.target.value))}
            className={`w-full p-2.5 rounded-xl text-xs font-semibold border outline-none cursor-pointer ${
              darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}
          >
            <option value={12}>12V (الشائعة)</option>
            <option value={24}>24V</option>
            <option value={48}>48V (جدارية)</option>
            <option value={2}>2V (خلايا صناعية)</option>
          </select>
        </div>

        {/* سعة البطارية الواحدة */}
        <div className="space-y-1">
          <label className="text-xs font-bold opacity-80 block">سعة البطارية الواحدة (Ah):</label>
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
          <label className="text-xs font-bold opacity-80 block">المسافة بين البطاريات والانفرتر (متر):</label>
          <input 
            type="number"
            min="0.5"
            step="0.5"
            value={cableLength}
            onChange={(e) => setCableLength(Math.max(0.5, Number(e.target.value)))}
            placeholder="مثال: 1.5 أو 2"
            className={`w-full p-2.5 rounded-xl text-xs font-semibold border outline-none ${
              darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}
          />
        </div>

      </div>

      {/* 📊 ملخص نتائج بنك البطاريات */}
      <div className={`p-4 rounded-xl border space-y-4 ${
        darkMode ? 'bg-slate-950 border-indigo-500/30' : 'bg-indigo-50/40 border-indigo-200'
      }`}>
        <h3 className="text-xs font-extrabold text-indigo-500 flex items-center gap-1.5 border-b pb-2 dark:border-slate-800 border-indigo-100">
          <Battery className="w-4 h-4" />
          📊 تفاصيل بنك البطاريات المطلوب
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className={`p-3 rounded-xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <span className="text-[10px] font-bold opacity-70 block mb-1">1️⃣ نوع البطارية</span>
            <span className="text-xs font-extrabold text-indigo-400 block">{batteryTypeName}</span>
          </div>

          <div className={`p-3 rounded-xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <span className="text-[10px] font-bold opacity-70 block mb-1">2️⃣ عدد البطاريات</span>
            <span className="text-lg font-black text-amber-500 block">{totalBatteries} <span className="text-xs font-normal">بطارية</span></span>
          </div>

          <div className={`p-3 rounded-xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <span className="text-[10px] font-bold opacity-70 block mb-1">3️⃣ السعة الكلية</span>
            <span className="text-xs font-extrabold text-emerald-400 block">{requiredTotalAh} Ah</span>
          </div>

          <div className={`p-3 rounded-xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <span className="text-[10px] font-bold opacity-70 block mb-1">4️⃣ جهد النظام</span>
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
            <span className="text-xs font-extrabold block mb-0.5">5️⃣ طريقة التوصيل المقترحة:</span>
            <p className="text-xs font-medium leading-relaxed opacity-90">{connectionMethod}</p>
          </div>
        </div>
      </div>

      {/* 🔌 ⚡ قسم ملحقات الحماية والأسلاك المدمج */}
      <div className={`p-4 rounded-xl border space-y-4 ${
        darkMode ? 'bg-slate-950 border-amber-500/30' : 'bg-amber-50/30 border-amber-200'
      }`}>
        <h3 className="text-xs font-extrabold text-amber-500 flex items-center gap-1.5 border-b pb-2 dark:border-slate-800 border-amber-100">
          <Zap className="w-4 h-4" />
          ⚡ مواصفات الأسلاك والقاطع بين البطاريات والانفرتر
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
          
          {/* التيار الأقصى */}
          <div className={`p-3 rounded-xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <span className="text-[10px] font-bold opacity-70 block mb-1">🔌 التيار المستمر الأقصى</span>
            <span className="text-sm font-extrabold text-slate-300 block">{maxCurrentAmp} A</span>
            <span className="text-[9px] opacity-60">(عند أقصى سحب للانفرتر)</span>
          </div>

          {/* القاطع المطلوب */}
          <div className={`p-3 rounded-xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <span className="text-[10px] font-bold opacity-70 block mb-1">🛡️ القاطع المطلوب (DC)</span>
            <span className="text-base font-black text-rose-500 block">{recommendedBreakerAmp} A (DC)</span>
            <span className="text-[9px] opacity-60">(قاطع مستمر للبطاريات)</span>
          </div>

          {/* مقاس السلك */}
          <div className={`p-3 rounded-xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <span className="text-[10px] font-bold opacity-70 block mb-1">📐 مقاس الكابل الأدنى</span>
            <span className="text-base font-black text-amber-400 block">{recommendedCableSize} mm²</span>
            <span className="text-[9px] opacity-60">(نحاس / لمسافة {cableLength} متر)</span>
          </div>

        </div>

        <p className="text-[10px] opacity-70 text-center">
          ⚠️ **تنبيه سلامة:** تأكد من استخدام قاطع يدعم **التيار المستمر (DC Breaker)** وليس التيار المتردد (AC)، مع استخدام كابلات نحاسية معزولة مخصصة للبطاريات.
        </p>
      </div>

    </div>
  );
}
// ==========================================
// 🏢 المكوّن الجامع لمركز الحاسبات (Calculators Hub)
// ==========================================
function CalculatorsHub({ 
  darkMode, deviceList, setDeviceList
 }) { 
  const COMMON_PANEL_WATTAGES = [50, 100, 150, 200, 300, 350, 400, 450, 540, 580, 650];
  const [hubTab, setHubTab] = useState('loads');

 
  const [activeTab, setActiveTab] = useState('inverter'); // 'loads' | 'panels' | 'inverter'  //
  
  //  ☀️ 1. حالات حاسبة الألواح الجديدة (داخلية)
  const [dailyConsumption, setDailyConsumption] = useState('');
  const [panelPower, setPanelPower] = useState('550');

  // ☀️ 2. حساب نتائج الألواح تلقائياً
  const panelResults = useMemo(() => {
    const consumption = parseFloat(dailyConsumption) || 0;
    const singlePanelWatt = parseFloat(panelPower) || 1;
    const sunHours = 4.5; // معدل ساعات الشمس الفعلية

    if (consumption <= 0) {
      return { totalPowerNeeded: '0 W', panelsCount: '0 ألواح', note: null };
    }

    const totalWattsNeeded = Math.ceil((consumption / sunHours) * 1.3);
    const count = Math.ceil(totalWattsNeeded / singlePanelWatt);

    return {
      totalPowerNeeded: `${totalWattsNeeded} W`,
      panelsCount: `${count} ألواح`,
      note: `تستند الحسابات إلى معدل ${sunHours} ساعات شمس فعلياً مع نسبة فقد كفاءة 30%.`
    };
  }, [dailyConsumption, panelPower]);

  // حالات النموذج لإضافة جهاز جديد
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

    const canvas = await html2canvas(input, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210; // عرض صفحة A4 بالمليمتر
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    pdf.addImage(imgData, 'PNG', 0, 10, imgWidth, imgHeight);
    pdf.save('جدول_أجهزة_الطاقة_الشمسية.pdf');
  };

  // حساب الإجمالي اليومي لجميع الأجهزة بالـ Wh و kWh
  const totalDailyWh = deviceList.reduce((acc, item) => acc + (item.watt * item.qty * item.hours), 0);
  const totalDailyKwh = (totalDailyWh / 1000).toFixed(2);

  return (
    <div className="space-y-6">
      
      {/* شريط التنقل الداخلي */}
      <div className={`p-1.5 rounded-2xl flex gap-1.5 border transition-colors ${
        darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <button
          onClick={() => setHubTab('loads')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            hubTab === 'loads'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Gauge className="w-3.5 h-3.5" />
          حاسبة الأحمال
        </button>

        <button
          onClick={() => setHubTab('battery')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            hubTab === 'battery'
              ? 'bg-indigo-600 text-white shadow-md'
              : darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BatteryCharging className="w-3.5 h-3.5" />
          حاسبة البطاريات
        </button>

        <button
          onClick={() => setHubTab('wires')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            hubTab === 'wires'
              ? 'bg-rose-600 text-white shadow-md'
              : darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Wrench className="w-3.5 h-3.5" />
          حاسبة الألواح الشمسية
        </button>
      </div>

      {/* 1. حاسبة الأحمال بقائمة منسدلة وجدول تفاعلي */}
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

          {/* 📋 نموذج إدخال الجهاز */}
          <div className={`p-4 rounded-xl border space-y-4 ${
            darkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50/70 border-slate-200'
          }`}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              {/* القائمة المنسدلة */}
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

              {/* اسم الجهاز */}
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
              {/* قدرة السحب */}
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

              {/* العدد */}
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

              {/* ساعات التشغيل */}
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
              onClick={handleAddDevice}
              className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              إضافة الجهاز إلى الجدول
            </button>
          </div>

          {/* 📊 جدول الأجهزة المضافة */}
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
        {/* 📥 زر تصدير PDF */}
        <button
          onClick={exportToPDF}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>تصدير PDF</span>
        </button>

        {/* 🔄 زر مسح الجدول */}
        <button
          onClick={handleClearTable}
          className="text-[11px] font-bold text-rose-500 hover:bg-rose-500/10 px-2 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          <span>مسح الجدول</span>
        </button>
      </div>
    )}
  </div>

  {/* حاوية الجدول المخصصة للتصدير */}
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

          {/* 💰 إجمالي الاستهلاك اليومي */}
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

      {/* 2. حاسبة البطاريات المحدثة */}
      {hubTab === 'battery' && (
        <BatteryCalculator darkMode={darkMode} totalDailyWh={totalDailyWh} />
      )}

     {/* 3. حاسبة الألواح الشمسية */}
      {hubTab === 'wires' && (
        <div className={`p-5 sm:p-6 rounded-2xl border shadow-sm space-y-5 transition-colors ${
          darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className={`flex items-center justify-between pb-4 border-b ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-amber-500/10 text-amber-500 rounded-xl">
                <Sun className="w-5 h-5" />
              </div>
              <h3 className="font-bold 18px">حاسبة الألواح الشمسية</h3>
            </div>
            <span className={`text-[15px] font-bold px-2 py-1 rounded-md ${darkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-600'}`}>☀️ التوليد</span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold mb-1.5 opacity-80">إجمالي الاستهلاك اليومي (وات/ساعة - Wh):</label>
              <input 
                type="number" 
                value={dailyConsumption}
                onChange={(e) => setDailyConsumption(e.target.value)}
                placeholder="مثال: 5000" 
                className={`w-full p-3 rounded-xl text-sm font-semibold border outline-none transition-all ${
                  darkMode ? 'bg-slate-800/80 border-slate-700 text-white focus:border-amber-500' : 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:ring-2 focus:ring-amber-500'
                }`}
              />
            </div>

            </div>

         <div className="mb-3">
        <label htmlFor="panelPower" className="form-label">
          قدرة اللوح الواحد (واط - Watt):
        </label>
       <select 
          id="panelPower"
          value={panelPower || ''} 
          onChange={(e) => setPanelPower(Number(e.target.value))}
          className="form-control form-select"
          style={{
            color: '#0d6efd', // 👈 تغيير لون النص/الرقم هنا (مثال: أزرق)
            fontWeight: 'bold', // يجعل الرقم عريضاً إذا أردت
            backgroundPosition: 'left 0.75rem center',
            textAlign: 'right'
          }}
        >
          <option value="">اختر قدرة اللوح...</option>
          {(COMMON_PANEL_WATTAGES || [100, 150, 200, 250, 300, 350, 400, 450, 500, 540, 550, 580, 650]).map((watt) => (
            <option key={watt} value={watt}>
              {watt}
            </option>
          ))}
        </select>
      </div>
          <div className="space-y-2 pt-2">
            <div className="grid grid-cols-2 gap-2">
              <div className={`p-3 rounded-xl border ${darkMode ? 'bg-amber-500/10 border-amber-500/20 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-950'}`}>
                <span className="block text-[11px] font-bold opacity-80">القدرة المطلوبة الكلية:</span>
                <span className="text-base font-extrabold">{panelResults.totalPowerNeeded}</span>
              </div>

              <div className={`p-3 rounded-xl border ${darkMode ? 'bg-sky-500/10 border-sky-500/20 text-sky-300' : 'bg-sky-50 border-sky-200 text-sky-950'}`}>
                <span className="block text-[11px] font-bold opacity-80">عدد الألواح المقترح:</span>
                <span className="text-base font-extrabold">{panelResults.panelsCount}</span>
              </div>
            </div>
            {panelResults.note && (
              <p className="text-[11px] text-amber-500 font-medium p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                💡 {panelResults.note}
              </p>
            )}

          </div>
        </div>
        )}
      
    
      </div>
      
)}
// ==========================================
// ⚙️ 3️⃣ مكوّن ضبط الإنفرتر (مع نقل قائمة المصطلحات فوق كرت المصطلح المختار)
// ==========================================
function InverterTab({ darkMode }) {
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

  // 📖 بيانات دليل المصطلحات والرموز
  const glossaryData = [
    { id: 'SBU', term: 'SBU (Solar-Battery-Utility)', category: 'Output Priority', desc: 'أولوية تغذية الأحمال: يبدأ بالطاقة الشمسية، ثم البطارية، وعند انخفاض الجهد للمستوى المحدد يتحول للشبكة أو المولد تلقائياً لحماية النظام من الانقطاع.' },
    { id: 'SUB', term: 'SUB (Solar-Utility-Battery)', category: 'Output Priority', desc: 'أولوية تغذية الأحمال: الألواح الشمسية أولاً، ثم يدعمها بالشبكة مباشرة لتعويض أي نقص، وتكون البطارية للطوارئ فقط عند انقطاع الكهرباء.' },
    { id: 'SOL', term: 'SOL / Utility Priority', category: 'Output Priority', desc: 'توفير الطاقة عبر الاعتماد على الألواح نهاراً واستخدام الكهرباء/المولد كمصدر مساعد بديل عن استنزاف دورات البطارية.' },
    { id: 'BULK', term: 'Bulk / C.V Voltage', category: 'Battery Charging', desc: 'جهد الشحن الثابت (الامتصاص): الجهد الأعلى الذي يصل إليه الشاحن لملء البطارية بسعة كاملة حتى 80-90% قبل الانتقال لجهد العائم.' },
    { id: 'FLOAT', term: 'Float Voltage', category: 'Battery Charging', desc: 'جهد الشحن العائم: جهد منخفض مستمر يُحافظ على البطارية مشحونة بنسبة 100% دون إتلاف الخلايا أو رفع حرارتها.' },
    { 
      id: 'CUTOFF', 
      term: 'Low DC Cut-off', 
      category: 'Protection', 
      desc: 'جهد القطع النهائي: مستوى الجهد الذي يطفي عنده الإنفرتر نفسه لحماية البطارية من التفريغ العميق الذي يسارع في تلف البطارية. في بطاريات الليثيوم أيون يتراوح بين 9.0V إلى 10.0V لمنظومات الـ 12 فولت. وفي البطاريات الحمضية ضبط الشاحن ليصل إلى 10.5V تحت الحمل الحاد.' 
    },
    { id: 'BACK_UTILITY', term: 'Back to Utility', category: 'Grid Switch', desc: 'جهد التحويل للشركة: الجهد الذي عنده يقرر الإنفرتر الانتقال للتغذية من الشبكة أو المولد عند تفريغ البطارية للحفاظ على الجهد المطلوب.' },
    { id: 'BACK_BATTERY', term: 'Back to Battery', category: 'Grid Switch', desc: 'جهد العودة للبطارية: الجهد الذي عنده يعود الإنفرتر للعمل من البطارية بعد أن تكون قد شُحنت لمستوى آمن ومناسب للتشغيل.' },
    { id: 'BMS', term: 'BMS (Battery Management System)', category: 'Lithium Control', desc: 'نظام إدارة البطارية: العقل الإلكتروني داخل بطاريات الليثيوم الذي يحمي الخلايا، يوازن الجهد، ويتواصل مع الإنفرتر عبر بروتوكولات الاتصال.' },
    { id: 'ZERO_EXPORT', term: 'Zero Export', category: 'Hybrid Mode', desc: 'منع التصدير: خاصية تمنع ضخ أو تسريب أي طاقة زائدة من الألواح الشمسية إلى شبكة الكهرباء العامة حماية للمعدات والعدادات الذكية.' }
  ];

  // جلب بيانات الإنفرتر المحدد
  const currentInverter = useMemo(() => {
    return invertersData.find(p => p.id === selectedBrand) || invertersData[0];
  }, [selectedBrand]);

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
  }, [selectedTermId, glossarySearch]);

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
            <span>⚙️ 1. إعدادات الإنفرترات (اختر الماركة):</span>
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
            <label className={labelClass}>جهد النظام (DC Voltage):</label>
            <select 
              value={systemVoltage}
              disabled={activeMenu !== 'inverter'}
              onChange={(e) => setSystemVoltage(e.target.value)}
              className={selectClass}
            >
              <option value="12">12 فولت (12V)</option>
              <option value="24">24 فولت (24V)</option>
              <option value="48">48 فولت (48V)</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>نوع البطارية:</label>
            <select 
              value={batteryType}
              disabled={activeMenu !== 'inverter'}
              onChange={(e) => setBatteryType(e.target.value)}
              className={selectClass}
            >
              <option value="lithium">ليثيوم (Lithium / LiFePO4)</option>
              <option value="gel">أنبوبية / جيل (Tubular / Gel)</option>
              <option value="lead">حمضية / سائلة (Lead-Acid)</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>بحث في الإعدادات:</label>
            <input
              type="text"
              placeholder="ابحث برقم الكود أو الاسم..."
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
            <span>إظهار البرامترات الأساسية والهامة فقط ⭐</span>
          </label>
        </div>

        {/* 🎡 عرض البطاقة بدوران عمودي دائري */}
        {filteredSettings.length > 0 ? (
          <div className="max-w-xl mx-auto space-y-3">
            
            {/* 🔼 سهم التدوير للأعلى */}
            <div className="flex justify-center">
              <button
                onClick={handlePrev}
                title="البطاقة السابقة"
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
                        أساسي
                      </span>
                    )}
                  </div>
                  
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                    {currentItem.recommended || currentItem.value}
                  </span>
                </div>

                <div className="text-xs sm:text-sm leading-relaxed font-medium space-y-1">
                  <span className="text-slate-400 font-bold block">الشرح والإرشاد:</span>
                  <p className={darkMode ? 'text-slate-200' : 'text-slate-700'}>
                    {currentItem.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/40 flex items-center justify-between text-[11px] font-mono opacity-70">
                  <span>الدوران العمودي 🔄</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {currentIndex + 1} من {filteredSettings.length}
                  </span>
                </div>
              </div>
            </div>

            {/* 🔽 سهم التدوير للأسفل */}
            <div className="flex justify-center">
              <button
                onClick={handleNext}
                title="البطاقة التالية"
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
            لا توجد نتائج تطابق خيارات البحث الحالية.
          </div>
        )}
      </div>

      <hr className={darkMode ? 'border-slate-800' : 'border-slate-200'} />

      {/* ========================================== */}
      {/* 📖 القسم الثاني: دليل المصطلحات (تم نقله إلى هنا) */}
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
            <span>📖 2. دليل المصطلحات والرموز (اختر مصطلحاً):</span>
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
            📖 شرح المصطلح المختار:
          </h3>
          <input
            type="text"
            placeholder="بحث سريع عن مصطلح..."
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
          <p className="font-bold">تنبيه هام عند الضبط والصيانة:</p>
          <p className="opacity-90 leading-relaxed font-medium">
            قم دائماً بتوصيل وتشغيل **مفتاح البطارية أولاً** قبل توصيل الألواح أو التيار المتناوب (AC). عند الإيقاف، افصل الألواح والكهرباء أولاً ثم البطارية.
          </p>
        </div>
      </div>

    </div>
  );
}
// ==========================================
// 🚀 المكوّن الرئيسي للمشروع (MainApp)
// ==========================================
function MainApp() {
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('tools'); 

  const [openSection, setOpenSection] = useState('terms'); 
  const [openTerm, setOpenTerm] = useState('power'); 

  // حالة قائمة الأجهزة المضافة للجدول
  const [deviceList, setDeviceList] = useState([
    { id: 1, name: 'ثلاجة منزلية', watt: 150, qty: 1, hours: 24 },
    { id: 2, name: 'إضاءة LED', watt: 10, qty: 5, hours: 6 },
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
    fallbackDiv.innerText = `🖼️ [صورة توضيحية: ${fallbackText}]`;
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
      lengthWarning = 'ينصح برفع القطر بمقدار درجات أعلى لتفادي هبوط الجهد بسبب الطول.';
    }

    return { gauge: `${mm2} mm²`, fuse: `${fuseAmp} A`, lengthWarning };
  };

  const wireResults = calculateWireAndFuse();

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${
      darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'
    }`} dir="rtl">
      
      {/* 🔝 الهيدر العلوي */}
      <header className={`border-b sticky top-0 z-50 backdrop-blur-md transition-colors duration-300 ${
        darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-200'
      }`}>
        <div className="max-w-4xl mx-auto px-4 py-3.5 relative flex items-center justify-between">
          
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border flex items-center gap-1.5 ${
            darkMode ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-600 border-emerald-200'
          }`}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            SFPro v1.0
          </span>

          <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2.5 group cursor-pointer">
            <div className="p-2 bg-gradient-to-tr from-amber-500 to-amber-300 rounded-xl shadow-md text-slate-950 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:scale-105">
              <Sun className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div className="text-center">
              <h1 className={`font-extrabold text-lg leading-tight transition-colors ${
                darkMode ? 'text-white' : 'text-slate-900'
              }`}>
                SolarFlow Pro
              </h1>
              <p className="text-[10px] text-amber-500 font-bold tracking-wide">الدليل الفني للطاقة الشمسية</p>
            </div>
          </div>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2.5 rounded-xl border transition-all duration-300 cursor-pointer flex items-center justify-center ${
              darkMode 
                ? 'bg-slate-800 text-amber-400 border-slate-700 hover:bg-slate-700' 
                : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
            }`}
            title="تبديل المظهر"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>

        {/* 🔀 شريط التبويبات الرئيسية */}
        <div className="max-w-4xl mx-auto px-4 pb-3">
          <div className={`p-1.5 rounded-2xl flex gap-1.5 border transition-colors ${
            darkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'
          }`}>
            
            <button
              onClick={() => setActiveTab('guide')}
              className={`group flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                activeTab === 'guide'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md'
                  : darkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Calculator className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1 shrink-0" />
              <span>دليل المفاهيم الأساسية</span>
            </button>

            <button
              onClick={() => setActiveTab('tools')}
              className={`group flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                activeTab === 'tools'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md'
                  : darkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Gauge className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1 shrink-0" />
              <span>مركز الحاسبات</span>
            </button>

            <button
              onClick={() => setActiveTab('inverter')}
              className={`group flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                activeTab === 'inverter'
                  ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-md'
                  : darkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Settings className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1 shrink-0" />
              <span>ضبط الإنفرتر</span>
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
        {/* هذا هو الجزء الخارجي - يجب أن يكون bg-amber-500 بدون أي container خارجي رمادي */}
        <div className="bg-amber-500 hover:bg-amber-600 rounded-2xl transition-colors duration-200 border-none shadow-none mb-3 overflow-hidden">
          <button
            onClick={() => toggleSection('terms')}
            className="group w-full py-3.5 px-4 flex items-center justify-between cursor-pointer text-white"
          >
            <div className="flex items-center gap-3">
              {/* أيقونة Zap بحجم مناسب 5x5 */}
              <div className="p-2 bg-white/20 rounded-xl transition-transform duration-200 group-hover:-translate-x-1">
                <Zap className="w-5 h-5 text-white" />
              </div>
              
              {/* الخط تم توحيده ليكون text-lg md:text-xl */}
              <span className="font-bold text-lg md:text-xl text-white">
                المفاهيم الكهربائية الأساسية
              </span>
            </div>

            {/* السهم الأبيض */}
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
                      <span className="font-bold text-sm transition-transform duration-200 group-hover:-translate-x-1">الجهد الكهربائي (Voltage - V)</span>
                      <span className="text-xs bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded-full">فولت (Volt)</span>
                    </button>
                    {openTerm === 'voltage' && (
                      <div className="p-4 border-t border-slate-200/40 dark:border-slate-700/60 space-y-3">
                        <div className={`p-2 rounded-lg border text-center ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
                          <img src="./assets/img/image_voltage.png" alt="الجهد" onError={(e) => handleImageError(e, "ضغط الفولتية ودفعه للشحنات")} className="max-h-48 mx-auto object-contain" />
                        </div>
                        <div className="space-y-2 text-xs sm:text-sm leading-relaxed opacity-90">
                          <p>
                              <strong>التشبيه الأساسي:</strong> يمثّل الجهد الكهربائي في الأسلاك ضغط  ضغط الماء داخل الأنابيب؛ كلما زاد الفولت زادت قوة دفع الشحنات عبر الموصلات.
                            </p>
                            <p className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-medium [&>strong]:text-emerald-600 dark:[&>strong]:text-emerald-400">
                              💡 <strong>تطبيق عملي (خطوط النقل):</strong> في شبكات نقل الكهرباء لمسافات طويلة، يُستخدم الجهد العالي جداً (High Voltage) لامتلاك القوة الكافية لدفع الشحنات الكهربائية عبر هذه المسافات الشاسعة وتقليل الضياع في الطاقة أثناء النقل.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                   {/* التيار */}
                  <div className={`rounded-xl border transition-colors ${darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                    <button onClick={() => toggleTerm('current')} className="group w-full p-3.5 flex items-center justify-between cursor-pointer">
                      <span className="font-bold text-sm transition-transform duration-200 group-hover:-translate-x-1">التيار الكهربائي (Current - A)</span>
                      <span className="text-xs bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded-full">أمبير (Ampere)</span>
                    </button>
                    {openTerm === 'current' && (
                      <div className="p-4 border-t border-slate-200/40 dark:border-slate-700/60 space-y-3">
                        <div className={`p-2 rounded-lg border text-center ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
                          <img src="./assets/img/image_current.png" alt="التيار" onError={(e) => handleImageError(e, "تدفق الشحنات الكهربائية")} className="max-h-48 mx-auto object-contain" />
                        </div>
                        <p className="text-xs sm:text-sm leading-relaxed opacity-90">
                          <strong>التشبيه:</strong> كمية الماء المتدفقة فعلياً في الثانية الواحدة داخل السلك.
                        </p>
                         <div className="p-3 bg-red-100/80 rounded-lg text-red-900 text-sm flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
                    <span><strong>قاعدة أمان:</strong> كلما زاد التيار (الأمبير)، احتجت لأسلاك ذات مقطع (أسمك) لتجنب الذوبان والحرائق.</span>
                  </div>
                      </div>
                    )}
                  </div>
                  
                  {/* القدرة */}
                  <div className={`rounded-xl border transition-colors ${darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                    <button onClick={() => toggleTerm('power')} className="group w-full p-3.5 flex items-center justify-between cursor-pointer">
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span className="font-bold text-sm transition-transform duration-200 group-hover:-translate-x-1">القدرة الكهربائية (Power - P)</span>
                      </div>
                      <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">واط (Watt)</span>
                    </button>
                    {openTerm === 'power' && (
                      <div className="p-4 border-t border-slate-200/40 dark:border-slate-700/60 space-y-3">
                        <div className={`p-2 rounded-lg border text-center ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
                          <img src="./assets/img/image_power.png" alt="القدرة الكهربائية" onError={(e) => handleImageError(e, "حاصل ضرب الجهد في التيار = الشغل المنجز")} className="max-h-48 mx-auto object-contain" />
                        </div>
                        <div className="space-y-2 text-xs sm:text-sm leading-relaxed opacity-90">
                          <p><strong>المفهوم:</strong> القدرة هي معدل استهلاك أو إنتاج الطاقة خلال الزمن (الشغل المنجز).</p>
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
                  <h2 className="text-lg sm:text-xl font-bold">أنواع البطاريات في الأنظمة الشمسية</h2>
                </div>
                <ChevronDown className={`w-6 h-6 transition-transform duration-300 ${openSection === 'batteries' ? 'rotate-180 text-blue-400' : 'text-slate-400'}`} />
              </button>

              {openSection === 'batteries' && (
                <div className="space-y-3 pr-2 pl-2 border-r-2 border-blue-500/50">

                  {/* Acid / Flooded Lead-Acid (بطارية الأسيد السائلة) */}
                  <div className={`border rounded-xl overflow-hidden transition-all duration-200 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                    <button 
                      onClick={() => toggleTerm('acid_battery')} 
                      className="w-full p-3.5 flex justify-between items-center hover:bg-slate-500/5 transition-colors text-right cursor-pointer select-none"
                      aria-expanded={openTerm === 'acid_battery'}
                    >
                      <div className="flex items-center gap-2.5 wrap sm:flex-nowrap">
                        <span className={`font-bold text-sm sm:text-base ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                          بطاريات الأسيد / الرصاص السائلة (Flooded Lead-Acid)
                        </span>
                        <span className="text-xs bg-amber-500/15 text-amber-600 dark:text-amber-400 font-semibold px-2.5 py-0.5 rounded-full border border-amber-500/20 whitespace-nowrap">
                          تتطلب صيانة
                        </span>
                      </div>
                      <ChevronDown className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-300 ease-in-out ${openTerm === 'acid_battery' ? 'rotate-180' : ''}`} />
                    </button>

                    {openTerm === 'acid_battery' && (
                      <div className={`p-4 border-t space-y-3.5 transition-all ${darkMode ? 'border-slate-800 bg-amber-950/10' : 'border-slate-200/80 bg-amber-50/30'}`}>
                        {/* حاوية الصورة */}
                        <div className={`p-3 rounded-lg border text-center transition-all ${darkMode ? 'bg-slate-950/80 border-slate-800/80' : 'bg-white border-slate-200/80 shadow-xs'}`}>
                          <img 
                            src="./assets/img/image_acid_battery.png" 
                            alt="بطارية الأسيد السائلة" 
                            onError={(e) => handleImageError(e, "صورة بطارية الأسيد الرصاصية السائلة")} 
                            className="max-h-48 mx-auto object-contain rounded-md hover:scale-[1.02] transition-transform duration-200" 
                          />
                        </div>

                        {/* صندوق الشرح */}
                        <div className={`p-3.5 rounded-lg text-xs sm:text-sm flex items-start gap-3 leading-relaxed ${darkMode ? 'bg-amber-950/30 text-amber-200 border border-amber-800/30' : 'bg-amber-100/70 text-amber-900 border border-amber-200/50'}`}>
                          <Lightbulb className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                          <div>
                            <strong className="font-bold block mb-1 text-amber-600 dark:text-amber-400">الشرح:</strong>
                           تحتوي على الكتروليت سائل (سائل حمضي)، تتميز بتكلفة شراء منخفضة وتتحمل الظروف القاسية، لكنها تتطلب تزويداً دورياً بالماء المقطر وتهوية جيدة لمنع تجمع الغازات. اضافة الى ذلك يجب الحفاظ على مكان التركيب بارداً ومعتدلاً بحدود 25 درجة مئوية، وتجنب الحرارة العالية التي تسبب تبخر السائل أو التلف.                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Gel */}
                  <div className={`border rounded-xl overflow-hidden transition-colors ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                    <button onClick={() => toggleTerm('gel_battery')} className="w-full p-4 flex justify-between items-center hover:bg-slate-50/10 transition-colors text-right cursor-pointer">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold text-sm sm:text-base ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>بطاريات الجل (Gel / AGM)</span>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${darkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'}`}>تقليدية</span>
                      </div>
                      <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${openTerm === 'gel_battery' ? 'rotate-180' : ''}`} />
                    </button>
                    {openTerm === 'gel_battery' && (
                      <div className={`p-4 border-t space-y-3 ${darkMode ? 'border-slate-800 bg-blue-950/20' : 'border-slate-100 bg-blue-50/20'}`}>
                        <div className={`p-3 rounded-lg border text-center ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-blue-200'}`}>
                          <img src="./assets/img/image_gel_battery.png" alt="بطارية الجل" onError={(e) => handleImageError(e, "صورة بطارية الجل والجل المغلق")} className="w-full h-auto max-h-56 object-contain rounded-md" />
                        </div>
                        <div className={`p-3 rounded-lg text-xs sm:text-sm flex items-center gap-2.5 ${darkMode ? 'bg-blue-950/50 text-blue-200 border border-blue-800/40' : 'bg-blue-100/60 text-blue-900'}`}>
                          <Lightbulb className="w-5 h-5 text-blue-500 shrink-0" />
                          <span><strong>الشرح:</strong> بطاريات مغلقة لا تحتاج صيانة، ذات كلفة اقتصادية ولكن ينصح بعدم تفريغها بأكثر من 50%.</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Lithium */}
                  <div className={`border rounded-xl overflow-hidden transition-colors ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                    <button onClick={() => toggleTerm('lithium_battery')} className="w-full p-4 flex justify-between items-center hover:bg-slate-50/10 transition-colors text-right cursor-pointer">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold text-sm sm:text-base ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>بطاريات الليثيوم (LiFePO4)</span>
                        <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">حديثة</span>
                      </div>
                      <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${openTerm === 'lithium_battery' ? 'rotate-180' : ''}`} />
                    </button>
                    {openTerm === 'lithium_battery' && (
                      <div className={`p-4 border-t space-y-3 ${darkMode ? 'border-slate-800 bg-emerald-950/20' : 'border-slate-100 bg-emerald-50/20'}`}>
                        <div className={`p-3 rounded-lg border text-center ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-emerald-200'}`}>
                          <img src="./assets/img/image_lithium_battery.png" alt="بطارية الليثيوم" onError={(e) => handleImageError(e, "صورة بطارية الليثيوم LiFePO4")} className="w-full h-auto max-h-56 object-contain rounded-md" />
                        </div>
                        <div className={`p-3 rounded-lg text-xs sm:text-sm flex items-center gap-2.5 ${darkMode ? 'bg-emerald-950/50 text-emerald-200 border border-emerald-800/40' : 'bg-emerald-100/60 text-emerald-900'}`}>
                          <Lightbulb className="w-5 h-5 text-emerald-500 shrink-0" />
                          <span><strong>الشرح:</strong> تُعد بطارية الليثيوم (خاصة LiFePO4) نظام تخزين متطور يقوم بحفظ الطاقة المولدة من الألواح الشمسية على شكل طاقة كيميائية بكفاءة تتجاوز 95%. وتتميز بعمر افتراضي طويل يصل إلى 10-15 سنة، مع تفريغ عميق وآمن يصل لـ 90%، ووزن خفيف مدعوم بنظام حماية ذكي (BMS). ولضمان أفضل أداء وعمر أطول، يُنصح بتثبيتها في مكان بارد وجاف (بين 15 إلى 30 درجة مئوية)، وتجنب شحنها تحت الصفر المئوي، مع ضبط عتبة التفريغ عند 10% أو 20% كحد أقصى.</span>
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
                  <h2 className="text-lg sm:text-xl font-bold">أنواع الألواح الشمسية</h2>
                </div>
                <ChevronDown className={`w-6 h-6 transition-transform duration-300 ${openSection === 'panels' ? 'rotate-180 text-emerald-400' : 'text-slate-400'}`} />
              </button>

              {openSection === 'panels' && (
                <div className="space-y-3 pr-2 pl-2 border-r-2 border-emerald-500/50">
                  {/* Mono */}
                  <div className={`border rounded-xl overflow-hidden transition-colors ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                    <button onClick={() => toggleTerm('mono_panel')} className="w-full p-4 flex justify-between items-center hover:bg-slate-50/10 transition-colors text-right cursor-pointer">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold text-sm sm:text-base ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>أحادية التبلور (Monocrystalline)</span>
                        <span className="text-xs bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950 font-semibold px-2 py-0.5 rounded-full">كفاءة عالية</span>
                      </div>
                      <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${openTerm === 'mono_panel' ? 'rotate-180' : ''}`} />
                    </button>
                    {openTerm === 'mono_panel' && (
                      <div className={`p-4 border-t space-y-3 ${darkMode ? 'border-slate-800 bg-slate-950/50' : 'border-slate-100 bg-slate-50'}`}>
                        <div className={`p-3 rounded-lg border text-center ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'}`}>
                          <img 
                          src="./assets/img/image_mono_panel.png" 
                          alt="اللوح أحادي التبلور" 
                          onError={(e) => handleImageError(e, "صورة اللوح أحادي التبلور Mono")} 
                          className="w-full h-auto max-h-56 object-contain rounded-md" 
                        />
                        </div>
                        <div className={`p-3 rounded-lg text-xs sm:text-sm flex items-center gap-2.5 ${darkMode ? 'bg-slate-800 text-slate-200 border border-slate-700' : 'bg-slate-100 text-slate-900'}`}>
                          <Lightbulb className="w-5 h-5 text-amber-500 shrink-0" />
                          <span><strong>الشرح:</strong> لونها أسود داكن وتتميز بأعلى كفاءة في الإنتاجية مقارنة بالمساحة.</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Poly */}
                  <div className={`border rounded-xl overflow-hidden transition-colors ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                    <button onClick={() => toggleTerm('poly_panel')} className="w-full p-4 flex justify-between items-center hover:bg-slate-50/10 transition-colors text-right cursor-pointer">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold text-sm sm:text-base ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>متعددة التبلور (Polycrystalline)</span>
                        <span className="text-xs bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded-full">اقتصادية</span>
                      </div>
                      <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${openTerm === 'poly_panel' ? 'rotate-180' : ''}`} />
                    </button>
                    {openTerm === 'poly_panel' && (
                      <div className={`p-4 border-t space-y-3 ${darkMode ? 'border-slate-800 bg-blue-950/20' : 'border-slate-100 bg-blue-50/20'}`}>
                        <div className={`p-3 rounded-lg border text-center ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-blue-200'}`}>
                          <img src="./assets/img/image_poly_panel.png"
                          alt="اللوح متعدد التبلور"
                          onError={(e) => handleImageError(e, "صورة اللوح متعدد التبلور Poly")}
                          className="w-full h-auto max-h-56 object-contain rounded-md"
                        />
                        </div>
                        <div className={`p-3 rounded-lg text-xs sm:text-sm flex items-center gap-2.5 ${darkMode ? 'bg-blue-950/50 text-blue-200 border border-blue-800/40' : 'bg-blue-100/60 text-blue-900'}`}>
                          <Lightbulb className="w-5 h-5 text-blue-500 shrink-0" />
                          <span><strong>الشرح:</strong> تتميز باللون الأزرق وتكلفة تصنيع اقتصادية وتناسب المساحات الواسعة.</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Flexible */}
                  <div className={`border rounded-xl overflow-hidden transition-colors ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                    <button onClick={() => toggleTerm('flex_panel')} className="w-full p-4 flex justify-between items-center hover:bg-slate-50/10 transition-colors text-right cursor-pointer">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold text-sm sm:text-base ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>الألواح المرنة (Flexible Panels)</span>
                        <span className="text-xs bg-purple-100 text-purple-800 font-semibold px-2 py-0.5 rounded-full">مرن وخفيف</span>
                      </div>
                      <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${openTerm === 'flex_panel' ? 'rotate-180' : ''}`} />
                    </button>
                    {openTerm === 'flex_panel' && (
                      <div className={`p-4 border-t space-y-3 ${darkMode ? 'border-slate-800 bg-purple-950/20' : 'border-slate-100 bg-purple-50/20'}`}>
                        <div className={`p-3 rounded-lg border text-center ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-purple-200'}`}>
                          <img src="./assets/img/image_flexible_panel.png" alt="اللوح المرن" onError={(e) => handleImageError(e, "صورة اللوح المرن Flexible Panel")} className="w-full h-auto max-h-56 object-contain rounded-md" />
                        </div>
                        <div className={`p-3 rounded-lg text-xs sm:text-sm flex items-center gap-2.5 ${darkMode ? 'bg-purple-950/50 text-purple-200 border border-purple-800/40' : 'bg-purple-100/60 text-purple-900'}`}>
                          <Lightbulb className="w-5 h-5 text-purple-500 shrink-0" />
                          <span><strong>الشرح:</strong> ألواح خفيفة الوزن وقابلة للانحناء بنسب معينة، مثالية للتثبيت على القوافل والقوارب.</span>
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
  )
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