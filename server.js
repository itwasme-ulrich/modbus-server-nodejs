const http = require('http');
const SerialPort = require('serialport').SerialPort;
const ModbusMaster = require('modbus-rtu');
const fs = require('fs');

const page_index = fs.readFileSync('index.html', 'utf8');

var path = 'COM6';
var baudRate = 9600;

//create serail port with params. Refer to node-serialport for documentation
const serialPort = new SerialPort({
    path: path,
    baudRate: baudRate,
});

var value = 0;
var slaveId = 1;

//create ModbusMaster instance and pass the serial port object
const master = new ModbusMaster.ModbusMaster(serialPort);

//Read from slave with address <slaveId>, 1 holding registers, starting from 0.

setInterval(() => {
    master.readHoldingRegisters(slaveId, 0, 1).then(
        (resp) => {
            value = resp[0];
        },
        (err) => {
            console.log('ERROR!');
            console.error(err);
            //or will be rejected with error
        },
    );
}, 1000);

//Create http server
http.createServer(function (req, res) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    SerialPort.list().then(function (ports) {
        if (req.url === '/') {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.write(page_index);
            // } else if (req.url == '/style.css') {
            //     res.writeHead(200, { 'Content-Type': 'text/css' });
            //     res.write(page_css);
        } else if (req.url == '/path.json') {
            res.writeHead(200, { 'Content-Type': 'application/json' });

            res.write(`{
                    "pathInfor":
                        ${JSON.stringify(Object.assign({}, ports))}
            
                     }`);
        } else if (req.url == '/slave.json') {
            res.writeHead(200, { 'Content-Type': 'application/json' });

            res.write(`{
                        "current":
                            {
                            "path":"${path}",
                            "slaveId":"${slaveId}",
                            "baudRate":"${baudRate}"
                            }
                        }
                    `);
        } else if (req.url == '/data.json') {
            res.writeHead(200, { 'Content-Type': 'application/json' });

            res.write(`{
                        "sensor":
                            {
                            "value":"${value}"
                            }
            
                     }`);
        } else {
            res.statusCode = 404;
            res.write('Not Found');
        }
        res.end();
    });
}).listen(8080, () => {
    console.log('Server is running at port 8080...');
});
