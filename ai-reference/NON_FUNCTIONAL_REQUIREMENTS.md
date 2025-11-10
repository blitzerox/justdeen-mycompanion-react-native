# Non-Functional Requirements

**Project:** JustDeen MyCompanion - React Native Migration
**Last Updated:** 2025-11-10

---

## 1. Performance Requirements

### 1.1 App Startup & Loading

| Metric | Requirement | Priority |
|--------|-------------|----------|
| Cold start time | < 2 seconds | P0 |
| Warm start time | < 1 second | P0 |
| Screen transition time | < 300ms | P0 |
| Initial Quran load | < 500ms | P0 |
| Prayer times calculation | < 1 second | P0 |
| Location detection | < 5 seconds | P0 |

**Rationale:** Users expect instant access to prayer times and Quran. Slow startup may cause them to miss prayers.

### 1.2 Runtime Performance

| Metric | Requirement | Priority |
|--------|-------------|----------|
| UI thread FPS | ≥ 60 FPS | P0 |
| Qibla compass update rate | 30 FPS minimum | P0 |
| Scroll performance (Quran) | No dropped frames | P0 |
| Memory usage (iOS) | < 150 MB | P1 |
| Memory usage (Android) | < 200 MB | P1 |
| Battery drain | < 5% per hour active use | P1 |

**Measurement:** Use React Native Performance Monitor and native profiling tools.

### 1.3 Network Performance

| Metric | Requirement | Priority |
|--------|-------------|----------|
| API response time | < 2 seconds | P0 |
| Audio streaming start | < 2 seconds | P1 |
| Image loading | < 1 second | P1 |
| Failed requests retry | 3 attempts with exponential backoff | P0 |

**Offline behavior:** App must function fully offline for prayer times, Quran reading, and Qibla compass.

---

## 2. Accuracy Requirements (CRITICAL)

### 2.1 Prayer Time Accuracy

| Component | Requirement | Priority |
|-----------|-------------|----------|
| Prayer time calculation | ±1 minute accuracy | P0 |
| Location detection | ±100 meters | P0 |
| Timezone handling | 100% accurate | P0 |
| DST (Daylight Saving) | Automatic adjustment | P0 |
| Calculation method | Support 8+ methods | P0 |

**Validation:**
- Compare with AlAdhan API reference
- Test across 20+ global cities
- Verify during DST transitions
- Test across all timezone offsets (-12 to +14)

**Impact:** Prayer time errors are **unacceptable** - they affect religious obligations.

### 2.2 Qibla Direction Accuracy

| Component | Requirement | Priority |
|-----------|-------------|----------|
| Qibla angle calculation | ±1 degree | P0 |
| Compass calibration | User-triggered + auto-detect | P0 |
| Magnetic declination | Automatically corrected | P0 |
| Distance to Kaaba | ±10 km accuracy | P1 |

**Validation:**
- Test with known reference points
- Compare with multiple Qibla apps
- Test with magnetic interference detection

---

## 3. Reliability & Availability

### 3.1 App Stability

| Metric | Requirement | Priority |
|--------|-------------|----------|
| Crash-free rate | ≥ 99.5% | P0 |
| ANR (Android Not Responding) | < 0.1% sessions | P0 |
| Error handling | Graceful degradation | P0 |
| Recovery from errors | Automatic retry or user prompt | P0 |

**Monitoring:** Implement crash reporting (e.g., Sentry, Crashlytics)

### 3.2 Data Integrity

| Metric | Requirement | Priority |
|--------|-------------|----------|
| Data loss prevention | 100% - no user data lost | P0 |
| Sync reliability | 99.9% successful syncs | P0 |
| Bookmark persistence | Never lost | P0 |
| Settings persistence | Never lost | P0 |
| Quran data integrity | 100% - no corrupted verses | P0 |

**Validation:**
- Test app kill scenarios
- Test low storage scenarios
- Test database migration paths
- Verify checksums for Quran data

### 3.3 Offline Functionality

