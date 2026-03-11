# Congress.gov API

Base URL: `https://api.congress.gov/v3`

Authentication is done via an API key passed as a query parameter: `?api_key=YOUR_KEY`

## Endpoints Used

### Members

- `GET /member` — List members of Congress
- `GET /member/{bioguideId}` — Get a specific member by ID

### Bills

- `GET /bill` — List bills
- `GET /bill/{congress}/{billType}/{billNumber}` — Get a specific bill
- `GET /bill/{congress}/{billType}/{billNumber}/summaries` — Get bill summaries
- `GET /bill/{congress}/{billType}/{billNumber}/cosponsors` — Get bill cosponsors
- `GET /bill/{congress}/{billType}/{billNumber}/actions` — Get bill actions

## Notes

- Responses are paginated; use `offset` and `limit` query params.
- Rate limits apply — see [Congress.gov API docs](https://api.congress.gov/) for details.
