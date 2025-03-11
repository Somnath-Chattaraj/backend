import axios from "axios";

import "dotenv/config";

const BACKEND_URI = process.env.BACKEND_URI || "http://localhost:3000";

const MOCK_BOOK_URL = `${BACKEND_URI}/api/mock-book`;
const USER_IDS = [
  // 'cm7yz8jjj0000126e3w31otxh',
  // 'cm7yz8jjk0001126e9l5ujqu0',
  // 'cm7yz8jjk0002126eq5omxn1z',
  // 'cm7yz8jjk0003126e5nokyuf4',
  // 'cm7yz8jjk0004126e2pmo7vyi',
  // 'cm7yz8jjk0005126ee75z60es',
  // 'cm7yz8jjk0006126etgl19frc',
  // 'cm7yz8jjk0007126e9x4wht4j',
  // 'cm7yz8jjk0008126esn283wpw',
  // 'cm7yz8jjk0009126e05i2hmv7',
  // 'cm7yz8jjk000a126ewtdcqypn',
  // 'cm7yz8jjk000b126eer0oubzt',
  // 'cm7yz8jjk000c126eiif8uld8',
  // 'cm7yz8jjk000d126er5qbdqkm',
  // 'cm7yz8jjk000e126efe3snepn',
  // 'cm7yz8jjk000f126ek6xjsowc',
  // 'cm7yz8jjk000g126eig6ddsap',
  // 'cm7yz8jjk000h126ez8ukyohu',
  // 'cm7yz8jjk000i126e9oiwxwnl',
  // 'cm7yz8jjk000j126eviia72ry',
  // 'cm7yz8jjk000k126efudoeyev',
  // 'cm7yz8jjk000l126ejr4hohla',
  // 'cm7yz8jjk000m126emqzwfy8f',
  // 'cm7yz8jjk000n126emq9h3u93',
  // 'cm7yz8jjk000o126ezog9ivi8',
  // 'cm7yz8jjk000p126eczzskeb0',
  // 'cm7yz8jjk000q126ebotgb3r5',
  // 'cm7yz8jjk000r126eh0nsuwrj',
  // 'cm7yz8jjk000s126e7khw420u',
  // 'cm7yz8jjk000t126e2rtjcry7',
  // 'cm7yz8jjk000u126ebvyojakh',
  // 'cm7yz8jjk000v126ev5askisa',
  // 'cm7yz8jjk000w126e9q9t203d',
  // 'cm7yz8jjk000x126e07r944rl',
  // 'cm7yz8jjk000y126egmlmmehn',
  // 'cm7yz8jjk000z126evqrrsess',
  // 'cm7yz8jjk0010126esnnbblpz',
  // 'cm7yz8jjk0011126e9ugsg8o1',
  // 'cm7yz8jjk0012126edv96bdku',
  // 'cm7yz8jjk0013126ey7wzyawq',
  // 'cm7yz8jjk0014126efqr7akt6',
  // 'cm7yz8jjk0015126eu9jpc7cz',
  // 'cm7yz8jjk0016126ecvgemwmh',
  // 'cm7yz8jjk0017126esg1bh97x',
  // 'cm7yz8jjk0018126ei1t4hi2d',
  // 'cm7yz8jjk0019126ermu77ynu',
  // 'cm7yz8jjk001a126ecbq4n3g1',
  // 'cm7yz8jjk001b126ei48i7xrk',
  // 'cm7yz8jjk001c126e0nblfnjz',
  // 'cm7yz8jjk001d126egv2wam7r',
  // 'cm7yz8toz0000w0m6kmus8x6t',
  // 'cm7yz8toz0001w0m665k7at48',
  // 'cm7yz8toz0002w0m6lvxq3g9v',
  // 'cm7yz8toz0003w0m64ldgic68',
  // 'cm7yz8toz0004w0m6dvbyiwi7',
  // 'cm7yz8toz0005w0m6c38857qj',
  // 'cm7yz8toz0006w0m6paycbv8y',
  // 'cm7yz8toz0007w0m621at5axx',
  // 'cm7yz8tp00008w0m6g60bfkq9',
  // 'cm7yz8tp00009w0m6zz0x4ca3',
  // 'cm7yz8tp0000aw0m6cxpoj3lw',
  // 'cm7yz8tp0000bw0m64chsgcen',
  // 'cm7yz8tp0000cw0m6vw4r4vrx',
  // 'cm7yz8tp0000dw0m64zy22sii',
  // 'cm7yz8tp0000ew0m6my84lfna',
  // 'cm7yz8tp0000fw0m6vrj96l0k',
  // 'cm7yz8tp0000gw0m6rn6y0cj6',
  // 'cm7yz8tp0000hw0m6r5vvh6vt',
  // 'cm7yz8tp0000iw0m6r5e4yxms',
  // 'cm7yz8tp0000jw0m6d2ubwz41',
  // 'cm7yz8tp0000kw0m6wg6kmzzx',
  // 'cm7yz8tp0000lw0m6ihh7mwuw',
  // 'cm7yz8tp0000mw0m67dkx96o7',
  // 'cm7yz8tp0000nw0m6cqyqcp5r',
  // 'cm7yz8tp0000ow0m6pn566ww6',
  // 'cm7yz8tp0000pw0m6imznf6ho',
  // 'cm7yz8tp0000qw0m6txlxgevs',
  // 'cm7yz8tp0000rw0m6d9g12ptl',
  // 'cm7yz8tp0000sw0m6u3pvd6ow',
  // 'cm7yz8tp0000tw0m6gaswfnz8',
  // 'cm7yz8tp0000uw0m6dqpypi1u',
  // 'cm7yz8tp0000vw0m6tlcnnjcq',
  // 'cm7yz8tp0000ww0m6lm6mt34v',
  // 'cm7yz8tp0000xw0m6rwfmbva6',
  // 'cm7yz8tp0000yw0m6rcnqzrtg',
  // 'cm7yz8tp0000zw0m6d3mzsk7n',
  // 'cm7yz8tp00010w0m6ihbbk4wh',
  // 'cm7yz8tp00011w0m646g3l7go',
  // 'cm7yz8tp00012w0m6s71c65wu',
  // 'cm7yz8tp00013w0m6k6hifn61',
  // 'cm7yz8tp00014w0m640m6lea8',
  // 'cm7yz8tp00015w0m66nlw20yi',
  // 'cm7yz8tp00016w0m6ho9rdygr',
  // 'cm7yz8tp00017w0m661dxkiob',
  // 'cm7yz8tp00018w0m6yldbla6z',
  // 'cm7yz8tp00019w0m6uhzlfn7k',
  // 'cm7yz8tp0001aw0m6rczgbgvn',
  // 'cm7yz8tp0001bw0m6au2dviir',
  'cm7yz8tp0001cw0m696yx2w3h',
  'cm7yz8tp0001dw0m63k0hiox1',
];

async function mockBookUsers(eventId: string, durationMinutes: number) {
  const startTime = Date.now();
  const endTime = startTime + durationMinutes * 1000;
  const userCount = USER_IDS.length;

  // Calculate interval between requests
  const interval = (durationMinutes * 1000) / userCount;

  console.log(
    `Starting mock bookings for event ${eventId} over ${durationMinutes} minutes...`
  );

  USER_IDS.forEach((userId, index) => {
    setTimeout(async () => {
      try {
        const score = Math.floor(Math.random() * 10000) + 5000; // 5000-15000
        await axios.post(MOCK_BOOK_URL, {
          userId,
          eventId,
          score,
        });

        console.log(
          `Booked ${userId} with score ${score} at ${new Date().toLocaleTimeString()}`
        );
      } catch (error) {
        console.error(
          `Error booking ${userId}:`,
          // @ts-ignore
          error.response?.data || error.message
        );
      }
    }, index * interval);
  });

  setTimeout(() => {
    console.log("Mock booking period completed");
  }, endTime - startTime);
}

mockBookUsers("cm7z31zsv0000qk8kcz6rnoum", 30).catch(console.error);
