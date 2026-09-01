-- ==============================================================================
-- InfraPulse Database Cleanup Script
-- Removes synthetic test hosts and orphan records generated during test runs
-- ==============================================================================

BEGIN;

DELETE FROM hosts 
WHERE hostname IN ('offline-flush-host', 'security-test-node', 'timestamp-audit-node')
   OR id IN ('offline-flush-host', 'security-test-node', 'timestamp-audit-node')
   OR hostname ILIKE 'test-%'
   OR hostname ILIKE 'mock-%'
   OR hostname ILIKE 'audit-%';

-- Move ubuntu-server-01 to PDU-B1 (Feed B) to establish dual-feed balance
UPDATE power_config 
SET pdu_id = 2,
    pdu_outlet = 'Outlet-02'
WHERE host_id = 'ubuntu-server-01';

COMMIT;

-- Verification output
SELECT h.id, h.hostname, h.os_type, h.ip_address, p.name AS pdu_name, p.feed AS pdu_feed
FROM hosts h
LEFT JOIN power_config pc ON pc.host_id = h.id
LEFT JOIN pdu p ON p.id = pc.pdu_id
ORDER BY h.hostname;
