/* ─────────────────────────────────────────────────────────────
   Peter Parker's iPod Playlist
   Audio logic via 1x1px hidden YouTube iframe player,
   custom seek bar interpolation, presence counter,
   and synthesized Audio effects (Camera Shutter & Web Shooter).
   ───────────────────────────────────────────────────────────── */

// Console Logger to debug console overlay
const debugLogs = [];
const maxDebugLogs = 25;
function logDebug(msg, type = 'info') {
  debugLogs.push({ time: new Date().toLocaleTimeString(), msg, type });
  if (debugLogs.length > maxDebugLogs) debugLogs.shift();
  const consoleEl = document.getElementById('debug-console');
  if (consoleEl) {
    consoleEl.innerHTML = debugLogs.map(l => {
      const color = l.type === 'error' ? '#ff3b30' : l.type === 'warn' ? '#ffcc00' : '#4cd964';
      return `<div style="margin-bottom:6px;color:${color}">[${l.time}] ${l.msg}</div>`;
    }).join('');
  }
}
const _log = console.log;
const _warn = console.warn;
const _error = console.error;
console.log = (...args) => { _log(...args); logDebug(args.join(' '), 'info'); };
console.warn = (...args) => { _warn(...args); logDebug(args.join(' '), 'warn'); };
console.error = (...args) => { _error(...args); logDebug(args.join(' '), 'error'); };

