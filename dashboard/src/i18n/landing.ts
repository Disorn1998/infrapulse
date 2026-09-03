import { EquipmentI18n, equipmentData } from './equipmentData';

export interface LandingTranslation {
  nav: {
    brand: string;
    primerBadge: string;
    pillars: string;
    howItWorks: string;
    keyMetrics: string;
    liveBtn: string;
    simBtn: string;
  };
  hero: {
    kicker: string;
    titleLine1: string;
    titleHighlight: string;
    titleLine2: string;
    subtitle: string;
    badgePUE: string;
    badgeRedundancy: string;
    badgeTier: string;
    ctaLive: string;
    ctaLiveSub: string;
    ctaSim: string;
    ctaSimSub: string;
    scrollDown: string;
  };
  dcimIntro: {
    badge: string;
    title: string;
    desc1: string;
    desc2: string;
    highlightFact: string;
    quoteAuthor: string;
  };
  blocks: {
    badge: string;
    title: string;
    subtitle: string;
    items: {
      id: string;
      title: string;
      tag: string;
      desc: string;
      specs: string[];
      role: string;
    }[];
  };
  flow: {
    badge: string;
    title: string;
    subtitle: string;
    steps: {
      step: string;
      title: string;
      tech: string;
      desc: string;
      latencyOrMetric: string;
    }[];
  };
  metrics: {
    badge: string;
    title: string;
    subtitle: string;
    cards: {
      id: string;
      title: string;
      formula: string;
      benchmark: string;
      desc: string;
      highlight: string;
    }[];
  };
  modes: {
    badge: string;
    title: string;
    subtitle: string;
    live: {
      title: string;
      badge: string;
      desc: string;
      bulletPoints: string[];
      cta: string;
      note: string;
    };
    sim: {
      title: string;
      badge: string;
      desc: string;
      bulletPoints: string[];
      cta: string;
      note: string;
    };
  };
  equipment: EquipmentI18n;
  footer: {
    tagline: string;
    standards: string;
    backToTop: string;
    openDashboard: string;
  };
}