| Feature | Offline Capability | Priority |
|---------|-------------------|----------|
| Prayer times | 30 days cached | P0 |
| Quran reading | 100% offline | P0 |
| Qibla compass | Works with last location | P0 |
| Hadith | 100% offline | P1 |
| Duas | 100% offline | P1 |
| Tasbih | 100% offline | P1 |
| Bookmarks (view) | 100% offline | P0 |
| Bookmarks (sync) | Queued for later | P1 |
| Community features | Read-only offline | P2 |

---

## 4. Security Requirements

### 4.1 Authentication & Authorization

| Requirement | Details | Priority |
|-------------|---------|----------|
| Token storage | Encrypted using react-native-mmkv | P0 |
| Token expiration | Auto-refresh before expiry | P0 |
| Password handling | Never stored locally | P0 |
| OAuth flows | Secure implementation (PKCE) | P0 |
| Session timeout | 30 days inactivity | P1 |
| Biometric auth | Optional Face/Touch ID | P2 |

### 4.2 Data Protection

| Requirement | Details | Priority |
|-------------|---------|----------|
| Data at rest | Encrypted storage for sensitive data | P0 |
| Data in transit | HTTPS only (TLS 1.2+) | P0 |
| API keys | Stored in secure environment variables | P0 |
| User data | Never shared without consent | P0 |
| Analytics | Anonymized user data only | P1 |
| Crash reports | No PII (Personally Identifiable Info) | P0 |

### 4.3 Privacy

| Requirement | Details | Priority |
|-------------|---------|----------|
| Location data | Only used for prayer times/Qibla | P0 |
| Location sharing | Never shared with third parties | P0 |
| User consent | Required for analytics | P0 |
| GDPR compliance | Right to delete account | P0 |
| Data export | User can export their data | P1 |
| Privacy policy | Clear and accessible | P0 |

---

## 5. Usability & Accessibility

### 5.1 User Experience

| Requirement | Details | Priority |
|-------------|---------|----------|
| Intuitive navigation | ≤ 3 taps to any feature | P0 |
| Loading indicators | Always shown for > 500ms operations | P0 |
| Error messages | Clear, actionable, never technical jargon | P0 |
| Empty states | Helpful guidance when no data | P0 |
| Onboarding | First-time user tutorial | P1 |
| Help documentation | In-app help for complex features | P1 |

### 5.2 Accessibility (WCAG 2.1 Level AA)

| Requirement | Details | Priority |
|-------------|---------|----------|
| Screen reader support | All UI elements labeled | P0 |
| Color contrast | 4.5:1 for normal text, 3:1 for large | P0 |
| Text scaling | Support up to 200% scaling | P0 |
| Touch targets | Minimum 44x44 (iOS) / 48x48 (Android) | P0 |
| Alternative text | All images have alt text | P0 |
| Keyboard navigation | Full keyboard support (future) | P2 |
| Reduced motion | Respect system preference | P1 |

### 5.3 Internationalization (i18n)

| Requirement | Details | Priority |
|-------------|---------|----------|
| Languages supported | English, Arabic, Urdu (minimum) | P0 |
| RTL support | Full right-to-left layout | P0 |
| Date/time formatting | Locale-aware | P0 |
| Number formatting | Locale-aware (e.g., Arabic numerals) | P0 |
| Translation coverage | 100% for supported languages | P0 |
| Quran translations | 5+ languages | P1 |

---

## 6. Scalability

### 6.1 User Scalability

| Metric | Current | Target (1 year) | Priority |
|--------|---------|-----------------|----------|
| Concurrent users | 10K | 500K | P1 |
| Total users | 50K | 2M | P1 |
| Active groups | 100 | 10K | P2 |

**Approach:** Leverage Cloudflare D1 auto-scaling, optimize database queries, implement caching.

### 6.2 Data Scalability

| Metric | Requirement | Priority |
|--------|-------------|----------|
| Quran database | 6,236 verses (fixed) | P0 |
| Bookmarks per user | Up to 1,000 | P1 |
| User notes storage | Up to 10 MB per user | P1 |
| Audio cache size | Up to 500 MB | P1 |
| Community groups | Up to 100 per user | P2 |

### 6.3 Performance Under Load

| Scenario | Requirement | Priority |
|----------|-------------|----------|
| Ramadan traffic spike | Handle 10x normal load | P1 |
| Eid day usage | No degradation | P1 |
| Jumma (Friday) prayer | Peak traffic at noon UTC+3 | P1 |

