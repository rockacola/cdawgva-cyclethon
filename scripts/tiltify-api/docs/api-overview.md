# Tiltify V5 API Overview

Source: https://v5api.tiltify.com/api/public/openapi  
Full docs: https://developers.tiltify.com/docs/intro

---

## Authentication

All endpoints require a Bearer token. Obtain one via the **Client Credentials** OAuth flow:

```
POST https://v5api.tiltify.com/oauth/token
{
  "client_id": "...",
  "client_secret": "...",
  "grant_type": "client_credentials",
  "scope": "public"
}
```

Response includes `access_token` (expires in **7200s / 2 hours**). Pass it as:

```
Authorization: Bearer <access_token>
```

---

## Base URL

```
https://v5api.tiltify.com
```

All public endpoints are under `/api/public/...` — this prefix is part of each path, not the base URL.

---

## Endpoints (94 total)

### Users

| Method | Path                                  | Description                    |
| ------ | ------------------------------------- | ------------------------------ |
| GET    | `/users/{user_id}`                    | Get user by ID                 |
| GET    | `/users/by/slug/{slug}`               | Get user by slug               |
| GET    | `/users/{user_id}/campaigns`          | List user's campaigns          |
| GET    | `/users/{user_id}/teams`              | List user's teams              |
| GET    | `/users/{user_id}/integration_events` | List user's integration events |

### Campaigns

| Method | Path                                              | Description               |
| ------ | ------------------------------------------------- | ------------------------- |
| GET    | `/campaigns/{campaign_id}`                        | Get campaign by ID        |
| GET    | `/campaigns/by/slugs/{user_slug}/{campaign_slug}` | Get campaign by slug      |
| GET    | `/campaigns/{campaign_id}/donations`              | List donations            |
| GET    | `/campaigns/{campaign_id}/donor_leaderboard`      | Donor leaderboard         |
| GET    | `/campaigns/{campaign_id}/user_leaderboard`       | User leaderboard          |
| GET    | `/campaigns/{campaign_id}/milestones`             | List milestones           |
| GET    | `/campaigns/{campaign_id}/polls`                  | List polls                |
| GET    | `/campaigns/{campaign_id}/rewards`                | List rewards              |
| GET    | `/campaigns/{campaign_id}/schedules`              | List schedules            |
| GET    | `/campaigns/{campaign_id}/targets`                | List targets              |
| GET    | `/campaigns/{campaign_id}/supporting_campaigns`   | List supporting campaigns |
| GET    | `/campaigns/{campaign_id}/fitness_goals`          | List fitness goals        |
| GET    | `/campaigns/{campaign_id}/donation_matches`       | List donation matches     |

### Fundraising Events

| Method | Path                                                         | Description              |
| ------ | ------------------------------------------------------------ | ------------------------ |
| GET    | `/fundraising_events/{id}`                                   | Get event by ID          |
| GET    | `/fundraising_events/{id}/donations`                         | List donations           |
| GET    | `/fundraising_events/{id}/donor_leaderboard`                 | Donor leaderboard        |
| GET    | `/fundraising_events/{id}/user_leaderboard`                  | User leaderboard         |
| GET    | `/fundraising_events/{id}/team_leaderboard`                  | Team leaderboard         |
| GET    | `/fundraising_events/{id}/configured_leaderboard`            | Configured leaderboard   |
| GET    | `/fundraising_events/{id}/supporting_events`                 | List supporting events   |
| GET    | `/fundraising_events/{id}/fitness_goals`                     | Fitness goals            |
| GET    | `/fundraising_events/{id}/user_fitness_distance_leaderboard` | Fitness distance (users) |
| GET    | `/fundraising_events/{id}/user_fitness_time_leaderboard`     | Fitness time (users)     |
| GET    | `/fundraising_events/{id}/team_fitness_distance_leaderboard` | Fitness distance (teams) |
| GET    | `/fundraising_events/{id}/team_fitness_time_leaderboard`     | Fitness time (teams)     |

### Causes

| Method | Path                                        | Description             |
| ------ | ------------------------------------------- | ----------------------- |
| GET    | `/causes/{cause_id}`                        | Get cause by ID         |
| GET    | `/causes/{cause_id}/fundraising_events`     | List fundraising events |
| GET    | `/causes/{cause_id}/donor_leaderboard`      | Donor leaderboard       |
| GET    | `/causes/{cause_id}/user_leaderboard`       | User leaderboard        |
| GET    | `/causes/{cause_id}/team_leaderboard`       | Team leaderboard        |
| GET    | `/causes/{cause_id}/configured_leaderboard` | Configured leaderboard  |

### Facts

