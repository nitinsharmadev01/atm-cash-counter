import { useState } from "react";
import { Card, Form, Button, Alert, Spinner } from "react-bootstrap";
import { v4 as uuidv4 } from "uuid";
import toast from "react-hot-toast";
import { withdrawAmount } from "../../services/atmApi";
import { transactionDB } from "../../db/transactions";

const WithdrawForm = ({ totalBalance, isOffline, onWithdrawSuccess }) => {
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successData, setSuccessData] = useState(null);

  // === REAL-TIME VALIDATION LOGIC ===
  const parsedAmount = parseInt(amount, 10);
  const isAmountEntered = amount !== "";

  // Real-time checks
  const isInvalidMultiple = isAmountEntered && parsedAmount % 50 !== 0;
  const isInsufficient = isAmountEntered && parsedAmount > totalBalance;
  const isZeroOrNegative = isAmountEntered && parsedAmount <= 0;

  // Button tabhi enable hoga jab saari conditions pass hongi
  const isFormValid =
    isAmountEntered &&
    !isInvalidMultiple &&
    !isInsufficient &&
    !isZeroOrNegative;

  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (!isFormValid) return; // Extra safety check

    setIsLoading(true);
    setSuccessData(null);

    try {
      if (isOffline) {
        // Offline Flow
        const syncId = "TXN-" + uuidv4().substring(0, 8).toUpperCase();
        await transactionDB.queueTransaction({ amount: parsedAmount, syncId });

        toast.success("Transaction queued for offline sync");
        setSuccessData({
          amountWithdrawn: parsedAmount,
          status: "QUEUED (Offline)",
        });
      } else {
        // Online Flow
        const response = await withdrawAmount({ amount: parsedAmount });
        toast.success("Cash dispensed successfully!");
        setSuccessData(response.data);
        onWithdrawSuccess(); // Inventory table ko refresh karne ke liye
      }
      setAmount(""); // Input clear karein
    } catch (err) {
      // Axios interceptor khud global error toast dikha dega, so no local error state needed.
      console.error("Withdrawal failed", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-0 shadow-sm h-100">
      <Card.Header className="bg-white border-bottom py-3">
        <h5 className="mb-0 fw-bold">Withdraw Cash</h5>
      </Card.Header>
      <Card.Body className="p-4">
        {successData && (
          <Alert
            variant={
              successData.status?.includes("QUEUED") ? "warning" : "success"
            }
          >
            <Alert.Heading className="h6 fw-bold mb-1">
              Withdrawal Status
            </Alert.Heading>
            <p className="mb-0 small">
              Amount: ₹{successData.amountWithdrawn} <br />
              Status: {successData.status}
            </p>
          </Alert>
        )}

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
              onChange={(e) => {
                setAmount(e.target.value);
                setSuccessData(null); // Type karte hi purana success alert hata do
              }}
              disabled={isLoading}
              isInvalid={
                isInvalidMultiple || isInsufficient || isZeroOrNegative
              }
              autoFocus
            />

            {/* Dynamic Error Messages (Feedback) */}
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
            disabled={isLoading || !isFormValid} // Strictly disabled if invalid
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
  );
};

export default WithdrawForm;
