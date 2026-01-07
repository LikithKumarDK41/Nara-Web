# 🏙️ GOSE City Tour  
### Next.js + Geolocation-Based City Tour Application

This project powers the **GOSE City Tour** experience, providing real‑time navigation, geofencing, stamping, and tour guidance using the browser’s Geolocation API.

---

# 🚀 Project Setup

## 📦 Package Manager  
This project uses **pnpm**.

Install pnpm globally (if not installed):

```sh
npm install -g pnpm
```

---

## ▶️ Run Development Server
```sh
pnpm dev
```

## 🏗️ Build Project
```sh
pnpm build
```

## 🚀 Start Production Server
```sh
pnpm start
```

## 🔍 Lint Code
```sh
pnpm lint
```

---

# 🧰 Node Version

This project requires:

```
Node.js v22.19.0
```

---

# 📍 Geolocation Accuracy: Mobile vs Desktop Web  
### Why Mobile Browsers Are Accurate but Desktop/Laptop Browsers Are Not

This application uses the **HTML5 Geolocation API** for location‑based features such as:

- Geofencing  
- Tourpoint detection  
- Check‑in / stamp triggers  
- Live tour navigation  

Although the API is identical across devices, accuracy varies greatly depending on hardware and browser constraints.

---

## 🟢 1. Mobile Browsers (Android / iOS)

Mobile devices include:

- ✔ GPS/GNSS hardware  
- ✔ Cell tower triangulation  
- ✔ Wi-Fi mapping  
- ✔ Sensors (accelerometer, gyroscope, compass)  
- ✔ Native OS location services  

### Mobile Accuracy Characteristics

| Attribute | Value |
|----------|--------|
| Accuracy | **5–20 meters** |
| Speed | **1–3 seconds** |
| Tracking | Smooth and stable |
| Reliability | High |

Mobile browsers usually achieve **true GPS accuracy**, making geofencing and stamping extremely reliable.

---

## 🔴 2. Desktop/Laptop Browsers

Laptops and desktops **do not have GPS chips**.  
Browsers must “guess” the user’s location using:

- Wi-Fi access point matching  
- IP address geolocation  
- Network databases  

### Desktop Accuracy Characteristics

| Attribute | Value |
|----------|--------|
| Accuracy | **30m – 1000m+** |
| Speed | **5–15 seconds** |
| Tracking | Weak / inconsistent |
| Sensor Support | None |

Even with:

```ts
enableHighAccuracy: true
```

browsers cannot provide GPS‑level results due to hardware limitations.

---

# ⚠️ 3. Desktop Browser Restrictions

| Limitation | Explanation |
|------------|-------------|
| ❌ **No GPS hardware** | Desktop browsers cannot access real GPS. |
| ❌ **Wi-Fi database may be outdated** | Causes inaccurate positioning. |
| ❌ **Ethernet connections lower accuracy** | Falls back to IP-based location. |
| ❌ **VPN/Corporate networks distort location** | Browser reports VPN exit location. |
| ❌ **Background throttling** | watchPosition slows down or freezes. |
| ❌ **No motion sensors** | Cannot refine accuracy or detect movement. |

---

# 🧭 4. Expected Behavior in GOSE City Tour

### ✔ Mobile Web  
- Accurate geofencing  
- Fast navigation  
- Reliable stamping  
- Smooth movement tracking  

### ⚠ Desktop Web  
- Location may jump  
- Slow initial fix  
- Poor movement tracking  
- Inconsistent geofence triggers  

This is **normal expected behavior** based on the hardware limitations of laptops.

---

# 🛠 5. Enhancements Implemented

The project includes several improvements for maximizing browser accuracy:

- Multi‑phase location retrieval  
- Fast‑path low‑latency lookup  
- Retry logic with exponential backoff  
- Last‑known‑location fallback  
- Permission state detection  
- Watcher reattachment after errors  

These optimizations help stabilize results but **cannot overcome desktop hardware constraints**.

