import React, { useState, useMemo } from 'react';
import { Sun } from 'lucide-react';

export function SolarPanelsCalculator({ 
  darkMode = true, 
  totalDailyWh = 0, 
  onPanelConfigChange = () => {} 
}) {
  const COMMON_PANEL_WATTAGES = [50, 100, 150, 200, 300, 350, 400, 450, 540, 580, 650];
  
  const [dailyConsumption, setDailyConsumption] = useState(totalDailyWh || '');
  const [panelPower, setPanelPower] = useState(550);

  // حساب النتائج تلقائياً وإرسالها للتقرير الشامل
  const panelResults = useMemo(() => {
    const consumption = parseFloat(dailyConsumption) || 0;
    const singlePanelWatt = parseFloat(panelPower) || 1;
    const sunHours = 4.5;

    if (consumption <= 0) {
      const emptyConfig = { totalPowerNeeded: '0 W', panelsCount: '0 ألواح', singlePanelWatt, note: null };
      onPanelConfigChange(emptyConfig);
      return emptyConfig;
    }

    const totalWattsNeeded = Math.ceil((consumption / sunHours) * 1.3);
    const count = Math.ceil(totalWattsNeeded / singlePanelWatt);

    const config = {
      totalPowerNeeded: `${totalWattsNeeded} W`,
      panelsCount: `${count} ألواح`,
      singlePanelWatt: `${singlePanelWatt} واط`,
      note: `تستند الحسابات إلى معدل ${sunHours} ساعات شمس فعلياً مع نسبة فقد كفاءة 30%.`
    };

    // تحديث البيانات للتقرير الرئيسي
    onPanelConfigChange(config);
    return config;
  }, [dailyConsumption, panelPower, onPanelConfigChange]);

  return (
    <div className={`p-5 sm:p-6 rounded-2xl border shadow-sm space-y-5 transition-colors ${
      darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
    }`} dir="rtl">
      
      <div className={`flex items-center justify-between pb-4 border-b ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-amber-500/10 text-amber-500 rounded-xl">
            <Sun className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base">حاسبة الألواح الشمسية</h3>
            <p className="text-[11px] opacity-60">حساب القدرة المطلوبة وعدد الألواح لتغطية الحمل اليومي</p>
          </div>
        </div>
        <span className={`text-[12px] font-bold px-2.5 py-1 rounded-md ${darkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-600'}`}>☀️ التوليد</span>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="block text-xs font-bold opacity-80">إجمالي الاستهلاك اليومي (واط/ساعة - Wh):</label>
            {totalDailyWh > 0 && (
              <button 
                type="button"
                onClick={() => setDailyConsumption(Math.round(totalDailyWh))}
                className="text-[11px] font-bold text-amber-500 hover:underline flex items-center gap-1 cursor-pointer"
              >
                ⚡ جلب الاستهلاك المحسوب ({totalDailyWh.toLocaleString()} Wh)
              </button>
            )}
          </div>
          <input 
            type="number" 
            value={dailyConsumption}
            onChange={(e) => setDailyConsumption(e.target.value)}
            placeholder="أدخل الاستهلاك اليومي..." 
            className={`w-full p-3 rounded-xl text-sm font-semibold border outline-none transition-all ${
              darkMode ? 'bg-slate-800/80 border-slate-700 text-white focus:border-amber-500' : 'bg-slate-50 border-slate-200 text-slate-800 focus:ring-2 focus:ring-amber-500'
            }`}
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="panelPower" className="block text-xs font-bold opacity-80">
            قدرة اللوح الواحد (واط - Watt):
          </label>
          <select 
            id="panelPower"
            value={panelPower} 
            onChange={(e) => setPanelPower(Number(e.target.value))}
            className={`w-full p-3 rounded-xl text-sm font-bold border outline-none cursor-pointer ${
              darkMode ? 'bg-slate-800 border-slate-700 text-amber-400' : 'bg-slate-50 border-slate-200 text-amber-600'
            }`}
          >
            {COMMON_PANEL_WATTAGES.map((watt) => (
              <option key={watt} value={watt}>
                {watt} واط
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className={`p-3 rounded-xl border ${darkMode ? 'bg-amber-500/10 border-amber-500/20 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-950'}`}>
              <span className="block text-[11px] font-bold opacity-80">القدرة الكلية المطلوبة:</span>
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

    </div>
  );
}