# Sugeno FLC Studio

> An interactive, browser-based Takagi-Sugeno Fuzzy Logic Controller educational laboratory and visual simulator.

Sugeno FLC Studio allows students, researchers, and engineers to explore and understand the inner mechanics of a Takagi-Sugeno Fuzzy Inference System step-by-step. It provides real-time mathematical feedback, dynamic visual plots of membership functions, firing strengths heatmaps, and full textbook hand-calculation proofs.

---

## 🌟 Key Features

- **Step-by-Step Interactive Walkthrough**:
  - **Step 1: Setup** — Explore inputs, fuzzy universes of discourse, and membership function curves (triangular & trapezoidal).
  - **Step 2: Fuzzification** — Watch crisp numerical inputs project onto fuzzy membership functions with live degree calculations ($\mu(x)$).
  - **Step 3: Rule Evaluation** — Inspect multi-input rule matrices and evaluate rule firing strengths ($w_i = \min(\mu_{A}(x_1), \mu_{B}(x_2))$).
  - **Step 4: Consequent Computation** — Inspect rule outputs ($z_i$) and weighted contributions ($w_i \times z_i$).
  - **Step 5: Defuzzification** — Real-time weighted average defuzzification calculation ($z^* = \frac{\sum w_i z_i}{\sum w_i}$) with animated breakdowns and contribution distributions.
- **Problem Presets**:
  - 🍽️ **Restaurant Tipping**: Compute tip percentage based on Food Quality and Service Quality.
  - ❄️ **AC Temperature Controller**: Regulate fan speed based on Temperature Error and Error Rate.
  - 🫧 **Washing Machine Controller**: Determine wash duration based on Dirtiness and Fabric Grease Level.
- **Textbook Hand-Calculation Verification**:
  - Live arithmetic audit panel detailing every step of the calculation to compare against manual homework or exam problems.
- **Interactive Controls**:
  - Play, Pause, Step Forward, Step Back, and Reset.
  - Dynamic playback speed control.
  - Real-time input sliders with immediate recalculation.
- **Engineered Technical UI**:
  - Distraction-free, dark-themed scientific laboratory aesthetics.
  - Crisp typography using Inter and JetBrains Mono.
  - Fully responsive SVG membership curves and heatmaps.

---

## 🧠 The Sugeno Fuzzy Inference Method

Unlike the Mamdani fuzzy model (which produces fuzzy sets that require complex centroid integration), the **Takagi-Sugeno-Kang (TSK)** method uses mathematical functions or constants as rule consequents:

### 1. Fuzzification
For each input variable $x_j$, evaluate its degree of membership in linguistic term $A_k$:
$$\mu_{A_k}(x_j) \in [0, 1]$$

### 2. Rule Firing Strength
Using the T-norm product or minimum operator (AND):
$$w_i = \min\Big(\mu_{A_{1,i}}(x_1), \mu_{A_{2,i}}(x_2), \dots, \mu_{A_{n,i}}(x_n)\Big)$$

### 3. Consequent Calculation (Zero-Order Sugeno)
Each rule $R_i$ specifies a crisp value $z_i$:
$$\text{IF } x_1 \text{ is } A_1 \text{ AND } x_2 \text{ is } B_1 \implies z_i = c_i$$

### 4. Defuzzification (Weighted Average)
The crisp system output $z^*$ is computed as:
$$z^* = \frac{\sum_{i=1}^{N} w_i \cdot z_i}{\sum_{i=1}^{N} w_i}$$

---

## 📐 Textbook Verification Example

Using the **Restaurant Tipping** preset with inputs **Food Quality = 4.0** and **Service Quality = 7.0**:

1. **Fuzzification**:
   - $\mu_{\text{Poor}}(4) = \frac{5 - 4}{5 - 2} = 0.3333$
   - $\mu_{\text{Average}}(4) = \frac{4 - 2}{5 - 2} = 0.6667$
   - $\mu_{\text{Poor}}(7) = 0.0$
   - $\mu_{\text{Average}}(7) = \frac{8 - 7}{8 - 5} = 0.3333$
   - $\mu_{\text{Excellent}}(7) = \frac{7 - 5}{8 - 5} = 0.6667$

2. **Active Rules ($w_i > 0$)**:
   - $R_2$ ($\text{Food Poor} \wedge \text{Service Avg}$): $w_2 = \min(0.3333, 0.3333) = 0.3333 \implies z_2 = 10\%$
   - $R_3$ ($\text{Food Poor} \wedge \text{Service Exc}$): $w_3 = \min(0.3333, 0.6667) = 0.3333 \implies z_3 = 10\%$
   - $R_5$ ($\text{Food Avg} \wedge \text{Service Avg}$): $w_5 = \min(0.6667, 0.3333) = 0.3333 \implies z_5 = 15\%$
   - $R_6$ ($\text{Food Avg} \wedge \text{Service Exc}$): $w_6 = \min(0.6667, 0.6667) = 0.6667 \implies z_6 = 20\%$

3. **Weighted Average**:
   $$\sum w_i z_i = (0.3333 \times 10) + (0.3333 \times 10) + (0.3333 \times 15) + (0.6667 \times 20) = 25.0000$$
   $$\sum w_i = 0.3333 + 0.3333 + 0.3333 + 0.6667 = 1.6667$$
   $$z^* = \frac{25.0000}{1.6667} = \mathbf{15.00\%}$$

The studio calculates and displays these exact steps in the verification ledger.

---

## 🛠️ Tech Stack

- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS v4
- **Animation**: Framer Motion
- **Fonts**: Inter (UI) & JetBrains Mono (Scientific Data & Math)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18.0.0 or later)
- npm or pnpm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Mayank29903/sugeno-flc-studio.git
   cd sugeno-flc-studio
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:5173/
   ```

### Building for Production

To create an optimized production build:
```bash
npm run build
```

---

## 📂 Project Structure

```
SCASS1/
├── index.html                   # HTML Entry Point
├── package.json                 # Project dependencies & scripts
├── vite.config.js               # Vite + Tailwind configuration
└── src/
    ├── main.jsx                 # React root mount
    ├── App.jsx                  # Main application layout & studio view
    ├── index.css                # Global styles, typography & color tokens
    ├── components/
    │   ├── Controls.jsx         # Play/Pause/Step/Speed timeline bar
    │   ├── DefuzzView.jsx       # Consequent calculations & weighted average breakdown
    │   ├── ExplanationPanel.jsx # Plain-language pedagogy & hand-calculation audit
    │   ├── InputPanel.jsx       # Problem presets & input parameter sliders
    │   ├── MembershipChart.jsx  # SVG membership function curve renderer
    │   └── RuleMatrix.jsx       # Fuzzy rule matrix & firing strength heatmap
    ├── data/
    │   └── presets.js           # Problem presets & step metadata
    ├── engine/
    │   └── sugeno.js            # Takagi-Sugeno mathematical inference engine
    └── hooks/
        └── useFuzzyController.js # Simulation state & pipeline hook
```

---

## 📜 License

MIT License. Feel free to use this tool for academic coursework, teaching, or research.
