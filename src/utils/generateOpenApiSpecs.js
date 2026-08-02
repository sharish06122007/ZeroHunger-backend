const fs = require('fs');
const path = require('path');
const YAML = require('yamljs');
const { swaggerSpec } = require('../config/swagger');

const jsonPath = path.join(__dirname, '../../openapi.json');
const yamlPath = path.join(__dirname, '../../openapi.yaml');

fs.writeFileSync(jsonPath, JSON.stringify(swaggerSpec, null, 2), 'utf8');
console.log(`✅ Generated OpenAPI JSON specification at ${jsonPath}`);

const yamlContent = YAML.stringify(swaggerSpec, 4);
fs.writeFileSync(yamlPath, yamlContent, 'utf8');
console.log(`✅ Generated OpenAPI YAML specification at ${yamlPath}`);
