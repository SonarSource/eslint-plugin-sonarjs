FROM eu.gcr.io/release-engineering-ci-prod/base:j11-latest

USER root

ENV NODE_VERSION v14.15.4

RUN  wget -U "nodejs" -q -O nodejs.tar.xz https://nodejs.org/dist/${NODE_VERSION}/node-${NODE_VERSION}-linux-x64.tar.xz \
    && tar -xJf "nodejs.tar.xz" -C /usr/local --strip-components=1 --no-same-owner \
    && rm nodejs.tar.xz \
    && ln -s /usr/local/bin/node /usr/local/bin/nodejs

RUN curl "https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-4.3.0.2102.zip" -o /tmp/sonar-scanner.zip \
  && unzip -d /opt /tmp/sonar-scanner.zip \
  && mv /opt/sonar-scanner-4.3.0.2102 /opt/sonar-scanner \
  && rm /tmp/sonar-scanner.zip

USER sonarsource

ENV PATH "/opt/sonar-scanner/bin:${PATH}"
