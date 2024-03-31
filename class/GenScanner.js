const fs = require('fs');

class GenScanner {
    constructor(yalexNFA, regexesData) {
        this.newFile = ``;
        // Phase one, pass the definition of nfa and state to this
        this.imports();
        // Phase two 
    }

    async imports() {
        try {
            const stateData = await this.readFileAsync('./class/State.js');
            this.newFile += "\n" + stateData;

            const nfaData = await this.readFileAsync('./class/NFA.js');
            this.newFile += "\n" + nfaData;
            // Delete lines matching the pattern "require(anything)"
            this.newFile = this.newFile.replace(/(const|let|var) +.+ += *require\(.+?\)/g, '');

            // Delete lines matching the pattern "module.exports ="
            this.newFile = this.newFile.replace(/module\.exports\s*=\s*.*/g, '');
            console.log(this.newFile);
        } catch (error) {
            console.error('Error reading file:', error);
        }
    }

    // Helper function to read a file asynchronously and return a Promise
    readFileAsync(filePath) {
        return new Promise((resolve, reject) => {
            fs.readFile(filePath, 'utf8', (err, data) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(data);
            });
        });
    }
}

module.exports = GenScanner;
