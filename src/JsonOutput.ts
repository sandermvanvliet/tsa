import jsonfile = require("jsonfile");
import d = require("./Domain");

export module Output {
    export interface IFileMetricOutput {
        writeMetric(metric: d.Domain.FileMetric);
    }
    
    export class JsonOutput implements IFileMetricOutput {
        private allMetrics: d.Domain.FileMetric[];
        
        constructor(private fileName: string) {
            this.allMetrics = [];            
        }
        
        public writeMetric(metric: d.Domain.FileMetric) {
            this.allMetrics.push(metric);
        }
        
        public close() {
            jsonfile.writeFile(this.fileName, this.allMetrics);
        }
    }
}