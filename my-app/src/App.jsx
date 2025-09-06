import React, { useCallback, useEffect, useState } from "react";

/* -------------------------
   Top-level helper functions
   ------------------------- */

// Recognize operators (note: '%' handled as a special button, not an operator here)
function isOperatorChar(ch) {
  return ch === "+" || ch === "-" || ch === "*" || ch === "/";
}

// Tokenizer that supports unary minus, decimals, and parentheses
function tokenize(expr) {
  const s = String(expr).replace(/\s+/g, "");
  const tokens = [];
  let i = 0;

  while (i < s.length) {
    const ch = s[i];

    if ((ch >= "0" && ch <= "9") || ch === ".") {
      let num = ch;
      i++;
      while (i < s.length && ((s[i] >= "0" && s[i] <= "9") || s[i] === ".")) {
        num += s[i++];
      }
      tokens.push(num);
      continue;
    }

    if (ch === "-") {
      const prev = tokens.length ? tokens[tokens.length - 1] : null;
      // unary minus when at start or after operator or '('
      if (!prev || isOperatorChar(prev) || prev === "(") {
        let num = "-";
        i++;
        while (i < s.length && ((s[i] >= "0" && s[i] <= "9") || s[i] === ".")) {
          num += s[i++];
        }
        tokens.push(num);
      } else {
        tokens.push("-");
        i++;
      }
      continue;
    }

    if (ch === "(" || ch === ")") {
      tokens.push(ch);
      i++;
      continue;
    }

    if (isOperatorChar(ch)) {
      tokens.push(ch);
      i++;
      continue;
    }

    // unknown char (skip) — '%' is intentionally skipped here (handled elsewhere)
    i++;
  }

  return tokens;
}

// Shunting-yard: convert token list -> RPN
function toRPN(tokens) {
  const out = [];
  const ops = [];
  const prec = { "+": 1, "-": 1, "*": 2, "/": 2 };

  for (const t of tokens) {
    if (!isNaN(t)) {
      out.push(t);
    } else if (isOperatorChar(t)) {
      while (ops.length && isOperatorChar(ops[ops.length - 1]) && prec[ops[ops.length - 1]] >= prec[t]) {
        out.push(ops.pop());
      }
      ops.push(t);
    } else if (t === "(") {
      ops.push(t);
    } else if (t === ")") {
      while (ops.length && ops[ops.length - 1] !== "(") {
        out.push(ops.pop());
      }
      // pop '('
      ops.pop();
    }
  }

  while (ops.length) out.push(ops.pop());
  return out;
}

// Evaluate RPN array
function evalRPN(rpn) {
  const st = [];
  for (const t of rpn) {
    if (!isNaN(t)) {
      st.push(parseFloat(t));
    } else {
      const b = st.pop();
      const a = st.pop();
      if (typeof a === "undefined" || typeof b === "undefined") return NaN;
      let res;
      switch (t) {
        case "+":
          res = a + b;
          break;
        case "-":
          res = a - b;
          break;
        case "*":
          res = a * b;
          break;
        case "/":
          res = b === 0 ? NaN : a / b;
          break;
        default:
          res = NaN;
      }
      st.push(res);
    }
  }
  return st.length ? st[0] : NaN;
}

// Evaluate expression string (returns numeric result or NaN)
function evaluateExpression(exprStr) {
  try {
    const tokens = tokenize(exprStr);
    if (tokens.length === 0) return 0;
    const rpn = toRPN(tokens);
    const val = evalRPN(rpn);
    if (!isFinite(val)) return NaN;
    // round to avoid tiny floating errors
    return Math.round((val + Number.EPSILON) * 1e12) / 1e12;
  } catch {
    return NaN;
  }
}

/* -------------------------
   React component
   ------------------------- */
