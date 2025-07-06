// Electron API types
declare global {
  interface Window {
    ipcRenderer?: {
      on: (channel: string, listener: (event: any, ...args: any[]) => void) => void;
      off: (channel: string, ...args: any[]) => void;
      send: (channel: string, ...args: any[]) => void;
      invoke: (channel: string, ...args: any[]) => Promise<any>;
    };
    api?: {
      // Meter service
      processText: (text: string) => Promise<Array<[string, number]>>;
      countLine: (line: string) => Promise<number>;
      
      // Config service
      getConfig: () => Promise<any>;
      saveConfig: (config: any) => Promise<boolean>;
      
      // Styles service
      getAllStyles: () => Promise<any[]>;
      getStyleById: (id: string) => Promise<any>;
      createStyle: (style: any) => Promise<any>;
      updateStyle: (id: string, updates: any) => Promise<any>;
      deleteStyle: (id: string) => Promise<boolean>;
    };
  }
}

export {};
