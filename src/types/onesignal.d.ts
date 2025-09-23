// TypeScript declaration for window.OneSignal
interface OneSignalAPI {
  push(callback: () => void): void;
  init(options: Record<string, any>): void;
}

interface Window {
  OneSignal?: OneSignalAPI;
}

declare var OneSignal: OneSignalAPI | undefined;
