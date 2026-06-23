# Speckit Constitution

## System Standards

### SS1: Specification Quality
- All specifications must be complete, unambiguous, and testable
- Requirements must map to implementation and tests
- No implementation details in specifications

### SS2: Traceability
- Every functional requirement must map to at least one code location
- Every acceptance criterion must map to at least one test method
- Traceability matrix must be maintained

### SS3: Documentation
- All changes must be documented
- Knowledge base must be updated after implementation
- Change summaries must be generated

### SS4: Security
- Passwords must be hashed before storage
- Session tokens must be secure (HttpOnly, Secure flags)
- User data must be encrypted at rest

### SS5: Performance
- API calls must complete within specified time limits
- Page load times must meet requirements
- System must handle concurrent users

### SS6: Testing
- All code must have tests
- Tests must pass before deployment
- Edge cases must be covered

### SS7: Code Quality
- Code must follow project conventions
- Code must be reviewed before merge
- Linting must pass

### SS8: JIRA Integration
- Acceptance criteria from JIRA must be preserved verbatim
- Never rephrase, reorder, or summarize JIRA ACs
- Source annotations must be included

### SS9: Branch Management
- Features must be developed on feature branches
- Branches must follow naming conventions
- Merges must be via pull requests

### SS10: Data Integrity
- No duplicate records
- Foreign key relationships must be maintained
- Data validation must be enforced

### SS11: User Experience
- Error messages must be user-friendly
- Forms must provide clear feedback
- Loading states must be indicated

### SS12: Accessibility
- Touch targets must be at least 44px
- Color contrast must meet WCAG standards
- Screen readers must be supported

### SS13: Mobile First
- Design must work on mobile first
- Responsive design for larger screens
- Performance on mobile must be acceptable

### SS14: Internationalization
- Text must be externalized
- Date/time formats must be localized
- Currency must be localized

### SS15: Error Handling
- Errors must be logged
- Users must see helpful error messages
- System must recover gracefully

### SS16: Requirement Coverage
- All requirements must be implemented
- No requirements can be skipped without justification
- Gaps must be documented

### SS17: Graceful Degradation
- External dependencies must have fallbacks
- System must work without optional integrations
- No hard failures on missing optional features
