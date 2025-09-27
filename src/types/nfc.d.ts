// Web NFC API TypeScript declarations
declare global {
  interface Window {
    NDEFReader: {
      new (): NDEFReader;
    };
  }

  interface NDEFReader {
    scan(): Promise<void>;
    addEventListener(type: 'reading', listener: (event: NDEFReadingEvent) => void): void;
    addEventListener(type: 'readingerror', listener: (event: Event) => void): void;
  }

  interface NDEFReadingEvent extends Event {
    serialNumber: string;
    message: NDEFMessage;
  }

  interface NDEFMessage {
    records: NDEFRecord[];
  }

  interface NDEFRecord {
    recordType: string;
    mediaType?: string;
    id?: string;
    data: ArrayBuffer;
    encoding?: string;
    lang?: string;
  }
}

export {};
