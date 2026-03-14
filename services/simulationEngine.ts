
/**
 * =============================================================================
 * VIJNANA LAB — REALISTIC SIMULATION ENGINE
 * =============================================================================
 * All calculations use SI units unless stated otherwise.
 * Error tolerances mimic real-world instrument precision.
 * Environmental factors (temperature, humidity, pressure) affect results.
 * =============================================================================
 */

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
export const PHYSICS_CONSTANTS = {
  g: 9.80665,           // m/s² — standard gravity (NIST)
  R: 8.314,             // J/(mol·K) — Universal Gas Constant
  NA: 6.02214076e23,    // mol⁻¹ — Avogadro's Number
  h: 6.62607015e-34,    // J·s — Planck's constant
  c: 299792458,         // m/s — speed of light
  k_B: 1.380649e-23,   // J/K — Boltzmann constant
  e: 1.602176634e-19,  // C — Elementary charge
  eps0: 8.854187817e-12, // F/m — permittivity of free space
};

// ─── ENVIRONMENT STATE ────────────────────────────────────────────────────────
export interface EnvironmentState {
  temperature_C: number;   // Lab room temperature (°C)
  humidity_pct: number;    // Relative humidity (%)
  pressure_Pa: number;     // Atmospheric pressure (Pa)
  altitude_m: number;      // Altitude above sea level (m)
}

export const DEFAULT_ENV: EnvironmentState = {
  temperature_C: 25,
  humidity_pct: 60,
  pressure_Pa: 101325,
  altitude_m: 0,
};

/**
 * Local gravity adjusted for altitude and latitude (approximation).
 * Formula: g(h) ≈ g₀ × (R_earth / (R_earth + h))²
 */
export function localGravity(env: EnvironmentState): number {
  const R_earth = 6371000; // meters
  return PHYSICS_CONSTANTS.g * Math.pow(R_earth / (R_earth + env.altitude_m), 2);
}

// ─── INSTRUMENT MODELS ────────────────────────────────────────────────────────
export interface InstrumentReading {
  true_value: number;
  displayed_value: number;
  unit: string;
  uncertainty: number;      // ± (absolute)
  instrument: string;
  notes?: string;
}

/** Add Gaussian noise to simulate random error */
export function gaussianNoise(mean: number, stddev: number): number {
  // Box-Muller transform
  const u1 = Math.random();
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mean + z * stddev;
}

/** Round to nearest instrument least count */
export function roundToLC(value: number, leastCount: number): number {
  return Math.round(value / leastCount) * leastCount;
}

// ─── P1: VERNIER CALIPERS ─────────────────────────────────────────────────────
export const VERNIER_PARAMS = {
  LC: 0.01,          // cm — Least Count
  main_scale_div: 1, // mm per MSD
  vernier_divs: 10,
  zero_error_range: [-0.05, 0.05], // cm (random zero error per session)
};

export function vernierReading(true_diameter_cm: number, zeroError_cm: number): InstrumentReading {
  const noisy = gaussianNoise(true_diameter_cm, 0.005); // ±0.005cm random error
  const msr = Math.floor(noisy * 10) / 10; // Main Scale Reading (cm)
  const vc = Math.round((noisy - msr) / VERNIER_PARAMS.LC); // Vernier Coincidence
  const displayed = parseFloat((msr + vc * VERNIER_PARAMS.LC + zeroError_cm).toFixed(2));
  return {
    true_value: true_diameter_cm,
    displayed_value: displayed,
    unit: 'cm',
    uncertainty: VERNIER_PARAMS.LC,
    instrument: 'Vernier Caliper (LC = 0.01 cm)',
    notes: `MSR = ${msr.toFixed(1)} cm, VC = ${vc}, ZE = ${zeroError_cm >= 0 ? '+' : ''}${zeroError_cm.toFixed(2)} cm`,
  };
}

export function sphereVolume(diameter_cm: number): { volume: number; unit: string } {
  const r = diameter_cm / 2;
  return { volume: parseFloat(((4/3) * Math.PI * r * r * r).toFixed(4)), unit: 'cm³' };
}

// ─── P2: SIMPLE PENDULUM ──────────────────────────────────────────────────────
export const PENDULUM_PARAMS = {
  LC_length: 0.1,    // cm — meter scale LC
  LC_time: 0.01,     // s — stopwatch LC
  oscillations: 20,  // Number of oscillations measured
  max_amplitude_deg: 10, // SHM condition: θ < 10°
};

