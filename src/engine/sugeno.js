// ═══════════════════════════════════════════════════════════
//  Sugeno Fuzzy Logic Controller Engine
//  Implements zero-order & first-order Takagi-Sugeno methods
// ═══════════════════════════════════════════════════════════

/**
 * Triangular membership function
 * @param {number} x - Input value
 * @param {number[]} params - [a, b, c] where a=left foot, b=peak, c=right foot
 * @returns {number} Membership degree [0, 1]
 */
export function triangular(x, params) {
  const [a, b, c] = params;
  if (x <= a || x >= c) return 0;
  if (Math.abs(b - a) < 1e-10 && x <= b) return 1;
  if (Math.abs(c - b) < 1e-10 && x >= b) return 1;
  if (x <= b) return (x - a) / (b - a);
  return (c - x) / (c - b);
}

/**
 * Trapezoidal membership function
 * @param {number} x - Input value
 * @param {number[]} params - [a, b, c, d] where a=left foot, b=left shoulder, c=right shoulder, d=right foot
 * @returns {number} Membership degree [0, 1]
 */
export function trapezoidal(x, params) {
  const [a, b, c, d] = params;
  if (x < a || x > d) return 0;
  if (x >= b && x <= c) return 1;
  if (x < b && b > a) return (x - a) / (b - a);
  if (x > c && d > c) return (d - x) / (d - c);
  return 0;
}

/**
 * Gaussian membership function
 * @param {number} x - Input value
 * @param {number[]} params - [mean, sigma]
 * @returns {number} Membership degree [0, 1]
 */
export function gaussian(x, params) {
  const [mean, sigma] = params;
  return Math.exp(-0.5 * Math.pow((x - mean) / sigma, 2));
}

/**
 * Evaluate a single membership function at a given value
 */
export function evaluateMF(x, mf) {
  switch (mf.type) {
    case 'triangular': return triangular(x, mf.params);
    case 'trapezoidal': return trapezoidal(x, mf.params);
    case 'gaussian': return gaussian(x, mf.params);
    default: return 0;
  }
}

/**
 * Fuzzification: Convert a crisp input to fuzzy membership degrees
 * @param {number} value - Crisp input value
 * @param {Object[]} membershipFunctions - Array of MF definitions
 * @returns {Object[]} Array of { name, degree, color, params, type }
 */
export function fuzzify(value, membershipFunctions) {
  return membershipFunctions.map(mf => ({
    name: mf.name,
    degree: evaluateMF(value, mf),
    color: mf.color,
    params: mf.params,
    type: mf.type,
  }));
}

/**
 * Evaluate all fuzzy rules
 * @param {Object[]} rules - Rule definitions with antecedents and consequent
 * @param {Object[][]} fuzzifiedInputs - Array of fuzzified inputs (one per input variable)
 * @param {string} operator - 'AND' (min) or 'OR' (max)
 * @returns {Object[]} Evaluated rules with firing strengths
 */
export function evaluateRules(rules, fuzzifiedInputs, operator = 'AND') {
  return rules.map((rule, ruleIdx) => {
    const antecedentDegrees = rule.antecedents.map((antName, inputIdx) => {
      const match = fuzzifiedInputs[inputIdx].find(m => m.name === antName);
      return match ? match.degree : 0;
    });

    const firingStrength = operator === 'AND'
      ? Math.min(...antecedentDegrees)
      : Math.max(...antecedentDegrees);

    return {
      ...rule,
      ruleIndex: ruleIdx,
      antecedentDegrees,
      firingStrength,
    };
  });
}

/**
 * Compute Sugeno output for a rule (zero-order or first-order)
 * @param {Object} rule - Rule with consequent definition
 * @param {number[]} inputValues - Crisp input values
 * @returns {number} Rule output value
 */
export function computeRuleOutput(rule, inputValues) {
  if (typeof rule.consequent === 'number') {
    // Zero-order Sugeno: output is a constant
    return rule.consequent;
  }
  if (rule.consequent && rule.consequent.coefficients) {
    // First-order Sugeno: output = sum(coeff_i * input_i) + constant
    const { coefficients, constant } = rule.consequent;
    let result = constant || 0;
    coefficients.forEach((c, i) => {
      result += c * (inputValues[i] || 0);
    });
    return result;
  }
  return 0;
}

/**
 * Defuzzification using weighted average (Sugeno method)
 * @param {Object[]} evaluatedRules - Rules with firing strengths
 * @param {number[]} inputValues - Crisp input values (for first-order)
 * @returns {{ output: number, details: Object[] }} Final output and computation details
 */
