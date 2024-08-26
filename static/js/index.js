document.addEventListener("DOMContentLoaded", () => {
    const units = document.querySelectorAll(".unit");
    const unitSelection = document.querySelector("#unit-selection");
    
    // Function to update units and data attribute
    const updateUnits = (unitType, conversionFunc) => {
        units.forEach((unit) => {
            unit.setAttribute("data-after", unitType);
            unit.textContent = conversionFunc(parseInt(unit.textContent));
        });
    };

    // Initial setup for Celsius
    units.forEach((unit) => {
        unit.setAttribute("data-after", "°C")
    });

    // Handle button clicks
    unitSelection.querySelectorAll("button").forEach((button) => {
        button.addEventListener("click", () => {
            if (!button.classList.contains("active")) {
                const isCelsius = button.id === "celcius";
                
                // Toggle active class
                button.classList.add("active");
                (isCelsius ? document.querySelector("#fahreneit") : document.querySelector("#celcius")).classList.remove("active");

                // Update units based on selected button
                updateUnits(isCelsius ? "°C" : "°F", isCelsius 
                    ? (temp) => (temp - 32) * 5 / 9 
                    : (temp) => temp * 9 / 5 + 32
                );
            }
        });
    });

    class DayWeather {
        constructor() {
            this.sidebarContent = document.querySelector(".sidebar-content");
            this.temp = this.sidebarContent.document.querySelector("#temp");
            this.day = this.sidebarContent.document.querySelector("#day");
            this.generalInfo = this.sidebarContent.document.querySelector("#general-info");
            this.rainInfo = this.sidebarContent.document.querySelector("#rain-info");
            this.location = this.sidebarContent.document.querySelector("#location");

            this.mainContent = document.querySelector(".highlights-container");
            this.uvIndex = this.mainContent.document.querySelector("progress");
            this.windSpeed = this.mainContent.document.querySelector("#wind-speed");
            this.windDirection = this.mainContent.document.querySelector("#wind-direction");
            this.sunrise = this.mainContent.document.querySelector("#sunrise");
            this.sunset = this.mainContent.document.querySelector("#sunset");
            this.humidityPercentage = this.mainContent.document.querySelector("#humidity-percentage");
            this.humidityInfo = this.mainContent.document.querySelector("#humidity-info");
            this.visibilityPercentage = this.mainContent.document.querySelector("#visibility-percentage");
            this.visibilityInfo = this.mainContent.document.querySelector("#visibility-info");
            this.airQualityPercentage = this.mainContent.document.querySelector("#air-quality-percentage");
            this.airQualityInfo = this.mainContent.document.querySelector("#air-quality-info");
        }


    }
    
    class WeekWeather {
        constructor () {
            this.template = document.querySelector("#day-template");
        }
    }
    
    const dayWeather = new DayWeather();
    const weekWeather = new WeekWeather();
});