/**
 * T = 2π√(L/g)
 * g = 4π²L / T²
 * Propagated uncertainty: δg/g = √( (δL/L)² + (2δT/T)² )
 */
export function pendulumPeriod(length_m: number, g: number): number {
  return 2 * Math.PI * Math.sqrt(length_m / g);
}

export function pendulumExperiment(length_m: number, env: EnvironmentState): {
  T_theoretical: number;
  T_measured: number;
  g_calculated: number;
  g_local: number;
  percentage_error: number;
  uncertainty_g: number;
} {
  const g_loc = localGravity(env);
  const T_true = pendulumPeriod(length_m, g_loc);

  // Add realistic timing error (human reaction ~0.1-0.2s per start/stop)
  const time_for_20 = gaussianNoise(T_true * 20, 0.15);
  const T_measured = parseFloat((time_for_20 / PENDULUM_PARAMS.oscillations).toFixed(3));

  // g = 4π²L / T²
  const g_calc = (4 * Math.PI ** 2 * length_m) / (T_measured ** 2);

  // Uncertainty propagation
  const delta_L = PENDULUM_PARAMS.LC_length / 100; // convert cm to m
  const delta_T = PENDULUM_PARAMS.LC_time / PENDULUM_PARAMS.oscillations;
  const delta_g_frac = Math.sqrt((delta_L / length_m) ** 2 + (2 * delta_T / T_measured) ** 2);
  const delta_g = g_calc * delta_g_frac;

  return {
    T_theoretical: parseFloat(T_true.toFixed(4)),
    T_measured,
    g_calculated: parseFloat(g_calc.toFixed(4)),
    g_local: parseFloat(g_loc.toFixed(4)),
    percentage_error: parseFloat((Math.abs(g_calc - g_loc) / g_loc * 100).toFixed(2)),
    uncertainty_g: parseFloat(delta_g.toFixed(4)),
  };
}

// ─── P3: SCREW GAUGE ──────────────────────────────────────────────────────────
export const SCREW_PARAMS = {
  pitch: 0.5,         // mm (half-pitch screw gauge — common in labs)
  divisions: 50,      // circular scale divisions
  get LC() { return this.pitch / this.divisions; }, // 0.01 mm
};

export function screwGaugeReading(true_diameter_mm: number, zeroError_mm: number): InstrumentReading {
  const noisy = gaussianNoise(true_diameter_mm, 0.002);
  const rotations = noisy / SCREW_PARAMS.pitch;
  const msr = Math.floor(rotations) * SCREW_PARAMS.pitch; // mm
  const csr_raw = (noisy - msr) / SCREW_PARAMS.LC;
  const csr = Math.round(csr_raw);
  const displayed = parseFloat((msr + csr * SCREW_PARAMS.LC + zeroError_mm).toFixed(3));
  return {
    true_value: true_diameter_mm,
    displayed_value: displayed,
    unit: 'mm',
    uncertainty: SCREW_PARAMS.LC,
    instrument: `Screw Gauge (Pitch = ${SCREW_PARAMS.pitch} mm, LC = ${SCREW_PARAMS.LC.toFixed(2)} mm)`,
    notes: `MSR = ${msr.toFixed(1)} mm, CSR = ${csr} div, ZE = ${zeroError_mm >= 0 ? '+' : ''}${zeroError_mm.toFixed(2)} mm`,
  };
}

// ─── P4: OHM'S LAW ───────────────────────────────────────────────────────────
export const OHM_PARAMS = {
  voltmeter_precision: 0.01, // V
  ammeter_precision: 0.001,  // A
  internal_resistance_battery: 0.5, // Ω
  wire_resistance_temp_coeff: 0.004, // α for copper (per °C)
};

/**
 * V = IR
 * R(T) = R₀[1 + α(T - T₀)]  — temperature dependence of resistance
 */
export function ohmsLawReading(
  voltage_V: number, 
  true_resistance_ohm: number,
  env: EnvironmentState
): {
  V: InstrumentReading;
  I: InstrumentReading;
  R_measured: number;
  R_true_at_T: number;
  percentage_error: number;
} {
  const R_at_T = true_resistance_ohm * (1 + OHM_PARAMS.wire_resistance_temp_coeff * (env.temperature_C - 25));
  const I_true = voltage_V / R_at_T;

  const V_noisy = roundToLC(gaussianNoise(voltage_V, 0.005), OHM_PARAMS.voltmeter_precision);
  const I_noisy = roundToLC(gaussianNoise(I_true, 0.0005), OHM_PARAMS.ammeter_precision);
  const R_measured = parseFloat((V_noisy / I_noisy).toFixed(3));

  return {
    V: { true_value: voltage_V, displayed_value: V_noisy, unit: 'V', uncertainty: OHM_PARAMS.voltmeter_precision, instrument: 'Digital Voltmeter' },
    I: { true_value: I_true, displayed_value: I_noisy, unit: 'A', uncertainty: OHM_PARAMS.ammeter_precision, instrument: 'Digital Ammeter' },
    R_measured,
    R_true_at_T: parseFloat(R_at_T.toFixed(3)),
    percentage_error: parseFloat((Math.abs(R_measured - R_at_T) / R_at_T * 100).toFixed(2)),
  };
}

