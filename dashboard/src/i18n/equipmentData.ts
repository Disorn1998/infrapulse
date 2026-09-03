import serverImg from '../assets/equipment/server.webp';
import coolingImg from '../assets/equipment/cooling.webp';
import upsImg from '../assets/equipment/ups.webp';
import containmentImg from '../assets/equipment/containment.webp';
import fireImg from '../assets/equipment/fire_suppression.webp';
import nocImg from '../assets/equipment/noc_monitoring.webp';
import networkImg from '../assets/equipment/network_room.webp';
import securityImg from '../assets/equipment/security_access.webp';

export interface EquipmentItem {
  id: string;
  number: number;
  name: string;
  zoneTitle: string;
  category: string;
  model: string;
  standard: string;
  image: string;
  specs: { label: string; value: string }[];
  telemetry: { label: string; value: string; color: string }[];
  role: string;
  importance: string;
  failureImpact: string;
}

export interface InfrastructureSystem {
  id: string;
  title: string;
  subTitle: string;
  iconName: string;
  desc: string;
}

export interface EquipmentI18n {
  drawerTitle: string;
  closeBtn: string;
  specsTitle: string;
  telemetryTitle: string;
  roleTitle: string;
  importanceTitle: string;
  impactTitle: string;
  viewIn3d: string;
  inspectHint: string;
  roomZoningTitle: string;
  roomZoningSub: string;
  detailZoneTitle: string;
  detailZoneSub: string;
  infraTitle: string;
  infraSub: string;
  benefitsTitle: string;
  benefits: string[];
  systems: InfrastructureSystem[];
  items: Record<string, EquipmentItem>;
}