export const landingTranslations: { th: LandingTranslation; en: LandingTranslation } = {
  th: {
    nav: {
      brand: "INFRAPULSE",
      primerBadge: "DCIM PRIMER",
      pillars: "4 เสาหลักศูนย์ข้อมูล",
      howItWorks: "การทำงานของระบบ",
      keyMetrics: "ดัชนีชี้วัดสำคัญ (PUE/N+1)",
      liveBtn: "🟢 Live Production",
      simBtn: "🎮 Sim Lab",
    },
    hero: {
      kicker: "MODERN DCIM & DATA CENTER ARCHITECTURE",
      titleLine1: "เบื้องหลังอินเทอร์เน็ต",
      titleHighlight: "ศูนย์ข้อมูล (Data Center)",
      titleLine2: "ทำงานอย่างไร?",
      subtitle: "เจาะลึกวิศวกรรมโครงสร้างพื้นฐานดิจิทัล: การผสานกันระหว่างการประมวลผลเซิร์ฟเวอร์, พลังงานไฟฟ้าสำรอง 2N, ระบบแอร์ควบคุมอุณหภูมิความแม่นยำสูง และการเชื่อมต่อความเร็วแสง สู่การมอนิเตอร์ระดับเสี้ยววินาที",
      badgePUE: "PUE ≤ 1.30 (BOI Target)",
      badgeRedundancy: "N+1 / 2N Power Feed",
      badgeTier: "Tier III High Availability",
      ctaLive: "เข้าสู่ Live Production",
      ctaLiveSub: "โหมดเชื่อมต่อเครื่องจริง 100% ปราศจากข้อมูลจำลอง",
      ctaSim: "ทดลองเล่น Sim Lab Sandbox",
      ctaSimSub: "ห้องแล็บจำลอง 5 โหนด คำนวณไฟและทดสอบไฟดับสดๆ",
      scrollDown: "เลื่อนลงเพื่อสำรวจสถาปัตยกรรม",
    },
    dcimIntro: {
      badge: "WHAT IS A DATA CENTER?",
      title: "ศูนย์ข้อมูล (Data Center) คืออะไร?",
      desc1: "ศูนย์ข้อมูล ไม่ใช่แค่ห้องเก็บคอมพิวเตอร์ทั่วไป แต่เป็นสิ่งปลูกสร้างเฉพาะทางที่ออกแบบมาเพื่อรองรับการประมวลผลและการจัดเก็บข้อมูลมหาศาลตลอด 24 ชั่วโมง 365 วัน โดยไม่มีวันดับ (Zero Downtime)",
      desc2: "เซิร์ฟเวอร์ทุกเครื่องต้องการ “พลังงานไฟฟ้าที่ไม่กระพริบแม้แต่วินาทีเดียว” และต้องการ “การระบายความร้อนระดับมิลลิวินาที” เพราะพลังงานไฟฟ้าที่จ่ายเข้าไปทั้งหมดจะแปรสภาพกลายเป็นความร้อน 100% เต็มตามกฎอุณหพลศาสตร์",
      highlightFact: "ไฟดับ 1 วินาที อาจสร้างความเสียหายหลายล้านบาท — ศูนย์ข้อมูลจึงต้องมีระบบสำรองไฟ 2 เท่า (2N Redundancy) เสมอ",
      quoteAuthor: "หลักการวิศวกรรมศูนย์ข้อมูลสากล (ASHRAE / Uptime Institute)",
    },
    blocks: {
      badge: "THE 4 CORE PILLARS",
      title: "4 องค์ประกอบหลักที่ขาดไม่ได้ในศูนย์ข้อมูล",
      subtitle: "การทำงานร่วมกันอย่างสมดุลระหว่าง ฮาร์ดแวร์, ไฟฟ้า, ระบบทำความเย็น และโครงข่ายสัญญาณ",
      items: [
        {
          id: "compute",
          title: "1. Compute & Storage (ระบบประมวลผล)",
          tag: "1U/2U RACK SERVERS",
          desc: "เซิร์ฟเวอร์ตู้แร็ค 42U ติดตั้งชิป CPU, GPU เร่งความเร็ว AI, RAM ระดับ Enterprise และ NVMe SSD จัดการเวิร์กโหลดคลาวด์ ฐานข้อมูล และเว็บเซอร์วิส",
          specs: ["Form Factor: 1U-4U Standard Rackmount", "Dual Redundant Power Supplies (PSU)", "ECC Memory & Hot-swap NVMe Drives"],
          role: "แปลงไฟฟ้าให้กลายเป็นพลังการประมวลผลและการจัดเก็บข้อมูล",
        },
        {
          id: "power",
          title: "2. Critical Power Delivery (ระบบไฟฟ้าวิกฤต)",
          tag: "2N / N+1 DUAL-FEED",
          desc: "เริ่มจากสถานีไฟฟ้าแรงสูง เข้าสู่เครื่องกำเนิดไฟฟ้าดีเซล, แบตเตอรี่สำรอง UPS แบบโมดูลาร์ และส่งผ่านตู้ PDU แยกสาย Feed A (Primary) และ Feed B (Redundant)",
          specs: ["Dual Independent Utility Feeds (Feed A + Feed B)", "Modular Online Double-Conversion UPS", "Rack PDU with Outlet-level Metering"],
          role: "จ่ายกระแสไฟฟ้าที่สะอาดและปราศจากไฟตก/ไฟกระชากตลอดเวลา",
        },
        {
          id: "cooling",
          title: "3. Precision Cooling (ระบบปรับอากาศควบคุมความชื้น)",
          tag: "IN-ROW & CONTAINMENT",
          desc: "ควบคุมทั้งอุณหภูมิลมจ่าย (20–22°C) และความชื้นสัมพัทธ์ จัดแนวทางเดินลมเย็น (Cold Aisle) และทางเดินลมร้อน (Hot Aisle) ไม่ให้ลมปะปนกัน",
          specs: ["In-Row Precision Chilled Water / DX Units", "Hot / Cold Aisle Containment Barriers", "Variable Speed EC Fans ประหยัดพลังงาน"],
          role: "ดูดซับความร้อนมหาศาลจากเซิร์ฟเวอร์และระบายออกนอกอาคาร",
        },
        {
          id: "network",
          title: "4. Network Fabric (ระบบโครงข่ายความเร็วสูง)",
          tag: "SPINE-AND-LEAF FABRIC",
          desc: "เชื่อมต่อระหว่างเซิร์ฟเวอร์ในตู้ผ่านสวิตช์ Top-of-Rack (TOR) ไปยัง Core Spine Switch ด้วยสายใยแก้วนำแสง (Fiber Optic) ความเร็ว 100G/400G",
          specs: ["Spine-and-Leaf Non-blocking Architecture", "Redundant Fiber Uplinks to Multiple ISPs (BGP)", "Sub-millisecond Internal Packet Latency"],
          role: "ลำเลียงแพ็กเก็ตข้อมูลเข้า-ออกจากเซิร์ฟเวอร์สู่ผู้ใช้งานทั่วโลก",
        },
      ],
    },
    flow: {
      badge: "LIFECYCLE OF A REQUEST",
      title: "ข้อมูล 1 คำขอเดินทางผ่านศูนย์ข้อมูลอย่างไร?",
      subtitle: "สำรวจวงจรมิลลิวินาที ตั้งแต่สัญญาณอินเทอร์เน็ตเข้าสู่ตู้แร็ค จนถึงการใช้ไฟและระบายความร้อน",
      steps: [
        {
          step: "01",
          title: "Traffic Ingress & Border BGP",
          tech: "FIBER OPTIC BORDER GATEWAY",
          desc: "ผู้ใช้กดส่งข้อมูล สัญญาณเดินทางผ่านเคเบิลใยแก้วใต้น้ำ/บนบก เข้าสู่เราเตอร์ชายแดนของศูนย์ข้อมูล",
          latencyOrMetric: "Latency: ~5-15ms",
        },
        {
          step: "02",
          title: "Security & Load Balancing",
          tech: "DDoS SHIELD & L4/L7 REVERSE PROXY",
          desc: "ตัวกรองความปลอดภัยตรวจสอบภัยคุกคาม พร้อมสวิตช์กระจายโหลดส่งต่อแพ็กเก็ตไปยังตู้แร็คปลายทาง",
          latencyOrMetric: "Inspection: <1ms",
        },
        {
          step: "03",
          title: "Server Compute Execution",
          tech: "CPU/GPU WORKLOAD SPIKE",
          desc: "ซีพียูของเครื่องโหนดดึงคำสั่งไปประมวลผล โหลดซีพียูดีดขึ้นจาก Idle (40W) สู่ Rated Load (250W-900W)",
          latencyOrMetric: "CPU Utilization: 5% -> 75%",
        },
        {
          step: "04",
          title: "PDU Electrical Draw Spike",
          tech: "FEED A + FEED B CURRENT DRAW",
          desc: "เพาเวอร์ซัพพลาย (PSU) ดึงกระแสไฟเพิ่มขึ้นจากตู้ PDU ทั้งสองสาย วัดกระแสไฟเป็นแอมแปร์แบบสดๆ",
          latencyOrMetric: "Current: +3.2 Amps @ 230V",
        },
        {
          step: "05",
          title: "Thermal Heat Dissipation",
          tech: "HEAT EXHAUST INTO HOT AISLE",
          desc: "พลังงานไฟฟ้าที่ถูกใช้เปลี่ยนเป็นความร้อน พัดลมเซิร์ฟเวอร์เป่าลมร้อน 38-42°C ออกด้านหลังตู้แร็ค",
          latencyOrMetric: "Exhaust Temp: +15°C (Delta-T)",
        },
        {
          step: "06",
          title: "In-Row Cooling Extraction & Response",
          tech: "EC FAN CYCLE & EGRESS TRAFFIC",
          desc: "แอร์ In-Row ดูดลมร้อนเข้าสู่คอยล์เย็น ส่งลมเย็น 21°C วนกลับมา และเซิร์ฟเวอร์ส่งคำตอบกลับสู่ผู้ใช้",
          latencyOrMetric: "Total Cycle: < 50ms",
        },
      ],
    },
    metrics: {
      badge: "CRITICAL METRICS",
      title: "3 ตัวเลขสำคัญที่วิศวกรศูนย์ข้อมูลต้องจับตา",
      subtitle: "มาตรฐานชี้วัดความคุ้มค่า ความปลอดภัย และประสิทธิภาพพลังงานที่ InfraPulse มอนิเตอร์จริง",
      cards: [
        {
          id: "pue",
          title: "1. PUE (Power Usage Effectiveness)",
          formula: "PUE = พลังงานรวมทั้งศูนย์ข้อมูล / พลังงานที่เซิร์ฟเวอร์ใช้จริง (IT Power)",
          benchmark: "เกณฑ์มาตรฐาน BOI ประเทศไทย: PUE ≤ 1.30 (ยิ่งใกล้ 1.0 ยิ่งประหยัดพลังงาน)",
          desc: "บอกว่าศูนย์ข้อมูลนี้จ่ายไฟไปกับระบบระบายความร้อนและอุปกรณ์เสริมมากน้อยเพียงใด หาก PUE = 1.20 หมายความว่าทุกๆ 1 วัตต์ที่เซิร์ฟเวอร์ใช้ จะเสียไฟให้แอร์และไฟสูญเสียเพียง 0.20 วัตต์เท่านั้น",
          highlight: "InfraPulse คำนวณสด: 1.205 (Optimal Pass)",
        },
        {
          id: "redundancy",
          title: "2. N+1 Electrical Redundancy",
          formula: "Safety Headroom = พิกัดความปลอดภัยสายเดียว (2,944W) - โหลดรวมทั้งหมด",
          benchmark: "มาตรฐาน NEC 80% Continuous Rule: ห้ามใช้เกิน 80% ของเบรกเกอร์",
          desc: "รับประกันว่าหากหม้อแปลงสาย Feed A ระเบิดหรือไฟดับ 100% สาย Feed B ที่เหลืออยู่เพียงสายเดียว จะต้องสามารถแบกรับโหลดเซิร์ฟเวอร์ทั้งหมดต่อได้ทันทีโดยที่เบรกเกอร์ไม่ตัด",
          highlight: "InfraPulse Headroom: +1,162W ปลอดภัยสมบูรณ์",
        },
        {
          id: "thermal",
          title: "3. Hot/Cold Aisle Delta-T (ΔT)",
          formula: "ΔT = อุณหภูมิลมร้อนด้านหลัง (Exhaust) - อุณหภูมิลมเย็นด้านหน้า (Supply)",
          benchmark: "มาตรฐาน ASHRAE TC 9.9: ลมจ่าย 18–27°C, ค่า ΔT ที่เหมาะสม 12–16°C",
          desc: "หากค่า ΔT ต่ำเกินไปแสดงว่าลมเย็นรั่วไหลโดยไม่ได้ดูดความร้อน (Short-cycling) แต่หากสูงเกิน 18°C แสดงว่าเซิร์ฟเวอร์ระบายความร้อนไม่ทัน เสี่ยงต่อการเกิดความเสียหายของฮาร์ดแวร์",
          highlight: "InfraPulse Target: Supply 21.5°C | ΔT 14.8°C",
        },
      ],
    },
    modes: {
      badge: "CHOOSE YOUR EXPERIENCE",
      title: "เลือกโหมดการใช้งานของคุณ",
      subtitle: "ระบบ InfraPulse ถูกออกแบบด้วยสถาปัตยกรรมแยก Namespace เด็ดขาด เลือกระหว่างข้อมูลจริง หรือ ห้องแล็บจำลอง",
      live: {
        title: "🟢 Live Production",
        badge: "REAL PHYSICAL INFRASTRUCTURE",
        desc: "สำหรับเชื่อมต่อกับฮาร์ดแวร์จริง เซิร์ฟเวอร์ในบ้าน โฮสต์ VM หรือเครื่องทดสอบของคุณเอง ปราศจากข้อมูลจำลองโดยเด็ดขาด (Strict Isolation)",
        bulletPoints: [
          "แสดงเฉพาะเครื่องที่ส่งข้อมูลมาจาก InfraPulse Agent จริง",
          "มีคำสั่ง 1-Line Installer ติดตั้งง่ายบน Linux (Ubuntu/Debian) และ Windows",
          "คำนวณวัตต์ไฟและสถานะฮาร์ดแวร์จริงแบบ Real-Time",
          "หากยังไม่มีเครื่องต่อเข้ามา จะแสดงหน้า Onboarding แนะนำการติดตั้ง",
        ],
        cta: "เปิดใช้งาน Live Production",
        note: "พารามิเตอร์ URL: ?mode=live",
      },
      sim: {
        title: "🎮 Sim Lab Sandbox",
        badge: "5-NODE VIRTUAL CLUSTER SIMULATOR",
        desc: "สำหรับทดลองเรียนรู้ ทดสอบสถานการณ์ไฟดับ (Feed Failover) และสั่งสไปก์โหลด เพื่อดูปฏิกิริยาของระบบไฟฟ้าและ PUE ได้ทันทีด้วยคลิกเดียว",
        bulletPoints: [
          "คลัสเตอร์จำลอง 5 โหนดระดับ Enterprise ออนไลน์ตลอดเวลาด้วย Background Worker",
          "โหลดไฟ Feed A (~950W) และ Feed B (~820W) วิ่งจริงแบบ Sine-wave",
          "ปุ่มกดจำลองไฟดับ Feed A Outage เพื่อดูระบบ N+1 สลับโหลดอัตโนมัติ",
          "ปุ่ม Spike Load ดันโหลดขึ้น 90% เพื่อดูค่า PUE และอุณหภูมิพุ่งสูง",
        ],
        cta: "เปิดใช้งาน Sim Lab Sandbox",
        note: "พารามิเตอร์ URL: ?mode=sandbox",
      },
    },
    equipment: equipmentData.th,
    footer: {
      tagline: "InfraPulse — Unified Critical Infrastructure & DCIM Monitoring Platform",
      standards: "Compliant with Thailand BOI Green Benchmark (PUE ≤ 1.30), ASHRAE TC 9.9, and NEC 80% Rule",
      backToTop: "กลับสู่ด้านบน",
      openDashboard: "ไปที่หน้าแดชบอร์ดหลัก",
    },
  },
  en: {
    nav: {
      brand: "INFRAPULSE",
      primerBadge: "DCIM PRIMER",
      pillars: "4 Core Pillars",
      howItWorks: "How It Works",
      keyMetrics: "Key Metrics (PUE/N+1)",
      liveBtn: "🟢 Live Production",
      simBtn: "🎮 Sim Lab",
    },
    hero: {
      kicker: "MODERN DCIM & DATA CENTER ARCHITECTURE",
      titleLine1: "What Powers the Cloud?",
      titleHighlight: "Data Centers",
      titleLine2: "Demystified & Visualized",
      subtitle: "An interactive engineering walkthrough of modern critical facility infrastructure: combining high-density compute, 2N power distribution, precision In-Row cooling, and ultra-fast optical fabrics into sub-second telemetry.",
      badgePUE: "PUE ≤ 1.30 (BOI Target)",
      badgeRedundancy: "N+1 / 2N Dual Feed",
      badgeTier: "Tier III High Availability",
      ctaLive: "Enter Live Production",
      ctaLiveSub: "Pure physical infrastructure with zero simulated mock data",
      ctaSim: "Launch Sim Lab Sandbox",
      ctaSimSub: "Interactive 5-node cluster with real-time power & PUE metrics",
      scrollDown: "Scroll down to explore architecture",
    },
    dcimIntro: {
      badge: "WHAT IS A DATA CENTER?",
      title: "What Exactly is a Data Center?",
      desc1: "A data center is not merely a server room. It is a highly engineered, mission-critical facility designed to house high-density IT infrastructure, ensuring continuous 24/7/365 operations with zero downtime.",
      desc2: "Every watt of electricity delivered to a server is converted 100% into thermal heat according to the first law of thermodynamics. Therefore, precision cooling and dual-feed power redundancy are just as vital as the CPUs themselves.",
      highlightFact: "A single second of power failure costs millions — critical facilities always require redundant 2N power distribution paths.",
      quoteAuthor: "Global Data Center Engineering Standards (ASHRAE / Uptime Institute)",
    },
    blocks: {
      badge: "THE 4 CORE PILLARS",
      title: "The 4 Inseparable Pillars of a Data Center",
      subtitle: "A harmonious synergy between compute silicon, critical power, precision thermal loops, and network switching.",
      items: [
        {
          id: "compute",
          title: "1. Compute & Storage Fabric",
          tag: "1U/2U RACK SERVERS",
          desc: "High-density 42U rack enclosures housing multicore CPUs, AI accelerators, enterprise ECC memory, and NVMe SSD arrays running virtualized cloud workloads.",
          specs: ["Form Factor: 1U-4U Standard EIA-310 Racks", "Dual Redundant Titanium PSUs", "Hot-swappable NVMe Storage & ECC RAM"],
          role: "Transforms electrical energy into digital computation and storage.",
        },
        {
          id: "power",
          title: "2. Critical Power Delivery",
          tag: "2N / N+1 DUAL-FEED",
          desc: "Power enters from utility substations, passes through diesel generators, online double-conversion UPS battery banks, and splits into Feed A & Feed B rack PDUs.",
          specs: ["Dual Independent Utility Grids (A-Side & B-Side)", "Modular True Online Double-Conversion UPS", "Intelligent Metered & Switched Rack PDUs"],
          role: "Supplies pristine, uncorrupted electrical current with zero interruptions.",
        },
        {
          id: "cooling",
          title: "3. Precision Thermal Management",
          tag: "IN-ROW & CONTAINMENT",
          desc: "Maintains supply air at 20-22°C and 50% relative humidity. Uses physical containment to separate Cold Aisle intake from Hot Aisle server exhaust.",
          specs: ["In-Row Chilled Water / Direct Expansion Units", "Hot / Cold Aisle Physical Containment", "Variable Speed EC Fans for Dynamic CFM Modulation"],
          role: "Extracts massive heat energy from server chassis and rejects it outside.",
        },
        {
          id: "network",
          title: "4. High-Speed Network Fabric",
          tag: "SPINE-AND-LEAF FABRIC",
          desc: "Interconnects rack servers through Top-of-Rack (TOR) switches to central spine switches using 100G/400G multimode and singlemode optical transceivers.",
          specs: ["Non-blocking Spine-and-Leaf Architecture", "Carrier-Neutral BGP Routing with Diverse Entry Paths", "Sub-microsecond Intra-rack East-West Latency"],
          role: "Transports billions of data packets between servers and internet users.",
        },
      ],
    },
    flow: {
      badge: "LIFECYCLE OF A REQUEST",
      title: "How a Single Request Traverses the Data Center",
      subtitle: "Follow the sub-second journey of a packet: from edge border gateway to silicon compute, electrical draw, and thermal dissipation.",
      steps: [
        {
          step: "01",
          title: "Traffic Ingress & Border BGP",
          tech: "FIBER OPTIC BORDER GATEWAY",
          desc: "User sends a request. Light pulses travel through terrestrial fiber into redundant carrier entry conduits.",
          latencyOrMetric: "Latency: ~5-15ms",
        },
        {
          step: "02",
          title: "Security & Load Balancing",
          tech: "DDoS MITIGATION & L4/L7 REVERSE PROXY",
          desc: "Traffic is sanitized against volumetric attacks and evenly routed across available rack nodes.",
          latencyOrMetric: "Inspection: <1ms",
        },
        {
          step: "03",
          title: "Server Compute Execution",
          tech: "CPU/GPU WORKLOAD SPIKE",
          desc: "Server CPU cores process instructions. Silicon activity jumps from idle (40W) to rated load (250W-900W).",
          latencyOrMetric: "CPU Utilization: 5% -> 75%",
        },
        {
          step: "04",
          title: "PDU Electrical Draw Spike",
          tech: "FEED A + FEED B CURRENT DRAW",
          desc: "Power supply units draw instantaneous current from Feed A and Feed B rack PDUs, measured in real-time Amps.",
          latencyOrMetric: "Current: +3.2 Amps @ 230V",
        },
        {
          step: "05",
          title: "Thermal Heat Dissipation",
          tech: "HEAT EXHAUST INTO HOT AISLE",
          desc: "Electrical energy converts entirely to thermal watts. Chassis fans push 38-42°C air into contained hot aisle.",
          latencyOrMetric: "Exhaust Temp: +15°C (Delta-T)",
        },
        {
          step: "06",
          title: "In-Row Cooling Extraction & Egress",
          tech: "EC FAN CYCLE & PACKET RESPONSE",
          desc: "In-Row precision coolers cycle the hot air through water chillers, replenishing 21°C air while response packets egress.",
          latencyOrMetric: "Total Cycle: < 50ms",
        },
      ],
    },
    metrics: {
      badge: "CRITICAL METRICS",
      title: "The 3 Numbers Every Data Center Engineer Watches",
      subtitle: "The gold standards of operational efficiency, regulatory compliance, and thermal safety measured by InfraPulse.",
      cards: [
        {
          id: "pue",
          title: "1. PUE (Power Usage Effectiveness)",
          formula: "PUE = Total Facility Power / IT Equipment Power",
          benchmark: "Thailand BOI Target: PUE ≤ 1.30 (The closer to 1.0, the higher the efficiency)",
          desc: "Measures how much electrical power is lost to cooling, transformers, and lighting compared to computing. A PUE of 1.20 means only 0.20W is spent on overhead for every 1.0W spent running servers.",
          highlight: "InfraPulse Live Value: 1.205 (Optimal Pass)",
        },
        {
          id: "redundancy",
          title: "2. N+1 Electrical Redundancy",
          formula: "Safety Headroom = Surviving Feed Derated Capacity (2,944W) - Total IT Load",
          benchmark: "NEC 80% Continuous Rule: Continuous load must not exceed 80% of breaker rating",
          desc: "Guarantees that during a total transformer explosion or blackout on Feed A, the single surviving Feed B safely absorbs 100% of the facility load without tripping branch breakers.",
          highlight: "InfraPulse Headroom: +1,162W Safe Margin",
        },
        {
          id: "thermal",
          title: "3. Hot/Cold Aisle Delta-T (ΔT)",
          formula: "ΔT = Hot Exhaust Temperature - Cold Supply Air Temperature",
          benchmark: "ASHRAE TC 9.9 Thermal Guidelines: Supply 18-27°C, Target ΔT 12-16°C",
          desc: "A low ΔT indicates air bypass (wasting cold air), while a ΔT > 18°C indicates choked heat exhaust, risking hardware degradation and server thermal throttling.",
          highlight: "InfraPulse Target: Supply 21.5°C | ΔT 14.8°C",
        },
      ],
    },
    modes: {
      badge: "CHOOSE YOUR EXPERIENCE",
      title: "Choose Your Operational Mode",
      subtitle: "InfraPulse enforces strict namespace isolation between real physical infrastructure and interactive simulation sandboxes.",
      live: {
        title: "🟢 Live Production",
        badge: "REAL PHYSICAL INFRASTRUCTURE",
        desc: "Direct telemetry connection with your real-world servers, home lab nodes, or test virtual machines. Zero mock data allowed.",
        bulletPoints: [
          "Displays only physical machines transmitting from the InfraPulse Agent",
          "Easy 1-Line Installer for Linux (Ubuntu/Debian) and Windows (PowerShell)",
          "True hardware telemetry and real electricity cost tracking",
          "Clean onboarding empty state if no physical agents are currently connected",
        ],
        cta: "Launch Live Production",
        note: "URL Parameter: ?mode=live",
      },
      sim: {
        title: "🎮 Sim Lab Sandbox",
        badge: "5-NODE VIRTUAL CLUSTER SIMULATOR",
        desc: "Interactive sandbox to explore scenarios, test single-feed blackout failover, and inject artificial CPU load spikes with 1 click.",
        bulletPoints: [
          "5 enterprise virtual servers kept online 24/7 by our background simulation daemon",
          "Calibrated power loads across Feed A (~950W) and Feed B (~820W)",
          "1-Click Feed A Outage button to test electrical N+1 failover in real time",
          "Spike Load button to stress CPU to 90% and observe dynamic PUE changes",
        ],
        cta: "Launch Sim Lab Sandbox",
        note: "URL Parameter: ?mode=sandbox",
      },
    },
    equipment: equipmentData.en,
    footer: {
      tagline: "InfraPulse — Unified Critical Infrastructure & DCIM Monitoring Platform",
      standards: "Compliant with Thailand BOI Green Benchmark (PUE ≤ 1.30), ASHRAE TC 9.9, and NEC 80% Rule",
      backToTop: "Back to Top",
      openDashboard: "Open Main Dashboard",
    },
  },
};
