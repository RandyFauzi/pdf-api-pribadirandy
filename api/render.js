const chromium = require('@sparticuz/chromium');
const puppeteer = require('puppeteer-core'); // Kita perlu memanggil puppeteer secara langsung

chromium.setHeadlessMode = true;
chromium.setGraphicsMode = false;

// Fungsi handler utama
export default async function handler(req, res) {
  // Hanya izinkan metode POST
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Metode yang diizinkan hanya POST' });
  }

  try {
    const { html } = req.body;

    // Pastikan properti html ada
    if (!html) {
      return res.status(400).json({ message: 'Properti "html" dibutuhkan di dalam body request' });
    }

    // --- PERUBAHAN UTAMA ADA DI SINI ---
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(), // Memanggil path ke browser chromium
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });
    // --- AKHIR DARI PERUBAHAN ---

    const page = await browser.newPage();
    await page.setContent(html.toString(), { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
    });

    await browser.close();

    // Kirim PDF sebagai respons
    res.setHeader('Content-Type', 'application/pdf');
    res.status(200).send(pdfBuffer);

  } catch (error) {
    console.error('Error saat membuat PDF:', error);
    res.status(500).json({ message: 'Gagal membuat PDF', error: error.message });
  }
}
