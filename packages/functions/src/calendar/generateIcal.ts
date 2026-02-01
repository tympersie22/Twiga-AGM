import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import ical from 'ical-generator';

export const generateIcalFeed = functions.https.onRequest(async (req, res) => {
  const db = admin.firestore();
  const token = req.query.token as string;
  if (token !== process.env.ICAL_SECRET_TOKEN) {
    res.status(403).send('Forbidden');
    return;
  }

  const bookingsSnap = await db
    .collectionGroup('bookings')
    .where('status', '==', 'confirmed')
    .get();

  const cal = ical({
    prodId: '//Twiga AGM//Twiga Residence//EN',
    name: 'Twiga Residence - Availability',
    timezone: 'Africa/Dar_es_Salaam',
  });

  bookingsSnap.forEach((doc) => {
    const b = doc.data();
    cal.createEvent({
      id: b.id,
      summary: `Booked - ${b.roomId}`,
      description: `Guest: ${b.guestName}\nRoom: ${b.roomId}\nGuests: ${b.numberOfGuests}`,
      start: new Date(b.checkIn),
      end: new Date(b.checkOut),
      status: 'CONFIRMED',
    });
  });

  res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="twiga-residence.ics"');
  res.send(cal.toString());
});
