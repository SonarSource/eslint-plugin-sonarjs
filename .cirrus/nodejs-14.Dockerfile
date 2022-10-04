FROM eu.gcr.io/release-engineering-ci-prod/base:j11-latest

USER root

ENV NODE_VERSION v14.20.0

RUN  wget -U "nodejs" -q -O nodejs.tar.gz https://nodejs.org/dist/${NODE_VERSION}/node-${NODE_VERSION}-linux-x64.tar.gz \
    && tar -xzf "nodejs.tar.gz" -C /usr/local --strip-components=1 --no-same-owner \
    && rm nodejs.tar.gz \
    && ln -s /usr/local/bin/node /usr/local/bin/nodejs

RUN curl "https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-4.7.0.2747.zip" -o /tmp/sonar-scanner.zip \
  && unzip -d /opt /tmp/sonar-scanner.zip \
  && mv /opt/sonar-scanner-4.7.0.2747 /opt/sonar-scanner \
  && rm /tmp/sonar-scanner.zip

USER sonarsource

ENV PATH "/opt/sonar-scanner/bin:${PATH}"
ENV SONARCLOUD_ANALYSIS true