---

## 7. Compatibility

### 7.1 Platform Support

| Platform | Minimum Version | Target Version | Priority |
|----------|----------------|----------------|----------|
| iOS | 13.0 | 17.0 (latest) | P0 |
| Android | 8.0 (API 26) | 14.0 (API 34) | P0 |
| React Native | 0.73 | 0.73+ | P0 |

### 7.2 Device Support

| Device Type | Support | Priority |
|-------------|---------|----------|
| iPhone 8 and newer | Full support | P0 |
| Android phones (2019+) | Full support | P0 |
| Tablets (iPad, Android) | Optimized layouts | P1 |
| Older devices (2017-2018) | Basic support | P2 |

### 7.3 Screen Sizes

| Size Category | Resolution Range | Priority |
|---------------|------------------|----------|
| Small phones | 320-375px width | P1 |
| Standard phones | 375-430px width | P0 |
| Large phones | 430-480px width | P0 |
| Tablets | 768px+ width | P1 |

### 7.4 Network Conditions

| Condition | Requirement | Priority |
|-----------|-------------|----------|
| WiFi | Full functionality | P0 |
| 4G/5G | Full functionality | P0 |
| 3G | Degraded (no audio streaming) | P1 |
| 2G | Basic features only | P2 |
| Offline | Core features work | P0 |

---

## 8. Maintainability

### 8.1 Code Quality

| Metric | Requirement | Priority |
|--------|-------------|----------|
| TypeScript coverage | 100% | P0 |
| Code documentation | All public APIs documented | P0 |
| Linting | No ESLint errors | P0 |
| Code formatting | Prettier enforced | P0 |
| Component reusability | DRY principle followed | P0 |
| Cyclomatic complexity | < 10 per function | P1 |

### 8.2 Testing

| Metric | Requirement | Priority |
|--------|-------------|----------|
| Unit test coverage | ≥ 70% | P0 |
| Critical path coverage | 100% | P0 |
| E2E test coverage | 20 key user flows | P1 |
| Prayer time accuracy tests | 100 cities tested | P0 |
| Qibla accuracy tests | 50 locations tested | P0 |
| Regression testing | Automated | P0 |

### 8.3 Documentation

| Document | Requirement | Priority |
|----------|-------------|----------|
| API documentation | Complete | P0 |
| Component library | Storybook or equivalent | P1 |
| Architecture docs | Up-to-date | P0 |
| Setup instructions | Step-by-step | P0 |
| Migration guide | Detailed | P0 |
| User manual | Available in-app | P1 |

---

## 9. Deployment & Operations

### 9.1 Build & Release

| Requirement | Details | Priority |
|-------------|---------|----------|
| Build automation | CI/CD pipeline (GitHub Actions) | P0 |
| Build time | < 10 minutes | P1 |
| APK/IPA size | < 50 MB (before assets) | P1 |
| Release frequency | Bi-weekly (after launch) | P1 |
| Rollback capability | 1-click rollback | P0 |

### 9.2 Monitoring & Logging

| Requirement | Details | Priority |
|-------------|---------|----------|
| Error tracking | Real-time alerts | P0 |
| Performance monitoring | APM (Application Performance Monitoring) | P0 |
| Analytics | User behavior tracking | P1 |
| Crash reporting | Automatic upload | P0 |
| API monitoring | Response times & errors | P0 |
| User feedback | In-app feedback form | P1 |

### 9.3 App Store Compliance

| Requirement | Details | Priority |
|-------------|---------|----------|
| Apple App Store | Follow Human Interface Guidelines | P0 |
| Google Play Store | Follow Material Design principles | P0 |
| Age rating | 4+ (iOS), Everyone (Android) | P0 |
| Content rating | No objectionable content | P0 |
| Privacy policy | Meets store requirements | P0 |
| Terms of service | Clear and accessible | P0 |

---

## 10. Backup & Disaster Recovery

### 10.1 Data Backup

