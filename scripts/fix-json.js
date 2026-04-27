const fs = require('fs');
let data = fs.readFileSync('firestore.indexes.json', 'utf8');
data = data.replace('},\n  ],\n  "fieldOverrides"', '}\n  ],\n  "fieldOverrides"');
data = data.replace('},\r\n  ],\r\n  "fieldOverrides"', '}\r\n  ],\r\n  "fieldOverrides"');
fs.writeFileSync('firestore.indexes.json', data);
