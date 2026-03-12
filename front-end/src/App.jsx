import React from "react";

function App() {
  return (
    <div style={{ 
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "Arial, sans-serif",
      backgroundColor: "#f4f6f8"
    }}>
      
      <h1>BudgetLife</h1>
      
      <p>
        Welcome to BudgetLife — build your financial city.
      </p>

      <button style={{
        padding: "10px 20px",
        marginTop: "20px",
        borderRadius: "8px",
        border: "none",
        backgroundColor: "#2563eb",
        color: "white",
        cursor: "pointer"
      }}>
        Get Started
      </button>

    </div>
  );
}

export default App;