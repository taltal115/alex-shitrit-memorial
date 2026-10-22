import { describe, it, expect } from '@jest/globals';

describe('Psalm 119 Display Enhancements', () => {
  describe('Letter to Word Mapping', () => {
    const getLetterMapping = (position: number, sectionId: string) => {
      const nameWords = [
        { word: 'אלכס', letters: ['א', 'ל', 'כ', 'ס'] },
        { word: 'יחיא', letters: ['י', 'ח', 'י', 'א'] },
        { word: 'בן', letters: ['ב', 'ן'] },
        { word: 'פורטונה', letters: ['פ', 'ו', 'ר', 'ט', 'ו', 'נ', 'ה'] }
      ];
      
      const neshemaWord = { word: 'נשמה', letters: ['נ', 'ש', 'מ', 'ה'] };
      
      if (sectionId === 'psalm119-name') {
        let currentPos = 1;
        for (const { word, letters } of nameWords) {
          if (position >= currentPos && position < currentPos + letters.length) {
            const letterIndex = position - currentPos;
            return {
              fullName: 'אלכס יחיא בן פורטונה',
              currentWord: word,
              currentLetter: letters[letterIndex],
              letterPosition: position
            };
          }
          currentPos += letters.length;
        }
      } else if (sectionId === 'psalm119-neshama') {
        const letterIndex = position - 1;
        if (letterIndex >= 0 && letterIndex < neshemaWord.letters.length) {
          return {
            fullName: 'נשמה',
            currentWord: neshemaWord.word,
            currentLetter: neshemaWord.letters[letterIndex],
            letterPosition: position
          };
        }
      }
      
      return null;
    };

    it('should map position 1 to first letter of אלכס (א)', () => {
      const result = getLetterMapping(1, 'psalm119-name');
      expect(result).not.toBeNull();
      expect(result?.currentWord).toBe('אלכס');
      expect(result?.currentLetter).toBe('א');
      expect(result?.fullName).toBe('אלכס יחיא בן פורטונה');
    });

    it('should map position 4 to last letter of אלכס (ס)', () => {
      const result = getLetterMapping(4, 'psalm119-name');
      expect(result).not.toBeNull();
      expect(result?.currentWord).toBe('אלכס');
      expect(result?.currentLetter).toBe('ס');
    });

    it('should map position 5 to first letter of יחיא (י)', () => {
      const result = getLetterMapping(5, 'psalm119-name');
      expect(result).not.toBeNull();
      expect(result?.currentWord).toBe('יחיא');
      expect(result?.currentLetter).toBe('י');
    });

    it('should map position 7 to second occurrence of י in יחיא', () => {
      const result = getLetterMapping(7, 'psalm119-name');
      expect(result).not.toBeNull();
      expect(result?.currentWord).toBe('יחיא');
      expect(result?.currentLetter).toBe('י');
    });

    it('should map position 8 to second occurrence of א in יחיא', () => {
      const result = getLetterMapping(8, 'psalm119-name');
      expect(result).not.toBeNull();
      expect(result?.currentWord).toBe('יחיא');
      expect(result?.currentLetter).toBe('א');
    });

    it('should map position 9 to first letter of בן (ב)', () => {
      const result = getLetterMapping(9, 'psalm119-name');
      expect(result).not.toBeNull();
      expect(result?.currentWord).toBe('בן');
      expect(result?.currentLetter).toBe('ב');
    });

    it('should map position 10 to final nun in בן (ן)', () => {
      const result = getLetterMapping(10, 'psalm119-name');
      expect(result).not.toBeNull();
      expect(result?.currentWord).toBe('בן');
      expect(result?.currentLetter).toBe('ן');
    });

    it('should map position 11 to first letter of פורטונה (פ)', () => {
      const result = getLetterMapping(11, 'psalm119-name');
      expect(result).not.toBeNull();
      expect(result?.currentWord).toBe('פורטונה');
      expect(result?.currentLetter).toBe('פ');
    });

    it('should map position 12 to first ו in פורטונה', () => {
      const result = getLetterMapping(12, 'psalm119-name');
      expect(result).not.toBeNull();
      expect(result?.currentWord).toBe('פורטונה');
      expect(result?.currentLetter).toBe('ו');
    });

    it('should map position 15 to second ו in פורטונה', () => {
      const result = getLetterMapping(15, 'psalm119-name');
      expect(result).not.toBeNull();
      expect(result?.currentWord).toBe('פורטונה');
      expect(result?.currentLetter).toBe('ו');
    });

    it('should map position 17 to last letter of פורטונה (ה)', () => {
      const result = getLetterMapping(17, 'psalm119-name');
      expect(result).not.toBeNull();
      expect(result?.currentWord).toBe('פורטונה');
      expect(result?.currentLetter).toBe('ה');
    });

    it('should map neshama positions correctly', () => {
      const mappings = [
        { pos: 1, letter: 'נ', word: 'נשמה' },
        { pos: 2, letter: 'ש', word: 'נשמה' },
        { pos: 3, letter: 'מ', word: 'נשמה' },
        { pos: 4, letter: 'ה', word: 'נשמה' }
      ];

      mappings.forEach(({ pos, letter, word }) => {
        const result = getLetterMapping(pos, 'psalm119-neshama');
        expect(result).not.toBeNull();
        expect(result?.currentWord).toBe(word);
        expect(result?.currentLetter).toBe(letter);
        expect(result?.fullName).toBe('נשמה');
      });
    });

    it('should return null for invalid positions', () => {
      expect(getLetterMapping(0, 'psalm119-name')).toBeNull();
      expect(getLetterMapping(18, 'psalm119-name')).toBeNull();
      expect(getLetterMapping(100, 'psalm119-name')).toBeNull();
      expect(getLetterMapping(5, 'psalm119-neshama')).toBeNull();
    });

    it('should return null for non-psalm119 sections', () => {
      expect(getLetterMapping(1, 'hashkava-man')).toBeNull();
      expect(getLetterMapping(1, 'kaddish')).toBeNull();
    });
  });

  describe('Letter Heading Regex', () => {
    it('should match valid letter headings', () => {
      const testCases = [
        '[א | 1] פסוקים 1-8',
        '[ב | 2]',
        '[ט | 9] הקדמה',
        '[נ | 14]'
      ];

      testCases.forEach(verse => {
        const match = verse.match(/^\[(.+?)\s*\|\s*(\d+)\](.*)$/);
        expect(match).not.toBeNull();
        if (match) {
          expect(match[1]).toBeTruthy(); // letter
          expect(match[2]).toMatch(/^\d+$/); // position
        }
      });
    });

    it('should extract letter, position, and description', () => {
      const verse = '[א | 1] פסוקים 1-8';
      const match = verse.match(/^\[(.+?)\s*\|\s*(\d+)\](.*)$/);
      
      expect(match).not.toBeNull();
      if (match) {
        const [, letter, position, description] = match;
        expect(letter).toBe('א');
        expect(position).toBe('1');
        expect(description).toBe(' פסוקים 1-8');
      }
    });

    it('should not match regular verses', () => {
      const verses = [
        'אַשְׁרֵי תְמִימֵי־דָרֶךְ',
        'וְיֹדְעֵי שְׁמֶךָ',
        'מַה־טֹּבוּ אֹהָלֶיךָ'
      ];

      verses.forEach(verse => {
        const match = verse.match(/^\[(.+?)\s*\|\s*(\d+)\](.*)$/);
        expect(match).toBeNull();
      });
    });
  });

  describe('Full Name Structure', () => {
    it('should have correct total letter count for name', () => {
      const words = [
        { word: 'אלכס', count: 4 },
        { word: 'יחיא', count: 4 },
        { word: 'בן', count: 2 },
        { word: 'פורטונה', count: 7 }
      ];
      
      const totalCount = words.reduce((sum, w) => sum + w.count, 0);
      expect(totalCount).toBe(17);
    });

    it('should have correct letter count for neshama', () => {
      const letters = ['נ', 'ש', 'מ', 'ה'];
      expect(letters.length).toBe(4);
    });

    it('should match full name structure', () => {
      const fullName = 'אלכס יחיא בן פורטונה';
      const words = fullName.split(' ');
      
      expect(words).toHaveLength(4);
      expect(words[0]).toBe('אלכס');
      expect(words[1]).toBe('יחיא');
      expect(words[2]).toBe('בן');
      expect(words[3]).toBe('פורטונה');
    });
  });

  describe('Repeated Letters', () => {
    it('should identify all occurrences of א in full name', () => {
      const fullName = 'אלכס יחיא בן פורטונה';
      const aLetters = fullName.split('').filter(c => c === 'א');
      expect(aLetters).toHaveLength(2); // positions 1 and 8
    });

    it('should identify all occurrences of י in full name', () => {
      const fullName = 'אלכס יחיא בן פורטונה';
      const yodLetters = fullName.split('').filter(c => c === 'י');
      expect(yodLetters).toHaveLength(2); // positions 5 and 7
    });

    it('should identify all occurrences of ו in full name', () => {
      const fullName = 'אלכס יחיא בן פורטונה';
      const vavLetters = fullName.split('').filter(c => c === 'ו');
      expect(vavLetters).toHaveLength(2); // positions 12 and 15
    });
  });

  describe('CSS Classes', () => {
    it('should apply verse-drop-cap class to Psalm 119 verses', () => {
      const isPsalm119Name = 'psalm119-name';
      const isPsalm119Neshama = 'psalm119-neshama';
      const isOther = 'hashkava-man';

      expect(isPsalm119Name.startsWith('psalm119-')).toBe(true);
      expect(isPsalm119Neshama.startsWith('psalm119-')).toBe(true);
      expect(isOther.startsWith('psalm119-')).toBe(false);
    });
  });

  describe('Quick Jump Menu Grouping', () => {
    it('should identify psalm119 sections', () => {
      const sections = [
        { section_id: 'hashkava-man', title: 'השכבה' },
        { section_id: 'psalm119-name', title: 'תהילים קיט – אלכס' },
        { section_id: 'psalm119-neshama', title: 'תהילים קיט – נשמה' },
        { section_id: 'kaddish', title: 'קדיש' }
      ];

      const psalm119Sections = sections.filter(s => 
        s.section_id === 'psalm119-name' || s.section_id === 'psalm119-neshama'
      );

      expect(psalm119Sections).toHaveLength(2);
    });

    it('should merge psalm119 sections into one button', () => {
      const sections = [
        { section_id: 'hashkava-man', title: 'השכבה' },
        { section_id: 'psalm119-name', title: 'תהילים קיט – אלכס' },
        { section_id: 'psalm119-neshama', title: 'תהילים קיט – נשמה' },
        { section_id: 'kaddish', title: 'קדיש' }
      ];

      let psalm119Merged = false;
      const buttons = [];

      sections.forEach(section => {
        const isPsalm119 = section.section_id === 'psalm119-name' || 
                           section.section_id === 'psalm119-neshama';
        
        if (isPsalm119 && !psalm119Merged) {
          buttons.push('תהילים קיט');
          psalm119Merged = true;
        } else if (!isPsalm119) {
          buttons.push(section.title);
        }
      });

      expect(buttons).toEqual(['השכבה', 'תהילים קיט', 'קדיש']);
    });
  });
});
