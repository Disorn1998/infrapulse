import serverImg from '../assets/equipment/server.webp';
import coolingImg from '../assets/equipment/cooling.webp';
import upsImg from '../assets/equipment/ups.webp';
import pduImg from '../assets/equipment/pdu.webp';
import containmentImg from '../assets/equipment/containment.webp';

export interface EquipmentItem {
  id: string;
  name: string;
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
    inspectHint: "คลิกหรือแตะที่อุปกรณ์ในห้อง 3D เพื่อดูรูปถ่ายฮาร์ดแวร์จริงและสเปก",
    items: {
      "rack-a": {
        id: "rack-a",
        name: "ตู้แร็คเซิร์ฟเวอร์ 42U (Compute Rack A)",
        category: "COMPUTE & STORAGE",
        model: "APC NetShelter SX 42U (EIA-310-E Standard)",
        standard: "TIA-942 / ASHRAE A1 Class",
        image: serverImg,
        specs: [
          { label: "ความสูงตู้แร็ค", value: "42U (2,000mm x 600mm x 1,070mm)" },
          { label: "หน่วยประมวลผล", value: "Dual Intel Xeon Platinum / AMD EPYC" },
          { label: "หน่วยความจำ", value: "512GB ECC Registered DDR5" },
          { label: "พาวเวอร์ซัพพลาย", value: "Dual 1600W Titanium 96% Efficiency" }
        ],
        telemetry: [
          { label: "กำลังไฟฟ้า IT Load", value: "959.3 W", color: "text-cyan-400" },
          { label: "อุณหภูมิลมจ่าย (Supply)", value: "21.5 °C", color: "text-emerald-400" },
          { label: "สถานะการทำงาน", value: "Normal Online", color: "text-emerald-400" },
          { label: "สายไฟหลัก", value: "Feed A (Active)", color: "text-cyan-400" }
        ],
        role: "ติดตั้งเซิร์ฟเวอร์เบลดขนาด 1U/2U สำหรับรันเวิร์กโหลดคลาวด์ ฐานข้อมูล และประมวลผลแอปพลิเคชันของผู้ใช้งาน",
        importance: "เป็นต้นกำเนิดรายได้และพลังประมวลผลทั้งหมดของศูนย์ข้อมูล แต่ก็เป็นจุดที่ใช้พลังงานไฟฟ้าสูงสุดและแปลงไฟเป็นความร้อน 100%",
        failureImpact: "หากเซิร์ฟเวอร์หยุดทำงาน เวิร์กโหลดจะถูกย้ายไปยัง Rack B อัตโนมัติ แต่หากระบบแอร์ดับ ชิปจะร้อนเกิน 85°C และตัดการทำงานภายใน 3 นาที"
      },
      "cooling": {
        id: "cooling",
        name: "แอร์ควบคุมอุณหภูมิความแม่นยำสูง (In-Row Precision Cooler)",
        category: "PRECISION THERMAL MANAGEMENT",
        model: "Schneider APC InRow RC 60kW Chilled Water",
        standard: "ASHRAE TC 9.9 Thermal Guidelines",
        image: coolingImg,
        specs: [
          { label: "พิกัดการทำความเย็น", value: "60 kW Net Sensible Cooling" },
          { label: "พัดลมระบายอากาศ", value: "Variable Speed EC Fans (Modulating)" },
          { label: "อัตราการไหลน้ำเย็น", value: "Chilled Water 1.8 L/s @ 7°C" },
          { label: "อุณหภูมิลมเป่าจ่าย", value: "20.0°C - 22.0°C Precision Control" }
        ],
        telemetry: [
          { label: "อุณหภูมิลมจ่าย (Supply)", value: "21.5 °C", color: "text-sky-400" },
          { label: "อุณหภูมิดูดกลับ (Exhaust)", value: "38.2 °C", color: "text-rose-400" },
          { label: "ค่าผลต่างอุณหภูมิ (ΔT)", value: "16.7 °C", color: "text-amber-400" },
          { label: "ความเร็วพัดลม EC Fan", value: "62 %", color: "text-emerald-400" }
        ],
        role: "ติดตั้งขนาบข้างตู้เซิร์ฟเวอร์ เพื่อดูดลมร้อน 38°C จากด้านหลังตู้ ผ่านคอยล์น้ำเย็น แล้วเป่าลมเย็น 21.5°C วนกลับมาด้านหน้าตู้",
        importance: "การวางแอร์ประชิดตู้ (In-Row) ช่วยลดระยะทางการเดินทางของลม ทำให้ใช้พลังงานพัดลมน้อยลง และช่วยให้ค่า PUE ต่ำกว่า 1.30 ตามเกณฑ์ BOI",
        failureImpact: "หากแอร์ In-Row ดับ อุณหภูมิในช่องทางเดินลมร้อนจะสะสมจนเซิร์ฟเวอร์เริ่มร้อนจัด (Thermal Throttling) ภายใน 90 วินาที"
      },
      "rack-b": {
        id: "rack-b",
        name: "ตู้แร็คเซิร์ฟเวอร์ 42U (Compute Rack B)",
        category: "COMPUTE & STORAGE",
        model: "APC NetShelter SX 42U (EIA-310-E Standard)",
        standard: "TIA-942 / ASHRAE A1 Class",
        image: serverImg,
        specs: [
          { label: "ความสูงตู้แร็ค", value: "42U (2,000mm x 600mm x 1,070mm)" },
          { label: "ฮาร์ดแวร์พิเศษ", value: "AI Inference Accelerator Clusters" },
          { label: "เครือข่ายความเร็วสูง", value: "Dual 100GbE QSFP28 Uplinks" },
          { label: "พาวเวอร์ซัพพลาย", value: "Dual 1600W Titanium 96% Efficiency" }
        ],
        telemetry: [
          { label: "กำลังไฟฟ้า IT Load", value: "822.6 W", color: "text-emerald-400" },
          { label: "อุณหภูมิลมจ่าย (Supply)", value: "21.4 °C", color: "text-emerald-400" },
          { label: "สถานะการทำงาน", value: "Normal Online", color: "text-emerald-400" },
          { label: "สายไฟหลัก", value: "Feed B (Active)", color: "text-emerald-400" }
        ],
        role: "ตู้เซิร์ฟเวอร์แถวคู่ขนานสำหรับรันคลัสเตอร์โมเดลภาษา AI และการวิเคราะห์ข้อมูลความเร็วสูง",
        importance: "ทำงานสอดประสานกับ Rack A โดยเชื่อมต่อสายไฟคนละ Feed (Feed B) เพื่อรับประกันความต่อเนื่องทางธุรกิจ 100%",
        failureImpact: "หากเกิดปัญหากับ Rack B งานคำนวณจะถูกโยกกลับไปที่ Rack A ได้อย่างราบรื่นโดยผู้ใช้งานภายนอกไม่รู้สึกถึงความสะดุด"
      },
      "ups": {
        id: "ups",
        name: "ระบบสำรองไฟโมดูลาร์ 2N (Modular Online Double-Conversion UPS)",
        category: "CRITICAL POWER INFRASTRUCTURE",
        model: "APC Symmetra PX 48kW / Schneider Galaxy VX",
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
          { label: "แรงดันไฟอินพุต", value: "400V 3-Phase 50Hz", color: "text-slate-300" },
          { label: "เวลาถ่ายโอนไฟ (Transfer)", value: "0 มิลลิวินาที (Zero Break)", color: "text-emerald-400" }
        ],
        role: "แปลงไฟฟ้าจากการไฟฟ้าเป็นกระแสตรง (DC) เพื่อชาร์จแบตเตอรี่ และแปลงกลับเป็นกระแสสลับ (AC) บริสุทธิ์ป้อนให้เซิร์ฟเวอร์ตลอด 24 ชั่วโมง",
        importance: "รับประกันเวลาสลับไฟ 0 มิลลิวินาที (Zero Transfer Time) แม้การไฟฟ้าดับวูบ เซิร์ฟเวอร์จะไม่รีบูตเด็ดขาด",
        failureImpact: "หากระบบ UPS ล้มเหลวและไฟตกเพียง 0.02 วินาที เซิร์ฟเวอร์ทุกตู้จะดับพร้อมกัน ข้อมูลในแรมจะสูญหายทันที"
      },
      "pdu": {
        id: "pdu",
        name: "รางจ่ายไฟตู้แร็คอัจฉริยะ (Intelligent Dual-Feed 0U Rack PDU)",
        category: "POWER DISTRIBUTION (PDU)",
        model: "Raritan PX3-5000 Series (32A Dual Input)",
        standard: "NEC Section 645 / IEC 60320",
        image: pduImg,
        specs: [
          { label: "รูปแบบการติดตั้ง", value: "0U Vertical Tool-less Mount" },
          { label: "พิกัดกระแสไฟฟ้า", value: "32A 230V Single-Phase (Feed A & B)" },
          { label: "จำนวนเต้ารับ", value: "24x IEC C13 + 6x IEC C19 Locking" },
          { label: "ความแม่นยำของมิเตอร์", value: "Billing-Grade ±1% True RMS" }
        ],
        telemetry: [
          { label: "กระแสไฟสาย Feed A", value: "3.2 A", color: "text-cyan-400" },
          { label: "กระแสไฟสาย Feed B", value: "2.8 A", color: "text-emerald-400" },
          { label: "แรงดันไฟฟ้า", value: "230.4 V", color: "text-slate-300" },
          { label: "ระยะเผื่อความปลอดภัย", value: "+1,162 W (NEC 80% Safe)", color: "text-emerald-400" }
        ],
        role: "ติดตั้งแนบข้างเสาหลังตู้แร็ค รับไฟจาก Feed A และ Feed B จ่ายไปยังเพาเวอร์ซัพพลาย (PSU) ของเซิร์ฟเวอร์ทุกเครื่องในตู้",
        importance: "วัดกระแสไฟแบบ Real-Time ส่งเข้า InfraPulse เพื่อประเมินว่าไม่มีสายใดโหลดเกินเกณฑ์ NEC 80% ป้องกันไฟกระชากทริปเบรกเกอร์",
        failureImpact: "หากสาย Feed A ขัดข้อง เซิร์ฟเวอร์จะดึงไฟจากสาย Feed B แทนทันที 100% โดยไม่มีการดับแม้แต่วินาทีเดียว"
      },
      "containment": {
        id: "containment",
        name: "ระบบกักแยกทางเดินลมเย็นและลมร้อน (Hot/Cold Aisle Containment)",
        category: "CONTAINMENT & AIRFLOW INFRASTRUCTURE",
        model: "EcoAisle Modular Thermal Containment System",
        standard: "ASHRAE TC 9.9 Thermal Guidelines",
        image: containmentImg,
        specs: [
          { label: "วัสดุแผงกั้นเพดาน", value: "Light-transmitting Polycarbonate" },
          { label: "ประตูทางเดิน", value: "Dual Sliding Glass with Magnetic Seals" },
          { label: "การกักลมรั่วไหล", value: "Air Leakage Rate < 1.0%" },
          { label: "ไฟส่องสว่างนำทาง", value: "Smart LED Floor Guidance Strip" }
        ],
        telemetry: [
          { label: "อุณหภูมิทางเดินลมเย็น", value: "21.5 °C", color: "text-sky-400" },
          { label: "อุณหภูมิทางเดินลมร้อน", value: "38.2 °C", color: "text-rose-400" },
          { label: "อัตราลมปะปน (Mixing)", value: "0.0 % (สมบูรณ์แบบ)", color: "text-emerald-400" },
          { label: "พลังงานแอร์ที่ประหยัดได้", value: "35 %", color: "text-emerald-400" }
        ],
        role: "ใช้แผงกั้นใสและประตูกระจกบานเลื่อน เพื่อแยก 'โซนลมเย็น' ด้านหน้าตู้ ออกจาก 'โซนลมร้อน' ด้านหลังตู้แบบเด็ดขาด",
        importance: "ป้องกันการลัดวงจรของลม (Air Short-Cycling) ทำให้แอร์ In-Row ดึงลมร้อนอุณหภูมิสูงกลับไปรีดความร้อนได้มีประสิทธิภาพสูงสุด",
        failureImpact: "หากเปิดประตูกักลมทิ้งไว้ ลมร้อนจะม้วนกลับเข้าหน้าตู้ ทำให้เซิร์ฟเวอร์ร้อนขึ้น 5-8°C ทันที และค่า PUE จะพุ่งสูงเกิน 1.50"
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
    inspectHint: "Click or tap any component in the 3D room to inspect real hardware photographs and specs",
    items: {
      "rack-a": {
        id: "rack-a",
        name: "42U High-Density Compute Rack A",
        category: "COMPUTE & STORAGE",
        model: "APC NetShelter SX 42U (EIA-310-E Standard)",
        standard: "TIA-942 / ASHRAE A1 Class",
        image: serverImg,
        specs: [
          { label: "Rack Height & Footprint", value: "42U (2,000mm x 600mm x 1,070mm)" },
          { label: "Processor Architecture", value: "Dual Intel Xeon Platinum / AMD EPYC" },
          { label: "Memory Density", value: "512GB ECC Registered DDR5" },
          { label: "Power Delivery", value: "Dual 1600W Titanium 96% Efficiency" }
        ],
        telemetry: [
          { label: "IT Power Draw", value: "959.3 W", color: "text-cyan-400" },
          { label: "Supply Air Temp", value: "21.5 °C", color: "text-emerald-400" },
          { label: "Operational Status", value: "Normal Online", color: "text-emerald-400" },
          { label: "Primary Power Path", value: "Feed A (Active)", color: "text-cyan-400" }
        ],
        role: "Houses standard 1U/2U enterprise server chassis executing mission-critical cloud containers, database transactions, and client web traffic.",
        importance: "It is the direct compute engine of the facility, generating all digital throughput while converting 100% of its electrical wattage directly into thermal heat.",
        failureImpact: "If computing fails, hypervisors migrate workloads to Rack B automatically. If cooling fails, CPU temperatures exceed 85°C, triggering thermal safety shutdown within 3 minutes."
      },
      "cooling": {
        id: "cooling",
        name: "In-Row Precision Chilled Water Cooler",
        category: "PRECISION THERMAL MANAGEMENT",
        model: "Schneider APC InRow RC 60kW Chilled Water",
        standard: "ASHRAE TC 9.9 Thermal Guidelines",
        image: coolingImg,
        specs: [
          { label: "Cooling Capacity", value: "60 kW Net Sensible Cooling" },
          { label: "Blower Technology", value: "Modulating Variable Speed EC Fans" },
          { label: "Chilled Water Flow", value: "1.8 L/s @ 7°C Entering Water" },
          { label: "Supply Air Target", value: "20.0°C - 22.0°C Precision Window" }
        ],
        telemetry: [
          { label: "Supply Air Temp", value: "21.5 °C", color: "text-sky-400" },
          { label: "Exhaust Return Temp", value: "38.2 °C", color: "text-rose-400" },
          { label: "Temperature Delta (ΔT)", value: "16.7 °C", color: "text-amber-400" },
          { label: "EC Fan Modulation", value: "62 %", color: "text-emerald-400" }
        ],
        role: "Placed directly adjacent to high-density racks to capture 38°C hot air exhaust before it mixes, chilling it and discharging 21.5°C air into the cold aisle.",
        importance: "Close-coupled In-Row cooling drastically minimizes fan horsepower and hot-spot risks, driving PUE below the BOI target of 1.30.",
        failureImpact: "Loss of In-Row cooling causes immediate hot aisle thermal runaway. Server intake air rises past 32°C within 90 seconds, causing thermal throttling."
      },
      "rack-b": {
        id: "rack-b",
        name: "42U High-Density Compute Rack B",
        category: "COMPUTE & STORAGE",
        model: "APC NetShelter SX 42U (EIA-310-E Standard)",
        standard: "TIA-942 / ASHRAE A1 Class",
        image: serverImg,
        specs: [
          { label: "Rack Height & Footprint", value: "42U (2,000mm x 600mm x 1,070mm)" },
          { label: "Accelerated Hardware", value: "AI GPU Inference Clusters" },
          { label: "Fabric Interconnect", value: "Dual 100GbE QSFP28 Uplinks" },
          { label: "Power Delivery", value: "Dual 1600W Titanium 96% Efficiency" }
        ],
        telemetry: [
          { label: "IT Power Draw", value: "822.6 W", color: "text-emerald-400" },
          { label: "Supply Air Temp", value: "21.4 °C", color: "text-emerald-400" },
          { label: "Operational Status", value: "Normal Online", color: "text-emerald-400" },
          { label: "Primary Power Path", value: "Feed B (Active)", color: "text-emerald-400" }
        ],
        role: "Redundant compute row hosting artificial intelligence inference models and high-throughput real-time streaming engines.",
        importance: "Connected to power Feed B to provide true 2N physical separation and continuous disaster recovery tolerance.",
        failureImpact: "In the event of maintenance or localized outage, workloads gracefully fail over to Rack A without service interruption."
      },
      "ups": {
        id: "ups",
        name: "Modular 2N Online Double-Conversion UPS",
        category: "CRITICAL POWER INFRASTRUCTURE",
        model: "APC Symmetra PX 48kW / Schneider Galaxy VX",
        standard: "IEC 62040-3 (Class 1 VFI-SS-111)",
        image: upsImg,
        specs: [
          { label: "Topology Classification", value: "True Online Double-Conversion (VFI)" },
          { label: "Rated Capacity", value: "48 kW / 48 kVA N+1 Modular" },
          { label: "Battery Chemistry", value: "Modular Li-Ion / VRLA Battery Trays" },
          { label: "Double-Conversion Efficiency", value: "97.5% Continuous" }
        ],
        telemetry: [
          { label: "Battery Charge State", value: "100 %", color: "text-emerald-400" },
          { label: "Reserve Runtime", value: "28 Minutes @ Rated Load", color: "text-cyan-400" },
          { label: "Grid Utility Voltage", value: "400V 3-Phase 50Hz", color: "text-slate-300" },
          { label: "Transfer Time", value: "0 ms (Seamless Inverter)", color: "text-emerald-400" }
        ],
        role: "Continuously rectifies utility grid power to DC bus and inverts back to pristine AC, guaranteeing clean power with zero sags, surges, or harmonics.",
        importance: "Provides zero-millisecond transfer time so servers never reboot during utility power spikes, blackouts, or generator startup transitions.",
        failureImpact: "Without double-conversion UPS protection, a 20-millisecond power flicker causes immediate catastrophic server crashes and data corruption."
      },
      "pdu": {
        id: "pdu",
        name: "Intelligent Dual-Feed 0U Rack PDU",
        category: "POWER DISTRIBUTION (PDU)",
        model: "Raritan PX3-5000 Series (32A Dual Input)",
        standard: "NEC Section 645 / IEC 60320",
        image: pduImg,
        specs: [
          { label: "Mounting Profile", value: "0U Vertical Tool-less Mount" },
          { label: "Branch Circuit Capacity", value: "32A 230V Single-Phase (Feed A & B)" },
          { label: "Receptacle Density", value: "24x IEC C13 + 6x IEC C19 Locking" },
          { label: "Metering Accuracy", value: "Billing-Grade ±1% True RMS" }
        ],
        telemetry: [
          { label: "Feed A Current Draw", value: "3.2 A", color: "text-cyan-400" },
          { label: "Feed B Current Draw", value: "2.8 A", color: "text-emerald-400" },
          { label: "Line Voltage", value: "230.4 V", color: "text-slate-300" },
          { label: "Continuous Safety Margin", value: "+1,162 W (NEC 80% Safe)", color: "text-emerald-400" }
        ],
        role: "Distributes utility power from Feed A and Feed B directly to redundant server power supply units (PSUs) at the rear of the rack.",
        importance: "Streams outlet-level current telemetry into InfraPulse to guarantee loads never breach the NEC 80% continuous safety limit.",
        failureImpact: "If Feed A trips or loses utility input, all servers seamlessly draw their entire operating current from Feed B with zero interruption."
      },
      "containment": {
        id: "containment",
        name: "Hot / Cold Aisle Containment Pod",
        category: "CONTAINMENT & AIRFLOW INFRASTRUCTURE",
        model: "EcoAisle Modular Thermal Containment System",
        standard: "ASHRAE TC 9.9 Thermal Guidelines",
        image: containmentImg,
        specs: [
          { label: "Ceiling Panel Material", value: "Light-transmitting Polycarbonate" },
          { label: "Entry Barrier", value: "Dual Sliding Glass Doors with Magnetic Seals" },
          { label: "Air Infiltration Seal", value: "Air Leakage Rate < 1.0%" },
          { label: "Guidance Lighting", value: "Smart LED Floor Guidance Strip" }
        ],
        telemetry: [
          { label: "Cold Aisle Temperature", value: "21.5 °C", color: "text-sky-400" },
          { label: "Hot Aisle Exhaust Temp", value: "38.2 °C", color: "text-rose-400" },
          { label: "Air Mixing Ratio", value: "0.0 % (Optimal Isolation)", color: "text-emerald-400" },
          { label: "HVAC Energy Savings", value: "35 %", color: "text-emerald-400" }
        ],
        role: "Uses rigid transparent ceiling tiles and sliding doors to physically decouple chilled intake air from scorching server exhaust.",
        importance: "Completely prevents thermal recirculation and short-cycling, allowing In-Row cooling coils to operate at peak thermodynamic efficiency.",
        failureImpact: "Leaving containment doors propped open allows hot exhaust to bypass into server inlets, increasing server temps by 5-8°C and worsening PUE past 1.50."
      }
    }
  }
};