// ─── P5: CONCAVE MIRROR ───────────────────────────────────────────────────────
/**
 * Mirror Formula: 1/v + 1/u = 1/f
 * Magnification: m = -v/u
 * Sign convention: distances measured from pole; incident direction = negative
 */
export function mirrorFormula(u_cm: number, f_cm: number): {
  v: number;
  m: number;
  nature: string;
  size: string;
  formula_str: string;
} {
  // All negative by convention for real object and concave mirror
  const u = -Math.abs(u_cm);
  const focal = -Math.abs(f_cm);
  const v_inv = (1 / focal) - (1 / u);
  const v = 1 / v_inv;
  const m = -v / u;

  const nature = v < 0 ? 'Real, Inverted' : 'Virtual, Erect';
  const size = Math.abs(m) > 1.05 ? 'Magnified' : Math.abs(m) < 0.95 ? 'Diminished' : 'Same size';

  return {
    v: parseFloat(v.toFixed(2)),
    m: parseFloat(m.toFixed(3)),
    nature,
    size,
    formula_str: `1/v + 1/u = 1/f  →  1/(${v.toFixed(1)}) + 1/(${u}) = 1/(${focal})`,
  };
}

// ─── C1: ACID-BASE TITRATION ──────────────────────────────────────────────────
export const TITRATION_PARAMS = {
  burette_LC: 0.05,   // mL — burette least count
  pipette_LC: 0.01,   // mL — pipette least count
  endpoint_pH: 8.3,   // pH at phenolphthalein endpoint
};

/**
 * Neutralization: M₁V₁ = M₂V₂ (1:1 stoichiometry, strong acid-base)
 * Enthalpy: ΔH_neut ≈ -57.1 kJ/mol (standard)
 */
export function titrationResult(
  M_acid: number, V_acid_mL: number,
  M_base_expected: number
): {
  V_base_theoretical: number;
  V_base_measured: number;
  M_acid_back_calculated: number;
  enthalpy_kJ: number;
  percentage_error: number;
} {
  const V_base_theo = (M_acid * V_acid_mL) / M_base_expected;
  const V_base_meas = roundToLC(gaussianNoise(V_base_theo, 0.1), TITRATION_PARAMS.burette_LC);
  const M_acid_back = (M_base_expected * V_base_meas) / V_acid_mL;

  // moles of acid reacted
  const moles = (M_acid * V_acid_mL) / 1000;
  const enthalpy = moles * (-57100); // J

  return {
    V_base_theoretical: parseFloat(V_base_theo.toFixed(2)),
    V_base_measured: parseFloat(V_base_meas.toFixed(2)),
    M_acid_back_calculated: parseFloat(M_acid_back.toFixed(4)),
    enthalpy_kJ: parseFloat((enthalpy / 1000).toFixed(2)),
    percentage_error: parseFloat((Math.abs(M_acid_back - M_acid) / M_acid * 100).toFixed(2)),
  };
}

// ─── BIOLOGY: OSMOSIS ─────────────────────────────────────────────────────────
/**
 * Van't Hoff equation for osmotic pressure:
 * π = iMRT
 * where i=van't Hoff factor; M=molarity; R=gas const; T=temperature (K)
 */
export function osmoticPressure(molarity_M: number, temp_C: number, vantHoff_i = 1): number {
  const T_K = temp_C + 273.15;
  const pi = vantHoff_i * molarity_M * PHYSICS_CONSTANTS.R * T_K; // Pa
  return parseFloat((pi / 1000).toFixed(3)); // kPa
}

/**
 * Water potential: Ψ = Ψ_s + Ψ_p
 * Ψ_s = solute potential = -iCRT (negative always)
 * Ψ_p = pressure potential
 */
