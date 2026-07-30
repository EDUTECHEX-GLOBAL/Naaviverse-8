const mongoose = require('mongoose');

async function checkPartners() {
  await mongoose.connect('mongodb+srv://adi:AGmChskREizfDNlc@cluster0.o9lpe.mongodb.net/naavi-mock');
  const Partner = mongoose.connection.collection('partners');
  const list = await Partner.find({}).project({ email: 1, partnerId: 1, businessName: 1, username: 1 }).toArray();
  console.log('Partners in DB:', list);
  await mongoose.disconnect();
}

checkPartners();
