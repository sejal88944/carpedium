/**
 * Opens a single-page preview of a raster artwork and triggers the OS/browser print dialog.
 * Uses the same print-area PNG as PDF page 2 (tee design only — no mockup).
 */
export function openPrintDialogForRasterDesign(dataUrl: string, targetWindow?: Window | null): boolean {
  if (typeof window === 'undefined') return false
  if (!dataUrl.startsWith('data:image/')) return false

  const w =
    targetWindow ?? window.open('', '_blank', 'noopener,noreferrer,width=920,height=1200')

  if (!w) return false

  const payload = JSON.stringify(dataUrl)

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>T-shirt artwork — print</title>
  <style>
    html, body { margin: 0; background: #fff; }
    body {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: system-ui, sans-serif;
    }
    img#art {
      max-width: 100vw;
      max-height: 100vh;
      width: auto;
      height: auto;
      object-fit: contain;
    }
    p.hint {
      position: fixed;
      bottom: 8px;
      left: 0;
      right: 0;
      text-align: center;
      font-size: 11px;
      color: #64748b;
      margin: 0;
    }
    @media print {
      p.hint { display: none; }
      body { min-height: auto; display: block; padding: 8mm; text-align: center; }
      img#art {
        max-width: 100% !important;
        max-height: none !important;
        height: auto !important;
      }
    }
  </style>
</head>
<body>
  <img id="art" alt="T-shirt design for print" />
  <p class="hint">Close this tab after printing · Pop-up allow केलं असलं पाहिजे</p>
  <script>
    (function () {
      var url = ${payload};
      var img = document.getElementById('art');
      img.onload = function () {
        setTimeout(function () {
          try { window.focus(); window.print(); } catch (e) {}
        }, 200);
      };
      img.onerror = function () {
        document.body.innerHTML = '<p style="padding:24px">Could not load artwork for print.</p>';
      };
      img.src = url;
    })();
  </script>
</body>
</html>`

  try {
    w.document.open()
    w.document.write(html)
    w.document.close()
    return true
  } catch {
    try {
      w.close()
    } catch {
      /* ignore */
    }
    return false
  }
}
