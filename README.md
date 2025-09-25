# DebtWise AI - 智慧債務管理

## Vercel 部署指引

1. **安裝專案**
   - Repository 指向本專案，Build Command 使用 `pnpm build`，Output Directory 維持 `.next`（預設值）。
   - 若使用 Monorepo，請設定 Root Directory 為 `v0-debt-management-app`。

2. **設定環境變數**（Preview 與 Production 都需設定）
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://jgtuigwywejqvxclbzix.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpndHVpZ3d5d2VqcXZ4Y2xieml4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3NDU3MDUsImV4cCI6MjA3NDMyMTcwNX0.5KVsJCKPgm3dv_Mvn76NNItvsER7FIxIYPKfsx07NLA
   ```
   - 與 Supabase 後端相同，請於 Vercel 專案的 **Settings → Environment Variables** 新增，並選擇要套用的環境（Preview、Production）。

3. **重新部署**
   - 儲存環境變數後重新部署即可完成連線。
   - 如需變更 Supabase 專案金鑰，請同步更新環境變數並重新部署。

> 如需在本機驗證，請在根目錄建立 `.env.local`，內容與上方環境變數相同，之後執行 `pnpm dev` 或 `pnpm build`。
