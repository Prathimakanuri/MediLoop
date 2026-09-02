const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed for MediLoop...');

  // Clean existing records
  await prisma.notification.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.equipmentRequest.deleteMany();
  await prisma.equipment.deleteMany();
  await prisma.equipmentCategory.deleteMany();
  await prisma.user.deleteMany();
  await prisma.healthcareFacility.deleteMany();

  // 1. Create Healthcare Facilities (Tier-2, Tier-3 and Semi-Urban)
  const cityHospital = await prisma.healthcareFacility.create({
    data: {
      id: 'fac_city_hospital',
      name: 'City Hospital & Research Center',
      type: 'Multi-Specialty Hospital',
      tier: 'Tier-2',
      location: 'Nagpur, Maharashtra',
      address: 'Plot 42, Central Avenue, Near Medical Square, Nagpur - 440009',
      verified: true,
      contactPhone: '+91 98230 45678',
      contactEmail: 'equipment@cityhospitalnagpur.org',
      rating: 4.9,
      bedCapacity: 450,
    },
  });

  const healthPlusClinic = await prisma.healthcareFacility.create({
    data: {
      id: 'fac_healthplus',
      name: 'HealthPlus Clinic & Trauma Center',
      type: 'Specialty Trauma Clinic',
      tier: 'Semi-Urban',
      location: 'Wardha, Maharashtra',
      address: 'Main Bypass Road, Opp. Bus Stand, Wardha - 442001',
      verified: true,
      contactPhone: '+91 94221 88990',
      contactEmail: 'contact@healthpluswardha.com',
      rating: 4.7,
      bedCapacity: 85,
    },
  });

  const careMedical = await prisma.healthcareFacility.create({
    data: {
      id: 'fac_care_medical',
      name: 'Care Medical Center',
      type: 'Community Hospital',
      tier: 'Tier-3',
      location: 'Amravati, Maharashtra',
      address: 'Camp Road, Near District Court, Amravati - 444602',
      verified: true,
      contactPhone: '+91 98902 33441',
      contactEmail: 'admin@caremedicalamravati.in',
      rating: 4.8,
      bedCapacity: 120,
    },
  });

  const cityDiagnostics = await prisma.healthcareFacility.create({
    data: {
      id: 'fac_city_diag',
      name: 'City Diagnostics & Advanced Imaging',
      type: 'Diagnostic Imaging Hub',
      tier: 'Tier-2',
      location: 'Nagpur, Maharashtra',
      address: 'Dharampeth Extension, West High Court Rd, Nagpur - 440010',
      verified: true,
      contactPhone: '+91 93710 66772',
      contactEmail: 'imaging@citydiagnostics.in',
      rating: 4.9,
      bedCapacity: 30,
    },
  });

  const cityCareHospital = await prisma.healthcareFacility.create({
    data: {
      id: 'fac_city_care',
      name: 'City Care Hospital',
      type: 'Primary & Secondary Care Hospital',
      tier: 'Tier-3',
      location: 'Yavatmal, Maharashtra',
      address: 'Civil Lines, Near Govt Medical College, Yavatmal - 445001',
      verified: true,
      contactPhone: '+91 91580 11223',
      contactEmail: 'director@citycarehospital.in',
      rating: 4.6,
      bedCapacity: 60,
    },
  });

  // 2. Create Users (Demo Customer & Demo Providers)
  const customerUser = await prisma.user.create({
    data: {
      id: 'usr_customer_demo',
      name: 'Dr. Rajesh Deshmukh',
      email: 'demo@mediloop.com',
      password: 'demo123',
      role: 'CUSTOMER',
      phone: '+91 91580 11223',
      facilityId: cityCareHospital.id,
      avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
    },
  });

  const providerUser = await prisma.user.create({
    data: {
      id: 'usr_provider_demo',
      name: 'Dr. Anita Sharma',
      email: 'provider@mediloop.com',
      password: 'demo123',
      role: 'PROVIDER',
      phone: '+91 98230 45678',
      facilityId: cityHospital.id,
      avatarUrl: 'https://images.unsplash.com/photo-1594824813629-8736a629671d?w=150&auto=format&fit=crop&q=80',
    },
  });

  const healthplusUser = await prisma.user.create({
    data: {
      id: 'usr_healthplus_demo',
      name: 'Dr. Vikram Patil',
      email: 'vikram@healthplus.com',
      password: 'demo123',
      role: 'PROVIDER',
      phone: '+91 94221 88990',
      facilityId: healthPlusClinic.id,
      avatarUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80',
    },
  });

  // 3. Create Equipment Categories
  const categories = [
    {
      id: 'cat_ventilator',
      name: 'Ventilator',
      slug: 'ventilator',
      iconName: 'Wind',
      description: 'Invasive and non-invasive mechanical ventilators for ICU and emergency support.',
    },
    {
      id: 'cat_patient_monitor',
      name: 'Patient Monitor',
      slug: 'patient-monitor',
      iconName: 'Activity',
      description: 'Multi-parameter bedside vital sign monitors for ECG, SpO2, NIBP, and Temp.',
    },
    {
      id: 'cat_ecg',
      name: 'ECG',
      slug: 'ecg',
      iconName: 'HeartPulse',
      description: '12-lead digital diagnostic electrocardiograph machines with thermal printers.',
    },
    {
      id: 'cat_ultrasound',
      name: 'Ultrasound',
      slug: 'ultrasound',
      iconName: 'Radio',
      description: 'Color Doppler diagnostic ultrasound units with convex and linear probes.',
    },
    {
      id: 'cat_infusion_pump',
      name: 'Infusion Pump',
      slug: 'infusion-pump',
      iconName: 'Syringe',
      description: 'Precision volumetric infusion and syringe pumps for critical drug delivery.',
    },
    {
      id: 'cat_defibrillator',
      name: 'Defibrillator',
      slug: 'defibrillator',
      iconName: 'Zap',
      description: 'Biphasic automated external and manual defibrillators with pacing support.',
    },
    {
      id: 'cat_hospital_bed',
      name: 'Hospital Bed',
      slug: 'hospital-bed',
      iconName: 'Bed',
      description: 'Motorized multi-function ICU and semi-fowler hospital beds with safety rails.',
    },
    {
      id: 'cat_xray',
      name: 'X-Ray',
      slug: 'xray',
      iconName: 'Scan',
      description: 'High-frequency mobile digital X-Ray units with wireless flat panel detectors.',
    },
    {
      id: 'cat_dialysis',
      name: 'Dialysis',
      slug: 'dialysis',
      iconName: 'Droplets',
      description: 'High-flux hemodialysis systems with integrated UF controls and safety alarms.',
    },
    {
      id: 'cat_anesthesia',
      name: 'Anesthesia',
      slug: 'anesthesia',
      iconName: 'Layers',
      description: 'Complete integrated anesthesia delivery workstations with ventilator.',
    },
  ];

  for (const cat of categories) {
    await prisma.equipmentCategory.create({ data: cat });
  }

  // 4. Create 12+ Equipment Listings with Guaranteed Real Images
  const equipmentList = [
    {
      id: 'eq_vent_01',
      name: 'Hamilton-C6 High-End ICU Ventilator',
      model: 'Hamilton-C6 Adaptive Support',
      categoryId: 'cat_ventilator',
      providerId: cityHospital.id,
      imageUrl: '/equipment/ventilator.svg',
      gallery: JSON.stringify(['/equipment/ventilator.svg', '/equipment/patient-monitor.svg']),
      description: 'Next-generation ICU mechanical ventilator with INTELLiVENT-ASV, high-flow nasal cannula therapy, integrated pneumatic nebulizer, and battery backup. Ideal for adult, pediatric, and neonatal respiratory failure.',
      pricePerDay: 1500,
      depositAmount: 5000,
      location: 'Nagpur, Maharashtra',
      distanceKm: 2.1,
      condition: 'Excellent',
      yearOfManufacture: 2023,
      availability: 'AVAILABLE',
      verified: true,
      lastServiceDate: '10 Feb 2026',
      nextServiceDue: '10 Aug 2026',
      usageType: 'ICU Support',
      accessories: JSON.stringify(['Dual-limb breathing circuit', 'Flow sensor', 'Humidifier chamber', 'Adult & Paediatric Masks', 'O2 High-Pressure Hose']),
      deliveryAvailable: true,
      powerRequirements: '100-240V AC, 50/60Hz, 4hr Internal Li-ion Battery',
    },
    {
      id: 'eq_vent_02',
      name: 'Dräger Savina 300 Transport Ventilator',
      model: 'Savina 300 Classic',
      categoryId: 'cat_ventilator',
      providerId: healthPlusClinic.id,
      imageUrl: '/equipment/ventilator.svg',
      gallery: JSON.stringify(['/equipment/ventilator.svg']),
      description: 'Turbine-driven critical care ventilator independent of central gas supply. Ideal for emergency care, intra-hospital transport, and sub-acute ICU wards.',
      pricePerDay: 1600,
      depositAmount: 5000,
      location: 'Wardha, Maharashtra',
      distanceKm: 3.4,
      condition: 'Like New',
      yearOfManufacture: 2022,
      availability: 'AVAILABLE',
      verified: true,
      lastServiceDate: '18 Jan 2026',
      nextServiceDue: '18 Jul 2026',
      usageType: 'Emergency Care',
      accessories: JSON.stringify(['Trolley stand', 'Autoclavable exhalation valve', 'Test lung', 'Transport oxygen regulator']),
      deliveryAvailable: true,
      powerRequirements: 'Built-in turbine, 5hr dual battery setup',
    },
    {
      id: 'eq_mon_01',
      name: 'Philips IntelliVue MX750 Patient Monitor',
      model: 'IntelliVue MX750 15-inch Touch',
      categoryId: 'cat_patient_monitor',
      providerId: careMedical.id,
      imageUrl: '/equipment/patient-monitor.svg',
      gallery: JSON.stringify(['/equipment/patient-monitor.svg']),
      description: 'High-acuity bedside patient monitor with 15" high-resolution touchscreen. Monitors 12-lead ECG, dual invasive blood pressure (IBP), SpO2, EtCO2, respiration, and temp.',
      pricePerDay: 900,
      depositAmount: 3000,
      location: 'Amravati, Maharashtra',
      distanceKm: 4.2,
      condition: 'Excellent',
      yearOfManufacture: 2023,
      availability: 'AVAILABLE',
      verified: true,
      lastServiceDate: '02 Feb 2026',
      nextServiceDue: '02 Aug 2026',
      usageType: 'ICU Support',
      accessories: JSON.stringify(['5-lead ECG cable', 'Adult & Paediatric NIBP Cuffs', 'Reusable SpO2 Sensor', 'Temperature probe']),
      deliveryAvailable: true,
      powerRequirements: 'AC Mains with 3.5hr smart battery',
    },
    {
      id: 'eq_mon_02',
      name: 'Mindray ePM 12M Bedside Vital Signs Monitor',
      model: 'Mindray ePM 12M Modular',
      categoryId: 'cat_patient_monitor',
      providerId: cityHospital.id,
      imageUrl: '/equipment/patient-monitor.svg',
      gallery: JSON.stringify(['/equipment/patient-monitor.svg']),
      description: 'Compact 12.1-inch capacitive multi-touch patient monitor with CrozFusion technology joint ECG & SpO2 arrhythmia analysis. Great for post-op recovery and step-down units.',
      pricePerDay: 850,
      depositAmount: 2500,
      location: 'Nagpur, Maharashtra',
      distanceKm: 2.3,
      condition: 'Excellent',
      yearOfManufacture: 2022,
      availability: 'AVAILABLE',
      verified: true,
      lastServiceDate: '12 Jan 2026',
      nextServiceDue: '12 Jul 2026',
      usageType: 'Ward Support',
      accessories: JSON.stringify(['ECG trunk cable', 'Adult NIBP hose & cuff', 'Finger sensor', 'Roll stand clamp']),
      deliveryAvailable: true,
      powerRequirements: '220V AC, 4hr battery',
    },
    {
      id: 'eq_ecg_01',
      name: 'Schiller Cardiovit FT-1 12-Lead ECG Machine',
      model: 'Cardiovit FT-1 Touchscreen',
      categoryId: 'cat_ecg',
      providerId: healthPlusClinic.id,
      imageUrl: '/equipment/ecg-machine.svg',
      gallery: JSON.stringify(['/equipment/ecg-machine.svg']),
      description: 'Ultra-portable 12-lead diagnostic ECG with 8-inch multi-touch display, ETM interpretation algorithm, thermal printer, and direct PDF export via Wi-Fi.',
      pricePerDay: 700,
      depositAmount: 2000,
      location: 'Wardha, Maharashtra',
      distanceKm: 3.8,
      condition: 'Like New',
      yearOfManufacture: 2023,
      availability: 'AVAILABLE',
      verified: true,
      lastServiceDate: '25 Jan 2026',
      nextServiceDue: '25 Jul 2026',
      usageType: 'Diagnostic',
      accessories: JSON.stringify(['10-lead patient cable', '4 limb clamps', '6 chest suction bulbs', 'Thermal paper roll pack (5 rolls)']),
      deliveryAvailable: true,
      powerRequirements: 'Lithium battery (up to 300 ECG recordings)',
    },
    {
      id: 'eq_usg_01',
      name: 'GE Logiq e Portable Color Doppler Ultrasound',
      model: 'GE Logiq e R8 Digital',
      categoryId: 'cat_ultrasound',
      providerId: cityDiagnostics.id,
      imageUrl: '/equipment/ultrasound.svg',
      gallery: JSON.stringify(['/equipment/ultrasound.svg']),
      description: 'Point-of-Care (POCUS) and general radiology color Doppler ultrasound machine. Includes convex abdominal probe and high-frequency linear vascular probe.',
      pricePerDay: 4800,
      depositAmount: 15000,
      location: 'Nagpur, Maharashtra',
      distanceKm: 7.2,
      condition: 'Excellent',
      yearOfManufacture: 2023,
      availability: 'AVAILABLE',
      verified: true,
      lastServiceDate: '05 Feb 2026',
      nextServiceDue: '05 Aug 2026',
      usageType: 'Diagnostic',
      accessories: JSON.stringify(['Convex 3.5C Probe (Abdominal/OB)', 'Linear 12L-RS Probe (Vascular/MSK)', 'Mobile Cart with Probe holders', 'Power adapter', 'Ultrasound Gel 5L']),
      deliveryAvailable: true,
      powerRequirements: 'AC Mains + Li-ion battery pack 2hr',
    },
    {
      id: 'eq_pump_01',
      name: 'B. Braun Infusomat Space Volumetric Infusion Pump',
      model: 'Infusomat Space P',
      categoryId: 'cat_infusion_pump',
      providerId: healthPlusClinic.id,
      imageUrl: '/equipment/infusion-pump.svg',
      gallery: JSON.stringify(['/equipment/infusion-pump.svg']),
      description: 'Ultra-compact space infusion pump with anti-free-flow protection, dose error reduction system (DERS), and wide delivery rate from 0.1 to 1200 mL/h.',
      pricePerDay: 600,
      depositAmount: 2000,
      location: 'Wardha, Maharashtra',
      distanceKm: 3.2,
      condition: 'Excellent',
      yearOfManufacture: 2022,
      availability: 'AVAILABLE',
      verified: true,
      lastServiceDate: '20 Jan 2026',
      nextServiceDue: '20 Jul 2026',
      usageType: 'ICU Support',
      accessories: JSON.stringify(['Pole clamp', 'Power cord', '10x dedicated infusion IV lines']),
      deliveryAvailable: true,
      powerRequirements: '100-240V AC, battery backup 4h',
    },
    {
      id: 'eq_defi_01',
      name: 'ZOLL R Series Plus Biphasic Defibrillator',
      model: 'ZOLL R Series ALS',
      categoryId: 'cat_defibrillator',
      providerId: careMedical.id,
      imageUrl: '/equipment/defibrillator.svg',
      gallery: JSON.stringify(['/equipment/defibrillator.svg']),
      description: 'Hospital-grade Code-Ready biphasic defibrillator with Real CPR Help, transcutaneous external pacing, synchronized cardioversion, and 3-lead ECG monitoring.',
      pricePerDay: 1200,
      depositAmount: 4000,
      location: 'Amravati, Maharashtra',
      distanceKm: 4.6,
      condition: 'Excellent',
      yearOfManufacture: 2023,
      availability: 'AVAILABLE',
      verified: true,
      lastServiceDate: '15 Jan 2026',
      nextServiceDue: '15 Jul 2026',
      usageType: 'Emergency Care',
      accessories: JSON.stringify(['Hard external paddles (Apex/Sternum)', 'Hands-free Multi-function CPR-D pad connector', 'ECG cable', 'AC power charger']),
      deliveryAvailable: true,
      powerRequirements: 'SurePower rechargeable battery (4hr run time)',
    },
    {
      id: 'eq_bed_01',
      name: 'Stryker SV2 Motorized ICU Hospital Bed',
      model: 'Stryker SV2 Electric 5-Function',
      categoryId: 'cat_hospital_bed',
      providerId: careMedical.id,
      imageUrl: '/equipment/hospital-bed.svg',
      gallery: JSON.stringify(['/equipment/hospital-bed.svg']),
      description: 'Fully motorized 5-function ICU hospital bed with electronic backrest, knee-gatch, height adjustment, Trendelenburg/Reverse Trendelenburg, and emergency CPR drop.',
      pricePerDay: 500,
      depositAmount: 2000,
      location: 'Amravati, Maharashtra',
      distanceKm: 4.8,
      condition: 'Excellent',
      yearOfManufacture: 2022,
      availability: 'AVAILABLE',
      verified: true,
      lastServiceDate: '28 Jan 2026',
      nextServiceDue: '28 Jul 2026',
      usageType: 'Ward Support',
      accessories: JSON.stringify(['High-density anti-decubitus medical mattress', 'Telescopic IV pole', 'Split side rails with attendant controls', 'Central locking castor wheels']),
      deliveryAvailable: true,
      powerRequirements: '220V Electric with emergency battery backup',
    },
    {
      id: 'eq_xray_01',
      name: 'Siemens Mobilett Elara Max Digital Mobile X-Ray',
      model: 'Siemens Mobilett Elara Max 32kW',
      categoryId: 'cat_xray',
      providerId: cityDiagnostics.id,
      imageUrl: '/equipment/xray-machine.svg',
      gallery: JSON.stringify(['/equipment/xray-machine.svg']),
      description: 'High-end motorized mobile digital X-Ray system with antimicrobial coating, 32kW high-frequency generator, and lightweight wireless Cesium Iodide Flat Panel Detector.',
      pricePerDay: 4500,
      depositAmount: 15000,
      location: 'Nagpur, Maharashtra',
      distanceKm: 7.8,
      condition: 'Excellent',
      yearOfManufacture: 2023,
      availability: 'AVAILABLE',
      verified: true,
      lastServiceDate: '01 Feb 2026',
      nextServiceDue: '01 Aug 2026',
      usageType: 'Diagnostic',
      accessories: JSON.stringify(['14x17 inch Wireless MAX wi-D Flat Panel Detector', 'Protective lead aprons (2x)', 'Radiation dose area product (DAP) meter', 'Wireless exposure switch']),
      deliveryAvailable: true,
      powerRequirements: 'Motorized drive, charges on standard 15A wall socket',
    },
    {
      id: 'eq_dial_01',
      name: 'Fresenius 4008S High-Flux Hemodialysis Machine',
      model: 'Fresenius 4008S Classic',
      categoryId: 'cat_dialysis',
      providerId: cityDiagnostics.id,
      imageUrl: '/equipment/dialysis.svg',
      gallery: JSON.stringify(['/equipment/dialysis.svg']),
      description: 'Reliable hemodialysis machine for acute renal failure in ICU and chronic hemodialysis. Features DIASAFE plus filter, automated ultrafiltration profiling, and Online Kt/V monitoring.',
      pricePerDay: 3200,
      depositAmount: 10000,
      location: 'Nagpur, Maharashtra',
      distanceKm: 7.5,
      condition: 'Excellent',
      yearOfManufacture: 2022,
      availability: 'AVAILABLE',
      verified: true,
      lastServiceDate: '14 Jan 2026',
      nextServiceDue: '14 Jul 2026',
      usageType: 'ICU Support',
      accessories: JSON.stringify(['Blood line tubing set', 'Dialyzer holder', 'Bibag bicarbonate connector', 'Disinfection coupling tubes']),
      deliveryAvailable: true,
      powerRequirements: '220V AC, RO water inlet required',
    },
    {
      id: 'eq_anes_01',
      name: 'Dräger Fabius GS Premium Anesthesia Workstation',
      model: 'Fabius GS Premium E-Vent',
      categoryId: 'cat_anesthesia',
      providerId: cityHospital.id,
      imageUrl: '/equipment/anesthesia.svg',
      gallery: JSON.stringify(['/equipment/anesthesia.svg']),
      description: 'Advanced anesthesia workstation combining high-precision electronic ventilator (E-vent piston) with ergonomic trolley, multi-gas monitoring, and Isoflurane/Sevoflurane vaporizers.',
      pricePerDay: 5500,
      depositAmount: 20000,
      location: 'Nagpur, Maharashtra',
      distanceKm: 2.1,
      condition: 'Excellent',
      yearOfManufacture: 2023,
      availability: 'AVAILABLE',
      verified: true,
      lastServiceDate: '08 Feb 2026',
      nextServiceDue: '08 Aug 2026',
      usageType: 'Surgical',
      accessories: JSON.stringify(['Isoflurane Vaporizer 2000', 'Sevoflurane Vaporizer 2000', 'Adult & Paediatric Breathing Circuits', 'Soda lime canister', 'Gas pipeline hoses (O2/N2O/Air)']),
      deliveryAvailable: true,
      powerRequirements: '220V AC, 2hr battery reserve',
    },
  ];

  for (const eq of equipmentList) {
    await prisma.equipment.create({ data: eq });
  }

  // 5. Create Sample Initial Requests & Bookings
  const sampleRequest = await prisma.equipmentRequest.create({
    data: {
      id: 'req_sample_01',
      equipmentId: 'eq_vent_01',
      requesterId: customerUser.id,
      providerId: cityHospital.id,
      startDate: '2026-09-05',
      endDate: '2026-09-08',
      totalDays: 3,
      estimatedCost: 4500,
      purpose: 'ICU Support',
      urgency: 'HIGH',
      message: 'Urgent need for 3 days due to seasonal patient surge in our ICU ward.',
      status: 'PENDING',
    },
  });

  const acceptedRequest = await prisma.equipmentRequest.create({
    data: {
      id: 'req_sample_02',
      equipmentId: 'eq_pump_01',
      requesterId: customerUser.id,
      providerId: healthPlusClinic.id,
      startDate: '2026-09-10',
      endDate: '2026-09-14',
      totalDays: 4,
      estimatedCost: 2400,
      purpose: 'Emergency Care',
      urgency: 'STANDARD',
      message: 'Required for post-trauma recovery care.',
      status: 'ACCEPTED',
    },
  });

  // Create corresponding booking for the accepted request
  await prisma.booking.create({
    data: {
      id: 'book_sample_01',
      bookingNumber: 'ML-2026-8841',
      requestId: acceptedRequest.id,
      equipmentId: 'eq_pump_01',
      requesterId: customerUser.id,
      providerId: healthPlusClinic.id,
      startDate: '2026-09-10',
      endDate: '2026-09-14',
      totalDays: 4,
      pricePerDay: 600,
      totalAmount: 2400,
      deposit: 2000,
      status: 'CONFIRMED',
      deliveryAddress: 'City Care Hospital, Civil Lines, Yavatmal - 445001',
      trackingNotes: 'Dispatched via Mediloop Verified Logistics Express. Expected arrival 09:00 AM.',
      handoverDate: '2026-09-10',
    },
  });

  // 6. Create Initial Notifications
  await prisma.notification.createMany({
    data: [
      {
        id: 'notif_01',
        userId: customerUser.id,
        title: 'Booking Confirmed: Infusion Pump',
        message: 'HealthPlus Clinic accepted your rental request. Booking #ML-2026-8841 is confirmed.',
        type: 'BOOKING_CONFIRMED',
        read: false,
        linkUrl: '/bookings/book_sample_01',
      },
      {
        id: 'notif_02',
        userId: customerUser.id,
        title: 'Request Sent: Hamilton-C6 Ventilator',
        message: 'Your request for Hamilton-C6 ICU Ventilator has been delivered to City Hospital.',
        type: 'REQUEST_RECEIVED',
        read: false,
        linkUrl: '/requests',
      },
      {
        id: 'notif_03',
        userId: providerUser.id,
        title: 'New Rental Request Received',
        message: 'City Care Hospital submitted a rental request for Hamilton-C6 ICU Ventilator (3 days).',
        type: 'REQUEST_RECEIVED',
        read: false,
        linkUrl: '/provider',
      },
    ],
  });

  console.log('✅ Database seeded successfully with:');
  console.log(` - 5 Healthcare Facilities`);
  console.log(` - 3 Users (Customer & Providers)`);
  console.log(` - 10 Equipment Categories`);
  console.log(` - ${equipmentList.length} Medical Equipment items with verified photos`);
  console.log(` - Sample Requests, Confirmed Bookings, and Notifications`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
