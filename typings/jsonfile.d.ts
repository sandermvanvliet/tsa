declare module "jsonfile" {
    export function writeFile(fileName: string, allMetrics: any, options: any, callback: (err:any) => void): void;
}