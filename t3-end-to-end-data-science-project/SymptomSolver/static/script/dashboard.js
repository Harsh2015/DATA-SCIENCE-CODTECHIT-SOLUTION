document.getElementById('logo').addEventListener('click', function () {
    const menu = document.getElementById('dropdown-menu');
    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
});

// Close dropdown when clicking outside
document.addEventListener('click', function (event) {
    const dropdown = document.getElementById('dropdown-menu');
    const logo = document.getElementById('logo');
    if (!dropdown.contains(event.target) && event.target !== logo) {
        dropdown.style.display = 'none';
    }
});

// Handle form submission for symptom prediction
document.getElementById('symptom-form').addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent form from reloading the page

    // Collect form data and ensure default value is 'No Symptoms' if empty
    const symptoms = {
        symptom1: document.getElementById('symptom1').value || 'No Symptoms',
        symptom2: document.getElementById('symptom2').value || 'No Symptoms',
        symptom3: document.getElementById('symptom3').value || 'No Symptoms',
        symptom4: document.getElementById('symptom4').value || 'No Symptoms',
        symptom5: document.getElementById('symptom5').value || 'No Symptoms',
        symptom6: document.getElementById('symptom6').value || 'No Symptoms'
    };

    // Check if all symptoms are selected
    for (let i = 1; i <= 6; i++) {
        if (!document.getElementById(`symptom${i}`).value) {
            alert(`Please select symptom ${i}.`);
            return;  // Prevent form submission if any symptom is empty
        }
    }

    // Show loading message while fetching the prediction
    document.getElementById('prediction-result').innerHTML = '<p>Loading...</p>';

    // Send a POST request with the symptom data to the backend
    fetch('/predict', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(symptoms)
    })
    .then(response => response.json())
    .then(data => {
        // Check if disease prediction was successful
        if (data.disease) {
            // Display the disease and suggested medicines
            const medicines = data.medicines && data.medicines.length > 0
                ? data.medicines.map(medicine => `<li>${medicine}</li>`).join('')
                : '<li>No medicines suggested</li>';

            document.getElementById('prediction-result').innerHTML = `
            <h3><span style="color: black;">You Might Be Suffering From </span><span style="color: red; font-weight: bold;">${data.disease}</span></h3>
               
            `;
        } else {
            // Error if no disease prediction could be made
            document.getElementById('prediction-result').innerHTML = `
                <p>Error: Unable to predict disease. Please check the symptoms entered.</p>
            `;
        }
    })
    .catch(error => {
        // Handle any errors that occur during the fetch request
        document.getElementById('prediction-result').innerHTML = `
            <p>Error: Could not reach the server. Please try again later.</p>
        `;
        console.error("Error in the fetch request:", error);
    });
});




/////// Displays medicine part //////////
document.getElementById("show-antibiotics-btn").addEventListener("click", function() {
    const selectedDisease = document.getElementById("disease-select").value;
    const antibioticsResult = document.getElementById("antibiotics-result");
    const antibioticsTable = document.getElementById("antibiotics-table");

    // Clear previous rows in the table
    antibioticsTable.innerHTML = `
        <tr>
            <th>Attribute</th>
            <th>Details</th>
        </tr>
    `;

    if (selectedDisease) {
        antibioticsResult.style.display = "block"; // Show the antibiotics result section
        disclaimer.style.display = "block";  //visible disclaimer
        // Fetch antibiotic data from the server
        fetch('/get_antibiotics', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 'Disease': selectedDisease })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Populate the table with antibiotic data
                const antibioticData = data.data;
                for (const [attribute, value] of Object.entries(antibioticData)) {
                    const row = antibioticsTable.insertRow();
                    const cell1 = row.insertCell(0);
                    const cell2 = row.insertCell(1);
                    cell1.textContent = attribute;
                    cell2.textContent = value;
                }
            } else {
                // Handle the case where the disease is not found
                antibioticsTable.innerHTML = `
                    <tr>
                        <td colspan="2">${data.error}</td>
                    </tr>
                `;
            }
        })
        .catch(error => {
            antibioticsTable.innerHTML = `
                <tr>
                    <td colspan="2">An error occurred while fetching data.</td>
                </tr>
            `;
        });
    } else {
        antibioticsResult.style.display = "none";
        alert("Please select a disease to see antibiotics information.");
    }
});
