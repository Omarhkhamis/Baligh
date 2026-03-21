`backfill-legal-reports.mjs` creates missing `LegalReport` rows for existing `AnalysisLog` rows.

Examples:

```bash
node --env-file=.env ./scripts/backfill-legal-reports.mjs --dry-run
node --env-file=.env ./scripts/backfill-legal-reports.mjs --dry-run --all
node --env-file=.env ./scripts/backfill-legal-reports.mjs --risk-levels=HIGH,CRITICAL
node --env-file=.env ./scripts/backfill-legal-reports.mjs --analysis-id=<analysis-log-id>
```
