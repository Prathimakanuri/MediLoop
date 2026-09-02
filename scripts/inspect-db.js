const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function inspectDb() {
  console.log('--- ALL USERS ---');
  const users = await prisma.user.findMany({ include: { facility: true } });
  console.log(users.map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role, facilityId: u.facilityId, facilityName: u.facility?.name })));

  console.log('\n--- ALL FACILITIES ---');
  const facilities = await prisma.healthcareFacility.findMany();
  console.log(facilities.map(f => ({ id: f.id, name: f.name })));

  console.log('\n--- ALL EQUIPMENT ---');
  const equipment = await prisma.equipment.findMany({ include: { provider: true } });
  console.log(equipment.map(e => ({ id: e.id, name: e.name, providerId: e.providerId, providerName: e.provider?.name })));

  console.log('\n--- ALL REQUESTS ---');
  const requests = await prisma.equipmentRequest.findMany({
    include: { equipment: true, requester: true, provider: true }
  });
  console.log(requests.map(r => ({
    id: r.id,
    equipmentId: r.equipmentId,
    equipmentName: r.equipment?.name,
    requesterId: r.requesterId,
    requesterName: r.requester?.name,
    requestProviderId: r.providerId,
    equipmentProviderId: r.equipment?.providerId,
    status: r.status,
  })));
}

inspectDb().catch(console.error).finally(() => prisma.$disconnect());
