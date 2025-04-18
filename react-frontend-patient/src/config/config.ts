export interface IGlobalConfig {
    apiBaseURI: string
}

const config: IGlobalConfig = {
    apiBaseURI: "http://localhost:80"
};

export { config };