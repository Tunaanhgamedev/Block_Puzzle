# 🟦 NEON GRID: BLOCK PUZZLE 🟩

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](#)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue.svg)](https://www.typescriptlang.org/)
[![PixiJS](https://img.shields.io/badge/PixiJS-8.1-orange.svg)](https://pixijs.com/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](#)
[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen.svg)](https://tunaanhgamedev.github.io/Block_Puzzle/)

**Neon Grid** là trò chơi xếp gạch cổ điển (Block Puzzle) được tái hiện dưới phong cách đồ họa Neon Cyberpunk hiện đại, đi kèm hiệu ứng hạt (particles) sống động, âm thanh retro cuốn hút và nhiều chế độ chơi đột phá. Trò chơi chạy hoàn toàn trên trình duyệt, tối ưu hóa cả trên điện thoại di động và máy tính.

👉 **Chơi ngay tại đây:** [https://tunaanhgamedev.github.io/Block_Puzzle/](https://tunaanhgamedev.github.io/Block_Puzzle/)

---

## ✨ Tính Năng Nổi Bật

### 1. Đa Dạng Chế Độ Chơi (Game Modes)
* 🏆 **Cổ Điển (Classic):** Xếp gạch vô tận, cố gắng đạt điểm số cao nhất có thể.
* ⏳ **Đấu Thời Gian (Time Attack):** Chạy đua với thời gian, mỗi đường gạch bị phá hủy sẽ giúp bạn cộng thêm giây.
* 🎯 **Thử Thách (Challenge):** Vượt qua màn chơi với giới hạn số lượt đi cho trước.
* 💀 **Cực Hạn (Limit):** Lưới cờ sẽ xuất hiện ngẫu nhiên các chướng ngại vật (obstacle blocks) cố định không thể phá hủy, đòi hỏi tư duy logic cao.

### 2. Hệ Thống Kỹ Năng Bổ Trợ Đột Phá
* ⚡ **Búa Neon (Neon Hammer):** Đập vỡ một ô gạch bất kỳ đang cản trở bạn trên lưới.
* 🔄 **Xoay Gạch (Rotate):** Xoay khối gạch trước khi đặt. Hỗ trợ tính năng **Rotate-and-Drag** thông minh (nhấp để xoay thoải mái, giữ kéo để đặt thẳng vào lưới giúp tự động tắt chế độ xoay cực kỳ mượt mà).
* 🔀 **Đổi Lại (Shuffle/Swap):** Đổi ngẫu nhiên 3 khối gạch mới ở khay chờ.
* ⏪ **Hoàn Tác (Undo):** Quay trở lại lượt đi trước đó để sửa chữa sai lầm.

### 3. Cửa Hàng & Nhiệm Vụ (Store & Quests)
* 💎 **Cửa Hàng Neon:** Sử dụng Đá Quý (Gems) tích lũy được trong lúc chơi để mua thêm lượt sử dụng các Kỹ năng bổ trợ.
* 📜 **Nhiệm Vụ & Thành Tựu:** Hệ thống nhiệm vụ hàng ngày và các cột mốc thành tựu giúp người chơi nhận thêm nhiều Đá Quý miễn phí.
* 💾 **Lưu Trữ Tự Động (Offline Save):** Tự động lưu trữ điểm số cao nhất, đá quý và lượt kỹ năng thông qua `localStorage` của trình duyệt, hỗ trợ chơi ngoại tuyến 100%.

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

* **Core Engine:** [Pixi.js v8](https://pixijs.com/) - Engine kết xuất đồ họa WebGL/WebGPU 2D hiệu năng cao cực mạnh.
* **Ngôn ngữ:** [TypeScript](https://www.typescriptlang.org/) - Đảm bảo cấu trúc code chặt chẽ, an toàn kiểu dữ liệu.
* **Quản lý trạng thái (State Management):** [Zustand](https://github.com/pmndrs/zustand) - Trọng lượng nhẹ, quản lý trạng thái tập trung cho game.
* **Hiệu ứng chuyển động:** [GSAP (GreenSock)](https://greensock.com/gsap/) - Tạo các hiệu ứng nảy gạch, popup và chuyển cảnh mượt mà.
* **Quản lý âm thanh:** [Howler.js](https://howlerjs.com/) - Xử lý âm thanh nền và hiệu ứng tương tác chất lượng cao.
* **Build Tool:** [Vite](https://vitejs.dev/) - Môi trường phát triển cực nhanh và tối ưu hóa file tĩnh khi xuất bản.

---

## 📂 Cấu Trúc Thư Mục Dự Án

```text
Block_Puzzle/
├── assets/             # Âm thanh, âm nhạc hiệu ứng
├── src/
│   ├── core/           # Quản lý vòng đời cảnh game (SceneManager, Scene)
│   ├── scenes/         # Các cảnh chính (MenuScene, GameScene)
│   ├── ui/             # Giao diện HUD, Popups (Shop, Quests, Leaderboard, HowToPlay)
│   ├── systems/        # Logic lõi (StateStore, GridSystem, SaveSystem, SoundManager...)
│   ├── effects/        # Hệ thống sinh hạt và hiệu ứng thị giác (ParticleManager)
│   ├── index.css       # Style cơ bản cho ứng dụng
│   └── main.ts         # Điểm khởi chạy game (Bootstrap)
├── index.html          # File HTML gốc
├── vite.config.ts      # Cấu hình đóng gói dự án Vite
└── tsconfig.json       # Cấu hình TypeScript compiler
```

---

## 🚀 Hướng Dẫn Cài Đặt & Phát Triển Dưới Local

### Yêu cầu hệ thống
* Cần cài đặt sẵn [Node.js](https://nodejs.org/) (Khuyên dùng bản LTS từ v18 trở lên).

### Các bước khởi chạy:

1. **Clone dự án về máy:**
   ```bash
   git clone https://github.com/Tunaanhgamedev/Block_Puzzle.git
   cd Block_Puzzle
   ```

2. **Cài đặt các thư viện phụ thuộc:**
   ```bash
   npm install
   ```

3. **Khởi chạy môi trường phát triển (Local Server):**
   ```bash
   npm run dev
   ```
   * Mở trình duyệt và truy cập: `http://localhost:3000`

4. **Chia sẻ chạy thử trên Điện thoại (cùng mạng Wi-Fi):**
   ```bash
   npm run dev -- --host
   ```
   * Truy cập địa chỉ IP Network dạng `http://192.168.x.x:3000` trên điện thoại của bạn.

---

## 📦 Đóng Gói & Triển Khai (Deployment)

### Biên dịch dự án (Build Production)
```bash
npm run build
```
* Lệnh này sẽ tối ưu hóa toàn bộ mã nguồn và tài nguyên, xuất bản vào thư mục `/dist`.

### Triển khai lên GitHub Pages
Dự án đã cấu hình tự động triển khai bằng thư viện `gh-pages`. Bạn chỉ cần gõ lệnh sau để cập nhật phiên bản web online:
```bash
npm run deploy
```

---

## 📄 Giấy phép (License)

Dự án này được phân phối dưới giấy phép **MIT License**. Xem chi tiết tại tệp `LICENSE` (nếu có).