require('dotenv').config();

const {inquirerMenu,
    pausa,    
    leerInput,
    listarLugares
} = require('./helpers/inquirer');

const Busquedas = require('./models/busquedas');


const main = async() => {

    let opt;
    const busquedas = new Busquedas();

    do {
        opt = await inquirerMenu();

        switch (opt) {
            case 1:
                // Mostrar mensajes
                const termino = await leerInput("Ciudad: ");
                
                // Buscar los lugares
                lugares = await busquedas.ciudad(termino);

                // Seleccionar el lugar
                const idSeleccionado = await listarLugares(lugares);

                if(idSeleccionado === '0') continue;

                const lugarSel = lugares.find(l => l.id === idSeleccionado);

                // Guardar en DB
                busquedas.agregarHistorial(lugarSel.nombre);

                // Clima
                const clima = await busquedas.climaLugar(lugarSel.latitud, lugarSel.longitud);


                // Mostrar resultados
                console.clear();
                console.log('\nInformacion de la cidad\n'.green);
                console.log('Ciudad: ', lugarSel.nombre.green );
                console.log('Latitud: ', lugarSel.latitud );
                console.log('Longitud: ', lugarSel.longitud);
                console.log('Temperatura: ', clima.temp);
                console.log('Minima: ', clima.min);
                console.log('Maxima: ', clima.max);
                console.log('Como está el clima: ', clima.desc.green);

                break;

            case 2:
                busquedas.historialCapitalizado.forEach((lugar, id) => {
                    const idx = `${id + 1}.`.green;
                    console.log(`${idx} ${lugar}`);
                })                
                break;

            default:
                break;
        }

        await pausa();

    } while (opt !== 0);
}

main();