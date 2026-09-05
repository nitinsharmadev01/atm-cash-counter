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
            <div className="table-responsive-container">
              <Table
                responsive="md"
                hover
                className="mb-0 align-middle custom-transaction-table"
              >
                <thead className="bg-light d-none d-md-table-header-group">
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
                    <tr
                      key={tx._id || tx.transactionId}
                      className="d-block d-md-table-row mb-3 mb-md-0 shadow-sm shadow-md-none p-3 p-md-0 border rounded bg-white"
                    >
                      {/* ID & Date */}
                      <td className="px-md-4 py-2 py-md-3 d-flex d-md-table-cell justify-content-between align-items-center border-0 border-bottom-md">
                        <span className="d-md-none fw-bold text-muted small">
                          ID & Date:
                        </span>
                        <div className="text-end text-md-start">
                          <div
                            className="fw-medium text-primary text-break font-monospace"
                            style={{ fontSize: "0.85rem", maxWidth: "180px" }}
                          >
                            {tx.transactionId}
                          </div>
                          <div
                            className="text-muted"
                            style={{ fontSize: "0.75rem" }}
                          >
                            {new Date(tx.createdAt).toLocaleString("en-IN")}
                          </div>
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="py-2 py-md-3 d-flex d-md-table-cell justify-content-between align-items-center border-0 border-bottom-md fw-bold text-end">
                        <span className="d-md-none fw-bold text-muted small">
                          Amount:
                        </span>
                        <span className="text-dark">
                          ₹{tx.amount?.toLocaleString("en-IN")}
                        </span>
                      </td>

                      {/* Dispensed Notes */}
                      <td className="py-2 py-md-3 d-flex d-md-table-cell justify-content-between align-items-center border-0 border-bottom-md text-muted small">
                        <span className="d-md-none fw-bold text-muted small">
                          Dispensed Notes:
                        </span>
                        <span className="text-end text-md-start">
                          {formatNotes(tx.dispensedNotes)}
                        </span>
                      </td>

                      {/* Balance After */}
                      <td className="py-2 py-md-3 d-flex d-md-table-cell justify-content-between align-items-center border-0 border-bottom-md text-muted small text-end">
                        <span className="d-md-none fw-bold text-muted small">
                          Balance After:
                        </span>
                        <span>₹{tx.balanceAfter?.toLocaleString("en-IN")}</span>
                      </td>

                      {/* Status */}
                      <td className="px-md-4 py-2 py-md-3 d-flex d-md-table-cell justify-content-between align-items-center border-0 text-md-center">
                        <span className="d-md-none fw-bold text-muted small">
                          Status:
                        </span>
                        <div>{getStatusBadge(tx.status)}</div>
                      </td>
                    </tr>
                  ))}

                  {transactions.length === 0 && (
                    <tr>
                      <td
                        colSpan="5"
                        className="text-center py-5 text-muted fw-medium border-0"
                      >
                        No transaction history found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
            // <div className="table-responsive-container">
            //   {/* Desktop & Tablet Table View */}
            //   <div className="d-none d-md-block">
            //     <Table responsive hover className="mb-0 align-middle">
            //       <thead className="bg-light">
            //         <tr>
            //           <th className="px-4 py-3 text-muted">ID & Date</th>
            //           <th className="py-3 text-muted text-end">Amount</th>
            //           <th className="py-3 text-muted">Dispensed Notes</th>
            //           <th className="py-3 text-muted text-end">
            //             Balance After
            //           </th>
            //           <th className="px-4 py-3 text-muted text-center">
            //             Status
            //           </th>
            //         </tr>
            //       </thead>
            //       <tbody>
            //         {transactions.map((tx) => (
            //           <tr key={tx._id || tx.transactionId}>
            //             <td className="px-4 py-3">
            //               <div
            //                 className="fw-medium text-primary"
            //                 style={{ fontSize: "0.9rem" }}
            //               >
            //                 {tx.transactionId}
            //               </div>
            //               <div className="text-muted small">
            //                 {new Date(tx.createdAt).toLocaleString("en-IN")}
            //               </div>
            //             </td>
            //             <td className="py-3 fw-bold text-end">
            //               ₹{tx.amount?.toLocaleString("en-IN")}
            //             </td>
            //             <td className="py-3 text-muted small">
            //               {formatNotes(tx.dispensedNotes)}
            //             </td>
            //             <td className="py-3 text-end text-muted">
            //               ₹{tx.balanceAfter?.toLocaleString("en-IN")}
            //             </td>
            //             <td className="px-4 py-3 text-center">
            //               {getStatusBadge(tx.status)}
            //             </td>
            //           </tr>
            //         ))}
            //       </tbody>
            //     </Table>
            //   </div>

            //   {/* Mobile Card View (Visible only on small screens) */}
            //   <div className="d-md-none">
            //     {transactions.map((tx) => (
            //       <div
            //         key={tx._id || tx.transactionId}
            //         className="card mb-3 shadow-sm border-0 p-3"
            //       >
            //         <div className="d-flex justify-content-between align-items-start mb-2">
            //           <div>
            //             <div
            //               className="fw-medium text-primary"
            //               style={{ fontSize: "0.85rem" }}
            //             >
            //               {tx.transactionId}
            //             </div>
            //             <div
            //               className="text-muted"
            //               style={{ fontSize: "0.75rem" }}
            //             >
            //               {new Date(tx.createdAt).toLocaleString("en-IN")}
            //             </div>
            //           </div>
            //           <div>{getStatusBadge(tx.status)}</div>
            //         </div>

            //         <hr className="my-2 text-muted opacity-25" />

            //         <div className="d-flex justify-content-between align-items-center mb-1">
            //           <span className="text-muted small">Amount:</span>
            //           <span className="fw-bold text-dark">
            //             ₹{tx.amount?.toLocaleString("en-IN")}
            //           </span>
            //         </div>

            //         <div className="d-flex justify-content-between align-items-center mb-1">
            //           <span className="text-muted small">Dispensed Notes:</span>
            //           <span className="text-muted small text-end">
            //             {formatNotes(tx.dispensedNotes)}
            //           </span>
            //         </div>

            //         <div className="d-flex justify-content-between align-items-center">
            //           <span className="text-muted small">Balance After:</span>
            //           <span className="text-muted small">
            //             ₹{tx.balanceAfter?.toLocaleString("en-IN")}
            //           </span>
            //         </div>
            //       </div>
            //     ))}
            //   </div>
            // </div>
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
