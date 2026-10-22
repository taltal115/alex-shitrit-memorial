export type ApprovalStatus = 'pending' | 'approved' | 'rejected';
export type UserRole = 'visitor' | 'registered' | 'content_manager' | 'super_admin';
export type FileType = 'image' | 'video' | 'audio';

export interface HebrewDate {
  day: number;
  month: string;
  year: number;
}

export interface AzkaraDate {
  hebrewDate: HebrewDate;
  gregorianDate: Date;
  weekday: string;
  weekdayHebrew: string;
  daysUntil: number;
}

export interface HalachicTimes {
  sunset: Date;
  tzeit: Date;
  location: {
    latitude: number;
    longitude: number;
    timezone: string;
  };
}

export interface MemorialData {
  id: string;
  hebrewName: string;
  englishName: string;
  hebrewDeathDate: HebrewDate | null;
  gregorianDeathDate: Date;
  deathDateVerified: boolean;
  portraitUrl: string | null;
  quote: string | null;
  introText: string | null;
}

export interface TimelineEvent {
  id: string;
  category: string;
  title: string;
  description: string | null;
  dateHebrew: string | null;
  dateGregorian: Date | null;
  sortOrder: number;
  isPublished: boolean;
}

export interface Story {
  id: string;
  authorName: string;
  authorRelation: string;
  title: string;
  content: string;
  approvalStatus: ApprovalStatus;
  submittedBy: string | null;
  createdAt: Date;
}

export interface MediaAsset {
  id: string;
  filePath: string;
  fileType: FileType;
  caption: string | null;
  dateTaken: Date | null;
  peopleTagged: string[] | null;
  approvalStatus: ApprovalStatus;
}

export interface PrayerSection {
  id: string;
  sectionOrder: number;
  title: string;
  hebrewText: string;
  notes: string | null;
  isVerified: boolean;
}

export interface MemorialSchedule {
  id: string;
  year: number;
  hebrewDate: HebrewDate;
  gregorianDate: Date;
  gatheringTime: string | null;
  prayersTime: string | null;
  graveVisitTime: string | null;
  mealTime: string | null;
  locationNotes: string | null;
}
