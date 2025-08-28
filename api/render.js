// Impor library yang sudah kita install
const chromium = require('@sparticuz/chromium');

// Ini adalah fungsi utama yang akan dijalankan oleh Vercel
export default async function handler(req, res) {
  // Kita hanya mengizinkan metode POST, karena kita akan menerima data
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Metode yang diizinkan hanya POST' });
  }

  try {
    // Ambil data 'html' dari body request yang dikirim oleh n8n
    const { html } = req.body;

    // Jika tidak ada data html di dalam body, kirim pesan error
    if (!html) {
      return res.status(400).json({ message: 'Properti "html" dibutuhkan di dalam body request' });
    }

    // Jalankan browser Chromium yang dioptimalkan untuk serverless
    const browser = await chromium.puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });

    // Buka halaman baru di dalam browser virtual
    const page = await browser.newPage();

    // Masukkan konten HTML yang kita terima dari n8n ke dalam halaman tersebut
    await page.setContent(html, { waitUntil: 'networkidle0' });

    // Perintahkan browser untuk membuat PDF dari halaman itu
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true, // Opsi ini penting agar warna background ikut tercetak
    });

    // Tutup browser untuk menghemat memori server
    await browser.close();

    // Terakhir, kirim file PDF itu sebagai respons kembali ke n8n
    res.setHeader('Content-Type', 'application/pdf');
    res.status(200).send(pdfBuffer);

  } catch (error) {
    // Jika terjadi error di tengah jalan, tampilkan di log dan kirim pesan error
    console.error('Error saat membuat PDF:', error);
    res.status(500).json({ message: 'Gagal membuat PDF', error: error.message });
  }
}