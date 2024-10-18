// import swaggerUi from 'swagger-ui-express';
// import swaggerDocument from './api-spec.yaml';

import fs from 'fs';
import yaml from 'js-yaml';
import path from 'path';

let apiSpec;
const yamlFilePath = path.join(__dirname, 'api-spec.yaml');
try {
  // YAML 파일 읽기
  const fileContents = fs.readFileSync(yamlFilePath, 'utf8');
  // YAML 파일 파싱
  apiSpec = yaml.load(fileContents);
  console.log(apiSpec);
} catch (error) {
  console.error('Error loading YAML file: ', error);
}

export default apiSpec;
