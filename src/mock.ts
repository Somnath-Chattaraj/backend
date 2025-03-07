import axios from "axios";

import "dotenv/config";

const BACKEND_URI = process.env.BACKEND_URI || "http://localhost:3000";

const MOCK_BOOK_URL = `${BACKEND_URI}/api/mock-book`;
const USER_IDS = [
  // 'cm7u542m100009omk1h8civi1',
  // 'cm7u5ls4g0000vo7utnofuf0n',
  // 'cm7wvy27d00002g0cn8lxgf0w',
  // 'cm7wvy27e00012g0c76ppsnjd',
  // 'cm7wvy27e00022g0cq3xs5ct4',
  // 'cm7wvy27e00032g0ci55n4nhj',
  // 'cm7wvy27e00042g0c4rq036tf',
  // 'cm7wvy27e00052g0c71h8kkw4',
  // 'cm7wvy27e00062g0cb9uaeft7',
  // 'cm7wvy27e00072g0cpumtzx88',
  // 'cm7wvy27e00082g0co4ckucr0',
  // 'cm7wvy27e00092g0c4syj4cc0',
  // 'cm7wvy27e000a2g0cucoy1efk',
  // 'cm7wvy27e000b2g0c718ov550',
  // 'cm7wvy27e000c2g0c235d1xm9',
  // 'cm7wvy27e000d2g0ctuwm5r9r',
  // 'cm7wvy27e000e2g0cht54j4ym',
  // 'cm7wvy27e000f2g0c9ekxhtxk',
  // 'cm7wvy27e000g2g0cm8m7o5b4',
  // 'cm7wvy27e000h2g0cxjc0gira',
  // 'cm7wvy27e000i2g0ctbcxglmw',
  // 'cm7wvy27e000j2g0cq1c98ets',
  // 'cm7wvy27e000k2g0c3b774c3y',
  // 'cm7wvy27e000l2g0cvw83e9sj',
  // 'cm7wvy27e000m2g0c4fxt5c2f',
  // 'cm7wvy27e000n2g0c55l4u47n',
  // 'cm7wvy27e000o2g0cpmwvsddf',
  // 'cm7wvy27e000p2g0cd44fsvpb',
  // 'cm7wvy27e000q2g0cvfj1ddxz',
  // 'cm7wvy27e000r2g0c5d6tts9y',
  // 'cm7wvy27e000s2g0cq0xg68sl',
  // 'cm7wvy27e000t2g0clqcoyaut',
  // 'cm7wvy27e000u2g0coqeafq3s',
  // 'cm7wvy27e000v2g0c4fpynme6',
  // 'cm7wvy27e000w2g0c7daiezei',
  // 'cm7wvy27e000x2g0c9q71xghj',
  // 'cm7wvy27e000y2g0c3vems78q',
  // 'cm7wvy27e000z2g0cye4g7ela',
  // 'cm7wvy27e00102g0cz9hhg4o8',
  // 'cm7wvy27e00112g0c8gow89n1',
  // 'cm7wvy27e00122g0cjvsao1qs',
  // 'cm7wvy27e00132g0cgi9200v6',
  // 'cm7wvy27e00142g0cwuhs23pg',
  // 'cm7wvy27e00152g0cjwjod8y1',
  // 'cm7wvy27e00162g0cf4a3vzf1',
  // 'cm7wvy27e00172g0cr05og3yl',
  // 'cm7wvy27e00182g0casttguk5',
  // 'cm7wvy27e00192g0cravdcck4',
  // 'cm7wvy27e001a2g0c1rzuz42a',
  // 'cm7wvy27e001b2g0cltenxw98',
  // 'cm7wvy27e001c2g0cyzd35gu4',
  // 'cm7wvy27e001d2g0co38nk7fb',
  // 'cm7ww2h8i00006zt39n10cuqh',
  // 'cm7ww2h8j00016zt3o1sbdkta',
  // 'cm7ww2h8j00026zt3hw2cw2au',
  // 'cm7ww2h8j00036zt352gv5a7q',
  // 'cm7ww2h8j00046zt3uara9j64',
  // 'cm7ww2h8j00056zt3t8thxar0',
  // 'cm7ww2h8j00066zt3rf57j04j',
  // 'cm7ww2h8j00076zt3kei3cefj',
  // 'cm7ww2h8j00086zt321yy4rej',
  // 'cm7ww2h8j00096zt3hy4zqdfw',
  // 'cm7ww2h8j000a6zt3wnauk0bj',
  // 'cm7ww2h8j000b6zt3jnmtmnda',
  // 'cm7ww2h8j000c6zt3fnnv08yj',
  // 'cm7ww2h8j000d6zt3oq75teds',
  // 'cm7ww2h8j000e6zt3onfeq8h5',
  // 'cm7ww2h8j000f6zt3ogopgkvj',
  // 'cm7ww2h8j000g6zt3ss1rb63m',
  // 'cm7ww2h8j000h6zt35w5f3ypg',
  // 'cm7ww2h8j000i6zt34xfkcxxd',
  // 'cm7ww2h8j000j6zt3a7c0trv9',
  // 'cm7ww2h8j000k6zt33u3zlwx5',
  // 'cm7ww2h8j000l6zt38n0s9we9',
  // 'cm7ww2h8j000m6zt3lu56n29x',
  // 'cm7ww2h8j000n6zt33jz55wdz',
  // 'cm7ww2h8j000o6zt3fglwwgou',
  // 'cm7ww2h8j000p6zt3phjby48b',
  // 'cm7ww2h8j000q6zt3q7fherqt',
  // 'cm7ww2h8j000r6zt3jqmk2hou',
  // 'cm7ww2h8j000s6zt3vo3d95a4',
  // 'cm7ww2h8j000t6zt3pmydag8j',
  // 'cm7ww2h8j000u6zt3wqdzuwt5',
  // 'cm7ww2h8j000v6zt3gmdk8d1h',
  // 'cm7ww2h8j000w6zt37d44gkcb',
  // 'cm7ww2h8j000x6zt3beaizoqv',
  // 'cm7ww2h8j000y6zt3bwikqpgv',
  // 'cm7ww2h8j000z6zt3nri4nkoj',
  // 'cm7ww2h8j00106zt3srl7cfsu',
  // 'cm7ww2h8k00116zt38dyvm0ej',
  // 'cm7ww2h8k00126zt3syi5gys2',
  // 'cm7ww2h8k00136zt31e91rht6',
  // 'cm7ww2h8k00146zt3mnrokk09',
  // 'cm7ww2h8k00156zt3kzfxout1',
  // 'cm7ww2h8k00166zt3un9tkiah',
  // 'cm7ww2h8k00176zt30tuzp1nw',
  // 'cm7ww2h8k00186zt315ffucs4',
  // 'cm7ww2h8k00196zt38agphrhj',
  "cm7ww2h8k001a6zt3jz732kl9",
  "cm7ww2h8k001b6zt35v09qswh",
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

mockBookUsers("cm7wxkaa20001rkmsi1si15l6", 30).catch(console.error);