export function defuzzify(evaluatedRules, inputValues = []) {
  let numerator = 0;
  let denominator = 0;
  const details = [];

  evaluatedRules.forEach(rule => {
    const ruleOutput = computeRuleOutput(rule, inputValues);
    const contribution = rule.firingStrength * ruleOutput;

    details.push({
      ruleIndex: rule.ruleIndex,
      antecedents: rule.antecedents,
      firingStrength: rule.firingStrength,
      ruleOutput,
      contribution,
      label: rule.label,
    });

    if (rule.firingStrength > 0) {
      numerator += contribution;
      denominator += rule.firingStrength;
    }
  });

  return {
    output: denominator === 0 ? 0 : numerator / denominator,
    numerator,
    denominator,
    details,
  };
}

/**
 * Run the complete Sugeno FLC pipeline
 * Returns all intermediate results for visualization
 */
export function runSugenoPipeline(preset, inputValues) {
  // Step 1: Fuzzification
  const fuzzified = preset.inputs.map((inp, i) =>
    fuzzify(inputValues[i], inp.membershipFunctions)
  );

  // Step 2: Rule Evaluation
  const evaluatedRules = evaluateRules(preset.rules, fuzzified);

  // Step 3-4: Defuzzification (includes output computation)
  const result = defuzzify(evaluatedRules, inputValues);

  return {
    fuzzified,
    evaluatedRules,
    result,
  };
}

/**
 * Generate hand calculation text for verification
 */
export function generateHandCalculation(preset, inputValues, pipeline) {
  const { fuzzified, evaluatedRules, result } = pipeline;
  const lines = [];

  // Header
  lines.push({ type: 'header', text: 'Hand Calculation Verification' });
  lines.push({ type: 'divider' });

  // Fuzzification
  lines.push({ type: 'subheader', text: 'Step 1: Fuzzification' });
  preset.inputs.forEach((inp, i) => {
    lines.push({ type: 'label', text: `${inp.name} = ${inputValues[i].toFixed(2)}` });
    fuzzified[i].forEach(f => {
      const formula = getFormula(inputValues[i], inp.membershipFunctions.find(m => m.name === f.name));
      lines.push({
        type: 'calc',
        text: `  μ_${f.name}(${inputValues[i].toFixed(1)}) = ${formula} = ${f.degree.toFixed(4)}`,
        highlight: f.degree > 0,
      });
    });
  });

  lines.push({ type: 'divider' });

  // Rule Evaluation
  lines.push({ type: 'subheader', text: 'Step 2: Rule Evaluation (AND = min)' });
  evaluatedRules.forEach((rule, idx) => {
    if (rule.firingStrength > 0) {
      const degs = rule.antecedentDegrees.map(d => d.toFixed(4)).join(', ');
      lines.push({
        type: 'calc',
        text: `  R${idx + 1}: min(${degs}) = ${rule.firingStrength.toFixed(4)}`,
        highlight: true,
      });
    }
  });

  const inactive = evaluatedRules.filter(r => r.firingStrength === 0).length;
  if (inactive > 0) {
    lines.push({ type: 'muted', text: `  (${inactive} rules have zero firing strength)` });
  }

  lines.push({ type: 'divider' });

  // Defuzzification
  lines.push({ type: 'subheader', text: 'Step 3: Weighted Average Defuzzification' });

  const activeDetails = result.details.filter(d => d.firingStrength > 0);
  const numParts = activeDetails.map(d => `${d.firingStrength.toFixed(4)}×${d.ruleOutput}`).join(' + ');
  const denParts = activeDetails.map(d => d.firingStrength.toFixed(4)).join(' + ');

  lines.push({ type: 'formula', text: `z* = Σ(wᵢ × zᵢ) / Σ(wᵢ)` });
  lines.push({ type: 'calc', text: `   = (${numParts}) / (${denParts})` });
  lines.push({ type: 'calc', text: `   = ${result.numerator.toFixed(4)} / ${result.denominator.toFixed(4)}` });
  lines.push({ type: 'result', text: `   = ${result.output.toFixed(4)}${preset.output.unit}` });

  return lines;
}

function getFormula(x, mf) {
  if (!mf) return '0';
  if (mf.type === 'triangular') {
    const [a, b, c] = mf.params;
    if (x <= a || x >= c) return '0';
    if (x <= b) return `(${x.toFixed(1)}-${a})/(${b}-${a})`;
    return `(${c}-${x.toFixed(1)})/(${c}-${b})`;
  }
  if (mf.type === 'trapezoidal') {
    const [a, b, c, d] = mf.params;
    if (x <= a || x >= d) return '0';
    if (x >= b && x <= c) return '1';
    if (x < b) return `(${x.toFixed(1)}-${a})/(${b}-${a})`;
    return `(${d}-${x.toFixed(1)})/(${d}-${b})`;
  }
  return '?';
}
