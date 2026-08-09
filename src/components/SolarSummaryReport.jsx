import React, { useState } from 'react';
// 🟢 تم تصحيح الاستيراد: حذف المتغيرات والإبقاء على الأيقونات فقط
import { 
  FileText, Download, User, Calendar, MapPin, Wrench, 
  Zap, Sun, Battery, ShieldAlert, CheckCircle2, Sliders 
} from 'lucide-react';

export default function SolarSummaryReport({ 
  darkMode = true,
  systemVoltage = 24,
  loadsList = [],
  totalDailyWh = 3900,
  panelWattage = 550,
  batteryType = 'GEL',
  sunHours = 5
}) {
  const [meta, setMeta] = useState({
    clientName: '',
    techName: '',
    location: '',
    notes: ''
  });

  const totalDailyKwh = (totalDailyWh / 1000).toFixed(2);
  const requiredPanelsWatt = Math.ceil((totalDailyWh * 1.3) / sunHours);
  const panelCount = Math.ceil(requiredPanelsWatt / panelWattage);
  
  const totalSurgeWatts = loadsList.reduce((acc, l) => acc + (l.power * l.count), 0);
  const recommendedInverterKw = Math.max(1.5, Math.ceil((totalSurgeWatts * 1.25) / 1000 * 2) / 2);

  const dod = batteryType.includes('Lithium') ? 0.8 : 0.5;
  const batteryCapacityAh = Math.ceil((totalDailyWh * 1.2) / (systemVoltage * dod));
  const batteryCount = Math.ceil(batteryCapacityAh / 200);

  const getInverterSettings = () => {
    const isLithium = batteryType.includes('Lithium');
    if (systemVoltage === 12) {
      return { bulk: isLithium ? '14.2V' : '14.4V', float: isLithium ? '13.5V' : '13.8V', cutoff: '10.8V', current: '30A - 50A' };
    } else if (systemVoltage === 24) {
      return { bulk: isLithium ? '28.4V' : '28.8V', float: isLithium ? '27.0V' : '27.6V', cutoff: '21.6V', current: '40A - 60A' };
    } else {
      return { bulk: isLithium ? '56.8V' : '57.6V', float: isLithium ? '54.0V' : '55.2V', cutoff: '43.2V', current: '60A - 100A' };
    }
  };

  const settings = getInverterSettings();

  // دالة التصدير إلى PDF
  const handleExportPDF = async () => {
    const element = document.getElementById('pdf-summary-report');
    if (!element) return;

    try {
      // التأكد من تحميل المكتبات ديناميكياً إذا لم تكن مستوردة عالمياً
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: darkMode ? '#0f172a' : '#ffffff'
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`SolarFlow_Report_${meta.clientName || 'Project'}_${new Date().toISOString().slice(0,10)}.pdf`);
    } catch (error) {
      console.error('خطأ أثناء تصدير ملف PDF:', error);
    }
  };
  
  return (
    <div className="space-y-6 max-w-5xl mx-auto my-8 dir-rtl text-right font-sans">
      
      {/* شريط أداة التصدير والبيانات التوثيقية */}
      <div className={`p-5 rounded-2xl border transition-all ${darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'} shadow-lg space-y-4`}>
        <div className="flex flex-wrap justify-between items-center gap-4 border-b border-amber-500/20 pb-3">
          <div className="flex items-center gap-2 text-amber-500">
            <FileText className="w-6 h-6" />
            <h2 className="font-bold text-lg">تجهيز التقرير الفني الشامل</h2>
          </div>
          <button
            type="button"
            onClick={handleExportPDF}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black px-6 py-2.5 rounded-xl text-sm flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            تصدير تقرير PDF المعتمد
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block opacity-75 mb-1 font-semibold">اسم العميل / المشروع:</label>
            <input 
              type="text" 
              placeholder="مثال: منزل السيد أسامة"
              value={meta.clientName}
              onChange={(e) => setMeta({...meta, clientName: e.target.value})}
              className={`w-full p-2.5 rounded-xl border outline-none ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'}`}
            />
          </div>
          <div>
            <label className="block opacity-75 mb-1 font-semibold">إعداد المهندس / الفني:</label>
            <input 
              type="text" 
              placeholder="مثال: م. أحمد مصطفى"
              value={meta.techName}
              onChange={(e) => setMeta({...meta, techName: e.target.value})}
              className={`w-full p-2.5 rounded-xl border outline-none ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'}`}
            />
          </div>
          <div>
            <label className="block opacity-75 mb-1 font-semibold">الموقع / المدينة:</label>
            <input 
              type="text" 
              placeholder="مثال: الرياض"
              value={meta.location}
              onChange={(e) => setMeta({...meta, location: e.target.value})}
              className={`w-full p-2.5 rounded-xl border outline-none ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'}`}
            />
          </div>
        </div>
      </div>

      {/* الحاوية المطبوعة (التقرير النهائي) */}
      <div 
        id="pdf-summary-report" 
        className={`p-6 sm:p-8 rounded-2xl border space-y-6 ${
          darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        
        {/* Header */}
        <div className="flex justify-between items-start border-b-2 border-amber-500 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <Sun className="w-7 h-7 text-amber-500" />
              <h1 className="text-2xl font-black tracking-wide text-amber-500">SolarFlow Pro</h1>
            </div>
            <p className="text-xs opacity-75 mt-1 font-semibold">المرشد الفني والتقرير الهندسي لتصميم المنظومة الشمسية</p>
          </div>
          <div className="text-left text-[11px] space-y-0.5 opacity-80">
            <p className="font-bold text-amber-500">رقم التقرير: SF-{Math.floor(1000 + Math.random() * 9000)}</p>
            <p>التاريخ: {new Date().toLocaleDateString('ar-EG')}</p>
            <p>جهد النظام: <span className="font-bold">{systemVoltage}V DC</span></p>
          </div>
        </div>

        {/* Metadata Banner */}
        {(meta.clientName || meta.techName || meta.location) && (
          <div className={`p-3.5 rounded-xl grid grid-cols-3 gap-2 text-xs border ${darkMode ? 'bg-slate-800/60 border-slate-700/50' : 'bg-amber-50/50 border-amber-200/60'}`}>
            <div><span className="opacity-70">العميل:</span> <strong className="text-amber-500">{meta.clientName || 'غير محدد'}</strong></div>
            <div><span className="opacity-70">الفني المسؤول:</span> <strong>{meta.techName || 'غير محدد'}</strong></div>
            <div><span className="opacity-70">الموقع:</span> <strong>{meta.location || 'غير محدد'}</strong></div>
          </div>
        )}

        {/* 1️⃣ جدول قائمة الأحمال التفصيلي */}
        <div className="space-y-2 break-inside-avoid">
          <h2 className="text-xs font-bold text-amber-500 border-r-4 border-amber-500 pr-2.5 flex items-center gap-1.5">
            <Zap className="w-4 h-4" /> 1. جدول قائمة الأحمال الكهربائية (Loads Schedule)
          </h2>
          <div className="overflow-x-auto rounded-xl border border-slate-700/30">
            <table className="w-full text-xs text-right border-collapse">
              <thead>
                <tr className={`${darkMode ? 'bg-slate-800/90 text-amber-400' : 'bg-slate-100 text-slate-800'} font-bold`}>
                  <th className="p-2.5 border-b border-slate-700/30">الجهاز / الحمل</th>
                  <th className="p-2.5 border-b border-slate-700/30 text-center">القدرة (W)</th>
                  <th className="p-2.5 border-b border-slate-700/30 text-center">العدد</th>
                  <th className="p-2.5 border-b border-slate-700/30 text-center">ساعات التشغيل</th>
                  <th className="p-2.5 border-b border-slate-700/30 text-center">الطاقة اليومية (Wh)</th>
                </tr>
              </thead>
              <tbody>
                {loadsList && loadsList.length > 0 ? (
                  loadsList.map((load, idx) => (
                    <tr key={idx} className="border-b border-slate-700/20 hover:bg-amber-500/5">
                      <td className="p-2 border-r border-slate-700/20 font-semibold">{load.name}</td>
                      <td className="p-2 text-center border-r border-slate-700/20">{load.power} W</td>
                      <td className="p-2 text-center border-r border-slate-700/20">{load.count}</td>
                      <td className="p-2 text-center border-r border-slate-700/20">{load.hours} س</td>
                      <td className="p-2 text-center font-bold text-amber-500">{(load.power * load.count * load.hours).toLocaleString()} Wh</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="p-3 text-center opacity-60">تم اعتماد إجمالي استهلاك تقديري ({totalDailyWh.toLocaleString()} Wh).</td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr className={`${darkMode ? 'bg-slate-800/60' : 'bg-slate-100/80'} font-bold border-t border-amber-500/40`}>
                  <td colSpan="4" className="p-2.5 text-left pl-4">إجمالي الطاقة اليومية الصافية:</td>
                  <td className="p-2.5 text-center text-amber-500 text-sm font-black">{totalDailyWh.toLocaleString()} Wh ({totalDailyKwh} kWh)</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* 2️⃣ جدول المكونات */}
        <div className="space-y-2 break-inside-avoid">
          <h2 className="text-xs font-bold text-amber-500 border-r-4 border-amber-500 pr-2.5 flex items-center gap-1.5">
            <Sun className="w-4 h-4" /> 2. ملخص نتائج التجهيزات وأسس الحساب الهندسية
          </h2>
          <div className="overflow-x-auto rounded-xl border border-slate-700/30">
            <table className="w-full text-xs text-right border-collapse">
              <thead>
                <tr className={`${darkMode ? 'bg-slate-800/90 text-amber-400' : 'bg-slate-100 text-slate-800'} font-bold`}>
                  <th className="p-2.5 border-b border-slate-700/30 w-1/4">المكوّن / البرامتر</th>
                  <th className="p-2.5 border-b border-slate-700/30 text-center w-1/4">القيمة الموصى بها</th>
                  <th className="p-2.5 border-b border-slate-700/30 w-2/4">ملاحظات وأسس الحساب الهندسية (Notes & Standards)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/20">
                <tr>
                  <td className="p-2.5 font-bold">قدرة الإنفرتر الأدنى</td>
                  <td className="p-2.5 text-center text-amber-500 font-black">{recommendedInverterKw} kW ({systemVoltage}V)</td>
                  <td className="p-2.5 opacity-80">تغطي مجموع القدرة اللحظية للأجهزة مع هامش أمان 25% لتغذية تيار البدء (Surge).</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold">قدرة الألواح الكلية</td>
                  <td className="p-2.5 text-center text-amber-500 font-black">{requiredPanelsWatt.toLocaleString()} Watt</td>
                  <td className="p-2.5 opacity-80">تتضمن معامل مفقودات حرارة وكفاءة 30% معتمدة على متوسط {sunHours} ساعات ذروة شمسية.</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold">عدد الألواح المقترح</td>
                  <td className="p-2.5 text-center text-amber-500 font-black">{panelCount} ألواح ({panelWattage}W)</td>
                  <td className="p-2.5 opacity-80">موصى بتوصيلها كأوتار (Strings) متوافقة مع أقصى جهد مدخلات MPPT للإنفرتر.</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold">بنك البطاريات المطلوبة</td>
                  <td className="p-2.5 text-center text-amber-500 font-black">{batteryCapacityAh} Ah @ {systemVoltage}V</td>
                  <td className="p-2.5 opacity-80">حُسبت لتغطية يوم استقلالية واحد (1 Day) وبنسبة تفريغ آمنة DoD {(dod * 100)}% لبطاريات {batteryType}.</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold">عدد البطاريات التقريبي</td>
                  <td className="p-2.5 text-center text-amber-500 font-black">{batteryCount} بطاريات (200Ah)</td>
                  <td className="p-2.5 opacity-80">التوصيل: {systemVoltage === 24 ? 'بطاريتان على التوالي لكتابة 24V' : systemVoltage === 48 ? '4 بطاريات توالي' : 'مباشرة على التوازي'}.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 3️⃣ جدول أقطار الكابلات */}
        <div className="space-y-2 break-inside-avoid">
          <h2 className="text-xs font-bold text-amber-500 border-r-4 border-amber-500 pr-2.5 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4" /> 3. مقاسات الكابلات وسعة القواطع الوقائية الموصى بها (Cables & Protection)
          </h2>
          <div className="overflow-x-auto rounded-xl border border-slate-700/30">
            <table className="w-full text-xs text-right border-collapse">
              <thead>
                <tr className={`${darkMode ? 'bg-slate-800/90 text-amber-400' : 'bg-slate-100 text-slate-800'} font-bold`}>
                  <th className="p-2.5 border-b border-slate-700/30">المسار (Circuit)</th>
                  <th className="p-2.5 border-b border-slate-700/30 text-center">سعة القاطع (Breaker)</th>
                  <th className="p-2.5 border-b border-slate-700/30 text-center">قطر الكابل المقترح</th>
                  <th className="p-2.5 border-b border-slate-700/30">تعليمات السلامة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/20">
                <tr>
                  <td className="p-2.5 font-bold">خط البطاريات ↔ الإنفرتر</td>
                  <td className="p-2.5 text-center text-amber-500 font-bold">{Math.ceil((recommendedInverterKw * 1000) / systemVoltage * 1.25)}A DC</td>
                  <td className="p-2.5 text-center font-bold">{systemVoltage === 12 ? '35 mm²' : systemVoltage === 24 ? '25 mm²' : '16 mm²'}</td>
                  <td className="p-2.5 opacity-80">استخدام كابلات نحاسية مرنة لا يتجاوز طولها 2 متر لتقليل هبوط الجهد.</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold">خط الألواح ↔ الإنفرتر (PV)</td>
                  <td className="p-2.5 text-center text-amber-500 font-bold">20A - 32A DC</td>
                  <td className="p-2.5 text-center font-bold">4 mm² / 6 mm² Solar Cable</td>
                  <td className="p-2.5 opacity-80">كابلات شمسية مزدوجة العزل معتمدة مقاومة للأشعة فوق البنفسجية (UV).</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 4️⃣ جدول إعدادات الإنفرتر */}
        <div className="space-y-2 break-inside-avoid">
          <h2 className="text-xs font-bold text-amber-500 border-r-4 border-amber-500 pr-2.5 flex items-center gap-1.5">
            <Sliders className="w-4 h-4" /> 4. قيم البرامترات المقترحة لبرمجة الإنفرتر (Inverter Parameter Settings)
          </h2>
          <div className="overflow-x-auto rounded-xl border border-slate-700/30">
            <table className="w-full text-xs text-right border-collapse">
              <thead>
                <tr className={`${darkMode ? 'bg-slate-800/90 text-amber-400' : 'bg-slate-100 text-slate-800'} font-bold`}>
                  <th className="p-2.5 border-b border-slate-700/30">البرامتر (Parameter Name)</th>
                  <th className="p-2.5 border-b border-slate-700/30 text-center">القيمة الموصى بها</th>
                  <th className="p-2.5 border-b border-slate-700/30">الغرض الوظيفي للضبط</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/20">
                <tr>
                  <td className="p-2.5 font-semibold">Bulk / Absorption Charging Voltage</td>
                  <td className="p-2.5 text-center text-amber-500 font-bold">{settings.bulk}</td>
                  <td className="p-2.5 opacity-80">جهد الشحن السريع الرئيسي لإعادة شحن البطارية بكفاءة دون سخونة.</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-semibold">Float Charging Voltage</td>
                  <td className="p-2.5 text-center text-amber-500 font-bold">{settings.float}</td>
                  <td className="p-2.5 opacity-80">جهد التعويم للحفاظ على امتلائها بنسبة 100% دون غليان أو تآكل الصفائح.</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-semibold">Low DC Cut-off Voltage</td>
                  <td className="p-2.5 text-center text-amber-500 font-bold">{settings.cutoff}</td>
                  <td className="p-2.5 opacity-80">جهد الحماية الكارثي لفصل الإنفرتر وحماية البطارية من التفريغ المفرط.</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-semibold">Max Charging Current (Solar + Grid)</td>
                  <td className="p-2.5 text-center text-amber-500 font-bold">{settings.current}</td>
                  <td className="p-2.5 opacity-80">الحد الأقصى لتيار الشحن الآمن للبطاريات لعدم تقليل عمرها الافتراضي.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-700/30 text-[11px] opacity-75 flex justify-between items-center">
          <div>* تم إنشاء هذا التقرير تلقائياً بناءً على الحسابات القياسية المعتمَدة.</div>
          <div className="flex items-center gap-1 text-amber-500 font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" /> تقرير فني معتمد
          </div>
        </div>

      </div>
    </div>
  );
}