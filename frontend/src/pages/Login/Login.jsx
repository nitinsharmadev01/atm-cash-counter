import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Card,
  Form,
  Button,
  InputGroup,
  Spinner,
} from "react-bootstrap";
import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { loginUser } from "../../services/authApi";
import { useAuthStore } from "../../store/authStore";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const { email, password } = formData;

    // 1. Empty Check
    if (!email.trim() || !password.trim()) {
      toast.error("Please fill in all fields.");
      return false;
    }

    // 2. Email Format Check (Basic Regex)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address.");
      return false;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      setIsLoading(true);
      const response = await loginUser({
        email: formData.email,
        password: formData.password,
      });

      login(response.data.user);
      navigate("/");
    } catch (err) {
      console.error("Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const togglePassword = () => setShowPassword(!showPassword);

  return (
    <div className="bg-light min-vh-100 d-flex align-items-center justify-content-center py-5">
      <Container className="d-flex justify-content-center">
        <Card
          className="shadow-sm border-0 w-100"
          style={{ maxWidth: "420px", borderRadius: "12px" }}
        >
          <Card.Body className="p-4 p-sm-5">
            <div className="text-center mb-4">
              <h2 className="fw-bold text-dark"></h2>
              <p className="text-muted mb-0">Secure System Access</p>
            </div>

            <Form onSubmit={handleSubmit} noValidate>
              {/* Email Input */}
              <Form.Group className="mb-3" controlId="email">
                <Form.Label className="fw-semibold small text-muted text-uppercase tracking-wider">
                  Email Address
                </Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  placeholder="admin@atm.com"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="py-2"
                />
              </Form.Group>

              {/* Password Input with Toggle */}
              <Form.Group className="mb-4" controlId="password">
                <Form.Label className="fw-semibold small text-muted text-uppercase tracking-wider">
                  Password
                </Form.Label>
                <InputGroup>
                  <Form.Control
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="py-2 border-end-0"
                  />
                  <Button
                    variant="outline-secondary"
                    onClick={togglePassword}
                    disabled={isLoading}
                    className="border-start-0 d-flex align-items-center bg-white"
                    style={{ borderColor: "#dee2e6" }}
                  >
                    {showPassword ? (
                      <EyeOff size={18} className="text-muted" />
                    ) : (
                      <Eye size={18} className="text-muted" />
                    )}
                  </Button>
                </InputGroup>
              </Form.Group>

              {/* Submit Button */}
              <Button
                variant="primary"
                type="submit"
                className="w-100 fw-bold py-2 mb-3 d-flex justify-content-center align-items-center gap-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Spinner animation="border" size="sm" />
                    Authenticating...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </Form>
          </Card.Body>
          <Card.Footer className="bg-white border-0 text-center text-muted pb-4 pt-0">
            <small>Authorized Personnel Only</small>
          </Card.Footer>
        </Card>
      </Container>
    </div>
  );
};

export default Login;