const FALLBACK_TRACKS = [
  {
    "id": "MX7FSAnRPug",
    "title": "Loser",
    "artist": "Beck",
    "album": "Mellow Gold",
    "duration": 235,
    "cover": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/35/a5/a8/35a5a83a-7a68-2390-c069-6bee759f047a/00075021017924.rgb.jpg/600x600bb.jpg",
    "rawTitle": "Loser"
  },
  {
    "id": "2zPGWGqdfJ8",
    "title": "Oh Yeah",
    "artist": "Yello",
    "album": "Stella (Deluxe Edition)",
    "duration": 185,
    "cover": "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/93/54/12/9354128d-91e8-3bca-36b3-4a1f510c1240/00602557168327.rgb.jpg/600x600bb.jpg",
    "rawTitle": "oh yeah?"
  },
  {
    "id": "_z4iPWMbdoo",
    "title": "Jerk It Out",
    "artist": "Caesars",
    "album": "39 Minutes of Bliss (In an Otherwise Meaningless World)",
    "duration": 196,
    "cover": "https://is1-ssl.mzstatic.com/image/thumb/Music6/v4/36/08/55/36085508-0a77-329e-5d72-f340b9020c58/0724358368659_1401x1401_300dpi.jpg/600x600bb.jpg",
    "rawTitle": "Jerk It Out"
  },
  {
    "id": "L4FZjlxtNtE",
    "title": "Gone, Gone, Gone",
    "artist": "Phillip Phillips",
    "album": "The World From the Side of the Moon (Deluxe Version)",
    "duration": 210,
    "cover": "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/9a/72/eb/9a72eb50-97ad-9684-8f3b-46587ef81ac2/12UMGIM56926.rgb.jpg/600x600bb.jpg",
    "rawTitle": "Gone, Gone, Gone"
  },
  {
    "id": "SuZytYa71lk",
    "title": "Ho Hey",
    "artist": "The Lumineers",
    "album": "The Lumineers (Deluxe Edition)",
    "duration": 163,
    "cover": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/34/43/5e/34435ee1-dcee-1c60-f3ab-f53965790f3c/18540.jpg/600x600bb.jpg",
    "rawTitle": "Ho Hey"
  },
  {
    "id": "ulRXvH8VOl8",
    "title": "Wake Me Up When September Ends",
    "artist": "Green Day",
    "album": "American Idiot (Deluxe Edition)",
    "duration": 286,
    "cover": "https://is1-ssl.mzstatic.com/image/thumb/Music/9e/17/c2/mzi.ofggkufy.jpg/600x600bb.jpg",
    "rawTitle": "Wake Me up When September Ends"
  },
  {
    "id": "UBUXDUtZZnI",
    "title": "Sweater Weather",
    "artist": "The Neighbourhood",
    "album": "I Love You.",
    "duration": 240,
    "cover": "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/28/71/00/287100fb-5c31-0195-5343-e6b3625886d0/886443969834.jpg/600x600bb.jpg",
    "rawTitle": "Sweater Weather"
  },
  {
    "id": "K8v_DaCcORQ",
    "title": "Midnight City",
    "artist": "M83",
    "album": "Hurry Up, We're Dreaming",
    "duration": 241,
    "cover": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/cb/7b/a9/cb7ba903-b5f1-cc21-90db-7a81b7aa0997/724596951057.jpg/600x600bb.jpg",
    "rawTitle": "Midnight City"
  },
  {
    "id": "CfuOpXiNy1Y",
    "title": "I Wanna Be Your Boyfriend",
    "artist": "Hot Freaks",
    "album": "Hot Freaks",
    "duration": 157,
    "cover": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/84/ff/fc/84fffc69-dc74-2222-8021-42d8c5042e77/198002201539.png/600x600bb.jpg",
    "rawTitle": "I Wanna Be Your Boyfriend (2016 Remaster)"
  },
  {
    "id": "90DKXLbzLto",
    "title": "The Night We Met",
    "artist": "Lord Huron",
    "album": "Strange Trails",
    "duration": 208,
    "cover": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/55/41/4a/55414a18-861a-79d1-e575-5bf8cf205dbe/886445056839_Cover.jpg/600x600bb.jpg",
    "rawTitle": "The Night We Met"
  },
  {
    "id": "SdKZajZ59uA",
    "title": "Pluto Projector",
    "artist": "Rex Orange County",
    "album": "Pony",
    "duration": 268,
    "cover": "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/e3/af/48/e3af4809-2a90-38c3-c485-44ae6471f75b/886447950241.jpg/600x600bb.jpg",
    "rawTitle": "Pluto Projector"
  },
  {
    "id": "DdI598gKkKw",
    "title": "Apocalypse",
    "artist": "Cigarettes After Sex",
    "album": "Cigarettes After Sex",
    "duration": 290,
    "cover": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/b3/5e/0f/b35e0fbe-2370-fc48-0f0c-977525e93bf2/720841214601_Cover.jpg/600x600bb.jpg",
    "rawTitle": "Apocalypse"
  },
  {
    "id": "ssF-hrwAHHc",
    "title": "Somebody Else",
    "artist": "Kamen & trvs.",
    "album": "Somebody Else - Single",
    "duration": 258,
    "cover": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/a5/94/61/a5946155-3ec4-3b57-bea9-57e2b9aae4bf/840507953856_cover.jpg/600x600bb.jpg",
    "rawTitle": "Somebody Else"
  },
  {
    "id": "f_K_0SNaRk0",
    "title": "We Are Young (feat. Janelle Monáe)",
    "artist": "Fun.",
    "album": "Some Nights",
    "duration": 251,
    "cover": "https://is1-ssl.mzstatic.com/image/thumb/Features115/v4/b2/df/a3/b2dfa32c-ea54-7983-0da1-6964e60a1bd7/dj.aqphuayl.jpg/600x600bb.jpg",
    "rawTitle": "We Are Young (feat. Janelle Monáe)"
  },
  {
    "id": "cmOaXgjJUZI",
    "title": "What I've Done",
    "artist": "LINKIN PARK",
    "album": "Minutes to Midnight (Deluxe Edition)",
    "duration": 205,
    "cover": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/73/03/56/730356d5-a510-3d3f-d3c6-171f64700d35/093624948971.jpg/600x600bb.jpg",
    "rawTitle": "What I've Done"
  },
  {
    "id": "9Gb0a8Ie2hM",
    "title": "Pompeii",
    "artist": "Bastille",
    "album": "Bad Blood (Bonus Track Version)",
    "duration": 214,
    "cover": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/e6/d8/61/e6d86177-ae8c-e84e-dfcc-0042687066ed/13UAAIM41955.rgb.jpg/600x600bb.jpg",
    "rawTitle": "Pompeii"
  },
  {
    "id": "PkjaBCLOAec",
    "title": "Something Just Like This",
    "artist": "The Chainsmokers & Coldplay",
    "album": "Memories...Do Not Open",
    "duration": 247,
    "cover": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/9d/56/6f/9d566f55-5253-bed6-5c31-df952dae649d/886446379289.jpg/600x600bb.jpg",
    "rawTitle": "Something Just Like This"
  },
  {
    "id": "Dy_eP-mqWow",
    "title": "Iris",
    "artist": "The Goo Goo Dolls",
    "album": "Greatest Hits, Vol. One: The Singles",
    "duration": 290,
    "cover": "https://is1-ssl.mzstatic.com/image/thumb/Music/b4/0c/98/mzi.vhowcacb.jpg/600x600bb.jpg",
    "rawTitle": "Iris"
  },
  {
    "id": "En_6WWOWh8E",
    "title": "Riptide",
    "artist": "Vance Joy",
    "album": "Dream Your Life Away (Special Edition)",
    "duration": 202,
    "cover": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/7a/1c/65/7a1c6571-34e9-bb77-32be-90c72ba003c0/075679920355.jpg/600x600bb.jpg",
    "rawTitle": "Riptide"
  },
  {
    "id": "XUKyV49P8F0",
    "title": "Time to Pretend",
    "artist": "MGMT",
    "album": "Oracular Spectacular",
    "duration": 263,
    "cover": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/e5/06/cc/e506ccd5-56ec-3d4c-69f7-14900bea74f0/mzi.bbgsikee.jpg/600x600bb.jpg",
    "rawTitle": "Time to Pretend"
  },
  {
    "id": "Kf5pXDhx5Vc",
    "title": "End of Beginning",
    "artist": "Djo",
    "album": "DECIDE",
    "duration": 159,
    "cover": "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/e5/94/31/e59431de-7591-58e6-c4d4-105b6373ad6a/5056494917336_1.jpg/600x600bb.jpg",
    "rawTitle": "End of Beginning"
  },
  {
    "id": "HJstyRBLqBQ",
    "title": "I Thought I Saw Your Face Today",
    "artist": "She & Him",
    "album": "Volume One",
    "duration": 170,
    "cover": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/64/9c/75/649c75a3-0a3b-3c21-53ea-096036de40a0/56995.jpg/600x600bb.jpg",
    "rawTitle": "I Thought I Saw Your Face Today"
  },
  {
    "id": "kFJonMzqdig",
    "title": "Babydoll",
    "artist": "Dominic Fike",
    "album": "Don't Forget About Me, Demos - EP",
    "duration": 98,
    "cover": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/2d/37/18/2d3718e9-8620-b603-d3cc-f34ce817070d/886447290170.jpg/600x600bb.jpg",
    "rawTitle": "Babydoll"
  },
  {
    "id": "HfpR4tAmI7E",
    "title": "Love Me Not",
    "artist": "Ravyn Lenae",
    "album": "Bird's Eye",
    "duration": 213,
    "cover": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/07/8c/6c/078c6c94-d38d-0451-d57b-23e957b569f8/075679660893.jpg/600x600bb.jpg",
    "rawTitle": "Love Me Not"
  },
  {
    "id": "pqrUQrAcfo4",
    "title": "Do I Wanna Know?",
    "artist": "Arctic Monkeys",
    "album": "AM",
    "duration": 272,
    "cover": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/69/9c/b5/699cb5d6-115c-ff73-9d26-e57ea4350d72/887828031795.png/600x600bb.jpg",
    "rawTitle": "Do I Wanna Know?"
  },
  {
    "id": "r7Rn4ryE_w8",
    "title": "Sunflower (Spider-Man: Into the Spider-Verse)",
    "artist": "Post Malone & Swae Lee",
    "album": "Spider-Man: Into the Spider-Verse (Soundtrack From & Inspired by the Motion Picture)",
    "duration": 158,
    "cover": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/4b/30/2c/4b302cb6-7a14-5464-4e97-0577e9d0be49/18UMGIM82277.rgb.jpg/600x600bb.jpg",
    "rawTitle": "Sunflower (Spider-Man: Into the Spider-Verse)"
  },
  {
    "id": "ToO4VFCoR7U",
    "title": "White Ferrari",
    "artist": "Frank Ocean",
    "album": "Blonde",
    "duration": 249,
    "cover": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/bb/45/68/bb4568f3-68cd-619d-fbcb-4e179916545d/BlondCover-Final.jpg/600x600bb.jpg",
    "rawTitle": "White Ferrari"
  },
  {
    "id": "9cHbvRUALrc",
    "title": "Pink + White",
    "artist": "Frank Ocean",
    "album": "Blonde",
    "duration": 185,
    "cover": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/bb/45/68/bb4568f3-68cd-619d-fbcb-4e179916545d/BlondCover-Final.jpg/600x600bb.jpg",
    "rawTitle": "Pink + White"
  },
  {
    "id": "5S6az6odzPI",
    "title": "Ghost Town (feat. PARTYNEXTDOOR)",
    "artist": "Kanye West",
    "album": "ye",
    "duration": 271,
    "cover": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/f8/92/62/f892628e-bfd5-2437-c1f5-0ebbd366de09/00602577303098.rgb.jpg/600x600bb.jpg",
    "rawTitle": "Ghost Town"
  },
  {
    "id": "TL9gcd0WZT8",
    "title": "Song For Zula",
    "artist": "Phosphorescent",
    "album": "Muchacho de Lujo (Deluxe Edition)",
    "duration": 370,
    "cover": "https://is1-ssl.mzstatic.com/image/thumb/Music6/v4/ec/87/b1/ec87b108-d56f-1011-bfe5-be4d1f1b964c/656605138763.jpg/600x600bb.jpg",
    "rawTitle": "Song For Zula"
  },
  {
    "id": "ol6uhSEt5aM",
    "title": "Big Brat",
    "artist": "Phantom Planet",
    "album": "Phantom Planet",
    "duration": 201,
    "cover": "https://is1-ssl.mzstatic.com/image/thumb/Music/f9/6a/b3/mzi.dwnpkdzf.jpg/600x600bb.jpg",
    "rawTitle": "Big Brat"
  },
  {
    "id": "wS8otCVxpkw",
    "title": "Hometown",
    "artist": "twenty one pilots",
    "album": "Blurryface",
    "duration": 235,
    "cover": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/8e/e2/89/8ee28904-0821-610d-5011-a61845f62756/075679926951.jpg/600x600bb.jpg",
    "rawTitle": "Hometown"
  },
  {
    "id": "oZ6PS8hKZBA",
    "title": "Bon voyage",
    "artist": "YooA",
    "album": "Bon Voyage - EP",
    "duration": 220,
    "cover": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/d2/ef/17/d2ef1789-ccb0-191d-ff9d-283996fe6350/cover_KM0020792_1.jpg/600x600bb.jpg",
    "rawTitle": "Bon Voyage"
  },
  {
    "id": "6LUon6zLyTM",
    "title": "My Songs Know What You Did In The Dark (Light Em Up)",
    "artist": "Fall Out Boy",
    "album": "Save Rock And Roll",
    "duration": 187,
    "cover": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/3c/55/ac/3c55acb6-3c72-b7a8-2b86-d8f028da3756/13UMGIM27299.rgb.jpg/600x600bb.jpg",
    "rawTitle": "My Songs Know What You Did In The Dark (Light Em Up)"
  },
  {
    "id": "BCIa9LEszhk",
    "title": "Are You Gonna Be My Girl",
    "artist": "Jet",
    "album": "Get Born (Deluxe Edition)",
    "duration": 214,
    "cover": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/b8/ec/96/b8ec96fd-6b42-eb84-b5b8-1a787b72ff57/0603497869336.jpg/600x600bb.jpg",
    "rawTitle": "Are You Gonna Be My Girl"
  },
  {
    "id": "VHb_XIql_gU",
    "title": "Kids",
    "artist": "MGMT",
    "album": "Oracular Spectacular",
    "duration": 303,
    "cover": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/72/f3/ed/72f3edba-cbb0-4887-bb89-4aedf97ecd12/888880287779.jpg/600x600bb.jpg",
    "rawTitle": "Kids"
  },
  {
    "id": "nN66uAbiJJw",
    "title": "Lonely",
    "artist": "Noah Cyrus",
    "album": "THE END OF EVERYTHING",
    "duration": 144,
    "cover": "https://is1-ssl.mzstatic.com/image/thumb/Music123/v4/67/c5/9f/67c59f61-5676-e282-8f86-f8fcebaaa045/886448371564.jpg/600x600bb.jpg",
    "rawTitle": "Lonely"
  },
  {
    "id": "f8_EpxhNEsA",
    "title": "Feels Like We Only Go Backwards",
    "artist": "Tame Impala",
    "album": "Lonerism",
    "duration": 193,
    "cover": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/b7/40/9b/b7409bc6-24fa-b956-5613-4be8dc62be06/12UMGIM64219.rgb.jpg/600x600bb.jpg",
    "rawTitle": "Feels Like We Only Go Backwards"
  },
  {
    "id": "-olL71GgdXQ",
    "title": "Tear in My Heart",
    "artist": "twenty one pilots",
    "album": "Blurryface",
    "duration": 188,
    "cover": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/8e/e2/89/8ee28904-0821-610d-5011-a61845f62756/075679926951.jpg/600x600bb.jpg",
    "rawTitle": "Tear in My Heart"
  },
  {
    "id": "S0V9zehc_h8",
    "title": "Where'd All the Time Go?",
    "artist": "Dr. Dog",
    "album": "Shame, Shame (Deluxe Edition)",
    "duration": 235,
    "cover": "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/f5/9d/99/f59d994f-c48e-aba4-4347-fe934d46d4fe/0045778705450.png/600x600bb.jpg",
    "rawTitle": "Where'd All the Time Go?"
  },
  {
    "id": "Oncu0bgdcXU",
    "title": "Fix You",
    "artist": "Coldplay",
    "album": "X&Y",
    "duration": 295,
    "cover": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/0c/82/48/0c8248a8-4a5b-d30d-8056-f32d650d2fc9/190295978068.jpg/600x600bb.jpg",
    "rawTitle": "Fix You"
  },
  {
    "id": "4MXruqqZb8Q",
    "title": "Japanese Denim",
    "artist": "Andrew Foy",
    "album": "Japanese Denim - Single",
    "duration": 237,
    "cover": "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/eb/66/fb/eb66fbb4-cd6c-72f1-3602-681c5b0bf790/cover.jpg/600x600bb.jpg",
    "rawTitle": "Japanese Denim"
  },
  {
    "id": "O_d3DXVb430",
    "title": "Memories",
    "artist": "Maroon 5",
    "album": "Memories - Single",
    "duration": 189,
    "cover": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/22/58/58/225858c4-ef47-2b91-723a-47af3e99699a/19UMGIM64502.rgb.jpg/600x600bb.jpg",
    "rawTitle": "Memories (feat. Kid Cudi)"
  },
  {
    "id": "YTCS7IWUJu8",
    "title": "Way Down We Go",
    "artist": "KALEO",
    "album": "A / B",
    "duration": 220,
    "cover": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/74/fb/5e/74fb5e22-3a1b-4468-dc14-e097dc635e44/075679911506.jpg/600x600bb.jpg",
    "rawTitle": "Way down We Go"
  },
  {
    "id": "yfd_d0m46q0",
    "title": "She Will Be Loved",
    "artist": "Maroon 5",
    "album": "Songs About Jane",
    "duration": 258,
    "cover": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/d0/3e/25/d03e255d-e205-0e66-20f6-01e251896c25/14UMGIM27076.rgb.jpg/600x600bb.jpg",
    "rawTitle": "She Will Be Loved (Radio Mix)"
  },
  {
    "id": "1aokooixKIo",
    "title": "Sparks",
    "artist": "Coldplay",
    "album": "Parachutes",
    "duration": 227,
    "cover": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/f5/93/8c/f5938c49-964c-31d1-4b33-78b634f71fb7/190295978075.jpg/600x600bb.jpg",
    "rawTitle": "Sparks"
  },
  {
    "id": "ikFFVfObwss",
    "title": "Highway to Hell",
    "artist": "AC/DC",
    "album": "Single",
    "duration": 209,
    "cover": "https://i.ytimg.com/vi/ikFFVfObwss/hqdefault.jpg",
    "rawTitle": "Highway to Hell"
  },
  {
    "id": "w1Smzzw_w7Q",
    "title": "Ride",
    "artist": "twenty one pilots",
    "album": "Blurryface",
    "duration": 215,
    "cover": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/8e/e2/89/8ee28904-0821-610d-5011-a61845f62756/075679926951.jpg/600x600bb.jpg",
    "rawTitle": "Ride"
  },
  {
    "id": "u-IcadiJCrE",
    "title": "Numb",
    "artist": "LINKIN PARK",
    "album": "Meteora (Deluxe Edition)",
    "duration": 188,
    "cover": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/13/44/05/134405bd-9e27-a678-8953-b5f724201f95/093624948988.jpg/600x600bb.jpg",
    "rawTitle": "Numb"
  },
  {
    "id": "qJF0doztm4c",
    "title": "Ophelia",
    "artist": "The Lumineers",
    "album": "Single",
    "duration": 161,
    "cover": "https://i.ytimg.com/vi/qJF0doztm4c/hqdefault.jpg",
    "rawTitle": "Ophelia"
  },
  {
    "id": "PvM79DJ2PmM",
    "title": "The Less I Know The Better",
    "artist": "Mau P",
    "album": "The Less I Know The Better - Single",
    "duration": 176,
    "cover": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/a0/9a/2c/a09a2ca3-a5a6-814b-0af7-640dc0aef0aa/091012682261.jpg/600x600bb.jpg",
    "rawTitle": "The Less I Know The Better"
  },
  {
    "id": "9qnqYL0eNNI",
    "title": "Yellow",
    "artist": "Coldplay",
    "album": "Parachutes",
    "duration": 269,
    "cover": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/f5/93/8c/f5938c49-964c-31d1-4b33-78b634f71fb7/190295978075.jpg/600x600bb.jpg",
    "rawTitle": "Yellow"
  },
  {
    "id": "rnO-MflYxCw",
    "title": "Pumped Up Kicks",
    "artist": "Foster the People",
    "album": "Torches",
    "duration": 240,
    "cover": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/ba/07/5b/ba075b3c-f0c4-b519-59f3-7ae74d43246b/dj.lajxsvkg.jpg/600x600bb.jpg",
    "rawTitle": "Pumped Up Kicks"
  },
  {
    "id": "xOazTYPrt64",
    "title": "Somebody That I Used to Know (feat. Kimbra)",
    "artist": "Gotye",
    "album": "Making Mirrors",
    "duration": 245,
    "cover": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/b3/8a/98/b38a9867-2a9c-de2f-2d80-c624fb2200ec/11UMGIM19347.rgb.jpg/600x600bb.jpg",
    "rawTitle": "Somebody That I Used To Know"
  },
  {
    "id": "NxxjLD2pmlk",
    "title": "Feel Good Inc. (feat. David Jolicoeur, Kelvin Mercer & Vincent Mason)",
    "artist": "Gorillaz & De La Soul",
    "album": "Demon Days",
    "duration": 221,
    "cover": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/1c/0f/81/1c0f818a-e458-dd84-6f1b-ccbdf5fe14d6/825646291045.jpg/600x600bb.jpg",
    "rawTitle": "Feel Good Inc."
  },
  {
    "id": "4aNzDIKetB4",
    "title": "Unconsolable",
    "artist": "X Ambassadors",
    "album": "Love Songs Drug Songs - EP",
    "duration": 217,
    "cover": "https://is1-ssl.mzstatic.com/image/thumb/Music118/v4/0b/0a/3b/0b0a3b3a-fdec-8906-2375-322ea4a23033/00602537391691.rgb.jpg/600x600bb.jpg",
    "rawTitle": "Unconsolable"
  },
  {
    "id": "Ao1M3nwncA0",
    "title": "erase me (feat. Jacob Collier)",
    "artist": "Lizzy McAlpine",
    "album": "five seconds flat",
    "duration": 214,
    "cover": "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/11/6a/64/116a64ee-0db3-4e59-bd86-f44008e47f85/5056167170006.jpg/600x600bb.jpg",
    "rawTitle": "erase me"
  },
  {
    "id": "lyO-Sveg6a8",
    "title": "Knee Socks",
    "artist": "Arctic Monkeys",
    "album": "AM",
    "duration": 258,
    "cover": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/69/9c/b5/699cb5d6-115c-ff73-9d26-e57ea4350d72/887828031795.png/600x600bb.jpg",
    "rawTitle": "Knee Socks"
  },
  {
    "id": "GGsuLVlLObc",
    "title": "Shut Up and Dance",
    "artist": "WALK THE MOON",
    "album": "TALKING IS HARD (Expanded Edition)",
    "duration": 199,
    "cover": "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/bf/b6/76/bfb67621-b78d-3924-6d29-4f367697a674/886445045758.jpg/600x600bb.jpg",
    "rawTitle": "Shut Up and Dance"
  },
  {
    "id": "aNM3ZUcRQLI",
    "title": "Formula (From \"Euphoria: Season 1\" Soundtrack)",
    "artist": "Labrinth",
    "album": "Euphoria (Original Score from the HBO Series)",
    "duration": 92,
    "cover": "https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/6f/f4/05/6ff40578-72c8-e9ed-5413-96dc4874cc86/886447932223.jpg/600x600bb.jpg",
    "rawTitle": "Formula (From \"Euphoria: Season 1\" Soundtrack)"
  },
  {
    "id": "sCAiqvtCYiY",
    "title": "Trojans",
    "artist": "Atlas Genius",
    "album": "When It Was Now (Deluxe Version)",
    "duration": 219,
    "cover": "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/8a/98/e4/8a98e476-4455-a587-b8b1-8d37d3df677f/093624947400.jpg/600x600bb.jpg",
    "rawTitle": "Trojans"
  },
  {
    "id": "a24EUd0zeqI",
    "title": "Shut up My Moms Calling",
    "artist": "Hotel Ugly",
    "album": "Shut up My Moms Calling - Single",
    "duration": 165,
    "cover": "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/63/11/1b/63111b50-00ce-2734-e09f-94fb791c9dee/0d6bb465-1f3e-457c-99e5-a786f63c3fbb.jpg/600x600bb.jpg",
    "rawTitle": "Shut up My Moms Calling"
  },
  {
    "id": "HBBBWBOAf6c",
    "title": "Miracle Man",
    "artist": "Ozzy Osbourne",
    "album": "No Rest for the Wicked (Bonus Track Version)",
    "duration": 224,
    "cover": "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/1e/ca/9e/1eca9e72-1d13-1590-355c-e1d87be4fb9f/696998542624.jpg/600x600bb.jpg",
    "rawTitle": "Miracle Man"
  },
  {
    "id": "khnokW3Mw24",
    "title": "Instant Crush",
    "artist": "Daft Punk & Julian Casablancas",
    "album": "Random Access Memories",
    "duration": 338,
    "cover": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/e8/43/5f/e8435ffa-b6b9-b171-40ab-4ff3959ab661/886443919266.jpg/600x600bb.jpg",
    "rawTitle": "Instant Crush (feat. Julian Casablancas)"
  },
  {
    "id": "Qnx-FqKqI9o",
    "title": "What You Know",
    "artist": "Two Door Cinema Club",
    "album": "Tourist History",
    "duration": 191,
    "cover": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/e6/7f/61/e67f61ff-6231-1613-a2a9-aa7f7439457c/00892038002275_Cover.jpg/600x600bb.jpg",
    "rawTitle": "What You Know"
  }
]; // FALLBACK_TRACKS_PLACEHOLDER