| Method | Path                                                 | Description              |
| ------ | ---------------------------------------------------- | ------------------------ |
| GET    | `/facts/{fact_id}`                                   | Get fact by ID           |
| GET    | `/facts/by/slugs/{slug}/{fact_slug}`                 | Get fact by slug         |
| GET    | `/facts/{fact_id}/donations`                         | List donations           |
| GET    | `/facts/{fact_id}/donation_matches`                  | List donation matches    |
| GET    | `/facts/{fact_id}/contributions`                     | List contributions       |
| GET    | `/facts/{fact_id}/milestones`                        | List milestones          |
| GET    | `/facts/{fact_id}/polls`                             | List polls               |
| GET    | `/facts/{fact_id}/rewards`                           | List rewards             |
| GET    | `/facts/{fact_id}/schedules`                         | List schedules           |
| GET    | `/facts/{fact_id}/targets`                           | List targets             |
| GET    | `/facts/{fact_id}/supporting_facts`                  | List supporting facts    |
| GET    | `/facts/{fact_id}/fitness_goals`                     | Fitness goals            |
| GET    | `/facts/{fact_id}/donor_leaderboard`                 | Donor leaderboard        |
| GET    | `/facts/{fact_id}/configured_leaderboard`            | Configured leaderboard   |
| GET    | `/facts/{fact_id}/user_leaderboard`                  | User leaderboard         |
| GET    | `/facts/{fact_id}/team_leaderboard`                  | Team leaderboard         |
| GET    | `/facts/{fact_id}/user_fitness_distance_leaderboard` | Fitness distance (users) |
| GET    | `/facts/{fact_id}/user_fitness_time_leaderboard`     | Fitness time (users)     |
| GET    | `/facts/{fact_id}/team_fitness_distance_leaderboard` | Fitness distance (teams) |
| GET    | `/facts/{fact_id}/team_fitness_time_leaderboard`     | Fitness time (teams)     |

### Teams

| Method | Path                              | Description         |
| ------ | --------------------------------- | ------------------- |
| GET    | `/teams/{team_id}`                | Get team by ID      |
| GET    | `/teams/by/slug/{slug}`           | Get team by slug    |
| GET    | `/teams/{team_id}/members`        | List team members   |
| GET    | `/teams/{team_id}/team_campaigns` | List team campaigns |

### Team Campaigns

| Method | Path                                                   | Description               |
| ------ | ------------------------------------------------------ | ------------------------- |
| GET    | `/team_campaigns/{id}`                                 | Get team campaign by ID   |
| GET    | `/team_campaigns/by/slugs/{team_slug}/{campaign_slug}` | Get by slug               |
| GET    | `/team_campaigns/{id}/donations`                       | List donations            |
| GET    | `/team_campaigns/{id}/milestones`                      | List milestones           |
| GET    | `/team_campaigns/{id}/polls`                           | List polls                |
| GET    | `/team_campaigns/{id}/rewards`                         | List rewards              |
| GET    | `/team_campaigns/{id}/schedules`                       | List schedules            |
| GET    | `/team_campaigns/{id}/targets`                         | List targets              |
| GET    | `/team_campaigns/{id}/supporting_campaigns`            | List supporting campaigns |
| GET    | `/team_campaigns/{id}/fitness_goals`                   | Fitness goals             |
| GET    | `/team_campaigns/{id}/donor_leaderboards`              | Donor leaderboards        |
| GET    | `/team_campaigns/{id}/user_leaderboards`               | User leaderboards         |

### Personal Campaigns

| Method | Path                                            | Description                 |
| ------ | ----------------------------------------------- | --------------------------- |
| GET    | `/personal-campaigns/{id}`                      | Get personal campaign by ID |
| GET    | `/personal-campaigns/{id}/contributions`        | List contributions          |
| GET    | `/personal-campaigns/{id}/milestones`           | List milestones             |
| GET    | `/personal-campaigns/{id}/polls`                | List polls                  |
| GET    | `/personal-campaigns/{id}/rewards`              | List rewards                |
| GET    | `/personal-campaigns/{id}/schedules`            | List schedules              |
| GET    | `/personal-campaigns/{id}/targets`              | List targets                |
| GET    | `/personal-campaigns/{id}/supporting_campaigns` | List supporting campaigns   |

### Auction Houses

| Method | Path                                                        | Description             |
| ------ | ----------------------------------------------------------- | ----------------------- |
| GET    | `/auction_houses/{id}`                                      | Get auction house by ID |
| GET    | `/auction_houses/by/cause/slugs/{cause_slug}/{slug}`        | Get by cause slug       |
| GET    | `/auction_houses/by/user/slugs/{user_slug}/{slug}`          | Get by user slug        |
| GET    | `/auction_houses/{id}/auction_items`                        | List auction items      |
| GET    | `/auction_houses/{id}/auction_items/{item_id}`              | Get auction item        |
| GET    | `/auction_houses/{id}/auction_items/{item_id}/auction_bids` | List bids               |

### Utilities

| Method | Path                               | Description            |
| ------ | ---------------------------------- | ---------------------- |
| GET    | `/current-user`                    | Get authenticated user |
| GET    | `/legacy-relays/{provider}/{uuid}` | Query donation relay   |

---

## Pagination

List endpoints use **cursor-based pagination**:

| Parameter | Description              |
| --------- | ------------------------ |
| `after`   | Cursor for next page     |
| `before`  | Cursor for previous page |
| `limit`   | Items per page           |

---

## Common Filter Parameters

| Parameter                              | Description               |
| -------------------------------------- | ------------------------- |
| `created_before` / `created_after`     | Filter by creation date   |
| `updated_before` / `updated_after`     | Filter by update date     |
| `completed_before` / `completed_after` | Filter by completion date |

---

## Key Schemas

| Schema             | Description                                             |
| ------------------ | ------------------------------------------------------- |
| `User`             | User profile (id, username, slug, avatar, social links) |
| `Campaign`         | Fundraising campaign                                    |
| `FundraisingEvent` | Top-level event (e.g. Cyclethon)                        |
| `Cause`            | Charitable cause / organisation                         |
| `Donation`         | Individual donation (amount, donor name, comment)       |
| `Money`            | `{ currency: string, value: string }`                   |
| `LeaderboardEntry` | Name + amount raised                                    |
| `Milestone`        | Campaign milestone                                      |
| `Reward`           | Donor reward/incentive                                  |
| `Poll`             | Active poll with options                                |
