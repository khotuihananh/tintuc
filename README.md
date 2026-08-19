# Giá vàng · Giá BTC · Giá xăng dầu

Web app mobile-first, xây bằng Next.js App Router + TypeScript + Tailwind CSS.
Ba tab: giá vàng trong nước (kèm biểu đồ lịch sử), giá Bitcoin realtime, giá xăng dầu trong nước.

## Chạy thử

```bash
npm install
npm run dev
```

Mở http://localhost:3000 (thu nhỏ trình duyệt xuống khổ điện thoại, hoặc mở trên di động, để đúng trải nghiệm mobile-first).

## Cấu trúc

```
app/
  page.tsx          # "/" — chuyển hướng thẳng sang /gold
  gold/page.tsx      # Giá vàng trong nước + biểu đồ 30 ngày
  btc/page.tsx        # Giá Bitcoin realtime
  fuel/page.tsx        # Giá xăng dầu trong nước
  api/gold/route.ts     # Route server-side gọi vang.today (tránh CORS)
components/
  TabBar.tsx          # Thanh điều hướng dưới cùng, dính sát đáy
  Sparkline.tsx         # Biểu đồ đường SVG dùng chung (BTC + vàng)
lib/
  gold.ts             # Client gọi /api/gold
  btc.ts               # Client gọi CoinGecko
  fuel.ts               # Client đọc dữ liệu xăng dầu từ GitHub (toanqng/fuel)
```

## Nguồn dữ liệu

- **Vàng**: vang.today (bên thứ ba, miễn phí, không cần key) — gọi qua route server-side trong `app/api/gold/route.ts` để tránh vấn đề CORS.
- **Bitcoin**: CoinGecko (API công khai, miễn phí).
- **Xăng dầu**: dataset JSON cập nhật theo kỳ điều hành, lưu trên GitHub (`toanqng/fuel`), khớp với giá công bố chính thức của Petrolimex.

Không nguồn nào là API chính thức từ nhà nước/doanh nghiệp — đều là các nguồn công khai, miễn phí, tốt nhất hiện có mà không cần đăng ký key.
