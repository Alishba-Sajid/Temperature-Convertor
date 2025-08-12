const CORS_PROXY = "https://corsproxy.io/?";
const SERVICE_URL = "https://www.w3schools.com/xml/tempconvert.asmx";

async function soapRequest(action, body) {
    const xmlEnvelope = `
        <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                       xmlns:xsd="http://www.w3.org/2001/XMLSchema"
                       xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
            <soap:Body>
                ${body}
            </soap:Body>
        </soap:Envelope>
    `;

    const response = await fetch(CORS_PROXY + encodeURIComponent(SERVICE_URL), {
        method: "POST",
        headers: {
            "Content-Type": "text/xml; charset=utf-8",
            "SOAPAction": `https://www.w3schools.com/xml/${action}`
        },
        body: xmlEnvelope
    });

    const text = await response.text();
    return new window.DOMParser().parseFromString(text, "text/xml");
}

async function convertTemperature() {
    const tempValue = document.getElementById("tempInput").value.trim();
    const conversionType = document.getElementById("conversionType").value;
    const resultDiv = document.getElementById("result");

    if (!tempValue) {
        resultDiv.innerHTML = `<p style="color:red;">⚠ Please enter a temperature value.</p>`;
        return;
    }

    // Show loading
    resultDiv.innerHTML = `
        <p style="color:#0078ff;"><i>Converting...</i></p>
    `;

    try {
        let soapBody = "";
        let action = "";

        if (conversionType === "CtoF") {
            action = "CelsiusToFahrenheit";
            soapBody = `<CelsiusToFahrenheit xmlns="https://www.w3schools.com/xml/">
                            <Celsius>${tempValue}</Celsius>
                        </CelsiusToFahrenheit>`;
        } else {
            action = "FahrenheitToCelsius";
            soapBody = `<FahrenheitToCelsius xmlns="https://www.w3schools.com/xml/">
                            <Fahrenheit>${tempValue}</Fahrenheit>
                        </FahrenheitToCelsius>`;
        }

        const xmlDoc = await soapRequest(action, soapBody);

        let resultValue = "";
        if (conversionType === "CtoF") {
            resultValue = xmlDoc.getElementsByTagName("CelsiusToFahrenheitResult")[0]?.textContent;
            resultDiv.innerHTML = `<p>${tempValue}°C = <strong>${resultValue}°F</strong></p>`;
        } else {
            resultValue = xmlDoc.getElementsByTagName("FahrenheitToCelsiusResult")[0]?.textContent;
            resultDiv.innerHTML = `<p>${tempValue}°F = <strong>${resultValue}°C</strong></p>`;
        }
    } catch (error) {
        console.error(error);
        resultDiv.innerHTML = `<p style="color:red;">❌ Conversion failed. Please try again.</p>`;
    }
}
