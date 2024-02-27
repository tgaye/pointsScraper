const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const port = 3000;

app.get('/getPoints', async (req, res) => {
    const { address } = req.query;

    if (!address) {
        return res.status(400).send('Address parameter is required');
    }

    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto('https://www.restaking.city/dashboard', { waitUntil: 'networkidle2' });

        await page.type('#addr', address);

        // Use page.evaluate to find and click the search button based on its SVG
        await page.evaluate(() => {
            const svgNamespace = "http://www.w3.org/2000/svg";
            const width = "15";
            const height = "15";
            const svgs = Array.from(document.querySelectorAll('svg[xmlns="' + svgNamespace + '"]'));
            const targetSvg = svgs.find(svg => svg.getAttribute('width') === width && svg.getAttribute('height') === height);
            if (targetSvg) {
                // Click the parent button of the SVG
                targetSvg.closest('button').click();
            }
        });

        // Conservative approach: wait for a selector that indicates data is loaded
        // If .flex.flex-col does not directly indicate data loading, find a more direct indicator if possible
        await page.waitForSelector('.flex.flex-col', { timeout: 30000 }); // Increased timeout

        // Additionally, wait for network to be idle to ensure all data has been loaded
        await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 60000 });

        // Extract the numeric values from all matching elements and the total EL points
        const { points, totalELPoints } = await page.evaluate(() => {
            const elements = Array.from(document.querySelectorAll('.flex.flex-col'));
            const points = elements.map(element => {
                const numberElement = element.querySelector('div:first-child');
                return numberElement ? numberElement.innerText.trim() : null;
            }).filter(text => text !== null && !isNaN(text)).map(Number);

            // Correctly identifying and extracting the Total EL Points
            const totalELPointsText = document.body.innerText.match(/Total EL Points:\s*([\d,\.]+)/);
            const totalELPoints = totalELPointsText ? totalELPointsText[1] : 'Data not found';

            return { points, totalELPoints };
        });

        await browser.close();

        res.send({ address, points, totalELPoints });
    } catch (error) {
        console.error('Error fetching points:', error);
        res.status(500).send('Failed to fetch points');
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
