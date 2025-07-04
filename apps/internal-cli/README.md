# Total TypeScript Internal CLI

This CLI provides various tools for managing video production workflows and database operations.

## Database Dump Command

The `dump-database` command allows you to create a backup of a remote PostgreSQL database using `pg_dump`.

### Usage

```bash
# Basic usage
pnpm cli dump-database

# Basic usage only (no aliases)
pnpm cli dump-database
```

### Required Environment Variables

- `WRITTEN_CONTENT_DATABASE_URL`: PostgreSQL connection URL in the format `postgresql://username:password@host:port/database`
- `WRITTEN_CONTENT_DB_BACKUP_FILE_PATH`: Local file path where the backup should be saved

### Environment File Example

Add to the **root `.env` file** (not package-specific):

```bash
WRITTEN_CONTENT_DATABASE_URL=postgresql://myuser:mypass@db.example.com:5432/myapp_production
WRITTEN_CONTENT_DB_BACKUP_FILE_PATH=/path/to/backup.dump
```

### Example

```bash
# Set environment variables and run the command
WRITTEN_CONTENT_DATABASE_URL="postgresql://user:pass@db.example.com:5432/production" \
WRITTEN_CONTENT_DB_BACKUP_FILE_PATH="/backups/$(date +%Y%m%d_%H%M%S)_production.dump" \
pnpm cli dump-database
```

### Features

- **URL Parsing**: Automatically parses PostgreSQL connection URLs
- **Secure**: Uses environment variables for credentials (PGPASSWORD)
- **Compressed Format**: Uses `pg_dump -Fc` for efficient compressed backups
- **Effect Integration**: Follows Effect-TS patterns with proper error handling and logging
- **Shared Utilities**: Uses `execAsync` from the shared package for consistent command execution
- **Tracing**: Includes OpenTelemetry tracing for observability

### Requirements

- `pg_dump` must be installed and available in PATH
- Network access to the target database
- Appropriate PostgreSQL user permissions for database access

### Error Handling

The command provides clear error messages for common issues:
- Missing environment variables
- Invalid database URLs
- Connection failures
- Permission issues
- Missing pg_dump binary

### Command Format

The generated `pg_dump` command follows this pattern:

```bash
pg_dump -h <host> -p <port> -U <username> -d <database> -Fc > <backup_file>
```

Where:
- `-h`: Database host
- `-p`: Database port
- `-U`: Database username  
- `-d`: Database name
- `-Fc`: Custom format (compressed)
- `>`: Redirect output to backup file
- `PGPASSWORD`: Environment variable for password authentication