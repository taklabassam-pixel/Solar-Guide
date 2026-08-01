export const BASICS_DATA = {
  voltage: {
    id: "voltage",
    title: "الجهد الكهربائي (Voltage)",
    symbol: "V",
    unit: "فولت",
    analogy: "ضغط الماء داخل الأنابيب",
    description: "القوة التي تدفع الشحنات للتحرك. ارتفاع الفولت يزيد قدرة الدفع لمسافات أطول.",
    audioUrl: "/assets/audio/voltage_ar.mp3",
    options: [12, 24, 48]
  },
  current: {
    id: "current",
    title: "التيار الكهربائي (Current)",
    symbol: "A",
    unit: "أمبير",
    analogy: "حجم ومعدل تدفق الماء المار في الأنبوب",
    description: "كمية الكهرباء العابرة في السلك. التدفق العالي يتطلب أسلاكاً أسمك لمنع السخونة.",
    audioUrl: "/assets/audio/current_ar.mp3"
  },
  power: {
    id: "power",
    title: "القدرة الكهربائية (Power)",
    symbol: "W",
    unit: "وات",
    analogy: "قوة دوران الساقية الناتجة عن ضغط وتدفق الماء معاً",
    description: "القوة الفعلية لتشغيل الجهاز. تحسب بضرب الجهد في التيار (Power = V × A).",
    audioUrl: "/assets/audio/power_ar.mp3"
  },
  capacity: {
    id: "capacity",
    title: "سعة البطارية (Capacity)",
    symbol: "Ah",
    unit: "أمبير-ساعة",
    analogy: "حجم خزان الماء الكلي وسعته بالليترات",
    description: "كمية الطاقة المخزنة المتاحة للسحب قبل أن تفرغ البطارية تماماً.",
    audioUrl: "/assets/audio/capacity_ar.mp3"
  },
  ac_dc: {
    id: "ac_dc",
    title: "الفرق بين DC و AC",
    symbol: "∿ / ⎓",
    unit: "نوع التيار",
    analogy: "الماء الثابت في السد مقابل الأمواج المتلاطمة",
    description: "DC هو التيار المستمر الثابت (بطاريات وألواح)، وAC هو التيار المتردد (كهرباء المنزل والمقبس).",
    audioUrl: "/assets/audio/ac_dc_ar.mp3"
  }
};