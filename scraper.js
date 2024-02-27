const express = require('express');
const axios = require('axios');

const app = express();
const port = 3000;

app.get('/getPoints', async (req, res) => {
    const { address } = req.query;

    if (!address) {
        return res.status(400).send('Address parameter is required');
    }

    // Define all your API endpoints with labels
    const apiEndpoints = [
        { label: 'etherfi', url: `https://www.restaking.city/api/points/etherfi?address=${address}` },
        { label: 'renzo', url: `https://www.restaking.city/api/points/renzo?address=${address}` },
        { label: 'kelpdao', url: `https://www.restaking.city/api/points/kelpdao?address=${address}` },
        { label: 'claystack', url: `https://www.restaking.city/api/points/claystack?address=${address}` },
        { label: 'origin', url: `https://www.restaking.city/api/points/origin?address=${address}` },
        { label: 'swell', url: `https://www.restaking.city/api/points/swell?address=${address}` }
    ];

    try {
        // Use axios to make all requests concurrently
        const apiRequests = apiEndpoints.map(endpoint => axios.get(endpoint.url).then(response => ({
            label: endpoint.label,
            data: {
                elPoints: response.data.elPoints,
                points: response.data.points
            }
        })).catch(error => {
            console.error(`Failed to fetch data from ${endpoint.url}`, error);
            // Return a placeholder in case of error, including the label
            return { label: endpoint.label, data: { error: 'Failed to fetch data', url: endpoint.url } };
        }));
        const responses = await Promise.all(apiRequests);

        // Extract only the elPoints and points from all responses, including the label
        const results = responses.map(response => ({
            platform: response.label,
            ...response.data
        }));

        // Send aggregated results
        res.send({ address, results });
    } catch (error) {
        console.error('Error fetching points:', error);
        res.status(500).send('Failed to fetch points from APIs');
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
