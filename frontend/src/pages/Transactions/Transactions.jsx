import {
  Container,
  Card,
  Table,
  Pagination,
  Badge,
  Alert,
  Spinner,
} from "react-bootstrap";
import { useTransactions } from "../../hooks/useTransactions";

const Transactions = () => {
  const { transactions, pagination, isLoading, error, loadTransactions } =
    useTransactions();

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      loadTransactions(newPage);
    }
  };

  // const getStatusBadge = (status) => {
  //   switch (status) {
  //     case "SUCCESS":
  //       return <Badge bg="success">Success</Badge>;
  //     case "SYNCED":
  //       return <Badge bg="info">Synced</Badge>;
  //     case "PENDING":
  //       return (
  //         <Badge bg="warning" text="dark">
  //           Pending
  //         </Badge>
  //       );
  //     case "FAILED":
  //       return <Badge bg="danger">Failed</Badge>;
  //     case "CONFLICT":
  //       return <Badge bg="danger">Conflict</Badge>;
  //     default:
  //       return <Badge bg="secondary">{status}</Badge>;
  //   }
  // };

  const getStatusBadge = (status, syncStatus) => {
    if (status === "FAILED" || syncStatus === "CONFLICT") {
      return <Badge bg="danger">Conflict / Failed</Badge>;
    }
    if (syncStatus === "SYNCED") {
      return <Badge bg="info">Synced</Badge>;
    }
    if (syncStatus === "PENDING") {
      return (
        <Badge bg="warning" text="dark">
          Pending Sync
        </Badge>
      );
    }
    return <Badge bg="success">Success</Badge>;
  };
  const formatNotes = (notesObj) => {
    if (!notesObj || typeof notesObj !== "object") return "-";
    return Object.entries(notesObj)
      .map(([denom, count]) => `₹${denom}×${count}`)
      .join(", ");
  };

  return (
    <Container className="py-5">
      <div className="mb-4">
        <h2 className="fw-bold mb-1">Transaction History</h2>
        <p className="text-muted mb-0">
          View all past withdrawals and sync statuses
        </p>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

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
                  <th className="px-4 py-3 text-muted">ID & Date</th>
                  <th className="py-3 text-muted text-end">Amount</th>
                  <th className="py-3 text-muted">Dispensed Notes</th>
                  <th className="py-3 text-muted text-end">Balance After</th>
                  <th className="px-4 py-3 text-muted text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx._id || tx.transactionId}>
                    <td className="px-4 py-3">
                      <div
                        className="fw-medium text-primary"
                        style={{ fontSize: "0.9rem" }}
                      >
                        {tx.transactionId}
                      </div>
                      <div className="text-muted small">
                        {new Date(tx.createdAt).toLocaleString("en-IN")}
                      </div>
                    </td>
                    <td className="py-3 fw-bold text-end">
                      ₹{tx.amount?.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3 text-muted small">
                      {formatNotes(tx.dispensedNotes)}
                    </td>
                    <td className="py-3 text-end text-muted">
                      ₹{tx.balanceAfter?.toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {getStatusBadge(tx.status)}
                    </td>
                  </tr>
                ))}
                {transactions.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center py-5 text-muted">
                      No transactions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          )}
        </Card.Body>

        {/* Pagination Controls */}
        {!isLoading && pagination.totalPages > 1 && (
          <Card.Footer className="bg-white border-top-0 pt-4 pb-3 d-flex justify-content-center">
            <Pagination className="mb-0">
              <Pagination.Prev
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
              />
              {[...Array(pagination.totalPages)].map((_, idx) => (
                <Pagination.Item
                  key={idx + 1}
                  active={idx + 1 === pagination.currentPage}
                  onClick={() => handlePageChange(idx + 1)}
                >
                  {idx + 1}
                </Pagination.Item>
              ))}
              <Pagination.Next
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
              />
            </Pagination>
          </Card.Footer>
        )}
      </Card>
    </Container>
  );
};

export default Transactions;
