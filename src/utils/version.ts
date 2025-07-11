// Get the version from package.json
export const getVersion = (): string => {
  // Access the version through the global variable defined in vite.config.ts
  return __APP_VERSION__;
};