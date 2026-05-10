
type Persistence = {
  setItem(key: string, value: string): Promise<void>;
  getItem(key: string): Promise<string | null>;
  removeItem(key: string): Promise<void>;
  clear(): Promise<void>;
};

const store: Persistence = (window as any).persistentStorage ?? {
  setItem(key: string, value: string) {
    localStorage.setItem(key, value);
    return Promise.resolve();
  },
  getItem(key: string) {
    return Promise.resolve(localStorage.getItem(key));
  },
  removeItem(key: string) {
    localStorage.removeItem(key);
    return Promise.resolve();
  },
  clear() {
    localStorage.clear();
    return Promise.resolve();
  },
};

export const persistence: Persistence = store;