const $ = (id) => document.getElementById(id);

const el = {
  player: $('player'),
  cover: $('cover'),
  title: $('title'),
  artist: $('artist'),
  seek: $('seek'),
  seekFill: $('seekFill'),
  seekKnob: $('seekKnob'),
  tCur: $('tCur'),
  tDur: $('tDur'),
  play: $('play'),
  prev: $('prev'),
  next: $('next'),
  shuffle: $('shuffle'),
  listBtn: $('listBtn'),
  list: $('list'),
  listItems: $('listItems'),
  clock: $('clock'),
  listeners: $('listeners'),
  bumperText: $('bumperText'),
  bumperNext: $('bumperNext'),
  shutterBtn: $('shutter-btn'),
  webBtn: $('web-btn'),
  logo: document.querySelector('.logo'),
  flashOverlay: $('flash-overlay'),
};

const state = {
  tracks: [],
  order: [], // indices into tracks, in play order
  pos: 0, // index into order
  shuffle: true,
  ready: false,
  playing: false,
  started: false,
  scrubbing: false,
};

let yt = null;

/* ── Helpers ─────────────────────────────────────────────────── */

const fmt = (s) => {
  if (!Number.isFinite(s) || s < 0) s = 0;
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
};

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function buildOrder() {
  const seq = Array.from({ length: state.tracks.length }, (_, i) => i);
  return state.shuffle ? shuffle(seq) : seq;
}

