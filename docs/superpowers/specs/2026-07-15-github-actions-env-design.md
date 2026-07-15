# Design Spec: Dynamic `.env` Generation in GitHub Actions

This design specifies how to configure the GitHub Actions workflow to securely create `.env` and `web/.env` files at build and deployment time on the self-hosted runner.

## 1. Resolved Database URL and Password
The user provided:
`DATABASE_URL="postgresql://postgres:It%4012345%40@localhost:5432/DB_CRM?schema=public"`

By decoding the URL-encoded characters (`%40` -> `@`), the password is resolved as:
- **DB_PASSWORD**: `It@12345@`

## 2. Environment Variables & GitHub Secrets
The following secrets will need to be configured in the GitHub Repository Settings (**Settings > Secrets and variables > Actions**):

| Secret Name | Value | Description |
|---|---|---|
| `DB_USER` | `postgres` | Database username |
| `DB_PASSWORD` | `It@12345@` | Decoded database password |
| `DB_NAME` | `DB_CRM` | Database name |
| `DB_PORT` | `5432` | Database port |
| `DATABASE_URL` | `postgresql://postgres:It%4012345%40@localhost:5432/DB_CRM?schema=public` | Complete database connection URL |
| `PORT_BE` | `8017` | Backend port |
| `PORT_FE` | `8080` | Frontend port |
| `MAIL_HOST` | `smtp.gmail.com` | SMTP Server Host |
| `MAIL_PORT` | `587` | SMTP Server Port |
| `SMTP_USER` | `boint99@gmail.com` | SMTP Username |
| `SMTP_PASS` | `wpbz ugje okmo kujr` | SMTP Password (App Password) |
| `JWT_ACCESS_SECRET` | `d384844321edc165126e4cc1a6048c9bd7afd00be2665c481a3a486fc90d8645` | JWT Access Secret |
| `JWT_EXPIRES_IN` | `5m` | JWT Access Expiry |
| `JWT_REFRESH_SECRET` | `d8c090768d02594e733aa94da701d98eeaff8c4582d05cb89a395cd5a234b59d` | JWT Refresh Secret |
| `JWT_REFRESH_EXPIRES_IN` | `7d` | JWT Refresh Expiry |

## 3. Workflow Steps Design

Both the `setup` and `deploy` jobs require the `.env` file:
- `setup` runs `npx prisma generate` which loads `.env` via `prisma.config.ts`.
- `deploy` runs `docker compose -f docker-compose.prod.yml up -d --build` which mounts/reads `.env`.

We will add a reusable step/command in both jobs after `Checkout repository`:

```yaml
      - name: Create .env files
        run: |
          cat << 'EOF' > .env
          DB_USER=${{ secrets.DB_USER }}
          DB_PASSWORD=${{ secrets.DB_PASSWORD }}
          DB_NAME=${{ secrets.DB_NAME }}
          DB_PORT=${{ secrets.DB_PORT }}
          DATABASE_URL="${{ secrets.DATABASE_URL }}"
          PORT_BE=${{ secrets.PORT_BE }}
          PORT_FE=${{ secrets.PORT_FE }}
          MAIL_HOST=${{ secrets.MAIL_HOST }}
          MAIL_PORT=${{ secrets.MAIL_PORT }}
          SMTP_USER=${{ secrets.SMTP_USER }}
          SMTP_PASS=${{ secrets.SMTP_PASS }}
          JWT_ACCESS_SECRET=${{ secrets.JWT_ACCESS_SECRET }}
          JWT_EXPIRES_IN=${{ secrets.JWT_EXPIRES_IN }}
          JWT_REFRESH_SECRET=${{ secrets.JWT_REFRESH_SECRET }}
          JWT_REFRESH_EXPIRES_IN=${{ secrets.JWT_REFRESH_EXPIRES_IN }}
          EOF
          
          # Run server.sh to update host IP in .env
          chmod +x server.sh
          ./server.sh
          
          # Create web/.env
          cat << 'EOF' > web/.env
          VITE_API_URL=/api
          EOF
```

## 4. Verification Plan
- **Pre-flight lint check**: Ensure no `.env` file is committed.
- **Workflow verification**: Trigger the Github Actions deployment and check if the `.env` creation steps complete successfully and the application builds and deploys.
