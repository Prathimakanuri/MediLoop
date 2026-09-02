const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seed() {
  console.log('🌱 Starting comprehensive database seed for MediLoop...');

  // 1. Clean existing records
  await prisma.notification.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.booking.deleteMany({});
  await prisma.equipmentRequest.deleteMany({});
  await prisma.equipment.deleteMany({});
  await prisma.equipmentCategory.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.healthcareFacility.deleteMany({});

  // 2. Seed Healthcare Facilities
  const facilityCustomerDemo = await prisma.healthcareFacility.create({
    data: {
      id: 'fac_city_care',
      name: 'City Care Hospital',
      type: 'Community Hospital',
      tier: 'Tier-3',
      location: 'Yavatmal, Maharashtra',
      address: 'Near Bus Stand, Main Road, Yavatmal - 445001',
      verified: true,
      contactPhone: '+91 91580 11223',
      contactEmail: 'demo@mediloop.com',
      rating: 4.9,
      bedCapacity: 60,
    },
  });

  const facilityProviderDemo = await prisma.healthcareFacility.create({
    data: {
      id: 'fac_city_hospital',
      name: 'City Hospital & Research Center',
      type: 'Multi-Specialty Hospital',
      tier: 'Tier-2',
      location: 'Nagpur, Maharashtra',
      address: 'Central Avenue, Ramdaspeth, Nagpur - 440010',
      verified: true,
      contactPhone: '+91 98220 55443',
      contactEmail: 'provider@mediloop.com',
      rating: 4.8,
      bedCapacity: 250,
    },
  });

  const facilityHealthPlus = await prisma.healthcareFacility.create({
    data: {
      id: 'fac_healthplus',
      name: 'HealthPlus Clinic',
      type: 'Specialty Trauma Clinic',
      tier: 'Semi-Urban',
      location: 'Wardha, Maharashtra',
      address: 'Civil Lines, Wardha - 442001',
      verified: true,
      contactPhone: '+91 94231 88776',
      contactEmail: 'vikram@healthplus.com',
      rating: 4.7,
      bedCapacity: 45,
    },
  });

  // TEST 1 Customer Facility
  const facilityTestCustomer = await prisma.healthcareFacility.create({
    data: {
      id: 'fac_test_customer',
      name: 'Test Healthcare Facility',
      type: 'Community Hospital',
      tier: 'Tier-3',
      location: 'Amravati, Maharashtra',
      address: 'Station Road, Amravati - 444601',
      verified: true,
      contactPhone: '+91 99000 11111',
      contactEmail: 'customer@test.com',
      rating: 5.0,
      bedCapacity: 50,
    },
  });

  // TEST 2 Provider Facility
  const facilityTestProvider = await prisma.healthcareFacility.create({
    data: {
      id: 'fac_test_provider',
      name: 'Test Provider Center',
      type: 'Diagnostic Center',
      tier: 'Tier-2',
      location: 'Nagpur, Maharashtra',
      address: 'Ring Road, Nagpur - 440015',
      verified: true,
      contactPhone: '+91 99000 22222',
      contactEmail: 'provider@test.com',
      rating: 5.0,
      bedCapacity: 30,
    },
  });

  // 3. Seed Users
  const userCustomerDemo = await prisma.user.create({
    data: {
      id: 'usr_customer_demo',
      name: 'Dr. Rajesh Deshmukh',
      email: 'demo@mediloop.com',
      password: 'demo123',
      role: 'CUSTOMER',
      phone: '+91 91580 11223',
      facilityId: facilityCustomerDemo.id,
    },
  });

  const userProviderDemo = await prisma.user.create({
    data: {
      id: 'usr_provider_demo',
      name: 'Dr. Anita Sharma',
      email: 'provider@mediloop.com',
      password: 'demo123',
      role: 'PROVIDER',
      phone: '+91 98220 55443',
      facilityId: facilityProviderDemo.id,
    },
  });

  const userHealthPlus = await prisma.user.create({
    data: {
      id: 'usr_healthplus',
      name: 'Dr. Vikram Joshi',
      email: 'vikram@healthplus.com',
      password: 'demo123',
      role: 'PROVIDER',
      phone: '+91 94231 88776',
      facilityId: facilityHealthPlus.id,
    },
  });

  const userTestCustomer = await prisma.user.create({
    data: {
      id: 'usr_test_customer',
      name: 'Test Customer',
      email: 'customer@test.com',
      password: 'password123',
      role: 'CUSTOMER',
      phone: '+91 99000 11111',
      facilityId: facilityTestCustomer.id,
    },
  });

  const userTestProvider = await prisma.user.create({
    data: {
      id: 'usr_test_provider',
      name: 'Test Provider',
      email: 'provider@test.com',
      password: 'password123',
      role: 'PROVIDER',
      phone: '+91 99000 22222',
      facilityId: facilityTestProvider.id,
    },
  });

  // 4. Seed Equipment Categories
  const categoriesData = [
    { id: 'cat_ventilator', name: 'ICU Ventilators', slug: 'ventilator', iconName: 'Activity', description: 'Advanced mechanical lung ventilation systems for critical care and emergency support' },
    { id: 'cat_monitor', name: 'Patient Monitors', slug: 'patient-monitor', iconName: 'HeartPulse', description: 'Multi-para vital signs monitoring systems for real-time ECG, SpO2, and NIBP tracking' },
    { id: 'cat_ecg', name: 'ECG Machines', slug: 'ecg', iconName: 'Activity', description: 'Diagnostic 12-lead electrocardiograph machines for cardiac telemetry' },
    { id: 'cat_ultrasound', name: 'Ultrasound Systems', slug: 'ultrasound', iconName: 'Radio', description: 'Portable and console color Doppler ultrasound scanners for sonography' },
    { id: 'cat_infusion', name: 'Infusion Pumps', slug: 'infusion-pump', iconName: 'Syringe', description: 'Precision volumetric and syringe infusion pumps for critical drug delivery' },
    { id: 'cat_defibrillator', name: 'Defibrillators', slug: 'defibrillator', iconName: 'Zap', description: 'Biphasic cardiac defibrillators with AED mode and pacing capabilities' },
    { id: 'cat_bed', name: 'ICU Hospital Beds', slug: 'hospital-bed', iconName: 'Bed', description: 'Motorized electric ICU beds with CPR release and Trendelenburg positions' },
    { id: 'cat_xray', name: 'Mobile X-Ray Units', slug: 'xray', iconName: 'Camera', description: 'Portable high-frequency digital radiography systems for bedside imaging' },
    { id: 'cat_dialysis', name: 'Dialysis Machines', slug: 'dialysis', iconName: 'Droplet', description: 'Hemodialysis equipment for acute kidney injury and renal replacement therapy' },
    { id: 'cat_anesthesia', name: 'Anesthesia Workstations', slug: 'anesthesia', iconName: 'Wind', description: 'Comprehensive anesthesia delivery systems with ventilator and vaporizers' },
  ];

  for (const c of categoriesData) {
    await prisma.equipmentCategory.create({ data: c });
  }

  // 5. Seed Equipment Items
  const equipmentData = [
    {
      id: 'eq_vent_01',
      name: 'Hamilton-C6 High-End ICU Ventilator',
      model: 'Hamilton-C6 Adaptive',
      categoryId: 'cat_ventilator',
      providerId: facilityProviderDemo.id,
      imageUrl: '/equipment/ventilator.svg',
      description: 'Modular high-end ICU ventilator offering INTELLiVENT-ASV ventilation for adult, pediatric, and neonatal patients.',
      pricePerDay: 1500,
      depositAmount: 4500,
      location: 'Ramdaspeth, Nagpur',
      distanceKm: 2.4,
      condition: 'Excellent',
      yearOfManufacture: 2023,
      availability: 'AVAILABLE',
      verified: true,
      lastServiceDate: '10 Feb 2026',
      nextServiceDue: '10 Aug 2026',
      usageType: 'ICU Support',
      accessories: JSON.stringify(['Adult Circuit', 'Pediatric Circuit', 'Heated Humidifier', 'High-Pressure Oxygen Hose']),
      deliveryAvailable: true,
      powerRequirements: '220V AC, Internal Battery Backup 4 Hours',
    },
    {
      id: 'eq_vent_02',
      name: 'Dräger Savina 300 Transport Ventilator',
      model: 'Savina 300 Select',
      categoryId: 'cat_ventilator',
      providerId: facilityHealthPlus.id,
      imageUrl: '/equipment/ventilator.svg',
      description: 'Turbine-driven transport ventilator designed for independent oxygen supply during emergency intra-hospital transport.',
      pricePerDay: 1200,
      depositAmount: 3500,
      location: 'Civil Lines, Wardha',
      distanceKm: 5.1,
      condition: 'Like New',
      yearOfManufacture: 2022,
      availability: 'AVAILABLE',
      verified: true,
      lastServiceDate: '20 Jan 2026',
      nextServiceDue: '20 Jul 2026',
      usageType: 'Emergency Care',
      accessories: JSON.stringify(['Transport Cart', 'Turbine Filter Set', 'Oxygen Hose']),
      deliveryAvailable: true,
      powerRequirements: '220V AC, Dual Battery Backup 5 Hours',
    },
    {
      id: 'eq_mon_01',
      name: 'Philips IntelliVue MX750 Patient Monitor',
      model: 'MX750 High-Acuity',
      categoryId: 'cat_monitor',
      providerId: facilityProviderDemo.id,
      imageUrl: '/equipment/patient-monitor.svg',
      description: 'Advanced bedside monitor with 19-inch touchscreen, 12-lead ECG, NIBP, Dual IBP, Temp, and EtCO2 capability.',
      pricePerDay: 900,
      depositAmount: 2500,
      location: 'Ramdaspeth, Nagpur',
      distanceKm: 2.4,
      condition: 'Excellent',
      yearOfManufacture: 2023,
      availability: 'AVAILABLE',
      verified: true,
      lastServiceDate: '01 Feb 2026',
      nextServiceDue: '01 Aug 2026',
      usageType: 'ICU Support',
      accessories: JSON.stringify(['12-Lead ECG Cable', 'SpO2 Sensor', 'NIBP Cuff Set', 'EtCO2 Mainstream Sensor']),
      deliveryAvailable: true,
      powerRequirements: '220V AC, Battery Backup 3 Hours',
    },
    {
      id: 'eq_test_prov_01',
      name: 'GE Logiq e Portable Color Doppler Ultrasound',
      model: 'Logiq e NextGen',
      categoryId: 'cat_ultrasound',
      providerId: facilityTestProvider.id,
      imageUrl: '/equipment/ultrasound.svg',
      description: 'High-resolution laptop-style ultrasound scanner with cardiac phase array and linear vascular probes.',
      pricePerDay: 1800,
      depositAmount: 5000,
      location: 'Ring Road, Nagpur',
      distanceKm: 3.8,
      condition: 'Like New',
      yearOfManufacture: 2024,
      availability: 'AVAILABLE',
      verified: true,
      usageType: 'Diagnostic',
    },
    {
      id: 'eq_test_ecg_01',
      name: 'Test ECG Machine',
      model: 'BPL Cardiart 9108D 12-Channel',
      categoryId: 'cat_ecg',
      providerId: facilityTestProvider.id,
      imageUrl: '/equipment/ecg-machine.svg',
      description: 'Advanced 12-channel electrocardiograph with simultaneous acquisition, rhythm lead recording, and built-in thermal printer.',
      pricePerDay: 800,
      depositAmount: 2000,
      location: 'Ring Road, Nagpur',
      distanceKm: 3.8,
      condition: 'Excellent',
      yearOfManufacture: 2024,
      availability: 'AVAILABLE',
      verified: true,
      usageType: 'Diagnostic',
    },
  ];

  for (const eq of equipmentData) {
    await prisma.equipment.create({ data: eq });
  }

  console.log('✅ Database seeded successfully with intentional demo accounts & test credentials!');
}

seed()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
