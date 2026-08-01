import React from 'react';
import { BASICS_DATA } from './data/basicsData';
import { ConceptCard } from '../../components/ui/ConceptCard';

export const BasicsScreen = () => {
  return (
    <div className="p-4 max-w-md mx-auto space-y-4 text-right" dir="rtl">
      <h2 className="text-xl font-bold text-slate-800 border-b pb-2 mb-4">
        ⚡ المصطلحات الكهربائية الأساسية
      </h2>

      {/* بطاقة الفولت */}
      <ConceptCard {...BASICS_DATA.voltage}>
        <div className="text-center py-2 bg-amber-50 rounded-lg border border-amber-200">
          <p className="text-sm font-semibold text-amber-800">خيارات الجهد الشائعة:</p>
          <div className="flex justify-center gap-2 mt-1">
            {BASICS_DATA.voltage.options.map((v) => (
              <span key={v} className="bg-amber-200 text-amber-900 px-2 py-0.5 rounded text-xs font-bold">
                {v} Volt
              </span>
            ))}
          </div>
        </div>
      </ConceptCard>

      {/* بطاقة التيار */}
      <ConceptCard {...BASICS_DATA.current}>
        <div className="text-xs text-slate-600 bg-blue-50 p-2 rounded border border-blue-100">
          ⚠️ <b>قاعدة أمان:</b> كلما زاد التيار (الأمبير)، احتجت لأسلاك ذات مقطع (أنش) أسمك لتجنب الذوبان.
        </div>
      </ConceptCard>

      {/* بطاقة القدرة */}
      <ConceptCard {...BASICS_DATA.power}>
        <div className="text-xs text-slate-600 bg-emerald-50 p-2 rounded border border-emerald-100">
          🧮 <b>معادلة القدرة:</b> الوات (W) = الفولت (V) × الأمبير (A)
        </div>
      </ConceptCard>

      {/* بطاقة السعة */}
      <ConceptCard {...BASICS_DATA.capacity}>
        <div className="text-xs text-slate-600 bg-purple-50 p-2 rounded border border-purple-100">
          🔋 <b>مثال:</b> بطارية 100Ah تعطي 5 أمبير لمدة 20 ساعة متواصلة.
        </div>
      </ConceptCard>

      {/* بطاقة DC / AC */}
      <ConceptCard {...BASICS_DATA.ac_dc}>
        <div className="text-xs text-slate-600 bg-indigo-50 p-2 rounded border border-indigo-100">
          🔄 <b>التحويل:</b> الانفرتر يقوم بتحويل كهرباء البطاريات (DC) إلى كهرباء منازل (AC).
        </div>
      </ConceptCard>
    </div>
  );
};