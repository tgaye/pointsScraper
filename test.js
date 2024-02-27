// Define the API endpoint and the address parameter
const apiEndpoint = 'https://www.restaking.city/api/points/etherfi?address=0x0561e5b036DdcF2401c2B6b486f85451d75760A2';

// Function to query the API and print the results
async function queryAndPrintApiResults() {
    try {
        const response = await fetch(apiEndpoint);
        if (!response.ok) {
            throw new Error(`API call failed with status: ${response.status}`);
        }
        const data = await response.json();
        console.log('API Query Results:', data);
    } catch (error) {
        console.error('Error querying the API:', error);
    }
}

// Execute the function
queryAndPrintApiResults();
