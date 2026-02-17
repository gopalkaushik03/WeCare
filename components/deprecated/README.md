# Deprecated Components

This folder contains components that are no longer actively used in the WeCare application. They have been moved here instead of being deleted immediately to allow for safe rollback if needed.

## Components in this folder:

### AnimatedInput.jsx (2,448 bytes)
- **Reason:** Login and signup pages use standard input elements with custom styling
- **Last used:** Unknown
- **Safe to delete after:** 2 weeks (Feb 15, 2026)

### BreathingOrb.jsx (1,432 bytes)
- **Reason:** Replaced by ParallaxHero component in the homepage redesign
- **Last used:** Before parallax upgrade (Jan 2026)
- **Safe to delete after:** 2 weeks (Feb 15, 2026)

### MoodMusicPlayer.jsx (2,690 bytes)
- **Reason:** Functionality replaced by SonicTherapy component in dashboard
- **Last used:** Unknown
- **Safe to delete after:** 2 weeks (Feb 15, 2026)

### TiltCard.jsx (1,697 bytes)
- **Reason:** Not used in any current page; SpotlightCard serves similar purpose
- **Last used:** Unknown
- **Safe to delete after:** 2 weeks (Feb 15, 2026)

---

## Timeline:

**Created:** February 1, 2026  
**Review Date:** February 15, 2026  
**Action:** If no issues arise by review date, permanently delete this folder

---

## Recovery:

If you need to restore any component:
```bash
# Example: Restore BreathingOrb
Move-Item -Path "components\deprecated\BreathingOrb.jsx" -Destination "components\" -Force
```
