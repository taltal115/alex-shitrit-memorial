import QRCode from 'qrcode';

/**
 * Generate QR code as SVG string
 */
export async function generateQRCodeSVG(url: string): Promise<string> {
  try {
    return await QRCode.toString(url, {
      type: 'svg',
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 400,
      color: {
        dark: '#242521',
        light: '#F4F0E8',
      },
    });
  } catch (error) {
    console.error('Error generating QR code SVG:', error);
    throw error;
  }
}

/**
 * Generate QR code as high-resolution PNG data URL
 */
export async function generateQRCodePNG(url: string): Promise<string> {
  try {
    return await QRCode.toDataURL(url, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 1000,
      color: {
        dark: '#242521FF',
        light: '#F4F0E8FF',
      },
    });
  } catch (error) {
    console.error('Error generating QR code PNG:', error);
    throw error;
  }
}

/**
 * Generate QR code as buffer for server-side file creation
 */
export async function generateQRCodeBuffer(url: string): Promise<Buffer> {
  try {
    return await QRCode.toBuffer(url, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 2000,
      color: {
        dark: '#242521FF',
        light: '#F4F0E8FF',
      },
    });
  } catch (error) {
    console.error('Error generating QR code buffer:', error);
    throw error;
  }
}
