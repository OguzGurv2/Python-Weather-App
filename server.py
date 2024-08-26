import requests
from flask import Flask, render_template

API_KEY = '07a8f04e9dfc8c54484974e8b709275e'
CITY = 'Eskişehir'

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/lat-lon-data', methods=['GET'])
def get_lat_lon(city):
    url = f'http://api.openweathermap.org/geo/1.0/direct?q={city}&limit=5&appid={API_KEY}'
    response = requests.get(url)
    return response.json()


@app.route('/weather-data', methods=['GET'])
def get_weather_data(lat, lon):
    url = f'https://api.openweathermap.org/data/3.0/onecall?lat={lat}&lon={lon}&appid={API_KEY}&units=metric'
    response = requests.get(url)
    return response.json()

if __name__ == '__main__':
    app.run(debug=True)

lat_lon_data = get_lat_lon(CITY)
LAT = lat_lon_data[0]['lat']
LON = lat_lon_data[0]['lon']
weather_data = get_weather_data(LAT, LON)
