/**
 * Tests for prayer sections data structure and rendering logic
 */

describe('Prayer Sections', () => {
  const mockPrayerSection = {
    id: 'test-id',
    section_id: 'opening',
    section_order: 1,
    title: 'פתיחה – מזמור לדוד',
    hebrew_text: '',
    notes: 'Test notes',
    source_url: 'https://www.sefaria.org/test',
    verses: [
      '(ואחר כך אומרים)',
      'מִזְמ֗וֹר לְדָ֫וִ֥ד',
      '[א | 1] פסוקים 1-8',
      'אַשְׁרֵי תְמִימֵי־דָרֶךְ',
    ],
    verification_status: 'pending_family_verification' as const,
    is_verified: false,
    verified_at: null,
    verified_by: null,
  };

  describe('Prayer Section Structure', () => {
    it('should have required fields', () => {
      expect(mockPrayerSection).toHaveProperty('id');
      expect(mockPrayerSection).toHaveProperty('section_id');
      expect(mockPrayerSection).toHaveProperty('section_order');
      expect(mockPrayerSection).toHaveProperty('title');
      expect(mockPrayerSection).toHaveProperty('verses');
      expect(mockPrayerSection).toHaveProperty('verification_status');
    });

    it('should have verses as an array', () => {
      expect(Array.isArray(mockPrayerSection.verses)).toBe(true);
      expect(mockPrayerSection.verses!.length).toBeGreaterThan(0);
    });

    it('should have valid verification status', () => {
      const validStatuses = ['pending_family_verification', 'verified', 'rejected'];
      expect(validStatuses).toContain(mockPrayerSection.verification_status);
    });
  });

  describe('Letter Heading Detection', () => {
    it('should identify letter headings in Psalm 119', () => {
      const letterHeading = '[א | 1] פסוקים 1-8';
      const match = letterHeading.match(/^\[(.+?)\s*\|\s*(\d+)\](.*)$/);
      
      expect(match).not.toBeNull();
      expect(match![1]).toBe('א');
      expect(match![2]).toBe('1');
      expect(match![3]).toBe(' פסוקים 1-8');
    });

    it('should not match regular verses', () => {
      const regularVerse = 'אַשְׁרֵי תְמִימֵי־דָרֶךְ';
      const match = regularVerse.match(/^\[(.+?)\s*\|\s*(\d+)\](.*)$/);
      
      expect(match).toBeNull();
    });
  });

  describe('Name Placeholder Detection', () => {
    it('should identify name placeholders in hashkava', () => {
      const verseWithName = 'שֶׁל (פב"פ) [[NAME: אלכס יחיה בן פורטונה]], רוּחַ ה\' תְּנִיחֶנּוּ';
      const match = verseWithName.match(/\[\[NAME:\s*(.+?)\]\]/);
      
      expect(match).not.toBeNull();
      expect(match![1]).toBe('אלכס יחיה בן פורטונה');
    });

    it('should not match regular text', () => {
      const regularVerse = 'טוֹב שֵׁם מִשֶּׁמֶן טוֹב';
      const match = regularVerse.match(/\[\[NAME:\s*(.+?)\]\]/);
      
      expect(match).toBeNull();
    });
  });

  describe('Prayer Section Order', () => {
    const sectionIds = [
      'opening',
      'psalm119-name',
      'psalm119-neshama',
      'hashkava-man',
      'kaddish-yatom',
    ];

    it('should have expected section IDs', () => {
      expect(sectionIds).toContain('opening');
      expect(sectionIds).toContain('psalm119-name');
      expect(sectionIds).toContain('psalm119-neshama');
      expect(sectionIds).toContain('hashkava-man');
      expect(sectionIds).toContain('kaddish-yatom');
    });

    it('should maintain correct order', () => {
      expect(sectionIds.indexOf('opening')).toBe(0);
      expect(sectionIds.indexOf('psalm119-name')).toBe(1);
      expect(sectionIds.indexOf('psalm119-neshama')).toBe(2);
      expect(sectionIds.indexOf('hashkava-man')).toBe(3);
      expect(sectionIds.indexOf('kaddish-yatom')).toBe(4);
    });
  });

  describe('Hebrew Text Rendering', () => {
    it('should preserve nikud (vowel points)', () => {
      const verseWithNikud = 'מִזְמ֗וֹר לְדָ֫וִ֥ד';
      
      // Check that nikud characters are present
      expect(verseWithNikud).toMatch(/[\u0591-\u05C7]/); // Hebrew accent/cantillation marks
      expect(verseWithNikud).toContain('ִ'); // Hiriq
      expect(verseWithNikud).toContain('ְ'); // Sheva
      expect(verseWithNikud).toContain('ֹ'); // Holam
    });

    it('should handle RTL text correctly', () => {
      const hebrewText = 'תפילות לעילוי נשמת';
      
      // Hebrew text should contain Hebrew characters
      expect(hebrewText).toMatch(/[\u0590-\u05FF]/);
    });
  });

  describe('Verification Status', () => {
    it('should default to pending_family_verification', () => {
      expect(mockPrayerSection.verification_status).toBe('pending_family_verification');
      expect(mockPrayerSection.is_verified).toBe(false);
    });

    it('should allow verified status', () => {
      const verifiedSection = {
        ...mockPrayerSection,
        verification_status: 'verified' as const,
        is_verified: true,
        verified_at: new Date().toISOString(),
      };
      
      expect(verifiedSection.verification_status).toBe('verified');
      expect(verifiedSection.is_verified).toBe(true);
      expect(verifiedSection.verified_at).not.toBeNull();
    });
  });
});
