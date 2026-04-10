// ════════════════════════════════════════════════════════════
// DELIVERY LMS — Production App with Supabase
// ════════════════════════════════════════════════════════════
// SETUP: Replace the two values below with your Supabase keys
// Get them from: Supabase Dashboard → Settings → API
// ════════════════════════════════════════════════════════════

const SUPABASE_URL = "https://cgdjqktpztwxaubvbbbu.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnZGpxa3RwenR3eGF1YnZiYmJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3MjE3MjAsImV4cCI6MjA5MTI5NzcyMH0.ABgN5C-9zqvMZoVWOwYrnkxB_Aun1oLP3epmGQHls1Y";
// ════════════════════════════════════════════════════════════

import { useState, useEffect, useRef, useCallback, createContext, useContext } from "react";

// ── Supabase client (loaded via esm.sh CDN) ─────────────────
let supabase = null;
let supabaseReady = false;

async function initSupabase() {
  if (SUPABASE_URL === "YOUR_SUPABASE_URL") {
    console.log("⚠️ Supabase not configured — using localStorage mode");
    return false;
  }
  try {
    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    supabaseReady = true;
    console.log("✅ Supabase connected!");
    return true;
  } catch (e) {
    console.error("Supabase load failed:", e);
    return false;
  }
}

// ── LocalStorage fallback (works without Supabase) ──────────
const LS = {
  get: (key) => { try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } },
  set: (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} },
  remove: (key) => { try { localStorage.removeItem(key); } catch {} },
};