| Requirement | Details | Priority |
|-------------|---------|----------|
| Cloud sync frequency | Every 5 minutes (when changed) | P1 |
| Local backup | Daily automatic backup | P1 |
| Backup retention | 30 days | P1 |
| Restore capability | User-initiated restore | P1 |
| Database migrations | Zero data loss | P0 |

### 10.2 Disaster Recovery

| Scenario | Recovery Time Objective (RTO) | Recovery Point Objective (RPO) | Priority |
|----------|-------------------------------|--------------------------------|----------|
| Cloudflare D1 outage | < 1 hour | < 5 minutes | P0 |
| API service failure | < 5 minutes | 0 (stateless) | P0 |
| Database corruption | < 2 hours | < 15 minutes | P0 |
| User data loss | Restore from backup | < 24 hours | P0 |

---

## 11. Islamic Sensitivity & Cultural Considerations

### 11.1 Religious Accuracy

| Requirement | Details | Priority |
|-------------|---------|----------|
| Quran text verification | Triple-checked against official sources | P0 |
| Hadith authenticity | Only authentic (Sahih) collections | P0 |
| Islamic guidance | Reviewed by scholars (optional) | P1 |
| No inappropriate content | Strict content filtering | P0 |

### 11.2 Cultural Sensitivity

| Requirement | Details | Priority |
|-------------|---------|----------|
| No music in notifications | Use appropriate Adhan or beeps | P0 |
| Respectful imagery | No inappropriate images near holy text | P0 |
| Arabic text handling | Proper rendering, no splitting words | P0 |
| Ramadan mode | Special features during Ramadan | P1 |

---

## 12. Legal & Compliance

### 12.1 Data Protection Laws

| Regulation | Requirement | Priority |
|------------|-------------|----------|
| GDPR (EU) | Full compliance | P0 |
| CCPA (California) | Full compliance | P0 |
| COPPA (Children) | No data collection from <13 | P0 |

### 12.2 Intellectual Property

| Requirement | Details | Priority |
|-------------|---------|----------|
| Quran text | Public domain or licensed | P0 |
| Translations | Licensed or public domain | P0 |
| Audio recitations | Licensed from reciters | P0 |
| Icons & images | Licensed or original | P0 |
| Open source licenses | All dependencies compliant | P0 |

---

## 13. Success Metrics (KPIs)

### 13.1 Technical KPIs

| Metric | Target | Measurement |
|--------|--------|-------------|
| App crash rate | < 0.5% | Firebase Crashlytics |
| API error rate | < 1% | Application logs |
| Average load time | < 2s | Performance monitoring |
| 4+ star rating | ≥ 4.5/5 | App Store & Play Store |

### 13.2 User Engagement KPIs

| Metric | Target | Measurement |
|--------|--------|-------------|
| Daily active users | 70% of total | Analytics |
| Session duration | > 10 minutes/day | Analytics |
| Feature adoption | > 50% use Quran | Analytics |
| User retention (30-day) | > 60% | Analytics |

### 13.3 Business KPIs

| Metric | Target | Measurement |
|--------|--------|-------------|
| User growth | 20% MoM | Analytics |
| Premium conversion | > 5% | In-app purchase data |
| User satisfaction | > 4.5 NPS | In-app surveys |

---

## Compliance Summary

| Category | Total Requirements | P0 (Must) | P1 (Should) | P2 (Could) |
|----------|-------------------|-----------|-------------|------------|
| Performance | 18 | 13 | 5 | 0 |
| Accuracy | 10 | 9 | 1 | 0 |
| Reliability | 15 | 12 | 3 | 0 |
| Security | 18 | 14 | 3 | 1 |
| Usability | 20 | 13 | 5 | 2 |
| Scalability | 11 | 2 | 7 | 2 |
| Compatibility | 13 | 8 | 4 | 1 |
| Maintainability | 16 | 11 | 4 | 1 |
| Operations | 15 | 11 | 4 | 0 |
| Backup | 9 | 5 | 4 | 0 |
| Cultural | 7 | 5 | 2 | 0 |
| Legal | 9 | 9 | 0 | 0 |
| **TOTAL** | **161** | **112** | **41** | **7** |

---

**Last reviewed:** 2025-11-10
**Status:** Approved for implementation
**Review cycle:** Monthly during development, quarterly post-launch
