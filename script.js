function analyzeFile() {
    const fileInput = document.getElementById('fileInput');
    const outputDiv = document.getElementById('output');

    const file = fileInput.files[0];

    if (file) {
        const reader = new FileReader();

        reader.onload = function (e) {
            const content = e.target.result;
            processData(content, outputDiv);
        };

        reader.readAsText(file);
    } else {
        outputDiv.innerHTML = 'Please select a valid CSV file.';
    }
}

function processData(csvContent, outputDiv) {
    // Clear previous results
    outputDiv.innerHTML = '';

    // Split the CSV content into rows
    const rows = csvContent.split('\n');

    // Dictionary to store employee data
    const employees = {};

    for (let i = 1; i < rows.length; i++) { // Skip the header row
        const columns = rows[i].split(',');

        // Assumption: The columns are 'EmployeeName', 'Date', 'StartTime', 'EndTime'
        const employeeName = columns[0].trim();
        const date = new Date(columns[1].trim());
        const startTime = new Date(`1970-01-01 ${columns[2].trim()}`);
        const endTime = new Date(`1970-01-01 ${columns[3].trim()}`);

        // Initialize timeBetweenShifts outside of the if statement
        let timeBetweenShifts = 0;

        // Check for less than 10 hours between shifts but greater than 1 hour
        if (employeeName in employees) {
            timeBetweenShifts = startTime - employees[employeeName]['lastEndTime'];

            if (timeBetweenShifts > 1 * 60 * 60 * 1000 && timeBetweenShifts < 10 * 60 * 60 * 1000) {
                displayResult(outputDiv, `${employeeName} has less than 10 hours between shifts on ${date.toDateString()}`);
            }
        }

        // Check for more than 14 hours in a single shift
        const shiftDuration = (endTime - startTime) / (60 * 60 * 1000);

        if (shiftDuration > 14) {
            displayResult(outputDiv, `${employeeName} has worked more than 14 hours on ${date.toDateString()}`);
        }

        // Display the results in the outputDiv
        displayResult(outputDiv, `${employeeName}: 
            Consecutive Days: ${employees[employeeName]?.consecutiveDays || 0},
            Less than 10 hours between shifts: ${timeBetweenShifts > 1 * 60 * 60 * 1000 && timeBetweenShifts < 10 * 60 * 60 * 1000 ? 'Yes' : 'No'},
            More than 14 hours in a single shift: ${shiftDuration > 14 ? 'Yes' : 'No'}
        `);

        // Update employee data
        employees[employeeName] = {
            'lastDate': date,
            'lastEndTime': endTime,
            'consecutiveDays': employees[employeeName]?.['consecutiveDays'] || 1
        };

        // Check for 7 consecutive days work
        if (employees[employeeName]['consecutiveDays'] === 7) {
            displayResult(outputDiv, `${employeeName} has worked for 7 consecutive days starting from ${date.toDateString()}`);
        }
    }
}

function displayResult(outputDiv, message) {
    const resultParagraph = document.createElement('p');
    resultParagraph.textContent = message;
    outputDiv.appendChild(resultParagraph);
}

