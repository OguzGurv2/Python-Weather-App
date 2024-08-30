document.addEventListener("DOMContentLoaded", () => {
    let units;
    let highlightsInstance;

    const getUserLocation = () => {
        return new Promise((resolve, reject) => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    position => {
                        resolve({
                            lat: position.coords.latitude,
                            lon: position.coords.longitude
                        })
                    },
                    (error) => {
                        reject(error);
                    }
                );
            } else {
                reject(new Error("Geolocation is not supported by this browser."))
            }
        })
    }

    async function startWebpage() {
        try {
            const userLocation = await getUserLocation();
            const { lat, lon } = userLocation;
    
            const weatherResponse = await fetch(`weather-data?lat=${lat}&lon=${lon}`);
            const weatherData = await weatherResponse.json();

            const locationResponse = await fetch(`city-data?lat=${lat}&lon=${lon}`);
            const locationData = await locationResponse.json();

            const airQualityResponse = await fetch(`air-quality?lat=${lat}&lon=${lon}`);
            const airQualityData = await airQualityResponse.json();

            highlightsInstance = new Highlights(weatherData, locationData, airQualityData);

        } catch (error) {
            console.error('Error fetching data:', error);
            alert('Unable to retrieve your location.');
        }
    }

    startWebpage().then(()=>{
        units = document.querySelectorAll(".unit");
        units.forEach((unit) => {
            unit.setAttribute("data-after", "°C")
        });
    });

    class Highlights {
        constructor(weatherData, locationData, airQualityData) {
            this.weatherData = weatherData;
            this.locationData = locationData;
            this.airQualityData = airQualityData;

            this.sidebarContent = document.querySelector(".sidebar-content");
            this.temp = this.sidebarContent.querySelector("#temp");
            this.day = this.sidebarContent.querySelector("#day");
            this.generalInfo = this.sidebarContent.querySelector("#general-info");
            this.rainInfo = this.sidebarContent.querySelector("#rain-info");
            this.locationContainer = this.sidebarContent.querySelector("#location");
            this.location = this.locationContainer.querySelector("h2");
            this.imgContainer = this.sidebarContent.querySelector(".img-container");
            this.sidebarIcon = this.sidebarContent.querySelector("img");

            this.mainContent = document.querySelector(".highlights-container");
            this.uvIndex = this.mainContent.querySelector("progress");
            this.uvIndexInfo = this.mainContent.querySelector(".uv-index-container").querySelector("p");
            this.windSpeed = this.mainContent.querySelector("#wind-speed");
            this.windDirection = this.mainContent.querySelector("#wind-direction");
            this.sunrise = this.mainContent.querySelector("#sunrise");
            this.sunset = this.mainContent.querySelector("#sunset");
            this.humidityPercentage = this.mainContent.querySelector("#humidity-percentage");
            this.humidityInfo = this.mainContent.querySelector("#humidity-info");
            this.visibilityDistance = this.mainContent.querySelector("#visibility-distance");
            this.visibilityInfo = this.mainContent.querySelector("#visibility-info");
            this.airQualityUnit = this.mainContent.querySelector("#air-quality-unit");
            this.airQualityInfo = this.mainContent.querySelector("#air-quality-info");
            
            this.dayAndTime = this.getDayAndTime();
            this.imgUrl = findImgUrl(this.weatherData.current.weather[0].description, 
                this.weatherData.current.sunrise, this.weatherData.current.sunset);

            this.updateData();
        }

        updateData() {
            this.appendSidebarData();
            this.appendMainData();
            this.createDailyInfo();
        }
        
        appendSidebarData() {
            this.temp.textContent = Math.floor(this.weatherData.current.temp);
            this.day.textContent = `${this.dayAndTime.day}, `;
            this.day.setAttribute("data-after", this.dayAndTime.formattedTime);
            this.generalInfo.textContent = this.capitalizeFirstLetter(this.weatherData.current.weather[0].description);
            this.location.textContent = this.locationData.name;
            
            this.rainInfo.setAttribute(
                "data-after", 
                this.weatherData.current.rain ? `${this.weatherData.current.rain['1h'] * 100}%` : `0%`
                );
                
            this.sidebarIcon.src = `${this.imgContainer.getAttribute('data-icon-url')}${this.imgUrl}.png`;
            this.locationContainer.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.1)), url("/static/assets/stock-photos/${this.imgUrl}.jpeg")`;
        }
            
        appendMainData() {
            this.uvIndex.value = Math.floor(this.weatherData.current.uvi);
            this.uvIndexInfo.textContent = this.getUvInfo(this.weatherData.current.uvi);
            this.windSpeed.textContent = `${this.weatherData.current.wind_speed}km/h`;
            this.windDirection.textContent = this.getWindDirection(this.weatherData.current.wind_deg);
            this.sunrise.textContent = `${this.getTime(this.weatherData.current.sunrise)}`;
            this.sunset.textContent = `${this.getTime(this.weatherData.current.sunset)}`;
            this.humidityPercentage.textContent = `${this.weatherData.current.humidity}%`;
            this.humidityInfo.textContent = this.getHumidityInfo(this.weatherData.current.humidity);
            this.visibilityDistance.textContent = `${this.weatherData.current.visibility / 1000}km`;
            this.visibilityInfo.textContent = `${this.getVisibilityInfo(this.weatherData.current.visibility)}`;
            this.airQualityUnit.textContent = this.airQualityData.list[0].main.aqi;
            this.airQualityInfo.textContent = `${this.getAirQualityInfo(this.airQualityData.list[0].main.aqi)}`;
        }

        createDailyInfo() {
            debugger;
            const weeklyWeatherContainer = document.querySelector("#weekly-weather");
            weeklyWeatherContainer.innerHTML = '';  // Remove all child elements
        
            // Create new DailyInfo instances
            for (let i = 0; i < 7; i++) {
                new DailyInfo(this.weatherData.daily[i]);
            }
        }
            
        getDayAndTime() {  
            let date = new Date(Date.now());  // Convert timestamp to Date object
            // Get day of the week
            let daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
            let day = daysOfWeek[date.getDay()];
            
            // Get hours and minutes
            let hours = date.getHours();
            let minutes = date.getMinutes();
            
            // Format hours and minutes (e.g., 12:50)
            let formattedTime = `${hours}:${minutes < 10 ? '0' + minutes : minutes}`;
            return {day, formattedTime};            
        }

        getTime(timestamp) {
            let date = new Date(timestamp * 1000);  // Convert timestamp to Date object
            
            // Get hours and minutes
            let hours = date.getHours();
            let minutes = date.getMinutes();
            
            // Format hours and minutes (e.g., 12:50)
            let formattedTime = `${hours}:${minutes < 10 ? '0' + minutes : minutes}`;
            return formattedTime;  
        }

        capitalizeFirstLetter (str) {
            return str.split(' ')                  // Split the string into an array of words
                .map(word => 
                    word.charAt(0).toUpperCase() + // Capitalize the first letter of each word
                    word.slice(1).toLowerCase()    // Convert the rest of the word to lowercase
                )
                .join(' ');                        // Join the array back into a single string
        }

        getUvInfo(index) {
            if (index <= 3) {
                return "Low";
            } else if (index <= 6) {
                return "Moderate";
            } else if (index <= 9) {
                return "High";
            } else if (index <= 12) {
                return "Very High";
            } else {
                return "Extreme";
            }
        }

        getWindDirection(degree) {
            if (degree >= 348.75 || degree < 11.25) {
                return 'N';    // North
            } else if (degree >= 11.25 && degree < 33.75) {
                return 'NNE';  // North-Northeast
            } else if (degree >= 33.75 && degree < 56.25) {
                return 'NE';   // Northeast
            } else if (degree >= 56.25 && degree < 78.75) {
                return 'ENE';  // East-Northeast
            } else if (degree >= 78.75 && degree < 101.25) {
                return 'E';    // East
            } else if (degree >= 101.25 && degree < 123.75) {
                return 'ESE';  // East-Southeast
            } else if (degree >= 123.75 && degree < 146.25) {
                return 'SE';   // Southeast
            } else if (degree >= 146.25 && degree < 168.75) {
                return 'SSE';  // South-Southeast
            } else if (degree >= 168.75 && degree < 191.25) {
                return 'S';    // South
            } else if (degree >= 191.25 && degree < 213.75) {
                return 'SSW';  // South-Southwest
            } else if (degree >= 213.75 && degree < 236.25) {
                return 'SW';   // Southwest
            } else if (degree >= 236.25 && degree < 258.75) {
                return 'WSW';  // West-Southwest
            } else if (degree >= 258.75 && degree < 281.25) {
                return 'W';    // West
            } else if (degree >= 281.25 && degree < 303.75) {
                return 'WNW';  // West-Northwest
            } else if (degree >= 303.75 && degree < 326.25) {
                return 'NW';   // Northwest
            } else if (degree >= 326.25 && degree < 348.75) {
                return 'NNW';  // North-Northwest
            }
        }
        
        getHumidityInfo(percentage) {
            if (percentage <= 30) {
                return "Low";
            } else if (percentage <= 60) {
                return "Moderate";
            } else if (percentage <= 80) {
                return "High";
            } else {
                return "Very High";
            }
        }
        
        getVisibilityInfo(meters) {
            if (meters <= 1000) {
                return "Very Low";
            } else if (meters <= 5000) {
                return "Low";
            } else if (meters <= 10000) {
                return "Moderate";
            } else {
                return "High";
            }
        }  
        
        getAirQualityInfo(aqi) {
            switch (aqi) {
                case 1:
                    return "Good";
                case 2:
                    return "Fair";
                case 3:
                    return "Moderate";
                case 4:
                    return "Poor";
                case 5:
                    return "Very Poor";
                default:
                    return "Data not available.";
            }
        }
    }
        
    class DailyInfo {
        constructor (dayData) {
            this.dayData = dayData;
            this.template = document.querySelector("#day-template");

            const clone = this.template.content.cloneNode(true);
            this.node = clone.querySelector("#day-container");
            document.querySelector("#weekly-weather").append(this.node);

            this.header = this.node.querySelector("h3");
            this.maxTemp = this.node.querySelector("#max-temp");
            this.minTemp = this.node.querySelector("#min-temp");
            this.imgContainer = this.node.querySelector(".img-container");
            this.img = this.node.querySelector("img");

            this.day = this.getDay(this.dayData.dt);
            this.imgUrl = findImgUrl(this.dayData.weather[0].description);

            this.appendData();
        }

        appendData() {
            this.header.textContent = this.day;
            this.maxTemp.textContent = Math.floor(this.dayData.temp.max);
            this.minTemp.textContent = Math.floor(this.dayData.temp.min);
            this.img.src = `${this.imgContainer.getAttribute('data-icon-url')}${this.imgUrl}.png`;

        }
             
        getDay(timestamp) {  
            let date = new Date(timestamp * 1000);
            let today = new Date(); // Get the current date
            
            // Get day of the week
            let daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
            
            // Check if the date is today
            let isToday = date.getDate() === today.getDate() &&
                          date.getMonth() === today.getMonth() &&
                          date.getFullYear() === today.getFullYear();
            
            let day = isToday ? "Today" : daysOfWeek[date.getDay()];  // Use "Today" if it's today
            
            return day;
        }    
    }

    function findImgUrl(description, sunrise, sunset) {
        let isNight = false

        if (sunrise && sunset) {
            let date = Date.now();
            isNight = sunrise * 1000 < date < sunset * 1000 ? false : true;
        } 

        const clearSky = ["clear sky"];
        const partlyCloudy = ["few clouds", "scattered clouds"];
        const fewClouds = ["broken clouds"];
        const cloudy = ["overcast clouds"];
        const lightRain = ["light rain", "moderate rain"];
        const heavyRain = [
            "heavy intensity rain", "very heavy rain", "extreme rain",
            "light intensity shower rain", "shower rain", "heavy intensity shower rain", 
            "ragged shower rain"
        ];
        const snowRain = [
            "freezing rain", "sleet", "light shower sleet", 
            "shower sleet", "light rain and snow", "rain and snow"
        ];
        const drizzle = [
            "drizzle", "drizzle rain", "heavy intensity drizzle", 
            "light intensity drizzle", "shower rain and drizzle", 
            "heavy intensity drizzle rain", "shower drizzle"
        ];
        const thunderstormRain = [
            "thunderstorm with light rain", "thunderstorm with rain", 
            "thunderstorm with heavy rain", "thunderstorm with light drizzle", 
            "thunderstorm with drizzle", "thunderstorm with heavy drizzle"
        ];
        const thunderstorm = ["thunderstorm", "heavy thunderstorm", "ragged thunderstorm"];
        const snow = ["light snow", "snow", "light shower snow", "shower snow", "heavy shower snow"];
        const heavySnow = ["heavy snow"];
    
        if (clearSky.includes(description)) {
            return isNight ? "clear-night" : "sunny";
        } else if (partlyCloudy.includes(description)) {
            return isNight ? "partly-cloudy-night" : "partly-cloudy";
        } else if (fewClouds.includes(description)) {
            return "few-clouds";
        } else if (cloudy.includes(description)) {
            return "cloudy";
        } else if (lightRain.includes(description)) {
            return isNight ? "light-rain" : "sunny-light-rain";
        } else if (heavyRain.includes(description)) {
            return "heavy-rain";
        } else if (snowRain.includes(description)) {
            return "snow-rain";
        } else if (drizzle.includes(description)) {
            return "sunny-light-rain";
        } else if (thunderstormRain.includes(description)) {
            return "thunderstorm-rain";
        } else if (thunderstorm.includes(description)) {
            return "thunderstorm";
        } else if (snow.includes(description)) {
            return "snow";
        } else if (heavySnow.includes(description)) {
            return "heavy-snow";
        } else {
            return "Data not available.";
        }
    }
    
    const unitSelection = document.querySelector("#unit-selection");
    
    // Function to update units and data attribute
    const updateUnits = (unitType, conversionFunc) => {
        units.forEach((unit) => {
            unit.setAttribute("data-after", unitType);
            unit.textContent = conversionFunc(parseInt(unit.textContent));
        });
    };

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
                    ? (temp) => Math.round((temp - 32) * 5 / 9)
                    : (temp) => Math.round(temp * 9 / 5 + 32)
                );
            }
        });
    });

    const search = document.querySelector("#location-input");
    const suggestions = document.querySelector("#location-suggestions");

    // Debounce function to limit the number of API calls
    function debounce(func, delay) {
        let debounceTimer;
        return function(...args) {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => func.apply(this, args), delay);
        };
    }

    // Function to fetch city data from the Flask backend
    async function fetchCityData(city) {
        try {
            const response = await fetch(`/search-city?city=${city}`);
            if (!response.ok) {
                throw new Error('City not found');
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error(error);
            return [];
        }
    }

    // Function to handle input change
    async function handleInputChange() {
        const city = search.value.trim();
        if (city.length > 0) {
            const cityData = await fetchCityData(city);
            displaySuggestions(cityData);
        } else {
            suggestions.innerHTML = ''; // Clear suggestions if input is empty
            suggestions.style.display = "none";
        }
    }

    // Function to display city suggestions
    function displaySuggestions(data) {
        suggestions.innerHTML = ''; // Clear previous suggestions
        suggestions.style.display = "block";
        data.forEach(city => {
            const suggestionItem = document.createElement('div');
            suggestionItem.classList.add('suggestion-item');
            const suggestionP = document.createElement('p');
            suggestionP.textContent = `${city.name}, ${city.country}`;

            suggestionP.onclick = () => {
                search.value = `${city.name}, ${city.country}`;
                suggestions.innerHTML = ''; // Clear suggestions after selecting a city
                suggestions.style.display = "none";
                updateWeatherData(city).then(()=>{
                    units = document.querySelectorAll(".unit");
                    units.forEach((unit) => {
                        unit.setAttribute("data-after", "°C")
                    });
                    search.value = '';
                });
            };
            suggestionItem.appendChild(suggestionP);
            suggestions.appendChild(suggestionItem);
        });
    }

    // Function to update weather data
    async function updateWeatherData(cityData) {
        try {
            const weatherResponse = await fetch(`/weather-data?lat=${cityData.lat}&lon=${cityData.lon}`);
            const weatherData = await weatherResponse.json();

            const locationResponse = await fetch(`/city-data?lat=${cityData.lat}&lon=${cityData.lon}`);
            const locationData = await locationResponse.json();

            const airQualityResponse = await fetch(`/air-quality?lat=${cityData.lat}&lon=${cityData.lon}`);
            const airQualityData = await airQualityResponse.json();

            if (highlightsInstance) {
                highlightsInstance.weatherData = weatherData;
                highlightsInstance.locationData = locationData;
                highlightsInstance.airQualityData = airQualityData;
                highlightsInstance.updateData(); // Update the Highlights instance with new data
            }

        } catch (error) {
            console.error('Error fetching new data:', error);
            alert('Unable to retrieve new data.');
        }
    }

    // Add event listener to the input field
    search.addEventListener('input', debounce(handleInputChange, 300));
    search.addEventListener('keydown', (event) => {
        if (event.key == "Enter") {
            event.preventDefault(); // Prevent form submission or other default actions
            const city = search.value.trim();
            if (city.length > 0) {
                suggestions.innerHTML = ''; // Clear suggestions if input is empty
                suggestions.style.display = "none";
                updateWeatherData(fetchCityData(city)).then(()=>{
                    units = document.querySelectorAll(".unit");
                    units.forEach((unit) => {
                        unit.setAttribute("data-after", "°C")
                    });
                    search.value = '';
                }); // Fetch new data and update
            }
        }
    });
});