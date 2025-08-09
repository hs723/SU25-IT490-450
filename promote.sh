#!/bin/bash

# Simple Database Promotion Script
# Usage: ./promote.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/config.conf"

LOG_FILE="$LOG_DIR/promote_$(date +%Y%m%d_%H%M%S).log"
mkdir -p "$LOG_DIR" "$BACKUP_DIR"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Get database configuration based on promotion path
get_source_db_config() {
    local promotion_path="$1"
    case "$promotion_path" in
        "dev-to-qa")
            echo "$DEV_DB_HOST:$DEV_DB_NAME:$DEV_DB_USER:$DEV_DB_PASS"
            ;;
        "qa-to-prod")
            echo "$QA_DB_HOST:$QA_DB_NAME:$QA_DB_USER:$QA_DB_PASS"
            ;;
    esac
}

get_target_db_config() {
    local promotion_path="$1"
    case "$promotion_path" in
        "dev-to-qa")
            echo "$QA_DB_HOST:$QA_DB_NAME:$QA_DB_USER:$QA_DB_PASS"
            ;;
        "qa-to-prod")
            echo "$PROD_DB_HOST:$PROD_DB_NAME:$PROD_DB_USER:$PROD_DB_PASS"
            ;;
    esac
}

# Create backup before promotion
create_backup() {
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_file="$BACKUP_DIR/qa_backup_$timestamp.sql"
    
    log "Creating backup of QA database..."
    mysqldump -h "$QA_DB_HOST" -u "$QA_DB_USER" -p"$QA_DB_PASS" "$QA_DB_NAME" > "$backup_file"
    
    if [[ $? -eq 0 ]]; then
        log "PASS: Backup created: $backup_file"
        gzip "$backup_file"
        echo "$backup_file.gz"
    else
        log "FAIL: Backup failed!"
        return 1
    fi
}

# Promote database from dev to qa
promote_database() {
    local promotion_path="$1"
    local source_config=$(get_source_db_config "$promotion_path")
    local target_config=$(get_target_db_config "$promotion_path")
    
    IFS=':' read -r src_host src_db src_user src_pass <<< "$source_config"
    IFS=':' read -r tgt_host tgt_db tgt_user tgt_pass <<< "$target_config"
    
    log "=== Starting Database Promotion: $promotion_path ==="
    log "Source: $src_host:$src_db"
    log "Target: $tgt_host:$tgt_db"
    log "=== Starting Database Promotion: DEV → QA ==="
    
    # Test connections
    log "Testing database connections..."
    mysql -h "$DEV_DB_HOST" -u "$DEV_DB_USER" -p"$DEV_DB_PASS" -e "SELECT 1" "$DEV_DB_NAME" >/dev/null 2>&1
    if [[ $? -ne 0 ]]; then
        log "FAIL: Cannot connect to DEV database"
        return 1
    fi
    
    mysql -h "$QA_DB_HOST" -u "$QA_DB_USER" -p"$QA_DB_PASS" -e "SELECT 1" "$QA_DB_NAME" >/dev/null 2>&1
    if [[ $? -ne 0 ]]; then
        log "FAIL: Cannot connect to QA database"
        return 1
    fi
    
    log "PASS: Database connections verified"
    
    # Create backup
    local backup_file=$(create_backup "$promotion_path")
    if [[ $? -ne 0 ]]; then
        return 1
    fi
    
    # Dump source database
    local temp_file="/tmp/${promotion_path//[-]/_}_dump_$(date +%s).sql"
    log "Dumping source database..."
    mysqldump -h "$src_host" -u "$src_user" -p"$src_pass" "$src_db" > "$temp_file"
    
    if [[ $? -ne 0 ]]; then
        log "FAIL: Failed to dump source database"
        rm -f "$temp_file"
        return 1
    fi
    
    # Import to target database
    log "Importing to target database..."
    mysql -h "$tgt_host" -u "$tgt_user" -p"$tgt_pass" "$tgt_db" < "$temp_file"
 
    if [[ $? -eq 0 ]]; then
        log "PASS: Database promotion completed successfully!"
        log "PASS: Backup available at: $backup_file"
        rm -f "$temp_file"
        return 0
    else
        log "FAIL: Failed to import to target database"
        rm -f "$temp_file"
        return 1
    fi
}

# Main execution
main() {
    local promotion_path="$1"
    
    # Default to dev-to-qa if no argument provided
    if [[ -z "$promotion_path" ]]; then
        promotion_path="dev-to-qa"
    fi
    
    case "$promotion_path" in
        "dev-to-qa")
            echo "Database Promotion System"
            echo "This will promote DEV database to QA"
            echo ""
            echo "Proceed? (y/n): "
            read -r confirm
            
            if [[ "$confirm" == "y" || "$confirm" == "Y" ]]; then
                if promote_database "$promotion_path"; then
                    echo ""
                    echo "SUCCESS: Promotion completed successfully!"
                    echo "Log file: $LOG_FILE"
                else
                    echo ""
                    echo "FAIL: Promotion failed! Check log: $LOG_FILE"
                    exit 1
                fi
            else
                echo "Promotion cancelled."
            fi
            ;;
        "qa-to-prod")
            echo "Database Promotion System"
            echo "This will promote QA database to PRODUCTION"
            echo ""
            echo "WARNING: This will update the PRODUCTION database!"
            echo "Proceed? (y/n): "
            read -r confirm
            
            if [[ "$confirm" == "y" || "$confirm" == "Y" ]]; then
                if promote_database "$promotion_path"; then
                    echo ""
                    echo "SUCCESS: Production promotion completed successfully!"
                    echo "Log file: $LOG_FILE"
                else
                    echo ""
                    echo "FAIL: Production promotion failed! Check log: $LOG_FILE"
                    exit 1
                fi
            else
                echo "Production promotion cancelled."
            fi
            ;;
        *)
            echo "Database Promotion System"
            echo ""
            echo "Usage: $0 [dev-to-qa|qa-to-prod]"
            echo ""
            echo "Examples:"
            echo "  $0              # Promotes dev to qa (default)"
            echo "  $0 dev-to-qa    # Promotes dev to qa"
            echo "  $0 qa-to-prod   # Promotes qa to production"
            echo ""
            echo "Available promotion paths:"
            echo "  dev-to-qa       Development → QA"
            echo "  qa-to-prod      QA → Production"
            exit 1
            ;;
    esac
}


# Run if executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi