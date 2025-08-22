import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  input: 'http://localhost:3001/documentation/json',
  output: 'src/api/generated',
});