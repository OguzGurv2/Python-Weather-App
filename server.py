import requests
from flask import Flask, render_template, jsonify, request

API_KEY = '07a8f04e9dfc8c54484974e8b709275e'

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/search-city', methods=['GET'])
def search_city():
    city = request.args.get('city')
    if city:
        url = f'http://api.openweathermap.org/geo/1.0/direct?q={city}&limit=5&appid={API_KEY}'
        response = requests.get(url)
        if response.status_code == 200:
            return jsonify(response.json())
        else:
            return jsonify({'error': 'City not found'}), 404
    else:
        return jsonify({'error': 'No city provided'}), 400
    
@app.route('/city-data', methods=['GET'])
def get_city_data():
    lat = request.args.get('lat') 
    lon = request.args.get('lon') 
    url = f'http://api.openweathermap.org/geo/1.0/reverse?lat={lat}&lon={lon}&limit=5&appid={API_KEY}'
    response = requests.get(url)
    city_data = response.json()
    if city_data:
        return jsonify(city_data[0])  
    else:
        return jsonify({"error": "Lat and Lon are not found"}), 404
    
@app.route('/air-quality', methods=['GET'])
def air_quality_data():
    lat = request.args.get('lat') 
    lon = request.args.get('lon') 
    url = f'https://api.openweathermap.org/data/2.5/air_pollution?lat={lat}&lon={lon}&appid={API_KEY}'
    response = requests.get(url)
    air_quality_data = response.json()
    if air_quality_data:
        return jsonify(air_quality_data)  
    else:
        return jsonify({"error": "Lat and Lon are not found"}), 404

@app.route('/weather-data', methods=['GET'])
def get_weather_data():
    lat = request.args.get('lat')
    lon = request.args.get('lon')
    if lat and lon:
        url = f'https://api.openweathermap.org/data/3.0/onecall?lat={lat}&lon={lon}&appid={API_KEY}&exclude=hourly,minutely&units=metric'
        response = requests.get(url)
        return jsonify(response.json())
    else:
        return jsonify({"error": "Latitude and longitude are required"}), 400

if __name__ == '__main__':
    app.run(debug=True)
