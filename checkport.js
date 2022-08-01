const serialPort = require('serialport').SerialPort;

serialPort.list().then(function (ports) {
    ports.forEach(function (port) {
        console.log('Port: ', port);
    });
});
