import React, { useState } from "react";
import "./Calculator.css";

const Calculator = () => {
  const [input, setInput] = useState("");

  const handleClick = (value) => {
    setInput((prev) => prev + value);
  };

  const clearInput = () => {
    setInput("");
  };

  const deleteLast = () => {
    setInput((prev) => prev.slice(0, -1));
  };

  const calculate = () => {
    try {
      // eslint-disable-next-line no-eval
      const result = eval(input);
      setInput(result.toString());
    } catch {
      setInput("Error");
    }
  };

  const buttons = [
    "7",
    "8",
    "9",
    "/",
    "4",
    "5",
    "6",
    "*",
    "1",
    "2",
    "3",
    "-",
    "0",
    ".",
    "=",
    "+",
  ];

  return (
    <div className="calculator-card">
      <h2>Calculator</h2>

      <input
        type="text"
        className="display"
        value={input}
        readOnly
      />

      <div className="top-buttons">
        <button className="clear-btn" onClick={clearInput}>
          AC
        </button>

        <button className="delete-btn" onClick={deleteLast}>
          DEL
        </button>
      </div>

      <div className="calculator-grid">
        {buttons.map((btn) => (
          <button
            key={btn}
            className={btn === "=" ? "equal-btn" : ""}
            onClick={() =>
              btn === "="
                ? calculate()
                : handleClick(btn)
            }
          >
            {btn}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Calculator;