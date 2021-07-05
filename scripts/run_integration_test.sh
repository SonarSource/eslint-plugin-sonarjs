rm -rf node_modules
cd integration-test-project
npm install
export VERSION=$(grep version package.json | head -1  | awk -F: '{ print $2 }' | sed 's/[",]//g')
npm install --registry https://repox.jfrog.io/artifactory/api/npm/sonarsource-npm-public/ eslint-plugin-sonarjs@$VERSION-$BUILD_NUMBER
npm run eslint -- index.ts
