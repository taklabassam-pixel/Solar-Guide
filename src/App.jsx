import React, { useState } from 'react';
import { ChevronDown, Zap, Lightbulb, AlertTriangle, Volume2, Calculator } from 'lucide-react';

export default function App() {
  // حالة التحكم بفتح/إغلاق القسم الرئيسي
  const [isMainOpen, setIsMainOpen] = useState(true);
  
  // حالة التحكم بفتح/إغلاق كل مصطلح
  const [openTerm, setOpenTerm] = useState(null);

  const toggleTerm = (term) => {
    setOpenTerm(openTerm === term ? null : term);
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 font-sans text-right" dir="rtl">
      <div className="max-w-3xl mx-auto space-y-4">
        
        {/* 1️⃣ العنوان الرئيسي المنسدل */}
        <button
          onClick={() => setIsMainOpen(!isMainOpen)}
          className="w-full bg-slate-900 text-white p-4 rounded-xl flex justify-between items-center shadow-lg hover:bg-slate-800 transition-all duration-200 cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <Zap className="w-6 h-6 text-amber-400 fill-amber-400" />
            <h2 className="text-xl font-bold">المصطلحات الكهربائية الأساسية</h2>
          </div>
          <ChevronDown className={`w-6 h-6 transition-transform duration-300 ${isMainOpen ? 'rotate-180 text-amber-400' : 'text-slate-400'}`} />
        </button>

        {/* 2️⃣ قائمة المصطلحات الفرعية */}
        {isMainOpen && (
          <div className="space-y-3 pr-2 pl-2 border-r-2 border-slate-300">
            
            {/* ----- الجهد الكهربائي ----- */}
            <div className="border border-slate-200 rounded-lg bg-white overflow-hidden shadow-sm">
              <button
                onClick={() => toggleTerm('voltage')}
                className="w-full p-4 flex justify-between items-center hover:bg-slate-50 transition-colors text-right cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800 text-lg">الجهد الكهربائي (Voltage)</span>
                  <span className="text-xs bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded-full">V - فولت</span>
                </div>
                <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform duration-200 ${openTerm === 'voltage' ? 'rotate-180' : ''}`} />
              </button>

              {openTerm === 'voltage' && (
                <div className="p-4 border-t border-slate-100 bg-amber-50/30 space-y-3">
                  <div className="p-3 bg-amber-100/60 rounded-lg text-amber-900 text-sm flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-amber-600 shrink-0" />
                    <span><strong>التشبيه:</strong> ضغط الماء داخل الأنابيب؛ كلما زاد الفولت زادت قوة دفع الشحنات لمسافات أطول.</span>
                  </div>
                  <div className="flex gap-2 text-xs font-semibold text-slate-600">
                    <span className="bg-slate-200 px-2 py-1 rounded">12 Volt</span>
                    <span className="bg-slate-200 px-2 py-1 rounded">24 Volt</span>
                    <span className="bg-slate-200 px-2 py-1 rounded">48 Volt</span>
                  </div>
                  <button className="flex items-center gap-2 text-sm text-slate-700 bg-white border border-slate-300 px-3 py-1.5 rounded-lg hover:bg-slate-100 cursor-pointer">
                    <Volume2 className="w-4 h-4 text-amber-600" />
                    <span>استمع للشرح الصوتي</span>
                  </button>
                </div>
              )}
            </div>

            {/* ----- التيار الكهربائي ----- */}
            <div className="border border-slate-200 rounded-lg bg-white overflow-hidden shadow-sm">
              <button
                onClick={() => toggleTerm('current')}
                className="w-full p-4 flex justify-between items-center hover:bg-slate-50 transition-colors text-right cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800 text-lg">التيار الكهربائي (Current)</span>
                  <span className="text-xs bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded-full">A - أمبير</span>
                </div>
                <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform duration-200 ${openTerm === 'current' ? 'rotate-180' : ''}`} />
              </button>

              {openTerm === 'current' && (
                <div className="p-4 border-t border-slate-100 bg-blue-50/30 space-y-3">
                  <div className="p-3 bg-blue-100/60 rounded-lg text-blue-900 text-sm flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-blue-600 shrink-0" />
                    <span><strong>التشبيه:</strong> حجم وكمية الماء المار في الأنبوب.</span>
                  </div>
                  <div className="p-3 bg-red-100/80 rounded-lg text-red-900 text-sm flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
                    <span><strong>قاعدة أمان:</strong> كلما زاد التيار (الأمبير)، احتجت لأسلاك ذات مقطع (أسمك) لتجنب الذوبان والحرائق.</span>
                  </div>
                  <button className="flex items-center gap-2 text-sm text-slate-700 bg-white border border-slate-300 px-3 py-1.5 rounded-lg hover:bg-slate-100 cursor-pointer">
                    <Volume2 className="w-4 h-4 text-blue-600" />
                    <span>استمع للشرح الصوتي</span>
                  </button>
                </div>
              )}
            </div>

            {/* ----- القدرة الكهربائية ----- */}
            <div className="border border-slate-200 rounded-lg bg-white overflow-hidden shadow-sm">
              <button
                onClick={() => toggleTerm('power')}
                className="w-full p-4 flex justify-between items-center hover:bg-slate-50 transition-colors text-right cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800 text-lg">القدرة الكهربائية (Power)</span>
                  <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">W - وات</span>
                </div>
                <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform duration-200 ${openTerm === 'power' ? 'rotate-180' : ''}`} />
              </button>

              {openTerm === 'power' && (
                <div className="p-4 border-t border-slate-100 bg-emerald-50/30 space-y-3">
                  <div className="p-3 bg-emerald-100/60 rounded-lg text-emerald-900 text-sm flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span><strong>التشبيه:</strong> قوة دوران الساقية الناتجة عن ضغط وتدفق الماء معاً.</span>
                  </div>
                  <div className="p-3 bg-emerald-100 text-emerald-950 rounded-lg text-sm flex items-center gap-2 font-mono">
                    <Calculator className="w-5 h-5 text-emerald-700 shrink-0" />
                    <span><strong>المعادلة:</strong> القدرة (W) = الجهد (V) × التيار (A)</span>
                  </div>
                  <button className="flex items-center gap-2 text-sm text-slate-700 bg-white border border-slate-300 px-3 py-1.5 rounded-lg hover:bg-slate-100 cursor-pointer">
                    <Volume2 className="w-4 h-4 text-emerald-600" />
                    <span>استمع للشرح الصوتي</span>
                  </button>
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}