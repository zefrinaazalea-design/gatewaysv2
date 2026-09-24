export async function onRequest(context) {
  const { request, env, params } = context;
  const urlObj = new URL(request.url);
  const userAgent = request.headers.get("user-agent") || "";
  
  // Deteksi bot Meta / sosmed
  const botPatterns = /facebookexternalhit|Facebot|Twitterbot|LinkedInBot|WhatsApp|TelegramBot/i;

  if (botPatterns.test(userAgent)) {
    return env.ASSETS.fetch(request);
  }

  const pathArray = params.path;
  const slug = pathArray ? pathArray[0] : "";

  // JIKA USER MEMBUKA HALAMAN KHUSUS: /go/terbaru
  if (slug === "terbaru") {
    try {
      // Ambil 10 link/slug terbaru dari database D1 diurutkan dari yang paling baru
      const { results } = await env.DB.prepare(
        "SELECT slug, created_at FROM links ORDER BY id DESC LIMIT 10"
      ).all();

      let listItemsHtml = "";
      if (results && results.length > 0) {
        results.forEach((row, index) => {
          let nomor = index + 1;
          let targetUrl = `${urlObj.origin}/go/${row.slug}`;
          let tanggal = row.created_at ? row.created_at.replace("T", " ").substring(0, 16) : "Baru saja";
          
          listItemsHtml += `
            <a href="${targetUrl}" class="media-card-item">
              <div class="item-left">
                <div class="play-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                </div>
                <div>
                  <div class="item-title">Arsip Pembaruan #${nomor} (Slug: ${row.slug})</div>
                  <div class="item-subtitle">Dipublikasikan pada: ${tanggal}</div>
                </div>
              </div>
              <div class="item-action">
                <span>Buka</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
              </div>
            </a>
          `;
        });
      } else {
        listItemsHtml = `<div style="text-align: center; color: #94a3b8; padding: 20px;">Belum ada arsip pembaruan tersedia.</div>`;
      }

      const latestPageTemplate = `<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Daftar Update Arsip Terbaru - Portal Digital</title>
    <style>
        * { box-sizing: border-box; }
        body { font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f172a; color: #f8fafc; margin: 0; padding: 20px; line-height: 1.5; }
        .page-wrapper { max-width: 620px; margin: 40px auto 80px auto; background: #1e293b; border-radius: 16px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3); border: 1px solid #334155; overflow: hidden; }
        .hero-header { background: linear-gradient(135deg, #0284c7, #0369a1); padding: 30px 24px; text-align: center; color: #ffffff; }
        .hero-badge { display: inline-block; background: rgba(255, 255, 255, 0.15); backdrop-filter: blur(4px); font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 20px; text-transform: uppercase; margin-bottom: 12px; letter-spacing: 1px; }
        .hero-header h1 { font-size: 22px; font-weight: 700; margin: 0 0 8px 0; }
        .hero-header p { font-size: 13px; opacity: 0.9; margin: 0; }
        .content-body { padding: 24px; }
        .media-card-item { display: flex; justify-content: space-between; align-items: center; background: #0f172a; color: #f8fafc; padding: 14px 16px; margin-bottom: 10px; border-radius: 10px; text-decoration: none; border: 1px solid #334155; transition: all 0.2s ease; }
        .media-card-item:hover { border-color: #38bdf8; background: #131c31; transform: translateY(-1px); }
        .item-left { display: flex; align-items: center; gap: 14px; }
        .play-icon { width: 36px; height: 36px; background: rgba(56, 189, 248, 0.15); color: #38bdf8; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .item-title { font-size: 14px; font-weight: 600; color: #f1f5f9; }
        .item-subtitle { font-size: 11px; color: #94a3b8; margin-top: 2px; }
        .item-action { display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 600; color: #38bdf8; background: rgba(56, 189, 248, 0.1); padding: 6px 12px; border-radius: 6px; }
        .back-btn { display: block; text-align: center; background: #334155; color: #f8fafc; padding: 12px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; margin-top: 20px; transition: background 0.2s; }
        .back-btn:hover { background: #475569; }
        .footer-info { text-align: center; font-size: 11px; color: #64748b; margin-top: 24px; padding-top: 16px; border-top: 1px solid #334155; }
    </style>
</head>
<body>
    <div class="page-wrapper">
        <div class="hero-header">
            <div class="hero-badge">Pusat Direktori Publik</div>
            <h1>10 Arsip Update Terbaru</h1>
            <p>Daftar tautan pembaruan konten dan sesi media yang baru saja diterbitkan.</p>
        </div>
        <div class="content-body">
            <div class="media-list">
                ${listItemsHtml}
            </div>
            <a href="javascript:history.back()" class="backend-btn back-btn">&larr; Kembali ke Halaman Sebelumnya</a>
            <div class="footer-info">&copy; 2026 Direktori Konten Media. All rights reserved.</div>
        </div>
    </div>
</body>
</html>`;

      return new Response(latestPageTemplate, {
        headers: { "Content-Type": "text/html;charset=UTF-8" }
      });
    } catch (err) {
      console.error(err);
    }
  }

  // JIKA TIDAK ADA SLUG ATAU KOSONG
  if (!slug) {
    return env.ASSETS.fetch(request);
  }

  try {
    // AMBIL DATA BERDASARKAN SLUG NORMAL
    const { results } = await env.DB.prepare(
      "SELECT link_tujuan FROM links WHERE slug = ? LIMIT 1"
    ).bind(slug).all();

    if (results && results.length > 0 && results[0].link_tujuan) {
      let rawTujuan = results[0].link_tujuan;
      let listTujuan = rawTujuan.split(",").map(l => l.trim()).filter(l => l.length > 0);

      if (listTujuan.length > 0) {
        let buttonsHtml = "";
        listTujuan.forEach((url, index) => {
          let partNum = index + 1;
          buttonsHtml += `
            <a href="${url}" target="_blank" rel="noopener noreferrer" class="media-card-item">
              <div class="item-left">
                <div class="play-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                </div>
                <div>
                  <div class="item-title">Pemutar Rekaman Sesi ${partNum}</div>
                  <div class="item-subtitle">Resolusi HD • Server Utama Terverifikasi</div>
                </div>
              </div>
              <div class="item-action">
                <span>Tonton</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
              </div>
            </a>
          `;
        });

        // Tombol tambahan "List Update Terbaru" di bawah sendiri
        let latestUpdateBtnUrl = `${urlObj.origin}/go/terbaru`;
        let latestUpdateSection = `
          <div style="margin-top: 16px; padding-top: 16px; border-top: 1px dashed #334155;">
            <a href="${latestUpdateBtnUrl}" class="media-card-item" style="background: linear-gradient(135deg, #1e293b, #334155); border-color: #3b82f6;">
              <div class="item-left">
                <div class="play-icon" style="background: rgba(59, 130, 246, 0.2); color: #60a5fa;">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                </div>
                <div>
                  <div class="item-title" style="color: #60a5fa;">List Update Terbaru</div>
                  <div class="item-subtitle">Cek 10 tautan arsip rilisan terbaru lainnya</div>
                </div>
              </div>
              <div class="item-action" style="background: #3b82f6; color: #ffffff;">
                <span>Lihat</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
              </div>
            </a>
          </div>
        `;

        const htmlTemplate = `<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pusat Arsip & Streaming Konten Digital Terpadu</title>
    <style>
        * { box-sizing: border-box; }
        body { font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f172a; color: #f8fafc; margin: 0; padding: 20px; line-height: 1.5; }
        .page-wrapper { max-width: 620px; margin: 40px auto 80px auto; background: #1e293b; border-radius: 16px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2); border: 1px solid #334155; overflow: hidden; }
        .hero-header { background: linear-gradient(135deg, #2563eb, #1d4ed8); padding: 30px 24px; text-align: center; color: #ffffff; }
        .hero-badge { display: inline-block; background: rgba(255, 255, 255, 0.15); backdrop-filter: blur(4px); font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 20px; text-transform: uppercase; margin-bottom: 12px; letter-spacing: 1px; }
        .hero-header h1 { font-size: 22px; font-weight: 700; margin: 0 0 8px 0; }
        .hero-header p { font-size: 13px; opacity: 0.9; margin: 0; }
        
        .content-body { padding: 24px; }
        .section-label { font-size: 12px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 14px; display: flex; justify-content: space-between; align-items: center; }
        .section-label span { background: #334155; color: #cbd5e1; padding: 2px 8px; border-radius: 4px; font-size: 11px; }

        .media-card-item { display: flex; justify-content: space-between; align-items: center; background: #0f172a; color: #f8fafc; padding: 14px 16px; margin-bottom: 10px; border-radius: 10px; text-decoration: none; border: 1px solid #334155; transition: all 0.2s ease; }
        .media-card-item:hover { border-color: #3b82f6; background: #131c31; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15); }
        
        .item-left { display: flex; align-items: center; gap: 14px; }
        .play-icon { width: 36px; height: 36px; background: rgba(59, 130, 246, 0.15); color: #60a5fa; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .item-title { font-size: 14px; font-weight: 600; color: #f1f5f9; }
        .item-subtitle { font-size: 11px; color: #94a3b8; margin-top: 2px; }
        
        .item-action { display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 600; color: #60a5fa; background: rgba(59, 130, 246, 0.1); padding: 6px 12px; border-radius: 6px; }
        
        .footer-info { text-align: center; font-size: 11px; color: #64748b; margin-top: 24px; padding-top: 16px; border-top: 1px solid #334155; }

        /* Floating Telegram Widget */
        .tg-float {
            position: fixed;
            bottom: 24px;
            right: 24px;
            background: #229ED9;
            color: white;
            width: 56px;
            height: 56px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 15px rgba(34, 158, 217, 0.4);
            z-index: 999;
            text-decoration: none;
            transition: transform 0.2s ease, background 0.2s ease;
        }
        .tg-float:hover {
            transform: scale(1.08);
            background: #1b85b8;
        }
        .tg-dot {
            position: absolute;
            top: 2px;
            right: 2px;
            width: 14px;
            height: 14px;
            background: #ef4444;
            border: 2px solid #0f172a;
            border-radius: 50%;
            animation: pulse-dot 1.5s infinite;
        }
        @keyframes pulse-dot {
            0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
            70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); }
            100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
    </style>
</head>
<body>
    <div class="page-wrapper">
        <div class="hero-header">
            <div class="hero-badge">Portal Streaming Terverifikasi</div>
            <h1>Arsip Pemutar Media Digital</h1>
            <p>Silakan pilih sesi tayangan yang ingin kamu saksikan melalui daftar di bawah ini.</p>
        </div>
        
        <div class="content-body">
            <div class="section-label">
                Daftar Sesi Tersedia
                <span>${listTujuan.length} Bagian</span>
            </div>
            
            <div class="media-list">
                ${buttonsHtml}
            </div>

            <!-- Tombol List Update Terbaru -->
            ${latestUpdateSection}

            <div class="footer-info">
                &copy; 2026 Direktori Konten Media. Aman, Cepat, dan Terenkripsi.
            </div>
        </div>
    </div>

    <!-- Tombol Mengambang Telegram dengan Titik Merah Notifikasi -->
    <a href="https://t.me/koleksikitaV1" target="_blank" rel="noopener noreferrer" class="tg-float" title="Gabung Channel Telegram">
        <div class="tg-dot"></div>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.03-1.99 1.27-5.62 3.72-.53.36-1.01.54-1.44.53-.47-.02-1.37-.26-2.03-.48-.82-.27-1.47-.42-1.42-.88.03-.25.38-.51 1.05-.78 4.11-1.79 6.85-2.97 8.22-3.55 3.91-1.67 4.72-1.96 5.25-1.97.12 0 .39.03.56.17.14.12.18.28.2.4-.02.07-.02.13-.04.22z"/>
        </svg>
    </a>
</body>
</html>`;

        return new Response(htmlTemplate, {
          headers: { "Content-Type": "text/html;charset=UTF-8" }
        });
      }
    }
  } catch (err) {
    console.error(err);
  }

  return env.ASSETS.fetch(request);
}
