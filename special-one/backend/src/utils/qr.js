import QRCode from 'qrcode'

export async function generateQRDataURL(text) {
  return QRCode.toDataURL(text, { width: 256, margin: 1 })
}