const currentTrack = () => state.tracks[state.order[state.pos]];

/* ── Rendering ───────────────────────────────────────────────── */

let swapTimer = null;

function renderTrack() {
  const t = currentTrack();
  if (!t) return;

  if (el.title.dataset.rendered) {
    el.player.classList.add('is-swapping');
    clearTimeout(swapTimer);
    swapTimer = setTimeout(() => el.player.classList.remove('is-swapping'), 40);
  }
  el.title.dataset.rendered = '1';

  el.title.textContent = t.title;
  el.artist.textContent = t.artist || t.rawTitle || '';
  el.cover.src = t.cover || '';
  el.cover.alt = `${t.title} artwork`;

  if (state.started) document.title = `${t.title} — Peter's iPod`;

  [...el.listItems.children].forEach((li, i) =>
    li.classList.toggle('is-current', i === state.pos),
  );
  const active = el.listItems.children[state.pos];
  if (active && el.list.classList.contains('is-open')) {
    active.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
}

function renderList() {
  el.listItems.innerHTML = '';
  state.order.forEach((trackIdx, i) => {
    const t = state.tracks[trackIdx];
    const li = document.createElement('li');
    const btn = document.createElement('button');
    btn.type = 'button';

    const leftContainer = document.createElement('span');
    leftContainer.className = 't-left';

    const num = document.createElement('span');
    num.className = 't-num';
    num.textContent = String(i + 1).padStart(2, '0');

    const title = document.createElement('span');
    title.className = 't-title';
    title.textContent = t.title;

    leftContainer.append(num, title);

    const artist = document.createElement('span');
    artist.className = 't-artist';
    artist.textContent = t.artist || '';

    btn.append(leftContainer, artist);
    btn.addEventListener('click', () => go(i));
    li.append(btn);
    el.listItems.append(li);
  });
}

function renderPlaying(on) {
  state.playing = on;
  el.player.classList.toggle('is-playing', on);
  el.play.setAttribute('aria-label', on ? 'Pause' : 'Play');
}

/* ── Playback Navigation ─────────────────────────────────────── */

function go(newPos, autoplay = true) {
  const n = state.order.length;
  state.pos = ((newPos % n) + n) % n;
  renderTrack();
  if (!yt) return;
  if (autoplay) {
    state.started = true;
    yt.loadVideoById(currentTrack().id);
  } else {
    yt.cueVideoById(currentTrack().id);
  }
}

function toggle() {
  if (!yt || !state.ready) {
    console.warn("YouTube player is not ready yet. Please check connection or wait.");
    const oldTitle = el.title.textContent;
    el.title.textContent = "Connecting to YouTube...";
    setTimeout(() => {
      if (el.title.textContent === "Connecting to YouTube...") {
        el.title.textContent = oldTitle;
      }
    }, 2500);
    return;
  }
  if (state.playing) {
    yt.pauseVideo();
  } else {
    state.started = true;
    yt.playVideo();
  }
}

/* ── Progress loop ───────────────────────────────────────────── */

const poll = { at: 0, time: 0, duration: 0 };
let lastSecond = -1;
let lastDuration = -1;

function samplePlayer() {
  if (!yt || typeof yt.getCurrentTime !== 'function') return;
  poll.time = yt.getCurrentTime() || 0;
  poll.duration = yt.getDuration() || 0;
  poll.at = performance.now();
}

function paintProgress() {
  requestAnimationFrame(paintProgress);
  if (!yt || state.scrubbing || !poll.duration) return;

  const drift = state.playing ? (performance.now() - poll.at) / 1000 : 0;
  const cur = Math.min(poll.duration, poll.time + drift);
  const frac = Math.min(1, Math.max(0, cur / poll.duration));

  el.seekFill.style.transform = `scaleX(${frac})`;
  el.seekKnob.style.transform = `translate(-50%, -50%) translateX(${
    frac * el.seek.clientWidth
  }px)`;

  const second = Math.floor(cur);
  if (second !== lastSecond) {
    lastSecond = second;
    el.tCur.textContent = fmt(cur);
    el.seek.setAttribute('aria-valuenow', String(Math.round(frac * 100)));
  }
  if (poll.duration !== lastDuration) {
    lastDuration = poll.duration;
    el.tDur.textContent = fmt(poll.duration);
  }
}

/* ── Seeking ─────────────────────────────────────────────────── */

function fractionFromEvent(e) {
  const r = el.seek.getBoundingClientRect();
  return Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
}

function previewSeek(frac) {
  el.seekFill.style.transform = `scaleX(${frac})`;
  el.seekKnob.style.transform = `translate(-50%, -50%) translateX(${
    frac * el.seek.clientWidth
  }px)`;
  if (yt && typeof yt.getDuration === 'function') {
    el.tCur.textContent = fmt((yt.getDuration() || 0) * frac);
  }
}

el.seek.addEventListener('pointerdown', (e) => {
  if (!yt) return;
  state.scrubbing = true;
  el.seek.setPointerCapture(e.pointerId);
  previewSeek(fractionFromEvent(e));
});

el.seek.addEventListener('pointermove', (e) => {
  if (state.scrubbing) previewSeek(fractionFromEvent(e));
});

el.seek.addEventListener('pointerup', (e) => {
  if (!state.scrubbing) return;
  state.scrubbing = false;
  el.seek.releasePointerCapture(e.pointerId);
  const dur = yt?.getDuration?.() || 0;
  if (dur) yt.seekTo(dur * fractionFromEvent(e), true);
  samplePlayer();
});

el.seek.addEventListener('keydown', (e) => {
  const step = e.key === 'ArrowRight' ? 5 : e.key === 'ArrowLeft' ? -5 : 0;
  if (!step || !yt) return;
  e.preventDefault();
  yt.seekTo(Math.max(0, (yt.getCurrentTime() || 0) + step), true);
});

/* ── Controls ────────────────────────────────────────────────── */

el.play.addEventListener('click', toggle);
el.prev.addEventListener('click', () => {
  if (yt && (yt.getCurrentTime() || 0) > 3) yt.seekTo(0, true);
  else go(state.pos - 1);
});
el.next.addEventListener('click', () => go(state.pos + 1));

el.shuffle.addEventListener('click', () => {
  const keep = currentTrack();
  state.shuffle = !state.shuffle;
  el.shuffle.classList.toggle('is-on', state.shuffle);
  el.shuffle.setAttribute('aria-pressed', String(state.shuffle));

  state.order = buildOrder();
  state.pos = Math.max(0, state.order.indexOf(state.tracks.indexOf(keep)));
  renderList();
  renderTrack();
});

el.listBtn.addEventListener('click', () => {
  const open = !el.list.classList.contains('is-open');
  el.list.classList.toggle('is-open', open);
  el.listBtn.classList.toggle('is-on', open);
  el.listBtn.setAttribute('aria-expanded', String(open));
  if (open) {
    el.listItems.children[state.pos]?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }
});

document.addEventListener('keydown', (e) => {
  if (e.target.matches('input, textarea, [contenteditable]')) return;
  if (e.key === ' ' || e.key === 'k') {
    e.preventDefault();
    toggle();
  } else if (e.key === 'n' || e.key === 'ArrowRight') {
    if (e.target !== el.seek) go(state.pos + 1);
  } else if (e.key === 'p' || e.key === 'ArrowLeft') {
    if (e.target !== el.seek) go(state.pos - 1);
  } else if (e.key === 'c') {
    snapPhoto();
  } else if (e.key === 't') {
    thwip();
  } else if (e.key === 'd' || e.key === 'D') {
    const consoleContainer = document.getElementById('debug-console-container');
    if (consoleContainer) {
      const isHidden = consoleContainer.style.display === 'none';
      consoleContainer.style.display = isHidden ? 'block' : 'none';
      console.log(`Debug Console is now ${isHidden ? 'visible' : 'hidden'}`);
    }
  }
});

/* ── Web Audio Synthesizer (Camera Shutter & Web Shooter) ────── */

let audioCtx = null;

try {
  if (navigator.audioSession) navigator.audioSession.type = 'playback';
} catch {
  /* not supported */
}

function ensureAudio() {
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
  } catch {
    return null;
  }
}

