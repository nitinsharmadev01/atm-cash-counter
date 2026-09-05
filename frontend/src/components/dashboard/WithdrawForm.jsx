import { useState } from "react";
import { Card, Form, Button, Spinner, Modal } from "react-bootstrap";
import { v4 as uuidv4 } from "uuid";
import { transactionDB } from "../../db/transactions";
import { withdrawAmount } from "../../services/atmApi";
import toast from "react-hot-toast";
import { useSyncStore } from "../../store/syncStore";

const WithdrawForm = ({ totalBalance, isOffline, onWithdrawSuccess }) => {
  const updatePendingCount = useSyncStore((state) => state.updatePendingCount);

  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const parsedAmount = parseInt(amount, 10);
  const isAmountEntered = amount !== "";

  const isInvalidMultiple = isAmountEntered && parsedAmount % 50 !== 0;
  const isInsufficient = isAmountEntered && parsedAmount > totalBalance;
  const isZeroOrNegative = isAmountEntered && parsedAmount <= 0;

  const isFormValid =
    isAmountEntered &&
    !isInvalidMultiple &&
    !isInsufficient &&
    !isZeroOrNegative;

  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    setIsLoading(true);
    setSuccessData(null);

    try {
      if (isOffline) {
        // Offline Flow
        const syncId = "TXN-" + uuidv4().substring(0, 8).toUpperCase();
        await transactionDB.queueTransaction({ amount: parsedAmount, syncId });

        await updatePendingCount();
        toast.success("Transaction queued for offline sync");

        // Constructing result object for offline mode matching your API format
        const offlineResult = {
          amountWithdrawn: parsedAmount,
          status: "QUEUED (Offline)",
          transactionId: syncId,
          notesDispensed: { "Offline Note": "Calculated on sync" },
          numberOfNotesDispensed: "-",
          totalValueOfDispensedNotes: parsedAmount,
          previousBalance: totalBalance,
          updatedBalance: totalBalance - parsedAmount,
        };

        setSuccessData(offlineResult);
        setShowModal(true);
      } else {
        // Online Flow - API Response Handling
        const response = await withdrawAmount({ amount: parsedAmount });
        toast.success("Cash dispensed successfully!");
        console.log("response", response);
        // response.data will contain your exact API properties:
        // { amountWithdrawn, notesDispensed, numberOfNotesDispensed, previousBalance, status, totalValueOfDispensedNotes, transactionId, updatedBalance }
        setSuccessData(response.data);
        setShowModal(true);

        // onWithdrawSuccess(); // Refresh inventory
      }
      setAmount("");
    } catch (err) {
      console.error("Withdrawal failed", err);
      toast.error(err.response?.data?.message || "Withdrawal failed.");
    } finally {
      setIsLoading(false);
    }
  };
  console.log("successData", successData);
  return (
    <>
      <Card className="border-0 shadow-sm h-100">
        <Card.Header className="bg-white border-bottom py-3">
          <h5 className="mb-0 fw-bold">Withdraw Cash</h5>
        </Card.Header>
        <Card.Body className="p-4">
          <Form onSubmit={handleWithdraw}>
            <Form.Group className="mb-4">
              <Form.Label className="fw-semibold text-muted small text-uppercase">
                Amount (₹)
              </Form.Label>
              <Form.Control
                type="number"
                size="lg"
                placeholder="Enter amount (Multiple of 50)"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={isLoading}
                isInvalid={
                  isInvalidMultiple || isInsufficient || isZeroOrNegative
                }
                autoFocus
              />

              <Form.Control.Feedback type="invalid">
                {isInvalidMultiple && "Amount must be a multiple of ₹50."}
                {isInsufficient && "Insufficient ATM balance."}
                {isZeroOrNegative && "Please enter a valid positive amount."}
              </Form.Control.Feedback>
            </Form.Group>

            <div className="d-flex flex-wrap gap-2 mb-4">
              {[500, 1000, 2000, 5000].map((val) => (
                <Button
                  key={val}
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => setAmount(val.toString())}
                  disabled={isLoading}
                >
                  +₹{val}
                </Button>
              ))}
            </div>

            <Button
              variant="primary"
              size="lg"
              className="w-100 fw-bold d-flex justify-content-center align-items-center gap-2"
              type="submit"
              disabled={isLoading || !isFormValid}
            >
              {isLoading ? (
                <>
                  <Spinner animation="border" size="sm" /> Processing...
                </>
              ) : (
                "Dispense Cash"
              )}
            </Button>
          </Form>
        </Card.Body>
      </Card>

      {/* === SECTION 6: WITHDRAWAL RESULT MODAL (Online & Offline) === */}
      {successData && (
        <Modal show={showModal} onHide={() => setShowModal(false)} centered>
          <Modal.Header closeButton className="border-0 pb-0">
            <Modal.Title className="fw-bold text-success fs-5">
              🎉 Withdrawal Successful
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="pt-2">
            <div className="p-3 bg-light rounded border mb-3">
              <div className="d-flex justify-content-between mb-2 small text-muted">
                <span>Transaction ID:</span>
                <span className="fw-medium text-dark">
                  {successData.transactionId}
                </span>
              </div>
              <div className="d-flex justify-content-between mb-2 small text-muted">
                <span>Status:</span>
                <span className="badge bg-success">{successData.status}</span>
              </div>
              <div className="d-flex justify-content-between mb-2 small text-muted">
                <span>Amount Withdrawn:</span>
                <span className="fw-bold text-dark">
                  ₹{successData.amountWithdrawn?.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <h6 className="fw-bold small text-uppercase text-muted mb-2">
              Dispensed Notes Breakdown:
            </h6>
            <div className="d-flex flex-wrap gap-2 mb-3">
              {successData.notesDispensed &&
              typeof successData.notesDispensed === "object" ? (
                Object.entries(successData.notesDispensed).map(
                  ([denom, count]) => (
                    <div
                      key={denom}
                      className="badge bg-white text-dark border px-3 py-2 shadow-sm"
                    >
                      ₹{denom} × {count}
                    </div>
                  ),
                )
              ) : (
                <span className="text-muted small">
                  Notes will sync upon reconnection
                </span>
              )}
            </div>

            <div className="bg-white p-3 rounded border small">
              <div className="d-flex justify-content-between mb-1">
                <span className="text-muted">Total Notes Dispensed:</span>
                <span className="fw-semibold">
                  {successData.numberOfNotesDispensed}
                </span>
              </div>
              <div className="d-flex justify-content-between mb-1">
                <span className="text-muted">Total Value of Notes:</span>
                <span className="fw-semibold">
                  ₹
                  {successData.totalValueOfDispensedNotes?.toLocaleString(
                    "en-IN",
                  )}
                </span>
              </div>
              <hr className="my-2" />
              <div className="d-flex justify-content-between mb-1">
                <span className="text-muted">Previous Balance:</span>
                <span>
                  ₹{successData.previousBalance?.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted fw-bold">Updated Balance:</span>
                <span className="fw-bold text-primary">
                  ₹{successData.updatedBalance?.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer className="border-0 pt-0">
            <Button
              variant="dark"
              className="w-100"
              onClick={() => {
                setShowModal(false);
                onWithdrawSuccess(); // Refresh inventory after closing modal
              }}
            >
              Close & Continue
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </>
  );
};

export default WithdrawForm;
