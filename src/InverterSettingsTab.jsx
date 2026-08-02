import React, { useState } from 'react';
import { INVERTER_PRESETS } from './data/invertersData';

export default function InverterSettingsTab() {
  const [selectedInverter, setSelectedInverter] = useState(INVERTER_PRESETS?.[0]?.id || '');
  const [sysVoltage, setSysVoltage] = useState(48); // 12, 24, 48
  const [batteryType, setBatteryType] = useState('lithium'); // lithium, gel, tubular

  // الحصول على بيانات الإنفرتر المختار بطريقة آمنة
  const currentPreset = INVERTER_PRESETS?.find(p => p.id === selectedInverter) || INVERTER_PRESETS?.[0] || {};
  
  // استخراج الإعدادات بأمان
  const defaultSettings = currentPreset?.defaultSettings || {};
  const settingsEntries = Object.entries(defaultSettings);

  return (
    <div className="container py-3">
      <h3 className="mb-4 text-primary">⚙️ إعدادات وضبط الإنفرتر (Inverter Setup)</h3>

      {/* قسم اختيار البيانات الأساسية */}
      <div className="card p-3 mb-4 shadow-sm">
        <h5 className="card-title mb-3">1️⃣ مواصفات النظام والإنفرتر</h5>
        <div className="row g-3">
          
          {/* نوع الإنفرتر */}
          <div className="col-md-4">
            <label className="form-label fw-bold">علامة/نوع الإنفرتر:</label>
            <select 
              value={selectedInverter} 
              onChange={(e) => setSelectedInverter(e.target.value)}
              className="form-select"
            >
              {Array.isArray(INVERTER_PRESETS) && INVERTER_PRESETS.map((inv) => (
                <option key={inv?.id} value={inv?.id}>{inv?.name}</option>
              ))}
            </select>
          </div>

          {/* جهد النظام */}
          <div className="col-md-4">
            <label className="form-label fw-bold">جهد النظام (System Voltage):</label>
            <select 
              value={sysVoltage} 
              onChange={(e) => setSysVoltage(Number(e.target.value))}
              className="form-select"
            >
              <option value={12}>12 فولت (12V)</option>
              <option value={24}>24 فولت (24V)</option>
              <option value={48}>48 فولت (48V)</option>
            </select>
          </div>

          {/* نوع البطارية */}
          <div className="col-md-4">
            <label className="form-label fw-bold">نوع البطارية المستخدمة:</label>
            <select 
              value={batteryType} 
              onChange={(e) => setBatteryType(e.target.value)}
              className="form-select"
            >
              <option value="lithium">ليثيوم (Lithium / LiFePO4)</option>
              <option value="gel">أنبوبية / جيل (Tubular / Gel)</option>
              <option value="lead_acid">حمضية سائلة (Lead-Acid / AGM)</option>
            </select>
          </div>

        </div>
      </div>

      {/* قسم عرض البارامترات الموصى بها */}
      <div className="card p-3 mb-4 shadow-sm">
        <h5 className="card-title mb-3">2️⃣ القيم والبارامترات الموصى بضبطها</h5>
        
        <div className="table-responsive">
          <table className="table table-bordered table-striped align-middle">
            <thead className="table-dark">
              <tr>
                <th style={{ width: '15%' }}>رقم / اسم البند</th>
                <th style={{ width: '30%' }}>البيان (Parameter)</th>
                <th style={{ width: '25%' }}>القيمة الموصى بها</th>
                <th style={{ width: '30%' }}>ملاحظات / الشرح</th>
              </tr>
            </thead>
            <tbody>
              {settingsEntries.length > 0 ? (
                settingsEntries.map(([code, item]) => (
                  <tr key={code}>
                    <td className="fw-bold text-center">{code}</td>
                    <td>{item?.name || 'غير محدد'}</td>
                    <td className="text-primary fw-bold">{item?.value || '-'}</td>
                    <td className="text-muted fs-7">{item?.desc || '-'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center text-muted">
                    الرجاء إدخال البارامترات يدوياً أو اختيار ماركة معتمدة من القائمة.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3️⃣ نصائح وإرشادات تشغيلية للحفاظ على النظام */}
      <div className="alert alert-warning shadow-sm">
        <h5 className="alert-heading fw-bold">🛡️ إرشادات هامة عند الضبط والصيانة:</h5>
        <ul className="mb-0 mt-2">
          <li><strong>تسلسل التشغيل:</strong> قم بتوصيل البطارية أولاً إلى الإنفرتر، ثم تشغيل مفتاح PV (الألواح)، وأخيراً مفتاح AC (الكهرباء/المولد).</li>
          <li><strong>تسلسل الإطفاء:</strong> افصل الألواح والكهرباء أولاً، واجعل افصل البطارية هو الخطوة الأخيرة دائماً.</li>
          <li><strong>توافق المولد:</strong> في حال استخدام مولد كهربائي، يفضل ضبط أقصى تيار شحن AC بحيث لا يتجاوز 50% من قدرة المولد لتفادي انخفاض الفولتية.</li>
        </ul>
      </div>

    </div>
  );
}