function primeAudio() {
  ensureAudio();
}

['pointerdown', 'keydown'].forEach((evt) =>
  document.addEventListener(evt, primeAudio, { once: true, capture: true }),
);

document.addEventListener('visibilitychange', () => {
  if (!document.hidden && audioCtx?.state === 'suspended') audioCtx.resume();
});

/* Camera Shutter sound synthesizer */
function snapPhoto() {
  const ctx = ensureAudio();
  if (!ctx) return;

  // Visual camera flash
  el.flashOverlay.classList.remove('is-flashing');
  void el.flashOverlay.offsetWidth; // restart CSS animation
  el.flashOverlay.classList.add('is-flashing');

  try {
    // 1. Quick high-frequency noise burst for shutter opening
    const bufferSize = ctx.sampleRate * 0.12; 
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(1500, ctx.currentTime);
    noiseFilter.Q.value = 3;

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.7, ctx.currentTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    // 2. Triangle wave sweeping down for the mirror slap mechanical clunk
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(90, ctx.currentTime + 0.08);

    oscGain.gain.setValueAtTime(0.5, ctx.currentTime);
    oscGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);

    osc.connect(oscGain);
    oscGain.connect(ctx.destination);

    noise.start();
    osc.start();
    noise.stop(ctx.currentTime + 0.12);
    osc.stop(ctx.currentTime + 0.12);
  } catch (err) {
    console.error("Audio synthesis failed:", err);
  }
}