export function waterPotential(molarity_M: number, temp_C: number, pressure_kPa = 0): number {
  const T_K = temp_C + 273.15;
  const psi_s = -molarity_M * PHYSICS_CONSTANTS.R * T_K / 1000; // kPa
  return parseFloat((psi_s + pressure_kPa).toFixed(3));
}

// ─── MATH: GRAPH UTILITIES ────────────────────────────────────────────────────
export interface DataPoint { x: number; y: number; }

/** Linear regression: y = mx + c; returns {slope, intercept, r_squared} */
export function linearRegression(points: DataPoint[]): { slope: number; intercept: number; r_squared: number } {
  const n = points.length;
  const sum_x = points.reduce((s, p) => s + p.x, 0);
  const sum_y = points.reduce((s, p) => s + p.y, 0);
  const sum_xy = points.reduce((s, p) => s + p.x * p.y, 0);
  const sum_x2 = points.reduce((s, p) => s + p.x * p.x, 0);
  const slope = (n * sum_xy - sum_x * sum_y) / (n * sum_x2 - sum_x ** 2);
  const intercept = (sum_y - slope * sum_x) / n;

  const y_mean = sum_y / n;
  const ss_tot = points.reduce((s, p) => s + (p.y - y_mean) ** 2, 0);
  const ss_res = points.reduce((s, p) => s + (p.y - (slope * p.x + intercept)) ** 2, 0);
  const r_squared = 1 - ss_res / ss_tot;

  return {
    slope: parseFloat(slope.toFixed(6)),
    intercept: parseFloat(intercept.toFixed(6)),
    r_squared: parseFloat(r_squared.toFixed(6)),
  };
}

/** Generate L vs T² data points for pendulum experiment */
export function pendulumDataTable(env: EnvironmentState): DataPoint[] {
  const lengths = [0.4, 0.6, 0.8, 1.0, 1.2, 1.5, 1.8, 2.0];
  const g = localGravity(env);
  return lengths.map(L => {
    const T = pendulumPeriod(L, g);
    const T_meas = gaussianNoise(T, 0.01);
    return { x: L, y: parseFloat((T_meas ** 2).toFixed(4)) };
  });
}

/** g from L-T² slope: slope = 4π²/g  →  g = 4π²/slope */
export function gFromSlope(slope: number): number {
  return parseFloat((4 * Math.PI ** 2 / slope).toFixed(4));
}

// ─── CHROMATOGRAPHY: Rf VALUE ─────────────────────────────────────────────────
export interface Pigment { name: string; color: string; Rf_expected: number; description: string; }

export const SPINACH_PIGMENTS: Pigment[] = [
  { name: 'β-Carotene',      color: '#f97316', Rf_expected: 0.98, description: 'Orange — most non-polar, travels farthest' },
  { name: 'Phaeophytin',     color: '#78716c', Rf_expected: 0.83, description: 'Olive-brown — degraded chlorophyll' },
  { name: 'Chlorophyll a',   color: '#166534', Rf_expected: 0.65, description: 'Blue-green — primary photosynthetic pigment' },
  { name: 'Chlorophyll b',   color: '#4ade80', Rf_expected: 0.45, description: 'Yellow-green — accessory pigment' },
  { name: 'Xanthophyll',     color: '#fbbf24', Rf_expected: 0.28, description: 'Yellow — oxygen-containing carotenoid' },
];

export function calculateRf(distance_solute_cm: number, distance_solvent_cm: number): number {
  if (distance_solvent_cm === 0) return 0;
  return parseFloat((distance_solute_cm / distance_solvent_cm).toFixed(3));
}

// ─── ERROR ANALYSIS ───────────────────────────────────────────────────────────
export interface ErrorAnalysis {
  mean: number;
  std_deviation: number;
  std_error: number;
  relative_error_pct: number;
  absolute_uncertainty: number;
}

export function analyzeReadings(readings: number[]): ErrorAnalysis {
  const n = readings.length;
  const mean = readings.reduce((a, b) => a + b, 0) / n;
  const variance = readings.reduce((s, v) => s + (v - mean) ** 2, 0) / (n - 1);
  const std_dev = Math.sqrt(variance);
  const std_err = std_dev / Math.sqrt(n);
  return {
    mean: parseFloat(mean.toFixed(5)),
    std_deviation: parseFloat(std_dev.toFixed(5)),
    std_error: parseFloat(std_err.toFixed(5)),
    relative_error_pct: parseFloat((std_err / mean * 100).toFixed(3)),
    absolute_uncertainty: parseFloat((2 * std_err).toFixed(5)), // 95% CI
  };
}
