import { useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Form,
  Button,
  Alert,
  Spinner,
  Badge,
} from "react-bootstrap";
import { useInventory } from "../../hooks/useInventory";
import { useNetworkStore } from "../../store/networkStore";
import { withdrawAmount } from "../../services/atmApi";
import { transactionDB } from "../../db/transactions";
import { v4 as uuidv4 } from "uuid"; // npm install uuid
import InventoryCard from "../../components/dashboard/InventoryCard";
import WithdrawForm from "../../components/dashboard/WithdrawForm";

const Dashboard = () => {
  const { inventory, totalBalance, isLoading, error, refreshInventory } =
    useInventory();
  const isOffline = useNetworkStore((state) => state.isOffline);

  const [amount, setAmount] = useState("");
  const [withdrawState, setWithdrawState] = useState({
    loading: false,
    error: "",
    success: null,
  });

  // const handleWithdraw = async (e) => {
  //   e.preventDefault();
  //   const withdrawValue = parseInt(amount, 10);

  //   setWithdrawState({ loading: true, error: "", success: null });

  //   // Client-side validations[cite: 1]
  //   if (!withdrawValue || withdrawValue <= 0) {
  //     setWithdrawState({
  //       loading: false,
  //       error: "Please enter a valid positive amount.",
  //       success: null,
  //     });
  //     return;
  //   }
  //   if (withdrawValue % 50 !== 0) {
  //     setWithdrawState({
  //       loading: false,
  //       error: "Amount must be a multiple of ₹50.",
  //       success: null,
  //     });
  //     return;
  //   }
  //   if (withdrawValue > totalBalance) {
  //     setWithdrawState({
  //       loading: false,
  //       error: "Insufficient ATM balance.",
  //       success: null,
  //     });
  //     return;
  //   }

  //   try {
  //     if (isOffline) {
  //       // PDF Req: Store offline transaction and queue it[cite: 1]
  //       const syncId = "TXN-" + uuidv4().substring(0, 8).toUpperCase();

  //       await transactionDB.queueTransaction({
  //         amount: withdrawValue,
  //         syncId: syncId,
  //       });

  //       // Optimistically show success for offline UX
  //       setWithdrawState({
  //         loading: false,
  //         error: "",
  //         success: {
  //           amountWithdrawn: withdrawValue,
  //           status: "QUEUED (Offline)",
  //         },
  //       });
  //     } else {
  //       // Online API Call
  //       const response = await withdrawAmount({ amount: withdrawValue });
  //       setWithdrawState({ loading: false, error: "", success: response.data });
  //       refreshInventory();
  //     }
  //     setAmount("");
  //   } catch (err) {
  //     setWithdrawState({
  //       loading: false,
  //       error: err.response?.data?.message || "Withdrawal failed.",
  //       success: null,
  //     });
  //   }
  // };

  if (isLoading) {
    return (
      <Container
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "60vh" }}
      >
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <div className="mb-4 d-flex justify-content-between align-items-center">
        <div>
          <h2 className="fw-bold mb-1">ATM Dashboard</h2>
          <p className="text-muted mb-0">
            Manage inventory and process withdrawals
          </p>
        </div>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Row className="g-4">
        <Col lg={7}>
          <InventoryCard
            inventory={inventory}
            totalBalance={totalBalance}
            isOffline={isOffline}
          />
        </Col>

        <Col lg={5}>
          <WithdrawForm
            totalBalance={totalBalance}
            isOffline={isOffline}
            onWithdrawSuccess={refreshInventory}
          />
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
