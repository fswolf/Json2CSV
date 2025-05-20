class ExportCSV {
    constructor(properties = {}) {
        this.export_button;
        this.select_list;    
        this.path;
        this.file_name = 'table.csv';
        this.notyf;

        for (const key in properties) { 
            if(properties.hasOwnProperty(key)) this[key] = properties[key];
        }

        this.init();
    }

    jsonToCsv(jsonData) {
        const items = jsonData;
        const replacer = (key, value) => value === null ? '' : value; // Handle null values
        const header = Object.keys(items[0]);
        let csv = items.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','));
        csv.unshift(header.join(','));
        return csv.join('\r\n');
    }

    download(csvData, filename) {
        const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
        if (navigator.msSaveBlob) { // IE 10+
            navigator.msSaveBlob(blob, filename);
        } else {
            const link = document.createElement('a');
            if (link.download !== undefined) { // feature detection 
                const url = URL.createObjectURL(blob);
                link.setAttribute('href', url);
                link.setAttribute('download', filename);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        }
    }

    async get_file(data) {
        try {
            const response = await fetch('/purchases/export', {
                method: "POST",
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                this.notyf.error(response.statusText);
                return;
            }

            const responseData = await response.json();
            console.log(responseData);

            if (responseData.success) {
                const csvData = this.jsonToCsv(responseData.file); // assuming result.file contains the JSON data
                this.download(csvData, this.file_name);
            } else {
                if(responseData.relog) window.location = '/signin'; 
                if(responseData.error) this.notyf.error(responseData.error);
            }
        } catch (error) {
            this.notyf.error(error.message);
        }
    }

    listen() {
        let self = this;
        self.export_button.addEventListener('click', async function () {
            const req = self.select_list ? self.select_list.value : 0;
            let data = { uuid: req }; 
            await self.get_file(data);
        });
    }

    init() {
        this.listen();
    }   
}