/* ─── FONTS & STYLES ─── */
const FontStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;600;700;800&family=Noto+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { height: 100%; font-family: 'Noto Sans', sans-serif; background: #0A0A14; color: #F0F0F0; }
    ::-webkit-scrollbar { width: 5px; } ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: #FF6B00; border-radius: 3px; }
    .font-display { font-family: 'Baloo 2', cursive; }
    input, textarea, select { font-family: 'Noto Sans', sans-serif; }
    @keyframes fadeUp   { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
    @keyframes spin     { to { transform: rotate(360deg); } }
    @keyframes shimmer  { 0%,100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
    @keyframes wave     { 0%,100% { height:8px; } 50% { height:30px; } }
    @keyframes pulse    { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
    @keyframes popIn    { 0% { transform:scale(0.8); opacity:0; } 100% { transform:scale(1); opacity:1; } }
    .fadeUp  { animation: fadeUp 0.4s ease both; }
    .popIn   { animation: popIn 0.3s cubic-bezier(0.34,1.56,0.64,1) both; }
    .shimmer-bg { background: linear-gradient(135deg,#FF6B00,#FF9500,#FF6B00); background-size:200%; animation: shimmer 3s ease infinite; }
    .wave-bar   { animation: wave 1.2s ease-in-out infinite; }
    .pulse      { animation: pulse 2s ease infinite; }
    .spinner    { width:20px;height:20px;border:2px solid rgba(255,255,255,0.2);border-top-color:white;border-radius:50%;animation:spin 0.7s linear infinite; }
    .glass { background: rgba(255,255,255,0.05); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.10); }
    .card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; }
    .card-hover { transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s; cursor: pointer; }
    .card-hover:hover { transform: translateY(-3px); box-shadow: 0 12px 30px rgba(0,0,0,0.4); }
    input[type=text],input[type=email],input[type=password] {
      background: rgba(255,255,255,0.07); border: 1.5px solid rgba(255,255,255,0.15);
      color: white; border-radius: 12px; padding: 13px 16px; width: 100%; font-size: 15px; outline: none;
      transition: border-color 0.2s, background 0.2s;
    }
    input:focus { border-color: #FF6B00; background: rgba(255,107,0,0.08); }
    input::placeholder { color: rgba(255,255,255,0.3); }
    button { cursor: pointer; transition: all 0.18s; }
    .btn-orange { background: linear-gradient(135deg,#FF6B00,#FF9500); color: white; border: none; border-radius: 12px; font-weight: 700; }
    .btn-orange:hover { transform: translateY(-2px); box-shadow: 0 8px 22px rgba(255,107,0,0.45); }
    .btn-orange:active { transform: translateY(0); }
    .btn-ghost  { background: rgba(255,255,255,0.07); color: #ddd; border: 1px solid rgba(255,255,255,0.14); border-radius: 10px; }
    .btn-ghost:hover  { background: rgba(255,255,255,0.14); }
    .tab-btn { background: none; border: none; border-bottom: 3px solid transparent; padding: 12px 14px; font-size: 13px; font-weight: 600; color: #777; white-space: nowrap; }
    .tab-btn.active { color: #FF6B00; border-bottom-color: #FF6B00; }
    .progress-track { background: rgba(255,255,255,0.08); border-radius: 999px; overflow: hidden; }
    .progress-fill  { border-radius: 999px; transition: width 0.6s cubic-bezier(0.34,1.56,0.64,1); }
    .sim-phone { border-radius: 28px; overflow: hidden; box-shadow: 0 24px 60px rgba(0,0,0,0.6), 0 0 0 2px rgba(255,255,255,0.08); }
    .badge { display:inline-flex;align-items:center;gap:4px;border-radius:20px;padding:3px 10px;font-size:12px;font-weight:600;border:1px solid; }
    .tag  { display:inline-block;border-radius:20px;padding:5px 12px;font-size:12px;font-weight:600; }
  `}</style>
);

/* ─── AUTH CONTEXT ─── */
const AuthCtx = createContext(null);
const useAuth = () => useContext(AuthCtx);

/* ─── CONSTANTS ─── */
const DAYS_META = [
  { id:1,  title:"Foundation",        sub:"Documents & Industry Overview",   icon:"📄", color:"#1F4E79" },
  { id:2,  title:"Quick Commerce",    sub:"Blinkit · Zepto · Instamart",     icon:"⚡", color:"#E65100" },
  { id:3,  title:"Food Delivery",     sub:"Zomato · Swiggy · EatSure",       icon:"🍕", color:"#C62828" },
  { id:4,  title:"E-Commerce",        sub:"Amazon Flex · Flipkart · Myntra", icon:"📦", color:"#1565C0" },
  { id:5,  title:"Logistics",         sub:"Shadowfax · Delhivery · DTDC",    icon:"🚚", color:"#4A148C" },
  { id:6,  title:"Bike Taxi & Cargo", sub:"Rapido · Porter",                 icon:"🏍️", color:"#006064" },
  { id:7,  title:"Smart Strategy",    sub:"Multi-App Earning Tips",          icon:"🧠", color:"#B71C1C" },
  { id:8,  title:"Customer Skills",   sub:"Scripts & Communication",         icon:"🌟", color:"#1A7A1A" },
  { id:9,  title:"Ratings & Income",  sub:"Maximize Your Earnings",          icon:"⭐", color:"#4527A0" },
  { id:10, title:"Certification",     sub:"Final Assessment & Career",       icon:"🏆", color:"#1B5E20" },
];

const TABS = [
  { id:"video",    label:"🎬 Video"    },
  { id:"audio",    label:"🎧 Audio"    },
  { id:"theory",   label:"📖 Theory"   },
  { id:"practice", label:"📱 Practice" },
  { id:"workbook", label:"✅ Workbook" },
];

/* ══ CONTENT DATA (abridged keys — same full data as before) ══ */
const CONTENT = {
  1:{
    video:{ title:"Welcome to Delivery Partner Training", duration:600,
      script:["🎤 Namaste! Delivery Boy Master Training Course mein aapka swagat hai!","📋 Ye journey aapko India ke top delivery platforms par hire karaegi.","🏭 India mein delivery industry ₹8 billion+ ki hai — Blinkit, Zepto, Amazon sab hire kar rahe hain.","💼 Aaj seekhenge: konse documents chahiye, industry ka overview.","📱 Kisi bhi platform ke liye 5 documents hamesha ready hone chahiye.","🚀 Course complete karte karte aap professional delivery partner ban jaoge!"],
      keyPoints:["Documents pehle ready karo","Industry ke 6 types samjho","Multiple apps mein register karo"] },
    audio:{ title:"Day 1 Audio Guide", duration:400,
      script:"Namaste! Aaj baat karte hain sabse zaroori cheez ke baare mein — documents aur industry overview. Delivery job ke liye 5 documents hamesha ready hone chahiye: Aadhaar Card, PAN Card, Driving License, RC (Registration Certificate), aur Vehicle Insurance. Sab digital format mein phone mein hone chahiye. Ek Google Drive folder banao aur sab upload karo. Industry ke 6 types hain: Quick Commerce (Blinkit/Zepto), Food (Zomato/Swiggy), E-Commerce (Amazon/Flipkart), Logistics (Shadowfax/Delhivery), Bike Taxi (Rapido), Cargo (Porter). Multi-app strategy sabse zyada kamaata hai — ₹40-60k/month possible!" },
    theory:{ sections:[
      { title:"📄 Zaroori Documents — Sab Platforms", content:"Ye 5 documents India ke kisi bhi delivery platform ke liye mandatory hain:", items:["✅ Aadhaar Card — ID + Address proof dono","✅ PAN Card — income aur tax ke liye","✅ Driving License — valid hona chahiye","✅ RC — vehicle registration certificate","✅ Vehicle Insurance — active policy","✅ Passport Photo (digital + physical)","✅ Bank Account (savings, UPI linked)","✅ PUC Certificate (Amazon/Porter ke liye)"] },
      { title:"📱 Documents Digital Karo", content:"Har document ki clear photo lo, Google Drive folder banao 'Delivery Docs' naam se:", items:["📁 Phone folder: 'Delivery Documents'","📸 Har doc — white background, clear photo","📄 CamScanner se PDF bhi banao","☁️ Google Drive backup mandatory","💾 File size: 100KB–500KB"] },
      { title:"🏭 Industry Types", content:"India mein delivery ke 6 main types:", items:["⚡ Quick Commerce: Blinkit, Zepto — 10 min delivery","🍕 Food: Zomato, Swiggy — restaurant se ghar","📦 E-Commerce: Amazon, Flipkart — parcels","🚚 Logistics: Shadowfax, Delhivery, DTDC","🏍️ Bike Taxi: Rapido — rides + delivery","🚛 Cargo: Porter — heavy items, shifting"] },
      { title:"💰 Earning Potential", content:"Realistic monthly estimates:", items:["⚡ Quick Commerce: ₹20,000–₹40,000/month","🍕 Food Delivery: ₹25,000–₹45,000/month","📦 E-Commerce: ₹20,000–₹35,000/month","🚚 Courier: ₹18,000–₹30,000/month","🧠 Multi-App: ₹40,000–₹60,000+/month"] }
    ]},
    practice:{ type:"docs-organizer" },
    workbook:{ title:"Day 1 Workbook — Documents Ready Karo", items:["Aadhaar card ki clear photo li (front + back)","PAN card photo ready ki","Driving License photo (valid expiry check kiya)","RC Certificate digital copy ready ki","Vehicle Insurance copy saved","Bank account details note kiye","Passport photo ready (physical + digital)","Google Drive folder 'Delivery Docs' banaya","Blinkit Delivery Partner App download kiya","Zomato Delivery Partner App download kiya","Swiggy Delivery Partner App download kiya","Shadowfax App download kiya"] },
    quiz:[
      { q:"Kaun sa document ID + address proof dono kaam karta hai?", opts:["PAN Card","Aadhaar Card","Driving License","RC"], ans:1 },
      { q:"Quick Commerce delivery kitne minute mein hoti hai?", opts:["60 minute","30 minute","10–20 minute","2 ghante"], ans:2 },
      { q:"Multi-app strategy se monthly kitna kamaa sakte hain?", opts:["₹5,000","₹10,000","₹15,000","₹40,000–60,000+"], ans:3 },
      { q:"PUC Certificate mainly kahan zaroori hai?", opts:["Blinkit","Zomato","Amazon Flex / Porter","Zepto"], ans:2 },
    ]
  },
  2:{
    video:{ title:"Quick Commerce — 10 Min Delivery", duration:560,
      script:["⚡ Quick Commerce = Dark Store se 1–3 km mein 10 minute delivery!","🟡 Blinkit: ₹20–35/order. Joining fee ₹449. Weekly pay.","🟣 Zepto: 10 min signup! Joining bonus ₹3,000–5,000.","🟠 Instamart: Food + grocery ek hi app mein!","⏰ Peak hours: 7–11 AM (breakfast) aur 5–9 PM (shaam).","🎯 Acceptance rate 80%+ rakho — warna algorithm orders kam deta hai.","💰 Peak hours mein 3–4 orders/hour = ₹100–150/hour possible!"],
      keyPoints:["Hub se 1–3 km delivery","Acceptance 80%+","7–11 AM & 5–9 PM peak"] },
    audio:{ title:"Blinkit & Zepto Audio", duration:380,
      script:"Blinkit per-packet model hai. Register karne ke liye Play Store se Blinkit Delivery Partner app download karo. Mobile number, OTP, city select, documents upload, ₹449 fee, 24-48 ghante verification, training video, hub par jao kit lo. Zepto mein sirf 10 minute mein register ho jaata hai! Zepto ka MBG — 7 se 11 PM ke beech login karo, guaranteed minimum milega. Swiggy Instamart mein food aur grocery dono ek app se handle hoti hai. Morning grocery karo, evening food karo — ek app, double earning!" },
    theory:{ sections:[
      { title:"🏪 Dark Store Kya Hota Hai?", content:"Dark Store ek sealed mini-warehouse hai — customers ke liye nahi, sirf delivery ke liye.", items:["📦 Pre-packed items — instant 60 sec pickup","🗺️ 1–3 km delivery radius only","🔄 Hub → Customer → Hub → Repeat","⚡ 3–4 orders per hour easily possible","🚴 Cycle/EV/Bike sab allowed"] },
      { title:"📱 Blinkit Registration", content:"", items:["1️⃣ Play Store → 'Blinkit Delivery Partner'","2️⃣ Mobile → OTP → City select","3️⃣ Documents upload","4️⃣ Joining fee: ₹449 (ya ₹49 + ₹100×4)","5️⃣ Background check: 24–48 hrs","6️⃣ Training video (15–20 min)","7️⃣ Hub → T-shirt + bag → Start!"] },
      { title:"📱 Zepto & Instamart", content:"", items:["Zepto: 10 min signup • Joining bonus ₹3–5k","Zepto MBG: 7–11 PM login = guaranteed min","Instamart: Food + Grocery dual mode","EV/Cycle friendly: Yulu/Zypp partner"] },
      { title:"💰 Earnings", content:"", items:["🟡 Blinkit: ₹20–35/order + distance","🟣 Zepto: ₹25–35 + batch bonus ₹15–20","🟠 Instamart: ₹12–25 + MG guarantee","🌧️ Rain bonus: ₹10–25 extra/order"] }
    ]},
    practice:{ type:"blinkit-sim" },
    workbook:{ title:"Day 2 Workbook — Quick Commerce", items:["Blinkit app mein registration complete kiya","Zepto app registration shuru kiya","Dark store concept clearly samjha","Order flow practice ki (Online → Accept → Pickup → Deliver)","Joining fee options note kiye","Zepto MBG samjha","Peak hours calendar banaya","Delivery bag packing technique practice ki","Acceptance rate ka importance samjha","Simulator mein ek poori delivery complete ki"] },
    quiz:[
      { q:"Blinkit mein order accept karne ke liye kitne seconds hain?", opts:["10 sec","30 sec","60 sec","2 min"], ans:1 },
      { q:"Zepto delivery radius?", opts:["10–15 km","5–8 km","1–3 km","20+ km"], ans:2 },
      { q:"Zepto MBG kab milta hai?", opts:["Morning 6–10 AM","Evening 7–11 PM","Weekend only","Har waqt"], ans:1 },
      { q:"Blinkit joining fee?", opts:["Free","₹99","₹449","₹2,000"], ans:2 },
    ]
  },
  3:{
    video:{ title:"Food Delivery — Zomato & Swiggy", duration:540, script:["🍕 Food delivery mein pickup restaurant se hoti hai, dark store se nahi!","⏳ Food pakne ka 10–30 min wait karna padta hai.","📱 Zomato: 6 minute mein onboard claim karta hai!","💰 Rain bonus: ₹20–50 extra per order — baarish = gold!","🔄 Swiggy dual mode: Food + Instamart ek app mein!","⭐ Customer rating har order ke baad milti hai — 4.5+ maintain karo."], keyPoints:["Restaurant wait time manage karo","Rain bonus maximize karo","Dual mode use karo"] },
    audio:{ title:"Zomato & Swiggy Audio", duration:360, script:"Zomato Delivery Partner app mein Go Online press karo. Order notification 30 seconds mein accept karo. Restaurant navigate karo, pahuncho, staff se order ID batao. Food pakne ka wait karo. Items check karo, pickup karo, customer navigate karo. OTP lo, deliver karo. Swiggy mein bhi yahi process, lekin food + grocery dono ek app se. Rain mein Zomato aur Swiggy dono surge dete hain — ₹20–50 extra per order. Jab baarish shuru ho, turant online aa jao!" },
    theory:{ sections:[
      { title:"📱 Zomato Registration", content:"", items:["1️⃣ 'Zomato Delivery Partner' app download","2️⃣ Mobile → OTP → Details","3️⃣ Documents upload","4️⃣ Quick training — 6 min onboarding!","5️⃣ Verification 24 hrs → Start + Daily payout!"] },
      { title:"🔄 Food Delivery Order Flow", content:"", items:["Go Online → Accept (30 sec) → Restaurant navigate","Arrived at Restaurant mark karo","Staff: 'Order ID XXX ki delivery hoon'","Food pakne ka wait karo — app mein update","Items check karo — sab hain? Packaging?","Picked Up → Customer navigate","Arrived at Customer → OTP → Delivered! ⭐"] },
      { title:"💰 Zomato Earning Tricks", content:"", items:["🌧️ Rain Bonus: ₹20–50 extra/order","⏰ Peak: Lunch 12–3 PM + Dinner 7–11 PM","🎯 Daily target: 30 orders = ₹300 extra","📅 Weekly: 150 orders = ₹1,000 bonus","🎊 Festivals: 2–3x surge"] }
    ]},
    practice:{ type:"zomato-sim" },
    workbook:{ title:"Day 3 Workbook — Food Delivery", items:["Zomato Delivery Partner app registration kiya","Zomato full order flow practice kiya","Swiggy food + Instamart dual mode samjha","Restaurant staff conversation script rehearse ki","Food packaging check karna practice kiya","Rain bonus strategy note ki","Mock delivery Trainer ke saath complete ki"] },
    quiz:[
      { q:"Food delivery mein pickup point?", opts:["Dark Store","Warehouse","Restaurant","Customer ka ghar"], ans:2 },
      { q:"Zomato rain bonus?", opts:["Koi bonus nahi","₹5/order","₹20–50/order","₹200/order"], ans:2 },
      { q:"Zomato payout?", opts:["Monthly only","Weekly only","Daily bhi available","Yearly"], ans:2 },
      { q:"Order pick karne se pehle kya check karo?", opts:["Weather","Packaging aur sab items","Customer ka naam","Your speed"], ans:1 },
    ]
  },
  4:{
    video:{ title:"Amazon Flex & E-Commerce", duration:520, script:["📦 E-Commerce mein ek trip mein 15–30 packages deliver hote hain!","🔵 Amazon Flex mein 'blocks' hote hain — 2–6 ghante ke slots.","🗺️ Route app automatically optimize karta hai.","📸 Har delivery par photo ya signature zaroori!","💵 COD: Cash lo, saamne count karo, app mein mark karo.","🎊 Festival: ₹160–180/hour tak milta hai!"], keyPoints:["Block system","Route follow karo","COD handle karo"] },
    audio:{ title:"Amazon Flex Audio", duration:340, script:"Amazon Flex mein delivery blocks book karte ho. Block start par station pahuncho. App se packages scan karo. Route follow karo. Har door knock/bell, naam verify, package do, photo lo. COD mein cash lo, count karo saamne, app mein mark karo. Festival season mein Amazon blocks bahut profitable hain. Prime Day aur Diwali ke time ₹160–180 per hour tak milta hai!" },
    theory:{ sections:[
      { title:"📱 Amazon Flex Registration", content:"", items:["Age: 18+ (2W), 20+ (3W)","Android 11.0+, 3GB RAM","Documents: DL, RC, Aadhaar, PAN, Insurance, PUC","Background check: 3–7 days","65+ cities across India"] },
      { title:"🔄 Amazon Flex Flow", content:"", items:["App mein block dekho → Select karo","Station par report karo","Packages scan karo — list app mein","Route follow karo","Knock → Name verify → Photo → COD collect","Block complete → Earnings credit"] },
      { title:"💰 Amazon Flex Earnings", content:"", items:["Base: ₹120–140/hour","Festival: ₹160–180/hour","Weekend: +₹20–30/hour","Customer tips: Direct credit","Payout: Weekly"] }
    ]},
    practice:{ type:"amazon-sim" },
    workbook:{ title:"Day 4 Workbook — E-Commerce", items:["Amazon Flex app download aur registration start kiya","Delivery Block system samjha","Route-based delivery concept clear hua","Multiple packages handling practice ki","COD process clearly samjha","Failed delivery RTO process note kiya","Flipkart/Myntra ke baare mein information li"] },
    quiz:[
      { q:"Amazon Flex block kitne ghante ka?", opts:["30 min","2–6 ghante","12 ghante","1 ghante"], ans:1 },
      { q:"Ek Amazon route mein kitne packages?", opts:["1–2","5–8","15–30","100+"], ans:2 },
      { q:"Festival season Amazon rate?", opts:["₹50/hr","₹80/hr","₹120/hr","₹160–180/hr"], ans:3 },
      { q:"COD mein cash lene ke baad?", opts:["Turant chale jao","Pocket mein rakho","Count karo + app mein mark karo","Customer ko slip do"], ans:2 },
    ]
  },
  5:{
    video:{ title:"Logistics — Shadowfax, Delhivery, DTDC", duration:500, script:["🚚 Logistics mein ek route par 40–80 parcels deliver karte hain!","⚫ Shadowfax: Food + Parcel + Bike Taxi — sab ek app mein!","📦 Delhivery: India ka largest logistics company.","🔷 DTDC: Since 1990 — franchise model.","⏰ Morning hub → Route → Evening return mandatory.","💵 COD cash roz shaam hub mein jama karo!"], keyPoints:["Hub model","Route delivery","COD cash management"] },
    audio:{ title:"Shadowfax & Delhivery Audio", duration:320, script:"Shadowfax ek bahut unique platform hai — food, parcel, bike taxi, Myntra orders sab ek app mein. Registration: app download, documents upload, training, hub par jao kit lo. Delhivery mein subah hub par report karo, route assign hogi. Har parcel barcode scan karo phir deliver karo. COD cash shaam ko hub mein jama karna mandatory hai. DTDC franchise model par kaam karta hai." },
    theory:{ sections:[
      { title:"⚫ Shadowfax", content:"", items:["Food + Parcel + Bike Taxi + Returns ek app","1 lakh+ partners, 2500+ cities","Insurance ₹7.5 lakh tak"] },
      { title:"📦 Delhivery", content:"", items:["Morning hub report → Route assign","40–80 parcels per day typical","Barcode scan → Deliver","18,500+ pin codes, 1M+ shipments/day","COD evening submission mandatory"] },
      { title:"🔷 DTDC", content:"", items:["Franchise model — 1990 se","14,000+ pin codes","DotZot = e-commerce dedicated","Better pay than standard DTDC"] }
    ]},
    practice:{ type:"shadowfax-sim" },
    workbook:{ title:"Day 5 Workbook — Logistics", items:["Shadowfax app download aur registration kiya","Multiple order types samjhe","Delhivery hub model samjha","DTDC franchise model note kiya","Parcel full day flow samjha","COD cash handling process samjha","Barcode scanning mock practice ki"] },
    quiz:[
      { q:"Shadowfax mein kaunsa kaam nahi hota?", opts:["Food delivery","Parcel delivery","Flight booking","Bike taxi"], ans:2 },
      { q:"Delhivery ek din kitne parcels?", opts:["5–10","40–80","200–300","1000+"], ans:1 },
      { q:"DTDC kab se hai?", opts:["1990","2005","2015","2020"], ans:0 },
      { q:"Shaam ko hub par kya jama karo?", opts:["Phone","COD cash","Food items","Documents"], ans:1 },
    ]
  },
  6:{
    video:{ title:"Rapido Captain & Porter", duration:480, script:["🏍️ Rapido: 100M+ rides, 1M+ captains!","🎯 3 modes: Bike Taxi + Parcel + Food Delivery!","🚛 Porter: vehicle size = earning size!","💰 Porter truck: ₹60,000+ per month possible!","🌧️ Rain mein Rapido surge 2–3x — GOLD MINE!","💡 Rapido + Porter dono — double income strategy!"], keyPoints:["Rapido 3 modes","Porter vehicle upgrade","Rain strategy"] },
    audio:{ title:"Rapido & Porter Audio", duration:300, script:"Rapido Captain app mein register karo. Background check ke baad captain badge milega. Teen kaam: Bike Taxi customer A se B, Parcel small packages, Food delivery Ownly feature. Porter mein vehicle size se earning hoti hai. 2-wheeler ₹18–25k, 3-wheeler ₹25–35k, mini truck ₹40–60k. Rain mein Rapido surge 2–3x hota hai — baarish mein kabhi offline mat jao!" },
    theory:{ sections:[
      { title:"🏍️ Rapido Registration", content:"", items:["'Rapido Captain' app download","Vehicle: Bike/Auto/Cab","Documents upload","Background check: 24–48 hrs","Training → Start!"] },
      { title:"💰 Rapido Earning Modes", content:"", items:["🏍️ Bike Taxi: ₹8–15/km + surge","📦 Parcel: ₹25–40/parcel","🍕 Food (Ownly): ₹15–30/order","🌧️ Rain: 1.5x–3x surge","🛡️ Insurance: ₹5 lakh/ride"] },
      { title:"🚚 Porter — Vehicle = Earning", content:"", items:["🏍️ 2-Wheeler: ₹18–25k/month","🛺 3-Wheeler: ₹25–35k/month","🚐 Mini Truck: ₹40–60k/month","🚚 Tempo+: ₹60–80k+/month"] }
    ]},
    practice:{ type:"rapido-sim" },
    workbook:{ title:"Day 6 Workbook — Rapido & Porter", items:["Rapido Captain app download aur registration kiya","3 earning modes samjhe","Porter app explore kiya","Apne vehicle ke liye best decide kiya","Rain bonus strategy samjhi","Porter loading/unloading process samjha","Simulator mein complete ride practice ki"] },
    quiz:[
      { q:"Rapido ke earning modes kitne hain?", opts:["1","2","3","5"], ans:2 },
      { q:"Porter par sabse zyada earning?", opts:["Bicycle","Bike","Tempo/Truck","Auto"], ans:2 },
      { q:"Rapido rain surge?", opts:["Koi surge nahi","1.1x","1.5x–3x","0.5x"], ans:2 },
      { q:"Rapido insurance?", opts:["₹50k","₹1 lakh","₹5 lakh","₹25k"], ans:2 },
    ]
  },
  7:{
    video:{ title:"Multi-App Strategy — ₹50k+", duration:540, script:["🧠 Smart rider ek app par nahi rukta!","⏰ 7–11 AM: Blinkit/Zepto grocery surge!","🌆 7–11 PM: Zomato/Swiggy dinner peak — highest earning!","📅 Weekend: Double incentives har jagah!","🌧️ Rain = GOLD: Kabhi offline mat jao!","💡 Zepto MBG + Zomato combination = best daily strategy!"], keyPoints:["Morning quick commerce","Evening food","Weekend always on"] },
    audio:{ title:"Smart Earning Audio", duration:320, script:"Multi-app strategy: Ek week mein sab apps register karo. Morning 7–11 AM Blinkit ya Zepto. Dopahar Amazon Flex ya Shadowfax. Shaam 7–11 PM Zomato ya Swiggy. Weekend pe maximum surge. Rain mein hamesha online. Festival days pe Amazon + Flipkart blocks extra pay dete hain. Referral program use karo — Zepto ₹2,000 deta hai!" },
    theory:{ sections:[
      { title:"⏰ Ideal Daily Schedule", content:"", items:["6–11 AM: Blinkit/Zepto (grocery surge)","11 AM–2 PM: Amazon Flex / Shadowfax","2–4 PM: Break — recharge","4–7 PM: Zomato/Swiggy pre-dinner","7–11 PM: Zomato + Zepto MBG — PEAK!","Weekend: Maximum surge all apps","🌧️ Rain: Rapido/Zomato immediately"] },
      { title:"🏆 City Strategy", content:"", items:["Delhi NCR: Blinkit + Zomato","Mumbai: Zepto + Blinkit + Swiggy","Bangalore: Zepto + Swiggy + Porter","Hyderabad: Blinkit + Zepto + Zomato","Tier-2: Instamart + DTDC + Shadowfax"] },
      { title:"💡 Top 10 Pro Secrets", content:"", items:["1. Hub ke paas raho","2. Rain = 2–3x surge — never stop","3. Festival blocks = ₹160–180/hr","4. Acceptance 90%+","5. 5-star = better zones","6. Refer karo — Zepto ₹2k/friend","7. EV/Cycle = zero fuel cost","8. Monday–Thursday: less competition","9. Same area master karo","10. Zepto + Zomato daily combo"] }
    ]},
    practice:{ type:"strategy-planner" },
    workbook:{ title:"Day 7 Workbook — Strategy", items:["Ideal daily schedule likha","City ke best apps identify kiye","Peak hours calendar banaya","Referral programs note kiye","Rain + festival bonus strategy note ki","Ek week ka earning target set kiya","Multi-app plan complete banaya"] },
    quiz:[
      { q:"Morning 7–11 AM best platform?", opts:["Zomato","Amazon Flex","Blinkit/Zepto","DTDC"], ans:2 },
      { q:"Peak dinner time?", opts:["2–4 PM","7–11 PM","6–8 AM","Midnight"], ans:1 },
      { q:"Rain mein kya karo?", opts:["Ghar raho","Offline ho jao","Online raho — surge milega","Break lo"], ans:2 },
      { q:"Zepto referral bonus?", opts:["₹100","₹500","₹1,000–2,000","₹10,000"], ans:2 },
    ]
  },
  8:{
    video:{ title:"Customer Excellence — 5 Stars", duration:500, script:["🌟 Delivery ek experience hai — sirf khana nahi!","😊 3-Second Rule: Smile + Greet + Confirm!","🗣️ 'Sir/Madam' — professional language hamesha.","😠 Angry customer = CALM: Listen, Acknowledge, Solve.","⭐ 4.5+ rating mandatory — warna orders kam.","💡 'Enjoy your meal!' — yeh ek line 5 stars dilata hai!"], keyPoints:["3-Second Rule","CALM formula","4.5+ hamesha"] },
    audio:{ title:"Customer Scripts Audio", duration:300, script:"Door par knock/bell. Hello main [Company] se delivery partner hoon. Customer ka naam confirm karo. Order do. OTP maango. Thank you enjoy your meal. Customer ghar nahi: 2 calls, 10 min wait, photo, Not Available mark karo. Angry customer: Pehle sorry, reason bao, solution offer. COD: Amount check, saamne count, OTP/sign lo. Professional — clean uniform, helmet, bag. Ye impression hi rating decide karta hai!" },
    theory:{ sections:[
      { title:"🗣️ 5 Essential Scripts", content:"", items:["1. Standard: 'Hello, delivery. [Name] hain? Ye order. OTP batayein?'","2. Not Home: '2 calls → 10 min → Not Available → Photo'","3. Angry: 'Sir kheda hai. CALM — kabhi argue nahi'","4. COD: 'Amount. Count karo saamne. App mein mark.'","5. Rating: 'Agar pasand aayi to rating zaroor dena!'"] },
      { title:"😠 CALM Formula", content:"", items:["C — Calm raho (argue nahi)","A — Acknowledge (unki baat suno)","L — Listen (interrupt nahi)","M — Move to Solution","Example: 'Sir, late ke liye maafi. Order theek hai? Kya help kar sakta hoon?'"] },
      { title:"👔 Professional Appearance", content:"", items:["✅ Clean company uniform/neat clothes","✅ Helmet — mandatory + professional","✅ Clean delivery bag, properly closed","✅ Phone 80%+ charged before shift","✅ Polite body language always"] }
    ]},
    practice:{ type:"script-practice" },
    workbook:{ title:"Day 8 Workbook — Customer Excellence", items:["5 scripts rehearse kiye aur yaad hain","CALM formula practice kiya","COD collection process practice kiya","3-Second Rule samjha","Rating request script practice ki","Normal delivery role-play complete ki","Angry customer scenario practice ki","Professional appearance self-check kiya"] },
    quiz:[
      { q:"3-Second Rule mein kya?", opts:["3 sec wait","Smile + Greet + Confirm","3 baar knock","3 sec mein OTP"], ans:1 },
      { q:"CALM mein 'A' ka matlab?", opts:["Angry","Argue","Acknowledge","Action"], ans:2 },
      { q:"Customer ghar nahi — kitna wait?", opts:["5 min","10 min","30 min","1 ghanta"], ans:1 },
      { q:"Rating 4.5 se kam — kya hoga?", opts:["Bonus milega","Orders kam honge","Koi change nahi","Pay badhega"], ans:1 },
    ]
  },
  9:{
    video:{ title:"Ratings, Incentives & Problems", duration:480, script:["⭐ Rating = Bhavishya! 4.5+ hamesha!","💰 Incentives: Daily + weekly targets = lakhs possible!","🔧 App crash, GPS error, customer not home — solutions hain!","📞 Support numbers save karo!","🎯 Unfair rating: 24 hours mein app mein dispute karo!","💡 Zepto quality score 80%+ = priority orders milti hain!"], keyPoints:["4.5+ maintain","Incentive targets hit karo","Dispute unfair ratings"] },
    audio:{ title:"Incentives & Problems Audio", duration:300, script:"Blinkit daily milestone: 25 orders = ₹200 bonus. Weekend double incentives. Zepto batch delivery extra ₹15–20. MBG 7–11 PM guaranteed. Zomato peak ₹10–30, rain ₹20–50, weekly ₹1,000. Amazon festival ₹160–180/hr. App crash: force close restart. GPS error: data check, location permission. Customer nahi: 2 calls 10 min wait support. Unfair rating: 24 hours mein app mein dispute raise karo." },
    theory:{ sections:[
      { title:"💰 Platform Incentives", content:"", items:["🟡 Blinkit: Daily milestone + weekend double","🟣 Zepto: Batch ₹15–20 + MBG + quality bonus","🔴 Zomato: Peak ₹10–30 + rain ₹20–50 + weekly ₹1k","🔵 Amazon: Festival ₹160–180/hr + tips","⚫ Shadowfax: Performance score = priority"] },
      { title:"🔧 Problem → Solution", content:"", items:["App crash → Force close → Restart → Cache clear","GPS error → Data check → Location ON → Restart","Customer not home → 2 calls → 10 min → Photo → Report","COD short → UPI request → Support inform","Rating unfair → 24 hr dispute in app","Payment missing → 48 hr wait → Ticket","Accident → 112 → Company helpline"] },
      { title:"⭐ Rating Impact", content:"", items:["⭐⭐⭐⭐⭐ Bonus + premium orders","⭐⭐⭐⭐ Good, stable","⭐⭐⭐ Warning — improve","⭐⭐ Less orders, zone change","⭐ Account review"] }
    ]},
    practice:{ type:"problem-solver" },
    workbook:{ title:"Day 9 Workbook — Ratings & Incentives", items:["Har platform ka incentive structure note kiya","Peak + rain bonus strategy yaad ki","Common problems + solutions yaad kiye","Emergency numbers phone mein save kiye","Dispute process samjha","COD shortfall handling practice ki"] },
    quiz:[
      { q:"Zomato rain bonus?", opts:["₹5/order","₹20–50/order","₹200/order","Koi nahi"], ans:1 },
      { q:"Unfair rating appeal kab?", opts:["1 week","24 hours","1 month","Kabhi nahi"], ans:1 },
      { q:"App crash — pehla step?", opts:["Naya phone lo","Force close + restart","Support call karo","Shift chhod do"], ans:1 },
      { q:"Zepto quality score target?", opts:["50%","70%","80%+","95%+"], ans:2 },
    ]
  },
  10:{
    video:{ title:"🏆 Congratulations! Final Assessment", duration:440, script:["🏆 Aap yahan tak pahunche — amazing!","📝 Final quiz: 10 din ki poori knowledge test hogi.","✅ Pass karo → Completion Certificate milega!","💼 Ab apply karo: Blinkit, Zepto, Zomato, Amazon — sab hire kar rahe hain!","🚀 Smart strategy: ₹40,000–60,000+ monthly possible!","🌟 Aap sirf delivery boy nahi — Professional Partner hain!","🎯 All the best — go deliver excellence!"], keyPoints:["Final quiz pass karo","Certificate lo","Career shuru karo"] },
    audio:{ title:"Final Day — Career Launch", duration:280, script:"Final assessment ke liye tips: Platform names, order flows, earning structures, problem solutions — sab yaad hona chahiye. Job interview tips: Documents ready rakho. Professional look maintain karo. Acceptance rate 4.5+ rating hamesha. Smart rider bano — multiple platforms. Peak hours target karo. Rain mein online raho. Festival maximum karo. Customer ko best experience do. Good luck — aap poori tarah ready hain!" },
    theory:{ sections:[
      { title:"📋 10-Day Summary", content:"", items:["Day 1: Documents ready ✅","Day 2: Quick Commerce ✅","Day 3: Food Delivery ✅","Day 4: E-Commerce ✅","Day 5: Logistics ✅","Day 6: Rapido + Porter ✅","Day 7: Multi-App Strategy ✅","Day 8: Customer Excellence ✅","Day 9: Ratings & Incentives ✅","Day 10: Final Assessment 🎯"] },
      { title:"💼 Job Apply Links", content:"", items:["Blinkit: blinkit.com/delivery","Zepto: Zepto app → Quick signup","Zomato: Zomato app → 6 min onboard","Swiggy: Swiggy app → Same day","Amazon Flex: Amazon Flex app","Shadowfax: Shadowfax app","Porter: Porter Captain app","Rapido: Rapido Captain app"] },
      { title:"🚀 Career Growth Path", content:"", items:["Month 1: Single app — learn basics","Month 2: Second app — increase earning","Month 3: Multi-app — ₹40k+ possible","Month 6: Preferred Partner status","Year 1: ₹50–60k+/month","Pro Tip: Save → Upgrade vehicle → Porter large = ₹80k/month"] }
    ]},
    practice:{ type:"final-quiz" },
    workbook:{ title:"Day 10 Final Checklist", items:["10 din ka content complete kiya","Sab simulators practice kiye","Sab quizzes pass kiye","Documents physical + digital ready hain","Target apps mein registration shuru kiya","Smart earning schedule banaya","First week delivery target set kiya","Profile photo professional quality mein hai"] },
    quiz:[
      { q:"Quick Commerce delivery radius?", opts:["10–15 km","5–8 km","1–3 km","20+ km"], ans:2 },
      { q:"Peak dinner time?", opts:["7–11 AM","12–3 PM","7–11 PM","2–5 AM"], ans:2 },
      { q:"CALM mein C ka matlab?", opts:["Call karo","Calm raho","Cancel karo","Count karo"], ans:1 },
      { q:"Amazon festival rate per hour?", opts:["₹80","₹100","₹120","₹160–180"], ans:3 },
      { q:"Heavy items bag mein kahan?", opts:["Sabse upar","Side mein","Sabse neeche","Bahar"], ans:2 },
      { q:"COD mein cash lene ke baad?", opts:["Turant jao","Pocket mein rakho","Saamne count + app mark","Free do"], ans:2 },
    ]
  }
};

/* ── Supabase DB helpers ─────────────────────────────────── */
async function dbGetProgress(userId) {
  if (!supabaseReady) return LS.get(`progress_${userId}`) || {};
  const { data } = await supabase.from("progress").select("*").eq("user_id", userId);
  const { data: days } = await supabase.from("day_completions").select("*").eq("user_id", userId);
  const prog = {};
  for (let d = 1; d <= 10; d++) {
    const tabs = {};
    (data || []).filter(r => r.day_id === d).forEach(r => { tabs[r.tab] = r.completed; });
    const dayDone = (days || []).find(r => r.day_id === d);
    tabs.completed = !!dayDone;
    prog[d] = tabs;
  }
  return prog;
}

async function dbSaveTabProgress(userId, dayId, tab) {
  if (!supabaseReady) {
    const p = LS.get(`progress_${userId}`) || {};
    if (!p[dayId]) p[dayId] = {};
    p[dayId][tab] = true;
    LS.set(`progress_${userId}`, p);
    return;
  }
  await supabase.from("progress").upsert(
    { user_id: userId, day_id: dayId, tab, completed: true, completed_at: new Date().toISOString() },
    { onConflict: "user_id,day_id,tab" }
  );
}

async function dbSaveDayComplete(userId, dayId, quizScore = 0) {
  if (!supabaseReady) {
    const p = LS.get(`progress_${userId}`) || {};
    if (!p[dayId]) p[dayId] = {};
    p[dayId].completed = true;
    LS.set(`progress_${userId}`, p);
    return;
  }
  await supabase.from("day_completions").upsert(
    { user_id: userId, day_id: dayId, quiz_score: quizScore },
    { onConflict: "user_id,day_id" }
  );
}

async function dbSaveCertificate(userId, score) {
  if (!supabaseReady) { LS.set(`cert_${userId}`, { score }); return; }
  await supabase.from("certificates").upsert({ user_id: userId, score }, { onConflict: "user_id" });
}

/* ── Small helpers ──────────────────────────────────────── */
const ProgressBar = ({ value, max, color = "#FF6B00", height = 6 }) => (
  <div className="progress-track" style={{ height }}>
    <div className="progress-fill" style={{ width: `${Math.min((value / max) * 100, 100)}%`, background: color, height }} />
  </div>
);

const Spinner = () => <div className="spinner" />;

/* ──────────────────────────────────────────────────────────
   SIMULATORS (same as before, condensed)
   ────────────────────────────────────────────────────────── */
const BlinkitSim = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const steps = [
    { title:"Blinkit Partner", sub:"Aaj ki earning: ₹0", action:"🟢 Go Online", icon:"🟡", otherInfo:"" },
    { title:"Online! ✅", sub:"Orders aa rahe hain...", action:"Taiyaar Raho", icon:"🟢", otherInfo:"" },
    { title:"📦 New Order!", sub:"Hub → Sector 12\n2.1 km | ₹28 + ₹5 bonus", action:"✅ Accept (30 sec)", icon:"⚡", otherInfo:"30 seconds mein decide karo!" },
    { title:"Hub Navigate", sub:"Instamart Hub\n500m | 2 min ETA", action:"Hub Par Pahuncha", icon:"🗺️", otherInfo:"" },
    { title:"🏪 Hub Par", sub:"Staff ko batao: Order ID #BK7823\nPackaging check karo!", action:"✅ Order Picked Up", icon:"📦", otherInfo:"Items: Milk ✅ Bread ✅ Eggs ✅" },
    { title:"Customer Navigate", sub:"Sector 12, Flat 304\n1.6 km | 5 min ETA", action:"Customer Ke Paas Pahuncha", icon:"🏠", otherInfo:"" },
    { title:"🔔 Door Par", sub:"Order: 3 items\n👤 Rahul Singh\nOTP: 4 digit", action:"OTP Enter → Deliver", icon:"🚪", otherInfo:"OTP: 7 4 2 1" },
    { title:"✅ Complete!", sub:"⭐⭐⭐⭐⭐\n₹33 credited!\nHub wapas jao!", action:"🎉 Next Order!", icon:"🎊", otherInfo:"Aaj: ₹33 | 1 order" },
  ];
  const s = steps[step];
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:16 }}>
      <div style={{ background:"#F9C301", padding:"6px 20px", borderRadius:10, color:"#1a1a1a", fontWeight:700, fontFamily:"'Baloo 2'" }}>🟡 BLINKIT Simulator</div>
      <div className="sim-phone" style={{ width:280, background: step===7?"#0A1A00":"#1a1a1a", minHeight:480 }}>
        <div style={{ background:"#F9C301", padding:"10px 16px", display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontWeight:800, color:"#1a1a1a", fontFamily:"'Baloo 2'", fontSize:18 }}>blinkit</span>
          <span style={{ marginLeft:"auto", background:"#1a1a1a", color:"#F9C301", padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:700 }}>Partner</span>
        </div>
        <div style={{ padding:20, display:"flex", flexDirection:"column", gap:16, minHeight:360 }}>
          <div style={{ textAlign:"center", fontSize:40 }}>{s.icon}</div>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontWeight:700, fontSize:17, color:"white", marginBottom:6 }}>{s.title}</div>
            <div style={{ color:"#aaa", fontSize:13, whiteSpace:"pre-line" }}>{s.sub}</div>
          </div>
          {s.otherInfo && <div style={{ background:"rgba(249,195,1,0.15)", border:"1px solid rgba(249,195,1,0.4)", borderRadius:10, padding:12, color:"#FFD700", fontSize:12, textAlign:"center" }}>{s.otherInfo}</div>}
          {step===7 && <div style={{ background:"rgba(76,175,80,0.2)", border:"1px solid #4CAF50", borderRadius:12, padding:14, textAlign:"center", color:"#4CAF50", fontWeight:700 }}>₹33 Credited! 🎉</div>}
          <ProgressBar value={step + 1} max={steps.length} />
          <div style={{ textAlign:"center", color:"#666", fontSize:12 }}>Step {step+1}/{steps.length}</div>
        </div>
        <div style={{ padding:"0 16px 20px" }}>
          <button onClick={() => { step < steps.length - 1 ? setStep(step + 1) : onComplete(); }}
            style={{ width:"100%", background:"linear-gradient(135deg,#F9C301,#FF9500)", color:"#1a1a1a", border:"none", padding:13, borderRadius:12, fontSize:14, fontWeight:700, cursor:"pointer" }}>
            {s.action}
          </button>
        </div>
      </div>
    </div>
  );
};

const ZomatoSim = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const steps = [
    { icon:"🔴", title:"Zomato Partner", sub:"Status: Offline", action:"🟢 Go Online" },
    { icon:"✅", title:"Online!", sub:"Order aanewala hai...", action:"Taiyaar Raho!" },
    { icon:"🔔", title:"🍕 New Order!", sub:"Spice Garden → Pooja Singh\n3.2 km | Est. ₹45", action:"✅ ACCEPT", note:"30 seconds!" },
    { icon:"🗺️", title:"Restaurant Navigate", sub:"Spice Garden, Greenpark\n📍 3.2 km | 8 min", action:"Restaurant Par Pahuncha" },
    { icon:"👨‍🍳", title:"Restaurant Mein", sub:"'Order ID #ZM4521 ki delivery hoon'\nFood 10 min mein ready hoga", action:"Order Ready Mila ✅" },
    { icon:"🛵", title:"Order Picked Up!", sub:"Pooja Singh, Lajpat Nagar\nFlat 201, Rose Apartments\n5.8 km | 12 min", action:"Customer Ke Paas" },
    { icon:"🔔", title:"Door Par Hoon", sub:"OTP Required\n'Enjoy your meal!' kehna!", action:"OTP Lo → Deliver", note:"OTP: 5 9 2 3" },
    { icon:"🎊", title:"✅ Delivered!", sub:"⭐ Pooja ne 5 star diya!\n₹45 + ₹15 tip = ₹60!", action:"🎉 Next Order!" },
  ];
  const s = steps[step];
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:16 }}>
      <div style={{ background:"#E23744", padding:"6px 20px", borderRadius:10, color:"white", fontWeight:700, fontFamily:"'Baloo 2'" }}>🔴 ZOMATO Simulator</div>
      <div className="sim-phone" style={{ width:280, background:"#1A0505", minHeight:480 }}>
        <div style={{ background:"#E23744", padding:"10px 16px", display:"flex", alignItems:"center" }}>
          <span style={{ fontWeight:800, color:"white", fontFamily:"'Baloo 2'", fontSize:18 }}>zomato</span>
          <span style={{ marginLeft:"auto", background:"rgba(255,255,255,0.2)", color:"white", padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:700 }}>Delivery</span>
        </div>
        <div style={{ padding:20, display:"flex", flexDirection:"column", gap:14, minHeight:360 }}>
          <div style={{ textAlign:"center", fontSize:38 }}>{s.icon}</div>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontWeight:700, fontSize:16, color:"white", marginBottom:6 }}>{s.title}</div>
            <div style={{ color:"#ccc", fontSize:13, whiteSpace:"pre-line" }}>{s.sub}</div>
          </div>
          {s.note && <div style={{ background:"rgba(226,55,68,0.2)", border:"1px solid rgba(226,55,68,0.5)", borderRadius:10, padding:10, color:"#ff8a8a", fontSize:12, textAlign:"center" }}>{s.note}</div>}
          {step===7 && <div style={{ background:"rgba(76,175,80,0.2)", border:"1px solid #4CAF50", borderRadius:12, padding:12, textAlign:"center", color:"#4CAF50", fontWeight:700 }}>₹60 Credited! 🎉</div>}
          <ProgressBar value={step+1} max={steps.length} color="#E23744" />
          <div style={{ textAlign:"center", color:"#666", fontSize:12 }}>Step {step+1}/{steps.length}</div>
        </div>
        <div style={{ padding:"0 16px 20px" }}>
          <button onClick={() => { step < steps.length-1 ? setStep(step+1) : onComplete(); }}
            style={{ width:"100%", background:"linear-gradient(135deg,#E23744,#FF6B6B)", color:"white", border:"none", padding:13, borderRadius:12, fontSize:14, fontWeight:700, cursor:"pointer" }}>
            {s.action}
          </button>
        </div>
      </div>
    </div>
  );
};

const AmazonSim = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const steps = [
    { icon:"📦", title:"Amazon Flex", sub:"Available Block: 3–7 PM\nNoida Station | Est. ₹560", action:"Block Select Karo" },
    { icon:"✅", title:"Block Accepted!", sub:"Amazon Station, Sector 63\n3:00 PM par report karo", action:"Station Par Pahuncha" },
    { icon:"📱", title:"Packages Scan Karo", sub:"22 packages aaj ke route mein\nSab scan karo!", action:"22/22 Scanned ✅", note:"Package 1: Riya Sharma ✅\nPackage 2: Amit Kumar ✅" },
    { icon:"🚗", title:"Route Follow Karo", sub:"Stop 1/22: Riya Sharma\nSector 12, C-45 | 2.3 km", action:"Stop 1 Deliver Kiya" },
    { icon:"🏠", title:"Delivering Package", sub:"Bell → Name verify → Package do\n📸 Photo lo!", action:"✅ Delivered + Photo Li" },
    { icon:"💵", title:"COD Order!", sub:"Priya Arora — ₹1,299 COD\nCash lo, saamne count karo!", action:"₹1,299 Received + Marked", note:"Count: 1000+200+99 = ₹1,299 ✅" },
    { icon:"🏆", title:"All Delivered! 🎊", sub:"22/22 ✅\nCOD: ₹1,299 collected\nBlock complete!", action:"Block Complete!" },
    { icon:"🎊", title:"₹605 Credited!", sub:"4 hours | 22 deliveries\n₹560 base + ₹45 tips\nWeekly payout mein!", action:"🎉 Excellent Work!" },
  ];
  const s = steps[step];
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:16 }}>
      <div style={{ background:"#FF9900", padding:"6px 20px", borderRadius:10, color:"#1a1a1a", fontWeight:700, fontFamily:"'Baloo 2'" }}>📦 AMAZON FLEX Simulator</div>
      <div className="sim-phone" style={{ width:280, background:"#0F1111", minHeight:480 }}>
        <div style={{ background:"#FF9900", padding:"10px 16px", display:"flex", alignItems:"center" }}>
          <span style={{ fontWeight:800, color:"#1a1a1a", fontFamily:"'Baloo 2'", fontSize:16 }}>amazon flex</span>
          <span style={{ marginLeft:"auto", background:"rgba(0,0,0,0.2)", color:"#1a1a1a", padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:700 }}>Partner</span>
        </div>
        <div style={{ padding:20, display:"flex", flexDirection:"column", gap:14, minHeight:360 }}>
          <div style={{ textAlign:"center", fontSize:38 }}>{s.icon}</div>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontWeight:700, fontSize:16, color:"white", marginBottom:6 }}>{s.title}</div>
            <div style={{ color:"#ccc", fontSize:13, whiteSpace:"pre-line" }}>{s.sub}</div>
          </div>
          {s.note && <div style={{ background:"rgba(255,153,0,0.15)", border:"1px solid rgba(255,153,0,0.4)", borderRadius:10, padding:10, color:"#FFB84C", fontSize:12, textAlign:"center", whiteSpace:"pre-line" }}>{s.note}</div>}
          {step===7 && <div style={{ background:"rgba(76,175,80,0.2)", border:"1px solid #4CAF50", borderRadius:12, padding:12, textAlign:"center", color:"#4CAF50", fontWeight:700 }}>₹605 Credited! 🎉</div>}
          <ProgressBar value={step+1} max={steps.length} color="#FF9900" />
          <div style={{ textAlign:"center", color:"#666", fontSize:12 }}>Step {step+1}/{steps.length}</div>
        </div>
        <div style={{ padding:"0 16px 20px" }}>
          <button onClick={() => { step<steps.length-1 ? setStep(step+1) : onComplete(); }}
            style={{ width:"100%", background:"linear-gradient(135deg,#FF9900,#FFB84C)", color:"#1a1a1a", border:"none", padding:13, borderRadius:12, fontSize:14, fontWeight:700, cursor:"pointer" }}>
            {s.action}
          </button>
        </div>
      </div>
    </div>
  );
};

const ShadowfaxSim = ({ onComplete }) => {
  const [step,setStep]=useState(0);
  const steps=[
    {icon:"⚫",title:"Shadowfax Partner",sub:"Order type select karo",action:"Parcel Delivery"},
    {icon:"🏭",title:"Parcel Route",sub:"42 parcels assigned\nSector 14, 15, 16",action:"Hub Se Load Kiya"},
    {icon:"📱",title:"Delivery #1",sub:"Anita Verma, Sector 14\nBarcode: SF8823441",action:"Scan → Deliver"},
    {icon:"💵",title:"COD Parcel",sub:"Mohit Sharma — ₹799 COD\nCash lo, count karo!",action:"₹799 Collected"},
    {icon:"🚪",title:"Customer Not Home",sub:"2 calls — no response\nDoor photo lo\nFailed mark karo",action:"Failed → Photo → Done"},
    {icon:"🏭",title:"Hub Wapas",sub:"41/42 delivered\n1 failed\nCOD ₹799 jama karo",action:"Cash Submit + Return"},
    {icon:"🏆",title:"Day Complete!",sub:"41/42 delivered\n₹830 earned!\n(₹680 + ₹150 bonus)",action:"🎉 Shabash!"},
  ];
  const s=steps[step];
  return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:16}}>
      <div style={{background:"#1C1C1C",border:"1px solid #444",padding:"6px 20px",borderRadius:10,color:"white",fontWeight:700,fontFamily:"'Baloo 2'"}}>⚫ SHADOWFAX Simulator</div>
      <div className="sim-phone" style={{width:280,background:"#111",minHeight:440}}>
        <div style={{background:"#1C1C1C",padding:"10px 16px",display:"flex",alignItems:"center"}}>
          <span style={{fontWeight:800,color:"white",fontFamily:"'Baloo 2'",fontSize:16}}>shadowfax</span>
          <span style={{marginLeft:"auto",background:"#FF6B00",color:"white",padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:700}}>Partner</span>
        </div>
        <div style={{padding:20,display:"flex",flexDirection:"column",gap:14,minHeight:320}}>
          <div style={{textAlign:"center",fontSize:36}}>{s.icon}</div>
          <div style={{textAlign:"center"}}>
            <div style={{fontWeight:700,fontSize:16,color:"white",marginBottom:6}}>{s.title}</div>
            <div style={{color:"#aaa",fontSize:13,whiteSpace:"pre-line"}}>{s.sub}</div>
          </div>
          <ProgressBar value={step+1} max={steps.length} color="#FF6B00"/>
          <div style={{textAlign:"center",color:"#666",fontSize:12}}>Step {step+1}/{steps.length}</div>
        </div>
        <div style={{padding:"0 16px 20px"}}>
          <button onClick={()=>{step<steps.length-1?setStep(step+1):onComplete();}}
            style={{width:"100%",background:"linear-gradient(135deg,#333,#555)",color:"white",border:"1px solid #666",padding:13,borderRadius:12,fontSize:14,fontWeight:700,cursor:"pointer"}}>
            {s.action}
          </button>
        </div>
      </div>
    </div>
  );
};

const RapidoSim = ({ onComplete }) => {
  const [step,setStep]=useState(0);
  const steps=[
    {icon:"🏍️",title:"Rapido Captain",sub:"Mode: Bike Taxi\nStatus: Offline",action:"🟢 Go Online",bg:"#1A1A00"},
    {icon:"🔔",title:"Ride Request!",sub:"Priya → Saket Metro\n4.2 km | ₹48 | 1.2x surge",action:"✅ Accept",bg:"#1A1A00"},
    {icon:"🗺️",title:"Pickup Navigate",sub:"Priya — Lajpat Nagar III\n800m door",action:"Pickup Par Pahuncha",bg:"#0A0A1A"},
    {icon:"👩",title:"Passenger Pickup",sub:"Priya baith gayi ✅\nSaket Metro → 3.4 km",action:"Ride Start!",bg:"#0A0A1A"},
    {icon:"🌧️",title:"🌧️ RAIN SURGE!",sub:"Surge: 1.8x active!\n₹48 → ₹86 ho gaya!\nKabhi offline mat jao!",action:"Ride Continue!",bg:"#001A2C"},
    {icon:"🏆",title:"Drop Complete ✅",sub:"Saket Metro\n₹86 credited (surge)!",action:"Next Ride!",bg:"#001A00"},
    {icon:"💰",title:"Aaj Ka Total",sub:"5 rides: ₹380\nSurge bonus: ₹125\nTotal: ₹505 (3 ghante!)",action:"🎉 Great Earning!",bg:"#0A1A00"},
  ];
  const s=steps[step];
  return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:16}}>
      <div style={{background:"#FFDD00",padding:"6px 20px",borderRadius:10,color:"#1a1a1a",fontWeight:700,fontFamily:"'Baloo 2'"}}>🏍️ RAPIDO Simulator</div>
      <div className="sim-phone" style={{width:280,background:s.bg,minHeight:440,transition:"background 0.4s"}}>
        <div style={{background:"rgba(0,0,0,0.4)",padding:"10px 16px",display:"flex",alignItems:"center"}}>
          <span style={{fontWeight:800,color:"#FFDD00",fontFamily:"'Baloo 2'",fontSize:18}}>rapido</span>
          <span style={{marginLeft:"auto",background:"rgba(255,255,255,0.15)",color:"white",padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:700}}>Captain</span>
        </div>
        <div style={{padding:20,display:"flex",flexDirection:"column",gap:14,minHeight:320}}>
          <div style={{textAlign:"center",fontSize:36}}>{s.icon}</div>
          <div style={{textAlign:"center"}}>
            <div style={{fontWeight:700,fontSize:16,color:"white",marginBottom:6}}>{s.title}</div>
            <div style={{color:"rgba(255,255,255,0.7)",fontSize:13,whiteSpace:"pre-line"}}>{s.sub}</div>
          </div>
          <ProgressBar value={step+1} max={steps.length} color="#FFDD00"/>
        </div>
        <div style={{padding:"0 16px 20px"}}>
          <button onClick={()=>{step<steps.length-1?setStep(step+1):onComplete();}}
            style={{width:"100%",background:"#FFDD00",color:"#1a1a1a",border:"none",padding:13,borderRadius:12,fontSize:14,fontWeight:700,cursor:"pointer"}}>
            {s.action}
          </button>
        </div>
      </div>
    </div>
  );
};

const ScriptPractice = ({ onComplete }) => {
  const [step,setStep]=useState(0);
  const [typed,setTyped]=useState("");
  const [show,setShow]=useState(false);
  const sc=[
    {title:"Standard Delivery",prompt:"Customer ne door khola. Kya bolenge?",expected:"Hello, main delivery partner hoon. Kya aap [Name] hain? Ye aapka order hai. OTP batayein?",hint:"Greeting + Name confirm + Order + OTP"},
    {title:"Angry Customer",prompt:"'Itni der kyun lagi?'",expected:"Sir, kheda hai. Traffic ki wajah se thodi delay. Aapka order bilkul theek hai. Kya help kar sakta hoon?",hint:"Apology + Reason + Solution"},
    {title:"COD Collection",prompt:"COD ₹850. Customer ne paise diye.",expected:"Sir, ₹850 received. Count karta hoon saamne. App mein mark karta hoon.",hint:"Amount + Saamne count + App mark"},
    {title:"Rating Request",prompt:"Delivery complete. Customer khush.",expected:"Agar service pasand aayi, app mein rating zaroor dena. Thank you! Enjoy your meal!",hint:"Politely request + Thank you"},
  ];
  const s=sc[step];
  return(
    <div style={{maxWidth:480,margin:"0 auto",display:"flex",flexDirection:"column",gap:16}}>
      <div style={{background:"linear-gradient(135deg,#1A7A1A,#2E7D32)",borderRadius:12,padding:16,textAlign:"center"}}>
        <div style={{fontWeight:700,fontSize:15,color:"white",fontFamily:"'Baloo 2'"}}>🎤 Script Practice</div>
        <div style={{color:"rgba(255,255,255,0.7)",fontSize:12,marginTop:4}}>Scenario {step+1}/4</div>
      </div>
      <div style={{background:"rgba(255,255,255,0.05)",borderRadius:12,padding:16}}>
        <div style={{color:"#FF6B00",fontSize:12,fontWeight:600,marginBottom:6}}>{s.title}</div>
        <div style={{color:"white",fontWeight:600}}>{s.prompt}</div>
      </div>
      <div>
        <div style={{color:"#aaa",fontSize:12,marginBottom:6}}>Apna response type karo:</div>
        <textarea value={typed} onChange={e=>setTyped(e.target.value)} placeholder="Yahan type karo..."
          style={{width:"100%",background:"rgba(255,255,255,0.07)",border:"1.5px solid rgba(255,255,255,0.15)",color:"white",borderRadius:12,padding:12,fontSize:14,resize:"none",minHeight:72,outline:"none",fontFamily:"'Noto Sans'"}}/>
      </div>
      <div style={{background:"rgba(255,107,0,0.1)",border:"1px solid rgba(255,107,0,0.3)",borderRadius:12,padding:14}}>
        <div style={{color:"#FF6B00",fontWeight:600,fontSize:13,marginBottom:4}}>💡 Hint: {s.hint}</div>
        {show&&<div style={{color:"#4CAF50",fontSize:13,marginTop:6}}>✅ Sample: {s.expected}</div>}
      </div>
      <div style={{display:"flex",gap:8}}>
        <button onClick={()=>setShow(p=>!p)} className="btn-ghost" style={{flex:1,padding:11,fontSize:13,fontWeight:600}}>{show?"Hide":"Show Answer"}</button>
        <button onClick={()=>{if(step<sc.length-1){setStep(step+1);setTyped("");setShow(false);}else{onComplete();}}}
          className="btn-orange" style={{flex:1,padding:11,fontSize:13}}>{step<sc.length-1?"Next →":"✅ Done!"}</button>
      </div>
    </div>
  );
};

const StrategyPlanner = ({ onComplete }) => {
  const [schedule,setSchedule]=useState({});
  const slots=[
    {slot:"morning",label:"🌅 7–11 AM",opts:["Blinkit","Zepto","Instamart","Break"]},
    {slot:"midday",label:"☀️ 11 AM–2 PM",opts:["Amazon Flex","Shadowfax","Delhivery","Break"]},
    {slot:"afternoon",label:"😴 2–4 PM",opts:["Break/Rest","Amazon Flex","Shadowfax","Work"]},
    {slot:"evening",label:"🌆 4–7 PM",opts:["Zomato","Swiggy","Rapido","Porter"]},
    {slot:"night",label:"🌙 7–11 PM",opts:["Zomato","Zepto MBG","Swiggy","Rapido"]},
    {slot:"weekend",label:"📅 Weekend",opts:["All apps max","Blinkit+Zomato","Rest","Festival orders"]},
    {slot:"rain",label:"🌧️ Baarish",opts:["Zomato surge","Rapido surge","Stay home","Shadowfax"]},
  ];
  const filled=Object.values(schedule).filter(Boolean).length;
  return(
    <div style={{maxWidth:480,margin:"0 auto",display:"flex",flexDirection:"column",gap:14}}>
      <div style={{background:"linear-gradient(135deg,#B71C1C,#C62828)",borderRadius:12,padding:16,textAlign:"center"}}>
        <div style={{fontWeight:700,color:"white",fontFamily:"'Baloo 2'"}}>🧠 Smart Strategy Planner</div>
        <div style={{color:"rgba(255,255,255,0.7)",fontSize:12,marginTop:4}}>{filled}/7 slots filled</div>
        <div style={{marginTop:8}}><ProgressBar value={filled} max={7} color="rgba(255,255,255,0.6)"/></div>
      </div>
      {slots.map(t=>(
        <div key={t.slot} style={{background:"rgba(255,255,255,0.04)",borderRadius:12,padding:14}}>
          <div style={{color:"white",fontWeight:600,fontSize:14,marginBottom:8}}>{t.label}</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
            {t.opts.map(o=>(
              <button key={o} onClick={()=>setSchedule(p=>({...p,[t.slot]:o}))}
                style={{padding:"5px 12px",borderRadius:20,fontSize:12,fontWeight:600,cursor:"pointer",border:"none",transition:"all 0.2s",
                  background:schedule[t.slot]===o?"#FF6B00":"rgba(255,255,255,0.1)",
                  color:schedule[t.slot]===o?"white":"#aaa"}}>
                {o}
              </button>
            ))}
          </div>
        </div>
      ))}
      {filled>=6&&<button onClick={onComplete} className="btn-orange" style={{padding:14,fontSize:15,width:"100%"}}>✅ Strategy Saved!</button>}
    </div>
  );
};

const DocsOrganizer = ({ onComplete }) => {
  const [checked,setChecked]=useState({});
  const docs=[
    {id:"a",name:"Aadhaar Card",icon:"🪪",note:"ID + Address proof dono"},
    {id:"p",name:"PAN Card",icon:"💳",note:"Income aur tax ke liye"},
    {id:"d",name:"Driving License",icon:"🚗",note:"Valid hona chahiye"},
    {id:"r",name:"RC Certificate",icon:"📋",note:"Vehicle registration"},
    {id:"i",name:"Vehicle Insurance",icon:"🛡️",note:"Active policy"},
    {id:"b",name:"Bank Account",icon:"🏦",note:"Salary ke liye"},
    {id:"ph",name:"Passport Photo",icon:"📸",note:"Latest, clear background"},
    {id:"puc",name:"PUC Certificate",icon:"🌿",note:"Amazon/Porter ke liye"},
  ];
  const done=Object.values(checked).filter(Boolean).length;
  return(
    <div style={{maxWidth:480,margin:"0 auto",display:"flex",flexDirection:"column",gap:12}}>
      <div style={{background:"linear-gradient(135deg,#1F4E79,#1565C0)",borderRadius:12,padding:16,textAlign:"center"}}>
        <div style={{fontWeight:700,color:"white",fontFamily:"'Baloo 2'"}}>📄 Documents Organizer</div>
        <div style={{color:"rgba(255,255,255,0.7)",fontSize:12,marginTop:4}}>{done}/8 ready</div>
        <div style={{marginTop:8}}><ProgressBar value={done} max={8} color="rgba(255,255,255,0.7)"/></div>
      </div>
      {docs.map(d=>(
        <div key={d.id} onClick={()=>setChecked(p=>({...p,[d.id]:!p[d.id]}))}
          style={{background:checked[d.id]?"rgba(76,175,80,0.12)":"rgba(255,255,255,0.04)",border:`1px solid ${checked[d.id]?"#4CAF50":"rgba(255,255,255,0.08)"}`,borderRadius:12,padding:14,cursor:"pointer",display:"flex",gap:12,alignItems:"center",transition:"all 0.2s"}}>
          <div style={{fontSize:24}}>{d.icon}</div>
          <div style={{flex:1}}>
            <div style={{fontWeight:600,color:checked[d.id]?"#4CAF50":"white",textDecoration:checked[d.id]?"line-through":"none",fontSize:14}}>{d.name}</div>
            <div style={{fontSize:12,color:"#777"}}>{d.note}</div>
          </div>
          <div style={{width:22,height:22,borderRadius:6,border:`2px solid ${checked[d.id]?"#4CAF50":"#444"}`,background:checked[d.id]?"#4CAF50":"transparent",display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontSize:13,flexShrink:0,transition:"all 0.2s"}}>{checked[d.id]&&"✓"}</div>
        </div>
      ))}
      {done>=7&&<button onClick={onComplete} className="btn-orange" style={{padding:14,fontSize:15,width:"100%"}}>✅ Documents Ready!</button>}
    </div>
  );
};

const ProblemSolver = ({ onComplete }) => {
  const [step,setStep]=useState(0);
  const [sel,setSel]=useState(null);
  const [show,setShow]=useState(false);
  const probs=[
    {q:"App crash ho gaya — orders nahi dikh rahe!",opts:["Naya phone lo","Force close, restart, clear cache","Support ticket (2 days wait)","Shift chhod do"],ans:1,ex:"Force close → Restart → Cache clear — 90% problems solve ho jaati hain."},
    {q:"Customer 2 calls ke baad nahi utha raha!",opts:["Package chhod do","2 calls → 10 min wait → Photo → Not Available mark","Free delivery do","Order cancel karo"],ans:1,ex:"Standard process: 2 calls → 10 min wait → Photo proof → Report. Kabhi bina confirm ke mat chhodo."},
    {q:"COD mein customer ne ₹500 diya, due tha ₹650!",opts:["Free chhod do","Apni pocket se pay karo","UPI lo ya order wapas, support inform","Gusse mein jao"],ans:2,ex:"UPI se request karo. Nahi to order wapas lo. Support ko zaroor inform karo."},
    {q:"GPS wrong route dikha raha hai!",opts:["Random dhundho","Customer call karo — address confirm, Google Maps backup","Cancel karo","Kisi se poocho"],ans:1,ex:"Customer ko call karo — exact address confirm. Google Maps backup always use karo."},
  ];
  const p=probs[step];
  return(
    <div style={{maxWidth:480,margin:"0 auto",display:"flex",flexDirection:"column",gap:14}}>
      <div style={{background:"linear-gradient(135deg,#4527A0,#512DA8)",borderRadius:12,padding:16,textAlign:"center"}}>
        <div style={{fontWeight:700,color:"white",fontFamily:"'Baloo 2'"}}>🔧 Problem Solver Challenge</div>
        <div style={{color:"rgba(255,255,255,0.7)",fontSize:12,marginTop:4}}>Problem {step+1}/4</div>
      </div>
      <div style={{background:"rgba(229,57,53,0.12)",border:"1px solid rgba(229,57,53,0.35)",borderRadius:12,padding:16}}>
        <div style={{color:"#FF8A80",fontWeight:600}}>⚠️ {p.q}</div>
      </div>
      {p.opts.map((o,i)=>(
        <button key={i} onClick={()=>{if(!show){setSel(i);setShow(true);}}}
          style={{padding:"11px 14px",borderRadius:12,border:"1px solid",textAlign:"left",cursor:"pointer",fontSize:13,transition:"all 0.2s",
            background:show?(i===p.ans?"rgba(76,175,80,0.15)":i===sel?"rgba(229,57,53,0.15)":"rgba(255,255,255,0.03)"):"rgba(255,255,255,0.05)",
            borderColor:show?(i===p.ans?"#4CAF50":i===sel?"#E53935":"rgba(255,255,255,0.1)"):"rgba(255,255,255,0.14)",
            color:show?(i===p.ans?"#4CAF50":i===sel?"#FF8A80":"#bbb"):"#ddd"}}>
          {show&&i===p.ans&&"✅ "}{show&&i===sel&&i!==p.ans&&"❌ "}{o}
        </button>
      ))}
      {show&&<div style={{background:"rgba(76,175,80,0.1)",border:"1px solid #4CAF50",borderRadius:12,padding:14}}>
        <div style={{color:"#4CAF50",fontWeight:600,fontSize:13,marginBottom:4}}>💡 {p.ex}</div>
      </div>}
      {show&&<button onClick={()=>{if(step<probs.length-1){setStep(step+1);setSel(null);setShow(false);}else{onComplete();}}}
        className="btn-orange" style={{padding:13,fontSize:14,width:"100%"}}>
        {step<probs.length-1?"Next Problem →":"✅ All Solved!"}
      </button>}
    </div>
  );
};

const FinalQuiz = ({ onComplete }) => {
  const all = Object.values(CONTENT).flatMap(d => d.quiz || []).slice(0, 10);
  const [step,setStep]=useState(0);
  const [score,setScore]=useState(0);
  const [sel,setSel]=useState(null);
  const [done,setDone]=useState(false);
  const q=all[step];
  if(done) return(
    <div style={{textAlign:"center",padding:32,display:"flex",flexDirection:"column",alignItems:"center",gap:16}} className="fadeUp">
      <div style={{fontSize:72}}>{score>=8?"🏆":score>=6?"🥈":"📚"}</div>
      <div style={{fontFamily:"'Baloo 2'",fontWeight:700,fontSize:24,color:score>=8?"#FFD700":score>=6?"#C0C0C0":"white"}}>
        {score>=8?"Platinum Partner!":score>=6?"Gold Partner!":"Practice More!"}
      </div>
      <div style={{fontSize:40,fontWeight:800,color:"#FF6B00"}}>{score}/10</div>
      <div style={{color:"#aaa"}}>{score>=8?"Excellent! Aap ready hain!":score>=6?"Accha! Kuch areas improve karo.":"Day 1–5 dobara dekho."}</div>
      <button onClick={()=>onComplete(score)} className="shimmer-bg" style={{padding:"14px 36px",borderRadius:12,fontWeight:700,fontSize:16,color:"white",border:"none",cursor:"pointer"}}>🎓 Certificate Lo!</button>
    </div>
  );
  return(
    <div style={{maxWidth:480,margin:"0 auto",display:"flex",flexDirection:"column",gap:14}}>
      <div style={{background:"linear-gradient(135deg,#1B5E20,#2E7D32)",borderRadius:12,padding:16,textAlign:"center"}}>
        <div style={{fontWeight:700,color:"white",fontFamily:"'Baloo 2'"}}>🏆 Final Assessment Quiz</div>
        <div style={{color:"rgba(255,255,255,0.7)",fontSize:12,marginTop:4}}>Q{step+1}/10 | Score: {score}</div>
        <div style={{marginTop:8}}><ProgressBar value={step} max={10} color="rgba(255,255,255,0.6)"/></div>
      </div>
      <div style={{background:"rgba(255,255,255,0.06)",borderRadius:12,padding:16}}>
        <div style={{color:"white",fontWeight:600,fontSize:15}}>{q.q}</div>
      </div>
      {q.opts.map((o,i)=>(
        <button key={i} onClick={()=>{if(sel===null)setSel(i);}}
          style={{padding:"11px 14px",borderRadius:12,border:"1px solid",textAlign:"left",cursor:"pointer",fontSize:13,transition:"all 0.2s",
            background:sel!==null?(i===q.ans?"rgba(76,175,80,0.15)":i===sel?"rgba(229,57,53,0.15)":"rgba(255,255,255,0.03)"):"rgba(255,255,255,0.05)",
            borderColor:sel!==null?(i===q.ans?"#4CAF50":i===sel?"#E53935":"rgba(255,255,255,0.1)"):"rgba(255,255,255,0.14)",
            color:sel!==null?(i===q.ans?"#4CAF50":i===sel?"#FF8A80":"#bbb"):"#ddd"}}>
          {sel!==null&&i===q.ans&&"✅ "}{o}
        </button>
      ))}
      {sel!==null&&(
        <button onClick={()=>{
          const ns=sel===q.ans?score+1:score;
          if(step<all.length-1){setStep(step+1);setSel(null);if(sel===q.ans)setScore(ns);}
          else{setDone(true);setScore(ns);}
        }} className="btn-orange" style={{padding:13,fontSize:14,width:"100%"}}>
          {step<all.length-1?"Next →":"See Results!"}
        </button>
      )}
    </div>
  );
};

/* ── Video Tab ────────────────────────────────────────────── */
const VideoTab = ({ dayId, content, onComplete }) => {
  const [playing,setPlaying]=useState(false);
  const [elapsed,setElapsed]=useState(0);
  const [lineIdx,setLineIdx]=useState(0);
  const [done,setDone]=useState(false);
  const ref=useRef(null);
  const dur=content.duration;
  const lineDur=Math.floor(dur/content.script.length);
  const meta=DAYS_META[dayId-1];

  useEffect(()=>{
    if(playing&&!done){
      ref.current=setInterval(()=>{
        setElapsed(e=>{
          const ne=e+1;
          setLineIdx(Math.min(Math.floor(ne/lineDur),content.script.length-1));
          if(ne>=dur){clearInterval(ref.current);setDone(true);setPlaying(false);onComplete();return dur;}
          return ne;
        });
      },80);
    }else clearInterval(ref.current);
    return()=>clearInterval(ref.current);
  },[playing]);

  const mm=Math.floor(elapsed/60),ss=elapsed%60,dm=Math.floor(dur/60),ds=dur%60;
  return(
    <div style={{display:"flex",flexDirection:"column",gap:18}}>
      <div style={{borderRadius:16,overflow:"hidden",aspectRatio:"16/9",maxWidth:560,width:"100%",margin:"0 auto",position:"relative",background:"#000"}}>
        <div style={{position:"absolute",inset:0,background:`linear-gradient(135deg,${meta.color}44,#000)`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:14,padding:24}}>
          <div style={{fontSize:44}}>{meta.icon}</div>
          <div style={{fontFamily:"'Baloo 2'",fontWeight:700,fontSize:19,color:"white",textAlign:"center"}}>{content.title}</div>
          {playing&&(
            <div style={{background:"rgba(0,0,0,0.65)",borderRadius:12,padding:"10px 18px",maxWidth:380,textAlign:"center",minHeight:52,display:"flex",alignItems:"center",justifyContent:"center"}}>
              <div style={{color:"#FFD700",fontSize:13,fontStyle:"italic",lineHeight:1.5}}>{content.script[lineIdx]}</div>
            </div>
          )}
          {!playing&&!done&&<div style={{color:"rgba(255,255,255,0.5)",fontSize:13}}>Play karein seekhna shuru karne ke liye</div>}
          {done&&<div style={{color:"#4CAF50",fontWeight:700,fontSize:15}}>✅ Video Complete!</div>}
          {!done&&(
            <button onClick={()=>setPlaying(p=>!p)}
              style={{width:52,height:52,borderRadius:"50%",background:"rgba(255,255,255,0.18)",border:"2.5px solid white",color:"white",fontSize:20,cursor:"pointer"}}>
              {playing?"⏸":"▶"}
            </button>
          )}
        </div>
        <div style={{position:"absolute",bottom:0,left:0,right:0,height:4,background:"rgba(255,255,255,0.15)"}}>
          <div style={{height:"100%",background:meta.color,width:`${(elapsed/dur)*100}%`,transition:"width 0.1s"}}/>
        </div>
      </div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",maxWidth:560,margin:"0 auto",width:"100%"}}>
        <span style={{color:"#777",fontSize:12}}>{mm}:{ss.toString().padStart(2,"0")} / {dm}:{ds.toString().padStart(2,"0")}</span>
        {!done&&<button onClick={()=>{setDone(true);setPlaying(false);onComplete();}} className="btn-ghost" style={{padding:"5px 14px",fontSize:12}}>Skip</button>}
        {done&&<span style={{color:"#4CAF50",fontSize:13,fontWeight:600}}>✅ Watched</span>}
      </div>
      <div style={{background:"rgba(255,255,255,0.04)",borderRadius:12,padding:16,maxWidth:560,margin:"0 auto",width:"100%"}}>
        <div style={{fontWeight:600,color:"#FF6B00",marginBottom:10,fontSize:13}}>🎯 Key Points:</div>
        {content.keyPoints.map((kp,i)=>(
          <div key={i} style={{display:"flex",gap:8,marginBottom:6}}>
            <span style={{color:"#FF6B00",fontWeight:700,fontSize:14}}>{i+1}.</span>
            <span style={{color:"#ddd",fontSize:13}}>{kp}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ── Audio Tab ────────────────────────────────────────────── */
const AudioTab = ({ dayId, content, onComplete }) => {
  const [playing,setPlaying]=useState(false);
  const [elapsed,setElapsed]=useState(0);
  const [done,setDone]=useState(false);
  const ref=useRef(null);
  const dur=content.duration;
  const meta=DAYS_META[dayId-1];
  useEffect(()=>{
    if(playing&&!done){
      ref.current=setInterval(()=>{
        setElapsed(e=>{
          const ne=e+1;
          if(ne>=dur){clearInterval(ref.current);setDone(true);setPlaying(false);onComplete();return dur;}
          return ne;
        });
      },80);
    }else clearInterval(ref.current);
    return()=>clearInterval(ref.current);
  },[playing]);
  const mm=Math.floor(elapsed/60),ss=elapsed%60;
  const pct=(elapsed/dur)*100;
  return(
    <div style={{display:"flex",flexDirection:"column",gap:18,alignItems:"center"}}>
      <div style={{background:`linear-gradient(135deg,${meta.color},#1a1a2e)`,borderRadius:20,padding:28,width:"100%",maxWidth:480,textAlign:"center"}}>
        <div style={{fontSize:40,marginBottom:10}}>{meta.icon}</div>
        <div style={{fontFamily:"'Baloo 2'",fontWeight:700,fontSize:17,color:"white",marginBottom:4}}>{content.title}</div>
        <div style={{color:"rgba(255,255,255,0.5)",fontSize:12,marginBottom:20}}>Day {dayId} Audio Guide</div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:2,height:40,marginBottom:20}}>
          {Array.from({length:14}).map((_,i)=>(
            <div key={i} className={playing?"wave-bar":""} style={{width:3,height:playing?undefined:Math.random()*18+6,background:playing?"rgba(255,255,255,0.9)":"rgba(255,255,255,0.35)",borderRadius:2,animationDelay:`${(i/14)*1.2}s`}}/>
          ))}
        </div>
        <div style={{background:"rgba(255,255,255,0.18)",borderRadius:999,height:5,marginBottom:10,overflow:"hidden"}}>
          <div style={{height:"100%",background:"white",width:`${pct}%`,borderRadius:999,transition:"width 0.1s"}}/>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",color:"rgba(255,255,255,0.6)",fontSize:11,marginBottom:18}}>
          <span>{mm}:{ss.toString().padStart(2,"0")}</span>
          {done&&<span style={{color:"#4CAF50"}}>✅ Complete!</span>}
          <span>{Math.floor(dur/60)}:{(dur%60).toString().padStart(2,"0")}</span>
        </div>
        {!done?(
          <button onClick={()=>setPlaying(p=>!p)} style={{width:52,height:52,borderRadius:"50%",background:"white",border:"none",color:meta.color,fontSize:22,cursor:"pointer",fontWeight:700}}>
            {playing?"⏸":"▶"}
          </button>
        ):<div style={{color:"#4CAF50",fontWeight:700}}>✅ Suna!</div>}
        {!done&&<button onClick={()=>{setDone(true);setPlaying(false);onComplete();}} style={{marginTop:12,background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.25)",color:"white",padding:"5px 14px",borderRadius:20,cursor:"pointer",fontSize:11}}>Skip</button>}
      </div>
      <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:14,padding:18,width:"100%",maxWidth:480}}>
        <div style={{fontWeight:600,color:"#FF6B00",marginBottom:8,fontSize:13}}>📜 Audio Transcript:</div>
        <div style={{color:"#bbb",fontSize:13,lineHeight:1.8}}>{content.script}</div>
      </div>
    </div>
  );
};

/* ── Theory Tab ───────────────────────────────────────────── */
const TheoryTab = ({ content, onComplete }) => {
  const [done,setDone]=useState(false);
  return(
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      {content.sections.map((sec,i)=>(
        <div key={i} style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:14,padding:18}}>
          <div style={{fontFamily:"'Baloo 2'",fontWeight:700,color:"#FF6B00",fontSize:15,marginBottom:8}}>{sec.title}</div>
          {sec.content&&<p style={{color:"#bbb",fontSize:13,marginBottom:10,lineHeight:1.7}}>{sec.content}</p>}
          {sec.items.map((item,ii)=>(
            <div key={ii} style={{display:"flex",gap:8,marginBottom:7,alignItems:"flex-start"}}>
              <div style={{width:5,height:5,borderRadius:"50%",background:"#FF6B00",marginTop:8,flexShrink:0}}/>
              <span style={{color:"#ddd",fontSize:13,lineHeight:1.6}}>{item}</span>
            </div>
          ))}
        </div>
      ))}
      {!done?(
        <button onClick={()=>{setDone(true);onComplete();}} className="btn-orange" style={{padding:14,fontSize:15,width:"100%"}}>✅ Theory Padh Li — Done!</button>
      ):<div style={{textAlign:"center",color:"#4CAF50",fontWeight:600,padding:12}}>✅ Theory Complete!</div>}
    </div>
  );
};

/* ── Practice Tab ─────────────────────────────────────────── */
const PracticeTab = ({ dayId, content, onComplete }) => {
  const [done,setDone]=useState(false);
  const handle=(score)=>{setDone(true);onComplete(score);};
  if(done) return <div style={{textAlign:"center",padding:40,color:"#4CAF50",fontWeight:700,fontSize:18}}>✅ Practice Complete!</div>;
  const t=content.practice?.type;
  return(
    <div>
      {t==="docs-organizer"&&<DocsOrganizer onComplete={handle}/>}
      {t==="blinkit-sim"&&<BlinkitSim onComplete={handle}/>}
      {t==="zomato-sim"&&<ZomatoSim onComplete={handle}/>}
      {t==="amazon-sim"&&<AmazonSim onComplete={handle}/>}
      {t==="shadowfax-sim"&&<ShadowfaxSim onComplete={handle}/>}
      {t==="rapido-sim"&&<RapidoSim onComplete={handle}/>}
      {t==="strategy-planner"&&<StrategyPlanner onComplete={handle}/>}
      {t==="script-practice"&&<ScriptPractice onComplete={handle}/>}
      {t==="problem-solver"&&<ProblemSolver onComplete={handle}/>}
      {t==="final-quiz"&&<FinalQuiz onComplete={handle}/>}
    </div>
  );
};

/* ── Workbook Tab ─────────────────────────────────────────── */
const WorkbookTab = ({ dayId, content, tabProgress, onComplete }) => {
  const [checks,setChecks]=useState(content.items.map(()=>false));
  const [quizStep,setQuizStep]=useState(null);
  const [quizSel,setQuizSel]=useState(null);
  const [quizScore,setQuizScore]=useState(0);
  const [quizDone,setQuizDone]=useState(false);
  const allChecked=checks.every(Boolean);
  const quiz=CONTENT[dayId]?.quiz||[];
  const toggle=i=>setChecks(c=>{const n=[...c];n[i]=!n[i];return n;});
  return(
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <div style={{background:"rgba(255,255,255,0.04)",borderRadius:14,padding:18}}>
        <div style={{fontFamily:"'Baloo 2'",fontWeight:700,color:"#FF6B00",fontSize:15,marginBottom:4}}>{content.title}</div>
        <div style={{color:"#777",fontSize:12,marginBottom:12}}>{checks.filter(Boolean).length}/{content.items.length} complete</div>
        <ProgressBar value={checks.filter(Boolean).length} max={content.items.length}/>
        <div style={{display:"flex",flexDirection:"column",gap:0,marginTop:14}}>
          {content.items.map((item,i)=>(
            <div key={i} onClick={()=>toggle(i)} style={{display:"flex",gap:10,alignItems:"flex-start",cursor:"pointer",padding:"9px 0",borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
              <div style={{width:20,height:20,borderRadius:6,border:`2px solid ${checks[i]?"#4CAF50":"#444"}`,background:checks[i]?"#4CAF50":"transparent",display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontSize:12,flexShrink:0,marginTop:1,transition:"all 0.2s"}}>{checks[i]&&"✓"}</div>
              <span style={{color:checks[i]?"#777":"#ddd",fontSize:13,textDecoration:checks[i]?"line-through":"none",lineHeight:1.5}}>{item}</span>
            </div>
          ))}
        </div>
      </div>
      {allChecked&&quiz.length>0&&!quizDone&&(
        <div style={{background:"rgba(255,107,0,0.07)",border:"1px solid rgba(255,107,0,0.25)",borderRadius:14,padding:18}}>
          <div style={{fontFamily:"'Baloo 2'",fontWeight:700,color:"#FF6B00",marginBottom:4}}>📝 Day Quiz</div>
          {quizStep===null?(
            <button onClick={()=>setQuizStep(0)} className="btn-orange" style={{padding:"10px 22px",fontSize:13}}>Quiz Shuru Karo →</button>
          ):(
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              <div style={{color:"white",fontWeight:600,fontSize:14}}>{quizStep+1}. {quiz[quizStep].q}</div>
              {quiz[quizStep].opts.map((o,i)=>(
                <button key={i} onClick={()=>{if(quizSel===null)setQuizSel(i);}}
                  style={{padding:"9px 12px",borderRadius:10,border:"1px solid",textAlign:"left",cursor:"pointer",fontSize:13,
                    background:quizSel!==null?(i===quiz[quizStep].ans?"rgba(76,175,80,0.15)":i===quizSel?"rgba(229,57,53,0.15)":"rgba(255,255,255,0.03)"):"rgba(255,255,255,0.05)",
                    borderColor:quizSel!==null?(i===quiz[quizStep].ans?"#4CAF50":i===quizSel?"#E53935":"rgba(255,255,255,0.08)"):"rgba(255,255,255,0.14)",
                    color:quizSel!==null?(i===quiz[quizStep].ans?"#4CAF50":i===quizSel?"#FF8A80":"#bbb"):"#ddd"}}>{o}</button>
              ))}
              {quizSel!==null&&(
                <button onClick={()=>{
                  const ns=quizSel===quiz[quizStep].ans?quizScore+1:quizScore;
                  if(quizStep<quiz.length-1){setQuizStep(quizStep+1);setQuizSel(null);setQuizScore(ns);}
                  else{setQuizDone(true);setQuizScore(ns);onComplete(ns);}
                }} className="btn-orange" style={{padding:"10px 20px",fontSize:13}}>{quizStep<quiz.length-1?"Next →":"Finish!"}</button>
              )}
            </div>
          )}
        </div>
      )}
      {quizDone&&<div style={{textAlign:"center",background:"rgba(76,175,80,0.1)",border:"1px solid #4CAF50",borderRadius:14,padding:20}}>
        <div style={{fontSize:36}}>🎉</div>
        <div style={{color:"#4CAF50",fontWeight:700,fontSize:17,marginTop:6}}>Day {dayId} Complete!</div>
        <div style={{color:"#888",fontSize:13,marginTop:4}}>Quiz Score: {quizScore}/{quiz.length}</div>
      </div>}
      {allChecked&&quiz.length===0&&!quizDone&&<button onClick={()=>onComplete(0)} className="btn-orange" style={{padding:14,fontSize:15,width:"100%"}}>✅ Day Complete!</button>}
    </div>
  );
};

/* ── Certificate ──────────────────────────────────────────── */
const Certificate = ({ user, onClose }) => (
  <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={onClose}>
    <div className="popIn" onClick={e=>e.stopPropagation()} style={{background:"linear-gradient(135deg,#0D1829,#1A1A3A)",border:"2px solid #FFD700",borderRadius:24,padding:36,maxWidth:460,width:"100%",textAlign:"center"}}>
      <div style={{fontSize:64}}>🏆</div>
      <div style={{fontFamily:"'Baloo 2'",fontWeight:800,fontSize:26,color:"#FFD700",marginTop:10}}>CERTIFICATE</div>
      <div style={{color:"#888",fontSize:13}}>OF COMPLETION</div>
      <div style={{margin:"20px 0",padding:"18px 0",borderTop:"1px solid rgba(255,215,0,0.25)",borderBottom:"1px solid rgba(255,215,0,0.25)"}}>
        <div style={{color:"#999",fontSize:13}}>Yeh certify kiya jaata hai ki</div>
        <div style={{fontFamily:"'Baloo 2'",fontWeight:700,fontSize:22,color:"white",margin:"6px 0"}}>{user.name || user.email}</div>
        <div style={{color:"#999",fontSize:13}}>ne safaltapurvak poora kiya</div>
        <div style={{fontWeight:700,color:"#FF6B00",fontSize:15,marginTop:6}}>India Delivery Partner Master Course</div>
        <div style={{color:"#777",fontSize:12,marginTop:4}}>15+ Apps • 10 Days • Complete Training</div>
      </div>
      <div style={{display:"flex",flexWrap:"wrap",gap:6,justifyContent:"center",marginBottom:20}}>
        {["Blinkit","Zepto","Zomato","Swiggy","Amazon","Shadowfax","Rapido","Porter"].map(a=>(
          <span key={a} style={{background:"rgba(255,107,0,0.15)",color:"#FF9550",border:"1px solid rgba(255,107,0,0.3)",padding:"3px 10px",borderRadius:20,fontSize:11}}>{a}</span>
        ))}
      </div>
      <button onClick={onClose} className="shimmer-bg" style={{padding:"12px 32px",borderRadius:12,fontWeight:700,fontSize:15,color:"white",border:"none",cursor:"pointer"}}>Close</button>
    </div>
  </div>
);

/* ── Day View ─────────────────────────────────────────────── */
const DayView = ({ dayId, dayProgress, onUpdateTab, onBack }) => {
  const { user } = useAuth();
  const [activeTab,setActiveTab]=useState("video");
  const [showCert,setShowCert]=useState(false);
  const meta=DAYS_META[dayId-1];
  const content=CONTENT[dayId];
  const p=dayProgress||{};
  const completedTabs=TABS.map(t=>t.id).filter(id=>p[id]).length;

  const handleTabComplete=useCallback(async(tab,score=0)=>{
    if(p[tab]) return;
    await dbSaveTabProgress(user.id||user.email, dayId, tab);
    const updated={...p,[tab]:true};
    const allTabsDone=["video","audio","theory","practice","workbook"].every(t=>updated[t]);
    if(allTabsDone&&!p.completed){
      await dbSaveDayComplete(user.id||user.email, dayId, score);
      updated.completed=true;
      if(dayId===10){await dbSaveCertificate(user.id||user.email, score);setShowCert(true);}
    }
    onUpdateTab(dayId, updated);
  },[p, dayId, user]);

  return(
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",background:"#0A0A14"}}>
      {showCert&&<Certificate user={user} onClose={()=>setShowCert(false)}/>}
      {/* Header */}
      <div style={{background:`linear-gradient(135deg,${meta.color}cc,#0A0A14)`,padding:"14px 18px",display:"flex",alignItems:"center",gap:10,borderBottom:"1px solid rgba(255,255,255,0.07)"}}>
        <button onClick={onBack} className="btn-ghost" style={{width:36,height:36,borderRadius:10,padding:0,fontSize:18,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>←</button>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontFamily:"'Baloo 2'",fontWeight:700,fontSize:16,color:"white",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>Day {dayId}: {meta.title}</div>
          <div style={{color:"rgba(255,255,255,0.5)",fontSize:12}}>{meta.sub}</div>
        </div>
        <div style={{textAlign:"right",flexShrink:0}}>
          <div style={{color:"white",fontWeight:700}}>{completedTabs}/5</div>
          <div style={{color:"rgba(255,255,255,0.4)",fontSize:11}}>done</div>
        </div>
      </div>
      <div style={{height:4,background:"rgba(255,255,255,0.06)"}}><div style={{height:"100%",background:meta.color,width:`${(completedTabs/5)*100}%`,transition:"width 0.5s"}}/></div>
      {/* Tabs */}
      <div style={{display:"flex",background:"rgba(0,0,0,0.3)",borderBottom:"1px solid rgba(255,255,255,0.06)",overflowX:"auto"}}>
        {TABS.map(tab=>(
          <button key={tab.id} onClick={()=>setActiveTab(tab.id)}
            className={`tab-btn ${activeTab===tab.id?"active":""}`}
            style={{flex:1,position:"relative",fontFamily:"'Noto Sans'"}}>
            {tab.label}
            {p[tab.id]&&<span style={{position:"absolute",top:7,right:7,width:7,height:7,borderRadius:"50%",background:"#4CAF50"}}/>}
          </button>
        ))}
      </div>
      {/* Content */}
      <div style={{flex:1,overflowY:"auto",padding:18,maxWidth:640,width:"100%",margin:"0 auto"}}>
        <div className="fadeUp" key={activeTab}>
          {activeTab==="video"&&<VideoTab dayId={dayId} content={content.video} onComplete={()=>handleTabComplete("video")}/>}
          {activeTab==="audio"&&<AudioTab dayId={dayId} content={content.audio} onComplete={()=>handleTabComplete("audio")}/>}
          {activeTab==="theory"&&<TheoryTab content={content.theory} onComplete={()=>handleTabComplete("theory")}/>}
          {activeTab==="practice"&&<PracticeTab dayId={dayId} content={content} onComplete={(s)=>handleTabComplete("practice",s)}/>}
          {activeTab==="workbook"&&<WorkbookTab dayId={dayId} content={content.workbook} tabProgress={p} onComplete={(s)=>handleTabComplete("workbook",s)}/>}
        </div>
      </div>
    </div>
  );
};

/* ── Dashboard ────────────────────────────────────────────── */
const Dashboard = ({ progress, onSelectDay }) => {
  const { user, logout } = useAuth();
  const isUnlocked=id=>{
    if(id===1) return true;
    return progress[id-1]?.completed===true;
  };
  const totalCompleted=Object.values(progress).filter(p=>p?.completed).length;
  const totalTabs=Object.values(progress).reduce((s,p)=>s+["video","audio","theory","practice","workbook"].filter(t=>p?.[t]).length,0);

  return(
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",background:"#0A0A14"}}>
      {/* Header */}
      <div style={{background:"linear-gradient(180deg,#111126,#0A0A14)",padding:"18px 18px 14px",borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
        <div style={{maxWidth:720,margin:"0 auto"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
            <div>
              <div style={{fontFamily:"'Baloo 2'",fontWeight:800,fontSize:22,color:"#FF6B00"}}>🛵 Delivery LMS</div>
              <div style={{color:"#888",fontSize:13,marginTop:2}}>Namaste, <span style={{color:"white",fontWeight:600}}>{user.name||user.email}</span>!</div>
            </div>
            <button onClick={logout} className="btn-ghost" style={{padding:"6px 14px",fontSize:12}}>Logout</button>
          </div>
          {/* Stats */}
          <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:14,padding:14}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
              <span style={{color:"#888",fontSize:12}}>Overall Progress</span>
              <span style={{color:"#FF6B00",fontWeight:700,fontSize:13}}>{totalCompleted}/10 Days</span>
            </div>
            <ProgressBar value={totalCompleted} max={10}/>
            <div style={{display:"flex",gap:20,marginTop:12}}>
              {[["Days","#FF6B00",totalCompleted],["Tabs","#4CAF50",totalTabs],["Left","#2196F3",10-totalCompleted]].map(([l,c,v])=>(
                <div key={l}>
                  <div style={{color:c,fontWeight:700,fontSize:18}}>{v}</div>
                  <div style={{color:"#777",fontSize:11}}>{l}</div>
                </div>
              ))}
              {totalCompleted>=5&&<span style={{display:"inline-flex",alignItems:"center",gap:4,background:"rgba(156,39,176,0.15)",color:"#CE93D8",border:"1px solid rgba(156,39,176,0.3)",borderRadius:20,padding:"2px 10px",fontSize:11,fontWeight:600,alignSelf:"center"}}>🌟 Halfway!</span>}
              {totalCompleted===10&&<span style={{display:"inline-flex",alignItems:"center",background:"rgba(255,215,0,0.15)",color:"#FFD700",border:"1px solid rgba(255,215,0,0.3)",borderRadius:20,padding:"2px 10px",fontSize:11,fontWeight:600,alignSelf:"center"}}>🏆 Certified!</span>}
            </div>
          </div>
        </div>
      </div>
      {/* Day grid */}
      <div style={{flex:1,overflowY:"auto",padding:18,maxWidth:720,width:"100%",margin:"0 auto"}}>
        <div style={{fontFamily:"'Baloo 2'",fontWeight:700,color:"white",fontSize:17,marginBottom:14}}>📅 10-Day Journey</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(290px,1fr))",gap:12}}>
          {DAYS_META.map(day=>{
            const unlocked=isUnlocked(day.id);
            const dp=progress[day.id]||{};
            const tabs=["video","audio","theory","practice","workbook"].filter(t=>dp[t]).length;
            const completed=dp.completed;
            return(
              <div key={day.id} onClick={()=>unlocked&&onSelectDay(day.id)}
                className={unlocked?"card card-hover":"card"}
                style={{border:`1px solid ${completed?"#4CAF5066":unlocked?`${day.color}55`:"rgba(255,255,255,0.04)"}`,opacity:unlocked?1:0.45,position:"relative",overflow:"hidden",padding:16}}>
                {!unlocked&&<div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.45)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",zIndex:2}}><div style={{fontSize:24}}>🔒</div><div style={{color:"#666",fontSize:11,marginTop:4}}>Day {day.id-1} karo pehle</div></div>}
                <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
                  <div style={{width:42,height:42,borderRadius:12,background:`${day.color}2a`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{day.icon}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:6}}>
                      <span style={{color:"#666",fontSize:11}}>Day {day.id}</span>
                      {completed&&<span style={{display:"inline-block",background:"rgba(76,175,80,0.15)",color:"#4CAF50",border:"1px solid rgba(76,175,80,0.3)",borderRadius:20,padding:"2px 8px",fontSize:11,fontWeight:600}}>✅ Done</span>}
                      {!completed&&unlocked&&tabs===0&&<span style={{display:"inline-block",background:`${day.color}22`,color:day.color,border:`1px solid ${day.color}44`,borderRadius:20,padding:"2px 8px",fontSize:11,fontWeight:600}}>Start →</span>}
                      {!completed&&unlocked&&tabs>0&&<span style={{display:"inline-block",background:`${day.color}22`,color:day.color,border:`1px solid ${day.color}44`,borderRadius:20,padding:"2px 8px",fontSize:11,fontWeight:600}}>{tabs}/5</span>}
                    </div>
                    <div style={{fontFamily:"'Baloo 2'",fontWeight:700,color:"white",fontSize:15,marginTop:2}}>{day.title}</div>
                    <div style={{color:"#666",fontSize:11,marginTop:2}}>{day.sub}</div>
                    {unlocked&&tabs>0&&<div style={{marginTop:8}}><ProgressBar value={tabs} max={5} color={day.color} height={4}/></div>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {/* Apps banner */}
        <div style={{marginTop:20,background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:14,padding:14}}>
          <div style={{color:"#666",fontSize:12,textAlign:"center",marginBottom:10}}>📱 Covered apps:</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:6,justifyContent:"center"}}>
            {["🟡 Blinkit","🟣 Zepto","🟠 Instamart","🔴 Zomato","🟠 Swiggy","🔵 Amazon","📦 Flipkart","⚫ Shadowfax","🚚 Delhivery","🔷 DTDC","🏍️ Rapido","🚛 Porter","🛍️ Myntra","📋 Shiprocket"].map(a=>(
              <span key={a} style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",color:"#888",padding:"4px 10px",borderRadius:20,fontSize:11}}>{a}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── Login / Signup Screen ────────────────────────────────── */
const LoginScreen = () => {
  const { login } = useAuth();
  const [mode,setMode]=useState("login");
  const [name,setName]=useState("");
  const [email,setEmail]=useState("");
  const [pass,setPass]=useState("");
  const [err,setErr]=useState("");
  const [loading,setLoading]=useState(false);
  const [sbReady,setSbReady]=useState(false);

  useEffect(()=>{ initSupabase().then(ok=>setSbReady(ok)); },[]);

  const handle=async()=>{
    setErr("");
    if(!email.trim()||!pass){setErr("Email aur password zaroori hai");return;}
    if(mode==="signup"&&!name.trim()){setErr("Apna naam daalo");return;}
    setLoading(true);
    try {
      if(!supabaseReady){
        // localStorage mode
        const stored=LS.get(`user_${email}`);
        if(mode==="login"){
          if(!stored||stored.pass!==pass){setErr("Email ya password galat hai");setLoading(false);return;}
          login({id:email,email,name:stored.name});
        } else {
          if(stored){setErr("Ye email already registered hai");setLoading(false);return;}
          LS.set(`user_${email}`,{pass,name});
          login({id:email,email,name});
        }
      } else {
        if(mode==="login"){
          const{data,error}=await supabase.auth.signInWithPassword({email,password:pass});
          if(error){setErr(error.message);setLoading(false);return;}
          const{data:prof}=await supabase.from("profiles").select("name").eq("id",data.user.id).single();
          login({id:data.user.id,email,name:prof?.name||email});
        } else {
          const{data,error}=await supabase.auth.signUp({email,password:pass,options:{data:{name}}});
          if(error){setErr(error.message);setLoading(false);return;}
          login({id:data.user.id,email,name});
        }
      }
    } catch(e){setErr("Kuch gadbad hui — dobara try karo");}
    setLoading(false);
  };

  return(
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:20,background:"radial-gradient(ellipse at 20% 50%,#1a1435,#0A0A14 60%)"}}>
      <div style={{position:"fixed",top:"8%",right:"6%",fontSize:60,opacity:0.07,transform:"rotate(12deg)"}}>🛵</div>
      <div style={{position:"fixed",bottom:"12%",left:"4%",fontSize:44,opacity:0.05,transform:"rotate(-8deg)"}}>📦</div>
      <div className="fadeUp" style={{width:"100%",maxWidth:400}}>
        {/* Logo */}
        <div style={{textAlign:"center",marginBottom:36}}>
          <div style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:72,height:72,borderRadius:20,background:"linear-gradient(135deg,#FF6B00,#FF9500)",fontSize:36,marginBottom:14,boxShadow:"0 16px 36px rgba(255,107,0,0.4)"}}>🛵</div>
          <div style={{fontFamily:"'Baloo 2'",fontWeight:800,fontSize:26,color:"white"}}>Delivery LMS</div>
          <div style={{color:"rgba(255,255,255,0.4)",fontSize:13,marginTop:3}}>India's #1 Delivery Training Platform</div>
          {!sbReady&&<div style={{marginTop:8,fontSize:11,color:"#FF9500",background:"rgba(255,149,0,0.1)",border:"1px solid rgba(255,149,0,0.25)",borderRadius:8,padding:"4px 12px",display:"inline-block"}}>⚡ Demo Mode (localStorage)</div>}
        </div>
        {/* Card */}
        <div className="glass" style={{borderRadius:22,padding:30}}>
          {/* Toggle */}
          <div style={{display:"flex",background:"rgba(255,255,255,0.06)",borderRadius:12,padding:4,marginBottom:24}}>
            {["login","signup"].map(m=>(
              <button key={m} onClick={()=>{setMode(m);setErr("");}} style={{flex:1,padding:"8px 0",borderRadius:9,border:"none",fontSize:14,fontWeight:600,transition:"all 0.2s",
                background:mode===m?"#FF6B00":"transparent",color:mode===m?"white":"#888"}}>
                {m==="login"?"Login":"Register"}
              </button>
            ))}
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            {mode==="signup"&&(
              <div>
                <label style={{color:"rgba(255,255,255,0.6)",fontSize:12,marginBottom:5,display:"block"}}>Aapka Naam</label>
                <input type="text" value={name} onChange={e=>setName(e.target.value)} placeholder="Jaise: Rahul Kumar"/>
              </div>
            )}
            <div>
              <label style={{color:"rgba(255,255,255,0.6)",fontSize:12,marginBottom:5,display:"block"}}>Email Address</label>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handle()} placeholder="aap@gmail.com"/>
            </div>
            <div>
              <label style={{color:"rgba(255,255,255,0.6)",fontSize:12,marginBottom:5,display:"block"}}>Password</label>
              <input type="password" value={pass} onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handle()} placeholder="••••••••"/>
            </div>
            {err&&<div style={{color:"#FF8A80",fontSize:12,background:"rgba(229,57,53,0.1)",padding:"8px 12px",borderRadius:8}}>{err}</div>}
            <button onClick={handle} disabled={loading} className="btn-orange shimmer-bg" style={{padding:14,fontSize:15,width:"100%",borderRadius:12,opacity:loading?0.7:1}}>
              {loading?<span style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8}}><Spinner/> Please wait...</span>:mode==="login"?"🚀 Login Karo":"🎓 Register Karo"}
            </button>
          </div>
          {/* Features */}
          <div style={{marginTop:22,paddingTop:18,borderTop:"1px solid rgba(255,255,255,0.07)"}}>
            <div style={{color:"rgba(255,255,255,0.35)",fontSize:11,marginBottom:8}}>Is course mein milega:</div>
            {["📱 15+ App Simulators (Blinkit, Zomato, Amazon...)","🎬 Daily video + 🎧 audio guides","✅ Checklists + 📝 quizzes","☁️ Progress cloud mein save (Supabase)","🏆 Completion certificate"].map(f=>(
              <div key={f} style={{color:"rgba(255,255,255,0.6)",fontSize:12,marginBottom:5}}>{f}</div>
            ))}
          </div>
        </div>
        <div style={{textAlign:"center",marginTop:14,color:"rgba(255,255,255,0.2)",fontSize:11}}>Free course • Progress saved • Start instantly</div>
      </div>
    </div>
  );
};

/* ── Root App ─────────────────────────────────────────────── */
export default function App() {
  const [user,setUser]=useState(null);
  const [screen,setScreen]=useState("login");
  const [selectedDay,setSelectedDay]=useState(null);
  const [progress,setProgress]=useState({});
  const [loadingProgress,setLoadingProgress]=useState(false);

  // Init empty progress
  const emptyProgress=()=>{
    const p={};
    for(let i=1;i<=10;i++) p[i]={video:false,audio:false,theory:false,practice:false,workbook:false,completed:false};
    return p;
  };

  const login=useCallback(async(u)=>{
    setUser(u);setLoadingProgress(true);
    const prog=await dbGetProgress(u.id||u.email);
    const full={...emptyProgress(),...prog};
    setProgress(full);
    setLoadingProgress(false);
    setScreen("dashboard");
  },[]);

  const logout=useCallback(()=>{
    if(supabaseReady) supabase.auth.signOut();
    setUser(null);setProgress({});setScreen("login");setSelectedDay(null);
  },[]);

  const updateTab=useCallback((dayId,updated)=>{
    setProgress(p=>({...p,[dayId]:updated}));
  },[]);

  // Check existing session on mount
  useEffect(()=>{
    initSupabase().then(async(ok)=>{
      if(ok){
        const{data:{session}}=await supabase.auth.getSession();
        if(session?.user){
          const{data:prof}=await supabase.from("profiles").select("name").eq("id",session.user.id).single();
          login({id:session.user.id,email:session.user.email,name:prof?.name||session.user.email});
        }
      }
    });
  },[]);

  return(
    <AuthCtx.Provider value={{user,login,logout}}>
      <FontStyle/>
      {screen==="login"&&<LoginScreen/>}
      {screen==="dashboard"&&!loadingProgress&&(
        <Dashboard progress={progress} onSelectDay={id=>{setSelectedDay(id);setScreen("day");}}/>
      )}
      {screen==="dashboard"&&loadingProgress&&(
        <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:16,background:"#0A0A14"}}>
          <Spinner/><div style={{color:"#888"}}>Progress load ho raha hai...</div>
        </div>
      )}
      {screen==="day"&&selectedDay&&(
        <DayView dayId={selectedDay} dayProgress={progress[selectedDay]} onUpdateTab={updateTab} onBack={()=>{setSelectedDay(null);setScreen("dashboard");}}/>
      )}
    </AuthCtx.Provider>
  );
}
