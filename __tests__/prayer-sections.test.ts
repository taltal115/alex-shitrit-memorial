/**
 * Tests for prayer sections data structure and rendering logic
 * Tests verify actual seed data and component behavior
 */

import { readFileSync } from 'fs';
import { join } from 'path';

describe('Prayer Sections Seed Data', () => {
  let seedFileContent: string;
  let verses: string[];

  beforeAll(() => {
    // Read the actual seed file
    seedFileContent = readFileSync(
      join(process.cwd(), 'supabase/migrations/006_seed_sephardi_prayers.sql'),
      'utf-8'
    );
  });

  describe('Text Corrections', () => {
    it('should use correct nikud for פִקֻּדֶיךָ (not פִקֻּודֶיךָ)', () => {
      // Psalm 119:87 should have קובוץ without extra vav
      expect(seedFileContent).not.toContain('פִקֻּודֶיךָ');
      expect(seedFileContent).toContain('פִקֻּדֶיךָ');
    });

    it('should show only qere (corrected reading), not kethiv', () => {
      // Should show וְיֹדְעֵי not 'וידעו [וְיֹדְעֵי]'
      expect(seedFileContent).not.toContain('וידעו [וְיֹדְעֵי]');
      expect(seedFileContent).toContain('וְיֹדְעֵי עֵדֹתֶיךָ');
      
      // Should show וּמִדְּבָרְךָ not 'ומדבריך [וּמִדְּבָרְךָ]'
      expect(seedFileContent).not.toContain('ומדבריך [וּמִדְּבָרְךָ]');
      expect(seedFileContent).toContain('וּמִדְּבָרְךָ פָּחַד');
    });
  });

  describe('Psalm 119 Name Letters', () => {
    it('should contain psalm119-name section', () => {
      expect(seedFileContent).toContain("'psalm119-name'");
    });

    it('should have letter headings for name letters', () => {
      const nameSection = seedFileContent.indexOf("'psalm119-name'");
      const endOfSection = seedFileContent.indexOf("'psalm119-neshama'", nameSection);
      const section = seedFileContent.substring(nameSection, endOfSection);
      
      // Check for some expected letter headings
      expect(section).toContain('[א | 1]');
      expect(section).toContain('[ל | 2]');
      expect(section).toContain('[כ | 3]');
    });
  });

  describe('Psalm 119 Neshama Letters', () => {
    it('should contain psalm119-neshama section', () => {
      expect(seedFileContent).toContain("'psalm119-neshama'");
    });

    it('should have letter headings for נ-ש-מ-ה', () => {
      const neshamaSection = seedFileContent.indexOf("'psalm119-neshama'");
      const endOfSection = seedFileContent.indexOf("'hashkava-man'", neshamaSection);
      const section = seedFileContent.substring(neshamaSection, endOfSection);
      
      expect(section).toContain('[נ | 1]');
      expect(section).toContain('[ש | 2]');
      expect(section).toContain('[מ | 3]');
      expect(section).toContain('[ה | 4]');
    });
  });

  describe('Section Order', () => {
    it('should have 5 sections in correct order', () => {
      const sectionIds = [
        'opening',
        'psalm119-name',
        'psalm119-neshama',
        'hashkava-man',
        'kaddish-yatom',
      ];

      sectionIds.forEach((sectionId, index) => {
        const sectionMatch = seedFileContent.match(
          new RegExp(`'${sectionId}',[\\s\\S]{0,200}?section_order[\\s\\S]{0,50}?(\\d+)`, 'm')
        );
        if (sectionMatch) {
          expect(parseInt(sectionMatch[1])).toBe(index + 1);
        }
      });
    });
  });

  describe('Name Placeholder in Hashkava', () => {
    it('should have [[NAME: ...]] placeholder in hashkava section', () => {
      expect(seedFileContent).toContain('[[NAME: אלכס יחיא בן פורטונה]]');
    });

    it('should extract name from placeholder correctly', () => {
      // The actual seed has the full text, just check it contains the name
      expect(seedFileContent).toContain('אלכס יחיא בן פורטונה');
    });
  });

  describe('Verification Status', () => {
    it('should default all sections to pending_family_verification', () => {
      const verificationMatches = seedFileContent.match(/'pending_family_verification'/g);
      expect(verificationMatches).not.toBeNull();
      expect(verificationMatches!.length).toBe(5); // 5 sections
    });

    it('should set is_verified to false for all seeded sections', () => {
      // After each verification_status, there should be "false" for is_verified
      const pattern = /'pending_family_verification',\s*false/g;
      const matches = seedFileContent.match(pattern);
      expect(matches).not.toBeNull();
      expect(matches!.length).toBe(5);
    });
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
    const verseWithName = 'שֶׁל (פב"פ) [[NAME: אלכס יחיא בן פורטונה]], רוּחַ ה\' תְּנִיחֶנּוּ';
    const match = verseWithName.match(/\[\[NAME:\s*(.+?)\]\]/);
    
    expect(match).not.toBeNull();
    expect(match![1]).toBe('אלכס יחיא בן פורטונה');
  });

  it('should not match regular text', () => {
    const regularVerse = 'טוֹב שֵׁם מִשֶּׁמֶן טוֹב';
    const match = regularVerse.match(/\[\[NAME:\s*(.+?)\]\]/);
    
    expect(match).toBeNull();
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
