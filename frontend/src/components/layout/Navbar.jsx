import { Link, useNavigate } from "react-router-dom";
import {
  Navbar as BsNavbar,
  Nav,
  Container,
  Badge,
  Button,
} from "react-bootstrap";
import { useAuthStore } from "../../store/authStore";
import { useNetworkStore } from "../../store/networkStore";
import { useSyncStore } from "../../store/syncStore";
import { logoutUser } from "../../services/authApi";
import { refillInventory } from "../../services/atmApi";

const Navbar = () => {
  const { isAuthenticated, logout } = useAuthStore();
  const isOffline = useNetworkStore((state) => state.isOffline);
  const pendingCount = useSyncStore((state) => state.pendingCount);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logoutUser();
      logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const handleRefill = async () => {
    if (isOffline) {
      alert("Cannot refill ATM while offline");
      return;
    }

    try {
      const response = await refillInventory();

      console.log("ATM Refilled:", response);

      alert("ATM refilled successfully");
    } catch (error) {
      console.error("Refill failed", error);

      alert(error?.response?.data?.message || "ATM refill failed");
    }
  };

  if (!isAuthenticated) return null;

  return (
    <BsNavbar
      bg="white"
      expand="lg"
      className="border-bottom shadow-sm py-3 sticky-top"
    >
      <Container>
        <BsNavbar.Brand as={Link} to="/" className="fw-bold text-primary">
          ATM Counter
        </BsNavbar.Brand>
        <BsNavbar.Toggle aria-controls="basic-navbar-nav" />

        <BsNavbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/" className="fw-medium">
              Dashboard
            </Nav.Link>
            <Nav.Link as={Link} to="/transactions" className="fw-medium">
              History
            </Nav.Link>
            <Nav.Link as={Link} to="/sync-queue" className="fw-medium">
              Sync Queue{" "}
              {pendingCount > 0 && (
                <Badge bg="danger" pill>
                  {pendingCount}
                </Badge>
              )}
            </Nav.Link>
          </Nav>

          <div className="d-flex align-items-lg-center flex-column flex-lg-row gap-3 mt-3 mt-lg-0">
            <div
              className={`status-indicator ${isOffline ? "offline" : "online"}`}
            >
              <span className="status-dot"></span>
              {isOffline ? "Offline Mode" : "System Online"}
            </div>

            {/* <Button
              variant="outline-primary"
              size="sm"
              onClick={handleRefill}
              className="fw-semibold"
            >
              Refill ATM
            </Button> */}
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={handleLogout}
              className="fw-semibold"
            >
              Logout
            </Button>
          </div>
        </BsNavbar.Collapse>
      </Container>
    </BsNavbar>
  );
};

export default Navbar;
