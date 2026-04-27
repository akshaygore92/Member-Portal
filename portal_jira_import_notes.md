# Portal Jira Import Notes

## Files
- `portal_jira_import.csv`: 71 Jira-ready backlog records
- `generate_jira_csv.py`: source script to regenerate the CSV

## Backlog Shape
- 12 epics
- 59 stories

## CSV Columns
- `Issue Id`: external reference id for import tracking
- `Issue Type`: `Epic` or `Story`
- `Summary`: issue summary
- `Epic Name`: populate for epic rows
- `Epic Link`: story rows point to the epic name value
- `Description`: implementation-oriented story detail
- `Acceptance Criteria`: multi-line acceptance criteria
- `Priority`: suggested priority
- `Labels`: filter tags
- `Components`: suggested functional area
- `Story Points`: initial estimate

## Suggested Jira CSV Mapping
- Map `Issue Type` to Jira issue type
- Map `Summary` to Summary
- Map `Description` to Description
- Map `Acceptance Criteria` to a custom field or append into Description if needed
- Map `Epic Name` to Epic Name
- Map `Epic Link` to Epic Link for stories
- Map `Priority` to Priority
- Map `Labels` to Labels
- Map `Components` to Components
- Map `Story Points` to Story Points if your Jira project uses it

## Notes
- If your Jira project does not expose `Epic Link`, import epics first and then relink stories manually or via automation.
- If your Jira project uses parent/child hierarchy instead of `Epic Link`, treat `Issue Id` as the external id and remap relationships in your preferred import flow.
