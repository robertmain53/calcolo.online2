'use client';

import { useMemo, useState } from 'react';
import AuthorReviewerBox from '@/components/AuthorReviewerBox';

type SystemType = 'dc' | 'ac_single' | 'ac_three';
type ThreePhaseVoltageType = 'line_to_line' | 'line_to_neutral';
type VoltageUnit = 'V' | 'kV';
type CurrentUnit = 'A' | 'mA';
type ImpedanceUnit = 'Ω' | 'kΩ' | 'MΩ';
type ActivePowerUnit = 'W' | 'kW';
type ApparentPowerUnit = 'VA' | 'kVA';
type ReactivePowerUnit = 'var' | 'kvar';

interface BaseInputs {
  system: SystemType;
  voltage: number | null;
  current: number | null;
  impedance: number | null;
  activePower: number | null;
  apparentPower: number | null;
  reactivePower: number | null;
  powerFactor: number | null;
  threePhaseVoltageType: ThreePhaseVoltageType;
}

interface CalculationResult {
  system: SystemType;
  displayVoltage: number;
  lineVoltage?: number | null;
  phaseVoltage?: number | null;
  current: number;
  impedance?: number | null;
  resistance?: number | null;
  reactance?: number | null;
  activePower: number;
  apparentPower: number;
  reactivePower: number;
  powerFactor: number;
  phiDegrees: number;
  loadNature: 'induttivo' | 'capacitivo' | 'resistivo';
}

const unitMultipliers = {
  voltage: { V: 1, kV: 1_000 },
  current: { A: 1, mA: 0.001 },
  impedance: { 'Ω': 1, 'kΩ': 1_000, 'MΩ': 1_000_000 },
  activePower: { W: 1, kW: 1_000 },
  apparentPower: { VA: 1, kVA: 1_000 },
  reactivePower: { var: 1, kvar: 1_000 },
} as const;

function parseInput(value: string): number | null {
  if (!value.trim()) return null;
  const numeric = Number(value.replace(',', '.'));
  return Number.isFinite(numeric) ? numeric : null;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function formatWithAutoUnit(value: number, unit: 'V' | 'A' | 'Ω' | 'W' | 'VA' | 'var'): string {
  if (!Number.isFinite(value)) {
    return '—';
  }

  const absValue = Math.abs(value);
  let scaled = value;
  let suffix: string = unit;

  const formatter = new Intl.NumberFormat('it-IT', {
    maximumFractionDigits: absValue < 1 ? 4 : absValue < 10 ? 3 : 2,
  });

  switch (unit) {
    case 'V':
    case 'A': {
      if (absValue >= 1_000) {
        scaled = value / 1_000;
        suffix = `k${unit}`;
      } else if (absValue > 0 && absValue < 1) {
        scaled = value * 1_000;
        suffix = unit === 'V' ? 'mV' : 'mA';
      }
      break;
    }
    case 'Ω': {
      if (absValue >= 1_000_000) {
        scaled = value / 1_000_000;
        suffix = 'MΩ';
      } else if (absValue >= 1_000) {
        scaled = value / 1_000;
        suffix = 'kΩ';
      } else if (absValue > 0 && absValue < 1) {
        scaled = value * 1_000;
        suffix = 'mΩ';
      }
      break;
    }
    case 'W':
    case 'VA':
    case 'var': {
      const prefix = unit === 'W' ? 'W' : unit === 'VA' ? 'VA' : 'var';
      if (absValue >= 1_000_000) {
        scaled = value / 1_000_000;
        suffix = `M${prefix}`;
      } else if (absValue >= 1_000) {
        scaled = value / 1_000;
        suffix = `k${prefix}`;
      }
      break;
    }
    default:
      break;
  }

  return `${formatter.format(scaled)} ${suffix}`;
}

function getLoadNature(reactivePower: number): 'induttivo' | 'capacitivo' | 'resistivo' {
  if (!Number.isFinite(reactivePower) || Math.abs(reactivePower) < 1e-6) {
    return 'resistivo';
  }
  return reactivePower >= 0 ? 'induttivo' : 'capacitivo';
}

function solveDC(inputs: BaseInputs): CalculationResult | null {
  let { voltage, current, impedance, activePower } = inputs;

  const v = voltage;
  const i = current;
  const z = impedance;
  const p = activePower;

  if (v != null && i != null) {
    const computedImpedance = i !== 0 ? v / i : null;
    const computedPower = v * i;
    return {
      system: 'dc',
      displayVoltage: v,
      current: i,
      impedance: computedImpedance,
      resistance: computedImpedance,
      reactance: 0,
      activePower: computedPower,
      apparentPower: computedPower,
      reactivePower: 0,
      powerFactor: 1,
      phiDegrees: 0,
      loadNature: 'resistivo',
    };
  }

  if (v != null && z != null && z !== 0) {
    const computedCurrent = v / z;
    const computedPower = v * computedCurrent;
    return {
      system: 'dc',
      displayVoltage: v,
      current: computedCurrent,
      impedance: z,
      resistance: z,
      reactance: 0,
      activePower: computedPower,
      apparentPower: computedPower,
      reactivePower: 0,
      powerFactor: 1,
      phiDegrees: 0,
      loadNature: 'resistivo',
    };
  }

  if (i != null && z != null) {
    const computedVoltage = i * z;
    const computedPower = computedVoltage * i;
    return {
      system: 'dc',
      displayVoltage: computedVoltage,
      current: i,
      impedance: z,
      resistance: z,
      reactance: 0,
      activePower: computedPower,
      apparentPower: computedPower,
      reactivePower: 0,
      powerFactor: 1,
      phiDegrees: 0,
      loadNature: 'resistivo',
    };
  }

  if (v != null && p != null && v !== 0) {
    const computedCurrent = p / v;
    const computedImpedance = computedCurrent !== 0 ? v / computedCurrent : null;
    return {
      system: 'dc',
      displayVoltage: v,
      current: computedCurrent,
      impedance: computedImpedance,
      resistance: computedImpedance,
      reactance: 0,
      activePower: p,
      apparentPower: p,
      reactivePower: 0,
      powerFactor: 1,
      phiDegrees: 0,
      loadNature: 'resistivo',
    };
  }

  if (i != null && p != null && i !== 0) {
    const computedVoltage = p / i;
    const computedImpedance = i !== 0 ? computedVoltage / i : null;
    return {
      system: 'dc',
      displayVoltage: computedVoltage,
      current: i,
      impedance: computedImpedance,
      resistance: computedImpedance,
      reactance: 0,
      activePower: p,
      apparentPower: p,
      reactivePower: 0,
      powerFactor: 1,
      phiDegrees: 0,
      loadNature: 'resistivo',
    };
  }

  if (z != null && z !== 0 && p != null) {
    const computedCurrent = Math.sqrt(Math.max(p / z, 0));
    const computedVoltage = computedCurrent * z;
    return {
      system: 'dc',
      displayVoltage: computedVoltage,
      current: computedCurrent,
      impedance: z,
      resistance: z,
      reactance: 0,
      activePower: p,
      apparentPower: p,
      reactivePower: 0,
      powerFactor: 1,
      phiDegrees: 0,
      loadNature: 'resistivo',
    };
  }

  return null;
}

function solveSinglePhase(inputs: BaseInputs): CalculationResult | null {
  let { voltage, current, impedance, activePower, apparentPower, reactivePower, powerFactor } =
    inputs;

  let V = voltage ?? null;
  let I = current ?? null;
  let Z = impedance ?? null;
  let P = activePower ?? null;
  let S = apparentPower ?? null;
  let Q = reactivePower ?? null;
  let PF = powerFactor != null ? Math.abs(powerFactor) : null;
  let pfSign: 1 | -1 = 1;

  if (reactivePower != null && reactivePower < 0) {
    pfSign = -1;
  } else if (reactivePower != null && reactivePower > 0) {
    pfSign = 1;
  } else if (powerFactor != null && powerFactor < 0) {
    pfSign = -1;
  }

  const maxIterations = 10;
  let iterations = 0;
  let changed = true;

  while (changed && iterations < maxIterations) {
    iterations += 1;
    changed = false;

    if (Z != null) {
      if (I != null && (V == null || !Number.isFinite(V))) {
        V = I * Z;
        changed = true;
      }
      if (V != null && (I == null || !Number.isFinite(I)) && Z !== 0) {
        I = V / Z;
        changed = true;
      }
    }

    if (V != null && I != null && (S == null || !Number.isFinite(S))) {
      S = V * I;
      changed = true;
    }

    if (S != null && PF != null && (P == null || !Number.isFinite(P)) && PF !== 0) {
      P = S * PF;
      changed = true;
    }

    if (P != null && PF != null && (S == null || !Number.isFinite(S)) && PF !== 0) {
      S = P / PF;
      changed = true;
    }

    if (P != null && S != null && (PF == null || !Number.isFinite(PF)) && S !== 0) {
      PF = clamp(Math.abs(P / S), 0, 1);
      changed = true;
    }

    if (P != null && Q != null && (S == null || !Number.isFinite(S))) {
      S = Math.hypot(P, Q);
      changed = true;
    }

    if (S != null && Q == null && PF != null) {
      const phi = Math.acos(clamp(PF, 0, 1));
      Q = S * Math.sin(phi) * pfSign;
      changed = true;
    }

    if (S != null && Q != null && (P == null || !Number.isFinite(P))) {
      const possibleP = Math.sqrt(Math.max(S * S - Q * Q, 0));
      if (Number.isFinite(possibleP)) {
        P = possibleP;
        changed = true;
      }
    }

    if (S != null && V != null && (I == null || !Number.isFinite(I)) && V !== 0) {
      I = S / V;
      changed = true;
    }

    if (S != null && I != null && (V == null || !Number.isFinite(V)) && I !== 0) {
      V = S / I;
      changed = true;
    }

    if (
      Z != null &&
      PF != null &&
      P != null &&
      (I == null || !Number.isFinite(I)) &&
      Z !== 0 &&
      PF !== 0
    ) {
      const derivedCurrent = Math.sqrt(Math.max(P / (Z * PF), 0));
      if (Number.isFinite(derivedCurrent)) {
        I = derivedCurrent;
        changed = true;
      }
    }
  }

  if (V == null || I == null || P == null) {
    return null;
  }

  if (S == null) {
    S = V * I;
  }

  if (PF == null) {
    PF = S !== 0 ? clamp(Math.abs(P / S), 0, 1) : 1;
  }

  if (Q == null && S != null && PF != null) {
    const phi = Math.acos(clamp(PF, 0, 1));
    Q = S * Math.sin(phi) * pfSign;
  }

  if (Q != null && Math.abs(Q) > 1e-6) {
    pfSign = Q >= 0 ? 1 : -1;
  }

  if (Z == null && I !== 0) {
    Z = V / I;
  }

  const pfMagnitude = clamp(PF ?? 1, 0, 1);
  const signedPowerFactor = pfMagnitude * (pfSign >= 0 ? 1 : -1);
  const phiRadians = Math.acos(pfMagnitude) * (pfSign >= 0 ? 1 : -1);
  const resistance = Z != null ? Z * pfMagnitude : null;
  const reactance =
    Z != null ? Z * Math.sqrt(Math.max(1 - pfMagnitude * pfMagnitude, 0)) * (pfSign >= 0 ? 1 : -1) : null;

  const finalReactive = Q ?? 0;

  return {
    system: 'ac_single',
    displayVoltage: V,
    current: I,
    impedance: Z,
    resistance,
    reactance,
    activePower: P,
    apparentPower: S ?? V * I,
    reactivePower: finalReactive,
    powerFactor: signedPowerFactor,
    phiDegrees: (phiRadians * 180) / Math.PI,
    loadNature: getLoadNature(finalReactive),
  };
}

function solveThreePhase(inputs: BaseInputs): CalculationResult | null {
  const sqrt3 = Math.sqrt(3);

  let lineVoltage =
    inputs.voltage != null
      ? inputs.threePhaseVoltageType === 'line_to_line'
        ? inputs.voltage
        : inputs.voltage * sqrt3
      : null;

  let phaseVoltage =
    inputs.voltage != null
      ? inputs.threePhaseVoltageType === 'line_to_line'
        ? inputs.voltage / sqrt3
        : inputs.voltage
      : lineVoltage != null
      ? lineVoltage / sqrt3
      : null;

  let I = inputs.current ?? null;
  let Z = inputs.impedance ?? null;
  let P = inputs.activePower ?? null;
  let S = inputs.apparentPower ?? null;
  let Q = inputs.reactivePower ?? null;
  let PF = inputs.powerFactor != null ? Math.abs(inputs.powerFactor) : null;
  let pfSign: 1 | -1 = 1;

  if (inputs.reactivePower != null && inputs.reactivePower < 0) {
    pfSign = -1;
  } else if (inputs.reactivePower != null && inputs.reactivePower > 0) {
    pfSign = 1;
  } else if (inputs.powerFactor != null && inputs.powerFactor < 0) {
    pfSign = -1;
  }

  const maxIterations = 12;
  let iterations = 0;
  let changed = true;

  while (changed && iterations < maxIterations) {
    iterations += 1;
    changed = false;

    if (Z != null) {
      if (I != null && (phaseVoltage == null || !Number.isFinite(phaseVoltage))) {
        phaseVoltage = I * Z;
        lineVoltage = phaseVoltage * sqrt3;
        changed = true;
      }
      if (phaseVoltage != null && (I == null || !Number.isFinite(I)) && Z !== 0) {
        I = phaseVoltage / Z;
        changed = true;
      }
      if (lineVoltage != null && (I == null || !Number.isFinite(I)) && Z !== 0) {
        I = lineVoltage / (sqrt3 * Z);
        phaseVoltage = lineVoltage / sqrt3;
        changed = true;
      }
    }

    if (lineVoltage != null && I != null && (S == null || !Number.isFinite(S))) {
      S = sqrt3 * lineVoltage * I;
      changed = true;
    }

    if (phaseVoltage != null && I != null && (S == null || !Number.isFinite(S))) {
      S = 3 * phaseVoltage * I;
      changed = true;
    }

    if (S != null && PF != null && (P == null || !Number.isFinite(P)) && PF !== 0) {
      P = S * PF;
      changed = true;
    }

    if (P != null && PF != null && (S == null || !Number.isFinite(S)) && PF !== 0) {
      S = P / PF;
      changed = true;
    }

    if (P != null && S != null && (PF == null || !Number.isFinite(PF)) && S !== 0) {
      PF = clamp(Math.abs(P / S), 0, 1);
      changed = true;
    }

    if (P != null && Q != null && (S == null || !Number.isFinite(S))) {
      S = Math.hypot(P, Q);
      changed = true;
    }

    if (S != null && Q == null && PF != null) {
      const phi = Math.acos(clamp(PF, 0, 1));
      Q = S * Math.sin(phi) * pfSign;
      changed = true;
    }

    if (S != null && Q != null && (P == null || !Number.isFinite(P))) {
      const possibleP = Math.sqrt(Math.max(S * S - Q * Q, 0));
      if (Number.isFinite(possibleP)) {
        P = possibleP;
        changed = true;
      }
    }

    if (S != null && I != null && (lineVoltage == null || !Number.isFinite(lineVoltage)) && I !== 0) {
      lineVoltage = S / (sqrt3 * I);
      phaseVoltage = lineVoltage / sqrt3;
      changed = true;
    }

    if (S != null && lineVoltage != null && (I == null || !Number.isFinite(I)) && lineVoltage !== 0) {
      I = S / (sqrt3 * lineVoltage);
      phaseVoltage = lineVoltage / sqrt3;
      changed = true;
    }

    if (
      P != null &&
      PF != null &&
      I != null &&
      (lineVoltage == null || !Number.isFinite(lineVoltage)) &&
      PF !== 0 &&
      I !== 0
    ) {
      lineVoltage = P / (sqrt3 * I * PF);
      phaseVoltage = lineVoltage / sqrt3;
      changed = true;
    }

    if (
      Z != null &&
      PF != null &&
      P != null &&
      (I == null || !Number.isFinite(I)) &&
      Z !== 0 &&
      PF !== 0
    ) {
      const derivedCurrent = Math.sqrt(Math.max(P / (3 * Z * PF), 0));
      if (Number.isFinite(derivedCurrent)) {
        I = derivedCurrent;
        phaseVoltage = derivedCurrent * Z;
        lineVoltage = phaseVoltage * sqrt3;
        changed = true;
      }
    }
  }

  if (lineVoltage == null || I == null || P == null) {
    return null;
  }

  if (S == null) {
    S = sqrt3 * lineVoltage * I;
  }

  if (PF == null) {
    PF = S !== 0 ? clamp(Math.abs(P / S), 0, 1) : 1;
  }

  if (Q == null && S != null && PF != null) {
    const phi = Math.acos(clamp(PF, 0, 1));
    Q = S * Math.sin(phi) * pfSign;
  }

  if (Q != null && Math.abs(Q) > 1e-6) {
    pfSign = Q >= 0 ? 1 : -1;
  }

  if (phaseVoltage == null) {
    phaseVoltage = lineVoltage / sqrt3;
  }

  if (Z == null && I !== 0) {
    Z = phaseVoltage / I;
  }

  const pfMagnitude = clamp(PF ?? 1, 0, 1);
  const signedPowerFactor = pfMagnitude * (pfSign >= 0 ? 1 : -1);
  const phiRadians = Math.acos(pfMagnitude) * (pfSign >= 0 ? 1 : -1);
  const resistance = Z != null ? Z * pfMagnitude : null;
  const reactance =
    Z != null ? Z * Math.sqrt(Math.max(1 - pfMagnitude * pfMagnitude, 0)) * (pfSign >= 0 ? 1 : -1) : null;

  const displayVoltage =
    inputs.threePhaseVoltageType === 'line_to_line'
      ? lineVoltage
      : phaseVoltage;

  const finalReactive = Q ?? 0;

  return {
    system: 'ac_three',
    lineVoltage,
    phaseVoltage,
    displayVoltage: displayVoltage ?? lineVoltage,
    current: I,
    impedance: Z,
    resistance,
    reactance,
    activePower: P,
    apparentPower: S ?? sqrt3 * lineVoltage * I,
    reactivePower: finalReactive,
    powerFactor: signedPowerFactor,
    phiDegrees: (phiRadians * 180) / Math.PI,
    loadNature: getLoadNature(finalReactive),
  };
}

function computeResult(inputs: BaseInputs): CalculationResult | null {
  switch (inputs.system) {
    case 'dc':
      return solveDC(inputs);
    case 'ac_single':
      return solveSinglePhase(inputs);
    case 'ac_three':
      return solveThreePhase(inputs);
    default:
      return null;
  }
}

export default function OhmsLawPowerCalculator() {
  const [system, setSystem] = useState<SystemType>('ac_three');
  const [voltage, setVoltage] = useState('400');
  const [voltageUnit, setVoltageUnit] = useState<VoltageUnit>('V');
  const [current, setCurrent] = useState('32');
  const [currentUnit, setCurrentUnit] = useState<CurrentUnit>('A');
  const [impedance, setImpedance] = useState('');
  const [impedanceUnit, setImpedanceUnit] = useState<ImpedanceUnit>('Ω');
  const [activePower, setActivePower] = useState('18');
  const [activePowerUnit, setActivePowerUnit] = useState<ActivePowerUnit>('kW');
  const [apparentPower, setApparentPower] = useState('');
  const [apparentPowerUnit, setApparentPowerUnit] = useState<ApparentPowerUnit>('kVA');
  const [reactivePower, setReactivePower] = useState('');
  const [reactivePowerUnit, setReactivePowerUnit] = useState<ReactivePowerUnit>('kvar');
  const [powerFactor, setPowerFactor] = useState('0.92');
  const [threePhaseVoltageType, setThreePhaseVoltageType] =
    useState<ThreePhaseVoltageType>('line_to_line');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const parsedInputs = useMemo<BaseInputs>(() => {
    const numericVoltage = parseInput(voltage);
    const voltageBase =
      numericVoltage != null ? numericVoltage * unitMultipliers.voltage[voltageUnit] : null;

    const numericCurrent = parseInput(current);
    const currentBase =
      numericCurrent != null ? numericCurrent * unitMultipliers.current[currentUnit] : null;

    const numericImpedance = parseInput(impedance);
    const impedanceBase =
      numericImpedance != null
        ? numericImpedance * unitMultipliers.impedance[impedanceUnit]
        : null;

    const numericActivePower = parseInput(activePower);
    const activePowerBase =
      numericActivePower != null
        ? numericActivePower * unitMultipliers.activePower[activePowerUnit]
        : null;

    const numericApparentPower = parseInput(apparentPower);
    const apparentPowerBase =
      numericApparentPower != null
        ? numericApparentPower * unitMultipliers.apparentPower[apparentPowerUnit]
        : null;

    const numericReactivePower = parseInput(reactivePower);
    const reactivePowerBase =
      numericReactivePower != null
        ? numericReactivePower * unitMultipliers.reactivePower[reactivePowerUnit]
        : null;

    const numericPowerFactor = parseInput(powerFactor);
    const powerFactorClamped =
      numericPowerFactor != null ? clamp(numericPowerFactor, -1, 1) : null;

    return {
      system,
      voltage: voltageBase,
      current: currentBase,
      impedance: impedanceBase,
      activePower: activePowerBase,
      apparentPower: apparentPowerBase,
      reactivePower: reactivePowerBase,
      powerFactor: powerFactorClamped,
      threePhaseVoltageType,
    };
  }, [
    system,
    voltage,
    voltageUnit,
    current,
    currentUnit,
    impedance,
    impedanceUnit,
    activePower,
    activePowerUnit,
    apparentPower,
    apparentPowerUnit,
    reactivePower,
    reactivePowerUnit,
    powerFactor,
    threePhaseVoltageType,
  ]);

  const result = useMemo(() => computeResult(parsedInputs), [parsedInputs]);

  const warnings = useMemo(() => {
    if (!result) {
      return [];
    }
    const list: string[] = [];
    const pfMagnitude = Math.abs(result.powerFactor);

    if (pfMagnitude < 0.9) {
      list.push(
        `|cos φ| pari a ${pfMagnitude.toFixed(2)}: valuta il rifasamento per allinearti ai requisiti minimi CEI 0-16 / CEI EN 50160 (≥ 0,95 in media mensile).`
      );
    }

    if (pfMagnitude > 1.001) {
      list.push(
        'Il fattore di potenza calcolato esce dal campo fisicamente ammissibile (|cos φ| ≤ 1). Controlla i dati inseriti e le unità di misura.'
      );
    }

    if (Math.abs(result.reactance ?? 0) < 1e-4 && result.system !== 'dc') {
      list.push(
        'Reattanza trascurabile: il modello è assimilabile a un carico puramente resistivo (cos φ ≈ 1).'
      );
    }

    if (result.system === 'ac_three' && result.lineVoltage != null && result.lineVoltage > 1_000) {
      list.push(
        'Tensione di linea superiore a 1 kV: assicurati di applicare le prescrizioni CEI 11-1 per sistemi in media tensione.'
      );
    }

    return list;
  }, [result]);

  const assumptions = useMemo(() => {
    if (!result) {
      return [];
    }

    const baseAssumptions = [
      'Carico equilibrato e sinusoidale, trascurando armoniche e squilibri.',
      'Il fattore di potenza inserito è considerato costante sull’intero intervallo di misura.',
      'Le grandezze sono valori efficaci (RMS).',
    ];

    if (result.system === 'dc') {
      baseAssumptions.push(
        'Si assume un circuito lineare privo di cadute accessorie su conduttori o contatti.'
      );
    } else if (result.system === 'ac_three') {
      baseAssumptions.push(
        'Sistema trifase a tre fili con sequenza regolare e tensioni simmetriche.'
      );
    }

    return baseAssumptions;
  }, [result]);

  const loadQualityBadge = useMemo(() => {
    if (!result) return { label: '—', tone: 'neutral' as const };
    const magnitude = Math.abs(result.powerFactor);
    if (magnitude >= 0.98) return { label: 'Eccellente', tone: 'success' as const };
    if (magnitude >= 0.95) return { label: 'Buono', tone: 'info' as const };
    if (magnitude >= 0.9) return { label: 'Adeguato', tone: 'warning' as const };
    return { label: 'Critico', tone: 'danger' as const };
  }, [result]);

  return (
    <div className="calculator-widget space-y-10">
      <section className="section-card border-blue-100">
        <h2 className="text-2xl font-semibold text-gray-900">
          Inserisci i dati del circuito elettrico
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Il tool calcola tensione, corrente, impedenza e potenze P-Q-S in modo coerente con la
          Legge di Ohm e le relazioni per la potenza elettrica in sistemi DC, monofase e trifase.
          Compila almeno due grandezze principali: il calcolatore ricaverà in automatico le altre.
        </p>

        <div className="mt-6 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label htmlFor="system" className="calculator-label">
                Tipologia di circuito
              </label>
              <select
                id="system"
                value={system}
                onChange={(event) => setSystem(event.target.value as SystemType)}
                className="calculator-input"
              >
                <option value="dc">Corrente continua (DC)</option>
                <option value="ac_single">Monofase AC</option>
                <option value="ac_three">Trifase AC</option>
              </select>
            </div>

            <div className="sm:col-span-2 lg:col-span-2 flex items-center gap-4">
              <label className="calculator-label mb-0">Unità avanzate</label>
              <button
                type="button"
                className="rounded-md border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 hover:bg-blue-100"
                onClick={() => setShowAdvanced((prev) => !prev)}
              >
                {showAdvanced ? 'Nascondi unità extra' : 'Mostra unità e potenze S/Q'}
              </button>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="voltage" className="calculator-label">
                    Tensione
                    {system === 'ac_three'
                      ? threePhaseVoltageType === 'line_to_line'
                        ? ' (V linea)'
                        : ' (V fase)'
                      : ' (V)'}
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="voltage"
                      type="number"
                      inputMode="decimal"
                      value={voltage}
                      onChange={(event) => setVoltage(event.target.value)}
                      className="calculator-input flex-1"
                      placeholder={system === 'ac_three' ? 'es. 400' : 'es. 230'}
                    />
                    <select
                      value={voltageUnit}
                      onChange={(event) => setVoltageUnit(event.target.value as VoltageUnit)}
                      className="calculator-input w-24"
                    >
                      <option value="V">V</option>
                      <option value="kV">kV</option>
                    </select>
                  </div>
                </div>

                {system === 'ac_three' && (
                  <div>
                    <label htmlFor="voltageType" className="calculator-label">
                      Riferimento tensione
                    </label>
                    <select
                      id="voltageType"
                      value={threePhaseVoltageType}
                      onChange={(event) =>
                        setThreePhaseVoltageType(event.target.value as ThreePhaseVoltageType)
                      }
                      className="calculator-input"
                    >
                      <option value="line_to_line">Linea-linea (V<sub>LL</sub>)</option>
                      <option value="line_to_neutral">Linea-neutro (V<sub>LN</sub>)</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="current" className="calculator-label">
                    Corrente (I)
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="current"
                      type="number"
                      inputMode="decimal"
                      value={current}
                      onChange={(event) => setCurrent(event.target.value)}
                      className="calculator-input flex-1"
                      placeholder="es. 32"
                    />
                    <select
                      value={currentUnit}
                      onChange={(event) => setCurrentUnit(event.target.value as CurrentUnit)}
                      className="calculator-input w-24"
                    >
                      <option value="A">A</option>
                      <option value="mA">mA</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="impedance" className="calculator-label">
                    Resistenza / |Z|
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="impedance"
                      type="number"
                      inputMode="decimal"
                      value={impedance}
                      onChange={(event) => setImpedance(event.target.value)}
                      className="calculator-input flex-1"
                      placeholder="opzionale"
                    />
                    <select
                      value={impedanceUnit}
                      onChange={(event) => setImpedanceUnit(event.target.value as ImpedanceUnit)}
                      className="calculator-input w-24"
                    >
                      <option value="Ω">Ω</option>
                      <option value="kΩ">kΩ</option>
                      <option value="MΩ">MΩ</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="activePower" className="calculator-label">
                    Potenza attiva P
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="activePower"
                      type="number"
                      inputMode="decimal"
                      value={activePower}
                      onChange={(event) => setActivePower(event.target.value)}
                      className="calculator-input flex-1"
                      placeholder="es. 18"
                    />
                    <select
                      value={activePowerUnit}
                      onChange={(event) => setActivePowerUnit(event.target.value as ActivePowerUnit)}
                      className="calculator-input w-24"
                    >
                      <option value="W">W</option>
                      <option value="kW">kW</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="powerFactor" className="calculator-label">
                    cos&nbsp;φ
                  </label>
                  <input
                    id="powerFactor"
                    type="number"
                    min="-1"
                    max="1"
                    step="0.01"
                    value={powerFactor}
                    onChange={(event) => setPowerFactor(event.target.value)}
                    className="calculator-input"
                    placeholder="es. 0.92"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Inserisci valori negativi per carichi capacitivi. Lascia vuoto per calcolarlo da P
                    e S.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div
                className={`grid gap-4 sm:grid-cols-2 transition-all ${
                  showAdvanced ? 'max-h-[500px] opacity-100' : 'max-h-0 overflow-hidden opacity-0'
                }`}
              >
                <div>
                  <label htmlFor="apparentPower" className="calculator-label">
                    Potenza apparente S
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="apparentPower"
                      type="number"
                      inputMode="decimal"
                      value={apparentPower}
                      onChange={(event) => setApparentPower(event.target.value)}
                      className="calculator-input flex-1"
                      placeholder="opzionale"
                    />
                    <select
                      value={apparentPowerUnit}
                      onChange={(event) =>
                        setApparentPowerUnit(event.target.value as ApparentPowerUnit)
                      }
                      className="calculator-input w-24"
                    >
                      <option value="VA">VA</option>
                      <option value="kVA">kVA</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="reactivePower" className="calculator-label">
                    Potenza reattiva Q
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="reactivePower"
                      type="number"
                      inputMode="decimal"
                      value={reactivePower}
                      onChange={(event) => setReactivePower(event.target.value)}
                      className="calculator-input flex-1"
                      placeholder="opzionale"
                    />
                    <select
                      value={reactivePowerUnit}
                      onChange={(event) =>
                        setReactivePowerUnit(event.target.value as ReactivePowerUnit)
                      }
                      className="calculator-input w-24"
                    >
                      <option value="var">var</option>
                      <option value="kvar">kvar</option>
                    </select>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Segno positivo per carichi induttivi, negativo per capacitivi.
                  </p>
                </div>
              </div>

              <div className="rounded-md border border-gray-200 bg-gray-50/70 px-4 py-3 text-sm text-gray-600">
                <p className="font-medium text-gray-900">Suggerimento professionale</p>
                <p>
                  Se conosci tensione e potenza nominale di targa, inserisci cos φ dal certificato CE
                  per ottenere subito corrente e dimensionare le protezioni secondo CEI 64-8 art.
                  433.1.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {result ? (
        <section className="section-card border-green-100">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Risultati principali</h3>
              <p className="text-sm text-gray-600">
                Riepilogo completo delle grandezze calcolate. Usa questi valori per verificare la
                conformità con CEI 64-8, CEI EN 50160 e per la compilazione del report tecnico.
              </p>
            </div>
            <div
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                loadQualityBadge.tone === 'success'
                  ? 'bg-emerald-100 text-emerald-700'
                  : loadQualityBadge.tone === 'info'
                  ? 'bg-blue-100 text-blue-700'
                  : loadQualityBadge.tone === 'warning'
                  ? 'bg-amber-100 text-amber-700'
                  : loadQualityBadge.tone === 'danger'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              Qualità fattore di potenza: {loadQualityBadge.label}
            </div>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-gray-500">Tensione</p>
              <p className="mt-1 text-lg font-semibold text-gray-900">
                {formatWithAutoUnit(result.displayVoltage, 'V')}
              </p>
              {result.system === 'ac_three' && result.lineVoltage != null && (
                <p className="mt-2 text-sm text-gray-600">
                  V<sub>LL</sub>: {formatWithAutoUnit(result.lineVoltage, 'V')} • V<sub>LN</sub>:{' '}
                  {formatWithAutoUnit(
                    result.phaseVoltage ?? result.lineVoltage / Math.sqrt(3),
                    'V'
                  )}
                </p>
              )}
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-gray-500">Corrente</p>
              <p className="mt-1 text-lg font-semibold text-gray-900">
                {formatWithAutoUnit(result.current, 'A')}
              </p>
              {result.system === 'ac_three' && (
                <p className="mt-2 text-sm text-gray-600">
                  Corrente di linea uguale alla corrente di fase per carico equilibrato.
                </p>
              )}
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-gray-500">Impedenza equivalente</p>
              <p className="mt-1 text-lg font-semibold text-gray-900">
                {formatWithAutoUnit(result.impedance ?? Number.NaN, 'Ω')}
              </p>
              {result.resistance != null && (
                <p className="mt-2 text-sm text-gray-600">
                  Parte resistiva R: {formatWithAutoUnit(result.resistance, 'Ω')}
                </p>
              )}
              {result.reactance != null && (
                <p className="text-sm text-gray-600">
                  Parte reattiva X: {formatWithAutoUnit(result.reactance, 'Ω')}
                </p>
              )}
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-gray-500">Potenza attiva P</p>
              <p className="mt-1 text-lg font-semibold text-gray-900">
                {formatWithAutoUnit(result.activePower, 'W')}
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-gray-500">Potenza apparente S</p>
              <p className="mt-1 text-lg font-semibold text-gray-900">
                {formatWithAutoUnit(result.apparentPower, 'VA')}
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-gray-500">Potenza reattiva Q</p>
              <p className="mt-1 text-lg font-semibold text-gray-900">
                {formatWithAutoUnit(result.reactivePower, 'var')}
              </p>
              <p className="mt-2 text-sm text-gray-600">
                Carico {result.loadNature} • φ = {result.phiDegrees.toFixed(1)}°
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm md:col-span-2 xl:col-span-1">
              <p className="text-xs uppercase tracking-wide text-gray-500">Fattore di potenza</p>
              <p className="mt-1 text-lg font-semibold text-gray-900">
                cos φ = {result.powerFactor.toFixed(3)}
              </p>
              <p className="mt-2 text-sm text-gray-600">
                {result.powerFactor >= 0
                  ? 'Valore positivo → regime induttivo.'
                  : 'Valore negativo → regime capacitivo.'}
              </p>
            </div>
          </div>

          {warnings.length > 0 && (
            <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
              <h4 className="text-sm font-semibold text-amber-800">Avvertenze</h4>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-amber-800">
                {warnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50/80 p-4 text-sm text-gray-700">
            <h4 className="text-base font-semibold text-gray-900">Assunzioni modello</h4>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {assumptions.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </section>
      ) : (
        <section className="section-card border-amber-100">
          <h3 className="text-lg font-semibold text-gray-900">Inserisci almeno due grandezze</h3>
          <p className="mt-2 text-sm text-gray-600">
            Il calcolo richiede due grandezze indipendenti (es. tensione e corrente oppure tensione e
            potenza). Aggiungi i dati mancanti e il pannello risultati si aggiornerà in tempo reale.
          </p>
        </section>
      )}

      <section className="section-card border-gray-200">
        <h3 className="text-xl font-semibold text-gray-900">Formule utilizzate</h3>
        <p className="mt-2 text-sm text-gray-600">
          Il calcolatore implementa le relazioni della Legge di Ohm e delle potenze elettriche in
          conformità con il capitolo 2 delle CEI 64-8 e con CEI EN 50160.
        </p>

        <div className="mt-4 grid gap-6 lg:grid-cols-2">
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <h4 className="text-base font-semibold text-gray-900">Circuito in corrente continua</h4>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-gray-600">
              <li>Legge di Ohm: V = I · R</li>
              <li>Potenza: P = V · I = I² · R = V² / R</li>
              <li>Assenza di potenza reattiva (Q = 0)</li>
            </ul>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <h4 className="text-base font-semibold text-gray-900">Circuito monofase AC</h4>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-gray-600">
              <li>S = V · I</li>
              <li>P = V · I · cos φ</li>
              <li>Q = V · I · sin φ · segno(ind./cap.)</li>
              <li>|Z| = V / I e decomposizione R = |Z|·cos φ, X = |Z|·sin φ</li>
            </ul>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm lg:col-span-2">
            <h4 className="text-base font-semibold text-gray-900">Circuito trifase equilibrato</h4>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-gray-600">
              <li>S = √3 · V<sub>LL</sub> · I = 3 · V<sub>LN</sub> · I</li>
              <li>P = S · cos φ</li>
              <li>Q = S · sin φ · segno(ind./cap.)</li>
              <li>|Z<sub>fase</sub>| = V<sub>LN</sub> / I</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="section-card border-gray-200">
        <h3 className="text-xl font-semibold text-gray-900">Validazione e riferimenti normativi</h3>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-gray-600">
          <li>
            CEI 64-8 (ed. 2012) – Capitoli 2 e 5: definizioni di grandezze elettriche, limiti di
            progetto e verifiche per impianti BT.
          </li>
          <li>
            CEI EN 50160:2011 – Caratteristiche della tensione fornita dalle reti pubbliche di
            distribuzione.
          </li>
          <li>
            CEI 0-16 (ed. 2022) – Requisiti di rifasamento per la connessione alla rete MT.
          </li>
          <li>
            Linee guida ARERA 568/2019 – Penali per basso fattore di potenza e criteri di misura.
          </li>
        </ul>
        <p className="mt-3 text-sm text-gray-600">
          Per applicazioni critiche integra i risultati con misure strumentali certificate (analizzatore
          di rete conforme a CEI EN 61010) e includi le incertezze secondo la ISO/IEC Guide 98-3.
        </p>
      </section>

      <section className="section-card border-gray-200">
        <h3 className="text-xl font-semibold text-gray-900">Limitazioni e buone pratiche</h3>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-gray-600">
          <li>
            Il modello non considera le cadute di tensione sui cavi: per reti estese abbina il calcolo
            con il tool dedicato alla caduta di tensione.
          </li>
          <li>
            In presenza di armoniche significative occorre applicare fattori correttivi (IEC 61000-3-2)
            e valutare RMS true rispetto ai valori fondamentali.
          </li>
          <li>
            Per carichi sbilanciati occorre analizzare le correnti di sequenza e calcolare le potenze per
            singola fase.
          </li>
        </ul>
      </section>

      <AuthorReviewerBox
        writtenBy="Ing. Federico Bernardi, Specialista impianti elettrici"
        reviewedBy="Ing. Ugo Candido, Revisore Tecnico Capo"
        lastReviewDate="Marzo 2025"
        referenceStandard="CEI 64-8, CEI EN 50160, CEI 0-16"
      />

      <section className="section-card border-gray-200">
        <h3 className="text-xl font-semibold text-gray-900">Disclaimer professionale</h3>
        <p className="mt-2 text-sm text-gray-600">
          Il risultato è pensato come supporto al progettista. Prima di validare elaborati ufficiali,
          verifica sempre i dati con il software di calcolo aziendale o con misure in campo. Calcolo.online
          declina ogni responsabilità per usi difformi o mancata verifica da parte di un professionista
          abilitato.
        </p>
      </section>
    </div>
  );
}
