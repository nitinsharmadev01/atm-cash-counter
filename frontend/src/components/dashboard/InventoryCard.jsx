import { Card, Table, Badge } from "react-bootstrap";

const InventoryCard = ({ inventory, totalBalance, isOffline }) => {
  return (
    <Card className="border-0 shadow-sm h-100">
      <Card.Header className="bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
        <h5 className="mb-0 fw-bold">Current Inventory</h5>
        <Badge
          bg={isOffline ? "warning" : "success"}
          text={isOffline ? "dark" : "light"}
        >
          Total: ₹{totalBalance.toLocaleString("en-IN")}
        </Badge>
      </Card.Header>
      <Card.Body className="p-0">
        <Table responsive hover className="mb-0 align-middle">
          <thead className="bg-light">
            <tr>
              <th className="px-4 py-3 text-muted">Denomination</th>
              <th className="py-3 text-muted">Available Notes</th>
              <th className="px-4 py-3 text-end text-muted">Total Value</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map((item) => (
              <tr key={item.denomination}>
                <td className="px-4 py-3 fw-medium">₹{item.denomination}</td>
                <td className="py-3">
                  <Badge bg={item.quantity > 10 ? "primary" : "danger"} pill>
                    {item.quantity}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-end fw-semibold">
                  ₹{(item.denomination * item.quantity).toLocaleString("en-IN")}
                </td>
              </tr>
            ))}
            {inventory.length === 0 && (
              <tr>
                <td colSpan="3" className="text-center py-4 text-muted">
                  No inventory data available.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
};

export default InventoryCard;
