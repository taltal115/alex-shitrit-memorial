# Psalm 119:96 Makaf Verification

**QA Request**: Verify if Psalm 119:96 should have makaf (־) in `לְכָל־תִּכְלָה` or not.

**Current in seed** (`006_seed_sephardi_prayers.sql`):
```
לְכָל תִּכְלָה רָאִיתִי קֵץ רְחָבָה מִצְוָתְךָ מְאֹד׃
```
(No makaf between לְכָל and תִּכְלָה)

**Sefaria API Check**:
Verse 96 is part of the ל (lamed) section, verses 89-96.

**Verification Result**: 
The current text matches Sefaria's "Tanach with Nikkud" source, which shows **NO makaf**.

**Conclusion**: ✅ **NO CHANGE NEEDED**

The seed file is correct as-is. The text `לְכָל תִּכְלָה` (without makaf) matches the authoritative Sefaria source.

**Source**: https://www.sefaria.org/Psalms.119.89-96?vhe=Tanach_with_Nikkud
