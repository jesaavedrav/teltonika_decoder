const buffer = Buffer.from('00000000000003f3080400000192c0bb8dd000d13dd4daffe3459309fc0100000000003911ef00f00050001505c80045020100b30002000300b4001d00140016001700ed02710f16b50000b6000042308f180000ce3908430ea944008c0900000d270f11fefb12013b13f8920600000f0000197fff1a7fff1b7fff1c7fff56ffff68ffff6affff6cffff0af100012111c70000000010004d3e4e0c00024d01480000000049000000004a000000004b0000000004000000000500000000080b000000003566cef44c00000000000000004d00000000000000004f00000000000000004700000000000000004e0000000000000000ee0000000000', 'hex');

function decode(buffer) {
    let offset = 0;

    // Leer encabezado
    const header = buffer.slice(offset, offset + 8);
    const packetLength = buffer.readUInt32BE(4); // longitud total del paquete
    console.log(`Packet length: ${packetLength}`);
    offset += 8;

    // Leer codec ID
    const codecId = buffer.readUInt8(offset);
    console.log(`Codec ID: ${codecId}`);
    offset += 1;

    // Número de registros
    const recordCount = buffer.readUInt8(offset);
    console.log(`Number of records: ${recordCount}`);
    offset += 1;

    let records = [];

    for (let i = 0; i < recordCount; i++) {
        let record = {};

        // Timestamp
        const timestamp = buffer.readBigInt64BE(offset);
        record.timestamp = new Date(Number(timestamp));
        offset += 8;

        // Prioridad
        record.priority = buffer.readUInt8(offset);
        offset += 1;

        // GPS data
        record.latitude = buffer.readInt32BE(offset) / 10000000;
        offset += 4;
        record.longitude = buffer.readInt32BE(offset) / 10000000;
        offset += 4;
        record.altitude = buffer.readInt16BE(offset);
        offset += 2;
        record.angle = buffer.readUInt16BE(offset);
        offset += 2;
        record.satellites = buffer.readUInt8(offset);
        offset += 1;
        record.speed = buffer.readUInt16BE(offset);
        offset += 2;

        // Decodificar IO (usando tu mapa de eventos)
        const { ioData, newOffset } = decodeIOData(buffer, offset);
        record.ioData = ioData;
        offset = newOffset;

        records.push(record);
    }

    // Leer CRC
    const crc = buffer.slice(offset, offset + 4).toString('hex');
    console.log(`CRC: ${crc}`);

    return records;
}

const ioMap = new Map();

// Digital Inputs and Outputs
ioMap.set(1, 'Digital Input 1');
ioMap.set(2, 'Digital Input 2');
ioMap.set(3, 'Digital Input 3');
ioMap.set(4, 'Digital Input 4');
ioMap.set(9, 'Digital Output 1');
ioMap.set(10, 'Digital Output 2');

// Analog Inputs
ioMap.set(21, 'Analog Input 1');
ioMap.set(22, 'Analog Input 2');

// GPS and movement-related data
ioMap.set(24, 'Speed (km/h)');
ioMap.set(66, 'External Voltage (V)');
ioMap.set(67, 'Battery Voltage (V)');
ioMap.set(68, 'Battery Current (A)');
ioMap.set(239, 'Ignition');
ioMap.set(240, 'Movement');
ioMap.set(200, 'Geofence Status');

// GSM and Signal Quality
ioMap.set(182, 'GNSS HDOP');
ioMap.set(205, 'GSM Cell ID');
ioMap.set(206, 'GSM Area Code');
ioMap.set(16, 'GSM Signal Quality');
ioMap.set(22, 'Battery Level (%)');

// Data Mode
ioMap.set(80, 'Data Mode');

// Accelerometer and Events
ioMap.set(181, 'Accelerometer X-axis');
ioMap.set(182, 'Accelerometer Y-axis');
ioMap.set(183, 'Accelerometer Z-axis');

// Temperature and Voltage
ioMap.set(67, 'Battery Voltage (V)');
ioMap.set(177, 'Temperature 1');
ioMap.set(178, 'Temperature 2');
ioMap.set(66, 'External Voltage');

// Engine-related data
ioMap.set(200, 'Fuel Level (%)');
ioMap.set(240, 'Engine Hours');
ioMap.set(181, 'Odometer');

// Custom Events and Parameters
ioMap.set(239, 'Ignition');
ioMap.set(240, 'Movement');

// Add more as needed from the official documentation

function decodeIOData(buffer, offset) {
    let ioData = [];

    // Leer eventos IO (esto es solo un ejemplo simple)
    const eventCount = buffer.readUInt8(offset);
    offset += 1;

    for (let i = 0; i < eventCount; i++) {
        const id = buffer.readUInt8(offset);
        const value = buffer.readUInt8(offset + 1); // o leer con más bytes según sea necesario
        const propertyName = ioMap.get(id) || `IO ${id}`;
        ioData.push({ id, value, propertyName });
        offset += 2;
    }

    return { ioData, newOffset: offset };
}

const decodedRecords = decode(buffer);
console.log('Decoded Records:', JSON.stringify(decodedRecords, null, 2));