/* Web Shooter "Thwip!" sound synthesizer */
function thwip() {
  const ctx = ensureAudio();
  if (!ctx) return;

  // Shake the logo/labels
  el.logo.classList.remove('is-shaking');
  void el.logo.offsetWidth; // restart CSS animation
  el.logo.classList.add('is-shaking');
  setTimeout(() => el.logo.classList.remove('is-shaking'), 500);

  try {
    const duration = 0.22;
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(300, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(6000, ctx.currentTime + duration);
    filter.Q.value = 4;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.4, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    // Dynamic sweeping pitch (representing the web flying out)
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(450, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(4000, ctx.currentTime + duration);

    oscGain.gain.setValueAtTime(0.3, ctx.currentTime);
    oscGain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + duration);

    osc.connect(oscGain);
    oscGain.connect(ctx.destination);

    noise.start();
    osc.start();
    noise.stop(ctx.currentTime + duration);
    osc.stop(ctx.currentTime + duration);
  } catch (err) {
    console.error("Audio synthesis failed:", err);
  }
}

el.shutterBtn.addEventListener('click', snapPhoto);
el.webBtn.addEventListener('click', thwip);

/* ── Quotes Rotation ────────────────────────────────────────── */

const BUMPER_QUOTES = [
  "With great power comes great responsibility...",
  "Spider-Man? Yeah, I take his pictures.",
  "Go web go! Fly! Up, up, and away web!",
  "I'm Spider-Man, I need a minute.",
  "You have a metal arm? That is awesome, dude!",
  "Nice Spidey suit. Did your husband make it for you?",
  "Careful, he's a hero.",
  "Anybody care about what I want?",
  "I'm just a friendly neighborhood Spider-Man.",
  "Sometimes to do what's right, we have to be steady and give up the thing we want the most.",
  "I'm gonna be late for Dr. Connors' class!"
];

let bumperOrder = [];
let bumperPos = 0;
let bumperTimer = null;

function nextBumper() {
  bumperPos += 1;
  if (bumperPos >= bumperOrder.length) {
    const last = bumperOrder[bumperOrder.length - 1];
    bumperOrder = shuffle(BUMPER_QUOTES.map((_, i) => i));
    if (bumperOrder[0] === last && bumperOrder.length > 1) {
      [bumperOrder[0], bumperOrder[1]] = [bumperOrder[1], bumperOrder[0]];
    }
    bumperPos = 0;
  }

  el.bumperText.classList.add('is-swapping');
  setTimeout(() => {
    el.bumperText.textContent = BUMPER_QUOTES[bumperOrder[bumperPos]];
    el.bumperText.classList.remove('is-swapping');
  }, 250);

  clearInterval(bumperTimer);
  bumperTimer = setInterval(nextBumper, 10000);
}

bumperOrder = shuffle(BUMPER_QUOTES.map((_, i) => i));
el.bumperText.textContent = BUMPER_QUOTES[bumperOrder[0]];
bumperTimer = setInterval(nextBumper, 10000);
el.bumperNext.addEventListener('click', nextBumper);

/* ── Clock & Mock Online Counter ────────────────────────────── */

function tickClock() {
  el.clock.textContent = new Date()
    .toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    .toLowerCase();
}
tickClock();
setInterval(tickClock, 15000);

// Simulated presence loop (midtown web slingers online)
(function trackPresence() {
  function updateCount() {
    if (document.hidden) return;
    // Peter swinging around NYC might see between 40 and 150 local listeners
    const mockCount = Math.floor(Math.random() * (150 - 40 + 1)) + 40;
    const countStr = String(mockCount);
    el.listeners.textContent = countStr;
    document.title = `SpideyPod (${countStr} swinging in Queens)`;
  }
  updateCount();
  setInterval(updateCount, 15000);
})();

/* ── YouTube Player API Integration ──────────────────────────── */

function preferAudio() {
  try {
    yt?.setPlaybackQuality?.('tiny');
  } catch {
    /* fallback ignored by YT on some videos */
  }
}

window.onYouTubeIframeAPIReady = () => {
  yt = new YT.Player('yt-player', {
    height: '1',
    width: '1',
    videoId: currentTrack().id,
    playerVars: {
      playsinline: 1,
      controls: 0,
      disablekb: 1,
      modestbranding: 1,
      rel: 0,
    },
    events: {
      onReady: () => {
        state.ready = true;
        el.play.disabled = false;
        preferAudio();
      },
      onStateChange: (e) => {
        const S = YT.PlayerState;
        if (e.data === S.PLAYING) {
          state.consecutiveErrors = 0;
          renderPlaying(true);
          preferAudio();
        } else if (e.data === S.PAUSED || e.data === S.BUFFERING) {
          renderPlaying(e.data === S.BUFFERING && state.playing);
        } else if (e.data === S.ENDED) {
          go(state.pos + 1);
        }
      },
      onError: (err) => {
        console.warn(`YouTube Player error ${err.data} on track ${state.pos}.`);
        if (state.started) {
          state.consecutiveErrors = (state.consecutiveErrors || 0) + 1;
          if (state.consecutiveErrors > 3) {
            console.error("Too many consecutive playback errors. Stopping playback.");
            state.playing = false;
            renderPlaying(false);
            if (el.title) el.title.textContent = "Playback Error (Open localhost:3000)";
          } else {
            go(state.pos + 1, true);
          }
        } else {
          console.warn("Initial track failed to load. Standby.");
        }
      },
    },
  });

  setInterval(samplePlayer, 250);
  requestAnimationFrame(paintProgress);
};

/* ── Startup ─────────────────────────────────────────────────── */

(async function init() {
  try {
    const res = await fetch('tracks.json');
    state.tracks = await res.json();
    console.log("Successfully fetched tracks.json");
  } catch (err) {
    console.warn("Could not fetch tracks.json (likely due to opening the HTML file directly via file:// protocol). Falling back to inlined tracks.", err);
    state.tracks = FALLBACK_TRACKS;
  }

  if (!state.tracks.length) {
    el.title.textContent = 'Playlist is empty';
    return;
  }

  state.order = buildOrder();
  renderList();
  renderTrack();

  const s = document.createElement('script');
  s.src = 'https://www.youtube.com/iframe_api';
  document.head.append(s);

  // Diagnostics: Warning if YouTube doesn't load within 7 seconds
  setTimeout(() => {
    if (!state.ready) {
      console.error("YouTube Player API failed to initialize. It might be blocked or taking too long.");
      const debugAlert = document.createElement('div');
      debugAlert.id = 'yt-debug-alert';
      debugAlert.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:rgba(208,49,45,0.95);color:#fff;padding:12px 24px;border-radius:30px;font-size:0.9rem;font-weight:500;z-index:9999;box-shadow:0 8px 32px rgba(0,0,0,0.5);text-align:center;pointer-events:auto;';
      debugAlert.innerHTML = '⚠️ YouTube connection is taking too long. Please verify that YouTube is not blocked in your network/country.';
      document.body.appendChild(debugAlert);
    }
  }, 7000);
})();