export const equipmentData: { th: EquipmentI18n; en: EquipmentI18n } = {
  th: {
    drawerTitle: "ตรวจสอบข้อมูลฮาร์ดแวร์จริง (Physical Hardware Inspector)",
    closeBtn: "ปิดหน้าต่าง",
    specsTitle: "ข้อมูลจำเพาะทางวิศวกรรม (Engineering Specifications)",
    telemetryTitle: "การวัดค่า Real-Time Telemetry สด",
    roleTitle: "บทบาทหน้าที่ในศูนย์ข้อมูล",
    importanceTitle: "ทำไมอุปกรณ์นี้จึงสำคัญ?",
    impactTitle: "ผลกระทบหากอุปกรณ์นี้เสียหาย (Failure Impact)",
    viewIn3d: "โฟกัสในโมเดล 3D",
    inspectHint: "คลิกหรือแตะที่อุปกรณ์หรือหมุดหมายเลขในห้อง 3D/2D เพื่อดูรูปถ่ายฮาร์ดแวร์จริงและสเปก",
    roomZoningTitle: "ROOM ZONING (ผังจำลองการแบ่งโซนห้อง)",
    roomZoningSub: "การจัดสรรพื้นที่ตามหลักการ Data Center สากล เพื่อความปลอดภัยและการขยายตัว",
    detailZoneTitle: "DETAIL ZONE (รายละเอียดอุปกรณ์ทั้ง 8 โซนหลัก)",
    detailZoneSub: "คลิกที่การ์ดเพื่อส่องดูภาพถ่ายฮาร์ดแวร์จริงและข้อมูลสเปกวิศวกรรม",
    infraTitle: "INFRASTRUCTURE SYSTEM (6 เสาหลักระบบโครงสร้างพื้นฐาน)",
    infraSub: "หัวใจสำคัญในการขับเคลื่อนศูนย์ข้อมูลระดับ Tier III ให้ทำงานต่อเนื่อง 24/7",
    benefitsTitle: "เหมาะสำหรับองค์กรที่ต้องการ",
    benefits: [
      "เสถียรภาพในการทำงาน 24/7 ไม่มีการหยุดชะงัก",
      "ความปลอดภัยของข้อมูลระดับสูงสุด (Physical & Network)",
      "รองรับการขยายตัวในอนาคต (Scalable Modular Pod)",
      "ลดความเสี่ยงการหยุดชะงักของระบบ (Tier III Fault Tolerant)",
      "เพิ่มประสิทธิภาพการใช้พลังงาน (PUE ≤ 1.30 ตามเกณฑ์ BOI)"
    ],
    systems: [
      { id: "elec", title: "Electrical System", subTitle: "ระบบไฟฟ้าและการจ่ายไฟ", iconName: "Zap", desc: "ระบบจ่ายไฟคู่ขนาน 2N พร้อม UPS สำรองไฟ 0ms" },
      { id: "cool", title: "Cooling System", subTitle: "ระบบปรับอากาศควบคุมอุณหภูมิ", iconName: "Wind", desc: "แอร์ Precision In-Row / CRAH ควบคุมอุณหภูมิและความชื้น 24/7" },
      { id: "fire", title: "Fire Protection", subTitle: "ระบบดับเพลิงอัตโนมัติ", iconName: "Flame", desc: "ตรวจจับควันเร็วพิเศษ VESDA และแก๊สสะอาด Novec 1230" },
      { id: "sec", title: "Security System", subTitle: "ระบบความปลอดภัยและการเข้าออก", iconName: "ShieldCheck", desc: "Airlock Mantrap, สแกนลายนิ้วมือ/ใบหน้า และ CCTV 4K" },
      { id: "mon", title: "Monitoring System", subTitle: "ระบบตรวจสอบและแจ้งเตือน", iconName: "Monitor", desc: "DCIM มอนิเตอร์ค่าไฟฟ้า อุณหภูมิ และ PUE แบบ Real-Time" },
      { id: "net", title: "Network System", subTitle: "ระบบเครือข่ายและการสื่อสาร", iconName: "Network", desc: "Core Switch 100G Spine-Leaf และสายไฟเบอร์ออปติก Redundant" }
    ],
    items: {
      "server-rack": {
        id: "server-rack",
        number: 1,
        name: "พื้นที่ติดตั้งตู้เซิร์ฟเวอร์ (Server Rack Area)",
        zoneTitle: "1. SERVER RACK AREA",
        category: "COMPUTE & STORAGE",
        model: "APC NetShelter SX 42U (EIA-310-E Standard)",
        standard: "TIA-942 / ASHRAE A1 Class",
        image: serverImg,
        specs: [
          { label: "ความสูงตู้แร็ค", value: "42U (2,000mm x 600mm x 1,070mm)" },
          { label: "ฮาร์ดแวร์ประมวลผล", value: "Dell PowerEdge R750 2U Dual Xeon Platinum" },
          { label: "หน่วยความจำ", value: "512GB ECC Registered DDR5" },
          { label: "พาวเวอร์ซัพพลาย", value: "Dual 1600W Titanium 96% Efficiency" }
        ],
        telemetry: [
          { label: "กำลังไฟฟ้า IT Load", value: "1,781.9 W", color: "text-cyan-400" },
          { label: "อุณหภูมิลมเข้า (Intake)", value: "21.5 °C", color: "text-emerald-400" },
          { label: "สถานะโหนด", value: "5/5 Nodes Online", color: "text-emerald-400" },
          { label: "สายไฟหลัก", value: "Feed A + B Dual Active", color: "text-cyan-400" }
        ],
        role: "พื้นที่ศูนย์กลางสำหรับติดตั้งเซิร์ฟเวอร์เบลด สตอเรจ และอุปกรณ์ประมวลผลสำคัญ รันคลาวด์และฐานข้อมูลตลอด 24 ชั่วโมง",
        importance: "เป็นต้นกำเนิดรายได้และพลังประมวลผลทั้งหมดของศูนย์ข้อมูล แต่ก็เป็นจุดที่สร้างความร้อนสูงสุดเช่นกัน",
        failureImpact: "หากเซิร์ฟเวอร์หยุดทำงาน ระบบจะ Failover ข้ามตู้ทันที หากอุณหภูมิเกิน 85°C ชิปจะตัดการทำงานเพื่อป้องกันไฟไหม้"
      },
      "ups-battery": {
        id: "ups-battery",
        number: 2,
        name: "ห้องระบบสำรองไฟฟ้าและแบตเตอรี่ (UPS & Battery Room)",
        zoneTitle: "2. UPS & BATTERY ROOM",
        category: "CRITICAL POWER INFRASTRUCTURE",
        model: "APC Symmetra PX 48kW / Galaxy VX Modular",
        standard: "IEC 62040-3 (Class 1 VFI-SS-111)",
        image: upsImg,
        specs: [
          { label: "ประเภทระบบสำรองไฟ", value: "True Online Double-Conversion (VFI)" },
          { label: "กำลังไฟพิกัด", value: "48 kW / 48 kVA N+1 Modular" },
          { label: "ชนิดแบตเตอรี่", value: "Modular Li-Ion / VRLA Battery Trays" },
          { label: "ประสิทธิภาพพลังงาน", value: "97.5% in Double Conversion" }
        ],
        telemetry: [
          { label: "ระดับประจุแบตเตอรี่", value: "100 %", color: "text-emerald-400" },
          { label: "ระยะเวลาจ่ายไฟสำรอง", value: "28 นาที @ Full Load", color: "text-cyan-400" },
          { label: "เวลาสลับไฟ (Transfer)", value: "0 มิลลิวินาที (Zero Break)", color: "text-emerald-400" },
          { label: "แรงดันไฟอินพุต", value: "400V 3-Phase 50Hz", color: "text-slate-300" }
        ],
        role: "สำรองไฟฟ้าฉุกเฉินและแปลงไฟฟ้าให้บริสุทธิ์ ป้องกันไฟตก ไฟเกิน ไฟกระชาก ป้อนไฟให้เซิร์ฟเวอร์แบบไร้รอยต่อ",
        importance: "เวลาถ่ายโอนไฟ 0 มิลลิวินาที ทำให้เซิร์ฟเวอร์ไม่ดับแม้การไฟฟ้าดับสนิท มีเวลาให้เครื่องกำเนิดไฟฟ้าสตาร์ทติด",
        failureImpact: "หากระบบ UPS ล้มเหลว ไฟกระชากเพียง 0.02 วินาทีจะทำให้เครื่องเซิร์ฟเวอร์ทุกตู้ดับพร้อมกันทันที ข้อมูลเสียหาย"
      },
      "cooling": {
        id: "cooling",
        number: 3,
        name: "ระบบปรับอากาศควบคุมอุณหภูมิและความชื้น (Precision Air Conditioning)",
        zoneTitle: "3. PRECISION AIR CONDITIONING",
        category: "PRECISION THERMAL MANAGEMENT",
        model: "Schneider APC InRow RC 60kW & Perimeter CRAH",
        standard: "ASHRAE TC 9.9 Thermal Guidelines",
        image: coolingImg,
        specs: [
          { label: "พิกัดการทำความเย็น", value: "60 kW Net Sensible Cooling" },
          { label: "ชนิดพัดลม", value: "Modulating EC Fans ปรับรอบอัตโนมัติ" },
          { label: "อัตราการไหลน้ำเย็น", value: "Chilled Water 1.8 L/s @ 7°C" },
          { label: "ควบคุมความชื้น", value: "Relative Humidity 45% - 55% RH" }
        ],
        telemetry: [
          { label: "อุณหภูมิลมจ่าย (Supply)", value: "21.5 °C", color: "text-sky-400" },
          { label: "อุณหภูมิดูดกลับ (Return)", value: "38.2 °C", color: "text-rose-400" },
          { label: "ค่าผลต่างอุณหภูมิ (ΔT)", value: "16.7 °C", color: "text-amber-400" },
          { label: "ความเร็วพัดลม EC Fan", value: "62 %", color: "text-emerald-400" }
        ],
        role: "ควบคุมอุณหภูมิและดูดความชื้นในห้องเซิร์ฟเวอร์ตลอด 24/7 เพื่อให้ชิปประมวลผลทำงานที่อุณหภูมิเหมาะสมที่สุด",
        importance: "การใช้ Precision In-Row Cooler วางประกบข้างตู้แร็คช่วยลดระยะเดินทางของลม ประหยัดไฟพัดลม และกด PUE ต่ำกว่า 1.30",
        failureImpact: "หากระบบแอร์ดับ ความร้อนสะสมในตู้จะทำให้เซิร์ฟเวอร์ร้อนเกิน 80°C เกิด Thermal Throttling ภายใน 90 วินาที"
      },
      "containment": {
        id: "containment",
        number: 4,
        name: "ระบบกักทิศทางลมร้อน-ลมเย็น (Hot Aisle / Cold Aisle)",
        zoneTitle: "4. HOT AISLE / COLD AISLE",
        category: "CONTAINMENT & AIRFLOW INFRASTRUCTURE",
        model: "EcoAisle Modular Thermal Containment System",
        standard: "ASHRAE TC 9.9 Thermal Guidelines",
        image: containmentImg,
        specs: [
          { label: "วัสดุกักกั้นเพดาน", value: "Light-transmitting Polycarbonate" },
          { label: "ประตูทางเข้า", value: "Dual Sliding Glass with Magnetic Seals" },
          { label: "การกักลมรั่วไหล", value: "Air Leakage Rate < 1.0%" },
          { label: "ไฟส่องสว่างนำทาง", value: "Smart LED Floor Guidance Strip" }
        ],
        telemetry: [
          { label: "อุณหภูมิทางเดินลมเย็น", value: "21.5 °C", color: "text-sky-400" },
          { label: "อุณหภูมิทางเดินลมร้อน", value: "38.2 °C", color: "text-rose-400" },
          { label: "อัตราลมปะปน (Mixing)", value: "0.0 % (สมบูรณ์แบบ)", color: "text-emerald-400" },
          { label: "พลังงานแอร์ที่ประหยัดได้", value: "35 %", color: "text-emerald-400" }
        ],
        role: "กักแยกโซนลมเย็นด้านหน้าและโซนลมร้อนด้านหลังออกจากกันเด็ดขาด ป้องกันลมร้อนม้วนกลับมาปะปนกับลมเย็น",
        importance: "ช่วยเพิ่มประสิทธิภาพคอยล์เย็นของแอร์ได้สูงสุด ลดการสิ้นเปลืองพลังงาน และกำจัดจุดร้อน (Hot Spots)",
        failureImpact: "หากเปิดประตูกักลมทิ้งไว้ ลมร้อน 38°C จะไหลวนเข้าหน้าตู้ อุณหภูมิด้านหน้าจะพุ่งขึ้น 6-8°C ทันที"
      },
      "fire-suppression": {
        id: "fire-suppression",
        number: 5,
        name: "ระบบดับเพลิงอัตโนมัติแก๊สสะอาด (Fire Suppression System)",
        zoneTitle: "5. FIRE SUPPRESSION SYSTEM",
        category: "SAFETY & ASSET PROTECTION",
        model: "Kidde / Johnson Controls Novec 1230 & VESDA VLP",
        standard: "NFPA 2001 / NFPA 75 Standard for IT Equipment",
        image: fireImg,
        specs: [
          { label: "สารดับเพลิง", value: "3M Novec 1230 Clean Agent / FM-200" },
          { label: "แรงดันการเก็บแก๊ส", value: "25 Bar (360 PSI) Superpressurized with N2" },
          { label: "ระบบตรวจจับควัน", value: "VESDA Laser Air-Sampling Detection" },
          { label: "เวลาในการฉีดดับเพลิง", value: "ฉีดเต็มห้องภายใน 10 วินาที" }
        ],
        telemetry: [
          { label: "แรงดันถังแก๊ส", value: "25.2 Bar (ปกติ)", color: "text-emerald-400" },
          { label: "สถานะระบบ VESDA", value: "Normal (0.00% obscuration)", color: "text-emerald-400" },
          { label: "ระบบ Interlock", value: "Armed & Ready 24/7", color: "text-cyan-400" },
          { label: "โซนคุ้มครอง", value: "ครอบคลุมห้อง 100%", color: "text-slate-300" }
        ],
        role: "ตรวจจับอนุภาคควันตั้งแต่ระดับก่อนเกิดเปลวไฟ และฉีดแก๊สสะอาดเพื่อดับไฟทันทีโดยไม่ใช้น้ำ และไม่ทำลายอุปกรณ์อิเล็กทรอนิกส์",
        importance: "ปลอดภัยต่อมนุษย์ ไม่นำไฟฟ้า ไม่ทิ้งคราบสกปรก และไม่ทำลายแผ่นวงจรของเซิร์ฟเวอร์",
        failureImpact: "หากไม่มีระบบนี้ อัคคีภัยจากไฟฟ้าลัดวงจรจะลุกลามทำลายทั้งศูนย์ข้อมูล และการใช้น้ำดับเพลิงจะทำให้อุปกรณ์พังเสียหาย 100%"
      },
      "dcim-noc": {
        id: "dcim-noc",
        number: 6,
        name: "ระบบตรวจสอบและแจ้งเตือน Real-Time (Monitoring & DCIM)",
        zoneTitle: "6. MONITORING & DCIM",
        category: "DCIM & OPERATIONS CENTER",
        model: "InfraPulse Unified DCIM Platform & 6-Screen NOC Console",
        standard: "ISO/IEC 27001 / SOC 2 Type II",
        image: nocImg,
        specs: [
          { label: "หน้าจอแสดงผล NOC", value: "6x 43-inch 4K Curved Command Wall" },
          { label: "โปรโตคอลตรวจวัด", value: "SNMP v3, Modbus TCP, BACnet, REST API" },
          { label: "ความถี่การอ่านค่า", value: "Real-time ทุก 1 วินาที (Sub-second Telemetry)" },
          { label: "ช่องทางแจ้งเตือน", value: "SMS, Email, Webhook, Telegram Bot, Siren" }
        ],
        telemetry: [
          { label: "ดัชนี PUE รวม", value: "1.205 (Optimal)", color: "text-emerald-400" },
          { label: "สายไฟ Feed A / B", value: "3.2A / 2.8A (ปกติ)", color: "text-cyan-400" },
          { label: "สถานะแจ้งเตือน", value: "0 Critical / 0 Warning", color: "text-emerald-400" },
          { label: "NOC Uptime", value: "99.999% High Availability", color: "text-emerald-400" }
        ],
        role: "ศูนย์ควบคุมกลาง (NOC) สำหรับเฝ้าระวังตัวชี้วัดสำคัญของศูนย์ข้อมูล ทั้งไฟฟ้า อุณหภูมิ ลม ความชื้น และเครือข่าย",
        importance: "ตรวจพบความผิดปกติได้ก่อนเกิดเหตุการณ์วิกฤต (Proactive Incident Prevention) ช่วยรักษา Uptime ระดับ 99.999%",
        failureImpact: "หากระบบมอนิเตอร์ไม่ทำงาน วิศวกรจะไม่ทราบเมื่อสายไฟโอเวอร์โหลดหรือแอร์ดับ จนกระทั่งเซิร์ฟเวอร์ตัดการทำงาน"
      },
      "network-room": {
        id: "network-room",
        number: 7,
        name: "พื้นที่อุปกรณ์เครือข่ายหลัก (Network Room & Spine-Leaf)",
        zoneTitle: "7. NETWORK ROOM",
        category: "NETWORK INFRASTRUCTURE",
        model: "Cisco Nexus 9000 & Arista 7060X 100G Spine-Leaf",
        standard: "IEEE 802.3ck / TIA-568 Structured Cabling",
        image: networkImg,
        specs: [
          { label: "สถาปัตยกรรมเน็ตเวิร์ก", value: "Spine-Leaf Fabric (Non-blocking)" },
          { label: "พอร์ตความเร็วสูง", value: "32x 100GbE QSFP28 Uplinks ต่อสวิตช์" },
          { label: "สายสัญญาณใยแก้ว", value: "Corning OM4 Multi-Mode & OS2 Single-Mode" },
          { label: "ระบบสายไฟเบอร์", value: "High-Density MPO/MTP Patch Panels" }
        ],
        telemetry: [
          { label: "ปริมาณข้อมูลผ่านสวิตช์", value: "3.42 Gbps (Peak)", color: "text-cyan-400" },
          { label: "อัตราสูญเสียแพ็กเก็ต", value: "0.000 % (Zero Loss)", color: "text-emerald-400" },
          { label: "เวลาหน่วง (Latency)", value: "0.45 มิลลิวินาที (Ultra-low)", color: "text-emerald-400" },
          { label: "สถานะ Uplink คู่", value: "Dual Link LACP Active", color: "text-cyan-400" }
        ],
        role: "เชื่อมต่อทราฟฟิกข้อมูลทั้งหมดระหว่างเซิร์ฟเวอร์ในศูนย์ข้อมูล และเชื่อมโยงออกสู่เครือข่ายอินเทอร์เน็ตภายนอก",
        importance: "การออกแบบ Spine-Leaf แบบคู่ขนานรับประกันว่าหากสวิตช์ตัวใดตัวหนึ่งเสียหาย ทราฟฟิกจะสลับไปอีกเส้นทางได้ทันที",
        failureImpact: "หากเกิดคอขวดหรือสวิตช์เครือข่ายหลักล้มเหลว ผู้ใช้ภายนอกจะไม่สามารถเข้าถึงเว็บไซต์หรือแอปพลิเคชันได้เลย"
      },
      "security-access": {
        id: "security-access",
        number: 8,
        name: "ระบบควบคุมการเข้าออกและความปลอดภัย (Access Control & Security)",
        zoneTitle: "8. ACCESS CONTROL & SECURITY",
        category: "PHYSICAL SECURITY & COMPLIANCE",
        model: "Suprema FaceStation 2 & Axis 4K AI Security Dome",
        standard: "ISO/IEC 27001 Annex A.11 / TIA-942 Physical Security",
        image: securityImg,
        specs: [
          { label: "การยืนยันตัวตน", value: "Dual Biometric (ใบหน้า 3D + ลายนิ้วมือ + RFID)" },
          { label: "ประตูป้องกันการแอบตาม", value: "Airlock Security Mantrap Booth" },
          { label: "กล้องวงจรปิด", value: "Axis 4K AI Dome with Night Vision & Motion AI" },
          { label: "บันทึกข้อมูลการเข้าออก", value: "Audit Log เข้ารหัส 256-bit ย้อนหลัง 1 ปี" }
        ],
        telemetry: [
          { label: "สถานะประตูด้านหน้า", value: "Locked & Secured", color: "text-emerald-400" },
          { label: "CCTV 4K Surveillance", value: "All Channels Online 24/7", color: "text-emerald-400" },
          { label: "การพยายามเข้าผิดปกติ", value: "0 ครั้ง (Safe)", color: "text-emerald-400" },
          { label: "ระบบสำรองไฟประตู", value: "Fail-Secure with Battery Backup", color: "text-cyan-400" }
        ],
        role: "ควบคุมการเข้า-ออกของบุคคล ป้องกันบุคคลภายนอกที่ไม่ได้รับอนุญาต และบันทึกประวัติการเข้าพื้นที่อย่างเคร่งครัด",
        importance: "ความปลอดภัยทางกายภาพคือด่านแรกสุดในการปกป้องข้อมูลของลูกค้า และเป็นข้อกำหนดบังคับของมาตรฐานสากล ISO 27001",
        failureImpact: "หากระบบความปลอดภัยหละหลวม บุคคลภายนอกอาจเข้ามาดึงสายไฟ ถอดดิสก์ หรือก่อวินาศกรรมข้อมูลได้โดยตรง"
      }
    }
  },
  en: {
    drawerTitle: "Physical Hardware Inspector",
    closeBtn: "Close Inspector",
    specsTitle: "Engineering Specifications",
    telemetryTitle: "Live Real-Time Telemetry",
    roleTitle: "Data Center Role & Responsibility",
    importanceTitle: "Why is this component vital?",
    impactTitle: "Failure Impact Analysis",
    viewIn3d: "Focus in 3D View",
    inspectHint: "Click or tap any zone pin in 3D/2D to inspect real hardware photographs and engineering specs",
    roomZoningTitle: "ROOM ZONING (Architectural Layout)",
    roomZoningSub: "Global Data Center standard layout for physical security, thermal isolation, and scalability",
    detailZoneTitle: "DETAIL ZONE (8 Core Enterprise Facilities)",
    detailZoneSub: "Click any card to inspect real studio photographs and engineering telemetry",
    infraTitle: "INFRASTRUCTURE SYSTEM (6 Core Pillars)",
    infraSub: "The heartbeat sustaining Tier III mission-critical 24/7 continuous operations",
    benefitsTitle: "Built for Organizations That Demand",
    benefits: [
      "Continuous 24/7 Uptime with Zero Downtime",
      "Military-Grade Data & Physical Security (ISO 27001)",
      "High Scalability (Modular Pod Architecture)",
      "Tier III Fault-Tolerant Redundancy (N+1 / 2N)",
      "Peak Energy Efficiency (PUE ≤ 1.30 Green Target)"
    ],
    systems: [
      { id: "elec", title: "Electrical System", subTitle: "Power Distribution", iconName: "Zap", desc: "Dual-feed 2N power paths with true online zero-break UPS backup" },
      { id: "cool", title: "Cooling System", subTitle: "Precision Thermal Management", iconName: "Wind", desc: "Close-coupled In-Row & CRAH units modulating temperature & humidity 24/7" },
      { id: "fire", title: "Fire Protection", subTitle: "Clean Agent Suppression", iconName: "Flame", desc: "VESDA early laser smoke detection and residue-free Novec 1230 clean gas" },
      { id: "sec", title: "Security System", subTitle: "Access Control & CCTV", iconName: "ShieldCheck", desc: "Airlock mantrap booth, multi-factor biometric authentication, 4K AI CCTV" },
      { id: "mon", title: "Monitoring System", subTitle: "Unified DCIM Platform", iconName: "Monitor", desc: "Real-time sub-second telemetry across PUE, electrical loads, and thermal maps" },
      { id: "net", title: "Network System", subTitle: "Core Spine-Leaf Fabric", iconName: "Network", desc: "High-density 100GbE spine-leaf fabric with redundant structured fiber raceways" }
    ],
    items: {
      "server-rack": {
        id: "server-rack",
        number: 1,
        name: "Server Rack Area (42U Compute & Storage)",
        zoneTitle: "1. SERVER RACK AREA",
        category: "COMPUTE & STORAGE",
        model: "APC NetShelter SX 42U (EIA-310-E Standard)",
        standard: "TIA-942 / ASHRAE A1 Class",
        image: serverImg,
        specs: [
          { label: "Rack Form Factor", value: "42U (2,000mm x 600mm x 1,070mm)" },
          { label: "Compute Hardware", value: "Dell PowerEdge R750 2U Dual Xeon Platinum" },
          { label: "Memory Density", value: "512GB ECC Registered DDR5" },
          { label: "Power Delivery", value: "Dual 1600W Titanium 96% Efficiency" }
        ],
        telemetry: [
          { label: "IT Power Draw", value: "1,781.9 W", color: "text-cyan-400" },
          { label: "Intake Air Temp", value: "21.5 °C", color: "text-emerald-400" },
          { label: "Cluster Health", value: "5/5 Nodes Online", color: "text-emerald-400" },
          { label: "Power Source", value: "Feed A + B Dual Active", color: "text-cyan-400" }
        ],
        role: "Central operating row housing server blades, high-throughput NVMe storage, and virtualization clusters.",
        importance: "Generates 100% of digital workload throughput while converting all electrical wattage directly into heat.",
        failureImpact: "Failure triggers automated hypervisor failover. Thermal overload past 85°C triggers immediate CPU safety cutoffs."
      },
      "ups-battery": {
        id: "ups-battery",
        number: 2,
        name: "UPS & Battery Room (2N Modular Power)",
        zoneTitle: "2. UPS & BATTERY ROOM",
        category: "CRITICAL POWER INFRASTRUCTURE",
        model: "APC Symmetra PX 48kW / Galaxy VX Modular",
        standard: "IEC 62040-3 (Class 1 VFI-SS-111)",
        image: upsImg,
        specs: [
          { label: "Topology Classification", value: "True Online Double-Conversion (VFI)" },
          { label: "Rated Capacity", value: "48 kW / 48 kVA N+1 Modular" },
          { label: "Battery Chemistry", value: "Modular Li-Ion / VRLA Battery Trays" },
          { label: "Conversion Efficiency", value: "97.5% Continuous Online" }
        ],
        telemetry: [
          { label: "Battery Charge State", value: "100 %", color: "text-emerald-400" },
          { label: "Reserve Runtime", value: "28 Minutes @ Full Load", color: "text-cyan-400" },
          { label: "Transfer Time", value: "0 ms (Zero Break)", color: "text-emerald-400" },
          { label: "Utility Grid Input", value: "400V 3-Phase 50Hz", color: "text-slate-300" }
        ],
        role: "Continuously cleans utility grid voltage and provides instantaneous battery power during grid blackout transitions.",
        importance: "Zero-millisecond transfer prevents servers from rebooting while diesel generators synchronize and take over the load.",
        failureImpact: "Without double-conversion protection, a 20ms utility flicker causes immediate facility-wide crash and disk corruption."
      },
      "cooling": {
        id: "cooling",
        number: 3,
        name: "Precision Air Conditioning (In-Row & CRAH)",
        zoneTitle: "3. PRECISION AIR CONDITIONING",
        category: "PRECISION THERMAL MANAGEMENT",
        model: "Schneider APC InRow RC 60kW & Perimeter CRAH",
        standard: "ASHRAE TC 9.9 Thermal Guidelines",
        image: coolingImg,
        specs: [
          { label: "Cooling Capacity", value: "60 kW Net Sensible Cooling" },
          { label: "Fan Technology", value: "Variable Speed Modulating EC Fans" },
          { label: "Chilled Water Flow", value: "1.8 L/s @ 7°C Entering Water" },
          { label: "Humidity Target", value: "Relative Humidity 45% - 55% RH" }
        ],
        telemetry: [
          { label: "Supply Air Temp", value: "21.5 °C", color: "text-sky-400" },
          { label: "Return Air Temp", value: "38.2 °C", color: "text-rose-400" },
          { label: "Thermal Delta (ΔT)", value: "16.7 °C", color: "text-amber-400" },
          { label: "EC Fan Modulation", value: "62 %", color: "text-emerald-400" }
        ],
        role: "Maintains optimal temperature and humidity 24/7 by recirculating server exhaust through chilled water coils.",
        importance: "Close-coupled cooling minimizes fan power and eliminates hot spots, keeping facility PUE well under 1.30.",
        failureImpact: "HVAC failure causes rapid thermal accumulation; server intake temps exceed 32°C within 90 seconds, causing throttling."
      },
      "containment": {
        id: "containment",
        number: 4,
        name: "Hot / Cold Aisle Containment Pod",
        zoneTitle: "4. HOT AISLE / COLD AISLE",
        category: "CONTAINMENT & AIRFLOW INFRASTRUCTURE",
        model: "EcoAisle Modular Thermal Containment System",
        standard: "ASHRAE TC 9.9 Thermal Guidelines",
        image: containmentImg,
        specs: [
          { label: "Ceiling Material", value: "Light-transmitting Polycarbonate" },
          { label: "Aisle Doors", value: "Dual Sliding Glass with Magnetic Seals" },
          { label: "Air Leakage Rate", value: "< 1.0% Infiltration" },
          { label: "Floor Guidance", value: "Smart LED Floor Strip Lighting" }
        ],
        telemetry: [
          { label: "Cold Aisle Temp", value: "21.5 °C", color: "text-sky-400" },
          { label: "Hot Aisle Temp", value: "38.2 °C", color: "text-rose-400" },
          { label: "Air Mixing Ratio", value: "0.0 % (Optimal Isolation)", color: "text-emerald-400" },
          { label: "HVAC Efficiency Gain", value: "35 % Power Saved", color: "text-emerald-400" }
        ],
        role: "Physically decouples cold intake air from scorching server exhaust, preventing recirculation and hot spots.",
        importance: "Enables chiller coils to operate at highest thermodynamic efficiency by ingesting 38°C exhaust rather than mixed air.",
        failureImpact: "Propping open containment doors allows hot air bypass, raising server inlet temps by 6-8°C almost immediately."
      },
      "fire-suppression": {
        id: "fire-suppression",
        number: 5,
        name: "Fire Suppression System (Novec 1230 & VESDA)",
        zoneTitle: "5. FIRE SUPPRESSION SYSTEM",
        category: "SAFETY & ASSET PROTECTION",
        model: "Kidde / Johnson Controls Novec 1230 & VESDA VLP",
        standard: "NFPA 2001 / NFPA 75 Standard for IT Equipment",
        image: fireImg,
        specs: [
          { label: "Extinguishing Agent", value: "3M Novec 1230 Clean Agent / FM-200" },
          { label: "Storage Pressure", value: "25 Bar (360 PSI) Superpressurized with N2" },
          { label: "Detection Technology", value: "VESDA High Sensitivity Laser Smoke Detection" },
          { label: "Discharge Time", value: "Full Room Flooding within 10 Seconds" }
        ],
        telemetry: [
          { label: "Cylinder Pressure", value: "25.2 Bar (Nominal)", color: "text-emerald-400" },
          { label: "VESDA Obscuration", value: "0.00% / m (Clean Air)", color: "text-emerald-400" },
          { label: "Interlock Status", value: "Armed & Ready 24/7", color: "text-cyan-400" },
          { label: "Protected Area", value: "100% Facility Coverage", color: "text-slate-300" }
        ],
        role: "Detects incipient smoke particles long before open flame occurs and discharges clean gas without water residue.",
        importance: "Electrically non-conductive and zero residue—extinguishes fires without damaging delicate microchips or disks.",
        failureImpact: "Without clean gas suppression, electrical fire requires water sprinkler activation, destroying 100% of servers."
      },
      "dcim-noc": {
        id: "dcim-noc",
        number: 6,
        name: "Monitoring & DCIM (NOC Command Center)",
        zoneTitle: "6. MONITORING & DCIM",
        category: "DCIM & OPERATIONS CENTER",
        model: "InfraPulse Unified DCIM Platform & 6-Screen NOC Console",
        standard: "ISO/IEC 27001 / SOC 2 Type II",
        image: nocImg,
        specs: [
          { label: "Display Wall", value: "6x 43-inch 4K Curved Command Screens" },
          { label: "Field Protocols", value: "SNMP v3, Modbus TCP, BACnet, REST API" },
          { label: "Sampling Interval", value: "1-Second Sub-second Telemetry Engine" },
          { label: "Notification Channels", value: "SMS, Email, Webhook, Telegram Bot, Siren" }
        ],
        telemetry: [
          { label: "Overall Facility PUE", value: "1.205 (Optimal)", color: "text-emerald-400" },
          { label: "Feed A / B Balance", value: "3.2A / 2.8A (Balanced)", color: "text-cyan-400" },
          { label: "Active Incidents", value: "0 Critical / 0 Warning", color: "text-emerald-400" },
          { label: "Platform Uptime", value: "99.999% High Availability", color: "text-emerald-400" }
        ],
        role: "Unified operations console monitoring power loads, cooling performance, thermal metrics, and network bandwidth in real time.",
        importance: "Provides proactive warnings before faults escalate into outages, guaranteeing 99.999% facility SLA.",
        failureImpact: "Loss of DCIM leaves operators blind to electrical overload, water leaks, or HVAC failure until hard crash occurs."
      },
      "network-room": {
        id: "network-room",
        number: 7,
        name: "Network Core Room (Spine-Leaf & Fiber)",
        zoneTitle: "7. NETWORK ROOM",
        category: "NETWORK INFRASTRUCTURE",
        model: "Cisco Nexus 9000 & Arista 7060X 100G Spine-Leaf",
        standard: "IEEE 802.3ck / TIA-568 Structured Cabling",
        image: networkImg,
        specs: [
          { label: "Fabric Architecture", value: "Spine-Leaf Non-Blocking Fabric" },
          { label: "Uplink Density", value: "32x 100GbE QSFP28 Uplinks per Switch" },
          { label: "Optical Cabling", value: "Corning OM4 Multi-Mode & OS2 Single-Mode" },
          { label: "Interconnect Density", value: "High-Density MPO/MTP Patch Panels" }
        ],
        telemetry: [
          { label: "Throughput Rate", value: "3.42 Gbps (Active Traffic)", color: "text-cyan-400" },
          { label: "Packet Loss Rate", value: "0.000 % (Flawless)", color: "text-emerald-400" },
          { label: "Fabric Latency", value: "0.45 ms (Ultra-low)", color: "text-emerald-400" },
          { label: "Uplink Redundancy", value: "Dual Link LACP Active", color: "text-cyan-400" }
        ],
        role: "Routes internal east-west container traffic and terminates redundant telecom carriers to the public internet.",
        importance: "Non-blocking spine-leaf fabric guarantees that any server can communicate with any other server at wire speed.",
        failureImpact: "Core network outage causes total disconnection of all cloud services, isolating the facility from the outside world."
      },
      "security-access": {
        id: "security-access",
        number: 8,
        name: "Access Control & Security (Airlock & CCTV)",
        zoneTitle: "8. ACCESS CONTROL & SECURITY",
        category: "PHYSICAL SECURITY & COMPLIANCE",
        model: "Suprema FaceStation 2 & Axis 4K AI Security Dome",
        standard: "ISO/IEC 27001 Annex A.11 / TIA-942 Physical Security",
        image: securityImg,
        specs: [
          { label: "Authentication Factor", value: "Dual Biometric (3D Face + Fingerprint + RFID)" },
          { label: "Anti-Tailgating", value: "Airlock Security Mantrap Portal" },
          { label: "Video Surveillance", value: "Axis 4K AI Dome with Motion Analytics" },
          { label: "Audit Logging", value: "256-bit Encrypted 365-Day Access History" }
        ],
        telemetry: [
          { label: "Entrance Portal", value: "Locked & Secured", color: "text-emerald-400" },
          { label: "CCTV Surveillance", value: "All Channels Online 24/7", color: "text-emerald-400" },
          { label: "Unauthorized Attempts", value: "0 Breaches (Secure)", color: "text-emerald-400" },
          { label: "Access Power Backup", value: "Fail-Secure with Battery Backup", color: "text-cyan-400" }
        ],
        role: "Restricts and records all physical human ingress into the data center white space, preventing unauthorized tampering.",
        importance: "Physical perimeter security is the bedrock of compliance standards such as ISO 27001, SOC 2, and PCI-DSS.",
        failureImpact: "Physical security compromise allows malicious actors direct hardware access to extract raw storage drives."
      }
    }
  }
};
