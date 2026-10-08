import { useState } from "react";
import "./Calculator.css";

const CALCULATOR_RE = /^[\d\s+\-*/().]+$/;

const evaluateExpression = (source) => {
  if (!CALCULATOR_RE.test(source)) {
    return null;
  }

  let index = 0;

  const peek = () => source[index];

  const skipSpaces = () => {
    while (index < source.length && /\s/.test(source[index])) {
      index += 1;
    }
  };

  const parseNumber = () => {
    skipSpaces();

    const start = index;

    while (index < source.length && /[\d.]/.test(source[index])) {
      index += 1;
    }

    if (start === index) {
      return null;
    }

    const value = Number(source.slice(start, index));

    return Number.isFinite(value) ? value : null;
  };

  const parseFactor = () => {
    skipSpaces();

    if (peek() === "(") {
      index += 1;

      const value = parseExpression();

      skipSpaces();

      if (peek() !== ")") {
        throw new Error("Mismatched parentheses");
      }

      index += 1;

      return value;
    }

    const value = parseNumber();

    if (value !== null) {
      return value;
    }

    if (peek() === "-") {
      index += 1;

      const inner = parseFactor();

      return inner === null ? null : -inner;
    }

    return null;
  };

  const parseTerm = () => {
    let value = parseFactor();

    if (value === null) {
      throw new Error("Expected a number");
    }

    for (;;) {
      skipSpaces();

      const op = peek();

      if (op !== "*" && op !== "/") {
        return value;
      }

      index += 1;

      const right = parseFactor();

      if (right === null) {
        throw new Error("Expected a number");
      }

      if (op === "*") {
        value *= right;
      } else {
        if (right === 0) {
          throw new Error("Division by zero");
        }

        value /= right;
      }
    }
  };

  const parseExpression = () => {
    let value = parseTerm();

    for (;;) {
      skipSpaces();

      const op = peek();

      if (op !== "+" && op !== "-") {
        return value;
      }

      index += 1;

      const right = parseTerm();

      if (op === "+") {
        value += right;
      } else {
        value -= right;
      }
    }
  };

  const result = parseExpression();

  skipSpaces();

  return index === source.length ? result : null;
};

const formatResult = (value) =>
  String(Number(value.toFixed(10)));

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
      const result = evaluateExpression(input);

      if (result === null) {
        setInput("Error");
        return;
      }

      setInput(formatResult(result));
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
