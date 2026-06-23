/* eslint-disable no-console */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const connectDB = require('./config/db');

const User = require('./models/User');
const BusStatic = require('./models/BusStatic');
const Trip = require('./models/Trip');
const Seat = require('./models/Seat');
const Booking = require('./models/Booking');
const EmergencyContact = require('./models/EmergencyContact');
const SOSAlert = require('./models/SOSAlert');
const Payment = require('./models/Payment');

const roundToOneMinute = (d) => new Date(Math.floor(d.getTime() / 60000) * 60000);

const pad2 = (n) => String(n).padStart(2, '0');

const minutesToHHmm = (mins) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${pad2(h)}:${pad2(m)}`;
};

const addDaysAtNoon = (baseDate, days) => {
  const d = new Date(baseDate);
  d.setDate(d.getDate() + days);
  d.setHours(12, 0, 0, 0);
  return d;
};

const pickUnique = (arr, count) => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, count);
};

const hashPassword = async (plain) => bcrypt.hash(plain, 10);

const normalizePhone = (phone) => String(phone).replace(/[^\d]/g, '');

const BUS_TYPES = {
  AC_SLEEPER: { busType: 'AC', amenities: ['Sleeper'] },
  NON_AC_SLEEPER: { busType: 'Non-AC', amenities: ['Sleeper'] },
  SEMI_SLEEPER: { busType: 'Semi-Sleeper', amenities: [] },
  LUXURY: { busType: 'Sleeper', amenities: ['Luxury'] },
  VOLVO: { busType: 'AC', amenities: ['Volvo'] },
};

const routePairs = [
  { from: 'Mumbai', to: 'Pune' },
  { from: 'Pune', to: 'Nagpur' },
  { from: 'Mumbai', to: 'Nashik' },
  { from: 'Kolhapur', to: 'Pune' },
  { from: 'Sangli', to: 'Mumbai' },
  { from: 'Pune', to: 'Hyderabad' },
  { from: 'Bengaluru', to: 'Pune' },
  { from: 'Mumbai', to: 'Goa' },
  { from: 'Nagpur', to: 'Aurangabad' },
  { from: 'Pune', to: 'Kolhapur' },
];

const makeBusNumber = (seed, idx) => {
  const letters = ['AB', 'CD', 'EF', 'GH', 'IJ', 'KL', 'MN', 'OP', 'QR', 'ST', 'UV', 'WX', 'YZ'];
  const letter = letters[(seed + idx) % letters.length];
  const series = String(1000 + ((seed + idx) * 77) % 8999);
  // Indian-ish format: MH-12-AB-1234
  const district = 12 + ((seed + idx) % 20);
  return `MH-${district}-${letter}-${series}`;
};

const planTripsForBus = (bus, baseDate) => {
  const travelDateDays = [3, 5, 7, 9, 11, 13];
  const segments = [
    { start: 7 * 60 + 30, duration: 5 * 60 + 30 }, // 07:30 - 13:00+
    { start: 12 * 60 + 0, duration: 6 * 60 + 0 }, // 12:00
    { start: 16 * 60 + 30, duration: 4 * 60 + 45 }, // 16:30
    { start: 21 * 60 + 0, duration: 7 * 60 + 30 }, // 21:00 crossing sometimes
    { start: 23 * 60 + 15, duration: 2 * 60 + 30 }, // late night
    { start: 9 * 60 + 15, duration: 6 * 60 + 15 },
  ];

  const picks = [];
  for (let i = 0; i < 4; i++) {
    const route = routePairs[(bus.vendorSeed + i) % routePairs.length];
    const tDay = travelDateDays[i % travelDateDays.length];
    const seg = segments[(bus.vendorSeed + i * 3) % segments.length];

    const dep = seg.start;
    const arr = (dep + seg.duration) % (24 * 60);
    const crossesMidnight = dep + seg.duration >= 24 * 60;
    picks.push({
      fromLocation: route.from,
      toLocation: route.to,
      travelDate: addDaysAtNoon(baseDate, tDay),
      departureTime: minutesToHHmm(dep),
      arrivalTime: minutesToHHmm(crossesMidnight ? arr : arr),
    });
  }
  return picks;
};

async function clearCollections() {
  // Order matters due to references
  const collections = [
    SOSAlert,
    EmergencyContact,
    Payment,
    Booking,
    Seat,
    Trip,
    BusStatic,
    User,
  ];

  for (const model of collections) {
    await model.deleteMany({});
  }
}

async function main() {
  await connectDB();

  // Reset for repeatable demo
  await clearCollections();

  const vendors = [
    {
      fullName: 'Raj Travels',
      email: 'rajtravels@busgo.in',
      phone: '9876543210',
      password: 'Raj@12345',
      companyName: 'Raj Travels Pvt. Ltd.',
      businessType: 'Company',
      address: 'Andheri East, Mumbai, Maharashtra',
      serviceAreas: ['Mumbai', 'Pune', 'Nashik'],
      isVerified: true,
    },
    {
      fullName: 'Sharma Bus Lines',
      email: 'sharmabuslines@busgo.in',
      phone: '9810112233',
      password: 'Sharma@12345',
      companyName: 'Sharma Bus Lines',
      businessType: 'Company',
      address: 'Bandra Kurla Complex, Mumbai, Maharashtra',
      serviceAreas: ['Mumbai', 'Kolhapur', 'Sangli'],
      isVerified: true,
    },
    {
      fullName: 'Maharashtra Express',
      email: 'maharashtraexpress@busgo.in',
      phone: '9922334455',
      password: 'Maharashtra@12345',
      companyName: 'Maharashtra Express',
      businessType: 'Company',
      address: 'Navi Mumbai, Maharashtra',
      serviceAreas: ['Nagpur', 'Aurangabad', 'Pune'],
      isVerified: true,
    },
  ];

  const vendorUsers = [];
  for (const v of vendors) {
    const passwordHash = await hashPassword(v.password);
    const vendorUser = await User.create({
      name: v.fullName,
      email: v.email,
      phone: normalizePhone(v.phone),
      password: passwordHash,
      role: 'vendor',
      companyName: v.companyName,
      businessType: v.businessType,
      address: v.address,
      serviceAreas: v.serviceAreas,
      gstNumber: `27ABCDE${Math.floor(Math.random() * 9000) + 1000}Z1`,
      isVerified: v.isVerified,
      isApproved: true,
    });
    vendorUsers.push(vendorUser);
  }

  const appBaseDate = new Date();
  appBaseDate.setHours(0, 0, 0, 0);

  const vendorTypeOrder = [
    BUS_TYPES.AC_SLEEPER,
    BUS_TYPES.NON_AC_SLEEPER,
    BUS_TYPES.SEMI_SLEEPER,
    BUS_TYPES.LUXURY,
    BUS_TYPES.VOLVO,
  ];

  const buses = [];
  for (let vi = 0; vi < vendorUsers.length; vi++) {
    const vendorUser = vendorUsers[vi];
    for (let bi = 0; bi < 5; bi++) {
      const typeCfg = vendorTypeOrder[bi % vendorTypeOrder.length];
      const totalSeats = 30 + ((vi * 7 + bi * 5) % 21); // 30-50
      const busNumber = makeBusNumber(vi + 1, bi + 1);

      // Guard against duplicate busNumber values across re-runs / differing DB states
      // (busNumber is unique in BusStatic)
      const existing = await BusStatic.findOne({ busNumber });
      if (existing) continue;

      const bus = await BusStatic.create({
        vendorId: vendorUser._id,
        busName: `${vendorUser.name.split(' ')[0]} ${['Seater', 'Sleeper', 'Express', 'Comfort', 'Prime'][bi % 5]}`,
        busNumber,
        busType: typeCfg.busType,
        totalSeats,
        amenities: typeCfg.amenities.length ? typeCfg.amenities : ['Comfort'],
        isActive: true,
      });

      buses.push({
        bus,
        vendorSeed: vi + 10 * bi,
        totalSeats,
      });
    }
  }

  const trips = [];
  for (const b of buses) {
    const busId = b.bus._id;
    const vendorId = b.bus.vendorId;
    const planned = planTripsForBus({ vendorSeed: b.vendorSeed }, appBaseDate);

    // create 3-4 trips per bus
    for (let ti = 0; ti < 4; ti++) {
      const plan = planned[ti];
      // Keep non-overlapping by using distinct departure times in our plan builder.
      const travelDate = plan.travelDate;

      const basePrice = 450;
      const priceMultiplier = 1 + ((b.vendorSeed + ti) % 7) * 0.18;
      const routeFactor = 1 + (routePairs.findIndex((r) => r.from === plan.fromLocation && r.to === plan.toLocation) % 6) * 0.1;
      const price = Math.round(basePrice * priceMultiplier * routeFactor);

      const trip = await Trip.create({
        busId,
        vendorId,
        fromLocation: plan.fromLocation,
        toLocation: plan.toLocation,
        travelDate,
        departureTime: plan.departureTime,
        arrivalTime: plan.arrivalTime,
        price,
        availableSeats: b.totalSeats,
        status: 'scheduled',
        isActive: true,
      });

      // Seats: 1..totalSeats. Mark few as female-only to support women safety.
      const seatDocs = [];
      const femaleCount = Math.min(8, Math.max(4, Math.floor(b.totalSeats * 0.18)));
      const femaleSeats = pickUnique(
        Array.from({ length: b.totalSeats }, (_, i) => i + 1),
        femaleCount,
      );

      for (let sn = 1; sn <= b.totalSeats; sn++) {
        seatDocs.push({
          tripId: trip._id,
          busId,
          seatNumber: sn,
          status: femaleSeats.includes(sn) ? 'female-only' : 'available',
        });
      }
      await Seat.insertMany(seatDocs);
      trips.push(trip);
    }
  }

  const users = [
    {
      fullName: 'Priya Sharma',
      email: 'priya.sharma@busgo.in',
      phone: '9000012345',
      city: 'Pune',
      password: 'Priya@12345',
    },
    {
      fullName: 'Rahul Patil',
      email: 'rahul.patil@busgo.in',
      phone: '9001011121',
      city: 'Mumbai',
      password: 'Rahul@12345',
    },
    {
      fullName: 'Sneha Deshmukh',
      email: 'sneha.deshmukh@busgo.in',
      phone: '9002013456',
      city: 'Nagpur',
      password: 'Sneha@12345',
    },
  ];

  const userDocs = [];
  for (const u of users) {
    const user = await User.create({
      name: u.fullName,
      email: u.email,
      phone: normalizePhone(u.phone),
      password: await hashPassword(u.password),
      role: 'user',
      address: u.city, // schema doesn't have city; store city into address
      businessType: 'Individual',
      companyName: '',
      isVerified: true,
      isApproved: true,
    });
    userDocs.push(user);
  }

  // Emergency contacts (women safety feature support)
  const emergencySeed = [
    { userIndex: 0, name: 'Madhavi Sharma', relation: 'Mother', mobile: '9011112233' },
    { userIndex: 0, name: 'Amit Sharma', relation: 'Brother', mobile: '9022223344' },
    { userIndex: 2, name: 'Sujata Deshmukh', relation: 'Sister', mobile: '9033334455' },
    { userIndex: 2, name: 'Vikram Deshmukh', relation: 'Father', mobile: '9044445566' },
    { userIndex: 1, name: 'Rohit Patil', relation: 'Friend', mobile: '9055556677' },
    { userIndex: 1, name: 'Neha Patil', relation: 'Sister', mobile: '9066667788' },
  ];

  for (const ec of emergencySeed) {
    await EmergencyContact.create({
      userId: userDocs[ec.userIndex]._id,
      name: ec.name,
      relation: ec.relation,
      mobileNumber: normalizePhone(ec.mobile),
    });
  }

  const totalBookingsTarget = 14;
  const nonEmptyTrips = trips.filter(Boolean);

  // Create bookings and mark seats/bookings consistently
  const bookings = [];
  for (let i = 0; i < totalBookingsTarget; i++) {
    const user = userDocs[i % userDocs.length];
    const trip = nonEmptyTrips[(i * 3 + 2) % nonEmptyTrips.length];

    // Choose seats that are currently available/female-only as appropriate.
    // We'll prefer female-only for womenSafetyMode sometimes.
    const wantsWomenSafety = user.name.includes('Priya') || (i % 3 === 0);
    const seatQuery = wantsWomenSafety
      ? { tripId: trip._id, status: { $in: ['female-only', 'available'] } }
      : { tripId: trip._id, status: { $in: ['available', 'female-only'] } };

    const availableSeatDocs = await Seat.find(seatQuery).sort({ seatNumber: 1 }).limit(12).lean();
    if (availableSeatDocs.length === 0) continue;

    const seatCount = 1 + (i % 3); // 1-3 seats
    const chosen = pickUnique(availableSeatDocs, seatCount).map((s) => s.seatNumber);

    const uniqueSeats = [...new Set(chosen)];
    if (uniqueSeats.length === 0) continue;

    // Create booking
    const totalPrice = uniqueSeats.length * trip.price;
    const booking = await Booking.create({
      userId: user._id,
      busId: trip.busId,
      busName: trip.busId ? undefined : '',
      from: trip.fromLocation,
      to: trip.toLocation,
      journeyDate: new Date(trip.travelDate),
      departureTime: trip.departureTime,
      seatNumber: uniqueSeats,
      passengerName: user.name,
      womenSafetyMode: Boolean(wantsWomenSafety),
      price: totalPrice,
      status: 'confirmed',
      tripId: trip._id,
      vendorId: trip.vendorId,
      seats: uniqueSeats,
      date: new Date(trip.travelDate),
      totalPrice,
      bookingStatus: 'confirmed',
      reservationStatus: 'active',
      paymentStatus: 'paid',
      transactionStatus: 'paid',
      paymentMethod: 'upi',
      paymentId: `pay_${Math.random().toString(16).slice(2, 10)}`,
      reservationToken: `res_${Math.random().toString(16).slice(2, 10)}`,
      lockExpiresAt: roundToOneMinute(new Date(Date.now() + 15 * 60 * 1000)),
    });

    await Payment.create({
      bookingId: booking._id,
      userId: user._id,
      vendorId: trip.vendorId,
      paymentProvider: 'upi',
      orderId: `ord_demo_${Date.now()}_${booking._id.toString().slice(-6)}`,
      paymentId: booking.paymentId,
      amount: totalPrice,
      currency: 'INR',
      status: 'paid',
      isDemoPayment: true,
      metadata: { tripId: trip._id, seatNumbers: uniqueSeats },
    });

    // Update seats
    await Seat.updateMany(
      { tripId: trip._id, seatNumber: { $in: uniqueSeats } },
      {
        $set: {
          status: 'booked',
          bookedBy: user._id,
          bookingId: booking._id,
        },
        $unset: {
          lockedBy: '',
          lockToken: '',
          lockExpiresAt: '',
          reservedAt: '',
        },
      },
    );

    await Trip.updateOne({ _id: trip._id }, { $inc: { availableSeats: -uniqueSeats.length } });

    bookings.push(booking);

    // Add SOS test alerts for some women-safety bookings
    if (wantsWomenSafety && (i % 2 === 0)) {
      const sos = await SOSAlert.create({
        userId: user._id,
        bookingId: booking._id,
        timestamp: new Date(Date.now() - (i + 1) * 3600 * 1000),
        status: i % 4 === 0 ? 'resolved' : 'active',
      });

      void sos;
    }
  }

  // Ensure SOS at least 3 entries by adding from random bookings if needed
  const sosCount = await SOSAlert.countDocuments();
  if (sosCount < 3 && bookings.length) {
    const needed = 3 - sosCount;
    const sampleBookings = pickUnique(bookings, Math.min(needed, bookings.length));
    for (const b of sampleBookings) {
      await SOSAlert.create({
        userId: b.userId,
        bookingId: b._id,
        timestamp: new Date(Date.now() - 7200 * 1000),
        status: 'active',
      });
    }
  }

  console.log('Seed completed successfully.');
  console.log(`Vendors: ${vendorUsers.length}`);
  console.log(`Users: ${userDocs.length}`);
  console.log(`Buses: ${buses.length}`);
  console.log(`Trips: ${trips.length}`);
  console.log(`Bookings: ${bookings.length}`);
  console.log(`EmergencyContacts: ${await EmergencyContact.countDocuments()}`);
  console.log(`SOSAlerts: ${await SOSAlert.countDocuments()}`);

  await mongoose.disconnect();
}

main()
  .then(() => process.exit(0))
  .catch(async (err) => {
    console.error('Seed failed:', err);
    try {
      await mongoose.disconnect();
    } catch {
      // ignore
    }
    process.exit(1);
  });
