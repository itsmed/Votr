# PollUs

A full stack application using the [Congress.gov](https://api.congress.gov/) API
which allows users to search for congressional representatives, bills, view
details, and vote on them.

## Features

- Users can input their address and find their senators and congressional
  representatives.
- Users can search for bills and view details about them, including the bill's
  summary, sponsors, and voting history.
- Users can vote on bills and see how their votes compare to the overall voting
  history of their senators and congressional representatives.
- Users can swipe through bills and vote on them in a Tinder-like interface.
- Users can view their voting history and see how their votes align with their
  representatives' votes.
- Users can receive notifications about upcoming votes and important legislative
  events.
- Users can share their voting history and opinions on social media platforms.
- Users can filter bills by category, date, and other criteria to find relevant
  legislation.
- Users can save bills to a favorites list for easy access and tracking.
- Users can receive personalized recommendations for bills to vote on based on
  their voting history and preferences.
- Users can participate in discussions and forums related to bills and legislation to engage with other users and share their opinions.
- Users can access educational resources and information about the legislative process to better understand how Congress works and how they can get involved.
- Users can track the progress of bills they are interested in and receive updates on their status.
- Users can view detailed profiles of their representatives, including their voting records, stances on key issues, and contact information to better understand their representatives and hold them accountable.
- Users can provide feedback and suggestions for improving the application and its features to help shape the future development of PollUs and ensure that it meets the needs and preferences of its users.

## Technologies Used
- Frontend: Typescript, React, Tailwind CSS
- Backend: Typescript/Node.js, Express
- Testing: Jest, React Testing Library
- API: Congress.gov API
- Storage: PostgreSQL

## Project Structure

```
pollus/
| docs/
│   ├── api/
│   │   ├── congress.gov.md
│   │   └── README.md
│   ├── architecture.md
│   └── README.md
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── app.ts
│   │   └── server.ts
│   ├── tests/
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── App.tsx
│   │   └── index.tsx
│   ├── tests/
│   ├── package.json
│   └── tsconfig.json
├── README.md
|-- claude.md
└── .gitignore
```

## docs folder
The `docs` folder contains documentation for the project, including API
documentation, architectural decisions, and any other relevant information. It
is organized into subfolders for different types of documentation. Keep this
documentation up-to-date as the project evolves, and ensure that it is clear and
comprehensive for future reference and onboarding. Also any learnings
accumulated by Claude during the development process should be documented here
for future reference.

## Coding conventions

- Use camelCase for variable and function names.
- Use PascalCase for component names.
- Use descriptive names for variables and functions.
- Use consistent indentation (2 spaces).
- Use single quotes for strings.
- Use semicolons at the end of statements.
- Use JSDoc comments for functions and components.
- Use PropTypes for type checking in React components.
- Use environment variables for sensitive information (e.g., API keys).
- Use ESLint and Prettier for code formatting and linting on save.

## Error handling

- Handle API errors gracefully and display user-friendly error messages.
- Validate user input and provide feedback for invalid entries.
- Implement error boundaries in React to catch and handle errors in the UI.
- Log errors to the console for debugging purposes in development mode.
- Implement retry logic for failed API calls, with exponential backoff.
- Use try-catch blocks for asynchronous operations and API calls.
- Provide fallback UI for components that fail to load or render properly.
- Ensure that the application does not crash due to unhandled exceptions and
  provides a smooth user experience even in case of errors.
- implement a global error handling mechanism in the backend to catch and log errors,
  and return appropriate HTTP status codes and messages to the frontend.
- Use a centralized error handling middleware in Express to manage errors
  consistently across the application.
- Implement circuit breaker pattern for external API calls to prevent cascading
  failures in case of API downtime or issues.
- Document error handling strategies and patterns used in the application for
  future reference and onboarding.
- Include examples and use cases to illustrate error handling approaches.
- Keep documentation up-to-date with any changes to error handling logic or
  implementation details.

## API Integration

- First check postgres for any cached data before making API calls to the Congress.gov API.
- Use the Congress.gov API to fetch data about representatives, bills, and voting
  history when there is a cache miss.
- All queries to the Congress.gov API should be cached  in postgres
  with an appropriate expiration time to reduce the number of API calls and improve
  performance.

## Models

- User: Represents a user of the application, including their address and voting
  history.
- Representative: Represents a congressional representative, including their name,
  party affiliation, a photo url, and contact information.
- Bill: Represents a bill, including its title, summary, sponsors, and voting
  history.
- Vote: Represents a user's vote on a bill, including the bill ID, user ID,
  and vote value (e.g., "Yea", "Nay", "Abstain").

