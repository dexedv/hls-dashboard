#!/bin/bash
# HLS Dashboard - Update Script
# Usage: sudo bash update.sh
#
# This script performs an automated update:
# 1. Creates a database backup
# 2. Pulls latest Docker images
# 3. Rebuilds and restarts containers
# 4. Runs database migrations
# 5. Clears caches
# 6. Rolls back on failure

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration
COMPOSE_FILE="docker-compose.prod.yml"
if [ ! -f "$COMPOSE_FILE" ]; then
    COMPOSE_FILE="docker-compose.yml"
fi
BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/pre-update_${TIMESTAMP}.sql"

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Check if running as root or with docker permissions
if ! docker info > /dev/null 2>&1; then
    log_error "Cannot connect to Docker. Run with sudo or add user to docker group."
    exit 1
fi

echo ""
echo "========================================"
echo "  HLS Dashboard - Update"
echo "========================================"
echo ""

# Step 1: Create backup
log_info "Step 1/5: Creating database backup..."
mkdir -p "$BACKUP_DIR"

DB_CONTAINER=$(docker compose -f "$COMPOSE_FILE" ps -q postgres 2>/dev/null)
if [ -n "$DB_CONTAINER" ]; then
    DB_USER=$(docker compose -f "$COMPOSE_FILE" exec -T postgres printenv POSTGRES_USER 2>/dev/null || echo "hls")
    DB_NAME=$(docker compose -f "$COMPOSE_FILE" exec -T postgres printenv POSTGRES_DB 2>/dev/null || echo "hls_dashboard")

    if docker compose -f "$COMPOSE_FILE" exec -T postgres pg_dump -U "$DB_USER" "$DB_NAME" > "$BACKUP_FILE" 2>/dev/null; then
        BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
        log_info "Backup created: $BACKUP_FILE ($BACKUP_SIZE)"
    else
        log_warn "Could not create database backup. Continuing anyway..."
        BACKUP_FILE=""
    fi
else
    log_warn "PostgreSQL container not running. Skipping backup."
    BACKUP_FILE=""
fi

# Step 2: Pull latest images
log_info "Step 2/5: Pulling latest images..."
docker compose -f "$COMPOSE_FILE" pull || {
    log_warn "Could not pull images. Using local build."
}

# Step 3: Rebuild and restart
log_info "Step 3/5: Rebuilding and restarting containers..."
docker compose -f "$COMPOSE_FILE" build --no-cache app || {
    log_error "Build failed!"
    if [ -n "$BACKUP_FILE" ]; then
        log_info "Restoring from backup..."
        docker compose -f "$COMPOSE_FILE" exec -T postgres psql -U "$DB_USER" "$DB_NAME" < "$BACKUP_FILE"
    fi
    exit 1
}

docker compose -f "$COMPOSE_FILE" up -d || {
    log_error "Failed to start containers!"
    exit 1
}

# Wait for app container to be healthy
log_info "Waiting for application to start..."
sleep 10

# Step 4: Run migrations
log_info "Step 4/5: Running database migrations..."
docker compose -f "$COMPOSE_FILE" exec -T app php artisan migrate --force || {
    log_error "Migration failed!"
    if [ -n "$BACKUP_FILE" ]; then
        log_warn "Rolling back database..."
        docker compose -f "$COMPOSE_FILE" exec -T postgres psql -U "$DB_USER" "$DB_NAME" < "$BACKUP_FILE"
        log_info "Database restored from backup."
    fi
    exit 1
}

# Step 5: Clear caches
log_info "Step 5/5: Clearing caches..."
docker compose -f "$COMPOSE_FILE" exec -T app php artisan config:cache 2>/dev/null || true
docker compose -f "$COMPOSE_FILE" exec -T app php artisan route:cache 2>/dev/null || true
docker compose -f "$COMPOSE_FILE" exec -T app php artisan view:cache 2>/dev/null || true
docker compose -f "$COMPOSE_FILE" exec -T app php artisan event:cache 2>/dev/null || true

# Get current version
VERSION=$(docker compose -f "$COMPOSE_FILE" exec -T app php artisan tinker --execute="echo config('app.version');" 2>/dev/null || echo "unknown")

echo ""
echo "========================================"
log_info "Update completed successfully!"
log_info "Version: $VERSION"
if [ -n "$BACKUP_FILE" ]; then
    log_info "Backup saved at: $BACKUP_FILE"
fi
echo "========================================"
echo ""
