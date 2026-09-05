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
            <Table responsive hover className="mb-0 align-middle">
              <thead className="bg-light">
                <tr>
                  <th className="px-4 py-3 text-muted">Sync ID / Time</th>
                  <th className="py-3 text-muted text-end">Amount</th>
                  <th className="py-3 text-muted text-center">Status</th>
                  <th className="px-4 py-3 text-muted">System Note</th>
                </tr>
              </thead>
              <tbody>
                {queue.map((tx) => (
                  <tr key={tx.syncId}>
                    <td className="px-4 py-3">
                      <div
                        className="fw-medium text-secondary"
                        style={{ fontSize: "0.85rem" }}
                      >
                        {tx.syncId}
                      </div>
                      <div className="text-muted small">
                        {new Date(tx.timestamp).toLocaleString("en-IN")}
                      </div>
                    </td>
                    <td className="py-3 fw-bold text-end">
                      ₹{tx.amount.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3 text-center">
                      {getStatusBadge(tx.status)}
                    </td>
                    <td className="px-4 py-3 text-muted small text-danger">
                      {tx.error || "-"}
                    </td>
                  </tr>
                ))}
                {queue.length === 0 && (
                  <tr>
                    <td
                      colSpan="4"
                      className="text-center py-5 text-muted fw-medium"
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