export default function App() {
  const [expr, setExpr] = useState("");
  const [result, setResult] = useState("");

  // appendInputs uses functional updates so it doesn't close over `expr` — no deps needed
  const appendInputs = useCallback((val) => {
    setExpr((prev) => {
      // AC: clear all
      if (val === "AC") {
        setResult("");
        return "";
      }

      // DEL: remove last char
      if (val === "DEL") {
        setResult("");
        return prev.slice(0, -1);
      }

      // Equals: evaluate current expression
      if (val === "=") {
        const res = evaluateExpression(prev);
        const out = isNaN(res) ? "Error" : String(res);
        setResult(out);
        return isNaN(res) ? "" : String(res);
      }

      // Percentage button: replace last number with number / 100
      if (val === "%") {
        const m = prev.match(/(-?\d+\.?\d*)$/);
        if (!m) return prev;
        const num = parseFloat(m[0]);
        if (isNaN(num)) return prev;
        const replaced = prev.slice(0, -m[0].length) + String(num / 100);
        setResult("");
        return replaced;
      }

      // Dot handling: prevent multiple dots in the same number
      if (val === ".") {
        const lastNumberMatch = prev.match(/(-?\d*\.?\d*)$/);
        if (lastNumberMatch && lastNumberMatch[0].includes(".")) return prev; // already has dot
        if (!prev || isOperatorChar(prev.slice(-1)) || prev.slice(-1) === "(") {
          // start a new '0.' number
          return prev + "0.";
        }
        return prev + ".";
      }

      // Operator handling
      if (isOperatorChar(val)) {
        if (!prev) {
          // allow starting with unary minus
          if (val === "-") return "-";
          return prev;
        }
        const last = prev.slice(-1);
        if (isOperatorChar(last)) {
          // replace last operator with the new one
          return prev.slice(0, -1) + val;
        }
        return prev + val;
      }

      // Default: append digit (0-9) or other allowed characters
      return prev + val;
    });
  }, []);

  // Keyboard listener — depends only on appendInputs (stable)
  const onKey = useCallback(
    (e) => {
      const key = e.key;
      if (/^[0-9]$/.test(key)) appendInputs(key);
      else if (key === "Enter") appendInputs("=");
      else if (key === "Backspace") appendInputs("DEL");
      else if (key === "Escape") appendInputs("AC");
      else if (key === ".") appendInputs(".");
      else if (["+", "-", "*", "/"].includes(key)) appendInputs(key);
      else if (key === "%") appendInputs("%");
    },
    [appendInputs]
  );

  useEffect(() => {
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onKey]);

  // buttons layout
  const buttons = [
    "AC",
    "DEL",
    "%",
    "/",
    "7",
    "8",
    "9",
    "*",
    "4",
    "5",
    "6",
    "-",
    "1",
    "2",
    "3",
    "+",
    "0",
    ".",
    "=",
  ];

// polished responsive inline styles
const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    width: "100vw",
    background: "#f3f4f6",
    padding: 20,
    boxSizing: "border-box",
  },
  calc: {
    width: "100%",
    maxWidth: 360,
    background: "#fff",
    borderRadius: 16,
    boxShadow: "0 12px 30px rgba(0,0,0,0.15)",
    padding: "20px",
  },
  display: {
    minHeight: 72,
    background: "#111827",
    color: "#fff",
    borderRadius: 10,
    padding: "12px 16px",
    textAlign: "right",
    fontSize: "clamp(20px, 4vw, 28px)",
    wordBreak: "break-all",
    boxShadow: "inset 0 -2px 4px rgba(0,0,0,0.3)",
  },
  small: { fontSize: 14, color: "#9ca3af" },
  grid: {
    marginTop: 16,
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "12px",
  },
  btn: {
    padding: "clamp(12px, 3vw, 16px) 0",
    borderRadius: 12,
    fontSize: "clamp(16px, 4vw, 18px)",
    cursor: "pointer",
    border: "none",
    background: "#e5e7eb",
    color: "#111827",
    transition: "all 0.2s ease",
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
  },
  btnHover: {
    transform: "scale(1.05)",
    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
  },
  opBtn: { background: "#fb923c", color: "#fff" },
  eqBtn: { background: "#f97316", color: "#fff" },
  zeroBtn: { gridColumn: "span 2" },
};
  return (
    <div style={styles.container}>
      <div style={styles.calc}>
        <div style={styles.display}>
          <div style={{ fontSize: 16, color: "#9ca3af", textAlign: "right", minHeight: 18 }}>{expr || " "}</div>
          <div style={{ marginTop: 6 }}>{result || expr || "0"}</div>
        </div>

        <div style={styles.grid}>
          {buttons.map((b, idx) => {
            const isOp = ["+", "-", "*", "/", "%"].includes(b);
            const isEq = b === "=";
            const common = { ...styles.btn };
            if (isEq) Object.assign(common, styles.eqBtn);
            else if (isOp) Object.assign(common, styles.opBtn);

            if (b === "0") {
              return (
                <button key={idx} style={{ ...common, ...styles.zeroBtn }} onClick={() => appendInputs(b)}>
                  {b}
                </button>
              );
            }

            return (
              <button key={idx} style={common} onClick={() => appendInputs(b)}>
                {b}
              </button>
            );
          })}
        </div>

        <div style={{ marginTop: 10, fontSize: 12, color: "#6b7280", textAlign: "center" }}>
          Tip: use keyboard numbers, + - * /, Enter for equals, Backspace to delete, Esc to clear.
        </div>
      </div>
    </div>
  );
}
