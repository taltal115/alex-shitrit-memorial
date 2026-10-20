import {
  generateQRCodeSVG,
  generateQRCodePNG,
} from '@/utils/qr';

describe('QR Code Generation', () => {
  const testUrl = 'https://example.com/prayers';

  describe('generateQRCodeSVG', () => {
    it('should generate SVG QR code', async () => {
      const svg = await generateQRCodeSVG(testUrl);
      
      expect(svg).toBeTruthy();
      expect(svg).toContain('<svg');
      expect(svg).toContain('</svg>');
    });

    it('should use correct colors', async () => {
      const svg = await generateQRCodeSVG(testUrl);
      
      // Should use the site's color scheme
      expect(svg).toMatch(/#242521|#F4F0E8/i);
    });

    it('should handle errors gracefully', async () => {
      await expect(generateQRCodeSVG('')).rejects.toThrow();
    });
  });

  describe('generateQRCodePNG', () => {
    it('should generate PNG data URL', async () => {
      const png = await generateQRCodePNG(testUrl);
      
      expect(png).toBeTruthy();
      expect(png).toContain('data:image/png;base64,');
    });

    it('should generate high resolution PNG', async () => {
      const png = await generateQRCodePNG(testUrl);
      
      // Data URL should be substantial for high-res image
      expect(png.length).toBeGreaterThan(1000);
    });

    it('should handle errors gracefully', async () => {
      await expect(generateQRCodePNG('')).rejects.toThrow();
    });
  });
});
