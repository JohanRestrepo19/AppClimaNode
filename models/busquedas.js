const fs = require('fs');

const axios = require('axios');

const {pausa} = require('../helpers/inquirer')

class Busquedas {

    historial = [];
    dbPath = './db/database.json';

    constructor() {
        this.leerDB();
    }

    get historialCapitalizado(){
        return this.historial.map( lugar => {
            
            let componentesCiudad = lugar.split(', ');
            
            componentesCiudad = componentesCiudad.map(palabra => palabra[0].toUpperCase() + palabra.substring(1));

            return componentesCiudad.join(', ');            
        });
    }

    get paramsMapBox(){
        return {
            'access_token': process.env.MAPBOX_KEY,
            'limit': 5,
            'language': 'es'
        } 
    }
    
    get paramsWeatherMap(){
        return {
            appid: process.env.OPENWEATHER_KEY,
            units: 'metric',
            lang: 'es'
        }
    }
    
    async ciudad(lugar = ''){
        
        try {
            //Peticion http

            const instance = axios.create({
                baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${lugar}.json`,
                params: this.paramsMapBox 
            });
            
            const resp = await instance.get();
            
            return resp.data.features.map(lugar => ({
                id: lugar.id,
                nombre: lugar.place_name,
                longitud: lugar.center[0],
                latitud: lugar.center[1]
            }));
            
        } catch (error) {
            return [];
        }
    }
    
    
    async climaLugar(lat, lon){
        try {
            
            //Intancia de axios.create()
            const instance = axios.create({
                baseURL: `https://api.openweathermap.org/data/2.5/weather`,
                params:{
                    lat,
                    lon,
                    ...this.paramsWeatherMap
                }
            });
            
            //Resp.data
            const resp = await instance.get();
            const {weather, main} = resp.data;

            return {
                desc: weather[0].description,
                min: main.temp_min,
                max: main.temp_max,
                temp: main.temp
            }
            
        } catch (error) {
            console.log(error);
        }
    }

    agregarHistorial(lugar = ''){
        //Revisa si en el historial ya se enecuentra el lugar que se la pasa como argumento
        if(this.historial.includes(lugar.toLocaleLowerCase())){
            return;
        }

        this.historial = this.historial.splice(0,5);

        this.historial.unshift(lugar.toLocaleLowerCase());

        //Grabar en DB
        this.guardarDB();
    }

    guardarDB(){
        const payload = {
            historial: this.historial
        }

        fs.writeFileSync(this.dbPath, JSON.stringify(payload));
    }

    leerDB(){
        // Debe existir...
        if(fs.existsSync(this.dbPath)){
            //const info .... readFileSync... path... {enconding: 'utf-8'}
            const info = fs.readFileSync(this.dbPath, {encoding: 'utf-8'});

            const data = JSON.parse(info);

            this.historial = data.historial;
        }
    }

}


module.exports = Busquedas;