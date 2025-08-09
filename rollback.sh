#!/bin/bash

# Simple Database Rollback Script
# Usage: ./rollback.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/config.conf"

LOG_FILE="$LOG_DIR/rollback_$(date +%Y%m%d_%H%M%S).log"
mkdir -p "$LOG_DIR"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# List available backups
list_backups() {
    echo "Available backups:"
    echo ""
    local counter=1
    find "$BACKUP_DIR" -name "*.sql.gz" | sort -r | while read backup; do
        local size=$(du -h "$backup" | cut -f1)
        local date=$(basename "$backup" | grep -o '[0-9]\{8\}_[0-9]\{6\}')
        echo "$counter. $backup ($size) - $date"
        ((counter++))
    done
}

# Restore backup
restore_backup() {
    local backup_file="$1"
    
    if [[ ! -f "$backup_file" ]]; then
        log "FAIL: Backup file not found: $backup_file"
        return 1
    fi
    
    log "=== Starting Database Restore ==="
    log "Restoring from: $backup_file"
    
    # Test QA connection
    mysql -h "$QA_DB_HOST" -u "$QA_DB_USER" -p"$QA_DB_PASS" -e "SELECT 1" "$QA_DB_NAME" >/dev/null 2>&1
    if [[ $? -ne 0 ]]; then
        log "FAIL: Cannot connect to QA database"
        return 1
    fi
    
    # Restore backup
    log "Restoring backup to QA database..."
    zcat "$backup_file" | mysql -h "$QA_DB_HOST" -u "$QA_DB_USER" -p"$QA_DB_PASS" "$QA_DB_NAME"
    
    if [[ $? -eq 0 ]]; then
        log "PASS: Database restore completed successfully!"
        return 0
    else
        log "FAIL: Database restore failed!"
        return 1
    fi
}

# Main execution
main() {
    echo "Simple Database Rollback System"
    echo ""
    
    list_backups
    echo ""
    echo "Enter backup file path to restore (or 'q' to quit): "
    read -r backup_choice
    
    if [[ "$backup_choice" == "q" ]]; then
        echo "Rollback cancelled."
        exit 0
    fi
    
    if [[ -f "$backup_choice" ]]; then
        echo ""
        echo "WARNING: This will overwrite the QA database!"
        echo "Proceed? (y/n): "
        read -r confirm
        
        if [[ "$confirm" == "y" || "$confirm" == "Y" ]]; then
            if restore_backup "$backup_choice"; then
                echo ""
                echo "SUCCESS: Rollback completed successfully!"
                echo "Log file: $LOG_FILE"
            else
                echo ""
                echo "FAIL: Rollback failed! Check log: $LOG_FILE"
                exit 1
            fi
        else
            echo "Rollback cancelled."
        fi
    else
        echo "FAIL: Invalid backup file path"
        exit 1
    fi
}

# Run if executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi