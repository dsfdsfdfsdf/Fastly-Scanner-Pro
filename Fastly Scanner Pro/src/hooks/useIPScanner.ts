import { create } from "zustand";
import { persist } from "zustand/middleware";
import { randomizeElements } from "~/helpers/randomizeElements";

type ValidIP = {
  ip: string;
  latency: number;
};

const TRY_CHARS = ["", "|", "/", "-", "\\"] as const;
const MAX_TRIES = TRY_CHARS.length;
export type TryChar = (typeof TRY_CHARS)[number];

export type Settings = {
  maxIPCount: number;
  maxLatency: number;
  ipRegex: string;
};

type SettingKeys = keyof Settings;

type ScanState = "idle" | "stopping" | "scanning";

type ScannerStore = Settings & {
  testNo: number;
  validIPs: ValidIP[];
  currentIP: string;
  tryChar: TryChar;
  currentLatency: number;
  color: "red" | "green";
  scanState: ScanState;
  dispatch: (newState: Partial<ScannerStore>) => void;
  reset: () => void;
  increaseTestNo: () => void;
  addValidIP: (validIP: ValidIP) => void;
  setSettings: (newSettings: Partial<Settings>) => void;
  getScanState: () => ScanState;
  getValidIPCount: () => number;
};

type FunctionalKeys = {
  [K in keyof ScannerStore]: ScannerStore[K] extends (
    ...args: never[]
  ) => unknown
  ? K
  : never;
}[keyof ScannerStore];

function pick<T extends object, K extends keyof T>(base: T, ...keys: K[]) {
  const entries = keys.map((key) => [key, base[key]]);
  return Object.fromEntries(entries) as Pick<T, K>;
}

export const settingsInitialValues: Pick<ScannerStore, SettingKeys> = {
  maxIPCount: 5,
  maxLatency: 1000,
  ipRegex: "",
};

const initialState: Omit<ScannerStore, FunctionalKeys> = {
  ...settingsInitialValues,
  testNo: 0,
  validIPs: [],
  currentIP: "",
  tryChar: "",
  currentLatency: 0,
  color: "red",
  scanState: "idle",
};

export const useScannerStore = create<ScannerStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      getScanState: () => get().scanState,
      getValidIPCount: () => get().validIPs.length,
      setSettings: (newSettings) => {
        set(newSettings);
      },
      dispatch: (newState) => {
        set(newState);
      },
      addValidIP(validIP) {
        set((state) => {
          const validIPs = [...state.validIPs, validIP].sort(
            (a, b) => a.latency - b.latency
          );
          return {
            validIPs,
          };
        });
      },
      reset: () => {
        set({
          testNo: 0,
          validIPs: [],
          currentIP: "",
          tryChar: "",
          currentLatency: 0,
          color: "red",
          scanState: "idle",
        });
      },
      increaseTestNo: () => {
        set((state) => ({ testNo: state.testNo + 1 }));
      },
    }),
    {
      name: "scanner-store",
      partialize: (state) =>
        pick(
          state,
          ...(Object.keys(
            settingsInitialValues,
          ) as unknown as (keyof typeof settingsInitialValues)[]),
        ),
      version: 1,
    },
  ),
);

type IPScannerProps = {
  allIps: string[];
};

import { rangeToIpArray } from "~/helpers/rangeToIpArray";

export const useIPScanner = ({ allIps }: IPScannerProps) => {
  const {
    dispatch,
    reset,
    increaseTestNo,
    addValidIP,
    getScanState,
    getValidIPCount,
    ...state
  } = useScannerStore();
  function setToIdle() {
    dispatch({ scanState: "idle", tryChar: "" });
  }
  async function startScan() {
    reset();
    try {
      // Handle both individual IPs and IP ranges
      let ipsToUse: string[] = [];

      if (allIps.length > 0) {
        // Check if the first element looks like a range (contains '/')
        const firstElement = allIps[0];
        if (firstElement && firstElement.includes('/')) {
          // Expand ranges to individual IPs, but limit to prevent memory issues
          let totalIps = 0;
          const MAX_IPS = 5000; // Reasonable limit to prevent memory issues

          for (const range of allIps) {
            if (totalIps >= MAX_IPS) break;

            const parts = range.split('/');
            if (parts.length === 2) {
              const baseIP = parts[0];
              const maskStr = parts[1];
              if (!baseIP || !maskStr) continue;
              const mask = parseInt(maskStr, 10);
              if (isNaN(mask)) continue;
              if (mask < 20) continue;
              const rangeIps = rangeToIpArray(range);
              if (totalIps + rangeIps.length <= MAX_IPS) {
                ipsToUse = ipsToUse.concat(rangeIps);
                totalIps += rangeIps.length;
              } else {
                const remainingSlots = MAX_IPS - totalIps;
                const sampledIps = rangeIps.slice(0, remainingSlots);
                ipsToUse = ipsToUse.concat(sampledIps);
                totalIps = MAX_IPS;
                break;
              }
            }
          }
        } else {
          // These are already individual IPs
          ipsToUse = allIps;
        }
      }

      // Check if ipRegex is a CIDR range or a regex pattern
      let filteredIps: string[];
      if (state.ipRegex) {
        if (state.ipRegex.includes('/')) {
          // Treat as CIDR range: expand to individual IPs
          const customRange = state.ipRegex.trim();
          try {
            filteredIps = rangeToIpArray(customRange);
          } catch {
            filteredIps = [];
          }
        } else {
          // Treat as regex pattern: filter the IPs
          filteredIps = ipsToUse.filter((el) => new RegExp(state.ipRegex).test(el));
        }
      } else {
        filteredIps = ipsToUse;
      }

      dispatch({ scanState: "scanning" });
      await testIPs(randomizeElements(filteredIps));
      setToIdle();
    } catch (e) {
      console.error(e);
    }
  }

  function stopScan() {
    if (getScanState() === "scanning") {
      dispatch({ scanState: "stopping" });
    } else {
      setToIdle();
    }
  }

  async function testIPs(ipList: string[]) {
    // Match batch size with API capability
    const BATCH_SIZE = 20;

    for (let i = 0; i < ipList.length; i += BATCH_SIZE) {
      if (getScanState() !== "scanning" || getValidIPCount() >= state.maxIPCount) break;

      const batch = ipList.slice(i, i + BATCH_SIZE);

      // Update UI to show current progress
      if (batch[0]) {
        dispatch({ currentIP: batch[0], tryChar: "|", color: "red", currentLatency: 0 });
      }

      try {
        const response = await fetch("/api/test-ips", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ips: batch,
            timeout: Math.max(state.maxLatency, 3000),
          }),
        });

        if (!response.ok) {
          console.warn(`API error: ${response.status} ${response.statusText}`);
          // Pause briefly on error to avoid hammering the server if it's down
          await new Promise(resolve => setTimeout(resolve, 1000));
          continue;
        }

        const results: { ip: string; latency: number; valid: boolean }[] =
          await response.json();

        for (const result of results) {
          if (getScanState() !== "scanning" || getValidIPCount() >= state.maxIPCount) break;

          increaseTestNo();
          dispatch({
            currentIP: result.ip,
            currentLatency: result.latency,
            color: result.valid ? "green" : "red",
            tryChar: result.valid ? "" : "-",
          });

          if (result.valid && result.latency <= state.maxLatency) {
            if (!state.validIPs.some((v) => v.ip === result.ip)) {
              addValidIP({ ip: result.ip, latency: result.latency });
            }
          }
        }
      } catch (err) {
        console.error("Scanner error:", err);
        // Pause on network error
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Small delay between batches to be nice to the server
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }

  return {
    ...state,
    startScan,
    stopScan,
  };
};
