import { useState, useEffect } from "react";
import {
  Container,
  Card,
  Table,
  Badge,
  Button,
  Alert,
  Spinner,
} from "react-bootstrap";
import { transactionDB } from "../../db/transactions";
import { useSyncManager } from "../../hooks/useSyncManager";
import { useNetworkStore } from "../../store/networkStore";

const SyncQueue = () => {
  const [queue, setQueue] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const { isSyncing, processQueue } = useSyncManager();
  const isOffline = useNetworkStore((state) => state.isOffline);

  const loadQueue = async () => {
    setIsLoading(true);
    const data = await transactionDB.getAllQueuedTransactions();
    setQueue(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadQueue();
  }, [isSyncing]); // Reload queue automatically after a sync attempt

  const handleManualSync = async () => {
    await processQueue();
    await loadQueue();
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge bg="warning" text="dark">
            Pending Sync
          </Badge>
        );
      case "CONFLICT":
        return <Badge bg="danger">Inventory Conflict</Badge>;
      case "FAILED":
        return <Badge bg="danger">Network Failed</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  return (
    <Container className="py-5">
      <div className="mb-4 d-flex justify-content-between align-items-end">
        <div>
          <h2 className="fw-bold mb-1">Synchronization Queue</h2>
          <p className="text-muted mb-0">
            Manage offline transactions waiting for server validation
          </p>
        </div>
        <Button
          size="sm"
          variant="primary"
          onClick={handleManualSync}
          disabled={isOffline || isSyncing || queue.length === 0}
        >
          {isSyncing ? (
            <>
              <Spinner
                as="span"
                animation="border"
                size="sm"
                className="me-2"
              />{" "}
              Syncing...
            </>
          ) : (
            "Force Sync Now"
          )}
        </Button>
      </div>

      {isOffline && (
        <Alert variant="warning" className="fw-semibold">
          Network disconnected. Transactions will automatically synchronize when
          connection is restored.
        </Alert>
      )}

      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          {isLoading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : (
            <Table
              responsive="md"
              hover
              className="mb-0 align-middle custom-sync-table"
            >
              <thead className="bg-light d-none d-md-table-header-group">
                <tr>
                  <th className="px-4 py-3 text-muted">Sync ID / Time</th>
                  <th className="py-3 text-muted text-end">Amount</th>
                  <th className="py-3 text-muted text-center">Status</th>
                  <th className="px-4 py-3 text-muted">System Note</th>
                </tr>
              </thead>
              <tbody>
                {queue.map((tx) => (
                  <tr
                    key={tx.syncId}
                    className="d-block d-md-table-row mb-3 mb-md-0 shadow-sm shadow-md-none p-3 p-md-0 border rounded bg-white"
                  >
                    {/* Sync ID & Time */}
                    <td className="px-md-4 py-2 py-md-3 d-flex d-md-table-cell justify-content-between align-items-center border-0 border-bottom-md">
                      <span className="d-md-none fw-bold text-muted small">
                        Sync ID / Time:
                      </span>
                      <div className="text-end text-md-start">
                        <div
                          className="fw-medium text-secondary text-break font-monospace"
                          style={{ fontSize: "0.8rem", maxWidth: "200px" }}
                        >
                          {tx.syncId}
                        </div>
                        <div
                          className="text-muted"
                          style={{ fontSize: "0.75rem" }}
                        >
                          {new Date(tx.timestamp).toLocaleString("en-IN")}
                        </div>
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="py-2 py-md-3 d-flex d-md-table-cell justify-content-between align-items-center border-0 border-bottom-md fw-bold text-end">
                      <span className="d-md-none fw-bold text-muted small">
                        Amount:
                      </span>
                      <span>₹{tx.amount.toLocaleString("en-IN")}</span>
                    </td>

                    {/* Status */}
                    <td className="py-2 py-md-3 d-flex d-md-table-cell justify-content-between align-items-center border-0 border-bottom-md text-md-center">
                      <span className="d-md-none fw-bold text-muted small">
                        Status:
                      </span>
                      <div>{getStatusBadge(tx.status)}</div>
                    </td>

                    {/* System Note */}
                    <td className="px-md-4 py-2 py-md-3 d-flex d-md-table-cell justify-content-between align-items-center border-0 text-danger small">
                      <span className="d-md-none fw-bold text-muted small">
                        System Note:
                      </span>
                      <span className="text-end text-md-start">
                        {tx.error || "-"}
                      </span>
                    </td>
                  </tr>
                ))}
                {queue.length === 0 && (
                  <tr>
                    <td
                      colSpan="4"
                      className="text-center py-5 text-muted fw-medium border-0"
                    >
                      Queue is empty. All transactions are synchronized.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default SyncQueue;
